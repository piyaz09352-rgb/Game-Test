/* VAYRATHEN — js/sys/sunread.js — every word readable on the bright theme (v33)
   Older screens were drawn for the dark theme: pale lettering and dark see-through boxes. Inside windows, dialogs
   and HUD cards this pass
   · turns a dark see-through box (rows, tiles, headers) into a light one (class .slt), then
   · gives any lettering that is pale against a light background dark ink instead (class .sdk), and coloured lettering
     that is too light (sky blue, mint, pink…) a darker shade of its own colour.
   Title bars, buttons with their own colour, item art and cards are left alone. New screens are checked as they appear. */
'use strict';

const SR_ROOT = '.cubox,.win,.dialog,.card,.tipcard,.tutbox,.achpop,.ptyhud,#confirm';
const SR_SKIP = '.dy,.dyesw,.tst,.tic,#buffs,.bf,.castbar,.cdv,.sw,.gdx,.wt,.dh,.btn,button.on,kbd,.hk,svg,canvas,.tcard,.tc-art,.eqaura,.iart,.rar:not(.r0),[style*="url("],.gem,.wchip,.pbar,.bar,.sl-keep';
const SR_N = '*:not(svg *)';
const srRGBA = s => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
const srLum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
const srOver = (t, b) => [t[0] * t[3] + b[0] * (1 - t[3]), t[1] * t[3] + b[1] * (1 - t[3]), t[2] * t[3] + b[2] * (1 - t[3]), 1];
function srOwnBg(cs){
  let c = srRGBA(cs.backgroundColor); if (c && !c[3]) c = null;
  if (cs.backgroundImage && cs.backgroundImage !== 'none' && !/url\(/.test(cs.backgroundImage)){
    const g = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map(srRGBA); if (g.length){ const a = g.reduce((s, x) => s.map((v, i) => v + x[i]), [0, 0, 0, 0]).map(v => v / g.length); c = c ? srOver(a, c) : a; } }
  return c;
}
function srBg(e){   // what the lettering actually sits on, over the parchment
  const chain = []; for (let n = e; n && n.nodeType === 1; n = n.parentElement){ const c = srOwnBg(getComputedStyle(n)); if (c){ chain.push(c); if (c[3] >= .95) break; } if (n.matches && n.matches(SR_ROOT)) break; }
  let b = [251, 243, 225, 1]; for (let i = chain.length - 1; i >= 0; i--) b = srOver(chain[i], b); return b;
}
const srOwnText = e => { for (const n of e.childNodes) if (n.nodeType === 3 && n.nodeValue.trim()) return true; return false; };
function srCheck(root){
  if (!root || root.nodeType !== 1) return;
  const all = [root, ...root.querySelectorAll(SR_N)];   // item art (svg) is never recoloured: its insides are not even looked at
  for (const e of all){ if (e.closest(SR_SKIP) || !e.offsetWidth) continue;   // pass 1: dark see-through boxes go light
    const cs = getComputedStyle(e), c = srOwnBg(cs); if (!c || /url\(/.test(cs.backgroundImage)) continue;
    if (c[3] > .12 && srLum(c) < .2 && e.offsetHeight > 14 && !e.classList.contains('slt')) e.classList.add('slt'); }
  for (const e of all){ if (e.closest(SR_SKIP) || !e.offsetWidth || !srOwnText(e)) continue;   // pass 2: pale lettering goes dark
    const cs = getComputedStyle(e); let fg = srRGBA(cs.webkitTextFillColor && !/0\)$/.test(cs.webkitTextFillColor) ? cs.webkitTextFillColor : cs.color); if (!fg) continue;
    const bg = srBg(e); if (srLum(bg) < .45) continue; fg = srOver(fg, bg);
    const L1 = srLum(fg), L2 = srLum(bg), cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    if (cr >= 4.5) continue;
    const [r, g, b] = fg, mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx - mn < 40 || cr < 2){ e.classList.add('sdk'); continue; }   // grey, white or nearly invisible: black ink
    let k = 1, d = fg; while (k > .1){ k -= .07; d = [r * k, g * k, b * k, 1]; const L3 = srLum(d); if ((L2 + .05) / (L3 + .05) >= 5.2) break; }   // coloured: the same hue, darker
    const c = `rgb(${d.slice(0, 3).map(Math.round).join(',')})`; e.style.setProperty('color', c, 'important'); e.style.setProperty('-webkit-text-fill-color', c, 'important'); }
}
/* cheap on purpose: windows and cards are queued and each one is checked at most every 1.5 s (the HUD changes every frame) */
const SR = {q:new Set(), on:false, last:new WeakMap()};
const srRootOf = e => e.closest ? (e.closest(SR_ROOT) || null) : null;
function srRun(){ SR.on = false; const now = performance.now(); let left = false;
  for (const r of SR.q){ if (!r.isConnected || !r.offsetWidth){ SR.q.delete(r); continue; }
    if (now - (SR.last.get(r) || -1e9) < 1500){ left = true; continue; }
    SR.q.delete(r); SR.last.set(r, now); srCheck(r); }
  if (left || SR.q.size){ SR.on = true; setTimeout(srRun, 500); } }
const srPush = e => { if (!e || e.nodeType !== 1) e = e && e.parentElement; if (!e) return;
  const r = srRootOf(e); if (r) SR.q.add(r); else if (e.querySelectorAll) e.querySelectorAll(SR_ROOT).forEach(x => SR.q.add(x)); else return;
  if (!SR.on){ SR.on = true; setTimeout(srRun, 120); } };
/* (v57) a window that redraws part of itself (a stats list every second, a shop after a purchase) used to show the
   new rows pale for a moment until the next pass: now new rows are fixed at once, before the frame is painted.
   (v100) also a whole window redrawn at once (the forge after a tap had ~1,000 nodes, over the old 400 limit, so it
   blinked dark for a moment), a window seen for the first time, and a window coming back from hidden. Item art is
   not counted. A window that redraws many times a second is checked at most every 80 ms, the rest is queued. */
const SR_NOW = new WeakMap();
function srFix(root, e){ const now = performance.now(); if (now - (SR_NOW.get(root) || -1e9) < 80){ srPush(e); return; }
  if (e.querySelectorAll(SR_N).length > 1500){ srPush(e); return; } SR_NOW.set(root, now); srCheck(e); if (e === root) SR.last.set(root, now); }
const srNow = r => {
  if (r.type === 'attributes'){ const e = r.target; if (r.attributeName === 'hidden' && !e.hidden && e.matches && e.matches(SR_ROOT) && e.offsetWidth) srFix(e, e); return; }
  if (r.type !== 'childList') return; for (const n of r.addedNodes){ const e = n.nodeType === 1 ? n : null; if (!e || !e.isConnected) continue;
  const root = srRootOf(e); if (!root || !root.offsetWidth || e.closest(SR_SKIP)) continue; srFix(root, e); } };
new MutationObserver(list => { for (const r of list){ srNow(r); if (r.type === 'attributes' && r.attributeName === 'class' && /\b(sdk|slt|wout)\b/.test(r.target.className + '' + (r.oldValue || ''))){ const s = v => String(v || '').replace(/\b(sdk|slt|wout)\b/g, '').trim(); if (s(r.oldValue) === s(r.target.getAttribute('class'))) continue; } srPush(r.target); } })
  .observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:['class', 'hidden'], attributeOldValue:true});
srPush(document.body);
