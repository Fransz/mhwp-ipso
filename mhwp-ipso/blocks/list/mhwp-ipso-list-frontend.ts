import {
  addMessage,
  clearErrors,
  clearMessages,
  createNodeFromHTML,
  fetchActivityDetails,
  fetchWpRest,
  formatDate,
  formatTime,
  localeISOString,
  makeReservation,
} from '../includes/mhwp-lib';

import type {
  IPSOActivity,
  Activity,
  ActivityDetail,
  ActivityItem,
} from '../includes/mhwp-lib';

declare namespace jQuery {
  function noConflict(): any;
}

interface State {
  activities: Activity[];
  firstDay: Date;
  lastDay: Date;
  firstFetched: Date;
  lastFetched: Date;
}

(function () {
  /**
   * Globales.
   */
  // jQuery.
  const $jq = jQuery.noConflict();

  const state: State = {
    activities: [],
    firstDay: new Date(),
    lastDay: new Date(),
    firstFetched: new Date(),
    lastFetched: new Date(),
  };

  /**
   * init globals, attach event handlers.
   */
  function init() {
    // A rule for the jQuery validator. Dutch phone numbers have 10 digits (or 11 and start with +31).
    $jq.validator.addMethod(
      'phoneNL',
      function (this: any, value: any, element: HTMLElement) {
        return (
          this.optional(element) ||
          /^((\+|00(\s|\s?-\s?)?)31(\s|\s?-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?-\s?)?[0-9]){8}$/.test(
            value
          )
        );
      },
      'Vul een geldig telefoonnummer in.'
    );

    // Initialize the week picker.
    document.querySelectorAll('.mhwp-ipso-week-previous').forEach((btn) => {
      btn.addEventListener('click', () => calendar(-7));
    });

    document.querySelectorAll('.mhwp-ipso-week-next').forEach((btn) => {
      btn.addEventListener('click', () => calendar(7));
    });

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
   * Fetch and display the calendar, adjusting the state with shift days.
   *
   * @param shiftDays
   */
  function calendar(shiftDays: number): void {
    const monthContainer = document.querySelector(
      '#mhwp-ipso-month-container'
    ) as HTMLElement;

    const prevFirstDay = new Date(state.firstDay);

    state.firstDay.setDate(state.firstDay.getDate() + shiftDays);
    state.lastDay.setDate(state.lastDay.getDate() + shiftDays);

    const toDay = new Date();
    toDay.setHours(0, 0, 0, 0);

    // We tried to browse into the past, reset first and lastDay
    if (state.firstDay < toDay) {
      state.firstDay = toDay;

      state.lastDay = new Date(toDay);
      state.lastDay.setHours(0, 0, 0, 0);
      state.lastDay.setDate(state.lastDay.getDate() + 28 - 1);
    }

    const msgContainer = document.querySelector(
      '#mhwp-ipso-message-top'
    ) as HTMLElement;
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
  function fetchCalendar(errContainer: HTMLElement): Promise<void> {
    if (state.firstDay < state.firstFetched) {
      const from = new Date(state.firstDay);
      const till = new Date(state.firstFetched);
      till.setDate(state.firstFetched.getDate() - 1);

      state.firstFetched = from;

      return fetchActivities(from, till, errContainer).then((acts) => {
        state.activities.unshift(...acts);
      });
    }
    if (state.lastDay > state.lastFetched) {
      const till = new Date(state.lastDay);
      const from = new Date(state.lastFetched);
      from.setDate(state.lastFetched.getDate() + 1);

      state.lastFetched = till;

      return fetchActivities(from, till, errContainer).then((acts) => {
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
  function displayCalendar(prevFirstDay: Date, container: HTMLElement): void {
    document.querySelectorAll('.mhwp-ipso-week-current').forEach((e) => {
      e.innerHTML = `${formatDate(state.firstDay)} - ${formatDate(
        state.lastDay
      )}`;
    });

    // We browsed forward.
    if (prevFirstDay < state.firstDay) {
      // Remove no longer visible activities.
      state.activities
        .filter((a) => {
          const d = new Date(a.onDate);
          return a.element!.parentElement != null && d < state.firstDay;
        })
        .forEach((a) => a.element!.remove());

      // Add activities that became visible.
      state.activities
        .filter((a) => {
          const d = new Date(a.onDate);
          return (
            a.element!.parentElement == null &&
            d >= state.firstDay &&
            d <= state.lastDay
          );
        })
        .forEach((a) => container.append(a.element!));
    }
    // We browsed backward.
    if (prevFirstDay >= state.firstDay) {
      // Remove no longer visible activities.
      state.activities
        .filter((a) => {
          const d = new Date(a.onDate);
          return a.element!.parentElement != null && d > state.lastDay;
        })
        .forEach((a) => a.element!.remove());

      // Add activities that became visible.
      state.activities
        .filter((a) => {
          const d = new Date(a.onDate);
          return (
            a.element!.parentElement == null &&
            d >= state.firstDay &&
            d <= state.lastDay
          );
        })
        .reverse()
        .forEach((a) => container.prepend(a.element!));
    }
  }

  /**
   * Fetch the activities from the server, collapse, sort, add an element.
   * @param from
   * @param till
   * @param msgContainer
   * @returns {Promise<Activity[]>}
   */
  function fetchActivities(
    from: Date,
    till: Date,
    msgContainer: HTMLElement
  ): Promise<Activity[]> {
    const url = new URL(document.location.origin);
    url.pathname = 'wp-json/mhwp-ipso/v1/activity';

    url.searchParams.append('from', localeISOString(from));
    url.searchParams.append('till', localeISOString(till));

    return fetchWpRest(url, {}, msgContainer)
      .then((json) => {
        // Create an Activity object for all returned data.
        const data: IPSOActivity[] = json.data as IPSOActivity[];
        return data.map((a) => {
          return {
            activityID: a.activityID,
            title: a.title,
            onDate: a.onDate,
            element: undefined,
            location: /cu(?:y|ij)k/i.test(a.extraInfo) ? 'Cuijk' : 'Nijmegen',
            items: [
              {
                calendarId: a.id,
                timeOpen: a.timeOpen,
                timeStart: a.timeStart,
                timeEnd: a.timeEnd,
                places: undefined,
              },
            ],
          };
        });
      })
      .then((activities: Activity[]) => {
        // Collapse, sort, create a dom element.
        const as: Activity[] = collapseActivities(activities);
        as.sort(
          (a1, a2) =>
            new Date(a1.items[0].timeStart).getTime() -
            new Date(a2.items[0].timeStart).getTime()
        );
        as.forEach((a) => createActivityElement(a));

        return as;
      });
  }

  /**
   * Collapse the same activities on the same day.
   * Create an object with all activityIds as key
   *   and as value: an object with all dates for that activityID as key
   *    and as value: an object with all locations for that activityID and date as key
   *    and as value: an array of all those activities on that day.
   * Then collect all activities into a single array again while
   * merge all items arrays for those grouped activities, and return one activity for the activity array,
   *
   * @param activities
   * @returns Activity[]
   */
  function collapseActivities(activities: Activity[]): Activity[] {
    type Grouped = {
      [i: string]: Activity[];
    };

    type GGrouped = {
      [i: string]: {
        [d: string]: Activity[];
      };
    };

    type GGGrouped = {
      [i: string]: {
        [d: string]: {
          [l: string]: Activity[];
        };
      };
    };

    let groups: Grouped = activities.reduce(groupById, {});

    let dateGroups: GGrouped = {};
    Object.keys(groups).forEach(
      (i: string) => (dateGroups[i] = groups[i].reduce(groupByDate, {}))
    );

    let locdateGroups: GGGrouped = {};
    Object.keys(groups).forEach((i: string) =>
      Object.keys(dateGroups[i]).forEach((d: string) => {
        if (!locdateGroups.hasOwnProperty(i)) locdateGroups[i] = {};
        locdateGroups[i][d] = dateGroups[i][d].reduce(groupByLocation, {});
      })
    );

    return Object.keys(locdateGroups).flatMap((i) =>
      Object.keys(locdateGroups[i]).flatMap((d) =>
        Object.keys(locdateGroups[i][d]).map((l) =>
          collect(locdateGroups[i][d][l])
        )
      )
    );

    function groupById(acc: Grouped, cur: Activity): Grouped {
      return groupBy(cur.activityID, acc, cur);
    }

    function groupByDate(acc: Grouped, cur: Activity): Grouped {
      return groupBy(cur.onDate, acc, cur);
    }

    function groupByLocation(acc: Grouped, cur: Activity): Grouped {
      return groupBy(cur.location, acc, cur);
    }

    /**
     * Reducer function for grouping.
     *
     * @param key the key on which to group
     * @param acc the accumulator
     * @param cur the current entry to add
     * @returns An object with activities grouped in an array.
     */
    function groupBy(
      key: string | number,
      acc: Grouped,
      cur: Activity
    ): Grouped {
      const grp = acc[key] ?? [];
      return { ...acc, [key]: [...grp, cur] };
    }

    /**
     * Make a single activity from an array of activities by concatenating all item properties.
     *
     * @param activities an array of Activities
     * @returns Activity
     */
    function collect(activities: Activity[]): Activity {
      activities.sort(
        (a1, a2) =>
          new Date(a1.items[0].timeStart).getTime() -
          new Date(a2.items[0].timeStart).getTime()
      );

      const items = activities.flatMap((a) => a.items);
      return {
        activityID: activities[0].activityID,
        title: activities[0].title,
        location: activities[0].location,
        onDate: activities[0].onDate,
        element: undefined,
        items,
      };
    }
  }

  /**
   * Create an element for an activity.
   *
   * @param activity
   * @returns void
   */
  function createActivityElement(activity: Activity): Activity {
    const template: Element = (
      document.getElementById('mhwp-ipso-month-card') as HTMLTemplateElement
    ).content.firstElementChild!;

    const element: HTMLElement = template.cloneNode(true) as HTMLElement;

    const date = formatDate(new Date(activity.onDate));

    element.classList.add('cuijk');
    element.querySelector('.mhwp-ipso-card-title')!.innerHTML = activity.title;
    element.querySelector('.mhwp-ipso-card-date')!.innerHTML = date;
    if (activity.location === 'Cuijk') {
      element.classList.add('location_cuijk')
      element.querySelector('.mhwp-ipso-card-location')!.innerHTML = 'Cuijk';
    }

    element
      .querySelector('.mhwp-ipso-card-more')!
      .addEventListener('click', readMore);

    activity.element = element;
    return activity;

    /**
     * click handler for read more buttons.
     * Get the activities details and show them in a popup, or display a message if the activity is sold out.
     */
    async function readMore() {
      clearErrors(element);
      clearMessages(element);
      addMessage('Gevens ophalen, dit kan even duren', element);

      const detail = await fetchActivityDetails(activity, element);

      if (detail.items.length === 0) {
        clearMessages(element);
        addMessage(
          'De activiteit is vol, je kunt niet meer reserveren.',
          element
        );
        setTimeout(() => clearMessages(element), 4000);
      } else {
        displayActivity(detail, element);
      }
    }
  }

  /**
   * Display an activity in a modal popup.
   * Use the html we got from our wp block.
   *
   * @param activity Current activity
   * @param cardElement DOM node of the card element of the activity
   */
  function displayActivity(
    activity: ActivityDetail,
    cardElement: HTMLElement
  ): void {
    const box = displayModalBox(activity, cardElement);

    (box.querySelector('#mhwp-ipso-box-title') as HTMLElement).innerHTML =
      activity.title;

    (box.querySelector('#mhwp-ipso-box-date') as HTMLElement).innerHTML =
      formatDate(activity.onDate);
    (box.querySelector('#mhwp-ipso-box-location') as HTMLElement).innerHTML =
      activity.location === 'Cuijk' ? activity.location : '';
    (box.querySelector('#mhwp-ipso-box-items') as HTMLElement).innerHTML =
      '&nbsp;' +
      activity.items.map((i) => formatTime(i.timeStart)).join('&comma;&nbsp;');

    (box.querySelector('#mhwp-ipso-box-intro') as HTMLElement).innerHTML =
      activity.intro;
    (box.querySelector('#mhwp-ipso-box-image') as HTMLImageElement).src =
      activity.imageUrl;

    box.querySelector('#mhwp-ipso-box-description')!.innerHTML =
      activity.description;

    box
      .querySelector('.mhwp-ipso-res-items')!
      .append(itemsCheckbox(activity.items));
  }

  /**
   * Display the modal popup.
   * Define event handlers for closing it again. Prepare the reservation form if shown.
   *
   * @param activity
   * @param cardElement
   * @returns {HTMLElement}
   */
  function displayModalBox(
    activity: ActivityDetail,
    cardElement: HTMLElement
  ): HTMLElement {
    // Add an overlay.
    const overlay = document.createElement('div');
    overlay.id = 'mhwp-ipso-box-overlay';
    document.body.append(overlay);
    document.body.style.overflow = 'hidden';
    document.body.addEventListener('keydown', keyHandler);

    const box: HTMLElement = document.getElementById('mhwp-ipso-modal-box')!;
    const innerBox: HTMLElement = document.getElementById(
      'mhwp-ipso-box-inner'
    )!;

    // Event handlers.
    box
      .querySelector('#mhwp-ipso-box-close')!
      .addEventListener('click', closeBox);
    box.addEventListener('click', closeBoxFromOverlay);

    // A different reservation button? The form?
    if (!activity.reservationUrl) {
      (
        box.querySelector('#mhwp-ipso-box-directbutton') as HTMLElement
      ).style.display = 'none';
    } else {
      (
        box.querySelector('#mhwp-ipso-box-formcolumn') as HTMLElement
      ).style.display = 'none';

      const button: HTMLButtonElement = box.querySelector(
        '#mhwp-ipso-box-directbutton button'
      )!;
      button.addEventListener('click', redirectReservation);

      if (activity.disableReservation) {
        (
          box.querySelector('#mhwp-ipso-box-directbutton') as HTMLElement
        ).style.display = 'none';
      }
    }

    box.setAttribute('open', 'true');

    // If we have a form in our popup, prepare it.
    const form: HTMLFormElement = box.querySelector('#mhwp-ipso-box-form')!;
    if (form) {
      // Destory a previous instance of the validator if it exists.
      const v = $jq(form).validate();
      if (v) v.destroy();

      function submitHandler(form: HTMLFormElement, event: Event) {
        makeReservation(activity, form, box, event).then(() =>
          closeBox(new MouseEvent('click'))
        );
      }
      function invalidHandler() {
        // TODO: We want an error message here, this shouldn't happen though.
        console.log('invalid');
      }

      // Validate our form
      $jq(form).validate({
        rules: {
          phoneNumber: {
            phoneNL: true,
            normalizer: (v: string) => v.trim(),
          },
        },
        submitHandler,
        invalidHandler,
      });
    }

    return box;

    /**
     * Handler for the escape key.
     *
     * @param e
     */
    function keyHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeBox(e);
      }
    }

    /**
     * Handler for clicks on the overlay.
     *
     * @param e
     */
    function closeBoxFromOverlay(e: MouseEvent): void {
      if (!innerBox.contains(e.target as Node)) {
        closeBox(e);
      }
    }

    /**
     * Handler for closing the popup.
     * Remove the html we appended, remove event listeners.
     *
     * @param e
     */
    function closeBox(e: Event): void {
      clearErrors(cardElement);
      clearMessages(cardElement);
      clearErrors(box);
      clearMessages(box);

      document.body.style.overflow = 'visible';
      box.removeAttribute('open');

      document.body.removeEventListener('keydown', keyHandler);
      box
        .querySelector('#mhwp-ipso-box-close')!
        .removeEventListener('click', closeBox);
      box.removeEventListener('click', closeBoxFromOverlay);

      box.querySelector('.mhwp-ipso-res-items')!.firstElementChild!.remove();
      overlay.remove();

      const form = box.querySelector('form');
      if (form) form.reset();

      (
        box.querySelector('#mhwp-ipso-box-formcolumn') as HTMLElement
      ).style.display = 'block';
      (
        box.querySelector('#mhwp-ipso-box-directbutton') as HTMLElement
      ).style.display = 'block';
      (
        box.querySelector('#mhwp-ipso-box-form button') as HTMLElement
      ).style.display = 'block';

      const button: HTMLButtonElement = box.querySelector(
        '#mhwp-ipso-box-directbutton button'
      )!;
      button.removeEventListener('click', redirectReservation);

      if (e) e.stopImmediatePropagation();
    }

    /**
     * Handler for clicking on a reservation button with a redirect.
     * @param e
     */
    function redirectReservation(e: MouseEvent): void {
      window.location.href = activity.reservationUrl;
    }
  }

  /**
   * Generate html for the choose time checkbox, or a hidden input if there is only one time available.
   *
   * @param items
   * @returns {ChildNode}
   */
  function itemsCheckbox(items: ActivityItem[]): Node {
    let strings = items.map((item, idx) => {
      const time = formatTime(new Date(item.timeStart));
      return `<span>
         <input class="mhwp-ipso-res-itemchoice" type="radio" id="mhwp-ipso-res-item-${idx}" name="calendarId" value="${item.calendarId}"/>
         <label class="mhwp-ipso-res-itemlabel" for="mhwp-ipso-res-item-${idx}">${time}</label>
         </span>`;
    });

    strings[0] = strings[0].replace('type="radio"', 'type="radio" checked');

    return createNodeFromHTML(
      `<div>
      <div id="mhwp-ipso-res-itemslabel">Kies je tijd</div>
      ${strings.join('')}
      </div>`
    );
  }

  document.addEventListener('DOMContentLoaded', () => {
    init();
    calendar(0);
  });
})();
