=== Georgian Hyphenation ===
Contributors: guramzhgamadze
Tags: georgian, hyphenation, elementor, kartuli, typography
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.0
Stable tag: 2.0.1
License: MIT
License URI: https://opensource.org/licenses/MIT

Academic Georgian hyphenation with full Elementor support. Uses v2.0 Academic Logic with Phonological Distance Analysis.

== Description ==

**Georgian Hyphenation** automatically adds hyphenation to Georgian text on your WordPress site, improving text layout and readability.

= Features =

* **🎓 Academic Logic** - v2.0 with Phonological Distance Analysis
* **98%+ Accuracy** - Validated on 10,000+ Georgian words
* **🔌 Elementor Support** - Full compatibility with Elementor widgets, popups, and dynamic content
* **⚡ Zero Dependencies** - Uses NPM package from jsDelivr CDN
* **🎨 Auto Justify** - Optional text-align: justify for better effect
* **🔄 Dynamic Content** - MutationObserver for AJAX-loaded content
* **⚙️ Easy Setup** - Simple settings page with sensible defaults

= How it Works =

The plugin uses the `georgian-hyphenation` NPM package (v2.0.1) which implements:

* **Phonological Distance Analysis** - Intelligent vowel-to-vowel distance calculation
* **Anti-Orphan Protection** - Prevents single-character splits (minimum 2 chars per side)
* **'R' Rule** - Special handling for Georgian 'რ' in consonant clusters
* **Hiatus Handling** - Proper V-V split detection

= Usage =

1. Install and activate the plugin
2. Go to Settings → Georgian Hyphenation
3. Customize CSS selectors (optional)
4. Enable/disable auto-justify (optional)
5. Save settings

The plugin will automatically hyphenate Georgian text on your site!

= Elementor Support =

Works with all Elementor widgets including:
* Text Editor
* Heading
* Icon Box
* Testimonials
* Accordions
* Popups
* Dynamic content

= Links =

* [GitHub Repository](https://github.com/guramzhgamadze/georgian-hyphenation)
* [NPM Package](https://www.npmjs.com/package/georgian-hyphenation)
* [PyPI Package](https://pypi.org/project/georgian-hyphenation/)
* [Live Demo](https://guramzhgamadze.github.io/georgian-hyphenation/)
* [Browser Extension - Firefox](https://addons.mozilla.org/firefox/addon/georgian-hyphenation/)

== Installation ==

= Automatic Installation =

1. Go to WordPress Admin → Plugins → Add New
2. Search for "Georgian Hyphenation"
3. Click "Install Now"
4. Activate the plugin

= Manual Installation =

1. Download the plugin ZIP file
2. Go to WordPress Admin → Plugins → Add New → Upload Plugin
3. Choose the ZIP file and click "Install Now"
4. Activate the plugin

= Configuration =

1. Go to Settings → Georgian Hyphenation
2. Customize settings:
   * Enable/Disable hyphenation
   * CSS Selectors (default includes Elementor widgets)
   * Auto Justify text
3. Save changes

== Frequently Asked Questions ==

= Does it work with Elementor? =

Yes! The plugin has full Elementor support including widgets, popups, and dynamic content.

= Does it slow down my site? =

No. The library is loaded from jsDelivr CDN (~5KB) and runs efficiently using modern JavaScript.

= Can I customize which elements get hyphenated? =

Yes! You can specify custom CSS selectors in the settings page.

= Does it work with dynamic content (AJAX)? =

Yes! The plugin uses MutationObserver to automatically detect and hyphenate dynamically loaded content.

= What happens to text in editable fields? =

The plugin automatically skips contentEditable elements to avoid interference with typing.

== Screenshots ==

1. Settings page with options
2. Before and after hyphenation comparison
3. Elementor widget with hyphenation
4. Text preview in narrow column

== Changelog ==

= 2.0.1 (2025-01-22) =
* Initial WordPress.org release
* v2.0 Academic Logic with Phonological Distance Analysis
* Full Elementor support
* MutationObserver for dynamic content
* Auto-justify option
* CDN delivery from jsDelivr (NPM package)

== Upgrade Notice ==

= 2.0.1 =
Initial release with v2.0 Academic Logic. Provides accurate Georgian hyphenation with full Elementor support.

== Credits ==

* Algorithm based on Georgian phonological research
* Inspired by TeX hyphenation algorithms (Liang, 1983)
* NPM package: georgian-hyphenation v2.0.1

== License ==

This plugin is licensed under the MIT License.