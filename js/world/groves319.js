/* VAYRATHEN — js/world/groves319.js — (v319) hunting maps: woods that grow like woods
   Every hunting map spread its trees evenly at random over the whole map, the same pattern everywhere (Aren looked like
   that before v317). Trees in nature stand together: groves with open glades between them, a denser wood along the
   edge of the land, a lone tree here and there. After the map's props are placed (js/world/maps.js placeBiomeProps), its
   trees are moved — the same trees, the same kinds and number — into that pattern:
     · about a third into a band of woods along the map's edges (open at the gates);
     · most of the rest into groves, each round its own centre (groves keep apart, so glades open between them);
     · a few stay where they were, as lone trees in the glades.
   Bushes, rocks, flowers and water plants stay where they were. Every rule of the old placing still holds: nothing on
   the trail, before a gate, in water, on the camp, by the lair, or on another obstacle. The same map always comes out the
   same (the map's own random sequence decides). Loaded before js/world/falls.js, so the creeks are still kept clear. */
'use strict';
const GRV = {trees:new Set(['tree', 'palm', 'pine', 'himtree', 'bamboo', 'banana', 'treefern', 'araucaria', 'deadtree', 'thorntree', 'cycad', 'willow', 'bodhi', 'rubber', 'tamarind', 'rain', 'cactus', 'mangrove', 'coconut'])};
{ const _pbp = placeBiomeProps;
  placeBiomeProps = function(B, mapId){
    const n0 = PROPS.length, r = _pbp.apply(this, arguments);
    try { grvGroves(PROPS.slice(n0).filter(p => GRV.trees.has(p.type)), mapId); } catch (e) { console.warn('groves319', e); }
    return r; }; }
function grvGroves(trees, mapId){
  if (trees.length < 16 || !MAPS[mapId] || MAPS[mapId].town) return;
  const ok = (x, y, self) => x > 50 && x < W - 50 && y > 70 && y < H - 40 && trailD(x, y) >= 46 && !GATES.some(gt => Math.hypot(gt.x - x, gt.y - y) < 170)
    && !(typeof LAIR !== 'undefined' && Math.hypot(x - LAIR.x, y - LAIR.y) < 170) && !(CAMP && Math.hypot(x - CAMP.x, (y - CAMP.y) * 1.2) < 260)
    && !obstacles.some(o => o.prop !== self && Math.hypot(o.x - x, o.y - y) < o.r + (o.water ? 22 : o.prop ? 26 : 30))
    && !(typeof WATERS !== 'undefined' && WATERS.some(w => w.k === 'pond' && ((x - w.x) / (w.rx + 14)) ** 2 + ((y - w.y) / (w.ry + 12)) ** 2 < 1));
  // grove centres: spread out, off the trail, not on the camp
  const nG = Math.max(5, Math.round(trees.length / 10)), centres = [];
  for (let t = 0; t < 600 && centres.length < nG; t++){ const x = 260 + R() * (W - 520), y = 260 + R() * (H - 520);
    if (trailD(x, y) < 120 || (CAMP && Math.hypot(x - CAMP.x, y - CAMP.y) < 420) || centres.some(c => Math.hypot(c.x - x, c.y - y) < Math.min(W, H) * .2)) continue;
    centres.push({x, y, rr:110 + R() * 70}); }
  const move = (p, x, y) => { const o = obstacles.find(q => q.prop === p); p.x = Math.round(x); p.y = Math.round(y); p.vk = undefined; if (o){ o.x = p.x; o.y = p.y; } };
  const edgeN = Math.round(trees.length * .32), lone = Math.round(trees.length * .12);
  trees.forEach((p, i) => {
    if (i >= trees.length - lone) return;                                      // a few lone trees stay in the glades
    for (let t = 0; t < 30; t++){
      let x, y;
      if (i < edgeN){ const side = Math.floor(R() * 4), d = 60 + Math.pow(R(), 1.6) * 200;   // thick at the very edge, thinning inward
        x = side === 0 ? d : side === 1 ? W - d : 60 + R() * (W - 120); y = side === 2 ? 80 + d * .9 : side === 3 ? H - d * .8 : 80 + R() * (H - 140); }
      else { if (!centres.length) return; const c = centres[i % centres.length], a = R() * Math.PI * 2, d = Math.sqrt(R()) * c.rr * (1 + R() * .35);
        x = c.x + Math.cos(a) * d; y = c.y + Math.sin(a) * d * .8; }
      if (ok(x, y, p)){ move(p, x, y); return; } }
  });
}
