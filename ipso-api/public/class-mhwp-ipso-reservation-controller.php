<?php
/**
 * Define the rest controller for the ipso rest calls.
 *
 * @since      1.0.0
 * @package    MHWP_IPSO
 * @author     Frans Jsspers <frans.jaspers@marikenhuis.nl>
 */

require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-mhwp-ipso-client.php';

/**
 * Class for our rest api.
 *
 * TODO: Do we need to make a difference between priviliged and unpriviliged users?
 * TODO: We want a nonce in the request, and check that.
 * 		 This makes it more difficult to make multiple reservations from the frontend.
 */
class MHWP_IPSO_Reservation_Controller extends WP_REST_Controller {

	/**
	 * The route we handle here.
	 *
	 * @var string $resource
	 */
	private $resource;

	/**
	 * Construct a new REST Controller.
	 */
	public function __construct() {
		$this->namespace = 'mhwp-ipso/v1';
		$this->resource  = 'reservation';
	}

	/**
	 * Register our routes.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->resource,
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
				),
				'schema' => array( $this, 'get_item_schema' ),
			)
		);
	}

	/**
	 * Check permissions for making a reservation.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has access to create items, WP_Error object otherwise.
	 */
	public function create_item_permissions_check( $request ) {
		return true;
	}

	/**
	 * Make a reservation in the ipso system.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return string[] Response object on success, or WP_Error object on failure.
	 */
	public function create_item( $request ): array {
		$client = new MHWP_IPSO_Client();
		$json   = $request->get_json_params();
		return $client->add_participants( $json );
	}

	/**
	 * Get our schema for a reservation.
	 *
	 * @return array The schema for a reservation
	 */
	public function get_item_schema() : array {
		if ( $this->schema ) {
			// Since WordPress 5.3, the schema can be cached in the $schema property.
			return $this->schema;
		}

		$this->schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'reservation',
			'type'       => 'object',
			'properties' => array(
				'activityCalendarId' => array(
					'description' => esc_html__( 'Unique identifier for the object.', 'mhwp-ipso' ),
					'type'        => 'string',
					'required'    => true,
				),
				'firstName'          => array(
					'description' => esc_html__( 'Unique identifier for the object.', 'mhwp-ipso' ),
					'type'        => 'string',
					'required'    => true,
				),
				'lastNamePrefix'     => array(
					'description' => esc_html__( 'Unique identifier for the object.', 'mhwp-ipso' ),
					'type'        => 'string',
					'required'    => false,
				),
				'lastName'           => array(
					'description' => esc_html__( 'Unique identifier for the object.', 'mhwp-ipso' ),
					'type'        => 'string',
					'required'    => true,
				),
				'email'              => array(
					'description' => esc_html__( 'Unique identifier for the object.', 'mhwp-ipso' ),
					'type'        => 'string',
					'required'    => true,
				),
				'phoneNumber'        => array(
					'description' => esc_html__( 'Unique identifier for the object.', 'mhwp-ipso' ),
					'type'        => 'string',
					'required'    => false,
				),
			),
		);

		return $this->schema;
	}
}
