/* VAYRATHEN — js/sys/humscale.js — (v166) one scale for heroes and humanoid monsters
   Since v164 the humanoid monsters wear the heroes' body, but they kept the sizes picked for the old lump models, so
   a little imp stood a head taller than a hero and a region lord on the hero body was drawn 4½ to 6 heroes tall.
   Sizes are now measured against the hero (about 41 units, a 1.7 m person):
   · imps, kappa, monkeys, small ghosts ......... about 0.85 of a hero
   · soldiers, warriors, shamans, spirits ....... about a hero (0.95 to 1.15)
   · yaksha, ogres, asura, giants, yeti .......... 1.4 to 1.7 heroes
   · humanoid bosses ............................ 1.9 to 3 heroes, from the legend size in bossnature.js (a lord about 2,
                                                   the temple guardian giants, Thotsakan and Vessavana the largest)
   The order of sizes inside each group is kept (the old scale is mapped, not replaced), the plate height follows.
   Bosses of other shapes (crocodiles, elephants, nagas, dragons) already had their sizes set from life (v117). */
'use strict';

const MSCL = {hero:41, done:0};
function humScaleApply(){
  if (MSCL.done || typeof SPR === 'undefined' || !SPR.MOBS || typeof MOB === 'undefined') return; MSCL.done = 1;
  for (const k in SPR.MOBS){ const mb = SPR.MOBS[k], d = MOB[k]; if (!mb || !mb.human || !d) continue;
    const s = mb.scale || 1, bs = mb.human.bodyScale || 1; let s2;
    if (d.boss){
      const legend = (typeof BOSS_SIZE !== 'undefined' && BOSS_SIZE[k]) || (d.lv >= 150 ? 2.8 : d.lv >= 80 ? 2.4 : 2.0);
      const heroes = 2.0 + (legend - 2.0) * .75;          // how many heroes tall it stands
      s2 = heroes / ((d.bsz || 1.9) * bs);                // render.js draws a boss d.bsz times its sprite
    } else s2 = .84 * Math.pow(s / 1.27, 1.25) / Math.sqrt(bs);
    s2 = +s2.toFixed(3); if (Math.abs(s2 - s) < .01) continue;
    mb.scale = s2;
    if (typeof MOB_H0 !== 'undefined') MOB_H0[k] = Math.round(MSCL.hero * s2 * bs * (d.boss ? d.bsz || 1.9 : 1) * 1.04);   // the plate sits just over the head
    if (!d.boss && d.r) d.r = Math.max(8, Math.round(d.r * Math.sqrt(s2 / s)));   // body width follows a little
  }
}
humScaleApply();
