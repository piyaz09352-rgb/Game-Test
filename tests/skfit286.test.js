/* VAYRATHEN — tests/skfit286.test.js — (v286) the skill window never shows a scroll bar, and nothing in it is cut off
   The owner asked many times. The longest trees (occult, merchant) were ~100 px taller than their frame at every size. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

for (const [w, h] of [[1366, 768], [844, 390]]) test(`skill window fits at ${w}×${h}`, { skip, timeout: 150000 }, async () => {
  const { page, errors, close } = await openGame({ width: w, height: h });
  try {
    await enterWorld(page);
    const bad = await page.evaluate(async () => {
      const out = [], wait = ms => new Promise(r => setTimeout(r, ms));
      for (const job of ['shaman', 'tycoon', 'kage', 'sovereign']){
        S.job = job; S.lvl = 120; S.jlvl = 70; S.skp = 60; derive(); openWin('skill'); await wait(300);
        for (const t of [...document.querySelectorAll('#pane-skill [data-sktab]')].map(b => b.dataset.sktab)){
          const b = document.querySelector(`#pane-skill [data-sktab="${t}"]`); if (b) b.click(); await wait(200);
          const p = document.querySelector('#pane-skill .btn.plus:not([disabled])'); if (p){ p.click(); await wait(150); }
          for (const e of document.querySelectorAll('#win-skill, #win-skill *')){ const cs = getComputedStyle(e); if (cs.display === 'none') continue;
            const scrolls = /(auto|scroll)/.test(cs.overflowY + cs.overflowX) && (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1);
            if (scrolls || cs.overflowY === 'scroll') out.push(`${job}/${t} scroll bar on ${e.id || e.className}`); }
          for (const e of [document.getElementById('skTree'), document.querySelector('#pane-skill .skdetail')]) if (e && e.scrollHeight > e.clientHeight + 2) out.push(`${job}/${t} ${e.id || e.className} cut off ${e.scrollHeight}/${e.clientHeight}`);
        }
      }
      return out;
    });
    assert.deepStrictEqual(bad, []);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
