<?php
/**
 * Define the rest controller for the ipso rest calls.
 *
 * @package    MHWP_IPSO
 * @author     Frans Jsspers <frans.jaspers@marikenhuis.nl>
 */

require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-mhwp-ipso-client.php';

/**
 * Class for our rest api.
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
	 * @return object Response object on success, or WP_Error object on failure.
	 */
	public function create_item( $request ): object {
		$client = new MHWP_IPSO_Client();
		$json   = $request->get_json_params();

		// get request parameters for mailing, drop them from the json.
		// Todo do we have to escape this; We want to prevent 2 empty lines? two dots? donno.
		$activity_id    = $json['activityId'];
		$activity_title = $json['activityTitle'] ?? '';
		$activity_date  = $json['activityDate'] ?? '';
		$activity_time  = $json['activityTime'] ?? '';
		$firstname      = $json['firstName'] ?? '';
		$prefix         = $json['lastNamePrefix'] ?? '';
		$lastname       = $json['lastName'] ?? '';
		$guest_email    = $json['email'] ?? '';
		$phonenumber    = $json['phoneNumber'] ?? '';

		// Drop parameters not needed for making the reservation from the json.
		unset( $json['activityId'] );
		unset( $json['activityTitle'] );
		unset( $json['activityDate'] );
		unset( $json['activityTime'] );

		// make the reservataion with IPSO.Community.
		$reservation_resp = $client->add_participants( $json );

		// If we could not correctly make the resevation, bail out.
		if ( is_wp_error( $reservation_resp ) || 200 !== $reservation_resp->mhwp_ipso_code ) {
			return new WP_REST_Response( $reservation_resp, 200 );
		}

		// get the mail mappings.
		$mappings = get_option( 'mhwp_ipso_mail_mappings', array() );

		// If there is a mapping for the activity_id, mail.
		if ( isset( $activity_id ) && array_key_exists( $activity_id, $mappings ) ) {
			$mail_list = $mappings[ $activity_id ];
			$emails    = explode( ',', $mail_list );

			// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
			$subject  = sprintf( 'Marikenhuis - Inschrijving activiteit %s', $activity_title );
			$message  = sprintf( 'Er is een inschrijving voor activiteit %s, op %s om %s.', $activity_title, $activity_date, $activity_time );
			$message .= PHP_EOL . sprintf( 'Naam: %s %s %s, telefoonnummer: %s email adres: %s.', $firstname, $prefix, $lastname, $phonenumber, $guest_email );
			// phpcs:enable

			foreach ( $emails as $email ) {
				$mailed = wp_mail( $email, $subject, $message );
				if ( ! $mailed ) {
					error_log( "We tried to mail: $email. Subject: $subject, message: $message" );
				}
			}
		}

		return new WP_REST_Response( $reservation_resp, 200 );
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
