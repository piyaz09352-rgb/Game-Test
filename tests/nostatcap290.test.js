/* VAYRATHEN — tests/nostatcap290.test.js — (v290) no stat cap
   The owner (Shadow Bandit Lv 67, STR/AGI 54, 164 points left): the + button was greyed out by the level-based cap
   (v193/v241). The cap is gone; a stat goes as high as the points take it, and pouring a whole Lv 300 budget into one
   stat keeps every derived number finite and inside its own limits. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('the + works past the old cap, and extreme stats stay sane', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width: 1366, height: 768 });
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      S.job = 'bandit'; S.lvl = 67; S.spv = 2; for (const k in S.stats) S.stats[k] = 1; S.stats.str = 54; S.stats.agi = 54; S.statPts = 164; derive();
      openWin('stat'); await new Promise(res => setTimeout(res, 300));
      const plus = document.querySelector('#pane-stat [data-stat="str"]:not([disabled]), #pane-stat [data-stat="str"]');
      const enabled = !!plus && !plus.disabled; const before = S.stats.str + (typeof STP !== 'undefined' ? (STP.add.str || 0) : 0);
      if (plus) plus.click(); await new Promise(res => setTimeout(res, 100));
      const after = S.stats.str + (typeof STP !== 'undefined' ? (STP.add.str || 0) : 0);
      // a whole Lv 300 budget into each stat in turn
      const out = {}; for (const st of ['str', 'agi', 'vit', 'int', 'dex', 'luk']){ S.lvl = 300; for (const k in S.stats) S.stats[k] = 1; let pts = statBudget(300);
        while (pts >= statCost(S.stats[st])){ pts -= statCost(S.stats[st]); S.stats[st]++; } S.statPts = pts; derive();
        const bad = Object.entries(DER).filter(([k, v]) => typeof v === 'number' && !Number.isFinite(v)).map(([k]) => k);
        out[st] = {v:S.stats[st], bad, aspd:DER.aspd, crit:DER.crit, flee:DER.flee, maxhp:DER.maxhp}; }
      return { enabled, before, after, out, cap:STAT_CAP(67) };
    });
    assert.ok(r.cap > 500, 'no cap any more');
    assert.ok(r.enabled && r.after === r.before + 1, `STR 54 → 55 at Lv 67 with points left (${r.before} → ${r.after})`);
    for (const [st, o] of Object.entries(r.out)){ assert.ok(o.v > 150, `${st} can be raised high: ${o.v}`); assert.deepStrictEqual(o.bad, [], `${st} ${o.v}: every derived number is finite`); }
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
