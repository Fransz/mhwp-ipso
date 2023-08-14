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

    const state = {
        activities: [],
        firstDay: new Date(),
        lastDay: new Date(),
        firstFetched: null,
        lastFetched: null
        // For now we dont have filters.
        // filters: [],
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
            btn.addEventListener('click', () =>  calendar(-7))
        });

        document.querySelectorAll('.mhwp-ipso-week-next').forEach( btn => {
            btn.addEventListener('click', () =>  calendar(7))
        });

        // initialize the filter checkboxes.
        // For now, we don't have filtering.
        // document.querySelectorAll('.mhwp-ipso-filter-checkbox').forEach( cb => {
        //     cb.addEventListener('click', changeStateFilters );
        // });


        // Initialize state such that calender(0) shows 28 days, starting today.
        state.firstDay = new Date();
        state.firstDay.setHours(0, 0, 0, 0);

        state.lastDay = new Date(state.firstDay);
        state.lastDay.setHours(0, 0, 0, 0);
        state.lastDay.setDate(state.lastDay.getDate() + 28 - 1);

        state.firstFetched = new Date(state.firstDay);
        state.firstFetched.setHours(0, 0, 0, 0);

        state.lastFetched = new Date(state.firstFetched);
        state.lastFetched.setHours(0, 0, 0, 0);
        state.lastFetched.setDate(state.lastFetched.getDate() - 1);
    }

    /**
     * Event handler for the filter checkboxes.
     * Add or delete a filter string, all lowercase, only [a-zA-Z0-9_]
     *
     * @param e the event.
     * @return void
     */
    function changeStateFilters(e) {
        const f = e.currentTarget.value.toLowerCase().replaceAll(/\W/g, '');
        const idx = state.filters.indexOf(f);
        if (idx === -1) {
            state.filters.push(f);
        } else {
            state.filters.splice(idx, 1);
        }
        calendar(0);
    }

    /**
     * Fetch and display the calendar, adjusting the state with shift days.
     *
     * @param shiftDays
     */
    function calendar(shiftDays) {
        const monthContainer = document.querySelector('#mhwp-ipso-month-container');

        const prevFirstDay = new Date(state.firstDay);

        state.firstDay.setDate(state.firstDay.getDate() + shiftDays);
        state.lastDay.setDate(state.lastDay.getDate() + shiftDays);

        const toDay = new Date();
        toDay.setHours(0,0,0,0);

        // We tried to browse into the past, reset first and lastDay
        if(state.firstDay < toDay) {
            state.firstDay = toDay;

            state.lastDay = new Date(toDay);
            state.lastDay.setHours(0, 0, 0, 0);
            state.lastDay.setDate(state.lastDay.getDate() + 28 - 1);
        }

        const msgContainer = document.querySelector('#mhwp-ipso-message-top');
        addMessage('Gegevens ophalen, dit kan even duren', msgContainer);

        fetchCalendar(msgContainer).then((_) => {
            clearMessages(msgContainer);
            displayCalendar(prevFirstDay, monthContainer);
        });
    }

    /**
     * Fetch the activities as required by our state's first- and lastDay properties.
     *
     * @param errContainer  Where to display errors.
     * @returns {Promise<void>}
     */
    function fetchCalendar(errContainer) {
        if (state.firstDay < state.firstFetched) {
            const from = new Date(state.firstDay);
            const till = new Date(state.firstFetched)
            till.setDate(state.firstFetched.getDate() - 1);

            state.firstFetched = from;

            return fetchActivities(from, till, errContainer).then(acts => {
                state.activities.unshift(...acts);
            });

        }
        if (state.lastDay > state.lastFetched) {
            const till = new Date(state.lastDay);
            const from = new Date(state.lastFetched);
            from.setDate(state.lastFetched.getDate() + 1);

            state.lastFetched = till;

            return fetchActivities(from, till, errContainer).then(acts => {
                state.activities.push(...acts);
            });
        }

        return Promise.resolve();
    }

    /**
     * Display the activities.
     *
     * @param prevFirstDay start date for our previous display.
     * @param container element where to append thje acitivities.
     */
    function displayCalendar(prevFirstDay, container) {
        document.querySelectorAll('.mhwp-ipso-week-current').forEach((e) => {
            e.innerHTML = `${formatDate(state.firstDay)} - ${formatDate(state.lastDay)}`;
        });

        // Filter. Does some checkbox filter match some activity filter.
        // For now, we do not filter.
        // state.activities.forEach((a) => {
        //     const show = state.filters.length === 0 || state.filters.some((cbf)  => a.filters.some((af) => af === cbf));
        //
        //     if (show) {
        //         a.element.classList.remove('filtered');
        //     } else {
        //         a.element.classList.add('filtered');
        //     }
        // })

        // We browsed forward.
        if (prevFirstDay < state.firstDay) {
            // Remove no longer visible activities.
            state.activities.filter((a) => {
                const d = new Date(a.onDate);
                return a.element.parentElement != null && d < state.firstDay;
            }).forEach((a) => a.element.remove());

            // Add activities that became visible.
            state.activities.filter((a) => {
                const d = new Date(a.onDate);
                return a.element.parentElement == null && d >= state.firstDay && d <= state.lastDay;
            }).forEach((a) => container.append(a.element));
        }
        // We browsed backward.
        if (prevFirstDay >= state.firstDay) {
            // Remove no longer visible activities.
            state.activities.filter((a) => {
                const d = new Date(a.onDate);
                return a.element.parentElement != null && d > state.lastDay;
            }).forEach((a) => a.element.remove());

            // Add activities that became visible.
            state.activities.filter((a) => {
                const d = new Date(a.onDate);
                return a.element.parentElement == null && d >= state.firstDay && d <= state.lastDay;
            }).reverse().forEach((a) => container.prepend(a.element));
        }
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
     * Fetch the activities from the server, collapse, sort, add an element and  filter.
     * @param from
     * @param till
     * @param msgContainer
     * @returns {Promise<{activityID: *, onDate: *, mentors: *, title: *, items: [], extraInfo: *}[]>}
     */
    function fetchActivities(from, till, msgContainer) {
        const url = new URL(marikenhuisURL);
        url.pathname = "wp-json/mhwp-ipso/v1/activity";

        url.searchParams.append('from', localeISOString(from));
        url.searchParams.append('till', localeISOString(till));

        return fetchWpRest(url, {}, msgContainer).then((json) => {

            // Collapse, sort, create a dom element, process filters.
            const acts = collapseActivities(json.data);
            acts.sort((a1, a2) => new Date(a1.items[0].timeStart) - new Date(a2.items[0].timeStart));
            acts.forEach(a => createActivityElement(a));
            acts.forEach(a => {
                a.filters = a.extraInfo.split(';').filter(Boolean).map(s => s.toLowerCase().replaceAll(/\W/g, ''));
            })

            return acts;
        });
    }

    /**
     * Create an element for an activity.
     *
     * @param activity
     * @returns {*}
     */
    function  createActivityElement(activity) {
        const template = document.getElementById('mhwp-ipso-month-card').content.firstElementChild;

        const element = template.cloneNode(true);

        const date = formatDate(new Date(activity.onDate));
        // For now, we don't display the times in the cards.
        // const times = activity.items.map( i => formatTime(new Date(i.timeStart))).join(',&nbsp;');
        const times = '';

        element.querySelector('.mhwp-ipso-card-title').innerHTML = activity.title;
        element.querySelector('.mhwp-ipso-card-date').innerHTML = date;
        element.querySelector('.mhwp-ipso-card-time').innerHTML = times;

        element.querySelector('.mhwp-ipso-card-more').addEventListener('click', readMore);

        activity.element = element;
        return activity;

        /**
         * click handler for read more buttons.
         * Get the activities details and show them in a popup, or display a message if the activity is sold out.
         */
        async function readMore(e) {
            clearErrors(element);
            clearMessages(element);
            addMessage('Gevens ophalen, dit kan even duren', element);

            const detail = await fetchActivityDetails(activity, element);

            if (detail.items.length === 0) {
                clearMessages(element);
                addMessage('De activiteit is vol, u kunt niet meer reserveren.', element);
                setTimeout(() => clearMessages(element), 4000);
            } else {
                displayActivity(detail, element);
            }
        }

    }

    /**
     * Fetch the details for an activity, filter all of its items on places available.
     *
     * @param activity
     * @param msgContainer
     * @returns {Promise<{detail}>} All information for an activity.
     */
    async function fetchActivityDetails (activity, msgContainer) {
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
            msgContainer.scrollIntoView();
            form.querySelector('button').disabled = true;

            // Return a promise that resolves after 4 seconds.
            // After that the box is closed.
            return wait(4000);
        }).catch((_) => {
            // An exception occured, we already have shown the error.
            form.querySelector('button').disabled = true;

            // Return a promise that resolves after 5 seconds.
            // After that the box is closed.
            return wait(4000);
        });
    }

    // Run init and handleWeekChange on DOMContentLoaded
    // document.addEventListener('DOMContentLoaded', () => { init(); handleWeekChange(0, 28);});
    document.addEventListener('DOMContentLoaded', () => { init(); calendar(0);});
})();
