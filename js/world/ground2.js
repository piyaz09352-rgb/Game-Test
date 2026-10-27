/* VAYRATHEN — js/world/ground2.js — real ground under every map (v154)
   The ground was a flat colour with a few blurred blotches. Two things change:
   1. The thirty regions of data/world3.js were their borrowed biome dyed toward a hue (biome3.js), which pushed the
      saturation up and gave neon orange canyons, lemon-yellow cactus fields, royal-blue towers and lime palaces. The
      tint is now a light touch: the hue leans a little toward the region's colour and the saturation never rises
      above the natural ground it came from, so every region still looks like soil, sand, rock or snow.
   2. Every map gets a ground material painted in layers, large to small, the way a hand-painted tile is built:
        broad patches   where the ground changes (bare soil in grass, darker damp hollows, pale dry spots, drifts)
        clumps          tufts of grass, low herbs and moss in groups, lit from the upper left
        stones          pebbles and gravel with a highlight and a contact shadow, in drifts rather than evenly
        litter          fallen leaves and twigs under green lands, cracks in dry and volcanic ground, frost lines on ice
      The material follows the land: grass and forest floor, sand and dune ripples, dry cracked earth, red canyon
      rock, black basalt and ash, snow with blue shadows, clear ice, cave stone, dark mossy ground, pale heavenly marble.
   Loaded after world/maps.js and world/biome3.js. */
'use strict';

/* ---------- 1. a natural tint for the world3 regions ---------- */
function g2Tint(c, hue, k){
  if (typeof c !== 'string') return c;
  const m = c.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/), hex = m ? '#' + [m[1], m[2], m[3]].map(v => (+v).toString(16).padStart(2, '0')).join('') : c;
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return c;
  const [h, s, l] = w3Hsl(hex), dh = ((hue - h + 540) % 360) - 180, out = w3Hex(h + dh * k, Math.min(s, s * .9 + .03), l);
  if (!m) return out; const n = parseInt(out.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${m[4]})`;
}
b3Recipe = function(B, hue){
  const o = {...B}, map = (a, k) => (Array.isArray(a) ? a.map(c => g2Tint(c, hue, k)) : a);
  o.base = map(B.base, .09); o.mottle = map(B.mottle, .08); o.blades = B.blades && map(B.blades, .1); o.flowers = B.flowers && map(B.flowers, .5); o.road = map(B.road, .1);
  return o;
};

/* ---------- 2. ground materials ---------- */
const G2_KIND = b => (/^(desert|oasis|beach|isle)$/.test(b) ? 'sand' : /^(dryplain|ayodhya|khmer)$/.test(b) ? 'dry' : /^(canyon|dragonroost)$/.test(b) ? 'canyon'
  : /^(lavafield|crater|dragonvale|naraka)$/.test(b) ? 'basalt' : b === 'ashforest' ? 'ash' : /^(kailash|glacier|frostcitadel)$/.test(b) ? 'snow' : /^(frozenlake|icecave)$/.test(b) ? 'ice'
  : /^(cave|badan|demonthrone)$/.test(b) ? 'stone' : /^(cemetery|innerhim|laplae)$/.test(b) ? 'gloom' : /^(meru|tavatimsa)$/.test(b) ? 'marble' : /^(primeval|templeruins|bamboo)$/.test(b) ? 'forest' : 'grass');
const g2hsl = (hex, dl = 0, ds = 0, dh = 0) => { const [h, s, l] = w3Hsl(hex); return w3Hex(h + dh, clamp(s + ds, 0, 1), clamp(l + dl, .03, .97)); };
const g2a = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };

function groundDetail(g, B, mapId){
  const kind = G2_KIND((MAPS[mapId] || {}).biome || ''), A = typeof AREA === 'function' ? AREA() : 1, base = B.base[1] || B.base[0];
  const dark = g2hsl(base, -.12, -.05), deep = g2hsl(base, -.22, -.08), lite = g2hsl(base, .1, -.04), pale = g2hsl(base, .2, -.12);
  const soil = {grass:'#6e5636', forest:'#4e3a26', sand:'#c4a068', dry:'#9a7448', canyon:'#8a4a2e', basalt:'#2a2220', ash:'#5a5450', snow:'#c8d6e6', ice:'#a8c8e0', stone:'#3a3632', gloom:'#3a3428', marble:'#e8e0cc'}[kind];
  const stoneC = {grass:'#8a8478', forest:'#6e6a5e', sand:'#b0946a', dry:'#9a8a70', canyon:'#a0583a', basalt:'#3e3634', ash:'#6a6460', snow:'#8a96a6', ice:'#9ab0c4', stone:'#6a645a', gloom:'#5a564c', marble:'#c8c0b0'}[kind];
  // broad patches: soft irregular blobs built from many overlapping translucent ellipses (no hard edges)
  const patch = (n, col, a, rmin, rmax) => { for (let i = 0; i < n * A; i++){ const cx = R() * W, cy = R() * H, r = rmin + R() * (rmax - rmin), k = 14 + Math.floor(R() * 12); a *= .82;
      for (let j = 0; j < k; j++){ const x = cx + (R() - .5) * r * 1.6, y = cy + (R() - .5) * r * .9, rr = r * (.12 + R() * .3); g.fillStyle = g2a(col, a * (.5 + R() * .5)); g.beginPath(); g.ellipse(x, y, rr, rr * (.45 + R() * .25), R() * .6 - .3, 0, 7); g.fill(); } } };
  // a tuft: a few short blades fanning out of one root, dark at the base and lit at the tips
  const tufts = (n, cols, h, clump) => { for (let i = 0; i < n * A; i++){ const cx = R() * W, cy = R() * H, m = 1 + Math.floor(R() * clump); if (trailD(cx, cy) < 26) continue;
      for (let j = 0; j < m; j++){ const x = cx + (R() - .5) * 18, y = cy + (R() - .5) * 8, bl = 4 + Math.floor(R() * 4), hh = h * (.6 + R() * .7);
        for (let b = 0; b < bl; b++){ const a = -Math.PI / 2 + (b / (bl - 1) - .5) * 1.5 + (R() - .5) * .3, L = hh * (.7 + R() * .4), ex = x + Math.cos(a) * L * .6, ey = y + Math.sin(a) * L;
          g.strokeStyle = cols[0]; g.lineWidth = 1.1; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (ex - x) * .3, y + (ey - y) * .6, ex, ey); g.stroke();
          g.strokeStyle = cols[a < -Math.PI / 2 ? 2 : 1]; g.lineWidth = .6; g.beginPath(); g.moveTo(x + (ex - x) * .5, y + (ey - y) * .55); g.lineTo(ex, ey); g.stroke(); } } } };
  // stones: in drifts (several near each other), each with a contact shadow, a body and a lit top
  const stones = (n, col, smin, smax) => { const lc = g2hsl(col, .16), dc = g2hsl(col, -.18); for (let i = 0; i < n * A; i++){ const cx = R() * W, cy = R() * H, m = 1 + Math.floor(R() * 5);
      for (let j = 0; j < m; j++){ const x = cx + (R() - .5) * 26, y = cy + (R() - .5) * 12, s = smin + R() * (smax - smin), rot = R() * .8 - .4;
        g.fillStyle = 'rgba(20,14,8,.28)'; g.beginPath(); g.ellipse(x + s * .2, y + s * .35, s * 1.05, s * .5, rot, 0, 7); g.fill();
        g.fillStyle = dc; g.beginPath(); g.ellipse(x, y, s, s * .62, rot, 0, 7); g.fill();
        g.fillStyle = col; g.beginPath(); g.ellipse(x - s * .1, y - s * .1, s * .82, s * .48, rot, 0, 7); g.fill();
        g.fillStyle = lc; g.beginPath(); g.ellipse(x - s * .3, y - s * .25, s * .38, s * .2, rot, 0, 7); g.fill(); } } };
  const cracks = (n, col, a, len) => { g.strokeStyle = g2a(col, a); for (let i = 0; i < n * A; i++){ let x = R() * W, y = R() * H, ang = R() * 6.28; g.lineWidth = .9 + R() * .6; g.beginPath(); g.moveTo(x, y);
      for (let s = 0; s < 5 + R() * 6; s++){ ang += (R() - .5) * 1.1; x += Math.cos(ang) * len * (.5 + R()); y += Math.sin(ang) * len * .55 * (.5 + R()); g.lineTo(x, y); if (R() < .25){ const bx = x, by = y, ba = ang + (R() < .5 ? 1 : -1) * (.8 + R() * .6); g.moveTo(bx, by); g.lineTo(bx + Math.cos(ba) * len * .8, by + Math.sin(ba) * len * .45); g.moveTo(x, y); } } g.stroke(); } };
  const litter = (n, cols, s) => { for (let i = 0; i < n * A; i++){ const x = R() * W, y = R() * H; if (trailD(x, y) < 20) continue; const c = cols[Math.floor(R() * cols.length)], r = R() * 3.14;
      g.fillStyle = c; g.beginPath(); g.ellipse(x, y, s * (.8 + R() * .6), s * .4, r, 0, 7); g.fill(); g.strokeStyle = g2a('#2a1a0c', .35); g.lineWidth = .4; g.beginPath(); g.moveTo(x - Math.cos(r) * s, y - Math.sin(r) * s * .4); g.lineTo(x + Math.cos(r) * s, y + Math.sin(r) * s * .4); g.stroke(); } };
  const twigs = (n, col) => { g.strokeStyle = col; g.lineCap = 'round'; for (let i = 0; i < n * A; i++){ const x = R() * W, y = R() * H, a = R() * 6.28, L = 5 + R() * 9; g.lineWidth = .8 + R() * .5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L * .5); if (R() < .5){ g.moveTo(x + Math.cos(a) * L * .5, y + Math.sin(a) * L * .25); g.lineTo(x + Math.cos(a + .7) * L * .9, y + Math.sin(a + .7) * L * .45); } g.stroke(); } };
  const ripples = (n, col, a) => { g.strokeStyle = g2a(col, a); g.lineWidth = 1.1; for (let i = 0; i < n * A; i++){ const x = R() * W, y = R() * H, L = 30 + R() * 50, k = 3 + Math.floor(R() * 4);
      for (let j = 0; j < k; j++){ const yy = y + j * 6; g.beginPath(); g.moveTo(x - L, yy); g.bezierCurveTo(x - L * .3, yy - 3, x + L * .3, yy + 3, x + L, yy); g.stroke(); } } };

  // fine grain over everything: thousands of specks a shade lighter and darker than the ground (soil, sand or snow grain)
  { const n = Math.round(52000 * A), dk = g2a(deep, .5), lt = g2a(pale, .45), dp = g2a(soil, .45);
    for (let i = 0; i < n; i++){ const x = R() * W, y = R() * H, v = R(); g.fillStyle = v < .4 ? dk : v < .75 ? lt : dp; g.fillRect(x, y, 1.2 + R() * 1.2, .9 + R() * .7); } }
  const T0 = tufts, S0 = stones; const tuftsX = (n, c, h, cl) => T0(n * 2.6, c, h, cl), stonesX = (n, c, a, b) => S0(n * 2, c, a, b);
  switch (kind){
    case 'grass': case 'forest': {
      const f = kind === 'forest';
      patch(f ? 34 : 26, soil, f ? .32 : .22, 40, 110); patch(30, deep, .25, 50, 140); patch(24, pale, .16, 40, 100);
      litter(f ? 2600 : 700, f ? ['#7a5a2e', '#8a6a34', '#6a4a26', '#9a7a3e', '#5a6a2a'] : ['#8a7a3a', '#7a8a3a', '#9a8a4a'], f ? 2.2 : 1.8);
      if (f) twigs(500, '#4a3420');
      stonesX(f ? 160 : 220, stoneC, 1.4, 3.6);
      tuftsX(f ? 900 : 1500, [g2hsl(base, -.16, .02), g2hsl(base, .06, .04), g2hsl(base, .18, .06)], 8, 4);
      tuftsX(260, [g2hsl(base, -.12, 0, 18), g2hsl(base, .1, .05, 18), g2hsl(base, .22, .05, 18)], 11, 3);   // taller, yellower stems
      break; }
    case 'sand': patch(30, pale, .25, 60, 160); patch(20, dark, .14, 60, 140); ripples(220, g2hsl(base, -.16), .35); ripples(160, g2hsl(base, .14), .4);
      stonesX(120, stoneC, 1.2, 3); tuftsX(140, ['#7a6a3a', '#a8964e', '#c8b468'], 7, 3); break;
    case 'dry': patch(28, soil, .3, 50, 140); patch(24, pale, .2, 40, 110); cracks(420, '#5a3e22', .5, 9); stonesX(260, stoneC, 1.3, 3.4); tuftsX(360, ['#6a5a2a', '#9a8a42', '#c4b25e'], 7, 4); break;
    case 'canyon': patch(30, soil, .32, 60, 160); patch(20, pale, .18, 50, 120);
      for (let i = 0; i < 70 * A; i++){ const x = R() * W, y = R() * H, w = 60 + R() * 140; for (let j = 0; j < 4; j++){ g.strokeStyle = g2a(j % 2 ? g2hsl(base, .12) : g2hsl(base, -.14), .35); g.lineWidth = 2 + R() * 2; g.beginPath(); g.moveTo(x, y + j * 5); g.bezierCurveTo(x + w * .3, y + j * 5 - 4, x + w * .6, y + j * 5 + 4, x + w, y + j * 5); g.stroke(); } }   // rock strata
      cracks(260, '#3a1a0c', .45, 10); stonesX(300, stoneC, 1.4, 4); tuftsX(120, ['#6a5a2a', '#8a7a3a', '#a89a4e'], 6, 3); break;
    case 'basalt': patch(26, '#120c0a', .45, 60, 150); patch(18, '#4a3a34', .25, 50, 120);
      for (let i = 0; i < 260 * A; i++){ const cx = R() * W, cy = R() * H, r = 7 + R() * 9; g.strokeStyle = g2a('#0a0606', .55); g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 6; k++){ const a = k / 6 * 6.28 + .3; g[k ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r * .55); } g.closePath(); g.stroke(); }   // hexagonal basalt joints
      cracks(160, '#ff5a1a', .25, 8); stonesX(260, stoneC, 1.4, 4); litter(500, ['#1a1210', '#3a2a24', '#5a3a2a'], 1.6); break;
    case 'ash': patch(30, '#3a3634', .32, 50, 140); patch(24, '#8a8480', .22, 40, 110); litter(1800, ['#2a2422', '#4a4440', '#6a3a22', '#8a8078'], 1.8); twigs(700, '#1e1612'); stonesX(160, stoneC, 1.2, 3); break;
    case 'snow': patch(30, '#ffffff', .4, 60, 160); patch(30, '#a8bcd8', .25, 50, 140);
      for (let i = 0; i < 160 * A; i++){ const x = R() * W, y = R() * H, w = 40 + R() * 90; g.fillStyle = g2a('#8aa0c0', .22); g.beginPath(); g.ellipse(x, y + 3, w, 5, 0, 0, 3.14); g.fill(); g.fillStyle = g2a('#ffffff', .5); g.beginPath(); g.ellipse(x - 2, y, w, 4, 0, 3.14, 6.28); g.fill(); }   // drift edges
      stonesX(120, stoneC, 1.4, 3.4); tuftsX(140, ['#5a6a5a', '#7a8a7a', '#c8d4cc'], 6, 3);
      for (let i = 0; i < 1600 * A; i++){ g.fillStyle = g2a('#ffffff', .6 + R() * .4); g.fillRect(R() * W, R() * H, .9, .9); } break;   // glitter
    case 'ice': patch(30, '#e8f4ff', .35, 60, 160); patch(24, '#7aa8d0', .22, 50, 140); cracks(380, '#ffffff', .55, 12); cracks(200, '#5a88b0', .3, 10); stonesX(80, stoneC, 1.2, 3); break;
    case 'stone': patch(30, '#1a1816', .35, 50, 140); patch(24, pale, .14, 40, 110);
      for (let i = 0; i < 90 * A; i++){ const cx = R() * W, cy = R() * H; for (let k = 0; k < 6; k++){ const x = cx + (R() - .5) * 60, y = cy + (R() - .5) * 30, w = 10 + R() * 14; g.fillStyle = g2a(k % 2 ? g2hsl(base, .06) : g2hsl(base, -.06), .45); g.beginPath(); g.moveTo(x - w, y); g.lineTo(x - w * .4, y - w * .35); g.lineTo(x + w * .6, y - w * .3); g.lineTo(x + w, y + w * .1); g.lineTo(x + w * .2, y + w * .35); g.closePath(); g.fill(); } }   // flagstone slabs
      cracks(240, '#0e0c0a', .5, 9); stonesX(260, stoneC, 1.2, 3.4); litter(600, ['#3a5a2a', '#2a4a22', '#4a6a32'], 1.5); break;   // moss flecks
    case 'gloom': patch(32, soil, .32, 50, 140); patch(24, '#1a1814', .28, 50, 140); litter(1600, ['#3a2a1a', '#4a3a22', '#2a2a1a', '#5a4a2a'], 1.9); twigs(500, '#1e1610');
      stonesX(220, stoneC, 1.3, 3.6); tuftsX(700, [g2hsl(base, -.14), g2hsl(base, .04), g2hsl(base, .14)], 7, 4); break;
    case 'marble': patch(24, '#ffffff', .3, 60, 150); patch(18, '#d8c8a0', .2, 50, 120);
      for (let i = 0; i < 260 * A; i++){ let x = R() * W, y = R() * H; g.strokeStyle = g2a('#a89a7a', .3); g.lineWidth = .7; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 8; s++){ x += 6 + R() * 8; y += (R() - .5) * 6; g.lineTo(x, y); } g.stroke(); }   // marble veining
      tuftsX(500, [g2hsl(base, -.1, .1, 60), g2hsl(base, .02, .12, 60), g2hsl(base, .12, .1, 60)], 7, 3); stonesX(80, stoneC, 1.2, 2.6); break;
  }
}

/* ---------- 3. the ground colour itself comes from the material, not from the old biome's fantasy colour ----------
   Several old biomes had a ground no real place has (a teal forest floor, a sea-blue palace, an orange canyon, lemon
   sand). Every field map now paints its base from the natural palette of its material; a region keeps only a slight
   lean toward its own colour (biome3.js). Lands, props, light, weather and music stay as they were. */
const G2_GROUND = {
  grass:['#56763a', '#5e7e3e', '#668644'], forest:['#3c5a2c', '#445f30', '#4c6634'], sand:['#d2b27a', '#dabb84', '#e0c38e'], dry:['#a6885a', '#ae9060', '#b69866'],
  canyon:['#a26652', '#aa6e56', '#b2785c'], basalt:['#2a2422', '#302826', '#362c28'], ash:['#4a4644', '#524c48', '#5a524c'], snow:['#e4ebf2', '#e9eff6', '#eef3f8'],
  ice:['#b6cee0', '#bed4e4', '#c6dae8'], stone:['#3a3834', '#403d38', '#46423c'], gloom:['#384030', '#3e4434', '#444a38'], marble:['#e2dac6', '#e6decc', '#eae2d2']};
const G2_BLADES = {grass:['#3e6a2c', '#4e7a34', '#6a8e3e', '#86a24a'], forest:['#2c4a22', '#3a5a2a', '#4e7034'], gloom:['#2a3424', '#384430', '#4a5638'], marble:['#7a9a5a', '#8aaa66', '#a8c07a'],
  dry:['#8a7a42', '#a8964e'], canyon:['#7a6a3a', '#94844a'], sand:['#a8925a', '#b8a266'], snow:null, ice:null, basalt:null, ash:['#3a3634', '#5a5450'], stone:null};
/* paths: worn earth, packed sand, trodden snow or old flagstones — never a bright gold or pink band (v156: the golden
   heavenly road read as a pillar of light running up the screen) */
const G2_ROAD = {grass:['#6a5638', '#7a6442', '#86704c'], forest:['#4e3e28', '#5a4830', '#665238'], sand:['#bc9c66', '#c6a670', '#ceb07a'], dry:['#8e6e44', '#987a4e', '#a28458'],
  canyon:['#8a5440', '#945e48', '#9e6850'], basalt:['#3a302c', '#443832', '#4e4038'], ash:['#5a5450', '#625c56', '#6a645e'], snow:['#b8c6d6', '#c6d2e0', '#d2dce8'],
  ice:['#9ab4c8', '#a6bed0', '#b2c8d8'], stone:['#4e4a44', '#58534c', '#625c54'], gloom:['#4a4434', '#544c3a', '#5e5640'], marble:['#bcb29a', '#c8bea6', '#d2c8b2']};
{ const _pm2 = paintMap;
  paintMap = function(mapId){ const mp = MAPS[mapId]; if (!mp || !mapId || !BIOME[mp.biome]) return _pm2.apply(this, arguments);
    const k = mp.biome, keep = BIOME[k], kind = G2_KIND(k), nat = G2_GROUND[kind];
    const props = (keep.props || []).map(([t, n, v]) => (t === 'crystal' && !/^(cave|icecave|badan|demonthrone)$/.test(k) ? [t, Math.max(1, Math.round(n / 3)), v] : [t, n, v]));   // (v157) outcrops are rare outside caves
    BIOME[k] = {...keep, props, base:nat, road:G2_ROAD[kind], plank:false, floor:keep.floor && keep.floor.kind === 'gold' ? {...keep.floor, kind:'stone'} : keep.floor, mottle:['rgba(20,16,10,.16)', 'rgba(255,250,235,.1)'], blades:kind in G2_BLADES ? G2_BLADES[kind] : keep.blades,
      flowers:/^(grass|marble)$/.test(kind) ? keep.flowers : null, flowerN:Math.round((keep.flowerN || 200) * .25)};
    try { return _pm2.apply(this, arguments); } finally { BIOME[k] = keep; } }; }
