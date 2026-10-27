/* VAYRATHEN — js/sys/bulk.js — easier gear, selling and salvaging many pieces at once, and locking
   · Gear drops more often: 1 kill in 20 (was 50); bosses drop 1–3 pieces; normal monsters roll Rare+ a little more often.
   · Forge → ขายคืน (Sell back) and Crafting → แยกชิ้นส่วน (Salvage) are now one list with a tick box per piece:
       – "เลือกตามเกรด" ticks every piece the grade settings allow; you can then tick / untick by hand
       – grade settings (separate for selling and for salvaging, remembered): which rarities (ธรรมดา หายาก ล้ำค่า ตำนาน),
         keep refined pieces (+N and up), keep pieces with cards in them, keep pieces that are better than what you wear
       – one button sells / salvages everything ticked, with a summary to confirm
   · 🔒 Lock: lock a piece from the bag or from the list. Locked pieces are never sold, salvaged or ticked, and show a lock
     on their icon. Worn pieces never appear in these lists. */
'use strict';

if (typeof RAR_ODDS !== 'undefined') RAR_ODDS.mob = [.64, .26, .085, .015];
const lockSet = () => S.locked || (S.locked = {});
const isLocked = id => !!(S && S.locked && S.locked[id]);
function lockToggle(id){ if (!ITEMS[id] || ITEMS[id].kind !== 'gear') return; const L0 = lockSet(); if (L0[id]) delete L0[id]; else L0[id] = 1;
  toast(L0[id] ? L('🔒 ล็อคแล้ว · ขายหรือย่อยไม่ได้', '🔒 Locked · cannot be sold or salvaged') : L('ปลดล็อคแล้ว', 'Unlocked')); SFX.play('equip'); dirty = true; save(); bkRefresh(); }
/* forget locks of pieces you no longer have */
EV.on('map', () => { if (!S || !S.locked) return; const have = new Set([...Object.keys(S.inv), ...Object.values(S.gear || {})]); for (const k in S.locked) if (!have.has(k)) delete S.locked[k]; });

/* single sells and salvages respect the lock too */
{ const _fs = fgSell; fgSell = function(id){ if (isLocked(id)){ toast(L('ชิ้นนี้ล็อคอยู่', 'This piece is locked')); return; } return _fs.apply(this, arguments); }; }
{ const _sv = salvage; salvage = function(id){ if (isLocked(id)){ toast(L('ชิ้นนี้ล็อคอยู่', 'This piece is locked')); return; } return _sv.apply(this, arguments); }; }
/* a lock on the icon */
{ const _art = itemArt;
  itemArt = function(id){ const s = _art.apply(this, arguments); if (!isLocked(id)) return s;
    return s.replace(/<\/svg>$/, '<g transform="translate(27 2)"><rect x="1" y="5" width="10" height="8" rx="2" fill="#ffd34a" stroke="#5a3a00" stroke-width="1.2"/><path d="M3.5 5V3.6a2.5 2.5 0 0 1 5 0V5" fill="none" stroke="#5a3a00" stroke-width="1.6"/></g></svg>'); }; }
/* the bag: a lock button on gear */
{ const _bi = bagInfo;
  bagInfo = function(){ _bi.apply(this, arguments); const box = el('bagInfo'), id = BAG.sel; if (!box || !id || !ITEMS[id] || ITEMS[id].kind !== 'gear' || BAG.tab === 'card') return;
    box.insertAdjacentHTML('beforeend', `<button class="btn sm bklock${isLocked(id) ? ' on' : ''}" data-lock="${id}" title="${L('ล็อคกันขาย/ย่อย', 'Lock against selling/salvaging')}">${isLocked(id) ? '🔒 ' + L('ปลดล็อค', 'Unlock') : '🔓 ' + L('ล็อค', 'Lock')}</button>`); }; }

/* ---------- the bulk list ---------- */
const BLK = {sel:{sell:new Set(), salv:new Set()}};
const bkSet = mode => { S.bulk = S.bulk || {}; return S.bulk[mode] || (S.bulk[mode] = {rar:[1, 1, 0, 0], keepRf:7, keepCards:1, keepUp:1}); };
const bkCards = id => (ITEMS[id] && ITEMS[id].cards ? ITEMS[id].cards.length : 0);
const bkUp = id => { try { return typeof cmpOf === 'function' && cmpMark(cmpOf(id)) === 'up'; } catch (e){ return false; } };
function bkList(){ const worn = new Set(Object.values(S.gear || {}));
  return Object.keys(S.inv).filter(k => ITEMS[k] && ITEMS[k].kind === 'gear' && S.inv[k] > 0 && !worn.has(k)).sort((a, b) => (rarOf(b) - rarOf(a)) || ((ITEMS[b].lv || 0) - (ITEMS[a].lv || 0))); }
function bkAllowed(mode, id){ const st = bkSet(mode), it = ITEMS[id]; if (isLocked(id)) return false; if (!st.rar[rarOf(id)]) return false;
  if (st.keepRf && (it.rf || 0) >= st.keepRf) return false; if (st.keepCards && bkCards(id)) return false; if (st.keepUp && bkUp(id)) return false; return true; }
const bkValue = (mode, id) => (mode === 'sell' ? Math.round((ITEMS[id].sell || 0) * (1 + ((DER && DER.pas.biaPct) || 0))) : (typeof dustOf === 'function' ? dustOf(id) : 1)) * (S.inv[id] || 1);
function bkHTML(mode){
  const st = bkSet(mode), list = bkList(), sel = BLK.sel[mode]; for (const k of [...sel]) if (!list.includes(k) || isLocked(k)) sel.delete(k);
  const tot = [...sel].reduce((a, k) => a + bkValue(mode, k), 0), unit = mode === 'sell' ? CUR() : L('ผง', 'dust');
  const chip = (i) => `<button class="bkchip r${i}${st.rar[i] ? ' on' : ''}" data-bkrar="${mode}|${i}">${L(RAR[i].th, RAR[i].en)}</button>`;
  return `<div class="bk" data-bkmode="${mode}">
    <div class="bkset"><b>${L('ตั้งค่าเกรดที่จะ' + (mode === 'sell' ? 'ขาย' : 'ย่อย'), `Grades to ${mode === 'sell' ? 'sell' : 'salvage'}`)}</b>
      <div class="bkchips">${[0, 1, 2, 3].map(chip).join('')}</div>
      <label><input type="checkbox" data-bkopt="${mode}|keepCards" ${st.keepCards ? 'checked' : ''}> ${L('เก็บชิ้นที่มีการ์ด', 'Keep pieces with cards')}</label>
      <label><input type="checkbox" data-bkopt="${mode}|keepUp" ${st.keepUp ? 'checked' : ''}> ${L('เก็บชิ้นที่ดีกว่าที่สวม', 'Keep upgrades')}</label>
      <label>${L('เก็บชิ้นตีบวกตั้งแต่', 'Keep refined from')} <select data-bkrf="${mode}">${[0, 1, 4, 7, 10].map(v => `<option value="${v}" ${st.keepRf === v ? 'selected' : ''}>${v ? '+' + v : L('ไม่เก็บ', 'off')}</option>`).join('')}</select></label>
      <div class="bkbtns"><button class="btn sm gold" data-bkpick="${mode}">${L('เลือกตามเกรด', 'Tick by grade')}</button><button class="btn sm" data-bknone="${mode}">${L('ล้างที่เลือก', 'Clear')}</button><button class="btn sm gold" data-bkgo="${mode}" ${sel.size ? '' : 'disabled'}>${mode === 'sell' ? L('ขายที่เลือก', 'Sell ticked') : L('ย่อยที่เลือก', 'Salvage ticked')}</button></div></div>
    <div class="shop bklist">${list.length ? list.map(k => { const it = ITEMS[k], lk = isLocked(k), cs = bkCards(k);
      return `<div class="srow bkrow${sel.has(k) ? ' on' : ''}${lk ? ' locked' : ''}"><input type="checkbox" data-bk="${mode}|${k}" ${sel.has(k) ? 'checked' : ''} ${lk ? 'disabled' : ''}><span class="ic">${itemIcon(k)}</span>
        <div class="nm"><b class="rar r${rarOf(k)}">${nm(it)}</b><small>Lv ${it.lv || 1}${it.rf ? ` · +${it.rf}` : ''}${cs ? ` · ${L('การ์ด', 'cards')} ${cs}` : ''}${S.inv[k] > 1 ? ` · ×${S.inv[k]}` : ''}${bkUp(k) ? ` · <em class="up">▲</em>` : ''}</small></div>
        <span class="pr plus">+${fmtN(bkValue(mode, k))}${mode === 'salv' ? ' ' + unit : ''}</span><button class="ibtn bklk${lk ? ' on' : ''}" data-lock="${k}" title="${lk ? L('ปลดล็อค', 'Unlock') : L('ล็อค', 'Lock')}">${lk ? '🔒' : '🔓'}</button></div>`; }).join('')
      : `<p class="hint">${L('ไม่มีอุปกรณ์ในกระเป๋า (ชิ้นที่สวมอยู่ไม่แสดง)', 'No gear in your bag (worn pieces are not listed)')}</p>`}</div>
    <div class="bkgo"><span>${L('เลือกแล้ว', 'Ticked')} <b>${sel.size}</b> ${L('ชิ้น', 'pieces')} · <b class="plus">+${fmtN(tot)}</b> ${unit}</span></div></div>`;
}
function bkRun(mode){
  const sel = [...BLK.sel[mode]].filter(k => S.inv[k] > 0 && !isLocked(k)); if (!sel.length) return;
  const tot = sel.reduce((a, k) => a + bkValue(mode, k), 0), fine = sel.filter(k => rarOf(k) >= 2 || (ITEMS[k].rf || 0) >= 7).length;
  const go = () => { let n = 0;
    for (const k of sel){ const c = S.inv[k] || 0; if (!c || isLocked(k)) continue; n += c; delete S.inv[k]; }
    if (mode === 'sell'){ S.bia += tot; SFX.play('coin'); VFX.play('coins', {x:P.x, y:P.y - 30}); log(L(`ขายอุปกรณ์ ${n} ชิ้น ได้ ${fmtN(tot)} เบี้ย`, `Sold ${n} pieces for ${fmtN(tot)} Bia`), 'g'); }
    else { addItem('dust', tot); SFX.play('craft'); log(L(`ย่อยอุปกรณ์ ${n} ชิ้น ได้ผงวายรา ×${tot}`, `Salvaged ${n} pieces into ${tot} Vayra Dust`), 'g'); }
    BLK.sel[mode].clear(); if (typeof instPrune === 'function') instPrune(); dirty = true; save(); bkRefresh(); if (typeof renderBag === 'function') renderBag(); };
  askConfirm(mode === 'sell' ? L('ขายหลายชิ้น', 'Sell many') : L('ย่อยหลายชิ้น', 'Salvage many'),
    L(`${mode === 'sell' ? 'ขาย' : 'ย่อย'} ${sel.length} ชิ้น ได้ ${fmtN(tot)} ${mode === 'sell' ? 'เบี้ย' : 'ผงวายรา'}${fine ? ` · มีของดี (ล้ำค่าขึ้นไปหรือ +7) ${fine} ชิ้น` : ''} · ทำแล้วเอาคืนไม่ได้`, `${mode === 'sell' ? 'Sell' : 'Salvage'} ${sel.length} pieces for ${fmtN(tot)} ${mode === 'sell' ? 'Bia' : 'dust'}${fine ? ` · ${fine} fine piece(s) included` : ''} · cannot be undone`),
    mode === 'sell' ? L('ขาย', 'Sell') : L('ย่อย', 'Salvage'), go);
}
function bkRefresh(){ if (typeof WIN_RENDER === 'undefined') return; if (el('win-forge') && !el('win-forge').hidden) WIN_RENDER.forge(); if (el('win-craft') && !el('win-craft').hidden) WIN_RENDER.craft(); if (BAG && BAG.sel) bagInfo(); }
/* put the bulk list into the two windows */
{ const _f = WIN_RENDER.forge; WIN_RENDER.forge = function(){ const r = _f.apply(this, arguments); if (RF.tab !== 'sell') return r; const p = el('pane-forge'), sh = p && p.querySelector(':scope > .shop'); if (sh) sh.outerHTML = bkHTML('sell'); return r; }; }
{ const _c = WIN_RENDER.craft; WIN_RENDER.craft = function(){ const r = _c.apply(this, arguments); if (CRAFT.tab !== 'salvage') return r; const p = el('pane-craft'), sh = p && p.querySelector('.shop'); if (sh){ sh.outerHTML = bkHTML('salv'); const h = p.querySelector('p.hint'); if (h && h.nextElementSibling && h.nextElementSibling.classList.contains('bk')) h.remove(); } return r; }; }
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-lock],[data-bkrar],[data-bkpick],[data-bknone],[data-bkgo]'); if (!b) return; const d = b.dataset;
  if (d.lock){ e.stopPropagation(); lockToggle(d.lock); return; }
  if (d.bkrar){ const [m, i] = d.bkrar.split('|'); const st = bkSet(m); st.rar[+i] = st.rar[+i] ? 0 : 1; dirty = true; bkRefresh(); return; }
  if (d.bkpick){ const m = d.bkpick; for (const k of bkList()) if (bkAllowed(m, k)) BLK.sel[m].add(k); bkRefresh(); return; }
  if (d.bknone){ BLK.sel[d.bknone].clear(); bkRefresh(); return; }
  if (d.bkgo) bkRun(d.bkgo);
});
document.addEventListener('change', e => { const t = e.target; if (!t || !t.dataset) return; const d = t.dataset;
  if (d.bk){ const [m, k] = d.bk.split('|'); if (t.checked && !isLocked(k)) BLK.sel[m].add(k); else BLK.sel[m].delete(k); bkRefresh(); }
  else if (d.bkopt){ const [m, k] = d.bkopt.split('|'); bkSet(m)[k] = t.checked ? 1 : 0; dirty = true; }
  else if (d.bkrf){ bkSet(d.bkrf).keepRf = +t.value; dirty = true; } });
{ const st = document.createElement('style');
  st.textContent = `.bk{display:flex;flex-direction:column;gap:8px}.bkset{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.08);font-size:12.5px}
  .bkset b{width:100%;color:#ffe27a}.bkchips{display:flex;gap:5px;flex-wrap:wrap}.bkchip{border:2px solid rgba(255,255,255,.5);background:rgba(0,0,0,.2);color:#cfe0f6;border-radius:12px;padding:2px 10px;font:600 12px var(--display,sans-serif);cursor:pointer}
  .bkchip.on{background:#fff;color:#14325e}.bkchip.r1.on{background:#5ab4ff;color:#fff}.bkchip.r2.on{background:#c77dff;color:#fff}.bkchip.r3.on{background:#ffb830;color:#3a2000}
  .bkset label{display:flex;align-items:center;gap:4px;color:#dce9fb}.bkset select{border-radius:8px;padding:1px 4px}.bkbtns{display:flex;gap:6px;width:100%}
  .bkrow input[type=checkbox]{width:18px;height:18px;flex:none}.bkrow.on{background:rgba(255,211,74,.14)}.bkrow.locked{opacity:.65}.bklk{font-size:14px;width:28px;height:28px}
  .bklist{max-height:min(46vh,380px);overflow:auto}.bkgo{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 4px;border-top:1px solid rgba(255,255,255,.25)}
  .bkgo .plus{color:#7dffb0}.bklock{margin-left:6px}.bklock.on{background:#ffd34a;color:#3a2000}`;
  document.head.appendChild(st); }

/* ---------- locks hold everywhere: no trading, no market listing ---------- */
{ const _ta = tAdd; tAdd = function(id){ if (isLocked(id)){ toast(L('ชิ้นนี้ล็อคอยู่ · ปลดล็อคก่อนเทรด', 'This piece is locked · unlock it to trade')); return; } return _ta.apply(this, arguments); }; }
{ const _ml = mkList; mkList = async function(){ if (typeof MK !== 'undefined' && isLocked(MK.sel)){ toast(L('ชิ้นนี้ล็อคอยู่ · ปลดล็อคก่อนวางขาย', 'This piece is locked · unlock it to list it')); return; } return _ml.apply(this, arguments); }; }

/* ---------- auto: sell or salvage low-grade gear the moment you pick it up (uses that mode's grade settings) ---------- */
const bkAuto = () => (S && S.bulk && S.bulk.auto) || 'off';
EV.on('pickup', id => {
  const mode = bkAuto(); if (mode === 'off' || !S.inv[id] || !ITEMS[id] || ITEMS[id].kind !== 'gear' || !bkAllowed(mode, id)) return;
  const v = bkValue(mode, id); delete S.inv[id]; if (typeof instPrune === 'function') instPrune();
  if (mode === 'sell'){ S.bia += v; addText(P.x, P.y - 70, `+${fmtN(v)} ${CUR()}`, '#ffe08a', 12); } else { addItem('dust', v); addText(P.x, P.y - 70, `+${v} ${L('ผง', 'dust')}`, '#cfe0ff', 12); }
  dirty = true;
});
{ const _h = bkHTML;
  bkHTML = function(mode){ const s = _h.apply(this, arguments), a = bkAuto();
    const auto = `<label class="bkauto">${L('อัตโนมัติเมื่อเก็บของ', 'When picking up')} <select data-bkauto="1"><option value="off" ${a === 'off' ? 'selected' : ''}>${L('ปิด', 'Off')}</option><option value="sell" ${a === 'sell' ? 'selected' : ''}>${L('ขายตามเกรดที่ตั้ง', 'Sell by grade')}</option><option value="salv" ${a === 'salv' ? 'selected' : ''}>${L('ย่อยตามเกรดที่ตั้ง', 'Salvage by grade')}</option></select></label>`;
    return s.replace('<div class="bkbtns">', auto + '<div class="bkbtns">'); }; }
document.addEventListener('change', e => { const t = e.target; if (t && t.dataset && t.dataset.bkauto){ S.bulk = S.bulk || {}; S.bulk.auto = t.value; dirty = true; toast(t.value === 'off' ? L('ปิดขาย/ย่อยอัตโนมัติ', 'Auto sell/salvage off') : t.value === 'sell' ? L('เก็บของแล้วขายตามเกรดที่ตั้งทันที (ชิ้นที่ล็อคไม่โดน)', 'Picked-up gear is sold by your grade settings (locked pieces are safe)') : L('เก็บของแล้วย่อยตามเกรดที่ตั้งทันที (ชิ้นที่ล็อคไม่โดน)', 'Picked-up gear is salvaged by your grade settings (locked pieces are safe)')); } });
