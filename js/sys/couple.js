/* VAYRATHEN — js/sys/couple.js — (v87) couples (ระบบคู่รัก)
   · Marry: both heroes Lv 10+, standing together in Aren (นครอาเรน). Tap your partner → "ขอแต่งงาน"; they get a
     prompt, and when they say yes both of you are married. The wedding costs the one who asked 20,000 Bia.
   · Both get the Lovers' Ring (แหวนคู่รัก) in the bag; each player card shows who you are married to.
   · Love buff "รักแท้" while your partner is on the same map within 400: ATK +5% · DEF +5% · EXP +5%.
   · Couple window (♥ in the menu): your partner, days together, where they are, "วาร์ปหาคู่" (every 5 minutes,
     not from inside a dungeon) and divorce. A divorce reaches the other side now, or the next time you are both online.
   Messages travel in the lobby (the same room as party and friend messages). The partner check runs once a second. */
'use strict';

const CPL = {fee:20000, lv:10, pend:null, t:0, warpAt:0};
ITEMS.ring_love = {name:'แหวนคู่รัก', en:"Lovers' Ring", kind:'key', desc:['แหวนแต่งงานของคุณกับคู่รัก · อยู่ใกล้กันได้บัฟรักแท้', 'Your wedding ring · near your partner you share the Love buff']};
const cplWho = n => clean(n, 18) || L('นักผจญภัย', 'Adventurer');
const cplPeer = () => (S.spouse && NET.room ? NET.room.peers().find(p => !p.isMe && p.by === S.spouse.uid && p.kind === 'viewer') : null);
const cplGhost = () => { if (!S.spouse || !NET.ghosts) return null; for (const g of NET.ghosts.values()) if (g && (g.by === S.spouse.uid)) return g; return null; };
function cplSend(k, to, extra = {}){ if (NET.room && to) NET.room.emit('cpl', {k, to, n:netName(), ...extra}).catch(() => {}); }
function cplPropose(gh){
  if (!NET.room || !NET.on || !NET.uid) return toast(L('ต้องออนไลน์ก่อน', 'You need to be online'));
  const q = gh.q || {}; if (!gh.by) return toast(L('ผู้เล่นคนนี้ยังไม่ได้เข้าระบบ', 'This player is not signed in'));
  if (S.spouse) return toast(L('คุณแต่งงานแล้ว', 'You are already married'));
  if (S.lvl < CPL.lv || (q.l | 0) < CPL.lv) return toast(L(`ต้องเลเวล ${CPL.lv} ขึ้นไปทั้งคู่`, `Both need Lv ${CPL.lv}+`));
  if (MAP_ID !== 0 || Math.hypot(gh.x - P.x, gh.y - P.y) > 220) return toast(L('ต้องยืนใกล้กันในนครอาเรน', 'Stand together in Aren'));
  if (S.bia < CPL.fee) return toast(L(`ค่าจัดงานแต่ง ${fmtN(CPL.fee)} เบี้ย เงินยังไม่พอ`, `The wedding costs ${fmtN(CPL.fee)} Bia`));
  CPL.pend = {uid:gh.by, at:Date.now()}; cplSend('ask', ppxLobbyPeer(gh.peer), {l:S.lvl});
  toast(L(`ขอ ${cplWho(q.n)} แต่งงานแล้ว รอคำตอบ`, `You asked ${cplWho(q.n)} to marry you · waiting`)); SFX.play('chat');
}
function cplWed(uid, n){
  S.spouse = {uid, n:cplWho(n), at:Date.now()}; if (!S.inv.ring_love) addItem('ring_love', 1);
  banner(L(`💍 คุณแต่งงานกับ ${S.spouse.n} แล้ว!`, `💍 You married ${S.spouse.n}!`)); log(L(`แต่งงานกับ ${S.spouse.n} · ได้แหวนคู่รัก`, `Married ${S.spouse.n} · Lovers' Ring received`), 'g');
  VFX.play('jobChange', {x:P.x, y:P.y}); SFX.play('quest'); NET.lobbyT = 0; dirty = true; save(); reWin('couple');
}
function cplClear(msg){ if (!S.spouse) return; const n = S.spouse.n; S.spouse = null; delete P.buffs.cpl_love; if (S.inv.ring_love){ S.inv.ring_love = 0; delete S.inv.ring_love; }
  log(msg || L(`หย่ากับ ${n} แล้ว`, `Divorced from ${n}`)); NET.lobbyT = 0; dirty = true; save(); reWin('couple'); renderBuffs(); }
function cplDivorce(){ if (!S.spouse) return; askConfirm(L('หย่า', 'Divorce'), L(`หย่ากับ ${escH(S.spouse.n)}? แหวนคู่รักจะหายไป`, `Divorce ${escH(S.spouse.n)}? The Lovers' Ring is lost`), L('หย่า', 'Divorce'),
  () => { const p = cplPeer(); if (p) cplSend('div', p.peer); cplClear(); }); }
function cplWarp(){
  const p = cplPeer(), q = p && p.presence; if (!q) return toast(L('คู่ของคุณออฟไลน์อยู่', 'Your partner is offline'));
  const m = q.m | 0; if (!MAPS[m]) return; if (m === MAP_ID) return toast(L('อยู่แมพเดียวกันแล้ว', 'Already on the same map'));
  if (typeof DG !== 'undefined' && DG.active) return toast(L('วาร์ปออกจากดันเจียนไม่ได้', 'You cannot warp out of a dungeon'));
  const left = CPL.warpAt + 300e3 - Date.now(); if (left > 0) return toast(L(`วาร์ปหาคู่ได้อีกใน ${Math.ceil(left / 60e3)} นาที`, `Warp again in ${Math.ceil(left / 60e3)} min`));
  CPL.warpAt = Date.now(); warpTo(m); toast(L(`วาร์ปไปหา ${S.spouse.n}`, `Warped to ${S.spouse.n}`));
}
function onCpl(msg){
  const d = msg.data || {}; if (msg.isMe || d.to !== myPeer() || !msg.by) return; const who = cplWho(d.n);
  if (d.k === 'ask'){ if (S.spouse || S.lvl < CPL.lv) return cplSend('no', msg.peer, {r:S.spouse ? 'taken' : 'lv'});
    sysPrompt(L(`💍 ${who} ขอคุณแต่งงาน ตกลงไหม?`, `💍 ${who} asks you to marry them. Yes?`), () => { cplWed(msg.by, d.n); cplSend('ok', msg.peer); }, () => cplSend('no', msg.peer)); SFX.play('chat'); }
  if (d.k === 'ok' && CPL.pend && CPL.pend.uid === msg.by && Date.now() - CPL.pend.at < 120e3){ CPL.pend = null; S.bia = Math.max(0, S.bia - CPL.fee); cplWed(msg.by, d.n); }
  if (d.k === 'no'){ CPL.pend = null; toast(d.r === 'taken' ? L(`${who} แต่งงานแล้ว`, `${who} is already married`) : L(`${who} ปฏิเสธ`, `${who} said no`)); }
  if (d.k === 'div' && S.spouse && S.spouse.uid === msg.by) cplClear(L(`${S.spouse.n} ขอหย่าแล้ว`, `${S.spouse.n} divorced you`));
}
EV.on('netready', () => { if (NET.room) NET.room.on('cpl', onCpl, () => {}); });
{ const _pp = partyPres; partyPres = function(){ const o = _pp.apply(this, arguments) || {}; o.cp = S && S.spouse ? S.spouse.uid : 0; return o; }; }
/* once a second: the love buff, and a divorce made while you were away */
EV.on('tick', dt => { if ((CPL.t -= dt) > 0 || !S || !S.spouse) return; CPL.t = 1;
  const p = cplPeer(); if (p && p.presence && p.presence.cp !== undefined && p.presence.cp !== NET.uid) return cplClear(L(`${S.spouse.n} หย่ากับคุณแล้ว`, `${S.spouse.n} has divorced you`));
  const g = cplGhost(), near = g && Math.hypot(g.x - P.x, g.y - P.y) < 400 && !P.dead;
  if (near){ if (P.buffs.cpl_love) P.buffs.cpl_love.t = 2; else addBuff('cpl_love', {t:2, atkPct:.05, def:Math.max(1, Math.round(DER.def * .05)), cpl:1}); } });
{ const _ge = gainExp; gainExp = function(b, j){ if (P && P.buffs && P.buffs.cpl_love){ b = Math.round(b * 1.05); j = Math.round((j || 0) * 1.05); } return _ge.call(this, b, j); }; }
{ const _be = buffEffect; buffEffect = function(b){ const s = _be.apply(this, arguments); return b && b.cpl ? [L('รักแท้', 'True Love'), s, 'EXP +5%'].filter(Boolean).join(' · ') : s; }; }
/* the player card */
{ const _pm = playerMenu; playerMenu = function(gh){ const r = _pm.apply(this, arguments); const b = el('pcard'); if (!b || b.hidden || !gh) return r;
    const cl = b.querySelector('[data-pcact="close"]'), q = gh.q || {};
    if (S.spouse && gh.by === S.spouse.uid){ const s = document.createElement('div'); s.className = 'cplmine'; s.textContent = '♥ ' + L('คู่รักของคุณ', 'Your partner'); b.querySelector('.pch').appendChild(s); }
    else if (!S.spouse && gh.by && cl && !q.cp) cl.insertAdjacentHTML('beforebegin', `<button class="btn sm" data-pcact="wed">💍 ${L('ขอแต่งงาน', 'Propose')}</button>`);
    return r; }; }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-pcact="wed"],[data-cplwarp],[data-cpldiv]'); if (!t) return;
  if (t.dataset.pcact === 'wed'){ const gh = el('pcard')._gh; if (gh) cplPropose(gh); return; }
  if (t.dataset.cplwarp) cplWarp(); else cplDivorce(); }, true);
/* the couple window */
mkWin('couple', 'คู่รัก', 'Couple', '', '<path d="M10 16.5s-6-3.7-6-8A3.2 3.2 0 0110 6.6a3.2 3.2 0 016 1.9c0 4.3-6 8-6 8z"/>');
WIN_RENDER.couple = function(){
  const pane = el('pane-couple'); if (!pane) return; const sp = S.spouse;
  if (!sp){ pane.innerHTML = `<div class="cplbox"><b>${L('ยังไม่ได้แต่งงาน', 'Not married yet')}</b>
    <p>${L(`ยืนใกล้คนที่คุณรักในนครอาเรน แตะตัวเขาแล้วกด 💍 ขอแต่งงาน · เลเวล ${CPL.lv} ขึ้นไปทั้งคู่ · ค่าจัดงาน ${fmtN(CPL.fee)} เบี้ย (คนขอเป็นคนจ่าย)`, `Stand next to the one you love in Aren, tap them and press 💍 Propose · both Lv ${CPL.lv}+ · the wedding costs ${fmtN(CPL.fee)} Bia (paid by the one who asks)`)}</p>
    <p class="cplg">+ ${L('อยู่ใกล้กันได้บัฟรักแท้: ATK +5% · DEF +5% · EXP +5% · วาร์ปหาคู่ได้', 'Together: True Love buff ATK +5% · DEF +5% · EXP +5% · warp to your partner')}</p></div>`; return; }
  const p = cplPeer(), q = (p && p.presence) || {}, days = Math.max(1, Math.floor((Date.now() - sp.at) / 864e5) + 1), near = !!P.buffs.cpl_love;
  pane.innerHTML = `<div class="cplbox"><div class="cplh">♥ <b class="cpln"></b></div>
    <small>${L(`อยู่ด้วยกันมา ${days} วัน`, `Together for ${days} day(s)`)} · ${p ? `${L('ออนไลน์', 'online')} · ${MAPS[q.m] ? nm(MAPS[q.m]) : ''}` : L('ออฟไลน์', 'offline')}</small>
    <p class="${near ? 'cplg' : ''}">${near ? '+ ' + L('รักแท้ทำงานอยู่: ATK +5% · DEF +5% · EXP +5%', 'True Love is on: ATK +5% · DEF +5% · EXP +5%') : L('อยู่แมพเดียวกันและใกล้กัน (400) เพื่อรับบัฟรักแท้', 'Be on the same map, close together (400), for True Love')}</p>
    <div class="cplbtn"><button class="btn gold" data-cplwarp="1" ${p && (q.m | 0) !== MAP_ID ? '' : 'disabled'}>${L('วาร์ปหาคู่', 'Warp to partner')}</button><button class="btn" data-cpldiv="1">${L('หย่า', 'Divorce')}</button></div>
    <small class="hint">${L('วาร์ปหาคู่ได้ทุก 5 นาที · ใช้ในดันเจียนไม่ได้', 'Warp every 5 minutes · not from a dungeon')}</small></div>`;
  pane.querySelector('.cpln').textContent = sp.n;
};
{ const st = document.createElement('style');
  st.textContent = `.cplbox{display:flex;flex-direction:column;gap:6px;color:#1b1b1b}.cplbox p{margin:0}.cplh{font-size:18px;color:#c2185b}.cplh b{color:#1b1b1b}
  .cplg{color:#1f7a3a;font-weight:600}.cplbtn{display:flex;gap:8px}.cplmine{color:#c2185b;font-weight:700}`;
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'couple', t:['ระบบคู่รัก', 'Couples'], b:() => `<p>${L(`แต่งงานได้เมื่อเลเวล ${CPL.lv}+ ทั้งคู่ ยืนใกล้กันในนครอาเรน แตะตัวคู่แล้วกด 💍 ขอแต่งงาน (ค่าจัดงาน ${fmtN(CPL.fee)} เบี้ย) · ได้แหวนคู่รัก · อยู่แมพเดียวกันใกล้กันได้บัฟรักแท้ ATK/DEF/EXP +5% · หน้าต่างคู่รักมีปุ่มวาร์ปหาคู่ (ทุก 5 นาที) และหย่า`, `Marry at Lv ${CPL.lv}+ each, standing together in Aren: tap them and press 💍 Propose (${fmtN(CPL.fee)} Bia) · both get the Lovers' Ring · close together on one map you share True Love: ATK/DEF/EXP +5% · the Couple window can warp you to your partner (every 5 minutes) and divorce`)}</p>`});
