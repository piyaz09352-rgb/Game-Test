/* VAYRATHEN — js/sys/bag100.js — (v159) a bag of 100 slots, and squares that line up
   · The bag holds 100 slots. Every piece of gear takes one slot; a stack of potions, arrows, monster loot or
     materials takes one slot however many it holds. Worn gear, cards, costumes, pets and key items do not count.
   · When the bag is full, a new kind of item stays on the ground (a stack you already carry still grows), and shops
     will not sell you a new kind until a slot is free. Nothing already in the bag is ever lost: a bag that holds more
     than 100 from before keeps it all; it just takes nothing new until it is back under 100.
   · The bag shows the count (ช่อง 37 / 100) and the grid is exactly 100 squares, every square the same size with its
     picture in the middle and the amount in the corner. */
'use strict';

/* (v166) the bag starts at 150 slots; more are bought 10 at a time with Vayra Coins, each lot dearer than the last
   (50, 65, 85, 110 … coins, ×1.3 each time) up to 350 slots. The extra slots belong to the hero (S.bagX). */
const BAGX = {base:150, step:10, max:20, price:n => Math.round(50 * Math.pow(1.3, n) / 5) * 5};
const bagCap = () => BAGX.base + BAGX.step * Math.min(BAGX.max, (S && S.bagX) | 0);
function bagBuy(){
  const n = (S.bagX | 0), fee = BAGX.price(n), have = (typeof ACC !== 'undefined' && ACC.coins) || 0;
  if (n >= BAGX.max){ toast(L('กระเป๋าขยายเต็มที่แล้ว', 'The bag is as big as it gets')); return; }
  if (have < fee){ toast(L(`ต้องใช้ ${fmtN(fee)} เหรียญวายรา (มี ${fmtN(have)})`, `Needs ${fmtN(fee)} Vayra Coins (you have ${fmtN(have)})`)); return; }
  sysPrompt(L(`ขยายกระเป๋า +${BAGX.step} ช่อง (${bagCap()} → ${bagCap() + BAGX.step}) ราคา ${fmtN(fee)} เหรียญวายรา?`, `Add ${BAGX.step} bag slots (${bagCap()} → ${bagCap() + BAGX.step}) for ${fmtN(fee)} Vayra Coins?`), () => {
    if (((ACC && ACC.coins) || 0) < fee || (S.bagX | 0) !== n) return;
    ACC.coins -= fee; if (typeof accSave === 'function') accSave(); S.bagX = n + 1; save();
    log(L(`ขยายกระเป๋าเป็น ${bagCap()} ช่อง`, `Bag enlarged to ${bagCap()} slots`), 'g'); if (typeof bagDraw === 'function') bagDraw(); });
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bagx]'); if (!b) return; e.stopPropagation(); bagBuy(); }, true);
const bagCounts = id => { const it = ITEMS[id]; return !!it && it.kind !== 'key' && id !== 'shard'; };
function bagUsed(){
  const worn = new Set(Object.values((S && S.gear) || {})); let n = 0;
  for (const k in S.inv) if (S.inv[k] > 0 && bagCounts(k) && !worn.has(k)) n++;
  return n;
}
/* would this item need a new slot, and is there one? */
const bagFits = id => !bagCounts(id) || (S.inv[id] > 0 && !(ITEMS[id] && ITEMS[id].kind === 'gear' && ITEMS[id].base)) || bagUsed() < bagCap();
const BAGF = {t:0};
function bagFullToast(){ if (performance.now() - BAGF.t < 2500) return; BAGF.t = performance.now(); toast(L(`กระเป๋าเต็ม (${bagUsed()}/${bagCap()} ช่อง) · ของใหม่จะค้างอยู่บนพื้น`, `Bag full (${bagUsed()}/${bagCap()} slots) · new items stay on the ground`)); }

/* ground drops: a new kind does not go in when the bag is full */
{ const _p = pickLoot;
  pickLoot = function(l){ if (l && !bagFits(l.id)){ l.nofit = true; if (P.loot === l) P.loot = null; bagFullToast(); return; } return _p.apply(this, arguments); }; }
/* the walk-to-pick-up and the helper animal pass over what cannot fit */
{ const _n = nearestLoot; nearestLoot = function(r){ const keep = LOOT.filter(l => !bagFits(l.id)); if (!keep.length) return _n.apply(this, arguments);
    const save = LOOT.splice(0), ok = save.filter(l => bagFits(l.id)); LOOT.push(...ok); try { return _n.apply(this, arguments); } finally { LOOT.length = 0; LOOT.push(...save); } }; }
if (typeof helperScore === 'function'){ const _h = helperScore; helperScore = function(id){ return bagFits(id) ? _h.apply(this, arguments) : -1e9; }; }
/* shops: no new kind when full */
{ const _q = qtyBuy; qtyBuy = function(id){ if (!bagFits(id)){ bagFullToast(); return; } return _q.apply(this, arguments); }; }
if (typeof fgBuy === 'function'){ const _f = fgBuy; fgBuy = function(id){ const gr = typeof GEAR !== 'undefined' && GEAR[id]; if ((gr && gr.slot !== 'ammo' ? bagUsed() >= bagCap() : !bagFits(id))){ bagFullToast(); return; } return _f.apply(this, arguments); }; }

/* the bag window: the count, and a 10 × 10 grid of equal squares */
{ const _bd = bagDraw;
  bagDraw = function(){ const r = _bd.apply(this, arguments); const foot = el('bagFoot'), used = bagUsed();
    if (foot){ const cap = bagCap(), full = used >= cap, n = (S.bagX | 0); foot.innerHTML = `<span class="bcap${full ? ' full' : ''}">${L('ช่อง', 'Slots')} <b>${used}</b> / ${cap}</span>${n < BAGX.max ? ` <button class="btn sm bagx" data-bagx="1" title="${L('ซื้อช่องเพิ่มด้วยเหรียญวายรา', 'Buy more slots with Vayra Coins')}">+${BAGX.step} ◈ ${fmtN(BAGX.price(n))}</button>` : ''}${full ? ` <small class="bcapw">${L('เต็มแล้ว · ขายหรือฝากคลังเพื่อเก็บของใหม่', 'Full · sell or bank items to pick up more')}</small>` : ''}`; }
    const grid = el('bagGrid');
    if (grid && grid.classList.contains('grid')){
      const filled = grid.querySelectorAll('.bslot:not(.empty)').length, want = BAG.tab === 'all' && !BAG.q ? Math.max(bagCap(), filled) : Math.max(40, filled);
      const empties = [...grid.querySelectorAll('.bslot.empty')], have = filled + empties.length;
      if (have > want) empties.slice(0, have - want).forEach(e => e.remove());
      else if (have < want) grid.insertAdjacentHTML('beforeend', '<span class="bslot empty"></span>'.repeat(want - have)); }
    return r; }; }
{ const st = document.createElement('style');
  st.textContent = `
html body #ui.ui .baggrid.grid,html body #ui.ui .invcombo #pane-bag .baggrid.grid,html body #ui.ui #win-equip #pane-bag .baggrid.grid{display:grid !important;grid-template-columns:repeat(auto-fill,minmax(68px,1fr)) !important;grid-auto-rows:auto !important;gap:6px !important;align-content:start !important}
html body #ui.ui .baggrid.grid .bslot{aspect-ratio:1/1 !important;min-height:auto !important;height:auto !important;width:100% !important;padding:0 !important;margin:0 !important;
  display:flex !important;align-items:center !important;justify-content:center !important;box-sizing:border-box}
html body #ui.ui .baggrid.grid .bslot > svg:first-of-type,html body #ui.ui .baggrid.grid .bslot > .sico{width:78% !important;height:78% !important;margin:0 !important;position:static !important;flex:none}
html body #ui.ui .baggrid.grid .bslot > em{position:absolute !important;right:4px !important;bottom:2px !important;font-size:11px !important;line-height:1}
html body #ui.ui .baggrid.grid .bslot > .bE{position:absolute !important;left:3px !important;top:3px !important}
html body #ui.ui .baggrid.grid .bslot > .tcard.mini{position:absolute;inset:8%}
html body #ui.ui .baggrid.grid .bslot:hover:not(.empty){transform:none !important}
html body #ui.ui .baggrid.grid .bslot.sel{animation:none !important}
#bagFoot .bcap{font-weight:700}#bagFoot .bcap b{color:#1f7a4a}#bagFoot .bcap.full b{color:#c0392b}#bagFoot .bcapw{color:#c0392b;font-weight:600}#bagFoot .bagx{margin-left:8px;padding:2px 10px;font-size:12px}`;
  document.head.appendChild(st); }
