<?php
/**
 * Uninstall cleanup: removes every option this plugin ever stored,
 * including the pre-3.0 gh_* names.
 *
 * @package georgian-hyphenation
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'geohyph_options' );

// Legacy (pre-3.0) options, in case uninstall happens before migration ran.
$geohyph_legacy_options = array(
	'gh_enabled',
	'gh_load_dictionary',
	'gh_left_min',
	'gh_right_min',
	'gh_auto_justify',
	'gh_elementor_text_editor',
	'gh_elementor_heading',
	'gh_elementor_icon_box',
	'gh_elementor_testimonial',
	'gh_elementor_accordion',
	'gh_additional_selectors',
);

foreach ( $geohyph_legacy_options as $geohyph_legacy_option ) {
	delete_option( $geohyph_legacy_option );
}
