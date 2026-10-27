/* VAYRATHEN — js/sys/herbfx.js — looks for the Herbalist / Royal Physician damage skills (data/jobs.js)
   built from the effects VFX already has, so no new drawing code:
     herbBlaze (ควันเผาว่านไล่ผี) · a green smoke cloud with embers bursting in it on every hit
     herbStorm (พายุโอสถทิพย์)   · smoke under the target and a ring of holy light on every hit */
'use strict';

{ const _play = VFX.play;
  const HERB_FX = {
    herbBlaze(o){ _play('smokeCloud', o); const n = o.hits || 3, ev = o.every || .4;
      for (let i = 0; i < n; i++) later(.05 + i * ev, () => { for (let k = 0; k < 2; k++) _play('fireHit', {x:o.x + rand(-o.r, o.r) * .55, y:o.y + rand(-o.r, o.r) * .3}); }); },
    herbStorm(o){ _play('smokeCloud', o); const n = o.hits || 4, ev = o.every || .3;
      for (let i = 0; i < n; i++) later(.05 + i * ev, () => { _play('spiritburst', {x:o.x, y:o.y, r:o.r * (.6 + i * .12)}); _play('holyHit', {x:o.x + rand(-o.r, o.r) * .4, y:o.y - 10}); }); }
  };
  VFX.play = function(key, o){ return HERB_FX[key] ? HERB_FX[key](o || {}) : _play(key, o); };
}
