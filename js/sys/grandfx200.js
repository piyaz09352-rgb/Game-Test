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
const PIT = {burst:3.2};
/* (v201) everything here is soft and natural: rounded boulders and pebbles, curving cracks that taper, soft dust
   clouds, and the eruption is the ground heaving up into rounded rock mounds (no pointed spikes or square bits) */
// a smooth, slightly lumpy closed shape (a stone, a clod, a mound) through points round an ellipse
function g2Blob(g, cx, cy, rx, ry, seed, lump = .18, n = 8){
  const P = []; for (let i = 0; i < n; i++){ const a = i / n * 6.283, k = 1 + (g2h(seed * 13 + i, 61) - .5) * 2 * lump; P.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  g.beginPath(); const m0 = [(P[n - 1][0] + P[0][0]) / 2, (P[n - 1][1] + P[0][1]) / 2]; g.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++){ const p = P[i], q = P[(i + 1) % n]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } g.closePath(); }
// a shaded stone: soft shadow, rounded body lit from the upper left, a faint highlight
function g2Stone(g, cx, cy, r, seed, tone = 0, sq = .78){
  g.save(); g.globalAlpha *= .35; g.fillStyle = '#1a120a'; g.beginPath(); g.ellipse(cx + r * .15, cy + r * sq * .75, r * 1.05, r * .38, 0, 0, 7); g.fill(); g.restore();
  const gr = g.createRadialGradient(cx - r * .35, cy - r * .45, r * .1, cx, cy, r * 1.15);
  const c = [[178, 146, 112], [140, 108, 78], [96, 70, 48], [58, 40, 26]].map(v => v.map(x => Math.round(x * (1 - tone * .25))));
  gr.addColorStop(0, `rgb(${c[0]})`); gr.addColorStop(.45, `rgb(${c[1]})`); gr.addColorStop(.8, `rgb(${c[2]})`); gr.addColorStop(1, `rgb(${c[3]})`);
  g2Blob(g, cx, cy, r, r * sq, seed); g.fillStyle = gr; g.fill();
  g.save(); g.globalAlpha *= .35; g.fillStyle = '#fff4e0'; g.beginPath(); g.ellipse(cx - r * .35, cy - r * .4, r * .32, r * .16, -.5, 0, 7); g.fill(); g.restore();
}
// a soft dust cloud
function g2Dust(g, cx, cy, r, a, col = '170,140,105'){ const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.6, `rgba(${col},${a * .5})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); }
function g2Cracks(f){ if (f._cr) return f._cr; const out = [];
  for (let i = 0; i < 9; i++){ const a0 = i / 9 * 6.283 + g2h(i, f.seed) * .5, pts = [[0, 0]]; let a = a0, r = 0;
    for (let j = 0; j < 5; j++){ r += f.r * (.12 + g2h(i * 7 + j, 1) * .09); a += (g2h(i * 7 + j, 2) - .5) * .45; pts.push([Math.cos(a) * r, Math.sin(a) * r * .5]); }
    out.push(pts); }
  return (f._cr = out); }
// a crack: a smooth curve through its points, wide at the pit and fading to a hairline
function g2CrackDraw(g, x, y, pts, n, w, col){
  for (let s = 0; s < n - 1; s++){ const p0 = pts[s], p1 = pts[s + 1], p2 = pts[Math.min(pts.length - 1, s + 2)], k = 1 - s / (pts.length - 1);
    g.strokeStyle = col; g.lineWidth = Math.max(.3, w * k); g.lineCap = 'round'; g.beginPath();
    g.moveTo(x + (p0[0] + p1[0]) / 2 * (s ? 1 : 0) + (s ? 0 : p0[0]), y + (s ? (p0[1] + p1[1]) / 2 : p0[1]));
    g.quadraticCurveTo(x + p1[0], y + p1[1], x + (p1[0] + p2[0]) / 2, y + (p1[1] + p2[1]) / 2); g.stroke(); } }
function g2Rim(f){ if (f._rim) return f._rim; const out = [];
  for (let i = 0; i < 18; i++) out.push({a:i / 18 * 6.283 + g2h(i, 20) * .25, r:4 + g2h(i, 21) * 5, tone:g2h(i, 22), out:.98 + g2h(i, 23) * .14});
  return (f._rim = out); }
function g2RimDraw(g, f, x, y, pr, half){
  for (const s of g2Rim(f)){ const sn = Math.sin(s.a); if ((sn < 0) !== (half === 'back')) continue;
    g2Stone(g, x + Math.cos(s.a) * pr * s.out, y + sn * pr * .5 * s.out, s.r * (pr / (f.r * .62)), Math.round(s.a * 100), s.tone); } }
function g2PitUnder(g, f, x, y, age, fade){
  const open = g2ease(Math.min(1, (age - .15) / .7)), R = f.r * .62 * open, burst = age > PIT.burst, bk = burst ? Math.min(1, (age - PIT.burst) / .6) : 0;
  g.save(); g.globalAlpha = fade;
  // churned, darker earth round the pit
  g.save(); g.translate(x, y); g.scale(1, .5);
  const sg = g.createRadialGradient(0, 0, 0, 0, 0, f.r * 1.2); sg.addColorStop(0, 'rgba(70,46,28,.6)'); sg.addColorStop(.55, 'rgba(96,68,42,.38)'); sg.addColorStop(1, 'rgba(110,80,50,0)'); g.fillStyle = sg; g.beginPath(); g.arc(0, 0, f.r * 1.2, 0, 7); g.fill(); g.restore();
  // curving cracks, a warm glow deep inside them
  const reach = Math.min(1, age / .6);
  for (const pts of g2Cracks(f)){ const n = Math.max(2, Math.ceil(pts.length * reach));
    g2CrackDraw(g, x, y, pts, n, 3.4, 'rgba(45,26,14,.75)');
    g.save(); g.globalCompositeOperation = 'lighter'; g2CrackDraw(g, x, y, pts, n, 1.3, `rgba(255,${130 + Math.round(40 * Math.sin(T * 5))},50,${.55 * (1 - bk)})`); g.restore(); }
  if (R > 2 && bk < 1){ const pr = R * (1 - bk * .9);
    // the pit: a soft earthen lip falling away into darkness, a dim ember glow at the bottom
    g.save(); g.translate(x, y); g.scale(1, .5);
    const wg = g.createRadialGradient(0, pr * .14, 0, 0, 0, pr * 1.08);
    wg.addColorStop(0, 'rgba(0,0,0,1)'); wg.addColorStop(.42, 'rgba(12,7,8,1)'); wg.addColorStop(.7, 'rgba(42,27,18,1)'); wg.addColorStop(.88, 'rgba(92,64,40,.95)'); wg.addColorStop(1, 'rgba(120,88,56,0)');
    g.fillStyle = wg; g.beginPath(); g.arc(0, 0, pr * 1.08, 0, 7); g.fill();
    g.globalCompositeOperation = 'lighter'; const mg = g.createRadialGradient(0, pr * .1, 0, 0, pr * .1, pr * .5); mg.addColorStop(0, `rgba(255,96,36,${.3 + .12 * Math.sin(T * 3.5)})`); mg.addColorStop(1, 'rgba(255,60,20,0)'); g.fillStyle = mg; g.beginPath(); g.arc(0, pr * .1, pr * .5, 0, 7); g.fill();
    g.globalCompositeOperation = 'source-over';
    // fine dust and grit sliding down in a slow spiral
    for (let arm = 0; arm < 3; arm++) for (let j = 0; j < Math.round(16 * g2q()); j++){ const u = ((j / 16) + T * .3) % 1, ang = arm * 2.094 + u * 6.5 + T * 1.4, rr = pr * (1 - u) * .95;
      g.globalAlpha = fade * (1 - u) * .55; g2Dust(g, Math.cos(ang) * rr, Math.sin(ang) * rr, 3 + (1 - u) * 5, .7, j % 2 ? '190,155,115' : '140,105,72'); }
    g.restore();
    g.globalAlpha = fade; g2RimDraw(g, f, x, y, pr, 'back');
  }
  g.restore();
}
function g2PitOver(g, f, x, y, age, fade){
  const open = g2ease(Math.min(1, (age - .15) / .7)), R = f.r * .62 * open, burst = age > PIT.burst;
  g.save(); g.globalAlpha = fade;
  if (!burst && R > 2){
    g2RimDraw(g, f, x, y, R, 'front');
    // pebbles rolling in along the spiral, a little dust behind each
    for (let j = 0; j < Math.round(14 * g2q()); j++){ const u = ((j / 14) + T * .25) % 1, ang = j * 2.4 + u * 4.5 + T * .8, rr = f.r * 1.1 * (1 - u) + R * .12;
      const px = x + Math.cos(ang) * rr, py = y + Math.sin(ang) * rr * .5, s = 2.6 * (1 - u * .6) + 1;
      g.globalAlpha = fade * Math.min(1, (1 - u) * 3) * .5; g2Dust(g, px - Math.cos(ang) * 5, py - Math.sin(ang) * 2.5, s * 2.2, .5);
      g.globalAlpha = fade * Math.min(1, (1 - u) * 3); g2Stone(g, px, py - s * .4, s, j, g2h(j, 70)); }
    // boulders dropping in from the sky, a shadow growing under each, a puff of dust where they land
    for (let i = 0; i < 4; i++){ const t0 = .55 + i * .6, k = (age - t0) / .55; if (k < 0 || k > 1.6) continue;
      const bx = x + (g2h(i, 30) - .5) * R * 1.1, by = y + (g2h(i, 31) - .5) * R * .45, s = 8 + g2h(i, 32) * 6;
      if (k <= 1){ const hy = by - (1 - k * k) * 170;
        g.globalAlpha = fade * .3 * k; g.fillStyle = '#000'; g.beginPath(); g.ellipse(bx, by, s * (.5 + k * .6), s * (.22 + k * .26), 0, 0, 7); g.fill();
        g.globalAlpha = fade; g2Stone(g, bx, hy, s, i + 90, .2, .86); }
      else { const d = (k - 1) / .6; g.globalAlpha = fade * (1 - d);
        for (let p = 0; p < 6; p++){ const q = p / 6 * 6.283 + i; g2Dust(g, bx + Math.cos(q) * d * 24, by + Math.sin(q) * d * 10 - d * 10, 8 + d * 12, .55); } } }
  }
  // the eruption: the ground heaves up into rounded rock mounds, clods of earth fly and settle, dust billows out
  if (burst){ const k = (age - PIT.burst) / 1.6; if (k < 1){
    const up = k < .25 ? g2ease(k / .25) : 1 - Math.pow((k - .25) / .75, 2);
    g.globalAlpha = fade * (1 - k) * .8; g.strokeStyle = 'rgba(225,200,160,.7)'; g.lineWidth = 2.5 * (1 - k) + .8; g.beginPath(); g.ellipse(x, y, f.r * (.3 + k * 1.1), f.r * (.3 + k * 1.1) * .5, 0, 0, 7); g.stroke();
    const mounds = []; for (const [rr0, n] of [[.3, 5], [.62, 8], [.95, 11]]) for (let i = 0; i < n; i++){ const a = i / n * 6.283 + rr0 * 3; mounds.push({a, rr:f.r * rr0, i, n}); }
    mounds.sort((p, q) => Math.sin(p.a) - Math.sin(q.a));
    for (const m of mounds){ const sx = x + Math.cos(m.a) * m.rr, sy = y + Math.sin(m.a) * m.rr * .5, s = (9 + g2h(m.i, m.n) * 7) * (1.1 - m.rr / f.r * .35), H = s * 1.5 * up;
      if (H < 1) continue; g.globalAlpha = fade; g2Stone(g, sx, sy - H * .45, s * (.75 + up * .35), m.i * 7 + m.n, g2h(m.i, 80), Math.max(.6, H / s * .6));
      g.globalAlpha = fade * .5 * up; g2Dust(g, sx, sy, s * 1.4, .45); }
    for (let i = 0; i < Math.round(26 * g2q()); i++){ const a = g2h(i, 50) * 6.283, sp = 40 + g2h(i, 51) * 110, px = x + Math.cos(a) * sp * k, py = y + Math.sin(a) * sp * k * .5 - (sp * .9 * k - 150 * k * k);
      g.globalAlpha = fade * (1 - k); g2Stone(g, px, py, 1.6 + g2h(i, 52) * 2.4, i + 200, g2h(i, 53)); }
    for (let i = 0; i < 12; i++){ const a = i / 12 * 6.283, rr = f.r * (.35 + k * .85); g.globalAlpha = fade * (1 - k) * .55; g2Dust(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr * .5 - k * 18, 14 + k * 22, .6); }
  } }
  g.restore();
}
/* ---------- drawn with the other grand spells (mage2.js uses the same layers) ---------- */
function g2Draw(g, layer){ for (const f of GFX2.list){ const age = T - f.t0, x = f.x - cam.x, y = f.y - cam.y, fade = Math.min(1, age * 3, (f.dur - age) * 1.4); if (fade <= 0) continue;
    try { if (f.kind === 'flood2') (layer === 'under' ? g2FloodUnder : g2FloodOver)(g, f, x, y, age, fade); else if (f.kind === 'pit2') (layer === 'under' ? g2PitUnder : g2PitOver)(g, f, x, y, age, fade); } catch (e) {} } }
{ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g, ...a){ const r = _u.call(this, g, ...a); if (GFX2.list.length) g2Draw(g, 'under'); return r; }; }
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a); if (GFX2.list.length) g2Draw(g, 'over'); return r; }; }
