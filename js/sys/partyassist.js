/* VAYRATHEN — js/sys/partyassist.js — follow a party member, and an Auto that plays for the team
   · "ติดตาม" (Follow) on any party member (party bar or Party window): you walk behind them, ride when they are far,
     and stop when you tap "เลิกติดตาม". Moving yourself (tap / joystick / keys) pauses the follow for 3 s.
     With Auto on you follow too: Auto hunts only around the one you follow and catches up when they move on.
   · Auto in a party (Auto settings → "ช่วยเพื่อนในปาร์ตี้", on by default):
       – heals: a ticked heal skill goes off when a party member near you is under your heal line (heals reach
         nearby friends through allybuff.js), even if your own HP is full
       – buffs: ticked buffs that also land on friends are recast for the team once they have run most of their time
       – assist: attacks what the party member you follow (or the leader) is attacking
       – guard: monsters chasing a party member near you are attacked first
   Positions, HP and targets come from the members' map presence (untrusted, only read). */
'use strict';

const PFW = {peer:null, any:null, pause:0, lastT:0, cast:{}, awayAt:0};   // any: following a player outside the party (by name)
/* my current target travels in my map presence so friends can assist */
if (typeof nmPres === 'function'){ const _np = nmPres; nmPres = function(){ const o = _np.apply(this, arguments) || {}; const t = P.target; if (t && !t.dead && t.nid) o.tg = t.nid; return o; }; }
const paMembers = () => (NET.party && typeof ptyList === 'function' ? ptyList().filter(p => !p.isMe) : []);
/* a party member's hero on this map. The party list comes from the lobby room and the heroes on the map from the map
   room, which give the same player different ids, so when the id does not match the hero is found by name (and party). */
function paGhost(peer){
  if (typeof NET === 'undefined' || !NET.ghosts || !peer) return null; const g = NET.ghosts.get(peer); if (g) return g;
  const all = typeof ptyList === 'function' ? ptyList() : [], m = all.find(p => p.peer === peer), n = m && m.presence && m.presence.n; if (!n) return null;
  for (const gg of NET.ghosts.values()) if (gg.q && gg.q.n === n && (!gg.q.pt || gg.q.pt === NET.party)) return gg;
  return null;
}
const paOn = () => { const b = S && S.bot; return !b || b.pAssist !== false; };
function paFollowing(){
  if (!PFW.peer) return null;
  if (PFW.any){ for (const gg of NET.ghosts.values()) if (gg.q && !gg.q.dead && gg.q.n === PFW.any) return gg; return null; }   // a player outside the party: found by name
  const m = paMembers().find(p => p.peer === PFW.peer);
  if (!m){ pfStop(L('เลิกติดตาม: ไม่ได้อยู่ปาร์ตี้เดียวกันแล้ว', 'Stopped following: no longer in your party')); return null; }
  const g = paGhost(PFW.peer); if (!g || !g.q || g.q.dead) return null; return g;
}
function pfStart(peer, anyName){ PFW.peer = peer; PFW.any = anyName || null; PFW.pause = 0; PFW.awayAt = 0; const m = paMembers().find(p => p.peer === peer), n = anyName ? clean(anyName, 18) : m && m.presence ? clean(m.presence.n, 18) : ''; PFW.who = n;
  toast(L(`ติดตาม ${n || 'เพื่อน'}`, `Following ${n || 'your friend'}`)); if (typeof ptyHud === 'function') ptyHud(); if (typeof renderParty === 'function') renderParty(); }
function pfStop(msg){ if (!PFW.peer) return; PFW.peer = null; PFW.any = null; P.tx = null; toast(msg || L('เลิกติดตาม', 'Stopped following')); if (typeof ptyHud === 'function') ptyHud(); if (typeof renderParty === 'function') renderParty(); }
/* manual movement pauses the follow */
{ const _bp = botPauseFromManual; botPauseFromManual = function(){ PFW.pause = 3; return _bp.apply(this, arguments); }; }

/* ---------- walking behind ---------- */
EV.on('tick', dt => {
  PFW.pause = Math.max(0, PFW.pause - dt);
  if (!PFW.peer || PAUSED || P.dead) return;
  // the standard: walking yourself (joystick / keys) ends the follow; with Auto on it only pauses (Auto picks it up again)
  if (typeof JOY !== 'undefined' && (JOY.active || (JOY.keys && JOY.keys.size))){ if (typeof BOT !== 'undefined' && BOT.on) PFW.pause = 3; else { pfStop(L('เลิกติดตาม (คุณเดินเอง)', 'Stopped following (you moved)')); return; } }
  const g = paFollowing(); if (!g){ PFW.awayT = (PFW.awayT || 0) + dt; if (PFW.awayT > 90) pfStop(L('เลิกติดตาม: ไม่พบผู้เล่นนานเกินไป', 'Stopped following: they have been gone too long')); return; }
  PFW.awayT = 0;
  if (PFW.pause > 0 || (typeof BOT !== 'undefined' && BOT.on)) return;   // Auto handles following itself (below)
  const d = Math.hypot(g.x - P.x, g.y - P.y);
  if (P.target && !P.target.dead && d < 320) return;                    // fighting near them: carry on
  if (d > 70){ const k = Math.max(0, d - 46) / d; P.target = null; P.pending = null; P.tx = P.x + (g.x - P.x) * k; P.ty = P.y + (g.y - P.y) * k;
    if (d > 380 && !P.ride && canRideNow() && typeof toggleRide === 'function' && !inVillage(P)){ P.ride = true; renderHotbar(); } }
  else if (P.tx != null && Math.hypot(P.tx - P.x, P.ty - P.y) < 30) P.tx = null;
});

/* ---------- Auto: follow, guard, assist, heal and buff the team ---------- */
{ const _ub = updBot;
  updBot = function(dt){
    if (!BOT.on || BOT.pause > 0 || P.dead || PFW.pause > 0) return _ub.apply(this, arguments);
    const g = paFollowing();
    if (g){ const d = Math.hypot(g.x - P.x, g.y - P.y), th = threats();
      const busy = P.target && !P.target.dead && dist(P.target, P) < 260;
      if (d > 300 && !th.length || d > 170 && !busy && !th.length){ if (P.sit){ P.sit = false; renderHotbar(); } BOT.resting = false; P.target = null; P.pending = null; BOT.roam = null;
        const k = Math.max(0, d - 50) / d; P.tx = P.x + (g.x - P.x) * k; P.ty = P.y + (g.y - P.y) * k;
        if (d > 420 && !P.ride && canRideNow() && !inVillage(P)){ P.ride = true; renderHotbar(); }
        BOT.state = 'roam'; renderBotChip(); return; } }
    return _ub.apply(this, arguments);
  };
}
/* who to hit: a monster chasing a friend near me first, then what the one I follow (or the leader) is hitting */
{ const _pt = pickTarget;
  pickTarget = function(){
    const base = _pt.apply(this, arguments);
    if (paOn() && !NET.party && PFW.peer){ const g1 = paFollowing(), tg1 = g1 && g1.q && g1.q.tg;   // (v58) following someone outside a party: hit what they hit, stay near them
      if (tg1 && typeof NM !== 'undefined'){ const m = NM.byId.get(tg1); if (m && !m.dead && botOk(m) && Math.hypot(m.x - P.x, m.y - P.y) < 560) return m; }
      if (g1 && base && Math.hypot(base.x - g1.x, base.y - g1.y) > 300) return null; return base; }
    if (!paOn() || !NET.party) return base; const ms = paMembers(); if (!ms.length) return base;
    const peers = new Set(), g0 = paFollowing(); for (const p of ms){ peers.add(p.peer); const gg = paGhost(p.peer); if (gg && gg.peer) peers.add(gg.peer); }
    // monsters a nearby friend is holding (they are fighting it) and that are close to that friend
    let best = null, bd = 1e9;
    for (const m of mobs){ if (m.dead || !m.aggro || !peers.has(m.netOwner) || !botOk(m)) continue; const gg = (NET.ghosts && NET.ghosts.get(m.netOwner)) || paGhost(m.netOwner); if (!gg) continue;
      const dF = Math.hypot(m.x - gg.x, m.y - gg.y), dMe = Math.hypot(m.x - P.x, m.y - P.y); if (dF > 200 || dMe > 520) continue; if (dMe < bd){ bd = dMe; best = m; } }
    if (best && !(base && base.aggro && dist(base, P) < 140)) return best;
    // assist: the followed member's target, else the leader's
    const src = g0 || (PTY.lead && paGhost(PTY.lead)); const tg = src && src.q && src.q.tg;
    if (tg && typeof NM !== 'undefined'){ const m = NM.byId.get(tg); if (m && !m.dead && botOk(m) && Math.hypot(m.x - P.x, m.y - P.y) < 560) return m; }
    // following: stay near them
    if (g0 && base && Math.hypot(base.x - g0.x, base.y - g0.y) > 360) return null;
    return base;
  };
}
/* the lowest friend near me, as a fraction of HP (1 when nobody) */
/* (v58) the friends Auto looks after: the party, plus the one I follow (party or not) */
function paCare(){ const out = new Set(); for (const p of paMembers()){ const g = paGhost(p.peer); if (g) out.add(g); } const f = PFW.peer ? paFollowing() : null; if (f) out.add(f); return [...out]; }
function paLowAlly(R = 380){ let lo = 1; for (const g of paCare()){ if (!g.q || g.q.dead) continue; if (Math.hypot(g.x - P.x, g.y - P.y) > R) continue; lo = Math.min(lo, clamp((g.q.h | 0) / 100, 0, 1)); } return lo; }
const paNearCount = (R = 380) => paCare().filter(g => g.q && !g.q.dead && Math.hypot(g.x - P.x, g.y - P.y) <= R).length;
{ const _bp = botPick;
  botPick = function(t){
    if (paOn() && (NET.party || PFW.peer) && typeof AB !== 'undefined'){
      const b = botSet(), keep = Math.round(DER.maxsp * b.spKeep / 100);
      // heal a friend under my heal line
      if (paLowAlly() * 100 < b.heal) for (const e of b.list){ if (e.on && AB.heal.includes(e.id) && botReady(e.id, 0)) return e.id; }
      // keep team buffs up for friends standing with me
      if (b.buff && paNearCount()) for (const e of b.list){ if (!e.on || !AB.buff.includes(e.id) || !botReady(e.id, keep)) continue;
        const sk = SKILLS[e.id], dur = (sk.buff && sk.buff(skl(e.id)) || {}).t || 30; if (T - (PFW.cast[e.id] || -1e9) > dur * .8) return e.id; }
    }
    return _bp.apply(this, arguments);
  };
}
/* a heal for a friend goes off even when my own HP is full */
{ const _ts = trySkill;
  trySkill = function(id){ const sk = SKILLS[id];
    if (sk && sk.type === 'heal' && S.hp >= DER.maxhp && (NET.party || PFW.peer) && paLowAlly() < .95){ S.hp = DER.maxhp - 1; }
    return _ts.apply(this, arguments); }; }
{ const _ex = execSkill; execSkill = function(id){ PFW.cast[id] = T; return _ex.apply(this, arguments); }; }

/* ---------- buttons: party bar and Party window ---------- */
/* (v58) no "ตาม" button on the party bar any more: tap a member's name (or row) for a small menu with ติดตาม / เลิกติดตาม
   and ช่วยตี (target the monster nearest to them, what a tap used to do) */
function pfMenu(row){
  const peer = row.dataset.ptyfocus, ui = el('ui'); if (!peer || !ui) return; let mnu = el('pfMenu');
  if (!mnu){ mnu = document.createElement('div'); mnu.id = 'pfMenu'; mnu.className = 'pfmenu'; ui.appendChild(mnu); }
  const on = PFW.peer === peer, name = (row.querySelector('.pn') || {}).textContent || '';
  mnu.innerHTML = `<b class="pfmn"></b><button class="btn sm${on ? '' : ' gold'}" data-pfmenu="follow">👣 ${on ? L('เลิกติดตาม', 'Unfollow') : L('ติดตาม', 'Follow')}</button><button class="btn sm" data-pfmenu="assist">⚔️ ${L('ช่วยตี', 'Assist')}</button>`;
  mnu.querySelector('.pfmn').textContent = name; mnu.dataset.peer = peer;
  const r = brect(row), u = brect(ui), k = (ui.offsetWidth ? u.width / ui.offsetWidth : 1) || 1; mnu.hidden = false;
  mnu.style.left = Math.round(Math.min((r.left - u.left) / k + 12, ui.offsetWidth - mnu.offsetWidth - 6)) + 'px'; mnu.style.top = Math.round((r.bottom - u.top) / k + 2) + 'px';
}
const pfMenuClose = () => { const m = el('pfMenu'); if (m) m.hidden = true; };
document.addEventListener('click', e => {
  const t = e.target.closest && e.target;
  const act = t && t.closest('#pfMenu [data-pfmenu]');
  if (act){ e.stopPropagation(); e.preventDefault(); const peer = el('pfMenu').dataset.peer; pfMenuClose();
    if (act.dataset.pfmenu === 'follow'){ if (PFW.peer === peer) pfStop(); else pfStart(peer); }
    else { const gh = paGhost(peer); if (!gh){ toast(L('สมาชิกไม่ได้อยู่แผนที่นี้', 'They are not on this map')); return; }
      let best = null, bd = 260; for (const m of mobs){ if (m.dead || !m.aggro) continue; const dd = Math.hypot(m.x - gh.x, m.y - gh.y); if (dd < bd){ bd = dd; best = m; } }
      if (best){ P.target = best; toast(L('ช่วยสมาชิก: เลือกมอนที่อยู่ใกล้เขา', 'Assisting: targeting the monster near them')); } else toast(L('สมาชิกไม่ได้สู้อยู่', 'They are not fighting')); }
    return; }
  const row = t && t.closest('#ptyHud .phm[data-ptyfocus]');
  if (row && !row.classList.contains('me')){ e.stopPropagation(); e.preventDefault(); const m = el('pfMenu'); if (m && !m.hidden && m.dataset.peer === row.dataset.ptyfocus) pfMenuClose(); else pfMenu(row); return; }
  if (t && !t.closest('#pfMenu')) pfMenuClose();
}, true);
{ const _wr = WIN_RENDER.party;
  WIN_RENDER.party = function(){ const r = _wr.apply(this, arguments); if (!NET.party || PTY.tab !== 'members') return r;
    const pane = el('pane-party'), rows = pane ? pane.querySelectorAll('.ptylist .ptyrow') : [], ms = ptyList().slice().sort((a, b) => (b.peer === PTY.lead) - (a.peer === PTY.lead));
    rows.forEach((row, i) => { const p = ms[i]; if (!p || p.isMe) return; row.insertAdjacentHTML('beforeend', `<button class="btn sm${PFW.peer === p.peer ? '' : ' gold'}" data-pfollow="${p.peer}">${PFW.peer === p.peer ? L('เลิกติดตาม', 'Unfollow') : L('ติดตาม', 'Follow')}</button>`); });
    return r; }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-pfollow]'); if (!b) return; e.stopPropagation(); e.preventDefault();
  const peer = b.dataset.pfollow; if (PFW.peer === peer) pfStop(); else pfStart(peer); }, true);
EV.on('tick', () => { if (PFW.peer && !PFW.any && !NET.party) pfStop(); });

/* ---------- Auto settings: the party section ---------- */
{ const _ra = renderAuto;
  renderAuto = function(){ const r = _ra.apply(this, arguments); const pane = el('pane-auto'); if (!pane || !S.bot) return r; const b = S.bot; if (b.pAssist == null) b.pAssist = true;
    const hint = pane.querySelector('p.hint:last-of-type');
    const html = `<div class="sec">${L('ปาร์ตี้', 'Party')}</div>
      <label class="set"><span><b>${L('ช่วยเพื่อนในปาร์ตี้', 'Help the party')}</b><small>${L('ฮีลเพื่อนที่เลือดต่ำกว่าเส้นฮีล · บัฟที่ติ๊กไว้ให้ทั้งทีม · ตีเป้าเดียวกับคนที่ติดตาม/หัวหน้า · ช่วยตีมอนที่ไล่เพื่อน', 'Heals friends under your heal line · keeps ticked buffs on the team · hits what the one you follow (or the leader) hits · hits monsters chasing friends')}</small></span><input type="checkbox" data-aset="pAssist" ${b.pAssist ? 'checked' : ''}><i class="sw"></i></label>
      <p class="hint">${L('แตะชื่อเพื่อนที่แถบปาร์ตี้ → ติดตาม: เดินตามเขา และ Auto จะตีเป้าเดียวกัน ฮีล และบัฟให้เขา', 'Tap a friend\'s name on the party bar → Follow: you walk behind them, and Auto hits their target, heals and buffs them')}${PFW.peer ? ` · <b>${L('กำลังติดตามอยู่', 'following now')}</b>` : ''}</p>`;
    if (hint) hint.insertAdjacentHTML('beforebegin', html); else pane.insertAdjacentHTML('beforeend', html);
    return r; }; }
{ const st = document.createElement('style');
  st.textContent = `.ptyhud .phm{cursor:pointer}.ptyhud .phm:not(.me) .pn{text-decoration:underline dotted rgba(0,0,0,.35);text-underline-offset:3px}
  #pfMenu{position:absolute;z-index:70;display:flex;flex-direction:column;gap:5px;min-width:130px;padding:8px;border-radius:12px;background:#fffdf6;border:2px solid #e0a020;box-shadow:0 6px 16px rgba(0,0,0,.22);pointer-events:auto}
  #pfMenu[hidden]{display:none}#pfMenu .pfmn{font:800 12.5px Sarabun,sans-serif;color:#141414;padding:0 2px 2px}#pfMenu .btn{justify-content:flex-start;text-align:left}`;
  document.head.appendChild(st); }

/* ---------- (v27) follow, the standard way ----------
   · Tap any hero → "ติดตาม" (party or not), or the button on a party member.
   · A chip under the top bar always shows who you follow (or that you are waiting for them on another map) with ✕.
   · Walking yourself ends the follow (Auto only pauses it); 90 s without finding them ends it too. */
{ const _pm = playerMenu;
  playerMenu = function(gh){ _pm(gh); const b = el('pcard'), q = (gh && gh.q) || {}; if (!b || b.hidden || b.querySelector('[data-pcact="follow"]')) return;
    const on = PFW.peer && (PFW.any ? PFW.any === q.n : (paGhost(PFW.peer) === gh));
    const at = b.querySelector('[data-pcact="trade"]') || b.querySelector('[data-pcact]'); const btn = `<button class="btn sm${on ? '' : ' gold'}" data-pcact="follow">${on ? L('เลิกติดตาม', 'Unfollow') : L('ติดตาม', 'Follow')}</button>`;
    if (at) at.insertAdjacentHTML('beforebegin', btn); else b.insertAdjacentHTML('beforeend', btn); }; }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-pcact="follow"]'); if (!t) return;
  const b = el('pcard'), gh = b && b._gh, q = (gh && gh.q) || {}; if (!gh || !q.n) return;
  if (PFW.peer && (PFW.any === q.n || paGhost(PFW.peer) === gh)){ pfStop(); return; }
  const mate = paMembers().find(p => p.presence && p.presence.n === q.n); if (mate) pfStart(mate.peer); else pfStart('n:' + q.n, q.n); }, true);
EV.on('tick', () => {
  let c = el('followChip'); const on = !!PFW.peer;
  if (!on){ if (c) c.hidden = true; return; }
  if (!c){ c = document.createElement('div'); c.id = 'followChip'; el('ui').appendChild(c);
    c.addEventListener('click', e => { if (e.target.closest('[data-fstop]')) pfStop(); }); }
  const g = paFollowing(), who = PFW.who || L('เพื่อน', 'your friend'), txt = g ? L(`👣 กำลังติดตาม ${who}`, `👣 Following ${who}`) : L(`⏳ รอ ${who} (ไม่อยู่ในแผนที่นี้)`, `⏳ Waiting for ${who} (not on this map)`);
  if (c.dataset.t !== txt){ c.dataset.t = txt; c.innerHTML = `<span></span><button data-fstop="1" aria-label="${L('เลิกติดตาม', 'Stop following')}">✕</button>`; c.querySelector('span').textContent = txt; }
  c.hidden = false; c.classList.toggle('wait', !g);
});
{ const st = document.createElement('style');
  st.textContent = `#followChip{position:absolute;left:50%;top:44px;transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:8px;padding:4px 6px 4px 12px;border-radius:999px;background:rgba(20,40,80,.82);border:2px solid #8fd0ff;color:#eaf6ff;font:700 12.5px/1.2 var(--display,sans-serif);pointer-events:auto;box-shadow:0 3px 10px rgba(0,0,0,.25)}
  #followChip.wait{border-color:#ffcf6a;background:rgba(70,50,10,.82)}#followChip[hidden]{display:none}#followChip button{border:0;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.18);color:#fff;cursor:pointer;font-size:12px}`;
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'follow', t:['การติดตามผู้เล่น', 'Following a player'], b:() => `<ul>
  <li>${L('แตะผู้เล่นคนไหนก็ได้ → ติดตาม · หรือแตะชื่อเพื่อนที่แถบปาร์ตี้ → ติดตาม', 'Tap any player → Follow · or tap a friend\'s name on the party bar → Follow')}</li>
  <li>${L('ป้ายใต้แถบบนบอกว่ากำลังติดตามใคร · แตะ ✕ เพื่อเลิก · ถ้าเขาอยู่แผนที่อื่น ป้ายจะบอกว่ารอ', 'A chip under the top bar shows who you follow · ✕ stops · if they are on another map it says you are waiting')}</li>
  <li>${L('เดินเอง (จอย/ปุ่มทิศ) = เลิกติดตาม · เปิด Auto อยู่จะแค่พักแล้วตามต่อ · หาไม่เจอ 90 วินาทีเลิกเอง', 'Walking yourself ends the follow · with Auto on it only pauses · 90 s without finding them ends it')}</li>
  <li>${L('ในปาร์ตี้ Auto จะช่วยตีเป้าเดียวกับคนที่ติดตาม ฮีล และบัฟเพื่อน', 'In a party Auto hits what the one you follow hits, heals and buffs friends')}</li></ul>`});
