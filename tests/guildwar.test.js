/* VAYRATHEN — tests/guildwar.test.js — guild war: war skills by class line, enemy hits, falling and waking up,
   the seal / supply-cut effects and the leader's guild skills. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('guild war: skills, hits, falling, seal, cut and guild skills', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { siegeLive = () => true; myPeer = () => 'me'; loadMap(SIEGE_MAP); });
    await page.waitForTimeout(900);
    const r = await page.evaluate(() => {
      const out = {}; S.guild = {id:'gmine', name:'Mine', leader:true};
      S.job = 'novice'; out.none = gwSkill();
      // every class line's 3rd job gets its own war skill, and each one casts on a monster without trouble
      const t3 = Object.keys(JOBS).filter(j => JOBS[j].tier === 3); out.lines = {};
      for (const j of t3){ S.job = j; S.lvl = 90; derive(); const id = gwSkill(); out.lines[j] = id;
        const m = mobs.find(x => !x.dead && !x.def.boss); if (m){ m.hp = m.maxhp = 1e7; P.x = m.x - 40; P.y = m.y; P.target = m; }
        GW.cd = 0; S.sp = DER.maxsp; gwCast(); }
      // shield wall
      S.job = t3.find(j => gwSkill.call(null) === 'wall' || (S.job = j, gwSkill() === 'wall')); derive(); GW.cd = 0; S.sp = DER.maxsp; delete P.buffs.gw_wall; gwCast(); out.wall = P.buffs.gw_wall && P.buffs.gw_wall.dmgRed;
      out.bar = !el('gwBar').hidden;
      // an enemy's hit that would fell me: back at the warp stone with 40% HP and protection
      delete P.buffs.gw_safe; S.hp = 10; onGwp({data:{k:'hit', to:'me', d:999999, g:'Other', m:MAP_ID, n:'Foe'}, peer:'p2'});
      out.fell = Math.abs(S.hp - Math.round(DER.maxhp * .4)) <= 1 && !!P.buffs.gw_safe;
      // a hit from my own guild does nothing
      delete P.buffs.gw_safe; const h0 = S.hp; onGwp({data:{k:'hit', to:'me', d:50, g:'Mine', m:MAP_ID, n:'Mate'}, peer:'p3'}); out.friendly = S.hp === h0;
      // sealed: no skills · cut: no potions
      onGwp({data:{k:'seal', x:P.x, y:P.y, r:90, t:3, g:'Other', m:MAP_ID, n:'Foe'}, peer:'p2'}); out.seal = !!P.buffs.gw_seal;
      onGwp({data:{k:'cut', to:'me', t:5, g:'Other', m:MAP_ID, n:'Foe'}, peer:'p2'}); S.inv.redpot = 5; S.hp = 5; const pot = Object.keys(ITEMS).find(k => ITEMS[k].heal); S.inv[pot] = 5; useItem(pot); out.cut = S.inv[pot] === 5;
      // leader: war banner
      GW.gcd = {}; gwGuild('banner'); out.banner = !!P.buffs.gw_banner && P.buffs.gw_banner.atkPct === .15;
      out.label = buffEffect(P.buffs.gw_banner).length > 0;
      return out; });
    assert.strictEqual(r.none, null, 'no war skill before the 3rd job');
    const ids = Object.values(r.lines); assert.ok(ids.length >= 12 && ids.every(Boolean), 'every 3rd job has a war skill');   // (v166) the five new lines borrow one each
    assert.strictEqual(new Set(ids).size, 7, 'seven different war skills, one per line');
    assert.strictEqual(r.wall, .5); assert.ok(r.bar, 'the war bar shows in the siege');
    assert.ok(r.fell, 'a felled hero wakes at the warp stone with 40% HP'); assert.ok(r.friendly, 'no friendly fire');
    assert.ok(r.seal && r.cut, 'seal and supply cut work'); assert.ok(r.banner && r.label, 'the leader raises the War Banner');
    // leaving the siege hides the bar
    await page.evaluate(() => { siegeLive = () => false; loadMap(0); }); await page.waitForTimeout(1200);
    assert.ok(await page.evaluate(() => !el('gwBar') || el('gwBar').hidden));
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
