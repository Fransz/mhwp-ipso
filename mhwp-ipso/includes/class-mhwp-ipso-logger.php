<?php
	/**
	 * Short description for file
	 *
	 * @package  MHWP_IPSO
	 * @author   Frans Jaspers <frans.jaspers@marikenhuis.nl>
	 */

	/**
	 * Silence phpcs.
	 *
	 * phpcs:disable WordPress.WP.AlternativeFunctions.file_system_read_fopen
	 * phpcs:disable WordPress.WP.AlternativeFunctions.file_system_read_fclose
	 * phpcs:disable WordPress.WP.AlternativeFunctions.file_system_read_fwrite
	 */

	/**
	 * Class for logging.
	 *
	 * @package  MHWP_IPSO
	 * @author   Frans Jaspers <frans.jaspers@xs4all.nl>
	 */
class MHWP_IPSO_Logger {
	/**
	 * The filename we use.
	 *
	 * @var string $filename
	 */
	private static $filename = 'mhwp-ipso.log';

	/**
	 * Max nr of lines in thew logfile.
	 *
	 * @var int $log_max_lines
	 */
	private static $log_max_lines = 1000;

	/**
	 * Nr of lines to drop from the file upon truncation.
	 *
	 * @var int $delta_lines
	 */
	private static $delta_lines = 100;


	/**
	 * The logfile's name.
	 *
	 * @var string $logfile
	 */
	public $logfile;

	/**
	 * Construct a logger.
	 */
	public function __construct() {
		$pathname      = plugin_dir_path( dirname( __FILE__ ) );
		$this->logfile = $pathname . self::$filename;

		if ( ! file_exists( $this->logfile ) ) {
			touch( $this->logfile );
		}

		$this->truncate();
	}

	/**
	 * Truncate the logfile if necessary.
	 *
	 * @return void
	 */
	private function truncate() {
		$lines = $this->cnt_lines();
		$keep  = 0;

		$fp = fopen( $this->logfile, 'r+' );

		if ( $lines > self::$log_max_lines && $lines > self::$delta_lines ) {
			for ( $i = 0; $i < $lines - self::$delta_lines; $i++ ) {
				$keep += strlen( fgets( $fp ) );
			}
			ftruncate( $fp, $keep );
		}

		fclose( $fp );
	}

	/**
	 * Count the number of lines in a file.
	 *
	 * @return int the number of lines.
	 */
	private function cnt_lines() : int {
		$fp    = fopen( $this->logfile, 'r' );
		$lines = 0;

		while ( fgets( $fp ) !== false ) {
			$lines++;
		}

		fclose( $fp );
		return $lines;
	}

	/**
	 * Log a request to our api with the response from IPSO.
	 *
	 * Todo: add a column between uri and parameters with ipso's endpoint. Only after that the return code.
	 *
	 * @param array $res The response array from a call to wp_remote_request.
	 * @param array $data The parameters of the made request.
	 * @return string the added line.
	 */
	public function log( array $res, array $data = array() ) : string {
		$timestamp = isset( $_SERVER ) && isset( $_SERVER['REQUEST_TIME'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_TIME'] ) ) : '';
		$ip        = isset( $_SERVER ) && isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		$uri       = isset( $_SERVER ) && isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
		$code      = $res['response']['code'];

		$params = '';
		foreach ( $data as $param => $value ) {
			$params .= sprintf( '%s:%s,', $param, $value );
		}
		$params = rtrim( $params, ',' );

		try {
			$time = ( new DateTime( 'now', new DateTimeZone( 'Europe/Amsterdam' ) ) );
			$time = $time->format( 'd-m-Y H:i:s' );
		} catch ( Exception $e ) {
			// phpcs:ignore WordPress.DateTime.RestrictedFunctions.date_date
			$time = date( 'Y-m-d H:i:s' );
		}

		$line = sprintf( '%-19s  %-15s  %-70s  %-3s  %s' . PHP_EOL, $time, $ip, $uri, $code, $params );

		$fp = fopen( $this->logfile, 'a' );
		fwrite( $fp, $line );
		fclose( $fp );
		return $line;
	}
}
