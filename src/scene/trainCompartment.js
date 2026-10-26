// Szene 1: das erste Zugabteil.
//
// Diese Datei enthält nur DATEN – keine Spiellogik. Alle Koordinaten sind Spielkoordinaten
// im 1280 × 720-Bild (x = von links nach rechts, y = von oben nach unten).
// Tipp: Im Spiel Taste D (Debug) und G (Raster) drücken, dann lassen sich Punkte leicht ablesen.

export const trainCompartment = {
  id: 'trainCompartment',
  name: 'Erstes Zugabteil',

  // Das Hintergrundbild ist 1536 × 1024 groß. Es wird auf die Bildbreite von 1280 skaliert
  // (→ 1280 × 853) und etwas nach oben geschoben, damit Decke UND viel Boden zu sehen sind.
  // Fensterscheiben und Bildschirm sind darin durchsichtig (siehe tools/cut-glass.mjs).
  background: {
    src: 'assets/scenes/train-compartment/background.png',
    x: 0,
    y: -40,
    width: 1280,
    height: 853,
  },

  // Die Landschaft hinter den Fenstern – Ebenen von hinten nach vorne (siehe outsideView.js).
  // speed = Pixel pro Sekunde bei voller Fahrt (im Referenzabstand). Nahes zieht schneller vorbei als Fernes.
  outside: {
    // Fluchtpunkt: Hier laufen alle Linien des Abteils zusammen (Augenhöhe, hinten an der Tür).
    vanishingPoint: { x: 640, y: 206 },
    // In diesem Abstand vom Fluchtpunkt (mittlere Fenster) blickt man genau zur Seite hinaus und die
    // Landschaft hat Originalgröße. Weiter innen wirkt sie kleiner und langsamer, weiter außen größer und schneller.
    referenceDistance: 400,
    // Die durchsichtigen Fensterscheiben im Hintergrundbild (nur dort wird die Außenwelt gezeichnet).
    // Mit Taste D sind sie als blaue Rahmen zu sehen.
    windows: [
      { from: 47, to: 139, top: 106, bottom: 292 },   // links vorne
      { from: 198, to: 283, top: 136, bottom: 285 },  // links Mitte
      { from: 322, to: 372, top: 161, bottom: 261 },  // links hinten
      { from: 936, to: 976, top: 162, bottom: 260 },  // rechts hinten
      { from: 1012, to: 1087, top: 138, bottom: 272 }, // rechts Mitte
      { from: 1142, to: 1239, top: 106, bottom: 286 }, // rechts vorne
    ],
    layers: [
      { image: 'assets/scenes/train-compartment/outside/sky.png', y: 85, turning: true }, // dreht sich einmal pro Runde
      // Der Mond steht in Richtung "bearing" (Grad) und wandert dadurch langsam von Fenster zu Fenster.
      // Mit 158 steht er beim Spielstart im mittleren rechten Fenster.
      { image: 'assets/scenes/train-compartment/outside/moon.png', y: 142, bearing: 158 },
      { image: 'assets/scenes/train-compartment/outside/clouds.png', y: 88, speed: 6 },
      { image: 'assets/scenes/train-compartment/outside/hills.png', y: 150, speed: 14 },
      {
        // Der Turm steht in der Mitte des Kreises, den der Zug fährt – er bewegt sich nie.
        image: 'assets/scenes/train-compartment/outside/tower.png', x: 224, y: 147,
        blink: { x: 16, y: 6, color: [255, 70, 60], every: 2.6 },
      },
      { image: 'assets/scenes/train-compartment/outside/treeline.png', y: 150, speed: 45 },
      { image: 'assets/scenes/train-compartment/outside/forest.png', y: 60, speed: 160 },
      { image: 'assets/scenes/train-compartment/outside/near.png', y: 85, speed: 1100 },
    ],
    // Kaltes Licht, das durch die Fenster auf Wände und Sitze fällt (flackert, wenn draußen Stämme vorbeirauschen)
    windowLight: { color: [140, 160, 255], strength: 0.16 },
  },

  // Animierte Stellen im Bild. layer 'behind' = hinter dem Hintergrund, also nur durch
  // durchsichtige Stellen zu sehen (hier: die Mattscheibe des Bildschirms).
  animations: [
    {
      id: 'skullScreen',
      animation: 'tv-noise',
      layer: 'behind',
      x: 816,
      y: 182,
      width: 62,
      height: 54,
      glow: { x: 847, y: 208, radius: 90, color: '205, 220, 235', strength: 0.22 },
    },
  ],

  // Der Zug fährt – im Kreis (siehe src/effects/trainMotion.js)
  train: {
    speed: 1,                // 1 = volle Fahrt, 0 = Stillstand
    shake: 1,                // Stärke des Rumpelns und Schaukelns, 0 = aus
    railJointInterval: 1.15, // Sekunden zwischen zwei Schienenstößen ("ta-dam")
    lap: 150,                // Sekunden für eine Runde bei voller Fahrt – dann ist der Zug wieder am selben Punkt
    startAt: 105,            // so weit in der Runde ist der Zug, wenn das Spiel beginnt (Tunnel nach ~40 s)
    tunnel: { length: 8, lampEvery: 0.45 }, // Tunnel an der Nahtstelle der Runde: Dauer, Abstand der Lampen
    lanternEvery: [6, 12],   // alle 6 bis 12 Sekunden eine Laterne – in jeder Runde an denselben Stellen
    squealEvery: [15, 40],   // alle 15 bis 40 Sekunden quietschen die Räder in der Kurve
    lamps: [
      { x: 515, y: 18, radius: 170, strength: 0.28 }, // Deckenlampe links
      { x: 762, y: 18, radius: 170, strength: 0.28 }, // Deckenlampe rechts
      { x: 638, y: 72, radius: 80, strength: 0.3 },   // Lampe über der Tür
    ],
  },

  // Hier steht Joseph beim Betreten der Szene (Position seiner Füße).
  playerStart: { x: 640, y: 570, facing: 'front' },

  // Perspektive: so groß ist Joseph an zwei Stellen im Raum – dazwischen wird umgerechnet.
  perspective: {
    far: { y: 410, height: 235 },  // hinten an der Tür
    near: { y: 690, height: 440 }, // ganz vorne
    verticalSpeed: 0.6,            // Tempo nach vorne/hinten im Verhältnis zu seitwärts
  },

  // Begehbarer Boden. Eckpunkte im Uhrzeigersinn, beginnend hinten links an der Tür.
  // Die Nummern sieht man im Spiel mit Taste D.
  walkArea: {
    outline: [
      [552, 414],  //  0 hinten links, neben dem Tisch
      [842, 410],  //  1 hinten rechts, an der Wand
      [860, 470],  //  2 entlang der rechten Sitzbank …
      [955, 537],  //  3
      [1043, 596], //  4 … bis zur vorderen Armlehne
      [1110, 606], //  5 unter der Armlehne, vor der grauen Kiste
      [1112, 690], //  6 vorne rechts, neben der Kiste
      [152, 690],  //  7 vorne links, neben der türkisen Kiste
      [165, 662],  //  8 vor der linken Sitzbank …
      [312, 642],  //  9
      [392, 577],  // 10 vor der kleinen Kiste
      [457, 543],  // 11 vor dem Sessel
      [512, 468],  // 12 neben dem Tisch
    ],
    // Hindernisse mitten auf dem Boden (Vielecke) – im ersten Abteil noch keine.
    holes: [],
  },
};
