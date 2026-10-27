/* VAYRATHEN — js/sys/statup.js — hold a stat's + button to keep raising it
   Tap: +1 as before. Hold: after a short pause it keeps going, faster the longer you hold, and stops by itself
   when you run out of points or reach the cap. Works with mouse and touch; Enter/Space on the button still adds 1. */
'use strict';

const STU = {hold:null};
function statInc(k){
  if (!S || !S.stats || !(k in S.stats)) return false;
  const c = statCost(S.stats[k]);
  if (S.statPts < c || S.stats[k] >= STAT_CAP()) return false;
  S.statPts -= c; S.stats[k]++; derive(); dirty = true;
  return true;
}
const stuStop = () => { if (STU.hold){ clearTimeout(STU.hold.t); STU.hold = null; document.documentElement.classList.remove('stat-holding'); } };
document.addEventListener('pointerdown', e => {
  const b = e.target.closest && e.target.closest('button[data-stat]'); if (!b || b.disabled || e.button > 0) return;
  e.preventDefault(); stuStop();
  const k = b.dataset.stat; if (!statInc(k)) return;
  STU.hold = {k, n:0}; document.documentElement.classList.add('stat-holding');
  const rep = () => { if (!STU.hold) return; if (PAUSED || !statInc(k)){ stuStop(); return; } STU.hold.n++; STU.hold.t = setTimeout(rep, Math.max(28, 130 - STU.hold.n * 8)); };
  STU.hold.t = setTimeout(rep, 380);
}, true);
for (const ev of ['pointerup', 'pointercancel', 'blur']) addEventListener(ev, stuStop, true);
document.addEventListener('visibilitychange', stuStop);
/* the click that ends a press was already counted on pointerdown: do not add another */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button[data-stat]'); if (b && e.detail > 0){ e.preventDefault(); e.stopPropagation(); } }, true);
{
  const st = document.createElement('style');
  st.textContent = `button[data-stat]{touch-action:none;user-select:none;-webkit-user-select:none}
    html.stat-holding button[data-stat]:not(:disabled):active{transform:scale(.92);filter:brightness(1.25)}`;
  document.head.appendChild(st);
}
