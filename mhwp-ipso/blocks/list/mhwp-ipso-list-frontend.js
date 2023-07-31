/**
 * Todo: the calendarId is passed to the form as a hidden input, it should be gotten from the extended detail in submitForm?
 * Todo drop the globals; back to parameters.
 * Todo We add the activity id to the form as a hidden field; The function should get it from the activity?
 * Todo week buttons 5 sec buiten gebruik.
 * Todo classname mhwp-ipso-reservation-button;
 * Todo detail template;
 * Todo ticket bij IPSO over filters;
 */
import {
    fetchWpRest
    , wait
    , addMessage
    , clearErrors
    , clearMessages
    , createNodeFromHTML
    , formatDate
    , formatTime
    , localeISOString
} from "../includes/mhwp-lib";

(function () {
    /**
     * Globales.
     */
    // jQuery.
    const $jq = jQuery.noConflict();

    // An alias for our origin.
    const marikenhuisURL = document.location.origin;

    // Current date; set by the next/prev week buttons.
    let currentDay;

    const state = {
        activities: [],
        firstDay: new Date(),
        lastDay: new Date(),
        firstFetched: null,
        lastFetched: null
    }

    /**
     * init globals, attach event handlers.
     */
    function init() {
        // A rule for the jQuery validator. Dutch phone numbers have 10 digits (or 11 and start with +31).
        $jq.validator.addMethod( "phoneNL", function( value, element ) {
            return this.optional( element ) || /^((\+|00(\s|\s?-\s?)?)31(\s|\s?-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?-\s?)?[0-9]){8}$/.test( value );
        }, "Vul een geldig telefoonnummer in." );

        // Initialize the week picker.
        document.querySelectorAll('.mhwp-ipso-week-previous').forEach( btn => {
            // btn.addEventListener('click', () =>  handleWeekChange(-7, 28))
            btn.addEventListener('click', () =>  calendar(-7))
        });

        document.querySelectorAll('.mhwp-ipso-week-next').forEach( btn => {
            // btn.addEventListener('click', (_) => handleWeekChange(7, 28))
            btn.addEventListener('click', () =>  calendar(7))
        });

        state.firstDay = new Date();
        state.lastDay = new Date()
        state.lastDay.setDate(state.lastDay.getDate() + 28 - 1);

        state.firstFetched = new Date(state.firstDay);
        state.lastFetched = new Date(state.firstFetched);
        state.lastFetched.setDate(state.lastFetched.getDate() - 1);

        currentDay = new Date();
    }

    /**
     * Handle clicks on the next/previous week button
     */
    function handleWeekChange(shiftDays, nrDays) {
        // Copy day; add; calculate week; display; save.
        let firstDay = new Date(currentDay);
        firstDay.setDate(firstDay.getDate() + shiftDays);

        const toDay = new Date();
        if(firstDay.setHours(0, 0, 0, 0) < toDay.setHours(0, 0, 0, 0)) {
            // We try to go back in time we do not allow that.
            firstDay = toDay;
        }

        const lastDay = new Date(firstDay);
        lastDay.setDate(lastDay.getDate() + nrDays);

        document.querySelector('#mhwp-ipso-week-current').innerHTML = `${formatDate(firstDay)} - ${formatDate(lastDay)}`;

        // Set our global
        currentDay = new Date(firstDay);

        // calendar(state, 7);
        main(firstDay, nrDays);
    }

    async function calendar(shiftDays) {
        const monthContainer = document.querySelector('#mhwp-ipso-month-container');

        state.firstDay.setDate(state.firstDay.getDate() + shiftDays);
        state.lastDay.setDate(state.lastDay.getDate() + shiftDays);

        await fetchCalendar(shiftDays, monthContainer).then(() => {
            return displayCalendar(monthContainer);
        });
    }

    async function fetchCalendar(shiftDays, errContainer) {
        if (state.firstDay < state.firstFetched) {
            const from = new Date(state.firstDay);
            const till = new Date(state.firstFetched)
            till.setDate(state.firstFetched.getDate() - 1);

            state.firstFetched = from;

            const fetched = await fetchActivities2(from, till, errContainer).then(json => {
                const acts = collapseActivities(json.data);
                acts.sort((a1, a2) => new Date(a1.items[0].timeStart) - new Date(a2.items[0].timeStart));

                return acts
            });

            state.activities.unshift(...fetched);
        }
        if (state.lastDay > state.lastFetched) {
            const till = new Date(state.lastDay);
            const from = new Date(state.lastFetched);
            from.setDate(state.lastFetched.getDate() + 1);

            state.lastFetched = till;

            const fetched = await fetchActivities2(from, till, errContainer).then(json => {
                const acts = collapseActivities(json.data);
                acts.sort((a1, a2) => new Date(a1.items[0].timeStart) - new Date(a2.items[0].timeStart));

                return acts
            });

            state.activities.push(...fetched);
        }
    }

    function displayCalendar(container) {
        displayActivities(state.activities, container);
        return;

        const template = document.getElementById('mhwp-ipso-month-card').content.firstElementChild;



        activities.forEach( activity => {
            const element = template.cloneNode(true);

            const date = formatDate(new Date(activity.onDate));
            const times = activity.items.map( i => formatTime(new Date(i.timeStart))).join(',&nbsp;');

            element.querySelector('.mhwp-ipso-card-title').innerHTML = activity.title;
            element.querySelector('.mhwp-ipso-card-date').innerHTML = date;
            element.querySelector('.mhwp-ipso-card-time').innerHTML = times;

            element.querySelector('.mhwp-ipso-card-more').addEventListener('click', readMore);
            listContainer.append(element);

            /**
             * click handler for read more buttons.
             * Get the activities details and show them in a popup, or display a message if the activity is sold out.
             */
            async function readMore(e) {
                clearErrors(element);
                clearMessages(element);
                addMessage('Gevens ophalen, dit kan even duren', element);

                const detail = await processActivity(activity, element);

                if (detail.items.length === 0) {
                    clearMessages(element);
                    addMessage('De activiteit is vol, u kunt niet meer reserveren.', element);
                    setTimeout(() => clearMessages(element), 5000);
                } else {
                    displayActivity(detail, element);
                }
            }
        });
    }

    /**
     * Top level function.
     *
     * @returns {void}
     */
    async function main (date, nrDays) {
        const monthContainer = document.querySelector('#mhwp-ipso-month-container');
        const items = Array.from(monthContainer.querySelectorAll('li'));
        items.map((n) => n.remove());

        const msgContainer = document.querySelector('#mhwp-ipso-message-top');
        addMessage('Gegevens ophalen, dit kan even duren', msgContainer);

        // Get all activities, collapse, sort and display.
        await fetchActivities(date, nrDays, monthContainer).then(json => {
            const acts = collapseActivities(json.data);
            acts.sort((a1, a2) => new Date(a1.items[0].timeStart) - new Date(a2.items[0].timeStart));

            // Show each activity, add an event handler for showing details on each.
            displayActivities(acts, monthContainer);
        });

        return clearMessages(msgContainer);
    }

    /**
     * Fetch activities.
     *
     * @param d startDate.
     * @param nr number of days.
     * @param msgContainer container for messages.
     * @returns Object The json representation of the activities.
     */
    async function fetchActivities(d, nr, msgContainer) {
        const url = new URL( marikenhuisURL );
        url.pathname = "wp-json/mhwp-ipso/v1/activity";

        const from = localeISOString(d);
        url.searchParams.append('from', from);

        d.setDate(d.getDate() + nr - 1);
        const till = localeISOString(d);
        url.searchParams.append('till', till);

        clearErrors(msgContainer);
        clearMessages(msgContainer);
        return await fetchWpRest(url, {}, msgContainer);
    }

    async function fetchActivities2(from, till, msgContainer) {
        const url = new URL( marikenhuisURL );
        url.pathname = "wp-json/mhwp-ipso/v1/activity";

        url.searchParams.append('from', localeISOString(from));

        url.searchParams.append('till', localeISOString(till));

        clearErrors(msgContainer);
        clearMessages(msgContainer);
        return await fetchWpRest(url, {}, msgContainer);
    }

    /**
     * Collapse the same activities on the same day.
     * Create an object with all activityIds as key and as value: an object with all dates for that activity as key
     * and as value: an array of all those activities on that day.
     * Then collect all activities into a single array again.
     *
     * @param activities
     * @returns {{activityID: *, onDate: *, mentors: *, title: *, items: [], extraInfo: *}[]}
     */
    function collapseActivities (activities) {
        let groups = activities.reduce( groupById, {} );
        Object.keys(groups).forEach( k => groups[k] = groups[k].reduce( groupByDate, {} ));

        return Object.keys(groups).flatMap( ak => Object.keys(groups[ak]).map( dk => collect(groups[ak][dk])));

        function groupById(acc, cur) {
            return groupBy(cur.activityID, acc, cur);
        }
        function groupByDate(acc,cur) {
            return groupBy(cur.onDate, acc, cur);
        }
        function groupBy (key, acc, cur) {
            const grp = acc[key] ?? [];
            return { ...acc, [key]: [...grp, cur]}
        }

        function collect(acts) {
            // Sort all same activities on the same day.
            acts.sort((a1, a2) => new Date(a1.timeStart) - new Date(a2.timeStart));

            const items = acts.map( a => {
                return { calendarId: a.id, timeOpen: a.timeOpen, timeStart: a.timeStart, timeEnd: a.timeEnd };
            });
            return {
                activityID: acts[0].activityID,
                title: acts[0].title,
                extraInfo: acts[0].extraInfo,
                mentors: acts[0].mentors,
                onDate: acts[0].onDate,
                items
            }
        }
    }

    /**
     * For all activities display a card.
     * Add an event handler for viewing the activities details to each card's button.
     *
     * @param activities All activitues.
     * @param listContainer Where to add the activity element.
     */
    function displayActivities (activities, listContainer) {
        const template = document.getElementById('mhwp-ipso-month-card').content.firstElementChild;

        activities.forEach( activity => {
            const element = template.cloneNode(true);

            const date = formatDate(new Date(activity.onDate));
            const times = activity.items.map( i => formatTime(new Date(i.timeStart))).join(',&nbsp;');

            element.querySelector('.mhwp-ipso-card-title').innerHTML = activity.title;
            element.querySelector('.mhwp-ipso-card-date').innerHTML = date;
            element.querySelector('.mhwp-ipso-card-time').innerHTML = times;

            element.querySelector('.mhwp-ipso-card-more').addEventListener('click', readMore);
            listContainer.append(element);

            /**
             * click handler for read more buttons.
             * Get the activities details and show them in a popup, or display a message if the activity is sold out.
             */
            async function readMore(e) {
                clearErrors(element);
                clearMessages(element);
                addMessage('Gevens ophalen, dit kan even duren', element);

                const detail = await processActivity(activity, element);

                if (detail.items.length === 0) {
                    clearMessages(element);
                    addMessage('De activiteit is vol, u kunt niet meer reserveren.', element);
                    setTimeout(() => clearMessages(element), 5000);
                } else {
                    displayActivity(detail, element);
                }
            }
        });
    }

    /**
     * Fetch the details for an activity, filter all of its items on places available.
     *
     * @param activity
     * @param msgContainer
     * @returns {Promise<{detail}>} All information for an activity.
     */
    async function processActivity (activity, msgContainer) {
        const { data: detail } = await fetchDetail(activity, msgContainer);

        // For all items, fetch the number of participants sequentially.
        const items = await activity.items.reduce((p, item) => {
            return p.then(acc => {
                return fetchParticipants(item.calendarId, msgContainer).then( r => {
                    item.places = detail.maxRegistrations === 0 ? 1000 : detail.maxRegistrations - r.data.nrParticipants;
                    return [ ...acc, item];
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
     * @param cardElement DOM node of the card element of the activity
     */
    function displayActivity(activity, cardElement) {
        const box = displayModalBox(activity, cardElement);

        box.querySelector('#mhwp-ipso-box-title').innerHTML = activity.title;

        box.querySelector('#mhwp-ipso-box-date').innerHTML = formatDate(activity.onDate);
        box.querySelector('#mhwp-ipso-box-items').innerHTML = '&nbsp;' + activity.items.map(i => formatTime(i.timeStart)).join('&comma;&nbsp;');

        box.querySelector('#mhwp-ipso-box-intro').innerHTML = activity.intro;
        box.querySelector('#mhwp-ipso-box-image').src = activity.imageUrl;

        box.querySelector('#mhwp-ipso-box-description').innerHTML = activity.description;

        box.querySelector('.mhwp-ipso-res-items').append(itemsCheckbox(activity.items));
    }

    /**
     * Display the modal popup.
     * Define event handlers for closing it again. Prepare the reservation form if shown.
     *
     * @param activity
     * @param cardElement
     * @returns {HTMLElement}
     */
    function displayModalBox(activity, cardElement) {
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

        // A different reservation button? The form?
        if(! activity.reservationUrl) {
            box.querySelector('#mhwp-ipso-box-directbutton').style.display = 'none';
        } else {
            box.querySelector('#mhwp-ipso-box-formcolumn').style.display = 'none';

            const button = box.querySelector('#mhwp-ipso-box-directbutton button');
            button.addEventListener('click', redirectReservation);

            if(activity.disableReservation) {
                box.querySelector('#mhwp-ipso-box-directbutton').style.display = 'none';
            }
        }

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
            clearErrors(cardElement);
            clearMessages(cardElement);
            clearErrors(box);
            clearMessages(box);

            document.body.style.overflow = 'visible';
            box.removeAttribute('open');

            document.body.removeEventListener('keydown', keyHandler);
            box.querySelector('#mhwp-ipso-box-close').removeEventListener('click', closeBox);
            box.removeEventListener('click', closeBoxFromOverlay);

            box.querySelector('.mhwp-ipso-res-items').firstElementChild.remove();
            overlay.remove();

            const form = box.querySelector('form');
            if(form) form.reset();

            box.querySelector('#mhwp-ipso-box-formcolumn').style.display = 'block';
            box.querySelector('#mhwp-ipso-box-directbutton').style.display = 'block';
            box.querySelector('#mhwp-ipso-box-form button').disabled = false;

            const button = box.querySelector('#mhwp-ipso-box-directbutton button')
            button.removeEventListener('click', redirectReservation);

            if(e) e.stopImmediatePropagation();
        }

        /**
         * Handler for clicking on a reservation button with a redirect.
         * @param e
         */
        function redirectReservation(e) {
            window.location = activity.reservationUrl;
        }
    }

    /**
     * Generate html for the choose time checkbox, or a hidden input if there is only one time available.
     *
     * @param items
     * @returns {ChildNode}
     */
    function itemsCheckbox(items) {
        if (items.length === 1) {
            items = `<input type="hidden" id="mhwp-ipso-res-item" name="calendarId" value="${items[0].calendarId}" />`;
        } else if (items.length > 1) {
            items = items.map( (item, idx) => {
                const time = formatTime(new Date(item.timeStart));
                return `<span><input class="mhwp-ipso-res-itemchoice" type="radio" id="mhwp-ipso-res-item-${idx}" 
                            name="calendarId" value="${item.calendarId}"/>` +
                    `<label class="mhwp-ipso-res-itemlabel" for="mhwp-ipso-res-item-${idx}">${time}</label></span>`;
            });

            items[0] = items[0].replace('type="radio"', 'type="radio" checked');
            items = `<div><div id="mhwp-ipso-res-itemslabel">Kies je tijd</div>${items.join("")}</div>`;
        }
        return createNodeFromHTML(items);
    }

    /**
     * Make a request for the details of an activity, and again if necessary.
     *
     * @param activity The activity for which to fetch the detail
     * @param msgContainer The parent for messages.
     * @returns {Promise<any>}
     */
    async function fetchDetail(activity, msgContainer) {
        const url = new URL( marikenhuisURL );
        url.pathname = 'wp-json/mhwp-ipso/v1/activitydetail';
        url.searchParams.append('activityId', activity.activityID);
        url.searchParams.append('calendarId', activity.id);

        return fetchWpRest(url, {}, msgContainer, false).then((json) => {
            // Upon a 429 error (Too many requests), We try again.
            if ( json.mhwp_ipso_code === 429) {
                console.log('Error 429, retrying');
                return wait(1000).then(() => {
                    return fetchWpRest(url, {}, msgContainer, true);
                });
            }
            return json;
        });
    }

    /**
     * Make the request for the nr of participants, and again if necessary.
     *
     * @param calendarId The calendarId of the activity.
     * @param msgContainer The parent for messages.
     * @returns {Promise<any>}
     */
    function fetchParticipants(calendarId, msgContainer) {
        const url = new URL( marikenhuisURL );
        url.pathname = 'wp-json/mhwp-ipso/v1/participants';
        url.searchParams.append('calendarId', calendarId);

        return fetchWpRest(url, {}, msgContainer, false).then((json) => {
            // Upon a 429 error (Too many requests), We try again.
            if ( json.mhwp_ipso_code === 429) {
                console.log('Error 429, retrying');
                return wait(1000).then(() => {
                    return fetchWpRest(url, {}, msgContainer, true);
                });
            }
            return json;
        });
    }

    /**
     * Make a reservation by accessing our API with the correct parameters.
     * After the request we return a promise that gets resolved after 5 seconds.
     *
     * @param activity The activity.
     * @param form The form  that is submitted.
     * @param box The modal box whitch contains the form.
     * @param event The submit event.
     * @returns {Promise<void>}
     */
    async function makeReservation(activity, form, box, event) {
        event.preventDefault();

        // The URL for making the reservation
        const marikenhuisURL = document.location.origin;
        const url = new URL( marikenhuisURL );
        url.pathname = "wp-json/mhwp-ipso/v1/reservation";

        const msgContainer = box.querySelector('#mhwp-ipso-box-messagerow');

        // Get the item corresponding to the hidden input or selected radiobutton.
        let calendarId;
        if(form.querySelector('#mhwp-ipso-res-item')) {
           calendarId = parseInt(form.querySelector('#mhwp-ipso-res-item').value);
        } else {
            calendarId = parseInt(form.querySelector('input[name="calendarId"]:checked').value);
        }
        const item = activity.items.filter(item => item.calendarId === calendarId)[0];

        const activityCalendarId = item.calendarId.toString();
        const firstName = form.querySelector('input[name="firstName"]').value;
        const lastNamePrefix = form.querySelector('input[name="lastNamePrefix"]').value;
        const lastName = form.querySelector('input[name="lastName"]').value;
        const email = form.querySelector('input[name="email"]').value;
        let phoneNumber = form.querySelector('input[name="phoneNumber"]').value;
        phoneNumber = phoneNumber === "" ? null : phoneNumber;

        const activityId = activity.id;
        const activityTitle = activity.title;
        const activityDate = formatDate(activity.onDate);
        const activityTime = formatTime(item.timeStart);

        // Data for our endpoint.
        // activityId, activityTime, activitydate and activityTitle are used for mail.
        const data = {
            activityCalendarId, firstName, lastNamePrefix, lastName, email, phoneNumber,
            activityId, activityTitle, activityDate, activityTime
        };

        const fetchInit = {
            method: 'POST',
            body: JSON.stringify( data )
        }
        await fetchWpRest(
            url, fetchInit, msgContainer
        ).then(() => {
            addMessage('Er is een plaats voor u gereserveerd; U ontvangt een email', msgContainer)
            form.querySelector('button').disabled = true;

            // Return a promise that returns resolved after 5 seconds.
            return new Promise((resolve, _) => setTimeout(() => resolve(null), 5000))
        }).catch((_) => {
            // An exception occured, we already have shown the error.
            form.querySelector('button').disabled = true;

            return new Promise((resolve, _) => setTimeout(() => resolve(null), 5000))
        });
    }

    // Run init and handleWeekChange on DOMContentLoaded
    // document.addEventListener('DOMContentLoaded', () => { init(); handleWeekChange(0, 28);});
    document.addEventListener('DOMContentLoaded', () => { init(); calendar(0);});
})();
