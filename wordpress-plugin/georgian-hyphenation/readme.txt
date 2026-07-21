=== Georgian Hyphenation ===
Contributors: guramzhgamadze
Tags: hyphenation, georgian, typography, justify, elementor
Requires at least: 6.3
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 3.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Automatic Georgian (ქართული) hyphenation with a bundled hybrid engine — phonetic algorithm plus exception dictionary. No external requests.

== Description ==

Georgian Hyphenation inserts soft hyphens (U+00AD) into Georgian text on your site, so browsers can break long Georgian words correctly at line ends — clean justified paragraphs without ragged edges or stretched spacing.

**How it works**

* A phonetic algorithm built on Georgian syllable structure (vowel detection, harmonic consonant clusters, gemination) finds the valid break points.
* A bundled dictionary of irregular words overrides the algorithm where Georgian orthography is unpredictable.
* Both the engine and the dictionary ship inside the plugin and are served from your own site — the plugin makes **no external requests** and loads nothing from CDNs.

**Features**

* Works with any theme — target content with CSS selectors.
* One-click presets for common Elementor widgets (Text Editor, Heading, Icon Box, Testimonial, Accordion/Toggle/Tabs). Elementor is optional, not required.
* Watches for dynamically loaded content (AJAX, Elementor popups, infinite scroll) and hyphenates it too.
* Optional automatic justification of processed containers.
* Configurable minimum characters before/after a break.
* Compound words keep their hyphens; already-hyphenated text is sanitized before processing, so re-processing is always safe.
* Skips code blocks, forms, and editable content automatically.

The same engine is available for developers as an npm and PyPI package (`georgian-hyphenation`).

== Installation ==

1. Upload the plugin to `/wp-content/plugins/georgian-hyphenation/`, or install it through the WordPress plugins screen.
2. Activate the plugin.
3. Go to **Settings → Georgian Hyphenation** and choose which containers to process. The defaults cover standard post content and the common Elementor text widgets.

== Frequently Asked Questions ==

= Does this plugin call any external services? =

No. The hyphenation engine and the exception dictionary are bundled with the plugin and served from your own site.

= Does it require Elementor? =

No. Elementor widget presets are provided for convenience, but the plugin works with any theme via CSS selectors.

= Will it change my stored content? =

No. Hyphenation happens in the visitor's browser at render time. Your posts and pages in the database are never modified, and the plugin stands aside inside the Elementor editor and the Customizer.

= Why do copied texts sometimes contain invisible characters? =

Soft hyphens (U+00AD) are invisible break hints. Some applications preserve them when text is copied from a page. The engine strips its own hyphens before re-processing, and search engines handle soft hyphens correctly.

== Changelog ==

= 3.0.0 =
* Complete rebuild for the WordPress.org directory.
* The hyphenation engine (v2.3.0) and the exception dictionary are now bundled with the plugin — previously both loaded from an external CDN at runtime.
* New settings screen under Settings → Georgian Hyphenation (Settings API, single option).
* Dynamically added content inside already-processed containers is now hyphenated too (per-node tracking).
* Justification applied via a CSS class instead of inline styles, so themes can override it.
* Code blocks, forms, and editable regions are skipped.
* Old settings are migrated automatically; options are removed on uninstall.
* Engine fixes: punctuation is preserved around dictionary matches; no break is inserted next to a compound-word hyphen.

= 2.2.7 =
* Hybrid engine v2.2.7 with chainable configuration and dictionary support (CDN-based).

== Upgrade Notice ==

= 3.0.0 =
Major rebuild: engine and dictionary now ship inside the plugin (no more CDN requests), settings moved to Settings → Georgian Hyphenation, and existing options migrate automatically.
