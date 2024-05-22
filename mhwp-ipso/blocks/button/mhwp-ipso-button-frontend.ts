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

(function () {
  // jQuery.
  const $jq = jQuery.noConflict();

  // Nr of days to fetch 3 * 28
  const daysToFetch = 84;

  // Nr of activities to show in the popup
  const actsToShow = 6;

  /**
   * Init globals.
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
  }

  /**
   * Fetch and display the button.
   */
  function button(): void {
    const msgContainer = document.querySelector(
      '#mhwp-ipso-button'
    ) as HTMLElement;

    fetchButton(msgContainer).then((activity) => {
      // Only display the button if we found activities with free places.
      if (activity && activity.activityID && activity.items.length !== 0) {
        clearMessages(msgContainer);
        displayButton(activity, msgContainer);
      } else {
        addMessage(
          'Er zijn in de aankomende periode geen activiteiten.',
          msgContainer
        );
        const button = document.querySelector(
          '#mhwp-ipso-button-more'
        ) as HTMLButtonElement;
        button.style.display = 'none';
      }
    });
  }

  /**
   * Fetch all activities given by nrDays; filter by the activityId parameter. sort collapse.
   * @param msgContainer
   * @returns {Promise<{activityID: *, onDate: *, mentors: *, title, items: *[], extraInfo: *}>}
   */
  function fetchButton(msgContainer: HTMLElement): Promise<Activity | void> {
    const id = parseInt(
      (
        document.querySelector(
          '#mhwp-ipso-button-activityid'
        ) as HTMLInputElement
      ).value
    );
    if (Number.isNaN(id)) {
      addMessage('Ongeldige knop', msgContainer);
      setTimeout(() => clearMessages(msgContainer), 4000);
      return Promise.reject();
    }

    const url = new URL(document.location.origin);
    url.pathname = 'wp-json/mhwp-ipso/v1/activity';

    const from = new Date();
    url.searchParams.append('from', localeISOString(from));
    const till = new Date(from.setDate(from.getDate() + daysToFetch));
    url.searchParams.append('till', localeISOString(till));

    return fetchWpRest(url, {}, msgContainer).then((json) => {
      if(json) {
      let activities = json.data as IPSOActivity[];
      // sort, filter, truncate and collapse.
      activities.sort(
        (a1, a2) =>
          new Date(a1.timeStart).getTime() - new Date(a2.timeStart).getTime()
      );
      activities = activities.filter((a) => a.activityID === id);

      if (activities.length > actsToShow) activities.length = actsToShow;
      return collapse(activities);
      } else return undefined
    });
  }

  /**
   * collapse all calendar details for the activities in an array `items`.
   *
   * @param acts
   * @returns {{activityID: *, onDate: *, mentors: *, title, items: [*], extraInfo: *}}
   */
  function collapse(acts: IPSOActivity[]): Activity {
    const items = acts.map((a) => {
      return {
        calendarId: a.id,
        timeOpen: a.timeOpen,
        timeStart: a.timeStart,
        timeEnd: a.timeEnd,
        places: undefined,
      };
    });
    return {
      activityID: acts[0]?.activityID,
      title: acts[0]?.title,
      location: '',
      onDate: acts[0]?.onDate,
      element: undefined,
      items,
    };
  }

  /**
   * Prepare the button.
   *
   * @param activity The activity.
   * @param msgContainer The html element used for showing messages
   */
  function displayButton(activity: Activity, msgContainer: HTMLElement): void {
    const button = document.querySelector(
      '#mhwp-ipso-button-more'
    ) as HTMLButtonElement;
    button.addEventListener('click', readMore);

    /**
     * click handler for read more buttons.
     * Get the activities details and show them in a popup, or display a message if the activity is sold out.
     *
     * @param e The event..
     */
    async function readMore(e: MouseEvent): Promise<void> {
      clearErrors(msgContainer);
      clearMessages(msgContainer);
      addMessage('Gevens ophalen, dit kan even duren', msgContainer);

      const detail: ActivityDetail | void = await fetchActivityDetails(
        activity,
        msgContainer
      );

      if (detail && detail.items.length === 0) {
        clearMessages(msgContainer);
        addMessage(
          'Er zijn helaas voorlopig geen vrije plaatsen.',
          msgContainer
        );
        setTimeout(() => clearMessages(msgContainer), 4000);
      } else if(detail){
        clearMessages(msgContainer);
        displayActivity(detail, msgContainer);
      }
    }
  }

  /**
   * Display an activity in a modal popup.
   * Use the html we got from our wp block.
   *
   * @param activity Current activity
   * @param msgElement DOM node of the card element of the activity
   */
  function displayActivity(activity: ActivityDetail, msgElement: HTMLElement) {
    const box: HTMLElement = displayModalBox(activity, msgElement);

    (box.querySelector('#mhwp-ipso-box-title') as HTMLElement).innerHTML =
      activity.title;

    (box.querySelector('#mhwp-ipso-box-image') as HTMLImageElement).src =
      activity.imageUrl;

    (box.querySelector('.mhwp-ipso-res-items') as HTMLElement).append(
      itemsCheckbox(activity.items)
    );
  }

  /**
   * Display the modal popup.
   * Define event handlers for closing it again. Prepare the reservation form if shown.
   *
   * @param activity
   * @param msgElement
   * @returns {HTMLElement}
   */
  function displayModalBox(
    activity: ActivityDetail,
    msgElement: HTMLElement
  ): HTMLElement {
    // Add an overlay.
    const overlay: HTMLDivElement = document.createElement('div');
    overlay.id = 'mhwp-ipso-box-overlay';
    document.body.append(overlay);
    document.body.style.overflow = 'hidden';
    document.body.addEventListener('keydown', keyHandler);

    const box: HTMLElement = document.getElementById(
      'mhwp-ipso-modal-box'
    ) as HTMLElement;
    const innerBox: HTMLElement = document.getElementById(
      'mhwp-ipso-box-inner'
    ) as HTMLElement;

    // Event handlers.
    (box.querySelector('#mhwp-ipso-box-close') as HTMLElement).addEventListener(
      'click',
      closeBox
    );
    box.addEventListener('click', closeBoxFromOverlay);

    box.setAttribute('open', 'true');

    function submitHandler(form: HTMLFormElement, event: Event) {
      makeReservation(activity, form, box, event).then(() =>
          closeBox(new MouseEvent('click'))
      );
    }
    function invalidHandler(): void {
      // TODO: We want an error message here, this shouldn't happen though.
      console.log('invalid');
    }

    // If we have a form in our popup, prepare it.
    const form: HTMLFormElement = box.querySelector(
      '#mhwp-ipso-box-form'
    ) as HTMLFormElement;
    if (form) {
      const v = $jq(form).validate();
      if (v) v.destroy();

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
    function keyHandler(e: KeyboardEvent): void {
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
      clearErrors(msgElement);
      clearMessages(msgElement);
      clearErrors(box);
      clearMessages(box);

      document.body.style.overflow = 'visible';
      box.removeAttribute('open');

      document.body.removeEventListener('keydown', keyHandler);
      (
        box.querySelector('#mhwp-ipso-box-close') as HTMLElement
      ).removeEventListener('click', closeBox);
      box.removeEventListener('click', closeBoxFromOverlay);

      // remove item checkboxes.
      (
        box.querySelector('.mhwp-ipso-res-items') as HTMLElement
      ).firstElementChild!.remove();
      overlay.remove();

      // The button was hidden upon reservations.
      (
        box.querySelector('#mhwp-ipso-box-form button') as HTMLElement
      ).style.display = 'block';

      const form = box.querySelector('form');
      if (form) form.reset();

      if (e) e.stopImmediatePropagation();
    }
  }

  /**
   * Generate html for the choose time checkbox, or a hidden input if there is only one time available.
   *
   * @param items
   * @returns {ChildNode}
   */
  function itemsCheckbox(items: ActivityItem[]): Node {
    let strings: string[] = items.map((item, idx) => {
      const date = formatDate(new Date(item.timeStart));
      const time = formatTime(new Date(item.timeStart));
      return (
        `<span>
         <input class="mhwp-ipso-res-itemchoice" type="radio" id="mhwp-ipso-res-item-${idx}" name="calendarId" value="${item.calendarId}"/>
         <label class="mhwp-ipso-res-itemlabel" for="mhwp-ipso-res-item-${idx}">${date}&nbsp;${time}</label>
         </span>`
      );
    });

    strings[0] = strings[0].replace('type="radio"', 'type="radio" checked');

    return createNodeFromHTML(
      `<div>
      <div id="mhwp-ipso-res-itemslabel">Kies je tijd</div>
      ${strings.join('')}
      </div>`
    );
  }

  // Run init and the button on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    init();
    button();
  });
})();
