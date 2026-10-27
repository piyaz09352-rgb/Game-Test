/* VAYRATHEN — js/sys/account.js
   Accounts (ไอดี). One account holds up to 3 characters and everything they share:
   · an account ID (@name, letters/digits/_ , unique among online players) and a number (#123456);
   · Vayra Coins (เหรียญวายรา) earned from dailies, achievements, the side story and the world boss;
   · the wardrobe (costumes unlocked for every character);
   · the account bank (คลังบัญชี) at Banker Thongdee in Aren: move items and Bia between your characters.
   Stored in this browser (vayrathen-account) and, when the game runs as a claude.ai artifact, in the cloud at
   data/users/<id>/account (private to you). Your claude.ai sign-in owns the account; on top of that the title screen
   asks you to register (ID + password + email) or log in before character select: js/sys/auth.js. */
'use strict';

const ACCKEY = 'vayrathen-account';
const accBlank = () => ({v:1, id:'', name:'', created:0, at:0, coins:0, wardrobe:{}, bank:{inv:{}, inst:{}, bia:0}, streak:{day:0, n:0}});
let ACC = accBlank();
try { const r = localStorage.getItem(ACCKEY); if (r) ACC = Object.assign(accBlank(), JSON.parse(r)); } catch (e) {}
ACC.bank = Object.assign({inv:{}, inst:{}, bia:0}, biaMig(ACC.bank || {})); ACC.wardrobe = ACC.wardrobe || {};
let accCloudT = 0;
function accSave(force){
  ACC.at = Date.now(); try { localStorage.setItem(ACCKEY, JSON.stringify(ACC)); } catch (e) {}
  if (typeof NET !== 'undefined' && NET.db && NET.uid && ACC.name && (typeof secCloudOk !== 'function' || secCloudOk()) && (force || Date.now() - accCloudT > 20000)){ accCloudT = Date.now();
    NET.db.doc(`data/users/${NET.uid}/account`).set({a:JSON.stringify(ACC), at:ACC.at}).catch(() => {}); }
}
const ACC_RE = /^[A-Za-z0-9_]{3,16}$/;
const accTag = () => (ACC.name ? `@${ACC.name}` : L('ผู้เยี่ยมชม', 'Guest'));
function coinAdd(n, why){
  ACC.coins = Math.max(0, (ACC.coins || 0) + n); accSave();
  if (n > 0){ log(L(`ได้เหรียญวายรา +${n}${why ? ' · ' + why : ''}`, `Vayra Coins +${n}${why ? ' · ' + why : ''}`), 'g'); if (typeof P !== 'undefined' && typeof addText === 'function') addText(P.x, P.y - 84, `+${n} ◈`, '#ffe08a', 14); SFX.play('coin'); }
}
/* the bank's instances must be known to ITEMS too */
/* v28: retired pieces in the bank are sold there (bia into the bank); retired fashion is refunded once per account */
const GONE_FASH = {fs_lotus:{z:8000}, fs_moon:{z:12000}, fs_kranok:{c:25}, fs_star:{c:35}, fe_pearl:{z:3000}, fe_sakura:{z:5000}, fe_star:{c:15}, fe_jade:{c:20}, fy_round:{z:3000}, fy_heart:{z:6000},
  fy_beach:{z:6000}, fy_gold:{c:15}, ff_fox:{z:5000}, ff_masq:{z:8000}, ff_khon:{c:25}, ff_night:{c:20}, fm_mint:{z:3000}, fm_sakura:{z:3000}, fm_silk:{z:6000}, fm_ninja:{c:15}};
function accGone(fashDone){
  if (typeof GONE_FASH !== 'undefined') for (const id in GONE_FASH) if (fashDone && ACC.wardrobe) delete ACC.wardrobe[id];   // refunded already on this device
  if (ACC.v28 || typeof gonePurge !== 'function') return; ACC.v28 = 1;
  const r = gonePurge(ACC.bank.inv, ACC.bank.inst = ACC.bank.inst || {}, null); let z = r.z, c = 0;
  for (const id in GONE_FASH) if ((ACC.wardrobe || {})[id]){ delete ACC.wardrobe[id]; if (GONE_FASH[id].z) z += GONE_FASH[id].z; else c += GONE_FASH[id].c; }
  ACC.bank.bia = (ACC.bank.bia || 0) + z; ACC.coins = (ACC.coins || 0) + c;
  if (Object.keys(r.cards).length) ACC.v28c = r.cards;   // the cards go to the next hero that loads
  if (r.n || z || c) ACC.v28note = {n:r.n, z, c};
  try { localStorage.setItem(ACCKEY, JSON.stringify(ACC)); } catch (e) {}
}
function accRegBank(){ accGone(); const st = ACC.bank.inst || {}; for (const k in st){ const d = sanitizeInst(st[k]); if (d) regInst(k, d); else delete st[k]; } for (const k in ACC.bank.inv) if (!ITEMS[k]) delete ACC.bank.inv[k]; }

/* ---------- create / rename (title screen) ---------- */
async function accCreate(name){
  name = String(name || '').trim();
  if (!ACC_RE.test(name)) return L('ไอดีต้องเป็นภาษาอังกฤษ ตัวเลข หรือ _ ยาว 3–16 ตัว', 'Use 3–16 letters, digits or _');
  if (typeof NET !== 'undefined' && NET.db && NET.uid){
    try { const q = await NET.db.collection('players').where('acc', '==', name).limit(3).get();
      if (q.docs.some(d => d.id !== NET.uid)) return L('ไอดีนี้มีคนใช้แล้ว ลองชื่ออื่น', 'That ID is taken, try another'); } catch (e) {}
  }
  const first = !ACC.created; ACC.name = name; if (!ACC.id) ACC.id = String(100000 + Math.floor(Math.random() * 900000)); if (!ACC.created) ACC.created = Date.now();
  if (first) ACC.coins = (ACC.coins || 0) + 10;
  accSave(true); if (typeof NET !== 'undefined') NET.dirSig = '';
  return '';
}
function accPanel(){
  if (!ACC.name) return `<div class="accnew"><div class="t-slots-h"><b>${L('สร้างบัญชีผู้เล่น', 'Create your account')}</b></div>
      <p class="mk-note">${L('ไอดีใช้ระบุตัวคุณกับผู้เล่นอื่น · บัญชีเดียวมีได้ 3 ตัวละคร ใช้เหรียญวายรา ตู้ชุดแฟชั่น และคลังบัญชีร่วมกัน · ตัวละครเดิมในเครื่องนี้จะย้ายเข้าบัญชีให้อัตโนมัติ', 'Your ID is how other players know you · one account holds 3 characters that share Vayra Coins, the wardrobe and the account bank · characters already on this device move in automatically')}</p>
      <label class="mk-row"><span>${L('ไอดี', 'ID')}</span><input class="nmin" id="accName" maxlength="16" autocomplete="off" placeholder="${L('เช่น maprang_09', 'e.g. maprang_09')}"></label>
      <p class="accerr" id="accErr"></p>
      <div class="mk-btns"><button class="tbtn gold sm" data-accgo="1">${L('สร้างบัญชี · รับ 10 เหรียญ', 'Create · get 10 coins')}</button></div>
      ${typeof NET !== 'undefined' && NET.uid ? `<p class="mk-note">${L('เข้าสู่ระบบด้วยบัญชี claude.ai ของคุณแล้ว ไม่ต้องตั้งรหัสผ่าน', 'Signed in with your claude.ai account: no password needed')}</p>` : `<p class="mk-note">${L('ตอนนี้เล่นแบบออฟไลน์ บัญชีเก็บไว้ในเครื่องนี้', 'Playing offline: the account is kept on this device')}</p>`}</div>`;
  return `<div class="accbar"><span class="accav">${ACC.name[0].toUpperCase()}</span><span class="accn"><b>@${escH(ACC.name)}</b><small>ID #${ACC.id} · ${ACC.guest ? `<em class="accguest">${L('แขก · ยังไม่ผูกไอดี', 'guest · no ID bound')}</em>` : typeof NET !== 'undefined' && NET.uid ? `<em class="accok">✓ ${L('ยืนยันตัวตนด้วยบัญชี Claude', 'verified by Claude sign-in')}</em>` : L('ในเครื่อง', 'this device')}</small></span>
    <span class="acccoin" title="${L('เหรียญวายรา', 'Vayra Coins')}">◈ ${fmtN(ACC.coins)}</span><span class="acccoin cos" title="${L('ชุดแฟชั่น', 'Costumes')}">✦ ${typeof cosCount === 'function' ? cosCount() : 0}</span>
    ${ACC.guest ? `<button class="tbtn gold sm" data-aubind="1">${L('ผูกไอดี', 'Bind ID')}</button>` : `<button class="tbtn sm" data-accren="1">${L('เปลี่ยนไอดี', 'Rename')}</button>`}</div>`;
}
document.addEventListener('click', async e => {
  const b = e.target.closest && e.target.closest('[data-accgo],[data-accren]'); if (!b) return;
  if (b.dataset.accren){ const old = ACC.name; ACC.name = ''; renderTitleBody(); const i = el('accName'); if (i){ i.value = old; i.focus(); } ACC._old = old; return; }
  const nv = String((el('accName') && el('accName').value) || '').trim();
  const err = typeof authIdReserved === 'function' && authIdReserved(nv) && (ACC._old || '').toLowerCase() !== nv.toLowerCase() ? AUTH_ERR.reserved() : await accCreate(nv);
  if (err){ if (ACC._old && !ACC.name) { /* keep asking */ } const p = el('accErr'); if (p) p.textContent = err; SFX.play('hurt'); return; }
  delete ACC._old; SFX.play('quest'); renderTitleBody();
});
document.addEventListener('keydown', e => { if (e.target && e.target.id === 'accName'){ e.stopPropagation(); if (e.key === 'Enter'){ const b = document.querySelector('[data-accgo]'); if (b) b.click(); } } }, true);
/* show the account bar (or the sign-up) above the character slots */
{ const _rt = renderTitleBody;
  renderTitleBody = function(){
    _rt(); const box = el('titleBody'); if (!box || TITLE.mode === 'make') return;
    if (!ACC.name){ box.innerHTML = accPanel(); el('saveInfo').textContent = ''; setTimeout(() => { const i = el('accName'); if (i && !i.value && ACC._old) i.value = ACC._old; }, 0); return; }
    box.insertAdjacentHTML('afterbegin', accPanel());
    el('saveInfo').textContent = L(`บัญชี @${ACC.name} · 3 ตัวละคร · ชุดแฟชั่น เหรียญ และคลังใช้ร่วมกัน`, `Account @${ACC.name} · 3 characters sharing costumes, coins and the bank`);
  };
}
/* cloud: the newer of local and cloud wins; wardrobes are merged so nothing unlocked is ever lost */
async function accCloudLoad(){
  if (!NET.db || !NET.uid) return;
  try { const snap = await NET.db.doc(`data/users/${NET.uid}/account`).get(); if (!snap.exists){ if (ACC.name) accSave(true); return; }
    const d = snap.data(), c = Object.assign(accBlank(), JSON.parse(d.a || '{}'));
    const ward = {...(c.wardrobe || {}), ...(ACC.wardrobe || {})}, had28 = !!ACC.v28;
    if (typeof seasonOld === 'function' && seasonOld(c)){ if (ACC.name) accSave(true); return; }   // an account from before a world reset never comes back
    if ((d.at || 0) > (ACC.at || 0) || !ACC.name){ ACC = c; ACC.bank = Object.assign({inv:{}, inst:{}, bia:0}, biaMig(ACC.bank || {})); }
    ACC.wardrobe = ward; if (had28) accGone(true); accRegBank(); try { localStorage.setItem(ACCKEY, JSON.stringify(ACC)); } catch (e) {}
    if (!el('title').hidden && PAUSED) renderTitleBody();
  } catch (e) {}
}

/* ---------- the account bank ---------- */
addTownNpc({id:'banker', name:'นายคลังทองดี', en:'Banker Thongdee', role:'คลังบัญชี', roleEn:'Account Bank', x:300, y:1100},
  {job:'astro', look:{sex:'m', hair:1, color:'hairBlack'}, gear:{armor:'c_knight', head:'hc_lomphok'}});
const bankable = id => ITEMS[id] && !['key'].includes(ITEMS[id].kind) && id !== 'shard';
function bankMove(id, n, toBank){
  const from = toBank ? S.inv : ACC.bank.inv, to = toBank ? ACC.bank.inv : S.inv, have = from[id] || 0; if (!have || !bankable(id)) return;
  n = n === 'all' ? have : Math.min(have, n | 0); if (n <= 0) return;
  if (ITEMS[id].base){ const fs = toBank ? instStore() : ACC.bank.inst, ts = toBank ? ACC.bank.inst : instStore(); ts[id] = fs[id]; delete fs[id]; }
  from[id] = have - n; if (!from[id]) delete from[id]; to[id] = (to[id] || 0) + n;
  SFX.play('pickup'); dirty = true; save(); accSave(true);
}
function bankBia(n, toBank){
  n = n === 'all' ? (toBank ? S.bia : ACC.bank.bia) : n; n = Math.max(0, Math.min(n, toBank ? S.bia : ACC.bank.bia)); if (!n) return;
  if (toBank){ S.bia -= n; ACC.bank.bia += n; } else { ACC.bank.bia -= n; S.bia += n; }
  SFX.play('coin'); dirty = true; save(); accSave(true);
}
NPC_OPEN.banker = n => {
  const row = (id, cnt, toBank) => `<div class="srow"><span class="ic">${itemIcon(id)}</span><div class="nm"><b class="rar r${ITEMS[id].rar || 0}">${nm(ITEMS[id])}</b><small>×${fmtN(cnt)}</small></div>
    <button class="btn sm" data-bank="${id}" data-bn="1" data-bto="${toBank ? 1 : 0}">${toBank ? L('ฝาก', 'Store') : L('ถอน', 'Take')}</button>${cnt > 1 ? `<button class="btn sm" data-bank="${id}" data-bn="all" data-bto="${toBank ? 1 : 0}">${L('ทั้งหมด', 'All')}</button>` : ''}</div>`;
  const mine = Object.keys(S.inv).filter(k => S.inv[k] > 0 && bankable(k) && !(S.gear && S.gear.ammo === k)), bank = Object.keys(ACC.bank.inv).filter(k => ACC.bank.inv[k] > 0 && ITEMS[k]);
  npcFrame(n, L(`เบี้ยทุกเม็ดในอาณาจักรมาจากหาดอันดามัน ข้าดูแลมันมาทั้งชีวิต · คลังของบัญชี @${ACC.name || 'ผู้เยี่ยมชม'} ฝากไว้ที่นี่ ตัวละครไหนในบัญชีก็มาถอนได้`, `Every Bia shell in the kingdom came up from the Andaman shore; I have kept them all my life. · This is the vault of @${ACC.name || 'guest'}. Anything you store here, any character on the account can take out.`),
    `<div class="bankz"><div><small>${L('เบี้ยในตัว', 'Bia on hand')}</small><b><i class="biaI"></i>${fmtN(S.bia)}</b></div><div><small>${L('เบี้ยในคลัง', 'Bia in the bank')}</small><b><i class="biaI"></i>${fmtN(ACC.bank.bia)}</b></div>
      <div class="bankzb"><button class="btn sm" data-bankz="1000" data-bto="1">${L('ฝาก', 'Store')} 1,000</button><button class="btn sm" data-bankz="all" data-bto="1">${L('ฝากหมด', 'Store all')}</button>
      <button class="btn sm" data-bankz="1000" data-bto="0">${L('ถอน', 'Take')} 1,000</button><button class="btn sm" data-bankz="all" data-bto="0">${L('ถอนหมด', 'Take all')}</button></div></div>
     <div class="bankcols"><div><div class="sec">${L('คลังบัญชี', 'Account bank')} <span class="ct">${bank.length}</span></div><div class="shop">${bank.map(k => row(k, ACC.bank.inv[k], false)).join('') || `<p class="hint">${L('ว่าง', 'Empty')}</p>`}</div></div>
     <div><div class="sec">${L('กระเป๋า', 'Your bag')}</div><div class="shop">${mine.map(k => row(k, S.inv[k], true)).join('') || `<p class="hint">${L('ว่าง', 'Empty')}</p>`}</div></div></div>`);
};
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-bank],[data-bankz]'); if (!b) return; const d = b.dataset;
  if (d.bank) bankMove(d.bank, d.bn === 'all' ? 'all' : +d.bn, d.bto === '1'); else bankBia(d.bankz === 'all' ? 'all' : +d.bankz, d.bto === '1');
  const n = NPCS.find(x => x.id === 'banker'); if (n) NPC_OPEN.banker(n);
});
/* after every script has run (class sets and other late items must be known, or bank pieces of theirs would be dropped) */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', accRegBank); else accRegBank();
