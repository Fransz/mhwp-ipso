// Todo: Buttons should go with the calendarId, not the activity id?
// No. you'll have two id's in the backend; activityID for redirection/mail; agendaId for buttons.
// That's confusing.

// Todo: Messages go in the first button on a page.
// This is not a bug.

// Todo: we can have only one button on a page, but have no way to force that. May be we can have getActivities search first.

// Todo: Buttons shouldn't throw; just display the message and remove the form.
// Todo: We need to refactor this code in the spirit of ipso-list.
// Todo: the calendarId is passed to the form as a hidden input, it should be gotten from the extended detail in submitForm?

// import '../includes/bootstrap-collapse';
// import '../includes/bootstrap-transition';

/*
 * Todo add mailData in the ipso button so we can mail with the button also.
 */
import {
    addMessage
    , addError
    , clearErrors
    , clearMessages
    , fetchWpRest
    , makeButtonReservation
    , wait
    , createNodeFromHTML
    , localeISOString
    , fetchDetail
    , fetchParticipants
} from "../includes/mhwp-lib";

(function () {

    // jQuery.
    const $jq = jQuery.noConflict();

    // Nr of days to fetch
    const daysToFetch = 28;

    // Nr of activities to show in the popup
    const actsToShow = 6;

    function init() {
        // A rule for the jQuery validator. Dutch phone numbers have 10 digits (or 11 and start with +31).
        $jq.validator.addMethod("phoneNL", function (value, element) {
            return this.optional(element) || /^((\+|00(\s|\s?-\s?)?)31(\s|\s?-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?-\s?)?[0-9]){8}$/.test(value);
        }, "Vul een geldig telefoonnummer in.");
    }

    function button() {
        const msgContainer = document.querySelector('#mhwp-ipso-message');

        fetchButton(msgContainer).then((activity) => {
            // Only display the button if there are activities.
            if(activity.items.length !== 0) {
                clearMessages(msgContainer);
                displayButton(activity, msgContainer);
            } else {
                console.log('Er zijn in de aankomende periode geen activiteiten.');
            }
        });
    }

    function fetchButton(msgContainer) {
        const id = parseInt(document.querySelector('#mhwp-activity-id') ?. value );
        if (Number.isNaN(id)) {
            addMessage('Ongeldige knop', msgContainer);
            setTimeout(() => clearMessages(msgContainer), 4000);
            return;
        }

        const url = new URL( document.location.origin );
        url.pathname = "wp-json/mhwp-ipso/v1/activity";

        const from = new Date();
        url.searchParams.append('from', localeISOString(from));
        const till = from.setDate(from.getDate() + daysToFetch);
        url.searchParams.append('till', localeISOString(till));

        return fetchWpRest(url, {}, msgContainer).then(({data: as}) => {
            // sort, filter, truncate and collapse.
            as.sort((a1, a2) => new Date(a1.timeStart) - new Date(a2.timeStart));
            as = as.filter( a => a.activityID === id );

            if (as.length > actsToShow) as.length = actsToShow;
            return collapse(as);
        });
    }

    /**
     * collapse all calendar details for the activities in an array items.
     *
     * @param acts
     * @returns {{activityID: *, onDate: *, mentors: *, title, items: [*], extraInfo: *}}
     */
    function collapse(acts) {
        const items = acts.map( a => {
            return { calendarId: a.id, timeOpen: a.timeOpen, timeStart: a.timeStart, timeEnd: a.timeEnd };
        });
        return {
            activityID: acts[0].activityID,
            title: acts[0].title,
            extraInfo: acts[0].extraInfo,
            mentors: acts[0].mentors,
            onDate: acts[0].onDate,
            items
        }
    }

    /**
     * Prepare the button.
     *
     * @param activity The activity.
     * @param msgContainer The html element used for showing messages
     */
    function displayButton(activity, msgContainer) {
        const button = document.querySelector('#mhwp-ipso-button-more');
        button.style.display = 'block';
        button.addEventListener('click', readMore);

        /**
         * click handler for read more buttons.
         * Get the activities details and show them in a popup, or display a message if the activity is sold out.
         *
         * @param e The event..
         */
        async function readMore(e) {
            clearErrors(msgContainer);
            clearMessages(msgContainer);
            addMessage('Gevens ophalen, dit kan even duren', msgContainer);

            const detail = await fetchActivityDetails(activity, msgContainer);

            if (detail.items.length === 0) {
                clearMessages(msgContainer);
                addMessage('Er zijn helaas voorlopig geen vrije plaatsen.', msgContainer);
                setTimeout(() => clearMessages(msgContainer), 4000);
            } else {
                clearMessages(msgContainer);
                // displayActivity(detail, msgContainer);
            }
        }

    }

    /**
     * Fetch details for the activity ID, and nrParticipants for all activities
     *
     * @param activity The activity for which we want to fetch the details.
     * @param msgContainer The html element for messages.
     * @returns {Promise<{mainImage}|*>}
     */
    async function fetchActivityDetails(activity, msgContainer) {
        const { data: detail } = await fetchDetail(activity, msgContainer);

        // For all activities, fetch the number of participants sequentially.
        const items = await activity.items.reduce((p, act) => {
            return p.then(acc => {
                return fetchParticipants(act.calendarId, msgContainer).then( r => {
                    act.places = detail.maxRegistrations === 0 ? 1000 : detail.maxRegistrations - r.data.nrParticipants;
                    return [...acc, act];
                });
            })
        }, Promise.resolve([]));

        detail.items = items.filter( i => i.places > 0);
        detail.imageUrl = detail.mainImage ? new URL(detail.mainImage) : "";

        return detail;
    }

    // Run init and handleWeekChange on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => { init(); button();});
})();


function foo() {
    const $jq = jQuery.noConflict();

    // Dutch phone numbers have 10 digits (or 11 and start with +31).
    $jq.validator.addMethod( "phoneNL", function( value, element ) {
        return this.optional( element ) || /^((\+|00(\s|\s?-\s?)?)31(\s|\s?-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?-\s?)?[0-9]){8}$/.test( value );
    }, "Vul een geldig telefoonnummer in." );


    /**
     * Main function called upon onDOMContentLoaded.
     * Fetch all wanted activities and their details. For each create some HTML.
     */
    async function getActivities() {
        const url = new URL( document.location.origin );
        url.pathname = "wp-json/mhwp-ipso/v1/activity";

        const container = document.querySelector('#mhwp-ipso-button-container');

        // Three parameters from the wp block;
        const dateField = document.querySelector('#mhwp-activity-date').value;
        const id = parseInt(document.querySelector('#mhwp-activity-id') ?. value || "");
        // todo Check if the value exists. we need a default here.
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
            const notice = createNodeFromHTML('<div class="mhwp-ipso-activity-detail-soldout">De activiteit is vol, je kunt niet meer reserveren.</div>');
            container.querySelector('.mhwp-ipso-reservation-form').append(notice);

        } else if(detail.disableReservation) {
            // we want to hide the button for this activity ID.
            const button = container.querySelector("button.mhwp-ipso-reservation-show-reservation");
            button.hidden = true;
            form.remove();

        } else if(detail.reservationUrl) {
            // there is an alternative URL. Prepare the button to redirect. Remove the form.
            const button = container.querySelector("button.mhwp-ipso-reservation-show-reservation");
            ['data-toggle', 'data-target', 'aria-expanded', 'aria-controls'].map((attr) => button.removeAttribute(attr));
            button.addEventListener('click', (e) => window.location = detail.reservationUrl );

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
                "submitHandler": (form, event) => makeButtonReservation(detail, mailData, form, event),
                "invalidHandler": function () {
                    // TODO: We want an error message here.
                    console.log( 'invalid' );
                }

            })
        }
    }
}
