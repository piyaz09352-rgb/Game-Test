/* VAYRATHEN — tools/contrast.js — (v348) is every text readable against what is really behind it?
   The owner: «ใช้หลักการของสีจัดการเรื่องพวกนี้หน่อย ไม่ใช่อยากทำสีไรก็ทำ มันอ่านไม่ออก». A colour can look fine in the CSS and
   still sit on a picture, a gradient or a bar of nearly the same brightness. So this measures the real page: it notes each
   piece of text (its box and its colour), hides all text, photographs the window, and compares the text colour with the
   pixels behind its box (WCAG contrast ratio; shadows and outlines do not count, they only blur small text).
   Used by tests/contrast348.test.js; run alone:  node tools/contrast.js [WIN=quest,market] [SIZE=844x390] [MIN=3]   */
'use strict';
const MIN_RATIO = +process.env.MIN || 3;

/* in the page: text pieces of a root element */
const collect = (sel) => { const root = document.querySelector(sel); if (!root) return [];
  const R = root.getBoundingClientRect(), out = [];
  const lum = c => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b, a = 1] = m.map(Number); if (a < .5) return null;
    const f = v => (v /= 255) <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  for (const e of root.querySelectorAll('*')){
    if (!e.offsetParent && getComputedStyle(e).position !== 'fixed') continue;
    if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0)) continue;
    const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    let op = 1; for (let p = e; p && p !== document.body; p = p.parentElement) op *= +getComputedStyle(p).opacity; if (op < .6) continue;   // faded on purpose (locked / disabled)
    const r = document.createRange(); r.selectNodeContents(e); const b = r.getBoundingClientRect();
    if (b.width < 4 || b.height < 6 || b.bottom < R.top || b.top > R.bottom || b.right < R.left || b.left > R.right) continue;
    // scrolled out of its box (or half under its fading edge), or covered: what is on screen there is something else
    let sc = e.parentElement; while (sc && sc !== root && !/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement;
    if (sc){ const q = sc.getBoundingClientRect(); if (b.top < q.top + 2 || b.bottom > q.bottom - 24) continue; }
    const top = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); if (!top || !(top === e || e.contains(top) || top.contains(e))) continue;
    const fill = cs.webkitTextFillColor && !/rgba\(0, 0, 0, 0\)/.test(cs.webkitTextFillColor) ? cs.webkitTextFillColor : cs.color, L = lum(fill); if (L == null) continue;
    const out1 = L < .2 && (cs.textShadow.match(/rgb\(0, 0, 0\)/g) || []).length >= 4;   // dark text inside a black outline: a blob, whatever the ratio
    out.push({ blob: out1, t: e.textContent.trim().slice(0, 24), x: b.x, y: b.y, w: b.width, h: b.height, L, fs: parseFloat(cs.fontSize), fw: +cs.fontWeight || 400, sel: e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') }); }
  return out; };

/* measure one root (a window, the HUD …) as it is on screen now */
async function contrastOf(page, sel){
  const items = await page.evaluate(collect, sel); if (!items.length) return [];
  // hide the text with inline !important (it beats every style sheet, even «html body #ui .btn{color:…!important}»)
  const PROPS = ['color', '-webkit-text-fill-color', 'text-shadow', '-webkit-text-stroke', 'caret-color'];
  await page.evaluate(([sel, PROPS]) => { const root = document.querySelector(sel); window.__ct = [];
    for (const e of [root, ...root.querySelectorAll('*')]){ window.__ct.push([e, PROPS.map(p => [e.style.getPropertyValue(p), e.style.getPropertyPriority(p)])]);
      for (const p of PROPS) e.style.setProperty(p, p === 'text-shadow' ? 'none' : p === '-webkit-text-stroke' ? '0' : 'transparent', 'important'); } }, [sel, PROPS]);
  await page.waitForTimeout(60);
  const png = await page.screenshot({ type: 'png' });
  await page.evaluate(PROPS => { for (const [e, old] of window.__ct) PROPS.forEach((p, i) => { if (old[i][0]) e.style.setProperty(p, old[i][0], old[i][1]); else e.style.removeProperty(p); }); window.__ct = null; }, PROPS);
  const dpr = await page.evaluate(() => devicePixelRatio);
  return page.evaluate(async ({ b64, items, dpr }) => {
    const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    const f = v => (v /= 255) <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
    return items.map(it => { const x = Math.max(0, Math.round(it.x * dpr)), y = Math.max(0, Math.round(it.y * dpr)), w = Math.max(1, Math.round(it.w * dpr)), h = Math.max(1, Math.round(it.h * dpr));
      const d = g.getImageData(x, y, Math.min(w, c.width - x), Math.min(h, c.height - y)).data, ls = [];
      for (let i = 0; i < d.length; i += 4 * 3) ls.push(.2126 * f(d[i]) + .7152 * f(d[i + 1]) + .0722 * f(d[i + 2]));
      ls.sort((a, b) => a - b); if (!ls.length) return null;
      // the text must stand out from most of what is behind it: compare with the 15th and 85th percentile, keep the worse
      const ratio = bl => (Math.max(bl, it.L) + .05) / (Math.min(bl, it.L) + .05);
      const r = Math.min(ratio(ls[Math.floor(ls.length * .15)]), ratio(ls[Math.floor(ls.length * .85)]));
      return { ...it, ratio: +r.toFixed(2) }; }).filter(Boolean);
  }, { b64: png.toString('base64'), items, dpr });
}
module.exports = { contrastOf, MIN_RATIO };

if (require.main === module) (async () => {
  const { openGame, enterWorld } = require('../tests/browser');
  const [w, h] = (process.env.SIZE || '1366x768').split('x').map(Number), touch = w < 1100;
  const { page, close } = await openGame({ width: w, height: h, ctx: touch ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {} });
  await enterWorld(page, 'Ct', 'ct_' + Date.now().toString(36));
  await page.evaluate(process_env => { S.tut = { done: true, i: 99 }; S.lvl = 60; S.jlvl = 30; S.bia = 1e6; for (const k of Object.keys(ITEMS).slice(0, 60)) S.inv[k] = 2;
    if (process_env.TOURDONE){ const t = tourS(); t.done = 1; for (const n of NPCS) t.v[n.id] = 1; }   // the quest window's later look: map stories with their bars
    derive(); }, { TOURDONE: process.env.TOURDONE });
  const wins = process.env.WIN ? process.env.WIN.split(',') : await page.evaluate(() => WIN_IDS.slice());
  let bad = 0;
  for (const id of ['HUD', ...wins]){
    let sel = '#ui';
    if (id !== 'HUD'){ const ok = await page.evaluate(id => { for (const x of WIN_IDS) if (UIS.open[x]) closeWin(x); try { openWin(id); } catch (e) { return false; } const el = winEl(id); return !!(el && !el.hidden); }, id); if (!ok) continue; await page.waitForTimeout(450); sel = '#win-' + id; }
    const tabs = id === 'HUD' ? [null] : [null, ...(await page.evaluate(sel => [...document.querySelectorAll(`${sel} [data-tab], ${sel} [data-mktab], ${sel} .wktab`)].slice(0, 8).map((t, i) => i), sel))];
    for (const ti of tabs){
      if (ti != null){ await page.evaluate(([sel, ti]) => { const t = document.querySelectorAll(`${sel} [data-tab], ${sel} [data-mktab], ${sel} .wktab`)[ti]; if (t) t.click(); }, [sel, ti]); await page.waitForTimeout(200); }
      const res = await contrastOf(page, id === 'HUD' ? '#ui' : sel);
      for (const r of res.filter(r => r.ratio < MIN_RATIO || r.blob)){ bad++; console.log(`${id}${ti != null ? '/' + ti : ''}\t${r.blob ? 'BLOB ' : ''}${r.ratio}\t${r.sel}\t«${r.t}»\t${Math.round(r.fs)}px`); }
      if (id === 'HUD') await page.evaluate(() => {});
    }
  }
  console.log(`${bad} pieces of text under ${MIN_RATIO}:1`); await close();
})();
