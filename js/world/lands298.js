/* VAYRATHEN — js/world/lands298.js — (v298) the last five of the eight lands, each with its own way in
   4 หุบเขาต้องห้าม (22, 39): «rock, cliffs, mountains, where the savage tribes live» — stone pillars carved by the wind,
     the tribes' hide tents and carved totems, warm dust; the way in is a narrow pass between two cliff walls.
   5 ดินแดนแห่งความอ้างว้าง (51, 9): «no people, traces of a fall» — broken walls and roofless houses, an abandoned cart,
     grey dead ground, cold mist; nobody at the camp but the warp keeper, its fire long cold; the way in is a broken city gate.
   6 ดินแดนแห่งความแห้งแล้ง (21, 40): «drought, desert» — wind-carved rocks, heat shimmer, blowing sand; the way in is a
     sandstorm turning on itself.
   7 ดินแดนแห่งอารยธรรม (10, 13): «the glory of an age» — streets paved in dressed stone edged with gold, royal banners,
     lamp posts, gilded statues; the way in is a great gilded city gate.
   8 ดินแดนแห่งความอุดมสมบูรณ์ (31, 32): «abundance» — fruit trees heavy with mangoes, flowers everywhere, deep green;
     the way in is an arch of flowers.
   Each land's creatures are bodies of their own (gfx/beasts.js 'land'). Nothing is placed where it does not belong. */
'use strict';

const LAND8 = {
  wild:{maps:[22, 39], add:[['hoodoo', 14], ['hidetent', 5], ['totem', 5]], drop:['flowerbed', 'hedge', 'frangipani', 'bush', 'jar', 'palm'], tint:'rgba(200,110,50,.06)'},
  ruin:{maps:[51, 9], add:[['ruinwall', 14], ['ruinhouse', 7], ['oldcart', 3]], drop:['flowerbed', 'hedge', 'frangipani', 'bush', 'flowerbush', 'packs', 'bedroll', 'jar', 'tree', 'banana', 'palm', 'himtree', 'cycad', 'lamp'], tint:'rgba(70,70,80,.16)', empty:true, cold:true},
  arid:{maps:[21, 40], add:[['sandrock', 14], ['cactus', 10]], drop:['flowerbed', 'hedge', 'frangipani', 'bush', 'tree', 'banana', 'himtree', 'cycad', 'palm'], tint:'rgba(255,190,90,.07)'},
  civil:{maps:[10, 13], add:[['banner', 10], ['lamppost', 12], ['goldstatue', 4]], drop:['deadtree', 'thorntree', 'wall', 'rock'], tint:null, paved:true},
  fertile:{maps:[31, 32], add:[['fruittree', 12], ['frangipani', 6]], drop:['deadtree', 'thorntree', 'rock'], tint:'rgba(120,200,80,.04)'}};
const land8Of = id => { for (const k in LAND8) if (LAND8[k].maps.includes(+id)) return k; return null; };
const land8Here = () => (MAP_ID ? land8Of(MAP_ID) : null);

/* ---------- props ---------- */
Object.assign(PROP_TYPES, {
  hoodoo: (seed, v = 0) => makeProp({w:60, h:150, ax:30, ay:140, seed, shadow:[20, 7], collide:12, paint(g, rng){   // a pillar of banded rock carved by the wind
    const h = [120, 92, 136][v % 3], cols = ['#a8583a', '#c06a44', '#9a4a30', '#d08050'];
    for (let y = 0; y < h; y += 8){ const t = y / h, w = 11 + Math.sin(t * 9 + v) * 3 - t * 3; g.fillStyle = cols[Math.floor(y / 8) % 4]; g.fillRect(-w, -y - 8, w * 2, 8.4); g.fillStyle = 'rgba(255,220,180,.18)'; g.fillRect(-w, -y - 8, w * .6, 8.4); }
    g.fillStyle = '#7a3a24'; ov(g, 0, -h - 4, 15, 7); g.fill(); g.fillStyle = '#9a5032'; ov(g, -3, -h - 6, 11, 5); g.fill();   // the cap stone
  }}),
  hidetent: (seed, v = 0) => makeProp({w:80, h:80, ax:40, ay:70, seed, shadow:[32, 8], collide:22, paint(g, rng){   // a tribal tent of stitched hides on long poles
    g.strokeStyle = '#4a3020'; g.lineWidth = 2.4; for (const x of [-6, 0, 6]){ g.beginPath(); g.moveTo(x * .6, -66); g.lineTo(x * 4.4, 0); g.stroke(); g.beginPath(); g.moveTo(x * .6, -66); g.lineTo(x * .2, -74); g.stroke(); }
    g.fillStyle = ['#b08a5a', '#9a7448', '#c09a68'][v % 3]; pv(g, [-30, 0, -3, -62, 3, -62, 30, 0]); g.fill();
    g.strokeStyle = 'rgba(60,40,20,.5)'; g.lineWidth = 1; for (const y of [-20, -38]){ g.beginPath(); g.moveTo(-30 + (-y) * .45, y); g.lineTo(30 - (-y) * .45, y); g.stroke(); }   // stitched seams
    g.fillStyle = '#3a2412'; pv(g, [-8, 0, 0, -26, 8, 0]); g.fill();   // the door flap
    g.fillStyle = '#8a2a1a'; for (let i = 0; i < 5; i++){ g.beginPath(); g.moveTo(-18 + i * 9, -14); g.lineTo(-14 + i * 9, -20); g.lineTo(-10 + i * 9, -14); g.fill(); }   // a painted band of zigzags
  }}),
  totem: (seed, v = 0) => makeProp({w:40, h:130, ax:20, ay:122, seed, shadow:[10, 4], collide:7, paint(g, rng){   // a carved wooden totem of the tribes
    g.fillStyle = '#6a4626'; g.fillRect(-7, -112, 14, 112); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(2, -112, 5, 112);
    for (let i = 0; i < 4; i++){ const y = -22 - i * 26; g.fillStyle = ['#a83a22', '#d8a84a', '#2a6a7a', '#e8e0c8'][(i + v) % 4]; g.fillRect(-9, y - 6, 18, 5);
      g.fillStyle = '#2a180c'; g.fillRect(-5, y - 16, 3, 3); g.fillRect(2, y - 16, 3, 3); g.fillRect(-4, y - 10, 8, 2); }   // carved faces with painted brows
    g.fillStyle = '#d8a84a'; pv(g, [-16, -112, 16, -112, 0, -124]); g.fill();
    g.strokeStyle = '#e8e0c8'; g.lineWidth = 1.4; for (const sd of [-1, 1]){ g.beginPath(); g.moveTo(sd * 9, -104); g.quadraticCurveTo(sd * 18, -110, sd * 20, -98); g.stroke(); }   // feathers
  }}),
  ruinwall: (seed, v = 0) => makeProp({w:110, h:70, ax:55, ay:58, seed, shadow:[48, 7], collide:18, paint(g, rng){   // a length of broken brick wall
    const tops = []; for (let i = 0; i <= 10; i++) tops.push(14 + rng() * [40, 26, 48][v % 3] * Math.sin(i / 10 * Math.PI));
    for (let i = 0; i < 10; i++) for (let y = 0; y < tops[i]; y += 6){ g.fillStyle = (i + y / 6) % 3 ? '#7a6a5e' : '#8a786a'; g.fillRect(-50 + i * 10 + (y / 6 % 2) * 3, -y - 6, 9.4, 5.4); }
    g.fillStyle = 'rgba(30,26,24,.3)'; for (let i = 0; i < 6; i++){ g.beginPath(); g.ellipse(-46 + rng() * 92, -2, 3 + rng() * 4, 2, 0, 0, 7); g.fill(); }   // fallen bricks
    g.strokeStyle = 'rgba(30,24,20,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-10, -4); g.lineTo(-4, -20); g.lineTo(-12, -30); g.stroke();   // a crack
  }}),
  ruinhouse: (seed, v = 0) => makeProp({w:100, h:100, ax:50, ay:86, seed, shadow:[42, 9], collide:26, paint(g, rng){   // a house whose roof fell in long ago
    g.fillStyle = '#6a5a4c'; g.fillRect(-36, -50, 72, 50); g.fillStyle = '#4a4038'; g.fillRect(-36, -50, 72, 6);
    g.fillStyle = '#1e1a18'; g.fillRect(-10, -32, 18, 32); g.fillRect(-28, -38, 10, 10); g.fillRect(18, -38, 10, 10);   // an empty doorway and windows
    g.strokeStyle = '#3a2a1c'; g.lineWidth = 3; g.beginPath(); g.moveTo(-40, -50); g.lineTo(-6, -82); g.lineTo(6, -70); g.stroke(); g.beginPath(); g.moveTo(40, -50); g.lineTo(22, -66); g.stroke();   // the bare roof beams
    g.fillStyle = '#5a4a3a'; for (let i = 0; i < 5; i++){ pv(g, [-30 + i * 14, -50, -24 + i * 14, -56 - rng() * 8, -18 + i * 14, -50]); g.fill(); }
  }}),
  oldcart: (seed, v = 0) => makeProp({w:80, h:50, ax:40, ay:40, seed, shadow:[34, 7], collide:16, paint(g, rng){   // an abandoned cart, one wheel off
    g.fillStyle = '#5a4430'; pv(g, [-30, -14, 26, -18, 28, -6, -28, -2]); g.fill(); g.fillStyle = '#6a5038'; g.fillRect(-30, -22, 56, 6);
    g.strokeStyle = '#3a2a1a'; g.lineWidth = 2; g.beginPath(); g.arc(-16, -4, 9, 0, 7); g.stroke(); for (let i = 0; i < 4; i++){ const a = i * .785; g.beginPath(); g.moveTo(-16 - Math.cos(a) * 9, -4 - Math.sin(a) * 9); g.lineTo(-16 + Math.cos(a) * 9, -4 + Math.sin(a) * 9); g.stroke(); }
    g.beginPath(); g.ellipse(24, 0, 10, 4, .2, 0, 7); g.stroke(); g.beginPath(); g.moveTo(28, -14); g.lineTo(46, -6); g.stroke();   // the fallen wheel, the shaft
  }}),
  sandrock: (seed, v = 0) => makeProp({w:90, h:90, ax:45, ay:76, seed, shadow:[34, 8], collide:18, paint(g, rng){   // a rock carved by the sand-wind into a mushroom of layers
    const h = [60, 46, 74][v % 3]; for (let y = 0; y < h; y += 6){ const t = y / h, w = 14 + t * t * 22; g.fillStyle = (y / 6) % 2 ? '#d8a868' : '#c8925a'; g.fillRect(-w, -y - 6, w * 2, 6.4); g.fillStyle = 'rgba(255,240,210,.2)'; g.fillRect(-w, -y - 6, w * .7, 6.4); }
    g.fillStyle = '#b8824e'; ov(g, 0, -h - 3, 38, 9); g.fill(); g.fillStyle = '#e0b878'; ov(g, -5, -h - 5, 30, 6); g.fill();
  }}),
  cactus: (seed, v = 0) => makeProp({w:60, h:100, ax:30, ay:92, seed, shadow:[16, 5], collide:9, paint(g, rng){   // a ribbed columnar cactus, an arm or two
    const h = [76, 60, 86][v % 3], col = (x, y0, y1, w) => { g.fillStyle = '#3e7a3a'; g.beginPath(); g.roundRect(x - w, y1, w * 2, y0 - y1, w); g.fill(); g.fillStyle = '#5a9a4a'; g.fillRect(x - w * .5, y1 + w, w * .5, y0 - y1 - w * 2);
      g.strokeStyle = 'rgba(20,50,20,.45)'; g.lineWidth = .8; for (const dx of [-w * .45, w * .2]){ g.beginPath(); g.moveTo(x + dx, y1 + w); g.lineTo(x + dx, y0 - 2); g.stroke(); } };
    col(0, 0, -h, 7); col(-15, -h * .32, -h * .72, 5); g.fillStyle = '#3e7a3a'; g.fillRect(-15, -h * .38, 10, 7); if (v % 2 === 0){ col(15, -h * .45, -h * .8, 4.4); g.fillRect(5, -h * .5, 10, 6); }
    g.fillStyle = '#f4e8c8'; for (let i = 0; i < 12; i++){ const y = -rng() * h, x = (rng() - .5) * 13; g.fillRect(x, y, 1, 1); }   // spines
    if (v === 1){ g.fillStyle = '#f06a8a'; ov(g, 0, -h - 2, 3, 2.4); g.fill(); }   // a flower on the crown
  }}),
  banner: (seed, v = 0) => makeProp({w:40, h:130, ax:20, ay:122, seed, shadow:[8, 3], collide:5, paint(g, rng){   // a royal banner on a gilded pole
    g.fillStyle = '#c8962a'; g.fillRect(-2, -118, 4, 118); g.fillStyle = '#ffe08a'; ov(g, 0, -120, 3.4, 3.4); g.fill();
    const c = [['#a8182a', '#e3b04b'], ['#1a3a8a', '#e3b04b'], ['#1a6a3a', '#f0d070']][v % 3]; g.fillStyle = c[0]; pv(g, [2, -112, 20, -112, 20, -58, 11, -66, 2, -58]); g.fill();
    g.fillStyle = c[1]; g.fillRect(2, -112, 18, 3); ov(g, 11, -90, 5, 5); g.fill(); g.fillStyle = c[0]; ov(g, 11, -90, 2.4, 2.4); g.fill();   // a gold border and the royal seal
  }}),
  lamppost: (seed, v = 0) => makeProp({w:30, h:96, ax:15, ay:88, seed, shadow:[8, 3], collide:5, glow:[0, -74, 30], paint(g, rng){   // a street lamp of carved stone and bronze
    g.fillStyle = '#8a8478'; g.fillRect(-6, -8, 12, 8); g.fillStyle = '#9a9488'; g.fillRect(-3, -66, 6, 58); g.fillStyle = '#7a5a2a'; g.fillRect(-8, -70, 16, 4);
    g.fillStyle = '#ffe8a0'; g.fillRect(-5, -82, 10, 12); g.strokeStyle = '#5a3a14'; g.lineWidth = 1.4; g.strokeRect(-5, -82, 10, 12); g.fillStyle = '#7a5a2a'; pv(g, [-8, -82, 8, -82, 0, -90]); g.fill();
  }}),
  goldstatue: (seed, v = 0) => makeProp({w:60, h:110, ax:30, ay:100, seed, shadow:[22, 6], collide:12, paint(g, rng){   // a gilded guardian on a tall plinth
    g.fillStyle = '#b8b0a0'; g.fillRect(-18, -24, 36, 24); g.fillStyle = '#d8d0c0'; g.fillRect(-18, -24, 36, 4); g.fillStyle = '#e3b04b';
    pv(g, [-10, -24, 10, -24, 8, -60, 13, -64, 6, -70, 6, -82, 0, -96, -6, -82, -6, -70, -13, -64, -8, -60]); g.fill();
    g.fillStyle = '#fff0a0'; pv(g, [-6, -26, -2, -26, -2, -68, -6, -66]); g.fill(); g.fillStyle = '#b8862a'; ov(g, 0, -76, 5, 6); g.fill(); g.fillStyle = '#e3b04b'; ov(g, 0, -77, 4, 5); g.fill();
  }}),
  fruittree: (seed, v = 0) => makeProp({w:110, h:120, ax:55, ay:110, seed, shadow:[34, 10], collide:12, paint(g, rng){   // a fruit tree heavy with mangoes
    g.fillStyle = '#6a4a2a'; pv(g, [-6, 0, -4, -34, -12, -50, -8, -52, 0, -38, 6, -54, 10, -52, 4, -34, 6, 0]); g.fill();
    for (const [x, y, r] of [[0, -72, 26], [-26, -58, 20], [26, -60, 20], [-10, -92, 17], [14, -94, 16]]) leafCluster(g, x, y, r, rng, {leafD:'#2a5a24', leafM:'#3e7a30', leafL:'#5a9a40', leafH:'#8ac060'});
    const fc = [['#f0b030', '#ffd860'], ['#e86a2a', '#ffa050'], ['#c83a3a', '#f07070']][v % 3];
    for (let i = 0; i < 16; i++){ const an = rng() * 6.28, d = Math.sqrt(rng()) * 30, x = Math.cos(an) * d, y = -68 + Math.sin(an) * d * .7; g.fillStyle = fc[0]; ov(g, x, y, 3.2, 4, .3); g.fill(); g.fillStyle = fc[1]; ov(g, x - .8, y - 1, 1.4, 1.8, .3); g.fill(); }   // ripe fruit
  }}),
});

/* ---------- each land's ground details, layered over the land's own ground ---------- */
function land8Ground(g, k){
  const A = typeof AREA === 'function' ? AREA() : 1;
  if (k === 'ruin'){ g.fillStyle = 'rgba(90,86,80,.35)'; g.fillRect(0, 0, W, H);   // the colour has gone out of the ground
    for (let i = 0; i < 220 * A; i++){ let x = R() * W, y = R() * H, an = R() * 6.28; g.strokeStyle = 'rgba(40,34,30,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 5; s++){ an += (R() - .5) * 1.2; x += Math.cos(an) * 12; y += Math.sin(an) * 6; g.lineTo(x, y); } g.stroke(); }
    for (let i = 0; i < 400 * A; i++){ const x = R() * W, y = R() * H; g.fillStyle = R() < .5 ? '#6a5e52' : '#8a7c6c'; g.fillRect(x, y, 4 + R() * 3, 2.4); } }   // rubble and potsherds
  if (k === 'civil') for (let c = 0; c < Math.max(4, Math.round(7 * A)); c++){ const horiz = R() < .5, x0 = 240 + R() * (W - 480), y0 = 200 + R() * (H - 400), L = 300 + R() * 300;   // paved avenues edged with gold
    for (let t = 0; t < L; t += 14){ const x = horiz ? x0 + t - L / 2 : x0, y = horiz ? y0 : y0 + t - L / 2; for (let w = -2; w <= 2; w++){ const px = horiz ? x : x + w * 14, py = horiz ? y + w * 9 : y;
      g.fillStyle = (Math.round(t / 14) + w) % 2 ? '#d8ccb4' : '#cabda4'; g.fillRect(px - 6.6, py - 4.2, 13.2, 8.4); } }
    g.fillStyle = 'rgba(220,170,70,.7)'; if (horiz){ g.fillRect(x0 - L / 2, y0 - 24, L, 2); g.fillRect(x0 - L / 2, y0 + 22, L, 2); } else { g.fillRect(x0 - 38, y0 - L / 2, 2, L); g.fillRect(x0 + 36, y0 - L / 2, 2, L); } }
  if (k === 'fertile') for (let i = 0; i < 1400 * A; i++){ const x = R() * W, y = R() * H; g.fillStyle = ['#ffd84a', '#ff8ab0', '#ffffff', '#c890f0', '#ff6a5a'][Math.floor(R() * 5)]; g.beginPath(); g.arc(x, y, 1.2 + R(), 0, 7); g.fill(); }   // flowers everywhere
  if (k === 'arid') for (let i = 0; i < 160 * A; i++){ const x = R() * W, y = R() * H, w = 30 + R() * 60; g.strokeStyle = 'rgba(255,236,190,.35)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x, y - 5, x + w, y); g.stroke(); }   // ridges of blown sand
}
{ const _gd = groundDetail; groundDetail = function(g, B, mapId){ const r = _gd.apply(this, arguments); const k = land8Of(mapId); if (k) try { land8Ground(g, k); } catch (e) {} return r; }; }

/* ---------- placing and tidying ---------- */
function land8Dress(k){
  const L = LAND8[k];
  for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!L.drop.includes(p.type)) continue; for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); PROPS.splice(i, 1); }
  const ok = (x, y, r) => x > 80 && x < W - 80 && y > 100 && y < H - 60 && trailD(x, y) > 40 && !GATES.some(gt => Math.hypot(gt.x - x, gt.y - y) < 150) && Math.hypot(x - LAIR.x, y - LAIR.y) > 170
    && !(CAMP && Math.hypot(x - CAMP.x, y - CAMP.y) < 260) && !obstacles.some(o => Math.hypot(o.x - x, o.y - y) < o.r + r);
  const A = typeof AREA === 'function' ? AREA() : 1;
  for (const [t, n] of L.add){ let put = 0; for (let tries = 0; put < Math.round(n * A) && tries < 400; tries++){ const x = R() * W, y = R() * H; if (!ok(x, y, 26)) continue; addProp(t, x, y, Math.floor(R() * 3)); put++; } }
  if (k === 'ruin' || k === 'arid'){ let i = 0; for (const p of PROPS) if (p.type === 'deadtree' || p.type === 'thorntree'){ const to = i++ % 2 ? 'thorntree' : 'deadtree'; if (p.type !== to){ p.type = to; p.variant = p.variant % 1000 % 3; delete p.vk; } } }   // dry lands: dead trees and thorny trees in equal measure (no rows of one tree)
  NAV.grid = null;
}
{ const _pm = paintMap; paintMap = function(mapId){ const r = _pm.apply(this, arguments); const k = land8Of(mapId); if (k) try { land8Dress(k); } catch (e) {} return r; }; }
{ const _cp = campPlace; campPlace = function(){ const r = _cp.apply(this, arguments); const k = land8Here(); if (k && CAMP){ const L = LAND8[k];
    for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!L.drop.includes(p.type) || Math.hypot(p.x - CAMP.x, p.y - CAMP.y) > 360) continue; for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); PROPS.splice(i, 1); } NAV.grid = null; }
  return r; }; }
{ const _sn = setupNpcs; setupNpcs = function(id){ const r = _sn.apply(this, arguments); const k = land8Of(id); if (k && LAND8[k].empty) for (let i = NPCS.length - 1; i >= 0; i--) if (NPCS[i].id === 'campcook' || NPCS[i].id === 'quarter') NPCS.splice(i, 1); return r; }; }   // the desolate land: nobody left
{ const _cf = campFire; campFire = function(g, x, y, t){ const k = land8Here(); if (!k || !LAND8[k].cold) return _cf.apply(this, arguments);   // a fire long gone cold: charred logs, grey ash
    g.fillStyle = '#3a3430'; g.beginPath(); g.ellipse(x, y, 11, 4.4, 0, 0, 7); g.fill(); g.fillStyle = '#1e1a18'; g.save(); g.translate(x, y - 1); for (const a of [-.5, .5, 0]){ g.save(); g.rotate(a); g.fillRect(-9, -1.5, 18, 3); g.restore(); } g.restore();
    g.fillStyle = 'rgba(160,156,150,.7)'; for (let i = 0; i < 6; i++){ g.beginPath(); g.arc(x - 6 + i * 2.4, y - 1 + Math.sin(i) * 1.4, 1.4, 0, 7); g.fill(); } }; }
if (typeof cuteBuild === 'function'){ const _cb = cuteBuild; cuteBuild = function(){ const r = _cb.apply(this, arguments); const k = land8Here();
    if (k === 'ruin' || k === 'arid') CUTE.decor = CUTE.decor.filter(d => !['flower', 'bud', 'clover', 'glowmush', 'mush'].includes(d.k)); return r; }; }

/* ---------- the air of each land ---------- */
const L8FX = {p:[], last:0};
function land8Over(g, k){
  const L = LAND8[k], t = T, now = performance.now(), dt = Math.min(.1, (now - (L8FX.last || now)) / 1000); L8FX.last = now;
  if (L.tint){ g.fillStyle = L.tint; g.fillRect(0, 0, VW, VH); }
  const n = k === 'ruin' ? 10 : k === 'arid' ? 50 : k === 'wild' ? 30 : 0; while (L8FX.p.length < n) L8FX.p.push({x:Math.random() * VW, y:Math.random() * VH, s:Math.random()}); L8FX.p.length = n;
  for (const q of L8FX.p){
    if (k === 'ruin'){ q.x += (5 + q.s * 6) * dt; if (q.x > VW + 140) q.x = -140; const r = 80 + q.s * 80, gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, r); gr.addColorStop(0, 'rgba(200,200,205,.16)'); gr.addColorStop(1, 'rgba(200,200,205,0)'); g.fillStyle = gr; g.fillRect(q.x - r, q.y - r, r * 2, r * 2); }   // cold mist
    else { q.x += (k === 'arid' ? 60 : 30) * (.6 + q.s) * dt; q.y += Math.sin(t * 2 + q.s * 9) * 6 * dt; if (q.x > VW + 6){ q.x = -6; q.y = Math.random() * VH; }
      g.fillStyle = k === 'arid' ? `rgba(230,200,140,${.35 + q.s * .3})` : `rgba(190,120,80,${.25 + q.s * .25})`; g.fillRect(q.x, q.y, 2 + q.s * 3, 1); } }   // blowing sand, red dust
  if (k === 'arid'){ g.save(); g.globalAlpha = .05; g.fillStyle = '#fff4d0'; for (let y = 0; y < VH; y += 14) g.fillRect(Math.sin(t * 3 + y * .08) * 3, y, VW, 2); g.restore(); }   // heat shimmer
}
{ const _dw = drawWeather; drawWeather = function(g){ const r = _dw.apply(this, arguments); const k = land8Here(); if (k) try { land8Over(g, k); } catch (e) {} return r; }; }

/* ---------- the ways in ---------- */
const land8Gate = gt => { const k = land8Of(gt.to); return k && land8Here() !== k ? k : null; };
function l8GateGround(ctx, gt, cx, cy, k){
  const x = gt.x - cx, y = gt.y - cy - 4, t = T;
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  if (k === 'arid'){   // a sandstorm turning on itself
    for (let i = 0; i < 6; i++){ const r = 50 - i * 7, a0 = t * (1.6 + i * .3); ctx.strokeStyle = `rgba(${210 - i * 8},${170 - i * 10},${110 - i * 10},${.35 + i * .07})`; ctx.lineWidth = 6 - i * .6; ctx.beginPath(); ctx.ellipse(x, y, r, r * .45, 0, a0, a0 + 4.4); ctx.stroke(); }
    ctx.fillStyle = 'rgba(120,90,50,.5)'; ctx.beginPath(); ctx.ellipse(x, y, 10, 4.5, 0, 0, 7); ctx.fill(); }
  else { ctx.fillStyle = 'rgba(30,20,10,.25)'; ctx.beginPath(); ctx.ellipse(x, y + 4, 70, 18, 0, 0, 7); ctx.fill(); }
  if (k === 'fertile') for (let i = 0; i < 26; i++){ const a = i / 26 * 6.283; ctx.fillStyle = ['#ff8ab0', '#ffd84a', '#ffffff', '#c890f0'][i % 4]; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 52, y + Math.sin(a) * 16, 2.6, 0, 7); ctx.fill(); }   // a ring of flowers on the ground
  ctx.restore();
}
function l8GateAbove(ctx, gt, cx, cy, k){
  const x = gt.x - cx, y = gt.y - cy - 4, t = T;
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  if (k === 'wild'){ for (const sd of [-1, 1]){ ctx.fillStyle = sd < 0 ? '#9a4a30' : '#7a3a24'; ctx.beginPath(); ctx.moveTo(x + sd * 34, y + 6); ctx.lineTo(x + sd * 30, y - 90); ctx.lineTo(x + sd * 46, y - 130); ctx.lineTo(x + sd * 80, y - 120); ctx.lineTo(x + sd * 84, y + 8); ctx.closePath(); ctx.fill();   // two cliff walls and the narrow pass between
      ctx.strokeStyle = 'rgba(255,200,160,.2)'; ctx.lineWidth = 3; for (let yy = -110; yy < 0; yy += 14){ ctx.beginPath(); ctx.moveTo(x + sd * 34, y + yy); ctx.lineTo(x + sd * 80, y + yy + 4); ctx.stroke(); } } }
  else if (k === 'ruin'){ ctx.fillStyle = '#6a5e52';   // a city gate, broken
    ctx.fillRect(x - 56, y - 96, 22, 100); ctx.fillRect(x + 34, y - 70, 22, 74); ctx.beginPath(); ctx.moveTo(x - 34, y - 96); ctx.quadraticCurveTo(x - 10, y - 120, x + 6, y - 104); ctx.lineTo(x + 2, y - 90); ctx.quadraticCurveTo(x - 14, y - 102, x - 34, y - 80); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4a4038'; for (let i = 0; i < 6; i++) ctx.fillRect(x - 56 + (i % 2) * 8, y - 90 + i * 14, 12, 2); ctx.fillStyle = 'rgba(60,54,48,.8)'; for (let i = 0; i < 5; i++){ ctx.beginPath(); ctx.ellipse(x + 20 + i * 6, y + 2, 5, 2.6, 0, 0, 7); ctx.fill(); } }
  else if (k === 'civil'){ const gg = ctx.createLinearGradient(x - 60, 0, x + 60, 0); gg.addColorStop(0, '#b8862a'); gg.addColorStop(.5, '#ffe08a'); gg.addColorStop(1, '#a8761e');   // a great gilded city gate
    for (const sd of [-1, 1]){ ctx.fillStyle = '#e8e0d0'; ctx.fillRect(x + sd * 46 - 10, y - 100, 20, 104); ctx.fillStyle = '#a8182a'; ctx.fillRect(x + sd * 46 - 10, y - 100, 20, 8); }
    ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(x - 62, y - 100); ctx.lineTo(x + 62, y - 100); ctx.lineTo(x + 40, y - 120); ctx.lineTo(x + 14, y - 124); ctx.lineTo(x, y - 150); ctx.lineTo(x - 14, y - 124); ctx.lineTo(x - 40, y - 120); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a8182a'; ctx.fillRect(x - 36, y - 100, 72, 6); ctx.fillStyle = 'rgba(255,240,180,.5)'; ctx.beginPath(); ctx.ellipse(x, y - 50, 32, 46, 0, 0, 7); ctx.fill(); }
  else if (k === 'fertile'){ for (let i = 0; i <= 24; i++){ const a = Math.PI + i / 24 * Math.PI, px = x + Math.cos(a) * 48, py = y - 6 + Math.sin(a) * 90;   // an arch of flowers and leaves
      ctx.fillStyle = '#3e7a30'; ctx.beginPath(); ctx.arc(px, py, 7, 0, 7); ctx.fill(); ctx.fillStyle = ['#ff8ab0', '#ffd84a', '#ffffff', '#ff6a5a'][i % 4]; ctx.beginPath(); ctx.arc(px + Math.sin(i) * 3, py - 2, 3.4, 0, 7); ctx.fill(); } }
  else if (k === 'arid'){ for (let i = 0; i < 30; i++){ const u = (t * .6 + i / 30) % 1, a = u * 12 + i, r = 46 * (1 - u * .6); ctx.fillStyle = `rgba(220,180,120,${(1 - u) * .7})`; ctx.fillRect(x + Math.cos(a) * r, y - u * 110 + Math.sin(a) * r * .3, 2.4, 2.4); } }   // sand lifted into the air
  ctx.restore();
}
if (typeof wgGround === 'function'){ const _g = wgGround; wgGround = function(ctx, gt){ const k = land8Gate(gt); return k ? l8GateGround(...arguments, k) : _g.apply(this, arguments); }; }
if (typeof wgAbove === 'function'){ const _a = wgAbove; wgAbove = function(ctx, gt){ const k = land8Gate(gt); return k ? l8GateAbove(...arguments, k) : _a.apply(this, arguments); }; }
