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
				'schema' => array( $this, 'get_items_schema' ),
			)
		);
		register_rest_route(
			$this->namespace,
			'/' . $this->resource . 'detail',
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
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function get_items( $request ): WP_REST_Response {
		// We assume we get from and till are in the correct format from the front end.
		$data = array(
			'from' => $request->get_param( 'from' ),
			'till' => $request->get_param( 'till' ),
		);

		$client          = new MHWP_IPSO_Client();
		$activities_resp = $client->get_activities( $data );

		return new WP_REST_Response( $activities_resp, 200 );
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
	 * Get a single activity (really a activity type!) from the ipso system.
	 *
	 * The data is extended with reservation mappings; images url;
	 * The data is extended with the nr of participants.
	 * For the participants we make an extra request to IPSO.
	 * Doing that in the client would expose names and email for participants.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return object Response object on success, or WP_Error object on failure.
	 */
	public function get_item( $request ): WP_REST_Response {
		$activity_id = $request->get_param( 'activityId' );
		$calendar_id = $request->get_param( 'calendarId' );

		$data = array(
			'activityID' => $activity_id,
		);

		$client        = new MHWP_IPSO_Client();
		$activity_resp = $client->get_activity( $data );

		// If we could not correctly fetch the activity, bail out.
		if ( is_wp_error( $activity_resp ) || 200 !== $activity_resp->mhwp_ipso_code ) {
			return new WP_REST_Response( $activity_resp, 200 );
		}

		if ( isset( $activity_resp->data ) ) {
			// Get the configured mappings.
			$mappings = get_option( 'mhwp_ipso_mappings', array() );

			if ( isset( $activity_resp->data->id ) && array_key_exists( $activity_resp->data->id, $mappings ) ) {

				// A mapping exists for this activity. Add the url.
				$activity_resp->data->reservationUrl = $mappings[ $activity_resp->data->id ];
			}

			// phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
			if ( isset( $activity_resp->data->mainImage ) ) {

				// An image exists for this activity. Prepend scheme and host, the client knows about these.
				$url                            = $client->url['scheme'] . rtrim( $client->url['host'], '/' );
				$activity_resp->data->mainImage = $url . $activity_resp->data->mainImage;
			}
			// phpcs:enable
		}

		// Make another request for the participants data.
		$data = array(
			'activityId' => $calendar_id,
		);

		$participants_resp = $client->get_participants( $data );
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$activity_resp->data->nrParticipants = count( $participants_resp->data );

		return new WP_REST_Response( $activity_resp, 200 );
	}

	/**
	 * Get our schema for the activity list.
	 *
	 * @return array The schema for an activity.
	 */
	public function get_items_schema() : array {
		if ( $this->schema ) {
			return $this->schema;
		}

		$this->schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'activities',
			'type'       => 'object',
			'properties' => array(
				'from' => array(
					'description' => esc_html__( 'Start date in the calendar', 'mhwp-ipso' ),
					'type'        => 'string',
				),
				'till' => array(
					'description' => esc_html__( 'End date in the calendar', 'mhwp-ipso' ),
					'type'        => 'string',
				),
			),
		);

		return $this->schema;
	}

	/**
	 * Get our schema for an activity detail.
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
				'calendarId' => array(
					'description' => esc_html__( 'The id of the activity in the calendar', 'mhwp-ipso' ),
					'type'        => 'string',
				),
				'activityId' => array(
					'description' => esc_html__( 'The id of the activity type', 'mhwp-ipso' ),
					'type'        => 'string',
				),
			),
		);

		return $this->schema;
	}
}
