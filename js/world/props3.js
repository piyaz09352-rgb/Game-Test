/* VAYRATHEN — js/world/props3.js — the lands of data/world4.js: the Early Cretaceous of Isan and the dragon & demon realm
   Phu Wiang 130 million years ago was a floodplain of braided sandy rivers under a warm, seasonally dry sky. There
   were almost no flowers yet: the green came from conifers (araucarias), cycads, tree ferns, ground ferns and
   horsetails; turtles, crocodiles and fish lived in the channels, and bones settled in the sand bars. The props and
   ground recipes below paint that, in the same hand-painted style as props.js / props2.js (world units, foot point
   at 0,0, outlined), plus the dragon skulls, hell cauldrons, iron-thorn trees and violet obelisks of the realm past
   the volcano. Loaded after world/maps.js, so the new biomes can borrow from the old recipes. */
'use strict';

const PAL3 = {
  fernD:'#24502a', fernM:'#3a7434', fernL:'#62a046', fernH:'#9ccb62',
  cycD:'#2e4a26', cycM:'#4a6e30', cycL:'#7a9a44',
  trunkD:'#3a2a1c', trunkM:'#5a4028', trunkL:'#7e5a38', fiber:'#6a4a2e',
  bone:'#e8dcc0', boneM:'#c8b896', boneD:'#8a7a5a', sand:'#c8aa72', sandD:'#9a7e50',
  amber:'#e89a2a', amberL:'#ffd27a', amberD:'#9a5a12',
  copper:'#b8642e', copperL:'#e8945a', copperD:'#6a3418', iron:'#2a2426', ironL:'#4a4248'
};

/* a frond: a curved rachis with leaflets on both sides, from (x0,y0) toward angle a */
function frond(g, rng, x0, y0, a, len, droop, cols, leaf = 4){
  const pts = []; for (let k = 0; k <= 1.0001; k += .08){ const x = x0 + Math.cos(a) * len * k, y = y0 + Math.sin(a) * len * k + droop * k * k; pts.push([x, y, k]); }
  for (let i = 1; i < pts.length; i++){ const [x, y, k] = pts[i], [px, py] = pts[i - 1], ang = Math.atan2(y - py, x - px), l = leaf * (1 - k * .7) + 1;
    for (const sd of [-1, 1]){ const la = ang + sd * (1.15 - k * .3), ex = x + Math.cos(la) * l * 1.6, ey = y + Math.sin(la) * l * 1.6 + l * .4;
      g.strokeStyle = sd > 0 ? cols[1] : cols[2]; g.lineWidth = 1.6 * (1 - k * .5) + .5; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke(); } }
  g.strokeStyle = cols[0]; g.lineWidth = 1.4; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
}

Object.assign(PROP_TYPES, {
  /* tree fern: a shaggy fibrous trunk and a crown of long arching fronds */
  treefern: seed => makeProp({w:120, h:130, ax:60, ay:124, seed, shadow:[18, 6, 4], collide:7, paint(g, rng){
    const H = 62 + rng() * 22, lean = (rng() - .5) * 10;
    for (let t = 0; t <= 1; t += .03){ const x = lean * t * t, y = -t * H, w = 4.6 - t * 1.2;
      g.fillStyle = PAL3.trunkM; g.fillRect(x - w, y - 2.4, w * 2, 2.6); g.fillStyle = PAL3.trunkD; g.fillRect(x + w * .25, y - 2.4, w * .75, 2.6);
      if (Math.floor(t * 33) % 3 === 0){ g.fillStyle = PAL3.fiber; g.fillRect(x - w - 1, y - 1, 2, 2); g.fillRect(x + w - 1, y - 1.6, 2, 2); } }   // old frond bases
    const tx = lean, ty = -H, cols = typeof P4 !== 'undefined' ? P4.fern : [PAL3.fernD, PAL3.fernM, PAL3.fernL];
    for (let i = 0; i < 11; i++){ const a = -Math.PI / 2 + (i / 10 - .5) * 3.9 + (rng() - .5) * .2, back = i % 2;
      frond(g, rng, tx, ty, a, 36 + rng() * 12, 18 + rng() * 10, back ? cols.map((c, j) => cols[Math.max(0, j - 1)]) : cols, 4.4); }
    for (let i = 0; i < 4; i++) frond(g, rng, tx, ty, -Math.PI / 2 + (i - 1.5) * .35, 14 + rng() * 6, -4, [PAL3.fernM, PAL3.fernL, PAL3.fernH], 2.6);   // young fiddleheads in the middle
    g.fillStyle = PAL3.fernH; for (let i = 0; i < 3; i++){ ov(g, tx + (i - 1) * 3, ty - 14 - i * 2, 1.8, 1.8); g.fill(); }
  }}),
  /* cycad: a squat, diamond-scaled trunk and a stiff rosette of feather leaves around a cone */
  cycad: seed => makeProp({w:96, h:84, ax:48, ay:78, seed, shadow:[20, 6, 3], collide:9, paint(g, rng){
    const H = 22 + rng() * 14;
    for (let y = 0; y > -H; y -= 4){ const w = 9 - (-y / H) * 2.5; for (let x = -w; x < w; x += 4){ g.fillStyle = (Math.floor(x / 4) + Math.floor(y / 4)) % 2 ? PAL3.trunkM : PAL3.trunkL; pv(g, [x, y, x + 2, y - 2, x + 4, y, x + 2, y + 2]); g.fill(); } g.fillStyle = PAL3.trunkD; g.fillRect(w - 3, y - 2, 3, 4); }
    for (let i = 0; i < 13; i++){ const a = -Math.PI / 2 + (i / 12 - .5) * 3.3 + (rng() - .5) * .15, len = 30 + rng() * 8;
      frond(g, rng, 0, -H, a, len, 6 + rng() * 4, typeof P4 !== 'undefined' ? P4.cycad : [PAL3.cycD, PAL3.cycL, PAL3.cycM], 3.4); }
    g.fillStyle = '#c8a040'; ov(g, 0, -H - 6, 4.5, 7); g.fill(); g.fillStyle = '#e8c860'; for (let i = 0; i < 4; i++){ ov(g, -1.5 + (i % 2) * 3, -H - 10 + i * 2.6, 1.3, 1); g.fill(); }   // the seed cone
  }}),
  /* araucaria: a tall straight conifer with tiers of level branches tufted at the tips, and a flat crown */
  araucaria: seed => makeProp({w:130, h:270, ax:65, ay:264, seed, shadow:[22, 7, 8], collide:8, paint(g, rng){
    const H = 210 + rng() * 40;   // a 30–40 m conifer, shortened like every big plant (props4.js)
    g.fillStyle = PAL3.trunkD; pv(g, [-4, 0, 4, 0, 1.6, -H, -1.6, -H]); g.fill(); g.fillStyle = PAL3.trunkL; pv(g, [-4, 0, -1.4, 0, -.4, -H, -1.6, -H]); g.fill();
    const tiers = 9;
    for (let i = 0; i < tiers; i++){ const k = i / (tiers - 1), y = -H * (.42 + k * .58), span = 36 * (1 - k * .55) + rng() * 6;
      for (const sd of [-1, 1]){ const ex = sd * span, ey = y + 6 + rng() * 4;
        g.strokeStyle = PAL3.trunkM; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y); g.quadraticCurveTo(sd * span * .5, y - 2, ex, ey); g.stroke();
        for (let j = 0; j < 5; j++){ const t = .35 + j * .16, bx = sd * span * t, by = y + (ey - y) * t * t - 1;
          g.fillStyle = j % 2 ? '#2c5a32' : '#3a6e3a'; ov(g, bx, by, 6 - j * .4, 4); g.fill(); g.fillStyle = '#5a8e48'; ov(g, bx - sd, by - 1.5, 3, 1.8); g.fill(); } } }
    g.fillStyle = '#2c5a32'; ov(g, 0, -H, 14, 6); g.fill(); g.fillStyle = '#4a7e42'; ov(g, -2, -H - 2, 9, 3.4); g.fill();
  }}),
  /* horsetails: jointed hollow stems with dark rings and whorls of needle branches */
  horsetail: seed => makeProp({w:60, h:90, ax:30, ay:86, seed, shadow:[12, 4, 2], collide:0, paint(g, rng){
    const n = 5 + Math.floor(rng() * 4);
    for (let i = 0; i < n; i++){ const x0 = (rng() - .5) * 22, H = 40 + rng() * 38, lean = (rng() - .5) * 10;
      for (let k = 0; k < 1; k += 1 / 8){ const x = x0 + lean * k, y = -H * k, y2 = -H * (k + 1 / 8), x2 = x0 + lean * (k + 1 / 8);
        g.strokeStyle = i % 2 ? '#3e6430' : '#557a3c'; g.lineWidth = 3 - k * 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
        g.fillStyle = '#1e2a14'; g.fillRect(x2 - 1.6, y2 - .6, 3.2, 1.3);
        if (k > .25 && k < .9){ g.strokeStyle = '#6a8c4a'; g.lineWidth = .8; for (const sd of [-1, 1]){ g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 + sd * (8 - k * 5), y2 + 5); g.stroke(); } } }
      g.fillStyle = '#8a7a3a'; ov(g, x0 + lean, -H - 2, 1.8, 3.2); g.fill(); }   // the spore cone at the tip
  }}),
  /* ground ferns: a low clump of fronds */
  groundfern: seed => makeProp({w:70, h:40, ax:35, ay:36, seed, shadow:[14, 4, 1], collide:0, paint(g, rng){
    for (let i = 0; i < 8; i++){ const a = -Math.PI / 2 + (i / 7 - .5) * 3.1; frond(g, rng, 0, 0, a, 18 + rng() * 7, 4 + rng() * 4, i % 2 ? [PAL3.fernD, PAL3.fernM, PAL3.fernD] : [PAL3.fernM, PAL3.fernL, PAL3.fernM], 2.6); }
  }}),
  /* a dinosaur skull and a few ribs half buried in a sand bar */
  fossil: seed => makeProp({w:90, h:44, ax:45, ay:34, seed, shadow:[24, 5, 1], collide:10, paint(g, rng){
    g.fillStyle = PAL3.sandD; ov(g, 0, 2, 34, 9); g.fill(); g.fillStyle = PAL3.sand; ov(g, -2, 0, 31, 7); g.fill();
    for (let i = 0; i < 5; i++){ const x = 6 + i * 6; g.strokeStyle = PAL3.boneD; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + 4, -14, x + 9, -6); g.stroke(); g.strokeStyle = PAL3.bone; g.lineWidth = 2; g.stroke(); }   // ribs
    const sx = -14, sy = -6;   // the skull: long jaws with teeth, a big eye socket and the window behind it
    g.fillStyle = PAL3.boneM; pv(g, [sx - 18, sy + 4, sx - 18, sy - 1, sx - 2, sy - 8, sx + 10, sy - 9, sx + 14, sy - 2, sx + 12, sy + 5]); g.fill();
    g.fillStyle = PAL3.bone; pv(g, [sx - 17, sy + 1, sx - 2, sy - 7, sx + 9, sy - 8, sx + 11, sy - 4, sx - 4, sy - 1]); g.fill();
    g.fillStyle = '#3a2e22'; ov(g, sx + 3, sy - 3, 2.8, 2.6); g.fill(); ov(g, sx + 9, sy - 2, 1.8, 2.4); g.fill(); ov(g, sx - 9, sy - 2, 2.6, 1.4); g.fill();
    g.fillStyle = '#fffbe8'; for (let i = 0; i < 6; i++) pv(g, [sx - 16 + i * 3, sy + 3, sx - 15 + i * 3, sy + 6, sx - 14 + i * 3, sy + 3]), g.fill();
  }}),
  /* the ribcage of a long-necked giant, arching out of the ground */
  ribcage: seed => makeProp({w:150, h:90, ax:75, ay:80, seed, shadow:[50, 8, 4], collide:16, paint(g, rng){
    g.strokeStyle = PAL3.boneD; g.lineWidth = 6; g.beginPath(); g.moveTo(-62, -48); g.quadraticCurveTo(0, -66, 62, -40); g.stroke();
    g.strokeStyle = PAL3.bone; g.lineWidth = 4; g.stroke();   // the spine
    for (let i = 0; i < 9; i++){ const t = i / 8, x = -56 + t * 112, y = -50 - Math.sin(t * Math.PI) * 13, h = 44 + Math.sin(t * Math.PI) * 16;
      for (const sd of [-1, 1]){ g.strokeStyle = PAL3.boneD; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sd * 16, y + h * .4, x + sd * 9, y + h); g.stroke(); g.strokeStyle = sd > 0 ? PAL3.boneM : PAL3.bone; g.lineWidth = 3; g.stroke(); }
      g.fillStyle = PAL3.bone; ov(g, x, y - 3, 3.4, 4.4); g.fill(); }   // vertebrae
    g.fillStyle = PAL3.sand; ov(g, 0, -2, 70, 7); g.fill();
  }}),
  /* amber: lumps of fossil resin that glow in the sun, one with an insect inside */
  amber: seed => makeProp({w:60, h:46, ax:30, ay:40, seed, shadow:[16, 5, 1], collide:6, paint(g, rng){
    const lumps = [[-10, -6, 10, 9], [6, -10, 12, 13], [14, -4, 7, 6], [-2, -2, 6, 5]];
    for (const [x, y, rx, ry] of lumps){ g.fillStyle = PAL3.amberD; ov(g, x, y, rx, ry); g.fill(); g.fillStyle = PAL3.amber; ov(g, x - 1, y - 1, rx * .85, ry * .82); g.fill(); g.fillStyle = PAL3.amberL; ov(g, x - rx * .35, y - ry * .4, rx * .3, ry * .22); g.fill(); }
    g.fillStyle = 'rgba(70,36,10,.75)'; ov(g, 8, -8, 1.6, .8, .5); g.fill(); g.strokeStyle = 'rgba(70,36,10,.6)'; g.lineWidth = .5; g.beginPath(); g.moveTo(7, -8.5); g.lineTo(5.5, -10.5); g.moveTo(9, -8.5); g.lineTo(11, -10); g.moveTo(8, -7.5); g.lineTo(7, -5.5); g.stroke();   // a small trapped insect, seen through the resin
  }}),
  /* a dragon's skull with swept horns, lying on the rock */
  dragonskull: seed => makeProp({w:110, h:70, ax:55, ay:62, seed, shadow:[34, 7, 2], collide:16, paint(g, rng){
    g.fillStyle = PAL3.boneD; pv(g, [-44, -6, -40, -18, -12, -30, 14, -32, 34, -22, 40, -6, 18, 2, -20, 2]); g.fill();
    g.fillStyle = PAL3.bone; pv(g, [-42, -9, -38, -18, -12, -28, 12, -30, 30, -21, 34, -10, 10, -6, -20, -4]); g.fill();
    g.fillStyle = '#2a2018'; ov(g, 6, -18, 6, 5); g.fill(); ov(g, 22, -16, 3.5, 4.5); g.fill(); ov(g, -30, -14, 3.5, 2); g.fill();
    for (const [x, sd] of [[16, -1], [26, 1]]){ g.strokeStyle = PAL3.boneD; g.lineWidth = 5; g.beginPath(); g.moveTo(x, -28); g.quadraticCurveTo(x + 10 * sd + 14, -50, x + 34, -54); g.stroke(); g.strokeStyle = PAL3.boneM; g.lineWidth = 3; g.stroke(); }
    g.fillStyle = '#fffbe8'; for (let i = 0; i < 8; i++) pv(g, [-38 + i * 5, -6, -36 + i * 5, -1, -34 + i * 5, -6]), g.fill();
  }}),
  /* a copper cauldron of hell, boiling over a fire */
  cauldron: seed => makeProp({w:90, h:80, ax:45, ay:72, seed, shadow:[30, 7, 2], collide:22, paint(g, rng){
    for (let i = 0; i < 7; i++){ g.fillStyle = i % 2 ? '#ff7a1a' : '#ffd04a'; pv(g, [-24 + i * 8, 0, -20 + i * 8, -14 - rng() * 8, -16 + i * 8, 0]); g.fill(); }   // flames
    g.fillStyle = PAL3.copperD; ov(g, 0, -24, 32, 20); g.fill(); g.fillStyle = PAL3.copper; ov(g, -3, -26, 27, 16); g.fill(); g.fillStyle = PAL3.copperL; ov(g, -14, -30, 8, 5); g.fill();
    g.fillStyle = PAL3.copperD; ov(g, 0, -40, 33, 7); g.fill(); g.fillStyle = '#a8401a'; ov(g, 0, -41, 29, 5); g.fill();
    g.fillStyle = '#ff9a3a'; for (let i = 0; i < 5; i++){ ov(g, -18 + i * 9, -42 - rng() * 2, 2.4, 2); g.fill(); }   // bubbles
    g.fillStyle = 'rgba(200,190,180,.35)'; for (let i = 0; i < 3; i++){ ov(g, -10 + i * 10, -54 - i * 6, 7, 5); g.fill(); }   // steam
  }}),
  /* the iron-thorn silk-cotton tree of Thai hell (ต้นงิ้ว) */
  thorntree: seed => makeProp({w:90, h:120, ax:45, ay:114, seed, shadow:[16, 5, 3], collide:8, paint(g, rng){
    const br = (x, y, a, len, w, d) => { if (d > 3) return; const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      g.strokeStyle = PAL3.iron; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); g.strokeStyle = PAL3.ironL; g.lineWidth = w * .3; g.stroke();
      for (let k = .15; k < 1; k += .16){ const px = x + (x2 - x) * k, py = y + (y2 - y) * k, sd = Math.floor(k * 13) % 2 ? 1 : -1, na = a + sd * 1.3;
        g.strokeStyle = '#8a8088'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(na) * (5 - d), py + Math.sin(na) * (5 - d)); g.stroke(); }   // iron thorns
      br(x2, y2, a - .5 - rng() * .3, len * .7, w * .65, d + 1); br(x2, y2, a + .45 + rng() * .3, len * .68, w * .6, d + 1); };
    br(0, 0, -Math.PI / 2, 40, 7, 0);
    g.fillStyle = 'rgba(200,40,20,.6)'; for (let i = 0; i < 6; i++){ ov(g, (rng() - .5) * 50, -50 - rng() * 50, 2, 2); g.fill(); }   // ember blossoms
  }}),
  /* a violet crystal obelisk carved with glowing marks */
  obelisk: seed => makeProp({w:50, h:130, ax:25, ay:124, seed, shadow:[12, 5, 3], collide:9, paint(g, rng){
    const H = 96 + rng() * 22;
    g.fillStyle = '#2a1a3a'; pv(g, [-11, 0, 11, 0, 7, -H, 0, -H - 14, -7, -H]); g.fill(); g.fillStyle = '#5a3a8a'; pv(g, [-11, 0, -1, 0, -1, -H - 12, -7, -H]); g.fill();
    g.fillStyle = '#8a5ad0'; pv(g, [-9, -4, -4, -4, -4, -H + 6, -7, -H + 2]); g.fill();
    g.fillStyle = '#ff6ae0'; for (let i = 0; i < 6; i++){ const y = -14 - i * (H / 7); g.fillRect(-1, y, 4, 1.4); g.fillRect(1, y - 3, 1.4, 6); }   // glowing runes
    g.fillStyle = '#3a2a2a'; pv(g, [-16, 0, 16, 0, 13, -6, -13, -6]); g.fill();
  }})
});

/* ---------- ground recipes ---------- */
Object.assign(BIOME, {
  /* Primeval Phu Wiang: a humid fern forest under araucarias, mud pools, no flowers yet */
  primeval:{base:['#384a2a', '#40542e', '#4a5e34'], mottle:['rgba(64,48,28,.42)', 'rgba(150,170,100,.18)'], blades:['#2c4424', '#3a5a2c', '#4e7036', '#6a8a42'], bladeN:30000,   // a shaded forest floor: soil and leaf litter showing through
    road:['#8a6a42', '#a08052', '#b08e5c'], ponds:4, pondR:[60, 120], pondCols:['#6a5a3a', '#3a5a3a', '#4a7048', '#7a9a68'],
    props:[['treefern', 8, 5], ['araucaria', 5, 5], ['cycad', 6, 5], ['horsetail', 4, 5], ['groundfern', 9, 5], ['fossil', 1, 3], ['rock', 2, 1]], propN:150, fx:'mist', fxA:.22},
  /* Ancient Amber Basin: a braided sandy river on a floodplain, horsetail beds, bones in the sand bars */
  amberfen:{base:['#7e7650', '#878058', '#918a60'], mottle:['rgba(90,70,40,.4)', 'rgba(230,210,160,.22)'], blades:['#5a6a34', '#6e7a3e', '#8a8a4a'], bladeN:18000,
    road:['#b89a62', '#c8aa72', '#d6b880'], band:{y0:820, y1:1140, deep:'#4a5a3a', mid:'#5a7a4e', hi:'#9ab07a', shore:'#d8c08a'}, ponds:3, pondR:[50, 100], pondCols:['#d8c08a', '#6a5a2a', '#a8782a', '#e8b04a'],
    props:[['horsetail', 7, 5], ['cycad', 4, 5], ['araucaria', 3, 5], ['ribcage', 2, 3], ['fossil', 4, 3], ['amber', 3, 3], ['groundfern', 5, 5], ['reed', 2, 1]], propN:120, fx:'dust', fxA:.08}
});
BIOME.dragonvale = {...BIOME.crater, props:[['dragonskull', 1, 3], ['rock', 7, 1], ['crystal', 3, 3], ['stalag', 4, 2]]};
BIOME.dragonroost = {...BIOME.canyon, base:['#b08a56', '#bc9660', '#c8a26c'], mottle:['rgba(110,70,40,.4)', 'rgba(250,220,170,.3)'], props:[['dragonskull', 1, 3], ['ribcage', 2, 3], ['rock', 9, 1], ['stalag', 4, 2], ['araucaria', 2, 5]], fx:'dust', fxA:.12};
BIOME.naraka = {...BIOME.lavafield, props:[['cauldron', 2, 3], ['thorntree', 6, 3], ['rock', 6, 1], ['stalag', 3, 2]]};
BIOME.demonthrone = {...BIOME.badan, base:['#2a1e34', '#32243e', '#3a2a46'], mottle:['rgba(15,8,20,.55)', 'rgba(200,120,230,.15)'], blades:null, road:['#4a3a5a', '#5a4a6a', '#6a5a7a'],
  pondCols:['#2a1a2a', '#4a0a3a', '#8a1a6a', '#ff6ae0'], props:[['obelisk', 6, 3], ['crystal', 5, 4], ['statue', 2, 2], ['rock', 2, 1]], fx:'embers', fxA:.25, tint:'rgba(80,20,90,.12)'};   // a violet palace floor, not the sea floor it borrows from
