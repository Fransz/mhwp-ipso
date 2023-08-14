<?php
/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @package           MHWP_IPSO
 *
 * @wordpress-plugin
 * Plugin Name:       MHWP_IPSO
 * Plugin URI:        http://marikenhuis.nl/
 * Description:       marikenhuis plugin. integratie met IPSO.
 * Version:           0.8.3
 * Author:            Frans Jaspers
 * Author URI:        http://fransjaspers.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 */
const MHWP_IPSO__VERSION = '0.8.3';

/**
 * Currently plugin version.
 */
const MHWP_IPSO__DEV_MODE = true;

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-mhwp-ipso-activator.php
 */
function activate_mhwp_ipso() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-mhwp-ipso-activator.php';
	MHWP_IPSO_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-mhwp-ipso-deactivator.php
 */
function deactivate_mhwp_ipso() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-mhwp-ipso-deactivator.php';
	MHWP_IPSO_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_mhwp_ipso' );
register_deactivation_hook( __FILE__, 'deactivate_mhwp_ipso' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-mhwp-ipso.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 */
function run_mhwp_ipso() {
	$plugin = new MHWP_IPSO();
	$plugin->run();
}
run_mhwp_ipso();
