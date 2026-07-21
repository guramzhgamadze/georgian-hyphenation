<?php
/**
 * Plugin bootstrap: wires up the settings screen, the frontend assets, and
 * the one-time migration from the pre-3.0 gh_* options.
 *
 * @package georgian-hyphenation
 */

defined( 'ABSPATH' ) || exit;

class Geohyph_Plugin {

	/**
	 * @var self|null
	 */
	private static $instance = null;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function init(): void {
		require GEOHYPH_PATH . 'includes/class-geohyph-settings.php';
		require GEOHYPH_PATH . 'includes/class-geohyph-frontend.php';

		add_action( 'init', array( $this, 'maybe_migrate_legacy_options' ), 5 );

		( new Geohyph_Settings() )->register();
		( new Geohyph_Frontend() )->register();
	}

	/**
	 * Default option values, shared by the settings screen and the frontend.
	 */
	public static function defaults(): array {
		return array(
			'enabled'                => true,
			'load_dictionary'        => true,
			'left_min'               => 2,
			'right_min'              => 2,
			'auto_justify'           => true,
			'elementor_text_editor'  => true,
			'elementor_heading'      => true,
			'elementor_icon_box'     => true,
			'elementor_testimonial'  => true,
			'elementor_accordion'    => true,
			'additional_selectors'   => 'article p, .entry-content p',
		);
	}

	/**
	 * Current options merged over the defaults.
	 */
	public static function get_options(): array {
		$stored = get_option( 'geohyph_options', array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}
		return wp_parse_args( $stored, self::defaults() );
	}

	/**
	 * Elementor widget presets: option key => label + CSS selector.
	 */
	public static function elementor_widgets(): array {
		return array(
			'elementor_text_editor' => array(
				'label'    => __( 'Text Editor widget', 'georgian-hyphenation' ),
				'selector' => '.elementor-text-editor, .elementor-widget-text-editor',
			),
			'elementor_heading'     => array(
				'label'    => __( 'Heading widget', 'georgian-hyphenation' ),
				'selector' => '.elementor-heading-title',
			),
			'elementor_icon_box'    => array(
				'label'    => __( 'Icon Box widget', 'georgian-hyphenation' ),
				'selector' => '.elementor-icon-box-description',
			),
			'elementor_testimonial' => array(
				'label'    => __( 'Testimonial widget', 'georgian-hyphenation' ),
				'selector' => '.elementor-testimonial-content',
			),
			'elementor_accordion'   => array(
				'label'    => __( 'Accordion / Toggle / Tabs', 'georgian-hyphenation' ),
				'selector' => '.elementor-accordion-content, .elementor-tab-content, .elementor-toggle-content',
			),
		);
	}

	/**
	 * The combined CSS selector list the frontend script processes.
	 */
	public static function get_active_selectors(): string {
		$options   = self::get_options();
		$selectors = array();

		foreach ( self::elementor_widgets() as $key => $widget ) {
			if ( ! empty( $options[ $key ] ) ) {
				$selectors[] = $widget['selector'];
			}
		}

		$custom = trim( (string) $options['additional_selectors'] );
		if ( '' !== $custom ) {
			// The textarea may contain newlines; normalize to a comma list.
			$selectors[] = trim( preg_replace( '/\s*[\r\n]+\s*/', ', ', $custom ), ", \t" );
		}

		if ( empty( $selectors ) ) {
			$selectors[] = 'p';
		}

		return implode( ', ', $selectors );
	}

	/**
	 * One-time migration from the pre-3.0 scalar gh_* options to the single
	 * geohyph_options array. Runs until it finds legacy options, then removes
	 * them; afterwards the existence check is a single cheap lookup.
	 */
	public function maybe_migrate_legacy_options(): void {
		$sentinel = '__geohyph_missing__';

		if ( $sentinel !== get_option( 'geohyph_options', $sentinel ) ) {
			return; // Already migrated / configured.
		}

		$legacy_map = array(
			'gh_enabled'               => 'enabled',
			'gh_load_dictionary'       => 'load_dictionary',
			'gh_left_min'              => 'left_min',
			'gh_right_min'             => 'right_min',
			'gh_auto_justify'          => 'auto_justify',
			'gh_elementor_text_editor' => 'elementor_text_editor',
			'gh_elementor_heading'     => 'elementor_heading',
			'gh_elementor_icon_box'    => 'elementor_icon_box',
			'gh_elementor_testimonial' => 'elementor_testimonial',
			'gh_elementor_accordion'   => 'elementor_accordion',
			'gh_additional_selectors'  => 'additional_selectors',
		);

		$found = false;
		foreach ( $legacy_map as $legacy_key => $ignored ) {
			if ( $sentinel !== get_option( $legacy_key, $sentinel ) ) {
				$found = true;
				break;
			}
		}
		if ( ! $found ) {
			return; // Fresh install — defaults apply via get_options().
		}

		$options = self::defaults();
		foreach ( $legacy_map as $legacy_key => $new_key ) {
			$value = get_option( $legacy_key, $sentinel );
			if ( $sentinel === $value ) {
				continue;
			}
			if ( 'additional_selectors' === $new_key ) {
				$options[ $new_key ] = sanitize_textarea_field( (string) $value );
			} elseif ( 'left_min' === $new_key || 'right_min' === $new_key ) {
				$options[ $new_key ] = min( 5, max( 1, absint( $value ) ) );
			} else {
				$options[ $new_key ] = (bool) $value;
			}
		}

		update_option( 'geohyph_options', $options, true );

		foreach ( array_keys( $legacy_map ) as $legacy_key ) {
			delete_option( $legacy_key );
		}
	}
}
