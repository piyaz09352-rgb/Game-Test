/* VAYRATHEN — js/world/water2.js — natural shorelines for every pond, lake, river and sea
   The old painter stamped ellipses: a river was a chain of ovals (a saw-tooth bank) and a pond was rings of ovals,
   bright in the middle and dark at the rim (a doughnut). Real water is the other way round and never round:
     · the outline wanders — a few long bends, smaller coves and points, and a fine ragged edge
     · around it the ground is damp (a soft darker halo), then a bank of mud, sand or gravel that thins out
     · inside the edge the water is shallow and light (you see the bottom), getting darker toward the deep middle
     · the waterline shines in broken bits, ripples lie across the surface, foam gathers along part of a shore
   Only the painting changes: where water stops creatures and players (obstacles, WATERS) is exactly as before.
   Loaded after world/maps.js; paintMap() calls these by name. */
'use strict';

/* a closed, natural outline around (x, y): radius wobbles in long bends, coves and a fine ragged edge */
function w2loop(x, y, rx, ry){
  const ph = [R() * 6.28, R() * 6.28, R() * 6.28, R() * 6.28], amp = [.075, .05, .028, .012], fr = [2, 3, 6, 13], n = Math.max(48, Math.round((rx + ry) * .9)), pts = [];
  for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2; let k = 1; for (let j = 0; j < 4; j++) k += amp[j] * Math.sin(fr[j] * a + ph[j]); k = Math.min(1.04, k);   // never far past the solid edge
    pts.push([Math.cos(a) * rx * k, Math.sin(a) * ry * k]); }
  // d: how far out (+) or in (−) to draw; wob: how unevenly — a bank is wide on a beach and thin under a steep edge
  const bw = [R() * 6.28, R() * 6.28];
  return (s = 1, d = 0, wob = 0) => { const p = new Path2D(); pts.forEach(([px, py], i) => { const a = i / pts.length * Math.PI * 2, dd = d * (1 + wob * (.65 * Math.sin(2 * a + bw[0]) + .35 * Math.sin(5 * a + bw[1]))), L = Math.hypot(px, py) || 1, X = x + px * s + px / L * dd, Y = y + py * s + py / L * dd; i ? p.lineTo(X, Y) : p.moveTo(X, Y); }); p.closePath(); return p; };
}
const w2rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
const w2mix = (a, b, t) => { const p = parseInt(a.slice(1), 16), q = parseInt(b.slice(1), 16), c = s => Math.round((p >> s & 255) + ((q >> s & 255) - (p >> s & 255)) * t); return '#' + [16, 8, 0].map(s => c(s).toString(16).padStart(2, '0')).join(''); };

function waterBody(g, x, y, rx, ry, cols, lotus, foam){
  const [shore, deep, mid, hi] = cols, loop = w2loop(x, y, rx + 6, ry), n = parseInt(mid.slice(1), 16), lava = (n >> 16 & 255) > 1.8 * (n >> 8 & 255);
  if (lava) return w2lava(g, x, y, rx, ry, cols, loop);
  g.save();
  // damp ground: a soft halo that fades out into the grass
  for (let i = 5; i >= 1; i--){ g.fillStyle = w2rgba(w2mix(shore, '#2a2418', .45), .06); g.fill(loop(1, 10 + i * 4, .8)); }
  // the bank: mud / sand / gravel, ragged, with pebbles and darker wet sand at the waterline
  // the bank thins out to nothing in places and widens into little beaches elsewhere; its outer edge is soft
  g.fillStyle = w2rgba(shore, .45); g.fill(loop(1, 13, .95)); g.fillStyle = shore; g.fill(loop(1, 8, .9));
  g.fillStyle = w2mix(shore, '#3a2e20', .3); g.fill(loop(1, 3.5, .7));
  for (let i = 0; i < (rx + ry) * .35; i++){ const a = R() * 6.28, d = 1.02 + R() * .12; g.fillStyle = R() < .5 ? w2rgba('#ffffff', .18) : w2rgba('#2a2018', .25);
    g.beginPath(); g.ellipse(x + Math.cos(a) * (rx + 6) * d, y + Math.sin(a) * ry * d, .8 + R() * 1.6, .6 + R() * .9, R() * 3, 0, 7); g.fill(); }
  // the water: shallow and light at the edge, deeper and darker toward the middle (never the other way round)
  const w = loop(1, 0), gr = g.createRadialGradient(x + rx * .08, y + ry * .1, 4, x, y, Math.max(rx, ry) * 1.02);
  gr.addColorStop(0, w2mix(deep, '#000000', .12)); gr.addColorStop(.55, deep); gr.addColorStop(.86, mid); gr.addColorStop(1, w2mix(mid, hi, .6));
  g.fillStyle = gr; g.fill(w);
  g.save(); g.clip(w);
  // shallows: the bottom shows through near the shore, in soft bands that follow the outline
  for (let i = 1; i <= 3; i++){ g.strokeStyle = w2rgba(w2mix(hi, shore, .35), .14 - i * .03); g.lineWidth = 6 + i * 7; g.stroke(loop(1, -i * 2)); }
  // the sky's reflection and wind ripples, lying across the surface
  for (let i = 0; i < rx / 7; i++){ const px = x + (R() - .5) * rx * 1.5, py = y + (R() - .5) * ry * 1.4, L = 5 + R() * 12;
    g.strokeStyle = w2rgba('#ffffff', .12 + R() * .18); g.lineWidth = .8 + R() * .6; g.beginPath(); g.moveTo(px - L, py); g.quadraticCurveTo(px, py - 1.5, px + L, py); g.stroke(); }
  g.fillStyle = w2rgba('#ffffff', .07); g.beginPath(); g.ellipse(x - rx * .25, y - ry * .3, rx * .35, ry * .12, -.15, 0, 7); g.fill();
  g.restore();
  // the waterline: a thin wet shine in broken pieces, not a ring
  g.strokeStyle = w2rgba('#ffffff', .4); g.lineWidth = 1.1; g.setLineDash([14 + R() * 20, 8 + R() * 16]); g.lineDashOffset = R() * 40; g.stroke(loop(1, -1.5)); g.setLineDash([]);
  if (lotus) for (let i = 0; i < rx / 8; i++){ const a = R() * 6.28, d = .35 + Math.sqrt(R()) * .5, px = x + Math.cos(a) * rx * d, py = y + Math.sin(a) * ry * d, r = 5 + R() * 4;
    g.fillStyle = '#3f7a3c'; g.beginPath(); g.ellipse(px, py + 1, r, r * .7, 0, .35, 6.0); g.lineTo(px, py + 1); g.fill(); g.fillStyle = '#5f9e4a'; g.beginPath(); g.ellipse(px, py, r, r * .66, 0, .35, 6.0); g.lineTo(px, py); g.fill();
    if (i % 2 === 0) for (let k = 0; k < 5; k++){ const b = -1.57 + (k - 2) * .45; g.fillStyle = lotus; g.beginPath(); g.ellipse(px + 2 + Math.cos(b) * 2.2, py - 3 + Math.sin(b) * 2.2, 1.6, 3, b + 1.57, 0, 7); g.fill(); } }
  if (foam){ g.strokeStyle = w2rgba('#ffffff', .55); g.lineWidth = 2; g.setLineDash([30, 22]); g.stroke(loop(1, 3)); g.setLineDash([]); }
  // a few tufts of rushes in the shallows on one side
  const side = R() * 6.28; for (let i = 0; i < Math.round(rx / 14); i++){ const a = side + (R() - .5) * 1.4, px = x + Math.cos(a) * (rx + 2), py = y + Math.sin(a) * (ry - 2);
    for (let k = 0; k < 5; k++){ g.strokeStyle = k % 2 ? '#4a7a32' : '#6a9a42'; g.lineWidth = 1; g.beginPath(); g.moveTo(px + k - 2, py); g.lineTo(px + k * 1.6 - 3.5, py - 6 - R() * 6); g.stroke(); } }
  g.restore();
}

/* a river or a sea band: two wandering banks across the whole map (same course as before, so the solid water is
   unchanged), filled deep in the middle (river) or toward the open edge (sea), with sand or mud banks */
function waterBand(g, b, B){
  const ry = (b.y1 - b.y0) / 2, sea = !!b.foam, edgeTop = b.y0 < 400, ph = [R() * 6.28, R() * 6.28, R() * 6.28, R() * 6.28];
  const cy = x => (b.y0 + b.y1) / 2 + Math.sin(x / 260) * 18;
  const bank = (x, sd) => cy(x) + sd * (ry + 6 * Math.sin(x / 97 + ph[sd > 0 ? 0 : 1]) + 3 * Math.sin(x / 37 + ph[sd > 0 ? 2 : 3]) + 1.2 * Math.sin(x / 11 + ph[0] * 3));
  const band = (dTop, dBot) => { const p = new Path2D(); for (let x = -20; x <= W + 20; x += 8) x < -19 ? p.moveTo(x, bank(x, -1) - dTop) : p.lineTo(x, bank(x, -1) - dTop); for (let x = W + 20; x >= -20; x -= 8) p.lineTo(x, bank(x, 1) + dBot); p.closePath(); return p; };
  const cols = {shore:b.shore, deep:b.deep, mid:b.mid, hi:b.hi};
  g.save();
  // damp ground and the banks (wider and paler on a sea beach)
  for (let i = 5; i >= 1; i--){ g.fillStyle = w2rgba(w2mix(cols.shore, '#2a2418', .45), .06); g.fill(band(12 + i * 5, 12 + i * 5)); }
  g.fillStyle = cols.shore; g.fill(band(sea ? 22 : 12, sea ? 22 : 12));
  g.fillStyle = w2mix(cols.shore, '#3a2e20', .28); g.fill(band(5, 5));
  for (let i = 0; i < W / 9; i++){ const x = R() * W, sd = R() < .5 ? -1 : 1, y = bank(x, sd) + sd * (6 + R() * 12);
    g.fillStyle = R() < .5 ? w2rgba('#ffffff', .18) : w2rgba('#2a2018', .22); g.beginPath(); g.ellipse(x, y, .8 + R() * 1.8, .6 + R(), R() * 3, 0, 7); g.fill(); }
  // the water: shallow light edges, deep middle (a river) or deep toward the open edge (the sea)
  const top = b.y0 - ry * .2, bot = b.y1 + ry * .2, gr = g.createLinearGradient(0, top, 0, bot), sh = w2mix(cols.mid, cols.hi, .6);
  if (sea){ const far = edgeTop ? 0 : 1; gr.addColorStop(far, w2mix(cols.deep, '#000000', .15)); gr.addColorStop(.5, cols.deep); gr.addColorStop(.85 * (1 - far) + .15 * far, cols.mid); gr.addColorStop(1 - far, sh); }
  else { gr.addColorStop(0, sh); gr.addColorStop(.2, cols.mid); gr.addColorStop(.5, cols.deep); gr.addColorStop(.8, cols.mid); gr.addColorStop(1, sh); }
  const wtr = band(0, 0); g.fillStyle = gr; g.fill(wtr);
  g.save(); g.clip(wtr);
  for (let i = 1; i <= 3; i++){ g.strokeStyle = w2rgba(w2mix(cols.hi, cols.shore, .35), .13 - i * .03); g.lineWidth = 6 + i * 7; g.stroke(band(-i * 2, -i * 2)); }
  // the current: long streaks running along the river; on the sea, rows of swell
  for (let i = 0; i < W / 30; i++){ const x = R() * W, y = cy(x) + (R() - .5) * ry * 1.5, L = sea ? 14 + R() * 20 : 18 + R() * 30;
    g.strokeStyle = w2rgba('#ffffff', .1 + R() * .18); g.lineWidth = .8 + R() * .7; g.beginPath(); g.moveTo(x - L, y); g.quadraticCurveTo(x, y - (sea ? 2.5 : 1.2), x + L, y + (sea ? 0 : 1)); g.stroke(); }
  g.restore();
  // waterline shine in broken pieces on both banks; surf along the beach of a sea
  for (const sd of [-1, 1]){ g.strokeStyle = w2rgba('#ffffff', .38); g.lineWidth = 1.1; g.setLineDash([16 + R() * 24, 10 + R() * 18]); g.lineDashOffset = R() * 50;
    g.beginPath(); for (let x = -20; x <= W + 20; x += 8){ const y = bank(x, sd) - sd * 1.5; x < -19 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
  g.setLineDash([]);
  if (sea){ const sd = edgeTop ? 1 : -1; for (let r = 0; r < 2; r++){ g.strokeStyle = w2rgba('#ffffff', .55 - r * .2); g.lineWidth = 2.4 - r * .8; g.setLineDash([40 + R() * 30, 18 + R() * 20]); g.lineDashOffset = R() * 60;
      g.beginPath(); for (let x = -20; x <= W + 20; x += 8){ const y = bank(x, sd) - sd * (4 + r * 9) + Math.sin(x / 40 + r) * 2; x < -19 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); } g.setLineDash([]); }
  g.restore();
  // the solid water, exactly as the old painter laid it (creatures, players and spawns depend on it)
  for (let x = -40; x <= W + 40; x += 60){ const c = cy(x); obstacles.push({x, y:c, r:Math.min(46, ry) - 4, water:true});
    if (ry > 60){ for (let yy = c - ry + 46; yy < c + ry - 40; yy += 70) obstacles.push({x, y:yy, r:40, water:true}); } }
}

/* a lava pool: a black crust shelf, a glowing rim of cracks, and the brightest, hottest melt in the middle */
function w2lava(g, x, y, rx, ry, cols, loop){
  const [crust, dark, hot, white] = cols;
  g.save();
  for (let i = 4; i >= 1; i--){ g.fillStyle = w2rgba(hot, .05); g.fill(loop(1, 8 + i * 5)); }   // heat glow on the rock
  g.fillStyle = crust; g.fill(loop(1, 9)); g.fillStyle = w2mix(crust, '#000000', .35); g.fill(loop(1, 3));
  const w = loop(1, 0), gr = g.createRadialGradient(x, y, 3, x, y, Math.max(rx, ry));
  gr.addColorStop(0, white); gr.addColorStop(.35, hot); gr.addColorStop(.8, dark); gr.addColorStop(1, w2mix(dark, '#000000', .3)); g.fillStyle = gr; g.fill(w);
  g.save(); g.clip(w);
  for (let i = 0; i < (rx + ry) / 6; i++){ const a = R() * 6.28, d = .3 + R() * .6, px = x + Math.cos(a) * rx * d, py = y + Math.sin(a) * ry * d, r = 4 + R() * 10;   // cooling crust plates with glowing seams
    g.fillStyle = w2rgba('#1a0a06', .55); g.beginPath(); for (let k = 0; k < 6; k++){ const b = k / 6 * 6.28 + R() * .4, q = r * (.7 + R() * .4); k ? g.lineTo(px + Math.cos(b) * q, py + Math.sin(b) * q * .7) : g.moveTo(px + Math.cos(b) * q, py + Math.sin(b) * q * .7); } g.closePath(); g.fill(); }
  g.restore();
  g.strokeStyle = w2rgba(white, .5); g.lineWidth = 1.2; g.setLineDash([10 + R() * 14, 6 + R() * 10]); g.stroke(loop(1, -2)); g.setLineDash([]);
  g.restore();
}
