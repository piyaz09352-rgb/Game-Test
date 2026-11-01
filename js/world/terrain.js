/* VAYRATHEN — js/world/terrain.js */
'use strict';

/* ---------- world ---------- */
const SEED0 = 20261009; let seed = SEED0;
const R = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
/* Aren (นครอาเรน) sits in the MIDDLE of the capital map: everything of the village is laid out as before and shifted east by VX,
   with fields on both sides (west: meadows + pond, east: golden paddies). VC = the village centre line. */
const VX = 890, VC = 310 + VX;
const ZA = {x0:120,y0:130,x1:720,y1:1470}, ZB = {x0:1680,y0:130,x1:2300,y1:1470}, ZN = {x0:120,y0:130,x1:830,y1:1470};
const obstacles = [];
const POND = {x:470,y:360,r:118};
obstacles.push(POND);
const SHRINE = {x:300 + VX,y:640,r:46}, HUTS = [];   // (v58) the old houses gave way to the NPCs' own shops (village2.js)
obstacles.push(SHRINE, ...HUTS);
const NPCS = [
  {id:'job',name:'ครูวายรา',en:'Master Vayra',role:'เปลี่ยน Job',roleEn:'Job Master',x:300,y:712,robe:'#f0e6cf',hair:'#d9d4c8'},
  {id:'shop',name:'ป้าบัวคำ',en:'Auntie Buakham',role:'Shop · ตีบวก',roleEn:'Shop · Refine',x:420,y:905,robe:'#b0503f',hair:'#2b211a'},
  // ตลาดกลาง (central market) south of the village
  {id:'trader',name:'เถ้าแก่ฮง',en:'Taokae Hong',role:'ตลาดกลาง · รับซื้อของและอุปกรณ์',roleEn:'Central Market · Loot & gear buyer',x:200,y:1238},
  {id:'boatman',name:'ตาพุ่ม',en:'Grandpa Phum',role:'คนพายเรือ · วาร์ป',roleEn:'Boatman · Warp',x:520,y:1150}
];
for (const n of NPCS) n.x += VX;
const VSPAWN = {x:320 + VX, y:820};   // where you wake / arrive in Aren
/* saves made before the move stood in the old west-edge village: carry them along once */
function villageFix(){ if (S && S.map === 0 && !S.vxv){ if (P.x < 640) P.x += VX; S.vxv = 1; } }
let CAMP = null;   // the travellers' camp in the middle of every field map (sys/camp.js): a safe spot like the village
const inVillage = e => ((typeof MAP_ID === 'undefined' || MAP_ID === 0) ? Math.hypot(e.x - 1200, e.y - 800) < 455 :   // (v60) Aren is a round town in the middle of its map
   !!CAMP && Math.hypot(e.x - CAMP.x, (e.y - CAMP.y) * 1.2) < 150);

// ground resolution: 2 px per world unit on roomy desktops, less on phones/tablets (canvas memory is limited there)
let TS = GFX.ts;   // ground px per world unit (see GFX in sprites.js); changes with the quality preset
const terr = document.createElement('canvas'); terr.width = W * TS; terr.height = H * TS;
const mini = document.createElement('canvas'); mini.width = 192; mini.height = 128;
const roadY = x => 820 + Math.sin((x - 500) / 380) * 110;
function onPath(x, y){ return (Math.abs(x - VC) > 450 && Math.abs(y - roadY(x)) < 70) || ((y < 340 || y > 1260) && Math.abs(x - VC - Math.sin(y / 170) * 26) < 55); }
const PADDY = {x0:1680, y0:150, x1:2330, y1:1460};
const inPaddyArea = (x, y) => x > PADDY.x0 && x < PADDY.x1 && y > PADDY.y0 && y < PADDY.y1;

function buildTerrain(){
  seed = SEED0;                          // same ground every time it is painted (quality changes repaint it)
  if (terr.width !== Math.round(W * TS)){ terr.width = Math.round(W * TS); terr.height = Math.round(H * TS); }
  const g = terr.getContext('2d');
  g.setTransform(TS, 0, 0, TS, 0, 0); g.lineCap = 'round';
  // base: meadow green in the west → golden rice country in the east
  const grd = g.createLinearGradient(0, 0, W, 0);
  grd.addColorStop(0, '#6fae5a'); grd.addColorStop(.45, '#7fbb5f'); grd.addColorStop(.6, '#9fb95a'); grd.addColorStop(1, '#b9b052');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  // soft mottling from a tiny noise canvas
  const nz = document.createElement('canvas'); nz.width = 120; nz.height = 80; const ng = nz.getContext('2d');
  for (let y = 0; y < 80; y++) for (let x = 0; x < 120; x++){ const v = R(); ng.fillStyle = v < .33 ? 'rgba(40,90,40,.5)' : v < .66 ? 'rgba(255,250,200,.35)' : 'rgba(120,150,60,.35)'; ng.fillRect(x, y, 1, 1); }
  g.imageSmoothingEnabled = true; g.globalAlpha = .45; g.drawImage(nz, 0, 0, W, H); g.globalAlpha = 1;
  // rice paddies with raised dikes
  const colsX = [PADDY.x0]; while (colsX.at(-1) < PADDY.x1) colsX.push(colsX.at(-1) + 90 + R() * 60);
  for (let ci = 0; ci < colsX.length - 1; ci++){ const px = colsX[ci], cw = colsX[ci + 1] - px; let py = PADDY.y0;
  while (py < PADDY.y1){ const ch = 70 + R() * 50;
    const kind = R(), ripe = kind < .62, flooded = kind > .86;
    if (flooded){
      g.fillStyle = '#6f9fa8'; g.fillRect(px + 4, py + 4, cw - 8, ch - 8);
      g.fillStyle = 'rgba(255,255,255,.25)'; for (let k = 0; k < 6; k++) g.fillRect(px + 8 + R() * (cw - 24), py + 8 + R() * (ch - 16), 10 + R() * 8, .8);
      g.strokeStyle = '#6fae4a'; g.lineWidth = .9;
      for (let ry = py + 10; ry < py + ch - 6; ry += 7) for (let rx = px + 9; rx < px + cw - 7; rx += 7){ g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx - .8, ry - 3); g.moveTo(rx, ry); g.lineTo(rx + 1, ry - 2.6); g.stroke(); }
      g.strokeStyle = '#8f7a3e'; g.lineWidth = 5; g.strokeRect(px + 2, py + 2, cw - 4, ch - 4);
      g.strokeStyle = '#a7c062'; g.lineWidth = 2; g.strokeRect(px + 1.5, py + 1.5, cw - 3, ch - 3);
      py += ch; continue;
    }
    const tint = (R() - .5) * 18;
    g.fillStyle = ripe ? `rgb(${214 + tint},${181 + tint},${74 + tint / 2})` : `rgb(${169 + tint},${185 + tint},${78})`; g.fillRect(px + 4, py + 4, cw - 8, ch - 8);
    g.fillStyle = ripe ? 'rgba(255,240,170,.35)' : 'rgba(220,240,160,.3)'; g.fillRect(px + 4, py + 4, cw - 8, 6);
    for (let ry = py + 10; ry < py + ch - 6; ry += 6) for (let rx = px + 8 + ((ry / 6) % 2) * 3; rx < px + cw - 6; rx += 6){
      g.strokeStyle = ripe ? (R() < .5 ? '#b38a2a' : '#e8c95e') : (R() < .5 ? '#6f8f34' : '#b7c95a'); g.lineWidth = .9;
      g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx - 1, ry - 4); g.moveTo(rx, ry); g.lineTo(rx + 1.4, ry - 3.6); g.stroke();
      if (ripe && R() < .5){ g.fillStyle = '#f5df86'; g.beginPath(); g.ellipse(rx + 1.6, ry - 4.2, .9, .6, .6, 0, 7); g.fill(); }
    }
    for (let k = 0; k < 5; k++){ g.fillStyle = ripe ? 'rgba(150,110,30,.18)' : 'rgba(60,100,30,.18)'; g.beginPath(); g.ellipse(px + 10 + R() * (cw - 20), py + 10 + R() * (ch - 20), 8 + R() * 14, 5 + R() * 8, 0, 0, 7); g.fill(); }
    g.strokeStyle = '#8f7a3e'; g.lineWidth = 5; g.strokeRect(px + 2, py + 2, cw - 4, ch - 4);
    g.strokeStyle = '#a7c062'; g.lineWidth = 2; g.strokeRect(px + 1.5, py + 1.5, cw - 3, ch - 3);
    py += ch;
  } }
  // grass blades
  for (let i = 0; i < 52000; i++){
    const x = R() * W, y = R() * H;
    if (inPaddyArea(x, y) && R() < .9) continue;
    const gold = x > 1500 && R() < .55, hh = gold ? 4 + R() * 4 : 2.4 + R() * 3;
    const shades = gold ? ['#c7a64a', '#e3c86c', '#9c8a3a'] : ['#3f7d3e', '#5f9e48', '#8cc35e', '#2f6a35'];
    g.strokeStyle = shades[Math.floor(R() * shades.length)]; g.lineWidth = .7;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - .5) * 2, y - hh); g.stroke();
  }
  // wildflowers and clover patches
  for (let i = 0; i < 260; i++){
    const cx = R() * 1300, cy = R() * H, col = ['#f6e7f0', '#f2c14e', '#e98fa6', '#ffffff', '#b9a7f0'][Math.floor(R() * 5)];
    for (let k = 0; k < 6; k++){ const x = cx + (R() - .5) * 18, y = cy + (R() - .5) * 10;
      g.fillStyle = '#3a7a38'; g.beginPath(); g.arc(x, y + 1, 1.2, 0, 7); g.fill();
      g.fillStyle = col; g.beginPath(); g.arc(x, y, .9, 0, 7); g.fill(); g.fillStyle = '#fff6c8'; g.fillRect(x - .25, y - .25, .5, .5); }
  }
  // laterite road with ruts and stones
  const road = (w, col) => { g.beginPath(); g.moveTo(0, roadY(0)); for (let x = 0; x <= W; x += 12) g.lineTo(x, roadY(x)); g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
  road(56, '#8a6a3e'); road(48, '#b08a56'); road(40, '#bf9a62');
  for (const off of [-8, 8]){ g.beginPath(); for (let x = 0; x <= W; x += 12) g.lineTo(x, roadY(x) + off); g.strokeStyle = 'rgba(120,85,45,.35)'; g.lineWidth = 2.4; g.stroke(); }
  for (let i = 0; i < 700; i++){ const x = R() * W, y = roadY(x) + (R() - .5) * 40;
    g.fillStyle = R() < .5 ? 'rgba(100,70,40,.45)' : 'rgba(230,200,150,.3)'; g.beginPath(); g.ellipse(x, y, .8 + R() * 1.6, .6 + R(), R() * 3, 0, 7); g.fill(); }
  // north and south roads: from the gates down to the village and the market
  const roadV = (y0, y1) => { for (const [w, col] of [[48, '#8a6a3e'], [40, '#b08a56'], [32, '#bf9a62']]){ g.beginPath(); for (let y = y0; y <= y1; y += 12){ const x = VC + Math.sin(y / 170) * 26; y === y0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.strokeStyle = col; g.lineWidth = w; g.stroke(); } };
  roadV(40, 360); roadV(1240, H - 30);
  g.save(); g.translate(VX, 0);
  // village ground: the square, streets and yards (village2.js) + laterite brick court round the shrine
  villageGround(g);
  for (let by = 600; by < 760; by += 6) for (let bx = 180 + ((by / 6) % 2) * 6; bx < 420; bx += 12){
    if (Math.hypot((bx - 300) / 120, (by - 690) / 80) > 1) continue;
    g.fillStyle = R() < .5 ? '#b5683e' : '#c4784a'; g.fillRect(bx, by, 11, 5); g.fillStyle = 'rgba(255,220,180,.35)'; g.fillRect(bx, by, 11, 1); }
  g.restore();
  // pond: muddy shore, deep water, ripples, lotus
  g.fillStyle = '#8f7a4a'; g.beginPath(); g.ellipse(POND.x, POND.y, POND.r + 18, POND.r + 6, 0, 0, 7); g.fill();
  const pg = g.createRadialGradient(POND.x - 20, POND.y - 20, 10, POND.x, POND.y, POND.r + 10);
  pg.addColorStop(0, '#6fbcd9'); pg.addColorStop(.7, '#3f8bb4'); pg.addColorStop(1, '#2f6f92');
  g.fillStyle = pg; g.beginPath(); g.ellipse(POND.x, POND.y, POND.r + 10, POND.r - 2, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1;
  for (let i = 0; i < 26; i++){ const x = POND.x + (R() - .5) * 180, y = POND.y + (R() - .5) * 150; if (Math.hypot((x - POND.x) / 120, (y - POND.y) / 110) > .92) continue;
    g.beginPath(); g.moveTo(x - 6, y); g.quadraticCurveTo(x, y - 2, x + 6, y); g.stroke(); }
  for (let i = 0; i < 16; i++){
    const a = R() * 6.28, d = 30 + R() * 70, x = POND.x + Math.cos(a) * d, y = POND.y + Math.sin(a) * d * .82, r = 6 + R() * 5;
    g.fillStyle = '#3f7a3c'; g.beginPath(); g.ellipse(x, y + 1, r, r * .7, 0, .35, 6.0); g.lineTo(x, y + 1); g.fill();
    g.fillStyle = '#5f9e4a'; g.beginPath(); g.ellipse(x, y, r, r * .66, 0, .35, 6.0); g.lineTo(x, y); g.fill();
    g.strokeStyle = 'rgba(30,70,30,.6)'; g.lineWidth = .6; for (let k = 0; k < 5; k++){ const b = .6 + k * 1.1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(b) * r * .9, y + Math.sin(b) * r * .6); g.stroke(); }
    if (i % 3 === 0){ for (let k = 0; k < 5; k++){ const b = -1.57 + (k - 2) * .45; g.fillStyle = k % 2 ? '#f7a8c4' : '#f48fb1'; g.beginPath(); g.ellipse(x + 2 + Math.cos(b) * 2.4, y - 3 + Math.sin(b) * 2.4, 1.8, 3.2, b + 1.57, 0, 7); g.fill(); }
      g.fillStyle = '#ffe37a'; g.beginPath(); g.arc(x + 2, y - 3, 1.3, 0, 7); g.fill(); }
  }
  for (let i = 0; i < 70; i++){ const a = R() * 6.28, x = POND.x + Math.cos(a) * (POND.r + 12), y = POND.y + Math.sin(a) * (POND.r + 2);
    g.strokeStyle = R() < .5 ? '#4f7f38' : '#7aa24a'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - .5) * 3, y - 6 - R() * 6); g.stroke(); }

  if (!PROPS.length) placeProps();
  const m = mini.getContext('2d'); m.drawImage(terr, 0, 0, 192, 128);
  for (const p of PROPS){ if (!['tree', 'palm', 'bamboo', 'house', 'shrine'].includes(p.type)) continue;
    m.fillStyle = p.type === 'house' || p.type === 'shrine' ? '#8f3426' : '#2f5f30'; m.beginPath(); m.arc(p.x / W * 192, p.y / H * 128, p.type === 'shrine' ? 3 : 1.6, 0, 7); m.fill(); }
}

function placeProps(){
  const vp = (t, x, y, v) => addProp(t, x + VX, y, v);   // village pieces, laid out as before and shifted to the middle
  addProp('shrine', SHRINE.x, SHRINE.y);
  villageProps();   // every NPC's own shop, yard fences, lamps (village2.js)
  // (v60) the old village's bananas and bamboo clumps are gone: they stood where the round town's houses are now
  for (const [x, y, v] of [[90, 320, 0], [200, 260, 1]]) vp('bamboo', x - 260, y - 60, v);
  for (let i = 0; i < 6; i++){ const a = -2.6 + i * .95, x = POND.x + Math.cos(a) * (POND.r + 34), y = POND.y + Math.sin(a) * (POND.r + 18); addProp('palm', x, y, i % 3); }
  let tries = 0, trees = 0;
  while (trees < 70 && tries < 4000){
    tries++;
    const x = 40 + R() * (W - 80), y = 60 + R() * (H - 80);
    if (Math.hypot(x - 1200, y - 800) < 530 || Math.hypot(x - 1400, y - 1500) < 160) continue;   // (v60) clear of the round town and the old landing
    if (onPath(x, y) || Math.hypot(x - POND.x, y - POND.y) < 190 || Math.hypot(x - 1800, y - 800) < 230) continue;
    if (inPaddyArea(x, y)) continue;
    if (obstacles.some(o => Math.hypot(o.x - x, o.y - y) < o.r + 46)) continue;
    addProp(R() < .82 ? 'tree' : 'palm', x, y, Math.floor(R() * 3)); trees++;
  }
  // golden fields: haystacks and lone palms on the dikes
  for (let i = 0; i < 60; i++){ const x = PADDY.x0 + 40 + R() * (PADDY.x1 - PADDY.x0 - 80), y = PADDY.y0 + 30 + R() * (PADDY.y1 - PADDY.y0 - 60);
    if (onPath(x, y) || Math.hypot(x - 1800, y - 800) < 230 || obstacles.some(o => Math.hypot(o.x - x, o.y - y) < o.r + 50)) continue;
    addProp(i % 4 === 0 ? 'palm' : 'hay', x, y, i % 3); }
  for (let i = 0; i < 60; i++){ const x = 60 + R() * 2280, y = 80 + R() * 1450;
    if (Math.hypot(x - 1200, y - 800) < 500 || onPath(x, y) || inPaddyArea(x, y) || Math.hypot(x - POND.x, y - POND.y) < 150 || obstacles.some(o => Math.hypot(o.x - x, o.y - y) < o.r + 20)) continue;
    addProp(R() < .65 ? 'bush' : 'rock', x, y, Math.floor(R() * 3)); }
}
