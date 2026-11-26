/* VAYRATHEN — tests/contrast348.test.js — (v348) text is readable against what is really behind it
   The owner: «ใช้หลักการของสีจัดการเรื่องพวกนี้หน่อย ไม่ใช่อยากทำสีไรก็ทำ มันอ่านไม่ออก» (skill labels white on a cream pill,
   quest bar numbers black on black, chosen tabs white on white, grey see-through cards). tools/contrast.js photographs
   each window with its text hidden and compares every piece of text with the pixels behind it. Here: the windows the
   owner showed and the busiest others, at a laptop and a phone held sideways; nothing may fall under 2:1 (WCAG asks
   4.5 for body text — 2:1 is the line under which a word cannot be read at all; the windows sit far above it now). */
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const { contrastOf } = require('../tools/contrast');
const skip = !chromium && 'playwright not installed';
const SIZES = [['laptop', 1366, 768, {}], ['phone', 844, 390, { hasTouch: true, isMobile: true, deviceScaleFactor: 2 }]];
const WINS = ['quest', 'craft', 'wiki', 'ach', 'equip', 'stat', 'skill'];

for (const [nm, w, h, ctx] of SIZES) test(`text reads against its background in the main windows at ${nm}`, { skip, timeout: 300000 }, async () => {
  const { page, close } = await openGame({ width: w, height: h, ctx });
  try {
    await enterWorld(page, 'Ink', 'ink_user_' + nm);
    await page.evaluate(() => { S.tut = { done: true, i: 99 }; S.lvl = 60; S.jlvl = 30; S.bia = 1e6;
      for (const k of Object.keys(ITEMS).slice(0, 60)) S.inv[k] = 2; const t = tourS(); t.done = 1; for (const n of NPCS) t.v[n.id] = 1; derive(); });
    const bad = [];
    for (const id of WINS){
      const ok = await page.evaluate(id => { for (const x of WIN_IDS) if (UIS.open[x]) closeWin(x); try { openWin(id); } catch (e) { return false; } const el = winEl(id); return !!(el && !el.hidden); }, id);
      if (!ok) continue; await page.waitForTimeout(450);
      const tabs = await page.evaluate(id => document.querySelectorAll(`#win-${id} [data-tab], #win-${id} .wktab`).length, id);
      for (let ti = -1; ti < Math.min(tabs, 8); ti++){
        if (ti >= 0){ await page.evaluate(([id, ti]) => document.querySelectorAll(`#win-${id} [data-tab], #win-${id} .wktab`)[ti].click(), [id, ti]); await page.waitForTimeout(200); }
        for (const r of await contrastOf(page, '#win-' + id)) if (r.ratio < 2 && /[\p{L}\p{N}]/u.test(r.t)) bad.push(`${id}${ti >= 0 ? '/' + ti : ''}: «${r.t}» ${r.sel} ${r.ratio}:1`);
      }
    }
    assert.deepStrictEqual(bad, [], 'text under 2:1 against what is behind it');
  } finally { await close(); }
});
