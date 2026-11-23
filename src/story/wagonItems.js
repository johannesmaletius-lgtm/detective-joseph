// Gegenstände ab Wagen 4. Ihre Bilder sind im Code gezeichnet (icon), je 128 × 128.
// Eingebunden werden sie in src/story/items.js.

const INK = '#2b1c10';

export const WAGON_ITEMS = {
  // ---------------------------------------------------------------- Wagen 4: Speisewagen
  menu: {
    name: 'Speisekarte',
    icon: (ctx) => paper(ctx, 30, 14, 68, 100, -0.06, (c) => {
      c.fillStyle = '#7a1f14';
      c.font = 'bold 13px serif';
      c.textAlign = 'center';
      c.fillText('MENÜ', 34, 22);
      lines(c, 10, 34, 48, 6, 11);
    }),
    look: 'Die Speisekarte des Speisewagens. „Weihnachtsmenü“.',
  },
  poisonGlass: {
    name: 'Weinglas (Bittermandel)',
    icon: (ctx) => wineGlass(ctx, '#7d1430'),
    look: 'Das Glas, das für Tisch drei bestimmt war. Es riecht nach Bittermandel. Gift.',
  },
  bill: {
    name: 'Rechnung',
    icon: (ctx) => paper(ctx, 34, 10, 60, 108, 0.05, (c) => {
      lines(c, 8, 16, 44, 9, 9);
      c.strokeStyle = INK;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(8, 96);
      c.lineTo(52, 96);
      c.stroke();
    }),
    look: 'Brunos Rechnung für das Weihnachtsmenü. Die Summe ist verwischt.',
  },
  carKey: {
    name: 'Wagenschlüssel',
    icon: (ctx) => key(ctx, '#d6a645', '#7a5418'),
    look: 'Ein schwerer Messingschlüssel. Auf dem Griff: „Speisewagen – Durchgang“.',
  },

  // ---------------------------------------------------------------- Wagen 5: Schlafwagen
  page: {
    name: 'Blatt Papier',
    icon: (ctx) => paper(ctx, 22, 26, 84, 76, 0.1, (c) => lines(c, 8, 14, 66, 5, 11)),
    look: 'Ein dünnes Blatt aus dem Fahrgastbuch. Leer – bis auf die Linien.',
  },
  needle: {
    name: 'Stricknadel',
    icon: (ctx) => {
      ctx.strokeStyle = '#8a8f99';
      ctx.lineWidth = 5;
      line(ctx, 22, 108, 104, 22);
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.arc(20, 110, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3f8f5a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(70, 64, 16, 0.4, 2.6);
      ctx.stroke();
    },
    look: 'Eine lange Stricknadel aus Oma Ilses Schublade. Dünn und fest.',
  },
  roomKey: {
    name: 'Schlüssel „4“',
    icon: (ctx) => {
      key(ctx, '#c9a24c', '#6e4f19');
      ctx.fillStyle = '#efe2c0';
      ctx.fillRect(74, 18, 34, 26);
      ctx.fillStyle = INK;
      ctx.font = 'bold 20px serif';
      ctx.textAlign = 'center';
      ctx.fillText('4', 91, 38);
    },
    look: 'Der Schlüssel von Abteil 4. Das ist das Abteil von Herrn K.',
  },
  suitcaseKey: {
    name: 'Kofferschlüssel',
    icon: (ctx) => key(ctx, '#9aa3ad', '#4a525b', 0.75),
    look: 'Ein winziger Kofferschlüssel. Er lag dort, wo der Mond nie hinkommt.',
  },
  photo: {
    name: 'Foto',
    icon: (ctx) => {
      ctx.save();
      ctx.translate(64, 64);
      ctx.rotate(-0.08);
      ctx.fillStyle = '#f3ecdc';
      ctx.fillRect(-44, -36, 88, 72);
      ctx.fillStyle = '#5b5148';
      ctx.fillRect(-38, -30, 76, 52);
      ctx.fillStyle = '#2a241f';
      for (const x of [-16, 14]) {
        ctx.beginPath();
        ctx.arc(x, -10, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - 9, -2, 18, 24);
      }
      ctx.restore();
    },
    look: 'Ein altes Foto: Herr K. und der Schaffner, Seite an Seite.',
  },

  // ---------------------------------------------------------------- Wagen 6: Fundbüro
  ticketPad: {
    name: 'Fundschein',
    icon: (ctx) => paper(ctx, 26, 20, 76, 92, 0, (c) => {
      c.fillStyle = '#9b2b1e';
      c.fillRect(0, 0, 76, 16);
      lines(c, 8, 30, 60, 6, 10);
    }),
    look: 'Ein Fundschein: „Verlorene Gegenstände – bitte genau beschreiben.“',
  },
  watch: {
    name: 'Taschenuhr',
    icon: (ctx) => {
      ctx.strokeStyle = '#a07a2c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(64, 22, 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#d4a63f';
      ctx.beginPath();
      ctx.arc(64, 72, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f6efdc';
      ctx.beginPath();
      ctx.arc(64, 72, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      line(ctx, 64, 72, 64, 48);
      line(ctx, 64, 72, 80, 80);
    },
    look: 'Eine goldene Taschenuhr. Sie steht.',
  },

  // ---------------------------------------------------------------- Wagen 7: Barwagen
  coin: {
    name: 'Münze',
    icon: (ctx) => {
      ctx.fillStyle = '#b98a2e';
      ctx.beginPath();
      ctx.ellipse(64, 66, 34, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e2b955';
      ctx.beginPath();
      ctx.ellipse(64, 62, 30, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a6420';
      ctx.font = 'bold 30px serif';
      ctx.textAlign = 'center';
      ctx.fillText('10', 64, 73);
    },
    look: 'Eine Münze. Zehn Pfennig. Genug für ein Lied.',
  },
  newspaper: {
    name: 'Zeitung',
    icon: (ctx) => paper(ctx, 18, 26, 92, 76, -0.05, (c) => {
      c.fillStyle = INK;
      c.fillRect(6, 6, 80, 10);
      lines(c, 6, 26, 36, 5, 9);
      c.fillStyle = '#8c8a84';
      c.fillRect(48, 24, 38, 34);
    }),
    look: 'Die Zeitung vom Tresen. Groß genug, um sich dahinter zu verstecken.',
  },
  drink: {
    name: 'Glas Whisky',
    icon: (ctx) => {
      ctx.fillStyle = 'rgba(200, 120, 30, 0.85)';
      ctx.fillRect(38, 64, 52, 38);
      ctx.strokeStyle = '#dfe9ee';
      ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, 56, 68);
    },
    look: 'Das Übliche von Herrn K.: ein Whisky.',
  },
  coaster: {
    name: 'Bierdeckel',
    icon: (ctx) => {
      ctx.fillStyle = '#e8d7a8';
      ctx.beginPath();
      ctx.arc(64, 64, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8f2b1d';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(64, 64, 38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) line(ctx, 44 + i * 9, 50, 44 + i * 9, 78);
      line(ctx, 40, 72, 84, 56);
    },
    look: 'Herrn K.s Bierdeckel. Voller Striche.',
  },

  // ---------------------------------------------------------------- Wagen 8: Bordkino
  ticketLeft: {
    name: 'Halbe Kinokarte',
    icon: (ctx) => ticket(ctx, 'left'),
    look: 'Die linke Hälfte einer Kinokarte. „Bordkino Ringbahn – Reihe …“',
  },
  ticketRight: {
    name: 'Halbe Kinokarte',
    icon: (ctx) => ticket(ctx, 'right'),
    look: 'Die rechte Hälfte einer Kinokarte. „… Platz …“',
  },
  ticket: {
    name: 'Kinokarte',
    icon: (ctx) => ticket(ctx, 'both'),
    look: 'Die Kinokarte, wieder zusammengesetzt.',
  },
  frames: {
    name: 'Filmbilder',
    icon: (ctx) => film(ctx, true),
    look: 'Acht einzelne Filmbilder, auseinandergeschnitten. Durcheinander.',
  },
  reel: {
    name: 'Filmrolle',
    icon: (ctx) => {
      ctx.fillStyle = '#5d6168';
      ctx.beginPath();
      ctx.arc(64, 64, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1d1f22';
      ctx.beginPath();
      ctx.arc(64, 64, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9aa0a8';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(64 + Math.cos(a) * 20, 64 + Math.sin(a) * 20, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(64, 64, 6, 0, Math.PI * 2);
      ctx.fill();
    },
    look: 'Die Filmrolle – alle acht Bilder in der richtigen Reihenfolge zusammengeklebt.',
  },
};

export const WAGON_COMBINATIONS = [
  {
    items: ['ticketLeft', 'ticketRight'],
    result: 'ticket',
    say: ['Die beiden Hälften passen genau aneinander.', '„Bordkino Ringbahn. Die letzte Runde. Reihe 3, Platz 12.“'],
  },
];

// ---------------------------------------------------------------- Zeichenhilfen
export function line(ctx, x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

export function lines(ctx, x, y, width, count, gap) {
  ctx.strokeStyle = 'rgba(43, 28, 16, 0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < count; i++) line(ctx, x, y + i * gap, x + width * (i % 3 === 2 ? 0.6 : 1), y + i * gap);
}

export function paper(ctx, x, y, w, h, angle, inner) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(angle);
  ctx.translate(-w / 2, -h / 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(3, 4, w, h);
  ctx.fillStyle = '#f1e5c6';
  ctx.fillRect(0, 0, w, h);
  inner?.(ctx);
  ctx.restore();
}

export function key(ctx, light, dark, size = 1) {
  ctx.save();
  ctx.translate(64, 64);
  ctx.scale(size, size);
  ctx.rotate(-0.7);
  ctx.fillStyle = light;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-30, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(-30, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = light;
  ctx.fillRect(-12, -5, 56, 10);
  ctx.strokeRect(-12, -5, 56, 10);
  ctx.fillRect(28, 5, 8, 12);
  ctx.fillRect(40, 5, 6, 9);
  ctx.restore();
}

function wineGlass(ctx, wine) {
  ctx.fillStyle = wine;
  ctx.beginPath();
  ctx.moveTo(42, 46);
  ctx.quadraticCurveTo(64, 88, 86, 46);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#e8f0f2';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(38, 18);
  ctx.quadraticCurveTo(36, 78, 64, 80);
  ctx.quadraticCurveTo(92, 78, 90, 18);
  ctx.stroke();
  line(ctx, 64, 80, 64, 108);
  line(ctx, 44, 110, 84, 110);
}

function ticket(ctx, part) {
  ctx.save();
  ctx.translate(64, 64);
  ctx.rotate(-0.12);
  const x0 = part === 'right' ? 0 : -50, x1 = part === 'left' ? 0 : 50;
  ctx.fillStyle = '#efe3bf';
  ctx.beginPath();
  ctx.moveTo(x0, -24);
  ctx.lineTo(x1, -24);
  ctx.lineTo(x1, 24);
  ctx.lineTo(x0, 24);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#9b2b1e';
  ctx.fillRect(x0, -24, x1 - x0, 9);
  ctx.strokeStyle = 'rgba(43, 28, 16, 0.6)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) line(ctx, x0 + 6, -4 + i * 9, x1 - 6, -4 + i * 9);
  if (part !== 'both') {
    // gezackte Rissstelle
    ctx.strokeStyle = '#8c7a55';
    ctx.beginPath();
    for (let y = -24; y <= 24; y += 6) ctx.lineTo((y / 6) % 2 ? 3 : -3, y);
    ctx.stroke();
  }
  ctx.restore();
}

function film(ctx, loose) {
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.translate(40 + i * 22, 50 + i * 12);
    ctx.rotate(loose ? (i - 1) * 0.3 : 0);
    ctx.fillStyle = '#26221e';
    ctx.fillRect(-20, -26, 40, 52);
    ctx.fillStyle = '#d8d2c4';
    ctx.fillRect(-14, -18, 28, 36);
    ctx.fillStyle = '#26221e';
    for (let y = -22; y < 26; y += 9) {
      ctx.fillStyle = '#d8d2c4';
      ctx.fillRect(-19, y, 3, 4);
      ctx.fillRect(16, y, 3, 4);
    }
    ctx.restore();
  }
}
