/* VAYRATHEN — js/sys/grandfx200.js — (v201) new looks for มหาอุทกภัย and ธรณีสูบ (the owner found the old ones plain)
   มหาอุทกภัย : a water spout bursts up in the middle, then tidal waves with real height roll out to the edge of the
               circle one after another — a dark-blue body, a light crest and white foam with spray flying off it, the
               back of each wave behind the monsters and the front over them — over a rippling, light-dappled flood,
               with slanting rain and splashes; it ends in a glittering mist
   ธรณีสูบ    : the ground splits in glowing cracks that race outwards, a deep pit opens with broken slabs tilted round its
               lip, dust and stones spiral down into the dark, boulders drop in from the sky, and after three seconds
               the earth erupts — a ring of rock spikes, a shockwave and flying debris
   The spells' effects (rune200.js / mage2.js) are unchanged; only how they are drawn. */
'use strict';
const GFX2 = {list:[]};
const g2h = (i, k = 0) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
const g2q = () => (typeof fxQ === 'function' ? fxQ() : 1);
const g2ease = k => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
/* the old drawings step aside: their field gets a kind mage2.js does not draw (the pit keeps pulling, below) */
for (const id of ['deluge', 'earthswallow']) if (SKILLS[id]) SKILLS[id].fx = 'none';
{ const _ex = execSkill; execSkill = function(id, lv, t){ const n0 = typeof MG !== 'undefined' ? MG.fields.length : 0, r = _ex.apply(this, arguments);
    if ((id === 'deluge' || id === 'earthswallow') && typeof MG !== 'undefined'){ const f = MG.fields[MG.fields.length - 1];
      if (f && MG.fields.length > n0){ f.kind = id === 'deluge' ? 'flood2' : 'pit2'; f.dur = id === 'deluge' ? 6 : 5.2; GFX2.list.push(f); } }
    return r; }; }
// the pit still drags monsters towards its middle while it is open
EV.on('tick', dt => { if (typeof MG === 'undefined') return;
  for (const f of MG.fields){ if (f.kind !== 'pit2' || T - f.t0 > 3.2) continue;
    for (const m of mobs){ if (m.dead) continue; const d = Math.hypot(m.x - f.x, m.y - f.y); if (d > f.r * 1.4 || d < 6) continue;
      const sp = (m.def.boss ? 25 : 140) * dt; m.x += (f.x - m.x) / d * Math.min(sp, d - 4); m.y += (f.y - m.y) / d * Math.min(sp, d - 4); } }
  GFX2.list = GFX2.list.filter(f => T - f.t0 < f.dur); });

/* ======================= มหาอุทกภัย ======================= */
const FLOOD = {waves:[.25, 1.25, 2.25, 3.25], waveLife:1.35};
// one wave: a band between the ground ring and its crest; half = 'back' (far side) or 'front'
function g2Wave(g, x, y, f, k, half){
  const R = f.r * (.15 + g2ease(k) * 1.02), h = (20 + f.r * .1) * Math.sin(Math.min(1, k * 1.15) * Math.PI) * (1 - k * .35), a = Math.min(1, k * 6) * (1 - Math.max(0, k - .75) / .25);
  if (a <= 0 || h <= .5) return;
  const a0 = half === 'back' ? Math.PI : 0, a1 = a0 + Math.PI, N = 40, ry = .5;
  const ptB = i => { const q = a0 + (a1 - a0) * i / N; return [x + Math.cos(q) * R, y + Math.sin(q) * R * ry]; };
  const wob = i => Math.sin(i * .9 + T * 5 + f.seed) * h * .12;
  const ptT = i => { const [px, py] = ptB(i); return [px, py - h - wob(i)]; };
  g.save(); g.globalAlpha = a;
  // body
  const gr = g.createLinearGradient(0, y - R * ry - h, 0, y + R * ry);
  gr.addColorStop(0, 'rgba(150,225,255,.92)'); gr.addColorStop(.35, 'rgba(40,140,215,.88)'); gr.addColorStop(1, 'rgba(10,60,140,.8)');
  g.beginPath(); for (let i = 0; i <= N; i++){ const [px, py] = ptT(i); i ? g.lineTo(px, py) : g.moveTo(px, py); }
  for (let i = N; i >= 0; i--){ const [px, py] = ptB(i); g.lineTo(px, py); } g.closePath(); g.fillStyle = gr; g.fill();
  // light bands running along the body
  g.globalAlpha = a * .45; g.strokeStyle = 'rgba(210,245,255,1)'; g.lineWidth = 1;
  for (const s of [.35, .6]){ g.beginPath(); for (let i = 0; i <= N; i++){ const [bx, by] = ptB(i), [tx, ty] = ptT(i); const px = bx + (tx - bx) * s, py = by + (ty - by) * s + Math.sin(i * 1.7 + T * 4) * 1.2; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
  // foam on the crest
  g.globalAlpha = a; g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 3.2;
  g.beginPath(); for (let i = 0; i <= N; i++){ const [px, py] = ptT(i); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
  g.fillStyle = 'rgba(255,255,255,.9)';
  for (let i = 0; i <= N; i += 2){ const [px, py] = ptT(i); const s = 1.4 + g2h(i, f.seed) * 2.2; g.beginPath(); g.arc(px + (g2h(i, 3) - .5) * 4, py - 1 - g2h(i, 4) * 3, s, 0, 7); g.fill(); }
  // spray thrown off the crest, outwards
  const nS = Math.round(26 * g2q());
  for (let j = 0; j < nS; j++){ const i = Math.floor(g2h(j, 7) * N), [px, py] = ptT(i), q = a0 + (a1 - a0) * i / N, ph = (T * 1.8 + g2h(j, 8)) % 1;
    const dx = Math.cos(q) * (6 + ph * 22), dy = Math.sin(q) * (3 + ph * 10) * ry - ph * 16 + ph * ph * 22;
    g.globalAlpha = a * (1 - ph) * .9; g.fillStyle = j % 3 ? 'rgba(220,245,255,1)' : 'rgba(255,255,255,1)'; g.beginPath(); g.arc(px + dx, py + dy, 1 + (1 - ph) * 1.4, 0, 7); g.fill(); }
  g.restore();
}
function g2FloodUnder(g, f, x, y, age, fade){
  const grow = g2ease(age * 1.2), R = f.r * (.25 + grow * .9);
  g.save(); g.globalAlpha = fade;
  // the flood: deep in the middle, shallow at the edge
  g.save(); g.translate(x, y); g.scale(1, .5);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
  gr.addColorStop(0, 'rgba(15,80,180,.78)'); gr.addColorStop(.55, 'rgba(35,140,215,.62)'); gr.addColorStop(.88, 'rgba(100,200,240,.42)'); gr.addColorStop(1, 'rgba(160,230,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill(); g.restore();
  // dappled light on the water (clipped to the flood)
  g.save(); g.beginPath(); g.ellipse(x, y, R * .95, R * .47, 0, 0, 7); g.clip(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(170,235,255,.22)'; g.lineWidth = 1.4;
  for (let i = 0; i < 9; i++){ g.beginPath(); for (let j = 0; j <= 24; j++){ const u = j / 24, px = x - R + u * R * 2, py = y - R * .5 + (i + .5) / 9 * R + Math.sin(u * 9 + T * 2.2 + i * 1.7) * 4 + Math.sin(u * 23 - T * 3 + i) * 1.5; j ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
  g.restore();
  // ripples
  g.strokeStyle = 'rgba(200,240,255,.5)';
  for (let i = 0; i < 4; i++){ const ph = (age * .7 + i / 4) % 1; g.globalAlpha = fade * (1 - ph) * .7; g.lineWidth = 1.6 * (1 - ph) + .4; g.beginPath(); g.ellipse(x, y, R * ph, R * ph * .5, 0, 0, 7); g.stroke(); }
  // rain rings where the drops land
  for (let i = 0; i < Math.round(16 * g2q()); i++){ const ph = (T * 1.6 + g2h(i, 2)) % 1, cyc = Math.floor(T * 1.6 + g2h(i, 2)); const ang = g2h(i + cyc * 13, 3) * 6.283, rr = Math.sqrt(g2h(i + cyc * 13, 4)) * R * .9;
    g.globalAlpha = fade * (1 - ph) * .7; g.strokeStyle = 'rgba(220,245,255,.8)'; g.lineWidth = .8; g.beginPath(); g.ellipse(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr * .5, 2 + ph * 7, (2 + ph * 7) * .45, 0, 0, 7); g.stroke(); }
  g.restore();
  for (const t0 of FLOOD.waves){ const k = (age - t0) / FLOOD.waveLife; if (k > 0 && k < 1) g2Wave(g, x, y, f, k, 'back'); }
}
function g2FloodOver(g, f, x, y, age, fade){
  for (const t0 of FLOOD.waves){ const k = (age - t0) / FLOOD.waveLife; if (k > 0 && k < 1) g2Wave(g, x, y, f, k, 'front'); }
  g.save();
  // the spout in the middle at the start
  if (age < 1.3){ const k = age / 1.3, H = 70 * Math.sin(Math.min(1, k * 2.2) * Math.PI * .5) * (1 - Math.max(0, k - .55) / .45), W = 16 + k * 10;
    if (H > 1){ const gr = g.createLinearGradient(x - W, 0, x + W, 0); gr.addColorStop(0, 'rgba(40,130,210,0)'); gr.addColorStop(.3, 'rgba(70,170,235,.8)'); gr.addColorStop(.5, 'rgba(210,245,255,.95)'); gr.addColorStop(.7, 'rgba(70,170,235,.8)'); gr.addColorStop(1, 'rgba(40,130,210,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x - W, y); g.quadraticCurveTo(x - W * .45, y - H * .6, x - W * .3, y - H); g.lineTo(x + W * .3, y - H); g.quadraticCurveTo(x + W * .45, y - H * .6, x + W, y); g.closePath(); g.fill();
      for (let j = 0; j < Math.round(22 * g2q()); j++){ const ph = (k * 2.4 + g2h(j, 9)) % 1, an = g2h(j, 10) * 6.283, sp = 10 + g2h(j, 11) * 30;
        g.globalAlpha = (1 - ph) * .9; g.fillStyle = 'rgba(225,248,255,1)'; g.beginPath(); g.arc(x + Math.cos(an) * sp * ph, y - H + ph * ph * H * .9 - Math.sin(an) * 6, 1.6 * (1 - ph) + .6, 0, 7); g.fill(); } } }
  // slanting rain over the circle
  g.globalAlpha = fade * .65; g.strokeStyle = 'rgba(190,225,255,.75)'; g.lineWidth = 1;
  g.beginPath(); for (let i = 0; i < Math.round(70 * g2q()); i++){ const ph = (T * 2.4 + g2h(i, 5)) % 1, rx = (g2h(i, 6) - .5) * f.r * 2.1, ry = (g2h(i, 7) - .5) * f.r * 1.05;
    const px = x + rx + ph * 18, py = y + ry - 120 + ph * 120; g.moveTo(px, py); g.lineTo(px - 4, py - 13); } g.stroke();
  // glittering mist as it ends
  const end = Math.max(0, age - (f.dur - 1.6)) / 1.6;
  if (end > 0){ g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < Math.round(30 * g2q()); i++){ const an = g2h(i, 12) * 6.283, rr = Math.sqrt(g2h(i, 13)) * f.r, tw = Math.max(0, Math.sin(T * 6 + i)); g.globalAlpha = (1 - end) * tw * .8;
      g.fillStyle = 'rgba(200,240,255,1)'; g.beginPath(); g.arc(x + Math.cos(an) * rr, y + Math.sin(an) * rr * .5 - end * 20 - g2h(i, 14) * 20, 1.2, 0, 7); g.fill(); } }
  g.restore();
}

/* ======================= ธรณีสูบ ======================= */
const PIT = {burst:3.2};   // the hole bursts and closes after this long
/* (v201) real earth, as the owner asked: the ground tears open along a ragged edge with grass hanging over the lip,
   layered soil walls drop into darkness, wide jagged fissures split the ground, slabs of turf tilt and slide in, and
   only dirt and dust fly (no round stones, no pointed spikes) */
const g2n = (a, s) => Math.sin(a * 3 + s) * .5 + Math.sin(a * 7 + s * 1.7) * .28 + Math.sin(a * 13 + s * 2.3) * .14 + Math.sin(a * 23 + s * 3.1) * .08;
// the ragged outline of a hole: radius wobbles all the way round
const g2Rag = (cx, cy, r, s, rough = .16, n = 64) => { const P = []; for (let i = 0; i < n; i++){ const a = i / n * 6.283, k = 1 + g2n(a, s) * rough; P.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k * .5]); } return P; };
const g2Path = (g, P) => { g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
function g2Dust(g, cx, cy, r, a, col = '150,120,85'){ const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.6, `rgba(${col},${a * .45})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); }
// an irregular flat clod of earth (top in the soil colour, a darker underside)
function g2Clod(g, cx, cy, r, s){ const P = []; for (let i = 0; i < 7; i++){ const a = i / 7 * 6.283 + s; P.push([cx + Math.cos(a) * r * (.7 + g2h(s * 9 + i, 81) * .5), cy + Math.sin(a) * r * .55 * (.7 + g2h(s * 9 + i, 82) * .5)]); }
  g.fillStyle = '#4a321e'; g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1] + r * .35) : g.moveTo(p[0], p[1] + r * .35)); g.closePath(); g.fill();
  g.fillStyle = g2h(s, 83) > .5 ? '#7a5636' : '#8e6a44'; g2Path(g, P); g.fill(); }
// grass tufts along an edge
function g2Grass(g, x, y, s, n = 4){ g.strokeStyle = '#4f8a2e'; g.lineWidth = 1; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i < n; i++){ const dx = (i - n / 2) * 1.6 + g2h(s + i, 84) * 1.2, h = 3 + g2h(s + i, 85) * 4, lean = (g2h(s + i, 86) - .5) * 3; g.moveTo(x + dx, y); g.quadraticCurveTo(x + dx + lean * .5, y - h * .6, x + dx + lean, y - h); } g.stroke(); }
// wide jagged fissures: a dark gap between two torn edges, the near edge lit, the far edge in shadow
function g2Fissures(f){ if (f._fs) return f._fs; const out = [];
  for (let i = 0; i < 7; i++){ const a0 = i / 7 * 6.283 + g2h(i, f.seed) * .6, L = f.r * (.75 + g2h(i, 91) * .45), N = 14, pts = [];
    let a = a0; for (let j = 0; j <= N; j++){ const u = j / N; a += (g2h(i * 31 + j, 92) - .5) * .22; const r = f.r * .5 + u * L * .75; pts.push([Math.cos(a) * r, Math.sin(a) * r * .5, (1 - u) * (5 + g2h(i, 93) * 4) * (.6 + g2h(i * 31 + j, 94) * .7)]); }
    out.push(pts); }
  return (f._fs = out); }
function g2FissureDraw(g, x, y, pts, reach, glow){
  const n = Math.max(2, Math.ceil(pts.length * reach)), L = [], R = [];
  for (let j = 0; j < n; j++){ const [px, py, w] = pts[j], q = pts[Math.min(pts.length - 1, j + 1)], p0 = pts[Math.max(0, j - 1)], dx = q[0] - p0[0], dy = q[1] - p0[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d * .5;
    L.push([x + px + nx * w, y + py + ny * w]); R.push([x + px - nx * w, y + py - ny * w]); }
  g.fillStyle = '#3b2716'; g.beginPath(); L.forEach((p, i) => i ? g.lineTo(p[0] + .8, p[1] + 1.2) : g.moveTo(p[0] + .8, p[1] + 1.2)); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0] - .8, R[i][1] + 1.2); g.closePath(); g.fill();   // soil walls
  g.fillStyle = '#0d0806'; g.beginPath(); L.forEach((p, i) => i ? g.lineTo(p[0], p[1] + 1.6) : g.moveTo(p[0], p[1] + 1.6)); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1] + 1.6); g.closePath(); g.fill();   // the dark gap
  if (glow > 0){ g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(255,110,40,${glow})`; g.lineWidth = 1; g.beginPath(); pts.slice(0, n).forEach((p, i) => i ? g.lineTo(x + p[0], y + p[1] + 2) : g.moveTo(x + p[0], y + p[1] + 2)); g.stroke(); g.restore(); }
  g.strokeStyle = 'rgba(150,115,75,.9)'; g.lineWidth = 1; g.beginPath(); R.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();   // torn lip
  for (let j = 1; j < n; j += 3) g2Grass(g, L[j][0], L[j][1], j * 7, 3);
}
// slabs of turf round the hole that tilt and slide in
function g2Turf(f){ if (f._tf) return f._tf; const out = [];
  for (let i = 0; i < 9; i++) out.push({a:i / 9 * 6.283 + g2h(i, 101) * .4, w:.22 + g2h(i, 102) * .12, d:.2 + g2h(i, 103) * .12, t0:.4 + g2h(i, 104) * 1.6, s:i * 17});
  return (f._tf = out); }
function g2TurfDraw(g, f, x, y, pr, age, half){
  for (const s of g2Turf(f)){ const k = Math.min(1, Math.max(0, (age - s.t0) / 1.1)); if (k >= 1) continue; const sn = Math.sin(s.a); if ((sn < 0) !== (half === 'back')) continue;
    const slide = g2ease(k), r0 = pr * (1.02 - slide * .55), cx = x + Math.cos(s.a) * r0, cy = y + sn * r0 * .5 + slide * 10, W = pr * s.w, D = pr * s.d * .5, tilt = slide * .6 * (Math.cos(s.a) >= 0 ? 1 : -1);
    g.save(); g.globalAlpha *= 1 - slide * .8; g.translate(cx, cy); g.rotate(tilt + Math.cos(s.a) * .1);
    const P = []; for (let i = 0; i < 12; i++){ const a = i / 12 * 6.283; P.push([Math.cos(a) * W * (1 + g2n(a, s.s) * .25), Math.sin(a) * D * (1 + g2n(a + 1, s.s) * .25)]); }
    g.fillStyle = '#4e3520'; g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1] + 5) : g.moveTo(p[0], p[1] + 5)); g.closePath(); g.fill();   // soil side
    g.fillStyle = '#6b8a3a'; g2Path(g, P); g.fill();   // the turf on top
    g.fillStyle = 'rgba(40,60,20,.35)'; g.beginPath(); g.ellipse(0, D * .3, W * .7, D * .4, 0, 0, 7); g.fill();
    for (let i = 0; i < 5; i++) g2Grass(g, (g2h(s.s + i, 105) - .5) * W * 1.4, (g2h(s.s + i, 106) - .5) * D, s.s + i, 3);
    g.restore(); } }
function g2PitUnder(g, f, x, y, age, fade){
  const open = g2ease(Math.min(1, (age - .2) / .8)), close = age > PIT.burst ? g2ease(Math.min(1, (age - PIT.burst) / .9)) : 0, pr = f.r * .6 * open * (1 - close * .85);
  g.save(); g.globalAlpha = fade;
  // churned earth showing through the grass round the hole
  g.save(); g.translate(x, y); g.scale(1, .5); const sg = g.createRadialGradient(0, 0, 0, 0, 0, f.r * 1.15); sg.addColorStop(0, 'rgba(92,64,38,.55)'); sg.addColorStop(.6, 'rgba(110,80,50,.3)'); sg.addColorStop(1, 'rgba(110,80,50,0)'); g.fillStyle = sg; g.beginPath(); g.arc(0, 0, f.r * 1.15, 0, 7); g.fill(); g.restore();
  // fissures splitting the ground outwards
  const reach = Math.min(1, Math.max(0, (age - .05) / .7)), glow = .5 * (1 - close);
  for (const pts of g2Fissures(f)) g2FissureDraw(g, x, y, pts, reach, glow);
  if (pr > 2){
    const rim = g2Rag(x, y, pr, f.seed, .16), wall = g2Rag(x, y + pr * .12, pr * .9, f.seed + 1, .13), deep = g2Rag(x, y + pr * .2, pr * .62, f.seed + 2, .12);
    // the soil wall: layered earth, lit at the top, going dark as it drops
    g2Path(g, rim); const wg = g.createLinearGradient(0, y - pr * .5, 0, y + pr * .55); wg.addColorStop(0, '#5a3d24'); wg.addColorStop(.4, '#3e2a18'); wg.addColorStop(1, '#22160c'); g.fillStyle = wg; g.fill();
    g.save(); g2Path(g, rim); g.clip(); g.strokeStyle = 'rgba(120,88,56,.45)'; g.lineWidth = 1;
    for (let l = 0; l < 5; l++){ g.beginPath(); for (let i = 0; i <= 40; i++){ const a = Math.PI + i / 40 * Math.PI, rr = pr * (.96 - l * .07); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * .5 + l * pr * .06 + g2n(a * 2, l + f.seed) * 1.5; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
    g.restore();
    // into the dark
    g2Path(g, wall); g.fillStyle = 'rgba(18,11,7,.92)'; g.fill();
    g2Path(g, deep); const dg = g.createRadialGradient(x, y + pr * .2, 0, x, y + pr * .2, pr * .62); dg.addColorStop(0, '#000'); dg.addColorStop(1, '#0c0705'); g.fillStyle = dg; g.fill();
    g.save(); g.globalCompositeOperation = 'lighter'; g2Dust(g, x, y + pr * .22, pr * .35, .22 + .08 * Math.sin(T * 3), '255,90,30'); g.restore();
    // dust and grit pouring down the walls
    for (let j = 0; j < Math.round(28 * g2q()); j++){ const a = Math.PI + .2 + g2h(j, 110) * (Math.PI - .4), ph = (T * .7 + g2h(j, 111)) % 1, rr = pr * (1 - ph * .35);
      g.globalAlpha = fade * (1 - ph) * .7; g.fillStyle = j % 2 ? '#a07a52' : '#6e5034'; g.fillRect(x + Math.cos(a) * rr, y + Math.sin(a) * rr * .5 + ph * pr * .4, 1.2, 1.6); }
    g.globalAlpha = fade;
    // the torn lip with grass hanging over it
    g.strokeStyle = '#8a6a44'; g.lineWidth = 1.4; g2Path(g, rim); g.stroke();
    for (let i = 0; i < rim.length; i += 3){ const [px, py] = rim[i]; g2Grass(g, px, py + 1, i * 3, 3); }
    g2TurfDraw(g, f, x, y, pr, age, 'back');
  }
  g.restore();
}
function g2PitOver(g, f, x, y, age, fade){
  const open = g2ease(Math.min(1, (age - .2) / .8)), burst = age > PIT.burst, pr = f.r * .6 * open;
  g.save(); g.globalAlpha = fade;
  if (!burst && pr > 2){
    g2TurfDraw(g, f, x, y, pr, age, 'front');
    // loose earth sliding in from all round, a haze of dust over the hole
    for (let j = 0; j < Math.round(14 * g2q()); j++){ const u = ((j / 14) + T * .22) % 1, a = j * 2.4 + u * 2, rr = f.r * 1.05 * (1 - u) + pr * .2;
      g.globalAlpha = fade * Math.min(1, (1 - u) * 2.5) * .6; g2Dust(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr * .5, 6 + (1 - u) * 6, .45); }
    g.globalAlpha = fade * .35; g2Dust(g, x, y - 6, pr * .9, .35, '160,130,95');
  }
  // the eruption: earth and dust blast up out of the hole, clods fly and fall, the ground cracks further and settles
  if (burst){ const k = (age - PIT.burst) / 1.7; if (k < 1){
    const plume = Math.sin(Math.min(1, k * 1.6) * Math.PI);
    for (let i = 0; i < 14; i++){ const a = g2h(i, 120) * 6.283, h = (30 + g2h(i, 121) * 50) * plume, sx = x + Math.cos(a) * f.r * .25 * g2h(i, 122), sy = y + Math.sin(a) * f.r * .12;
      g.globalAlpha = fade * (1 - k) * .75; g2Dust(g, sx, sy - h, 14 + h * .35, .7, i % 2 ? '120,92,62' : '160,128,92'); }
    for (let i = 0; i < Math.round(30 * g2q()); i++){ const a = g2h(i, 50) * 6.283, sp = 40 + g2h(i, 51) * 120, px = x + Math.cos(a) * sp * k, py = y + Math.sin(a) * sp * k * .5 - (sp * 1.1 * k - 170 * k * k);
      g.globalAlpha = fade * Math.min(1, (1 - k) * 2); g2Clod(g, px, py, 2.4 + g2h(i, 52) * 3.2, i); }
    for (let i = 0; i < 12; i++){ const a = i / 12 * 6.283, rr = f.r * (.35 + k * .9); g.globalAlpha = fade * (1 - k) * .5; g2Dust(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr * .5 - k * 12, 16 + k * 24, .55); }
  } }
  g.restore();
}
/* ---------- drawn with the other grand spells (mage2.js uses the same layers) ---------- */
function g2Draw(g, layer){ for (const f of GFX2.list){ const age = T - f.t0, x = f.x - cam.x, y = f.y - cam.y, fade = Math.min(1, age * 3, (f.dur - age) * 1.4); if (fade <= 0) continue;
    try { if (f.kind === 'flood2') (layer === 'under' ? g2FloodUnder : g2FloodOver)(g, f, x, y, age, fade); else if (f.kind === 'pit2') (layer === 'under' ? g2PitUnder : g2PitOver)(g, f, x, y, age, fade); } catch (e) {} } }
{ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g, ...a){ const r = _u.call(this, g, ...a); if (GFX2.list.length) g2Draw(g, 'under'); return r; }; }
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a); if (GFX2.list.length) g2Draw(g, 'over'); return r; }; }
