const $jq = jQuery.noConflict();

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

/**
 * Helper method for accessing the rest api in our wordPress installation.
 *  TODO we can drop nonce here.
 *
 * @param url The URL of the worpress installation.
 * @param init Additional settings for the fetch init object.
 * @param nonce
 * @param errorContainer A container for error messages.
 * @param throw_429 whether we should throw upon 429 errors. If this is false the caller should retry.
 * @returns {Promise<any>}
 */
function fetchWpRest (url, init, nonce, errorContainer, throw_429=true) {
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
                message = 'Er gaat iets is, probeer het later nog eens';
            }
            addError(message, errorContainer);

            // retrow the error. Users of this call decide what should happen.
            throw(err);
        }
    )
}


export {addError, addMessage, clearErrors, clearMessages, fetchWpRest}
