/* VAYRATHEN — tests/autoquest220.test.js — (v220) Auto quest plays Khao Hom's first chapter from start to finish by
   itself (accept, hunt the lanterns by day, pick up the spots, pick up the wicks it needs, hand in) and then heads for
   the gate to the next chapter; the quest window's switch turns it on; it stops when the next chapter needs a higher level. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('auto quest: a whole chapter by itself, then on to the next map', { skip, timeout: 300000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const o = {}, adv = n => { for (let i = 0; i < n; i++){ advance(.05, false); if (!P.dead) S.hp = DER.maxhp; } };
      S.tut = {done:true, i:99}; S.job = 'blade'; S.lvl = 30; S.stats = {str:60, agi:40, vit:30, int:1, dex:30, luk:1}; derive(); S.hp = DER.maxhp;
      loadMap(0); adv(3); qState().main = 999; S.ms = {done:{}};
      openWin('quest'); const b = document.querySelector('#pane-quest [data-aq="1"]'); o.btn = !!b; if (b) b.click(); closeWin('quest');
      o.on = !!S.aq && BOT.on;
      let maxStep = 0;
      for (let s = 0; s < 1500 && !o.next; s++){ adv(20); const c = msS().cur; if (c && c.map === 0) maxStep = Math.max(maxStep, c.step);
        if (msS().done[0] && (MAP_ID === 1 || (AQ.plan && AQ.plan.map === 1 && P.tx != null))) o.next = true; if (!S.aq) break; }
      o.done0 = !!msS().done[0]; o.maxStep = maxStep; o.chip = (document.getElementById('botChip') || {}).title || '';
      // a chapter beyond your level: Auto stops and says why
      S.ms = {done:{}}; MS_ARCS[0].maps.forEach(m => { if (m !== 62) S.ms.done[m] = 1; }); S.lvl = 20; loadMap(0); S.aq = true; adv(20); o.stopLv = !S.aq;
      return o;
    });
    assert.ok(r.btn && r.on, 'the quest window switch turns Auto quest (and Auto) on');
    assert.strictEqual(r.maxStep, 2, 'it went through all three steps');
    assert.ok(r.done0, 'it handed the whole chapter in by itself');
    assert.ok(r.next, 'then it set off for the next chapter on the next map');
    assert.ok(r.stopLv, 'it stops when the next chapter needs a higher level');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
