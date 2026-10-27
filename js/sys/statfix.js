/* VAYRATHEN — js/sys/statfix.js — keeps every hero inside the stat point budget (see data/items.js)
   Heroes who levelled past 120 under the old rule (27+ points a level) are brought back to what their level allows:
   unspent points are trimmed first; if stats were already raised beyond it, the highest stats are lowered and the
   rest refunded, so nobody keeps more than the budget. Runs once per character. */
'use strict';
function statBudget(lv){ let t = 48; for (let l = 2; l <= lv; l++) t += statGain(l); return t; }
function statSpent(st){ let t = 0; for (const k in st){ for (let x = 1; x < (st[k] | 0); x++) t += statCost(x); } return t; }
EV.on('tick', () => {
  if (PAUSED || !S || !S.lvl || S.spv === 1) return; S.spv = 1;
  const budget = statBudget(S.lvl); let over = S.statPts + statSpent(S.stats) - budget; if (over <= 0) return;
  const cut = Math.min(over, S.statPts); S.statPts -= cut; over -= cut;
  while (over > 0){ const k = Object.keys(S.stats).sort((a, b) => S.stats[b] - S.stats[a])[0]; if (!k || S.stats[k] <= 1) break; S.stats[k]--; over -= statCost(S.stats[k]); }
  if (over < 0) S.statPts += -over;
  derive(); dirty = true; save(); log(L('ปรับ Stat Point ให้ตรงกับระบบใหม่ (ตันได้ 150 · 150 · 90 ที่ Lv 300)', 'Stat points adjusted to the new budget (150 · 150 · 90 at Lv 300)'), 'g');
});
