/* VAYRATHEN — tests/abyss294.test.js — (v294) the first land, วังบาดาล, and waking in town after a fall
   · map 17 is under the sea: its own floor, sea props, no birds/rain, twelve kinds of sea creature that all draw;
   · the gateway into it from the maps next door is a whirlpool;
   · the story chapter's targets live on the map;
   · a hero saved fallen (0 HP) comes back in Aren with half HP, not dead again */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('วังบาดาล: undersea map, sea creatures, whirlpool way in, story; a fallen save wakes in town', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      loadMap(17); await new Promise(res => setTimeout(res, 400));
      const mobsHere = MAPS[17].mobs.slice(), sea = ['abyssshark', 'mantaray', 'giantpuffer', 'abyssangler', 'seahorseknight', 'lionfish', 'swordfish', 'abyssoctopus', 'armorlobster'];
      const draws = sea.filter(k => { try { for (const a of ['idle', 'walk', 'attack', 'die']) for (let f = 0; f < 4; f++) SPR.renderFrame('mob', k, a, f % 3, f, 1); return true; } catch (e) { return false; } });
      const types = {}; for (const p of PROPS) types[p.type] = (types[p.type] || 0) + 1;
      const under = abyssHere(), trenches = WATERS.filter(w => w.k === 'pond').every(w => w.kind === 'abyss');
      const ch = MS_CH[17], targets = ch.steps.filter(s => s.k === 'kill' || s.k === 'elite').map(s => s.t), items = ch.steps.filter(s => s.k === 'item').map(s => s.t);
      const homeless = Object.keys(SPECIES_ARCH).filter(k => !MOB[k].boss && !Object.values(MAPS).some(m => (m.mobs || []).includes(k)));
      loadMap(16); const whirl = GATES.filter(g => g.to === 17).map(abyssGate), other = GATES.filter(g => g.to !== 17).map(abyssGate);
      // a fallen save
      loadMap(9); S.hp = 0; P.dead = false; S.map = 9; loadMap(S.map); await new Promise(res => setTimeout(res, 300));
      return { mobsHere, sea, draws, types, under, trenches, wx:typeof wxRoll === 'function' ? (loadMap(17), wxRoll()) : 'clear', targets, items, homeless, whirl, other,
        woke:[MAP_ID === 0 || (loadMap(0), true), S.hp > 1, !P.dead] };
    });
    assert.ok(r.under, 'map 17 is under water');
    for (const k of r.sea) assert.ok(r.mobsHere.includes(k), k + ' lives on map 17');
    assert.deepStrictEqual(r.draws, r.sea, 'every new sea creature draws in every pose');
    for (const t of ['kelp', 'anemone', 'seafan', 'pillar']) assert.ok(r.types[t] > 0, 'sea prop on the map: ' + t);
    assert.ok(!r.types.tree && !r.types.flowerbed && !r.types.worldtree, 'no land trees or flowerbeds: ' + JSON.stringify(r.types));
    assert.ok(r.trenches, 'the ponds are dark trenches, not water surfaces');
    assert.strictEqual(r.wx, 'clear', 'no weather under the sea');
    for (const t of r.targets) assert.ok(r.mobsHere.includes(t), 'story target lives here: ' + t);
    for (const t of r.items) assert.ok(r.mobsHere.includes(t.replace(/^m_/, '')), 'story item drops here: ' + t);
    assert.deepStrictEqual(r.homeless, [], 'no species is left without a map');
    assert.ok(r.whirl.length && r.whirl.every(Boolean), 'the gate to the Sunken Palace is a whirlpool');
    assert.ok(r.other.every(v => !v), 'other gates stay warps');
    assert.ok(r.woke.every(Boolean), 'a fallen save wakes in town, alive: ' + r.woke);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
