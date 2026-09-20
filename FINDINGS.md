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
| Macros | pass, 8 ms | **partly wrong** — see §6 |
| State with atoms | pass, 5 ms | pass, 13 ms |
| JavaScript interop | pass, 6 ms | pass, 6 ms |
| An error | pass, 3 ms | **no output, error not surfaced** — see §6 |

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

Both are fetched lazily on the first Run. The self-hosted bundle is not committed (see
`.gitignore`); the build takes ~1 minute.

## 6. Two things the self-hosted engine gets wrong

Both are reproducible, and both matter for a language implementation.

**Locally-defined macros mis-expand.** In the Macros example, `(unless false …)` works but
`(unless true …)` **runs its body anyway** — the guard is ignored. An earlier version of the example
had a macro used in a nested position, and `(time-it (reduce + (range 100000)))` printed its own
unevaluated expansion instead of a number:

```
sum: (cljs.core/let [start__2__auto__ (cljs.core/system-time) value__3__auto__ nil] …)
```

Scittle gets all of this right, in the same example, in the same page. So this is a property of
locally-defined macros under self-hosted `eval-str` in this build, not of the source.

**Runtime errors are not surfaced.** The error example produces *no output at all* under this
engine — not even the `println` that precedes the throw — and the diagnostics pane shows only an
analyzer warning about `divide` shadowing `cljs.core/divide`. The status is reported `done`. Shown
by §4(d) that a throw during evaluation can abandon the rest of a run without reaching the
callback, this is consistent with an exception escaping the `eval-str` continuation rather than
arriving as `{:error …}` — but that last step is inference, not something verified here, and it is
the first thing to chase next.

Neither limitation affects Scittle.

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
