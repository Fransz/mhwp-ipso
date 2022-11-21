function template(activity, cnt, light_dark) {
    return `
        <li class="activity">
            <div>
                <div class="activity-header">
                    ${activity.img ? activity.img : ''}
                    <span class="activity-header-title">${activity.title}</span>
                    <span class="activity-header-date">${activity.date}</span>
                    <span class="activity-header-time">${activity.time}</span>
                </div>
                <div>
                    <button class ="activity-show-detail" type="button">Lees meer</button>
                    <div class="activity-detail" id="collapseDetail-${cnt}">
                        <div class="activity-detail-title">${activity.title}</div>
                        <div class="activity-detail-intro">${activity.intro}</div>
                        <div class="activity-detail-description">${activity.description}</div>
                        <button class ="activity-show-reservation" type="button">Reserveer</button>
                    </div>
                </div>
                <div class="activity-reservation">
                    <form>
                        <input type="hidden" name="activityCalendarId" value="${activity.id}" />
                        
                        <div>
                            <fieldset class="reservation-firstname">
                                <label for="mhwp-ipso-firstname-${cnt}">Voornaam</label>
                        <span class="required">*</span>
                        <input type="text" id="mhwp-ipso-firstname-${cnt}" name="firstName" required placeholder="" />
                    </fieldset>
                    <fieldset class="reservation-prefix">
                        <label for="mhwp-ipso-prefix-${cnt}">Tussenvoegsel</label>
                        <input type="text" id="mhwp-ipso-prefix-${cnt}" name="lastNamePrefix" placeholder="" />
                    </fieldset>
                    <fieldset class="reservation-lastname">
                        <label for="mhwp-ipso-lastname-${cnt}">Achternaam</label>
                        <span class="required">*</span>
                        <input type="text" id="mhwp-ipso-lastname-${cnt}" name="lastName" required placeholder="" />
                    </fieldset>
                    <fieldset class="reservation-telephone">
                        <label for="mhwp-ipso-telephone-${cnt}">Telefoonnummer</label>
                        <input type="tel" id="mhwp-ipso-telephone-${cnt}" name="phoneNumber" placeholder="" />
                        <span class="validity"></span>
                    </fieldset>
                    <fieldset class="reservation-email">
                        <label for="mhwp-ipso-email-${cnt}">Emailadres</label>
                        <span class="required">*</span>
                        <input type="email" id="mhwp-ipso-email-${cnt}" name="email" required placeholder="" />
                        <span class="validity"></span>
                    </fieldset>
                    <div>
                        <!-- @see https://stackoverflow.com/questions/5985839/bug-with-firefox-disabled-attribute-of-input-not-resetting-when-refreshing  -->
                        <button class="activity-submit-reservation" type="submit" autocomplete="off">Reserveer</button>
                    </div>
                </div>
            </form>
        </div>

    </li>`;
}

export default template;
