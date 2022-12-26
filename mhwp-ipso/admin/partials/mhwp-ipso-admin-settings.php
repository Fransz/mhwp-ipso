<?php
/**
 * Short description for file
 *
 * @package  MHWP_IPSO
 * @author   Frans Jaspers
 */

?>
<h2>Instellingen</h2>

<form id="admin_manager" method="post" action="options.php">
	<input type="hidden" name="mhwp_ipso_tab" value="Instellingen" />

	<?php
		settings_fields( 'mhwp_ipso' );
		echo '<table class="form-table" role="presentation">';
		do_settings_fields( 'mhwp_ipso_dashboard', 'mhwp_ipso_settings_section' );
		echo '</table>';
		submit_button( 'save' );
	?>
</form>
