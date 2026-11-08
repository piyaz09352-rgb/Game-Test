/* VAYRATHEN — js/world/gateclear274.js — (v274) nothing stands in front of a gate
   The owner found a warp hidden behind trees. On every map, once its props are placed, any tree, palm, bamboo, bush or
   rock drawn over a gate (its picture overlaps the gate and it stands in front of it) is taken away. Buildings stay. */
'use strict';
const GCL_KEEP = new Set(['vshop', 'sala', 'armytent', 'house', 'shrine', 'tbld', 'tland', 'lamp', 'healerhut', 'jobtemple', 'dgngate', 'gwhall', 'pier', 'boat', 'twmonument', 'lowfence']);
function gateClear(){
  if (typeof GATES === 'undefined' || !GATES.length || typeof PROPS === 'undefined') return 0; let n = 0;
  for (const g of GATES) for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (GCL_KEEP.has(p.type)) continue;
    const im = propImg(p.type, p.variant); if (!im || !im.w) continue;
    const x0 = p.x - im.ax, y0 = p.y - im.ay, x1 = x0 + im.w, y1 = y0 + im.h;
    if (x1 < g.x - 55 || x0 > g.x + 55 || y1 < g.y - 110 || y0 > g.y + 30 || p.y < g.y - 30) continue;   // not over it, or behind it
    PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); n++; }
  return n;
}
{ let at = -1, n = 0; EV.on('map', () => { at = -1; n = 0; }); EV.on('tick', () => { if (typeof MAP_ID === 'undefined') return; if (at !== MAP_ID){ at = MAP_ID; n = 0; } if (n < 3){ n++; gateClear(); } }); }   // 'map' fires before the props are rebuilt: clear on the first ticks there (the clinic and other pictures are added then too)
