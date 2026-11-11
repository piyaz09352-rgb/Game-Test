/* VAYRATHEN — tests/towermap223.test.js — (v223) the Vayra Tower's own halls: a floor is the round hall (no NPCs,
   gates or camp, its own pillars), the monsters stay inside it, walking onto the open stairs climbs to the next floor
   (arriving at the entrance), Auto takes the stairs, a new hall every 10 floors, and leaving the tower brings back the
   normal maps at their normal size. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('tower halls: own map, stairs, Auto, tiers, leaving', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const o = {}, adv = n => { for (let i = 0; i < n; i++){ advance(.05, false); if (!P.dead) S.hp = DER.maxhp; } };
      S.tut = {done:true, i:99}; S.lvl = 200; derive(); loadMap(0); twSt().best = 30; twStart(1); adv(70);
      o.hall = W === TWM_W && H === TWM_H && !NPCS.length && !GATES.length && !CAMP && (PROPS.length > 0 || (typeof TIMG !== 'undefined' && !!TIMG.floor)) && PROPS.every(p => ['twpillar', 'twbrazier', 'twcrystal', 'twbarrel', 'twcrate', 'twyaksha', 'twdeadtree'].includes(p.type));   // (v259) the zone's own pieces
      o.inside = mobs.filter(m => m.dg && !m.dead).every(m => twmIn(m.x, m.y)) && mobs.some(m => m.dg && !m.dead);
      { if (typeof TWSQ !== 'undefined') TWSQ.raw = true;   // (v260) compare with the region's own monster, not a squad pick
        const mp = MAPS[TW.theme], kind = mp.mobs.find(t => MOB[t] && !MOB[t].boss && !MOB[t].night), g = twMob(mp.boss, P.x, P.y - 200, 5), n = twMob(kind, P.x, P.y - 220, 5); if (typeof TWSQ !== 'undefined') TWSQ.raw = false;
        o.guard = g.maxhp >= n.maxhp * 10 && g.maxhp <= n.maxhp * 20; /* (v274) guardians ×5, monsters ×2: about 15× */ o.guardTxt = `${g.maxhp} vs ${n.maxhp}`; g.dead = n.dead = true; }   // (v224) a guardian is a fight, not a wall
      for (const m of mobs) if (m.dg) m.dead = true; adv(4); o.open = TWM.open && TW.phase === 'rest' && TW.f === 2;
      const st = twmStairs(); P.x = st.x; P.y = st.y + 10; adv(3); adv(20); const e = twmEntry();
      o.climbed = TW.f === 2 && TW.phase === 'fight' && Math.hypot(P.x - e.x, P.y - e.y) < 30;
      // Auto takes the stairs
      for (const m of mobs) if (m.dg) m.dead = true; adv(4); S.inv.mount1 = 1; setBot(true);   /* (v279) riding needs a mount: this hero has one, as before */  for (let i = 0; i < 200 && TW.phase === 'rest'; i++) adv(1); o.auto = TW.f === 3 && TW.phase === 'fight'; setBot(false);
      // (v259) a new zone at floor 21 (ป่าต้องสาป)
      twQuit('leave'); adv(5); twStart(21); adv(70); o.tier = TWM.tier === 1 && el('mapName').textContent.includes('21') && el('mapName').textContent.includes(L('ป่าต้องสาป', 'Cursed Forest'));
      twQuit('leave'); adv(10); o.back = !TW.active && W === MAP_WH(MAP_ID)[0] && H === MAP_WH(MAP_ID)[1] && MAPZ.x0 === 180 && (MAP_ID === 0 || GATES.length > 0);
      return o;
    });
    assert.ok(r.hall, 'a floor is the tower hall: no NPCs, gates or camp, only its own pieces');
    assert.ok(r.inside, 'the monsters stand inside the hall');
    assert.ok(r.guard, `a guardian has 10–20× an ordinary monster's HP (${r.guardTxt})`);
    assert.ok(r.open, 'a cleared floor opens the stairs');
    assert.ok(r.climbed, 'walking onto the stairs climbs to the next floor, arriving at the entrance');
    assert.ok(r.auto, 'Auto takes the stairs');
    assert.ok(r.tier, 'floor 21 is a new zone, named on the map label');
    assert.ok(r.back, 'leaving brings back the normal maps');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
