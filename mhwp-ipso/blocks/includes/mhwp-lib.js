/**
 * Make a reservation by accessing our API.
 * Submit callback for the validator api
 *
 * @param detail The activity.
 * @param mailData extra data needed for mailing.
 * @param form The form  that is submitted.
 * @param event The submit event.
 * @returns {Promise<void>}
 */
async function makeButtonReservation(detail, mailData, form, event) {
    event.preventDefault();

    // The URL for making the reservation
    const marikenhuisURL = document.location.origin;
    const url = new URL( marikenhuisURL );
    url.pathname = "wp-json/mhwp-ipso/v1/reservation";

    const formContainer = form.parentNode;
    const container = formContainer.parentNode;

    // Clear messages.
    clearErrors(formContainer);
    clearMessages(formContainer);
    clearErrors(container);
    clearMessages(container);

    // Collect all data in an object.
    const activityCalendarId = form.querySelector('input[name="activityCalendarId"]').value;
    const firstName = form.querySelector('input[name="firstName"]').value;
    const lastNamePrefix = form.querySelector('input[name="lastNamePrefix"]').value;
    const lastName = form.querySelector('input[name="lastName"]').value;
    const email = form.querySelector('input[name="email"]').value;
    let phoneNumber = form.querySelector('input[name="phoneNumber"]').value;
    phoneNumber = phoneNumber === "" ? null : phoneNumber;
    const activityId = mailData.activityId;
    const activityTitle = mailData.activityTitle;
    const activityDate = mailData.activityDate;
    const activityTime = mailData.activityTime;

    const data = {
        activityCalendarId, firstName, lastNamePrefix, lastName, email, phoneNumber,
        activityId, activityTitle, activityDate, activityTime
    };

    const fetchInit = {
        method: 'POST',
        body: JSON.stringify( data )
    }
    await fetchWpRest(
        url, fetchInit, container
    ).then(() => {
        // TODO: if ! 200 addError

        // We made a successful reservation; Check to see if we can make another.
        detail.places -= 1;
        if (detail.places <= 0) {
            // Reservations are no more possible.Remove the form, add a notice.
            form.remove();

            // Don't use addMessage here. The message should be persistent
            const notice = createNodeFromHTML('<div class="mhwp-ipso-reservation-soldout">De activiteit is vol, u kunt niet meer registreren.</div>');
            formContainer.append(notice);
        }

        // Close the reservation form, add a message.
        formContainer.classList.remove('in');
        addMessage('Er is een plaats voor u gereserveerd; U ontvangt een email', container)

        // Close the message after 5 sec.
        setTimeout(() => {
            clearMessages(container);
        }, 5000);
    }).catch((_) => {
        console.log('catched');
        // TODO: addError
        // No op. We had an error making a reservation. We still want to continue, maybe an other one
        // succeeds.
    });
}


/**
 * Helper method for accessing the rest api in our wordPress installation.
 *
 * @param url The URL of the worpress installation.
 * @param init Additional settings for the fetch init object.
 * @param errorContainer A container for error messages.
 * @param throw_429 whether we should throw upon 429 errors. If this is false the caller should retry.
 * @returns {Promise<any>}
 */
function fetchWpRest (url, init, errorContainer, throw_429=true) {
    const defaults = {
        method: 'GET',
        cache: 'no-store',
        headers: {
            'X-WP-Nonce': wpApiSettings.nonce,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }
    return fetch( url, Object.assign({}, defaults, init)).then((res)=> {
        if ( ! res.ok ) {
            throw new TypeError( 'Er is een probleem op de server.' );
        }

        // Get a possibly new nonce from the response header, store it globally.
        const nonce = res.headers.get( 'X-WP-Nonce' ) ;
        if( nonce ) wpApiSettings.nonce = nonce;

        return res.json();
    }).then((json) => {
        if ( json.mhwp_ipso_status !== 'ok' ) {
            // Upon a 429 error and if the caller can handle it, we return our JSON.
            if ( json.mhwp_ipso_code === 429 && ! throw_429) {
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
                message = 'Er gaat iets mis, probeer het later nog eens';
            }
            clearErrors(errorContainer);
            clearMessages(errorContainer);
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
 * Helper for creating Nodes from a HTML string.
 *
 * @link https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
 * @param htmlString The HTML string
 */
function createNodeFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
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
    const node = createNodeFromHTML(html);
    container.append(node);

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
    container.querySelector(`.${className}-container`) ?. remove();
}
function clearErrors(container) {
    clearNodes('error', container);
}
function clearMessages(container) {
    clearNodes('message', container);
}

/**
 * Helper for formating dates.
 *
 * @param datetime
 * @returns {string}
 */
function formatTime(datetime) {
    const timeFormat = new Intl.DateTimeFormat('nl-NL', {hour: 'numeric', minute: 'numeric'}).format;
    return timeFormat(new Date(datetime)).replace(':', '.');
}

/**
 * Helper for formating times.
 *
 * @param datetime
 * @returns {string}
 */
function formatDate(datetime) {
    const dateFormat = new Intl.DateTimeFormat(undefined, {month: 'long', day: 'numeric', weekday: 'long'}).format;
    return dateFormat(new Date(datetime)).replace(/ /g, '&nbsp;');
}

/**
 * Helper for getting an ISO8601 date string in the locale timezone.
 * @see https://stackoverflow.com/questions/10830357
 *
 * @param d
 * @returns {string}
 */
function localeISOString(d) {
   const offset = (new Date()).getTimezoneOffset() * 60000;
   return (new Date(d.valueOf() - offset)).toISOString().slice(0, -14);
}

export {
    fetchWpRest
    , wait
    , addError
    , addMessage
    , clearErrors
    , clearMessages
    , makeButtonReservation
    , createNodeFromHTML
    , formatTime
    , formatDate
    , localeISOString
};
