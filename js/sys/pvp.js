/* VAYRATHEN — js/sys/pvp.js
   PvP: duels and the ranked arena (สนามประลอง), window P.
   · Duel: tap a player → "Duel". After a 3-second count both can hit each other with attacks and skills
     (55% damage, so fights last). First to drop to 1 HP loses; after 2 minutes the higher HP % wins.
     Nobody dies or loses EXP, and HP is restored afterwards.
   · Ranked: "Find a match" puts you in the queue; when another queued player is found you both go to the
     arena field in Aren for a ranked duel. Ratings use Elo (start 1000, K 32) and the top 20 show in the window.
   Duel rules for the newer skills: damage reduction counts (at most 40%), shadow clones add only 20% each, grand spells
   are not held for 3 s, and area skills only hit monsters.
   The opponent is a light target object that follows their hero on screen; each side applies the damage it
   receives to itself (their numbers are clamped, never trusted blindly). */
'use strict';

const DUEL = {peer:null, name:'', ranked:false, t0:0, go:0, hp0:0, over:true, oppR:1000, oppLvl:1};
const PVPQ = {on:false, t:0, sendT:0};
const pvpSt = () => S.pvp || (S.pvp = {r:1000, w:0, l:0, hist:[]});
MOB_H.__pvp = 52;
const pvpPres = () => ({pv:`${DER.def | 0},${DER.mdef | 0},${DER.flee | 0},${pvpSt().r | 0}`, pq:PVPQ.on ? 1 : 0, du:DUEL.over ? null : DUEL.peer});
function pvpProxy(peer){
  const gh = [...NET.ghosts.values()].find(g => g.peer === peer); if (!gh) return null; const q = gh.q || {}, pv = String(q.pv || '').split(',').map(Number);
  const def = {name:clean(q.n, 18) || L('คู่ต่อสู้', 'Opponent'), en:clean(q.n, 18) || 'Opponent', lvl:clamp(q.l | 0, 1, 300), def:clamp(pv[0] | 0, 0, 3000), mdef:clamp(pv[1] | 0, 0, 3000), r:12, size:'m', elem:'neutral', race:'human', defPct:0, boss:false, aggro:false, hp:1e9, exp:0, jexp:0, drops:[], speed:0};
  return {pvp:true, peer, type:'__pvp', def, hp:1e9, maxhp:1e9, get dead(){ return DUEL.over || DUEL.peer !== peer || !NET.ghosts.has(gh.peer); }, set dead(v){}, get x(){ return gh.x; }, get y(){ return gh.y; }, st:{}, dir:0, atkT:9, flash:0, hurtT:0, zone:MAPZ};
}
function pvpSend(k, extra = {}){ if (NET.room && DUEL.peer) NET.room.emit('pvp', {k, to:DUEL.peer, n:netName(), ...extra}).catch(() => {}); }
function pvpRequest(peer, name){
  if (!NET.room || !NET.on) return toast(L('ต้องออนไลน์ก่อน', 'You need to be online'));
  if (!DUEL.over) return toast(L('กำลังดวลอยู่', 'Already in a duel'));
  DUEL.peer = peer; DUEL.name = name; pvpSend('req'); toast(L(`ท้าดวล ${name} แล้ว`, `Challenged ${name}`));
}
function pvpStart(peer, name, ranked, oppR){
  Object.assign(DUEL, {peer, name, ranked:!!ranked, t0:T, go:T + 3, hp0:S.hp, over:false, oppR:clamp(oppR | 0, 0, 5000) || 1000});
  PVPQ.on = false; BOT.on = false; if (typeof renderBotChip === 'function') renderBotChip(); S.hp = DER.maxhp; SFX.play('wbhorn');
  banner(L(`${ranked ? 'ประลองจัดอันดับ' : 'ดวล'} กับ ${name} · เริ่มใน 3`, `${ranked ? 'Ranked' : 'Duel'} vs ${name} · starts in 3`)); reWin('arena');
  [2, 1].forEach((n, i) => setTimeout(() => { if (!DUEL.over) banner(String(n)); }, (i + 1) * 1000));
  setTimeout(() => { if (DUEL.over) return; banner(L('เริ่ม!', 'Fight!')); const t = pvpProxy(peer); if (t){ P.target = t; } }, 3000);
}
function pvpEnd(win, why){
  if (DUEL.over) return; DUEL.over = true; const st = pvpSt();
  if (win === true) st.w++; else if (win === false) st.l++;
  let dr = 0; if (DUEL.ranked && win !== null){ const E = 1 / (1 + Math.pow(10, (DUEL.oppR - st.r) / 400)); dr = Math.round(32 * ((win ? 1 : 0) - E)); st.r = Math.max(0, st.r + dr); }
  st.hist = [{n:DUEL.name, w:win, r:DUEL.ranked ? dr : null, at:Date.now()}, ...(st.hist || [])].slice(0, 10);
  S.hp = Math.max(DUEL.hp0, Math.round(DER.maxhp * .5)); P.target = null; P.hurt = 0;
  banner(win === true ? L(`ชนะ ${DUEL.name}!${DUEL.ranked ? ` แต้ม ${dr >= 0 ? '+' : ''}${dr}` : ''}`, `You beat ${DUEL.name}!${DUEL.ranked ? ` Rating ${dr >= 0 ? '+' : ''}${dr}` : ''}`)
    : win === false ? L(`แพ้ ${DUEL.name}${DUEL.ranked ? ` แต้ม ${dr}` : ''}`, `Lost to ${DUEL.name}${DUEL.ranked ? ` Rating ${dr}` : ''}`) : L('เสมอ / ยกเลิกการดวล', 'Draw / duel cancelled'));
  SFX.play(win ? 'ach' : 'bf_end'); if (win) { bump('pvpwins'); EV.emit('pvp', true); }
  if (typeof NET !== 'undefined') NET.dirSig = ''; dirty = true; save(); reWin('arena');
}
/* hitting the duel target */
function pvpDeal(t, res){
  if (DUEL.over || T < DUEL.go || t.peer !== DUEL.peer) return;
  const y = t.y - 56; if (res.miss){ addText(t.x, y, 'Miss', '#cfcfcf'); return; }
  const dmg = Math.max(1, Math.round(res.dmg * .55)); addText(t.x + rand(-8, 8), y, String(dmg) + (res.crit ? '!' : ''), res.crit ? '#ffd56a' : '#ffb0e0', res.crit ? 20 : 16);
  SFX.hit(JOBS[S.job].weapon.type); if (res.crit) SFX.play('crit');
  pvpSend('hit', {d:dmg, c:res.crit ? 1 : 0});
}
function onPvp(msg){
  const d = msg.data || {}; if (msg.isMe || d.to !== myPeer()) return; const who = clean(d.n, 18) || L('นักผจญภัย', 'Adventurer');
  if (d.k === 'req'){ if (!DUEL.over) return; sysPrompt(L(`${who} ท้าดวลกับคุณ`, `${who} challenges you to a duel`), () => { DUEL.peer = msg.peer; pvpSend('acc'); pvpStart(msg.peer, who, false); }, () => { NET.room.emit('pvp', {k:'no', to:msg.peer, n:netName()}).catch(() => {}); }); SFX.play('chat'); return; }
  if (d.k === 'acc' && msg.peer === DUEL.peer && DUEL.over){ pvpStart(msg.peer, who, false); return; }
  if (d.k === 'no' && msg.peer === DUEL.peer){ toast(L(`${who} ไม่รับคำท้า`, `${who} declined`)); DUEL.peer = null; return; }
  if (d.k === 'match' && PVPQ.on){ DUEL.peer = msg.peer; pvpArena(false); pvpStart(msg.peer, who, true, d.r); return; }
  if (msg.peer !== DUEL.peer || DUEL.over) return;
  if (d.k === 'hit' && T >= DUEL.go){ const dmg = Math.round(clamp(d.d | 0, 0, Math.max(1, DER.maxhp)) * (1 - Math.min(.4, typeof clRed === 'function' ? clRed() : 0)));   // damage reduction counts in duels too, capped at 40%
    S.hp -= dmg; P.hurt = .25; SFX.play('hurt'); addText(P.x, P.y - 48, String(dmg), '#ff8a80', d.c ? 20 : 16);
    if (S.hp <= 1){ S.hp = 1; pvpSend('end', {lose:1}); pvpEnd(false); } }
  if (d.k === 'end'){ pvpEnd(d.lose ? true : null); }
}
/* the ranked queue: queued players announce themselves; the lower peer id makes the match */
function pvpQueue(on){
  if (on && (!NET.room || !NET.on)) return toast(L('ต้องออนไลน์ก่อน', 'You need to be online'));
  PVPQ.on = on; PVPQ.t = T; PVPQ.sendT = 0; reWin('arena'); if (on) toast(L('กำลังหาคู่ประลอง…', 'Looking for an opponent…'));
}
function onQ(msg){
  const d = msg.data || {}; if (msg.isMe || d.k !== 'q' || !PVPQ.on || !DUEL.over) return;
  const me = myPeer(); if (!me || me > msg.peer) return;   // the lower peer id decides
  const wait = (T - PVPQ.t) / 10; if (Math.abs((d.r | 0) - pvpSt().r) > 200 + wait * 50) return;
  DUEL.peer = msg.peer; NET.room.emit('pvp', {k:'match', to:msg.peer, n:netName(), r:pvpSt().r}).catch(() => {}); pvpArena(true); pvpStart(msg.peer, clean(d.n, 18) || L('นักผจญภัย', 'Adventurer'), true, d.r);
}
/* both go to the arena field east of Aren, facing each other */
function pvpArena(left){ if (MAP_ID !== 0) loadMap(0); P.x = left ? 900 : 1060; P.y = 760; pushOut(P, 12); P.tx = null; P.target = null; VFX.play('jobChange', {x:P.x, y:P.y}); }
EV.on('netready', () => { if (!NET.room) return; NET.room.on('pvp', m => { onPvp(m); onQ(m); }, () => {}); });
EV.on('tick', dt => {
  if (PVPQ.on && NET.room && (PVPQ.sendT -= dt) <= 0){ PVPQ.sendT = 4; NET.room.emit('pvp', {k:'q', r:pvpSt().r, l:S.lvl, n:netName()}).catch(() => {}); }
  if (!DUEL.over){
    if (!NET.ghosts || ![...NET.ghosts.values()].some(g => g.peer === DUEL.peer)){ if (T - DUEL.t0 > 6) pvpEnd(null); return; }
    if (T - DUEL.go > 120){ const g = [...NET.ghosts.values()].find(g => g.peer === DUEL.peer), them = clamp(((g && g.q) || {}).h | 0, 0, 100), me = S.hp / DER.maxhp * 100; pvpEnd(me > them + 1 ? true : me < them - 1 ? false : null); }
  }
});
/* tapping the duel opponent targets them; the player card gains "Duel" */
{ const _pm = playerMenu; playerMenu = function(gh){ if (!DUEL.over && gh.peer === DUEL.peer){ const t = pvpProxy(gh.peer); if (t) P.target = t; return; } _pm(gh);
  const b = el('pcard'); if (b && !b.querySelector('[data-pcact="duel"]')) b.querySelector('[data-pcact="close"]').insertAdjacentHTML('beforebegin', `<button class="btn sm" data-pcact="duel">${L('ท้าดวล', 'Duel')}</button>`); }; }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-pcact="duel"]'); if (!t) return; const gh = el('pcard')._gh; if (gh) pvpRequest(gh.peer, clean((gh.q || {}).n, 18) || L('นักผจญภัย', 'Adventurer')); }, true);

/* ---------- window (P) ---------- */
mkWin('arena', 'สนามประลอง', 'Arena', 'P', '<path d="M4 16L14 6M6 4h2l10 10v2h-2L6 6z"/><path d="M16 16L6 6"/><path d="M3 13l4 4M13 3l4 4"/>');
let pvpRank = [], pvpUnsub = null;
WIN_RENDER.arena = function(){
  const pane = el('pane-arena'); if (!pane) return; const st = pvpSt();
  if (NET.db && !pvpUnsub) pvpUnsub = NET.db.collection('players').orderBy('pvp', 'desc').limit(20).onSnapshot(s => { pvpRank = s.docs.map(d => d.data()); reWin('arena'); }, () => {});
  pane.innerHTML = `<div class="achhead"><div><b>${st.r}</b><small>${L('แต้มประลอง', 'Rating')}</small></div><div><b>${st.w}/${st.l}</b><small>${L('ชนะ/แพ้', 'W/L')}</small></div>
      <div class="achnow"><small>${L('สถานะ', 'Status')}</small><b>${!DUEL.over ? `⚔ ${L('กำลังดวลกับ', 'Dueling')} <span class="pvn"></span>` : PVPQ.on ? L('กำลังหาคู่…', 'In queue…') : L('พร้อม', 'Ready')}</b></div></div>
    <div class="tbtns">${!DUEL.over ? `<button class="btn" data-pvpq="giveup">${L('ยอมแพ้', 'Give up')}</button>` : PVPQ.on ? `<button class="btn" data-pvpq="0">${L('ยกเลิกการหาคู่', 'Leave queue')}</button>` : `<button class="btn gold" data-pvpq="1" ${NET.room ? '' : 'disabled'}>${L('หาคู่ประลองจัดอันดับ', 'Find a ranked match')}</button>`}</div>
    <p class="hint">${L('ดวลธรรมดา: แตะตัวละครผู้เล่นแล้วกด "ท้าดวล" · ไม่ตาย ไม่เสีย EXP · ดาเมจ 55% · 2 นาที · ประลองจัดอันดับพาไปสนามทุ่งตะวันออกนครอาเรน', 'Casual duel: tap a player → "Duel" · nobody dies or loses EXP · 55% damage · 2 minutes · ranked matches take you to the arena field east of Aren')}</p>
    <div class="sec">${L('อันดับนักประลอง', 'Arena ranking')}</div>
    <div class="list rank">${pvpRank.length ? pvpRank.map((r, i) => `<div class="item"><span class="rk">${i + 1}</span><div class="nm"><b class="pn" data-ri="${i}"></b><small>${JOBS[r.job] ? nm(JOBS[r.job]) : ''} · Lv ${clamp(r.lvl | 0, 1, 999)}</small></div><span class="ct">${clamp(r.pvp | 0, 0, 9999)}</span></div>`).join('') : `<p class="hint">${NET.db ? L('ยังไม่มีข้อมูล', 'No data yet') : L('อันดับดูได้เมื่อเล่นออนไลน์', 'Ranking needs online play')}</p>`}</div>
    <div class="sec">${L('ผลล่าสุด', 'Recent results')}</div>
    <div class="list">${(st.hist || []).map(h => `<div class="item"><div class="nm"><b class="pn2"></b><small>${new Date(h.at).toLocaleString(LANG === 'en' ? 'en-GB' : 'th-TH')}</small></div><span class="ct ${h.w ? 'win' : h.w === false ? 'lose' : ''}">${h.w ? L('ชนะ', 'Win') : h.w === false ? L('แพ้', 'Loss') : L('เสมอ', 'Draw')}${h.r != null ? ` ${h.r >= 0 ? '+' : ''}${h.r}` : ''}</span></div>`).join('') || `<p class="hint">${L('ยังไม่เคยดวล', 'No duels yet')}</p>`}</div>`;
  pane.querySelectorAll('.pn[data-ri]').forEach(b => { b.textContent = clean(pvpRank[+b.dataset.ri].name, 18) || '—'; });
  pane.querySelectorAll('.pn2').forEach((b, i) => { b.textContent = clean(st.hist[i].n, 18); });
  const pv = pane.querySelector('.pvn'); if (pv) pv.textContent = DUEL.name;
};
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-pvpq]'); if (!t || t.disabled) return; const v = t.dataset.pvpq;
  if (v === 'giveup'){ pvpSend('end', {lose:1}); pvpEnd(false); } else pvpQueue(v === '1'); });
