/* VAYRATHEN — js/sys/drill.js — drilling card sockets, the socket-and-refine smith, and a steadier economy
   · เจาะรู (Drill): a new tab in the Forge. Any weapon or wearable piece that can take a card (not accessories) gains one
     more socket, up to 3 — shop gear (which comes with none) included.
       – สว่านเจาะรู (Socket Drill): sold by the smiths; success by the socket being made: 1st 90% · 2nd 60% · 3rd 30%
       – สว่านเพชร (Diamond Drill): never fails; dropped by region bosses (12%), world bosses and Kailash chests
       – a fee in Bia that grows with the item's level and the socket; a failure only uses the drill (the piece is safe)
   · ช่างเจาะมณี (Driller Manee) stands next to the forge in Aren: drilling and refining in one talk.
   · Economy: gear sells back for much less (a quarter of before) so farming shop gear for Bia stops; potions cost
     40% less (their sell-back price follows, so nothing can be bought low and sold high). */
'use strict';

Object.assign(ITEMS, {
  drill_i:{name:'สว่านเจาะรู', en:'Socket Drill', kind:'mat', buy:9000, sell:200, desc:['เจาะช่อง Card เพิ่ม 1 ช่องที่ช่างเจาะ (มีโอกาสล้มเหลว · ของไม่เสีย)', 'Adds 1 card socket at the smith (can fail · the piece is safe)']},
  drill_g:{name:'สว่านทองคำ', en:'Golden Drill', kind:'mat', buy:32000, sell:600, desc:['เจาะช่อง Card เพิ่ม 1 ช่อง โอกาสสูงกว่า: ช่อง 1 = 100% · ช่อง 2 = 80% · ช่อง 3 = 50% · ล้มเหลวของไม่เสีย', 'Adds 1 card socket with better odds: 1st 100% · 2nd 80% · 3rd 50% · a failure never harms the piece']},
  drill_d:{name:'สว่านเพชร', en:'Diamond Drill', kind:'mat', buy:160000, sell:2500, desc:['เจาะช่อง Card สำเร็จแน่นอน 100% · ดรอปจากบอส', 'Adds a card socket, never fails · dropped by bosses']}
});
const DR = {use:'drill_i', sel:null, last:null};
const DR_RATE = [90, 60, 30], DRG_RATE = [100, 80, 50];
const drRate = (tool, k) => (tool === 'drill_d' ? 100 : tool === 'drill_g' ? DRG_RATE[k] : DR_RATE[k]);
const drOk = key => { const it = ITEMS[key]; return !!(it && it.base && typeof sockable === 'function' && sockable(it) && typeof sockData === 'function' && sockData(key)); };
const drFee = key => { const it = ITEMS[key], k = sockN(key); return Math.round((400 + (it.lv || 1) * 30) * (k + 1) * (k + 1)); };
function drTargets(){
  const worn = Object.values(S.gear || {}).filter(drOk), bag = Object.keys(S.inv).filter(k => S.inv[k] > 0 && drOk(k) && !worn.includes(k));
  return [...new Set(worn)].concat(bag.sort((a, b) => sockN(a) - sockN(b) || (ITEMS[b].lv || 0) - (ITEMS[a].lv || 0)));
}
function drGo(key){
  if (!drOk(key)) return; const k = sockN(key), it = ITEMS[key]; if (k >= 3){ toast(L('เจาะครบ 3 ช่องแล้ว', 'Already has 3 sockets')); return; }
  const tool = (DR.use === 'drill_d' || DR.use === 'drill_g') && haveN(DR.use) ? DR.use : 'drill_i', fee = drFee(key);
  if (!haveN(tool)){ toast(L(`ต้องมี${nm(ITEMS[tool])}`, `You need a ${nm(ITEMS[tool])}`)); return; }
  if (S.bia < fee){ toast(L('เงินไม่พอ', 'Not enough Bia')); return; }
  S.bia -= fee; S.inv[tool]--; if (!S.inv[tool]) delete S.inv[tool];
  const rate = drRate(tool, k), ok = Math.random() * 100 < rate;
  if (ok){ const d = sockData(key); d.k = k + 1; d.c = d.c || []; regInst(key, d); if (Object.values(S.gear || {}).includes(key)) derive();
    log(L(`เจาะรูสำเร็จ! ${nm(it)} มี ${k + 1} ช่อง`, `Drilled! ${nm(it)} now has ${k + 1} sockets`), 'g'); SFX.play('quest'); VFX.play('refine', {x:P.x, y:P.y, ok:true}); }
  else { log(L(`เจาะรูไม่สำเร็จ · ${nm(it)} ยังปลอดภัย`, `The drill slipped · ${nm(it)} is unharmed`), 'r'); SFX.play('bf_end'); }
  DR.last = {ok, k:ok ? k + 1 : k, key}; DR.sel = key; dirty = true; save(); WIN_RENDER.forge();
}
/* the Forge gets a Drill tab */
{ const _wr = WIN_RENDER.forge;
  WIN_RENDER.forge = function(){
    const r = _wr.apply(this, arguments); const pane = el('pane-forge'); if (!pane) return r;
    const tabs = pane.querySelector('.fgtabs'); if (tabs && !tabs.querySelector('[data-fgtab="drill"]')) tabs.children[0].insertAdjacentHTML('afterend', `<button class="${RF.tab === 'drill' ? 'on' : ''}" data-fgtab="drill">${L('เจาะรู', 'Drill')}</button>`);
    if (RF.tab !== 'drill') return r;
    tabs.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.fgtab === 'drill'));
    const list = drTargets(); if (!list.includes(DR.sel)) DR.sel = list[0] || null;
    const pips = key => `<span class="drpips">${[0, 1, 2].map(i => `<i class="${i < sockN(key) ? 'on' : ''}"></i>`).join('')}</span>`;
    const tile = key => `<button class="rftile${DR.sel === key ? ' on' : ''} rr${rarOf(key)}" data-drsel="${key}"><span class="ic">${itemIcon(key)}</span><small>${nm(ITEMS[key])}</small>${pips(key)}</button>`;
    let stage = `<p class="hint">${L('ไม่มีอุปกรณ์ที่เจาะได้ · อาวุธและชุดที่ได้จากมอน คราฟต์ หรือซื้อจากร้าน (ไม่ใช่ชุดเริ่มต้นหรือเครื่องประดับ)', 'Nothing to drill · weapons and wearables from monsters, crafting or the shop (not starter pieces or accessories)')}</p>`;
    const key = DR.sel;
    if (key){ const k = sockN(key), it = ITEMS[key], full = k >= 3, fee = drFee(key), hi = haveN('drill_i'), hd = haveN('drill_d');
      const hg = haveN('drill_g'); if (DR.use !== 'drill_i' && !haveN(DR.use)) DR.use = hi ? 'drill_i' : hg ? 'drill_g' : hd ? 'drill_d' : 'drill_i'; const rate = full ? 0 : drRate(DR.use, k);
      const res = DR.last && DR.last.key === key ? `<div class="rfres ${DR.last.ok ? 'ok' : 'fail'}">${DR.last.ok ? `✦ ${L('เจาะสำเร็จ', 'Drilled')} · ${DR.last.k}/3 ✦` : L('ล้มเหลว · อุปกรณ์ไม่เสีย', 'Failed · the piece is safe')}</div>` : '';
      const tool = (id, h, txt) => `<label class="rftog${h ? '' : ' off'}"><input type="radio" name="drtool" data-druse="${id}" ${DR.use === id ? 'checked' : ''} ${h ? '' : 'disabled'}><span class="ic">${itemIcon(id)}</span><span><b>${nm(ITEMS[id])} <em>×${h}</em></b><small>${txt}</small></span></label>`;
      stage = `<div class="rfstage${DR.last && DR.last.key === key ? (DR.last.ok ? ' ok' : ' fail') : ''}">
        <div class="rfanvil"><i class="rfray"></i><div class="rfbig">${itemIcon(key)}</div><b class="rflv">${k}/3</b></div>
        <b class="rfname rar r${rarOf(key)}">${nm(it)}</b>${pips(key)}${res}
        ${full ? `<p class="rfmax">${L('เจาะครบ 3 ช่องแล้ว', 'All 3 sockets drilled')}</p>` : `
        <div class="rfstep"><span>${k}</span><i>➜</i><span class="nx">${k + 1}</span></div>
        <div class="pbar rate rfrate"><i style="width:${rate}%"></i><span>${L('โอกาสสำเร็จ', 'Success')} ${rate}%</span></div>
        <div class="rftogs">${tool('drill_i', hi, L(`ช่องที่ ${k + 1}: ${DR_RATE[k]}%`, `Socket ${k + 1}: ${DR_RATE[k]}%`))}${tool('drill_g', hg, L(`ช่องที่ ${k + 1}: ${DRG_RATE[k]}%`, `Socket ${k + 1}: ${DRG_RATE[k]}%`))}${tool('drill_d', hd, L('สำเร็จ 100%', 'Always works'))}</div>
        <div class="rfneed"><span class="cneed${S.bia >= fee ? ' ok' : ''}"><i class="cz"><i class="biaI"></i></i>${fmtN(fee)} ${CUR()}</span></div>
        <p class="hint">${L('ล้มเหลว: เสียแค่สว่านกับค่าแรง อุปกรณ์และการ์ดที่ใส่อยู่ไม่เสีย', 'On failure only the drill and the fee are spent: the piece and its cards are safe')}</p>
        <button class="btn gold rfgo" data-drgo="${key}" ${haveN(DR.use) && S.bia >= fee ? '' : 'disabled'}>⛏ ${L('เจาะรู', 'Drill')}</button>
        ${!hi && !hg && !hd ? `<button class="btn sm" data-fgbuy="drill_i">${L('ซื้อสว่านเจาะรู', 'Buy a Socket Drill')} · ${fmtN(ITEMS.drill_i.buy)}</button>` : ''}`}</div>`; }
    const worn = new Set(Object.values(S.gear || {}));
    const body = `<div class="rfwrap"><div class="rflist">
      <div class="sec">${L('สวมอยู่', 'Worn')}</div><div class="rftiles">${list.filter(k => worn.has(k)).map(tile).join('') || `<p class="hint">${L('ไม่มี', 'None')}</p>`}</div>
      <div class="sec">${L('ในกระเป๋า', 'In your bag')}</div><div class="rftiles">${list.filter(k => !worn.has(k)).map(tile).join('') || `<p class="hint">${L('ไม่มี', 'None')}</p>`}</div>
      <p class="hint">${L('เจาะได้สูงสุด 3 ช่อง · ช่อง 1: 90% · ช่อง 2: 60% · ช่อง 3: 30% · สว่านเพชร 100%', 'Up to 3 sockets · 1st 90% · 2nd 60% · 3rd 30% · Diamond Drill 100%')}</p></div>${stage}</div>`;
    const head = pane.querySelector('.fghead'); pane.innerHTML = (head ? head.outerHTML : '') + body;
    return r;
  };
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-drsel],[data-drgo]'); if (!b || b.disabled) return;
  if (b.dataset.drsel){ DR.sel = b.dataset.drsel; DR.last = null; WIN_RENDER.forge(); } else drGo(b.dataset.drgo); });
document.addEventListener('change', e => { const u = e.target.dataset && e.target.dataset.druse; if (u){ DR.use = u; WIN_RENDER.forge(); } });
/* drills are sold only by Driller Manee (v29: her own shop, below) */
/* Diamond Drills from bosses */
EV.on('kill', m => { if (!m || !m.def || !m.def.boss || m.minion) return; const ch = m.wb ? .5 : m.dg ? .3 : .12;
  if (Math.random() < ch){ dropLoot('drill_d', m.x + rand(-12, 12), m.y + rand(-6, 6)); } });

/* ---------- the socket-and-refine smith ---------- */
addTownNpc({id:'driller', name:'ช่างเจาะมณี', en:'Driller Manee', role:'เจาะรู', roleEn:'Drill', x:650, y:860},
  {job:'merchant' in JOBS ? 'merchant' : 'warlord', look:{sex:'f', hair:4, color:'hairBrown'}, gear:{armor:'a_padded'}});
if (typeof NPC_TAG !== 'undefined') NPC_TAG.driller = ['ช่างเจาะมณี', 'เจาะรู', 'Driller Manee', 'Drill'];
/* her shop: the three drills, bought by the piece or in bulk */
const DR_SHOP = ['drill_i', 'drill_g', 'drill_d'];
const drShopRow = id => { const it = ITEMS[id]; return `<div class="srow" data-drshop="${id}"><span class="ic">${itemIcon(id)}</span><div class="nm"><b>${nm(it)} <span class="ct">${L('มี', 'have')} ${haveN(id)}</span></b><small>${itemDesc(id)}</small></div><span class="pr">${fmtN(it.buy)}</span>${qtyBox(id)}</div>`; };
NPC_OPEN.driller = n => npcFrame(n, L('อยากได้ช่องใส่การ์ดเพิ่มใช่ไหม? ซื้อสว่านจากร้านข้า แล้วเอาอุปกรณ์มาให้ข้าเจาะได้เลย', 'Want more card sockets? Buy a drill from my shop, then bring me the piece.'),
  `<div class="sec">${L('ร้านสว่านเจาะรู', 'Drill shop')} <span class="ct">${fmtN(S.bia)} ${CUR()}</span></div><div class="shop">${DR_SHOP.map(drShopRow).join('')}</div>
   <div class="row"><button class="btn gold wide" data-fgopen="drill" data-fgonly="drill">⛏ ${L('เจาะรู', 'Drill')}</button></div>
   <p class="hint">${L('สว่านเจาะรู: ช่อง 1 = 90% · ช่อง 2 = 60% · ช่อง 3 = 30% · สว่านทองคำ: 100% · 80% · 50% · สว่านเพชร สำเร็จเสมอ · ล้มเหลวของไม่เสีย', 'Socket Drill: 1st 90% · 2nd 60% · 3rd 30% · Golden Drill: 100% · 80% · 50% · Diamond Drill always works · a failure never harms the piece')}</p>`);
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-fgbuy-open]'); if (b) RF.shop = 'mat'; }, true);
/* their pictures */
if (typeof iaPick === 'function'){ const _pick = iaPick;
  iaPick = function(id){ if (id !== 'drill_i' && id !== 'drill_d' && id !== 'drill_g') return _pick.apply(this, arguments); const p = 'ia' + id + '§', dia = id === 'drill_d', gold = id === 'drill_g', ol = typeof OL !== 'undefined' ? OL : 'stroke="#2a1c10" stroke-width="1.4"';
    return {p, frame:dia ? 3 : gold ? 2 : 1, glow:dia ? '#9fe8ff' : '#ffd36a', art:['', `<path d="M8 12h14l3 4-3 4H8z" fill="${gold ? '#e8b030' : '#8a5a2e'}" ${ol}/><path d="M25 14l8 2-8 2z" fill="${dia ? '#bff4ff' : gold ? '#fff0a0' : '#c8ccd4'}" ${ol}/><path d="M10 20l-2 12h6l1-12z" fill="#5a3a20" ${ol}/>${dia ? '<path d="M28 11l2 3-2 3-2-3z" fill="#e8fbff" style="filter:drop-shadow(0 0 2px #9fe8ff)"/>' : ''}<path d="M11 14h9" stroke="#e8c890" stroke-width="1"/>`]}; }; }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'drill', t:['เจาะรูอุปกรณ์', 'Drilling sockets'], b:() => `<p>${L('คุยกับช่างเจาะมณี (ข้างโรงตีเหล็กในอาเรน) หรือแท็บ "เจาะรู" ในโรงตีเหล็ก', 'Talk to Driller Manee (by the forge in Aren) or open the Forge\'s "Drill" tab')}</p>
  <ul><li>${L('เพิ่มช่อง Card ได้ทีละ 1 จนครบ 3 ช่อง · อาวุธและชุดทุกชิ้นที่ใส่การ์ดได้ (รวมของจากร้าน)', 'One more card socket at a time, up to 3 · any weapon or wearable that takes cards (shop pieces too)')}</li>
  <li>${L('สว่านเจาะรู: 90% / 60% / 30% · สว่านเพชร: 100% (ดรอปจากบอส)', 'Socket Drill: 90% / 60% / 30% · Diamond Drill: 100% (boss drop)')}</li><li>${L('ล้มเหลวเสียแค่สว่านกับค่าแรง', 'A failure costs only the drill and the fee')}</li></ul>`});
{ const st = document.createElement('style'); st.textContent = '.drpips{display:inline-flex;gap:3px;margin:3px auto 0}.drpips i{width:9px;height:9px;border-radius:50%;border:1.5px solid #ffd34a;background:rgba(0,0,0,.35)}.drpips i.on{background:#ffd34a;box-shadow:0 0 5px #ffd34a}'; document.head.appendChild(st); }

/* ---------- economy ---------- */
for (const id in ITEMS){ const it = ITEMS[id]; if (it && it.kind === 'gear' && !it.base && it.sell) it.sell = Math.max(1, Math.round(it.sell * .25)); }   // base gear: instances copy it (rarity.js)
for (const id of ['redpot', 'orangepot', 'whitepot', 'elixirpot', 'bluepot', 'bigbluepot', 'skypot', 'divinepot']){ const it = ITEMS[id]; if (!it || !it.buy) continue;
  it.buy = Math.max(5, Math.round(it.buy * .6 / 5) * 5); if (it.sell != null) it.sell = Math.min(it.sell, Math.floor(it.buy * .25)); }
if (typeof GEAR !== 'undefined') for (const id in GEAR) if (ITEMS[id] && GEAR[id].slot !== 'ammo') GEAR[id].sell = ITEMS[id].sell;

/* (v27) Driller Manee only drills: her window shows the Drill tab alone (refining, buying and selling stay with the smith) */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-fgopen]'); if (b) RF._only = b.dataset.fgonly || null; }, true);
{ const _ow = openWin; openWin = function(id, ...a){ if (id === 'forge'){ RF.only = RF._only || null; RF._only = null; if (RF.only) RF.tab = RF.only; } return _ow.call(this, id, ...a); }; }
{ const _wr2 = WIN_RENDER.forge;
  WIN_RENDER.forge = function(){ if (RF.only) RF.tab = RF.only; else if (RF.tab === 'drill') RF.tab = 'refine';   // (v27) the smith refines, buys and sells; drilling is Driller Manee's alone
    const r = _wr2.apply(this, arguments), p = el('pane-forge'), tabs = p && p.querySelector('.fgtabs');
    if (tabs) for (const b of [...tabs.querySelectorAll('[data-fgtab]')]) if (RF.only ? b.dataset.fgtab !== RF.only : b.dataset.fgtab === 'drill') b.remove();
    return r; }; }
