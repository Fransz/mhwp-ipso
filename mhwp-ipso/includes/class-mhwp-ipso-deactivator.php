<?php
/**
 * Fired during plugin deactivation
 *
 * @package    MHWP_IPSO
 * @author     Frans Jaspers<frans.jaspers@marikenhuis.nl>
 */

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @package    MHWP_IPSO
 */
class MHWP_IPSO_Deactivator {

	/**
	 * Deactivate the plugin
	 * We keep the url and mail mappings.
	 */
	public static function deactivate() {
		delete_option( 'mhwp_ipso_live_apikey' );
		delete_option( 'mhwp_ipso_test_apikey' );
		delete_option( 'mhwp_ipso_is_test' );
	}

}
