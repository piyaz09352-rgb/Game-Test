/* VAYRATHEN — js/sys/nofl.js — (v159) no window blinks
   The NPC dialog already updated in place (dlgmorph.js), but the windows an NPC opens — the smith's refine / shop /
   sell-back window, the forger's crafting and salvage window, the bank, the tailor — still rebuilt their whole
   content on every tap. Pressing "เลือกตามเกรด" or "ล้างที่เลือก" (one tick box changes) wiped every icon, threw the
   list back to the top and replayed the entry animations: the blink players saw.
   · every window pane (.win .pane) now updates in place like the dialog: a redraw is compared with what is on screen
     and only the text and attributes that changed are touched; rows, icons and the scroll position stay put
   · no animation plays inside windows and NPC dialogs (no pop-in, no twinkle, no spinning rays, no pulsing glow) */
'use strict';

const NOFL = (() => {
  const desc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  const changed = [], FORM = /^(INPUT|SELECT|TEXTAREA)$/;
  /* the new drawing is fully built first (every add-on that patches a window after it draws has run), then, before
     the screen paints, it is merged into what was on screen: nodes of the same kind are kept and only their
     attributes and text are brought up to date; anything else is moved in from the new drawing as it is */
  const keepable = (o, n) => o.nodeType === n.nodeType && o.nodeName === n.nodeName && !(o.nodeType === 1 && (FORM.test(o.nodeName) || o.nodeName === 'CANVAS'));
  function attrs(o, n){
    let diff = false;
    for (const a of n.attributes) if (o.getAttribute(a.name) !== a.value){ o.setAttribute(a.name, a.value); diff = true; }
    for (const a of [...o.attributes]) if (!n.hasAttribute(a.name)){ o.removeAttribute(a.name); diff = true; }
    if (diff) changed.push(o);
  }
  function merge(o, n){
    if (o.nodeType === 3 || o.nodeType === 8){ if (o.nodeValue !== n.nodeValue){ o.nodeValue = n.nodeValue; if (o.parentElement) changed.push(o.parentElement); } return; }
    attrs(o, n); kids(o, [...n.childNodes]);
  }
  // a node is matched to the first unused one of the same kind and class, so a list that gains a line at the top or a
  // tab that adds a hint above the rows does not throw every row away
  const cls = x => (x.nodeType === 1 ? x.getAttribute('class') || '' : '#');
  function kids(op, nw){
    const old = [...op.childNodes], used = new Set();
    for (let i = 0; i < nw.length; i++){
      const n = nw[i], cur = op.childNodes[i] || null;
      let o = cur && !used.has(cur) && old.includes(cur) && keepable(cur, n) && cls(cur) === cls(n) ? cur : null;
      if (!o) o = old.find(x => !used.has(x) && keepable(x, n) && cls(x) === cls(n)) || null;
      if (!o && cur && !used.has(cur) && old.includes(cur) && keepable(cur, n)) o = cur;
      if (o){ used.add(o); if (o !== cur) op.insertBefore(o, cur); merge(o, n); }
      else { op.insertBefore(n, cur); changed.push(n); }
    }
    for (const x of old) if (!used.has(x)) x.remove();
  }
  const shown = e => { const w = e.closest('.win'); return !!e.firstElementChild && e.isConnected && (!w || !w.hidden); };
  function flush(e){
    const p = e._noflPend; e._noflPend = null; if (!p) return;
    const fresh = [...e.childNodes];
    for (const c of fresh) c.remove();
    e.appendChild(p.frag);                                   // what was on screen goes back in place
    for (const [x, t, l] of p.scroll) if (x.isConnected){ x.scrollTop = t; x.scrollLeft = l; }
    changed.length = 0; kids(e, fresh);
    for (const [x, t, l] of p.scroll) if (x.isConnected){ x.scrollTop = t; x.scrollLeft = l; }
    if (changed.length && typeof srCheck === 'function') for (const x of new Set(changed)) if (x.isConnected) srCheck(x);
  }
  function hook(e){
    if (!e || e._nofl || !desc || !desc.set) return; e._nofl = true;
    Object.defineProperty(e, 'innerHTML', {configurable:true, get(){ return desc.get.call(this); }, set(v){
      if (this._noflPend || !shown(this)){ desc.set.call(this, v); return; }   // closed, empty, or already waiting to merge
      const scroll = [];
      for (const x of [this, ...this.querySelectorAll('*')]) if (x.scrollTop || x.scrollLeft) scroll.push([x, x.scrollTop, x.scrollLeft]);
      const frag = document.createDocumentFragment(); while (this.firstChild) frag.appendChild(this.firstChild);
      this._noflPend = {frag, scroll: scroll.filter(s => s[0] !== this).concat(this.scrollTop || this.scrollLeft ? [[this, this.scrollTop, this.scrollLeft]] : [])};
      desc.set.call(this, v);
      queueMicrotask(() => flush(this));
    }});
  }
  const hookAll = () => document.querySelectorAll('.win .pane, [id^="pane-"]').forEach(hook);
  return {hook, hookAll, flush};
})();
NOFL.hookAll();
{ const _mk = mkWin; mkWin = function(){ const r = _mk.apply(this, arguments); NOFL.hookAll(); return r; }; }
addEventListener('load', () => NOFL.hookAll());
{ const st = document.createElement('style');
  st.textContent = `.win,.win *,#dialog,#dialog *,.dialog,.dialog *,#warpGrid,#warpGrid *{animation:none !important}`;
  document.head.appendChild(st); }
