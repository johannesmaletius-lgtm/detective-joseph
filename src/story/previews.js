import { loadImage } from '../core/assets.js';

// Vorschau auf den nächsten Wagen (Endkarte, siehe finishWagon): ein dunkler Ausschnitt seines Hintergrunds
// und ein Satz, der neugierig macht, ohne etwas zu verraten. Nach Tür 24 gibt es keine Vorschau.
//   door: die Tür, auf die vorausgeschaut wird · x, y: Mitte des Ausschnitts im Hintergrund (1536 × 1024) · width: Breite
//   (Höhe = Breite · 3/8, passend zum Rahmen auf der Endkarte)

const SCENE = (n) => `assets/scenes/wagon-${String(n).padStart(2, '0')}/background.webp`;

export const PREVIEWS = {
  2: { x: 1150, y: 470, width: 760, text: 'Ganz oben auf einem Kofferstapel sitzt jemand mit nur einem guten Ohr.' },
  3: { x: 430, y: 360, width: 720, text: 'Hinter der nächsten Tür wartet ein Brief. Adressiert an J.' },
  4: { x: 500, y: 560, width: 800, text: 'Der Tisch ist gedeckt. Ein Glas riecht nicht so, wie es sollte.' },
  5: { x: 430, y: 360, width: 680, text: 'Jemand schläft dort. Und redet im Traum.' },
  6: { x: 330, y: 420, width: 720, text: 'Dort liegen Dinge, die noch gar nicht verloren gegangen sind.' },
  7: { x: 1100, y: 520, width: 760, text: 'Ein Mann sitzt vor drei leeren Gläsern. Er wartet auf jemanden.' },
  8: { x: 1200, y: 560, width: 660, text: 'Ein Film läuft. Das letzte Bild hättest du lieber nicht gesehen.' },
  9: { x: 768, y: 470, width: 920, text: 'Hinter der nächsten Tür ist jemand immer eine Runde zu spät.' },
  10: { x: 1150, y: 440, width: 720, text: 'Eine Stimme. Rückwärts sagt sie etwas ganz anderes.' },
  11: { x: 720, y: 300, width: 900, text: 'Hinter der nächsten Tür tickt es. Hunderte Male.' },
  12: { x: 330, y: 470, width: 680, text: 'Jemand spielt ein Lied, das er nicht vergessen kann.' },
  13: { x: 768, y: 260, width: 820, text: 'Kerzen brennen. Und unter dem Ruß warten Namen.' },
  14: { x: 300, y: 470, width: 720, text: 'Eine alte Zeitung. Ein paar Wörter hat jemand herausgeschnitten.' },
  15: { x: 1150, y: 520, width: 720, text: 'Jemand hat dich schon ganz oft gesehen. Du sie nur nie.' },
  16: { x: 1150, y: 500, width: 720, text: 'Es rauscht. Irgendwo darin ruft seit Jahren jemand.' },
  17: { x: 520, y: 700, width: 960, text: 'Die Scheiben sind beschlagen. Hier hat jemand geschlafen.' },
  18: { x: 340, y: 300, width: 680, text: 'Ein Schlüsselbrett. Ein Haken ist leer.' },
  19: { x: 1100, y: 400, width: 720, text: 'Alles ist rot. Und ein Film wartet darauf, entwickelt zu werden.' },
  20: { x: 330, y: 480, width: 720, text: 'Geschenke, die nie jemand ausgepackt hat.' },
  21: { x: 330, y: 470, width: 720, text: 'Es ist heiß. Und jemand begrüßt dich, als würde er dich kennen.' },
  22: { x: 700, y: 450, width: 920, text: 'Um halb zwölf kommt jemand mit einem Schlüssel.' },
  23: { x: 768, y: 400, width: 920, text: 'Ein dunkler Gang. Jemand hat den Weg mit Kreide markiert.' },
  24: { x: 980, y: 330, width: 680, image: SCENE(18), text: 'Die letzte Tür. Alle warten auf ein Zeichen.' },
};

// Lädt den Ausschnitt für die Endkarte von Tür `number` (Vorschau auf Tür number + 1). Ergebnis: { canvas, text } oder null.
// Die magentafarbenen (und türkisen) Flächen im Hintergrund – dort sitzen sonst Landschaft, Leinwand, Spiegel – werden nachtschwarz.
export async function loadPreview(number) {
  const door = number + 1;
  const preview = PREVIEWS[door];
  if (!preview) return null;
  try {
    const image = await loadImage(preview.image ?? SCENE(door));
    const width = Math.min(preview.width, image.width);
    const height = Math.round(width * 3 / 8);
    const x = clamp(Math.round(preview.x - width / 2), 0, image.width - width);
    const y = clamp(Math.round(preview.y - height / 2), 0, image.height - height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    const data = ctx.getImageData(0, 0, width, height);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2];
      if ((r > 170 && b > 170 && g < 90) || (g > 170 && b > 170 && r < 90)) {
        px[i] = 6; px[i + 1] = 8; px[i + 2] = 18;
      }
    }
    ctx.putImageData(data, 0, 0);
    return { canvas, text: preview.text };
  } catch {
    return null; // Bild fehlt: Endkarte ohne Vorschau
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
