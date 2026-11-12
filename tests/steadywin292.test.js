/* VAYRATHEN — tests/steadywin292.test.js — (v292) windows that do not jump when you press something
   · status: pressing + shows the confirm bar without a scroll bar and without moving the rows
   · bag: picking an item opens its info without shrinking the grid (the cells stay put)
   · skill tree: its scale stays the same from one press to the next inside a tab (no twitch) */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

for (const [w, h] of [[1366, 768], [844, 390]]) test(`windows stay put at ${w}×${h}`, { skip, timeout: 150000 }, async () => {
  const { page, errors, close } = await openGame({ width: w, height: h });
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const wait = ms => new Promise(res => setTimeout(res, ms)), out = {};
      const scrolls = id => [...document.getElementById(id).querySelectorAll('*'), document.getElementById(id)].filter(e => { const cs = getComputedStyle(e); return cs.display !== 'none' && /(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 1 && e.id !== 'bagGrid' && !(e.closest && e.closest('#bagInfo')); }).map(e => e.id || String(e.className).slice(0, 20));
      try { closeWin('login'); } catch (e) {}
      // status
      S.job = 'bandit'; S.lvl = 71; S.spv = 2; for (const k in S.stats) S.stats[k] = 1; S.statPts = 300; derive(); openWin('stat'); await wait(400);
      const row = () => Math.round(document.querySelector('#pane-stat table.stats tr').getBoundingClientRect().top);
      const y0 = row(), sc0 = scrolls('win-stat'); document.querySelector('#pane-stat [data-stat="agi"]').click(); await wait(250);
      out.stat = { moved: row() - y0, scroll: [...sc0, ...scrolls('win-stat')] }; closeWin('stat');
      // bag
      for (const k of Object.keys(ITEMS).slice(0, 60)) if (!ITEMS[k].base) S.inv[k] = 3; openWin('bag'); await wait(400);
      const g = () => { const r = document.getElementById('bagGrid').getBoundingClientRect(); return Math.round(r.height) + ':' + Math.round(r.top); };
      const g0 = g(); document.querySelector('#bagGrid .bslot[data-bagsel]').click(); await wait(250);
      out.bag = { before: g0, after: g(), scroll: scrolls('win-equip') }; closeWin('bag');
      // skill tree
      S.job = 'shaman'; S.lvl = 68; S.jlvl = 40; S.skp = 40; derive(); openWin('skill'); await wait(300);
      const tab = document.querySelector('#pane-skill [data-sktab="occult"]') || document.querySelector('#pane-skill [data-sktab]'); tab.click(); await wait(250);
      const zs = new Set(); for (const id of [...document.querySelectorAll('#pane-skill [data-sksel]')].map(x => x.dataset.sksel).slice(0, 5)){
        document.querySelector(`#pane-skill [data-sksel="${id}"]`).click(); await wait(120); zs.add(document.getElementById('skTree').style.zoom || '1');
        const p = document.querySelector(`#pane-skill .btn.plus[data-skill="${id}"]:not([disabled])`); if (p){ p.click(); await wait(120); zs.add(document.getElementById('skTree').style.zoom || '1'); } }
      out.skill = [...zs];
      return out;
    });
    assert.strictEqual(r.stat.moved, 0, 'the status rows do not move when + is pressed');
    assert.deepStrictEqual(r.stat.scroll, [], 'no scroll bar in the status window');
    assert.strictEqual(r.bag.after, r.bag.before, 'the bag grid keeps its size and place when an item is picked');
    assert.deepStrictEqual(r.bag.scroll, [], 'no other scroll bar in the bag window');
    assert.strictEqual(r.skill.length, 1, 'the skill tree keeps one scale in a tab: ' + r.skill.join(', '));
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
