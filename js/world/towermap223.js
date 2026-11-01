/* VAYRATHEN — js/world/towermap223.js — (v223) the Vayra Tower gets its own halls
   The owner: the tower must have its own maps made for it, not other maps dropped in. Until now every floor loaded a
   hunting region whole (its camp fire, shrine keeper, cook, log seats, trees, gates). Now a floor is a round stone
   hall high up in the tower, built for the climb:
   · a stone floor of rings and spokes, a carpet from the entrance (front) over the floor's seal (middle, the floor
     number carved in it) to the staircase (back), the back wall with arched niches and banners, the tower's outer
     wall falling away below the front rim, and the sky (or the dark) all round;
   · eight pillars with braziers round the rim, braziers by the stairs and the entrance; nothing else stands in it;
   · six halls, a new one every 10 floors (then round again): ศิลาอรุณ · หยกมรกต · ราตรีคราม · ผลึกหิมะ · เพลิงนิล ·
     สวรรค์ทอง. The monsters are still those of the level's region (unchanged), only the place is the tower's;
   · CLIMBING: when a floor is cleared the stairs at the back light up; walk onto them to go up (you arrive at the
     entrance of the next floor). They open by themselves after a few seconds if you stay away, and Auto walks there.
   Nothing else of the tower changes (levels, waves, timers, blessings, rewards, rankings, party climbs). */
'use strict';

const TWM_W = 1500, TWM_H = 1300, TWM_RX = 580, TWM_RY = 390;
const TWM_TIERS = [
  {th:'ศิลาอรุณ', en:'Dawn Sandstone', sky:['#f7c48a', '#8a64b0'], floor:['#dcc49c', '#ccb288', '#e8d4b0'], rim:'#8a6a44', wall:['#c9a878', '#7a5a38'], acc:'#e3b04b', carpet:'#a8322a', glow:'255,190,110'},
  {th:'หยกมรกต', en:'Emerald Jade', sky:['#a8e4d4', '#2a5a6a'], floor:['#a0cca8', '#8ab896', '#b6dcbc'], rim:'#3a6a54', wall:['#7aa88c', '#2e5a46'], acc:'#ecd56a', carpet:'#24684a', glow:'200,255,190'},
  {th:'ราตรีคราม', en:'Indigo Night', sky:['#2a2a6a', '#06061c'], floor:['#5e6c9c', '#4e5c8c', '#6e7cac'], rim:'#232a5c', wall:['#4a5888', '#1c2244'], acc:'#9ad0ff', carpet:'#3a2a7a', glow:'150,200,255', stars:true},
  {th:'ผลึกหิมะ', en:'Snow Crystal', sky:['#e6f4ff', '#86b4dc'], floor:['#e6f0f8', '#d0e2f0', '#f6fbff'], rim:'#7a9ab8', wall:['#bcd4e8', '#6e8eae'], acc:'#6ac8ff', carpet:'#3e70aa', glow:'190,235,255'},
  {th:'เพลิงนิล', en:'Obsidian Flame', sky:['#4a1408', '#100402'], floor:['#4c3c3c', '#3c2e2e', '#5c4848'], rim:'#180e0e', wall:['#4a3434', '#1a1010'], acc:'#ff7a2a', carpet:'#8a1a10', glow:'255,140,60', embers:true},
  {th:'สวรรค์ทอง', en:'Golden Heaven', sky:['#fff6d8', '#f2c8a0'], floor:['#faf2e2', '#eee2ca', '#fffbf2'], rim:'#c8a060', wall:['#f2e4c6', '#c49a58'], acc:'#ffcf3a', carpet:'#cc4466', glow:'255,230,150', clouds:true}
];
const TWM = {tier:-1, open:false, climbT:0};
const twmOn = () => typeof TW !== 'undefined' && TW.active && typeof DG !== 'undefined' && DG.did === 'tower';
const twmTierOf = f => Math.floor((Math.max(1, f) - 1) / 10) % TWM_TIERS.length;
const twmT = () => TWM_TIERS[twmTierOf(TW.f)];
const twmC = () => ({x:W / 2, y:H / 2 + 70});
const twmStairs = () => { const c = twmC(); return {x:c.x, y:c.y - TWM_RY + 70}; };
const twmEntry = () => { const c = twmC(); return {x:c.x, y:c.y + TWM_RY - 90}; };
const twmIn = (x, y, m = 0) => { const c = twmC(); return Math.hypot((x - c.x) / (TWM_RX - m), (y - c.y) / (TWM_RY - m * .66)) < 1; };

/* ---------- props: pillars and braziers in the hall's stone ---------- */
function twmFire(g, x, y, s, t){ g.fillStyle = 'rgba(255,170,60,.9)'; g.beginPath(); g.moveTo(x - 6 * s, y); g.quadraticCurveTo(x - 7 * s, y - 10 * s, x, y - 20 * s); g.quadraticCurveTo(x + 7 * s, y - 10 * s, x + 6 * s, y); g.closePath(); g.fill();
  g.fillStyle = '#fff2a8'; g.beginPath(); g.moveTo(x - 3 * s, y); g.quadraticCurveTo(x - 3 * s, y - 6 * s, x, y - 12 * s); g.quadraticCurveTo(x + 3 * s, y - 6 * s, x + 3 * s, y); g.closePath(); g.fill(); void t; }
PROP_TYPES.twpillar = (seed, v = 0) => { const T0 = TWM_TIERS[v % TWM_TIERS.length];
  return makeProp({w:56, h:150, ax:28, ay:142, seed, shadow:[22, 7], collide:18, glow:[0, -138, 70], paint(g){
    const lin = (y0, y1, a, b) => { const gr = g.createLinearGradient(-16, 0, 16, 0); gr.addColorStop(0, b); gr.addColorStop(.35, a); gr.addColorStop(1, b); return gr; };
    g.fillStyle = T0.wall[1]; g.fillRect(-21, -12, 42, 12); g.fillStyle = T0.wall[0]; g.fillRect(-19, -16, 38, 6);                 // base
    g.fillStyle = lin(0, 0, T0.wall[0], T0.wall[1]); g.fillRect(-14, -120, 28, 106);                                                 // shaft
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1.2; for (const x of [-7, 0, 7]){ g.beginPath(); g.moveTo(x, -118); g.lineTo(x, -18); g.stroke(); }   // flutes
    g.fillStyle = T0.acc; g.fillRect(-15, -70, 30, 5); g.fillRect(-15, -112, 30, 4);                                               // bands
    g.fillStyle = T0.wall[0]; g.fillRect(-20, -128, 40, 9); g.fillStyle = T0.wall[1]; g.fillRect(-22, -132, 44, 5);                 // capital
    g.fillStyle = '#3a2a1a'; g.beginPath(); g.moveTo(-15, -132); g.lineTo(15, -132); g.lineTo(10, -140); g.lineTo(-10, -140); g.closePath(); g.fill();   // brazier bowl
    g.fillStyle = T0.acc; g.fillRect(-15, -134, 30, 2.5); twmFire(g, 0, -139, 1.1, 0); }}); };
PROP_TYPES.twbrazier = (seed, v = 0) => { const T0 = TWM_TIERS[v % TWM_TIERS.length];
  return makeProp({w:40, h:62, ax:20, ay:56, seed, shadow:[13, 5], collide:11, glow:[0, -48, 52], paint(g){
    g.fillStyle = T0.wall[1]; g.fillRect(-8, -30, 16, 30); g.fillStyle = T0.wall[0]; g.fillRect(-6, -30, 5, 30); g.fillStyle = T0.acc; g.fillRect(-9, -18, 18, 3);
    g.fillStyle = '#3a2a1a'; g.beginPath(); g.moveTo(-14, -32); g.lineTo(14, -32); g.lineTo(9, -42); g.lineTo(-9, -42); g.closePath(); g.fill(); g.fillStyle = T0.acc; g.fillRect(-14, -34, 28, 2.5);
    twmFire(g, 0, -41, 1, 0); }}); };

/* ---------- painting the hall ---------- */
function twmPaint(){
  const T0 = twmT(), c = twmC(); let sd = 4242 + TWM.tier * 97; const r = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  const g = terr.getContext('2d'); g.save(); g.setTransform(TS, 0, 0, TS, 0, 0);
  // sky (or the dark) all round
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, T0.sky[0]); sky.addColorStop(1, T0.sky[1]); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  if (T0.stars) for (let i = 0; i < 260; i++){ g.fillStyle = `rgba(255,255,255,${.3 + r() * .6})`; g.fillRect(r() * W, r() * H, 1.6, 1.6); }
  if (T0.embers) for (let i = 0; i < 160; i++){ g.fillStyle = `rgba(255,${100 + r() * 100 | 0},40,${.3 + r() * .5})`; g.beginPath(); g.arc(r() * W, r() * H, 1 + r() * 2, 0, 7); g.fill(); }
  const cloud = (x, y, s, a) => { g.fillStyle = `rgba(255,255,255,${a})`; for (let k = 0; k < 6; k++){ g.beginPath(); g.ellipse(x + (k - 2.5) * 34 * s, y + Math.sin(k * 1.7) * 8 * s, 46 * s, 22 * s, 0, 0, 7); g.fill(); } };
  for (let i = 0; i < (T0.clouds ? 14 : 8); i++) cloud(r() * W, r() * H, .6 + r() * .9, T0.stars || T0.embers ? .05 : .35);
  // the tower's outer wall falling away under the front rim (gives the hall its height)
  g.save(); g.beginPath(); g.ellipse(c.x, c.y + 150, TWM_RX * .97, TWM_RY, 0, 0, Math.PI); g.lineTo(c.x - TWM_RX, c.y); g.ellipse(c.x, c.y, TWM_RX, TWM_RY, 0, Math.PI, 0, true); g.closePath();
  g.fillStyle = T0.wall[0]; g.fill(); g.clip();
  for (let row = 0; row < 7; row++){ const y0 = row * 24, off = row % 2 ? .055 : 0;   // courses of stone blocks round the tower
    for (let a = off; a < Math.PI + .1; a += .11){ const x0 = c.x + Math.cos(a) * TWM_RX, x1 = c.x + Math.cos(a + .11) * TWM_RX, yb = c.y + Math.sin(a + .055) * TWM_RY + y0;
      g.fillStyle = r() < .5 ? T0.wall[0] : T0.wall[1]; g.globalAlpha = .55; g.fillRect(Math.min(x0, x1) + 1, yb + 1, Math.abs(x1 - x0) - 2, 22); g.globalAlpha = 1; } }
  const sh = g.createLinearGradient(0, c.y + TWM_RY - 40, 0, c.y + TWM_RY + 150); sh.addColorStop(0, 'rgba(0,0,0,.05)'); sh.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = sh; g.fillRect(c.x - TWM_RX, c.y, TWM_RX * 2, TWM_RY + 160);
  g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1.6; for (let y = c.y; y < c.y + TWM_RY + 160; y += 24){ g.beginPath(); g.ellipse(c.x, y, TWM_RX, TWM_RY, 0, 0, Math.PI); g.stroke(); }
  g.restore();
  // the back wall rising behind the floor, with arched niches and banners
  g.save(); g.beginPath(); g.ellipse(c.x, c.y, TWM_RX, TWM_RY, 0, Math.PI, 0); g.lineTo(c.x + TWM_RX, c.y - 40); g.ellipse(c.x, c.y - 230, TWM_RX * .96, TWM_RY, 0, 0, Math.PI, true); g.closePath();
  const bw = g.createLinearGradient(0, c.y - TWM_RY - 230, 0, c.y - TWM_RY + 40); bw.addColorStop(0, T0.wall[1]); bw.addColorStop(1, T0.wall[0]); g.fillStyle = bw; g.fill(); g.clip();
  g.strokeStyle = 'rgba(0,0,0,.16)'; g.lineWidth = 1.6; for (let k = 0; k < 9; k++){ g.beginPath(); g.ellipse(c.x, c.y - 26 * k, TWM_RX, TWM_RY, 0, Math.PI, 0); g.stroke(); }
  for (let i = 1; i < 12; i++){ if (i === 6) continue; const a = Math.PI + i / 12 * Math.PI, x = c.x + Math.cos(a) * TWM_RX * .985, y = c.y + Math.sin(a) * TWM_RY - 70;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.moveTo(x - 22, y + 50); g.lineTo(x - 22, y - 10); g.arc(x, y - 10, 22, Math.PI, 0); g.lineTo(x + 22, y + 50); g.closePath(); g.fill();
    if (i % 2){ g.fillStyle = T0.carpet; g.fillRect(x - 13, y - 26, 26, 64); g.fillStyle = T0.acc; g.fillRect(x - 13, y - 26, 26, 4); g.beginPath(); g.moveTo(x - 13, y + 38); g.lineTo(x, y + 48); g.lineTo(x + 13, y + 38); g.closePath(); g.fill(); }
    else { g.fillStyle = `rgba(${T0.glow},.55)`; g.beginPath(); g.arc(x, y + 8, 7, 0, 7); g.fill(); } }
  g.restore();
  // the floor: rings and spokes of stone, each slab its own shade
  g.save(); g.beginPath(); g.ellipse(c.x, c.y, TWM_RX, TWM_RY, 0, 0, 7); g.clip(); g.fillStyle = T0.floor[0]; g.fillRect(c.x - TWM_RX, c.y - TWM_RY, TWM_RX * 2, TWM_RY * 2);
  const rings = [0]; for (let k = 1; k <= 15; k++) rings.push(Math.min(1.02, .12 + k * .062));
  for (let i = 0; i < rings.length - 1; i++){ const n = 10 + i * 7;
    for (let j = 0; j < n; j++){ const a0 = j / n * 6.283 + i * .37, a1 = (j + 1) / n * 6.283 + i * .37, r0 = rings[i], r1 = rings[i + 1];
      g.fillStyle = T0.floor[(r() * 3) | 0]; g.beginPath(); g.ellipse(c.x, c.y, TWM_RX * r1, TWM_RY * r1, 0, a0, a1); g.ellipse(c.x, c.y, TWM_RX * r0, TWM_RY * r0, 0, a1, a0, true); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(c.x, c.y, TWM_RX * r0 + 1.5, TWM_RY * r0 + 1, 0, a0 + .01, a1 - .01); g.stroke();   // lit upper edge
      g.strokeStyle = 'rgba(40,24,10,.3)'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(c.x, c.y, TWM_RX * r1, TWM_RY * r1, 0, a0, a1); g.ellipse(c.x, c.y, TWM_RX * r0, TWM_RY * r0, 0, a1, a0, true); g.closePath(); g.stroke();
      if (r() < .18){ const am = (a0 + a1) / 2, rm = (r0 + r1) / 2, x = c.x + Math.cos(am) * TWM_RX * rm, y = c.y + Math.sin(am) * TWM_RY * rm; g.strokeStyle = 'rgba(40,24,10,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 6, y - 2); g.lineTo(x, y + 1); g.lineTo(x + 5, y - 3); g.stroke(); } } }
  // the carpet: entrance → seal → stairs
  const st = twmStairs(), en = twmEntry(); g.fillStyle = T0.carpet; g.fillRect(c.x - 38, st.y, 76, en.y - st.y + 60); g.fillStyle = T0.acc; g.fillRect(c.x - 38, st.y, 5, en.y - st.y + 60); g.fillRect(c.x + 33, st.y, 5, en.y - st.y + 60);
  for (let y = st.y + 30; y < en.y + 50; y += 46){ g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(c.x, y - 9); g.lineTo(c.x + 12, y); g.lineTo(c.x, y + 9); g.lineTo(c.x - 12, y); g.closePath(); g.fill(); }
  // the seal in the middle (the floor number is carved into it as you climb, see twmUnder)
  for (const [k, col, w0] of [[1, T0.rim, 10], [.86, T0.acc, 4], [.62, T0.rim, 3]]){ g.strokeStyle = col; g.lineWidth = w0; g.beginPath(); g.ellipse(c.x, c.y, 150 * k, 100 * k, 0, 0, 7); g.stroke(); }
  g.fillStyle = T0.floor[2]; g.beginPath(); g.ellipse(c.x, c.y, 140, 93, 0, 0, 7); g.fill(); g.strokeStyle = T0.rim; g.lineWidth = 3; g.stroke();
  g.strokeStyle = T0.acc; g.lineWidth = 2.5; for (let i = 0; i < 8; i++){ const a = i / 8 * 6.283, b = a + Math.PI * .75; g.beginPath(); g.moveTo(c.x + Math.cos(a) * 128, c.y + Math.sin(a) * 85); g.lineTo(c.x + Math.cos(b) * 128, c.y + Math.sin(b) * 85); g.stroke(); }
  for (let i = 0; i < 24; i++){ const a = i / 24 * 6.283; g.fillStyle = T0.rim; g.fillRect(c.x + Math.cos(a) * 138 - 2, c.y + Math.sin(a) * 92 - 2, 4, 4); }
  g.restore();
  // the rim: a raised lip of darker stone round the floor
  g.strokeStyle = T0.rim; g.lineWidth = 16; g.beginPath(); g.ellipse(c.x, c.y, TWM_RX - 6, TWM_RY - 4, 0, 0, 7); g.stroke();
  g.strokeStyle = T0.acc; g.lineWidth = 3; g.beginPath(); g.ellipse(c.x, c.y, TWM_RX - 16, TWM_RY - 11, 0, 0, 7); g.stroke();
  // the staircase at the back: steps up into an archway
  g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.moveTo(st.x - 62, st.y - 10); g.lineTo(st.x - 62, st.y - 120); g.arc(st.x, st.y - 120, 62, Math.PI, 0); g.lineTo(st.x + 62, st.y - 10); g.closePath(); g.fill();
  g.strokeStyle = T0.acc; g.lineWidth = 6; g.beginPath(); g.moveTo(st.x - 66, st.y - 10); g.lineTo(st.x - 66, st.y - 120); g.arc(st.x, st.y - 120, 66, Math.PI, 0); g.lineTo(st.x + 66, st.y - 10); g.stroke();
  for (let k = 0; k < 6; k++){ const y = st.y - 8 - k * 17, w = 58 - k * 4; g.fillStyle = k % 2 ? T0.wall[0] : T0.floor[2]; g.fillRect(st.x - w, y - 15, w * 2, 15); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(st.x - w, y - 2, w * 2, 2); }
  // the entrance at the front: a threshold slab
  g.fillStyle = T0.rim; g.fillRect(en.x - 70, en.y + 42, 140, 16); g.fillStyle = T0.acc; g.fillRect(en.x - 70, en.y + 42, 140, 3);
  g.restore();
}
function twmBuild(){
  const T0i = TWM.tier, c = twmC(), st = twmStairs(), en = twmEntry();
  twmPaint();
  // pillars round the rim (none in front of the entrance or the stairs), braziers by the stairs and the entrance
  for (let i = 0; i < 10; i++){ const a = (i + .5) / 10 * 6.283; if (Math.abs(Math.sin(a)) > .93) continue; addProp('twpillar', Math.round(c.x + Math.cos(a) * TWM_RX * .84), Math.round(c.y + Math.sin(a) * TWM_RY * .84), T0i); }
  for (const d of [-1, 1]){ addProp('twbrazier', st.x + d * 96, st.y + 6, T0i); addProp('twbrazier', en.x + d * 120, en.y + 24, T0i); }
  // the edge of the hall: a ring of invisible stones you cannot pass (walkable, paths and spawns all respect it)
  const n = 120; for (let i = 0; i < n; i++){ const a = i / n * 6.283; obstacles.push({x:c.x + Math.cos(a) * (TWM_RX + 10), y:c.y + Math.sin(a) * (TWM_RY + 8), r:40, twEdge:true}); }
  // the wall behind the stairs is solid too
  for (let k = -3; k <= 3; k++) obstacles.push({x:st.x + k * 34, y:st.y - 70, r:24, twEdge:true});
}

/* ---------- hooks: on a tower floor the land is the hall ---------- */
{ const _rp = repaintMap; repaintMap = function(){
    if (!twmOn()) return _rp.apply(this, arguments);
    TWM.tier = twmTierOf(TW.f); W = TWM_W; H = TWM_H; Object.assign(MAPZ, {x1:W - 180, y1:H - 90}); NAV.cols = Math.ceil(W / NAV.c); NAV.rows = Math.ceil(H / NAV.c); NAV.grid = null;
    return _rp.apply(this, arguments); }; }
{ const _pm = paintMap; paintMap = function(id){ if (!twmOn()) return _pm.apply(this, arguments); twmBuild(); }; }
{ const _sg = setupGates; setupGates = function(id){ if (!twmOn()) return _sg.apply(this, arguments); GATES = []; }; }
{ const _cp = campPlace; campPlace = function(){ if (!twmOn()) return _cp.apply(this, arguments); CAMP = null; }; }
{ const _sn = setupNpcs; setupNpcs = function(id){ const r = _sn.apply(this, arguments); if (twmOn()) NPCS.length = 0; return r; }; }
{ const _cb = cuteBuild; cuteBuild = function(){ const r = _cb.apply(this, arguments); if (twmOn() && CUTE) CUTE.decor = []; return r; }; }
{ const _w = walkable; walkable = function(x, y, r = 12){ if (twmOn() && !twmIn(x, y, r)) return false; return _w.apply(this, arguments); }; }
{ const _dw = drawWeather; drawWeather = function(g){ if (twmOn()) return; return _dw.apply(this, arguments); }; }   // indoors: no rain or snow
// a new hall every 10 floors, even when the monsters' region stays the same
{ const _tt = twTheme; twTheme = function(f){ if (twmTierOf(f) !== TWM.tier) TW.theme = -1; const r = _tt.apply(this, arguments); const e = twmEntry(); P.x = e.x; P.y = e.y; return r; }; }
// the wave rises round the seal, you arrive at the entrance
{ const _sp = twSpawn; twSpawn = function(){ const c = twmC(), px = P.x, py = P.y; P.x = c.x; P.y = c.y; try { return _sp.apply(this, arguments); } finally { P.x = px; P.y = py; } }; }
// a cleared floor: the stairs light up and wait for you (they open by themselves after a while)
{ const _tc = twClear; twClear = function(){ const r = _tc.apply(this, arguments); TWM.open = true; TW.restT = Math.max(TW.restT, 9); TWM.climbT = 0; return r; }; }
function twmClimb(){ TWM.open = false; TW.restT = 0; const e = twmEntry(); P.x = e.x; P.y = e.y; P.tx = null; P.target = null; P.nav = null;
  const f = document.getElementById('mapFade'); if (f){ f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); } SFX.play('warp'); }
EV.on('tick', dt => {
  if (!twmOn()) { TWM.open = false; return; }
  if (NPCS.length) NPCS.length = 0;   // a story NPC never turns up in the tower
  if (TW.phase !== 'rest' || !TWM.open){ return; }
  if (typeof DG3 !== 'undefined' && DG3.boonOpen) return;
  const s = twmStairs();
  if (Math.hypot(P.x - s.x, P.y - s.y) < 56){ twmClimb(); return; }
  if (TW.restT <= .05){ TWM.open = false; const e = twmEntry(); P.x = e.x; P.y = e.y; return; }   // the stairs carried you up anyway
  if (typeof BOT !== 'undefined' && BOT.on && !(BOT.pause > 0) && !P.dead){ P.tx = s.x; P.ty = s.y + 20; if (!P.ride){ P.ride = true; if (typeof renderHotbar === 'function') renderHotbar(); } }   // Auto takes the stairs
});
// the floor number carved in the seal, and the open stairs glowing
{ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g, ...a){ const r = _u.call(this, g, ...a); if (!twmOn()) return r;
    const T0 = twmT(), c = twmC(), x = c.x - cam.x, y = c.y - cam.y;
    g.save(); g.font = `900 64px Georgia,"Times New Roman",serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(0,0,0,.22)'; g.fillText(String(TW.f), x + 2, y + 4); g.fillStyle = T0.rim; g.globalAlpha = .85; g.fillText(String(TW.f), x, y + 2); g.restore();
    if (TWM.open && TW.phase === 'rest'){ const s = twmStairs(), sx = s.x - cam.x, sy = s.y - cam.y, p = .6 + Math.sin(T * 4) * .25;
      g.save(); const gr = g.createRadialGradient(sx, sy - 60, 4, sx, sy - 60, 120); gr.addColorStop(0, `rgba(${T0.glow},${.75 * p})`); gr.addColorStop(1, `rgba(${T0.glow},0)`); g.fillStyle = gr; g.fillRect(sx - 130, sy - 190, 260, 260);
      g.globalAlpha = p; g.fillStyle = '#fff6c8'; g.beginPath(); g.ellipse(sx, sy, 48, 16, 0, 0, 7); g.fill(); g.restore(); }
    return r; }; }
EV.on('draw', () => { if (!twmOn() || !TWM.open || TW.phase !== 'rest' || P.dead) return; const s = twmStairs(), z = typeof TAG_Z === 'function' ? TAG_Z() : 1, x = clamp(sx(s.x), 120 * z, SW - 120 * z), y = clamp(sy(s.y - 170), 90 * z, SH - 220 * z) + Math.sin(T * 4) * 4 * z;
  const t = L(`▲ ขึ้นชั้น ${TW.f} · ${Math.ceil(TW.restT)}`, `▲ Up to floor ${TW.f} · ${Math.ceil(TW.restT)}`); ctx.save(); ctx.font = `800 ${Math.round(13 * z)}px Sarabun,"Noto Sans Thai",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(t).width + 20 * z, h = 24 * z; ctx.fillStyle = 'rgba(40,24,8,.85)'; ctx.strokeStyle = 'rgba(255,214,110,.95)'; ctx.lineWidth = 1.6 * z;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2) : ctx.rect(x - w / 2, y - h / 2, w, h); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffe9a8'; ctx.fillText(t, x, y + .5); ctx.restore(); });
// the map label names the hall
{ const _l = dgLabel; dgLabel = function(){ const r = _l.apply(this, arguments); if (!twmOn()) return r; const e = document.getElementById('mapName'), T0 = twmT(); if (e) e.textContent = `🗼 ${L('หอคอยวายรา', 'Vayra Tower')} · ${L('ชั้น', 'floor')} ${TW.f} · ${L(T0.th, T0.en)}`; return r; }; }
