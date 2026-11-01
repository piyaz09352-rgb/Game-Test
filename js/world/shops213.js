/* VAYRATHEN — js/world/shops213.js — (v213) every shop in Aren is its own building
   The owner did not want twelve copies of one shop (v212 gave them depth and light but kept one template). Each trade
   now has the house that trade would really have, in a Thai town:
     โรงตีเหล็ก   a sooty open forge shed under a dark hip roof, smoke vent on the ridge, glowing hearth, tall chimney
     โรงหลอมแร่   a brick bottle kiln with a fire mouth beside a lean-to shed with a rusty tin roof and stacked ingots
     ร้านเจาะมณี  a white Thai-Chinese plaster shop, blue glazed roof with curled ridge ends, an arched display window
     ร้านยา       a two-storey wooden shophouse: folding plank doors, a wall of medicine drawers, a balcony, a red vertical sign
     สมุนไพร      a bamboo hut on stilts with woven walls and a steep straw roof, herbs drying underneath
     โรงครัว      an open-air kitchen under a striped tarp on bamboo poles, woks steaming, string lights, tables
     ร้านตัดชุด   a pastel wooden boutique with fretwork eaves, a bay window with a dress on a stand, flower boxes
     คลังเบี้ย    a white stone bank: steps, four columns with gold capitals, a pediment with a coin, a brass-studded door
     ทะเบียน      a whitewashed government office with green shutters under a two-tiered Thai roof, a flag
     เทศกาล       a red-and-gold festival pavilion with a pointed tent roof, bunting and round lanterns
     รับซื้อของ   a weathered wooden godown with a sliding door, a rusty corrugated roof, sacks and crates
     เลี้ยงสัตว์   a low stable barn with a straw roof, stable half-doors, a hay loft, a trough and a fence
   Same footprint and place as before (js/world/village2.js); the lanterns and pots come from js/world/shops212.js. */
'use strict';

const S3 = {
  rect:(g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); },
  shade:(g, x, y, w, h, a = .35) => { g.fillStyle = vsLin(g, 0, y, 0, y + h, [[0, 'rgba(255,236,196,.2)'], [.5, 'rgba(0,0,0,0)'], [1, `rgba(24,10,2,${a})`]]); g.fillRect(x, y, w, h); },
  eaveShadow:(g, x, y, w, h = 6) => { g.fillStyle = vsLin(g, 0, y, 0, y + h, [[0, 'rgba(16,6,0,.5)'], [1, 'rgba(16,6,0,0)']]); g.fillRect(x, y, w, h); },
  // a sign board with the shop's name: style {bg:[top, bottom], fg, frame, w, h, font}
  board(g, cx, y, text, o = {}){ const w = o.w || 44, h = o.h || 9;
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(cx - w / 2 + .8, y + .8, w, h);
    g.fillStyle = vsLin(g, 0, y, 0, y + h, [[0, (o.bg || ['#8a1e18', '#5a0e0a'])[0]], [1, (o.bg || ['#8a1e18', '#5a0e0a'])[1]]]); g.fillRect(cx - w / 2, y, w, h);
    if (o.frame !== null){ g.strokeStyle = o.frame || PAL.gold; g.lineWidth = .8; g.strokeRect(cx - w / 2 + .6, y + .6, w - 1.2, h - 1.2); }
    g.fillStyle = o.fg || '#ffe9a8'; g.font = `700 ${o.font || 6.4}px Sarabun,"Noto Sans Thai",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, cx, y + h / 2 + .5, w - 4); g.textBaseline = 'alphabetic'; },
  vboard(g, x, y, text, o = {}){ const w = o.w || 9, ch = [...text], h = ch.length * 7 + 5;
    g.fillStyle = vsLin(g, x, 0, x + w, 0, [[0, '#6a0e0a'], [.5, '#b0281e'], [1, '#6a0e0a']]); g.fillRect(x, y, w, h); g.strokeStyle = PAL.gold; g.lineWidth = .7; g.strokeRect(x + .6, y + .6, w - 1.2, h - 1.2);
    g.fillStyle = '#ffe08a'; g.font = '700 6px Sarabun,"Noto Sans Thai",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    // Thai clusters (a consonant with its vowel and tone marks) stay together down the board
    const cl = text.match(/[฀-๿][ัิ-ฺ็-๎]*|./g) || ch; cl.forEach((c, i) => g.fillText(c, x + w / 2, y + 5 + i * (h - 6) / cl.length)); g.textBaseline = 'alphabetic'; },
  thatch(g, pts, rng, base = '#c09048'){ g.save(); pv(g, pts); g.fillStyle = base; g.fill(); g.clip();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let i = 0; i < pts.length; i += 2){ x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]); }
    const C = ['#e8c878', '#b88a3c', '#8a6428', '#d8b060', '#f0d890'];
    for (let i = 0; i < (x1 - x0) * (y1 - y0) * .45; i++){ const x = x0 + rng() * (x1 - x0), y = y0 + rng() * (y1 - y0), l = 2.5 + rng() * 4;
      g.strokeStyle = C[(rng() * C.length) | 0]; g.lineWidth = .5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rng() - .5) * 1.2, y + l); g.stroke(); }
    for (let y = y0 + 6; y < y1; y += 7){ g.fillStyle = 'rgba(60,36,10,.25)'; g.fillRect(x0, y, x1 - x0, 1.2); }
    g.fillStyle = vsLin(g, x0, y0, x1, y1, [[0, 'rgba(255,240,200,.25)'], [.6, 'rgba(0,0,0,0)'], [1, 'rgba(30,14,0,.3)']]); g.fillRect(x0, y0, x1 - x0, y1 - y0); g.restore(); },
  tin(g, pts, rng, base = '#8a8e94'){ g.save(); pv(g, pts); g.fillStyle = base; g.fill(); g.clip();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let i = 0; i < pts.length; i += 2){ x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]); }
    for (let x = x0; x < x1; x += 2.4){ g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x, y0, .8, y1 - y0); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + 1.4, y0, .7, y1 - y0); }
    for (let i = 0; i < 14; i++){ const x = x0 + rng() * (x1 - x0), y = y0 + rng() * (y1 - y0) * .6; g.fillStyle = `rgba(${150 + rng() * 40 | 0},${70 + rng() * 30 | 0},20,${.25 + rng() * .3})`; g.fillRect(x, y, 1.2 + rng() * 2, 4 + rng() * 10); }
    g.restore(); },
  boards(g, x, y, w, h, rng, cols = ['#8a6a48', '#7a5a3a', '#9a7a56', '#6a4c30'], bw = 4){ for (let xx = x; xx < x + w; xx += bw){ g.fillStyle = cols[(rng() * cols.length) | 0]; g.fillRect(xx, y, Math.min(bw, x + w - xx), h); g.fillStyle = 'rgba(30,16,6,.4)'; g.fillRect(xx + bw - .5, y, .5, h); } grain(g, x, y, w, h, rng, Math.round(w / 3)); },
  side(g, x, yTop, yBot, d, col){ g.fillStyle = vsLin(g, x, 0, x + d, 0, [[0, col], [1, 'rgba(20,10,4,1)']]); pv(g, [x, yTop, x + d, yTop - d * .42, x + d, yBot - d * .42, x, yBot]); g.fill();
    g.fillStyle = 'rgba(0,0,0,.35)'; pv(g, [x, yTop, x + d, yTop - d * .42, x + d, yBot - d * .42, x, yBot]); g.fill(); },
  window(g, x, y, w, h, frame = PAL.teakD, lit = true){ g.fillStyle = lit ? vsLin(g, 0, y, 0, y + h, [[0, '#ffe2a0'], [1, '#e8902a']]) : '#2a2a34'; g.fillRect(x, y, w, h);
    g.strokeStyle = frame; g.lineWidth = 1; g.strokeRect(x, y, w, h); g.lineWidth = .6; g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h / 2); g.lineTo(x + w, y + h / 2); g.stroke(); },
  smoke(g, x, y, n = 4){ for (let i = 0; i < n; i++){ g.fillStyle = `rgba(200,200,205,${.5 - i * .1})`; ov(g, x + Math.sin(i * 1.9) * 3 + i * 1.5, y - i * 5.5, 3 + i * 1.2, 2.4 + i); g.fill(); } },
  plinth(g, x, w, h = 6, rng){ blocks(g, x, -h, w, h, 8, 3, [PAL.stone, PAL.stoneL, '#b0a690'], 'rgba(90,80,64,.9)', rng); g.fillStyle = 'rgba(255,248,230,.45)'; g.fillRect(x, -h, w, .7); }
};
const S3_NAME = k => (VSHOP_NAME[k] || ['ร้านค้า'])[0];

const S3_DRAW = {
  smith(g, rng){
    S3.plinth(g, -46, 86, 6, rng);
    S3.side(g, 40, -56, -6, 8, '#3a3434');
    // back wall: sooty brick; posts; the hearth glowing at the back
    blocks(g, -40, -56, 80, 50, 6, 3, ['#6a3a2a', '#5a3022', '#7a4430', '#4a2a20'], '#2a1a14', rng, 6); S3.shade(g, -40, -56, 80, 50, .5);
    g.fillStyle = 'rgba(20,10,6,.45)'; g.fillRect(-40, -56, 80, 12);
    { const gr = g.createRadialGradient(-12, -14, 2, -12, -14, 34); gr.addColorStop(0, 'rgba(255,150,60,.75)'); gr.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = gr; g.fillRect(-46, -50, 70, 46); }
    blocks(g, -26, -22, 26, 16, 5, 3, ['#7a4a34', '#6a3a28'], '#2a1a12', rng); g.fillStyle = '#1a0a04'; g.fillRect(-21, -19, 16, 6); vgFire(g, -13, -13, 1.1);
    g.fillStyle = '#ffb040'; for (let i = 0; i < 6; i++){ g.fillRect(-20 + rng() * 14, -16 - rng() * 12, .8, .8); }
    // tools on the wall, anvil on a stump, quench barrel
    for (let i = 0; i < 4; i++){ const x = 8 + i * 6; g.fillStyle = PAL.barkM; g.fillRect(x, -48, 1.2, 14); g.fillStyle = '#5a5e68'; g.fillRect(x - 2, -48, 5.2, 3); }
    g.fillStyle = PAL.barkD; g.fillRect(12, -14, 10, 8); g.fillStyle = '#4a4e58'; pv(g, [8, -20, 26, -20, 24, -16, 20, -15, 20, -14, 14, -14, 14, -15, 10, -16]); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(9, -20, 16, .7);
    g.fillStyle = vsLin(g, 28, 0, 38, 0, [[0, '#5a3a20'], [.5, '#8a5a30'], [1, '#4a2e18']]); g.fillRect(28, -16, 10, 10); g.fillStyle = '#2a3a4a'; ov(g, 33, -16, 5, 1.6); g.fill();
    for (const x of [-44, -2, 38]){ g.fillStyle = vsLin(g, x, 0, x + 5, 0, [[0, '#2a1a10'], [.5, '#5a3a24'], [1, '#2a1a10']]); g.fillRect(x, -60, 5, 54); }
    // a dark hip roof with a smoke vent on the ridge
    tileQuad(g, [-54, -56, 54, -56, 26, -84, -26, -84], 7, 9, ['#3a3e46', '#5a606a', '#1e2026']);
    g.fillStyle = vsLin(g, -40, -84, 40, -56, [[0, 'rgba(255,255,255,.18)'], [1, 'rgba(0,0,0,.25)']]); pv(g, [-54, -56, 54, -56, 26, -84, -26, -84]); g.fill();
    g.fillStyle = '#1a1c20'; g.fillRect(-54, -57, 108, 2.4);
    g.fillStyle = '#2a2c32'; g.fillRect(-8, -92, 16, 8); tileQuad(g, [-12, -91, 12, -91, 6, -97, -6, -97], 2, 4, ['#3a3e46', '#5a606a', '#1e2026']); S3.smoke(g, 0, -99, 4);
    // a tall brick chimney on the right
    blocks(g, 44, -96, 9, 90, 4.5, 3, ['#7a3a28', '#8a4430', '#6a3022'], '#3a1a12', rng); g.fillStyle = '#2a1a14'; g.fillRect(43, -98, 11, 3); S3.smoke(g, 49, -101, 3);
    S3.board(g, 0, -55, S3_NAME('smith'), {bg:['#3a3e46', '#1e2026'], fg:'#ffb060', frame:'#a0a4ac', w:40});
  },
  forger(g, rng){
    S3.plinth(g, -50, 98, 5, rng);
    // the lean-to shed (right) with a rusty tin roof
    S3.boards(g, 2, -48, 42, 43, rng, ['#7a5a3a', '#6a4a2e', '#8a6a46']); S3.shade(g, 2, -48, 42, 43);
    g.fillStyle = '#1e1008'; g.fillRect(8, -40, 30, 26); { const gr = g.createRadialGradient(22, -24, 1, 22, -24, 22); gr.addColorStop(0, 'rgba(255,140,40,.55)'); gr.addColorStop(1, 'rgba(255,100,20,0)'); g.fillStyle = gr; g.fillRect(8, -40, 30, 26); }
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++){ const x = 12 + i * 5.6 + r * 2.8, y = -16 - r * 2.6; g.fillStyle = PAL.goldD; pv(g, [x, y, x + 5, y, x + 4, y - 2.4, x + 1, y - 2.4]); g.fill(); g.fillStyle = PAL.goldL; g.fillRect(x + 1, y - 2.4, 3, .7); }
    g.fillStyle = '#3a2a24'; ov(g, 32, -22, 4, 3); g.fill(); g.fillStyle = '#ff8a2a'; ov(g, 32, -24, 3.2, 1.2); g.fill();
    S3.tin(g, [-2, -46, 50, -54, 50, -48, -2, -40], rng, '#8a8a90'); g.fillStyle = '#4a4a50'; g.fillRect(-2, -41, 52, 1.2);
    for (const x of [3, 41]) S3.rect(g, x, -46, 3, 41, '#4a3220');
    S3.board(g, 23, -38, S3_NAME('forger'), {bg:['#5a2a18', '#3a180c'], fg:'#ffc070', frame:'#c88a40', w:30, h:7.6, font:5.6});
    // the bottle kiln (left): brick body narrowing to a neck, a glowing fire mouth
    const body = [-46, -4, -46, -40, -40, -62, -30, -74, -26, -96, -16, -96, -12, -74, -2, -62, 4, -40, 4, -4];
    g.save(); pv(g, body); g.clip(); blocks(g, -48, -98, 54, 96, 5, 3, ['#9a4a2e', '#8a3e26', '#aa5838', '#7a3420'], '#4a2216', rng, 4);
    g.fillStyle = vsLin(g, -46, 0, 4, 0, [[0, 'rgba(255,220,180,.18)'], [.45, 'rgba(0,0,0,0)'], [1, 'rgba(20,6,0,.45)']]); g.fillRect(-48, -98, 54, 96); g.restore();
    g.strokeStyle = '#3a1a0e'; g.lineWidth = 1; pv(g, body); g.stroke();
    for (const y of [-40, -62]){ g.fillStyle = '#5a2a18'; g.fillRect(-47, y - 1, 52, 2); }
    g.fillStyle = '#1a0804'; g.beginPath(); g.moveTo(-30, -4); g.lineTo(-30, -16); g.arc(-21, -16, 9, Math.PI, 0); g.lineTo(-12, -4); g.closePath(); g.fill();
    { const gr = g.createRadialGradient(-21, -10, 1, -21, -10, 14); gr.addColorStop(0, 'rgba(255,200,90,.95)'); gr.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = gr; g.fillRect(-36, -26, 30, 24); } vgFire(g, -21, -6, 1.2);
    S3.smoke(g, -20, -100, 4);
    // an ore cart
    g.fillStyle = '#5a4030'; pv(g, [36, -10, 56, -10, 54, -2, 38, -2]); g.fill(); g.fillStyle = '#6a6a72'; for (let i = 0; i < 5; i++){ ov(g, 40 + i * 3.4, -11 - (i % 2) * 1.6, 2.2, 1.8); g.fill(); }
    g.fillStyle = '#2a2a2e'; for (const x of [41, 51]){ g.beginPath(); g.arc(x, -1, 2.4, 0, 7); g.fill(); }
  },
  driller(g, rng){
    S3.plinth(g, -46, 90, 6, rng);
    S3.side(g, 42, -66, -6, 8, '#c8c0b0');
    // white plaster walls with a blue glazed tile skirt
    g.fillStyle = vsLin(g, 0, -66, 0, -6, [[0, '#fbf6ea'], [1, '#d8d0c0']]); g.fillRect(-42, -66, 84, 60);
    for (let i = 0; i < 9; i++){ g.fillStyle = 'rgba(160,140,110,.12)'; ov(g, -40 + rng() * 80, -60 + rng() * 50, 3 + rng() * 6, 2 + rng() * 3); g.fill(); }
    for (let x = -42, k = 0; x < 42; x += 6, k++){ g.fillStyle = k % 2 ? '#2a6aa8' : '#3a88c8'; g.fillRect(x, -16, 6, 10); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x + 2.5, -14, 1, 6); g.fillRect(x + 1, -11.5, 4, 1); }
    g.fillStyle = PAL.gold; g.fillRect(-42, -17, 84, 1);
    // the arched display window with gems on velvet stands
    g.fillStyle = '#e8e0d0'; g.beginPath(); g.moveTo(-24, -18); g.lineTo(-24, -42); g.arc(0, -42, 24, Math.PI, 0); g.lineTo(24, -18); g.closePath(); g.fill();
    g.fillStyle = vsLin(g, 0, -64, 0, -20, [[0, '#2a3a5a'], [1, '#141c2c']]); g.beginPath(); g.moveTo(-21, -20); g.lineTo(-21, -42); g.arc(0, -42, 21, Math.PI, 0); g.lineTo(21, -20); g.closePath(); g.fill();
    const GC = [['#ff4a6a', '#ffc0cc'], ['#4ab8ff', '#d0f0ff'], ['#4adf8a', '#c8ffd8'], ['#c06aff', '#ecd0ff'], ['#ffd040', '#fff4c0']];
    for (let i = 0; i < 5; i++){ const x = -16 + i * 8, y = -26 - (i % 2) * 8; g.fillStyle = '#6a1a2a'; g.fillRect(x - 2.6, y + 1, 5.2, 6); g.fillStyle = '#8a2a3a'; ov(g, x, y + 1, 2.6, .9); g.fill(); vgGem(g, x, y, GC[i][0], GC[i][1]); g.fillStyle = '#fff'; g.fillRect(x + 1.6, y - 4.6, .7, .7); }
    g.strokeStyle = PAL.goldD; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-21, -20); g.lineTo(-21, -42); g.arc(0, -42, 21, Math.PI, 0); g.lineTo(21, -20); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.16)'; pv(g, [-16, -56, -8, -60, 8, -22, 0, -22]); g.fill();
    // a Chinese-style roof: blue glazed tiles, a curled ridge with a pearl
    tileQuad(g, [-56, -64, 56, -64, 44, -82, -44, -82], 6, 12, ['#2a6aa8', '#5aa0d8', '#16406a']);
    g.fillStyle = vsLin(g, 0, -82, 0, -64, [[0, 'rgba(255,255,255,.25)'], [1, 'rgba(0,0,0,.2)']]); pv(g, [-56, -64, 56, -64, 44, -82, -44, -82]); g.fill();
    g.fillStyle = '#1e4a7a'; g.fillRect(-46, -86, 92, 4.4); g.strokeStyle = '#1e4a7a'; g.lineWidth = 3; for (const s of [-1, 1]){ g.beginPath(); g.moveTo(s * 44, -84); g.quadraticCurveTo(s * 54, -84, s * 56, -94); g.stroke(); }
    g.fillStyle = '#ffd060'; g.beginPath(); g.arc(0, -90, 3.2, 0, 7); g.fill(); g.fillStyle = '#fff6c0'; g.beginPath(); g.arc(-1, -91, 1.2, 0, 7); g.fill();
    S3.board(g, 0, -64, S3_NAME('driller'), {bg:['#1a1a22', '#0a0a10'], fg:'#ffd870', frame:PAL.gold, w:44, h:8});
    // the gem-cutting wheel outside
    g.fillStyle = PAL.teakD; g.fillRect(48, -14, 10, 2); g.fillRect(49, -12, 1.4, 12); g.fillRect(56, -12, 1.4, 12); g.fillStyle = '#9aa4b0'; g.beginPath(); g.arc(53, -18, 4.6, 0, 7); g.fill(); g.fillStyle = '#5a6470'; g.beginPath(); g.arc(53, -18, 1.4, 0, 7); g.fill();
  },
  shop(g, rng){
    S3.plinth(g, -40, 80, 5, rng);
    S3.side(g, 38, -76, -5, 8, '#6a4428');
    // ground floor: folding plank doors, the middle ones open on a wall of medicine drawers
    S3.boards(g, -36, -40, 74, 35, rng, ['#8a5a34', '#7a4e2c', '#9a6a40']); S3.shade(g, -36, -40, 74, 35);
    g.fillStyle = '#2a160a'; g.fillRect(-20, -38, 40, 33);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++){ const x = -18 + c * 6.2, y = -36 + r * 5.6; g.fillStyle = (r + c) % 2 ? '#8a4a24' : '#7a3e1c'; g.fillRect(x, y, 5.6, 5); g.fillStyle = PAL.goldL; g.fillRect(x + 2.3, y + 2.2, 1, .8); }
    for (let i = 0; i < 4; i++){ g.fillStyle = ['#e0d8c0', '#c8b890', '#d8cca8', '#b8a880'][i]; ov(g, -14 + i * 9, -8.6, 3, 3.4); g.fill(); g.fillStyle = '#8a2a20'; g.fillRect(-15.6 + i * 9, -12.6, 3.2, 1.2); }
    for (const [x, open] of [[-36, 0], [-28, 0], [20, 0], [28, 0]]){ void open; g.fillStyle = '#6a3e20'; g.fillRect(x, -40, 8, 35); g.strokeStyle = 'rgba(30,14,4,.5)'; g.lineWidth = .6; g.strokeRect(x + 1, -38, 6, 14); g.strokeRect(x + 1, -21, 6, 14); }
    // upper floor: a balcony with a railing and louvred windows
    S3.boards(g, -36, -72, 74, 32, rng, ['#9a6a40', '#8a5a34']); S3.shade(g, -36, -72, 74, 32);
    for (const x of [-30, -6, 18]){ g.fillStyle = '#3a6a4a'; g.fillRect(x, -68, 14, 18); g.fillStyle = 'rgba(0,0,0,.35)'; for (let y = -66; y < -51; y += 2.2) g.fillRect(x + 1, y, 12, .8); g.strokeStyle = '#e8dcc0'; g.lineWidth = .8; g.strokeRect(x, -68, 14, 18); }
    g.fillStyle = '#5a3a20'; g.fillRect(-40, -42, 80, 3); g.fillStyle = '#e8dcc0'; for (let x = -38; x < 40; x += 3.4) g.fillRect(x, -50, 1.2, 8); g.fillRect(-40, -51, 80, 1.6);
    for (const x of [-34, 30]){ g.fillStyle = '#b8603a'; ov(g, x, -52.5, 3, 1.6); g.fill(); g.fillStyle = '#4a9a44'; ov(g, x, -55, 3.4, 2.6); g.fill(); }
    // a front gable with red tiles
    tileQuad(g, [-46, -72, 46, -72, 36, -80, -36, -80], 3, 12, [PAL.roofM, PAL.roofL, PAL.roofD]);
    g.fillStyle = PAL.teakD; pv(g, [-36, -80, 0, -98, 36, -80]); g.fill(); g.fillStyle = PAL.roofD; for (const s of [-1, 1]){ g.save(); g.lineWidth = 5; g.strokeStyle = PAL.roofM; g.beginPath(); g.moveTo(s * 40, -79); g.lineTo(0, -99); g.stroke(); g.restore(); }
    g.fillStyle = '#fff6dc'; g.beginPath(); g.arc(0, -86, 4, 0, 7); g.fill(); g.strokeStyle = PAL.gold; g.lineWidth = .8; g.stroke(); g.font = '5.6px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🧪', 0, -85.6); g.textBaseline = 'alphabetic';
    // the vertical red sign and a gourd charm
    S3.vboard(g, -48, -66, S3_NAME('shop')); g.strokeStyle = '#3a2010'; g.lineWidth = .6; g.beginPath(); g.moveTo(-43.5, -70); g.lineTo(-43.5, -66); g.stroke();
    g.fillStyle = '#c8a040'; ov(g, 44, -30, 3, 3.6); g.fill(); ov(g, 44, -35.6, 2, 2.2); g.fill(); g.fillStyle = '#8a2a20'; g.fillRect(43.2, -39, 1.6, 2);
  },
  herbal(g, rng){
    // stilts and a raised floor, herbs drying underneath
    for (const x of [-34, -12, 12, 32]){ g.fillStyle = vsLin(g, x, 0, x + 3, 0, [[0, '#8a7a3a'], [.5, '#c8b860'], [1, '#6a5a2a']]); g.fillRect(x, -30, 3, 30); g.fillStyle = 'rgba(60,50,20,.5)'; for (let y = -26; y < 0; y += 8) g.fillRect(x, y, 3, .8); }
    g.fillStyle = PAL.barkM; g.fillRect(-28, -14, 54, 1.4);
    for (let i = 0; i < 7; i++){ const x = -24 + i * 7.6; g.strokeStyle = '#5a4020'; g.lineWidth = .4; g.beginPath(); g.moveTo(x, -13); g.lineTo(x, -10); g.stroke(); g.fillStyle = ['#5a8a3a', '#7aa04a', '#4a7a30'][i % 3]; pv(g, [x - 2.4, -10, x + 2.4, -10, x + 1, -3, x - 1, -3]); g.fill(); }
    g.fillStyle = PAL.teakD; g.fillRect(-40, -32, 80, 3); g.fillStyle = PAL.teakL; g.fillRect(-40, -32, 80, .7);
    // woven bamboo walls (checker weave), a doorway and a window flap
    g.fillStyle = '#c8b070'; g.fillRect(-34, -64, 68, 32);
    for (let y = -64; y < -32; y += 3) for (let x = -34; x < 34; x += 3){ g.fillStyle = ((x + y) / 3) % 2 ? 'rgba(120,90,40,.35)' : 'rgba(255,240,190,.25)'; g.fillRect(x, y, 3, 3); }
    S3.shade(g, -34, -64, 68, 32); S3.side(g, 34, -64, -32, 8, '#a08850');
    g.fillStyle = '#2a1a0a'; g.fillRect(-8, -56, 14, 24); g.fillStyle = 'rgba(255,190,100,.25)'; g.fillRect(-8, -56, 14, 24);
    S3.window(g, 14, -54, 12, 9, '#6a5020');
    // a ladder up to the door
    g.strokeStyle = '#8a7030'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-6, -31); g.lineTo(-9, 0); g.moveTo(4, -31); g.lineTo(7, 0); g.stroke(); g.lineWidth = 1; for (let k = 1; k < 5; k++){ const t = k / 5; g.beginPath(); g.moveTo(-6 - 3 * t, -31 + 31 * t); g.lineTo(4 + 3 * t, -31 + 31 * t); g.stroke(); }
    // the steep straw roof with a big overhang
    S3.thatch(g, [-54, -58, 0, -98, 54, -58, 48, -54, -48, -54], rng);
    g.strokeStyle = '#6a4a1a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-6, -95); g.lineTo(0, -99); g.lineTo(6, -95); g.stroke();
    S3.eaveShadow(g, -34, -64, 68, 6);
    // a bamboo-slat sign and baskets of herbs by the stilts
    S3.board(g, 0, -70, S3_NAME('herbal'), {bg:['#d8c080', '#b89a50'], fg:'#2a4a1a', frame:'#6a5020', w:34, h:8});
    for (const x of [-48, 46]){ g.fillStyle = '#a07a3a'; pv(g, [x - 6, -8, x + 6, -8, x + 5, 0, x - 5, 0]); g.fill(); g.strokeStyle = 'rgba(60,40,10,.6)'; g.lineWidth = .4; for (let i = -5; i < 6; i += 2){ g.beginPath(); g.moveTo(x + i, -8); g.lineTo(x + i * .85, 0); g.stroke(); } for (let i = 0; i < 6; i++){ g.fillStyle = i % 2 ? '#5a9a3a' : '#7ab84a'; ov(g, x - 4 + i * 1.6, -9 - (i % 3), 1.8, 1.4); g.fill(); } }
  },
  cook(g, rng){
    S3.plinth(g, -50, 100, 4, rng);
    // the cooking counter: brick stoves with woks and steam
    blocks(g, -42, -20, 52, 16, 6, 3, ['#9a5a3a', '#8a4e30', '#aa6a46'], '#4a2a18', rng); S3.shade(g, -42, -20, 52, 16);
    for (const x of [-30, -8]){ g.fillStyle = '#1a0a04'; g.fillRect(x - 5, -14, 10, 5); vgFire(g, x, -9, .8); g.fillStyle = '#2a2a2e'; ov(g, x, -21, 8, 2.6); g.fill(); g.fillStyle = '#4a4a50'; ov(g, x, -22, 7, 1.6); g.fill(); g.fillStyle = '#c8a050'; ov(g, x, -22.4, 5, .9); g.fill(); vgSteam(g, x, -24, 4); }
    // shelves of jars and hanging ladles on the back screen
    S3.boards(g, -44, -56, 58, 34, rng, ['#9a6a40', '#8a5a34']); S3.shade(g, -44, -56, 58, 34, .25);
    g.fillStyle = PAL.teakD; g.fillRect(-42, -42, 54, 1.4); for (let i = 0; i < 8; i++){ g.fillStyle = ['#e8d8b0', '#c86a3a', '#4a8a5a', '#e8a040'][i % 4]; ov(g, -38 + i * 6.4, -45, 2.2, 2.6); g.fill(); }
    for (let i = 0; i < 5; i++){ const x = -36 + i * 8; g.strokeStyle = '#6a6a72'; g.lineWidth = .7; g.beginPath(); g.moveTo(x, -54); g.lineTo(x, -48); g.stroke(); g.fillStyle = '#8a8a92'; ov(g, x, -47.4, 1.6, 1); g.fill(); }
    // bamboo poles and a striped tarp roof that sags between them
    for (const x of [-48, 0, 46]){ g.fillStyle = vsLin(g, x, 0, x + 3, 0, [[0, '#8a7a3a'], [.5, '#d8c870'], [1, '#6a5a2a']]); g.fillRect(x, -70, 3, 70); }
    { const A = ['#e8a020', '#fff4d0']; for (let i = 0; i < 10; i++){ const x0 = -54 + i * 11, x1 = x0 + 11; g.fillStyle = A[i % 2]; g.beginPath(); g.moveTo(x0, -78 + Math.abs(i - 4.5) * 1.4); g.lineTo(x1, -78 + Math.abs(i - 3.5) * 1.4); g.lineTo(x1, -64); g.quadraticCurveTo((x0 + x1) / 2, -60, x0, -64); g.closePath(); g.fill(); }
      g.fillStyle = vsLin(g, 0, -80, 0, -60, [[0, 'rgba(255,255,255,.25)'], [1, 'rgba(0,0,0,.18)']]); g.fillRect(-54, -82, 110, 22); g.fillStyle = 'rgba(20,8,0,.25)'; g.fillRect(-44, -60, 88, 5); }
    // string lights
    g.strokeStyle = 'rgba(40,30,20,.7)'; g.lineWidth = .5; g.beginPath(); g.moveTo(-48, -62); g.quadraticCurveTo(-24, -54, 0, -62); g.quadraticCurveTo(24, -54, 46, -62); g.stroke();
    for (let i = 0; i < 9; i++){ const t = i / 8, x = -48 + t * 94, y = -62 + Math.sin((t * 2 % 1) * Math.PI) * 6; g.fillStyle = ['#ffd860', '#ff8a6a', '#8ae0ff'][i % 3]; ov(g, x, y + 1.6, 1.3, 1.6); g.fill(); }
    // tables and stools in front, and a chalk menu board
    for (const x of [24, 40]){ g.fillStyle = '#c8402a'; ov(g, x, -10, 7, 2.4); g.fill(); g.fillStyle = '#8a2a1a'; g.fillRect(x - .8, -9, 1.6, 9); g.fillStyle = '#e8e0d0'; ov(g, x - 2, -11, 1.6, .6); g.fill(); for (const s of [-1, 1]){ g.fillStyle = '#2a6aa8'; ov(g, x + s * 8, -4, 2.4, 1); g.fill(); g.fillRect(x + s * 8 - .5, -4, 1, 4); } }
    g.fillStyle = PAL.teakD; g.fillRect(16, -48, 26, 18); g.fillStyle = '#1e2a22'; g.fillRect(17.4, -46.6, 23.2, 15.2); g.fillStyle = '#f0f0e0'; g.font = '700 5.4px Sarabun,"Noto Sans Thai",sans-serif'; g.textAlign = 'center'; g.fillText(S3_NAME('cook'), 29, -40); g.font = '4px sans-serif'; g.fillText('ข้าว · แกง · ผัด', 29, -34);
  },
  tailor(g, rng){
    S3.plinth(g, -44, 88, 6, rng);
    S3.side(g, 40, -64, -6, 8, '#c89ab8');
    // pastel walls with white trim
    S3.boards(g, -40, -64, 80, 58, rng, ['#f2c8dc', '#ecc0d6', '#f6d0e2'], 5); S3.shade(g, -40, -64, 80, 58, .22);
    for (const x of [-40, 37]) S3.rect(g, x, -64, 3, 58, '#fff4f8');
    // the bay window: a dress on a stand, bolts of cloth, a scalloped valance
    g.fillStyle = '#fff4f8'; g.fillRect(-32, -50, 40, 34); g.fillStyle = vsLin(g, 0, -48, 0, -18, [[0, '#ffe8c0'], [1, '#f0c088']]); g.fillRect(-30, -48, 36, 30);
    g.fillStyle = '#8a6a4a'; g.fillRect(-13, -22, 1.4, 4); g.fillStyle = '#e8406a'; pv(g, [-15, -40, -9, -40, -6, -22, -18, -22]); g.fill(); g.fillStyle = '#ffd0dc'; ov(g, -12, -42, 3, 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(-14, -38, 1, 14);
    for (let i = 0; i < 4; i++){ g.fillStyle = ['#6a8ae8', '#f0c040', '#6ac8a0', '#c86ad8'][i]; g.fillRect(-28 + i * 3.4, -30 + (i % 2) * 2, 3, 12); g.fillRect(-4 + (i % 2) * 4, -24 - (i > 1 ? 4 : 0), 6, 3.4); }
    g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.strokeRect(-30, -48, 36, 30); g.lineWidth = .7; g.beginPath(); g.moveTo(-12, -48); g.lineTo(-12, -18); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.2)'; pv(g, [-26, -48, -20, -48, -28, -18, -30, -18]); g.fill();
    for (let i = 0; i < 9; i++){ g.fillStyle = i % 2 ? '#d86aa8' : '#fff0f6'; g.beginPath(); g.arc(-30 + i * 4.5 + 2.25, -50, 2.25, 0, Math.PI); g.fill(); }
    g.fillStyle = '#d86aa8'; g.fillRect(-32, -53, 40, 3);
    // a flower box under the window, and a door with a glass pane
    g.fillStyle = PAL.teakM; g.fillRect(-32, -16, 40, 4); for (let i = 0; i < 9; i++){ g.fillStyle = i % 2 ? '#3a8a3a' : '#5aa04a'; ov(g, -30 + i * 4.4, -17, 2.4, 1.8); g.fill(); g.fillStyle = ['#ff6a8a', '#ffd040', '#ffffff'][i % 3]; ov(g, -30 + i * 4.4, -18.4, 1.1, 1.1); g.fill(); }
    g.fillStyle = '#8a4a6a'; g.fillRect(14, -44, 18, 38); g.fillStyle = vsLin(g, 0, -42, 0, -26, [[0, '#ffe8c0'], [1, '#e8b080']]); g.fillRect(17, -41, 12, 14); g.fillStyle = PAL.gold; ov(g, 28, -24, .9, .9); g.fill();
    // a purple hip roof with white fretwork under the eaves
    tileQuad(g, [-52, -62, 52, -62, 30, -88, -30, -88], 6, 10, ['#7a3a7a', '#a85aa8', '#4a1e4a']);
    g.fillStyle = vsLin(g, -40, -88, 40, -62, [[0, 'rgba(255,255,255,.2)'], [1, 'rgba(0,0,0,.2)']]); pv(g, [-52, -62, 52, -62, 30, -88, -30, -88]); g.fill();
    g.fillStyle = '#fff'; for (let i = 0; i < 13; i++){ const x = -48 + i * 8; g.beginPath(); g.moveTo(x, -62); g.lineTo(x + 8, -62); g.lineTo(x + 4, -57.6); g.closePath(); g.fill(); g.fillStyle = '#7a3a7a'; ov(g, x + 4, -60.6, .8, .8); g.fill(); g.fillStyle = '#fff'; }
    // a hanging sign
    g.strokeStyle = '#3a2a2a'; g.lineWidth = .8; g.beginPath(); g.moveTo(40, -50); g.lineTo(52, -50); g.moveTo(44, -50); g.lineTo(44, -46); g.moveTo(51, -50); g.lineTo(51, -46); g.stroke();
    S3.board(g, 47.5, -46, S3_NAME('tailor'), {bg:['#fff0f6', '#f0c8dc'], fg:'#8a2a6a', frame:'#d86aa8', w:22, h:8, font:4.6});
  },
  banker(g, rng){
    // three wide steps
    for (let i = 0; i < 3; i++){ g.fillStyle = vsLin(g, 0, -6 + i * 2, 0, -4 + i * 2, [[0, '#f0ece0'], [1, '#c8c0b0']]); g.fillRect(-48 + i * 0, -9 + i * 3, 96 - i * 0, 3); }
    S3.side(g, 42, -70, -9, 8, '#d0c8b8');
    // white stone walls, barred windows, a brass-studded double door
    blocks(g, -42, -70, 84, 61, 12, 6, ['#f4f0e6', '#ece6d8', '#f8f4ec'], '#c8c0b0', rng); S3.shade(g, -42, -70, 84, 61, .2);
    for (const x of [-36, 24]){ S3.window(g, x, -54, 12, 18, '#5a5048', false); g.fillStyle = '#3a3430'; for (let k = 1; k < 4; k++) g.fillRect(x + k * 3, -54, .8, 18); g.fillStyle = '#d8d0c0'; g.fillRect(x - 1.4, -56, 14.8, 2.4); }
    g.fillStyle = '#5a2a14'; g.fillRect(-10, -40, 20, 31); g.fillStyle = '#3a1a0c'; g.fillRect(-.4, -40, .8, 31);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++){ g.fillStyle = PAL.goldL; ov(g, -7.4 + c * 5, -36 + r * 6, .6, .6); g.fill(); }
    g.fillStyle = PAL.gold; g.beginPath(); g.arc(0, -40, 10, Math.PI, 0); g.fill(); g.fillStyle = '#5a2a14'; g.beginPath(); g.arc(0, -40, 8.4, Math.PI, 0); g.fill(); g.fillStyle = PAL.goldL; g.fillRect(-.6, -48, 1.2, 8);
    // four columns with gold capitals
    for (const x of [-42, -24, 18, 36]){ g.fillStyle = vsLin(g, x, 0, x + 6, 0, [[0, '#c8c0b0'], [.4, '#ffffff'], [1, '#b0a898']]); g.fillRect(x, -66, 6, 57); g.fillStyle = 'rgba(0,0,0,.08)'; for (let k = 1; k < 4; k++) g.fillRect(x + k * 1.5, -66, .4, 57);
      g.fillStyle = PAL.gold; g.fillRect(x - 1.2, -68, 8.4, 3); g.fillStyle = PAL.goldL; ov(g, x + .6, -66, 1.4, 1.4); g.fill(); ov(g, x + 5.4, -66, 1.4, 1.4); g.fill(); g.fillStyle = '#d0c8b8'; g.fillRect(x - 1, -11, 8, 2.4); }
    // the entablature with the name, a pediment with a gold coin, a low green roof behind
    tileQuad(g, [-50, -76, 50, -76, 34, -90, -34, -90], 4, 10, ['#3a7a6a', '#5aa090', '#1e4a40']);
    g.fillStyle = vsLin(g, 0, -78, 0, -68, [[0, '#ffffff'], [1, '#d8d0c0']]); g.fillRect(-48, -78, 96, 10); g.fillStyle = PAL.gold; g.fillRect(-48, -68.6, 96, 1.2);
    g.fillStyle = '#7a5a10'; g.font = '700 6.6px Sarabun,"Noto Sans Thai",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(S3_NAME('banker'), 0, -72.6); g.textBaseline = 'alphabetic';
    g.fillStyle = vsLin(g, 0, -98, 0, -78, [[0, '#ffffff'], [1, '#d8d0c0']]); pv(g, [-40, -78, 0, -98, 40, -78]); g.fill(); g.strokeStyle = '#b8b0a0'; g.lineWidth = 1; pv(g, [-40, -78, 0, -98, 40, -78]); g.stroke();
    g.fillStyle = PAL.goldD; g.beginPath(); g.arc(0, -85, 5.6, 0, 7); g.fill(); g.fillStyle = PAL.goldL; g.beginPath(); g.arc(0, -85, 4.4, 0, 7); g.fill(); g.fillStyle = PAL.goldD; g.fillRect(-1.6, -86.4, 3.2, 2.8);
    // a strongbox and a coin sack by the steps
    g.fillStyle = '#4a3a2a'; g.fillRect(-58, -12, 11, 9); g.fillStyle = PAL.gold; g.fillRect(-58, -9, 11, 1); ov(g, -52.5, -6, 1.2, 1.2); g.fill();
    vgSack(g, 52, 0, '#c8a860'); g.fillStyle = PAL.gold; for (let i = 0; i < 3; i++){ ov(g, 46 + i * 2.6, -1 - i * .6, 1.6, .7); g.fill(); }
  },
  registrar(g, rng){
    S3.plinth(g, -44, 88, 6, rng);
    S3.side(g, 40, -56, -6, 8, '#d8d0c0');
    // whitewashed walls with green-shuttered windows
    g.fillStyle = vsLin(g, 0, -56, 0, -6, [[0, '#fbf8f0'], [1, '#e0d8c8']]); g.fillRect(-40, -56, 80, 50);
    for (const x of [-34, 18]){ S3.window(g, x, -46, 12, 16, '#e8e0d0', true); for (const s of [-1, 1]){ g.fillStyle = '#3a7a4a'; g.fillRect(s < 0 ? x - 6 : x + 12, -46, 6, 16); g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = -45; y < -31; y += 2) g.fillRect(s < 0 ? x - 5.4 : x + 12.6, y, 4.8, .7); } }
    g.fillStyle = '#2a4a6a'; g.fillRect(-9, -40, 18, 34); g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(-8, -39, 7, 32);
    S3.board(g, 0, -52, S3_NAME('registrar'), {bg:['#ffffff', '#e8e4dc'], fg:'#1e3a6a', frame:'#2a4a6a', w:30, h:8});
    // a two-tiered Thai roof, orange with green borders, gold finials
    const tier = (y0, y1, hw, rid) => { tileQuad(g, [-hw, y0, hw, y0, rid, y1, -rid, y1], 4, 10, ['#d86a2a', '#f08a40', '#8a3a14']); g.fillStyle = '#2a7a4a'; g.fillRect(-hw, y0 - 1, hw * 2, 2.6);
      g.fillStyle = vsLin(g, -hw, y1, hw, y0, [[0, 'rgba(255,255,255,.2)'], [1, 'rgba(0,0,0,.22)']]); pv(g, [-hw, y0, hw, y0, rid, y1, -rid, y1]); g.fill(); };
    tier(-54, -70, 54, 30); S3.eaveShadow(g, -40, -56, 80, 5);
    blocks(g, -22, -76, 44, 8, 6, 4, ['#fbf8f0'], '#d8d0c0', rng);
    tier(-74, -92, 36, 12); chofa(g, 0, -92, 7, PAL.gold);
    // a flagpole and a notice board
    g.fillStyle = '#c8c8d0'; g.fillRect(50, -84, 1.6, 84); g.fillStyle = '#d8281e'; g.fillRect(51.6, -84, 9, 1.6); g.fillStyle = '#ffffff'; g.fillRect(51.6, -82.4, 9, 1.6); g.fillStyle = '#1e3a8a'; g.fillRect(51.6, -80.8, 9, 3); g.fillStyle = '#ffffff'; g.fillRect(51.6, -77.8, 9, 1.6); g.fillStyle = '#d8281e'; g.fillRect(51.6, -76.2, 9, 1.6);
    g.fillStyle = PAL.teakD; g.fillRect(-58, -30, 14, 12); g.fillRect(-56, -18, 1.4, 18); g.fillRect(-47, -18, 1.4, 18); g.fillStyle = '#e8dcc0'; g.fillRect(-57, -29, 12, 10); for (let i = 0; i < 4; i++){ g.fillStyle = '#fff'; g.fillRect(-56 + (i % 2) * 6, -28 + (i > 1 ? 4.6 : 0), 4.6, 3.8); g.fillStyle = '#c0392b'; g.fillRect(-54 + (i % 2) * 6, -28.4 + (i > 1 ? 4.6 : 0), .8, .8); }
  },
  festival(g, rng){
    S3.plinth(g, -40, 80, 5, rng);
    // a red pavilion with gold trim, the goods counter in front
    g.fillStyle = vsLin(g, 0, -56, 0, -5, [[0, '#c8281e'], [1, '#7a1410']]); g.fillRect(-36, -56, 72, 51);
    g.fillStyle = '#2a0a06'; g.fillRect(-28, -50, 56, 26); (VG_SHELF.festival || (() => {}))(g, rng);
    g.fillStyle = vsLin(g, 0, -50, 0, -42, [[0, 'rgba(10,0,0,.5)'], [1, 'rgba(10,0,0,0)']]); g.fillRect(-28, -50, 56, 8);
    g.fillStyle = vsLin(g, 0, -26, 0, -6, [[0, PAL.gold], [1, PAL.goldD]]); g.fillRect(-34, -26, 68, 20);
    for (let i = 0; i < 6; i++){ g.fillStyle = '#c8281e'; ov(g, -27 + i * 10.8, -16, 3.4, 3.4); g.fill(); g.fillStyle = PAL.goldL; g.font = '700 4px sans-serif'; g.textAlign = 'center'; g.fillText('福', -27 + i * 10.8, -14.6); }
    for (const x of [-38, 34]){ g.fillStyle = vsLin(g, x, 0, x + 4, 0, [[0, '#6a0e0a'], [.5, '#e84030'], [1, '#6a0e0a']]); g.fillRect(x, -60, 4, 55); g.fillStyle = PAL.gold; g.fillRect(x - .6, -60, 5.2, 2.4); g.fillRect(x - .6, -9, 5.2, 4); }
    // a pointed tent roof in red and gold segments with a spire
    for (let i = 0; i < 8; i++){ const x0 = -50 + i * 12.5, x1 = x0 + 12.5; g.fillStyle = i % 2 ? PAL.gold : '#d8281e'; pv(g, [x0, -58, x1, -58, 0, -96]); g.fill(); }
    g.fillStyle = vsLin(g, -40, -96, 40, -58, [[0, 'rgba(255,255,255,.25)'], [1, 'rgba(0,0,0,.25)']]); pv(g, [-50, -58, 0, -96, 50, -58]); g.fill();
    for (let i = 0; i < 20; i++){ g.fillStyle = i % 2 ? '#d8281e' : PAL.gold; g.beginPath(); g.arc(-50 + i * 5 + 2.5, -58, 2.5, 0, Math.PI); g.fill(); }
    g.fillStyle = PAL.gold; g.fillRect(-.8, -104, 1.6, 9); g.beginPath(); g.arc(0, -104, 2, 0, 7); g.fill();
    // bunting from the spire, round lanterns
    for (const s of [-1, 1]){ g.strokeStyle = 'rgba(60,30,10,.7)'; g.lineWidth = .5; g.beginPath(); g.moveTo(0, -95); g.quadraticCurveTo(s * 30, -70, s * 60, -68); g.stroke();
      for (let k = 1; k < 9; k++){ const t = k / 9, x = 2 * (1 - t) * t * s * 30 + t * t * s * 60, y = (1 - t) * (1 - t) * -95 + 2 * (1 - t) * t * -70 + t * t * -68; g.fillStyle = ['#ff4a4a', '#ffd040', '#4ab8ff', '#5adf7a', '#e86ad8'][k % 5]; pv(g, [x - 2, y, x + 2, y, x, y + 4]); g.fill(); } }
    S3.board(g, 0, -64, S3_NAME('festival'), {bg:['#ffd860', '#e8a020'], fg:'#8a1410', frame:'#c8281e', w:34, h:8});
  },
  trader(g, rng){
    S3.plinth(g, -48, 96, 4, rng);
    S3.side(g, 44, -64, -4, 8, '#6a5440');
    // weathered board walls, a big sliding door half open on sacks
    S3.boards(g, -44, -64, 88, 60, rng, ['#8a7058', '#7a6048', '#9a8064', '#6a5440'], 5); S3.shade(g, -44, -64, 88, 60, .3);
    g.fillStyle = '#1e140c'; g.fillRect(-20, -46, 34, 42);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) vgSack(g, -14 + i * 8 + r * 4, -4 - r * 8, ['#d8c08a', '#c8b07a', '#e0cc98'][(i + r) % 3]);
    S3.boards(g, 14, -46, 18, 42, rng, ['#6a4a30', '#7a5a3a']); g.strokeStyle = '#3a2a1a'; g.lineWidth = .8; g.beginPath(); g.moveTo(14, -46); g.lineTo(32, -4); g.moveTo(32, -46); g.lineTo(14, -4); g.stroke(); g.strokeRect(14, -46, 18, 42);
    g.fillStyle = '#4a4a50'; g.fillRect(-22, -48, 58, 1.6);
    // a hand-painted sign on the wall
    g.fillStyle = 'rgba(240,230,200,.85)'; g.fillRect(-40, -40, 18, 22); g.strokeStyle = '#3a6a4a'; g.lineWidth = .8; g.strokeRect(-39.4, -39.4, 16.8, 20.8);
    g.fillStyle = '#2a5a3a'; g.font = '700 5px Sarabun,"Noto Sans Thai",sans-serif'; g.textAlign = 'center'; g.fillText('รับซื้อ', -31, -31); g.fillText('ของ', -31, -24.4); g.font = '6px sans-serif'; g.fillText('⚖', -31, -19);
    // a rusty corrugated gable roof
    S3.tin(g, [-54, -62, 0, -94, 54, -62, 50, -58, -50, -58], rng, '#8a8a8e');
    g.strokeStyle = '#5a5a60'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-54, -62); g.lineTo(0, -94); g.lineTo(54, -62); g.stroke();
    S3.eaveShadow(g, -44, -64, 88, 6);
    S3.board(g, 0, -74, S3_NAME('trader'), {bg:['#2a6a4a', '#1a4a32'], fg:'#fff4d8', frame:'#e8d8a0', w:38, h:8});
    // crates and a scale outside
    vgCrate(g, 50, 0, 10, 8); vgCrate(g, 52, -8, 8, 7); g.fillStyle = PAL.barkM; g.fillRect(-56, -22, 1.6, 22); g.fillRect(-62, -22, 13, 1.4); g.strokeStyle = '#8a8a92'; g.lineWidth = .5; for (const x of [-60, -51]){ g.beginPath(); g.moveTo(x, -21); g.lineTo(x, -15); g.stroke(); g.fillStyle = '#b8a060'; ov(g, x, -14.6, 2.6, .9); g.fill(); }
  },
  beast(g, rng){
    S3.plinth(g, -48, 96, 3, rng);
    // a low red-brown barn, stable half-doors, a hay loft
    S3.boards(g, -46, -46, 92, 46, rng, ['#8a3a24', '#7a3220', '#9a442c'], 4); S3.shade(g, -46, -46, 92, 46, .3);
    g.fillStyle = '#e8dcc0'; g.fillRect(-46, -46, 92, 1.6); g.fillRect(-46, -2, 92, 2);
    for (const x of [-38, -10, 18]){ g.fillStyle = '#2a140a'; g.fillRect(x, -36, 20, 34); g.fillStyle = '#6a2a18'; g.fillRect(x, -18, 20, 16); g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; g.strokeRect(x, -18, 20, 16); g.beginPath(); g.moveTo(x, -18); g.lineTo(x + 20, -2); g.moveTo(x + 20, -18); g.lineTo(x, -2); g.stroke(); g.strokeRect(x, -36, 20, 34); }
    g.fillStyle = '#d8b860'; for (let i = 0; i < 7; i++){ g.strokeStyle = i % 2 ? '#e8c870' : '#c8a050'; g.lineWidth = .7; g.beginPath(); g.moveTo(-34 + i * 2, -18); g.lineTo(-33 + i * 2.2, -24 - (i % 3)); g.stroke(); }
    // the straw roof and the loft opening
    S3.thatch(g, [-56, -42, -26, -90, 26, -90, 56, -42, 50, -38, -50, -38], rng, '#b88a40');
    g.fillStyle = '#2a140a'; g.fillRect(-8, -78, 16, 16); g.fillStyle = '#e8c870'; pv(g, [-8, -62, 8, -62, 6, -68, 2, -66, -2, -69, -6, -66]); g.fill();
    g.strokeStyle = '#e8dcc0'; g.lineWidth = .8; g.strokeRect(-8, -78, 16, 16);
    S3.board(g, 0, -50, S3_NAME('beast'), {bg:['#e8d8a8', '#c8b078'], fg:'#5a2a10', frame:'#6a3a18', w:34, h:7.4, font:5.6});
    // a horseshoe, hay bales, a trough and a bit of fence
    g.strokeStyle = '#8a8a92'; g.lineWidth = 1.2; g.beginPath(); g.arc(0, -84, 2.6, .2, Math.PI - .2, true); g.stroke();
    for (const [x, y] of [[-56, 0], [-50, -7]]){ g.fillStyle = '#d8b860'; g.fillRect(x - 6, y - 7, 12, 7); g.fillStyle = 'rgba(120,80,20,.4)'; g.fillRect(x - 6, y - 4, 12, .7); g.fillStyle = '#8a6a2a'; g.fillRect(x - 3, y - 7, .7, 7); g.fillRect(x + 3, y - 7, .7, 7); }
    g.fillStyle = '#6a4a2a'; pv(g, [44, -8, 60, -8, 58, -2, 46, -2]); g.fill(); g.fillStyle = '#4a8aa8'; g.fillRect(45, -8, 14, 1.4);
    g.fillStyle = PAL.teakM; for (const x of [48, 60]) g.fillRect(x, -16, 1.6, 8); g.fillRect(46, -14, 16, 1.2);
  }
};

/* (v214) one standard for all twelve: each house's main body (from the ground to its roof ridge, eave to eave — not
   smoke, chimneys, flags or spires) is scaled to the same height on the same ground line, within the same width */
const S3_STD = {h:92, w:120, base:2};
const S3_MAIN = {smith:[-86, -54, 54], forger:[-96, -50, 50], driller:[-88, -56, 56], shop:[-98, -48, 46], herbal:[-98, -54, 54], cook:[-82, -54, 56],
  tailor:[-88, -52, 52], banker:[-98, -50, 50], registrar:[-92, -54, 54], festival:[-96, -50, 50], trader:[-94, -54, 54], beast:[-90, -56, 56]};
PROP_TYPES.vshop = (seed, v = 0) => makeProp({w:128, h:124, ax:64, ay:112,   // (v214) taller canvas: chimneys and spires are no longer cut off
  seed, shadow:[52, 12, 3], collide:30, glow:[0, -40, 62], paint(g, rng){
  const V = VSHOP[v] || VSHOP[0], f = S3_DRAW[V.k];
  if (!f) return;
  const [top, x0, x1] = S3_MAIN[V.k] || [-92, -50, 50], k = Math.min(S3_STD.h / -top, S3_STD.w / (x1 - x0)), cx = (x0 + x1) / 2;
  g.save(); g.translate(0, S3_STD.base); g.scale(k, k); g.translate(-cx, 0); f(g, rng); g.restore();
  // every house gets its pots by the door and, where it fits, a lantern at the eave
  const pk = VSHOP_PLANT[V.k] || 'fern';
  if (!['herbal', 'beast', 'cook', 'festival'].includes(V.k)) for (const px of [-30, 30]){ g.save(); g.translate(px, 1); g.scale(.62, .62); vsPlant(g, 0, 0, pk, rng); g.restore(); }
  if (['shop', 'festival', 'cook', 'tailor'].includes(V.k)) { vsLantern(g, V.k === 'shop' ? 40 : -44, V.k === 'tailor' ? -58 : -60, 3); }
}});
