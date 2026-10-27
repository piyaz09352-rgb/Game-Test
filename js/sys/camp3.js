/* VAYRATHEN — js/sys/camp3.js — camps that belong to their land (v29)
   A camp is a resting place on the road, not a home: no pavilion and no ruins. Travellers sleep under one great old
   tree in a clearing that fades into the land around it, with bedrolls, packs, log seats and a campfire.
   Each land has its own tree and ground, and every camp lays them out its own way (seeded by the region):
     fertile   a great banyan, mossy earth, wildflowers          arid      a flat-topped acacia, sand, cactus
     volcanic  a fire-leaf tree, grey ash, black rocks           frozen    a snow-laden giant, packed snow
     dark      an old violet-leaf tree hung with spirit lanterns  light     a golden bodhi tree tied with white cloth
   Every great tree wears the three-coloured cloth (ผ้าสามสี) of a revered tree. */
'use strict';

const CAMP_THEME = {
  fertile:{leaf:{leafD:'#2f6a35', leafM:'#4f8f45', leafL:'#8cc35e'}, bark:['#5a3e26', '#3e2a18', '#7a5a3a'], ground:['#8a7a4a', '#6f6a3a'], speck:['rgba(70,90,40,.35)', 'rgba(200,190,130,.25)'], deco:['bush', 'bush', 'rock'], bed:['#7a9a5a', '#c8a050']},
  arid:{leaf:{leafD:'#5a6a2a', leafM:'#7a8a3a', leafL:'#a8b05a'}, bark:['#6a4a2e', '#4a321e', '#8a6a46'], ground:['#d8bc84', '#c8a66a'], speck:['rgba(150,110,60,.3)', 'rgba(250,230,180,.3)'], deco:['rock', 'rock', 'palm'], bed:['#c8503a', '#e0a040'], acacia:1},
  volcanic:{leaf:{leafD:'#7a2a1a', leafM:'#b8442a', leafL:'#f08a3a'}, bark:['#2e2622', '#1a1512', '#4a3e36'], ground:['#5a524c', '#46403a'], speck:['rgba(20,15,12,.4)', 'rgba(255,120,50,.18)'], deco:['rock', 'rock', 'rock'], bed:['#4a3a52', '#8a3a2a'], ember:1},
  frozen:{leaf:{leafD:'#2a4a4a', leafM:'#3f6a62', leafL:'#e8f4ff'}, bark:['#4a3a32', '#2e241e', '#6a5a4e'], ground:['#e8f0f6', '#cfdce8'], speck:['rgba(140,170,200,.35)', 'rgba(255,255,255,.5)'], deco:['rock', 'pine', 'rock'], bed:['#8a5a3a', '#c8c0b0'], snow:1},
  dark:{leaf:{leafD:'#3a2a52', leafM:'#5a3f7a', leafL:'#8a6ab0'}, bark:['#3a3036', '#241e22', '#54484e'], ground:['#4a4a3a', '#3a3e30'], speck:['rgba(20,20,20,.4)', 'rgba(160,130,220,.18)'], deco:['deadtree', 'rock', 'bush'], bed:['#5a4a6a', '#3a4a5a'], spirit:1},
  light:{leaf:{leafD:'#8a7a2a', leafM:'#c8a83a', leafL:'#f6e08a'}, bark:['#8a7a66', '#5e5244', '#b0a08a'], ground:['#e0d6b8', '#cfc4a0'], speck:['rgba(200,170,90,.3)', 'rgba(255,250,230,.4)'], deco:['bush', 'rock', 'bush'], bed:['#f0ece0', '#d8b860'], bodhi:1}};
const CAMP_LANDS = Object.keys(CAMP_THEME);
const CAMP_NOBUILD = ['sala', 'house', 'shrine', 'wall', 'prang', 'stupa', 'tomb', 'statue', 'stall', 'stilt', 'temple', 'pavilion', 'ruin', 'gate'];
const CAMP_SNOWY = ['glacier', 'frozenlake', 'icecave', 'frostcitadel', 'kailash'];
const campTheme = () => CAMP_THEME[(MAPS[MAP_ID] || {}).land] || CAMP_THEME.fertile;

/* ---------- the props ---------- */
Object.assign(PROP_TYPES, {
  // the great tree, one look per land (variant = land index)
  camptree: (seed, v) => { const th = CAMP_THEME[CAMP_LANDS[v] || 'fertile'], [bm, bd, bl] = th.bark;
    return makeProp({w:250, h:250, ax:125, ay:236, seed, shadow:[92, 26], collide:20, glow:th.spirit ? [0, -90, 120] : null, paint(g, rng){
      // roots and trunk
      g.fillStyle = bd; for (const s of [-1, 1]){ pv(g, [s * 8, -6, s * 46, 2, s * 52, 6, s * 20, 4]); g.fill(); pv(g, [s * 6, -2, s * 30, 8, s * 14, 7]); g.fill(); }
      g.fillStyle = bm; pv(g, [-20, 4, -16, -40, -12, -78, -26, -112, -14, -110, -4, -88, 4, -116, 14, -112, 10, -80, 16, -40, 22, 4]); g.fill();
      g.fillStyle = bd; pv(g, [4, 4, 6, -40, 3, -80, 10, -78, 14, -36, 16, 4]); g.fill();
      g.fillStyle = bl; for (let i = 0; i < 6; i++){ g.fillRect(-14 + i * 4, -70 + (i % 3) * 14, 1.4, 22); }
      if (!th.acacia && !th.bodhi) for (let i = 0; i < 7; i++){ g.strokeStyle = bd; g.lineWidth = 1.4; const x = -40 + i * 13 + rng() * 6; g.beginPath(); g.moveTo(x, -120 + rng() * 10); g.quadraticCurveTo(x + 3, -70, x + rng() * 4 - 2, -24 - rng() * 20); g.stroke(); }   // aerial roots
      // branches
      g.strokeStyle = bm; g.lineWidth = 8; for (const s of [-1, 1]){ g.beginPath(); g.moveTo(s * 6, -100); g.quadraticCurveTo(s * 40, th.acacia ? -140 : -130, s * 82, th.acacia ? -150 : -138); g.stroke(); }
      // the three-coloured cloth round the trunk
      for (const [y, c] of [[-46, '#e04a5a'], [-41, '#f2d04a'], [-36, '#4a9ae0']]){ g.fillStyle = c; pv(g, [-18, y, 18, y + 1, 18, y + 4, -18, y + 3]); g.fill(); }
      g.fillStyle = '#f2d04a'; pv(g, [10, -40, 16, -24, 12, -24, 8, -38]); g.fill();
      // canopy
      const cl = th.acacia ? [[0, -160, 34], [-44, -156, 30], [44, -156, 30], [-84, -150, 22], [84, -150, 22], [-22, -172, 24], [22, -172, 24]]
        : [[0, -170, 46], [-50, -150, 36], [50, -150, 36], [-86, -128, 28], [86, -128, 28], [-28, -196, 32], [28, -196, 32], [0, -214, 26], [-64, -180, 26], [64, -180, 26]];
      for (const [x, y, r] of cl) leafCluster(g, x + (rng() - .5) * 6, y + (rng() - .5) * 5, r * (.92 + rng() * .16), rng, th.leaf);
      if (th.snow) for (const [x, y, r] of cl){ g.fillStyle = 'rgba(250,253,255,.92)'; ov(g, x - r * .1, y - r * .55, r * .8, r * .3); g.fill(); }
      if (th.bodhi) for (let i = 0; i < 26; i++){ const a = rng() * 6.28, d = rng() * 90; g.fillStyle = rng() < .5 ? '#fff4c0' : '#ffd36a'; ov(g, Math.cos(a) * d, -168 + Math.sin(a) * d * .5, 2.4, 1.6); g.fill(); }
      if (th.ember) for (let i = 0; i < 14; i++){ const a = rng() * 6.28, d = rng() * 80; g.fillStyle = rng() < .5 ? '#ffb04a' : '#ff6a2a'; ov(g, Math.cos(a) * d, -160 + Math.sin(a) * d * .5, 1.8, 1.8); g.fill(); }
      if (!th.acacia) for (let i = 0; i < 5; i++){ const x = -70 + i * 35 + (rng() - .5) * 10, y = -128 + (i % 2) * 10; g.strokeStyle = 'rgba(40,30,20,.8)'; g.lineWidth = .9; g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x, y); g.stroke();   // hanging lanterns / cloths
        if (th.spirit){ g.fillStyle = '#c8a0ff'; ov(g, x, y + 4, 4, 5); g.fill(); g.fillStyle = '#fff0ff'; ov(g, x, y + 3, 1.8, 2.4); g.fill(); }
        else if (th.bodhi){ g.fillStyle = '#ffffff'; pv(g, [x - 2, y, x + 2, y, x + 3, y + 14, x - 3, y + 12]); g.fill(); }
        else { g.fillStyle = '#e8503a'; ov(g, x, y + 4, 3.6, 4.4); g.fill(); g.fillStyle = '#ffd36a'; g.fillRect(x - 2.6, y + 1, 5.2, 1.2); } }
    }}); },
  bedroll: (seed, v) => makeProp({w:44, h:22, ax:22, ay:14, seed, shadow:[20, 5], paint(g){ const c = ['#7a9a5a', '#c8503a', '#4a3a52', '#8a5a3a', '#5a4a6a', '#f0ece0'][v % 6];
    g.fillStyle = c; g.beginPath(); g.roundRect(-19, -7, 34, 13, 5); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-19, 1, 34, 5);
    g.fillStyle = '#f2ead6'; g.beginPath(); g.roundRect(13, -7, 8, 12, 3); g.fill(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; for (let x = -14; x < 12; x += 6){ g.beginPath(); g.moveTo(x, -6); g.lineTo(x, 5); g.stroke(); } }}),
  logseat: seed => makeProp({w:46, h:20, ax:23, ay:12, seed, shadow:[20, 4], collide:6, paint(g){ g.fillStyle = '#6a4a2e'; g.beginPath(); g.roundRect(-20, -8, 40, 12, 6); g.fill();
    g.fillStyle = '#8a6a46'; g.fillRect(-18, -8, 36, 3); g.fillStyle = '#c8a070'; ov(g, 19, -2, 4, 6); g.fill(); g.strokeStyle = '#8a6a46'; g.lineWidth = .8; ov(g, 19, -2, 2, 3.4); g.stroke(); }}),
  packs: seed => makeProp({w:40, h:32, ax:20, ay:26, seed, shadow:[16, 4], paint(g){ g.fillStyle = '#9a7a4a'; g.beginPath(); g.roundRect(-14, -18, 16, 18, 5); g.fill(); g.fillStyle = '#7a5a32'; g.fillRect(-14, -12, 16, 2.4);
    g.fillStyle = '#b89a62'; g.beginPath(); g.roundRect(0, -14, 15, 14, 4); g.fill(); g.strokeStyle = '#5a4026'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(1, -9); g.lineTo(14, -9); g.stroke();
    g.fillStyle = '#6a8a9a'; ov(g, -6, -20, 6, 3); g.fill(); }}),
  stakelamp: (seed, v) => makeProp({w:20, h:52, ax:10, ay:48, seed, shadow:[4, 2], collide:3, glow:[0, -38, 54], paint(g){ g.strokeStyle = '#5a4026'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -40); g.lineTo(5, -44); g.stroke();
    g.fillStyle = ['#e8503a', '#ffd36a', '#c8a0ff', '#8ad0ff', '#c8a0ff', '#fff4c0'][v % 6]; ov(g, 5, -36, 4.4, 5.4); g.fill(); g.fillStyle = 'rgba(255,255,230,.9)'; ov(g, 5, -36, 2, 2.6); g.fill(); }})
});

/* ---------- laying the camp out ---------- */
campPlace = function(){
  const c = CAMP; if (!c) return; const th = campTheme(), land = (MAPS[MAP_ID] || {}).land, li = Math.max(0, CAMP_LANDS.indexOf(land)), R0 = 165;
  let sd = (MAP_ID * 7919 + 13) % 233280; const r = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  for (let i = PROPS.length - 1; i >= 0; i--) if (Math.hypot(PROPS[i].x - c.x, (PROPS[i].y - c.y) * 1.2) < R0 + 40) PROPS.splice(i, 1);
  for (let i = obstacles.length - 1; i >= 0; i--){ const o = obstacles[i]; if (o.prop && Math.hypot(o.x - c.x, (o.y - c.y) * 1.2) < R0 + 40) obstacles.splice(i, 1); }
  // the clearing: an uneven patch that fades into the ground round it
  // no buildings or ruins near a camp: it is a place in the open
  for (let i = PROPS.length - 1; i >= 0; i--) if (CAMP_NOBUILD.includes(PROPS[i].type) && Math.hypot(PROPS[i].x - c.x, (PROPS[i].y - c.y) * 1.2) < 420){ const p = PROPS[i]; PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); }
  // the ground is the land's own, worn and paler where people walk and sit
  const B = BIOME[(MAPS[MAP_ID] || {}).biome] || {}, base = (B.base && B.base[1]) || th.ground[0], snowy = CAMP_SNOWY.includes((MAPS[MAP_ID] || {}).biome);
  const mix = (h1, h2, k) => { const a = parseInt(h1.slice(1), 16), b2 = parseInt(h2.slice(1), 16), ch = s => Math.round((a >> s & 255) * (1 - k) + (b2 >> s & 255) * k); return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join(''); };
  const gr0 = snowy ? '#e8f0f6' : mix(base, th.ground[0], .45), gr1 = snowy ? '#cfdce8' : mix(base, th.ground[1], .3);
  const g = terr.getContext('2d'); g.save(); g.setTransform(TS, 0, 0, TS, 0, 0);
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28], rad = a => R0 * (1 + .1 * Math.sin(3 * a + ph[0]) + .06 * Math.sin(5 * a + ph[1]) + .04 * Math.sin(9 * a + ph[2]));
  const blob = k => { g.beginPath(); for (let i = 0; i <= 72; i++){ const a = i / 72 * 6.283, rr = rad(a) * k; const x = c.x + Math.cos(a) * rr, y = c.y + Math.sin(a) * rr * .74; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); };
  const hex = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  for (const [k, a] of [[1.12, .12], [1.04, .2], [.96, .3], [.86, .45], [.72, .6]]){ g.fillStyle = hex(gr0, a); blob(k); g.fill(); }
  g.fillStyle = hex(gr1, .35); blob(.42); g.fill();
  for (let i = 0; i < 700; i++){ const a = r() * 6.28, d = Math.sqrt(r()) * rad(a) * .95, x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d * .74;
    g.fillStyle = r() < .5 ? th.speck[0] : th.speck[1]; g.beginPath(); g.ellipse(x, y, .8 + r() * 2.2, .6 + r(), r() * 3, 0, 7); g.fill(); }
  // grass, sand ripples or snow drifts creeping in from the edge
  for (let i = 0; i < 160; i++){ const a = r() * 6.28, d = rad(a) * (.75 + r() * .4), x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d * .74;
    if (snowy){ g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(x, y, 4 + r() * 6, 1.5 + r() * 2, 0, 0, 7); g.fill(); }
    else if (th.acacia){ g.strokeStyle = 'rgba(160,120,70,.35)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 5 + r() * 5, 3.6, 5.8); g.stroke(); }
    else { g.strokeStyle = th === CAMP_THEME.volcanic ? 'rgba(90,80,70,.6)' : 'rgba(80,120,50,.6)'; g.lineWidth = 1.1; for (let k = 0; k < 3; k++){ g.beginPath(); g.moveTo(x + k * 2, y); g.lineTo(x + k * 2 + (r() - .5) * 3, y - 4 - r() * 4); g.stroke(); } } }
  if (land === 'fertile' || land === 'light') for (let i = 0; i < 40; i++){ const a = r() * 6.28, d = rad(a) * (.7 + r() * .3), x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d * .74;
    g.fillStyle = land === 'light' ? (r() < .5 ? '#fff4d0' : '#f2c8e0') : ['#f2c14e', '#f6e7f0', '#e86a8a'][i % 3]; g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
  // the fire pit: a ring of stones
  for (let i = 0; i < 12; i++){ const a = i / 12 * 6.28; g.fillStyle = th.snow ? (i % 2 ? '#8a8a92' : '#a8aab4') : i % 2 ? '#7a7066' : '#948a7c'; g.beginPath(); g.ellipse(c.x + Math.cos(a) * 15, c.y + 18 + Math.sin(a) * 7, 3.6, 2.6, 0, 0, 7); g.fill(); }
  g.fillStyle = '#2a1e16'; g.beginPath(); g.ellipse(c.x, c.y + 18, 11, 5, 0, 0, 7); g.fill();
  g.restore();
  // the great tree behind the fire, a little to one side
  const side = r() < .5 ? -1 : 1, tx = c.x + side * (20 + r() * 50), ty = c.y - 96 - r() * 16;
  addProp('camptree', tx, ty, li);
  // log seats round the fire, bedrolls under the tree, packs and lamps
  const seats = 2 + Math.floor(r() * 2); for (let i = 0; i < seats; i++){ const a = 1.2 + i * (3.6 / seats) + r() * .4; addProp('logseat', c.x + Math.cos(a) * 46, c.y + 22 + Math.sin(a) * 22); }
  const beds = 2 + Math.floor(r() * 3); for (let i = 0; i < beds; i++) addProp('bedroll', tx + (i - (beds - 1) / 2) * 40 + (r() - .5) * 10, ty + 38 + (i % 2) * 10, (li + i) % 6);
  addProp('packs', tx - side * 70, ty + 26 + r() * 10); if (r() < .6) addProp('packs', c.x + side * 92, c.y + 40);
  for (const k of [0, 1, 2]){ const a = r() * 6.28; addProp('stakelamp', c.x + Math.cos(a) * (110 + r() * 30), c.y + 10 + Math.sin(a) * 70, li); }
  if (!th.snow) addProp('jar', c.x - side * 104, c.y - 4);
  // a few things of the land just outside the clearing
  for (let i = 0; i < 6; i++){ const a = r() * 6.28, d = R0 * (1 + r() * .25), x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d * .74; const t = th.deco[i % th.deco.length]; if (PROP_TYPES[t]) addProp(t, x, y, Math.floor(r() * 3)); }
  NAV.grid = null;
};
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'camp3', t:['แคมป์พักแรม', 'Camps'], b:() => `<p>${L('แคมป์เป็นที่พักชั่วคราวใต้ต้นไม้ใหญ่ ไม่ใช่บ้าน หน้าตาตามดินแดน: ต้นไทรใหญ่ (อุดมสมบูรณ์) ต้นอะคาเซีย (แห้งแล้ง) ต้นใบไฟ (ภูเขาไฟ) ต้นไม้หิมะ (เหน็บหนาว) ต้นไม้ใบม่วงแขวนโคมวิญญาณ (ความมืด) ต้นโพธิ์ทอง (แสงสว่าง) · ทุกแคมป์จัดวางต่างกัน · ในแคมป์ปลอดภัยและพักฟื้นเร็ว',
  'A camp is a temporary rest under a great tree, not a home, and looks like its land: a banyan (fertile), an acacia (arid), a fire-leaf tree (volcanic), a snow giant (frozen), a violet tree hung with spirit lanterns (dark), a golden bodhi (light) · each camp is laid out its own way · camps are safe and resting is faster')}</p>`});
