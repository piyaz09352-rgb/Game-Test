/* VAYRATHEN — js/sys/towerparty.js — (v103) climb the Vayra Tower with your party
   · In a party of 2–5 the Tower window offers "ปีนกับปาร์ตี้": every mate online gets an invite and joins the same
     private room (the same DG code). Monsters grow with the party like a dungeon (dgDef, party count in the code).
   · One game runs the floors: the room host (netmob.js, lowest peer id). It spawns, decides when a floor is cleared
     and publishes its floor, phase, time left and land in its presence (twf, twp, twt, twth). The mates mirror the
     monsters as in any dungeon and follow those fields: a new land loads for everyone, a cleared floor pays everyone
     (Bia, their own first-time-best rewards, blessings), the clock is the host's. If the host leaves, the next
     game becomes host and carries on from the same floor.
   · Falling or leaving ends the climb for you only; the others keep going. Time running out ends it for everyone.
   · Party climbs count for your best floor, the all-time ranking and the weekly board like solo climbs. */
'use strict';

const TWP = {inv:null};
const twpMates = () => (typeof partyMembers === 'function' ? partyMembers() : []);
const twpHostPres = () => { if (!TW.party || typeof NM === 'undefined' || !NM.slave || !NET.mapRoom) return null; const h = NET.mapRoom.peers().find(p => p.peer === NM.hostPeer); return h && h.presence && h.presence.twf ? h.presence : null; };

/* the leader opens it for the party */
function twpStart(f0){
  const why = twCan(); if (why) return toast(why);
  const mates = twpMates(); if (!NET.room || !NET.party || mates.length < 2) return toast(L('ต้องอยู่ในปาร์ตี้ 2 คนขึ้นไป', 'You need a party of 2 or more'));
  if (!twCks().includes(f0)) f0 = 1;
  const pc = clamp(mates.length, 2, 5), code = 'tp' + NET.party.replace(/\W/g, '').slice(-6) + Date.now().toString(36).slice(-5);
  NET.room.emit('tw', {k:'open', pt:NET.party, code, f0, pc, n:netName()}).catch(() => {});
  twStart(f0, {code, pc});
}
function onTwp(msg){
  const d = msg.data || {}; if (msg.isMe || d.k !== 'open' || !NET.party || d.pt !== NET.party) return;
  if (typeof d.code !== 'string' || !/^\w{2,24}$/.test(d.code)) return; const f0 = clamp(d.f0 | 0, 1, TW_MAX), pc = clamp(d.pc | 0, 2, 5);
  sysPrompt(L(`${clean(d.n, 18)} ชวนปีนหอคอยวายราชั้น ${f0} (ปาร์ตี้ ${pc} คน) · เข้าร่วมไหม?`, `${clean(d.n, 18)} is climbing the Vayra Tower from floor ${f0} (party of ${pc}) · join?`),
    () => { if (twStart(f0, {code:d.code, pc, join:true})) TW.restT = 6; }, () => {});   // a moment for the room to pick its host before anyone spawns
  SFX.play('chat');
}
EV.on('netready', () => { if (NET.room) NET.room.on('tw', onTwp, () => {}); });

/* the host tells the mates where the climb is (presence fields; gfxPres is a plain function, so it can be wrapped) */
if (typeof gfxPres === 'function'){ const _g = gfxPres;
  gfxPres = function(){ const r = _g.apply(this, arguments);
    return Object.assign(r, TW.active && TW.party && twHost() ? {twf:TW.f, twp:TW.phase, twt:Math.max(0, Math.round(TW.t)), twth:TW.theme} : {twf:null}); }; }

/* the host's land (twTheme picks it from the floor; a mate takes the host's own pick) */
function twpLand(id){ TW.theme = id; twInfo().base = id; TW.entering = DG.entering = true;
  try { loadMap(id); } finally { TW.entering = DG.entering = false; }
  spawnSlots = []; mobs = []; boss = null; bossTimer = 1e9; P.x = W / 2; P.y = H / 2; pushOut(P, 12); }
/* a mate follows */
EV.on('tick', () => {
  if (!TW.active || !TW.party || PAUSED || P.dead) return;
  // mirrored foes past Lv 300 get the tower's own extra toughness (the host applied it to its own copies)
  for (const m of mobs) if (m.dg && !m.dead && !m.tw){ const k = m.hp / Math.max(1, m.maxhp); m.tw = TW.f; twScale(m, TW.f); m.hp = m.maxhp * k; }
  if (!twHost()) TW.mine = false;   // the host's foes, not mine (tower.js takes them over if I become host)
  const h = twpHostPres(); if (!h) return;
  const hf = clamp(h.twf | 0, 1, TW_MAX + 1), th = h.twth | 0;
  if (MAPS[th] && th !== TW.theme) twpLand(th);
  while (TW.f < hf && TW.active) twClear();   // each floor the party cleared pays me too
  if (h.twp === 'fight' && TW.f === hf){ if (TW.phase !== 'fight'){ TW.phase = 'fight'; TW.spawned = true; DG.lv = twLvC(hf); dgLabel(); banner(L(`ชั้น ${hf}`, `Floor ${hf}`)); }
    TW.t = (+h.twt || 0) + .9; }
  else if (h.twp === 'fight') TW.t = Math.min(TW.t, (+h.twt || 0) + .9);
});

/* the window: a party button beside the solo one */
{ const _r = WIN_RENDER.tower; WIN_RENDER.tower = function(){
    _r.apply(this, arguments); const pane = el('pane-tower'), go = pane && pane.querySelector('.twgo'); if (!go || TW.active) return;
    const n = twpMates().length; if (n < 2) return;
    go.insertAdjacentHTML('afterend', `<button class="btn twgo twpgo" data-twpgo="1" ${twCan() ? 'disabled' : ''}>👥 ${L(`ปีนกับปาร์ตี้ (${n} คน) ชั้น ${TW.startF}`, `Climb with the party (${n}) from ${TW.startF}`)}</button><small class="twwhy twpnote">${L('ทุกคนในปาร์ตี้ได้คำเชิญ · มอนแข็งขึ้นตามจำนวนคน · ทุกคนได้รางวัลของตัวเองทุกชั้น', 'Everyone in the party is invited · monsters scale with your numbers · everyone earns their own rewards each floor')}</small>`);
  }; }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-twpgo]'); if (!t || t.disabled) return; twpStart(TW.startF); });

/* the tracker line says it is a party climb */
{ const _qt = questTracker; questTracker = function(){ const h = _qt.apply(this, arguments); return TW.active && TW.party ? h.replace('🗼', `🗼👥${clamp(DG.pc | 0, 2, 5)}`) : h; }; }

if (typeof WIKI_SYS !== 'undefined'){ const w = WIKI_SYS.find(a => a.id === 'tower'); if (w){ const _b = w.b;
  w.b = () => `${_b()}<p><b>${L('ปีนกับปาร์ตี้', 'Party climbs')}</b> · ${L('อยู่ในปาร์ตี้ 2–5 คน กด "ปีนกับปาร์ตี้" ทุกคนได้คำเชิญเข้าห้องเดียวกัน · มอนแข็งขึ้นตามจำนวนคน · ทุกคนได้รางวัลของตัวเองทุกชั้น (รวมสถิติ อันดับ และอันดับรายสัปดาห์) · ล้มหรือออก = จบเฉพาะตัวเอง หมดเวลา = จบทั้งทีม', 'In a party of 2–5 press "Climb with the party": everyone is invited into one room · monsters scale with your numbers · everyone earns their own rewards each floor (best, ranking and weekly board) · falling or leaving ends it for you only, time running out for everyone')}</p>`; } }

{ const st = document.createElement('style'); st.textContent = `.twpgo{background:linear-gradient(#e8f4ff,#cfe4ff);border-color:#6a9ad8}.twpnote{color:#3a5a8a}`; document.head.appendChild(st); }
