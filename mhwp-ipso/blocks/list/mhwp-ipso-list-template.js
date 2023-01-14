function template(activity) {
    const id = activity.id;
    // We just return an evaluated template string.
    return `
        <li class="mhwp-ipso-activity panel">
            <div>
                <div class="mhwp-ipso-activity-header">
                    <span class="mhwp-ipso-activity-header-title">${activity.title}</span>
                    <span class="mhwp-ipso-activity-header-date">${activity.date}</span>
                    <span class="mhwp-ipso-activity-header-time">${activity.time}</span>
                </div>
                <button class="mhwp-ipso-activity-show-detail"  type="button"
                   data-toggle="collapse" data-target="#mhwp-ipso-collapse-detail-${id}" data-parent="#mhwp-ipso-list-container"
                   aria-expanded="false" aria-controls="mhwp-ipso-collapse-detail-${id}">
                   Lees meer
                </button>
                <div class="mhwp-ipso-activity-detail collapse" id="mhwp-ipso-collapse-detail-${id}">
                    <button class="mhwp-ipso-activity-show-reservation" type="button"
                       data-toggle="collapse" data-target="#mhwp-ipso-collapse-reservation-${id}"
                       aria-expanded="false" aria-controls="mhwp-ipso-collapse-reservation-${id}">
                        Reserveer
                    </button>
                </div>
                <div class="mhwp-ipso-activity-reservation collapse" id="mhwp-ipso-collapse-reservation-${id}">
                    <form>
                        <input type="hidden" name="activityCalendarId" value="${activity.id}" />
                        
                        <div>
                            <fieldset class="mhwp-ipso-reservation-firstname">
                                <label for="mhwp-ipso-firstname-${id}">Voornaam</label>
                                <span class="required">*</span>
                                <input type="text" id="mhwp-ipso-firstname-${id}" name="firstName" required placeholder="" />
                            </fieldset>
                            <fieldset class="mhwp-ipso-reservation-prefix">
                                <label for="mhwp-ipso-prefix-${id}">Tussenvoegsel</label>
                                <input type="text" id="mhwp-ipso-prefix-${id}" name="lastNamePrefix" placeholder="" />
                            </fieldset>
                            <fieldset class="mhwp-ipso-reservation-lastname">
                                <label for="mhwp-ipso-lastname-${id}">Achternaam</label>
                                <span class="required">*</span>
                                <input type="text" id="mhwp-ipso-lastname-${id}" name="lastName" required placeholder="" />
                            </fieldset>
                            <fieldset class="mhwp-ipso-reservation-telephone">
                                <label for="mhwp-ipso-telephone-${id}">Telefoonnummer</label>
                                <input type="tel" id="mhwp-ipso-telephone-${id}" name="phoneNumber" placeholder="" />
                                <span class="validity"></span>
                            </fieldset>
                            <fieldset class="mhwp-ipso-reservation-email">
                                <label for="mhwp-ipso-email-${id}">Emailadres</label>
                                <span class="required">*</span>
                                <input type="email" id="mhwp-ipso-email-${id}" name="email" required placeholder="" />
                                <span class="validity"></span>
                            </fieldset>
                            <div>
                                <!-- @see https://stackoverflow.com/questions/5985839/bug-with-firefox-disabled-attribute-of-input-not-resetting-when-refreshing  -->
                                <button class="mhwp-ipso-activity-submit-reservation" type="submit" autocomplete="off">Reserveer</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </li>`;
}

export default template;
