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
};

export const ADVENT_COMBINATIONS = [];

export { INK, key, line, lines, paper, suitcase };
