/* VAYRATHEN — tests/aren311.test.js — (v311) Aren is a village-town: homes in the west, a farm hamlet in the east, a market
   lane south, roads to every gate; nothing blocks a way, and townsfolk walk the village too */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('Aren village-town: quarters, roads, every NPC and gate reachable, townsfolk in the village', { skip, timeout: 150000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { loadMap(0); await new Promise(res => setTimeout(res, 800)); const o = {}, cnt = t => PROPS.filter(p => p.type === t).length;
      o.homes = PROPS.filter(p => p.type === 'arhome' && p.x < 600).length; o.farms = PROPS.filter(p => p.type === 'arhome' && p.x > 1810).length; o.stalls = cnt('arstall'); o.rows = cnt('arrow'); o.sala = cnt('sala'); o.roads = ar11Roads().length;
      const st = VSPAWN, bad = [];
      for (const gt of GATES){ const a = inward(gt, 110); if (!findPath(st.x, st.y, a.x, a.y)) bad.push('gate ' + gt.side); }
      for (const n of NPCS){ const spots = [[0, 30], [0, 40], [24, 26], [-24, 26], [0, -30]].map(([dx, dy]) => ({x:n.x + dx, y:n.y + dy})).filter(q => walkable(q.x, q.y, 12)); if (!spots.some(q => findPath(st.x, st.y, q.x, q.y))) bad.push('npc ' + n.id); }
      for (const p of PROPS.filter(p => p.type === 'arhome' || p.type === 'arrow')){ const q = {x:p.x, y:p.y + 100}; if (!walkable(q.x, q.y, 12) || !findPath(st.x, st.y, q.x, q.y)) bad.push('door ' + Math.round(p.x) + ',' + Math.round(p.y)); }
      o.bad = bad; const pts = tlPoints(0); o.folkOut = pts.filter(p => Math.hypot((p.x - 1200) / 650, (p.y - 800) / 470) > 1).length; o.mobs = mobs.filter(m => !m.dead && !m.dummy).length; return o; });
    // (v315) the owner: «remove these houses from the town, all of them» — no homes, farmhouses or shophouses any more
    assert.strictEqual(r.homes + r.farms, 0, 'no homes in town: ' + (r.homes + r.farms)); assert.strictEqual(r.rows, 0, 'no shophouses in town: ' + r.rows);
    assert.strictEqual(r.stalls, 0, 'no market stalls in town either (v316): ' + r.stalls); assert.strictEqual(r.sala, 0, 'no pavilion (v316)'); assert.strictEqual(r.roads, 4, 'a road to each gate');
    assert.deepStrictEqual(r.bad, [], 'every gate, NPC and house door can be walked to');
    assert.ok(r.folkOut >= 10, 'townsfolk walk the village, not only the plaza: ' + r.folkOut); assert.strictEqual(r.mobs, 0, 'still no monsters in town');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
