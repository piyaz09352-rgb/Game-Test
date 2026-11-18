/* VAYRATHEN — tests/landmarks320.test.js — (v320) the hunting maps have their landmark (a waterfall, or the ruined prang;
   v321: the arch, crystals and wreck were taken out) standing clear of the camp, trail and gates; ordinary monsters bite and swipe with their own limbs */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('a landmark on every hunting map; monsters attack with their limbs', { skip, timeout: 300000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { const none = [], near = [], kinds = {};
      for (const m of MAPS){ if (!m || m.town || m.id === 0 || m.dungeon) continue; loadMap(m.id); await new Promise(res => setTimeout(res, 10));
        const lm = PROPS.find(p => p.landmark); if (!WFALLS.length && !lm){ if (m.biome !== 'cave') none.push(m.id + ' ' + m.biome); continue; }   /* (v322) only the caves have no landmark */
        if (lm) (kinds.v = kinds.v || new Set()).add(lm.variant);
        if (lm){ kinds[lm.type] = (kinds[lm.type] || 0) + 1; if ((CAMP && Math.hypot(lm.x - CAMP.x, lm.y - CAMP.y) < 650) || trailD(lm.x, lm.y) < 150 || GATES.some(g => Math.hypot(g.x - lm.x, g.y - lm.y) < 420)) near.push(m.id); } }
      // an ordinary monster's attack frames differ from its idle frame by more than the old slide
      const sig = img => { let h = 0; for (let i = 3; i < img.data.length; i += 8) h = (h * 31 + img.data[i]) >>> 0; return h; };
      const att = ['cloudedleopard', 'boar', 'forestcobra'].map(k => new Set([0, 1, 2, 3].map(f => sig(SPR.renderFrame('mob', k, 'attack', 2, f, 1)))).size);
      const nv = kinds.v ? kinds.v.size : 0; delete kinds.v; return {none, near, kinds, att, nv}; });
    assert.deepStrictEqual(r.none, [], 'every hunting map has a landmark');
    assert.deepStrictEqual(r.near, [], 'landmarks stand clear of the camp, the trail and the gates');
    assert.ok(r.kinds.lmprang >= 10, 'the prang stands in ruins, deserts, frozen lands and coasts: ' + r.kinds.lmprang);
    assert.strictEqual(r.nv, 4, 'in four weatherings (jungle, sand, snow, salt)');
    for (const k of ['lmarch', 'lmspire', 'lmwreck']) assert.ok(!r.kinds[k], k + ' is no longer placed (v321: the owner kept only the prang)');
    assert.ok(r.att.every(n => n === 4), 'four different attack frames each: ' + r.att);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
