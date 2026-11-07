/* VAYRATHEN — tests/towerlore228.test.js — (v228) the tower legend: clearing floor 10 for the first time unlocks and
   shows chapter 1 (Chandra speaks, the stairs wait while you read), floor 100 has the Shadow of Vaira as its guardian,
   beating it unlocks the last chapter and pays 30 tower tokens, and the tower window lists the chapters. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('tower legend: chapters every 10 floors, the Shadow of Vaira on floor 100', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const o = {}, adv = n => { for (let i = 0; i < n; i++){ advance(.05, false); if (!P.dead) S.hp = DER.maxhp; if (DG3.boonOpen){ const b = document.querySelector('[data-boon]'); if (b) b.click(); } } };
      const clearTo = f => { for (let k = 0; k < 400 && TW.active && TW.f <= f; k++){ if (TW.phase === 'fight'){ for (const m of mobs) if (m.dg && !m.dead){ m.dead = true; m.hp = 0; } if (typeof TWF !== 'undefined' && TWF.f === TW.f){ if (TWF.kind === 'survive') TW.t = .5; if (TWF.kind === 'treasure') TWF.chests.forEach(c => { c.open = true; }); } }
        if (TW.phase === 'rest' && !(el('dialog') && !el('dialog').hidden)) TW.restT = Math.min(TW.restT, .1); adv(4); if (!el('dialog').hidden && TW.f === f + 1) break; } };
      S.tut = {done:true, i:99}; S.lvl = 300; derive(); loadMap(0); twSt().lore = {}; twStart(1); adv(60);
      clearTo(10); adv(4); const d = el('dialog'); o.ch1 = !!tlLore()[1] && !d.hidden && d.dataset.npc === 'tl_chandra'; const rt = TW.restT; adv(60); o.wait = TW.phase === 'rest' && TW.restT >= 2.5; closeDialog(); adv(2);
      twQuit('leave'); adv(5); twSt().best = 99; twStart(91); adv(60); clearTo(99);
      for (let k = 0; k < 200 && TW.phase !== 'fight'; k++){ TW.restT = Math.min(TW.restT, .1); adv(2); }
      const sh = mobs.find(m => m.twShadow && !m.dead); o.shadow = !!sh && TW.f === 100 && sh.def.name === 'เงาแห่งไวรา';
      const tok = twsTok().tok; if (sh){ for (const m of mobs) if (m.dg && !m.dead){ m.dead = true; m.hp = 0; } } adv(10);
      o.ch10 = !!tlLore()[10] && twsTok().tok - tok >= 30;
      closeDialog(); twQuit('leave'); adv(5); openWin('tower'); o.list = document.querySelectorAll('#pane-tower .tlrgrid [data-tlr]').length; closeWin('tower');
      return o;
    });
    assert.ok(r.ch1, 'clearing floor 10 unlocks chapter 1 and Chandra tells it');
    assert.ok(r.wait, 'the stairs wait while the chapter is open');
    assert.ok(r.shadow, 'floor 100 is guarded by the Shadow of Vaira');
    assert.ok(r.ch10, 'beating it unlocks the last chapter and pays 30 tower tokens');
    assert.strictEqual(r.list, 2, 'the tower window lists the chapters heard');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
