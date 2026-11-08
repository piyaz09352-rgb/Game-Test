// (v272) every connection works: each map's gates can be walked to from every arrival and from the start point, every gate
// has a way back, nothing stands on an arrival spot, and every NPC in Aren and the four towns can be walked up to.
// (The tower's door was walled off by an invisible edge for several versions; this keeps that kind of thing from coming back.)
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('connections: gates, arrivals, ways back, NPCs, the tower door', { skip, timeout: 300000 }, async () => {
  const { page, errors, close } = await openGame({ width:1024, height:640 });
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { const bad = [];
      for (let id = 0; id < MAPS.length; id++){ if (!MAPS[id]) continue; loadMap(id); await new Promise(r => setTimeout(r, 20)); const G = GATES.slice();
        for (const gt of G){ if (!MAPS[gt.to]) bad.push(`${id} ${gt.side}: leads nowhere`); else if (!Object.values(MAPS[gt.to].links || {}).includes(id)) bad.push(`${id} ${gt.side}: no way back from ${gt.to}`);
          const a = inward(gt, 110); if (!walkable(a.x, a.y, 12)) bad.push(`${id} ${gt.side}: arrival blocked`);
          for (const o of G) if (o !== gt && !findPath(a.x, a.y, o.x, o.y)) bad.push(`${id} ${gt.side}->${o.side}: no path`); } }
      for (const id of [0, ...TOWNS.map(t => t.id)]){ loadMap(id); await new Promise(r => setTimeout(r, 700)); const st = id === 0 ? VSPAWN : inward(GATES[0], 110);
        if (!walkable(st.x, st.y, 12)) bad.push(`${id}: start blocked`);
        for (const n of NPCS){ const spots = [[0, 30], [0, 40], [24, 26], [-24, 26], [0, -30]].map(([dx, dy]) => ({x:n.x + dx, y:n.y + dy})).filter(q => walkable(q.x, q.y, 12));
          if (!spots.some(q => findPath(st.x, st.y, q.x, q.y))) bad.push(`${id} ${n.id}: cannot walk to it`); } }
      // the tower's door: the hero walks from the middle of the hall up to it and climbs
      S.lvl = 300; derive(); S.tower = {best:100, runs:1}; loadMap(0); twStart(3); for (let i = 0; i < 40 && TW.phase !== 'fight'; i++) await new Promise(r => setTimeout(r, 100));
      for (let k = 0; k < 400 && TW.phase === 'fight'; k++){ for (const m of mobs) if (m.tw && !m.dead){ m.hp = 0; killMob(m); } advance(.05, false); S.hp = DER.maxhp; }
      for (let i = 0; i < 60 && !TWM.open; i++) advance(.05, false);
      const c = twmC(), s = twmStairs(); P.x = c.x; P.y = c.y + 100; P.tx = s.x; P.ty = s.y; let t = 0; while (TWM.open && t < 8){ advance(.05, false); t += .05; }
      if (TWM.open || t >= 8) bad.push('tower: could not walk to the door and climb');
      return bad; });
    assert.deepStrictEqual(r, [], 'every connection works');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
