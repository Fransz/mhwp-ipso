# Handleiding agenda en agenda knoppen

Op de site is een plugin geinstalleerd, met behulp van die plugin kun je op een pagina of in een post een agenda knop, of de hele agenda zetten. Die agenda knop en die agenda communiceren met het ipso systeem. Bezoekers van de website kunnen via de agenda en de agenda knoppen een plaats bij een activiteit reserveren. De agenda haalt uit het ipso systeem alle geplande activiteiten en maakt die zichtbaar. De agenda knop toont alle geplande bijeenkomsten van een specifieke activiteit.

## Werking

### Werking agenda knop.

De agenda knop kun je in een post zetten. De knop haalt uit het IPSO systeem alle bijeenkomsten van een specifieke activiteit die de komende 28 dagen plaatsvinden met een maximum van 6 activiteiten. Als er bij een bijeenkomst geen plaatsen meer zijn wordt die bijeenkomst uit het lijstje geschrapt.
Als een gebruiker op een agenda knop klikt, verschijnt er een formulier. Daarop kan de gebruiker zijn gegevens invullen en aangeven voor welke bijeenkomst hij zich wil inschrijven. Na inschrijving verschijnt er een melding en krijgt de inschrijver een bevestigings mail. Er kan ook naar begeleiders een mail gestuurd worden. Na een paar seconden verdwijnt dan het formulier weer.
Als er iets mis gaat met de inschrijving krijgt de gebruiker een melding. Als er van de 6 bijeenkomsten die gevonden werden de komende 28 dagen, geen enkele is waarbij een open plaats is, verschint er ook een melding. Het formulier verschijnt dan niet.


### Werking agenda.

De agenda laat een lijst zien van alle bijeenkomsten van alle activiteiten in de komende 28 dagen. Er verschijnt een lijst met de titel, de dag en het tijdstip van de activiteit. Onder elke activiteit staat een knop 'Lees meer'. Als een gebruiker daarop klikt verschijnt er een formulier met meer informatie over de activiteit. Daarnaast staat dan weer een formulier om je in te schrijven.
In de agenda kan je steeds een week voor- of achteruit bladeren. Een activiteit die meerder bijeenkomsten verzorgt op
dezelfde dag verschijnt slechts eenmaal (voor die dag) in de lijst. Op het formulier kan je dan aangeven voor welke
bijeenkomst je je precies wilt inschrijven.

## Wordpress blocks

De agenda en de agenda knoppen, zijn zogenaamde wordpress blocks. Je kan ze alleen op een pagina of in een bericht zetten met de wordpress block editor. De knoppen zijn net zo toe te voegen als alle andere wordpress blocks. Kies het juiste blok, ipso-list of ipso-button uit de lijst. 
Een agenda block kent géén instellingen. Voor een agenda knop block moet je het activiteit Id van de activiteit waar de knop voor werkt opgeven.

## Instellingen

### Instellingen ipso community

In het IPSO systeem moet je bij de definitie van activiteiten de juiste instellingen maken om de activiteit met de agenda, of de agenda knop zichtbaar te maken op de website. 
Op het tabblad algemeen kan je een titel, intro, beschrijving en een afbeelding van een activiteit opgeven. Deze worden in de popup van de agenda op de website getoont. Het vinkje 'In widgets en API opnemen' moet aan staan. Het vinkje 'actief' bepaalt of de activiteit in IPSO gepland kan worden, maar als eenmaal gepland maak deze instelling niet meer uit. 
Op het tabblad aanmelden moet je opgeven wat het aantal deelnemers aan een activiteit is. Als dat aantal bereikt is
Op het tabblad email tenslotte kanje de inhoud van de mail die naar een gast gestuurd wordt opgeven. De email die
verstuurd wordt is de 'Website inschrijf mail'. Andere mails op deze pagina gaan over andere situaties en zijn niet
nodig.
Tenslotte moet de activiteit nog in de IPSO agenda gepland zijn om op de website te verschijnen.
Het IPSO systeem is nog in otwikkeling. De vinkjes 'Inschrijving Open' of 'Gebruik Wachtlijst' lijken voor de agenda en
de agenda knop niet te werken.

Om het IPSO systeem met de wordpress plugin te laten samen werken moet je in IPSO zogenaamde API sleutels genereren. Die
vind je via het zijmenu van IPSO. Onder beheer activiteiten, en dan de optie widgets en api. Op de pagina die dan opent
klik je op het plusje om een nieuwe sleutel toe te voegen. Het type van de sleutel is Privé (voor een API). Je kan de
sleutel een naam geven. Als je de test omgeving van IPSO wilt gebruiken moet je daar ook een api sleutel genereren.

### Instellingen plugin

In de backend van wordpress kan je instellingen voor de agenda en de agenda knop maken. Dat gaat met het menu item 'Marikenhuis' in het wordpress zijbalk menu. Als je daar op klikt kom je op de instellingen pagina. je ziet daar 5 tabblaadjes waarop je verschillende instellingen kan maken.

#### tab instellingen

Op de eerste tab 'instellingen' kan je de API key die IPSO verlangt instellen. Er is hier ruimte om een API sleutel op te geven voor de live omgeving, en voor de test omgeving. 
Met het schuifje bovenaan kan je kiezen met welke IPSO omgeving de plugin communiceer. Als het schuifje naar links staat
(uit), communiceert het systeem met de live omgeving. Dat is wat je meestal wilt. Allen bij ontwikkeling wil je de test
omgeving gebruiken.

#### tab afwijkende reserveringen

Op deze tab kan je van activiteiten aangeven hoe het reserveringsformulier eruit ziet. Er zijn 3 mogelijkheden.
Als je hier geen instellingen maakt ziet het formulier er normaal uit. De titel en beschrijving van de activiteit met een invulformulier en een knop reserveer.
Als je voor een bepaalde activiteit een URL opgeeft, verlopen reserveringen niet meer via het IPSO systeem, maar leid een klik op de reserveerknop de bezoeker naar de opgegeven URL. Het inschrijfformulier in de popup is verdwenen. Er staat naast de beschrijving van de activiteit alleen nog een reserveer knop. Dit kan handig zijn als de activiteit niet in het Marikenhuis plaatsvind maar bijvoorbeeld in de Lindenberg.
De laatste mogelijkheid is het vinkje verberg reserverig aanvinken (je moet nog steeds een URL opgeven, die wordt genegeerd). In dat geval verschijnt in de popup ook de reserveer knop niet meer. De gast kan dan niet reserveren. Dat lijkt wat onzinnig, maar kan handig zijn als er een activiteit plaatsvind waarvoor je niet hoeft te reserveren. Met dit vinkje aan kan je de activiteit dan toch opnemen in de agenda.
Let op: de instellingen op dit tabblad gelden alleen voor de agenda. De popup van de agendaknop blijft er altijd hetzelfde utizien. Op een nieuws pagina kan je dezelfde functionaliteit eenvoudig opnemen door niet de agenda knop te gebruiken maar een standaard wordpress knop.


#### tab email adressen

Op de tab email adressen kan je instellen naar welke begeleiders er een mail gestuurd moet worden als een gast gereserveerd heeft. Het IPSO systeem mailt naar de gasten, de plugin mailt naar de begeleider en/of coordinatoren. Om te kunnen mailen heeft de plugin wel email adressen nodig, die kan je hier invullen. Email adressen hangen samen met activiteiten. We mailen alleen die email adressen die opgegeven zijn voor de activiteit waarvoor ingeschreven wordt.
Toevoegen van een email adres voor een activiteit gaat eenvoudig door de id van een activiteit op te geven, en het email
adres. Als je meerdere mails wilt sturen geef je meerdere emailadressen op gescheiden door een komma. Met een klik op de
save knop worden de email adressen opgeslagen en verschijnen in de lijst. Achter elke activiteit in de lijst vind je de
knoppen edit en delete. Met delete verwijder je de opgeven email adressen voor die activiteite. Met edit kan je de email adressen aanpassen.
Als je een activiteit id opgeeft wat al in de lijst staat, worden de emailadressen uit de lijst over schreven.

#### tab activiteiten

Op verschillende plekken heeft de plugin de id van een activiteit nodig. Om te bepalen wie er gemaild wordt, om te
bepalen hoe het inschrijf formulier eruit ziet (tab afwijkende reserveringen) en om op te geven voor welke activiteit de
agenda knop reserveerd. Die activiteit ids zijn niet zomaar in IPSO te vinden. De plugin bied daarom de mogelijkheid ze
op te zoeken. Dat gebeurd op het tabje activiteiten.
Als je een activiteit id nodig heb weet je over het algemeen wel op welke datum die activiteit plaatsvind. Geef die
datum op in hte invulvakje. Na een klik op 'toon' verschijnt er een lijst met alle activiteiten op die dag. Bij elke
activiteit vind je de activiteit id (in de 2e kolom). Die kan je nu gebruiken om te bepalen welke begeleider er gemaild
moet worden, of voor welke activiteit de agenda knop werkt.

#### tab log

Het laatste tabblad is een log. Elke verzoek om informatie aan de wordpress plugin wordt hier gelogd. Dat kan handig
zijn als er wat mis gaat. Het is vooral van belang als er gemaild wordt naar begeleiders. Als dat niet goed gaat wordt
er hier een melding opgenomen (inclusief emailadressen). Als mailen wel lukt worden de email adressen niet getoond. Het
log bestand is altijd maximaal 1000 regels groot.
