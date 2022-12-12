<?php
/**
 * The admin-specific functionality of the plugin.
 *
 * @package    MHWP_IPSO
 * @author     Frans Jsspers <frans.jaspers@marikenhuis.nl>
 */

/**
 * The classes responsible for defining the admin menu and settings.
 */
require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-mhwp-ipso-admin-pages.php';
require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-mhwp-ipso-admin-settings.php';

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 */
class MHWP_IPSO_Admin {

	/**
	 * The ID of this plugin.
	 *
	 * @var      string $mhwp_ipso The ID of this plugin.
	 */
	private $mhwp_ipso;

	/**
	 * The version of this plugin.
	 *
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * The object for managing pages and menus.
	 *
	 * @var      MHWP_IPSO_ADMIN_PAGES $settings_api    the object for accessing wps settings api.
	 */
	private $admin_pages_mngr;

	/**
	 * The object for managing settings.
	 *
	 * @var      MHWP_IPSO_ADMIN_PAGES $settings_api    the object for accessing wps settings api.
	 */
	private $admin_settings_mngr;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @param string $plugin_id  The name of this plugin.
	 * @param string $version  The version of this plugin.
	 */
	public function __construct( string $plugin_id, string $version ) {

		$this->mhwp_ipso = $plugin_id;
		$this->version   = $version;

		$this->admin_pages_mngr    = new MHWP_IPSO_Admin_Pages();
		$this->admin_settings_mngr = new MHWP_IPSO_Admin_Settings();
	}

	/**
	 * Initialize the menu for the admin.
	 */
	public function register_admin_menu() {

		$this->admin_pages_mngr->registerAdminMenu();
	}

	/**
	 * Initialize the settings for the admin.
	 */
	public function register_admin_settings() {
		$this->admin_settings_mngr->registerSettings();
	}

	/**
	 * Register the stylesheets for the admin area.
	 */
	public function enqueue_styles() {
		wp_enqueue_style( $this->mhwp_ipso . '_admin', plugin_dir_url( __FILE__ ) . 'css/mhwp-ipso-admin.css', array(), $this->version, 'all' );
	}

	/**
	 * Register the JavaScript for the admin area.
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( $this->mhwp_ipso . '_admin', plugin_dir_url( __FILE__ ) . 'js/mhwp-ipso-admin.js', array( 'jquery' ), $this->version, false );
	}

	/**
	 * Add a query parameter to a location if appropriate.
	 *
	 * We use this to land on the correct tab of tabbed admin pages.
	 * The posted variable is set by a form on one of those tabs, added here as a
	 * query parameter, and read on the same admin pages.
	 * This function is called as a filter for redirects after options.
	 *
	 * @param string $location Location for the redirection.
	 * @param int    $status The http status.
	 *
	 * @return string
	 */
	public function filter_redirect( string $location, int $status ) : string {
		// phpcs:disable WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST['mhwp_ipso_tab'] ) ) {
			$tab = sanitize_text_field( wp_unslash( $_POST['mhwp_ipso_tab'] ) );
			return esc_url_raw( add_query_arg( 'mhwp_ipso_tab', rawurlencode( $tab ), $location ) );
		}
		return $location;
	}
}
