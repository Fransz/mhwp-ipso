// Todo: Buttons should go with the calendarId, not the activity id?
// No. you'll have two id's in the backend; activityID for redirection/mail; agendaId for buttons.
// That's confusing.

// Todo: Messages go in the first button on a page.
// This is not a bug.

// Todo: we can have only one button on a page, but have no way to force that. May be we can have getActivities search first.

// Todo: Buttons shouldn't throw; just display the message and remove the form.
// Todo: We need to refactor this code in the spirit of ipso-list.
// Todo: the calendarId is passed to the form as a hidden input, it should be gotten from the extended detail in submitForm?

import '../includes/bootstrap-collapse';
import '../includes/bootstrap-transition';

/*
 * Todo add mailData in the ipso button so we can mail with the button also.
 */
import {addError, clearErrors, clearMessages, fetchWpRest, makeReservation, wait, createNodeFromHTML} from "../includes/mhwp-lib";

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

        const container = document.querySelector('#mhwp-ipso-button-container');

        // Three parameters from the wp block;
        const dateField = document.querySelector('#mhwp-activity-date').value;
        const id = parseInt(document.querySelector('#mhwp-activity-id') ?. value || "");
        const title = document.querySelector('#mhwp-activity-title').value;

        // Check the parameters.
        if ( ! dateField || (! id && ! title)) {
            addError('Ongeldig formulier. Reserveren is niet mogelijk', container);
            throw new Error('MHWP error invalid form - incorrect parameters.');
        }

        // Add the date parameter to the query string.
        let d = new Date(dateField);
        d = d.toISOString().slice(0, -14);
        url.searchParams.append('from', d);
        url.searchParams.append('till', d);

        // Fetch the activities.
        const activities = await fetchWpRest(url, {}, container);

        // form and hidden input for the activityCalendarid
        const form = container.querySelector('form');
        const input = form.querySelector('input[name=activityCalendarId]');

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
        const activity = filtered[0];


        // add the calendarId to the form
        input.value = activity.id;

        // Prepare date and time for the mail; Dont euse date here.
        const dateFormat = new Intl.DateTimeFormat(undefined, {month: 'long', day: 'numeric', weekday: 'long'}).format;
        const timeFormat = new Intl.DateTimeFormat(undefined, {hour: 'numeric', minute: 'numeric'}).format;
        const date = new Date(activity.timeStart);

        activity.date = dateFormat(date);
        activity.time = timeFormat(date);

        // We need the reservation, and extra data for mailing on the server.
        // We added properties date and time to the activity already.
        const mailData = {
            'activityId': activity.activityID,
            'activityTitle': activity.title,
            'activityDate': activity.date,
            'activityTime': activity.time,
        }

        // Check if the activity ws in the past (in days)
        const toDay = (new Date()).setHours(0, 0, 0, 0);
        if (date < toDay) {
            // If so we cannot make a reservation, remove button and form. We are done.
            const button = container.querySelector("button.mhwp-ipso-reservation-show-reservation");
            const form = container.querySelector('form');
            button.remove();
            form.remove();
            return;
        }


        await prepareForm(activity, mailData, container);
    }

    /**
     * prepare the form belonging to this button.
     *
     * @param activity The activity for which to fetch the details and create the form.
     * @param mailData Extra data needed for mailing.
     * @param container The form belonging to this button.
     */
    async function prepareForm(activity, mailData, container) {
        const form = container.querySelector('form');

        const { data: detail } = await fetchDetail(activity, container);

        // Places left. If maxRegistrations === 0 there is no limit.
        detail.places = detail.maxRegistrations === 0 ? 1000 : detail.maxRegistrations - detail.nrParticipants;

        if(detail.places <= 0) {
            // Reservations are not possible.Remove the form, add a notice.
            form.remove();

            // Don't use addMessage here. The message should be persistent
            const notice = createNodeFromHTML('<div class="mhwp-ipso-activity-detail-soldout">De activiteit is vol, u kunt niet meer reserveren.</div>');
            container.querySelector('.mhwp-ipso-reservation-form').append(notice);

        } else if(detail.reservationUrl) {
            // there is an alternative URL. Prepare the button to redirect. Remove the form.
            const button = container.querySelector("button.mhwp-ipso-reservation-show-reservation");
            ['data-toggle', 'data-target', 'aria-expanded', 'aria-controls'].map((attr) => button.removeAttr(attr));
            button.on('click', (e) => window.location = detail.reservationUrl );

            form.remove();

        } else {

            // Add validation- and submit handlers to the form.
            $jq(form).validate({
                rules: {
                    phoneNumber: {
                        phoneNL: true,
                        "normalizer": v => v.trim()
                    }
                },
                "submitHandler": (form, event) => makeReservation(detail, mailData, form, event),
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

    document.addEventListener('DOMContentLoaded', getActivities);
})();
