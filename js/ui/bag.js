/* VAYRATHEN — js/ui/bag.js
   Inventory window (E): header with the bag, item count and Bia, a category rail on the left
   (All · Consumable · Equipment · Etc. · Card · Pet), a toolbar with search, sort and grid/list view,
   a slot grid of icon tiles with counts, a detail strip for the selected item and a footer total.
   The window shell is built once; only the grid, detail and numbers are redrawn so typing in search keeps focus. */
'use strict';

const BAG = {tab:'all', q:'', sort:'rar', view:'grid', sel:null, built:false};
const BAG_TABS = [
  ['all', 'ทั้งหมด', 'All', 'bundle'], ['use', 'ใช้ของ', 'Consumable', 'pot'], ['gear', 'อุปกรณ์', 'Equipment', 'armor'],
  ['etc', 'อื่น ๆ', 'Etc.', 'ore'], ['card', 'การ์ด', 'Card', 'card'], ['pet', 'สัตว์เลี้ยง', 'Pet', 'paw']];
const bagTabOf = id => { const k = (ITEMS[id] || {}).kind; return k === 'use' ? 'use' : k === 'gear' || k === 'ammo' ? 'gear' : 'etc'; };
const tabIcon = (g) => `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${GLYPH[g]}</svg>`;

function bagBuild(){
  const pane = el('pane-bag'); if (!pane) return;
  pane.innerHTML = `<div class="bagw">
    <div class="bagh"><span class="bagic">${tabIcon('bundle')}</span><div class="bagt"><b>${L('กระเป๋า', 'Inventory')}</b><small>Inventory</small></div>
      <span class="bagchip" id="bagCount"></span><span class="bagchip gold" id="bagMoney"></span><span class="bagchip coin" id="bagCoin" title="${L('เหรียญวายรา', 'Vayra Coins')}"></span><button class="btn gold sm" data-win-open="equip">${L('สวมใส่', 'Equip')}</button></div>
    <div class="bagb">
      <nav class="bagtabs" role="tablist">${BAG_TABS.map(([k, th, en, g]) => `<button role="tab" class="bagtab" data-bagtab="${k}">${tabIcon(g)}<span><b>${L(th, en)}</b><small>${en}</small></span></button>`).join('')}</nav>
      <div class="bagmain">
        <div class="bagtool"><label class="bagq">${tabIcon('eye')}<input id="bagQ" placeholder="${L('ค้นหาไอเทม…', 'Search items…')}" autocomplete="off"></label>
          <select id="bagSort" aria-label="${L('เรียงลำดับ', 'Sort')}"><option value="rar">${L('เรียง: ความหายาก (อัตโนมัติ)', 'Sort: rarity (auto)')}</option><option value="new">${L('เรียง: ล่าสุด', 'Sort: newest')}</option><option value="name">${L('เรียง: ชื่อ', 'Sort: name')}</option><option value="count">${L('เรียง: จำนวน', 'Sort: count')}</option><option value="price">${L('เรียง: ราคา', 'Sort: price')}</option></select>
          <span class="bagview"><button class="bagv" data-bagview="grid" aria-label="${L('ตาราง', 'Grid')}">▦</button><button class="bagv" data-bagview="list" aria-label="${L('รายการ', 'List')}">☰</button></span></div>
        <div class="baggrid" id="bagGrid"></div>
        <div class="baginfo" id="bagInfo"></div>
      </div>
    </div>
    <div class="bagf"><span id="bagFoot"></span></div>
  </div>`;
  BAG.built = true;
  el('bagQ').addEventListener('input', e => { BAG.q = e.target.value.trim().toLowerCase(); bagDraw(); });
  el('bagQ').addEventListener('keydown', e => e.stopPropagation());
  el('bagSort').value = BAG.sort;
  el('bagSort').addEventListener('change', e => { BAG.sort = e.target.value; bagDraw(); });
}
/* rarity order: Legendary → Epic → Rare → Common; within a grade gear first, then cards, consumables, the rest;
   then higher level and higher value first */
const BAG_KORD = {gear:0, ammo:1, card:2, use:3, mat:4, etc:5};
const bagGrade = e => (e.card ? 2 : e.it.rar || 0);
const bagVal = e => (e.card ? 0 : (e.it.buy || 0) + (e.it.sell || 0) * 4);
function bagRarCmp(a, b){
  return bagGrade(b) - bagGrade(a) || (BAG_KORD[a.card ? 'card' : a.it.kind] ?? 6) - (BAG_KORD[b.card ? 'card' : b.it.kind] ?? 6)
    || (b.it.lv || 0) - (a.it.lv || 0) || bagVal(b) - bagVal(a) || nm(a.it).localeCompare(nm(b.it), 'th');
}
function bagEntries(){
  if (BAG.tab === 'card') return Object.keys(S.cards).filter(c => S.cards[c] > 0 && CARDS[c]).map(c => ({id:c, card:true, n:S.cards[c], it:CARDS[c]}));
  if (BAG.tab === 'pet') return [];
  let ids = Object.keys(S.inv).filter(id => S.inv[id] > 0 && ITEMS[id]);
  if (BAG.tab !== 'all') ids = ids.filter(id => bagTabOf(id) === BAG.tab);
  return ids.map(id => ({id, n:S.inv[id], it:ITEMS[id]}));
}
function bagDraw(){
  const grid = el('bagGrid'); if (!grid) return;
  document.querySelectorAll('[data-bagtab]').forEach(b => b.classList.toggle('on', b.dataset.bagtab === BAG.tab));
  document.querySelectorAll('[data-bagview]').forEach(b => b.classList.toggle('on', b.dataset.bagview === BAG.view));
  const kinds = Object.keys(S.inv).filter(id => S.inv[id] > 0).length, pcs = Object.values(S.inv).reduce((a, b) => a + (b > 0 ? b : 0), 0);
  el('bagCount').textContent = `${L('ชนิด', 'Kinds')} ${kinds}`; el('bagMoney').textContent = `${S.bia.toLocaleString()} ${CUR()}`; if (el('bagCoin')) el('bagCoin').textContent = `◈ ${typeof ACC !== 'undefined' ? (ACC.coins || 0).toLocaleString() : 0}`;
  el('bagFoot').textContent = L(`${kinds} ชนิด · ${pcs.toLocaleString()} ชิ้น`, `${kinds} kinds · ${pcs.toLocaleString()} pieces`);
  grid.className = 'baggrid ' + BAG.view;
  if (BAG.tab === 'pet'){ grid.className = 'baggrid list'; grid.innerHTML = S.pet
      ? typeof petCardHTML === 'function' ? petCardHTML() : `<div class="bagrow"><span class="bico">${iconSvg('paw', 'earth')}</span><div class="nm"><b>${nm(MOB[S.pet])}</b><small>${L('เดินตามคุณ', 'Follows you')} · EXP +${Math.round((MOVES.pet.expBonus + (DER.pas.petExp || 0)) * 100)}%${DER.pas.petAtk ? ` · ${L('ช่วยตี', 'attacks')} ${Math.round(DER.pas.petAtk * 100)}% ATK` : ''}</small></div><button class="btn sm" data-release="1">${L('ปล่อย', 'Release')}</button></div>`
      : `<p class="empty">${L('ยังไม่มี · ตีมอนให้ HP เหลือไม่เกิน 30% แล้วกด T เพื่อจับ', 'None yet · bring a monster to 30% HP or less, then press T to capture')}</p>`;
    el('bagInfo').innerHTML = ''; return; }
  let list = bagEntries();
  if (BAG.q) list = list.filter(e => (e.it.name + ' ' + (e.it.en || '')).toLowerCase().includes(BAG.q));
  if (BAG.sort === 'rar') list.sort(bagRarCmp);
  else if (BAG.sort === 'new') list.reverse();
  else if (BAG.sort === 'name') list.sort((a, b) => nm(a.it).localeCompare(nm(b.it), 'th'));
  else if (BAG.sort === 'count') list.sort((a, b) => b.n - a.n);
  else list.sort((a, b) => (b.it.sell || b.it.buy || 0) - (a.it.sell || a.it.buy || 0));
  if (BAG.sel && !list.some(e => e.id === BAG.sel)) BAG.sel = null;
  const ico = e => e.card ? cardHTML(e.id, 'mini') : itemIcon(e.id), worn = e => !e.card && S.gear && S.gear.ammo === e.id;
  if (BAG.view === 'grid'){
    const cols = 8, slots = Math.max(cols * 5, Math.ceil(list.length / cols) * cols);
    let h = '';
    for (let i = 0; i < slots; i++){ const e = list[i];
      h += e ? `<button class="bslot${BAG.sel === e.id ? ' sel' : ''}${e.it.rar ? ' r' + e.it.rar : ''}" data-bagsel="${e.id}" title="${nm(e.it)}">${ico(e)}${worn(e) ? '<i class="bE">E</i>' : ''}${e.n > 1 || e.card ? `<em>${e.n.toLocaleString()}</em>` : ''}</button>` : `<span class="bslot empty"></span>`; }
    grid.innerHTML = h;
  } else {
    grid.innerHTML = list.length ? list.map(e => `<button class="bagrow${BAG.sel === e.id ? ' sel' : ''}" data-bagsel="${e.id}"><span class="bico">${ico(e)}</span><span class="nm"><b class="rar r${e.it.rar || 0}">${nm(e.it)}</b><small>${e.card ? cardDesc(e.id) : itemDesc(e.id) || (e.it.sell ? L(`ขายได้ ${e.it.sell} เบี้ย`, `Sells for ${e.it.sell} Bia`) : '')}</small></span><span class="ct">×${e.n.toLocaleString()}</span></button>`).join('')
      : `<p class="empty">${BAG.q ? L('ไม่พบไอเทม', 'No items found') : L('ว่างเปล่า', 'Empty')}</p>`;
  }
  bagInfo();
}
function bagInfo(){
  const box = el('bagInfo'); if (!box) return; const id = BAG.sel;
  if (!id){ box.innerHTML = `<p class="hint">${(typeof GFX !== 'undefined' && GFX.touch ? L('แตะไอเทมเพื่อดูรายละเอียดและปุ่มสวม/ใช้ · แตะสองครั้งเร็วๆ เพื่อสวม/ใช้ทันที', 'Tap an item for its card with Wear/Use · tap twice quickly to wear or use it') : L('แตะไอเทมเพื่อดูรายละเอียด · ดับเบิลคลิกเพื่อใช้/สวม', 'Tap an item for details · double-click to use or wear'))}</p>`; return; }
  if (CARDS[id] && BAG.tab === 'card'){ box.innerHTML = `${cardHTML(id)}<div class="nm"><b>${nm(CARDS[id])} <span class="ct">×${S.cards[id] || 0}</span></b><small>${L('ใส่ในช่อง Card ของ', 'Goes in the card socket of your')} ${L(SLOT_TH[CARDS[id].slot], SLOT_EN[CARDS[id].slot])}</small></div><button class="btn sm gold" data-card="${id}" ${S.cards[id] > 0 ? '' : 'disabled'}>${S.slots && S.slots[CARDS[id].slot] ? L('สลับ Card', 'Swap card') : L('ใส่ Card', 'Slot card')}</button>`; return; }
  const it = ITEMS[id]; if (!it){ box.innerHTML = ''; return; }
  const act = it.kind === 'use' ? `<button class="btn sm gold" data-use="${id}">${L('ใช้', 'Use')}</button>`
    : it.kind === 'gear' || (it.kind === 'ammo' && S.gear.ammo !== id && ammoFits(id)) ? `<button class="btn sm gold" data-wear="${id}" ${S.lvl >= it.lv ? '' : 'disabled'}>${L('สวม', 'Wear')}</button>`
    : it.kind === 'ammo' && S.gear.ammo === id ? `<span class="ct">${L('ใช้อยู่', 'in use')}</span>` : '';
  const meta = [it.lv ? `Lv ${it.lv}` : '', it.st ? (typeof gearLines === 'function' ? gearLines(id) : gearStatText(it.st)) : '', it.sell ? L(`ขาย ${it.sell.toLocaleString()} เบี้ย`, `Sells ${it.sell.toLocaleString()} Bia`) : ''].filter(Boolean).join(' · ');
  box.innerHTML = `<span class="bico">${itemIcon(id)}</span><div class="nm"><b><span class="rar r${it.rar || 0}">${nm(it)}</span> ${rarLine(id)} <span class="ct">×${(S.inv[id] || 0).toLocaleString()}</span></b><small>${itemDesc(id) || ''}${meta ? `${itemDesc(id) ? '<br>' : ''}${meta}` : ''}</small></div>${act}`;
}
function renderBag(){ if (!BAG.built || !el('bagGrid')) bagBuild(); bagDraw(); }

document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-bagtab],[data-bagview],[data-bagsel]'); if (!t) return;
  const ds = t.dataset;
  if (ds.bagtab){ BAG.tab = ds.bagtab; BAG.sel = null; bagDraw(); }
  else if (ds.bagview){ BAG.view = ds.bagview; bagDraw(); }
  else if (ds.bagsel){ BAG.sel = ds.bagsel; document.querySelectorAll('[data-bagsel]').forEach(b => b.classList.toggle('sel', b.dataset.bagsel === BAG.sel)); bagInfo(); }
});
document.addEventListener('dblclick', e => {
  const t = e.target.closest && e.target.closest('[data-bagsel]'); if (!t) return; const id = t.dataset.bagsel, it = ITEMS[id];
  if (!it || BAG.tab === 'card') return;
  const b = it.kind === 'use' ? `[data-use="${id}"]` : `[data-wear="${id}"]`, btn = el('bagInfo').querySelector(b); if (btn && !btn.disabled) btn.click();
});
