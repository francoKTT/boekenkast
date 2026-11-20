# ON4AUB Boekenkast

Tweedehands technische boeken uit de kast van ON4AUB: radio, antennes, elektronica, microcontrollers en meer.

- Statische website (HTML, CSS, JavaScript), geen server of database nodig
- Boekenlijst komt uit een gepubliceerde Google Sheet (CSV)
- Bezoekers leggen boeken in een mandje en bestellen per e-mail

**Boeken beheren?** Lees [HANDLEIDING.md](HANDLEIDING.md).

## Bestanden
| bestand | doel |
|---|---|
| `index.html`, `style.css`, `app.js` | de website |
| `config.js` | naam, e-mail, link naar de Google Sheet |
| `data/boeken.csv` | startlijst om in Google Sheets te importeren |
| `data/boeken.js` | reservelijst als de sheet niet bereikbaar is |

## Online zetten met GitHub Pages
1. Repo > **Settings** > **Pages**
2. Bij "Source": **Deploy from a branch**
3. Branch **main**, map **/ (root)**, klik **Save**
4. Na een minuut staat de site op `https://<gebruiker>.github.io/<repo>/`

73 de ON4AUB
