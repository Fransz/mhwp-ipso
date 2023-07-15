/**
 * Todo: waarom staat er in ipspo 'invalid date'; (8 mei tajij laura peters;; de inschrijving staat wel in ipso.)
 * Todo: clear reservation form after submission.
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
import {msg} from "@babel/core/lib/config/validation/option-assertions";


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

    let cardTemplate = document.getElementById("mhwp-ipso-month-card");

    let activities = Array();

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

    /** Calculate first and last day of the week in which d falls.
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
     */
    async function main () {
        // Clear the listContainer.
        const listContainer = document.querySelector('#mhwp-ipso-list-container');
        const items = Array.from(listContainer.querySelectorAll('li'));
        items.map((n) => n.remove());

        // Get all activities, collapse, sort and display.
        const activities = await fetchActivities(new Date(), 30, listContainer).then(json => {
            const as = collapseActivities(json.data);
            as.sort((a1, a2) => new Date(a1.items[0].timeStart) - new Date(a2.items[0].timeStart));

            displayActivities(as, listContainer);

            return as;
        });

        // Clean up message.
        return clearMessages(document.querySelector('#mhwp-ipso-list-weekpicker'));
    }

    /**
     * Collapse the same activities on the same day.
     * Create an object with all activityIds as key and as value an object with all dates for that activity as key
     * and as value an array of all those activities on that day.
     * Then collect all activities into a single array again.
     *
     * @param activities
     * @returns {{activityID: *, onDate: *, mentors: *, title: *, items: *, extraInfo: *}[]}
     */
    function collapseActivities (activities) {
        let groups = activities.reduce( groupById, {} );
        Object.keys(groups).forEach( k => groups[k] = groups[k].reduce( groupByDate, {} ));

        return Object.keys(groups).flatMap( ak => Object.keys(groups[ak]).map( dk => collect(groups[ak][dk])));

        function groupById(acc, cur) {
            return groupBy( cur.activityID, acc, cur);
        }
        function groupByDate(acc,cur) {
            return groupBy( cur.onDate, acc, cur);
        }
        function groupBy (key, acc, cur) {
            const grp = acc[key] ?? [];
            return { ...acc, [key]: [...grp, cur]}
        }

        function collect(acts) {
            // Sort all same activities on the same day.
            acts.sort((a1, a2) => new Date(a1.timeStart) - new Date(a2.timeStart));

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
     * Fetch activities.
     *
     * @param d startDate.
     * @param nr number of days.
     * @param msgContainer container for messages.
     * @returns Object The json representation of the activities.
     */
    async function fetchActivities(d, nr, msgContainer) {
        const url = new URL( marikenhuisURL );
        url.pathname = "wp-json/mhwp-ipso/v1/activity";

        const from = d.toISOString().slice(0, -14);
        url.searchParams.append('from', from);

        d.setDate(d.getDate() + nr - 1);
        const till = d.toISOString().slice(0, -14);
        url.searchParams.append('till', till);

        clearErrors(msgContainer);
        clearMessages(msgContainer);
        return await fetchWpRest(url, {}, msgContainer);
    }

    /**
     * For all activities display a card.
     *
     * @param activities
     * @param listContainer Where to add the activity element.
     */
    function displayActivities (activities, listContainer) {
        const template = document.getElementById('mhwp-ipso-month-card').content.firstElementChild;

        const dateFormat = new Intl.DateTimeFormat(undefined, {month: 'long', day: 'numeric', weekday: 'long'}).format;
        const timeFormat = new Intl.DateTimeFormat(undefined, {hour: 'numeric', minute: 'numeric'}).format;

        activities.forEach( activity => {
            const element = template.cloneNode(true);

            const date = dateFormat(new Date(activity.onDate));
            const times = activity.items.map( i => timeFormat (new Date(i.timeStart))).join('; ');

            element.querySelector('.mhwp-ipso-card-title').innerHTML = activity.title;
            element.querySelector('.mhwp-ipso-card-date').innerHTML = date;
            element.querySelector('.mhwp-ipso-card-time').innerHTML = times;

            element.querySelector('.mhwp-ipso-show-detail').addEventListener('click', (e) => {
                processActivity(activity, element).then( act => displayActivity(act));
            });
            listContainer.append(element);

        });
    }

    /**
     * Fetch the details for an activity, filter all of its items on places available.
     *
     * @param activity
     * @param msgContainer
     * @returns {Promise<{detail}>} All information for an activity.
     */
    async function processActivity (activity, msgContainer) {
        const { data: detail } = await fetchDetail(activity, msgContainer);
        // For all items, fetch the nr of participants in parallel.
        const items = await Promise.all( activity.items.map( item => {
                return fetchParticipants(item.calendarId, msgContainer).then( r => {
                    item.places = detail.maxRegistrations === 0 ? 1000 : detail.maxRegistrations - r.data.nrParticipants;
                    return item;
                });
            })
        );

        detail.items = items.filter( i => i.places > 0);
        detail.imageUrl = detail.mainImage ? new URL(detail.mainImage) : "";

        return detail;
    }

    /**
     *  Display an activity in a modal popup.
     * @param activity
     */
    function displayActivity(activity) {
        const box = document.getElementById('mhwp-ipso-box').content.firstElementChild.cloneNode(true);

        activity.items.reduce( (acc, i) => {
           return acc += i.calendarId;
        }, "");

        box.querySelector('#mhwp-ipso-box-items').innerHTML = activity.items;
        box.querySelector('#mhwp-ipso-box-image').src = activity.imageUrl;

        const parent = document.getElementById('mhwp-ipso-list-container');
        parent.prepend(box);

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
     * Fill an activity with its details and prepare the reservation button.
     * If necessary prepare the reservation form.
     *
     * @param activity The activity.
     * @param node The dom node for the activity.
     */
    async function fillActivity(activity, node) {
        // Get the details for the activity. Template strings and properties.
        addMessage("Ophalen van gegevens, dit kan even duren", node);
        const detail = await getDetail(activity, node);
        clearMessages(node);

        // Enable the reservation button by default.
        const button = node.querySelector('.mhwp-ipso-reservation-button');
        button.disabled = false;

        // Prepend the details template strings to the detail node
        const {img, title, intro, descr} = detail;
        const detailNode = node.querySelector('.mhwp-ipso-activity-detail');
        detailNode.prepend(img, title, intro, descr);


        // properties we process here.
        const { disableReservation, places, reservationUrl} = detail;

        // Check if we want the reservation button to be hidden.
        if (disableReservation) {
            button.hidden = true;
            return;
        }

        // Check if the activity was in the past (in days).
        const toDay = (new Date()).setHours(0, 0, 0, 0);
        const date = new Date(activity.timeStart)
        if (date < toDay) {
            button.disabled = true;
            return;
        }

        // Check if we have a alternative URL for reservations.
        if(reservationUrl) {
            ['data-toggle', 'data-target', 'aria-expanded', 'aria-controls'].map((attr) => button.removeAttribute(attr));
            button.addEventListener('click', (e) => window.location = reservationUrl);
            return;
        }

        // Check if there are places left.
        if(places <= 0) {
            button.hidden = true;

            // Don't use addMessage here. The message should be persistent
            const notice = createNodeFromHTML('<div class="mhwp-ipso-activity-detail-soldout">De activiteit is vol, u kunt niet meer reserveren.</div>');
            node.querySelector('.mhwp-ipso-activity-detail').append(notice);
            return;
        }

        // We need the reservation, and extra data for mailing on the server.
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
                reservationUrl: null,
                disableReservation: false
            }
        });
    }

    /**
     * Make the request for the details, and again if necessary.
     *
     * @param activity The activity for which to fetch the detail
     * @param msgContainer The parent for messages.
     * @returns {Promise<any>}
     */
    async function fetchDetail(activity, msgContainer) {
        const url = new URL( marikenhuisURL );
        url.pathname = 'wp-json/mhwp-ipso/v1/activitydetail';
        url.searchParams.append('activityId', activity.activityID);
        url.searchParams.append('calendarId', activity.id);

        return fetchWpRest(url, {}, msgContainer, false).then((json) => {
            // Upon a 429 error (Too many requests), We try again.
            if ( json.mhwp_ipso_code === 429) {
                console.log('Error 429, retrying');
                return wait(1000).then(() => {
                    return fetchWpRest(url, {}, msgContainer, true);
                });
            }
            clearMessages(msgContainer);
            return json;
        });
    }

    /**
     * Make the request for the nr of participants, and again if necessary.
     *
     * @param calendarId The calendarId of the activity.
     * @param msgContainer The parent for messages.
     * @returns {Promise<any>}
     */
    function fetchParticipants(calendarId, msgContainer) {
        const url = new URL( marikenhuisURL );
        url.pathname = 'wp-json/mhwp-ipso/v1/participants';
        url.searchParams.append('calendarId', calendarId);

        return fetchWpRest(url, {}, msgContainer, false).then((json) => {
            // Upon a 429 error (Too many requests), We try again.
            if ( json.mhwp_ipso_code === 429) {
                console.log('Error 429, retrying');
                return wait(1000).then(() => {
                    return fetchWpRest(url, {}, msgContainer, true);
                });
            }
            clearMessages(msgContainer);
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

    // Run init and handleWeekChange on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => { init(); handleWeekChange(0);});
})();
