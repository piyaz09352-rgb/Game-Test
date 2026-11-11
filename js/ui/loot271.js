/* VAYRATHEN — js/ui/loot271.js — (v271) a good drop shows it, on the ground and in the log
   · On the ground a material of a higher tier (itemart270.js: a boss's = ตำนาน, Lv 150+ = ล้ำค่า, Lv 70+ = หายาก)
     stands in a pillar of light in its tier's colour, the way rare gear already did.
   · Picking something up: the line in the System chat and the words over your head take the item's tier colour
     (blue หายาก · violet ล้ำค่า · gold ตำนาน), for gear and materials alike. */
'use strict';
const lt271Tier = id => { const it = ITEMS[id]; if (!it) return 0; if (it.kind === 'etc' || it.kind === 'mat') return typeof ia270Tier === 'function' ? ia270Tier(id) : 0; return it.rar || 0; };
const LT271_COL = ['', '#5ab4ff', '#c77dff', '#ffb830'];
{ const _d = drawLootW; drawLootW = function(g, l){ const it = l && ITEMS[l.id]; if (!it || it.rar || (it.kind !== 'etc' && it.kind !== 'mat')) return _d.apply(this, arguments);
    const t = lt271Tier(l.id); if (!t) return _d.apply(this, arguments);
    it.rar = t; try { return _d.apply(this, arguments); } finally { delete it.rar; } }; }   // the pillar is drawn from it.rar, only for this one draw
{ const _p = pickLoot; pickLoot = function(l){ const t = l && LOOT.includes(l) ? lt271Tier(l.id) : 0; if (!t) return _p.apply(this, arguments);
    const _log = log, _at = addText;
    log = function(s, cls){ return _log.call(this, s, cls || 'rar' + t); };
    addText = function(x, y, s, col, ...a){ return _at.call(this, x, y, s, LT271_COL[t], ...a); };
    try { return _p.apply(this, arguments); } finally { log = _log; addText = _at; } }; }
{ const st = document.createElement('style'); st.textContent = `
html body .sc-rar1,html body #ui .sc-rar1{color:#1f7fd6 !important;font-weight:700}
html body .sc-rar2,html body #ui .sc-rar2{color:#8a3fd6 !important;font-weight:700}
html body .sc-rar3,html body #ui .sc-rar3{color:#c86a00 !important;font-weight:800;text-shadow:0 0 6px rgba(255,190,60,.55)}`;
  document.head.appendChild(st); }
