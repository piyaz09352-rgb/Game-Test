/* VAYRATHEN — js/sys/ink348.js — (v348) light text never on a light face, dark text never on a dark face
   The owner: «ใช้หลักการของสีจัดการเรื่องพวกนี้หน่อย ไม่ใช่อยากทำสีไรก็ทำ มันอ่านไม่ออก». The windows were first drawn for a dark
   theme (cream text on see-through black cards) and later re-dressed in light themes, so here and there a pale name sat
   on a pale card, or a see-through black card turned a muddy grey under dark text. Fixing each rule by hand kept missing
   some, so the windows check themselves:
   · each piece of text is compared with the colour really behind it (the first solid face behind it, with every
     see-through layer on top mixed in — the WCAG contrast ratio);
   · a see-through black card (the dark theme's) on a light window becomes a white card (.face-l);
   · under 3:1 it takes the ink that reads on that face: dark ink (.ink-d) on a light face, white (.ink-l) on a dark one.
   A coloured name that already reads (a gold title, a red warning) keeps its colour. Pictures behind text (an image
   face) are left alone. Runs when a window opens or its contents change (before the next paint); tools/contrast.js measures the result. */
'use strict';
{ const st = document.createElement('style'); const P = 'html:is(#h6z#h6z#h6z#h6z#h6z#h6z#h6z, html) body';
  st.textContent = `${P} .ink-d{color:#221a4a!important;-webkit-text-fill-color:#221a4a!important;text-shadow:none!important}
  ${P} .face-l{background:#fff!important;box-shadow:inset 0 0 0 1px #ddd5f2!important}
  ${P} .ink-l{color:#fff!important;-webkit-text-fill-color:#fff!important;text-shadow:0 1px 1px rgba(0,0,0,.35)!important}`;
  document.head.appendChild(st); }
const INK = {q:new Set(), t:0};
const inkRGBA = c => { const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?/.exec(c || ''); if (!m) return null;
  let a = m[4] == null ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : +m[4]; return [+m[1], +m[2], +m[3], a]; };
const inkL = ([r, g, b]) => { const f = v => (v /= 255) <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
/* one face: its gradient (averaged, weighted by how solid each stop is — a «transparent» stop is not black) over its
   colour, top layer first; false = a picture, so the colour behind is unknown */
function inkFace(cs){ const out = [], bi = cs.backgroundImage;
  if (bi && bi !== 'none'){ if (/url\(/.test(bi)) return false;
    const stops = (bi.match(/rgba?\([^)]*\)/g) || []).map(inkRGBA).filter(Boolean), A = stops.reduce((s, c) => s + c[3], 0);
    if (A > .01) out.push([0, 1, 2].map(i => stops.reduce((s, c) => s + c[i] * c[3], 0) / A).concat(A / stops.length)); }
  const bc = inkRGBA(cs.backgroundColor); if (bc && bc[3] > .02) out.push(bc); return out; }
/* layers over a colour below; null stays null (a picture, or the game showing through) */
const inkOver = (layers, under) => { let c = under, i = layers.length - 1;
  for (let k = 0; k < layers.length; k++) if (layers[k][3] >= .9){ c = layers[k].slice(0, 3); i = k - 1; break; }
  if (!c) return null; for (; i >= 0; i--){ const [r, g, b, a] = layers[i]; c = [r * a + c[0] * (1 - a), g * a + c[1] * (1 - a), b * a + c[2] * (1 - a)]; } return c; };
/* the colour an element's children are drawn on: its ::after / ::before panels (themes paint faces that way) over its
   own face over what is behind it — remembered for the run, so a long list costs one look per element */
function inkUnder(p){ const C = INK.c; if (C && C.has(p)) return C.get(p); let res;
  const cs = getComputedStyle(p), layers = [];
  for (const pe of ['::after', '::before']){ const ps = getComputedStyle(p, pe); if (ps.content === 'none' || ps.position !== 'absolute') continue; const f = inkFace(ps); if (f === false){ layers.length = 0; layers.push(false); break; } layers.push(...f); }
  const own = layers[0] === false ? false : inkFace(cs);
  if (own === false) res = null;
  else { layers.push(...own); const top = p.classList.contains('win') || p.id === 'dialog' || !p.parentElement;
    res = layers.some(l => l[3] >= .9) ? inkOver(layers, null) : top ? null : inkOver(layers, inkUnder(p.parentElement)); }
  if (C) C.set(p, res); return res; }
/* the colour right behind e's own text: its own face over what its parent draws it on */
function inkBehind(e){ const f = inkFace(getComputedStyle(e)); if (f === false) return null; if (f.some(l => l[3] >= .9)) return inkOver(f, null);
  return e.parentElement ? inkOver(f, inkUnder(e.parentElement)) : null; }
const inkOwn = e => { for (const n of e.childNodes) if (n.nodeType === 3 && n.nodeValue.trim()) return true; return false; };
function inkRun(){
  INK.t = 0; INK.c = new Map(); const roots = [...INK.q].filter(r => r.isConnected && !r.closest('[hidden]')); INK.q.clear(); if (!roots.length) return;
  /* see-through black cards left from the dark theme turn muddy grey on a light window: they become white cards */
  for (const r of roots){ const w = r.closest('.win, #dialog') || r, wb = w.querySelector('.wb') || w, wf = inkBehind(wb);
    if (!wf || inkL(wf) < .6) continue;
    const all = [r, ...r.querySelectorAll('*:not(svg *)')], add = [];
    for (const e of all){ if (e.classList.contains('face-l')) continue; const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none') continue;
      const c = inkRGBA(cs.backgroundColor); if (c && c[0] < 60 && c[1] < 60 && c[2] < 60 && c[3] >= .12 && c[3] <= .6 && e.offsetWidth > 24 && e.offsetHeight > 14) add.push(e); }
    for (const e of add) e.classList.add('face-l'); if (add.length) INK.c = new Map(); }
  const els = []; for (const r of roots){ if (inkOwn(r)) els.push(r); for (const e of r.querySelectorAll('*:not(svg):not(svg *)')){ if (inkOwn(e)) els.push(e); if (els.length > 3000) break; } }
  // a marked piece keeps its mark while that still reads (dark ink on a pale face is never wrong), so nothing is restyled
  // just to look again
  const had = els.map(e => e.classList.contains('ink-d') ? 'ink-d' : e.classList.contains('ink-l') ? 'ink-l' : '');
  const want = els.map(e => { const cs = getComputedStyle(e); if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') return '';
    const f = inkRGBA(cs.webkitTextFillColor && !/^rgba\(0, 0, 0, 0\)$/.test(cs.webkitTextFillColor) ? cs.webkitTextFillColor : cs.color); if (!f || f[3] < .5) return '';
    const bg = inkBehind(e); if (!bg) return '';
    const Lt = inkL(f), Lb = inkL(bg), ratio = (Math.max(Lt, Lb) + .05) / (Math.min(Lt, Lb) + .05);
    if (ratio >= 3) return null;   // reads as it is (with or without a mark): leave it
    if (!/[\p{L}\p{N}]/u.test(e.textContent)) return '';   // emoji-only text keeps its own colours
    // the ink that stands out more on that face: dark ink from a luminance of ~0.15 up, white below
    return Lb > .15 ? 'ink-d' : 'ink-l'; });
  INK.c = null;
  for (let i = 0; i < els.length; i++){ const w = want[i] == null ? had[i] : want[i]; if (w !== had[i]){ if (had[i]) els[i].classList.remove(had[i]); if (w) els[i].classList.add(w); } }
}
/* run inside the observer's own turn (a microtask, before the next paint), so a re-drawn window never shows a frame of
   its old colours */
const inkRoot = n => n && n.nodeType === 1 && n.closest && n.closest('.win, #dialog');
new MutationObserver(list => { for (const r of list){
  if (r.type === 'attributes'){ if (r.attributeName === 'class'){ const strip = v => String(v || '').replace(/\b(ink-d|ink-l|wout|face-l)\b/g, '').trim(); if (strip(r.oldValue) === strip(r.target.getAttribute('class'))) continue; }
    const w = inkRoot(r.target); if (w && !w.hidden) INK.q.add(r.attributeName === 'hidden' && r.target === w ? w : r.target); continue; }
  const w = inkRoot(r.target); if (w && !w.hidden) INK.q.add(r.target.nodeType === 1 ? r.target : w); }
  if (INK.q.size) inkRun(); })
  .observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:['class', 'hidden'], attributeOldValue:true});
