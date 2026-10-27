/* VAYRATHEN — js/sys/partyplus.js — the party system, finished to the usual MMO standard
   What party.js / partyassist.js / pmini.js / allybuff.js already gave (create, invite, accept, leave, kick, hand
   over the lead, 6 members, party frame with HP/SP, minimap markers, green name plates, EXP share, item share,
   party chat, follow, Auto that heals/buffs/assists) stays as it is. This file adds what was still missing:
   · Tap a hero → "ชวนปาร์ตี้" now reaches them: the hero on the map and the player in the lobby have different ids,
     so the invite is sent to the lobby id of the same player (same account, else same name).
   · Invites: someone already in a party is refused with a message (on both sides); "ปฏิเสธ" tells the inviter;
     an invite that is not answered expires after 30 s and tells the inviter too.
   · EXP share (Even Share) only reaches members near the kill (same map, within 1000), the classic "nearby" rule.
   · Items: a third rule, "ผลัดกันเก็บ" (Take Turns) — each drop you pick up goes to the next member in turn
     (you, then each member on this map, then you again).
   · The leader can disband the party (ยุบปาร์ตี้); and when the last other member leaves, the party disbands itself.
   · Members who dropped offline stay in the list, greyed, marked "ออฟไลน์", for 10 minutes.
   · Reconnect keeps the party: after a reload or a dropped connection (within 10 minutes) you are back in the
     same party, and a leader who comes back keeps the lead.
   · The party frame no longer rebuilds itself every half second: it redraws only when someone joins, leaves, levels,
     changes map or dies, and HP/SP bars are updated in place.
   Everything here only wraps the existing functions; network data is never trusted. */
'use strict';

const PPX = {INV_T:30, EXP_R:1000, KEEP:600000, GONE:6000, KEY:'vay-party',
  roster:new Map(), had:false, turn:0, hs:'', hv:'', ws:'', rs:null, tried:false, saveT:0, syncT:0, chk:0, decl:''};

/* ---------- roster: everyone who has been in the party, so offline members can be shown ---------- */
const ppxNm = s => clean(s, 18);
function ppxRoster(){
  if (!NET.party){ PPX.roster.clear(); PPX.had = false; return; }
  const now = Date.now();
  for (const p of ptyList()){ if (p.isMe || !p.presence) continue; const q = p.presence, n = ppxNm(q.n); if (!n) continue;
    PPX.roster.set(n, {peer:p.peer, n, j:q.j, l:clamp(q.l | 0, 0, 999), seen:now}); PPX.had = true; }
  for (const [n, r] of PPX.roster) if (now - r.seen > PPX.KEEP) PPX.roster.delete(n);
}
function ppxOffline(){
  if (!NET.party) return [];
  const now = Date.now(), on = new Set(ptyList().filter(p => !p.isMe).map(p => ppxNm(p.presence && p.presence.n)));
  return [...PPX.roster.values()].filter(r => !on.has(r.n) && now - r.seen > PPX.GONE).sort((a, b) => (a.n < b.n ? -1 : 1));
}

/* ---------- invites ---------- */
/* a hero on the map (map-room id) → the same player in the lobby (lobby id), where party messages travel */
function ppxLobbyPeer(peer){
  if (!NET.room || !peer) return peer;
  const lob = NET.room.peers(); if (lob.some(p => p.peer === peer)) return peer;
  const gh = NET.ghosts && (NET.ghosts.get(peer) || [...NET.ghosts.values()].find(g => g.peer === peer)); if (!gh) return peer;
  const n = ppxNm(gh.q && gh.q.n);
  const hit = (gh.by && lob.find(p => !p.isMe && p.presence && p.by === gh.by)) || (n && lob.find(p => !p.isMe && p.presence && ppxNm(p.presence.n) === n));
  return hit ? hit.peer : peer;
}
{ const _inv = partyInvite;
  partyInvite = function(peer){
    peer = ppxLobbyPeer(peer);
    const t = NET.room && NET.room.peers().find(p => p.peer === peer), q = t && t.presence;
    if (t && t.isMe) return;
    if (q && q.pt && NET.party && q.pt === NET.party){ toast(L('ผู้เล่นคนนี้อยู่ในปาร์ตี้ของคุณแล้ว', 'They are already in your party')); return; }
    if (q && q.pt){ toast(L('ผู้เล่นคนนี้อยู่ปาร์ตี้อื่นแล้ว', 'They are already in another party')); return; }
    const r = _inv.call(this, peer); NET.lobbyT = 0;   // announce the (new) party in the lobby at once
    return r;
  };
}
function ppxDecline(why){
  const iv = NET.invite; if (!iv || !NET.room) return;
  NET.room.emit('party', {k:'decline', to:iv.from, pt:iv.pt, n:netName(), why}).catch(() => {});
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-ivno]'); if (b) ppxDecline('no'); }, true);   // runs before online.js clears the invite

/* ---------- party messages ---------- */
{ const _on = onParty;
  onParty = function(msg){
    const d = (msg && msg.data) || {}, me = ptyMe();
    if (msg && !msg.isMe){
      if (d.k === 'invite' && d.to === me && NET.party){   // already in a party: refuse at once
        if (d.pt !== NET.party && NET.room) NET.room.emit('party', {k:'decline', to:msg.peer, pt:clean(d.pt, 40), n:netName(), why:'party'}).catch(() => {});
        return;
      }
      if (d.k === 'decline' && d.to === me){
        const who = ppxNm(d.n) || L('ผู้เล่น', 'The player'); PPX.decl = who + ':' + (d.why === 'party' || d.why === 'time' ? d.why : 'no');
        const txt = d.why === 'party' ? L(`${who} อยู่ปาร์ตี้อื่นแล้ว`, `${who} is already in another party`)
          : d.why === 'time' ? L(`${who} ไม่ได้ตอบคำเชิญปาร์ตี้`, `${who} did not answer the party invite`)
          : L(`${who} ปฏิเสธคำเชิญปาร์ตี้`, `${who} declined the party invite`);
        toast(txt); log(txt); return;
      }
      if (NET.party && d.pt === NET.party){
        if (d.k === 'disband' && msg.peer === PTY.lead){
          const who = ppxNm(d.n); PPX.roster.clear(); PPX.had = false; partyLeave();
          banner(L(`${who} ยุบปาร์ตี้แล้ว`, `${who} disbanded the party`)); log(L('ปาร์ตี้ถูกยุบแล้ว', 'The party was disbanded')); return;
        }
        if (d.k === 'leave'){ PPX.roster.delete(ppxNm(d.n)); PPX.chk = Date.now() + 3000; }
        if (d.k === 'kick' && d.to !== me){ for (const [n, r] of PPX.roster) if (r.peer === d.to) PPX.roster.delete(n); PPX.chk = Date.now() + 3000; }
      }
    }
    const r = _on.apply(this, arguments);
    if (msg && !msg.isMe && NET.party && d.pt === NET.party && d.k === 'cfg' && d.po && d.po.item === 'turn'){ PTY.opts.item = 'turn'; renderParty(); }
    return r;
  };
}
{ const _kick = partyKick; partyKick = function(peer){ const r = _kick.apply(this, arguments);
    for (const [n, m] of PPX.roster) if (m.peer === peer) PPX.roster.delete(n); PPX.chk = Date.now() + 3000; return r; }; }
{ const _lv = partyLeave;
  partyLeave = function(){ const r = _lv.apply(this, arguments); PPX.roster.clear(); PPX.had = false; PPX.rs = null; PPX.turn = 0; ppxClear(); return r; };
}
function ppxDisband(){
  if (!NET.party || !ptyIsLead()) return;
  ptyEmit({k:'disband'}); PPX.roster.clear(); PPX.had = false; partyLeave();
  log(L('คุณยุบปาร์ตี้แล้ว', 'You disbanded the party'), 'g'); toast(L('ยุบปาร์ตี้แล้ว', 'Party disbanded'));
}
/* the last other member left: the party is gone */
function ppxAloneCheck(){
  if (!PPX.chk || Date.now() < PPX.chk) return; PPX.chk = 0;
  if (!NET.party || !PPX.had || PPX.roster.size || ptyList().some(p => !p.isMe)) return;
  partyLeave(); log(L('ปาร์ตี้ยุบแล้ว เพราะไม่มีสมาชิกเหลือ', 'The party disbanded: no members left'));
  toast(L('ปาร์ตี้ยุบแล้ว', 'Party disbanded'));
}

/* ---------- settings: Take Turns for items ---------- */
{ const _set = partySet;
  partySet = function(k, v){
    if (k !== 'item' || v !== 'turn') return _set.apply(this, arguments);
    if (!ptyIsLead()) return; PTY.opts.item = 'turn'; ptyEmit({k:'cfg', po:PTY.opts, pn:PTY.name}); NET.lobbyT = 0; renderParty();
    log(L('ตั้งค่าปาร์ตี้: ไอเท็ม ผลัดกันเก็บ', 'Party settings: Items Take Turns'));
  };
}
{ const _ps = ptySync;
  ptySync = function(){
    if (PPX.rs && !ppxResolve()) return;
    /* presence lags a moment behind a new party: wait for your own record, and give a missing leader 4 s
       before choosing a new one (an invite answered quickly used to hand the lead to the new member) */
    if (NET.party){ const ms = ptyList(); if (!ms.some(p => p.isMe)) return;
      if (PTY.lead && !ms.some(p => p.peer === PTY.lead)){ if (!PPX.miss) PPX.miss = Date.now(); if (Date.now() - PPX.miss < 4000) return; } }
    PPX.miss = 0;
    const r = _ps.apply(this, arguments);
    if (NET.party){ const ld = ptyList().find(p => p.peer === PTY.lead), q = ld && !ld.isMe && ld.presence; if (q && q.po && q.po.item === 'turn') PTY.opts.item = 'turn'; }
    return r;
  };
}
{ const _si = ptyShareItem;
  ptyShareItem = function(id, x, y){
    if (PTY.opts.item !== 'turn') return _si.apply(this, arguments);
    if (!id || !NET.room || !NET.party || !ITEMS[id]) return false;
    const mates = ptyList().filter(p => !p.isMe && p.presence && p.presence.m === MAP_ID && (p.presence.h | 0) > 0).sort((a, b) => (a.peer < b.peer ? -1 : 1));
    if (!mates.length) return false;
    const k = PPX.turn++ % (mates.length + 1); if (k === 0) return false;   // your turn first, then each member
    const to = mates[k - 1], it = ITEMS[id], inst = it.base ? instStore()[id] : null;
    ptyEmit({k:'gift', to:to.peer, id, c:1, x:inst || null}); if (inst) delete instStore()[id];
    const who = ppxNm(to.presence.n) || L('เพื่อน', 'a member'); if (x != null) addText(x, y - 18, `${nm(it)} → ${who}`, '#1f6fd1', 11);
    log(L(`${nm(it)} ไปที่ ${who} (ผลัดกันเก็บ)`, `${nm(it)} went to ${who} (take turns)`)); SFX.play('pickup'); return true;
  };
}

/* ---------- EXP share: only members near the kill ---------- */
{ const _sm = ptyShareMates;
  ptyShareMates = function(){
    return _sm.apply(this, arguments).filter(p => { const g = typeof paGhost === 'function' ? paGhost(p.peer) : null; return !!g && Math.hypot(g.x - P.x, g.y - P.y) <= PPX.EXP_R; });
  };
}

/* ---------- reconnect keeps the party ---------- */
function ppxClear(){ try { localStorage.removeItem(PPX.KEY); } catch (e) {} }
function ppxStore(){
  if (!NET.party || PPX.rs) return;
  const rec = {pt:NET.party, nm:PTY.name, o:PTY.opts, ld:ptyIsLead() ? 1 : 0, n:ptyList().length + ppxOffline().length, who:netName(), at:Date.now()};
  try { localStorage.setItem(PPX.KEY, JSON.stringify(rec)); } catch (e) {}
}
function ppxRestore(){
  let rec = null; try { rec = JSON.parse(localStorage.getItem(PPX.KEY) || 'null'); } catch (e) {}
  if (!rec || typeof rec !== 'object' || NET.party) return false;
  if (typeof rec.pt !== 'string' || !/^p-[\w-]{1,48}$/.test(rec.pt) || rec.who !== netName() || !(Date.now() - (+rec.at || 0) < PPX.KEEP)){ ppxClear(); return false; }
  const o = rec.o || {};
  NET.party = rec.pt; PTY.name = clean(rec.nm, 24); PTY.opts = {exp:o.exp === 'even' ? 'even' : 'each', item:o.item === 'party' || o.item === 'turn' ? o.item : 'each'}; PTY.lead = null;
  PPX.rs = {until:Date.now() + 12000, ld:!!rec.ld, n:clamp(rec.n | 0, 0, 99)};
  NET.lobbyT = 0; NET.presT = 0; log(L('กลับเข้าปาร์ตี้เดิมแล้ว', 'You are back in your party'), 'g');
  return true;
}
/* after coming back: learn who leads from the others; true when settled */
function ppxResolve(){
  const me = ptyMe(); if (!me || !PPX.rs) return !PPX.rs;
  const ms = ptyList(), ids = new Set(ms.map(p => p.peer)), others = ms.filter(p => !p.isMe);
  const named = others.find(p => p.presence && p.presence.pl && ids.has(p.presence.pl));
  if (named && !(PPX.rs.ld && named.presence.pl !== me && Date.now() < PPX.rs.until - 6000)){ PTY.lead = named.presence.pl; PPX.rs = null; return true; }
  if (Date.now() < PPX.rs.until) return false;
  const rs = PPX.rs; PPX.rs = null;
  if (!others.length && rs.n > 1){ NET.party = null; PTY.lead = null; PTY.name = ''; ppxClear(); NET.lobbyT = 0; NET.presT = 0; log(L('ปาร์ตี้เดิมยุบไปแล้ว', 'Your old party has disbanded')); return false; }
  PTY.lead = rs.ld || !others.length ? me : null; return true;
}
/* while coming back as a member, do not announce yourself as the leader */
{ const _pp = partyPres;
  partyPres = function(){ const o = _pp.apply(this, arguments) || {}; if (PPX.rs && !PPX.rs.ld && o.pl === ptyMe()) delete o.pl; return o; };
}

/* ---------- party frame: redraw only when something changes ---------- */
function ppxPlace(box){
  const gc = el('goalCard'), ui = el('ui'); if (!box || !ui) return;
  if (gc && !gc.hidden && gc.offsetHeight){ const k = (brect(gc).width / (gc.offsetWidth || 1)) || 1, top = Math.round((brect(gc).bottom - brect(ui).top) / k + 8) + 'px'; if (box.style.top !== top) box.style.top = top; }
  if (typeof hudFit === 'function') hudFit();
}
{ const _hud = ptyHud;
  ptyHud = function(){
    const box = el('ptyHud');
    if (!NET.party){ PPX.hs = ''; return _hud.apply(this, arguments); }
    const ms = ptyList(), off = ppxOffline();
    const s = JSON.stringify([NET.party, PTY.name, PTY.lead, PTY.opts, MAP_ID, L('th', 'en'), ms.map(p => { const q = p.presence || {}; return [p.peer, p.isMe, q.n, q.j, q.l | 0, q.m, (q.h | 0) > 0, q.sp == null]; }), off.map(r => [r.n, r.j, r.l])]);
    const v = ms.map(p => { const q = p.presence || {}; return `${clamp(q.h | 0, 0, 100)}/${q.sp == null ? '' : clamp(q.sp | 0, 0, 100)}`; }).join('|');
    if (box && box.isConnected && !box.hidden && s === PPX.hs){
      if (v !== PPX.hv){ PPX.hv = v;
        for (const p of ms){ const row = box.querySelector(`.phm[data-ptyfocus="${CSS.escape(p.peer)}"]`); if (!row) continue; const q = p.presence || {};
          const hp = row.querySelector('.ptb:not(.sp) i'), sp = row.querySelector('.ptb.sp i');
          const wh = clamp(q.h | 0, 0, 100) + '%'; if (hp && hp.style.width !== wh) hp.style.width = wh;
          if (sp && q.sp != null){ const ws = clamp(q.sp | 0, 0, 100) + '%'; if (sp.style.width !== ws) sp.style.width = ws; } } }
      ppxPlace(box); return;
    }
    const r = _hud.apply(this, arguments); PPX.hs = s; PPX.hv = v;
    const b2 = el('ptyHud');
    if (b2 && !b2.hidden && off.length){
      b2.insertAdjacentHTML('beforeend', off.map(m => `<div class="phm away off"><div class="phn"><b class="pn"></b><small>${JOBS[m.j] ? nm(JOBS[m.j]) : ''} ${m.l}</small></div><em class="ppxoff">${L('ออฟไลน์', 'Offline')}</em></div>`).join(''));
      b2.querySelectorAll('.phm.off .pn').forEach((b, i) => { b.textContent = off[i].n; });
    }
    return r;
  };
}

/* ---------- Party window: offline members, Disband, Take Turns ---------- */
{ const _wr = WIN_RENDER.party;
  WIN_RENDER.party = function(){
    const r = _wr.apply(this, arguments), pane = el('pane-party'); if (!pane || !NET.party || !NET.room) return r;
    const lead = ptyIsLead();
    if (PTY.tab === 'members'){
      const list = pane.querySelector('.ptylist'), off = ppxOffline();
      if (list && off.length){
        list.insertAdjacentHTML('beforeend', off.map(m => `<div class="ptyrow away off"><div class="nm"><b><span class="ppxn"></span></b><small>${JOBS[m.j] ? nm(JOBS[m.j]) : '—'} · Lv ${m.l} · <b class="ppxoff">${L('ออฟไลน์', 'Offline')}</b></small></div></div>`).join(''));
        list.querySelectorAll('.ptyrow.off .ppxn').forEach((b, i) => { b.textContent = off[i].n; });
      }
      const lv = pane.querySelector('[data-pleave]');
      if (lead && lv && !pane.querySelector('[data-ppxdisband]')) lv.insertAdjacentHTML('afterend', `<button class="btn wide ppxdis" data-ppxdisband="1">${L('ยุบปาร์ตี้', 'Disband party')}</button>`);
    }
    if (PTY.tab === 'settings'){
      const box = pane.querySelectorAll('.ptyopts')[1];
      if (box && !box.querySelector('[data-ptyset="item:turn"]')) box.insertAdjacentHTML('beforeend', `<button class="ptyopt${PTY.opts.item === 'turn' ? ' on' : ''}" data-ptyset="item:turn" ${lead ? '' : 'disabled'}><b>${L('ผลัดกันเก็บ', 'Take Turns')}</b><small>${L('ของที่เก็บได้ส่งให้สมาชิกในแผนที่เดียวกันทีละคนตามคิว', 'Each picked-up drop goes to the next member on this map, in turn')}</small></button>`);
      const exp = pane.querySelectorAll('.ptyopts')[0];
      if (exp && !pane.querySelector('.ppxhint')) exp.insertAdjacentHTML('afterend', `<p class="hint ppxhint">${L('แบ่งเท่ากัน: เฉพาะสมาชิกที่อยู่ใกล้ตอนล้มมอน (แผนที่เดียวกัน)', 'Even Share: only members near the kill (same map)')}</p>`);
    }
    return r;
  };
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-ppxdisband]'); if (!b) return;
  askConfirm(L('ยุบปาร์ตี้', 'Disband party'), L('ยุบปาร์ตี้นี้? สมาชิกทุกคนจะออกจากปาร์ตี้', 'Disband this party? Every member leaves it'), L('ยุบปาร์ตี้', 'Disband'), ppxDisband);
});
/* tap a hero who is already in your party: no invite button */
{ const _pm = playerMenu;
  playerMenu = function(gh){ const r = _pm.apply(this, arguments); const b = el('pcard'), q = (gh && gh.q) || {}, btn = b && !b.hidden && b.querySelector('[data-pcact="party"]');
    if (btn && NET.party && q.pt === NET.party){ btn.disabled = true; btn.textContent = L('อยู่ปาร์ตี้เดียวกัน', 'In your party'); }
    return r; };
}

/* ---------- the clock ---------- */
EV.on('tick', dt => {
  if (typeof NET === 'undefined' || !NET.room) return;
  if (NET.invite){ const iv = NET.invite; if (!iv.at) iv.at = Date.now();
    else if (Date.now() - iv.at > PPX.INV_T * 1000){ ppxDecline('time'); NET.invite = null; renderInvite(); toast(L('คำเชิญปาร์ตี้หมดเวลาแล้ว', 'The party invite expired')); } }
  if ((PPX.syncT -= dt) > 0) return; PPX.syncT = .5;
  if (!PPX.tried && !NET.party && ptyMe() && typeof PAUSED !== 'undefined' && !PAUSED && S && S.name){ PPX.tried = true; ppxRestore(); }
  ppxRoster(); ppxAloneCheck();
  if (NET.party && (PPX.saveT -= .5) <= 0){ PPX.saveT = 5; ppxStore(); }
  const ws = NET.party ? ptyList().map(p => p.peer).sort().join(',') + '|' + ppxOffline().map(r => r.n).join(',') + '|' + PTY.lead : '';
  if (ws !== PPX.ws){ PPX.ws = ws; renderParty(); }
});
{ const st = document.createElement('style');
  st.textContent = `.ptyhud .phm.off{cursor:default}.ptyhud .phm.off em.ppxoff,.ptyrow .ppxoff{color:#b3261e;font-weight:800}
  .ppxdis{margin-top:6px;color:#b3261e}`;
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'partyplus', t:['ปาร์ตี้ (เพิ่มเติม)', 'Parties (more)'], b:() => `<ul>
  <li>${L('แตะตัวละครผู้เล่น → ชวนปาร์ตี้ · ผู้เล่นที่อยู่ปาร์ตี้อื่นชวนไม่ได้ · ไม่ตอบใน 30 วินาที คำเชิญหมดเวลา', 'Tap a player → Party invite · players in another party cannot be invited · an invite expires after 30 s')}</li>
  <li>${L('แบ่ง EXP เท่ากัน: เฉพาะสมาชิกที่อยู่ใกล้ตอนล้มมอน', 'Even Share EXP: only members near the kill')}</li>
  <li>${L('ไอเท็มแบบผลัดกันเก็บ: ของที่เก็บได้ส่งให้สมาชิกทีละคนตามคิว', 'Items, Take Turns: picked-up drops go to each member in turn')}</li>
  <li>${L('หัวหน้ายุบปาร์ตี้ได้ · สมาชิกคนสุดท้ายออก ปาร์ตี้ยุบเอง · หลุดแล้วกลับมาภายใน 10 นาทียังอยู่ปาร์ตี้เดิม', 'The leader can disband · when the last member leaves the party disbands · come back within 10 min and you are still in it')}</li></ul>`});
