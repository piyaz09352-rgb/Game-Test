/* VAYRATHEN — js/world/arenbloom.js — (v83) the garden of Aren's town square: lawns between the temple court and the
   ring road, round flower beds edging the court, frangipani (ลีลาวดี) trees, clipped flowering hedges, bougainvillea
   bushes and lotus bowls. The four gate paths and the temple's brick court stay open. Loaded after village2.js. */
'use strict';

const BLOOM = {
  in:166, out:254,                                   // the lawn ring round the paved court
  gates:ARC_GATES, temple:[236, 304],                // keep the paths and the temple court clear
  colors:[['#ff5c8a', '#ffb3c8'], ['#ffd23f', '#fff1a8'], ['#e0453a', '#ff9a7a'], ['#a46ce8', '#dcc4ff'], ['#ffffff', '#fff6dc'], ['#ff9a2e', '#ffd29a']]
};
const bloomAng = (x, y) => (Math.atan2(y - ARC.y, x - ARC.x) * 180 / Math.PI + 360) % 360;
const bloomOpen = (d, pad = 12) => BLOOM.gates.some(g => Math.abs(((d - g + 540) % 360) - 180) < pad) || (d > BLOOM.temple[0] && d < BLOOM.temple[1]);

function bloomFlower(g, x, y, r, c){   // a five-petal flower with a bright heart
  g.fillStyle = c[0]; for (let k = 0; k < 5; k++){ const a = k * 1.2566 - 1.57; ov(g, x + Math.cos(a) * r * .62, y + Math.sin(a) * r * .55, r * .52, r * .46); g.fill(); }
  g.fillStyle = c[1]; ov(g, x - r * .18, y - r * .2, r * .3, r * .26); g.fill();
  g.fillStyle = '#ffe36a'; ov(g, x, y, r * .26, r * .24); g.fill();
}

Object.assign(PROP_TYPES, {
  // a round raised bed: laterite brick rim, dark soil, leafy mounds and a crowd of flowers in one colour (+ white)
  flowerbed: (seed, v = 0) => makeProp({w:70, h:40, ax:35, ay:30, seed, shadow:[30, 8], paint(g, rng){
    const c = BLOOM.colors[v % BLOOM.colors.length];
    g.fillStyle = '#9a4a2c'; ov(g, 0, -2, 30, 11); g.fill(); g.fillStyle = '#c8683e'; ov(g, 0, -4, 30, 10); g.fill();
    for (let a = 0; a < 6.28; a += .42){ g.fillStyle = 'rgba(255,214,170,.5)'; ov(g, Math.cos(a) * 27, -4 + Math.sin(a) * 8.4, 2.2, 1.2); g.fill(); }
    g.fillStyle = '#5a3c24'; ov(g, 0, -5, 26, 7.6); g.fill();
    for (const [x, y, r] of [[-15, -9, 7], [0, -12, 9], [15, -9, 7], [-7, -6, 6], [8, -6, 6]]) leafCluster(g, x, y, r, rng);
    for (let i = 0; i < 22; i++){ const a = rng() * 6.28, d = Math.sqrt(rng()), x = Math.cos(a) * d * 22, y = -10 + Math.sin(a) * d * 6 - rng() * 5;
      bloomFlower(g, x, y, 2.2 + rng() * 1.1, rng() < .2 ? BLOOM.colors[4] : c); }
  }}),
  // a clipped hedge with small blossoms
  hedge: (seed, v = 0) => makeProp({w:46, h:30, ax:23, ay:24, seed, shadow:[19, 5], paint(g, rng){
    g.fillStyle = PAL.leafD; pv(g, [-18, 0, -19, -11, -14, -16, 14, -16, 19, -11, 18, 0]); g.fill();
    g.fillStyle = PAL.leafM; pv(g, [-16, -3, -17, -11, -13, -15, 13, -15, 17, -11, 16, -3]); g.fill();
    g.fillStyle = PAL.leafL; pv(g, [-14, -12, -12, -15, 12, -15, 14, -12]); g.fill();
    for (let i = 0; i < 26; i++){ g.fillStyle = rng() < .5 ? PAL.leafH : PAL.leafD; ov(g, -16 + rng() * 32, -14 + rng() * 12, 1.4, 1); g.fill(); }
    const c = BLOOM.colors[(v + 3) % BLOOM.colors.length];
    for (let i = 0; i < 7; i++) bloomFlower(g, -13 + rng() * 26, -13 + rng() * 8, 1.6, c);
  }}),
  // frangipani: a grey forked trunk, fat leaf clumps and creamy five-petal flowers (variant 1: pink)
  frangipani: (seed, v = 0) => makeProp({w:96, h:104, ax:48, ay:96, seed, shadow:[28, 9], collide:9, paint(g, rng){
    g.fillStyle = '#8a7e72'; pv(g, [-4, 0, -3, -24, -16, -44, -12, -46, -1, -30, 2, -34, 14, -50, 18, -47, 5, -26, 5, 0]); g.fill();
    g.fillStyle = '#b5aa9c'; g.fillRect(-3, -22, 1.4, 20); g.fillStyle = '#6a6056'; pv(g, [2, 0, 3, -24, 5, 0]); g.fill();
    const cl = [[-18, -56, 15], [16, -60, 16], [0, -70, 14], [-30, -48, 10], [30, -50, 10], [-4, -50, 11]];
    for (const [x, y, r] of cl) leafCluster(g, x, y, r, rng);
    const c = v === 1 ? ['#ff8fb8', '#ffd2e2'] : ['#fff8ea', '#ffffff'];
    for (const [x, y, r] of cl) for (let i = 0; i < 5; i++){ const a = rng() * 6.28, d = rng() * r * .7; bloomFlower(g, x + Math.cos(a) * d, y - r * .3 + Math.sin(a) * d * .6, 2.6, c); }
  }}),
  // bougainvillea: a big mounded bush covered in magenta bracts
  bougain: (seed, v = 0) => makeProp({w:60, h:48, ax:30, ay:40, seed, shadow:[22, 7], collide:8, paint(g, rng){
    for (const [x, y, r] of [[-11, -14, 12], [11, -14, 12], [0, -22, 13]]) leafCluster(g, x, y, r, rng);
    const c = v === 1 ? ['#ff7a3a', '#ffc49a'] : ['#e8338a', '#ff9ccb'];
    for (let i = 0; i < 34; i++){ const a = rng() * 6.28, d = Math.sqrt(rng()); const x = Math.cos(a) * d * 22, y = -18 + Math.sin(a) * d * 13;
      g.fillStyle = rng() < .6 ? c[0] : c[1]; ov(g, x, y, 2.2, 1.8, rng() * 3); g.fill(); }
  }}),
  // a glazed water bowl with lotus pads and one pink lotus (อ่างบัว)
  lotusbowl: seed => makeProp({w:44, h:38, ax:22, ay:32, seed, shadow:[17, 5], collide:9, paint(g, rng){
    g.fillStyle = '#2f5f74'; pv(g, [-15, -16, 15, -16, 11, -2, 6, 0, -6, 0, -11, -2]); g.fill();
    g.fillStyle = '#4a8aa0'; pv(g, [-15, -16, -9, -16, -7, -2, -11, -2]); g.fill();
    g.strokeStyle = '#e3b04b'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-13.5, -11); g.lineTo(13.5, -11); g.stroke();
    g.fillStyle = '#1f4a5c'; ov(g, 0, -16, 15, 4); g.fill(); g.fillStyle = '#5fb0cc'; ov(g, 0, -16, 13, 3.2); g.fill();
    for (const [x, y] of [[-7, -16], [6, -15.5], [1, -17.4]]){ g.fillStyle = '#4f8f3a'; ov(g, x, y, 4.4, 1.7); g.fill(); g.fillStyle = '#7fbf52'; ov(g, x - .8, y - .4, 2.4, .8); g.fill(); }
    g.fillStyle = '#ff9cc2'; for (const [x, w] of [[-2.6, 2], [2.6, 2], [0, 2.4]]){ pv(g, [x - w, -18, x, -25, x + w, -18]); g.fill(); }
    g.fillStyle = '#ffd6e6'; pv(g, [-1, -18, 0, -23, 1, -18]); g.fill();
  }})
});

/* the ground: green lawns with grass tufts and scattered tiny flowers in the ring between the court and the road */
{ const _vg = villageGround;
  villageGround = function(g){ _vg(g);
    const rng = propRng(83083), cx = ARC.x - VX, cy = ARC.y;
    g.save();
    for (let d = 0; d < 360; d += 1){ if (bloomOpen(d, 9)) continue;
      const a0 = d * Math.PI / 180, a1 = (d + 1.15) * Math.PI / 180;
      g.fillStyle = '#7ea64e'; g.beginPath(); g.arc(cx, cy, BLOOM.out + 2, a0, a1); g.arc(cx, cy, BLOOM.in - 4, a1, a0, true); g.closePath(); g.fill();
      g.fillStyle = '#93b862'; g.beginPath(); g.arc(cx, cy, BLOOM.out - 4, a0, a1); g.arc(cx, cy, BLOOM.in + 2, a1, a0, true); g.closePath(); g.fill(); }
    const blades = [new Path2D(), new Path2D(), new Path2D()];   // one stroke per colour (cheap to paint)
    for (let i = 0; i < 2600; i++){ const d = rng() * 360; if (bloomOpen(d, 10)) continue; const a = d * Math.PI / 180, r = BLOOM.in + rng() * (BLOOM.out - BLOOM.in);
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, k = rng();
      if (k < .82){ const p = blades[k < .3 ? 0 : k < .6 ? 1 : 2]; p.moveTo(x, y); p.lineTo(x + (rng() - .5) * 2.4, y - 2.4 - rng() * 2.6); }
      else { const c = BLOOM.colors[(rng() * BLOOM.colors.length) | 0]; g.fillStyle = c[0]; g.beginPath(); g.arc(x, y, 1.1, 0, 7); g.fill(); g.fillStyle = '#ffe36a'; g.fillRect(x - .3, y - .3, .6, .6); } }
    g.lineWidth = .9; ['#5f9838', '#a6d46c', '#6fa844'].forEach((c, i) => { g.strokeStyle = c; g.stroke(blades[i]); });
    // a stepping-stone path across the lawn at each gate side so it reads as a garden walk
    g.restore();
  };
}

/* the plants */
{ const _vp = villageProps;
  villageProps = function(){ _vp();
    const free = (x, y, r) => !PROPS.some(p => Math.hypot(p.x - x, p.y - y) < r) && !(typeof NPCS !== 'undefined' && NPCS.some(n => Math.hypot(n.x - x, n.y - y) < 40));
    // flower beds round the edge of the court
    let k = 0;
    for (let d = 4; d < 360; d += 20){ if (bloomOpen(d, 16)) continue; const [x, y] = arcAt(d, BLOOM.in + 14); if (free(x, y, 44)) addProp('flowerbed', x, y, k++ % 6); }
    // frangipani and bougainvillea in the middle of the lawn
    k = 0;
    for (let d = 14; d < 360; d += 26){ if (bloomOpen(d, 18)) continue; const [x, y] = arcAt(d, 214);
      if (!free(x, y, 58)) continue; addProp(k % 3 === 2 ? 'bougain' : 'frangipani', x, y, (k >> 1) % 2); k++; }
    // clipped hedges along the outer edge of the lawn
    for (let d = 0; d < 360; d += 7.5){ if (bloomOpen(d, 11)) continue; const [x, y] = arcAt(d, BLOOM.out - 6); if (free(x, y, 26)) addProp('hedge', x, y, Math.floor(d / 45)); }
    // lotus bowls flanking each gate path where it meets the court, and the temple steps
    for (const gd of BLOOM.gates){ if (gd > BLOOM.temple[0] && gd < BLOOM.temple[1]) continue; for (const s of [-13, 13]){ const [x, y] = arcAt(gd + s, BLOOM.in + 2); if (free(x, y, 30)) addProp('lotusbowl', x, y); } }
    for (const x of [1112, 1290]) if (free(x, 734, 30)) addProp('lotusbowl', x, 734);
  };
}
