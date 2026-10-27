/* VAYRATHEN — js/net/online.js
   Online play through the claude.ai artifact runtime (works only when the game is opened as a claude.ai
   artifact; anywhere else the game simply runs offline):
   · Identity: the viewer's claude.ai account (user capability) — no extra login. The hero's name is the
     character name typed on first play (stored in the save).
   · Cloud save: data/users/<id>/save (db, private to that person); the newer of cloud and browser wins.
   · Players directory + ranking: players/<id> (everyone reads, each writes only their own).
   · Live world: a named room per map (room capability). Everyone's position, job, level and HP travel in
     presence, so other heroes walk around on your screen. Chat (all / map / party), party invites and
     shared party EXP are room events in the lobby.
   Everything received is untrusted: names and chat are drawn as text only, numbers are clamped. */
'use strict';

const NET = {ready:false, on:false, user:null, db:null, room:null, uid:null, me:null, mapRoom:null, mapName:'', party:null, partyLeader:null, invite:null,
  chat:[], ghosts:new Map(), lastPres:{}, presT:0, lobbyT:0, cloudT:0, dirT:0, dirSig:'', canSend:true};
const NET_MAX_CHAT = 60, NET_MAP_CAP = 20;   // heroes shown per map (nearest first)

async function netInit(){
  if (!window.claude || typeof window.claude.use !== 'function'){ renderNet(); if (typeof gmNetReady === 'function') gmNetReady(); return; }
  const use = n => window.claude.use(n).catch(() => null);
  const [user, db, room] = await Promise.all([use('user'), use('db'), use('room')]);
  NET.user = user; NET.db = db; NET.room = room;
  if (user){ try { NET.uid = await user.id(); NET.me = await user.me(); } catch (e) {} }
  if (room){
    room.onConnection(c => { NET.on = c; renderNet(); }, () => { NET.on = false; renderNet(); });
    room.on('chat', onChat, () => {}); room.on('party', onParty, () => {}); room.on('pexp', onPartyExp, () => {});
    room.onPeers(() => { renderSocial(); }, () => {});
    joinMapRoom(MAP_ID);
  }
  NET.ready = true; renderNet();
  if (typeof gmNetReady === 'function') await gmNetReady();   // who is GM (js/sys/gm.js)
  if (db && NET.uid){ if (typeof seasonNet === 'function') await seasonNet(); cloudCheck(); if (typeof accCloudLoad === 'function') accCloudLoad(); }   // a world reset first (js/sys/season.js), then cloud saves
  if (typeof EV !== 'undefined') EV.emit('netready');
}
const netName = () => (S.name || (NET.me && NET.me.name) || nm(JOBS[S.job])).slice(0, 18);
const clean = (s, n = 120) => String(s || '').replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩]/g, '').slice(0, n);

/* ---------- live map room ---------- */
async function joinMapRoom(id){
  if (!NET.room) return;
  const name = (typeof dgRoom === 'function' && dgRoom()) || `map-${id}`; if (NET.mapName === name) return;
  const old = NET.mapRoom; NET.mapRoom = null; NET.mapName = name; NET.ghosts.clear();
  if (old) old.leave().catch(() => {});
  try { NET.mapRoom = await NET.room.join(name); NET.lastPres = {}; } catch (e) { NET.mapName = ''; }
}
/* send my position (often) and my profile line (rarely) */
function netTick(dt){
  if (!NET.room) return;
  NET.presT -= dt; NET.lobbyT -= dt; NET.dirT -= dt;
  if (NET.mapRoom && NET.presT <= 0){
    // up to 20 heroes share a map room: send less often as it fills so the room stays light (8/s alone → ~4/s full)
    NET.presT = NET.mapRoom ? (NET.mapRoom.peers().length > 10 ? .25 : NET.mapRoom.peers().length > 4 ? .18 : .12) : .12;
    if (typeof NM !== 'undefined' && (NM.host || NM.holding)) NET.presT = Math.max(NET.presT, .2);   // the monster host's presence carries the snapshot: keep it at 5/s
    const p = {n:netName(), j:S.job, l:S.lvl, x:Math.round(P.x), y:Math.round(P.y), d:P.dir || 0, a:P.act || 'idle', r:P.ride ? 1 : 0, h:Math.round(S.hp / DER.maxhp * 100), sp:Math.round(S.sp / DER.maxsp * 100), pt:NET.party || null, s:P.sit ? 1 : 0, dead:P.dead ? 1 : 0, g:(vg => { const a = GHOST_SLOTS.map(k => vg[k] || ''); while (a.length > 4 && !a[a.length - 1]) a.pop(); return a.join(','); })(typeof visGear === 'function' ? visGear(S.gear) : S.gear || {}), ti:S.title || '', gn:(S.guild && S.guild.name) || '', lk:SPR.lookKey(S.look), ...(typeof wbPres === 'function' ? wbPres() : {}), ...(typeof nmPres === 'function' ? nmPres() : {}), ...(typeof dgPres === 'function' ? dgPres() : {}), ...(typeof pvpPres === 'function' ? pvpPres() : {}), ...(typeof afPres === 'function' ? afPres() : {}), ...(typeof cosPres === 'function' ? cosPres() : {}), ...(typeof emoPres === 'function' ? emoPres() : {}), ...(typeof siegePres === 'function' ? siegePres() : {}), ...(typeof rfPres === 'function' ? rfPres() : {}), ...(typeof gmPres === 'function' ? gmPres() : {}), ...(typeof sumPres === 'function' ? sumPres() : {}), ...(typeof gfxPres === 'function' ? gfxPres() : {})};
    let ch = false; for (const k in p) if (p[k] !== NET.lastPres[k]){ ch = true; break; }
    NET.hbT = (NET.hbT || 0) - dt; if (!ch && NET.hbT <= 0) ch = true;   // heartbeat: other clients drop a hero who has been silent for 45 s (see firebase-shim.js)
    if (ch) NET.hbT = 10;
    if (ch){ NET.lastPres = p; NET.mapRoom.presence(p).catch(() => {}); }
  }
  if (NET.lobbyT <= 0){ NET.lobbyT = 2; NET.room.presence({n:netName(), j:S.job, l:S.lvl, m:MAP_ID, h:Math.round(S.hp / DER.maxhp * 100), pt:NET.party || null, ...(typeof partyPres === 'function' ? partyPres() : {})}).catch(() => {}); }
  // players directory (for the ranking), only when something changed
  if (NET.db && NET.uid && NET.dirT <= 0 && !S.gmLocal){ NET.dirT = 30; const acc = typeof ACC !== 'undefined' ? ACC.name : '', sig = `${netName()}|${S.job}|${S.lvl}|${MAP_ID}|${S.shards || 0}|${acc}|${S.title || ''}|${(S.guild && S.guild.id) || ''}|${S.pvp ? S.pvp.r : 1000}|${Object.keys(S.ach || {}).length}|${(S.tower && S.tower.best) || 0}|${typeof housePub === 'function' ? JSON.stringify(housePub()) : ''}`;
    if (sig !== NET.dirSig){ NET.dirSig = sig; NET.db.doc(`players/${NET.uid}`).set({name:netName(), job:S.job, lvl:S.lvl, map:MAP_ID, shards:S.shards || 0, acc, title:S.title || '', guild:(S.guild && S.guild.id) || '', ach:Object.keys(S.ach || {}).length, pvp:S.pvp ? S.pvp.r : 1000, house:typeof housePub === 'function' ? housePub() : null, tower:(S.tower && S.tower.best) || 0, at:Date.now()}).catch(() => {}); } }
  // smooth everyone else toward their latest position
  if (NET.mapRoom) for (const pe of NET.mapRoom.peers()){
    if (pe.isMe || pe.kind !== 'viewer') continue; const q = pe.presence || {};
    if (typeof q.x !== 'number' || typeof q.y !== 'number') continue;
    let g = NET.ghosts.get(pe.peer); if (!g){ g = {x:q.x, y:q.y, t:0}; NET.ghosts.set(pe.peer, g); }
    g.x += (clamp(q.x, 0, W) - g.x) * Math.min(1, dt * 10); g.y += (clamp(q.y, 0, H) - g.y) * Math.min(1, dt * 10);
    g.moving = Math.hypot(q.x - g.x, q.y - g.y) > 2; g.t += dt; g.peer = pe.peer; g.by = pe.by; g.q = q;
  }
  for (const [k, g] of NET.ghosts) if (!NET.mapRoom || !NET.mapRoom.peers().some(pe => pe.peer === k)) NET.ghosts.delete(k);
}
/* a peer's worn gear from presence (untrusted: only real item ids in their proper slot are kept) */
const GHOST_SLOTS = ['head', 'armor', 'weapon', 'acc', 'shield', 'pants', 'shoes'];   // v29: shield and legs are back in places 4–5
function ghostGear(str){
  const out = {}; if (typeof str !== 'string' || str.length > 300) return out;
  str.split(',').forEach((id, i) => { const slot = GHOST_SLOTS[i], it = GEAR[id]; if (slot && ((it && it.slot === slot) || (typeof COSTUME !== 'undefined' && COSTUME[id] && COSTUME[id].slot === (slot === 'armor' ? 'top' : slot)))) out[slot] = id; });
  return out;
}
function ghostLook(k){ return SPR.parseLookKey ? SPR.parseLookKey(k) : null; }   // sex · style · hair colour · eye colour (untrusted: only known values)
/* other heroes on this map, drawn with the same sprites as you */
function drawGhostsInto(ents, g){
  const list = [...NET.ghosts.values()]; if (list.length > NET_MAP_CAP - 1) list.sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y)).length = NET_MAP_CAP - 1;
  for (const gh of list){
    if (typeof gmHidden === 'function' && gmHidden(gh)) continue;
    const q = gh.q || {}, job = JOBS[q.j] ? q.j : 'novice', sh = heroSheet(job, ghostGear(q.g), ghostLook(q.lk, q.rf)); if (!sh) continue;
    ents.push({y:gh.y, f:() => {
      const x = gh.x - cam.x, y = gh.y - cam.y; if (x < -60 || x > VW + 60 || y < -80 || y > VH + 40) return;
      const mk = q.r && typeof XMOUNT !== 'undefined' && XMOUNT[q.mt] ? XMOUNT[q.mt] : null, gem = typeof ghostEmo === 'function' ? ghostEmo(q) : null, emv = gem ? emoMotion(gem, T) : {dx:0, dy:0};
      const act = q.dead ? 'die' : mk ? (mk.kind === 'beast' ? 'sit' : 'idle') : q.r ? (gh.moving ? 'ride' : 'rideIdle') : q.s ? 'sit' : gh.moving ? 'walk' : (sh.index[q.a] && !['die', 'ride', 'rideIdle'].includes(q.a) ? q.a : 'idle');
      const wg = typeof wingDef === 'function' && typeof q.wg === 'string' && q.wg.length < 40 && wingDef(q.wg) && !q.dead ? q.wg : null, dd = clamp(q.d | 0, 0, 7), wo = {moving:gh.moving, ride:!!q.r && !mk, sit:!!q.s || !!(mk && mk.kind === 'beast')};
      shadowW(g, x, y, q.r ? 16 : 9); if (SETTINGS.oFx !== false && typeof COS_SETS !== 'undefined' && COS_SETS[q.cset] && !q.dead) drawSetAura(g, q.cset, x, y, T);
      if (mk) drawMountX(g, mk, x, y, dd, T, gh.moving, 'under');
      const lift = (mk ? mk.lift + (mk.fly ? mk.fly : 0) : 0) - emv.dy;
      g.save(); g.translate(emv.dx, -lift);
      if (wg) drawWings(g, wg, x, y, dd, T + gh.t * .1, {...wo, part:'back'});
      SPR.draw(g, sh, act, dd, gh.t, x, y);
      if (wg) drawWings(g, wg, x, y, dd, T + gh.t * .1, {...wo, part:'front'});
      g.restore();
    }});
  }
}
function drawGhostTags(){
  for (const gh of NET.ghosts.values()){
    if (typeof gmHidden === 'function' && gmHidden(gh)) continue;
    const q = gh.q || {}, x = sx(gh.x), y = sy(gh.y); if (x < -100 || x > SW + 100 || y < -80 || y > SH + 80) continue;
    const mate = NET.party && q.pt === NET.party;
    const foe = typeof DUEL !== 'undefined' && !DUEL.over && DUEL.peer === gh.peer;
    if (SETTINGS.oName === false){ gh.tagTop = sy(gh.y - HEAD_H(q.r)); if (gh.say && T < gh.sayT) nameTag(x, gh.tagTop - 4 * TAG_Z(), gh.say, '#fff', 'rgba(40,30,20,.88)'); continue; }
    if (!q.dead) vitalBars(x, y, clamp(q.h == null ? 100 : q.h | 0, 0, 100) / 100, q.sp == null ? null : clamp(q.sp | 0, 0, 100) / 100, {foe});
    gh.tagTop = heroName(x, sy(gh.y - HEAD_H(q.r)), (typeof gmTag === 'function' ? gmTag(gh.by) : '') + (clean(q.n, 18) || L('นักผจญภัย', 'Adventurer')), mate ? 'mate' : 'other', {title:SETTINGS.oTitle !== false && typeof titleTxt === 'function' ? titleTxt(q.ti) : '', tc:typeof titleCol === 'function' ? titleCol(q.ti) : '', tier:typeof ACH_BY !== 'undefined' && ACH_BY[q.ti] ? ACH_BY[q.ti].tier : 0, guild:SETTINGS.oGuild !== false ? clean(q.gn, 16) : '', lv:clamp(q.l | 0, 0, 999)});
    if (typeof afDrawGhost === 'function' && !q.dead) afDrawGhost(x, gh.tagTop, q.af);
    if (gh.say && T < gh.sayT){ nameTag(x, gh.tagTop - 4 * TAG_Z(), gh.say, '#fff', 'rgba(40,30,20,.88)'); }
  }
  if (P.sayT > T && P.say) nameTag(sx(P.x), (P.tagTop != null ? P.tagTop : sy(P.y - 60)) - 4 * TAG_Z(), P.say, '#fff', 'rgba(40,30,20,.88)');
}
function ghostAt(p){ for (const gh of NET.ghosts.values()) if (!(typeof gmHidden === 'function' && gmHidden(gh)) && Math.hypot(p.x - gh.x, p.y - 20 - gh.y) < 18) return gh; return null; }

/* ---------- chat ---------- */
function onChat(msg){
  const d = msg.data || {}; const ch = ['all', 'map', 'party', 'guild', 'w'].includes(d.c) ? d.c : 'all';
  if (ch === 'w' && !msg.isMe && (!NET.uid || d.to !== NET.uid)) return;
  if (ch === 'guild' && (!S.guild || d.g !== S.guild.id)) return;
  if (ch === 'map' && d.m !== MAP_ID) return;
  if (ch === 'party' && (!NET.party || d.pt !== NET.party)) return;
  const text = clean(d.t), who = (typeof gmTag === 'function' ? gmTag(msg.by) : '') + (clean(d.n, 18) || L('นักผจญภัย', 'Adventurer')); if (!text) return;
  const job = JOBS[d.j] ? d.j : null, lvl = clamp(d.l | 0, 0, 999);
  NET.chat.push({ch, who:ch === 'w' && msg.isMe ? `→ ${clean(d.tn, 18)}` : who, job, lvl, text, me:msg.isMe, at:Date.now()});
  if (ch === 'w' && !msg.isMe){ SFX.play('tut'); toast(L(`กระซิบจาก ${who}`, `Whisper from ${who}`)); } if (NET.chat.length > NET_MAX_CHAT) NET.chat.shift();
  if (msg.isMe){ P.say = text.slice(0, 40); P.sayT = T + 5; }
  else { if (NET.mapRoom) for (const g of NET.ghosts.values()) if (g.peer === msg.peer){ g.say = text.slice(0, 40); g.sayT = T + 5; } SFX.play('chat'); }
  renderChat();
}
/* one place that sends what's typed: Enter on a keyboard, the phone keyboard's Send key (form submit) or the ส่ง button */
function chatSubmit(){
  const inp = el('chatIn'); if (!inp) return; const v = inp.value.trim(); if (!v) return;
  const now = performance.now(); if (now - (NET.sendT || 0) < 900){ return; } NET.sendT = now;
  sendChat(v, el('chatCh').value); inp.value = '';
  if (!matchMedia('(pointer:coarse)').matches) inp.blur();
}
document.addEventListener('submit', e => { if (e.target && e.target.id === 'chatForm'){ e.preventDefault(); chatSubmit(); } }, true);
async function sendChat(text, ch){
  text = clean(text); if (!text) return;
  if (ch === 'party' && !NET.party){ NET.chat.push({ch:'sys', who:'', text:L('คุณยังไม่ได้อยู่ในปาร์ตี้', 'You are not in a party'), at:Date.now()}); renderChat(); return; }
  if (!NET.room || !NET.on){ NET.chat.push({ch:'sys', who:'', text:L('ยังไม่ได้เชื่อมต่อออนไลน์', 'Not connected'), at:Date.now()}); renderChat(); return; }
  try { if (ch === 'guild' && !S.guild){ NET.chat.push({ch:'sys', who:'', text:L('คุณยังไม่มีกิลด์', 'You are not in a guild'), at:Date.now()}); renderChat(); return; }
    if (ch.startsWith('w:')){ const uid = ch.slice(2), f = (typeof friends === 'function' ? friends() : {})[uid]; await NET.room.emit('chat', {c:'w', to:uid, tn:f ? f.n : '', t:text, n:netName(), j:S.job, l:S.lvl, m:MAP_ID}); return; }
    await NET.room.emit('chat', {c:ch, t:text, n:netName(), j:S.job, l:S.lvl, m:MAP_ID, pt:NET.party || null, g:S.guild ? S.guild.id : null}); }
  catch (e){ NET.chat.push({ch:'sys', who:'', text:e && e.code === 'not_permitted' ? L('สิทธิ์ของคุณส่งแชทไม่ได้ (ต้องเป็น Contributor ขึ้นไป)', 'Your access level cannot chat (Contributor or above)') : L('ส่งไม่สำเร็จ ลองใหม่อีกครั้ง', 'Could not send, try again') + (e && e.message ? ` (${clean(e.message, 60)})` : ''), at:Date.now()}); renderChat(); }
}
/* ---------- party ---------- */
function onParty(msg){
  const d = msg.data || {}; if (msg.isMe) return;
  if (d.k === 'invite' && d.to === myPeer()){ NET.invite = {from:msg.peer, pt:clean(d.pt, 40), name:clean(d.n, 18)}; renderInvite(); SFX.play('chat'); }
  if (d.k === 'accept' && d.pt && d.pt === NET.party) log(L(`${clean(d.n, 18)} เข้าปาร์ตี้แล้ว`, `${clean(d.n, 18)} joined the party`), 'g');
  if (d.k === 'leave' && d.pt === NET.party) log(L(`${clean(d.n, 18)} ออกจากปาร์ตี้`, `${clean(d.n, 18)} left the party`));
  renderSocial();
}
function myPeer(){ const me = NET.room && NET.room.peers().find(p => p.sameTab); return me ? me.peer : null; }
async function partyInvite(peer){
  if (!NET.room) return; if (!NET.party){ NET.party = `p-${myPeer() || Math.random().toString(36).slice(2, 10)}`; }
  try { await NET.room.emit('party', {k:'invite', to:peer, pt:NET.party, n:netName()}); toast(L('ส่งคำเชิญแล้ว', 'Invite sent')); } catch (e){ toast(L('เชิญไม่สำเร็จ', 'Could not invite')); }
  renderSocial();
}
function partyAccept(){ const iv = NET.invite; if (!iv) return; NET.party = iv.pt; NET.invite = null; NET.room.emit('party', {k:'accept', pt:NET.party, n:netName()}).catch(() => {}); NET.lobbyT = 0; NET.presT = 0; renderInvite(); renderSocial(); log(L(`เข้าปาร์ตี้ของ ${iv.name}`, `Joined ${iv.name}'s party`), 'g'); }
function partyLeave(){ if (!NET.party) return; NET.room && NET.room.emit('party', {k:'leave', pt:NET.party, n:netName()}).catch(() => {}); NET.party = null; NET.lobbyT = 0; NET.presT = 0; renderSocial(); }
function partyMembers(){ if (!NET.room || !NET.party) return []; return NET.room.peers().filter(p => p.presence && p.presence.pt === NET.party); }
/* a kill shares 30% of its EXP with party members on the same map nearby */
function partyShareExp(be, je, x, y){ if (!NET.room || !NET.party || partyMembers().filter(p => !p.isMe).length === 0) return; NET.room.emit('pexp', {pt:NET.party, m:MAP_ID, x:Math.round(x), y:Math.round(y), e:be, j:je}).catch(() => {}); }
function onPartyExp(msg){
  const d = msg.data || {}; if (msg.isMe || !NET.party || d.pt !== NET.party || d.m !== MAP_ID || P.dead) return;
  if (Math.hypot((+d.x || 0) - P.x, (+d.y || 0) - P.y) > 900) return;
  const e = Math.max(0, Math.min(1e9, Math.round((+d.e || 0) * .3))), j = Math.max(0, Math.min(1e9, Math.round((+d.j || 0) * .3)));
  if (e || j){ gainExp(e, j); if (typeof sysMsg === 'function') sysMsg(L(`ปาร์ตี้: EXP +${e} · Job +${j}`, `Party: EXP +${e} · Job +${j}`), 'exp'); }
}

/* ---------- cloud save ---------- */
function cloudSave(force){
  if (!NET.db || !NET.uid || S.gmLocal) return; const now = Date.now(); if (!force && now - NET.cloudT < 30000) return; NET.cloudT = now;   // a hero edited in offline GM mode stays on this device
  S.savedAt = now;
  NET.db.doc(`data/users/${NET.uid}/${cloudDoc(SLOT)}`).set({s:JSON.stringify(S), at:now, lvl:S.lvl, job:S.job}).catch(() => {});
}
const cloudDoc = i => (i ? `save${i}` : 'save');
function cloudDelete(i){ if (NET.db && NET.uid) NET.db.doc(`data/users/${NET.uid}/${cloudDoc(i)}`).delete().catch(() => {}); }
async function cloudCheck(){
  for (let i = 0; i < SLOTS; i++) try { const snap = await NET.db.doc(`data/users/${NET.uid}/${cloudDoc(i)}`).get(); if (!snap.exists) continue; const d = snap.data();
    const local = load(i); if (local && (local.savedAt || 0) >= (d.at || 0)) continue;
    const s = JSON.parse(d.s); if (!s || !s.job || (typeof seasonOld === 'function' && seasonOld(s))) continue;   // never bring back a save from before a world reset
    localStorage.setItem(slotKey(i), d.s); NET.cloudNote = L(`โหลดเซฟจากคลาวด์ (Lv ${s.lvl})`, `Loaded your cloud save (Lv ${s.lvl})`);
  } catch (e) {}
  if (!el('title').hidden && PAUSED) showTitle();
}

/* ---------- export / import a save file ---------- */
async function exportSave(){
  save(); const data = JSON.stringify({game:'vayrathen', v:S.v, at:Date.now(), s:S}, null, 1), filename = `vayrathen-${(S.name || S.job).replace(/[^\w฀-๿-]+/g, '')}-Lv${S.lvl}.json`;
  const dl = window.claude && window.claude.use ? await window.claude.use('downloads').catch(() => null) : null;
  if (dl){ try { await dl.save({filename, data}); toast(L('ส่งออกเซฟแล้ว', 'Save exported')); } catch (e){ toast(L('ยกเลิกการส่งออก', 'Export cancelled')); } return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], {type:'application/json'})); a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function importSave(file){
  const r = new FileReader();
  r.onload = () => { try { const o = JSON.parse(r.result), s = o && o.s; if (!o || o.game !== 'vayrathen' || !s || !JOBS[s.job]) throw 0;
      if (typeof seasonOld === 'function' && seasonOld(s)){ toast(L('เซฟนี้มาจากก่อนรีเซตโลก ใช้ในซีซันนี้ไม่ได้', 'This save is from before the world reset')); return; }
      askConfirm(L('นำเข้าเซฟ', 'Import save'), L(`แทนที่ตัวละครปัจจุบันด้วย ${nm(JOBS[s.job])} Lv ${s.lvl}?`, `Replace your current character with ${nm(JOBS[s.job])} Lv ${s.lvl}?`), L('นำเข้า', 'Import'), () => {
        localStorage.setItem(slotKey(SLOT), JSON.stringify(s)); for (const w of WIN_IDS) closeWin(w); continueGame(); cloudSave(true); toast(L('นำเข้าเซฟแล้ว', 'Save imported')); });
    } catch (e){ toast(L('ไฟล์เซฟไม่ถูกต้อง', 'Not a valid save file')); } };
  r.readAsText(file);
}

/* ---------- UI: status chip, chat box, invite prompt, social window ---------- */
function renderNet(){
  const c = el('netChip'); if (!c) return;
  const st = !NET.room ? 'off' : NET.on ? 'on' : 'wait';
  c.dataset.st = st; c.querySelector('span').textContent = st === 'on' ? L(`ออนไลน์ ${NET.room.peers().length}`, `${NET.room.peers().length} on`) : st === 'wait' ? '…' : L('ออฟ', 'Off');
  c.title = st === 'on' ? `${L('ออนไลน์', 'Online')} · ${NET.room.peers().length} ${L('คน', 'players')}` : st === 'wait' ? L('กำลังเชื่อมต่อ…', 'Connecting…') : L('ออฟไลน์', 'Offline');
  if (typeof chatShow === 'function') chatShow(); else el('chatBox').hidden = !NET.room;
}
let chatTab = 'all';
function renderChat(){
  const box = el('chatLog'); if (!box) return;
  const want = chatTab === 'world' ? 'all' : chatTab, rows = NET.chat.filter(c => chatTab === 'all' || c.ch === want || c.ch === 'sys').slice(-40);
  box.textContent = '';
  for (const c of rows){ const d = document.createElement('div'); d.className = `cl ch-${c.ch}${c.me ? ' me' : ''}`;
    if (c.ch === 'all'){ const t = document.createElement('span'); t.className = 'ctag'; t.textContent = L('โลก', 'World'); d.appendChild(t); }
    if (c.ch === 'party' || c.ch === 'map' || c.ch === 'guild' || c.ch === 'w'){ const t = document.createElement('span'); t.className = 'ctag'; t.textContent = c.ch === 'party' ? L('ปาร์ตี้', 'Party') : c.ch === 'guild' ? L('กิลด์', 'Guild') : c.ch === 'w' ? L('กระซิบ', 'Whisper') : L('แผนที่', 'Map'); d.appendChild(t); }
    if (c.who){ const b = document.createElement('b'); b.textContent = c.who; d.appendChild(b);
      if (c.job){ const j = document.createElement('span'); j.className = 'cjob'; j.textContent = `${nm(JOBS[c.job])} Lv.${c.lvl}`; d.appendChild(j); }
      d.appendChild(document.createTextNode(': ')); }
    d.appendChild(document.createTextNode(c.text)); box.appendChild(d); }
  box.scrollTop = box.scrollHeight;
}
function renderInvite(){
  const b = el('inviteBox'); if (!b) return; const iv = NET.invite; b.hidden = !iv; if (!iv) return;
  b.querySelector('.iv-t').textContent = L(`${iv.name} ชวนคุณเข้าปาร์ตี้`, `${iv.name} invites you to a party`);
}
let rankRows = [], rankUnsub = null;
function renderSocial(){
  renderNet();
  const pane = el('pane-social'); if (!pane || el('win-social').hidden) return;
  if (!NET.room){ pane.innerHTML = `<p class="hint">${L('ระบบออนไลน์ใช้ได้เมื่อเปิดเกมผ่านลิงก์ claude.ai ที่แชร์ให้เพื่อนในองค์กร · ตอนนี้เล่นแบบออฟไลน์', 'Online play works when the game is opened from its claude.ai link shared with your organization · playing offline now')}</p>`; return; }
  const peers = NET.room.peers().filter(p => p.kind === 'viewer'), mates = partyMembers();
  const row = (p, act) => { const q = p.presence || {}; return `<div class="item"><div class="nm"><b class="pn"></b><small>${JOBS[q.j] ? nm(JOBS[q.j]) : '—'} · Lv ${clamp(q.l | 0, 1, 999)} · ${MAPS[q.m] ? nm(MAPS[q.m]) : '—'}${p.guest ? ' · guest' : ''}</small></div>${act}</div>`; };
  pane.innerHTML = `<div class="sec">${L('ปาร์ตี้', 'Party')}${NET.party ? ` · ${mates.length} ${L('คน', 'members')}` : ''}</div>
    <div class="list" id="soParty">${NET.party ? mates.map(p => row(p, p.isMe ? `<span class="ct">${L('คุณ', 'you')}</span>` : '')).join('') + `<button class="btn wide" data-pleave="1">${L('ออกจากปาร์ตี้', 'Leave party')}</button>` : `<p class="hint">${L('กดที่ผู้เล่นคนอื่นในแผนที่ หรือกดชวนจากรายชื่อด้านล่าง · ปาร์ตี้แบ่ง EXP 30% ให้เพื่อนที่อยู่ใกล้', 'Click another hero on the map or invite from the list below · party members nearby share 30% of each kill\'s EXP')}</p>`}</div>
    <div class="sec">${L('ออนไลน์ตอนนี้', 'Online now')} · ${peers.length}</div>
    <div class="list" id="soPeers">${peers.map(p => row(p, p.isMe ? `<span class="ct">${L('คุณ', 'you')}</span>` : (p.presence && p.presence.pt && p.presence.pt === NET.party) ? `<span class="ct">${L('ในปาร์ตี้', 'in party')}</span>` : `<button class="btn sm" data-pinv="${p.peer}">${L('ชวน', 'Invite')}</button>`)).join('')}</div>
    <div class="sec">${L('อันดับนักผจญภัย', 'Adventurer ranking')}</div>
    <div class="list rank" id="soRank">${rankRows.length ? rankRows.map((r, i) => `<div class="item"><span class="rk">${i + 1}</span><div class="nm"><b class="pn"></b><small>${JOBS[r.job] ? nm(JOBS[r.job]) : '—'} · Lv ${clamp(r.lvl | 0, 1, 999)} · ${L('ศิลา', 'shards')} ${clamp(r.shards | 0, 0, QUESTS.length)}/${QUESTS.length}</small></div></div>`).join('') : `<p class="hint">${L('ยังไม่มีข้อมูล', 'No data yet')}</p>`}</div>`;
  // names are set as text, never HTML
  const pn = pane.querySelectorAll('#soParty .pn'); mates.forEach((p, i) => { if (pn[i]) pn[i].textContent = clean(p.presence.n, 18) || L('นักผจญภัย', 'Adventurer'); });
  const pp = pane.querySelectorAll('#soPeers .pn'); peers.forEach((p, i) => { if (pp[i]) pp[i].textContent = clean(p.presence && p.presence.n, 18) || L('นักผจญภัย', 'Adventurer'); });
  const pr = pane.querySelectorAll('#soRank .pn'); rankRows.forEach((r, i) => { if (pr[i]) pr[i].textContent = clean(r.name, 18) || L('นักผจญภัย', 'Adventurer'); });
}
function openSocial(){
  if (NET.db && !rankUnsub) rankUnsub = NET.db.collection('players').orderBy('lvl', 'desc').limit(30).onSnapshot(s => { rankRows = s.docs.map(d => d.data()); renderSocial(); }, () => {});
  renderSocial();
}
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const ds = b.dataset;
  if (ds.pinv){ partyInvite(ds.pinv); return; }
  if (ds.pleave){ partyLeave(); return; }
  if (ds.ivyes){ partyAccept(); return; }
  if (ds.ivno){ NET.invite = null; renderInvite(); return; }
  if (ds.ctab && b.closest('#chatBox')){ chatTab = ds.ctab; document.querySelectorAll('#chatBox [data-ctab]').forEach(x => x.classList.toggle('on', x === b)); renderChat(); return; }
  if (b.id === 'setExport'){ exportSave(); return; }
  if (b.id === 'setImport'){ el('importFile').click(); return; }
});
document.addEventListener('change', e => { if (e.target.id === 'importFile' && e.target.files[0]){ importSave(e.target.files[0]); e.target.value = ''; } });
document.addEventListener('keydown', e => {
  const inp = el('chatIn'); if (!inp) return;
  if (e.target === inp){ e.stopPropagation(); if (e.key === 'Enter' && !e.isComposing){ e.preventDefault(); chatSubmit(); } if (e.key === 'Escape') inp.blur(); return; }
}, true);
