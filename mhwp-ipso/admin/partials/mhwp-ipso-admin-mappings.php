<?php
	/**
	 * Template for ipso mappings, displays form to create, update and delete mappings.
	 *
	 * The forms for delete and add/create are handled by options.php, and
	 * passed through to the sanitization function for setting mhwp_ipso_mappings.
	 * The form for editing a mapping is just posted back to the original page
	 * (mhwp_ips_-dashboard), Which displays the same page but with the add form filled with the mapping to be edited.
	 *
	 * @package    MHWP_IPSO
	 * @author     Frans Jaspers <frans.jaspers@marikenhuis.nl>
	 */

?>

<h2>All Mappings</h2>

<?php
	$mappings = get_option( 'mhwp_ipso_mappings', array() );
if ( empty( $mappings ) ) :
	echo '<h4>Er zijn nog geen mappings tussen activiteiten en urls</h4>';
	else :
		?>
	<ul class="ui-list">
		<li>
			<h4>Activiteit Id</h4>
		</li>
		<li>
			<h4>URL</H4>
		</li>
		<li></li>
		<li></li>
	</ul>
<?php endif; ?>

<?php foreach ( $mappings as $activity_id => $url ) : ?>
		<ul class="ui-list">
			<li>
				<span><?php echo esc_html( $activity_id ); ?></span>
			</li>
			<li>
				<span><?php echo esc_html( $url ); ?></span>
			</li>
			<li>
				<form id="mhwp-ipso-mapping-edit" method="post" action="">
					<input type="hidden" name="edit" value="<?php echo esc_attr( $activity_id ); ?>" />
				<?php
					settings_fields( 'mhwp_ipso_mappings' );
					submit_button( 'edit', 'secondary', 'submit', false, null );
				?>
				</form>
				<form id="mhwp-ipso-mapping-del" method="post" action="options.php">
					<input type="hidden" name="delete" value="<?php echo esc_attr( $activity_id ); ?>" />
					<?php
					settings_fields( 'mhwp_ipso_mappings' );
					submit_button( 'delete', 'delete', 'submit', false, null );
					?>
				</form>
			</li>
		</ul>
<?php endforeach; ?>

<form id="mhwp-ipso-mapping-add" method="post" action="options.php">
	<?php
		settings_fields( 'mhwp_ipso_mappings' );
		echo '<table class="form-table" role="presentation">';
		do_settings_fields( 'mhwp_ipso_dashboard', 'mhwp_ipso_mappings_section' );
		echo '</table>';
		submit_button( 'save' );
	?>
</form>
