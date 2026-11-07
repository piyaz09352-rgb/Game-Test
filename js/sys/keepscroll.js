/* VAYRATHEN — js/sys/keepscroll.js — (v192) a list stays where you scrolled it
   Buying, selling, ticking a box or any button that redraws a window used to throw its list back up, so the owner had
   to scroll down again after every purchase. Windows redraw by replacing their HTML: new list elements start at the
   top, and a list redrawn in steps (the potion shop draws a short version first) gets its position cut to the short
   length. This remembers where YOU scrolled each list (inside the HUD and the NPC window) and, whenever the HTML
   around it is replaced, puts the list of the same name back there, again on the next frames until it is long enough. */
'use strict';
const KSC = {seen:new Set(), want:new WeakMap(), quiet:new WeakMap()};
document.addEventListener('scroll', e => { const t = e.target; if (!t || t.nodeType !== 1) return;
  if (performance.now() < (KSC.quiet.get(t) || 0)) return;   // our own restore, not the player
  KSC.want.set(t, t.scrollTop); if (t.scrollTop > 0) KSC.seen.add(t); }, {capture:true, passive:true});
/* a name for a list, relative to the element being redrawn: itself, its id, or its classes and which one it is */
function kscKey(root, n){ if (n === root) return {self:1}; if (n.id) return {id:n.id};
  const cls = [...n.classList].filter(c => /^[a-zA-Z][\w-]*$/.test(c)); if (!cls.length) return null;
  const sel = '.' + cls.join('.'), i = [...root.querySelectorAll(sel)].indexOf(n); return i < 0 ? null : {sel, i}; }
function kscFind(root, k){ if (k.self) return root; if (k.id) return root.querySelector('#' + CSS.escape(k.id)); return root.querySelectorAll(k.sel)[k.i] || null; }
function kscPut(n, top, left, tries = 12){
  KSC.quiet.set(n, performance.now() + 500); KSC.want.set(n, top); KSC.seen.add(n);
  n.scrollTop = top; n.scrollLeft = left;
  if (Math.abs(n.scrollTop - top) > 1 && tries > 0) requestAnimationFrame(() => { if (n.isConnected && KSC.want.get(n) === top) kscPut(n, top, left, tries - 1); });
}
{ const d = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  Object.defineProperty(Element.prototype, 'innerHTML', {configurable:true, enumerable:d.enumerable, get(){ return d.get.call(this); }, set(v){
    let keep = null;
    if (KSC.seen.size && this.isConnected && this.closest && this.closest('#ui,#dialog')){
      for (const n of KSC.seen){ if (!n.isConnected){ KSC.seen.delete(n); continue; }
        const top = KSC.want.has(n) ? KSC.want.get(n) : n.scrollTop; if (!top) continue;
        if (n === this || this.contains(n)){ const k = kscKey(this, n); if (k) (keep = keep || []).push([k, top, n.scrollLeft]); } } }
    d.set.call(this, v);
    if (keep) for (const [k, top, left] of keep){ const n = kscFind(this, k); if (n) kscPut(n, top, left); }
  }}); }
/* a window or the NPC box that closes forgets its lists: the next shop (or the same one opened again) starts at the top */
new MutationObserver(ms => { for (const m of ms){ const t = m.target; if (!t.hidden) continue;
    for (const n of KSC.seen) if (t === n || t.contains(n)){ KSC.seen.delete(n); KSC.want.delete(n); } } })
  .observe(document.body, {subtree:true, attributes:true, attributeFilter:['hidden']});
