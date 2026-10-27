/* VAYRATHEN — js/sys/cardui.js — cards, the easy way (v27)
   · Cards go only into what you are WEARING. The Equipment window shows each worn piece's sockets right under it:
     a filled socket (tap ✕ to take the card out) or an empty one with "+ ใส่การ์ด", which opens a picker of the
     cards you own that fit that place. A piece with no socket says so and where to drill one.
   · In the bag, a card shows the one worn piece it can go into and, if it cannot, exactly why (nothing worn there,
     no socket, sockets full) — the old screen just showed nothing, which looked like a broken card.
   · Tap any worn piece (its icon or name) to see its details: rarity, refine, stats, sockets, and Take off.
   · Fixes the old window that read the pre-socket card slots (it always showed "empty" and its ✕ did nothing). */
'use strict';

const CU = {pick:null};
const cuSlotName = sl => (typeof EQ_LBL !== 'undefined' && EQ_LBL[sl] ? L(...EQ_LBL[sl]) : L(SLOT_TH[sl] || sl, SLOT_EN[sl] || sl));
const cuOwned = sl => Object.keys(S.cards || {}).filter(c => S.cards[c] > 0 && CARDS[c] && CARDS[c].slot === (sl === 'acc2' ? 'acc' : sl));
/* the sockets of the piece worn in sl, as buttons */
/* compact version for the paper doll: socket pips and a small + */
function cuSocketsMini(sl){
  if (!EQ_SOCKET.includes(sl)) return '';
  const id = S.gear && S.gear[sl], it = id && ITEMS[id]; if (!it) return '';
  const n = sockN(id), cs = sockCards(id); if (!n) return `<div class="cusm"><small>${L('ไม่มีช่อง Card', 'No socket')}</small></div>`;
  const has = cuOwned(sl).length;
  return `<div class="cusm">${Array.from({length:n}, (_, i) => cs[i] ? `<span class="cup on" title="${escH(nm(CARDS[cs[i]]) + ' · ' + cardDesc(cs[i]))}" data-eqinfo="${sl}">◆</span>` : `<button class="cup add" data-cupick="${sl}" title="${L('ใส่การ์ด', 'Slot a card')}" ${has ? '' : 'disabled'}>＋</button>`).join('')}</div>`;
}
function cuSockets(sl, still){
  if (!EQ_SOCKET.includes(sl)) return `<div class="cusock none"><small>${L('ช่องนี้ใส่การ์ดไม่ได้', 'This place takes no cards')}</small></div>`;
  const id = S.gear && S.gear[sl], it = id && ITEMS[id];
  if (!it) return `<div class="cusock none"><small>${L('สวมอุปกรณ์ก่อนจึงจะใส่การ์ดได้', 'Wear something here to slot cards')}</small></div>`;
  const n = sockN(id), cs = sockCards(id);
  if (!n) return `<div class="cusock none"><small>${L('ชิ้นนี้ไม่มีช่อง Card · เจาะรูได้ที่ช่างเจาะมณี', 'No card socket · Driller Manee can drill one')}</small></div>`;
  const has = cuOwned(sl).length;
  return `<div class="cusock">${Array.from({length:n}, (_, i) => cs[i]
    ? `<span class="cuc on" title="${escH(cardDesc(cs[i]))}">◆ ${escH(nm(CARDS[cs[i]]))}<button data-sockout="${id}|${i}" aria-label="${L('ถอดการ์ด', 'Remove card')}">✕</button></span>`
    : still ? `<span class="cuc free">◇ ${L('ว่าง', 'Empty')}</span>` : `<button class="cuc add" data-cupick="${sl}" ${has ? '' : 'disabled'}>＋ ${has ? L('ใส่การ์ด', 'Slot a card') : L('ไม่มีการ์ดช่องนี้', 'No card for here')}</button>`).join('')}</div>`;
}
/* the equipment window: our sockets instead of the old one, and taps open details */
{ const _es = eqSlot;
  eqSlot = function(sl){
    const html = _es.apply(this, arguments); if (!S || sl === 'ammo') return html;
    const t = document.createElement('template'); t.innerHTML = html.trim(); const root = t.content.firstElementChild; if (!root) return html;
    const old = root.querySelector('.eqsock'), mini = cuSocketsMini(sl); if (old) old.outerHTML = mini; else if (mini) (root.querySelector('.eqtx') || root).insertAdjacentHTML('beforeend', mini);
    const id = S.gear && S.gear[sl]; if (id && ITEMS[id]) for (const n of root.querySelectorAll('.eqbox,.eqtx')){ n.dataset.eqinfo = sl; n.style.cursor = 'pointer'; }
    return root.outerHTML; };
}
/* the card picker for one worn place: a tidy list — small picture, name, effect, how many, one button (v27h) */
const cuThumb = c => { const a = cardArt(c); return `<span class="cuth ${cardRarity(c)}">${a ? `<img src="${a}" alt="">` : '◆'}</span>`; };
function cuPicker(sl){
  const id = S.gear && S.gear[sl], it = id && ITEMS[id]; if (!it) return;
  const r = {r3:0, r2:1, r1:2}, list = cuOwned(sl).sort((a, b) => (r[cardRarity(a)] - r[cardRarity(b)]) || cardTitle(a).localeCompare(cardTitle(b), 'th')), free = sockN(id) - sockCards(id).length;
  cuModal(`<h3>${L('การ์ดสำหรับ', 'Cards for')} ${escH(nm(it))}</h3><small class="cuhint">${cuSlotName(sl)} · ${L('ช่องว่าง', 'free sockets')} ${free}/${sockN(id)}</small>
    ${cuSockets(sl, true)}
    <div class="culist">${list.length ? list.map(c => `<div class="curow">${cuThumb(c)}<div class="cutx"><b>${escH(cardTitle(c))} <span class="ct">×${S.cards[c]}</span></b><small>${escH(cardDesc(c))}</small></div><button class="btn sm gold" data-cuput="${c}|${id}" ${free > 0 ? '' : 'disabled'}>${L('ใส่', 'Slot')}</button></div>`).join('')
      : `<p class="empty">${L(`ยังไม่มีการ์ดสำหรับ${cuSlotName(sl)}`, `No card for ${cuSlotName(sl)} yet`)}</p>`}</div>`, 'pick');
  CU.info = null; CU.pick = sl;
}
/* details of a worn piece */
function cuInfo(sl){
  const id = S.gear && S.gear[sl], it = id && ITEMS[id]; if (!it) return;
  const rf = it.rf ? ` <em class="eqrf">+${it.rf}</em>` : '', desc = it.desc ? L(...(Array.isArray(it.desc) ? it.desc : [it.desc, it.desc])) : '';
  cuModal(`<div class="cuinfo"><span class="eqbox">${itemIcon(id)}</span><div><h3 class="rar r${rarOf(id)}">${escH(nm(it))}${rf}</h3><small>${rarLine(id)} ${cuSlotName(sl)}${it.lv ? ` · Lv ${it.lv}` : ''}${it.wtype ? ` · ${L(...(WTYPE[it.wtype] || [it.wtype, it.wtype]))}` : ''}</small></div></div>
    <div class="custat">${gearLines(id)}</div>${desc ? `<p class="cudesc">${desc}</p>` : ''}
    <div class="sec">${L('ช่อง Card', 'Card sockets')}</div>${cuSockets(sl)}
    <div class="row"><button class="btn danger" data-unwear="${sl}" data-cuclose="1">${L('ถอดชิ้นนี้', 'Take it off')}</button><button class="btn" data-cuclose="1">${L('ปิด', 'Close')}</button></div>`);
  CU.info = sl;
}
function cuModal(html, kind){
  let m = el('cuModal'); if (!m){ m = document.createElement('div'); m.id = 'cuModal'; m.innerHTML = '<div class="cubox"></div>'; document.body.appendChild(m);
    m.addEventListener('click', e => { if (e.target === m) cuClose(); }); }
  const bx = m.querySelector('.cubox'); bx.className = 'cubox' + (kind ? ' ' + kind : ''); bx.innerHTML = `<button class="ibtn cux" data-cuclose="1" aria-label="${L('ปิด', 'Close')}">✕</button>` + html; m.hidden = false;
}
function cuClose(){ const m = el('cuModal'); if (m) m.hidden = true; CU.info = null; CU.pick = null; }
function cuRefresh(){ dirty = true;   /* (v126) the equipment window is redrawn once on the next frame, not here as well */ const m = el('cuModal'); if (m && !m.hidden){ if (CU.info) cuInfo(CU.info); else if (CU.pick) cuPicker(CU.pick); } }
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-cupick],[data-cuput],[data-eqinfo],[data-cuclose]'); if (!t) return;
  if (t.dataset.cuclose){ if (!t.dataset.unwear) cuClose(); else setTimeout(cuClose, 0); return; }
  e.stopPropagation();
  if (t.dataset.cupick) cuPicker(t.dataset.cupick);
  else if (t.dataset.cuput){ const [c, id] = t.dataset.cuput.split('|'); sockPut(c, id); cuRefresh(); }
  else if (t.dataset.eqinfo && !e.target.closest('[data-unwear],[data-sockout]')) cuInfo(t.dataset.eqinfo);
}, true);
/* removing a card from inside the details refreshes them (capture: sockets.js stops the click there) */
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#cuModal [data-sockout]')) setTimeout(cuRefresh, 0); }, true);

/* the bag's card view: the worn piece only, with the reason when it cannot go in */
{ const _bi = bagInfo;
  bagInfo = function(){ _bi.apply(this, arguments); const box = el('bagInfo'), c = BAG.sel; if (!box || !c || !CARDS[c] || BAG.tab !== 'card') return;
    const sl0 = CARDS[c].slot, sl = sl0 === 'acc' && S.gear && S.gear.acc2 && (!S.gear.acc || (sockN(S.gear.acc) <= sockCards(S.gear.acc).length && sockN(S.gear.acc2) > sockCards(S.gear.acc2).length)) ? 'acc2' : sl0, id = S.gear && S.gear[sl], it = id && ITEMS[id], n = it ? sockN(id) : 0, used = it ? sockCards(id).length : 0;
    const why = !it ? L(`ยังไม่ได้สวม${cuSlotName(sl)} · สวมก่อนแล้วค่อยใส่การ์ด`, `Nothing worn in ${cuSlotName(sl)} · wear something there first`)
      : !n ? L(`${nm(it)} ไม่มีช่อง Card · เจาะรูได้ที่ช่างเจาะมณี`, `${nm(it)} has no card socket · Driller Manee can drill one`)
      : used >= n ? L('ช่อง Card เต็ม · ถอดการ์ดเดิมก่อน', 'Sockets full · take a card out first') : '';
    const list = box.querySelector('.socklist'); if (list) list.remove();
    box.insertAdjacentHTML('beforeend', `<div class="socklist"><div class="cuwhere">${L('ใส่ได้ที่', 'Goes into')}: <b>${cuSlotName(sl)}</b></div>${it ? `<div class="socktgt"><span class="bico">${itemIcon(id)}</span><div><b class="rar r${it.rar || 0}">${escH(nm(it))}</b> <small class="ct">${L('สวมอยู่', 'worn')}</small>${sockRow(id)}</div><button class="btn sm gold" data-sockput="${c}|${id}" ${!why && S.cards[c] > 0 ? '' : 'disabled'}>${L('ใส่', 'Slot')}</button></div>` : ''}${why ? `<p class="cuwhy">${why}</p>` : ''}</div>`);
  }; }
{ const st = document.createElement('style');
  st.textContent = `.cusock{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;flex-basis:100%}.cusock.none small{opacity:.7;font-size:11px}
  .cuc{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:9px;font:600 11px/1.3 var(--display,sans-serif)}
  .cuc.on{border:1px solid #ffd34a;color:#ffe9a8;background:rgba(255,211,74,.14)}.cuc.on button{border:0;background:none;color:#ff9b9b;cursor:pointer;font-size:12px;padding:0 0 0 3px}
  .cuc.add{border:1px dashed #8fd0ff;color:#cfeaff;background:rgba(80,160,255,.12);cursor:pointer}.cuc.add:disabled{opacity:.5;cursor:default}.cuc.free{border:1px dashed rgba(255,255,255,.35);color:#c8d4ea}
  .cusm{display:flex;gap:3px;align-items:center;margin-top:2px}.cusm small{font-size:10px;opacity:.6}.cup{width:18px;height:18px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;line-height:1;padding:0}
  .cup.on{background:#ffd34a;color:#3a2400;border:1px solid #fff;cursor:pointer}.cup.add{background:rgba(80,160,255,.2);color:#cfeaff;border:1px dashed #8fd0ff;cursor:pointer}.cup.add:disabled{opacity:.35;cursor:default}
  #cuModal{position:fixed;inset:0;z-index:9000;background:rgba(10,14,30,.55);display:flex;align-items:center;justify-content:center;padding:16px}#cuModal[hidden]{display:none}
  .cubox{position:relative;width:min(440px,100%);max-height:86vh;overflow:auto;padding:16px 16px 12px;border-radius:16px;background:linear-gradient(180deg,#24345e,#18223e);border:2px solid rgba(255,255,255,.6);color:#eef4ff;box-shadow:0 10px 30px rgba(0,0,0,.4)}
  .cubox h3{margin:0 24px 2px 0;font-size:16px}.cubox .cux{position:absolute;right:8px;top:8px}.cuhint{opacity:.75}
  .culist{display:flex;flex-direction:column;gap:5px;margin-top:10px;max-height:52vh;overflow-y:auto;overflow-x:hidden;padding-right:2px}
  .curow{display:flex;align-items:center;gap:9px;padding:6px 8px;border-radius:10px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1)}
  .curow .cutx{flex:1;min-width:0}.curow .cutx b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.curow .cutx small{display:block;opacity:.85;font-size:11px;line-height:1.35}
  .curow .btn{flex:0 0 auto}.cuth{flex:0 0 40px;width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:radial-gradient(#5a4a2a,#2a2014);border:2px solid #c8a050}
  .cuth.r2{border-color:#a07aff}.cuth.r3{border-color:#ff6a5a;background:radial-gradient(#6a2a1a,#2a1010)}.cuth img{max-width:34px;max-height:34px;image-rendering:pixelated;object-fit:contain}
  .cubox.pick{width:min(380px,100%)}.cubox.pick .cusock{margin:8px 0 2px}
  .cuinfo{display:flex;gap:10px;align-items:center}.cuinfo .eqbox svg{width:44px;height:44px}.custat{margin:8px 0;font-size:12px;line-height:1.5}.cudesc{font-size:12px;opacity:.8}
  .cubox .row{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}.cuwhy{color:#ffc7a0;font-size:12px;margin:6px 0 0}.cuwhere{font-size:12px;opacity:.85;margin-bottom:4px}`;
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'cardsock', t:['การใส่การ์ด', 'Slotting cards'], b:() => `<ul>
  <li>${L('การ์ดใส่ได้เฉพาะอุปกรณ์ที่สวมอยู่ และต้องตรงช่อง (การ์ดหมวกใส่หมวก การ์ดอาวุธใส่อาวุธ …)', 'Cards go only into what you wear, in the matching place (a head card in your hat, a weapon card in your weapon …)')}</li>
  <li>${L('หน้าอุปกรณ์: ＋ = ช่องว่าง แตะเพื่อเลือกการ์ด · ◆ = การ์ดที่ใส่อยู่ · แตะชิ้นอุปกรณ์เพื่อดูรายละเอียดและถอดการ์ด', 'Equipment: ＋ is a free socket (tap to pick a card) · ◆ a slotted card · tap a piece for details and to take a card out')}</li>
  <li>${L('ชิ้นที่ไม่มีช่อง (ของจากร้าน ของเริ่มต้น) เจาะรูได้ที่ช่างเจาะมณี · การ์ดอยู่กับชิ้นนั้น ขาย/ย่อยแล้วการ์ดหายด้วย', 'Pieces without sockets (shop or starter gear) can be drilled by Driller Manee · cards stay in the piece: selling or salvaging it loses them')}</li></ul>`});
