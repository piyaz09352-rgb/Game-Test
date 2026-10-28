/* VAYRATHEN — js/sys/mail.js — (v103) ระบบจดหมาย · mail
   Write to any player, online or not: a subject, a message, Bia and one stack of an item (gear keeps its own rolls).
   · Window "จดหมาย" (menu) has two tabs: the inbox and "เขียนจดหมาย". Pick a friend, search a hero by name, or press
     "ส่งจดหมาย" on another player's card.
   · Postage: 100 Bia, +200 with an item, +1% of the Bia you send. Up to 40 letters wait in a box.
   · Mail lives in the shared database (mail/<id>, field `to`): the recipient's box listens to it while online; a red
     dot on the menu button counts letters not read yet. Taking an attachment holds a short lease so it cannot be
     taken twice. Letters stay readable after their attachments are taken; delete them yourself.
   · System letters (sys) are what the game sends you itself (the weekly tower rewards, js/sys/towerweek.js). Vayra
     Coins in a letter count only when it was written by your own game (from === you), so nobody can mail coins.
   Nothing runs per frame: one database listener, and a 5-second check that it is on. */
'use strict';

const ML_FEE = 100, ML_ITEM_FEE = 200, ML_MAX = 40, ML_SUBJ = 30, ML_MSG = 300;
const ML = {rows:[], sub:null, uid:null, tab:'in', open:null, busy:false, known:null, to:null, toN:'', q:'', found:[], z:'', item:'', n:1, s:'', m:'', t:0};
const mlOk = () => typeof NET !== 'undefined' && !!NET.db && !!NET.uid;
const mlFee = (z, item) => ML_FEE + (item ? ML_ITEM_FEE : 0) + Math.round(Math.max(0, z) * .01);
const mlValid = r => r && typeof r.to === 'string' && typeof r.from === 'string' && +r.at > 0;   // (v166) not (r.at | 0): a millisecond time does not fit in 32 bits, and on some days it turned negative and every letter vanished
const mlHasAtt = r => !r.taken && ((r.z | 0) > 0 || (r.i && (r.n | 0) > 0) || (r.c | 0) > 0);
const mlUnread = () => ML.rows.filter(r => !r.rd).length;
/* what may go in an envelope: not quest keys, not forge-only dust, not the wedding ring */
const mlSendable = id => { const it = ITEMS[id]; return !!it && (S.inv[id] | 0) > 0 && it.kind !== 'key' && !it.forgeOnly && id !== 'ring_love'; };

/* ---------- the inbox listener ---------- */
function mlListen(){
  if (!mlOk() || (ML.sub && ML.uid === NET.uid)) return;
  if (ML.sub){ try { ML.sub(); } catch (e) {} }
  ML.uid = NET.uid; ML.known = null;
  try { ML.sub = NET.db.collection('mail').where('to', '==', NET.uid).limit(80).onSnapshot(s => mlRows(s.docs.map(d => ({id:d.id, ...d.data()}))), () => {}); } catch (e) { ML.sub = null; }
}
function mlRows(list){
  const rows = list.filter(mlValid).sort((a, b) => b.at - a.at);
  for (const r of rows) if (r.x && r.i && !ITEMS[r.i] && typeof sanitizeInst === 'function'){ const d = sanitizeInst(r.x); if (d && /^[a-z_0-9]+~[a-z0-9]+$/.test(r.i)) regInst(r.i, d); }
  const first = ML.known === null, fresh = first ? [] : rows.filter(r => !ML.known.has(r.id) && !r.rd);
  ML.known = new Set(rows.map(r => r.id)); ML.rows = rows;
  if (first){ const n = mlUnread(); if (n) log(L(`📬 มีจดหมายยังไม่อ่าน ${n} ฉบับ`, `📬 ${n} unread letter(s)`), 'g'); }
  for (const r of fresh.slice(0, 3)){ toast(L(`📬 จดหมายใหม่จาก ${clean(r.fn, 18) || 'ระบบ'}`, `📬 New mail from ${clean(r.fn, 18) || 'the game'}`)); SFX.play('chat'); }
  mlBadge(); if (ML.tab === 'in') reWin('mail');
}
EV.on('netready', () => setTimeout(mlListen, 800));
EV.on('tick', dt => { if ((ML.t += dt) < 5) return; ML.t = 0; if (mlOk() && (!ML.sub || ML.uid !== NET.uid)) mlListen(); });

/* the red dot on the menu button */
function mlBadge(){
  const b = document.querySelector('.mb[data-win="mail"]'); if (!b) return; const n = mlUnread();
  b.classList.toggle('mlnew', n > 0); b.dataset.mln = n > 9 ? '9+' : String(n);
}

/* ---------- sending ---------- */
async function mlPost(doc){ const key = `${String(doc.to).slice(-6)}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`; await NET.db.doc(`mail/${key}`).set(doc); return key; }
async function mlCount(uid){ try { const q = await NET.db.collection('mail').where('to', '==', uid).limit(ML_MAX + 1).get(); return q.docs.length; } catch (e){ return 0; } }
async function mlSend(){
  if (!mlOk()) return toast(L('ต้องออนไลน์ก่อน', 'You need to be online'));
  if (ML.busy) return; const to = ML.to, s = clean(ML.s, ML_SUBJ).trim(), m = clean(ML.m, ML_MSG).trim();
  const z = Math.max(0, Math.floor(+ML.z || 0)), id = ML.item && mlSendable(ML.item) ? ML.item : '', n = id ? clamp(ML.n | 0, 1, S.inv[id] | 0) : 0, fee = mlFee(z, id);
  if (!to) return toast(L('เลือกผู้รับก่อน', 'Pick who it goes to'));
  if (to === NET.uid) return toast(L('ส่งจดหมายหาตัวเองไม่ได้', 'You cannot mail yourself'));
  if (!s && !m && !z && !id) return toast(L('เขียนอะไรสักหน่อย หรือแนบของ', 'Write something or attach something'));
  if (S.bia < z + fee) return toast(L(`เงินไม่พอ (ส่ง ${fmtN(z)} + ค่าส่ง ${fmtN(fee)} เบี้ย)`, `Not enough Bia (${fmtN(z)} + ${fmtN(fee)} postage)`));
  ML.busy = true; reWin('mail');
  if (await mlCount(to) >= ML_MAX){ ML.busy = false; reWin('mail'); return toast(L('กล่องจดหมายของผู้รับเต็มแล้ว', "The recipient's mailbox is full")); }
  const inst = id && ITEMS[id].base && typeof instStore === 'function' ? instStore()[id] || null : null;
  S.bia -= z + fee; if (id){ S.inv[id] -= n; if (!S.inv[id]) delete S.inv[id]; if (inst && !S.inv[id]) delete instStore()[id]; }
  try {
    await mlPost({to, tn:clean(ML.toN, 18), from:NET.uid, fn:netName(), s, m, z, i:id || null, n, x:inst, c:0, at:Date.now(), sys:0, rd:0, taken:false});
    log(L(`ส่งจดหมายถึง ${clean(ML.toN, 18)} แล้ว${z ? ` · ${fmtN(z)} เบี้ย` : ''}${id ? ` · ${nm(ITEMS[id])} ×${n}` : ''} (ค่าส่ง ${fmtN(fee)})`, `Mail sent to ${clean(ML.toN, 18)}${z ? ` · ${fmtN(z)} Bia` : ''}${id ? ` · ${nm(ITEMS[id])} ×${n}` : ''} (postage ${fmtN(fee)})`), 'g');
    toast(L('📮 ส่งจดหมายแล้ว', '📮 Mail sent')); SFX.play('trade'); bump('mailSent'); EV.emit('mail', {k:'sent'});
    Object.assign(ML, {s:'', m:'', z:'', item:'', n:1});
  } catch (e){
    S.bia += z + fee; if (id){ if (inst) instStore()[id] = inst; addItem(id, n); }
    toast(L('ส่งไม่สำเร็จ ลองอีกครั้ง', 'Could not send, try again'));
  }
  ML.busy = false; dirty = true; save(); reWin('mail');
}
/* the game writing to you (weekly rewards): kept in your own box, coins honoured because from === you */
async function mlSystem(s, m, att = {}){
  if (!mlOk()) return false;
  try { await mlPost({to:NET.uid, tn:netName(), from:NET.uid, fn:L('ระบบวายรา', 'Vayrathen'), s:clean(s, 60), m:clean(m, 600), z:Math.max(0, att.z | 0), i:att.i || null, n:att.i ? Math.max(1, att.n | 0) : 0, x:null, c:Math.max(0, att.c | 0), at:Date.now(), sys:1, rd:0, taken:false}); return true; }
  catch (e){ return false; }
}

/* ---------- reading and taking ---------- */
async function mlRead(r){ if (!r || r.rd || !mlOk()) return; r.rd = 1; mlBadge(); try { await NET.db.doc(`mail/${r.id}`).update({rd:1}); } catch (e) {} }
async function mlTake(id, quiet){
  if (!mlOk() || ML.busy) return false; ML.busy = true; let ok = false;
  try {
    const ref = NET.db.doc(`mail/${id}`), lk = await ref.acquire({holder:NET.uid, ttlMs:4000});
    if (!lk.acquired){ if (!quiet) toast(L('กำลังรับของอยู่ ลองใหม่อีกครั้ง', 'Busy, try again')); ML.busy = false; return false; }
    const snap = await ref.get(), r = snap.exists ? snap.data() : null;
    if (!r || r.to !== NET.uid || !mlHasAtt(r)){ ML.busy = false; return false; }
    await ref.update({taken:true, rd:1});
    const got = [];
    if ((r.z | 0) > 0){ S.bia += r.z | 0; got.push(`${fmtN(r.z)} ${L('เบี้ย', 'Bia')}`); }
    if (r.i && (r.n | 0) > 0){ if (r.x && typeof sanitizeInst === 'function'){ const d = sanitizeInst(r.x); if (d){ instStore()[r.i] = d; regInst(r.i, d); } }
      if (ITEMS[r.i]){ addItem(r.i, r.n | 0); got.push(`${nm(ITEMS[r.i])} ×${r.n | 0}`); } }
    if ((r.c | 0) > 0 && r.from === NET.uid && r.sys && typeof coinAdd === 'function'){ coinAdd(r.c | 0, L('จดหมาย', 'mail')); got.push(`◈ ${r.c | 0}`); }
    const lr = ML.rows.find(x => x.id === id); if (lr){ lr.taken = true; lr.rd = 1; }
    if (got.length){ log(L(`รับจากจดหมาย: ${got.join(' · ')}`, `From the mail: ${got.join(' · ')}`), 'g'); if (!quiet){ VFX.play('coins', {x:P.x, y:P.y - 30}); SFX.play('drop2'); } }
    ok = true; dirty = true; save();
  } catch (e){ if (!quiet) toast(L('รับของไม่สำเร็จ', 'Could not take it')); }
  ML.busy = false; mlBadge(); reWin('mail'); return ok;
}
async function mlTakeAll(){ let n = 0; for (const r of ML.rows.slice()) if (mlHasAtt(r) && await mlTake(r.id, true)) n++;
  if (n){ toast(L(`รับของจากจดหมาย ${n} ฉบับ`, `Took the attachments of ${n} letter(s)`)); VFX.play('coins', {x:P.x, y:P.y - 30}); SFX.play('drop2'); } }
async function mlDelete(id){
  const r = ML.rows.find(x => x.id === id); if (!r || !mlOk()) return;
  const go = async () => { try { await NET.db.doc(`mail/${id}`).delete(); ML.rows = ML.rows.filter(x => x.id !== id); if (ML.open === id) ML.open = null; mlBadge(); reWin('mail'); } catch (e){ toast(L('ลบไม่สำเร็จ', 'Could not delete')); } };
  if (mlHasAtt(r)) askConfirm(L('ลบจดหมาย', 'Delete letter'), L('จดหมายนี้ยังมีของแนบที่ยังไม่ได้รับ ลบทิ้งเลยไหม?', 'This letter still holds attachments. Delete it anyway?'), L('ลบ', 'Delete'), go); else go();
}

/* ---------- finding someone to write to ---------- */
async function mlFind(){
  const q = clean(ML.q, 18).trim(); if (!q || !mlOk()) return;
  try { const s = await NET.db.collection('players').where('name', '==', q).limit(6).get();
    ML.found = s.docs.map(d => ({uid:d.id, ...d.data()})).filter(p => p.uid !== NET.uid); }
  catch (e){ ML.found = []; }
  if (!ML.found.length) toast(L('ไม่พบผู้เล่นชื่อนี้ (พิมพ์ชื่อตัวละครให้ตรงทุกตัวอักษร)', 'No hero by that name (type the exact name)'));
  reWin('mail');
}
function mlCompose(uid, name){ ML.to = uid; ML.toN = clean(name, 18); ML.tab = 'out'; ML.found = []; openWin('mail'); reWin('mail'); }

/* ---------- the window ---------- */
mkWin('mail', 'จดหมาย', 'Mail', '', '<rect x="3" y="5" width="14" height="10" rx="1.6"/><path d="M3.5 6l6.5 5 6.5-5"/>');
if (typeof MENU_ICONS !== 'undefined'){
  MENU_ICONS.mail = ['#ffe0a8', '#b0501a', `<rect x="6" y="9" width="20" height="15" rx="2.4" fill="${MI_C}"/><path d="M6.8 10.2L16 17.4l9.2-7.2" stroke="#c8562a" stroke-width="1.8" fill="none" stroke-linejoin="round"/><circle cx="24.5" cy="8.5" r="3.6" fill="#e04a2a" stroke="${MI_C}" stroke-width="1.2"/><path d="M23.3 8.6l.9.9 1.8-1.9" stroke="${MI_C}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`];
  if (typeof menuIconsApply === 'function') menuIconsApply();
}
const mlAgo = at => { const m = Math.max(0, Math.floor((Date.now() - at) / 60e3)); return m < 60 ? L(`${m} นาที`, `${m}m`) : m < 1440 ? L(`${Math.floor(m / 60)} ชม.`, `${Math.floor(m / 60)}h`) : L(`${Math.floor(m / 1440)} วัน`, `${Math.floor(m / 1440)}d`); };
function mlAttHTML(r){
  if (r.taken) return `<span class="mlatt off">${L('รับแล้ว', 'taken')}</span>`;
  const a = []; if ((r.z | 0) > 0) a.push(`<span class="mlatt"><i class="biaI"></i> ${fmtN(r.z)}</span>`);
  if (r.i && ITEMS[r.i]) a.push(`<span class="mlatt">${itemIcon(r.i)}<b>×${r.n | 0}</b></span>`);
  if ((r.c | 0) > 0 && r.sys && r.from === NET.uid) a.push(`<span class="mlatt">◈ ${r.c | 0}</span>`);
  return a.join('');
}
function mlInHTML(){
  if (!ML.rows.length) return `<p class="hint">${L('ยังไม่มีจดหมาย', 'No mail yet')}</p>`;
  const anyAtt = ML.rows.some(mlHasAtt);
  return `<div class="mlbar"><small>${ML.rows.length}/${ML_MAX} · ${L('ยังไม่อ่าน', 'unread')} ${mlUnread()}</small>${anyAtt ? `<button class="btn sm gold" data-mlall="1" ${ML.busy ? 'disabled' : ''}>${L('รับของทั้งหมด', 'Take all')}</button>` : ''}</div>
    <div class="mllist">${ML.rows.map(r => `<div class="mlrow${r.rd ? '' : ' new'}${r.sys ? ' sys' : ''}${ML.open === r.id ? ' open' : ''}" data-mlid="${r.id}">
      <div class="mlh" data-mlopen="${r.id}"><i>${r.sys ? '🏆' : r.rd ? '📭' : '📩'}</i><div class="mlt"><b class="mls"></b><small><span class="mlf"></span> · ${mlAgo(r.at)}</small></div><div class="mlas">${mlAttHTML(r)}</div></div>
      ${ML.open === r.id ? `<div class="mlbody"><p class="mlm"></p><div class="mlbtn">${mlHasAtt(r) ? `<button class="btn sm gold" data-mltake="${r.id}" ${ML.busy ? 'disabled' : ''}>${L('รับของ', 'Take')}</button>` : ''}${!r.sys && r.from !== NET.uid ? `<button class="btn sm" data-mlreply="${r.id}">${L('ตอบกลับ', 'Reply')}</button>` : ''}<button class="btn sm" data-mldel="${r.id}">${L('ลบ', 'Delete')}</button></div></div>` : ''}</div>`).join('')}</div>`;
}
function mlOutHTML(){
  const fr = typeof friends === 'function' ? Object.entries(friends()) : [];
  const inv = Object.keys(S.inv || {}).filter(mlSendable).sort((a, b) => nm(ITEMS[a]).localeCompare(nm(ITEMS[b])));
  if (ML.item && !mlSendable(ML.item)) ML.item = '';
  const z = Math.max(0, Math.floor(+ML.z || 0)), fee = mlFee(z, ML.item), max = ML.item ? S.inv[ML.item] | 0 : 0;
  return `<div class="mlout">
    <div class="mlsec">${L('ถึง', 'To')}</div>
    ${ML.to ? `<div class="mlto"><b class="mltn"></b><button class="btn sm" data-mlclear="1">${L('เปลี่ยน', 'Change')}</button></div>` : `
      ${fr.length ? `<div class="mlfr">${fr.map(([u, f]) => `<button class="btn sm" data-mlto="${u}" data-mln="${escH(f.n)}">${escH(f.n)}</button>`).join('')}</div>` : `<small class="hint">${L('ยังไม่มีเพื่อน · ค้นหาด้วยชื่อตัวละครได้', 'No friends yet · search by hero name')}</small>`}
      <div class="mlq"><input data-mlf="q" maxlength="18" placeholder="${L('ชื่อตัวละคร', 'Hero name')}"><button class="btn sm" data-mlfind="1">${L('ค้นหา', 'Search')}</button></div>
      ${ML.found.length ? `<div class="mlfr">${ML.found.map(p => `<button class="btn sm" data-mlto="${escH(p.uid)}" data-mln="${escH(clean(p.name, 18))}">${escH(clean(p.name, 18))} <small>Lv ${p.lvl | 0}</small></button>`).join('')}</div>` : ''}`}
    <div class="mlsec">${L('ข้อความ', 'Message')}</div>
    <input data-mlf="s" maxlength="${ML_SUBJ}" placeholder="${L('หัวเรื่อง', 'Subject')}">
    <textarea data-mlf="m" maxlength="${ML_MSG}" rows="3" placeholder="${L('เขียนข้อความ…', 'Write something…')}"></textarea>
    <div class="mlsec">${L('แนบ', 'Attach')}</div>
    <div class="mlrow2"><label><i class="biaI"></i> <input data-mlf="z" type="number" inputmode="numeric" min="0" max="${S.bia}" placeholder="0"></label><small>${L('มี', 'have')} ${fmtN(S.bia)}</small></div>
    <div class="mlrow2"><select data-mlf="item"><option value="">${L('— ไม่แนบไอเท็ม —', '— no item —')}</option>${inv.map(id => `<option value="${id}"${id === ML.item ? ' selected' : ''}>${escH(nm(ITEMS[id]))} (${fmtN(S.inv[id])})</option>`).join('')}</select>
      ${ML.item ? `<label>× <input data-mlf="n" type="number" inputmode="numeric" min="1" max="${max}"></label>` : ''}</div>
    <div class="mlsend"><small>${L('ค่าส่ง', 'Postage')} <b>${fmtN(fee)}</b> ${L('เบี้ย', 'Bia')} · ${L('รวม', 'total')} <b>${fmtN(fee + z)}</b></small><button class="btn gold" data-mlsend="1" ${ML.busy || !ML.to ? 'disabled' : ''}>📮 ${L('ส่ง', 'Send')}</button></div>
    <small class="hint">${L(`ค่าส่ง ${ML_FEE} เบี้ย · แนบไอเท็ม +${ML_ITEM_FEE} · แนบเงิน +1% · ผู้รับไม่ต้องออนไลน์ · กล่องละไม่เกิน ${ML_MAX} ฉบับ`, `Postage ${ML_FEE} Bia · +${ML_ITEM_FEE} with an item · +1% of Bia sent · the recipient may be offline · ${ML_MAX} letters a box`)}</small></div>`;
}
WIN_RENDER.mail = function(){
  const pane = el('pane-mail'); if (!pane) return;
  if (!mlOk()){ pane.innerHTML = `<p class="hint">${L('จดหมายใช้ได้เมื่อออนไลน์', 'Mail works when you are online')}</p>`; return; }
  mlListen();
  pane.innerHTML = `<div class="mlbox"><div class="mltabs"><button class="btn sm${ML.tab === 'in' ? ' gold' : ''}" data-mltab="in">📬 ${L('กล่องจดหมาย', 'Inbox')}${mlUnread() ? ` (${mlUnread()})` : ''}</button><button class="btn sm${ML.tab === 'out' ? ' gold' : ''}" data-mltab="out">✎ ${L('เขียนจดหมาย', 'Write')}</button></div>${ML.tab === 'in' ? mlInHTML() : mlOutHTML()}</div>`;
  // user text goes in as text, never as markup
  pane.querySelectorAll('.mlrow').forEach(row => { const r = ML.rows.find(x => x.id === row.dataset.mlid); if (!r) return;
    row.querySelector('.mls').textContent = clean(r.s, 60) || L('(ไม่มีหัวเรื่อง)', '(no subject)'); row.querySelector('.mlf').textContent = clean(r.fn, 18) || '—';
    const mm = row.querySelector('.mlm'); if (mm) mm.textContent = clean(r.m, 600) || L('(ไม่มีข้อความ)', '(no message)'); });
  const tn = pane.querySelector('.mltn'); if (tn) tn.textContent = '✉ ' + ML.toN;
  for (const k of ['q', 's', 'm', 'z', 'n']){ const f = pane.querySelector(`[data-mlf="${k}"]`); if (f) f.value = k === 'n' ? String(ML.n || 1) : ML[k] || ''; }
  mlBadge();
};
/* typing keeps its value in ML (no redraw while you type), changes that alter the totals redraw */
document.addEventListener('input', e => { const f = e.target.closest && e.target.closest('[data-mlf]'); if (!f) return; const k = f.dataset.mlf;
  ML[k] = k === 'n' ? Math.max(1, f.value | 0) : f.value;
  if (k === 'z' || k === 'n'){ const s = el('pane-mail') && el('pane-mail').querySelector('.mlsend small'); const z = Math.max(0, Math.floor(+ML.z || 0)), fee = mlFee(z, ML.item);
    if (s) s.innerHTML = `${L('ค่าส่ง', 'Postage')} <b>${fmtN(fee)}</b> ${L('เบี้ย', 'Bia')} · ${L('รวม', 'total')} <b>${fmtN(fee + z)}</b>`; } });
document.addEventListener('change', e => { const f = e.target.closest && e.target.closest('[data-mlf="item"]'); if (!f) return; ML.item = f.value; ML.n = 1; reWin('mail'); });
document.addEventListener('keydown', e => { const f = e.target.closest && e.target.closest('[data-mlf="q"]'); if (f && e.key === 'Enter'){ e.preventDefault(); mlFind(); } });
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-mltab],[data-mlopen],[data-mltake],[data-mldel],[data-mlreply],[data-mlall],[data-mlto],[data-mlclear],[data-mlfind],[data-mlsend],[data-pcact="mail"]'); if (!t) return;
  const d = t.dataset;
  if (d.pcact === 'mail'){ const gh = el('pcard') && el('pcard')._gh; if (gh && gh.by) mlCompose(gh.by, (gh.q && gh.q.n) || gh.name || ''); return; }
  if (d.mltab){ ML.tab = d.mltab; reWin('mail'); return; }
  if (d.mlopen){ ML.open = ML.open === d.mlopen ? null : d.mlopen; const r = ML.rows.find(x => x.id === d.mlopen); if (r) mlRead(r); reWin('mail'); return; }
  if (d.mltake){ mlTake(d.mltake); return; }
  if (d.mldel){ mlDelete(d.mldel); return; }
  if (d.mlreply){ const r = ML.rows.find(x => x.id === d.mlreply); if (r){ mlCompose(r.from, r.fn); ML.s = clean(('Re: ' + (r.s || '')), ML_SUBJ); reWin('mail'); } return; }
  if (d.mlall){ mlTakeAll(); return; }
  if (d.mlto){ ML.to = d.mlto; ML.toN = d.mln || ''; ML.found = []; reWin('mail'); return; }
  if (d.mlclear){ ML.to = null; ML.toN = ''; reWin('mail'); return; }
  if (d.mlfind){ const f = el('pane-mail').querySelector('[data-mlf="q"]'); if (f) ML.q = f.value; mlFind(); return; }
  if (d.mlsend) mlSend();
});
/* "ส่งจดหมาย" on another player's card */
if (typeof playerMenu === 'function'){ const _pm = playerMenu; playerMenu = function(gh){ const r = _pm.apply(this, arguments); const b = el('pcard'); if (!b || b.hidden || !gh || !gh.by) return r;
    const cl = b.querySelector('[data-pcact="close"]'); if (cl && !b.querySelector('[data-pcact="mail"]')) cl.insertAdjacentHTML('beforebegin', `<button class="btn sm" data-pcact="mail">✉ ${L('ส่งจดหมาย', 'Mail')}</button>`);
    return r; }; }

/* a GM backup holds the mail, and a world reset clears it with the rest (js/sys/gm.js) */
if (typeof GM_COLS !== 'undefined' && !GM_COLS.some(c => c[0] === 'mail')) GM_COLS.push(['mail']);
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'mail', t:['จดหมาย', 'Mail'], b:() => `<p>${L('ส่งข้อความ เงิน และไอเท็ม 1 ชนิดให้ผู้เล่นคนไหนก็ได้ แม้เขาจะออฟไลน์ (ต้องออนไลน์ตอนส่ง)', 'Send a message, Bia and one stack of an item to any player, even when they are offline (you need to be online to send)')}</p>
  <ul><li>${L('เปิดจากเมนู "จดหมาย" · เลือกเพื่อน ค้นหาด้วยชื่อตัวละคร หรือกด "ส่งจดหมาย" บนการ์ดผู้เล่น', 'Open "Mail" from the menu · pick a friend, search by hero name, or press "Mail" on a player card')}</li>
  <li>${L(`ค่าส่ง ${ML_FEE} เบี้ย · แนบไอเท็ม +${ML_ITEM_FEE} · แนบเงิน +1% · อุปกรณ์ส่งไปพร้อมออปชันเดิม · ของสำคัญและแหวนคู่รักส่งไม่ได้`, `Postage ${ML_FEE} Bia · +${ML_ITEM_FEE} with an item · +1% of Bia · gear keeps its rolls · quest keys and the Lovers' Ring cannot be sent`)}</li>
  <li>${L(`กล่องละไม่เกิน ${ML_MAX} ฉบับ · จุดแดงบนปุ่มเมนูบอกจำนวนที่ยังไม่อ่าน · รางวัลอันดับหอคอยรายสัปดาห์ส่งมาทางจดหมาย`, `Up to ${ML_MAX} letters a box · a red dot on the menu button counts unread ones · the weekly tower rewards arrive by mail`)}</li></ul>`});

{ const st = document.createElement('style'); st.textContent = `
#win-mail{width:min(500px,94vw)}.mb.mlnew{position:relative}.mb.mlnew::after{content:attr(data-mln);position:absolute;top:-3px;right:-3px;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:#e0302a;color:#fff;font:700 10.5px/16px Sarabun,sans-serif;text-align:center;box-shadow:0 0 0 1.5px #fff;pointer-events:none}
.mlbox{display:flex;flex-direction:column;gap:8px;color:#1b1b1b}.mltabs{display:flex;gap:6px}.mlbar{display:flex;justify-content:space-between;align-items:center;gap:8px}
.mllist{display:flex;flex-direction:column;gap:4px;max-height:52vh;overflow-y:auto}.mlrow{border-radius:10px;background:#f7f2e8;border:1.5px solid #ead8b0}.mlrow.new{background:#fff8e0;border-color:#e8b84a}.mlrow.sys{border-color:#c8b8ff;background:#f6f2ff}
.mlh{display:grid;grid-template-columns:26px 1fr auto;gap:8px;align-items:center;padding:6px 8px;cursor:pointer}.mlh i{font-style:normal;font-size:20px}.mlt{min-width:0}.mlt b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mlrow.new .mlt b{color:#a0400a}.mlt small{color:#5a4a30}
.mlas{display:flex;gap:4px;align-items:center}.mlatt{display:inline-flex;align-items:center;gap:2px;padding:1px 6px;border-radius:999px;background:#fff;border:1px solid #e3c88a;font-size:12px;font-weight:700}.mlatt .sico{width:20px;height:20px}.mlatt.off{color:#8a7a5a;font-weight:500}
.mlbody{padding:0 10px 8px 42px}.mlm{margin:0 0 6px;white-space:pre-wrap;word-break:break-word}.mlbtn{display:flex;gap:6px;flex-wrap:wrap}
.mlout{display:flex;flex-direction:column;gap:6px}.mlsec{font-weight:700;color:#7a3a14;border-bottom:1.5px solid #f0e2c0;padding-bottom:2px}.mlfr{display:flex;flex-wrap:wrap;gap:5px}.mlq,.mlrow2{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.mlout input,.mlout textarea,.mlout select{font:inherit;padding:5px 8px;border-radius:8px;border:1.5px solid #d8c8a0;background:#fff;color:#1b1b1b;min-width:0}.mlout textarea{resize:vertical}.mlq input{flex:1}.mlrow2 input[type=number]{width:110px}.mlrow2 select{flex:1;max-width:100%}
.mlto{display:flex;gap:8px;align-items:center}.mlto b{color:#1f5a8a}.mlsend{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}`;
  document.head.appendChild(st); }
