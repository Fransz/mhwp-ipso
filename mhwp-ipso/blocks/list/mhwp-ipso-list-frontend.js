// TODO: We fetch the activities sequentially now.
// TODO: Drop the altrnative functions/template; Clean up
// import template from './mhwp-ipso-list-template';
import templateSeq from './mhwp-ipso-list-template-seq';

import '../includes/bootstrap-collapse';
import '../includes/bootstrap-transition';

import { fetchWpRest, wait, addMessage, clearErrors, clearMessages } from "../includes/mhwp-lib";

const $jq = jQuery.noConflict();

const marikenhuisURL = document.location.origin;

// Dutch phone numbers have 10 digits (or 11 and start with +31).
$jq.validator.addMethod( "phoneNL", function( value, element ) {
    return this.optional( element ) || /^((\+|00(\s|\s?-\s?)?)31(\s|\s?-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?-\s?)?[0-9]){8}$/.test( value );
}, "Vul een geldig telefoonnummer in." );

// TODO: This has to be test or live. We probably want the wp to fix the image urls.
// We need this for images.
const ipsoURL = "https://api.test.ipso.community/";

/**
 * Top level function. Tobe called on DomContentLoaded.
 *
 * @returns {Promise<void>}
 */
async function allActivities() {
    const container = document.getElementById('mhwp-ipso-list-container');

    const activities = await getActivities(container);
    await addActivities(activities.data, container);
    prepareReservations();
}

/**
 * Top level function. Tobe called on DomContentLoaded.
 *
 * @returns {Promise<void>}
 */
async function allActivitiesSeq() {
    const container = document.getElementById('mhwp-ipso-list-container');

    // Get all activities from our wp. Sorted
    // TODO get a better name for this. the data structure also contains:
    // - nonce for the form; - type of the reservation form (ipso, lq, form, mail); - url to b used for the reservation.
    const activities = await getActivities(container);
    activities.data.sort((a1, a2) => new Date(a1.timeStart) - new Date(a2.timeStart));


    // Add a node to the dom for each activity, return a activityId (not itemId), node pair.
    // TODO: We probably want a pair of activity (i.e. wp datastructure) and nod.
    const pairs = activities.data.map( (activity) => {
        const node = addActivity(activity, container);
        return [activity.activityID, node]
    })

    // pairs.map( ([activityId, node]) => fillDetail(activityId, node));

    // Create a chain of promises to fetch the activity details.
    // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#composition
    pairs.reduce((ps, [activityId, node]) => {
       return ps.then( async () => {
           const detail = await getDetail(activityId);
           fillDetail(detail, node);
           prepareForm(detail, node);
       })
    }, Promise.resolve());

    // Prepare the form for each node.
    // TODO use the node and the activity here.
    // prepareReservations();
}

/**
 * Fetch all wanted activities.
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

    // Get the nonce.
    // Todo: we want to drop the nonce. It invalidates the block in the backend.
    const node = document.getElementById('mhwp-ipso-list-nonce');
    const nonce = node ?. value;

    clearErrors(container);
    clearMessages(container);
    const fetchInit = {'HTTP_X_WP_NONCE': nonce };
    return await fetchWpRest(url, fetchInit, nonce, container);
}

function addActivity(activity, container) {
    // Formatters for time/date
    const dateFormat = new Intl.DateTimeFormat(undefined, {month: 'long', day: 'numeric', weekday: 'long'}).format;
    const timeFormat = new Intl.DateTimeFormat(undefined, {hour: 'numeric', minute: 'numeric'}).format;

    const date = new Date(activity.timeStart);
    activity.date = dateFormat(date);
    activity.time = timeFormat(date);

    // fill the template make it jQuery and add it to the dom.
    const node = $jq(templateSeq(activity));
    $jq(container).append(node);

    return node;
}

function getDetail(id, container) {
    return getActivityDetailSeq(id, container).then((json) => {
        const detail = json.data;
        const imageUrl = new URL(detail.mainImage, ipsoURL);
        const reservationUrl = detail.hasOwnProperty('reservationUrl') ? detail.reservationUrl : null;

        return {
            img: `<img src="${imageUrl}" alt="${detail.title}" />`,
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

function fillDetail(detail, container) {
    const {img, intro, descr} = detail;
    $jq(".mhwp-ipso-activity-detail", container).prepend(img, intro, descr);
}

/**
 * For all activities create and add html (data, form, details) to the DOM.
 * @param activities All activities.
 * @param container The parent container for all html.
 * @returns {Promise<void>}
 */
async function addActivities(activities, container) {
    let cnt = 0;

    // Formatters for time/date
    const dateFormat = new Intl.DateTimeFormat(undefined, {month: 'long', day: 'numeric', weekday: 'long'}).format;
    const timeFormat = new Intl.DateTimeFormat(undefined, {hour: 'numeric', minute: 'numeric'}).format;

    // Sort the array with activities.
    activities.sort((a1, a2) => new Date(a1.timeStart) - new Date(a2.timeStart));

    for (let key in Object.keys(activities)) {
        let activity = activities[key];
        let activityDetail = await getActivityDetail(activity.activityID, container).catch((e) => {
            console.log(e);

            // We had an error fetching the detail. Fill in defaults for the detail. We can still make the reservation.
            activity.intro = "Er was een probleem met het ophalen van de data";
            activity.description = "Er was een probleem met het ophalen van de data";
            activity.image = "";

            return null;
        });

        const date = new Date(activity.timeStart);
        activity.date = dateFormat(date);
        activity.time = timeFormat(date);

       if(activityDetail) {
           const imageUrl = new URL(activityDetail.data.mainImage, ipsoURL);
           activity.img = `<img src="${imageUrl}" alt="${activity.title}" />`

           activity.intro = activityDetail.data.intro;
           activity.description = activityDetail.data.description;
       }
       cnt++;

       const html = template(activity, cnt);
       const node = $jq(html);
       $jq(container).append(node);
    }
}

/**
 * For an activity fetch its details.
 *
 * @param activityId The activity for which to fetch the detail
 * @param container The parent for messages.
 * @returns {Promise<any>}
 */
async function getActivityDetail(activityId, container) {
    const url = new URL( marikenhuisURL );
    url.pathname = `wp-json/mhwp-ipso/v1/activity/${activityId}`;


    clearErrors(container);
    clearMessages(container);
    return fetchWpRest(url, {}, 0, container, false).then((json) => {
        // Upon a 429 error (Too many requests), We try again.
        if ( json.mhwp_ipso_code === 429) {
            console.log('Error 429, retrying');
            return wait(800).then(() => {
                return fetchWpRest(url, {}, 0, container, true);
            });
        }
        return json;
    });
}

async function getActivityDetailSeq(activityId, container) {
    const url = new URL( marikenhuisURL );
    url.pathname = `wp-json/mhwp-ipso/v1/activity/${activityId}`;


    clearErrors(container);
    clearMessages(container);
    return fetchWpRest(url, {}, 0, container, false).then((json) => {
        // Upon a 429 error (Too many requests), We try again.
        if ( json.mhwp_ipso_code === 429) {
            console.log('Error 429, retrying');
            return wait(800).then(() => {
                return fetchWpRest(url, {}, 0, container, true);
            });
        }
        return json;
    });
}

function prepareForm(detail, container) {
   if(detail.reservationUrl) {
       const button = $jq("button.mhwp-ipso-activity-show-reservation", container);
       ['data-toggle', 'data-target', 'aria-expanded', 'aria-controls'].map((attr) => button.removeAttr(attr));
       button.on('click', (e) => window.location = detail.reservationUrl );

       $jq('.mhwp-ipso-activity-reservation', container).remove();
   } else {
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

async function makeReservation(form, event) {
    event.preventDefault();

    // The URL for making the reservation
    const url = new URL( marikenhuisURL );
    url.pathname = "wp-json/mhwp-ipso/v1/reservation";

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
        // TODO: if ! 200 addError
        addMessage('Er is een plaats voor u gereserveerd; U ontvangt een email', container)
        setTimeout(() => {
            clearMessages(container);
            $jq('button', form).prop('disabled', false);
        }, 2500);
    }).catch((_) => {
        // TODO: addError
        // No op. We had an error making a reservation. We still want to continue, maybe an other one
        // succeeds.
    });
}

/**
 * Find all forms added by the calendar, attach a validator and a submit handler to each.
 */
function prepareReservations() {

    forms.each( (_, f) => {
        $jq( f ).validate({
        });
    });
}

$jq(document).ready(allActivitiesSeq);
