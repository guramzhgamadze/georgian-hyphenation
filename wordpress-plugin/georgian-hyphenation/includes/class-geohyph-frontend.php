<?php
/**
 * Frontend assets: the bundled hyphenation engine, the DOM processor, and
 * their configuration. Everything is served locally from this plugin — no
 * CDN or external requests.
 *
 * @package georgian-hyphenation
 */

defined( 'ABSPATH' ) || exit;

class Geohyph_Frontend {

	public function register(): void {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	public function enqueue_assets(): void {
		$options = Geohyph_Plugin::get_options();

		if ( empty( $options['enabled'] ) ) {
			return;
		}

		if ( $this->is_builder_context() ) {
			return;
		}

		wp_enqueue_style(
			'geohyph-frontend',
			GEOHYPH_URL . 'assets/css/geohyph-frontend.css',
			array(),
			GEOHYPH_VERSION
		);

		wp_enqueue_script(
			'geohyph-engine',
			GEOHYPH_URL . 'assets/js/georgian-hyphenator.js',
			array(),
			GEOHYPH_VERSION,
			array(
				'strategy'  => 'defer',
				'in_footer' => true,
			)
		);

		wp_enqueue_script(
			'geohyph-frontend',
			GEOHYPH_URL . 'assets/js/geohyph-frontend.js',
			array( 'geohyph-engine' ),
			GEOHYPH_VERSION,
			array(
				'strategy'  => 'defer',
				'in_footer' => true,
			)
		);

		// The version query keeps aggressive page/CDN caches from serving a
		// stale dictionary after an update.
		$dictionary_url = add_query_arg(
			'ver',
			GEOHYPH_VERSION,
			GEOHYPH_URL . 'assets/data/exceptions.json'
		);

		$script_data = wp_json_encode(
			array(
				'selectors'           => Geohyph_Plugin::get_active_selectors(),
				'autoJustify'         => ! empty( $options['auto_justify'] ),
				'loadDictionary'      => ! empty( $options['load_dictionary'] ),
				'leftMin'             => (int) $options['left_min'],
				'rightMin'            => (int) $options['right_min'],
				'headingSkipSelector' => Geohyph_Plugin::get_heading_skip_selector(),
				'dictionaryUrl'       => $dictionary_url,
			)
		);

		if ( $script_data ) {
			wp_add_inline_script(
				'geohyph-frontend',
				'var geohyphSettings = ' . $script_data . ';',
				'before'
			);
		}
	}

	/**
	 * Whether the current request renders inside the Elementor editor or
	 * preview (or the Customizer) — hyphenation must stand aside there so
	 * soft hyphens never end up saved into edited content.
	 */
	private function is_builder_context(): bool {
		if ( is_customize_preview() ) {
			return true;
		}

		if ( ! did_action( 'elementor/loaded' ) || ! class_exists( '\Elementor\Plugin' ) ) {
			return false;
		}

		$elementor = \Elementor\Plugin::$instance;

		if ( $elementor->editor && $elementor->editor->is_edit_mode() ) {
			return true;
		}

		if ( $elementor->preview && $elementor->preview->is_preview_mode() ) {
			return true;
		}

		return false;
	}
}
