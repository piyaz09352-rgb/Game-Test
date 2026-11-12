/* VAYRATHEN — js/world/npcclear222.js — (v222) no NPC hidden behind a tree or a building
   The owner found the post clerk standing under a tree's canopy, hard to see. A check of every map
   (tools/npc-occlusion.js) found story NPCs half hidden by pines and world trees too. Now, whenever a map's NPCs are
   placed (and whenever one is added or moves, e.g. a story chapter's NPC turning up):
   · a DECORATION (tree, bush, rock, log seat, jar…) whose picture touches an NPC's figure is taken away, in front of
     the NPC or behind it (a canopy round its head makes it just as hard to see);
   · a BUILDING is kept: if one is drawn over an NPC (in front of it), the NPC steps forward to the nearest clear spot.
   A shopkeeper standing in front of their own shop is fine: nothing covers them. */
'use strict';

const NC_STRUCT = new Set(['vshop', 'tbld', 'tland', 'sala', 'armytent', 'house', 'shrine', 'temple', 'stupa', 'well', 'portal', 'gatehouse', 'tower', 'hut', 'pagoda', 'castle', 'wall', 'ruin', 'statue', 'lamp', 'lotusbowl', 'stall']);
const NC = {sig:'', t:0};
// how much of an NPC's figure (26×52 world units above its feet) the opaque pixels of one prop cover, 0–1
function ncCover(n, p){
  const im = propImg(p.type, p.variant); if (!im || !im.img) return 0;
  const bx0 = n.x - 13, bx1 = n.x + 13, by0 = n.y - 52, by1 = n.y + 2, px0 = p.x - im.ax, py0 = p.y - im.ay;
  if (bx1 < px0 || bx0 > px0 + im.w || by1 < py0 || by0 > py0 + im.h) return 0;
  const k = im.img.width / im.w; let a = im._ncA;
  if (!a){ try { a = im._ncA = im.img.getContext('2d').getImageData(0, 0, im.img.width, im.img.height); } catch (e) { return 0; } NC.used.push(im); }
  let hit = 0, all = 0;
  for (let y = by0; y < by1; y += 2) for (let x = bx0; x < bx1; x += 2){ all++; const lx = x - px0, ly = y - py0; if (lx < 0 || ly < 0 || lx >= im.w || ly >= im.h) continue;
    if (a.data[(Math.floor(ly * k) * a.width + Math.floor(lx * k)) * 4 + 3] > 120) hit++; }
  return hit / all;
}
function ncRemove(p){ const i = PROPS.indexOf(p); if (i >= 0) PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); }
function npcClear(){
  NC.used = [];
  try {
    for (const n of NPCS){
      const near = PROPS.filter(p => Math.abs(p.x - n.x) < 280 && Math.abs(p.y - n.y) < 420);
      for (const p of near){ if (NC_STRUCT.has(p.type)) continue; if (ncCover(n, p) > .04) ncRemove(p); }
      // a building drawn over the NPC: step forward (down the screen, in front of it) to a clear spot
      const over = () => PROPS.some(p => NC_STRUCT.has(p.type) && p.y > n.y + 1 && Math.abs(p.x - n.x) < 280 && ncCover(n, p) > .08);
      if (!(typeof ARN_L !== 'undefined' && ARN_L.has(n)) && over()){ const x0 = n.x, y0 = n.y;   // (v269) a keeper on a stroll is not pushed: their stroll spots are checked (town269.js) let ok = false;
        for (let t = 1; t < 40 && !ok; t++){ const a = t * 2.4, d = 10 + t * 7; n.x = Math.round(x0 + Math.cos(a) * d * .8); n.y = Math.round(y0 + Math.abs(Math.sin(a)) * d + 8);
          ok = walkable(n.x, n.y, 10) && !NPCS.some(m => m !== n && Math.hypot(m.x - n.x, m.y - n.y) < 44) && !over(); }
        if (!ok){ n.x = x0; n.y = y0; } }
    }
  } finally { for (const im of NC.used) delete im._ncA; NC.used = []; }   // the pixel copies are only needed for this pass
}
// (v269) a strolling Aren keeper counts at their place, not mid-stroll: re-checking on every step pushed them about
const ncAt = n => { const s = typeof ARN_L !== 'undefined' && ARN_L.get(n); return s ? [s.hx, s.hy] : [n.x, n.y]; };
const ncSig = () => MAP_ID + ':' + NPCS.map(n => { const [x, y] = ncAt(n); return `${n.id}@${Math.round(x)},${Math.round(y)}`; }).join('|');
{ const _lm = loadMap; loadMap = function(){ const r = _lm.apply(this, arguments); try { npcClear(); } catch (e) {} NC.sig = ncSig(); return r; }; }
// an NPC added or moved later (a story chapter, a festival): check again, at most twice a second
EV.on('tick', dt => { NC.t -= dt; if (NC.t > 0) return; NC.t = .5; const s = ncSig(); if (s === NC.sig) return; NC.sig = s; try { npcClear(); } catch (e) {} NC.sig = ncSig(); });
