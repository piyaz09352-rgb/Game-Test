/* VAYRATHEN — js/world/cave350.js — (v350) ถ้ำหินปูนเชียงดาว becomes a real cave
   The owner: «ผมอยากได้แมพที่อยู่ในถ่ำบ้าง». Map 6 was called a cave but was one wide dark field you could cross in any
   direction. Now it is the inside of a mountain:
   · solid rock everywhere except the passages: winding tunnels follow the trails from every gateway to the shrine
     chamber in the middle, and side tunnels branch to hunting chambers of different shapes; the deepest chamber, the
     farthest from every gate, is the Hornet Queen's lair;
   · the rock is drawn as walls with a lit rim and a darker face below it (a little height, as seen from above), the
     floor darkens toward the walls; stalactites hang from the roof at the top of the view and drops fall from it;
   · light comes only from the crystals, the hero, torches along the tunnels and shafts of daylight through cracks in
     the roof; there is no day or night and no weather underground; an underground stream crosses two chambers;
   · the walls are solid for everyone (heroes, monsters, AI adventurers, Auto): walking, pathfinding, spawning, the
     boss's spot and line of sight all use the cave's own map of open ground (a distance field, so it is quick).
   The same map always comes out the same (its own seeded random). Other maps are untouched. */
'use strict';
const CAVE_MAPS = new Set([6]);
const CAVE = {on:false, id:-1, c:20, cols:0, rows:0, d:null, circ:[], chambers:[], lair:null, shafts:[], torches:[], stream:[], drops:[]};
const caveOn = () => CAVE.on && CAVE.id === MAP_ID;
const caveRng = seed => { let s = seed >>> 0 || 1; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
/* the distance (world units) from (x,y) to the nearest rock, 0 inside rock */
function caveDist(x, y){ const c = CAVE.c, X = Math.floor(x / c), Y = Math.floor(y / c); if (X < 0 || Y < 0 || X >= CAVE.cols || Y >= CAVE.rows) return 0; return CAVE.d[Y * CAVE.cols + X]; }

/* ---------- the layout: open circles along tunnels and in chambers ---------- */
function caveLayout(mapId){
  const r = caveRng(mapId * 7919 + 350), C = [], add = (x, y, rr) => C.push({x, y, r:rr});
  // a tunnel: close circles along the line, its width changing slowly with the distance walked (a quick change made a
  // string of round bulges), now and then a wider bay to one side
  const tunnel = (pts, w0, w1) => { let s = 0; const ph = r() * 9, ph2 = r() * 9;
    for (let i = 0; i < pts.length - 1; i++){ const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(L / 14)), nx = -(by - ay) / (L || 1), ny = (bx - ax) / (L || 1);
      for (let k = 0; k < n; k++){ const t = k / n, w = (w0 + (w1 - w0) * ((i + t) / Math.max(1, pts.length - 1))) * (.86 + .14 * Math.sin(s * .0042 + ph) + .06 * Math.sin(s * .011 + ph2)), x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
        add(x, y, w); const bay = Math.sin(s * .0027 + ph2 * 2); if (bay > .7) add(x + nx * w * .55 * Math.sign(Math.sin(ph + i)), y + ny * w * .55 * Math.sign(Math.sin(ph + i)), w * .7 * (bay - .55) / .45); s += L / n; } } };
  const chamber = (cx, cy, R0) => { const n = 5 + (r() * 4 | 0); add(cx, cy, R0 * .8); for (let i = 0; i < n; i++){ const a = r() * Math.PI * 2, d = R0 * (.35 + r() * .5); add(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .8, R0 * (.45 + r() * .3)); }
    CAVE.chambers.push({x:cx, y:cy, r:R0}); };
  const wiggle = (ax, ay, bx, by) => { const pts = [], L = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / L, ny = (bx - ax) / L, b1 = (r() - .5) * L * .5, b2 = (r() - .5) * L * .4;
    for (let i = 0, n = Math.ceil(L / 40); i <= n; i++){ const t = i / n, s = Math.sin(t * Math.PI) * b1 + Math.sin(t * Math.PI * 2) * b2 * .5; pts.push([ax + (bx - ax) * t + nx * s, ay + (by - ay) * t + ny * s]); } return pts; };
  CAVE.chambers = [];
  // the trails from the gates to the middle are the main tunnels; the gate mouths are wide
  for (const tr of TRAIL.lines) tunnel(tr, 150, 125);
  for (const gt of GATES) add(gt.x, gt.y, 170);
  // the shrine chamber in the middle
  const cx = W * .5, cy = H * .5; chamber(cx, cy, 330);
  // hunting chambers: spread over the map, apart from each other and from the middle
  const want = 7, keep = (x, y, R) => x > R + 160 && x < W - R - 160 && y > R + 140 && y < H - R - 140 && Math.hypot(x - cx, y - cy) > 760 && CAVE.chambers.every(c => Math.hypot(c.x - x, c.y - y) > c.r + R + 360) && GATES.every(g => Math.hypot(g.x - x, g.y - y) > R + 420);
  for (let t = 0; t < 900 && CAVE.chambers.length < want + 1; t++){ const R = 240 + r() * 170, x = R + 160 + r() * (W - 2 * R - 320), y = R + 140 + r() * (H - 2 * R - 280); if (!keep(x, y, R)) continue; chamber(x, y, R);
    // a side tunnel to the nearest open ground already made
    let best = null, bd = 1e9; for (const o of C.slice(0, C.length - 12)){ const d = Math.hypot(o.x - x, o.y - y) - o.r; if (d < bd){ bd = d; best = o; } }
    if (best) tunnel(wiggle(x, y, best.x, best.y), 95 + r() * 30, 105 + r() * 25); }
  // a loop or two between chambers, so a cave is not one dead end after another
  const hc = CAVE.chambers.slice(1); for (let i = 0; i < 2 && hc.length > 3; i++){ const a = hc[(r() * hc.length) | 0], b = hc.filter(c => c !== a).sort((p, q) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y))[0]; if (b) tunnel(wiggle(a.x, a.y, b.x, b.y), 90, 100); }
  // the lair: the chamber farthest from every gate
  CAVE.lair = hc.slice().sort((a, b) => Math.min(...GATES.map(g => Math.hypot(g.x - b.x, g.y - b.y))) - Math.min(...GATES.map(g => Math.hypot(g.x - a.x, g.y - a.y))))[0] || null;
  if (CAVE.lair){ CAVE.lair.lair = true; add(CAVE.lair.x, CAVE.lair.y, CAVE.lair.r * .95); }
  CAVE.circ = C;
  // the open-ground grid and its distance field (two chamfer passes)
  const c = CAVE.c, cols = CAVE.cols = Math.ceil(W / c), rows = CAVE.rows = Math.ceil(H / c), open = new Uint8Array(cols * rows);
  for (const o of C){ const x0 = Math.max(0, Math.floor((o.x - o.r) / c)), x1 = Math.min(cols - 1, Math.floor((o.x + o.r) / c)), y0 = Math.max(0, Math.floor((o.y - o.r) / c)), y1 = Math.min(rows - 1, Math.floor((o.y + o.r) / c));
    for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) if (Math.hypot((gx + .5) * c - o.x, (gy + .5) * c - o.y) < o.r) open[gy * cols + gx] = 1; }
  for (let gx = 0; gx < cols; gx++){ open[gx] = 0; open[(rows - 1) * cols + gx] = 0; } for (let gy = 0; gy < rows; gy++){ open[gy * cols] = 0; open[gy * cols + cols - 1] = 0; }
  const d = new Float32Array(cols * rows); for (let i = 0; i < d.length; i++) d[i] = open[i] ? 1e9 : 0;
  const D1 = c, D2 = c * 1.414;
  for (let y = 1; y < rows - 1; y++) for (let x = 1; x < cols - 1; x++){ const i = y * cols + x; if (!d[i]) continue; d[i] = Math.min(d[i], d[i - 1] + D1, d[i - cols] + D1, d[i - cols - 1] + D2, d[i - cols + 1] + D2); }
  for (let y = rows - 2; y > 0; y--) for (let x = cols - 2; x > 0; x--){ const i = y * cols + x; if (!d[i]) continue; d[i] = Math.min(d[i], d[i + 1] + D1, d[i + cols] + D1, d[i + cols + 1] + D2, d[i + cols - 1] + D2); }
  for (let i = 0; i < d.length; i++) if (d[i]) d[i] -= c * .5;   // from the cell's middle to the rock's edge
  CAVE.d = d;
  // light shafts in some chambers, torches along the main tunnels, the stream across two chambers
  CAVE.shafts = CAVE.chambers.filter((ch, i) => i && r() < .55).map(ch => ({x:ch.x + (r() - .5) * ch.r * .6, y:ch.y + (r() - .5) * ch.r * .5, w:60 + r() * 50, ph:r() * 6}));
  CAVE.torches = []; for (const tr of TRAIL.lines) for (let i = 18; i < tr.length - 8; i += 26){ const [x, y] = tr[i], [x2, y2] = tr[Math.min(tr.length - 1, i + 1)], L = Math.hypot(x2 - x, y2 - y) || 1, nx = -(y2 - y) / L, ny = (x2 - x) / L, sd = (i / 26) % 2 ? 1 : -1;
    for (let k = 60; k < 200; k += 8){ const px = x + nx * sd * k, py = y + ny * sd * k; if (caveDist(px, py) < 26){ CAVE.torches.push({x:px - nx * sd * 18, y:py - ny * sd * 18, ph:r() * 6}); break; } } }
  CAVE.stream = []; for (const ch of hc.filter(c => !c.lair).slice(0, 2)){ const a = r() * Math.PI, pts = []; for (let k = -1.2; k <= 1.2; k += .1){ const s = Math.sin(k * 3 + ch.x) * 26; pts.push([ch.x + Math.cos(a) * ch.r * k - Math.sin(a) * s, ch.y + Math.sin(a) * ch.r * .8 * k + Math.cos(a) * s]); } CAVE.stream.push(pts); }
}

/* ---------- painting the rock over the ground ---------- */
function cavePaint(){
  const g = terr.getContext('2d'), w = terr.width, h = terr.height, rock = document.createElement('canvas'); rock.width = w; rock.height = h;
  const q = rock.getContext('2d'), r = caveRng(CAVE.id * 31 + 7); q.setTransform(TS, 0, 0, TS, 0, 0);
  // the rock's top: dark limestone with lighter and darker patches, strata cracks
  q.fillStyle = '#342c24'; q.fillRect(0, 0, W, H);
  for (let i = 0; i < 900 * AREA(); i++){ const x = r() * W, y = r() * H, rr = 20 + r() * 90; q.fillStyle = r() < .55 ? `rgba(96,84,68,${.14 + r() * .2})` : `rgba(12,10,8,${.18 + r() * .22})`; q.beginPath(); q.ellipse(x, y, rr, rr * (.5 + r() * .4), r() * 3, 0, 7); q.fill(); }
  q.strokeStyle = 'rgba(12,10,8,.45)'; q.lineWidth = 2; for (let i = 0; i < 420 * AREA(); i++){ const x = r() * W, y = r() * H; q.beginPath(); q.moveTo(x, y); q.lineTo(x + (r() - .5) * 60, y + (r() - .2) * 20); q.lineTo(x + (r() - .5) * 90, y + r() * 30); q.stroke(); }
  // the lit rim along the edge of the passages
  q.strokeStyle = 'rgba(160,140,110,.7)'; q.lineWidth = 18; for (const o of CAVE.circ){ q.beginPath(); q.arc(o.x, o.y, o.r + 4, 0, 7); q.stroke(); }
  q.strokeStyle = 'rgba(200,184,150,.35)'; q.lineWidth = 5; for (const o of CAVE.circ){ q.beginPath(); q.arc(o.x, o.y, o.r + 1, 0, 7); q.stroke(); }
  // cut the passages out
  q.globalCompositeOperation = 'destination-out'; q.fillStyle = '#000'; for (const o of CAVE.circ){ q.beginPath(); q.arc(o.x, o.y, o.r, 0, 7); q.fill(); }
  q.globalCompositeOperation = 'source-over';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  // the floor darkens toward the walls (the rock's shadow), then the wall's face (the rock moved down, darker), then its top
  g.shadowColor = 'rgba(0,0,0,.75)'; g.shadowBlur = 46 * TS; g.drawImage(rock, 0, 0); g.shadowBlur = 0; g.shadowColor = 'transparent';
  const face = document.createElement('canvas'); face.width = w; face.height = h; const f = face.getContext('2d'); f.drawImage(rock, 0, 0); f.globalCompositeOperation = 'source-in'; f.fillStyle = '#100c0a'; f.fillRect(0, 0, w, h);
  g.drawImage(face, 0, 38 * TS); g.drawImage(face, 0, 20 * TS); g.drawImage(rock, 0, 0);
  g.restore();
  // the stream: shallow water over the floor (walkable), and a few puddles of dripwater
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const s of CAVE.stream){ for (const [wd, col] of [[46, 'rgba(20,40,50,.75)'], [32, 'rgba(40,90,110,.8)'], [14, 'rgba(110,170,190,.5)']]){ g.strokeStyle = col; g.lineWidth = wd; g.beginPath(); s.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); } }
  g.restore();
  // stalagmites and crystals along the walls, torches on them
  for (let i = 0, t = 0; i < 70 * AREA() && t < 4000; t++){ const x = 60 + r() * (W - 120), y = 80 + r() * (H - 120), dd = caveDist(x, y); if (dd < 24 || dd > 70 || trailD(x, y) < 60 || GATES.some(gt => Math.hypot(gt.x - x, gt.y - y) < 170) || (CAMP && Math.hypot(x - CAMP.x, y - CAMP.y) < 230)) continue;
    if (typeof addProp === 'function') addProp(r() < .7 ? 'stalag' : 'crystal', x, y, Math.floor(r() * 2)); i++; }
}
/* what the original painting put inside the rock goes */
function caveClear(){
  const inRock = (x, y, m) => caveDist(x, y) < m;
  for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (inRock(p.x, p.y, 18)){ PROPS.splice(i, 1); const k = obstacles.findIndex(o => o.prop === p); if (k >= 0) obstacles.splice(k, 1); } }
  for (let i = obstacles.length - 1; i >= 0; i--){ const o = obstacles[i]; if (inRock(o.x, o.y, 6)) obstacles.splice(i, 1); }
  for (let i = WATERS.length - 1; i >= 0; i--){ const wv = WATERS[i]; if (wv.k === 'pond' && inRock(wv.x, wv.y, 30)) WATERS.splice(i, 1); }
}
if (typeof paintMap === 'function'){ const _pm = paintMap; paintMap = function(mapId){
    if (!CAVE_MAPS.has(mapId)){ CAVE.on = false; return _pm.apply(this, arguments); }
    CAVE.on = false; CAVE.id = mapId; caveLayout(mapId);
    const r = _pm.apply(this, arguments);
    CAVE.on = true; try { caveClear(); cavePaint(); } catch (e) { console.warn('cave350', e); }
    return r; }; }
if (typeof loadMap === 'function'){ const _lm = loadMap; loadMap = function(id){ if (!CAVE_MAPS.has(id | 0)) CAVE.on = false; return _lm.apply(this, arguments); }; }

// the floor: bare rock with cracks (the stone flags of the old field looked laid by hand); glowing toadstools only here and
// there by the walls (they covered the whole floor)
if (BIOME.cave){ BIOME.cave.floor = {kind:'cracks', n:22};
  // the floor a shade lighter than the rock around it, and the dark a little less deep, so the walls read as walls
  BIOME.cave.base = ['#4c463e', '#544d44', '#5c554a']; BIOME.cave.fxA = .5; }
// (filtered when drawn: other files rebuild the decorations after any build hook)
if (typeof cuteDecor === 'function'){ const _cd = cuteDecor; cuteDecor = function(g){ if (CUTE.map !== MAP_ID) cuteBuild();
    if (caveOn() && CUTE._cv !== CUTE.decor){ let i = 0, j = 0; CUTE.decor = CUTE.decor.filter(d => d.k === 'glowmush' ? caveDist(d.x, d.y) < 110 && (i++ % 5 === 0) : d.k === 'wisp' ? (j++ % 4 === 0) : !['flower', 'bud', 'grass', 'tuft', 'butterfly'].includes(d.k)); CUTE._cv = CUTE.decor; }
    return _cd.apply(this, arguments); }; }

/* ---------- solid rock for everyone ---------- */
{ const _w = walkable; walkable = function(x, y, r = 12){ if (caveOn() && caveDist(x, y) < r) return false; return _w.apply(this, arguments); }; }
{ const _ri = randIn; randIn = function(z, r){ if (!caveOn()) return _ri.apply(this, arguments);
    for (let i = 0; i < 60; i++){ const p = _ri.call(this, z, r); if (caveDist(p.x, p.y) >= (r || 12) + 10) return p; }
    const ch = CAVE.chambers[1 + ((Math.random() * (CAVE.chambers.length - 1)) | 0)] || CAVE.chambers[0]; return {x:ch.x, y:ch.y}; }; }
{ const _po = pushOut; pushOut = function(e, r){ _po.apply(this, arguments); if (!caveOn() || !e) return;
    for (let k = 0; k < 3; k++){ const d0 = caveDist(e.x, e.y); if (d0 >= r) return;
      // step up the distance field: toward open ground
      const s = CAVE.c, gx = caveDist(e.x + s, e.y) - caveDist(e.x - s, e.y), gy = caveDist(e.x, e.y + s) - caveDist(e.x, e.y - s), L = Math.hypot(gx, gy);
      if (L < .01){ const ch = CAVE.chambers.slice().sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0]; if (ch){ e.x = ch.x; e.y = ch.y; } return; }
      e.x += gx / L * (r - d0 + 1); e.y += gy / L * (r - d0 + 1); } }; }
{ const _lc = lineClear; lineClear = function(ax, ay, bx, by, r = 12){ if (caveOn()){ const L = Math.hypot(bx - ax, by - ay), n = Math.ceil(L / 10); for (let i = 0; i <= n; i++){ const t = i / n; if (caveDist(ax + (bx - ax) * t, ay + (by - ay) * t) < r - 1) return false; } } return _lc.apply(this, arguments); }; }
{ const _nb = navBuild; navBuild = function(){ _nb.apply(this, arguments); if (!caveOn() || !NAV.grid) return; const {c, cols, rows, R} = NAV, gr = NAV.grid;
    for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) if (caveDist((gx + .5) * c, (gy + .5) * c) < R) gr[gy * cols + gx] = 1; }; }
// the boss waits in its lair
if (typeof bossSpot === 'function'){ const _bs = bossSpot; bossSpot = function(){ if (!caveOn() || !CAVE.lair) return _bs.apply(this, arguments);
    for (let i = 0; i < 40; i++){ const a = Math.random() * 7, d = Math.random() * CAVE.lair.r * .5, x = CAVE.lair.x + Math.cos(a) * d, y = CAVE.lair.y + Math.sin(a) * d; if (caveDist(x, y) > 70) return {x, y}; }
    return {x:CAVE.lair.x, y:CAVE.lair.y}; }; }
// no sky underground: the night tint is left out in render.js (caveOn), and the dark biomes have no weather already

/* ---------- light and the roof ---------- */
{ const _dw = drawWeather; drawWeather = function(g){ const r = _dw.apply(this, arguments); if (caveOn()) try { caveOver(g); } catch (e) {} return r; }; }
function caveOver(g){
  const t = T, cx = cam.x, cy = cam.y, q = typeof GFX !== 'undefined' ? GFX.fx : 1;
  g.save(); g.globalCompositeOperation = 'lighter';
  // daylight through cracks in the roof: a soft slanted shaft and a pool of light on the floor
  for (const s of CAVE.shafts){ const x = s.x - cx, y = s.y - cy; if (x < -260 || x > VW + 260 || y < -300 || y > VH + 140) continue; const a = .1 + Math.sin(t * .4 + s.ph) * .02;
    const gr = g.createLinearGradient(x + 60, y - 280, x, y); gr.addColorStop(0, `rgba(255,240,200,0)`); gr.addColorStop(.6, `rgba(255,236,190,${a})`); gr.addColorStop(1, `rgba(255,236,190,${a * 1.4})`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(x + 40 - s.w * .3, y - 300); g.lineTo(x + 40 + s.w * .3, y - 300); g.lineTo(x + s.w, y); g.lineTo(x - s.w, y); g.closePath(); g.fill();
    const pool = g.createRadialGradient(x, y, 4, x, y, s.w * 1.3); pool.addColorStop(0, `rgba(255,236,190,${a * 2.2})`); pool.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = pool; g.beginPath(); g.ellipse(x, y, s.w * 1.3, s.w * .7, 0, 0, 7); g.fill(); }
  // torches: a warm flickering glow on the wall
  for (const o of CAVE.torches){ const x = o.x - cx, y = o.y - cy - 26; if (x < -90 || x > VW + 90 || y < -90 || y > VH + 90) continue; const k = .8 + Math.sin(t * 9 + o.ph) * .1 + Math.sin(t * 23 + o.ph) * .06;
    const gl = g.createRadialGradient(x, y, 2, x, y, 80 * k); gl.addColorStop(0, `rgba(255,190,90,${.42 * k})`); gl.addColorStop(1, 'rgba(255,150,60,0)'); g.fillStyle = gl; g.beginPath(); g.arc(x, y, 80 * k, 0, 7); g.fill(); }
  // the stream glints
  for (const s of CAVE.stream) for (let i = 0; i < s.length; i += 2){ const [wx, wy] = s[i], x = wx - cx, y = wy - cy; if (x < -20 || x > VW + 20 || y < -20 || y > VH + 20) continue; const k = (Math.sin(t * 2.4 + i * .9) + 1) / 2; g.fillStyle = `rgba(150,210,230,${.1 + k * .14})`; g.fillRect(x - 5, y - 1, 10, 2); }
  g.restore();
  // torch flames (drawn plainly, on top of the dark)
  for (const o of CAVE.torches){ const x = o.x - cx, y = o.y - cy; if (x < -20 || x > VW + 20 || y < -60 || y > VH + 20) continue;
    g.fillStyle = '#3a2a1c'; g.fillRect(x - 2, y - 26, 4, 18); const fl = 6 + Math.sin(t * 14 + o.ph) * 1.6; g.fillStyle = '#ffb040'; g.beginPath(); g.ellipse(x, y - 30, 4, fl, 0, 0, 7); g.fill(); g.fillStyle = '#fff0b0'; g.beginPath(); g.ellipse(x, y - 29, 2, fl * .5, 0, 0, 7); g.fill(); }
  // drops falling from the roof, catching the light
  const nd = q > 1 ? 26 : q ? 14 : 6; while (CAVE.drops.length < nd) CAVE.drops.push({x:Math.random() * VW, y:Math.random() * VH, v:120 + Math.random() * 120}); CAVE.drops.length = nd;
  const dt = Math.min(.05, Math.max(0, T - (CAVE.lt || T))); CAVE.lt = T;
  for (const d of CAVE.drops){ d.y += d.v * dt; if (d.y > VH){ d.y = -10; d.x = Math.random() * VW; } g.fillStyle = 'rgba(170,200,215,.55)'; g.fillRect(d.x, d.y, 1.2, 5); }
  // the roof: stalactites hanging into the top of the view (they drift with the camera a little, being far above)
  g.fillStyle = 'rgba(14,12,10,.94)'; g.beginPath(); g.moveTo(0, 0);
  const off = (cam.x * .4) % 46; for (let x = -off - 46; x <= VW + 46; x += 23){ const k = Math.abs(Math.sin((x + cam.x * .4) * .037) * 7 + Math.sin((x + cam.x * .4) * .011) * 5); g.lineTo(x, 6 + k * .6); g.lineTo(x + 11, 14 + k * 3.4); }
  g.lineTo(VW, 0); g.closePath(); g.fill();
  const vg = g.createLinearGradient(0, 0, 0, 70); vg.addColorStop(0, 'rgba(8,8,10,.55)'); vg.addColorStop(1, 'rgba(8,8,10,0)'); g.fillStyle = vg; g.fillRect(0, 0, VW, 70);
}

/* ---------- the way in: on the maps next door, the gateway into the cave is a cave mouth in a rock face ---------- */
const caveGate = gt => !!(gt && CAVE_MAPS.has(gt.to)) && !CAVE_MAPS.has(MAP_ID);
function cvMouth(ctx, gt, cx, cy){
  const x = gt.x - cx, y = gt.y - cy - 4, t = T;
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(20,18,16,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 6, 78, 22, 0, 0, 7); ctx.fill();
  // the rock face: grey limestone, a lit left side, cracks, a little moss
  const face = [[-74, 8], [-66, -44], [-44, -80], [-10, -96], [26, -88], [56, -66], [72, -30], [76, 8]];
  ctx.fillStyle = '#5e574c'; ctx.beginPath(); face.forEach(([a, b], i) => i ? ctx.lineTo(x + a, y + b) : ctx.moveTo(x + a, y + b)); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7a7264'; ctx.beginPath(); ctx.moveTo(x - 74, y + 8); ctx.lineTo(x - 66, y - 44); ctx.lineTo(x - 44, y - 80); ctx.lineTo(x - 10, y - 96); ctx.lineTo(x - 22, y - 42); ctx.lineTo(x - 32, y + 8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(30,26,22,.55)'; ctx.lineWidth = 1.2; for (const [a, b, c, d] of [[-52, -52, -32, -66], [32, -62, 52, -42], [-12, -84, 4, -72], [42, -22, 62, -12]]){ ctx.beginPath(); ctx.moveTo(x + a, y + b); ctx.lineTo(x + c, y + d); ctx.stroke(); }
  ctx.fillStyle = 'rgba(80,120,60,.55)'; for (const [a, b, r] of [[-60, -20, 6], [-48, -60, 5], [50, -50, 5], [64, -10, 6]]){ ctx.beginPath(); ctx.ellipse(x + a, y + b, r, r * .6, 0, 0, 7); ctx.fill(); }
  // the mouth: dark inside, a faint cool glow of crystals far within
  const mg = ctx.createRadialGradient(x, y - 10, 4, x, y - 18, 46); mg.addColorStop(0, `rgba(90,170,190,${.55 + .1 * Math.sin(t * 1.3)})`); mg.addColorStop(.35, 'rgba(30,50,60,.95)'); mg.addColorStop(.75, '#0e0d0c'); mg.addColorStop(1, '#080707');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.moveTo(x - 38, y + 8); ctx.quadraticCurveTo(x - 40, y - 46, x, y - 54); ctx.quadraticCurveTo(x + 40, y - 46, x + 38, y + 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4a443a'; for (let i = 0; i < 7; i++){ const px = x - 30 + i * 10, b = y - 48 + Math.abs(i - 3) * 4; ctx.beginPath(); ctx.moveTo(px - 4, b); ctx.lineTo(px + 4, b); ctx.lineTo(px, b + 12 + (i % 2) * 5); ctx.closePath(); ctx.fill(); }   // stalactites at the lip
  ctx.restore();
}
function cvMouthAbove(ctx, gt, cx, cy){ const x = gt.x - cx, y = gt.y - cy - 4, t = T;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(x, y - 16, 0, x, y - 16, 60); gl.addColorStop(0, `rgba(110,190,210,${.16 + .04 * Math.sin(t * 1.7)})`); gl.addColorStop(1, 'rgba(110,190,210,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 60, y - 76, 120, 120);
  ctx.globalCompositeOperation = 'source-over'; for (let i = 0; i < 3; i++){ const k = (t * .12 + i / 3) % 1; ctx.fillStyle = `rgba(200,215,220,${.14 * (1 - k)})`; ctx.beginPath(); ctx.arc(x - 20 + i * 20 + Math.sin(t * .6 + i) * 6, y - 30 - k * 40, 10 + k * 14, 0, 7); ctx.fill(); }   // cool air breathing out
  ctx.restore(); }
// inside the cave the way out is daylight at the end of the tunnel
function cvDaylight(ctx, gt, cx, cy){ const x = gt.x - cx, y = gt.y - cy - 10, t = T; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const gl = ctx.createRadialGradient(x, y, 4, x, y, 120); gl.addColorStop(0, `rgba(255,246,220,${.5 + .05 * Math.sin(t)})`); gl.addColorStop(.4, 'rgba(255,240,200,.22)'); gl.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, 120, 0, 7); ctx.fill(); ctx.restore(); }
if (typeof wgGround === 'function'){ const _g = wgGround; wgGround = function(ctx, gt){ if (caveGate(gt)) return cvMouth.apply(this, arguments); const r = _g.apply(this, arguments); if (caveOn()) try { cvDaylight.apply(this, arguments); } catch (e) {} return r; }; }
if (typeof wgAbove === 'function'){ const _a = wgAbove; wgAbove = function(ctx, gt){ return caveGate(gt) ? cvMouthAbove.apply(this, arguments) : _a.apply(this, arguments); }; }

/* ---------- the sound of the cave: water dripping somewhere, and its echo ---------- */
{ let next = 0; EV.on('tick', () => { if (!caveOn() || PAUSED || document.hidden || T < next) return; next = T + 1.2 + Math.random() * 3.2;
    const R = typeof SFX !== 'undefined' && SFX.raw ? SFX.raw() : null; if (!R) return; const ac = R.ac, base = 900 + Math.random() * 900, far = .35 + Math.random() * .65;
    for (const [dl, vg] of [[0, 1], [.19, .38], [.4, .16], [.66, .07]]){ const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + dl;
      o.type = 'sine'; o.frequency.setValueAtTime(base, t0); o.frequency.exponentialRampToValueAtTime(base * .45, t0 + .09);
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.05 * far * vg, t0 + .004); g.gain.exponentialRampToValueAtTime(.0001, t0 + .16);
      o.connect(g); g.connect(R.out); o.start(t0); o.stop(t0 + .18); } }); }

/* ---------- the shrine camp underground: no garden (bushes, flower boxes, trees), rock and crystals in their place ---------- */
if (typeof campPlace === 'function'){ const _cp = campPlace; campPlace = function(){ const r = _cp.apply(this, arguments); if (!caveOn()) return r;
    try { const plant = typeof NRK_PLANTS !== 'undefined' ? NRK_PLANTS : new Set(['tree', 'bush', 'flowerbed', 'hedge', 'flowers', 'camptree', 'deadtree', 'flowerbush', 'frangipani']);
      const gone = []; for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (plant.has(p.type) || /flower|hedge|bush|tree|planter/.test(p.type)){ gone.push(p); PROPS.splice(i, 1); const k = obstacles.findIndex(o => o.prop === p); if (k >= 0) obstacles.splice(k, 1); } }
      const rr = caveRng(CAVE.id * 13 + 5); for (const p of gone.slice(0, 10)) if (caveDist(p.x, p.y) > 30 && typeof addProp === 'function') addProp(rr() < .55 ? 'stalag' : 'crystal', p.x, p.y, Math.floor(rr() * 2));
      NAV.grid = null; } catch (e) { console.warn('cave350 camp', e); }
    return r; }; }
