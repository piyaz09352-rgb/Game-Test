/* VAYRATHEN — js/sys/statfix.js — keeps every hero inside the stat point budget (see data/items.js)
   (v241) Once per character, every hero is put on the new curve: over the budget or over the cap → every point back
   to place again for free; under it → the missing points are added. */
'use strict';
function statBudget(lv){ let t = 48; for (let l = 2; l <= lv; l++) t += statGain(l); return t; }
function statSpent(st){ let t = 0; for (const k in st){ for (let x = 1; x < (st[k] | 0); x++) t += statCost(x); } return t; }
EV.on('tick', () => {
  if (PAUSED || !S || !S.lvl || S.spv === 2) return; S.spv = 2;
  // (v241) the new point curve and the cap that grows with your level: a hero with stats above the cap or more points
  // than the new budget gets every point back to place again (free); one with fewer gets the missing points
  const budget = statBudget(S.lvl), cap = STAT_CAP(S.lvl), have = S.statPts + statSpent(S.stats);
  const over = Object.keys(S.stats).some(k => (S.stats[k] | 0) > cap) || have > budget;
  if (over){ for (const k in S.stats) S.stats[k] = 1; S.statPts = budget; }
  else if (have < budget) S.statPts += budget - have;
  else return;
  derive(); if (DER){ S.hp = Math.min(S.hp, DER.maxhp); S.sp = Math.min(S.sp, DER.maxsp); } dirty = true; save();
  log(over ? L('ระบบแต้มสเตตัสใหม่: คืนแต้มทั้งหมดให้จัดใหม่ฟรี', 'New stat point system: every point is back to place again, free')
           : L(`ระบบแต้มสเตตัสใหม่: ได้แต้มเพิ่ม ${budget - have} แต้ม`, `New stat point system: +${budget - have} stat points`), 'g');
  if (over && typeof toast === 'function') toast(L('ระบบแต้มสเตตัสใหม่ · คืนแต้มให้จัดใหม่ฟรี', 'New stat points · placed again for free'));
});
