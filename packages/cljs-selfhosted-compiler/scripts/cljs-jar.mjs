/**
 * Fetches the standalone ClojureScript jar and caches it under .cache/.
 *
 * Only a JVM is needed to build this package: the jar carries Clojure, the
 * Google Closure Compiler and cljs itself, so no Clojure CLI, leiningen or
 * babashka is involved.
 */

import { createWriteStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { get } from 'node:https';
import { dirname, join } from 'node:path';

const VERSION = 'r1.12.145';
const JAR_URL = `https://github.com/clojure/clojurescript/releases/download/${VERSION}/cljs.jar`;

function download(url, destination) {
  return new Promise((resolve, reject) => {
    get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        download(response.headers.location, destination).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`GET ${url} -> ${response.statusCode}`));
        return;
      }
      const file = createWriteStream(destination);
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    }).on('error', reject);
  });
}

/** Returns the path to a usable cljs.jar, downloading it once if needed. */
export async function ensureCljsJar(root) {
  const jar = join(root, '.cache', 'cljs.jar');
  if (!existsSync(jar)) {
    mkdirSync(dirname(jar), { recursive: true });
    console.log(`downloading ClojureScript ${VERSION} (cljs.jar, ~32 MB)…`);
    await download(JAR_URL, jar);
  }
  return jar;
}

export function jarSizeMb(jar) {
  return Math.round(statSync(jar).size / 1e6);
}

export { VERSION as CLJS_VERSION };
