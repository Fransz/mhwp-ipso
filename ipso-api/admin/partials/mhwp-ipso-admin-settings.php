<?php
/**
 * Short description for file
 *
 * @package  MHWP_IPSO
 * @author   Frans Jasper
 * @license  https://opensource.org/licenses/gpl-2.0.php GPL2
 */

?>


<div class="wrap">
	<h1>Marikenhuis - IPSO instellingen</h1>
	<?php settings_errors(); ?>

	<ul class="nav nav-tabs">
		<li class="active"><a href="#tab-1">Settings</a></li>
	</ul>

	<div class="tab-content">
		<div id="tab-1" class="tab-pane active">
			<form id="admin_manager" method="post" action="options.php">

			<?php
				settings_fields( 'mhwp_ipso' );
				do_settings_sections( 'mhwp_ipso_dashboard' );
				submit_button( 'save' );
			?>

			</form>
		</div>
	</div>
</div>
