/* VAYRATHEN — tests/load.js — loads the game's plain browser scripts into a Node `vm` context so the data and
   pure logic can be tested without a browser. Scripts share one global scope, exactly like <script> tags. */
'use strict';
const vm = require('vm'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');

/* the order the scripts appear in index.html */
function scriptOrder(){
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  return [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map(m => m[1]);
}

/* load the given scripts (paths relative to the game folder); returns a function to read globals, even `const` ones */
function load(files, { lang = 'th', extra = {} } = {}){
  const store = { 'vayrathen-settings-v1': JSON.stringify({ lang }) };
  const sandbox = {
    console, Math, Date, JSON, setTimeout: () => 0, clearTimeout: () => {}, requestAnimationFrame: () => 0,
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    document: { querySelectorAll: () => [], getElementById: () => null, addEventListener: () => {} },
    addEventListener: () => {}, matchMedia: () => ({ matches: false }), ...extra,
  };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(ROOT, f.split('?')[0]), 'utf8'), ctx, { filename: f });
  return expr => vm.runInContext(expr, ctx);
}

/* the data layer and everything it needs (sprites, utils, language, jobs, monsters, items, world, gear, quests) */
const DATA = (() => { const o = scriptOrder(); return o.slice(0, o.findIndex(f => f.split('?')[0] === 'js/data/quests.js') + 1); })();

module.exports = { ROOT, load, scriptOrder, DATA };
