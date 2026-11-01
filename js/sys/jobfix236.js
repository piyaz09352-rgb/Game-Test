/* VAYRATHEN — js/sys/jobfix236.js — (v236) give back the class of heroes the loading race turned into villagers
   Until v236 the game could start (it only waited for the fonts) before the scripts of the newer class lines had run;
   a save read then had a class the game did not know yet, was turned into a villager («ชาวบ้าน») and saved like
   that. The hero's learned skills still say which class it was: a villager past the villager's levels who knows
   skills of another class gets the deepest class of those skills back (tier 4 › 3 › 2 › 1), once, on load. */
'use strict';
function jobFromSkills(s){
  if (!s || s.job !== 'novice' || !s.skills) return null;
  let best = null, bt = 0;
  for (const id in s.skills){ const sk = SKILLS[id]; if (!sk || !(s.skills[id] > 0)) continue; const j = sk.job; if (!j || j === 'novice' || !JOBS[j]) continue;
    const t = JOBS[j].tier || 1; if (t > bt){ bt = t; best = j; } }
  return best;
}
{ const _l = load; load = function(){ const s = _l.apply(this, arguments); const j = jobFromSkills(s);
    if (s && j){ s.job = j; s.jobFixed = 1; s.jlvl = Math.min(s.jlvl || 1, JOBS[j].jobMax || 70); } return s; }; }
{ const _c = continueGame; continueGame = function(){ const r = _c.apply(this, arguments);
    if (S && S.jobFixed === 1){ S.jobFixed = 2; derive(); save(); setTimeout(() => { if (typeof toast === 'function') toast(L(`คืนอาชีพ ${nm(JOBS[S.job])} ให้แล้ว (บั๊กตอนโหลดเกมทำให้กลายเป็นชาวบ้าน)`, `Your class ${nm(JOBS[S.job])} is back (a loading bug had made you a villager)`)); }, 1200); }
    return r; }; }
