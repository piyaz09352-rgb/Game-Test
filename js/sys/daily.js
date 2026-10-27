/* VAYRATHEN — js/sys/daily.js
   Daily tasks (ภารกิจรายวัน): three tasks a day picked for your level, new every day at 00:00 Thailand time.
   Each pays Vayra Coins, Bia and EXP; clearing all three pays a bonus and extends your daily streak
   (account-wide): 3 days → Rainbow Headband, 7 days → Diligent Adventurer outfit (via the achievement).
   Shown at the top of the Quest window (J) and as one line on the quest card. */
'use strict';

/* task kinds: k, text, goal n (by level), how it counts */
const DT_KIND = {
  killAny:{n:L0 => 40, t:(d) => L(`ล้มมอนที่เลเวลใกล้คุณ (±12) ${d.n} ตัว`, `Defeat ${d.n} monsters near your level (±12)`)},
  killT:{n:() => 20, t:(d) => L(`ล่า${MOB[d.t].name} ${d.n} ตัว (${MAPS[d.m].name})`, `Hunt ${d.n} ${MOB[d.t].en} (${MAPS[d.m].en})`)},
  elem:{n:() => 30, t:(d) => L(`ล้มมอนธาตุ${elemName(d.e)} ${d.n} ตัว`, `Defeat ${d.n} ${elemName(d.e)} monsters`)},
  boss:{n:() => 1, t:(d) => L('ล้มบอสแคว้นใดก็ได้ 1 ตัว', 'Defeat any region boss')},
  skill:{n:() => 40, t:(d) => L(`ใช้สกิล ${d.n} ครั้ง`, `Use skills ${d.n} times`)},
  pickup:{n:() => 25, t:(d) => L(`เก็บของที่ดรอป ${d.n} ชิ้น`, `Pick up ${d.n} drops`)},
  craft:{n:() => 1, t:(d) => L('หลอมของที่ช่างหลอม 1 ครั้ง', 'Craft once at the smithy')},
  potion:{n:() => 10, t:(d) => L(`ใช้ยา ${d.n} ขวด`, `Drink ${d.n} potions`)}
};
function dailyGen(){
  const day = dayKey(); let s = hashS(`${day}|${S.name || ''}|${S.job}`) || 1; const r = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
  // maps that suit this level, for the hunt-a-species and element tasks
  const fit = MAPS.filter(m => S.lvl >= m.lv[0] - 3 && S.lvl <= m.lv[1] + 8); const near = fit.length ? fit : [MAPS.reduce((a, b) => Math.abs(b.lv[0] - S.lvl) < Math.abs(a.lv[0] - S.lvl) ? b : a)];
  const pool = ['killAny', 'killT', 'elem', 'skill', 'pickup', 'potion', ...(S.lvl >= 8 ? ['boss', 'boss'] : []), 'craft'];
  const out = [], used = new Set();
  while (out.length < 3){ const k = pool[Math.floor(r() * pool.length)]; if (used.has(k) || (k === 'killT' && used.has('elem')) || (k === 'elem' && used.has('killT'))) continue; used.add(k);
    const d = {k, have:0, done:false, claimed:false};
    if (k === 'killT' || k === 'elem'){ const m = near[Math.floor(r() * near.length)], mobs = m.mobs.filter(t => MOB[t] && !MOB[t].night); d.m = m.id; d.t = mobs[Math.floor(r() * mobs.length)] || m.mobs[0]; d.e = MOB[d.t].elem || 'neutral'; if (k === 'elem') delete d.t; }
    d.n = DT_KIND[k].n(S.lvl); out.push(d); }
  S.daily = {day, tasks:out, bonus:false}; dirty = true;
}
function dailyState(){ if (!S.daily || S.daily.day !== dayKey()) dailyGen(); return S.daily; }
const dtReward = () => ({coin:3, bia:200 + S.lvl * 120, exp:Math.round(nextBase(Math.max(1, S.lvl)) * .12)});
function dailyTick(k, info){
  if (!S || !S.lvl) return; const D = dailyState(); let ch = false;
  for (const d of D.tasks){ if (d.done) continue;
    let hit = false;
    if (d.k === k){ if (k === 'killT') hit = info && info.type === d.t; else if (k === 'elem') hit = info && (info.def.elem || 'neutral') === d.e; else if (k === 'killAny') hit = info && Math.abs(info.def.lvl - S.lvl) <= 12; else if (k === 'boss') hit = info && info.def.boss; else hit = true; }
    if (k === 'kill' && ['killT', 'elem', 'killAny', 'boss'].includes(d.k)) hit = d.k === 'killT' ? info.type === d.t : d.k === 'elem' ? (info.def.elem || 'neutral') === d.e : d.k === 'boss' ? !!info.def.boss : Math.abs(info.def.lvl - S.lvl) <= 12;
    if (!hit) continue; d.have = Math.min(d.n, d.have + 1); ch = true;
    if (d.have >= d.n){ d.done = true; toast(L('ภารกิจรายวันสำเร็จ! รับรางวัลในหน้าต่างเควสต์ (J)', 'Daily task done! Claim it in the Quest window (J)')); SFX.play('daily'); }
  }
  if (ch){ reWin('quest'); dirty = true; }
}
EV.on('kill', m => dailyTick('kill', m)); EV.on('skill', () => dailyTick('skill')); EV.on('pickup', () => dailyTick('pickup'));
EV.on('craft', () => dailyTick('craft')); EV.on('potion', () => dailyTick('potion'));
function dailyClaim(i){
  const D = dailyState(), d = D.tasks[i]; if (!d || !d.done || d.claimed) return;
  const r = dtReward(); d.claimed = true; S.bia += r.bia; gainExp(r.exp, Math.round(r.exp * .4)); coinAdd(r.coin, L('ภารกิจรายวัน', 'daily'));
  bump('dailies'); EV.emit('daily', d); VFX.play('coins', {x:P.x, y:P.y - 30});
  if (D.tasks.every(t => t.claimed) && !D.bonus){ D.bonus = true; coinAdd(5, L('ครบทั้ง 3 ภารกิจ', 'all three dailies')); S.bia += r.bia * 2;
    const st = ACC.streak = ACC.streak || {day:0, n:0, best:0}; st.n = st.day === D.day - 1 ? st.n + 1 : st.day === D.day ? st.n : 1; st.day = D.day; st.best = Math.max(st.best || 0, st.n); accSave(true);
    banner(L(`ภารกิจรายวันครบ! ทำต่อเนื่อง ${st.n} วัน`, `All dailies done! ${st.n}-day streak`)); if (st.n >= 3) cosGrant('hc_headset'); EV.emit('daily', null); }
  dirty = true; save(); reWin('quest');
}
function dailyHTML(){
  const D = dailyState(), r = dtReward(), st = ACC.streak || {n:0}, c = thaiClock(), left = (23 - c.h) + L(' ชม. ', 'h ') + (59 - c.m) + L(' นาที', 'm');
  return `<div class="dailyw"><div class="dailyh"><b>${L('ภารกิจรายวัน', 'Daily tasks')}</b><span>${L('ต่อเนื่อง', 'Streak')} ${st.day === D.day || st.day === D.day - 1 ? st.n : 0} ${L('วัน', 'd')} · ${L('รีเซ็ตใน', 'resets in')} ${left}</span></div>
    ${D.tasks.map((d, i) => `<div class="dtask${d.claimed ? ' claimed' : d.done ? ' done' : ''}"><i class="dtic">${d.claimed ? '✓' : i + 1}</i><div class="dtm"><b>${DT_KIND[d.k].t(d)}</b><div class="achbar"><i style="width:${d.have / d.n * 100}%"></i><span>${d.have}/${d.n}</span></div></div>
      <div class="dtr"><small>◈ ${r.coin} · ${fmtN(r.bia)} ${CUR()}</small>${d.claimed ? `<span class="ct">${L('รับแล้ว', 'Claimed')}</span>` : `<button class="btn sm${d.done ? ' gold' : ''}" data-dclaim="${i}" ${d.done ? '' : 'disabled'}>${L('รับรางวัล', 'Claim')}</button>`}</div></div>`).join('')}
    <p class="hint">${D.bonus ? L('รับโบนัสครบ 3 ภารกิจของวันนี้แล้ว · พรุ่งนี้มาใหม่นะ', "Today's bonus collected · see you tomorrow") : L(`ครบทั้ง 3 ได้โบนัส ◈ 5 และ ${fmtN(r.bia * 2)} เบี้ย · ต่อเนื่อง 3 วันได้คาดผมสายรุ้ง · 7 วันได้ชุดนักผจญภัยขยัน`, `Clear all 3 for ◈ 5 and ${fmtN(r.bia * 2)} Bia · 3-day streak: Rainbow Headband · 7 days: Diligent Adventurer outfit`)}</p></div>`;
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-dclaim]'); if (b && !b.disabled) dailyClaim(+b.dataset.dclaim); });
/* the Quest window and the quest card get the daily section */
{ const _rq = renderQuestLog; renderQuestLog = function(){ _rq(); const pane = el('pane-quest'); if (pane){ pane.insertAdjacentHTML('afterbegin', dailyHTML() + (typeof sideHTML === 'function' ? sideHTML() : '')); } }; }
WIN_RENDER.quest = () => renderQuestLog();
{ const _qt = questTracker; questTracker = function(){ let h = _qt(); try { const D = dailyState(), n = D.tasks.filter(t => t.done).length, rdy = D.tasks.filter(t => t.done && !t.claimed).length;
    h += `${h ? '<br>' : ''}<span class="${n === 3 ? 'qok' : ''}">◈ ${L('รายวัน', 'Daily')} ${n}/3${rdy ? ` · ${L('รับรางวัลได้', 'claim')} (J)` : ''}</span>`; if (typeof sideTrack === 'function') h += sideTrack(); } catch (e) {} return h; }; }
