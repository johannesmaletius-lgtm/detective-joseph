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
  // Tischtuch-Kante oben, Licht der Lampe
  glow(ctx, 640, 300, 560, '255, 210, 140', 0.16);
  // Silbertablett: Schatten, Rand, Spiegelung
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(648, 486, 340, 84, 0, 0, Math.PI * 2);
  ctx.fill();
  const rim = ctx.createLinearGradient(310, 0, 970, 0);
  rim.addColorStop(0, '#7d8389');
  rim.addColorStop(0.3, '#eef1f3');
  rim.addColorStop(0.55, '#9aa0a5');
  rim.addColorStop(0.8, '#e2e6e9');
  rim.addColorStop(1, '#6c7277');
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.ellipse(640, 470, 334, 82, 0, 0, Math.PI * 2);
  ctx.fill();
  const inner = ctx.createLinearGradient(0, 400, 0, 540);
  inner.addColorStop(0, '#aeb4b9');
  inner.addColorStop(0.5, '#d6dade');
  inner.addColorStop(1, '#8a9095');
  ctx.fillStyle = inner;
  ctx.beginPath();
  ctx.ellipse(640, 472, 312, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60, 64, 68, 0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // gravierte Zierlinie
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(640, 472, 292, 62, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.beginPath();
  ctx.ellipse(560, 452, 170, 18, -0.05, 0, Math.PI * 2);
  ctx.fill();
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
    if (i === 2 && taken) {
      // Abdruck, wo das Glas stand
      ctx.strokeStyle = 'rgba(120, 16, 40, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, 466, 28, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }
    drawWineGlass(ctx, x, 470, poured > i ? 0.9 : 0.9);
    text(ctx, String(i + 1), x, 560, { font: `bold 18px ${PRINT}`, align: 'center', color: 'rgba(255, 240, 210, 0.75)' });
  });
  CUP_X.forEach((x) => drawCocoa(ctx, x, 480));
  glow(ctx, 640, 200, 380, '255, 220, 150', 0.18);
}

function drawWineGlass(ctx, x, y, fill) {
  ctx.save();
  ctx.translate(x, y);
  // Schatten auf dem Tablett
  ctx.fillStyle = 'rgba(40, 20, 20, 0.25)';
  ctx.beginPath();
  ctx.ellipse(10, -2, 34, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  const bowl = new Path2D();
  bowl.moveTo(-40, -170);
  bowl.bezierCurveTo(-48, -96, -30, -60, 0, -58);
  bowl.bezierCurveTo(30, -60, 48, -96, 40, -170);
  // Glas leicht getönt
  ctx.fillStyle = 'rgba(220, 235, 245, 0.10)';
  ctx.fill(bowl);
  // Wein mit Oberfläche
  ctx.save();
  ctx.clip(bowl);
  const level = -116 + (1 - fill) * 40;
  const wine = ctx.createLinearGradient(-40, 0, 40, 0);
  wine.addColorStop(0, 'rgba(70, 6, 22, 0.95)');
  wine.addColorStop(0.4, 'rgba(140, 20, 46, 0.92)');
  wine.addColorStop(1, 'rgba(60, 4, 18, 0.95)');
  ctx.fillStyle = wine;
  ctx.fillRect(-50, level, 100, 120);
  ctx.fillStyle = 'rgba(190, 50, 80, 0.85)';
  ctx.beginPath();
  ctx.ellipse(0, level, 44, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Glaskante
  ctx.strokeStyle = 'rgba(235, 245, 250, 0.85)';
  ctx.lineWidth = 2.5;
  ctx.stroke(bowl);
  ctx.strokeStyle = 'rgba(235, 245, 250, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -170, 40, 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Stiel und Fuß
  const stem = ctx.createLinearGradient(-4, 0, 4, 0);
  stem.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  stem.addColorStop(1, 'rgba(180, 200, 210, 0.6)');
  ctx.fillStyle = stem;
  ctx.fillRect(-2.5, -58, 5, 54);
  ctx.strokeStyle = 'rgba(235, 245, 250, 0.85)';
  ctx.beginPath();
  ctx.ellipse(0, -4, 30, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(235, 245, 250, 0.18)';
  ctx.fill();
  // Glanzlichter
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-30, -158);
  ctx.quadraticCurveTo(-36, -110, -22, -80);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  line(ctx, 28, -150, 30, -120);
  ctx.restore();
}

function drawCocoa(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  // Untertasse
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(6, 4, 52, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8e1d2';
  ctx.beginPath();
  ctx.ellipse(0, 0, 50, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2f5d8a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 44, 9.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Tasse, rundlich mit Schattierung
  const body = ctx.createLinearGradient(-30, 0, 30, 0);
  body.addColorStop(0, '#cfc6b3');
  body.addColorStop(0.35, '#fbf7ee');
  body.addColorStop(1, '#bdb39f');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-30, -64);
  ctx.lineTo(-27, -16);
  ctx.quadraticCurveTo(-24, -4, 0, -4);
  ctx.quadraticCurveTo(24, -4, 27, -16);
  ctx.lineTo(30, -64);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2f5d8a';
  ctx.lineWidth = 2;
  line(ctx, -29, -54, 29, -54);
  // Henkel
  ctx.strokeStyle = '#e6dfcf';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(33, -38, 13, -1.3, 1.3);
  ctx.stroke();
  // Kakao mit Schaum
  ctx.fillStyle = '#5a3218';
  ctx.beginPath();
  ctx.ellipse(0, -64, 30, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(214, 170, 120, 0.7)';
  ctx.beginPath();
  ctx.ellipse(-4, -65, 16, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Dampf
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 3;
  for (const dx of [-10, 8]) {
    ctx.beginPath();
    ctx.moveTo(dx, -74);
    ctx.bezierCurveTo(dx - 10, -92, dx + 10, -104, dx, -124);
    ctx.stroke();
  }
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
