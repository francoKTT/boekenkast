# Handleiding boekenkast ON4AUB

Deze website toont je boeken. De lijst zelf staat in een **Google Sheet** (een online rekenblad).
Pas je de sheet aan, dan past de website zich vanzelf aan. Je hoeft nooit iets aan de website zelf te veranderen.

---

## Eenmalig: de Google Sheet opzetten (10 minuten)

### Stap 1. Maak de sheet aan
1. Ga naar **sheets.google.com** en log in met je Gmail-account (frvdb82@gmail.com).
2. Klik linksboven op het grote **+** (Leeg rekenblad).
3. Klik bovenaan op "Naamloze spreadsheet" en typ als naam: **Boekenkast ON4AUB**.

### Stap 2. Zet je huidige boeken erin
1. Download het bestand **`data/boeken.csv`** uit deze repo
   (open het bestand op GitHub en klik rechtsboven op het pijltje "Download raw file").
2. In je Google Sheet: menu **Bestand > Importeren**.
3. Kies het tabblad **Uploaden** en sleep `boeken.csv` erin.
4. Kies bij "Importlocatie": **Huidige spreadsheet vervangen** en klik **Gegevens importeren**.
5. Je ziet nu alle 160 boeken, met bovenaan de kolomnamen.

> Verander de **kolomnamen in rij 1 niet**. De website zoekt naar precies deze namen:
> `categorie`, `titel`, `auteur`, `uitgever`, `isbn`, `prijs`, `foto`, `verkocht`

### Stap 3. Publiceer de sheet als CSV
1. Menu **Bestand > Delen > Publiceren op internet**.
2. In het eerste keuzelijstje: kies het tabblad (meestal **Blad1**).
3. In het tweede keuzelijstje: kies **Door komma's gescheiden waarden (.csv)**.
4. Klik **Publiceren** en bevestig met **OK**.
5. Je krijgt een link die eindigt op `output=csv`. **Kopieer die link.**

### Stap 4. Koppel de link aan de website
1. Open in deze repo het bestand **`config.js`**.
2. Klik op het potloodje (Edit) rechtsboven.
3. Plak je link tussen de aanhalingstekens bij `sheetCsvUrl`, zo:
   `sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/....../pub?output=csv",`
4. Klik onderaan of rechtsboven op **Commit changes**.
5. Na 1 à 2 minuten haalt de website zijn boeken uit je sheet.

Dit doe je maar één keer.

---

## Dagelijks gebruik

### Een boek toevoegen
Ga in je sheet naar de eerste lege rij onderaan en vul in:

| kolom | wat typ je | voorbeeld |
|---|---|---|
| categorie | een van de rubrieken (zie onder) | Radio & antennes |
| titel | de titel | Yagi antenna design |
| auteur | schrijver, mag leeg | James Lawson |
| uitgever | uitgeverij, mag leeg | ARRL |
| isbn | mag leeg | 0-87259-041-0 |
| prijs | enkel het getal, met komma | 4,50 |
| foto | link naar een foto, mag leeg | |
| verkocht | leeg laten | |

Google bewaart automatisch. De website toont het boek binnen enkele minuten
(Google ververst gepubliceerde sheets met wat vertraging, dat is normaal).

**Prijs leeg laten** = de website toont "Prijs op aanvraag".

### Een boek als verkocht markeren
Typ **ja** in de kolom `verkocht`. Het boek blijft zichtbaar, maar grijs met "Verkocht",
en niemand kan het nog in zijn mandje leggen.
Wil je het helemaal weg? Klik met de rechtermuisknop op het rijnummer links en kies **Rij verwijderen**.

### Een prijs aanpassen
Klik op het vakje in de kolom `prijs`, typ het nieuwe bedrag, druk Enter. Klaar.

### Rubrieken
Gebruik bij voorkeur een van deze (exact zo geschreven, dan krijgen ze hun eigen kleur):
- Radio & antennes
- Elektronica
- Microcontrollers & Arduino
- Computers & software
- Werkplaats & techniek
- Geschiedenis & varia

Typ je een nieuwe rubriek, bv. "Tuin", dan verschijnt die gewoon als extra knop op de website.

### Foto's van de boeken
De website zoekt **automatisch** een omslag op via het ISBN-nummer (bij Open Library, een gratis online bibliotheek).
Vindt hij er geen, dan tekent de website zelf een nette omslag met de titel in de kleur van de rubriek.
Bij oudere Nederlandstalige boeken zal dat vaak het geval zijn.

De 172 foto's van je oude Lovable-site staan al in de map `fotos/` en zijn gekoppeld.

**Nieuwe foto toevoegen, manier A (via GitHub, aanrader):**
1. Neem met je gsm een foto van de voorkant en geef hem een korte naam, bv. `yagi.jpg`.
2. Open de repo op github.com, klik op de map **fotos**.
3. Klik rechtsboven op **Add file > Upload files**, sleep je foto erin en klik **Commit changes**.
4. Typ in de sheet in de kolom `foto`: `fotos/yagi.jpg`

**Nieuwe foto toevoegen, manier B (via Google Drive):**
1. Neem met je gsm een foto van de voorkant.
2. Zet de foto in je **Google Drive** (in de Drive-app: + > Uploaden).
3. In Google Drive: rechtermuisklik op de foto > **Delen** > zet "Algemene toegang" op **Iedereen met de link**.
4. Kopieer de link. Die ziet eruit als `https://drive.google.com/file/d/ABC123/view?usp=sharing`.
5. Neem het stuk tussen `/d/` en `/view` (hier `ABC123`) en plak in de kolom `foto`:
   `https://drive.google.com/thumbnail?id=ABC123&sz=w600`

---

## Hoe komen bestellingen binnen?
Een bezoeker legt boeken in zijn mandje en klikt **Bestel per mail**.
Zijn mailprogramma opent met een kant-en-klare mail naar jou met de lijst, de prijzen en zijn naam.
Jij antwoordt gewoon zoals bij elke andere mail.

## Iets anders aanpassen?
In **`config.js`** staan je naam, roepnaam, e-mailadres en de tekst over betaling en levering.
Pas aan via het potloodje, net zoals bij stap 4.

## Als de sheet even niet bereikbaar is
Dan toont de website automatisch de reservelijst uit `data/boeken.js`, zodat de site nooit leeg is.
