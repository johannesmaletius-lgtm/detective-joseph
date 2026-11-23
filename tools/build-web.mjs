// Baut eine Web-Fassung des Spiels zum Weitergeben (z. B. als Artifact):
//   node tools/build-web.mjs <zielordner>
// - kopiert index.html, style.css, src/ und die Bilder aus assets/ (ohne assets/reference/)
// - fasst die Sprachdateien jeder Figur zu EINER Datei zusammen (assets/voices/<figur>.mp3, braucht ffmpeg),
//   das Manifest bekommt dann { file, start, end } – so bleibt die Seite unter 511 Dateien
// - alle 24 Wagen sind sofort auswählbar (Test-Modus an)
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2];
if (!out) throw new Error('Zielordner angeben: node tools/build-web.mjs <ordner>');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

cpSync(join(root, 'src'), join(out, 'src'), { recursive: true });
cpSync(join(root, 'style.css'), join(out, 'style.css'));
cpSync(join(root, 'assets'), join(out, 'assets'), {
  recursive: true,
  filter: (src) => !src.includes(`${join('assets', 'reference')}`) && !src.includes(join('assets', 'voices')),
});

// Test-Modus: alle Wagen offen
const config = join(out, 'src', 'config.js');
writeFileSync(config, readFileSync(config, 'utf8').replace("export const TEST_MODE = params.has('test');", 'export const TEST_MODE = true; // Web-Fassung: alle 24 Wagen auswählbar'));

// Seite (ohne <html>/<head>/<body> – das ergänzt das Artifact beim Veröffentlichen)
const html = readFileSync(join(root, 'index.html'), 'utf8');
const icon = html.match(/<link rel="icon"[^>]*>/)[0];
writeFileSync(join(out, 'index.html'), `<title>Detective Joseph</title>
${icon}
<link rel="stylesheet" href="style.css">
<main class="stage">
  <canvas id="game-canvas" width="1280" height="720" aria-label="Detective Joseph – Spielszene"></canvas>
  <p id="status" class="status">Lade Detective Joseph …</p>
</main>
<script type="module" src="src/main.js"></script>
`);

// Sprachdateien je Figur hintereinander (mit kurzer Stille), Startzeiten messen
const manifest = JSON.parse(readFileSync(join(root, 'assets/voices/manifest.json'), 'utf8'));
const bySpeaker = {};
for (const [text, file] of Object.entries(manifest)) (bySpeaker[file.split('/')[2]] ??= []).push({ text, file });
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
    web[text] = { file: `assets/voices/${speaker}.mp3`, start: +t.toFixed(3), end: +(t + dur - GAP).toFixed(3) };
    parts.push(wav);
    t += dur;
  }
  writeFileSync(join(tmp, 'list.txt'), parts.map((p) => `file '${p}'`).join('\n'));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', join(tmp, 'list.txt'), '-c:a', 'libmp3lame', '-b:a', '96k', '-ac', '1', join(out, `assets/voices/${speaker}.mp3`)]);
  for (const p of parts) rmSync(p);
  console.log(speaker, lines.length, 'Sätze');
}
rmSync(tmp, { recursive: true });
writeFileSync(join(out, 'assets/voices/manifest.json'), JSON.stringify(web));
console.log('Fertig:', out);
