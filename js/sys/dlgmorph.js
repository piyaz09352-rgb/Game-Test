/* VAYRATHEN — js/sys/dlgmorph.js — the NPC window updates in place instead of being rebuilt (v58)
   Why cooking and refining blinked: every change to the bag or the money (one dish cooked, one refine) redrew the
   whole NPC window from scratch (renderPanel → openNpc → npcFrame). For one frame the new rows were the old pale
   dark-theme colours until sunread darkened them again, the list jumped back to the top and the portrait canvas was
   wiped and redrawn: that is the blink.
   Now, while the window is open, a redraw is compared with what is on screen and only the text and attributes that
   really changed are touched. Rows, scroll position, portrait and colours stay as they are. Text boxes and dropdowns
   are swapped whole (their code may hang listeners on them). A changed part is re-checked by sunread before paint. */
'use strict';

{
  const d = document.getElementById('dialog');
  const desc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  const SRC = new WeakMap();   // the attributes each element was drawn with (sunread adds its own on top)
  const FORM = /^(INPUT|SELECT|TEXTAREA)$/;
  const changed = [];
  const srcOf = e => { let m = SRC.get(e); if (!m){ m = {}; for (const a of e.attributes) m[a.name] = a.value; SRC.set(e, m); } return m; };
  const keep = e => e.nodeType === 1 && e.classList.contains('dlg-grip');
  function attrs(o, n){
    const was = srcOf(o), now = {}; let diff = false;
    for (const a of n.attributes){ now[a.name] = a.value; if (was[a.name] !== a.value){ o.setAttribute(a.name, a.value); diff = true; } }
    for (const k of Object.keys(was)) if (!(k in now)){ o.removeAttribute(k); diff = true; }
    if (diff){ SRC.set(o, now); changed.push(o); }
  }
  function same(o, n){ return o.nodeType === n.nodeType && o.nodeName === n.nodeName && !(o.nodeType === 1 && FORM.test(o.nodeName)); }
  function morph(o, n){
    if (o.nodeType === 3 || o.nodeType === 8){ if (o.nodeValue !== n.nodeValue){ o.nodeValue = n.nodeValue; if (o.parentElement) changed.push(o.parentElement); } return; }
    attrs(o, n); kids(o, n);
  }
  function kids(op, np){
    const old = [...op.childNodes].filter(x => !keep(x)), nw = [...np.childNodes];
    let i = 0;
    for (; i < nw.length; i++){
      const o = old[i], n = nw[i];
      if (o && same(o, n)) morph(o, n);
      else { const c = document.importNode(n, true); if (o) op.replaceChild(c, o); else { const g = op.querySelector(':scope > .dlg-grip'); op.insertBefore(c, g); } changed.push(c); }
    }
    for (; i < old.length; i++) old[i].remove();
  }
  if (d && desc && desc.set){
    Object.defineProperty(d, 'innerHTML', {configurable:true, get(){ return desc.get.call(this); }, set(v){
      if (this.hidden || !this.firstElementChild){ desc.set.call(this, v); return; }   // a fresh open: draw it normally
      const t = document.createElement('template'); t.innerHTML = v; changed.length = 0;
      kids(this, t.content);
      if (changed.length && typeof srCheck === 'function') for (const e of new Set(changed)) if (e.isConnected) srCheck(e);
    }});
  }
}
