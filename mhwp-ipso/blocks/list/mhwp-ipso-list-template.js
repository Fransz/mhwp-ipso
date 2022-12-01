function template(activity, cnt) {
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
                   data-toggle="collapse" data-target="#mhwp-ipso-collapse-detail-${cnt}" data-parent="#mhwp-ipso-list-container"
                   aria-expanded="false" aria-controls="mhwp-ipso-collapse-detail-${cnt}">
                   Lees meer
                </button>
                <div class="mhwp-ipso-activity-detail collapse" id="mhwp-ipso-collapse-detail-${cnt}">
                    ${activity.img ? activity.img : ''}
                    <div class="mhwp-ipso-activity-detail-title">${activity.title}</div>
                    <div class="mhwp-ipso-activity-detail-intro">${activity.intro}</div>
                    <div class="mhwp-ipso-activity-detail-description">${activity.description}</div>
                    <button class="mhwp-ipso-activity-show-reservation" type="button"
                       data-toggle="collapse" data-target="#mhwp-ipso-collapse-reservation-${cnt}"
                       aria-expanded="false" aria-controls="mhwp-ipso-collapse-reservation-${cnt}">
                        Reserveer
                    </button>
                </div>
                <div class="mhwp-ipso-activity-reservation collapse" id="mhwp-ipso-collapse-reservation-${cnt}">
                    <form>
                        <input type="hidden" name="activityCalendarId" value="${activity.id}" />
                        
                        <div>
                            <fieldset class="mhwp-ipso-reservation-firstname">
                                <label for="mhwp-ipso-firstname-${cnt}">Voornaam</label>
                                <span class="required">*</span>
                                <input type="text" id="mhwp-ipso-firstname-${cnt}" name="firstName" required placeholder="" />
                            </fieldset>
                            <fieldset class="mhwp-ipso-reservation-prefix">
                                <label for="mhwp-ipso-prefix-${cnt}">Tussenvoegsel</label>
                                <input type="text" id="mhwp-ipso-prefix-${cnt}" name="lastNamePrefix" placeholder="" />
                            </fieldset>
                            <fieldset class="mhwp-ipso-reservation-lastname">
                                <label for="mhwp-ipso-lastname-${cnt}">Achternaam</label>
                                <span class="required">*</span>
                                <input type="text" id="mhwp-ipso-lastname-${cnt}" name="lastName" required placeholder="" />
                            </fieldset>
                            <fieldset class="mhwp-ipso-reservation-telephone">
                                <label for="mhwp-ipso-telephone-${cnt}">Telefoonnummer</label>
                                <input type="tel" id="mhwp-ipso-telephone-${cnt}" name="phoneNumber" placeholder="" />
                                <span class="validity"></span>
                            </fieldset>
                            <fieldset class="mhwp-ipso-reservation-email">
                                <label for="mhwp-ipso-email-${cnt}">Emailadres</label>
                                <span class="required">*</span>
                                <input type="email" id="mhwp-ipso-email-${cnt}" name="email" required placeholder="" />
                                <span class="validity"></span>
                            </fieldset>
                        <div>
                        <!-- @see https://stackoverflow.com/questions/5985839/bug-with-firefox-disabled-attribute-of-input-not-resetting-when-refreshing  -->
                        <button class="mhwp-ipso-activity-submit-reservation" type="submit" autocomplete="off">Reserveer</button>
                    </div>
                </div>
            </form>
        </div>

    </li>`;
}

export default template;
