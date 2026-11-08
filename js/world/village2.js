/* VAYRATHEN — js/world/village2.js — Aren as a small Thai village where every NPC has a place of their own (v58)
   How it is laid out (the usual rules for an RPG hub town):
   · two streets cross in the middle (north–south from the temple to the market, east–west between the two field
     gates); you wake on the crossing, so every errand starts there and nothing stands in the way
   · the most used services sit closest to the crossing: the shop and the smith flank the temple court, the healer
     and the bank are one step away
   · trades are grouped: the craft corner (smith, smelter, gem driller) in the east, services (shop, healer, bank,
     tailor, storyteller) in the west, the market (buyer, cook, herbalist, beast keeper) south, adventure (army tent,
     dungeon gate) north beside the temple
   · each NPC stands at the front of their own little yard, inside a low wooden fence with an opening on the street,
     in front of a building that shows the trade at a glance: an anvil and a forge fire for the smith, a kiln for the
     smelter, a wok on a charcoal stove for the cook, bolts of cloth for the tailor, a strongbox for the banker…
     and a sign in the gable with the trade's symbol */
'use strict';

/* building variants: roof colours, awning, the gable sign and what is on the counter and beside the house */
const VSHOP = [
  {k:'smith',    ico:'⚒️', roof:['#4a4f5a', '#6e7684', '#2c3038'], awn:['#8a2a20', '#c8a060']},
  {k:'forger',   ico:'🔥', roof:['#7a3a1e', '#a85a32', '#4e2210'], awn:['#5a4a3a', '#d8a050']},
  {k:'driller',  ico:'💎', roof:['#2f5f8a', '#4f86b8', '#1c3a58'], awn:['#3a7ab0', '#e8f0f8']},
  {k:'shop',     ico:'🧪', roof:[PAL.roofM, PAL.roofL, PAL.roofD], awn:['#c0392b', '#f4ecdb']},
  {k:'herbal',   ico:'🌿', roof:['#3d6e4e', '#5b9466', '#244a32'], awn:['#4a8a4a', '#f0e8c8']},
  {k:'cook',     ico:'🍲', roof:['#a8541e', '#d07a3a', '#6a3010'], awn:['#e8a020', '#fff4d0']},
  {k:'tailor',   ico:'🧵', roof:['#7a3a7a', '#a85aa8', '#4a1e4a'], awn:['#d86aa8', '#fff0f6']},
  {k:'banker',   ico:'💰', roof:['#9c6c1e', '#e3b04b', '#5e4010'], awn:['#2a4a8a', '#f0d070']},
  {k:'registrar',ico:'📜', roof:['#2a4a6a', '#4a7aa0', '#16283c'], awn:['#2a4a6a', '#e8d8a8']},
  {k:'festival', ico:'🏮', roof:['#c0392b', '#e8604a', '#7a1a12'], awn:['#f0c040', '#e84a6a']},
  {k:'trader',   ico:'⚖️', roof:['#6e4a2e', '#9a6c42', '#4a2f1d'], awn:['#2a7a5a', '#f4ecdb']},
  {k:'beast',    ico:'🐾', roof:['#8a6a2a', '#b8943a', '#5a4418'], awn:['#7a5a2a', '#e8d098']}
];
const VSHOP_I = Object.fromEntries(VSHOP.map((v, i) => [v.k, i]));

/* small painted pieces shared by the buildings */
const vgBottle = (g, x, y, c, s = 1) => { g.fillStyle = c; ov(g, x, y - 2.2 * s, 1.9 * s, 2.2 * s); g.fill(); g.fillRect(x - .6 * s, y - 5.6 * s, 1.2 * s, 2 * s); g.fillStyle = 'rgba(255,255,255,.55)'; ov(g, x - .7 * s, y - 2.8 * s, .5 * s, .8 * s); g.fill(); g.fillStyle = '#8a5a2e'; g.fillRect(x - .7 * s, y - 6.4 * s, 1.4 * s, .9 * s); };
const vgSack = (g, x, y, c = '#d8c08a') => { g.fillStyle = c; pv(g, [x - 5, y, x + 5, y, x + 4.4, y - 7, x + 2, y - 9, x - 2, y - 9, x - 4.4, y - 7]); g.fill(); g.fillStyle = 'rgba(80,50,20,.35)'; g.fillRect(x - 2.4, y - 8.4, 4.8, .8); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x - 3.6, y - 6, 1, 4); };
const vgCrate = (g, x, y, w = 10, h = 8) => { plank(g, x - w / 2, y - h, w, h, PAL.teakL, PAL.teakH, PAL.teakD); g.strokeStyle = PAL.teakD; g.lineWidth = .5; g.beginPath(); g.moveTo(x - w / 2, y - h); g.lineTo(x + w / 2, y); g.moveTo(x - w / 2, y - h / 2); g.lineTo(x + w / 2, y - h / 2); g.stroke(); };
const vgGem = (g, x, y, c, l) => { g.fillStyle = c; pv(g, [x, y - 4, x + 2.6, y - 1.6, x, y + .6, x - 2.6, y - 1.6]); g.fill(); g.fillStyle = l; pv(g, [x, y - 4, x + 1, y - 1.8, x - 1.4, y - 1.6]); g.fill(); };
const vgSteam = (g, x, y, n = 3) => { for (let i = 0; i < n; i++){ g.fillStyle = `rgba(255,255,255,${.5 - i * .12})`; ov(g, x + Math.sin(i * 1.7) * 2.4, y - 4 - i * 4.6, 2.6 + i * .8, 2 + i * .6); g.fill(); } };
function vgFire(g, x, y, s = 1){
  g.fillStyle = 'rgba(255,140,40,.35)'; ov(g, x, y - 3 * s, 7 * s, 5 * s); g.fill();
  g.fillStyle = '#e8501e'; pv(g, [x - 4 * s, y, x - 2.6 * s, y - 5 * s, x - 1 * s, y - 3 * s, x, y - 8 * s, x + 1.4 * s, y - 3.6 * s, x + 2.8 * s, y - 6 * s, x + 4 * s, y]); g.fill();
  g.fillStyle = '#ffc040'; pv(g, [x - 2.2 * s, y, x - 1 * s, y - 3.4 * s, x, y - 5.4 * s, x + 1.2 * s, y - 3 * s, x + 2.2 * s, y]); g.fill();
  g.fillStyle = '#fff4b0'; ov(g, x, y - 1.2 * s, 1 * s, 1.4 * s); g.fill();
}
function vgLantern(g, x, y, c){ g.strokeStyle = '#5a3a1a'; g.lineWidth = .4; g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x, y - 2.6); g.stroke();
  g.fillStyle = c; ov(g, x, y, 2.4, 2.8); g.fill(); g.fillStyle = 'rgba(255,240,180,.55)'; ov(g, x - .7, y - .6, .8, 1.2); g.fill(); g.fillStyle = '#e3b04b'; g.fillRect(x - 1.2, y - 2.9, 2.4, .7); g.fillRect(x - 1.2, y + 2.3, 2.4, .7); }

/* what is on the shelves behind the counter (inside the dark shop front: x −30…30, y −50…−28) */
const VG_SHELF = {
  smith(g, rng){ for (let i = 0; i < 4; i++){ const x = -24 + i * 6; g.fillStyle = '#c8ccd4'; g.fillRect(x - .7, -48, 1.4, 15); g.fillStyle = '#e8ecf4'; g.fillRect(x - .7, -48, .5, 15); g.fillStyle = PAL.gold; g.fillRect(x - 2, -34, 4, 1); g.fillStyle = '#5a3a1a'; g.fillRect(x - .6, -33, 1.2, 3.4); }
    for (const [x, c] of [[8, '#8a2a20'], [20, '#2a4a8a']]){ g.fillStyle = '#9aa0a8'; ov(g, x, -40, 5.4, 6.4); g.fill(); g.fillStyle = c; ov(g, x, -40, 4.2, 5.2); g.fill(); g.fillStyle = PAL.gold; ov(g, x, -40, 1.4, 1.6); g.fill(); } },
  forger(g){ for (let i = 0; i < 3; i++) for (let j = 0; j <= i; j++){ g.fillStyle = j % 2 ? '#c8a040' : '#e3b04b'; pv(g, [-20 + i * 9 + j * 2, -30 - j * 3.4, -14 + i * 9 + j * 2, -30 - j * 3.4, -15 + i * 9 + j * 2, -33.2 - j * 3.4, -19 + i * 9 + j * 2, -33.2 - j * 3.4]); g.fill(); }
    g.fillStyle = '#3a2a22'; g.fillRect(8, -48, 18, 18); vgFire(g, 17, -31, 1.1); g.fillStyle = '#6a4a3a'; g.fillRect(7, -49, 20, 2); },
  driller(g){ const C = [['#e84a6a', '#ffb0c0'], ['#3ab0e8', '#c0ecff'], ['#4ac080', '#c0f0d0'], ['#c080f0', '#ecd0ff'], ['#f0c040', '#fff0a0']];
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++){ const c = C[(i + r * 2) % 5]; vgGem(g, -24 + i * 9.4, -36 + r * -8, c[0], c[1]); } g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-28, -34.6, 56, .6); },
  shop(g){ const C = ['#d8281e', '#2a6ad8', '#d8281e', '#40a040', '#2a6ad8', '#e8a020']; for (let r = 0; r < 2; r++){ g.fillStyle = PAL.teakD; g.fillRect(-28, -39 + r * 9, 56, 1.2); for (let i = 0; i < 8; i++) vgBottle(g, -24 + i * 6.8, -39.4 + r * 9, C[(i + r) % C.length], .95); } },
  herbal(g){ for (let i = 0; i < 6; i++){ const x = -24 + i * 9.4; g.strokeStyle = '#5a3a1a'; g.lineWidth = .4; g.beginPath(); g.moveTo(x, -50); g.lineTo(x, -46); g.stroke();
      g.fillStyle = i % 2 ? '#4a8a3a' : '#7ab04a'; pv(g, [x - 3, -46, x + 3, -46, x + 1.4, -36, x - 1.4, -36]); g.fill(); g.fillStyle = '#c8a050'; g.fillRect(x - 1.6, -46.6, 3.2, 1.2); }
    for (let i = 0; i < 5; i++){ g.fillStyle = '#9a6a3a'; ov(g, -20 + i * 10, -31.6, 3.4, 2.2); g.fill(); g.fillStyle = ['#c8a050', '#6a8a3a', '#a04a3a', '#e8d080', '#4a6a2a'][i]; ov(g, -20 + i * 10, -32.6, 2.6, 1.2); g.fill(); } },
  cook(g){ for (const [x, c] of [[-20, '#5a5a5a'], [-6, '#7a4a2a'], [8, '#5a5a5a']]){ g.fillStyle = c; ov(g, x, -38, 5, 3.4); g.fill(); g.fillStyle = '#9a9a9a'; g.fillRect(x - 5.4, -41.6, 10.8, 1.2); }
    g.strokeStyle = '#c8c8c8'; g.lineWidth = .6; for (let i = 0; i < 4; i++){ g.beginPath(); g.moveTo(16 + i * 3, -50); g.lineTo(16 + i * 3, -42); g.stroke(); } g.fillStyle = '#8a5a2e'; for (let i = 0; i < 4; i++) g.fillRect(15.4 + i * 3, -42, 1.2, 3); },
  tailor(g){ const C = ['#e84a6a', '#f0c040', '#3a8ad8', '#4ac080', '#c080f0', '#f08a3a', '#f4ecdb'];
    for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++){ const x = -25 + i * 8.2, y = -42 + r * 9; g.fillStyle = C[(i + r * 3) % 7]; ov(g, x, y, 3.6, 3.4); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; ov(g, x - 1, y - 1, 1.4, 1.2); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = .3; g.beginPath(); g.arc(x, y, 2, 0, 6); g.stroke(); } },
  banker(g){ plank(g, -26, -48, 22, 18, '#4a4f5a', '#6e7684', '#2c3038'); g.fillStyle = '#9aa0a8'; g.beginPath(); g.arc(-15, -39, 4.4, 0, 7); g.fill(); g.fillStyle = '#4a4f5a'; g.beginPath(); g.arc(-15, -39, 2.6, 0, 7); g.fill(); g.strokeStyle = PAL.gold; g.lineWidth = .7; g.strokeRect(-25.4, -47.4, 20.8, 16.8);
    for (let i = 0; i < 4; i++) for (let k = 0; k < 3 + i % 2; k++){ g.fillStyle = k % 2 ? '#c89a2a' : PAL.gold; ov(g, 4 + i * 6, -31 - k * 1.6, 2.6, 1); g.fill(); } },
  registrar(g){ plank(g, -24, -49, 48, 18, '#8a6a3a', '#b8945a', '#5a4020'); for (const [x, y, w, h, c] of [[-21, -47, 10, 12, '#f4ecdb'], [-8, -46, 8, 10, '#e8d8a8'], [3, -47, 10, 7, '#f4ecdb'], [3, -38.6, 9, 6, '#fff0c0'], [15, -46, 7, 13, '#e8d8a8']]){ g.fillStyle = c; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(60,40,20,.5)'; for (let k = 2; k < h - 1; k += 2) g.fillRect(x + 1, y + k, w - 2.4, .4); g.fillStyle = '#c0392b'; ov(g, x + w / 2, y + .6, .8, .8); g.fill(); } },
  festival(g){ for (let i = 0; i < 7; i++) vgLantern(g, -24 + i * 8, -42 + (i % 2) * 3, ['#e84a3a', '#f0c040', '#e84a6a'][i % 3]); g.fillStyle = '#f4ecdb'; for (let i = 0; i < 5; i++){ g.fillRect(-20 + i * 10, -33, 5, 3.4); g.fillStyle = ['#e84a6a', '#3a8ad8', '#4ac080', '#f0c040', '#c080f0'][i]; g.fillRect(-19.4 + i * 10, -32.4, 3.8, 2.2); g.fillStyle = '#f4ecdb'; } },
  trader(g){ for (let i = 0; i < 4; i++) vgSack(g, -21 + i * 9, -29, ['#d8c08a', '#c8a870', '#e0d0a0', '#b89a60'][i]); g.fillStyle = '#e8c040'; for (let i = 0; i < 6; i++){ ov(g, -18 + i * 7, -44, 2, 2); g.fill(); } g.fillStyle = '#c83a3a'; for (let i = 0; i < 5; i++){ ov(g, -14.6 + i * 7, -47.4, 1.8, 1.8); g.fill(); g.fillStyle = i % 2 ? '#c83a3a' : '#7ab04a'; } },
  beast(g){ g.fillStyle = PAL.strawD; ov(g, -14, -33, 14, 5); g.fill(); for (let i = 0; i < 40; i++){ g.strokeStyle = i % 2 ? PAL.straw : PAL.strawL; g.lineWidth = .5; const x = -26 + i * .6; g.beginPath(); g.moveTo(x, -30); g.lineTo(x + (i % 3 - 1) * 1.4, -37 - (i % 4)); g.stroke(); }
    g.strokeStyle = '#7a5a2a'; g.lineWidth = 1.2; g.beginPath(); g.arc(14, -40, 6, Math.PI * .1, Math.PI * .9, true); g.stroke(); g.fillStyle = '#c8c0b0'; g.fillRect(9, -49, 10, 2); }
};
/* what stands beside the house (x ±40…58): the trade's tools in the yard */
const VG_SIDE = {
  smith(g, rng){   // anvil on a stump, hammer, quench barrel; a forge with a fire on the other side
    plank(g, 40, -8, 12, 8, PAL.barkM, PAL.barkL, PAL.barkD); g.fillStyle = '#3a3e46'; pv(g, [38, -8, 54, -8, 52, -11, 56, -14, 40, -14, 36, -11.6]); g.fill(); g.fillStyle = '#6e7684'; g.fillRect(38, -14, 16, 1.2);
    g.fillStyle = '#5a3a1a'; g.save(); g.translate(48, -15); g.rotate(-.5); g.fillRect(0, -1, 9, 1.4); g.fillStyle = '#4a4f5a'; g.fillRect(7.6, -3, 3.2, 5); g.restore();
    blocks(g, -58, -20, 15, 20, 5, 3.4, ['#9a5a3a', '#b86a42', '#8a4a2e'], '#5a3020', rng); g.fillStyle = '#2a1410'; g.fillRect(-54.6, -14, 8.2, 8); vgFire(g, -50.5, -6.4, .9);
    g.fillStyle = '#6a4a2a'; pv(g, [-56, -20, -45, -20, -48, -28, -53, -28]); g.fill(); g.fillStyle = 'rgba(120,120,120,.5)'; ov(g, -50, -33, 3, 2.2); g.fill(); },
  forger(g, rng){   // a brick kiln with a chimney and a glowing mouth, a pile of ore
    blocks(g, -58, -30, 18, 30, 5, 3.4, ['#9a5a3a', '#b86a42', '#8a4a2e'], '#5a3020', rng); g.fillStyle = '#2a1410'; g.beginPath(); g.arc(-49, -6, 4.6, Math.PI, 0); g.fill(); g.fillRect(-53.6, -6, 9.2, 6); vgFire(g, -49, -1, .9);
    plank(g, -53, -44, 8, 14, '#7a4a2e', '#9a6a42', '#4a2a1a'); g.fillStyle = 'rgba(110,110,110,.55)'; ov(g, -48, -48, 3.4, 2.4); g.fill(); ov(g, -45, -53, 4.2, 3); g.fill();
    for (let i = 0; i < 6; i++){ g.fillStyle = i % 2 ? '#6e6a62' : '#8d8a80'; ov(g, 44 + (i % 3) * 4, -2 - Math.floor(i / 3) * 3, 3, 2.2); g.fill(); } g.fillStyle = '#c8a040'; ov(g, 48, -6.4, 1.4, 1); g.fill(); },
  driller(g){   // a treadle grinding wheel on a bench
    plank(g, 38, -12, 18, 3, PAL.teakM, PAL.teakL, PAL.teakD); for (const x of [39, 53]) plank(g, x, -9, 2, 9, PAL.teakD, PAL.teakM, PAL.barkD);
    g.fillStyle = '#9aa0a8'; g.beginPath(); g.arc(47, -18, 6, 0, 7); g.fill(); g.fillStyle = '#c8ccd4'; g.beginPath(); g.arc(47, -18, 3.6, 0, 7); g.fill(); g.fillStyle = '#4a4f5a'; g.beginPath(); g.arc(47, -18, 1, 0, 7); g.fill();
    vgGem(g, -48, -2, '#e84a6a', '#ffb0c0'); vgGem(g, -43, -1, '#3ab0e8', '#c0ecff'); vgCrate(g, -52, 0, 9, 7); },
  shop(g){ vgCrate(g, 46, 0, 11, 9); vgCrate(g, 49, -9, 9, 7); for (let i = 0; i < 3; i++) vgBottle(g, -50 + i * 4, 0, ['#d8281e', '#2a6ad8', '#40a040'][i], 1.2); ong(g, -42, 0, .9); },
  herbal(g){   // a drying rack of herbs and a stone mortar
    for (const x of [38, 56]) plank(g, x - .8, -26, 1.6, 26, PAL.barkM, PAL.barkL, PAL.barkD); g.fillStyle = PAL.barkM; g.fillRect(37, -26, 20, 1.4); g.fillRect(37, -15, 20, 1.2);
    for (let i = 0; i < 5; i++){ g.fillStyle = i % 2 ? '#5a9a3a' : '#8ac05a'; pv(g, [39 + i * 3.6, -24.6, 41.6 + i * 3.6, -24.6, 40.8 + i * 3.6, -18, 39.8 + i * 3.6, -18]); g.fill(); }
    g.fillStyle = '#c8a050'; for (let i = 0; i < 9; i++) g.fillRect(38.4 + i * 2, -13.8, 1.2, 4);
    g.fillStyle = PAL.stoneD; pv(g, [-54, -7, -42, -7, -44, 0, -52, 0]); g.fill(); g.fillStyle = PAL.stone; ov(g, -48, -7, 6, 1.8); g.fill(); g.fillStyle = '#5a7a3a'; ov(g, -48, -7.2, 4, 1); g.fill(); g.fillStyle = PAL.stoneL; g.save(); g.translate(-46, -9); g.rotate(.5); g.fillRect(0, -1, 7, 2); g.restore(); },
  cook(g){   // a clay charcoal stove with a steaming wok, a low table with bowls
    g.fillStyle = '#8a4a28'; pv(g, [-56, -12, -42, -12, -44, 0, -54, 0]); g.fill(); g.fillStyle = '#b8683a'; g.fillRect(-56.6, -13.6, 15.2, 2); g.fillStyle = '#2a1410'; g.fillRect(-51.6, -7, 5.2, 4); vgFire(g, -49, -3.2, .6);
    g.fillStyle = '#2a2a2a'; g.beginPath(); g.ellipse(-49, -14, 9, 3.6, 0, 0, Math.PI); g.fill(); g.fillStyle = '#4a4a4a'; g.fillRect(-58.6, -14.6, 19.2, 1.2); g.fillStyle = '#e8a040'; ov(g, -49, -14.6, 6, 1.2); g.fill(); vgSteam(g, -49, -16, 3);
    plank(g, 38, -9, 18, 3, PAL.teakM, PAL.teakL, PAL.teakD); for (const x of [39, 53]) plank(g, x, -6, 2, 6, PAL.teakD, PAL.teakM, PAL.barkD);
    for (const x of [42, 48, 53]){ g.fillStyle = '#f4ecdb'; g.beginPath(); g.ellipse(x, -9.4, 2.4, 1.6, 0, 0, Math.PI); g.fill(); g.fillStyle = '#e88a3a'; ov(g, x, -9.6, 2, .5); g.fill(); } },
  tailor(g){   // a dress form in a festival dress, and a bench of folded cloth
    g.fillStyle = '#5a3a1a'; g.fillRect(-49.6, -6, 1.2, 6); g.fillRect(-53, -1, 8, 1.2);
    g.fillStyle = '#d86aa8'; pv(g, [-53, -6, -45, -6, -46, -16, -47, -22, -51, -22, -52, -16]); g.fill(); g.fillStyle = '#f0c040'; g.fillRect(-52.4, -16, 6.8, 1.4); g.fillStyle = '#e8d8c0'; ov(g, -49, -24, 2.4, 2); g.fill();
    plank(g, 38, -8, 18, 3, PAL.teakM, PAL.teakL, PAL.teakD); for (const x of [39, 53]) plank(g, x, -5, 2, 5, PAL.teakD, PAL.teakM, PAL.barkD);
    for (let i = 0; i < 3; i++){ g.fillStyle = ['#3a8ad8', '#f0c040', '#4ac080'][i]; g.fillRect(40, -10.6 - i * 2.4, 13, 2.2); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(40, -10.6 - i * 2.4, 13, .5); } },
  banker(g){   // an iron-bound strongbox and stacked coin bags
    plank(g, 38, -11, 18, 11, '#7a4a2a', '#9a6a42', '#4a2a1a'); g.fillStyle = '#4a4f5a'; g.fillRect(38, -11, 18, 2); g.fillRect(43, -11, 1.6, 11); g.fillRect(50, -11, 1.6, 11); g.fillStyle = PAL.gold; g.fillRect(46, -7, 2.4, 3);
    for (const [x, y] of [[-52, 0], [-45, 0], [-48.5, -6.4]]){ vgSack(g, x, y, '#c8a060'); g.fillStyle = PAL.gold; ov(g, x, y - 4, 1.4, 1.4); g.fill(); } },
  registrar(g){   // a notice board with quests pinned up
    for (const x of [38, 56]) plank(g, x - 1, -30, 2, 30, PAL.barkM, PAL.barkL, PAL.barkD); plank(g, 36, -30, 22, 15, PAL.teakM, PAL.teakL, PAL.teakD);
    for (const [x, y, c] of [[38, -28, '#f4ecdb'], [44.6, -27, '#fff0c0'], [51, -28.4, '#f4ecdb'], [40, -21, '#e8d8a8'], [48, -21.6, '#f4ecdb']]){ g.fillStyle = c; g.fillRect(x, y, 5, 5.6); g.fillStyle = 'rgba(60,40,20,.5)'; g.fillRect(x + .8, y + 1.6, 3.4, .4); g.fillRect(x + .8, y + 3, 2.6, .4); g.fillStyle = '#c0392b'; ov(g, x + 2.5, y + .4, .6, .6); g.fill(); }
    plank(g, 34, -32, 26, 2.4, PAL.roofM, PAL.roofL, PAL.roofD); },
  festival(g){   // a string of paper lanterns on poles and a flower urn
    for (const x of [38, 58]) plank(g, x - .8, -30, 1.6, 30, '#c0392b', '#e8604a', '#7a1a12'); g.strokeStyle = '#5a3a1a'; g.lineWidth = .4; g.beginPath(); g.moveTo(38, -29); g.quadraticCurveTo(48, -24, 58, -29); g.stroke();
    for (let i = 0; i < 4; i++) vgLantern(g, 41 + i * 5, -23.4 + Math.sin(i / 3 * Math.PI) * 2.4, ['#e84a3a', '#f0c040', '#e84a6a', '#f08a3a'][i]);
    g.fillStyle = '#c89a2a'; pv(g, [-54, -10, -44, -10, -45.4, 0, -52.6, 0]); g.fill(); for (let i = 0; i < 7; i++){ g.fillStyle = ['#e84a6a', '#f0c040', '#f4ecdb', '#e84a3a'][i % 4]; ov(g, -52 + i * 1.4, -12 - (i % 3) * 1.6, 1.6, 1.6); g.fill(); } },
  trader(g){   // a hanging balance scale and a stack of rice sacks
    plank(g, 46, -26, 1.6, 26, PAL.barkM, PAL.barkL, PAL.barkD); g.fillStyle = PAL.goldD; g.fillRect(39, -25, 16, 1); g.strokeStyle = PAL.goldD; g.lineWidth = .4;
    for (const x of [40, 54]){ g.beginPath(); g.moveTo(x, -24); g.lineTo(x - 2.4, -18); g.moveTo(x, -24); g.lineTo(x + 2.4, -18); g.stroke(); g.fillStyle = PAL.gold; g.beginPath(); g.ellipse(x, -18, 3, 1.2, 0, 0, Math.PI); g.fill(); }
    vgSack(g, -51, 0); vgSack(g, -42, 0, '#c8a870'); vgSack(g, -46.5, -8, '#e0d0a0'); },
  beast(g){   // a feed trough and a hay bale
    plank(g, 38, -7, 18, 7, PAL.teakM, PAL.teakL, PAL.teakD); g.fillStyle = '#c8a050'; ov(g, 47, -7, 8, 1.4); g.fill(); g.fillStyle = PAL.strawD; g.fillRect(-56, -9, 14, 9); g.fillStyle = PAL.straw; g.fillRect(-56, -9, 14, 2); g.fillStyle = '#8a6420'; g.fillRect(-52, -9, 1, 9); g.fillRect(-47, -9, 1, 9); }
};

Object.assign(PROP_TYPES, {
  /* a village shop / workshop (เรือนร้านค้า): stone plinth, teak walls, an open front with shelves of the trade,
     a plank counter, a striped awning, a tiled Thai gable with a round sign showing the trade's symbol */
  vshop: (seed, v = 0) => makeProp({w:124, h:110, ax:62, ay:100, seed, shadow:[50, 12], collide:30, glow:[0, -40, 62], paint(g, rng){   // glow: the shop front is lit at night
    const V = VSHOP[v] || VSHOP[0], T = V.roof, gold = [PAL.gold, PAL.goldL, PAL.goldD];
    // plinth and the walls
    plank(g, -42, -8, 84, 8, PAL.stone, PAL.stoneL, PAL.stoneD); g.fillStyle = 'rgba(0,0,0,.12)'; for (let x = -38; x < 40; x += 10) g.fillRect(x, -8, .5, 8);
    plank(g, -38, -62, 76, 54, PAL.teakM, PAL.teakL, PAL.teakD); for (let x = -36; x < 38; x += 5){ g.fillStyle = 'rgba(50,25,10,.25)'; g.fillRect(x, -62, .5, 54); } grain(g, -38, -62, 76, 54, rng, 18);
    // the open shop front, shelves and goods
    g.fillStyle = '#2a170c'; g.fillRect(-31, -52, 62, 26); g.fillStyle = 'rgba(255,220,150,.08)'; g.fillRect(-31, -52, 62, 4);
    (VG_SHELF[V.k] || VG_SHELF.shop)(g, rng);
    // counter with a board skirt
    plank(g, -36, -28, 72, 5, PAL.teakL, PAL.teakH, PAL.teakD); plank(g, -34, -23, 68, 15, PAL.teakM, PAL.teakL, PAL.teakD);
    for (let x = -30; x < 34; x += 8){ g.fillStyle = 'rgba(50,25,10,.3)'; g.fillRect(x, -23, .6, 15); }
    // posts
    for (const x of [-38, 35]) plank(g, x, -66, 3.4, 58, '#8a2a20', '#b8503a', '#5e1f19');
    // striped awning with a scalloped hem
    const n = 8, aw = V.awn; for (let i = 0; i < n; i++){ g.fillStyle = aw[i % 2]; pv(g, [-38 + i * 9.5, -64, -38 + (i + 1) * 9.5, -64, -42 + (i + 1) * 10.5, -55, -42 + i * 10.5, -55]); g.fill(); }
    for (let i = 0; i < n * 2; i++){ g.fillStyle = aw[Math.floor(i / 2) % 2]; g.beginPath(); g.arc(-42 + i * 5.25 + 2.62, -55, 2.62, 0, Math.PI); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-42, -55.5, 84, .8);
    // tiled gable roof with a carved panel, gilt barge boards, ช่อฟ้า and หางหงส์
    const ge = -66, ga = -96;
    for (const s of [-1, 1]){ roofBand(g, s * 50, ge + 2, 0, ga, 8, [T[2], T[1], '#1a1a1a'], 10); roofBand(g, s * 50, ge + 2, 0, ga, 6, T, 10); }
    g.fillStyle = PAL.teakD; pv(g, [-44, ge, 0, ga + 2, 44, ge]); g.fill(); g.save(); pv(g, [-44, ge, 0, ga + 2, 44, ge]); g.clip();
    for (let x = -44; x < 44; x += 4){ g.fillStyle = (x / 4) % 2 ? PAL.teakM : PAL.teakL; g.fillRect(x, ga, 3.4, 40); } g.restore();
    for (const s of [-1, 1]){ barge(g, s * 46, ge, 0, ga, 2, 7, gold); hangHong(g, s * 46, ge, s, PAL.gold); }
    chofa(g, 0, ga, 8, PAL.gold);
    // the round trade sign in the gable
    g.fillStyle = PAL.goldD; g.beginPath(); g.arc(0, -77, 9.4, 0, 7); g.fill(); g.fillStyle = '#fff6dc'; g.beginPath(); g.arc(0, -77, 8, 0, 7); g.fill();
    g.font = '10px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(V.ico, 0, -76.4); g.textBaseline = 'alphabetic';
    (VG_SIDE[V.k] || (() => {}))(g, rng);
  }}),
  /* a low wooden yard fence: v0 a run along the front (24 wide), v1 a post with a rail seen from the side */
  lowfence: (seed, v = 0) => makeProp({w:30, h:16, ax:15, ay:12, seed, collide:0, paint(g, rng){
    if (v === 1){ plank(g, -1.4, -10, 2.8, 10, PAL.teakM, PAL.teakL, PAL.teakD); g.fillStyle = PAL.teakD; g.fillRect(-1.6, -10.6, 3.2, 1); g.fillStyle = PAL.teakL; g.fillRect(-.8, -8, 1.6, 7); return; }
    for (const x of [-11, 0, 11]){ plank(g, x - 1.3, -10, 2.6, 10, PAL.teakM, PAL.teakL, PAL.teakD); g.fillStyle = PAL.teakD; pv(g, [x - 1.3, -10, x, -11.6, x + 1.3, -10]); g.fill(); }
    plank(g, -12.5, -8, 25, 1.8, PAL.teakL, PAL.teakH, PAL.teakD); plank(g, -12.5, -4, 25, 1.8, PAL.teakL, PAL.teakH, PAL.teakD);
  }}),
  /* the army tent (แม่ทัพ): a canvas tent with a striped top, a banner pole and a weapon rack */
  armytent: (seed) => makeProp({w:124, h:110, ax:62, ay:100, seed, shadow:[48, 12], collide:30, paint(g, rng){
    g.fillStyle = '#c8b890'; pv(g, [-44, 0, 44, 0, 30, -54, -30, -54]); g.fill(); g.fillStyle = '#e8dcb8'; pv(g, [-44, 0, -10, 0, -16, -54, -30, -54]); g.fill();
    g.fillStyle = '#2a1a10'; pv(g, [-12, 0, 12, 0, 6, -36, -6, -36]); g.fill(); g.fillStyle = '#8a2a20'; pv(g, [-12, 0, -4, 0, -2, -34, -6, -36]); g.fill(); pv(g, [12, 0, 4, 0, 2, -34, 6, -36]); g.fill();
    for (let i = 0; i < 6; i++){ g.fillStyle = i % 2 ? '#8a2a20' : '#e3b04b'; pv(g, [-30 + i * 10, -54, -20 + i * 10, -54, -16 + i * 10 - (i > 2 ? 8 : 0), -70, -16 + i * 10 - (i > 2 ? 8 : 0) - 4, -70]); g.fill(); }
    g.fillStyle = '#8a2a20'; pv(g, [-26, -70, 26, -70, 0, -84]); g.fill(); g.fillStyle = PAL.gold; g.fillRect(-1, -98, 2, 16); g.fillStyle = '#c0392b'; pv(g, [1, -98, 16, -94, 1, -89]); g.fill(); g.fillStyle = PAL.gold; ov(g, 6, -94, 1.6, 1.6); g.fill();
    for (let i = 0; i < 12; i++){ g.fillStyle = i % 2 ? '#8a2a20' : '#e3b04b'; g.beginPath(); g.arc(-30 + i * 5 + 2.5, -54, 2.5, 0, Math.PI); g.fill(); }
    // weapon rack with spears and a round shield, and a war drum
    plank(g, 40, -4, 18, 2, PAL.barkM, PAL.barkL, PAL.barkD); plank(g, 40, -24, 18, 2, PAL.barkM, PAL.barkL, PAL.barkD);
    for (let i = 0; i < 4; i++){ g.fillStyle = PAL.barkL; g.fillRect(42 + i * 4.4, -36, 1.2, 36); g.fillStyle = '#c8ccd4'; pv(g, [41.6 + i * 4.4, -36, 43.4 + i * 4.4, -36, 42.6 + i * 4.4, -41]); g.fill(); }
    g.fillStyle = '#8a2a20'; ov(g, -50, -8, 7, 8); g.fill(); g.fillStyle = '#f4ecdb'; ov(g, -50, -15, 7, 2.4); g.fill(); g.fillStyle = PAL.gold; g.fillRect(-57, -9, 14, 1);
  }}),
  /* the signpost at the crossing: four arrow boards naming what lies each way */
  vpost: (seed) => makeProp({w:110, h:84, ax:55, ay:78, seed, shadow:[10, 3], collide:5, paint(g){
    plank(g, -2, -66, 4, 66, PAL.barkM, PAL.barkL, PAL.barkD); g.fillStyle = PAL.roofM; pv(g, [-6, -66, 6, -66, 0, -72]); g.fill();
    const B = [[-60, 1, '#2f6a3a', '⬆ วัด · ดันเจี้ยน'], [-46, 1, '#8a4a20', 'ย่านช่าง ➜'], [-32, -1, '#2a4a7a', '⬅ ร้านยา · หมอ · คลัง'], [-18, -1, '#8a2a20', '⬇ ตลาด · ท่าน้ำ']];
    for (const [y, d, c, t] of B){ const w = 50, x0 = d > 0 ? 2 : -2 - w;
      g.fillStyle = PAL.teakD; pv(g, d > 0 ? [x0, y - 1, x0 + w, y - 1, x0 + w + 6, y + 4.5, x0 + w, y + 10, x0, y + 10] : [x0, y - 1, x0 + w, y - 1, x0 + w, y + 10, x0, y + 10, x0 - 6, y + 4.5]); g.fill();
      g.fillStyle = '#f4ecdb'; pv(g, d > 0 ? [x0 + 1, y, x0 + w - .5, y, x0 + w + 4.5, y + 4.5, x0 + w - .5, y + 9, x0 + 1, y + 9] : [x0 + .5, y, x0 + w - 1, y, x0 + w - 1, y + 9, x0 + .5, y + 9, x0 - 4.5, y + 4.5]); g.fill();
      g.fillStyle = c; g.fillRect(d > 0 ? x0 + 1 : x0 + w - 3, y, 2, 9);
      g.fillStyle = '#141414'; g.font = '700 6.4px Sarabun,"Noto Sans Thai",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, x0 + w / 2 + d * 1.5, y + 4.8, w - 4); }
    g.textBaseline = 'alphabetic';
  }}),
  /* a plank landing stage running out into the pond */
  pier: (seed) => makeProp({w:40, h:70, ax:20, ay:66, seed, collide:0, paint(g){
    for (const x of [-12, 12]) for (const y of [-56, -30, -4]){ plank(g, x - 1.6, y, 3.2, 8, PAL.barkD, PAL.barkM, '#2a1a10'); }
    for (let y = -60; y < 0; y += 5) plank(g, -15, y, 30, 4.4, y % 10 ? PAL.teakL : PAL.teakM, PAL.teakH, PAL.teakD);
    g.fillStyle = PAL.barkM; g.fillRect(13, -64, 2.4, 14); g.strokeStyle = '#c8a050'; g.lineWidth = .8; g.beginPath(); g.moveTo(14, -58); g.quadraticCurveTo(22, -50, 18, -44); g.stroke();
  }}),
  /* the storyteller's corner: a woven mat with cushions, a low table with a palm-leaf book and an oil lamp */
  storymat: (seed) => makeProp({w:70, h:30, ax:35, ay:16, seed, collide:0, paint(g){
    g.fillStyle = '#c8a050'; pv(g, [-28, 6, 28, 6, 24, -8, -24, -8]); g.fill(); g.strokeStyle = '#a07a30'; g.lineWidth = .5; for (let i = -26; i < 28; i += 3){ g.beginPath(); g.moveTo(i, 6); g.lineTo(i * .86, -8); g.stroke(); }
    g.strokeStyle = '#c0392b'; g.lineWidth = 1; g.strokeRect(-24, -6, 48, 10);
    for (const [x, c] of [[-18, '#c0392b'], [16, '#2a7a5a'], [-4, '#e3b04b']]){ g.fillStyle = c; ov(g, x, 0, 5, 2.6); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; ov(g, x - 1.4, -.8, 2, .8); g.fill(); }
    plank(g, 4, -10, 14, 3, PAL.teakM, PAL.teakL, PAL.teakD); g.fillStyle = '#d8c080'; g.fillRect(6, -12, 8, 1.6); g.fillStyle = '#9a4a28'; ov(g, 16, -11, 1.6, 1); g.fill(); vgFire(g, 16, -12, .3);
  }})
});

/* (v60) Aren is ROUND, in the middle of its map: a circle of packed earth (centre ARC, radius ARC.r) edged with a low
   fence, four gates where the roads come in (north, south, east, west), and a ring road round the temple court.
   · the temple court and the crossing where you arrive are the centre
   · thirteen houses stand in a ring: services in the north-west (shop, bank, healer's sala, tailor, festival), the
     guild registrar by the north gate, the craft corner in the east (smith, smelter, gem driller) and the market in
     the south (herbalist, cook, buyer, beast keeper) on a curved market lane
   · the storyteller's mat and shade tree sit in the court beside the crossing; the army tent and the dungeon gate
     stand just outside the north gate, where adventures start */
const ARC = {x:1200, y:800, r:460, ring:290, lane:422};
/* (v264) the owner: the shops did not sit evenly with the town. They now stand on an oval round the central garden
   (plaza.jpg), at equal steps, mirrored left and right: one at the bottom centre, six on each side, the top centre left
   open for the temple. The packed-earth ground, the low fence and the lamps follow the same oval. */
const SHOPR = {rx:500, ry:330}, TOWNR = {rx:610, ry:440};
const ellAt = (deg, rx = SHOPR.rx, ry = SHOPR.ry) => [Math.round(ARC.x + Math.cos(deg * Math.PI / 180) * rx), Math.round(ARC.y + Math.sin(deg * Math.PI / 180) * ry)];
const SHOP_SLOT = k => 90 + k * 360 / 14;   // k = 0 bottom centre … 7 top centre (the temple's gap)
const arcAt = (deg, r) => [Math.round(ARC.x + Math.cos(deg * Math.PI / 180) * r), Math.round(ARC.y + Math.sin(deg * Math.PI / 180) * r)];
/* the plan: [npc id, building (prop type, variant), x, y]; the NPC stands at y + 32. The angles keep every house and
   its keeper clear of its neighbours and of the four roads coming in */
const VPLAN = [
  ['registrar',  'vshop', VSHOP_I.registrar, ...ellAt(SHOP_SLOT(0))],
  ['cook',       'vshop', VSHOP_I.cook,      ...ellAt(SHOP_SLOT(1))],
  ['trader',     'vshop', VSHOP_I.trader,    ...ellAt(SHOP_SLOT(2))],
  ['beastkeeper','vshop', VSHOP_I.beast,     ...ellAt(SHOP_SLOT(3))],
  ['shop',       'vshop', VSHOP_I.shop,      ...ellAt(SHOP_SLOT(4))],
  ['banker',     'vshop', VSHOP_I.banker,    ...ellAt(SHOP_SLOT(5))],
  ['healer_oon', 'sala', 0,                  ...ellAt(SHOP_SLOT(6))],
  ['tailor',     'vshop', VSHOP_I.tailor,    ...ellAt(SHOP_SLOT(8))],
  ['festival',   'vshop', VSHOP_I.festival,  ...ellAt(SHOP_SLOT(9))],
  ['smith',      'vshop', VSHOP_I.smith,     ...ellAt(SHOP_SLOT(10))],
  ['forger',     'vshop', VSHOP_I.forger,    ...ellAt(SHOP_SLOT(11))],
  ['driller',    'vshop', VSHOP_I.driller,   ...ellAt(SHOP_SLOT(12))],
  ['herbal',     'vshop', VSHOP_I.herbal,    ...ellAt(SHOP_SLOT(13))],
  ['teller',     'storymat', 0,              1090, 880],
  ['general',    'armytent', 0,              1050, 290],
  ['gatekeeper', 'portal', 0,                1360, 300],
];
const VNPC_AT = {job:[1188, 714], boatman:[1345, 1440]};
/* the boatman's old pond (ท่าน้ำ) south of the town, with its landing stage and boat */
const VPOND = {x:1420, y:1500, rx:105, ry:52};
for (const [id, , , x, y] of VPLAN) VNPC_AT[id] = [x, y + 32];
const VYARDS = [];   // (v60) no square yards in the round town: each shop has a swept patch in front instead
const ARC_GATES = [87, 168, 273, 5];   // degrees where the roads come in: south, west, north, east

/* NPCs to their places (the town's other code reads NPCS / NPCS_HOME) */
function villageNpcs(){
  for (const list of [typeof NPCS_HOME !== 'undefined' ? NPCS_HOME : [], typeof NPCS !== 'undefined' ? NPCS : []])
    for (const n of list){ const at = VNPC_AT[n.id]; if (at){ n.x = at[0]; n.y = at[1]; } }
}
// called once every NPC has been added (js/world/villagenpc.js, loaded just before main.js)

/* the props of the round town, called from placeProps() */
function villageProps(){
  for (const [, type, v, x, y] of VPLAN) addProp(type, x, y, v);
  // the boatman's old landing south of town: a pond that blocks the way like water does, a plank stage and his boat
  for (const [dx, r] of [[-62, 40], [0, 50], [62, 40]]) obstacles.push({x:VPOND.x + dx, y:VPOND.y, r, water:true});
  if (typeof WATERS !== 'undefined') WATERS.push({k:'pond', x:VPOND.x, y:VPOND.y, rx:VPOND.rx - 6, ry:VPOND.ry - 6, kind:'water', seed:31});
  addProp('pier', 1340, 1490); addProp('boat', 1380, 1500, 0); addProp('lamp', 1262, 1430);
  // (v82) the crossing signpost was removed at the owner's request
  // the low fence round the town, open at the four gates
  const gap = d => ARC_GATES.some(g => Math.abs(((d - g + 540) % 360) - 180) < 7);
  for (let d = 0; d < 360; d += 2.6){ if (gap(d)) continue; const [x, y] = ellAt(d, TOWNR.rx - 6, TOWNR.ry - 6); addProp('lowfence', x, y, Math.abs(Math.sin(d * Math.PI / 180)) > .7 ? 0 : 1); }
  // lamps round the ring road, and one each side of every gate
  // a lamp midway between every two shops, on the same oval (mirrored like the shops)
  for (let k = 0; k < 14; k++){ const [x, y] = ellAt(SHOP_SLOT(k) + 180 / 14, SHOPR.rx + 30, SHOPR.ry + 30); addProp('lamp', x, y); }
  for (const g of ARC_GATES) for (const s of [-6, 6]){ const [x, y] = ellAt(g + s, TOWNR.rx - 20, TOWNR.ry - 20); addProp('lamp', x, y); }
}

/* the ground under the round town: a disc of packed earth, the ring road, the market lane, the four gate roads and
   a swept patch in front of every shop */
function villageGround(g){   // called inside buildTerrain() with the village transform (x − VX)
  const X = x => x - VX, cx = X(ARC.x), cy = ARC.y;
  const disc = (r, col) => { g.fillStyle = col; g.beginPath(); g.ellipse(cx, cy, TOWNR.rx * r / ARC.r, TOWNR.ry * r / ARC.r, 0, 0, 7); g.fill(); };   // (v264) the town's oval
  disc(ARC.r + 22, 'rgba(184,149,95,.35)'); disc(ARC.r + 8, 'rgba(184,149,95,.7)'); disc(ARC.r, '#b8955f');
  for (let i = 0; i < 2600; i++){ const a = R() * 6.283, d = Math.sqrt(R()), x = cx + Math.cos(a) * d * TOWNR.rx, y = cy + Math.sin(a) * d * TOWNR.ry;
    g.fillStyle = R() < .5 ? 'rgba(110,78,42,.3)' : 'rgba(225,195,145,.26)'; g.beginPath(); g.ellipse(x, y, .8 + R() * 2, .6 + R(), R() * 3, 0, 7); g.fill(); }
  const lane = (r, w) => { for (const [lw, col] of [[w, '#a8804c'], [w - 6, '#bf9a62']]){ g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); } };
  const spoke = d => { const a = d * Math.PI / 180; for (const [lw, col] of [[52, '#a8804c'], [46, '#bf9a62']]){ g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'butt'; g.beginPath(); g.moveTo(cx + Math.cos(a) * (ARC.ring - 20), cy + Math.sin(a) * (ARC.ring - 20)); g.lineTo(cx + Math.cos(a) * (ARC.r + 24), cy + Math.sin(a) * (ARC.r + 24)); g.stroke(); } };
  if (false) for (const d of ARC_GATES) spoke(d);   // (v263) the owner: no dirt roads (the four gate roads)
  if (false) lane(ARC.ring, 56);   // (v264) the garden picture lies here
  // the market lane: the south half, in front of the stalls
  if (false) for (const [lw, col] of [[46, '#a8804c'], [40, '#bf9a62']]){ g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(cx, cy, ARC.lane, 15 * Math.PI / 180, 165 * Math.PI / 180); g.stroke(); }
  for (let i = 0; i < 1600; i++){ const a = R() * 6.283, d = ARC.ring + (R() - .5) * 44, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
    g.fillStyle = R() < .5 ? 'rgba(100,70,40,.4)' : 'rgba(240,210,160,.3)'; g.beginPath(); g.ellipse(x, y, .8 + R() * 1.4, .6 + R(), R() * 3, 0, 7); g.fill(); }
  // swept patches in front of the shops
  // (v274) the owner had the swept patches (light ellipses in front of each shop) taken away
  // the court round the temple: a round paved plaza in the middle
  disc(150, 'rgba(196,160,108,.55)');
  g.strokeStyle = 'rgba(140,100,60,.35)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 150, 0, 7); g.stroke();
  // the boatman's pond: a muddy bank, deep water, reeds
  const PX = X(VPOND.x), PY = VPOND.y; g.fillStyle = '#8f7a4a'; g.beginPath(); g.ellipse(PX, PY, VPOND.rx + 12, VPOND.ry + 7, 0, 0, 7); g.fill();
  const pg = g.createRadialGradient(PX - 20, PY - 12, 8, PX, PY, VPOND.rx); pg.addColorStop(0, '#6fbcd9'); pg.addColorStop(.7, '#3f8bb4'); pg.addColorStop(1, '#2f6f92');
  g.fillStyle = pg; g.beginPath(); g.ellipse(PX, PY, VPOND.rx, VPOND.ry, 0, 0, 7); g.fill();
  for (let i = 0; i < 50; i++){ const a = R() * 6.28, x = PX + Math.cos(a) * (VPOND.rx + 8), y = PY + Math.sin(a) * (VPOND.ry + 4); if (Math.abs(x - X(1340)) < 22 && y < PY) continue;
    g.strokeStyle = R() < .5 ? '#4f7f38' : '#7aa24a'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - .5) * 3, y - 6 - R() * 6); g.stroke(); }
}
