<?php
/**
 * The blocks-specific functionality of the plugin
 *
 * @package MHWP_IPSO
 * @author Frans Jaspers <frans.jaspers@marikenhuis.nl>
 * @link https://www.marikenhuis.nl
 */

require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-mhwp-ipso-client.php';

/**
 * The blocks-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the block-specific stylesheet and JavaScript.
 *
 * @package    MHWP_IPSO
 * @author     Frans Jaspers <frans.jaspers@marikenhuis.nl>
 */
class MHWP_IPSO_Blocks {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $mhwp_ipso    The ID of this plugin.
	 */
	private $mhwp_ipso;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string $mhwp_ipso       The name of this plugin.
	 * @param      string $version    The version of this plugin.
	 */
	public function __construct( string $mhwp_ipso, string $version ) {

		$this->mhwp_ipso = $mhwp_ipso;
		$this->version   = $version;

	}

	/**
	 * Register the stylesheets for blocks.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {
		$ver = MHWP_IPSO__DEV_MODE ? time() : $this->version;

		// TODO: Styles from the block come from block.json. If we dont have other
		// stylesheets this can be dropped.
	}

	/**
	 * Register the JavaScript for the blocks.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {
		$ver = MHWP_IPSO__DEV_MODE ? time() : $this->version;

		// wp_enqueue_script(
		// $this->mhwp_ipso . '_blocks',
		// plugin_dir_url( __FILE__ ) . 'dist/mhwp-ipso-list.js',
		// array( 'wp-i18n', 'wp-element', 'wp-blocks', 'wp-components', 'wp-editor', 'wp-api' ),
		// $ver,
		// true
		// );

		// TODO is this the place to enqueue this?
		wp_enqueue_script(
			$this->mhwp_ipso . '_blocks_validate',
			'https://cdn.jsdelivr.net/npm/jquery-validation@1.19.5/dist/jquery.validate.min.js',
			array( 'jquery' ),
			$ver,
			true
		);
		wp_enqueue_script(
			$this->mhwp_ipso . '_blocks_validate_l10n',
			'https://cdn.jsdelivr.net/npm/jquery-validation@1.19.5/dist/localization/messages_nl.min.js',
			array( 'jquery', $this->mhwp_ipso . '_blocks_validate' ),
			$ver,
			true
		);
	}

	/**
	 * Callback for rendering the block dynamically.
	 *
	 * @param array $attributes Attribute of the block from the block delimeters.
	 * @return string The blocks html.
	 */
	public function render( array $attributes ) : string {
		$nr_days = ctype_digit( $attributes['nr_days'] ) ? $attributes['nr_days'] : '10';
		try {
			$now      = new DateTimeImmutable( 'now', new DateTimeZone( 'Europe/Amsterdam' ) );
			$interval = new DateInterval( 'P' . $nr_days . 'D' );
		} catch ( Exception $e ) {
			$error = array(
				'mhwp_ipso_status' => 'error',
				'mhwp_ipso_code'   => $e->getCode(),
				'mhwp_ipso_msg'    => 'er is een probleem op de server',
			);
			return $this->calendar_error_html( $error );
		}
		$data = array(
			'from' => $now->format( 'Y-m-d' ),
			'till' => $now->add( $interval )->format( 'Y-m-d' ),
		);

		// Create and make the request return html.
		$client   = new MHWP_IPSO_Client();
		$calendar = $client->get_calendar_activities( $data );

		// The request returned an error; Bail out.
		if ( 'error' === $calendar['mhwp_ipso_status'] ) {
			return $this->calendar_error_html( $calendar );
		}

		// We don't want to display the status in html.
		unset( $calendar['mhwp_ipso_status'] );

		/**
		 * Sorting function for the activities.
		 * TODO: We only sort by date.
		 *
		 * @param object $a1 the first activity in the comparison.
		 * @param object $a2 the second activity in the comparison.
		 *
		 * @return int the order of the dates.
		 */
		function cmp( object $a1, object $a2 ): int {
			$d1 = $a1->onDate;      // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
			$d2 = $a2->onDate;      // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

			if ( $d1 === $d2 ) {
				return 0;
			}
			return ( $d1 < $d2 ) ? -1 : 1;
		}
		usort( $calendar, 'cmp' );

		return $this->calendar_html( $calendar );
	}

	/**
	 * Converts the data array we got back from our client to html.
	 *
	 * @param array $calendar The calendar data.
	 * @return string the HTML for the calendar.
	 */
	public function calendar_html( array $calendar ) : string {
		if ( empty( $calendar ) ) {
			return '';
		}

		$cnt        = 0;
		$light_dark = 'dark';

		ob_start();
		echo '<div class="mhwp-ipso-activities-list"><ul class="list-group">';

		foreach ( $calendar as $activity ) {
			$cnt++;
			$light_dark = 'dark' === $light_dark ? 'light' : 'dark';

			// phpcs:disable
			?>
                <li class="activity list-group-item <?php echo esc_attr( 'list-group-item-' . $light_dark ); ?>">
                    <div class="row lead">
                        <div class="col-md-8">
                            <span>Datum: </span><span><?php echo esc_html( $activity->onDate ); ?></span><span>Title: </span><span><?php echo esc_html( $activity->title ); ?></span>
                        </div>
                        <div class="col-md-4">
                            <button class="pull-right btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseExample_<?php echo $cnt; ?>" aria-expanded="false" aria-controls="collapseExample">
                                Lees meer
                            </button>
                            <button class="pull-right btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseReserveer_<?php echo $cnt; ?>" aria-expanded="false" aria-controls="collapseReserveer">
                                Reserveer
                            </button>
                        </div>
                    </div>
                    <div class="collapse reserveer" id="collapseReserveer_<?php echo $cnt; ?>">
                        <form action="" class="form-horizontal">
                          <input type="hidden" name="activityCalendarId" value="<?php echo esc_attr( $activity->id ) ?>">
                          <div class="form-group">
                              <fieldset class="col-md-4">
                                  <label for="mhwp_ipso_voornaam_<?php echo $cnt; ?>">Voornaam</label>
                                  <span class="required">*</span>
                                  <input type="text" class="form-control" id="mhwp_ipso_voornaam_<?php echo $cnt; ?>" name="firstName" required placeholder="">
                              </fieldset>
                              <fieldset class="col-md-4">
                                  <label for="mhwp_ipso_tussenvoegsel_<?php echo $cnt; ?>">Tussenvoegsel</label>
                                  <input type="text" class="form-control" id="mhwp_ipso_tussenvoegsel_<?php echo $cnt; ?>" name="lastNamePrefix" placeholder="">
                              </fieldset>
                              <fieldset class="col-md-4">
                                  <label for="mhwp_ipso_achternaam_<?php echo $cnt; ?>">Achternaam</label>
                                  <span class="required">*</span>
                                  <input type="text" class="form-control" id="mhwp_ipso_achternaam_<?php echo $cnt; ?>" name="lastName" required placeholder="">
                              </fieldset>
                          </div>
                          <div class="form-group">
                              <fieldset class="col-md-4">
                                  <label for="mhwp_ipso_telefoon_<?php echo $cnt; ?>">Telefoonnummer</label>
                                  <input type="tel" class="form-control" id="mhwp_ipso_telefoon_<?php echo $cnt; ?>" name="phoneNumber" placeholder="">
                                  <span class="validity"></span>
                              </fieldset>
                              <fieldset class="col-md-4">
                                  <label for="mhwp_ipso_email_<?php echo $cnt; ?>">Emailadres</label>
                                  <span class="required">*</span>
                                  <input type="email" class="form-control" id="mhwp_ipso_email_<?php echo $cnt; ?>" name="email" required placeholder="">
                                  <span class="validity"></span>
                              </fieldset>
                              <div class="col-md-4">
                                  <button type="submit" class="pull-right right btn btn-default">Reserveer</button>
                              </div>
                          </div>
                        </form>
                    </div>
                </li>
			<?php
			// phpcs:enable
		}
		echo '</ul></div>';
		$html = ob_get_contents();
		ob_end_clean();
		return $html;
	}

	/**
	 * Display the html for an error.
	 *
	 * @param array $error The error data.
	 * @return string the HTML
	 */
	public function calendar_error_html( array $error ): string {
		$html  = '<div class="mhwp-ipso-activities-list mhwp_ipso_error">';
		$html .= '    <span class="mhwp_ipso_error_msg">' . $error['mhwp_ipso_msg'] . '</span>';
		$html .= '    <span class="mhwp_ipso_error_code">(' . $error['mhwp_ipso_code'] . ')</span>';
		$html .= '</div>';

		return $html;
	}

	/**
	 * Register the block.
	 */
	public function register_blocks() {
		/**
		 * Set additional attributes depending on the test option.
		 *
		 * @param array $metadata the metadata.
		 * @return array
		 */
		function filter_block_metadata( array $metadata ): array {
			if ( 'mhwp-ipso/list' === $metadata['name'] ) {
				// get the options we need.
				$metadata['attributes']['rest_nonce'] = array(
					'type'      => 'string',
					'default'   => wp_create_nonce( 'wp_rest' ),
					'source'    => 'attribute',
					'selector'  => 'input#ipso-list-nonce',
					'attribute' => 'value;',
				);
			}
			return $metadata;
		}
		add_filter( 'block_type_metadata', 'filter_block_metadata' );

		register_block_type(
			plugin_dir_path( __FILE__ ) . 'list'
		);
	}

}
