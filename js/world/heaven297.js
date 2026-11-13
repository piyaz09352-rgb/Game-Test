/* VAYRATHEN — js/world/heaven297.js — (v297) สวรรค์: the third of the eight lands, islands floating above the clouds
   The owner: «a floating island — there must be a huge world tree joining the way up to it — about gods and devas».
   Maps 30 (ประตูสวรรค์ดาวดึงส์) and 60 (บัลลังก์สุริยะ) were a grey field of bricks, palms, bushes, mossy rocks, a
   campfire and a cook. Now they are the sky island of Tavatimsa:
   · the ground is white-gold marble and soft heavenly grass, courts inlaid with gold, petals of the heaven flowers;
     round the edge the island breaks off into a sea of clouds below;
   · the ponds are gaps in the island: you look down through them at clouds drifting far below;
   · heavenly plants only: the coral tree of heaven (ปาริชาติ) and the wish-granting tree (กัลปพฤกษ์), marble pillars
     banded with gold, golden lotus lamps; no earthly trees, palms, bushes, rocks or bricks;
   · golden light slants down, wisps of cloud drift across, motes of light rise, petals fall;
   · no birds, rain or butterflies of the earth; the camp has no cook and no fire: a golden lotus lamp burns in its place;
   · the way up, from the Crystal Palace below, is a colossal world tree with a path of light spiralling up its trunk. */
'use strict';

const HVN = {wisps:[], motes:[], last:0};
const hvnIs = id => { const mp = id && MAPS[id]; return !!(mp && BIOME[mp.biome] && BIOME[mp.biome].sky) && !(typeof isTown === 'function' && isTown(id)); };   // (the Floating Deva City keeps its own town layout)
const heavenHere = () => hvnIs(MAP_ID);
const hvnQ = () => Math.max(0, (typeof GFX !== 'undefined' ? GFX.fx : 1) - (typeof PERF !== 'undefined' && PERF.fps < 28 && PERF.fps > 0 ? 1 : 0));
const HVN_EARTHLY = new Set(['tree', 'palm', 'pine', 'bush', 'deadtree', 'thorntree', 'bamboo', 'banana', 'treefern', 'araucaria', 'cycad', 'fern', 'willow', 'bodhi', 'rubber', 'tamarind', 'rain',
  'reed', 'flowerbush', 'mushroom', 'cactus', 'rock', 'stalag', 'crystal', 'jar', 'packs', 'bedroll', 'logseat', 'stakelamp', 'hedge', 'flowerbed', 'frangipani', 'camptree', 'himtree', 'cauldron', 'obelisk']);

/* ---------- the land ---------- */
BIOME.tavatimsa = {base:['#fff6e0', '#fff8e8', '#fffaf0'], mottle:['rgba(240,210,140,.2)', 'rgba(255,255,255,.5)'], blades:null, road:['#f0d890', '#f6e0a0', '#fce8b0'],
  floor:null, ponds:4, pondR:[80, 135], pondCols:['#f4ecd8', '#5a98d8', '#8ac0f0', '#dff0ff'],
  props:[['parijata', 5, 3], ['kalpatree', 3, 3], ['devapillar', 4, 3], ['lotuslamp', 3, 2], ['statue', 2, 2], ['sala', 1, 2]], propN:85, fx:'petals', fxA:.4, sky:true};

/* ---------- the island's floor, and its edge breaking off into the clouds ---------- */
function hvnFloor(g){
  const A = typeof AREA === 'function' ? AREA() : 1, a = (h, al) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${al})`; };
  // the sea of clouds under everything
  { const sg = g.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, '#bcdcf8'); sg.addColorStop(1, '#d8ecfc'); g.fillStyle = sg; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 260 * A; i++){ const x = R() * W, y = R() * H, r = 30 + R() * 70; g.fillStyle = `rgba(255,255,255,${.35 + R() * .4})`; g.beginPath(); g.ellipse(x, y, r, r * .45, 0, 0, 7); g.fill(); } }
  // the island: an irregular edge about 110 in from the map's border, a lit lip and a shadowed underside
  const M = 110, pts = [], N = 90; for (let i = 0; i < N; i++){ const t = i / N, per = 2 * (W + H), d = t * per; let x, y;
    if (d < W){ x = d; y = 0; } else if (d < W + H){ x = W; y = d - W; } else if (d < 2 * W + H){ x = W - (d - W - H); y = H; } else { x = 0; y = H - (d - 2 * W - H); }
    const cx = W / 2, cy = H / 2, dx = x - cx, dy = y - cy, L = Math.hypot(dx, dy) || 1, k = M + 26 * Math.sin(i * 1.7) + 18 * Math.sin(i * .53) + R() * 14; pts.push([x - dx / L * k, y - dy / L * k]); }
  const path = () => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
  g.save(); g.translate(0, 26); path(); g.fillStyle = '#9a8a70'; g.fill(); g.restore();   // the rock under the lip
  g.save(); g.translate(0, 14); path(); g.fillStyle = '#c8b898'; g.fill(); g.restore();
  path(); const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#fbf3dc'); gr.addColorStop(.5, '#f6ecd2'); gr.addColorStop(1, '#f9efd8'); g.fillStyle = gr; g.fill();
  g.save(); path(); g.clip();
  const patch = (n, col, al, r0, r1) => { for (let i = 0; i < n * A; i++){ const cx = R() * W, cy = R() * H, r = r0 + R() * (r1 - r0), k = 12 + Math.floor(R() * 10);
    for (let j = 0; j < k; j++){ const x = cx + (R() - .5) * r * 1.6, y = cy + (R() - .5) * r * .9, rr = r * (.14 + R() * .3); g.fillStyle = a(col, al * (.5 + R() * .5)); g.beginPath(); g.ellipse(x, y, rr, rr * (.45 + R() * .25), R() * .6 - .3, 0, 7); g.fill(); } } };
  patch(30, '#cfe8b0', .3, 60, 170); patch(18, '#ffffff', .3, 50, 130); patch(10, '#f4d890', .2, 40, 100);   // heavenly grass, white, gold
  // soft grass in drifts
  { const P = [new Path2D(), new Path2D()]; for (let i = 0; i < 90 * A; i++){ const cx = R() * W, cy = R() * H, r = 20 + R() * 50;
      for (let j = 0; j < 40; j++){ const x = cx + (R() - .5) * r * 2, y = cy + (R() - .5) * r, h = 4 + R() * 5, p = P[j % 2]; p.moveTo(x, y); p.lineTo(x + (R() - .5) * 2, y - h); } }
    g.lineWidth = .9; g.strokeStyle = '#a8cc88'; g.stroke(P[0]); g.strokeStyle = '#d8e8a8'; g.stroke(P[1]); }
  // courts of white marble inlaid with gold
  for (let c = 0; c < Math.max(3, Math.round(5 * A)); c++){ const cx = 280 + R() * (W - 560), cy = 220 + R() * (H - 440), rw = 90 + R() * 110, rh = 60 + R() * 60;
    for (let by = cy - rh; by < cy + rh; by += 18) for (let bx = cx - rw; bx < cx + rw; bx += 18){ const d = ((bx - cx) / rw) ** 2 + ((by - cy) / rh) ** 2; if (d > 1) continue;
      g.globalAlpha = 1 - d * .55; g.fillStyle = (Math.floor(bx / 18) + Math.floor(by / 18)) % 2 ? '#fffcf2' : '#f7efdf'; g.fillRect(bx, by, 17.4, 17.4); g.fillStyle = 'rgba(200,180,140,.25)'; g.fillRect(bx, by + 17, 17.4, .6); g.globalAlpha = 1; }   // soft marble, fading into the grass at its rim
    g.strokeStyle = 'rgba(214,170,70,.8)'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy, rw, rh, 0, 0, 7); g.stroke(); g.lineWidth = 1; g.beginPath(); g.ellipse(cx, cy, rw * .6, rh * .6, 0, 0, 7); g.stroke();
    for (let i = 0; i < 8; i++){ const an = i / 8 * 6.283; g.beginPath(); g.moveTo(cx + Math.cos(an) * rw * .6, cy + Math.sin(an) * rh * .6); g.lineTo(cx + Math.cos(an) * rw, cy + Math.sin(an) * rh); g.stroke(); } }
  // petals of the heaven flowers
  for (let i = 0; i < 900 * A; i++){ const x = R() * W, y = R() * H; g.fillStyle = ['#ffd0e0', '#ffffff', '#ffe8a0', '#ffb8c8'][Math.floor(R() * 4)]; g.beginPath(); g.ellipse(x, y, 1.6, .9, R() * 3, 0, 7); g.fill(); }
  g.restore();
  // the lip of the island, lit
  g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.8)'; path(); g.stroke(); g.lineWidth = 1.2; g.strokeStyle = 'rgba(200,170,110,.6)'; g.save(); g.translate(0, 3); path(); g.stroke(); g.restore();
}
{ const _gd = groundDetail; groundDetail = function(g, B, mapId){ if (hvnIs(mapId)) return hvnFloor(g); return _gd.apply(this, arguments); }; }

/* the gaps in the island: a broken rim, and the sky with clouds far below */
{ const _wb = waterBody; waterBody = function(g, x, y, rx, ry){ if (!heavenHere()) return _wb.apply(this, arguments);
    g.fillStyle = '#9a8a70'; g.beginPath(); g.ellipse(x, y + 8, rx + 8, ry + 4, 0, 0, 7); g.fill();
    const gr = g.createLinearGradient(0, y - ry, 0, y + ry); gr.addColorStop(0, '#8ab8e8'); gr.addColorStop(1, '#cfe6fc'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx + 4, ry, 0, 0, 7); g.fill();
    g.save(); g.beginPath(); g.ellipse(x, y, rx + 4, ry, 0, 0, 7); g.clip();
    for (let i = 0; i < 14; i++){ const cx = x + (R() - .5) * rx * 2, cy = y + (R() - .3) * ry * 1.6, r = 14 + R() * 26; g.fillStyle = `rgba(255,255,255,${.5 + R() * .4})`; g.beginPath(); g.ellipse(cx, cy, r, r * .45, 0, 0, 7); g.fill(); }
    g.restore();
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2.4; g.beginPath(); g.ellipse(x, y, rx + 4, ry, 0, Math.PI * 1.02, Math.PI * 1.98); g.stroke();   // the lit far lip
    g.fillStyle = 'rgba(120,100,70,.55)'; g.beginPath(); g.ellipse(x, y - ry * .55, rx * .9, ry * .3, 0, Math.PI, 0); g.fill();   // the cliff of the far side, in shadow
  }; }

/* ---------- heavenly plants only; no cook, no fire ---------- */
function hvnTidy(){
  const SWAP = {tree:'parijata', palm:'kalpatree', pine:'parijata', himtree:'parijata', banana:'kalpatree', flowerbed:'lotusbowl', frangipani:'parijata', camptree:'kalpatree', crystal:'devapillar', obelisk:'devapillar'};   // bushes, hedges and jars simply go (a row of identical lamps in their place was clutter)
  for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!HVN_EARTHLY.has(p.type)) continue;
    for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1);
    const to = SWAP[p.type]; if (!to || !PROP_TYPES[to]){ PROPS.splice(i, 1); continue; }
    p.type = to; p.variant = Math.floor((p.x + p.y) % 3); delete p.vk; const im = propImg(p.type, p.variant); if (im.collide) obstacles.push({x:p.x, y:p.y, r:im.collide, prop:p}); }
  NAV.grid = null;
}
{ const _pm = paintMap; paintMap = function(mapId){ const r = _pm.apply(this, arguments); if (hvnIs(mapId)){ for (const w of WATERS) if (w.k === 'pond') w.kind = 'sky'; hvnTidy(); } return r; }; }
{ const _cp = campPlace; campPlace = function(){ const r = _cp.apply(this, arguments); if (heavenHere() && CAMP){ hvnTidy();
    const g = terr.getContext('2d'); g.save(); g.setTransform(TS, 0, 0, TS, 0, 0); for (const [rx, ry, al] of [[30, 15, .6], [22, 11, .9]]){ g.fillStyle = `rgba(250,244,226,${al})`; g.beginPath(); g.ellipse(CAMP.x, CAMP.y + 18, rx, ry, 0, 0, 7); g.fill(); } g.restore(); }   // no fire pit
  return r; }; }
{ const _sn = setupNpcs; setupNpcs = function(id){ const r = _sn.apply(this, arguments); if (heavenHere()) for (let i = NPCS.length - 1; i >= 0; i--) if (NPCS[i].id === 'campcook' || NPCS[i].id === 'quarter') NPCS.splice(i, 1); return r; }; }
{ const _cf = campFire; campFire = function(g, x, y, t){ if (!heavenHere()) return _cf.apply(this, arguments);   // a golden lotus lamp burning with a still, holy light
    g.save(); g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(x, y - 16, 0, x, y - 16, 70); gl.addColorStop(0, `rgba(255,230,150,${.35 + .06 * Math.sin(t * 1.5)})`); gl.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = gl; g.fillRect(x - 70, y - 86, 140, 140); g.restore();
    g.fillStyle = '#c8962a'; g.beginPath(); g.ellipse(x, y, 13, 4, 0, 0, 7); g.fill(); g.fillStyle = '#e8b84a'; g.fillRect(x - 3, y - 8, 6, 8);
    for (let i = 0; i < 8; i++){ const an = -Math.PI + (i / 7) * Math.PI; g.fillStyle = i % 2 ? '#f8d070' : '#ffe8a8'; g.beginPath(); g.ellipse(x + Math.cos(an) * 7, y - 11 + Math.sin(an) * 3, 3.2, 6, an + Math.PI / 2, 0, 7); g.fill(); }   // the gold lotus
    const fl = 1 + Math.sin(t * 3) * .06; g.fillStyle = '#fff4c0'; g.beginPath(); g.moveTo(x - 3 * fl, y - 13); g.quadraticCurveTo(x, y - 26 * fl, x + 3 * fl, y - 13); g.closePath(); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x, y - 15, 1.2, 3, 0, 0, 7); g.fill(); }; }
if (typeof cuteBuild === 'function'){ const _cb = cuteBuild; cuteBuild = function(){ const r = _cb.apply(this, arguments); if (heavenHere()) CUTE.decor = CUTE.decor.filter(d => ['flower', 'glint', 'bud'].includes(d.k)); return r; }; }

/* ---------- heavenly props ---------- */
Object.assign(PROP_TYPES, {
  // the coral tree of heaven (ปาริชาติ): a twisting pale trunk, dark leafy crowns covered in crimson blossom
  parijata: (seed, v = 0) => makeProp({w:120, h:150, ax:60, ay:140, seed, shadow:[36, 10], collide:12, paint(g, rng){
    const fl = [['#c8243a', '#ff4a5a', '#ffb0b8'], ['#c82a6a', '#ff5a9a', '#ffc0dc'], ['#d8481e', '#ff7a3a', '#ffc8a0']][v % 3];
    g.strokeStyle = '#7a5a3a'; g.lineCap = 'round';
    const br = (x, y, a, len, w, d) => { const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + x2) / 2 + (rng() - .5) * 8, (y + y2) / 2, x2, y2); g.stroke();
      if (d < 3){ br(x2, y2, a - .45 - rng() * .3, len * .72, w * .66, d + 1); br(x2, y2, a + .4 + rng() * .3, len * .7, w * .66, d + 1); } };
    br(0, 0, -Math.PI / 2 - .05, 40, 9, 0);
    for (const [x, y, r] of [[0, -92, 25], [-30, -76, 19], [30, -78, 19], [-16, -114, 17], [18, -112, 16], [-38, -100, 12], [40, -98, 12]]){
      leafCluster(g, x, y, r, rng, {leafD:'#2e5a2a', leafM:'#3e7434', leafL:'#5a9444', leafH:'#7ab45a'});
      for (let i = 0; i < r * 1.5; i++){ const an = rng() * 6.28, d = Math.sqrt(rng()) * r * .95, fx = x + Math.cos(an) * d, fy = y + Math.sin(an) * d * .82;   // clusters of claw-shaped red blossoms
        g.fillStyle = fl[0]; ov(g, fx + .6, fy + .6, 2.4, 1.3, rng() * 3); g.fill(); g.fillStyle = rng() < .7 ? fl[1] : fl[2]; ov(g, fx, fy, 2, 1.1, rng() * 3); g.fill(); } }
  }}),
  // the wish-granting tree (กัลปพฤกษ์): a spreading tree whose crown is golden leaf, strands of jewels hanging from it
  kalpatree: (seed, v = 0) => makeProp({w:120, h:150, ax:60, ay:140, seed, shadow:[34, 10], collide:11, glow:[0, -90, 46], paint(g, rng){
    g.strokeStyle = '#8a6a3e'; g.lineCap = 'round';
    const br = (x, y, a, len, w, d) => { const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + x2) / 2 + (rng() - .5) * 6, (y + y2) / 2, x2, y2); g.stroke();
      if (d < 3){ br(x2, y2, a - .5 - rng() * .25, len * .7, w * .64, d + 1); br(x2, y2, a + .5 + rng() * .25, len * .7, w * .64, d + 1); } };
    br(0, 0, -Math.PI / 2, 44, 8, 0);
    const pal = {leafD:'#a8741e', leafM:'#d8a032', leafL:'#f4cc58', leafH:'#fff0a8'}, crowns = [[0, -96, 26], [-30, -82, 18], [30, -82, 18], [-14, -118, 15], [16, -118, 15]];
    for (const [x, y, r] of crowns) leafCluster(g, x, y, r, rng, pal);
    for (const [x, y, r] of crowns) for (let i = 0; i < 3; i++){ const sx = x + (rng() - .5) * r * 1.4, sy = y + r * .5, L = 10 + rng() * 14;   // strands of jewels
      g.strokeStyle = 'rgba(255,240,180,.8)'; g.lineWidth = .6; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx, sy + L); g.stroke();
      for (let k = 0; k <= 3; k++){ g.fillStyle = ['#ff5a7a', '#5ac8ff', '#7aff9a', '#fff4c0'][(k + i + v) % 4]; ov(g, sx, sy + L * k / 3, 1.4, 1.4); g.fill(); } }
  }}),
  // a pillar of heaven: white marble banded with gold, a lotus capital
  devapillar: (seed, v = 0) => makeProp({w:44, h:140, ax:22, ay:132, seed, shadow:[16, 6], collide:10, paint(g, rng){
    const h = [118, 100, 126][v % 3]; g.fillStyle = '#d8ccb0'; g.fillRect(-15, -10, 30, 10); g.fillStyle = '#f0e8d4'; g.fillRect(-14, -10, 28, 3);
    const gr = g.createLinearGradient(-10, 0, 10, 0); gr.addColorStop(0, '#e8e0cc'); gr.addColorStop(.4, '#ffffff'); gr.addColorStop(1, '#d8ceb8'); g.fillStyle = gr; g.fillRect(-10, -h, 20, h - 10);
    for (const y of [-26, -h * .55, -h + 14]){ g.fillStyle = '#e3b04b'; g.fillRect(-11, y, 22, 4); g.fillStyle = '#fff0a0'; g.fillRect(-11, y, 22, 1.2); }
    g.fillStyle = '#e3b04b'; for (let i = -2; i <= 2; i++){ ov(g, i * 5.4, -h - 4, 3.2, 6); g.fill(); } g.fillStyle = '#fff0a0'; ov(g, 0, -h - 10, 3, 4); g.fill();
  }}),
  // a golden lotus lamp on a stand, its flame a still light
  lotuslamp: (seed, v = 0) => makeProp({w:30, h:64, ax:15, ay:58, seed, shadow:[9, 3], collide:6, glow:[0, -46, 28], paint(g, rng){
    g.fillStyle = '#c8962a'; g.fillRect(-2, -38, 4, 38); g.fillRect(-8, -3, 16, 3); g.fillStyle = '#e8b84a';
    for (let i = 0; i < 6; i++){ const an = -Math.PI + (i / 5) * Math.PI; ov(g, Math.cos(an) * 5, -41 + Math.sin(an) * 2, 2.6, 4.4, an + Math.PI / 2); g.fill(); }
    g.fillStyle = '#fff4c0'; g.beginPath(); g.moveTo(-2.4, -43); g.quadraticCurveTo(0, -54, 2.4, -43); g.closePath(); g.fill();
  }}),
});

/* ---------- light and air: golden shafts, drifting cloud wisps, rising motes ---------- */
function hvnOver(g){
  const q = hvnQ(), t = T, now = performance.now(), dt = Math.min(.1, (now - (HVN.last || now)) / 1000); HVN.last = now;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < (q ? 5 : 2); i++){ const base = ((i * 300 - cam.x * .2) % (VW + 400) + VW + 400) % (VW + 400) - 200, w = 60 + (i % 3) * 30, al = .06 + .03 * Math.sin(t * .4 + i * 2);
    const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, `rgba(255,236,170,${al})`); gr.addColorStop(1, 'rgba(255,236,170,0)'); g.fillStyle = gr;
    g.beginPath(); g.moveTo(base, 0); g.lineTo(base + w, 0); g.lineTo(base + w * 1.6 - VH * .25, VH); g.lineTo(base - VH * .25, VH); g.closePath(); g.fill(); }
  const nm = q ? 34 : 12; while (HVN.motes.length < nm) HVN.motes.push({x:Math.random() * VW, y:Math.random() * VH, s:Math.random(), p:Math.random() * 6}); HVN.motes.length = nm;
  for (const m of HVN.motes){ m.y -= (6 + m.s * 10) * dt; m.x += Math.sin(t + m.p) * 5 * dt; if (m.y < -4){ m.y = VH + 4; m.x = Math.random() * VW; }
    g.fillStyle = `rgba(255,240,180,${.35 + .3 * Math.sin(t * 3 + m.p)})`; g.beginPath(); g.arc(m.x, m.y, 1 + m.s, 0, 7); g.fill(); }
  g.restore();
  // wisps of cloud drifting across the island
  const nw = q ? 4 : 2; while (HVN.wisps.length < nw) HVN.wisps.push({x:-300 - Math.random() * 600, y:Math.random() * VH, s:.6 + Math.random() * .8, v:10 + Math.random() * 12});
  for (const w of HVN.wisps){ w.x += w.v * dt; if (w.x > VW + 300){ w.x = -300 - Math.random() * 300; w.y = Math.random() * VH; }
    for (let k = 0; k < 5; k++){ const x = w.x + k * 40 * w.s, y = w.y + Math.sin(k * 1.7) * 10, r = (40 + (k % 3) * 18) * w.s; const gl = g.createRadialGradient(x, y, 0, x, y, r); gl.addColorStop(0, 'rgba(255,255,255,.22)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(x - r, y - r, r * 2, r * 2); } }
}
{ const _dw = drawWeather; drawWeather = function(g){ const r = _dw.apply(this, arguments); if (heavenHere()) try { hvnOver(g); } catch (e) {} return r; }; }
if (typeof wxRoll === 'function'){ const _wr = wxRoll; wxRoll = function(){ return heavenHere() ? 'clear' : _wr.apply(this, arguments); }; }

/* ---------- the way up: a colossal world tree with a path of light spiralling up its trunk ---------- */
const heavenGate = gt => hvnIs(gt.to) && !heavenHere();
function wtGround(ctx, gt, cx, cy){
  const x = gt.x - cx, y = gt.y - cy - 4, t = T;
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(40,30,10,.3)'; ctx.beginPath(); ctx.ellipse(x, y + 4, 92, 26, 0, 0, 7); ctx.fill();
  // roots spreading over the ground
  ctx.strokeStyle = '#6a4a28'; ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++){ const an = Math.PI * (.05 + i / 8 * .9), L = 70 + (i % 3) * 14; ctx.lineWidth = 9 - (i % 3) * 2; ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.quadraticCurveTo(x + Math.cos(an) * L * .5, y - 2, x + Math.cos(an) * L, y + Math.sin(an) * L * .25); ctx.stroke(); }
  ctx.restore();
}
function wtAbove(ctx, gt, cx, cy){
  const x = gt.x - cx, y = gt.y - cy - 4, t = T, q = hvnQ();
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  // the trunk rising out of the top of the view
  const tw = 46, gr = ctx.createLinearGradient(x - tw, 0, x + tw, 0); gr.addColorStop(0, '#5a3e22'); gr.addColorStop(.35, '#9a7444'); gr.addColorStop(1, '#4a321c');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x - tw - 12, y - 6); ctx.quadraticCurveTo(x - tw + 6, y - 60, x - tw * .8, y - 400); ctx.lineTo(x + tw * .8, y - 400); ctx.quadraticCurveTo(x + tw - 6, y - 60, x + tw + 12, y - 6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,24,10,.5)'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++){ const bx = x - tw * .6 + i * tw * .24; ctx.beginPath(); ctx.moveTo(bx, y - 10); ctx.quadraticCurveTo(bx + Math.sin(i) * 6, y - 120, bx - 4, y - 400); ctx.stroke(); }   // bark
  // the path of light winding up round it, an arch of light at its foot
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 40; k++){ const u = k / 40, py = y - 16 - u * 380, px = x + Math.sin(u * 14 - t * .6) * (tw + 4), front = Math.cos(u * 14 - t * .6) > 0; if (!front) continue;
    ctx.fillStyle = `rgba(255,236,160,${.55 * (1 - u * .6)})`; ctx.beginPath(); ctx.ellipse(px, py, 9, 3.2, 0, 0, 7); ctx.fill(); }
  const ag = ctx.createRadialGradient(x, y - 26, 4, x, y - 26, 42); ag.addColorStop(0, `rgba(255,250,210,${.85 + .1 * Math.sin(t * 2)})`); ag.addColorStop(1, 'rgba(255,230,150,0)');
  ctx.fillStyle = ag; ctx.beginPath(); ctx.ellipse(x, y - 24, 26, 34, 0, 0, 7); ctx.fill();   // the doorway of light into the trunk
  for (let i = 0, n = q ? 16 : 6; i < n; i++){ const k = (t * .25 + i / n) % 1; ctx.fillStyle = `rgba(255,240,180,${Math.sin(k * Math.PI) * .8})`; ctx.fillRect(x - 30 + (i * 23 % 60), y - 20 - k * 260, 1.6, 1.6); }   // motes rising up the trunk
  ctx.restore();
}
if (typeof wgGround === 'function'){ const _g = wgGround; wgGround = function(ctx, gt){ return heavenGate(gt) ? wtGround.apply(this, arguments) : _g.apply(this, arguments); }; }
if (typeof wgAbove === 'function'){ const _a = wgAbove; wgAbove = function(ctx, gt){ return heavenGate(gt) ? wtAbove.apply(this, arguments) : _a.apply(this, arguments); }; }
