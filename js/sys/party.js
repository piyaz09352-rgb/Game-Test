/* VAYRATHEN — js/sys/party.js — parties, done properly
   · Party window (Alt+Z, or the menu): create a party with a name, invite players online, see every member
     (job, level, map, HP/SP), and, as leader, kick, hand over the lead and change the settings.
   · Party frame on screen: each member's name, class and level with live HP/SP bars; the leader wears a crown,
     members on another map are dimmed with the map's name. Tap a member who is near to target what they fight.
   · Settings (the classic MMO standard, leader only):
       EXP   – แยกกันได้ (Each Take): the one who defeats a monster keeps its EXP
             – แบ่งเท่ากัน (Even Share): EXP is pooled (+10% per extra member) and split evenly between the members
               on the same map (any level)
       Items – ใครเก็บได้ของคนนั้น (Each Take): whoever picks a drop up keeps it
             – สุ่มให้สมาชิก (Party Share): each picked-up drop goes to a random member on the same map
     Up to 6 members. If the leader leaves, the lead passes on by itself.
   Everything travels over the online room (party invites already existed); offline there is no party. */
'use strict';

const PTY = {name:'', lead:null, opts:{exp:'each', item:'each'}, tab:'members', MAX:6};
const ptyMe = () => (typeof myPeer === 'function' ? myPeer() : null);
const ptyIsLead = () => !!NET.party && PTY.lead === ptyMe();
const ptyList = () => (typeof partyMembers === 'function' ? partyMembers() : []);
/* the leader announces name and settings in its presence; members read them from there */
function partyPres(){ const me = ptyMe(); return NET.party ? {pl:PTY.lead || me, ...(ptyIsLead() ? {pn:PTY.name.slice(0, 24), po:PTY.opts} : {}), sp:Math.round(S.sp / DER.maxsp * 100)} : {}; }
function ptySync(){
  if (!NET.party || !NET.room) return; const ms = ptyList(); if (!ms.length) return;
  let lead = ms.find(p => p.peer === PTY.lead);
  if (!lead){ const named = ms.find(p => p.presence && p.presence.pl && ms.some(q => q.peer === p.presence.pl)); PTY.lead = named ? named.presence.pl : ms.map(p => p.peer).sort()[0]; lead = ms.find(p => p.peer === PTY.lead); }
  const q = lead && lead.presence; if (q && !lead.isMe){ if (typeof q.pn === 'string') PTY.name = clean(q.pn, 24); if (q.po && typeof q.po === 'object') PTY.opts = {exp:q.po.exp === 'even' ? 'even' : 'each', item:q.po.item === 'party' ? 'party' : 'each'}; }
}
EV.on('tick', dt => { PTY.syncT = (PTY.syncT || 0) - dt; if (PTY.syncT <= 0){ PTY.syncT = .5; ptySync(); ptyHud(); } });

/* invites: only the leader invites; inviting with no party makes you its leader */
{ const _inv = partyInvite;
  partyInvite = async function(peer){
    if (!NET.room){ toast(L('ต้องออนไลน์ก่อน', 'You need to be online')); return; }
    if (NET.party && !ptyIsLead()){ toast(L('เฉพาะหัวหน้าปาร์ตี้ที่เชิญได้', 'Only the party leader can invite')); return; }
    if (NET.party && ptyList().length >= PTY.MAX){ toast(L(`ปาร์ตี้เต็มแล้ว (${PTY.MAX} คน)`, `The party is full (${PTY.MAX})`)); return; }
    if (!NET.party){ PTY.lead = ptyMe(); if (!PTY.name) PTY.name = L(`ปาร์ตี้ของ ${netName()}`, `${netName()}'s party`); }
    return _inv(peer);
  };
}
{ const _acc = partyAccept;
  partyAccept = function(){ const iv = NET.invite; if (!iv) return; _acc(); PTY.lead = iv.from; PTY.name = ''; ptySync(); renderParty(); };
}
{ const _lv = partyLeave;
  partyLeave = function(){ _lv(); PTY.lead = null; PTY.name = ''; renderParty(); ptyHud(); };
}
function partyCreate(){
  if (!NET.room){ toast(L('ต้องออนไลน์ก่อน', 'You need to be online')); return; } if (NET.party) return;
  NET.party = `p-${ptyMe() || Math.random().toString(36).slice(2, 10)}`; PTY.lead = ptyMe(); PTY.name = clean(el('ptyName') && el('ptyName').value, 24) || L(`ปาร์ตี้ของ ${netName()}`, `${netName()}'s party`);
  NET.lobbyT = 0; NET.presT = 0; log(L(`ตั้งปาร์ตี้ "${PTY.name}" แล้ว · เชิญเพื่อนได้ที่แท็บเชิญ`, `Party "${PTY.name}" created · invite people from the Invite tab`), 'g'); SFX.play('quest'); PTY.tab = 'invite'; renderParty();
}
const ptyEmit = d => NET.room && NET.room.emit('party', {pt:NET.party, n:netName(), ...d}).catch(() => {});
function partyKick(peer){ if (!ptyIsLead() || peer === ptyMe()) return; ptyEmit({k:'kick', to:peer}); toast(L('เชิญออกจากปาร์ตี้แล้ว', 'Removed from the party')); }
function partyLead(peer){ if (!ptyIsLead() || peer === ptyMe()) return; PTY.lead = peer; ptyEmit({k:'lead', to:peer}); NET.lobbyT = 0; renderParty(); }
function partySet(k, v){ if (!ptyIsLead()) return; PTY.opts[k] = v; ptyEmit({k:'cfg', po:PTY.opts, pn:PTY.name}); NET.lobbyT = 0; renderParty();
  log(L(`ตั้งค่าปาร์ตี้: EXP ${PTY.opts.exp === 'even' ? 'แบ่งเท่ากัน' : 'แยกกันได้'} · ไอเท็ม ${PTY.opts.item === 'party' ? 'สุ่มให้สมาชิก' : 'ใครเก็บได้ของคนนั้น'}`, `Party settings: EXP ${PTY.opts.exp === 'even' ? 'Even Share' : 'Each Take'} · Items ${PTY.opts.item === 'party' ? 'Party Share' : 'Each Take'}`)); }
/* party messages beyond the old invite / accept / leave */
{ const _on = onParty;
  onParty = function(msg){
    const d = msg.data || {};
    if (!msg.isMe && NET.party && d.pt === NET.party){
      if (d.k === 'kick' && d.to === ptyMe()){ const n = clean(d.n, 18); partyLeave(); banner(L(`คุณถูกเชิญออกจากปาร์ตี้โดย ${n}`, `${n} removed you from the party`)); return; }
      if (d.k === 'lead'){ PTY.lead = d.to; if (d.to === ptyMe()) banner(L('คุณเป็นหัวหน้าปาร์ตี้แล้ว', 'You now lead the party')); }
      if (d.k === 'cfg' && d.po){ PTY.opts = {exp:d.po.exp === 'even' ? 'even' : 'each', item:d.po.item === 'party' ? 'party' : 'each'}; if (typeof d.pn === 'string') PTY.name = clean(d.pn, 24); }
      if (d.k === 'gift' && d.to === ptyMe()) ptyGiftIn(d);
    }
    if (!msg.isMe && d.k === 'accept' && NET.party && d.pt === NET.party && ptyIsLead() && ptyList().length > PTY.MAX){ ptyEmit({k:'kick', to:msg.peer}); }
    _on(msg); renderParty();
  };
}

/* ---------- EXP sharing ---------- */
const PEXP = {cut:null};
function ptyShareMates(){   // party members on this map, alive (any level)
  return ptyList().filter(p => !p.isMe && p.presence && p.presence.m === MAP_ID && (p.presence.h | 0) > 0);   // no level limit on sharing
}
partyShareExp = function(be, je, x, y){
  PEXP.cut = null; if (!NET.room || !NET.party || PTY.opts.exp !== 'even') return;
  const mates = ptyShareMates(); if (!mates.length) return; const n = mates.length + 1, bonus = 1 + .1 * (n - 1);
  const e = Math.round(be * bonus / n), j = Math.round(je * bonus / n);
  PEXP.cut = {be, je, e, j}; NET.room.emit('pexp', {pt:NET.party, m:MAP_ID, x:Math.round(x), y:Math.round(y), e, j, mode:'even', to:mates.map(p => p.peer)}).catch(() => {});
};
{ const _g = gainExp;
  gainExp = function(b, j){ const c = PEXP.cut; if (c && b === c.be && j === c.je){ PEXP.cut = null; b = c.e; j = c.j; addText(P.x, P.y - 70, L(`แบ่ง EXP ปาร์ตี้`, 'Party EXP split'), '#9ff0c8', 11); } return _g(b, j); };
}
/* (v286) shared EXP is what someone else's game says it earned, so it is held to what a kill on this map can give:
   the best monster here (the map's own, its boss, anything alive now: invasions, world bosses) × the event rate ×
   the level-gap bonus × a pet × the party bonus. And at most 6 shares a second from one teammate. A cheater can no
   longer hand a friend a level in one message. */
function pexpCap(){
  const M = typeof MAPS !== 'undefined' && MAPS[MAP_ID] || {}, types = new Set([...(M.mobs || []), M.boss, ...(typeof mobs !== 'undefined' ? mobs.map(m => m.type) : [])]);
  let e = 0, j = 0; for (const t of types){ const d = t && MOB[t]; if (!d) continue; e = Math.max(e, +d.exp || 0); j = Math.max(j, +d.jexp || 0); }
  const k = (typeof RATE === 'number' ? RATE : 1) * (typeof EVENT_MUL === 'number' ? EVENT_MUL : 1.5) * 1.2 * 2 * 1.6;
  return {e:Math.ceil(e * k) + 50, j:Math.ceil(j * k) + 50};
}
const PEXP_RL = new Map();
function pexpRate(by){ const now = performance.now(), a = (PEXP_RL.get(by) || []).filter(t => now - t < 1000); if (a.length >= 6) return false; a.push(now); PEXP_RL.set(by, a); return true; }
onPartyExp = function(msg){
  const d = msg.data || {}; if (msg.isMe || !NET.party || d.pt !== NET.party || d.m !== MAP_ID || P.dead || d.mode !== 'even') return;
  if (Array.isArray(d.to) && !d.to.includes(ptyMe())) return;
  if (!pexpRate(msg.by)) return;   // (v286) one teammate cannot pour EXP in faster than kills happen
  const cap = pexpCap(), e = Math.max(0, Math.min(cap.e, Math.round(+d.e || 0))), j = Math.max(0, Math.min(cap.j, Math.round(+d.j || 0)));
  if (e || j){ gainExp(e, j); addText(P.x, P.y - 70, `+${fmtN(e)} EXP (${L('ปาร์ตี้', 'party')})`, '#9ff0c8', 12); }
};

/* ---------- item sharing ---------- */
/* Party Share: a drop goes to a random member on this map (you included); true when someone else got it */
function ptyShareItem(id, x, y){
  if (!id || !NET.room || !NET.party || PTY.opts.item !== 'party' || !ITEMS[id]) return false;
  const mates = ptyList().filter(p => !p.isMe && p.presence && p.presence.m === MAP_ID && (p.presence.h | 0) > 0);
  const k = Math.floor(Math.random() * (mates.length + 1)); if (k === mates.length) return false;
  const to = mates[k], it = ITEMS[id], inst = it.base ? instStore()[id] : null;
  ptyEmit({k:'gift', to:to.peer, id, c:1, x:inst || null}); if (inst) delete instStore()[id];
  const who = clean(to.presence.n, 18) || L('เพื่อน', 'a member'); if (x != null) addText(x, y - 18, `${nm(it)} → ${who}`, '#9fd0ff', 11);
  log(L(`${nm(it)} ไปที่ ${who} (สุ่มให้สมาชิก)`, `${nm(it)} went to ${who} (party share)`)); SFX.play('pickup'); return true;
}
{ const _pick = pickLoot;
  pickLoot = function(l){
    if (!l || LOOT.indexOf(l) < 0 || !ptyShareItem(l.id, l.x, l.y)) return _pick(l);
    LOOT.splice(LOOT.indexOf(l), 1); if (P.loot === l) P.loot = null;
  };
}
{ const _auto = lootAutoTake;
  lootAutoTake = function(id, x, y){ return ptyShareItem(id, x, y) || _auto(id, x, y); };
}
function ptyGiftIn(d){
  const id = String(d.id || ''), n = clamp(d.c | 0, 1, 99);
  if (d.x){ const inst = sanitizeInst(d.x); if (!inst || !/^[a-z_0-9]+~[a-z0-9]+$/.test(id)) return; instStore()[id] = inst; regInst(id, inst); }
  if (!ITEMS[id] || (ITEMS[id].kind === 'gear' && !ITEMS[id].base)) return;
  addItem(id, n); SFX.play('pickup'); const who = clean(d.n, 18);
  addText(P.x, P.y - 60, `+ ${nm(ITEMS[id])}`, '#9fd0ff', 12); log(L(`ได้ ${nm(ITEMS[id])} จากปาร์ตี้ (${who} เก็บได้)`, `Got ${nm(ITEMS[id])} from the party (${who} picked it up)`), 'g'); dirty = true;
}

/* ---------- party frame on screen ---------- */
function ptyHud(){
  let box = el('ptyHud'); const ms = NET.party ? ptyList() : [];
  if (!ms.length || ms.length < 2 && !NET.party){ if (box) box.hidden = true; return; }
  if (!box){ box = document.createElement('div'); box.id = 'ptyHud'; box.className = 'ptyhud'; el('ui').appendChild(box); }
  const gc = el('goalCard'), ui = el('ui');
  if (gc && !gc.hidden && gc.offsetHeight){ const k = (brect(gc).width / (gc.offsetWidth || 1)) || 1; box.style.top = Math.round((brect(gc).bottom - brect(ui).top) / k + 8) + 'px'; }
  const order = ms.slice().sort((a, b) => (b.peer === PTY.lead) - (a.peer === PTY.lead) || (b.isMe - a.isMe));
  box.hidden = false;
  box.innerHTML = `<div class="phh" data-win-open="party"><b>${escH(PTY.name || L('ปาร์ตี้', 'Party'))}</b><small>${ms.length}/${PTY.MAX} · ${PTY.opts.exp === 'even' ? L('แบ่ง EXP', 'EXP split') : L('EXP แยก', 'EXP each')}</small></div>` +
    order.map(p => { const q = p.presence || {}, here = q.m === MAP_ID, hp = clamp(q.h | 0, 0, 100), sp = q.sp == null ? null : clamp(q.sp | 0, 0, 100);
      return `<div class="phm${here ? '' : ' away'}${p.isMe ? ' me' : ''}${hp <= 0 ? ' dead' : ''}" data-ptyfocus="${p.peer}"><div class="phn">${p.peer === PTY.lead ? '<i class="crown">♛</i>' : ''}<b class="pn"></b><small>${JOBS[q.j] ? nm(JOBS[q.j]) : ''} ${q.l | 0}</small></div>
        <div class="ptb"><i style="width:${hp}%"></i></div>${sp != null ? `<div class="ptb sp"><i style="width:${sp}%"></i></div>` : ''}${here ? '' : `<em>${MAPS[q.m] ? nm(MAPS[q.m]) : ''}</em>`}</div>`; }).join('');
  box.querySelectorAll('.pn').forEach((b, i) => { b.textContent = clean(order[i].presence && order[i].presence.n, 18) || L('นักผจญภัย', 'Adventurer'); });
}

/* ---------- the Party window ---------- */
mkWin('party', 'ปาร์ตี้', 'Party', 'Alt+Z', '<circle cx="7" cy="7" r="2.6"/><circle cx="13.5" cy="7.6" r="2.2"/><path d="M2.5 16c.4-3 2.2-4.6 4.5-4.6s4.1 1.6 4.5 4.6M11 12c1-.6 1.6-.8 2.5-.8 2 0 3.4 1.4 3.8 4"/>');
function renderParty(){ if (el('win-party') && !el('win-party').hidden) WIN_RENDER.party(); }
WIN_RENDER.party = function(){
  const pane = el('pane-party'); if (!pane) return;
  if (!NET.room){ pane.innerHTML = `<p class="hint">${L('ระบบปาร์ตี้ใช้ได้เมื่อออนไลน์ · ตอนนี้เล่นแบบออฟไลน์', 'Parties work online · you are playing offline')}</p>`; return; }
  const lead = ptyIsLead(), ms = ptyList(), tabs = [['members', 'สมาชิก', 'Members'], ['settings', 'ตั้งค่า', 'Settings'], ['invite', 'เชิญ', 'Invite']];
  let body = '';
  if (!NET.party){
    body = `<div class="ptynew"><b>${L('ยังไม่มีปาร์ตี้', 'No party yet')}</b><p class="hint">${L('ตั้งปาร์ตี้แล้วเชิญผู้เล่นที่ออนไลน์ · หรือรอคำเชิญจากเพื่อน', 'Create a party and invite players online · or wait for an invitation')}</p>
      <label class="set"><span><b>${L('ชื่อปาร์ตี้', 'Party name')}</b></span><input id="ptyName" maxlength="24" placeholder="${escH(L(`ปาร์ตี้ของ ${netName()}`, `${netName()}'s party`))}"></label>
      <button class="btn gold wide" data-ptycreate="1">${L('ตั้งปาร์ตี้', 'Create party')}</button></div>`;
  } else if (PTY.tab === 'members'){
    body = `<div class="ptylist">${ms.slice().sort((a, b) => (b.peer === PTY.lead) - (a.peer === PTY.lead)).map(p => { const q = p.presence || {}, hp = clamp(q.h | 0, 0, 100), sp = q.sp == null ? null : clamp(q.sp | 0, 0, 100);
        return `<div class="ptyrow${q.m === MAP_ID ? '' : ' away'}"><div class="nm"><b>${p.peer === PTY.lead ? '<i class="crown">♛</i> ' : ''}<span class="pn"></span>${p.isMe ? ` <span class="ct">${L('คุณ', 'you')}</span>` : ''}</b>
          <small>${JOBS[q.j] ? nm(JOBS[q.j]) : '—'} · Lv ${q.l | 0} · ${MAPS[q.m] ? nm(MAPS[q.m]) : '—'}</small><div class="ptb"><i style="width:${hp}%"></i></div>${sp != null ? `<div class="ptb sp"><i style="width:${sp}%"></i></div>` : ''}</div>
          ${lead && !p.isMe ? `<button class="btn sm" data-ptylead="${p.peer}">${L('ยกหัวหน้า', 'Make leader')}</button><button class="btn sm" data-ptykick="${p.peer}">${L('เชิญออก', 'Remove')}</button>` : ''}</div>`; }).join('')}</div>
      <button class="btn wide" data-pleave="1">${L('ออกจากปาร์ตี้', 'Leave party')}</button>`;
  } else if (PTY.tab === 'settings'){
    const opt = (k, v, th, en, dth, den) => `<button class="ptyopt${PTY.opts[k] === v ? ' on' : ''}" data-ptyset="${k}:${v}" ${lead ? '' : 'disabled'}><b>${L(th, en)}</b><small>${L(dth, den)}</small></button>`;
    const spread = ms.length ? Math.max(...ms.map(p => (p.presence && p.presence.l) | 0)) - Math.min(...ms.map(p => (p.presence && p.presence.l) | 0)) : 0;
    body = `${lead ? `<label class="set"><span><b>${L('ชื่อปาร์ตี้', 'Party name')}</b></span><input id="ptyRename" maxlength="24" value="${escH(PTY.name)}"><button class="btn sm" data-ptyrename="1">${L('บันทึก', 'Save')}</button></label>` : `<p class="hint">${L('เฉพาะหัวหน้าปาร์ตี้ที่เปลี่ยนการตั้งค่าได้', 'Only the leader can change these')}</p>`}
      <div class="sec">${L('การแบ่ง EXP', 'EXP sharing')}</div><div class="ptyopts">
        ${opt('exp', 'each', 'แยกกันได้', 'Each Take', 'ใครล้มมอนได้ EXP ของตัวเอง', 'Whoever defeats a monster keeps its EXP')}
        ${opt('exp', 'even', 'แบ่งเท่ากัน', 'Even Share', 'รวม EXP +10% ต่อสมาชิก แล้วแบ่งเท่ากันให้คนในแผนที่เดียวกัน (ไม่จำกัดเลเวล)', 'Pooled (+10% per member) and split evenly on the same map (any level)')}</div>
      <div class="sec">${L('การแบ่งไอเท็ม', 'Item sharing')}</div><div class="ptyopts">
        ${opt('item', 'each', 'ใครเก็บได้ของคนนั้น', 'Each Take', 'ไอเท็มที่ดรอปเป็นของคนที่เก็บ', 'A drop belongs to whoever picks it up')}
        ${opt('item', 'party', 'สุ่มให้สมาชิก', 'Party Share', 'ทุกชิ้นที่เก็บสุ่มให้สมาชิกในแผนที่เดียวกัน', 'Each picked-up drop goes to a random member on the same map')}</div>
      <p class="hint">${L(`สมาชิกสูงสุด ${PTY.MAX} คน · แชทปาร์ตี้: เลือกช่อง 👥 ปาร์ตี้ในกล่องแชท`, `Up to ${PTY.MAX} members · party chat: pick 👥 Party in the chat box`)}</p>`;
  } else {
    const others = NET.room.peers().filter(p => p.kind === 'viewer' && !p.isMe && p.presence);
    body = `${lead || !NET.party ? '' : `<p class="hint">${L('เฉพาะหัวหน้าปาร์ตี้ที่เชิญได้', 'Only the leader can invite')}</p>`}<div class="ptylist">${others.length ? others.map(p => { const q = p.presence, inP = q.pt && q.pt === NET.party, other = q.pt && !inP;
        return `<div class="ptyrow"><div class="nm"><b class="pn"></b><small>${JOBS[q.j] ? nm(JOBS[q.j]) : '—'} · Lv ${q.l | 0} · ${MAPS[q.m] ? nm(MAPS[q.m]) : '—'}${other ? ` · ${L('อยู่ปาร์ตี้อื่น', 'in another party')}` : ''}</small></div>
          ${inP ? `<span class="ct">${L('ในปาร์ตี้', 'in party')}</span>` : `<button class="btn sm gold" data-pinv="${p.peer}" ${lead && !other && ms.length < PTY.MAX ? '' : 'disabled'}>${L('เชิญ', 'Invite')}</button>`}</div>`; }).join('')
      : `<p class="hint">${L('ยังไม่มีผู้เล่นคนอื่นออนไลน์', 'No one else is online')}</p>`}</div>`;
  }
  pane.innerHTML = `<div class="ptyhead"><b>${NET.party ? escH(PTY.name || L('ปาร์ตี้', 'Party')) : L('ปาร์ตี้', 'Party')}</b>${NET.party ? `<small>${ms.length}/${PTY.MAX} · ${lead ? L('คุณเป็นหัวหน้า', 'you lead') : L('สมาชิก', 'member')}</small>` : ''}</div>
    ${NET.party ? `<div class="fgtabs">${tabs.map(([k, th, en]) => `<button class="${PTY.tab === k ? 'on' : ''}" data-ptytab="${k}">${L(th, en)}</button>`).join('')}</div>` : ''}${body}`;
  const names = pane.querySelectorAll('.pn'); const src = !NET.party ? [] : PTY.tab === 'members' ? ms.slice().sort((a, b) => (b.peer === PTY.lead) - (a.peer === PTY.lead)) : PTY.tab === 'invite' ? NET.room.peers().filter(p => p.kind === 'viewer' && !p.isMe && p.presence) : [];
  names.forEach((b, i) => { b.textContent = clean(src[i] && src[i].presence && src[i].presence.n, 18) || L('นักผจญภัย', 'Adventurer'); });
};
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-ptytab],[data-ptycreate],[data-ptyset],[data-ptykick],[data-ptylead],[data-ptyrename],[data-ptyfocus]'); if (!b || b.disabled) return; const d = b.dataset;
  if (d.ptytab){ PTY.tab = d.ptytab; renderParty(); }
  else if (d.ptycreate) partyCreate();
  else if (d.ptyset){ const [k, v] = d.ptyset.split(':'); partySet(k, v); }
  else if (d.ptykick) askConfirm(L('เชิญออกจากปาร์ตี้', 'Remove from party'), L('เชิญสมาชิกคนนี้ออกจากปาร์ตี้?', 'Remove this member from the party?'), L('เชิญออก', 'Remove'), () => partyKick(d.ptykick));
  else if (d.ptylead) partyLead(d.ptylead);
  else if (d.ptyrename && ptyIsLead()){ PTY.name = clean(el('ptyRename').value, 24) || PTY.name; ptyEmit({k:'cfg', po:PTY.opts, pn:PTY.name}); NET.lobbyT = 0; renderParty(); toast(L('บันทึกชื่อปาร์ตี้แล้ว', 'Party name saved')); }
  else if (d.ptyfocus){ // tap a member on the frame: help them — target the monster nearest to them
    const gh = NET.ghosts && [...NET.ghosts.values()].find(g => g.peer === d.ptyfocus); if (!gh){ openWin('party'); return; }
    let best = null, bd = 260; for (const m of mobs){ if (m.dead || !m.aggro) continue; const dd = Math.hypot(m.x - gh.x, m.y - gh.y); if (dd < bd){ bd = dd; best = m; } }
    if (best){ P.target = best; toast(L('ช่วยสมาชิก: เลือกมอนที่อยู่ใกล้เขา', 'Assisting: targeting the monster near them')); } else toast(L('สมาชิกไม่ได้สู้อยู่', 'They are not fighting'));
  }
});
document.addEventListener('keydown', e => { if (e.altKey && keyOf(e) === 'z' && !typing(e)){ e.preventDefault(); toggleWin('party'); } }, true);
document.addEventListener('keydown', e => { if (e.target && e.target.id && /^pty/.test(e.target.id)) e.stopPropagation(); }, true);
EV.on('netready', () => ptyHud());

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'party', t:['ปาร์ตี้', 'Parties'], b:() => `<p>${L('เปิดหน้าต่างปาร์ตี้ (Alt+Z หรือเมนู) · ตั้งปาร์ตี้ ตั้งชื่อ แล้วเชิญผู้เล่นที่ออนไลน์ (สูงสุด 12 คน) · หัวหน้าเชิญ เชิญออก ยกหัวหน้า และตั้งค่าได้ · ถ้าหัวหน้าออก ตำแหน่งจะส่งต่อเอง · กรอบปาร์ตี้บนจอแสดง HP/SP ของทุกคน แตะชื่อเพื่อช่วยตีมอนที่อยู่ใกล้เขา', 'Open the Party window (Alt+Z or the menu) · create and name a party, invite players online (up to 12) · the leader invites, removes, hands over the lead and sets the rules · if the leader leaves, the lead passes on · the on-screen party frame shows everyone\'s HP/SP; tap a name to help with the monster near them')}</p>
  <table class="wkt"><tr><th></th><th>${L('แยกกันได้', 'Each Take')}</th><th>${L('แบ่ง/สุ่ม', 'Share')}</th></tr><tr><td>EXP</td><td>${L('คนล้มได้ทั้งหมด', 'the one who scores the kill')}</td><td>${L('รวม +10%/คน แบ่งเท่ากัน (แผนที่เดียวกัน ไม่จำกัดเลเวล)', 'pooled +10%/member, split evenly (same map, any level)')}</td></tr><tr><td>${L('ไอเท็ม', 'Items')}</td><td>${L('คนเก็บได้', 'whoever picks it up')}</td><td>${L('สุ่มให้สมาชิกในแผนที่เดียวกัน', 'a random member on the same map')}</td></tr></table>`});
