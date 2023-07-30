<?php
/**
 * Define the rest controller for the participants endpoints
 *
 * @package    MHWP_IPSO
 * @author     Frans Jsspers <frans.jaspers@marikenhuis.nl>
 */

require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-mhwp-ipso-client.php';

/**
 * Class for our rest api.
 */
class MHWP_IPSO_Participants_Controller extends WP_REST_Controller {

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
		$this->resource  = 'participants';
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
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::READABLE ),
				),
				'schema' => array( $this, 'get_item_schema' ),
			)
		);
	}

	/**
	 * Check permissions for getting the number of participant of an activity.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return bool|int True if the request has access to get_items, WP_Error object otherwise.
	 */
	public function get_item_permissions_check( $request ): bool {
		if ( isset( $_REQUEST['_wpnonce'] ) ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.ValidatedSanitizedInput.MissingUnslash
			$nonce = $_REQUEST['_wpnonce'];
		} elseif ( isset( $_SERVER['HTTP_X_WP_NONCE'] ) ) {
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.ValidatedSanitizedInput.MissingUnslash
			$nonce = $_SERVER['HTTP_X_WP_NONCE'];
		} else {
			return false;
		}

		return wp_verify_nonce( $nonce, 'wp_rest' );
	}

	/**
	 * Get the nr of participants for an calendar item..
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function get_item( $request ): WP_REST_Response {
		$calendar_id = $request->get_param( 'calendarId' );

		$data = array(
			'activityId' => $calendar_id,
		);

		$client            = new MHWP_IPSO_Client();
		$participants_resp = $client->get_participants( $data );

		$nr_participants         = count( $participants_resp->data );
		$participants_resp->data = (object) array(
			'nrParticipants' => $nr_participants,
		);
		return new WP_REST_Response( $participants_resp, 200 );
	}

	/**
	 * Get our schema for the number of participants.
	 *
	 * @return array The schema for an activity.
	 */
	public function get_item_schema() : array {
		if ( $this->schema ) {
			return $this->schema;
		}

		$this->schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'participants',
			'type'       => 'object',
			'properties' => array(
				'calendarId' => array(
					'description' => esc_html__( 'The id of the activity in the calendar', 'mhwp-ipso' ),
					'type'        => 'string',
				),
			),
		);

		return $this->schema;
	}
}
