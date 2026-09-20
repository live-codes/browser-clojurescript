(ns selfhost.core
  "Entry namespace for the self-hosted compiler build.

  It exists so the build has a namespace on the source path to start from: the
  entry pulls in `cljs.js`, and therefore `cljs.analyzer`, `cljs.compiler` and
  `cljs.core`, all of which are compiled into the artifact alongside it.

  Nothing here calls into the compiler. The page uses `cljs.js/eval-str` (and
  its friends `empty-state` / `js-eval`) directly once the artifact has loaded."
  (:require [cljs.js]))
