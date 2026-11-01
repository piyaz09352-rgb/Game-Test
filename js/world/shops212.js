/* VAYRATHEN — js/world/shops212.js — (v212) the shops of Aren, painted again
   The owner found the town's shops too rough: twelve copies of one flat box. Each is now drawn with depth and light:
   · a side wall seen in three-quarter view (with a lit lattice window), so the house has volume
   · teak walls shaded from the lit top to the darker foot, plank by plank, on a coursed stone plinth with a step
   · the open front glows warm inside, with the awning's shadow falling over the shelves
   · a billowing striped awning, each stripe shaded into its folds, a scalloped valance with gold trim and tassels
   · round red-lacquer posts with gold bands, red paper lanterns at the eaves, potted plants by the step
   · the tiled gable is lit from the upper left; its panel carries carved gold rays, an ornate trade medallion and a
     name board with the shop's name in Thai (no more single emoji in a circle)
   Same footprint as before (js/world/village2.js places them); the goods on the shelves and beside the house stay. */
'use strict';

const VSHOP_NAME = {smith:['โรงตีเหล็ก', 'Smithy'], forger:['โรงหลอมแร่', 'Smelter'], driller:['ร้านเจาะมณี', 'Gem Driller'], shop:['ร้านยา', 'Apothecary'],
  herbal:['สมุนไพร', 'Herbalist'], cook:['โรงครัว', 'Kitchen'], tailor:['ร้านตัดชุด', 'Tailor'], banker:['คลังเบี้ย', 'Bank'], registrar:['ทะเบียน', 'Registrar'],
  festival:['เทศกาล', 'Festival'], trader:['รับซื้อของ', 'Buyer'], beast:['เลี้ยงสัตว์', 'Beasts']};
const VSHOP_PLANT = {smith:'fern', forger:'cactus', driller:'fern', shop:'jasmine', herbal:'basil', cook:'chili', tailor:'rose', banker:'bonsai', registrar:'fern', festival:'marigold', trader:'bonsai', beast:'grass'};

const vsLin = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([t, c]) => gr.addColorStop(t, c)); return gr; };
function vsLantern(g, x, y, len){
  g.strokeStyle = 'rgba(40,20,10,.8)'; g.lineWidth = .5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + len); g.stroke();
  const cy = y + len + 4.2, gl = g.createRadialGradient(x, cy, 0, x, cy, 9); gl.addColorStop(0, 'rgba(255,180,90,.35)'); gl.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = gl; g.beginPath(); g.arc(x, cy, 9, 0, 7); g.fill();
  g.fillStyle = vsLin(g, x - 3.4, 0, x + 3.4, 0, [[0, '#7a1410'], [.35, '#e8402a'], [.6, '#ff6a40'], [1, '#8a1a12']]); ov(g, x, cy, 3.4, 4.2); g.fill();
  g.strokeStyle = 'rgba(90,20,10,.55)'; g.lineWidth = .35; for (const k of [-1.6, 0, 1.6]){ g.beginPath(); g.ellipse(x, cy, Math.abs(k) * .9 + .3, 4.1, 0, 0, 7); g.stroke(); }
  g.fillStyle = PAL.gold; g.fillRect(x - 1.8, cy - 4.8, 3.6, 1.1); g.fillRect(x - 1.8, cy + 3.7, 3.6, 1.1);
  g.strokeStyle = '#e8b040'; g.lineWidth = .5; for (const k of [-.6, 0, .6]){ g.beginPath(); g.moveTo(x + k, cy + 4.8); g.lineTo(x + k * 1.4, cy + 8.4); g.stroke(); }
}
function vsPlant(g, x, y, kind, rng){
  // a glazed clay pot, then what grows in it
  g.fillStyle = vsLin(g, x - 4, 0, x + 4, 0, [[0, '#7a3a1e'], [.4, '#c46a3a'], [1, '#6a2e16']]); pv(g, [x - 4, y - 7, x + 4, y - 7, x + 3, y, x - 3, y]); g.fill();
  g.fillStyle = '#d88a52'; g.fillRect(x - 4.6, y - 8, 9.2, 1.6); g.fillStyle = 'rgba(255,230,190,.35)'; g.fillRect(x - 3.2, y - 6.4, .8, 5);
  const leaf = (lx, ly, a, l, c) => { g.save(); g.translate(lx, ly); g.rotate(a); g.fillStyle = c; ov(g, 0, -l / 2, l * .26, l / 2); g.fill(); g.restore(); };
  if (kind === 'cactus'){ g.fillStyle = '#4a8a3a'; ov(g, x, y - 13, 2.6, 6); g.fill(); ov(g, x + 3, y - 14, 1.2, 3); g.fill(); g.fillStyle = '#ff7aa0'; ov(g, x, y - 19, 1.3, 1); g.fill(); return; }
  if (kind === 'bonsai'){ g.strokeStyle = '#6a4424'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y - 8); g.quadraticCurveTo(x - 3, y - 12, x + 1, y - 16); g.stroke();
    for (const [dx, dy, r] of [[-3, -16, 3.4], [2.6, -17.4, 3.6], [0, -20, 3]]){ g.fillStyle = '#3f7a3a'; ov(g, x + dx, y + dy, r, r * .7); g.fill(); g.fillStyle = 'rgba(180,230,140,.5)'; ov(g, x + dx - .8, y + dy - .8, r * .5, r * .3); g.fill(); } return; }
  const n = kind === 'grass' ? 9 : 7, green = kind === 'basil' ? '#5aa04a' : kind === 'fern' ? '#3f8a44' : '#4a8c3e';
  for (let i = 0; i < n; i++){ const a = -1.1 + i / (n - 1) * 2.2 + (rng() - .5) * .2; leaf(x + a * 1.2, y - 7.6, a, kind === 'grass' ? 10 : kind === 'fern' ? 9 : 7, i % 2 ? green : '#6abb58'); }
  const fl = {jasmine:'#ffffff', rose:'#e8406a', marigold:'#ffaa20', chili:'#e8281e'}[kind];
  if (fl) for (let i = 0; i < 4; i++){ const fx = x - 3 + i * 2 + (rng() - .5), fy = y - 11 - rng() * 4; g.fillStyle = fl; ov(g, fx, fy, kind === 'chili' ? .7 : 1.3, kind === 'chili' ? 1.6 : 1.2); g.fill(); if (kind !== 'chili'){ g.fillStyle = '#ffe070'; ov(g, fx, fy, .45, .45); g.fill(); } }
}

PROP_TYPES.vshop = (seed, v = 0) => makeProp({w:124, h:110, ax:62, ay:100, seed, shadow:[52, 12, 3], collide:30, glow:[0, -40, 62], paint(g, rng){
  const V = VSHOP[v] || VSHOP[0], T = V.roof, gold = [PAL.gold, PAL.goldL, PAL.goldD], nameTh = (VSHOP_NAME[V.k] || ['ร้านค้า'])[0];

  // ---- the plinth: coursed stone, a lit top edge, and the side face in shade; a stone step in front
  blocks(g, -44, -10, 84, 10, 8, 3.4, [PAL.stone, PAL.stoneL, '#b8ad98', PAL.stone], 'rgba(90,80,64,.9)', rng);
  g.fillStyle = 'rgba(255,248,230,.45)'; g.fillRect(-44, -10, 84, .8);
  g.fillStyle = vsLin(g, 40, 0, 52, 0, [[0, '#8a8070'], [1, '#6a6254']]); pv(g, [40, -10, 52, -15, 52, -5, 40, 0]); g.fill();
  g.fillStyle = vsLin(g, 0, -1, 0, 3, [[0, '#d8ceb8'], [1, '#a89c84']]); pv(g, [-22, 0, 22, 0, 24, 4, -24, 4]); g.fill(); g.fillStyle = 'rgba(255,250,235,.6)'; g.fillRect(-22, 0, 44, .6);

  // ---- the side wall (three-quarter view) with a lattice window lit from inside
  g.fillStyle = vsLin(g, 38, 0, 50, 0, [[0, PAL.teakD], [1, '#3a2010']]); pv(g, [38, -62, 50, -67, 50, -14, 38, -10]); g.fill();
  g.strokeStyle = 'rgba(20,10,4,.35)'; g.lineWidth = .4; for (let x = 41; x < 50; x += 3){ g.beginPath(); g.moveTo(x, -63 - (x - 38) * .42); g.lineTo(x, -11 - (x - 38) * .33); g.stroke(); }
  { const wx0 = 40.6, wx1 = 47.4, wy = k => -48 - (k - 38) * .42;
    g.fillStyle = vsLin(g, 0, -50, 0, -34, [[0, '#ffd88a'], [1, '#e8902a']]); pv(g, [wx0, wy(wx0), wx1, wy(wx1), wx1, wy(wx1) + 15, wx0, wy(wx0) + 15]); g.fill();
    g.strokeStyle = '#3a2010'; g.lineWidth = .7; for (const f of [1 / 3, 2 / 3]){ const x = wx0 + (wx1 - wx0) * f; g.beginPath(); g.moveTo(x, wy(x)); g.lineTo(x, wy(x) + 15); g.stroke(); }
    for (const f of [.33, .66]){ g.beginPath(); g.moveTo(wx0, wy(wx0) + 15 * f); g.lineTo(wx1, wy(wx1) + 15 * f); g.stroke(); }
    g.strokeStyle = PAL.teakL; g.lineWidth = 1; pv(g, [wx0, wy(wx0), wx1, wy(wx1), wx1, wy(wx1) + 15, wx0, wy(wx0) + 15]); g.stroke(); }

  // ---- the front wall: planks with their own tones, lit from the top
  for (let x = -38, i = 0; x < 38; x += 5, i++){ const w = Math.min(5, 38 - x), t = rng();
    g.fillStyle = t < .33 ? PAL.teakM : t < .66 ? '#8a5530' : PAL.teakL; g.fillRect(x, -62, w, 54); g.fillStyle = 'rgba(40,18,6,.35)'; g.fillRect(x + w - .5, -62, .5, 54); }
  grain(g, -38, -62, 76, 54, rng, 26);
  g.fillStyle = vsLin(g, 0, -62, 0, -8, [[0, 'rgba(255,230,180,.22)'], [.45, 'rgba(0,0,0,0)'], [1, 'rgba(30,12,4,.38)']]); g.fillRect(-38, -62, 76, 54);
  g.fillStyle = vsLin(g, 0, -62, 0, -55, [[0, 'rgba(20,8,2,.55)'], [1, 'rgba(20,8,2,0)']]); g.fillRect(-38, -62, 76, 7);   // under the eaves

  // ---- the open front: warm light inside, the shelves, then the awning's shadow over them
  { const gr = g.createRadialGradient(0, -38, 2, 0, -38, 38); gr.addColorStop(0, '#6a3c1a'); gr.addColorStop(.6, '#3a200e'); gr.addColorStop(1, '#1a0c04'); g.fillStyle = gr; g.fillRect(-31, -52, 62, 26); }
  (VG_SHELF[V.k] || VG_SHELF.shop)(g, rng);
  g.fillStyle = vsLin(g, 0, -52, 0, -42, [[0, 'rgba(10,4,0,.6)'], [1, 'rgba(10,4,0,0)']]); g.fillRect(-31, -52, 62, 10);
  g.fillStyle = vsLin(g, -31, 0, -25, 0, [[0, 'rgba(10,4,0,.45)'], [1, 'rgba(10,4,0,0)']]); g.fillRect(-31, -52, 6, 26);
  g.fillStyle = vsLin(g, 31, 0, 25, 0, [[0, 'rgba(10,4,0,.45)'], [1, 'rgba(10,4,0,0)']]); g.fillRect(25, -52, 6, 26);

  // ---- the counter: a lit top board and a front panel with gold diamond inlays
  g.fillStyle = vsLin(g, 0, -29, 0, -24, [[0, PAL.teakH], [1, PAL.teakM]]); g.fillRect(-36, -29, 72, 5); g.fillStyle = 'rgba(255,240,200,.55)'; g.fillRect(-36, -29, 72, .6);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-35, -24, 70, 1.2);
  g.fillStyle = vsLin(g, 0, -23, 0, -9, [[0, PAL.teakM], [1, PAL.teakD]]); g.fillRect(-34, -23, 68, 14);
  for (let i = 0; i < 5; i++){ const cx = -27 + i * 13.5; g.strokeStyle = 'rgba(30,14,4,.5)'; g.lineWidth = .5; g.strokeRect(cx - 5.6, -21, 11.2, 10);
    g.fillStyle = PAL.goldD; pv(g, [cx, -19.6, cx + 3, -16, cx, -12.4, cx - 3, -16]); g.fill(); g.fillStyle = PAL.goldL; pv(g, [cx, -19.6, cx + 1.4, -16.6, cx - 1.4, -16.6]); g.fill(); }

  // ---- round lacquer posts with gold bands
  for (const x of [-40, 35]){ g.fillStyle = vsLin(g, x, 0, x + 4.4, 0, [[0, '#4a1410'], [.3, '#c8503c'], [.55, '#e8705a'], [1, '#5e1a14']]); g.fillRect(x, -66, 4.4, 58);
    for (const y of [-66, -60, -13]){ g.fillStyle = vsLin(g, x - .6, 0, x + 5, 0, [[0, PAL.goldD], [.45, PAL.goldL], [1, PAL.goldD]]); g.fillRect(x - .6, y, 5.6, y === -13 ? 5 : 2.4); } }

  // ---- the awning: stripes that sag a little, shaded into their folds, a scalloped valance with trim and tassels
  { const aw = V.awn, n = 8, x0 = -42, x1 = 42, top = -65, hem = -55;
    g.fillStyle = 'rgba(20,8,0,.28)'; pv(g, [-40, -55, 40, -55, 38, -50, -38, -50]); g.fill();   // its shadow on the wall
    for (let i = 0; i < n; i++){ const a = -38 + i * 9.5, b = -38 + (i + 1) * 9.5, c = x0 + i * 10.5, d = x0 + (i + 1) * 10.5;
      g.fillStyle = vsLin(g, 0, top, 0, hem, [[0, aw[i % 2]], [1, aw[i % 2]]]); g.beginPath(); g.moveTo(a, top); g.lineTo(b, top); g.lineTo(d, hem); g.quadraticCurveTo((c + d) / 2, hem + 1.6, c, hem); g.closePath(); g.fill();
      g.fillStyle = vsLin(g, c, 0, d, 0, [[0, 'rgba(0,0,0,.18)'], [.3, 'rgba(255,255,255,.14)'], [.7, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.2)']]); g.beginPath(); g.moveTo(a, top); g.lineTo(b, top); g.lineTo(d, hem); g.quadraticCurveTo((c + d) / 2, hem + 1.6, c, hem); g.closePath(); g.fill(); }
    g.fillStyle = vsLin(g, 0, top, 0, top + 3, [[0, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']]); g.fillRect(-38, top, 76, 3);
    for (let i = 0; i < n * 2; i++){ const cx = x0 + i * 5.25 + 2.62; g.fillStyle = aw[Math.floor(i / 2) % 2]; g.beginPath(); g.arc(cx, hem + .6, 2.62, 0, Math.PI); g.fill();
      g.strokeStyle = PAL.gold; g.lineWidth = .45; g.beginPath(); g.arc(cx, hem + .6, 2.2, .15, Math.PI - .15); g.stroke();
      if (i % 2){ g.strokeStyle = '#e8b040'; g.lineWidth = .5; g.beginPath(); g.moveTo(cx + 2.62, hem + .6); g.lineTo(cx + 2.62, hem + 4); g.stroke(); g.fillStyle = '#ffd060'; ov(g, cx + 2.62, hem + 4.3, .7, .9); g.fill(); } }
    g.fillStyle = PAL.goldD; g.fillRect(x0, hem - .2, x1 - x0, .7); }

  // ---- the tiled gable roof, lit from the upper left
  const ge = -66, ga = -96;
  for (const s of [-1, 1]){ roofBand(g, s * 52, ge + 2, 0, ga, 9, [T[2], T[1], '#1a1a1a'], 11); roofBand(g, s * 52, ge + 2, 0, ga, 7, T, 11); }
  g.save(); g.globalCompositeOperation = 'source-atop';
  g.fillStyle = vsLin(g, -40, -96, 40, -62, [[0, 'rgba(255,245,220,.32)'], [.5, 'rgba(255,255,255,0)'], [1, 'rgba(20,10,0,.28)']]); pv(g, [-56, -60, 0, -102, 56, -60]); g.fill(); g.restore();
  // the gable panel: dark teak, carved gold rays rising from the base, a beaded border
  g.fillStyle = vsLin(g, 0, ga, 0, ge, [[0, '#4a2810'], [1, PAL.teakD]]); pv(g, [-44, ge, 0, ga + 2, 44, ge]); g.fill();
  g.save(); pv(g, [-44, ge, 0, ga + 2, 44, ge]); g.clip();
  for (let i = 0; i <= 16; i++){ const a = Math.PI + i / 16 * Math.PI; g.strokeStyle = i % 2 ? 'rgba(230,180,70,.55)' : 'rgba(255,220,120,.8)'; g.lineWidth = i % 2 ? .6 : 1; g.beginPath(); g.moveTo(0, ge); g.lineTo(Math.cos(a) * 60, ge + Math.sin(a) * 60); g.stroke(); }
  g.restore();
  g.fillStyle = PAL.goldL; for (let i = 0; i <= 22; i++){ const t = i / 22, x = -44 + 88 * t, y = ge - (1 - Math.abs(t * 2 - 1)) * 28 + 1.6; ov(g, x, y, .6, .6); g.fill(); }
  for (const s of [-1, 1]){ barge(g, s * 47, ge, 0, ga, 2.2, 7, gold); hangHong(g, s * 47, ge, s, PAL.gold); }
  chofa(g, 0, ga, 8, PAL.gold);
  // the name board across the gable's foot
  { const w = 46, y0 = -74; g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-w / 2 + .8, y0 + .8, w, 8.6);
    g.fillStyle = vsLin(g, 0, y0, 0, y0 + 8.6, [[0, '#8a1e18'], [1, '#5a0e0a']]); g.fillRect(-w / 2, y0, w, 8.6);
    g.strokeStyle = PAL.gold; g.lineWidth = .8; g.strokeRect(-w / 2 + .6, y0 + .6, w - 1.2, 7.4);
    g.fillStyle = '#ffe9a8'; g.font = '700 6.4px Sarabun,"Noto Sans Thai",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(nameTh, 0, y0 + 4.6, w - 5); g.textBaseline = 'alphabetic'; }
  // the trade medallion above it: a gold lotus ring around a cream disc with the trade's sign
  { const cy = -84.5; for (let i = 0; i < 12; i++){ const a = i / 12 * 6.283; g.fillStyle = i % 2 ? PAL.goldD : PAL.gold; ov(g, Math.cos(a) * 7.2, cy + Math.sin(a) * 7.2, 2.2, 2.2); g.fill(); }
    const gr = g.createRadialGradient(-1.5, cy - 1.5, .5, 0, cy, 6.6); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#f0dcae'); g.fillStyle = gr; g.beginPath(); g.arc(0, cy, 6.4, 0, 7); g.fill();
    g.strokeStyle = PAL.goldD; g.lineWidth = .6; g.stroke();
    g.font = '8.4px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(V.ico, 0, cy + .4); g.textBaseline = 'alphabetic'; }

  // ---- lanterns at the eaves, plants by the step, and the goods beside the house
  vsLantern(g, -45, -63, 3); vsLantern(g, 44, -63, 3);
  const pk = VSHOP_PLANT[V.k] || 'fern'; for (const px of [-33, 31]){ g.save(); g.translate(px, 1); g.scale(.68, .68); vsPlant(g, 0, 0, pk, rng); g.restore(); }
  (VG_SIDE[V.k] || (() => {}))(g, rng);
}});
