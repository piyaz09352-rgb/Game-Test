/* VAYRATHEN — js/sys/aqua.js — only swimmers, waders and fliers go on the water
   Ponds, lakes, plunge pools, rivers and sea bands: a land animal or monster stops at the bank (the painted water
   reaches past the solid middle of a pond, which used to let creatures stand on its surface). Allowed on the water:
   · fish and every water-element creature (otters, crabs, sea snakes, jellyfish, mermaids, sea dragons …)
   · amphibians and waders by name (monitor lizards, water buffalo, frogs, turtles, crocodiles, leeches …)
   · fliers: birds, floating spirits and lanterns, flying insects, boat spirits riding their boats.
   Everything else is set back on the nearest bank when it would step in (spawning, wandering, chasing), and
   your caught pet waits at the bank too. Ponds were already solid for everyone. */
'use strict';

const AMPHI_RE = /water|sea|river|marsh|swamp|lake|pond|frog|toad|turtle|tortoise|crab|croc|otter|leech|eel|duck|monitor|buffalo|mudskip|shrimp|clam|squid|jelly|coral|naga|mermaid/i;
const FLY_RE = /fly|bee\b|wasp|moth|hornet|mosquito|butterfly|cicada|locust|bat\b|phantom|ghost|wraith|spirit|shade|boat/i;
const WATER_OK = {};
function canWater(type){
  if (type in WATER_OK) return WATER_OK[type];
  const d = MOB[type]; if (!d) return (WATER_OK[type] = true);
  const a = (typeof SPECIES_ARCH !== 'undefined' && SPECIES_ARCH[type]) || {lantern:'floater'}[type] || '';
  const ok = d.race === 'fish' || d.elem === 'water' || a === 'bird' || a === 'floater' || !!d.fly || AMPHI_RE.test(d.en || '') || FLY_RE.test(d.en || '') || !!d.boss;
  return (WATER_OK[type] = ok);
}
/* is (x, y) on the painted water of a pond / lake / plunge pool or a river band? Ponds are solid already, but their
   painted surface reaches past the solid core, so a creature at the edge used to stand on the water. */
function waterAt(x, y, r = 0){
  if (typeof WATERS === 'undefined') return null;
  for (const w of WATERS){ if (w.kind === 'lava') continue;
    if (w.k === 'band'){ if (y > w.y0 + 4 - r * .3 && y < w.y1 - 4 + r * .3) return w; continue; }
    const ax = w.rx + r * .55, ay = w.ry + r * .45, dx = (x - w.x) / ax, dy = (y - w.y) / ay; if (dx * dx + dy * dy < 1) return w; }
  return null;
}
const waterBandAt = (y, r) => { const w = waterAt(-1e9, y, r); return w && w.k === 'band' ? w : null; };
/* set a creature back on the nearest dry ground */
function toBank(e, r, w){
  if (w.k === 'band'){ const up = w.y0 - r - 4, dn = w.y1 + r + 4, okUp = up > 40, okDn = dn < H - 30; e.y = okUp && (!okDn || Math.abs(e.y - up) <= Math.abs(e.y - dn)) ? up : dn; return; }
  const ax = w.rx + r * .55 + 3, ay = w.ry + r * .45 + 3; let dx = (e.x - w.x) / ax, dy = (e.y - w.y) / ay, d = Math.hypot(dx, dy);
  if (d < 1e-3){ dx = 1; dy = 0; d = 1; } e.x = w.x + dx / d * ax; e.y = w.y + dy / d * ay;
}
/* spawning: never in the water */
HK.spawn.push(m => { if (!m || !m.def || canWater(m.type)) return; const w = waterAt(m.x, m.y, m.def.r); if (w){ toBank(m, m.def.r, w); m.hx = m.x; m.hy = m.y; m.tx = null; } });
/* every step: a land creature that walked in is set back on the bank; its wander target and home stay dry too */
function aquaFix(m){
  if (!m || m.dead || canWater(m.type)) return; const r = m.def.r, w = waterAt(m.x, m.y, r);
  if (m.tx != null && waterAt(m.tx, m.ty, r)) m.tx = null;
  if (waterAt(m.hx, m.hy, r)){ const h = {x:m.hx, y:m.hy}, w2 = waterAt(h.x, h.y, r); toBank(h, r, w2); m.hx = h.x; m.hy = h.y; }
  if (w) toBank(m, r, w);
}
EV.on('tick', () => { if (PAUSED || !WATERS.length) return; for (const m of mobs) aquaFix(m); });
/* the caught pet waits on the bank */
{ const _up = updPet;
  updPet = function(dt){ _up(dt); if (!S.pet || canWater(S.pet)) return; const r = (MOB[S.pet] && MOB[S.pet].r) || 10, w = waterAt(PET.x, PET.y, r); if (w) toBank(PET, r, w); };
}
