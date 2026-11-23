import { background, box, perspective, train } from './wagonKit.js';
import { drawSymbol } from '../ui/symbols.js';

// Wagen 23 (Tür 23): der Wartungsgang im Tunnel. Nur DATEN – was passiert, steht in src/story/wagon23.js.
// Links und rechts zweigen Gänge ab, hinten das Gittertor mit dem Zahnradmechanismus.
// Kreidezeichen an der Wand (wechseln an jeder Abzweigung) und die leere Achse im Tor sind gemalt (props).

// Ein Zeichen pro Abzweigung (muss zu PATH in src/story/wagon23.js passen), am Ende der Turm = das Tor.
const SIGNS = ['lanternLeft', 'tunnel', 'lanternRight', 'tunnel', 'lanternLeft', 'lanternRight', 'tower'];
export const DARK_JUNCTION = 3; // hier ist die Lampe kaputt: das Zeichen sieht man nur mit der Taschenlampe

export const serviceTunnel = {
  id: 'serviceTunnel',
  name: 'Wartungsgang',
  background: background('assets/scenes/wagon-23/background.webp'),

  characters: [
    {
      id: 'tick', name: 'Herr Tick', poses: 'assets/characters/tick',
      x: 730, y: 490, pose: 'front', size: 0.8, when: 'tickHere',
      walkTo: [640, 560], facing: 'back', color: '#f3d9a0',
    },
  ],

  props: [
    {
      // Kreidezeichen auf dem hellen Putz links
      paint: (ctx, scene) => {
        const junction = scene.flags.junction ?? 0;
        const sign = SIGNS[junction];
        if (!sign) return;
        const dark = junction === DARK_JUNCTION;
        ctx.save();
        if (dark) {
          // kaputte Lampe: die linke Wand liegt im Dunkeln
          const shadow = ctx.createRadialGradient(280, 300, 60, 280, 300, 460);
          shadow.addColorStop(0, 'rgba(4, 3, 2, 0.94)');
          shadow.addColorStop(0.6, 'rgba(4, 3, 2, 0.7)');
          shadow.addColorStop(1, 'rgba(4, 3, 2, 0)');
          ctx.fillStyle = shadow;
          ctx.fillRect(0, 0, 760, 720);
          // die kaputte Wandlampe: Glas schwarz
          ctx.fillStyle = 'rgba(20, 18, 16, 0.95)';
          ctx.beginPath();
          ctx.ellipse(236, 140, 26, 34, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        if (!dark || scene.flags.chalkLit === junction) {
          ctx.globalAlpha = 0.85;
          drawSymbol(ctx, sign, 300, 320, 90, '#f4f1e8');
          if (dark) {
            ctx.globalCompositeOperation = 'screen';
            const beam = ctx.createRadialGradient(300, 320, 10, 300, 320, 130);
            beam.addColorStop(0, 'rgba(255, 240, 200, 0.35)');
            beam.addColorStop(1, 'rgba(255, 240, 200, 0)');
            ctx.fillStyle = beam;
            ctx.fillRect(170, 190, 260, 260);
          }
        }
        ctx.restore();
      },
    },
    {
      // die leere Achse im Tor – oder Herrn Ticks Zahnrad darin
      paint: (ctx, scene) => {
        const x = 580, y = 300;
        ctx.save();
        if (scene.flags.gearIn) {
          ctx.fillStyle = '#c9a24a';
          ctx.strokeStyle = '#6e5420';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i < 24; i++) {
            const a = (i / 24) * Math.PI * 2 + (scene.flags.gearTurn ?? 0);
            const r = i % 2 ? 22 : 30;
            ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(10, 8, 6, 0.85)';
          ctx.beginPath();
          ctx.arc(x, y, 28, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#8a7a5a';
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      },
    },
  ],

  hotspots: [
    { id: 'gearGap', name: 'Leere Achse', area: box(546, 266, 614, 334), walkTo: [500, 540], facing: 'back' },
    { id: 'gate', name: 'Gittertor', area: box(500, 180, 770, 462), walkTo: [640, 500], facing: 'back' },
    { id: 'chalk', name: 'Kreidezeichen', area: box(240, 260, 360, 380), walkTo: [400, 560], facing: 'left' },
    { id: 'archLeft', name: 'Gang nach links', area: box(20, 160, 200, 640), walkTo: [260, 640], facing: 'left' },
    { id: 'archRight', name: 'Gang nach rechts', area: box(1080, 160, 1260, 640), walkTo: [1020, 640], facing: 'right' },
    { id: 'ahead', name: 'Geradeaus weiter', area: box(420, 380, 860, 470), walkTo: [640, 500], facing: 'back' },
    { id: 'lamps', name: 'Tunnellampen', cursor: 'look', area: box(200, 70, 270, 190) },
    { id: 'lamps', name: 'Tunnellampen', cursor: 'look', area: box(1010, 70, 1080, 190) },
  ],

  train: train({ lightsOutInTunnel: false }),
  playerStart: { x: 640, y: 680, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [500, 470],
      [780, 470],
      [1060, 640],
      [1100, 712],
      [180, 712],
      [220, 640],
    ],
    holes: [],
  },
};
