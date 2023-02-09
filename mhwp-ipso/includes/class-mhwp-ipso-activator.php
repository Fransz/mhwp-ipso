<?php
/**
 * Fired during plugin activation
 *
 * @package    MHWP_IPSO
 * @author     Frans Jsspers <frans.jaspers@marikenhuis.nl>
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @package    MHWP_IPSO
 */
class MHWP_IPSO_Activator {

	/**
	 * Activate the plugin, set defalt option values.
	 * todo mail: init setting. rename setting
	 */
	public static function activate() {
		add_option( 'mhwp_ipso_live_apikey', '', '', false );
		add_option( 'mhwp_ipso_test_apikey', '', '', false );
		add_option( 'mhwp_ipso_is_test', '1', '', false );
		add_option( 'mhwp_ipso_url_mappings', array(), '', false );

	}

}
