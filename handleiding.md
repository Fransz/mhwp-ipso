# handleiding agenda en agenda knoppen

Op de site is een plugin geinstalleerd, met behulp van die plugin kun je op een pagina of in een post een agenda knop,
of de hele agenda zetten. Die agenda knop en die agenda communiceren met het ipso systeem. Bezoekers van de website
kunnen via de agenda en de agenda knoppen een plaats bij een activiteit reserveren. De agenda haalt uit het ipso systeem
alle geplande activiteiten en maakt die zichtbaar.

## Werking agenda knop.

Als een gebruiker op een agenda knop klikt, verschijnt er een formulier. Als de gebruiker daarop ziijn gegevens invult,
en op de knop reserveer klikt, wordt er een opdracht naar het ipso systeem gestuurd. Als het systeem de
reserveringsopdracht uitgevoerd heeft, krijgt de bezoeker een melding te zien. 'Er is een plaats voor u gereserveerd. U
ontvangt een email'. Het systeem stuurt ook een email naar het opgegeven email adres. De melding verdwijnt na 5 seconde.
Als de gebruiker een verplicht veld vergeet in te vullen, of een ongeldig telefoonnummer of email adres opgeeft
verschijnen er foutmeldingen. De gebruiker krijgt ook een foutmelding te zien als het ipso systeem niet beriekt kon
worden, of de reservering niet kon verwerken.
als de activiteit vol is, dan verschijnt de agenda knop niet, maar ziet de gebruiker een melding 'xxx'

## Werking agenda.

De agendna laat een lijst zien van activiteiten. Er verschijnt een lijst met de titel, de dag en het tijdstip van de
activiteit. Onder elke activiteit staat een knop 'Lees meer'. Als een gebruiker daarop klikt verschijnt er een scherm
met meer informatie over de activiteit. Onder die informatie staat weer een knop 'Reserveer'. De knop werkt precies
zoals de agenda knop, hierboven beschreven.
Boven de agenda ziet de bezoeker de periode van de agenda die getoond wordt, en een knoppen om een week vooruit of
achteruit te bladeren. Daarnoven nog staan knoppen waarmee bezoekers zich  kunnen inschrijven voor activiteiten die
expliciet in de agenda staan, bijvoorbeeld lotgenotengroepen of spreekuren.

## wordpress blocks

De agenda en de agenda knoppen, zijn zogenaamde wordpress blocks. Je kan ze alleeen op een paginga of in een bericht
zetten met de block editor. De knoppen zijn toe te voegen als alle andere wordpress blocks. Kies het juiste blok,
ipso-list of ipso-button uit de lijst. [plaatje]

De agenda kent een instelling, het aantal dagen dat zichtbaar wordt.

Voor de agenda knop moet je instellen op welke activiteit de knop betrekking heeft. Dat doe je door de datum waarop de
activiteit plaatsvind op te geven en daarnaast of de agenda id van de activiteit of de titel van de activiteit. De
agenda id van een activiteit vind je in een van de beheer schermen. De titel kan je ook uit het ipso systeem halen.

## ipso community

Niet alle activiteiten uit de ipso agenda zie je terug op de website. Alleen activiteiten waarbij de instelling xxx op
xxx staat worden getoond. Bij de activiteiten kan jop geven of er een mail gestuurd moet worden naar de gebruiker na
inschrijving, en hoeveel deelnemers er aan een activiteit deel kunnen nemen, de agenda knoppen houden daar rekening mee.

De titel, tijdstip, de korte en lange beschrijving, en het plaatje van de activieit moeten ook in ipso community
ingesteld worden.

## beheer schermen.
Er zijn een aantal beheer schermen voor de agenda en het agenda systeem. Je vind ze op het dashboard, in de linker
zijbalk staat een knop 'Mariekenhuis' [plaatje]. Als je daarop klikt kom je op een van vijf beheer schermen.

### algemeen [xxx juiste naam]
Op het eerste scherm moet je de api sleutels, die nodig zijn vor de communicatie tussen de twee systemen instellen. Je
kan die api sleutels genereren in ipso.community en knippen en plakken naar de wordpress installatie. ZOnder deze
sleutels functioneerd het systeem niet.

Op deze pagina kan je ook instellen of de agenda en de agenda knoppen communiceren met het ipso testsysteem of met het
live systeem. Deze instelling geld voor alle agenda knoppen en agenda's op de site.

### afwijkende reserveringen.
Zelfs als een activiteit in ipso aangemerkt is om op de site getoont te worden, kan het nog zo zijn dat we niet willen
dat het ipso community de reserveringen verwerkt. Bijvoorbeeld als de reservering direct via de activiteiten begeleiders loopt of als
de activiteit ergens anders plaats vind. Uitzonderen van reserveringen is ook zinvol als voor de activiteit niet
afgesproken is hoe reserveringen in het ipso systeem verwerkt worden. Je kan met deze uitoznderingen het systeem van
reserveringen in ipso langzaam invoeren.

Een afwijkende reservering stel je in op het tweede beheer scherm. Je geeft de activiteits id op van de activiteit
waarvan je reserveringen anders behandelt. Daarnaast moet je een URL opgeven waar die reservering dan wel gemaakt kan
worden, meestal zal dat een formulier op de website zijn. Maar in vooorkomende gevallen kan je doorverwijzen naar een
externe site.

Alle agenda knoppen die betrekking hebben op een activiteit en het opgegeven id, leiden de gebruiker naar de opgegeven
URL na een klik op de knop. Je kan niet een activiteit op alleen een specifieke dag omleiden. De uitzonderingen werken
met activiteits id. Om te weten wat de activiteits id is van de activiteit die je wilt uitzonderen is er het
instelscherm xxx.

### mail adressen.
Het ipso systeem stuurt wel een mail naar degene die reserveert, maar niet naar de begeleiders die de activiteiten
geven. De agenda knoppen doen dat dan maar. Om in te stellen wie zo'n mail ontvangt dient dit scherm.
Op het scherm kan je weer aangeven voor welke activiteit er gemaild moet worden, weer met de id van de activiteit. Daarnaast
moet je instellen naar wie er gemaild wordt. Je kan meerdere email adressen opgeven door ze met een komma te scheiden.
Je vind de id van de activiteit weer in het instel scherm xxx.
De mail die verstuurt heeft vertelt de activiteiten begeleider dat er een inschrijving is voor de activiteit met de titel
en datum en tijd van activiteit. Daarnaast worden de gegevens die de bezoeker opgegeven heeft vermeld. de inhoud van de
mail is niet in t4e stellen.

### xxx
Om de uitzonderingen op de reserveringen, en de mail adressen in te stellenn heb je de id van de activiteit nodig. Die
staan zie je niet in het ipso systeem. Op dit scherm worden ze zichtbaar gemaakt. Kies een dag, en je ziet van alle
activiteiten op die dag de titel, de activiteit id en de agenda id

#### activiteits id - agenda id
Er is binnen dit systeem sprake van 2 id's, dat kan erg verwarrend zijn.

- De activiteits id. Dat is de id de activiteit zelf. Bijvoorbeeld de nieuwe activiteit 'Fietsen in het goffert park'
  heeft id 6. Alle bijeenkomsten van deze activiteit (we gaan wekelijks een rondje maken, behalve op hemelvaartsdag) hebben dit id.

- De agenda id. Dat is de id van een specifieke bijeenkomst van de activiteit. Elke bijeenkomst heeft z'n eigen agenda
  id, zelfs als er 2 bijeenkomsten van de activiteit op een dag zijn. De agenda id van ons rondje fietsen op 20 maart is
  12533, die van de bijeenkomst op 27 maart is 12551 en op hemelvaartsdag is er geen agenda id want dan gaan we niet
  fietsen.

De activiteits id gebruiken we om uitzonderingen op reserveringen en mail adressen vast te leggen. Die uitzonderingen en
mail instelling geld dan voor alle bijeenkomsten van de activiteit.
De agenda id gebruiken we om de agenda knop op een pagina te zetten. Een reservering wordt dan gemaakt bij die
specifieke bijeenkomst van een activiteit.

### log scherm
Het laatste beheerscherm is een log scherm. Daarop kan je zien of er reserveringen gemaakt zijn, met welke gegevens en
vanaf welk ip adres. Ook kan je zien waarheen het systeem mailt.
