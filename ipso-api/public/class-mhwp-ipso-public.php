<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @since      1.0.0
 * @package    MHWP_IPSO
 * @author     Frans Jsspers <frans.jaspers@marikenhuis.nl>
 */
require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-mhwp-ipso-reservation-controller.php';
require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-mhwp-ipso-activity-controller.php';

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, register stylesheets and scripts, register api endpoints.
 */
class MHWP_IPSO_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @var      string    $mhwp_ipso    The ID of this plugin.
	 */
	private $mhwp_ipso;

	/**
	 * The version of this plugin.
	 *
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @param string $mhwp_ipso The name of the plugin.
	 * @param string $version   The version of this plugin.
	 *
	 * @since    1.0.0
	 */
	public function __construct( string $mhwp_ipso, string $version ) {

		$this->mhwp_ipso = $mhwp_ipso;
		$this->version   = $version;

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 */
	public function enqueue_styles() {
		wp_enqueue_style( $this->mhwp_ipso . '_public', plugin_dir_url( __FILE__ ) . 'css/mhwp-ipso-public.css', array(), $this->version, 'all' );
	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( $this->mhwp_ipso . '_public', plugin_dir_url( __FILE__ ) . 'js/mhwp-ipso-public.js', array( 'jquery' ), $this->version, false );
	}

	/**
	 * Register the api endpoints.
	 */
	public function register_rest_endpoints() {
		$reservation_controller = new MHWP_IPSO_Reservation_Controller();
		$reservation_controller->register_routes();
		$activity_controller = new MHWP_IPSO_Activity_Controller();
		$activity_controller->register_routes();
	}
}
