/* VAYRATHEN — js/sys/bagplus.js — bag conveniences (v27)
   · Equipment tab: chips to show one wearing place at a time (weapon, left hand, head, armour, legs, feet, ears,
     eyes, face, mouth, accessories, arrows), each with how many you have.
   · The item detail panel has a ✕ to close it. */
'use strict';

BAG.slot = 'all';
const BAG_SLOTS = [['all', 'ทั้งหมด', 'All'], ['weapon', 'อาวุธ', 'Weapon'], ['head', 'หมวก', 'Head'], ['shield', 'โล่', 'Shield'], ['armor', 'เกราะ', 'Armour'], ['pants', 'กางเกง', 'Legs'],
  ['shoes', 'รองเท้า', 'Feet'], ['acc', 'เครื่องประดับ', 'Accessory'], ['ammo', 'ลูกธนู', 'Arrows']];
const bagSlotOf = id => { const it = ITEMS[id] || {}; return it.kind === 'ammo' ? 'ammo' : it.slot === 'acc2' ? 'acc' : it.slot; };
{ const _be = bagEntries;
  bagEntries = function(){ const r = _be.apply(this, arguments); if (BAG.tab !== 'gear' || BAG.slot === 'all') return r; return r.filter(e => !e.card && bagSlotOf(e.id) === BAG.slot); }; }
{ const _bd = bagDraw;
  bagDraw = function(){ const r = _bd.apply(this, arguments); const grid = el('bagGrid'); if (!grid) return r; let bar = el('bagSlotBar');
    if (!bar){ bar = document.createElement('div'); bar.id = 'bagSlotBar'; grid.parentNode.insertBefore(bar, grid); }
    if (BAG.tab !== 'gear'){ bar.hidden = true; return r; }
    const cnt = {}; for (const id in S.inv) if (S.inv[id] > 0 && ITEMS[id] && (ITEMS[id].kind === 'gear' || ITEMS[id].kind === 'ammo')){ const s = bagSlotOf(id); cnt[s] = (cnt[s] || 0) + 1; cnt.all = (cnt.all || 0) + 1; }
    bar.hidden = false; bar.innerHTML = BAG_SLOTS.filter(([k]) => k === 'all' || cnt[k] || BAG.slot === k).map(([k, th, en]) => `<button class="${BAG.slot === k ? 'on' : ''}" data-bagslot="${k}">${L(th, en)} <small>${cnt[k] || 0}</small></button>`).join('');
    return r; }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bagslot],[data-bagclose]'); if (!b) return; e.stopPropagation();
  if (b.dataset.bagslot){ BAG.slot = b.dataset.bagslot; BAG.sel = null; bagDraw(); bagInfo(); }
  else { BAG.sel = null; bagDraw(); bagInfo(); } }, true);
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-bagtab]'); if (t && t.dataset.bagtab !== 'gear') BAG.slot = 'all'; }, true);
/* ✕ on the detail panel */
{ const _bi = bagInfo;
  bagInfo = function(){ const r = _bi.apply(this, arguments); const box = el('bagInfo'); if (box && BAG.sel && !box.querySelector('[data-bagclose]')) box.insertAdjacentHTML('beforeend', `<button class="ibtn bagx" data-bagclose="1" aria-label="${L('ปิด', 'Close')}" title="${L('ปิด', 'Close')}">✕</button>`); return r; }; }
{ const st = document.createElement('style');
  st.textContent = `#bagSlotBar{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 6px}#bagSlotBar[hidden]{display:none}
  #bagSlotBar button{font:600 11px/1 var(--display,sans-serif);padding:4px 8px;border-radius:9px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.25);color:#e8f0ff;cursor:pointer}
  #bagSlotBar button small{opacity:.7;font-size:10px}#bagSlotBar button.on{background:#ffd34a;color:#3a2400;border-color:#fff}
  #bagInfo{position:relative}#bagInfo .bagx{position:absolute;right:4px;top:4px;width:24px;height:24px;font-size:12px;z-index:2}`;
  document.head.appendChild(st); }
