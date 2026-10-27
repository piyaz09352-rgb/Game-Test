/* VAYRATHEN — js/sys/mkplus.js — (v86) player market: sort and price guide
   · Buy tab: sort by newest, cheapest or dearest (by price per piece).
   · Sell tab: shows the cheapest price per piece other players ask for the same item right now, so a price is easy to set.
   Works on the listings already loaded; nothing extra is fetched. */
'use strict';

MK.sort = 'new';
const mkUnit = r => (r.p || 0) / Math.max(1, r.n | 0);
const mkSame = (a, b) => a === b || (ITEMS[a] && ITEMS[b] && (ITEMS[a].base || a) === (ITEMS[b].base || b));
{ const _mr = WIN_RENDER.market; WIN_RENDER.market = function(){
    const keep = MK.rows;
    if (MK.tab === 'buy' && MK.sort !== 'new') MK.rows = keep.slice().sort((a, b) => MK.sort === 'low' ? mkUnit(a) - mkUnit(b) : mkUnit(b) - mkUnit(a));
    try { _mr.apply(this, arguments); } finally { MK.rows = keep; }
    const pane = el('pane-market'); if (!pane) return;
    if (MK.tab === 'buy'){ const q = pane.querySelector('label.wkq'); if (q) q.insertAdjacentHTML('afterend', `<div class="cslots mksort">${[['new', 'ล่าสุด', 'Newest'], ['low', 'ถูกสุด', 'Cheapest'], ['high', 'แพงสุด', 'Dearest']].map(([k, th, en]) => `<button class="${MK.sort === k ? 'on' : ''}" data-mksort="${k}">${L(th, en)}</button>`).join('')}</div>`); }
    if (MK.tab === 'sell' && MK.sel){ const h = pane.querySelector('.mksell small.hint'); if (!h) return;
      const same = MK.rows.filter(r => !r.sold && r.s !== NET.uid && mkSame(r.i, MK.sel));
      const s = document.createElement('span'); s.className = 'mkguide';
      s.textContent = same.length ? ' · ' + L(`ราคาต่ำสุดในตลาดตอนนี้ ${fmtN(Math.ceil(Math.min(...same.map(mkUnit))))} ต่อชิ้น (${same.length} รายการ)`, `Cheapest now: ${fmtN(Math.ceil(Math.min(...same.map(mkUnit))))} each (${same.length} listed)`) : ' · ' + L('ยังไม่มีใครขายชิ้นนี้', 'Nobody sells this yet');
      h.appendChild(s); }
  }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-mksort]'); if (!b) return; MK.sort = b.dataset.mksort; WIN_RENDER.market(); });
