<?php
/**
 * Fired during plugin activation
 *
 * @link       https://marikenhuis.nl
 * @since      1.0.0
 *
 * @package    MHWP_IPSO
 * @subpackage MHWP_IPSO/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    MHWP_IPSO
 * @subpackage MHWP_IPSO/includes
 * @author     Your Name <email@example.com>
 */
class MHWP_IPSO_Activator {

	/**
	 * Activate the plugin, set defalt option values.
	 *
	 * @since    1.0.0
	 */
	public static function activate() {
		add_option( 'mhwp_ipso_apikey', '' );
		add_option( 'mhwp_ipso_is_test', '1' );
	}

}
