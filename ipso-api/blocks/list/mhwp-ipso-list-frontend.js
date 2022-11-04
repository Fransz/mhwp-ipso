jQuery.noConflict();

function makeReservation() {
    // TODO We want this from wp localizeScript, taking MHWP_IPSO__DEV_MODE into account.
    const url = new URL( "http://marikenhuis.localhost:8080/" );
    url.pathname = "wp-json/mhwp-ipso/v1/reservation";

    /**
     * Dutch phone numbers have 10 digits (or 11 and start with +31).
     */
    $.validator.addMethod( "phoneNL", function( value, element ) {
        return this.optional( element ) || /^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9]){8}$/.test( value );
    }, "Vul een geldig telefoonnummer in." );

    const forms = jQuery('form', '.mhwp-ipso-activities-list');
    forms.each( (_, f) => {
        $( f ).validate({
            // We only use one explicit validation rule. others are extracted from the HTML attributes
            rules: {
                phoneNumber: {
                    phoneNL: true,
                    normalizer: v => $.trim( v )
                }
            },
            submitHandler: function ( form ) {
                const activityCalendarId = $('input[name="activityCalendarId"]', form).val();
                const firstName = $('input[name="firstName"]', form).val();
                const lastNamePrefix = $('input[name="lastNamePrefix"]', form).val();
                const lastName = $('input[name="lastName"]', form).val();
                const email = $('input[name="email"]', form).val();
                let phoneNumber = $('input[name="phoneNumber"]', form).val();
                phoneNumber = phoneNumber === "" ? null : phoneNumber;
                const data = { activityCalendarId, firstName, lastNamePrefix, lastName, email, phoneNumber };

                fetch( url, {
                    method: 'POST',
                    body: JSON.stringify( data ),
                    cache: 'no-store',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }).then( ( res  )=> {
                    console.log(res);
                    if ( ! res.ok ) {
                        const message = res['message'] ? res['message'] : '';
                        throw new TypeError( message );
                    }
                    return res.json();
                }).then( (json) => {
                    console.log(json);
                    if ( json['mhwp_ipso_status'] !== 'ok' ) {
                        const message = json['mhwp-ipso-message'] ? json['mhwp-ipso-message'] : '';
                        throw new TypeError( message );
                    }
                    return json;
                }).catch( (err) => {
                        let message = 'Er gaat iets is, probeer het later nog eens';
                        if (err instanceof TypeError) {
                            message = err.message;
                        }
                        console.log(message);
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
    // TODO: Use the production URL.
    const url = new URL( "http://localhost:8080/" );
    url.pathname = "wp-json/mhwp-ipso/v1/activity";
    url.searchParams.append('nrDays', '7');

    // Get the nonce.
    const node = document.getElementById('mhwp-ipso-list-nonce');
    const nonce = node ?. value;

    fetch( url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'HTTP_X_WP_NONCE': nonce,
        }
    }).then( ( res  )=> {
        console.log(res);
        if ( ! res.ok ) {
            const message = res['message'] ? res['message'] : '';
            throw new TypeError( message );
        }
        return res.json();
    }).then( (json) => {
        console.log(json);
        if ( json['mhwp_ipso_status'] !== 'ok' ) {
            const message = json['mhwp-ipso-message'] ? json['mhwp-ipso-message'] : '';
            throw new TypeError( message );
        }
        return json;
    }).catch( (err) => {
            let message = 'Er gaat iets is, probeer het later nog eens';
            if (err instanceof TypeError) {
                message = err.message;
            }
            console.log(message);
        }
    )
}

function domLoaded(fn) {
    if(document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn ,1);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}
domLoaded(getActivities);
