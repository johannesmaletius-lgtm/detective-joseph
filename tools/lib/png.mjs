// PNG-Dateien lesen und schreiben – nur mit Node.js-Bordmitteln (zlib), ohne Zusatzpakete.
// Unterstützt 8-Bit-PNGs (RGB, RGBA, Graustufen, Palette), nicht interlaced.
// Ergebnis/Eingabe: { width, height, data } mit data = RGBA-Bytes (4 pro Pixel).

import zlib from 'node:zlib';
import fs from 'node:fs';

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function decodePNG(buffer) {
  let pos = 8;
  let width, height, bitDepth, colorType, interlace, palette, transparency;
  const chunks = [];
  while (pos < buffer.length) {
    const length = buffer.readUInt32BE(pos);
    const type = buffer.toString('ascii', pos + 4, pos + 8);
    const body = buffer.subarray(pos + 8, pos + 8 + length);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      bitDepth = body[8];
      colorType = body[9];
      interlace = body[12];
    } else if (type === 'PLTE') palette = body;
    else if (type === 'tRNS') transparency = body;
    else if (type === 'IDAT') chunks.push(body);
    else if (type === 'IEND') break;
    pos += 12 + length;
  }
  if (bitDepth !== 8 || interlace) throw new Error('Nur 8-Bit-PNGs ohne Interlacing werden unterstützt');

  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  const raw = zlib.inflateSync(Buffer.concat(chunks));
  const stride = width * channels;
  const out = Buffer.alloc(width * height * 4);
  let previous = Buffer.alloc(stride);
  let current = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const left = i >= channels ? current[i - channels] : 0;
      const up = previous[i];
      const upLeft = i >= channels ? previous[i - channels] : 0;
      let value = line[i];
      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - upLeft);
        value += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      }
      current[i] = value & 255;
    }
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const s = x * channels;
      if (colorType === 6) current.copy(out, o, s, s + 4);
      else if (colorType === 2) { current.copy(out, o, s, s + 3); out[o + 3] = 255; }
      else if (colorType === 0) { out[o] = out[o + 1] = out[o + 2] = current[s]; out[o + 3] = 255; }
      else if (colorType === 4) { out[o] = out[o + 1] = out[o + 2] = current[s]; out[o + 3] = current[s + 1]; }
      else if (colorType === 3) {
        const k = current[s];
        palette.copy(out, o, k * 3, k * 3 + 3);
        out[o + 3] = transparency && k < transparency.length ? transparency[k] : 255;
      }
    }
    [previous, current] = [current, previous];
  }
  return { width, height, data: out };
}

export function encodePNG({ width, height, data }) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  const pixels = Buffer.from(data.buffer, data.byteOffset, stride * height);
  const candidates = [0, 1, 2, 3, 4].map(() => Buffer.alloc(stride));
  // Pro Zeile den PNG-Filter wählen, der die kleinsten Werte ergibt – das komprimiert am besten.
  for (let y = 0; y < height; y++) {
    const line = pixels.subarray(y * stride, (y + 1) * stride);
    const above = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null;
    let best = 0, bestScore = Infinity;
    for (let filter = 0; filter < 5; filter++) {
      const out = candidates[filter];
      let score = 0;
      for (let i = 0; i < stride; i++) {
        const left = i >= 4 ? line[i - 4] : 0;
        const up = above ? above[i] : 0;
        const upLeft = above && i >= 4 ? above[i - 4] : 0;
        let predicted = 0;
        if (filter === 1) predicted = left;
        else if (filter === 2) predicted = up;
        else if (filter === 3) predicted = (left + up) >> 1;
        else if (filter === 4) {
          const p = left + up - upLeft;
          const pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - upLeft);
          predicted = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        }
        const value = (line[i] - predicted) & 255;
        out[i] = value;
        score += value < 128 ? value : 256 - value;
      }
      if (score < bestScore) {
        bestScore = score;
        best = filter;
      }
    }
    raw[y * (stride + 1)] = best;
    candidates[best].copy(raw, y * (stride + 1) + 1);
  }
  const chunk = (type, body) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(body.length);
    const typeAndBody = Buffer.concat([Buffer.from(type, 'ascii'), body]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndBody));
    return Buffer.concat([length, typeAndBody, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // Bits pro Kanal
  header[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export const readPNG = (file) => decodePNG(fs.readFileSync(file));
export const writePNG = (file, image) => fs.writeFileSync(file, encodePNG(image));
