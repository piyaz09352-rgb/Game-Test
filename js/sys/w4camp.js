/* VAYRATHEN — js/sys/w4camp.js — the camp on the maps of data/world4.js keeps to its age and land (v152)
   Every field map's camp rests under the World Tree (sys/worldtree.js), hung with three-coloured cloth. In the Age
   of Dinosaurs that tree is an ancient araucaria instead; past the volcano the camp shelters by a dragon's skull
   (dragon lands) or a violet obelisk (demon lands). Loaded after sys/worldtree.js. */
'use strict';
{ const _cp = campPlace;
  campPlace = function(){
    const r = _cp.apply(this, arguments), mp = MAPS[MAP_ID]; if (!mp || !mp.w4) return r;
    const i = PROPS.findIndex(p => p.type === 'worldtree'); if (i < 0) return r;
    const p = PROPS[i]; PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1);
    const kind = mp.land === 'fertile' ? 'camparaucaria' : ['dragonvale', 'dragonroost'].includes(mp.biome) ? 'dragonskull' : 'obelisk';
    addProp(kind, p.x + (kind === 'camparaucaria' ? 0 : 60), p.y + (kind === 'camparaucaria' ? 0 : 20), 0);
    if (typeof NAV !== 'undefined') NAV.grid = null;
    return r;
  }; }

/* (v154) the World Trees keep their land's mood in natural colours (see world/props4.js) */
if (typeof CAMP_THEME !== 'undefined'){
  Object.assign(CAMP_THEME.volcanic.leaf, {leafD:'#4a2a14', leafM:'#7a4a1e', leafL:'#a8702e'});
  Object.assign(CAMP_THEME.dark.leaf, {leafD:'#1e3020', leafM:'#2e4a2e', leafL:'#4e6a3e'});
  Object.assign(CAMP_THEME.light.leaf, {leafD:'#5a6a22', leafM:'#8a8a2a', leafL:'#d8b830'});
}

/* ---------- (v158) the camp's great tree takes the shape of its land ----------
   Every camp had the same round, puffy World Tree in different colours. Now each land grows its own kind of giant,
   painted like the other plants (world/props4.js: lit leaf by leaf, grooved bark):
     fertile   a banyan (ไทร): several trunks, a wide spreading crown, curtains of aerial roots
     arid      a rain tree / acacia: a short forked trunk under a flat, layered umbrella crown
     volcanic  a fire-scarred giant: a charred trunk, bare limbs and a thin crown of rust-coloured leaves
     frozen    an ancient fir: a tall spire in tiers, every branch carrying snow
     dark      a gnarled old tree: a twisted trunk, drooping dark foliage, spirit lanterns
     light     a bodhi tree (โพธิ์): a broad dome of heart-shaped leaves, golden-green, white cloths
   All keep the three-coloured cloth (ผ้าสามสี) of a revered tree round the trunk. */
if (typeof PROP_TYPES !== 'undefined' && typeof p4canopy === 'function'){
  const cloth = (g, x, y, w) => { [['#d83a2a', 0], ['#e8c040', 2.6], ['#3a8ad8', 5.2]].forEach(([c, dy]) => { g.fillStyle = c; g.fillRect(x - w, y + dy, w * 2, 2.6); });
    g.fillStyle = '#d83a2a'; g.beginPath(); g.moveTo(x + w * .6, y + 6); g.lineTo(x + w * .9, y + 22); g.lineTo(x + w * .5, y + 20); g.closePath(); g.fill(); };
  const lantern = (g, x, y, col) => { g.strokeStyle = '#2a2018'; g.lineWidth = .6; g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x, y - 2); g.stroke(); g.fillStyle = col; ov(g, x, y + 2, 3.2, 4); g.fill(); g.fillStyle = '#fff4e0'; ov(g, x, y + 1, 1.3, 1.8); g.fill(); };
  const PAL_LAND = {
    fertile:P4.leaf[0], arid:['#2e3a1a', '#46562a', '#62743a', '#86984e', '#b0bc72'], volcanic:['#2a160c', '#4a2410', '#6e3a18', '#9a5a26', '#c8843a'],
    frozen:P4.needle, dark:['#121a14', '#1e2a20', '#2e3e2c', '#46563c', '#62724e'], light:['#3a4a1a', '#5a6a22', '#86902e', '#b4b83e', '#e0d870']};
  PROP_TYPES.worldtree = (seed, v) => { const land = CAMP_LANDS[v] || 'fertile', pal = PAL_LAND[land] || P4.leaf[0];
    return makeProp({w:400, h:360, ax:200, ay:340, seed, collide:24, glow:land === 'dark' ? [0, -110, 110] : null, paint(g, rng){
      const B = land === 'volcanic' ? ['#140c0a', '#2a1a14', '#3e2a20', '#5a3e2e', '#7a5a42'] : P4.bark;
      if (land === 'fertile'){   // banyan
        for (const [x, w] of [[-34, 7], [30, 6], [-8, 12], [12, 8]]){ p4roots(g, rng, x, 0, w, B); p4trunk(g, rng, x, 0, x * .6, -120, w, w * .7, B); }
        for (const [dx, dy] of [[-120, -150], [-70, -180], [0, -190], [70, -178], [124, -146]]) p4branch(g, B, 0, -118, dx, dy, 6);
        p4canopy(g, rng, 0, -200, 175, 80, pal, {dome:true, n:34, dense:.5});
        g.strokeStyle = B[1]; for (let i = 0; i < 40; i++){ const x = (rng() - .5) * 300, y0 = -170 + Math.abs(x) * .25, L = 40 + rng() * 110; g.lineWidth = .8 + rng() * .8; g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + (rng() - .5) * 6, y0 + L * .5, x + (rng() - .5) * 4, y0 + L); g.stroke(); }   // aerial roots
        cloth(g, -8, -60, 13);
      } else if (land === 'arid'){   // umbrella tree
        p4roots(g, rng, 0, 0, 9, B); p4trunk(g, rng, 0, 0, -6, -90, 10, 7, B);
        for (const [dx, dy] of [[-110, -130], [-50, -150], [40, -150], [112, -128]]) p4branch(g, B, -6, -86, dx, dy, 5);
        for (const [y, w, h] of [[-150, 175, 32], [-170, 140, 26], [-186, 96, 18]]) p4canopy(g, rng, 0, y, w, h, pal, {n:20, cr:.5, dense:.55});
        cloth(g, -3, -50, 11);
      } else if (land === 'volcanic'){   // fire-scarred giant
        p4roots(g, rng, 0, 0, 10, B); p4trunk(g, rng, 0, 0, 6, -140, 12, 6, B);
        const br = (x, y, a, len, w, d) => { if (d > 3) return; const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; p4trunk(g, rng, x, y, x2, y2, w, w * .6, B);
          if (d >= 2) p4canopy(g, rng, x2, y2, 26, 14, pal, {n:5, cr:.6, dense:.4}); br(x2, y2, a - .5, len * .7, w * .6, d + 1); br(x2, y2, a + .45, len * .66, w * .6, d + 1); };
        br(6, -140, -Math.PI / 2 - .5, 70, 6, 0); br(6, -140, -Math.PI / 2 + .55, 70, 6, 0);
        g.fillStyle = 'rgba(255,110,30,.8)'; for (let i = 0; i < 18; i++){ ov(g, (rng() - .5) * 18, -10 - rng() * 120, .9, 1.6); g.fill(); }   // embers in the bark cracks
        cloth(g, 1, -60, 12);
      } else if (land === 'frozen'){   // ancient fir
        p4roots(g, rng, 0, 0, 9, B); p4trunk(g, rng, 0, 0, 0, -90, 10, 6, B);
        for (let t = 0; t < 12; t++){ const k = t / 11, y = -60 - k * 250, w = 150 * (1 - k * .85) + 10;
          for (let i = 0; i < w * 3; i++){ const x = (rng() - .5) * 2 * w, yy = y - rng() * 22 + Math.abs(x) / w * 14, l = -(x / w) * .5 + (rng() - .5) * .6; g.strokeStyle = p4tone(pal, l); g.lineWidth = 1.3; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + (x < 0 ? -3 : 3), yy + 3.4); g.stroke(); }
          g.fillStyle = '#eef4fa'; for (let i = 0; i < w * .9; i++){ ov(g, (rng() - .5) * 1.8 * w, y - 18 - rng() * 5, 3, 1.4); g.fill(); } }
        cloth(g, 0, -50, 11);
      } else if (land === 'dark'){   // gnarled spirit tree
        p4roots(g, rng, 0, 0, 10, B);
        let x = 0, y = 0; for (let i = 0; i < 5; i++){ const nx = x + (i % 2 ? 14 : -14), ny = y - 30; p4trunk(g, rng, x, y, nx, ny, 11 - i * 1.2, 10 - i * 1.4, B); x = nx; y = ny; }
        for (const [dx, dy] of [[-120, -160], [-60, -190], [50, -190], [120, -160]]) p4branch(g, B, x, y, dx, dy, 5);
        p4canopy(g, rng, 0, -195, 160, 60, pal, {dome:true, n:28, dense:.45});
        g.strokeStyle = pal[1]; for (let i = 0; i < 50; i++){ const xx = (rng() - .5) * 290, y0 = -175 + Math.abs(xx) * .2, L = 20 + rng() * 40; g.lineWidth = 1.4; g.beginPath(); g.moveTo(xx, y0); g.lineTo(xx + (rng() - .5) * 3, y0 + L); g.stroke(); }   // drooping foliage
        for (let i = 0; i < 7; i++) lantern(g, -120 + i * 40 + (rng() - .5) * 10, -150 + Math.abs(i - 3) * 6, '#c8a0ff');
        cloth(g, -6, -60, 12);
      } else {   // bodhi
        p4roots(g, rng, 0, 0, 10, B); p4trunk(g, rng, 0, 0, 4, -120, 13, 8, B);
        for (const [dx, dy] of [[-130, -160], [-70, -200], [0, -215], [74, -198], [134, -158]]) p4branch(g, B, 4, -116, dx, dy, 6);
        p4canopy(g, rng, 4, -210, 170, 90, pal, {dome:true, n:34, dense:.5, leaf:2.8});
        g.fillStyle = '#f6f2e6'; for (let i = 0; i < 6; i++){ const xx = -100 + i * 40, yy = -140 + Math.abs(i - 2.5) * 8; g.fillRect(xx, yy, 3, 16 + rng() * 8); }   // white cloths on the limbs
        cloth(g, 2, -62, 14);
      }
    }}); }; }
