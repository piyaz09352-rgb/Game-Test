/* VAYRATHEN — js/sys/petnet.js — (v136) other players see the monster you caught
   A caught pet (S.pet) followed its owner only on the owner's own screen: nothing about it was sent online, so to
   everyone else the owner walked alone. (Fashion pets were shared; caught ones were not.) Now the type of the pet you
   have out is part of your presence (field cp), and every other player draws it trotting after you, on the far side
   from where a fashion pet walks, at the same size it has on your screen. Nothing else about it is sent. */
'use strict';

if (typeof gfxPres === 'function'){ const _g = gfxPres;
  gfxPres = function(){ const r = _g.apply(this, arguments);
    return Object.assign(r, {cp:S && S.pet && MOB[S.pet] && !P.dead ? S.pet : null}); }; }

/* their pets follow them */
EV.on('tick', dt => {
  if (typeof NET === 'undefined' || !NET.ghosts) return;
  for (const gh of NET.ghosts.values()){ const q = gh.q || {}, t = q.cp;
    if (!t || !MOB[t] || !SHEETS || !SHEETS[t]){ gh.cp = null; continue; }
    if (!gh.cp || gh.cp.type !== t) gh.cp = {type:t, x:gh.x + 30, y:gh.y + 10, dir:0, t:0, moving:false};
    const o = gh.cp; o.t += dt;
    const tx = gh.x + 34, ty = gh.y + 12;   // the other side from a fashion pet (cosx.js puts those at x − 44)
    if (typeof petStep === 'function') petStep(o, tx, ty, dt);
    else { const d = Math.hypot(tx - o.x, ty - o.y); o.moving = d > 6; if (o.moving){ const k = Math.min(1, dt * 4); o.x += (tx - o.x) * k; o.y += (ty - o.y) * k; } }
  }
});
/* drawn in depth order with everything else */
if (typeof LIVE !== 'undefined' && LIVE.ents){ const _ents = LIVE.ents;
  LIVE.ents = function(list, g){ _ents.apply(this, arguments);
    if (typeof NET === 'undefined' || !NET.ghosts) return;
    for (const gh of NET.ghosts.values()){ const o = gh.cp; if (!o || !SHEETS[o.type]) continue;
      const x = o.x - cam.x, y = o.y - cam.y; if (x < -60 || x > VW + 60 || y < -80 || y > VH + 40) continue;
      list.push({y:o.y, f:() => { shadowW(g, x, y, (MOB[o.type].r || 12) * .8); SPR.draw(g, SHEETS[o.type], o.moving ? 'walk' : 'idle', o.dir || 0, o.t, x, y); }}); }
  }; }
