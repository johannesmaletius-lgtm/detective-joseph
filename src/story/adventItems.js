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

  // ---------------------------------------------------------------- Tür 10: Lautsprecherwagen
  fuseBox: {
    name: 'Ersatzsicherungen',
    icon: (ctx) => {
      ctx.fillStyle = '#5a4a32';
      ctx.fillRect(16, 40, 96, 60);
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = '#efe9da';
        ctx.fillRect(24 + i * 18, 30, 12, 50);
        ctx.fillStyle = '#b8b2a2';
        ctx.fillRect(24 + i * 18, 26, 12, 8);
      }
    },
    look: 'Fünf Sicherungen: 2, 6, 10, 16 und 25 Ampere.',
  },
  reel108: {
    name: 'Tonband „Runde 108“',
    icon: (ctx) => {
      ctx.fillStyle = '#c8c4bc';
      ctx.beginPath();
      ctx.arc(64, 64, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5a4630';
      ctx.beginPath();
      ctx.arc(64, 64, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c8c4bc';
      ctx.beginPath();
      ctx.arc(64, 64, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#efe3c2';
      ctx.fillRect(30, 96, 68, 20);
      ctx.fillStyle = '#2b1c10';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('R. 108', 40, 111);
    },
    look: 'Das Tonband aus Runde 108.',
  },

  // ---------------------------------------------------------------- Tür 11: Uhrenwagen
  gear: {
    name: 'Zahnrad',
    keep: true,
    icon: (ctx) => {
      ctx.save();
      ctx.translate(64, 64);
      ctx.fillStyle = '#c9a24a';
      ctx.strokeStyle = '#6e5420';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const r = i % 2 ? 36 : 46;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#6e5420';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    look: 'Das Zahnrad von Herrn Tick. „Das wirst du vorne brauchen.“',
  },
};

export const ADVENT_COMBINATIONS = [];

export { INK, key, line, lines, paper, suitcase };
