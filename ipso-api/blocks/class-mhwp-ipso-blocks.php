<?php
/**
 * The blocks-specific functionality of the plugin
 *
 * @package    MHWP_IPSO
 * @author     Frans Jaspers <frans.jaspers@marikenhuis.nl>
 */

require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-mhwp-ipso-client.php';

/**
 * The blocks-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the block-specific stylesheet and JavaScript.
 *
 * @package    MHWP_IPSO
 * @author     Frans Jaspers <frans.jaspers@marikenhuis.nl>
 */
class MHWP_IPSO_Blocks {

	/**
	 * The ID of this plugin.
	 *
	 * @access   private
	 * @var      string    $mhwp_ipso    The ID of this plugin.
	 */
	private $mhwp_ipso;

	/**
	 * The version of this plugin.
	 *
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @param      string $mhwp_ipso       The name of this plugin.
	 * @param      string $version    The version of this plugin.
	 */
	public function __construct( string $mhwp_ipso, string $version ) {

		$this->mhwp_ipso = $mhwp_ipso;
		$this->version   = $version;

	}

	/**
	 * Register the stylesheets for blocks.
	 *
	 */
	public function enqueue_styles() {
		$ver = MHWP_IPSO__DEV_MODE ? time() : $this->version;

		// TODO: Styles from the block come from block.json. If we dont have other
		// stylesheets this can be dropped.
	}

	/**
	 * Register the JavaScript for the blocks.
	 *
	 */
	public function enqueue_scripts() {
		$ver = MHWP_IPSO__DEV_MODE ? time() : $this->version;

		// TODO is this the place to enqueue this?
		if ( ! is_admin() ) {
			wp_enqueue_script(
				$this->mhwp_ipso . '_blocks_validate',
				'https://cdn.jsdelivr.net/npm/jquery-validation@1.19.5/dist/jquery.validate.min.js',
				array( 'jquery' ),
				$ver,
				true
			);
			wp_enqueue_script(
				$this->mhwp_ipso . '_blocks_validate_l10n',
				'https://cdn.jsdelivr.net/npm/jquery-validation@1.19.5/dist/localization/messages_nl.min.js',
				array( 'jquery', $this->mhwp_ipso . '_blocks_validate' ),
				$ver,
				true
			);
		}
	}

	/**
	 * Register the block.
	 */
	public function register_blocks() {
		/**
		 * Set additional attributes depending on the test option.
		 *
		 * TODO: The nonce invalidates the block in the backend. We want to drop it.
		 *
		 * @param array $metadata the metadata.
		 * @return array
		 */
		function filter_block_metadata( array $metadata ): array {
			if ( 'mhwp-ipso/list' === $metadata['name'] ) {
				// get the options we need.
				$metadata['attributes']['rest_nonce'] = array(
					'type'      => 'string',
					'default'   => wp_create_nonce( 'wp_rest' ),
					'source'    => 'attribute',
					'selector'  => 'input#ipso-list-nonce',
					'attribute' => 'value;',
				);
			}
			return $metadata;
		}
		add_filter( 'block_type_metadata', 'filter_block_metadata' );

		register_block_type(
			plugin_dir_path( __FILE__ ) . 'list'
		);
	}
}
