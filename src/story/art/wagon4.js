import { HAND, INK, PRINT, RED, SERIF, glow, line, sheet, smudge, text, wood } from './common.js';

// Gezeichnetes für Wagen 4 (Speisewagen): Tischplan, Namenskärtchen, Tablett mit Gläsern,
// Speisekarte und Rechnung.

// ---------------------------------------------------------------- Tischplan (für die Ordnen-Ansicht)
const COLUMNS = [470, 810];
const ROWS = [236, 386, 536];
export const TABLE_IDS = ['LH', 'LM', 'LV', 'RH', 'RM', 'RV'];
export const SEAT_SLOTS = TABLE_IDS.map((id, i) => {
  const x = COLUMNS[i < 3 ? 0 : 1], y = ROWS[i % 3];
  return { x: x - 64, y: y - 26, w: 128, h: 52, label: `Tisch ${i + 1}` };
});

export function drawSeatingPlan(ctx) {
  sheet(ctx, 250, 70, 780, 610, {
    angle: 0,
    inner: (c) => {
      // Wagen von oben: vorne (Tür) ist oben
      c.strokeStyle = INK;
      c.lineWidth = 3;
      c.strokeRect(110, 70, 560, 510);
      c.clearRect(330, 66, 120, 8);
      text(c, 'Tür', 390, 58, { font: `18px ${PRINT}`, align: 'center' });
      text(c, 'Küche', 160, 98, { font: `16px ${PRINT}`, align: 'center' });
      text(c, 'Kasse', 620, 98, { font: `16px ${PRINT}`, align: 'center' });
      c.fillStyle = 'rgba(43, 33, 24, 0.12)';
      c.fillRect(112, 72, 100, 40);
      c.fillRect(568, 72, 100, 40);
      // Fenster an den Seiten
      c.lineWidth = 6;
      c.strokeStyle = 'rgba(80, 110, 160, 0.6)';
      for (const y of [150, 300, 450]) {
        line(c, 110, y, 110, y + 70);
        line(c, 670, y, 670, y + 70);
      }
      text(c, 'Fenster', 96, 330, { font: `14px ${PRINT}`, align: 'right' });
      // Tische
      c.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const cx = COLUMNS[i < 3 ? 0 : 1] - 250, cy = ROWS[i % 3] - 70;
        c.fillStyle = '#efe8d8';
        c.strokeStyle = 'rgba(43, 33, 24, 0.6)';
        c.beginPath();
        c.ellipse(cx, cy, 78, 46, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      }
      text(c, 'hinten', 96, 170, { font: `14px ${PRINT}`, align: 'right', color: 'rgba(43,33,24,0.6)' });
      text(c, 'vorne', 96, 470, { font: `14px ${PRINT}`, align: 'right', color: 'rgba(43,33,24,0.6)' });
      text(c, 'Gang', 390, 330, { font: `16px ${PRINT}`, align: 'center', color: 'rgba(43,33,24,0.5)' });
      text(c, 'Brunos Tischplan – die Kärtchen sind vertauscht', 390, 604, { font: `18px ${HAND}`, align: 'center' });
    },
  });
}

export function drawNameCard(ctx, token, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(-58, -18, 120, 44);
  ctx.fillStyle = '#fbf6ea';
  ctx.fillRect(-60, -22, 120, 44);
  ctx.fillStyle = '#e6dcc4';
  ctx.fillRect(-60, 12, 120, 10);
  ctx.strokeStyle = '#b89a5c';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-56, -18, 112, 34);
  text(ctx, token.label, 0, 6, { font: `${token.label.length > 12 ? 15 : 20}px ${HAND}`, align: 'center' });
  ctx.restore();
}

// ---------------------------------------------------------------- Tablett mit Gläsern
export const GLASS_X = [400, 520, 640, 760, 880];
export const CUP_X = [1010, 1100];

export function drawTray(ctx, { taken = false, bill = false, poured = 0 } = {}) {
  wood(ctx, 120, 150, 1040, 470, [110, 64, 30]);
  ctx.strokeStyle = 'rgba(30, 15, 5, 0.7)';
  ctx.lineWidth = 6;
  ctx.strokeRect(120, 150, 1040, 470);
  // Tablett
  ctx.save();
  const gradient = ctx.createLinearGradient(0, 360, 0, 520);
  gradient.addColorStop(0, '#d9dde0');
  gradient.addColorStop(1, '#8b9196');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(640, 470, 330, 80, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6f757a';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
  // Rechnung unter dem dritten Glas
  if (bill) {
    ctx.save();
    ctx.translate(660, 488);
    ctx.rotate(0.15);
    ctx.fillStyle = '#f3e8cc';
    ctx.fillRect(-20, -14, 92, 46);
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.5)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) line(ctx, -10, -2 + i * 10, 60, -2 + i * 10);
    ctx.restore();
  }
  GLASS_X.forEach((x, i) => {
    if (i === 2 && taken) return;
    drawWineGlass(ctx, x, 470, poured > i ? 0.9 : 0.9);
    text(ctx, String(i + 1), x, 560, { font: `bold 18px ${PRINT}`, align: 'center', color: 'rgba(255, 240, 210, 0.75)' });
  });
  CUP_X.forEach((x) => drawCocoa(ctx, x, 480));
  glow(ctx, 640, 200, 380, '255, 220, 150', 0.18);
}

function drawWineGlass(ctx, x, y, fill) {
  ctx.save();
  ctx.translate(x, y);
  // Wein
  ctx.fillStyle = 'rgba(120, 16, 40, 0.92)';
  ctx.beginPath();
  ctx.moveTo(-34, -112 + (1 - fill) * 40);
  ctx.quadraticCurveTo(0, -36, 34, -112 + (1 - fill) * 40);
  ctx.closePath();
  ctx.fill();
  // Glas
  ctx.strokeStyle = 'rgba(235, 245, 250, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-40, -170);
  ctx.quadraticCurveTo(-46, -64, 0, -58);
  ctx.quadraticCurveTo(46, -64, 40, -170);
  ctx.stroke();
  line(ctx, 0, -58, 0, -6);
  ctx.beginPath();
  ctx.ellipse(0, -4, 30, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  line(ctx, -28, -160, -30, -100);
  ctx.restore();
}

function drawCocoa(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#f2ece0';
  ctx.beginPath();
  ctx.ellipse(0, 0, 44, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e9e2d2';
  ctx.fillRect(-28, -64, 56, 60);
  ctx.fillStyle = '#6b3d1f';
  ctx.beginPath();
  ctx.ellipse(0, -64, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e9e2d2';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(34, -36, 13, -1.2, 1.2);
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- Speisekarte
export function drawMenu(ctx) {
  sheet(ctx, 440, 60, 400, 590, {
    angle: 0.015,
    color: '#f6eedb',
    shade: '#e2d2ab',
    inner: (c) => {
      c.strokeStyle = '#7a1f14';
      c.lineWidth = 3;
      c.strokeRect(16, 16, 368, 558);
      c.lineWidth = 1;
      c.strokeRect(22, 22, 356, 546);
      text(c, 'Speisewagen der Ringbahn', 200, 70, { font: `italic 22px ${SERIF}`, color: '#7a1f14', align: 'center' });
      text(c, 'Weihnachtsmenü', 200, 112, { font: `bold 30px ${SERIF}`, color: INK, align: 'center' });
      const rows = [
        ['Kartoffelsuppe', '3'],
        ['Rinderbraten mit Klößen', '9'],
        ['Vanillepudding', '2'],
        null,
        ['Glas Rotwein', '4'],
        ['Tasse Kakao', '2'],
        ['Tasse Kaffee', '1'],
      ];
      let y = 172;
      for (const row of rows) {
        if (!row) {
          c.strokeStyle = 'rgba(122, 31, 20, 0.5)';
          line(c, 120, y - 12, 280, y - 12);
          y += 26;
          continue;
        }
        text(c, row[0], 46, y, { font: `21px ${SERIF}` });
        text(c, `${row[1]} Mark`, 354, y, { font: `21px ${SERIF}`, align: 'right' });
        c.strokeStyle = 'rgba(43, 33, 24, 0.25)';
        c.setLineDash([2, 5]);
        line(c, 46 + c.measureText(row[0]).width + 50, y - 6, 290, y - 6);
        c.setLineDash([]);
        y += 46;
      }
      text(c, 'Wein nur für Erwachsene.', 200, 506, { font: `italic 17px ${SERIF}`, align: 'center' });
      text(c, 'Wer nicht volljährig ist, bekommt Kakao.', 200, 530, { font: `italic 17px ${SERIF}`, align: 'center' });
    },
  });
}

// ---------------------------------------------------------------- Rechnung (Brunos Schrift)
export function drawBill(ctx) {
  sheet(ctx, 400, 50, 480, 610, {
    angle: -0.02,
    inner: (c) => {
      text(c, 'Rechnung – Weihnachtsmenü', 240, 52, { font: `bold 24px ${PRINT}`, align: 'center' });
      c.strokeStyle = INK;
      c.lineWidth = 2;
      line(c, 30, 66, 450, 66);
      const lines = [
        '6 Tische gedeckt.',
        'An jedem Tisch 1 Gast –',
        'nur an Tisch 6 die Dame mit Tochter.',
        '',
        'Für jeden: Suppe, Braten, Pudding.',
        'Für jeden ein Getränk:',
        'Wein – oder Kakao (siehe Karte!).',
        '',
        'Gläser: von hinten nach vorne,',
        'erst links, dann rechts.',
      ];
      lines.forEach((value, i) => text(c, value, 34, 108 + i * 34, { font: `22px ${HAND}` }));
      text(c, 'Summe:', 34, 492, { font: `bold 26px ${HAND}` });
      smudge(c, 150, 460, 150, 46, 'rgba(110, 30, 40, 0.75)');
      text(c, 'Mark', 330, 492, { font: `26px ${HAND}` });
      text(c, 'Die Kasse muss stimmen!', 240, 560, { font: `22px ${HAND}`, color: RED, align: 'center' });
      text(c, '– Bruno', 440, 596, { font: `20px ${HAND}`, align: 'right' });
    },
  });
}
