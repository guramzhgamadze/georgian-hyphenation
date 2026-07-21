<?php
/**
 * Settings screen (Settings → Georgian Hyphenation), built on the
 * WordPress Settings API. All input is cleaned in the single
 * sanitize_callback; all output is escaped in the field renderers.
 *
 * @package georgian-hyphenation
 */

defined( 'ABSPATH' ) || exit;

class Geohyph_Settings {

	private const PAGE_SLUG = 'georgian-hyphenation';

	/**
	 * Hook suffix of the settings screen, used to scope the admin CSS.
	 *
	 * @var string
	 */
	private $page_hook = '';

	public function register(): void {
		add_action( 'admin_menu', array( $this, 'add_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
	}

	public function add_menu(): void {
		$this->page_hook = add_options_page(
			__( 'Georgian Hyphenation', 'georgian-hyphenation' ),
			__( 'Georgian Hyphenation', 'georgian-hyphenation' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render_page' )
		);
	}

	public function enqueue_admin_assets( string $hook_suffix ): void {
		if ( $hook_suffix !== $this->page_hook ) {
			return;
		}
		wp_enqueue_style(
			'geohyph-admin',
			GEOHYPH_URL . 'assets/css/geohyph-admin.css',
			array(),
			GEOHYPH_VERSION
		);
	}

	public function register_settings(): void {
		register_setting(
			'geohyph_group',
			'geohyph_options',
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'sanitize' ),
				'show_in_rest'      => false,
			)
		);

		add_settings_section(
			'geohyph_main',
			__( 'General', 'georgian-hyphenation' ),
			'__return_false',
			self::PAGE_SLUG
		);

		add_settings_field(
			'geohyph_enabled',
			__( 'Hyphenation', 'georgian-hyphenation' ),
			array( $this, 'field_toggle' ),
			self::PAGE_SLUG,
			'geohyph_main',
			array(
				'key'         => 'enabled',
				'label'       => __( 'Enable Georgian hyphenation on the site', 'georgian-hyphenation' ),
			)
		);

		add_settings_field(
			'geohyph_load_dictionary',
			__( 'Exception dictionary', 'georgian-hyphenation' ),
			array( $this, 'field_toggle' ),
			self::PAGE_SLUG,
			'geohyph_main',
			array(
				'key'         => 'load_dictionary',
				'label'       => __( 'Load the bundled exception dictionary (recommended)', 'georgian-hyphenation' ),
				'description' => __( 'Improves accuracy for irregular words; loaded locally from this plugin, no external requests.', 'georgian-hyphenation' ),
			)
		);

		add_settings_field(
			'geohyph_margins',
			__( 'Minimum characters', 'georgian-hyphenation' ),
			array( $this, 'field_margins' ),
			self::PAGE_SLUG,
			'geohyph_main'
		);

		add_settings_field(
			'geohyph_auto_justify',
			__( 'Auto justify', 'georgian-hyphenation' ),
			array( $this, 'field_toggle' ),
			self::PAGE_SLUG,
			'geohyph_main',
			array(
				'key'   => 'auto_justify',
				'label' => __( 'Justify processed containers (text-align: justify)', 'georgian-hyphenation' ),
			)
		);

		add_settings_section(
			'geohyph_elementor',
			__( 'Elementor widgets', 'georgian-hyphenation' ),
			array( $this, 'section_elementor_intro' ),
			self::PAGE_SLUG
		);

		foreach ( Geohyph_Plugin::elementor_widgets() as $key => $widget ) {
			add_settings_field(
				'geohyph_' . $key,
				$widget['label'],
				array( $this, 'field_toggle' ),
				self::PAGE_SLUG,
				'geohyph_elementor',
				array(
					'key'      => $key,
					'label'    => __( 'Process this widget', 'georgian-hyphenation' ),
					'selector' => $widget['selector'],
				)
			);
		}

		add_settings_section(
			'geohyph_advanced',
			__( 'Advanced', 'georgian-hyphenation' ),
			'__return_false',
			self::PAGE_SLUG
		);

		add_settings_field(
			'geohyph_additional_selectors',
			__( 'Custom CSS selectors', 'georgian-hyphenation' ),
			array( $this, 'field_selectors' ),
			self::PAGE_SLUG,
			'geohyph_advanced'
		);
	}

	/**
	 * The single trusted cleaning point for the whole option array.
	 *
	 * @param mixed $input Raw submitted value.
	 */
	public function sanitize( $input ): array {
		if ( ! is_array( $input ) ) {
			return Geohyph_Plugin::defaults();
		}

		$clean = array();

		$boolean_keys = array(
			'enabled',
			'load_dictionary',
			'auto_justify',
		);
		$boolean_keys = array_merge( $boolean_keys, array_keys( Geohyph_Plugin::elementor_widgets() ) );

		foreach ( $boolean_keys as $key ) {
			$clean[ $key ] = ! empty( $input[ $key ] );
		}

		$clean['left_min']  = min( 5, max( 1, absint( $input['left_min'] ?? 2 ) ) );
		$clean['right_min'] = min( 5, max( 1, absint( $input['right_min'] ?? 2 ) ) );

		$clean['additional_selectors'] = sanitize_textarea_field( $input['additional_selectors'] ?? '' );

		return $clean;
	}

	public function section_elementor_intro(): void {
		echo '<p>' . esc_html__( 'Choose which Elementor widgets are processed. These are ignored on sites without Elementor.', 'georgian-hyphenation' ) . '</p>';
	}

	/**
	 * Shared toggle-switch renderer.
	 *
	 * @param array $args key, label, optional description, optional selector.
	 */
	public function field_toggle( array $args ): void {
		$options = Geohyph_Plugin::get_options();
		$key     = $args['key'];
		$checked = ! empty( $options[ $key ] );
		?>
		<label class="geohyph-switch">
			<input type="checkbox"
				name="geohyph_options[<?php echo esc_attr( $key ); ?>]"
				value="1" <?php checked( $checked ); ?> />
			<span class="geohyph-switch__slider"></span>
		</label>
		<span class="geohyph-field__label"><?php echo esc_html( $args['label'] ); ?></span>
		<?php
		if ( ! empty( $args['selector'] ) ) {
			echo '<code class="geohyph-field__selector-code">' . esc_html( $args['selector'] ) . '</code>';
		}
		if ( ! empty( $args['description'] ) ) {
			echo '<p class="description">' . esc_html( $args['description'] ) . '</p>';
		}
	}

	public function field_margins(): void {
		$options = Geohyph_Plugin::get_options();
		?>
		<label>
			<strong><?php esc_html_e( 'Before break:', 'georgian-hyphenation' ); ?></strong>
			<input type="number" class="geohyph-number-input"
				name="geohyph_options[left_min]"
				value="<?php echo esc_attr( (string) $options['left_min'] ); ?>"
				min="1" max="5" />
		</label>
		&nbsp;&nbsp;
		<label>
			<strong><?php esc_html_e( 'After break:', 'georgian-hyphenation' ); ?></strong>
			<input type="number" class="geohyph-number-input"
				name="geohyph_options[right_min]"
				value="<?php echo esc_attr( (string) $options['right_min'] ); ?>"
				min="1" max="5" />
		</label>
		<p class="description"><?php esc_html_e( 'Minimum characters before and after a hyphenation break (default: 2).', 'georgian-hyphenation' ); ?></p>
		<?php
	}

	public function field_selectors(): void {
		$options = Geohyph_Plugin::get_options();
		?>
		<textarea name="geohyph_options[additional_selectors]" class="large-text code" rows="3"
			placeholder="p, .my-custom-class"><?php echo esc_textarea( $options['additional_selectors'] ); ?></textarea>
		<p class="description">
			<?php esc_html_e( 'Comma-separated CSS selectors of containers to hyphenate, e.g. "article p" for post content.', 'georgian-hyphenation' ); ?>
		</p>
		<p class="description">
			<strong><?php esc_html_e( 'Currently active selector list:', 'georgian-hyphenation' ); ?></strong>
			<code class="geohyph-selectors-preview"><?php echo esc_html( Geohyph_Plugin::get_active_selectors() ); ?></code>
		</p>
		<?php
	}

	public function render_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<p>
				<?php esc_html_e( 'Hybrid engine: phonetic algorithm + exception dictionary, bundled with the plugin — no external requests.', 'georgian-hyphenation' ); ?>
			</p>
			<form action="options.php" method="post">
				<?php
				settings_fields( 'geohyph_group' );
				do_settings_sections( self::PAGE_SLUG );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}
}
