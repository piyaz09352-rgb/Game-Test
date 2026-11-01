/* VAYRATHEN — tests/sizepot231.test.js — (v231) the All-size Strike Potion: sold at the potion shop (Aren and a
   crossroads town), drinking it gives the 10-minute buff, and while it works a sword hits small and large monsters
   at 100% instead of 75% (medium unchanged); it never goes above 100%. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('all-size strike potion: shop, buff, sword hits every size at 100%', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const o = {}; S.tut = {done:true, i:99}; S.job = 'blade'; S.lvl = 60; S.stats = {str:80, agi:40, vit:30, int:1, dex:40, luk:1}; derive(); S.bia = 1e6;
      loadMap(0); const shop = NPCS.find(n => n.id === 'shop'); P.x = shop.x; P.y = shop.y + 40; openNpc(shop);
      o.aren = !!document.querySelector('#dialog [data-buy="sizepot"], #dialog [data-qty="sizepot"], #dialog [data-id="sizepot"]') || el('dialog').innerHTML.includes('sizepot'); closeDialog();
      loadMap(TOWNS[1].id); for (let i = 0; i < 3; i++) advance(.05, false); const ts = NPCS.find(n => n.id === 'shop'); openNpc(ts); o.town = el('dialog').innerHTML.includes('sizepot'); closeDialog();
      // the average hit (no crits, never a miss) against one monster of each size, without and with the potion
      const sz = s => Object.keys(MOB).find(k => MOB[k].size === s && !MOB[k].boss && MOB[k].lvl > 20 && MOB[k].lvl < 60);
      const mob = s => { const m = spawnMob(sz(s), P.x + 400, P.y); m.def = {...m.def, def:0}; return m; };
      const avg = m => { const keep = Math.random; let s = 0; DER.crit = 0; DER.hit = 9999; for (let i = 0; i < 300; i++){ const d = physDamage(m, 1); s += d.dmg || 0; } return s / 300; };
      const ms = {s:mob('s'), m:mob('m'), l:mob('l')}, before = {}, after = {};
      for (const k in ms) before[k] = avg(ms[k]);
      S.inv.sizepot = 1; useItem('sizepot'); o.buff = !!P.buffs.sizeall && Math.round(P.buffs.sizeall.t) === 600 && !S.inv.sizepot;
      derive(); for (const k in ms) after[k] = avg(ms[k]);
      o.ratio = {s:after.s / before.s, m:after.m / before.m, l:after.l / before.l};
      return o;
    });
    assert.ok(r.aren && r.town, 'sold at the potion shop in Aren and in a crossroads town');
    assert.ok(r.buff, 'drinking it gives the 10-minute buff');
    assert.ok(Math.abs(r.ratio.s - 1 / .75) < .06 && Math.abs(r.ratio.l - 1 / .75) < .06, `a sword hits small and large monsters at 100% (×${r.ratio.s.toFixed(2)} / ×${r.ratio.l.toFixed(2)})`);
    assert.ok(Math.abs(r.ratio.m - 1) < .05, `medium stays at 100%, never above (×${r.ratio.m.toFixed(2)})`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
