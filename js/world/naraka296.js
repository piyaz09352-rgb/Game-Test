/* VAYRATHEN — js/world/naraka296.js — (v296) นรกอเวจี: the second of the eight lands, a cavern of lava under the volcano
   The owner: «a cave mouth into the lava mountains; inside it is underground — earth, fire, lava, fire monsters». Maps 65
   (ประตูนรกภูมิ) and 66 (บัลลังก์จอมมาร) were a brown field with flowerbeds, hedges, green grass, a cook's pots, glowing
   blue toadstools, a pink pond with floating krathongs and violet obelisks with pink crosses. Now they are one cavern:
   · the floor is black basalt and ash, cracked plates of cooling crust with fire in the cracks, sulphur, scattered bones;
   · the ponds are lava pools; vents breathe smoke and glow; rock spires and stalagmites stand everywhere;
   · it is dark: only the hero, the lava, the vents, the crystals and the gateways give light; stalactites hang from the
     roof at the top of the view, embers rise and ash drifts down;
   · nothing green grows here: no trees (not even dead ones), bushes, flowers, grass or toadstools;
   · the camp keeps its fire (fire burns well in hell) but its plants are rock, its great tree a rock spire;
   · the gateway in, from the lands outside, is a cave mouth glowing with fire.
   The violet obelisk with pink crosses is gone everywhere (the owner: «ตลกไม่เอา»): the prop now draws a natural rock spire. */
'use strict';

const NRK = {embers:[], ash:[], last:0};
const cavernHere = () => { const mp = MAP_ID && MAPS[MAP_ID]; return !!(mp && BIOME[mp.biome] && BIOME[mp.biome].cavern); };
const nrkQ = () => Math.max(0, (typeof GFX !== 'undefined' ? GFX.fx : 1) - (typeof PERF !== 'undefined' && PERF.fps < 28 && PERF.fps > 0 ? 1 : 0));
const NRK_PLANTS = new Set(['tree', 'palm', 'pine', 'bush', 'flowerbed', 'hedge', 'frangipani', 'deadtree', 'thorntree', 'himtree', 'bamboo', 'banana', 'treefern', 'araucaria', 'cycad',
  'fern', 'willow', 'bodhi', 'rubber', 'tamarind', 'rain', 'reed', 'flowerbush', 'mushroom', 'cactus', 'flowers', 'grass', 'tuft', 'flower', 'lotusbowl', 'worldtree', 'camptree', 'camparaucaria']);

/* ---------- the land ---------- */
for (const k of ['naraka', 'demonthrone']) BIOME[k] = {base:['#241c1a', '#2a201c', '#30241e'], mottle:['rgba(10,5,5,.6)', 'rgba(255,120,40,.1)'], blades:null, road:['#3a2e28', '#463830', '#524238'],
  floor:null, ponds:5, pondR:[60, 115], pondCols:['#1a1210', '#a82a0a', '#ff5a1a', '#ffd04a'],
  props:k === 'naraka' ? [['stalag', 6, 1], ['obelisk', 4, 1], ['lavavent', 4, 3], ['rock', 6, 1], ['cauldron', 2, 3], ['crystal', 2, 3]]
    : [['stalag', 5, 1], ['obelisk', 5, 1], ['lavavent', 4, 3], ['rock', 5, 1], ['crystal', 3, 3], ['statue', 1, 2]],
  propN:110, fx:'dark', fxA:.42, tint:'rgba(120,30,10,.1)', cavern:true};

/* ---------- the cavern floor ---------- */
function nrkFloor(g){
  const A = typeof AREA === 'function' ? AREA() : 1, a = (h, al) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${al})`; };
  const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#2c221e'); gr.addColorStop(.5, '#251c19'); gr.addColorStop(1, '#2e2420'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const patch = (n, col, al, r0, r1) => { for (let i = 0; i < n * A; i++){ const cx = R() * W, cy = R() * H, r = r0 + R() * (r1 - r0), k = 12 + Math.floor(R() * 10);
    for (let j = 0; j < k; j++){ const x = cx + (R() - .5) * r * 1.6, y = cy + (R() - .5) * r * .9, rr = r * (.14 + R() * .3); g.fillStyle = a(col, al * (.5 + R() * .5)); g.beginPath(); g.ellipse(x, y, rr, rr * (.45 + R() * .25), R() * .6 - .3, 0, 7); g.fill(); } } };
  patch(28, '#0e0a0a', .35, 60, 160); patch(24, '#5a524c', .16, 50, 130); patch(10, '#6a2a14', .14, 40, 110); patch(8, '#8a7a2a', .1, 30, 70);   // shadow, ash, scorched red, sulphur
  { const P0 = new Path2D(), P1 = new Path2D(), n = Math.round(46000 * A); for (let i = 0; i < n; i++) (R() < .55 ? P0 : P1).rect(R() * W, R() * H, 1 + R() * 1.2, .8 + R() * .6);
    g.fillStyle = 'rgba(8,4,4,.45)'; g.fill(P0); g.fillStyle = 'rgba(150,135,120,.22)'; g.fill(P1); }
  // plates of cooling crust: dark polygons with fire in the seams
  for (let i = 0; i < 70 * A; i++){ const cx = R() * W, cy = R() * H, r = 16 + R() * 26, n = 5 + Math.floor(R() * 3), pts = [];
    for (let k = 0; k < n; k++){ const an = k / n * 6.283 + R() * .4, rr = r * (.7 + R() * .4); pts.push([cx + Math.cos(an) * rr, cy + Math.sin(an) * rr * .55]); }
    g.fillStyle = 'rgba(14,10,10,.55)'; g.beginPath(); pts.forEach(([x, y], k) => k ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill();
    g.strokeStyle = `rgba(255,${90 + R() * 80 | 0},20,${.35 + R() * .3})`; g.lineWidth = 1.2; g.stroke(); }
  // glowing cracks wandering over the floor
  for (let i = 0; i < 220 * A; i++){ let x = R() * W, y = R() * H, an = R() * 6.28; g.strokeStyle = `rgba(255,${80 + R() * 90 | 0},20,${.25 + R() * .35})`; g.lineWidth = .8 + R() * .8; g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 4 + R() * 5; s++){ an += (R() - .5) * 1.2; x += Math.cos(an) * 10 * (.5 + R()); y += Math.sin(an) * 5.5 * (.5 + R()); g.lineTo(x, y); } g.stroke(); }
  // pebbles, obsidian shards, bones
  for (let i = 0; i < 420 * A; i++){ const x = R() * W, y = R() * H, s = 1.2 + R() * 2.8, v = R();
    if (v < .7){ g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x + s * .2, y + s * .35, s, s * .5, 0, 0, 7); g.fill(); g.fillStyle = R() < .5 ? '#3a302c' : '#4e423c'; g.beginPath(); g.ellipse(x, y, s * .85, s * .55, 0, 0, 7); g.fill(); }
    else if (v < .9){ g.fillStyle = '#120e16'; g.beginPath(); g.moveTo(x, y - s * 1.6); g.lineTo(x + s * .7, y); g.lineTo(x - s * .7, y); g.closePath(); g.fill(); g.fillStyle = 'rgba(170,120,220,.4)'; g.fillRect(x - .3, y - s * 1.3, .7, s); }
    else { g.strokeStyle = '#c8bca8'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - s * 1.4, y); g.lineTo(x + s * 1.4, y - s * .4); g.stroke(); g.fillStyle = '#d8ccb8'; for (const e of [-1, 1]){ g.beginPath(); g.arc(x + e * s * 1.4, y - (e > 0 ? s * .4 : 0), .9, 0, 7); g.fill(); } } }
}
{ const _gd = groundDetail; groundDetail = function(g, B, mapId){ const mp = MAPS[mapId]; if (mp && BIOME[mp.biome] && BIOME[mp.biome].cavern) return nrkFloor(g); return _gd.apply(this, arguments); }; }

/* ---------- nothing green grows here ---------- */
function nrkTidy(){
  const SWAP = {worldtree:'obelisk', camptree:'obelisk', camparaucaria:'obelisk', flowerbed:'rock', hedge:'stalag', bush:'rock', frangipani:'lavavent', deadtree:'stalag', thorntree:'stalag', tree:'stalag', jar:'rock'};
  for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!NRK_PLANTS.has(p.type) && p.type !== 'jar') continue;
    for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1);
    const to = SWAP[p.type]; if (!to){ PROPS.splice(i, 1); continue; }
    p.type = to; p.variant = to === 'stalag' ? 0 : to === 'rock' ? 100 + 6 * Math.floor((p.x + p.y) % 3) : Math.floor((p.x + p.y) % 3); /* stalag 1 is the ice one; rocks 100+ are the volcanic ones (props4.js), the low ones carry moss */ delete p.vk; const im = propImg(p.type, p.variant); if (im.collide) obstacles.push({x:p.x, y:p.y, r:im.collide, prop:p}); }
  for (const p of PROPS) if (p.type === 'rock' && p.variant % 1000 < 100){ p.variant += 100; }   // no mossy rocks
  NAV.grid = null;
}
{ const _pm = paintMap; paintMap = function(mapId){ const r = _pm.apply(this, arguments); if (MAPS[mapId] && BIOME[MAPS[mapId].biome] && BIOME[MAPS[mapId].biome].cavern) nrkTidy(); return r; }; }
{ const _cp = campPlace; campPlace = function(){
    if (!cavernHere()) return _cp.apply(this, arguments);
    const mp = MAPS[MAP_ID], land = mp.land; mp.land = 'volcanic';   // the camp's own ground details: ash and grey stalks, not grass and flowers
    let r; try { r = _cp.apply(this, arguments); } finally { mp.land = land; }
    nrkTidy(); return r; }; }
if (typeof cuteBuild === 'function'){ const _cb = cuteBuild; cuteBuild = function(){ const r = _cb.apply(this, arguments); if (cavernHere()) CUTE.decor = CUTE.decor.filter(d => ['pebble', 'ember', 'cinder'].includes(d.k)); return r; }; }

/* ---------- props: a rock spire (in place of the violet obelisk, everywhere) and a lava vent ---------- */
Object.assign(PROP_TYPES, {
  obelisk: (seed, v = 0) => makeProp({w:60, h:140, ax:30, ay:132, seed, shadow:[16, 6], collide:10, paint(g, rng){
    const H = [104, 82, 120][v % 3] + rng() * 14, lean = (rng() - .5) * 8;
    const side = [], top = [lean, -H]; for (let i = 0; i <= 6; i++){ const t = i / 6; side.push([-13 + t * (13 + lean) + (rng() - .5) * 4 * (1 - t), -t * H]); }
    g.fillStyle = '#2a2220'; g.beginPath(); g.moveTo(-15, 0); side.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(top[0], top[1]); for (let i = 6; i >= 0; i--){ const t = i / 6; g.lineTo(13 - t * (13 - lean) + (rng() - .5) * 4 * (1 - t), -t * H); } g.lineTo(15, 0); g.closePath(); g.fill();
    g.fillStyle = '#463a34'; g.beginPath(); g.moveTo(-15, 0); side.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(lean * .6, -H * .9); g.lineTo(-2, 0); g.closePath(); g.fill();   // the lit face
    g.strokeStyle = 'rgba(20,14,12,.7)'; g.lineWidth = 1; for (let i = 0; i < 6; i++){ const y = -10 - rng() * (H - 20); g.beginPath(); g.moveTo(-10 + rng() * 6, y); g.lineTo(-2 + rng() * 10, y - 4 - rng() * 6); g.stroke(); }   // strata and cracks
    g.fillStyle = '#1c1614'; for (let i = 0; i < 4; i++){ g.beginPath(); g.ellipse(-16 + rng() * 32, -2, 4 + rng() * 4, 2.6, 0, 0, 7); g.fill(); }   // rubble at its foot
  }}),
  lavavent: (seed, v = 0) => makeProp({w:64, h:46, ax:32, ay:34, seed, shadow:[24, 6], collide:12, glow:[0, -16, 34], paint(g, rng){
    g.fillStyle = '#2a201c'; g.beginPath(); g.moveTo(-26, 0); g.quadraticCurveTo(-18, -14, -9, -18); g.lineTo(9, -18); g.quadraticCurveTo(18, -14, 26, 0); g.closePath(); g.fill();
    g.fillStyle = '#3e322c'; g.beginPath(); g.moveTo(-26, 0); g.quadraticCurveTo(-18, -14, -9, -18); g.lineTo(-2, -18); g.lineTo(-8, 0); g.closePath(); g.fill();
    const lg = g.createRadialGradient(0, -18, 1, 0, -18, 10); lg.addColorStop(0, '#fff0a0'); lg.addColorStop(.5, '#ff8a1a'); lg.addColorStop(1, '#8a1a06');
    g.fillStyle = lg; g.beginPath(); g.ellipse(0, -18, 9, 3.6, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,110,20,.75)'; g.lineWidth = 1.2; for (const sd of [-1, 1]){ let x = sd * 5, y = -16; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 3; k++){ x += sd * (3 + rng() * 4); y += 4 + rng() * 3; g.lineTo(x, y); } g.stroke(); }   // lava trickling down
    g.fillStyle = 'rgba(200,170,60,.5)'; for (let i = 0; i < 5; i++){ g.beginPath(); g.arc(-14 + rng() * 28, -4 - rng() * 8, 1.4, 0, 7); g.fill(); }   // sulphur crust
  }}),
});

/* ---------- the dark: lava, vents and spires give light; the roof, rising embers, falling ash ---------- */
function nrkOver(g){
  const q = nrkQ(), t = T, now = performance.now(), dt = Math.min(.1, (now - (NRK.last || now)) / 1000); NRK.last = now;
  g.save(); g.globalCompositeOperation = 'lighter';
  const glow = (x, y, r, a) => { if (x < -r || y < -r || x > VW + r || y > VH + r) return; const gl = g.createRadialGradient(x, y, 0, x, y, r); gl.addColorStop(0, `rgba(255,120,40,${a})`); gl.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = gl; g.fillRect(x - r, y - r, r * 2, r * 2); };
  for (const w of WATERS) if (w.k === 'pond' && w.kind === 'lava') glow(w.x - cam.x, w.y - cam.y, Math.max(w.rx, w.ry) * 1.9, .34 + .06 * Math.sin(t * 1.3 + w.seed));
  for (const p of PROPS) if (p.type === 'lavavent') glow(p.x - cam.x, p.y - 18 - cam.y, 70, .26 + .08 * Math.sin(t * 2 + p.x));
  g.restore();
  // smoke from the vents
  for (const p of PROPS){ if (p.type !== 'lavavent') continue; const x = p.x - cam.x, y = p.y - 20 - cam.y; if (x < -60 || x > VW + 60 || y < -140 || y > VH + 40) continue;
    for (let i = 0; i < (q ? 5 : 2); i++){ const k = (t * .25 + i / 5 + p.x * .01) % 1; g.fillStyle = `rgba(60,50,48,${.28 * (1 - k)})`; g.beginPath(); g.arc(x + Math.sin(t + i) * 6 * k, y - k * 90, 6 + k * 16, 0, 7); g.fill(); } }
  // embers rising and ash falling
  const ne = q ? (q > 1 ? 60 : 36) : 14; while (NRK.embers.length < ne) NRK.embers.push({x:Math.random() * VW, y:Math.random() * VH, s:Math.random(), p:Math.random() * 6}); NRK.embers.length = ne;
  for (const e of NRK.embers){ e.y -= (12 + e.s * 22) * dt; e.x += Math.sin(t * 1.4 + e.p) * 10 * dt; if (e.y < -6){ e.y = VH + 6; e.x = Math.random() * VW; }
    g.fillStyle = `rgba(255,${120 + e.s * 100 | 0},40,${.5 + Math.sin(t * 6 + e.p) * .3})`; g.fillRect(e.x, e.y, 1.2 + e.s, 1.2 + e.s); }
  const na = q ? 40 : 14; while (NRK.ash.length < na) NRK.ash.push({x:Math.random() * VW, y:Math.random() * VH, s:Math.random(), p:Math.random() * 6}); NRK.ash.length = na;
  for (const a of NRK.ash){ a.y += (6 + a.s * 8) * dt; a.x += Math.sin(t * .7 + a.p) * 8 * dt; if (a.y > VH + 4){ a.y = -4; a.x = Math.random() * VW; } g.fillStyle = `rgba(150,140,135,${.3 + a.s * .3})`; g.fillRect(a.x, a.y, 1.4, 1); }
  // the roof: stalactites hanging into the top of the view (they drift with the camera a little, being far above)
  g.fillStyle = 'rgba(10,6,6,.92)'; g.beginPath(); g.moveTo(0, 0);
  const off = (cam.x * .4) % 46; for (let x = -off - 46; x <= VW + 46; x += 23){ const k = Math.abs(Math.sin((x + cam.x * .4) * .037) * 7 + Math.sin((x + cam.x * .4) * .011) * 5); g.lineTo(x, 6 + k * .6); g.lineTo(x + 11, 14 + k * 3.2); }
  g.lineTo(VW, 0); g.closePath(); g.fill();
  const vg = g.createLinearGradient(0, 0, 0, 70); vg.addColorStop(0, 'rgba(20,6,4,.5)'); vg.addColorStop(1, 'rgba(20,6,4,0)'); g.fillStyle = vg; g.fillRect(0, 0, VW, 70);
}
{ const _dw = drawWeather; drawWeather = function(g){ const r = _dw.apply(this, arguments); if (cavernHere()) try { nrkOver(g); } catch (e) {} return r; }; }

/* ---------- the way in: a cave mouth in a rock face, glowing with fire from inside ---------- */
const cavernGate = gt => { const to = MAPS[gt.to]; return !!(to && BIOME[to.biome] && BIOME[to.biome].cavern) && !cavernHere(); };
function cmGround(ctx, gt, cx, cy){
  const x = gt.x - cx, y = gt.y - cy - 4, t = T;
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(20,10,6,.4)'; ctx.beginPath(); ctx.ellipse(x, y + 6, 74, 22, 0, 0, 7); ctx.fill();
  // the rock face
  ctx.fillStyle = '#3a2e28'; ctx.beginPath(); ctx.moveTo(-70 + x, y + 8); ctx.lineTo(-62 + x, y - 46); ctx.lineTo(-40 + x, y - 78); ctx.lineTo(-8 + x, y - 92); ctx.lineTo(24 + x, y - 86); ctx.lineTo(52 + x, y - 66); ctx.lineTo(68 + x, y - 30); ctx.lineTo(72 + x, y + 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#54443a'; ctx.beginPath(); ctx.moveTo(-70 + x, y + 8); ctx.lineTo(-62 + x, y - 46); ctx.lineTo(-40 + x, y - 78); ctx.lineTo(-8 + x, y - 92); ctx.lineTo(-20 + x, y - 40); ctx.lineTo(-30 + x, y + 8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(20,12,10,.6)'; ctx.lineWidth = 1.2; for (const [a, b, c, d] of [[-50, -50, -30, -64], [30, -60, 50, -40], [-10, -80, 6, -70], [40, -20, 60, -10]]){ ctx.beginPath(); ctx.moveTo(x + a, y + b); ctx.lineTo(x + c, y + d); ctx.stroke(); }
  // the mouth: black inside, fire glowing deep within
  const mg = ctx.createRadialGradient(x, y - 6, 4, x, y - 18, 44); mg.addColorStop(0, `rgba(255,${150 + 40 * Math.sin(t * 2) | 0},50,.95)`); mg.addColorStop(.35, 'rgba(160,40,10,.9)'); mg.addColorStop(.7, '#120806'); mg.addColorStop(1, '#0a0404');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.moveTo(x - 36, y + 8); ctx.quadraticCurveTo(x - 38, y - 44, x, y - 52); ctx.quadraticCurveTo(x + 38, y - 44, x + 36, y + 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#241a16'; for (let i = 0; i < 7; i++){ const px = x - 30 + i * 10; ctx.beginPath(); ctx.moveTo(px - 4, y - 46 + Math.abs(i - 3) * 4); ctx.lineTo(px + 4, y - 46 + Math.abs(i - 3) * 4); ctx.lineTo(px, y - 34 + Math.abs(i - 3) * 4 - (i % 2) * 4); ctx.closePath(); ctx.fill(); }   // teeth of rock at the lip
  ctx.restore();
}
function cmAbove(ctx, gt, cx, cy){
  const x = gt.x - cx, y = gt.y - cy - 4, t = T, q = nrkQ();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const gl = ctx.createRadialGradient(x, y - 14, 0, x, y - 14, 70); gl.addColorStop(0, `rgba(255,120,40,${.3 + .08 * Math.sin(t * 2.4)})`); gl.addColorStop(1, 'rgba(255,60,10,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 70, y - 84, 140, 140);
  for (let i = 0, n = q ? 14 : 6; i < n; i++){ const k = (t * .4 + i / n) % 1; ctx.fillStyle = `rgba(255,${150 + (i % 3) * 30},60,${(1 - k) * .8})`; ctx.fillRect(x - 22 + (i * 37 % 44) + Math.sin(t * 2 + i) * 4, y - 20 - k * 70, 1.6, 1.6); }   // embers blown out of the cave
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < (q ? 4 : 2); i++){ const k = (t * .18 + i / 4) % 1; ctx.fillStyle = `rgba(50,40,38,${.3 * (1 - k)})`; ctx.beginPath(); ctx.arc(x + Math.sin(t * .8 + i) * 8, y - 56 - k * 70, 8 + k * 18, 0, 7); ctx.fill(); }   // smoke
  ctx.restore();
}
if (typeof wgGround === 'function'){ const _g = wgGround; wgGround = function(ctx, gt){ return cavernGate(gt) ? cmGround.apply(this, arguments) : _g.apply(this, arguments); }; }
if (typeof wgAbove === 'function'){ const _a = wgAbove; wgAbove = function(ctx, gt){ return cavernGate(gt) ? cmAbove.apply(this, arguments) : _a.apply(this, arguments); }; }

/* ---------- the sound of the cavern: no birds or crickets (the 'dark' land already has none), the lava's low roar ---------- */
if (typeof BIOME_MOOD !== 'undefined'){ BIOME_MOOD.naraka = 'dark'; BIOME_MOOD.demonthrone = 'dark'; }

/* ---------- (v296) the owner: the dragon skeleton on its sand slab looks childish — «ลบให้หมดเลย»: no ribcage on any map ---------- */
{ const _ap = addProp; addProp = function(type){ if (type === 'ribcage') return {type, x:-9999, y:-9999, variant:0}; return _ap.apply(this, arguments); }; }
