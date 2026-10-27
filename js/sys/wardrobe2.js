/* VAYRATHEN — js/sys/wardrobe2.js — the wardrobe, tidied
   One long list of every costume made the window jump around. Now the pieces sit under six tabs
   (ชุด · ศีรษะ · ปีก · รองเท้า · พาหนะ/สัตว์), only one tab shows at a time, the list scrolls on its own
   while the character stays put, and the scroll position is kept when you try something on. */
'use strict';

const WR_GRP = [['top', 'ชุด', 'Outfits', ['top']], ['head', 'ศีรษะ', 'Head', ['head']], ['wing', 'ปีก', 'Wings', ['wing']],
  ['gear', 'รองเท้า', 'Feet', ['shoes']], ['ride', 'พาหนะ · สัตว์', 'Mounts · Pets', ['mount', 'pet']]];
const wrSlot = id => (typeof WINGS !== 'undefined' && WINGS[id] ? 'wing' : typeof XCOS !== 'undefined' && XCOS[id] ? XCOS[id].slot : COSTUME[id] ? COSTUME[id].slot : '');
const wrGrpOf = id => { const s = wrSlot(id), g = WR_GRP.find(x => x[3].includes(s)); return g ? g[0] : 'top'; };
const WR = {grp:null, top:{}};
{ const _rw = renderWardrobe;
  renderWardrobe = function(){
    const old = document.querySelector('#pane-equip .cosgrid'); if (old && WR.grp) WR.top[WR.grp] = old.scrollTop;
    _rw.apply(this, arguments);
    const grid = document.querySelector('#pane-equip .cosgrid'); if (!grid) return;
    if (!WR.grp) WR.grp = EQ.try && wrSlot(EQ.try) ? wrGrpOf(EQ.try) : 'top';
    grid.querySelectorAll('.cosbanner, :scope > p.hint').forEach(e => e.remove());
    const have = new Set();
    grid.querySelectorAll(':scope > .sec').forEach(sec => { const list = sec.nextElementSibling; if (!list || !list.classList.contains('coslist')) return;
      const first = list.querySelector('[data-costry]'); const g = first ? wrGrpOf(first.dataset.costry) : 'top'; have.add(g);
      sec.dataset.grp = g; list.dataset.grp = g; if (g !== WR.grp){ sec.hidden = true; list.hidden = true; } });
    const tabs = WR_GRP.filter(g => have.has(g[0])).map(g => `<button class="${g[0] === WR.grp ? 'on' : ''}" data-wrgrp="${g[0]}">${L(g[1], g[2])}</button>`).join('');
    const box = document.createElement('div'); box.className = 'wrcol'; box.innerHTML = `<div class="wrtabs">${tabs}</div>`;
    grid.parentNode.insertBefore(box, grid); box.appendChild(grid);
    grid.scrollTop = WR.top[WR.grp] || 0;
  };
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-wrgrp]'); if (!b) return;
  const g = b.dataset.wrgrp; if (g === WR.grp) return; const grid = document.querySelector('#pane-equip .cosgrid'); if (grid) WR.top[WR.grp] = grid.scrollTop;
  WR.grp = g; renderWardrobe();
});
{ const st = document.createElement('style');
  st.textContent = `.cosw2{align-items:start}.cosw2 .eqstage{position:sticky;top:0}
  .wrcol{display:flex;flex-direction:column;min-width:0;gap:8px}
  .wrtabs{display:flex;flex-wrap:wrap;gap:6px}.wrtabs button{border:2px solid #9cc8f2;background:#fff;color:#1c3360;border-radius:14px;padding:4px 12px;font:600 13px Mali,sans-serif;cursor:pointer}
  .wrtabs button.on{background:#3d8fe0;border-color:#fff;color:#fff}
  .wrcol .cosgrid{max-height:calc(100dvh - 210px);overflow-y:auto;overscroll-behavior:contain;padding-right:4px}
  .wrcol .cosgrid > .sec:first-of-type{margin-top:0}`;
  document.head.appendChild(st); }
