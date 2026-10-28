/* VAYRATHEN — js/sys/twohand2.js — (v175) two-handed weapons strike twice
   A normal attack with a two-handed weapon is two blows: the second follows the first a moment later (0.18 s, or a
   little under half the attack interval when attacks are very fast), with its own swing, its own sound and its own
   hit. Each blow deals half, so the damage over time stays where the style calibration put it.
   Two-handed here: greatswords, two-handed axes, twin daggers and the katana, knuckles / gloves / claws. Staves and rods
   (a caster's orb stays one orb) and bows (one arrow) are left as they are (v176). */
'use strict';

const BA2 = {half:0, busy:false};
/* the weapon in hand is two-handed (and not a staff) */
function ba2On(){
  if (!S || !JOBS[S.job]) return false;
  const J = JOBS[S.job], wt = J.weapon && J.weapon.type; if (J.caster || wt === 'staff' || wt === 'bow' || J.ranged) return false;   // (v176) bows shoot one arrow
  const id = S.gear && S.gear.weapon, it = id && ITEMS[id];
  if (it && it.st && it.st.wtype === wt) return it.st.hands === '2h';
  // no weapon item of the class worn: the class's own weapon decides
  if (wt === 'fist') return true;
  if (J.weapon.hands === '2h') return true;
  const c = SPR.CHARS[S.job]; return !!(c && (c.twoHand || (wt === 'dagger' && c.twin)));
}
/* a blow made while BA2.half is set deals half */
{ const _pd = physDamage; physDamage = function(m, mult, elem){ if (BA2.half > 0) mult = (mult ?? 1) * .5; return _pd.call(this, m, mult, elem); }; }
const ba2Halve = fn => function(){ BA2.half++; try { return fn.apply(this, arguments); } finally { BA2.half--; } };
function ba2Blow(ba, t){
  const n0 = typeof projs !== 'undefined' ? projs.length : 0;
  BA2.half++; try { ba(t); } finally { BA2.half--; }
  if (typeof projs !== 'undefined') for (let i = n0; i < projs.length; i++){ const q = projs[i]; if (q && typeof q.hit === 'function' && !q._ba2){ q._ba2 = 1; q.hit = ba2Halve(q.hit); } }   // an arrow lands later: it is still half
}
{ const _ba = basicAttack;
  basicAttack = function(t){
    if (BA2.busy || !t || !t.def || !ba2On()) return _ba.apply(this, arguments);
    ba2Blow(_ba, t);
    const gap = Math.min(.18, Math.max(.08, ((DER && DER.interval) || 1) * .45));
    later(gap, () => { if (!t || t.dead || P.dead || !S || !ba2On() || P.cast) return;
      BA2.busy = true; try { ba2Blow(_ba, t); } finally { BA2.busy = false; } });
  };
}
