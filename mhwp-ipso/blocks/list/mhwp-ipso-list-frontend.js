import template from './mhwp-ipso-list-template';

import '../includes/bootstrap-collapse';
import '../includes/bootstrap-transition';

import { fetchWpRest, wait, addMessage, clearErrors, clearMessages, makeReservation} from "../includes/mhwp-lib";

const $jq = jQuery.noConflict();

const marikenhuisURL = document.location.origin;

// Dutch phone numbers have 10 digits (or 11 and start with +31).
$jq.validator.addMethod( "phoneNL", function( value, element ) {
    return this.optional( element ) || /^((\+|00(\s|\s?-\s?)?)31(\s|\s?-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?-\s?)?[0-9]){8}$/.test( value );
}, "Vul een geldig telefoonnummer in." );

/**
 * Top level function. Tobe called on DomContentLoaded.
 *
 * @returns {Promise<void>}
 */
async function allActivities() {
    const container = document.getElementById('mhwp-ipso-list-container');


    // Get all activities from our wp, property data. Sort them.
    let activities = await getActivities(container);
    activities = activities.data;

    activities.sort((a1, a2) => new Date(a1.timeStart) - new Date(a2.timeStart));


    // Add a node to the dom for each activity, return an activityId (not itemId), node (jquery object) pair.
    const pairs = activities.map( (activity) => {
        const node = addActivity(activity, container);
        return [activity.activityID, node];
    })


    // Create a chain of promises to fetch the activity details. The promise returns void.
    // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#composition
    pairs.reduce((ps, [activityId, node]) => {
       return ps.then( () => {
           return fillActivity(activityId, node);
       })
    }, Promise.resolve());
}

/**
 * Fetch all activities.
 *
 * @param container Container for error messages.
 * @returns {Promise<void>}
 */
async function getActivities(container) {
    const url = new URL( marikenhuisURL );
    url.pathname = "wp-json/mhwp-ipso/v1/activity";

    // Get the parameter for in the query, We always have value in nr-days.
    let nrDays = document.getElementById('mhwp-ipso-list-nr-days');
    nrDays = parseInt(nrDays.value);

    let d = new Date();
    const from = d.toISOString().slice(0, -14);
    url.searchParams.append('from', from);

    d.setDate(d.getDate() + nrDays);
    const till = d.toISOString().slice(0, -14);
    url.searchParams.append('till', till);

    clearErrors(container);
    clearMessages(container);
    return await fetchWpRest(url, {}, container);
}

/**
 * Add an activity to the dom using our template.
 *
 * @param activity json data that describes the activity,
 * @param container The container where to add.
 * @returns The jQuery object for the added node.
 */
function addActivity(activity, container) {
    // Formatters for time/date
    const dateFormat = new Intl.DateTimeFormat(undefined, {month: 'long', day: 'numeric', weekday: 'long'}).format;
    const timeFormat = new Intl.DateTimeFormat(undefined, {hour: 'numeric', minute: 'numeric'}).format;

    const date = new Date(activity.timeStart);
    activity.date = dateFormat(date);
    activity.time = timeFormat(date);

    // fill the template make it jQuery and add it to the dom.
    const node = $jq(template(activity));
    $jq(container).append(node);

    return node;
}

/**
 * Fill an activity with its details and prepare the form
 *
 * @param activityId The id for the activity.
 * @param node The jquery dom node for the activity.
 */
async function fillActivity(activityId, node) {
    const detail = await getDetail(activityId, node);

    const {img, title, intro, descr} = detail;
    $jq(".mhwp-ipso-activity-detail", node).prepend(img, title, intro, descr);

    prepareForm(detail, node);
}

/**
 * Get the details for an activity, process them. Return a default upon failure.
 *
 * @param id The detail id.
 * @param container A container for error messages,
 * @returns {Promise<{descr: string, img: string, intro: string, reservationUrl: null} | {image: string, intro: string, description: string, reservationUrl: null}>}
 */
function getDetail(id, container) {
    return fetchDetail(id, container).then((json) => {
        const detail = json.data;
        const imageUrl = new URL(detail.mainImage);
        const reservationUrl = detail.hasOwnProperty('reservationUrl') ? detail.reservationUrl : null;

        return {
            img: `<img src="${imageUrl}" alt="${detail.title}" />`,
            title: `<div class="mhwp-ipso-activity-detail-title">${detail.title}</div>`,
            intro: `<div class="mhwp-ipso-activity-detail-intro">${detail.intro}</div>`,
            descr: `<div class="mhwp-ipso-activity-detail-description">${detail.description}</div>`,
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
 * @param activityId The activity for which to fetch the detail
 * @param container The parent for messages.
 * @returns {Promise<any>}
 */
async function fetchDetail(activityId, container) {
    const url = new URL( marikenhuisURL );
    url.pathname = `wp-json/mhwp-ipso/v1/activity/${activityId}`;

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
   if(detail.reservationUrl) {
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
           "submitHandler": makeReservation,
           "invalidHandler": function () {
               // TODO: We want an error message here.
               console.log( 'invalid' );
           }

       })
   }
}

$jq(document).ready(allActivities);
