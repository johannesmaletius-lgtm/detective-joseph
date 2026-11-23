// Kurze Laute von Joseph, die das Spiel immer wieder benutzt (src/audio/voices.js → react()).
// Vertont mit eleven_v3, damit die Tags in [eckigen Klammern] (Gähnen, Seufzen …) wirken.
// Im Manifest stehen sie unter „~art~nr“, nicht unter dem Text.
//   node tools/voice-generate.mjs joseph
export const REACTIONS = {
  solved: ['Aha!', 'Na also!', 'Ja! Das war’s.', '[laughs] Ha! Na bitte.', 'Geschafft!', 'Hab ich dich.'],
  think: ['Hmm …', 'Moment mal …', 'Hm. Lass mich überlegen …', 'Mal sehen …', 'Hm. Interessant …'],
  mistake: ['Mist.', 'Hm, nein.', 'Das war’s wohl nicht.', 'Nee …', '[sighs] Falsch.'],
  wow: ['Oh!', 'Na sieh mal an.', 'Oh, sehr gut.', 'Ah!'],
  scared: ['[gasps] Huch!', '[gasps] Was war das?!', '[gasps] Ah!', 'Uff … [nervous] ganz ruhig.'],
  tired: ['[yawns] Haaah …', '[yawns] Hmm … müde.', '[sighs] Nicht einschlafen …', '[yawns] Wach bleiben, Joseph.'],
};

export const reactionLines = () => Object.entries(REACTIONS).flatMap(([kind, texts]) =>
  texts.map((text, i) => ({ speaker: 'joseph', key: `~${kind}~${i + 1}`, text, model: 'eleven_v3' })));
