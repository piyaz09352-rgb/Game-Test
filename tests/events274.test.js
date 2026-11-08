/* VAYRATHEN — tests/events274.test.js — (v274) the Treasure Goblin (runs, never fights, every hit drops Bia, the kill
   bursts the sack, gone after its window) and the golden hour (EXP and drops ×2). */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('treasure goblin and golden hour', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const adv = s => { for (let i = 0; i < s * 10; i++) advance(.1, false); };
      S.lvl = 60; derive(); S.hp = DER.maxhp;
      const key = 'test-gob'; GOB.forced = {key, until:Date.now() + 2 * 6e4}; const id = gobMap(key); warpTo(id); adv(1.5);
      const g = mobs.find(m => m.type === 'tgoblin' && !m.dead), out = {spawned:!!g, bar:!!document.querySelector('#evBar274 .gob')};
      if (!g) return out;
      const d0 = Math.hypot(g.x - P.x, g.y - P.y); P.x = g.x - 60; P.y = g.y; adv(2); out.ran = Math.hypot(g.x - P.x, g.y - P.y) > 90;
      const hp0 = S.hp; out.neverHits = true;
      const z0 = S.bia; GOB.hitT = 0; applyDamage(g, {dmg:10, crit:false}); out.hitBia = S.bia - z0;
      for (let i = 0; i < 40; i++){ adv(.1); if (S.hp < hp0) out.neverHits = false; }
      const z1 = S.bia, c1 = ACC.coins || 0; g.hp = 1; applyDamage(g, {dmg:5, crit:false}); if (!g.dead) killMob(g); adv(.5);
      out.killBia = S.bia - z1; out.killCoins = (ACC.coins || 0) - c1; out.done = !!(S.gobDone && S.gobDone[key]);
      GOB.forced = null; adv(1); out.gone = !mobs.some(m => m.type === 'tgoblin' && !m.dead);
      // golden hour
      const e = () => { const e0 = S.exp; gainExp(1000, 0); const v = S.exp - e0; S.exp = e0; return v; };
      const plain = e(); GOLD.forced = {until:Date.now() + 6e4}; adv(.3); const gold = e(); out.gold = gold / plain; out.goldBar = !!document.querySelector('#evBar274 .gold'); GOLD.forced = null;
      return out; });
    assert.ok(r.spawned && r.bar, 'the goblin turns up and the strip says where');
    assert.ok(r.ran, 'it runs from you'); assert.ok(r.neverHits, 'it never fights back');
    assert.ok(r.hitBia > 0, 'a hit knocks Bia out: ' + r.hitBia); assert.ok(r.killBia > r.hitBia * 5 && r.killCoins >= 2 && r.done, 'the kill bursts the sack: ' + JSON.stringify(r));
    assert.ok(r.gone, 'gone when its window ends');
    assert.ok(r.gold > 1.9 && r.gold < 2.1 && r.goldBar, 'golden hour: EXP ×2 ' + r.gold);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
