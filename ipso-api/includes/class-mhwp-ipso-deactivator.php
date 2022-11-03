<?php
/**
 * Fired during plugin deactivation
 *
 * @link       http://example.com
 * @since      1.0.0
 *
 * @package    MHWP_IPSO
 * @subpackage MHWP_IPSO/includes
 */

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.0
 * @package    MHWP_IPSO
 * @subpackage MHWP_IPSO/includes
 * @author     Your Name <email@example.com>
 */
class MHWP_IPSO_Deactivator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function deactivate() {
		delete_option( 'mhwp_ipso_apikey' );
		delete_option( 'mhwp_ipso_is_test' );
	}

}
