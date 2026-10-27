/* VAYRATHEN — js/sys/textoutline.js — white text always has a black edge (v28)
   White letters on light grass, sky or gold panels were hard to read. Now:
   · Menus and windows: any element whose own text is white (or almost white) gets a thin black outline
     (class .wout). New windows, rows and buttons are checked as they appear.
   · The game canvas: white text drawn with fillText gets a black stroke under it first (names, labels, numbers). */
'use strict';

{ const st = document.createElement('style');
  st.textContent = `.wout{text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0 -1px 0 #000,0 1px 0 #000,-1px 0 0 #000,1px 0 0 #000!important}`;
  document.head.appendChild(st); }

/* "white" = every channel 225 or more, and not see-through */
function toWhite(c){
  const m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/.exec(c || ''); if (!m) return false;
  return +m[1] >= 225 && +m[2] >= 225 && +m[3] >= 225 && (m[4] == null || +m[4] >= .5);
}
const toOwnText = e => { for (const n of e.childNodes) if (n.nodeType === 3 && n.nodeValue.trim()) return true; return false; };
/* (v91) read every colour first, then change only the classes that differ: flipping a class between two colour
   reads made the browser restyle the page once per element (a big window took 170 ms to mark, the 6 s sweep ~20 ms) */
function toWant(e){
  if (!e || e.nodeType !== 1 || e.tagName === 'CANVAS' || e.tagName === 'SCRIPT' || e.tagName === 'STYLE') return null;
  if (!toOwnText(e) && e.tagName !== 'INPUT' && e.tagName !== 'BUTTON') return false;
  try { return toWhite(getComputedStyle(e).color); } catch (err) { return false; }
}
function toApply(list){
  const want = list.map(toWant);
  for (let i = 0; i < list.length; i++){ const w = want[i]; if (w === null) continue; if (list[i].classList.contains('wout') !== w) list[i].classList.toggle('wout', w); }
}
const toMark = e => toApply([e]);
const TO = {q:new Set(), on:false, all:true};
function toRun(){
  TO.on = false;
  if (TO.all){ TO.all = false; toApply([...document.body.querySelectorAll('*')].filter(e => !e.closest('[hidden]'))); TO.q.clear(); return; }   // closed windows wait until they open (they are checked as they appear)
  const list = [];
  for (const e of TO.q){ TO.q.delete(e); if (!e.isConnected) continue; list.push(e); if (e.querySelectorAll) for (const c of e.querySelectorAll('*')){ list.push(c); if (list.length > 4000) break; } if (list.length > 4000){ TO.on = true; requestAnimationFrame(toRun); break; } }
  toApply(list);
}
const toPush = e => { TO.q.add(e); if (!TO.on){ TO.on = true; requestAnimationFrame(toRun); } };
new MutationObserver(list => { for (const r of list){
  if (r.type === 'childList'){ for (const n of r.addedNodes) toPush(n.nodeType === 1 ? n : r.target); }
  else if (r.type === 'characterData'){ if (r.target.parentElement) toPush(r.target.parentElement); }
  else if (r.type === 'attributes'){   // skip our own class flips
    if (r.attributeName === 'class'){ const strip = v => String(v || '').replace(/\bwout\b/g, '').trim(); if (strip(r.oldValue) === strip(r.target.getAttribute('class'))) continue; }
    toPush(r.target); } } })
  .observe(document.body, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['class', 'style', 'hidden', 'disabled'], attributeOldValue:true});
/* colours that change with the theme, language or hover state: a slow full pass now and then */
setInterval(() => { TO.all = true; if (!TO.on){ TO.on = true; requestAnimationFrame(toRun); } }, 6000);
toPush(document.body);

/* ---------- the canvas: a black edge under white text ---------- */
{ const P2 = CanvasRenderingContext2D.prototype, _ft = P2.fillText, cache = new Map();
  const isW = s => { if (typeof s !== 'string') return false; let v = cache.get(s); if (v == null){
      const h = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
      if (h){ const x = h[1].length === 3 ? h[1].replace(/./g, c => c + c) : h[1]; v = parseInt(x.slice(0, 2), 16) >= 225 && parseInt(x.slice(2, 4), 16) >= 225 && parseInt(x.slice(4, 6), 16) >= 225; }
      else v = s === 'white' || toWhite(s);
      if (cache.size < 500) cache.set(s, v); } return v; };
  P2.fillText = function(t, x, y, mw){
    if (isW(this.fillStyle) && this.globalAlpha > .2){
      const lw = this.lineWidth, ss = this.strokeStyle, lj = this.lineJoin, px = +((/(\d+(?:\.\d+)?)px/.exec(this.font) || [])[1] || 12);
      this.lineWidth = Math.max(2, px * .2); this.strokeStyle = 'rgba(0,0,0,.9)'; this.lineJoin = 'round';
      mw === undefined ? this.strokeText(t, x, y) : this.strokeText(t, x, y, mw);
      this.lineWidth = lw; this.strokeStyle = ss; this.lineJoin = lj; }
    return mw === undefined ? _ft.call(this, t, x, y) : _ft.call(this, t, x, y, mw);
  }; }
