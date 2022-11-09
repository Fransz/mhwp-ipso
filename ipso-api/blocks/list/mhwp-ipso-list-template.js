function template(activity, cnt, light_dark) {
    return `
           <li class="activity list-group-item list-group-item-${light_dark }">
            <div class="row lead">
                <div class="col-md-8">
                    <span>${activity.title}</span>
                    <span>${activity.date}</span>
                    <span>${activity.time}</span>
                    ${activity.img ? activity.img : ''}
                </div>
                <div class="col-md-4">
                    <button class="pull-right btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseExample_${cnt}" aria-expanded="false" aria-controls="collapseExample">
                        Lees meer
                    </button>
                    <button class="pull-right btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseReserveer_${cnt}" aria-expanded="false" aria-controls="collapseReserveer">
                        Reserveer
                    </button>
                </div>
            </div>
            
            <div class="collapse reserveer" id="collapseReserveer_${cnt}">
                <form class="form-horizontal">
                    <input type="hidden" name="activityCalendarId" value="${activity.id}">
                        <div class="form-group">
                            <fieldset class="col-md-4">
                                <label for="mhwp_ipso_voornaam_${cnt}">Voornaam</label>
                                <span class="required">*</span>
                                <input type="text" class="form-control" id="mhwp_ipso_voornaam_${cnt}" name="firstName" required placeholder="">
                            </fieldset>
                            <fieldset class="col-md-4">
                                <label for="mhwp_ipso_tussenvoegsel_${cnt}">Tussenvoegsel</label>
                                <input type="text" class="form-control" id="mhwp_ipso_tussenvoegsel_${cnt}" name="lastNamePrefix" placeholder="">
                            </fieldset>
                            <fieldset class="col-md-4">
                                <label for="mhwp_ipso_achternaam_${cnt}">Achternaam</label>
                                <span class="required">*</span>
                                <input type="text" class="form-control" id="mhwp_ipso_achternaam_${cnt}" name="lastName" required placeholder="">
                            </fieldset>
                        </div>
                        <div class="form-group">
                            <fieldset class="col-md-4">
                                <label for="mhwp_ipso_telefoon_${cnt}">Telefoonnummer</label>
                                <input type="tel" class="form-control" id="mhwp_ipso_telefoon_${cnt}" name="phoneNumber" placeholder="">
                                    <span class="validity"></span>
                            </fieldset>
                            <fieldset class="col-md-4">
                                <label for="mhwp_ipso_email_${cnt}">Emailadres</label>
                                <span class="required">*</span>
                                <input type="email" class="form-control" id="mhwp_ipso_email_${cnt}" name="email" required placeholder="">
                                    <span class="validity"></span>
                            </fieldset>
                            <div class="col-md-4">
                                <button type="submit" class="pull-right right btn btn-default">Reserveer</button>
                            </div>
                        </div>
                </form>
            </div>
        </li>`;
}

export default template;
