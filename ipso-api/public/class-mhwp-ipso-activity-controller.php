<?php
/**
 * Define the rest controller for the activity. endpoints.
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
 *       This makes it more difficult to make multiple reservations from the frontend.
 */
class MHWP_IPSO_Activity_Controller extends WP_REST_Controller {

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
		$this->resource  = 'activity';
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
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::READABLE ),
				),
				'schema' => array( $this, 'get_item_schema' ),
			)
		);
	}

	/**
	 * Check permissions for getting the list of activities.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true True if the request has access to get_items, WP_Error object otherwise.
	 */
	public function get_items_permissions_check( $request ): bool {
		return true;
	}

	/**
	 * Get the list of activities in the ipso system.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function get_items( $request ): WP_REST_Response {
		$testData = array(
			array(
				'activityID' => 4,
				'extraInfo'  => 'Een stevig rondje lopen!',
				'id'         => 2076,
				'onDate'     => '2022-06-28T00:00:00',
				'timeEnd'    => '2022-06-28T15:59:00',
				'timeOpen'   => '2022-06-28T11:30:00',
				'timeStart'  => '2022-06-28T12:00:00',
				'title'      => 'Wandelen in het Goffertpark',
			),

			array(
				'activityID' => 3,
				'extraInfo'  => '',
				'id'         => 2117,
				'onDate'     => '2022-06-30T00:00:00',
				'timeEnd'    => '2022-06-30T16:00:00',
				'timeOpen'   => '2022-06-30T13:00:00',
				'timeStart'  => '2022-06-30T14:00:00',
				'title'      => 'Wereldkankerdag',
			),
		);

		$client = new MHWP_IPSO_Client();
		$data   = array(
			'nrDays' => $request->get_param( 'nrDays' ),
		);
		return new WP_REST_Response( $data, 200 );

		// return $client->add_participants( $json );
	}

	/**
	 * Get our schema for an activity.
	 *
	 * @return array The schema for an activity.
	 */
	public function get_item_schema() : array {
		if ( $this->schema ) {
			return $this->schema;
		}

		$this->schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'activity',
			'type'       => 'object',
			'properties' => array(
				'nrDays' => array(
					'description' => esc_html__( 'The number of days to show in the calendar', 'mhwp-ipso' ),
					'type'        => 'number',
					'default'     => 7,
				),
			),
		);

		return $this->schema;
	}
}
