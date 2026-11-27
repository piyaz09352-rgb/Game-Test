/* VAYRATHEN — js/sys/storyboss349.js — (v349) a story boss with three AI adventurers
   Every chapter of the main story ends with the region's boss — a party fight. Chapter 0's card said only «แนะนำ Lv 1+»
   and the Golden Jelly King is Lv 25: a newcomer walked up alone and died, and Auto quest stopped there for good («bring a
   party»). The owner chose to keep the boss as it is and give the lone player a party, as the dungeons do (v334):
   · the chapter card names the boss and its level, and says it is a party fight;
   · near the boss without real party members, the game offers three AI adventurers (or the quest window's button);
   · they fight only that boss, its summons and whatever is attacking you (aiadv334.js aicFoeOk), take a share of its
     blows as a real party would, and leave when the boss falls, after 20 minutes, or outside the boss's map;
   · Auto quest calls them by itself and goes for the boss with them (Auto otherwise keeps away from bosses).
   The boss is not made weaker; strength, rewards and drops are as before. */
'use strict';
const SB = {asked:new WeakSet(), t:0, bye:false};
/* the active main chapter's boss step, while it is still to do */
function sbGoal(){ if (typeof qState !== 'function') return null; const q = qState(), Q = QUESTS.find(x => x.id === q.active); if (!Q) return null;
  const g = Q.goals.find(x => x.k === 'boss' && goalNow(x) < x.n); return g ? {Q, g, type:g.t, map:MAPS.findIndex(m => m && m.boss === g.t && !m.town)} : null; }
const sbMates = () => (typeof partyMembers === 'function' ? partyMembers().filter(p => !p.isMe).length : 0);
function aicFieldOn(){ const f = AIC.field; if (!f) return false; const s = sbGoal();
  if (!s || s.type !== f.boss || T > f.until){ AIC.field = null;
    if (!SB.bye){ SB.bye = true; toast(L('นักผจญภัย AI แยกย้ายกันแล้ว ขอบคุณที่ร่วมทาง', 'The AI adventurers go their way — thanks for the company')); } return false; }
  return MAP_ID === s.map && !(typeof DG !== 'undefined' && DG.active); }
function sbCall(quiet){ const s = sbGoal(); if (!s) return false; AIC.field = {boss:s.type, until:T + 20 * 60}; SB.bye = false;
  if (!quiet){ toast(L('นักผจญภัย AI 3 คนมาร่วมปาร์ตี้แล้ว ไปปราบบอสด้วยกัน!', 'Three AI adventurers join you — on to the boss!')); log(L(`ชวนนักผจญภัย AI 3 คนไปปราบ ${nm(MOB[s.type])}`, `Three AI adventurers join you against ${nm(MOB[s.type])}`), 'g'); }
  if (typeof WIN_RENDER !== 'undefined' && WIN_RENDER.quest && UIS.open.quest) try { WIN_RENDER.quest(); } catch (e) {}
  return true; }
/* the offer, once per boss, when you come near it on its map with nobody in your party */
function sbAsk(m){ const d = el('confirm'); if (!d || !d.hidden) return; SB.asked.add(m);
  d.innerHTML = `<h3>${L('บอสตัวนี้สำหรับปาร์ตี้', 'This boss is a party fight')}</h3><p>${L(`${nm(MOB[m.type])} Lv ${MOB[m.type].lvl} แข็งแกร่งเกินกว่าจะสู้ลำพัง ชวนเพื่อนมาด้วย หรือให้นักผจญภัย AI 3 คนช่วย (พวกเขาตีเฉพาะบอสนี้กับมอนที่ตีเรา แล้วแยกย้ายเมื่อบอสล้ม)`, `${nm(MOB[m.type])} Lv ${MOB[m.type].lvl} is too strong to face alone. Bring friends, or let three AI adventurers help (they fight only this boss and what attacks you, and leave once it falls)`)}</p>
    <div class="row"><button class="btn" data-sb="no">${L('สู้เอง', 'Fight alone')}</button><button class="btn gold" data-sb="ai">${L('ชวนนักผจญภัย AI 3 คน', 'Bring 3 AI adventurers')}</button></div>`;
  d.hidden = false; d.onclick = e => { const b = e.target.closest('[data-sb]'); if (!b) return; d.hidden = true; d.onclick = null; if (b.dataset.sb === 'ai') sbCall(); };
  const ai = d.querySelector('[data-sb="ai"]'); if (ai) ai.focus(); }
EV.on('tick', dt => { if ((SB.t += dt) < .5) return; SB.t = 0; if (!S || !S.lvl || P.dead || AIC.field) return;
  const s = sbGoal(); if (!s || MAP_ID !== s.map || sbMates()) return;
  const m = mobs.find(x => !x.dead && !x.vanish && x.type === s.type && x.def && x.def.boss); if (!m || SB.asked.has(m) || Math.hypot(m.x - P.x, m.y - P.y) > 650) return;
  if (BOT.on && typeof aqOn === 'function' && aqOn()){ SB.asked.add(m); sbCall(); return; }   // Auto quest: it calls them itself
  sbAsk(m); });
/* the quest window and the chapter card: name the boss, its level, and the party button */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-sbcall]'); if (!b) return; if (sbCall()) b.disabled = true; });
function sbHint(Q){ const g = Q && Q.goals.find(x => x.k === 'boss'); if (!g || !MOB[g.t]) return '';
  return L(` · บอส ${nm(MOB[g.t])} Lv ${MOB[g.t].lvl} สู้เป็นปาร์ตี้ (ชวนนักผจญภัย AI ได้)`, ` · boss ${nm(MOB[g.t])} Lv ${MOB[g.t].lvl}, a party fight (AI adventurers can join)`); }
const sbButton = () => { const s = sbGoal(); if (!s || sbMates()) return '';
  return AIC.field ? `<p class="hint">${L('✓ นักผจญภัย AI 3 คนอยู่ในปาร์ตี้ของคุณ (ที่แผนที่ของบอส)', '✓ Three AI adventurers are in your party (on the boss\'s map)')}</p>`
    : `<button class="btn gold sm" data-sbcall="1">${L(`ชวนนักผจญภัย AI 3 คนไปปราบ ${nm(MOB[s.type])}`, `Bring 3 AI adventurers against ${nm(MOB[s.type])}`)}</button>`; };
if (typeof renderQuestLog === 'function'){ const _rq = renderQuestLog; renderQuestLog = function(){ const r = _rq.apply(this, arguments);
    const pane = el('pane-quest'), box = pane && pane.querySelector('.qbox'), h = sbButton(); if (box && h && !box.querySelector('[data-sbcall], .sbok')){ const d = document.createElement('div'); d.className = 'sbok'; d.style.marginTop = '6px'; d.innerHTML = h; box.appendChild(d); } return r; }; }
if (typeof questDialog === 'function'){ const _qd = questDialog; questDialog = function(n){ const r = _qd.apply(this, arguments);
    try { const s = sbGoal(); if (r && typeof r.h === 'string' && s && s.Q.giver === n.id && s.Q.map === MAP_ID){ const b = sbButton(); if (b) r.h += `<div class="qbox">${b}</div>`; } } catch (e) {}
    try { const N = curMain(); if (r && typeof r === 'object' && typeof r.h === 'string' && N) r.h = r.h.replace(`${L(`แนะนำ Lv ${N.lv}+`, `Suggested Lv ${N.lv}+`)}</p>`, `${L(`แนะนำ Lv ${N.lv}+`, `Suggested Lv ${N.lv}+`)}${sbHint(N)}</p>`); } catch (e) {}
    return r; }; }
