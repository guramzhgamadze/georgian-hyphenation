\# Changelog

## [2.3.0] - 2026-07-21

### Fixed

- **npm (CommonJS)**: `require('georgian-hyphenation')` crashed with `SyntaxError` — `index.cjs` was an ES module copy. It is now a real CommonJS build (`module.exports`).
- **npm (Node.js)**: the bundled dictionary silently failed to load on Node 22+ — the removed `assert { type: 'json' }` import syntax was replaced with a plain `fs` read resolved via `import.meta.url`.
- **npm (browser)**: the dictionary URL is no longer hard-coded to one version; it resolves relative to the module (`import.meta.url`), so CDN users always get the matching dictionary.
- **PyPI**: the exception dictionary was missing from published wheels (`package_data` pointed outside the package). It now ships inside `georgian_hyphenation/data/` and is loaded via `importlib.resources`.
- **Both**: dictionary hits no longer drop surrounding punctuation (`hyphenate('კომპიუტერი,')` keeps the comma).
- **Both**: the algorithm no longer inserts a break directly next to an existing compound-word hyphen (`მაგ-რამ` no longer becomes `მაგ­-რამ`).
- **JS**: `hyphenateHTML()` no longer corrupts skipped content containing `$&`-style sequences; custom hyphen characters with regex meaning (`*`, `|`, …) are escaped correctly; `unhyphenate()` with hyphen char `'-'` no longer strips compound-word hyphens (matches Python).

### Added

- TypeScript declarations (`index.d.ts` / `index.d.cts`) with proper dual-package `exports`.
- `loadDefaultLibrary(source)` optional argument (custom URL or file path) in the JS builds.
- `setDebug()` / `debug` option; successful dictionary loads are silent by default (Python uses the standard `logging` module).

### Changed

- Version strings removed from log messages and file headers; `package.json` / `__init__.py` are the single source of truth.
- Python packaging consolidated into `pyproject.toml` (`setup.py` removed).



\## \[1.0.1] - 2025-01-15



\### Fixed

\- Fixed method names to match documentation

\- `getSyllables()` now works correctly

\- Improved consistency across Python and JavaScript APIs



\## \[1.0.0] - 2025-01-14



\### Added

\- Initial release on PyPI

\- Georgian hyphenation algorithm

\- Python and JavaScript support

\- TeX patterns generator

\- Hunspell dictionary generator

