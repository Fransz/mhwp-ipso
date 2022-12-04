<?php
/**
 * Short description for file
 *
 * @package  MHWP_IPSO
 * @author   Frans Jaspers
 */

?>

<form id="admin_manager" method="post" action="options.php">

	<?php

		settings_fields( 'mhwp_ipso' );
		do_settings_sections( 'mhwp_ipso_dashboard' );
		submit_button( 'save' );
	?>

</form>
