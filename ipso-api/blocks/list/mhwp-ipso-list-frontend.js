import './bootstrap-collapse';

// TODO: Use the production URL.
const marikenhuisURL ="http://localhost:8080/";

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
                    if ( json['mhwp_ipso_status'] !== 'ok' ) {
                        const message = json['mhwp_ipso_msg'] ? json['mhwp_ipso_msg'] : '';
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
        console.log("response", res);
        if ( ! res.ok ) {
            const message = res['message'] ? res['message'] : '';
            throw new TypeError( message );
        }
        return res.json();
    }).then( (json) => {
        console.log("json", json);
        if ( json['mhwp_ipso_status'] !== 'ok' ) {
            const message = json['mhwp_ipso_msg'] ? json['mhwp_ipso_msg'] : '';
            throw new TypeError( message );
        }

        // remove the mhwp_ipso_status. leaving only calendar objects.
        delete json['mhwp_ipso_status'];
        addActivities(json, container);

        return json;
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

function addActivities(activities, container) {
    let light_dark = 'light';
    let cnt = 0;

    for (let key in Object.keys(activities)) {
       let activity = activities[key];

       light_dark = light_dark === 'light' ? 'dark' : 'light';
       cnt++;

       const html = `
           <li class="activity list-group-item list-group-item-${light_dark }">
            <div class="row lead">
                <div class="col-md-8">
                    <span>Datum: </span><span>${activity.onDate}</span>
                    <span>Title: </span><span>${activity.title}</span>
                </div>
                <div class="col-md-4">
                    <button class="pull-right btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseExample_${cnt}" aria-expanded="false" aria-controls="collapseExample">
                        Lees meer
                    </button>
                    <button class="pull-right btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseReserveer_${cnt}" aria-expanded="false" aria-controls="collapseReserveer">
                        Reserveer
                    </button>
                </div>
            </div>
            
            <div class="collapse reserveer" id="collapseReserveer_${cnt}">
                <form class="form-horizontal">
                    <input type="hidden" name="activityCalendarId" value="${activity.id}">
                        <div class="form-group">
                            <fieldset class="col-md-4">
                                <label for="mhwp_ipso_voornaam_${cnt}">Voornaam</label>
                                <span class="required">*</span>
                                <input type="text" class="form-control" id="mhwp_ipso_voornaam_${cnt}" name="firstName" required placeholder="">
                            </fieldset>
                            <fieldset class="col-md-4">
                                <label for="mhwp_ipso_tussenvoegsel_${cnt}">Tussenvoegsel</label>
                                <input type="text" class="form-control" id="mhwp_ipso_tussenvoegsel_${cnt}" name="lastNamePrefix" placeholder="">
                            </fieldset>
                            <fieldset class="col-md-4">
                                <label for="mhwp_ipso_achternaam_${cnt}">Achternaam</label>
                                <span class="required">*</span>
                                <input type="text" class="form-control" id="mhwp_ipso_achternaam_${cnt}" name="lastName" required placeholder="">
                            </fieldset>
                        </div>
                        <div class="form-group">
                            <fieldset class="col-md-4">
                                <label for="mhwp_ipso_telefoon_${cnt}">Telefoonnummer</label>
                                <input type="tel" class="form-control" id="mhwp_ipso_telefoon_${cnt}" name="phoneNumber" placeholder="">
                                    <span class="validity"></span>
                            </fieldset>
                            <fieldset class="col-md-4">
                                <label for="mhwp_ipso_email_${cnt}">Emailadres</label>
                                <span class="required">*</span>
                                <input type="email" class="form-control" id="mhwp_ipso_email_${cnt}" name="email" required placeholder="">
                                    <span class="validity"></span>
                            </fieldset>
                            <div class="col-md-4">
                                <button type="submit" class="pull-right right btn btn-default">Reserveer</button>
                            </div>
                        </div>
                </form>
            </div>
        </li>`;

        const node = $(html);
        $(container).append(node);
    }

    prepareReservations();
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

function domLoaded(fn) {
    if(document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn ,1);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}
domLoaded(getActivities);
