/* VAYRATHEN — js/world/props.js
   Painted world props (Thai village + golden fields), pre-rendered once at PS pixels per world unit,
   outlined like the character sprites, then drawn y-sorted with characters. Authoring units = world units,
   origin = the prop's foot point (where it touches the ground). */
'use strict';

const PAL = {
  ink:'#2a1a12',
  leafD:'#2c5a32', leafM:'#3f7d3e', leafL:'#69a84c', leafH:'#a8d36a',
  barkD:'#4a2f1d', barkM:'#6e4a2e', barkL:'#9a6c42',
  teakD:'#5a3519', teakM:'#8a5a2e', teakL:'#b98450', teakH:'#d9a76c',
  roofD:'#5e1f19', roofM:'#8f3426', roofL:'#b8503a',
  tileG:'#3d6e4e', tileGL:'#5b9466',
  gold:'#e3b04b', goldL:'#fbe39a', goldD:'#9c6c1e',
  white:'#f4ecdb', whiteD:'#cfc2a6',
  straw:'#e2b955', strawD:'#a77c2a', strawL:'#f7dc8e',
  stone:'#8d8a80', stoneD:'#5e5b55', stoneL:'#c2bfb3', moss:'#6f9a4a'
};

function propRng(seed){ let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pv = (g, pts) => { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); };
const ov = (g, x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); };

/* 1px dark outline around the painted shape (same treatment as the sprites) */
function outlinePass(c, width = 2){
  const g = c.getContext('2d'), w = c.width, h = c.height, img = g.getImageData(0, 0, w, h), d = img.data;
  for (let pass = 0; pass < width; pass++){
    const src = d.slice();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
      const i = (y * w + x) * 4; if (src[i + 3] > 40) continue;
      let best = -1, ba = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const j = (yy * w + xx) * 4; if (src[j + 3] > ba){ ba = src[j + 3]; best = j; }
      }
      if (best >= 0 && ba > 160){ const k = pass ? .55 : .38; d[i] = src[best] * k; d[i + 1] = src[best + 1] * k * .95; d[i + 2] = src[best + 2] * k * 1.05; d[i + 3] = pass ? 200 : 255; }
    }
  }
  g.putImageData(img, 0, 0);
}
function makeProp(spec){
  const {w, h, ax, ay, paint, shadow, collide = 0} = spec, S = GFX.ps;   // painted at the quality preset's density
  const body = document.createElement('canvas'); body.width = Math.ceil(w * S); body.height = Math.ceil(h * S);
  const g = body.getContext('2d'); g.setTransform(S, 0, 0, S, ax * S, ay * S); g.lineJoin = 'round'; g.lineCap = 'round';
  paint(g, propRng(spec.seed || 1));
  outlinePass(body, 2);
  const c = document.createElement('canvas'); c.width = body.width; c.height = body.height;
  const cg = c.getContext('2d');
  if (shadow){ cg.setTransform(S, 0, 0, S, ax * S, ay * S); cg.fillStyle = 'rgba(30,40,18,.30)'; ov(cg, shadow[2] || 0, 1, shadow[0], shadow[1]); cg.fill(); cg.setTransform(1, 0, 0, 1, 0, 0); }
  cg.drawImage(body, 0, 0);
  return {img:c, w, h, ax, ay, collide, glow:spec.glow || null};
}

/* ---------- painting helpers ---------- */
function leafCluster(g, x, y, r, rng, pal = PAL){
  g.fillStyle = pal.leafD; ov(g, x + r * .1, y + r * .12, r, r * .9); g.fill();
  g.fillStyle = pal.leafM; ov(g, x - r * .06, y - r * .04, r * .86, r * .76); g.fill();
  g.fillStyle = pal.leafL; ov(g, x - r * .28, y - r * .3, r * .52, r * .44); g.fill();
  for (let i = 0; i < r * 2.2; i++){                         // leaf dabs
    const a = rng() * 6.28, d = Math.sqrt(rng()) * r * .9, lx = x + Math.cos(a) * d, ly = y + Math.sin(a) * d * .85;
    const lit = (lx - x) + (ly - y) < -r * .2;
    g.fillStyle = lit ? (rng() < .4 ? pal.leafH : pal.leafL) : (rng() < .5 ? pal.leafD : pal.leafM);
    ov(g, lx, ly, 1.6 + rng() * 1.4, .9 + rng() * .7, rng() * 3); g.fill();
  }
}
function plank(g, x, y, w, h, base, lite, dark){
  g.fillStyle = base; g.fillRect(x, y, w, h);
  g.fillStyle = lite; g.fillRect(x, y, w, .6); g.fillRect(x, y, .6, h);
  g.fillStyle = dark; g.fillRect(x, y + h - .6, w, .6); g.fillRect(x + w - .6, y, .6, h);
}
function hangHong(g, x, y, dir, col){                       // curled eave finial (หางหงส์)
  g.strokeStyle = col; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + dir * 5, y + 1, x + dir * 6, y - 5); g.quadraticCurveTo(x + dir * 6.5, y - 8, x + dir * 4, y - 8); g.stroke();
}
function tuaNgao(g, x, y, dir, col){                        // curled barge-board end of a house (ตัวเหงา)
  g.strokeStyle = col; g.lineWidth = 2;
  g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + dir * 3, y + 1.5, x + dir * 6, y - .5, x + dir * 5, y - 3.5); g.bezierCurveTo(x + dir * 4.3, y - 5.2, x + dir * 2.4, y - 4.2, x + dir * 3.2, y - 2.8); g.stroke();
}
function chofa(g, x, y, h, col){                             // ช่อฟ้า: slim bird-beak finial on the gable apex
  g.strokeStyle = col; g.lineWidth = Math.max(1.2, h * .16);
  g.beginPath(); g.moveTo(x, y + 1); g.bezierCurveTo(x - h * .12, y - h * .45, x + h * .3, y - h * .75, x + h * .1, y - h); g.lineTo(x + h * .38, y - h * .86); g.stroke();
}
function grain(g, x, y, w, h, rng, n, col = 'rgba(50,25,10,.28)'){   // wood grain streaks on a vertical board
  g.strokeStyle = col; g.lineWidth = .3;
  for (let i = 0; i < n; i++){ const gx = x + rng() * w, gy = y + rng() * h * .7, l = h * (.2 + rng() * .4);
    g.beginPath(); g.moveTo(gx, gy); g.quadraticCurveTo(gx + (rng() - .5), gy + l * .5, gx + (rng() - .5) * .6, Math.min(y + h, gy + l)); g.stroke(); }
}
function blocks(g, x, y, w, h, bw, bh, cols, mortar, rng, pits = 0){   // coursed masonry from the bottom up: staggered joints, toned blocks, laterite pits
  g.fillStyle = mortar; g.fillRect(x, y, w, h);
  for (let r = 0, yy = y + h - bh; yy > y - bh + .05; r++, yy -= bh){ const y0 = Math.max(y, yy), hh = yy + bh - y0;
    for (let xx = x - (r % 2) * bw * .5; xx < x + w; xx += bw){ const x0 = Math.max(x, xx), x1 = Math.min(x + w, xx + bw); if (x1 - x0 < .9 || hh < .9) continue;
      g.fillStyle = cols[Math.floor(rng() * cols.length)]; g.fillRect(x0 + .3, y0 + .3, x1 - x0 - .6, hh - .6);
      g.fillStyle = 'rgba(255,240,210,.16)'; g.fillRect(x0 + .3, y0 + .3, x1 - x0 - .6, .45); } }
  g.fillStyle = 'rgba(30,12,4,.36)'; for (let i = 0; i < pits; i++){ ov(g, x + rng() * w, y + rng() * h, .3 + rng() * .4, .25 + rng() * .3); g.fill(); }
}
function tileQuad(g, q, rows, cols, c){                     // tiled roof plane: q = eave-L, eave-R, ridge-R, ridge-L; c = [base, light, dark]
  const P = (u, v) => { const bx = q[0] + (q[2] - q[0]) * u, by = q[1] + (q[3] - q[1]) * u, tx = q[6] + (q[4] - q[6]) * u, ty = q[7] + (q[5] - q[7]) * u; return [bx + (tx - bx) * v, by + (ty - by) * v]; };
  g.fillStyle = c[0]; pv(g, q); g.fill(); g.lineWidth = .45;
  for (let r = 0; r < rows; r++){ const v0 = r / rows, v1 = (r + 1) / rows;
    g.strokeStyle = c[2]; g.beginPath(); g.moveTo(...P(0, v0)); g.lineTo(...P(1, v0)); g.stroke();
    g.strokeStyle = c[1]; for (let k = (r % 2) * .5; k <= cols; k++){ g.beginPath(); g.moveTo(...P(k / cols, v0 + .02)); g.lineTo(...P(k / cols, v1)); g.stroke(); } }
}
function roofBand(g, x0, y0, x1, y1, th, c, rows){          // a roof slope seen end-on past the gable: tile courses across the band
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), s = x0 < x1 ? 1 : -1, nx = s * dy / L * th, ny = -s * dx / L * th;
  tileQuad(g, [x0, y0, x0 + nx, y0 + ny, x1 + nx, y1 + ny, x1, y1], rows, 2, c);
}
function barge(g, x0, y0, x1, y1, w, teeth, c = [PAL.gold, PAL.goldL, PAL.goldD]){   // ป้านลม/นาคสะดุ้ง: gilt barge board, rippling naga line, ใบระกา fins along the top
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), s = x0 < x1 ? 1 : -1, nx = s * dy / L, ny = -s * dx / L, ux = dx / L, uy = dy / L, k = w * .8 + .7;
  g.fillStyle = c[0];
  for (let i = 0; i < teeth; i++){ const t = (i + .2) / teeth, bx = x0 + dx * t + nx * w * .4, by = y0 + dy * t + ny * w * .4;
    pv(g, [bx, by, bx + ux * k * 1.4, by + uy * k * 1.4, bx + ux * k * 1.9 + nx * k * 1.5, by + uy * k * 1.9 + ny * k * 1.5]); g.fill(); }
  g.strokeStyle = c[0]; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = c[1]; g.lineWidth = w * .22; g.beginPath(); g.moveTo(x0 + nx * w * .32, y0 + ny * w * .32); g.lineTo(x1 + nx * w * .32, y1 + ny * w * .32); g.stroke();
  g.strokeStyle = c[2]; g.lineWidth = .55; g.beginPath(); for (let j = 0; j <= 40; j++){ const t = j / 40, o = Math.sin(t * L * .45) * w * .2 - w * .12; g.lineTo(x0 + dx * t + nx * o, y0 + dy * t + ny * o); } g.stroke();
}
function ong(g, x, y, s = 1){                                // glazed water jar (โอ่งมังกร) with a wooden lid
  g.fillStyle = '#4e2a12'; ov(g, x, y - 5 * s, 5 * s, 5.2 * s); g.fill(); g.fillStyle = '#7e4420'; ov(g, x - 1.2 * s, y - 5.6 * s, 3.2 * s, 4 * s); g.fill();
  g.fillStyle = 'rgba(255,230,180,.35)'; ov(g, x - 2.6 * s, y - 7 * s, .9 * s, 1.8 * s); g.fill();
  g.strokeStyle = '#d8b25a'; g.lineWidth = .55 * s; g.beginPath(); for (let i = 0; i <= 8; i++) g.lineTo(x - 4 * s + i * s, y - 4.6 * s + Math.sin(i * 1.7) * .8 * s); g.stroke();   // dragon band
  g.fillStyle = '#3a1c0c'; g.fillRect(x - 3 * s, y - 10.6 * s, 6 * s, 1.2 * s); g.fillStyle = PAL.teakL; ov(g, x, y - 10.8 * s, 3.8 * s, 1 * s); g.fill();
}
function potPlant(g, x, y, rng, fl = '#f06292'){             // terracotta pot with a leafy plant
  g.fillStyle = '#9a4a28'; pv(g, [x - 3.4, y - 5, x + 3.4, y - 5, x + 2.4, y, x - 2.4, y]); g.fill(); g.fillStyle = '#c0683a'; g.fillRect(x - 3.6, y - 5.6, 7.2, 1.4);
  leafCluster(g, x, y - 8.4, 3.8, rng); g.fillStyle = fl; ov(g, x + 1.2, y - 10, 1.2, 1.2); g.fill(); ov(g, x - 1.6, y - 8.4, 1, 1); g.fill();
}

/* ---------- prop painters ---------- */
const PROP_TYPES = {
  tree: seed => makeProp({w:96, h:118, ax:48, ay:110, seed, shadow:[30, 10], collide:13, paint(g, rng){
    g.fillStyle = PAL.barkM; pv(g, [-5, 0, -4, -30, -9, -46, -3, -44, 0, -34, 4, -48, 9, -46, 4, -30, 6, 0]); g.fill();
    g.fillStyle = PAL.barkD; pv(g, [1, 0, 2, -28, 6, 0]); g.fill();
    g.fillStyle = PAL.barkL; g.fillRect(-4, -26, 1.4, 22);
    g.fillStyle = PAL.barkM; pv(g, [-10, 1, -5, -6, -2, 1]); g.fill(); pv(g, [10, 1, 5, -6, 2, 1]); g.fill();
    const cl = [[0, -70, 26], [-22, -56, 18], [22, -56, 18], [-14, -84, 17], [14, -86, 17], [0, -96, 13], [-28, -72, 13], [28, -72, 13]];
    cl.sort((a, b) => a[1] - b[1]).reverse();
    for (const [x, y, r] of cl.slice().reverse()) leafCluster(g, x + (rng() - .5) * 4, y + (rng() - .5) * 3, r * (.9 + rng() * .2), rng);
    if (rng() < .5){ for (let i = 0; i < 9; i++){ const a = rng() * 6.28, d = rng() * 26; g.fillStyle = rng() < .5 ? '#f2b04a' : '#e8803a'; ov(g, Math.cos(a) * d, -72 + Math.sin(a) * d * .8, 2, 2.2); g.fill(); } }
  }}),
  palm: seed => makeProp({w:110, h:124, ax:55, ay:118, seed, shadow:[16, 6, 6], collide:8, paint(g, rng){
    const lean = (rng() - .5) * 18;
    const pt = t => [lean * t * t, -t * 84];
    for (let t = 0; t < 1; t += .04){ const [x, y] = pt(t), w = 4.2 - t * 1.4;
      g.fillStyle = Math.floor(t * 25) % 2 ? PAL.barkM : PAL.barkL; g.fillRect(x - w, y - 3.6, w * 2, 3.8);
      g.fillStyle = PAL.barkD; g.fillRect(x + w * .3, y - 3.6, w * .7, 3.8); }
    const [tx, ty] = pt(1);
    for (let i = 0; i < 9; i++){
      const a = -Math.PI / 2 + (i / 8 - .5) * 3.6 + (rng() - .5) * .2, len = 34 + rng() * 10, droop = 16 + rng() * 10;
      const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * .55 + droop;
      const cx = tx + Math.cos(a) * len * .5, cy = ty + Math.sin(a) * len * .4 - 10;
      for (let k = 0; k <= 1; k += .06){
        const x = (1 - k) * (1 - k) * tx + 2 * (1 - k) * k * cx + k * k * ex, y = (1 - k) * (1 - k) * ty + 2 * (1 - k) * k * cy + k * k * ey;
        const lw = 9 * (1 - k * .8);
        g.strokeStyle = i % 2 ? PAL.leafM : PAL.leafL; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.sin(a) * lw * .2, y + lw * .9); g.stroke();
        g.strokeStyle = PAL.leafD; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(a) * lw * .2 + 1, y + lw * .8); g.stroke();
      }
      g.strokeStyle = PAL.leafH; g.lineWidth = 1; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(cx, cy, ex, ey); g.stroke();
    }
    for (let i = 0; i < 4; i++){ g.fillStyle = i % 2 ? '#7a5a22' : '#5f7a2a'; ov(g, tx - 5 + i * 3.4, ty + 4 + (i % 2) * 2, 3.2, 3.4); g.fill(); }
  }}),
  banana: seed => makeProp({w:70, h:76, ax:35, ay:72, seed, shadow:[16, 6], collide:8, paint(g, rng){
    g.fillStyle = '#6f8f3a'; pv(g, [-3.5, 0, -2.5, -30, 2.5, -30, 3.5, 0]); g.fill();
    g.fillStyle = '#88aa4a'; g.fillRect(-2.5, -30, 1.4, 30);
    for (let i = 0; i < 6; i++){
      const a = -Math.PI / 2 + (i / 5 - .5) * 2.8, len = 26 + rng() * 6;
      g.save(); g.translate(0, -30); g.rotate(a + Math.PI / 2);
      g.fillStyle = i % 2 ? PAL.leafM : PAL.leafL; ov(g, 0, -len / 2, 7, len / 2, 0); g.fill();
      g.fillStyle = PAL.leafD; ov(g, 2.4, -len / 2, 4, len / 2 - 1); g.fill();
      g.strokeStyle = '#c9e08a'; g.lineWidth = .8; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -len); g.stroke();
      g.strokeStyle = 'rgba(30,60,20,.6)'; g.lineWidth = .7;
      for (let k = 6; k < len - 4; k += 4 + rng() * 4){ if (rng() < .45){ g.beginPath(); g.moveTo(-1, -k); g.lineTo(-6.5, -k + 2); g.stroke(); } }
      g.restore();
    }
  }}),
  bamboo: seed => makeProp({w:70, h:120, ax:35, ay:114, seed, shadow:[22, 7], collide:14, paint(g, rng){
    for (let i = 0; i < 9; i++){
      const x = (i - 4) * 4.4 + (rng() - .5) * 3, hgt = 70 + rng() * 38, lean = (x) * .12;
      for (let y = 0; y > -hgt; y -= 9){
        const k = -y / hgt, cx = x + lean * k * k * 6;
        g.fillStyle = i % 3 ? '#7fa645' : '#9cbd55'; g.fillRect(cx - 1.6, y - 9, 3.2, 9);
        g.fillStyle = '#c9dc7a'; g.fillRect(cx - 1.6, y - 9, .8, 9);
        g.fillStyle = '#4f6e2c'; g.fillRect(cx - 2, y - 1, 4, 1.2);
      }
      for (let k = 0; k < 4; k++){ const ly = -hgt * (.45 + k * .15), lx = x + lean * 3;
        for (let j = 0; j < 4; j++){ g.fillStyle = j % 2 ? PAL.leafL : PAL.leafM; ov(g, lx + (j - 1.5) * 5 + (rng() - .5) * 3, ly + (rng() - .5) * 4, 5, 1.4, (rng() - .5) * 1.2); g.fill(); } }
    }
  }}),
  bush: seed => makeProp({w:44, h:30, ax:22, ay:26, seed, shadow:[16, 5], collide:0, paint(g, rng){
    leafCluster(g, -8, -9, 9, rng); leafCluster(g, 8, -9, 9, rng); leafCluster(g, 0, -14, 10, rng);
    const fc = ['#f2a7c0', '#ffffff', '#f6d05a'][Math.floor(rng() * 3)];
    for (let i = 0; i < 7; i++){ g.fillStyle = fc; ov(g, (rng() - .5) * 24, -8 - rng() * 12, 1.6, 1.6); g.fill(); g.fillStyle = '#fff6c8'; ov(g, (rng() - .5) * 24, -8 - rng() * 12, .6, .6); g.fill(); }
  }}),
  rock: seed => makeProp({w:40, h:28, ax:20, ay:24, seed, shadow:[15, 4], collide:9, paint(g, rng){
    g.fillStyle = PAL.stoneD; pv(g, [-14, 0, -16, -8, -9, -16, 2, -19, 12, -14, 16, -5, 13, 0]); g.fill();
    g.fillStyle = PAL.stone; pv(g, [-13, -2, -14, -8, -8, -15, 2, -17, 10, -13, 12, -6, 4, -4]); g.fill();
    g.fillStyle = PAL.stoneL; pv(g, [-10, -9, -7, -14, 1, -16, -2, -11]); g.fill();
    g.fillStyle = PAL.moss; ov(g, -4, -16, 6, 2); g.fill(); ov(g, 8, -13, 3, 1.4); g.fill();
  }}),
  hay: seed => makeProp({w:46, h:46, ax:23, ay:42, seed, shadow:[18, 6], collide:13, paint(g, rng){
    g.fillStyle = PAL.strawD; ov(g, 0, -12, 17, 13); g.fill();
    g.fillStyle = PAL.straw; ov(g, -1, -15, 15, 13); g.fill();
    g.fillStyle = PAL.strawL; ov(g, -5, -20, 8, 6); g.fill();
    g.strokeStyle = PAL.strawD; g.lineWidth = .7;
    for (let i = 0; i < 40; i++){ const a = rng() * 3.14 + 3.14, d = rng() * 14; const x = Math.cos(a) * d, y = -12 + Math.sin(a) * d * .9; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rng() - .5) * 3, y + 3); g.stroke(); }
    g.fillStyle = PAL.barkM; g.fillRect(-.8, -36, 1.6, 10);
    g.fillStyle = PAL.strawD; pv(g, [-4, -26, 0, -31, 4, -26]); g.fill();
  }}),
  jar: seed => makeProp({w:22, h:24, ax:11, ay:21, seed, shadow:[8, 3], collide:6, paint(g){
    g.fillStyle = '#4a2a18'; ov(g, 0, -8, 8, 8); g.fill();
    g.fillStyle = '#6e3e22'; ov(g, -1, -9, 6.8, 7); g.fill();
    g.fillStyle = '#c9893e'; g.fillRect(-7, -10, 14, 1.6);
    g.fillStyle = '#e6b25e'; for (let i = -6; i < 7; i += 3){ ov(g, i, -9.2, .8, .6); g.fill(); }
    g.fillStyle = '#3a2214'; g.fillRect(-4, -17, 8, 2.4);
    g.fillStyle = 'rgba(255,240,210,.55)'; ov(g, -3.5, -11, 1.4, 2.6, -.4); g.fill();
  }}),
  lamp: seed => makeProp({w:20, h:46, ax:10, ay:42, seed, shadow:[5, 2], collide:4, glow:[0, -30, 46], paint(g){
    plank(g, -1.2, -38, 2.4, 38, PAL.barkM, PAL.barkL, PAL.barkD);
    g.fillStyle = PAL.barkD; g.fillRect(-1.2, -38, 7, 1.6);
    g.strokeStyle = '#2e1c10'; g.lineWidth = .6; g.beginPath(); g.moveTo(5, -36.5); g.lineTo(5, -33); g.stroke();
    g.fillStyle = '#c0392b'; ov(g, 5, -29, 3.6, 4.4); g.fill();
    g.fillStyle = '#f5b35c'; ov(g, 4.2, -30, 2, 2.8); g.fill();
    g.fillStyle = PAL.gold; g.fillRect(2.4, -33.6, 5.2, 1); g.fillRect(2.4, -25, 5.2, 1);
    g.strokeStyle = PAL.gold; g.beginPath(); g.moveTo(5, -24); g.lineTo(5, -21); g.stroke();
  }}),
  fence: seed => makeProp({w:52, h:22, ax:26, ay:18, seed, collide:0, paint(g, rng){
    for (let x = -22; x <= 22; x += 5.5){ const h = 13 + rng() * 3;
      g.fillStyle = '#b8a05a'; g.fillRect(x - 1.3, -h, 2.6, h); g.fillStyle = '#e1cd85'; g.fillRect(x - 1.3, -h, .8, h);
      g.fillStyle = '#7d6a32'; g.fillRect(x - 1.3, -h + 3, 2.6, .7); }
    g.fillStyle = '#9a8344'; g.fillRect(-24, -10, 48, 1.8); g.fillRect(-24, -5, 48, 1.8);
  }}),
  sign: seed => makeProp({w:50, h:40, ax:25, ay:36, seed, shadow:[8, 3], collide:4, paint(g){
    plank(g, -1.4, -26, 2.8, 26, PAL.barkM, PAL.barkL, PAL.barkD);
    plank(g, -20, -34, 40, 13, PAL.teakM, PAL.teakL, PAL.teakD);
    g.fillStyle = PAL.gold; g.fillRect(-20, -34, 40, 1); g.fillRect(-20, -22, 40, 1);
    g.fillStyle = '#fff3d6'; g.font = '600 8.5px "Mali",sans-serif'; g.textAlign = 'center'; g.fillText('อาเรน', 0, -24.6);
  }}),
  spirit: seed => makeProp({w:40, h:62, ax:20, ay:58, seed, shadow:[10, 3], collide:7, paint(g){
    // ศาลพระภูมิ: lotus-based pillar wrapped in a garland, railed terrace with an elephant figurine and red soda, little gilt house, two-tier roof with ช่อฟ้า
    plank(g, -5.5, -4, 11, 4, PAL.whiteD, PAL.white, '#a99b7c'); g.fillStyle = PAL.white; g.beginPath(); g.arc(0, -4, 4, Math.PI, 0); g.fill();
    plank(g, -2.4, -31, 4.8, 24, PAL.white, '#ffffff', PAL.whiteD); g.fillStyle = PAL.gold; g.fillRect(-2.4, -16, 4.8, .8); g.fillRect(-3.4, -32, 6.8, 1.6);
    for (let i = 0; i < 7; i++){ g.fillStyle = i % 2 ? '#f39c27' : '#ffd45a'; ov(g, Math.sin(i * 1.3) * .6, -29 + i * 2, 1.4, 1.1); g.fill(); }
    g.fillStyle = '#e74c3c'; ov(g, 0, -14.6, 1.1, 1.5); g.fill();
    plank(g, -13, -34.5, 26, 3, PAL.white, '#ffffff', PAL.whiteD); g.fillStyle = PAL.gold; g.fillRect(-13, -34.5, 26, .8);
    // house body: gold door frame, red door, white walls
    plank(g, -8, -46, 16, 11.5, PAL.white, '#ffffff', PAL.whiteD);
    g.fillStyle = PAL.gold; g.fillRect(-3.4, -44, 6.8, 9.5); g.fillStyle = '#8e2a22'; g.fillRect(-2.4, -43, 4.8, 8.5); g.fillStyle = PAL.gold; g.fillRect(-.3, -43, .6, 8.5);
    g.fillStyle = PAL.gold; pv(g, [-4, -44, 0, -47, 4, -44]); g.fill();
    // figurines + offerings on the terrace, then the rail
    g.fillStyle = '#8d8a80'; ov(g, -9.5, -37, 2.4, 1.6); g.fill(); ov(g, -11.6, -37.6, 1.2, 1.4); g.fill(); g.fillRect(-11, -36, .8, 1.4); g.fillRect(-8.4, -36, .8, 1.4);
    g.fillStyle = '#d0281e'; g.fillRect(9, -39.5, 1.8, 4.8); g.fillStyle = '#ffffff'; g.fillRect(9.8, -41.6, .45, 2.4);
    g.fillStyle = '#f5f0e0'; ov(g, 6, -38.8, .8, .8); g.fill(); g.fillStyle = PAL.gold; pv(g, [5.2, -38, 6.8, -38, 7.2, -35, 4.8, -35]); g.fill();
    g.fillStyle = PAL.gold; g.fillRect(-13, -39.2, 26, .7); for (let x = -12.6; x <= 12.6; x += 2.52) g.fillRect(x - .3, -39.2, .6, 4.7);
    // roof: tiled lower tier with หางหงส์, gilt upper gable with ใบระกา and ช่อฟ้า
    g.fillStyle = PAL.roofD; pv(g, [-12.5, -45, -6, -50.5, 6, -50.5, 12.5, -45]); g.fill(); g.fillStyle = PAL.roofM; pv(g, [-11.5, -45.6, -6, -50, 6, -50, 11.5, -45.6, 0, -47]); g.fill();
    g.fillStyle = PAL.tileG; g.fillRect(-6, -50.6, 12, 1.2);
    hangHong(g, -12.5, -45, -1, PAL.gold); hangHong(g, 12.5, -45, 1, PAL.gold);
    g.fillStyle = '#8e2a22'; pv(g, [-7, -49.5, 0, -55, 7, -49.5]); g.fill(); g.fillStyle = PAL.gold; ov(g, 0, -51.4, 1.2, 1.2); g.fill();
    barge(g, -8, -49, 0, -55.4, 1.2, 3); barge(g, 8, -49, 0, -55.4, 1.2, 3); chofa(g, 0, -55, 2.6, PAL.gold);
  }}),
  house: (seed, v = 0) => makeProp({w:130, h:132, ax:65, ay:124, seed, shadow:[58, 14], collide:38, paint(g, rng){
    // เรือนไทย: tapered posts over an open ใต้ถุน, ฝาปะกน panel walls leaning in (สอบเข้า), steep tiled roof, sun-ray gable, ป้านลม with ตัวเหงา.
    // Odd variants are a Lanna เรือนกาแล: walls flaring out, lower roof, crossed กาแล at the apex, carved หำยนต์ over the door.
    const lan = v % 2 === 1, W = lan ? ['#5e3a1c', '#86562f', '#a9774a', '#c99766'] : [PAL.teakD, PAL.teakM, PAL.teakL, PAL.teakH];
    const lean = lan ? -.06 : .065, wx = (x, y) => x * (1 - (-35 - y) / 39 * lean);   // wall x at height y
    // ใต้ถุน: shade, posts, a bamboo bench (แคร่) and a water jar
    g.fillStyle = 'rgba(40,25,15,.38)'; g.fillRect(-46, -31, 92, 29);
    for (const x of [-42, -15, 15, 42]){ const k = x * .03; g.fillStyle = '#3a2210'; pv(g, [x - 2.7, 0, x + 2.7, 0, x + 2 - k, -32, x - 2 - k, -32]); g.fill();
      g.fillStyle = W[1]; pv(g, [x - 2.7, 0, x - 1, 0, x - .5 - k, -32, x - 2 - k, -32]); g.fill(); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x - 3, -1.5, 6, 1.5); }
    plank(g, -38, -9, 20, 2.2, '#c9b26a', '#e6d08a', '#8a7840'); g.fillStyle = '#8a7840'; for (let x = -36; x < -18; x += 3) g.fillRect(x, -8.6, .4, 1.6);
    for (const x of [-36.5, -21]) plank(g, x, -7, 1.6, 7, '#a8924e', '#c9b26a', '#6e5e30');
    ong(g, -6, 0, .9);
    // stair with a foot-washing jar and ladle at its foot
    g.fillStyle = W[0]; pv(g, [44, 0, 46.5, 0, 57.5, -31, 55, -31]); g.fill();
    for (let i = 0; i < 5; i++){ const y = -4 - i * 5.8; plank(g, 45 - y / 31 * 11, y - 1, 9, 2, W[2], W[3], W[0]); }
    g.fillStyle = W[1]; pv(g, [52, 0, 54.5, 0, 64.5, -29, 62, -29]); g.fill();
    ong(g, 36, 0, .8); g.fillStyle = '#c9a24a'; ov(g, 36.5, -9.4, 1.8, .8); g.fill(); g.fillRect(37.5, -10, 3, .5);
    // floor beam with joist ends, pots on the open ends of the floor
    plank(g, -54, -36, 108, 5, W[1], W[2], W[0]); g.fillStyle = W[0]; for (let x = -50; x <= 48; x += 8) g.fillRect(x, -31, 3, 2);
    potPlant(g, -50, -36, rng); potPlant(g, 49, -36, rng, '#f7d046');
    // ฝาปะกน: framed raised panels, wall leaning with the house style
    g.fillStyle = W[0]; pv(g, [-46, -35, 46, -35, wx(46, -74), -74, wx(-46, -74), -74]); g.fill();
    for (let c = 0; c < 8; c++) for (let r = 0; r < 3; r++){ const x0 = -45 + c * 11.25 + 1.1, x1 = x0 + 9, y0 = -72.5 + r * 12.5 + 1, y1 = y0 + 10.3;
      g.fillStyle = W[2]; pv(g, [wx(x0, y1), y1, wx(x1, y1), y1, wx(x1, y0), y0, wx(x0, y0), y0]); g.fill();
      g.fillStyle = W[3]; g.fillRect(wx(x0, y0), y0, wx(x1, y0) - wx(x0, y0), .6); g.fillStyle = W[0]; g.fillRect(wx(x0, y1), y1 - .6, wx(x1, y1) - wx(x0, y1), .6);
      grain(g, wx(x0, y0) + .5, y0 + .8, 8, 9, rng, 2); }
    // door: open leaves, lintel, carved vent (or Lanna หำยนต์)
    g.fillStyle = '#24130a'; g.fillRect(-7, -63, 14, 28); g.fillStyle = 'rgba(240,195,92,.22)'; g.fillRect(-4.5, -58, 9, 21);
    for (const x of [-13.5, 7.3]){ plank(g, x, -63, 6.2, 28, W[2], W[3], W[0]); g.fillStyle = W[1]; g.fillRect(x + 1.2, -60, 3.8, 10); g.fillRect(x + 1.2, -47, 3.8, 10); }
    plank(g, -10, -66, 20, 3, W[1], W[3], W[0]);
    if (lan){ g.fillStyle = W[3]; pv(g, [-10, -66, 10, -66, 7, -71, 0, -73, -7, -71]); g.fill(); g.strokeStyle = W[0]; g.lineWidth = .6;
      for (const s of [-1, 1]){ g.beginPath(); g.arc(s * 4.5, -68.6, 1.6, 0, 5); g.stroke(); } g.fillStyle = W[0]; ov(g, 0, -69.5, 1, 1.4); g.fill(); }
    else { g.fillStyle = '#24130a'; for (let i = 0; i < 5; i++){ ov(g, -6 + i * 3, -69.6, .9, 1.4); g.fill(); } }
    // windows: open shutters, warm lamplit interior, carved หย่อง with balusters under the sill
    for (const x of [-35, 23]){ g.fillStyle = '#24130a'; g.fillRect(x, -64, 12, 14); g.fillStyle = '#f0c35c'; g.fillRect(x + 1.5, -61, 9, 9); g.fillStyle = '#c98a3a'; g.fillRect(x + 1.5, -55, 9, 3);
      plank(g, x - 5.2, -64, 5, 14, W[2], W[3], W[0]); plank(g, x + 12.2, -64, 5, 14, W[2], W[3], W[0]);
      g.fillStyle = W[0]; g.fillRect(x - 1, -66, 14, 2); plank(g, x - 1, -50, 14, 1.6, W[1], W[3], W[0]);
      g.fillStyle = W[1]; g.fillRect(x, -48.4, 12, 4); g.fillStyle = W[0]; for (let i = 1; i < 6; i++) g.fillRect(x + i * 2 - .4, -48.4, .9, 4); }
    // roof: tiled slopes (กระเบื้องดินขอ) seen past the gable
    const ay = lan ? -109 : -121, ey = lan ? -70 : -64, ex = 62, gb = -73, T = [PAL.roofM, PAL.roofL, PAL.roofD];
    g.fillStyle = PAL.roofD; pv(g, [-ex, ey, 0, ay - 3, ex, ey, ex - 6, ey + 4, -ex + 6, ey + 4]); g.fill();
    roofBand(g, -ex + 9, ey + 1, 0, ay + 7, 11, T, 13); roofBand(g, ex - 9, ey + 1, 0, ay + 7, 11, T, 13);
    g.fillStyle = 'rgba(255,220,180,.25)'; for (let i = 0; i < 9; i++){ const t = i / 9; ov(g, -ex + 1 + ex * t * .98, ey - (ey - ay) * t, .8, .8); g.fill(); }   // tile ends along the eave line
    // gable (หน้าจั่ว): sun-ray boards (จั่วรูปพระอาทิตย์) or Lanna vertical boards
    const gx = 44, gt = ay + 7, edge = t => t < .5 ? [-gx + gx * 2 * t, gb + (gt - gb) * t * 2] : [gx * (2 * t - 1), gt + (gb - gt) * (2 * t - 1)];
    g.fillStyle = W[2]; pv(g, [-gx, gb, 0, gt, gx, gb]); g.fill();
    if (lan){ g.save(); pv(g, [-gx, gb, 0, gt, gx, gb]); g.clip(); g.fillStyle = W[1]; for (let x = -42; x < 42; x += 6) g.fillRect(x, gt, 3, gb - gt); grain(g, -42, gt, 84, gb - gt, rng, 26); g.restore(); }
    else { for (let i = 0; i < 14; i++){ const a = edge(i / 14), b = edge((i + 1) / 14); g.fillStyle = i % 2 ? W[3] : W[2]; pv(g, [0, gb, a[0], a[1], b[0], b[1]]); g.fill(); }
      g.fillStyle = W[1]; g.beginPath(); g.arc(0, gb, 7, Math.PI, 0); g.fill(); g.fillStyle = W[3]; g.beginPath(); g.arc(0, gb, 4.4, Math.PI, 0); g.fill(); }
    plank(g, -48, gb - 1, 96, 3, W[1], W[3], W[0]);
    // ป้านลม barge boards: ตัวเหงา ends, or the Lanna crossed กาแล
    const bx = 50, by = ey - 1;
    for (const s of [-1, 1]){ g.strokeStyle = W[3]; g.lineWidth = 3.2; g.beginPath(); g.moveTo(s * bx, by); g.lineTo(0, ay); g.stroke();
      g.strokeStyle = W[0]; g.lineWidth = .8; g.beginPath(); g.moveTo(s * (bx - 1), by + 2); g.lineTo(0, ay + 3); g.stroke(); tuaNgao(g, s * bx, by, s, W[3]); }
    if (lan){ g.strokeStyle = W[3]; g.lineWidth = 3; g.beginPath(); g.moveTo(-6, ay + 5); g.lineTo(9, -123); g.moveTo(6, ay + 5); g.lineTo(-9, -123); g.stroke();
      g.strokeStyle = W[0]; g.lineWidth = .7; g.beginPath(); g.moveTo(-4, ay + 2); g.lineTo(8, -120); g.moveTo(4, ay + 2); g.lineTo(-8, -120); g.stroke(); }
    else { g.fillStyle = W[3]; pv(g, [-2.4, ay + 1, 0, ay - 2.6, 2.4, ay + 1]); g.fill(); }
  }}),
  shrine: seed => makeProp({w:170, h:178, ax:85, ay:168, seed, shadow:[74, 16], collide:46, paint(g, rng){
    // อุโบสถ seen from the front: ฐานสิงห์ plinth, บันไดนาค, ใบเสมา markers, ย่อมุม columns with บัวหัวเสา + กาบพรหมศร, red doors with gold ลายรดน้ำ,
    // two layered gables (ซ้อน) with ช่อฟ้า ใบระกา นาคสะดุ้ง หางหงส์ over a gilt หน้าบัน, ลด side roofs on คันทวย brackets, green-bordered orange tiles
    const RED = '#7a1c18', REDL = '#a03024', REDD = '#4e100c', TILE = [PAL.roofM, PAL.roofL, PAL.roofD], GRN = [PAL.tileG, PAL.tileGL, '#284a34'];
    for (const sx of [-77, 77]){ plank(g, sx - 5, -4, 10, 4, PAL.whiteD, PAL.white, '#a99b7c');   // ใบเสมา
      g.fillStyle = '#c8bc9e'; g.beginPath(); g.moveTo(sx - 3.4, -4); g.lineTo(sx - 3.4, -11); g.quadraticCurveTo(sx - 3.4, -16, sx, -19); g.quadraticCurveTo(sx + 3.4, -16, sx + 3.4, -11); g.lineTo(sx + 3.4, -4); g.fill();
      g.fillStyle = '#e6dcc0'; g.fillRect(sx - 3.4, -11, 1.2, 7); g.fillStyle = PAL.gold; ov(g, sx, -10, 1.2, 1.6); g.fill(); }
    // ฐานสิงห์: plain course, recessed waist, lotus lip, top course; เท้าสิงห์ curls at the corners
    plank(g, -68, -6, 136, 6, PAL.whiteD, PAL.white, '#a99b7c'); g.fillStyle = '#b3a586'; g.fillRect(-64, -11, 128, 5);
    plank(g, -66, -14, 132, 3, PAL.white, '#ffffff', PAL.whiteD); g.fillStyle = PAL.gold; g.fillRect(-66, -14, 132, .9);
    plank(g, -61, -24, 122, 10, PAL.white, '#ffffff', PAL.whiteD); g.fillStyle = '#ddd2b8'; for (let x = -59; x < 59; x += 5){ g.beginPath(); g.arc(x + 2.5, -14, 2.2, Math.PI, 0); g.fill(); }
    g.fillStyle = PAL.gold; g.fillRect(-61, -24, 122, 1.2);
    g.strokeStyle = PAL.whiteD; g.lineWidth = 1.4; for (const s of [-1, 1]){ g.beginPath(); g.moveTo(s * 64, -6); g.quadraticCurveTo(s * 70, -8, s * 66.5, -11.5); g.stroke(); }
    for (let i = 0; i < 4; i++){ plank(g, -14 + i, -6 * i - 6, 28 - 2 * i, 6, PAL.white, '#ffffff', PAL.whiteD); g.fillStyle = 'rgba(150,130,100,.35)'; g.fillRect(-14 + i, -6 * i - 1.2, 28 - 2 * i, 1.2); }
    // walls: lime-white with rain streaks, window shutters under small ซุ้ม crowns
    plank(g, -52, -80, 104, 56, PAL.white, '#ffffff', PAL.whiteD); g.fillStyle = PAL.whiteD; g.fillRect(-52, -30, 104, 6);
    g.fillStyle = 'rgba(120,100,70,.13)'; for (let i = 0; i < 8; i++) g.fillRect(-50 + rng() * 98, -78 + rng() * 8, .8, 8 + rng() * 16);
    for (const s of [-1, 1]){ const x = s * 35; g.fillStyle = PAL.gold; pv(g, [x - 6, -62, x, -73, x + 6, -62]); g.fill(); g.fillStyle = RED; pv(g, [x - 4, -62.6, x, -69.6, x + 4, -62.6]); g.fill();
      plank(g, x - 4.5, -61, 9, 16, RED, REDL, REDD); g.fillStyle = PAL.gold; g.fillRect(x - .4, -61, .8, 16); g.fillRect(x - 4.5, -61, 9, .8); g.fillRect(x - 4.5, -45.8, 9, .8);
      g.fillStyle = PAL.goldL; ov(g, x - 2.2, -53, 1, 1.6); g.fill(); ov(g, x + 2.2, -53, 1, 1.6); g.fill(); }
    // door under a pointed ซุ้มบันแถลง crown; red lacquer leaves with a gold lattice (ลายรดน้ำ)
    const arch = (w, top) => { g.beginPath(); g.moveTo(-w, -64); g.quadraticCurveTo(-w + 1, -64 - (top - 64) * .7, 0, -top); g.quadraticCurveTo(w - 1, -64 - (top - 64) * .7, w, -64); g.closePath(); };
    g.fillStyle = PAL.gold; arch(15, 81); g.fill(); g.fillStyle = RED; arch(11.5, 76.5); g.fill(); g.fillStyle = PAL.goldL; ov(g, 0, -69.5, 2, 2.6); g.fill();
    g.fillStyle = PAL.gold; for (let i = 0; i < 6; i++){ const t = (i + .5) / 6, a = Math.PI * (1 - t); pv(g, [-15 * Math.cos(a) * .95, -66 - 13 * Math.sin(a), -16.5 * Math.cos(a), -68 - 14.6 * Math.sin(a), -14 * Math.cos(a), -67 - 14 * Math.sin(a)]); g.fill(); }
    plank(g, -10, -64, 20, 40, RED, REDL, REDD);
    g.save(); g.beginPath(); g.rect(-9, -62, 18, 36); g.clip(); g.strokeStyle = 'rgba(227,176,75,.75)'; g.lineWidth = .5;
    for (let k = -40; k < 40; k += 4){ g.beginPath(); g.moveTo(-10, -62 + k); g.lineTo(10, -42 + k); g.moveTo(10, -62 + k); g.lineTo(-10, -42 + k); g.stroke(); } g.restore();
    g.fillStyle = PAL.gold; g.fillRect(-10, -64, 20, 1); g.fillRect(-.6, -63, 1.2, 39); g.fillRect(-10, -25.5, 20, 1);
    // ย่อมุม columns with กาบพรหมศร sheaths and บัวหัวเสา lotus capitals
    for (const cx of [-44, -26, 26, 44]){ plank(g, cx - 3.4, -82, 6.8, 58, '#8e2a22', '#b8473a', '#5e1712'); g.fillStyle = '#6e1e18'; g.fillRect(cx + 1.4, -82, .8, 58);
      g.fillStyle = PAL.gold; pv(g, [cx - 3.4, -24, cx, -33, cx + 3.4, -24]); g.fill(); pv(g, [cx - 3.4, -82, cx, -73, cx + 3.4, -82]); g.fill();
      g.fillStyle = PAL.goldD; g.fillRect(cx - 4.4, -84, 8.8, 2.2); g.fillStyle = PAL.gold; for (let k = -1; k <= 1; k++){ ov(g, cx + k * 2.7, -85.6, 1.6, 2.4); g.fill(); } }
    // lotus vases on the plinth by the door
    for (const ox of [-18, 18]){ g.fillStyle = PAL.goldD; pv(g, [ox - 2.4, -24, ox + 2.4, -24, ox + 1.6, -29, ox + 2.6, -31, ox - 2.6, -31, ox - 1.6, -29]); g.fill();
      g.fillStyle = PAL.leafM; g.fillRect(ox - .3, -36, .6, 5); g.fillStyle = '#f2a0b8'; ov(g, ox, -37.5, 1.6, 2.4); g.fill(); ov(g, ox - 2.4, -35, 1.2, 1.8, -.4); g.fill(); ov(g, ox + 2.4, -35, 1.2, 1.8, .4); g.fill(); }
    // rear (taller) gable: tiles, red face, gilt barge, ช่อฟ้า
    const RA = -150, RE = -96, FA = -137, FE = -87;
    for (const s of [-1, 1]){ roofBand(g, s * 58, RE, 0, RA, 9, GRN, 14); roofBand(g, s * 58, RE, 0, RA, 6.5, TILE, 14); }
    g.fillStyle = RED; pv(g, [-56, RE, 0, RA, 56, RE]); g.fill();
    for (const s of [-1, 1]) barge(g, s * 58, RE, 0, RA, 2.4, 10);
    chofa(g, 0, RA, 15, PAL.gold);
    // ลด side roofs stepping down past the walls, carried on คันทวย brackets
    for (const s of [-1, 1]){ g.strokeStyle = PAL.gold; g.lineWidth = 1.6; g.beginPath(); g.moveTo(s * 52, -66); g.quadraticCurveTo(s * 54, -78, s * 70, -80); g.stroke();
      g.fillStyle = PAL.goldD; ov(g, s * 52.5, -66, 1.4, 1.4); g.fill();
      roofBand(g, s * 79, -79, s * 48, -100, 8.5, GRN, 9); roofBand(g, s * 79, -79, s * 48, -100, 6, TILE, 9);
      g.fillStyle = RED; pv(g, [s * 74, -79, s * 50, -95, s * 50, -79]); g.fill(); g.fillStyle = PAL.gold; g.fillRect(s > 0 ? 50 : -74, -80.5, 24, 1.5);
      barge(g, s * 79, -79, s * 48, -100, 2.2, 6); hangHong(g, s * 79, -79, s, PAL.gold); }
    // front gable (มุขลด): คอสอง frieze, gilt หน้าบัน (Garuda medallion + ลายกนก scrolls), barge, หางหงส์, ช่อฟ้า
    plank(g, -53, FE + 1, 106, 5, RED, REDL, REDD); g.fillStyle = PAL.gold; g.fillRect(-53, FE + 1, 106, .8); g.fillRect(-53, FE + 5.2, 106, .8);
    for (let x = -50; x <= 50; x += 5){ pv(g, [x, FE + 3.5, x + 1.2, FE + 2.3, x + 2.4, FE + 3.5, x + 1.2, FE + 4.7]); g.fill(); }   // ลายประจำยาม
    for (const s of [-1, 1]){ roofBand(g, s * 56, FE, 0, FA, 8.5, GRN, 13); roofBand(g, s * 56, FE, 0, FA, 6, TILE, 13); }
    g.fillStyle = RED; pv(g, [-54, FE + 1, 0, FA + 1, 54, FE + 1]); g.fill();
    g.strokeStyle = PAL.gold; g.lineWidth = .9; g.beginPath(); g.moveTo(-44, FE - 2); g.lineTo(0, FA + 9); g.lineTo(44, FE - 2); g.closePath(); g.stroke();
    g.fillStyle = PAL.gold; g.beginPath(); g.moveTo(-3, -104); g.quadraticCurveTo(-14, -110, -21, -100); g.quadraticCurveTo(-12, -103, -4, -98); g.fill();
    g.beginPath(); g.moveTo(3, -104); g.quadraticCurveTo(14, -110, 21, -100); g.quadraticCurveTo(12, -103, 4, -98); g.fill();   // Garuda wings
    ov(g, 0, -103, 5.4, 6.4); g.fill(); g.fillStyle = RED; ov(g, 0, -103, 3.6, 4.6); g.fill(); g.fillStyle = PAL.goldL; ov(g, 0, -104.4, 1.6, 1.8); g.fill(); g.fillRect(-1.2, -102.8, 2.4, 3.4);
    pv(g, [-1.6, -108.4, 0, -114, 1.6, -108.4]); g.fill();
    g.strokeStyle = PAL.gold; g.lineWidth = .9;
    for (const [x, y, r] of [[-14, -93, 3.2], [14, -93, 3.2], [-28, -92, 2.6], [28, -92, 2.6], [-38, -90.5, 1.8], [38, -90.5, 1.8], [-10, -114, 2], [10, -114, 2]]){
      const d = x < 0 ? -1 : 1; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 1.5, d < 0); g.stroke(); g.beginPath(); g.moveTo(x + d * r, y); g.quadraticCurveTo(x + d * r * 1.8, y - r * 1.4, x + d * r * 2.4, y - r * 2); g.stroke(); }
    for (const s of [-1, 1]){ barge(g, s * 56, FE, 0, FA, 2.6, 11); hangHong(g, s * 56, FE, s, PAL.gold); }
    chofa(g, 0, FA, 11, PAL.gold);
    // บันไดนาค: gilt naga bodies down the stair rails, five-headed hoods at the foot
    for (const s of [-1, 1]){ g.strokeStyle = PAL.goldD; g.lineWidth = 3.4; g.beginPath(); g.moveTo(s * 13.5, -25); g.quadraticCurveTo(s * 15, -12, s * 17.5, -5); g.stroke();
      g.strokeStyle = PAL.gold; g.lineWidth = 2; g.stroke(); g.fillStyle = '#2f6a48'; for (let k = 0; k < 4; k++){ ov(g, s * (14 + k * .9), -21 + k * 4.4, .6, .9); g.fill(); }
      g.fillStyle = PAL.goldD; g.fillRect(s * 18.5 - 3, -5, 6, 5);
      g.fillStyle = PAL.gold; for (let k = 0; k < 5; k++){ const a = -2.7 + k * .55; ov(g, s * 18.5 + Math.cos(a) * 4.4, -11 + Math.sin(a) * 4.4, 1.7, 1.7); g.fill(); }
      g.fillStyle = PAL.goldD; ov(g, s * 18.5, -9.5, 3.4, 4.4); g.fill(); g.fillStyle = PAL.goldL; ov(g, s * 18.5, -10, 2, 3); g.fill(); g.fillStyle = REDD; ov(g, s * 17.6, -12, .5, .5); g.fill(); ov(g, s * 19.4, -12, .5, .5); g.fill(); }
  }})
};

/* ---------- placement ---------- */
const PROPS = [];
const propCache = {};
function propImg(type, variant = 0){ const k = type + variant; return propCache[k] || (propCache[k] = PROP_TYPES[type](1000 + variant * 7919 + type.length * 31, variant)); }
function addProp(type, x, y, variant = 0){
  const p = {type, x, y, variant};
  PROPS.push(p);
  const im = propImg(type, variant);
  if (im.collide) obstacles.push({x, y, r:im.collide, prop:p});
  return p;
}
