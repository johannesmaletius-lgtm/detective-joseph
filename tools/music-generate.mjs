// Erzeugt die Hintergrundmusik (je Wagen ein Stück) und die Geräusche aus Dateien mit ElevenLabs.
//   node tools/music-generate.mjs            alles Fehlende erzeugen
//   node tools/music-generate.mjs musik      nur Musik      ·   … geraeusche   nur Geräusche
//   node tools/music-generate.mjs wagen-07   nur diese Datei (vorher löschen, um sie neu zu machen)
// Vorhandene Dateien werden übersprungen. Ergebnis: assets/music/<name>.mp3 und assets/sfx/<name>.mp3.
// Kosten (Starter-Tarif, gemessen 23.11.2026): Musik ≈ 750 Credits pro Minute, Geräusch ≈ 100 pro Stück.
// In der Cloud setzt der Proxy den Schlüssel ein; dort mit
//   NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt starten.
// Welche Datei wo spielt, steht in src/audio/music.js (Musik, Hintergrundgeräusche) und
// src/audio/soundEffects.js (SAMPLES: einzelne Geräusche).
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

const LENGTH_MS = 60000; // ein Stück läuft in Schleife
const STYLE =
  'Instrumental background music for a dark mystery puzzle adventure game set on a night train in winter that circles endlessly. ' +
  'Very understated and steady, low dynamics, no big climaxes, no drums, no vocals, suitable for looping under dialogue. ';

// Musik: je Wagen ein Stück (gleiche Klangfarbe, eigene Stimmung)
const MUSIC = {
  'wagen-02': 'Baggage car: slow pulsing double bass, muted piano clusters, creaking wood textures, curious but uneasy. 66 BPM.',
  'wagen-03': 'Empty mail car: lonely celesta motif, soft string pad, distant ticking, paper-like rustle, a ghostly feeling of letters from the past. 68 BPM.',
  'wagen-04': 'Dining car: a faded, slightly out-of-tune salon waltz on a distant piano, warped like a memory, under low brooding cello. Suspicion of poison. 72 BPM.',
  'wagen-05': 'Sleeping car: a hushed, dreamy lullaby on music box and soft strings, slightly eerie, like a sad dream. Very quiet. 60 BPM.',
  'wagen-06': 'Lost and found office: playful but melancholic pizzicato strings and celesta, forgotten objects, a hint of mystery. 76 BPM.',
  'wagen-07': 'Bar car: smoky slow noir jazz, brushed upright bass, muted trumpet far away, sparse piano, a lonely late-night mood. 70 BPM.',
  'wagen-08': 'On-board cinema: old silent-film organ and piano, flickering and unsettling, someone is standing behind you. 64 BPM.',
  'wagen-09': 'Mirror car: shimmering glass harmonica tones, reversed piano notes, uncanny and cold, reflections that do not match. 60 BPM.',
  'wagen-10': 'Loudspeaker car: low electric hum, analog synth drone, faint tape hiss, a presence watching through speakers, oppressive. 62 BPM.',
  'wagen-11': 'Clock car: interlocking clock-like pizzicato and celesta in odd rhythms, hundreds of clocks, time is wrong, nervous but quiet. 80 BPM.',
  'wagen-12': 'Music salon: a sad, unfinished piano melody that keeps breaking off, soft cello beneath, nostalgic Christmas memory turned melancholic. 66 BPM.',
  'wagen-13': 'Train chapel: quiet reverent organ drone, distant choir-like pad without words, soft bells far away, mourning and remembrance. 56 BPM.',
  'wagen-14': 'Newspaper archive car: tense low strings, typewriter-like soft clicks, a dark discovery about an old tragedy. 70 BPM.',
  'wagen-15': 'Playroom: a broken toy music box melody, a child\'s innocent tune turned eerie, soft and fragile, slightly detuned. 72 BPM.',
  'wagen-16': 'Radio room: analog radio static textures, slow morse-like pulses on muted synth, a desperate warning that nobody heard. 64 BPM.',
  'wagen-17': 'Greenhouse: warm humid ambient pads, dripping water sounds, slow harp, hidden secrets among the plants, mysterious. 60 BPM.',
  'wagen-18': 'Conductor compartment: solemn low brass and cello, a tired man\'s regret, quiet and heavy, slow revelation. 58 BPM.',
  'wagen-19': 'Darkroom: deep red atmosphere, slow minimal pulse, soft dissonant strings, images slowly appearing in the dark. 62 BPM.',
  'wagen-20': 'Parcel car: restless low strings, muffled thuds like boxes, a girl calling you papa that you do not understand, confusion. 70 BPM.',
  'wagen-21': 'Boiler car: deep industrial drone, rhythmic distant steam and metal like a slow heartbeat, heat and pressure, ominous. 74 BPM.',
  'wagen-22': 'Locomotive: driving but restrained low ostinato in cello and bass, steam engine rhythm, the truth comes closer, building quietly. 84 BPM.',
  'wagen-23': 'Maintenance tunnel: hollow dark drones, faraway metallic echoes, a hypnotic voice-like pad pulling you into sleep, claustrophobic. 58 BPM.',
  'wagen-24': 'Christmas Eve finale on the train: tense, emotional, quiet ostinato in strings, a faint Christmas carol motif hidden in the music box, decision time. 72 BPM.',
  'ende':
    'Warm, gentle and hopeful Christmas ending: soft piano and celesta, a quiet music box carol, warm strings, a family at home on Christmas Eve, peaceful and tender. ' +
    'Instrumental, no vocals, no drums, calm. 70 BPM.',
};

// Geräusche (ElevenLabs Sound Effects). loop = Hintergrund, der in Schleife läuft
const SFX = {
  'moll-summt': { seconds: 12, text: 'An old man softly humming a slow, melancholic waltz melody to himself with closed mouth, a few bars, then he hesitates and stops mid-phrase. Quiet, intimate, dry room, no music.' },
  entgleisen: { seconds: 7, text: 'A steam train derailing: emergency brakes screeching on steel rails, metal grinding and shrieking, carriages tipping over with a heavy crash, then debris settling and silence.' },
  'uhren': { seconds: 20, loop: true, text: 'Room full of hundreds of antique clocks ticking at slightly different speeds, gentle and continuous, no chimes.' },
  'kessel': { seconds: 20, loop: true, text: 'Inside a steam locomotive boiler room: roaring coal fire, low rumble, occasional soft steam hiss, continuous ambience.' },
  'gewaechshaus': { seconds: 20, loop: true, text: 'Quiet warm greenhouse ambience: slow water drips on leaves, faint humming of a heater, gentle and continuous.' },
  'funkraum': { seconds: 20, loop: true, text: 'Old vacuum tube radio room: soft low electrical hum and faint crackling shortwave static, continuous ambience.' },
  'speisewagen': { seconds: 20, loop: true, text: 'Empty dining car of a moving train at night: very faint clinking of glasses and cutlery from the train vibration, quiet continuous ambience, no voices.' },
  'kapelle': { seconds: 20, loop: true, text: 'Small quiet chapel: candles softly crackling, large reverberant stone room tone, very calm continuous ambience.' },
  'lok': { seconds: 20, loop: true, text: 'Inside a steam locomotive cab at night: rhythmic chuffing of the engine, hissing steam, coal fire, continuous ambience.' },
  'wartungsgang': { seconds: 20, loop: true, text: 'Dark narrow maintenance tunnel under a train: dripping water, distant hollow metallic echoes, faint wind, continuous eerie ambience.' },
  'stube': { seconds: 20, loop: true, text: 'Cozy living room on Christmas Eve: fireplace crackling softly, an old wall clock ticking slowly, calm continuous ambience, no voices.' },
};

const root = new URL('../', import.meta.url);
const key = process.env.ELEVENLABS_API_KEY ?? 'proxy-injected';
const only = process.argv[2];
mkdirSync(new URL('assets/music/', root), { recursive: true });
mkdirSync(new URL('assets/sfx/', root), { recursive: true });

async function save(url, body, file) {
  const res = await fetch(url, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text();
    console.error(`✗ ${file}: ${res.status} ${text.slice(0, 300)}`);
    if (/quota|credits/i.test(text)) process.exit(1); // Konto leer: sauber aufhören
    return;
  }
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log(`✓ ${file.pathname.split('/assets/')[1]}`);
}

const wantMusic = !only || only === 'musik' || MUSIC[only];
const wantSfx = !only || only === 'geraeusche' || SFX[only];

if (wantMusic) {
  for (const [name, prompt] of Object.entries(MUSIC)) {
    if (only && MUSIC[only] && only !== name) continue;
    const file = new URL(`assets/music/${name}.mp3`, root);
    if (existsSync(file)) continue;
    await save('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', {
      prompt: name === 'ende' ? prompt : STYLE + prompt,
      music_length_ms: LENGTH_MS,
      force_instrumental: true,
    }, file);
  }
}

if (wantSfx) {
  for (const [name, { seconds, loop = false, text }] of Object.entries(SFX)) {
    if (only && SFX[only] && only !== name) continue;
    const file = new URL(`assets/sfx/${name}.mp3`, root);
    if (existsSync(file)) continue;
    await save('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
      text, duration_seconds: seconds, prompt_influence: 0.5, loop, model_id: 'eleven_text_to_sound_v2',
    }, file);
  }
}
