/* VAYRATHEN — js/world/falls.js — waterfalls the way nature makes them
   Water only falls where the land drops. So a waterfall here is part of the terrain:
     · a rocky escarpment juts out from the map's north edge (a raised, grassy plateau with a cliff face below,
       strata, boulders, moss and a grass lip hanging over the edge; the cliff fades into the ground at both ends);
     · a stream runs across the plateau from beyond the map edge and pours over the rim at its lowest notch;
     · the water falls as a curtain down the face (thin side trickles too), crashes into a plunge pool ringed by rocks,
       and leaves it as a creek that winds downhill across the map and thins out into the meadow.
   The ground parts are painted into the terrain once; the moving water (flow, falling curtain, foam, spray, mist,
   ripples) is drawn live. Volcanic lands get a lava fall, the Himmapan lands a jade-and-gold one.
   The plateau and the cliff can't be walked on; the creek is shallow and can be waded. */
'use strict';

const FALL_PAL = {
  water:{rock:['#8a8676', '#5e5a4e', '#3a3830'], moss:['#5f9a44', '#3f7030'], bed:'#6a6046', shore:'#b8a878', w:['#e8fbff', '#8fd4ee', '#3f8ec0', '#245e88'], flow:'255,255,255', mist:'235,245,255'},
  gold:{rock:['#d8c89a', '#a89062', '#6e5a3a'], moss:['#7ab44a', '#4f8a34'], bed:'#8a7a50', shore:'#f0e0b0', w:['#f4fffa', '#9ff0e4', '#3ab4c4', '#1e7a8e'], flow:'255,255,240', mist:'255,250,230'},
  lava:{rock:['#4e4038', '#2e2420', '#18110e'], moss:null, bed:'#2a1810', shore:'#5a3a28', w:['#fff6c0', '#ffb040', '#e8501a', '#9a200a'], flow:'255,230,150', mist:'120,90,80'}};
const FH = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };

/* geometry of one escarpment + fall */
function fallGeom(x0, wd, yTop, bulge, faceH, xc, seed){
  const u = x => clamp((x - x0) / wd, 0, 1);
  const noise = x => Math.sin(x * .031 + seed) * 5 + Math.sin(x * .083 + seed * 2) * 2.5;
  const rim = x => yTop + bulge * Math.pow(Math.sin(Math.PI * u(x)), .8) + noise(x) * Math.sin(Math.PI * u(x));
  const face = x => faceH * Math.pow(Math.sin(Math.PI * u(x)), .55);
  return {x0, x1:x0 + wd, rim, face, base:x => rim(x) + face(x), xc};
}
/* a meandering polyline */
function meander(xa, ya, xb, yb, n, amp, ph){ const out = []; for (let i = 0; i <= n; i++){ const t = i / n; out.push([xa + (xb - xa) * t + Math.sin(t * 5.2 + ph) * amp * Math.sin(Math.PI * t), ya + (yb - ya) * t]); } return out; }
function creekPath(x, y, len, ph){ const out = [[x, y]]; let cx = x, cy = y, a = Math.PI / 2; for (let i = 0; i < 22; i++){ a += Math.sin(i * .7 + ph) * .28; a = clamp(a, .55, 2.6); cx += Math.cos(a) * len / 22; cy += Math.sin(a) * len / 22; if (cx < 40 || cx > W - 40 || cy > H - 40) break; out.push([cx, cy]); } return out; }

/* called from paintMap: find a place on the north edge, paint the ground parts, register water + walls */
function fallsPlace(g, B, mapId, kind, A){
  const ky = H / 1600;
  if (B.band && B.band.y0 * ky < 420) return;                              // a river or the sea already runs along the top
  const want = A > 1.6 ? 2 : 1, used = [];
  for (let i = 0, tries = 0; i < want && tries < 60; tries++){
    const wd = 380 + R() * 200, x0 = 60 + R() * (W - wd - 120), xc = x0 + wd * (.38 + R() * .24);
    if (Math.abs(xc - W / 2) < 300 || x0 < W / 2 && x0 + wd > W / 2 - 160) continue;   // keep clear of the north gate and its road
    if (used.some(([a, b]) => x0 < b + 120 && x0 + wd > a - 120)) continue;
    const yTop = 40 + R() * 30, bulge = 80 + R() * 50, faceH = 92 + R() * 36, seed = R() * 100, G = fallGeom(x0, wd, yTop, bulge, faceH, xc, seed);
    const baseC = G.base(xc), pool = {x:xc + (R() - .5) * 10, y:baseC + 26, rx:62 + R() * 14, ry:22 + R() * 6};
    // the land below must be free: no gate, no trail, no other water
    let bad = GATES.some(gt => Math.hypot(gt.x - xc, gt.y - baseC) < 300);
    for (let x = x0 + 30; x < x0 + wd - 30 && !bad; x += 40){ const by = G.base(x); if (trailD(x, by + 10) < 60) bad = true; }
    if (bad || trailD(pool.x, pool.y) < 110 || obstacles.some(o => o.water && Math.hypot(o.x - pool.x, o.y - pool.y) < o.r + 120)) continue;
    const stream = meander(xc + (R() - .5) * 120, -10, xc, G.rim(xc) + 2, 14, 18 + R() * 14, seed);
    const creek = creekPath(pool.x + (R() - .5) * 20, pool.y + pool.ry - 4, 380 + R() * 320, seed);
    const F = {x:pool.x, y:baseC, kind, seed:Math.floor(seed * 1e4), G, rimC:G.rim(xc), baseC, pool, stream, creek, biome:MAPS[mapId].biome};
    fallsPaint(g, B, F);
    WFALLS.push(F); used.push([x0, x0 + wd]); i++;
    WATERS.push({k:'pond', x:pool.x, y:pool.y, rx:pool.rx - 6, ry:pool.ry - 3, kind:kind === 'lava' ? 'lava' : 'water', seed:F.seed % 997, fallPool:true});
    // walls: the cliff foot and the whole plateau; the pool is water; the creek is shallow (walkable)
    for (let x = x0 + 8; x <= x0 + wd - 8; x += 22){ const by = G.base(x), ry = G.rim(x); if (by - 2 < 4) continue; obstacles.push({x, y:by - 10, r:18, cliff:true}); for (let yy = by - 40; yy > -20; yy -= 36) obstacles.push({x, y:yy, r:24, cliff:true}); if (ry > 0) {} }
    obstacles.push({x:pool.x, y:pool.y, r:pool.rx * .62, water:true}, {x:pool.x - pool.rx * .55, y:pool.y, r:pool.ry, water:true}, {x:pool.x + pool.rx * .55, y:pool.y, r:pool.ry, water:true});
    // props keep off the creek: temporary markers, removed after placement (see placeBiomeProps hook below)
    F.creekMarks = creek.filter((p, k) => k % 2 === 0).map(([x, y]) => ({x, y, r:18, water:true, tmp:true}));
    obstacles.push(...F.creekMarks);
  }
}
/* the ground: plateau, cliff face, talus, shadow, stream, pool and creek beds */
function fallsPaint(g, B, F){
  const P2 = FALL_PAL[F.kind] || FALL_PAL.water, G = F.G, x0 = G.x0, x1 = G.x1, rnd = (() => { let s = F.seed + 7; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })();
  const grass = (B.base || ['#6f9a4a', '#7aa652', '#86b25a']);
  g.save();
  // soft shadow the cliff throws on the ground below
  for (let x = x0; x <= x1; x += 8){ const by = G.base(x), d = Math.sin(Math.PI * (x - x0) / (x1 - x0)); const gr = g.createLinearGradient(0, by, 0, by + 40 * d); gr.addColorStop(0, `rgba(10,20,10,${.32 * d})`); gr.addColorStop(1, 'rgba(10,20,10,0)'); g.fillStyle = gr; g.fillRect(x - 4, by, 9, 40 * d + 1); }
  // plateau: the raised land above the rim
  g.beginPath(); g.moveTo(x0 - 30, -10); for (let x = x0 - 30; x <= x1 + 30; x += 6) g.lineTo(x, Math.max(-10, G.rim(clamp(x, x0, x1)) - (x < x0 || x > x1 ? 10 : 0))); g.lineTo(x1 + 30, -10); g.closePath();
  let gr = g.createLinearGradient(0, 0, 0, 200); gr.addColorStop(0, F.kind === 'lava' ? '#3a2a22' : grass[2]); gr.addColorStop(1, F.kind === 'lava' ? '#4a362a' : grass[1]); g.fillStyle = gr; g.fill();
  if (F.kind !== 'lava') for (let i = 0; i < 70; i++){ const x = x0 + rnd() * (x1 - x0), y = rnd() * G.rim(x); g.fillStyle = rnd() < .5 ? 'rgba(40,80,30,.35)' : 'rgba(230,240,180,.18)'; g.beginPath(); g.ellipse(x, y, 4 + rnd() * 10, 2 + rnd() * 4, 0, 0, 7); g.fill(); }
  // shrubs on the plateau
  if (P2.moss) for (let i = 0; i < 9; i++){ const x = x0 + 30 + rnd() * (x1 - x0 - 60), y = G.rim(x) * (.2 + rnd() * .6); if (Math.abs(x - F.G.xc) < 50) continue; for (let k = 0; k < 4; k++){ g.fillStyle = k % 2 ? P2.moss[0] : P2.moss[1]; g.beginPath(); g.arc(x + (rnd() - .5) * 14, y + (rnd() - .5) * 6, 5 + rnd() * 5, 0, 7); g.fill(); } }
  // cliff face
  const face = new Path2D(); face.moveTo(x0, G.rim(x0)); for (let x = x0; x <= x1; x += 4) face.lineTo(x, G.rim(x)); for (let x = x1; x >= x0; x -= 4) face.lineTo(x, G.base(x)); face.closePath();
  gr = g.createLinearGradient(0, 40, 0, 300); gr.addColorStop(0, P2.rock[0]); gr.addColorStop(.5, P2.rock[1]); gr.addColorStop(1, P2.rock[2]); g.fillStyle = gr; g.fill(face);
  g.save(); g.clip(face);
  // light from the west: the left half a touch brighter
  gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.18)'); g.fillStyle = gr; g.fillRect(x0, 0, x1 - x0, 400);
  // strata and boulders
  for (let k = 1; k <= 6; k++){ g.beginPath(); for (let x = x0; x <= x1; x += 6){ const y = G.rim(x) + G.face(x) * k / 7 + Math.sin(x * .05 + k) * 2.5; x === x0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 1.2; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = .8; g.stroke(); }
  for (let i = 0; i < (x1 - x0) / 6; i++){ const x = x0 + rnd() * (x1 - x0), y = G.rim(x) + rnd() * G.face(x), r = 4 + rnd() * 9; g.fillStyle = `rgba(0,0,0,${.12 + rnd() * .12})`; g.beginPath(); g.ellipse(x + 1, y + 2, r, r * .6, 0, 0, 7); g.fill();
    g.fillStyle = rnd() < .5 ? P2.rock[0] : P2.rock[1]; g.globalAlpha = .5 + rnd() * .4; g.beginPath(); g.ellipse(x, y, r, r * .6, (rnd() - .5) * .6, 0, 7); g.fill(); g.globalAlpha = 1;
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = .8; g.beginPath(); g.ellipse(x, y, r, r * .6, 0, 3.4, 5.8); g.stroke(); }
  for (let i = 0; i < 14; i++){ let x = x0 + 20 + rnd() * (x1 - x0 - 40), y = G.rim(x) + 4; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++){ x += (rnd() - .5) * 8; y += G.face(x) / 6; g.lineTo(x, Math.min(y, G.base(x) - 2)); } g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1; g.stroke(); }
  // the wet, dark rock behind the falling water
  gr = g.createLinearGradient(F.G.xc - 46, 0, F.G.xc + 46, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.5, F.kind === 'lava' ? 'rgba(255,90,20,.35)' : 'rgba(0,15,25,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(F.G.xc - 46, 0, 92, 400);
  // moss on the upper face, glowing seams on lava rock
  if (P2.moss) for (let i = 0; i < (x1 - x0) / 10; i++){ const x = x0 + rnd() * (x1 - x0); if (Math.abs(x - F.G.xc) < 30) continue; const y = G.rim(x) + rnd() * G.face(x) * .45; g.fillStyle = rnd() < .5 ? P2.moss[0] : P2.moss[1]; g.globalAlpha = .75; g.beginPath(); g.ellipse(x, y, 3 + rnd() * 7, 2 + rnd() * 3, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
  else for (let i = 0; i < 12; i++){ let x = x0 + 20 + rnd() * (x1 - x0 - 40), y = G.rim(x) + 8; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++){ x += (rnd() - .5) * 10; y += G.face(x) / 6; g.lineTo(x, y); } g.strokeStyle = 'rgba(255,110,30,.6)'; g.lineWidth = 1.3; g.stroke(); }
  g.restore();
  // rim lip: a lighter edge, grass hanging over it
  g.beginPath(); for (let x = x0; x <= x1; x += 4) x === x0 ? g.moveTo(x, G.rim(x)) : g.lineTo(x, G.rim(x)); g.strokeStyle = F.kind === 'lava' ? '#6a4a38' : P2.rock[0]; g.lineWidth = 3; g.stroke();
  if (P2.moss){ g.strokeStyle = P2.moss[0]; g.lineWidth = 2.6; g.stroke(); for (let x = x0 + 4; x < x1 - 4; x += 3 + rnd() * 4){ if (Math.abs(x - F.G.xc) < 26) continue; const y = G.rim(x), l = 3 + rnd() * 9 * Math.sin(Math.PI * (x - x0) / (x1 - x0)); g.strokeStyle = rnd() < .5 ? P2.moss[0] : P2.moss[1]; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 1.5, y + l * .6, x + (rnd() - .5) * 3, y + l); g.stroke(); } }
  // talus: fallen rocks along the foot
  for (let i = 0; i < (x1 - x0) / 12; i++){ const x = x0 + 10 + rnd() * (x1 - x0 - 20), y = G.base(x) + rnd() * 10 - 3, r = 3 + rnd() * 7 * Math.sin(Math.PI * (x - x0) / (x1 - x0)); if (Math.abs(x - F.pool.x) < F.pool.rx - 6) continue;
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + 1, y + 2, r, r * .55, 0, 0, 7); g.fill(); g.fillStyle = rnd() < .5 ? P2.rock[1] : P2.rock[0]; g.beginPath(); g.ellipse(x, y, r, r * .6, 0, 0, 7); g.fill(); }
  // stream bed on the plateau and the creek bed below
  const bed = (pts, w0, w1) => { for (const [w, col] of [[1.45, P2.shore], [1, P2.bed], [.75, P2.w[3]], [.5, P2.w[2]]]){ g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
      for (let i = 1; i < pts.length; i++){ const t = i / (pts.length - 1), lw = (w0 + (w1 - w0) * t) * w; g.globalAlpha = t > .8 ? Math.max(0, (1 - t) / .2) : 1; g.lineWidth = lw; g.beginPath(); g.moveTo(...pts[i - 1]); g.lineTo(...pts[i]); g.stroke(); } }
    g.globalAlpha = 1; for (let i = 0; i < pts.length * 2; i++){ const p = pts[Math.floor(rnd() * pts.length)], side = rnd() < .5 ? -1 : 1, t = rnd(); g.fillStyle = rnd() < .5 ? P2.rock[0] : P2.rock[1]; g.beginPath(); g.ellipse(p[0] + side * (w0 * .6 + rnd() * 4), p[1] + (rnd() - .5) * 8, 2 + t * 3, 1.4 + t * 2, 0, 0, 7); g.fill(); } };
  bed(F.stream, 18, 26); bed(F.creek, 24, 10);
  // plunge pool: sand, rocks, deep water
  const p = F.pool; g.fillStyle = P2.shore; g.beginPath(); g.ellipse(p.x, p.y, p.rx + 10, p.ry + 6, 0, 0, 7); g.fill();
  gr = g.createRadialGradient(p.x, p.y - 6, 4, p.x, p.y, p.rx); gr.addColorStop(0, P2.w[3]); gr.addColorStop(.55, P2.w[2]); gr.addColorStop(1, P2.w[1]); g.fillStyle = gr; g.beginPath(); g.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, 7); g.fill();
  for (let i = 0; i < 18; i++){ const a = Math.PI * (1.05 + i / 17 * .9) + (rnd() - .5) * .1, x = p.x + Math.cos(a) * (p.rx + 4), y = p.y + Math.sin(a) * (p.ry + 3), r = 4 + rnd() * 6; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + 1, y + 2, r, r * .6, 0, 0, 7); g.fill(); g.fillStyle = rnd() < .5 ? P2.rock[0] : P2.rock[1]; g.beginPath(); g.ellipse(x, y, r, r * .6, 0, 0, 7); g.fill(); }
  for (let i = 0; i < 7; i++){ const a = Math.PI * (.15 + i / 6 * .7), x = p.x + Math.cos(a) * (p.rx + 2), y = p.y + Math.sin(a) * (p.ry + 2); if (Math.abs(x - F.creek[0][0]) < 18) continue; const r = 3 + rnd() * 4; g.fillStyle = rnd() < .5 ? P2.rock[0] : P2.rock[1]; g.beginPath(); g.ellipse(x, y, r, r * .6, 0, 0, 7); g.fill(); }
  g.restore();
}
/* props keep off the creek, then the temporary markers go */
{
  const _pbp = placeBiomeProps;
  placeBiomeProps = function(B, mapId){ _pbp(B, mapId); for (let i = obstacles.length - 1; i >= 0; i--) if (obstacles[i].tmp) obstacles.splice(i, 1); };
}

/* ---------- moving water ---------- */
const polyLen = pts => { let l = 0; for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return l; };
function polyAt(pts, s){ for (let i = 1; i < pts.length; i++){ const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1], l = Math.hypot(dx, dy); if (s <= l){ const k = s / l; return [pts[i - 1][0] + dx * k, pts[i - 1][1] + dy * k, dx / l, dy / l, i / (pts.length - 1)]; } s -= l; } const n = pts.length - 1; return [pts[n][0], pts[n][1], 0, 1, 1]; }
function flowLines(g, F, pts, w0, w1, speed, n){
  const P2 = FALL_PAL[F.kind] || FALL_PAL.water, L = F._len && F._len[pts === F.stream ? 0 : 1] || polyLen(pts); F._len = F._len || []; F._len[pts === F.stream ? 0 : 1] = L;
  g.lineCap = 'round';
  for (let i = 0; i < n; i++){ const s = ((T * speed + FH(i + F.seed) * L) % L + L) % L, [x, y, ux, uy, t] = polyAt(pts, s), w = (w0 + (w1 - w0) * t) * .32, off = (FH(i * 3.1 + F.seed) - .5) * w * 2;
    if (x < cam.x - 40 || x > cam.x + VW + 40 || y < cam.y - 40 || y > cam.y + VH + 40) continue;
    const px = x - uy * off - cam.x, py = y + ux * off - cam.y, len = 4 + FH(i + 9) * 6, fade = Math.sin(Math.min(1, s / 30) * Math.PI / 2) * (t > .8 ? Math.max(0, (1 - t) / .2) : 1);
    g.strokeStyle = `rgba(${P2.flow},${.5 * fade})`; g.lineWidth = .9; g.beginPath(); g.moveTo(px - ux * len, py - uy * len); g.lineTo(px, py); g.stroke(); }
}
function fallsUnder(g){
  for (const F of WFALLS){ if (F.G.x1 < cam.x - 60 || F.G.x0 > cam.x + VW + 60) { if (!F.creek.some(([x, y]) => x > cam.x - 40 && x < cam.x + VW + 40 && y > cam.y - 40 && y < cam.y + VH + 40)) continue; }
    flowLines(g, F, F.stream, 18, 26, 70, 26); flowLines(g, F, F.creek, 24, 10, 40, 40); }
}
function fallsDraw(g, F){
  const G = F.G, xc = G.xc, P2 = FALL_PAL[F.kind] || FALL_PAL.water, top = F.rimC - cam.y - 1, bot = F.pool.y - 4 - cam.y, x = xc - cam.x, L = (typeof GFX !== 'undefined' ? GFX.fx : 1);
  if (x < -120 || x > VW + 120 || bot < -40 || top > VH + 60) return;
  const w0 = 24, w1 = 34, wob = (yy, s) => Math.sin(yy * .14 + T * 7 + s) * .9 + Math.sin(yy * .05 - T * 3 + s) * .7;
  g.save();
  // the curtain: wider as it falls, wavy edges, light to deep
  g.beginPath(); for (let yy = top; yy <= bot; yy += 3){ const k = (yy - top) / (bot - top); g.lineTo(x - (w0 + (w1 - w0) * k) / 2 + wob(yy, 0), yy); } for (let yy = bot; yy >= top; yy -= 3){ const k = (yy - top) / (bot - top); g.lineTo(x + (w0 + (w1 - w0) * k) / 2 + wob(yy, 2), yy); } g.closePath();
  const cg = g.createLinearGradient(x - w1 / 2, 0, x + w1 / 2, 0); cg.addColorStop(0, P2.w[2]); cg.addColorStop(.2, P2.w[1]); cg.addColorStop(.45, P2.w[0]); cg.addColorStop(.7, P2.w[1]); cg.addColorStop(1, P2.w[2]);
  g.globalAlpha = F.kind === 'lava' ? 1 : .9; g.fillStyle = cg; g.fill(); g.globalAlpha = 1;
  g.save(); g.clip(); g.lineCap = 'round';
  for (let i = 0; i < (L ? 24 : 12); i++){ const s = F.seed + i * 3.1, sx0 = x - w1 / 2 + 2 + FH(s) * (w1 - 4), sp = 110 + FH(s + 1) * 80, len = 12 + FH(s + 2) * 26, yy = top + ((T * sp + FH(s + 3) * 400) % (bot - top + len)) - len;
    g.strokeStyle = FH(s + 4) < .6 ? `rgba(${P2.flow},.8)` : (F.kind === 'lava' ? 'rgba(255,240,170,.6)' : 'rgba(200,240,255,.55)'); g.lineWidth = .8 + FH(s + 5) * 1.6; g.beginPath(); g.moveTo(sx0, yy); g.lineTo(sx0 + (FH(s + 6) - .5), yy + len); g.stroke(); }
  g.restore();
  // the water curling over the rim
  g.fillStyle = `rgba(${P2.flow},.85)`; g.beginPath(); g.ellipse(x, top + 1, w0 / 2 + 3, 3.4 + Math.sin(T * 5) * .4, 0, Math.PI, 0); g.fill();
  for (let i = 0; i < 6; i++){ g.fillStyle = `rgba(${P2.flow},.7)`; g.beginPath(); g.arc(x - w0 / 2 + 2 + i * (w0 - 4) / 5, top + 1.5 + Math.sin(T * 6 + i) * .8, 1.7, 0, 7); g.fill(); }
  // two thin side trickles further along the rim
  for (const sd of [-1, 1]){ const tx = xc + sd * (24 + FH(F.seed + sd) * 14), ty = G.rim(tx) - cam.y, by2 = G.base(tx) - cam.y - 2, X = tx - cam.x; g.strokeStyle = `rgba(${P2.flow},.55)`; g.lineWidth = 1.4; g.beginPath(); g.moveTo(X, ty); for (let yy = ty; yy < by2; yy += 4) g.lineTo(X + Math.sin(yy * .3 + T * 6 + sd) * .6, yy); g.stroke();
    const dy = (T * 90 + sd * 30) % Math.max(10, by2 - ty); g.fillStyle = `rgba(${P2.flow},.85)`; g.fillRect(X - .6, ty + dy, 1.2, 2.6); }
  // where it lands: foam, spray, ripples, mist
  const px = x, py = bot, fp = .5 + .5 * Math.sin(T * 5.3), fc = F.kind === 'lava' ? '255,235,170' : '255,255,255';
  for (let i = 0; i < 9; i++){ const a = i / 9 * 6.283 + T * 1.2, fx = px + Math.cos(a) * (w1 * .5 + fp * 3), fy = py + Math.sin(a) * 4, rr = 5 + fp * 2 + (i % 3); const fg = g.createRadialGradient(fx, fy, 0, fx, fy, rr); fg.addColorStop(0, `rgba(${fc},.95)`); fg.addColorStop(1, `rgba(${fc},0)`); g.fillStyle = fg; g.beginPath(); g.ellipse(fx, fy, rr, rr * .6, 0, 0, 7); g.fill(); }
  for (let i = 0; i < (L > 1 ? 26 : L ? 16 : 8); i++){ const s = F.seed + 40 + i * 1.7, ph = (T * (1.1 + FH(s) * .7) + FH(s + 1)) % 1, dir = FH(s + 2) * 2 - 1, d = 8 + FH(s + 3) * 34;
    g.globalAlpha = (1 - ph) * .9; g.fillStyle = `rgb(${fc})`; g.fillRect(px + dir * (w1 * .3 + ph * d), py - Math.sin(ph * Math.PI) * (6 + FH(s + 4) * 18) + ph * 4, 1.4, 1.4); }
  g.globalAlpha = 1;
  g.save(); g.beginPath(); g.ellipse(F.pool.x - cam.x, F.pool.y - cam.y, F.pool.rx, F.pool.ry, 0, 0, 7); g.clip();
  for (let q = 0; q < 4; q++){ const k = (T * .5 + q / 4) % 1; g.strokeStyle = `rgba(${fc},${(1 - k) * .55})`; g.lineWidth = 1.1; g.beginPath(); g.ellipse(px, py + 4, 10 + k * F.pool.rx, 3 + k * F.pool.ry * .8, 0, 0, 7); g.stroke(); }
  g.restore();
  if (L){ for (let i = 0; i < 5; i++){ const ph = (T * .2 + i / 5) % 1, mx = px + Math.sin(T * .5 + i * 2) * 16 + (i - 2) * 9, my = py - 2 - ph * 60, r = 14 + ph * 26;
    const mg = g.createRadialGradient(mx, my, 0, mx, my, r); mg.addColorStop(0, `rgba(${P2.mist},${.22 * Math.sin(ph * Math.PI)})`); mg.addColorStop(1, `rgba(${P2.mist},0)`); g.fillStyle = mg; g.beginPath(); g.arc(mx, my, r, 0, 7); g.fill(); } }
  if (F.kind !== 'water'){ g.globalCompositeOperation = 'lighter'; const gg = g.createRadialGradient(px, (top + bot) / 2, 0, px, (top + bot) / 2, 90); gg.addColorStop(0, F.kind === 'lava' ? 'rgba(255,120,40,.2)' : 'rgba(255,230,150,.12)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gg; g.fillRect(px - 90, top - 20, 180, bot - top + 80); }
  g.restore();
}
// plug into the living-world layer
if (typeof LIVE !== 'undefined'){
  LIVE.ents = function(list, g){ for (const F of WFALLS) if (F.G) list.push({y:F.baseC, f:() => fallsDraw(g, F)}); };
  const _under = LIVE.drawUnder; LIVE.drawUnder = function(g){ _under(g); fallsUnder(g); };
}
