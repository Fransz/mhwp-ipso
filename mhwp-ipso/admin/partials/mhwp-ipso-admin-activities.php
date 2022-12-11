<?php
/**
 * Template for displaying activities in the backend.
 *
 * The date paramter is a query parameter processed when starting the rendering
 * of this page. In mhwp-ipso-admin-pages.php
 *
 * @package    MHWP_IPSO
 * @author     Frans Jaspers <frans.jaspers@marikenhuis.nl>
 */

?>

<h2> To be done activities</h2>

<?php
	// create rest request, set query parameters.
	// rest-do_request
	// Check for errors -> message
	// Display activities.

$endpoint = '/mhwp-ipso/v1/activity';

if ( ! isset( $date ) ) {
    //phpcs:ignore WordPress.DateTime.RestrictedFunctions.date_date
	$date = date( 'Y-m-d' );
}

// Make a rest request.
$request = new WP_REST_Request( 'GET', $endpoint );
$request->set_query_params(
	array(
		'from' => $date,
		'till' => $date,
	)
);
$response = rest_do_request( $request );

if ( $response->is_error() ) {
	// Convert to a WP_Error object.
	$err        = $response->as_error();
	$message    = $err->get_error_message();
	$error_data = $err->get_error_data();
	wp_die( esc_html( printf( '<p>An error occurred: %s (%d)</p>', $message, $error_data ) ) );
}

$data = $response->get_data();
?>

<form method="POST" action="">
	<label for="datepicker" >Kies een datum</label>
	<input type="date" id="datepicker" name="date" size="30" />
	<?php echo "<input type='hidden' name='option_page' value='mhwp_ipso_mappings' />"; ?>
	<?php echo '<input type="hidden" name="action" value="update" />'; ?>
	<?php wp_nonce_field( 'mhwp_ipso_activities-options' ); ?>
	<?php submit_button( 'Toon' ); ?>
</form>

<ul class="ui-list">
	<li><h4>Datum</h4></li><li><h4>Agenda Id</h4></li><li><h4>Actviteit Id</h4></li><li><h4>Titel</h4></li>
</ul>
<?php foreach ( $data->data as $activity ) : ?>
	<ul class="ui-list">
		<li>
			<span><?php echo esc_html( $date ); ?></span>
		</li>
		<li>
			<span><?php echo esc_html( $activity->id ); ?></span>
		</li>
		<li>
			<span><?php echo esc_html( $activity->activityID ); ?></span>
		</li>
		<li>
			<span><?php echo esc_html( $activity->title ); ?></span>
		</li>
	</ul>
<?php endforeach; ?>
