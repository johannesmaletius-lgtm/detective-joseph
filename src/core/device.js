import { COLORS, roundedRect } from '../ui/text.js';

// Kleinigkeiten fürs iPad: Schließen-Knopf für Nahansichten, Bildschirm wach halten,
// Ton trotz Stumm-Schalter, Spielstand vor dem Aufräumen des Browsers schützen.

// Knopf ✕ oben links in jeder Nahansicht (nur mit dem Finger – mit der Maus geht Rechtsklick oder Esc)
const CLOSE = { x: 16, y: 16, size: 60 };

// So nah am unteren Rand holt ein Tippen die Inventarleiste heraus
export const INVENTORY_TAP_ZONE = 60;

export function insideCloseButton(point) {
  return point.x >= CLOSE.x - 8 && point.x <= CLOSE.x + CLOSE.size + 8 && point.y >= CLOSE.y - 8 && point.y <= CLOSE.y + CLOSE.size + 8;
}

export function drawCloseButton(ctx, alpha = 1) {
  const { x, y, size } = CLOSE;
  ctx.save();
  ctx.globalAlpha = alpha;
  roundedRect(ctx, x, y, size, size, 12);
  ctx.fillStyle = 'rgba(20, 12, 7, 0.85)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = COLORS.brass;
  ctx.stroke();
  ctx.lineCap = 'round';
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#f3e2bf';
  const m = 19;
  ctx.beginPath();
  ctx.moveTo(x + m, y + m);
  ctx.lineTo(x + size - m, y + size - m);
  ctx.moveTo(x + size - m, y + m);
  ctx.lineTo(x + m, y + size - m);
  ctx.stroke();
  ctx.restore();
}

// Bildschirm nicht abdunkeln, während gespielt wird (Safari ab iPadOS 16.4). Nach jedem
// Zurückkommen in die App neu anfordern – das System gibt die Sperre beim Wegschalten frei.
let wakeLock = null;
export function keepAwake() {
  if (wakeLock || !navigator.wakeLock || document.visibilityState !== 'visible') return;
  wakeLock = navigator.wakeLock.request('screen').catch(() => null);
  wakeLock.then((lock) => {
    if (!lock) wakeLock = null;
    else lock.addEventListener('release', () => (wakeLock = null));
  });
}

// Einmal beim Start
export function setupDevice() {
  // iOS 17+: Ton auch bei eingeschaltetem Stumm-Schalter (wie ein Spiel, nicht wie ein Klingelton)
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
  } catch {
    // ältere Geräte: dann eben nicht
  }
  // Spielstand möglichst nicht automatisch löschen lassen
  navigator.storage?.persist?.().catch(() => {});
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') keepAwake();
  });

  // Hinweis „Zum Home-Bildschirm“ (nur iPad/iPhone in Safari, nicht in der installierten App)
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const hint = document.getElementById('install-hint');
  let dismissed = false;
  try {
    dismissed = localStorage.getItem('detective-joseph-install-hint') === 'weg';
  } catch {
    // egal
  }
  if (hint && ios && !standalone && !dismissed) {
    hint.hidden = false;
    hint.querySelector('button')?.addEventListener('click', () => {
      hint.hidden = true;
      try {
        localStorage.setItem('detective-joseph-install-hint', 'weg');
      } catch {
        // egal
      }
    });
  }
}
