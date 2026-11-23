// Dunkelheit, wenn im Tunnel das Licht ausgeht.
//
// Über das Abteil legt sich fast schwarze Farbe. Ausgespart bleiben:
// - leuchtende Dinge wie der Bildschirm,
// - der Lichtkegel der Taschenlampe – er folgt dem Mauszeiger.
// Die Fensterscheiben werden danach noch einmal obendrauf gezeichnet (draußen ziehen die Lampen der
// Tunnelwand vorbei) – aber nur das Glas: Was im Abteil vor einem Fenster steht, bleibt ein dunkler Umriss.
//
// Die Dunkelheit entsteht in einem eigenen Zwischenbild, aus dem die hellen Stellen
// "herausgeschnitten" werden. Erst dann kommt sie über das Spielbild.

const DARK = 'rgba(3, 2, 8, 0.95)';
const BEAM_RADIUS = 125;
const MARGIN = 20; // etwas größer als das Bild, damit beim Rumpeln kein heller Rand entsteht
const GLASS_BAND = { top: 50, height: 300 }; // hier liegen alle Fenster (mit Rand fürs Schaukeln)

export class Darkness {
  constructor() {
    this.buffer = null;
    this.glassBuffer = null;
  }

  // level: 0 = hell, 1 = ganz dunkel
  // lights: [{ x, y, radius }], beam: { x, y } oder null
  // glass:  (optional) Funktion (ctx) => { … }, die nur die Fensterscheiben zeichnet (siehe scene.js)
  draw(ctx, level, { glass = null, lights = [], beam = null }) {
    if (level <= 0) return;
    // Die Dunkelheit besteht nur aus weichen Verläufen – dafür reicht einfache Auflösung (spart viel Rechenzeit).
    const buffer = this.buffer = this.prepare(ctx, this.buffer, 1);
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
    for (const light of lights) cutGlow(dark, light.x, light.y, light.radius, 0.85);
    if (beam) cutGlow(dark, beam.x, beam.y, BEAM_RADIUS, 1, 0.5);
    dark.globalAlpha = 1;
    dark.globalCompositeOperation = 'source-over';

    ctx.save();
    ctx.imageSmoothingQuality = 'low'; // weiche Verläufe: einfaches Hochrechnen genügt und ist viel schneller
    ctx.drawImage(buffer, -MARGIN, -MARGIN, 1280 + 2 * MARGIN, 720 + 2 * MARGIN);
    ctx.restore();

    // Fensterscheiben: Blick nach draußen über die Dunkelheit legen
    if (glass) {
      // Fenster gibt es nur im oberen Band des Bildes – nur dort wird gezeichnet.
      const glassBuffer = this.glassBuffer = this.prepare(ctx, this.glassBuffer);
      const pane = glassBuffer.getContext('2d');
      const paneZoom = glassBuffer.width / (1280 + 2 * MARGIN);
      const { top, height } = GLASS_BAND;
      pane.setTransform(paneZoom, 0, 0, paneZoom, MARGIN * paneZoom, MARGIN * paneZoom);
      pane.globalCompositeOperation = 'source-over';
      pane.clearRect(-MARGIN, top, 1280 + 2 * MARGIN, height);
      pane.save();
      pane.beginPath();
      pane.rect(-MARGIN, top, 1280 + 2 * MARGIN, height);
      pane.clip();
      glass(pane);
      pane.restore();
      pane.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.globalAlpha = 0.85 * level;
      ctx.imageSmoothingQuality = 'low';
      ctx.drawImage(glassBuffer, 0, (top + MARGIN) * paneZoom, glassBuffer.width, height * paneZoom, -MARGIN, top, 1280 + 2 * MARGIN, height);
      ctx.restore();
    }

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

  // Zwischenbild in ganzzahliger Vergrößerung (1× oder 2×, je nach Bildschirm) – wird wiederverwendet
  prepare(ctx, buffer, maxZoom = 2) {
    const zoom = Math.min(maxZoom, Math.max(1, Math.round(ctx.getTransform().a)));
    const width = (1280 + 2 * MARGIN) * zoom;
    if (buffer?.width === width) return buffer;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = (720 + 2 * MARGIN) * zoom;
    return canvas;
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
