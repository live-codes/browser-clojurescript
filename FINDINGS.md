# Spike findings — ClojureScript in the browser

**Status: spike complete.** Both engines compile and run ClojureScript typed into the page, in the
tab, with no server-side compilation and no cross-origin isolation. Everything below was **run**,
in headless Chrome — not inferred from docs. Where a claim comes from reading compiler source
rather than from a run, it says so.

## 1. What this is for, and the thing worth knowing first

LiveCodes **already ships ClojureScript**, as `src/livecodes/languages/clojurescript/lang-clojurescript.ts`,
pinned to `cherry-cljs@0.2.19`. That language is **Cherry** — an experimental *CLJS-syntax → ES6*
transpiler whose own README says it "is not recommended to be used in production", "currently has
many bugs". It is not the ClojureScript compiler and does not implement `cljs.core` properly.

So "add ClojureScript support" is not one thing. This spike covers the two engines that are actual
ClojureScript, and the recommendation in §7 is about how they fit next to Cherry.

| engine | what it is | runs | artifact |
| --- | --- | --- | --- |
| **scittle** | [Scittle](https://github.com/babashka/scittle) — SCI, the Small Clojure Interpreter, compiled to JS | interprets `clojure` semantics with `:features #{:scittle :cljs}` | one 944 KB CDN file (v0.8.32) |
| **cljs-selfhosted** | the official ClojureScript compiler, self-hosted via `cljs.js/eval-str` | compiles and evaluates, real `cljs.core` | one 8.1 MB file, **built here** |

## 2. The page

One static page, an engine selector, an editor, an output pane and a diagnostics pane. No bundler,
no `node_modules`, no build step to run it. Program output is captured by intercepting the console,
because both engines print through ClojureScript's `*print-fn*`, which lands there.

```
public/index.html   the harness
public/main.js      both engines behind one run() contract + console capture
serve.js            static server (file:// cannot fetch the bundle or run the CDN script)
scripts/            the self-hosted bundle build (§4)
```

## 3. Verified

Every row was run through the page in headless Chrome; outputs are verbatim. Timing is
`runMs` from the page's own instrumentation.

| example | Scittle | self-hosted compiler |
| --- | --- | --- |
| Hello world | pass, 11 ms | pass, 147 ms (first run, incl. 8.1 MB fetch+parse) |
| Data structures and seq functions | pass, 5 ms | pass, 19 ms |
| Functions, threading, destructuring | pass, 4 ms | pass, 31 ms |
| Macros | pass, 8 ms | **not expanded — reported in the page**, see §6 |
| State with atoms | pass, 5 ms | pass, 13 ms |
| JavaScript interop | pass, 6 ms | pass, 6 ms |
| An error | pass, 3 ms | pass, 4 ms — same message |

Sample verbatim output (`Data structures`, both engines identical):

```
names: (Ada Grace Alan)
count: 3
Ada (1815)
Grace (1906)
Alan (1912)
=> {:names ["Ada" "Grace" "Alan"], :count 3, :oldest "Ada"}
```

The `=>` line is the value of the last form, shown REPL-style. Scittle's errors are genuinely
good — it renders its own formatted report, which is what the diagnostics pane shows:

```
----- Scittle error ------------------------------
Message:  cannot divide by zero
Data:      {:a 10, :b 0}
Location: 3:5
----- Stack trace --------------------------------
user/divide - NO_SOURCE_PATH:3:5
user/divide - NO_SOURCE_PATH:1:1
user        - NO_SOURCE_PATH:7:20
user        - NO_SOURCE_PATH:7:1
```

## 4. Getting the self-hosted compiler to work (four separate blockers)

The self-hosted compiler is not available as a prebuilt CDN artifact. The official release
publishes a standalone `cljs.jar` (32 MB, `r1.12.145`), and that plus a JVM is enough to build one:

```bash
node scripts/build-selfhost.js --simple    # -> public/cljs-selfhost/cljs.js (8,463,638 bytes)
```

No Clojure CLI, leiningen or babashka needed — the jar carries Clojure, the Closure Compiler and
cljs itself. Four things had to be right, and each failed in a way that looked like something else:

**(a) `:simple` cannot be used with `:main 'cljs.js`.**

```
ERROR - [JSC_MISSING_MODULE_OR_PROVIDE] Required namespace "cljs.core$macros" never defined.
```

`cljs.closure/add-core-macros-if-cljs-js` (closure.clj:842) adds a `cljs.core$macros` require to
the `cljs.js` entity, and `cljs-source-for-namespace` (closure.clj:860) maps that namespace back to
`cljs/core.cljc`. With `:main 'cljs.js` no `core$macros.js` was emitted at all, so Closure had a
require with no matching provide. **The fix is an entry namespace on the source path** — `src/selfhost/core.cljs`
requires `cljs.js`, and the whole graph is then compiled, `cljs/core$macros.js` included.

**(b) `:target :browser` cannot work.** The first eval died with an unhelpful
`find-ns-obj not supported for target browser`. Compiled `cljs.core/find_ns_obj` switches on
`*target*` and only handles `"nodejs"`, `"default"` and `"webworker"` — `:browser` falls through to
the throwing default. `:target :default` resolves namespaces through `goog.global`, which is what a
page needs.

**(c) `eval-str`'s options must be a ClojureScript map.** `cljs.js` guards them with
`(defn- valid-opts? [x] (or (nil? x) (map? x)))` (js.cljs:71), so a JS object literal — the obvious
thing to write from a page — fails with a bare `Assert failed: (valid-opts? opts)`. They have to be
built with `cljs.core.array_map` and interned keywords.

**(d) The namespace object does not exist.** This one is worth reading twice, because it fails
*silently*. A top-level `def` compiles to `cljs.user.x = (1)`, and `eval-str` evaluates the whole
program as-is. Nothing in a page has ever created `cljs.user`, so that line throws
`Cannot set properties of undefined (setting 'x')` — and **every later form in the same run is
abandoned without any error being reported**. `(println "a1") (def x 1) (println "b1")` printed
`a1` and then nothing at all. A normal build gets that object from the namespace's own compiled
module; a self-hosted harness has to supply it, which `ensureGlobalNamespace` in `public/main.js`
now does.

Worth noting for anyone repeating this: (d) is a *harness* bug and (a)–(c) are *build* bugs, and
the symptom of (d) looks exactly like "the compiler stops at the first def" rather than like a
missing global. It was found by intercepting the emitted JavaScript via a custom `:eval` function,
which printed all three statements present and correct — after which the only candidate was the
middle one.

Artifact: `:optimizations :simple`, **8,463,638 bytes**, single file, loadable with a
dynamically-inserted `<script>` (which matters — see below).

### `:none` is the mode other tooling uses, and it does not fit here

`:none` builds in 7–16 s (against 54–135 s for `:simple`) and emits a directory of per-namespace
files plus the Closure debug loader — ~170 files, including `cljs/core$macros.js`. But the entry it
generates loads everything through **`document.write`**:

```js
if(typeof goog == "undefined") document.write('<script src="cljs-selfhost/goog/base.js"></script>');
document.write('<script src="cljs-selfhost/goog/deps.js"></script>');
document.write('<script src="cljs-selfhost/cljs_deps.js"></script>');
document.write('<script>goog.require("cljs.js");</script>');
```

`document.write` is a no-op for a script injected after parsing ends, so a `:none` bundle can only
be loaded by putting `<script>` tags in the HTML — i.e. eagerly, on every page load. That is the
reason this spike ships the `:simple` artifact: it is the only form that can be lazily loaded, and
lazy loading is the whole point for a 8 MB compiler.

## 5. Payload

| asset | bytes |
| --- | --- |
| `scittle.js` (0.8.32, jsDelivr) | 967 KB |
| self-hosted `cljs.js` (`:simple`) | 8,463,638 |
| the page itself (`index.html` + `main.js`) | ~20 KB |

Both are fetched lazily on the first Run. The self-hosted bundle and its build output are committed,
so a clone runs as-is; `npm run build:cljs-selfhost` rebuilds it against a different ClojureScript
release, and takes ~1 minute.

## 6. The two gaps, and where they landed

### Runtime errors are not surfaced — fixed

The symptom was that the error example produced *no output at all* under the self-hosted engine, not
even the `println` that preceded the throw, and the status was reported `done`.

The cause was not in the compiler. `eval-str` hands its callback a **ClojureScript map**, and the
driver was reading it with JavaScript property access:

```js
if (result.error)              // undefined — always
else io.result(result.value)   // undefined — always
```

So every `:error` was discarded, and no value ever reached the output pane either. Reading the keys
with keyword lookup — `core.get(result, core.keyword(null, 'error'))` — fixes both. The compiler does
report the failure; it simply was not being read. The message needed one more step: cljs.js wraps the
program's exception in one whose message is literally `ERROR`, with the original at the end of its
`cause` chain, so the driver walks that chain and reports `cannot divide by zero`.

The same bug is why no engine-2 row above ever showed a `=>` value line. Values are now printed with
`cljs.core/pr-str`, so a map reads `{:names ["Ada" …], :count 3}` rather than `#object[Object …]`.

A third driver bug only became visible once those two were fixed: the console capture silenced
**stdout as soon as any warning appeared**, and the analyzer emits a shadowing warning before the
program even runs — so the `this far` that the program prints before throwing never appeared.
Warnings now record a diagnostic without gating the program's output, and the error example produces
exactly what Scittle produces: `this far` on stdout, `cannot divide by zero` on stderr.

### A macro defined at runtime is not expanded — solved in the package

`(unless true (println …))` ran its body. The macro was never expanded; here is what it took to fix,
because the mechanism is genuinely counter-intuitive.

Macro dispatch does **not** go through `resolve-macro-var`. It goes through `get-expander`, which
returns a *Var* and reads `.isMacro` off it — and for an unqualified symbol it searches exactly two
places (analyzer.cljc:4220): the namespace named by `:use-macros`, or **`cljs.core$macros`**. It never
consults the current namespace's own `$macros`. That is why making `intern-macros` work — `:macros`
went from absent to `present(unless)`, which I verified — changed nothing: that map is read by
`resolve-macro-var`, and dispatch ignores it.

Three things are needed, and missing any one of them looks like something else entirely:

1. **The macro function must exist**, which means evaluating the `defmacro` — compiling it is not
   enough. Inherent to macros: it is what the JVM compiler does with a macro namespace.
2. **The namespace object must exist first.** `cljs.user.unless = …` throws `Cannot set properties of
   undefined` if `cljs.user` is absent, and the eval then fails *silently* — the same trap as §4(d),
   in the worker this time. It cost a round trip to see, and was only visible by reporting what the
   pre-pass actually observed.
3. **The `defmacro` forms must not be part of what gets compiled.** Re-analysing a `defmacro` — which
   compiling it does — takes the name back out of macro dispatch, so forms after it stop expanding.
   Evaluating them and compiling the *rest* is what makes it work; the definition is compile-time only,
   so nothing is lost from the output.

Two more things fell out of this, both found by reproducing the failure in Node rather than the
browser — a cycle there is seconds instead of minutes:

4. **Exposure has to go through `:use-macros`, not `cljs.core$macros`.** Writing user macros into
   `cljs.core$macros` replaces the core macro of the same name, so a `(defmacro when …)` broke core
   `when` for everything else compiled in that state. Pointing `:use-macros` at a per-namespace
   `cljs.user$macros` object resolves user macros first and leaves core macros alone.
5. **Re-evaluating a `defmacro` whose name is already exposed poisons the lookup for it.** Run 1
   expanded; every later run in the same worker silently did not, while still reporting the macro as
   present and copied. Withdrawing the exposed names before re-evaluating fixed it, and registering
   through the per-compile state (4) removed the class of problem altogether.

The package does all of this, and the harness asserts it — including a second run in the same worker,
and a macro named after a core macro (`when-let` and `->>` must still behave).

Scittle gets this right natively, in the same example, in the same page.

## 7. Recommendation for LiveCodes

**Shape — two languages, not one.** The `python`/`python-wasm`, `ruby`/`ruby-wasm`,
`haskell`/`haskell-wasm` precedent applies directly, but the heavy one here is **not wasm**, so
`-wasm` would be a misnomer. Suggest `clojure` (or `scittle`) for the interpreter and
`clojurescript-selfhosted` for the compiler — the suffix is the one decision worth a second
opinion, since the existing `-wasm` slot doubles as "the heavy variant".

**Both are the `scriptType` runtime shape, not the `imports` shape.** Neither engine needs a
compiler worker: code is handed to a runtime in the result page.

- Scittle is almost embarrassingly direct — it already evaluates `script[type="application/x-scittle"]`
  itself on `DOMContentLoaded`, so the language module is `scripts: [scittleUrl, baseUrl + '{{hash:lang-*-script.js}}']`
  and `scriptType: 'application/x-scittle'`, with the small `lang-*-script.js` only needing to
  redirect `*print-fn*` to the result page's output. `liveReload: true`, like `haskell`.
- The self-hosted engine is `scripts: [browserCompilersUrl + 'cljs-selfhost/cljs.js', baseUrl + '{{hash:lang-*-script.js}}']`
  with `largeDownload: true`, and the runtime script must do what `public/main.js` does: build the
  options map (§4c) and create `cljs.user` (§4d).

**Asset hosting.** The 8.1 MB bundle belongs in `browser-compilers` and should be referenced from
`vendors.ts` pinned by version, built in CI from `cljs.jar` — `scripts/build-selfhost.js` is
directly reusable for that. Scittle needs only `getUrl('scittle@0.8.32/dist/scittle.js')`.

**Cherry.** `clojurescript` is already taken by Cherry. Cherry is not a ClojureScript engine and
should not be presented as one; either leave it alone and add these two beside it, or migrate the
`clojurescript` name to a real engine and retire Cherry to its own name. That is a product call,
not a technical one, but it should be made deliberately rather than by adding a third
"ClojureScript" that also isn't ClojureScript.

**What not to do:** do not ship the `:none` build. Its `document.write` loader forces eager loading
of every file on every page load, which is worse than the 8 MB single file in every respect.

## 8. Reproducing

```bash
npm install                      # nothing to install
npm run build:cljs-selfhost      # needs only a JVM; ~1 min; writes public/cljs-selfhost/cljs.js
npm start                        # -> http://localhost:8127/
npm run check                    # syntax-check serve.js, main.js and the build wrapper
```

The page exposes `document.documentElement.dataset` (`status`, `engine`, `runMs`, `runs`) and its
element ids as globals, so scripted checks can read state without string literals — which is how
every table in this document was produced.

## 9. Licence

Scittle, SCI and ClojureScript are all EPL-1.0. The page itself is MIT.

## 10. The package (added after the spike)

§7 above recommended a `scriptType` runtime. That is right for Scittle but wrong for the self-hosted
compiler: `eval-str` runs the code where the *compiler* is, and a compiler belongs in the compiler
worker. So the self-hosted half became a package,
[`packages/cljs-selfhosted-compiler`](packages/cljs-selfhosted-compiler/README.md), which **compiles**
instead of evaluating.

```js
const compiler = await CljsSelfHosted.createCljsCompiler({ baseUrl });  // classic worker, no DOM
const { code, info } = await compiler.compile(cljsSource, options);     // JS for the result page
```

What that changes, and what it cost to build:

- **The page needs its own cljs.core.** Compiled output is not linked against it — it calls into it —
  so `dist/cljs-runtime.js` (1.5 MB) is loaded in the result page while `dist/cljs.js` (8.5 MB) stays
  in the worker. Both must come from one `cljs.jar`, because the emitted calls are by munged name.
- **No `scriptType`.** The output is ordinary JavaScript, so it is the result page's editor script and
  has full DOM access. Scittle keeps its `scriptType`; Cherry is unaffected.
- **The libraries are resolvable after all**, which §7 doubted. `clojure.string`, `clojure.set`,
  `clojure.walk`, `clojure.edn` and `cljs.pprint` all compile and run, verified in the harness.
- **Four more traps, all of which fail as something else.** The load-fn reply must be a ClojureScript
  map with keyword values — `(assert (or (map? resource) (nil? resource)))` is checked inside cljs.js,
  and a JS object literal is what you will reach for. Unresolvable must be `nil`, not an empty map.
  `:eval` is required even when compiling, because a macros namespace has to be evaluated for its
  macros to exist (`No *eval-fn* set`). And `goog.*` plus the compiler's own namespaces must be
  reported as `{:lang :js}` — already loaded — or re-analysing them collides with themselves
  (`Can't redefine a constant`).
- The ClojureScript-vs-JavaScript mistake is worth naming: it bit **five separate times** in this
  session — compile options, the load-fn request, the load-fn reply, the `compile-str` callback, and
  `ex-data`. Every one was a JS object or property access where a CLJS map was required, and every one
  failed silently or misleadingly. It is the single most likely thing to break when touching this
  integration.

Verified by `packages/cljs-selfhosted-compiler/test/` — a classic worker compiling, then the page
running the output against the runtime only: **9 passed, 0 failed**, with the worker reporting
`document=undefined window=undefined`.

LiveCodes is wired (`cljs-selfhosted`, `cljs-scittle`, a `vendors.ts` pin and a build entry) and
typechecks. It cannot run until the package is published, since `cljsSelfHostedBaseUrl` points at
`@live-codes/cljs-selfhosted-compiler@0.1.0` on the CDN.
