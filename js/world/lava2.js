/* VAYRATHEN — js/world/lava2.js — volcanic lands that look like real lava fields (v59)
   What was wrong: the "lava" floor was a dark oval with bright orange zig-zag lines drawn on top (they read as random
   strokes, not as anything in nature), the pools were perfect ovals, the ground was a reddish-brown mud, and the props
   came from other biomes: mossy grey boulders, ice-blue stalagmites, blue and gold crystals, white pebbles, dry grass.
   How real lava fields look (Hawaiʻi, Iceland, Etna) and how games usually paint them:
   · the ground is black or charcoal basalt; the glow only shows where it is hot, so the dark ground makes it pop
   · cooling lava grows a black crust that breaks into plates; the light comes through the cracks between the plates
     (thin, bright, branching along the plate edges, fading out where the crust is old)
   · a lava pool has an irregular shore, a crust of dark rock round its edge, colours by heat from dark red at the
     rim through orange to yellow in the hottest middle, and dark rafts of crust floating on the surface
   · around it: basalt boulders, hexagonal basalt columns, black obsidian glass, yellow sulphur crust, charred trees */
'use strict';

const LV2 = {
  basalt:['#1c1918', '#242020', '#2d2826', '#38312e'],
  hash(n){ const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
};

/* the ground of the two volcanic biomes: charcoal basalt and ash, no red mud; native props only */
Object.assign(BIOME.lavafield, {base:['#1f1c1b', '#262220', '#2b2522'], mottle:['rgba(0,0,0,.5)', 'rgba(140,128,118,.12)'], road:['#3a3230', '#463c38', '#524640'],
  props:[['basalt', 8, 3], ['basaltcol', 3, 2], ['obsidian', 2, 2], ['deadtree', 2, 1], ['vent', 2, 1]], tint:'rgba(255,70,20,.05)'});
Object.assign(BIOME.crater, {base:['#221b19', '#2a201c', '#33241e'], mottle:['rgba(0,0,0,.5)', 'rgba(255,90,30,.08)'], road:['#40302a', '#4c3a32', '#58443a'],
  props:[['basalt', 7, 3], ['basaltcol', 4, 2], ['obsidian', 3, 2], ['vent', 3, 1], ['statue', 1, 1]], tint:'rgba(255,60,10,.09)'});

/* a patch of cooling lava crust: black plates with light coming through the cracks between them */
function lavaCrust(g, cx, cy, rw, rh){
  const c = 20 + R() * 8, nx = Math.ceil(rw * 2 / c) + 2, ny = Math.ceil(rh * 1.2 / (c * .7)) + 2, x0 = cx - rw - c, y0 = cy - rh * .6 - c * .7;
  const P = []; for (let j = 0; j < ny; j++){ P.push([]); for (let i = 0; i < nx; i++) P[j].push([x0 + (i + (j % 2) * .5 + (R() - .5) * .95) * c, y0 + (j + (R() - .5) * .8) * c * .7]); }
  const fall = (x, y) => { const d = ((x - cx) / rw) ** 2 + ((y - cy) / (rh * .6)) ** 2; return Math.max(0, 1 - d); };
  // the plates: dark basalt with a lighter top edge, tinted warm where the crust is thin (middle of the patch)
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++){
    const q = [P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]], mx = (q[0][0] + q[2][0]) / 2, my = (q[0][1] + q[2][1]) / 2, f = fall(mx, my); if (f <= .02) continue;
    g.fillStyle = LV2.basalt[Math.floor(R() * 2)]; g.globalAlpha = Math.min(.9, f * 2); g.beginPath(); q.forEach(([x, y], k) => k ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill();
    if (f > .45){ g.fillStyle = `rgba(255,80,20,${(f - .45) * .16})`; g.fill(); }
  }
  g.globalAlpha = 1;
  // the cracks: only some plate edges glow, brighter and wider toward the hot middle
  const edges = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++){ if (i < nx - 1) edges.push([P[j][i], P[j][i + 1]]); if (j < ny - 1) edges.push([P[j][i], P[j + 1][i]]); }
  for (const pass of [0, 1, 2]) for (const [a, b] of edges){
    const f = fall((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), keep = LV2.hash(a[0] * 3.1 + b[1] * 7.7); if (f < .18 || keep > .08 + f * .5) continue;   // a few cracks, more in the hot middle
    const mx = (a[0] + b[0]) / 2 + (LV2.hash(a[1] + b[0]) - .5) * 4, my = (a[1] + b[1]) / 2 + (LV2.hash(a[0] - b[1]) - .5) * 3;
    g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(mx, my, b[0], b[1]);
    if (pass === 0){ g.strokeStyle = `rgba(255,70,10,${.16 * f})`; g.lineWidth = 6 * f + 1; }
    else if (pass === 1){ g.strokeStyle = `rgba(230,70,15,${.85 * f})`; g.lineWidth = 1.6 * f + .5; }
    else { if (f < .4) continue; g.strokeStyle = `rgba(255,214,110,${(f - .4) * 1.4})`; g.lineWidth = .7; }
    g.stroke();
  }
}

/* a lava pool with a natural, lumpy shore */
function lavaPool(g, x, y, rx, ry, cols){
  const a = [R() * 6.28, R() * 6.28, R() * 6.28], rad = t => 1 + .1 * Math.sin(3 * t + a[0]) + .06 * Math.sin(5 * t + a[1]) + .035 * Math.sin(9 * t + a[2]);
  const blob = (k, jit = 0) => { g.beginPath(); for (let i = 0; i <= 72; i++){ const t = i / 72 * 6.283, r = rad(t) * k * (1 + (jit ? (LV2.hash(i * 1.7 + x) - .5) * jit : 0)); i ? g.lineTo(x + Math.cos(t) * rx * r, y + Math.sin(t) * ry * r) : g.moveTo(x + Math.cos(t) * rx * r, y + Math.sin(t) * ry * r); } g.closePath(); };
  // heat on the ground around it
  const hg = g.createRadialGradient(x, y, Math.min(rx, ry) * .8, x, y, Math.max(rx, ry) * 1.45); hg.addColorStop(0, 'rgba(255,90,20,.28)'); hg.addColorStop(1, 'rgba(255,60,10,0)');
  g.fillStyle = hg; g.beginPath(); g.ellipse(x, y, rx * 1.5, ry * 1.5, 0, 0, 7); g.fill();
  // a rim of cooled black rock, lumpy
  g.fillStyle = '#17110f'; blob(1.12, .08); g.fill(); g.fillStyle = '#2a201c'; blob(1.06, .05); g.fill();
  // the lava: dark red at the shore, orange, a yellow-white heart off-centre
  const lg = g.createRadialGradient(x - rx * .15, y - ry * .12, 4, x, y, Math.max(rx, ry) * 1.02);
  lg.addColorStop(0, '#fff2a8'); lg.addColorStop(.28, cols[3] || '#ffd04a'); lg.addColorStop(.62, cols[2] || '#ff5a1a'); lg.addColorStop(.9, cols[1] || '#a82a0a'); lg.addColorStop(1, '#5a1206');
  g.fillStyle = lg; blob(1); g.fill();
  // the shore crust glows where it meets the lava
  g.strokeStyle = 'rgba(255,120,30,.75)'; g.lineWidth = 1.6; blob(1); g.stroke(); g.strokeStyle = 'rgba(80,16,6,.6)'; g.lineWidth = 3.4; blob(1.035); g.stroke();
  // rafts of dark crust drifting on it, each with a bright seam round it
  const n = Math.round(4 + rx / 18);
  for (let i = 0; i < n; i++){ const t = R() * 6.28, d = .5 + R() * .42, px = x + Math.cos(t) * rx * d * rad(t), py = y + Math.sin(t) * ry * d * rad(t), s = 4 + R() * (6 + rx * .05);
    const pts = []; for (let k = 0; k < 6; k++){ const b = k / 6 * 6.28 + R() * .5, r = s * (.65 + R() * .5); pts.push([px + Math.cos(b) * r, py + Math.sin(b) * r * .7]); }
    g.beginPath(); pts.forEach(([u, v], k) => k ? g.lineTo(u, v) : g.moveTo(u, v)); g.closePath();
    g.fillStyle = d > .75 ? '#2a1a14' : '#3e2218'; g.fill(); g.strokeStyle = 'rgba(255,200,90,.85)'; g.lineWidth = .8; g.stroke();
    g.fillStyle = 'rgba(150,110,90,.25)'; g.beginPath(); g.ellipse(px - s * .2, py - s * .2, s * .35, s * .18, 0, 0, 7); g.fill(); }
  // a few bright swirls in the hottest part
  g.strokeStyle = 'rgba(255,250,210,.45)'; g.lineWidth = 1;
  for (let i = 0; i < 5; i++){ const px = x + (R() - .5) * rx * .8, py = y + (R() - .5) * ry * .7; g.beginPath(); g.arc(px, py, 4 + R() * 8, R() * 3, R() * 3 + 2); g.stroke(); }
}
/* on volcanic ground, the shared props of other lands come out in their volcanic form (camp rocks, scatter) */
const lavaLand = () => typeof MAP_ID !== 'undefined' && MAP_ID && MAPS[MAP_ID] && ['lavafield', 'crater'].includes(MAPS[MAP_ID].biome);
{ const SWAP = {rock:'basalt', stalag:'basaltcol', crystal:'obsidian'}, _ap = addProp;
  addProp = function(type, x, y, v){ if (SWAP[type] && lavaLand()) return _ap.call(this, SWAP[type], x, y, (v | 0) % 2); return _ap.apply(this, arguments); }; }
BIOME.crater.floor = {...BIOME.crater.floor, n:22};
{ const _wb = waterBody;
  waterBody = function(g, x, y, rx, ry, cols, lotus, foam){ if (cols && /^#ff/i.test(cols[2] || '') && /^#ff/i.test(cols[3] || '')) return lavaPool(g, x, y, rx, ry, cols); return _wb.apply(this, arguments); }; }

/* the props of a volcanic land */
Object.assign(PROP_TYPES, {
  /* a basalt boulder: black, angular, a faint hot seam (v0–2 differ in shape) */
  basalt: (seed, v = 0) => makeProp({w:44, h:32, ax:22, ay:26, seed, shadow:[15, 4], collide:9, paint(g, rng){
    const S = [[-15, 0, -17, -8, -10, -17, 2, -20, 13, -15, 17, -5, 13, 0], [-12, 0, -14, -10, -4, -15, 6, -13, 14, -6, 12, 0], [-17, 0, -13, -12, -2, -22, 8, -18, 16, -8, 15, 0]][v % 3];
    g.fillStyle = '#121010'; pv(g, S); g.fill(); g.fillStyle = '#2a2524'; pv(g, S.map((n, i) => i % 2 ? n * .88 : n * .9)); g.fill();
    g.fillStyle = '#433b38'; pv(g, [S[2] * .7, S[3] * .8, S[4] * .7, S[5] * .9, S[6] * .6, S[7] * .9, S[6] * .2, S[7] * .5]); g.fill();
    for (let i = 0; i < 6; i++){ g.fillStyle = 'rgba(0,0,0,.35)'; ov(g, -8 + rng() * 16, -4 - rng() * 10, .8, .6); g.fill(); }   // gas bubbles in the rock
    if (v !== 1){ g.strokeStyle = 'rgba(255,90,20,.8)'; g.lineWidth = .8; g.beginPath(); g.moveTo(-6, -2); g.lineTo(-2, -8); g.lineTo(3, -9); g.stroke(); g.strokeStyle = 'rgba(255,210,110,.8)'; g.lineWidth = .35; g.stroke(); }
  }}),
  /* hexagonal basalt columns, like the Giant's Causeway, standing in a cluster */
  basaltcol: (seed, v = 0) => makeProp({w:56, h:86, ax:28, ay:78, seed, shadow:[20, 5], collide:14, paint(g, rng){
    const cols = v ? [[-12, 52], [0, 64], [12, 44], [-22, 30], [22, 26]] : [[-10, 46], [2, 58], [14, 38], [-20, 24]];
    for (const [x, h] of cols.sort((a, b) => a[1] - b[1]).reverse().sort((a, b) => Math.abs(a[0]) - Math.abs(b[0])).reverse()){
      const w = 6.4, top = -h;
      g.fillStyle = '#1a1716'; pv(g, [x - w, 0, x - w, top, x, top + 3, x, 3]); g.fill();
      g.fillStyle = '#2c2725'; pv(g, [x, 3, x, top + 3, x + w, top, x + w, 0]); g.fill();
      g.fillStyle = '#4a423e'; pv(g, [x - w, top, x - w * .5, top - 3, x + w * .5, top - 3, x + w, top, x + w * .5, top + 3, x - w * .5, top + 3]); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = .5; for (let y = top + 10; y < -3; y += 9 + rng() * 6){ g.beginPath(); g.moveTo(x - w, y); g.lineTo(x, y + 3); g.lineTo(x + w, y); g.stroke(); }
    }
  }}),
  /* black volcanic glass: sharp glossy shards with a deep purple sheen */
  obsidian: (seed, v = 0) => makeProp({w:44, h:52, ax:22, ay:46, seed, shadow:[13, 4], collide:9, paint(g){
    for (const [x, h, a] of (v ? [[-7, 30, -.3], [5, 40, .15], [13, 18, .6]] : [[-9, 22, -.5], [0, 36, 0], [9, 26, .4], [-14, 12, -.8]])){
      g.save(); g.translate(x, 0); g.rotate(a);
      g.fillStyle = '#0d0b10'; pv(g, [-5, 0, -4, -h * .7, 0, -h, 4.5, -h * .6, 5, 0]); g.fill();
      g.fillStyle = '#2a2234'; pv(g, [-4, -2, -3.4, -h * .68, 0, -h + 2, 0, -2]); g.fill();
      g.fillStyle = 'rgba(190,160,255,.55)'; pv(g, [-2.6, -4, -2.2, -h * .62, -.8, -h * .8, -1.4, -6]); g.fill();
      g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(-2.2, -h * .55, .7, 3); g.restore(); }
  }}),
  /* a fumarole: a cone of yellow sulphur crust with steam drifting up (steam is drawn live) */
  vent: (seed) => makeProp({w:40, h:24, ax:20, ay:16, seed, shadow:[13, 3], collide:7, paint(g, rng){
    g.fillStyle = '#3a3230'; pv(g, [-15, 0, -8, -7, -3, -9, 3, -9, 8, -7, 15, 0]); g.fill();
    g.fillStyle = '#c8b030'; pv(g, [-10, -2, -6, -7, -3, -8.4, 3, -8.4, 6, -7, 10, -2]); g.fill();
    g.fillStyle = '#efe070'; for (let i = 0; i < 8; i++){ ov(g, -8 + rng() * 16, -3 - rng() * 4.5, .9 + rng(), .6); g.fill(); }
    g.fillStyle = '#1a1210'; ov(g, 0, -8.2, 3, 1.2); g.fill(); g.fillStyle = 'rgba(255,120,30,.6)'; ov(g, 0, -8.2, 1.8, .6); g.fill();
  }})
});

/* steam from the vents, drifting slowly (never blinking) */
function lavaVentSteam(g){
  if (typeof PROPS === 'undefined') return;
  for (const p of PROPS){ if (p.type !== 'vent') continue; const x = p.x - cam.x, y = p.y - 8 - cam.y; if (x < -60 || y < -120 || x > VW + 60 || y > VH + 40) continue;
    for (let i = 0; i < 5; i++){ const ph = (T * .18 + i / 5 + p.x * .001) % 1; g.fillStyle = `rgba(235,230,210,${.3 * (1 - ph) * Math.min(1, ph * 5)})`;
      g.beginPath(); g.arc(x + Math.sin(T * .6 + i * 1.3 + p.y) * 3 + ph * 8, y - ph * 50, 2.4 + ph * 8, 0, 7); g.fill(); } }
}
