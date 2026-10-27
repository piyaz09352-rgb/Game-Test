/* VAYRATHEN — tests/couple.test.js — propose, accept, the wedding fee, the love buff near your partner, the card, divorce. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('couples: wedding, love buff, warp guard and divorce', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => { const out = {}; S.lvl = 20; S.bia = 50000; S.spouse = null; if (MAP_ID !== 0) loadMap(0);
      const sent = [], lob = [{kind:'viewer', peer:'L2', by:'uid2', presence:{n:'Mali', l:20, m:0, cp:0}}];
      NET.on = true; NET.uid = NET.uid || 'uid1'; const me = NET.uid; myPeer = () => 'L1';
      NET.room = {peers:() => lob, emit:(e, d) => { sent.push([e, d]); return Promise.resolve(); }, on(){}, presence(){}};
      const gh = {peer:'L2', by:'uid2', x:P.x + 40, y:P.y, q:{n:'Mali', l:20}};
      NET.ghosts = new Map([['L2', gh]]);
      cplPropose(gh); out.ask = sent.some(([e, d]) => e === 'cpl' && d.k === 'ask' && d.to === 'L2');
      onCpl({data:{k:'ok', to:'L1', n:'Mali'}, by:'uid2', peer:'L2'});
      out.wed = S.spouse && S.spouse.uid === 'uid2'; out.fee = S.bia === 30000; out.ring = S.inv.ring_love === 1;
      lob[0].presence.cp = me; CPL.t = 0; EV.emit('tick', .016); out.buff = !!P.buffs.cpl_love;
      const e0 = S.exp; gainExp(100, 0); out.expUp = S.exp - e0 >= 105;
      out.label = buffEffect(P.buffs.cpl_love).includes('EXP');
      playerMenu(gh); out.card = !!document.querySelector('#pcard .cplmine'); el('pcard').hidden = true;
      openWin('couple'); out.win = (el('pane-couple').textContent || '').includes('Mali');
      out.sameMap = (() => { const t0 = CPL.warpAt; cplWarp(); return CPL.warpAt === t0; })();
      // a second proposal from someone else is refused
      sent.length = 0; onCpl({data:{k:'ask', to:'L1', n:'Other'}, by:'uid3', peer:'L3'}); out.taken = sent.some(([e, d]) => d.k === 'no' && d.r === 'taken');
      // the partner divorced while away: their presence no longer names me
      lob[0].presence.cp = 0; CPL.t = 0; EV.emit('tick', .016); out.div = S.spouse === null && !S.inv.ring_love;
      NET.room = null; NET.on = false; NET.ghosts = new Map(); return out; });
    for (const k of ['ask', 'wed', 'fee', 'ring', 'buff', 'expUp', 'label', 'card', 'win', 'sameMap', 'taken', 'div']) assert.ok(r[k], k);
    const ft = await page.evaluate(() => new Promise(res => { const t = []; let l = performance.now(), n = 0; const f = now => { t.push(now - l); l = now; if (++n < 60) requestAnimationFrame(f); else res(Math.max(...t.slice(5))); }; requestAnimationFrame(f); }));
    assert.ok(ft < 250, `no long frame (${ft.toFixed(0)} ms)`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
