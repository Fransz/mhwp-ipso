const $jq = jQuery.noConflict();

/**
 * Make a reservation by accessing our API.
 * Submit callback for the validator api
 *
 * @param form The form  that is submitted.
 * @param event The submit event.
 * @returns {Promise<void>}
 */
async function makeReservation(form, event) {
    event.preventDefault();

    // The URL for making the reservation
    const marikenhuisURL = document.location.origin;
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
        url, fetchInit, container
    ).then(() => {
        // TODO: if ! 200 addError
        addMessage('Er is een plaats voor u gereserveerd; U ontvangt een email', container)
        setTimeout(() => {
            clearMessages(container);
            $jq('button', form).prop('disabled', false);
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
    const node = $jq(html);
    $jq(container).append(node);

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
    $jq(`.${className}-container`, container).remove();
}
function clearErrors(container) {
    clearNodes('error', container);
}
function clearMessages(container) {
    clearNodes('message', container);
}

export {fetchWpRest, wait, addError, addMessage, clearErrors, clearMessages, makeReservation};
