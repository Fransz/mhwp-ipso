import './bootstrap-collapse';

import template from './mhwp-ipso-list-template';

// TODO: Use the production URL.
const marikenhuisURL ="http://localhost:8080/";

// TODO: This has to be test or live.
const ipsoURL = "https://api.test.ipso.community/";

/**
 * Main function called upon onDOMContentLoaded.
 * Fetch all wanted activities, and ther details. For each create a large HTML.
 */
async function getActivities() {
    const url = new URL( marikenhuisURL );
    url.pathname = "wp-json/mhwp-ipso/v1/activity";
    url.searchParams.append('nr_days', '7');

    // Get the nonce.
    // Todo: we want to drop the nonce. It invalidates the block in the backend.
    const node = document.getElementById('mhwp-ipso-list-nonce');
    const nonce = node ?. value;

    // Get the container
    const container = document.getElementById('mhwp-ipso-list-container');

    clearErrors(container);
    clearMessages(container);
    const fetchInit = {'HTTP_X_WP_NONCE': nonce };
    const activities = await fetchWpRest(url, fetchInit, nonce, container);
    await addActivities(activities.data, container);
}

/**
 * For all activities create and add html (data, form, details) to the DOM.
 * @param activities All activities.
 * @param container The parent container for all html.
 * @returns {Promise<void>}
 */
async function addActivities(activities, container) {
    let light_dark = 'light';
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

           // TODO: We want to get html from IPSO.
           let intro = activityDetail.data.intro;
           intro = JSON.parse(intro);
           intro = intro.ops.reduce((p, c) => p + c.insert, "");
           activity.intro = intro;

           // TODO: We want to get html from IPSO.
           let description = activityDetail.data.description;
           description = JSON.parse(description);
           description = description.ops.reduce((p, c) => p + c.insert, "");
           activity.description = description;
       }
       light_dark = light_dark === 'light' ? 'dark' : 'light';
       cnt++;

       const html = template(activity, cnt, light_dark);
       const node = $(html);
       $(container).append(node);
    }

    prepareReservations();
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
    return fetchWpRest(url, {}, 0, container, true).then((json) => {
        // Upon a 429 error (Too many requests), We try again.
        if ( json.mhwp_ipso_code === 429) {
            console.log('Error 429, retrying');
            return wait(
                800
            ).then(() => {
                return fetchWpRest(url, {}, 0, container, false);
            });
        }
        return json;
    });
}

/**
 * Find all forms adde by the calendar, attach a validator and a submit handler to each.
 */
function prepareReservations() {
    // The URL for making the reservation
    const url = new URL( marikenhuisURL );
    url.pathname = "wp-json/mhwp-ipso/v1/reservation";

    // Dutch phone numbers have 10 digits (or 11 and start with +31).
    $.validator.addMethod( "phoneNL", function( value, element ) {
        return this.optional( element ) || /^((\+|00(\s|\s?-\s?)?)31(\s|\s?-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?-\s?)?[0-9]){8}$/.test( value );
    }, "Vul een geldig telefoonnummer in." );

    const forms = $('form', '#mhwp-ipso-list-container');
    forms.each( (_, f) => {
        $( f ).validate({
            rules: {
                // We only use one explicit validation rule. others are extracted from the HTML attributes
                phoneNumber: {
                    phoneNL: true,
                    "normalizer": v => $.trim(v)
                }
            },
            "submitHandler": async function ( form, event ) {
                event.preventDefault();
                $('button', form).prop('disabled', true);
                const container = $(form).parent();

                const activityCalendarId = $('input[name="activityCalendarId"]', form).val();
                const firstName = $('input[name="firstName"]', form).val();
                const lastNamePrefix = $('input[name="lastNamePrefix"]', form).val();
                const lastName = $('input[name="lastName"]', form).val();
                const email = $('input[name="email"]', form).val();
                let phoneNumber = $('input[name="phoneNumber"]', form).val();
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
                    addMessage('Er is een plaats voor u gereserveerd; U ontvangt een email', container)
                    setTimeout(() => {
                        clearMessages(container);
                        $('button', form).prop('disabled', false);
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


/**
 * Helper method for accessing the rest api in our wordPress installation.
 *
 * @param url The URL of the worpress installation.
 * @param init Additional settings for the fetch init object.
 * @param nonce
 * @param errorContainer A container for error messages.
 * @param handle_429 whether the caller handles 429 errors.
 * @returns {Promise<any>}
 */
function fetchWpRest (url, init, nonce, errorContainer, handle_429=false) {
    const defaults = {
        method: 'GET',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }
    return fetch( url, Object.assign({}, defaults, init)).then((res)=> {
        if ( ! res.ok ) {
            const message = res['message'] ? res['message'] : '';
            throw new TypeError( message );
        }
        return res.json();
    }).then((json) => {
        if ( json.mhwp_ipso_status !== 'ok' ) {
            // Upon a 429 error and if the caller can handle it, we return our JSON.
            if ( json.mhwp_ipso_code === 429 && handle_429) {
                return json;
            }
            const message = json.mhwp_ipso_msg ? json.mhwp_ipso_msg : '';
            throw new TypeError( message );
        }
        return json;
    }).catch( (err) => {
            let message = '';
            if (err instanceof TypeError) {
                message = err.message;
            }
            if ('' === message) {
                message = 'Er gaat iets is, probeer het later nog eens';
            }
            addError(message, errorContainer);

            // retrow the error. Users of this call decide what should happen.
            throw(err);
        }
    )
}

/**
 * Helper for setTimeout in a Promise style.
 *
 * @param duration
 * @returns {Promise<unknown>}
 */
function wait(duration) {
    return new Promise((resolve, reject) => {
        if(duration < 0) reject( new Error("Cannot wait negative time"));
        setTimeout(resolve, duration);
    })
}

/**
 * Helper for adding a message text to a container.
 *
 * @param message The text message.
 * @param className The messages classname
 * @param container The containter where to add the message.
 */
function addNode( message, className, container) {
    const html = `<div class="${className}-container"><h3 class="message">${message}</h3></div>`;
    const node = $(html);
    $(container).append(node);

}
function addError( message, container ) {
    addNode( message, 'error', container);
}
function addMessage( message, container ) {
    addNode( message, 'message', container);
}

/**
 * Helper for reming messages within a container.
 * @param className The classname for selecting.
 * @param container The container where to search.
 */
function clearNodes(className, container) {
    $(`.${className}-container`, container).remove();
}
function clearErrors(container) {
    clearNodes('error', container);
}
function clearMessages(container) {
    clearNodes('message', container);
}

$(document).ready(getActivities);
