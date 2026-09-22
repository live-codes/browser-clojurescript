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

`cljs.core`, `clojure.string`, `clojure.set`, `clojure.walk`, `clojure.edn` and `cljs.pprint` — in
both artifacts, so they can be required and will resolve at runtime.

Requiring anything else fails with a normal "No such namespace" diagnostic. Adding a library means
adding its sources (and its macros namespace's source) to the `lib-files` list in
`scripts/cljs-build.clj`, and to the runtime entry in `src/cljs/selfhost/runtime.cljs`; both halves
are needed, because the compiler analyses the source while the page needs the compiled JavaScript.

## Options

`compile(code, options)` takes plain JS and builds the ClojureScript map `cljs.js` requires:

`ns` (default `cljs.user`), `context`, `staticFns`, `fnInvokeDirect`, `optimizeConstants`,
`checkedArrays`, `sourceMap`, `defEmitsVar`.

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
- **No source maps**, so no clickable line numbers for diagnostics.
- **Not a project build**: no `:advanced`, no `:npm-deps`, no foreign libraries.

## Licence

EPL-1.0, the same as ClojureScript.
