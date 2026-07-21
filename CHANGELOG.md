\# Changelog

## [Browser Extensions 2.2.8] - 2026-07-22

### Fixed

- **Visible soft-hyphen dashes inside words.** Some display/decorative webfonts incorrectly render the soft hyphen (U+00AD) as a visible dash instead of hiding it except at line breaks, which showed up as dashes scattered through headings and large text.
  - **Chrome**: `shouldSkipElement` now skips headings (`h1`–`h6`), structural chrome (`header`/`footer`/`aside`/`nav`), `role="heading"`, and any element with computed `font-size > 20px` — matching the Firefox build, which already had these guards. Previously Chrome hyphenated headings and display text.
  - **Firefox**: already skipped these (this bump republishes the fix for anyone still on an older installed build).

Note: on a site whose font maps U+00AD to a visible glyph on *normal-sized* body text, the extension cannot detect that from the outside — use the per-site on/off toggle there. The bundled engine (v2.2.7) and CDN-loaded dictionary are unchanged in this release; modernizing them to the local v2.3.0 engine is tracked separately.

## [WordPress Plugin 3.0.0] - 2026-07-21

### Changed

- **Complete rebuild for the WordPress.org directory.** The v2.3.0 engine and the exception dictionary are now bundled inside the plugin and served locally — previously both were fetched from jsDelivr at runtime (a wp.org guideline violation and a single point of failure).
- Proper plugin scaffold: `includes/` classes, `readme.txt`, `uninstall.php`, assets enqueued via the WordPress API (`wp_enqueue_script` with defer, `wp_add_inline_script` for config) instead of an inline footer `<script>`.
- New `geohyph_` prefix and a single `geohyph_options` array (Settings API with sanitize callback); pre-3.0 `gh_*` options migrate automatically on first load and are deleted.
- Settings screen moved to **Settings → Georgian Hyphenation**; admin styles enqueued, i18n-ready English source strings.

### Fixed

- Dynamically added content inside already-processed containers is now hyphenated (processed state tracked per text node, not per container).
- Headings (h1–h6) are skipped by default via a new "Skip headings" toggle — some display webfonts draw the soft hyphen (U+00AD) as a visible dash inside heading words. The Elementor Heading preset (now off by default) overrides the skip when enabled.
- Code blocks (`code`/`pre`), forms, and `contenteditable` regions are skipped.
- Justification applied via the `geohyph-justify` CSS class instead of inline styles.
- The plugin stands aside in the Elementor editor/preview and the Customizer.

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

