/**
 * A static server for this demo.
 *
 * It exists because `file://` cannot run ES modules or fetch a compiler bundle.
 * Nothing else is needed: there is no build step and no server-side compilation.
 *
 *   node serve.js [port] [root]
 *
 * `root` defaults to `public/` and is resolved against this file.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const positional = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));

const PORT = Number(positional[0] ?? 8127);
const ROOT = resolve(fileURLToPath(new URL('./', import.meta.url)), positional[1] ?? 'public');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.cljs': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.md': 'text/markdown; charset=utf-8',
};

const server = createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const filePath = normalize(join(ROOT, rel));

  if (!filePath.startsWith(normalize(ROOT))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' }).end('Forbidden');
    return;
  }

  let body;
  try {
    body = await readFile(filePath);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end(`Not found: /${rel}`);
    return;
  }

  res.writeHead(200, {
    'Content-Type': TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    'Content-Length': body.length,
    // Nothing here is content-pinned, so serve everything fresh; the browser
    // caches the CDN assets instead.
    'Cache-Control': 'no-store',
  });
  res.end(body);
});

server.listen(PORT, () => {
  console.log(`browser-clojurescript: http://localhost:${PORT}/`);
  console.log(`serving ${ROOT}`);
  console.log('Scittle is fetched from jsDelivr on first run; no build step, no server-side compile');
  console.log('press Ctrl+C to stop');
});
