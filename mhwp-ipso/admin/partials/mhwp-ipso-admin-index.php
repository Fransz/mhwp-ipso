<?php
/**
 * Template for the ipso admin page. It consists of four tabs.
 *
 * @package  MHWP_IPSO
 * @author   Frans Jaspers
 * Todo mail: add the tab.
 */

?>

<div class="wrap">
	<h1>Marikenhuis - IPSO</h1>

	<?php settings_errors(); ?>

	<?php
	// Process the tab variable read and set in mhwp-ipso-admin-index.php.
	if ( isset( $tab ) ) {
		switch ( $tab ) {
			case 'Instellingen':
				$active_tab = 'tab-1';
				break;
			case 'Afwijkende reserveringen':
				$active_tab = 'tab-2';
				break;
			case 'Activiteiten':
				$active_tab = 'tab-3';
				break;
			case 'Log':
				$active_tab = 'tab-4';
				break;
		}
	}
	$active_tab = $active_tab ?? 'tab-1';
	?>

	<ul class="nav nav-tabs">
		<li class="<?php echo 'tab-1' === $active_tab ? 'active' : ''; ?>"><a href="#tab-1">Instellingen</a></li>
		<li class="<?php echo 'tab-2' === $active_tab ? 'active' : ''; ?>"><a href="#tab-2">Afwijkende reserveringen</a></li>
		<li class="<?php echo 'tab-3' === $active_tab ? 'active' : ''; ?>"><a href="#tab-3">Activiteiten</a></li>
		<li class="<?php echo 'tab-4' === $active_tab ? 'active' : ''; ?>"><a href="#tab-4">Logs</a></li>
	</ul>

	<div class="tab-content">
		<div id="tab-1" class="tab-pane <?php echo 'tab-1' === $active_tab ? 'active' : ''; ?>">
		<?php
			require_once plugin_dir_path( dirname( __FILE__ ) ) . 'partials/mhwp-ipso-admin-settings.php';
		?>
		</div>
		<div id="tab-2" class="tab-pane <?php echo 'tab-2' === $active_tab ? 'active' : ''; ?>">
			<?php
				require_once plugin_dir_path( dirname( __FILE__ ) ) . 'partials/mhwp-ipso-admin-mappings.php';
			?>
		</div>
		<div id="tab-3" class="tab-pane <?php echo 'tab-3' === $active_tab ? 'active' : ''; ?>">
			<?php
				require_once plugin_dir_path( dirname( __FILE__ ) ) . 'partials/mhwp-ipso-admin-activities.php';
			?>
		</div>
		<div id="tab-4" class="tab-pane <?php echo 'tab-4' === $active_tab ? 'active' : ''; ?>">
			<?php
				require_once plugin_dir_path( dirname( __FILE__ ) ) . 'partials/mhwp-ipso-admin-log.php';
			?>
		</div>
	</div>
</div>
