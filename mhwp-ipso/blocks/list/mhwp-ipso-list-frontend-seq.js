import template from './mhwp-ipso-list-template';
import '../includes/bootstrap-collapse';
import '../includes/bootstrap-transition';

import { fetchWpRest, wait, addMessage, clearErrors, clearMessages } from "../includes/mhwp-lib";

const $jq = jQuery.noConflict();

const marikenhuisURL = document.location.origin;

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

    // Get all activities from our wp. Sorted
    const activities = await getActivities(container);
    activities.data.sort((a1, a2) => new Date(a1.timeStart) - new Date(a2.timeStart));


    // Add a node to the dom for each activity, return a activityId (not itemId), node pair.
    // Get the activity details, and add them to the correct node
    // Both are async actions.
    const pairs = activities.data.map( (activity) => {
        const node = addActivity(activity, container);
        return [activity.activityID, node]
    })
    pairs.map( ([activityId, node]) => fillDetail(activityId, node));

    // Prepare the form for each node.
    prepareReservations();

    // TODO better flow:
    // getActivities; addActivities; getDetails; addDetails; addForms
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
    const node = $jq(template(activity));
    $jq(container).append(node);

    return node;
}

async function fillDetail(id, container) {
    let {img, intro, descr} = await getActivityDetail(id, container).then((detail) => {
        const imageUrl = new URL(detail.data.mainImage, ipsoURL);
        return {
            img: `<img src="${imageUrl}" alt="${detail.data.title}" />`,
            intro: `<div class="mhwp-ipso-activity-detail-intro">${detail.data.intro}</div>`,
            descr: `<div class="mhwp-ipso-activity-detail-description">${detail.data.description}</div>`
        }
    }).catch((e) => {
        // We had an error fetching the detail. Fill in defaults for the detail. We can still make the reservation.
        return {
            intro: "Er was een probleem met het ophalen van de data",
            description: "Er was een probleem met het ophalen van de data",
            image: ""
        }
    });

    $jq(".mhwp-ipso-activity-detail", container).prepend(img, intro, descr)
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

    const duration= 1000 + Math.floor(Math.random() * 1000);
    console.log(duration);

    clearErrors(container);
    clearMessages(container);
    return wait(duration).then(() => {
        console.log(Date.now());
        fetchWpRest(url, {}, 0, container, false).then((json) => {
            // Upon a 429 error (Too many requests), We try again.
            if ( json.mhwp_ipso_code === 429) {
                console.log('Error 429, retrying');
                return wait(800).then(() => {
                    return fetchWpRest(url, {}, 0, container, true);
                });
            }
            return json;
        })
    });
}

/**
 * Find all forms added by the calendar, attach a validator and a submit handler to each.
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
                    // TODO if ! 200 addError
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

$jq(document).ready(allActivities);
