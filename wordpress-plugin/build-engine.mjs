/**
 * Builds the WordPress classic-script engine bundle from the npm package.
 *
 * Takes npm/src/javascript/index.cjs (the CommonJS build — same class body
 * as the ESM build, guarded by the parity test in npm/test_javascript.js),
 * strips the module.exports tail, and wraps it in an IIFE that exposes
 * window.GeorgianHyphenator. Also copies the exception dictionary into the
 * plugin's assets.
 *
 * Run after any engine change:  node wordpress-plugin/build-engine.mjs
 */

import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const src = fileURLToPath(new URL('../npm/src/javascript/index.cjs', import.meta.url));
const dictSrc = fileURLToPath(new URL('../npm/data/exceptions.json', import.meta.url));
const jsDest = fileURLToPath(new URL('./georgian-hyphenation/assets/js/georgian-hyphenator.js', import.meta.url));
const dictDest = fileURLToPath(new URL('./georgian-hyphenation/assets/data/exceptions.json', import.meta.url));

let body = await readFile(src, 'utf8');

const marker = 'module.exports = GeorgianHyphenator;';
const idx = body.indexOf(marker);
if (idx === -1) {
  throw new Error('module.exports marker not found — npm/src/javascript/index.cjs layout changed; update build-engine.mjs');
}
body = body.slice(0, idx).trimEnd();

// Drop the source file's doc header and top-level 'use strict' — the
// wrapper provides its own.
body = body.replace(/^\/\*\*[\s\S]*?\*\/\s*/, '').replace(/^'use strict';\s*/, '');

const out = `/**
 * Georgian Hyphenation engine — WordPress classic-script build.
 *
 * GENERATED FILE — do not edit by hand. The class body is identical to the
 * npm package (georgian-hyphenation). Regenerate after engine changes with:
 *   node wordpress-plugin/build-engine.mjs
 *
 * In WordPress the dictionary is always loaded by passing a local URL to
 * loadDefaultLibrary(url); the Node-only require() fallbacks in that method
 * are unreachable here (and safely caught if ever hit).
 */
(function (global) {
'use strict';

${body}

global.GeorgianHyphenator = GeorgianHyphenator;
})(typeof window !== 'undefined' ? window : globalThis);
`;

await mkdir(fileURLToPath(new URL('./georgian-hyphenation/assets/js/', import.meta.url)), { recursive: true });
await mkdir(fileURLToPath(new URL('./georgian-hyphenation/assets/data/', import.meta.url)), { recursive: true });
await writeFile(jsDest, out);
await copyFile(dictSrc, dictDest);

console.log('engine bundle written:', jsDest);
console.log('dictionary copied:', dictDest);
