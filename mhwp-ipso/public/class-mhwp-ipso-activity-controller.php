<?php
/**
 * Define the rest controller for the activity endpoints
 *
 * @package    MHWP_IPSO
 * @author     Frans Jsspers <frans.jaspers@marikenhuis.nl>
 */

require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-mhwp-ipso-client.php';

/**
 * Class for our rest api.
 *
 * TODO: Do we need to make a difference between priviliged and unpriviliged users?
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
		register_rest_route(
			$this->namespace,
			'/' . $this->resource . '/(?P<id>[\d]+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
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
	 * TODO: drop the nrDays query parameter.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function get_items( $request ): WP_REST_Response {
		$nr_days = $request->get_param( 'nr_days' );
		if ( $nr_days ) {
			try {
				$now      = new DateTimeImmutable( 'now', new DateTimeZone( 'Europe/Amsterdam' ) );
				$interval = new DateInterval( 'P' . $nr_days . 'D' );
			} catch ( Exception $e ) {
				$error = (object) array(
					'mhwp_ipso_status' => 'error',
					'mhwp_ipso_code'   => $e->getCode(),
					'mhwp_ipso_msg'    => 'er is een probleem met timestamps op de server',
				);
				return new WP_REST_Response( $error, 500 );
			}

			$data = array(
				'from' => $now->format( 'Y-m-d' ),
				'till' => $now->add( $interval )->format( 'Y-m-d' ),
			);
		} else {
			// We assume from and till are in the correct format.
			$data = array(
				'from' => $request->get_param( 'from' ),
				'till' => $request->get_param( 'till' ),
			);
		}

		$client   = new MHWP_IPSO_Client();
		$calendar = $client->get_activities( $data );

		return new WP_REST_Response( $calendar, 200 );
	}

	/**
	 * Check permissions for getting the list of activities.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true True if the request has access to get_items, WP_Error object otherwise.
	 */
	public function get_item_permissions_check( $request ): bool {
		return true;
	}

	/**
	 * Get a single activity (really a type!) from the ipso system.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function get_item( $request ): WP_REST_Response {
		$activity_id = basename( $request->get_route() );

		$data = array(
			'activityID' => $activity_id,
		);

		$client   = new MHWP_IPSO_Client();
		$activity = $client->get_activity( $data );
		return new WP_REST_Response( $activity, 200 );
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
				'from'   => array(
					'description' => esc_html__( 'Start date in the calendar', 'mhwp-ipso' ),
					'type'        => 'string',
				),
				'till'   => array(
					'description' => esc_html__( 'End date in the calendar', 'mhwp-ipso' ),
					'type'        => 'string',
					'default'     => 7,
				),
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
