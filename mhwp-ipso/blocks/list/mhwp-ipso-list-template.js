function template(activity, cnt, light_dark) {
    return `
           <li class="activity">
            <div>
                <div class="activity-header">
                    <span class="activity-header-title">${activity.title}</span>
                    <span class="activity-header-date">${activity.date}</span>
                    <span class="activity-header-time">${activity.time}</span>
                    ${activity.img ? activity.img : ''}
                </div>
                <div>
                    <button type="button">
                        Lees meer
                    </button>
                    <button type="button">
                        Reserveer
                    </button>
                </div>
            </div>
            
            <div class="reserveer">
                <form>
                    <input type="hidden" name="activityCalendarId" value="${activity.id}" />
                    
                    <div>
                            <fieldset>
                                <label for="mhwp_ipso_voornaam_${cnt}">Voornaam</label>
                                <span class="required">*</span>
                                <input type="text" id="mhwp_ipso_voornaam_${cnt}" name="firstName" required placeholder="" />
                            </fieldset>
                            <fieldset>
                                <label for="mhwp_ipso_tussenvoegsel_${cnt}">Tussenvoegsel</label>
                                <input type="text" id="mhwp_ipso_tussenvoegsel_${cnt}" name="lastNamePrefix" placeholder="" />
                            </fieldset>
                            <fieldset>
                                <label for="mhwp_ipso_achternaam_${cnt}">Achternaam</label>
                                <span class="required">*</span>
                                <input type="text" id="mhwp_ipso_achternaam_${cnt}" name="lastName" required placeholder="" />
                            </fieldset>
                        </div>
                        
                    <div>
                            <fieldset>
                                <label for="mhwp_ipso_telefoon_${cnt}">Telefoonnummer</label>
                                <input type="tel" id="mhwp_ipso_telefoon_${cnt}" name="phoneNumber" placeholder="" />
                                <span class="validity"></span>
                            </fieldset>
                            <fieldset>
                                <label for="mhwp_ipso_email_${cnt}">Emailadres</label>
                                <span class="required">*</span>
                                <input type="email" id="mhwp_ipso_email_${cnt}" name="email" required placeholder="" />
                                <span class="validity"></span>
                            </fieldset>
                            <div class="col-md-4">
                                <!-- @see https://stackoverflow.com/questions/5985839/bug-with-firefox-disabled-attribute-of-input-not-resetting-when-refreshing  -->
                                <button type="submit" autocomplete="off">Reserveer</button>
                            </div>
                        </div>
                </form>
            </div>
            
            <div class="activit_detail" id="collapseDetail_${cnt}">
                ${activity.img ? activity.img : ''}
                <div class="activity_detail_title">${activity.title}</div>
                <div class="activity_detail_intro">${activity.intro}</div>
                <div class="activity_detail_description">${activity.description}</div>
            </div>
        </li>`;
}

export default template;
