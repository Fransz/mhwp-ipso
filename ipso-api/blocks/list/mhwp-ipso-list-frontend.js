import './bootstrap-collapse';

import template from './mhwp-ipso-list-template';

// TODO: Use the production URL.
const marikenhuisURL ="http://localhost:8080/";

// TODO: This has to be test or live.
const ipsoURL = "https://api.test.ipso.community/";

function prepareReservations() {
    const url = new URL( marikenhuisURL );
    url.pathname = "wp-json/mhwp-ipso/v1/reservation";

    /**
     * Dutch phone numbers have 10 digits (or 11 and start with +31).
     */
    $.validator.addMethod( "phoneNL", function( value, element ) {
        return this.optional( element ) || /^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9]){8}$/.test( value );
    }, "Vul een geldig telefoonnummer in." );

    const forms = $('form', '#mhwp-ipso-list-container');
    forms.each( (_, f) => {
        $( f ).validate({
            // We only use one explicit validation rule. others are extracted from the HTML attributes
            rules: {
                phoneNumber: {
                    phoneNL: true,
                    normalizer: v => $.trim( v )
                }
            },
            submitHandler: function ( form, event ) {
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

                fetch( url, {
                    method: 'POST',
                    body: JSON.stringify( data ),
                    cache: 'no-store',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }).then( ( res  )=> {
                    if ( ! res.ok ) {
                        const message = res['message'] ? res['message'] : '';
                        throw new TypeError( message );
                    }
                    return res.json();
                }).then( (json) => {
                    if ( json.mhwp_ipso_status !== 'ok' ) {
                        const message = json.mhwp_ipso_msg ? json.mhwp_ipso_msg : '';
                        throw new TypeError( message );
                    }
                    addMessage('Er is een plaats voor u gereserveerd; U ontvangt een email', container);
                }).catch( (err) => {
                        let message = '';
                        if (err instanceof TypeError) {
                            message = err.message;
                        }
                        if ('' === message) {
                            message = 'Er gaat iets is, probeer het later nog eens';
                        }
                        addError(message, container);
                    }
                )
            },
            invalidHandler: function ( form ) {
                console.log( 'invalid' );
            }
        });
    });
}

function getActivities() {
    const url = new URL( marikenhuisURL );
    url.pathname = "wp-json/mhwp-ipso/v1/activity";
    url.searchParams.append('nr_days', '7');

    // Get the nonce.
    const node = document.getElementById('mhwp-ipso-list-nonce');
    const nonce = node ?. value;

    // Get the container
    const container = document.getElementById('mhwp-ipso-list-container');

    clearErrors(container);
    clearMessages(container);
    fetch( url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'HTTP_X_WP_NONCE': nonce,
        }
    }).then( ( res  )=> {
        if ( ! res.ok ) {
            const message = res['message'] ? res['message'] : '';
            throw new TypeError( message );
        }
        return res.json();
    }).then( (json) => {
        if ( json.mhwp_ipso_status !== 'ok' ) {
            const message = json.mhwp_ipso_msg ? json.mhwp_ipso_msg : '';
            throw new TypeError( message );
        }

    //     let activity = json.data[0];
    //     return getActivityDetail(activity.activityID, container);
    //
    // }).then((json) => {
    //    console.log(json);
        addActivities(json.data, container);

    }).catch( (err) => {
            let message = '';
            if (err instanceof TypeError) {
                message = err.message;
            }
            if ('' === message) {
                message = 'Er gaat iets is, probeer het later nog eens';
            }
            addError(message, container);
        }
    )
}

async function addActivities(activities, container) {
    let light_dark = 'light';
    let cnt = 0;

    for (let key in Object.keys(activities)) {
       let activity = activities[key];
       let activityDetail = await wait(400).then(() => getActivityDetail(activity.activityID, container));

       activity.date = activity.onDate.replace(/T\d\d:\d\d:\d\d/, '');
       activity.time = activity.onDate.replace(/\d{4}-\d{2}-\d{2}T/, '');

       if(activityDetail) {
           const imageUrl = new URL(activityDetail.data.mainImage, ipsoURL);
           activity.img = `<img src="${imageUrl}" alt="${activity.title}" />`

       }
       light_dark = light_dark === 'light' ? 'dark' : 'light';
       cnt++;

       const html = template(activity, cnt, light_dark);
       const node = $(html);
       $(container).append(node);
    }

    prepareReservations();
}

function getActivityDetail(activityId, container) {
    const url = new URL( marikenhuisURL );
    url.pathname = `wp-json/mhwp-ipso/v1/activity/${activityId}`;

    return fetch( url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
            'Accept': 'application/json',
        }
    }).then( ( res  )=> {
        if ( ! res.ok ) {
            const message = res['message'] ? res['message'] : '';
            throw new TypeError( message );
        }
        return res.json();
    }).then( (json) => {
        if ( json.mhwp_ipso_status !== 'ok' ) {
            if (json.mhwp_ipso_code === 429) {
                console.log('Too many requests (429)');
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
            addError(message, container);
        }
    )
}

function wait(duration) {
    return new Promise((resolve, reject) => {
        if(duration < 0) reject( new Error("Cannot wait negative time"));
        setTimeout(resolve, duration);
    })
}

function addNode( message, className, container) {
    const html = `<div class="${className}"><h3 class="message">${message}</h3></div>`;
    const node = $(html);
    $(container).append(node);

}
function addError( message, container ) {
    addNode( message, 'error', container);
}
function addMessage( message, container ) {
    addNode( message, 'message', container);
}

function clearNodes(className, container) {
    const nodes = $(`.${className}`, container);
    nodes.each(((n) => n.remove()));
}
function clearErrors(container) {
    clearNodes('error', container);
}
function clearMessages(container) {
    clearNodes('message', container);
}

$(document).ready(getActivities);
