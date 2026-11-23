// Sammelt Josephs Sätze, die er im Gespräch mit anderen Figuren sagt: alle story.say(...) in Funktionen,
// in denen auch eine Figur spricht (speakAs/speak), dazu die Fragen aus den Gesprächsauswahlen (choose).
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
}
const list = [...out.values()];
writeFileSync(new URL('joseph-dialogue-lines.json', import.meta.url), JSON.stringify(list, null, 1));
for (const kind of ['say', 'choice']) {
  const l = list.filter((x) => x.kind === kind);
  console.log(kind, l.length, 'Sätze,', l.reduce((s, x) => s + x.text.length, 0), 'Zeichen');
}
if (unresolved.length) console.log('Mit Platzhalter (nicht vertonbar):', unresolved);
