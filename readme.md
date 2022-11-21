# MHWP\_IPSO

## Releases

Release 0.2.2 - hotfix
- Make jQuery accessible in the frontend.;

Release 0.2.1 - Frontend;
- Zo sober mogelijke html;
- Drop dependency aan bootstrap;
- Deploy op server;

Release 0.2.0 - Frontend; 
- Datums, tijd, 
- Disable button zolang een reservering verwerkt wordt.
- Fout afhandeling promises
- Sorteer json in fe; 
- Probeer nog eens een fetch na een http 429 fout.

Release 0.1.0  - Initial release.

## Roadmap

Release 0.3.0 - Front-end en IPSO Button
- Juiste WP URL gebruiken in frontend. (localhost vs test.marikenhuis.nl vs marikenhuis.nl)
- Refactor fetchWpRest, it shouldnt throw on ipso api errors.
- IPSO Button;
- Common code in a seperate file;
- Different query parameters for GET activities;
- Notice 'geen activiteiten' if none where found.
- Renamed classes and ids in rendered html.

Release 0.4.0 - Backend;
- Nonces bij formulieren, en nieuwe na een reservering;
- Settings: API key; live <-> test knop; 
- Rest API Live <-> test uitlezen, Juiste API aanspreken , Image URL's aanpassen.
- LimeQuery URL's gekoppeld aan ActivityId's

Release 0.5.0 - Backend;
- Log
- IPSO informatie in backend (agendaId's activityId's)

Release 0.6.0 - Frontend Filter.
- Better user experience while loading the ipso-list.
- Fetch details after calendar, but what to do with the image
- A spinner on the calendar when we are still loading.
- Collapse activiteiten met meerdere tijdslots op dezelfde dag.

## Deployment

Je moet als je de plugin installeert niet vergeren de API key op tegevenin de backend.

### marikenhuis.nl/vrijwilligers

We willen de plugin soms op deze site installeren om te demonstreren.

#### Endpoints.
De vrijwilligers site draait in een subdirectory. Je moet de paden van de endpoints aanpassen.

#### Divi
Maar deze vrijwilligers site is gemaakt met divi, en kent niet zomaar bootstrap.

Oplossing (min of meer);

Voeg wat extra css toe om in iedergeval 'reserveer' en 'lees meer' in en uit te kunnen klappen.

    #mhwp-ipso-list-container .collapse.in  {
        display:block;
        overflow:hidden;
    }

    #mhwp-ipso-list-container .collapse  {
        display:none;
        overflow:hidden;
    }
