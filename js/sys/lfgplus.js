/* VAYRATHEN — js/sys/lfgplus.js — (v86) quick match and party EXP in dungeons
   · "จับคู่ด่วน" in the party finder: one tap asks the recruiting party whose leader's level is closest to yours
     (one that wants your role first); a leader invites the closest-level player who is looking. With nobody to
     match, it lists you (or your party) on the board so the next player finds you.
   · Dungeons with a party: every EXP gain inside is +10% for each extra member (a party of 5 gets +40%).
   One button press does one small look over presence: nothing runs per frame. */
'use strict';

const LFQ = {t:0};
function lfgQuick(){
  if (!NET.room || !NET.on){ toast(L('ต้องออนไลน์ก่อน', 'You need to be online')); return; }
  if (Date.now() - LFQ.t < 3000) return; LFQ.t = Date.now();
  const peers = NET.room.peers().filter(p => p.kind === 'viewer' && !p.isMe && p.presence), near = q => Math.abs(clamp(q.l | 0, 1, 999) - S.lvl);
  if (NET.party){
    if (!(typeof ptyIsLead === 'function' && ptyIsLead())){ toast(L('คุณอยู่ในปาร์ตี้แล้ว', 'You are already in a party')); return; }
    const look = peers.filter(p => p.presence.lf && !p.presence.pt).sort((a, b) => near(a.presence) - near(b.presence))[0];
    if (look){ partyInvite(look.peer); toast(L(`เชิญ ${clean(look.presence.n, 18) || L('นักผจญภัย', 'Adventurer')} แล้ว`, `Invited ${clean(look.presence.n, 18) || 'Adventurer'}`)); return; }
    for (const r of Object.keys(LFG.rec)) LFG.rec[r] = 1; NET.presT = 0; reWin('social');
    toast(L('ยังไม่มีใครหาปาร์ตี้ · ประกาศรับสมาชิกทุกบทบาทให้แล้ว', 'Nobody is looking yet · your party now recruits every role')); return;
  }
  const me = myRole(), fit = q => (String(q.rc || '').split(',').includes(me) ? 0 : 1000);
  const pty = peers.filter(p => p.presence.rc && p.presence.pt && clamp(p.presence.pz | 0, 1, PTY.MAX) < PTY.MAX).sort((a, b) => fit(a.presence) + near(a.presence) - fit(b.presence) - near(b.presence))[0];
  if (pty){ NET.room.emit('party', {k:'joinreq', to:pty.peer, n:netName(), j:S.job, l:S.lvl}).catch(() => {});
    toast(L(`ขอเข้าปาร์ตี้ ${clean(pty.presence.pn, 24) || ''} แล้ว รอหัวหน้าตอบ`, `Asked to join ${clean(pty.presence.pn, 24) || 'a party'} · waiting for the leader`)); return; }
  S.lfg = 1; dirty = true; NET.presT = 0; reWin('social');
  toast(L('ยังไม่มีปาร์ตี้รับสมาชิก · ประกาศหาปาร์ตี้ให้แล้ว', 'No party is recruiting yet · you are listed as looking'));
}
{ const _lh = lfgHTML; lfgHTML = function(){ const h = _lh.apply(this, arguments); if (!h) return h;
    return h.replace('<div class="lfg">', `<div class="lfg"><button class="btn gold lfquick" data-lfquick="1">⚡ ${L('จับคู่ด่วน', 'Quick match')}</button>`); }; }
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-lfquick]')) lfgQuick(); });
/* party EXP inside a dungeon */
{ const _ge = gainExp; gainExp = function(b, j){ if (typeof DG !== 'undefined' && DG.active && DG.pc > 1){ const k = 1 + .1 * (DG.pc - 1); b = Math.round(b * k); j = Math.round((j || 0) * k); } return _ge.call(this, b, j); }; }
{ const st = document.createElement('style'); st.textContent = '.lfquick{align-self:flex-start}'; document.head.appendChild(st); }
