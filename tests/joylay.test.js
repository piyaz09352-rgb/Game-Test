/* VAYRATHEN — tests/joylay.test.js — (v107) on a sideways phone the touch buttons never overlap, with all 8 skills */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

for (const [W, H] of [[858, 390], [915, 412], [1024, 600]]){
  test(`touch layout ${W}×${H}: 8 skills, dodge, potions and small buttons do not overlap`, { skip, timeout: 120000 }, async () => {
    const { page, errors, close } = await openGame({ width:W, height:H, ctx:{ isMobile:true, hasTouch:true, deviceScaleFactor:3 } });
    try {
      await enterWorld(page, 'Joy');
      const r = await page.evaluate(async () => {
        const c = el('confirm'); if (c) c.hidden = true;
        S.job = 'sovereign'; S.lvl = 163; for (const id of [...JOBS.summoner.skills, ...JOBS.sovereign.skills]) S.skills[id] = 5;
        S.hot = [...JOBS.sovereign.skills, ...JOBS.summoner.skills].filter(id => SKILLS[id] && SKILLS[id].type !== 'passive').slice(0, 8);
        S.inv.redpot = 128; S.inv.bluepot = 185; derive(); SETTINGS.control = 'joy'; applyControlMode(); renderMoba(); heApply();
        await new Promise(r => setTimeout(r, 600));
        const list = [...document.querySelectorAll('#mobaAct .mo, #mobaPot .mo, #mobaUtil .mu')].filter(e => e.offsetWidth).map(e => { const b = e.getBoundingClientRect(); return {c:e.className, x:b.left, y:b.top, w:b.width, h:b.height}; });
        const hits = []; for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++){ const a = list[i], b = list[j];
          if (Math.hypot(a.x + a.w / 2 - b.x - b.w / 2, a.y + a.h / 2 - b.y - b.h / 2) < Math.min(a.w, a.h) / 2 + Math.min(b.w, b.h) / 2 - 2) hits.push(a.c + ' × ' + b.c); }
        return {n:list.filter(x => /\bsk\b/.test(x.c)).length, hits, top:Math.min(...list.map(x => x.y)), left:Math.min(...list.map(x => x.x))};
      });
      assert.strictEqual(r.n, 8, 'all eight skill slots are shown');
      assert.deepStrictEqual(r.hits, [], 'no two buttons overlap');
      assert.ok(r.top >= 0 && r.left >= 0, 'all on screen');
    } finally { await close(); }
    assert.deepStrictEqual(errors, [], 'no runtime errors');
  });
}
