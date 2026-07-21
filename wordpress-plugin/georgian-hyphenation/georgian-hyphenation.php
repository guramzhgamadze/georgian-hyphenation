<?php
/**
 * Plugin Name:       Georgian Hyphenation
 * Plugin URI:        https://github.com/guramzhgamadze/georgian-hyphenation
 * Description:       Automatic Georgian (ქართული) hyphenation with a bundled hybrid engine (algorithm + exception dictionary). Works with any theme; includes Elementor widget presets.
 * Version:           3.0.0
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            Guram Zhgamadze
 * Author URI:        https://github.com/guramzhgamadze
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       georgian-hyphenation
 */

defined( 'ABSPATH' ) || exit;

define( 'GEOHYPH_VERSION', '3.0.0' );
define( 'GEOHYPH_PATH', plugin_dir_path( __FILE__ ) );
define( 'GEOHYPH_URL', plugin_dir_url( __FILE__ ) );

require GEOHYPH_PATH . 'includes/class-geohyph-plugin.php';

Geohyph_Plugin::instance()->init();
