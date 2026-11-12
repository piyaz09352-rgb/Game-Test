/* VAYRATHEN — tests/heaven297.test.js — (v297) the third land, สวรรค์: an island above the clouds
   · maps 30 and 60 are the sky island: no earthly trees, rocks or bricks, gaps look down at the sky, no night, no weather;
   · no cook and no campfire (a golden lotus lamp); its new creatures are bodies of their own and draw in every pose;
   · the way up from the Crystal Palace (59) is the world tree; the story's monsters live on the map */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('สวรรค์: a sky island, heavenly plants only, creatures of its own, the world tree way up', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const out = {};
      for (const id of [30, 60]){ loadMap(id); await new Promise(res => setTimeout(res, 300));
        out[id] = {sky:heavenHere(), earthly:PROPS.filter(p => HVN_EARTHLY.has(p.type)).map(p => p.type), gaps:WATERS.filter(w => w.k === 'pond').every(w => w.kind === 'sky'),
          cook:NPCS.some(n => n.id === 'campcook'), wx:wxRoll(), mobs:MAPS[id].mobs.slice()}; }
      const fresh = ['skywhale', 'heavenlotus', 'devachakra'];
      out.draws = fresh.filter(k => { try { for (const a of ['idle', 'walk', 'attack', 'die']) for (let f = 0; f < 4; f++) SPR.renderFrame('mob', k, a, f % 3, f, 1); return true; } catch (e) { return false; } });
      out.arch = fresh.map(k => SPECIES_ARCH[k]);
      const ch = MS_CH[30]; out.targets = ch.steps.filter(s => s.k === 'kill' || s.k === 'elite').map(s => s.t).concat(ch.steps.filter(s => s.k === 'item').map(s => s.t.replace(/^m_/, '')));
      loadMap(59); out.tree = GATES.filter(g => g.to === 30 || g.to === 60).map(heavenGate);
      return out; });
    for (const id of [30, 60]){ const m = r[id];
      assert.ok(m.sky, `map ${id} is the sky island`); assert.deepStrictEqual(m.earthly, [], `no earthly trees, rocks or bricks on map ${id}`);
      assert.ok(m.gaps, 'its ponds are gaps down to the sky'); assert.ok(!m.cook, 'no cook in heaven'); assert.strictEqual(m.wx, 'clear', 'no weather in heaven'); }
    assert.strictEqual(r.draws.length, 3, 'the new creatures draw in every pose');
    assert.deepStrictEqual(r.arch, ['sky', 'sky', 'sky'], 'bodies of their own, not recoloured copies');
    for (const t of r.targets) assert.ok(r[30].mobs.includes(t), 'story monster lives on map 30: ' + t);
    assert.ok(r.tree.length && r.tree.every(Boolean), 'the way up from the Crystal Palace is the world tree');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
