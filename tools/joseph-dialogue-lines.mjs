// Sammelt Josephs Sätze, die er im Gespräch mit anderen Figuren sagt: alle story.say(...) in Funktionen,
// in denen auch eine Figur spricht (speakAs/speak), dazu die Fragen aus den Gesprächsauswahlen (choose)
// und die Sätze am Anfang jedes Wagens (intro) und wichtige Momente (moment) sowie Türen und Schlösser (door), siehe unten.
// Ausgabe: tools/joseph-dialogue-lines.json  [{ text, file, kind }]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const DIR = new URL('../src/story/', import.meta.url);
const FN = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);
const out = new Map();
const unresolved = [];

function lits(node, consts, acc = [], seen = new Set()) {
  if (!node) return acc;
  if (node.type === 'Literal' && typeof node.value === 'string') acc.push(node.value);
  else if (node.type === 'TemplateLiteral') {
    if (!node.expressions.length) acc.push(node.quasis[0].value.cooked);
    else unresolved.push(node.quasis.map((q) => q.value.cooked).join('${…}'));
  } else if (node.type === 'Identifier') {
    if (consts.has(node.name) && !seen.has(node.name)) { seen.add(node.name); lits(consts.get(node.name), consts, acc, seen); }
  } else if (node.type === 'MemberExpression') lits(node.object, consts, acc, seen);
  else for (const k of ['consequent', 'alternate', 'left', 'right', 'elements', 'arguments']) {
    const v = node[k];
    if (Array.isArray(v)) v.forEach((n) => lits(n, consts, acc, seen));
    else if (v?.type) lits(v, consts, acc, seen);
  }
  return acc;
}

// Aufrufe direkt in dieser Funktion (ohne verschachtelte Funktionen)
function ownCalls(fn) {
  const calls = [];
  (function visit(node) {
    if (!node || typeof node.type !== 'string') return;
    if (node !== fn && FN.has(node.type)) return;
    if (node.type === 'CallExpression') calls.push(node);
    for (const key of Object.keys(node)) {
      const v = node[key];
      if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === 'string' && visit(c));
      else if (v && typeof v.type === 'string') visit(v);
    }
  })(fn.body ?? fn);
  return calls;
}
const method = (c) => (c.callee.type === 'MemberExpression' ? c.callee.property.name : c.callee.name);

for (const name of readdirSync(DIR).filter((f) => /^wagon\d+\.js$/.test(f))) {
  const ast = acorn.parse(readFileSync(new URL(name, DIR), 'utf8'), { ecmaVersion: 'latest', sourceType: 'module' });
  const consts = new Map();
  walk.full(ast, (n) => {
    if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.init) consts.set(n.id.name, n.init);
    if (n.type === 'ForOfStatement' && n.left.type === 'VariableDeclaration') consts.set(n.left.declarations[0].id.name, n.right);
  });
  const add = (text, kind) => { if (/\p{L}/u.test(text) && !out.has(text)) out.set(text, { text, file: name, kind }); };
  walk.full(ast, (fn) => {
    if (!FN.has(fn.type)) return;
    const calls = ownCalls(fn);
    if (!calls.some((c) => ['speakAs', 'speak'].includes(method(c)))) return;
    for (const c of calls) if (method(c) === 'say') lits(c.arguments[0], consts).forEach((t) => add(t, 'say'));
  });
  walk.full(ast, (c) => {
    if (c.type !== 'CallExpression' || method(c) !== 'choose') return;
    const arg = c.arguments[0];
    const list = arg?.type === 'Identifier' ? consts.get(arg.name) : arg;
    walk.full(list ?? { type: 'EmptyStatement' }, (p) => {
      if (p.type === 'Property' && p.key.name === 'text') lits(p.value, consts).forEach((t) => add(t, 'choice'));
    });
    if (list?.type === 'ArrayExpression') list.elements.forEach((e) => e?.type === 'Literal' && add(e.value, 'choice'));
  });
  // Der Anfang jedes Wagens (intro): alles, was Joseph dort sagt, und die lines von wagonIntro(...)
  walk.full(ast, (p) => {
    if (p.type !== 'Property' || p.key.name !== 'intro' || !FN.has(p.value.type)) return;
    walk.full(p.value, (c) => {
      if (c.type !== 'CallExpression') return;
      if (method(c) === 'say') lits(c.arguments[0], consts).forEach((t) => add(t, 'intro'));
      if (method(c) === 'wagonIntro') {
        const lines = c.arguments[1]?.properties?.find((q) => q.key.name === 'lines');
        if (lines) lits(lines.value, consts).forEach((t) => add(t, 'intro'));
      }
    });
  });
}
// Wichtige Momente, die (fast) jeder Spieler hört: Zwischensequenzen (cutscene), was im Tunnel oder von selbst
// passiert (onTunnel, update), gelöste Rätsel (Geräusch success/unlock/dread) und gefundene Gegenstände (give).
// Dazu die gemeinsamen Sätze aus wagonCommon.js (z. B. Warten auf den Tunnel).
const KEY_SOUNDS = new Set(['success', 'unlock', 'dread']);
for (const name of readdirSync(DIR).filter((f) => /^wagon(\d+|Common)\.js$/.test(f))) {
  const ast = acorn.parse(readFileSync(new URL(name, DIR), 'utf8'), { ecmaVersion: 'latest', sourceType: 'module' });
  const consts = new Map();
  walk.full(ast, (n) => { if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.init) consts.set(n.id.name, n.init); });
  const add = (text) => { if (/\p{L}/u.test(text) && !out.has(text)) out.set(text, { text, file: name, kind: 'moment' }); };
  const says = (node) => walk.full(node, (c) => { if (c.type === 'CallExpression' && method(c) === 'say') lits(c.arguments[0], consts).forEach(add); });
  if (name === 'wagonCommon.js') {
    says(ast);
    walk.full(ast, (n) => { if (n.type === 'AssignmentPattern' && n.left.name === 'line') lits(n.right, consts).forEach(add); });
    continue;
  }
  walk.full(ast, (c) => { if (c.type === 'CallExpression' && method(c) === 'cutscene' && c.arguments[0]) says(c.arguments[0]); });
  walk.full(ast, (p) => { if (p.type === 'Property' && ['onTunnel', 'update'].includes(p.key.name) && FN.has(p.value.type)) says(p.value); });
  walk.full(ast, (fn) => {
    if (!FN.has(fn.type)) return;
    const calls = ownCalls(fn);
    const key = calls.some((c) => method(c) === 'give' || (method(c) === 'sound' && KEY_SOUNDS.has(c.arguments[0]?.value)));
    if (key) for (const c of calls) if (method(c) === 'say') lits(c.arguments[0], consts).forEach(add);
  });
}

// Türen und Schlösser: was Joseph beim Anschauen sagt (look), und die Sätze bei falschem Code (tryCode: wrong, dark)
for (const name of readdirSync(DIR).filter((f) => /^wagon\d+\.js$/.test(f))) {
  const ast = acorn.parse(readFileSync(new URL(name, DIR), 'utf8'), { ecmaVersion: 'latest', sourceType: 'module' });
  const consts = new Map();
  walk.full(ast, (n) => { if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.init) consts.set(n.id.name, n.init); });
  const add = (text) => { if (/\p{L}/u.test(text) && !out.has(text)) out.set(text, { text, file: name, kind: 'door' }); };
  walk.full(ast, (h) => {
    if (h.type !== 'Property' || !/door|lock/i.test(h.key.name ?? '') || h.value.type !== 'ObjectExpression') return;
    for (const p of h.value.properties) {
      if (p.key?.name !== 'look') continue;
      if (FN.has(p.value.type)) walk.full(p.value, (c) => { if (c.type === 'CallExpression' && method(c) === 'say') lits(c.arguments[0], consts).forEach(add); });
      else lits(p.value, consts).forEach(add);
    }
  });
  walk.full(ast, (c) => {
    if (c.type !== 'CallExpression' || method(c) !== 'tryCode') return;
    for (const p of c.arguments[1]?.properties ?? []) if (['wrong', 'dark'].includes(p.key?.name)) lits(p.value, consts).forEach(add);
  });
}

// Alles Übrige, was Joseph sagt (Art rest), Wagen für Wagen ab Wagen 1 – damit bei knappem Budget vorne angefangen wird.
// Erfasst: say(...) überall und Sätze in hotspots/items (look, use, Kombinationen …).
// Nicht: Sätze der Figuren (speakAs/speak), Notizbuch (note, recap), Karten (card), Tipps (lines in hintFor-Zielen).
const npcLines = new Set(JSON.parse(readFileSync(new URL('voice-lines.json', import.meta.url), 'utf8')).map((l) => l.text));
const SKIP_CALLS = new Set(['speakAs', 'speak', 'note', 'card', 'hintFor']);
const SKIP_KEYS = new Set(['recap', 'lines', 'name', 'label', 'title', 'subtitle', 'id']);
const sentence = (t) => /\p{L}/u.test(t) && /\s/.test(t) && /[.!?…“”)]$/.test(t.trim());
const wagonFiles = readdirSync(DIR).filter((f) => /^wagon\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)));
for (const name of [...wagonFiles, 'wagonCommon.js']) {
  const ast = acorn.parse(readFileSync(new URL(name, DIR), 'utf8'), { ecmaVersion: 'latest', sourceType: 'module' });
  const consts = new Map();
  walk.full(ast, (n) => { if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.init) consts.set(n.id.name, n.init); });
  const add = (text) => { if (sentence(text) && !out.has(text) && !npcLines.has(text)) out.set(text, { text, file: name, kind: 'rest' }); };
  const skip = new Set(); // Knoten in Aufrufen/Eigenschaften, die nicht gesprochen werden
  walk.full(ast, (n) => {
    if ((n.type === 'CallExpression' && SKIP_CALLS.has(method(n))) || (n.type === 'Property' && SKIP_KEYS.has(n.key?.name))) walk.full(n, (m) => skip.add(m));
  });
  walk.full(ast, (c) => { if (c.type === 'CallExpression' && method(c) === 'say' && !skip.has(c)) lits(c.arguments[0], consts).forEach(add); });
  walk.full(ast, (p) => {
    if (p.type !== 'Property' || !['hotspots', 'items'].includes(p.key?.name)) return;
    walk.full(p.value, (n) => { if (!skip.has(n) && ((n.type === 'Literal' && typeof n.value === 'string') || (n.type === 'TemplateLiteral' && !n.expressions.length))) add(n.value ?? n.quasis[0].value.cooked); });
  });
}

const list = [...out.values()];
writeFileSync(new URL('joseph-dialogue-lines.json', import.meta.url), JSON.stringify(list, null, 1));
for (const kind of ['say', 'choice', 'intro', 'moment', 'door', 'rest']) {
  const l = list.filter((x) => x.kind === kind);
  console.log(kind, l.length, 'Sätze,', l.reduce((s, x) => s + x.text.length, 0), 'Zeichen');
}
if (unresolved.length) console.log('Mit Platzhalter (nicht vertonbar):', unresolved);
