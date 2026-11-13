/* VAYRATHEN — js/world/abyss294.js — (v294) วังบาดาล: the first of the eight lands, a drowned naga palace under the sea
   The owner asked for eight themed lands, each with its own entrance; the first is วังบาดาล, "an underwater map, about water,
   with a new adventure and every kind of sea creature". Map 17 (บาดาลนาคา) was a grey cave floor with a pink flowering tree.
   It is now the bottom of the sea:
   · the ground is pale sand under blue water: soft drifts of silt and algae, ripples the current left, meadows of seagrass,
     shells, starfish and sand dollars, and the flagstone courts of the sunken palace half buried in the sand;
   · the ponds are trenches that fall away into the dark, with a faint glow at the rim and bubbles rising out of them;
   · kelp forests sway in the current, sea anemones, sea fans, coral, giant clams with a glowing pearl, and the palace's own
     columns (standing, broken or toppled), gold bands green with algae;
   · light: caustic ripples dance over the floor, shafts of sunlight slant down from the surface, schools of small fish pass
     overhead, the shadow of something huge glides across the sand now and then, specks of marine snow drift down, and the
     water darkens toward the edges of the view;
   · no birds, no rain, no butterflies down here.
   The sea creatures themselves are the 'fish' body in gfx/beasts.js and their species in data/world.js (v294). */
'use strict';

const ABY = {tile:null, school:[], snow:[], shade:null, shadeT:6, last:0};
const abyssHere = () => { const mp = MAP_ID && MAPS[MAP_ID]; return !!(mp && BIOME[mp.biome] && BIOME[mp.biome].underwater); };
const abyQ = () => Math.max(0, (typeof GFX !== 'undefined' ? GFX.fx : 1) - (typeof PERF !== 'undefined' && PERF.fps < 28 && PERF.fps > 0 ? 1 : 0));

/* ---------- the land ---------- */
BIOME.badan = {base:['#5d8d8f', '#62928f', '#67978f'], mottle:['rgba(20,50,60,.2)', 'rgba(220,240,230,.12)'], blades:null, road:['#7aa29a', '#86ac9f', '#92b6a6'],
  floor:null, ponds:3, pondR:[70, 120], pondCols:['#406c72', '#123446', '#08192a', '#01070e'],
  props:[['kelp', 9, 4], ['anemone', 4, 4], ['seafan', 3, 4], ['brainc', 2, 3], ['gshell', 2, 3], ['pillar', 3, 4], ['statue', 1, 2], ['crystal', 2, 1]], propN:140,
  fx:'bubbles', fxA:.35, tint:'rgba(8,52,104,.18)', underwater:true};

/* ---------- the sea floor (painted instead of the cave stone) ---------- */
function abyssFloor(g){
  const A = typeof AREA === 'function' ? AREA() : 1, a = (h, al) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${al})`; };
  const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#6a9a98'); gr.addColorStop(.5, '#5e8f90'); gr.addColorStop(1, '#55868c');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // drifts: pale sand, dark silt, green algae — soft blobs of many translucent ellipses
  const patch = (n, col, al, r0, r1) => { for (let i = 0; i < n * A; i++){ const cx = R() * W, cy = R() * H, r = r0 + R() * (r1 - r0), k = 12 + Math.floor(R() * 10);
    for (let j = 0; j < k; j++){ const x = cx + (R() - .5) * r * 1.6, y = cy + (R() - .5) * r * .9, rr = r * (.14 + R() * .3); g.fillStyle = a(col, al * (.5 + R() * .5)); g.beginPath(); g.ellipse(x, y, rr, rr * (.45 + R() * .25), R() * .6 - .3, 0, 7); g.fill(); } } };
  patch(30, '#a6c6b8', .16, 60, 170); patch(24, '#3c6a76', .16, 60, 160); patch(16, '#4e7e5e', .14, 50, 130); patch(10, '#8ab0a8', .14, 40, 100);
  // grain
  { const P0 = new Path2D(), P1 = new Path2D(), P2 = new Path2D(), n = Math.round(42000 * A);
    for (let i = 0; i < n; i++){ const v = R(); (v < .4 ? P0 : v < .75 ? P1 : P2).rect(R() * W, R() * H, 1 + R() * 1.2, .8 + R() * .6); }
    g.fillStyle = 'rgba(40,80,90,.35)'; g.fill(P0); g.fillStyle = 'rgba(210,235,225,.3)'; g.fill(P1); g.fillStyle = 'rgba(170,190,160,.3)'; g.fill(P2); }
  // ripples the current left in the sand: a lit crest over a soft shadow
  for (let i = 0; i < 260 * A; i++){ const x = R() * W, y = R() * H, L = 26 + R() * 46, k = 3 + Math.floor(R() * 5), tilt = (R() - .5) * .5;
    for (let j = 0; j < k; j++){ const yy = y + j * 7, xx = x + j * tilt * 7, w = L * (1 - Math.abs(j - k / 2) / k * .6);
      g.strokeStyle = 'rgba(40,80,90,.22)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(xx - w, yy + 1.4); g.bezierCurveTo(xx - w * .3, yy - 1.6, xx + w * .3, yy + 4.4, xx + w, yy + 1.4); g.stroke();
      g.strokeStyle = 'rgba(220,240,232,.3)'; g.lineWidth = 1; g.beginPath(); g.moveTo(xx - w, yy); g.bezierCurveTo(xx - w * .3, yy - 3, xx + w * .3, yy + 3, xx + w, yy); g.stroke(); } }
  // the sunken palace: flagstone courts half buried in sand, gold inlay gone dull
  for (let c = 0; c < Math.max(3, Math.round(5 * A)); c++){ const cx = 260 + R() * (W - 520), cy = 200 + R() * (H - 400), rw = 90 + R() * 120, rh = 56 + R() * 70;
    for (let by = cy - rh; by < cy + rh; by += 16) for (let bx = cx - rw + ((by - cy) / 16 & 1) * 13; bx < cx + rw; bx += 26){
      const d = ((bx - cx) / rw) ** 2 + ((by - cy) / rh) ** 2; if (d > 1 || R() < .12 + d * .45) continue;
      const sh = R() * .1; g.fillStyle = `rgba(${150 + sh * 300 | 0},${170 + sh * 200 | 0},${168 + sh * 180 | 0},${.55 - d * .3})`; g.fillRect(bx, by, 24, 14);
      g.fillStyle = 'rgba(30,60,70,.25)'; g.fillRect(bx, by + 13, 24, 1.4); g.fillStyle = 'rgba(240,255,250,.18)'; g.fillRect(bx, by, 24, 1.2);
      if (R() < .22){ g.fillStyle = 'rgba(70,120,80,.35)'; g.beginPath(); g.ellipse(bx + R() * 24, by + R() * 14, 3 + R() * 5, 2 + R() * 2, 0, 0, 7); g.fill(); }   // algae on a stone
      if (R() < .08){ g.strokeStyle = 'rgba(200,160,80,.45)'; g.lineWidth = 1; g.strokeRect(bx + 4, by + 3, 16, 8); } }   // a gold-inlaid stone
    // sand drifting back over the court's edge
    for (let j = 0; j < 22; j++){ const an = R() * 6.28, x = cx + Math.cos(an) * rw * (.7 + R() * .4), y = cy + Math.sin(an) * rh * (.7 + R() * .4); g.fillStyle = 'rgba(120,160,150,.35)'; g.beginPath(); g.ellipse(x, y, 14 + R() * 18, 6 + R() * 6, 0, 0, 7); g.fill(); } }
  // seagrass meadows
  { const P = [new Path2D(), new Path2D(), new Path2D()], cols = ['#2e5e48', '#3f7a52', '#5f9c62'];
    for (let i = 0; i < 70 * A; i++){ const cx = R() * W, cy = R() * H, r = 20 + R() * 50;
      for (let j = 0; j < 40 + R() * 50; j++){ const x = cx + (R() - .5) * r * 2, y = cy + (R() - .5) * r, h = 6 + R() * 9, bend = (R() - .3) * 4, p = P[Math.floor(R() * 3)];
        p.moveTo(x, y); p.quadraticCurveTo(x + bend * .4, y - h * .6, x + bend, y - h); } }
    g.lineCap = 'round'; g.lineWidth = 1.1; P.forEach((p, k) => { g.strokeStyle = cols[k]; g.stroke(p); }); }
  // pebbles
  for (let i = 0; i < 380 * A; i++){ const x = R() * W, y = R() * H, s = 1.2 + R() * 2.6;
    g.fillStyle = 'rgba(20,40,50,.3)'; g.beginPath(); g.ellipse(x + s * .2, y + s * .35, s, s * .5, 0, 0, 7); g.fill();
    g.fillStyle = R() < .5 ? '#4e7480' : '#6e8e94'; g.beginPath(); g.ellipse(x, y, s * .85, s * .55, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(230,245,240,.4)'; g.beginPath(); g.ellipse(x - s * .25, y - s * .2, s * .35, s * .18, 0, 0, 7); g.fill(); }
  // shells, starfish and sand dollars
  for (let i = 0; i < 260 * A; i++){ const x = R() * W, y = R() * H, v = R();
    if (v < .35){ const r = 2.6 + R() * 2.4, rot = R() * 6.28, col = ['#e8784a', '#d84a5a', '#a86ad0', '#f0b040'][Math.floor(R() * 4)];   // a starfish
      g.fillStyle = 'rgba(20,40,50,.25)'; g.beginPath(); g.ellipse(x + 1, y + 1, r, r * .5, 0, 0, 7); g.fill(); g.fillStyle = col; g.beginPath();
      for (let k = 0; k < 10; k++){ const an = rot + k / 10 * 6.283, rr = k % 2 ? r * .38 : r; g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr * .62); } g.closePath(); g.fill(); }
    else if (v < .75){ const r = 1.8 + R() * 1.8, rot = R() - .5; g.fillStyle = ['#f4e8dc', '#f0c8c0', '#e8d8b0'][Math.floor(R() * 3)];   // a scallop shell
      g.beginPath(); g.moveTo(x, y + r * .5); g.arc(x, y + r * .5, r, Math.PI + .3 + rot, -.3 + rot); g.closePath(); g.fill(); g.strokeStyle = 'rgba(150,110,90,.5)'; g.lineWidth = .4;
      for (let k = -2; k <= 2; k++){ g.beginPath(); g.moveTo(x, y + r * .5); g.lineTo(x + k * r * .35, y - r * .35); g.stroke(); } }
    else { const r = 2 + R() * 1.6; g.fillStyle = '#d8d8c4'; g.beginPath(); g.ellipse(x, y, r, r * .6, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(140,140,120,.6)'; g.lineWidth = .4;   // a sand dollar
      for (let k = 0; k < 5; k++){ const an = k / 5 * 6.283 - 1.57; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * r * .7, y + Math.sin(an) * r * .42); g.stroke(); } } }
}
{ const _gd = groundDetail; groundDetail = function(g, B, mapId){ const mp = MAPS[mapId]; if (mp && BIOME[mp.biome] && BIOME[mp.biome].underwater) return abyssFloor(g); return _gd.apply(this, arguments); }; }

/* ---------- the trenches are not water: no glints, waves, leaping fish or dragonflies over them ---------- */
{ const _pm = paintMap; paintMap = function(mapId){ const r = _pm.apply(this, arguments);
    if (MAPS[mapId] && BIOME[MAPS[mapId].biome] && BIOME[MAPS[mapId].biome].underwater){ for (const w of WATERS) if (w.k === 'pond') w.kind = 'abyss'; abyssDecorate(); }
    return r; }; }
/* extra clusters: corals round the trenches, kelp forests, a colonnade of the sunken palace */
function abyssDecorate(){
  const ok = (x, y, r) => x > 60 && x < W - 60 && y > 80 && y < H - 50 && trailD(x, y) > 40 && !GATES.some(gt => Math.hypot(gt.x - x, gt.y - y) < 150) && Math.hypot(x - LAIR.x, y - LAIR.y) > 170
    && !obstacles.some(o => Math.hypot(o.x - x, o.y - y) < o.r + r);
  for (const w of WATERS){ if (w.k !== 'pond') continue; for (let i = 0; i < 9; i++){ const an = R() * 6.28, x = w.x + Math.cos(an) * (w.rx + 14 + R() * 18), y = w.y + Math.sin(an) * (w.ry + 10 + R() * 14);
    if (ok(x, y, 4)) addProp(R() < .6 ? 'coral' : 'anemone', x, y, Math.floor(R() * 4)); } }
  for (let f = 0; f < Math.round(4 * AREA()); f++){ const cx = 200 + R() * (W - 400), cy = 200 + R() * (H - 400);
    for (let i = 0; i < 9; i++){ const x = cx + (R() - .5) * 150, y = cy + (R() - .5) * 80; if (ok(x, y, 10)) addProp('kelp', x, y, Math.floor(R() * 4)); } }
  for (let c = 0; c < 2; c++){ const cx = 300 + R() * (W - 600), cy = 260 + R() * (H - 520), horiz = R() < .5;
    for (let i = -2; i <= 2; i++){ const x = cx + (horiz ? i * 70 : 0), y = cy + (horiz ? 0 : i * 60); if (ok(x, y, 30)) addProp('pillar', x, y, R() < .25 ? 3 : Math.floor(R() * 3)); } }
}

/* ---------- the sea's own props ---------- */
Object.assign(PROP_TYPES, {
  // kelp: tall wavy stalks with long blades and little floats, olive, green or red (red algae)
  kelp: (seed, v = 0) => makeProp({w:70, h:160, ax:35, ay:154, seed, shadow:[14, 4], collide:0, paint(g, rng){
    const pal = [['#4a5a1e', '#6a7a2a', '#8a9a3a'], ['#2e5a2e', '#3e7a3a', '#5e9a4a'], ['#5a2a2a', '#7a3a32', '#9a5a42'], ['#3a4a1a', '#5a6a22', '#7a8a32']][v % 4];
    const n = 3 + (v % 2) + Math.floor(rng() * 2);
    for (let s = 0; s < n; s++){ const x0 = (s - (n - 1) / 2) * 6 + (rng() - .5) * 4, h = 90 + rng() * 55, ph = rng() * 6;
      const pt = t => [x0 + Math.sin(t * 5 + ph) * 5 * t + (s - (n - 1) / 2) * t * 8, -t * h];
      g.strokeStyle = pal[0]; g.lineWidth = 2.6; g.beginPath(); for (let k = 0; k <= 20; k++){ const [x, y] = pt(k / 20); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      g.strokeStyle = pal[1]; g.lineWidth = 1.2; g.stroke();
      for (let k = 2; k <= 18; k++){ const t = k / 20, [x, y] = pt(t), sd = k % 2 ? 1 : -1, L = 10 + rng() * 9 * (1 - t * .4);
        g.fillStyle = k % 3 ? pal[1] : pal[2]; g.beginPath(); g.ellipse(x + sd * L * .5, y + 2, L * .55, 2.4, sd * (.5 + rng() * .3), 0, 7); g.fill();
        if (k % 4 === 0){ g.fillStyle = pal[2]; g.beginPath(); g.arc(x + sd * 1.6, y + 1, 1.6, 0, 7); g.fill(); } }
      const [tx, ty] = pt(1); g.fillStyle = pal[2]; g.beginPath(); g.ellipse(tx, ty, 3.4, 6, .3, 0, 7); g.fill(); }
  }}),
  // a sea anemone: a stout column, a crown of soft tentacles with round tips
  anemone: (seed, v = 0) => makeProp({w:44, h:40, ax:22, ay:32, seed, shadow:[13, 4], collide:0, paint(g, rng){
    const [d, m, l] = [['#a83a6a', '#e05a9a', '#ffb0d8'], ['#6a3aa8', '#9a5ae0', '#d8b0ff'], ['#c8602a', '#f08a3a', '#ffd0a0'], ['#2a8a6a', '#3ac08a', '#b0ffd8']][v % 4];
    g.fillStyle = d; g.beginPath(); g.ellipse(0, -4, 9, 6, 0, 0, 7); g.fill(); g.fillStyle = m; g.beginPath(); g.ellipse(0, -9, 10, 4, 0, 0, 7); g.fill();
    for (let i = 0; i < 26; i++){ const a = -Math.PI + (i / 25) * Math.PI + (rng() - .5) * .3, L = 9 + rng() * 9, x0 = Math.cos(a) * 7, y0 = -9 + Math.sin(a) * 2.5, x1 = x0 + Math.cos(a) * L * .7, y1 = y0 - L * (.6 + rng() * .5);
      g.strokeStyle = m; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + (rng() - .5) * 6, (y0 + y1) / 2, x1, y1); g.stroke();
      g.fillStyle = l; g.beginPath(); g.arc(x1, y1, 1.6, 0, 7); g.fill(); }
    g.fillStyle = d; g.beginPath(); g.ellipse(0, -9, 3, 1.4, 0, 0, 7); g.fill();
  }}),
  // a sea fan: a flat lacework of branches on a short stem
  seafan: (seed, v = 0) => makeProp({w:70, h:76, ax:35, ay:70, seed, shadow:[14, 4], collide:0, paint(g, rng){
    const [d, l] = [['#7a2a6a', '#c05aa8'], ['#a82a2a', '#e86a5a'], ['#c87a1a', '#f8b84a'], ['#5a3aa0', '#9a7ae8']][v % 4];
    const br = (x, y, a, len, w, depth) => { if (depth > 6 || len < 2) return; const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      g.strokeStyle = d; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); g.strokeStyle = l; g.lineWidth = w * .45; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
      br(x2, y2, a - .32 - rng() * .2, len * .78, w * .8, depth + 1); br(x2, y2, a + .32 + rng() * .2, len * .78, w * .8, depth + 1); };
    br(0, 0, -Math.PI / 2, 10, 3.4, 0);
    g.strokeStyle = l; g.globalAlpha = .35; g.lineWidth = .6; for (let i = 0; i < 40; i++){ const a = -Math.PI + rng() * Math.PI, r = 12 + rng() * 40; g.beginPath(); g.arc(0, -8, r, a, a + .3); g.stroke(); } g.globalAlpha = 1;
  }}),
  // a brain coral boulder
  brainc: (seed, v = 0) => makeProp({w:52, h:40, ax:26, ay:32, seed, shadow:[20, 5], collide:13, paint(g, rng){
    const [d, m, l] = [['#8a7a3a', '#b8a85a', '#e0d08a'], ['#7a4a6a', '#a8709a', '#d8a8c8'], ['#3a6a5a', '#5a9a7a', '#9ad0b0']][v % 3];
    g.fillStyle = d; g.beginPath(); g.ellipse(0, -10, 20, 14, 0, 0, 7); g.fill(); g.fillStyle = m; g.beginPath(); g.ellipse(-2, -12, 17, 11, 0, 0, 7); g.fill();
    g.strokeStyle = d; g.lineWidth = 1.2; for (let i = 0; i < 9; i++){ let x = -14 + rng() * 26, y = -20 + rng() * 16; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++){ x += (rng() - .5) * 7; y += (rng() - .5) * 5; g.lineTo(x, y); } g.stroke(); }
    g.fillStyle = l; g.globalAlpha = .5; g.beginPath(); g.ellipse(-7, -17, 7, 3.4, -.3, 0, 7); g.fill(); g.globalAlpha = 1;
  }}),
  // a giant clam, open, a pearl glowing inside
  gshell: (seed, v = 0) => makeProp({w:60, h:46, ax:30, ay:36, seed, shadow:[22, 6], collide:14, glow:[0, -12, 18], paint(g, rng){
    const [sh, mantle] = [['#c8c0a8', '#3a6ac8'], ['#d8c8b0', '#7a3ac8'], ['#b8b8a0', '#2a9a8a']][v % 3];
    const fan = (y, up) => { g.fillStyle = sh; g.beginPath(); g.moveTo(-22, y); for (let i = 0; i <= 10; i++){ const x = -22 + i * 4.4; g.lineTo(x, y - up * (8 + Math.sin(i / 10 * Math.PI) * 12) - (i % 2) * up * 3); } g.lineTo(22, y); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(90,80,60,.5)'; g.lineWidth = .8; for (let i = 1; i < 10; i++){ const x = -22 + i * 4.4; g.beginPath(); g.moveTo(x * .3, y); g.lineTo(x, y - up * (6 + Math.sin(i / 10 * Math.PI) * 11)); g.stroke(); } };
    fan(-12, 1); g.fillStyle = mantle; g.beginPath(); g.ellipse(0, -12, 18, 5, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 12; i++){ g.beginPath(); g.arc(-14 + rng() * 28, -13 + rng() * 3, .8, 0, 7); g.fill(); }
    g.fillStyle = '#f4f8ff'; g.beginPath(); g.arc(0, -13, 4, 0, 7); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(-1.3, -14.2, 1.4, 0, 7); g.fill();
    fan(-6, -1);
  }}),
  // a column of the sunken palace: standing, broken, snapped short, or fallen in pieces
  pillar: (seed, v = 0) => makeProp(v % 4 === 3 ? {w:130, h:46, ax:65, ay:34, seed, shadow:[52, 8], collide:20, paint(g, rng){
      for (let i = 0; i < 3; i++){ const x = -48 + i * 34 + (rng() - .5) * 6, y = -10 + (rng() - .5) * 6, L = 26 + rng() * 6;
        g.fillStyle = '#7a8e8c'; g.beginPath(); g.ellipse(x, y + 4, L * .6, 9, (rng() - .5) * .3, 0, 7); g.fill(); g.fillStyle = '#a8bab6'; g.fillRect(x - L / 2, y - 8, L, 14); g.fillStyle = '#c8d6d2'; g.fillRect(x - L / 2, y - 8, L, 4);
        g.fillStyle = 'rgba(200,160,70,.7)'; g.fillRect(x - L / 2 + 3, y - 8, 2.4, 14); g.fillStyle = '#8a9c98'; g.beginPath(); g.ellipse(x + L / 2, y - 1, 3.4, 7, 0, 0, 7); g.fill();
        g.fillStyle = 'rgba(70,120,80,.55)'; for (let k = 0; k < 6; k++){ g.beginPath(); g.ellipse(x - L / 2 + rng() * L, y - 8 + rng() * 12, 2 + rng() * 3, 1.4 + rng(), 0, 0, 7); g.fill(); } } }}
    : {w:52, h:150, ax:26, ay:142, seed, shadow:[18, 6], collide:11, paint(g, rng){
      const h = [126, 92, 54][v % 4] || 126;
      g.fillStyle = '#7a8e8c'; g.fillRect(-16, -10, 32, 10); g.fillStyle = '#a8bab6'; g.fillRect(-15, -10, 30, 3);   // the base
      const gr = g.createLinearGradient(-11, 0, 11, 0); gr.addColorStop(0, '#8a9e9a'); gr.addColorStop(.35, '#d0dcd8'); gr.addColorStop(1, '#7a8e8a');
      g.fillStyle = gr; g.fillRect(-11, -h, 22, h - 10);
      g.strokeStyle = 'rgba(80,100,98,.45)'; g.lineWidth = 1; for (const x of [-6, 0, 6]){ g.beginPath(); g.moveTo(x, -h + 4); g.lineTo(x, -12); g.stroke(); }   // flutes
      for (const y of [-30, -h + 20]) if (y < -14){ g.fillStyle = 'rgba(200,160,70,.75)'; g.fillRect(-11.5, y, 23, 3); }   // gold bands
      if (v % 4 === 0){ g.fillStyle = '#a8bab6'; g.beginPath(); g.moveTo(-16, -h); g.lineTo(16, -h); g.lineTo(12, -h - 8); g.lineTo(-12, -h - 8); g.closePath(); g.fill();   // the lotus capital
        g.fillStyle = 'rgba(200,160,70,.8)'; for (let i = -2; i <= 2; i++){ g.beginPath(); g.ellipse(i * 6, -h - 9, 3, 4, 0, 0, 7); g.fill(); } }
      else { g.fillStyle = '#c8d6d2'; g.beginPath(); g.moveTo(-11, -h); for (let i = 0; i <= 6; i++) g.lineTo(-11 + i * 22 / 6, -h - (rng() * 9)); g.lineTo(11, -h); g.closePath(); g.fill(); }   // the snapped top
      g.fillStyle = 'rgba(70,120,80,.5)'; for (let k = 0; k < 14; k++){ g.beginPath(); g.ellipse(-10 + rng() * 20, -12 - rng() * (h - 16), 2 + rng() * 3.4, 1.2 + rng() * 1.6, 0, 0, 7); g.fill(); }   // algae
      for (let k = 0; k < 3; k++){ const y = -14 - rng() * (h - 30), sd = rng() < .5 ? -1 : 1; g.fillStyle = ['#e05a7a', '#f08a3a', '#9a5ae0'][k]; g.beginPath(); g.ellipse(sd * 11, y, 3, 2.2, 0, 0, 7); g.fill(); }   // coral growing on it
    }}),
});

/* plants sway in the current */
{ const _sw = LIVE.sway, CUR = {kelp:[.07, .75], seafan:[.025, .9], anemone:[.06, 1.3]};
  LIVE.sway = function(p){ const s = CUR[p.type]; if (!s) return _sw.apply(this, arguments); if (typeof GFX !== 'undefined' && GFX.preset === 'low') return 0;
    return s[0] * (Math.sin(T * s[1] + p.x * .011 + p.y * .006) * .75 + Math.sin(T * s[1] * 2.1 + p.x * .04) * .25); }; }

/* ---------- light on the sea floor ---------- */
// a seamless caustic net: bright where two Worley cells nearly meet
function abyCaustic(){
  if (ABY.tile) return ABY.tile; const N = 192, G = 5, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d'), im = x.createImageData(N, N);
  let s = 77; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }, pts = [];
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) pts.push([(i + rnd()) / G, (j + rnd()) / G]);
  for (let py = 0; py < N; py++) for (let px = 0; px < N; px++){ const u0 = px / N, v0 = py / N, u = u0 + .035 * Math.sin(v0 * 6.283 * 3) + .02 * Math.sin((u0 + v0) * 6.283 * 2), v = v0 + .035 * Math.sin(u0 * 6.283 * 2) + .02 * Math.cos((u0 - v0) * 6.283 * 3); let f1 = 9, f2 = 9;   // wavy, not cells
    for (const [a, b] of pts) for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++){ const d = Math.hypot(a + ox - u, b + oy - v); if (d < f1){ f2 = f1; f1 = d; } else if (d < f2) f2 = d; }
    const e = Math.max(0, 1 - (f2 - f1) * G * 2.6), k = (py * N + px) * 4; im.data[k] = 210; im.data[k + 1] = 245; im.data[k + 2] = 255; im.data[k + 3] = Math.round(255 * e * e * e); }
  x.putImageData(im, 0, 0);
  const sft = document.createElement('canvas'); sft.width = sft.height = N; const sx2 = sft.getContext('2d');   // softened: a blurred copy under the sharp one, wrapped so it still tiles
  sx2.filter = 'blur(2px)'; for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) sx2.drawImage(c, ox, oy); sx2.filter = 'none'; sx2.globalAlpha = .55; sx2.drawImage(c, 0, 0);
  return (ABY.tile = sft);
}
function abyUnder(g){
  const q = abyQ(), t = T;
  // the trenches: a soft dark rim, a faint blue glow deep inside
  for (const w of WATERS){ if (w.k !== 'pond' || w.kind !== 'abyss') continue; const x = w.x - cam.x, y = w.y - cam.y; if (x < -w.rx - 40 || x > VW + w.rx + 40 || y < -w.ry - 40 || y > VH + w.ry + 40) continue;
    const gl = g.createRadialGradient(x, y + w.ry * .2, 0, x, y, w.rx); gl.addColorStop(0, `rgba(60,170,220,${.12 + .05 * Math.sin(t * .8 + w.seed)})`); gl.addColorStop(1, 'rgba(60,170,220,0)');
    g.fillStyle = gl; g.beginPath(); g.ellipse(x, y, w.rx, w.ry, 0, 0, 7); g.fill(); }
  if (!q) return;
  // caustics: two nets drifting across each other, fixed to the ground (they do not slide with the camera)
  const tile = abyCaustic(), pat = g.createPattern(tile, 'repeat'); if (!pat) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  const layer = (sc, dx, dy, al, rot) => { const m = new DOMMatrix().translateSelf(-cam.x + dx, -cam.y + dy).rotateSelf(rot).scaleSelf(sc, sc * .62); pat.setTransform(m); g.globalAlpha = al; g.fillStyle = pat; g.fillRect(0, 0, VW, VH); };
  layer(1.6, t * 9, t * 4, .13 + .03 * Math.sin(t * .9), 0);
  if (q > 1) layer(2.3, -t * 7, t * 6, .08, 24);
  g.restore();
  // now and then the shadow of something huge glides over the sand
  ABY.shadeT -= 1 / 60;
  if (!ABY.shade && ABY.shadeT <= 0){ const dir = Math.random() < .5 ? 1 : -1; ABY.shade = {x:cam.x + (dir > 0 ? -260 : VW + 260), y:cam.y + VH * (.25 + Math.random() * .5), vx:dir * 55, s:.8 + Math.random() * .6}; }
  if (ABY.shade){ const S = ABY.shade, x = S.x - cam.x, y = S.y - cam.y, fl = Math.sin(t * 1.6) * .25; S.x += S.vx / 60;
    g.save(); g.translate(x, y); g.scale(S.vx > 0 ? S.s : -S.s, S.s); g.fillStyle = 'rgba(4,20,36,.16)';
    g.beginPath(); g.moveTo(60, 0); g.quadraticCurveTo(10, -70 * (1 + fl), -40, -96 * (1 + fl)); g.quadraticCurveTo(-10, -20, -60, 0); g.quadraticCurveTo(-10, 20, -40, 96 * (1 - fl)); g.quadraticCurveTo(10, 70 * (1 - fl), 60, 0); g.fill();
    g.fillRect(-150, -2, 92, 4); g.restore();
    if (x < -400 || x > VW + 400){ ABY.shade = null; ABY.shadeT = 18 + Math.random() * 20; } }
}
{ const _du = LIVE.drawUnder; LIVE.drawUnder = function(g){ const r = _du.apply(this, arguments); if (abyssHere()) try { abyUnder(g); } catch (e) {} return r; }; }

/* ---------- in the water above: sun shafts, schools of fish, marine snow, bubbles from the clams, the dark at the edges ---------- */
function abyOver(g){
  const q = abyQ(), t = T, now = performance.now(), dt = Math.min(.1, (now - (ABY.last || now)) / 1000); ABY.last = now;
  g.save(); g.globalCompositeOperation = 'lighter';
  // shafts of sunlight slanting down from the surface (a slow parallax: far above the floor)
  for (let i = 0; i < (q ? 6 : 3); i++){ const base = ((i * 263 - cam.x * .25) % (VW + 400) + VW + 400) % (VW + 400) - 200, sw = Math.sin(t * .23 + i * 1.7) * 30, w = 40 + (i % 3) * 26, sl = VH * .45;
    const al = .07 + .04 * Math.sin(t * .5 + i * 2.1), gr = g.createLinearGradient(0, 0, 0, VH * .95); gr.addColorStop(0, `rgba(170,235,255,${al})`); gr.addColorStop(.6, `rgba(150,220,255,${al * .4})`); gr.addColorStop(1, 'rgba(150,220,255,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(base + sw, 0); g.lineTo(base + sw + w, 0); g.lineTo(base + sw + w * 1.8 + sl, VH); g.lineTo(base + sw + sl, VH); g.closePath(); g.fill(); }
  g.restore();
  // schools of small fish passing overhead
  const want = q ? (q > 1 ? 3 : 2) : 1;
  while (ABY.school.length < want){ const dir = Math.random() < .5 ? 1 : -1, n = 9 + Math.floor(Math.random() * 12), far = .5 + Math.random() * .5;
    ABY.school.push({x:cam.x + (dir > 0 ? -160 - Math.random() * 300 : VW + 160 + Math.random() * 300), y:cam.y + VH * (.1 + Math.random() * .8), dir, sp:(34 + Math.random() * 30) * far, far,
      col:['10,40,70', '20,60,80', '230,240,255'][Math.floor(Math.random() * 3)], f:[...Array(n)].map(() => ({dx:(Math.random() - .5) * 90, dy:(Math.random() - .5) * 44, ph:Math.random() * 6, s:.7 + Math.random() * .5}))}); }
  for (const S of ABY.school){ S.x += S.dir * S.sp * dt; S.y += Math.sin(t * .4 + S.sp) * 6 * dt;
    const bx = S.x - cam.x, by = S.y - cam.y, al = S.col === '230,240,255' ? .3 * S.far : .26 * S.far;
    for (const f of S.f){ const x = bx + f.dx + Math.sin(t * 1.3 + f.ph) * 6, y = by + f.dy + Math.cos(t * 1.1 + f.ph) * 4, s = f.s * (6 + S.far * 3), wg = Math.sin(t * 9 + f.ph) * .25;
      g.fillStyle = `rgba(${S.col},${al})`; g.beginPath(); g.ellipse(x, y, s, s * .38, 0, 0, 7); g.fill();
      g.beginPath(); g.moveTo(x - S.dir * s * .9, y); g.lineTo(x - S.dir * s * 1.6, y - s * (.45 + wg)); g.lineTo(x - S.dir * s * 1.6, y + s * (.45 - wg)); g.closePath(); g.fill(); } }
  ABY.school = ABY.school.filter(S => (S.dir > 0 ? S.x - cam.x < VW + 260 : S.x - cam.x > -260) && Math.abs(S.y - cam.y - VH / 2) < VH * 1.5);
  // marine snow
  const ns = q ? (q > 1 ? 70 : 40) : 16; while (ABY.snow.length < ns) ABY.snow.push({x:Math.random() * VW, y:Math.random() * VH, s:Math.random(), p:Math.random() * 6});
  ABY.snow.length = ns; g.fillStyle = 'rgba(225,240,240,.55)';
  for (const p of ABY.snow){ p.y += (4 + p.s * 6) * dt; p.x += Math.sin(t * .6 + p.p) * 4 * dt; if (p.y > VH + 4){ p.y = -4; p.x = Math.random() * VW; } if (p.x < -4) p.x = VW + 4; if (p.x > VW + 4) p.x = -4;
    g.globalAlpha = .35 + p.s * .45; g.fillRect(p.x, p.y, .9 + p.s, .9 + p.s); }
  g.globalAlpha = 1;
  // bubbles rising from the giant clams and the trenches
  g.strokeStyle = 'rgba(210,250,255,.65)'; g.lineWidth = .8;
  const bubbles = (wx, wy, seed, n, hgt) => { const x0 = wx - cam.x, y0 = wy - cam.y; if (x0 < -40 || x0 > VW + 40 || y0 < -hgt || y0 > VH + 40) return;
    for (let i = 0; i < n; i++){ const per = 2.6 + (i % 3) * .7, k = ((t + seed * .37 + i * per / n) % per) / per, x = x0 + Math.sin(k * 9 + i + seed) * 3, y = y0 - k * hgt;
      g.globalAlpha = Math.sin(k * Math.PI) * .9; g.beginPath(); g.arc(x, y, 1 + (i % 3) * .6 + k * 1.2, 0, 7); g.stroke(); } };
  for (const p of PROPS) if (p.type === 'gshell') bubbles(p.x, p.y - 14, p.x % 97, q ? 6 : 3, 90);
  for (const w of WATERS) if (w.k === 'pond' && w.kind === 'abyss') bubbles(w.x + Math.sin(t * .2 + w.seed) * w.rx * .3, w.y, w.seed, q ? 8 : 4, 120);
  g.globalAlpha = 1;
  // the water thickens toward the edges of the view
  const vg = g.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * .35, VW / 2, VH / 2, Math.hypot(VW, VH) * .6);
  vg.addColorStop(0, 'rgba(4,24,48,0)'); vg.addColorStop(1, 'rgba(4,24,48,.42)'); g.fillStyle = vg; g.fillRect(0, 0, VW, VH);
}
{ const _dw = drawWeather; drawWeather = function(g){ const r = _dw.apply(this, arguments); if (abyssHere()) try { abyOver(g); } catch (e) {} return r; }; }

/* ---------- no rain, no birds down here ---------- */
if (typeof wxRoll === 'function'){ const _wr = wxRoll; wxRoll = function(){ return abyssHere() ? 'clear' : _wr.apply(this, arguments); }; }
if (typeof BIOME_MOOD !== 'undefined') BIOME_MOOD.badan = 'water';

/* ---------- the travellers' camp on the sea floor ----------
   The camp keeps its place and its people, but its land plants become sea plants, the great tree a great coral tree hung
   with glowing pearls; the fire pit is covered with sand (v295: its middle is a giant clam, further down). */
PROP_TYPES.coraltree = (seed, v = 0) => makeProp({w:200, h:230, ax:100, ay:220, seed, shadow:[60, 16], collide:22, glow:[0, -120, 70], paint(g, rng){
  const [d, m, l] = [['#b03a5a', '#e0607a', '#ffa8b8'], ['#c0602a', '#f08a3a', '#ffc890'], ['#7a3ab0', '#a868e0', '#d8b0ff']][v % 3];
  const br = (x, y, a, len, w, dep) => { if (dep > 6 || len < 4) return; const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
    g.strokeStyle = d; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + x2) / 2 + (rng() - .5) * 8, (y + y2) / 2, x2, y2); g.stroke();
    g.strokeStyle = m; g.lineWidth = w * .5; g.beginPath(); g.moveTo(x - w * .15, y); g.quadraticCurveTo((x + x2) / 2 - w * .15, (y + y2) / 2, x2 - w * .1, y2); g.stroke();
    if (dep >= 4){ g.fillStyle = l; g.beginPath(); g.arc(x2, y2, Math.max(1.6, w * .55), 0, 7); g.fill(); }
    br(x2, y2, a - .38 - rng() * .25, len * .76, w * .72, dep + 1); br(x2, y2, a + .38 + rng() * .25, len * .76, w * .72, dep + 1); if (dep < 2) br(x2, y2, a + (rng() - .5) * .3, len * .7, w * .66, dep + 2); };
  br(-6, 0, -Math.PI / 2 - .12, 52, 15, 0); br(8, 0, -Math.PI / 2 + .2, 40, 11, 1);
  for (let i = 0; i < 9; i++){ const x = (rng() - .5) * 140, y = -70 - rng() * 120; g.fillStyle = 'rgba(200,240,255,.5)'; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); g.fillStyle = '#f4fbff'; g.beginPath(); g.arc(x, y, 3.6, 0, 7); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x - 1.2, y - 1.2, 1.2, 0, 7); g.fill(); }   // pearls
  for (let i = 0; i < 14; i++){ g.fillStyle = ['#e8784a', '#f0b040', '#40c0a0'][i % 3]; g.beginPath(); g.ellipse((rng() - .5) * 60, -rng() * 8, 3 + rng() * 3, 1.6 + rng(), 0, 0, 7); g.fill(); }   // sea life at its foot
}});
{ const SWAP = {worldtree:'coraltree', camptree:'coraltree', deadtree:'seafan', bush:'anemone', flowerbed:'brainc', hedge:'anemone', frangipani:'seafan', tree:'kelp', pine:'kelp', palm:'kelp', himtree:'seafan', bedroll:'anemone', packs:'brainc', logseat:'brainc', stakelamp:'crystal'};   // (v295) no bedrolls, packs or burning lamps under the sea
  const _cp = campPlace; campPlace = function(){ const r = _cp.apply(this, arguments); if (!abyssHere() || !CAMP) return r;
    for (const p of PROPS){ const to = SWAP[p.type]; if (!to || Math.hypot(p.x - CAMP.x, p.y - CAMP.y) > 360) continue;
      for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1);
      p.type = to; p.variant = to === 'coraltree' ? MAP_ID % 3 : Math.floor((p.x + p.y) % 4); delete p.vk; const im = propImg(p.type, p.variant); if (im.collide) obstacles.push({x:p.x, y:p.y, r:im.collide, prop:p}); }
    { const g = terr.getContext('2d'); g.save(); g.setTransform(TS, 0, 0, TS, 0, 0);   // sand drifted over the old fire pit
      for (const [rx, ry, a] of [[30, 15, .55], [24, 12, .8], [18, 9, 1]]){ g.fillStyle = `rgba(104,150,148,${a})`; g.beginPath(); g.ellipse(CAMP.x, CAMP.y + 18, rx, ry, 0, 0, 7); g.fill(); } g.restore(); }
    NAV.grid = null; return r; }; }
/* the little ground decorations: no glowing toadstools or will-o'-wisps on the sea floor */
if (typeof cuteBuild === 'function'){ const _cb = cuteBuild; cuteBuild = function(){ const r = _cb.apply(this, arguments); if (abyssHere()) CUTE.decor = CUTE.decor.filter(d => d.k === 'pebble'); return r; }; }

/* ---------- the way in: a whirlpool ----------
   On the maps next to an underwater land, the gateway that leads down to it is a whirlpool instead of the warp of light:
   dark water turning round a deep eye, spiral arms of foam drawn in toward it, a frothing rim, spray thrown up and turning
   in the air. (Walking into it works exactly like any gateway.) */
const abyssGate = gt => { const to = MAPS[gt.to]; return !!(to && BIOME[to.biome] && BIOME[to.biome].underwater) && !abyssHere(); };
function wpGround(ctx, gt, cx, cy){
  const x = gt.x - cx, y = gt.y - cy - 4, t = T, RX = 56, RY = 27;
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(1, RY / RX);
  ctx.fillStyle = 'rgba(30,24,16,.35)'; ctx.beginPath(); ctx.arc(0, 4, RX * 1.32, 0, 7); ctx.fill();   // a wet stone rim
  ctx.fillStyle = '#6a7a78'; ctx.beginPath(); ctx.arc(0, 0, RX * 1.26, 0, 7); ctx.fill(); ctx.fillStyle = '#8a9a96'; ctx.beginPath(); ctx.arc(0, -2, RX * 1.2, 0, 7); ctx.fill();
  const gr = ctx.createRadialGradient(0, 0, 2, 0, 0, RX * 1.14); gr.addColorStop(0, '#000308'); gr.addColorStop(.3, '#04182c'); gr.addColorStop(.7, '#0e3a5a'); gr.addColorStop(1, '#2a6a88');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, RX * 1.14, 0, 7); ctx.fill(); ctx.restore();
  // spiral arms of foam, drawn in toward the eye
  ctx.lineCap = 'round';
  for (let a = 0; a < 5; a++){ const off = a / 5 * 6.283 - t * 2.1;
    for (const [w, col] of [[5, 'rgba(10,40,70,.45)'], [3.2, 'rgba(120,200,230,.5)'], [1.3, 'rgba(235,252,255,.85)']]){ ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
      for (let k = 0; k <= 26; k++){ const u = k / 26, r = (1 - u) * .96 + .08, an = off + u * 4.2; const px = x + Math.cos(an) * RX * r, py = y + Math.sin(an) * RY * r; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); } }
  // the frothing rim
  for (let i = 0; i < 40; i++){ const an = i / 40 * 6.283 + t * .9, j = Math.sin(t * 5 + i * 1.7) * .05; ctx.fillStyle = `rgba(240,252,255,${.45 + .35 * Math.sin(t * 4 + i)})`;
    ctx.beginPath(); ctx.ellipse(x + Math.cos(an) * RX * (1 + j), y + Math.sin(an) * RY * (1 + j), 3.4, 1.8, an, 0, 7); ctx.fill(); }
  // the eye
  ctx.fillStyle = 'rgba(0,4,10,.85)'; ctx.beginPath(); ctx.ellipse(x, y, 7 + Math.sin(t * 3) * 1, 3.4, 0, 0, 7); ctx.fill();
  ctx.restore();
}
function wpAbove(ctx, gt, cx, cy){
  const x = gt.x - cx, y = gt.y - cy - 4, t = T, RX = 56, RY = 27, q = abyQ();
  ctx.save();
  for (let i = 0, n = q ? 26 : 12; i < n; i++){ const u = (t * .5 + i / n) % 1, an = i * 2.4 - t * 2.4 - u * 3, r = 1 - u * .6, px = x + Math.cos(an) * RX * r, py = y + Math.sin(an) * RY * r - Math.sin(u * Math.PI) * 26;
    ctx.fillStyle = `rgba(230,250,255,${Math.sin(u * Math.PI) * .75})`; ctx.beginPath(); ctx.arc(px, py, 1 + (i % 3) * .5, 0, 7); ctx.fill(); }   // spray thrown up and turning
  const mg = ctx.createRadialGradient(x, y - 8, 4, x, y - 8, RX); mg.addColorStop(0, 'rgba(200,240,255,.16)'); mg.addColorStop(1, 'rgba(200,240,255,0)'); ctx.fillStyle = mg; ctx.fillRect(x - RX, y - RX, RX * 2, RX * 1.6);   // mist
  ctx.restore();
}
if (typeof wgGround === 'function'){ const _g = wgGround; wgGround = function(ctx, gt){ return abyssGate(gt) ? wpGround.apply(this, arguments) : _g.apply(this, arguments); }; }
if (typeof wgAbove === 'function'){ const _a = wgAbove; wgAbove = function(ctx, gt){ return abyssGate(gt) ? wpAbove.apply(this, arguments) : _a.apply(this, arguments); }; }

/* ---------- the trenches, painted as holes in the sea floor (no shore foam, no surface ripples) ---------- */
{ const _wb = waterBody; waterBody = function(g, x, y, rx, ry){ if (!abyssHere()) return _wb.apply(this, arguments);
    // a crumbling rim of rock and sand sloping down into the dark
    for (let i = 0; i < 46; i++){ const a = i / 46 * 6.283 + R() * .1, rr = 1.04 + R() * .12, px = x + Math.cos(a) * rx * rr, py = y + Math.sin(a) * ry * rr, s = 4 + R() * 6;
      g.fillStyle = 'rgba(20,40,50,.35)'; g.beginPath(); g.ellipse(px + 1, py + 2, s, s * .55, 0, 0, 7); g.fill();
      g.fillStyle = R() < .5 ? '#4e6e74' : '#6a8a88'; g.beginPath(); g.ellipse(px, py, s * .9, s * .5, a, 0, 7); g.fill(); }
    const gr = g.createRadialGradient(x, y + ry * .15, 2, x, y, Math.max(rx, ry) * 1.08); gr.addColorStop(0, '#000208'); gr.addColorStop(.45, '#04121e'); gr.addColorStop(.8, '#123444'); gr.addColorStop(1, '#3a6066');
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx + 6, ry + 2, 0, 0, 7); g.fill();
    // ledges on the near wall: the drop is lit from above on the far side
    g.strokeStyle = 'rgba(120,170,175,.35)'; g.lineWidth = 2; for (let k = 0; k < 3; k++){ g.beginPath(); g.ellipse(x, y - ry * .06 * k, rx * (.95 - k * .14), ry * (.9 - k * .14), 0, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); }
  }; }

/* ---------- (v295) the owner: «where would a fire burn under water? think!» — no cook on a sea-floor map, and the warp
   keeper is a submarine. The camp's middle is a great open clam holding a glowing pearl (no fire, no logs, no pit). ---------- */
{ const _sn = setupNpcs; setupNpcs = function(id){ const r = _sn.apply(this, arguments); if (!abyssHere()) return r;
    for (let i = NPCS.length - 1; i >= 0; i--) if (NPCS[i].id === 'campcook' || NPCS[i].id === 'quarter') NPCS.splice(i, 1);   // nobody cooks down here
    const w = NPCS.find(n => n.id === 'warp'); if (w) Object.assign(w, {name:'เรือดำน้ำนาคา', en:'Naga Submarine', role:'วาร์ป · กลับเมือง', roleEn:'Warp · back to town', sub:true});
    return r; }; }
function abySub(g, x, y, t, near){
  const bob = Math.sin(t * 1.3) * 2.2, yy = y - 26 + bob, tilt = Math.sin(t * .7) * .04;
  g.save(); g.fillStyle = 'rgba(4,20,36,.28)'; g.beginPath(); g.ellipse(x, y + 2, 34, 8, 0, 0, 7); g.fill();   // its shadow on the sand
  g.translate(x, yy); g.rotate(tilt);
  // the hull: a brass-gold body with a darker keel, riveted
  const hg = g.createLinearGradient(0, -16, 0, 16); hg.addColorStop(0, '#ffe08a'); hg.addColorStop(.45, '#e3b04b'); hg.addColorStop(1, '#8a5a1a');
  g.fillStyle = hg; g.strokeStyle = '#4a2c0a'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, 0, 34, 15, 0, 0, 7); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-6, -8, 22, 3.4, 0, 0, 7); g.fill();
  g.fillStyle = '#6a3e10'; for (let i = -4; i <= 4; i++){ g.beginPath(); g.arc(i * 7, 9, .9, 0, 7); g.fill(); }
  // a naga figurehead at the bow and a turning propeller at the stern
  g.fillStyle = '#2f8a6a'; g.beginPath(); g.moveTo(32, -4); g.quadraticCurveTo(44, -16, 40, -24); g.quadraticCurveTo(36, -14, 30, -8); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#ffd36a'; g.beginPath(); g.arc(40, -23, 2.2, 0, 7); g.fill();
  const pr = Math.sin(t * 14); g.fillStyle = '#c89a3a'; g.beginPath(); g.ellipse(-37, -6 * pr, 2.4, 7 * Math.abs(pr) + 1, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(-37, 6 * pr, 2.4, 7 * Math.abs(pr) + 1, 0, 0, 7); g.fill();
  g.fillStyle = '#8a5a1a'; g.fillRect(-36, -2, 5, 4);
  // the conning tower with a periscope
  g.fillStyle = '#e3b04b'; g.beginPath(); g.roundRect(-8, -26, 18, 13, 3); g.fill(); g.stroke();
  g.strokeStyle = '#4a2c0a'; g.lineWidth = 2; g.beginPath(); g.moveTo(5, -26); g.lineTo(5, -36); g.lineTo(10, -36); g.stroke();
  // portholes, the keeper looking out of the middle one
  for (const px of [-16, 0, 16]){ g.fillStyle = '#4a2c0a'; g.beginPath(); g.arc(px, 1, 5.4, 0, 7); g.fill();
    const pg = g.createRadialGradient(px - 1.5, -.5, .5, px, 1, 4.4); pg.addColorStop(0, '#e8fbff'); pg.addColorStop(1, '#3a8ab0'); g.fillStyle = pg; g.beginPath(); g.arc(px, 1, 4.2, 0, 7); g.fill(); }
  g.fillStyle = '#f2d6c0'; g.beginPath(); g.arc(0, 2, 2.4, 0, 7); g.fill(); g.fillStyle = '#e8eef4'; g.beginPath(); g.arc(0, -.4, 2.6, Math.PI, 0); g.fill();   // the keeper's face, white hair
  g.restore();
  // bubbles from the propeller
  g.strokeStyle = 'rgba(220,250,255,.7)'; g.lineWidth = .8;
  for (let i = 0; i < 5; i++){ const k = (t * .7 + i / 5) % 1; g.globalAlpha = 1 - k; g.beginPath(); g.arc(x - 40 - k * 10 + Math.sin(i * 3 + t * 3) * 2, yy - k * 36, 1 + k * 1.6, 0, 7); g.stroke(); }
  g.globalAlpha = 1;
  if (near){ g.fillStyle = 'rgba(255,240,180,.9)'; g.beginPath(); g.arc(x, yy - 44 + Math.sin(t * 4) * 1.5, 2.6, 0, 7); g.fill(); }
}
{ const _d = drawNpcW; drawNpcW = function(g, n){ if (!n || !n.sub || !abyssHere()) return _d.apply(this, arguments);
    const x = n.x - cam.x, y = n.y - cam.y; if (x < -80 || x > VW + 80 || y < -90 || y > VH + 40) return; abySub(g, x, y, T, dist(n, P) < 110); }; }
// the middle of the camp: an open giant clam with a great glowing pearl, where the fire used to be
{ const _cf2 = campFire; campFire = function(g, x, y, t){ if (!abyssHere()) return _cf2.apply(this, arguments);
    const k = .85 + Math.sin(t * 1.4) * .15;
    g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y - 12, 0, x, y - 12, 80); gr.addColorStop(0, `rgba(150,230,255,${.3 * k})`); gr.addColorStop(1, 'rgba(80,180,255,0)');
    g.fillStyle = gr; g.fillRect(x - 80, y - 92, 160, 160); g.restore();
    const shell = (up, col) => { g.fillStyle = col; g.strokeStyle = '#6a5a48'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 19, y - 4);
      for (let i = 0; i <= 8; i++){ const a = Math.PI - i / 8 * Math.PI; g.lineTo(x + Math.cos(a) * 19, y - 4 - up * Math.sin(a) * (up > 0 ? 16 : 7) - (i % 2) * up * 2); } g.closePath(); g.fill(); g.stroke(); };
    shell(1, '#d8cdb4'); g.fillStyle = '#6a4ab0'; g.beginPath(); g.ellipse(x, y - 5, 16, 4, 0, 0, 7); g.fill();   // the far half and the mantle
    const pg = g.createRadialGradient(x - 3, y - 13, 1, x, y - 10, 8); pg.addColorStop(0, '#ffffff'); pg.addColorStop(.6, '#dff4ff'); pg.addColorStop(1, '#8ac0dc');
    g.fillStyle = pg; g.beginPath(); g.arc(x, y - 10, 7.5, 0, 7); g.fill();   // the pearl
    shell(-1, '#c8bca2');   // the near half
    g.strokeStyle = 'rgba(220,250,255,.75)'; g.lineWidth = .9;
    for (let i = 0; i < 6; i++){ const ph = (t * .5 + i / 6) % 1; g.globalAlpha = Math.sin(ph * Math.PI); g.beginPath(); g.arc(x + Math.sin(i * 2.3 + t * 2) * 6, y - 22 - ph * 50, 1.2 + ph * 1.4, 0, 7); g.stroke(); }
    g.globalAlpha = 1; }; }
