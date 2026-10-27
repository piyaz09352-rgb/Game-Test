/* VAYRATHEN — tests/lfgmk.test.js — quick match picks the closest party, dungeon party EXP, market sort and price guide. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('quick match, dungeon party EXP, market sort and price guide', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => { const out = {}; S.lvl = 40;
      // quick match: two parties recruiting, the closer level that wants my role is asked
      const sent = []; NET.on = true; NET.party = null;
      NET.room = {peers:() => [{kind:'viewer', peer:'a', presence:{n:'A', l:80, pt:'pa', pn:'Far', rc:'dps,tank,heal', pz:2}}, {kind:'viewer', peer:'b', presence:{n:'B', l:42, pt:'pb', pn:'Near', rc:'dps,tank,heal', pz:3}}],
        emit:(e, d) => { sent.push([e, d]); return Promise.resolve(); }, on(){} };
      LFQ.t = 0; lfgQuick(); out.asked = sent.length && sent[0][1].k === 'joinreq' && sent[0][1].to === 'b';
      NET.room.peers = () => []; LFQ.t = 0; S.lfg = 0; lfgQuick(); out.listed = S.lfg === 1;
      out.btn = lfgHTML().includes('data-lfquick');
      NET.room = null; NET.on = false;
      // dungeon party EXP
      S.lvl = 40; let e0 = S.exp; gainExp(1000, 0); const solo = S.exp - e0; S.lvl = 40; e0 = S.exp; DG.active = true; DG.pc = 3; gainExp(1000, 0); out.exp = (S.exp - e0) / solo; DG.active = false; DG.pc = 1;
      // market sort and guide
      const k = Object.keys(ITEMS).find(x => ITEMS[x].kind !== 'key' && ITEMS[x].sell);
      MK.rows = [{id:'1', s:'x', sn:'S1', i:k, n:2, p:500, at:3}, {id:'2', s:'y', sn:'S2', i:k, n:1, p:100, at:2}, {id:'3', s:'z', sn:'S3', i:k, n:1, p:900, at:1}];
      NET.db = NET.db || {}; NET.uid = NET.uid || 'me'; MK.unsub = () => {}; MK.mineT = Date.now(); const meU = NET.uid; openWin('market');
      MK.tab = 'buy'; MK.sort = 'low'; WIN_RENDER.market(); out.low = [...document.querySelectorAll('#pane-market [data-mkbuy]')].map(b => b.dataset.mkbuy).join('');
      out.rowsKept = MK.rows.map(r => r.id).join('');
      S.inv[k] = 3; MK.tab = 'sell'; MK.sel = k; WIN_RENDER.market(); out.guide = (document.querySelector('#pane-market .mkguide') || {}).textContent || '';
      return out; });
    assert.ok(r.asked, 'asks the closest-level party'); assert.ok(r.listed, 'with nobody to match you are listed'); assert.ok(r.btn);
    assert.ok(Math.abs(r.exp - 1.2) < .01, 'party of 3 in a dungeon: +20% EXP');
    assert.strictEqual(r.low, '213', 'cheapest per piece first'); assert.strictEqual(r.rowsKept, '123', 'listings themselves untouched');
    assert.ok(/100/.test(r.guide), 'price guide shows the cheapest per piece');
    // no stutter: frames stay smooth with the market open
    const ft = await page.evaluate(() => new Promise(res => { const t = []; let l = performance.now(), n = 0; const f = now => { t.push(now - l); l = now; if (++n < 60) requestAnimationFrame(f); else res(Math.max(...t.slice(5))); }; requestAnimationFrame(f); }));
    assert.ok(ft < 250, `no long frame (${ft.toFixed(0)} ms)`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
