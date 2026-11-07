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

/* ---------- (v264) no blink between floors ----------
   Every floor is the same hall picture now, so a new monster region (every few floors) no longer reloads the map
   (which faded the screen out and in): only the region the monsters come from changes. */
{ const _tt = twTheme; twTheme = function(f){
    if (!TIMG.floor || typeof twmOn !== 'function' || !twmOn() || !(TW.theme > 0)) return _tt.apply(this, arguments);
    const id = twThemeFor(f); TW.theme = id; const inf = typeof twInfo === 'function' ? twInfo() : null; if (inf) inf.base = id;
    mobs = mobs.filter(m => !m.dead && !m.tw); spawnSlots = []; boss = null; bossTimer = 1e9;
    const e = twmEntry(); P.x = e.x; P.y = e.y; }; }

/* ---------- (v264) the hall picture comes alive: real fire and coloured light ----------
   The owner: the fires in the tower should really burn, and the tower needs light and colour. Over the picture:
   · every brazier painted in it burns — live flame tongues over the painted flame (each on its own rhythm), sparks
     rising, and a warm pool of firelight on the floor breathing with the flame;
   · the blue crystals pulse and glitter; the gate shimmers with bands of blue light and rising motes;
   · the gold compass in the middle of the floor glows and slowly turns rays of light;
   · soft coloured lights (violet, azure, gold) drift across the floor, and golden dust floats in the air.
   Positions are fractions of the picture (found from its flame and crystal pixels). */
const TIMG_FIRE = [[.084, .488, 2.6], [.917, .488, 2.6], [.272, .851, 3.2], [.733, .851, 3.2], [.296, .239, 1.9], [.703, .239, 1.9], [.422, .182, 1.6], [.585, .179, 1.6],
  [.022, .341, 1.8], [.977, .335, 1.8], [.326, .163, 1.3], [.675, .169, 1.3]];
const TIMG_CRYS = [[.196, .79, 1.2], [.81, .78, 1.2], [.368, .18, .8], [.633, .18, .8], [.092, .36, 1], [.906, .36, 1]];
const TIMG_GATE = [.498, .2], TIMG_ROSE = [.5, .545];
const timgAt = ([fx, fy]) => { const c = twmC(), h = H, w = h * TIMG.floor.naturalWidth / TIMG.floor.naturalHeight; return [c.x + (fx - TIMG_FLOOR.cx) * w, c.y + (fy - TIMG_FLOOR.cy) * h]; };
const timgOn = () => !!TIMG.floor && typeof twmOn === 'function' && twmOn();
const TIMG_FX = {sparks:[], dust:[]};
const timgPh = (x, y) => { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return (s - Math.floor(s)) * 20; };
// flames sort with everything (the hero in front of a brazier stands in front of its fire)
{ const _e = LIVE.ents; LIVE.ents = function(list, g){ _e.apply(this, arguments); if (!timgOn()) return;
    for (const f of TIMG_FIRE){ const [x, y] = timgAt(f), ph = timgPh(f[0], f[1]); list.push({y:y + 2, f:() => twlFlame(g, x - cam.x, y - cam.y, ph, f[2])}); } }; }
// sparks and dust
EV.on('tick', dt => {
  if (!timgOn()){ TIMG_FX.sparks.length = 0; TIMG_FX.dust.length = 0; return; }
  for (const f of TIMG_FIRE){ if (Math.random() > dt * 5 * f[2] / 2) continue; const [x, y] = timgAt(f); TIMG_FX.sparks.push({x:x + (Math.random() - .5) * 8 * f[2], y:y - 14 * f[2], vx:(Math.random() - .5) * 18, vy:-30 - Math.random() * 45, life:1, c:Math.random() < .5 ? '255,210,100' : '255,130,40', r:f[2] * .55}); }
  for (const f of TIMG_CRYS) if (Math.random() < dt * 2.2){ const [x, y] = timgAt(f); TIMG_FX.sparks.push({x:x + (Math.random() - .5) * 40 * f[2], y:y - Math.random() * 70 * f[2], vx:0, vy:-12 - Math.random() * 10, life:1, c:'150,230,255', star:true, r:1.4}); }
  if (Math.random() < dt * 4){ const [gx, gy] = timgAt(TIMG_GATE); TIMG_FX.sparks.push({x:gx + (Math.random() - .5) * 90, y:gy + 20, vx:0, vy:-25 - Math.random() * 20, life:1.2, c:'140,200,255', r:1.6}); }
  while (TIMG_FX.dust.length < 70) TIMG_FX.dust.push({x:Math.random() * W, y:Math.random() * H, vx:(Math.random() - .5) * 6, vy:-3 - Math.random() * 5, ph:Math.random() * 6.28});
  for (const s of TIMG_FX.sparks){ s.x += s.vx * dt + Math.sin(T * 3 + s.y * .05) * dt * 10; s.y += s.vy * dt; s.life -= dt * (s.star ? .6 : .85); }
  for (const d of TIMG_FX.dust){ d.x += d.vx * dt; d.y += d.vy * dt; if (d.y < 0){ d.y = H; d.x = Math.random() * W; } }
  for (let i = TIMG_FX.sparks.length - 1; i >= 0; i--) if (TIMG_FX.sparks[i].life <= 0) TIMG_FX.sparks.splice(i, 1);
  if (TIMG_FX.sparks.length > 500) TIMG_FX.sparks.splice(0, TIMG_FX.sparks.length - 500);
});
// under everything that stands: firelight pools, the compass's glow and rays, drifting coloured lights
{ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g, ...a){ const r = _u.call(this, g, ...a); if (!timgOn()) return r;
    g.save(); g.globalCompositeOperation = 'lighter';
    const pool = (x, y, rx, ry, col, a0) => { const gr = g.createRadialGradient(x, y, 2, x, y, rx); gr.addColorStop(0, `rgba(${col},${a0})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); };
    for (const f of TIMG_FIRE){ const [x, y] = timgAt(f), ph = timgPh(f[0], f[1]), fl = .78 + Math.sin((T + ph) * 9.1) * .12 + Math.sin((T + ph) * 13.7) * .08; pool(x - cam.x, y - cam.y + 20, 150 * f[2] / 2.4 * fl, 80 * f[2] / 2.4 * fl, '255,150,60', .3 * fl); }
    for (const f of TIMG_CRYS){ const [x, y] = timgAt(f), pu = .7 + Math.sin(T * 2.1 + f[0] * 9) * .3; pool(x - cam.x, y - cam.y + 10, 130 * f[2], 66 * f[2], '90,200,255', .26 * pu); }
    // the compass: a breathing glow and slowly turning rays
    { const [x0, y0] = timgAt(TIMG_ROSE), x = x0 - cam.x, y = y0 - cam.y, pu = .65 + Math.sin(T * 1.6) * .35; pool(x, y, 340, 190, '255,200,90', .16 * pu); pool(x, y, 120, 66, '120,210,255', .35 * pu);
      g.save(); g.translate(x, y); g.scale(1, .56); for (let k = 0; k < 8; k++){ const a = T * .25 + k * Math.PI / 4, gr = g.createLinearGradient(0, 0, Math.cos(a) * 330, Math.sin(a) * 330); gr.addColorStop(0, `rgba(255,220,130,${.22 * pu})`); gr.addColorStop(1, 'rgba(255,220,130,0)');
        g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 330, a - .07, a + .07); g.closePath(); g.fill(); } g.restore(); }
    // three coloured lights drifting slowly over the floor
    { const c = twmC(); for (const [col, sp, ph] of [['170,110,255', .17, 0], ['80,170,255', .13, 2.1], ['255,190,90', .11, 4.2]]){ const x = c.x + Math.cos(T * sp + ph) * TWM_RX * .65 - cam.x, y = c.y + Math.sin(T * sp * 1.3 + ph) * TWM_RY * .6 - cam.y; pool(x, y, 320, 180, col, .14); } }
    g.restore(); return r; }; }
// over everything: the gate's shimmer, the crystals' pulse, sparks and dust
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a); if (!timgOn()) return r;
    g.save(); g.globalCompositeOperation = 'lighter';
    { const [x0, y0] = timgAt(TIMG_GATE), x = x0 - cam.x, y = y0 - cam.y, w = 110, h = 190, pu = .6 + Math.sin(T * 2) * .25;
      g.save(); g.beginPath(); g.rect(x - w / 2, y - h, w, h); g.clip();
      for (let k = 0; k < 5; k++){ const yy = y - ((T * 40 + k * 40) % h), gr = g.createLinearGradient(0, yy - 18, 0, yy + 18); gr.addColorStop(0, 'rgba(120,190,255,0)'); gr.addColorStop(.5, `rgba(150,210,255,${.35 * pu})`); gr.addColorStop(1, 'rgba(120,190,255,0)'); g.fillStyle = gr; g.fillRect(x - w / 2, yy - 18, w, 36); }
      g.restore(); const gg = g.createRadialGradient(x, y - h * .45, 4, x, y - h * .45, 160); gg.addColorStop(0, `rgba(110,180,255,${.4 * pu})`); gg.addColorStop(1, 'rgba(110,180,255,0)'); g.fillStyle = gg; g.fillRect(x - 160, y - h * .45 - 160, 320, 320); }
    for (const f of TIMG_CRYS){ const [x0, y0] = timgAt(f), pu = .5 + Math.sin(T * 2.1 + f[0] * 9) * .5, x = x0 - cam.x, y = y0 - cam.y - 45 * f[2]; const cg = g.createRadialGradient(x, y, 2, x, y, 60 * f[2]); cg.addColorStop(0, `rgba(150,230,255,${.45 * pu})`); cg.addColorStop(1, 'rgba(150,230,255,0)'); g.fillStyle = cg; g.beginPath(); g.arc(x, y, 60 * f[2], 0, 7); g.fill(); }
    for (const s of TIMG_FX.sparks){ const x = s.x - cam.x, y = s.y - cam.y; if (x < -20 || y < -20 || x > VW + 20 || y > VH + 20) continue; g.fillStyle = `rgba(${s.c},${Math.max(0, Math.min(1, s.life)) * .9})`;
      if (s.star){ g.fillRect(x - .7, y - 3, 1.4, 6); g.fillRect(x - 3, y - .7, 6, 1.4); } else { g.beginPath(); g.arc(x, y, s.r || 1.3, 0, 7); g.fill(); } }
    for (const d of TIMG_FX.dust){ const x = d.x - cam.x, y = d.y - cam.y; if (x < -5 || y < -5 || x > VW + 5 || y > VH + 5) continue; g.fillStyle = `rgba(255,235,170,${.25 + Math.sin(T * 2 + d.ph) * .2})`; g.beginPath(); g.arc(x, y, 1.1, 0, 7); g.fill(); }
    g.restore(); return r; }; }

/* ---------- (v264) real fire: particles, not a painted shape ----------
   Each brazier keeps a stream of glowing particles rising from its bowl: born white-yellow and large at the base,
   turning orange, then red as they climb, sway and shrink away — added light, so they glow over the hall. */
const TIMG_SPR = (() => { const mk = (r, g, b) => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(.35, `rgba(${r},${g},${b},.55)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return c; };
  return [mk(255, 214, 90), mk(255, 160, 40), mk(240, 96, 20), mk(190, 44, 14)]; })();   // no white: the scene's colour grade turned a white core lavender
const TIMG_FL = TIMG_FIRE.map(() => []);
EV.on('tick', dt => {
  if (!timgOn()){ for (const l of TIMG_FL) l.length = 0; return; }
  TIMG_FIRE.forEach((f, i) => { const l = TIMG_FL[i], s = f[2], [x, y] = timgAt(f), n = Math.round(dt * 70 * s) + (Math.random() < (dt * 70 * s) % 1 ? 1 : 0);
    for (let k = 0; k < n; k++){ const life = .55 + Math.random() * .45; l.push({x:x + (Math.random() - .5) * 9 * s, y:y - 4 * s, vx:(Math.random() - .5) * 8 * s, vy:-(22 + Math.random() * 26) * s, t:0, life, r:(4.2 + Math.random() * 2.6) * s, ph:Math.random() * 6.28}); }
    for (const p of l){ p.t += dt; p.x += (p.vx + Math.sin(T * 7 + p.ph) * 6 * s) * dt; p.vx *= .97; p.x += (x - p.x) * dt * 1.6; p.y += p.vy * dt; }   // drawn back toward the middle: a flame, not a fountain
    for (let k = l.length - 1; k >= 0; k--) if (l[k].t >= l[k].life) l.splice(k, 1);
    if (l.length > 160) l.splice(0, l.length - 160); });
});
function timgFlame(g, i, ox, oy){
  const l = TIMG_FL[i], s = TIMG_FIRE[i][2], f = TIMG_FIRE[i], ph = timgPh(f[0], f[1]), fl = .85 + Math.sin((T + ph) * 11) * .1;
  g.save(); g.globalCompositeOperation = 'screen';
  // the warm halo round the flame
  const hg = g.createRadialGradient(ox, oy - 12 * s, 2, ox, oy - 12 * s, 34 * s * fl); hg.addColorStop(0, 'rgba(255,170,70,.32)'); hg.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = hg; g.beginPath(); g.arc(ox, oy - 12 * s, 34 * s * fl, 0, 7); g.fill();
  for (const p of l){ const u = p.t / p.life, r = p.r * (1 - u * .75), spr = TIMG_SPR[u < .18 ? 0 : u < .45 ? 1 : u < .75 ? 2 : 3];
    g.globalAlpha = Math.min(1, (1 - u) * 1.15) * (u < .1 ? u * 10 : 1); g.drawImage(spr, p.x - cam.x - r, p.y - cam.y - r, r * 2, r * 2); }
  g.restore();
}
{ const _e = LIVE.ents; LIVE.ents = function(list, g){
    // the older flame shape gives way: take its entries back out, then add the particle fire
    const n0 = list.length; _e.apply(this, arguments); if (!timgOn()) return;
    const mine = TIMG_FIRE.map(f => timgAt(f)[1] + 2); for (let k = list.length - 1; k >= n0; k--) if (mine.includes(list[k].y)) list.splice(k, 1);
    TIMG_FIRE.forEach((f, i) => { const [x, y] = timgAt(f); list.push({y:y + 2.5, f:() => timgFlame(g, i, x - cam.x, y - cam.y)}); }); }; }

