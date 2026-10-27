/* VAYRATHEN — js/sys/weekly.js — (v85) weekly quests (ภารกิจรายสัปดาห์)
   Four bigger tasks a week, new every Monday 00:00 Thailand time, picked for your character. Each pays ◈ 10, Bia
   and EXP; clearing all four opens the weekly chest: ◈ 20, a Rare-or-better piece of gear for your level and a
   chance at a costume you do not own yet. Shown under the daily tasks in the Quest window (J) and on the quest card.
   Counting runs on events that already fire (kill, skill, daily, dungeon, wboss, pvp, craft): no per-frame work. */
'use strict';

const WK_KIND = {
  killAny:{n:() => 600, t:d => L(`ล้มมอนที่เลเวลใกล้คุณ (±12) ${d.n} ตัว`, `Defeat ${d.n} monsters near your level (±12)`)},
  boss:{n:() => 6, t:d => L(`ล้มบอสแคว้น ${d.n} ตัว`, `Defeat ${d.n} region bosses`)},
  daily:{n:() => 12, t:d => L(`รับรางวัลภารกิจรายวัน ${d.n} ครั้ง`, `Claim ${d.n} daily tasks`)},
  dungeon:{n:() => 3, t:d => L(`ผ่านดันเจียน ${d.n} ครั้ง`, `Clear ${d.n} dungeons`)},
  wboss:{n:() => 1, t:d => L('ช่วยล้มบอสโลกราหู 1 ครั้ง', 'Help defeat Rahu, the world boss')},
  skill:{n:() => 500, t:d => L(`ใช้สกิล ${d.n} ครั้ง`, `Use skills ${d.n} times`)},
  craft:{n:() => 4, t:d => L(`หลอมของ ${d.n} ครั้ง`, `Craft ${d.n} times`)},
  pvp:{n:() => 3, t:d => L(`ชนะการดวล ${d.n} ครั้ง`, `Win ${d.n} duels`)}
};
const weekKey = () => Math.floor((dayKey() + 3) / 7);   // day 0 was a Thursday: weeks turn over on Monday
function weeklyGen(){
  const wk = weekKey(); let s = hashS(`w${wk}|${S.name || ''}|${S.job}`) || 1; const r = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
  const pool = ['killAny', 'daily', 'skill', 'craft', 'wboss', 'pvp', ...(S.lvl >= 8 ? ['boss', 'boss'] : []), ...(S.lvl >= 15 ? ['dungeon', 'dungeon'] : [])];
  const out = [], used = new Set(['killAny']); out.push({k:'killAny', n:WK_KIND.killAny.n(), have:0, done:false, claimed:false});   // always one hunting task
  for (let g = 0; out.length < 4 && g < 200; g++){ const k = pool[Math.floor(r() * pool.length)]; if (used.has(k)) continue; used.add(k);
    out.push({k, n:WK_KIND[k].n(), have:0, done:false, claimed:false}); }
  S.weekly = {wk, tasks:out, chest:false}; dirty = true;
}
function weeklyState(){ if (!S.weekly || S.weekly.wk !== weekKey()) weeklyGen(); return S.weekly; }
const wkReward = () => ({coin:10, bia:1500 + S.lvl * 600, exp:Math.round(nextBase(Math.max(1, S.lvl)) * .5)});
function weeklyTick(k, info){
  if (!S || !S.lvl) return; const D = weeklyState(); let ch = false;
  for (const d of D.tasks){ if (d.done) continue;
    let hit = d.k === k;
    if (k === 'kill') hit = d.k === 'killAny' ? info && info.def && Math.abs(info.def.lvl - S.lvl) <= 12 && !info.pvp : d.k === 'boss' ? info && info.def && info.def.boss && !info.wb : false;
    if (!hit) continue; d.have = Math.min(d.n, d.have + 1); ch = true;
    if (d.have >= d.n){ d.done = true; toast(L('ภารกิจรายสัปดาห์สำเร็จ! รับรางวัลในหน้าต่างเควสต์ (J)', 'Weekly task done! Claim it in the Quest window (J)')); SFX.play('daily'); }
  }
  if (ch){ dirty = true; if (winOpen('quest')) WK.re = true; }
}
const WK = {re:false, reT:0};
EV.on('tick', dt => { if (WK.re && (WK.reT -= dt) <= 0){ WK.re = false; WK.reT = 1; reWin('quest'); } });   // at most one window redraw a second while killing fast
EV.on('kill', m => weeklyTick('kill', m)); EV.on('skill', () => weeklyTick('skill')); EV.on('craft', () => weeklyTick('craft'));
EV.on('daily', d => { if (d) weeklyTick('daily'); }); EV.on('dungeon', () => weeklyTick('dungeon')); EV.on('wboss', () => weeklyTick('wboss')); EV.on('pvp', w => { if (w) weeklyTick('pvp'); });
function weeklyChest(){
  coinAdd(20, L('หีบรายสัปดาห์', 'weekly chest')); const Lv = S.lvl;
  const pool = GEAR_LIST.filter(g => g[1] !== 'ammo' && g[4] <= Lv && g[4] >= Lv - 25 && lineOk(g[6]) && (g[1] !== 'weapon' || g[6].wtype === JOBS[S.job].weapon.type));
  if (pool.length){ const b = pool[Math.floor(Math.random() * pool.length)][0], id = makeInst(b, Math.max(1, rollRarity('boss'))); addItem(id, 1);
    log(L(`หีบรายสัปดาห์: ${nm(ITEMS[id])} (${RAR[ITEMS[id].rar].th})`, `Weekly chest: ${nm(ITEMS[id])} (${RAR[ITEMS[id].rar].en})`), 'g'); }
  const miss = Object.keys(COSTUME).filter(c => COSTUME[c].src !== 'free' && !cosOwned(c) && !COSTUME[c].gm);
  if (miss.length && Math.random() < .35) cosGrant(miss[Math.floor(Math.random() * miss.length)]);
  banner(L('🎁 เปิดหีบรายสัปดาห์แล้ว!', '🎁 Weekly chest opened!')); VFX.play('coins', {x:P.x, y:P.y - 30}); SFX.play('drop2');
}
function weeklyClaim(i){
  const D = weeklyState(), d = D.tasks[i]; if (!d || !d.done || d.claimed) return;
  const r = wkReward(); d.claimed = true; S.bia += r.bia; gainExp(r.exp, Math.round(r.exp * .4)); coinAdd(r.coin, L('ภารกิจรายสัปดาห์', 'weekly'));
  VFX.play('coins', {x:P.x, y:P.y - 30});
  if (D.tasks.every(t => t.claimed) && !D.chest){ D.chest = true; weeklyChest(); }
  dirty = true; save(); reWin('quest');
}
function weeklyHTML(){
  const D = weeklyState(), r = wkReward(), left = 7 - ((dayKey() + 3) % 7);
  return `<div class="dailyw"><div class="dailyh"><b>${L('ภารกิจรายสัปดาห์', 'Weekly tasks')}</b><span>${L(`รีเซ็ตในอีก ${left} วัน`, `Resets in ${left} d`)}</span></div>
    ${D.tasks.map((d, i) => `<div class="dtask${d.claimed ? ' claimed' : d.done ? ' done' : ''}"><i class="dtic">${d.claimed ? '✓' : i + 1}</i><div class="dtm"><b>${WK_KIND[d.k].t(d)}</b><div class="achbar"><i style="width:${d.have / d.n * 100}%"></i><span>${d.have}/${d.n}</span></div></div>
      <div class="dtr"><small>◈ ${r.coin} · ${fmtN(r.bia)} ${CUR()}</small>${d.claimed ? `<span class="ct">${L('รับแล้ว', 'Claimed')}</span>` : `<button class="btn sm${d.done ? ' gold' : ''}" data-wclaim="${i}" ${d.done ? '' : 'disabled'}>${L('รับ', 'Claim')}</button>`}</div></div>`).join('')}
    <p class="hint">${D.chest ? L('เปิดหีบของสัปดาห์นี้แล้ว · วันจันทร์มาใหม่นะ', "This week's chest is open · new tasks on Monday") : L('ครบทั้ง 4 ภารกิจ เปิดหีบรายสัปดาห์: ◈ 20 · อุปกรณ์หายากขึ้นไป · ลุ้นชุดแฟชั่นที่ยังไม่มี', 'Clear all 4 to open the weekly chest: ◈ 20 · Rare-or-better gear · a chance at a costume you lack')}</p></div>`;
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-wclaim]'); if (b && !b.disabled) weeklyClaim(+b.dataset.wclaim); });
{ const _rq = renderQuestLog; renderQuestLog = function(){ _rq(); const pane = el('pane-quest'), dw = pane && pane.querySelector('.dailyw'); if (dw) dw.insertAdjacentHTML('afterend', weeklyHTML()); else if (pane) pane.insertAdjacentHTML('afterbegin', weeklyHTML()); }; }
WIN_RENDER.quest = () => renderQuestLog();
{ const _qt = questTracker; questTracker = function(){ let h = _qt(); try { const D = weeklyState(), n = D.tasks.filter(t => t.done).length, rdy = D.tasks.filter(t => t.done && !t.claimed).length;
    h += `${h ? '<br>' : ''}<span class="${n === 4 ? 'qok' : ''}">🎁 ${L('รายสัปดาห์', 'Weekly')} ${n}/4${rdy ? ` · ${L('รับรางวัลได้', 'claim')} (J)` : ''}</span>`; } catch (e) {} return h; }; }
/* (v85) the quest window could stack its top sections twice (two renders in a row); keep one copy */
window.addEventListener('DOMContentLoaded', () => { const _rq = renderQuestLog; renderQuestLog = function(){ _rq.apply(this, arguments); const pane = el('pane-quest'); if (!pane) return;
  const top = []; for (const c of pane.children){ if (c.classList.contains('qhead')) break; top.push(c); }
  const h = top.length / 2; if (top.length % 2 === 0 && h > 0 && top.slice(0, h).every((c, i) => c.className === top[i + h].className)) top.slice(h).forEach(c => c.remove()); }; });
