/* VAYRATHEN — js/world/props4.js — the common plants and rocks, repainted to one standard (v152)
   Before, each prop had its own scale and level of detail: puffy round trees no taller than two heroes next to a
   giant banyan, one-colour leaf blobs next to finely drawn houses. Every natural prop here follows the same rules:
     scale   a hero is 39 units ≈ 1.7 m (≈ 23 units a metre). Big plants are shortened the way most top-down games
             do, by about half, so a 10 m tree stands ≈ 4 heroes, a coconut palm ≈ 4.5, a bamboo clump ≈ 3.5,
             a banana ≈ 2, a bush to the knee, reeds to the shoulder.
     light   from the upper left, in four or five tones per material: highlight, light, base, shade, deep shade.
     detail  leaves are painted as hundreds of small leaf marks lit one by one (not a few big blobs), bark has
             grooves and knots, rock has facets, cracks and moss — all at the same mark size (≈ 2–3 units).
   Each prop also comes in several shapes per map (biomes ask for 3–5 variants), so a forest is not one tree copied.
   Loaded after world/props.js and props2.js; it replaces their versions of these props. */
'use strict';

const P4 = {
  leaf:[['#1d3a1c', '#2c5a2a', '#3f7d36', '#62a446', '#9ccb62'], ['#1f3a22', '#2e5a34', '#447e44', '#6aa25a', '#a8d080'], ['#243a1a', '#3a5a22', '#56802e', '#82a83e', '#bcd46a']],
  bark:['#2a1c12', '#4a3020', '#6a4a30', '#8a6644', '#b08a62'],
  palmBark:['#3a2c1e', '#5a4632', '#7a6448', '#9a8462', '#c0aa84'],
  rock:['#2e2c2a', '#4a4744', '#6a6660', '#8e8a82', '#b8b4aa'], moss:['#3a5a22', '#5a7e2e', '#86a83e'],
  bamboo:['#3a5a1e', '#5a7e2a', '#7ea23a', '#a8c45a', '#d8e48a'], needle:['#16301e', '#22442a', '#325c38', '#4a7a48', '#78a46a']
};
const p4tone = (pal, l) => pal[Math.max(0, Math.min(pal.length - 1, Math.round((l + 1) / 2 * (pal.length - 1))))];

/* a canopy: overlapping clumps, each covered in small lit leaf marks (light from the upper left), darker underneath */
function p4canopy(g, rng, cx, cy, rx, ry, pal, o = {}){
  const clumps = [], n = o.n || Math.round(8 + (rx + ry) / 9);
  for (let i = 0; i < n; i++){ const a = rng() * 6.28, d = Math.sqrt(rng()) * .78, r = (o.cr || .32) * Math.min(rx, ry) * (.75 + rng() * .5);
    clumps.push({x:cx + Math.cos(a) * rx * d, y:cy + Math.sin(a) * ry * d * .9 - (o.dome ? (1 - d) * ry * .25 : 0), r}); }
  clumps.sort((a, b) => a.y - b.y);
  // the dark mass first, so gaps between clumps read as depth, not holes
  for (const c of clumps){ g.fillStyle = pal[0]; ov(g, c.x + c.r * .08, c.y + c.r * .12, c.r * 1.02, c.r * .92); g.fill(); }
  for (const c of clumps){ const m = Math.round(c.r * c.r * (o.dense || .55));
    for (let k = 0; k < m; k++){ const a = rng() * 6.28, d = Math.sqrt(rng()), lx = c.x + Math.cos(a) * c.r * d, ly = c.y + Math.sin(a) * c.r * d * .9;
      const local = -(Math.cos(a) * .55 + Math.sin(a) * .8) * d, global = -((lx - cx) / rx * .35 + (ly - cy) / ry * .6), l = local * .7 + global + (rng() - .5) * .45;
      g.fillStyle = p4tone(pal, l); const s = (o.leaf || 2.2) * (.7 + rng() * .6); ov(g, lx, ly, s, s * .55, rng() * 3.14); g.fill(); } }
  // a few bright leaf tips catching the light on the upper left rim
  for (let i = 0; i < n * 3; i++){ const c = clumps[Math.floor(rng() * clumps.length)], a = 3.6 + rng() * 1.6, lx = c.x + Math.cos(a) * c.r * .9, ly = c.y + Math.sin(a) * c.r * .85;
    g.fillStyle = pal[pal.length - 1]; ov(g, lx, ly, 1.4, .8, rng() * 3); g.fill(); }
  return clumps;
}
/* a tapering trunk with bark grooves, a lit left side and a shaded right side */
function p4trunk(g, rng, x0, y0, x1, y1, w0, w1, pal){
  const n = 24, pts = []; for (let i = 0; i <= n; i++){ const t = i / n; pts.push([x0 + (x1 - x0) * t + Math.sin(t * 5 + w0) * .8, y0 + (y1 - y0) * t, w0 + (w1 - w0) * t]); }
  g.fillStyle = pal[2]; g.beginPath(); pts.forEach(([x, y, w], i) => (i ? g.lineTo(x - w, y) : g.moveTo(x - w, y))); for (let i = n; i >= 0; i--) g.lineTo(pts[i][0] + pts[i][2], pts[i][1]); g.closePath(); g.fill();
  g.fillStyle = pal[1]; g.beginPath(); pts.forEach(([x, y, w], i) => (i ? g.lineTo(x + w * .35, y) : g.moveTo(x + w * .35, y))); for (let i = n; i >= 0; i--) g.lineTo(pts[i][0] + pts[i][2], pts[i][1]); g.closePath(); g.fill();
  g.fillStyle = pal[3]; g.beginPath(); pts.forEach(([x, y, w], i) => (i ? g.lineTo(x - w * .75, y) : g.moveTo(x - w * .75, y))); for (let i = n; i >= 0; i--) g.lineTo(pts[i][0] - pts[i][2] * .3, pts[i][1]); g.closePath(); g.fill();
  for (let k = 0; k < Math.round(w0 * 1.6); k++){ const off = (rng() - .5) * 1.6, t0 = rng() * .6; g.strokeStyle = pal[0]; g.lineWidth = .7; g.beginPath();   // grooves
    for (let t = t0; t < Math.min(1, t0 + .3 + rng() * .4); t += .04){ const i = Math.round(t * n), [x, y, w] = pts[i]; g.lineTo(x + off * w * .8 + Math.sin(t * 20 + k) * .5, y); } g.stroke(); }
  for (let k = 0; k < 2; k++){ const t = .2 + rng() * .6, [x, y, w] = pts[Math.round(t * n)]; g.fillStyle = pal[0]; ov(g, x + (rng() - .5) * w, y, 1.4, 1.8); g.fill(); g.fillStyle = pal[3]; ov(g, x - .4 + (rng() - .5) * w * .1, y - .5, .7, .9); g.fill(); }   // knots
}
const p4branch = (g, pal, x0, y0, x1, y1, w) => { g.strokeStyle = pal[1]; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 6, x1, y1); g.stroke(); g.strokeStyle = pal[3]; g.lineWidth = w * .35; g.beginPath(); g.moveTo(x0 - w * .25, y0); g.quadraticCurveTo((x0 + x1) / 2 - w * .25, (y0 + y1) / 2 - 6, x1 - w * .2, y1); g.stroke(); };
/* roots flaring into the ground */
const p4roots = (g, rng, x, y, w, pal) => { for (let i = 0; i < 5; i++){ const sd = i - 2, L = w * (1.2 + rng() * .8); g.fillStyle = sd > 0 ? pal[1] : pal[2]; g.beginPath(); g.moveTo(x + sd * w * .35, y - w * .9); g.quadraticCurveTo(x + sd * w * .6, y - 1, x + sd * L, y + .5); g.lineTo(x + sd * w * .2, y + .5); g.closePath(); g.fill(); } };

Object.assign(PROP_TYPES, {
  /* a broadleaf tropical tree (rain tree / mango): ≈ 10 m, a short stout trunk forking into a wide dome */
  tree: (seed, v = 0) => makeProp({w:170, h:170, ax:85, ay:164, seed, shadow:[52, 15, 6], collide:13, paint(g, rng){
    const pal = P4.leaf[v % 3], H = 60 + rng() * 16, lean = (rng() - .5) * 10, cw = 62 + rng() * 14, ch = 44 + rng() * 10;
    p4roots(g, rng, 0, 0, 7, P4.bark);
    p4trunk(g, rng, 0, 0, lean, -H, 7.5, 4.5, P4.bark);
    for (const [dx, dy] of [[-30, -H - 12], [26, -H - 16], [-8, -H - 30], [14, -H - 4]]) p4branch(g, P4.bark, lean, -H + 6, lean + dx + (rng() - .5) * 8, dy, 3.6);
    p4canopy(g, rng, lean, -H - ch * .55, cw, ch, pal, {dome:true});
    if (v % 3 === 0) for (let i = 0; i < 9; i++){ const a = rng() * 6.28, d = rng() * .8; g.fillStyle = i % 2 ? '#e8a030' : '#f0c040'; ov(g, lean + Math.cos(a) * cw * d, -H - ch * .4 + Math.sin(a) * ch * d * .7, 1.8, 2.2); g.fill(); }   // ripe fruit
  }}),
  /* a coconut palm: a long ringed trunk leaning and curving up, a crown of feather fronds, coconuts under it */
  palm: (seed, v = 0) => makeProp({w:150, h:190, ax:75, ay:184, seed, shadow:[20, 7, 10], collide:8, paint(g, rng){
    const H = 140 + rng() * 26, lean = (rng() - .5) * 46, pt = t => [lean * t * t, -t * H];
    for (let t = 0; t < 1; t += .012){ const [x, y] = pt(t), w = 4.6 - t * 1.6;
      g.fillStyle = Math.floor(t * 60) % 2 ? P4.palmBark[2] : P4.palmBark[3]; g.fillRect(x - w, y - 2.6, w * 2, 2.8);   // ring scars
      g.fillStyle = P4.palmBark[1]; g.fillRect(x + w * .25, y - 2.6, w * .75, 2.8); g.fillStyle = P4.palmBark[4]; g.fillRect(x - w * .8, y - 2.6, w * .3, 2.8); }
    const [tx, ty] = pt(1), fr = 12;
    for (let i = 0; i < fr; i++){ const back = i % 2 === 0, a = -Math.PI / 2 + (i / (fr - 1) - .5) * 4.2 + (rng() - .5) * .2, len = 46 + rng() * 14, droop = 22 + rng() * 14;
      const pal = back ? [P4.leaf[0][0], P4.leaf[0][1], P4.leaf[0][2]] : [P4.leaf[0][1], P4.leaf[0][3], P4.leaf[0][2]];
      if (!back) continue; frond(g, rng, tx, ty, a, len, droop, pal, 5.2); }
    for (let i = 0; i < 6; i++){ g.fillStyle = i % 2 ? '#5a4a22' : '#7a6630'; ov(g, tx + (i - 2.5) * 3, ty + 4 + (i % 2) * 2, 3, 3.2); g.fill(); g.fillStyle = '#9a8448'; ov(g, tx + (i - 2.5) * 3 - 1, ty + 3 + (i % 2) * 2, 1, 1.1); g.fill(); }   // coconuts
    for (let i = 0; i < fr; i++){ if (i % 2 === 0) continue; const a = -Math.PI / 2 + (i / (fr - 1) - .5) * 4.2 + (rng() - .5) * .2, len = 46 + rng() * 14, droop = 22 + rng() * 14;
      frond(g, rng, tx, ty, a, len, droop, [P4.leaf[0][1], P4.leaf[0][3], P4.leaf[0][4]], 5.2); }
  }}),
  /* a knee-high shrub */
  bush: (seed, v = 0) => makeProp({w:56, h:40, ax:28, ay:34, seed, shadow:[20, 6], collide:0, paint(g, rng){
    p4canopy(g, rng, 0, -13, 22 + rng() * 4, 13, P4.leaf[(v + 1) % 3], {n:7, cr:.5, leaf:1.8, dense:.7});
    if (v % 3 === 2) for (let i = 0; i < 6; i++){ g.fillStyle = ['#f4f0e8', '#f08ab0', '#f0d070'][v % 3]; ov(g, (rng() - .5) * 34, -14 + (rng() - .5) * 16, 1.4, 1.4); g.fill(); }   // a few flowers
  }}),
  /* a boulder: lit facets, cracks, a cap of moss and a few pebbles */
  rock: (seed, v = 0) => makeProp({w:56, h:40, ax:28, ay:34, seed, shadow:[20, 5], collide:9, paint(g, rng){
    const n = 9, R0 = 15 + rng() * 6, hgt = .62 + rng() * .2, pts = [];
    for (let i = 0; i < n; i++){ const a = Math.PI + i / (n - 1) * Math.PI, r = R0 * (.82 + rng() * .3); pts.push([Math.cos(a) * r, Math.min(0, Math.sin(a) * r * hgt * 1.6)]); }
    g.fillStyle = P4.rock[2]; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.lineTo(pts[n - 1][0], 1); g.lineTo(pts[0][0], 1); g.closePath(); g.fill();
    const top = [0, -R0 * hgt * 1.1];   // facets: each triangle from the top point lit by how it faces the upper left
    for (let i = 0; i < n - 1; i++){ const [ax, ay] = pts[i], [bx, by] = pts[i + 1], nx = (ax + bx) / 2, ny = (ay + by) / 2, l = -(nx / R0) * .7 - (ny / R0) * .9 + (rng() - .5) * .3;
      g.fillStyle = p4tone(P4.rock, l); g.beginPath(); g.moveTo(top[0] + (rng() - .5) * 3, top[1]); g.lineTo(ax, ay); g.lineTo(bx, by); g.closePath(); g.fill(); }
    g.fillStyle = P4.rock[1]; g.beginPath(); g.moveTo(pts[0][0], 1); for (let x = pts[0][0]; x <= pts[n - 1][0]; x += 3) g.lineTo(x, -2 - rng() * 2); g.lineTo(pts[n - 1][0], 1); g.closePath(); g.fill();   // the shaded foot
    g.strokeStyle = P4.rock[0]; g.lineWidth = .7; for (let k = 0; k < 3; k++){ let x = (rng() - .5) * R0, y = -R0 * hgt * (.3 + rng() * .5); g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 4; j++){ x += (rng() - .5) * 5; y += 2 + rng() * 2; g.lineTo(x, y); } g.stroke(); }
    if (v % 2 === 0){ for (let i = 0; i < 26; i++){ const x = (rng() - .5) * R0 * 1.1, y = -R0 * hgt * (1 - Math.abs(x) / R0 * .6) + rng() * 4; g.fillStyle = P4.moss[Math.floor(rng() * 3)]; ov(g, x, y, 1.5, 1); g.fill(); } }
    for (let i = 0; i < 4; i++){ const x = (rng() - .5) * R0 * 2.4; g.fillStyle = P4.rock[1 + (i % 3)]; ov(g, x, 2, 1.6 + rng(), 1.1); g.fill(); }
  }}),
  /* a dead tree: bare forked limbs with lit bark, broken tips */
  deadtree: (seed, v = 0) => makeProp({w:110, h:130, ax:55, ay:124, seed, shadow:[18, 6, 4], collide:7, paint(g, rng){
    p4roots(g, rng, 0, 0, 5, P4.bark);
    const br = (x, y, a, len, w, d) => { if (d > 4 || len < 5) return; const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      p4trunk(g, rng, x, y, x2, y2, w, w * .62, P4.bark);
      br(x2, y2, a - .45 - rng() * .3, len * .68, w * .62, d + 1); if (rng() < .85) br(x2, y2, a + .4 + rng() * .3, len * .64, w * .58, d + 1); };
    br(0, 0, -Math.PI / 2 + (rng() - .5) * .2, 46, 5.5, 0);
  }}),
  /* a conifer: tiers of drooping branches in needle strokes (v odd: under snow) */
  pine: (seed, v = 0) => makeProp({w:100, h:200, ax:50, ay:194, seed, shadow:[24, 8, 6], collide:10, paint(g, rng){
    const H = 160 + rng() * 26, snow = v % 2 === 1;
    p4trunk(g, rng, 0, 0, 0, -H * .3, 4.2, 3, P4.bark);
    const tiers = 10;
    for (let t = 0; t < tiers; t++){ const k = t / (tiers - 1), y = -H * (.18 + k * .8), w = 40 * (1 - k * .82) + 4;
      for (let i = 0; i < w * 3.2; i++){ const x = (rng() - .5) * 2 * w, yy = y - rng() * 14 + Math.abs(x) / w * 8, l = -(x / w) * .5 + (rng() - .5) * .6 + (k - .5) * .4;
        g.strokeStyle = p4tone(P4.needle, l); g.lineWidth = 1.1; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + (x < 0 ? -2.4 : 2.4), yy + 2.6); g.stroke(); }
      if (snow){ g.fillStyle = '#eef4fa'; for (let i = 0; i < w * .6; i++){ ov(g, (rng() - .5) * 1.8 * w, y - 10 - rng() * 4 + (rng() - .5) * 2, 2.4, 1.2); g.fill(); } } }
  }}),
  /* reeds and cattails: a shoulder-high clump of blades and brown spikes */
  reed: (seed, v = 0) => makeProp({w:44, h:56, ax:22, ay:52, seed, shadow:[12, 4], collide:0, paint(g, rng){
    for (let i = 0; i < 16; i++){ const x0 = (rng() - .5) * 16, h = 26 + rng() * 22, bend = (rng() - .5) * 12, l = (rng() - .5) * 1.2;
      g.strokeStyle = p4tone(P4.leaf[2], l - .2); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, 0); g.quadraticCurveTo(x0, -h * .6, x0 + bend, -h); g.stroke();
      g.strokeStyle = p4tone(P4.leaf[2], l + .5); g.lineWidth = .5; g.beginPath(); g.moveTo(x0 - .4, 0); g.quadraticCurveTo(x0 - .4, -h * .6, x0 + bend - .4, -h); g.stroke();
      if (i % 4 === 0){ g.fillStyle = '#5a3a1e'; ov(g, x0 + bend * .7, -h * .82, 1.4, 4.2); g.fill(); g.fillStyle = '#7a5430'; ov(g, x0 + bend * .7 - .5, -h * .84, .5, 3); g.fill(); } }
  }}),
  /* a clump of giant bamboo: jointed culms, lit on one side, leaf sprays at the top */
  bamboo: (seed, v = 0) => makeProp({w:110, h:170, ax:55, ay:164, seed, shadow:[26, 8], collide:14, paint(g, rng){
    const culms = 9 + Math.floor(rng() * 4), tops = [];
    for (let i = 0; i < culms; i++){ const x0 = (rng() - .5) * 26, h = 110 + rng() * 40, lean = (x0 / 13) * (14 + rng() * 14), w = 2.2 + rng() * .8;
      for (let t = 0; t < 1; t += .01){ const x = x0 + lean * t * t, y = -h * t; g.fillStyle = P4.bamboo[2]; g.fillRect(x - w, y - 1.4, w * 2, 1.6); g.fillStyle = P4.bamboo[4]; g.fillRect(x - w * .7, y - 1.4, w * .45, 1.6); g.fillStyle = P4.bamboo[1]; g.fillRect(x + w * .4, y - 1.4, w * .6, 1.6); }
      for (let t = .08; t < 1; t += .1 + rng() * .03){ const x = x0 + lean * t * t, y = -h * t; g.fillStyle = P4.bamboo[0]; g.fillRect(x - w - .3, y - .6, w * 2 + .6, 1.2); g.fillStyle = P4.bamboo[4]; g.fillRect(x - w, y - 1.4, w * 2, .5); }   // nodes
      tops.push([x0 + lean, -h]); }
    for (const [tx, ty] of tops) p4canopy(g, rng, tx, ty + 10, 16, 18, P4.leaf[2], {n:6, cr:.55, leaf:2.6, dense:.6});
  }}),
  /* a banana plant: a soft pseudostem and broad paddle leaves, torn along the veins */
  banana: (seed, v = 0) => makeProp({w:100, h:100, ax:50, ay:94, seed, shadow:[20, 6], collide:8, paint(g, rng){
    p4trunk(g, rng, 0, 0, 2, -44, 4.2, 3, ['#3a4a22', '#5a6a2e', '#7a8a3a', '#9aaa52', '#c0c87a']);
    for (let i = 0; i < 8; i++){ const a = -Math.PI / 2 + (i / 7 - .5) * 3.4 + (rng() - .5) * .2, L = 34 + rng() * 10, droop = 10 + rng() * 14, x0 = 2, y0 = -44;
      const ex = x0 + Math.cos(a) * L, ey = y0 + Math.sin(a) * L * .6 + droop, nx = -(ey - y0), ny = ex - x0, nl = Math.hypot(nx, ny) || 1, wd = 7;
      const lit = Math.cos(a) < 0 ? .3 : -.3;
      g.fillStyle = p4tone(P4.leaf[1], lit - .2); g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + ex) / 2 + nx / nl * wd, (y0 + ey) / 2 + ny / nl * wd - 6, ex, ey); g.quadraticCurveTo((x0 + ex) / 2 - nx / nl * wd, (y0 + ey) / 2 - ny / nl * wd - 6, x0, y0); g.fill();
      g.strokeStyle = p4tone(P4.leaf[1], lit + .6); g.lineWidth = .8; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + ex) / 2, (y0 + ey) / 2 - 6, ex, ey); g.stroke();   // midrib
      g.strokeStyle = P4.leaf[1][0]; g.lineWidth = .5; for (let k = 1; k < 6; k++){ const t = k / 6, mx = x0 + (ex - x0) * t, my = y0 + (ey - y0) * t - Math.sin(t * Math.PI) * 6; if (rng() < .5){ g.beginPath(); g.moveTo(mx, my); g.lineTo(mx + nx / nl * wd * .8, my + ny / nl * wd * .8); g.stroke(); } } }   // tears
  }})
});

/* fronds (tree ferns, cycads, palms, ground ferns): every leaflet lit on its own — the side facing the upper left
   is light, the underside and the far side dark — instead of three flat colours (replaces props3.js's frond) */
function frond(g, rng, x0, y0, a, len, droop, cols, leaf = 4){
  const pal = cols.length >= 5 ? cols : [cols[0], cols[0], cols[1], cols[2] || cols[1], cols[2] || cols[1]], back = cols[0] === cols[1];
  const pts = []; for (let k = 0; k <= 1.0001; k += .06){ pts.push([x0 + Math.cos(a) * len * k, y0 + Math.sin(a) * len * k + droop * k * k, k]); }
  const facing = -Math.cos(a) * .5 - Math.sin(a) * .5 - (back ? .7 : 0);   // a frond pointing up-left catches the light
  for (let i = 1; i < pts.length; i++){ const [x, y, k] = pts[i], [px, py] = pts[i - 1], ang = Math.atan2(y - py, x - px), l = leaf * (1 - k * .65) + .8;
    for (const sd of [-1, 1]){ const la = ang + sd * (1.2 - k * .35), ex = x + Math.cos(la) * l * 1.7, ey = y + Math.sin(la) * l * 1.7 + l * .5;
      const lit = facing + (Math.sin(la) < 0 ? .35 : -.35) + (rng() - .5) * .35 - k * .15;
      g.strokeStyle = p4tone(pal, lit); g.lineWidth = 1.7 * (1 - k * .5) + .5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + ex) / 2, (y + ey) / 2 - .8, ex, ey); g.stroke(); } }
  g.strokeStyle = p4tone(pal, facing - .6); g.lineWidth = 1.2; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
}
P4.fern = ['#17301a', '#223f22', '#34582c', '#4a7436', '#6e9450'];
P4.cycad = ['#1e3018', '#2c4420', '#40602a', '#5a7c36', '#84a04e'];
Object.assign(PROP_TYPES, {
  /* araucaria (monkey-puzzle / bunya pine), the tall conifer of the Cretaceous: a straight trunk, whorls of level
     branches that turn up at the tips, foliage only at the ends, and a flat umbrella crown */
  araucaria: (seed, v = 0) => makeProp({w:150, h:280, ax:75, ay:274, seed, shadow:[26, 8, 8], collide:8, paint(g, rng){
    const H = 210 + rng() * 44;
    p4roots(g, rng, 0, 0, 6, P4.bark); p4trunk(g, rng, 0, 0, 0, -H, 6, 2.6, P4.bark);
    const tiers = 8 + Math.floor(rng() * 3);
    for (let i = 0; i < tiers; i++){ const k = i / (tiers - 1), y = -H * (.4 + k * .58), span = (48 - k * 26) * (.85 + rng() * .3);
      for (const sd of [-1, 1]){ const ex = sd * span, ey = y + 4 - rng() * 6;
        p4branch(g, P4.bark, 0, y, ex, ey, 2.2 - k);
        p4canopy(g, rng, ex * .75, ey - 3, 12 - k * 4, 6, P4.needle, {n:4, cr:.7, leaf:1.6, dense:.9}); } }
    p4canopy(g, rng, 0, -H - 4, 26, 9, P4.needle, {n:8, cr:.6, leaf:1.6, dense:.9});   // the flat crown
  }}),
  /* ground ferns, lit leaflet by leaflet */
  groundfern: (seed, v = 0) => makeProp({w:80, h:46, ax:40, ay:40, seed, shadow:[16, 4, 1], collide:0, paint(g, rng){
    for (let i = 0; i < 9; i++){ const a = -Math.PI / 2 + (i / 8 - .5) * 3.2 + (rng() - .5) * .2; frond(g, rng, 0, 0, a, 18 + rng() * 9, 4 + rng() * 5, P4.fern, 2.6); }
  }})
});

/* ---------- bones (data/world4.js): as they are found at the Phu Wiang digs ---------- */
P4.bone = ['#6a5a42', '#9a8866', '#c8b894', '#e6dabc', '#fff6e0'];
P4.sand = ['#7a6040', '#a0825a', '#c4a676', '#dcc292', '#efdcb0'];
const p4bone = (g, x0, y0, x1, y1, w, lit = 0) => { const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
  g.strokeStyle = P4.bone[1]; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = p4tone(P4.bone, .4 + lit); g.lineWidth = w * .55; g.beginPath(); g.moveTo(x0 - nx * w * .18, y0 - ny * w * .18); g.lineTo(x1 - nx * w * .18, y1 - ny * w * .18); g.stroke();
  for (const [x, y] of [[x0, y0], [x1, y1]]){ g.fillStyle = P4.bone[2]; ov(g, x, y, w * .75, w * .7); g.fill(); g.fillStyle = P4.bone[4]; ov(g, x - w * .2, y - w * .2, w * .3, w * .25); g.fill(); } };   // knobbed ends
const p4vert = (g, x, y, s, lit = 0) => { g.fillStyle = P4.bone[1]; ov(g, x, y, 2.6 * s, 2.2 * s); g.fill(); g.fillStyle = p4tone(P4.bone, .3 + lit); ov(g, x - .5 * s, y - .5 * s, 2 * s, 1.6 * s); g.fill();
  g.strokeStyle = P4.bone[1]; g.lineWidth = 1.4 * s; g.beginPath(); g.moveTo(x, y - 1.6 * s); g.lineTo(x - .6 * s, y - 5 * s); g.stroke(); g.strokeStyle = P4.bone[3]; g.lineWidth = .6 * s; g.stroke(); };   // centrum and neural spine
/* a theropod skull lying on its side: long jaws with teeth, the antorbital opening, the eye socket and the window behind it */
function p4skull(g, x, y, s, rng){
  const P = (px, py) => [x + px * s, y + py * s];
  g.fillStyle = P4.bone[1]; g.beginPath(); [[-20, 3], [-19, -3], [-6, -9], [6, -11], [13, -8], [15, -1], [12, 5], [-6, 6]].forEach(([px, py], i) => { const [X, Y] = P(px, py); i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); g.fill();
  g.fillStyle = P4.bone[3]; g.beginPath(); [[-19, 0], [-6, -8], [6, -10], [12, -7], [3, -4], [-8, -1]].forEach(([px, py], i) => { const [X, Y] = P(px, py); i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); g.fill();
  g.fillStyle = P4.bone[0]; for (const [px, py, rx, ry] of [[-5, -4, 4.2, 2.6], [5, -6, 2.4, 2.6], [10, -3, 1.6, 3]]){ const [X, Y] = P(px, py); ov(g, X, Y, rx * s, ry * s); g.fill(); }   // openings: antorbital, orbit, temporal
  g.fillStyle = P4.bone[2]; g.beginPath(); [[-19, 4], [-6, 6.5], [12, 6], [13, 9], [-6, 9], [-18, 6]].forEach(([px, py], i) => { const [X, Y] = P(px, py); i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); g.fill();   // lower jaw
  g.fillStyle = '#fff6e0'; for (let i = 0; i < 9; i++){ const [X, Y] = P(-18 + i * 3, 3.5); g.beginPath(); g.moveTo(X - .8 * s, Y); g.lineTo(X, Y + 2.6 * s * (1 - i * .05)); g.lineTo(X + .8 * s, Y); g.fill(); }
}
Object.assign(PROP_TYPES, {
  /* a theropod skull and scattered vertebrae weathering out of a sandstone ledge */
  fossil: (seed, v = 0) => makeProp({w:100, h:52, ax:50, ay:40, seed, shadow:[30, 6, 1], collide:10, paint(g, rng){
    g.fillStyle = P4.sand[1]; ov(g, 0, 2, 40, 10); g.fill(); g.fillStyle = P4.sand[3]; ov(g, -3, 0, 36, 8); g.fill();
    for (let i = 0; i < 14; i++){ g.fillStyle = P4.sand[Math.floor(rng() * 5)]; ov(g, (rng() - .5) * 70, (rng() - .5) * 12, 1 + rng() * 2, .7 + rng()); g.fill(); }   // grit
    p4skull(g, -10 + (rng() - .5) * 6, -6, .9 + rng() * .2, rng);
    for (let i = 0; i < 4; i++) p4vert(g, 14 + i * 6, -2 + (rng() - .5) * 3, .8, -.1);
    g.fillStyle = P4.sand[2]; ov(g, 26, 2, 14, 4); g.fill();   // sand drifting over the end of the neck
  }}),
  /* the skeleton of a long-necked sauropod lying on its side, half out of a sand bar: a small skull, a long chain of
     neck vertebrae, ribs curving down from the backbone, the hip, a thigh bone, and the tail tapering into the sand */
  ribcage: (seed, v = 0) => makeProp({w:230, h:96, ax:115, ay:80, seed, shadow:[80, 10, 4], collide:18, paint(g, rng){
    g.fillStyle = P4.sand[1]; ov(g, 0, 3, 104, 14); g.fill(); g.fillStyle = P4.sand[2]; ov(g, -4, 1, 98, 11); g.fill();
    const spine = t => [-60 + t * 120, -34 - Math.sin(t * Math.PI) * 10];
    // ribs first (behind the backbone): long in the middle, short toward the neck and hips, each a curve down and back
    for (let i = 0; i < 12; i++){ const t = .12 + i / 11 * .6, [x, y] = spine(t), L = 22 + Math.sin((t - .12) / .6 * Math.PI) * 18;
      g.strokeStyle = P4.bone[1]; g.lineWidth = 3.2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 9, y + L * .45, x + 3, y + L); g.stroke();
      g.strokeStyle = P4.bone[3]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - .6, y); g.quadraticCurveTo(x + 8, y + L * .45, x + 2.4, y + L); g.stroke(); }
    for (let i = 0; i <= 22; i++) { const [x, y] = spine(i / 22); p4vert(g, x, y, 1.15 - Math.abs(i / 22 - .5) * .5); }   // the backbone
    // the neck to the left, ending in a small skull; the tail to the right, sinking into the sand
    let nx = -60, ny = -34; for (let i = 0; i < 9; i++){ nx -= 5.6; ny += 1.8 + i * .5; p4vert(g, nx, ny, .9 - i * .04); }
    g.fillStyle = P4.bone[2]; ov(g, nx - 6, ny + 3, 5, 3.2); g.fill(); g.fillStyle = P4.bone[0]; ov(g, nx - 5, ny + 2, 1.4, 1.2); g.fill();
    let tx = 60, ty = -34; for (let i = 0; i < 10; i++){ tx += 4.6; ty += 2.2; p4vert(g, tx, ty, .9 - i * .07); }
    p4bone(g, 44, -24, 60, 6, 4.6, .1); g.fillStyle = P4.bone[2]; ov(g, 44, -28, 9, 6); g.fill(); g.fillStyle = P4.bone[3]; ov(g, 42, -30, 6, 3.5); g.fill();   // hip and thigh bone
    p4bone(g, -46, -22, -36, 4, 3.6, 0);   // upper arm
    for (let i = 0; i < 5; i++){ g.fillStyle = P4.sand[3]; ov(g, -80 + i * 40 + (rng() - .5) * 20, 2 - rng() * 4, 12 + rng() * 10, 4 + rng() * 2); g.fill(); }   // drifts of sand over it
  }}),
  /* an excavation pit like the Phu Wiang sites: a stepped cut in the sandstone, strings marking a grid of squares,
     a sauropod's bones exposed where they lie, a roof on posts shading half of it, tools and a sieve at the side */
  digsite: (seed, v = 0) => makeProp({w:300, h:200, ax:150, ay:150, seed, collide:0, paint(g, rng){
    const W2 = 112, top = -70, flo = -46, lip = -2;   // seen from above and in front: the far wall shows, the near wall is hidden
    // spoil heaps and trampled ground around the cut
    g.fillStyle = P4.sand[1]; g.beginPath(); for (let a = 0; a <= 6.3; a += .2){ const r = 1 + (rng() - .5) * .08; g.lineTo(Math.cos(a) * (W2 + 30) * r, -36 + Math.sin(a) * 52 * r); } g.closePath(); g.fill();
    for (let i = 0; i < 6; i++){ const x = (rng() < .5 ? -1 : 1) * (W2 + 8 + rng() * 14), y = -60 + rng() * 50; g.fillStyle = P4.sand[2]; ov(g, x, y, 12 + rng() * 6, 5 + rng() * 2); g.fill(); g.fillStyle = P4.sand[3]; ov(g, x - 3, y - 2, 7, 2.6); g.fill(); }
    // the far wall: sandstone in beds, lit from above
    for (let y = top, k = 0; y < flo; y += 4, k++){ g.fillStyle = [P4.sand[2], P4.sand[3], P4.sand[1], P4.sand[3], P4.sand[2]][k % 5]; g.fillRect(-W2, y, 2 * W2, 4.2); }
    g.fillStyle = 'rgba(40,28,16,.25)'; g.fillRect(-W2, flo - 3, 2 * W2, 3);
    // the pit floor, a little darker, with the grid of string over it
    g.fillStyle = P4.sand[2]; g.fillRect(-W2, flo, 2 * W2, lip - flo);
    for (let i = 0; i < 50; i++){ g.fillStyle = 'rgba(80,58,34,.22)'; ov(g, (rng() - .5) * 2 * W2, flo + rng() * (lip - flo), 1 + rng() * 2, .6); g.fill(); }
    g.fillStyle = 'rgba(30,22,12,.28)'; g.fillRect(-W2, flo, 2 * W2, 16);   // shade of the roof on the back half
    // the bones as they lie: the backbone in a curve, ribs, a thigh bone, a shoulder blade, a few loose teeth
    for (let i = 0; i < 15; i++){ const x = -80 + i * 10, y = flo + 18 + Math.sin(i / 3) * 4; p4vert(g, x, y, 1.05, -.1);
      if (i > 3 && i < 12 && i % 2){ g.strokeStyle = P4.bone[1]; g.lineWidth = 2.8; g.beginPath(); g.moveTo(x, y + 2); g.quadraticCurveTo(x + 7, y + 10, x + 3, y + 20); g.stroke(); g.strokeStyle = P4.bone[3]; g.lineWidth = 1.2; g.stroke(); } }
    p4bone(g, 40, flo + 10, 82, flo + 26, 6, .2); p4bone(g, -92, flo + 30, -62, flo + 38, 4.4, 0);
    g.fillStyle = P4.bone[2]; g.beginPath(); g.moveTo(60, flo + 34); g.quadraticCurveTo(78, flo + 26, 96, flo + 38); g.quadraticCurveTo(78, flo + 44, 60, flo + 34); g.fill(); g.fillStyle = P4.bone[3]; ov(g, 76, flo + 33, 9, 3); g.fill();
    g.strokeStyle = 'rgba(245,240,224,.85)'; g.lineWidth = .6;
    for (let x = -W2; x <= W2; x += 28){ g.beginPath(); g.moveTo(x, flo); g.lineTo(x, lip); g.stroke(); } for (let y = flo; y <= lip; y += 11){ g.beginPath(); g.moveTo(-W2, y); g.lineTo(W2, y); g.stroke(); }
    for (let x = -W2; x <= W2; x += 28){ g.fillStyle = '#7a5a34'; g.fillRect(x - 1, lip - 5, 2, 6); g.fillStyle = '#d84030'; g.fillRect(x - 1, lip - 5, 2, 1.4); }
    // the near lip of the cut
    g.fillStyle = P4.sand[1]; g.beginPath(); g.moveTo(-W2 - 4, lip); for (let x = -W2; x <= W2; x += 8) g.lineTo(x, lip + 1 + rng() * 2); g.lineTo(W2 + 4, lip); g.lineTo(W2 + 6, lip + 6); g.lineTo(-W2 - 6, lip + 6); g.closePath(); g.fill();
    // the roof stands on posts along the far edge and leans out over the pit
    for (const x of [-W2 + 6, -W2 / 3, W2 / 3, W2 - 6]) p4trunk(g, rng, x, top, x, top - 64, 2, 1.8, P4.bark);
    for (let x = -W2 - 10; x <= W2 + 6; x += 6){ g.fillStyle = Math.floor((x + 200) / 6) % 2 ? '#8e8e88' : '#acaca4'; g.beginPath(); g.moveTo(x, top - 70); g.lineTo(x + 6, top - 70); g.lineTo(x + 6, top - 46); g.lineTo(x, top - 46); g.closePath(); g.fill(); }
    g.fillStyle = '#5e5e58'; g.fillRect(-W2 - 10, top - 46, 2 * W2 + 16, 2.4); g.fillStyle = '#d0d0c8'; g.fillRect(-W2 - 10, top - 71, 2 * W2 + 16, 1.4);
    // a sign board in Thai and the tools on the spoil heap
    g.fillStyle = '#6a4a2a'; g.fillRect(W2 + 14, -8, 2, 16); g.fillStyle = '#f0e6c8'; g.fillRect(W2 + 2, -22, 26, 14); g.fillStyle = '#5a3a1a'; for (let k = 0; k < 3; k++) g.fillRect(W2 + 5, -19 + k * 4, 20 - k * 4, 1.4);
    g.fillStyle = '#7a5a34'; ov(g, -W2 - 18, -8, 9, 4); g.fill(); g.strokeStyle = '#3a2a1a'; g.lineWidth = .4; for (let k = -3; k <= 3; k++){ g.beginPath(); g.moveTo(-W2 - 18 + k * 2, -11); g.lineTo(-W2 - 18 + k * 2, -5); g.stroke(); }
    g.fillStyle = '#c84a2a'; g.fillRect(-W2 - 34, -14, 8, 9); g.fillStyle = '#e86a4a'; g.fillRect(-W2 - 34, -14, 2, 9);
  }})
});

/* ---------- composed maps (v152) ----------
   The stock placer drops props one by one at random over the whole map, so every map reads as an even sprinkle.
   A biome with a `zones` recipe is laid out the way a level artist would: a dense belt of tall plants along the
   map edges, groves (a few trees with their own undergrowth) separated by open clearings where fights happen,
   plants that live by water placed on the banks, a landmark near the middle, and only a little loose scatter. */
function p4ok(x, y, name, gap){
  if (x < 40 || y < 60 || x > W - 40 || y > H - 30) return false;
  if (trailD(x, y) < 46 || GATES.some(gt => Math.hypot(gt.x - x, gt.y - y) < 150) || Math.hypot(x - LAIR.x, y - LAIR.y) < 170) return false;
  if (CAMP && Math.hypot(x - CAMP.x, (y - CAMP.y) * 1.2) < 200) return false;
  const wet = ['reed', 'horsetail'].includes(name);
  if (obstacles.some(o => o.water && Math.hypot(o.x - x, o.y - y) < o.r + (wet ? -10 : 20))) return false;
  if (typeof waterAt === 'function' && !wet && waterAt(x, y, 10)) return false;
  return !obstacles.some(o => !o.water && Math.hypot(o.x - x, o.y - y) < o.r + gap);
}
function p4put(list, x, y, gap = 14){ const t = list[Math.floor(R() * list.length)], [name, nv] = Array.isArray(t) ? t : [t, 4];
  if (!p4ok(x, y, name, gap)) return false; addProp(name, x, y, Math.floor(R() * nv)); return true; }
function p4layout(Z){
  const A = typeof AREA === 'function' ? AREA() : 1, clear = [];
  for (let i = 0; i < (Z.clearings || 3); i++) clear.push({x:W * (.2 + R() * .6), y:H * (.25 + R() * .5), r:110 + R() * 70});
  const inClear = (x, y) => clear.some(c => Math.hypot(c.x - x, c.y - y) < c.r);
  // the landmark first, near the middle trail, so nothing else takes its place
  for (const lm of Z.landmarks || []){ for (let t = 0; t < 80; t++){ const x = W * (.35 + R() * .3) + (R() - .5) * 200, y = H * (.3 + R() * .4); if (trailD(x, y) < 90) continue; if (p4put([[lm, 1]], x, y, 60)) break; } }
  // the edge belt
  if (Z.edge){ const n = Math.round(Z.edge.n * A); for (let i = 0, t = 0; i < n && t < n * 12; t++){ const side = Math.floor(R() * 4), d = Math.pow(R(), 1.6) * (Z.edge.depth || 220);
      const x = side === 0 ? 50 + d : side === 1 ? W - 50 - d : 60 + R() * (W - 120), y = side === 2 ? 80 + d : side === 3 ? H - 40 - d : 80 + R() * (H - 120);
      if (p4put(Z.edge.props, x, y, Z.edge.gap ?? 10)) i++; } }
  // groves with their undergrowth
  if (Z.groves){ const n = Math.round(Z.groves.n * A); for (let gI = 0; gI < n; gI++){ const cx = 200 + R() * (W - 400), cy = 200 + R() * (H - 340); if (inClear(cx, cy)) continue;
      const k = Z.groves.size[0] + Math.floor(R() * (Z.groves.size[1] - Z.groves.size[0] + 1)), rad = Z.groves.r || 90;
      for (let i = 0, t = 0; i < k && t < k * 8; t++){ const a = R() * 6.28, d = Math.sqrt(R()) * rad; if (p4put(Z.groves.props, cx + Math.cos(a) * d, cy + Math.sin(a) * d * .8, 8)) i++; }
      for (let i = 0, t = 0; i < k * 1.6 && t < k * 10; t++){ const a = R() * 6.28, d = Math.sqrt(R()) * rad * 1.35; if (p4put(Z.groves.under, cx + Math.cos(a) * d, cy + Math.sin(a) * d * .8, 2)) i++; } } }
  // by the water: on pond rims and along both banks of a river
  if (Z.banks){ for (const w of WATERS){ if (w.kind === 'lava') continue;
      if (w.k === 'pond'){ const n = Math.round((w.rx + w.ry) / 26 * Z.banks.k); for (let i = 0; i < n; i++){ const a = R() * 6.28, x = w.x + Math.cos(a) * (w.rx + 8 + R() * 14), y = w.y + Math.sin(a) * (w.ry + 6 + R() * 10); p4put(Z.banks.props, x, y, 2); } }
      else { const n = Math.round(W / 70 * Z.banks.k); for (let i = 0; i < n; i++){ const x = 30 + R() * (W - 60), sd = R() < .5 ? -1 : 1, y = (sd < 0 ? w.y0 - 16 - R() * 26 : w.y1 + 16 + R() * 26) + Math.sin(x / 260) * 18; p4put(Z.banks.props, x, y, 2); } } } }
  // a little loose scatter, never inside a clearing
  if (Z.scatter){ const n = Math.round(Z.scatter.n * A); for (let i = 0, t = 0; i < n && t < n * 10; t++){ const x = 60 + R() * (W - 120), y = 80 + R() * (H - 120); if (inClear(x, y)) continue; if (p4put(Z.scatter.props, x, y, 18)) i++; } }
}
{ const _pb = placeBiomeProps;
  placeBiomeProps = function(B, mapId){ if (B.zones) return p4layout(B.zones); return _pb.apply(this, arguments); }; }

Object.assign(BIOME.primeval, {zones:{clearings:4,
  landmarks:['digsite'],
  edge:{n:150, depth:240, props:[['araucaria', 5], ['araucaria', 5], ['treefern', 5], ['treefern', 5], ['cycad', 5]]},
  groves:{n:9, size:[3, 6], r:80, props:[['treefern', 5], ['treefern', 5], ['araucaria', 5], ['cycad', 5]], under:[['groundfern', 5], ['groundfern', 5], ['cycad', 5], ['rock', 4]]},
  banks:{k:1.2, props:[['horsetail', 5], ['horsetail', 5], ['groundfern', 5]]},
  scatter:{n:14, props:[['fossil', 3], ['rock', 4], ['groundfern', 5]]}}});
Object.assign(BIOME.amberfen, {zones:{clearings:3,
  landmarks:['digsite'],
  edge:{n:70, depth:200, props:[['araucaria', 5], ['cycad', 5], ['amber', 3], ['rock', 4]]},
  groves:{n:6, size:[2, 4], r:70, props:[['cycad', 5], ['araucaria', 5]], under:[['groundfern', 5], ['horsetail', 5], ['rock', 4]]},
  banks:{k:1.6, props:[['horsetail', 5], ['horsetail', 5], ['reed', 4], ['fossil', 3]]},
  scatter:{n:16, props:[['ribcage', 3], ['fossil', 3], ['amber', 3], ['rock', 4]]}}});

/* an ancient araucaria to shade the camp on the dinosaur maps (in place of the World Tree with its ribbons) */
PROP_TYPES.camparaucaria = (seed, v = 0) => { const base = PROP_TYPES.araucaria; return makeProp({w:230, h:430, ax:115, ay:420, seed, collide:20, paint(g, rng){
  g.scale(1.55, 1.55); const im = base(seed + 17, 0).img, S = GFX.ps; g.drawImage(im, -75, -274, im.width / S, im.height / S); }}); };
