# NaWi geht’s? – Reihenübersicht für GitHub Pages

Diese Dateien sind für das Repository `nawigehts/reihe` gedacht.

## Das Wichtigste: Was muss ich später ändern?

Für den normalen Betrieb nur zwei Stellen:

1. **`daten/buecher.csv`** – hier stehen alle Bücher, Texte, Themen und Links.
2. **`assets/covers/`** – hier legst du die Coverbilder ab.

HTML, CSS und JavaScript musst du für ein neues Buch **nicht** verändern.

---

## Ein neues Buch hinzufügen

Öffne `daten/buecher.csv` am einfachsten in Excel, LibreOffice Calc oder einem Texteditor.

**Jede Zeile ist ein Buch.**

Kopiere die letzte Buchzeile, füge darunter eine neue ein und ändere z. B.:

- `nr` → `005`
- `titel` → Titel des Buches
- `autor` → Autor:in / Autor:innen
- `kurzbeschreibung` → ein kurzer Satz
- `themen` → Suchbegriffe, getrennt mit `|`, z. B. `Licht|Farben|Optik`
- `bild` → z. B. `005.jpg`
- die Link-Spalten → vollständige URLs

Die Reihenfolge auf der Website wird automatisch nach `nr` sortiert.

## Cover hinzufügen

Lege das Bild in `assets/covers/`, z. B.:

```text
assets/covers/005.jpg
```

In `daten/buecher.csv` genügt dann in der Spalte `bild`:

```text
005.jpg
```

Wenn kein Bild eingetragen ist oder die Datei nicht gefunden wird, erscheint automatisch ein Platzhalter.

## Material-Links

Alle Spalten, deren Name mit `link_` beginnt, werden automatisch als Button angezeigt.

Beispiele:

```text
link_Kaufen
link_PDF-Buch
link_Material_für_Lehrkräfte
link_Hörspiel
link_Ausführliche_Erklärung
```

Ist eine Zelle leer, wird der Button für dieses Buch nicht angezeigt.

Steht nur `#` in der Zelle, zeigt die Seite bewusst einen grauen Platzhalter „Link folgt“. Das ist für die jetzige Aufbauphase praktisch. Später einfach `#` durch die echte URL ersetzen oder die Zelle leeren.

### Einen völlig neuen Materialtyp hinzufügen

Einfach in der CSV eine **neue Spalte** ergänzen, deren Überschrift mit `link_` beginnt, zum Beispiel:

```text
link_Video
```

oder

```text
link_Experimente
```

Die Website erkennt die neue Spalte automatisch. Am HTML oder JavaScript musst du nichts ändern.

## Suche

Die Suche ist bereits eingebaut. Durchsucht werden unter anderem:

- Nummer
- Titel
- Autor:in
- Kurzbeschreibung
- Themen / Stichwörter

Die Spalte `themen` bleibt unsichtbar, wird aber von der Suchleiste mit durchsucht. So kannst du dort beliebig viele Suchbegriffe hinterlegen, ohne dass sie auf der Seite als eigene Liste erscheinen.

## Ansicht und Sortierung

Besucher können zwischen **Kacheln** und **Liste** sowie zwischen **Aufsteigend** und **Neueste zuerst** umschalten. Beides wird im Browser gespeichert. Die Kachelansicht nutzt auf breiten Bildschirmen automatisch drei oder vier Spalten, wenn genug Platz vorhanden ist.

## Logos ändern

Nur falls du die Logos später ersetzen möchtest:

```text
assets/logos/nawi-gehts.png
assets/logos/ovgu-fnw.png
```

Wenn die Dateinamen gleich bleiben, ist keine weitere Änderung nötig.

## GitHub Pages veröffentlichen

1. Den **Inhalt dieses Ordners** in das Repository `nawigehts/reihe` hochladen.
2. In GitHub `Settings` → `Pages` öffnen.
3. Als Quelle den Branch `main` und den Ordner `/ (root)` wählen.
4. Nach der Veröffentlichung ist die Seite typischerweise erreichbar unter:

```text
https://nawigehts.github.io/reihe/
```

und direkt unter:

```text
https://nawigehts.github.io/reihe/home.html
```

`index.html` leitet automatisch auf `home.html` weiter.

## Lokal testen

Die Seite lädt die CSV-Datei per JavaScript. Manche Browser blockieren das, wenn `home.html` nur per Doppelklick als lokale Datei geöffnet wird.

Am zuverlässigsten testest du über GitHub Pages. Alternativ kannst du im Projektordner einen kleinen lokalen Webserver starten, z. B. mit Python:

```bash
python -m http.server 8000
```

Danach im Browser `http://localhost:8000/home.html` öffnen.

## Technischer Aufbau

```text
reihe/
├── home.html              Startseite
├── index.html             Weiterleitung auf home.html
├── daten/
│   └── buecher.csv        <- im Alltag hauptsächlich diese Datei bearbeiten
├── assets/
│   ├── covers/            <- hier Cover ablegen
│   └── logos/             Logos
├── css/
│   └── styles.css         Darstellung
└── js/
    └── app.js             Suche, CSV, Kachel-/Listenansicht
```
