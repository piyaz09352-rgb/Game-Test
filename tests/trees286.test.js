/* VAYRATHEN — tests/trees286.test.js — (v286) no map is a forest of one tree
   The owner: "some maps repeat the same tree a lot; I want variety". v280 gave a land's big tree 45 % of every prop with
   3 shapes. Now each map mixes the trees of its land evenly, each kind with 8 shapes, and each tree has its own size and facing. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('every hunting map mixes its trees', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const TR = new Set(['tree', 'palm', 'pine', 'himtree', 'bamboo', 'banana', 'treefern', 'araucaria', 'deadtree', 'thorntree', 'cycad']), bad = [], rows = [];
      for (const m of MAPS){ if (!m || m.town) continue; try { loadMap(m.id); } catch (e) { continue; } await new Promise(res => setTimeout(res, 20));
        const t = PROPS.filter(p => TR.has(p.type)); if (t.length < 10) continue; const c = {}, sh = new Set(); for (const p of t){ c[p.type] = (c[p.type] || 0) + 1; sh.add(p.type + p.variant); }
        const top = Math.max(...Object.values(c)) / t.length, kinds = Object.keys(c).length;
        rows.push(kinds); if (top > .6 || kinds < 2 || sh.size < 12) bad.push(`${m.id} ${m.biome}: ${kinds} kinds, top ${Math.round(top * 100)}%, ${sh.size} shapes`);
        const snowy = /glacier|frost|frozen|kailash|icecave|snow|tundra/.test(m.biome);
        if (!snowy && t.some(p => p.type === 'pine' && p.variant % 2)) bad.push(`${m.id} ${m.biome}: a snowy pine in a green land`); }
      const vk = PROPS.filter(p => p.vk).length;
      return { bad, maps: rows.length, vk };
    });
    assert.ok(r.maps >= 50, 'maps checked: ' + r.maps);
    assert.deepStrictEqual(r.bad, []);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
