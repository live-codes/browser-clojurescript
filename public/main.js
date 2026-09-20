/**
 * Runs ClojureScript in the browser with no server, with two interchangeable engines.
 *
 *   scittle           SCI (the Small Clojure Interpreter) compiled to JavaScript and
 *                     loaded from a CDN as a single script. It *interprets* ClojureScript
 *                     semantics directly. Small, and the closest fit to a script-tag
 *                     runtime, which is why LiveCodes models this shape as a `scriptType`.
 *
 *   cljs-selfhosted   The official ClojureScript compiler, self-hosted, evaluating through
 *                     `cljs.js/eval-str`. This is the real compiler (and real cljs.core)
 *                     running in the tab, but it needs a prebuilt bootstrap bundle that is
 *                     produced with the JVM toolchain. See README.md — by default the page
 *                     looks for that bundle and reports clearly if it is not there.
 *
 * Both are overridable from the query string: `?scittle=` and `?cljsBundle=`.
 */

const DEFAULT_SCITTLE_URL = 'https://cdn.jsdelivr.net/npm/scittle@0.8.32/dist/scittle.js';
const DEFAULT_CLJS_BUNDLE_URL = 'cljs-selfhost/cljs.js';

const EXAMPLES = [
  {
    name: 'Hello world',
    code: `(println "Hello from ClojureScript!")
(println "Compiled and run in your browser, with no server.")

(def greeting (str "Hi " "there"))
(println greeting)
`,
  },
  {
    name: 'Data structures and seq functions',
    code: `(def people [{:name "Ada"   :born 1815}
             {:name "Grace" :born 1906}
             {:name "Alan"  :born 1912}])

(println "names:" (map :name people))
(println "count:" (count people))

(->> people
     (sort-by :born)
     (map (fn [{:keys [name born]}] (str name " (" born ")")))
     (run! println))

;; the last form's value is shown, the way a REPL would
{:names (mapv :name people)
 :count (count people)
 :oldest (->> people (sort-by :born) first :name)}
`,
  },
  {
    name: 'Functions, threading and destructuring',
    code: `(defn mean [xs]
  (/ (reduce + xs) (count xs)))

(defn describe [{:keys [label values]}]
  (str label ": mean=" (mean values) " max=" (apply max values)))

(println (describe {:label "sample" :values [3 9 4 12 7]}))

(println (->> (range 1 11)
              (filter even?)
              (map #(* % %))
              (reduce +)))
`,
  },
  {
    name: 'Macros',
    code: `(defmacro unless [test & body]
  \`(when (not ~test) ~@body))

(unless false
  (println "unless ran, because the test was false"))

(unless true
  (println "(unless true) should have been skipped - see FINDINGS.md"))

(defmacro with-label [label & body]
  \`(do (println "---" ~label "---")
       ~@body))

(with-label "countdown"
  (println "three")
  (println "two")
  (println "one"))
`,
  },
  {
    name: 'State with atoms',
    code: `(def counter (atom 0))

(dotimes [_ 5]
  (swap! counter inc))

(println "counter:" @counter)

(def log (atom []))
(add-watch counter :log
  (fn [_ _ old new] (swap! log conj (str old "->" new))))

(reset! counter 10)
(println "watched transitions:" @log)
`,
  },
  {
    name: 'JavaScript interop',
    code: `(println "user agent:" (.. js/navigator -userAgent (slice 0 40)))

(println "now:" (.toISOString (js/Date.)))

(def obj #js {:a 1 :b 2})
(println "keys:" (js->clj (js/Object.keys obj)))
(println "sum:" (+ (.-a obj) (.-b obj)))
`,
  },
  {
    name: 'An error (shown as diagnostics)',
    code: `(defn divide [a b]
  (if (zero? b)
    (throw (ex-info "cannot divide by zero" {:a a :b b}))
    (/ a b)))

(println "this far")
(println "result:" (divide 10 0))
(println "unreachable")
`,
  },
];

const params = new URLSearchParams(location.search);

const resolveUrl = (param, fallback) => {
  const override = (params.get(param) ?? '').trim();
  return { url: override === '' ? fallback : override, isOverride: override !== '' };
};

const scittleSource = resolveUrl('scittle', DEFAULT_SCITTLE_URL);
const cljsBundle = resolveUrl('cljsBundle', DEFAULT_CLJS_BUNDLE_URL);

const el = {
  editor: document.getElementById('editor'),
  engine: document.getElementById('engine'),
  engineNote: document.getElementById('engine-note'),
  examples: document.getElementById('examples'),
  run: document.getElementById('run'),
  clear: document.getElementById('clear'),
  status: document.getElementById('status'),
  duration: document.getElementById('duration'),
  progress: document.getElementById('progress'),
  progressText: document.getElementById('progress-text'),
  progressHint: document.getElementById('progress-hint'),
  output: document.getElementById('output'),
  diagnostics: document.getElementById('diagnostics'),
  runtimeUrl: document.getElementById('runtime-url'),
  runtimeOverride: document.getElementById('runtime-override'),
};

// The browser probes drive the page by element id rather than by evaluating
// string literals, which some shells mangle when passing arguments.
Object.assign(window, el);

let running = false;

function setStatus(token, label, kind = '') {
  el.status.textContent = label;
  el.status.className = `badge ${kind}`;
  document.documentElement.dataset.status = token;
}

function setProgress(text, hint = '') {
  el.progress.hidden = text === null;
  if (text !== null) {
    el.progressText.textContent = text;
    el.progressHint.textContent = hint;
  }
}

function append(node, text) {
  if (!text) return;
  node.appendChild(document.createTextNode(text));
  node.scrollTop = node.scrollHeight;
}

function clearOutput() {
  el.output.replaceChildren();
  el.diagnostics.replaceChildren();
  el.duration.textContent = '';
}

/** Load a classic script once, and resolve when it has run. */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`could not load ${src}`));
    document.head.appendChild(script);
  });
}

// ---------------------------------------------------------------------------
// Engine: scittle
// ---------------------------------------------------------------------------

let scittleApi = null;
let clojurePrinter = null;

async function ensureScittle() {
  if (scittleApi) return scittleApi;
  setStatus('loading', 'loading Scittle…', 'busy');
  setProgress('Downloading the Small Clojure Interpreter…', 'fetched once from jsDelivr, then cached');
  await loadScript(scittleSource.url);
  setProgress(null);

  const core = globalThis.scittle?.core;
  if (!core?.eval_string) {
    throw new Error('scittle loaded, but scittle.core.eval_string is missing');
  }
  // The page drives evaluation itself; scittle's own script-tag pass would
  // find nothing here anyway, but saying so is clearer than relying on that.
  core.disable_auto_eval();
  // A Clojure printer, so results look like Clojure (`:kw`, `"str"`, `[1 2]`)
  // rather than whatever JavaScript would print.
  clojurePrinter = core.eval_string('(fn [x] (pr-str x))');
  scittleApi = core;
  return core;
}

async function runScittle(code, io) {
  const core = await ensureScittle();
  const captured = captureConsole(io);

  try {
    // Scittle runs every form in the string and returns the value of the last,
    // which is the REPL convention rather than the script-tag one.
    const value = core.eval_string(code);
    io.result(value);
  } catch (error) {
    // Scittle's own error handler has already rendered a formatted stack trace;
    // only add a line when it did not reach the console.
    if (!captured.sawError) io.diagnostic(`${error?.message ?? error}`);
    io.failed = true;
  } finally {
    captured.restore();
  }
}

// ---------------------------------------------------------------------------
// Engine: cljs-selfhosted
// ---------------------------------------------------------------------------

let selfHosted = null;

function missingBundle(location) {
  return new Error(
    `The self-hosted ClojureScript compiler bundle is not available at ${location}.\n\n` +
      'The bundle is ~8 MB, so it is built rather than committed. Build it with\n' +
      '  npm run build:cljs-selfhost\n' +
      '(needs a JVM only), or point the page at a bundle of your own with ?cljsBundle=<url>.',
  );
}

/** Call something that may not accept this value, falling back if it does not. */
function attempt(fn, fallback) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

async function ensureSelfHosted() {
  if (selfHosted) return selfHosted;

  if (!globalThis.cljs?.js) {
    setStatus('loading', 'loading the compiler…', 'busy');
    setProgress('Downloading the self-hosted ClojureScript compiler…', cljsBundle.url);
    try {
      await loadScript(cljsBundle.url);
    } catch {
      throw missingBundle(cljsBundle.url);
    } finally {
      setProgress(null);
    }
  }

  const js = globalThis.cljs?.js;
  const core = globalThis.cljs?.core;
  const reader = globalThis.cljs?.tools?.reader;
  const readerTypes = reader?.reader_types;
  if (
    !js?.eval ||
    !js?.eval_str ||
    !js?.read ||
    !core?.array_map ||
    !readerTypes?.indexing_push_back_reader
  ) {
    throw missingBundle(cljsBundle.url);
  }

  // `eval-str` installs these for its own reader (see `eval-str*` in cljs/js.cljs).
  // Reading forms here needs the same environment, or `#js` has no reader function.
  reader._STAR_data_readers_STAR_ = globalThis.cljs.tagged_literals._STAR_cljs_data_readers_STAR_;
  // cljs.js' own `resolve-symbol` calls `cljs.analyzer/resolve-symbol`, which
  // reads the ambient compiler environment — bound only while an eval is in
  // flight, so it throws "IDeref … for type null" if used to read here. Passing
  // the symbol through leaves qualification to the analyzer, which resolves it in
  // the namespace the form is evaluated in. The compiler's own reads are
  // unaffected: `eval-str*` binds this var, and a binding beats the root value.
  reader.resolve_symbol = (symbol) => symbol;

  selfHosted = {
    js,
    core,
    readerTypes,
    // One compiler state for the life of the page. `empty-state` carries the
    // whole cljs.core analysis cache, so rebuilding it per run would be both
    // wasteful and a behaviour change: definitions accumulate across runs, the
    // same way they do under Scittle.
    state: js.empty_state(),
  };
  return selfHosted;
}

/**
 * Creates the global object a namespace compiles into.
 *
 * The compiler emits `cljs.user.x = ...` for a top-level `def`, and evaluates it
 * as-is. In a normal build that object is created by the namespace's own compiled
 * module, but nothing here ever loaded a compiled `cljs.user` — so without this,
 * the very first `def` throws `Cannot set properties of undefined` and silently
 * takes every later form in the same run down with it.
 */
function ensureGlobalNamespace(path) {
  let target = globalThis;
  for (const part of path.split('.')) {
    if (!target[part]) target[part] = {};
    target = target[part];
  }
}

/** Is this form a `(defmacro …)`? Head position only, which is all a reader gives us. */
function definesMacro(core, form) {
  try {
    return core.name(core.first(form)) === 'defmacro';
  } catch {
    return false;
  }
}

/**
 * cljs.js reports a wrapper whose message is just "ERROR" — the exception the
 * program actually threw is at the end of its cause chain.
 */
function describeError(error) {
  let message = null;
  for (let current = error; current; current = current.cause) {
    if (current.message) message = String(current.message);
  }
  return message ?? String(error);
}

async function runSelfHosted(code, io) {
  const { js, core, readerTypes, state } = await ensureSelfHosted();
  const captured = captureConsole(io);

  // The namespace `eval` evaluates into when none is given (`cljs.user`).
  ensureGlobalNamespace('cljs.user');

  // cljs.js guards its options with `(defn- valid-opts? [x] (or (nil? x) (map? x)))`,
  // so this has to be a real ClojureScript map. A JS object literal fails it.
  const keyword = (name) => core.keyword(null, name);
  const opts = core.array_map(
    keyword('eval'),
    js.js_eval,
    keyword('load'),
    // Nothing is on disk in a browser tab, so the only namespaces that can be
    // resolved are the ones already compiled into the bundle.
    (request, callback) => callback({ lang: 'js', source: '', success: false }),
  );

  // Results are ClojureScript maps, so their keys have to be read with keyword
  // lookup: `result.error` is always undefined, which is how every runtime error
  // from user code used to be dropped on the floor, and why a run's value never
  // reached the output pane either.
  const errorOf = (result) => core.get(result, keyword('error'));
  const valueOf = (result) => core.get(result, keyword('value'));
  const evalForm = (form) => new Promise((resolve) => js.eval(state, form, opts, resolve));

  try {
    // One form at a time, the way a REPL does it — and here that is not a
    // preference. `eval-str` analyzes every form in a string before evaluating
    // any of them, so a `defmacro` cannot affect the forms that follow it:
    // batched, the macro compiles as an ordinary function call, its body is
    // evaluated as an argument, and it runs unconditionally whatever the test.
    const reader = readerTypes.indexing_push_back_reader(code);
    const eof = {};
    let value;
    let notedMacroLimitation = false;

    for (;;) {
      const form = js.read(eof, reader);
      if (form === eof) break;

      // Reported rather than silently wrong. A runtime `defmacro` is compiled as an
      // ordinary function call here, so the macro body is evaluated as an argument
      // and runs whatever the test says. See FINDINGS.md §6 for how far this was
      // chased: re-interning the namespace does populate the analyzer's macro map,
      // and expansion still does not happen.
      if (!notedMacroLimitation && definesMacro(core, form)) {
        notedMacroLimitation = true;
        io.diagnostic(
          'note: this engine cannot use a macro defined at runtime. `defmacro` compiles to an\n' +
            'ordinary function call, so the macro body is evaluated as an argument and runs\n' +
            'whatever the test says. The Scittle engine runs the same code correctly;\n' +
            'see FINDINGS.md §6.\n',
        );
      }

      const result = await evalForm(form);
      const error = errorOf(result);
      if (error) {
        io.diagnostic(`${describeError(error)}\n`);
        io.failed = true;
        return;
      }
      value = valueOf(result);
    }

    // Printed with Clojure's printer, so a map comes out as `{:a 1}` rather than
    // `#object[Object …]`, and `nil` is left out the way Scittle leaves it out.
    if (value !== null && value !== undefined) {
      io.result(attempt(() => core.pr_str(value), String(value)));
    }
  } catch (error) {
    if (!captured.sawError) io.diagnostic(`${error?.message ?? error}\n`);
    io.failed = true;
  } finally {
    captured.restore();
  }
}

// ---------------------------------------------------------------------------
// Output capture
// ---------------------------------------------------------------------------

/**
 * Both engines print through ClojureScript's `*print-fn*`, which ends up at the
 * console, so the console is the capture point for program output.
 */
function captureConsole(io) {
  const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };
  const captured = { sawError: false, restore: () => Object.assign(console, original) };

  const toText = (args) => {
    const line = args.map(stringify).join(' ');
    return line.endsWith('\n') || line === '' ? `${line}` : `${line}\n`;
  };

  // Program output always goes to the output pane. Only warnings and errors are
  // recorded as diagnostics, and `sawError` purely means "the engine already said
  // something", so the catch blocks below can avoid repeating it — it must not
  // gate stdout, or a single analyzer warning (a shadowed name, say) swallows
  // everything the program prints.
  console.log = console.info = (...args) => io.stdout(toText(args));
  console.warn = console.error = (...args) => {
    captured.sawError = true;
    io.diagnostic(toText(args));
  };

  return captured;
}

function stringify(value) {
  if (typeof value === 'string') return value;
  try {
    return clojurePrinter ? clojurePrinter(value) : String(value);
  } catch {
    return String(value);
  }
}

// ---------------------------------------------------------------------------
// Engines registry
// ---------------------------------------------------------------------------

const ENGINES = {
  scittle: {
    label: 'Scittle (SCI interpreter)',
    note: 'SCI — the Small Clojure Interpreter — compiled to JS. Interprets ClojureScript; not the real compiler.',
    run: runScittle,
    source: () => scittleSource,
  },
  'cljs-selfhosted': {
    label: 'ClojureScript (self-hosted compiler)',
    note: 'The official compiler, self-hosted via cljs.js/eval-str — the real thing, and a much larger download.',
    run: runSelfHosted,
    source: () => cljsBundle,
  },
};

const currentEngine = () => ENGINES[el.engine.value];

function showEngineSource() {
  const engine = currentEngine();
  const source = engine.source();
  el.engineNote.textContent = engine.note;
  el.runtimeUrl.textContent = source.url;
  el.runtimeOverride.textContent = source.isOverride ? '(from the query string)' : '(default)';
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function run() {
  if (running) return;

  const source = el.editor.value;
  if (source.trim() === '') return;

  running = true;
  el.run.disabled = true;
  clearOutput();
  for (const key of ['engine', 'stage', 'runMs']) delete document.documentElement.dataset[key];

  const engine = currentEngine();
  const io = {
    failed: false,
    stdout: (text) => append(el.output, text),
    diagnostic: (text) => append(el.diagnostics, text),
    result: (value) => {
      if (value === undefined || value === null) return;
      const rendered = stringify(value);
      append(el.output, `=> ${rendered}${rendered.endsWith('\n') ? '' : '\n'}`);
    },
  };

  setStatus('running', 'running…', 'busy');
  const started = performance.now();
  try {
    await engine.run(source, io);
    setStatus(io.failed ? 'error' : 'done', io.failed ? 'error' : 'done', io.failed ? 'err' : 'ok');
  } catch (error) {
    setProgress(null);
    io.diagnostic(`${error?.message ?? error}\n`);
    setStatus('error', 'failed', 'err');
  } finally {
    running = false;
    el.run.disabled = false;
    el.duration.textContent = `${Math.round(performance.now() - started)} ms`;
    document.documentElement.dataset.engine = el.engine.value;
    document.documentElement.dataset.runMs = String(Math.round(performance.now() - started));
    document.documentElement.dataset.runs = String(
      Number(document.documentElement.dataset.runs ?? 0) + 1,
    );
  }
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------

for (const [id, engine] of Object.entries(ENGINES)) {
  el.engine.append(new Option(engine.label, id));
}

EXAMPLES.forEach((example, index) => {
  el.examples.append(new Option(example.name, String(index)));
});

function loadExample(index) {
  el.editor.value = EXAMPLES[index].code;
  el.examples.value = String(index);
}

el.engine.addEventListener('change', showEngineSource);
el.examples.addEventListener('change', () => loadExample(Number(el.examples.value)));
el.run.addEventListener('click', run);
el.clear.addEventListener('click', clearOutput);
el.editor.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    run();
  }
});

showEngineSource();
document.documentElement.dataset.status = 'ready';
loadExample(0);
