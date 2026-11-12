/* VAYRATHEN — js/sys/gm.js — GM (game master) tools for testing, server backup and the world reset
   · WHO IS GM (checked again on every action, never only when the panel is drawn):
     claude.ai → the artifact's owner (user.isOwner(); GM_EDITORS = true also admits editors, canEdit()).
     Firebase  → your uid is in GM_UIDS (js/net/firebase-config.js) — the Firestore rules hold the same list, so the
                 server refuses GM-only writes from anyone else.
     Offline   → only with ?gm=1 in the address, on a file:// or localhost page, and with no online connection at all
                 (testing on your own machine; heroes edited this way never upload to the cloud).
   · Panel: F8 or the GM chip (shown to GMs only). Teleport, level/job, points, bia/coins/items/gear, spawn monsters
     and bosses, kill all, heal/god/invisible/speed, unlock maps, clear quests, time-of-day and festival preview,
     online players (+ go to them), a server-wide announcement (room topic 'gm'), server backup/restore, world reset.
   · Others see a [GM] tag on a GM's name and chat: the tag comes from the sender's platform-stamped id (peer.by),
     never from what the presence says. Ids: GM_UIDS on Firebase, db server/gm {ids} on claude.ai (owner-written).
   · Every action goes to a log: this browser (vayrathen-gmlog) and, online, db server/gmlog/entries/<id>.
   · SERVER BACKUP: every shared collection it can read (players, guilds + members, market, fame, server + gmlog
     entries) → one JSON {game, kind:'server-backup', v, id, at, by, season, counts, docs:{"path": data}} stored as
     db backups/<id> (meta) + backups/<id>/parts/<i> (60,000-character pieces) and downloaded as a file.
   · WORLD RESET: backup first (aborts if it fails) → delete every shared doc except server/* → server/season {n+1}
     → room event 'gm' {k:'season'} → every client (now, or when it next connects) archives and wipes (season.js). */
'use strict';

const GM = {on:false, how:'', netDone:false, god:false, inv:false, spd:1, ids:[], log:[], list:null, busy:'', q:'', mq:'', lastAnn:'', last:null, logged:false};
const GM_EDITORS = false, GM_LOGKEY = 'vayrathen-gmlog';
const GM_COLS = [['players'], ['guilds', 'members'], ['market'], ['fame'], ['server', 'entries']];   // [collection, subcollection under each doc]
try { GM.log = JSON.parse(localStorage.getItem(GM_LOGKEY) || '[]'); if (!Array.isArray(GM.log)) GM.log = []; } catch (e) {}
const gmHost = () => { const c = window.claude; return !c || typeof c.use !== 'function' ? 'off' : c.firebase ? 'firebase' : 'claude'; };
const gmUidList = () => (typeof GM_UIDS !== 'undefined' && Array.isArray(GM_UIDS) ? GM_UIDS.filter(x => typeof x === 'string' && x) : []);
const gmOnline = () => !!(NET.db || NET.room || NET.uid);
const gmLocalOk = () => GM.netDone && !gmOnline() && /(^|&)gm=1(&|$)/.test(location.search.slice(1)) && (location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname));
const gmIds = () => (gmHost() === 'firebase' ? gmUidList() : GM.ids);
const gmTag = by => (by && gmIds().includes(by) ? '[GM] ' : '');
const gmPres = () => (GM.on && GM.inv ? {iv:1} : {});
const gmHidden = gh => !!(gh && gh.q && gh.q.iv && !GM.on);   // an invisible GM is seen only by other GMs

/* ---------- identity ---------- */
async function gmVerify(){
  let on = false, how = '';
  if (NET.user && NET.uid){
    try { const id = await NET.user.id(); if (id === NET.uid){
      if (gmHost() === 'firebase'){ on = gmUidList().includes(id); how = 'firebase'; }
      else { on = typeof NET.user.isOwner === 'function' && (await NET.user.isOwner()) === true; how = 'owner';
        if (!on && GM_EDITORS && typeof NET.user.canEdit === 'function'){ on = (await NET.user.canEdit()) === true; how = 'editor'; } } } } catch (e){ on = false; }
  } else if (gmLocalOk()){ on = true; how = 'local'; }
  const was = GM.on; GM.on = on; GM.how = on ? how : '';
  if (!on){ GM.god = GM.inv = false; GM.spd = 1; }
  if (was !== on){ gmUi(); if (typeof derive === 'function' && DER) derive(); }
  return on;
}
/* GM ids others can check: GM_UIDS on Firebase; on claude.ai the owner lists itself in server/gm */
async function gmLoadIds(){
  if (gmHost() === 'firebase' || !NET.db) return gmIds();
  try { const d = await NET.db.doc('server/gm').get(); const v = d.exists ? d.data() : {}; GM.ids = Array.isArray(v.ids) ? v.ids.filter(x => typeof x === 'string').slice(0, 20) : []; } catch (e) {}
  if (GM.on && NET.uid && !GM.ids.includes(NET.uid)) try { GM.ids = [...GM.ids, NET.uid].slice(-20); await NET.db.doc('server/gm').set({ids:GM.ids, at:Date.now()}); } catch (e) {}
  return GM.ids;
}
async function gmNetReady(){
  GM.netDone = true; await gmVerify(); await gmLoadIds();
  if (NET.room && !GM.sub){ GM.sub = 1; NET.room.on('gm', onGmEv, () => {}); }
}
/* a GM announcement: a gold bar across the top of the screen, above every window, for a few seconds; also in chat and the log */
function gmShowAnn(t, who){
  GM.lastAnn = t;
  let b = el('gmAnnBar'); if (!b){ b = document.createElement('div'); b.id = 'gmAnnBar'; b.setAttribute('role', 'alert'); el('ui').appendChild(b); }
  b.innerHTML = `<span class="ga-ic">📢</span><span class="ga-tx"><small>${L('ประกาศจาก GM', 'GM announcement')}${who ? ' · ' + escH(who) : ''}</small><b>${escH(t)}</b></span>`;
  b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); clearTimeout(GM.annT); GM.annT = setTimeout(() => b.classList.remove('show'), 9000);
  log(L(`ประกาศจาก GM: ${t}`, `GM announcement: ${t}`), 'g'); NET.chat.push({ch:'sys', who:'[GM]', text:t, at:Date.now()}); if (NET.chat.length > NET_MAX_CHAT) NET.chat.shift(); renderChat(); SFX.play('quest');
}
{ const st = document.createElement('style');
  st.textContent = `#gmAnnBar{position:absolute;left:50%;top:10px;z-index:9999;display:flex;align-items:center;gap:10px;max-width:min(640px,calc(100% - 24px));padding:10px 18px;border-radius:14px;
    background:linear-gradient(180deg,#5a1414,#2a0a0a);border:2px solid #f2c45a;box-shadow:0 6px 24px rgba(0,0,0,.6),0 0 18px rgba(242,196,90,.45);color:#fff3d6;
    transform:translate(-50%,-140%);opacity:0;transition:transform .35s cubic-bezier(.2,1.3,.4,1),opacity .3s;pointer-events:none}
    #gmAnnBar.show{transform:translate(-50%,0);opacity:1}
    #gmAnnBar .ga-ic{font-size:24px}#gmAnnBar .ga-tx{display:flex;flex-direction:column;min-width:0}
    #gmAnnBar small{font-size:11px;color:#f2c45a;letter-spacing:.04em}#gmAnnBar b{font-size:16px;line-height:1.3;word-break:break-word}`;
  document.head.appendChild(st); }
async function onGmEv(msg){
  const d = (msg && msg.data) || {};
  if (!msg.isMe && !gmIds().includes(msg.by)){ await gmLoadIds(); if (!gmIds().includes(msg.by)) return; }   // only a GM's word counts
  if (d.k === 'ann'){ const t = clean(d.t, 200); if (!t) return;
    if (msg.isMe && GM.sentAnn && GM.sentAnn.t === t && Date.now() - GM.sentAnn.at < 15000) return;   // already shown when it was sent
    gmShowAnn(t, clean(d.n, 18)); }
  if (d.k === 'season'){ SEASON.t = SEASON.pollT; seasonNet(); }
}

/* ---------- every action: re-check, run, log ---------- */
async function gmRun(name, args, fn){
  if (!(await gmVerify())){ toast(L('เฉพาะ GM เท่านั้น', 'GM only')); return false; }
  let r;
  try { if (GM.how === 'local' && S && S.job) S.gmLocal = 1; r = await fn(); }
  catch (e){ const m = clean((e && e.message) || e, 80); toast(L(`GM: ทำไม่สำเร็จ ${m}`, `GM: failed ${m}`)); gmLog(name, args, 'error ' + m); reWin('gm'); return false; }
  gmLog(name, args, 'ok'); dirty = true; reWin('gm');
  return r === undefined ? true : r;
}
function gmLog(a, x, res){
  const e = {at:Date.now(), a, x:clean(JSON.stringify(x === undefined ? null : x), 200), r:res || '', by:NET.uid || 'local', n:netName(), how:GM.how};
  GM.log.unshift(e); GM.log.length = Math.min(GM.log.length, 200); try { localStorage.setItem(GM_LOGKEY, JSON.stringify(GM.log)); } catch (er) {}
  if (NET.db && NET.uid){ if (!GM.logged){ GM.logged = true; NET.db.doc('server/gmlog').set({at:e.at}).catch(() => {}); } NET.db.collection('server/gmlog/entries').add(e).catch(() => {}); }
}

/* ---------- player tools ---------- */
const gmSpot = () => (MAP_ID === 0 ? {x:VSPAWN.x, y:VSPAWN.y} : CAMP ? {x:CAMP.x + 60, y:CAMP.y + 60} : {x:W / 2, y:H / 2});
function gmMove(map, x, y){
  map = clamp(map | 0, 0, MAPS.length - 1); if (map !== MAP_ID){ save(); loadMap(map); }
  const sp = gmSpot(); P.x = clamp(Number.isFinite(x) ? x : sp.x, 20, W - 20); P.y = clamp(Number.isFinite(y) ? y : sp.y, 20, H - 20);
  P.tx = P.ty = null; P.target = null; P.gateLock = T + 1.2; if (typeof pushOut === 'function') pushOut(P, 12);
  VFX.play('mapArrive', {x:P.x, y:P.y, gold:true}); SFX.play('warp'); updMapLabel();
}
const gmTeleport = (map, x, y) => gmRun('teleport', {map, x, y}, () => gmMove(map, x == null || x === '' ? NaN : +x, y == null || y === '' ? NaN : +y));
const gmGotoPlayer = peer => gmRun('goto-player', {peer}, async () => {
  const p = NET.room && NET.room.peers().find(q => q.peer === peer); const q = p && p.presence; if (!q || !MAPS[q.m]) throw new Error(L('ไม่พบผู้เล่น', 'player not found'));
  gmMove(q.m); for (let i = 0; i < 30; i++){ const g = [...NET.ghosts.values()].find(h => h.by === p.by); if (g){ P.x = g.x + 30; P.y = g.y; return; } await new Promise(r => setTimeout(r, 150)); }
});
const gmSetLevel = lv => gmRun('level', {lv}, () => { S.lvl = clamp(lv | 0, 1, typeof LV_MAX !== 'undefined' ? LV_MAX : 999); S.exp = 0; derive(); S.hp = DER.maxhp; S.sp = DER.maxsp; EV.emit('level', S.lvl); });
const gmSetJobLevel = jl => gmRun('joblevel', {jl}, () => { S.jlvl = clamp(jl | 0, 1, JOBS[S.job].jobMax || 50); S.jexp = 0; derive(); });
const gmSetJob = job => gmRun('job', {job}, () => { if (!JOBS[job]) throw new Error('job'); S.job = job; S.jlvl = Math.min(S.jlvl, JOBS[job].jobMax || 50);
  if (S.gear && S.gear.weapon && typeof canWield === 'function' && !canWield(ITEMS[S.gear.weapon])){ addItem(S.gear.weapon, 1); S.gear.weapon = null; } derive(); S.hp = DER.maxhp; S.sp = DER.maxsp; EV.emit('job', job); if (typeof renderHotbar === 'function') renderHotbar(); });
const gmSetPoints = (st, sk) => gmRun('points', {st, sk}, () => { if (st !== '' && st != null) S.statPts = clamp(st | 0, 0, 99999); if (sk !== '' && sk != null) S.skPts = clamp(sk | 0, 0, 9999); S.spv = 1; });
const gmMoneyShown = () => { if (typeof renderPanel === 'function') renderPanel(); if (typeof renderBag === 'function' && (winOpen('equip') || winOpen('bag'))) renderBag(); if (typeof reWin === 'function') reWin('bag'); save(); if (typeof cloudSave === 'function') cloudSave(true); };
const gmGiveBia = n => gmRun('bia', {n}, () => { n = Math.round(+n || 0); if (!n) throw new Error(L('ใส่จำนวนเงิน', 'enter an amount'));
  S.bia = clamp(Math.round(S.bia + n), 0, 2e12); gmMoneyShown(); SFX.play('pickup');
  toast(L(`GM: ${n > 0 ? 'เพิ่ม' : 'ลด'}เงิน ${fmtN(Math.abs(n))} ${CUR()} · ตอนนี้มี ${fmtN(S.bia)} ${CUR()}`, `GM: ${n > 0 ? 'added' : 'removed'} ${fmtN(Math.abs(n))} ${CUR()} · now ${fmtN(S.bia)} ${CUR()}`)); });
const gmGiveCoins = n => gmRun('coins', {n}, () => { n = Math.round(+n || 0); if (!n) throw new Error(L('ใส่จำนวนเหรียญ', 'enter an amount'));
  coinAdd(n, 'GM'); gmMoneyShown(); toast(L(`GM: เพิ่มเหรียญ ◈ ${fmtN(n)}`, `GM: added ◈ ${fmtN(n)}`)); });
const gmGive = (id, n = 1, rar = 0) => gmRun('give', {id, n, rar}, () => {
  const it = ITEMS[id]; if (!it || it.base) throw new Error(L('ไม่มีไอเทมนี้', 'no such item')); n = clamp(n | 0, 1, 99999);
  if (it.kind === 'gear' && rar > 0 && typeof makeInst === 'function'){ for (let i = 0; i < Math.min(n, 20); i++) addItem(makeInst(id, clamp(rar | 0, 0, 3)), 1); }
  else addItem(id, n); EV.emit('pickup', id); SFX.play('pickup');
});
const gmSpawn = (type, n = 1) => gmRun('spawn', {type, n}, () => {
  const d = MOB[type]; if (!d) throw new Error(L('ไม่มีมอนนี้', 'no such monster')); n = clamp(n | 0, 1, 30); const zone = MAP_ID === 0 ? ZB : MAPZ;
  for (let i = 0; i < n; i++){ const a = i / n * 6.283, m = spawnMob(type, clamp(P.x + Math.cos(a) * 110, 30, W - 30), clamp(P.y + Math.sin(a) * 80, 30, H - 30), {zone}); m.gm = 1;
    if (d.boss && (!boss || boss.dead)){ boss = m; m.roamT = 15; m.bcd = 3; } }
  VFX.play('bossSummon', {x:P.x, y:P.y});
});
const gmKillAll = () => gmRun('killall', {}, () => { let k = 0; for (const m of [...mobs]) if (!m.dead){ m.hp = 0; killMob(m); k++; } toast(L(`ปราบ ${k} ตัว`, `${k} defeated`)); });
const gmHeal = () => gmRun('heal', {}, () => { if (P.dead){ P.dead = false; P.deadT = 0; } S.hp = DER.maxhp; S.sp = DER.maxsp; VFX.play('levelUp', {}); });
const gmToggle = k => gmRun('toggle', {k}, () => { if (k !== 'god' && k !== 'inv') throw new Error(k); GM[k] = !GM[k]; if (k === 'inv') for (const m of mobs) m.aggro = false; NET.presT = 0; toast(`${k === 'god' ? L('อมตะ', 'God mode') : L('ล่องหน', 'Invisible')}: ${GM[k] ? 'ON' : 'OFF'}`); });
const gmSpeed = x => gmRun('speed', {x}, () => { GM.spd = clamp(+x || 1, 1, 5); derive(); });
const gmUnlockMaps = () => gmRun('unlock-maps', {}, () => { S.visited = S.visited || {}; MAPS.forEach((m, i) => { S.visited[i] = 1; }); if (typeof renderWorld === 'function' && winOpen('world')) renderWorld(); });
const gmClearQuests = () => gmRun('clear-quests', {}, () => { delete S.quest; delete S.side; if (typeof renderGoal === 'function') renderGoal(); });
const gmTime = h => gmRun('time', {h}, () => { window.GM_TOFS = clamp(+h || 0, -23, 23); });
const gmFestival = k => gmRun('festival', {k}, () => { SETTINGS.evPreview = typeof EVENTS !== 'undefined' && EVENTS[k] ? k : ''; saveSettings(); });
const gmAnnounce = text => gmRun('announce', {text}, async () => {
  text = clean(text, 200).trim(); if (!text) throw new Error(L('ว่าง', 'empty')); if (!NET.room) throw new Error(L('ต้องออนไลน์', 'not online'));
  try { await NET.room.emit('gm', {k:'ann', t:text, n:netName()}); GM.sentAnn = {t:text, at:Date.now()}; gmShowAnn(text, netName()); } catch (e){ throw new Error(L('ห้องไม่รับหัวข้อ gm', "the room refused topic 'gm'") + (e && e.code ? ` (${e.code})` : '')); }
});
/* god mode, invisibility and speed hook into the game's own functions */
{ const _die = playerDie; playerDie = function(){ if (GM.on && GM.god){ S.hp = DER.maxhp; return; } return _die.apply(this, arguments); }; }
{ const _ma = mobAttack; mobAttack = function(m){ if (GM.on && GM.inv){ m.aggro = false; return; } if (GM.on && GM.god){ const r = _ma.apply(this, arguments); S.hp = DER.maxhp; return r; } return _ma.apply(this, arguments); }; }
{ const _ms = mobShoot; mobShoot = function(m){ if (GM.on && GM.inv){ m.aggro = false; return; } return _ms.apply(this, arguments); }; }
/* (v283) the speed boost is put on last, once every file has loaded: the stat caps (caps193.js) wrap derive after this
   file and used to cut the boost straight back to the normal top speed */
EV.on('tick', function gmSpdWrap(){ if (GM.spdWrapped) return; GM.spdWrapped = true;
  const _dv = derive; derive = function(){ const r = _dv.apply(this, arguments); if (GM.on && GM.spd > 1 && DER) DER.move *= GM.spd; return r; }; });
EV.on('tick', () => { if (!GM.on) return; if (GM.god){ S.hp = DER.maxhp; S.sp = DER.maxsp; } if (GM.inv) for (const m of mobs) if (m.aggro && !m.taunt) m.aggro = false; });

/* ---------- server backup / restore / reset ---------- */
function gmDownload(filename, data){
  return (async () => {
    const dl = window.claude && window.claude.use && !window.claude.firebase ? await window.claude.use('downloads').catch(() => null) : null;
    if (dl){ try { await dl.save({filename, data}); return true; } catch (e){ return false; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], {type:'application/json'})); a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); return true;
  })();
}
async function gmReadAll(){
  const db = NET.db, docs = {}, counts = {};
  for (const [c, sub] of GM_COLS){
    let q; try { q = await db.collection(c).get(); } catch (e){ continue; }
    for (const d of q.docs){ docs[`${c}/${d.id}`] = d.data(); counts[c] = (counts[c] || 0) + 1;
      if (sub) try { const s = await db.collection(`${c}/${d.id}/${sub}`).get(); for (const x of s.docs){ docs[`${c}/${d.id}/${sub}/${x.id}`] = x.data(); counts[`${c}/*/${sub}`] = (counts[`${c}/*/${sub}`] || 0) + 1; } } catch (e) {} }
  }
  return {docs, counts};
}
async function gmBackupNow({download = true, why = 'manual'} = {}){
  if (!NET.db) throw new Error(L('ต้องออนไลน์', 'not online'));
  const {docs, counts} = await gmReadAll(), at = Date.now(), id = `bk-${new Date(at).toISOString().replace(/\D/g, '').slice(0, 14)}-${Math.random().toString(36).slice(2, 6)}`;
  const data = {game:'vayrathen', kind:'server-backup', v:1, id, at, by:NET.uid || '', name:netName(), season:Math.max(seasonLive(), SEASON.cur), host:gmHost(), why, counts, docs};
  const json = JSON.stringify(data), parts = Math.ceil(json.length / SEASON_PART), n = Object.keys(docs).length;
  for (let i = 0; i < parts; i++) await NET.db.doc(`backups/${id}/parts/${i}`).set({i, d:json.slice(i * SEASON_PART, (i + 1) * SEASON_PART)});
  await NET.db.doc(`backups/${id}`).set({id, at, by:NET.uid || '', season:data.season, why, parts, size:json.length, n, counts});
  GM.last = {id, json, n, docs}; if (download) await gmDownload(`vayrathen-server-${id}.json`, json);
  toast(L(`สำรองเซิร์ฟเวอร์แล้ว ${n} รายการ`, `Server backed up: ${n} docs`));
  return {id, n, parts, size:json.length};
}
async function gmBackupList(){
  if (!NET.db) return []; try { const q = await NET.db.collection('backups').get(); GM.list = q.docs.map(d => ({...d.data(), id:d.id})).sort((a, b) => (b.at || 0) - (a.at || 0)); } catch (e){ GM.list = []; }
  reWin('gm'); return GM.list;
}
const GM_SEG = /^[A-Za-z0-9_\-.~:@+]{1,200}$/;
async function gmRestoreNow(src){
  if (!NET.db) throw new Error(L('ต้องออนไลน์', 'not online'));
  let data = src;
  if (typeof src === 'string'){ const m = await NET.db.doc(`backups/${src}`).get(); if (!m.exists) throw new Error(L('ไม่พบแบ็กอัป', 'backup not found'));
    let s = ''; for (let i = 0; i < (m.data().parts | 0); i++){ const p = await NET.db.doc(`backups/${src}/parts/${i}`).get(); if (!p.exists) throw new Error(L('แบ็กอัปไม่ครบ', 'backup incomplete')); s += p.data().d; }
    data = JSON.parse(s); }
  if (!data || data.game !== 'vayrathen' || data.kind !== 'server-backup' || !data.docs || typeof data.docs !== 'object') throw new Error(L('ไฟล์ไม่ใช่แบ็กอัปเซิร์ฟเวอร์', 'not a server backup'));
  let n = 0;
  for (const [path, d] of Object.entries(data.docs)){ const seg = path.split('/');
    if (seg.length % 2 || seg.some(x => !GM_SEG.test(x) || x === '.' || x === '..') || seg[0] === 'server' || !GM_COLS.some(c => c[0] === seg[0]) || !d || typeof d !== 'object' || Array.isArray(d)) continue;   // the season and GM list are never rolled back
    try { await NET.db.doc(path).set(d); n++; } catch (e) {} }
  toast(L(`กู้คืนแล้ว ${n} รายการ`, `Restored ${n} docs`)); return n;
}
const gmServerBackup = (opt = {}) => gmRun('backup', {}, () => gmBackupNow(opt));
/* (v286) versions before v285 put each player's log-in ID on their public card (players/<uid>.acc) and market listings
   (market/<id>.sa): anyone could collect every log-in name to guess passwords. The game no longer writes them; this
   clears the copies of players who have not played since. Guild member lines clear themselves when the member plays. */
const gmPrivacy = () => gmRun('privacy', {}, async () => {
  if (!NET.db) throw new Error(L('ต้องออนไลน์', 'go online first'));
  GM.busy = true; reWin('gm'); let n = 0;
  try {
    for (const [col, f] of [['players', 'acc'], ['market', 'sa']]){
      const snap = await NET.db.collection(col).get();
      for (const d of snap.docs){ const v = d.data() || {}; if (v[f]){ await NET.db.doc(`${col}/${d.id}`).update({[f]:''}); n++; } }
    }
  } finally { GM.busy = false; reWin('gm'); }
  toast(L(`ล้างไอดีล็อกอินแล้ว ${n} รายการ`, `Cleared ${n} log-in ID(s)`)); return n;
});
const gmRestore = (src, word) => (word === 'RESTORE' ? gmRun('restore', {id:typeof src === 'string' ? src : (src && src.id) || 'file'}, () => gmRestoreNow(src)) : Promise.resolve(false));
const gmResetWorld = word => (word === 'RESET' ? gmRun('reset-world', {}, async () => {
  GM.busy = 'reset'; reWin('gm');
  try {
    const bk = await gmBackupNow({why:'reset'});   // no backup, no reset
    const paths = Object.keys(GM.last.docs).filter(p => !p.startsWith('server/')).sort((a, b) => b.split('/').length - a.split('/').length);
    let del = 0; for (const p of paths) try { await NET.db.doc(p).delete(); del++; } catch (e) {}
    const n = Math.max(seasonLive(), SEASON.cur) + 1;
    await NET.db.doc('server/season').set({n, id:`s${n}-${Date.now().toString(36)}`, at:Date.now(), by:NET.uid, prev:n - 1, backup:bk.id, deleted:del});
    SEASON.srv = n; GM.last.docs = null;
    if (NET.room) try { await NET.room.emit('gm', {k:'season', n}); } catch (e) {}   // others also find it within a minute, or when they next connect
    gmLog('reset-world', {n, backup:bk.id, deleted:del}, 'done');
    await seasonNet();   // this GM starts from 0 too
    return {n, backup:bk.id, deleted:del};
  } finally { GM.busy = ''; }
}) : Promise.resolve(false));

/* ---------- panel ---------- */
mkWin('gm', 'เครื่องมือ GM', 'GM tools', 'F8', '<path d="M10 2l2.2 4.6 5 .7-3.6 3.5.9 5L10 13.4 5.5 15.8l.9-5L2.8 7.3l5-.7z"/>', false);
const gmOpen = async () => { if (await gmVerify()) toggleWin('gm'); };
function gmUi(){
  let b = el('gmBtn'); const chips = el('chips');
  if (!b && chips){ chips.insertAdjacentHTML('beforeend', `<div class="gmchip" id="gmBtn" role="button" tabindex="0" hidden title="GM (F8)">GM</div>`); b = el('gmBtn'); }
  if (b) b.hidden = !GM.on; if (!GM.on && typeof UIS !== 'undefined' && UIS.open.gm) closeWin('gm'); reWin('gm');
}
const gmItemRows = () => { const q = GM.q.trim().toLowerCase(); if (!q) return `<p class="hint">${L('พิมพ์ชื่อหรือรหัสไอเทม', 'Type an item name or id')}</p>`;
  const ids = Object.keys(ITEMS).filter(k => !ITEMS[k].base && (k.toLowerCase().includes(q) || String(ITEMS[k].name || '').toLowerCase().includes(q) || String(ITEMS[k].en || '').toLowerCase().includes(q))).slice(0, 40);
  return ids.map(k => `<div class="item"><span class="ic">${itemIcon(k)}</span><div class="nm"><b class="rar r${ITEMS[k].rar || 0}">${escH(nm(ITEMS[k]))}</b><small>${escH(k)} · ${escH(ITEMS[k].kind || '')}</small></div><button class="btn sm" data-gm="give" data-id="${escH(k)}">${L('ให้', 'Give')}</button></div>`).join('') || `<p class="hint">${L('ไม่พบ', 'Nothing found')}</p>`; };
const gmMobRows = () => { const q = GM.mq.trim().toLowerCase();
  const ids = Object.keys(MOB).filter(k => !q || k.toLowerCase().includes(q) || String(MOB[k].name || '').toLowerCase().includes(q) || String(MOB[k].en || '').toLowerCase().includes(q)).sort((a, b) => (MOB[a].lvl || 0) - (MOB[b].lvl || 0)).slice(0, q ? 40 : 12);
  return ids.map(k => `<div class="item"><div class="nm"><b>${MOB[k].boss ? '★ ' : ''}${escH(nm(MOB[k]) || MOB[k].en || k)}</b><small>${escH(k)} · Lv ${MOB[k].lvl | 0}${MOB[k].boss ? ' · Boss' : ''}</small></div><button class="btn sm" data-gm="spawn" data-id="${escH(k)}">${L('เรียก', 'Spawn')}</button></div>`).join(''); };
WIN_RENDER.gm = function(){
  const pane = el('pane-gm'); if (!pane) return;
  if (!GM.on){ pane.innerHTML = `<p class="hint">${L('เฉพาะ GM เท่านั้น', 'GM only')}</p>`; return; }
  const online = !!NET.db, peers = NET.room ? NET.room.peers().filter(p => p.kind === 'viewer' && p.presence) : [];
  const how = {owner:L('เจ้าของอาร์ติแฟกต์ claude.ai', 'claude.ai artifact owner'), editor:L('ผู้แก้ไข claude.ai', 'claude.ai editor'), firebase:'Firebase GM_UIDS', local:L('โหมดทดสอบออฟไลน์ (?gm=1)', 'offline test mode (?gm=1)')}[GM.how] || GM.how;
  const sel = (id, opts, v) => `<select id="${id}">${opts.map(([k, t]) => `<option value="${escH(k)}"${String(k) === String(v) ? ' selected' : ''}>${escH(t)}</option>`).join('')}</select>`;
  pane.innerHTML = `<p class="hint">GM · ${escH(how)} · ${L('ซีซัน', 'season')} ${SEASON.cur}${online ? '' : ` · ${L('ออฟไลน์', 'offline')}`}</p>
    <div class="sec">${L('วาร์ป', 'Teleport')}</div>
    <div class="row gmrow">${sel('gmMap', MAPS.map((m, i) => [i, `${i} · ${nm(m)}`]), MAP_ID)}<input id="gmX" type="number" placeholder="x" value="${Math.round(P.x)}"><input id="gmY" type="number" placeholder="y" value="${Math.round(P.y)}"><button class="btn sm gold" data-gm="tp">${L('ไป', 'Go')}</button></div>
    <div class="sec">${L('ตัวละคร', 'Character')}</div>
    <div class="row gmrow"><label>Base Lv<input id="gmLv" type="number" value="${S.lvl}"></label><button class="btn sm" data-gm="lv">${L('ตั้ง', 'Set')}</button><label>Job Lv<input id="gmJl" type="number" value="${S.jlvl}"></label><button class="btn sm" data-gm="jl">${L('ตั้ง', 'Set')}</button></div>
    <div class="row gmrow">${sel('gmJob', Object.keys(JOBS).map(k => [k, nm(JOBS[k])]), S.job)}<button class="btn sm" data-gm="job">${L('เปลี่ยนอาชีพ', 'Set job')}</button></div>
    <div class="row gmrow"><label>Stat<input id="gmSp" type="number" value="${S.statPts}"></label><label>Skill<input id="gmKp" type="number" value="${S.skPts}"></label><button class="btn sm" data-gm="pts">${L('ตั้งแต้ม', 'Set points')}</button></div>
    <div class="sec">${L('เงิน', 'Money')}</div>
    <div class="row gmrow"><label>${L('เงินเบี้ย', 'Bia')} <small>(${L('มี', 'have')} ${fmtN(S.bia)})</small><input id="gmZ" type="number" value="1000000"></label><button class="btn sm gold" data-gm="bia">${L('เสกเงินเบี้ย', 'Add Bia')}</button></div>
    <div class="row gmrow"><label>${L('เหรียญกาชา', 'Gacha coins')} ◈ <small>(${L('มี', 'have')} ${fmtN(ACC.coins || 0)})</small><input id="gmC" type="number" value="100"></label><button class="btn sm gold" data-gm="coins">${L('เสกเหรียญกาชา', 'Add coins')}</button></div>
    <div class="sec">${L('ไอเทมและอุปกรณ์', 'Items & gear')}</div>
    <div class="row gmrow"><input id="gmQ" placeholder="${L('ค้นหา…', 'Search…')}" value="${escH(GM.q)}"><label>×<input id="gmN" type="number" value="1"></label>${sel('gmR', [[0, L('ธรรมดา', 'Normal')], [1, 'Rare'], [2, 'Epic'], [3, 'Legend']], 0)}</div>
    <div class="list" id="gmItems">${gmItemRows()}</div>
    <div class="sec">${L('มอนสเตอร์', 'Monsters')}</div>
    <div class="row gmrow"><input id="gmMq" placeholder="${L('ค้นหามอน / บอส…', 'Search monsters / bosses…')}" value="${escH(GM.mq)}"><label>×<input id="gmMn" type="number" value="1"></label><button class="btn sm" data-gm="killall">${L('ฆ่าทั้งแผนที่', 'Kill all')}</button></div>
    <div class="list" id="gmMobs">${gmMobRows()}</div>
    <div class="sec">${L('สถานะ', 'Toggles')}</div>
    <div class="row gmrow"><button class="btn sm" data-gm="heal">${L('ฟื้นเต็ม', 'Heal')}</button><button class="btn sm${GM.god ? ' gold' : ''}" data-gm="god">${L('อมตะ', 'God')} ${GM.god ? 'ON' : 'OFF'}</button><button class="btn sm${GM.inv ? ' gold' : ''}" data-gm="inv">${L('ล่องหน', 'Invisible')} ${GM.inv ? 'ON' : 'OFF'}</button>
      <label>${L('ความเร็ว', 'Speed')}${sel('gmSpd', [[1, '×1'], [1.5, '×1.5'], [2, '×2'], [3, '×3']], GM.spd)}</label></div>
    <div class="row gmrow"><button class="btn sm" data-gm="maps">${L('ปลดทุกแผนที่', 'Unlock all maps')}</button><button class="btn sm" data-gm="quests">${L('ล้างเควสต์', 'Clear quests')}</button>
      <label>${L('เวลา', 'Time')}${sel('gmTime', [[0, L('ตามจริง', 'real')], [6, '+6h'], [12, '+12h'], [-6, '-6h']], window.GM_TOFS || 0)}</label>
      ${typeof EVENTS !== 'undefined' ? `<label>${L('เทศกาล', 'Festival')}${sel('gmFest', [['', L('ตามปฏิทิน', 'calendar')], ...Object.keys(EVENTS).map(k => [k, typeof evName === 'function' ? evName(k) : k])], SETTINGS.evPreview || '')}</label>` : ''}</div>
    <div class="sec">${L('ผู้เล่นออนไลน์', 'Online players')} · ${peers.length}</div>
    <div class="list" id="gmPeers">${peers.map(p => `<div class="item"><div class="nm"><b class="gmpn" data-peer="${escH(p.peer)}"></b><small>${JOBS[p.presence.j] ? nm(JOBS[p.presence.j]) : '—'} · Lv ${clamp(p.presence.l | 0, 0, 999)} · ${MAPS[p.presence.m] ? nm(MAPS[p.presence.m]) : '—'}</small></div>${p.isMe ? `<span class="ct">${L('คุณ', 'you')}</span>` : `<button class="btn sm" data-gm="goto" data-id="${escH(p.peer)}">${L('ไปหา', 'Go to')}</button>`}</div>`).join('') || `<p class="hint">${L('ไม่มีใครออนไลน์', 'Nobody online')}</p>`}</div>
    <div class="sec">${L('ประกาศทั้งเซิร์ฟเวอร์', 'Server announcement')}</div>
    <div class="row gmrow"><input id="gmAnn" maxlength="200" placeholder="${L('ข้อความถึงทุกคน…', 'Message to everyone…')}"><button class="btn sm gold" data-gm="ann">${L('ประกาศ', 'Announce')}</button></div>
    <div class="sec">${L('เซิร์ฟเวอร์', 'Server')}</div>
    ${online ? `<div class="row gmrow"><button class="btn sm gold" data-gm="backup"${GM.busy ? ' disabled' : ''}>${L('สำรองเซิร์ฟเวอร์', 'Backup server')}</button><button class="btn sm" data-gm="bklist">${L('รายการแบ็กอัป', 'List backups')}</button><button class="btn sm" data-gm="bkfile">${L('กู้จากไฟล์', 'Restore from file')}</button><button class="btn sm" data-gm="privacy"${GM.busy ? ' disabled' : ''} title="${L('ลบไอดีล็อกอินที่เวอร์ชันเก่าเผยแพร่ไว้ในอันดับและตลาด', 'Remove the log-in IDs older versions published in the ranking and the market')}">${L('ล้างไอดีล็อกอินเก่า', 'Clear old log-in IDs')}</button><button class="btn sm gmdanger" data-gm="reset"${GM.busy ? ' disabled' : ''}>${L('รีเซตโลก', 'Reset world')}</button></div>
      ${GM.busy ? `<p class="hint">${L('กำลังทำงาน… อย่าปิดหน้านี้', 'Working… keep this page open')}</p>` : ''}
      <div class="list" id="gmBk">${GM.list == null ? '' : GM.list.map(b => `<div class="item"><div class="nm"><b>${escH(b.id)}</b><small>${new Date(b.at || 0).toLocaleString()} · ${b.n | 0} docs · ${L('ซีซัน', 'season')} ${b.season | 0}${b.why === 'reset' ? ` · ${L('ก่อนรีเซต', 'before reset')}` : ''}</small></div><button class="btn sm" data-gm="restore" data-id="${escH(b.id)}">${L('กู้คืน', 'Restore')}</button></div>`).join('') || `<p class="hint">${L('ยังไม่มีแบ็กอัป', 'No backups yet')}</p>`}</div>`
      : `<p class="hint">${L('สำรอง/กู้คืน/รีเซตโลก ใช้ได้เมื่อออนไลน์เท่านั้น', 'Backup, restore and world reset need an online connection')}</p>`}
    <div class="sec">${L('บันทึก GM', 'GM log')}</div>
    <div class="list gmlog">${GM.log.slice(0, 15).map(e => `<div class="item"><div class="nm"><small>${new Date(e.at).toLocaleTimeString()} · ${escH(e.a)} ${escH(e.x)} · ${escH(e.r)}</small></div></div>`).join('') || `<p class="hint">—</p>`}</div>`;
  pane.querySelectorAll('.gmpn').forEach(b => { const p = peers.find(x => x.peer === b.dataset.peer); b.textContent = gmTag(p && p.by) + (clean(p && p.presence.n, 18) || L('นักผจญภัย', 'Adventurer')); });
};
/* ask the GM to type a word before something that cannot be undone */
function gmAskWord(title, text, word, then){
  const d = el('confirm');
  d.innerHTML = `<h3>${title}</h3><p>${text}</p><p>${L(`พิมพ์ <b>${word}</b> เพื่อยืนยัน`, `Type <b>${word}</b> to confirm`)}</p><input class="nmin" id="gmWord" autocomplete="off" placeholder="${word}"><div class="row"><button class="btn" data-cf="no">${L('ยกเลิก', 'Cancel')}</button><button class="btn gold" data-cf="ok">${L('ยืนยัน', 'Confirm')}</button></div>`;
  d.hidden = false; const i = el('gmWord'); setTimeout(() => i && i.focus(), 50);
  d.onclick = e => { const b = e.target.closest('[data-cf]'); if (!b) return; if (b.dataset.cf === 'ok' && i.value.trim() !== word){ toast(L(`ต้องพิมพ์ ${word}`, `Type ${word}`)); return; } d.hidden = true; if (b.dataset.cf === 'ok') then(i.value.trim()); };
}
const gmVal = id => { const e = el(id); return e ? e.value : ''; };
document.addEventListener('click', e => {
  const c = e.target.closest && e.target.closest('#gmBtn'); if (c){ gmOpen(); return; }
  const b = e.target.closest && e.target.closest('#win-gm [data-gm]'); if (!b) return; const k = b.dataset.gm, id = b.dataset.id;
  if (k === 'tp') gmTeleport(+gmVal('gmMap'), gmVal('gmX'), gmVal('gmY'));
  else if (k === 'lv') gmSetLevel(+gmVal('gmLv'));
  else if (k === 'jl') gmSetJobLevel(+gmVal('gmJl'));
  else if (k === 'job') gmSetJob(gmVal('gmJob'));
  else if (k === 'pts') gmSetPoints(gmVal('gmSp'), gmVal('gmKp'));
  else if (k === 'bia') gmGiveBia(+gmVal('gmZ'));
  else if (k === 'coins') gmGiveCoins(+gmVal('gmC'));
  else if (k === 'give') gmGive(id, +gmVal('gmN') || 1, +gmVal('gmR') || 0);
  else if (k === 'spawn') gmSpawn(id, +gmVal('gmMn') || 1);
  else if (k === 'killall') gmKillAll();
  else if (k === 'heal') gmHeal();
  else if (k === 'god' || k === 'inv') gmToggle(k);
  else if (k === 'maps') gmUnlockMaps();
  else if (k === 'quests') askConfirm(L('ล้างเควสต์', 'Clear quests'), L('ล้างความคืบหน้าเควสต์หลักและเควสต์รองของตัวละครนี้?', "Clear this character's main and side quest progress?"), L('ล้าง', 'Clear'), () => gmClearQuests());
  else if (k === 'goto') gmGotoPlayer(id);
  else if (k === 'ann'){ const t = gmVal('gmAnn'); gmAnnounce(t).then(ok => { if (ok){ const i = el('gmAnn'); if (i) i.value = ''; toast(L('ประกาศแล้ว', 'Announced')); } }); }
  else if (k === 'backup') gmServerBackup();
  else if (k === 'privacy') askConfirm(L('ล้างไอดีล็อกอินเก่า', 'Clear old log-in IDs'), L('ลบไอดีล็อกอินที่เวอร์ชันก่อน v285 เผยแพร่ไว้ ออกจากการ์ดผู้เล่นทุกใบและรายการในตลาด (ชื่อตัวละคร เลเวล และของ ไม่ถูกแตะ)', 'Remove the log-in IDs versions before v285 published from every player card and market listing (hero names, levels and items are untouched)'), L('ล้าง', 'Clear'), () => gmPrivacy());
  else if (k === 'bklist') gmVerify().then(on => on && gmBackupList());
  else if (k === 'bkfile'){ let f = el('gmFile'); if (!f){ document.body.insertAdjacentHTML('beforeend', '<input type="file" id="gmFile" accept=".json,application/json" hidden>'); f = el('gmFile'); } f.click(); }
  else if (k === 'restore') askConfirm(L('กู้คืนแบ็กอัป', 'Restore backup'), L(`เขียนข้อมูลกลาง (ผู้เล่น กิลด์ ตลาด หอเกียรติยศ) จาก ${escH(id)} ทับของปัจจุบัน?`, `Write the shared data (players, guilds, market, fame) from ${escH(id)} over what is there now?`), L('ต่อไป', 'Next'),
    () => gmAskWord(L('กู้คืนแบ็กอัป', 'Restore backup'), L('ข้อมูลกลางที่มีชื่อเดียวกันจะถูกเขียนทับ', 'Shared docs with the same path will be overwritten'), 'RESTORE', w => gmRestore(id, w)));
  else if (k === 'reset') askConfirm(L('รีเซตโลก', 'Reset world'), L('จบช่วงทดสอบ: สำรองเซิร์ฟเวอร์ แล้วลบข้อมูลกลางทั้งหมด ทุกคน (รวมคุณ) จะเริ่มจาก 0 · เซฟเก่าของแต่ละคนถูกเก็บสำรองในพื้นที่ส่วนตัวก่อนลบ', 'End the test: back up the server, then delete all shared data. Everyone (you too) starts from 0 · each player\'s old saves are archived privately first'), L('ต่อไป', 'Next'),
    () => gmAskWord(L('ยืนยันรีเซตโลก', 'Confirm world reset'), L('ย้อนกลับไม่ได้ (กู้ข้อมูลกลางคืนจากแบ็กอัปได้)', 'This cannot be undone (shared data can be restored from the backup)'), 'RESET', w => gmResetWorld(w)));
});
document.addEventListener('change', e => {
  const t = e.target; if (!t || !t.id) return;
  if (t.id === 'gmSpd') gmSpeed(+t.value); else if (t.id === 'gmTime') gmTime(+t.value); else if (t.id === 'gmFest') gmFestival(t.value);
  else if (t.id === 'gmFile' && t.files && t.files[0]){ const r = new FileReader(), f = t.files[0]; t.value = '';
    r.onload = () => { let o; try { o = JSON.parse(r.result); if (!o || o.kind !== 'server-backup') throw 0; } catch (er){ toast(L('ไฟล์ไม่ใช่แบ็กอัปเซิร์ฟเวอร์', 'Not a server backup file')); return; }
      gmAskWord(L('กู้คืนจากไฟล์', 'Restore from file'), L(`${escH(o.id || f.name)} · ${Object.keys(o.docs || {}).length} รายการ จะเขียนทับข้อมูลกลาง`, `${escH(o.id || f.name)} · ${Object.keys(o.docs || {}).length} docs will overwrite shared data`), 'RESTORE', w => gmRestore(o, w)); };
    r.readAsText(f); }
});
document.addEventListener('input', e => {
  const t = e.target; if (!t) return;
  if (t.id === 'gmQ'){ GM.q = t.value; const l = el('gmItems'); if (l) l.innerHTML = gmItemRows(); }
  else if (t.id === 'gmMq'){ GM.mq = t.value; const l = el('gmMobs'); if (l) l.innerHTML = gmMobRows(); }
});
/* F8 opens the panel (GMs only); typing in the panel never moves the hero */
window.addEventListener('keydown', e => {
  const t = e.target;
  if (t && t.closest && (t.closest('#win-gm') || t.id === 'gmWord') && t.matches('input,select,textarea')){ e.stopPropagation(); return; }
  if (e.key === 'F8'){ e.preventDefault(); e.stopPropagation(); gmOpen(); }
}, true);
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'gm', t:['GM และการรีเซตโลก', 'GM & world reset'], b:() => `<p>${L('GM คือผู้ดูแลเกม (เจ้าของลิงก์ claude.ai หรือ uid ใน GM_UIDS บน Firebase) มีป้าย [GM] ที่ชื่อ · เมื่อจบช่วงทดสอบเปิด GM จะสำรองเซิร์ฟเวอร์แล้วรีเซตโลก ทุกคนเริ่มจาก 0 · ข้อมูลเก่าของคุณถูกเก็บสำรองไว้ในเครื่องและพื้นที่คลาวด์ส่วนตัวก่อนลบ', 'GMs run the game (the claude.ai link\'s owner, or a uid in GM_UIDS on Firebase) and carry a [GM] tag · when the open test ends a GM backs up the server and resets the world: everyone starts from 0 · your old data is archived on this device and in your private cloud space first')}</p>`});
