#!/usr/bin/env python3
"""Bereitet die ChatGPT-Bilder aus assets/reference/tuer-XX/ fürs Spiel vor (braucht Python 3 + Pillow).

  python3 tools/prepare-wagons.py

- Hintergründe: reines Magenta (Fenster) wird durchsichtig – dahinter zeichnet das Spiel die Außenwelt.
  Magenta in der Tür (Türfenster) wird zu dunklem Glas. Cyan (Leinwand) wird durchsichtig.
  Gibt die Fensterrechtecke in Spielkoordinaten aus (für outside.windows in src/scene/wagons.js).
- Figuren-Bögen (4 Ansichten nebeneinander) werden in front/left/right/talk.png zerschnitten.
- Rätselbilder (Suchbild, Regal, Standbild) werden verkleinert; Magenta wird zu Nachthimmel.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import random

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / 'assets' / 'reference'
SCENES = ROOT / 'assets' / 'scenes'
CHARS = ROOT / 'assets' / 'characters'

# Bild 1536 × 1024 → Spiel 1280 × 853, 40 Pixel nach oben geschoben (wie im ersten Abteil)
SCALE = 1280 / 1536
SHIFT_Y = -40



def mask_where(im, test):
    w, h = im.size
    px = im.load()
    mask = Image.new('L', (w, h), 0)
    mp = mask.load()
    for y in range(h):
        for x in range(w):
            if test(*px[x, y][:3]):
                mp[x, y] = 255
    return mask


def is_magenta(r, g, b):
    return r > 170 and b > 170 and g < 110 and abs(r - b) < 90


def is_cyan(r, g, b):
    return g > 190 and b > 190 and r < 90


def components(mask, min_size=400):
    """Zusammenhängende Flächen der Maske → Liste von Rechtecken (x0, y0, x1, y1)."""
    w, h = mask.size
    mp = mask.load()
    seen = bytearray(w * h)
    boxes = []
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if mp[x, y] == 0 or seen[y * w + x]:
                continue
            stack = [(x, y)]
            seen[y * w + x] = 1
            x0 = x1 = x
            y0 = y1 = y
            count = 0
            while stack:
                cx, cy = stack.pop()
                count += 1
                x0, x1, y0, y1 = min(x0, cx), max(x1, cx), min(y0, cy), max(y1, cy)
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < w and 0 <= ny < h and mp[nx, ny] and not seen[ny * w + nx]:
                        seen[ny * w + nx] = 1
                        stack.append((nx, ny))
            if count >= min_size:
                boxes.append((x0, y0, x1, y1))
    return sorted(boxes)


def game_rect(box):
    x0, y0, x1, y1 = box
    return {
        'from': round(x0 * SCALE), 'to': round((x1 + 1) * SCALE),
        'top': round(y0 * SCALE + SHIFT_Y), 'bottom': round((y1 + 1) * SCALE + SHIFT_Y),
    }


def dark_glass(size):
    w, h = size
    glass = Image.new('RGBA', size)
    d = ImageDraw.Draw(glass)
    for y in range(h):
        t = y / max(1, h - 1)
        d.line([(0, y), (w, y)], fill=(int(14 - 8 * t), int(18 - 10 * t), int(34 - 18 * t), 255))
    # schwacher Lichtreflex quer über die Scheibe
    for i in range(int(w * 0.18)):
        x = int(w * 0.15) + i
        d.line([(x, 0), (x - int(h * 0.6), h)], fill=(70, 80, 110, 60))
    return glass


def night_sky(size, seed=7):
    w, h = size
    sky = Image.new('RGBA', size)
    d = ImageDraw.Draw(sky)
    for y in range(h):
        t = y / max(1, h - 1)
        d.line([(0, y), (w, y)], fill=(int(12 + 18 * t), int(16 + 24 * t), int(44 + 40 * t), 255))
    rnd = random.Random(seed)
    for _ in range(w * h // 900):
        x, y = rnd.randrange(w), rnd.randrange(h)
        v = rnd.randrange(150, 255)
        d.point((x, y), fill=(v, v, v, 255))
    # verschneite Hügel unten
    d.polygon([(0, h), (0, int(h * 0.78)), (w * 0.3, int(h * 0.7)), (w * 0.6, int(h * 0.8)), (w, int(h * 0.72)), (w, h)], fill=(190, 205, 230, 255))
    return sky


def prepare_background(number, door_band=(560, 980)):
    src = REF / f'tuer-{number:02d}' / f'tuer-{number:02d}-hintergrund.webp'
    im = Image.open(src).convert('RGBA')
    magenta = mask_where(im, is_magenta).filter(ImageFilter.MaxFilter(3))
    cyan = mask_where(im, is_cyan).filter(ImageFilter.MaxFilter(3))
    windows, door = [], []
    alpha = im.getchannel('A')
    for box in components(magenta):
        x0, y0, x1, y1 = box
        cx = (x0 + x1) / 2
        crop = magenta.crop((x0, y0, x1 + 1, y1 + 1))
        if door_band[0] < cx < door_band[1] and cx > 620 and cx < 920:
            # Türfenster → dunkles Glas
            im.paste(dark_glass(crop.size), (x0, y0), crop)
            door.append(game_rect(box))
        else:
            alpha.paste(0, (x0, y0, x1 + 1, y1 + 1), crop)
            windows.append(game_rect(box))
    screens = []
    for box in components(cyan):
        x0, y0, x1, y1 = box
        crop = cyan.crop((x0, y0, x1 + 1, y1 + 1))
        alpha.paste(0, (x0, y0, x1 + 1, y1 + 1), crop)
        screens.append(game_rect(box))
    im.putalpha(alpha)
    out = SCENES / f'wagon-{number:02d}'
    out.mkdir(parents=True, exist_ok=True)
    im.save(out / 'background.webp', quality=88, method=6)
    print(f'Wagen {number}: Fenster {windows}')
    if door:
        print(f'          Türfenster {door}')
    if screens:
        print(f'          Leinwand {screens}')


def prepare_sheet(src, name, order=('front', 'left', 'right', 'talk')):
    im = Image.open(src).convert('RGBA')
    alpha = im.getchannel('A')
    w, h = im.size
    cols = [any(alpha.getpixel((x, y)) > 40 for y in range(0, h, 3)) for x in range(w)]
    spans, start = [], None
    for x, filled in enumerate(cols + [False]):
        if filled and start is None:
            start = x
        if not filled and start is not None:
            if x - start > 40:
                spans.append((start, x))
            start = None
    # Zu kleine Lücken (z. B. zwischen Arm und Körper) zusammenfassen, bis es 4 Ansichten sind
    while len(spans) > len(order):
        gaps = [spans[i + 1][0] - spans[i][1] for i in range(len(spans) - 1)]
        i = gaps.index(min(gaps))
        spans[i:i + 2] = [(spans[i][0], spans[i + 1][1])]
    out = CHARS / name
    out.mkdir(parents=True, exist_ok=True)
    for (x0, x1), pose in zip(spans, order):
        part = im.crop((x0, 0, x1, h))
        box = part.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
        part = part.crop(box)
        part.save(out / f'{pose}.webp', quality=90, method=6)
        print(f'{name}/{pose}.webp  {part.size}')


def prepare_picture(src, dest, width=1280):
    im = Image.open(src).convert('RGBA')
    mask = mask_where(im, is_magenta).filter(ImageFilter.MaxFilter(3))
    for box in components(mask):
        x0, y0, x1, y1 = box
        crop = mask.crop((x0, y0, x1 + 1, y1 + 1))
        im.paste(night_sky(crop.size), (x0, y0), crop)
    height = round(im.height * width / im.width)
    im = im.resize((width, height), Image.LANCZOS).convert('RGB')
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, quality=88, method=6)
    print(f'{dest.relative_to(ROOT)}  {im.size}')


def mirror_pose(name, src_pose, dest_pose):
    """Eine Seitenansicht spiegeln (wenn beide Seitenansichten im Bogen in dieselbe Richtung schauen)."""
    out = CHARS / name
    Image.open(out / f'{src_pose}.webp').transpose(Image.FLIP_LEFT_RIGHT).save(out / f'{dest_pose}.webp', quality=90, method=6)


def prepare_photo(src, dest, width=900):
    """Foto/Bild für eine Karte: nur verkleinern."""
    im = Image.open(src).convert('RGBA')
    height = round(im.height * width / im.width)
    im = im.resize((width, height), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, quality=88, method=6)
    print(f'{dest.relative_to(ROOT)}  {im.size}')


if __name__ == '__main__':
    import sys
    only = {int(a) for a in sys.argv[1:]}
    for number in (2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23):
        if not only or number in only:
            prepare_background(number)
    if only:
        sys.exit()
    prepare_sheet(REF / 'tuer-04' / 'tuer-04-bruno.webp', 'bruno')
    prepare_sheet(REF / 'tuer-07' / 'tuer-07-herr-k.webp', 'herr-k')
    prepare_sheet(REF / 'tuer-07' / 'tuer-07-barkeeper.webp', 'barkeeper')
    prepare_sheet(REF / 'tuer-11' / 'tuer-11-tick.webp', 'tick')
    prepare_sheet(REF / 'tuer-12' / 'tuer-12-moll.webp', 'moll')
    prepare_sheet(REF / 'tuer-15' / 'tuer-15-mira.webp', 'mira')
    prepare_sheet(REF / 'tuer-21' / 'tuer-21-heizer.webp', 'heizer')
    mirror_pose('heizer', 'right', 'left')
    prepare_sheet(REF / 'tuer-22' / 'tuer-22-anderer-joseph.webp', 'anderer-joseph')
    mirror_pose('anderer-joseph', 'right', 'left')
    prepare_sheet(REF / 'tuer-22' / 'tuer-22-anderer-joseph-ohne-muetze.webp', 'schaffner')
    mirror_pose('schaffner', 'right', 'left')
    prepare_picture(REF / 'tuer-05' / 'tuer-05-abteil-k.webp', SCENES / 'wagon-05' / 'abteil-k.webp')
    prepare_picture(REF / 'tuer-06' / 'tuer-06-regal.webp', SCENES / 'wagon-06' / 'regal.webp')
    prepare_picture(REF / 'tuer-08' / 'tuer-08-standbild.webp', SCENES / 'wagon-08' / 'standbild.webp')
    prepare_picture(REF / 'tuer-13' / 'tuer-13-familienfoto.webp', SCENES / 'wagon-13' / 'familienfoto.webp', width=540)
    prepare_picture(REF / 'tuer-14' / 'tuer-14-pressefoto.webp', SCENES / 'wagon-14' / 'pressefoto.webp', width=900)
    PHOTOS = ROOT / 'assets' / 'photos'
    prepare_photo(REF / 'tuer-13' / 'tuer-13-familienfoto.webp', PHOTOS / 'familienfoto.webp', 620)
    prepare_photo(REF / 'tuer-14' / 'tuer-14-pressefoto.webp', PHOTOS / 'pressefoto.webp', 900)
    prepare_photo(REF / 'tuer-19' / 'tuer-19-tunnelfoto.webp', PHOTOS / 'tunnelfoto.webp', 900)
    prepare_photo(REF / 'tuer-21' / 'tuer-21-spindfoto.webp', PHOTOS / 'spindfoto.webp', 860)
    prepare_photo(REF / 'tuer-23' / 'tuer-23-ausgang.webp', PHOTOS / 'ausgang.webp', 1280)
    prepare_photo(REF / 'tuer-24' / 'tuer-24-schluss.webp', PHOTOS / 'schluss.webp', 1280)
