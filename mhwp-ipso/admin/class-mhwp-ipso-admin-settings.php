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
				'option_group' => 'mhwp_ipso_url_mappings',
				'option_name'  => 'mhwp_ipso_url_mappings',
				'args'         => array( 'sanitize_callback' => array( $this, 'sanitize_url_mappings' ) ),
			),
			array(
				'option_group' => 'mhwp_ipso_mail_mappings',
				'option_name'  => 'mhwp_ipso_mail_mappings',
				'args'         => array( 'sanitize_callback' => array( $this, 'sanitize_mail_mappings' ) ),
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
				'id'       => 'mhwp_ipso_url_mappings_section',
				'title'    => 'IPSO URL Mappings',
				'callback' => function () { return null; }, //phpcs:ignore Generic.Functions.OpeningFunctionBraceKernighanRitchie.ContentAfterBrace
				'page'     => 'mhwp_ipso_dashboard',
			),
			array(
				'id'       => 'mhwp_ipso_mail_mappings_section',
				'title'    => 'IPSO Email Mappings',
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
				'title'    => 'Live api key',
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
				'title'    => 'Test api key',
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
				'id'       => 'mhwp_ipso_url_mappings_id',
				'title'    => 'Activiteit Id',
				'callback' => array( $this, 'ipso_url_mappings_field' ),
				'page'     => 'mhwp_ipso_dashboard',
				'section'  => 'mhwp_ipso_url_mappings_section',
				'args'     => array(
					'setting'   => 'mhwp_ipso_url_mappings',
					'label_for' => 'mhwp_ipso_url_mappings_id',
					'classes'   => 'mhwp-ipso-ui-mapping-activity-id',
				),
			),
			array(
				'id'       => 'mhwp_ipso_url_mappings_url',
				'title'    => 'URL',
				'callback' => array( $this, 'ipso_url_mappings_field' ),
				'page'     => 'mhwp_ipso_dashboard',
				'section'  => 'mhwp_ipso_url_mappings_section',
				'args'     => array(
					'setting'   => 'mhwp_ipso_url_mappings',
					'label_for' => 'mhwp_ipso_url_mappings_url',
					'classes'   => 'mhwp-ipso-ui-mapping-url',
				),
			),
			array(
				'id'       => 'mhwp_ipso_mail_mappings_id',
				'title'    => 'Activiteit Id',
				'callback' => array( $this, 'ipso_mail_mappings_field' ),
				'page'     => 'mhwp_ipso_dashboard',
				'section'  => 'mhwp_ipso_mail_mappings_section',
				'args'     => array(
					'setting'   => 'mhwp_ipso_mail_mappings',
					'label_for' => 'mhwp_ipso_mail_mappings_id',
					'classes'   => 'mhwp-ipso-ui-mapping-activity-id',
				),
			),
			array(
				'id'       => 'mhwp_ipso_mail_mappings_addresses',
				'title'    => 'Emailadres',
				'callback' => array( $this, 'ipso_mail_mappings_field' ),
				'page'     => 'mhwp_ipso_dashboard',
				'section'  => 'mhwp_ipso_mail_mappings_section',
				'args'     => array(
					'setting'   => 'mhwp_ipso_mail_mappings',
					'label_for' => 'mhwp_ipso_mail_mappings_addresses',
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

	/**
	 * Sanitize url mappings before they are stored.
	 * An url mapping is a mapping from an activity id to an url.
	 * Deleting and adding url mappings are handled here, after being processed by optons.php and option.php.
	 * Editing url mappings are handled by the index method filling the add form while displaying the page.
	 *
	 * @param mixed $input An array of id and url for the mapping or null if we want to delete.
	 *
	 * @return array An array of all mappings. The array key is the activity id. The values are the URLs
	 */
	public function sanitize_url_mappings( $input ): array {
		$output = get_option( 'mhwp_ipso_url_mappings', array() );

		// Incorrect nonce.
		if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'mhwp_ipso_url_mappings-options' ) ) {
			add_settings_error( 'mhwp_ipso_url_mappings', 'mhwp-ipso-error', 'Security issues!' );
			return $output;
		}

		// Incorrect action.
		if ( ! isset( $_POST['delete'] ) && ! isset( $input ) ) {
			add_settings_error( 'mhwp_ipso_url_mappings', 'mhwp-ipso-error', 'Empty Form!' );
			return $output;
		}

		if ( isset( $_POST['delete'] ) ) {
			// We want to delete a url mapping; Sanitize and check the id.
			$activity_id = sanitize_text_field( wp_unslash( $_POST['delete'] ) );
			$activity_id = preg_replace( '/[^0-9]/', '', $activity_id );

			if ( empty( $activity_id ) ) {
				add_settings_error( 'mhwp_ipso_url_mappings', 'mhwp-ipso-error', 'Security issues!' );
				return $output;
			}

			if ( ! array_key_exists( $activity_id, $output ) ) {
				add_settings_error( 'mhwp_ipso_url_mappings', 'mhwp-ipso-error', 'Onbekend activiteits id.' );
				return $output;
			}

			unset( $output[ $activity_id ] );
		} else {

			// We want to add a mapping. Sanitize activity id.
			$activity_id = sanitize_text_field( wp_unslash( $input['mhwp_ipso_url_mappings_id'] ) );
			$activity_id = preg_replace( '/[^0-9]/', '', $activity_id );
			if ( empty( $activity_id ) ) {
				add_settings_error( 'mhwp_ipso_url_mappings', 'mhwp-ipso-error', 'Security issues!' );
				return $output;
			}

			// We want to add a mapping. Sanitize url.
			$url = esc_url_raw( wp_unslash( $input['mhwp_ipso_url_mappings_url'] ), array( 'http', 'https' ) );
			if ( empty( $url ) ) {
				add_settings_error( 'mhwp_ipso_url_mappings', 'mhwp-ipso-error', 'Security issues!' );
				return $output;
			}

			// Store the mapping in the setting under its activity-id.
			$output[ $activity_id ] = $url;
		}
		return $output;
	}

	/**
	 * Sanitize mail mappings before they are stored.
	 * An email mapping is a mapping from an activity id to an array with a title
	 * and a string of email addresses seperated by ','.
	 * The id and addresses list are settings, the title isn't. We store it with the settings
	 * for displaying only.
	 *
	 * Deleting and adding mail mappings are handled here, after being processed by options.php and option.php.
	 * Editing mail mappings are handled by the index method filling the add form while displaying the page.
	 *
	 * @param mixed $input An array of id and emailadresses for the mapping or null if we want to delete.
	 *
	 * @return array An array of all mappings. The array key is the activity id. The values are email addresses seperated by ','
	 */
	public function sanitize_mail_mappings( $input ): array {
		$output = get_option( 'mhwp_ipso_mail_mappings', array() );

		// Incorrect nonce.
		if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'mhwp_ipso_mail_mappings-options' ) ) {
			add_settings_error( 'mhwp_ipso_mail_mappings', 'mhwp-ipso-error', 'Security issues!' );
			return $output;
		}

		// Incorrect action.
		if ( ! isset( $_POST['delete'] ) && ! isset( $input ) ) {
			add_settings_error( 'mhwp_ipso_mail_mappings', 'mhwp-ipso-error', 'Empty Form!' );
			return $output;
		}

		if ( isset( $_POST['delete'] ) ) {
			// We want to delete a mapping; Sanitize and check the activity_id.
			$activity_id = sanitize_text_field( wp_unslash( $_POST['delete'] ) );
			$activity_id = preg_replace( '/[^0-9]/', '', $activity_id );

			if ( empty( $activity_id ) ) {
				add_settings_error( 'mhwp_ipso_mail_mappings', 'mhwp-ipso-error', 'Security issues!' );
				return $output;
			}

			if ( ! array_key_exists( $activity_id, $output ) ) {
				add_settings_error( 'mhwp_ipso_mail_mappings', 'mhwp-ipso-error', 'Onbekend activiteits id.' );
				return $output;
			}

			unset( $output[ $activity_id ] );
		} else {

			// We want to add a mapping. Sanitize activity id.
			$activity_id = sanitize_text_field( wp_unslash( $input['mhwp_ipso_mail_mappings_id'] ) );
			$activity_id = preg_replace( '/[^0-9]/', '', $activity_id );
			if ( empty( $activity_id ) ) {
				add_settings_error( 'mhwp_ipso_mail_mappings', 'mhwp-ipso-error', 'Security issues!' );
				return $output;
			}

			// We want to add a mapping. Check the emailaddresses.
			$email_list = '';
			$emails     = preg_split( '/\s*,\s*/', trim( $input['mhwp_ipso_mail_mappings_addresses'] ) );
			foreach ( $emails as $email ) {
				if ( ! is_email( $email ) ) {
					add_settings_error( 'mhwp_ipso_mail_mappings', 'mhwp-ipso-error', 'Not a valid email address: ' . $email );
					return $output;
				}
				$email_list = $email_list . ',' . $email;
			}
			$email_list = ltrim( $email_list, ',' );

			// Fetch the activites title from ipso, add it to the mail mapping.
			$client        = new MHWP_IPSO_Client();
			$data          = array(
				'activityID' => $activity_id,
			);
			$activity_resp = $client->get_activity( $data );

			// If we could not correctly fetch the activity we have no title.
			if ( is_wp_error( $activity_resp ) || 200 !== $activity_resp->mhwp_ipso_code || ! isset( $activity_resp->data ) ) {
				$title = '';
			} else {
				$title = $activity_resp->data->title;
			}

			// Store the mapping in the setting under its activity-id.
			$output[ $activity_id ] = array(
				'addresses' => $email_list,
				'title'     => $title,
			);
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

		echo sprintf(
			'<div class="%s"><input type="text" id="%s" name="%s" value="%s" /></div>',
			esc_attr( $classes ),
			esc_attr( $id ),
			esc_attr( $html_name ),
			esc_attr( $value )
		);
	}

	/**
	 * Callback for rendering a checkbox.
	 *
	 * @param array $args An array of arguments.
	 *
	 * @return void
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

	/**
	 * Render callback for mail mapping fields;
	 *
	 * @param array $args  The array of arguments.
	 *
	 * @return void
	 */
	public function ipso_mail_mappings_field( array $args ) {
		$id       = $args['label_for'];
		$value    = '';
		$readonly = '';
		$classes  = $args['classes'];
		$name     = $args['setting'] . '[' . $id . ']';

		if ( isset( $_POST['edit'] ) ) { // phpcs:disable WordPress.Security.NonceVerification.Missing
			// If we are editing, retrieve values for the fields from the mail_mappings
			// option with the id that is in $edit.
			// We checked the nonce already in the index function.
			$edit = sanitize_text_field( wp_unslash( $_POST['edit'] ) );
			$edit = preg_replace( '/[^0-9]/', '', $edit );

			$option = get_option( $args['setting'] );

			// Todo: Remove this if all mappings are arrays.
			$mappings = array_map(
				function ( $m ): array {
					if ( is_array( $m ) ) {
						return $m;
					} else {
						return array(
							'title'     => 'onbekend',
							'addresses' => $m,
						);
					}
				},
				$option
			);

			if ( 'mhwp_ipso_mail_mappings_id' === $id ) {
				// readonly inputs, the value is in the EDIT parameter.
				$value    = $edit;
				$readonly = 'readonly';
			} elseif ( 'mhwp_ipso_mail_mappings_addresses' === $id ) {
				$value = $mappings[ $edit ]['addresses'];
			}
		}

		// Todo we need an extra field here for the activities title.
		echo sprintf(
			'<div class="%s"><input type="text" id="%s" name="%s" value="%s" %s required /></div>',
			esc_attr( $classes ),
			esc_attr( $id ),
			esc_attr( $name ),
			esc_attr( $value ),
			esc_attr( $readonly )
		);
	}

	/**
	 * Render callback for mail mapping fields;
	 *
	 * @param array $args  The array of arguments.
	 *
	 * @return void
	 */
	public function ipso_url_mappings_field( array $args ) {
		$id       = $args['label_for'];
		$value    = '';
		$readonly = '';
		$classes  = $args['classes'];
		$name     = $args['setting'] . '[' . $id . ']';

		// If we are editing, retrieve values for the id that is in $edit.
		// We already checked the nonce and validity.
		// phpcs:disable WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST['edit'] ) ) {
			$edit = sanitize_text_field( wp_unslash( $_POST['edit'] ) );
			$edit = preg_replace( '/[^0-9]/', '', $edit );

			$option = get_option( $args['setting'] );

			if ( 'mhwp_ipso_url_mappings_id' === $id ) {
				// readonly inputs, the value is in the EDIT parameter.
				$value    = $edit;
				$readonly = 'readonly';
			} else {
				$value = $option[ $edit ];
			}
		}
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		// Todo we need an extra field here for the activities title.
		echo sprintf(
			'<div class="%s"><input type="text" id="%s" name="%s" value="%s" %s required /></div>',
			esc_attr( $classes ),
			esc_attr( $id ),
			esc_attr( $name ),
			esc_attr( $value ),
			esc_attr( $readonly )
		);
	}
}
