/* VAYRATHEN — tests/lands298.test.js — (v298) the last five lands: forbidden valley, desolation, drought, civilization, plenty
   · each land's maps get their own scenery and lose what does not belong there; the desolate land has nobody at the camp
     and its fire is cold; each land's way in is drawn its own way; each land's creatures are bodies of their own;
   · the stories' monsters live on their maps */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('the last five lands: scenery, ways in, creatures of their own, stories', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const out = {lands:{}};
      for (const k in LAND8){ for (const id of LAND8[k].maps){ loadMap(id); await new Promise(res => setTimeout(res, 150));
        out.lands[id] = {k, here:land8Here(), wrong:PROPS.filter(p => LAND8[k].drop.includes(p.type)).map(p => p.type), added:LAND8[k].add.map(([t]) => PROPS.filter(p => p.type === t).length), cook:NPCS.some(n => n.id === 'campcook')}; } }
      const fresh = ['rockpangolin', 'hollowarmor', 'desertcamel', 'dungbeetle', 'brassautomaton', 'meadowram'];
      out.draws = fresh.filter(k => { try { for (const a of ['idle', 'walk', 'attack', 'die']) for (let f = 0; f < 4; f++) SPR.renderFrame('mob', k, a, f % 3, f, 1); return true; } catch (e) { return false; } });
      out.arch = fresh.map(k => SPECIES_ARCH[k]);
      out.story = {}; for (const id of [22, 51, 21, 10, 31]){ const ch = MS_CH[id]; out.story[id] = ch.steps.filter(s => s.k === 'kill' || s.k === 'elite').map(s => s.t).concat(ch.steps.filter(s => s.k === 'item').map(s => s.t.replace(/^m_/, ''))).filter(t => !MAPS[id].mobs.includes(t)); }
      out.gates = {}; for (const [from, to] of [[41, 22], [5, 51], [39, 21], [37, 10], [1, 31]]){ loadMap(from); out.gates[to] = GATES.filter(g => g.to === to).map(land8Gate); }
      return out; });
    for (const [id, m] of Object.entries(r.lands)){
      assert.strictEqual(m.here, m.k, `map ${id} belongs to its land`); assert.deepStrictEqual(m.wrong, [], `nothing out of place on map ${id}`);
      assert.ok(m.added.every(n => n > 0), `the land's own scenery is on map ${id}: ${m.added}`);
      if (m.k === 'ruin') assert.ok(!m.cook, 'nobody at the camp in the desolate land'); }
    assert.strictEqual(r.draws.length, 6, 'the new creatures draw in every pose');
    assert.ok(r.arch.every(a => a === 'land'), 'bodies of their own, not recoloured copies');
    for (const [id, missing] of Object.entries(r.story)) assert.deepStrictEqual(missing, [], `story monsters live on map ${id}`);
    for (const [to, ks] of Object.entries(r.gates)) assert.ok(ks.length && ks.every(Boolean), `the way into map ${to} is drawn as its land's entrance`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
