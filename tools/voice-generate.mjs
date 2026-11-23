// Erzeugt die Tondateien für die Sprechtexte der Figuren mit ElevenLabs.
//   node tools/voice-lines.mjs              (erst die Sätze sammeln; für Joseph: tools/joseph-dialogue-lines.mjs)
//   node tools/voice-generate.mjs bruno     (dann eine oder mehrere Figuren vertonen)
//   node tools/voice-generate.mjs alle      (alles Fehlende vertonen, veraltete Sätze entfernen)
// Bereits vorhandene Dateien werden übersprungen. Ergebnis: assets/voices/<figur>/<nr>.mp3
// und assets/voices/manifest.json (Satz → Datei), das das Spiel beim Start lädt.
// Der Schlüssel kommt aus ELEVENLABS_API_KEY (in der Cloud setzt ihn der Proxy ein; dort mit
//   NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt starten).
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { reactionLines } from './joseph-reactions.mjs';

const VOICES = {
  // Stimmen aus der ElevenLabs-Bibliothek (deutsche Muttersprachler, ab Starter-Tarif)
  mira: 'cQIPwmwhLZssddrp5o3h', // Laura – Magical Fairytales
  bruno: 'U2swAVvmpE98PJAkPUMP', // Willy Lübke – Rough & Bold
  tick: 'Lbm7qDmJUxIxpWx9qhZO', // Eldric – Verrücktes Genie
  moll: 'xouqnknI7nCiPaJ9gwt8', // Tom – Gloomy and Disappointed
  k: 'VjWOqc90NMYAnt5VlDD8', // Kornas – Danisch
  heizer: 'uYBtrwzOqK8qaectN0V2', // Nikolaus – Rumbling and Reassuring
  barkeeper: '8WgkgItVYGBs7XNW7D6w', // Maik – berlinerisch
  ilse: 'nztoarMvjgs3c0c5DINJ', // Oma Elisabeth – Warm & Cozy
  conductor: 'b0JqlN5qkeuPi5BoQiHn', // Hermann – Sympathetic and Trustworthy
  joseph: 'aTTiK3YzK3dXETpuDE2h', // Ben – Effortless and Casual (nur Sätze im Gespräch, siehe joseph-dialogue-lines.mjs)
};
const MODEL = 'eleven_multilingual_v2';

const root = new URL('../', import.meta.url);
const lines = [
  ...JSON.parse(readFileSync(new URL('tools/voice-lines.json', root), 'utf8')),
  ...JSON.parse(readFileSync(new URL('tools/joseph-dialogue-lines.json', root), 'utf8')).map((l) => ({ ...l, speaker: 'joseph' })),
  ...reactionLines(), // Laute (Aha!, Hmm …, Gähnen …), Schlüssel „~art~nr“
];
const manifestUrl = new URL('assets/voices/manifest.json', root);
const manifest = existsSync(manifestUrl) ? JSON.parse(readFileSync(manifestUrl, 'utf8')) : {};
const key = process.env.ELEVENLABS_API_KEY ?? 'proxy-injected';

const all = process.argv[2] === 'alle';
const speakers = all ? Object.keys(VOICES) : process.argv.slice(2);
if (!speakers.length) throw new Error('Welche Figur? z. B. node tools/voice-generate.mjs bruno  (oder: alle)');
let chars = 0;
for (const speaker of speakers) {
  const voice = VOICES[speaker];
  if (!voice) throw new Error(`Keine Stimme für „${speaker}“ in VOICES eingetragen`);
  mkdirSync(new URL(`assets/voices/${speaker}/`, root), { recursive: true });
  for (const { text, key = text, model = MODEL } of lines.filter((l) => l.speaker === speaker)) {
    const id = createHash('sha1').update(speaker + '|' + (key === text ? text : key + '|' + text)).digest('hex').slice(0, 10);
    const file = `assets/voices/${speaker}/${id}.mp3`;
    if (!existsSync(new URL(file, root))) {
      // Anführungszeichen gehören nicht zur Aussprache
      const spoken = text.replace(/[„“”"]/g, '');
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: spoken, model_id: model, language_code: 'de' }),
      });
      if (!res.ok) throw new Error(`${res.status} bei „${text}“: ${await res.text()}`);
      writeFileSync(new URL(file, root), Buffer.from(await res.arrayBuffer()));
      chars += spoken.length;
      console.log('✓', speaker, text);
    }
    manifest[key] = file;
  }
}
// Bei „alle“: Sätze, die es im Spiel nicht mehr gibt, samt Datei entfernen
if (all) {
  const current = new Set(lines.map((l) => l.key ?? l.text));
  for (const [text, file] of Object.entries(manifest)) {
    if (current.has(text)) continue;
    if (existsSync(new URL(file, root))) unlinkSync(new URL(file, root));
    delete manifest[text];
    console.log('– entfernt:', text);
  }
}
writeFileSync(manifestUrl, JSON.stringify(manifest, null, 1));
console.log('Fertig. Verbrauchte Zeichen:', chars);
