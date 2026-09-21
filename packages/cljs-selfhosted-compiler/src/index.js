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
export async function createCljsCompiler({ baseUrl } = {}) {
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

  /**
   * Compiles ClojureScript to JavaScript.
   *
   * `options` are plain JS and are translated to the ClojureScript map cljs.js
   * requires. Anything it does not recognise is ignored, as cljs.js ignores it.
   */
  function compile(code, options = {}) {
    const optMap = {
      ns: 'cljs.user',
      context: null,
      staticFns: false,
      fnInvokeDirect: false,
      optimizeConstants: false,
      checkedArrays: false,
      sourceMap: false,
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

    return new Promise((resolve) => {
      // The analyzer reports warnings through the console, and a worker's console
      // goes nowhere — and in LiveCodes the console pane only watches the result
      // page. So they are collected here and returned as `info.errors`, which is
      // where LiveCodes looks for a compiler's diagnostics.
      const errors = [];
      const original = { warn: console.warn, error: console.error };
      const collect = (...args) => {
        const line = args.map(String).join(' ');
        if (line.trim()) errors.push(line.trim());
      };
      console.warn = collect;
      console.error = collect;

      const finish = (result) => {
        console.warn = original.warn;
        console.error = original.error;
        const error = core.get(result, keyword('error'));
        const value = core.get(result, keyword('value'));
        if (error) {
          errors.push(String(error.message || error));
        }
        resolve({
          code: value == null ? '' : String(value),
          info: errors.length ? { errors } : {},
        });
      };

      try {
        // A fresh state per compile, so a run is not affected by a previous one's
        // definitions — LiveCodes rebuilds the result page for each run.
        cljsJs.compile_str(cljsJs.empty_state(), code, 'main', core.array_map.apply(null, pairs), finish);
      } catch (e) {
        console.warn = original.warn;
        console.error = original.error;
        resolve({ code: '', info: { errors: [...errors, String((e && e.message) || e)] } });
      }
    });
  }

  return { compile };
}
