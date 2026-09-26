# cljs-selfhosted-compiler

The [self-hosted ClojureScript compiler](https://clojurescript.org/guides/self-hosting), packaged
for [LiveCodes](https://livecodes.io): compile ClojureScript in a **classic web worker** — no DOM, no
server, no JVM at runtime — and run the resulting JavaScript in the page.

```js
import { createCljsCompiler } from '@live-codes/cljs-selfhosted-compiler';

const compiler = await createCljsCompiler({ baseUrl: '/cljs/' });
const { code, info } = await compiler.compile('(println (clojure.string/upper-case "hi"))');
```

`code` is JavaScript to run in the page; `info.errors` carries the compiler's diagnostics.

It is built as an IIFE, so a worker can pull it in with `importScripts` and reach it as the global
`CljsSelfHosted`:

```js
importScripts('/cljs/index.iife.js');
const compiler = await CljsSelfHosted.createCljsCompiler({ baseUrl: '/cljs' });
```

## Two artifacts, one build

Compiling and running are in different places, so the package publishes both halves — and they must
come from the same `cljs.jar`, because the compiler emits calls **by munged name**
(`cljs.core.println.call(null, …`) and inlines some vars, so a runtime built from a different
ClojureScript would not match.

| artifact | where it runs | what it is |
| --- | --- | --- |
| `dist/cljs.js` | the worker | the compiler: `cljs.js`, the analyzer, the compiler, and cljs.core's analysis (8.5 MB) |
| `dist/cljs-runtime.js` | the page | the runtime the compiled code calls into: cljs.core + the bundled libraries (1.5 MB) |
| `dist/libs/**` | the worker | the sources the compiler's load-fn serves on demand |
| `dist/index.iife.js` | the worker | the wrapper, defining `CljsSelfHosted` |

**The page needs its own cljs.core.** Compiled output is not linked against it — it calls into it at
runtime — and the compiler lives in a worker, so something has to provide cljs.core in the document
that runs the output. That is what `cljs-runtime.js` is for. Loading it is not enough on its own: a
top-level `def` compiles to `cljs.user.x = …`, so **the namespace object must exist** before the
compiled code runs:

```js
window.cljs = window.cljs || {};
window.cljs.user = window.cljs.user || {};
```

## Bundled libraries

`cljs.core` **is the standard library** — the language itself. Everything else in this list is a
namespace that ships in the same `cljs.jar` and is offered alongside it. All of them are in both
artifacts, so they can be required and will resolve at runtime.

This list is the authoritative one. LiveCodes' documentation and its in-app language info repeat it
by hand (they are in a different repository and cannot import it), and are meant to say exactly this.

| namespace | what it is |
| --- | --- |
| `cljs.core` | the ClojureScript standard library (nothing to serve: its analysis is what `empty-state` dumps and its JavaScript *is* the page runtime) |
| `clojure.string` | Clojure's string library, ported in the jar |
| `clojure.set` | Clojure's set library, ported in the jar |
| `clojure.walk` | Clojure's tree walker, ported in the jar |
| `clojure.edn` | Clojure's EDN reader, ported in the jar |
| `clojure.data` | Clojure's `diff`/`equality-partition`, ported in the jar (a thin wrapper over `clojure.set`) |
| `clojure.zip` | Clojure's zipper library, ported in the jar |
| `clojure.datafy` | Clojure's `datafy`/`nav`, ported in the jar (over `clojure.core.protocols`) |
| `clojure.core.reducers` | Clojure's reducers/fold, ported in the jar |
| `clojure.core.protocols` | Clojure's `Datafiable`/`Navigable`/`IKVReduce` protocols, ported in the jar |
| `cljs.pprint` | ClojureScript's pretty-printer |
| `cljs.math` | ClojureScript's wrapper over the JavaScript `Math` object |
| `cljs.proxy` | ClojureScript's JavaScript `Proxy` helper (what `cljs.core/proxy` used to be built on) |
| `cljs.stacktrace` | ClojureScript's stack-trace parser and source-mapper |
| `cljs.reader` | ClojureScript's `read-string` reader — already in the page runtime |
| `cljs.tools.reader` | the reader the analyzer itself uses — already in the page runtime |
| `cljs.tools.reader.edn` | the EDN half of that reader — already in the page runtime |

The three reader namespaces (and `cljs.tools.reader.reader-types` and the
`cljs.tools.reader.impl.*` namespaces under it) are already present in the page runtime because
`clojure.edn` pulls them in transitively, so they cost nothing extra; they are listed here because
they are require-able and work.

Requiring anything else fails with a normal "No such namespace" diagnostic.

Both halves are needed — the compiler analyses the source while the page needs the compiled
JavaScript — and shipping only one leaves a library half-installed: without its source the require
fails with "No such namespace", and without its compiled JavaScript the require *succeeds* and the
generated call then throws in the page on an undefined global. The set is therefore declared once,
as `bundled-libraries` in `scripts/cljs-build.clj`, and the runtime entry namespace
(`src/cljs/selfhost/runtime.cljs`) is **generated from that same list** by the build, so the two
halves cannot drift. Adding a library is one entry:

```clojure
{:lib 'clojure.zip :files ["clojure/zip.clj" "clojure/zip.cljs"]}
```

A `{:files [...]}` entry with no `:lib` is served to the compiler without being compiled into the
page — a macros namespace's `.clj` half, or a transitive dependency.

### What is not included, and why

- **`cljs.test`** would be useful, but it cannot work against this compiler. Its runtime half
  (`cljs/test.cljs`) requires-macros `clojure.template` and itself, and expanding
  `cljs.test$macros/cljs-output-dir` calls `cljs.analyzer.api/get-options`, which reads the
  compiler's own options out of a compiler environment that the macro-eval context does not have.
  Macroexpansion then dies with `Cannot read properties of undefined (reading 'get_options')`,
  surfaced as `Could not analyze  in file cljs/test.cljs`. Making it work would mean exposing the
  analyzer and `cljs.env` to evaluated Clojure — i.e. dragging the compiler into the page.
- **`cljs.spec.alpha`** (and `cljs.spec.gen.alpha`, `cljs.spec.test.alpha`, `cljs.core.specs.alpha`)
  are in the compiler bundle but cannot be added to the page. `cljs.spec.alpha` requires
  `cljs.analyzer` and `cljs.env`, and its macros half asks the load-fn for `cljs.core`'s own macros
  namespace (`cljs.core$macros`), which is not a file the jar can be served by name. Its first step
  fails with `No such macros namespace: cljs.core`, and the next would be the analyzer. It is
  therefore not claimed as loaded either — a `(require '[cljs.spec.alpha])` fails cleanly with
  "No such namespace" rather than compiling and throwing in the page.
- **`clojure.pprint`** is a trap, not a supported library. It *resolves* — the load-fn's
  `clojure/` → `cljs/` fallback serves `cljs/pprint.cljs` — but the source declares `cljs.pprint`
  while the require asked for `clojure.pprint`, so the emitted calls go to a `clojure.pprint` global
  no page provides and the page throws `Cannot read properties of undefined (reading 'pprint')`.
  The supported spelling is `cljs.pprint`.
- **`cljs.core.async`, Reagent, `cljs-ajax`, date libraries and every other third-party library**
  are separate dependencies. They are not in the jar, so they are not bundled. This package ships
  the compiler and the namespaces the jar carries, and nothing else.
- **npm imports are not supported.** `(:require ["react" :as React])` fails with `No such
  namespace`: a browser tab has no classpath and the compiler has no JS dependency index to resolve
  a package through. The [Cherry-based ClojureScript](https://livecodes.io/docs/languages/clojurescript-cherry)
  in LiveCodes handles that case; use it for npm-dependent code.

### One list, and the compiler's own namespaces

The load-fn reports the compiler's internals as already loaded so it does not re-analyse its own
bundle (`LOADED_ALREADY` in `src/index.js`). Some of those namespaces (`cljs.core`, `cljs.reader`,
`cljs.tools.reader`) really are in the page runtime; the rest (`cljs.analyzer`, `cljs.compiler`,
`cljs.env`, `cljs.js`, `cljs.source-map`, `cljs.tagged-literals`) are the compiler itself and are
**not** in the page. Requiring one of the latter compiles and then throws in the page on an
undefined global — the same silent-failure shape the two-halves rule exists to prevent — so they are
not part of the supported set.


## Options

`compile(code, options)` takes plain JS and builds the ClojureScript map `cljs.js` requires:

`ns` (default `cljs.user`), `context`, `staticFns`, `fnInvokeDirect`, `optimizeConstants`,
`checkedArrays`, `sourceMap`, `defEmitsVar`.

`sourceMap` is **on by default**. The map is inline (a `sourceMappingURL` data comment) and carries
`sourcesContent`, so the browser maps a thrown error back to the ClojureScript as written without
anything further from the host page. Pass `sourceMap: false` to leave it out.

## Building

```bash
npm run build     # needs only a JVM
npm start         # test harness on http://localhost:8128/
```

A JVM is the only requirement — `cljs.jar` carries Clojure, the Google Closure Compiler and cljs.
There is no bundler and no `node_modules`: the wrapper has no imports, so turning it into an IIFE is
a one-line transform.

`dist/` is committed, so a clone runs as-is; the build takes about a minute.

## What the wrapper is for

Almost all of it absorbs two hazards, both of which fail in ways that look like something else.

**cljs.js speaks ClojureScript, not JavaScript.** Its compile options, the load-fn request, and the
load-fn *reply* are all ClojureScript maps with keyword keys. A JS object literal fails
`(map? opts)`; JS destructuring or property access yields `undefined` for every key, silently. An
unresolvable dependency must call back with **`nil`** — a bogus map is accepted by the assert and
then reported as a missing namespace somewhere unrelated.

**The compiler holds no analysis for anything but cljs.core.** Everything else has to be served as
source through the load-fn: `{:lang :clj :source …}` makes cljs.js analyse it. The Closure library and
the compiler's own namespaces are reported as `{:lang :js}` — "loaded, do not analyse" — because
re-analysing the compiler's internals collides with them (`Can't redefine a constant`). An `:eval`
function is also required, not optional: a macros namespace has to be *evaluated* for its macros to
exist, without which compilation fails with `No *eval-fn* set`.

## Limitations

- **A `defmacro` is evaluated at compile time**, so it runs in the worker. That is inherent to macros
  — it is what the JVM compiler does — but it does mean a macro body cannot touch the page.
- **Only top-level `defmacro` forms are recognised.** Exposing a macro means evaluating its
  `defmacro` before the source that uses it is analysed, and the pre-pass that does this reads
  top-level forms. A `defmacro` nested inside a `(do …)` is therefore compiled as an ordinary `def`
  (which marks the var a macro at run time) and calls to it are never expanded.
- **A macro is scoped to one compile.** Each compile gets a fresh compiler state, so a macro defined
  in one run is not available in the next — a later run reports it as an undeclared Var.
- **Not a project build**: no `:advanced`, no `:npm-deps`, no foreign libraries.

## Licence

EPL-1.0, the same as ClojureScript.
