/**
 * Todo: waarom staat er in ipspo 'invalid date'; (8 mei tajij laura peters;; de inschrijving staat wel in ipso.)
 * Todo add mailData in the ipso button so we can mail with the button also.
 * Todo: Als je een detail haatl, kan het zijn dat je 'm al gehaald hebt. Die kan je hergebruiken, maa rvoor soldout status moet je toch de request maken.
 * Todo: the calendarId is passed to the form as a hidden input, it should be gotten from the extended detail in submitForm?
 * Todo drop the globals; back to parameters.
 * Todo We add the activity id to the form as a hidden field; The function should get it from the activity?
 * Todo week buttons 5 sec buiten gebruik.
 * Todo classname mhwp-ipso-reservation-button;
 * Todo detail template;
 * Todo ticket bij IPSO over filters;
 */
import template from './mhwp-ipso-list-template';

import '../includes/bootstrap-collapse';
import '../includes/bootstrap-transition';

import { fetchWpRest, wait, addMessage, clearErrors, clearMessages, makeReservation, createNodeFromHTML} from "../includes/mhwp-lib";


(function () {
    /**
     * Globales.
     */
        // jQuery.
    const $jq = jQuery.noConflict();

    // An alias for our origin.
    const marikenhuisURL = document.location.origin;

    // Current date; set by the next/prev week buttons.
    let currentDay = null;

    // Days to show in the calendar, a hidden field in our wp block, default 7.
    // Todo Drop this if we use the week buttons.
    let nrDays = 7;

    /**
     * init globals, attach event handlers.
     */
    function init() {
        // the container for all activities.
        const listContainer = document.querySelector('#mhwp-ipso-list-container');

        // A rule for the jQuery validator. Dutch phone numbers have 10 digits (or 11 and start with +31).
        $jq.validator.addMethod( "phoneNL", function( value, element ) {
            return this.optional( element ) || /^((\+|00(\s|\s?-\s?)?)31(\s|\s?-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?-\s?)?[0-9]){8}$/.test( value );
        }, "Vul een geldig telefoonnummer in." );

        // nr of days, from a hidden field in the wp block.
        const el = document.getElementById('mhwp-ipso-list-nr-days');
        nrDays = parseInt(el.value) || 0;

        // Initialize the week picker.
        const prevWeek = document.querySelector('#mhwp-ipso-prev-week');
        prevWeek.addEventListener('click', () =>  handleWeekChange(-7, listContainer) )
        const nextWeek = document.querySelector('#mhwp-ipso-next-week');
        nextWeek.addEventListener('click', () => handleWeekChange(7, listContainer))

        // Initialize the current day
        const dateFormat = new Intl.DateTimeFormat(undefined, {month: 'long', day: 'numeric'}).format;
        const [mon, sun] = week(new Date());
        document.querySelector('#mhwp-ipso-current-week').innerHTML = `${dateFormat(mon)} - ${dateFormat(sun)}`;
        currentDay = mon;
    }

    /**
     * Handle clicks on the next/previous week button
     */
    function handleWeekChange(nrDays) {
        // Date format for the interval.
        const dateFormat = new Intl.DateTimeFormat(undefined, {month: 'long', day: 'numeric'}).format;

        // Copy day; add; calculate week; display; save.
        const newDay = new Date(currentDay);
        newDay.setDate(newDay.getDate() + nrDays);
        const [mon, sun] = week(newDay);

        const toDay = new Date();
        if(sun < toDay) {
            // We try to go back in time we do not allow that.
            return;
        }

        // Adjust header
        document.querySelector('#mhwp-ipso-current-week').innerHTML = `${dateFormat(mon)} - ${dateFormat(sun)}`;

        // Set our global, display a message
        currentDay = mon;
        addMessage('Ophalen van gegevens, dit kan even duren', document.querySelector('#mhwp-ipso-list-weekpicker'));

        // Display activities.
        main();
    }

    /**
     * Calculate first and last day of the week in which d falls.
     * Monday is the first day of our week;
     *
     * @param d The day for which we have to calculate the week.
     * @return Array<Date> The first and last dates of the week.
     */
    function week (d) {
        const first = new Date(d);
        first.setDate(first.getDate() + ((7 - d.getDay()) % 7) - 6);
        const last = new Date(first);
        last.setDate(first.getDate() + 6);
        return [first, last];
    }

    /**
     * Top level function.
     *
     * @returns {void}
     */
    async function main () {
        // Clear the listContainer.
        const listContainer = document.querySelector('#mhwp-ipso-list-container');
        const items = Array.from(listContainer.querySelectorAll('li'));
        items.map((n) => n.remove());

        // Get all activities from our wp; property data; Sort them;
        let activities = await getActivities(listContainer);
        activities = activities.data;
        activities.sort((a1, a2) => new Date(a1.timeStart) - new Date(a2.timeStart));

        processActivities(activities, listContainer)

        // Clean up message.
        return clearMessages(document.querySelector('#mhwp-ipso-list-weekpicker'));
    }

    /**
     * Fetch all activities.
     * The from and till query parameter are set with the value from the wp block.
     *
     * @param listContainer The container for the calendar lisst.
     * @returns {Promise<void>}
     */
    async function getActivities(listContainer) {
        const url = new URL( marikenhuisURL );
        url.pathname = "wp-json/mhwp-ipso/v1/activity";

        const d = new Date(currentDay);
        const from = d.toISOString().slice(0, -14);
        url.searchParams.append('from', from);

        d.setDate(d.getDate() + nrDays - 1);
        const till = d.toISOString().slice(0, -14);
        url.searchParams.append('till', till);

        clearErrors(listContainer);
        clearMessages(listContainer);
        return await fetchWpRest(url, {}, listContainer);
    }

    /**
     * Process the fetched activities.
     *
     * @param activities The activities to processs
     * @param listContainer The container for the calendar list.
     */
    function processActivities(activities, listContainer) {
        // Keep track of the activities date. For date headers.
        let curDate = null;

        activities.forEach( (activity) => {
            // Add all activities, with or without date separator.
            const node = addActivity(activity, activity.onDate !== curDate, listContainer);

            // The button which shows the details.
            const button = node.querySelector('button.mhwp-ipso-activity-show-detail')

            // update the current date.
            curDate = activity.onDate;

            // The handler for clicks on the button.
            const clickHandler = async () => await fillActivity(activity, node);
            button.addEventListener('click', clickHandler, { once: true });
        })
    }

    /**
     * Add an activity to the dom using our template.
     *
     * @param activity json data that describes the activity,
     * @param newDate Do we want to add a seperator for new date?
     * @param listContainer The container for the calendar list.
     * @returns The jQuery object for the added node.
     */
    function addActivity(activity, newDate, listContainer) {
        // Formatters for time/date
        const dateFormat = new Intl.DateTimeFormat(undefined, {month: 'long', day: 'numeric', weekday: 'long'}).format;
        const timeFormat = new Intl.DateTimeFormat(undefined, {hour: 'numeric', minute: 'numeric'}).format;

        // Add the formatted date and time to the activity,
        const date = new Date(activity.timeStart);
        activity.date = dateFormat(date);
        activity.time = timeFormat(date);

        // Add a date header if the date changed.
        if (newDate) {
            const dateHeader = createNodeFromHTML(`<li class="mhwp-ipso-list-dateheader">${activity.date}</li>`);
            listContainer.append(dateHeader)
        }

        // fill the template, append to the DOM
        const node = template(activity);
        listContainer.append(node);

        return node;
    }

    /**
     * Fill an activity with its details and prepare the form
     *
     * @param activity The activity.
     * @param node The dom node for the activity.
     */
    async function fillActivity(activity, node) {
        addMessage("Ophalen van gegevens, dit kan even duren", node);
        const button = node.querySelector('.mhwp-ipso-reservation-button');

        // Get the details for the activity.
        const detail = await getDetail(activity, node);

        // Enable the reservation button by default.
        clearMessages(node);
        button.disabled = false;

        const {img, title, intro, descr} = detail;
        const detailNode = node.querySelector('.mhwp-ipso-activity-detail');
        detailNode.prepend(img, title, intro, descr);

        // Check if we want the reservation hidden. This is a setting in the backend.
        // If so hide the button, we dont need a form
        if (detail.disableReservation) {
            button.hidden = true;
            return;
        }

        // Check if the activity was in the past (in days), if so we cannot make a reservation
        // Disable the button and we dont need a form.
        const toDay = (new Date()).setHours(0, 0, 0, 0);
        const date = new Date(activity.timeStart)
        if (date < toDay) {
            button.disabled = true;
            return;
        }

        // We need the reservation, and extra data for mailing on the server.
        // We added properties date and time to the activity already.
        const mailData = {
            'activityId': activity.activityID,
            'activityTitle': activity.title,
            'activityDate': activity.date,
            'activityTime': activity.time,
        }
        prepareForm(detail, mailData, node);
    }

    /**
     * Get the details for an activity, process them. Return a default upon failure.
     *
     * @param activity The activity for which to get details.
     * @param container A container for error messages,
     * @returns {Promise<{descr: string, img: string, intro: string, reservationUrl: null} | {image: string, intro: string, description: string, reservationUrl: null}>}
     */
    function getDetail(activity, container) {
        return fetchDetail(activity, container).then((json) => {
            const detail = json.data;
            const imageUrl = detail.mainImage ? new URL(detail.mainImage) : "";
            const reservationUrl = detail.hasOwnProperty('reservationUrl') ? detail.reservationUrl : null;

            // Places left. If maxRegistrations === 0 there is no limit.
            const places = detail.maxRegistrations === 0 ? 1000 : detail.maxRegistrations - detail.nrParticipants;

            return {
                img: createNodeFromHTML(`<img src="${imageUrl}" alt="${detail.title}" />`),
                title: createNodeFromHTML(`<div class="mhwp-ipso-activity-detail-title">${detail.title}</div>`),
                intro: createNodeFromHTML(`<div class="mhwp-ipso-activity-detail-intro">${detail.intro}</div>`),
                descr: createNodeFromHTML(`<div class="mhwp-ipso-activity-detail-description">${detail.description}</div>`),
                places,
                reservationUrl,
                disableReservation: detail.disableReservation
            }
        }).catch((e) => {
            // We had an error fetching the detail. Fill in defaults for the detail. We can still make the reservation.
            return {
                img: "",
                title: "",
                intro: "",
                descr: "",
                places: 0,
                reservationUrl: null
            }
        });
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

        return fetchWpRest(url, {}, container, false).then((json) => {
            // Upon a 429 error (Too many requests), We try again.
            if ( json.mhwp_ipso_code === 429) {
                console.log('Error 429, retrying');
                return wait(1000).then(() => {
                    return fetchWpRest(url, {}, container, true);
                });
            }
            clearMessages(container);
            return json;
        });
    }

    /**
     * Remove the form if we dont not need it, otherwise add a validation-, and submit handler.
     *
     * @param detail The activities data
     * @param mailData Extra data needed for mailing.
     * @param container
     */
    function prepareForm(detail, mailData, container) {
        if(detail.places <= 0) {
            // Reservations are not possible.Remove the form, add a notice.
            container.querySelector('.mhwp-ipso-activity-reservation form').remove();

            // Don't use addMessage here. The message should be persistent
            const notice = createNodeFromHTML('<div class="mhwp-ipso-activity-detail-soldout">De activiteit is vol, u kunt niet meer reserveren.</div>');
            container.querySelector('.mhwp-ipso-activity-reservation').append(notice);

        } else if(detail.reservationUrl && ! detail.disableReservation) {
            // We dont need the form. Prepare the button to redirect. remove the form.
            const button = container.querySelector("button.mhwp-ipso-activity-show-reservation");
            ['data-toggle', 'data-target', 'aria-expanded', 'aria-controls'].map((attr) => button.removeAttribute(attr));
            button.addEventListener('click', (e) => window.location = detail.reservationUrl );
            container.querySelector('.mhwp-ipso-activity-reservation').remove();

        } else {
            // Add validation- and submit handlers to the form. The form needs to be a jQuery object.
            const form = $jq('form', container);
            form.validate({
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

    // Run init and handleWeekChange on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => { init(); handleWeekChange(0);});
})();
