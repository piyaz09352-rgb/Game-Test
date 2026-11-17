/* VAYRATHEN — js/world/village312.js — (v312) Aren's village homes, shophouses and market stalls, drawn to sit with the shops
   The owner: «is that all you can draw for houses and the market? look at the shops». The shops round the plaza are the
   owner's own pictures — front-on, chunky, a stone plinth and steps, a tiled roof with gold trim, lanterns, plants and
   goods everywhere. The village's houses and stalls were small plain props from the hunting maps. These are drawn new in
   that manner:
   · arhome (6 kinds): a Thai home on a stone plinth with steps — teak walls, framed windows with open shutters and
     flower boxes, a carved door, a two-tier tiled roof with gold barge boards and chofa finials, lanterns on the porch,
     potted plants; each kind has its own roof colour and its own yard things (rice baskets, a bird cage, a bicycle,
     drying chillies, a water jar, bougainvillea);
   · arrow (6 kinds): a two-storey wooden shophouse (ห้องแถว) for the streets near the plaza — the ground floor open as a
     shop with its goods out front under an awning and a sign board, a balcony with plants above;
   · arstall (6 kinds): a market stall with a scalloped cloth canopy and tassels, a counter heaped with its own goods
     (fruit, fish on ice, garlands, pottery, cloth, sweets), baskets and crates below and a small sign.
   Only pictures: sizes and collisions are set here, placement is in js/world/aren311.js. */
'use strict';
const V12 = {
  roofs:[['#c23a2c', '#e8604a', '#7e1f18'], ['#2f7d5c', '#4aa67e', '#1d4d38'], ['#2f5f9e', '#4c86c8', '#1d3a66'], ['#b8642c', '#de8c4a', '#70391a'], ['#8e2c50', '#bc4e72', '#581a32'], ['#a83426', '#d45a44', '#6a1c14']],
  woods:[['#8a5a32', '#b47c4a', '#5c381c'], ['#9c6c3c', '#c88e56', '#664224'], ['#7c4c2c', '#a46c42', '#4c2c14'], ['#a87a48', '#d2a46c', '#6e4c28']],
  gold:['#fbe08a', '#e2ae44', '#9c6a1c'], stone:['#d8cdb8', '#b8ab94', '#857a66']
};
const v12Grad = (g, x0, y0, x1, y1, a, b) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, a); gr.addColorStop(1, b); return gr; };
/* a stone plinth across the front, with steps up in the middle */
function v12Plinth(g, w, h, stepW, rng){ const S = V12.stone;
  g.fillStyle = v12Grad(g, 0, -h, 0, 0, S[0], S[1]); g.fillRect(-w / 2, -h, w, h); g.fillStyle = S[2]; g.fillRect(-w / 2, -1.6, w, 1.6);
  g.strokeStyle = 'rgba(90,80,60,.45)'; g.lineWidth = .5; for (let y = -h + h / 3; y < 0; y += h / 3){ g.beginPath(); g.moveTo(-w / 2, y); g.lineTo(w / 2, y); g.stroke(); }
  for (let r = 0; r < 3; r++) for (let x = -w / 2 + (r % 2) * 6; x < w / 2; x += 12){ const y0 = -h + r * h / 3; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + h / 3); g.stroke(); }
  for (let i = 0; i < 3; i++){ const sw = stepW + i * 6, sy = -h + (i + 1) * h / 3; g.fillStyle = i % 2 ? S[0] : '#e8dfcc'; g.fillRect(-sw / 2, sy - h / 3, sw, h / 3); g.fillStyle = 'rgba(80,70,50,.35)'; g.fillRect(-sw / 2, sy - 1, sw, 1); }
  for (let i = 0; i < 6; i++){ g.fillStyle = 'rgba(110,140,70,.55)'; ov(g, -w / 2 + rng() * w, -rng() * h * .3, 1.6 + rng() * 2, 1 + rng()); g.fill(); } }
/* vertical teak planks with seams and a darker skirt */
function v12Wall(g, x0, y0, x1, y1, W){ g.fillStyle = v12Grad(g, 0, y0, 0, y1, W[1], W[0]); g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.strokeStyle = W[2]; g.lineWidth = .45; for (let x = x0 + 4; x < x1; x += 4.5){ g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
  g.fillStyle = 'rgba(255,240,210,.12)'; g.fillRect(x0, y0, x1 - x0, 2); g.fillStyle = W[2]; g.fillRect(x0, y1 - 3, x1 - x0, 3); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x0, y0, x1 - x0, 3); }
/* a framed window: lattice, warm light, open shutters and a flower box */
function v12Window(g, x, y, w, h, sh, lit, fl){ g.fillStyle = '#4a2c14'; g.fillRect(x - 1.2, y - 1.2, w + 2.4, h + 2.4);
  g.fillStyle = lit ? v12Grad(g, 0, y, 0, y + h, '#ffe6a0', '#e8a848') : '#3a2a1e'; g.fillRect(x, y, w, h);
  g.strokeStyle = '#5a3a1c'; g.lineWidth = .7; g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h / 2); g.lineTo(x + w, y + h / 2); g.stroke();
  for (const [sx, d] of [[x - w * .42, -1], [x + w, 1]]){ g.fillStyle = sh; g.fillRect(sx, y, w * .42, h); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .4; for (let k = 1; k < 4; k++){ g.beginPath(); g.moveTo(sx + 1, y + h * k / 4); g.lineTo(sx + w * .42 - 1, y + h * k / 4); g.stroke(); } }
  g.fillStyle = '#6a4222'; g.fillRect(x - 2, y + h + .5, w + 4, 3); g.fillStyle = '#3f7a34'; for (let i = 0; i < 5; i++){ ov(g, x + i * w / 4, y + h, 2, 1.6); g.fill(); }
  for (let i = 0; i < 4; i++){ g.fillStyle = fl[i % fl.length]; ov(g, x + 1 + i * w / 3.2, y + h - .6, 1.1, 1.1); g.fill(); } }
/* a two-tier tiled Thai roof with gold barge boards and finials; y = the eave line, h = its height */
function v12Roof(g, w, y, h, R, rng){ const G = V12.gold, tier = (ww, yy, hh, lean) => {
    g.fillStyle = v12Grad(g, 0, yy - hh, 0, yy, R[1], R[0]); g.beginPath(); g.moveTo(-ww / 2 - lean, yy); g.lineTo(-ww * .2, yy - hh); g.lineTo(ww * .2, yy - hh); g.lineTo(ww / 2 + lean, yy); g.closePath(); g.fill();
    g.strokeStyle = R[2]; g.lineWidth = .55; for (let k = 1; k < 7; k++){ const ty = yy - hh * k / 7, half = ww / 2 + lean - (ww * .3 + lean) * k / 7; g.beginPath(); for (let x = -half; x <= half; x += 4){ g.moveTo(x, ty); g.quadraticCurveTo(x + 2, ty + 1.8, x + 4, ty); } g.stroke(); }
    g.fillStyle = 'rgba(255,230,190,.16)'; g.beginPath(); g.moveTo(-ww * .2, yy - hh); g.lineTo(-ww / 2 - lean, yy); g.lineTo(-ww / 2 - lean + 8, yy); g.lineTo(-ww * .2 + 4, yy - hh); g.fill();
    g.strokeStyle = G[1]; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-ww / 2 - lean - 2, yy + .5); g.lineTo(-ww * .2, yy - hh); g.lineTo(ww * .2, yy - hh); g.lineTo(ww / 2 + lean + 2, yy + .5); g.stroke();
    g.strokeStyle = G[0]; g.lineWidth = .8; g.stroke();
    for (const s of [-1, 1]){ g.fillStyle = G[1]; g.beginPath(); g.moveTo(s * (ww / 2 + lean + 2), yy + .5); g.quadraticCurveTo(s * (ww / 2 + lean + 7), yy - 1, s * (ww / 2 + lean + 6), yy - 6); g.quadraticCurveTo(s * (ww / 2 + lean + 4), yy - 2, s * (ww / 2 + lean), yy - 1); g.fill(); } };   // the hang hong curls at the eaves
  tier(w + 16, y, h * .42, 6);                   // the wide lower tier
  tier(w * .78, y - h * .32, h * .7, 2);         // the upper tier and its gable
  // the gable face: a carved gold panel, a round medallion
  const gy = y - h * .32 - h * .7, gh = h * .5; g.fillStyle = v12Grad(g, 0, gy, 0, gy + gh, '#7a3a1e', '#4e2410'); g.beginPath(); g.moveTo(0, gy + 3); g.lineTo(w * .16, gy + gh); g.lineTo(-w * .16, gy + gh); g.closePath(); g.fill();
  g.strokeStyle = G[1]; g.lineWidth = .7; for (let k = 1; k < 4; k++){ g.beginPath(); g.moveTo(-w * .16 * k / 4, gy + 3 + (gh - 3) * k / 4); g.lineTo(w * .16 * k / 4, gy + 3 + (gh - 3) * k / 4); g.stroke(); }
  g.fillStyle = G[0]; ov(g, 0, gy + gh * .62, 3.2, 3.2); g.fill(); g.fillStyle = R[0]; ov(g, 0, gy + gh * .62, 1.6, 1.6); g.fill();
  // the chofa: a slender gold horn at the top of the gable
  g.fillStyle = G[1]; g.beginPath(); g.moveTo(-1.4, gy + 3); g.quadraticCurveTo(-2, gy - 6, 3, gy - 9); g.quadraticCurveTo(0, gy - 5, 1.4, gy + 3); g.fill(); g.fillStyle = G[0]; ov(g, 3, gy - 9, 1.1, 1.1); g.fill(); }
function v12Lantern(g, x, y, c){ g.strokeStyle = '#3a2410'; g.lineWidth = .4; g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x, y - 2); g.stroke(); g.fillStyle = c; ov(g, x, y + 1.5, 2.6, 3.4); g.fill(); g.fillStyle = 'rgba(255,240,170,.7)'; ov(g, x - .6, y + .8, 1, 1.6); g.fill(); g.fillStyle = V12.gold[1]; g.fillRect(x - 1.6, y - 2.4, 3.2, .9); g.fillRect(x - 1.6, y + 4.6, 3.2, .9); g.strokeStyle = '#c03020'; g.beginPath(); g.moveTo(x, y + 5.4); g.lineTo(x, y + 8); g.stroke(); }
function v12Pot(g, x, y, leaf, fl){ g.fillStyle = '#a5532c'; g.beginPath(); g.moveTo(x - 4, y - 7); g.lineTo(x + 4, y - 7); g.lineTo(x + 3, y); g.lineTo(x - 3, y); g.closePath(); g.fill(); g.fillStyle = '#c87048'; g.fillRect(x - 4.4, y - 8, 8.8, 1.6);
  for (let i = 0; i < 7; i++){ const a = -Math.PI / 2 + (i - 3) * .42; g.fillStyle = i % 2 ? leaf : '#2f6a2e'; ov(g, x + Math.cos(a) * 5, y - 9 + Math.sin(a) * 5, 2.6, 1.6, a); g.fill(); } if (fl) for (let i = 0; i < 4; i++){ g.fillStyle = fl; ov(g, x - 3 + i * 2, y - 12 - (i % 2) * 2, 1.2, 1.2); g.fill(); } }
function v12Sign(g, x, y, w, h, text, bg, fg = '#fff6d8'){ g.fillStyle = V12.gold[2]; g.fillRect(x - w / 2 - 1, y - 1, w + 2, h + 2); g.fillStyle = bg; g.fillRect(x - w / 2, y, w, h); g.strokeStyle = V12.gold[0]; g.lineWidth = .5; g.strokeRect(x - w / 2 + .8, y + .8, w - 1.6, h - 1.6);
  g.fillStyle = fg; g.font = `700 ${Math.round(h * .66)}px Sarabun, "Noto Sans Thai", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y + h * .54, w - 3); }
/* goods: a heap of something round in a flat basket */
function v12Heap(g, x, y, r, cols, rng, n = 9){ g.fillStyle = '#9a7238'; ov(g, x, y, r + 1.5, (r + 1.5) * .42); g.fill(); g.strokeStyle = '#6e4e22'; g.lineWidth = .4; g.stroke();
  for (let i = 0; i < n; i++){ const a = rng() * 6.283, d = Math.sqrt(rng()) * r * .8, k = i / n; g.fillStyle = cols[i % cols.length]; ov(g, x + Math.cos(a) * d, y - 1.5 - k * r * .5 + Math.sin(a) * d * .25, r * .3, r * .26); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; ov(g, x + Math.cos(a) * d - .6, y - 2 - k * r * .5 + Math.sin(a) * d * .25, r * .1, r * .08); g.fill(); } }

/* ---------- the village home ---------- */
const V12_HOME = [{roof:0, wood:0, yard:'rice'}, {roof:1, wood:1, yard:'cage'}, {roof:2, wood:2, yard:'bike'}, {roof:3, wood:3, yard:'chilli'}, {roof:4, wood:0, yard:'jar'}, {roof:5, wood:1, yard:'bougain'}];
PROP_TYPES.arhome = (seed, v = 0) => makeProp({w:156, h:178, ax:78, ay:168, seed, shadow:[60, 12], collide:36, paint(g, rng){ const K = V12_HOME[v % 6], R = V12.roofs[K.roof], Wd = V12.woods[K.wood], fl = ['#ff7aa8', '#ffd84a', '#ffffff', '#ff6040'];
    v12Plinth(g, 128, 14, 26, rng);
    // posts and the porch beam
    v12Wall(g, -56, -78, 56, -14, Wd);
    for (const x of [-58, -20, 20, 58]){ g.fillStyle = v12Grad(g, x - 2.6, 0, x + 2.6, 0, Wd[2], Wd[1]); g.fillRect(x - 2.6, -82, 5.2, 68); g.fillStyle = V12.gold[1]; g.fillRect(x - 3.4, -82, 6.8, 2); g.fillRect(x - 3.4, -17, 6.8, 2); }
    g.fillStyle = Wd[2]; g.fillRect(-62, -84, 124, 4);
    // windows and the carved double door
    v12Window(g, -46, -62, 16, 18, R[0], true, fl); v12Window(g, 30, -62, 16, 18, R[0], true, fl);
    g.fillStyle = '#4a2810'; g.fillRect(-12, -66, 24, 52); g.fillStyle = v12Grad(g, 0, -64, 0, -14, '#a26034', '#6e3c1a'); g.fillRect(-10.5, -64, 10, 50); g.fillRect(.5, -64, 10, 50);
    g.strokeStyle = V12.gold[1]; g.lineWidth = .6; for (const dx of [-10.5, .5]){ g.strokeRect(dx + 2, -60, 6, 16); g.strokeRect(dx + 2, -40, 6, 20); } g.fillStyle = V12.gold[0]; ov(g, -2, -38, .9, .9); g.fill(); ov(g, 2, -38, .9, .9); g.fill();
    g.fillStyle = V12.gold[1]; g.beginPath(); g.moveTo(-14, -66); g.quadraticCurveTo(0, -76, 14, -66); g.closePath(); g.fill();   // a carved arch over the door
    v12Roof(g, 128, -82, 72, R, rng);
    v12Lantern(g, -38, -76, '#e04030'); v12Lantern(g, 38, -76, '#e04030');
    v12Pot(g, -26, -14, '#4e9a3a', fl[v % 4]); v12Pot(g, 26, -14, '#4e9a3a', fl[(v + 1) % 4]);
    // the yard: each home its own things
    if (K.yard === 'rice'){ for (const [x, s] of [[-66, 1], [-56, .8]]){ g.fillStyle = '#c69a4a'; g.beginPath(); g.moveTo(x - 6 * s, -10 * s); g.lineTo(x + 6 * s, -10 * s); g.lineTo(x + 4.5 * s, 0); g.lineTo(x - 4.5 * s, 0); g.closePath(); g.fill(); g.strokeStyle = '#8a6224'; g.lineWidth = .4; for (let k = 1; k < 4; k++){ g.beginPath(); g.moveTo(x - 6 * s + k * .3, -10 * s + k * 2.5 * s); g.lineTo(x + 6 * s - k * .3, -10 * s + k * 2.5 * s); g.stroke(); } g.fillStyle = '#f4ecd2'; ov(g, x, -10 * s, 5 * s, 1.6 * s); g.fill(); } }
    else if (K.yard === 'cage'){ g.strokeStyle = '#7a5a2a'; g.lineWidth = .5; g.beginPath(); g.moveTo(50, -84); g.lineTo(50, -74); g.stroke(); g.fillStyle = 'rgba(200,170,110,.5)'; ov(g, 50, -66, 6, 8); g.fill(); g.strokeStyle = '#b08a46'; for (let k = -4; k <= 4; k += 2){ g.beginPath(); g.moveTo(50 + k, -73); g.lineTo(50 + k * 1.2, -58); g.stroke(); } g.fillStyle = '#f2c63a'; ov(g, 50, -64, 2, 1.6); g.fill(); }
    else if (K.yard === 'bike'){ g.strokeStyle = '#2a3a4a'; g.lineWidth = .9; for (const x of [58, 72]){ g.beginPath(); g.arc(x, -6, 5.5, 0, 7); g.stroke(); } g.strokeStyle = '#c03a2a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(58, -6); g.lineTo(64, -13); g.lineTo(72, -6); g.moveTo(64, -13); g.lineTo(70, -13); g.lineTo(72, -6); g.moveTo(64, -13); g.lineTo(63, -16); g.stroke(); g.fillStyle = '#c69a4a'; g.fillRect(70, -16, 6, 3); }
    else if (K.yard === 'chilli'){ g.fillStyle = '#9a7238'; ov(g, -64, -4, 10, 3.6); g.fill(); for (let i = 0; i < 18; i++){ g.fillStyle = rng() < .7 ? '#d42a1a' : '#f05a2a'; ov(g, -64 + (rng() - .5) * 14, -5 + (rng() - .5) * 3, 1.6, .7, rng() * 3); g.fill(); } }
    else if (K.yard === 'jar'){ for (const [x, s] of [[-66, 1], [-54, .75]]){ g.fillStyle = v12Grad(g, x - 6 * s, 0, x + 6 * s, 0, '#6a3a1a', '#a8683a'); ov(g, x, -7 * s, 6.4 * s, 7 * s); g.fill(); g.fillStyle = '#4a2810'; ov(g, x, -13.6 * s, 3.6 * s, 1.2 * s); g.fill(); g.strokeStyle = V12.gold[1]; g.lineWidth = .5; g.beginPath(); g.moveTo(x - 5 * s, -9 * s); g.quadraticCurveTo(x, -6 * s, x + 5 * s, -9 * s); g.stroke(); } }
    else { for (let i = 0; i < 30; i++){ const a = rng() * 3.1, d = rng() * 18; g.fillStyle = i % 3 ? '#e2307a' : '#ff6aa8'; ov(g, -62 + Math.cos(a) * d * .5, -40 - Math.sin(a) * d * 1.8, 1.6, 1.4); g.fill(); } g.fillStyle = '#3f7a34'; for (let i = 0; i < 12; i++){ ov(g, -62 + (rng() - .5) * 8, -36 - rng() * 30, 1.6, 1); g.fill(); } }
  }});

/* ---------- the shophouse (ห้องแถว) ---------- */
const V12_ROW = [{t:'ร้านข้าวแกง', c:'#b8322a', goods:'food'}, {t:'ร้านผ้าไหม', c:'#6a3a9a', goods:'cloth'}, {t:'ร้านขนม', c:'#d0608a', goods:'sweets'}, {t:'ร้านน้ำชา', c:'#2f6a4a', goods:'tea'}, {t:'เครื่องจักสาน', c:'#9a6a2a', goods:'baskets'}, {t:'ร้านดอกไม้', c:'#c84a2a', goods:'flowers'}];
PROP_TYPES.arrow = (seed, v = 0) => makeProp({w:150, h:200, ax:75, ay:190, seed, shadow:[58, 11], collide:36, paint(g, rng){ const K = V12_ROW[v % 6], Wd = V12.woods[(v + 1) % 4], R = V12.roofs[(v + 2) % 6];
    v12Plinth(g, 128, 8, 40, rng);
    v12Wall(g, -58, -132, 58, -8, Wd);
    // the upper floor: a balcony rail, two windows and pots
    g.fillStyle = Wd[2]; g.fillRect(-62, -86, 124, 4); v12Window(g, -42, -122, 18, 22, R[0], true, ['#ff7aa8', '#ffd84a']); v12Window(g, 24, -122, 18, 22, R[0], true, ['#ffffff', '#ff6040']);
    g.strokeStyle = Wd[2]; g.lineWidth = .9; for (let x = -58; x <= 58; x += 6){ g.beginPath(); g.moveTo(x, -98); g.lineTo(x, -86); g.stroke(); } g.fillStyle = Wd[0]; g.fillRect(-60, -99, 120, 2);
    v12Pot(g, -50, -99, '#4e9a3a', '#ff7aa8'); v12Pot(g, 50, -99, '#4e9a3a', '#ffd84a');
    // the shop floor: open folding doors, a dark interior with shelves, the counter and goods out front
    g.fillStyle = '#3a2416'; g.fillRect(-48, -80, 96, 72); g.fillStyle = 'rgba(255,200,120,.22)'; g.fillRect(-48, -80, 96, 30);
    g.strokeStyle = '#6a4a2a'; g.lineWidth = 1; for (const y of [-70, -58, -46]){ g.beginPath(); g.moveTo(-44, y); g.lineTo(44, y); g.stroke(); }
    for (let i = 0; i < 22; i++){ g.fillStyle = ['#e8c06a', '#c84a3a', '#5a9a5a', '#e8e0c8', '#7a5ab8'][i % 5]; g.fillRect(-42 + (i % 11) * 8, -76 + Math.floor(i / 11) * 12, 5, 5); }
    for (const sx of [-1, 1]) for (let k = 0; k < 3; k++){ g.fillStyle = k % 2 ? Wd[1] : Wd[0]; g.fillRect(sx * (52 - k * 4) - (sx < 0 ? 0 : 4), -80, 4, 72); }   // folded doors
    // the awning and the sign
    g.fillStyle = K.c; g.beginPath(); g.moveTo(-64, -84); g.lineTo(64, -84); g.lineTo(70, -70); g.lineTo(-70, -70); g.closePath(); g.fill();
    for (let x = -70; x < 70; x += 10){ g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.moveTo(x, -70); g.lineTo(x + 5, -70); g.lineTo(x + 5 - 1, -84); g.lineTo(x + 1, -84); g.fill(); g.fillStyle = K.c; g.beginPath(); g.arc(x + 5, -70, 5, 0, Math.PI); g.fill(); }
    // the counter and the goods
    g.fillStyle = v12Grad(g, 0, -30, 0, -8, Wd[1], Wd[2]); g.fillRect(-46, -30, 92, 22); g.fillStyle = Wd[0]; g.fillRect(-48, -32, 96, 3);
    const top = -33;
    if (K.goods === 'food'){ for (let i = 0; i < 5; i++){ const x = -36 + i * 18; g.fillStyle = '#d8d0c0'; ov(g, x, top, 7, 2.6); g.fill(); g.fillStyle = ['#c86a2a', '#e8b84a', '#5a8a3a', '#a83a2a', '#e8dcc0'][i]; ov(g, x, top - 1, 5.6, 1.8); g.fill(); } g.fillStyle = '#d0d0d0'; g.fillRect(30, -46, 12, 13); g.fillStyle = 'rgba(255,255,255,.6)'; for (let k = 0; k < 3; k++){ ov(g, 34 + k * 2, -50 - k * 3, 1.5, 2.4); g.fill(); } }
    else if (K.goods === 'cloth'){ for (let i = 0; i < 6; i++){ const x = -40 + i * 16; g.fillStyle = ['#9a3ab8', '#e8b84a', '#c83a4a', '#3a8ab8', '#e86aa8', '#4aa86a'][i]; g.fillRect(x - 6, top - 9, 12, 9); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(x - 6, top - 9, 12, 2); g.strokeStyle = V12.gold[0]; g.lineWidth = .5; g.beginPath(); g.moveTo(x - 6, top - 4); g.lineTo(x + 6, top - 4); g.stroke(); } }
    else if (K.goods === 'sweets'){ for (let i = 0; i < 4; i++) v12Heap(g, -33 + i * 22, top, 8, [['#f6c8d8', '#ffffff', '#e86a98'], ['#7ac85a', '#f6e8a0'], ['#f6d36a', '#e8a03a'], ['#c8a8e8', '#ffffff']][i], rng, 8); }
    else if (K.goods === 'tea'){ for (let i = 0; i < 5; i++){ const x = -36 + i * 18; g.fillStyle = '#e8e0d0'; g.fillRect(x - 3, top - 8, 6, 8); g.fillStyle = ['#c86a2a', '#3a6a3a', '#a85a2a', '#e8c06a', '#6a3a2a'][i]; g.fillRect(x - 3, top - 5, 6, 3); } g.fillStyle = '#5a3a2a'; ov(g, 36, top - 6, 7, 5); g.fill(); g.strokeStyle = '#5a3a2a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(42, top - 7); g.quadraticCurveTo(48, top - 10, 47, top - 4); g.stroke(); }
    else if (K.goods === 'baskets'){ for (let i = 0; i < 5; i++){ const x = -38 + i * 19, s = .8 + (i % 2) * .3; g.fillStyle = '#c8a058'; g.beginPath(); g.moveTo(x - 7 * s, top - 11 * s); g.lineTo(x + 7 * s, top - 11 * s); g.lineTo(x + 5 * s, top); g.lineTo(x - 5 * s, top); g.closePath(); g.fill(); g.strokeStyle = '#8a6a2a'; g.lineWidth = .4; for (let k = 1; k < 4; k++){ g.beginPath(); g.moveTo(x - 7 * s, top - 11 * s + k * 2.7 * s); g.lineTo(x + 7 * s, top - 11 * s + k * 2.7 * s); g.stroke(); } } }
    else { for (let i = 0; i < 6; i++){ const x = -40 + i * 16; g.fillStyle = '#3a6a8a'; g.fillRect(x - 4, top - 7, 8, 7); for (let k = 0; k < 7; k++){ g.fillStyle = ['#ff6aa8', '#ffd84a', '#ffffff', '#ff5a3a', '#c86ae8'][(i + k) % 5]; ov(g, x + (rng() - .5) * 8, top - 9 - rng() * 6, 1.6, 1.6); g.fill(); } } }
    for (let i = 0; i < 4; i++){ const x = -40 + i * 26; g.fillStyle = '#b08a46'; g.fillRect(x - 6, -8, 12, 7); g.strokeStyle = '#7a5a24'; g.lineWidth = .5; g.strokeRect(x - 6, -8, 12, 7); }   // crates in front
    v12Roof(g, 120, -132, 50, R, rng); v12Sign(g, 0, -101, 76, 14, K.t, K.c); v12Lantern(g, -54, -66, '#e04030'); v12Lantern(g, 54, -66, '#e04030');
  }});

/* ---------- the market stall ---------- */
const V12_STALL = [{t:'ผลไม้', c:'#d8402a', goods:'fruit'}, {t:'ปลาสด', c:'#2a7ab8', goods:'fish'}, {t:'พวงมาลัย', c:'#d0608a', goods:'garland'}, {t:'เครื่องปั้น', c:'#b0602a', goods:'pots'}, {t:'ผ้าทอ', c:'#6a3a9a', goods:'cloth'}, {t:'ขนมไทย', c:'#2f8a5a', goods:'sweets'}];
PROP_TYPES.arstall = (seed, v = 0) => makeProp({w:104, h:108, ax:52, ay:100, seed, shadow:[40, 9], collide:22, paint(g, rng){ const K = V12_STALL[v % 6], Wd = V12.woods[v % 4];
    for (const x of [-42, 42]){ g.fillStyle = v12Grad(g, x - 2, 0, x + 2, 0, Wd[2], Wd[1]); g.fillRect(x - 2, -76, 4, 76); }
    // the counter
    g.fillStyle = v12Grad(g, 0, -34, 0, 0, Wd[1], Wd[2]); g.fillRect(-44, -34, 88, 30); g.fillStyle = Wd[0]; g.fillRect(-46, -36, 92, 3.4); g.strokeStyle = Wd[2]; g.lineWidth = .5; for (let x = -40; x < 44; x += 8){ g.beginPath(); g.moveTo(x, -32); g.lineTo(x, -5); g.stroke(); }
    const top = -37;
    if (K.goods === 'fruit'){ v12Heap(g, -28, top, 10, ['#f6c63a', '#e8a02a'], rng, 10); v12Heap(g, -2, top, 10, ['#d8322a', '#f05a3a'], rng, 10); v12Heap(g, 24, top, 10, ['#7ac84a', '#4a9a3a'], rng, 10);
      g.strokeStyle = '#7a5a24'; g.lineWidth = .5; for (let k = 0; k < 6; k++){ g.fillStyle = '#f2d34a'; ov(g, -34 + k * 2.5, -64 + k * .4, 1.6, 4.6, .3); g.fill(); } }   // a bunch of bananas hanging
    else if (K.goods === 'fish'){ g.fillStyle = '#d8eef6'; g.fillRect(-38, top - 4, 76, 5); for (let i = 0; i < 8; i++){ const x = -32 + i * 9; g.fillStyle = i % 2 ? '#8aa0b8' : '#b8c8d8'; ov(g, x, top - 4, 4, 1.6, .2); g.fill(); g.beginPath(); g.moveTo(x + 4, top - 4); g.lineTo(x + 6, top - 6); g.lineTo(x + 6, top - 2); g.fill(); g.fillStyle = '#2a2a2a'; ov(g, x - 2.4, top - 4.4, .4, .4); g.fill(); } }
    else if (K.goods === 'garland'){ for (let i = 0; i < 6; i++){ const x = -34 + i * 13; g.strokeStyle = '#f6f2e0'; g.lineWidth = 2; g.beginPath(); g.arc(x, top - 5, 4.4, 0, 7); g.stroke(); g.fillStyle = i % 2 ? '#e83a5a' : '#f6c63a'; ov(g, x, top - 1, 1.6, 1.6); g.fill(); }
      for (let k = 0; k < 4; k++){ g.strokeStyle = '#f6f2e0'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-30 + k * 20, -70); g.lineTo(-30 + k * 20, -56); g.stroke(); g.fillStyle = '#e83a5a'; ov(g, -30 + k * 20, -55, 1.6, 1.6); g.fill(); } }
    else if (K.goods === 'pots'){ for (let i = 0; i < 5; i++){ const x = -32 + i * 16, s = .7 + (i % 2) * .35; g.fillStyle = v12Grad(g, x - 6 * s, 0, x + 6 * s, 0, '#7a3a1a', '#c0703a'); ov(g, x, top - 6 * s, 6 * s, 6.4 * s); g.fill(); g.fillStyle = '#5a2810'; ov(g, x, top - 12 * s, 3 * s, 1 * s); g.fill(); g.strokeStyle = '#e8c06a'; g.lineWidth = .5; g.beginPath(); g.moveTo(x - 5 * s, top - 7 * s); g.lineTo(x + 5 * s, top - 7 * s); g.stroke(); } }
    else if (K.goods === 'cloth'){ for (let i = 0; i < 5; i++){ const x = -34 + i * 17; g.fillStyle = ['#9a3ab8', '#e8b84a', '#c83a4a', '#3a8ab8', '#e86aa8'][i]; g.fillRect(x - 7, top - 8, 14, 8); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(x - 7, top - 8, 14, 1.6); }
      for (let k = 0; k < 3; k++){ g.fillStyle = ['#c83a4a', '#3a8ab8', '#e8b84a'][k]; g.fillRect(-30 + k * 26, -72, 10, 26); g.fillStyle = 'rgba(255,255,255,.25)'; for (let y = -70; y < -46; y += 4) g.fillRect(-30 + k * 26, y, 10, 1); } }
    else { for (let i = 0; i < 4; i++) v12Heap(g, -30 + i * 20, top, 8, [['#7ac85a', '#ffffff'], ['#f6c8d8', '#e86a98'], ['#f6d36a', '#ffffff'], ['#c8a8e8', '#f6e8a0']][i], rng, 8); }
    // baskets under the counter
    for (const [x, c] of [[-28, '#c8a058'], [0, '#b08a46'], [28, '#c8a058']]){ g.fillStyle = c; ov(g, x, -4, 9, 4); g.fill(); g.strokeStyle = '#7a5a24'; g.lineWidth = .4; g.stroke(); }
    // the canopy: cloth over a bamboo frame, scalloped edge with tassels, a small sign
    g.fillStyle = K.c; g.beginPath(); g.moveTo(-52, -76); g.quadraticCurveTo(0, -100, 52, -76); g.lineTo(52, -70); g.lineTo(-52, -70); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.moveTo(-40, -79); g.quadraticCurveTo(0, -96, 40, -79); g.lineTo(40, -76); g.quadraticCurveTo(0, -92, -40, -76); g.fill();
    for (let x = -52; x < 52; x += 8){ g.fillStyle = K.c; g.beginPath(); g.arc(x + 4, -70, 4, 0, Math.PI); g.fill(); g.fillStyle = V12.gold[1]; g.fillRect(x + 3.6, -66.5, .8, 3); ov(g, x + 4, -63, .9, .9); g.fill(); }
    g.strokeStyle = V12.gold[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(-52, -70); g.lineTo(52, -70); g.stroke();
    v12Sign(g, 0, -92, 40, 10, K.t, '#fff2d0', '#5a2410');
    v12Lantern(g, -46, -64, '#e04030'); v12Lantern(g, 46, -64, '#e04030');
  }});
