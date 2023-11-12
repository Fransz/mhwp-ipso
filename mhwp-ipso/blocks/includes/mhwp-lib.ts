declare namespace wpApiSettings {
  let nonce: string;
}

interface MHWPData {
  mhwp_ipso_code: number;
  mhwp_ipso_status: string;
  mhwp_ipso_msg: string;
  data: IPSOActivity[] | IPSOActivityDetail | ActivityParticipants;
}
interface IPSOActivity {
  id: number;
  activityID: number;
  onDate: string;
  timeOpen: string;
  timeStart: string;
  timeEnd: string;
  extraInfo: string;
  mentors: string[];
  title: string;
}
interface IPSOActivityDetail {
  id: number;
  title: string;
  mainImage: string;
  intro: string;
  description: string;
  price: number;
  priceExplanation: string;
  maxRegistrations: number;
  minRegistrations: number;
  waitingList: boolean;
  closeOnMaxRegistrations: boolean;
  appointment: boolean;
  appointmentInfo: string;
  reservationUrl: string;
  disableReservation: string;
}

interface ActivityParticipants {
  nrParticipants: number;
}

interface Activity {
  activityID: number;
  title: string;
  extraInfo: string;
  mentors: string[];
  onDate: string;
  items: ActivityItem[];
  element?: HTMLElement;
}

interface ActivityItem {
  calendarId: number;
  timeOpen: string;
  timeStart: string;
  timeEnd: string;
  places?: number;
}

interface ActivityDetail extends IPSOActivityDetail {
  imageUrl: string;
  onDate: string;
  items: ActivityItem[];
}

/**
 * Make a request for the details of an activity, and again if necessary.
 *
 * @param activity The activity for which to fetch the detail
 * @param msgContainer The parent for messages.
 * @returns {Promise<MHWPData>}
 */
async function fetchDetail(
  activity: Activity,
  msgContainer: HTMLElement
): Promise<MHWPData> {
  const url = new URL(document.location.origin);
  url.pathname = 'wp-json/mhwp-ipso/v1/activitydetail';
  url.searchParams.append('activityId', activity.activityID.toString());

  return fetchWpRest(url, {}, msgContainer, false).then((json) => {
    // Upon a 429 error (Too many requests), We try again.
    if (json.mhwp_ipso_code === 429) {
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
function fetchParticipants(
  calendarId: number,
  msgContainer: HTMLElement
): Promise<MHWPData> {
  const url = new URL(document.location.origin);
  url.pathname = 'wp-json/mhwp-ipso/v1/participants';
  url.searchParams.append('calendarId', calendarId.toString());

  return fetchWpRest(url, {}, msgContainer, false).then((json) => {
    // Upon a 429 error (Too many requests), We try again.
    if (json.mhwp_ipso_code === 429) {
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
 * @param box The modal box which contains the form.
 * @param event The submit event.
 * @returns {Promise<void>}
 */
async function makeReservation(
  activity: ActivityDetail,
  form: HTMLFormElement,
  box: HTMLElement,
  event: Event
): Promise<void> {
  event.preventDefault();

  // The URL for making the reservation
  const url = new URL(document.location.origin);
  url.pathname = 'wp-json/mhwp-ipso/v1/reservation';

  const msgContainer = box.querySelector(
    '#mhwp-ipso-box-messagerow'
  ) as HTMLElement;

  // Get the item corresponding to the hidden input or selected radiobutton.
  let calendarId: number;
  calendarId = parseInt(
    (form.querySelector('input[name="calendarId"]:checked') as HTMLInputElement)
      .value
  );
  const item = activity.items.filter((i) => i.calendarId === calendarId)[0];

  const activityCalendarId = item.calendarId.toString();
  const firstName = (
    form.querySelector('input[name="firstName"]') as HTMLInputElement
  ).value;
  const lastNamePrefix = (
    form.querySelector('input[name="lastNamePrefix"]') as HTMLInputElement
  ).value;
  const lastName = (
    form.querySelector('input[name="lastName"]') as HTMLInputElement
  ).value;
  const email = (form.querySelector('input[name="email"]') as HTMLInputElement)
    .value;
  let phoneNumber: string | null = (
    form.querySelector('input[name="phoneNumber"]') as HTMLInputElement
  ).value;
  phoneNumber = phoneNumber === '' ? null : phoneNumber;
  const remark = (
    form.querySelector('textarea[name="remark"]') as HTMLInputElement
  ).value;

  const activityId = activity.id;
  const activityTitle = activity.title;
  const activityDate = formatDate(activity.onDate, false);
  const activityTime = formatTime(item.timeStart);

  // Data for our endpoint.
  // activityId, activityTime, activitydate, activityTitle and remark are used for mail.
  const data = {
    activityCalendarId,
    firstName,
    lastNamePrefix,
    lastName,
    email,
    phoneNumber,
    activityId,
    activityTitle,
    activityDate,
    activityTime,
    remark,
  };

  const fetchInit = {
    method: 'POST',
    body: JSON.stringify(data),
  };
  await fetchWpRest(url, fetchInit, msgContainer)
    .then(() => {
      addMessage(
        'Er is een plaats voor je gereserveerd; Je ontvangt een email',
        msgContainer
      );
      msgContainer.scrollIntoView();
      form.querySelector('button')!.style.display = 'none';

      // Return a promise that resolves after 4 seconds.
      // After that the box is closed.
      return wait(4000);
    })
    .catch((_) => {
      // An exception occured, we already have shown the error.
      form.querySelector('button')!.style.display = 'none';

      // Return a promise that resolves after 5 seconds.
      // After that the box is closed.
      return wait(4000);
    });
}

/**
 * Helper method for accessing the rest api in our wordPress installation.
 *
 * @param url The URL of the worpress installation.
 * @param init Additional settings for the fetch init object.
 * @param errorContainer A container for error messages.
 * @param throw_429 whether we should throw upon 429 errors. If this is false the caller should retry.
 * @returns {Promise<MHWPData>}
 */
function fetchWpRest(
  url: URL,
  init: {},
  errorContainer: HTMLElement,
  throw_429: boolean = true
): Promise<MHWPData> {
  const defaults: RequestInit = {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'X-WP-Nonce': wpApiSettings.nonce,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
  return fetch(url, Object.assign({}, defaults, init))
    .then((res) => {
      if (!res.ok) {
        throw new TypeError('Er is een probleem op de server.');
      }

      // Get a possibly new nonce from the response header, store it globally.
      const nonce = res.headers.get('X-WP-Nonce');
      if (nonce) wpApiSettings.nonce = nonce;

      return res.json();
    })
    .then((json: MHWPData) => {
      if (json.mhwp_ipso_status !== 'ok') {
        // Upon a 429 error and if the caller can handle it, we return our JSON.
        if (json.mhwp_ipso_code === 429 && !throw_429) {
          return json;
        }
        const message = json.mhwp_ipso_msg ? json.mhwp_ipso_msg : '';
        throw new TypeError(message);
      }
      return json;
    })
    .catch((err) => {
      let message = '';
      if (err instanceof TypeError) {
        message = err.message;
      }
      if ('' === message) {
        message = 'Er gaat iets mis, probeer het later nog eens';
      }
      clearErrors(errorContainer);
      clearMessages(errorContainer);
      addError(message, errorContainer);

      // retrow the error. Users of this call decide what should happen.
      throw err;
    });
}

/**
 * Helper for setTimeout in a Promise style.
 *
 * @param duration
 * @returns {Promise<void>}
 */
function wait(duration: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (duration < 0) reject(new Error('Cannot wait negative time'));
    setTimeout(resolve, duration);
  });
}

/**
 * Helper for creating Nodes from a HTML string.
 * @link https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
 *
 * @param htmlString The HTML string
 */
function createNodeFromHTML(htmlString: string): ChildNode {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild!;
}

/**
 * Helper for adding a message text to a container.
 *
 * @param message The text message.
 * @param className The messages classname
 * @param container The containter where to add the message.
 */
function addNode(
  message: string,
  className: string,
  container: HTMLElement
): void {
  const html = `<div class="${className}-container"><h3 class="message">${message}</h3></div>`;
  const node = createNodeFromHTML(html);
  container.append(node);
}
function addError(message: string, container: HTMLElement) {
  addNode(message, 'error', container);
}
function addMessage(message: string, container: HTMLElement) {
  addNode(message, 'message', container);
}

/**
 * Helper for reming messages within a container.
 * @param className The classname for selecting.
 * @param container The container where to search.
 */
function clearNodes(className: string, container: HTMLElement): void {
  container.querySelector(`.${className}-container`)?.remove();
}
function clearErrors(container: HTMLElement): void {
  clearNodes('error', container);
}
function clearMessages(container: HTMLElement): void {
  clearNodes('message', container);
}

/**
 * Helper for formating dates.
 *
 * @param datetime
 * @returns {string}
 */
function formatTime(datetime: Date | string): string {
  const timeFormat = new Intl.DateTimeFormat('nl-NL', {
    hour: 'numeric',
    minute: 'numeric',
  }).format;
  return timeFormat(new Date(datetime)).replace(':', '.');
}

/**
 * Helper for formating times.
 *
 * @param datetime The datetime string to format
 * @param replace Do we want to replace spaces by the &nbsp; entity.
 * @returns {string}
 */
function formatDate(datetime: Date | string, replace: boolean = true): string {
  const dateFormat = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format;
  if (replace) {
    return dateFormat(new Date(datetime)).replace(/ /g, '&nbsp;');
  } else {
    return dateFormat(new Date(datetime));
  }
}

/**
 * Helper for getting an ISO8601 date string in the locale timezone.
 * @see https://stackoverflow.com/questions/10830357
 *
 * @param d
 * @returns {string}
 */
function localeISOString(d: Date): string {
  const offset = new Date().getTimezoneOffset() * 60000;
  return new Date(d.valueOf() - offset).toISOString().slice(0, -14);
}

export {
  fetchWpRest,
  wait,
  addError,
  addMessage,
  clearErrors,
  clearMessages,
  makeReservation,
  createNodeFromHTML,
  formatTime,
  formatDate,
  localeISOString,
  fetchDetail,
  fetchParticipants,
};

export type {
  MHWPData,
  IPSOActivity,
  IPSOActivityDetail,
  Activity,
  ActivityItem,
  ActivityDetail,
  ActivityParticipants,
};
