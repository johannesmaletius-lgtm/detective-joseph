// Dunkelheit, wenn im Tunnel das Licht ausgeht.
//
// Über das Abteil legt sich fast schwarze Farbe. Ausgespart bleiben:
// - die Fenster (draußen ziehen die Lampen der Tunnelwand vorbei),
// - leuchtende Dinge wie der Bildschirm,
// - der Lichtkegel der Taschenlampe – er folgt dem Mauszeiger.
//
// Die Dunkelheit entsteht in einem eigenen Zwischenbild, aus dem die hellen Stellen
// "herausgeschnitten" werden. Erst dann kommt sie über das Spielbild.

const DARK = 'rgba(3, 2, 8, 0.95)';
const BEAM_RADIUS = 125;
const MARGIN = 20; // etwas größer als das Bild, damit beim Rumpeln kein heller Rand entsteht

export class Darkness {
  constructor() {
    this.buffer = null;
  }

  // level: 0 = hell, 1 = ganz dunkel
  // windows: [{ from, to, top, bottom }], lights: [{ x, y, radius }], beam: { x, y } oder null
  draw(ctx, level, { windows = [], lights = [], beam = null }) {
    if (level <= 0) return;
    const buffer = this.prepare(ctx);
    const dark = buffer.getContext('2d');
    const zoom = buffer.width / (1280 + 2 * MARGIN);
    dark.setTransform(zoom, 0, 0, zoom, MARGIN * zoom, MARGIN * zoom);
    dark.globalCompositeOperation = 'source-over';
    dark.clearRect(-MARGIN, -MARGIN, 1280 + 2 * MARGIN, 720 + 2 * MARGIN);
    dark.globalAlpha = level;
    dark.fillStyle = DARK;
    dark.fillRect(-MARGIN, -MARGIN, 1280 + 2 * MARGIN, 720 + 2 * MARGIN);

    dark.globalCompositeOperation = 'destination-out';
    dark.fillStyle = 'rgba(0, 0, 0, 0.8)';
    for (const window of windows) dark.fillRect(window.from, window.top, window.to - window.from, window.bottom - window.top);
    for (const light of lights) cutGlow(dark, light.x, light.y, light.radius, 0.85);
    if (beam) cutGlow(dark, beam.x, beam.y, BEAM_RADIUS, 1, 0.5);
    dark.globalAlpha = 1;
    dark.globalCompositeOperation = 'source-over';

    ctx.drawImage(buffer, -MARGIN, -MARGIN, 1280 + 2 * MARGIN, 720 + 2 * MARGIN);

    // warmer Schimmer im Lichtkegel
    if (beam) {
      const warm = ctx.createRadialGradient(beam.x, beam.y, 0, beam.x, beam.y, BEAM_RADIUS);
      warm.addColorStop(0, `rgba(255, 226, 170, ${0.16 * level})`);
      warm.addColorStop(1, 'rgba(255, 226, 170, 0)');
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = warm;
      ctx.fillRect(beam.x - BEAM_RADIUS, beam.y - BEAM_RADIUS, BEAM_RADIUS * 2, BEAM_RADIUS * 2);
      ctx.restore();
    }
  }

  // Liegt der Punkt im Lichtkegel?
  static inBeam(point, beam) {
    return beam !== null && Math.hypot(point.x - beam.x, point.y - beam.y) < BEAM_RADIUS * 0.6;
  }

  prepare(ctx) {
    const zoom = Math.min(2, Math.max(1, Math.round(ctx.getTransform().a)));
    const width = (1280 + 2 * MARGIN) * zoom;
    if (this.buffer?.width !== width) {
      this.buffer = document.createElement('canvas');
      this.buffer.width = width;
      this.buffer.height = (720 + 2 * MARGIN) * zoom;
    }
    return this.buffer;
  }
}

// Schneidet einen weichen, runden Fleck aus der Dunkelheit (strength 1 = ganz hell)
function cutGlow(ctx, x, y, radius, strength, core = 0) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(0, 0, 0, ${strength})`);
  if (core > 0) gradient.addColorStop(core, `rgba(0, 0, 0, ${strength})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}
