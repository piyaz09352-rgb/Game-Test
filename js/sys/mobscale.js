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
/* (v346) frames with room for the big poses: a boss breath, a lobster's roar, a whale's death roll, a quetzal vanishing
   threw a limb, tail or wing past the edge of the picture (found by tests/mobrender346, every frame of every action, 5 directions).
   Only the picture's frame grows (the body keeps its size and feet stay where they were). */
{
  const ROOM = {goldshrimp:1.1, emeraldcrab:1.1, abyssturtle:1.1, fallenstar:1.2, icecrab:1.1, rainbowfall_shrimp:1.1, sulphur_serpent:1.1,
    milkyway_crab:1.1, gempalace_cat:1.1, gempalace_starwisp:1.2, suncourt_starwisp:1.2, greenstego:1.1, ankylosaurus:1.1, skyquetzal:1.45,
    abyssshark:1.45, swordfish:1.2, abyssoctopus:1.1, armorlobster:1.6, skywhale:1.6, hollowarmor:1.1, desertcamel:1.2, andamancrab:1.2,
    nagaking:1.1, iceturtlelord:1.2, firefly_lord:1.2, snowpine_lord:1.3, hexspire_lord:1.1, wyvernqueen:1.2, elderdragon:1.1, dragondemonking:1.1};
  for (const k in ROOM){ const mb = SPR.MOBS[k]; if (mb && !mb._room){ mb.fs = Math.ceil(mb.fs * ROOM[k]); mb._room = ROOM[k]; } }
}
