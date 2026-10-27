/* VAYRATHEN — js/sys/bagsub.js — (v115) the bag, a bigger grid, and weapons sorted by kind
   · The Equipment tab gets a row of chips under the search box: ทั้งหมด, then one chip per kind of weapon in the bag
     (ดาบ · ดาบสองมือ · มีดสั้น · มีดคู่ · คทา · ไม้เท้ายาว · สนับมือ · ธนู) and one per other slot (หมวก, เสื้อ, …).
     Only kinds you actually carry are shown, each with how many.
   · The grid's squares are twice as big as before (84 px minimum instead of 42), with the icon filling them. */
'use strict';

const BAG_SUB = [
  ['sword1', 'ดาบ', 'Swords'], ['sword2', 'ดาบสองมือ', 'Greatswords'], ['dagger1', 'มีดสั้น', 'Daggers'], ['dagger2', 'มีดคู่', 'Twin daggers'],
  ['staff1', 'คทา', 'Rods'], ['staff2', 'ไม้เท้ายาว', 'Long staves'], ['fist', 'สนับมือ', 'Knuckles'], ['bow', 'ธนู', 'Bows'], ['weapon', 'อาวุธอื่น', 'Other weapons'],
  ['shield', 'โล่', 'Shields'], ['head', 'หมวก', 'Head'], ['armor', 'เสื้อ', 'Body'], ['pants', 'กางเกง', 'Legs'], ['shoes', 'รองเท้า', 'Feet'], ['acc', 'เครื่องประดับ', 'Accessories'], ['ammo', 'ลูกธนู', 'Arrows']];
/* which chip an item belongs to */
function bagSubOf(id){
  const it = ITEMS[id]; if (!it) return null;
  if (it.kind === 'ammo') return 'ammo';
  if (it.kind !== 'gear') return null;
  if (it.slot !== 'weapon') return it.slot;
  const b = typeof hdBase === 'function' ? hdBase(id) || it : it, wt = it.wtype || (it.st && it.st.wtype) || b.wtype || (b.st && b.st.wtype);
  const h = (it.st && it.st.hands) || (typeof handsRule === 'function' && wt ? handsRule(wt, `${b.name || ''} ${b.en || ''}`) : '1h');
  if (wt === 'fist' || wt === 'bow') return wt;
  if (wt === 'sword' || wt === 'dagger' || wt === 'staff') return wt + (h === '2h' ? '2' : '1');
  return 'weapon';
}
BAG.sub = '';
/* it replaces the older, coarser slot row (bagplus.js: อาวุธ · หมวก · เกราะ …): that row is hidden and left on "all" */
BAG.slot = 'all';
{ const _be = bagEntries;
  bagEntries = function(){ const r = _be.apply(this, arguments); return BAG.tab === 'gear' && BAG.sub ? r.filter(e => bagSubOf(e.id) === BAG.sub) : r; }; }
{ const _bd = bagDraw;
  bagDraw = function(){
    const tool = document.querySelector('#pane-bag .bagtool'); let row = el('bagSub');
    if (tool && !row){ tool.insertAdjacentHTML('afterend', '<div class="bagsub" id="bagSub"></div>'); row = el('bagSub'); }
    if (row){
      if (BAG.tab !== 'gear'){ row.hidden = true; }
      else {
        const n = {}; for (const id of Object.keys(S.inv)) if (S.inv[id] > 0){ const k = bagSubOf(id); if (k) n[k] = (n[k] || 0) + 1; }
        if (BAG.sub && !n[BAG.sub]) BAG.sub = '';
        const all = Object.values(n).reduce((a, b) => a + b, 0);
        row.hidden = false;
        row.innerHTML = `<button class="bsub${BAG.sub ? '' : ' on'}" data-bagsub="">${L('ทั้งหมด', 'All')} <i>${all}</i></button>`
          + BAG_SUB.filter(([k]) => n[k]).map(([k, th, en]) => `<button class="bsub${BAG.sub === k ? ' on' : ''}" data-bagsub="${k}">${L(th, en)} <i>${n[k]}</i></button>`).join('');
      }
    }
    BAG.slot = 'all'; return _bd.apply(this, arguments);
  }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bagsub]'); if (!b) return; BAG.sub = b.dataset.bagsub; BAG.sel = null; bagDraw(); });
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-bagtab]')) BAG.sub = ''; }, true);

{ const st = document.createElement('style');
  st.textContent = `
.bagsub ~ #bagSlotBar,#bagSlotBar{display:none!important}
.bagsub{display:flex;flex-wrap:wrap;gap:5px;margin:2px 0 6px}
.bagsub .bsub{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;min-height:30px;border-radius:999px;border:1.5px solid #e3c88a;background:#fffaf0;color:#5a3a12;font:600 13px var(--thai, Sarabun, sans-serif);cursor:pointer}
.bagsub .bsub i{font-style:normal;font-size:11px;color:#9a7a4a}
.bagsub .bsub.on{background:linear-gradient(#ffe6a0,#f7c85a);border-color:#c8902e;color:#3a2206}
/* twice as big squares */
html body #ui.ui .baggrid.grid,html body #ui.ui .invcombo #pane-bag .baggrid.grid{grid-template-columns:repeat(auto-fill,minmax(84px,1fr))!important;gap:8px!important}
html body #ui.ui .baggrid.grid .bslot{min-height:84px;aspect-ratio:1/1}
html body #ui.ui .baggrid.grid .bslot svg:first-of-type,html body #ui.ui .baggrid.grid .bslot .sico{width:72%!important;height:72%!important}`;
  document.head.appendChild(st); }
