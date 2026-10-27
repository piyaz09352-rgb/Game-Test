/* VAYRATHEN — js/sys/npcspace.js — Aren's NPCs stand apart
   Some town NPCs were placed almost on top of each other (the festival lady beside the shop, the boatman between
   the registrar and the herbalist…) so their name tags overlapped. Once every NPC has been added, any two closer
   than NPC_GAP are nudged apart, onto open ground (not into a house, the pond or water), keeping the rest still. */
'use strict';

const NPC_GAP = 110;
function npcSpread(list){
  const ok = (x, y) => (typeof walkable !== 'function' || walkable(x, y, 16)) && !(typeof GATES !== 'undefined' && GATES.some(g => Math.hypot(g.x - x, g.y - y) < 70));
  for (let pass = 0; pass < 40; pass++){
    let moved = false;
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++){
      const a = list[i], b = list[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d >= NPC_GAP) continue;
      // move the later one: try directions away from the other first, then around the circle
      const base = Math.atan2(b.y - a.y, b.x - a.x) || 0;
      for (let k = 0; k < 16; k++){ const ang = base + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * Math.PI / 8, x = Math.round(a.x + Math.cos(ang) * NPC_GAP), y = Math.round(a.y + Math.sin(ang) * NPC_GAP);
        if (!ok(x, y) || list.some(o => o !== b && o !== a && Math.hypot(o.x - x, o.y - y) < NPC_GAP * .9)) continue;
        b.x = x; b.y = y; moved = true; break; }
    }
    if (!moved) break;
  }
}
npcSpread(NPCS_HOME);
