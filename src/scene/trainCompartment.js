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
        // Sein rotes Licht blinkt eine Ziffer im Morsecode (morse) – sie gehört zum Türschloss, siehe wagon1.js.
        // unit = Länge eines kurzen Blinkzeichens in Sekunden.
        id: 'tower',
        image: 'assets/scenes/train-compartment/outside/tower.png', x: 224, y: 147,
        blink: { x: 16, y: 6, color: [255, 70, 60], morse: '3', unit: 0.34 },
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

  // Kleine Bilder im Raum, die kommen und gehen (when = Merker im Spielstand, inDark = nur im Dunkeln)
  props: [
    { id: 'letter', image: 'assets/scenes/train-compartment/letter-in-slot.png', x: 752, y: 196, width: 28, height: 18, when: 'letterInSlot' },
    { id: 'scratches', image: 'assets/scenes/train-compartment/scratches.png', x: 604, y: 316, width: 70, height: 32, inDark: true },
  ],

  // Anklickbare Stellen. area = Umriss (Eckpunkte), walkTo = hier stellt sich Joseph hin, facing = Blickrichtung.
  // cursor: 'interact' (Hand, Standard), 'look' (Auge – nur anschauen) oder 'talk' (Sprechblase).
  // Was beim Klicken passiert, steht in der Geschichte: src/story/wagon1.js (gleiche id).
  // Reihenfolge = Vorrang: Kleines, das vor Großem liegt, steht weiter oben.
  hotspots: [
    { id: 'letter', name: 'Brief', when: 'letterInSlot', area: [[748, 190], [784, 190], [784, 216], [748, 216]], walkTo: [790, 422], facing: 'back' },
    { id: 'scratches', name: 'Kratzer', inDark: true, area: [[598, 308], [682, 308], [682, 354], [598, 354]] }, // Joseph leuchtet von dort, wo er steht
    // glows: Der Bildschirm leuchtet selbst – man findet ihn auch im Dunkeln, solange er Strom hat
    { id: 'screen', name: 'Bildschirm', glows: '!screenOff', area: [[806, 168], [886, 168], [886, 243], [806, 243]], walkTo: [830, 424], facing: 'back' },
    { id: 'panel', name: 'Schaltpult', area: [[734, 222], [790, 222], [790, 244], [898, 244], [898, 320], [734, 320]], walkTo: [810, 424], facing: 'back' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: [[556, 116], [730, 116], [732, 402], [553, 402]], walkTo: [640, 424], facing: 'back' },
    { id: 'speaker', name: 'Lautsprecher', cursor: 'talk', area: [[405, 72], [500, 72], [500, 156], [405, 156]], walkTo: [565, 432], facing: 'back' },
    { id: 'intercom', name: 'Sprechanlage', cursor: 'talk', area: [[510, 182], [542, 182], [542, 230], [510, 230]], walkTo: [570, 428], facing: 'back' },
    { id: 'switches', name: 'Verteilerkasten', area: [[410, 180], [456, 180], [456, 236], [410, 236]], walkTo: [560, 432], facing: 'back' },
    { id: 'lamp', name: 'Lampe', cursor: 'look', area: [[606, 46], [672, 46], [672, 88], [606, 88]] },
    { id: 'jar', name: 'Grünes Glas', cursor: 'look', area: [[888, 38], [952, 38], [952, 114], [888, 114]] },
    { id: 'suitcase', name: 'Koffer', area: [[205, 16], [326, 16], [326, 64], [205, 64]], walkTo: [318, 642], facing: 'left' },
    { id: 'cigarbox', name: 'Zigarrenkiste', area: [[420, 342], [476, 342], [476, 374], [420, 374]], walkTo: [522, 470], facing: 'left' },
    { id: 'bottles', name: 'Flaschen', cursor: 'look', area: [[372, 306], [418, 306], [418, 374], [372, 374]] },
    { id: 'table', name: 'Tisch', area: [[376, 304], [506, 304], [506, 390], [376, 390]], walkTo: [522, 470], facing: 'left' },
    { id: 'backpack', name: 'Rucksack', area: [[163, 212], [246, 212], [250, 330], [234, 392], [174, 392], [161, 330]], walkTo: [400, 576], facing: 'left' },
    { id: 'newspaper', name: 'Zeitung', area: [[180, 458], [274, 458], [274, 496], [180, 496]], walkTo: [330, 640], facing: 'left' },
    { id: 'magazine', name: 'Heft', area: [[910, 406], [1000, 406], [1000, 434], [910, 434]], walkTo: [890, 482], facing: 'right' },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[47, 106], [139, 106], [139, 292], [47, 292]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[198, 136], [283, 136], [283, 285], [198, 285]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[322, 161], [372, 161], [372, 261], [322, 261]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[936, 162], [976, 162], [976, 260], [936, 260]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[1012, 138], [1087, 138], [1087, 272], [1012, 272]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[1142, 106], [1239, 106], [1239, 286], [1142, 286]] },
    { id: 'papers', name: 'Zerrissenes Papier', area: [[250, 598], [392, 598], [392, 642], [250, 642]], walkTo: [372, 656], facing: 'left' },
    { id: 'toolbox', name: 'Werkzeugkiste', area: [[300, 516], [374, 516], [374, 564], [300, 564]], walkTo: [404, 584], facing: 'left' },
    { id: 'crate', name: 'Kiste', area: [[1116, 616], [1214, 616], [1214, 706], [1116, 706]], walkTo: [1086, 668], facing: 'right' },
    { id: 'extinguisher', name: 'Feuerlöscher', cursor: 'look', area: [[150, 674], [230, 674], [230, 720], [150, 720]] },
    { id: 'bench', name: 'Sitzbank', area: [[0, 298], [300, 298], [312, 470], [300, 560], [0, 560]], walkTo: [318, 642], facing: 'left' },
    { id: 'bench', name: 'Sitzbank', area: [[846, 280], [1272, 280], [1272, 600], [1010, 600], [846, 432]], walkTo: [930, 540], facing: 'right' },
  ],

  // Der Zug fährt – im Kreis (siehe src/effects/trainMotion.js)
  train: {
    lightsOutInTunnel: true, // im Tunnel geht im Abteil das Licht aus
    speed: 1,                // 1 = volle Fahrt, 0 = Stillstand
    shake: 1,                // Stärke des Rumpelns und Schaukelns, 0 = aus
    railJointInterval: 1.15, // Sekunden zwischen zwei Schienenstößen ("ta-dam")
    lap: 150,                // Sekunden für eine Runde bei voller Fahrt – dann ist der Zug wieder am selben Punkt
    startAt: 105,            // so weit in der Runde ist der Zug, wenn das Spiel beginnt (Tunnel nach ~40 s)
    tunnel: { length: 12, lampEvery: 0.45 }, // Tunnel an der Nahtstelle der Runde: Dauer, Abstand der Lampen
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
