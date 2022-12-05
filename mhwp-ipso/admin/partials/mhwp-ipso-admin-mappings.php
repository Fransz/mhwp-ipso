<?php
	/**
	 * Template for ipso mappings
	 *
	 * @package    MHWP_IPSO
	 * @author     Frans Jaspers <frans.jaspers@marikenhuis.nl>
	 */

?>

<h2>All Custom Post types</h2>

<?php
	$mappings = get_option( 'mhwp_ipso_mappings', array() );

foreach ( $mappings as $mapping ) :
	?>
		<ul class="ui-list">
			<li>
				<h4>Activity Id</h4>
				<span><?php echo $mapping['mhwp_ipso_mappings_activity_id']; ?></span>
			</li>
			<li>
				<h4>URL</H4>
				<span><?php echo $mapping['mhwp_ipso_mappings_url']; ?></span>
			</li>
			<li>
				<form id="mhwp-ipso-mapping-edit" method="post" action="">
					<input type="hidden" name="edit" value="<?php echo $mapping['mhwp-ipso-mappings-activity-id']; ?>" />
				<?php
					settings_fields( 'mhwp_ipso_mappings' );
					submit_button( 'edit', 'secondary', 'submit', false, null );
				?>
				</form>
				<form id="mhwp-ipso-mapping-del" method="post" action="options.php">
					<input type="hidden" name="delete" value="<?php echo $mapping['mhwp-ipso-mappings-activity-id']; ?>" />
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
