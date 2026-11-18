/* VAYRATHEN — js/world/landmarks320.js — (v320) one landmark on every hunting map
   After the groves (js/world/groves319.js) the hunting maps of one land still looked alike. Each now has one thing to
   remember it by, in the way of its land:
     · green, heavenly and volcanic lands: a cliff with a waterfall (js/world/falls.js) — gold water in heaven, lava in the
       volcanic lands. Fifteen kinds of land had one already; the fields, the primeval wood, the amber fen, the marsh, the
       ash forest, the dragon valleys, the demon throne and Naraka get theirs now;
     · ruins and graveyards: a fallen laterite prang (a Khmer-style tower), its top broken off, vines down its face, blocks
       lying round its foot and a fig growing out of the stones;
     · deserts and canyons: a natural arch of banded sandstone;
     · frozen lands: a cluster of ice crystals; caves: the same in amethyst;
     · coasts: an old junk wrecked on the sand, its mast broken, its ribs showing at the stern.
   (v321) the owner kept only the prang: the arch, the crystals and the wreck are drawn below but no longer placed.
   The landmark stands in a wide glade away from the camp, the trail, the gates and the water; nothing else grows on it. */
'use strict';
Object.assign(WATERFALL_BIOMES, {fields:'water', primeval:'water', amberfen:'water', marsh:'water', floatmarket:'water', ashforest:'lava', dragonvale:'lava', dragonroost:'lava', demonthrone:'lava', naraka:'lava'});
const LM320 = {prang:['cemetery', 'ayodhya', 'badan']};   /* (v321) the owner kept only the prang: the arch, the crystals and the wreck are no longer placed */
const lmGrad = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); return gr; };

/* a fallen laterite prang */
PROP_TYPES.lmprang = (seed, v = 0) => makeProp({w:210, h:270, ax:105, ay:258, seed, shadow:[86, 18], collide:58, paint(g, rng){
  const L = ['#c27a52', '#9a5638', '#6e3a24', '#4a2616'], moss = ['#6f9a44', '#4f7a34', '#3a5e2a'];
  const blocks = (x0, y0, x1, y1, rows, light) => {   // a wall of laterite blocks, pitted, lit from the left
    g.fillStyle = lmGrad(g, x0, 0, x1, 0, [light ? L[0] : L[1], L[1], L[2]]); g.fillRect(x0, y0, x1 - x0, y1 - y0);
    const rh = (y1 - y0) / rows; g.strokeStyle = 'rgba(40,18,8,.45)'; g.lineWidth = .7;
    for (let r = 0; r <= rows; r++){ g.beginPath(); g.moveTo(x0, y0 + r * rh); g.lineTo(x1, y0 + r * rh); g.stroke(); }
    for (let r = 0; r < rows; r++) for (let x = x0 + (r % 2 ? 7 : 0); x < x1; x += 14){ g.beginPath(); g.moveTo(x, y0 + r * rh); g.lineTo(x, y0 + (r + 1) * rh); g.stroke(); }
    for (let i = 0; i < (x1 - x0) * (y1 - y0) / 60; i++){ g.fillStyle = rng() < .6 ? 'rgba(50,20,10,.35)' : 'rgba(255,200,160,.18)'; ov(g, x0 + rng() * (x1 - x0), y0 + rng() * (y1 - y0), .6 + rng(), .5 + rng() * .6); g.fill(); } };
  // the stepped base, three tiers
  blocks(-92, -40, 92, 0, 3, true); blocks(-74, -74, 74, -40, 3, true); blocks(-56, -104, 56, -74, 3, true);
  for (const [y, w] of [[-40, 92], [-74, 74], [-104, 56]]){ g.fillStyle = 'rgba(255,220,180,.22)'; g.fillRect(-w, y - 1, w * 2, 2); g.fillStyle = 'rgba(30,12,6,.35)'; g.fillRect(-w, y + 1, w * 2, 2); }
  // the tower: a corn-cob prang in receding courses, its crown broken off
  const top = -232, bodyY = -104; g.save();
  g.beginPath(); g.moveTo(-40, bodyY); g.lineTo(-40, -160); g.quadraticCurveTo(-38, -205, -18, top + 18); g.lineTo(-10, top + 4); g.lineTo(-3, top + 14); g.lineTo(5, top - 2); g.lineTo(13, top + 12); g.lineTo(20, top + 22);
  g.quadraticCurveTo(38, -200, 40, -160); g.lineTo(40, bodyY); g.closePath(); g.clip();
  blocks(-42, top - 4, 42, bodyY, 16, true);
  for (let k = 0; k < 7; k++){ const y = -160 - k * 10, hw = 40 - k * 3; g.fillStyle = 'rgba(30,12,6,.4)'; g.fillRect(-hw, y, hw * 2, 2.2); g.fillStyle = 'rgba(255,220,180,.2)'; g.fillRect(-hw, y - 1.4, hw * 2, 1.2); }   // the receding courses
  g.fillStyle = 'rgba(20,8,4,.28)'; g.fillRect(14, top - 4, 30, bodyY - top + 4);   // shade on the right
  g.restore();
  // the doorway with its carved lintel and a dark inside
  g.fillStyle = '#2a140a'; g.beginPath(); g.moveTo(-15, bodyY); g.lineTo(-15, -142); g.quadraticCurveTo(0, -158, 15, -142); g.lineTo(15, bodyY); g.closePath(); g.fill();
  g.fillStyle = L[0]; g.fillRect(-22, -148, 44, 6); g.strokeStyle = L[3]; g.lineWidth = .6; for (let x = -20; x < 22; x += 5){ g.beginPath(); g.arc(x, -145, 2, 0, Math.PI); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(-15, bodyY - 4, 30, 4);
  // vines hanging down the face, moss in the joints
  for (let i = 0; i < 9; i++){ const x = -38 + rng() * 76, y0 = top + 20 + rng() * 40, len = 30 + rng() * 70; g.strokeStyle = moss[i % 3]; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(x, y0); for (let k = 1; k <= 6; k++) g.lineTo(x + Math.sin(k * 1.3 + i) * 3, y0 + len * k / 6); g.stroke();
    for (let k = 0; k < 6; k++){ g.fillStyle = moss[(i + k) % 3]; ov(g, x + Math.sin(k + i) * 4, y0 + len * k / 6 + 3, 2.4, 1.6, k); g.fill(); } }
  for (let i = 0; i < 40; i++){ g.fillStyle = moss[i % 3]; ov(g, -90 + rng() * 180, -rng() * 104, 2 + rng() * 3, 1 + rng() * 1.5); g.fill(); }
  // a fig growing from the broken crown
  g.strokeStyle = '#5a3a22'; g.lineWidth = 3; g.beginPath(); g.moveTo(2, top + 12); g.quadraticCurveTo(-6, top - 6, -2, top - 18); g.stroke(); g.lineWidth = 1.6; g.beginPath(); g.moveTo(4, top + 10); g.quadraticCurveTo(18, top - 2, 16, top - 12); g.stroke();
  for (let i = 0; i < 26; i++){ const a = rng() * 6.283, d = rng() * 20; g.fillStyle = i % 3 ? '#4f8a3a' : '#7ab84e'; ov(g, 4 + Math.cos(a) * d * 1.3, top - 22 + Math.sin(a) * d * .8, 5, 3.4, a); g.fill(); }
  g.strokeStyle = '#6a4a2a'; g.lineWidth = 1.2; for (const s of [-1, 1]){ g.beginPath(); g.moveTo(s * 6, top + 14); g.quadraticCurveTo(s * 22, top + 40, s * 30, top + 80); g.stroke(); }   // its roots down the stones
  // fallen blocks round the foot
  for (let i = 0; i < 11; i++){ const x = (rng() < .5 ? -1 : 1) * (70 + rng() * 32), y = -2 - rng() * 10, w = 9 + rng() * 9, h = 6 + rng() * 5, a = (rng() - .5) * .8;
    g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = L[rng() < .5 ? 0 : 1]; g.fillRect(-w / 2, -h, w, h); g.fillStyle = 'rgba(30,12,6,.4)'; g.fillRect(-w / 2, -1.5, w, 1.5); g.fillRect(w / 2 - 2, -h, 2, h); g.restore(); }
}});
/* a natural arch of banded sandstone */
PROP_TYPES.lmarch = (seed, v = 0) => makeProp({w:290, h:230, ax:145, ay:218, seed, shadow:[120, 18], collide:0, paint(g, rng){
  const C = ['#f2c890', '#d89a5a', '#b06a38', '#7a4422'];
  const shape = new Path2D(); shape.moveTo(-132, 0); shape.lineTo(-126, -120); shape.quadraticCurveTo(-118, -196, -40, -204); shape.quadraticCurveTo(40, -212, 112, -186); shape.quadraticCurveTo(140, -150, 132, -80); shape.lineTo(128, 0);
  shape.lineTo(84, 0); shape.lineTo(80, -70); shape.quadraticCurveTo(64, -128, 0, -132); shape.quadraticCurveTo(-62, -128, -78, -66); shape.lineTo(-82, 0); shape.closePath();
  g.fillStyle = lmGrad(g, 0, -210, 0, 0, [C[0], C[1], C[2]]); g.fill(shape);
  g.save(); g.clip(shape);
  for (let k = 0; k < 15; k++){ const y = -206 + k * 14 + Math.sin(k * 1.7) * 3; g.fillStyle = k % 2 ? 'rgba(160,80,30,.28)' : 'rgba(255,230,190,.2)'; g.beginPath(); g.moveTo(-150, y);   // strata, gently wavy
    for (let x = -150; x <= 150; x += 10) g.lineTo(x, y + Math.sin(x * .03 + k) * 2.4); g.lineTo(150, y + 7); g.lineTo(-150, y + 7); g.closePath(); g.fill(); }
  g.fillStyle = lmGrad(g, -140, 0, 140, 0, ['rgba(255,240,210,.18)', 'rgba(0,0,0,0)', 'rgba(60,20,0,.28)']); g.fillRect(-150, -220, 300, 230);   // lit from the left
  g.fillStyle = 'rgba(70,30,10,.35)'; g.beginPath(); g.moveTo(-80, -66); g.quadraticCurveTo(-62, -128, 0, -132); g.quadraticCurveTo(64, -128, 80, -70); g.lineTo(80, -58); g.quadraticCurveTo(60, -116, 0, -120); g.quadraticCurveTo(-56, -116, -76, -56); g.closePath(); g.fill();   // the shaded underside
  for (let i = 0; i < 120; i++){ g.fillStyle = rng() < .5 ? 'rgba(120,60,20,.3)' : 'rgba(255,235,200,.25)'; ov(g, -140 + rng() * 280, -210 + rng() * 210, .6 + rng(), .4 + rng() * .5); g.fill(); }
  for (let i = 0; i < 6; i++){ const x = -120 + rng() * 240, y = -180 + rng() * 150; g.strokeStyle = 'rgba(80,36,10,.45)'; g.lineWidth = .8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rng() - .5) * 8, y + 10 + rng() * 16); g.stroke(); }   // cracks
  g.restore();
  for (let i = 0; i < 14; i++){ const x = (rng() < .5 ? -1 : 1) * (60 + rng() * 90), r = 3 + rng() * 7; g.fillStyle = C[1 + (i % 2)]; ov(g, x, -1 - rng() * 4, r, r * .6); g.fill(); g.fillStyle = 'rgba(255,235,200,.3)'; ov(g, x - r * .3, -2 - r * .3, r * .4, r * .25); g.fill(); }   // fallen stones
  for (let i = 0; i < 5; i++){ const x = (rng() < .5 ? -1 : 1) * (95 + rng() * 40); g.strokeStyle = '#6a8a3a'; g.lineWidth = 1; for (let k = 0; k < 5; k++){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (k - 2) * 2.4, -6 - rng() * 6); g.stroke(); } }   // dry grass tufts
}});
/* a cluster of crystals: ice (0) or amethyst (1) */
PROP_TYPES.lmspire = (seed, v = 0) => makeProp({w:220, h:260, ax:110, ay:246, seed, shadow:[80, 16], collide:52, paint(g, rng){
  const C = v % 2 ? ['#f4e4ff', '#c49aff', '#8a52d8', '#4a2280'] : ['#ffffff', '#cdeeff', '#7fc4ec', '#3a7ab0'];
  const rocks = v % 2 ? ['#5a5468', '#3e3a4a'] : ['#e8f0f6', '#b8c8d4'];
  for (let i = 0; i < 9; i++){ const x = -70 + rng() * 140, r = 10 + rng() * 14; g.fillStyle = rocks[i % 2]; ov(g, x, -4 - rng() * 6, r, r * .5); g.fill(); }   // the rocky (or snowy) foot
  const crys = [[-4, 236, 0, 22], [-40, 160, -.32, 18], [36, 182, .26, 19], [-70, 104, -.5, 14], [68, 118, .5, 15], [-20, 120, -.12, 13], [16, 96, .2, 12]];
  for (const [x, h, a, w] of crys.sort((p, q) => q[1] - p[1] < 0 ? -1 : 1)){
    g.save(); g.translate(x, -6); g.rotate(a);
    const tip = -h, shoulder = -h + w * 1.3;
    g.fillStyle = lmGrad(g, -w, 0, w, 0, [C[1], C[2], C[3]]); g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w, shoulder); g.lineTo(0, tip); g.lineTo(w, shoulder); g.lineTo(w, 0); g.closePath(); g.fill();
    g.fillStyle = lmGrad(g, 0, tip, 0, 0, [C[0], C[1]]); g.globalAlpha = .75; g.beginPath(); g.moveTo(-w, shoulder); g.lineTo(0, tip); g.lineTo(-w * .2, shoulder + 8); g.lineTo(-w * .2, 0); g.lineTo(-w, 0); g.closePath(); g.fill(); g.globalAlpha = 1;   // the lit facet
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(-w * .2, -4); g.lineTo(-w * .2, shoulder + 8); g.lineTo(0, tip); g.stroke();   // the bright edge
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = .7; for (let k = 0; k < 3; k++){ const y = shoulder + (h - w) * (k + 1) / 4 * .9; g.beginPath(); g.moveTo(-w + 2, y); g.lineTo(-w * .4, y - 6); g.stroke(); }   // inner flaws
    g.restore(); }
  for (let i = 0; i < 12; i++){ g.fillStyle = 'rgba(255,255,255,.9)'; const x = -60 + rng() * 120, y = -40 - rng() * 170; g.beginPath(); g.moveTo(x, y - 3); g.lineTo(x + .8, y); g.lineTo(x, y + 3); g.lineTo(x - .8, y); g.closePath(); g.fill(); }   // glints
}});
/* an old junk wrecked on the sand */
PROP_TYPES.lmwreck = (seed, v = 0) => makeProp({w:300, h:200, ax:150, ay:182, seed, shadow:[130, 16], collide:66, paint(g, rng){
  const W = ['#a8784a', '#7a5230', '#4e3018', '#2e1a0c'];
  g.fillStyle = 'rgba(232,212,160,.9)'; ov(g, 0, -4, 140, 16); g.fill();   // sand drifted against the hull
  g.save(); g.translate(0, -8); g.rotate(-.08);
  const hull = new Path2D(); hull.moveTo(-130, -54); hull.quadraticCurveTo(-118, -6, -60, 0); hull.lineTo(70, 0); hull.quadraticCurveTo(118, -8, 128, -66); hull.lineTo(96, -60); hull.lineTo(-104, -56); hull.closePath();
  g.fillStyle = lmGrad(g, 0, -66, 0, 0, [W[0], W[1], W[2]]); g.fill(hull);
  g.save(); g.clip(hull); g.strokeStyle = 'rgba(30,16,6,.5)'; g.lineWidth = .8; for (let y = -60; y < 0; y += 7){ g.beginPath(); g.moveTo(-140, y); g.quadraticCurveTo(0, y + 6, 140, y - 4); g.stroke(); }   // planks
    for (let i = 0; i < 30; i++){ g.fillStyle = rng() < .5 ? 'rgba(220,220,200,.55)' : 'rgba(60,90,60,.5)'; ov(g, -120 + rng() * 240, -18 + rng() * 16, 1.5 + rng() * 2, 1 + rng()); g.fill(); } g.restore();   // barnacles and weed at the waterline
  // the stern broken open: ribs showing
  g.fillStyle = '#1e120a'; g.beginPath(); g.moveTo(70, -56); g.lineTo(122, -60); g.quadraticCurveTo(116, -18, 74, -6); g.closePath(); g.fill();
  g.strokeStyle = W[1]; g.lineWidth = 3.4; for (let x = 80; x < 120; x += 9){ g.beginPath(); g.moveTo(x, -58); g.quadraticCurveTo(x + 6, -30, x - 4, -8); g.stroke(); }
  // the deck rail and a broken mast with a torn batten sail
  g.strokeStyle = W[2]; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-104, -58); g.lineTo(96, -62); g.stroke();
  g.fillStyle = W[2]; g.save(); g.translate(-20, -60); g.rotate(-.28); g.fillRect(-3, -96, 6, 96); g.fillStyle = W[0]; g.fillRect(-3, -96, 2, 96);
  g.fillStyle = 'rgba(176,64,40,.85)'; g.beginPath(); g.moveTo(3, -90); g.lineTo(52, -84); g.lineTo(46, -58); g.lineTo(38, -50); g.lineTo(30, -58); g.lineTo(22, -44); g.lineTo(3, -40); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(60,20,10,.6)'; g.lineWidth = .8; for (let k = 1; k < 5; k++){ g.beginPath(); g.moveTo(3, -90 + k * 10); g.lineTo(50 - k * 2, -84 + k * 8); g.stroke(); } g.restore();
  g.restore();
  for (let i = 0; i < 8; i++){ const x = -130 + rng() * 260, w = 8 + rng() * 14; g.save(); g.translate(x, -2); g.rotate((rng() - .5) * .6); g.fillStyle = W[1 + (i % 2)]; g.fillRect(-w / 2, -3, w, 3); g.restore(); }   // planks strewn on the sand
}});

/* placing it: a wide glade away from the camp, the trail, the gates and the water */
function lm320Place(id){
  const mp = MAPS[id]; if (!mp || mp.town || id === 0 || mp.dungeon || (typeof WFALLS !== 'undefined' && WFALLS.length)) return;
  const type = Object.keys(LM320).find(k => LM320[k].includes(mp.biome)); if (!type || !PROP_TYPES['lm' + type]) return;
  const v = type === 'spire' && mp.biome === 'cave' ? 1 : 0;
  let s = (id * 7919) % 2147483647 || 1; const rr = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const ok = (x, y) => trailD(x, y) > 170 && !(CAMP && Math.hypot(x - CAMP.x, y - CAMP.y) < 700) && !GATES.some(gt => Math.hypot(gt.x - x, gt.y - y) < 450)
    && !obstacles.some(o => (o.water || o.cliff) && Math.hypot(o.x - x, o.y - y) < o.r + 220) && !(typeof LAIR !== 'undefined' && Math.hypot(x - LAIR.x, y - LAIR.y) < 300)
    && !(WATERS || []).some(w => Math.hypot((x - w.x) / (w.rx + 200), (y - w.y) / (w.ry + 180)) < 1);
  for (let t = 0; t < 400; t++){ const x = 380 + rr() * (W - 760), y = 420 + rr() * (H - 760); if (!ok(x, y)) continue;
    for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (Math.hypot(p.x - x, (p.y - y) * 1.3) > 190 || !(typeof NAT318 !== 'undefined' && NAT318.has(p.type) || GRV.trees.has(p.type))) continue;
      PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); }
    const p = addProp('lm' + type, Math.round(x), Math.round(y), v); if (p) p.landmark = true;
    if (type === 'arch') for (const dx of [-108, 108]) obstacles.push({x:Math.round(x + dx), y:Math.round(y - 6), r:28});   // the arch's two feet; you can walk under it
    if (typeof NAV !== 'undefined') NAV.grid = null; return; }
}
{ const _rm = repaintMap; repaintMap = function(){ const r = _rm.apply(this, arguments); try { lm320Place(MAP_ID); } catch (e) { console.warn('landmarks320', e); } return r; }; }
