<?php
	/**
	 * Template for ipso email mappings, displays a form to create, update and delete email mappings.
	 * An email mapping is an mapping an from activity id to a string of email addresses seperated by ','.
	 * For an reservation for an activity for which there is a email mapping, we email a notice to all addresses.
	 *
	 * The forms for delete and add/create are handled by options.php, and
	 * passed through to the sanitization function for setting mhwp_ipso_url_mappings.
	 * The form for editing a mapping is just posted back to the original page
	 * (mhwp_ips_-dashboard), Which displays the same page but with the add form filled with the mapping to be edited.
	 *
	 * @package    MHWP_IPSO
	 * @author     Frans Jaspers <frans.jaspers@marikenhuis.nl>
	 */

?>

<h2>Email adressen die gemaild worden bij een reservering van een activiteit.</h2>

<?php
	// Get the current mappings.
	$option = get_option( 'mhwp_ipso_mail_mappings', array() );

	// Todo: Remove this if all mappings are arrays.
	$mappings = array_map(
		function ( $m ): array {
			if ( is_array( $m ) ) {
				return $m;
			} else {
				return array(
					'title'     => 'onbekend',
					'addresses' => $m,
				);
			}
		},
		$option
	);

	// Write a header.
	// phpcs:disable Generic.WhiteSpace.DisallowSpaceIndent.SpacesUsed,Generic.WhiteSpace.ScopeIndent.IncorrectExact
    if ( empty( $mappings ) ) {
		echo '<h4>Er zijn nog geen emails gedefineerd</h4>';
        } else {
            echo '<ul class="ui-list"><li class="ui-list-id"><h4>Id</h4></li><li class="ui-list-title"><h4>Naam</H4></li><li class="ui-list-mail-mapping"><h4>Mail adressen</h4></li><li class="ui-list-buttons"></li></ul>';
    }
	// phpcs:enable

?>

<?php foreach ( $mappings as $activity_id => $mapping ) : ?>
		<ul class="ui-list">
			<li class="ui-list-id">
				<span><?php echo esc_html( $activity_id ); ?></span>
			</li>
			<li class="ui-list-title">
				<span><?php echo esc_html( $mapping['title'] ); ?></span>
			</li>
			<li class="ui-list-mail-mapping">
				<span><?php echo esc_html( $mapping['addresses'] ); ?></span>
			</li>
			<li class="ui-list-button">
				<div>
					<form id="mhwp-ipso-mapping-edit" method="post" action="<?php echo esc_url( remove_query_arg( 'mhwp_ipso_tab' ) ); ?>">
						<input type="hidden" name="edit" value="<?php echo esc_attr( $activity_id ); ?>" />
						<input type="hidden" name="mhwp_ipso_tab" value="Email adressen" />
					<?php
						settings_fields( 'mhwp_ipso_mail_mappings' );
						submit_button( 'edit', 'primary', 'submit', false, null );
					?>
					</form>
					<form id="mhwp-ipso-mapping-del" method="post" action="options.php">
						<input type="hidden" name="delete" value="<?php echo esc_attr( $activity_id ); ?>" />
						<input type="hidden" name="mhwp_ipso_tab" value="Email adressen" />
						<?php
						settings_fields( 'mhwp_ipso_mail_mappings' );
						submit_button( 'delete', 'delete', 'submit', false, null );
						?>
					</form>
				</div>
			</li>
		</ul>
<?php endforeach; ?>

<hr />

<h2><?php echo isset( $edit ) ? 'Verander de email adressen die gemaild worden bij een reservering voor deze activiteit' : 'Geef de email adressen, die gemaild worden bij een reservering van deze activiteit'; ?></h2>
<h5>Meerdere email adressen scheid je met een komma, bijvoorbeeld: webmaster@marikenhuis.nl,pr@marikenhuis.nl,welkom@marikenhuis.nl</h5>
<form id="mhwp-ipso-mapping-add" method="post" action="options.php">
	<input type="hidden" name="mhwp_ipso_tab" value="Email adressen" />
	<?php
		settings_fields( 'mhwp_ipso_mail_mappings' );
		echo '<table class="form-table" role="presentation">';
		do_settings_fields( 'mhwp_ipso_dashboard', 'mhwp_ipso_mail_mappings_section' );
		echo '</table>';
		submit_button( 'save' );
	?>
</form>
