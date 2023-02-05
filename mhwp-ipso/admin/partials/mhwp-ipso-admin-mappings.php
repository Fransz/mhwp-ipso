<?php
	/**
	 * Template for ipso mappings, displays a form to create, update and delete mappings.
	 *
	 * The forms for delete and add/create are handled by options.php, and
	 * passed through to the sanitization function for setting mhwp_ipso_url_mappings.
	 * The form for editing a mapping is just posted back to the original page
	 * (mhwp_ips_-dashboard), Which displays the same page but with the add form filled with the mapping to be edited.
	 *
	 * @package    MHWP_IPSO
	 * @author     Frans Jaspers <frans.jaspers@marikenhuis.nl>
     *
     * Todo mail: this needs to be copied for another tab.
	 */

?>

<h2>Reserveringen die buiten IPSO om verwerkt worden.</h2>

<?php
	// Get the current mappings, write a header.
	$mappings = get_option( 'mhwp_ipso_url_mappings', array() );

	// phpcs:disable Generic.WhiteSpace.DisallowSpaceIndent.SpacesUsed,Generic.WhiteSpace.ScopeIndent.IncorrectExact
    if ( empty( $mappings ) ) {
	echo '<h4>Er zijn nog geen uitzonderingen gedefineerd</h4>';
    } else {
	echo '<ul class="ui-list"><li><h4>Activiteit Id</h4></li><li><h4>URL</H4></li><li></li></ul>';
    }
	// phpcs:enable
?>

<?php foreach ( $mappings as $activity_id => $url ) : ?>
		<ul class="ui-list">
			<li>
				<span><?php echo esc_html( $activity_id ); ?></span>
			</li>
			<li>
				<span><?php echo esc_url( $url ); ?></span>
			</li>
			<li>
				<div>
					<form id="mhwp-ipso-mapping-edit" method="post" action="<?php echo esc_url( remove_query_arg( 'mhwp_ipso_tab' ) ); ?>">
						<input type="hidden" name="edit" value="<?php echo esc_attr( $activity_id ); ?>" />
						<input type="hidden" name="mhwp_ipso_tab" value="Afwijkende reserveringen" />
					<?php
						settings_fields( 'mhwp_ipso_url_mappings' );
						submit_button( 'edit', 'primary', 'submit', false, null );
					?>
					</form>
					<form id="mhwp-ipso-mapping-del" method="post" action="options.php">
						<input type="hidden" name="delete" value="<?php echo esc_attr( $activity_id ); ?>" />
						<input type="hidden" name="mhwp_ipso_tab" value="Afwijkende reserveringen" />
						<?php
						settings_fields( 'mhwp_ipso_url_mappings' );
						submit_button( 'delete', 'delete', 'submit', false, null );
						?>
					</form>
				</div>
			</li>
		</ul>
<?php endforeach; ?>

<hr />

<h2><?php echo isset( $edit ) ? 'Verander de URL waarop gereserveerd wordt' : 'Voeg een nieuwe afwijkende reservering toe'; ?></h2>
<form id="mhwp-ipso-mapping-add" method="post" action="options.php">
	<input type="hidden" name="mhwp_ipso_tab" value="Afwijkende reserveringen" />
	<?php
		settings_fields( 'mhwp_ipso_url_mappings' );
		echo '<table class="form-table" role="presentation">';
		do_settings_fields( 'mhwp_ipso_dashboard', 'mhwp_ipso_url_mappings_section' );
		echo '</table>';
		submit_button( 'save' );
	?>
</form>
