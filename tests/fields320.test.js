/* VAYRATHEN — tests/fields320.test.js — (v320) the Suwannin Fields keep the old order of danger (weak monsters by the gate
   from Aren, boars far east, lanterns only at night far east) and a new hero on Auto does not keep dying there; Auto picks
   monsters near its own level and counts a pack leader 5 levels higher */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('starter fields: zones by danger; a new hero on Auto survives', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Newbie', 'newbie');
    const r = await page.evaluate(async () => {
      loadMap(FIELDS306.id); await new Promise(res => setTimeout(res, 200));
      const slots = {}; for (const s of spawnSlots){ const k = s.type; slots[k] = slots[k] || {minX:1e9, maxX:0, night:s.night}; slots[k].minX = Math.min(slots[k].minX, s.zone.x0); slots[k].maxX = Math.max(slots[k].maxX, s.zone.x1); }
      // a fresh hero, its points spent as a player would, on Auto for 150 s by the west gate
      const g = GATES.find(x => x.to === 0); P.x = g.x + 200; P.y = g.y; S.hp = DER.maxhp; let deaths = 0, kills = 0; const k = () => kills++; EV.on('kill', k);
      setBot(true);
      for (let i = 0; i < 3000; i++){ advance(.05, false); if (!BOT.on) setBot(true);
        if (i % 100 === 0 && S.statPts > 0){ for (let n = 0; n < 200 && S.statPts > 0; n++){ const s = S.stats.str <= S.stats.vit * 1.5 ? 'str' : 'vit'; if (statCost(S.stats[s]) > S.statPts) break; S.statPts -= statCost(S.stats[s]); S.stats[s]++; } derive(); }
        if (P.dead){ deaths++; dthTown(); setBot(true); if (MAP_ID !== FIELDS306.id){ loadMap(FIELDS306.id); P.x = g.x + 200; P.y = g.y; } } }
      setBot(false);
      // Auto's choice with a weak and a strong monster about as close
      const weak = spawnMob('dewblob', P.x + 90, P.y, {zone:MAPZ}), strong = spawnMob('lantern', P.x + 80, P.y + 10, {zone:MAPZ}); strong.aggro = false; S.lvl = 2;
      const pick = pickTarget(); weak.dead = strong.dead = true;
      return {slots, deaths, kills, lv:S.lvl, pick:pick && pick.type}; });
    assert.ok(r.slots.dewblob.maxX < 2000 && r.slots.kobna.minX < 2000, 'the weakest by the west gate: ' + JSON.stringify(r.slots.dewblob));
    assert.ok(r.slots.boar.minX > 3000, 'boars far east: ' + JSON.stringify(r.slots.boar));
    assert.ok(r.slots.lantern.minX > 3000 && r.slots.lantern.night, 'lanterns only at night, far east: ' + JSON.stringify(r.slots.lantern));
    assert.ok(r.deaths <= 1, 'a new hero on Auto survives the fields: ' + r.deaths + ' deaths, ' + r.kills + ' kills');
    assert.ok(r.kills >= 15, 'and hunts: ' + r.kills);
    assert.strictEqual(r.pick, 'dewblob', 'Auto picks the monster near its own level');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
