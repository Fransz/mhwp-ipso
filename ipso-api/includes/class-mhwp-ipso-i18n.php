<?php
/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       http://example.com
 * @since      1.0.0
 *
 * @package    MHWP_IPSO
 * @subpackage MHWP_IPSO/includes
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    MHWP_IPSO
 * @subpackage MHWP_IPSO/includes
 * @author     Your Name <email@example.com>
 */
class MHWP_IPSO_I18n {


	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    1.0.0
	 */
	public function load_plugin_textdomain() {

		load_plugin_textdomain(
			'mhwp-ipso',
			false,
			dirname( plugin_basename( __FILE__ ) ) . '/languages/'
		);

	}



}
