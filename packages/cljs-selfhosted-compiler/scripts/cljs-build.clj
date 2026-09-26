;; Builds both artifacts this package publishes, from one cljs.jar, so that the
;; munged names in the compiled output always match the runtime it runs against.
;;
;;   node build.mjs          (this file is invoked by it)
;;
;; Everything here needs only a JVM: cljs.jar carries Clojure, the Google Closure
;; Compiler and cljs itself.
;;
;; Both artifacts use :target :default, never :browser. Self-hosting needs
;; cljs.core/find-ns-obj, and that function only handles "nodejs", "default" and
;; "webworker" — the browser target throws "find-ns-obj not supported for target
;; browser" on the first eval.
;;
;; Both use :optimizations :simple, which is the strongest mode self-hosting
;; supports (:advanced would rename the very things the compiler resolves by
;; name) and the only one that produces a single file that can be importScripts'd
;; or lazily added with a <script> tag. The :none mode's entry loads everything
;; through document.write, which does not work for a dynamically added script.

(require '[cljs.build.api :as b]
         '[clojure.java.io :as io])

(def out-dir "dist")

;; The page-side runtime entry namespace — the `:require` list of the artifact
;; built from `selfhost.runtime` — is *generated* from `bundled-libraries` below.
;; That is what makes the bundled set single-sourced: there is one list, and the
;; two halves cannot disagree because only one of them is written by a person.
;;
;; The generated file has to live under `src/cljs` (rather than a build directory)
;; because cljs resolves `:main` through the JVM classpath, which is fixed by
;; build.mjs before this script runs, and only `src/cljs` is on it.
(def runtime-entry "src/cljs/selfhost/runtime.cljs")

(defn- build-artifact [{:keys [main output-to label]}]
  (println (str "building " label " -> " output-to))
  (io/make-parents (io/file output-to))
  (let [started (System/currentTimeMillis)]
    (b/build
     "src/cljs"
     {:main main
      :output-to output-to
      :output-dir (str "target/" (name main))
      :optimizations :simple
      ;; NOT :browser — see the note at the top of this file.
      :target :default
      :infer-externs true
      :process-shim false
      :pretty-print false})
    (println (str "  done in " (quot (- (System/currentTimeMillis) started) 1000) "s, "
                  (.length (io/file output-to)) " bytes"))))

;; =============================================================================
;; The bundled libraries — the single source of truth for both halves

(def bundled-libraries
  "Every library this package ships, declared once. Adding a library here adds it
  to *both* halves at the same time, which is the point, because a library needs
  both and shipping one without the other half-installs it:

    - `dist/libs/**` is the source the compiler's load-fn serves on demand, so
      the analyzer can compile a `(require …)`; without it the require fails with
      `No such namespace`. The Closure library and the compiler's own namespaces
      are not served — they are reported as `{:lang :js}`, see `LOADED_ALREADY`
      in `src/index.js`.
    - `dist/cljs-runtime.js` is the JavaScript the page runs, and must contain the
      same namespaces; without them the require compiles and the generated call
      then throws in the page on an undefined global.

  Each entry is one of

    {:lib <ns> :files [...]}  a library a user may require: compiled into the page
                              runtime (`:lib`) and its sources copied into
                              `dist/libs` (`:files`);
    {:files [...]}            sources that only have to be *served*, because
                              something above needs to analyse them — a macros
                              namespace's `.clj`/`.cljc` half, or a transitive
                              dependency — but no page code is generated for them.

  A `.clj`/`.cljc` file is the macros namespace and a `.cljs` file the runtime one;
  cljs.js asks for the two separately, so both are usually listed."
  [;; cljs.core needs neither: its analysis is what `empty-state` dumps into the
   ;; compiler state, and its JavaScript *is* the page runtime. Named only so the
   ;; intent is explicit.
   {:lib 'cljs.core :files []}

   {:lib 'clojure.string        :files ["clojure/string.clj" "clojure/string.cljs"]}
   {:lib 'clojure.set           :files ["clojure/set.clj" "clojure/set.cljs"]}
   {:lib 'clojure.walk          :files ["clojure/walk.clj" "clojure/walk.cljs"]}
   {:lib 'clojure.edn           :files ["clojure/edn.clj" "clojure/edn.cljs"]}
   {:lib 'cljs.pprint           :files ["cljs/pprint.cljc" "cljs/pprint.cljs"]}
   {:lib 'clojure.core.reducers :files ["clojure/core/reducers.cljs"]}
   {:lib 'clojure.core.protocols :files ["clojure/core/protocols.cljs"]}
   ;; clojure.data is a thin wrapper over clojure.set, which is above.
   {:lib 'clojure.data          :files ["clojure/data.clj" "clojure/data.cljs"]}
   {:lib 'clojure.zip           :files ["clojure/zip.clj" "clojure/zip.cljs"]}
   ;; clojure.datafy is the datafy/nav pair over clojure.core.protocols, above.
   {:lib 'clojure.datafy        :files ["clojure/datafy.clj" "clojure/datafy.cljs"]}
   ;; cljs.math is the ClojureScript wrapper over the JS Math object; no deps.
   {:lib 'cljs.math             :files ["cljs/math.cljs"]}
   ;; cljs.proxy provides the `cljs.proxy/proxy` function, and `this-as` emits
   ;; calls into it. It is NOT `cljs.core/proxy`: r1.12.145's cljs.core excludes
   ;; `proxy`/`proxy-super` and never redefines them, so `(proxy ...)` is an
   ;; undeclared Var and never compiles. Its impl half is pulled into the page
   ;; runtime transitively through the require, but its source has to be servable
   ;; for the analyzer to resolve that require.
   {:lib 'cljs.proxy            :files ["cljs/proxy.cljs" "cljs/proxy/impl.cljs"]}
   ;; cljs.stacktrace parses and source-maps a stack trace; it needs goog.string
   ;; and clojure.string, both already in the runtime. It ships as .cljc only.
   {:lib 'cljs.stacktrace       :files ["cljs/stacktrace.cljc"]}
   ;; cljs.test is deliberately NOT here. Its runtime is servable — cljs/test.cljs
   ;; and its macros half cljs/test.cljc are both in the jar, and its macros
   ;; require clojure.template — but the analyzer then fails on it
   ;; ("Could not analyze  in file cljs/test.cljs"), because its macros namespace
   ;; requires the compiler's own cljs.analyzer/cljs.env, which the load-fn will
   ;; not serve as Clojure. It was tried and left out; see the README.

   ;; Served-only. cljs.reader and cljs.tools.reader are part of the compiler
   ;; bundle (`LOADED_ALREADY` in src/index.js), so their `.cljs` halves are never
   ;; fetched — but their macros halves are, and clojure.edn analyses on top of
   ;; them.
   {:files ["cljs/reader.clj" "cljs/reader.cljs"
            "cljs/tools/reader.cljs"
            "cljs/tools/reader/edn.cljs"
            "cljs/tools/reader/reader_types.clj" "cljs/tools/reader/reader_types.cljs"
            "cljs/tools/reader/impl/commons.cljs"
            "cljs/tools/reader/impl/errors.cljs"
            "cljs/tools/reader/impl/inspect.cljs"
            "cljs/tools/reader/impl/utils.cljs"]}])

(def lib-files (vec (mapcat :files bundled-libraries)))
(def runtime-libraries (vec (keep :lib bundled-libraries)))

(defn- write-runtime-entry
  "Writes the page-side runtime entry namespace — the `:require` list of the
  artifact built from `selfhost.runtime` — from `bundled-libraries`.

  Generating it, rather than keeping a second hand-written list, is what makes
  `bundled-libraries` a single source of truth: the two halves cannot disagree
  because only one of them is written by a person."
  []
  (let [file (io/file runtime-entry)
        requires (->> runtime-libraries
                      (map (fn [lib] (str "            [" lib "]")))
                      (interpose "\n")
                      (apply str))]
    (io/make-parents file)
    (spit file
          (str "(ns selfhost.runtime\n"
               "  \"Generated by scripts/cljs-build.clj from `bundled-libraries` — do not edit.\n\n"
               "  The compiler emits calls by munged name — `cljs.core.println.call(null, …)` — so\n"
               "  the page that runs the compiled JavaScript needs the same cljs.core, built from\n"
               "  the same cljs.jar. The libraries the compiler is willing to resolve are included\n"
               "  here too, so a compiled `(clojure.string/join …)` has something to resolve to at\n"
               "  runtime.\"\n"
               "  (:require\n"
               requires "))\n"))
    (println (str "generated " file " (" (count runtime-libraries) " libraries)"))))

;; =============================================================================

(defn- delete-recursively [^java.io.File file]
  (when (.exists file)
    (doseq [child (.listFiles file)] (delete-recursively child))
    (.delete file)))

;; Sources the compiler's load-fn serves on demand. `empty-state` only dumps
;; cljs.core's analysis, so (require '[clojure.string]) needs that library's
;; source to analyse — which means shipping it, not just compiling it.
(defn- copy-lib-sources []
  (let [target (io/file out-dir "libs")]
    (println (str "copying library sources -> " out-dir "/libs/"))
    ;; Emptied first, so that dropping a library from `bundled-libraries` does not
    ;; leave its sources behind here. dist/libs is committed, so a stale file is a
    ;; file that ships.
    (delete-recursively target)
    (doseq [f lib-files]
      (if-let [resource (io/resource f)]
        (let [dest (io/file out-dir "libs" f)]
          (io/make-parents dest)
          (spit dest (slurp resource)))
        (println (str "  missing from the classpath: " f))))))

(write-runtime-entry)
(build-artifact {:main 'selfhost.compiler :output-to "dist/cljs.js" :label "worker-side compiler"})
(build-artifact {:main 'selfhost.runtime :output-to "dist/cljs-runtime.js" :label "page-side runtime"})
(copy-lib-sources)
