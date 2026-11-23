// Sammelt alle Sätze, die Figuren sprechen (story.speakAs / story.speak), aus src/story/*.js.
// Ausgabe: tools/voice-lines.json  [{ speaker, text, file }]
//   node tools/voice-lines.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const acorn = require('acorn');
const walk = require('acorn-walk');

const DIR = new URL('../src/story/', import.meta.url);
const lines = new Map();
const unresolved = [];

function strings(node, consts, out = [], seen = new Set()) {
  if (!node) return out;
  if (node.type === 'Literal' && typeof node.value === 'string') out.push(node.value);
  else if (node.type === 'TemplateLiteral') {
    if (node.expressions.length === 0) out.push(node.quasis[0].value.cooked);
    else unresolved.push('Template: ' + node.quasis.map((q) => q.value.cooked).join('${…}'));
  } else if (node.type === 'Identifier') {
    if (consts.has(node.name) && !seen.has(node.name)) { seen.add(node.name); strings(consts.get(node.name), consts, out, seen); }
    else if (!consts.has(node.name)) unresolved.push('Name: ' + node.name);
  } else if (node.type === 'MemberExpression' && !node.computed && consts.props.has(node.property.name)) {
    for (const v of consts.props.get(node.property.name)) strings(v, consts, out, seen);
  } else if (node.type === 'MemberExpression') strings(node.object, consts, out, seen);
  else for (const key of ['consequent', 'alternate', 'left', 'right', 'elements', 'arguments', 'properties', 'value', 'body', 'expression']) {
    const v = node[key];
    if (Array.isArray(v)) v.forEach((n) => strings(n, consts, out, seen));
    else if (v && typeof v === 'object' && v.type) strings(v, consts, out, seen);
  }
  return out;
}

for (const name of readdirSync(DIR).filter((f) => /^wagon\d+\.js$/.test(f))) {
  const src = readFileSync(new URL(name, DIR), 'utf8');
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module' });
  const consts = new Map();
  consts.props = new Map();
  walk.full(ast, (n) => {
    if (n.type === 'Property' && n.key.type === 'Identifier') {
      if (!consts.props.has(n.key.name)) consts.props.set(n.key.name, []);
      consts.props.get(n.key.name).push(n.value);
    }
  });
  walk.full(ast, (n) => {
    if (n.type === 'ForOfStatement' && n.left.type === 'VariableDeclaration') consts.set(n.left.declarations[0].id.name, n.right);
  });
  walk.full(ast, (n) => { if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.init) consts.set(n.id.name, n.init); });
  const add = (speaker, node) => {
    for (const text of strings(node, consts)) {
      if (text.length < 2 || !/[\p{L}]/u.test(text)) continue;
      const key = speaker + '|' + text;
      if (!lines.has(key)) lines.set(key, { speaker, text, file: name });
    }
  };
  const speakFor = (opts) => {
    if (name === 'wagon5.js') return 'ilse';
    return 'conductor';
  };
  walk.full(ast, (n) => {
    if (n.type !== 'CallExpression') return;
    const c = n.callee;
    const method = c.type === 'MemberExpression' ? c.property.name : c.type === 'Identifier' ? c.name : null;
    if (method === 'speakAs' && n.arguments[0]?.type === 'Literal') add(n.arguments[0].value, n.arguments[1]);
    else if (method === 'speakAs') unresolved.push(`${name}: speakAs mit Variable`);
    else if (method === 'speak' && n.arguments[0]?.type !== 'Identifier') add(speakFor(n.arguments[1]), n.arguments[0]);
    else if (method === 'speak' || (method === 'voice' && name === 'wagon10.js')) {
      if (method === 'voice') add('conductor', n.arguments[0]);
      else add(speakFor(), n.arguments[0]);
    }
  });
}
const list = [...lines.values()];
writeFileSync(new URL('voice-lines.json', import.meta.url), JSON.stringify(list, null, 1));
const by = {};
for (const l of list) by[l.speaker] = (by[l.speaker] ?? 0) + l.text.length;
console.log(by, 'gesamt Zeichen:', list.reduce((s, l) => s + l.text.length, 0), 'Sätze:', list.length);
console.log('Ungeklärt:', [...new Set(unresolved)].join('\n'));
