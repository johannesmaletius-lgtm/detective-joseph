// Baut eine Web-Fassung des Spiels zum Weitergeben (GitHub Pages, siehe .github/workflows/pages.yml):
//   node tools/build-web.mjs <zielordner>
// - kopiert index.html, style.css, src/ und die Bilder aus assets/ (ohne assets/reference/)
// - fasst die Sprachdateien jeder Figur zu EINER Datei zusammen (assets/voices/<figur>.mp3, braucht ffmpeg),
//   das Manifest bekommt dann { file, start, end } – so bleibt die Seite unter 511 Dateien
// - Türen öffnen sich nach Datum wie im echten Spiel (zum Ausprobieren ?test anhängen)
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { renameSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] && resolve(process.argv[2]);
if (!out) throw new Error('Zielordner angeben: node tools/build-web.mjs <ordner>');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

cpSync(join(root, 'src'), join(out, 'src'), { recursive: true });
cpSync(join(root, 'style.css'), join(out, 'style.css'));
cpSync(join(root, 'assets'), join(out, 'assets'), {
  recursive: true,
  filter: (src) => !src.includes(`${join('assets', 'reference')}`) && !src.includes(join('assets', 'voices')),
});

// Seite: index.html wie im Projekt, nur ohne den Hinweis für lokal geöffnete Dateien
const html = readFileSync(join(root, 'index.html'), 'utf8').replace(/\s*<script>[\s\S]*?<\/script>/, '');
writeFileSync(join(out, 'index.html'), html);
writeFileSync(join(out, '.nojekyll'), '');

// Sprachdateien je Figur und Wagen hintereinander (mit kurzer Stille), Startzeiten messen.
// <figur>-w<nr>.<hash>.mp3 lädt das Spiel erst mit dem Wagen; <figur>.<hash>.mp3 (Laute, gemeinsame Sätze) gleich beim Start.
const manifest = JSON.parse(readFileSync(join(root, 'assets/voices/manifest.json'), 'utf8'));
const wagonOf = {};
for (const list of ['tools/voice-lines.json', 'tools/joseph-dialogue-lines.json']) {
  for (const { text, file } of JSON.parse(readFileSync(join(root, list), 'utf8'))) {
    const n = /^wagon(\d+)\.js$/.exec(file)?.[1];
    if (n) wagonOf[text] ??= n;
  }
}
const bySpeaker = {};
for (const [text, file] of Object.entries(manifest)) {
  const speaker = file.split('/')[2];
  const group = wagonOf[text] ? `${speaker}-w${wagonOf[text]}` : speaker;
  (bySpeaker[group] ??= []).push({ text, file });
}
mkdirSync(join(out, 'assets/voices'), { recursive: true });
const tmp = join(out, '.tmp');
mkdirSync(tmp);
const GAP = 0.4;
const web = {};
for (const [speaker, lines] of Object.entries(bySpeaker)) {
  let t = 0;
  const parts = [];
  for (const { text, file } of lines) {
    const wav = join(tmp, `${parts.length}.wav`);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', join(root, file), '-af', `apad=pad_dur=${GAP}`, '-ar', '44100', '-ac', '1', wav]);
    const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav]).toString());
    web[text] = { file: speaker, start: +t.toFixed(3), end: +(t + dur - GAP).toFixed(3) };
    parts.push(wav);
    t += dur;
  }
  writeFileSync(join(tmp, 'list.txt'), parts.map((p) => `file '${p}'`).join('\n'));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', join(tmp, 'list.txt'), '-c:a', 'libmp3lame', '-b:a', '64k', '-ac', '1', join(out, `assets/voices/${speaker}.mp3`)]);
  // Name mit Prüfsumme (<figur>-w<nr>.<hash>.mp3): neue Aufnahmen kommen nie aus dem Browser-Zwischenspeicher
  const hash = createHash('sha1').update(readFileSync(join(out, `assets/voices/${speaker}.mp3`))).digest('hex').slice(0, 8);
  renameSync(join(out, `assets/voices/${speaker}.mp3`), join(out, `assets/voices/${speaker}.${hash}.mp3`));
  for (const { text } of lines) web[text].file = `assets/voices/${speaker}.${hash}.mp3`;
  for (const p of parts) rmSync(p);
  console.log(speaker, lines.length, 'Sätze');
}
rmSync(tmp, { recursive: true });
writeFileSync(join(out, 'assets/voices/manifest.json'), JSON.stringify(web));
console.log('Fertig:', out);
