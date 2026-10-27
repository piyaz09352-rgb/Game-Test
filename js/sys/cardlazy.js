/* VAYRATHEN — js/sys/cardlazy.js — (v160) the card tab opens at once
   Each card shows its monster, drawn from the 3D model the first time it is needed (about 17 ms a card). The bag's
   card tab drew every card you own before showing anything, so a big collection froze the game for seconds (619
   cards ≈ 11 s). Now a card is shown at once with an empty picture, and the pictures are drawn a few at a time
   between frames (at least three a slice) — the cards on screen first, then the rest — so the tab opens immediately and fills in within
   moments. A picture drawn once is kept, as before. */
'use strict';

const CLZ = {ph:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', q:new Set(), busy:false, vis:new Set(), io:null};
{ const _ca = cardArt;
  cardArt = function(id){
    if (CARD_ART[id] !== undefined || CLZ.sync) return _ca.apply(this, arguments);
    CLZ.q.add(id); clzKick(); return `${CLZ.ph}#ca:${id}`;   // a see-through pixel until the picture is ready
  };
  /* draw queued pictures in small slices: visible ones first, at most ~8 ms of work per slice */
  function clzStep(){
    CLZ.busy = false; if (!CLZ.q.size) return;
    clzScan();
    const order = [...CLZ.q].sort((a, b) => (CLZ.vis.has(b) ? 1 : 0) - (CLZ.vis.has(a) ? 1 : 0)), t0 = performance.now();
    let n = 0;
    for (const id of order){
      if (n >= 3 && performance.now() - t0 > 12) break; n++;
      CLZ.q.delete(id); const url = _ca(id);
      document.querySelectorAll(`img[src="${CLZ.ph}#ca:${CSS.escape(id)}"]`).forEach(im => { if (url) im.src = url; else im.remove(); });
    }
    if (CLZ.q.size) clzKick();
  }
  function clzKick(){ if (CLZ.busy) return; CLZ.busy = true; setTimeout(clzStep, 0); }
  /* which waiting pictures are on screen right now */
  function clzScan(){
    if (!CLZ.io && typeof IntersectionObserver !== 'undefined') CLZ.io = new IntersectionObserver(list => { for (const e of list){ const id = (e.target.getAttribute('src') || '').split('#ca:')[1]; if (!id) continue; if (e.isIntersecting) CLZ.vis.add(id); else CLZ.vis.delete(id); } });
    if (!CLZ.io) return;
    document.querySelectorAll(`img[src^="${CLZ.ph}#ca:"]`).forEach(im => { if (!im._clz){ im._clz = 1; CLZ.io.observe(im); } });
  }
}
