// Das Bild der Überwachungskamera, die im Tunnel hängt – grün auf schwarz, grob gerastert.
//
// Es wird klein vorgezeichnet (240 × 180) und dann vergrößert: einmal winzig auf dem Bildschirm im
// Abteil, einmal groß in der Nahansicht (siehe crt.js).
//
//   const feed = new CameraFeed({ digit: 5 });
//   feed.update(dt);
//   const picture = feed.render({ train: 0…1, figure: 0…1 });   // ein <canvas>, das man mit drawImage zeichnet
//
// train  = der Zug rauscht gerade durch den Tunnel (0 = nein, 1 = ja)
// figure = jemand steht im Tunnel (0 = niemand, 1 = deutlich zu sehen)

export const FEED = { width: 240, height: 180 };
const VP = { x: 150, y: 78 };       // Fluchtpunkt: das Ende des Tunnels
const HALF_WIDTH = 118;             // halbe Tunnelbreite ganz vorne
const FLOOR = 82;                   // Boden unter dem Fluchtpunkt (ganz vorne)
const FONT = 'bold 10px "Courier New", "Courier", monospace';
const GREEN = (alpha) => `rgba(110, 255, 150, ${alpha})`;

export class CameraFeed {
  constructor({ digit }) {
    this.digit = String(digit);
    this.canvas = null;
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
  }

  render({ train = 0, figure = 0 } = {}) {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = FEED.width;
      this.canvas.height = FEED.height;
    }
    const ctx = this.canvas.getContext('2d');
    const t = this.time;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#021208';
    ctx.fillRect(0, 0, FEED.width, FEED.height);

    ctx.save();
    if (train > 0) ctx.translate(Math.sin(t * 61) * 1.5 * train, Math.sin(t * 47) * 1.5 * train); // alles wackelt
    this.drawTunnel(ctx, t, train);
    if (figure > 0) this.drawFigure(ctx, figure, t);
    if (train > 0) this.drawTrain(ctx, t, train);
    ctx.restore();

    // Einblendungen der Kamera
    ctx.font = FONT;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = GREEN(0.95);
    ctx.fillText('KAM 1  TUNNEL', 8, 7);
    ctx.fillText('00:00:00', 8, FEED.height - 17); // die Uhr steht
    if (Math.floor(t * 1.2) % 2 === 0) {
      ctx.beginPath();
      ctx.arc(FEED.width - 44, 12, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.textAlign = 'right';
    ctx.fillText('REC', FEED.width - 10, 7);

    // Bildstörungen: ein paar helle Punkte und ein wandernder Streifen
    ctx.fillStyle = GREEN(0.5);
    for (let i = 0; i < 26; i++) ctx.fillRect(Math.random() * FEED.width, Math.random() * FEED.height, 1, 1);
    const bar = ((t * 38) % (FEED.height + 60)) - 30;
    ctx.fillStyle = GREEN(0.06);
    ctx.fillRect(0, bar, FEED.width, 22);
    return this.canvas;
  }

  // Die Röhre: Bögen, die nach hinten kleiner werden, Gleis, eine Wandlampe und die große Ziffer an der Wand
  drawTunnel(ctx, t, train) {
    // Decke und Wände: nach hinten immer dunkler
    for (let k = 9; k >= 0; k--) {
      const s = 1 / (1 + k * 0.42);
      ctx.fillStyle = `rgb(${Math.round(4 + 10 * s)}, ${Math.round(26 + 58 * s)}, ${Math.round(14 + 26 * s)})`;
      arch(ctx, s);
      ctx.fill();
    }
    ctx.fillStyle = '#010703'; // das schwarze Loch am Ende
    arch(ctx, 0.2);
    ctx.fill();
    // Fugen der Bögen
    ctx.lineWidth = 1;
    for (let k = 0; k < 7; k++) {
      const s = 1 / (1 + k * 0.42);
      ctx.strokeStyle = GREEN(0.1 + 0.3 * s);
      arch(ctx, s);
      ctx.stroke();
    }
    // Boden
    ctx.fillStyle = 'rgba(2, 16, 8, 0.65)';
    ctx.beginPath();
    ctx.moveTo(VP.x - HALF_WIDTH, VP.y + FLOOR);
    ctx.lineTo(VP.x, VP.y + 2);
    ctx.lineTo(VP.x + HALF_WIDTH, VP.y + FLOOR);
    ctx.lineTo(VP.x + HALF_WIDTH, FEED.height);
    ctx.lineTo(VP.x - HALF_WIDTH, FEED.height);
    ctx.fill();
    // Gleis: zwei Schienen und Schwellen
    ctx.strokeStyle = GREEN(0.75);
    ctx.lineWidth = 1.5;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(VP.x + side * 4, VP.y + 5);
      ctx.lineTo(VP.x + side * 62 * 1.25, VP.y + FLOOR * 1.25);
      ctx.stroke();
    }
    ctx.strokeStyle = GREEN(0.3);
    for (let k = 0; k < 9; k++) {
      const s = 1.25 / (1 + k * 0.38);
      ctx.beginPath();
      ctx.moveTo(VP.x - 70 * s, VP.y + FLOOR * s);
      ctx.lineTo(VP.x + 70 * s, VP.y + FLOOR * s);
      ctx.stroke();
    }
    // Kabel an der rechten Wand
    ctx.strokeStyle = GREEN(0.35);
    ctx.beginPath();
    ctx.moveTo(VP.x + 6, VP.y - 2);
    ctx.lineTo(VP.x + HALF_WIDTH * 1.2, VP.y - 34);
    ctx.stroke();
    // Wandlampe rechts hinten – flackert
    const flicker = 0.75 + 0.25 * Math.sin(t * 23) * Math.sin(t * 7.1);
    const lamp = { x: VP.x + HALF_WIDTH * 0.42, y: VP.y - 14 };
    const glow = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, 34);
    glow.addColorStop(0, GREEN(0.85 * flicker));
    glow.addColorStop(0.2, GREEN(0.3 * flicker));
    glow.addColorStop(1, GREEN(0));
    ctx.fillStyle = glow;
    ctx.fillRect(lamp.x - 34, lamp.y - 34, 68, 68);

    // Die Ziffer: groß auf die linke Wand gemalt, in einem Rahmen
    const near = { x: VP.x - HALF_WIDTH * 0.97, top: VP.y - 4, bottom: VP.y + 58 };
    const far = { x: VP.x - HALF_WIDTH * 0.58, top: VP.y - 2, bottom: VP.y + 35 };
    const bright = Math.min(1, 0.85 + 0.6 * train);
    ctx.strokeStyle = GREEN(0.8 * bright);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(near.x, near.top);
    ctx.lineTo(far.x, far.top);
    ctx.lineTo(far.x, far.bottom);
    ctx.lineTo(near.x, near.bottom);
    ctx.closePath();
    ctx.stroke();
    ctx.save();
    ctx.transform(0.86, -0.13, 0, 1, (near.x + far.x) / 2 + 1, (near.top + near.bottom + far.top + far.bottom) / 4 + 6);
    ctx.font = 'bold 44px "Trebuchet MS", "Arial", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = GREEN(0.95 * bright);
    ctx.fillText(this.digit, 0, 0);
    ctx.restore();
  }

  // Der Zug rauscht durch: dunkler Wagenkasten, erleuchtete Fenster ziehen als Streifen vorbei
  drawTrain(ctx, t, train) {
    ctx.fillStyle = `rgba(1, 10, 5, ${0.85 * train})`;
    ctx.beginPath();
    ctx.moveTo(VP.x - 3, VP.y - 6);
    ctx.lineTo(VP.x + 5, VP.y - 6);
    ctx.lineTo(VP.x + 96, VP.y - 86);
    ctx.lineTo(VP.x + 96, FEED.height);
    ctx.lineTo(VP.x - 74, FEED.height);
    ctx.lineTo(VP.x - 74, VP.y - 86);
    ctx.fill();
    for (let i = 0; i < 9; i++) {
      const p = (t * 2.6 + i / 9) % 1;
      const s = 0.1 + p * p * 1.5;
      ctx.fillStyle = GREEN((0.35 + 0.6 * p) * train);
      ctx.fillRect(VP.x - 58 * s, VP.y - 34 * s, 22 * s, 20 * s);
      ctx.fillRect(VP.x - 30 * s, VP.y - 34 * s, 22 * s, 20 * s);
    }
    ctx.fillStyle = GREEN(0.1 * train * (0.5 + 0.5 * Math.sin(t * 40)));
    ctx.fillRect(0, 0, FEED.width, FEED.height);
  }

  // Jemand steht rechts an der Tunnelwand und sieht in die Kamera
  drawFigure(ctx, alpha, t) {
    const x = VP.x + 58, feet = VP.y + 48, height = 46;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#010502';
    ctx.strokeStyle = GREEN(0.55);
    ctx.lineWidth = 1;
    // Körper (Mantel) und Kopf
    ctx.beginPath();
    ctx.moveTo(x - 6, feet - height + 12);
    ctx.lineTo(x + 6, feet - height + 12);
    ctx.lineTo(x + 8, feet);
    ctx.lineTo(x - 8, feet);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, feet - height + 6, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Schal: hell, ein Ende hängt herunter
    ctx.strokeStyle = GREEN(0.95);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 6, feet - height + 13);
    ctx.lineTo(x + 6, feet - height + 13);
    ctx.moveTo(x + 3, feet - height + 13);
    ctx.lineTo(x + 5, feet - height + 26 + Math.sin(t * 3));
    ctx.stroke();
    // Augen
    ctx.fillStyle = GREEN(0.95);
    ctx.fillRect(x - 3, feet - height + 5, 1.5, 1.5);
    ctx.fillRect(x + 1.5, feet - height + 5, 1.5, 1.5);
    ctx.restore();
  }
}

// Umriss des Tunnels im Maßstab s (1 = ganz vorne, kleiner = weiter hinten)
function arch(ctx, s) {
  const half = HALF_WIDTH * s, floor = VP.y + FLOOR * s, spring = VP.y - 8 * s;
  ctx.beginPath();
  ctx.moveTo(VP.x - half, floor);
  ctx.lineTo(VP.x - half, spring);
  ctx.ellipse(VP.x, spring, half, 72 * s, 0, Math.PI, 0);
  ctx.lineTo(VP.x + half, floor);
  ctx.closePath();
}
