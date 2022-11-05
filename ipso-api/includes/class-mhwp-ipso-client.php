<?php
/**
 * Connects to the ipso system
 *
 * @since      1.0.0
 * @package    MHWP_IPSO
 * @author     Frans Jsspers <frans.jaspers@marikenhuis.nl>
 */

/**
 * Class for connecting to the ipso system.
 * We provide methods for each endpoint.These setup the request parameters,
 * encode data to a json string if necessary, check the response for errors.
 */
class MHWP_IPSO_Client {

	/**
	 * The json response for failng to make the request.
	 *
	 * @var string[]
	 */
	private $error_failure = array(
		'mhwp_ipso_status' => 'error',
		'mhwp_ipso_msg'    => 'Er gaat iets niet goed op de server',
	);

	/**
	 * The json response for a 404 error.
	 *
	 * @var string[]
	 */
	private $error_404 = array(
		'mhwp_ipso_status' => 'error',
		'mhwp_ipso_code'   => 404,
		'mhwp_ipso_msg'    => 'Het registratiesysteem is onbekend',
	);

	/**
	 * The json response for all other http errors.
	 *
	 * @var string[]
	 */
	private $error = array(
		'mhwp_ipso_status' => 'error',
		'mhwp_ipso_msg'    => 'Het registratiesysteem reageert niet',
	);

	/**
	 * The json response for an ok response.
	 *
	 * @var string[]
	 */
	private $ok = array(
		'mhwp_ipso_status' => 'ok',
	);

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
	 * Constructor, initialize the url array.
	 */
	public function __construct() {
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
	}

	/**
	 * Request IPSO for Activities/addParticipants
	 * We need to json encode the data so we have a string.
	 *
	 * @param array $data The data to send.
	 * @return array
	 */
	public function add_participants( array $data ): array {
		$this->method      = 'POST';
		$this->url['path'] = '/api/Activities/addParticipant';

		// We are gonna post json, set the correct header.
		$this->headers['Content-type'] = 'application/json';

		// Encode the data as a json string.
		$json = wp_json_encode( $data );
		if ( false === $json ) {
			return array(
				'mhwp_ipso_status' => 'error',
				'mhwp_ipso_code'   => 0,
				'mhwp_ipso_msg'    => 'Ongeldige data',
			);
		}
		$this->data = $json;

		return $this->response( $this->request() );
	}

	/**
	 * Request IPSO for Activities/getCalendarActivities
	 *
	 * @param array $data The data to send.
	 * @return array
	 */
	public function get_calendar_activities( array $data ): array {
		$this->method      = 'GET';
		$this->url['path'] = '/api/Activities/GetCalendarActivities';
		$this->data        = $data;

		$req = $this->request();
		return $this->response( $req );
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
	 * @return mixed
	 */
	private function request() {
		$url = $this->get_url();

		// Set common headers, merge with specific ones.
		$apikey  = get_option( 'mhwp_ipso_apikey', '' );
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
	 * Checks the request for errors and returns an array of the received json data.
	 *
	 * @param array | WP_Error $resp The response we received from the server.
	 * @return array An array with at least a status code.
	 */
	private function response( $resp ) : array {
		if ( is_wp_error( $resp ) ) {
			$this->error_failure['mhwp_ipso_code'] = $resp->get_error_code();
			return $this->error_failure;
		}

		if ( 404 === $resp['response']['code'] ) {
			return $this->error_404;
		}

		if ( 200 !== $resp['response']['code'] ) {
			$this->error['mhwp_ipso_code'] = $resp['response']['code'];
			return $this->error;
		}

		if ( empty( $resp['body'] ) ) {
			return $this->ok;
		} else {
			$arr = json_decode( $resp['body'] );
			return array_merge( $this->ok, $arr );
		}
	}
}
