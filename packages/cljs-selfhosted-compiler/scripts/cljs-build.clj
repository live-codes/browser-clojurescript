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

;; Sources the compiler's load-fn serves on demand. `empty-state` only dumps
;; cljs.core's analysis, so (require '[clojure.string]) needs that library's
;; source to analyse — which means shipping it, not just compiling it.
;;
;; Both halves matter: `clojure/string.clj` is the macros namespace and
;; `clojure/string.cljs` is the runtime one, and cljs.js asks for them separately.
(def lib-files
  ["clojure/string.clj" "clojure/string.cljs"
   "clojure/set.clj" "clojure/set.cljs"
   "clojure/walk.clj" "clojure/walk.cljs"
   "clojure/edn.clj" "clojure/edn.cljs"
   "clojure/core/protocols.cljs"
   "clojure/core/reducers.cljs"
   "cljs/reader.clj" "cljs/reader.cljs"
   "cljs/pprint.cljc" "cljs/pprint.cljs"
   ;; clojure.edn is a thin wrapper over cljs.tools.reader.edn, so shipping edn
   ;; means shipping this too.
   "cljs/tools/reader.cljs"
   "cljs/tools/reader/edn.cljs"
   "cljs/tools/reader/reader_types.clj" "cljs/tools/reader/reader_types.cljs"
   "cljs/tools/reader/impl/commons.cljs"
   "cljs/tools/reader/impl/errors.cljs"
   "cljs/tools/reader/impl/inspect.cljs"
   "cljs/tools/reader/impl/utils.cljs"])

(defn- copy-lib-sources []
  (println "copying library sources -> dist/libs/")
  (doseq [f lib-files]
    (if-let [resource (io/resource f)]
      (let [dest (io/file out-dir "libs" f)]
        (io/make-parents dest)
        (spit dest (slurp resource)))
      (println (str "  missing from the classpath: " f)))))

(build-artifact {:main 'selfhost.compiler :output-to "dist/cljs.js" :label "worker-side compiler"})
(build-artifact {:main 'selfhost.runtime :output-to "dist/cljs-runtime.js" :label "page-side runtime"})
(copy-lib-sources)
