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

<h2>Activities</h2>

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

if ( $response->is_error() || 200 !== $response->data->mhwp_ipso_code ) {
	// Convert to a WP_Error object.
	$err        = $response->as_error();
	$message    = $err->get_error_message();
	$error_data = $err->get_error_data();
	wp_die( esc_html( printf( '<p>An error occurred: %s (%d)</p>', $message, $error_data ) ) );
}

$data = $response->get_data();
?>

<hr />

<form method="POST" action="">
	<input type="hidden" name="mhwp_ipso_tab" value="Activiteiten" />
	<?php wp_nonce_field( 'mhwp_ipso_activities-options' ); ?>

	<label for="datepicker" >Kies een datum</label>
	<input type="date" id="datepicker" name="date" size="30" />
	<?php submit_button( 'Toon', 'submit', 'submit', false ); ?>
</form>

<hr />

<?php
$display_date = ( new DateTime( $date ) )->format( 'd-M-Y' );
echo '<h2>Activiteiten op: ' . esc_html( $display_date ) . '</h2>';
if ( empty( $data->data ) ) {
	echo '<h4>Geen activiteiten gevonden</h4>';
} else {
	echo '<ul class="ui-list"><li><h4>Datum</h4></li><li><h4>Agenda Id</h4></li><li><h4>Actviteit Id</h4></li><li><h4>Titel</h4></li></ul>';
}
?>
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
