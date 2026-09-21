/**
 * Builds everything this package publishes:
 *
 *   dist/cljs.js          the worker-side compiler   (cljs.js + analyzer + compiler + cljs.core analysis)
 *   dist/cljs-runtime.js  the page-side runtime      (cljs.core + the bundled libraries)
 *   dist/libs/**          sources the compiler's load-fn serves on demand
 *   dist/index.iife.js    the wrapper, defining the global `CljsSelfHosted`
 *   dist/index.d.ts
 *
 *   node build.mjs
 *
 * A JVM is the only requirement. There is deliberately no bundler and no
 * `node_modules`: the wrapper has no imports, so turning it into an IIFE is a
 * one-line transform, and pulling in a build toolchain to do that would be the only
 * thing this package needed installing for.
 */

import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLJS_VERSION, ensureCljsJar, jarSizeMb } from './scripts/cljs-jar.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');

const jar = await ensureCljsJar(root);
console.log(`using ClojureScript ${CLJS_VERSION} (${jarSizeMb(jar)} MB jar)`);

// 1. the two ClojureScript artifacts, from one compiler
const classpath = [jar, join(root, 'src', 'cljs')].join(process.platform === 'win32' ? ';' : ':');
const cljsBuild = spawnSync(
  'java',
  ['-cp', classpath, 'clojure.main', join(root, 'scripts', 'cljs-build.clj')],
  { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' },
);
if (cljsBuild.error) {
  console.error(cljsBuild.error.message);
  process.exit(1);
}
if (cljsBuild.status !== 0) process.exit(cljsBuild.status ?? 1);

// 2. the wrapper, as an IIFE so it can be importScripts'd into a classic worker
const source = readFileSync(join(root, 'src', 'index.js'), 'utf8');
if (/^\s*import\s/m.test(source)) {
  throw new Error(
    'src/index.js now has an import; this build has no bundler, so it cannot be inlined',
  );
}
mkdirSync(dist, { recursive: true });
writeFileSync(
  join(dist, 'index.iife.js'),
  `var CljsSelfHosted = (function () {\n${source.replace(/^export\s+/gm, '')}\n` +
    `return { createCljsCompiler: createCljsCompiler };\n})();\n`,
);
copyFileSync(join(root, 'src', 'index.d.ts'), join(dist, 'index.d.ts'));

console.log('done');
