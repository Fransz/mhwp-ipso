import '../includes/bootstrap-collapse';
import '../includes/bootstrap-transition';

import { addError, clearErrors, clearMessages, fetchWpRest, makeReservation } from "../includes/mhwp-lib";

const $jq = jQuery.noConflict();

const marikenhuisURL = document.location.origin;

// Dutch phone numbers have 10 digits (or 11 and start with +31).
$jq.validator.addMethod( "phoneNL", function( value, element ) {
    return this.optional( element ) || /^((\+|00(\s|\s?-\s?)?)31(\s|\s?-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?-\s?)?[0-9]){8}$/.test( value );
}, "Vul een geldig telefoonnummer in." );


/**
 * Main function called upon onDOMContentLoaded.
 * Fetch all wanted activities, and ther details. For each create a large HTML.
 */
async function getActivities() {
    const url = new URL( marikenhuisURL );
    url.pathname = "wp-json/mhwp-ipso/v1/activity";

    const container = $jq('#mhwp-ipso-button-container');

    const date = $jq('#mhwp-activity-date').val();
    const id = parseInt($jq('#mhwp-activity-id').val());
    const title = $jq('#mhwp-activity-title').val();

    if ( ! date || (! id && ! title)) {
        addError('Ongeldig formulier. Reserveren is niet mogelijk', container);
        throw new Error('MHWP error invalid form - incorrect parameters.');
    }

    let d = new Date(date);
    d = d.toISOString().slice(0, -14);
    url.searchParams.append('from', d);
    url.searchParams.append('till', d);

    const activities = await fetchWpRest(url, {}, container);

    // form and input for the activityCalendarid
    const form = $jq('form', container);
    const input = $jq('input[name=activityCalendarId', form);

    // filter activities.
    let filtered = [];
    if ( id ) {
        filtered = activities.data.filter((act) => act.id === parseInt(id) )
    } else {
        filtered = activities.data.filter((act) =>
            act.title.replace(/\W+/g, '').toLowerCase() === title.replace(/\W+/g, '').toLowerCase()
        )
    }
    if ( filtered.length !== 1 ) {
        addError('Geen activiteit gevonden. Reserveren is niet mogelijk', container);
        form.remove();
        throw new Error('MHWP error invalid form - no activities found.');
    }


    // use the calanedarId for the form, the activityId foor the detail
    input.val(filtered[0].id);
    await prepareForm(filtered[0].activityID, container);
}

/**
 * prepare the form belonging to this button.
 *
 * @param activityId
 * @param container The form belonging to this button.
 */
async function prepareForm(activityId, container) {
    const { data: detail } = await fetchDetail(activityId, container);
    const form = $jq('form', container);

    if(detail.reservationUrl) {
        // We dont need the form. Prepare the button to redirect. remove the form.
        const button = $jq("button.mhwp-ipso-reservation-show-reservation", container);
        ['data-toggle', 'data-target', 'aria-expanded', 'aria-controls'].map((attr) => button.removeAttr(attr));
        button.on('click', (e) => window.location = detail.reservationUrl );

        form.remove();
    } else {
        // Add validation- and submit handlers to the form.
        form.validate({
            rules: {
                phoneNumber: {
                    phoneNL: true,
                    "normalizer": v => $jq.trim(v)
                }
            },
            "submitHandler": makeReservation,
            "invalidHandler": function () {
                // TODO: We want an error message here.
                console.log( 'invalid' );
            }

        })
    }
}

/**
 * Actually make the request for the details, and again if necessary.
 *
 * @param activityId The activity for which to fetch the detail
 * @param container The parent for messages.
 * @returns {Promise<any>}
 */
async function fetchDetail(activityId, container) {
    const url = new URL( marikenhuisURL );
    url.pathname = `wp-json/mhwp-ipso/v1/activity/${activityId}`;

    clearErrors(container);
    clearMessages(container);
    return fetchWpRest(url, {}, 0, container, false).then((json) => {
        // Upon a 429 error (Too many requests), We try again.
        if ( json.mhwp_ipso_code === 429) {
            console.log('Error 429, retrying');
            return wait(1000).then(() => {
                return fetchWpRest(url, {}, 0, container, true);
            });
        }
        return json;
    });
}

$jq(document).ready(getActivities);
