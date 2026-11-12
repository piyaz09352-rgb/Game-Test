/* VAYRATHEN — tests/patch257.test.js — (v257) server patches: level caps 70/130/180/240/300, stored EXP, class tiers */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('patches: cap, stored EXP turns into levels when the next opens, class tiers wait', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Patch');
    const r = await page.evaluate(() => { const o = {};
      o.open = patchCap();                                   // offline / never set: everything open
      patchApply(1, true); o.cap1 = patchCap();
      S.lvl = 68; S.exp = 0; derive(); let big = 0; for (let l = 68; l < 140; l++) big += nextBase(l);
      gainExp(big, 0); o.lv1 = S.lvl; o.stored = S.exp; layoutHud && 0; if (typeof updHud === 'function') updHud();
      o.bar = (el('bxT') || {}).textContent || '';
      // class change: a first-class hero cannot take the second class in patch 1
      const first = Object.keys(JOBS).find(k => JOBS[k].tier === 2 && JOBS[k].next && JOBS[k].next.length); S.job = first; S.jlvl = JOBS[first].jobMax;
      o.block1 = jobChangeBlock() || '';
      patchApply(2); o.cap2 = patchCap(); o.lv2 = S.lvl; o.block2 = jobChangeBlock() || '';
      patchApply(5, true); return o; });
    assert.strictEqual(r.open, 300, 'all open by default');
    assert.strictEqual(r.cap1, 70);
    assert.strictEqual(r.lv1, 70, 'stops at the patch 1 cap');
    assert.ok(r.stored > 0, 'EXP past the cap is stored');
    assert.ok(/แพตช์ 2|patch 2/.test(r.block1), 'the second class waits for patch 2: ' + r.block1);
    assert.strictEqual(r.cap2, 130);
    assert.ok(r.lv2 > 70 && r.lv2 <= 130, 'stored EXP became levels when patch 2 opened: ' + r.lv2);
    assert.ok(!/แพตช์|patch/i.test(r.block2), 'patch 2 lets the second class through: ' + r.block2);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
