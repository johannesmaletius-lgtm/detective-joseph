// Kleine Zeichen, die im Spiel immer wieder vorkommen: auf dem Türschloss, auf dem Fahrplan, im Notizbuch.
//
//   drawSymbol(ctx, 'tower', x, y, 40, '#33261a');   // Mitte (x, y), Größe 40
//
// Zeichen: 'tunnel', 'lanternLeft', 'lanternRight', 'tower'

export const SYMBOL_NAMES = {
  tunnel: 'Tunnel',
  lanternLeft: 'Laterne links',
  lanternRight: 'Laterne rechts',
  tower: 'Turm',
};

export function drawSymbol(ctx, name, x, y, size, color) {
  const u = size / 40; // alle Maße unten gelten für Größe 40
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(u, u);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (name === 'tunnel') tunnel(ctx);
  if (name === 'tower') tower(ctx);
  if (name === 'lanternLeft') lantern(ctx, -1);
  if (name === 'lanternRight') lantern(ctx, 1);
  ctx.restore();
}

// Tunnelportal mit Gleis
function tunnel(ctx) {
  ctx.beginPath();
  ctx.moveTo(-17, 17);
  ctx.lineTo(-17, -2);
  ctx.arc(0, -2, 17, Math.PI, 0);
  ctx.lineTo(17, 17);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-9, 17);
  ctx.lineTo(-9, 0);
  ctx.arc(0, 0, 9, Math.PI, 0);
  ctx.lineTo(9, 17);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-20, 17);
  ctx.lineTo(20, 17);
  ctx.stroke();
}

// Gitterturm mit Licht an der Spitze
function tower(ctx) {
  ctx.beginPath();
  ctx.moveTo(-10, 18);
  ctx.lineTo(-3, -9);
  ctx.lineTo(3, -9);
  ctx.lineTo(10, 18);
  ctx.moveTo(-8, 10);
  ctx.lineTo(6, 0);
  ctx.moveTo(8, 10);
  ctx.lineTo(-6, 0);
  ctx.moveTo(-13, 18);
  ctx.lineTo(13, 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -13, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2.4;
  for (const angle of [-2.5, -1.57, -0.64]) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 7, -13 + Math.sin(angle) * 7);
    ctx.lineTo(Math.cos(angle) * 11, -13 + Math.sin(angle) * 11);
    ctx.stroke();
  }
}

// Laterne am Mast mit Pfeil nach links (−1) oder rechts (+1)
function lantern(ctx, direction) {
  const lx = -direction * 7; // die Laterne steht auf der Seite, von der der Pfeil wegzeigt
  ctx.beginPath();
  ctx.moveTo(lx, 18);
  ctx.lineTo(lx, -2);
  ctx.moveTo(lx - 6, 18);
  ctx.lineTo(lx + 6, 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(lx - 6, -2);
  ctx.lineTo(lx - 4, -12);
  ctx.lineTo(lx + 4, -12);
  ctx.lineTo(lx + 6, -2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(lx - 7, -13);
  ctx.lineTo(lx, -18);
  ctx.lineTo(lx + 7, -13);
  ctx.closePath();
  ctx.fill();
  // Pfeil
  const ax = direction * 4;
  ctx.beginPath();
  ctx.moveTo(ax, 6);
  ctx.lineTo(ax + direction * 14, 6);
  ctx.moveTo(ax + direction * 8, 0);
  ctx.lineTo(ax + direction * 14, 6);
  ctx.lineTo(ax + direction * 8, 12);
  ctx.stroke();
}
