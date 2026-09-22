var CljsSelfHosted = (function () {
/**
 * The self-hosted ClojureScript compiler, wrapped for use as a LiveCodes compiler.
 *
 *   const compiler = await createCljsCompiler({ baseUrl });
 *   const { code, info } = await compiler.compile(cljsSource, options);
 *
 * `baseUrl` addresses the package's own assets: `cljs.js` (the compiler) and
 * `libs/**` (the sources its load-fn serves).
 *
 * It is built as an IIFE so it can be `importScripts`-ed into a CLASSIC web worker
 * — which is what LiveCodes uses, and which has no DOM. Nothing here touches
 * `document` or `window` unless it is running on the main thread.
 *
 * Almost everything in this file exists to absorb one of two hazards, both of which
 * fail in ways that look like something else:
 *
 * 1. **cljs.js speaks ClojureScript, not JavaScript.** Its compile options, the
 *    load-fn request and the load-fn *reply* are all ClojureScript maps with keyword
 *    keys. A JS object literal fails `(map? opts)`, and JS destructuring or property
 *    access silently yields `undefined` for every key. Options must be built with
 *    `cljs.core/array-map` and interned keywords; results read with `cljs.core/get`.
 * 2. **The compiler holds no analysis for anything but cljs.core.** Everything else
 *    has to be served as source through the load-fn, and a load-fn that says "no"
 *    for something the analyzer needs makes it fail — or, for a namespace it can
 *    retry under another name, spin.
 */

/**
 * Namespaces already present in the compiler artifact, so there is nothing to
 * analyse and nothing to fetch: the Closure library, cljs.core (whose analysis
 * `:dump-core` puts into the state), and the compiler's own internals —
 * cljs.tools.reader, cljs.analyzer and friends are part of the bundle, and
 * re-analysing them collides with themselves ("Can't redefine a constant").
 */
const LOADED_ALREADY =
  /^cljs\/(core|analyzer|compiler|env|js|reader|source_map|spec|tagged_literals|tools\/reader)/;

const isLoadedAlready = (path) => path.startsWith('goog/') || LOADED_ALREADY.test(path);

/** cljs.js asks for the macros and runtime halves of a namespace separately. */
const extensionsFor = (macros) => (macros ? ['.clj', '.cljc'] : ['.cljs', '.cljc']);

/** The extensions cljs.js compiles into an eval, and the page provides at runtime. */
const LIB_DIR = 'libs/';

function loadScript(url) {
  return new Promise((resolve, reject) => {
    // A worker can pull the compiler in synchronously; a page cannot.
    if (typeof importScripts === 'function') {
      try {
        importScripts(url);
        resolve();
      } catch (e) {
        reject(new Error(`could not load the ClojureScript compiler from ${url}: ${e}`));
      }
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`could not load the ClojureScript compiler from ${url}`));
    document.head.appendChild(script);
  });
}

/**
 * Loads the compiler, then returns an object with a `compile` method.
 *
 * Async because a page (as opposed to a worker) cannot load a script synchronously.
 */
async function createCljsCompiler({ baseUrl } = {}) {
  if (!baseUrl) throw new Error('createCljsCompiler requires a baseUrl for its assets');
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  await loadScript(`${base}cljs.js`);

  const cljs = globalThis.cljs;
  const cljsJs = cljs && cljs.js;
  const core = cljs && cljs.core;
  if (!cljsJs || !core || !cljsJs.compile_str) {
    throw new Error(`loaded ${base}cljs.js, but it did not provide cljs.js/compile-str`);
  }

  const keyword = (name) => core.keyword(null, name);
  const sourceCache = new Map();

  /**
   * The load-fn result must be a ClojureScript map with *keyword* values:
   * `(assert (or (map? resource) (nil? resource)))` is checked inside cljs.js.
   */
  function resourceMap(lang, source, file) {
    const pairs = [keyword('lang'), keyword(lang), keyword('source'), source];
    if (file) pairs.push(keyword('file'), file);
    return core.array_map.apply(null, pairs);
  }

  async function fetchOptional(url) {
    const response = await fetch(url);
    return response.ok ? response.text() : null;
  }

  /**
   * Resolves a namespace to its source, or to `null` when it cannot be resolved.
   *
   * Three cases: namespaces already loaded in the compiler (`:lang :js`, meaning
   * "loaded, do not analyse"); the bundled libraries (`:lang :clj`, so the analyzer
   * compiles them from source); and everything else, which is unresolvable.
   */
  async function resolveResource(path, macros) {
    if (isLoadedAlready(path) && !macros) return resourceMap('js', '');

    // The analyzer asks for the clojure.* and cljs.* spellings interchangeably —
    // it maps between them — but a given library's source lives under one of them.
    const candidates = [path];
    if (path.startsWith('cljs/')) candidates.push(`clojure/${path.slice('cljs/'.length)}`);
    if (path.startsWith('clojure/')) candidates.push(`cljs/${path.slice('clojure/'.length)}`);

    for (const candidate of candidates) {
      for (const ext of extensionsFor(macros)) {
        const source = await fetchOptional(`${base}${LIB_DIR}${candidate}${ext}`);
        if (source !== null) return resourceMap('clj', source, `${candidate}${ext}`);
      }
    }
    return null;
  }

  const loadFn = (request, callback) => {
    // The request is a ClojureScript map: these keys have to be read by keyword.
    const path = core.get(request, keyword('path'));
    const macros = core.get(request, keyword('macros'));

    const key = `${path}|${macros}`;
    const cached = sourceCache.get(key);
    if (cached !== undefined) {
      callback(cached);
      return;
    }

    resolveResource(path, macros).then(
      (resource) => {
        sourceCache.set(key, resource);
        callback(resource);
      },
      () => callback(null),
    );
  };

/** Is this form a `(defmacro …)`? Head position only, which is all a reader gives us. */
function definesMacro(core, form) {
  try {
    return core.name(core.first(form)) === 'defmacro';
  } catch {
    return false;
  }
}

/** The name a munged JavaScript property stands for, when the build can tell us. */
function demungeName(core, key) {
  try {
    return core.demunge(key);
  } catch {
    return key;
  }
}

/** Navigates `a.b.c` to the global object a namespace compiles into, creating it. */
function namespaceObject(path) {
  let target = globalThis;
  for (const part of path.split('.')) {
    if (!target[part]) target[part] = {};
    target = target[part];
  }
  return target;
}

  /**
   * Makes macros the user defined visible to the analyzer.
   *
   * Two things are needed, and neither is optional:
   *
   * 1. The macro *function* has to exist, which means evaluating the `defmacro`.
   *    Compiling alone is not enough: `get-expander` returns a Var and reads
   *    `.isMacro` off it. Evaluating user macros is the one place user code
   *    legitimately runs at compile time, and it is what the JVM compiler does with a
   *    macro namespace.
   * 2. It has to be where dispatch looks. `get-expander*` (analyzer.cljc:4220)
   *    resolves an unqualified symbol from exactly two places — the namespace named by
   *    `:use-macros`, or `cljs.core$macros`. It never consults the current
   *    namespace's own `$macros`, which is why filling that map (what `intern-macros`
   *    does) changes nothing: that map is read by `resolve-macro-var`, and macro
   *    dispatch does not go through it.
   *
   * The cost of using `cljs.core$macros` is that a user macro masquerading as a core
   * macro shadows one of the same name. The tidier route — registering `:use-macros`
   * plus a per-namespace `$macros` object — is untested.
   *
   * Returns the source to compile: the original when there are no macros, and
   * otherwise the source with the `defmacro` forms removed. See the note at the end
   * of the function for why they have to go.
   */
  async function exposeUserMacros(state, code, opts, nsName, notes) {
    const reader = globalThis.cljs && globalThis.cljs.tools && globalThis.cljs.tools.reader;
    const readerTypes = reader && reader.reader_types;
    if (!readerTypes || !cljsJs.read || !cljsJs.eval) {
      notes.push('macro pre-pass: reader or eval unavailable');
      return code;
    }

    // Reading forms needs the environment eval-str installs for its own reader, and
    // cljs.js' own resolve-symbol needs a compiler env that exists only inside an eval.
    reader._STAR_data_readers_STAR_ = globalThis.cljs.tagged_literals._STAR_cljs_data_readers_STAR_;
    reader.resolve_symbol = (symbol) => symbol;

    // The namespace object has to exist BEFORE anything is evaluated, or the emitted
    // `cljs.user.unless = …` throws "Cannot set properties of undefined" and the eval
    // fails silently — the same trap as a top-level `def` at run time.
    const source = namespaceObject(nsName);

    const stream = readerTypes.indexing_push_back_reader(code);
    const eof = {};
    const rest = [];
    let found = false;
    try {
      for (;;) {
        const form = cljsJs.read(eof, stream);
        if (form === eof) break;
        if (!definesMacro(core, form)) {
          rest.push(String(core.pr_str(form)));
          continue;
        }
        found = true;
        const result = await new Promise((resolve) => cljsJs.eval(state, form, opts, resolve));
        const error = core.get(result, keyword('error'));
        if (error) notes.push(`macro eval failed: ${String(error.message || error)}`);
      }
    } catch (e) {
      // Source that does not read is not our problem to report: leave it to
      // compile-str, whose diagnostics are better than anything here.
      return code;
    }
    if (!found) return code;

    // Expose the macros through a per-namespace macros object and point the analyzer's
    // `:use-macros` at it. `get-expander*` resolves an unqualified symbol from there
    // *before* falling back to `cljs.core$macros`, so this leaves core macros alone: a
    // user `(defmacro when …)` no longer replaces `cljs.core/when`, and because the
    // registration lives in the per-compile state it also cannot leak into later runs.
    const macrosNsName = `${nsName}$macros`;
    const macrosNs = namespaceObject(macrosNsName);
    for (const key of Object.keys(macrosNs)) delete macrosNs[key];

    let copied = 0;
    for (const key of Object.keys(source)) {
      const value = source[key];
      if (!value || value.cljs$lang$macro !== true) continue;
      macrosNs[key] = value;
      copied++;
      core.swap_BANG_(
        state,
        core.assoc_in,
        core.vector(
          core.keyword('cljs.analyzer', 'namespaces'),
          core.symbol(null, nsName),
          keyword('use-macros'),
          core.symbol(null, demungeName(core, key)),
        ),
        core.symbol(null, macrosNsName),
      );
    }
    if (!copied) {
      notes.push('macro pre-pass: no macro functions were produced, so nothing to expose');
    }

    // Compile the rest of the source WITHOUT the `defmacro` forms. Analysing a
    // `defmacro` — which compiling it does — takes the name back out of macro
    // dispatch, so the forms after it stop expanding. Nothing is lost by dropping it:
    // macros are expanded away at compile time, and the output never calls them.
    return rest.join('\n');
  }

  /**
   * Compiles ClojureScript to JavaScript.
   *
   * `options` are plain JS and are translated to the ClojureScript map cljs.js
   * requires. Anything it does not recognise is ignored, as cljs.js ignores it.
   */
  async function compile(code, options = {}) {
    const optMap = {
      ns: 'cljs.user',
      context: null,
      staticFns: false,
      fnInvokeDirect: false,
      optimizeConstants: false,
      checkedArrays: false,
      // On by default. The map is inline and carries `sourcesContent`, so a thrown error
      // points at the ClojureScript the user wrote with nothing further from the host
      // page. It roughly quadruples the emitted bytes for a small snippet, which is
      // nothing next to cljs.core.
      sourceMap: true,
      defEmitsVar: false,
      ...options,
    };

    const pairs = [keyword('load'), loadFn, keyword('eval'), cljsJs.js_eval];
    if (optMap.ns) pairs.push(keyword('ns'), core.symbol(null, optMap.ns));
    if (optMap.context) pairs.push(keyword('context'), keyword(optMap.context));
    if (optMap.staticFns) pairs.push(keyword('static-fns'), true);
    if (optMap.fnInvokeDirect) pairs.push(keyword('fn-invoke-direct'), true);
    if (optMap.optimizeConstants) pairs.push(keyword('optimize-constants'), true);
    if (optMap.checkedArrays) pairs.push(keyword('checked-arrays'), keyword(optMap.checkedArrays));
    if (optMap.sourceMap) pairs.push(keyword('source-map'), true);
    if (optMap.defEmitsVar) pairs.push(keyword('def-emits-var'), true);

    const opts = core.array_map.apply(null, pairs);

    // The analyzer reports warnings through the console, and a worker's console goes
    // nowhere — and in LiveCodes the console pane only watches the result page. So
    // they are collected here and returned as `info.errors`, which is where LiveCodes
    // looks for a compiler's diagnostics.
    const errors = [];
    const original = { warn: console.warn, error: console.error };
    const collect = (...args) => {
      const line = args.map(String).join(' ');
      if (line.trim()) errors.push(line.trim());
    };
    console.warn = collect;
    console.error = collect;

    try {
      // A fresh state per compile, so a run is not affected by a previous one's
      // definitions — LiveCodes rebuilds the result page for each run.
      const state = cljsJs.empty_state();
      let toCompile = code;
      const notes = [];
      try {
        toCompile = await exposeUserMacros(state, code, opts, optMap.ns || 'cljs.user', notes);
      } catch (e) {
        // Losing macros is better than losing the compile — and saying so beats both.
        errors.push(`macro handling failed: ${String((e && e.message) || e)}`);
      }
      errors.push(...notes);

      const result = await new Promise((resolve) => {
        try {
          cljsJs.compile_str(state, toCompile, 'main', opts, resolve);
        } catch (e) {
          errors.push(String((e && e.message) || e));
          resolve(null);
        }
      });

      if (!result) return { code: '', info: errors.length ? { errors } : {} };
      const error = core.get(result, keyword('error'));
      const value = core.get(result, keyword('value'));
      if (error) errors.push(String(error.message || error));
      return { code: value == null ? '' : String(value), info: errors.length ? { errors } : {} };
    } finally {
      console.warn = original.warn;
      console.error = original.error;
    }
  }

  return { compile };
}

return { createCljsCompiler: createCljsCompiler };
})();
