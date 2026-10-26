# Detective Joseph

2D-Point-and-Click-Adventure im Browser (HTML5 Canvas, reines JavaScript, keine Frameworks).

**Stand: Schritt 2.** Joseph läuft mit echter Beinbewegung durch das erste Zugabteil. Der Zug fährt:
Vor den Fenstern zieht eine nächtliche Landschaft vorbei, das Abteil rumpelt im Takt der Schienenstöße,
die Lampen flackern, ab und zu huscht das Licht einer Laterne durch den Wagen, und der kleine
Bildschirm zeigt schwarz-weißes Rauschen.

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
| Linksklick auf den Boden | Joseph läuft dorthin |
| Klick auf Sitz, Wand, Kiste … | Joseph läuft so nah wie möglich heran |
| Doppelklick | Joseph rennt |
| Taste **M** | Ton an/aus (der Ton startet mit dem ersten Klick) |
| Taste **D** | Debug-Ansicht: begehbarer Bereich, Ecken-Nummern, Weg, Koordinaten, Zug und Ton |
| Taste **G** | Koordinaten-Raster (50-Pixel-Schritte) |

Adress-Zusätze zum Testen: <http://localhost:8150/?debug> (Debug-Ansicht an), `?mute` (ohne Ton), kombiniert `?debug&mute`.

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
│   │   └── outside/           Außenwelt: sky, clouds, hills, treeline, forest + near/ (20 Frames)
│   ├── animations/tv-noise/   TV-Rauschen: frame_001 … frame_020.png
│   ├── characters/joseph/     front/back/left/right.png (Stehen) + walk-…/ (je 8 Lauf-Frames)
│   └── reference/             Originale und Material für spätere Schritte
├── tools/                     Werkzeuge, die Platzhalter-Grafiken erzeugen (siehe unten)
└── src/
    ├── main.js                Einstieg: Spiel erzeugen, erste Szene laden, starten
    ├── config.js              Zentrale Einstellungen (1280 × 720, Doppelklick, Tasten)
    ├── core/
    │   ├── game.js            Spiel-Schleife: ~60× pro Sekunde update() und draw()
    │   ├── screen.js          Zeichenfläche: 1280 × 720 logisch, scharf in jeder Fenstergröße
    │   ├── camera.js          Kamera ohne Zoom, mit leichtem Rumpeln (Oberfläche bleibt ruhig)
    │   ├── input.js           Maus + Tastatur, Doppelklick-Erkennung
    │   └── assets.js          Lädt Bilder – jedes nur einmal (Cache)
    ├── animation/
    │   ├── animations.js      KATALOG aller Frame-Animationen (Pfad, Anzahl, fps, Schleife)
    │   ├── animation.js       Lädt die Bilder einer Animation (erst wenn sie gebraucht wird)
    │   └── animationPlayer.js Spielt eine Animation ab: play, stop, restart, speed, onEnd
    ├── scene/
    │   ├── scene.js           Allgemeine Szene: Zeichenreihenfolge, Perspektive, Animationen
    │   ├── outsideView.js     Außenwelt hinter den Fenstern (Ebenen mit Parallaxe)
    │   └── trainCompartment.js  DATEN des Zugabteils: Bild, Laufbereich, Außenwelt, Lampen …
    ├── effects/
    │   └── trainMotion.js     Zug-Gefühl: Rumpeln, Schienenstöße, Lampenflackern, Laternenlicht
    ├── audio/
    │   └── trainSound.js      Fahrgeräusch und „Klack“ – im Browser erzeugt, ohne Sounddateien
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
`trainCompartment.js` und stellt Joseph auf seine Startposition. In jedem Bild zeichnet die Szene
von hinten nach vorne: Außenwelt → Bildschirm-Rauschen → Hintergrund (mit durchsichtigen Scheiben)
→ Joseph → Licht und Flackern. Bei einem Klick fragt Joseph den begehbaren Bereich (`walkArea.js`)
nach einem Weg und läuft ihn mit `playerMovement.js` ab; dabei spielt er seine Laufanimation.

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
| `outside-near` | vorbeirauschende Stämme und Masten vor den Fenstern | 20, 20 fps, Schleife |
| `joseph-walk-front/back/left/right` | Joseph läuft | je 8 (= 2 Schritte), 10 fps |
| `joseph-idle-…` | Joseph steht | je 1 |

## Eigene Grafiken einbauen

- **Hintergrund:** Datei `assets/scenes/train-compartment/background.png` ersetzen. Fensterscheiben und
  Bildschirm müssen darin **durchsichtig** sein – dahinter zeichnet das Spiel Außenwelt und Rauschen.
  Hat das neue Bild ein anderes Format, in `trainCompartment.js` unter `background` Position und Größe anpassen.
- **Außenwelt:** Bilder in `assets/scenes/train-compartment/outside/` ersetzen. Die durchlaufenden
  Streifen (clouds, hills, treeline, forest) müssen links und rechts nahtlos aneinanderpassen.
  Tempo jeder Ebene: `speed` in `trainCompartment.js` (Pixel pro Sekunde, Nahes schneller als Fernes).
- **Joseph:** Stand- und Laufbilder in `assets/characters/joseph/` ersetzen. Regeln: transparenter
  Hintergrund, Füße berühren den unteren Bildrand, Figur waagerecht mittig, alle Bilder im
  gleichen Maßstab (Figurenhöhe: `SPRITE_HEIGHT` in `src/player/player.js`).
- PNG, WebP und JPG funktionieren gleichermaßen – nur den Dateinamen im Code anpassen.

## Werkzeuge (`tools/`)

Die Platzhalter-Grafiken wurden mit kleinen Skripten erzeugt. Du brauchst sie nur, wenn du die
Platzhalter neu erzeugen oder verändern willst – aufrufen jeweils im Projektordner:

| Befehl | Erzeugt |
| --- | --- |
| `node tools/cut-glass.mjs` | Hintergrund mit durchsichtigen Scheiben (aus `assets/reference/train-compartment-original.png`) |
| `node tools/make-outside.mjs` | Himmel, Wolken, Hügel, Baumreihe, Wald und die 20 Frames der nahen Stämme |
| `node tools/make-tv-noise.mjs` | die 20 Frames TV-Rauschen |
| `node tools/make-joseph-walk.mjs` | Josephs Laufanimation (4 Richtungen × 8 Frames) aus seinen Standbildern |

## Zug-Gefühl anpassen

In `src/scene/trainCompartment.js` unter `train`:

- `speed`: 1 = volle Fahrt, 0 = Zug steht (alles draußen bleibt stehen, kein Rumpeln)
- `shake`: Stärke des Rumpelns (0 = aus; bei „Bewegung reduzieren“ im System ist es automatisch aus)
- `railJointInterval`: Sekunden zwischen zwei Schienenstößen
- `lanternEvery`: wie oft draußen eine Laterne vorbeizieht
- `lamps`: Position, Größe und Helligkeit des Lampenscheins

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
| `screen-animation/` | TV-Bilder `tv1`–`tv6` und der Totenkopf-Bogen (für die spätere Totenkopf-Animation) |
| `inventory/` | Inventar-Leiste (`inventory-bar.png`) und das Referenzbild |
| `cursors/` | Cursor: anschauen, laufen, interagieren, sprechen |
| `joseph/` | Charakter-Sheet mit allen vier Ansichten |

## Fahrplan

- [x] **Schritt 1:** Szene 1280 × 720, Joseph, Laufen per Maus, begehbarer Bereich, Kollision, Kamera ohne Zoom
- [x] **Schritt 2:** Animationssystem für PNG-Sequenzen, fahrende Außenwelt, TV-Rauschen, Zug-Gefühl, Laufanimation
- [ ] **Schritt 3:** Anklickbare Objekte + Cursor-System
- [ ] **Schritt 4:** Inventar mit 5 Slots, ersten Gegenstand aufnehmen (Demo: Schlüssel → Tür)
- [ ] Später: Totenkopf-Animation, Vordergrund-Ebenen (Joseph hinter Sitzen), weitere Szenen
