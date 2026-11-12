/* VAYRATHEN — js/sys/guild.js
   Guilds (กิลด์), window G or Registrar Kaew in Aren.
   · Found one for 10,000 Bia (name 2–16 characters); invite online players; members get the guild name under
     their glowing name, a guild chat channel, and +3% EXP per guildmate hunting on the same map (up to +15%).
   · Online (claude.ai artifact): the guild lives in the shared database at guilds/<id> (name, founder, notice)
     and guilds/<id>/members/<user> (each member writes only their own line); invites are room events.
   · Offline: you can still found a guild; it simply has one member until you play online.
   Everything read from other players is untrusted: names are cleaned and drawn as text. */
'use strict';

const GUILD_COST = 10000;
const GUI = {roster:[], notice:'', leader:'', unsub:null, invite:null, nameIn:''};
const gName = () => (S.guild && S.guild.name) || '';
async function guildCreate(name){
  name = clean(name, 16).trim(); if (name.length < 2) return L('ชื่อกิลด์ต้องยาว 2–16 ตัว', 'Guild names need 2–16 characters');
  if (S.guild) return L('คุณอยู่ในกิลด์แล้ว', 'You are already in a guild'); if (S.bia < GUILD_COST) return L('เงินไม่พอ (10,000 เบี้ย)', 'Not enough Bia (10,000)');
  const id = 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  S.bia -= GUILD_COST; S.guild = {id, name, leader:true, at:Date.now()};
  if (NET.db && NET.uid){ try { await NET.db.doc(`guilds/${id}`).set({name, leader:NET.uid, leaderName:netName(), notice:'', at:Date.now()}); } catch (e) {} guildJoinDb(); }
  bump('guild'); EV.emit('guild', id); SFX.play('quest'); banner(L(`ก่อตั้งกิลด์ ${name} แล้ว!`, `Guild ${name} founded!`)); log(L(`ก่อตั้งกิลด์ ${name}`, `Founded the guild ${name}`), 'g');
  dirty = true; save(); guildWatch(); NET.presT = 0; return '';
}
function guildJoinDb(){ if (!NET.db || !NET.uid || !S.guild) return; NET.db.doc(`guilds/${S.guild.id}/members/${NET.uid}`).set({n:netName(), j:S.job, l:S.lvl, at:Date.now(), acc:accPublic()}).catch(() => {}); }
function guildLeave(){
  if (!S.guild) return; const g = S.guild;
  if (NET.db && NET.uid) NET.db.doc(`guilds/${g.id}/members/${NET.uid}`).delete().catch(() => {});
  log(L(`ออกจากกิลด์ ${g.name}`, `Left the guild ${g.name}`)); S.guild = null; GUI.roster = []; if (GUI.unsub){ try { GUI.unsub(); } catch (e) {} GUI.unsub = null; }
  dirty = true; save(); NET.presT = 0; reWin('guild');
}
/* live roster + notice from the database */
function guildWatch(){
  if (GUI.unsub){ try { GUI.unsub(); } catch (e) {} GUI.unsub = null; }
  if (!NET.db || !S.guild) return; const id = S.guild.id;
  const u1 = NET.db.collection(`guilds/${id}/members`).onSnapshot(s => { GUI.roster = s.docs.map(d => ({uid:d.id, ...d.data()})); reWin('guild'); }, () => {});
  const u2 = NET.db.doc(`guilds/${id}`).onSnapshot(d => { const v = d.exists ? d.data() : {}; GUI.notice = clean(v.notice, 140); GUI.leader = v.leader || ''; GUI.leaderName = clean(v.leaderName, 18); reWin('guild'); }, () => {});
  GUI.unsub = () => { u1(); u2(); };
}
async function guildNotice(text){ if (!S.guild || !NET.db) return; GUI.notice = clean(text, 140); try { await NET.db.doc(`guilds/${S.guild.id}`).update({notice:GUI.notice}); toast(L('บันทึกประกาศแล้ว', 'Notice saved')); } catch (e){ toast(L('บันทึกไม่สำเร็จ', 'Could not save')); } }
/* invites travel as room events in the lobby */
async function guildInvite(peer){ if (!S.guild || !NET.room) return; try { await NET.room.emit('guild', {k:'inv', to:peer, gid:S.guild.id, gn:S.guild.name, n:netName()}); toast(L('ส่งคำเชิญเข้ากิลด์แล้ว', 'Guild invite sent')); } catch (e){ toast(L('เชิญไม่สำเร็จ', 'Could not invite')); } }
function onGuild(msg){
  const d = msg.data || {}; if (msg.isMe) return;
  if (d.k === 'inv' && d.to === myPeer() && !S.guild){ GUI.invite = {gid:clean(d.gid, 40), gn:clean(d.gn, 16), from:clean(d.n, 18)}; sysPrompt(L(`${GUI.invite.from} ชวนคุณเข้ากิลด์ ⟨${GUI.invite.gn}⟩`, `${GUI.invite.from} invites you to the guild ⟨${GUI.invite.gn}⟩`), () => guildAccept(), () => { GUI.invite = null; }); SFX.play('chat'); }
}
function guildAccept(){ const iv = GUI.invite; if (!iv || S.guild || !/^g[a-z0-9]+$/.test(iv.gid)) return; S.guild = {id:iv.gid, name:iv.gn, leader:false, at:Date.now()}; GUI.invite = null; guildJoinDb(); guildWatch();
  bump('guild'); EV.emit('guild', iv.gid); log(L(`เข้าร่วมกิลด์ ${iv.gn}`, `Joined the guild ${iv.gn}`), 'g'); banner(L(`ยินดีต้อนรับสู่กิลด์ ⟨${iv.gn}⟩`, `Welcome to ⟨${iv.gn}⟩`)); dirty = true; save(); NET.presT = 0; reWin('guild'); }
/* guildmates on this map (presence carries the guild name) */
function guildMatesHere(){ if (!S.guild || !NET.mapRoom) return 0; return NET.mapRoom.peers().filter(p => !p.isMe && p.presence && clean(p.presence.gn, 16) === S.guild.name).length; }
EV.on('kill', m => { const n = Math.min(5, guildMatesHere()); if (n && !m.minion){ const e = Math.round(m.def.exp * RATE * .03 * n); if (e) gainExp(e, Math.round(m.def.jexp * JRATE * .03 * n)); } });
EV.on('netready', () => { if (NET.room) NET.room.on('guild', onGuild, () => {}); if (S.guild){ guildJoinDb(); guildWatch(); } });
EV.on('level', () => { if (S.guild && NET.db) guildJoinDb(); });

/* a small yes/no prompt (invites, trade requests) */
function sysPrompt(text, yes, no){
  let b = el('sysPrompt'); if (!b){ b = document.createElement('div'); b.id = 'sysPrompt'; b.className = 'invite sysp'; el('ui').appendChild(b); }
  b.innerHTML = `<span class="iv-t"></span><button class="btn gold sm" data-spy="1">${L('ตกลง', 'Accept')}</button><button class="btn sm" data-spn="1">${L('ปฏิเสธ', 'Decline')}</button>`;
  b.querySelector('.iv-t').textContent = text; b.hidden = false; b._yes = yes; b._no = no; clearTimeout(b._t); b._t = setTimeout(() => { b.hidden = true; no && no(); }, 30000);
}
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-spy],[data-spn]'); if (!t) return; const b = el('sysPrompt'); b.hidden = true; clearTimeout(b._t); (t.dataset.spy ? b._yes : b._no) && (t.dataset.spy ? b._yes : b._no)(); });

/* ---------- window (G) ---------- */
mkWin('guild', 'กิลด์', 'Guild', 'G', '<path d="M5 3h10v8l-5 6-5-6z"/><path d="M10 6v5M7.5 8.5h5"/>');
WIN_RENDER.guild = function(){
  const pane = el('pane-guild'); if (!pane) return;
  if (!S.guild){
    pane.innerHTML = `<div class="gnew"><div class="gcrest">⚜</div><b>${L('ยังไม่มีกิลด์', 'No guild yet')}</b><p class="hint">${L('ก่อตั้งกิลด์ของคุณเอง หรือรอเพื่อนส่งคำเชิญ · สมาชิกกิลด์ที่ล่าในแผนที่เดียวกันได้ EXP เพิ่ม 3% ต่อคน (สูงสุด 15%) และมีช่องแชทกิลด์', 'Found your own guild or wait for an invite · guildmates hunting on the same map give +3% EXP each (up to 15%) and share a guild chat')}</p>
      <label class="mk-row"><span>${L('ชื่อกิลด์', 'Name')}</span><input class="nmin" id="gName" maxlength="16" autocomplete="off" value="${escH(GUI.nameIn)}" placeholder="${L('เช่น ทหารเสือวายรา', 'e.g. Tigers of Vayra')}"></label>
      <p class="accerr" id="gErr"></p><button class="btn gold wide" data-gmake="1" ${S.bia >= GUILD_COST ? '' : 'disabled'}>${L('ก่อตั้งกิลด์', 'Found guild')} · ${fmtN(GUILD_COST)} ${CUR()}</button>
      ${NET.room ? '' : `<p class="hint">${L('ตอนนี้ออฟไลน์: ก่อตั้งได้ แต่ชวนเพื่อนได้เมื่อเล่นผ่านลิงก์ claude.ai', 'Offline: you can found a guild, invites work when playing from the claude.ai link')}</p>`}</div>`;
    const i = el('gName'); if (i){ i.addEventListener('input', () => { GUI.nameIn = i.value; }); i.addEventListener('keydown', e => e.stopPropagation()); }
    return;
  }
  const g = S.guild, isLead = g.leader || (NET.uid && GUI.leader === NET.uid), online = NET.room ? NET.room.peers().filter(p => p.kind === 'viewer' && p.presence) : [];
  const onIds = new Set(online.map(p => p.by).filter(Boolean)), mates = GUI.roster.length ? GUI.roster : [{uid:NET.uid || 'me', n:netName(), j:S.job, l:S.lvl}];
  const invitable = online.filter(p => !p.isMe && clean(p.presence.gn, 16) !== g.name);
  pane.innerHTML = `<div class="ghead"><div class="gcrest">⚜</div><div><b>⟨${escH(g.name)}⟩</b><small>${L('สมาชิก', 'Members')} ${mates.length} · ${isLead ? L('คุณคือหัวหน้ากิลด์', 'You lead this guild') : L('สมาชิก', 'Member')} · ${L('โบนัส EXP ตอนนี้', 'EXP bonus now')} +${Math.min(5, guildMatesHere()) * 3}%</small></div></div>
    <div class="sec">${L('ประกาศกิลด์', 'Guild notice')}</div>
    ${isLead && NET.db ? `<div class="gnote"><input id="gNote" maxlength="140" value="${escH(GUI.notice)}" placeholder="${L('เขียนประกาศถึงสมาชิก…', 'Write a notice to members…')}"><button class="btn sm" data-gnote="1">${L('บันทึก', 'Save')}</button></div>` : `<p class="gnotice">${escH(GUI.notice) || L('— ยังไม่มีประกาศ —', '— no notice —')}</p>`}
    <div class="sec">${L('รายชื่อสมาชิก', 'Roster')}</div>
    <div class="list">${mates.map((m, i) => `<div class="item"><span class="gdot${onIds.has(m.uid) || m.uid === NET.uid || m.uid === 'me' ? ' on' : ''}"></span><div class="nm"><b class="pn" data-gi="${i}"></b><small>${JOBS[m.j] ? nm(JOBS[m.j]) : '—'} · Lv ${clamp(m.l | 0, 1, 999)}${m.uid === GUI.leader ? ' · ' + L('หัวหน้า', 'leader') : ''}</small></div></div>`).join('')}</div>
    ${NET.room ? `<div class="sec">${L('ชวนผู้เล่นออนไลน์', 'Invite players online')}</div><div class="list">${invitable.map(p => `<div class="item"><div class="nm"><b class="pn2" data-pp="${p.peer}"></b><small>${JOBS[p.presence.j] ? nm(JOBS[p.presence.j]) : ''} · Lv ${clamp(p.presence.l | 0, 1, 999)}</small></div><button class="btn sm" data-ginv="${p.peer}">${L('ชวน', 'Invite')}</button></div>`).join('') || `<p class="hint">${L('ไม่มีผู้เล่นที่ชวนได้ตอนนี้', 'Nobody to invite right now')}</p>`}</div>` : ''}
    <button class="btn wide" data-gleave="1">${L('ออกจากกิลด์', 'Leave guild')}</button>
    <p class="hint">${L('แชทกิลด์: เลือกช่อง "กิลด์" ในกล่องแชท', 'Guild chat: pick the "Guild" channel in the chat box')}</p>`;
  pane.querySelectorAll('.pn[data-gi]').forEach(b => { b.textContent = clean(mates[+b.dataset.gi].n, 18) || L('นักผจญภัย', 'Adventurer'); });
  pane.querySelectorAll('.pn2[data-pp]').forEach(b => { const p = online.find(x => x.peer === b.dataset.pp); b.textContent = clean(p && p.presence.n, 18) || L('นักผจญภัย', 'Adventurer'); });
  const ni = el('gNote'); if (ni) ni.addEventListener('keydown', e => e.stopPropagation());
};
document.addEventListener('click', async e => {
  const b = e.target.closest && e.target.closest('[data-gmake],[data-gleave],[data-ginv],[data-gnote]'); if (!b || b.disabled) return; const d = b.dataset;
  if (d.gmake){ const err = await guildCreate(el('gName') && el('gName').value); if (err){ const p = el('gErr'); if (p) p.textContent = err; } WIN_RENDER.guild(); }
  else if (d.gleave) askConfirm(L('ออกจากกิลด์', 'Leave guild'), L(`ออกจาก ⟨${gName()}⟩ ใช่ไหม?`, `Leave ⟨${gName()}⟩?`), L('ออก', 'Leave'), guildLeave);
  else if (d.ginv) guildInvite(d.ginv);
  else if (d.gnote) guildNotice(el('gNote').value);
});
addTownNpc({id:'registrar', name:'นายทะเบียนแก้ว', en:'Registrar Kaew', role:'ทะเบียนกิลด์', roleEn:'Guild Registry', x:450, y:1105},
  {job:'physician', look:{sex:'f', hair:2, color:'hairNavy'}, gear:{armor:'c_school', head:'hc_ribbon'}});
NPC_OPEN.registrar = n => npcFrame(n, S.guild ? L(`กิลด์ ⟨${S.guild.name}⟩ ขึ้นทะเบียนเรียบร้อยแล้วค่ะ`, `The guild ⟨${S.guild.name}⟩ is on the register.`) : L('อยากตั้งกิลด์ใช่ไหมคะ ค่าธรรมเนียม 10,000 เบี้ย ตั้งชื่อให้เท่ ๆ นะคะ', 'Founding a guild? The fee is 10,000 Bia. Pick a name to be proud of.'),
  `<button class="btn gold wide" data-win-open="guild">${L('เปิดหน้าต่างกิลด์', 'Open guild window')} <kbd>G</kbd></button>`);
