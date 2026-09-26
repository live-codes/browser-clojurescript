/**
 * The harness: compile each case in the classic worker, then run the JavaScript it
 * returns in this page, against the page-side runtime only.
 *
 * Runs on demand (`window.runHarness()` or the button) rather than on load, so the
 * page stays responsive while a case is compiling. Results are rendered and also
 * exposed on `document.documentElement.dataset` for scripted checks.
 */

// --- prepare the page for compiled output -----------------------------------

// The compiler emits `cljs.user.x = …` for a top-level def and evaluates it as-is,
// so that namespace object has to exist or the first def throws and takes the rest
// of the program with it. A compiled build gets this from its own module.
window.cljs = window.cljs || {};
window.cljs.user = window.cljs.user || {};

// --- the cases ---------------------------------------------------------------

const CASES = [
  {
    // First on purpose: if this passes here but failed when it ran after the other
    // cases, the analyzer is caching something that the macro step needs to invalidate.
    name: 'a macro defined at runtime is expanded',
    code: '(defmacro unless [test & body]\n  `(when (not ~test) ~@body))\n(unless false (println "unless ran"))\n(unless true (println "SHOULD NOT PRINT"))',
    expect: ['unless ran'],
    absent: ['SHOULD NOT PRINT'],
  },
  {
    name: 'the same macro again, in the same worker',
    // The regression guard: this failed while the first run passed, because a macro
    // already exposed poisons the lookup when its `defmacro` is evaluated again.
    code: '(defmacro unless [test & body]\n  `(when (not ~test) ~@body))\n(unless false (println "second run ran"))\n(unless true (println "SHOULD NOT PRINT"))',
    expect: ['second run ran'],
    absent: ['SHOULD NOT PRINT'],
  },
  {
    name: "a macro declared in the source's own namespace is expanded",
    // The namespace case, which every other macro case here misses by staying in the
    // implicit `cljs.user`. Macro dispatch consults `:use-macros` of the namespace the
    // form is compiled *in*, so a macro registered on `cljs.user` while the source
    // declares `(ns starter.core …)` is never found: it compiles as an undeclared Var
    // and the emitted call throws at run time. Requiring clojure.string here also checks
    // the declared namespace is used for the whole compile, not just macro registration.
    code: "(ns starter.core (:require [clojure.string :as string]))\n(defmacro unless [test & body]\n  `(when-not ~test ~@body))\n(unless false (println \"namespace macro ran\"))\n(unless true (println \"SHOULD NOT PRINT\"))\n(println (string/upper-case \"declared\"))",
    expect: ['namespace macro ran', 'DECLARED'],
    absent: ['SHOULD NOT PRINT'],
  },
  {
    name: 'a macro named after a core macro leaves core macros alone',
    // Exposing user macros used to write into cljs.core$macros, replacing the core macro
    // of the same name. `when-let` expands through core macros, so it is the canary.
    code: '(defmacro when [test & body] :user-defined)\n(println (when-let [x 1] (inc x)))\n(println (->> [1 2] (map inc)))',
    expect: ['2', '(2 3)'],
    absent: [':user-defined'],
  },
  {
    // A dash in the macro's name. The evaluated macro is a JavaScript property
    // (`cljs.user.with_log`) while the analyzer's symbol is `with-log`, so exposing it
    // turns on `demunge` recovering the symbol the dispatch map is keyed by. This is the
    // cljs.user path; the declared-namespace path is the next case, because the two
    // differ in which namespace's `:use-macros` is read.
    name: 'a macro whose name contains a dash is expanded',
    code: '(defmacro with-log [x & body]\n  `(do (println "start" ~x) ~@body (println "end")))\n(with-log 1 (println "mid"))',
    expect: ['start 1', 'mid', 'end'],
  },
  {
    // The same dash, in a source that declares its own namespace — so the name has to
    // survive munging, demunging *and* being registered on a namespace other than
    // cljs.user.
    name: 'a dashed macro in a declared namespace is expanded',
    code: '(ns starter.dash)\n(defmacro with-log [x & body]\n  `(do (println "start" ~x) ~@body (println "end")))\n(with-log 1 (println "mid"))',
    expect: ['start 1', 'mid', 'end'],
  },
  {
    // The same dash, but in the *namespace name* — the other half of the munge round-trip.
    // The emitted JavaScript is `starter.my_app.with_log = …`, so the namespace object the
    // pre-pass must create (and later scan) is the munged one; building it from the name as
    // written created `starter['my-app']` instead, the macro eval threw "Cannot set
    // properties of undefined", and every macro in the namespace silently went missing.
    name: 'a macro in a namespace whose name contains a dash is expanded',
    code: '(ns starter.my-app)\n(defmacro with-log [x & body]\n  `(do (println "start" ~x) ~@body (println "end")))\n(with-log 1 (println "mid"))',
    expect: ['start 1', 'mid', 'end'],
  },
  {
    // A macro whose body calls another user macro. Macro dispatch happens while the
    // calling body is analysed, so the callee has to be a macro by then; exposing every
    // macro only after the whole pre-pass had evaluated them left `inc1` as an ordinary
    // call, which compiled to `(+ nil 1)` and printed 1. The fix publishes each macro as
    // it is evaluated.
    name: 'a macro body can call another user macro',
    code: '(defmacro inc1 [x] `(+ ~x 1))\n(defmacro add3 [x] (inc1 (inc1 (inc1 x))))\n(println (add3 10))',
    expect: ['13'],
  },
  {
    // Several macros in one compile, one of which expands into the others.
    name: 'several macros in one compile expand',
    code: '(defmacro inc1 [x] `(+ ~x 1))\n(defmacro dbl [x] `(* ~x 2))\n(defmacro both [x] `(+ (inc1 ~x) (dbl ~x)))\n(println (inc1 1))\n(println (dbl 10))\n(println (both 5))',
    expect: ['2', '20', '16'],
  },
  {
    // A macro used away from top level: inside a fn body, inside a let, and nested
    // inside another use of itself.
    name: 'a macro used inside a fn, a let and another macro',
    code: '(defmacro twice [x] `(+ ~x ~x))\n(defn f [n] (twice n))\n(println (f 21))\n(let [a 10] (println (twice a)))\n(println (twice (twice 1)))',
    expect: ['42', '20', '4'],
  },
  {
    // A macro that generates a top-level var. The expansion is analysed in place, so a
    // `def`/`defn` inside it has to land as a top-level definition.
    name: 'a macro that expands to a def and a defn',
    code: '(defmacro defanswer [n v] `(def ~n ~v))\n(defanswer answer 42)\n(println answer)\n(defmacro defsq [n] `(defn ~n [x] (* x x)))\n(defsq sq)\n(println (sq 7))',
    expect: ['42', '49'],
  },
  {
    // &form is the whole call and &env is the analyzer env (not a locals map, as in
    // Clojure — the lexical bindings live under its :locals key). Both are populated in
    // self-hosted mode, so a macro may read either.
    name: 'a macro may use &form and &env',
    code: '(defmacro where [x] `(println "form:" ~(str &form)))\n(defmacro env-n [x] `(println "env-locals:" ~(count (:locals &env))))\n(where 1)\n(env-n 2)\n(let [a 1 b 2] (env-n 3))',
    expect: ['form: (where 1)', 'env-locals: 0', 'env-locals: 2'],
  },
  {
    // NOT a gap here: `defmacro` prepends &form/&env itself, so naming them in the
    // argument vector adds two more parameters. The JVM rejects the same source with
    // "Wrong number of args (3) passed to: user/plus1"; self-hosted instead produces
    // `null + 1`, because JavaScript does not check arity. Recorded, not asserted —
    // the source is invalid Clojure, so there is nothing for the wrapper to fix.
    name: 'the invalid [&form &env x] argument vector',
    note: true,
    code: '(defmacro plus1 [&form &env x] `(+ ~x 1))\n(println (plus1 41))',
  },
  {
    // A docstring, `^:private` metadata and multiple arities are all just parts of the
    // `defmacro` form the pre-pass evaluates, so all three have to survive.
    name: 'a macro with a docstring, metadata and several arities',
    code: '(defmacro with-doc "Adds one." [x] `(+ ~x 1))\n(defmacro ^:private priv-m [x] `(* ~x 2))\n(defmacro ar ([x] `(+ ~x 1)) ([x y] `(+ ~x ~y 1)))\n(println (with-doc 1))\n(println (priv-m 3))\n(println (ar 1))\n(println (ar 1 2))',
    expect: ['2', '6', '2', '4'],
  },
  {
    // A macro that throws while expanding is a compile-time failure, so it has to become
    // a diagnostic in info.errors and fail the compile — not hang the worker or take the
    // page down with it.
    name: 'a macro that throws at expansion time fails the compile',
    code: '(defmacro boom [x] (throw (ex-info "kaboom" {})))\n(println (boom 1))',
    expectError: true,
  },
  {
    // Each compile gets a fresh compiler state, and the macro pre-pass runs per compile,
    // so a macro from a previous run is simply not there. Recorded, not asserted: run 2
    // reports an undeclared Var (`m`), which means the wrapper did not throw — the
    // emitted call to `cljs.user.m` then fails in the page, as any undeclared call would.
    // `runs` compiles each source in turn on the same worker, the way LiveCodes would.
    name: 'a macro defined in one run is not available in the next',
    note: true,
    runs: [
      '(defmacro m [x] `(+ ~x 1))\n(println (m 1))',
      '(println (m 5))',
    ],
  },
  {
    // Auto-gensyms: the same `v#` repeated in one syntax-quote has to be one gensym
    // (or the let would bind a name the body never sees), and it has to be distinct from
    // any user local that happens to share the printed name.
    name: 'syntax-quote auto-gensyms stay hygienic',
    code: '(defmacro twice-g [x] `(let [v# ~x] (+ v# v#)))\n(defmacro add-one [x] `(let [v# 1] (+ v# ~x)))\n(println (twice-g 21))\n(let [v 10] (println (add-one v)))',
    expect: ['42', '11'],
  },
  {
    // The pre-pass recognises only top-level `defmacro` forms, so a nested one is compiled
    // as an ordinary `def` (which marks the var a macro at run time) and the call to it is
    // never expanded — it becomes a plain function call whose `&form` argument is the real
    // argument. Recorded, not asserted; see the README's limitation note.
    name: 'a defmacro nested inside (do ...) is not expanded',
    note: true,
    code: '(do (defmacro m [x] `(+ ~x 1)) (println (m 1)))',
  },
  {
    name: 'println and a top-level def',
    code: '(println "hello from compiled js")\n(def x 41)\n(println "x + 1 =" (inc x))',
    expect: ['hello from compiled js', 'x + 1 = 42'],
  },
  {
    name: 'data structures and seq functions',
    code: '(println (map inc [1 2 3]))\n(println (->> {:a 1 :b 2} (map val) (reduce +)))',
    expect: ['(2 3 4)', '3'],
  },
  {
    name: 'require clojure.string',
    code: "(require '[clojure.string :as str])\n(println (str/upper-case \"abc\"))\n(println (str/join \"-\" [1 2 3]))",
    expect: ['ABC', '1-2-3'],
  },
  {
    name: 'require clojure.set',
    // sorted, because a set's print order is hash order
    code: "(require '[clojure.set :as set])\n(println (sort (set/union #{1 2} #{3})))",
    expect: ['(1 2 3)'],
  },
  {
    name: 'require clojure.walk',
    code: "(require '[clojure.walk :as walk])\n(println (walk/postwalk (fn [x] (if (number? x) (inc x) x)) [1 2 3]))",
    expect: ['[2 3 4]'],
  },
  {
    name: 'require clojure.edn',
    code: "(require '[clojure.edn :as edn])\n(println (edn/read-string \"{:a 1 :b [2 3]}\"))",
    expect: [':a 1', ':b [2 3]'],
  },
  {
    name: 'require cljs.pprint',
    code: "(require '[cljs.pprint :as pp])\n(pp/pprint {:a 1 :b [1 2 3]})",
    expect: [':a 1'],
  },
  {
    // clojure.core.reducers was already *served* — its source was in lib-files —
    // but not compiled into the page runtime, so the require resolved and the
    // generated call then threw on an undefined `clojure.core.reducers`. It is a
    // reducer (a reified cljs.core/IReduce) as well as fold, so this checks both
    // the runtime object and the protocol it implements.
    name: 'require clojure.core.reducers',
    code: "(require '[clojure.core.reducers :as r])\n(println (r/reduce + 0 (r/map inc [1 2 3 4])))\n(println (r/fold + [1 2 3 4]))",
    expect: ['14', '10'],
  },
  {
    // Same half-install bug as clojure.core.reducers: served, but not in the page.
    name: 'require clojure.core.protocols',
    code: "(require '[clojure.core.protocols :as p])\n(println (p/nav {:a 1} :a 2))\n(println (p/datafy 41))",
    expect: ['2', '41'],
  },
  {
    name: 'require clojure.data',
    // diff returns [in-a-only in-b-only in-both], printed as one seq.
    code: "(require '[clojure.data :as data])\n(println (data/diff {:a 1 :b 2} {:a 1 :c 3}))",
    expect: ['{:b 2}', '{:c 3}', '{:a 1}'],
  },
  {
    name: 'require clojure.zip',
    code: "(require '[clojure.zip :as z])\n(def zloc (z/vector-zip [10 [20 30]]))\n(println (z/node (z/next zloc)))\n(println (z/root (z/edit (z/next zloc) inc)))",
    expect: ['10', '[11 [20 30]]'],
  },
  {
    // datafy is a second port that leans on clojure.core.protocols (above): it
    // needs that protocol to be in the page, and the Datafiable protocol it
    // implements is what `datafy`/`nav` dispatch on.
    name: 'require clojure.datafy',
    code: "(require '[clojure.datafy :as df])\n(println (df/datafy [1 2 3]))\n(println (df/nav {:a 1} :a 2))",
    expect: ['[1 2 3]', '2'],
  },
  {
    // cljs.math is the ClojureScript wrapper over the JS Math object and needs
    // nothing else, so a failure here would mean the runtime half was missing.
    name: 'require cljs.math',
    code: "(require '[cljs.math :as m])\n(println (m/sqrt 16))\n(println (m/floor 2.9))\n(println (m/ceil 2.1))",
    expect: ['4', '2', '3'],
  },
  {
    // cljs.proxy's `proxy` function wraps a map in a real JS Proxy and backs
    // `this-as`. It is not cljs.core/proxy: r1.12.145's cljs.core excludes
    // proxy/proxy-super, so `(proxy ...)` never compiles. Its impl half must be in
    // the page too, which is what the `aget` on the proxied map checks.
    name: 'require cljs.proxy',
    code: "(require '[cljs.proxy :as pr])\n(def m (pr/proxy {:a 1 :b 2}))\n(println (aget m \"a\"))",
    expect: ['1'],
  },
  {
    // cljs.stacktrace ships as a .cljc only and needs goog.string, which is in
    // the page runtime transitively.
    name: 'require cljs.stacktrace',
    code: "(require '[cljs.stacktrace :as st])\n(println (st/parse-file-line-column \"foo.cljs:10:20\"))",
    expect: ['[foo.cljs 10 20]'],
  },
  {
    // Bucket 4: cljs.reader's sibling — the reader the analyzer itself uses is
    // reported loaded (LOADED_ALREADY) and the page runtime has it, so a user may
    // require it, even though it was never documented.
    name: 'require cljs.tools.reader',
    code: "(require '[cljs.tools.reader :as tr])\n(println (tr/read-string \"[1 2 3]\"))",
    expect: ['[1 2 3]'],
  },
  {
    name: 'require cljs.tools.reader.edn',
    code: "(require '[cljs.tools.reader.edn :as edn])\n(println (edn/read-string \"{:a 1 :b [2 3]}\"))",
    expect: [':a 1', ':b [2 3]'],
  },
  {
    // clojure.pprint is a trap, not a supported library: it *resolves* (the
    // load-fn's clojure/ -> cljs/ fallback serves cljs/pprint.cljs) but compiles
    // calls to `clojure.pprint.*`, which no page global provides. Recorded, not
    // asserted: the compile succeeds and the page throws. Use cljs.pprint.
    name: 'clojure.pprint resolves but throws in the page',
    note: true,
    code: "(require '[clojure.pprint :as pp])\n(println (some? pp/pprint))",
  },
  {
    // cljs.test is not supported and is not claimed to be. This pins the exact
    // blocker: its runtime half requires-macros clojure.template and itself, and
    // expanding cljs.test$macros/cljs-output-dir calls cljs.analyzer.api/get-options
    // against a compiler env that does not exist in the macro-eval context.
    name: 'requiring cljs.test fails on its macros half (cljs-output-dir)',
    expectError: true,
    code: "(require '[cljs.test :as t])\n(println (some? t/is))",
  },
  {
    // Pins down the LOADED_ALREADY finding: the load-fn reports cljs.reader as
    // loaded, and that is right — the page runtime has it, pulled in transitively
    // by clojure.edn (clojure.edn -> cljs.reader -> cljs.tools.reader.edn).
    name: 'require cljs.reader (reported loaded, and the page has it)',
    code: "(require '[cljs.reader :as reader])\n(println (reader/read-string \"[1 2 3]\"))",
    expect: ['[1 2 3]'],
  },
  {
    // The other half of that finding: cljs.spec.alpha is in the *compiler* bundle,
    // so the load-fn used to report it as loaded. The compile succeeded and the
    // page then threw `Cannot read properties of undefined (reading 'alpha')`. It
    // is not in the page runtime and cannot be — cljs.spec.alpha requires
    // cljs.analyzer and cljs.env — so the load-fn no longer claims it, and the
    // require now fails cleanly with "No such namespace" instead.
    name: 'requiring cljs.spec.alpha fails cleanly rather than in the page',
    code: "(require '[cljs.spec.alpha :as s])\n(println (s/valid? int? 1))",
    expectError: true,
  },
  {
    name: 'an unsupported require fails rather than hangs',
    code: "(require '[some.library.that.does.not.exist :as nope])\n(println :never)",
    expectError: true,
  },
  {
    name: 'a deliberate compile error',
    code: '(println "unclosed"',
    expectError: true,
  },
];

// --- run ---------------------------------------------------------------------

const report = document.getElementById('report');
const output = [];

const log = (line) => {
  output.push(line);
  report.textContent = output.join('\n');
};

/** Run compiled JavaScript in this page, collecting what it prints. */
function runInPage(js) {
  const printed = [];
  const original = { log: console.log, error: console.error, warn: console.warn };
  const collect = (...args) => printed.push(args.map(String).join(' '));
  console.log = collect;
  console.error = collect;
  console.warn = collect;
  let error = null;
  try {
    (0, eval)(js);
  } catch (e) {
    error = String((e && e.message) || e);
  }
  Object.assign(console, original);
  return { printed, error };
}

const ASK_TIMEOUT_MS = 30000;

let worker = null;
let nextId = 0;
let pending = new Map();

function startWorker() {
  worker = new Worker('./worker.js');
  pending = new Map();
  worker.onmessage = (event) => {
    const resolve = pending.get(event.data.id);
    if (resolve) {
      pending.delete(event.data.id);
      resolve(event.data);
    }
  };
  // Without this a worker that fails to load just leaves every case pending, and
  // the harness hangs with no explanation.
  worker.onerror = (event) => {
    const message = String(event.message || 'worker failed to load');
    document.documentElement.dataset.workerError = message;
    report.textContent = `worker error: ${message}\n${event.filename || ''}:${event.lineno || ''}`;
    for (const resolve of pending.values()) resolve({ error: message, code: '', warnings: [] });
    pending.clear();
  };
}

const ask = (payload) =>
  new Promise((resolve) => {
    const id = ++nextId;
    const timer = setTimeout(() => {
      pending.delete(id);
      resolve({ error: `timed out after ${ASK_TIMEOUT_MS} ms`, code: '', warnings: [] });
    }, ASK_TIMEOUT_MS);
    pending.set(id, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
    worker.postMessage({ id, ...payload });
  });

async function runHarness() {
  output.length = 0;
  delete document.documentElement.dataset.done;
  startWorker();

  const probe = await ask({ probe: true });
  log(
    `worker: document=${probe.probe.hasDocument} window=${probe.probe.hasWindow} ` +
      `importScripts=${probe.probe.hasImportScripts}`,
  );
  log(`page: has compiler? cljs.js=${typeof (window.cljs && window.cljs.js)}`);
  log('');

  const results = [];

  for (const testCase of CASES) {
    // A case is normally one source. `runs` compiles several sources in turn on the same
    // worker — separate compiles, so the second sees a fresh compiler state — which is the
    // only way to observe that a definition from one run does not outlive it.
    const sources = testCase.runs || [testCase.code];
    const warnings = [];
    const parts = [];
    let compiled = null;
    let ran = { printed: [], error: null };
    for (const source of sources) {
      compiled = await ask({ code: source });
      warnings.push(...(compiled.warnings || []));
      ran = compiled.code ? runInPage(compiled.code) : { printed: [], error: null };
      parts.push(ran.printed.join('\n'), compiled.error, ran.error);
    }
    const all = parts.filter(Boolean).join('\n');

    let pass;
    if (testCase.expectError) {
      // A failed compile returns no code and reports through info.errors.
      pass = !compiled.code && (warnings.length > 0 || Boolean(compiled.error));
    } else if (testCase.note) {
      pass = null;
    } else {
      pass =
        Boolean(compiled.code) &&
        testCase.expect.every((needle) => all.includes(needle)) &&
        (testCase.absent || []).every((needle) => !all.includes(needle)) &&
        !ran.error;
    }

    results.push({ name: testCase.name, pass, error: compiled.error || ran.error || null });

    const mark = pass === null ? '.' : pass ? 'PASS' : 'FAIL';
    log(`${mark.padEnd(5)} ${testCase.name}  (${compiled.compileMs ?? '-'} ms)`);
    for (const line of String(all).split('\n')) log(`        ${line}`);
    for (const warning of compiled.warnings || []) log(`        warn: ${warning.trim()}`);
    log('');
  }

  const passed = results.filter((r) => r.pass === true).length;
  const failed = results.filter((r) => r.pass === false).length;
  log(`${passed} passed, ${failed} failed`);

  document.documentElement.dataset.done = 'true';
  document.documentElement.dataset.passed = String(passed);
  document.documentElement.dataset.failed = String(failed);
  document.documentElement.dataset.failing = results
    .filter((r) => r.pass === false)
    .map((r) => r.name)
    .join(' | ');
  window.results = results;

  navigator.sendBeacon(
    '/report',
    new Blob([`${passed} passed, ${failed} failed\n${output.join('\n')}`], { type: 'text/plain' }),
  );
}

window.runHarness = runHarness;
document.getElementById('run').addEventListener('click', runHarness);

// ?autorun lets a scripted check drive the harness without an eval, which matters
// because an eval that kicks off background fetches waits on network idle.
if (new URLSearchParams(location.search).has('autorun')) runHarness();
