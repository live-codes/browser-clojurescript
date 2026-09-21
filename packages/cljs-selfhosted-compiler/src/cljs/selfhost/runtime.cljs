(ns selfhost.runtime
  "Build entry for the page-side runtime artifact.

  The compiler emits calls by munged name — `cljs.core.println.call(null, …)` —
  so the page that runs the compiled JavaScript needs the same cljs.core, built
  from the same cljs.jar. The libraries the compiler is willing to resolve are
  included here too, so a compiled `(clojure.string/join …)` has something to
  resolve to at runtime."
  (:require [cljs.core]
            [clojure.string]
            [clojure.set]
            [clojure.walk]
            [clojure.edn]
            [cljs.pprint]))
