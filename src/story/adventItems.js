import { key, line, lines, paper } from './wagonItems.js';

// Gegenstände der Wagen 2, 3 und 9–24 (Bilder im Code gezeichnet, je 128 × 128).
// Eingebunden in src/story/items.js. keep: true = bleibt über den Wagen hinaus im Inventar.

const INK = '#2b1c10';

function suitcase(ctx, body, strap) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(18, 44, 96, 66);
  ctx.fillStyle = body;
  ctx.fillRect(14, 40, 96, 66);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 40, 96, 66);
  ctx.strokeRect(46, 26, 32, 16);
  ctx.fillStyle = strap;
  ctx.fillRect(30, 40, 8, 66);
  ctx.fillRect(86, 40, 8, 66);
  ctx.fillStyle = '#d6a645';
  ctx.fillRect(56, 50, 12, 10);
}

export const ADVENT_ITEMS = {
  // ---------------------------------------------------------------- Tür 2: Gepäckwagen
  filePage: {
    name: 'Aktenseite 1',
    icon: (ctx) => paper(ctx, 26, 12, 76, 104, -0.08, (c) => {
      c.fillStyle = '#27408f';
      c.font = 'bold 12px monospace';
      c.fillText('AKTE J.', 8, 16);
      lines(c, 8, 30, 58, 7, 10);
    }),
    look: 'Seite 1 meiner Akte. In meiner Schrift – und ich weiß nicht mehr, wann ich sie geschrieben habe.',
  },
  heavyCase: {
    name: 'Unterster Koffer',
    icon: (ctx) => suitcase(ctx, '#5a2e1c', '#2e170c'),
    look: 'Der schwerste Koffer aus dem Stapel. Ganz schön schwer – was ist da drin?',
  },
  filePages: {
    name: 'Aktenseiten 2 und 3',
    icon: (ctx) => {
      paper(ctx, 34, 18, 70, 96, 0.12, (c) => lines(c, 8, 18, 52, 7, 10));
      paper(ctx, 22, 12, 70, 96, -0.1, (c) => {
        c.fillStyle = '#27408f';
        c.font = 'bold 12px monospace';
        c.fillText('S. 2', 8, 16);
        lines(c, 8, 30, 52, 6, 10);
      });
    },
    look: 'Die fehlenden Seiten meiner Akte. Jetzt ist sie vollständig.',
  },

  // ---------------------------------------------------------------- Tür 3: Postwagen
  postNote: {
    name: 'Dienstanweisung',
    icon: (ctx) => paper(ctx, 24, 18, 80, 92, 0.06, (c) => {
      c.fillStyle = INK;
      c.font = 'bold 11px serif';
      c.fillText('Dienst-', 8, 16);
      lines(c, 8, 28, 62, 6, 10);
    }),
    look: 'Die Dienstanweisung des Postmeisters.',
  },
  cipherLetter: {
    name: 'Brief an J.',
    icon: (ctx) => {
      ctx.fillStyle = '#efe3c2';
      ctx.fillRect(14, 30, 100, 68);
      ctx.strokeStyle = 'rgba(80,60,30,0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(14, 30, 100, 68);
      line(ctx, 14, 30, 64, 70);
      line(ctx, 114, 30, 64, 70);
      ctx.fillStyle = '#27408f';
      ctx.font = 'bold 18px serif';
      ctx.fillText('J.', 24, 90);
    },
    look: 'Ein Brief an J. Verschlüsselt.',
  },






  // ---------------------------------------------------------------- Tür 17: Gewächshaus
  tinyKey: {
    name: 'Winziger Schlüssel',
    icon: (ctx) => key(ctx, '#d6a645', '#7a5418', 0.7),
    look: 'Ein winziger Schlüssel aus der Rosenblüte.',
  },
  guestList: {
    name: 'Notizbuch des anderen',
    icon: (ctx) => {
      ctx.fillStyle = '#3d4a2a';
      ctx.fillRect(28, 18, 72, 94);
      ctx.fillStyle = '#e9dfc4';
      ctx.fillRect(34, 22, 62, 86);
      lines(ctx, 40, 36, 48, 6, 11);
    },
    look: 'Das Notizbuch des anderen Joseph. Eine Liste der Fahrgäste.',
  },

  // ---------------------------------------------------------------- Tür 18: Schaffnerabteil
  telegram: {
    name: 'Telegramm',
    icon: (ctx) => paper(ctx, 18, 26, 92, 76, -0.05, (c) => {
      c.fillStyle = '#c9a24a';
      c.fillRect(0, 0, 92, 14);
      lines(c, 8, 26, 74, 5, 10);
    }),
    look: 'Das Telegramm an den Schaffner. „Warte am Bahnsteig auf uns.“',
  },
  keyRing: {
    name: 'Schlüsselbund',
    icon: (ctx) => {
      ctx.strokeStyle = '#8a8f99';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(52, 46, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.save();
      ctx.translate(-10, 10);
      key(ctx, '#d6a645', '#7a5418', 0.8);
      ctx.restore();
      ctx.save();
      ctx.translate(14, 18);
      key(ctx, '#c9b06a', '#6e5420', 0.7);
      ctx.restore();
    },
    look: 'Sieben Schlüssel an einem Ring. Jeder Griff hat eine andere Form.',
  },

  // ---------------------------------------------------------------- Tür 19: Fotolabor
  film: {
    name: 'Film',
    icon: (ctx) => {
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(34, 30, 60, 70);
      ctx.fillStyle = '#c9a24a';
      ctx.fillRect(34, 30, 60, 14);
      ctx.fillRect(34, 86, 60, 14);
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(90, 50, 22, 26);
    },
    look: 'Ein unentwickelter Film.',
  },
  negatives: {
    name: 'Negative',
    icon: (ctx) => {
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(10, 44, 108, 40);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#d0d0d0';
        ctx.fillRect(16 + i * 26, 52, 20, 24);
      }
    },
    look: 'Sechs Negative aus dem Tunnel.',
  },

  // ---------------------------------------------------------------- Tür 20: Packwagen
  starPaper: {
    name: 'Sternenpapier',
    icon: (ctx) => {
      ctx.fillStyle = '#c0302a';
      ctx.fillRect(18, 24, 92, 80);
      ctx.fillStyle = '#1a120c';
      for (const [x, y] of [[40, 46], [80, 50], [56, 82], [92, 88]]) {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4 : 10;
          ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        }
        ctx.fill();
      }
    },
    look: 'Geschenkpapier mit ausgestanzten Sternen. Die Sterne sind Löcher.',
  },
  giftBox: {
    name: 'Miras Paket',
    icon: (ctx) => {
      ctx.fillStyle = '#7a2a3a';
      ctx.fillRect(22, 36, 84, 70);
      for (const [c, x] of [['#c0302a', 60], ['#e0b030', 44], ['#3a5ab0', 76]]) {
        ctx.fillStyle = c;
        ctx.fillRect(x, 36, 8, 70);
      }
      ctx.fillStyle = '#2f8a4a';
      ctx.fillRect(22, 66, 84, 8);
    },
    look: 'Miras Paket. „Für Papa“.',
  },
  paddle: {
    name: 'Miras Kelle',
    keep: true,
    icon: (ctx) => {
      ctx.fillStyle = '#8a5a2a';
      ctx.fillRect(58, 70, 12, 50);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(64, 46, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c0302a';
      ctx.beginPath();
      ctx.arc(64, 46, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(64, 46, 18, 0, Math.PI * 2);
      ctx.fill();
    },
    look: 'Miras selbstgebastelte Schaffnerkelle. „Damit du uns nach Hause bringst.“',
  },

  // ---------------------------------------------------------------- Tür 21: Kesselwagen
  lockerPhoto: {
    name: 'Foto aus dem Spind',
    icon: (ctx) => {
      ctx.fillStyle = '#efe6d2';
      ctx.fillRect(16, 26, 96, 76);
      ctx.fillStyle = '#8a6a44';
      ctx.fillRect(22, 32, 84, 64);
      ctx.fillStyle = '#4a3220';
      ctx.fillRect(40, 52, 16, 40);
      ctx.fillRect(70, 48, 16, 44);
    },
    look: 'Der Heizer und ein junger Schaffner. Der sieht aus wie ich.',
  },

  // ---------------------------------------------------------------- Tür 24: Heiligabend
  punch: {
    name: 'Lochzange',
    icon: (ctx) => {
      ctx.strokeStyle = '#6a6e76';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(30, 100);
      ctx.lineTo(70, 40);
      ctx.moveTo(60, 104);
      ctx.lineTo(78, 44);
      ctx.stroke();
      ctx.fillStyle = '#9aa0a8';
      ctx.fillRect(66, 22, 30, 26);
    },
    look: 'Die Lochzange vom Schreibtisch des Schaffners.',
  },
};

export const ADVENT_COMBINATIONS = [];

export { INK, key, line, lines, paper, suitcase };
