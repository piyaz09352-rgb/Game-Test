/* VAYRATHEN — js/sys/mobscale.js — monsters drawn at a size that fits what they are (v27)
   Players found the monsters too small next to the heroes. Every monster is now drawn bigger by its size class, and
   bosses get an extra step so they look like bosses:   small ×1.15 · medium ×1.3 · large ×1.45 · boss ×1.3 (on top of
   their own boss scale). Only the picture changes: hit boxes, reach and speed stay as they were. The frame each sprite
   is drawn into grows with it, so nothing gets cut off. Loaded after render.js (it also scales the name-tag heights). */
'use strict';
{
  const K = {s:1.15, m:1.3, l:1.45};
  for (const k in SPR.MOBS){ const mb = SPR.MOBS[k], d = MOB[k]; if (!mb || mb._sk || !d) continue;
    const f = d.boss ? 1.3 : K[d.size] || 1.3;
    mb.scale = (mb.scale || 1) * f; mb.fs = Math.ceil((mb.fs || 64) * Math.min(1.5, f)); mb._sk = f;
    if (MOB_H0[k] != null) MOB_H0[k] = Math.round(MOB_H0[k] * f); }
}
