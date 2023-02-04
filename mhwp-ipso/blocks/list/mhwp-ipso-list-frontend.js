/**
 * Todo addMessage ipv <div id='notice'>
 * Todo week buttons 5 sec buiten gebruik.
 * Todo classname mhwp-ipso-reservation-button;
 * Todo drop $jq;
 * Todo detail template;
 * Todo ticket bij IPSO over filters;
 * Todo fetch details bij openklappen?
 */
import template from './mhwp-ipso-list-template';

import '../includes/bootstrap-collapse';
import '../includes/bootstrap-transition';

import { fetchWpRest, wait, addMessage, clearErrors, clearMessages, makeReservation} from "../includes/mhwp-lib";


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

    // Container for all activities.
    let listContainer;

    /**
     * init globals, attach event handlers.
     */
    function init() {
        // the container for all activities.
        listContainer = document.querySelector('#mhwp-ipso-list-container');

        // A rule for the jQuery validator. Dutch phone numbers have 10 digits (or 11 and start with +31).
        $jq.validator.addMethod( "phoneNL", function( value, element ) {
            return this.optional( element ) || /^((\+|00(\s|\s?-\s?)?)31(\s|\s?-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?-\s?)?[0-9]){8}$/.test( value );
        }, "Vul een geldig telefoonnummer in." );

        // nr of days, from a hidden field in the wp block.
        const el = document.getElementById('mhwp-ipso-list-nr-days');
        nrDays = parseInt(el.value) || 0;

        // Attach an eventhandler to the datepicker.
        const datePicker = document.querySelector('#mhwp-ipso-list-datepicker input');
        datePicker.addEventListener('change', handleDateChange)

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
     * Top level function.
     *
     * @returns {void}
     */
    async function main () {
        // Clear the listContainer.
        const items = Array.from(listContainer.querySelectorAll('li'));
        items.map((n) => n.remove());

        // Get all activities from our wp; property data; Sort them;
        let activities = await getActivities();
        activities = activities.data;
        activities.sort((a1, a2) => new Date(a1.timeStart) - new Date(a2.timeStart));

        await processActivities(activities);
    }

    /**
     * Handle changes in the datepicker.
     *
     * Todo: restrict dates to choose; invalid dates handling;
     * @param event
     * @returns {Promise<void>}
     */
    async function handleDateChange(event) {
        const d = new Date(event.currentTarget.value);
        if ( "Invalid String." === d.toString())
            return;

        // Get all activities from our wp, property data. Sort them.
        let activities = await getActivitiesByDate(d);
        activities = activities.data;
        activities.sort((a1, a2) => new Date(a1.timeStart) - new Date(a2.timeStart));

        await processActivities(activities);
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
        document.querySelector('#mhwp-ipso-current-week').innerHTML = `${dateFormat(mon)} - ${dateFormat(sun)}`;
        currentDay = mon;

        // Disable the next/prev week buttons
        const buttons = Array.from(document.querySelectorAll('#mhwp-ipso-list-weekpicker button'));
        buttons.map((b) => b.disabled = true);
        addMessage('Ophalen van gegevens, dit kan even duren', document.querySelector('#mhwp-ipso-list-weekpicker'));

        // Enable them in 5 seconds.
        // TODO do we want another solution for this?
        //  - only load calendar, details only after opening an item;
        //  - disable buttons after selecting a week; enable them after fetching the calendar and details (not 5 sec.)
        setTimeout(function () {
            const buttons = Array.from(document.querySelectorAll('#mhwp-ipso-list-weekpicker button'));
            buttons.map((b) => b.disabled = false);
            clearMessages(document.querySelector('#mhwp-ipso-list-weekpicker'));
        }, 5000);

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
     * Fetch all activities.
     * The from and till query parameter are set with the value from the wp block.
     *
     * @returns {Promise<void>}
     */
    async function getActivities() {
        const url = new URL( marikenhuisURL );
        url.pathname = "wp-json/mhwp-ipso/v1/activity";

        const d = new Date(currentDay);
        const from = d.toISOString().slice(0, -14);
        url.searchParams.append('from', from);

        d.setDate(d.getDate() + nrDays);
        const till = d.toISOString().slice(0, -14);
        url.searchParams.append('till', till);

        clearErrors(listContainer);
        clearMessages(listContainer);
        return await fetchWpRest(url, {}, listContainer);
    }

    /**
     * Fetch all activities for a given date
     * The from and till query parameters are set with the functions parameter.
     *
     * @param date Date to retrieve rthe activities for.
     * @returns {Promise<void>}
     */
    async function getActivitiesByDate(date) {
        const url = new URL( marikenhuisURL );
        url.pathname = "wp-json/mhwp-ipso/v1/activity";

        const d = date.toISOString().slice(0, -14);
        url.searchParams.append('from', d);
        url.searchParams.append('till', d);

        // Clear the listContainer.
        Array.from(listContainer.querySelectorAll('li')).map((n) => n.remove());

        clearErrors(listContainer);
        clearMessages(listContainer);
        return await fetchWpRest(url, {}, listContainer);
    }

    /**
     * Process the fetched activities.
     *
     * @param activities The activities to process
     * @returns {Promise<void>}
     */
    function processActivities(activities) {
        // Keep track of the activities date. For date headers.
        let curDate = null;

        const pairs = activities.map( (activity) => {
            // Add all activities, with or without date separator.
            const node = addActivity(activity, activity.onDate !== curDate);

            // update the current date.
            curDate = activity.onDate;

            return [activity, node];
        })

        // Create a chain of promises to fetch the activity details. Return that chain.
        // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#composition
        return pairs.reduce((ps, [activity, node]) => {
            return ps.then( () => {
                return fillActivity(activity, node);
            })
        }, Promise.resolve());
    }

    /**
     * Add an activity to the dom using our template.
     *
     * @param activity json data that describes the activity,
     * @param newDate Do we want to add a seperator for new date?
     * @returns The jQuery object for the added node.
     */
    function addActivity(activity, newDate) {
        // Formatters for time/date
        const dateFormat = new Intl.DateTimeFormat(undefined, {month: 'long', day: 'numeric', weekday: 'long'}).format;
        const timeFormat = new Intl.DateTimeFormat(undefined, {hour: 'numeric', minute: 'numeric'}).format;

        // Add the formatted date and time to the activity,
        const date = new Date(activity.timeStart);
        activity.date = dateFormat(date);
        activity.time = timeFormat(date);

        // Add a date header if the date changed.
        if (newDate) {
            const dateHeader = `<li class="mhwp-ipso-list-dateheader">${activity.date}</li>`;
            $jq(listContainer).append($jq(dateHeader));
        }

        // fill the template make it jQuery and add it to the dom.
        const node = $jq(template(activity));
        $jq(listContainer).append(node);

        return node;
    }

    /**
     * Fill an activity with its details and prepare the form
     *
     * @param activity The activity.
     * @param node The jquery dom node for the activity.
     */
    async function fillActivity(activity, node) {
        const detail = await getDetail(activity, node);

        const {img, title, intro, descr} = detail;
        $jq(".mhwp-ipso-activity-detail", node).prepend(img, title, intro, descr);

        prepareForm(detail, node);
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
            const imageUrl = new URL(detail.mainImage);
            const reservationUrl = detail.hasOwnProperty('reservationUrl') ? detail.reservationUrl : null;

            // Places left. If maxRegistrations === 0 there is no limit.
            const places = detail.maxRegistrations === 0 ? 1000 : detail.maxRegistrations - detail.nrParticipants;

            return {
                img: `<img src="${imageUrl}" alt="${detail.title}" />`,
                title: `<div class="mhwp-ipso-activity-detail-title">${detail.title}</div>`,
                intro: `<div class="mhwp-ipso-activity-detail-intro">${detail.intro}</div>`,
                descr: `<div class="mhwp-ipso-activity-detail-description">${detail.description}</div>`,
                places,
                reservationUrl
            }
        }).catch((e) => {
            // We had an error fetching the detail. Fill in defaults for the detail. We can still make the reservation.
            return {
                intro: "Er was een probleem met het ophalen van de data",
                description: "Er was een probleem met het ophalen van de data",
                image: "",
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

    /**
     * Remove the form if we dont not need it, otherwise add a validation-, and submit handler.
     *
     * @param detail
     * @param container
     */
    function prepareForm(detail, container) {
        if(detail.places <= 0) {
            // Reservations are not possible.Remove the form and button. add a notice.
            const button = $jq("button.mhwp-ipso-activity-show-reservation", container);
            button.remove();
            $jq('.mhwp-ipso-activity-reservation', container).remove();

            const notice = '<div class="mhwp-ipso-activity-detail-soldout">De activiteit is vol, u kunt niet registreren.</div>';
            $jq('.mhwp-ipso-activity-detail', container).append(notice);
        } else if(detail.reservationUrl) {
            // We dont need the form. Prepare the button to redirect. remove the form.
            const button = $jq("button.mhwp-ipso-activity-show-reservation", container);
            ['data-toggle', 'data-target', 'aria-expanded', 'aria-controls'].map((attr) => button.removeAttr(attr));
            button.on('click', (e) => window.location = detail.reservationUrl );

            $jq('.mhwp-ipso-activity-reservation', container).remove();
        } else {
            // Add validation- and submit handlers to the form.
            const form = $jq('form', container);
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

    // Run init and handleWeekChange on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => { init(); handleWeekChange(7);});
})();
