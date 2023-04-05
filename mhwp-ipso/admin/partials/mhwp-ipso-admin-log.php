<?php
/**
 * Template for reading the log file.
 *
 * @package  MHWP_IPSO
 * @author   Frans Jaspers
 */

?>

<?php
	require_once plugin_dir_path( dirname( dirname( __FILE__ ) ) ) . 'includes/class-mhwp-ipso-logger.php';
?>
<h2>Log</h2>

<?php
$logger = new MHWP_IPSO_Logger();

$lines = '';
if ( file_exists( $logger->logfile ) ) {
	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$lines = file_get_contents( $logger->logfile );
}
?>

<div id="mhwp-ipso-admin-log">
	<code>
		<textarea rows="25" cols="120" readonly><?php echo esc_html( $lines ); ?></textarea>
	</code>
</div>
