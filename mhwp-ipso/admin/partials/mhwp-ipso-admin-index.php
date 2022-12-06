<?php
/**
 * Template for the ipso admin page. It consists of four tabs.
 *
 * @package  MHWP_IPSO
 * @author   Frans Jaspers
 */

?>

<div class="wrap">
	<h1>Marikenhuis - IPSO</h1>

	<?php settings_errors(); ?>

	<ul class="nav nav-tabs">
		<li class="active"><a href="#tab-1">Afwijkende reserverinjgen</a></li>
		<li><a href="#tab-2">Activiteiten</a></li>
		<li><a href="#tab-3">Instellingen</a></li>
		<li><a href="#tab-4">Logs</a></li>
	</ul>

	<div class="tab-content">
		<div id="tab-1" class="tab-pane active">
		<?php
			require_once plugin_dir_path( dirname( __FILE__ ) ) . 'partials/mhwp-ipso-admin-mappings.php';
		?>
		</div>
        <div id="tab-2" class="tab-pane">
			<?php
				require_once plugin_dir_path( dirname( __FILE__ ) ) . 'partials/mhwp-ipso-admin-activities.php';
			?>
        </div>
		<div id="tab-3" class="tab-pane">
			<?php
				require_once plugin_dir_path( dirname( __FILE__ ) ) . 'partials/mhwp-ipso-admin-settings.php';
			?>
		</div>
		<div id="tab-4" class="tab-pane">
			<?php
				require_once plugin_dir_path( dirname( __FILE__ ) ) . 'partials/mhwp-ipso-admin-log.php';
			?>
		</div>
	</div>
</div>
