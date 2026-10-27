/* VAYRATHEN — js/world/maps.js
   Map travel. Each region is a field painted from a biome recipe (ground colours, water, floor patches, props,
   weather). Gateways stand on the edges that MAPS[id].links names (n/e/s/w): one leads back toward the capital,
   one on along the road; trails run from every gate to the middle of the map. The capital (map 0) has a gate on
   all four sides. A shrine keeper by the gate toward the capital warps you home or to any region already visited.
   The starting map (0) keeps its hand-made village and fields from terrain.js. */
'use strict';

/* ---------- biome recipes ---------- */
const BIOME = {
  bamboo:{base:['#4f7f3e', '#5f8f45', '#6f9a4a'], mottle:['rgba(30,70,30,.5)', 'rgba(200,230,150,.3)'], blades:['#3f7d3e', '#5f9e48', '#2f6a35', '#8cc35e'], bladeN:42000,
    road:['#7a6a3e', '#a08a56', '#b09a62'], flowers:['#f6e7f0', '#ffffff'], ponds:2, props:[['bamboo', 10, 3], ['banana', 2, 3], ['bush', 3, 3], ['rock', 2, 1], ['tree', 2, 3]], propN:130},
  marsh:{base:['#5a7a42', '#6a8a4a', '#6f8a52'], mottle:['rgba(40,70,40,.5)', 'rgba(180,200,140,.3)'], blades:['#4f7f3a', '#6a9a48', '#8aa84a'], bladeN:36000,
    road:['#6a5a3a', '#8a7a52', '#9a8a5e'], flowers:['#f07ab0', '#ffffff'], ponds:9, pondR:[70, 140], lotus:'#e8506a', props:[['reed', 6, 1], ['palm', 2, 3], ['bush', 3, 3], ['tree', 2, 3]], propN:100},
  river:{base:['#5f8f45', '#6f9a4a', '#7a9a52'], mottle:['rgba(40,80,30,.5)', 'rgba(220,210,160,.3)'], blades:['#3f7d3e', '#5f9e48', '#8cc35e'], bladeN:42000,
    road:['#8a6a3e', '#b08a56', '#bf9a62'], flowers:['#f2c14e', '#ffffff'], band:{y0:60, y1:330, deep:'#2f6f92', mid:'#3f8bb4', hi:'#6fbcd9', shore:'#c8b47a'}, ponds:2, props:[['palm', 5, 3], ['stilt', 1, 1], ['reed', 4, 1], ['tree', 4, 3], ['bush', 3, 3], ['boat', 1, 1]], propN:110},
  floatmarket:{base:['#5a7a48', '#62804e', '#6a8452'], mottle:['rgba(40,60,40,.5)', 'rgba(200,190,150,.3)'], blades:['#4f7f3a', '#5f8f45', '#7a9a52'], bladeN:28000,
    road:['#5a3a22', '#7a5232', '#8a6240'], plank:true, band:{y0:1250, y1:1560, deep:'#2a5a6a', mid:'#3a7a88', hi:'#6aa8b8', shore:'#6a5a3a'}, ponds:3, props:[['stilt', 4, 1], ['boat', 3, 1], ['palm', 4, 3], ['stall', 2, 3], ['lamp', 3, 1], ['reed', 3, 1]], propN:90, fx:'mist', fxA:.18},
  templeruins:{base:['#3f6a35', '#4a7038', '#557a3e'], mottle:['rgba(20,50,20,.55)', 'rgba(160,190,120,.25)'], blades:['#2f6a35', '#3f7d3e', '#5f8f45'], bladeN:38000,
    road:['#7a4a32', '#9a6242', '#a87252'], floor:{kind:'brick', n:7}, ponds:1, props:[['stupa', 4, 2], ['tree', 6, 3], ['wall', 3, 2], ['statue', 2, 1], ['bush', 3, 3], ['rock', 2, 1]], propN:110},
  cave:{base:['#3a3530', '#433d36', '#4a443c'], mottle:['rgba(20,15,10,.6)', 'rgba(140,130,110,.2)'], blades:null, road:['#2a2620', '#3a352e', '#4a443a'], floor:{kind:'stone', n:16},
    ponds:3, pondCols:['#3a4a52', '#1e3a4a', '#2a5a6a', '#4a8a9a'], props:[['stalag', 8, 2], ['crystal', 3, 2], ['rock', 4, 1]], propN:130, fx:'dark', fxA:.62},
  highland:{base:['#4a7a5a', '#5a8a62', '#6a9a6a'], mottle:['rgba(30,60,40,.5)', 'rgba(220,240,230,.3)'], blades:['#3f6a4e', '#5d8a62', '#8ab08a'], bladeN:40000,
    road:['#6a5a4a', '#8a7a62', '#9a8a72'], flowers:['#f0c0d8', '#ffffff', '#c8a8f0'], ponds:1, props:[['pine', 10, 1], ['rock', 4, 1], ['bush', 4, 3]], propN:140, fx:'mist', fxA:.32},
  cemetery:{base:['#3e4a38', '#46503e', '#4a5240'], mottle:['rgba(20,25,20,.55)', 'rgba(150,160,140,.2)'], blades:['#3a4a32', '#4a5a3a', '#5a6a46'], bladeN:30000,
    road:['#4a4238', '#5a5246', '#6a6254'], ponds:1, props:[['tomb', 10, 2], ['deadtree', 5, 1], ['lamp', 2, 1], ['stupa', 1, 2], ['bush', 2, 3]], propN:150, fx:'dark', fxA:.42},
  dryplain:{base:['#b89a62', '#c8a86a', '#d0b070'], mottle:['rgba(120,90,50,.45)', 'rgba(240,220,170,.3)'], blades:['#a8904a', '#c8a85a', '#8a7a3a'], bladeN:14000,
    road:['#8a6a3e', '#a8824e', '#b8925a'], floor:{kind:'cracks', n:30}, ponds:0, props:[['palm', 3, 3], ['deadtree', 4, 1], ['rock', 5, 1], ['bush', 1, 3]], propN:80, fx:'dust', fxA:.25},
  khmer:{base:['#6a8a4a', '#7a8a4a', '#8a8a52'], mottle:['rgba(120,60,30,.35)', 'rgba(220,200,150,.25)'], blades:['#5f8f45', '#7a9a4a', '#9aa052'], bladeN:32000,
    road:['#8a3a22', '#a8583a', '#b86a48'], floor:{kind:'laterite', n:9}, ponds:2, props:[['prang', 3, 1], ['wall', 4, 2], ['statue', 2, 1], ['tree', 5, 3], ['palm', 2, 3], ['rock', 2, 1]], propN:100},
  beach:{base:['#e8d8a8', '#e0cc98', '#d8c08a'], mottle:['rgba(180,160,110,.35)', 'rgba(255,250,230,.4)'], blades:null, road:['#c8b080', '#d8c090', '#e0c898'],
    band:{y0:1220, y1:1580, deep:'#1a7a9a', mid:'#2aa8b8', hi:'#7ad8d8', shore:'#f4ecd0', foam:true}, ponds:2, pondCols:['#f4ecd0', '#1a7a9a', '#2aa8b8', '#7ad8d8'], props:[['palm', 8, 3], ['coral', 4, 3], ['rock', 4, 1], ['boat', 1, 1]], propN:90},
  isle:{base:['#d8c890', '#7aa05a', '#5a8a4a'], mottle:['rgba(60,90,40,.4)', 'rgba(255,250,220,.3)'], blades:['#4f8f45', '#6aa85a', '#8ac06a'], bladeN:26000,
    road:['#c8b080', '#d8c090', '#e0c898'], band:{y0:20, y1:280, deep:'#1a6a8a', mid:'#2a98b0', hi:'#7ad0d8', shore:'#f0e4c0', foam:true}, band2:{y0:1300, y1:1580}, ponds:1, props:[['palm', 8, 3], ['coral', 2, 3], ['rock', 3, 1], ['bush', 3, 3], ['tree', 2, 3]], propN:100},
  ayodhya:{base:['#6a7a4a', '#6f7a50', '#787a55'], mottle:['rgba(90,50,30,.35)', 'rgba(200,190,160,.25)'], blades:['#5a7a42', '#6a8a4a', '#8a9a5a'], bladeN:30000,
    road:['#7a4a32', '#9a6242', '#a87252'], floor:{kind:'brick', n:12}, ponds:1, props:[['stupa', 5, 2], ['wall', 5, 1], ['tree', 4, 3], ['deadtree', 2, 1], ['statue', 1, 1]], propN:110, fx:'dust', fxA:.12},
  himmapan:{base:['#3a9a7a', '#4aa88a', '#5ab098'], mottle:['rgba(30,90,80,.5)', 'rgba(240,200,240,.3)'], blades:['#2a8a6a', '#4ab08a', '#7ad8a8', '#d88ac0'], bladeN:36000,
    road:['#c8a050', '#e0b860', '#f0c870'], flowers:['#f08ac0', '#fff4c8', '#8ad8f0', '#f0d070'], flowerN:500, ponds:3, lotus:'#f08ac0', props:[['himtree', 8, 4], ['crystal', 2, 4], ['bush', 3, 3], ['statue', 1, 2]], propN:110, fx:'petals', fxA:.4},
  anodat:{base:['#4a9a8a', '#5aa898', '#6ab0a0'], mottle:['rgba(40,90,90,.45)', 'rgba(240,250,240,.3)'], blades:['#3a8a7a', '#5ab09a', '#8ad0b8'], bladeN:32000,
    road:['#e0c890', '#f0d8a0', '#fff0c0'], flowers:['#f8c0e0', '#ffffff'], ponds:7, pondR:[90, 170], lotus:'#f8a0d0', pondCols:['#e8e0c0', '#2a7ab0', '#4aa8d0', '#9ae0f0'], props:[['sala', 2, 2], ['himtree', 5, 4], ['reed', 3, 1], ['statue', 1, 2]], propN:80, fx:'petals', fxA:.25},
  laplae:{base:['#4a6a5a', '#536e5e', '#5a7262'], mottle:['rgba(40,40,60,.45)', 'rgba(220,210,240,.3)'], blades:['#3a5a4a', '#4a6a5a', '#6a8a7a'], bladeN:34000,
    road:['#6a5a6a', '#7a6a7a', '#8a7a8a'], floor:{kind:'stone', n:6}, ponds:2, props:[['tree', 6, 3], ['stilt', 2, 1], ['sala', 1, 1], ['lamp', 3, 1], ['bush', 3, 3], ['statue', 1, 1]], propN:110, fx:'mist', fxA:.42},
  badan:{base:['#1a4a52', '#1e545a', '#226062'], mottle:['rgba(10,30,40,.5)', 'rgba(120,230,220,.2)'], blades:['#2a7a6a', '#3a9a8a', '#1a5a5a'], bladeN:16000,
    road:['#2a6a6a', '#3a8080', '#4a9090'], floor:{kind:'stone', n:10}, ponds:2, pondCols:['#2a5a5a', '#0a2a3a', '#14404e', '#2a6a7a'], props:[['coral', 6, 3], ['crystal', 5, 1], ['statue', 2, 2], ['rock', 2, 1]], propN:120, fx:'bubbles', fxA:.3, tint:'rgba(20,90,110,.16)'},
  innerhim:{base:['#3a2a4a', '#43305a', '#4a3a5a'], mottle:['rgba(20,10,30,.5)', 'rgba(200,140,220,.2)'], blades:['#4a3a6a', '#6a4a8a', '#2a5a5a'], bladeN:30000,
    road:['#5a3a4a', '#7a4a5a', '#8a5a6a'], flowers:['#c88ad8', '#f08a5a'], ponds:2, pondCols:['#3a2a3a', '#2a1a4a', '#4a2a6a', '#8a5ab0'], props:[['himtree', 8, 4], ['crystal', 4, 4], ['deadtree', 2, 1], ['statue', 1, 1]], propN:120, fx:'embers', fxA:.3, tint:'rgba(60,20,80,.14)'},
  kailash:{base:['#e8eef4', '#dfe8f0', '#d8e2ec'], mottle:['rgba(160,180,200,.35)', 'rgba(255,255,255,.5)'], blades:null, road:['#a8b8c8', '#c0ccd8', '#d0dae4'],
    floor:{kind:'snow', n:20}, ponds:3, pondCols:['#c8d8e8', '#7aa8c8', '#a0c8e0', '#e0f0ff'], props:[['pine', 8, 2], ['stalag', 3, 2], ['crystal', 2, 2], ['statue', 1, 3]], propN:110, fx:'snow', fxA:.6},
  desert:{base:['#e0c080', '#e8cc8a', '#f0d498'], mottle:['rgba(180,140,80,.4)', 'rgba(255,240,200,.35)'], blades:null, road:['#c8a060', '#d8b070', '#e0bc80'],
    floor:{kind:'cracks', n:18}, ponds:1, pondR:[60, 90], pondCols:['#e8d8a0', '#2a8a8a', '#3aa8a0', '#8ad8c8'], props:[['palm', 3, 3], ['rock', 6, 1], ['deadtree', 3, 1], ['statue', 1, 1]], propN:70, fx:'dust', fxA:.3},
  canyon:{base:['#b8603a', '#c4704a', '#cc7a52'], mottle:['rgba(120,50,30,.45)', 'rgba(240,190,150,.3)'], blades:['#a8803a', '#8a6a2a'], bladeN:6000, road:['#8a4a2a', '#a05a38', '#b06a48'],
    floor:{kind:'laterite', n:16}, ponds:0, props:[['rock', 10, 1], ['deadtree', 3, 1], ['stalag', 4, 2], ['bush', 1, 3]], propN:120, fx:'dust', fxA:.18},
  lavafield:{base:['#2a2222', '#342a28', '#3a2e2a'], mottle:['rgba(10,5,5,.6)', 'rgba(255,120,40,.12)'], blades:null, road:['#4a3a32', '#5a4a40', '#6a5a4c'],
    floor:{kind:'lava', n:26}, ponds:6, pondR:[60, 120], pondCols:['#2a1a14', '#a82a0a', '#ff5a1a', '#ffd04a'], props:[['rock', 8, 1], ['stalag', 4, 2], ['crystal', 2, 3], ['deadtree', 2, 1]], propN:100, fx:'embers', fxA:.45, tint:'rgba(255,80,20,.08)'},
  ashforest:{base:['#4a4644', '#524c48', '#5a524c'], mottle:['rgba(20,18,16,.55)', 'rgba(200,190,180,.2)'], blades:['#3a3634', '#5a5450', '#6a3a2a'], bladeN:12000, road:['#3a3430', '#4a4440', '#5a5450'],
    floor:{kind:'ash', n:20}, ponds:2, pondCols:['#3a3430', '#5a2a1a', '#8a3a1a', '#ff7a2a'], props:[['deadtree', 12, 1], ['rock', 3, 1], ['tomb', 1, 2]], propN:150, fx:'embers', fxA:.28, tint:'rgba(60,40,30,.12)'},
  crater:{base:['#2a1a16', '#3a221a', '#4a2a1e'], mottle:['rgba(10,5,5,.6)', 'rgba(255,90,30,.18)'], blades:null, road:['#5a3a2a', '#6a4632', '#7a523a'],
    floor:{kind:'lava', n:34}, ponds:9, pondR:[70, 150], pondCols:['#3a1a10', '#c83a0a', '#ff7a1a', '#ffe06a'], props:[['rock', 8, 1], ['crystal', 4, 3], ['stalag', 4, 2], ['statue', 1, 1]], propN:90, fx:'embers', fxA:.7, tint:'rgba(255,60,10,.14)'},
  frozenlake:{base:['#dce8f2', '#e4eef6', '#eef4fa'], mottle:['rgba(150,180,210,.35)', 'rgba(255,255,255,.5)'], blades:null, road:['#a8b8c8', '#c0ccd8', '#d0dae4'],
    floor:{kind:'ice', n:16}, ponds:5, pondR:[110, 200], pondCols:['#e8f4ff', '#7ab0d8', '#a8d0f0', '#e0f4ff'], props:[['pine', 10, 2], ['rock', 3, 1], ['reed', 2, 1], ['boat', 1, 1]], propN:110, fx:'snow', fxA:.45},
  icecave:{base:['#7a9ab8', '#8aa8c4', '#94b0cc'], mottle:['rgba(40,60,90,.5)', 'rgba(220,240,255,.3)'], blades:null, road:['#5a7a98', '#6a8aa8', '#7a9ab8'],
    floor:{kind:'ice', n:22}, ponds:3, pondCols:['#a8c8e0', '#3a6a9a', '#5a8ac0', '#c8e8ff'], props:[['stalag', 10, 2], ['crystal', 6, 2], ['rock', 3, 1]], propN:140, fx:'dark', fxA:.38, tint:'rgba(80,140,220,.12)'},
  glacier:{base:['#e8f0f8', '#dce8f4', '#d0e0f0'], mottle:['rgba(140,170,210,.35)', 'rgba(255,255,255,.55)'], blades:null, road:['#b0c0d0', '#c4d2e0', '#d6e2ee'],
    floor:{kind:'ice', n:26}, ponds:2, pondCols:['#e8f4ff', '#5a90c8', '#8ab8e0', '#d8f0ff'], props:[['crystal', 5, 2], ['rock', 6, 1], ['pine', 4, 2], ['stalag', 3, 2]], propN:100, fx:'snow', fxA:.7},
  frostcitadel:{base:['#c8d8e8', '#d0dcec', '#dae4f0'], mottle:['rgba(120,150,190,.35)', 'rgba(255,255,255,.45)'], blades:null, road:['#8a9ab0', '#a0b0c4', '#b4c2d4'],
    floor:{kind:'stone', n:18}, ponds:1, pondCols:['#e8f4ff', '#5a90c8', '#8ab8e0', '#d8f0ff'], props:[['wall', 6, 2], ['statue', 3, 3], ['crystal', 4, 2], ['pine', 3, 2], ['lamp', 2, 1]], propN:110, fx:'snow', fxA:.55},
  tavatimsa:{base:['#fff4d8', '#fff8e4', '#fffcf0'], mottle:['rgba(240,200,120,.3)', 'rgba(255,255,255,.6)'], blades:['#f0d890', '#f8e8b0', '#e8c870'], bladeN:9000, road:['#f0c860', '#f8d878', '#ffe8a0'],
    floor:{kind:'gold', n:18}, ponds:4, pondR:[80, 140], lotus:'#f8b0d0', pondCols:['#fff8e0', '#7ab8f0', '#a8d8ff', '#f0faff'], flowers:['#f8c0d8', '#ffffff', '#f0d070'], flowerN:500, props:[['sala', 3, 2], ['statue', 3, 2], ['crystal', 4, 3], ['himtree', 3, 3]], propN:90, fx:'petals', fxA:.5},
  meru:{base:['#f0e0b0', '#f4e8c0', '#f8f0d0'], mottle:['rgba(220,180,90,.3)', 'rgba(255,255,255,.5)'], blades:['#e8c870', '#f0d890', '#d8b050'], bladeN:12000,
    road:['#e3b04b', '#f0c860', '#f8d878'], floor:{kind:'gold', n:12}, ponds:2, pondCols:['#fff0c0', '#7ab0e0', '#a0d0f0', '#e8f8ff'], lotus:'#f8c0d0', props:[['sala', 3, 2], ['crystal', 3, 3], ['statue', 3, 2], ['himtree', 3, 3]], propN:80, fx:'petals', fxA:.35}
};
const GATE_Y = x => H * .5 + Math.sin((x - 500) / 380) * 110;   // the trail between the gateways (same curve as map 0's road)
const MAPZ = {x0:180, y0:110, x1:W - 180, y1:H - 90};
const LAIR = {x:-9999, y:-9999};
/* the living-world layer (sys/living.js) reads these: every body of water and every waterfall on the current map */
const WATERS = [], WFALLS = [];
const WATERFALL_BIOMES = {bamboo:'water', river:'water', templeruins:'water', highland:'water', khmer:'water', isle:'water', himmapan:'gold', anodat:'water', laplae:'water', innerhim:'gold', kailash:'water', tavatimsa:'gold', meru:'gold', lavafield:'lava', crater:'lava'};
const waterKind = B => (B.floor && B.floor.kind === 'lava') || (B.pondCols && /^#ff/i.test(B.pondCols[2] || '')) ? 'lava' : (B.fx === 'snow' || (B.floor && B.floor.kind === 'ice')) ? 'ice' : 'water';   // bosses now appear anywhere (see bossSpot in mobs.js); kept so old checks stay harmless
const AREA = () => W * H / (2400 * 1600);

/* ---------- painting ---------- */
function paintBiome(g, B, mapId){
  seed = SEED0 + mapId * 977;
  const grd = g.createLinearGradient(0, 0, W, 0); B.base.forEach((c, i) => grd.addColorStop(i / (B.base.length - 1), c));
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  const nz = document.createElement('canvas'); nz.width = 120; nz.height = 80; const ng = nz.getContext('2d');
  for (let y = 0; y < 80; y++) for (let x = 0; x < 120; x++){ const v = R(); ng.fillStyle = v < .4 ? B.mottle[0] : v < .7 ? B.mottle[1] : 'rgba(0,0,0,0)'; ng.fillRect(x, y, 1, 1); }
  g.imageSmoothingEnabled = true; g.globalAlpha = .45; g.drawImage(nz, 0, 0, W, H); g.globalAlpha = 1;
  // floor patches: ruined brick courts, laterite, stone slabs, dry cracks, snow drifts, gold-leaf tiles
  if (B.floor){ const k = B.floor.kind;
    for (let i = 0; i < B.floor.n; i++){ const cx = 200 + R() * (W - 400), cy = 140 + R() * (H - 280), rw = 60 + R() * 120, rh = 40 + R() * 80;
      if (k === 'cracks'){ g.strokeStyle = 'rgba(110,80,40,.5)'; g.lineWidth = 1; for (let j = 0; j < 8; j++){ let x = cx, y = cy, a = R() * 6.28; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 6; s++){ a += (R() - .5) * 1.2; x += Math.cos(a) * 14; y += Math.sin(a) * 9; g.lineTo(x, y); } g.stroke(); } continue; }
      if (k === 'lava'){ lavaCrust(g, cx, cy, rw, rh); continue; }   // (v59) cooling crust with glowing cracks (lava2.js)
      if (k === 'ice'){ g.fillStyle = 'rgba(190,225,250,.6)'; g.beginPath(); g.ellipse(cx, cy, rw * 1.2, rh * .7, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1;
        for (let j = 0; j < 5; j++){ const x = cx + (R() - .5) * rw, y = cy + (R() - .5) * rh * .8; g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x + 14, y - 3); g.stroke(); } continue; }
      if (k === 'ash'){ for (let j = 0; j < 60; j++){ const x = cx + (R() - .5) * rw * 2, y = cy + (R() - .5) * rh; g.fillStyle = R() < .5 ? 'rgba(40,36,34,.5)' : 'rgba(200,190,180,.35)'; g.beginPath(); g.arc(x, y, 1 + R() * 2.5, 0, 7); g.fill(); } continue; }
      if (k === 'snow'){ g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(cx, cy, rw, rh * .6, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(200,215,235,.4)'; g.beginPath(); g.ellipse(cx + rw * .2, cy + rh * .2, rw * .6, rh * .3, 0, 0, 7); g.fill(); continue; }
      const cols = k === 'brick' ? ['#a85a3a', '#b5683e', '#c4784a'] : k === 'laterite' ? ['#9a4a2a', '#a8583a', '#b86a48'] : k === 'gold' ? ['#e3b04b', '#f0c860', '#f8dc90'] : ['#5a554c', '#6a645a', '#7a7468'];
      for (let by = cy - rh; by < cy + rh; by += 6) for (let bx = cx - rw + ((by / 6) % 2) * 6; bx < cx + rw; bx += 12){
        if (((bx - cx) / rw) ** 2 + ((by - cy) / rh) ** 2 > 1 || R() < .18) continue;
        g.fillStyle = cols[Math.floor(R() * 3)]; g.fillRect(bx, by, 11, 5); g.fillStyle = 'rgba(255,240,220,.25)'; g.fillRect(bx, by, 11, 1); }
    } }
  // trails from every gate to the middle of the map
  const road = (w, col) => { for (const tr of TRAIL.lines){ g.beginPath(); tr.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.strokeStyle = col; g.lineWidth = w; g.stroke(); } };
  road(52, B.road[0]); road(44, B.road[1]); road(34, B.road[2]);
  if (B.plank) for (const tr of TRAIL.lines) for (let i = 0; i < tr.length; i += 1){ const [x, y] = tr[i]; g.fillStyle = 'rgba(40,20,10,.35)'; g.fillRect(x - .7, y - 20, 1.4, 40); }
  for (const tr of TRAIL.lines) for (let i = 0; i < tr.length * 2; i++){ const [x, y] = tr[Math.floor(R() * tr.length)]; g.fillStyle = R() < .5 ? 'rgba(60,40,20,.3)' : 'rgba(255,240,200,.22)'; g.beginPath(); g.ellipse(x + (R() - .5) * 36, y + (R() - .5) * 36, .8 + R() * 1.6, .6 + R(), R() * 3, 0, 7); g.fill(); }
  // grass blades
  // (v85) one path per colour, stroked once: the same blades as before, ~80,000 fewer stroke calls on every map load
  if (B.blades){ const paths = B.blades.map(() => new Path2D());
    for (let i = 0; i < B.bladeN; i++){ const x = R() * W, y = R() * H; if (trailD(x, y) < 22) continue;
      const p = paths[Math.floor(R() * B.blades.length)]; p.moveTo(x, y); p.lineTo(x + (R() - .5) * 2, y - 2.4 - R() * 3.5); }
    g.lineWidth = .7; paths.forEach((p, k) => { g.strokeStyle = B.blades[k]; g.stroke(p); }); }
  // flowers
  if (B.flowers) for (let i = 0; i < (B.flowerN || 200); i++){ const cx = R() * W, cy = R() * H, col = B.flowers[Math.floor(R() * B.flowers.length)];
    g.fillStyle = col; g.beginPath(); for (let k = 0; k < 5; k++){ const x = cx + (R() - .5) * 16, y = cy + (R() - .5) * 9; g.moveTo(x + .9, y); g.arc(x, y, .9, 0, 7); } g.fill(); }
}
function waterBody(g, x, y, rx, ry, cols, lotus, foam){
  const [shore, deep, mid, hi] = cols;
  g.fillStyle = shore; g.beginPath(); g.ellipse(x, y, rx + 14, ry + 6, 0, 0, 7); g.fill();
  const pg = g.createRadialGradient(x - rx * .2, y - ry * .2, 6, x, y, Math.max(rx, ry) + 8); pg.addColorStop(0, hi); pg.addColorStop(.7, mid); pg.addColorStop(1, deep);
  g.fillStyle = pg; g.beginPath(); g.ellipse(x, y, rx + 6, ry, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1;
  for (let i = 0; i < rx / 5; i++){ const px = x + (R() - .5) * rx * 1.6, py = y + (R() - .5) * ry * 1.5; if (((px - x) / rx) ** 2 + ((py - y) / ry) ** 2 > .8) continue; g.beginPath(); g.moveTo(px - 6, py); g.quadraticCurveTo(px, py - 2, px + 6, py); g.stroke(); }
  if (lotus) for (let i = 0; i < rx / 8; i++){ const a = R() * 6.28, d = Math.sqrt(R()) * .85, px = x + Math.cos(a) * rx * d, py = y + Math.sin(a) * ry * d, r = 5 + R() * 4;
    g.fillStyle = '#3f7a3c'; g.beginPath(); g.ellipse(px, py + 1, r, r * .7, 0, .35, 6.0); g.lineTo(px, py + 1); g.fill(); g.fillStyle = '#5f9e4a'; g.beginPath(); g.ellipse(px, py, r, r * .66, 0, .35, 6.0); g.lineTo(px, py); g.fill();
    if (i % 2 === 0) for (let k = 0; k < 5; k++){ const b = -1.57 + (k - 2) * .45; g.fillStyle = lotus; g.beginPath(); g.ellipse(px + 2 + Math.cos(b) * 2.2, py - 3 + Math.sin(b) * 2.2, 1.6, 3, b + 1.57, 0, 7); g.fill(); } }
  if (foam){ g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, rx + 8, ry + 2, 0, 0, 7); g.stroke(); }
}
/* a long band of water across the map (river, sea) with a foot bridge where the trail crosses */
function waterBand(g, b, B){
  const cols = [b.shore, b.deep, b.mid, b.hi];
  for (let x = -40; x <= W + 40; x += 60){ const cy = (b.y0 + b.y1) / 2 + Math.sin(x / 260) * 18, ry = (b.y1 - b.y0) / 2;
    g.fillStyle = cols[0]; g.beginPath(); g.ellipse(x, cy, 46, ry + 12, 0, 0, 7); g.fill(); }
  for (let x = -40; x <= W + 40; x += 60){ const cy = (b.y0 + b.y1) / 2 + Math.sin(x / 260) * 18, ry = (b.y1 - b.y0) / 2;
    const pg = g.createLinearGradient(0, cy - ry, 0, cy + ry); pg.addColorStop(0, cols[3]); pg.addColorStop(.5, cols[2]); pg.addColorStop(1, cols[1]);
    g.fillStyle = pg; g.beginPath(); g.ellipse(x, cy, 46, ry, 0, 0, 7); g.fill();
    for (let k = 0; k < 4; k++){ g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1; const px = x + (R() - .5) * 60, py = cy + (R() - .5) * ry * 1.4; g.beginPath(); g.moveTo(px - 8, py); g.quadraticCurveTo(px, py - 2, px + 8, py); g.stroke(); }
    obstacles.push({x, y:cy, r:Math.min(46, ry) - 4, water:true});
    if (ry > 60){ for (let yy = cy - ry + 46; yy < cy + ry - 40; yy += 70) obstacles.push({x, y:yy, r:40, water:true}); } }
  if (b.foam){ g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2.4; g.beginPath(); for (let x = 0; x <= W; x += 10){ const y = (b.y0 < 400 ? b.y1 : b.y0) + Math.sin(x / 260) * 18 + Math.sin(x / 40 + 1) * 3; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
}
function paintMap(mapId){
  let B = BIOME[MAPS[mapId].biome], g = terr.getContext('2d');
  g.setTransform(TS, 0, 0, TS, 0, 0); g.lineCap = 'round';
  const A = AREA(); B = {...B, propN:Math.round(B.propN * A), ponds:Math.round((B.ponds || 0) * A), bladeN:Math.round((B.bladeN || 0) * A), flowerN:Math.round((B.flowerN || 200) * A), floor:B.floor && {...B.floor, n:Math.round(B.floor.n * A)}};
  paintBiome(g, B, mapId);
  const cols = B.pondCols || ['#8f7a4a', '#2f6f92', '#3f8bb4', '#6fbcd9'];
  const ky = H / 1600, sb = b => ({...b, y0:b.y0 * ky, y1:b.y1 * ky});   // bands keep their place on taller maps
  if (B.band){ waterBand(g, sb(B.band), B); const b = sb(B.band); WATERS.push({k:'band', y0:b.y0, y1:b.y1, foam:!!b.foam, kind:waterKind(B), seed:1}); }
  if (B.band2){ const b = sb({...B.band, ...B.band2}); waterBand(g, b, B); WATERS.push({k:'band', y0:b.y0, y1:b.y1, foam:!!b.foam, kind:waterKind(B), seed:2}); }
  // ponds / lakes, kept clear of the trail, the gates and the boss lair
  const [r0, r1] = B.pondR || [50, 110];
  for (let i = 0, tries = 0; i < (B.ponds || 0) && tries < 200; tries++){
    const r = r0 + R() * (r1 - r0), x = 260 + R() * (W - 520), y = 160 + R() * (H - 320);
    if (trailD(x, y) < r + 50 || GATES.some(gt => Math.hypot(gt.x - x, gt.y - y) < r + 120) || obstacles.some(o => Math.hypot(o.x - x, o.y - y) < o.r + r + 40)) continue;
    if (B.band && y > B.band.y0 - r - 40 && y < B.band.y1 + r + 40) continue;
    if (CAMP && [0, -130].some(dy => Math.hypot(x - CAMP.x, (y - CAMP.y - dy) * 1.2) < r + 230)) continue;   // (v91) never under the camp or its great tree
    waterBody(g, x, y, r, r * .8, cols, B.lotus, false); obstacles.push({x, y, r:r * .82, water:true}); WATERS.push({k:'pond', x, y, rx:r + 5, ry:r * .8 - 1, kind:waterKind(B), seed:(x * 7 + y * 13) % 997}); i++;
  }
  // waterfalls: an escarpment on the north edge, a stream over its rim, a plunge pool and a creek below (world/falls.js)
  const wk = WATERFALL_BIOMES[MAPS[mapId].biome];
  if (wk && typeof fallsPlace === 'function') fallsPlace(g, B, mapId, wk, A);
  // props
  placeBiomeProps(B, mapId);
}
function placeBiomeProps(B, mapId){
  const total = B.props.reduce((s, p) => s + p[1], 0);
  let n = 0, tries = 0;
  while (n < B.propN && tries < 6000){
    tries++;
    const x = 60 + R() * (W - 120), y = 80 + R() * (H - 120);
    if (trailD(x, y) < 46 || GATES.some(gt => Math.hypot(gt.x - x, gt.y - y) < 150)) continue;
    if (Math.hypot(x - LAIR.x, y - LAIR.y) < 170) continue;
    let pick = R() * total, type = B.props[0]; for (const p of B.props){ pick -= p[1]; if (pick <= 0){ type = p; break; } }
    const water = ['coral', 'boat', 'reed'].includes(type[0]);
    const hitWater = obstacles.some(o => o.water && Math.hypot(o.x - x, o.y - y) < o.r + (water ? -6 : 18));
    if (water ? !obstacles.some(o => o.water && Math.hypot(o.x - x, o.y - y) < o.r + 34) && type[0] !== 'reed' : hitWater) continue;
    if (!water && obstacles.some(o => !o.water && Math.hypot(o.x - x, o.y - y) < o.r + 30)) continue;
    addProp(type[0], x, y, Math.floor(R() * type[2])); n++;
  }
}

/* ---------- gateways and the shrine keeper ---------- */
let GATES = [];
function setupGates(mapId){
  GATES = [];
  const links = MAPS[mapId].links || {};
  for (const d in links){ const [x, y] = gatePos(mapId, d); GATES.push({x, y, to:links[d], side:d}); }
  buildTrail();
}
/* where a gate stands on each edge (the capital's sit clear of its village, pond and paddies) */
function gatePos(mapId, d){
  if (mapId === 0) return {e:[W - 110, roadY(W - 110)], w:[110, roadY(110)], n:[VC, 130], s:[VC, H - 110]}[d];
  return {e:[W - 110, H * .5], w:[110, H * .5], n:[W * .5, 130], s:[W * .5, H - 110]}[d];
}
/* trails: a gently curving road from every gate to the middle; trailD(x,y) ≈ distance to the nearest trail */
const TRAIL = {lines:[], grid:null, c:8, cols:0};
function buildTrail(){
  TRAIL.lines = []; const cx = W * .5, cy = H * .5;
  if (MAP_ID !== 0) for (const gt of GATES){ const mx = (gt.x + cx) / 2, my = (gt.y + cy) / 2, dx = cx - gt.x, dy = cy - gt.y, L = Math.hypot(dx, dy) || 1, bend = Math.sin(gt.x * .013 + gt.y * .007 + MAP_ID) * 160;
    const kx = mx - dy / L * bend, ky = my + dx / L * bend, pts = [];
    for (let i = 0, n = Math.ceil(L / 10); i <= n; i++){ const t = i / n, u = 1 - t; pts.push([u * u * gt.x + 2 * u * t * kx + t * t * cx, u * u * gt.y + 2 * u * t * ky + t * t * cy]); }
    TRAIL.lines.push(pts); }
  const c = TRAIL.c, cols = Math.ceil(W / c), rows = Math.ceil(H / c), gr = new Uint8Array(cols * rows).fill(255); TRAIL.cols = cols; TRAIL.rows = rows;
  for (const tr of TRAIL.lines) for (const [x, y] of tr){ const gx = Math.floor(x / c), gy = Math.floor(y / c);
    for (let j = -20; j <= 20; j++) for (let i = -20; i <= 20; i++){ const X = gx + i, Y = gy + j; if (X < 0 || Y < 0 || X >= cols || Y >= rows) continue; const d = Math.min(255, Math.round(Math.hypot(i, j) * c)); if (d < gr[Y * cols + X]) gr[Y * cols + X] = d; } }
  TRAIL.grid = gr;
}
const trailD = (x, y) => { const g = TRAIL.grid; if (!g) return 999; const X = Math.floor(x / TRAIL.c), Y = Math.floor(y / TRAIL.c); return X < 0 || Y < 0 || X >= TRAIL.cols || Y >= TRAIL.rows ? 999 : g[Y * TRAIL.cols + X]; };
/* the gate that leads back toward the capital */
const homeGate = () => GATES.slice().sort((a, b) => (a.to === 0 ? -1 : MAPS[a.to].lv[0]) - (b.to === 0 ? -1 : MAPS[b.to].lv[0]))[0];
const inward = (gt, d) => { const cx = W * .5, cy = H * .5, dx = cx - gt.x, dy = cy - gt.y, L = Math.hypot(dx, dy) || 1; return {x:gt.x + dx / L * d, y:gt.y + dy / L * d, px:-dy / L, py:dx / L}; };
function checkGates(){
  if (typeof DG !== "undefined" && DG.active) return;   // no gates out of a dungeon
  if (P.dead || P.roll || P.capT > 0 || T < (P.gateLock || 0)) return;
  for (const gt of GATES) if (Math.hypot(P.x - gt.x, P.y - gt.y) < 26){ travel(gt.to, MAP_ID); return; }
}
/* NPCs per map: the village has its own; every other map has a shrine keeper at the camp in the middle */
const NPCS_HOME = NPCS.slice();
function setupNpcs(mapId){
  NPCS.length = 0;
  if (mapId === 0) NPCS.push(...NPCS_HOME);
  else { const c = CAMP || {x:W * .5, y:H * .5}; NPCS.push({id:'warp', name:'ผู้เฝ้าศาล', en:'Shrine Keeper', role:'วาร์ป · กลับเมือง', roleEn:'Warp · Return', x:c.x + 46, y:c.y - 34}); }
}

/* ---------- load / travel ---------- */
let MAP_ID = 0;
/* the region boss remembers itself while you are away: leave with it alive and it is still there (same HP) when you come back;
   leave while it is waiting to respawn and the clock keeps running · cleared when you go back to the title (another hero) */
const BOSSMEM = {}; let BOSS_RESTORE = null;
function bossRemember(){
  if (typeof bossTimer === 'undefined' || bossTimer >= 1e8 || PAUSED) return;   // dungeon / title screen: nothing to keep
  if (boss && !boss.dead && !boss.wb && boss.hp > 0) BOSSMEM[MAP_ID] = {hp:boss.hp / boss.maxhp, at:Date.now()};
  else if (!boss) BOSSMEM[MAP_ID] = {wait:Math.max(0, bossTimer), at:Date.now()};
}
function bossRecall(id){
  if (typeof DG !== 'undefined' && DG.active) return;
  const m = BOSSMEM[id]; delete BOSSMEM[id];
  const killedSince = m && typeof BCK !== 'undefined' && (BCK.kill[id] || 0) > (m.at || 0);   // (v27) it died after we left: the 15-minute clock rules, no stale comeback
  if (m && m.hp && !killedSince){ bossTimer = .6; BOSS_RESTORE = {f:m.hp, until:T + 15}; }   // only valid for the next few seconds: if the host's boss arrives first, this must not leak into a later respawn   // it was alive: back at once, with the HP it had
  else { BOSS_RESTORE = null; if (m && m.wait != null) bossTimer = Math.max(3, m.wait - (Date.now() - m.at) / 1000); }   // (v27) no living boss to bring back: drop any stale restore
  // no memory of this map yet: keep the random first-boss clock that setupSpawns() just set (1–30 min)
}
function loadMap(id){
  if (typeof bossRemember === 'function') bossRemember();
  id = clamp(id | 0, 0, MAPS.length - 1); MAP_ID = id; S.map = id;
  [W, H] = MAP_WH(id); Object.assign(MAPZ, {x1:W - 180, y1:H - 90}); NAV.cols = Math.ceil(W / NAV.c); NAV.rows = Math.ceil(H / NAV.c); NAV.grid = null;
  S.visited = S.visited || {0:1}; S.visited[id] = 1; if (typeof EV !== 'undefined') EV.emit('map', id);
  obstacles.length = 0; PROPS.length = 0; mobs = []; spawnSlots = []; projs = []; LOOT.length = 0; TRAPS.length = 0; SUMMONS.length = 0; LATER.length = 0;
  P.target = null; P.pending = null; P.npc = null; P.tx = null; P.loot = null; P.nav = null; boss = null;
  repaintMap(); setupNpcs(id); setupSpawns(id); bossRecall(id);
  updMapLabel(); if (typeof joinMapRoom === 'function') joinMapRoom(id); musicMood(true);
  // (v83) paint this map's monsters in idle time now, so they never stall a frame the first time they turn or swing
  // (v85) painting a new map's ground takes a moment: a soft fade from cream hides that pause as a scene change
  { const f = document.getElementById('mapFade') || (() => { const d = document.createElement('div'); d.id = 'mapFade'; const w = document.getElementById('wrap'), ui = document.getElementById('ui'); if (w){ if (ui && ui.parentNode === w) w.insertBefore(d, ui); else w.appendChild(d); } return d; })();
    if (f && f.isConnected && typeof T !== 'undefined' && T > 1){ f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); } }
  const mp = MAPS[id]; if (mp && mp.mobs && typeof SHEETS !== 'undefined' && SHEETS) SPR.warm(SHEETS, mp.mobs.flatMap(k => [[k, 'idle'], [k, 'walk'], [k, 'attack'], [k, 'hurt']]));
}
/* paint the current map again (quality change, lost canvas): same seed → same ground, props and water */
function repaintMap(){
  const id = MAP_ID; obstacles.length = 0; PROPS.length = 0; WATERS.length = 0; WFALLS.length = 0;
  TS = Math.min(GFX.ts, Math.sqrt(16e6 / (W * H)));   // keep the ground canvas within a safe pixel budget on big maps
  if (terr.width !== Math.round(W * TS)){ terr.width = Math.round(W * TS); terr.height = Math.round(H * TS); }
  setupGates(id);
  CAMP = id === 0 ? null : {x:Math.round(W * .5), y:Math.round(H * .5)};
  if (id === 0){ obstacles.push(POND, SHRINE, ...HUTS); buildTerrain(); WATERS.push({k:'pond', x:POND.x, y:POND.y, rx:POND.r + 9, ry:POND.r - 3, kind:'water', seed:7}); }
  else { paintMap(id); if (typeof campPlace === 'function') campPlace(); }
  // keep every gate clear: nothing stands on a gateway
  const near = o => GATES.some(gt => Math.hypot(gt.x - o.x, gt.y - o.y) < 70 + (o.r || 0));
  for (let i = PROPS.length - 1; i >= 0; i--) if (near(PROPS[i])) PROPS.splice(i, 1);
  for (let i = obstacles.length - 1; i >= 0; i--) if (obstacles[i] !== POND && obstacles[i] !== SHRINE && !HUTS.includes(obstacles[i]) && near(obstacles[i])) obstacles.splice(i, 1);
  const m = mini.getContext('2d'); m.setTransform(1, 0, 0, 1, 0, 0); m.drawImage(terr, 0, 0, 192, 128);
  for (const p of PROPS){ if (!['tree', 'palm', 'bamboo', 'house', 'shrine', 'pine', 'stupa', 'prang', 'himtree', 'sala', 'stilt', 'stalag'].includes(p.type)) continue;
    m.fillStyle = ['house', 'shrine', 'stupa', 'prang', 'sala', 'stilt'].includes(p.type) ? '#8f3426' : 'rgba(30,70,40,.8)'; m.beginPath(); m.arc(p.x / W * 192, p.y / H * 128, 1.6, 0, 7); m.fill(); }
  NAV.grid = null;
}
function travel(to, from){
  if (!MAPS[to]) return;
  save();
  loadMap(to);
  const gt = GATES.find(g => g.to === from) || GATES[0], p = inward(gt, 110);   // step out of the gate that leads back
  P.x = p.x; P.y = p.y; P.gateLock = T + 1.2; pushOut(P, 12);
  const mp = MAPS[to];
  banner(`${nm(mp)} · Lv ${mp.lv[0]}–${mp.lv[1]}`);
  log(L(`เดินทางถึง${mp.name}`, `Arrived at ${mp.en}`), 'g');
  VFX.play('mapArrive', {x:P.x, y:P.y}); if (typeof mapFlash === 'function') mapFlash(); SFX.play('warp'); dirty = true; save();
}
function warpTo(id){ loadMap(id); if (id === 0){ P.x = VSPAWN.x; P.y = VSPAWN.y; } else { const k = NPCS.find(n => n.id === 'warp'); P.x = k.x + 30; P.y = k.y + 50; pushOut(P, 12); } P.gateLock = T + 1;
  banner(`${nm(MAPS[id])} · Lv ${MAPS[id].lv[0]}–${MAPS[id].lv[1]}`); VFX.play('mapArrive', {x:P.x, y:P.y, gold:true}); if (typeof mapFlash === 'function') mapFlash(true); SFX.play('warp'); dirty = true; save(); }
const warpFee = id => (id === 0 ? 0 : 60 + MAPS[id].lv[0] * 12);
function updMapLabel(){ const e = document.getElementById('mapName'); if (e){ const mp = MAPS[MAP_ID]; e.textContent = `${nm(mp)} · Lv ${mp.lv[0]}–${mp.lv[1]}`; } }

/* ---------- music per region (battle music while a boss is fighting you) ---------- */
const BIOME_MOOD = {desert:'dry', canyon:'dry', lavafield:'dark', ashforest:'dark', crater:'battle', frozenlake:'water', icecave:'dark', glacier:'sacred', frostcitadel:'sacred', tavatimsa:'sacred', fields:'field', bamboo:'forest', marsh:'water', river:'water', floatmarket:'water', templeruins:'forest', cave:'dark', highland:'forest', cemetery:'dark', dryplain:'dry',
  khmer:'sacred', beach:'water', isle:'water', ayodhya:'dry', himmapan:'sacred', anodat:'sacred', laplae:'forest', badan:'dark', innerhim:'dark', kailash:'sacred', meru:'sacred'};
function musicMood(){
  if (typeof SFX === 'undefined' || PAUSED) return;
  const fight = boss && !boss.dead && boss.aggro && dist(boss, P) < 500;
  SFX.music(typeof WB !== 'undefined' && WB.m && !WB.m.dead ? 'worldboss' : (typeof bossTheme === 'function' && bossTheme()) || (fight ? 'battle' : MAP_ID === 0 && inVillage(P) ? 'village' : (m => (isNight() && (m === 'field' || m === 'forest') ? 'night' : m))(BIOME_MOOD[MAPS[MAP_ID].biome] || 'field')));
}
/* ---------- spawns ---------- */
function setupSpawns(id){
  const mp = MAPS[id];
  if (id === 0){
    addSlots('dewblob', 16, ZA); addSlots('hare', 11, ZA); addSlots('kobna', 6, ZA); addSlots('hare', 4, ZB); addSlots('boar', 12, ZB); addSlots('kaipa', 6, ZB); addSlots('lantern', 12, ZN, true);
    bossTimer = bossFirst(); return;
  }
  const per = Math.max(6, Math.round(58 * AREA() / mp.mobs.length));   // same density on the larger map
  for (const t of mp.mobs) addSlots(t, MOB[t].night ? Math.round(per * .6) : per, MAPZ, MOB[t].night);
  bossTimer = bossFirst();
}

/* the screen opens from a soft light when you arrive on a new map */
function mapFlash(gold){
  const wrap = document.getElementById('wrap'); if (!wrap) return; let o = document.getElementById('mapFlash');
  if (!o){ o = document.createElement('div'); o.id = 'mapFlash'; wrap.appendChild(o); }
  o.className = ''; void o.offsetWidth; o.className = gold ? 'on gold' : 'on';
}
