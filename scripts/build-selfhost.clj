;; Builds the self-hosted ClojureScript compiler consumed by the page.
;;
;; Run through the standalone `cljs.jar` from the ClojureScript release, so no
;; Clojure CLI, leiningen or babashka is required — only a JVM:
;;
;;   node scripts/build-selfhost.js                 # :none (the mode that works)
;;   node scripts/build-selfhost.js --simple        # :simple (fails; see FINDINGS.md)
;;
;; What the artifact is: the actual ClojureScript compiler (cljs.js, which brings
;; cljs.analyzer and cljs.compiler with it) plus cljs.core, compiled to JavaScript.
;; `cljs.js/empty-state` additionally dumps the cljs.core analysis cache into the
;; artifact, which is what lets `eval-str` compile new code against a known
;; cljs.core without fetching anything else.
;;
;; The cljs.js build emits namespaces onto the global object, so the page reads
;; them as `cljs.js.eval_str` / `cljs.js.empty_state` / `cljs.js.js_eval`.

(require '[cljs.build.api :as b]
         '[clojure.java.io :as io])

(def optimizations
  (keyword (or (System/getProperty "cljs.optimizations") "none")))

(def out-dir "public/cljs-selfhost")

;; :none emits one file per namespace plus the Closure debug loader, so the whole
;; directory is the artifact. :simple bundles everything into a single file.
(def out-file
  (str out-dir (if (= :none optimizations) "/main.js" "/cljs.js")))

(io/make-parents (io/file out-file))
(println "building the self-hosted compiler ->" out-file "(optimizations" optimizations ")")

(let [started (System/currentTimeMillis)]
  (b/build
   "src"
   (cond-> {:main 'selfhost.core
            :output-to out-file
            :output-dir out-dir
            ;; :none defers loading to the Closure debug loader, which resolves
            ;; the per-namespace files through this URL prefix.
            :asset-path "cljs-selfhost"
            :optimizations optimizations
            ;; NOT :browser. Self-hosting needs cljs.core/find-ns-obj, and that
            ;; function only handles "nodejs", "default" and "webworker" — the
            ;; browser target is not among them, so it throws
            ;; "find-ns-obj not supported for target browser" on the first eval.
            ;; :default resolves namespaces through goog.global, which is what a
            ;; page needs.
            :target :default
            :process-shim false
            :pretty-print false}
     ;; Only :simple and stronger run Closure, and only they need externs inferred.
     (not= :none optimizations) (assoc :infer-externs true)))
  (println "done in" (quot (- (System/currentTimeMillis) started) 1000) "s"))
