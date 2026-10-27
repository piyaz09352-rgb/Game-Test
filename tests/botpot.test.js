/* VAYRATHEN — tests/botpot.test.js — Auto drinks HP and SP potions, set in the Auto window (not in Settings) */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('Auto window has HP and SP potion settings; Auto drinks both; Settings has no potion slider', { skip, timeout: 90000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      openWin('settings'); renderSettings(); const inSet = !!document.getElementById('set-botHp');
      openWin('auto'); renderAuto(); const pane = document.getElementById('pane-auto');
      const ui = {hp:!!pane.querySelector('[data-aset="potHpOn"]'), sp:!!pane.querySelector('[data-aset="potSpOn"]'), hpR:!!pane.querySelector('[data-arng="potHp"]'), spR:!!pane.querySelector('[data-arng="potSp"]')};
      closeWin('auto'); closeWin('settings');
      S.inv.redpot = 5; S.inv.bluepot = 5; S.sp = 1; S.hp = DER.maxhp; P.itemCd = 0;
      BOT.on = true; BOT.pause = 0; BOT.think = 0; updBot(.3); const sp1 = S.inv.bluepot;
      S.hp = 1; P.itemCd = 0; BOT.think = 0; updBot(.3); const hp1 = S.inv.redpot;
      S.bot.potSpOn = false; S.sp = 1; P.itemCd = 0; BOT.think = 0; updBot(.3); const sp2 = S.inv.bluepot;
      BOT.on = false;
      return {inSet, ui, sp1, hp1, sp2};
    });
    assert.strictEqual(r.inSet, false, 'no potion slider in Settings');
    assert.deepStrictEqual(r.ui, {hp:true, sp:true, hpR:true, spR:true}, 'HP and SP potion switches and thresholds in the Auto window');
    assert.strictEqual(r.sp1, 4, 'Auto drank an SP potion');
    assert.strictEqual(r.hp1, 4, 'Auto drank an HP potion');
    assert.strictEqual(r.sp2, 4, 'switched off: no SP potion');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('Auto avoids bosses: no boss target, runs from a close boss, can be switched off', { skip, timeout: 90000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      S.lvl = 40; derive(); S.hp = DER.maxhp; S.sp = DER.maxsp; loadMap(1);
      const bossType = Object.keys(MOB).find(k => MOB[k].boss);
      for (const m of mobs) m.dead = true;
      const b = spawnMob(bossType, P.x + 120, P.y); b.aggro = false;
      openWin('auto'); renderAuto(); const ui = !!document.querySelector('#pane-auto [data-aset="avoidBoss"]'); closeWin('auto');
      BOT.on = true; BOT.pause = 0; BOT.think = 0; P.target = null; updBot(.3);
      const flee = {state:BOT.state, target:P.target, away:P.tx != null && P.tx < P.x};
      b.aggro = true; P.x = b.x + 150; BOT.think = 0; updBot(.3); const safe = botSafeSpot();
      const run = {state:BOT.state, toSafe:!!safe && P.tx === safe.x && P.ty === safe.y};
      b.aggro = false; P.x = b.x + 120;
      S.bot.avoidBoss = false; BOT.think = 0; P.target = null; const pick = pickTarget();
      BOT.on = false;
      return {ui, flee, run, pickBoss:pick === b, def:true};
    });
    assert.ok(r.ui, 'the switch is in the Auto window');
    assert.strictEqual(r.flee.state, 'flee', 'Auto runs from the boss');
    assert.strictEqual(r.flee.target, null, 'it does not target the boss');
    assert.ok(r.flee.away, 'it heads away from the boss');
    assert.deepStrictEqual(r.run, {state:'flee', toSafe:true}, 'a boss hunting the hero: Auto runs to the safe zone');
    assert.ok(r.pickBoss, 'switched off: the boss can be a target again');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
