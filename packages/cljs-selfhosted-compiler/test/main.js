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
    name: 'a macro named after a core macro leaves core macros alone',
    // Exposing user macros used to write into cljs.core$macros, replacing the core macro
    // of the same name. `when-let` expands through core macros, so it is the canary.
    code: '(defmacro when [test & body] :user-defined)\n(println (when-let [x 1] (inc x)))\n(println (->> [1 2] (map inc)))',
    expect: ['2', '(2 3)'],
    absent: [':user-defined'],
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
    const compiled = await ask({ code: testCase.code });
    const warnings = compiled.warnings || [];
    const ran = compiled.code ? runInPage(compiled.code) : { printed: [], error: null };
    const all = [ran.printed.join('\n'), compiled.error, ran.error].filter(Boolean).join('\n');

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
