<?php
/**
 * Connects to the ipso system
 *
 * @package    MHWP_IPSO
 * @author     Frans Jsspers <frans.jaspers@marikenhuis.nl>
 */

require_once plugin_dir_path( dirname( __FILE__ )) . 'includes/class-mhwp-ipso-logger.php';

/**
 * Class for connecting to the ipso system.
 * We provide methods for each endpoint.These setup the request parameters,
 * encode data to a json string if necessary, check the response for errors.
 */
class MHWP_IPSO_Client {

	/**
	 * The json response for failing to make the request.
	 *
	 * @var object
	 */
	private $error_failure;

	/**
	 * The json response for a 404 error.
	 *
	 * @var object
	 */
	private $error_404;

	/**
	 * The json response for all other http errors.
	 *
	 * @var object
	 */
	private $error;

	/**
	 * The json response for an ok response.
	 *
	 * @var object
	 */
	private $ok;

	/**
	 * The method to use for the request.
	 *
	 * @var string method
	 */
	private $method;

	/**
	 * The url to use.
	 *
	 * @var array host
	 */
	private $url;

	/**
	 * The data for the request.
	 *
	 * @var string array
	 */
	private $data;

	/**
	 * The timeout we want to use.
	 *
	 * @var string integer
	 */
	private $timeout = 10;

	/**
	 * Headers
	 *
	 * @var string array
	 */
	private $headers = array();

	/**
	 * A logger instance
	 *
	 * @var MHWP_IPSO_logger $logger
	 */
	private $logger;

	/**
	 * Constructor, initialize standard responses, initialize the url array.
	 * Open the logger.
	 */
	public function __construct() {
		$this->init_std_responses();

		$this->url = array(
			'scheme' => 'https://',
			'host'   => '',
			'path'   => '',
		);

		$is_test = get_option( 'mhwp_ipso_is_test', '1' );
		if ( '0' === $is_test ) {
			$this->url['host'] = 'api.ipso.community';
		} else {
			$this->url['host'] = 'api.test.ipso.community';
		}

		$this->logger = new MHWP_IPSO_Logger();
	}

	/**
	 * Initialize our standard response.
	 * The type casting cannot be done on the attributes directly.
	 */
	private function init_std_responses() {
		// phpcs:ignore  Generic.Arrays.DisallowShortArraySyntax
		$this->error_failure = (object) [
			'mhwp_ipso_status' => 'error',
			'mhwp_ipso_code'   => 0,
			'mhwp_ipso_msg'    => 'Er gaat iets niet goed op de server',
		];

		// phpcs:ignore  Generic.Arrays.DisallowShortArraySyntax
		$this->error_404 = (object) [
			'mhwp_ipso_status' => 'error',
			'mhwp_ipso_code'   => 404,
			'mhwp_ipso_msg'    => 'Het registratiesysteem is onbekend',
		];

		// phpcs:ignore  Generic.Arrays.DisallowShortArraySyntax
		$this->error = (object) [
			'mhwp_ipso_status' => 'error',
			'mhwp_ipso_code'   => 0,
			'mhwp_ipso_msg'    => 'Het registratiesysteem reageert niet',
		];

		// phpcs:ignore  Generic.Arrays.DisallowShortArraySyntax
		$this->ok = (object) [
			'mhwp_ipso_status' => 'ok',
			'mhwp_ipso_code'   => 200,
			'mhwp_ipso_msg'    => '',
			'data'             => array(),
		];

	}

	/**
	 * Request IPSO for Activities/addParticipants
	 * We need to json encode the data, so we have a string.
	 *
	 * @param array $data The data to send.
	 * @return object
	 */
	public function add_participants( array $data ): object {
		$this->method      = 'POST';
		$this->url['path'] = '/api/Activities/addParticipant';

		// We are going to post json, set the correct header.
		$this->headers['Content-type'] = 'application/json';

		// Encode the data as a json string.
		$json = wp_json_encode( $data );
		if ( false === $json ) {
			$this->error->mhwp_ipso_msg = 'Ongeldige data';
			return $this->error;
		}
		$this->data = $json;

		$res = $this->request();
		$this->logger->log( $res, $data );
		return $this->response( $res );
	}

	/**
	 * Request IPSO for Activities/getCalendarActivities
	 *
	 * @param array $data The data to send.
	 * @return object
	 */
	public function get_activities( array $data ): object {
		$this->method      = 'GET';
		$this->url['path'] = '/api/Activities/GetCalendarActivities';
		$this->data        = $data;

		$res = $this->request();
		$this->logger->log( $res );
		return $this->response( $res );
	}

	/**
	 * Request IPSO for Activities/getActivityInfo
	 * The returned data is extended with reservation mappings; images url;
	 *
	 * @param array $data The data to send.
	 * @return object
	 */
	public function get_activity( array $data ): object {
		$mappings = get_option( 'mhwp_ipso_mappings', array() );

		$this->method      = 'GET';
		$this->url['path'] = '/api/Activities/GetActivityInfo';
		$this->data        = $data;

		$res = $this->request();
		$this->logger->log( $res );
		$response = $this->response( $res );

		if ( isset( $response->data ) ) {
			if ( isset( $response->data->id ) && array_key_exists( $response->data->id, $mappings ) ) {
				// A mapping exisits for this activity. Add the url.
				$response->data->reservationUrl = $mappings[ $response->data->id ];
			}
			// phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
			if ( isset( $response->data->mainImage ) ) {
				// An image exisits for this activity. Prepend scheme and host.
				$response->data->mainImage = $this->url['scheme'] .
					rtrim( $this->url['host'], '/' ) . $response->data->mainImage;
			}
			// phpcs:enable
		}
		return $response;
	}

	/**
	 * Gets the url as a string.
	 *
	 * @return string The url to use.
	 */
	private function get_url() : string {
		return $this->url['scheme'] . $this->url['host'] . $this->url['path'];
	}

	/**
	 * Connects to the ipso system.
	 * We set the used headers here (apikey!), and get the url from our attribute.
	 *
	 * @return array|WP_Error
	 */
	private function request() {
		$url = $this->get_url();

		// get the correct api key.
		$is_test = get_option( 'mhwp_ipso_is_test', '1' );
		if ( '0' === $is_test ) {
			$apikey = get_option( 'mhwp_ipso_live_apikey', '' );
		} else {
			$apikey = get_option( 'mhwp_ipso_test_apikey', '' );
		}

		// Set common headers, merge with specific ones.
		$headers = array_merge(
			array(
				'Accept'  => 'application/json',
				'Api-Key' => $apikey,
			),
			$this->headers
		);

		$args = array(
			'method'  => $this->method,
			'headers' => $headers,
			'body'    => $this->data,
			'timeout' => $this->timeout,
		);

		// Make the request.
		return wp_remote_request( $url, $args );
	}

	/**
	 * Checks the request for errors and returns an object with the ipso data
	 * in attribute data
	 *
	 * @param array | WP_Error $resp The response we received from the server.
	 *
	 * @return object An array with at least a status code.
	 */
	private function response( $resp ) : object {
		if ( is_wp_error( $resp ) ) {
			$this->error_failure->mhwp_ipso_code = $resp->get_error_code();
			return $this->error_failure;
		}

		if ( 404 === $resp['response']['code'] ) {
			return $this->error_404;
		}

		if ( 200 !== $resp['response']['code'] ) {
			$this->error->mhwp_ipso_code = $resp['response']['code'];
			return $this->error;
		}

		if ( ! empty( $resp['body'] ) ) {
			$arr            = json_decode( $resp['body'] );
			$this->ok->data = $arr;
		}
		return $this->ok;
	}
}
