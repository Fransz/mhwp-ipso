<?php
/**
 * Admin Settings.
 *
 * @package    MHWP_IPSO
 * @author     Frans Jsspers <frans.jaspers@marikenhuis.nl>
 */

/**
 * Class for managing admin settings
 */
class MHWP_IPSO_Admin_Settings {

	/**
	 * All settings.
	 *
	 * @var array
	 */
	protected $admin_settings;

	/**
	 * All sections.
	 *
	 * @var array
	 */
	protected $admin_sections;

	/**
	 * All fields.
	 *
	 * @var array
	 */
	protected $admin_fields;

	/**
	 * Initialize the class and set its properties.
	 */
	public function __construct() {
		$this->init_settings();
		$this->init_sections();
		$this->init_fields();
	}

	/**
	 * Initialize the property settings.
	 */
	public function init_settings() {
		$this->admin_settings = array(
			array(
				'option_group' => 'mhwp_ipso',
				'option_name'  => 'mhwp_ipso_test_apikey',
				'args'         => array( 'sanitize_callback' => array( $this, 'sanitize_test_apikey' ) ),
			),
			array(
				'option_group' => 'mhwp_ipso',
				'option_name'  => 'mhwp_ipso_live_apikey',
				'args'         => array( 'sanitize_callback' => array( $this, 'sanitize_live_apikey' ) ),
			),
			array(
				'option_group' => 'mhwp_ipso',
				'option_name'  => 'mhwp_ipso_is_test',
				'args'         => array( 'sanitize_callback' => array( $this, 'sanitize_is_test' ) ),
			),
			array(
				'option_group' => 'mhwp_ipso_mappings',
				'option_name'  => 'mhwp_ipso_mappings',
				'args'         => array( 'sanitize_callback' => array( $this, 'sanitize_mappings' ) ),
			),
		);
	}

	/**
	 * Initialize the property sections.
	 */
	public function init_sections() {
		$this->admin_sections = array(
			array(
				'id'       => 'mhwp_ipso_settings_section',
				'title'    => 'IPSO Settings',
				'callback' => function () { return null; }, //phpcs:ignore Generic.Functions.OpeningFunctionBraceKernighanRitchie.ContentAfterBrace
				'page'     => 'mhwp_ipso_dashboard',
			),
			array(
				'id'       => 'mhwp_ipso_mappings_section',
				'title'    => 'IPSO Mappings',
				'callback' => function () { return null; }, //phpcs:ignore Generic.Functions.OpeningFunctionBraceKernighanRitchie.ContentAfterBrace
				'page'     => 'mhwp_ipso_dashboard',
			),
		);
	}

	/**
	 * Initialize the property fields.
	 */
	public function init_fields() {
		$this->admin_fields = array(
			array(
				'id'       => 'mhwp_ipso_is_test',
				'title'    => 'Test',
				'callback' => array( $this, 'ipso_checkbox' ),
				'page'     => 'mhwp_ipso_dashboard',
				'section'  => 'mhwp_ipso_settings_section',
				'args'     => array(
					'setting'   => 'mhwp_ipso_is_test',
					'label_for' => 'mhwp-ipso-is_test',
					'classes'   => 'mhwp-ipso-ui-toggle',
				),
			),
			array(
				'id'       => 'mhwp_ipso_live_apikey',
				'title'    => 'LIVE API KEY',
				'callback' => array( $this, 'ipso_text_field' ),
				'page'     => 'mhwp_ipso_dashboard',
				'section'  => 'mhwp_ipso_settings_section',
				'args'     => array(
					'setting'   => 'mhwp_ipso_live_apikey',
					'label_for' => 'mhwp-ipso-apikey',
					'classes'   => 'mhwp-ipso-ui-key',
				),
			),
			array(
				'id'       => 'mhwp_ipso_test_apikey',
				'title'    => 'TEST API KEY',
				'callback' => array( $this, 'ipso_text_field' ),
				'page'     => 'mhwp_ipso_dashboard',
				'section'  => 'mhwp_ipso_settings_section',
				'args'     => array(
					'setting'   => 'mhwp_ipso_test_apikey',
					'label_for' => 'mhwp-ipso-test-apikey',
					'classes'   => 'mhwp-ipso-ui-key',
				),
			),
			array(
				'id'       => 'mhwp_ipso_mappings_activity_id',
				'title'    => 'Activity Id',
				'callback' => array( $this, 'ipso_mappings_field' ),
				'page'     => 'mhwp_ipso_dashboard',
				'section'  => 'mhwp_ipso_mappings_section',
				'args'     => array(
					'setting'   => 'mhwp_ipso_mappings',
					'label_for' => 'mhwp_ipso_mappings_activity_id',
					'classes'   => 'mhwp-ipso-ui-mapping-activity-id',
				),
			),
			array(
				'id'       => 'mhwp_ipso_mappings_url',
				'title'    => 'Activity Url',
				'callback' => array( $this, 'ipso_mappings_field' ),
				'page'     => 'mhwp_ipso_dashboard',
				'section'  => 'mhwp_ipso_mappings_section',
				'args'     => array(
					'setting'   => 'mhwp_ipso_mappings',
					'label_for' => 'mhwp_ipso_mappings_url',
					'classes'   => 'mhwp-ipso-ui-mapping-url',
				),
			),
		);
	}

	/**
	 * Registers all settings.
	 *
	 * @return void
	 */
	public function registerSettings() { // phpcs:ignore WordPress.NamingConventions.ValidFunctionName.MethodNameInvalid
		foreach ( $this->admin_settings as $setting ) {
			$args = $setting['args'] ? $setting['args'] : array();
			register_setting(
				$setting['option_group'],
				$setting['option_name'],
				$args
			);
		}
		foreach ( $this->admin_sections as $section ) {
			$callback = $section['callback'] ? $section['callback'] : '';
			add_settings_section(
				$section['id'],
				$section['title'],
				$callback,
				$section['page']
			);
		}
		foreach ( $this->admin_fields as $field ) {
			$callback = $field['callback'] ? $field['callback'] : array();
			$args     = $field['args'] ? $field['args'] : '';
			add_settings_field(
				$field['id'],
				$field['title'],
				$callback,
				$field['page'],
				$field['section'],
				$args
			);
		}
	}

	/**
	 * Sanitize the live apikey, or return the current one if not valid..
	 * TODO: We want the api key stored encrypted.
	 *
	 * @param string $key The key to sanitize.
	 * @return string
	 */
	public function sanitize_live_apikey( string $key ) : string {
		if ( empty( $key ) || $this->sanitize_apikey( $key ) ) {
			return $key;
		} else {
			return get_option( 'mhwp_ipso_live_apikey' );
		}
	}

	/**
	 * Sanitize the test apikey, or return the current one if not valid..
	 * TODO: We want the api key stored encrypted.
	 *
	 * @param string $key The key to sanitize.
	 * @return string
	 */
	public function sanitize_test_apikey( string $key ) : string {
		if ( empty( $key ) || $this->sanitize_apikey( $key ) ) {
			return $key;
		} else {
			return get_option( 'mhwp_ipso_test_apikey' );
		}
	}

	/**
	 * Removes illegal characters from api keys. display errors if the key is not valid.
	 *
	 * @param string $key The key to sanitize.
	 * @return bool
	 */
	public function sanitize_apikey( string $key ) : bool {
		$key = sanitize_text_field( $key );

		// phpcs:ignore
		if ( ! wp_verify_nonce( $_POST['_wpnonce'], 'mhwp_ipso-options' ) ) {
			add_settings_error( 'mhwp_ipso_apikey', 'mhwp-ipso-error', 'Security issues!' );
			return false;
		}

		if ( ! preg_match( '/^[a-f0-9-]{36}$/', $key ) ) {
			add_settings_error( 'mhwp_ipso_apikey', 'mhwp-ipso-error', 'Invalid key' );
			return false;
		}

		return true;
	}

	/**
	 * Sanatize the checkbox on the settings page.
	 *
	 * @param mixed $value the value of the checkbox.
	 *
	 * @return string
	 */
	public function sanitize_is_test( $value ): string {
		$oldvalue = get_option( 'mhwp_ipso_is_test' );
		if ( ! isset( $value ) ) {
			$value = '0';
		}

		// phpcs:ignore
		if ( ! wp_verify_nonce( $_POST['_wpnonce'], 'mhwp_ipso-options' ) ) {
			add_settings_error( 'mhwp_ipso_is_test', 'mhwp-ipso-error', 'Security issues!' );
			return $oldvalue;
		}

		if ( '0' !== $value && '1' !== $value ) {
			add_settings_error( 'mhwp_ipso_is_test', 'mhwp-ipso-error', 'Value for "is_test" is invalid.' );
			return $oldvalue;
		}

		return $value;
	}

	public function sanitize_mappings( $input ): array {
		$output = get_option( 'mhwp_ipso_mappings', array() );

		// phpcs:ignore
		if ( ! wp_verify_nonce( $_POST['_wpnonce'], 'mhwp_ipso_mappings-options' ) ) {
			add_settings_error( 'mhwp_ipso_mappings', 'mhwp-ipso-error', 'Security issues!' );
			return $output;
		}

		if ( ! isset( $_POST['delete'] ) && ! isset( $input ) ) {
			add_settings_error( 'mhwp_ipso_mappings', 'mhwp-ipso-error', 'Empty Form!' );
			return $output;
		}

		if ( ! isset( $_POST['delete'] ) ) {
			// We want to add a posttype. Sanatize inputs.
			$activity_id = sanitize_text_field( wp_unslash( $input['mhwp_ipso_mappings_activity_id'] ) );
			$activity_id = preg_replace( '/[^0-9]/', '', $activity_id );
			if ( empty( $activity_id ) ) {
				add_settings_error( 'mhwp_ipso_mappings', 'mhwp-ipso-error', 'Security issues!' );
				return $output;
			}
			$input['mhwp_ipso_mappings_activity_id'] = $activity_id;

			$url                             = sanitize_url( $input['mhwp_ipso_mappings_url'], array( 'http', 'https' ) );
			$input['mhwp_ipso_mappings_url'] = $url;

			$output[ $input['mhwp_ipso_mappings_activity_id'] ] = $input;
		} else {

			// We want to delete a posttype; Sanitize and check if there are still posts of this type.
			$post_type = sanitize_text_field( wp_unslash( $_POST['delete'] ) );
			$post_type = preg_replace( '/[^-_0-9a-zA-Z]/', '', $post_type );
			if ( empty( $post_type ) ) {
				add_settings_error( 'tp_cpt_manager', 'tp_cpt_error', 'Security issues!' );
				return $output;
			}

			unset( $output[ $_POST['delete'] ] );
		}
		return $output;
	}

	/**
	 * Renderer callback for a text field.
	 *
	 * @param array $args Arguments.
	 */
	public function ipso_text_field( $args ) {
		$id        = $args['label_for'];
		$value     = get_option( $args['setting'] );
		$classes   = $args['classes'];
		$html_name = $args['setting'];

		echo '<div class="' . esc_attr( $classes ) . '">' .
			 '<input type="text" id="' . esc_attr( $id ) . '" name="' . esc_attr( $html_name ) . '"' .
			 ' value="' . esc_attr( $value ) . '" />' .
			 '</div>';
	}

	/**
	 * Display a checkbox.
	 *
	 * @param array $args An array of arguments.
	 *
	 * @return void
	 * @noinspection DuplicatedCode
	 */
	public function ipso_checkbox( array $args ) {
		$id      = $args['label_for'];
		$checked = '1' === get_option( $args['setting'] ) ? 'checked' : '';
		$name    = $args['setting'];
		echo sprintf(
			'<div class="%s"><input type="checkbox" id="%s" name="%s" value="1" %s /> 
					<label for="%s"><div></div></label></div>',
			esc_attr( $args['classes'] ),
			esc_attr( $id ),
			esc_attr( $name ),
			esc_attr( $checked ),
			esc_attr( $id )
		);
	}

	public function ipso_mappings_field( array $args ) {
		$id      = $args['label_for'];
		$value   = get_option( $args['setting'][$id] );
		$classes = $args['classes'];
		$name    = $args['setting'] . '[' . $id . ']';

		echo '<div class="' . esc_attr( $classes ) . '">' .
			 '<input type="text" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '"' .
			 ' value="' . esc_attr( $value ) . '" required />' .
			 '</div>';
	}
}
