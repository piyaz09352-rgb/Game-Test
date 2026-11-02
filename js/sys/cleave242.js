/* VAYRATHEN — js/sys/cleave242.js — (v242) a close-range normal attack hits everything in front of you
   The owner: one rule for every close-range weapon (sword, dagger, fists, claws, axe… no split by weapon), no damage
   cut: a normal attack also hits every other monster within your reach in front of you — straight ahead, to the left
   and to the right (the half circle you face) — each for the full hit. Bows, staffs (magic orbs) and throwing stars
   are not close range and are unchanged. Each strike that lands on your target sweeps (a double strike sweeps again). */
'use strict';
function meleeCleave(t, mul){
  const j = JOBS[S.job]; if (!t || !j || j.caster || j.ranged || (j.weapon && j.weapon.type === 'shuriken')) return;
  const fx = t.x - P.x, fy = t.y - P.y, fl = Math.hypot(fx, fy) || 1, ux = fx / fl, uy = fy / fl, reach = (DER.range || j.range || 28) + 6;
  for (const m of mobs){
    if (m === t || m.dead || m.vanish || !m.def || m.hp <= 0) continue;
    const dx = m.x - P.x, dy = m.y - P.y, d = Math.hypot(dx, dy);
    if (d > reach + (m.def.r || 12)) continue;                        // out of reach
    if (d > 4 && (dx * ux + dy * uy) / d < -.05) continue;            // behind you
    applyDamage(m, physDamage(m, mul));
    if (typeof VFX !== 'undefined') VFX.play('slashHit', {x:m.x, y:m.y - (MOB_H[m.type] || 30) * .5, small:true});
  }
}
