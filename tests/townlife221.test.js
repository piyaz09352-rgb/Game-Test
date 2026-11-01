/* VAYRATHEN — tests/townlife221.test.js — (v221) townsfolk walk the towns and Aren (most go home after dark), the post
   clerk hands out a parcel, the arrow follows it, the clerk at the other end pays for it; the market sells gear; the
   minimap draws its gate levels. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('town life: townsfolk, post riders, market gear, minimap levels', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const o = {}, adv = n => { for (let i = 0; i < n; i++) advance(.05, false); };
      S.tut = {done:true, i:99}; S.lvl = 60; derive(); const town = TOWNS[0].id;
      loadMap(town); adv(60); o.folk = TL.folk.length; const x0 = TL.folk.map(f => f.x + ',' + f.y).join(); adv(100); o.walked = TL.folk.map(f => f.x + ',' + f.y).join() !== x0;
      window.GM_TOFS = ((22 - thHour()) + 24) % 24; adv(5); o.nightOut = TL.folk.filter(f => f.out).length; window.GM_TOFS = 0; adv(5);
      for (let i = 0; i < 3; i++) render(); drawMini();
      // the post: take a parcel to Aren
      const n = NPCS.find(x => x.id === 'tl_post'); o.clerk = !!n && npcMark(n) === '!'; P.x = n.x; P.y = n.y + 40; openNpc(n);
      const b = document.querySelector('#dialog [data-tlgo="0"]'); o.offer = !!b; b.click(); closeDialog();
      const j = tlS().job; o.job = !!j && j.to === 0 && (S.inv[j.item] || 0) === 1; const g = qgGoal(); o.guide = !!g && g.map === 0 && g.npc === 'tl_post';
      const bia = S.bia, deliveries = stc().deliveries || 0;
      loadMap(0); adv(5); const n0 = NPCS.find(x => x.id === 'tl_post'); o.mark = npcMark(n0) === '?'; P.x = n0.x; P.y = n0.y + 40; openNpc(n0); closeDialog();
      o.paid = S.bia > bia && (stc().deliveries || 0) === deliveries + 1 && !tlS().job && !(S.inv[j.item] > 0); o.aren = TL.folk.length;
      // the market buys gear
      const t = NPCS.find(x => x.id === 'trader'); openNpc(t); o.market = !!document.querySelector('#dialog [data-fgopen="sell"][data-fgonly="sell"]'); closeDialog();
      return o;
    });
    assert.ok(r.folk >= 8 && r.walked, 'townsfolk walk the town');
    assert.ok(r.nightOut < r.folk, 'most go home after dark');
    assert.ok(r.clerk && r.offer && r.job, 'the post clerk hands out a parcel');
    assert.ok(r.guide && r.mark, 'the arrow and the clerk mark follow the parcel');
    assert.ok(r.paid, 'the clerk at the other end pays for it');
    assert.ok(r.aren >= 6, 'Aren has townsfolk too');
    assert.ok(r.market, 'the market has a sell-gear button');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
