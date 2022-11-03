<?php
	/**
	 * Class for admin pages.
	 *
	 * @since      1.0.0
	 * @package    MHWP_IPSO
	 * @author     Frans Jsspers <frans.jaspers@marikenhuis.nl>
	 */

	/**
	 * Class for admin pages
	 */
class MHWP_IPSO_Admin_Pages {

	/**
	 * All pages to be registered.
	 *
	 * @var array
	 */
	protected $admin_pages;

	/**
	 * Subpages to be registered as subpage of the first page.
	 *
	 * @var array
	 */
	protected $admin_subpages;

	/**
	 * Initialize the class and set its properties.
	 */
	public function __construct() {
		$this->init_pages();
		$this->init_subpages();
	}

	/**
	 * Initialize the property main_pages;
	 */
	public function init_pages() {
		$this->admin_pages = array(
			array(
				'page_title' => 'Marikenhuis',
				'menu_title' => 'Marikenhuis',
				'capability' => 'manage_options',
				'menu_slug'  => 'mhwp_ipso_dashboard',
				'callback'   => array( $this, 'index' ),
				'icon_url'   => 'dashicons-sos',
				'position'   => 999,
			),
		);
	}

	/**
	 * Initialize the property main_pages;
	 */
	public function init_subpages() {
		$this->admin_subpages = array();
	}

	/**
	 * Create a submenu for the first of the admin pages.
	 * Adds a first subpage with the same slug as the parent page.
	 *
	 * @param null $menu_title An optional menu title for the first subpage.
	 *
	 * @return self An instance of this class, for chaining.
	 */
	public function withSubPages( $menu_title = null ) {    // phpcs:ignore  WordPress.NamingConventions.ValidFunctionName.MethodNameInvalid
		if ( empty( $this->admin_pages ) ) {
			return $this;
		}

		// the parent of the subpages.
		$main_page = $this->admin_pages[0];

		$sub_page             = array(
			'parent_slug' => $main_page['menu_slug'],
			'page_title'  => $main_page['page_title'],
			'menu_title'  => empty( $menu_title ) ? $main_page['menu_title']
				: $menu_title,
			'capability'  => $main_page['capability'],
			'menu_slug'   => $main_page['menu_slug'],
			'callback'    => $main_page['callback'],
		);
		$this->admin_subpages = array( $sub_page );

		return $this;
	}

	/**
	 * Adds a page to the admin menu, and subpages to the first page.
	 * A page should be an array with fields for each parameter add_menu_page
	 * expects. SubPages are added as a submenu to the first page.
	 *
	 * @return void
	 */
	public function registerAdminMenu() {       // phpcs:ignore  WordPress.NamingConventions.ValidFunctionName.MethodNameInvalid
		if ( isset( $this->admin_pages ) ) {
			foreach ( $this->admin_pages as $page ) {
				add_menu_page(
					$page['page_title'],
					$page['menu_title'],
					$page['capability'],
					$page['menu_slug'],
					$page['callback'],
					$page['icon_url'],
					$page['position']
				);
			}
		}
		if ( isset( $this->admin_pages ) ) {
			foreach ( $this->admin_subpages as $subpage ) {
				add_submenu_page(
					$subpage['parent_slug'],
					$subpage['page_title'],
					$subpage['menu_title'],
					$subpage['capability'],
					$subpage['menu_slug'],
					$subpage['callback']
				);
			}
		}
	}

	/**
	 * Renders output put for the admin settings page.
	 */
	public function index() {
		include_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/partials/mhwp-ipso-admin-settings.php';
	}
}
