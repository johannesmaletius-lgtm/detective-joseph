import { roundedRect, wrapText } from './text.js';
import { drawTicket } from '../puzzles/stamp.js';

// Gezeichnete Blätter und Bilder für die Wagen 5 bis 7 (als Karte anzeigen, siehe overlay.js):
//   await story.card({ draw: (ctx) => drawLetter(ctx, LETTERS[1]) });

const PRINT = '"Trebuchet MS", "Avenir Next", "Segoe UI", system-ui, sans-serif';
const TYPEWRITER = '"Courier New", "Courier", monospace';
const HAND = '"Noteworthy", "Bradley Hand", "Segoe Print", "Comic Sans MS", cursive';
const INK = '#2b2118';
const BLUE_INK = '#27408f';
const RED = '#b3261e';

function shadowed(ctx, draw) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 8;
  draw();
  ctx.restore();
}

// ============================================================================================
//  Postwagen: Briefe aus den Fächern
// ============================================================================================

// Die alten Briefe in den Fächern 1, 7, 13 und 27
export const LORE_LETTERS = {
  1: {
    stamp: 'RUNDE 1',
    paragraphs: [
      'Wir sind zu zweit eingestiegen. Zwei Detektive, ein Fall: der Zug, der nie ankommt.',
      'Der Schaffner hat gesagt: „Ein Kreis hat keinen Ausgang.“ Wir haben gelacht.',
    ],
  },
  7: {
    stamp: 'RUNDE 7',
    paragraphs: [
      'Wir haben es an der Weiche im Tunnel versucht. Er hat den Hebel gehalten, ich bin gefahren.',
      'Der Hebel ist zurückgesprungen. Der Zug fuhr wieder im Kreis – und er stand allein im Dunkeln.',
      'Seitdem setzt ihn der Tunnel nicht mehr zurück. Er vergisst nichts. Und er schläft nicht mehr.',
    ],
  },
  13: {
    stamp: 'RUNDE 13',
    paragraphs: [
      'Er schreibt mir Briefe. Ich schreibe zurück. Sehen tun wir uns nur im Dunkeln.',
      'Er sagt, ich soll vergessen dürfen. Er erinnert sich für uns beide.',
    ],
  },
  27: {
    stamp: 'RUNDE 27',
    paragraphs: [
      'ANLEITUNG – nicht verlieren!',
      'Den Kreis verlässt man nur im Tunnel, an Weiche 7. Der Zug muss davor halten: Notbremse.',
      'Dann die Weiche umstellen. Aber sie springt zurück, sobald man loslässt.',
      'Allein geht es nicht.',
    ],
  },
};

// Der Brief im Fach der aktuellen Runde – mit der Fahrkarte darin
export function roundLetter(round) {
  return {
    stamp: `RUNDE ${round}`,
    paragraphs: [
      'Hier ist deine Fahrkarte. Brandt lässt nur rein, wer sie für DIESE Runde gestempelt hat – nicht für die letzte, nicht für die nächste.',
      'Die Stempelmaschine ist eingetrocknet. Tinte hat nur noch mein Füller. Wenn du ihn willst: Im Dunkeln sitze ich am Sortiertisch.',
    ],
    ticket: true,
  };
}

export function drawLetter(ctx, { stamp, paragraphs, ticket = false }) {
  const width = 600, height = ticket ? 560 : 500, x = 640 - width / 2, y = 350 - height / 2;
  shadowed(ctx, () => {
    const gradient = ctx.createLinearGradient(0, y, 0, y + height);
    gradient.addColorStop(0, '#f5efe0');
    gradient.addColorStop(1, '#e6dcc4');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
  });
  // Poststempel
  ctx.save();
  ctx.translate(x + width - 90, y + 70);
  ctx.rotate(-0.2);
  ctx.strokeStyle = 'rgba(40, 40, 120, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 46, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(40, 40, 120, 0.8)';
  ctx.font = `bold 15px ${PRINT}`;
  ctx.textAlign = 'center';
  ctx.fillText(stamp, 0, -2);
  ctx.font = `12px ${PRINT}`;
  ctx.fillText('Bahnpost', 0, 16);
  ctx.restore();
  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `20px ${TYPEWRITER}`;
  ctx.fillText('An: Joseph', x + 40, y + 60);
  ctx.fillStyle = BLUE_INK;
  ctx.font = `24px ${HAND}`;
  let ty = y + 130;
  for (const paragraph of paragraphs) {
    for (const row of wrapText(ctx, paragraph, width - 80)) {
      ctx.fillText(row, x + 40, ty);
      ty += 32;
    }
    ty += 10;
  }
  ctx.textAlign = 'right';
  ctx.fillText('– J.', x + width - 40, ticket ? y + height - 150 : y + height - 30);
  if (ticket) {
    ctx.save();
    ctx.translate(x + 150, y + height - 120);
    ctx.rotate(-0.05);
    drawTicket(ctx, { x: 0, y: 0, width: 300, height: 92 }, null);
    ctx.restore();
  }
}

// Die Fahrkarte groß (Rechtsklick im Inventar)
export function drawTicketCard(ctx, printed) {
  ctx.save();
  ctx.translate(640, 340);
  ctx.rotate(-0.03);
  shadowed(ctx, () => {
    ctx.fillStyle = '#e9d7a8';
    roundedRect(ctx, -300, -100, 600, 200, 14);
    ctx.fill();
  });
  drawTicket(ctx, { x: -300, y: -100, width: 600, height: 200 }, printed);
  ctx.restore();
}

// ============================================================================================
//  Schaffnerabteil: der Fahrplan ist ein Kreis
// ============================================================================================

export function drawCircleTimetable(ctx) {
  const width = 640, height = 600, x = 640 - width / 2, y = 350 - height / 2;
  shadowed(ctx, () => {
    ctx.fillStyle = '#f1e8d0';
    ctx.fillRect(x, y, width, height);
  });
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `bold 28px ${PRINT}`;
  ctx.fillText('FAHRPLAN DER RINGBAHN', 640, y + 48);
  ctx.font = `15px ${TYPEWRITER}`;
  ctx.fillText('gültig für alle Runden', 640, y + 72);
  const cx = 640, cy = y + 318, r = 168;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  // Halte: alle gleich
  const stops = 8;
  for (let i = 0; i < stops; i++) {
    const a = -Math.PI / 2 + (i / stops) * Math.PI * 2;
    const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
    ctx.beginPath();
    ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? '#2b2118' : '#f1e8d0';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.stroke();
    if (i === 0) continue;
    const lx = cx + Math.cos(a) * (r + 62), ly = cy + Math.sin(a) * (r + 40);
    ctx.fillStyle = INK;
    ctx.font = `bold 13px ${PRINT}`;
    ctx.fillText('Ringbahnhof', lx, ly - 4);
    ctx.font = `14px ${TYPEWRITER}`;
    ctx.fillText('23:59', lx, ly + 14);
  }
  // oben: der Tunnel mit Weiche 7
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2 - 0.22, -Math.PI / 2 + 0.22);
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#1a1a1a';
  ctx.stroke();
  ctx.font = `bold 15px ${PRINT}`;
  ctx.fillText('TUNNEL', cx, cy - r - 30);
  // Abzweig aus dem Kreis heraus, durchgestrichen
  ctx.strokeStyle = RED;
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 7]);
  ctx.beginPath();
  ctx.moveTo(cx + 30, cy - r + 2);
  ctx.quadraticCurveTo(cx + 120, cy - r - 10, cx + 230, cy - r - 60);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = RED;
  ctx.font = `bold 15px ${PRINT}`;
  ctx.textAlign = 'left';
  ctx.fillText('Weiche 7 → Ausfahrt', cx + 150, cy - r - 70);
  ctx.font = `14px ${PRINT}`;
  ctx.fillText('gesperrt seit Runde 1', cx + 150, cy - r - 52);
  // in der Mitte: der Turm
  ctx.textAlign = 'center';
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.arc(cx, cy - 6, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = `13px ${PRINT}`;
  ctx.fillText('Turm', cx, cy + 20);
  ctx.fillStyle = BLUE_INK;
  ctx.font = `21px ${HAND}`;
  ctx.fillText('Abfahrt 23:59. Ankunft 23:59. Jede Runde.', 640, y + height - 24);
}

// ============================================================================================
//  Der Tunnel: das Ende
// ============================================================================================

// Der Zug fährt aus dem Tunnel – zum ersten Mal geradeaus, in den Morgen.
// progress 0 … 1: der Zug rollt aus dem Portal, die Sonne steigt.
export function drawDawn(ctx, progress = 1) {
  const sky = ctx.createLinearGradient(0, 0, 0, 720);
  sky.addColorStop(0, '#2a3a6a');
  sky.addColorStop(0.45, '#c97a6a');
  sky.addColorStop(0.68, '#f4c27a');
  sky.addColorStop(1, '#f9e2b0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1280, 720);
  // die letzten Sterne
  ctx.fillStyle = `rgba(255, 255, 255, ${0.6 - 0.4 * progress})`;
  for (const [x, y] of [[220, 60], [420, 110], [610, 40], [760, 90], [1040, 50], [1180, 130], [880, 30]]) ctx.fillRect(x, y, 2, 2);
  // Sonne geht auf
  const sunY = 540 - 70 * progress;
  const sun = ctx.createRadialGradient(990, sunY, 10, 990, sunY, 300);
  sun.addColorStop(0, 'rgba(255, 248, 220, 1)');
  sun.addColorStop(0.15, 'rgba(255, 224, 160, 0.85)');
  sun.addColorStop(1, 'rgba(255, 200, 120, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, 1280, 720);
  // ferne Hügel – und ganz klein der Turm mit dem roten Licht: Der Kreis bleibt zurück
  ctx.fillStyle = '#7a5a7a';
  ctx.beginPath();
  ctx.moveTo(0, 540);
  for (let x = 0; x <= 1280; x += 40) ctx.lineTo(x, 520 - Math.sin(x / 150) * 24 - Math.sin(x / 57) * 8);
  ctx.lineTo(1280, 720);
  ctx.lineTo(0, 720);
  ctx.fill();
  ctx.fillStyle = '#4a3a58';
  ctx.fillRect(560, 440, 8, 80);
  ctx.fillStyle = 'rgba(255, 80, 60, 0.9)';
  ctx.beginPath();
  ctx.arc(564, 436, 4, 0, Math.PI * 2);
  ctx.fill();
  // Boden, Schotter, ein gerades Gleis
  ctx.fillStyle = '#5a4a40';
  ctx.fillRect(0, 590, 1280, 130);
  ctx.fillStyle = '#3a302a';
  for (let x = -20; x < 1300; x += 34) ctx.fillRect(x, 612, 22, 10);
  ctx.strokeStyle = '#1e1a18';
  ctx.lineWidth = 5;
  for (const y of [608, 618]) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1280, y);
    ctx.stroke();
  }
  // Dunkel im Tunnel hinter der Öffnung
  ctx.fillStyle = '#0a0608';
  ctx.beginPath();
  ctx.moveTo(60, 620);
  ctx.lineTo(60, 470);
  ctx.quadraticCurveTo(190, 380, 320, 470);
  ctx.lineTo(320, 620);
  ctx.fill();
  // der Zug kommt aus dem Portal
  const front = 330 + 560 * progress;
  ctx.save();
  ctx.lineJoin = 'round';
  for (let i = 0; i < 4; i++) {
    const right = front - i * 250 - (i ? 30 : 0);
    const left = right - (i ? 230 : 260);
    ctx.fillStyle = i ? '#6b2620' : '#4a1a16';
    ctx.beginPath();
    ctx.moveTo(left, 500);
    ctx.lineTo(right - (i ? 0 : 40), 500);
    if (!i) ctx.quadraticCurveTo(right, 500, right, 540);
    ctx.lineTo(right, 600);
    ctx.lineTo(left, 600);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1a0f08';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = '#ffe2a0';
    for (let w = left + 22; w < right - (i ? 30 : 90); w += 52) ctx.fillRect(w, 520, 32, 30);
    ctx.fillStyle = '#1a1414';
    for (const wx of [left + 40, right - 40]) {
      ctx.beginPath();
      ctx.arc(wx, 604, 13, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Scheinwerfer
  const lamp = ctx.createRadialGradient(front, 560, 2, front, 560, 90);
  lamp.addColorStop(0, 'rgba(255, 250, 220, 1)');
  lamp.addColorStop(1, 'rgba(255, 250, 220, 0)');
  ctx.fillStyle = lamp;
  ctx.fillRect(front - 90, 470, 180, 180);
  ctx.restore();
  // Tunnelportal (vorne links) – mit Öffnung, aus der der Zug kommt
  ctx.fillStyle = '#3a3034';
  ctx.beginPath();
  ctx.rect(0, 300, 330, 320);
  ctx.moveTo(60, 620);
  ctx.lineTo(60, 470);
  ctx.quadraticCurveTo(190, 380, 320, 470);
  ctx.lineTo(320, 620);
  ctx.closePath();
  ctx.fill('evenodd');
  ctx.strokeStyle = '#1a1416';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 2;
  for (let y = 330; y < 620; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(y > 450 ? 60 : 330, y);
    ctx.stroke();
  }
  // Licht über allem
  ctx.fillStyle = `rgba(255, 230, 190, ${0.12 * progress})`;
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `bold 34px ${PRINT}`;
  ctx.fillStyle = 'rgba(40, 24, 20, 0.85)';
  ctx.fillText('Weiche 7. Geradeaus.', 640, 120);
}
