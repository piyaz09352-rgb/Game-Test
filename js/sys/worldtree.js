/* VAYRATHEN — js/sys/worldtree.js — every camp rests under a World Tree (v59)
   The camp tree was an ordinary tree with a few lumps of leaves. Now each camp has one giant, ancient tree like the
   world trees of legend (Yggdrasil, the Himmapan's great trees, Ghibli's camphor tree): a trunk as wide as a house
   on spreading buttress roots, branches reaching out far, and a wide, layered dome of leaves that throws a big cool
   shade over the whole camp, with spots of sunlight coming through. It keeps its land's colours (green in the
   fertile lands, fire-red leaves in the volcanic ones, snow on the frozen ones, violet in the dark, gold in the
   light) and the three-coloured cloth (ผ้าสามสี) of a revered tree. Only the trunk blocks the way. */
'use strict';

Object.assign(PROP_TYPES, {
  worldtree: (seed, v) => { const th = CAMP_THEME[CAMP_LANDS[v] || 'fertile'], [bm, bd, bl] = th.bark, lf = {leafH:th.leaf.leafL, ...th.leaf};
    return makeProp({w:370, h:322, ax:185, ay:301, seed, collide:24, glow:th.spirit ? [0, -102, 110] : null, paint(g, rng){
      g.scale(.68, .68);   // drawn at 540 × 470, shown at two thirds so the whole tree fits the screen
      // buttress roots spreading over the ground, then the trunk: wide at the foot, splitting into great limbs
      for (const s of [-1, 1]) for (const [ex, ey, w] of [[118, 14, 15], [84, 24, 12], [150, 2, 9], [60, 30, 10]]){
        g.fillStyle = bd; pv(g, [s * 14, -40, s * (ex * .55), ey * .3 - 6, s * ex, ey, s * (ex - 6), ey + 4, s * (ex * .5), ey * .5 + 6, s * 6, -18]); g.fill();
        g.fillStyle = bm; pv(g, [s * 14, -38, s * (ex * .55), ey * .3 - 8, s * (ex - 4), ey - 2, s * (ex * .5), ey * .5 - 2, s * 10, -24]); g.fill();
        g.strokeStyle = bl; g.lineWidth = 1; g.beginPath(); g.moveTo(s * 16, -34); g.quadraticCurveTo(s * ex * .5, ey * .3 - 9, s * (ex - 8), ey - 3); g.stroke(); w; }
      g.fillStyle = bd; pv(g, [-46, 0, -38, -60, -30, -130, -44, -190, -20, -184, 0, -150, 20, -186, 46, -192, 32, -130, 38, -60, 46, 0]); g.fill();
      g.fillStyle = bm; pv(g, [-40, -2, -32, -60, -24, -130, -36, -186, -18, -180, -2, -148, 6, -150, 8, -60, 4, -2]); g.fill();
      // bark: deep furrows, knots and moss
      g.strokeStyle = bd; g.lineWidth = 2; for (let i = 0; i < 9; i++){ const x = -34 + i * 8 + (rng() - .5) * 3; g.beginPath(); g.moveTo(x, -4); g.bezierCurveTo(x + (rng() - .5) * 10, -60, x + (rng() - .5) * 12, -110, x * .8 + (rng() - .5) * 8, -170); g.stroke(); }
      g.strokeStyle = bl; g.lineWidth = .9; for (let i = 0; i < 7; i++){ const x = -30 + i * 8; g.beginPath(); g.moveTo(x + 2, -8); g.bezierCurveTo(x + 4, -60, x - 2, -110, x * .8 + 2, -166); g.stroke(); }
      for (const [x, y] of [[-14, -92], [18, -120]]){ g.fillStyle = bd; ov(g, x, y, 6, 8); g.fill(); g.fillStyle = bl; ov(g, x - 1, y - 1, 3, 4); g.fill(); }
      if (!th.snow && !th.acacia){ g.fillStyle = 'rgba(90,140,60,.55)'; for (let i = 0; i < 16; i++){ ov(g, -38 + rng() * 30, -30 - rng() * 120, 3 + rng() * 4, 1.6 + rng() * 2); g.fill(); } }
      // the three-coloured cloth round the trunk, its ends hanging, and garlands at the foot
      for (const [y, c] of [[-74, '#e04a5a'], [-68, '#f2d04a'], [-62, '#4a9ae0']]){ g.fillStyle = c; pv(g, [-40, y, 40, y + 2, 40, y + 7, -40, y + 5]); g.fill(); }
      g.fillStyle = '#f2d04a'; pv(g, [26, -66, 34, -40, 29, -40, 22, -64]); g.fill(); g.fillStyle = '#e04a5a'; pv(g, [30, -68, 40, -46, 35, -45, 26, -66]); g.fill();
      for (let i = 0; i < 9; i++){ g.fillStyle = ['#f2c14e', '#ffffff', '#e86a8a'][i % 3]; ov(g, -30 + i * 7.5, -6 + Math.sin(i) * 1.4, 2.6, 2.2); g.fill(); }
      // great limbs reaching out under the canopy
      g.lineCap = 'round';
      for (const [s, ex, ey, cx, cy, w] of [[-1, 210, -250, 110, -190, 15], [1, 214, -246, 110, -196, 15], [-1, 120, -330, 50, -260, 12], [1, 130, -320, 60, -264, 12], [-1, 250, -200, 160, -200, 8], [1, 246, -196, 150, -208, 8]]){
        g.strokeStyle = bd; g.lineWidth = w + 3; g.beginPath(); g.moveTo(s * 14, -170); g.quadraticCurveTo(s * cx, cy, s * ex, ey); g.stroke();
        g.strokeStyle = bm; g.lineWidth = w; g.beginPath(); g.moveTo(s * 12, -172); g.quadraticCurveTo(s * cx, cy - 2, s * ex, ey - 2); g.stroke(); }
      // aerial roots hanging from the limbs (a banyan habit), not on the dry acacia
      if (!th.acacia) for (let i = 0; i < 14; i++){ const s = i % 2 ? 1 : -1, x = s * (60 + rng() * 170), y0 = -230 + Math.abs(x) * .2; g.strokeStyle = bd; g.lineWidth = 1.2 + rng();
        g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + (rng() - .5) * 8, y0 + 60, x + (rng() - .5) * 6, y0 + 90 + rng() * 70); g.stroke(); }
      // the canopy: a wide dome in three layers, dark underside first, sunlit crown last
      const dome = [], R0 = th.acacia ? .7 : 1;
      for (let i = 0; i < 15; i++){ const t = i / 14, x = (t - .5) * 470, y = -250 - Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2)) * 120 * R0; dome.push([x, y + 28, 46 + rng() * 10]); }
      for (let i = 0; i < 11; i++){ const t = i / 10, x = (t - .5) * 380, y = -290 - Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2)) * 120 * R0; dome.push([x, y, 48 + rng() * 10]); }
      for (let i = 0; i < 7; i++){ const t = i / 6, x = (t - .5) * 250, y = -340 - Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2)) * 70 * R0; dome.push([x, y, 44 + rng() * 8]); }
      const under = {leafD:th.leaf.leafD, leafM:th.leaf.leafD, leafL:th.leaf.leafM, leafH:th.leaf.leafM};
      for (const [x, y, r] of dome.slice(0, 15)) leafCluster(g, x, y, r, rng, under);
      for (const [x, y, r] of dome.slice(15)) leafCluster(g, x + (rng() - .5) * 8, y + (rng() - .5) * 6, r, rng, lf);
      for (const [x, y, r] of [[-60, -360, 40], [60, -362, 40], [0, -392, 42], [-150, -320, 36], [150, -318, 36]]) leafCluster(g, x, y, r, rng, lf);
      if (th.snow) for (const [x, y, r] of dome){ g.fillStyle = 'rgba(250,253,255,.9)'; ov(g, x - r * .1, y - r * .6, r * .78, r * .26); g.fill(); }
      if (th.bodhi) for (let i = 0; i < 60; i++){ const a = rng() * 6.28, d = rng(); g.fillStyle = rng() < .5 ? '#fff4c0' : '#ffd36a'; ov(g, Math.cos(a) * d * 220, -300 + Math.sin(a) * d * 90, 2.6, 1.8); g.fill(); }
      if (th.ember) for (let i = 0; i < 40; i++){ const a = rng() * 6.28, d = rng(); g.fillStyle = rng() < .5 ? '#ffb04a' : '#ff6a2a'; ov(g, Math.cos(a) * d * 220, -300 + Math.sin(a) * d * 90, 2, 2); g.fill(); }
      // lanterns and cloths hanging from the lowest limbs
      for (let i = 0; i < 8; i++){ const s = i % 2 ? 1 : -1, x = s * (50 + (i >> 1) * 48), y = -212 + (i >> 1) * 6; g.strokeStyle = 'rgba(40,30,20,.8)'; g.lineWidth = .9; g.beginPath(); g.moveTo(x, y - 18); g.lineTo(x, y); g.stroke();
        if (th.spirit){ g.fillStyle = '#c8a0ff'; ov(g, x, y + 5, 4.6, 5.6); g.fill(); g.fillStyle = '#fff0ff'; ov(g, x, y + 4, 2, 2.6); g.fill(); }
        else if (th.bodhi){ g.fillStyle = '#ffffff'; pv(g, [x - 2.4, y, x + 2.4, y, x + 3.4, y + 16, x - 3.4, y + 14]); g.fill(); }
        else { g.fillStyle = '#e8503a'; ov(g, x, y + 5, 4.2, 5); g.fill(); g.fillStyle = '#ffd36a'; g.fillRect(x - 3, y + 1.4, 6, 1.3); } }
    }}); }
});

/* the shade under the canopy: a big cool shadow on the ground with spots of sunlight coming through the leaves */
function worldTreeShade(x, y){
  const g = terr.getContext('2d'); g.save(); g.setTransform(TS, 0, 0, TS, 0, 0);
  let sd = Math.round(x * 13 + y * 7) % 233280; const r = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  const cy = y + 6, sh = g.createRadialGradient(x, cy, 20, x, cy, 180); sh.addColorStop(0, 'rgba(10,25,10,.34)'); sh.addColorStop(.7, 'rgba(10,25,10,.2)'); sh.addColorStop(1, 'rgba(10,25,10,0)');
  g.fillStyle = sh; g.beginPath(); g.ellipse(x, cy, 190, 74, 0, 0, 7); g.fill();
  for (let i = 0; i < 46; i++){ const a = r() * 6.28, d = Math.sqrt(r()), px = x + Math.cos(a) * d * 160, py = cy + Math.sin(a) * d * 60, rr = 3 + r() * 7;
    const sp = g.createRadialGradient(px, py, 0, px, py, rr); sp.addColorStop(0, 'rgba(255,240,180,.3)'); sp.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = sp; g.beginPath(); g.ellipse(px, py, rr, rr * .45, 0, 0, 7); g.fill(); }
  g.restore();
}

/* camps put the World Tree where the old camp tree stood, a little further back so its shade covers the camp */
{ const _cp = campPlace;
  campPlace = function(){
    const r = _cp.apply(this, arguments);
    const i = PROPS.findIndex(p => p.type === 'camptree'); if (i < 0) return r;
    const p = PROPS[i]; PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1);
    const ty = p.y - 30;
    // nothing grows inside the World Tree: clear other trees and plants from under its trunk and canopy
    for (let k = PROPS.length - 1; k >= 0; k--){ const q = PROPS[k]; if (Math.abs(q.x - p.x) < 190 && q.y > ty - 210 && q.y < ty + 24 && !['bedroll', 'packs', 'logseat', 'stakelamp', 'jar'].includes(q.type)){
      PROPS.splice(k, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === q) obstacles.splice(j, 1); } }
    worldTreeShade(p.x, ty + 30); addProp('worldtree', p.x, ty, p.variant);
    if (typeof NAV !== 'undefined') NAV.grid = null;
    return r;
  }; }
