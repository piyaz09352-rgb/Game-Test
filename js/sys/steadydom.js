/* VAYRATHEN — js/sys/steadydom.js — (v89) windows that update in place, so nothing blinks while you fight
   Every kill, potion or EXP tick redrew the bag, equipment, status and skill windows from scratch (innerHTML):
   every card, label and bar was thrown away and built again, so the slot labels (หมวก · อาวุธ · เครื่องประดับ),
   the HP bars and their little animations flashed each time. Now a redraw of those windows only changes what is
   really different: a bar slides to its new width, a number changes, everything else stays exactly where it is.
   The character preview canvas is kept as it is. Text boxes and drop-downs are still rebuilt the old way (their listeners are added fresh after each draw). */
'use strict';

const SDOM = {sel:'#win-bag,#win-equip,#win-skill,#win-quest,#win-stat,#hotbar,#mobaAct,#mobaUtil,#mobaPot,#buffs', on:true, n:0, keep:'.e6c,.rpbtn', runCls:/^(sdk|slt|wout|grx|gr[0-3])$/, runAttr:['data-gs'], runCss:['zoom', 'color', '-webkit-text-fill-color', 'text-shadow', 'row-gap', 'padding-top', 'padding-bottom', 'overflow']};   // keep: decorations other files add after a draw (the equipment frame corners)
const sdomField = n => n.nodeType === 1 && /^(INPUT|SELECT|TEXTAREA|VIDEO|IFRAME)$/.test(n.nodeName);
function sdomNode(x, y){
  if (x.nodeType !== y.nodeType || x.nodeName !== y.nodeName || sdomField(y) || sdomField(x)){ x.replaceWith(y); return; }
  if (x.nodeType === 3 || x.nodeType === 8){ if (x.nodeValue !== y.nodeValue) x.nodeValue = y.nodeValue; return; }
  if (x.nodeType !== 1) { x.replaceWith(y); return; }
  if (x.nodeName === 'CANVAS'){ if (x.id !== y.id) x.replaceWith(y); return; }   // a drawn canvas (the character preview) stays as it is
  sdomRun(x, y);
  const xa = x.attributes, ya = y.attributes;
  for (let i = xa.length - 1; i >= 0; i--){ const n = xa[i].name; if (!y.hasAttribute(n)) x.removeAttribute(n); }
  for (let i = 0; i < ya.length; i++){ const a = ya[i]; if (x.getAttribute(a.name) !== a.value) x.setAttribute(a.name, a.value); }
  sdomKids(x, y);
}
/* marks other files add after a draw (dark ink .sdk, light panel .slt, outlined text .wout, ink colours, a fitted zoom) are put on the
   fresh copy first; dropping them and letting those files add them back a moment later was a visible flash every redraw */
function sdomRun(x, y){
  const xc = x.getAttribute('class');
  if (xc && /\b(sdk|slt|wout|grx|gr[0-3])\b/.test(xc)){ const add = xc.split(/\s+/).filter(c => SDOM.runCls.test(c)), yc = (y.getAttribute('class') || '').split(/\s+/).filter(Boolean);
    for (const c of add) if (!yc.includes(c)) yc.push(c); y.setAttribute('class', yc.join(' ')); }
  for (const a of SDOM.runAttr){ const v = x.getAttribute(a); if (v != null && !y.hasAttribute(a)) y.setAttribute(a, v); }   // (v286) the bag's rarity frames (gearrar270.js) stay on: dropping them flashed every cell
  const xs = x.style; if (!xs || !xs.length) return;
  for (const k of SDOM.runCss){ const v = xs.getPropertyValue(k); if (v && !y.style.getPropertyValue(k)) y.style.setProperty(k, v, xs.getPropertyPriority(k)); }
}
/* (v286) item cells are matched by the item they hold, not by position: a new item in the bag used to shift every
   later cell, and each of those had its picture rebuilt (a blink across the whole bag). Now the existing cell moves. */
const SDOM_KEY = n => n.nodeType === 1 ? (n.getAttribute('data-bagsel') || n.getAttribute('data-mksel') || n.getAttribute('data-tsel') || n.getAttribute('data-sksel') || null) : null;
function sdomKeyed(a, b){
  const ac = [...a.childNodes], bc = [...b.childNodes]; if (bc.length < 2) return;
  const have = new Map(); for (const n of ac){ const k = SDOM_KEY(n); if (k != null && !have.has(k)) have.set(k, n); } if (have.size < 2) return;
  for (let i = 0; i < bc.length; i++){ const k = SDOM_KEY(bc[i]), at = a.childNodes[i]; if (k == null) continue; const e = have.get(k);
    if (!e){ a.insertBefore(bc[i].cloneNode(true), at || null); continue; }   // a new item: its own cell goes in here, so the cells after it keep their places
    have.delete(k); if (at !== e) a.insertBefore(e, at || null); }
}
function sdomKids(a, b){
  sdomKeyed(a, b);
  const deco = n => n.nodeType === 1 && n.nodeName === 'GR-X';   // (v286) the rarity frame's rays and gems (gearrar270.js) are added after a draw: matching them against the fresh copy rebuilt the item picture and restarted the rays every redraw
  const ac = [...a.childNodes].filter(n => !deco(n)), bc = [...b.childNodes].filter(n => !deco(n));
  for (let i = 0; i < bc.length; i++){ if (i < ac.length) sdomNode(ac[i], bc[i]); else a.appendChild(bc[i]); }
  for (let i = bc.length; i < ac.length; i++) if (!(ac[i].nodeType === 1 && ac[i].matches(SDOM.keep))) ac[i].remove();
}
function sdomMorph(el0, html){ const t = document.createElement('template'); t.innerHTML = html; sdomKids(el0, t.content); SDOM.n++; }
{ const d = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  if (d && d.set) Object.defineProperty(Element.prototype, 'innerHTML', {configurable:true, enumerable:d.enumerable, get:d.get,
    set(v){ if (SDOM.on && this.isConnected && this.firstChild && this.nodeType === 1 && !sdomField(this) && this.closest && this.closest(SDOM.sel)){
        try { sdomMorph(this, String(v)); return; } catch (e) {} }
      d.set.call(this, v); }}); }
