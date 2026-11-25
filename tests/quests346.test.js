/* VAYRATHEN — tests/quests346.test.js — (v346) every quest in the game can be finished
   A quest that asks for an item no monster drops, or a monster that lives on no map, cannot be finished, and a player
   only finds out after hours. This test finds every quest goal in the game's data (main story, side journal, map stories,
   and any quest table added later: anything shaped {k:'kill'|'boss'|'item', t, n}) and checks:
   · a monster to hunt exists and lives on some map (or is that map's boss)
   · an item to gather exists and some monster living on a map drops it, or a shop sells it */
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
const { chromium, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed';
const ROOT = path.join(__dirname, '..');

test('every quest goal can be done: its monster lives on a map, its item drops there or is sold', { skip, timeout: 180000 }, async () => {
  // the game's top-level tables (const NAME = …) from every script index.html loads
  const files = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/src="(js\/[^"?]+)/g)].map(m => m[1]);
  const names = [...new Set(files.flatMap(f => [...fs.readFileSync(path.join(ROOT, f), 'utf8').matchAll(/^(?:const|let|var) ([A-Z][A-Z0-9_]+) ?=/gm)].map(m => m[1])))];
  const { page, errors, close } = await openGame({ width: 800, height: 600 });
  try {
    const r = await page.evaluate(NAMES => { const goals = [], vis = new WeakSet();
      const walk = (v, d, p) => { if (d > 8 || v == null || typeof v !== 'object' || vis.has(v) || v instanceof Node || v === window || ArrayBuffer.isView(v)) return; vis.add(v);
        if ((v.k === 'item' || v.k === 'kill' || v.k === 'boss') && typeof v.t === 'string' && v.n > 0) goals.push([p, v.k, v.t]);
        try { for (const k of Object.keys(v).slice(0, 5000)) walk(v[k], d + 1, p); } catch (e) {} };
      for (const k of NAMES){ if (k === 'S' || k === 'ITEMS') continue; try { walk((0, eval)(k), 0, k); } catch (e) {} }
      const spawn = new Set(); for (const m of MAPS){ for (const x of m.mobs || []) spawn.add(x); if (m.boss) spawn.add(m.boss); }
      const drops = {}; for (const [id, m] of Object.entries(MOB)) for (const d of m.drops || []) (drops[d[0]] = drops[d[0]] || []).push(id);
      const bad = new Set(), tables = {};
      for (const [p, k, t] of goals){ tables[p] = (tables[p] || 0) + 1;
        if (k === 'item'){ if (!ITEMS[t]) bad.add(`${p}: item ${t} does not exist`);
          else if (!(drops[t] || []).some(x => spawn.has(x)) && !ITEMS[t].buy && !ITEMS[t].price) bad.add(`${p}: no monster on any map drops ${t}, and no shop sells it`); }
        else if (!MOB[t]) bad.add(`${p}: ${k} ${t} does not exist`);
        else if (!spawn.has(t)) bad.add(`${p}: ${k} ${t} lives on no map`); }
      return {n:goals.length, tables, bad:[...bad]}; }, names);
    assert.ok(r.n >= 300 && r.tables.QUESTS && r.tables.SIDE && r.tables.MS_CH, 'quest goals found: ' + JSON.stringify(r.tables));
    assert.deepStrictEqual(r.bad, [], `${r.n} goals checked`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
