/** Diagnostics from a compile, in the shape LiveCodes reads (`CompileResult.info`). */
export interface CljsCompileInfo {
  errors?: string[];
}

export interface CljsCompileResult {
  /** The compiled JavaScript, ready to run in the page. Empty when compilation failed. */
  code: string;
  info: CljsCompileInfo;
}

export interface CljsCompilerOptions {
  /** The namespace to compile into. Defaults to `cljs.user`. */
  ns?: string;
  /** `expr`, `statement` (default) or `return`. */
  context?: 'expr' | 'statement' | 'return';
  staticFns?: boolean;
  fnInvokeDirect?: boolean;
  optimizeConstants?: boolean;
  /** `warn` or `error`; off by default. */
  checkedArrays?: 'warn' | 'error';
  sourceMap?: boolean;
  defEmitsVar?: boolean;
}

export interface CljsCompiler {
  compile(code: string, options?: CljsCompilerOptions): Promise<CljsCompileResult>;
}

export interface CljsCompilerConfig {
  /**
   * Where this package's assets are served from: `cljs.js` and `libs/**`.
   * A trailing slash is optional.
   */
  baseUrl: string;
}

/**
 * Loads the self-hosted ClojureScript compiler and returns a compiler.
 *
 * Safe to call in a classic web worker, which is where LiveCodes runs compilers —
 * nothing here needs the DOM.
 */
export function createCljsCompiler(config: CljsCompilerConfig): Promise<CljsCompiler>;
