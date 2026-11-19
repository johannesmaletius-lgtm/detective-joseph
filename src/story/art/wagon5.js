import { loadImage } from '../../core/assets.js';
import { HAND, INK, PRINT, SERIF, glow, line, sheet, text } from './common.js';

// Gezeichnetes für Wagen 5 (Schlafwagen): Fahrgastbuch, Abteil 4 als Suchbild, das Foto.

let compartment = null;
loadImage('assets/scenes/wagon-05/abteil-k.webp').then((image) => { compartment = image; });

// ---------------------------------------------------------------- Fahrgastbuch
export function drawGuestBook(ctx) {
  sheet(ctx, 330, 80, 620, 560, {
    color: '#efe6cf',
    shade: '#d9c8a0',
    inner: (c) => {
      text(c, 'Schlafwagen – Fahrgastbuch', 310, 50, { font: `bold 26px ${SERIF}`, align: 'center' });
      c.strokeStyle = INK;
      c.lineWidth = 2;
      line(c, 30, 66, 590, 66);
      const rows = [
        ['Abteil 1', '— frei —'],
        ['Abteil 2', '— frei —'],
        ['Abteil 3', 'Frau Ilse  (bitte nicht wecken!)'],
        ['Abteil 4', 'Herr K.  (Weckruf: niemals)'],
      ];
      rows.forEach(([room, name], i) => {
        const y = 130 + i * 70;
        text(c, room, 40, y, { font: `bold 22px ${PRINT}` });
        text(c, name, 180, y, { font: `24px ${HAND}`, color: '#27408f' });
        c.strokeStyle = 'rgba(43, 33, 24, 0.25)';
        c.lineWidth = 1;
        line(c, 30, y + 18, 590, y + 18);
      });
      text(c, 'Hinweis des Schaffners:', 40, 440, { font: `italic 20px ${SERIF}` });
      text(c, 'Die Notbremse ist außer Betrieb.', 40, 470, { font: `italic 20px ${SERIF}` });
      text(c, 'Wer einen Fahrgast weckt, trägt die Verantwortung.', 40, 500, { font: `italic 20px ${SERIF}` });
      text(c, 'Viele leere Seiten folgen …', 590, 540, { font: `16px ${HAND}`, align: 'right', color: 'rgba(43,33,24,0.6)' });
    },
  });
}

// ---------------------------------------------------------------- Abteil 4 als Suchbild
// Spuren: id, Rechteck, Name. clue = zählt zu den sechs Spuren.
export const COMPARTMENT_SPOTS = [
  { id: 'hatbox', x: 712, y: 510, w: 148, h: 128, label: 'Hutschachtel', clue: true },
  { id: 'glasses', x: 362, y: 352, w: 84, h: 40, label: 'Brille', clue: true },
  { id: 'shoes', x: 928, y: 490, w: 128, h: 82, label: 'Schuhe', clue: true },
  { id: 'footprints', x: 744, y: 630, w: 350, h: 62, label: 'Fußspuren', clue: true },
  { id: 'button', x: 656, y: 646, w: 48, h: 40, label: 'Knopf', clue: true },
  { id: 'ticket', x: 438, y: 410, w: 86, h: 44, label: 'Fahrschein', clue: true },
  { id: 'coat', x: 384, y: 160, w: 116, h: 220, label: 'Mantel' },
  { id: 'cup', x: 894, y: 346, w: 52, h: 46, label: 'Tasse' },
  { id: 'bedDrawer', x: 350, y: 578, w: 268, h: 62, label: 'Bettkasten' },
  { id: 'window', x: 640, y: 160, w: 280, h: 150, label: 'Fenster' },
];

export function drawCompartment(ctx, found) {
  if (compartment) ctx.drawImage(compartment, 0, 0, 1280, 721);
  // Dinge, die es nur im Spiel gibt (nicht im gemalten Bild)
  // Brille auf dem Bücherstapel
  ctx.save();
  ctx.strokeStyle = '#2a2420';
  ctx.lineWidth = 3;
  for (const x of [388, 420]) {
    ctx.beginPath();
    ctx.ellipse(x, 372, 13, 11, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(200, 230, 255, 0.35)';
    ctx.fill();
  }
  line(ctx, 401, 370, 407, 370);
  line(ctx, 375, 370, 362, 364);
  line(ctx, 433, 370, 446, 364);
  // Fahrschein, der aus der Zeitung schaut
  ctx.translate(480, 432);
  ctx.rotate(-0.25);
  ctx.fillStyle = '#efe0b4';
  ctx.fillRect(-38, -14, 76, 28);
  ctx.fillStyle = '#9b2b1e';
  ctx.fillRect(-38, -14, 76, 7);
  ctx.strokeStyle = 'rgba(43, 33, 24, 0.5)';
  ctx.lineWidth = 1.5;
  line(ctx, -30, 2, 30, 2);
  line(ctx, -30, 8, 18, 8);
  ctx.restore();
  // Messingknopf auf dem Boden
  ctx.save();
  ctx.fillStyle = '#c99a3a';
  ctx.beginPath();
  ctx.arc(680, 666, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7a5418';
  ctx.lineWidth = 2;
  ctx.stroke();
  glow(ctx, 677, 662, 10, '255, 240, 190', 0.5);
  ctx.restore();
  // feuchte Fußspuren (Socken), vom Bett zur Tür
  ctx.save();
  ctx.fillStyle = 'rgba(30, 22, 18, 0.5)';
  for (let i = 0; i < 6; i++) {
    const x = 770 + i * 56, y = 676 - i * 7 + (i % 2 ? 12 : 0);
    ctx.beginPath();
    ctx.ellipse(x, y, 19, 9, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(200, 220, 255, 0.12)'; // nass glänzend
    ctx.beginPath();
    ctx.ellipse(x - 4, y - 3, 8, 3, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(30, 22, 18, 0.5)';
  }
  ctx.restore();
  // Gefundenes markieren
  for (const spot of COMPARTMENT_SPOTS) {
    if (!found.includes(spot.id)) continue;
    ctx.save();
    ctx.strokeStyle = 'rgba(140, 255, 160, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(spot.x + spot.w / 2, spot.y + spot.h / 2, spot.w / 2 + 6, spot.h / 2 + 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // Zähler
  const count = COMPARTMENT_SPOTS.filter((spot) => spot.clue && found.includes(spot.id)).length;
  ctx.fillStyle = 'rgba(12, 7, 4, 0.75)';
  ctx.fillRect(20, 18, 250, 42);
  text(ctx, `Spuren: ${count} von 6`, 145, 46, { font: `bold 20px ${PRINT}`, color: '#f6e7c1', align: 'center' });
}

// ---------------------------------------------------------------- Das Foto (Vorder- und Rückseite)
export function drawPhoto(ctx) {
  // Vorderseite
  ctx.save();
  ctx.translate(390, 360);
  ctx.rotate(-0.04);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#f2ead8';
  ctx.fillRect(-230, -180, 460, 360);
  ctx.shadowColor = 'transparent';
  const sepia = ctx.createLinearGradient(0, -160, 0, 140);
  sepia.addColorStop(0, '#a88e6c');
  sepia.addColorStop(1, '#5d4a35');
  ctx.fillStyle = sepia;
  ctx.fillRect(-210, -160, 420, 290);
  // Weihnachtsbaum im Hintergrund
  ctx.fillStyle = 'rgba(40, 32, 22, 0.55)';
  ctx.beginPath();
  ctx.moveTo(150, -140);
  ctx.lineTo(205, 120);
  ctx.lineTo(95, 120);
  ctx.closePath();
  ctx.fill();
  // Herr K.: Hut, Mantel, Stock, Brille
  drawFigure(ctx, -70, 120, { hat: 'fedora', coat: '#3b3024' });
  // Schaffner: Mütze, Uniform mit Knöpfen, Schnurrbart
  drawFigure(ctx, 40, 120, { hat: 'cap', coat: '#2a2a33', buttons: true });
  ctx.restore();

  // Rückseite
  sheet(ctx, 700, 190, 400, 300, {
    angle: 0.05,
    color: '#efe6d2',
    shade: '#dcccaa',
    inner: (c) => {
      text(c, 'K. und ich', 30, 70, { font: `30px ${HAND}`, color: '#27408f' });
      text(c, 'Weihnachtsfeier im Speisewagen', 30, 120, { font: `24px ${HAND}`, color: '#27408f' });
      text(c, '24. 12.', 30, 180, { font: `bold 44px ${HAND}`, color: '#27408f' });
      text(c, '– dein Schaffner', 370, 250, { font: `24px ${HAND}`, color: '#27408f', align: 'right' });
      c.strokeStyle = 'rgba(120, 90, 50, 0.4)';
      c.lineWidth = 1;
      line(c, 20, 200, 380, 200);
    },
  });
  text(ctx, 'Vorderseite', 390, 586, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
  text(ctx, 'Rückseite', 900, 540, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

function drawFigure(ctx, x, foot, { hat, coat, buttons }) {
  ctx.save();
  ctx.translate(x, foot);
  ctx.fillStyle = coat;
  ctx.beginPath();
  ctx.moveTo(-34, 0);
  ctx.lineTo(-28, -150);
  ctx.quadraticCurveTo(0, -170, 28, -150);
  ctx.lineTo(34, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d8c3a0';
  ctx.beginPath();
  ctx.arc(0, -180, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a2018';
  if (hat === 'fedora') {
    ctx.fillRect(-30, -200, 60, 6);
    ctx.fillRect(-18, -222, 36, 24);
    ctx.strokeStyle = '#2a2018';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-8, -180, 6, 0, Math.PI * 2);
    ctx.arc(8, -180, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 4;
    line(ctx, 40, 0, 34, -100);
  } else {
    ctx.fillRect(-24, -208, 48, 16);
    ctx.fillRect(-28, -194, 56, 5);
    ctx.fillStyle = '#c9a24c';
    ctx.beginPath();
    ctx.arc(0, -200, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a2018';
    ctx.fillRect(-12, -172, 24, 5);
  }
  if (buttons) {
    ctx.fillStyle = '#c9a24c';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(0, -135 + i * 30, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

