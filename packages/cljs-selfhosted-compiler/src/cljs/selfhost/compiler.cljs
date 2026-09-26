(ns selfhost.compiler
  "Build entry for the worker-side compiler artifact.

  Requires `cljs.js`, which brings the analyzer and the compiler with it. The
  build also dumps cljs.core's analysis into the artifact (`:dump-core`, on by
  default), which is what lets `empty-state` compile new code against cljs.core
  without fetching anything.

  This namespace is only here to give `cljs.build.api` a namespace on the source
  path to start from — without one, `cljs.core$macros` is never emitted and the
  Closure pass fails with `Required namespace \"cljs.core$macros\" never defined.`

  `cljs.analyzer.api` is required for the same reason, one step out: it is not a
  dependency of `cljs.js`, so nothing else in this tree pulls it in, and yet the
  load-fn reports `cljs/analyzer/api` as already loaded (it matches the
  `cljs/analyzer` prefix in `LOADED_ALREADY`). A user namespace that resolves it
  — `cljs.test`'s macros half does, for `get-options` — then compiles a call to
  `cljs.analyzer.api.get_options` against a global this bundle never defined, and
  dies with `Cannot read properties of undefined (reading 'get_options')`.
  Requiring it here is what makes that `LOADED_ALREADY` entry true."
  (:require [cljs.js]
            [cljs.analyzer.api]))
