/* VAYRATHEN — js/sys/social2.js
   Friends (F), whispers and the player market (U).
   · Friends belong to the account. Tap a player → "Add friend"; once they accept you both see each other in
     the friends list with online status, map and level, and can whisper, invite to a party or remove.
   · Whisper: a private chat line ("W") that only that friend receives; pick "Whisper: name" in the chat box.
   · Player market (ตลาดกลาง): list an item from your bag with a price (2% listing fee). The item waits in
     the shared database at market/<id> even while you are offline; a buyer pays and takes it, and next time
     you open the market the Bia is collected for you. A purchase takes a short lease on the listing first, so
     two buyers can never both get it. Cancel any unsold listing to get the item back.
   Names and listings come from other players: drawn as text, ids checked against the game's own items. */
'use strict';

/* ---------- friends ---------- */
const friends = () => ACC.friends || (ACC.friends = {});
function friendReq(peer, name){
  if (!NET.room || !NET.on || !NET.uid) return toast(L('ต้องออนไลน์ก่อน', 'You need to be online'));
  NET.room.emit('fr', {k:'req', to:peer, n:netName(), a:ACC.name || ''}).catch(() => {}); toast(L(`ส่งคำขอเป็นเพื่อนถึง ${name}`, `Friend request sent to ${name}`));
}
function friendAdd(uid, n, a){ if (!uid || uid === NET.uid || !/^[\w-]{2,80}$/.test(uid)) return; friends()[uid] = {n:clean(n, 18), a:clean(a, 16), at:Date.now()}; accSave(true); bump('friends', 0); EV.emit('friend'); reWin('friends'); }
function onFr(msg){
  const d = msg.data || {}; if (msg.isMe || d.to !== myPeer() || !msg.by) return; const who = clean(d.n, 18) || L('นักผจญภัย', 'Adventurer');
  if (d.k === 'req'){ if (friends()[msg.by]) return; sysPrompt(L(`${who} ขอเป็นเพื่อนกับคุณ`, `${who} wants to be your friend`), () => { friendAdd(msg.by, d.n, d.a); NET.room.emit('fr', {k:'ok', to:msg.peer, n:netName(), a:ACC.name || ''}).catch(() => {}); toast(L(`${who} เป็นเพื่อนแล้ว`, `${who} is now your friend`)); }, () => {}); SFX.play('chat'); }
  if (d.k === 'ok'){ friendAdd(msg.by, d.n, d.a); toast(L(`${who} รับเป็นเพื่อนแล้ว`, `${who} accepted your request`)); SFX.play('quest'); }
}
const friendPeer = uid => (NET.room ? NET.room.peers().find(p => p.by === uid && p.kind === 'viewer' && !p.isMe) : null);
/* whisper: an extra chat channel option per friend */
function whisperTo(uid){
  const f = friends()[uid]; if (!f) return; const sel = el('chatCh'); if (!sel) return;
  let o = sel.querySelector(`option[value="w:${uid}"]`); if (!o){ o = document.createElement('option'); o.value = 'w:' + uid; o.textContent = L('กระซิบ: ', 'Whisper: ') + f.n; sel.appendChild(o); }
  sel.value = o.value; if (typeof chatShow === 'function') chatShow(); const inp = el('chatIn'); if (inp) inp.focus(); closeWin('friends');
}
EV.on('netready', () => { if (NET.room) NET.room.on('fr', onFr, () => {}); if (NET.db && NET.uid) setTimeout(mkCollect, 1500); });

mkWin('friends', 'เพื่อน', 'Friends', 'F', '<circle cx="7.5" cy="7" r="2.6"/><path d="M2.5 16c.6-2.8 2.6-4.2 5-4.2s4.4 1.4 5 4.2"/><path d="M15 6v5M12.5 8.5h5"/>');
WIN_RENDER.friends = function(){
  const pane = el('pane-friends'); if (!pane) return; const fs = Object.entries(friends());
  const rows = fs.map(([uid, f]) => ({uid, f, p:friendPeer(uid)})).sort((a, b) => !!b.p - !!a.p);
  pane.innerHTML = `<div class="sec">${L('เพื่อน', 'Friends')} <span class="ct">${rows.filter(r => r.p).length}/${rows.length} ${L('ออนไลน์', 'online')}</span></div>
    <div class="list">${rows.map((r, i) => { const q = (r.p && r.p.presence) || {};
      return `<div class="item"><span class="gdot${r.p ? ' on' : ''}"></span><div class="nm"><b class="pn" data-fi="${i}"></b><small>${r.f.a ? '@' + escH(r.f.a) + ' · ' : ''}${r.p ? `${JOBS[q.j] ? nm(JOBS[q.j]) : ''} Lv ${clamp(q.l | 0, 1, 999)} · ${MAPS[q.m] ? nm(MAPS[q.m]) : ''}` : L('ออฟไลน์', 'offline')}</small></div>
        ${r.p ? `<button class="btn sm" data-fw="${r.uid}">${L('กระซิบ', 'Whisper')}</button><button class="btn sm" data-fp="${r.p.peer}">${L('ชวนปาร์ตี้', 'Party')}</button>` : ''}<button class="btn sm" data-fdel="${r.uid}" title="${L('ลบเพื่อน', 'Remove')}">✕</button></div>`; }).join('') || `<p class="hint">${L('ยังไม่มีเพื่อน · แตะตัวละครผู้เล่นอื่นแล้วกด "เพิ่มเพื่อน"', 'No friends yet · tap another player and choose "Add friend"')}</p>`}</div>
    ${NET.room ? '' : `<p class="hint">${L('ระบบเพื่อนใช้ได้เมื่อเล่นผ่านลิงก์ claude.ai', 'Friends work when playing from the claude.ai link')}</p>`}`;
  pane.querySelectorAll('.pn[data-fi]').forEach(b => { b.textContent = rows[+b.dataset.fi].f.n || '—'; });
};
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-fw],[data-fp],[data-fdel],[data-pcact="friend"]'); if (!t) return; const d = t.dataset;
  if (d.pcact === 'friend'){ const gh = el('pcard')._gh; if (gh) friendReq(gh.peer, clean((gh.q || {}).n, 18)); return; }
  if (d.fw) whisperTo(d.fw); else if (d.fp) partyInvite(d.fp); else if (d.fdel) askConfirm(L('ลบเพื่อน', 'Remove friend'), L(`ลบ ${friends()[d.fdel].n} ออกจากรายชื่อ?`, `Remove ${friends()[d.fdel].n}?`), L('ลบ', 'Remove'), () => { delete friends()[d.fdel]; accSave(true); reWin('friends'); });
}, true);
{ const _pm = playerMenu; playerMenu = function(gh){ _pm(gh); const b = el('pcard'); if (b && !b.hidden && gh.by && !friends()[gh.by] && !b.querySelector('[data-pcact="friend"]')) b.querySelector('[data-pcact="close"]').insertAdjacentHTML('beforebegin', `<button class="btn sm" data-pcact="friend">${L('เพิ่มเพื่อน', 'Add friend')}</button>`); }; }

/* ---------- player market ---------- */
const MK = {tab:'buy', q:'', cat:'all', rows:[], mine:[], unsub:null, sel:null, price:'', n:1, busy:false};
const MK_MAX = 8, mkFee = p => Math.max(10, Math.round(p * .02));
const mkOk = () => NET.db && NET.uid;
function mkSub(){ if (MK.unsub || !mkOk()) return; MK.unsub = NET.db.collection('market').orderBy('at', 'desc').limit(150).onSnapshot(s => { MK.rows = s.docs.map(d => ({id:d.id, ...d.data()})).filter(mkValid); for (const r of MK.rows) if (r.x && !ITEMS[r.i]){ const d = sanitizeInst(r.x); if (d && /^[a-z_0-9]+~[a-z0-9]+$/.test(r.i)) regInst(r.i, d); } MK.rows = MK.rows.filter(r => ITEMS[r.i]); reWin('market'); }, () => {}); }
function mkValid(r){ return r && typeof r.i === 'string' && (ITEMS[r.i] || (r.x && sanitizeInst(r.x))) && (r.n | 0) > 0 && (r.p | 0) > 0; }
async function mkList(){
  if (!mkOk() || MK.busy) return; const id = MK.sel, n = clamp(MK.n | 0, 1, S.inv[id] || 0), p = Math.floor(+MK.price || 0);
  if (!id || !S.inv[id] || n < 1) return toast(L('เลือกของก่อน', 'Pick an item first')); if (ITEMS[id] && ITEMS[id].forgeOnly) return toast(L('ผงวายราใช้หลอมของเท่านั้น วางขายไม่ได้', 'Vayra Dust is for forging only and cannot be listed')); if (p < 1 || p > 1e9) return toast(L('ตั้งราคาให้ถูกต้อง', 'Set a valid price'));
  if (MK.mine.filter(r => !r.sold).length >= MK_MAX) return toast(L(`วางขายได้สูงสุด ${MK_MAX} รายการ`, `Up to ${MK_MAX} listings`)); const fee = mkFee(p); if (S.bia < fee) return toast(L('เงินไม่พอจ่ายค่าวางขาย', 'Not enough Bia for the fee'));
  MK.busy = true; const it = ITEMS[id], inst = it.base ? instStore()[id] : null;
  S.inv[id] -= n; if (!S.inv[id]) delete S.inv[id]; S.bia -= fee; if (inst) delete instStore()[id];
  const key = `${NET.uid.slice(-6)}${Date.now().toString(36)}`;
  try { await NET.db.doc(`market/${key}`).set({s:NET.uid, sn:netName(), sa:ACC.name || '', i:id, n, x:inst || null, p, at:Date.now(), sold:null, paid:false}); toast(L('วางขายแล้ว', 'Listed')); SFX.play('coin'); MK.sel = null; MK.price = ''; }
  catch (e){ addItem(id, n); if (inst) instStore()[id] = inst; S.bia += fee; toast(L('วางขายไม่สำเร็จ', 'Could not list')); }
  MK.busy = false; dirty = true; save(); mkMine();
}
async function mkBuy(r){
  if (!mkOk() || MK.busy || r.s === NET.uid) return; if (S.bia < r.p) return toast(L('เงินไม่พอ', 'Not enough Bia')); MK.busy = true;
  try { let why = '';
    const res = await dbClaim(NET.db.doc(`market/${r.id}`), cur => { why = !cur || cur.sold || !mkValid(cur) ? 'sold' : cur.s === NET.uid ? 'mine' : S.bia < cur.p ? 'bia' : '';
      return why ? null : {set:{sold:{b:NET.uid, bn:netName(), at:Date.now()}}}; });   // (v284) one transaction: nobody else can buy it in between
    if (res.busy){ toast(L('มีคนกำลังซื้อชิ้นนี้ ลองใหม่อีกครั้ง', 'Someone is buying this right now, try again')); MK.busy = false; return; }
    if (why === 'sold' || why === 'mine'){ toast(L('ขายไปแล้ว', 'Already sold')); MK.busy = false; return; }
    if (why){ toast(L('เงินไม่พอ', 'Not enough Bia')); MK.busy = false; return; }
    const cur = res.cur;
    S.bia -= cur.p; if (cur.x){ const d = sanitizeInst(cur.x); if (d){ instStore()[cur.i] = d; regInst(cur.i, d); } } if (ITEMS[cur.i]) addItem(cur.i, cur.n | 0);
    log(L(`ซื้อ ${nm(ITEMS[cur.i])} ×${cur.n} จาก ${clean(cur.sn, 18)} ราคา ${fmtN(cur.p)} เบี้ย`, `Bought ${nm(ITEMS[cur.i])} ×${cur.n} from ${clean(cur.sn, 18)} for ${fmtN(cur.p)} Bia`), 'g'); SFX.play('trade'); bump('trades'); EV.emit('trade');
  } catch (e){ toast(L('ซื้อไม่สำเร็จ', 'Purchase failed')); }
  MK.busy = false; dirty = true; save(); reWin('market');
}
async function mkMine(){ if (!mkOk()) return; try { const q = await NET.db.collection('market').where('s', '==', NET.uid).limit(30).get(); MK.mine = q.docs.map(d => ({id:d.id, ...d.data()})); } catch (e) {} reWin('market'); }
/* collect what sold while we were away, and give back cancelled items */
async function mkCollect(){
  if (!mkOk()) return; await mkMine(); let got = 0;
  for (const r of MK.mine) if (r.sold && !r.paid){ try { const ref = NET.db.doc(`market/${r.id}`), res = await dbClaim(ref, c => c && c.sold && !c.paid && c.s === NET.uid ? {set:{paid:true}} : null);   // (v284) paid once, even with two devices
    if (res.did){ const p = res.cur.p | 0; S.bia += p; got += p; } if (res.did || (res.cur && res.cur.paid)) await ref.delete().catch(() => {}); } catch (e) {} }
  if (got){ log(L(`ขายของในตลาดได้ ${fmtN(got)} เบี้ย`, `Market sales collected: ${fmtN(got)} Bia`), 'g'); banner(L(`ตลาดกลาง: ได้เงิน ${fmtN(got)} เบี้ย`, `Player market: +${fmtN(got)} Bia`)); SFX.play('coin'); dirty = true; save(); mkMine(); }
}
async function mkCancel(r){
  if (!mkOk() || MK.busy) return; MK.busy = true;
  try { const res = await dbClaim(NET.db.doc(`market/${r.id}`), cur => cur && !cur.sold && cur.s === NET.uid ? {del:true} : null);   // (v284) only while still unsold
    if (res.busy){ toast(L('มีคนกำลังซื้ออยู่', 'A buyer is busy with it')); MK.busy = false; return; }
    const cur = res.cur; if (!res.did){ MK.busy = false; return mkCollect(); }
    if (cur.x){ const d = sanitizeInst(cur.x); if (d){ instStore()[cur.i] = d; regInst(cur.i, d); } } if (ITEMS[cur.i]) addItem(cur.i, cur.n | 0); toast(L('ยกเลิกการขายแล้ว ของกลับเข้ากระเป๋า', 'Listing cancelled, item returned'));
  } catch (e){ toast(L('ยกเลิกไม่สำเร็จ', 'Could not cancel')); }
  MK.busy = false; dirty = true; save(); mkMine();
}
mkWin('market', 'ตลาดกลาง', 'Market', 'U', '<path d="M3 8l1.5-4h11L17 8"/><path d="M3 8h14v1.5a2.3 2.3 0 01-4.6 0 2.3 2.3 0 01-4.8 0A2.3 2.3 0 013 9.5z"/><path d="M4.5 11.5V17h11v-5.5M8.5 17v-3.5h3V17"/>');
WIN_RENDER.market = function(){
  const pane = el('pane-market'); if (!pane) return;
  if (!mkOk()){ pane.innerHTML = `<p class="hint">${L('ตลาดกลางใช้ได้เมื่อเปิดเกมผ่านลิงก์ claude.ai (ต้องออนไลน์)', 'The player market needs online play (open the game from its claude.ai link)')}</p>`; return; }
  mkSub(); if (!MK.mineT || Date.now() - MK.mineT > 15000){ MK.mineT = Date.now(); mkCollect(); }
  const tabs = [['buy', 'ซื้อ', 'Buy'], ['sell', 'วางขาย', 'Sell'], ['mine', 'ของฉัน', 'My listings']];
  let body = '';
  if (MK.tab === 'buy'){
    let rows = MK.rows.filter(r => !r.sold && r.s !== NET.uid); const cat = r => lootCat(r.i);
    if (MK.cat !== 'all') rows = rows.filter(r => cat(r) === MK.cat); if (MK.q) rows = rows.filter(r => ITEMS[r.i] && (ITEMS[r.i].name + ITEMS[r.i].en).toLowerCase().includes(MK.q));
    for (const r of rows) if (r.x && !ITEMS[r.i]){ const d = sanitizeInst(r.x); if (d) regInst(r.i, d); }
    body = `<div class="cslots">${[['all', 'ทั้งหมด', 'All'], ['gear', 'อุปกรณ์', 'Gear'], ['use', 'ใช้ของ', 'Consumables'], ['etc', 'วัสดุ', 'Loot'], ['mat', 'แร่/อื่น ๆ', 'Ore & misc']].map(([k, th, en]) => `<button class="${MK.cat === k ? 'on' : ''}" data-mkcat="${k}">${L(th, en)}</button>`).join('')}</div>
      <label class="wkq">${tabIcon('eye')}<input id="mkQ" placeholder="${L('ค้นหา…', 'Search…')}" value="${escH(MK.q)}" autocomplete="off"></label>
      <div class="shop mklist">${rows.map((r, i) => `<div class="srow"><span class="ic">${itemIcon(r.i)}</span><div class="nm"><b class="rar r${(ITEMS[r.i] || {}).rar || 0}">${nm(ITEMS[r.i])} ×${fmtN(r.n)}</b><small>${ITEMS[r.i].st ? gearLines(r.i) + ' · ' : ''}<span class="mks" data-ri="${i}"></span></small></div><span class="pr">${fmtN(r.p)}</span><button class="btn sm gold" data-mkbuy="${r.id}" ${S.bia >= r.p ? '' : 'disabled'}>${L('ซื้อ', 'Buy')}</button></div>`).join('') || `<p class="hint">${L('ยังไม่มีของวางขาย', 'Nothing for sale yet')}</p>`}</div>`;
    pane._rows = rows;
  } else if (MK.tab === 'sell'){
    const bag = Object.keys(S.inv).filter(k => S.inv[k] > 0 && ITEMS[k] && ITEMS[k].kind !== 'key' && k !== 'shard' && !Object.values(S.gear || {}).includes(k)), it = MK.sel && ITEMS[MK.sel];
    body = `<div class="tbag">${bag.map(k => `<button class="bslot${MK.sel === k ? ' sel' : ''}${ITEMS[k].rar ? ' r' + ITEMS[k].rar : ''}" data-mksel="${k}" title="${nm(ITEMS[k])}">${itemIcon(k)}${S.inv[k] > 1 ? `<em>${fmtN(S.inv[k])}</em>` : ''}</button>`).join('')}</div>
      ${it ? `<div class="mksell"><span class="bico">${itemIcon(MK.sel)}</span><div class="nm"><b class="rar r${it.rar || 0}">${nm(it)}</b><small>${it.st ? gearLines(MK.sel) : itemDesc(MK.sel) || ''} · ${L('ร้านรับซื้อ', 'Shop buys at')} ${fmtN(it.sell || 0)}</small></div>
        <label>${L('จำนวน', 'Qty')} <input id="mkN" type="number" min="1" max="${S.inv[MK.sel]}" value="${clamp(MK.n | 0, 1, S.inv[MK.sel])}"></label><label>${L('ราคารวม', 'Price')} <input id="mkP" type="number" min="1" value="${escH(MK.price)}" placeholder="${(it.sell || 10) * 2}"></label>
        <button class="btn gold" data-mklist="1">${L('วางขาย', 'List')}</button><small class="hint">${L('ค่าวางขาย 2%', 'Listing fee 2%')}${+MK.price ? ` = ${fmtN(mkFee(+MK.price))}` : ''}</small></div>` : `<p class="hint">${L('แตะของในกระเป๋าเพื่อวางขาย', 'Tap an item in your bag to sell it')}</p>`}`;
  } else {
    body = `<div class="shop">${MK.mine.map(r => `<div class="srow"><span class="ic">${ITEMS[r.i] ? itemIcon(r.i) : ''}</span><div class="nm"><b>${ITEMS[r.i] ? nm(ITEMS[r.i]) : r.i} ×${fmtN(r.n)}</b><small>${r.sold ? L('ขายแล้ว · กำลังรับเงิน', 'Sold · collecting') : L('รอผู้ซื้อ', 'Waiting for a buyer')}</small></div><span class="pr">${fmtN(r.p)}</span>${r.sold ? '' : `<button class="btn sm" data-mkcancel="${r.id}">${L('ยกเลิก', 'Cancel')}</button>`}</div>`).join('') || `<p class="hint">${L('ยังไม่มีของที่วางขาย', 'No listings')}</p>`}</div>
      <p class="hint">${L(`วางขายได้ ${MK_MAX} รายการ · เงินจากของที่ขายได้จะเข้ากระเป๋าเมื่อเปิดตลาดครั้งถัดไป`, `Up to ${MK_MAX} listings · money from sales arrives the next time you open the market`)}</p>`;
  }
  pane.innerHTML = `<div class="wktabs">${tabs.map(([k, th, en]) => `<button class="wktab${MK.tab === k ? ' on' : ''}" data-mktab="${k}"><span>${L(th, en)}</span></button>`).join('')}<span class="bagchip gold">${fmtN(S.bia)} ${CUR()}</span></div>${body}`;
  if (pane._rows) pane.querySelectorAll('.mks[data-ri]').forEach(b => { const r = pane._rows[+b.dataset.ri]; b.textContent = `${L('ผู้ขาย', 'Seller')}: ${clean(r.sn, 18)}${r.sa ? ' @' + clean(r.sa, 16) : ''}`; });
  for (const id of ['mkQ', 'mkN', 'mkP']){ const i = el(id); if (!i) continue; i.addEventListener('keydown', e => e.stopPropagation());
    i.addEventListener(id === 'mkQ' ? 'input' : 'change', () => { if (id === 'mkQ'){ MK.q = i.value.toLowerCase(); const p = i.selectionStart; WIN_RENDER.market(); const n = el('mkQ'); n.focus(); n.setSelectionRange(p, p); } else if (id === 'mkN') MK.n = +i.value; else { MK.price = i.value; } }); }
};
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-mktab],[data-mkcat],[data-mkbuy],[data-mksel],[data-mklist],[data-mkcancel]'); if (!t || t.disabled) return; const d = t.dataset;
  if (d.mktab){ MK.tab = d.mktab; if (d.mktab === 'mine') mkMine(); } else if (d.mkcat) MK.cat = d.mkcat; else if (d.mksel){ MK.sel = d.mksel; MK.n = 1; MK.price = ''; }
  else if (d.mklist){ const p = el('mkP'), n = el('mkN'); if (p) MK.price = p.value; if (n) MK.n = +n.value; mkList(); return; }
  else if (d.mkbuy){ const r = MK.rows.find(x => x.id === d.mkbuy); if (r) askConfirm(L('ซื้อของ', 'Buy'), L(`ซื้อ ${nm(ITEMS[r.i])} ×${r.n} ราคา ${fmtN(r.p)} เบี้ย?`, `Buy ${nm(ITEMS[r.i])} ×${r.n} for ${fmtN(r.p)} Bia?`), L('ซื้อ', 'Buy'), () => mkBuy(r)); return; }
  else if (d.mkcancel){ const r = MK.mine.find(x => x.id === d.mkcancel); if (r) mkCancel(r); return; }
  WIN_RENDER.market(); });
