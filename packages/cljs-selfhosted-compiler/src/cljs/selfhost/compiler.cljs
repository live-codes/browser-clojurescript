(ns selfhost.compiler
  "Build entry for the worker-side compiler artifact.

  Requires `cljs.js`, which brings the analyzer and the compiler with it. The
  build also dumps cljs.core's analysis into the artifact (`:dump-core`, on by
  default), which is what lets `empty-state` compile new code against cljs.core
  without fetching anything.

  This namespace is only here to give `cljs.build.api` a namespace on the source
  path to start from — without one, `cljs.core$macros` is never emitted and the
  Closure pass fails with `Required namespace \"cljs.core$macros\" never defined.`"
  (:require [cljs.js]))
