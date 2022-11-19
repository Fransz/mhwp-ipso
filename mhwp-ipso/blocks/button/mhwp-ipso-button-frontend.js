// for local development on old fashioned theme.
// import './bootstrap-collapse';
// import template from './mhwp-ipso-list-template_bootstrap';

// import template from './mhwp-ipso-list-template';

import { addError, addMessage, clearErrors, clearMessages, fetchWpRest } from "../includes/mhwp-lib";

const $jq = jQuery.noConflict();

const marikenhuisURL = document.location.origin;

/**
 * Main function called upon onDOMContentLoaded.
 * Fetch all wanted activities, and ther details. For each create a large HTML.
 */
async function getActivities() {
    const url = new URL( marikenhuisURL );
    url.pathname = "wp-json/mhwp-ipso/v1/activity";

    const date = $jq('#mhwp-activity-date').val();
    const id = parseInt($jq('#mhwp-activity-id').val());
    const title = $jq('#mhwp-activity-title').val();

    if ( ! date || (! id && ! title)) {
        // TODO add a frontEnd Error
        throw new Error('MHWP error invalid form - incorrect parameters.');
    }

    // TODO: use this for mhwp-ipso-list also; drop the nrDays request parameter.
    let d = new Date(date);
    d = d.toISOString().slice(0, -14);
    url.searchParams.append('from', d);
    url.searchParams.append('till', d);

    // TODO: Drop the nonce on the GET request.
    const fetchInit = {'HTTP_X_WP_NONCE': 0};
    const container = $jq('#mhwp-ipso-button-container');
    const activities = await fetchWpRest(url, fetchInit, 0, container);

    let filtered = [];
    if ( id ) {
        filtered = activities.data.filter((act) => act.id === parseInt(id) )
    } else {
        filtered = activities.data.filter((act) =>
            act.title.replace(/\W+/g, '').toLowerCase() === title.replace(/\W+/g, '').toLowerCase()
        )
    }
    if ( filtered.length !== 1 ) {
        // TODO FrontEnd Error if date is empty + exception?
        throw new Error('MHWP error invalid form - no activities found.');
    }
    console.log(filtered);
}

/**
 * Find all forms adde by the calendar, attach a validator and a submit handler to each.
 */
function prepareReservations() {
    // The URL for making the reservation
    const url = new URL( marikenhuisURL );
    url.pathname = "wp-json/mhwp-ipso/v1/reservation";

    // Dutch phone numbers have 10 digits (or 11 and start with +31).
    $jq.validator.addMethod( "phoneNL", function( value, element ) {
        return this.optional( element ) || /^((\+|00(\s|\s?-\s?)?)31(\s|\s?-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?-\s?)?[0-9]){8}$/.test( value );
    }, "Vul een geldig telefoonnummer in." );

    const forms = $jq('form', '#mhwp-ipso-list-container');
    forms.each( (_, f) => {
        $jq( f ).validate({
            rules: {
                // We only use one explicit validation rule. others are extracted from the HTML attributes
                phoneNumber: {
                    phoneNL: true,
                    "normalizer": v => $jq.trim(v)
                }
            },
            "submitHandler": async function ( form, event ) {
                event.preventDefault();
                $jq('button', form).prop('disabled', true);
                const container = $jq(form).parent();

                const activityCalendarId = $jq('input[name="activityCalendarId"]', form).val();
                const firstName = $jq('input[name="firstName"]', form).val();
                const lastNamePrefix = $jq('input[name="lastNamePrefix"]', form).val();
                const lastName = $jq('input[name="lastName"]', form).val();
                const email = $jq('input[name="email"]', form).val();
                let phoneNumber = $jq('input[name="phoneNumber"]', form).val();
                phoneNumber = phoneNumber === "" ? null : phoneNumber;
                const data = { activityCalendarId, firstName, lastNamePrefix, lastName, email, phoneNumber };

                clearErrors(container);
                clearMessages(container);

                const fetchInit = {
                    method: 'POST',
                    body: JSON.stringify( data )
                }
                await fetchWpRest(
                    url, fetchInit, 0, container
                ).then(() => {
                    // if ! 200 addError
                    addMessage('Er is een plaats voor u gereserveerd; U ontvangt een email', container)
                    setTimeout(() => {
                        clearMessages(container);
                        $jq('button', form).prop('disabled', false);
                    }, 2500);
                }).catch((_) => {
                    // No op. We had an error making a reservation. We still want to continue, maybe an other one
                    // succeeds.
                });
            },
            "invalidHandler": function () {
                console.log( 'invalid' );
            }
        });
    });
}


/**
 * Helper for setTimeout in a Promise style.
 *
 * @param duration
 * @returns {Promise<unknown>}
 */
function wait(duration) {
    return new Promise((resolve, reject) => {
        if(duration < 0) reject( new Error("Cannot wait negative time"));
        setTimeout(resolve, duration);
    })
}

$jq(document).ready(getActivities);
