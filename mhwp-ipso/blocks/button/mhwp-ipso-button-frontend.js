// Todo: Buttons should go with the calendarId, not the activity id?
// No. you'll have two id's in the backend; activityID for redirection/mail; agendaId for buttons.
// That's confusing.

// Todo: Messages go in the first button on a page.
// This is not a bug.

// Todo: we can have only one button on a page, but have no way to force that. May be we can have getActivities search first.

// Todo: Buttons shouldn't throw; just display the message and remove the form.
// Todo: We need to refactor this code in the spirit of ipso-list.
// Todo: the calendarId is passed to the form as a hidden input, it should be gotten from the extended detail in submitForm?

// import '../includes/bootstrap-collapse';
// import '../includes/bootstrap-transition';

/*
 * Todo add mailData in the ipso button so we can mail with the button also.
 */
import {
    addMessage
    , addError
    , clearErrors
    , clearMessages
    , createNodeFromHTML
    , fetchWpRest
    , fetchDetail
    , fetchParticipants
    , formatDate
    , formatTime
    , localeISOString
    , makeReservation
} from "../includes/mhwp-lib";

(function () {

    // jQuery.
    const $jq = jQuery.noConflict();

    // Nr of days to fetch
    const daysToFetch = 28;

    // Nr of activities to show in the popup
    const actsToShow = 6;

    /**
     * Init globals.
     */
    function init() {
        // A rule for the jQuery validator. Dutch phone numbers have 10 digits (or 11 and start with +31).
        $jq.validator.addMethod("phoneNL", function (value, element) {
            return this.optional(element) || /^((\+|00(\s|\s?-\s?)?)31(\s|\s?-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?-\s?)?[0-9]){8}$/.test(value);
        }, "Vul een geldig telefoonnummer in.");
    }

    /**
     * Fetch and display the button.
     */
    function button() {
        const msgContainer = document.querySelector('#mhwp-ipso-button');

        fetchButton(msgContainer).then((activity) => {
            // Only display the button if we found activities with free places.
            if(activity.activityID && activity.items.length !== 0) {
                clearMessages(msgContainer);
                displayButton(activity, msgContainer);
            } else {
                addMessage('Er zijn in de aankomende periode geen activiteiten.', msgContainer);
                const button = document.querySelector('#mhwp-ipso-button-more');
                button.style.display = "none";
            }
        });
    }

    /**
     * Fetch all activities given by nrDays; filter by the activityId parameter. sort collapse.
     * @param msgContainer
     * @returns {Promise<{activityID: *, onDate: *, mentors: *, title, items: *[], extraInfo: *}>}
     */
    function fetchButton(msgContainer) {
        const id = parseInt(document.querySelector('#mhwp-ipso-button-activityid') ?. value );
        if (Number.isNaN(id)) {
            addMessage('Ongeldige knop', msgContainer);
            setTimeout(() => clearMessages(msgContainer), 4000);
            return Promise.reject();
        }

        const url = new URL( document.location.origin );
        url.pathname = "wp-json/mhwp-ipso/v1/activity";

        const from = new Date();
        url.searchParams.append('from', localeISOString(from));
        const till = from.setDate(from.getDate() + daysToFetch);
        url.searchParams.append('till', localeISOString(till));

        return fetchWpRest(url, {}, msgContainer).then(({data: as}) => {
            // sort, filter, truncate and collapse.
            as.sort((a1, a2) => new Date(a1.timeStart) - new Date(a2.timeStart));
            as = as.filter( a => a.activityID === id );

            if (as.length > actsToShow) as.length = actsToShow;
            return collapse(as);
        });
    }

    /**
     * collapse all calendar details for the activities in an array `items`.
     *
     * @param acts
     * @returns {{activityID: *, onDate: *, mentors: *, title, items: [*], extraInfo: *}}
     */
    function collapse(acts) {
        const items = acts.map( a => {
            return { calendarId: a.id, timeOpen: a.timeOpen, timeStart: a.timeStart, timeEnd: a.timeEnd };
        });
        return {
            activityID: acts[0]?.activityID,
            title: acts[0]?.title,
            extraInfo: acts[0]?.extraInfo,
            mentors: acts[0]?.mentors,
            onDate: acts[0]?.onDate,
            items
        }
    }

    /**
     * Prepare the button.
     *
     * @param activity The activity.
     * @param msgContainer The html element used for showing messages
     */
    function displayButton(activity, msgContainer) {
        const button = document.querySelector('#mhwp-ipso-button-more');
        button.addEventListener('click', readMore);

        /**
         * click handler for read more buttons.
         * Get the activities details and show them in a popup, or display a message if the activity is sold out.
         *
         * @param e The event..
         */
        async function readMore(e) {
            clearErrors(msgContainer);
            clearMessages(msgContainer);
            addMessage('Gevens ophalen, dit kan even duren', msgContainer);

            const detail = await fetchActivityDetails(activity, msgContainer);

            if (detail.items.length === 0) {
                clearMessages(msgContainer);
                addMessage('Er zijn helaas voorlopig geen vrije plaatsen.', msgContainer);
                setTimeout(() => clearMessages(msgContainer), 4000);
            } else {
                clearMessages(msgContainer);
                displayActivity(detail, msgContainer);
            }
        }

    }

    /**
     * Fetch details for the activity ID, and nrParticipants for all activities
     *
     * @param activity The activity for which we want to fetch the details.
     * @param msgContainer The html element for messages.
     * @returns {Promise<{mainImage}|*>}
     */
    async function fetchActivityDetails(activity, msgContainer) {
        const { data: detail } = await fetchDetail(activity, msgContainer);

        // For all activities, fetch the number of participants sequentially.
        const items = await activity.items.reduce((p, item) => {
            return p.then(acc => {
                return fetchParticipants(item.calendarId, msgContainer).then( r => {
                    item.places = detail.maxRegistrations === 0 ? 1000 : detail.maxRegistrations - r.data.nrParticipants;
                    return [...acc, item];
                });
            })
        }, Promise.resolve([]));

        detail.items = items.filter( i => i.places > 0);
        detail.imageUrl = detail.mainImage ? new URL(detail.mainImage) : "";
        detail.onDate = activity.onDate;

        return detail;
    }

    /**
     * Display an activity in a modal popup.
     * Use the html we got from our wp block.
     *
     * @param activity Current activity
     * @param msgElement DOM node of the card element of the activity
     */
    function displayActivity(activity, msgElement) {
        console.log(activity);
        const box = displayModalBox(activity, msgElement);

        box.querySelector('#mhwp-ipso-box-title').innerHTML = activity.title;

        box.querySelector('#mhwp-ipso-box-image').src = activity.imageUrl;

        box.querySelector('.mhwp-ipso-res-items').append(itemsCheckbox(activity.items));
    }

    /**
     * Display the modal popup.
     * Define event handlers for closing it again. Prepare the reservation form if shown.
     *
     * @param activity
     * @param msgElement
     * @returns {HTMLElement}
     */
    function displayModalBox(activity, msgElement) {
        // Add an overlay.
        const overlay = document.createElement('div')
        overlay.id = "mhwp-ipso-box-overlay";
        document.body.append(overlay);
        document.body.style.overflow = 'hidden';
        document.body.addEventListener('keydown', keyHandler)

        const box = document.getElementById('mhwp-ipso-modal-box');
        const innerBox = document.getElementById('mhwp-ipso-box-inner');

        // Event handlers.
        box.querySelector('#mhwp-ipso-box-close').addEventListener('click', closeBox);
        box.addEventListener('click', closeBoxFromOverlay);

        box.setAttribute('open', 'true')

        // If we have a form in our popup, prepare it.
        const form = box.querySelector('#mhwp-ipso-box-form');
        if(form) {
            const v = $jq(form).validate();
            if (v) v.destroy();

            function submitHandler (form, event) {
                makeReservation(activity, form, box, event).then(() => closeBox(null));
            }
            function invalidHandler () {
                // TODO: We want an error message here, this shouldn't happen though.
                console.log( 'invalid' );
            }

            $jq(form).validate({
                rules: {
                    phoneNumber: {
                        phoneNL: true,
                        "normalizer": v => v.trim()
                    }
                },
                submitHandler, invalidHandler
            })
        }

        return box;

        /**
         * Handler for the escape key.
         *
         * @param e
         */
        function keyHandler(e) {
            if (e.key === 'Escape') {
                closeBox(e);
            }
        }

        /**
         * Handler for clicks on the overlay.
         *
         * @param e
         */
        function closeBoxFromOverlay(e) {
            if(! innerBox.contains(e.target)) {
                closeBox(e);
            }
        }

        /**
         * Handler for closing the popup.
         * Remove the html we appended, remove event listeners.
         *
         * @param e
         */
        function closeBox(e) {
            clearErrors(msgElement);
            clearMessages(msgElement);
            clearErrors(box);
            clearMessages(box);

            document.body.style.overflow = 'visible';
            box.removeAttribute('open');

            document.body.removeEventListener('keydown', keyHandler);
            box.querySelector('#mhwp-ipso-box-close').removeEventListener('click', closeBox);
            box.removeEventListener('click', closeBoxFromOverlay);

            // remove item checkboxes.
            box.querySelector('.mhwp-ipso-res-items').firstElementChild.remove();
            overlay.remove();

            // The button was hidden upon reservations.
            box.querySelector('#mhwp-ipso-box-form button').style.display = 'block';

            const form = box.querySelector('form');
            if(form) form.reset();

            if(e) e.stopImmediatePropagation();
        }
    }

    /**
     * Generate html for the choose time checkbox, or a hidden input if there is only one time available.
     *
     * @param items
     * @returns {ChildNode}
     */
    function itemsCheckbox(items) {
        items = items.map( (item, idx) => {
            const date = formatDate(new Date(item.timeStart));
            const time = formatTime(new Date(item.timeStart));
            return `<span><input class="mhwp-ipso-res-itemchoice" type="radio" id="mhwp-ipso-res-item-${idx}" 
                            name="calendarId" value="${item.calendarId}"/>` +
                `<label class="mhwp-ipso-res-itemlabel" for="mhwp-ipso-res-item-${idx}">${date}&nbsp;${time}</label></span>`;
        });

        items[0] = items[0].replace('type="radio"', 'type="radio" checked');
        items = `<div><div id="mhwp-ipso-res-itemslabel">Kies je tijd</div>${items.join("")}</div>`;
        return createNodeFromHTML(items);
    }

    // Run init and the button on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => { init(); button();});
})();
