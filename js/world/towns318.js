/* VAYRATHEN — js/world/towns318.js — (v318) the four crossroad towns laid out in balance
   After Aren (js/world/aren317.js) the owner asked for whatever was left to be done: each crossroad town was one street of
   shops in the middle of a field of 4,250 × 2,825 with a few trees thrown about it. Now each is laid out the same way,
   mirrored across both of the map's axes (the two gates lie on one axis), in its own land's plants and water:
   · a belt of woods round the map's edge, open at the two gates;
   · an avenue of trees either side of the road from the town to each gate;
   · in each quarter a pond with a natural bank (js/world/water2.js) and a grove round it;
   · pairs of the land's ornaments on the lawns near the town.
     67 the floating market (fertile): trees, frangipani, palms · a lotus pond · flower beds and bushes
     68 the desert town: palms and cacti · an oasis · jars and rocks
     69 the frost citadel: snow-laden pines (no broad-leaved trees in the snow) · a frozen pond · stupas and rocks
     70 Tavatimsa (heaven): Himmapan trees · a golden lotus pond · lotus bowls and flower beds
   A piece goes in only when all four of its mirrors can; nothing stands on the road, the gates or the town. */
'use strict';
const TW318 = {
  67:{trees:['tree', 'tree', 'frangipani', 'palm'], deco:['flowerbed', 'bush'], water:['#a8955e', '#2f6f92', '#3f8bb4', '#7fc0c8'], lotus:'#ffb4c8'},
  68:{trees:['palm', 'palm', 'cactus'], deco:['jar', 'rock'], water:['#e0c88a', '#1f7a8a', '#3aa0a8', '#8fdcd0'], lotus:null},
  69:{trees:['pine'], snow:true, deco:['stupa', 'rock'], water:['#d8e4ec', '#6f9ab8', '#9fc4dc', '#e4f4fc'], lotus:null},
  70:{trees:['himtree', 'himtree', 'frangipani'], deco:['lotusbowl', 'flowerbed'], water:['#ecd8a0', '#2f6ab0', '#5096d8', '#a8e0f8'], lotus:'#ffd06a'}};
const TW318_NAT = new Set(['tree', 'palm', 'pine', 'himtree', 'frangipani', 'cactus', 'bush', 'rock', 'jar', 'stupa', 'lotusbowl', 'flowerbed', 'bamboo', 'banana', 'fern', 'mushroom']);
const tw318Rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
function tw318Lay(id){
  const C = TW318[id]; if (!C) return;
  const ew = GATES.length && Math.abs(GATES[0].y - H / 2) < 60;   // the gates face east and west (else north and south)
  const core = PROPS.filter(p => p.type === 'tbld' || p.type === 'tland' || p.type === 'lamp'), xs = core.map(p => p.x), ys = core.map(p => p.y);
  const box = core.length ? {x0:Math.min(...xs) - 200, x1:Math.max(...xs) + 200, y0:Math.min(...ys) - 220, y1:Math.max(...ys) + 160} : {x0:W * .3, x1:W * .7, y0:H * .35, y1:H * .65};
  const inCore = (x, y, pad = 0) => x > box.x0 - pad && x < box.x1 + pad && y > box.y0 - pad && y < box.y1 + pad;
  // clear the trees, bushes and ornaments outside the town
  for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!TW318_NAT.has(p.type) || inCore(p.x, p.y)) continue;
    PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); }
  // four ponds, one in each quarter, painted into the ground
  const ponds = [], q = ew ? {x:W * .2, y:H * .24} : {x:W * .2, y:H * .26};
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]){ const x = sx > 0 ? q.x : W - q.x, y = sy > 0 ? q.y : H - q.y; ponds.push({x, y, rx:150, ry:88}); }
  const g = terr.getContext('2d'); g.save(); g.setTransform(TS, 0, 0, TS, 0, 0);
  for (const P of ponds){ try { waterBody(g, P.x, P.y, P.rx, P.ry, C.water, C.lotus, false); } catch (e) {}
    for (const dx of [-.55, 0, .55]) obstacles.push({x:P.x + P.rx * dx, y:P.y, r:(dx ? P.ry * .78 : P.ry * .9), water:true});
    WATERS.push({k:'pond', x:P.x, y:P.y, rx:P.rx + 4, ry:P.ry, kind:id === 69 ? 'ice' : 'water', seed:(P.x * 7 + P.y * 13) % 997}); }
  g.restore();
  // places that stay open: the road to each gate, the gates, the town, the water
  const road = (x, y) => ew ? Math.abs(y - H / 2) < 120 : Math.abs(x - W / 2) < 120;
  const free = (x, y) => x > 30 && x < W - 30 && y > 40 && y < H - 30 && !road(x, y) && !inCore(x, y, 90) && !GATES.some(gt => Math.hypot(gt.x - x, gt.y - y) < 230)
    && !ponds.some(P => ((x - P.x) / (P.rx + 46)) ** 2 + ((y - P.y) / (P.ry + 40)) ** 2 < 1) && !PROPS.some(p => Math.hypot(p.x - x, p.y - y) < (TW318_NAT.has(p.type) ? 44 : 110));
  const mir = (x, y) => [[x, y], [W - x, y], [x, H - y], [W - x, H - y]];
  const r = tw318Rng(3180 + id), pick = a => a[Math.floor(r() * a.length)], put = (t, x, y, v) => { if (!PROP_TYPES[t]) return; const pts = mir(x, y);
    if (!pts.every(([X, Y]) => free(X, Y))) return; const made = pts.map(([X, Y]) => addProp(t, Math.round(X), Math.round(Y), C.snow && t === 'pine' ? v | 1 : v));   /* a frozen land's pines carry snow */ made.forEach(p => { if (p) p.tw318 = made; }); };
  // 1 · a belt of woods round the edge (the north-west quarter; the rest are its mirrors)
  for (let y = 70; y < H / 2; y += 70) for (let x = 60; x < W / 2; x += 74){ const edge = Math.min(x - 30, y - 50); if (edge > 230 + r() * 60) continue;
    put(pick(C.trees), x + (r() - .5) * 34, y + (r() - .5) * 30, Math.floor(r() * 3)); }
  // 2 · an avenue either side of the road from the town to the gate
  if (ew) for (let x = 360; x < box.x0 - 60; x += 130){ put(pick(C.trees), x, H / 2 - 170, Math.floor(r() * 3)); }
  else for (let y = 330; y < box.y0 - 60; y += 130){ put(pick(C.trees), W / 2 - 170, y, Math.floor(r() * 3)); }
  // 3 · a grove round the pond
  { const P = ponds[0]; for (let i = 0; i < 9; i++){ const a = i / 9 * Math.PI * 2 + .2, d = 1.55 + r() * .3; put(pick(C.trees), P.x + Math.cos(a) * P.rx * d, P.y + Math.sin(a) * P.ry * d * 1.3, Math.floor(r() * 3)); } }
  // 4 · ornaments in pairs on the lawns near the town
  const near = ew ? [[box.x0 - 140, H / 2 - 300], [box.x0 + 300, box.y0 - 140], [W / 2 - 260, box.y0 - 160]] : [[W / 2 - 330, box.y0 + 220], [box.x0 - 160, H / 2 - 420], [box.x0 - 180, box.y0 + 640]];
  for (const [x, y] of near){ put(pick(C.deco), x, y, 0); put(pick(C.deco), x + 52, y + 24, 1); }
  if (typeof NAV !== 'undefined') NAV.grid = null;
  const m = mini.getContext('2d'); m.setTransform(1, 0, 0, 1, 0, 0); m.drawImage(terr, 0, 0, 192, 128);
  for (const p of PROPS){ const tree = TW318_NAT.has(p.type) && !['rock', 'jar', 'flowerbed', 'lotusbowl', 'stupa'].includes(p.type); if (!tree && p.type !== 'tbld') continue;
    m.fillStyle = tree ? 'rgba(30,70,40,.8)' : '#8f3426'; m.beginPath(); m.arc(p.x / W * 192, p.y / H * 128, tree ? 1.2 : 2, 0, 7); m.fill(); }
}
{ const _rm = repaintMap; repaintMap = function(){ const r = _rm.apply(this, arguments); if (TW318[MAP_ID]) try { tw318Lay(MAP_ID); } catch (e) { console.warn('towns318', e); } return r; }; }
/* other systems clear room after this (before the gates): a piece whose mirror was taken goes too */
EV.on('map', id => { if (!TW318[id]) return; for (const ms of [0, 60, 400]) setTimeout(() => { if (MAP_ID !== id) return; const have = new Set(PROPS);
  for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!p.tw318 || p.tw318.every(o => have.has(o))) continue;
    PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); } }, ms); });
