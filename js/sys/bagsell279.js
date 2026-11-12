/* VAYRATHEN — js/sys/bagsell279.js — (v279) sell straight from the bag, anywhere
   The owner: the bag could only sell new pick-ups automatically (ขายอัตโนมัติ); nothing already in it could be sold
   without walking to a shop. Now:
   · the item strip under the bag (and the item card on touch screens) has a «ขาย» button: one piece, or the whole
     stack with «ขายทั้งหมด»;
   · «💰 ขายของ» in the bag's footer turns on sell mode: tap items to tick them (a tick and a gold frame), the footer
     shows how many and for how much, and «ขายที่เลือก» sells them all after one confirm.
   Prices are the shop's (item sell price × the Bia bonus from skills/helpers). Locked gear, the arrows in use and
   items with no sell price are never sold. Selling a fine piece (ล้ำค่า+ or +7) or a whole stack asks first.
   Also: the grade chip «ธรรมดา» in the auto-sell panel had no colour when switched on (white on white). */
'use strict';

const BSL = {on:false, sel:new Set()};
const bslLocked = id => typeof isLocked === 'function' && isLocked(id);
const bslOk = id => { const it = ITEMS[id]; return !!(it && S && S.inv[id] > 0 && (it.sell || 0) > 0 && it.kind !== 'key' && !it.quest && !bslLocked(id) && !(S.gear && S.gear.ammo === id)); };
const bslUnit = id => Math.max(1, Math.round((ITEMS[id].sell || 0) * (1 + ((typeof DER !== 'undefined' && DER && DER.pas && DER.pas.biaPct) || 0))));
const bslFine = id => { const it = ITEMS[id]; return (it.rar || 0) >= 2 || (it.rf || 0) >= 7; };

/* sell n of one item (n = Infinity: the whole stack); returns the Bia it made */
function bslSellRaw(id, n){
  if (!bslOk(id)) return 0; const k = Math.min(S.inv[id], n), p = bslUnit(id) * k;
  S.inv[id] -= k; if (S.inv[id] <= 0) delete S.inv[id]; S.bia += p; return p;
}
function bslAfter(msgTh, msgEn){
  if (typeof instPrune === 'function') instPrune();
  SFX.play('coin'); if (typeof VFX !== 'undefined' && VFX.play) VFX.play('coins', {x:P.x, y:P.y - 30});
  log(L(msgTh, msgEn), 'g'); dirty = true; save();
  if (typeof itHide === 'function') itHide();
  if (typeof renderBag === 'function') renderBag(); if (typeof renderHotbar === 'function') renderHotbar();
}
function bslSell(id, all){
  if (!bslOk(id)) return; const it = ITEMS[id], n = all ? S.inv[id] : 1, tot = bslUnit(id) * n;
  const go = () => { const p = bslSellRaw(id, n); if (!p) return; if (BAG.sel === id && !S.inv[id]) BAG.sel = null;
    bslAfter(`ขาย ${nm(it)}${n > 1 ? ` ×${n}` : ''} ได้ ${fmtN(p)} เบี้ย`, `Sold ${nm(it)}${n > 1 ? ` ×${n}` : ''} for ${fmtN(p)} Bia`); };
  if (bslFine(id) || n > 1) askConfirm(L('ขายของ', 'Sell'), L(`ขาย ${nm(it)}${n > 1 ? ` ×${n}` : ''} ได้ ${fmtN(tot)} เบี้ย ใช่ไหม? ขายแล้วเอาคืนไม่ได้`, `Sell ${nm(it)}${n > 1 ? ` ×${n}` : ''} for ${fmtN(tot)} Bia? This cannot be undone.`), L('ขาย', 'Sell'), go);
  else go();
}
function bslSellPicked(){
  const ids = [...BSL.sel].filter(bslOk); if (!ids.length) return;
  const tot = ids.reduce((a, k) => a + bslUnit(k) * S.inv[k], 0), pcs = ids.reduce((a, k) => a + S.inv[k], 0), fine = ids.filter(bslFine).length;
  askConfirm(L('ขายที่เลือก', 'Sell ticked'), L(`ขาย ${ids.length} รายการ (${fmtN(pcs)} ชิ้น) ได้ ${fmtN(tot)} เบี้ย${fine ? ` · มีของดี (ล้ำค่าขึ้นไปหรือ +7) ${fine} ชิ้น` : ''} · ขายแล้วเอาคืนไม่ได้`,
    `Sell ${ids.length} items (${fmtN(pcs)} pieces) for ${fmtN(tot)} Bia${fine ? ` · ${fine} fine piece(s) included` : ''} · cannot be undone`), L('ขาย', 'Sell'), () => {
    let p = 0, n = 0; for (const k of ids){ const c = S.inv[k] || 0; const got = bslSellRaw(k, Infinity); if (got){ p += got; n += c; } }
    BSL.sel.clear(); BSL.on = false; if (BAG.sel && !S.inv[BAG.sel]) BAG.sel = null;
    if (p) bslAfter(`ขายของ ${fmtN(n)} ชิ้น ได้ ${fmtN(p)} เบี้ย`, `Sold ${fmtN(n)} pieces for ${fmtN(p)} Bia`); else renderBag(); });
}

/* the item strip under the bag: a sell button */
{ const _bi = bagInfo;
  bagInfo = function(){ const r = _bi.apply(this, arguments); const box = el('bagInfo'), id = BAG.sel;
    if (!box || !id || BAG.tab === 'card' || !bslOk(id) || box.querySelector('.bslsell')) return r;
    const n = S.inv[id], u = bslUnit(id);
    const act = box.querySelector('[data-wear],[data-use]'), html = `<span class="bslbtns"><button class="btn sm bslsell" data-bslsell="${escH(id)}" title="${L('ขายทันที', 'Sell now')}">${L('ขาย', 'Sell')} <small>+${fmtN(u)}</small></button>${n > 1 ? `<button class="btn sm bslsell" data-bslsell="${escH(id)}" data-all="1">${L('ขายทั้งหมด', 'Sell all')} <small>+${fmtN(u * n)}</small></button>` : ''}</span>`;
    if (act) act.insertAdjacentHTML('beforebegin', html); else box.insertAdjacentHTML('beforeend', html);
    return r; }; }

/* the item card on touch screens: a sell button in its action bar */
if (typeof itShow === 'function'){ const _show = itShow;
  itShow = function(id){ const r = _show.apply(this, arguments), tip = el('itTip'); if (!tip) return r; const bar = tip.querySelector('.tebar');
    if (bar && !bar.querySelector('[data-bslsell]') && bslOk(id) && BAG.tab !== 'card'){
      bar.querySelector('[data-teclose]').insertAdjacentHTML('beforebegin', `<button class="btn bsltip" data-bslsell="${escH(id)}">${L('ขาย', 'Sell')}</button>`);
      if (typeof ITIP !== 'undefined'){ ITIP.w = tip.offsetWidth; ITIP.h = tip.offsetHeight; } return _show.apply(this, arguments); }
    return r; }; }

/* sell mode: the footer switch and the ticks on the grid */
function bslFoot(){ const foot = el('bagFoot'); if (!foot || !S) return; foot.querySelectorAll('.bslmode,.bslbar').forEach(x => x.remove());
  if (!BSL.on){ foot.insertAdjacentHTML('afterbegin', `<button class="btn sm bslmode" data-bslmode="1" title="${L('เลือกของในกระเป๋าแล้วขายทีเดียว', 'Tick items in the bag and sell them at once')}">💰 ${L('ขายของ', 'Sell items')}</button>`); return; }
  for (const k of [...BSL.sel]) if (!bslOk(k)) BSL.sel.delete(k);
  const ids = [...BSL.sel], tot = ids.reduce((a, k) => a + bslUnit(k) * S.inv[k], 0);
  foot.insertAdjacentHTML('afterbegin', `<span class="bslbar"><span>💰 ${L('แตะของที่จะขาย', 'Tap items to sell')} · <b>${ids.length}</b> ${L('รายการ', 'items')} · <b class="plus">+${fmtN(tot)}</b></span>
    <button class="btn sm" data-bslall="1">${L('เลือกทั้งหมด', 'Tick all')}</button><button class="btn sm gold" data-bslgo="1" ${ids.length ? '' : 'disabled'}>${L('ขายที่เลือก', 'Sell ticked')}</button><button class="btn sm" data-bslmode="0">${L('เสร็จ', 'Done')}</button></span>`); }
function bslMarks(){ const g = el('bagGrid'); if (!g) return; g.classList.toggle('bslon', BSL.on);
  for (const b of g.querySelectorAll('[data-bagsel]')){ const id = b.dataset.bagsel; b.classList.toggle('bslpick', BSL.on && BSL.sel.has(id)); b.classList.toggle('bslno', BSL.on && !bslOk(id)); } }
EV.on('tick', function bslWrap(){ if (BSL.wrapped || typeof bagDraw !== 'function' || !(typeof BKP === 'undefined' || BKP.wrapped)) return; BSL.wrapped = true;
  const _bd = bagDraw; bagDraw = function(){ const r = _bd.apply(this, arguments); try { bslFoot(); bslMarks(); } catch (e) {} return r; }; });
const bslRedraw = () => { bslFoot(); bslMarks(); };

/* in sell mode a tap on an item ticks it: window capture runs before the bag's, the item card's and the double-tap wear */
const bslHit = e => BSL.on && BAG.tab !== 'card' && BAG.tab !== 'pet' && e.target && e.target.closest && e.target.closest('#bagGrid [data-bagsel]');
window.addEventListener('touchstart', e => { if (bslHit(e)) e.stopPropagation(); }, {capture:true, passive:true});
window.addEventListener('dblclick', e => { if (bslHit(e)){ e.stopPropagation(); e.preventDefault(); } }, true);
window.addEventListener('click', e => {
  const s = bslHit(e); if (s){ e.stopPropagation(); e.preventDefault(); const id = s.dataset.bagsel;
    if (!bslOk(id)) toast(bslLocked(id) ? L('ชิ้นนี้ล็อคอยู่', 'This piece is locked') : L('ของชิ้นนี้ขายไม่ได้', 'This cannot be sold'));
    else if (BSL.sel.has(id)) BSL.sel.delete(id); else BSL.sel.add(id);
    bslRedraw(); return; }
  const b = e.target.closest && e.target.closest('[data-bslsell],[data-bslmode],[data-bslgo],[data-bslall]'); if (!b) return; const d = b.dataset;
  e.stopPropagation();
  if (d.bslsell){ bslSell(d.bslsell, !!d.all); return; }
  if (d.bslmode){ BSL.on = d.bslmode === '1'; BSL.sel.clear(); if (BSL.on){ if (typeof itHide === 'function') itHide(); BAG.sel = null; document.querySelectorAll('#bagGrid .sel').forEach(x => x.classList.remove('sel')); bagInfo(); } bslRedraw(); return; }
  if (d.bslall){ for (const x of document.querySelectorAll('#bagGrid [data-bagsel]')) if (bslOk(x.dataset.bagsel)) BSL.sel.add(x.dataset.bagsel); bslRedraw(); return; }
  if (d.bslgo) bslSellPicked();
}, true);
/* leaving the bag ends sell mode */
EV.on('tick', () => { if (BSL.on){ const w = el('bagGrid'); if (!w || !w.offsetParent){ BSL.on = false; BSL.sel.clear(); } } });

{ const st = document.createElement('style'); st.textContent = `
.bslbtns{display:inline-flex;gap:6px;flex-wrap:wrap;margin-left:6px}
.bslsell{background:linear-gradient(#fff3c8,#f1c75a) !important;color:#4a2c00 !important}
.bslsell small{font-size:11px;opacity:.85}
#itTip .tebar .btn.bsltip{flex:0 0 auto;min-width:84px;background:linear-gradient(#fff3c8,#f1c75a);color:#4a2c00}
.bslmode{margin-right:6px}
.bslbar{display:inline-flex;flex-wrap:nowrap;align-items:center;gap:6px;margin-right:auto;padding:2px 4px 2px 10px;white-space:nowrap;border-radius:12px;background:#fff6d8;box-shadow:0 0 0 1.5px #e0b44a;color:#4a2c00;font-size:12.5px}
.bslbar .plus{color:#1d8a3a}
#bagFoot:has(.bslbar) .bkautob,#bagFoot:has(.bslbar) .bagx,#bagFoot:has(.bslbar) .bcap,#bagFoot:has(.bslbar) .bcapw{display:none !important}
#bagGrid.bslon [data-bagsel]{position:relative}
#bagGrid.bslon [data-bagsel].bslno{opacity:.4;filter:grayscale(.6)}
#bagGrid.bslon [data-bagsel].bslpick{box-shadow:0 0 0 3px #f0a020,0 0 10px rgba(240,160,32,.8) !important}
#bagGrid.bslon [data-bagsel].bslpick::before{content:"✓";position:absolute;right:3px;top:2px;z-index:3;width:18px;height:18px;border-radius:50%;background:#1d9a4a;color:#fff;font:800 12px/18px sans-serif;text-align:center;box-shadow:0 0 0 1.5px #fff}
/* the grade chips: «ธรรมดา» gets a colour when it is on (it was white on white) */
.bkchip.r0.on,.bkpop .bkchip.r0.on,.bkautog .bkchip.r0.on{background:#7d8894 !important;color:#fff !important;border-color:#55606c !important}
.bkpop .bkchip.r1.on,.bkautog .bkchip.r1.on{background:#5ab4ff !important;color:#fff !important;border-color:#2a7ac8 !important}
.bkpop .bkchip.r2.on,.bkautog .bkchip.r2.on{background:#c77dff !important;color:#fff !important;border-color:#8a3ac8 !important}
.bkpop .bkchip.r3.on,.bkautog .bkchip.r3.on{background:#ffb830 !important;color:#3a2000 !important;border-color:#c07a10 !important}`;
  document.head.appendChild(st); }
