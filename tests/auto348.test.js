/* VAYRATHEN — tests/auto348.test.js — (v348) Auto looks after a newcomer
   · in Aren with no potions it walks to Auntie Buakham and buys the best potion for its level (at most 30% of its money,
     up to 30 bottles); with the setting off it does not
   · on every map it keeps away from monsters that attack on sight and are more than 3 levels above it: it does not pick
     one, nor a monster right beside one (a fight there pulls it in); one far from it is fine
   · a dangerous monster that is already attacking is fought back (threats first) */
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed';

test('Auto buys potions in town and keeps away from monsters far above it', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame({ width: 844, height: 390 });
  try {
    await enterWorld(page, 'Auto', 'auto_user_348'); await page.waitForTimeout(800);
    const r = await page.evaluate(async () => { S.tut = { done: true, i: 99 }; while (S.lvl < 8) gainExp(nextBase(S.lvl), 0); derive(); S.hp = DER.maxhp;
      const wait = async (ok, ms) => { for (let t = 0; t < ms / 250 && !ok(); t++) await new Promise(r => setTimeout(r, 250)); };
      const out = {boot: !!document.getElementById('boot')};   /* (v348) the loading screen is gone once the game is up */
      // the setting off: no shopping
      for (const id of ['redpot', 'orangepot']) delete S.inv[id]; S.bia = 20000; loadMap(0); await new Promise(r => setTimeout(r, 1200));
      botSet().autoBuy = false; setBot(true); await new Promise(r => setTimeout(r, 4000)); out.offPots = botPotCount(); setBot(false);
      // on: it walks to the shop and buys
      botSet().autoBuy = true; BOT.boughtT = -99; setBot(true); await wait(() => botPotCount() >= 10, 25000); setBot(false);
      out.pots = botPotCount(); out.spent = 20000 - S.bia; out.best = botPotBest();
      // the danger rule, in a hunting field
      loadMap(FIELDS306.id); await new Promise(r => setTimeout(r, 1500)); for (const m of mobs){ m.dead = true; m.deadT = 99; } await new Promise(r => setTimeout(r, 200));
      const z = f306Zone(); P.x = (z.x0 + z.x1) / 2; P.y = (z.y0 + z.y1) / 2; while (!walkable(P.x, P.y, 18)) P.y += 20;   /* inside its own part of the fields */
      const L = spawnMob('lantern', P.x + 200, P.y, { zone: MAPZ }), near = spawnMob('dewblob', P.x + 230, P.y + 10, { zone: MAPZ }), far = spawnMob('dewblob', P.x - 150, P.y, { zone: MAPZ });
      for (const m of [L, near, far]) m.aggro = false;
      out.danger = botDanger(L); out.shunNear = botShun(near); out.shunFar = botShun(far); out.pick = pickTarget() === far ? 'far' : (pickTarget() || {}).type || null;
      out.roamNearDanger = botNearDanger(L.x + 50, L.y); out.roamFar = botNearDanger(far.x, far.y);
      // once it attacks, it is fought back
      L.aggro = true; L.x = P.x + 40; out.threat = threats().includes(L);
      return out; });
    assert.ok(!r.boot, 'the loading screen is gone once the game is up');
    assert.strictEqual(r.offPots, 0, 'with «buy potions in town» off, Auto does not buy');
    assert.ok(r.pots >= 10 && r.pots <= 30, 'Auto bought potions in town: ' + r.pots);
    assert.ok(r.spent > 0 && r.spent <= 20000 * .3, 'with at most 30% of its money: ' + r.spent);
    assert.strictEqual(r.best, 'redpot', 'the best potion for Lv 8 is the red one');
    assert.ok(r.danger, 'a Lv 13 lantern is dangerous for a Lv 8 hero');
    assert.ok(r.shunNear && !r.shunFar, 'a monster beside it is left alone, one far from it is not');
    assert.strictEqual(r.pick, 'far', 'Auto picks the safe one');
    assert.ok(r.roamNearDanger && !r.roamFar, 'Auto does not roam towards it');
    assert.ok(r.threat, 'one that attacks is fought back');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
