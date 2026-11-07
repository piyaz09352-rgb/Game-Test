/* VAYRATHEN — js/world/towerimg263.js — (v263) the owner's pictures for the tower hall and Aren's central square
   · TOWER: every floor's hall is the owner's picture «สนามประลองเวทมนตร์» (assets/buildings/towerfloor.jpg): the stone
     floor with the gold compass, the glowing gate up the steps at the back (the way up), the stair down at the front,
     pillars, banners, blue crystals and braziers — all in the picture, so the painted hall and its props stand aside.
     The walkable floor (towermap223.js: TWM_RX × TWM_RY, an eight-sided platform) follows the picture's floor.
   · AREN: the round garden with the fountain «สวนแฟนตาซีวงแหวนทองคำ» (assets/buildings/plaza.jpg) lies over the middle
     of the town, softly blended into the ground at its edge; flower beds, hedges and lotus bowls inside it give way.
   A missing file leaves things as they were. */
'use strict';
const TIMG = {floor:null, plaza:null};
const timgLoad = (key, file) => { if (location.protocol === 'file:') return; const im = new Image();
  im.onload = () => { TIMG[key] = im; if (key === 'floor' && typeof twmOn === 'function' && twmOn()) try { repaintMap(); } catch (e) {} if (key === 'plaza') timgPlaza(); };
  im.src = `assets/buildings/${file}?v=${typeof GAMEV !== 'undefined' && GAMEV ? GAMEV : 263}`; };
timgLoad('floor', 'towerfloor.jpg'); timgLoad('plaza', 'plaza.jpg');

/* ---------- the tower hall ---------- */
// where the picture's floor sits in it: centre at 50% / 61.5%, the floor spans 80% of the width and 61% of the height
const TIMG_FLOOR = {cx:.5, cy:.615};
function timgHall(){
  const im = TIMG.floor, c = twmC(), g = terr.getContext('2d'); g.save(); g.setTransform(TS, 0, 0, TS, 0, 0);
  const FW = Math.max(W, terr.width / TS), FH = Math.max(H, terr.height / TS);
  const sky = g.createLinearGradient(0, 0, 0, FH); sky.addColorStop(0, '#1c2448'); sky.addColorStop(1, '#0a0e22'); g.fillStyle = sky; g.fillRect(0, 0, FW, FH);
  const h = H, w = h * im.naturalWidth / im.naturalHeight, x = c.x - w * TIMG_FLOOR.cx, y = c.y - h * TIMG_FLOOR.cy;   // (v264) as tall as the map: it fills it
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(im, x, y, w, h);
  g.restore();
}
if (typeof twzHall === 'function'){ const _h = twzHall; twzHall = function(){ if (TIMG.floor) return timgHall(); return _h.apply(this, arguments); }; }
if (typeof twzBuild === 'function'){ const _b = twzBuild; twzBuild = function(){
    if (!TIMG.floor) return _b.apply(this, arguments);
    timgHall(); const c = twmC(), st = twmStairs();
    // the edge: stones you cannot pass all round the floor, and the gate wall
    const edge = twzOct(c, TWM_RX + 26, TWM_RY + 18);
    for (let i = 0; i < 8; i++){ const p = edge[i], q = edge[(i + 1) % 8], n = Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 26);
      for (let k = 0; k < n; k++) obstacles.push({x:p[0] + (q[0] - p[0]) * k / n, y:p[1] + (q[1] - p[1]) * k / n, r:30, twEdge:true}); }
    for (let k = -3; k <= 3; k++) obstacles.push({x:st.x + k * 34, y:st.y - 60, r:24, twEdge:true}); }; }
// the picture is lit already: no zone dimming, and the painted gate's shimmer stands aside
if (typeof twlLight === 'function'){ const _l = twlLight; twlLight = function(){ if (TIMG.floor) return; return _l.apply(this, arguments); }; }
if (typeof twlGate === 'function'){ const _gt = twlGate; twlGate = function(){ if (TIMG.floor) return; return _gt.apply(this, arguments); }; }

/* ---------- Aren's central square ---------- */
const TIMG_TIDY = new Set(['flowerbed', 'hedge', 'lotusbowl', 'bush', 'flowers', 'fern', 'grass', 'tuft', 'flower']);
function timgPlaza(){
  if (!TIMG.plaza || typeof MAP_ID === 'undefined' || MAP_ID !== 0 || typeof ARC === 'undefined' || (typeof DG !== 'undefined' && DG.active)) return;
  const im = TIMG.plaza, cx = ARC.x, cy = ARC.y, w = (typeof SHOPR !== 'undefined' ? SHOPR.rx - 100 : ARC.r) / .44, h = w * im.naturalHeight / im.naturalWidth, rx = w * .44, ry = h * .46;   // (v264) inside the oval of shops
  // the picture, faded out at its edge so it melts into the town's ground
  const k = 1, cv2 = document.createElement('canvas'); cv2.width = Math.round(w * k); cv2.height = Math.round(h * k); const c2 = cv2.getContext('2d');
  c2.drawImage(im, 0, 0, cv2.width, cv2.height); c2.globalCompositeOperation = 'destination-in';
  c2.save(); c2.translate(cv2.width / 2, cv2.height / 2); c2.scale(1, ry / rx); const gr = c2.createRadialGradient(0, 0, rx * k * .82, 0, 0, rx * k); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  c2.fillStyle = gr; c2.beginPath(); c2.arc(0, 0, rx * k, 0, 7); c2.fill(); c2.restore();
  const g = terr.getContext('2d'); g.save(); g.setTransform(TS, 0, 0, TS, 0, 0); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(cv2, cx - w / 2, cy - h / 2, w, h); g.restore();
  // small decorations inside it give way (buildings, lamps, NPCs and the shrine stay)
  for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!TIMG_TIDY.has(p.type) || ((p.x - cx) / rx) ** 2 + ((p.y - cy) / ry) ** 2 > 1) continue;
    PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); }
  // (v264) the old trees, bushes and rocks inside the town's oval give way too: only the buildings, lamps, fence and NPCs stand in it
  const T = typeof TOWNR !== 'undefined' ? TOWNR : {rx:rx, ry:ry}, NATURE = new Set(['tree', 'palm', 'bush', 'bamboo', 'banana', 'rock', 'pine', 'himtree', 'reed', 'deadtree', 'stump', 'log', 'mushroom', 'flowerbed', 'hedge', 'lotusbowl', 'fern', 'flowers']);
  for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!NATURE.has(p.type) || ((p.x - cx) / (T.rx - 10)) ** 2 + ((p.y - cy) / (T.ry - 10)) ** 2 > 1) continue;
    PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); }
  if (typeof CUTE !== 'undefined' && CUTE && Array.isArray(CUTE.decor)) CUTE.decor = CUTE.decor.filter(d => !d || d.x == null || ((d.x - cx) / rx) ** 2 + ((d.y - cy) / ry) ** 2 > 1);
  if (typeof tcMini === 'function') try { tcMini(); } catch (e) {}
}
EV.on('map', () => setTimeout(timgPlaza, 0));
