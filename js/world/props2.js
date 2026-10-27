/* VAYRATHEN — js/world/props2.js
   Props for the 20 new maps, painted the same way as props.js (world units, foot point at 0,0, outlined).
   The variant number picks a palette where a prop appears in several biomes. */
'use strict';

const VPAL = {
  pine:[['#2c4a3a', '#3f6a4e', '#5d8a62'], ['#dfe8f0', '#b8c8d8', '#f4f8ff']],                         // green / snowy
  crystal:[['#2a8a7a', '#5ad0c0', '#c8fff4'], ['#5a7ac8', '#8ab0f0', '#e0ecff'], ['#c89a2a', '#f0d070', '#fff4c8'], ['#7a4aa8', '#b08ae0', '#f0e0ff']],
  him:[['#d84a8a', '#f08ac0', '#ffd0e8'], ['#3ab0a8', '#6ad8c8', '#c8fff0'], ['#e3b04b', '#f0d070', '#fff4c8'], ['#5a2a6a', '#8a4a9a', '#c88ad8']],
  coral:[['#e05a7a', '#f08aa8'], ['#e88a3a', '#f8b060'], ['#8a5ad0', '#b08af0']]
};
Object.assign(PROP_TYPES, {
  pine: (seed, v = 0) => makeProp({w:70, h:120, ax:35, ay:114, seed, shadow:[18, 6], collide:10, paint(g, rng){
    const [d, m, l] = VPAL.pine[v % 2];
    g.fillStyle = PAL.barkD; g.fillRect(-2.5, -24, 5, 24); g.fillStyle = PAL.barkM; g.fillRect(-2.5, -24, 2, 24);
    for (let i = 0; i < 5; i++){ const y = -22 - i * 17, w = 28 - i * 5;
      g.fillStyle = v === 1 ? '#3f6a4e' : d; pv(g, [-w, y, 0, y - 26, w, y]); g.fill();
      g.fillStyle = m; pv(g, [-w * .85, y - 2, 0, y - 25, w * .3, y - 3]); g.fill();
      g.fillStyle = l; pv(g, [-w * .6, y - 6, -w * .1, y - 22, -w * .2, y - 8]); g.fill();
      if (v === 1){ g.fillStyle = '#f4f8ff'; pv(g, [-w * .9, y - 1, -w * .3, y - 9, w * .2, y - 6, w * .8, y - 1]); g.fill(); } }
  }}),
  deadtree: seed => makeProp({w:70, h:96, ax:35, ay:90, seed, shadow:[14, 5], collide:7, paint(g, rng){
    g.strokeStyle = '#3a2c22'; g.lineCap = 'round';
    const br = (x, y, a, len, w, d) => { if (d > 4 || len < 4) return; const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
      g.strokeStyle = '#5a4636'; g.lineWidth = w * .35; g.beginPath(); g.moveTo(x - 1, y); g.lineTo(x2 - 1, y2); g.stroke(); g.strokeStyle = '#3a2c22';
      br(x2, y2, a - .4 - rng() * .3, len * .7, w * .65, d + 1); br(x2, y2, a + .4 + rng() * .3, len * .65, w * .6, d + 1); };
    br(0, 0, -Math.PI / 2, 34, 6, 0);
  }}),
  stupa: (seed, v = 0) => makeProp({w:70, h:120, ax:35, ay:112, seed, shadow:[26, 8], collide:20, paint(g, rng){
    // Ayutthaya bell chedi (ทรงระฆัง): ฐานเขียง terraces, ฐานบัว, มาลัยเถา rings, องค์ระฆัง, บัลลังก์, ก้านฉัตร, ปล้องไฉน, ปลียอด + เม็ดน้ำค้าง.
    // v0: brick ruin with stucco patches, broken spire and a fig sapling; v1: lime plaster with lichen streaks and a three-colour cloth (ผ้าสามสี)
    const ruin = v !== 1, C = ruin ? ['#7a3424', '#a85a3a', '#c97f58', '#e3a27a'] : ['#7d7a70', '#a39f92', '#c6c2b4', '#e4e0d2'], mort = ruin ? '#5a2a1a' : '#6a675e';
    const box = (y, w, h) => { if (ruin) blocks(g, -w, y - h, w * 2, h, 5, 2.2, [C[1], C[2], C[1], C[0]], mort, rng, 3); else plank(g, -w, y - h, w * 2, h, C[2], C[3], C[0]);
      g.fillStyle = C[3]; g.fillRect(-w, y - h, w * 2, .8); g.fillStyle = 'rgba(20,10,5,.22)'; g.fillRect(w * .45, y - h, w * .55, h); };
    box(0, 28, 5); box(-5, 24, 4.5); box(-9.5, 20, 4.5);
    // ฐานบัว: waist, petal band, lip
    g.fillStyle = C[0]; g.fillRect(-15, -16.5, 30, 2.5);
    for (let x = -16.5; x <= 16.5; x += 3.3){ g.fillStyle = C[2]; ov(g, x, -18.4, 1.7, 2.1); g.fill(); g.fillStyle = C[3]; ov(g, x - .5, -19, .6, 1); g.fill(); }
    box(-20, 18, 1.8);
    // มาลัยเถา: three stacked rings
    for (let i = 0; i < 3; i++){ const y = -23 - i * 3.2, rx = 16.5 - i * 1.6; g.fillStyle = C[0]; ov(g, 0, y, rx, 1.9); g.fill(); g.fillStyle = C[2]; ov(g, -1.5, y - .5, rx * .85, 1.1); g.fill(); g.fillStyle = C[3]; ov(g, -5, y - .9, rx * .4, .45); g.fill(); }
    // องค์ระฆัง: the bell
    const bell = () => { g.beginPath(); g.moveTo(-15, -31); g.bezierCurveTo(-15, -43, -10, -53, -5, -57); g.lineTo(5, -57); g.bezierCurveTo(10, -53, 15, -43, 15, -31); g.closePath(); };
    bell(); g.fillStyle = C[1]; g.fill(); g.save(); bell(); g.clip();
    if (ruin){ blocks(g, -15, -57, 30, 26, 4.4, 2, [C[1], C[2], C[1]], mort, rng, 3); g.fillStyle = '#d8ccb4'; for (let i = 0; i < 5; i++){ ov(g, -12 + rng() * 20, -52 + rng() * 18, 2 + rng() * 3, 1.4 + rng() * 2); g.fill(); } }
    else { g.fillStyle = 'rgba(40,40,30,.28)'; for (let i = 0; i < 8; i++) g.fillRect(-13 + rng() * 24, -56 + rng() * 6, .8 + rng(), 8 + rng() * 15); }
    g.fillStyle = 'rgba(20,10,5,.24)'; ov(g, 10, -41, 9, 18); g.fill(); g.fillStyle = 'rgba(255,240,210,.28)'; ov(g, -7, -45, 3.6, 9); g.fill(); g.restore();
    g.fillStyle = C[0]; g.fillRect(-13.8, -42, 27.6, .8);   // รัดอก band
    if (!ruin){ for (const [i, c] of [[0, '#d23c6e'], [1, '#f1c40f'], [2, '#2e8b57']]) { g.fillStyle = c; g.fillRect(-15, -33.6 + i * .9, 30, .9); }
      g.fillStyle = '#d23c6e'; pv(g, [6, -32, 8, -32, 9.5, -24, 7.6, -24.4]); g.fill(); g.fillStyle = '#f1c40f'; pv(g, [8, -32, 9.4, -32, 11.4, -25.4, 9.8, -25]); g.fill(); }
    // บัลลังก์ + ก้านฉัตร with its little pillars
    box(-57, 7, 7); g.fillStyle = C[0]; g.fillRect(-7, -61, 14, .7); box(-64, 8.2, 1.4);
    g.fillStyle = C[1]; g.fillRect(-3, -69, 6, 3.6); g.fillStyle = C[0]; for (const x of [-2.6, -.6, 1.4]) g.fillRect(x, -69, .7, 3.6);
    // ปล้องไฉน rings → ปลียอด → เม็ดน้ำค้าง (or a broken stump with a sapling)
    const n = ruin ? 5 : 9;
    for (let i = 0; i < n; i++){ const y = -70 - i * 2.4, w = 4.8 - i * .36; g.fillStyle = C[0]; ov(g, 0, y - 1.2, w, 1.3); g.fill(); g.fillStyle = C[2]; ov(g, -.6, y - 1.5, w * .75, .7); g.fill(); }
    if (ruin){ g.fillStyle = C[1]; pv(g, [-3.2, -81, -2.6, -85, -.8, -83, .6, -87, 2.2, -84, 3.2, -81]); g.fill();
      g.strokeStyle = PAL.barkM; g.lineWidth = .8; g.beginPath(); g.moveTo(1, -84); g.quadraticCurveTo(2, -90, 4.5, -95); g.moveTo(1, -82); g.quadraticCurveTo(-2.5, -76, -2.4, -66); g.stroke();
      leafCluster(g, 5.5, -97, 5, rng); leafCluster(g, 1, -92, 3.2, rng);
      g.fillStyle = PAL.moss; for (const [x, y, r] of [[-14, -26, 6], [10, -9, 5], [-4, -60, 3], [20, -1, 4], [-22, -4.6, 3]]){ ov(g, x, y, r, 1.3); g.fill(); }
      blocks(g, 22, -3, 6, 3, 3, 1.5, [C[1], C[2]], mort, rng); blocks(g, 28, -2, 4, 2, 2, 2, [C[0], C[1]], mort, rng); }
    else { g.fillStyle = C[2]; pv(g, [-1.6, -91, 0, -104, 1.6, -91]); g.fill(); g.fillStyle = C[3]; pv(g, [-1, -91, 0, -102, -.2, -91]); g.fill();
      g.fillStyle = PAL.gold; ov(g, 0, -105.6, 1.6, 1.8); g.fill(); g.fillStyle = PAL.goldL; ov(g, -.5, -106.1, .6, .6); g.fill();
      g.fillStyle = 'rgba(80,110,60,.6)'; ov(g, -16, -26, 5, 1.4); g.fill(); ov(g, 12, -10, 4, 1.2); g.fill(); }
  }}),
  prang: seed => makeProp({w:132, h:150, ax:66, ay:142, seed, shadow:[52, 10], collide:34, paint(g, rng){
    // ruined Khmer brick prang (after the owner's reference photo): a wide three-step laterite platform with a stair, a square
    // brick sanctuary on a moulded plinth, sandstone door frame and carved lintel over a dark doorway, and a crumbling stepped
    // tower whose top has fallen away, weathered grey-black with lichen and a little tree rooted in the summit
    const BR = ['#a85438', '#b4603e', '#9a4a32', '#a85a3c', '#8e4430', '#bc6c4c'], LT = ['#8a5640', '#9c6248', '#7a4a36', '#a86e52'];
    const SST = ['#5e5244', '#82705c', '#9a8670', '#b09a80'];
    const brick = (x, y, w, h, bw = 4.2, bh = 1.9) => blocks(g, x, y, w, h, bw, bh, BR, '#6a3424', rng, w * h / 14);
    const lat = (x, y, w, h) => blocks(g, x, y, w, h, 9, 3.6, LT, '#4e3a2a', rng, w * h / 6);
    const shade = (x, y, w, h, a = .25) => { g.fillStyle = `rgba(28,10,4,${a})`; g.fillRect(x, y, w, h); };
    const grime = (x, y, w, h, n) => { for (let i = 0; i < n; i++){ g.fillStyle = `rgba(${40 + rng() * 30},${38 + rng() * 25},${34 + rng() * 20},${.18 + rng() * .25})`; ov(g, x + rng() * w, y + rng() * h, 1.5 + rng() * 5, 1 + rng() * 3.5); g.fill(); } };
    // ---- platform: three wide laterite steps, ragged edges, a front stair ----
    for (const [y0, w, h] of [[0, 62, 7], [-7, 55, 6], [-13, 47, 7]]){ lat(-w, y0 - h, w * 2, h); g.fillStyle = 'rgba(255,230,190,.22)'; g.fillRect(-w, y0 - h, w * 2, 1);
      shade(w * .35, y0 - h, w * .65, h, .2); grime(-w, y0 - h, w * 2, h, 5);
      g.fillStyle = '#2e2018'; for (let i = 0; i < 3; i++){ const x = -w + rng() * (w * 2 - 8); g.fillRect(x, y0 - h, 4 + rng() * 6, 1.4 + rng() * 1.6); } }   // missing top blocks
    for (let i = 0; i < 5; i++){ const y = -i * 4, w = 9 - i * .3; g.fillStyle = i % 2 ? LT[1] : LT[3]; g.fillRect(-w, y - 4, w * 2, 4); g.fillStyle = 'rgba(28,10,4,.35)'; g.fillRect(-w, y - .8, w * 2, .8); }
    // ---- moulded plinth ----
    brick(-29, -27, 58, 7); g.fillStyle = BR[5]; g.fillRect(-30, -27, 60, 1.4); g.fillRect(-27, -21.5, 54, 1); shade(10, -27, 20, 7, .25);
    // ---- sanctuary body: square, redented corners, slight taper ----
    g.save(); g.beginPath(); g.moveTo(-25, -27); g.lineTo(-23.5, -80); g.lineTo(23.5, -80); g.lineTo(25, -27); g.closePath(); g.clip();
    brick(-26, -81, 52, 55); shade(-26, -81, 3, 55, .18); shade(-19, -81, 1.2, 55, .3); shade(18, -81, 1.2, 55, .3); shade(9, -81, 17, 55, .26);
    grime(-25, -81, 50, 55, 26); g.fillStyle = 'rgba(30,26,22,.3)'; for (let i = 0; i < 9; i++) g.fillRect(-23 + rng() * 46, -80, .6 + rng() * .9, 12 + rng() * 30);   // rain streaks
    g.fillStyle = 'rgba(210,214,190,.35)'; for (let i = 0; i < 10; i++){ ov(g, -23 + rng() * 46, -78 + rng() * 48, .6 + rng() * 1.2, .5 + rng()); g.fill(); }   // lichen
    g.restore();
    // ---- door: sandstone jambs, carved lintel (ทับหลัง) and a small pediment, dark cella ----
    plank(g, -10, -60, 20, 33, SST[1], SST[2], SST[0]); g.fillStyle = '#140a06'; g.fillRect(-6.5, -55, 13, 28);
    g.fillStyle = 'rgba(80,60,40,.5)'; g.fillRect(-6.5, -55, 13, 3);
    for (const s of [-1, 1]){ g.fillStyle = SST[2]; g.fillRect(s * 8 - 1.4, -55, 2.8, 28); g.fillStyle = SST[0]; for (let y = -53; y < -28; y += 4) g.fillRect(s * 8 - 1.4, y, 2.8, .6); }
    plank(g, -13, -63, 26, 7, SST[2], SST[3], SST[0]);
    g.strokeStyle = SST[0]; g.lineWidth = .55; for (const s of [-1, 1]){ g.beginPath(); g.moveTo(s * 2, -59.6); g.quadraticCurveTo(s * 6.5, -56.4, s * 12, -60.4); g.stroke(); g.beginPath(); ov(g, s * 7.5, -60.6, 1.4, 1.2); g.stroke(); }
    g.fillStyle = SST[0]; ov(g, 0, -59.8, 2, 1.8); g.fill(); g.fillStyle = 'rgba(28,10,4,.4)'; g.fillRect(4, -63, 9, 7);
    g.fillStyle = SST[1]; pv(g, [-12, -63, 0, -71, 12, -63]); g.fill(); g.fillStyle = SST[0]; pv(g, [-7, -63.6, 0, -68.6, 7, -63.6]); g.fill(); g.fillStyle = '#4a2418'; g.fillRect(-1.4, -66.6, 2.8, 2.6); grime(-13, -71, 26, 16, 7); g.fillStyle = 'rgba(20,10,6,.5)'; pv(g, [5, -63, 12, -63, 9, -65.5]); g.fill();
    // ---- cornice ----
    brick(-27, -84, 54, 4); g.fillStyle = BR[5]; g.fillRect(-27, -84, 54, .9); shade(9, -84, 18, 4, .28);
    // ---- crumbling stepped tower: narrowing tiers with a broken, ragged top ----
    const tiers = [[-84, 22, 13], [-97, 18, 12], [-109, 14.5, 11]], top = -120;
    for (const [y, w, h] of tiers){ brick(-w - 1.4, y - 2, w * 2 + 2.8, 2); g.fillStyle = BR[5]; g.fillRect(-w - 1.4, y - 2, w * 2 + 2.8, .8);   // ledge
      g.save(); g.beginPath(); g.moveTo(-w, y - 2); for (let k = 1; k <= 4; k++) g.lineTo(-w * (1 - k * .015) + (rng() - .3) * 2.2, y - 2 - (h - 2) * k / 4); for (let k = 4; k >= 1; k--) g.lineTo(w * (1 - k * .015) - (rng() - .3) * 2.2, y - 2 - (h - 2) * k / 4); g.lineTo(w, y - 2); g.closePath(); g.clip();
      brick(-w - 1, y - h - 1, w * 2 + 2, h + 1); shade(w * .3, y - h, w, h, .32); shade(-w, y - h, 1.6, h, .15); grime(-w, y - h, w * 2, h, 12);
      g.fillStyle = 'rgba(18,8,4,.55)'; g.fillRect(-2.6, y - h + 2.5, 5.2, h - 5);   // false niche
      g.restore(); }
    // ragged summit: fallen-away bricks leave a jagged silhouette
    { const w = 12.5, base = -109 - 11; g.beginPath(); g.moveTo(-w, base); let x = -w;
      while (x < w){ x = Math.min(w, x + 1.6 + rng() * 2.6); g.lineTo(x, base - 3 - rng() * 9 * (1 - Math.abs(x) / w * .6)); }
      g.lineTo(w, base); g.closePath(); g.save(); g.clip(); brick(-w - 1, top - 14, w * 2 + 2, 15); shade(w * .3, top - 14, w, 15, .3); grime(-w, top - 14, w * 2, 15, 6); g.restore(); }
    // bites taken out of the tiers' edges
    for (const [x, y, w, h] of [[-23, -93, 3, 5], [19, -104, 3, 4], [-17, -116, 3, 3]]){ g.clearRect(x, y, w, h); }
    // ---- a small tree in the summit, grass and moss on the platform, fallen bricks ----
    g.strokeStyle = PAL.barkM; g.lineWidth = .9; g.beginPath(); g.moveTo(-3, -124); g.quadraticCurveTo(-5, -130, -8, -133); g.moveTo(-3, -124); g.quadraticCurveTo(0, -131, 2, -134); g.stroke();
    leafCluster(g, -8, -135, 4.2, rng); leafCluster(g, 2.5, -136.5, 3.6, rng); leafCluster(g, -3, -139, 3.2, rng);
    g.fillStyle = 'rgba(70,110,50,.85)'; for (const [x, y, r] of [[-44, -14, 4], [40, -15, 5], [-56, -6, 4], [55, -7, 4], [-24, -27, 3], [22, -84, 2.6], [-14, -97, 2.2]]){ ov(g, x, y, r, 1.4); g.fill(); }
    for (const [x, y, r] of [[34, -1, .3], [-48, -1, -.2], [50, -14, .5]]){ g.save(); g.translate(x, y); g.rotate(r); brick(-3, -2, 6, 2.4, 3, 1.2); g.restore(); }
  }}),
  wall: (seed, v = 0) => makeProp({w:80, h:46, ax:40, ay:40, seed, shadow:[30, 5], collide:16, paint(g, rng){
    // ruined enclosure wall: coursed blocks (v0 sandstone, v1 pitted laterite), rounded coping stones (บัวหลังเจียด) where it still stands,
    // broken courses, fallen blocks, moss, grass and a creeper
    const lat = v === 1, C = lat ? ['#6e3220', '#9a4e32', '#b8664a', '#d08a68'] : ['#5e5a52', '#857f72', '#a39c8c', '#c4bcaa'], mort = lat ? '#4e2416' : '#46423b';
    const bw = 8, bh = 4.4, H = []; for (let c = 0; c < 10; c++) H.push(c < 4 ? 6 : 2 + Math.floor(rng() * 4));
    for (let r = 0; r < 6; r++){ const y = -bh * (r + 1);
      for (let x = -34 - (r % 2) * bw / 2; x < 34; x += bw){ const x0 = Math.max(-34, x), x1 = Math.min(34, x + bw), col = Math.floor(((x0 + x1) / 2 + 34) / bw);
        if (r >= H[col] || (r === H[col] - 1 && col > 3 && rng() < .3)) continue;
        g.fillStyle = mort; g.fillRect(x0, y, x1 - x0, bh); g.fillStyle = C[1 + Math.floor(rng() * 2.6)]; g.fillRect(x0 + .4, y + .4, x1 - x0 - .8, bh - .8);
        g.fillStyle = 'rgba(255,240,210,.2)'; g.fillRect(x0 + .4, y + .4, x1 - x0 - .8, .5); g.fillStyle = 'rgba(20,10,0,.18)'; g.fillRect(x0 + .4, y + bh - 1.1, x1 - x0 - .8, .7);
        if (lat) for (let k = 0; k < 3; k++){ g.fillStyle = 'rgba(30,12,4,.4)'; ov(g, x0 + 1 + rng() * (x1 - x0 - 2), y + 1 + rng() * (bh - 2), .4, .3); g.fill(); } } }
    for (let x = -34; x < -2; x += 8){ g.fillStyle = mort; g.fillRect(x, -28.6, 8, 2.4); g.fillStyle = C[2]; g.beginPath(); g.ellipse(x + 4, -28.4, 3.8, 3, 0, Math.PI, 0); g.fill(); g.fillStyle = C[3]; ov(g, x + 2.8, -30, 1.4, .7); g.fill(); }
    g.fillStyle = 'rgba(30,25,15,.22)'; for (let i = 0; i < 5; i++) g.fillRect(-32 + rng() * 30, -26, .8, 6 + rng() * 14);
    // fallen blocks and rubble
    for (const [x, y, a] of [[18, -1.5, .3], [27, -2, -.2]]){ g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = mort; g.fillRect(-4.4, -2.4, 8.8, 4.8); g.fillStyle = C[2]; g.fillRect(-4, -2, 8, 4); g.fillStyle = C[3]; g.fillRect(-4, -2, 8, .6); g.restore(); }
    g.fillStyle = C[1]; for (let i = 0; i < 4; i++){ ov(g, 10 + rng() * 24, -1 - rng() * 2, 1 + rng(), .8); g.fill(); }
    g.fillStyle = PAL.moss; for (let i = 0; i < 5; i++){ ov(g, -30 + rng() * 60, -6 - rng() * 18, 3 + rng() * 2, 1.2); g.fill(); } ov(g, -18, -31.4, 6, 1.4); g.fill();
    g.strokeStyle = '#5a8a3a'; g.lineWidth = .8; for (let i = 0; i < 12; i++){ const x = -36 + rng() * 72; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (rng() - .5) * 2, -2.5 - rng() * 3); g.stroke(); }
    if (!lat){ g.strokeStyle = '#3f6a2e'; g.lineWidth = .7; g.beginPath(); g.moveTo(-22, -30); g.bezierCurveTo(-26, -22, -18, -16, -22, -6); g.stroke();
      for (let i = 0; i < 6; i++){ g.fillStyle = i % 2 ? PAL.leafL : PAL.leafM; ov(g, -22 + Math.sin(i * 1.7) * 2.6, -28 + i * 3.8, 1.5, 1, i); g.fill(); } }
  }}),
  tomb: (seed, v = 0) => makeProp({w:30, h:36, ax:15, ay:32, seed, shadow:[10, 3], collide:7, paint(g, rng){
    if (v === 1){ // ธาตุเก็บกระดูก: a little reliquary chedi with a portrait niche, bell, rings, spire and a marigold garland
      plank(g, -9, -4, 18, 4, '#b8b0a0', '#d8d0c0', '#8a8272'); plank(g, -7, -12, 14, 8, '#d8d0c0', '#eee6d6', '#a8a090');
      g.fillStyle = PAL.gold; g.fillRect(-3, -11, 6, 5.6); g.fillStyle = '#4a3a2e'; g.fillRect(-2.2, -10.3, 4.4, 4.2); g.fillStyle = '#e0c8a8'; ov(g, 0, -8.8, 1.1, 1.3); g.fill(); g.fillStyle = '#2a2a2a'; g.fillRect(-1.4, -7.4, 2.8, 1.3);
      for (let i = 0; i < 7; i++){ g.fillStyle = i % 2 ? '#f39c27' : '#ffd45a'; ov(g, -6 + i * 2, -4.4 + Math.sin(i * .9) * .5, 1.1, 1.1); g.fill(); }
      g.fillStyle = '#c8c0b0'; ov(g, 0, -13, 6.4, 1.4); g.fill();
      g.fillStyle = '#e4dccc'; g.beginPath(); g.moveTo(-5.6, -13.4); g.bezierCurveTo(-5.6, -18, -3, -20.4, -1.6, -21); g.lineTo(1.6, -21); g.bezierCurveTo(3, -20.4, 5.6, -18, 5.6, -13.4); g.fill();
      g.fillStyle = 'rgba(30,20,10,.16)'; ov(g, 3, -16.6, 2.4, 3.4); g.fill();
      for (let i = 0; i < 4; i++){ g.fillStyle = i % 2 ? '#c8c0b0' : '#e4dccc'; ov(g, 0, -21.6 - i * 1.6, 2 - i * .3, .7); g.fill(); }
      g.fillStyle = '#c8c0b0'; pv(g, [-1, -27.6, 0, -31, 1, -27.6]); g.fill(); g.fillStyle = PAL.gold; ov(g, 0, -31.2, .7, .7); g.fill(); return; }
    // weathered headstone: carved border, worn inscription, a crack, lichen; incense sticks in a sand pot
    g.fillStyle = '#5a564e'; pv(g, [-8.5, 0, -8.5, -18, -4.5, -23.5, 4.5, -23.5, 8.5, -18, 8.5, 0]); g.fill();
    g.fillStyle = '#8a867c'; pv(g, [-8.5, -1, -8.5, -18, -4.5, -22.8, 3, -22.8, 3, -1]); g.fill();
    g.strokeStyle = '#a8a498'; g.lineWidth = .6; g.beginPath(); g.moveTo(-6.4, -2); g.lineTo(-6.4, -17); g.lineTo(-3.6, -20.6); g.lineTo(3.6, -20.6); g.lineTo(6.4, -17); g.lineTo(6.4, -2); g.stroke();
    g.strokeStyle = '#4a463e'; g.lineWidth = .7; for (const [y, w] of [[-16.5, 3.4], [-13, 4], [-10, 4], [-7, 2.6]]){ g.beginPath(); g.moveTo(-w, y); g.lineTo(w, y); g.stroke(); }
    g.lineWidth = .5; g.beginPath(); g.moveTo(5, -23); g.lineTo(3.4, -19); g.lineTo(4.6, -16); g.lineTo(2.8, -12); g.stroke();
    g.fillStyle = 'rgba(190,200,120,.55)'; ov(g, -5, -19, 2, 1.2); g.fill(); ov(g, 4, -5, 1.6, 1); g.fill(); g.fillStyle = PAL.moss; ov(g, -5, -1.5, 4, 1.4); g.fill();
    g.fillStyle = '#8a3a26'; pv(g, [-3, 3, 3, 3, 2.4, .2, -2.4, .2]); g.fill(); g.fillStyle = '#d8c8a0'; ov(g, 0, .4, 2.4, .6); g.fill();
    g.strokeStyle = '#c0392b'; g.lineWidth = .4; for (const x of [-1, 0, 1]){ g.beginPath(); g.moveTo(x * .9, .2); g.lineTo(x * 1.6, -4.4); g.stroke(); }
  }}),
  stalag: (seed, v = 0) => makeProp({w:40, h:70, ax:20, ay:64, seed, shadow:[12, 4], collide:10, paint(g, rng){
    const c = v === 1 ? ['#8ab0c8', '#b8d8ec', '#e8f6ff'] : ['#6a6052', '#8a8070', '#b0a690'];
    const h = 40 + rng() * 18;
    g.fillStyle = c[0]; pv(g, [-11, 0, -5, -h * .55, -1, -h, 4, -h * .6, 11, 0]); g.fill();
    g.fillStyle = c[1]; pv(g, [-10, -1, -5, -h * .55, -1, -h + 2, 0, -2]); g.fill();
    g.fillStyle = c[2]; pv(g, [-7, -12, -4, -h * .5, -2, -h * .7, -4, -14]); g.fill();
    g.fillStyle = c[0]; pv(g, [8, 0, 11, -16, 15, 0]); g.fill();
  }}),
  crystal: (seed, v = 0) => makeProp({w:44, h:60, ax:22, ay:54, seed, shadow:[12, 4], collide:9, glow:[0, -22, 40], paint(g, rng){
    const [d, m, l] = VPAL.crystal[v % 4];
    for (const [x, h, a] of [[-6, 34, -.25], [6, 26, .3], [0, 46, 0], [-12, 18, -.5], [11, 16, .55]]){
      g.save(); g.translate(x, 0); g.rotate(a);
      g.fillStyle = d; pv(g, [-4.5, 0, -4.5, -h * .8, 0, -h, 4.5, -h * .8, 4.5, 0]); g.fill();
      g.fillStyle = m; pv(g, [-4.5, 0, -4.5, -h * .8, 0, -h, 0, 0]); g.fill();
      g.fillStyle = l; pv(g, [-3, -4, -3, -h * .75, -.5, -h * .9, -.5, -6]); g.fill(); g.restore(); }
  }}),
  boat: seed => makeProp({w:80, h:30, ax:40, ay:20, seed, shadow:[30, 5], collide:0, paint(g, rng){
    g.fillStyle = '#4a2e1a'; g.beginPath(); g.moveTo(-34, -8); g.quadraticCurveTo(-30, 4, 0, 4); g.quadraticCurveTo(30, 4, 34, -8); g.lineTo(26, -6); g.lineTo(-26, -6); g.fill();
    g.fillStyle = '#6e4a2e'; g.fillRect(-26, -8, 52, 3); g.fillStyle = '#9a6c42'; g.fillRect(-26, -8, 52, 1);
    g.fillStyle = '#c8a050'; ov(g, -6, -12, 9, 5); g.fill(); g.fillStyle = '#e8c070'; ov(g, -8, -13, 5, 3); g.fill();
    g.fillStyle = '#7a5a8a'; ov(g, 12, -11, 5, 3); g.fill();
  }}),
  reed: seed => makeProp({w:30, h:40, ax:15, ay:36, seed, collide:0, paint(g, rng){
    for (let i = 0; i < 9; i++){ const x = (rng() - .5) * 20, h = 18 + rng() * 16, b = (rng() - .5) * 6; g.strokeStyle = i % 2 ? '#6a8a3a' : '#8aa84a'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + b * .3, -h * .6, x + b, -h); g.stroke();
      if (i % 3 === 0){ g.fillStyle = '#7a5a32'; ov(g, x + b, -h - 2, 1.2, 3.4); g.fill(); } }
  }}),
  coral: (seed, v = 0) => makeProp({w:40, h:40, ax:20, ay:34, seed, shadow:[12, 3], collide:0, paint(g, rng){
    const [d, l] = VPAL.coral[v % 3];
    const br = (x, y, a, len, w) => { if (len < 3) return; const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; g.strokeStyle = d; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
      g.strokeStyle = l; g.lineWidth = w * .45; g.beginPath(); g.moveTo(x - .5, y); g.lineTo(x2 - .5, y2); g.stroke(); br(x2, y2, a - .5, len * .7, w * .75); br(x2, y2, a + .45, len * .65, w * .7); };
    br(-4, 0, -Math.PI / 2 - .3, 12, 4); br(5, 0, -Math.PI / 2 + .3, 10, 3.6);
  }}),
  himtree: (seed, v = 0) => makeProp({w:100, h:124, ax:50, ay:116, seed, shadow:[30, 10], collide:12, paint(g, rng){
    // a Himmapan tree: twisting gold-ringed trunk and puffs of vivid foliage with blossoms
    const [d, m, l] = VPAL.him[v % 4], pal = {leafD:d, leafM:m, leafL:l, leafH:'#fff4e0'};
    g.fillStyle = '#5a3a2a'; pv(g, [-6, 0, -3, -24, -10, -40, -4, -42, 1, -30, 6, -46, 11, -44, 4, -24, 7, 0]); g.fill();
    g.fillStyle = '#e3b04b'; g.fillRect(-5, -12, 11, 1.6); g.fillRect(-4, -20, 9, 1.4);
    for (const [x, y, r] of [[0, -74, 24], [-24, -58, 17], [24, -60, 17], [-12, -92, 15], [14, -94, 15]]) leafCluster(g, x, y, r, rng, pal);
    for (let i = 0; i < 14; i++){ const a = rng() * 6.28, dd = rng() * 30; g.fillStyle = rng() < .5 ? '#fff4c8' : '#ffffff'; ov(g, Math.cos(a) * dd, -76 + Math.sin(a) * dd * .8, 1.8, 1.8); g.fill(); }
  }}),
  sala: (seed, v = 0) => makeProp({w:110, h:110, ax:55, ay:100, seed, shadow:[44, 12], collide:32, paint(g, rng){
    // open pavilion (ศาลา): stucco plinth with steps, red columns with บัวหัวเสา, bench backrests with balusters, a free drinking-water jar (โอ่งน้ำทาน),
    // a gable roof with ป้านลม ใบระกา ช่อฟ้า หางหงส์ over a carved หน้าบัน, and ลด side eaves (v1: gilded roof)
    const gold = v === 1, T = gold ? [PAL.gold, PAL.goldL, PAL.goldD] : [PAL.roofM, PAL.roofL, PAL.roofD], E = gold ? [PAL.goldD, PAL.gold, '#6e4a12'] : [PAL.tileG, PAL.tileGL, '#284a34'];
    const BC = gold ? ['#8a2a20', '#c04a3a', '#5e1f19'] : [PAL.gold, PAL.goldL, PAL.goldD];
    plank(g, -46, -10, 92, 10, PAL.whiteD, PAL.white, '#a99b7c'); g.fillStyle = PAL.white; g.fillRect(-46, -10, 92, 1.6);
    g.fillStyle = 'rgba(120,100,70,.2)'; for (let i = 0; i < 5; i++) g.fillRect(-44 + rng() * 86, -8, .6, 3 + rng() * 5);
    plank(g, -12, -5, 24, 5, PAL.white, '#ffffff', PAL.whiteD); plank(g, -10, -10, 20, 5, PAL.white, '#ffffff', PAL.whiteD);
    // shaded interior with the back row of columns
    g.fillStyle = 'rgba(40,20,12,.62)'; g.fillRect(-40, -56, 80, 46); g.fillStyle = 'rgba(160,140,110,.5)'; g.fillRect(-40, -14, 80, 4);
    for (const x of [-28, -9, 9, 28]){ g.fillStyle = '#5e1f19'; g.fillRect(x - 1.6, -56, 3.2, 44); }
    ong(g, -25, -10, .8); g.fillStyle = '#6e4a2e'; ov(g, -21, -18.4, 1.6, .9); g.fill();
    // bench backrests (พนักพิง) between outer and inner columns
    for (const s of [-1, 1]){ const x0 = s > 0 ? 15 : -36; plank(g, x0, -25, 21, 2.2, PAL.teakM, PAL.teakL, PAL.teakD); plank(g, x0, -15, 21, 2, PAL.teakM, PAL.teakL, PAL.teakD);
      g.fillStyle = PAL.teakD; for (let x = x0 + 2; x < x0 + 21; x += 3) g.fillRect(x, -23, 1, 8); }
    for (const x of [-38, -13, 13, 38]){ plank(g, x - 2.4, -56, 4.8, 46, '#8a2a20', '#b8503a', '#5e1f19');
      g.fillStyle = PAL.gold; pv(g, [x - 2.4, -10, x, -16, x + 2.4, -10]); g.fill(); pv(g, [x - 2.4, -56, x, -50, x + 2.4, -56]); g.fill();
      g.fillStyle = PAL.goldD; g.fillRect(x - 3.2, -58, 6.4, 2); g.fillStyle = PAL.gold; for (let k = -1; k <= 1; k++){ ov(g, x + k * 2, -59.4, 1.2, 1.8); g.fill(); } }
    // ลด side eaves
    for (const s of [-1, 1]){ roofBand(g, s * 50, -50, s * 34, -66, 7, E, 7); roofBand(g, s * 50, -50, s * 34, -66, 5, T, 7);
      barge(g, s * 50, -50, s * 34, -66, 1.8, 4, BC); hangHong(g, s * 50, -50, s, BC[0]); }
    // คอสอง beam + name board
    plank(g, -43, -63, 86, 5, '#8a2a20', '#b8503a', '#5e1f19'); g.fillStyle = PAL.gold; g.fillRect(-43, -63, 86, .7); g.fillRect(-43, -58.7, 86, .7);
    plank(g, -8, -58, 16, 5, '#8a2a20', '#b8503a', '#5e1f19'); g.fillStyle = PAL.gold; g.strokeStyle = PAL.gold; g.lineWidth = .5; g.strokeRect(-7.4, -57.4, 14.8, 3.8); for (let x = -5; x < 5; x += 2.5) g.fillRect(x, -56, 1.6, .9);
    // main gable
    const ga = -91, ge = -61;
    for (const s of [-1, 1]){ roofBand(g, s * 41, ge, 0, ga, 7.5, E, 11); roofBand(g, s * 41, ge, 0, ga, 5.2, T, 11); }
    g.fillStyle = gold ? '#8a2a20' : PAL.teakM; pv(g, [-39, ge - 1, 0, ga + 1, 39, ge - 1]); g.fill();
    if (gold){ g.fillStyle = PAL.gold; ov(g, 0, -72, 4, 4.6); g.fill(); g.fillStyle = '#8a2a20'; ov(g, 0, -72, 2.4, 3); g.fill(); g.fillStyle = PAL.goldL; ov(g, 0, -72.6, 1, 1.2); g.fill();
      g.strokeStyle = PAL.gold; g.lineWidth = .8; for (const s of [-1, 1]) for (const [x, y, r] of [[10, -67, 2.4], [20, -65.4, 1.8], [29, -64, 1.3]]){ g.beginPath(); g.arc(s * x, y, r, 0, Math.PI * 1.5, s < 0); g.stroke(); } }
    else { g.save(); pv(g, [-39, ge - 1, 0, ga + 1, 39, ge - 1]); g.clip();   // จั่วลูกฟัก: framed raised panels
      for (let r = 0; r < 4; r++) for (let c = -5; c < 5; c++){ const x = c * 8 + 1, y = ge - 7.6 * (r + 1) + 1; g.fillStyle = PAL.teakL; g.fillRect(x, y, 6, 5.6); g.fillStyle = PAL.teakH; g.fillRect(x, y, 6, .5); g.fillStyle = PAL.teakD; g.fillRect(x, y + 5.1, 6, .5); }
      g.restore(); g.fillStyle = PAL.gold; ov(g, 0, -71, 2.4, 2.4); g.fill(); }
    for (const s of [-1, 1]){ barge(g, s * 41, ge, 0, ga, 2.2, 8, BC); hangHong(g, s * 41, ge, s, BC[0]); }
    chofa(g, 0, ga, 8, BC[0]);
  }}),
  statue: (seed, v = 0) => makeProp({w:44, h:58, ax:22, ay:52, seed, shadow:[14, 4], collide:10, paint(g, rng){
    // a seated singha guardian on a plinth (stone, gold or ice)
    const c = v === 1 ? [PAL.goldD, PAL.gold, PAL.goldL] : v === 2 ? ['#7aa0c0', '#a8d0ec', '#e8f6ff'] : [PAL.stoneD, PAL.stone, PAL.stoneL];
    g.fillStyle = c[0]; g.fillRect(-14, -10, 28, 10); g.fillStyle = c[1]; g.fillRect(-14, -10, 20, 9);
    g.fillStyle = c[0]; ov(g, 0, -22, 10, 12); g.fill(); g.fillStyle = c[1]; ov(g, -2, -24, 8, 10); g.fill();
    g.fillStyle = c[0]; ov(g, 2, -38, 9, 9); g.fill(); g.fillStyle = c[1]; ov(g, 0, -40, 7.5, 7.5); g.fill(); g.fillStyle = c[2]; ov(g, -3, -43, 3, 2.4); g.fill();
    for (let i = 0; i < 7; i++){ const a = -2.6 + i * .5; g.fillStyle = c[i % 2 ? 0 : 2]; ov(g, Math.cos(a) * 10, -38 + Math.sin(a) * 10, 2.6, 2.6); g.fill(); }
    g.fillStyle = '#2a1a14'; ov(g, -2, -40, 1.2, 1.2); g.fill(); ov(g, 4, -40, 1.2, 1.2); g.fill();
  }}),
  stilt: seed => makeProp({w:110, h:110, ax:55, ay:102, seed, shadow:[40, 10], collide:30, paint(g, rng){
    // riverside stilt house (เรือนเครื่องผูก): round posts with X-bracing and water marks, a fish trap (ไซ) and jar below, railed porch with a drying net,
    // bamboo ladder, woven bamboo walls (ฝาขัดแตะ), a side-hung shutter, and a thick nipa-thatch roof (หลังคาจาก) with a ridge cap
    const BAM = ['#7e6c34', '#ae9a52', '#d4c07a'];
    g.fillStyle = 'rgba(30,20,10,.32)'; g.fillRect(-38, -37, 76, 35);
    g.strokeStyle = PAL.barkD; g.lineWidth = 1.5; for (const [a, b] of [[-34, -12], [12, 34]]){ g.beginPath(); g.moveTo(a, -6); g.lineTo(b, -33); g.moveTo(a, -33); g.lineTo(b, -6); g.stroke(); }
    ong(g, 23, 0, .85);
    for (const x of [-34, -12, 12, 34]){ plank(g, x - 2.2, -37, 4.4, 37, PAL.barkM, PAL.barkL, PAL.barkD); g.fillStyle = PAL.barkD; for (let y = -31; y < 0; y += 8) g.fillRect(x - 2.2, y, 4.4, .7); g.fillStyle = 'rgba(40,60,50,.4)'; g.fillRect(x - 2.2, -6, 4.4, 6); }
    // ไซ fish trap hung on a post
    g.fillStyle = BAM[1]; pv(g, [-12, -27, -8, -27, -9.4, -13, -10.6, -13]); g.fill(); g.strokeStyle = BAM[0]; g.lineWidth = .4; for (let y = -25; y < -13; y += 2.4){ g.beginPath(); g.moveTo(-12, y); g.lineTo(-8, y); g.stroke(); }
    // floor, porch with railing + drying net
    plank(g, -40, -42, 80, 5, PAL.teakM, PAL.teakL, PAL.teakD); plank(g, -54, -41, 15, 4, PAL.teakM, PAL.teakL, PAL.teakD); plank(g, -53, -37, 2.6, 37, PAL.barkM, PAL.barkL, PAL.barkD);
    g.fillStyle = BAM[1]; g.fillRect(-54, -50, 14, 1.4); for (const x of [-53.6, -47, -41]) g.fillRect(x, -50, 1.2, 9);
    g.strokeStyle = 'rgba(200,200,190,.7)'; g.lineWidth = .35; for (let i = 0; i < 6; i++){ g.beginPath(); g.moveTo(-53 + i * 2.2, -49); g.lineTo(-51 + i * 2.2, -40); g.moveTo(-51 + i * 2.2, -49); g.lineTo(-53 + i * 2.2, -40); g.stroke(); }
    // woven walls with a timber frame
    for (let r = 0; r < 9; r++) for (let c = 0; c < 18; c++){ g.fillStyle = (r + c) % 2 ? BAM[2] : BAM[0]; g.fillRect(-36 + c * 4 + .2, -67 + r * 2.8 + .2, 3.6, 2.4); g.fillStyle = 'rgba(255,255,220,.25)'; g.fillRect(-36 + c * 4 + .2, -67 + r * 2.8 + .2, 3.6, .4); }
    for (const x of [-37, -1, 35]) plank(g, x, -68, 2.4, 27, PAL.barkM, PAL.barkL, PAL.barkD);
    plank(g, -38, -68, 76, 2, PAL.barkM, PAL.barkL, PAL.barkD);
    g.fillStyle = '#1e120a'; g.fillRect(-14, -63, 11, 21); g.fillStyle = BAM[1]; pv(g, [-14, -63, -19, -61, -19, -42, -14, -42]); g.fill(); g.strokeStyle = BAM[0]; g.lineWidth = .4; for (let y = -60; y < -42; y += 3){ g.beginPath(); g.moveTo(-19, y); g.lineTo(-14, y - 1); g.stroke(); }
    g.fillStyle = '#1e120a'; g.fillRect(14, -61, 12, 9); g.fillStyle = '#e8b85a'; g.fillRect(15.5, -59.5, 9, 5); plank(g, 26, -62, 6, 11, BAM[1], BAM[2], BAM[0]); g.fillStyle = BAM[0]; g.fillRect(14, -52, 12, 1);
    // bamboo ladder leaning on the floor beam
    g.strokeStyle = BAM[1]; g.lineWidth = 1.6; g.beginPath(); g.moveTo(44, 0); g.lineTo(38, -40); g.moveTo(51, 0); g.lineTo(45, -40); g.stroke();
    g.lineWidth = 1.1; for (let i = 1; i < 7; i++){ const y = -i * 5.6, d = i * .84; g.beginPath(); g.moveTo(44 - d, y); g.lineTo(51 - d, y); g.stroke(); }
    // thatch: woven gable end, thick layered slopes with ragged fringes, ridge cap
    g.fillStyle = BAM[0]; pv(g, [-38, -66, 0, -92, 38, -66]); g.fill(); g.save(); g.clip(); g.fillStyle = BAM[1]; for (let x = -36; x < 36; x += 3) g.fillRect(x, -92, 1.6, 26); g.restore();
    g.fillStyle = '#4a3418'; pv(g, [-3, -79, 0, -83.4, 3, -79]); g.fill();
    for (const s of [-1, 1]){ g.fillStyle = PAL.strawD; pv(g, [s * 52, -60, s * 38, -66, 0, -93, 0, -102]); g.fill();
      for (let i = 0; i < 70; i++){ const t = rng(), o = rng(), x = s * (52 - 52 * t) + s * (-14 * (1 - t)) * o, y = -60 - 42 * t + (-6 + 9 * t) * o;
        g.strokeStyle = rng() < .5 ? PAL.straw : rng() < .5 ? PAL.strawL : '#8a6420'; g.lineWidth = .5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 2.6, y + 3.2); g.stroke(); }
      g.strokeStyle = '#7a5418'; g.lineWidth = .6; for (let k = 1; k < 6; k++){ const t = k / 6; g.beginPath(); g.moveTo(s * 52 * (1 - t), -60 - 42 * t); g.lineTo(s * (38 - 38 * t), -66 - 27 * t); g.stroke(); }
      g.strokeStyle = PAL.strawD; g.lineWidth = .6; for (let k = 0; k < 7; k++){ const x = s * (39 + k * 2), y = -66 + (k * 2) * (6 / 14); g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * (rng() - .2), y + 2.4 + rng() * 2); g.stroke(); } }
    g.fillStyle = '#7a5418'; pv(g, [-7, -97, 0, -103, 7, -97, 0, -99]); g.fill(); g.strokeStyle = '#5a3c10'; g.lineWidth = .5; for (const x of [-4, 4]){ g.beginPath(); g.moveTo(x, -97.6); g.lineTo(x * .6, -100.6); g.stroke(); }
  }}),
  stall: (seed, v = 0) => makeProp({w:70, h:70, ax:35, ay:62, seed, shadow:[26, 7], collide:18, paint(g, rng){
    // market stall (แผงตลาด): bamboo frame, plank counter with a woven skirt, goods heaped on round กระด้ง trays, a basket on the ground,
    // hanging bananas / chilli strings / a ผ้าขาวม้า, a striped canvas awning with a scalloped hem and a little chalk price board
    const aw = [['#c0392b', '#f4ecdb'], ['#2a7a5a', '#f4ecdb'], ['#e3b04b', '#8a2a20']][v % 3];
    const goods = [[['#f0c040', '#ffe27a'], ['#c83a3a', '#f07a6a'], ['#7ab04a', '#b8dc6a']], [['#5a9a3a', '#9ad06a'], ['#e85a2a', '#ff9a5a'], ['#7a3a8a', '#b07ac0']], [['#a0522d', '#d08a50'], ['#d84a2a', '#f08a4a'], ['#e8c040', '#fff0a0']]][v % 3];
    const BAM = ['#7e6c34', '#ae9a52', '#d4c07a'];
    for (const x of [-22, 22]){ g.fillStyle = '#5e4e24'; g.fillRect(x - 1, -50, 2, 34); }
    for (let r = 0; r < 6; r++) for (let c = 0; c < 18; c++){ g.fillStyle = (r + c) % 2 ? BAM[2] : BAM[1]; g.fillRect(-27 + c * 3 + .2, -15 + r * 2.5 + .2, 2.6, 2.1); }
    plank(g, -29, -19, 58, 4, PAL.teakL, PAL.teakH, PAL.teakD); grain(g, -29, -18.4, 58, 3, rng, 6);
    // ตะกร้า basket on the ground
    g.fillStyle = BAM[0]; pv(g, [-34.5, -6, -26, -6, -27, 0, -33.5, 0]); g.fill(); g.strokeStyle = BAM[2]; g.lineWidth = .4; for (let y = -5; y < 0; y += 1.4){ g.beginPath(); g.moveTo(-34, y); g.lineTo(-26.5, y); g.stroke(); }
    g.strokeStyle = BAM[1]; g.lineWidth = .7; g.beginPath(); g.ellipse(-30.2, -6, 3.6, 3.4, 0, Math.PI, 0); g.stroke();
    g.fillStyle = goods[0][0]; ov(g, -31.5, -6.4, 1.4, 1.1); g.fill(); g.fillStyle = goods[2][0]; ov(g, -29, -6.6, 1.4, 1.1); g.fill();
    // กระด้ง trays heaped with goods
    for (const [i, tx] of [[0, -16], [1, 0], [2, 16]]){ const [d, l] = goods[i];
      g.fillStyle = BAM[0]; ov(g, tx, -19.6, 8.4, 2.6); g.fill(); g.fillStyle = BAM[2]; ov(g, tx, -20.2, 7.4, 2); g.fill();
      for (let k = 0; k < 11; k++){ const a = rng() * 6.28, rr = Math.sqrt(rng()), x = tx + Math.cos(a) * rr * 5.6, y = -21 - (1 - rr) * 3.6 + Math.sin(a) * rr * 1.2;
        g.fillStyle = d; ov(g, x, y, 1.9, 1.6); g.fill(); g.fillStyle = l; ov(g, x - .6, y - .6, .7, .5); g.fill(); } }
    for (const x of [-27, 27]){ plank(g, x - 1.6, -48, 3.2, 48, BAM[1], BAM[2], BAM[0]); g.fillStyle = BAM[0]; for (let y = -42; y < 0; y += 9) g.fillRect(x - 1.6, y, 3.2, .8); }
    // hanging wares under the awning
    g.strokeStyle = '#5e4e24'; g.lineWidth = .4;
    if (v % 3 === 0){ g.beginPath(); g.moveTo(-14, -46); g.lineTo(-14, -42); g.stroke(); for (let k = 0; k < 7; k++){ g.strokeStyle = k % 2 ? '#d8c040' : '#b8c040'; g.lineWidth = 1.4; g.beginPath(); g.arc(-14 + (k % 3 - 1) * 2.2, -40 + Math.floor(k / 3) * 2.2, 2.2, .3, 2.2); g.stroke(); } }
    else if (v % 3 === 1){ for (const x of [-17, -12]){ g.beginPath(); g.moveTo(x, -46); g.lineTo(x, -33); g.stroke(); for (let k = 0; k < 7; k++){ g.fillStyle = k % 2 ? '#d8281e' : '#f04a2a'; ov(g, x + (k % 2 ? .9 : -.9), -44 + k * 1.6, .9, .5, k % 2 ? .6 : -.6); g.fill(); } } }
    else { const cl = ['#c0392b', '#2a4a8a', '#f4ecdb']; for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++){ g.fillStyle = cl[(r + c) % 3]; g.fillRect(8 + c * 2, -46 + r * 2, 2, 2); } }
    // awning: striped sloping canvas with a scalloped hem
    for (let i = 0; i < 6; i++){ g.fillStyle = aw[i % 2]; pv(g, [-30 + i * 10, -58, -30 + (i + 1) * 10, -58, -34 + (i + 1) * 11.33, -46, -34 + i * 11.33, -46]); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.18)'; pv(g, [-30, -58, 30, -58, 31, -55, -31, -55]); g.fill();
    for (let i = 0; i < 12; i++){ g.fillStyle = aw[Math.floor(i / 2) % 2]; g.beginPath(); g.arc(-34 + i * 5.67 + 2.83, -46, 2.83, 0, Math.PI); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-34, -46.6, 68, .8);
    // chalk price board on the right pole
    plank(g, 24, -33, 9, 6.6, '#2e3a32', '#44544a', '#1a221e'); g.fillStyle = '#e8e8dc'; g.fillRect(25.6, -31, 4, .6); g.fillRect(25.6, -29.2, 5.6, .6);
  }}),
  portal: (seed, v = 0) => makeProp({w:70, h:96, ax:35, ay:88, seed, collide:0, glow:[0, -40, 60], paint(g, rng){
    // ซุ้มประตู gateway: red ย่อมุม posts on ฐานสิงห์ pedestals with garlands, a frieze beam with hanging gilt pendants (อุบะ),
    // a tiled gable with a gilt หน้าบัน, ใบระกา, ช่อฟ้า and หางหงส์, marking the way to the next region
    for (const s of [-1, 1]){ const x = s * 23;
      plank(g, x - 5, -7, 10, 7, PAL.whiteD, PAL.white, '#a99b7c'); g.fillStyle = PAL.gold; g.fillRect(x - 5, -7, 10, .8); g.fillStyle = '#b3a586'; g.fillRect(x - 4.4, -4.6, 8.8, 1.6);
      plank(g, x - 3, -66, 6, 59, '#8a2a20', '#b8503a', '#5e1f19'); g.fillStyle = '#6e1e18'; g.fillRect(x + .9, -66, .8, 59);
      g.fillStyle = PAL.gold; pv(g, [x - 3, -7, x, -15, x + 3, -7]); g.fill(); pv(g, [x - 3, -64, x, -57, x + 3, -64]); g.fill(); g.fillRect(x - 3.4, -38, 6.8, 1.6);
      for (let i = 0; i < 8; i++){ g.fillStyle = i % 2 ? '#f39c27' : '#ffd45a'; ov(g, x - s * .6 + Math.sin(i * 1.2) * .5, -55 + i * 1.9, 1.2, 1); g.fill(); } g.fillStyle = '#e74c3c'; ov(g, x - s * .6, -39.6, 1, 1.4); g.fill(); }
    plank(g, -31, -71, 62, 5, '#8a2a20', '#b8503a', '#5e1f19'); g.fillStyle = PAL.gold; g.fillRect(-31, -71, 62, .8); g.fillRect(-31, -66.8, 62, .8);
    for (let x = -28; x <= 28; x += 4){ pv(g, [x, -69, x + 1, -70, x + 2, -69, x + 1, -68]); g.fill(); }
    g.strokeStyle = PAL.goldD; g.lineWidth = .4; for (let x = -18; x <= 18; x += 4){ g.beginPath(); g.moveTo(x, -66); g.lineTo(x, -63); g.stroke(); g.fillStyle = PAL.gold; ov(g, x, -62.4, .9, 1.3); g.fill(); }
    for (const s of [-1, 1]){ roofBand(g, s * 31, -71, 0, -84, 5.4, [PAL.tileG, PAL.tileGL, '#284a34'], 8); roofBand(g, s * 31, -71, 0, -84, 3.8, [PAL.roofM, PAL.roofL, PAL.roofD], 8); }
    g.fillStyle = '#7a1c18'; pv(g, [-28, -71, 0, -83, 28, -71]); g.fill();
    g.fillStyle = PAL.gold; ov(g, 0, -75.4, 2.6, 2.6); g.fill(); g.fillStyle = PAL.goldL; ov(g, -.5, -76, 1, 1); g.fill();
    g.strokeStyle = PAL.gold; g.lineWidth = .6; for (const s of [-1, 1]) for (const [x, r] of [[7, 1.6], [14, 1.2]]){ g.beginPath(); g.arc(s * x, -73.4, r, 0, Math.PI * 1.5, s < 0); g.stroke(); }
    for (const s of [-1, 1]){ barge(g, s * 31, -71, 0, -84, 1.8, 6); hangHong(g, s * 31, -71, s, PAL.gold); }
    chofa(g, 0, -84, 3.6, PAL.gold);
  }})
});
