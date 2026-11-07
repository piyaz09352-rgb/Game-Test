/* VAYRATHEN — js/world/towns216.js — (v216) four crossroads towns, one on each road
   The owner asked for towns like the capital, each where two cultures meet, each with its own look:
     east   ท่าสำเภาทอง      Golden Junk Harbour — a Thai-Chinese port between the floating market and the sea
     south  นครศิลาทราย      Sandstone Caravan City — Khmer stone meets the desert caravans
     west   เวียงหิมวันต์      Himavanta Highland Town — a Lanna town under the snow, prayer flags and kalae gables
     north  นครเทวาลัยลอยฟ้า  Floating Deva City — the human world's last town before Himmapan, white and gold
   Each is a map of its own, put into its road between two regions (the gates are rewired), with no monsters and no
   boss: a paved square, a landmark, eight buildings in the town's own style and the core services — potions, the
   smith, the bank, a healer and the shrine keeper (warp) — plus a local kitchen and a costume shop of its own. */
'use strict';

/* ---------- the towns ---------- */
const TOWNS = [
  {k:'e', road:'e', after:4, name:'ท่าสำเภาทอง', en:'Golden Junk Harbour', biome:'floatmarket', style:0,
    desc:['เมืองท่าที่เรือสำเภาจีนจอดเทียบท่าค้าขายกับชาวสยาม ห้องแถวไม้ โคมแดง และกลิ่นเครื่องเทศ', 'A port where Chinese junks trade with Siam: wooden shophouses, red lanterns and the smell of spice.']},
  {k:'s', road:'s', after:10, name:'นครศิลาทราย', en:'Sandstone Caravan City', biome:'desert', style:1,
    desc:['นครหินทรายขอมริมทะเลทราย จุดพักกองคาราวานที่เดินทางข้ามผืนทราย', 'A Khmer sandstone city on the edge of the desert, where the caravans rest before crossing the sands.']},
  {k:'w', road:'w', after:7, name:'เวียงหิมวันต์', en:'Himavanta Highland Town', biome:'frostcitadel', style:2,
    desc:['เวียงล้านนาบนดอยสูงที่หิมะเริ่มโปรย บ้านไม้หลังคากาแล ธงมนต์ปลิวไสว', 'A Lanna town on the high slopes where the snow begins: kalae-gabled wooden houses and prayer flags in the wind.']},
  {k:'n', road:'n', after:56, name:'นครเทวาลัยลอยฟ้า', en:'Floating Deva City', biome:'tavatimsa', style:3,
    desc:['นครสีขาวทองแห่งสุดท้ายของโลกมนุษย์ ก่อนประตูสู่ป่าหิมพานต์', 'The last white-and-gold city of the human world, at the gate of Himmapan.']}
];
const TOWN_OF = {};
for (const T0 of TOWNS){
  const d = T0.road, R = ROADS[d], i = R.indexOf(T0.after); if (i < 0) continue;
  const A = MAPS[T0.after], B = R[i + 1] != null ? MAPS[R[i + 1]] : null, id = MAPS.length;
  const mp = {id, name:T0.name, en:T0.en, lv:[Math.min(A.lv[1], B ? B.lv[0] : A.lv[1]), Math.max(A.lv[1], B ? B.lv[0] : A.lv[1])], biome:T0.biome, mobs:[], boss:null, desc:T0.desc, town:T0.k, land:A.land,
    links:{[OPP[d]]:A.id}, wx:B ? (A.wx + B.wx) / 2 + (d === 'n' || d === 's' ? .03 : 0) : A.wx, wy:B ? (A.wy + B.wy) / 2 + (d === 'e' || d === 'w' ? .03 : 0) : A.wy};
  MAPS.push(mp); A.links[d] = id; if (B){ mp.links[d] = B.id; B.links[OPP[d]] = id; }
  R.splice(i + 1, 0, id); T0.id = id; TOWN_OF[id] = T0;
}
const isTown = id => !!TOWN_OF[id];

/* ---------- styles: walls, roofs, trims, signs ---------- */
const TW_STYLE = [
  {wall:'plaster', wc:['#fbf3e2', '#e2d4b8'], trim:'#a8281e', wood:'#8a2a1e', roof:'chinese', rc:['#2a7a5a', '#4aa080', '#16503a'], shut:'#2a6a4a', sign:['#a8281e', '#6a120c', '#ffe08a'], plinth:['#9a958a', '#b8b2a4']},
  {wall:'adobe', wc:['#e8c890', '#c89a5a'], trim:'#8a4a24', wood:'#6a4024', roof:'flat', rc:['#d8a868', '#e8c088', '#a8743c'], shut:'#2a6a8a', sign:['#2a5a7a', '#14324a', '#ffe8b0'], plinth:['#b89060', '#d0aa78']},
  {wall:'timber', wc:['#6a4428', '#4a2c18'], trim:'#e8dcc0', wood:'#3a2414', roof:'kalae', rc:['#5a4a3a', '#7a6a58', '#3a2e24'], shut:'#8a2a1e', sign:['#3a2414', '#20140a', '#ffe0a0'], plinth:['#7a7a80', '#9a9aa2']},
  {wall:'marble', wc:['#ffffff', '#e6e2f0'], trim:'#d8a840', wood:'#c89a3a', roof:'tiered', rc:['#f4f0ff', '#ffffff', '#c8c0e0'], shut:'#5a7ac8', sign:['#fff4d0', '#e8c870', '#7a4a10'], plinth:['#d8d4e4', '#f0ecf8']}
];
const TW_TYPES = ['shop', 'smith', 'bank', 'healer', 'food', 'costume', 'house', 'house2'];
const TW_SIGN = {shop:['ร้านยา', 'ร้านยา', 'ร้านยาสมุนไพร', 'โอสถทิพย์'], smith:['โรงตีเหล็ก', 'ช่างหลอมหิน', 'โรงตีเหล็กดอย', 'หัตถ์เทวะ'], bank:['โรงกงสี', 'คลังกองคาราวาน', 'คลังเวียง', 'คลังทิพย์'],
  healer:['หมอจีน', 'หมอทะเลทราย', 'หมอเมือง', 'ศาลาสมานแผล'], food:['ก๋วยเตี๋ยวเรือ', 'โรงน้ำชาคาราวาน', 'ครัวดอย', 'โรงทิพยาหาร'], costume:['ผ้าไหมจีน', 'ร้านผ้าทราย', 'ผ้าทอดอย', 'อาภรณ์เทวา']};

/* ---------- painting pieces ---------- */
const twShade = (g, x, y, w, h, a = .32) => { g.fillStyle = vsLin(g, 0, y, 0, y + h, [[0, 'rgba(255,240,200,.2)'], [.5, 'rgba(0,0,0,0)'], [1, `rgba(20,8,0,${a})`]]); g.fillRect(x, y, w, h); };
function twWall(g, rng, S, x, y, w, h){
  if (S.wall === 'adobe'){ g.fillStyle = vsLin(g, 0, y, 0, y + h, [[0, S.wc[0]], [1, S.wc[1]]]); g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + 2); g.quadraticCurveTo(x, y, x + 3, y); g.lineTo(x + w - 3, y); g.quadraticCurveTo(x + w, y, x + w, y + 2); g.lineTo(x + w, y + h); g.closePath(); g.fill();
    for (let i = 0; i < 18; i++){ g.fillStyle = 'rgba(150,100,50,.14)'; ov(g, x + rng() * w, y + rng() * h, 2 + rng() * 5, 1 + rng() * 2); g.fill(); }
    g.fillStyle = S.trim; g.fillRect(x, y + h * .32, w, 2.2); for (let xx = x + 3; xx < x + w - 3; xx += 6){ g.fillStyle = '#e8c070'; pv(g, [xx, y + h * .32 + 1.1, xx + 3, y + h * .32 - 1.4, xx + 6, y + h * .32 + 1.1, xx + 3, y + h * .32 + 3.6]); g.fill(); } return; }
  if (S.wall === 'timber'){ blocks(g, x, y + h - 12, w, 12, 7, 4, ['#7a7a80', '#8a8a92', '#6a6a72'], '#4a4a50', rng); S3.boards(g, x, y, w, h - 12, rng, ['#6a4428', '#5a3a22', '#7a5030', '#4a2e1a'], 5);
    g.strokeStyle = S.trim; g.lineWidth = .9; g.strokeRect(x + 1, y + 1, w - 2, h - 13); g.beginPath(); g.moveTo(x + 1, y + (h - 12) / 2); g.lineTo(x + w - 1, y + (h - 12) / 2); g.stroke(); return; }
  if (S.wall === 'marble'){ blocks(g, x, y, w, h, 10, 5, ['#ffffff', '#f6f4fa', '#efecf6'], '#d8d2e6', rng); g.fillStyle = S.trim; g.fillRect(x, y + 2, w, 1.2); g.fillRect(x, y + h - 4, w, 1.2);
    for (let xx = x + 4; xx < x + w - 2; xx += 8){ g.fillStyle = 'rgba(216,168,64,.7)'; pv(g, [xx, y + h - 3.4, xx + 2, y + h - 6, xx + 4, y + h - 3.4]); g.fill(); } return; }
  // plaster (Thai-Chinese): cream walls, a red skirting band, faint stains
  g.fillStyle = vsLin(g, 0, y, 0, y + h, [[0, S.wc[0]], [1, S.wc[1]]]); g.fillRect(x, y, w, h);
  for (let i = 0; i < 10; i++){ g.fillStyle = 'rgba(160,130,90,.12)'; ov(g, x + rng() * w, y + rng() * h, 3 + rng() * 6, 2 + rng() * 3); g.fill(); }
  g.fillStyle = S.trim; g.fillRect(x, y + h - 6, w, 6); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x, y + h - 6, w, .8);
}
function twRoof(g, rng, S, x0, x1, ye, yr){   // eave line ye, ridge line yr (above)
  const c = S.rc, cx = (x0 + x1) / 2, hw = (x1 - x0) / 2;
  if (S.roof === 'chinese'){ const q = [x0 - 6, ye, x1 + 6, ye, cx + hw * .62, yr, cx - hw * .62, yr];
    tileQuad(g, q, 6, 12, c); g.fillStyle = vsLin(g, 0, yr, 0, ye, [[0, 'rgba(255,255,255,.22)'], [1, 'rgba(0,0,0,.22)']]); pv(g, q); g.fill();
    g.strokeStyle = c[2]; g.lineWidth = 2.6; for (const s of [-1, 1]){ g.beginPath(); g.moveTo(cx + s * (hw + 6), ye); g.quadraticCurveTo(cx + s * (hw + 12), ye - 1, cx + s * (hw + 13), ye - 7); g.stroke(); }
    g.fillStyle = c[2]; g.fillRect(cx - hw * .64, yr - 3.4, hw * 1.28, 3.6); g.strokeStyle = c[2]; g.lineWidth = 2.2;
    for (const s of [-1, 1]){ g.beginPath(); g.moveTo(cx + s * hw * .62, yr - 1.6); g.quadraticCurveTo(cx + s * (hw * .62 + 7), yr - 2, cx + s * (hw * .62 + 8), yr - 9); g.stroke(); }
    g.fillStyle = '#e8b040'; g.beginPath(); g.arc(cx, yr - 6, 2.4, 0, 7); g.fill(); g.fillStyle = '#a8281e'; g.fillRect(x0 - 6, ye, x1 - x0 + 12, 1.6); return; }
  if (S.roof === 'flat'){ g.fillStyle = vsLin(g, 0, ye - 8, 0, ye, [[0, c[1]], [1, c[2]]]); g.fillRect(x0 - 2, ye - 8, x1 - x0 + 4, 8);
    for (let x = x0 - 2; x < x1; x += 7){ g.fillStyle = c[1]; g.fillRect(x, ye - 12, 4, 4); }
    for (let x = x0 + 4; x < x1 - 2; x += 9){ g.fillStyle = '#6a4024'; g.fillRect(x, ye - 3, 2.4, 5); g.fillStyle = '#8a5a34'; g.fillRect(x, ye - 3, 2.4, 1); }
    g.fillStyle = 'rgba(255,240,210,.35)'; g.fillRect(x0 - 2, ye - 8, x1 - x0 + 4, 1);
    if (yr < ye - 14){ const r = Math.min(hw * .5, (ye - 12 - yr) * .9); g.fillStyle = vsLin(g, cx - r, 0, cx + r, 0, [[0, '#c89a5a'], [.4, '#f0d8a8'], [1, '#a8743c']]); g.beginPath(); g.moveTo(cx - r, ye - 12); g.quadraticCurveTo(cx - r, yr + r * .3, cx, yr); g.quadraticCurveTo(cx + r, yr + r * .3, cx + r, ye - 12); g.closePath(); g.fill();
      for (let k = 1; k < 4; k++){ g.strokeStyle = 'rgba(120,70,30,.4)'; g.lineWidth = .6; g.beginPath(); g.moveTo(cx - r + k * r / 2, ye - 12); g.quadraticCurveTo(cx - r * .3 + k * r * .15, yr + 6, cx, yr + 1); g.stroke(); }
      g.fillStyle = '#e8b040'; g.beginPath(); g.moveTo(cx - 1.6, yr + 1); g.quadraticCurveTo(cx, yr - 7, cx + 1.6, yr + 1); g.fill(); }
    return; }
  if (S.roof === 'kalae'){ const pts = [x0 - 8, ye, cx, yr, x1 + 8, ye];
    g.save(); pv(g, pts); g.clip(); g.fillStyle = c[0]; g.fillRect(x0 - 10, yr, x1 - x0 + 20, ye - yr);
    for (let y = yr; y < ye; y += 3.6) for (let x = x0 - 10 + ((y / 3.6) % 2) * 2.5; x < x1 + 10; x += 5){ g.fillStyle = rng() < .5 ? c[1] : c[0]; g.fillRect(x, y, 4.4, 3); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, y + 2.6, 4.4, .6); }
    g.fillStyle = vsLin(g, x0, yr, x1, ye, [[0, 'rgba(255,255,255,.2)'], [1, 'rgba(0,0,0,.3)']]); g.fillRect(x0 - 10, yr, x1 - x0 + 20, ye - yr); g.restore();
    // snow along the roof: a soft white cap on both slopes, icicles at the eaves
    for (const s of [-1, 1]){ g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(cx, yr - 1); g.lineTo(cx + s * (hw + 8), ye - 1); g.lineTo(cx + s * (hw + 8), ye - 4); for (let k = 0; k <= 8; k++){ const t = 1 - k / 8; g.lineTo(cx + s * (hw + 8) * t, ye - 4 - (ye - yr - 3) * (1 - t) + Math.sin(k * 1.7) * 1.2 + 3); } g.closePath(); g.fill(); }
    for (let x = x0 - 6; x < x1 + 6; x += 4.5){ g.fillStyle = 'rgba(220,240,255,.9)'; pv(g, [x, ye, x + 1.6, ye, x + .8, ye + 2.5 + rng() * 3]); g.fill(); }
    // the crossed kalae horns at the apex
    g.strokeStyle = S.wood; g.lineWidth = 2.2; for (const s of [-1, 1]){ g.beginPath(); g.moveTo(cx - s * 3, yr + 4); g.quadraticCurveTo(cx + s * 4, yr - 4, cx + s * 8, yr - 12); g.stroke(); }
    g.strokeStyle = '#e8b040'; g.lineWidth = .7; for (const s of [-1, 1]){ g.beginPath(); g.moveTo(cx - s * 3, yr + 4); g.quadraticCurveTo(cx + s * 4, yr - 4, cx + s * 8, yr - 12); g.stroke(); }
    return; }
  // tiered (Deva city): three white roofs, gold-edged, gold finials, a soft glow
  fxGlow(g, cx, (ye + yr) / 2, hw + 14, (ye - yr) * .7, '255,230,160', .25);
  const n = 3, th = (ye - yr) / n;
  for (let i = 0; i < n; i++){ const yb = ye - i * th, yt = yb - th + 1, w = hw * (1 - i * .24); const q = [cx - w - 6, yb, cx + w + 6, yb, cx + w * .7, yt, cx - w * .7, yt];
    g.fillStyle = vsLin(g, 0, yt, 0, yb, [[0, c[1]], [1, c[2]]]); pv(g, q); g.fill(); g.strokeStyle = 'rgba(160,150,190,.5)'; g.lineWidth = .4; for (let k = 1; k < 4; k++){ const t = k / 4; g.beginPath(); g.moveTo(cx - w - 6 + (w * .3 + 6) * t, yb - (yb - yt) * t); g.lineTo(cx + w + 6 - (w * .3 + 6) * t, yb - (yb - yt) * t); g.stroke(); }
    g.fillStyle = '#e8b840'; g.fillRect(cx - w - 6, yb - 1.4, w * 2 + 12, 1.8); for (const s of [-1, 1]) hangHong(g, cx + s * (w + 6), yb, s, '#e8b840'); }
  chofa(g, cx, yr + 1, 9, '#e8b840'); g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(cx, yr - 9, 1.6, 0, 7); g.fill();
}
function twDoor(g, S, x, y, w, h, arch){ g.fillStyle = S.wall === 'marble' ? '#c89a3a' : S.wood; if (arch){ g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); g.fill(); } else g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + w / 2 - .3, y + (arch ? w / 2 : 0), .6, h - (arch ? w / 2 : 0)); g.fillStyle = '#e8b040'; ov(g, x + w / 2 + 2, y + h * .6, .8, .8); g.fill(); }
function twWindow(g, S, x, y, w, h, arch){ const lit = vsLin(g, 0, y, 0, y + h, [[0, '#ffe8b0'], [1, '#e89a3a']]);
  if (arch){ g.fillStyle = S.trim; g.beginPath(); g.moveTo(x - 1, y + h + 1); g.lineTo(x - 1, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2 + 1, Math.PI, 0); g.lineTo(x + w + 1, y + h + 1); g.closePath(); g.fill();
    g.fillStyle = lit; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); g.fill(); }
  else { g.fillStyle = lit; g.fillRect(x, y, w, h); g.strokeStyle = S.trim; g.lineWidth = 1; g.strokeRect(x, y, w, h); for (const s of [-1, 1]){ g.fillStyle = S.shut; g.fillRect(s < 0 ? x - 4 : x + w, y, 4, h); g.fillStyle = 'rgba(0,0,0,.22)'; for (let yy = y + 1; yy < y + h - 1; yy += 2) g.fillRect(s < 0 ? x - 3.6 : x + w + .4, yy, 3.2, .6); } }
  g.strokeStyle = 'rgba(60,30,10,.55)'; g.lineWidth = .6; g.beginPath(); g.moveTo(x + w / 2, y + (arch ? 1 : 0)); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h * .55); g.lineTo(x + w, y + h * .55); g.stroke(); }
function twSide(g, S, x, yTop, yBot, d){ const col = S.wall === 'adobe' ? '#b0844a' : S.wall === 'timber' ? '#3a2414' : S.wall === 'marble' ? '#cfc8e0' : '#d0c4a8';
  g.fillStyle = vsLin(g, x, 0, x + d, 0, [[0, col], [1, 'rgba(30,16,8,.9)']]); pv(g, [x, yTop, x + d, yTop - d * .42, x + d, yBot - d * .42, x, yBot]); g.fill(); }

/* the building: the town's style, the trade's front */
function twPaint(g, rng, st, type){
  const S = TW_STYLE[st], house = type === 'house' || type === 'house2', hw = house ? 34 : 40, top = house ? -52 : -60, signTxt = (TW_SIGN[type] || [])[st];
  S3.plinth(g, -hw - 4, hw * 2 + 8, 5, rng);
  twSide(g, S, hw, top, -5, 8);
  twWall(g, rng, S, -hw, top, hw * 2, -5 - top);
  if (type === 'shop' || type === 'food' || type === 'costume'){
    // an open front with the trade inside, under an awning in the town's colours
    g.fillStyle = '#24140a'; g.fillRect(-hw + 8, top + 12, hw * 2 - 16, -5 - top - 22);
    { const gr = g.createRadialGradient(0, top + 26, 2, 0, top + 26, 34); gr.addColorStop(0, 'rgba(255,200,120,.45)'); gr.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = gr; g.fillRect(-hw + 8, top + 12, hw * 2 - 16, -5 - top - 22); }
    if (type === 'shop') for (let r = 0; r < 2; r++){ g.fillStyle = S.wood; g.fillRect(-hw + 10, top + 21 + r * 9, hw * 2 - 20, 1.2); for (let i = 0; i < 9; i++) vgBottle(g, -hw + 14 + i * ((hw * 2 - 28) / 8), top + 21 + r * 9, ['#d8281e', '#2a6ad8', '#40a040', '#e8a020'][(i + r) % 4], 1.05); }
    if (type === 'food'){ for (const x of [-14, 10]){ g.fillStyle = '#3a3a40'; ov(g, x, top + 34, 8, 2.6); g.fill(); g.fillStyle = '#c8803a'; ov(g, x, top + 33, 6.6, 1.4); g.fill(); vgSteam(g, x, top + 30, 3); } for (let i = 0; i < 6; i++){ g.fillStyle = ['#e8d8b0', '#c8402a', '#4a8a5a'][i % 3]; ov(g, -22 + i * 9, top + 20, 2.4, 2.4); g.fill(); } }
    if (type === 'costume'){ for (let i = 0; i < 3; i++){ const x = -18 + i * 18, col = [S.trim, S.shut, '#e8406a'][i]; g.fillStyle = '#8a6a4a'; g.fillRect(x - .6, top + 34, 1.2, 6); g.fillStyle = col; pv(g, [x - 4, top + 20, x + 4, top + 20, x + 6, top + 34, x - 6, top + 34]); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(x - 1, top + 22, 1, 10); g.fillStyle = '#f0d0b8'; ov(g, x, top + 18, 2.4, 2.2); g.fill(); } }
    g.fillStyle = S.wood; g.fillRect(-hw + 6, -5 - 12, hw * 2 - 12, 4); g.fillStyle = 'rgba(255,240,200,.35)'; g.fillRect(-hw + 6, -5 - 12, hw * 2 - 12, .7);
    const aw = [S.trim, S.wall === 'marble' ? '#fff4d0' : '#fff4e0']; for (let i = 0; i < 8; i++){ const a = -hw - 2 + i * (hw * 2 + 4) / 8, b = a + (hw * 2 + 4) / 8; g.fillStyle = aw[i % 2]; pv(g, [a + 2, top + 4, b + 2, top + 4, b + 4, top + 12, a + 4, top + 12]); g.fill(); }
    for (let i = 0; i < 16; i++){ g.fillStyle = aw[Math.floor(i / 2) % 2]; g.beginPath(); g.arc(-hw + 1.7 + i * (hw * 2 + 6) / 16 + 1.8, top + 12, 2.6, 0, Math.PI); g.fill(); }
  } else if (type === 'smith'){
    g.fillStyle = '#20120a'; g.fillRect(-hw + 8, top + 12, 34, -5 - top - 12); { const gr = g.createRadialGradient(-hw + 25, -14, 2, -hw + 25, -14, 28); gr.addColorStop(0, 'rgba(255,140,50,.8)'); gr.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gr; g.fillRect(-hw + 8, top + 12, 34, -5 - top - 12); }
    vgFire(g, -hw + 25, -10, 1); g.fillStyle = '#4a4e58'; pv(g, [8, -18, 26, -18, 24, -14, 20, -13, 20, -6, 14, -6, 14, -13, 10, -14]); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(9, -18, 16, .7);
    blocks(g, hw - 12, top - 26, 9, -5 - top + 26 - 5, 4.5, 3, ['#7a3a28', '#8a4430', '#6a3022'], '#3a1a12', rng); S3.smoke(g, hw - 7.5, top - 29, 3);
  } else if (type === 'bank'){
    twDoor(g, S, -8, -5 - 30, 16, 30, true);
    for (const x of [-hw + 4, -hw + 13, hw - 17, hw - 8]){ g.fillStyle = vsLin(g, x, 0, x + 5, 0, [[0, '#c8c0b0'], [.4, '#ffffff'], [1, '#b0a898']]); g.fillRect(x, top + 6, 5, -5 - top - 8); g.fillStyle = S.trim; g.fillRect(x - .8, top + 4, 6.6, 2.4); }
    g.fillStyle = '#4a3a2a'; g.fillRect(hw - 2, -14, 12, 9); g.fillStyle = '#e8b040'; g.fillRect(hw - 2, -11, 12, 1);
  } else if (type === 'healer'){
    twDoor(g, S, -7, -5 - 26, 14, 26, S.wall !== 'timber'); twWindow(g, S, -hw + 9, top + 14, 11, 12, S.wall === 'adobe' || S.wall === 'marble'); twWindow(g, S, hw - 20, top + 14, 11, 12, S.wall === 'adobe' || S.wall === 'marble');
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, top + 8, 5, 0, 7); g.fill(); g.fillStyle = '#d8281e'; g.fillRect(-1.2, top + 4.6, 2.4, 6.8); g.fillRect(-3.4, top + 6.8, 6.8, 2.4);
    for (let i = 0; i < 4; i++){ g.fillStyle = ['#5a9a3a', '#7ab84a'][i % 2]; ov(g, -hw - 2 + i * 2, -10 - (i % 2) * 2, 2.2, 3); g.fill(); }
  } else {
    // houses: a door and two windows, a little different each
    const two = type === 'house2'; twDoor(g, S, two ? -hw + 10 : -6, -5 - 24, 12, 24, S.wall === 'adobe' || S.wall === 'marble');
    twWindow(g, S, two ? 0 : -hw + 9, top + 12, 11, 11, S.wall === 'adobe' || S.wall === 'marble'); twWindow(g, S, hw - 19, top + 12, 11, 11, S.wall === 'adobe' || S.wall === 'marble');
  }
  twShade(g, -hw, top, hw * 2, -5 - top, .25); S3.eaveShadow(g, -hw, top, hw * 2, 6);
  twRoof(g, rng, S, -hw, hw, top + 2, top - (house ? 30 : 38));
  if (signTxt) S3.board(g, 0, top - 2 - (S.roof === 'flat' ? 14 : 0), signTxt, {bg:[S.sign[0], S.sign[1]], fg:S.sign[2], frame:S.trim, w:Math.min(hw * 2 - 8, 48), h:8.4, font:5.8});
  // the town's own touches
  if (st === 0){ vsLantern(g, -hw - 4, top + 4, 3); vsLantern(g, hw + 4, top + 2, 3); }
  if (st === 1){ g.fillStyle = '#b07a3a'; for (const x of [-hw - 8, hw + 10]){ ov(g, x, -4, 4, 4.6); g.fill(); g.fillStyle = '#d8a060'; g.fillRect(x - 2.4, -9.6, 4.8, 1.6); g.fillStyle = '#b07a3a'; } }
  if (st === 2){ for (const s of [-1, 1]){ g.strokeStyle = 'rgba(60,40,20,.7)'; g.lineWidth = .4; g.beginPath(); g.moveTo(s * (hw + 2), top + 2); g.quadraticCurveTo(s * (hw + 10), top + 10, s * (hw + 18), top + 6); g.stroke();
      for (let k = 0; k < 4; k++){ const t = (k + 1) / 5, x = s * (hw + 2 + 16 * t), y = top + 2 + Math.sin(t * Math.PI) * 6; g.fillStyle = ['#2a6ad8', '#ffffff', '#d8281e', '#40a040', '#f0c020'][k % 5]; g.fillRect(x - 1.4, y, 2.8, 3.4); } }
    g.fillStyle = '#ffffff'; ov(g, -hw + 4, -5, 8, 2); g.fill(); ov(g, hw + 4, -6, 6, 1.8); g.fill(); }
  if (st === 3){ for (const s of [-1, 1]){ g.fillStyle = '#e8b840'; g.fillRect(s * (hw + 6) - 1, top - 6, 2, top * -1 - 1); fxGlow(g, s * (hw + 6), top - 8, 6, 6, '255,220,140', .8); g.fillStyle = '#fff6d0'; ov(g, s * (hw + 6), top - 8, 2.2, 2.6); g.fill(); } }
}
// the landmark of each town
function twLandmark(g, rng, st){
  if (st === 0){ // a Chinese gateway (paifang) with stone lions
    for (const x of [-34, -14, 14, 34]){ g.fillStyle = vsLin(g, x - 2.5, 0, x + 2.5, 0, [[0, '#6a0e0a'], [.5, '#d0302a'], [1, '#6a0e0a']]); g.fillRect(x - 2.5, x === -14 || x === 14 ? -70 : -52, 5, x === -14 || x === 14 ? 70 : 52); g.fillStyle = '#5a5a60'; g.fillRect(x - 3.4, -4, 6.8, 4); }
    for (const [x0, x1, y, w] of [[-40, 40, -52, 0], [-20, 20, -70, 1]]){ tileQuad(g, [x0 - 6, y, x1 + 6, y, x1, y - 10, x0, y - 10], 2, 8, ['#2a7a5a', '#4aa080', '#16503a']); g.strokeStyle = '#16503a'; g.lineWidth = 2; for (const s of [-1, 1]){ g.beginPath(); g.moveTo(s * (x1 + 6), y); g.quadraticCurveTo(s * (x1 + 10), y - 1, s * (x1 + 11), y - 6); g.stroke(); } void w; }
    g.fillStyle = '#1a1a22'; g.fillRect(-16, -66, 32, 9); g.strokeStyle = '#e8b040'; g.lineWidth = .8; g.strokeRect(-15.4, -65.4, 30.8, 7.8); g.fillStyle = '#ffd870'; g.font = '700 5.4px Sarabun,"Noto Sans Thai",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ท่าสำเภาทอง', 0, -61.2, 28); g.textBaseline = 'alphabetic';
    for (const s of [-1, 1]){ const x = s * 50; g.fillStyle = '#8a8a90'; g.fillRect(x - 6, -8, 12, 8); g.fillStyle = vsLin(g, x - 6, 0, x + 6, 0, [[0, '#9a9aa0'], [.5, '#d0d0d4'], [1, '#7a7a80']]); ov(g, x, -14, 6, 7); g.fill(); ov(g, x + s * 2, -22, 5, 5); g.fill(); g.fillStyle = '#5a5a60'; for (let k = 0; k < 5; k++){ ov(g, x + s * 2 + Math.cos(k * 1.3) * 4, -24 + Math.sin(k * 1.3) * 3, 1.4, 1.4); g.fill(); } g.fillStyle = '#d0302a'; ov(g, x + s * 4, -21, .9, .9); g.fill(); }
    vsLantern(g, -24, -50, 4); vsLantern(g, 24, -50, 4); return; }
  if (st === 1){ // a Khmer sandstone prang with a naga balustrade
    blocks(g, -40, -10, 80, 10, 8, 3.4, ['#c89a5a', '#b88a4a', '#d8aa6a'], '#8a6a3a', rng);
    const pr = [-22, -10, -22, -46, -18, -50, -18, -62, -13, -66, -13, -78, -8, -82, -8, -92, -3, -98, 3, -98, 8, -92, 8, -82, 13, -78, 13, -66, 18, -62, 18, -50, 22, -46, 22, -10];
    g.save(); pv(g, pr); g.clip(); blocks(g, -24, -100, 48, 92, 6, 3.4, ['#d0a060', '#c09050', '#e0b070', '#b08040'], '#8a6a3a', rng, 6);
    g.fillStyle = vsLin(g, -22, 0, 22, 0, [[0, 'rgba(255,230,180,.25)'], [.5, 'rgba(0,0,0,0)'], [1, 'rgba(40,20,0,.4)']]); g.fillRect(-24, -100, 48, 92); g.restore();
    g.fillStyle = '#3a2410'; g.beginPath(); g.moveTo(-7, -10); g.lineTo(-7, -26); g.arc(0, -26, 7, Math.PI, 0); g.lineTo(7, -10); g.closePath(); g.fill();
    g.fillStyle = '#e8b040'; g.beginPath(); g.moveTo(-1.6, -98); g.quadraticCurveTo(0, -106, 1.6, -98); g.fill();
    for (const s of [-1, 1]){ g.strokeStyle = '#a07a40'; g.lineWidth = 3; g.beginPath(); g.moveTo(s * 24, -6); g.quadraticCurveTo(s * 34, -4, s * 44, -8); g.stroke(); g.fillStyle = '#a07a40'; for (let k = 0; k < 5; k++){ const a = -Math.PI / 2 + (k - 2) * .5; ov(g, s * 46 + Math.cos(a) * 5, -12 + Math.sin(a) * 5, 2, 2.4); g.fill(); } }
    return; }
  if (st === 2){ // a white chorten with prayer flags streaming from its spire
    g.fillStyle = '#e8e8ee'; g.fillRect(-28, -14, 56, 14); g.fillRect(-22, -22, 44, 8); g.fillStyle = vsLin(g, -20, 0, 20, 0, [[0, '#ffffff'], [.6, '#e8e8f0'], [1, '#b8b8c8']]); g.beginPath(); g.moveTo(-18, -22); g.quadraticCurveTo(-20, -48, 0, -50); g.quadraticCurveTo(20, -48, 18, -22); g.closePath(); g.fill();
    g.fillStyle = '#e8e8ee'; g.fillRect(-7, -56, 14, 6); g.fillStyle = '#e8b040'; for (let k = 0; k < 8; k++){ const w = 6 - k * .6; g.fillRect(-w, -58 - k * 3.2, w * 2, 2.4); } g.beginPath(); g.arc(0, -86, 2.6, 0, 7); g.fill(); g.fillStyle = '#f8f8ff'; ov(g, 0, -90, 1.4, 1.8); g.fill();
    g.fillStyle = '#3a3a48'; g.fillRect(-5, -40, 10, 8);
    for (const s of [-1, 1]) for (let line = 0; line < 2; line++){ const ex = s * (56 - line * 10), ey = -8 - line * 18; g.strokeStyle = 'rgba(60,40,20,.7)'; g.lineWidth = .4; g.beginPath(); g.moveTo(0, -80); g.quadraticCurveTo(s * 28, -40 - line * 10, ex, ey); g.stroke();
      for (let k = 1; k < 9; k++){ const t = k / 9, x = 2 * (1 - t) * t * s * 28 + t * t * ex, y = (1 - t) * (1 - t) * -80 + 2 * (1 - t) * t * (-40 - line * 10) + t * t * ey; g.fillStyle = ['#2a6ad8', '#ffffff', '#d8281e', '#40a040', '#f0c020'][k % 5]; g.fillRect(x - 1.6, y, 3.2, 3.6); } }
    g.fillStyle = '#ffffff'; ov(g, -26, -1, 10, 2.4); g.fill(); ov(g, 24, -1, 8, 2); g.fill(); return; }
  // st 3: a golden pavilion over a lotus pool
  g.fillStyle = vsLin(g, 0, -10, 0, 2, [[0, '#7ad0e8'], [1, '#3a8ab0']]); ov(g, 0, -4, 52, 10); g.fill(); g.strokeStyle = '#f0ecf8'; g.lineWidth = 2.4; ov(g, 0, -4, 52, 10); g.stroke();
  for (let k = 0; k < 7; k++){ const x = -40 + k * 13, y = -3 + (k % 2) * 3; g.fillStyle = '#3a9a5a'; ov(g, x, y, 4.4, 1.6); g.fill(); if (k % 2){ g.fillStyle = '#ffb0d0'; pv(g, [x - 2, y - .6, x, y - 4.4, x + 2, y - .6]); g.fill(); } }
  for (const x of [-26, -9, 9, 26]){ g.fillStyle = vsLin(g, x - 2, 0, x + 2, 0, [[0, '#c89a3a'], [.5, '#ffe08a'], [1, '#a87a20']]); g.fillRect(x - 2, -56, 4, 50); }
  g.fillStyle = vsLin(g, 0, -12, 0, -8, [[0, '#ffffff'], [1, '#d8d4e4']]); g.fillRect(-32, -12, 64, 4);
  twRoof(g, rng, TW_STYLE[3], -30, 30, -56, -98);
  fxGlow(g, 0, -40, 30, 20, '255,230,160', .3);
}
PROP_TYPES.tbld = (seed, v = 0) => makeProp({w:128, h:124, ax:64, ay:112, seed, shadow:[48, 11, 3], collide:30, glow:[0, -36, 56], paint(g, rng){ twPaint(g, rng, Math.floor(v / 10), TW_TYPES[v % 10] || 'house'); }});
PROP_TYPES.tland = (seed, v = 0) => makeProp({w:132, h:124, ax:66, ay:112, seed, shadow:[50, 12, 2], collide:34, glow:[0, -40, 60], paint(g, rng){ twLandmark(g, rng, v); }});

/* ---------- laying out a town ---------- */
const TW_SLOTS = [[-155, 'shop'], [-122, 'smith'], [-58, 'bank'], [-25, 'healer'], [25, 'food'], [58, 'house'], [122, 'costume'], [155, 'house2']];
const TW_OUTER = [-145, -115, -65, -35, 35, 65, 115, 145];
const twSlot = (deg, k) => { const a = deg * Math.PI / 180; return [Math.round(W * .5 + Math.cos(a) * 430 * k), Math.round(H * .5 + Math.sin(a) * 290 * k)]; };
const TW_DECOR = [[['lamp', 1], ['jar', 1], ['bougain', 1], ['frangipani', 1]], [['palm', 1], ['jar', 1], ['stall', 1], ['rock', 1]], [['pine', 1], ['rock', 1], ['stupa', 1], ['lamp', 1]], [['himtree', 1], ['lotusbowl', 1], ['stupa', 1], ['lamp', 1]]];
const TW_PAVE = [['#b8a890', '#a89878', '#c8baa0'], ['#d8b880', '#c8a46a', '#e4c890'], ['#9a9aa2', '#8a8a92', '#aaaab2'], ['#f4f0fa', '#e6e0f0', '#ffffff']];
/* (v219) the town is laid out like a town, not a ring: an irregular square that fades into the ground, cobbled streets
   with soft ragged edges where grass creeps in, the services round the square at uneven distances, houses along the
   streets, lamps beside them, trees, flower beds and hedges between the houses. (v216 painted a hard-edged ellipse of
   brick tiles: the owner found it did not belong to the land at all.) */
const TW_GROUND = [   // dirt (soft base) · stones · grass at the edges
  {dirt:['rgba(150,124,86,', 'rgba(172,146,104,'], stone:['#a8a090', '#b8b0a0', '#968e80', '#c4bcac', '#8a8476'], grass:['#4a7a3a', '#5e9048', '#6aa050']},
  {dirt:['rgba(176,134,80,', 'rgba(196,154,98,'], stone:['#d8b888', '#e4c898', '#c8a474', '#ecd4a8', '#bc9866'], grass:['#9a8a4a', '#b0a058', '#8a7a3e']},
  {dirt:['rgba(186,198,214,', 'rgba(204,214,228,'], stone:['#9aa0ac', '#aeb4c0', '#8a909c', '#c0c6d0', '#7e848e'], grass:['#ffffff', '#eef4fa', '#dce8f4']},
  {dirt:['rgba(232,226,240,', 'rgba(246,242,250,'], stone:['#f4f0fa', '#e6e0f0', '#ffffff', '#ded6ec', '#f0e6c8'], grass:['#7ac8a0', '#9ad8b0', '#e8d080']}
];
const TW_LAY = {map:-1, pos:{}};
function twPaveR(a, k){ return 250 + 46 * Math.sin(a * 3 + k) + 28 * Math.sin(a * 5 + k * 2.3) + 14 * Math.sin(a * 9 + k * .7); }
function twInPave(x, y, cx, cy, k){ const dx = x - cx, dy = (y - cy) * 1.32, a = Math.atan2(dy, dx); if (Math.hypot(dx, dy) < twPaveR(a, k)) return 1 - Math.hypot(dx, dy) / twPaveR(a, k);
  const d = trailD(x, y), w = 30 + 9 * Math.sin(x * .021 + y * .013); return d < w && Math.hypot(x - cx, y - cy) < 1150 ? 1 - d / w : 0; }
function twLayout(mapId){
  const T0 = TOWN_OF[mapId], st = T0.style, cx = W * .5, cy = H * .5, G0 = TW_GROUND[st], k = mapId * .37; let sd = mapId * 977 + 7; const r = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  const g = terr.getContext('2d'); g.save(); g.setTransform(TS, 0, 0, TS, 0, 0);
  // 1) worn ground: many soft overlapping patches along the streets and over the square, feathered at the edge
  const blob = (x, y, rr, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, G0.dirt[(r() * 2) | 0] + a + ')'); gr.addColorStop(1, G0.dirt[0] + '0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rr, rr * .8, 0, 0, 7); g.fill(); };
  for (const tr of TRAIL.lines) tr.forEach(([x, y], i) => { if (i % 2 || Math.hypot(x - cx, y - cy) > 1180) return; blob(x + (r() - .5) * 20, y + (r() - .5) * 14, 46 + r() * 22, .55); });
  for (let i = 0; i < 260; i++){ const a = r() * 6.283, d = Math.sqrt(r()) * twPaveR(a, k) * 1.05, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d / 1.32; blob(x, y, 50 + r() * 40, .5); }
  // 2) cobbles: rounded stones of uneven size and shade, thick in the middle, thinning out toward the edges
  for (let i = 0; i < 34000; i++){ const x = cx + (r() - .5) * 2400, y = cy + (r() - .5) * 1700, m = twInPave(x, y, cx, cy, k); if (m <= 0 || r() > Math.min(1, m * 2.6)) continue;
    const rw = 4.5 + r() * 3.5, rh = rw * (.55 + r() * .25), c = G0.stone[(r() * G0.stone.length) | 0];
    g.fillStyle = 'rgba(30,20,10,.28)'; g.beginPath(); g.ellipse(x + .6, y + 1, rw, rh, 0, 0, 7); g.fill();
    g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rw, rh, r() * .6 - .3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.ellipse(x - rw * .25, y - rh * .35, rw * .5, rh * .35, 0, 0, 7); g.fill(); }
  // 3) grass (snow, sand) creeping back over the ragged edges
  for (let i = 0; i < 7000; i++){ const x = cx + (r() - .5) * 2400, y = cy + (r() - .5) * 1700, m = twInPave(x, y, cx, cy, k); if (m <= 0 || m > .28) continue;
    g.strokeStyle = G0.grass[(r() * G0.grass.length) | 0]; g.lineWidth = st === 2 ? 3 : 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 3, y - 3 - r() * 4); g.stroke(); }
  g.restore();
  // the landmark at the head of the square
  TW_LAY.map = mapId; TW_LAY.pos = {};
  addProp('tland', cx, cy - 175, st);
  const taken = [{x:cx, y:cy - 175}], free = (x, y, gap = 165) => x > 120 && x < W - 120 && y > 140 && y < H - 100 && trailD(x, y) > 92 && twInPave(x, y + 10, cx, cy, k) <= 0 && !taken.some(p => Math.hypot(p.x - x, (p.y - y) * 1.15) < gap) && !GATES.some(gt => Math.hypot(gt.x - x, gt.y - y) < 180);
  const place = (x0, y0, v, key) => { for (let t = 0; t < 60; t++){ const a = r() * 6.283, d = t * 9, x = Math.round(x0 + Math.cos(a) * d), y = Math.round(y0 + Math.sin(a) * d * .8); if (!free(x, y)) continue; addProp('tbld', x, y, v); taken.push({x, y}); if (key) TW_LAY.pos[key] = [x, y]; return [x, y]; } return null; };
  // the services round the square, each at its own distance from it
  TW_SLOTS.forEach(([deg, type], i) => { const a = deg * Math.PI / 180, R = 1 + .12 * Math.sin(i * 2.1 + k), x = cx + Math.cos(a) * (twPaveR(Math.atan2(Math.sin(a), Math.cos(a)), k) + 150) * R, y = cy + Math.sin(a) * (twPaveR(a, k) / 1.32 + 120) * R;
    place(x, y, st * 10 + TW_TYPES.indexOf(type), type); });
  // houses along the streets, either side, with lamps beside the road
  for (const tr of TRAIL.lines){ let last = -999, side = 1;
    tr.forEach(([x, y], i) => { const d = Math.hypot(x - cx, y - cy); if (d < 470 || d > 1150 || i - last < 22) return; const nx = tr[Math.min(i + 1, tr.length - 1)], dx = nx[0] - x, dy = nx[1] - y, L0 = Math.hypot(dx, dy) || 1;
      side = -side; if (place(x - dy / L0 * 150 * side, y + dx / L0 * 120 * side, st * 10 + (r() < .5 ? 6 : 7))) last = i;
      if (i % 3 === 0){ const lx = x + dy / L0 * 48 * side, ly = y - dx / L0 * 40 * side; if (!taken.some(p => Math.hypot(p.x - lx, p.y - ly) < 70)) addProp(st === 3 ? 'lotusbowl' : 'lamp', lx, ly, 0); } }); }
  // lamps round the square's edge, then trees, beds and hedges in the gaps
  for (let i = 0; i < 9; i++){ const a = (i + .3) / 9 * 6.283, R0 = twPaveR(a, k) + 18, x = cx + Math.cos(a) * R0, y = cy + Math.sin(a) * R0 / 1.32; if (trailD(x, y) < 50 || taken.some(p => Math.hypot(p.x - x, p.y - y) < 80)) continue; addProp(st === 3 ? 'lotusbowl' : 'lamp', x, y, 0); }
  const green = [['tree', 'bush', 'flowerbed', 'hedge', 'frangipani'], ['palm', 'jar', 'flowerbed', 'rock', 'palm'], ['pine', 'pine', 'rock', 'bush', 'stupa'], ['himtree', 'lotusbowl', 'flowerbed', 'hedge', 'himtree']][st];
  let n = 0; for (let t = 0; t < 1400 && n < 70; t++){ const a = r() * 6.283, d = 280 + Math.sqrt(r()) * 1100, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .72;
    if (x < 80 || y < 110 || x > W - 80 || y > H - 80 || twInPave(x, y, cx, cy, k) > 0 || trailD(x, y) < 50 || GATES.some(gt => Math.hypot(gt.x - x, gt.y - y) < 150) || taken.some(p => Math.hypot(p.x - x, (p.y - y) * 1.2) < 95) || PROPS.some(p => Math.hypot(p.x - x, p.y - y) < 55)) continue;
    const type = green[(r() * green.length) | 0]; if (!PROP_TYPES[type]) continue; addProp(type, x, y, Math.floor(r() * 3)); n++; }
}
/* the ground: the region's own biome, without ponds, rivers or waterfalls, and the town instead of wild props */
{ const _pm = paintMap;
  paintMap = function(mapId){ if (!isTown(mapId)) return _pm.apply(this, arguments);
    const k = MAPS[mapId].biome, keep = BIOME[k], wf = WATERFALL_BIOMES[k];
    BIOME[k] = {...keep, ponds:0, band:null, band2:null, floor:null, propN:0, props:keep.props}; /* no flagstone ruins either */ delete WATERFALL_BIOMES[k];
    try { return _pm.apply(this, arguments); } finally { BIOME[k] = keep; if (wf) WATERFALL_BIOMES[k] = wf; } }; }
{ const _cp = campPlace; campPlace = function(){ if (isTown(MAP_ID)){ twLayout(MAP_ID); CAMP = null; return; } return _cp.apply(this, arguments); }; }   // a town has its square, not a travellers' camp (no fire, no camp cook)
/* no little ground decorations (flowers, pebbles, tufts) on the square or the streets */
{ const _cb = cuteBuild; cuteBuild = function(){ const r = _cb.apply(this, arguments); if (isTown(MAP_ID) && CUTE.decor){ const cx = W * .5, cy = H * .5; CUTE.decor = CUTE.decor.filter(d => Math.hypot((d.x - cx) / 1.35, d.y - cy) > 520 && trailD(d.x, d.y) > 40); } return r; }; }
/* no monsters and no boss in a town */
{ const _ss = setupSpawns; setupSpawns = function(id){ if (isTown(id)){ bossTimer = 1e12; return; } return _ss.apply(this, arguments); }; }
{ const _br = bossRecall; bossRecall = function(id){ if (isTown(id)){ bossTimer = 1e12; return; } return _br.apply(this, arguments); }; }
/* the daily tasks pick hunting grounds by level: never a town (they have no monsters) */
{ const _dg = dailyGen; dailyGen = function(){ const keep = TOWNS.map(T0 => { const mp = MAPS[T0.id]; const lv = mp && mp.lv; if (mp) mp.lv = [-9999, -9999]; return lv; });
    try { return _dg.apply(this, arguments); } finally { TOWNS.forEach((T0, i) => { if (MAPS[T0.id]) MAPS[T0.id].lv = keep[i]; }); } }; }
/* the town's music is the village song */
{ const _mm = musicMood; musicMood = function(){ if (isTown(MAP_ID) && typeof SFX !== 'undefined' && !PAUSED && !(typeof WB !== 'undefined' && WB.m && !WB.m.dead)){ SFX.music('village'); return; } return _mm.apply(this, arguments); }; }

/* ---------- people: the services, a kitchen and a costume shop ---------- */
const TW_FOLK = [
  // [shop, smith, bank, healer, food, costume] for each town: name, en, sex, hair, colour, top, head
  [['ป้าเหม่ยลี่', 'Auntie Mei Li', 'f', 2, 'hairBlack', 's_siam', 'f_clip'], ['ช่างเหล็กอาซิ้ม', 'Smith Ah Sim', 'm', 4, 'hairBlack', 's_knight', 'hc_hide'], ['เถ้าแก่กงสี', 'Taokae Kongsi', 'm', 6, 'hairBlack', 's_suriya', 'hc_hide'],
    ['หมอจีนเล่าเหวิน', 'Doctor Lao Wen', 'm', 2, 'hairWhite', 's_rune', 'hc_hide'], ['เจ๊หงส์ก๋วยเตี๋ยวเรือ', 'Jae Hong', 'f', 17, 'hairBrown', 's_sakura', 'f_bow'], ['ซินแสผ้าไหม', 'Silk Master Sinsae', 'f', 11, 'hairBlack', 's_peacock', 'h_wreath']],
  [['ยายบุปผาสมุนไพร', 'Grandma Buppha', 'f', 0, 'hairSilver', 's_desert', 'hc_hide'], ['ช่างหินศิลา', 'Mason Sila', 'm', 4, 'hairBrown', 's_lava', 'hc_hide'], ['นายกองคาราวาน', 'Caravan Master', 'm', 9, 'hairBlack', 's_desert', 'hc_hide'],
    ['หมอทะเลทรายอามีน', 'Desert Healer Amin', 'm', 3, 'hairBlack', 's_rune', 'hc_hide'], ['แม่ค้าน้ำชาซารีน', 'Tea-seller Zarin', 'f', 10, 'hairBlack', 's_star', 'k_veil'], ['นางระบำทราย', 'Sand Dancer', 'f', 13, 'hairAuburn', 's_kinnaree', 'h_wreathg']],
  [['ป้าคำปันยาดอย', 'Auntie Kham Pan', 'f', 20, 'hairBlack', 's_lanna', 'hc_hide'], ['ช่างเหล็กดอยหลวง', 'Doi Luang Smith', 'm', 6, 'hairBrown', 's_knight', 'hc_hide'], ['พ่อเลี้ยงคลังเวียง', 'Pho Liang', 'm', 2, 'hairAsh', 's_siam', 'hc_hide'],
    ['หมอเมืองแสนคำ', 'Healer Saen Kham', 'm', 1, 'hairWhite', 's_forest', 'hc_hide'], ['แม่อุ๊ยครัวดอย', 'Grandma Ui', 'f', 0, 'hairWhite', 's_lanna', 'f_clip'], ['ช่างทอบัวคำ', 'Weaver Bua Kham', 'f', 5, 'hairBlack', 's_lanna', 'h_wreathj']],
  [['นางฟ้าโอสถ', 'Apothecary Deva', 'f', 4, 'hairGold', 's_seraph', 'h_halo'], ['ช่างหัตถ์เทวะ', 'Deva Smith', 'm', 12, 'hairGold', 's_garuda', 'hc_hide'], ['ขุนคลังทิพย์', 'Celestial Treasurer', 'm', 2, 'hairWhite', 's_suriya', 'h_crown'],
    ['เทวีสมานแผล', 'Healing Devi', 'f', 22, 'hairWhite', 's_aurora', 'h_halo'], ['คนธรรพ์ครัวทิพย์', 'Gandharva Cook', 'm', 7, 'hairSky', 's_lotus', 'h_wreathg'], ['กินรีช่างอาภรณ์', 'Kinnaree Couturier', 'f', 14, 'hairRose', 's_kinnaree', 'h_plumep']]
];
const TW_ROLE = [['ยา · ตีบวก', 'Potions · Refine'], ['ตีบวก · ร้านอาวุธ', 'Refine · Weapons'], ['คลังบัญชี', 'Account Bank'], ['เติมเลือด · แจกบัฟ', 'Heal · Blessing'], ['อาหารท้องถิ่น', 'Local food'], ['ชุดประจำเมือง', 'Town costumes']];
const TW_AS = ['shop', 'smith', 'banker', 'healer_oon', null, null];
/* local dishes (Bia) and town costumes (Vayra Coins, sold only here) */
const TW_FOOD = [
  [['ก๋วยเตี๋ยวเรือ', 'Boat Noodles', {atkPct:.08}], ['ข้าวมันไก่ไหหลำ', 'Hainanese Chicken Rice', {regenPct:.03, every:4}], ['ชาเย็นท่าเรือ', 'Harbour Iced Tea', {crit:5}]],
  [['ขนมปังอบทราย', 'Sand-baked Flatbread', {def:40}], ['แกงแพะเครื่องเทศ', 'Spiced Goat Curry', {atkPct:.1}], ['ชาอินทผลัม', 'Date Tea', {regenPct:.035, every:4}]],
  [['ข้าวซอยดอย', 'Highland Khao Soi', {atkPct:.12}], ['แกงฮังเลหม้อดิน', 'Clay-pot Hang Le', {def:70}], ['ชาอัสสัมร้อน', 'Hot Assam Tea', {regenPct:.04, every:4}]],
  [['ข้าวทิพย์', 'Divine Rice', {atkPct:.14, crit:4}], ['น้ำอมฤตดอกบัว', 'Lotus Amrita', {regenPct:.05, every:4}], ['ขนมกลีบเมฆ', 'Cloud-petal Sweets', {def:110}]]
];
TOWNS.forEach((T0, ti) => { const lv = MAPS[T0.id] ? MAPS[T0.id].lv[0] : 50, price = Math.round(120 + lv * 9);
  TW_FOOD[ti].forEach(([th, en, fx], i) => { const [a, b] = ckFxText(fx); ITEMS[`tf_${T0.k}${i}`] = {name:th, en, kind:'use', sell:Math.round(price * .25), price, food:{...fx, t:900}, desc:[`อาหารท้องถิ่น${T0.name} · ${a} · 15 นาที`, `${T0.en} specialty · ${b} · 15 min`]}; }); });
{ const M = SPR.M, mm = (n, f = 'white') => (M[n] != null ? n : f), m = n => M[mm(n)];
  const TC = [
    [['tc_e_top', 'ชุดคหบดีท่าสำเภา', 'Harbour Merchant Robe', 'top', fSet('court', mm('scarlet'), mm('ivory'), mm('gold'), FT.combo(FT.kanok(m('gold')), FT.hem(m('gold'))))], ['tc_e_head', 'หมวกขุนนางจีน', 'Mandarin Hat', 'head', {hat:'cap', capMat:mm('charcoal', 'onyx')}]],
    [['tc_s_top', 'ชุดนักเดินทางคาราวาน', 'Caravan Traveller', 'top', fSet('robe', mm('sand', 'cream'), mm('ochre', 'gold'), mm('sunset', 'scarlet'), FT.combo(FT.chev(m('sunset', 'scarlet')), FT.hem(m('ochre', 'gold'))))], ['tc_s_head', 'ผ้าคลุมหน้าทะเลทราย', 'Desert Veil', 'mask', {faceMask:mm('sand', 'cream'), fmStyle:'veil', fmTrim:mm('gold'), fmEye:null}]],
    [['tc_w_top', 'ชุดผ้าทอเวียงดอย', 'Highland Woven Wear', 'top', fSet('ninja', mm('indigo', 'navy'), mm('scarlet'), mm('gold'), FT.combo(FT.stripes(m('scarlet')), FT.chev(m('gold'))))], ['tc_w_head', 'หมวกขนแกะดอย', 'Highland Wool Hat', 'head', {hat:'cap', capMat:mm('scarlet')}]],
    [['tc_n_top', 'ชุดอาภรณ์เทวา', 'Deva Raiment', 'top', fSet('sky', mm('pearl', 'white'), mm('goldLight', 'gold'), mm('auraGold', 'gold'), FT.combo(FT.kanok(m('goldLight', 'gold')), FT.hem(m('goldLight', 'gold'))))], ['tc_n_head', 'รัศมีเทวาลัย', 'Deva-city Halo', 'head', {hat:'crest', bandMat:mm('goldLight', 'gold'), crestMat:mm('auraWhite', 'white'), crestN:5, crestGem:true}]]
  ];
  TC.forEach((list, ti) => list.forEach(([id, th, en, slot, look]) => { COSTUME[id] = {slot, th, en, src:'town', grand:slot === 'top', town:TOWNS[ti].k, tprice:slot === 'top' ? 60 : 30, sw:[look.top || look.capMat || look.bandMat || look.faceMask, look.forearm || look.crestMat || look.fmTrim || look.capMat], look}; SPR.GEAR_LOOK[id] = look; }));
  if (typeof COS_SRC !== 'undefined') COS_SRC.town = ['ร้านชุดในเมืองรอยต่อ (เหรียญวายรา)', 'Crossroads-town costume shop (Vayra Coins)'];
}
const twLook = f => ({job:'ms_npc', look:{sex:f[2], hair:f[3], color:f[4]}, gear:{armor:f[5], head:f[6]}});
const twSheet = n => (n.tw && typeof heroSheet === 'function' ? heroSheet(n.tw.job, n.tw.gear, n.tw.look) : null);
{ const _s = setupNpcs;
  setupNpcs = function(id){ const r = _s.apply(this, arguments); const T0 = TOWN_OF[id]; if (!T0) return r;
    for (let i = NPCS.length - 1; i >= 0; i--) if (NPCS[i].id === 'quarter' || NPCS[i].id === 'campcook') NPCS.splice(i, 1);   // no camp quartermaster in a town
    const ti = TOWNS.indexOf(T0), cx = W * .5, cy = H * .5;
    TW_FOLK[ti].forEach((f, i) => { const type = TW_SLOTS[[0, 1, 2, 3, 4, 6][i]][1], at = TW_LAY.map === id && TW_LAY.pos[type] ? TW_LAY.pos[type] : twSlot(TW_SLOTS[[0, 1, 2, 3, 4, 6][i]][0], 1), x = at[0], y = at[1] + 46; void cx; void cy;
      const id2 = TW_AS[i] || `tw_${T0.k}_${i === 4 ? 'food' : 'cos'}`; NPCS.push({id:id2, name:f[0], en:f[1], role:TW_ROLE[i][0], roleEn:TW_ROLE[i][1], x, y, tw:twLook(f), twTown:T0.k, twKind:i}); });
    return r; }; }
/* town folk use their own figure (the services keep their usual dialogs) */
{ const _d = drawNpcW;
  drawNpcW = function(g, n){ if (!n || !n.tw) return _d.apply(this, arguments); const sh = twSheet(n); if (!sh) return _d.apply(this, arguments);
    const x = n.x - cam.x, y = n.y - cam.y; if (x < -60 || x > VW + 60 || y < -80 || y > VH + 40) return; const near = Math.hypot(n.x - P.x, n.y - P.y) < 110;
    shadowW(g, x, y, 9); SPR.draw(g, sh, 'idle', near ? SPR.dirFromVec(P.x - n.x, P.y - n.y) : 0, T + n.x * .01, x, y, {lazy:true}); }; }
function twPortrait(n){ const cv = document.querySelector('#dialog .dp'), sh = twSheet(n); if (!cv || !sh) return; const K = sh.K, fs = sh.fs, c = SPR.ensure(sh, 'idle'), g = cv.getContext('2d');
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height); g.drawImage(c, fs / 2 - 16 * K, sh.anchor[1] - 46 * K, 32 * K, 32 * K, 0, 0, cv.width, cv.height);
  const h = document.querySelector('#dialog .dn h3'); if (h) h.textContent = nm(n); const s = document.querySelector('#dialog .dn small'); if (s) s.textContent = L(n.role, n.roleEn); }
{ const _o = openNpc; openNpc = function(n){ const r = _o.apply(this, arguments); if (n && n.tw) twPortrait(n); return r; }; }
/* the kitchen and the costume shop */
function twShopRows(T0, kind){
  const ti = TOWNS.indexOf(T0);
  if (kind === 4) return [0, 1, 2].map(i => { const id = `tf_${T0.k}${i}`, it = ITEMS[id], can = S.bia >= it.price;
    return `<div class="srow"><span class="ic">${typeof itemIcon === 'function' ? itemIcon(id) : '🍲'}</span><div class="nm"><b>${nm(it)}</b><small>${L(it.desc[0], it.desc[1])}</small></div><span class="pr">${fmtN(it.price)} <small>${CUR()}</small></span><button class="btn sm" data-twbuy="${id}" ${can ? '' : 'disabled'}>${L('ซื้อ', 'Buy')}</button></div>`; }).join('');
  return Object.keys(COSTUME).filter(k => COSTUME[k].town === T0.k).map(k => { const c = COSTUME[k], own = cosHave(k), can = (ACC.coins || 0) >= c.tprice; void ti;
    return `<div class="srow${own ? ' owned' : ''}"><span class="ic"><i class="cosw" data-cth="${k}" style="--c1:${cosSwatch(k, 0)};--c2:${cosSwatch(k, 1)}"></i></span><div class="nm"><b>${L(c.th, c.en)}</b><small>${L('มีขายที่นี่ที่เดียว · ใส่ได้ทุกตัวละครในบัญชี', 'Only sold here · for every character on the account')}</small></div><span class="pr">${c.tprice} <small>${L('เหรียญ', 'coins')}</small></span><button class="btn sm" data-twcos="${k}" ${own || !can ? 'disabled' : ''}>${own ? '✓' : L('ซื้อ', 'Buy')}</button></div>`; }).join('');
}
const TW_SAY = [[['มาแล้วจ้า! ก๋วยเตี๋ยวเรือชามเล็ก น้ำข้นถึงใจ กินแล้วมีแรงล่ามอนทั้งวัน', 'Here you go! Little bowls of boat noodles, rich broth — strength for a whole day of hunting.'], ['ผ้าไหมจากเมืองจีน ตัดเป็นชุดสวยสง่า มีที่นี่ที่เดียวนะ', 'Silk from China, cut into elegant clothes — you will not find these anywhere else.']],
  [['นั่งพักก่อน นักเดินทาง ชาอินทผลัมร้อน ๆ กับขนมปังอบทรายจ้ะ', 'Sit and rest, traveller — hot date tea and sand-baked bread.'], ['ผ้าทอของกองคาราวาน กันแดดกันทรายได้ทั้งวัน', 'Caravan cloth — it keeps off sun and sand all day.']],
  [['หนาวแบบนี้ต้องข้าวซอยร้อน ๆ เจ้าคะ', 'In cold like this you want a hot bowl of khao soi.'], ['ผ้าทอมือจากกี่ของแม่อุ๊ย ลายดอยแท้ ๆ เลยเจ้า', "Hand-woven on Grandma Ui's loom — true highland patterns."]],
  [['อาหารทิพย์ปรุงด้วยเพลงของคนธรรพ์ กินแล้วใจเบาเหมือนลอยได้', 'Divine food cooked to a gandharva\'s song — eat and your heart feels light enough to fly.'], ['อาภรณ์ที่เหล่าเทวาสวมไปงานบนสวรรค์ ข้าตัดให้มนุษย์ใส่ได้แล้วนะ', 'The robes the devas wear to heavenly feasts — I have cut them for mortals too.']]];
for (const T0 of TOWNS) for (const kind of [4, 5]){ const id = `tw_${T0.k}_${kind === 4 ? 'food' : 'cos'}`;
  NPC_OPEN[id] = n => { const ti = TOWNS.indexOf(T0); npcFrame(n, L(...TW_SAY[ti][kind - 4]), `<div class="sec">${kind === 4 ? L('อาหารประจำเมือง', 'Local dishes') : L('ชุดประจำเมือง (เหรียญวายรา)', 'Town costumes (Vayra Coins)')}</div><div class="shop">${twShopRows(T0, kind)}</div>`); twPortrait(n); }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-twbuy],[data-twcos]'); if (!b || b.disabled) return;
  if (b.dataset.twbuy){ const it = ITEMS[b.dataset.twbuy]; if (!it || S.bia < it.price) return; S.bia -= it.price; addItem(b.dataset.twbuy, 1); SFX.play('coin'); }
  else { const k = b.dataset.twcos, c = COSTUME[k]; if (!c || cosHave(k) || (ACC.coins || 0) < c.tprice) return; ACC.coins -= c.tprice; cosGrant(k); }
  dirty = true; save(); const n = NPCS.find(x => x.id === el('dialog').dataset.npc); if (n && NPC_OPEN[n.id]) NPC_OPEN[n.id](n); });

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'towns', t:['เมืองรอยต่ออารยธรรม', 'Crossroads towns'], b:() => `<p>${L('แต่ละเส้นทางมีเมืองปลอดภัยหนึ่งเมือง ตรงจุดที่สองวัฒนธรรมมาบรรจบกัน มีร้านยา ช่างตีเหล็ก คลัง หมอ ผู้เฝ้าศาล (วาร์ป) อาหารท้องถิ่น และชุดที่ขายเฉพาะเมืองนั้น', 'Each road has one safe town where two cultures meet: potions, the smith, the bank, a healer, the shrine keeper (warp), local food and costumes sold only there.')}</p>
  ${TOWNS.map(T0 => `<p><b>${L(T0.name, T0.en)}</b> — ${L(T0.desc[0], T0.desc[1])}</p>`).join('')}`});
/* the shrine keeper of a town has no bounty board (a bounty is a hunt for one of the map's monsters) */
{ const _qd = questDialog; questDialog = function(n){ if (isTown(MAP_ID) && n && (n.id === 'warp' || n.id === 'job')) return {h:'', say:''}; return _qd.apply(this, arguments); }; }
