import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

// Entwickler-Ansicht – nur zum Bauen und Testen, nicht Teil des eigentlichen Spiels.
//
// Taste D: zeigt den begehbaren Bereich (grün), Hindernisse (rot), die nummerierten Ecken,
//          Josephs aktuellen Weg, Koordinaten und den Zustand von Zug und Ton.
// Taste G: blendet ein Koordinaten-Raster ein (hilft beim Eintragen neuer Eckpunkte).
export class DebugOverlay {
  constructor(enabled = false) {
    this.enabled = enabled;
    this.showGrid = false;
    this.fps = 60;
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  toggleGrid() {
    this.showGrid = !this.showGrid;
  }

  update(dt) {
    if (dt > 0) this.fps += (1 / dt - this.fps) * 0.05; // geglätteter Mittelwert
  }

  // Wird mit der Kamera gezeichnet – alles liegt an seiner Position in der Spielwelt.
  drawWorld(ctx, game) {
    if (this.showGrid) drawGrid(ctx);
    if (!this.enabled) return;

    const { walkArea } = game.scene;
    drawPolygon(ctx, walkArea.outline, 'rgba(90, 255, 150, 0.16)', '#6dffa6');
    for (const hole of walkArea.holes) drawPolygon(ctx, hole, 'rgba(255, 80, 80, 0.28)', '#ff7070');
    walkArea.outline.forEach((corner, i) => drawLabel(ctx, String(i), corner.x + 6, corner.y - 6, '#6dffa6'));

    // Josephs Weg
    const { player } = game;
    if (player.movement.isMoving) {
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      for (const point of player.movement.path) ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = '#ffd36b';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      for (const point of player.movement.path) drawDot(ctx, point, '#ffd36b');
    }
    drawDot(ctx, player, '#ffffff');

    // Mauszeiger: grün = begehbar, rot = nicht begehbar (+ wohin Joseph stattdessen liefe)
    if (game.input.mouse.inside) {
      const mouse = game.camera.screenToWorld(game.input.mouse);
      const walkable = walkArea.contains(mouse);
      drawCross(ctx, mouse, walkable ? '#6dffa6' : '#ff7070');
      if (!walkable) drawDot(ctx, walkArea.closestPoint(mouse), '#ff7070');
    }
  }

  // Wird ohne Kamera gezeichnet – bleibt oben links auf dem Bildschirm.
  drawScreen(ctx, game) {
    if (!this.enabled) return;
    const { player, scene, input } = game;
    const mouse = game.camera.screenToWorld(input.mouse);
    const lines = [
      'DEBUG   D = aus   G = Raster   M = Ton',
      `Maus    x ${Math.round(mouse.x)}  y ${Math.round(mouse.y)}  ${scene.walkArea.contains(mouse) ? 'begehbar' : 'nicht begehbar'}`,
      `Joseph  x ${Math.round(player.x)}  y ${Math.round(player.y)}  Größe ${Math.round(scene.characterHeightAt(player.y))} px  Blick ${player.facing}`,
      `Zug     Tempo ${scene.motion?.speed ?? 0}  Ton ${game.sound.muted ? 'aus' : 'an'}`,
      `FPS     ${Math.round(this.fps)}`,
    ];

    ctx.save();
    ctx.font = '14px ui-monospace, Menlo, monospace';
    ctx.textBaseline = 'top';
    const width = Math.max(...lines.map((line) => ctx.measureText(line).width)) + 24;
    ctx.fillStyle = 'rgba(12, 7, 4, 0.8)';
    ctx.fillRect(10, 10, width, lines.length * 20 + 16);
    ctx.fillStyle = '#f3e2bf';
    lines.forEach((line, i) => ctx.fillText(line, 22, 18 + i * 20));
    ctx.restore();
  }
}

function drawGrid(ctx) {
  ctx.save();
  ctx.font = '11px ui-monospace, Menlo, monospace';
  for (let x = 0; x <= GAME_WIDTH; x += 50) {
    ctx.fillStyle = x % 100 === 0 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.14)';
    ctx.fillRect(x, 0, 1, GAME_HEIGHT);
    if (x % 100 === 0) drawLabel(ctx, String(x), x + 3, 12, '#fff');
  }
  for (let y = 0; y <= GAME_HEIGHT; y += 50) {
    ctx.fillStyle = y % 100 === 0 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.14)';
    ctx.fillRect(0, y, GAME_WIDTH, 1);
    if (y % 100 === 0) drawLabel(ctx, String(y), 3, y - 3, '#fff');
  }
  ctx.restore();
}

function drawPolygon(ctx, polygon, fill, stroke) {
  ctx.beginPath();
  polygon.forEach((point, i) => (i === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawDot(ctx, point, color) {
  ctx.beginPath();
  ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawCross(ctx, point, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(point.x - 9, point.y);
  ctx.lineTo(point.x + 9, point.y);
  ctx.moveTo(point.x, point.y - 9);
  ctx.lineTo(point.x, point.y + 9);
  ctx.stroke();
}

function drawLabel(ctx, text, x, y, color) {
  ctx.font = '12px ui-monospace, Menlo, monospace';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}
