// Gegenstände der Wagen 9–16. Wie in wagonItems.js im Code gezeichnet (icon, 128 × 128).
// keep: true = Joseph nimmt sie in spätere Wagen mit.

const INK = '#2b1c10';

export const WAGON_ITEMS_2 = {
  // ---------------------------------------------------------------- Wagen 10: Lautsprecherwagen
  tape108: {
    name: 'Tonband „108“',
    icon: (ctx) => {
      reel(ctx, 64, 60, 42, '#8a6a3c');
      label(ctx, 40, 98, 48, 20, '108');
    },
    look: 'Das Tonband aus Runde 108. Die Runde, in der Herr K. verschwand.',
  },

  // ---------------------------------------------------------------- Wagen 11: Uhrenwagen
  gear: {
    name: 'Zahnrad',
    keep: true,
    icon: (ctx) => gearIcon(ctx, 64, 64, 44, '#c9a24c', '#6e4f19'),
    look: 'Herrn Ticks Zahnrad. „Das wirst du vorne brauchen.“ Vorne – wo vorne?',
  },

  // ---------------------------------------------------------------- Wagen 12: Musiksalon
  score1: scorePiece(0, 'Notenblatt (Anfang)', 'Ein Stück Notenpapier. Der Anfang eines Liedes. Ein paar Noten haben ein kleines Kreuz darüber.'),
  score2: scorePiece(1, 'Notenblatt (Mitte)', 'Ein Stück Notenpapier aus der Mitte eines Liedes. Bleistiftkreuze über einzelnen Noten.'),
  score3: scorePiece(2, 'Notenblatt (Schluss)', 'Das letzte Stück eines Notenblatts. Der Schluss ist verwischt, als hätte jemand mit nassem Finger darübergewischt.'),
  score12: {
    name: 'Notenblatt (zwei Stücke)',
    icon: (ctx) => paper(ctx, 18, 30, 92, 68, -0.04, (c) => staff(c, 6, 14, 80)),
    look: 'Zwei Stücke des Notenblatts. Es fehlt noch eins.',
  },
  score: {
    name: 'Notenblatt',
    icon: (ctx) => paper(ctx, 10, 24, 108, 80, -0.03, (c) => {
      staff(c, 6, 14, 96);
      staff(c, 6, 46, 96);
    }),
    look: 'Herrn Molls Lied, wieder ganz. „Für die Weihnachtsfeier – Zug 24“.',
  },
  musicKey: {
    name: 'Kleiner Schlüssel',
    icon: (ctx) => key(ctx, '#d9b25a', '#6e4f19', 0.85),
    look: 'Ein kleiner Messingschlüssel aus der Spieldose. Am Griff ein Notenschlüssel.',
  },

  // ---------------------------------------------------------------- Wagen 13: Kapelle
  paperPencil: {
    name: 'Papier und Bleistift',
    icon: (ctx) => {
      paper(ctx, 20, 22, 80, 86, 0.06);
      ctx.save();
      ctx.translate(64, 70);
      ctx.rotate(-0.8);
      ctx.fillStyle = '#e1b23c';
      ctx.fillRect(-46, -6, 80, 12);
      ctx.fillStyle = '#f3d6a8';
      ctx.beginPath();
      ctx.moveTo(34, -6);
      ctx.lineTo(50, 0);
      ctx.lineTo(34, 6);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.fillRect(46, -2, 5, 4);
      ctx.restore();
    },
    look: 'Dünnes Papier und ein weicher Bleistift aus der Altarschublade. „Für die Tafel.“',
  },
  rubbing: {
    name: 'Abrieb der Gedenktafel',
    icon: (ctx) => paper(ctx, 14, 18, 100, 92, -0.05, (c) => {
      c.fillStyle = 'rgba(40, 40, 46, 0.65)';
      c.fillRect(6, 6, 88, 80);
      c.fillStyle = '#f1e5c6';
      for (let i = 0; i < 7; i++) c.fillRect(14, 14 + i * 10, i === 0 ? 72 : 30 + (i * 13) % 34, 4);
    }),
    look: 'Der Abrieb der Gedenktafel. Rechtsklick zum Lesen.',
  },
  lantern: {
    name: 'Laterne',
    icon: (ctx) => lanternIcon(ctx, false),
    look: 'Eine alte Laterne mit Scheiben aus Buntglas. In manchen sind winzige Löcher.',
  },
  litLantern: {
    name: 'Laterne (brennt)',
    icon: (ctx) => lanternIcon(ctx, true),
    look: 'Die Laterne brennt. Durch die Löcher im Buntglas fallen kleine rote Punkte.',
  },
  familyPhoto: {
    name: 'Familienfoto',
    keep: true,
    icon: (ctx) => {
      paper(ctx, 26, 16, 76, 96, 0.05, (c) => {
        c.fillStyle = '#7b5d3c';
        c.fillRect(6, 6, 64, 72);
        c.fillStyle = '#3b2a1a';
        c.beginPath();
        c.arc(26, 34, 8, 0, Math.PI * 2);
        c.arc(48, 40, 7, 0, Math.PI * 2);
        c.arc(36, 52, 5, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#4f6b3a';
        c.beginPath();
        c.moveTo(58, 14);
        c.lineTo(68, 60);
        c.lineTo(48, 60);
        c.fill();
      }, '#efe0bf');
    },
    look: 'Das Familienfoto aus der Kapelle: ein junger Schaffner, seine Frau, ihre kleine Tochter, ein Weihnachtsbaum. Er sieht aus wie ich.',
  },

  // ---------------------------------------------------------------- Wagen 14: Zeitungswagen
  magnifier: {
    name: 'Lupe',
    icon: (ctx) => {
      ctx.strokeStyle = '#6b4a22';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(78, 78);
      ctx.lineTo(112, 112);
      ctx.stroke();
      ctx.strokeStyle = '#c9a24c';
      ctx.lineWidth = 8;
      ctx.fillStyle = 'rgba(190, 220, 235, 0.55)';
      ctx.beginPath();
      ctx.arc(54, 54, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(42, 42, 9, 0, Math.PI * 2);
      ctx.fill();
    },
    look: 'Eine Lupe vom Lesetisch.',
  },
  holeyPaper: {
    name: 'Zeitung mit Löchern',
    icon: (ctx) => paper(ctx, 14, 16, 100, 96, -0.04, (c) => {
      c.fillStyle = INK;
      c.fillRect(8, 8, 84, 8);
      c.fillStyle = '#2a1f16';
      c.fillRect(10, 22, 30, 10);
      c.fillRect(48, 22, 20, 10);
      c.fillStyle = '#6d665c';
      c.fillRect(8, 40, 46, 32);
      lines(c, 60, 44, 32, 4, 8);
    }, '#e8e0cc'),
    look: 'Die Zeitung vom 25. Dezember – mit Löchern, wo jemand Wörter herausgeschnitten hat.',
  },
  snippets: {
    name: 'Papierschnipsel',
    icon: (ctx) => {
      for (let i = 0; i < 5; i++) paper(ctx, 20 + (i % 3) * 26, 24 + Math.floor(i / 3) * 40 + (i % 2) * 8, 38, 18, (i - 2) * 0.25, (c) => lines(c, 4, 8, 30, 1, 6), '#e8e0cc');
    },
    look: 'Ausgeschnittene Wörter aus dem Papierkorb.',
  },
  pressPhoto: {
    name: 'Zeitung vom 25. Dezember',
    keep: true,
    icon: (ctx) => paper(ctx, 14, 16, 100, 96, -0.04, (c) => {
      c.fillStyle = INK;
      c.fillRect(8, 8, 84, 10);
      c.fillStyle = '#6d665c';
      c.fillRect(8, 26, 46, 36);
      lines(c, 60, 30, 32, 4, 8);
      lines(c, 8, 70, 84, 2, 8);
    }, '#e8e0cc'),
    look: 'Die Zeitung vom 25. Dezember: „Weihnachtszug im Tunnel verschollen.“ Rechtsklick zum Lesen.',
  },

  // ---------------------------------------------------------------- Wagen 15: Spielzimmer
  toyKey: {
    name: 'Spielzeugschlüssel',
    icon: (ctx) => key(ctx, '#e0574a', '#7a2018', 0.8),
    look: 'Ein kleiner roter Schlüssel aus dem Spielzeugtunnel. Er passt bestimmt in ein Puppenhaus.',
  },
  drawing: {
    name: 'Miras Zeichnung',
    keep: true,
    icon: (ctx) => paper(ctx, 16, 22, 96, 84, 0.07, (c) => {
      c.fillStyle = '#3a3a3a';
      c.beginPath();
      c.arc(70, 52, 22, Math.PI, 0);
      c.lineTo(92, 74);
      c.lineTo(48, 74);
      c.fill();
      c.strokeStyle = '#2a63c9';
      c.lineWidth = 3;
      for (let i = 0; i < 4; i++) line(c, 12 + i * 10, 74, 12 + i * 10, 56);
      c.fillStyle = '#c0392b';
      c.fillRect(40, 44, 8, 6);
    }, '#fbf6e6'),
    look: 'Miras Zeichnung: Ein Mann mit meiner Mütze führt Leute in einen Tunnel. „Das ist Papa. Er bringt alle nach Hause.“',
  },

  // ---------------------------------------------------------------- Wagen 16: Funkraum
  headphones: {
    name: 'Kopfhörer',
    keep: true,
    icon: (ctx) => {
      ctx.strokeStyle = '#3c3a36';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(64, 66, 38, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      for (const x of [28, 100]) {
        ctx.fillStyle = '#7a5a34';
        ctx.beginPath();
        ctx.ellipse(x, 78, 16, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2a201a';
        ctx.beginPath();
        ctx.ellipse(x, 78, 9, 14, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    look: 'Die Kopfhörer des Funkers. Wer sie aufhat, hört nichts anderes mehr.',
  },
};

export const WAGON_COMBINATIONS_2 = [
  { items: ['score1', 'score2'], result: 'score12', say: ['Die zwei Stücke passen aneinander.'] },
  { items: ['score1', 'score3'], result: 'score12', say: ['Anfang und Schluss … dazwischen fehlt noch ein Stück, aber sie gehören zusammen.'] },
  { items: ['score2', 'score3'], result: 'score12', say: ['Mitte und Schluss passen aneinander.'] },
  { items: ['score12', 'score1'], result: 'score', say: ['Alle drei Stücke! Das Notenblatt ist wieder ganz.'] },
  { items: ['score12', 'score2'], result: 'score', say: ['Alle drei Stücke! Das Notenblatt ist wieder ganz.'] },
  { items: ['score12', 'score3'], result: 'score', say: ['Alle drei Stücke! Das Notenblatt ist wieder ganz.'] },
];

// ---------------------------------------------------------------- Zeichenhilfen
function line(ctx, x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

function lines(ctx, x, y, width, count, gap) {
  ctx.strokeStyle = 'rgba(43, 28, 16, 0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < count; i++) line(ctx, x, y + i * gap, x + width * (i % 3 === 2 ? 0.6 : 1), y + i * gap);
}

function paper(ctx, x, y, w, h, angle, inner, color = '#f1e5c6') {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(angle);
  ctx.translate(-w / 2, -h / 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(3, 4, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  inner?.(ctx);
  ctx.restore();
}

function staff(ctx, x, y, width) {
  ctx.strokeStyle = 'rgba(43, 28, 16, 0.7)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 5; i++) line(ctx, x, y + i * 4, x + width, y + i * 4);
  ctx.fillStyle = INK;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.ellipse(x + 10 + i * (width - 20) / 5, y + 2 + ((i * 7) % 5) * 3, 3.2, 2.4, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function scorePiece(index, name, look) {
  return {
    name,
    icon: (ctx) => paper(ctx, 30, 26, 68, 74, [-0.12, 0.05, 0.14][index], (c) => {
      staff(c, 4, 12, 60);
      staff(c, 4, 42, 60);
      c.strokeStyle = '#8c7a55';
      c.lineWidth = 2;
      c.beginPath();
      for (let yy = 0; yy <= 74; yy += 6) c.lineTo(index === 0 ? 66 : 2 + ((yy / 6) % 2 ? 3 : -1), yy);
      c.stroke();
    }),
    look,
  };
}

function key(ctx, light, dark, size = 1) {
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

function reel(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2a18';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b9a27a';
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r * 0.4, y + Math.sin(a) * r * 0.4, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function label(ctx, x, y, w, h, value) {
  ctx.fillStyle = '#efe2c0';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = INK;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x + w / 2, y + h / 2 + 1);
}

export function gearIcon(ctx, x, y, r, light, dark, teeth = 12) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = light;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 0.82 : r;
    const a2 = a + Math.PI / (teeth * 2);
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    ctx.lineTo(Math.cos(a2) * rr, Math.sin(a2) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function lanternIcon(ctx, lit) {
  ctx.save();
  if (lit) {
    const glow = ctx.createRadialGradient(64, 70, 4, 64, 70, 60);
    glow.addColorStop(0, 'rgba(255, 200, 110, 0.7)');
    glow.addColorStop(1, 'rgba(255, 200, 110, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 128, 128);
  }
  ctx.strokeStyle = '#2a1f16';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(64, 20, 10, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = '#3a2c20';
  ctx.fillRect(38, 26, 52, 10);
  ctx.fillRect(38, 100, 52, 10);
  const colors = ['#b3261e', '#d9a425', '#2a5fa8'];
  colors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.globalAlpha = lit ? 0.95 : 0.65;
    ctx.fillRect(42 + i * 15, 38, 13, 60);
  });
  ctx.globalAlpha = 1;
  if (lit) {
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.ellipse(64, 72, 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
