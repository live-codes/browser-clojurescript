# Browser ClojureScript

Run **ClojureScript entirely in the browser** — no server, no upload, no install, and no
cross-origin isolation. Everything a program needs runs in the tab, and nothing is compiled
server-side.

It is a proof of concept for adding ClojureScript to [LiveCodes](https://livecodes.io), in the same
shape as [`browser-haskell`](https://github.com/live-codes/browser-haskell) and
[`browser-cobol`](https://github.com/live-codes/browser-cobol) were for their languages.

Two interchangeable engines, selectable from the page:

| engine | what it is | fetch |
| --- | --- | --- |
| **Scittle** | [SCI](https://github.com/babashka/sci) — the Small Clojure Interpreter — compiled to JS. Interprets ClojureScript semantics directly. | 944 KB |
| **ClojureScript (self-hosted)** | the official ClojureScript compiler, self-hosted via `cljs.js/eval-str`. Compiles *and* runs, with real `cljs.core`. | 8.1 MB |

Neither is a subset interpreter or a transpiler-to-JS-without-semantics, and neither needs a build
step to run.

## Demo

```bash
npm start          # -> http://localhost:8127/
```

Pick an engine and an example (or type your own), press **Run** — or `Ctrl`/`Cmd` + `Enter` in the
editor. Program output appears in the output pane; the value of the last form is shown REPL-style as
`=> …`; errors appear below it.

A static server is required, because `file://` cannot run modules or fetch the compiler — but it
needs no special headers.

## The self-hosted compiler

The 8.1 MB self-hosted bundle is committed, so a clone runs as-is. Rebuilding it against a different
ClojureScript release needs only a JVM:

```bash
npm run build:cljs-selfhost        # ~1 minute
```

That downloads the standalone `cljs.jar` from the ClojureScript release (it carries Clojure, the
Google Closure Compiler and cljs itself) and compiles the compiler. The page reports clearly if the
bundle is missing, and `?cljsBundle=<url>` points it somewhere else. Scittle needs no build — it
comes from jsDelivr.

`--simple` and `:none` are both implemented in the build script; `--simple` is the default because
it is the only mode that produces a single file, and the `:none` mode's `document.write` loader
cannot be loaded lazily. The details, and the four separate blockers that had to be fixed to get
there, are in [FINDINGS.md](FINDINGS.md) §4.

## What you get

- **Client-side compilation and execution.** Nothing is uploaded; the interpreter or the compiler
  and your program all run in the tab.
- **Real ClojureScript.** `cljs.core` data structures and seq functions, destructuring, threading
  macros, `defn`, atoms and watches, and `js/` interop.
- **Two engines, one page** — an interpreter that loads in a moment, and the genuine compiler, at
  6–30 ms per run once loaded.
- **Errors as diagnostics.** Scittle prints a formatted report with message, data, source location
  and stack trace; the self-hosted engine reports the thrown message.
- **Lazy loading.** The page itself is ~20 KB; the engine is fetched on the first Run.

## Limitations

- **The self-hosted engine cannot expand a macro defined at runtime** — `(unless true …)` runs its
  body. It is told the truth rather than left to guess: the page reports the limitation whenever it
  sees a `defmacro`. Scittle expands the same code correctly.
  See [FINDINGS.md](FINDINGS.md) §6.
- **8.1 MB for the self-hosted engine.** It works on a laptop; it is not small. Scittle is the
  small option at 944 KB.
- **No `:require` of anything not in the bundle.** The self-hosted engine's load function returns
  "not found", because a browser tab has no classpath.
- **Definitions accumulate across runs**, in both engines — the compiler state (and Scittle's
  namespace) is kept for the life of the page. That suits a playground; it is not script-per-run
  isolation.
- **No source maps, no REPL protocol, no stdio.** This is a proof of concept, not the integration.

## Layout

```
public/index.html            the harness: engine selector, editor, output, diagnostics
public/main.js               both engines behind one run() contract, plus console capture
serve.js                     static server (MIME types, no special headers)
scripts/build-selfhost.js    fetches cljs.jar and drives the build
scripts/build-selfhost.clj   the build itself (cljs.build.api)
src/selfhost/core.cljs       build entry: pulls cljs.js into the output
FINDINGS.md                  the spike log: what was run, what broke, what it means
```

There is no bundler and no `node_modules`.

## Verifying

| what | command |
| --- | --- |
| serve the page | `npm start` → http://localhost:8127/ |
| check syntax | `npm run check` |
| rebuild the compiler | `npm run build:cljs-selfhost` |
| reproduce the `:simple` failure | `node scripts/build-selfhost.js --simple` with the entry removed |

The page exposes `document.documentElement.dataset` (`status`, `engine`, `runMs`, `runs`) and its
element ids as globals, so scripted checks can read state without string literals.

## Status

Spike complete. Both engines run ClojureScript client-side, verified end to end in headless Chrome.
Runtime errors and run values now come through correctly on both. Next: host the self-hosted bundle
in `browser-compilers`, resolve the runtime-macro gap (§6 of FINDINGS.md), and add the language(s) to
LiveCodes.

## License

MIT © Hatem Hosny. Scittle, SCI and ClojureScript are EPL-1.0. See [LICENSE](LICENSE).
