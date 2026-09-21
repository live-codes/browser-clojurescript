/**
 * The compile half, as a classic worker: no DOM, no window, no module syntax.
 *
 * This is the shape LiveCodes loads a compiler in, so the test harness exercising
 * this file is exercising the real constraint — and it goes through the package's
 * published API (`dist/index.iife.js`, global `CljsSelfHosted`) rather than a
 * hand-rolled copy of it.
 */

/* global importScripts, CljsSelfHosted */
importScripts('/dist/index.iife.js');

const BASE_URL = '/dist';
let compilerPromise = null;

const getCompiler = () => {
  if (!compilerPromise) compilerPromise = CljsSelfHosted.createCljsCompiler({ baseUrl: BASE_URL });
  return compilerPromise;
};

self.onmessage = async (event) => {
  const { id, code, options } = event.data;

  if (event.data.probe) {
    self.postMessage({
      id,
      probe: {
        hasDocument: typeof document,
        hasWindow: typeof window,
        hasImportScripts: typeof importScripts,
      },
    });
    return;
  }

  try {
    const compiler = await getCompiler();
    const started = Date.now();
    const result = await compiler.compile(code, options);
    self.postMessage({
      id,
      code: result.code,
      warnings: (result.info && result.info.errors) || [],
      compileMs: Date.now() - started,
    });
  } catch (e) {
    self.postMessage({
      id,
      code: '',
      warnings: [],
      error: `threw: ${String((e && e.message) || e)}`,
    });
  }
};
