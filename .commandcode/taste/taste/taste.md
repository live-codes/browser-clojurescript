# Taste
- Prefers features to run fully client-side in the browser, with no servers and no server-side compilation. Confidence: 0.7
- Prefers to begin new feature work with a minimal proof-of-concept (e.g. a simple standalone HTML page) before doing the full integration. Confidence: 0.6
- Keeps generated build artifacts committed to the repo (e.g. a built multi-MB runtime bundle, plus build output dirs) so a fresh clone runs as-is, rather than gitignoring them and requiring a build step. Confidence: 0.5
- Wants compiler integrations packaged as a reusable factory — `createXCompiler({ baseUrl })` returning `compile(code, options) → { code, info }` — where `baseUrl` addresses the package's own assets, so the caller just hands over source plus options and gets back JS to run in the result page. Confidence: 0.75
- Compilers must run in a classic (non-module) web worker with no DOM access; compiling and running are separate concerns (compile in the worker, run the produced JS in the page). Confidence: 0.8
- Prefers runtimes that work as-is without a wrapper package, and only packages the pieces that genuinely need wrapping. Confidence: 0.6
- Prefers non-breaking language/feature additions: add new ids alongside whatever exists rather than repointing an existing name (and keep aliases from colliding with the existing ones). Confidence: 0.5
