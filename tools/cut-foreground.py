# Werkzeug: schneidet aus den Hintergrundbildern die Möbel aus, die vorne im Bild stehen
# (Sitze, Tische, Kisten, Pulte …). Das Spiel legt sie über Joseph und die anderen Figuren,
# sobald deren Füße weiter hinten stehen als die Bodenhöhe (depth) des Möbelstücks.
#
# Aufruf (im Projektordner):  python3 tools/cut-foreground.py [wagen-ordner …] [--preview ORDNER]
#   z. B. python3 tools/cut-foreground.py wagon-04 --preview /tmp/vorschau
# Braucht:  pip install pillow numpy opencv-python-headless
# Liest:    tools/vordergrund.json      je Hintergrundbild die Umrisse der Möbel
# Schreibt: assets/scenes/<ordner>/vorne-<name>.webp   (das ausgeschnittene Stück)
#           assets/scenes/vordergrund.json             (Liste für das Spiel, siehe src/scene/scene.js)
#
# Ein Eintrag in tools/vordergrund.json:
#   { "name": "tisch-lm", "depth": 587, "outline": [[x, y], …] }
#   outline: Umriss in Pixeln des Hintergrundbilds (1536 × 1024) – ruhig ein paar Pixel grob.
#            Die Kante rastet danach von selbst an den schwarzen Konturen ein (GrabCut im schmalen
#            Band, Breite "band", Standard 4 Pixel). Was weiter hinten steht, darf nicht im Umriss liegen.
#   depth:   Bodenhöhe in Spielkoordinaten (1280 × 720, wie der Laufbereich) – meist die Stelle,
#            an der das vorderste Bein den Boden berührt. Steht das Möbel schräg (z. B. ein Pult an der
#            Wand), eine Linie [[x1, y1], [x2, y2]] entlang der Unterkante – dazwischen und daneben wird
#            die Höhe an der Stelle der Figur gerechnet.
#   cut:     (optional) Flächen im Umriss, die sicher NICHT dazugehören (z. B. Boden zwischen Beinen)

import json, os, sys
import numpy as np
import cv2
from PIL import Image

CONFIG = 'tools/vordergrund.json'
TARGET = 'assets/scenes/vordergrund.json'

args = [a for a in sys.argv[1:]]
preview = None
if '--preview' in args:
    i = args.index('--preview'); preview = args[i + 1]; del args[i:i + 2]
    os.makedirs(preview, exist_ok=True)

config = json.load(open(CONFIG))
result = json.load(open(TARGET)) if os.path.exists(TARGET) else {}


def poly_mask(shape, poly):
    m = np.zeros(shape, np.uint8)
    cv2.fillPoly(m, [np.array(poly, np.int32)], 1)
    return m


def cut_piece(rgb, piece):
    h, w = rgb.shape[:2]
    m = poly_mask((h, w), piece['outline'])
    band = piece.get('band', 4)
    if band > 0:
        k = np.ones((3, 3), np.uint8)
        inner, outer = cv2.erode(m, k, iterations=band), cv2.dilate(m, k, iterations=band)
        gm = np.full((h, w), cv2.GC_BGD, np.uint8)
        gm[outer > 0] = cv2.GC_PR_BGD
        gm[m > 0] = cv2.GC_PR_FGD
        gm[inner > 0] = cv2.GC_FGD
        for poly in piece.get('cut', []):
            gm[poly_mask((h, w), poly) > 0] = cv2.GC_BGD
        x, y, bw, bh = cv2.boundingRect(outer)
        x0, y0, x1, y1 = max(0, x - 30), max(0, y - 30), min(w, x + bw + 30), min(h, y + bh + 30)
        sub = gm[y0:y1, x0:x1].copy()
        cv2.grabCut(cv2.cvtColor(rgb[y0:y1, x0:x1], cv2.COLOR_RGB2BGR), sub, None,
                    np.zeros((1, 65)), np.zeros((1, 65)), 5, cv2.GC_INIT_WITH_MASK)
        m = np.zeros((h, w), np.uint8)
        m[y0:y1, x0:x1] = ((sub == cv2.GC_FGD) | (sub == cv2.GC_PR_FGD)).astype(np.uint8)
    else:
        for poly in piece.get('cut', []):
            m[poly_mask((h, w), poly) > 0] = 0
    # Krümel und kleine Löcher entfernen
    n, labels, stats, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] < 60: m[labels == i] = 0
    inv = 1 - m
    n, labels, stats, _ = cv2.connectedComponentsWithStats(inv, connectivity=4)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] < 40: m[labels == i] = 1
    # weiche Kante (eine Spur Kantenglättung)
    alpha = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 0.7)
    alpha = np.clip(alpha * 255, 0, 255).astype(np.uint8)
    ys, xs = np.nonzero(alpha)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    return alpha, (int(x0), int(y0), int(x1), int(y1))


for src, entry in config.items():
    folder = os.path.basename(os.path.dirname(src))
    if args and folder not in args:
        continue
    rgb = np.array(Image.open(src).convert('RGB'))
    pieces, union = [], np.zeros(rgb.shape[:2], np.uint8)
    for piece in entry['pieces']:
        alpha, (x0, y0, x1, y1) = cut_piece(rgb, piece)
        union = np.maximum(union, alpha)
        out = np.dstack([rgb, alpha])[y0:y1, x0:x1]
        path = f'{os.path.dirname(src)}/vorne-{piece["name"]}.webp'
        Image.fromarray(out, 'RGBA').save(path, 'WEBP', quality=88, method=6)
        pieces.append({'name': piece['name'], 'image': path, 'x': x0, 'y': y0, 'width': x1 - x0, 'height': y1 - y0, 'depth': piece['depth']})
        print(f'{path:48} {x1 - x0:4} × {y1 - y0:<4}  Bodenhöhe {json.dumps(piece["depth"])}')
    result[src] = pieces
    if preview:
        a = union[..., None] / 255
        img = rgb * a + np.array([255, 0, 255]) * (1 - a)
        Image.fromarray(img.astype(np.uint8)).save(f'{preview}/{folder}.png')

# nicht mehr vorhandene Einträge entfernen
result = {src: pieces for src, pieces in result.items() if src in config}
with open(TARGET, 'w') as f:
    json.dump(result, f, indent=1, ensure_ascii=False)
    f.write('\n')
