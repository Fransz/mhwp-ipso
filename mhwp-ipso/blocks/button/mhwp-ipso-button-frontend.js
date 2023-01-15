import '../includes/bootstrap-collapse';
import '../includes/bootstrap-transition';

import {addError, clearErrors, clearMessages, fetchWpRest, makeReservation, wait} from "../includes/mhwp-lib";

(function() {
    const $jq = jQuery.noConflict();

    const marikenhuisURL = document.location.origin;

    // Dutch phone numbers have 10 digits (or 11 and start with +31).
    $jq.validator.addMethod( "phoneNL", function( value, element ) {
        return this.optional( element ) || /^((\+|00(\s|\s?-\s?)?)31(\s|\s?-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?-\s?)?[0-9]){8}$/.test( value );
    }, "Vul een geldig telefoonnummer in." );


    /**
     * Main function called upon onDOMContentLoaded.
     * Fetch all wanted activities and their details. For each create some HTML.
     */
    async function getActivities() {
        const url = new URL( marikenhuisURL );
        url.pathname = "wp-json/mhwp-ipso/v1/activity";

        const container = $jq('#mhwp-ipso-button-container');

        // Three parameters from the wp block;
        const date = $jq('#mhwp-activity-date').val();
        const id = parseInt($jq('#mhwp-activity-id').val());
        const title = $jq('#mhwp-activity-title').val();

        // Check the parameters.
        if ( ! date || (! id && ! title)) {
            addError('Ongeldig formulier. Reserveren is niet mogelijk', container);
            throw new Error('MHWP error invalid form - incorrect parameters.');
        }

        // Add the date parameter to the query string.
        let d = new Date(date);
        d = d.toISOString().slice(0, -14);
        url.searchParams.append('from', d);
        url.searchParams.append('till', d);

        // Fetch the activities.
        const activities = await fetchWpRest(url, {}, container);

        // form and hidden input for the activityCalendarid
        const form = $jq('form', container);
        const input = $jq('input[name=activityCalendarId', form);

        // filter activities on id or name, we should be left with exactly one.
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


        // add the calendarId to the form
        input.val(filtered[0].id);

        await prepareForm(filtered[0], container);
    }

    /**
     * prepare the form belonging to this button.
     *
     * @param activity The activity for which to fetch the deetails.
     * @param container The form belonging to this button.
     */
    async function prepareForm(activity, container) {
        const { data: detail } = await fetchDetail(activity, container);
        const form = $jq('form', container);

        // Places left. If maxRegistrations === 0 there is no limit.
        detail.places = detail.maxRegistrations === 0 ? 1000 : detail.maxRegistrations - detail.nrParticipants;

        if(detail.places <= 0) {
            // Reservations are not possible. Remove the form and button. add a notice.
            const button = $jq("button.mhwp-ipso-reservation-show-reservation", container);
            button.remove();
            form.remove();

            const notice = '<div class="mhwp-ipso-reservation-soldout">De activiteit is vol, u kunt niet registreren.</div>';
            container.append(notice);

        } else if(detail.reservationUrl) {
            // there is an alternative URL. Prepare the button to redirect. Remove the form.
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
                "submitHandler": (form, event) => makeReservation(detail, form, event),
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
     * @param activity The activity for which to fetch the detail
     * @param container The parent for messages.
     * @returns {Promise<any>}
     */
    async function fetchDetail(activity, container) {
        const url = new URL( marikenhuisURL );
        url.pathname = 'wp-json/mhwp-ipso/v1/activitydetail';
        url.searchParams.append('activityId', activity.activityID);
        url.searchParams.append('calendarId', activity.id);

        clearErrors(container);
        clearMessages(container);
        return fetchWpRest(url, {}, container, false).then((json) => {
            // Upon a 429 error (Too many requests), We try again.
            if ( json.mhwp_ipso_code === 429) {
                console.log('Error 429, retrying');
                return wait(1000).then(() => {
                    return fetchWpRest(url, {}, container, true);
                });
            }
            return json;
        });
    }

    $jq(document).ready(getActivities);
})();
