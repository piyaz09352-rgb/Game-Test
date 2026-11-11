/* VAYRATHEN — js/world/towerart259.js — (v259) the tower as the owner drew it
   The owner's picture: a Thai prang of pale stone and gold rising in tiers, a glowing golden gate at the top of a long
   stair, two giant yaksha guardians with maces on either side, red banners with a gold emblem, gold braziers on the
   balustrade posts, floating islands with waterfalls and a great moon in the sky.
   · The monument in Aren is drawn that way (twmonument).
   · Inside, the floors are six zones (towermap223.js): 1–20 ดินแดนผู้พิทักษ์ · 21–40 ป่าต้องสาป · 41–60 วิหารแห่งเวทมนตร์
     · 61–80 อาณาจักรปีศาจ · 81–99 ดินแดนเทพโบราณ · 100 บัลลังก์ราชันย์ VAYRATHEN. This file paints what makes each one
     itself: yaksha statues by the stairs (stone, gold or demon), floating islands, the moon, twisted dead trees and
     fog, rune circles and crystals, lava cracks, the king's throne and carpet. */
'use strict';

/* ---------- a yaksha guardian, feet at (0,0), about 215 tall at s = 1 ---------- */
const TWZ_YAK = {
  stone:{skin:'#b9b5ab', skinD:'#8c887e', armor:'#a9a395', armorD:'#7a7468', gold:'#e3b04b', goldD:'#a87a24', cloth:'#a8222a', eye:'#fff6d8', pupil:'#c0281e'},
  gold:{skin:'#e9c76e', skinD:'#b8913a', armor:'#f2d888', armorD:'#c49a3a', gold:'#fff0b0', goldD:'#c08a20', cloth:'#c8204a', eye:'#fffbe8', pupil:'#2a6ad8'},
  demon:{skin:'#6a2a34', skinD:'#3e141c', armor:'#3a2228', armorD:'#1e1014', gold:'#ff8a3a', goldD:'#a83a10', cloth:'#2a0a0e', eye:'#ffd23a', pupil:'#ff2a10'}
};
function twzYaksha(g, kind = 'stone', s = 1){
  const p = TWZ_YAK[kind] || TWZ_YAK.stone; g.save(); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
  const poly = (pts, fill, stroke, lw = 1.4) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill){ g.fillStyle = fill; g.fill(); } if (stroke){ g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } };
  // pedestal
  g.fillStyle = p.armorD; g.fillRect(-48, -14, 96, 14); g.fillStyle = p.armor; g.fillRect(-44, -20, 88, 8); g.fillStyle = p.gold; g.fillRect(-48, -14, 96, 2.5);
  // hip guards: gold kranok flaps curling out at the sides
  for (const d of [-1, 1]){ poly([[d * 18, -86], [d * 44, -80], [d * 58, -58], [d * 50, -50], [d * 42, -62], [d * 30, -58], [d * 20, -64]], p.gold, p.goldD, 1.6);
    poly([[d * 44, -76], [d * 54, -60], [d * 46, -56], [d * 38, -66]], p.goldD); }
  // legs in a wide stance, gold greaves
  for (const d of [-1, 1]){ poly([[d * 6, -86], [d * 22, -86], [d * 26, -22], [d * 10, -22]], p.skin, p.skinD);
    poly([[d * 9, -52], [d * 25, -52], [d * 27, -22], [d * 9, -22]], p.armor, p.armorD); g.fillStyle = p.gold; g.fillRect(Math.min(d * 9, d * 27), -54, 18, 3);
    g.fillStyle = p.skinD; g.beginPath(); g.ellipse(d * 19, -20, 13, 5, 0, 0, 7); g.fill(); }
  // the cloth hanging in front
  poly([[-13, -88], [13, -88], [15, -40], [0, -32], [-15, -40]], p.cloth, p.goldD); g.fillStyle = p.gold; g.fillRect(-13, -88, 26, 3); g.fillRect(-3, -84, 6, 46);
  // torso: armour of gold scales
  g.fillStyle = p.armor; g.beginPath(); g.moveTo(-26, -88); g.lineTo(-30, -136); g.quadraticCurveTo(0, -150, 30, -136); g.lineTo(26, -88); g.closePath(); g.fill(); g.strokeStyle = p.armorD; g.lineWidth = 1.6; g.stroke();
  g.save(); g.clip(); g.strokeStyle = p.goldD; g.lineWidth = 1.1; for (let y = -140; y < -88; y += 6) for (let x = -30 + ((y / 6) % 2 ? 3 : 0); x < 32; x += 7){ g.beginPath(); g.arc(x, y, 3.4, 0, Math.PI); g.stroke(); } g.restore();
  g.fillStyle = p.gold; g.beginPath(); g.ellipse(0, -118, 9, 11, 0, 0, 7); g.fill(); g.fillStyle = p.goldD; g.beginPath(); g.ellipse(0, -118, 4.5, 6, 0, 0, 7); g.fill();   // the breast medallion
  g.fillStyle = p.gold; g.fillRect(-27, -92, 54, 6); g.fillStyle = p.goldD; g.fillRect(-27, -87, 54, 1.5);                                                      // belt
  // the mace (gada): a long gold staff, the heavy head on the ground, both hands on the pommel
  g.fillStyle = p.goldD; g.fillRect(-4, -116, 8, 92); g.fillStyle = p.gold; g.fillRect(-2.5, -116, 3, 92);
  for (let k = 0; k < 5; k++){ g.fillStyle = p.gold; g.fillRect(-5, -104 + k * 17, 10, 3); }
  g.fillStyle = p.gold; g.beginPath(); g.moveTo(-9, -22); g.lineTo(-11, -40); g.lineTo(0, -50); g.lineTo(11, -40); g.lineTo(9, -22); g.closePath(); g.fill(); g.strokeStyle = p.goldD; g.lineWidth = 1.5; g.stroke();
  g.beginPath(); g.arc(0, -120, 6, 0, 7); g.fill();
  // arms down to the pommel, gold armlets
  for (const d of [-1, 1]){ g.strokeStyle = p.skinD; g.lineWidth = 15; g.beginPath(); g.moveTo(d * 30, -132); g.quadraticCurveTo(d * 36, -112, d * 10, -114); g.stroke();
    g.strokeStyle = p.skin; g.lineWidth = 12; g.beginPath(); g.moveTo(d * 30, -132); g.quadraticCurveTo(d * 36, -112, d * 10, -114); g.stroke();
    g.strokeStyle = p.gold; g.lineWidth = 4; g.beginPath(); g.moveTo(d * 37, -124); g.lineTo(d * 27, -122); g.stroke(); }
  g.fillStyle = p.skin; g.beginPath(); g.ellipse(0, -114, 12, 7, 0, 0, 7); g.fill(); g.strokeStyle = p.skinD; g.lineWidth = 1.2; g.stroke();   // the clasped hands
  // shoulder guards with a flame-shaped flare
  for (const d of [-1, 1]){ g.fillStyle = p.gold; g.beginPath(); g.ellipse(d * 31, -134, 13, 9, d * .3, 0, 7); g.fill(); g.strokeStyle = p.goldD; g.lineWidth = 1.4; g.stroke();
    poly([[d * 22, -140], [d * 34, -160], [d * 30, -146], [d * 44, -152], [d * 42, -136]], p.gold, p.goldD, 1.2); }
  // head: fierce face, bulging eyes, tusks
  g.fillStyle = p.skin; g.beginPath(); g.ellipse(0, -160, 15, 17, 0, 0, 7); g.fill(); g.strokeStyle = p.skinD; g.lineWidth = 1.4; g.stroke();
  for (const d of [-1, 1]){ g.fillStyle = p.skin; g.beginPath(); g.ellipse(d * 16, -160, 4, 7, 0, 0, 7); g.fill(); g.fillStyle = p.gold; g.beginPath(); g.arc(d * 16, -152, 2.6, 0, 7); g.fill();   // ears, earrings
    g.fillStyle = p.eye; g.beginPath(); g.ellipse(d * 6, -164, 4.6, 3.6, 0, 0, 7); g.fill(); g.fillStyle = p.pupil; g.beginPath(); g.arc(d * 6, -164, 1.8, 0, 7); g.fill();
    g.strokeStyle = p.skinD; g.lineWidth = 2.4; g.beginPath(); g.moveTo(d * 2, -168); g.lineTo(d * 11, -171); g.stroke(); }                                              // angry brows
  g.fillStyle = p.skinD; g.beginPath(); g.ellipse(0, -152, 8, 3.6, 0, 0, Math.PI); g.fill();                                                                          // the open mouth
  g.fillStyle = '#fffaf0'; for (const d of [-1, 1]){ g.beginPath(); g.moveTo(d * 6, -151); g.lineTo(d * 8.5, -158); g.lineTo(d * 3.6, -151); g.closePath(); g.fill(); }   // tusks
  g.fillStyle = p.skinD; g.beginPath(); g.moveTo(0, -162); g.lineTo(-3, -156); g.lineTo(3, -156); g.closePath(); g.fill();                                            // nose
  // the chada crown: a gold band, tiers narrowing to a point, a flare over each ear
  g.fillStyle = p.gold; g.fillRect(-15, -178, 30, 6); g.fillStyle = p.goldD; g.fillRect(-15, -173, 30, 1.5);
  let w = 13, y = -178; for (let k = 0; k < 5; k++){ g.fillStyle = k % 2 ? p.goldD : p.gold; g.beginPath(); g.moveTo(-w, y); g.lineTo(w, y); g.lineTo(w * .82, y - 7); g.lineTo(-w * .82, y - 7); g.closePath(); g.fill(); y -= 7; w *= .8; }
  g.fillStyle = p.gold; g.beginPath(); g.moveTo(-3, y); g.lineTo(0, y - 18); g.lineTo(3, y); g.closePath(); g.fill();
  for (const d of [-1, 1]) poly([[d * 13, -176], [d * 24, -186], [d * 20, -176], [d * 26, -170], [d * 14, -170]], p.gold, p.goldD, 1);
  g.restore();
}

/* ---------- a red banner with a gold emblem, hanging from (0,0) ---------- */
function twzBanner(g, w = 26, h = 70, cloth = '#a8222a', gold = '#e3b04b'){
  g.fillStyle = gold; g.fillRect(-w / 2 - 4, -3, w + 8, 4); g.fillStyle = '#5a3a14'; g.fillRect(-w / 2 - 6, -2, 3, 3); g.fillRect(w / 2 + 3, -2, 3, 3);
  g.fillStyle = cloth; g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(w / 2, 0); g.lineTo(w / 2, h); g.lineTo(0, h + w * .4); g.lineTo(-w / 2, h); g.closePath(); g.fill();
  g.strokeStyle = gold; g.lineWidth = 2; g.stroke();
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(w / 2 - 4, 0, 4, h);
  // the emblem: a lotus-flame in a diamond
  const cy = h * .45, r = w * .36; g.strokeStyle = gold; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, cy - r * 1.4); g.lineTo(r, cy); g.lineTo(0, cy + r * 1.4); g.lineTo(-r, cy); g.closePath(); g.stroke();
  g.fillStyle = gold; g.beginPath(); g.moveTo(0, cy - r * .9); g.quadraticCurveTo(r * .6, cy, 0, cy + r * .7); g.quadraticCurveTo(-r * .6, cy, 0, cy - r * .9); g.fill();
  for (let k = 0; k < 4; k++){ g.fillStyle = gold; g.fillRect(-w / 2 + 2, h * (.12 + k * .26), 3, 3); }
}

/* ---------- floating islands with waterfalls, the moon ---------- */
function twzIsland(g, x, y, s, rock = '#7a7a86', grass = '#5aa04a', a = 1){
  g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s);
  g.fillStyle = rock; g.beginPath(); g.moveTo(-60, 0); g.lineTo(60, 0); g.lineTo(34, 26); g.lineTo(10, 70); g.lineTo(-6, 44); g.lineTo(-26, 30); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.moveTo(10, 0); g.lineTo(60, 0); g.lineTo(34, 26); g.lineTo(10, 70); g.closePath(); g.fill();
  g.fillStyle = grass; g.beginPath(); g.ellipse(0, 0, 62, 10, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(28, 2, 5, 70); g.fillStyle = 'rgba(200,230,255,.5)'; g.fillRect(26, 6, 9, 66);                    // the waterfall
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(30, 76, 14, 5, 0, 0, 7); g.fill();
  g.fillStyle = '#d8d4c8'; g.fillRect(-26, -26, 18, 26); g.beginPath(); g.moveTo(-28, -26); g.lineTo(-17, -46); g.lineTo(-6, -26); g.closePath(); g.fill();   // a little shrine on top
  g.fillStyle = '#e3b04b'; g.fillRect(-18, -50, 2, 6);
  g.fillStyle = '#3a6a3a'; g.beginPath(); g.arc(14, -12, 12, 0, 7); g.arc(24, -8, 9, 0, 7); g.fill();
  g.restore();
}
function twzMoon(g, x, y, r){
  const gr = g.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); gr.addColorStop(0, 'rgba(240,244,255,.9)'); gr.addColorStop(1, 'rgba(160,170,220,.55)');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.fillStyle = 'rgba(120,130,190,.25)'; for (const [dx, dy, rr] of [[-.3, -.1, .18], [.2, .25, .12], [.35, -.3, .09], [-.1, .4, .1]]){ g.beginPath(); g.arc(x + dx * r, y + dy * r, rr * r, 0, 7); g.fill(); }
  const h = g.createRadialGradient(x, y, r, x, y, r * 1.6); h.addColorStop(0, 'rgba(200,210,255,.25)'); h.addColorStop(1, 'rgba(200,210,255,0)'); g.fillStyle = h; g.beginPath(); g.arc(x, y, r * 1.6, 0, 7); g.fill();
}

/* ---------- the zones' own painting (called from towermap223.js's twmPaint) ---------- */
function twzSky(g, T0, r){
  if (T0.moon) twzMoon(g, W * .82, H * .12, 120);
  if (T0.islands) for (const [x, y, s] of [[.12, .1, 1.1], [.3, .05, .6], [.66, .07, .8], [.9, .3, .9], [.06, .42, .7]]) twzIsland(g, W * x, H * y, s, T0.islandRock || '#8a8a96', T0.islandGrass || '#5aa04a', .9);
  if (T0.fog) for (let i = 0; i < 26; i++){ g.fillStyle = `rgba(${T0.fogCol || '150,190,140'},${.06 + r() * .08})`; g.beginPath(); g.ellipse(r() * W, r() * H, 120 + r() * 160, 30 + r() * 30, 0, 0, 7); g.fill(); }
  if (T0.crystals) for (let i = 0; i < 14; i++){ const x = r() * W, y = r() * H * .6, s = 8 + r() * 16; g.fillStyle = `rgba(${T0.glow},${.25 + r() * .3})`; g.beginPath(); g.moveTo(x, y - s * 1.6); g.lineTo(x + s * .6, y); g.lineTo(x, y + s * 1.2); g.lineTo(x - s * .6, y); g.closePath(); g.fill(); }
  if (T0.lava){ const gr = g.createLinearGradient(0, H * .7, 0, H); gr.addColorStop(0, 'rgba(255,80,20,0)'); gr.addColorStop(1, 'rgba(255,80,20,.45)'); g.fillStyle = gr; g.fillRect(0, H * .7, W, H * .3); }
}
function twzWall(g, T0, c){
  // hanging vines over the back wall (cursed forest), chains and horns (demons), gold drapes (the throne)
  if (T0.vines) for (let i = 0; i < 40; i++){ const a = Math.PI + (i + .5) / 40 * Math.PI, x = c.x + Math.cos(a) * TWM_RX * .98, y0 = c.y + Math.sin(a) * TWM_RY - 220, len = 60 + (i * 37 % 90);
    g.strokeStyle = i % 3 ? '#2e4a22' : '#4a3a5a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + (i % 2 ? 10 : -10), y0 + len / 2, x, y0 + len); g.stroke();
    g.fillStyle = '#3e6a2a'; for (let k = 10; k < len; k += 16){ g.beginPath(); g.ellipse(x + (k % 32 ? 4 : -4), y0 + k, 4, 2.4, .6, 0, 7); g.fill(); } }
  if (T0.horns) for (let i = 1; i < 12; i += 2){ const a = Math.PI + i / 12 * Math.PI, x = c.x + Math.cos(a) * TWM_RX * .985, y = c.y + Math.sin(a) * TWM_RY - 150;
    g.fillStyle = '#e8dcc8'; for (const d of [-1, 1]){ g.beginPath(); g.moveTo(x + d * 6, y); g.quadraticCurveTo(x + d * 26, y - 8, x + d * 20, y - 34); g.quadraticCurveTo(x + d * 16, y - 12, x + d * 2, y + 4); g.closePath(); g.fill(); }
    g.fillStyle = '#2a1a1a'; g.beginPath(); g.arc(x, y + 8, 9, 0, 7); g.fill(); g.fillStyle = '#ff5a2a'; g.fillRect(x - 5, y + 5, 3, 3); g.fillRect(x + 2, y + 5, 3, 3); }
  if (T0.drapes) for (let i = 0; i < 9; i++){ const a = Math.PI + (i + .5) / 9 * Math.PI, x = c.x + Math.cos(a) * TWM_RX * .97, y = c.y + Math.sin(a) * TWM_RY - 200;
    g.fillStyle = T0.carpet; g.beginPath(); g.moveTo(x - 34, y); g.quadraticCurveTo(x, y + 40, x + 34, y); g.lineTo(x + 34, y + 8); g.quadraticCurveTo(x, y + 50, x - 34, y + 8); g.closePath(); g.fill(); g.fillStyle = T0.acc; g.fillRect(x - 36, y - 3, 72, 4); }
  if (T0.banners) for (const k of [-1, 1]) for (const j of [.2, .38]){ const a = Math.PI * 1.5 + k * j * Math.PI, x = c.x + Math.cos(a) * TWM_RX * .9, y = c.y + Math.sin(a) * TWM_RY - 200;
    g.save(); g.translate(x, y); twzBanner(g, 30, 96, T0.carpet, T0.acc); g.restore(); }
}
function twzFloor(g, T0, c, r){
  if (T0.runes){ const R = 330, oy = 2 / 3; g.strokeStyle = `rgba(${T0.glow},.55)`; g.lineWidth = 3; for (const k of [R, R * .9]){ g.beginPath(); g.ellipse(c.x, c.y, k, k * oy, 0, 0, 7); g.stroke(); }
    g.fillStyle = `rgba(${T0.glow},.7)`; g.font = '700 22px Georgia,serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const RUNE = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
    for (let i = 0; i < 24; i++){ const a = i / 24 * 6.283; g.fillText(RUNE[i], c.x + Math.cos(a) * R * .95, c.y + Math.sin(a) * R * .95 * oy); }
    g.strokeStyle = `rgba(${T0.glow},.35)`; g.lineWidth = 2; g.beginPath(); for (let i = 0; i < 6; i++){ const a = i / 6 * 6.283 - Math.PI / 2, b = a + Math.PI * 2 / 3; g.moveTo(c.x + Math.cos(a) * R * .88, c.y + Math.sin(a) * R * .88 * oy); g.lineTo(c.x + Math.cos(b) * R * .88, c.y + Math.sin(b) * R * .88 * oy); } g.stroke(); }
  if (T0.lava) for (let i = 0; i < 18; i++){ let x = c.x + (r() - .5) * TWM_RX * 1.6, y = c.y + (r() - .5) * TWM_RY * 1.4; if (Math.hypot(x - c.x, (y - c.y) * 1.5) < 170) continue;
    g.strokeStyle = 'rgba(255,110,30,.85)'; g.lineWidth = 2.6; g.shadowColor = '#ff5a10'; g.shadowBlur = 8; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++){ x += (r() - .5) * 60; y += (r() - .5) * 30; g.lineTo(x, y); } g.stroke(); g.shadowBlur = 0; }
  if (T0.roots) for (let i = 0; i < 16; i++){ const a = r() * 6.283, x = c.x + Math.cos(a) * TWM_RX * .9, y = c.y + Math.sin(a) * TWM_RY * .9;
    g.strokeStyle = '#3a2a1c'; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - Math.cos(a) * 40, y - Math.sin(a) * 20 + 10, x - Math.cos(a) * 80, y - Math.sin(a) * 40); g.stroke(); }
  if (T0.royal){ const st = twmStairs(), en = twmEntry(), w = 70; g.fillStyle = T0.carpet; g.fillRect(c.x - w / 2, st.y + 10, w, en.y - st.y + 30); g.fillStyle = T0.acc; g.fillRect(c.x - w / 2, st.y + 10, 4, en.y - st.y + 30); g.fillRect(c.x + w / 2 - 4, st.y + 10, 4, en.y - st.y + 30); }
}
/* the back of the floor-100 hall: the king's throne instead of the stairs */
function twzThrone(g, T0, st){
  const x = st.x, y = st.y - 10;
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x, y + 4, 110, 22, 0, 0, 7); g.fill();
  for (let k = 0; k < 3; k++){ g.fillStyle = k % 2 ? T0.wall[0] : T0.floor[2]; g.fillRect(x - 100 + k * 12, y - 14 - k * 12, 200 - k * 24, 14); g.fillStyle = T0.acc; g.fillRect(x - 100 + k * 12, y - 14 - k * 12, 200 - k * 24, 2.5); }
  const by = y - 50;
  g.fillStyle = T0.acc; g.beginPath(); g.moveTo(x - 46, by); g.lineTo(x - 50, by - 120); g.quadraticCurveTo(x, by - 190, x + 50, by - 120); g.lineTo(x + 46, by); g.closePath(); g.fill();   // the back
  g.fillStyle = T0.carpet; g.beginPath(); g.moveTo(x - 34, by - 10); g.lineTo(x - 36, by - 110); g.quadraticCurveTo(x, by - 166, x + 36, by - 110); g.lineTo(x + 34, by - 10); g.closePath(); g.fill();
  g.fillStyle = T0.acc; g.beginPath(); g.arc(x, by - 120, 14, 0, 7); g.fill(); g.fillStyle = T0.carpet; g.beginPath(); g.arc(x, by - 120, 8, 0, 7); g.fill();
  g.fillStyle = T0.acc; g.beginPath(); g.moveTo(x - 6, by - 160); g.lineTo(x, by - 200); g.lineTo(x + 6, by - 160); g.closePath(); g.fill();
  g.fillStyle = T0.acc; g.fillRect(x - 56, by - 16, 112, 18); g.fillRect(x - 60, by - 46, 16, 32); g.fillRect(x + 44, by - 46, 16, 32);   // seat and arms
  g.fillStyle = T0.carpet; g.fillRect(x - 42, by - 22, 84, 10);
}
/* the props each zone adds (from twmBuild) */
function twzProps(T0, tier, c, st, en){
  if (T0.statues) for (const d of [-1, 1]) addProp('twyaksha', st.x + d * 170, st.y + 34, tier);
  if (T0.trees) for (let i = 0; i < 6; i++){ const a = (i + .5) / 6 * 6.283 + .3; if (Math.abs(Math.sin(a)) > .9) continue; addProp('twdeadtree', Math.round(c.x + Math.cos(a) * TWM_RX * .66), Math.round(c.y + Math.sin(a) * TWM_RY * .7), tier); }
  if (T0.crystals) for (const d of [-1, 1]) for (const k of [.45, .7]) addProp('twcrystal', Math.round(c.x + d * TWM_RX * k), Math.round(c.y - TWM_RY * .3 + k * 60), tier);
}
PROP_TYPES.twyaksha = (seed, v = 0) => { const T0 = TWM_TIERS[v % TWM_TIERS.length];
  return makeProp({w:140, h:240, ax:70, ay:232, seed, shadow:[44, 12], collide:30, paint(g){ twzYaksha(g, T0.statues || 'stone', 1); }}); };
PROP_TYPES.twdeadtree = (seed, v = 0) => makeProp({w:110, h:150, ax:55, ay:144, seed, shadow:[26, 8], collide:14, paint(g, rng){
  g.strokeStyle = '#2a2018'; g.lineCap = 'round';
  const br = (x, y, a, len, w, d) => { if (d > 4 || len < 8) return; const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
    br(x2, y2, a - .5 - rng() * .3, len * .7, w * .65, d + 1); br(x2, y2, a + .45 + rng() * .3, len * .66, w * .65, d + 1); };
  br(0, 0, -Math.PI / 2, 52, 11, 0);
  g.fillStyle = 'rgba(170,255,120,.5)'; for (let i = 0; i < 5; i++){ g.beginPath(); g.arc((rng() - .5) * 70, -60 - rng() * 70, 2.5, 0, 7); g.fill(); }   // will-o'-wisps
  void v; }});
PROP_TYPES.twcrystal = (seed, v = 0) => { const T0 = TWM_TIERS[v % TWM_TIERS.length];
  return makeProp({w:60, h:120, ax:30, ay:112, seed, shadow:[18, 6], collide:14, glow:[0, -60, 60], paint(g){
    g.fillStyle = T0.wall[1]; g.fillRect(-16, -14, 32, 14); g.fillStyle = T0.acc; g.fillRect(-16, -14, 32, 2.5);
    for (const [dx, h, w] of [[0, 96, 13], [-11, 60, 8], [11, 70, 8]]){ g.fillStyle = `rgba(${T0.glow},.8)`; g.beginPath(); g.moveTo(dx - w, -14); g.lineTo(dx - w * .8, -14 - h * .75); g.lineTo(dx, -14 - h); g.lineTo(dx + w * .8, -14 - h * .75); g.lineTo(dx + w, -14); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.moveTo(dx - 2, -18); g.lineTo(dx, -14 - h * .9); g.lineTo(dx + w * .4, -18); g.closePath(); g.fill(); } }}); };

/* ---------- the monument in Aren, after the owner's picture ---------- */
PROP_TYPES.twmonument = (seed, v = 0) => makeProp({w:250, h:340, ax:125, ay:330, seed, shadow:[100, 16], collide:0, glow:[0, -312, 80], paint(g){
  const stone = '#dcd7cb', stoneD = '#a8a294', stoneL = '#efebe2', gold = '#e3b04b', goldD = '#a87a24', red = '#a8222a';
  // the stair up to the gate, a balustrade on each side with gold braziers on the posts
  for (let k = 0; k < 8; k++){ const y = -k * 5, w = 46 - k * 2.4; g.fillStyle = k % 2 ? stone : stoneL; g.fillRect(-w, y - 5, w * 2, 5); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-w, y - 1, w * 2, 1); }
  for (const d of [-1, 1]){ g.fillStyle = stoneD; g.beginPath(); g.moveTo(d * 48, 0); g.lineTo(d * 30, -42); g.lineTo(d * 36, -42); g.lineTo(d * 56, 0); g.closePath(); g.fill();
    for (const [px, py] of [[d * 54, 0], [d * 34, -40]]){ g.fillStyle = stoneD; g.fillRect(px - 5, py - 18, 10, 18); g.fillStyle = gold; g.fillRect(px - 7, py - 22, 14, 4);
      g.fillStyle = '#ffb04a'; g.beginPath(); g.ellipse(px, py - 28, 4, 7, 0, 0, 7); g.fill(); g.fillStyle = '#fff2a8'; g.beginPath(); g.ellipse(px, py - 27, 2, 3.5, 0, 0, 7); g.fill(); } }
  // the terrace
  g.fillStyle = stoneD; g.fillRect(-110, -54, 220, 14); g.fillStyle = stone; g.fillRect(-114, -60, 228, 8); g.fillStyle = gold; g.fillRect(-114, -60, 228, 2);
  for (let x = -108; x <= 108; x += 12){ g.fillStyle = stoneL; g.fillRect(x - 2, -70, 4, 10); } g.fillStyle = stone; g.fillRect(-114, -72, 228, 3);
  // the prang: a base with the gate, then tiers rounding in toward a gold finial
  g.fillStyle = stone; g.fillRect(-58, -126, 116, 66); g.fillStyle = stoneD; g.fillRect(-58, -126, 6, 66); g.fillRect(52, -126, 6, 66); g.fillStyle = gold; g.fillRect(-60, -128, 120, 3);
  // the glowing gate and its gold gable
  const gl = g.createRadialGradient(0, -84, 2, 0, -84, 30); gl.addColorStop(0, '#fff6c8'); gl.addColorStop(.5, '#ffb04a'); gl.addColorStop(1, '#c0501a');
  g.fillStyle = gl; g.beginPath(); g.moveTo(-14, -60); g.lineTo(-14, -94); g.quadraticCurveTo(0, -112, 14, -94); g.lineTo(14, -60); g.closePath(); g.fill();
  g.strokeStyle = gold; g.lineWidth = 3; g.stroke();
  g.fillStyle = gold; g.beginPath(); g.moveTo(-24, -100); g.lineTo(0, -138); g.lineTo(24, -100); g.lineTo(18, -100); g.lineTo(0, -128); g.lineTo(-18, -100); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-3, -136); g.lineTo(0, -146); g.lineTo(3, -136); g.closePath(); g.fill();
  for (const d of [-1, 1]){ g.fillStyle = gold; g.fillRect(d * 20 - 2.5, -100, 5, 40); }
  // red banners either side of the gate
  for (const d of [-1, 1]){ g.save(); g.translate(d * 38, -122); twzBanner(g, 16, 46, red, gold); g.restore(); }
  // the tiers: a rounded prang profile
  let y = -128; const tiers = 10;
  for (let i = 0; i < tiers; i++){ const t = i / tiers, w = 50 * Math.sqrt(1 - t * t * .92) + 8, h = 18 - i * .6;
    const gr = g.createLinearGradient(-w, 0, w, 0); gr.addColorStop(0, stoneD); gr.addColorStop(.35, stoneL); gr.addColorStop(.7, stone); gr.addColorStop(1, stoneD); g.fillStyle = gr; g.fillRect(-w, y - h, w * 2, h);
    g.fillStyle = gold; g.fillRect(-w - 2, y - 2.5, w * 2 + 4, 2.5);
    const n = Math.max(1, Math.round(w / 14)); for (let k = 0; k < n; k++){ const ax = -w + (k + .5) * (w * 2 / n); g.fillStyle = (i + k) % 3 ? '#ffd88a' : '#6a5a4a'; g.beginPath(); g.moveTo(ax - 2.4, y - 3); g.lineTo(ax - 2.4, y - h + 6); g.lineTo(ax, y - h + 3); g.lineTo(ax + 2.4, y - h + 6); g.lineTo(ax + 2.4, y - 3); g.closePath(); g.fill(); }
    for (const d of [-1, 1]){ g.fillStyle = gold; g.beginPath(); g.moveTo(d * w - 3, y - h); g.lineTo(d * w, y - h - 9); g.lineTo(d * w + 3, y - h); g.closePath(); g.fill(); }   // little gold spires at the corners
    y -= h; }
  g.fillStyle = gold; g.beginPath(); g.moveTo(-10, y); g.lineTo(-6, y - 10); g.lineTo(6, y - 10); g.lineTo(10, y); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-5, y - 10); g.lineTo(0, y - 46); g.lineTo(5, y - 10); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.moveTo(-1.5, y - 12); g.lineTo(0, y - 42); g.lineTo(1, y - 12); g.closePath(); g.fill();
  g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(0, y - 50, 4.5, 0, 7); g.fill();
  // the two yaksha guardians on the terrace, flanking the stair
  for (const d of [-1, 1]){ g.save(); g.translate(d * 84, -56); twzYaksha(g, 'stone', .5); g.restore(); }
  // the plaque: 100
  g.fillStyle = goldD; g.fillRect(-16, -58, 32, 11); g.fillStyle = gold; g.fillRect(-15, -57, 30, 9); g.fillStyle = '#5a3a10'; g.font = '900 9px Georgia,serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('100', 0, -52.5);
}});
const TWMON_TOP = 312;   // the beacon's height above the monument's foot (towermon232.js)

/* ======================= (v259) the hall, after the owner's second picture =======================
   A stone floor of square tiles cut to an eight-sided platform hanging over glowing mist; square pillars banded with
   gold round the edge, braziers on pedestals, the zone's banners, glowing crystals in the corners, barrels and crates;
   a glowing gate up the steps at the back (the way up) and a stair going down at the front (where you came in); a gold
   rune pattern in the middle of the floor round the floor's number. Every zone keeps its own colours and extras. */
const TWZ_K = .3;   // how much the corners are cut
function twzOct(c, a = TWM_RX, b = TWM_RY){ const k = TWZ_K;
  return [[c.x - a * (1 - k), c.y - b], [c.x + a * (1 - k), c.y - b], [c.x + a, c.y - b * (1 - k)], [c.x + a, c.y + b * (1 - k)], [c.x + a * (1 - k), c.y + b], [c.x - a * (1 - k), c.y + b], [c.x - a, c.y + b * (1 - k)], [c.x - a, c.y - b * (1 - k)]]; }
function twzInOct(x, y, m = 0){ const c = twmC(), a = TWM_RX - m, b = TWM_RY - m * .66, dx = Math.abs(x - c.x), dy = Math.abs(y - c.y);
  if (dx < 95 - m && y > c.y - TWM_RY - 95 + m * .5 && y <= c.y) return true;   // (v268) the steps up to the gate
  if (dx < 64 - m && y > c.y - TWM_RY - 140 + m * .5 && y <= c.y - TWM_RY - 95 + m * .5) return true;   // (v271) and on into the doorway itself (the door's width)
  return dx <= a && dy <= b && dx / a + dy / b <= 2 - TWZ_K; }
const twzPath = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
function twzHall(){
  const T0 = twmT(), c = twmC(), st = twmStairs(), en = twmEntry(); let sd = 4242 + TWM.tier * 97; const r = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  const g = terr.getContext('2d'); g.save(); g.setTransform(TS, 0, 0, TS, 0, 0);
  const a = TWM_RX, b = TWM_RY, oct = twzOct(c);
  // the mist below and all round (the zone's sky, glowing up from the depths)
  const FW = Math.max(W, terr.width / TS), FH = Math.max(H, terr.height / TS);   // the whole canvas: no piece of the last map left at the far zoom
  const sky = g.createLinearGradient(0, 0, 0, FH); sky.addColorStop(0, T0.sky[0]); sky.addColorStop(1, T0.sky[1]); g.fillStyle = sky; g.fillRect(0, 0, FW, FH);
  if (T0.stars) for (let i = 0; i < 220; i++){ g.fillStyle = `rgba(255,255,255,${.3 + r() * .6})`; g.fillRect(r() * W, r() * H, 1.6, 1.6); }
  if (T0.embers) for (let i = 0; i < 140; i++){ g.fillStyle = `rgba(255,${100 + r() * 100 | 0},40,${.3 + r() * .5})`; g.beginPath(); g.arc(r() * W, r() * H, 1 + r() * 2, 0, 7); g.fill(); }
  twzSky(g, T0, r);
  for (let i = 0; i < 30; i++){ const y = H * (.55 + r() * .45); g.fillStyle = `rgba(${T0.glow},${.05 + r() * .07})`; g.beginPath(); g.ellipse(r() * W, y, 140 + r() * 180, 26 + r() * 24, 0, 0, 7); g.fill(); }
  // the platform's underside under the front edges: courses of stone falling away into the mist
  const front = [oct[3], oct[4], oct[5], oct[6]];
  g.save(); g.beginPath(); g.moveTo(front[0][0], front[0][1]); for (const p of front) g.lineTo(p[0], p[1]); for (let i = front.length - 1; i >= 0; i--) g.lineTo(front[i][0] + (front[i][0] - c.x) * -.06, front[i][1] + 190); g.closePath();
  g.fillStyle = T0.wall[1]; g.fill(); g.clip();
  for (let row = 0; row < 9; row++) for (let x = c.x - a - 40 + (row % 2) * 22; x < c.x + a + 40; x += 44){ g.fillStyle = r() < .5 ? T0.wall[0] : T0.wall[1]; g.globalAlpha = .7; g.fillRect(x + 1, c.y + b * (1 - TWZ_K) + row * 22 + 1, 42, 20); g.globalAlpha = 1; }
  const sh = g.createLinearGradient(0, c.y + b - 60, 0, c.y + b + 190); sh.addColorStop(0, 'rgba(0,0,0,.1)'); sh.addColorStop(1, `rgba(${T0.glow},.35)`); g.fillStyle = sh; g.fillRect(0, c.y, W, b + 200);
  g.restore();
  // banners hanging off the front edges over the drop
  for (const t of [.18, .38, .62, .82]){ const p = t < .5 ? [oct[5][0] + (oct[6][0] - oct[5][0]) * (t / .5 * .9 + .05), oct[5][1] + (oct[6][1] - oct[5][1]) * (t / .5 * .9 + .05)] : [oct[4][0] + (oct[3][0] - oct[4][0]) * ((t - .5) / .5 * .9 + .05), oct[4][1] + (oct[3][1] - oct[4][1]) * ((t - .5) / .5 * .9 + .05)];
    g.save(); g.translate(p[0], p[1] + 14); twzBanner(g, 30, 90, T0.carpet, T0.acc); g.restore(); }
  // the back wall: a band of stone with arches along the three back edges
  const back = [oct[7], oct[0], oct[1], oct[2]];
  g.save(); g.beginPath(); g.moveTo(back[0][0], back[0][1]); for (const p of back) g.lineTo(p[0], p[1]); for (let i = back.length - 1; i >= 0; i--) g.lineTo(back[i][0], back[i][1] - 170); g.closePath();
  const bw = g.createLinearGradient(0, c.y - b - 170, 0, c.y - b); bw.addColorStop(0, T0.wall[1]); bw.addColorStop(1, T0.wall[0]); g.fillStyle = bw; g.fill(); g.clip();
  for (let row = 0; row < 8; row++) for (let x = c.x - a + (row % 2) * 24; x < c.x + a; x += 48){ g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1.4; g.strokeRect(x, c.y - b - 170 + row * 22 + (Math.abs(x - c.x) > a * (1 - TWZ_K) ? (Math.abs(x - c.x) - a * (1 - TWZ_K)) / (a * TWZ_K) * b * TWZ_K : 0), 48, 22); }
  for (let i = 0; i < 8; i++){ const x = c.x - a * .62 + i * a * 1.24 / 7; if (Math.abs(x - c.x) < 90) continue; const y = c.y - b - 30;
    g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.moveTo(x - 20, y + 26); g.lineTo(x - 20, y - 40); g.arc(x, y - 40, 20, Math.PI, 0); g.lineTo(x + 20, y + 26); g.closePath(); g.fill();
    if (i % 2){ g.save(); g.translate(x, y - 64); twzBanner(g, 24, 70, T0.carpet, T0.acc); g.restore(); } else { g.fillStyle = `rgba(${T0.glow},.6)`; g.beginPath(); g.arc(x, y - 16, 6, 0, 7); g.fill(); } }
  twzWall2(g, T0, c, back);
  g.restore();
  // the floor: square tiles
  g.save(); twzPath(g, oct); g.clip();
  const tw = 26, th = 18;
  for (let y = c.y - b, row = 0; y < c.y + b; y += th, row++) for (let x = c.x - a - (row % 2) * tw / 2; x < c.x + a; x += tw){
    g.fillStyle = T0.floor[(r() * 3) | 0]; g.fillRect(x, y, tw, th);
    g.fillStyle = `rgba(${r() < .5 ? '255,255,255' : '0,0,0'},${r() * .07})`; g.fillRect(x, y, tw, th);
    g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(x + 1, y + 1, tw - 2, 1.5);
    g.strokeStyle = 'rgba(30,20,10,.3)'; g.lineWidth = 1; g.strokeRect(x + .5, y + .5, tw - 1, th - 1);
    if (r() < .04){ g.strokeStyle = 'rgba(30,20,10,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 4, y + 4); g.lineTo(x + 11, y + 9); g.lineTo(x + 18, y + 6); g.stroke(); }
    if (r() < (T0.fog ? .12 : .03)){ g.fillStyle = T0.fog ? '#5a8a3a' : '#7a8a4a'; for (let k = 0; k < 4; k++){ g.beginPath(); g.ellipse(x + 4 + r() * 18, y + th - 3, 1.5, 4, (r() - .5), 0, 7); g.fill(); } } }
  // the gold rune pattern in the middle, and four small inlays
  const gp = (x, y, w, h, lw) => { g.strokeStyle = T0.acc; g.lineWidth = lw; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + w, y); g.lineTo(x, y + h); g.lineTo(x - w, y); g.closePath(); g.stroke(); };
  g.globalAlpha = .7; gp(c.x, c.y, 300, 200, 2.5); gp(c.x, c.y, 282, 188, 1.2); gp(c.x, c.y, 200, 134, 2);
  g.strokeStyle = T0.acc; g.lineWidth = 1.6; g.beginPath(); g.ellipse(c.x, c.y, 150, 100, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(c.x, c.y, 120, 80, 0, 0, 7); g.stroke();
  for (let i = 0; i < 16; i++){ const t = i / 16 * 6.283; const x = c.x + Math.cos(t) * 150, y = c.y + Math.sin(t) * 100; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(c.x + Math.cos(t + .2) * 230, c.y + Math.sin(t + .2) * 150, c.x + Math.cos(t) * 260, c.y + Math.sin(t) * 172); g.stroke(); }
  for (const [dx, dy] of [[-.62, -.1], [.62, -.1], [-.42, .6], [.42, .6]]){ gp(c.x + dx * a, c.y + dy * b, 54, 36, 1.8); gp(c.x + dx * a, c.y + dy * b, 30, 20, 1.2); }
  g.globalAlpha = 1;
  { const lp = g.createRadialGradient(c.x, c.y, 10, c.x, c.y, 320); lp.addColorStop(0, `rgba(${T0.glow},.18)`); lp.addColorStop(1, `rgba(${T0.glow},0)`); g.fillStyle = lp; g.fillRect(c.x - 340, c.y - 240, 680, 480); }
  twzFloor(g, T0, c, r);
  // shade toward the edge
  { const e = g.createRadialGradient(c.x, c.y, a * .55, c.x, c.y, a * 1.1); e.addColorStop(0, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(20,10,30,.35)'); g.fillStyle = e; g.fillRect(c.x - a, c.y - b, a * 2, b * 2); }
  g.restore();
  // the ledge: a raised stone rim with a gold line
  g.strokeStyle = T0.rim; g.lineWidth = 16; twzPath(g, oct); g.stroke(); g.strokeStyle = T0.acc; g.lineWidth = 2.5; twzPath(g, twzOct(c, a - 12, b - 9)); g.stroke();
  // the way up at the back: steps to a glowing gate under a gold Thai gable (floor 100: the throne)
  if (T0.throne) twzThrone(g, T0, st); else {
    for (let k = 0; k < 5; k++){ const y = st.y + 10 - k * 14, w = 80 - k * 5; g.fillStyle = k % 2 ? T0.wall[0] : T0.floor[2]; g.fillRect(st.x - w, y - 14, w * 2, 14); g.fillStyle = T0.acc; g.fillRect(st.x - w, y - 14, w * 2, 2); }
    const gy = st.y - 60, gl = g.createLinearGradient(0, gy - 120, 0, gy); gl.addColorStop(0, `rgba(${T0.glow},.95)`); gl.addColorStop(1, `rgba(${T0.glow},.45)`);
    g.fillStyle = T0.wall[1]; g.fillRect(st.x - 66, gy - 140, 132, 140);
    g.fillStyle = gl; g.beginPath(); g.moveTo(st.x - 40, gy); g.lineTo(st.x - 40, gy - 96); g.quadraticCurveTo(st.x, gy - 140, st.x + 40, gy - 96); g.lineTo(st.x + 40, gy); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 6; k++) g.fillRect(st.x - 30 + k * 12, gy - 90 + (k % 3) * 8, 2, 80);
    g.strokeStyle = T0.acc; g.lineWidth = 5; g.beginPath(); g.moveTo(st.x - 46, gy); g.lineTo(st.x - 46, gy - 98); g.quadraticCurveTo(st.x, gy - 148, st.x + 46, gy - 98); g.lineTo(st.x + 46, gy); g.stroke();
    g.fillStyle = T0.acc; g.beginPath(); g.moveTo(st.x - 76, gy - 120); g.lineTo(st.x, gy - 196); g.lineTo(st.x + 76, gy - 120); g.lineTo(st.x + 62, gy - 120); g.lineTo(st.x, gy - 180); g.lineTo(st.x - 62, gy - 120); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(st.x - 4, gy - 194); g.lineTo(st.x, gy - 214); g.lineTo(st.x + 4, gy - 194); g.closePath(); g.fill();
    for (const d of [-1, 1]){ g.fillStyle = T0.acc; g.beginPath(); g.moveTo(st.x + d * 76, gy - 120); g.quadraticCurveTo(st.x + d * 92, gy - 130, st.x + d * 88, gy - 148); g.lineTo(st.x + d * 80, gy - 126); g.closePath(); g.fill();
      g.fillStyle = T0.wall[0]; g.fillRect(st.x + d * 56 - 8, gy - 120, 16, 120); g.fillStyle = T0.acc; for (const yy of [gy - 118, gy - 60, gy - 6]) g.fillRect(st.x + d * 56 - 9, yy, 18, 4); } }
  // the stair down at the front, between two gold-capped posts
  for (let k = 0; k < 6; k++){ const y = c.y + b - 6 + k * 16, w = 60 + k * 3; g.fillStyle = k % 2 ? T0.floor[1] : T0.floor[2]; g.fillRect(c.x - w, y, w * 2, 16); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(c.x - w, y + 14, w * 2, 2); }
  for (const d of [-1, 1]){ g.fillStyle = T0.wall[0]; g.fillRect(c.x + d * 72 - 10, c.y + b - 30, 20, 120); g.fillStyle = T0.acc; g.fillRect(c.x + d * 72 - 12, c.y + b - 32, 24, 5); g.fillRect(c.x + d * 72 - 12, c.y + b + 40, 24, 4); }
  g.restore();
}
/* the back wall's zone extras */
function twzWall2(g, T0, c, back){
  const span = (t, dy = 0) => { const n = back.length - 1, s = t * n, i = Math.min(n - 1, Math.floor(s)), f = s - i; return [back[i][0] + (back[i + 1][0] - back[i][0]) * f, back[i][1] + (back[i + 1][1] - back[i][1]) * f + dy]; };
  if (T0.vines) for (let i = 0; i < 34; i++){ const [x, y0] = span((i + .5) / 34, -170), len = 60 + (i * 37 % 100);
    g.strokeStyle = i % 3 ? '#2e4a22' : '#4a3a5a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + (i % 2 ? 10 : -10), y0 + len / 2, x, y0 + len); g.stroke();
    g.fillStyle = '#3e6a2a'; for (let k = 10; k < len; k += 16){ g.beginPath(); g.ellipse(x + (k % 32 ? 4 : -4), y0 + k, 4, 2.4, .6, 0, 7); g.fill(); } }
  if (T0.horns) for (let i = 0; i < 6; i++){ const [x, y] = span((i + .5) / 6, -130);
    g.fillStyle = '#e8dcc8'; for (const d of [-1, 1]){ g.beginPath(); g.moveTo(x + d * 6, y); g.quadraticCurveTo(x + d * 26, y - 8, x + d * 20, y - 34); g.quadraticCurveTo(x + d * 16, y - 12, x + d * 2, y + 4); g.closePath(); g.fill(); }
    g.fillStyle = '#2a1a1a'; g.beginPath(); g.arc(x, y + 8, 9, 0, 7); g.fill(); g.fillStyle = '#ff5a2a'; g.fillRect(x - 5, y + 5, 3, 3); g.fillRect(x + 2, y + 5, 3, 3); }
  if (T0.drapes) for (let i = 0; i < 8; i++){ const [x, y] = span((i + .5) / 8, -165);
    g.fillStyle = T0.carpet; g.beginPath(); g.moveTo(x - 34, y); g.quadraticCurveTo(x, y + 40, x + 34, y); g.lineTo(x + 34, y + 8); g.quadraticCurveTo(x, y + 50, x - 34, y + 8); g.closePath(); g.fill(); g.fillStyle = T0.acc; g.fillRect(x - 36, y - 3, 72, 4); }
}
/* the props of the hall (in place of the round hall's) */
function twzBuild(){
  const T0i = TWM.tier, T0 = TWM_TIERS[T0i], c = twmC(), st = twmStairs(), en = twmEntry(), oct = twzOct(c, TWM_RX - 30, TWM_RY - 22);
  twzHall();
  // square pillars at the corners and along the sides (none in front of the gate or the front stair)
  for (let i = 0; i < 8; i++){ const p = oct[i], q = oct[(i + 1) % 8];
    for (const t of [0, .5]){ const x = Math.round(p[0] + (q[0] - p[0]) * t), y = Math.round(p[1] + (q[1] - p[1]) * t); if (Math.abs(x - c.x) < 150) continue; addProp('twpillar', x, y, T0i); } }
  // braziers on pedestals: by the gate, by the front stair, and four round the rune
  for (const d of [-1, 1]){ addProp('twbrazier', st.x + d * 110, st.y + 18, T0i); addProp('twbrazier', c.x + d * 120, en.y + 40, T0i);
    addProp('twbrazier', Math.round(c.x + d * TWM_RX * .5), Math.round(c.y - TWM_RY * .36), T0i); addProp('twbrazier', Math.round(c.x + d * TWM_RX * .62), Math.round(c.y + TWM_RY * .38), T0i); }
  // glowing crystals in the corners, barrels and crates by the walls
  for (const d of [-1, 1]){ addProp('twcrystal', Math.round(c.x + d * TWM_RX * .78), Math.round(c.y - TWM_RY * .6), T0i); addProp('twcrystal', Math.round(c.x + d * TWM_RX * .86), Math.round(c.y + TWM_RY * .55), T0i);
    addProp('twbarrel', Math.round(c.x + d * TWM_RX * .66), Math.round(c.y - TWM_RY * .68), T0i); addProp('twcrate', Math.round(c.x + d * TWM_RX * .74), Math.round(c.y + TWM_RY * .74), T0i); }
  if (T0.statues) for (const d of [-1, 1]) addProp('twyaksha', st.x + d * 190, st.y + 40, T0i);
  if (T0.trees) for (const [dx, dy] of [[-.45, -.3], [.45, -.3], [-.3, .45], [.3, .45]]) addProp('twdeadtree', Math.round(c.x + dx * TWM_RX), Math.round(c.y + dy * TWM_RY), T0i);
  // the edge: stones you cannot pass all round the platform
  const edge = twzOct(c, TWM_RX + 26, TWM_RY + 18);
  for (let i = 0; i < 8; i++){ const p = edge[i], q = edge[(i + 1) % 8], n = Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 26);
    for (let k = 0; k < n; k++){ const ox = p[0] + (q[0] - p[0]) * k / n, oy = p[1] + (q[1] - p[1]) * k / n; if (oy < c.y - TWM_RY && Math.abs(ox - c.x) < 125) continue; obstacles.push({x:ox, y:oy, r:30, twEdge:true}); } }   // (v271) a gap for the steps
  for (let k = -3; k <= 3; k++) obstacles.push({x:st.x + k * 34, y:st.y - 50, r:22, twEdge:true});   // the gate wall, behind the door's sill
}
/* square pillars banded with gold; braziers on square pedestals; barrels; crates */
PROP_TYPES.twpillar = (seed, v = 0) => { const T0 = TWM_TIERS[v % TWM_TIERS.length];
  return makeProp({w:64, h:170, ax:32, ay:162, seed, shadow:[24, 8], collide:20, paint(g){
    g.fillStyle = T0.wall[1]; g.fillRect(-24, -16, 48, 16); g.fillStyle = T0.acc; g.fillRect(-24, -18, 48, 4);                                     // base
    const gr = g.createLinearGradient(-18, 0, 18, 0); gr.addColorStop(0, T0.wall[1]); gr.addColorStop(.35, T0.wall[0]); gr.addColorStop(1, T0.wall[1]); g.fillStyle = gr; g.fillRect(-18, -140, 36, 124);
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1.2; for (let y = -132; y < -18; y += 16) g.strokeRect(-18, y, 36, 16);                                        // stone courses
    for (const y of [-40, -100]){ g.fillStyle = T0.acc; g.fillRect(-20, y, 40, 8); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-20, y + 6, 40, 2); g.fillStyle = T0.carpet; g.fillRect(-4, y + 1, 8, 6); }
    g.fillStyle = T0.wall[0]; g.fillRect(-24, -152, 48, 12); g.fillStyle = T0.acc; g.fillRect(-26, -156, 52, 4); g.fillStyle = T0.wall[1]; g.fillRect(-22, -162, 44, 6); }}); };
PROP_TYPES.twbrazier = (seed, v = 0) => { const T0 = TWM_TIERS[v % TWM_TIERS.length];
  return makeProp({w:46, h:80, ax:23, ay:74, seed, shadow:[15, 5], collide:12, glow:[0, -62, 60], paint(g){
    g.fillStyle = T0.wall[1]; g.fillRect(-13, -36, 26, 36); g.fillStyle = T0.wall[0]; g.fillRect(-13, -36, 9, 36); g.fillStyle = T0.acc; g.fillRect(-15, -38, 30, 4); g.fillRect(-15, -4, 30, 4);
    g.fillStyle = T0.acc; g.beginPath(); g.moveTo(-15, -40); g.lineTo(15, -40); g.lineTo(10, -52); g.lineTo(-10, -52); g.closePath(); g.fill(); g.fillStyle = '#5a3a14'; g.fillRect(-10, -52, 20, 3);
    twmFire(g, 0, -52, 1.2, 0); }}); };
PROP_TYPES.twbarrel = (seed, v = 0) => makeProp({w:40, h:46, ax:20, ay:40, seed, shadow:[14, 5], collide:12, paint(g){
  for (const [dx, dy] of [[-8, 0], [9, 2]]){ g.fillStyle = '#7a4a26'; g.beginPath(); g.ellipse(dx, dy - 15, 10, 15, 0, 0, 7); g.fill(); g.fillStyle = '#5a3418'; g.fillRect(dx - 10, dy - 24, 20, 3); g.fillRect(dx - 10, dy - 9, 20, 3); g.fillStyle = '#9a6a3a'; g.beginPath(); g.ellipse(dx, dy - 29, 8, 3, 0, 0, 7); g.fill(); } void v; }});
PROP_TYPES.twcrate = (seed, v = 0) => makeProp({w:44, h:44, ax:22, ay:38, seed, shadow:[16, 5], collide:13, paint(g){
  for (const [dx, dy, s] of [[-6, 0, 1], [10, -18, .8]]){ const w = 26 * s; g.fillStyle = '#8a5a2c'; g.fillRect(dx - w / 2, dy - w, w, w); g.strokeStyle = '#4a2c12'; g.lineWidth = 2; g.strokeRect(dx - w / 2, dy - w, w, w);
    g.beginPath(); g.moveTo(dx - w / 2, dy - w); g.lineTo(dx + w / 2, dy); g.stroke(); } void v; }});
