import { loadImage } from '../../core/assets.js';
import { BLUE_INK, HAND, INK, PRINT, SERIF, TYPEWRITER, glow, line, rivet, sheet, text, wood } from './common.js';

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

export function drawArchive(ctx) {
  // Archivschrank aus Eiche, vier Schubladen; die unterste ist aufgezogen
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#3a200e';
  ctx.fillRect(300, 70, 680, 580);
  ctx.restore();
  wood(ctx, 300, 70, 680, 580, [110, 66, 32]);
  ctx.fillStyle = '#2a1608';
  ctx.fillRect(300, 70, 680, 24);
  ctx.fillRect(300, 626, 680, 24);
  text(ctx, 'ARCHIV · RINGBAHN-KURIER', 640, 88, { font: `bold 14px ${SERIF}`, color: '#c9a24c', align: 'center' });
  const labels = ['A – F', 'G – M', 'N – S', '24. – 25. Dez.'];
  for (let i = 0; i < 4; i++) {
    const open = i === 3;
    const x = open ? 326 : 340;
    const y = 110 + i * 124;
    const w = open ? 628 : 600;
    const h = 108;
    // Schatten der Fuge
    ctx.fillStyle = '#1a0d04';
    ctx.fillRect(338, y - 2, 604, h + 4);
    if (open) {
      // Blick in die offene Lade: Zeitungen hochkant
      ctx.fillStyle = '#120a04';
      ctx.fillRect(330, y - 40, 620, 44);
      for (let k = 0; k < 9; k++) {
        ctx.fillStyle = k % 2 ? '#d9cfb4' : '#e6dcc0';
        ctx.fillRect(350 + k * 64, y - 34 + (k % 3) * 3, 54, 38);
        ctx.fillStyle = 'rgba(40, 30, 20, 0.35)';
        ctx.fillRect(354 + k * 64, y - 28 + (k % 3) * 3, 30, 3);
      }
    }
    const front = ctx.createLinearGradient(x, y, x, y + h);
    front.addColorStop(0, open ? '#8a5428' : '#7a4a22');
    front.addColorStop(1, '#4e2c12');
    ctx.fillStyle = front;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255, 220, 170, 0.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.strokeRect(x + 12, y + 12, w - 20, h - 20);
    const cx = x + w / 2;
    // Messing-Kartenhalter mit Etikett
    const brass = ctx.createLinearGradient(cx - 70, y + 22, cx + 70, y + 56);
    brass.addColorStop(0, '#f2d27e');
    brass.addColorStop(1, '#94681e');
    ctx.fillStyle = brass;
    ctx.beginPath();
    ctx.roundRect(cx - 72, y + 20, 144, 40, 4);
    ctx.fill();
    ctx.fillStyle = '#f3ead2';
    ctx.fillRect(cx - 62, y + 27, 124, 26);
    text(ctx, labels[i], cx, y + 46, { font: `bold 16px ${TYPEWRITER}`, color: INK, align: 'center' });
    rivet(ctx, cx - 66, y + 40, 3, { tone: '#c9a24c' });
    rivet(ctx, cx + 66, y + 40, 3, { tone: '#c9a24c' });
    // Bügelgriff
    ctx.strokeStyle = '#c9a24c';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 36, y + 70);
    ctx.quadraticCurveTo(cx, y + 96, cx + 36, y + 70);
    ctx.stroke();
    rivet(ctx, cx - 38, y + 70, 5, { tone: '#c9a24c' });
    rivet(ctx, cx + 38, y + 70, 5, { tone: '#c9a24c' });
  }
  // Schloss oben rechts (offen)
  ctx.fillStyle = '#c9a24c';
  ctx.beginPath();
  ctx.arc(920, 84, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a0d04';
  ctx.fillRect(919, 79, 2, 10);
  glow(ctx, 640, 520, 260, '255, 220, 150', 0.12);
}
