#!/usr/bin/env python3
"""Hilfe zum Eintragen von Koordinaten: Hintergrund eines Wagens in Spielkoordinaten (1280 × 720) mit Raster.

  python3 tools/grid.py 9 /tmp/wagen9.png
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
number, out = int(sys.argv[1]), sys.argv[2]
bg = Image.open(ROOT / 'assets' / 'scenes' / f'wagon-{number:02d}' / 'background.webp').convert('RGBA')
bg = bg.resize((1280, 853))
canvas = Image.new('RGBA', (1280, 720), (255, 0, 255, 255))
canvas.alpha_composite(bg, (0, -40))
d = ImageDraw.Draw(canvas)
for x in range(0, 1280, 50):
    d.line([(x, 0), (x, 720)], fill=(255, 255, 255, 110 if x % 100 else 200), width=1)
    if x % 100 == 0:
        d.text((x + 2, 2), str(x), fill='yellow')
for y in range(0, 720, 50):
    d.line([(0, y), (1280, y)], fill=(255, 255, 255, 110 if y % 100 else 200), width=1)
    if y % 100 == 0:
        d.text((2, y + 2), str(y), fill='yellow')
canvas.convert('RGB').save(out)
