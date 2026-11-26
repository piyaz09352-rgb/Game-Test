/* VAYRATHEN — tests/uiwin345.test.js — (v345) every window, every tab, on a phone held sideways and on a laptop
   The owner found a giant item picture in the market's sell tab and chips spilling out of the minimap card after they had
   shipped. This test opens each of the windows (and each of its tabs) the way a player would and checks:
   · the ✕ button is on top (nothing covers its middle) and a real tap / click on it closes the window
   · no item picture inside a slot, a row or a button is drawn bigger than a slot can be (80 px)
   · nothing inside the window is wider than the window itself
   · (v348) the slots of a bag grid never pile on each other (the market's sell tab with a full bag)
   · no runtime error while doing it */
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed';
const SIZES = [['phone', 844, 390, { hasTouch: true, isMobile: true, deviceScaleFactor: 2 }], ['laptop', 1366, 768, {}]];

for (const [nm, w, h, ctx] of SIZES) test(`every window and tab at ${nm} ${w}×${h}: closes with its ✕, no giant pictures, nothing wider than the window`, { skip, timeout: 600000 }, async () => {
  const { page, errors, close } = await openGame({ width: w, height: h, ctx });
  try {
    await enterWorld(page, 'Win', 'win_user_' + nm);
    await page.evaluate(() => { S.tut = { done: true, i: 99 }; S.lvl = 120; S.jlvl = 50; S.bia = 1e6;
      for (const k of Object.keys(ITEMS).filter(k => !ITEMS[k].kind || ITEMS[k].kind !== 'key').slice(0, 140)) S.inv[k] = 2;   /* (v348) a full bag: the market's sell grid squeezed its rows only past one screen of slots */ derive();
      // the market and other online windows draw their full contents with a stand-in for the online database
      NET.db = NET.db || { collection: () => ({ orderBy: () => ({ limit: () => ({ onSnapshot: () => () => {} }) }), where: () => ({ limit: () => ({ get: async () => ({ docs: [] }) }) }), doc: () => ({ get: async () => ({ exists: false }), set: async () => {}, onSnapshot: () => () => {} }) }) };
      NET.uid = NET.uid || 'me';
      if (typeof MK !== 'undefined'){ MK.unsub = () => {}; MK.mineT = Date.now(); MK.rows = [{ id: 'a', i: Object.keys(S.inv)[0], n: 1, p: 10, s: 'x', sn: 'A' }]; MK.mine = [{ id: 'b', i: Object.keys(S.inv)[0], n: 1, p: 9 }]; }
      if (typeof mkCollect === 'function') window.mkCollect = () => {}; });
    const ids = await page.evaluate(() => WIN_IDS.slice());
    const bad = [];
    for (const id of ids){
      const opened = await page.evaluate(id => { for (const x of WIN_IDS) if (UIS.open[x]) closeWin(x); try { openWin(id); } catch (e) { return 'err ' + e.message; } const el = winEl(id); return !!(el && !el.hidden); }, id);
      if (opened !== true){ if (typeof opened === 'string') bad.push(`${id}: ${opened}`); continue; }
      await page.waitForTimeout(450);   // the opening animation
      const found = await page.evaluate(async id => {
        const w = winEl(id), out = [], W = w.getBoundingClientRect();
        const check = tab => {
          // (v348) slots in a grid never pile on each other (the market's sell tab with a full bag squeezed its rows flat)
          for (const g of w.querySelectorAll('.tbag, .bgrid, .baggrid')){ const sl = [...g.children].filter(e => e.offsetParent).map(e => e.getBoundingClientRect());
            for (let i = 1; i < sl.length; i++){ const a = sl[i - 1], b = sl[i], ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
              if (ix > 4 && iy > 4 && ix * iy > .2 * a.width * a.height){ out.push(`${id}/${tab}: slots overlap in ${g.className} (#${i})`); break; } }
            for (let i = 0; i + 16 < sl.length; i += 16){ const a = sl[i], b = sl[i + 16], ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
              if (ix > 4 && iy > 4){ out.push(`${id}/${tab}: slots of different rows overlap in ${g.className}`); break; } } }
          for (const e of w.querySelectorAll('svg, img')){ const b = e.getBoundingClientRect(); if (!b.width) continue;
            if (b.width > 80 && b.height > 80 && e.closest('button, .bslot, .ic, .bico, .srow, .slot, li')) out.push(`${id}/${tab}: picture ${Math.round(b.width)}×${Math.round(b.height)} in ${(e.closest('[class]') || e).className.baseVal ?? (e.closest('[class]') || e).className}`); }
          for (const e of w.querySelectorAll('.pane *')){ const b = e.getBoundingClientRect(); if (b.width > W.width + 4 && getComputedStyle(e).position !== 'fixed'){ out.push(`${id}/${tab}: ${String(e.className).slice(0, 30)} ${Math.round(b.width)} wider than the window ${Math.round(W.width)}`); break; } } };
        check('-');
        for (const t of [...w.querySelectorAll('[data-tab],[data-mktab],.wktab')].slice(0, 8)){ try { t.click(); } catch (e) {} await new Promise(r => setTimeout(r, 120)); check(t.textContent.trim().slice(0, 12)); }
        return out; }, id);
      bad.push(...found);
      // the ✕: on top, and a real tap / click closes the window
      const x = await page.evaluate(id => { const b = [...winEl(id).querySelectorAll('.wt [aria-label="ปิด"], .wt .ibtn.wout, [data-close]')].find(b => b.offsetWidth); if (!b) return null;
        const r = b.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2, t = document.elementFromPoint(cx, cy); return { cx, cy, top: !!t && (t === b || b.contains(t)) }; }, id);
      if (!x){ bad.push(`${id}: no ✕ button`); continue; }
      if (!x.top) bad.push(`${id}: something covers the ✕`);
      if (ctx.hasTouch) await page.touchscreen.tap(x.cx, x.cy); else await page.mouse.click(x.cx, x.cy);
      await page.waitForTimeout(250);
      if (await page.evaluate(id => !!UIS.open[id] && !winEl(id).hidden, id)) bad.push(`${id}: the ✕ does not close it`);
    }
    assert.deepStrictEqual(bad, [], `${ids.length} windows checked`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
