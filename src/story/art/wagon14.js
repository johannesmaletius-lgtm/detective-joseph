import { loadImage } from '../../core/assets.js';
import {
  BLUE_INK, HAND, INK, PRINT, SERIF, TYPEWRITER, cachedLayer, contactShadow, glow, line, plank, rivet, roundedRect, sheet, text, vignette,
} from './common.js';

// Gezeichnetes für Wagen 14 (Zeitungswagen): das Kreuzworträtsel, die Zeitung vom 25. Dezember
// mit herausgeschnittenen Wörtern, die Schnipsel und das Pressefoto mit der Bahnhofsuhr.

let press = null;
loadImage('assets/scenes/wagon-14/pressefoto.webp').then((image) => { press = image; });

// ---------------------------------------------------------------- Kreuzworträtsel
// key = Stelle des Buchstabens, der ins Lösungswort kommt
export const ROWS = [
  { q: 'Was trank Herr K.?', answer: 'WHISKY', key: 0, options: ['WHISKY', 'ROTWEIN', 'KAFFEE'] },
  { q: 'Wer strickt im Schlafwagen?', answer: 'ILSE', key: 3, options: ['IRMA', 'ILSE', 'ILKA'] },
  { q: 'Wonach roch das Gift?', answer: 'BITTERMANDEL', key: 1, options: ['PFEFFERMINZE', 'BITTERMANDEL', 'ORANGENBLÜTE'] },
  { q: 'Wer ruft die Fahrgäste zum Tunnel?', answer: 'SCHAFFNER', key: 1, options: ['LOKFÜHRER', 'BARKEEPER', 'SCHAFFNER'] },
  { q: 'Was schenkte Herr Tick zum Dank?', answer: 'ZAHNRAD', key: 2, options: ['UHRWERK', 'ZAHNRAD', 'KUCKUCK'] },
  { q: 'Was spielte Herr Moll?', answer: 'KLAVIER', key: 5, options: ['GITARRE', 'SAXOFON', 'KLAVIER'] },
];
export const START_FILL = ['WHISKY', null, 'BITTERMANDEL', 'LOKFÜHRER', 'ZAHNRAD', null]; // in „meiner“ Schrift
export const SOLUTION = 'WEICHE';

const CELL = 34;
const KEY_X = 760; // Spalte des Lösungsworts

export function crosswordSpots() {
  return ROWS.map((row, i) => ({ id: `row${i}`, row: i, x: 150, y: 150 + i * 68, w: 980, h: 54, label: `${i + 1}. ${row.q}` }));
}

export function drawCrossword(ctx, fill) {
  sheet(ctx, 120, 60, 1040, 600, {
    color: '#ece4ce',
    shade: '#d8ccac',
    inner: (c) => {
      text(c, 'Kreuzworträtsel – Der Weihnachtszug', 520, 50, { font: `bold 28px ${SERIF}`, align: 'center' });
      ROWS.forEach((row, i) => {
        const y = 90 + i * 68;
        text(c, `${i + 1}. ${row.q}`, 30, y + 34, { font: `18px ${SERIF}` });
        const start = KEY_X - 120 - row.key * CELL;
        const value = fill[i];
        for (let k = 0; k < row.answer.length; k++) {
          const x = start + k * CELL;
          const isKey = k === row.key;
          c.fillStyle = isKey ? '#f3d48a' : '#fbf7ea';
          c.fillRect(x, y + 8, CELL, CELL);
          c.strokeStyle = INK;
          c.lineWidth = isKey ? 3 : 1.5;
          c.strokeRect(x, y + 8, CELL, CELL);
          if (value && value[k]) text(c, value[k], x + CELL / 2, y + 34, { font: `bold 22px ${HAND}`, color: BLUE_INK, align: 'center' });
        }
      });
      text(c, 'Lösungswort: die gelben Kästchen von oben nach unten.', 520, 520, { font: `italic 18px ${SERIF}`, align: 'center' });
    },
  });
}

// ---------------------------------------------------------------- Die Zeitung vom 25. Dezember
// Löcher (Plätze) und Schnipsel (Kärtchen). size: 'big' für die Schlagzeile, 'small' für den Text.
export const HOLES = [
  { word: 'WEIHNACHTSZUG', x: 250, y: 138, w: 330, h: 58, size: 'big' },
  { word: 'TUNNEL', x: 660, y: 138, w: 170, h: 58, size: 'big' },
  { word: 'VERSCHOLLEN', x: 450, y: 206, w: 300, h: 58, size: 'big' },
  { word: 'vermisst', x: 670, y: 458, w: 116, h: 30, size: 'small' },
];
export const SNIPPETS = [
  { id: 's1', word: 'TUNNEL', size: 'big', home: { x: 1180, y: 150 } },
  { id: 's2', word: 'gerettet', size: 'small', home: { x: 1170, y: 250 } },
  { id: 's3', word: 'WEIHNACHTSZUG', size: 'big', home: { x: 1100, y: 340 } },
  { id: 's4', word: 'BAHNHOF', size: 'big', home: { x: 1170, y: 430 } },
  { id: 's5', word: 'vermisst', size: 'small', home: { x: 1180, y: 520 } },
  { id: 's6', word: 'VERSCHOLLEN', size: 'big', home: { x: 1110, y: 610 } },
];

export function snippetSize(snippet) {
  const big = snippet.size === 'big';
  return { w: big ? Math.max(130, snippet.word.length * 22 + 16) : 112, h: big ? 50 : 28 };
}

export function drawNewspaper(ctx) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 0, 1280, 720);
  sheet(ctx, 180, 30, 840, 660, {
    color: '#ebe3cf',
    shade: '#d7cdb3',
    inner: (c) => {
      text(c, 'RINGBAHN-KURIER', 420, 62, { font: `bold 46px ${SERIF}`, align: 'center' });
      text(c, 'Freitag, 25. Dezember · Weihnachtsausgabe', 420, 90, { font: `italic 16px ${SERIF}`, align: 'center' });
      c.strokeStyle = INK;
      c.lineWidth = 2;
      line(c, 30, 100, 810, 100);
      text(c, 'IM', 440, 152, { font: `bold 40px ${SERIF}`, align: 'center' });
      // Foto
      if (press) c.drawImage(press, 40, 250, 420, 280);
      c.strokeRect(40, 250, 420, 280);
      // Spalten
      const caption = [
        'Unter den Fahrgästen: Frau und',
        'Tochter des Schaffners. Er selbst',
        'wartete am Bahnsteig. Zeugen sahen',
        'ihn in der Nacht allein in den',
        'Tunnel laufen. Er wird seitdem',
      ];
      caption.forEach((row, i) => text(c, row, 490, 290 + i * 32, { font: `20px ${SERIF}` }));
      text(c, '.', 610, 450, { font: `20px ${SERIF}` });
      text(c, 'Zug 24 erreichte in der Heiligen Nacht den Bahnhof nicht.', 40, 580, { font: `16px ${SERIF}` });
      text(c, 'Die Suche im Berg dauert an.', 40, 604, { font: `16px ${SERIF}` });
    },
  });
  // Löcher
  for (const hole of HOLES) {
    ctx.fillStyle = '#20160f';
    ctx.fillRect(hole.x, hole.y, hole.w, hole.h);
  }
  text(ctx, 'Schnipsel', 1150, 100, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

export function drawSnippet(ctx, token, x, y) {
  const snippet = SNIPPETS.find((s) => s.id === token.id);
  const { w, h } = snippetSize(snippet);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(token.place?.slot === null ? ((token.id.charCodeAt(1) % 5) - 2) * 0.03 : 0);
  ctx.fillStyle = '#ebe3cf';
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = 'rgba(80, 60, 40, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  text(ctx, snippet.word, 0, snippet.size === 'big' ? 11 : 7, { font: snippet.size === 'big' ? `bold 30px ${SERIF}` : `20px ${SERIF}`, color: INK, align: 'center' });
  ctx.restore();
}

// ---------------------------------------------------------------- Pressefoto und Bahnhofsuhr
export const PHOTO = { x: 190, y: 60, w: 900, h: 600 };
export const CLOCK = { cx: 308, cy: 165, r: 80 }; // im Bild (900 × 600)
export const PHOTO_SPOTS = [{ id: 'clock', cx: PHOTO.x + CLOCK.cx, cy: PHOTO.y + CLOCK.cy, r: 90, label: 'Bahnhofsuhr' }];

function clockHands(ctx, cx, cy, r) {
  ctx.strokeStyle = '#1b1712';
  ctx.lineCap = 'round';
  const hour = ((11 + 47 / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  const minute = (47 / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.lineWidth = r * 0.09;
  line(ctx, cx, cy, cx + Math.cos(hour) * r * 0.5, cy + Math.sin(hour) * r * 0.5);
  ctx.lineWidth = r * 0.06;
  line(ctx, cx, cy, cx + Math.cos(minute) * r * 0.78, cy + Math.sin(minute) * r * 0.78);
  ctx.fillStyle = '#1b1712';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

export function drawPressPhoto(ctx) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(0, 0, 1280, 720);
  if (!press) return;
  ctx.drawImage(press, PHOTO.x, PHOTO.y, PHOTO.w, PHOTO.h);
  // ohne Lupe nur verschwommen zu erkennen (grober Zeitungsdruck): erst das Zifferblatt unscharf,
  // dann die Zeiger als verwaschene Schatten darüber – sonst wirkt die Uhr wie ohne Zeiger
  ctx.save();
  ctx.filter = 'blur(3px)';
  ctx.globalAlpha = 0.5;
  ctx.drawImage(press, CLOCK.cx - CLOCK.r, CLOCK.cy - CLOCK.r, CLOCK.r * 2, CLOCK.r * 2, PHOTO.x + CLOCK.cx - CLOCK.r, PHOTO.y + CLOCK.cy - CLOCK.r, CLOCK.r * 2, CLOCK.r * 2);
  ctx.restore();
  ctx.save();
  ctx.filter = 'blur(5px)';
  ctx.globalAlpha = 0.55;
  clockHands(ctx, PHOTO.x + CLOCK.cx, PHOTO.y + CLOCK.cy, CLOCK.r * 0.92);
  ctx.restore();
  // Zeitungsraster: im kleinen Bild kaum zu erkennen
  ctx.fillStyle = 'rgba(235, 227, 207, 0.12)';
  for (let y = PHOTO.y; y < PHOTO.y + PHOTO.h; y += 4) ctx.fillRect(PHOTO.x, y, PHOTO.w, 1);
}

// Durch die Lupe: die Uhr ganz groß
export function drawMagnified(ctx) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, 1280, 720);
  if (!press) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(640, 360, 260, 0, Math.PI * 2);
  ctx.clip();
  const scale = 2.6;
  ctx.drawImage(press, 640 - CLOCK.cx * scale, 360 - CLOCK.cy * scale, 900 * scale, 600 * scale);
  clockHands(ctx, 640, 360, CLOCK.r * scale * 0.92);
  ctx.restore();
  ctx.strokeStyle = '#c9a24c';
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.arc(640, 360, 270, 0, Math.PI * 2);
  ctx.stroke();
  glow(ctx, 560, 280, 120, '255, 255, 255', 0.1);
}

// Der Archivschrank, unterste Schublade aufgezogen: darin die einzige Zeitung vom 25. Dezember
const DRAWERS = ['A – F', 'G – M', 'N – S', '24. – 25. Dez.'];

function paintArchive(c) {
  // Wand und Boden des Zeitungswagens
  plank(c, 0, 0, 1280, 720, { tone: [70, 44, 26], seed: 141, vertical: true, knots: 0 });
  for (let x = 40; x < 1280; x += 150) {
    c.fillStyle = 'rgba(0, 0, 0, 0.3)';
    c.fillRect(x, 0, 3, 720);
  }
  plank(c, 0, 640, 1280, 80, { tone: [64, 40, 22], seed: 142 });
  c.fillStyle = 'rgba(0, 0, 0, 0.45)';
  c.fillRect(0, 636, 1280, 6);
  vignette(c, 0, 0, 1280, 720, 0.65);
  glow(c, 640, 120, 560, '255, 214, 150', 0.16);
  contactShadow(c, 640, 646, 380, 26, 0.75);
  // Korpus: Eiche, mit Sockel und Deckplatte
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.7)';
  c.shadowBlur = 36;
  c.shadowOffsetY = 14;
  c.fillStyle = '#4a2a14';
  c.fillRect(330, 70, 620, 572);
  c.restore();
  plank(c, 330, 70, 620, 572, { tone: [104, 62, 32], seed: 143, vertical: true, knots: 2 });
  plank(c, 312, 56, 656, 26, { tone: [122, 74, 38], seed: 144 });
  c.fillStyle = 'rgba(255, 220, 160, 0.3)';
  c.fillRect(312, 56, 656, 2);
  c.fillStyle = 'rgba(0, 0, 0, 0.45)';
  c.fillRect(330, 82, 620, 6);
  plank(c, 322, 612, 636, 30, { tone: [78, 46, 24], seed: 145 });
  c.fillStyle = 'rgba(0, 0, 0, 0.4)';
  c.fillRect(322, 612, 636, 3);
  // Seitenkanten etwas dunkler
  for (const [x, dir] of [[330, 1], [950, -1]]) {
    const side = c.createLinearGradient(x, 0, x + dir * 26, 0);
    side.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    side.addColorStop(1, 'rgba(0, 0, 0, 0)');
    c.fillStyle = side;
    c.fillRect(Math.min(x, x + dir * 26), 88, 26, 524);
  }
  // Drei geschlossene Schubladen
  for (let i = 0; i < 3; i++) drawerFront(c, 356, 104 + i * 118, 568, 104, DRAWERS[i], 150 + i);
  // Die unterste ist aufgezogen: dunkle Öffnung, darin die Schublade (Seitenwände, Hängeordner, Zeitung)
  c.fillStyle = '#140c06';
  c.fillRect(356, 458, 568, 140);
  // Schubladenkasten nach vorne gezogen: Seitenwände in Perspektive
  c.fillStyle = '#6a4020';
  c.beginPath();
  c.moveTo(356, 470); c.lineTo(330, 506); c.lineTo(330, 610); c.lineTo(356, 598); c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(924, 470); c.lineTo(950, 506); c.lineTo(950, 610); c.lineTo(924, 598); c.closePath();
  c.fill();
  // Innenraum
  const inside = c.createLinearGradient(0, 470, 0, 560);
  inside.addColorStop(0, '#1c120a');
  inside.addColorStop(1, '#3a2412');
  c.fillStyle = inside;
  c.beginPath();
  c.moveTo(356, 470); c.lineTo(924, 470); c.lineTo(950, 506); c.lineTo(330, 506); c.closePath();
  c.fill();
  // Hängeordner hinten, leer bis auf alte Ausgaben
  for (let k = 0; k < 9; k++) {
    const x = 372 + k * 62;
    c.fillStyle = k % 2 ? '#8a7a56' : '#9a8a62';
    c.beginPath();
    c.moveTo(x, 498); c.lineTo(x + 6, 474); c.lineTo(x + 50, 474); c.lineTo(x + 56, 498); c.closePath();
    c.fill();
    c.fillStyle = 'rgba(0, 0, 0, 0.35)';
    c.fillRect(x, 494, 56, 4);
  }
  // Die Zeitung: zusammengefaltet, schräg obenauf
  c.save();
  c.translate(560, 492);
  c.rotate(-0.05);
  c.shadowColor = 'rgba(0, 0, 0, 0.6)';
  c.shadowBlur = 12;
  c.shadowOffsetY = 4;
  const paper = c.createLinearGradient(0, -30, 0, 14);
  paper.addColorStop(0, '#efe7d2');
  paper.addColorStop(1, '#cfc3a2');
  c.fillStyle = paper;
  c.beginPath();
  c.moveTo(-6, -34); c.lineTo(200, -38); c.lineTo(212, 12); c.lineTo(-14, 16); c.closePath();
  c.fill();
  c.shadowColor = 'transparent';
  text(c, 'RINGBAHN-KURIER', 98, -14, { font: `bold 16px ${SERIF}`, align: 'center' });
  c.strokeStyle = INK;
  c.lineWidth = 1;
  line(c, 4, -8, 194, -10);
  text(c, '25. Dezember', 98, 4, { font: `italic 10px ${SERIF}`, align: 'center' });
  c.fillStyle = 'rgba(30, 20, 12, 0.85)';
  c.fillRect(10, 6, 52, 6);
  c.fillRect(130, 6, 60, 6);
  c.restore();
  glow(c, 660, 480, 140, '255, 236, 190', 0.12);
  // Schubladenfront vorne unten (aufgezogen, daher tiefer und etwas breiter)
  drawerFront(c, 330, 506, 620, 106, DRAWERS[3], 153);
  glow(c, 640, 60, 420, '255, 226, 170', 0.12);
}

// Eine Schubladenfront mit Profil, Messing-Kartenhalter und Griffmuschel
function drawerFront(c, x, y, w, h, label, seed) {
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.55)';
  c.shadowBlur = 10;
  c.shadowOffsetY = 4;
  c.fillStyle = '#5a3418';
  c.fillRect(x, y, w, h);
  c.restore();
  plank(c, x, y, w, h, { tone: [118, 70, 36], seed, knots: 1 });
  // Profil: Lichtkante oben/links, Schatten unten/rechts, innere Füllung
  c.fillStyle = 'rgba(255, 224, 170, 0.22)';
  c.fillRect(x, y, w, 2);
  c.fillRect(x, y, 2, h);
  c.fillStyle = 'rgba(0, 0, 0, 0.4)';
  c.fillRect(x, y + h - 3, w, 3);
  c.fillRect(x + w - 3, y, 3, h);
  c.strokeStyle = 'rgba(30, 14, 4, 0.45)';
  c.lineWidth = 2;
  c.strokeRect(x + 14, y + 12, w - 28, h - 24);
  c.strokeStyle = 'rgba(255, 220, 160, 0.15)';
  c.lineWidth = 1;
  c.strokeRect(x + 16, y + 14, w - 28, h - 24);
  const cx = x + w / 2;
  // Kartenhalter aus Messing mit getippter Karte
  const hg = c.createLinearGradient(0, y + 22, 0, y + 50);
  hg.addColorStop(0, '#f2d98c');
  hg.addColorStop(1, '#8a6a24');
  c.fillStyle = hg;
  roundedRect(c, cx - 70, y + 20, 140, 32, 4);
  c.fill();
  c.fillStyle = '#efe6cc';
  c.fillRect(cx - 62, y + 25, 124, 22);
  c.fillStyle = 'rgba(120, 90, 40, 0.25)';
  c.fillRect(cx - 62, y + 25, 124, 3);
  text(c, label, cx, y + 42, { font: `bold ${label.length > 8 ? 13 : 15}px ${TYPEWRITER}`, color: INK, align: 'center' });
  rivet(c, cx - 66, y + 36, 2.5, [150, 120, 50]);
  rivet(c, cx + 66, y + 36, 2.5, [150, 120, 50]);
  // Griffmuschel
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.6)';
  c.shadowBlur = 6;
  c.shadowOffsetY = 3;
  const pg = c.createLinearGradient(0, y + 60, 0, y + 84);
  pg.addColorStop(0, '#f6de94');
  pg.addColorStop(0.5, '#c49a40');
  pg.addColorStop(1, '#6a4a14');
  c.fillStyle = pg;
  c.beginPath();
  c.moveTo(cx - 44, y + 62);
  c.lineTo(cx + 44, y + 62);
  c.quadraticCurveTo(cx + 40, y + 86, cx, y + 86);
  c.quadraticCurveTo(cx - 40, y + 86, cx - 44, y + 62);
  c.fill();
  c.restore();
  c.fillStyle = 'rgba(40, 24, 6, 0.65)';
  c.beginPath();
  c.ellipse(cx, y + 66, 36, 5, 0, 0, Math.PI * 2);
  c.fill();
  rivet(c, cx - 48, y + 64, 3, [160, 128, 56]);
  rivet(c, cx + 48, y + 64, 3, [160, 128, 56]);
}

export function drawArchive(ctx) {
  ctx.drawImage(cachedLayer('w14-archive', paintArchive), 0, 0, 1280, 720);
}
