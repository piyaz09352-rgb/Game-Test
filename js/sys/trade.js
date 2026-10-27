/* VAYRATHEN — js/sys/trade.js
   Player-to-player trade (แลกเปลี่ยน). Tap another hero → player card → Trade. When they accept, both get the
   trade window: put items and Bia on your side, press Lock; when both sides are locked press Confirm; when
   both confirm, each game swaps the goods. Any change to an offer unlocks both sides, so nobody can switch
   items after the other has looked. Worn gear, quest items and seal shards cannot be traded.
   (v98) Cards trade too (from the card bag, S.cards; cards sitting in a socket stay with their piece). The window
   shows the three steps (add → lock → confirm) with a line saying what to do next, each side's slots and status,
   a bag picker with tabs (gear, cards, consumables, other) and search, a picked item with its details and an
   amount, and quick Bia buttons. It is redrawn only when something on it changed, so it never blinks.
   The other side's offer is untrusted: only real item ids, sane counts and cleaned instance stats are taken. */
'use strict';

const TRADE = {peer:null, name:'', open:false, mine:{items:[], z:0}, theirs:{items:[], z:0}, lockMe:false, lockThem:false, okMe:false, okThem:false, pend:null,
  ui:{tab:'all', q:'', sel:null, qty:1}, chgT:0, html:''};
const tIsCard = id => typeof CARDS !== 'undefined' && !!CARDS[id];
const tDef = id => (tIsCard(id) ? CARDS[id] : ITEMS[id]);
const tHave = id => (tIsCard(id) ? (S.cards && S.cards[id]) || 0 : S.inv[id] || 0);
const tradable = id => (tIsCard(id) ? tHave(id) > 0 : ITEMS[id] && ITEMS[id].kind !== 'key' && !ITEMS[id].forgeOnly && id !== 'shard' && !Object.values(S.gear || {}).includes(id));
function tSend(k, extra = {}){ if (!NET.room || !TRADE.peer) return; NET.room.emit('trade', {k, to:TRADE.peer, n:netName(), ...extra}).catch(() => {}); }
function tReset(){ Object.assign(TRADE, {peer:null, name:'', open:false, mine:{items:[], z:0}, theirs:{items:[], z:0}, lockMe:false, lockThem:false, okMe:false, okThem:false}); if (UIS.open.trade) closeWin('trade'); }
function tradeRequest(peer, name){
  if (!NET.room || !NET.on){ toast(L('ต้องออนไลน์ก่อน', 'You need to be online')); return; }
  if (TRADE.open){ toast(L('กำลังแลกของอยู่', 'Already trading')); return; }
  TRADE.peer = peer; TRADE.name = name; tSend('req'); toast(L(`ส่งคำขอแลกของถึง ${name}`, `Trade request sent to ${name}`));
}
function tradeOpen(){ TRADE.open = true; TRADE.mine = {items:[], z:0}; TRADE.theirs = {items:[], z:0}; TRADE.lockMe = TRADE.lockThem = TRADE.okMe = TRADE.okThem = false; TRADE.ui = {tab:'all', q:'', sel:null, qty:1}; TRADE.chgT = 0; TRADE.html = ''; openWin('trade'); SFX.play('quest'); }
function tOffer(){ TRADE.lockMe = TRADE.lockThem = TRADE.okMe = TRADE.okThem = false;
  const items = TRADE.mine.items.map(([id, n]) => ITEMS[id] && ITEMS[id].base ? [id, n, instStore()[id]] : [id, n]); tSend('offer', {items, z:TRADE.mine.z}); WIN_RENDER.trade(); }
function tAdd(id, n){
  if (!TRADE.open || TRADE.lockMe || !tradable(id)) return; const cur = TRADE.mine.items.find(x => x[0] === id), have = tHave(id), inOffer = cur ? cur[1] : 0;
  const add = Math.min(n === 'all' ? have : Math.max(1, n | 0), have - inOffer); if (add <= 0) return; if (cur) cur[1] += add; else { if (TRADE.mine.items.length >= 12) return toast(L('ใส่ได้สูงสุด 12 ช่อง', 'Up to 12 kinds')); TRADE.mine.items.push([id, add]); }
  if (have - inOffer - add <= 0) TRADE.ui.sel = null;
  tOffer();
}
function tRemove(id){ TRADE.mine.items = TRADE.mine.items.filter(x => x[0] !== id); tOffer(); }
function tBia(v){ TRADE.mine.z = Math.max(0, Math.min(S.bia, Math.floor(+v || 0))); tOffer(); }
/* both confirmed: re-check my side, then swap */
function tExecute(){
  const mine = TRADE.mine, theirs = TRADE.theirs;
  if (S.bia < mine.z || mine.items.some(([id, n]) => tHave(id) < n || !tradable(id))){ tSend('cancel'); toast(L('ของไม่ครบ ยกเลิกการแลก', 'Your items changed: trade cancelled')); tReset(); return; }
  for (const [id, n] of mine.items){ const bag = tIsCard(id) ? S.cards : S.inv; bag[id] -= n; if (bag[id] <= 0) delete bag[id]; }
  S.bia -= mine.z;
  for (const [id, n, inst] of theirs.items){ if (tIsCard(id)){ S.cards = S.cards || {}; S.cards[id] = (S.cards[id] || 0) + n; continue; } if (inst){ const d = sanitizeInst(inst); if (!d) continue; instStore()[id] = d; regInst(id, d); } if (ITEMS[id]) addItem(id, n); }
  S.bia += theirs.z; bump('trades'); EV.emit('trade'); SFX.play('trade');
  log(L(`แลกของกับ ${TRADE.name} สำเร็จ`, `Trade with ${TRADE.name} complete`), 'g'); banner(L('แลกของสำเร็จ!', 'Trade complete!'));
  dirty = true; save(); tReset();
}
function onTrade(msg){
  const d = msg.data || {}; if (msg.isMe || d.to !== myPeer()) return; const who = clean(d.n, 18) || L('นักผจญภัย', 'Adventurer');
  if (d.k === 'req'){ if (TRADE.open) return; sysPrompt(L(`${who} ขอแลกของกับคุณ`, `${who} wants to trade`), () => { TRADE.peer = msg.peer; TRADE.name = who; tSend('acc'); tradeOpen(); }, () => { TRADE.peer = msg.peer; tSend('no'); TRADE.peer = null; }); SFX.play('chat'); return; }
  if (msg.peer !== TRADE.peer) return;
  if (d.k === 'acc'){ tradeOpen(); return; }
  if (d.k === 'no'){ toast(L(`${who} ปฏิเสธการแลก`, `${who} declined`)); TRADE.peer = null; return; }
  if (!TRADE.open) return;
  if (d.k === 'offer'){ const items = []; for (const x of (Array.isArray(d.items) ? d.items : []).slice(0, 12)){ if (!Array.isArray(x)) continue; const id = String(x[0] || ''), n = clamp(x[1] | 0, 1, 99999);
      if (x[2]){ const inst = sanitizeInst(x[2]); if (inst && /^[a-z_0-9]+~[a-z0-9]+$/.test(id)){ regInst(id, inst); items.push([id, 1, inst]); } } else if (tIsCard(id)) items.push([id, Math.min(n, 999)]); else if (ITEMS[id] && !ITEMS[id].base && ITEMS[id].kind !== 'key' && id !== 'shard') items.push([id, n]); }
    if (TRADE.lockMe || TRADE.lockThem) TRADE.chgT = Date.now() + 5000;   // they changed an offer that was already locked: say so on their side
    TRADE.theirs = {items, z:clamp(Math.floor(+d.z || 0), 0, 1e9)}; TRADE.lockMe = TRADE.lockThem = TRADE.okMe = TRADE.okThem = false; }
  if (d.k === 'lock') TRADE.lockThem = !!d.on;
  if (d.k === 'ok'){ TRADE.okThem = true; if (TRADE.okMe) tExecute(); }
  if (d.k === 'cancel'){ toast(L(`${who} ยกเลิกการแลก`, `${who} cancelled the trade`)); tReset(); return; }
  WIN_RENDER.trade();
}
EV.on('netready', () => { if (NET.room) NET.room.on('trade', onTrade, () => {}); });

/* ---------- player card (tap another hero) ---------- */
function playerMenu(gh){
  const q = gh.q || {}, who = clean(q.n, 18) || L('นักผจญภัย', 'Adventurer');
  let b = el('pcard'); if (!b){ b = document.createElement('div'); b.id = 'pcard'; b.className = 'pcard'; el('ui').appendChild(b); }
  b.innerHTML = `<div class="pch"><b class="pcn"></b><small>${JOBS[q.j] ? nm(JOBS[q.j]) : ''} · Lv ${clamp(q.l | 0, 1, 999)}</small>${q.ti && titleTxt(q.ti) ? `<em style="color:${titleCol(q.ti)}">«${titleTxt(q.ti)}»</em>` : ''}${q.gn ? `<em class="pcg">⟨${escH(clean(q.gn, 16))}⟩</em>` : ''}</div>
    <button class="btn sm" data-pcact="party">${L('ชวนปาร์ตี้', 'Party invite')}</button><button class="btn sm gold" data-pcact="trade">${L('แลกของ', 'Trade')}</button>${S.guild ? `<button class="btn sm" data-pcact="guild">${L('ชวนเข้ากิลด์', 'Guild invite')}</button>` : ''}<button class="btn sm" data-pcact="close">✕</button>`;
  b.querySelector('.pcn').textContent = who; b.hidden = false; b._gh = gh;
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-pcact]'); if (!t) return; const b = el('pcard'), gh = b._gh, q = (gh && gh.q) || {}; b.hidden = true;
  const a = t.dataset.pcact; if (!gh || a === 'close') return;
  if (a === 'party') partyInvite(gh.peer); else if (a === 'trade') tradeRequest(gh.peer, clean(q.n, 18) || L('นักผจญภัย', 'Adventurer')); else if (a === 'guild') guildInvite(gh.peer);
});

/* ---------- window ---------- */
mkWin('trade', 'แลกเปลี่ยน', 'Trade', '', '', false);
const T_TABS = [['all', 'ทั้งหมด', 'All'], ['gear', 'อุปกรณ์', 'Gear'], ['card', 'การ์ด', 'Cards'], ['use', 'ของใช้', 'Consumables'], ['etc', 'อื่น ๆ', 'Other']];
const tTabOf = id => (tIsCard(id) ? 'card' : ITEMS[id].kind === 'gear' ? 'gear' : ITEMS[id].kind === 'use' ? 'use' : 'etc');
const tInOffer = id => { const x = TRADE.mine.items.find(o => o[0] === id); return x ? x[1] : 0; };
const tLeft = id => tHave(id) - tInOffer(id);
const tName = id => (tIsCard(id) ? escH(nm(CARDS[id])) : rarName(id));
const tInfo = id => (tIsCard(id) ? escH(cardDesc(id)) : ITEMS[id].st ? gearLines(id) : escH(itemDesc(id)));
function tBagList(){ const u = TRADE.ui, q = u.q.trim().toLowerCase();
  const ids = Object.keys(S.inv).filter(k => S.inv[k] > 0 && !tIsCard(k) && tradable(k)).concat(Object.keys(S.cards || {}).filter(k => S.cards[k] > 0 && tIsCard(k)));
  return ids.filter(k => tLeft(k) > 0 && (u.tab === 'all' || tTabOf(k) === u.tab) && (!q || `${tDef(k).name} ${tDef(k).en || ''}`.toLowerCase().includes(q)))
    .sort((a, b) => T_TABS.findIndex(t => t[0] === tTabOf(a)) - T_TABS.findIndex(t => t[0] === tTabOf(b)) || ((ITEMS[b] && ITEMS[b].rar) || 0) - ((ITEMS[a] && ITEMS[a].rar) || 0) || nm(tDef(a)).localeCompare(nm(tDef(b)))); }
function tSide(o, me){
  const lock = me ? TRADE.lockMe : TRADE.lockThem, ok = me ? TRADE.okMe : TRADE.okThem, chg = !me && TRADE.chgT > Date.now();
  const st = ok ? ['ok', L('ยืนยันแล้ว', 'Confirmed')] : lock ? ['lk', L('ล็อกแล้ว', 'Locked')] : ['ed', L('กำลังเลือกของ', 'Choosing')];
  const rows = o.items.map(([id, n]) => `<div class="tr-it"><span class="bico">${itemIcon(id)}</span><div class="tr-itx"><b>${tName(id)}${tIsCard(id) ? ` <i class="tr-tag">${L('การ์ด', 'Card')}</i>` : ''}</b><small>${tInfo(id)}</small></div><em>×${fmtN(n)}</em>${me && !TRADE.lockMe ? `<button class="tr-x" data-trem="${id}" aria-label="${L('เอาออก', 'Remove')}">✕</button>` : ''}</div>`).join('');
  const z = me && !TRADE.lockMe ? `<div class="tr-z"><label>${L('เงิน', 'Bia')} <i class="biaI"></i><input id="tZ" type="number" inputmode="numeric" min="0" max="${S.bia}" value="${o.z}"></label>
      <span class="tr-zq">${[1e3, 1e4, 1e5].map(v => `<button class="btn sm" data-tzadd="${v}">+${fmtN(v)}</button>`).join('')}<button class="btn sm" data-tzadd="0">${L('ล้าง', 'Clear')}</button></span><small>${L('มีอยู่', 'You have')} <i class="biaI"></i>${fmtN(S.bia)}</small></div>`
    : `<div class="tr-z"><span>${L('เงิน', 'Bia')}</span><b><i class="biaI"></i>${fmtN(o.z)}</b></div>`;
  return `<section class="tr-side ${st[0]}${chg ? ' chg' : ''}"><header><b>${me ? L('ของคุณ', 'Your offer') : `<span class="tnm"></span>`}</b><span class="tr-cnt">${o.items.length}/12</span><span class="tr-st ${st[0]}">${st[1]}</span></header>
    ${chg ? `<p class="tr-chg">${L('อีกฝ่ายเปลี่ยนของ ตรวจอีกครั้งก่อนยืนยัน', 'They changed their offer: check it again')}</p>` : ''}
    <div class="tr-list">${rows || `<p class="tr-empty">${me ? L('ยังไม่มีของ · เลือกจากกระเป๋าด้านล่าง', 'Nothing yet · pick from your bag below') : L('ยังไม่มีของ', 'Nothing yet')}</p>`}</div>${z}</section>`;
}
function tStep(){ return TRADE.okMe ? [3, L(`รอ ${TRADE.name} กดยืนยัน`, `Waiting for ${TRADE.name} to confirm`)]
  : TRADE.lockMe && TRADE.lockThem ? [3, L('ตรวจของทั้งสองฝั่งให้ดี แล้วกด "ยืนยันแลก"', 'Check both sides, then press "Confirm"')]
  : TRADE.lockMe ? [2, L(`รอ ${TRADE.name} ล็อกข้อเสนอ`, `Waiting for ${TRADE.name} to lock`)]
  : [1, L('ใส่ของหรือเงินที่จะให้ แล้วกด "ล็อกข้อเสนอ"', 'Add items or Bia, then press "Lock offer"')]; }
function tBagHTML(){
  const u = TRADE.ui, list = tBagList(), sel = u.sel && tLeft(u.sel) > 0 ? u.sel : null, left = sel ? tLeft(sel) : 0, qty = sel ? clamp(u.qty | 0, 1, left) : 1;
  const one = sel && !tIsCard(sel) && ITEMS[sel].kind === 'gear';
  const pick = sel ? `<div class="tr-pick"><span class="bico">${itemIcon(sel)}</span><div class="tr-itx"><b>${tName(sel)}</b><small>${tInfo(sel)}</small></div>
      ${one ? '' : `<span class="tr-qty"><button class="btn sm" data-tqty="-1">−</button><input id="tQty" type="number" inputmode="numeric" min="1" max="${left}" value="${qty}"><button class="btn sm" data-tqty="1">+</button><button class="btn sm" data-tqty="all">${L('ทั้งหมด', 'All')} ${fmtN(left)}</button></span>`}
      <button class="btn gold" data-tput="1">${L('ใส่ในการแลก', 'Add to trade')}</button></div>`
    : `<p class="tr-pickhint">${L('แตะของในกระเป๋าเพื่อดูรายละเอียดและใส่ในการแลก', 'Tap something in your bag to see it and add it')}</p>`;
  const grid = list.map(k => `<button class="bslot${ITEMS[k] && ITEMS[k].rar ? ' r' + ITEMS[k].rar : ''}${k === sel ? ' sel' : ''}${tIsCard(k) ? ' card' : ''}" data-tsel="${k}" title="${escH(nm(tDef(k)))}">${itemIcon(k)}${tLeft(k) > 1 ? `<em>${fmtN(tLeft(k))}</em>` : ''}</button>`).join('');
  return `<div class="tr-tabs">${T_TABS.map(([k, th, en]) => `<button class="${u.tab === k ? 'on' : ''}" data-ttab="${k}">${L(th, en)}</button>`).join('')}<input id="tQ" type="search" placeholder="${L('ค้นหา', 'Search')}" value="${escH(u.q)}"></div>
    ${pick}<div class="tr-bag" id="tBagGrid">${grid || `<p class="tr-empty">${L('ไม่มีของที่แลกได้ในหมวดนี้', 'Nothing tradable here')}</p>`}</div>`;
}
WIN_RENDER.trade = function(){
  const pane = el('pane-trade'); if (!pane) return;
  if (!TRADE.open){ const h = `<p class="hint">${L('แตะตัวละครผู้เล่นอื่นแล้วเลือก "แลกของ"', 'Tap another player and choose "Trade"')}</p>`; if (TRADE.html !== h){ TRADE.html = h; pane.innerHTML = h; } return; }
  // item art carries fresh ids on every draw, so "did anything change" is asked of the state, not of the markup
  const sig = JSON.stringify([TRADE.mine, TRADE.theirs, TRADE.lockMe, TRADE.lockThem, TRADE.okMe, TRADE.okThem, TRADE.ui, TRADE.chgT > Date.now(), TRADE.name, S.bia, S.inv, S.cards, typeof LANG !== 'undefined' ? LANG : '']);
  if (sig === TRADE.html) return;   // nothing changed: no redraw, no blink
  const [step, say] = tStep();
  const h = `<ol class="tr-steps">${[L('ใส่ของ', 'Add'), L('ล็อกข้อเสนอ', 'Lock'), L('ยืนยันแลก', 'Confirm')].map((t, i) => `<li class="${i + 1 < step ? 'done' : i + 1 === step ? 'on' : ''}"><b>${i + 1}</b>${t}</li>`).join('')}</ol>
    <p class="tr-say">${say}</p>
    <div class="tr-w">${tSide(TRADE.mine, true)}<div class="tr-mid">⇄</div>${tSide(TRADE.theirs, false)}</div>
    <div class="tr-btns"><button class="btn" data-tact="cancel">${L('ยกเลิกการแลก', 'Cancel trade')}</button><button class="btn${TRADE.lockMe ? '' : ' gold'}" data-tact="lock" ${TRADE.okMe ? 'disabled' : ''}>${TRADE.lockMe ? L('ปลดล็อกเพื่อแก้ไข', 'Unlock to edit') : L('ล็อกข้อเสนอ', 'Lock offer')}</button>
      <button class="btn jade" data-tact="ok" ${TRADE.lockMe && TRADE.lockThem && !TRADE.okMe ? '' : 'disabled'}>${L('ยืนยันแลก', 'Confirm')}</button></div>
    ${TRADE.lockMe ? '' : `<div class="tr-bagw">${tBagHTML()}</div>`}`;
  const f = document.activeElement, fid = f && pane.contains(f) ? f.id : '', cur = fid && f.selectionStart != null ? [f.selectionStart, f.selectionEnd] : null, sc = pane.querySelector('#tBagGrid') ? pane.querySelector('#tBagGrid').scrollTop : 0;
  TRADE.html = sig; pane.innerHTML = h;
  const tn = pane.querySelector('.tnm'); if (tn) tn.textContent = TRADE.name;
  const g = pane.querySelector('#tBagGrid'); if (g) g.scrollTop = sc;
  if (fid && el(fid)){ const n = el(fid); n.focus(); if (cur) try { n.setSelectionRange(cur[0], cur[1]); } catch (e) {} }
};
const tRedraw = () => { if (UIS.open.trade) WIN_RENDER.trade(); };
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('#pane-trade [data-tsel],#pane-trade [data-ttab],#pane-trade [data-tqty],#pane-trade [data-tput],#pane-trade [data-tzadd],#pane-trade [data-trem],#pane-trade [data-tact]'); if (!t || t.disabled) return; const d = t.dataset, u = TRADE.ui;
  if (d.tsel){ u.sel = u.sel === d.tsel ? null : d.tsel; u.qty = 1; tRedraw(); }
  else if (d.ttab){ u.tab = d.ttab; tRedraw(); }
  else if (d.tqty){ const left = u.sel ? tLeft(u.sel) : 1; u.qty = d.tqty === 'all' ? left : clamp((u.qty | 0) + +d.tqty, 1, left); tRedraw(); }
  else if (d.tput){ if (u.sel) tAdd(u.sel, !tIsCard(u.sel) && ITEMS[u.sel].kind === 'gear' ? 1 : u.qty); }
  else if (d.tzadd != null){ if (!TRADE.lockMe) tBia(+d.tzadd ? TRADE.mine.z + +d.tzadd : 0); }
  else if (d.trem){ if (!TRADE.lockMe) tRemove(d.trem); }
  else if (d.tact === 'cancel'){ tSend('cancel'); tReset(); }
  else if (d.tact === 'lock'){ TRADE.lockMe = !TRADE.lockMe; TRADE.okMe = false; tSend('lock', {on:TRADE.lockMe}); WIN_RENDER.trade(); }
  else if (d.tact === 'ok'){ TRADE.okMe = true; tSend('ok'); if (TRADE.okThem) tExecute(); else WIN_RENDER.trade(); }
});
document.addEventListener('input', e => { const t = e.target; if (!t || !t.closest || !t.closest('#pane-trade')) return;
  if (t.id === 'tQ'){ TRADE.ui.q = t.value.slice(0, 30); tRedraw(); } else if (t.id === 'tQty'){ TRADE.ui.qty = clamp(+t.value | 0, 1, TRADE.ui.sel ? tLeft(TRADE.ui.sel) : 1); } });
document.addEventListener('change', e => { const t = e.target; if (t && t.id === 'tZ' && t.closest('#pane-trade')) tBia(t.value); });
document.addEventListener('keydown', e => { const t = e.target; if (t && t.closest && t.closest('#pane-trade') && t.tagName === 'INPUT'){ e.stopPropagation(); if (e.key === 'Enter' && t.id === 'tQty' && TRADE.ui.sel) tAdd(TRADE.ui.sel, TRADE.ui.qty); } }, true);
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-wclose="trade"]'); if (t && TRADE.open){ tSend('cancel'); tReset(); } }, true);
EV.on('tick', () => { if (TRADE.open && TRADE.chgT && TRADE.chgT <= Date.now()){ TRADE.chgT = 0; tRedraw(); } });
