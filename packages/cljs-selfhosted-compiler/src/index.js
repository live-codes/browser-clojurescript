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
 * The namespace name an `(ns …)` form declares, or `null` when the form is not one.
 *
 * Head position only, and guarded: a top-level form need not be a seq at all, and
 * `first` throws on a bare symbol or literal. The guard is the difference between
 * skipping one odd form and losing every macro defined after it.
 */
function declaredName(core, form) {
  try {
    return core.name(core.first(form)) === 'ns' ? core.name(core.second(form)) : null;
  } catch {
    return null;
  }
}

/**
 * The namespace the source declares with an `(ns …)` form, or `null` when it
 * declares none (or does not read).
 *
 * Why this has to be read out of the source at all: macro dispatch resolves an
 * unqualified symbol from the `:use-macros` of the namespace the form is being
 * compiled *in* (see `exposeUserMacros`). Registering the user's macros on a
 * hard-coded `cljs.user` therefore puts them where the analyzer never looks as soon
 * as the source declares a namespace of its own — every macro the user wrote then
 * compiles as an undeclared Var, the emitted JavaScript calls a function that the
 * macro pre-pass stripped out, and the page dies with "Cannot read properties of
 * undefined (reading 'call')". Which namespace a program uses is a property of its
 * own source, so it is the source that has to be asked.
 *
 * Reads through the same reader environment `exposeUserMacros` installs, so the two
 * agree on what the source's forms are.
 */
function declaredNamespace(cljsJs, core, code) {
  const reader = globalThis.cljs && globalThis.cljs.tools && globalThis.cljs.tools.reader;
  const readerTypes = reader && reader.reader_types;
  if (!readerTypes || !cljsJs.read) return null;

  reader._STAR_data_readers_STAR_ = globalThis.cljs.tagged_literals._STAR_cljs_data_readers_STAR_;
  reader.resolve_symbol = (symbol) => symbol;

  const stream = readerTypes.indexing_push_back_reader(code);
  const eof = {};
  try {
    for (;;) {
      const form = cljsJs.read(eof, stream);
      if (form === eof) return null;
      const name = declaredName(core, form);
      if (name !== null) return name;
    }
  } catch {
    // Source that does not read is not our problem to report: leave it to compile-str,
    // whose diagnostics are better than anything here.
    return null;
  }
}

/**
 * Points the analyzer's `:use-macros` for `nsName` at the `<nsName>$macros` object.
 *
 * This is the whole of macro dispatch for an unqualified symbol:
 * `cljs.analyzer/get-expander*` reads `:use-macros` off the namespace the form is
 * compiled *in* and looks the name up on the namespace that value names. It has to be
 * called *after* the `(ns …)` form has been analysed, because analysing that form
 * resets the entry — see `exposeUserMacros`.
 */
function registerMacros(core, keyword, state, nsName, macrosNsName, names) {
  for (const name of names) {
    core.swap_BANG_(
      state,
      core.assoc_in,
      core.vector(
        core.keyword('cljs.analyzer', 'namespaces'),
        core.symbol(null, nsName),
        keyword('use-macros'),
        core.symbol(null, name),
      ),
      core.symbol(null, macrosNsName),
    );
  }
}

/** The number of line breaks in `text` — how many lines come before its last line. */
function newlineCount(text) {
  return text.split('\n').length - 1;
}

/**
 * Moves an inline source map down by `lines`.
 *
 * A compile split in two produces two pieces of JavaScript that get concatenated, so
 * the second piece no longer starts on the line its own map says it does. The map's
 * `mappings` is one group of segments per output line, separated by `;`, so pushing it
 * down is just prefixing that many `;`. Nothing else moves: `sourcesContent` and the
 * rest describe the source, not the output. A piece with no map is returned as-is.
 */
function shiftInlineSourceMap(js, lines) {
  const marker = 'sourceMappingURL=data:application/json;base64,';
  const at = js.lastIndexOf(marker);
  if (at < 0 || lines <= 0) return js;
  const start = at + marker.length;
  const end = js.indexOf('\n', start);
  const stop = end < 0 ? js.length : end;
  try {
    const map = globalThis.atob(js.slice(start, stop));
    const shifted = map.replace(
      /"mappings":"([^"]*)"/,
      (_, mappings) => `"mappings":"${';'.repeat(lines)}${mappings}"`,
    );
    return js.slice(0, start) + globalThis.btoa(shifted) + js.slice(stop);
  } catch {
    // A map we cannot read is one we cannot move; leaving it alone is no worse than
    // dropping it, and it keeps this from being the thing that breaks a compile.
    return js;
  }
}

  /**
   * Makes macros the user defined visible to the analyzer, and hands back what the
   * caller needs to finish the job.
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
   * The route taken is the second one: evaluate the `defmacro` forms, move the resulting
   * functions onto a per-namespace `<ns>$macros` object, and register `:use-macros` on
   * the namespace being compiled pointing at it (see `registerMacros`). That avoids the
   * cost of the first route, where a user macro masquerading as a core macro shadows one
   * of the same name.
   *
   * Two consequences of that route shape what this returns:
   *
   * - Evaluating a `defmacro` in a namespace other than `cljs.user` needs that
   *   namespace to already exist. `cljs.analyzer/get-namespace` special-cases
   *   `cljs.user` and answers nil for anything else, and `cljs.js/eval` reads the
   *   current namespace out of that table — so this creates the entry, exactly as
   *   `get-namespace` would have for `cljs.user`.
   * - The `(ns …)` form has to be compiled *before* the macros are registered, and
   *   alone: analysing it resets the analyzer's `:use-macros` for that namespace
   *   (analyzer.cljc:3523 does a plain `merge` with the form's own — empty —
   *   `:use-macros`), so a registration made earlier would be thrown away. The caller
   *   therefore registers between two compiles, which is why the pieces come back
   *   separately.
   *
   * Returns the source to compile (the original when there are no macros, otherwise the
   * source with the `defmacro` forms removed), plus the ns form, the source without it,
   * the names to register, and the object to register them against. See the note at the
   * end of the function for why the `defmacro` forms have to go.
   */
  async function exposeUserMacros(state, code, opts, nsName, notes) {
    const macrosNsName = `${nsName}$macros`;
    const untouched = { source: code, nsForm: null, body: code, macros: [], macrosNsName };
    const reader = globalThis.cljs && globalThis.cljs.tools && globalThis.cljs.tools.reader;
    const readerTypes = reader && reader.reader_types;
    if (!readerTypes || !cljsJs.read || !cljsJs.eval) {
      notes.push('macro pre-pass: reader or eval unavailable');
      return untouched;
    }

    // Reading forms needs the environment eval-str installs for its own reader, and
    // cljs.js' own resolve-symbol needs a compiler env that exists only inside an eval.
    reader._STAR_data_readers_STAR_ = globalThis.cljs.tagged_literals._STAR_cljs_data_readers_STAR_;
    reader.resolve_symbol = (symbol) => symbol;

    // Read every top-level form before doing anything with them: the `(ns …)` form the
    // analyzer will read again has to be told apart from the `defmacro`s before either
    // is evaluated or compiled.
    const macros = [];
    const all = [];
    const body = [];
    let nsForm = null;
    try {
      const stream = readerTypes.indexing_push_back_reader(code);
      const eof = {};
      for (;;) {
        const form = cljsJs.read(eof, stream);
        if (form === eof) break;
        if (definesMacro(core, form)) {
          macros.push(form);
          continue;
        }
        const text = String(core.pr_str(form));
        all.push(text);
        if (nsForm === null && declaredName(core, form) !== null) nsForm = text;
        else body.push(text);
      }
    } catch (e) {
      // Source that does not read is not our problem to report: leave it to
      // compile-str, whose diagnostics are better than anything here.
      return untouched;
    }
    if (!macros.length) return untouched;

    // The namespace object has to exist BEFORE anything is evaluated, or the emitted
    // `cljs.user.unless = …` throws "Cannot set properties of undefined" and the eval
    // fails silently — the same trap as a top-level `def` at run time. The analyzer's
    // namespace table needs the same treatment, for the reason in the doc comment.
    //
    // The path is munged, because the *emitted* JavaScript is: a namespace written
    // `starter.my-app` compiles to `starter.my_app.with_log = …`. Building the object from
    // the name as written would create `starter['my-app']` — a different object — so the
    // eval dereferences an undefined namespace and this pre-pass then reports that no macro
    // was produced. `munge` leaves `.` alone, so the dotted path still splits correctly.
    const nsObject = namespaceObject(core.munge(nsName));
    if (nsName !== 'cljs.user') {
      core.swap_BANG_(
        state,
        core.assoc_in,
        core.vector(
          core.keyword('cljs.analyzer', 'namespaces'),
          core.symbol(null, nsName),
          keyword('name'),
        ),
        core.symbol(null, nsName),
      );
    }

    // Move the evaluated macro functions onto the per-namespace object the analyzer will
    // be pointed at. `cljs.analyzer/find-macros-ns` resolves that name to this global, and
    // it munges too — hence the munge here, for the same reason as `nsObject` above.
    const macrosNs = namespaceObject(core.munge(macrosNsName));
    for (const key of Object.keys(macrosNs)) delete macrosNs[key];

    // Copy every macro function the namespace object now holds, and report only the ones
    // whose *name* has not been published yet. A redefinition overwrites the function
    // (last wins) without registering the name twice.
    const exposed = new Set();
    const names = [];
    const exposeNewMacros = () => {
      const added = [];
      for (const key of Object.keys(nsObject)) {
        const value = nsObject[key];
        if (!value || value.cljs$lang$macro !== true) continue;
        macrosNs[key] = value;
        if (exposed.has(key)) continue;
        exposed.add(key);
        const name = demungeName(core, key);
        names.push(name);
        added.push(name);
      }
      return added;
    };

    for (const form of macros) {
      const result = await new Promise((resolve) => cljsJs.eval(state, form, opts, resolve));
      const error = core.get(result, keyword('error'));
      if (error) notes.push(`macro eval failed: ${String(error.message || error)}`);
      // Publish each macro the moment it exists, rather than all of them after the loop.
      // A macro body may call another user macro, and the analyzer only expands that call
      // if the callee is already a macro *while the body is being analysed* — macro
      // dispatch reads `:use-macros` (see `registerMacros`). Publishing them together at
      // the end leaves the earlier name an undeclared function, so `(defmacro b [x] (a x))`
      // compiles `a` as a call and the expansion is silently wrong.
      const added = exposeNewMacros();
      if (added.length) registerMacros(core, keyword, state, nsName, macrosNsName, added);
    }
    if (!names.length) {
      notes.push('macro pre-pass: no macro functions were produced, so nothing to expose');
    }

    // Compile the rest of the source WITHOUT the `defmacro` forms. Analysing a
    // `defmacro` — which compiling it does — takes the name back out of macro
    // dispatch, so the forms after it stop expanding. Nothing is lost by dropping it:
    // macros are expanded away at compile time, and the output never calls them.
    return { source: all.join('\n'), nsForm, body: body.join('\n'), macros: names, macrosNsName };
  }

  /**
   * Compiles ClojureScript to JavaScript.
   *
   * `options` are plain JS and are translated to the ClojureScript map cljs.js
   * requires. Anything it does not recognise is ignored, as cljs.js ignores it.
   */
  async function compile(code, options = {}) {
    const optMap = {
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

    // The namespace every step below keys off: an explicit option wins (a caller who
    // names a namespace has a reason to), otherwise the namespace the source declares,
    // otherwise cljs.user. This is not cosmetic — it decides which namespace's
    // `:use-macros` the user's macros are registered on, and therefore whether they are
    // found at all when the source declares a namespace of its own.
    const nsName = optMap.ns || declaredNamespace(cljsJs, core, code) || 'cljs.user';
    optMap.ns = nsName;

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

    // The same map without the source map, for the half of a split compile that is not
    // worth mapping (see below). Only built when there is a map to leave out.
    const optsWithoutSourceMap = optMap.sourceMap ? core.assoc(opts, keyword('source-map'), false) : opts;

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
      const notes = [];
      let prepped;
      try {
        prepped = await exposeUserMacros(state, code, opts, nsName, notes);
      } catch (e) {
        // Losing macros is better than losing the compile — and saying so beats both.
        errors.push(`macro handling failed: ${String((e && e.message) || e)}`);
        prepped = { source: code, nsForm: null, body: code, macros: [], macrosNsName: '' };
      }
      errors.push(...notes);

      // Compiles one source string with `compile-str`, resolving to its JavaScript, or to
      // null with the reason in `errors` — the two paths below share it rather than
      // duplicating the callback dance.
      const compileSource = (src, useOpts) =>
        new Promise((resolve) => {
          try {
            cljsJs.compile_str(state, src, 'main', useOpts, resolve);
          } catch (e) {
            errors.push(String((e && e.message) || e));
            resolve(null);
          }
        }).then((result) => {
          if (!result) return null;
          const error = core.get(result, keyword('error'));
          if (error) {
            errors.push(String(error.message || error));
            return null;
          }
          const value = core.get(result, keyword('value'));
          return value == null ? '' : String(value);
        });

      const failed = () => ({ code: '', info: errors.length ? { errors } : {} });

      let js;
      if (prepped.macros.length && prepped.nsForm !== null) {
        // A declared namespace forces two compiles, in this order. The `(ns …)` form
        // resets the analyzer's `:use-macros` when it is analysed, so the macros can only
        // be registered after it — and they have to be registered before the first form
        // that uses them is analysed. Nothing can be both in one `compile-str`, so the ns
        // form goes first, then the macros are registered, then the remaining forms. The
        // ns half is emitted without a source map (it is two `goog.provide`/`require`
        // lines) so the only map in the result is the body's, moved down to where the
        // body now starts.
        const nsJs = await compileSource(prepped.nsForm, optsWithoutSourceMap);
        if (nsJs === null) return failed();
        registerMacros(core, keyword, state, nsName, prepped.macrosNsName, prepped.macros);
        const bodyJs = await compileSource(prepped.body, opts);
        if (bodyJs === null) return failed();
        js = `${nsJs}\n${shiftInlineSourceMap(bodyJs, newlineCount(nsJs) + 1)}`;
      } else {
        registerMacros(core, keyword, state, nsName, prepped.macrosNsName, prepped.macros);
        js = await compileSource(prepped.source, opts);
        if (js === null) return failed();
      }

      return { code: js, info: errors.length ? { errors } : {} };
    } finally {
      console.warn = original.warn;
      console.error = original.error;
    }
  }

  return { compile };
}
