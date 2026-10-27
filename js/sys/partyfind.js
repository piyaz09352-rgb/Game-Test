/* VAYRATHEN — js/sys/partyfind.js — a party finder in the Social window (online)
   · "หาปาร์ตี้": tick it and everyone online sees you as looking for a group, with your role (Tank / Healer / DPS, from your
     class line), class and level. A leader can tap "เชิญ" to invite you.
   · Party leaders can tick which roles they are recruiting; their party then shows on the board with its name, size and
     the roles it needs, and anyone can tap "ขอเข้า" — the leader gets a prompt and one tap invites them.
   It rides on the online presence (no extra room topic) and the existing party messages. */
'use strict';

const LFG = {rec:{tank:0, heal:0, dps:0}};
const ROLE_TXT = {tank:['แทงค์', 'Tank', '#7ac8ff'], heal:['หมอ', 'Healer', '#7dffb0'], dps:['สายตี', 'DPS', '#ff9a8f']};
const myRole = () => (typeof roleOf === 'function' ? roleOf(S.job) : '') || 'dps';
{ const _pp = partyPres;
  partyPres = function(){ const o = _pp.apply(this, arguments) || {};
    if (S && S.lfg && !NET.party) Object.assign(o, {lf:1, rl:myRole()});
    if (NET.party && typeof ptyIsLead === 'function' && ptyIsLead()){ const r = Object.keys(LFG.rec).filter(k => LFG.rec[k]); if (r.length) Object.assign(o, {rc:r.join(','), pz:(ptyList().length || 1)}); }
    return o; }; }
const roleChip = r => ROLE_TXT[r] ? `<i class="lfrole" style="--c:${ROLE_TXT[r][2]}">${L(ROLE_TXT[r][0], ROLE_TXT[r][1])}</i>` : '';
function lfgHTML(){
  if (!NET.room) return '';
  const peers = NET.room.peers().filter(p => p.kind === 'viewer' && !p.isMe), lead = NET.party && typeof ptyIsLead === 'function' && ptyIsLead();
  const lookers = peers.filter(p => p.presence && p.presence.lf && !p.presence.pt), parties = peers.filter(p => p.presence && p.presence.rc && p.presence.pt !== NET.party);
  const nameOf = p => escH(clean((p.presence || {}).n, 18) || L('นักผจญภัย', 'Adventurer'));
  return `<div class="sec">${L('หาปาร์ตี้', 'Party finder')}</div><div class="lfg">
    ${NET.party ? (lead ? `<div class="lfrow"><span>${L('รับสมาชิก', 'Recruiting')}:</span>${Object.keys(ROLE_TXT).map(r => `<label><input type="checkbox" data-lfrec="${r}" ${LFG.rec[r] ? 'checked' : ''}> ${roleChip(r)}</label>`).join('')}</div>` : `<p class="hint">${L('คุณอยู่ในปาร์ตี้แล้ว · หัวหน้าตั้งรับสมาชิกได้', 'You are in a party · the leader can recruit here')}</p>`)
      : `<label class="lfrow"><input type="checkbox" data-lfme="1" ${S.lfg ? 'checked' : ''}> ${L('กำลังหาปาร์ตี้ (บทบาท', 'Looking for a party (role')} ${roleChip(myRole())})</label>`}
    ${parties.length ? `<small class="lfh">${L('ปาร์ตี้ที่รับสมาชิก', 'Parties recruiting')}</small>` + parties.map(p => { const q = p.presence; return `<div class="lfitem"><div><b>${escH(clean(q.pn, 24) || L('ปาร์ตี้', 'Party'))}</b> <small>${L('หัวหน้า', 'lead')} ${nameOf(p)} · ${clamp(q.pz | 0, 1, PTY.MAX)}/${PTY.MAX}</small><div>${String(q.rc).split(',').map(roleChip).join('')}</div></div>${NET.party ? '' : `<button class="btn sm gold" data-lfjoin="${p.peer}">${L('ขอเข้า', 'Ask to join')}</button>`}</div>`; }).join('') : ''}
    ${lookers.length ? `<small class="lfh">${L('ผู้เล่นที่หาปาร์ตี้', 'Players looking')}</small>` + lookers.map(p => { const q = p.presence; return `<div class="lfitem"><div><b>${nameOf(p)}</b> <small>${JOBS[q.j] ? nm(JOBS[q.j]) : ''} · Lv ${clamp(q.l | 0, 1, 999)}</small><div>${roleChip(q.rl)}</div></div><button class="btn sm gold" data-lfinv="${p.peer}">${L('เชิญ', 'Invite')}</button></div>`; }).join('') : ''}
    ${!parties.length && !lookers.length ? `<p class="hint">${L('ยังไม่มีใครหาปาร์ตี้ตอนนี้', 'Nobody is looking right now')}</p>` : ''}</div>`;
}
{ const _rs = renderSocial;
  renderSocial = function(){ const r = _rs.apply(this, arguments); const pane = el('pane-social'); if (!pane || el('win-social').hidden || !NET.room) return r;
    const old = pane.querySelector('.lfgwrap'); if (old) old.remove(); pane.insertAdjacentHTML('afterbegin', `<div class="lfgwrap">${lfgHTML()}</div>`); return r; }; }
document.addEventListener('change', e => { const t = e.target; if (!t || !t.dataset) return;
  if (t.dataset.lfme){ S.lfg = t.checked ? 1 : 0; dirty = true; NET.presT = 0; toast(t.checked ? L('ประกาศหาปาร์ตี้แล้ว', 'You are listed as looking for a party') : L('เลิกหาปาร์ตี้', 'No longer looking')); }
  if (t.dataset.lfrec){ LFG.rec[t.dataset.lfrec] = t.checked ? 1 : 0; NET.presT = 0; } });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-lfinv],[data-lfjoin]'); if (!b) return;
  if (b.dataset.lfinv){ partyInvite(b.dataset.lfinv); return; }
  if (b.dataset.lfjoin && NET.room){ NET.room.emit('party', {k:'joinreq', to:b.dataset.lfjoin, n:netName(), j:S.job, l:S.lvl}).catch(() => {}); toast(L('ส่งคำขอเข้าปาร์ตี้แล้ว', 'Join request sent')); } });
/* the leader hears join requests */
EV.on('netready', () => { if (!NET.room) return; NET.room.on('party', msg => { const d = msg.data || {}; if (msg.isMe || d.k !== 'joinreq' || d.to !== myPeer() || !NET.party) return;
  const who = clean(d.n, 18) || L('นักผจญภัย', 'Adventurer'), job = JOBS[d.j] ? nm(JOBS[d.j]) : '';
  sysPrompt(L(`${who} (${job} Lv ${clamp(d.l | 0, 1, 999)}) ขอเข้าปาร์ตี้`, `${who} (${job} Lv ${clamp(d.l | 0, 1, 999)}) asks to join your party`), () => partyInvite(msg.peer), () => {}); SFX.play('chat'); }, () => {}); });
/* joining a party stops "looking" */
EV.on('tick', () => { if (S && S.lfg && NET.party){ S.lfg = 0; dirty = true; } });
{ const st = document.createElement('style');
  st.textContent = `.lfg{display:flex;flex-direction:column;gap:6px;margin-bottom:8px}.lfrow{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:13px}
  .lfrow label{display:flex;align-items:center;gap:3px}.lfh{color:#ffe27a;font-weight:700;margin-top:4px}
  .lfitem{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;border-radius:10px;background:rgba(255,255,255,.08)}
  .lfrole{font-style:normal;font:700 11px var(--display,sans-serif);color:#10203c;background:var(--c);border:1.5px solid #fff;border-radius:8px;padding:0 6px;margin-right:3px}`;
  document.head.appendChild(st); }
