# Detective Joseph

2D-Point-and-Click-Adventure im Browser (HTML5 Canvas, reines JavaScript, keine Frameworks).

**Stand: Wagen 1 und Wagen 4–8 sind spielbar** (Adventskalender „Die Ringbahn“, Planung in
[`docs/adventskalender.md`](docs/adventskalender.md)). Wagen 2 und 3 fehlen noch – Wagen 4 startet man deshalb
direkt über die Adresse (siehe [Wagen 4–8](#wagen-48)). **Wagen 1:** etwa 20 Minuten Rätsel, mit Geschichte, Tutorial und Tipps. Joseph wacht
in einem Nachtzug auf und weiß nicht, wie er hineingekommen ist. Auf seinem Unterarm steht in seiner eigenen
Schrift: *NICHT EINSCHLAFEN*. Ein Brief in seiner eigenen Handschrift verrät: Die Tür zum nächsten Wagen will
vier Zahlen – und ein früherer Joseph hat sie dort versteckt, wo der Tunnel sie nicht löschen kann. Die
Geschichte folgt Vorschlag 1 („Ringbahn“) aus [`docs/story-ideen.md`](docs/story-ideen.md).

Die Rätsel im Abteil (Lösung weiter unten):

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
Beenden: das Terminal-Fenster schließen (oder dort `ctrl + C`).

> **Warum ein Server?** Das Spiel ist auf viele kleine JavaScript-Dateien (Module) verteilt.
> Browser laden Module nicht direkt von der Festplatte – ein Doppelklick auf `index.html` reicht deshalb nicht.
> Der Server (`server.js`) braucht nur Node.js, keine weiteren Pakete.

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
| Taste **H** oder „Tipp“ im Notizbuch | Joseph gibt einen Tipp – je öfter man fragt, desto deutlicher |
| **Leertaste** oder Klick | Sprechtext überspringen |
| In einer Nahansicht (Schloss, Puzzle, Verteilerkasten …) | Linksklick bedient sie, beim Puzzle mit gedrückter Maustaste ziehen |
| **Esc** oder Rechtsklick | Nahansicht / Notizbuch schließen, Gegenstand loslassen |
| Taste **M** | Ton an/aus (der Ton startet mit dem ersten Klick) |
| Taste **D** | Debug-Ansicht: Laufbereich, anklickbare Stellen, Fenster, Koordinaten, Zug (Runde, Tunnel), Merker der Geschichte |
| Taste **G** | Koordinaten-Raster (50-Pixel-Schritte) |
| Taste **T** | nur in der Debug-Ansicht: der Zug springt kurz vor den Tunnel |

Adress-Zusätze zum Testen: <http://localhost:8150/?wagen=4> (mit Wagen 4 beginnen – geht für 1, 4, 5, 6, 7, 8),
<http://localhost:8150/?debug> (Debug-Ansicht an), `?mute` (ohne Ton),
`?skipintro` (ohne Titelbild und Anfangsszene), kombiniert z. B. `?debug&mute&skipintro`.

## Projektstruktur

```text
detective-joseph/
├── index.html                 Die Webseite: enthält nur die Zeichenfläche und lädt src/main.js
├── style.css                  Zentriert das Spielbild und hält es im Format 16:9
├── server.js                  Mini-Webserver für die Entwicklung (npm start)
├── start.command              Doppelklick-Start für macOS
├── package.json               Projektname + Startbefehl
├── assets/
│   ├── scenes/train-compartment/
│   │   ├── background.png     Hintergrund – Fensterscheiben und Bildschirm sind durchsichtig
│   │   ├── letter-in-slot.png Brief, der aus dem Schlitz am Schaltpult ragt
│   │   ├── scratches.png      eingeritzte Striche in der Tür (nur im Dunkeln zu sehen)
│   │   └── outside/           Außenwelt: sky, moon, clouds, hills, tower, treeline, forest, near
│   ├── scenes/wagon-04 … wagon-08/  Hintergründe der Wagen 4–8 (Fenster durchsichtig) und Rätselbilder
│   ├── characters/bruno, herr-k, barkeeper/  Figuren: front/left/right/talk.webp
│   ├── animations/
│   │   ├── tv-noise/          TV-Rauschen: frame_001 … frame_020.png
│   │   └── tv-skull/          Totenkopf erscheint auf dem Bildschirm (15 Frames, aus deinem Bogen)
│   ├── characters/joseph/     front/back/left/right.png (Stehen) + walk-…/ (je 8 Lauf-Frames)
│   ├── items/                 Gegenstände fürs Inventar (je 128 × 128)
│   ├── ui/                    Mauszeiger (cursors/), Inventarleiste, Notizbuch-Knopf
│   └── reference/             Originale und Material für spätere Schritte
├── docs/story-ideen.md        Vorschläge für die Geschichte (Zug im Kreis, Rätsel pro Abteil)
├── docs/adventskalender.md    Planung des Adventskalenders: 24 Wagen, Rätsel, roter Faden, Grafiken
├── tools/                     Werkzeuge, die Platzhalter-Grafiken erzeugen (siehe unten)
└── src/
    ├── main.js                Einstieg: Spiel erzeugen, den Wagen (?wagen=N) mit seiner Geschichte laden, starten
    ├── wagons.js              LISTE ALLER WAGEN: Nummer → Szene + Geschichte
    ├── config.js              Zentrale Einstellungen (1280 × 720, Doppelklick, Tasten)
    ├── story/
    │   ├── wagon1.js          DIE GESCHICHTE von Wagen 1: Intro, alle Reaktionen, Rätsel, Tunnel, Tipps, Ende
    │   ├── tutorial.js        Die Tutorial-Schritte (Hinweisschild oben)
    │   ├── wagon4.js … wagon8.js  DIE GESCHICHTEN der Wagen 4–8 (oben in jeder Datei: die Rätselkette)
    │   ├── wagonCommon.js     Helfer für alle Wagen: Anfang (Titelkarte), Ende (weiter zum nächsten Wagen), Tipps
    │   ├── art/               im Code gezeichnete Blätter und Nahansichten der Wagen 4–8
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
    │   ├── codeLock.js        Zahlenschloss in Nahansicht (Türschloss mit Zeichen, Kofferschloss)
    │   ├── cards.js           gezeichnete Blätter: Signaltafel, Rätselheft, Detektivakte
    │   ├── symbols.js         die vier Zeichen vom Türschloss: Tunnel, Laternen, Turm
    │   ├── hints.js           Hinweisschild für das Tutorial
    │   ├── dialogue.js        Gesprächsauswahl (was Joseph fragen kann)
    │   ├── overlay.js         Abblenden und Karten: Titelbild, Unterarm, Brief, Ende, eigene Blätter
    │   └── text.js            Schriften, Zeilenumbruch, Text mit Umriss
    ├── core/
    │   ├── game.js            Spiel-Schleife (~60× pro Sekunde) und wohin ein Klick geht
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
    │   ├── wagonKit.js        gemeinsame Einstellungen aller Wagen (Außenwelt, Zugfahrt, Perspektive)
    │   └── character.js       andere Figuren (Bruno, Herr K. …): Pose, Größe, Sprechen, anklickbar
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

**Tipps:** Was Joseph bei Taste **H** sagt, steht ganz unten in `wagon1.js` (`currentGoal`): zu jedem
Rätsel eine Liste von Sätzen, vom sanften Schubs bis zur Lösung.

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

## Wagen 4–8

Starten: <http://localhost:8150/?wagen=4> (oder 5, 6, 7, 8). Am Ende eines Wagens geht es direkt in den
nächsten. Joseph hat in jedem Wagen dabei, was er vorher eingesteckt hat und noch braucht (Taschenlampe, Messer,
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
`src/story/` (z. B. `wagon8.js` kopieren) und beide in `src/wagons.js` eintragen.

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
| `python3 tools/prepare-wagons.py` | Hintergründe, Figuren und Rätselbilder der Wagen 4–8 aus `assets/reference/` (braucht Pillow) |

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
- [x] **Wagen 4–8:** Speisewagen, Schlafwagen, Fundbüro, Barwagen, Bordkino (siehe `docs/adventskalender.md`)
- [ ] **Wagen 2 und 3:** Gepäckwagen, Postwagen
- [ ] **Wagen 9–24**, Türchen-Sperre nach Datum, Spielstand speichern, Online stellen
- [ ] Später: Vordergrund-Ebenen (Joseph hinter Sitzen), echte Sounds
