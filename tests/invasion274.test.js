/* VAYRATHEN — tests/invasion274.test.js — (v274) the invasion: 300 invaders in 15 minutes, a much bigger win (coins
   5–15, a Rare-or-better gear chest, EXP/JOB +30% for 30 minutes, a win counted for the guardian titles and wings),
   and a share of Bia and coins when time runs out. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('invasion: 300 to beat, the win pays coins, a chest and an EXP buff; time-up pays a share', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const win = await page.evaluate(async () => {
      const adv = s => { for (let i = 0; i < s * 10; i++) advance(.1, false); };
      S.lvl = 50; derive(); S.hp = DER.maxhp; const key = 'test-win'; INV.forced = {key, until:Date.now() + 15 * 6e4};
      const id = invMap(key); warpTo(id); adv(2);
      const goal = invGoal(), alive0 = mobs.filter(m => m.inv && !m.dead).length;
      const c0 = ACC.coins || 0, inv0 = Object.keys(S.inv).length, w0 = S.invWins | 0;
      INV.tot = goal - 1; INV.my = 120; const m = mobs.find(q => q.inv && !q.dead && !q.invBoss); if (m) killMob(m); adv(2);
      const boss = !!(INV.boss && !INV.boss.dead); if (INV.boss) killMob(INV.boss); adv(1);
      const r = {goal, alive0, boss, coins:(ACC.coins || 0) - c0, newItems:Object.keys(S.inv).length - inv0, buff:!!(P.buffs.invexp && P.buffs.invexp.t > 1700), wins:(S.invWins | 0) - w0, LEN:INV_LEN};
      INV.forced = null; adv(1); return r; });
    assert.strictEqual(win.goal, 300, '300 invaders'); assert.strictEqual(win.LEN, 15, '15 minutes');
    assert.ok(win.alive0 >= 1, 'invaders come'); assert.ok(win.boss, 'the warlord comes at 300');
    assert.ok(win.coins >= 5 && win.coins <= 25, 'coins 5–15 (+ top-helper bonus): ' + win.coins);
    assert.ok(win.newItems >= 1, 'a gear chest'); assert.ok(win.buff, 'EXP/JOB +30% for 30 minutes'); assert.strictEqual(win.wins, 1, 'a win is counted');
    const part = await page.evaluate(async () => {
      const adv = s => { for (let i = 0; i < s * 10; i++) advance(.1, false); };
      const key = 'test-part'; INV.forced = {key, until:Date.now() + 15 * 6e4}; warpTo(invMap(key)); adv(2);
      INV.tot = 150; INV.my = 40; const c0 = ACC.coins || 0, z0 = S.bia, w0 = S.invWins | 0;
      INV.forced = null; adv(1);   // the window ends
      return {coins:(ACC.coins || 0) - c0, bia:S.bia - z0, wins:(S.invWins | 0) - w0, left:mobs.filter(m => m.inv && !m.dead).length}; });
    assert.ok(part.coins >= 1 && part.coins < 5, 'a share of coins: ' + part.coins); assert.ok(part.bia > 0, 'a share of Bia');
    assert.strictEqual(part.wins, 0, 'no win counted'); assert.strictEqual(part.left, 0, 'the army withdraws');
    // the titles and the exclusive wings exist and are not sold
    const t = await page.evaluate(() => ({a:['inv_t1', 'inv_t2', 'inv_t3'].every(id => ACH_BY[id]), w:!!WINGS.inv_wing && !WINGS.inv_wing.price && !!WINGS.inv_wing2 && !WINGS.inv_wing2.price}));
    assert.ok(t.a && t.w, 'guardian titles and invasion-only wings');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
