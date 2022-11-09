<?php
/**
 * Fired during plugin activation
 *
 * @since      1.0.0
 * @package    MHWP_IPSO
 * @author     Frans Jsspers <frans.jaspers@marikenhuis.nl>
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    MHWP_IPSO
 */
class MHWP_IPSO_Activator {

	/**
	 * Activate the plugin, set defalt option values.
	 */
	public static function activate() {
		add_option( 'mhwp_ipso_apikey', '' );
		add_option( 'mhwp_ipso_is_test', '1' );
	}

}