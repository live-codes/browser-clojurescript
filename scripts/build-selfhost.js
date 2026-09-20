/**
 * Fetches the standalone ClojureScript jar (if it is not cached) and runs the
 * self-hosted compiler build with it.
 *
 *   node scripts/build-selfhost.js
 *
 * Only a JVM is required — no Clojure CLI, leiningen or babashka. Everything the
 * build needs (Clojure, the Google Closure Compiler and cljs itself) is inside
 * that one jar, which is why the official release publishes it.
 */

import { spawnSync } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { get } from 'node:https';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const VERSION = 'r1.12.145';
const JAR_URL = `https://github.com/clojure/clojurescript/releases/download/${VERSION}/cljs.jar`;

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jar = join(root, '.cache', 'cljs.jar');

function download(url, destination) {
  return new Promise((resolvePromise, reject) => {
    get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        download(response.headers.location, destination).then(resolvePromise, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`GET ${url} -> ${response.statusCode}`));
        return;
      }
      const file = createWriteStream(destination);
      response.pipe(file);
      file.on('finish', () => file.close(resolvePromise));
      file.on('error', reject);
    }).on('error', reject);
  });
}

if (!existsSync(jar)) {
  mkdirSync(dirname(jar), { recursive: true });
  console.log(`downloading ClojureScript ${VERSION} (cljs.jar, ~32 MB)…`);
  await download(JAR_URL, jar);
}

console.log(`using ${jar} (${Math.round(statSync(jar).size / 1e6)} MB)`);

// The classpath separator is platform-specific; everything else is the same.
const classpath = [jar, join(root, 'src')].join(process.platform === 'win32' ? ';' : ':');

// :none is the mode self-hosting actually works in. --simple is kept so the
// failure recorded in FINDINGS.md can be reproduced.
const jvmArgs = process.argv.includes('--simple') ? ['-Dcljs.optimizations=simple'] : [];

const result = spawnSync(
  'java',
  [...jvmArgs, '-cp', classpath, 'clojure.main', join(root, 'scripts', 'build-selfhost.clj')],
  { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
