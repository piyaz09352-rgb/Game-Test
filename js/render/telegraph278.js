/* VAYRATHEN — js/render/telegraph278.js — (v278) warnings the ground gives, not red paint
   The owner disliked the red circles and bars that marked where a boss move would land. They are drawn now as the
   ground itself reacting: where something will burst up, the earth darkens and splits in cracks that glow hotter as
   the moment comes, pebbles hop and a broken fissure opens round the edge; where something will fall from the sky, its
   shadow darkens and grows; along a charge or a wave, a furrow tears open in the line it will take. You can still read
   every one at a glance — it is just part of the world now. Used by vfx.js (warnCircle, warnLine) and bosssig.js. */
'use strict';
const teleH = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
/* a circle of danger: x, y on the canvas already; r its radius; k 0 → 1 as the moment nears */
function teleCircle(g, x, y, r, k, o = {}){
  const col = o.col || '255,140,60', seed = Math.round(x * 7 + y * 13) % 997, sq = o.sq || .45;
  g.save();
  if (o.kind === 'fall'){   // the shadow of what is falling: darker and wider as it comes
    const R = r * (.35 + .65 * k); g.fillStyle = `rgba(12,8,6,${.1 + .38 * k})`; g.beginPath(); g.ellipse(x, y, R, R * sq, 0, 0, 7); g.fill();
    g.fillStyle = `rgba(12,8,6,${.12 + .3 * k})`; g.beginPath(); g.ellipse(x, y, R * .55, R * .55 * sq, 0, 0, 7); g.fill();
    for (let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2 + T, hop = Math.abs(Math.sin(T * 13 + i)) * 3 * k; g.fillStyle = `rgba(120,100,80,${.5 * k})`; g.beginPath(); g.arc(x + Math.cos(a) * R * .8, y + Math.sin(a) * R * .8 * sq - hop, 1.6, 0, 7); g.fill(); }   // grit stirred by the air it pushes
    g.restore(); return; }
  // the ground darkens (no edge)
  const st = g.createRadialGradient(x, y, 0, x, y, r); st.addColorStop(0, `rgba(25,12,6,${.3 * k + .06})`); st.addColorStop(.75, `rgba(25,12,6,${.18 * k + .04})`); st.addColorStop(1, 'rgba(25,12,6,0)');
  g.fillStyle = st; g.beginPath(); g.ellipse(x, y, r, r * sq, 0, 0, 7); g.fill();
  // cracks race out from the middle: dark rims and a glowing heart that gets hotter
  const n = 7 + seed % 3, len = .25 + .75 * Math.min(1, k * 1.25), hot = .35 + .65 * k + (k > .85 ? Math.sin(T * 30) * .2 : 0);
  const paths = []; for (let i = 0; i < n; i++){ const a0 = i / n * Math.PI * 2 + teleH(seed, i) * .5, pts = [[x, y]]; let a = a0;
    for (let s = 1; s <= 6; s++){ a += (teleH(seed + s, i) - .5) * .7; const rr = r * len * s / 6; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * sq]); } paths.push(pts); }
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const pts of paths){ g.strokeStyle = 'rgba(30,14,6,.75)'; g.lineWidth = 2.6; g.beginPath(); pts.forEach((p, j) => (j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); }
  g.globalCompositeOperation = 'lighter';
  for (const pts of paths){ g.strokeStyle = `rgba(${col},${Math.min(1, hot)})`; g.lineWidth = 1.2; g.beginPath(); pts.forEach((p, j) => (j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); }
  // a broken fissure round the edge: short glowing pieces, not a ring
  for (let i = 0; i < 12; i++){ if (teleH(seed, i + 40) < .35) continue; const a0 = i / 12 * Math.PI * 2, a1 = a0 + .32 + teleH(seed, i) * .2;
    g.strokeStyle = `rgba(${col},${(.15 + .55 * k) * (.6 + teleH(seed, i + 9) * .4)})`; g.lineWidth = 1.4; g.beginPath(); g.ellipse(x, y, r * (.94 + teleH(seed, i + 3) * .08), r * sq * (.94 + teleH(seed, i + 3) * .08), 0, a0, a1); g.stroke(); }
  // a warm glow where it will burst, rising at the end
  const gl = g.createRadialGradient(x, y, 0, x, y, r * .6); gl.addColorStop(0, `rgba(${col},${.08 + .3 * k * k})`); gl.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gl; g.beginPath(); g.ellipse(x, y, r * .6, r * .6 * sq, 0, 0, 7); g.fill();
  // pebbles hopping as the ground trembles
  g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 9; i++){ const a = teleH(seed, i + 70) * Math.PI * 2, rr = r * (.3 + .65 * teleH(seed, i + 80)), hop = Math.abs(Math.sin(T * (12 + i) + i)) * 3.5 * k;
    g.fillStyle = 'rgba(90,70,50,.85)'; g.beginPath(); g.ellipse(x + Math.cos(a) * rr, y + Math.sin(a) * rr * sq - hop, 1.6, 1.2, 0, 0, 7); g.fill(); }
  g.restore();
}
/* a line of danger (a charge, a wave): a furrow tears open along it, a hot crack in its middle */
function teleLine(g, x0, y0, ux, uy, len, w, k, o = {}){
  const col = o.col || '255,140,60', L = len * Math.min(1, .2 + k * 1.1), px = -uy, py = ux * .5, seed = Math.round(x0 * 3 + y0 * 5) % 997;
  g.save(); g.lineCap = 'round';
  // the torn strip of ground: ragged edges, darker towards the middle (no smooth bar)
  const E = 16, top = [], bot = []; for (let s2 = 0; s2 <= E; s2++){ const t = s2 / E, bx = x0 + ux * L * t, by = y0 + uy * L * t, ww = w * .5 * (.55 + .45 * teleH(seed, s2 + 200)) * (s2 === 0 || s2 === E ? .4 : 1);
    top.push([bx + px * ww, by + py * ww]); bot.push([bx - px * ww * (.6 + .4 * teleH(seed, s2 + 300)), by - py * ww * (.6 + .4 * teleH(seed, s2 + 300))]); }
  g.fillStyle = `rgba(30,15,7,${.12 + .2 * k})`; g.beginPath(); top.forEach((p, j2) => (j2 ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); for (let s2 = E; s2 >= 0; s2--) g.lineTo(bot[s2][0], bot[s2][1]); g.closePath(); g.fill();
  // the crack down its middle, jagged, dark rimmed and glowing
  const pts = []; for (let s = 0; s <= 14; s++){ const t = s / 14, j = (teleH(seed, s) - .5) * w * .35; pts.push([x0 + ux * L * t + px * j, y0 + uy * L * t + py * j]); }
  g.strokeStyle = 'rgba(30,14,6,.75)'; g.lineWidth = 3; g.beginPath(); pts.forEach((p, j) => (j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
  g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(${col},${.35 + .6 * k})`; g.lineWidth = 1.3; g.beginPath(); pts.forEach((p, j) => (j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
  // little side cracks and kicked-up grit along the way
  for (let s = 1; s < 14; s += 2){ const [bx, by] = pts[s], sd = teleH(seed, s + 30) < .5 ? -1 : 1, l2 = w * (.2 + teleH(seed, s + 50) * .3);
    g.strokeStyle = `rgba(${col},${.2 + .4 * k})`; g.lineWidth = 1; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + px * sd * l2 + ux * 4, by + py * sd * l2 + uy * 4); g.stroke(); }
  g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 8; i++){ const t = teleH(seed, i + 90), hop = Math.abs(Math.sin(T * 14 + i)) * 3 * k, side = (teleH(seed, i + 95) - .5) * w;
    g.fillStyle = 'rgba(90,70,50,.85)'; g.beginPath(); g.ellipse(x0 + ux * L * t + px * side, y0 + uy * L * t + py * side - hop, 1.5, 1.1, 0, 0, 7); g.fill(); }
  g.restore();
}
