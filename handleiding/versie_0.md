## beheerschermen.
Er zijn een aantal beheerschermen voor de agenda en het agenda systeem. Je vind ze op het dashboard. In de linker
zijbalk staat een knop 'Marikenhuis' [plaatje]. Als je daarop klikt kom je op een van vijf beheerschermen.

### instellingen 
Op het eerste scherm moet je de api sleutels, die nodig zijn vor de communicatie tussen de wordpress installatie en het
ipso systeem instellen. Je kan die api sleutels genereren in ipso.community en knippen en plakken naar de wordpress 
installatie. ZOnder deze sleutels functioneerd het systeem niet.

Op deze pagina kan je ook instellen of de agenda en de agenda knoppen communiceren met het ipso testsysteem of met het
ipso live systeem. Deze instelling geld voor alle agenda knoppen en agenda's op de site ineens.

### Emails

### afwijkende reserveringen.
Zelfs als een activiteit in ipso aangemerkt is om op de site getoont te worden, kan het nog zo zijn dat we niet willen
dat ipso.community de reserveringen verwerkt. Bijvoorbeeld als de reservering direct via de activiteiten begeleiders loopt (per mail) of als
de activiteit ergens anders plaats vind. De plugin geeft de mogelijkheid per activiteitstype aan te geven dat een reservering niet door 
het ipso systeem verwerkt moet worden. Bij zo een uitzondering moet je een URL opgeven. Als de gebruiker dan op de
reserveerknop voor de activiteit klikt, wordt hij omgeleid naar de betreffende URL. Die URL kan leiden naar een aanmeld
formulier, op de site zelf, of eventueel in limequery.

Uitzonderen van reserveringen is ook zinvol als voor de activiteit niet afgesproken is hoe reserveringen in het ipso systeem verwerkt worden. 
Je kan met deze uitzonderingen het systeem van reserveringen in ipso langzaam invoeren.


### afwijkende reserveringen.
Een afwijkende reservering stel je in op het tweede beheerscherm. Je geeft de activiteits id op van de activiteit
waarvan je reserveringen niet via ipso.community wilt behandelen. Daarnaast moet je een URL opgeven waar die reserveringen
dan wel behandeld worden. Meestal zal dat een formulier op de website zijn. Maar in vooorkomende gevallen kan je doorverwijzen naar een
externe site.

Alle agenda knoppen die betrekking hebben op een activiteit en het opgegeven id, leiden de gebruiker naar de opgegeven
URL na een klik op de knop. Je kan niet een activiteit op alleen een specifieke dag omleiden. De uitzonderingen werken
met activiteits id. Om te weten wat de activiteits id is van de activiteit die je wilt uitzonderen is er het
instelscherm activiteiten.

### email adressen.
Het ipso systeem stuurt wel een mail naar degene die reserveert, maar niet naar de begeleiders die de activiteiten
geven. De agenda knoppen zorgen daar dan maar voor. Om in te stellen wie zo'n mail ontvangt dient dit scherm.
Op het scherm kan je weer aangeven voor welke activiteit er gemaild moet worden, weer met de id van de activiteit. Daarnaast
moet je instellen naar wie er gemaild wordt. Je kan meerdere email adressen opgeven door ze met een komma te scheiden.
Je vind de id van de activiteit weer in het beheerscherm activiteiten.
De mail die verstuurt heeft vertelt de activiteiten begeleider dat er een inschrijving is voor de activiteit met de titel
en datum en tijd van activiteit. Daarnaast worden de gegevens die de bezoeker opgegeven heeft vermeld. De inhoud van
deze mail is niet in te stellen.

### activiteiten
Om de uitzonderingen op de reserveringen, en de mail adressen in te stellenn heb je de id van de activiteit nodig. Die
zie je niet in het ipso systeem. Op dit beheerscherm worden ze zichtbaar gemaakt. Kies een dag, en je ziet van alle
activiteiten op die dag de titel, de activiteit id en de agenda id. 

#### activiteits id - agenda id
Er is binnen dit systeem sprake van 2 id's, dat kan erg verwarrend zijn.

- De activiteits id. Dat is de id de activiteit zelf. Bijvoorbeeld de nieuwe activiteit 'Fietsen in het goffert park'
  heeft id 6. Alle bijeenkomsten van deze activiteit (we gaan wekelijks een rondje maken, behalve op hemelvaartsdag) hebben dit id.

- De agenda id. Dat is de id van een specifieke bijeenkomst van de activiteit. Elke bijeenkomst heeft z'n eigen agenda
  id, zelfs als er 2 bijeenkomsten van de activiteit op een dag zijn. De agenda id van ons rondje fietsen op 20 maart is
  12533, die van de bijeenkomst op 27 maart is 12551 en op hemelvaartsdag is er geen agenda id want dan gaan we niet
  fietsen.

De activiteits id gebruiken we om uitzonderingen op reserveringen en mail adressen vast te leggen. Die uitzonderingen en
mail instelling gelden dan voor alle bijeenkomsten van de activiteit.
De agenda id gebruiken we om de agenda knop op een pagina te zetten. Een reservering wordt dan gemaakt bij die
specifieke bijeenkomst van de activiteit. Bijvoorbeeld voor het rondje fietsen op 20 maart.

### log scherm
Het laatste beheerscherm is een log scherm. Daarop kan je zien of er reserveringen gemaakt zijn, met welke gegevens en
vanaf welk ip adres. Ook kan je zien waarheen het systeem mailt.
