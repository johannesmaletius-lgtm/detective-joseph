# Detective Joseph

2D-Point-and-Click-Adventure im Browser (HTML5 Canvas, reines JavaScript, keine Frameworks).

**Stand: Alle 24 Wagen von „Die Ringbahn“ sind spielbar** (Planung in
[`docs/planung.md`](docs/planung.md), Erzählung in [`docs/geschichte.md`](docs/geschichte.md)).
Alle Hintergründe, Figuren und Fotos ab Wagen 2 sind die ChatGPT-Bilder aus `assets/reference/`. Zum Ausprobieren
alle Türen öffnen: <http://localhost:8150/?test> (Lösungen: [Wagen 2, 3 und 17–24](#wagen-2-3-und-1724),
[Wagen 4–8](#wagen-48), [Wagen 9–16](#wagen-916)). **Wagen 1:** etwa 20 Minuten Rätsel, mit Geschichte, Tutorial und Tipps. Joseph wacht
in einem Nachtzug auf und weiß nicht, wie er hineingekommen ist. Auf seinem Unterarm steht in seiner eigenen
Schrift: *NICHT EINSCHLAFEN*. Ein Brief in seiner eigenen Handschrift verrät: Die Tür zum nächsten Wagen will
vier Zahlen – und ein früherer Joseph hat sie dort versteckt, wo der Tunnel sie nicht löschen kann. Die
Geschichte folgt Vorschlag 1 („Ringbahn“) aus [`docs/story-ideen.md`](docs/story-ideen.md).

Die Rätsel im ersten Abteil (Lösung weiter unten):

- **Zerrissener Fahrplan:** sechs Papierfetzen im Abteil finden und mit der Maus zusammensetzen
- **Rätselheft und Koffer:** ein halb gelöstes Zahlenquadrat ergibt die drei Ziffern für das Kofferschloss
- **Fernglas und Turm:** das rote Turmlicht blinkt eine Ziffer – die Tabelle dazu steht auf dem Fahrplan
- **Verteilerkasten:** Kabelstücke drehen, bis das Bild der Tunnelkamera auf dem Bildschirm erscheint
- **Die Zeitschleife:** Was Joseph im Abteil wegnimmt, ist nach dem Tunnel wieder da – so kommt er an eine
  zweite Batterie für die Taschenlampe
- **Im Dunkeln:** Im Tunnel geht das Licht aus; nur mit der Taschenlampe findet man die Kratzer in der Tür
- **Das Türschloss:** vier Rädchen, vier Zeichen – Tunnel, Laterne links, Laterne rechts, Turm

Der Zug fährt:
Vor den Fenstern zieht eine nächtliche Landschaft **mit Perspektive** vorbei (durch die hinteren Fenster
klein und langsam, durch die vorderen groß und schnell), Masten und Stämme rauschen von Fenster zu Fenster,
der Wagen rumpelt im Takt der Schienenstöße und wiegt sich in den Federn, die Lampen flackern, Laternenlicht
huscht durch den Wagen und der kleine Bildschirm zeigt schwarz-weißes Rauschen.

**Der Zug fährt im Kreis.** Wer genau hinsieht, merkt es: Der Mond wandert langsam von Fenster zu Fenster,
ein ferner Turm mit rotem Licht steht immer still im selben Fenster (er ist die Mitte des Kreises), die
Laternen kommen jede Runde an denselben Stellen, die Räder quietschen in der endlosen Kurve – und an der
Nahtstelle jeder Runde fährt der Zug durch einen Tunnel, in dem im Abteil das Licht ausgeht.

## Spiel starten

1. Terminal öffnen und in den Projektordner wechseln: `cd ~/detective-joseph`
2. Server starten: `npm start`
3. Im Browser öffnen: <http://localhost:8150>

Noch einfacher: im Finder `start.command` doppelklicken – das startet den Server und öffnet den Browser.
Zum Testen mit allen 24 Wagen sofort auswählbar: `start-alle-wagen.command` doppelklicken.

**Online:** <https://johannesmaletius-lgtm.github.io/detective-joseph/> – wird bei jedem Push auf `main` neu gebaut
(`.github/workflows/pages.yml`, Web-Fassung aus `tools/build-web.mjs`; Türen öffnen nach Datum, zum Testen `?test` anhängen).
Beenden: das Terminal-Fenster schließen (oder dort `ctrl + C`).

> **Warum ein Server?** Das Spiel ist auf viele kleine JavaScript-Dateien (Module) verteilt.
> Browser laden Module nicht direkt von der Festplatte – ein Doppelklick auf `index.html` reicht deshalb nicht.
> Der Server (`server.js`) braucht nur Node.js, keine weiteren Pakete.

## Die 24 Wagen

Das Spiel beginnt mit der Wagenübersicht „Die Ringbahn“: 24 Wagen, jeden Tag vom 1. bis 24. Dezember 2026
öffnet sich einer. Geschaffte Wagen bekommen einen Stern, der Spielstand bleibt im Browser gespeichert.

| Adresse | Wirkung |
| --- | --- |
| `?test` | alle Türen offen (auch online), unabhängig von Datum und Reihenfolge, dazu ein Knopf „Spielstand löschen“ |
| `?datum=2026-12-05` | so tun, als wäre heute der 5. Dezember (nur lokal oder mit `?test`) |
| `?tuer=1&skipintro` | direkt in Tür 1, ohne Kalender und Anfangsszene (nur wenn die Tür schon offen ist) |

## Steuerung

| Eingabe | Wirkung |
| --- | --- |
| Linksklick auf den Boden | Joseph läuft dorthin (Doppelklick: er rennt) |
| Linksklick auf etwas | benutzen, nehmen oder ansprechen – Joseph läuft vorher hin |
| Rechtsklick auf etwas | anschauen (auf dem Mac auch ctrl + Klick oder Klick mit zwei Fingern) |
| Maus an den unteren Rand | Inventar fährt heraus |
| Linksklick auf einen Gegenstand im Inventar | Joseph nimmt ihn in die Hand – dann auf etwas im Abteil klicken (benutzen) oder auf einen anderen Gegenstand (kombinieren) |
| Rechtsklick auf einen Gegenstand | anschauen / lesen (mit einem Gegenstand in der Hand: loslassen) |
| Notizbuch oben rechts oder Taste **N** | Josephs Notizen – hier steht, was er schon weiß (bei vielen Notizen: blättern) |
| Taste **H** oder „Tipp“ im Notizbuch | nach Rückfrage der komplette Lösungsweg des Wagens (steht in `src/story/solutions.js`) |
| Zahnrad → „Frühere Wagen ansehen“ | jeden schon gespielten Wagen ansehen (wer und was dort ist, Klick: anschauen) – in der Wagenübersicht und mitten im Wagen; der jetzige Wagen wartet so lange (`src/ui/memory.js`) |
| **Leertaste** oder Klick | Sprechtext überspringen |
| In einer Nahansicht (Schloss, Puzzle, Verteilerkasten …) | Linksklick bedient sie, beim Puzzle mit gedrückter Maustaste ziehen |
| **Esc** oder Rechtsklick | Nahansicht / Notizbuch schließen, Gegenstand loslassen |
| Taste **M** | Ton an/aus (der Ton startet mit dem ersten Klick) |
| Taste **D** | Debug-Ansicht: Laufbereich, anklickbare Stellen, Fenster, Koordinaten, Zug (Runde, Tunnel), Merker der Geschichte |
| Taste **G** | Koordinaten-Raster (50-Pixel-Schritte) |
| Taste **T** | nur in der Debug-Ansicht: der Zug springt kurz vor den Tunnel |

Adress-Zusätze zum Testen: <http://localhost:8150/?test> (alle Türen des Kalenders offen),
<http://localhost:8150/?test&tuer=9> (gleich in Tür 9 – geht für alle Türen 1–24, `?wagen=9` geht auch),
<http://localhost:8150/?debug> (Debug-Ansicht an), `?mute` (ohne Ton),
`?skipintro` (ohne Titelbild und Anfangsszene), kombiniert z. B. `?debug&mute&skipintro`.

## Projektstruktur

```text
detective-joseph/
├── index.html                 Die Webseite: enthält nur die Zeichenfläche und lädt src/main.js
├── style.css                  Zentriert das Spielbild und hält es im Format 16:9
├── server.js                  Mini-Webserver für die Entwicklung (npm start)
├── start.command              Doppelklick-Start für macOS
├── start-alle-wagen.command   dasselbe im Test-Modus: alle 24 Wagen auswählbar
├── package.json               Projektname + Startbefehl
├── assets/
│   ├── scenes/train-compartment/
│   │   ├── background.png     Hintergrund – Fensterscheiben und Bildschirm sind durchsichtig
│   │   ├── letter-in-slot.png Brief, der aus dem Schlitz am Schaltpult ragt
│   │   ├── scratches.png      eingeritzte Striche in der Tür (nur im Dunkeln zu sehen)
│   │   └── outside/           Außenwelt: sky, moon, clouds, hills, tower, treeline, forest, near
│   ├── scenes/wagon-04 … wagon-16/  Hintergründe der Wagen 4–16 (Fenster durchsichtig) und Rätselbilder
│   ├── characters/bruno, herr-k, barkeeper, tick, moll, mira/  Figuren: front/left/right/talk.webp
│   ├── animations/
│   │   ├── tv-noise/          TV-Rauschen: frame_001 … frame_020.png
│   │   └── tv-skull/          Totenkopf erscheint auf dem Bildschirm (15 Frames, aus deinem Bogen)
│   ├── characters/joseph/     front/back/left/right.png (Stehen) + walk-…/ (je 8 Lauf-Frames)
│   ├── items/                 Gegenstände fürs Inventar (je 128 × 128)
│   ├── ui/                    Mauszeiger (cursors/), Inventarleiste, Notizbuch-Knopf
│   └── reference/             Originale und Material für spätere Schritte
├── docs/story-ideen.md        Vorschläge für die Geschichte (Zug im Kreis, Rätsel pro Abteil)
├── docs/planung.md           Planung von Detective Joseph: 24 Wagen, Rätsel, roter Faden, Grafiken
├── tools/                     Werkzeuge, die Platzhalter-Grafiken erzeugen (siehe unten)
└── src/
    ├── main.js                Einstieg: Spiel erzeugen, den Wagen (?wagen=N) mit seiner Geschichte laden, starten
    ├── config.js              Zentrale Einstellungen (1280 × 720, Doppelklick, Tasten)
    ├── story/
    │   ├── wagon1.js          DIE GESCHICHTE von Wagen 1: Intro, alle Reaktionen, Rätsel, Tunnel, Tipps, Ende
    │   ├── itemPaint.js       gemalte Inventar-Bilder der neuen Gegenstände
    │   ├── tutorial.js        Die Tutorial-Schritte (Hinweisschild oben)
    │   ├── wagon4.js … wagon16.js  DIE GESCHICHTEN der Wagen 4–16 (oben in jeder Datei: die Rätselkette)
    │   ├── wagonCommon.js     Helfer für alle Wagen: Anfang (Titelkarte), Ende (weiter zum nächsten Wagen), Tipps
    │   ├── art/               im Code gezeichnete Blätter und Nahansichten der Wagen 4–16
    │   ├── items.js           Katalog der Gegenstände (Name, Bild, Beschreibung, Kombinationen)
    │   ├── wagonItems.js      Gegenstände ab Wagen 4 (Bilder im Code gezeichnet)
    │   └── story.js           Führt die Geschichte aus: say, note, give, cutscene … (Befehle fürs Drehbuch)
    ├── puzzles/               NAHANSICHTEN: Rätsel und Dinge, die man aus der Nähe ansieht
    │   ├── view.js            Grundgerüst für alle Nahansichten (öffnen, schließen, Klicks)
    │   ├── jigsaw.js          Papierpuzzle: der zerrissene Fahrplan
    │   ├── wires.js           Verteilerkasten: Kabelstücke drehen
    │   ├── binoculars.js      Blick durchs Fernglas auf den Turm, Joseph schreibt das Blinken mit
    │   ├── crt.js             der Bildschirm in groß: aus, Rauschen oder Kamerabild
    │   ├── picture.js         allgemeine Nahansicht: gezeichnetes Bild mit anklickbaren Stellen (Suchbild, Uhr, Flaschen …)
    │   ├── arrange.js         allgemeine Nahansicht: Kärtchen auf Plätze ziehen (Tischordnung, Kartei, Filmbilder)
    │   └── cameraFeed.js      das Bild der Tunnelkamera (Tunnel, Ziffer, Zug, Gestalt)
    ├── ui/
    │   ├── cursor.js          Mauszeiger: Zeigefinger, Auge, Hand, Sprechblase, Gegenstand
    │   ├── inventory.js       Inventarleiste mit 5 Plätzen (bei mehr Gegenständen: Pfeile)
    │   ├── speech.js          Sprechtexte über den Köpfen
    │   ├── notebook.js        Notizbuch (Knopf, aufgeschlagene Seiten, blättern, Tipp-Knopf)
    │   ├── codeLock.js        Zahlen- und Buchstabenschloss in Nahansicht (Türschloss, Koffer, Gitter)
    │   ├── choice.js          Auswahl im Gespräch (Sätze zum Anklicken)
    │   ├── cards2.js          gezeichnete Blätter der Wagen 2–4: Menütafel, Bon, Frachtliste, Brief, Foto
    │   ├── cards.js           gezeichnete Blätter: Signaltafel, Rätselheft, Detektivakte
    │   ├── symbols.js         die vier Zeichen vom Türschloss: Tunnel, Laternen, Turm
    │   ├── hints.js           Hinweisschild für das Tutorial
    │   ├── dialogue.js        Gesprächsauswahl (was Joseph fragen kann)
    │   ├── overlay.js         Abblenden und Karten: Titelbild, Unterarm, Brief, Ende, eigene Blätter
    │   └── text.js            Schriften, Zeilenumbruch, Text mit Umriss
    ├── core/
    │   ├── game.js            Spiel-Schleife (~60× pro Sekunde), wohin ein Klick geht, Wagenwechsel, Titelbild
    │   ├── paint.js           Bilder mit Code malen (Hintergründe, Inventar-Bilder) und kleine Malhelfer
    │   ├── screen.js          Zeichenfläche: 1280 × 720 logisch, scharf in jeder Fenstergröße
    │   ├── camera.js          Kamera ohne Zoom, mit leichtem Rumpeln (Oberfläche bleibt ruhig)
    │   ├── input.js           Maus (links/rechts, ziehen) + Tastatur, Doppelklick-Erkennung
    │   └── assets.js          Lädt Bilder – jedes nur einmal (Cache)
    ├── animation/
    │   ├── animations.js      KATALOG aller Frame-Animationen (Pfad, Anzahl, fps, Schleife)
    │   ├── animation.js       Lädt die Bilder einer Animation (erst wenn sie gebraucht wird)
    │   └── animationPlayer.js Spielt eine Animation ab: play, stop, restart, speed, onEnd
    ├── scene/
    │   ├── scene.js           Allgemeine Szene: Zeichenreihenfolge, anklickbare Stellen, Dunkelheit
    │   ├── outsideView.js     Außenwelt hinter den Fenstern (Ebenen mit Perspektive, Mond, Tunnel)
    │   ├── trainCompartment.js  DATEN des Zugabteils: Bild, Laufbereich, anklickbare Stellen, Außenwelt …
    │   ├── diningCar.js, sleepingCar.js, lostAndFound.js, barCar.js, cinemaCar.js  DATEN der Wagen 4–8
    │   ├── mirrorCar.js, speakerCar.js, clockCar.js, musicSalon.js, chapelCar.js, newspaperCar.js, playroom.js, radioRoom.js  DATEN der Wagen 9–16
    │   ├── wagonKit.js        gemeinsame Einstellungen aller Wagen (Außenwelt, Zugfahrt, Perspektive)
    │   ├── character.js       andere Figuren (Bruno, Herr K. …): Pose, Größe, Sprechen, anklickbar
    ├── effects/
    │   ├── trainMotion.js     Zug-Gefühl: Rumpeln, Schaukeln, Runde im Kreis, Tunnel, Licht aus, Laternen
    │   ├── morse.js           Blinksignal des Turms (eine Ziffer im Morsecode)
    │   └── darkness.js        Dunkelheit im Tunnel mit Lichtkegel der Taschenlampe
    ├── audio/
    │   ├── trainSound.js      Fahrgeräusch, „Klack“, Tunnel-Hall, Quietschen – ohne Sounddateien
    │   └── soundEffects.js    kurze Geräusche: Aufheben, Schloss, Schritte, Licht, Papier, Kabel, Strom …
    ├── navigation/
    │   ├── walkArea.js        Begehbarer Bereich, Kollision und Wegsuche (A*)
    │   └── geometry.js        Mathe-Helfer für Punkte, Linien und Vielecke
    ├── player/
    │   ├── player.js          Joseph: wählt Steh-/Laufanimation je Blickrichtung, Schatten
    │   └── playerMovement.js  Läuft einen Weg Punkt für Punkt ab (Gehen/Rennen)
    └── debug/
        └── debugOverlay.js    Entwickler-Ansicht (Tasten D und G)
```

**So hängt alles zusammen:** `main.js` erzeugt ein `Game`. Das Game lädt die Szene aus
`trainCompartment.js` mit ihrer Geschichte aus `wagon1.js` und stellt Joseph auf seine Startposition.
In jedem Bild zeichnet die Szene von hinten nach vorne: Außenwelt → Bildschirm → Hintergrund (mit
durchsichtigen Scheiben) → kleine Bilder (Brief, Kratzer) → Joseph → Fensterlicht und Lampen →
Dunkelheit (im Tunnel) → Lichtstreifen. Darüber kommt die Oberfläche: Tutorial, Inventar, die offene
Nahansicht (Zahlenschloss oder Rätsel), Sprechtexte, Notizbuch, Karten und zuletzt der Mauszeiger.

Ein Klick auf den Boden: Joseph fragt den begehbaren Bereich (`walkArea.js`) nach einem Weg und läuft ihn
ab. Ein Klick auf eine anklickbare Stelle: `story.js` lässt Joseph hinlaufen und führt dann die passende
Reaktion aus `wagon1.js` aus. Öffnet die Reaktion eine Nahansicht (`story.view('wires')`), gehen alle
Klicks an diese, bis sie wieder zu ist.

## Animationen (PNG-Sequenzen)

Alle Animationen stehen in `src/animation/animations.js`. Ein Eintrag sieht so aus:

```js
'tv-noise': { path: 'assets/animations/tv-noise/frame_{frame}.png', frameCount: 20, fps: 15, loop: true },
```

`{frame}` wird durch `001`, `002` … ersetzt. **Eigene Frames einbauen:** Bilder gleich benennen und
die alten Dateien ersetzen – oder neuen Ordner anlegen und `path`, `frameCount` und `fps` anpassen.

| Animation | Wo | Frames |
| --- | --- | --- |
| `tv-noise` | kleiner Bildschirm (Totenkopf-Monitor) | 20, 15 fps, Schleife |
| `tv-skull` | derselbe Bildschirm: der Totenkopf erscheint (im ersten Tunnel) | 15, 6 fps, einmal |
| `joseph-walk-front/back/left/right` | Joseph läuft | je 8 (= 2 Schritte), 10 fps |
| `joseph-idle-…` | Joseph steht | je 1 |

## Eigene Grafiken einbauen

- **Hintergrund:** Datei `assets/scenes/train-compartment/background.png` ersetzen. Fensterscheiben und
  Bildschirm müssen darin **durchsichtig** sein – dahinter zeichnet das Spiel Außenwelt und Rauschen.
  Hat das neue Bild ein anderes Format, in `trainCompartment.js` unter `background` Position und Größe anpassen.
- **Außenwelt:** Bilder in `assets/scenes/train-compartment/outside/` ersetzen. Die durchlaufenden
  Streifen (sky, clouds, hills, treeline, forest, near) müssen links und rechts nahtlos aneinanderpassen.
  Tempo jeder Ebene: `speed` in `trainCompartment.js` (Pixel pro Sekunde, Nahes schneller als Fernes).
  Die Breite von `sky.png` steht für einmal rundherum (360°) – pro Runde dreht sich der Himmel einmal.
  Der Mond (`moon.png`) ist ein eigenes Bild, damit er unabhängig wandern kann.
  Eigene gemalte Fenster-Frames gehen auch: als Ebene `{ animation: 'name', y }` (ohne Perspektive).
- **Joseph:** Stand- und Laufbilder in `assets/characters/joseph/` ersetzen. Regeln: transparenter
  Hintergrund, Füße berühren den unteren Bildrand, Figur waagerecht mittig, alle Bilder im
  gleichen Maßstab (Figurenhöhe: `SPRITE_HEIGHT` in `src/player/player.js`).
- **Gegenstände, Mauszeiger, Inventarleiste:** Bilder in `assets/items/` und `assets/ui/` ersetzen
  (Gegenstände 128 × 128 mit transparentem Hintergrund). Die Gegenstände sind Platzhalter aus
  `tools/make-items.mjs`; Mauszeiger und Inventarleiste sind deine Bilder.
- PNG, WebP und JPG funktionieren gleichermaßen – nur den Dateinamen im Code anpassen.
- **Wagen 2 bis 4 sind (noch) mit Code gemalt** (`src/scene/diningCar.js` usw. mit `wagonPainter.js`). Eigene
  Hintergründe: In der Szenen-Datei `background: { paint: … }` durch `background: { src: 'assets/…png', x: 0,
  y: 0, width: 1280, height: 720 }` ersetzen – Fensterscheiben durchsichtig lassen (die Fenster sitzen an
  denselben Stellen wie im ersten Abteil). Bewegliche Teile (Gläser, Rollladen, Frau Adler, Kasimir …) sind
  `props` mit `paint`-Funktion; sie können auch durch Bilder (`image`) ersetzt werden.
- **Neue Gegenstände** (Kurbel, Vierkant, Hutnadel, Brecheisen …) sind in `src/story/itemPaint.js` gemalt. Eigenes
  Bild: in `src/story/items.js` beim Gegenstand `image: 'assets/items/….png'` statt `paint` eintragen.

## Die Geschichte bearbeiten

Alles, was in Wagen 1 passiert, steht in **`src/story/wagon1.js`** – Texte, Rätsel und Abläufe.
Oben in der Datei ist die Rätselkette beschrieben.

**Ein Text ändern:** Jede anklickbare Stelle hat dort einen Eintrag mit derselben `id` wie in
`trainCompartment.js`. `look` ist der Rechtsklick (anschauen), `use` der Linksklick, `items` sagt, was
passiert, wenn man einen Gegenstand darauf anwendet:

```js
jar: {
  look: 'Ein Glas mit grün leuchtender Flüssigkeit.',     // ein Satz
  use: ['Lieber nicht anfassen.', 'Wirklich nicht.'],     // mehrere Sätze nacheinander
  items: { knife: 'Das Glas ist zu dick.' },              // Messer auf das Glas
},
```

Für mehr als Text gibt es Funktionen mit Befehlen (erklärt oben in `src/story/story.js`):
`say`, `note` (Notizbuch), `give` / `remove` / `has` (Inventar), `flags` (Merker), `wait`,
`cutscene`, `sound`, `fadeOut` / `fadeIn`, `card` (Brief oder gezeichnetes Blatt zeigen),
`view` (Nahansicht öffnen) und `codeLock` (Zahlenschloss).

**Eine neue anklickbare Stelle:** In `trainCompartment.js` unter `hotspots` eintragen – Umriss (`area`),
Standplatz (`walkTo`, `facing`) und Name. Mit **D** sieht man alle Stellen als orange Rahmen, mit **G**
das Raster zum Ablesen der Koordinaten. Dann in `wagon1.js` unter `hotspots` die Reaktionen ergänzen.
Mit `when: 'merker'` erscheint eine Stelle nur, solange der Merker gesetzt ist, mit `inDark: true` nur
im Dunkeln. `glows: 'merker'` heißt: Die Stelle leuchtet selbst und ist auch im Dunkeln ohne Taschenlampe
zu finden (der Bildschirm).

**Neue Gegenstände:** in `src/story/items.js` (Name, Bild, Beschreibung, was sich kombinieren lässt).

**Tutorial:** Die Hinweise und wann sie kommen stehen in `src/story/tutorial.js`.

**Lösungsweg:** Taste **H** zeigt den kompletten Lösungsweg des Wagens aus `src/story/solutions.js`. Ändert sich ein
Rätsel, dort mitändern. (Die alten Tipp-Sätze `hint()` in den Wagen-Dateien werden nur noch benutzt, wenn ein Wagen dort keinen Eintrag hat.)

**Ein neues Rätsel in Nahansicht:** eine Klasse in `src/puzzles/` anlegen, die `View` erweitert (am
einfachsten `wires.js` kopieren), in `src/core/game.js` unter `views` eintragen und in der Geschichte mit
`await story.view('name')` öffnen.

### Lösung von Wagen 1

Die Tür braucht vier Ziffern – in der Reihenfolge der Zeichen auf dem Schloss: **5 – 7 – 8 – 3**.

| Zeichen | Ziffer | Woher |
| --- | --- | --- |
| Tunnel | 5 | Verteilerkasten (links neben der Tür) lösen, dann den Bildschirm ansehen: Die Tunnelkamera zeigt eine große 5 an der Wand. Einstellbar: `TUNNEL_DIGIT` in `wagon1.js`. |
| Laterne links / rechts | 7 und 8 | Laternen pro Runde zählen – oder im Tunnel mit der Taschenlampe die Kratzer in der Tür finden. Wird aus den Zug-Einstellungen berechnet (`lap`, `tunnel`, `lanternEvery`); wer sie ändert, führt danach `node tools/make-items.mjs` aus, damit die eingeritzten Striche wieder stimmen. |
| Turm | 3 | Mit dem Fernglas am Fenster das Turmlicht ansehen (kurz, kurz, kurz, lang, lang) und auf der Signaltafel nachschlagen. Einstellbar: `blink.morse` beim Turm in `trainCompartment.js`. |

Der Weg dorthin: Brief lesen → Rucksack (Taschenlampe, Schlüssel) → Schlüssel an der Werkzeugkiste
(Taschenmesser, erster Fetzen) → Fetzen sammeln: Boden vorne links (2), unter der Zeitung, unter der Kiste
vorne rechts, Zigarrenkiste (mit dem Messer aufhebeln) → Rechtsklick auf die Fetzen: zusammensetzen →
Rätselheft auf der rechten Bank: die eingekreisten Felder sind 2, 4, 3 → Kofferschloss **243** → Fernglas.
Für die Taschenlampe: Messer an der Klappe des Schaltpults → Batterie → in die Lampe; auf einer Sitzbank auf
den Tunnel warten; danach ist die Klappe wieder zu → noch eine Batterie holen → Lampe geht. Im nächsten
Tunnel die Tür ableuchten.

Wer das Kamerabild beobachtet, während der Zug durch den Tunnel fährt, sieht noch etwas …

## Wagen 2, 3 und 17–24

Starten: <http://localhost:8150/?test&tuer=2> (oder 3, 17–24). Gegenstände: `src/story/adventItems.js`,
Nahansichten: `src/story/art/wagonN.js`, Szenen: `baggageCar`, `postCar`, `greenhouse`, `conductorCar`,
`photoLab`, `parcelCar`, `boilerCar`, `locomotive`, `serviceTunnel`, `finale` in `src/scene/`.

| Wagen | Ort, Figuren | Rätsel (kurz) | Code(s) |
| --- | --- | --- | --- |
| 2 | Gepäckwagen | 12 Kofferanhänger nach Abfahrt ordnen → WEICHE SIEBEN; grüner Koffer **WEICHE** → Aktenseite 1; Kofferstapel umschichten (Türme von Hanoi, nie groß auf klein, zwei Kreidefelder, die vier kleineren am Ende zusammen auf EINEM Feld – 15 Züge); untersten Koffer auf die Gepäckwaage: 17,3 kg; darin Aktenseiten 2 und 3 | Koffer **WEICHE**, Tür **173** |
| 3 | Postwagen | 8 lose Briefe nach Rundenstempel in die Fächer (römische Zahlen) → leer bleiben I, IV, VI, IX; Schrank **1469** → Dienstanweisung; Rohrpost: Weiche 1, 3 und 4 drehen (nur 1 allein verbiegt die 2), Rohrpost anfordern; Brief an J. „Runde 108“: Chiffrierscheibe um 4 drehen → „Morgen verschwindet jemand. Achte auf die Gläser.“ Das Türwort WXIVR selbst entziffern (innen suchen, außen ablesen) | Schrank **1469**, Tür **STERN** |
| 17 | Gewächshaus | Heizung: Ventil 1 und 2 auf, 3 zu → Scheiben beschlagen, Fingerschrift: Rose genau 4 l; Kannen 3 l + 5 l → 4 l, Rose gießen → winziger Schlüssel; Kiste unter dem Tisch → Liste des anderen Joseph: offen Ilse 5, Tick 11, Moll 12, Mira 15, J. 1 | Tür **44** |
| 18 | Schaffnerabteil, Stimme | Dienstbuch: J. → Moser → Kern (= Herr K.) tauschen den 24.; Schublade **KERN** → Telegramm + 7 Schlüssel; Schlüssel nach Griffform ans Brett (Haken „Lok“ bleibt leer); Stellwerk: Weiche 1 oben, 2/4/6 rechts → Fahrstraße bis Weiche 7; roter Hebel verplombt | Schublade **KERN** |
| 19 | Fotolabor | Kameratasche: fast kein Licht = Blende 2, 1/15 → **215**; Vorhang zu, Licht aus, Rotlicht an; Schalen: seifig (Lauge) – Essig (Säure) – Schwefel; 6 Negative nach den Lampen, die noch vor der Kamera liegen (5 … 0, zuletzt die Weiche); Vergrößerer: Tunnelfoto, Kilometerstein 24,7 | Tasche **215**, Tür **247** |
| 20 | Packwagen, Mira | Pakete nur an der Form den Fahrgästen zuordnen (Aufziehloch, Löffelspitze, Wollfaden, Notenblatt, Hutschachtel, Flaschenhals; der Anhänger „Heizer“ bleibt übrig); Sternenpapier auf die Frachtliste, eins nach rechts → „Paket für Papa – unter dem Boden“; Kisten von der Luke schieben; Bänder: rot, gold, blau, weiß, grün → Kelle + Karte | Tür **2512** |
| 21 | Kesselwagen, Heizer | Druck von 42 auf genau 25 (rot −8, gelb −5, blau +3): gelb 4×, blau 1×; Pumpe nur bergab (wenn die Kohlen rutschen); Spind-Foto: Dienstnummer am Ärmel | Tür **317** |
| 22 | Lok, der andere Joseph | Fahrtenschreiber: km 24,7 = 23:43 → Luke **2343**; im Tender warten, um halb zwölf herauskommen (23:30–23:32); Beweise: Familienfoto, Pressefoto, Miras Karte → er nimmt die Mütze ab | Luke **2343** |
| 23 | Wartungsgang, Herr Tick | Kopfhörer aufsetzen (Rechtsklick im Inventar); Kreidezeichen an sechs Abzweigungen: links, geradeaus, rechts, geradeaus (dunkel – Taschenlampe auf die Wand), links, rechts; Turm = Tor; Zahnrad in die leere Achse | – |
| 24 | Heiligabend | Mütze aufsetzen; Lautsprecheranlage: Wagen 4, 5, 7, 12, 15, 21 → Durchsage; Lochzange vom Schreibtisch auf die Plombe; am Fenster bei Kilometerstein 24,7 die Kelle heben; im Schlussbild die letzte Kerze anzünden | – |

## Wagen 4–8

Starten: über den Kalender (<http://localhost:8150/?test>) oder direkt <http://localhost:8150/?test&tuer=4> (oder 5–8).
Am Ende eines Wagens geht es zurück zur Wagenübersicht. Joseph hat in jedem Wagen dabei, was er vorher eingesteckt hat und noch braucht (Taschenlampe, Messer,
später Foto, Taschenuhr, Bierdeckel); das Notizbuch beginnt mit „Was bisher geschah“. Jeder Wagen hat Tipps
auf Taste **H**. Die ganze Rätselkette steht oben in der jeweiligen Datei `src/story/wagonN.js`.

| Wagen | Ort, Figuren | Rätsel (kurz) | Code(s) |
| --- | --- | --- | --- |
| 4 | Speisewagen, Koch Bruno | Tischordnung aus Brunos Erinnerungen + Schal und Fliegerbrille an den Stühlen; nach dem ersten Tunnel riecht Glas 3 nach Bittermandel; Bruno serviert „von hinten nach vorne, erst links, dann rechts“ → Glas 3 = Herr K.; Rechnung unter dem Tablett nur nehmen, wenn die Räder quietschen; Kasse: 7 × 14 + 5 × 4 + 2 × 2 | Kasse **122** |
| 5 | Schlafwagen, Oma Ilse (schläft) | Abteil 4: Blatt aus dem Fahrgastbuch unter die Tür, Stricknadel aus Ilses Schublade (nur beim Quietschen öffnen, sonst wacht sie auf und zieht die Notbremse); Suchbild Abteil 4 (6 Spuren); Ilses Satz über 3 Runden; Schlüssel im Schatten unter dem Tischchen; Foto im Bettkasten | Tür **2412** |
| 6 | Fundbüro, Stimme des Schaffners | Glocke; Kartei: Herrn K.s Karten nach Runde ordnen → Lagernummern; Klappe; Fundschein: 8 Sachen im Regal finden; Schließfach 12: Taschenuhr auf 12 Uhr stellen, im Tunnel springt der Deckel auf | Klappe **7249**, Tür **0612** |
| 7 | Barwagen, Herr K., Barkeeper | Münze im Aschenbecher → Musikbox, hinter der Zeitung am hinteren Tisch lauschen; Whisky (rauchig, drei Gläser fehlen) für Herrn K.; sein Bierdeckel: Strichlisten neben den vier Zeichen aus Wagen 1, auf der Tür in anderer Reihenfolge | Tür **1926** (Turm, Laterne →, Tunnel, Laterne ←) |
| 8 | Bordkino | Kinokarte (Sessel + Popcornmaschine) → Filmdose; 8 Filmbilder nach dem Mond ordnen; Projektor scharf stellen (Objektiv 3, Bildfenster 7: Objektiv 3×, dann Bildfenster 2×); Filmrand: „Runde 0108“ | Dose **312**, Tür **0108** |

**Grafiken:** Hintergründe, Figuren und Rätselbilder kommen aus `assets/reference/tuer-XX/` und werden mit
`python3 tools/prepare-wagons.py` vorbereitet (braucht Python 3 mit Pillow): Magenta-Fenster werden durchsichtig
(dahinter fährt die Landschaft vorbei), Magenta im Türfenster wird dunkles Glas, Cyan (Kinoleinwand) wird
durchsichtig, Figurenbögen werden in vier Posen zerschnitten. Das Skript gibt die Fensterrechtecke aus, die in
den Szenendateien unter `outside` stehen. Alles andere (Blätter, Schlösser, Flaschen, Uhr, Filmbilder, das Foto
in Wagen 5) ist im Code gezeichnet (`src/story/art/`) – das Foto könnte später durch ein ChatGPT-Bild ersetzt werden.

**Neuen Wagen anlegen:** Szenendatei in `src/scene/` (am einfachsten `cinemaCar.js` kopieren), Geschichte in
`src/story/` (z. B. `wagon8.js` kopieren) und beide in `src/advent/doors.js` bei der Tür eintragen (`load`).

## Wagen 9–16

Starten: <http://localhost:8150/?test&tuer=9> (oder 10–16). Gegenstände ab Wagen 9 stehen in
`src/story/wagonItems2.js`; die im Code gezeichneten Nahansichten in `src/story/art/wagon9.js` … `wagon16.js`.

| Wagen | Ort, Figuren | Rätsel (kurz) | Code(s) |
| --- | --- | --- | --- |
| 9 | Spiegelwagen | Zwei Hebel, zu weit auseinander. Das Spiegelbild wiederholt die letzte Runde spiegelverkehrt: in einer Runde rechts ziehen, nach dem Tunnel zur selben Zeit wieder rechts ziehen, wenn links das Spiegelbild zieht. Kratzer in Spiegelschrift (im Spiegel gegenüber lesbar): „Er ist eine Runde zu spät“. Lichtstrahl über 4 Standspiegel ins Glasauge: A \, B \, C /, D / | – |
| 10 | Lautsprecherwagen, Stimme des Schaffners | Sicherungen: dünnes Kabel – kleine Sicherung (4 → 20 A, 1 → 6 A, 6 → 25 A, 1,5 → 10 A, 2,5 → 16 A; zwei Schilder abgegriffen, Zettel nur halb); Tonband 108; bei 19 cm/s abspielen, dann rückwärts: „… wie die anderen. Elf ist der Nächste.“ | Schrank **11** |
| 11 | Uhrenwagen, Herr Tick | Die Rundenuhr (oben rechts, nur ein Zeiger, der langsam wandert – oben links steht eine kaputte mit einem Zeiger still; Ruf bei 50); Gespräch; Herrn Ticks Zettel; Standuhr :45, Kuckucksuhr :35 stellen, Tunnel abwarten, auf dem Sofa bis zum Ruf warten → beide schlagen beim Ruf. Herr Tick gibt das Zahnrad | – |
| 12 | Musiksalon, Herr Moll | 3 Notenstücke (Klavierbank, Teppichecke, Hülle „Weihnachtsfeier · Zug 24“); Kreuze über den Noten: H – A – Es – E → Spieldose **HASE** → Klavierschlüssel; viermal im Takt der Schienenstöße klopfen; Schluss = Anfang rückwärts: D – H – A – G | Spieldose **HASE** |
| 13 | Kapelle (3. Advent) | 12 Kerzen in der Reihenfolge der Wagen 1–12 → Papier und Bleistift; Gedenktafel abreiben (… Mira … und J.); Laterne am Kranz anzünden, über den Abrieb halten → H, E, I, M; Opferstock → Familienfoto; Glocken G – A – H (groß, rechts, links) → Tür | Opferstock **HEIM** |
| 14 | Zeitungswagen | Kreuzworträtsel (ILSE, KLAVIER eintragen, LOKFÜHRER → SCHAFFNER) → **WEICHE**; Zeitung vom 25.12. + Schnipsel aus dem Papierkorb (BAHNHOF und „gerettet“ passen nicht); Lupe + Pressefoto: 23:47 | Archiv **WEICHE**, Tür **2347** |
| 15 | Spielzimmer, Mira | „Ich sehe was“: Trommel, Schaukelpferd, Fenster; Modellbahn: 14 Wagen in der Reihenfolge 1–14 → roter Schlüssel im Spielzeugtunnel; Puppenhaus: Schaffner auf den Bahnsteig, Frau und Mädchen in den Zug → Miras Zeichnung, Rückseite „mein Geburtstag (der 7. 11.)“ | Tür **0711** |
| 16 | Funkraum | Antenne nach links (zum Turm in der Mitte des Kreises); Logbuch 120, 135, 165, 210, 270 → **345** kHz; Kopfhörer; Morsefunkspruch „Weiche 7 falsch“, am Ende ..--- ...-- ....- .---- (Morsetafel an der Wand) | Frequenz **345**, Tür **2341** |

Neu dafür: Buchstabenschlösser (`codeLock` mit `alphabet`), Töne (`story.tone(frequenz)`), Helfer `tryCode` und
`roundProgress` in `src/story/wagonCommon.js`, `box()` und `windowSpots()` in `src/scene/wagonKit.js`.

## Werkzeuge (`tools/`)

Die Platzhalter-Grafiken wurden mit kleinen Skripten erzeugt. Du brauchst sie nur, wenn du die
Platzhalter neu erzeugen oder verändern willst – aufrufen jeweils im Projektordner:

| Befehl | Erzeugt |
| --- | --- |
| `node tools/cut-glass.mjs` | Hintergrund mit durchsichtigen Scheiben (aus `assets/reference/train-compartment-original.png`) |
| `node tools/make-outside.mjs` | Himmel, Mond, Wolken, Hügel, Turm, Baumreihe, Wald und den Streifen der nahen Stämme |
| `node tools/make-tv-noise.mjs` | die 20 Frames TV-Rauschen |
| `node tools/make-items.mjs` | Gegenstände fürs Inventar (Brief, Schlüssel, Messer, Fetzen, Signaltafel, Fernglas, Taschenlampe, Batterie), Notizbuch-Knopf, Brief im Schlitz, eingeritzte Striche (zählt dafür die Laternen) |
| `node tools/make-joseph-walk.mjs` | Josephs Laufanimation (4 Richtungen × 8 Frames) aus seinen Standbildern |
| `python3 tools/prepare-wagons.py` | Hintergründe, Figuren und Rätselbilder der Wagen 4–16 aus `assets/reference/` (braucht Pillow) |

## Zug-Gefühl anpassen

In `src/scene/trainCompartment.js` unter `train`:

- `speed`: 1 = volle Fahrt, 0 = Zug steht (alles draußen bleibt stehen, kein Rumpeln)
- `shake`: Stärke des Rumpelns und Schaukelns (0 = aus; bei „Bewegung reduzieren“ im System ist es automatisch aus)
- `railJointInterval`: Sekunden zwischen zwei Schienenstößen
- `lap`: Sekunden für eine Runde im Kreis (so lange braucht der Mond einmal rundherum)
- `startAt`: wie weit in der Runde der Zug beim Spielstart ist
- `tunnel`: Länge des Tunnels an der Nahtstelle jeder Runde und Abstand seiner Lampen
- `lanternEvery`: wie oft draußen eine Laterne vorbeizieht (jede Runde an denselben Stellen)
- `squealEvery`: wie oft die Räder in der Kurve quietschen
- `lamps`: Position, Größe und Helligkeit des Lampenscheins
- `lightsOutInTunnel`: im Tunnel geht im Abteil das Licht aus

Unter `outside`:

- `vanishingPoint`: Fluchtpunkt des Abteils (dort laufen alle Linien zusammen; mit **D** als blaues Kreuz zu sehen)
- `referenceDistance`: in diesem Abstand vom Fluchtpunkt blickt man genau zur Seite hinaus, die Landschaft
  hat dort Originalgröße und den Mond sieht man dort, wenn er genau seitlich steht
- `windows`: die durchsichtigen Scheiben (mit **D** als blaue Rahmen zu sehen) – nach einem neuen
  Hintergrundbild hier anpassen
- `windowLight`: Farbe und Stärke des kalten Lichts, das durch die Fenster auf Wände und Sitze fällt

Die Runde zählt das Spiel mit (`game.scene.motion.lap`, in der Debug-Ansicht zu sehen); das Notizbuch
sortiert Josephs Notizen danach. Die Geschichte setzt den Zug beim Start so, dass der erste Tunnel nach
gut einer Minute kommt (`FIRST_TUNNEL_IN` in `wagon1.js`).

## Laufbereich und Perspektive anpassen

1. Im Spiel **D** drücken: Die grüne Fläche ist der begehbare Boden, die Zahlen sind ihre Ecken.
2. **G** drücken und die Koordinaten am Raster (oder oben links bei „Maus“) ablesen.
3. In `src/scene/trainCompartment.js` unter `walkArea.outline` die Ecken ändern
   (Reihenfolge im Uhrzeigersinn beibehalten) und die Seite neu laden.
4. Hindernisse mitten im Raum (z. B. ein Koffer auf dem Boden) als eigenes Vieleck unter `holes` eintragen.
5. Wie groß Joseph hinten und vorne ist, steht unter `perspective` (`far` / `near`).

## Material für spätere Schritte (`assets/reference/`)

| Ordner | Inhalt |
| --- | --- |
| `train-compartment-original.png` | das unveränderte Abteilbild (ohne durchsichtige Scheiben) |
| `window-animation/` | deine Fenster-Frames als Bogen |
| `screen-animation/` | TV-Bilder `tv1`–`tv6` und der Totenkopf-Bogen (daraus ist `assets/animations/tv-skull/` ausgeschnitten) |
| `inventory/` | das Referenzbild fürs Inventar (die Leiste selbst liegt jetzt in `assets/ui/`) |
| `joseph/` | Charakter-Sheet mit allen vier Ansichten |

## Fahrplan

- [x] **Schritt 1:** Szene 1280 × 720, Joseph, Laufen per Maus, begehbarer Bereich, Kollision, Kamera ohne Zoom
- [x] **Schritt 2:** Animationssystem für PNG-Sequenzen, fahrende Außenwelt, TV-Rauschen, Zug-Gefühl, Laufanimation
- [x] **Schritt 2b:** Außenwelt mit Perspektive, Zug fährt im Kreis (Runden, wandernder Mond, Turm, Tunnel), Schaukeln, Fensterlicht, Tunnel- und Kurvengeräusche
- [x] **Schritt 3:** Anklickbare Objekte + Cursor-System (anschauen, benutzen, sprechen)
- [x] **Schritt 4:** Inventar mit 5 Plätzen, Gegenstände benutzen und kombinieren
- [x] **Wagen 1:** Geschichte, Tutorial, Notizbuch, Zahlenschloss, Licht aus im Tunnel, Taschenlampe, Totenkopf-Animation
- [x] **Wagen 1, neue Rätsel (~20 Minuten):** Nahansichten (Papierpuzzle, Verteilerkasten, Fernglas, Bildschirm mit Tunnelkamera, Schlösser), Zahlenquadrat, Turmsignal, Batterie-Trick mit der Zeitschleife, Tipps auf Taste H
- [x] **Wagenwechsel, Figuren, Gespräche:** `?wagen=N`, weiter zum nächsten Wagen, Bruno/Herr K./Barkeeper, Gesprächsauswahl
- [x] **Wagen 4–8:** Speisewagen, Schlafwagen, Fundbüro, Barwagen, Bordkino (siehe `docs/planung.md`)
- [x] **Wagen 2 und 3:** Gepäckwagen, Postwagen
- [x] **Wagenübersicht:** Ringbahn als Startbild, Türchen-Sperre nach Datum, Spielstand
- [x] **Wagen 9–16:** Spiegelwagen, Lautsprecherwagen, Uhrenwagen, Musiksalon, Kapelle, Zeitungswagen, Spielzimmer, Funkraum
- [x] **Wagen 17–24:** Fotolabor bis Finale
- [x] Online stellen (GitHub Pages)
- [ ] Später: Vordergrund-Ebenen (Joseph hinter Sitzen), echte Sounds
- [x] Wagenwechsel, Spielstand (welcher Wagen), Titelbild mit „Weiterspielen“, `?wagen=N`
