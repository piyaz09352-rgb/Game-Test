/* VAYRATHEN — js/world/aren317.js — (v317) Aren laid out in balance, with a waterfall
   The owner, looking at the town from above: «มันสมดุลที่ไหนวะ แมพกระจอกมาก», then «สระน้ำไม่เป็นธรรมชาติ และขอน้ำตก 1 ที่
   มีเนินมีหน้าผา». Around the round town the land was what the old village had left: paddies over the whole east third,
   one round pond in the north-west, trees thrown anywhere, an empty south. Now it is designed, mirrored about the town's axis:
   · the ground: the west half is mirrored onto the east, so both sides are the same meadow;
   · the north: a grassy hill in each corner ending in a rocky cliff (js/world/falls.js draws them), the north gate open
     between them. Over the west cliff the one waterfall pours into its plunge pool and leaves as a creek; under the east
     cliff lies a still pool of the same size, so the two sides weigh the same;
   · the south: the boatman's pond right of the south gate and its twin left of it, both with natural, uneven banks
     (mud, shallows, reeds, lotus leaves, stones) instead of a drawn oval; the old round pond is gone;
   · south-west and south-east: a block of rice paddies each, the same size, with a few haystacks;
   · round the edge of the map: a belt of woods, open at the four gates; avenues of palms to the west, east and south gates
     (no painted path: the owner's rule); flowering beds in pairs on the lawns.
   Every piece is placed only when its mirror can be placed too. The town itself is unchanged; every gate and NPC stays
   reachable; the cliffs and the plateaus can't be walked on, the creek can be waded. */
'use strict';
const AR17 = {spond:[{x:1420, y:1500, rx:108, ry:56}, {x:980, y:1500, rx:108, ry:56}], fields:[{x0:170, y0:1060, x1:700, y1:1390}, {x0:1700, y0:1060, x1:2230, y1:1390}],
  hill:{x0:150, wd:760, yTop:165, bulge:120, faceH:130, xc:520, seed:41.7}, falls:[]};
const ar17Rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const ar17Town = (x, y, pad = 0) => Math.hypot((x - 1200) / (610 + pad), (y - 800) / (440 + pad)) < 1;
if (typeof POND !== 'undefined'){ POND.x = -9000; POND.y = -9000; }   // the old round pond is not drawn or walked into any more

/* ---------- a pond with a natural bank ---------- */
const ar17Edge = (P, a) => 1 + .11 * Math.sin(2 * a + P.x * .01) + .07 * Math.sin(3 * a + 1.7) + .05 * Math.sin(5 * a + P.y * .02);
function ar17NatPond(g, P, rng){
  const ring = (k, f) => { g.beginPath(); for (let i = 0; i <= 48; i++){ const a = i / 48 * Math.PI * 2, e = ar17Edge(P, a) * k; const x = P.x + Math.cos(a) * P.rx * e, y = P.y + Math.sin(a) * P.ry * e; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.fillStyle = f; g.fill(); };
  ring(1.2, 'rgba(120,104,62,.55)'); ring(1.12, '#8f7a4a'); ring(1.04, '#a8955e');            // a soft muddy bank, darker where it is wet
  const gr = g.createRadialGradient(P.x - P.rx * .2, P.y - P.ry * .25, 6, P.x, P.y, P.rx);
  gr.addColorStop(0, '#2f6f92'); gr.addColorStop(.55, '#3f8bb4'); gr.addColorStop(.85, '#5aa8c6'); gr.addColorStop(1, '#7fc0c8'); ring(.97, gr);   // deep in the middle, pale shallows at the edge
  ring(.62, 'rgba(20,60,90,.25)');
  for (let i = 0; i < 9; i++){ const a = rng() * 6.28, d = .35 + rng() * .45, x = P.x + Math.cos(a) * P.rx * d, y = P.y + Math.sin(a) * P.ry * d, r = 5 + rng() * 5;   // lotus leaves
    g.fillStyle = rng() < .5 ? '#4f9a44' : '#5fae4e'; g.beginPath(); g.ellipse(x, y, r, r * .6, 0, .25, Math.PI * 2 - .25); g.lineTo(x, y); g.fill();
    if (rng() < .3){ g.fillStyle = '#ffb4c8'; g.beginPath(); g.ellipse(x + 1, y - 2, 2.4, 2, 0, 0, 7); g.fill(); } }
  g.strokeStyle = '#5f8a3a'; g.lineWidth = 1.3;   // reeds in clumps, not an even fringe
  for (let c = 0; c < 6; c++){ const a = rng() * 6.28, e = ar17Edge(P, a), bx = P.x + Math.cos(a) * P.rx * e * 1.02, by = P.y + Math.sin(a) * P.ry * e * 1.02;
    for (let k = 0; k < 9; k++){ const x = bx + (rng() - .5) * 16, y = by + (rng() - .5) * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rng() - .5) * 4, y - 7 - rng() * 8); g.stroke(); } }
  for (let i = 0; i < 7; i++){ const a = rng() * 6.28, e = ar17Edge(P, a), x = P.x + Math.cos(a) * P.rx * e * 1.06, y = P.y + Math.sin(a) * P.ry * e * 1.06, r = 3 + rng() * 5;   // stones on the bank
    g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(x + 1, y + 1.5, r, r * .55, 0, 0, 7); g.fill(); g.fillStyle = rng() < .5 ? '#8a8676' : '#a8a492'; g.beginPath(); g.ellipse(x, y, r, r * .6, 0, 0, 7); g.fill(); }
}
function ar17Field(g, F, rng){   // rice paddies with raised dikes, the old fields' look
  let px = F.x0;
  while (px < F.x1 - 40){ const cw = Math.min(F.x1 - px, 95 + rng() * 40); let py = F.y0;
    while (py < F.y1 - 30){ const ch = Math.min(F.y1 - py, 72 + rng() * 40), kind = rng(), ripe = kind < .6, flooded = kind > .86, tint = (rng() - .5) * 18;
      g.fillStyle = flooded ? '#6f9fa8' : ripe ? `rgb(${214 + tint},${181 + tint},${74 + tint / 2})` : `rgb(${169 + tint},${185 + tint},78)`; g.fillRect(px + 4, py + 4, cw - 8, ch - 8);
      g.strokeStyle = flooded ? '#6fae4a' : ripe ? 'rgba(150,120,40,.55)' : 'rgba(90,130,40,.5)'; g.lineWidth = .9;
      for (let ry = py + 10; ry < py + ch - 6; ry += 7) for (let rx = px + 9 + ((ry / 7) % 2) * 3; rx < px + cw - 7; rx += 7){ g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx - .8, ry - 3); g.moveTo(rx, ry); g.lineTo(rx + 1, ry - 2.6); g.stroke(); }
      g.strokeStyle = '#8f7a3e'; g.lineWidth = 5; g.strokeRect(px + 2, py + 2, cw - 4, ch - 4);
      g.strokeStyle = '#a7c062'; g.lineWidth = 2; g.strokeRect(px + 1.5, py + 1.5, cw - 3, ch - 3);
      py += ch; }
    px += cw; }
}
/* the two hills: the west one with the waterfall, the east one its mirror with a still pool */
function ar17Hills(g){
  if (typeof fallGeom !== 'function' || typeof fallsPaint !== 'function') return;
  const h = AR17.hill, B = {base:['#6f9a4a', '#7aa652', '#86b25a']};
  for (const east of [false, true]){
    const x0 = east ? 2400 - h.x0 - h.wd : h.x0, xc = east ? 2400 - h.xc : h.xc, G = fallGeom(x0, h.wd, h.yTop, h.bulge, h.faceH, east ? -9999 : xc, h.seed);
    const baseC = G.base(xc), pool = {x:xc, y:baseC + 30, rx:74, ry:26};
    const stream = east ? [] : meander(xc + 50, -10, xc, G.rim(xc) + 2, 14, 24, h.seed);
    const creek = east ? [[pool.x, pool.y + pool.ry]] : creekPath(pool.x - 6, pool.y + pool.ry - 4, 170, h.seed);
    const F = {x:pool.x, y:baseC, kind:'water', seed:Math.floor(h.seed * 1e4) + (east ? 1 : 0), G, rimC:G.rim(xc), baseC, pool, stream, creek, biome:MAPS[0].biome};
    fallsPaint(g, B, F);
    ar17NatPond(g, {x:pool.x, y:pool.y + 2, rx:pool.rx + 8, ry:pool.ry + 9}, ar17Rng(east ? 61 : 62));   // the pool gets the same natural bank as the ponds, not a ring of stones
    if (!east) WFALLS.push(F);   // the one waterfall: its falling water, spray and mist are drawn live
    AR17.falls.push(F);
  }
}
{ const _bt = buildTerrain; buildTerrain = function(){
    if (MAP_ID !== 0) return _bt.apply(this, arguments);
    const keep = PADDY.x1; PADDY.x1 = PADDY.x0;   // the old east fields are not painted
    let r; try { r = _bt.apply(this, arguments); } finally { PADDY.x1 = keep; }
    try { AR17.falls = [];
      const w = terr.width, h = terr.height, hw = Math.floor(w / 2), tmp = document.createElement('canvas'); tmp.width = hw; tmp.height = h;
      tmp.getContext('2d').drawImage(terr, 0, 0, hw, h, 0, 0, hw, h);
      const g = terr.getContext('2d'); g.save(); g.setTransform(-1, 0, 0, 1, w, 0); g.drawImage(tmp, 0, 0); g.restore(); tmp.width = tmp.height = 0;   // the west half, mirrored onto the east
      g.save(); g.setTransform(TS, 0, 0, TS, 0, 0);
      for (const F of AR17.fields) ar17Field(g, F, ar17Rng(F.x0 < 1200 ? 33 : 34));
      for (const P of AR17.spond) ar17NatPond(g, P, ar17Rng(P.x < 1200 ? 51 : 52));
      ar17Hills(g);
      g.restore(); } catch (e) { console.warn('aren317 ground', e); }
    return r; }; }

/* ---------- the land: water, walls, woods, avenues ---------- */
const AR17_NAT = new Set(['tree', 'palm', 'bush', 'rock', 'hay', 'bamboo', 'banana', 'fruittree', 'flowerbush', 'flowerbed', 'frangipani', 'fern', 'mushroom']);
function ar17Land(){
  // the twin of the boatman's pond (his own is js/world/village2.js)
  const sw = AR17.spond[1]; for (const [dx, r] of [[-62, 42], [0, 52], [62, 42]]) obstacles.push({x:sw.x + dx, y:sw.y, r, water:true});
  WATERS.push({k:'pond', x:sw.x, y:sw.y, rx:sw.rx - 8, ry:sw.ry - 6, kind:'water', seed:32});
  // the hills: walls along the cliff foot and over the plateau; the pools are water; the creek can be waded
  for (const F of AR17.falls){ const G = F.G, p = F.pool;
    for (let x = G.x0 + 8; x <= G.x1 - 8; x += 22){ const by = G.base(x); if (by - 2 < 4) continue; obstacles.push({x, y:by - 10, r:18, cliff:true}); for (let yy = by - 40; yy > -20; yy -= 36) obstacles.push({x, y:yy, r:24, cliff:true}); }
    obstacles.push({x:p.x, y:p.y, r:p.rx * .62, water:true}, {x:p.x - p.rx * .55, y:p.y, r:p.ry, water:true}, {x:p.x + p.rx * .55, y:p.y, r:p.ry, water:true});
    WATERS.push({k:'pond', x:p.x, y:p.y, rx:p.rx - 6, ry:p.ry - 3, kind:'water', seed:F.seed % 997, fallPool:F.stream.length > 0}); }
  // clear every tree, bush and rock outside the town; the land is laid out again below
  for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!AR17_NAT.has(p.type) || ar17Town(p.x, p.y, 20)) continue;
    PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); }
  const gates = GATES.map(g => ({x:g.x, y:g.y})), inField = (x, y, pad = 0) => AR17.fields.some(F => x > F.x0 - pad && x < F.x1 + pad && y > F.y0 - pad && y < F.y1 + pad);
  const wet = (x, y, pad) => AR17.spond.some(P => Math.hypot((x - P.x) / (P.rx * 1.15 + pad), (y - P.y) / (P.ry * 1.15 + pad)) < 1)
    || AR17.falls.some(F => Math.hypot((x - F.pool.x) / (F.pool.rx + pad), (y - F.pool.y) / (F.pool.ry + pad)) < 1 || F.creek.some(([cx, cy]) => Math.hypot(x - cx, y - cy) < 26 + pad * .3));
  // (v318) the cliff face and its foot stay clear; trees may stand up on the hill, off the stream
  const hill = (x, y) => AR17.falls.some(F => { if (x < F.G.x0 - 20 || x > F.G.x1 + 20) return false; const cx = Math.max(F.G.x0, Math.min(F.G.x1, x)); return y > F.G.rim(cx) - 46 && y < F.G.base(cx) + 34 || F.stream.some(([sx, sy]) => Math.hypot(x - sx, y - sy) < 44); });
  const way = (x, y) => (Math.abs(y - 740) < 70 && (x < 600 || x > 1800)) || (Math.abs(x - 1200) < 70 && y > 1200);
  const free = (x, y, pad = 40) => !ar17Town(x, y, 60) && !way(x, y) && !wet(x, y, 34) && !hill(x, y) && !inField(x, y, 70) && !gates.some(g => Math.hypot(x - g.x, y - g.y) < 150)
    && !obstacles.some(o => !o.prop && !o.water && !o.cliff && Math.hypot(o.x - x, o.y - y) < (o.r || 0) + pad) && !PROPS.some(p => !AR17_NAT.has(p.type) && Math.hypot(p.x - x, p.y - y) < 90);
  const pairs = [], r = ar17Rng(9173);   // [type, x, y, v] on the west side; each goes in with its mirror on the east
  // 1 · a belt of woods round the edge
  for (let y = 70; y < 1560; y += 74) for (let x = 50; x < 1170; x += 80){   /* (v319) a thinner belt: phones draw fewer trees at once */
    const edge = Math.min(x - 30, y - 50, 1570 - y); if (edge > 130 + r() * 30) continue;
    const k = r(); pairs.push([k < .5 ? 'tree' : k < .72 ? 'palm' : k < .86 ? 'bamboo' : 'banana', x + (r() - .5) * 30, y + (r() - .5) * 26, Math.floor(r() * 3)]); }   // a mixed wood, not one kind of tree
  // 2 · trees along the foot of the hills, either side of the pool
  { const F = AR17.falls[0]; if (F) for (const dx of [-260, -190, -120, 130, 200, 270]){ const x = F.pool.x + dx, y = F.G.base(Math.max(F.G.x0, Math.min(F.G.x1, x))) + 70 + r() * 30; pairs.push([r() < .6 ? 'tree' : 'palm', x, y, Math.floor(r() * 3)]); } }
  // 3 · avenues of palms: the west gate road and the south gate road
  for (let x = 240; x <= 540; x += 100) for (const dy of [-80, 80]) pairs.push(['palm', x, 740 + dy, (x / 100) % 3 | 0]);
  for (let y = 1260; y <= 1420; y += 80) pairs.push(['palm', 1110, y, (y / 80) % 3 | 0]);
  // 4 · the fields: a row of palms along their town side and a few haystacks on the dikes
  for (let x = 220; x <= 660; x += 110) pairs.push(['palm', x, 1030, (x / 110) % 3 | 0]);
  for (const [x, y] of [[300, 1180], [520, 1300], [410, 1360]]) pairs.push(['hay', x, y, 0]);
  // 5 · flowering beds on the lawns, in pairs
  for (const [x, y] of [[700, 480], [690, 1150], [330, 600], [330, 900]]){ pairs.push(['flowerbed', x, y, 0]); pairs.push(['flowerbed', x + 46, y + 20, 1]); }
  const ok = (t, X, Y) => { if (t !== 'hay' && !free(X, Y)) return false; return !PROPS.some(p => AR17_NAT.has(p.type) && Math.hypot(p.x - X, p.y - Y) < 40); };
  for (const [t, x, y, v] of pairs){ if (!PROP_TYPES[t] || !ok(t, x, y) || !ok(t, 2400 - x, y)) continue;
    const A = addProp(t, Math.round(x), Math.round(y), v), B = addProp(t, Math.round(2400 - x), Math.round(y), v); if (A && B){ A.ar17 = B; B.ar17 = A; } }
}
{ const _rm = repaintMap; repaintMap = function(){ const r = _rm.apply(this, arguments); if (MAP_ID !== 0) return r;
    try { ar17Land(); NAV.grid = null;
      const m = mini.getContext('2d'); m.setTransform(1, 0, 0, 1, 0, 0); m.drawImage(terr, 0, 0, 192, 128);
      for (const p of PROPS){ const tree = AR17_NAT.has(p.type) && p.type !== 'hay' && p.type !== 'rock' && p.type !== 'flowerbed'; if (!tree && !['vshop', 'sala', 'shrine', 'armytent', 'dgngate', 'gwhall', 'jobtemple', 'healerhut'].includes(p.type)) continue;
        m.fillStyle = tree ? 'rgba(30,70,40,.8)' : '#8f3426'; m.beginPath(); m.arc(p.x / W * 192, p.y / H * 128, tree ? 1.4 : 2, 0, 7); m.fill(); }
    } catch (e) { console.warn('aren317 land', e); }
    return r; }; }
/* (v318) other systems clear room after the land is laid (round the tower monument, before the gates): a tree whose mirror
   was taken away goes too, so the two sides stay the same */
function ar17Pairs(){ if (MAP_ID !== 0) return; const have = new Set(PROPS); let n = 0;
  for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!p.ar17 || have.has(p.ar17)) continue;
    PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); n++; }
  if (n && typeof NAV !== 'undefined') NAV.grid = null; }
EV.on('map', () => { for (const ms of [0, 60, 400]) setTimeout(() => { try { ar17Pairs(); } catch (e) {} }, ms); });
