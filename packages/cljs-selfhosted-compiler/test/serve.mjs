/**
 * Static server for the test harness. Serves this package's root, so the harness
 * can reach /dist/... and /test/...
 *
 *   node test/serve.mjs [port]
 */

import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../', import.meta.url)));
const PORT = Number(process.argv[2] ?? 8128);
const REPORT = join(ROOT, 'target', 'harness-report.txt');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.cljs': 'text/plain; charset=utf-8',
  '.cljc': 'text/plain; charset=utf-8',
  '.clj': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

  // The harness posts its results here, so it can be checked without a browser
  // session reading the page back. Written to a file as well as logged, because
  // stdout is not always captured when this runs in the background.
  if (req.method === 'POST' && urlPath === '/report') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const report = Buffer.concat(chunks).toString('utf8');
    mkdirSync(dirname(REPORT), { recursive: true });
    writeFileSync(REPORT, report);
    console.log('\n===== HARNESS REPORT =====');
    console.log(report);
    console.log('===== END HARNESS REPORT =====\n');
    res.writeHead(204).end();
    return;
  }

  // Redirect rather than serving index.html at '/', so the page's relative URLs
  // (./worker.js, ../dist/…) resolve against /test/ as they should.
  if (urlPath === '/') {
    res.writeHead(302, { Location: '/test/index.html' }).end();
    return;
  }

  const rel = urlPath.replace(/^\/+/, '');
  const filePath = normalize(join(ROOT, rel));

  if (!filePath.startsWith(normalize(ROOT))) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  let body;
  try {
    body = readFileSync(filePath);
  } catch {
    res.writeHead(404).end(`Not found: /${rel}`);
    return;
  }

  res.writeHead(200, {
    'Content-Type': TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
  });
  res.end(body);
}).listen(PORT, () => {
  console.log(`cljs-selfhosted-compiler test harness: http://localhost:${PORT}/`);
  console.log(`serving ${ROOT}`);
});
