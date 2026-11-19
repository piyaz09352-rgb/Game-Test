/* VAYRATHEN — js/sys/combo329.js — (v329) the normal attack as a three-hit combo, its own for every class line
   The owner asked whether the classes' normal attacks and skill poses were good enough. They were not: every class used one
   five-frame swing chosen by its weapon, so the mage, the healer, the summoner and the hexer struck alike, as did the boxer
   and the cat, and the swordsman and the dog. Now each line has three blows of its own, played in turn while you keep
   hitting (back to the first after 1.8 s without a hit, or on a new target), and each blow lands with an effect no other
   class has; the third is the strongest-looking. The poses are in js/gfx/sprites.js (c_sw1 …), feet always on the ground.
   Damage is unchanged: this is how the attack looks, not what it does. */
'use strict';
const CB329 = {
  lines:{blade:['c_sw1', 'c_sw2', 'c_sw3'], rune:['c_mg1', 'c_mg2', 'c_mg3'], ranger:['c_ar1', 'c_ar2', 'c_ar3'], muay:['c_mt1', 'c_mt2', 'c_mt3'],
    healer:['c_hl1', 'c_hl2', 'c_hl3'], rogue:['c_dg1', 'c_dg2', 'c_dg3'], summoner:['c_sm1', 'c_sm2', 'c_sm3'], occult:['c_oc1', 'c_oc2', 'c_oc3'],
    merchant:['c_ax1', 'c_ax2', 'c_ax3'], catfolk:['c_ct1', 'c_ct2', 'c_ct3'], dogfolk:['c_dog1', 'c_dog2', 'c_dog3'], ninja:['c_nj1', 'c_nj2', 'c_nj3']},
  th:{c_sw1:'ฟันเฉียงลง', c_sw2:'ฟันย้อนขึ้น', c_sw3:'แทงพุ่ง', c_mg1:'ชี้ไม้เท้ายิง', c_mg2:'ผลักฝ่ามือ', c_mg3:'ฟาดไม้เท้าจากเหนือหัว', c_ar1:'ยิงเร็ว', c_ar2:'หมุนตัวยิง', c_ar3:'ง้างสุดแรง',
    c_mt1:'หมัดแย็บ-หมัดตรง', c_mt2:'เตะตัดล่าง', c_mt3:'ศอกเสย', c_hl1:'แตะไม้เท้า', c_hl2:'โบกมืออวยพร', c_hl3:'ชูไม้เท้าชี้', c_dg1:'กรีด', c_dg2:'กรีดย้อน', c_dg3:'แทงต่ำ',
    c_sm1:'ชี้ทาง', c_sm2:'กวักมือเรียก', c_sm3:'ดันไม้เท้าสองมือ', c_oc1:'ชี้นิ้วสาป', c_oc2:'ตะปบเงา', c_oc3:'กระทุ้งไม้เท้า', c_ax1:'สับเฉียง', c_ax2:'กวาดขวาน', c_ax3:'สับสองมือ',
    c_ct1:'ข่วนซ้าย', c_ct2:'ข่วนขวา', c_ct3:'ตะปบสองมือ', c_dog1:'แทง', c_dog2:'ฟันหมุนตัว', c_dog3:'ฟันเสยคำราม', c_nj1:'ซัดดาว', c_nj2:'ซัดดาวหลังมือ', c_nj3:'ซัดคู่ต่ำ'},
  i:0, last:-9, tgt:null, quiet:false};
for (const line in CB329.lines) for (const a of CB329.lines[line]) SPR.ACTIONS[a] = {n:5, fps:15, th:CB329.th[a]};
for (const j in JOBS){ const ch = typeof jobChain === 'function' ? jobChain(j) : [j], line = ch[1] || ch[0], acts = CB329.lines[line]; if (!acts) continue;
  SPR.CHAR_ACTIONS[j] = [...new Set([...(SPR.CHAR_ACTIONS[j] || []), ...acts])]; }
const cbLine = () => { const ch = jobChain(S.job); return ch[1] || ch[0]; };

/* ---------- the effects (drawn over the world on the screen, about half a second each) ---------- */
const cbE = k => 1 - Math.pow(1 - k, 3), cbF = (k, a = .55) => Math.min(1, k * 6) * (k < a ? 1 : Math.max(0, 1 - (k - a) / (1 - a)));
const cbStar = (g, x, y, r, w, col, rot = 0) => { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.beginPath();
  for (let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2, rr = i % 2 ? w : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.restore(); };
const cbGlow = (g, x, y, r, c0, c1) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
const CB_FX = {
  // swordsman: steel crescents; the thrust ends in a cross of light
  blade(g, X, Y, k, m, st, d){ const s = st === 2 ? 1.35 : 1, a = cbF(k); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    const arcs = st === 2 ? [[-.8, 1], [.8, -1]] : [[st === 0 ? -.7 : .7, st === 0 ? 1 : -1]];
    for (const [rot, dirn] of arcs){ const sweep = cbE(Math.min(1, k * 2.2)) * 2.2; g.save(); g.translate(X, Y); g.rotate(rot + d * .3);
      for (const [w, al, c] of [[7 * s, .35, 'rgba(120,170,255,1)'], [3 * s, .8, 'rgba(225,240,255,1)'], [1.2, 1, '#fff']]){ g.globalAlpha = a * al; g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.arc(0, 0, 24 * m * s, -1.1 * dirn, -1.1 * dirn + sweep * dirn, dirn < 0); g.stroke(); } g.restore(); }
    if (st === 2){ g.globalAlpha = a; cbStar(g, X, Y, 16 * m * (1 - k * .4), 3 * m, 'rgba(230,245,255,.95)', k * 2); }
    for (let i = 0; i < 5 + st * 3; i++){ const an = i * 2.4 + d, r = cbE(k) * (22 + i * 3) * m; g.globalAlpha = a * .9; g.fillStyle = i % 2 ? '#d8e8ff' : '#fff'; g.fillRect(X + Math.cos(an) * r, Y + Math.sin(an) * r * .7, 1.6, 1.6); } },
  // mage: a burst in the weapon's element with a turning glyph ring; the overhead blow leaves a nova
  rune(g, X, Y, k, m, st, d, el){ const C = {fire:['255,150,60', '255,230,170'], water:['90,190,255', '210,240,255'], wind:['120,240,190', '220,255,240'], earth:['220,170,90', '255,235,190'], holy:['255,225,120', '255,250,220'], shadow:['170,110,255', '235,215,255']}[el] || ['150,130,255', '235,225,255'];
    const a = cbF(k), r = (14 + st * 8) * m * cbE(k); g.globalCompositeOperation = 'lighter';
    g.globalAlpha = a * .8; cbGlow(g, X, Y, r * 1.4, `rgba(${C[1]},.85)`, `rgba(${C[0]},0)`);
    g.save(); g.translate(X, Y); g.scale(1, .55); g.rotate(k * 3); g.globalAlpha = a; g.strokeStyle = `rgba(${C[0]},.95)`; g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, r * 1.3, 0, 7); g.stroke();
    for (let i = 0; i < 6; i++){ const an = i / 6 * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(an) * r * 1.3, Math.sin(an) * r * 1.3); g.lineTo(Math.cos(an + 1.05) * r * 1.3, Math.sin(an + 1.05) * r * 1.3); g.stroke(); } g.restore();
    if (st === 2){ g.globalAlpha = a * (1 - k); g.strokeStyle = `rgba(${C[1]},1)`; g.lineWidth = 3; g.beginPath(); g.ellipse(X, Y + 10 * m, r * 2.2, r * .9, 0, 0, 7); g.stroke(); }
    for (let i = 0; i < 6 + st * 4; i++){ const an = i * 1.9 + d, q = cbE(k); g.globalAlpha = a * (1 - q * .6); g.fillStyle = `rgba(${C[1]},1)`; g.beginPath(); g.arc(X + Math.cos(an) * q * 30 * m, Y + Math.sin(an) * q * 18 * m - q * 12 * m, 1.4, 0, 7); g.fill(); } },
  // hunter: a burst of green-gold fletching and leaves; the full draw drives a bright streak through
  ranger(g, X, Y, k, m, st, d){ const a = cbF(k); g.globalCompositeOperation = 'lighter';
    g.globalAlpha = a * (1 - k); g.strokeStyle = 'rgba(190,255,150,.95)'; g.lineWidth = 2; g.beginPath(); g.ellipse(X, Y, (10 + 18 * cbE(k)) * m, (5 + 9 * cbE(k)) * m, 0, 0, 7); g.stroke();
    for (let i = 0; i < 6 + st * 3; i++){ const an = i * 2.1 + d, q = cbE(k), x = X + Math.cos(an) * q * 28 * m, y = Y + Math.sin(an) * q * 16 * m + q * q * 10 * m;
      g.save(); g.translate(x, y); g.rotate(an + k * 4); g.globalAlpha = a; g.fillStyle = i % 3 ? 'rgba(150,230,110,.95)' : 'rgba(255,220,120,.95)'; g.beginPath(); g.ellipse(0, 0, 3.6, 1.4, 0, 0, 7); g.fill(); g.restore(); }
    if (st === 2){ const L = 60 * m * cbE(Math.min(1, k * 2)); g.globalAlpha = a; g.lineCap = 'round'; for (const [w, c] of [[6, 'rgba(160,255,140,.35)'], [2, 'rgba(240,255,220,1)']]){ g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(X - Math.cos(d) * 20 * m, Y - Math.sin(d) * 12 * m); g.lineTo(X + Math.cos(d) * L, Y + Math.sin(d) * L * .6); g.stroke(); } } },
  // muay thai: impact rings and speed lines; the elbow ends in a sunburst
  muay(g, X, Y, k, m, st, d){ const a = cbF(k, .4); g.globalCompositeOperation = 'lighter';
    for (let r = 0; r < 1 + st; r++){ const q = cbE(Math.max(0, k - r * .12)); g.globalAlpha = a * (1 - q); g.strokeStyle = r % 2 ? 'rgba(255,220,120,1)' : 'rgba(255,140,60,1)'; g.lineWidth = 3 - r * .6; g.beginPath(); g.arc(X, Y, (8 + q * (20 + st * 8)) * m, 0, 7); g.stroke(); }
    g.lineCap = 'round'; for (let i = 0; i < 8; i++){ const an = i / 8 * Math.PI * 2 + d, r0 = (10 + cbE(k) * 14) * m, r1 = r0 + (8 + st * 4) * m * (1 - k); g.globalAlpha = a; g.strokeStyle = '#fff4d8'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(X + Math.cos(an) * r0, Y + Math.sin(an) * r0); g.lineTo(X + Math.cos(an) * r1, Y + Math.sin(an) * r1); g.stroke(); }
    if (st === 2){ g.globalAlpha = a; cbStar(g, X, Y, 18 * m * (1.2 - k), 7 * m, 'rgba(255,200,90,.9)', d); cbStar(g, X, Y, 10 * m * (1.2 - k), 4 * m, 'rgba(255,255,230,1)', d + .4); } },
  // healer: lotus petals of light open; the raised staff leaves a halo and a cross of light
  healer(g, X, Y, k, m, st, d){ const a = cbF(k); g.globalCompositeOperation = 'lighter';
    g.globalAlpha = a * .7; cbGlow(g, X, Y, (16 + st * 6) * m, 'rgba(255,250,220,.9)', 'rgba(255,220,140,0)');
    const n = 6 + st * 2; for (let i = 0; i < n; i++){ const an = i / n * Math.PI * 2 + d * .2 + k, r = cbE(k) * (14 + st * 6) * m; g.save(); g.translate(X + Math.cos(an) * r, Y + Math.sin(an) * r * .6); g.rotate(an + Math.PI / 2);
      g.globalAlpha = a; g.fillStyle = i % 2 ? 'rgba(255,215,230,.95)' : 'rgba(255,240,190,.95)'; g.beginPath(); g.ellipse(0, 0, 2.2 * m, 5 * m, 0, 0, 7); g.fill(); g.restore(); }
    if (st === 2){ g.globalAlpha = a; g.strokeStyle = 'rgba(255,240,170,1)'; g.lineWidth = 2; g.beginPath(); g.ellipse(X, Y - 22 * m, 12 * m, 4 * m, 0, 0, 7); g.stroke();
      g.fillStyle = 'rgba(255,255,235,.9)'; g.fillRect(X - 1.5, Y - 20 * m * cbE(k), 3, 40 * m * cbE(k)); g.fillRect(X - 14 * m * cbE(k), Y - 1.5, 28 * m * cbE(k), 3); } },
  // rogue: two thin violet slits and wisps of shadow; the low stab tears a crimson X
  rogue(g, X, Y, k, m, st, d){ const a = cbF(k, .5); g.lineCap = 'round';
    const cuts = st === 2 ? [[-.75, 'rgba(255,60,90,1)'], [.75, 'rgba(255,60,90,1)']] : [[st === 0 ? -.5 : .5, 'rgba(190,120,255,1)'], [(st === 0 ? -.5 : .5) + .12, 'rgba(190,120,255,1)']];
    for (const [rot, c] of cuts){ const L = 26 * m * cbE(Math.min(1, k * 3)); g.save(); g.translate(X, Y); g.rotate(rot); g.globalCompositeOperation = 'lighter';
      g.globalAlpha = a * .5; g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); g.moveTo(-L, 0); g.lineTo(L, 0); g.stroke(); g.globalAlpha = a; g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-L, 0); g.lineTo(L, 0); g.stroke(); g.restore(); }
    g.globalCompositeOperation = 'source-over'; for (let i = 0; i < 4 + st * 2; i++){ const an = i * 1.7 + d, q = cbE(k); g.globalAlpha = a * .45 * (1 - q); g.fillStyle = 'rgba(40,20,70,1)'; g.beginPath(); g.arc(X + Math.cos(an) * q * 22 * m, Y + Math.sin(an) * q * 12 * m - q * 10 * m, (3 + q * 5) * m, 0, 7); g.fill(); } },
  // summoner: spirit wisps spiral in; the two-hand drive opens a spiral rune
  summoner(g, X, Y, k, m, st, d){ const a = cbF(k); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5 + st * 2; i++){ const off = i / (5 + st * 2) * Math.PI * 2, r = (1 - cbE(k)) * 30 * m + 6 * m, an = off + k * 6; const x = X + Math.cos(an) * r, y = Y + Math.sin(an) * r * .55 - 6 * m;
      g.globalAlpha = a; cbGlow(g, x, y, 5 * m, 'rgba(180,255,240,.95)', 'rgba(60,200,200,0)'); g.fillStyle = '#e8fffb'; g.beginPath(); g.arc(x, y, 1.4, 0, 7); g.fill(); }
    if (st >= 1){ g.save(); g.translate(X, Y + 8 * m); g.scale(1, .45); g.rotate(-k * 4); g.globalAlpha = a; g.strokeStyle = 'rgba(120,240,220,.95)'; g.lineWidth = 1.6; g.beginPath();
      for (let t = 0; t < (st === 2 ? 3 : 1.6) * Math.PI * 2; t += .2){ const rr = t * 2.2 * m; g.lineTo(Math.cos(t) * rr, Math.sin(t) * rr); } g.stroke(); g.restore(); } },
  // hexer: a curse sigil (a turning pentagon) and greenish-violet smoke
  occult(g, X, Y, k, m, st, d){ const a = cbF(k), r = (12 + st * 6) * m * cbE(Math.min(1, k * 2)); g.globalCompositeOperation = 'lighter';
    g.save(); g.translate(X, Y); g.rotate(k * (st === 1 ? -3 : 3)); g.globalAlpha = a; g.strokeStyle = 'rgba(190,120,255,.95)'; g.lineWidth = 1.6; g.beginPath();
    for (let i = 0; i <= 5; i++){ const an = (i * 2) / 5 * Math.PI * 2 - Math.PI / 2; g.lineTo(Math.cos(an) * r, Math.sin(an) * r); } g.stroke();
    if (st === 2){ g.strokeStyle = 'rgba(150,255,170,.9)'; g.beginPath(); g.arc(0, 0, r * 1.25, 0, 7); g.stroke(); } g.restore();
    g.globalCompositeOperation = 'source-over'; for (let i = 0; i < 5 + st * 2; i++){ const an = i * 2.3 + d, q = cbE(k); g.globalAlpha = a * .5 * (1 - q); g.fillStyle = i % 2 ? 'rgba(60,20,80,1)' : 'rgba(30,70,40,1)'; g.beginPath(); g.arc(X + Math.cos(an) * q * 18 * m, Y - q * 22 * m + Math.sin(an) * 6 * m, (3 + q * 6) * m, 0, 7); g.fill(); } },
  // merchant: coins burst out with a heavy thud of dust; the overhead chop cracks the ground
  merchant(g, X, Y, k, m, st, d){ const a = cbF(k);
    g.globalAlpha = a * .45 * (1 - k); g.fillStyle = 'rgba(180,150,110,1)'; g.beginPath(); g.ellipse(X, Y + 14 * m, (12 + cbE(k) * 22) * m, (4 + cbE(k) * 6) * m, 0, 0, 7); g.fill();
    for (let i = 0; i < 4 + st * 3; i++){ const an = -Math.PI / 2 + (i - (2 + st)) * .45 + d * .1, sp = (24 + (i % 3) * 8) * m, x = X + Math.cos(an) * sp * k * 1.3, y = Y + Math.sin(an) * sp * k * 1.3 + k * k * 40 * m;
      g.globalAlpha = a; g.fillStyle = '#ffd34a'; g.beginPath(); g.ellipse(x, y, 3 * m * Math.abs(Math.cos(k * 12 + i)) + .6, 3 * m, 0, 0, 7); g.fill(); g.strokeStyle = '#b07810'; g.lineWidth = .8; g.stroke(); }
    if (st === 2){ g.globalAlpha = a; g.strokeStyle = 'rgba(80,50,20,.85)'; g.lineWidth = 1.6; for (let i = 0; i < 5; i++){ const an = i / 5 * Math.PI * 2 + .3; let x = X, y = Y + 14 * m; g.beginPath(); g.moveTo(x, y);
      for (let s2 = 1; s2 <= 3; s2++){ x += Math.cos(an + (s2 % 2 ? .3 : -.3)) * 8 * m * cbE(k); y += Math.sin(an + (s2 % 2 ? .3 : -.3)) * 3 * m * cbE(k); g.lineTo(x, y); } g.stroke(); } } },
  // catfolk: three pink claw streaks; the double paw crosses two sets and leaves a glowing paw print
  catfolk(g, X, Y, k, m, st, d){ const a = cbF(k, .5); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    const sets = st === 2 ? [-1, 1] : [st === 0 ? -1 : 1];
    for (const sd of sets){ const q = cbE(Math.min(1, k * 2.5)); for (let i = -1; i <= 1; i++){ const x0 = X - sd * 14 * m + i * 5 * m, y0 = Y - 14 * m, x1 = x0 + sd * 26 * m * q, y1 = y0 + 26 * m * q;
      g.globalAlpha = a * .5; g.strokeStyle = 'rgba(255,120,180,1)'; g.lineWidth = 5; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + sd * 6 * m, y0 + 16 * m * q, x1, y1); g.stroke();
      g.globalAlpha = a; g.strokeStyle = '#fff'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + sd * 6 * m, y0 + 16 * m * q, x1, y1); g.stroke(); } }
    if (st === 2){ g.globalAlpha = a * (1 - k * .5); g.fillStyle = 'rgba(255,170,210,.9)'; g.beginPath(); g.ellipse(X, Y + 4 * m, 5 * m, 4 * m, 0, 0, 7); g.fill();
      for (let i = 0; i < 4; i++){ const an = -Math.PI / 2 + (i - 1.5) * .55; g.beginPath(); g.arc(X + Math.cos(an) * 8 * m, Y + 4 * m + Math.sin(an) * 7 * m, 2 * m, 0, 7); g.fill(); } } },
  // dogfolk: two amber fang arcs snap shut like jaws; the rising cut ends in a howl ring
  dogfolk(g, X, Y, k, m, st, d){ const a = cbF(k, .45), q = cbE(Math.min(1, k * 2.4)), gap = (1 - q) * 12 * m + 2 * m; g.globalCompositeOperation = 'lighter';
    for (const sd of [-1, 1]){ g.globalAlpha = a; g.strokeStyle = 'rgba(255,190,80,1)'; g.lineWidth = 2.4; g.beginPath(); g.arc(X, Y + sd * gap, 14 * m, sd < 0 ? .2 : Math.PI + .2, sd < 0 ? Math.PI - .2 : 2 * Math.PI - .2); g.stroke();
      g.fillStyle = '#fff6e0'; for (let i = 0; i < 4; i++){ const an = (sd < 0 ? .5 : Math.PI + .5) + i * .7, x = X + Math.cos(an) * 14 * m, y = Y + sd * gap + Math.sin(an) * 14 * m; g.beginPath(); g.moveTo(x - 1.6, y); g.lineTo(x + 1.6, y); g.lineTo(x, y - sd * 5 * m); g.closePath(); g.fill(); } }
    if (st === 2){ for (let r = 0; r < 2; r++){ const qq = cbE(Math.max(0, k - r * .15)); g.globalAlpha = a * (1 - qq); g.strokeStyle = 'rgba(255,210,120,1)'; g.lineWidth = 2; g.beginPath(); g.ellipse(X, Y, (16 + qq * 34) * m, (8 + qq * 16) * m, 0, 0, 7); g.stroke(); } } },
  // ninja: a cyan pinwheel of sparks where the star bites; the paired throw bursts into smoke and leaves
  ninja(g, X, Y, k, m, st, d){ const a = cbF(k); g.globalCompositeOperation = 'lighter';
    g.save(); g.translate(X, Y); g.rotate(k * 9); g.globalAlpha = a; for (let i = 0; i < 4; i++){ g.rotate(Math.PI / 2); g.fillStyle = 'rgba(140,240,255,.95)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(3 * m, -4 * m); g.lineTo(0, -(12 + st * 4) * m * (1 - k * .5)); g.closePath(); g.fill(); } g.restore();
    for (let i = 0; i < 6 + st * 3; i++){ const an = i * 2.2 + d, q = cbE(k); g.globalAlpha = a; g.fillStyle = '#e0fbff'; g.fillRect(X + Math.cos(an) * q * 24 * m, Y + Math.sin(an) * q * 14 * m, 1.6, 1.6); }
    if (st === 2){ g.globalCompositeOperation = 'source-over'; for (let i = 0; i < 6; i++){ const an = i / 6 * Math.PI * 2, q = cbE(k); g.globalAlpha = a * .55 * (1 - q); g.fillStyle = '#d8dce8'; g.beginPath(); g.arc(X + Math.cos(an) * q * 16 * m, Y + Math.sin(an) * q * 9 * m, (5 + q * 8) * m, 0, 7); g.fill(); }
      for (let i = 0; i < 4; i++){ const an = i * 1.6 + d, q = cbE(k); g.save(); g.translate(X + Math.cos(an) * q * 30 * m, Y + Math.sin(an) * q * 16 * m + q * 12 * m); g.rotate(an + k * 5); g.globalAlpha = a; g.fillStyle = '#7ccf6a'; g.beginPath(); g.ellipse(0, 0, 3.6, 1.6, 0, 0, 7); g.fill(); g.restore(); } } }
};
function cbFx(line, st, t){ const f = CB_FX[line]; if (!f || !t || typeof fx2Add !== 'function') return;
  const wx = t.x, wy = t.y - (typeof MOB_H !== 'undefined' && MOB_H[t.type] ? MOB_H[t.type] * .5 : 16), d = Math.atan2(t.y - P.y, t.x - P.x), el = (typeof DER !== 'undefined' && DER.welem) || 'neutral';
  fx2Add({life:st === 2 ? .62 : .48, draw(g, k, z){ g.save(); try { f(g, sx(wx), sy(wy), k, z * (typeof GFX !== 'undefined' && GFX.fx === 0 ? .8 : 1), st, d, el); } finally { g.restore(); } }});
  if (st === 2 && typeof VFX !== 'undefined') VFX.shake(line === 'merchant' || line === 'muay' ? 2.2 : 1.2); }

/* ---------- the combo ---------- */
{ const _ba = basicAttack;
  basicAttack = function(t){
    const line = cbLine(), acts = CB329.lines[line];
    if (!acts || !t) return _ba.apply(this, arguments);
    if (T - CB329.last > 1.8 || CB329.tgt !== t) CB329.i = 0;
    const st = CB329.i, act = acts[st]; CB329.i = (CB329.i + 1) % 3; CB329.last = T; CB329.tgt = t;
    // the class's own hit effect replaces the shared slash and swing marks for this blow
    const _vp = VFX.play; CB329.quiet = true;
    VFX.play = function(key){ if (CB329.quiet && (key === 'slashHit' || key === 'swingArc' || key === 'clawHit' || key === 'punchHit')) return; return _vp.apply(this, arguments); };
    let r; try { r = _ba.apply(this, arguments); } finally { CB329.quiet = false; VFX.play = _vp; }
    if (!(P.atkAnim > 0)) return r;   // nothing went off (no arrows)
    const sh = heroSheet(); if (sh && sh.index[act]){
      // the blow fits inside the time to the next one: at a high attack speed the pose plays faster instead of being cut off
      const gap = Math.max(.2, (typeof DER !== 'undefined' && DER.interval) || .5) * .92, dur = Math.min(5 / 15, gap);
      sh.index[act].fps = 5 / dur; P.skAct = act; P.skillAnim = dur + .02; P.atkAnim = 0;
      P.act = act; P.animT = 0; CB329.pose = act; CB329.until = T + dur; }   // start on its first frame (it showed the last frame of the one before for a moment)
    // when the blow lands: at once for a hand weapon, on arrival for a bolt, an arrow or a star
    const far = JOBS[S.job].caster || JOBS[S.job].ranged || JOBS[S.job].weapon.type === 'shuriken', sp = JOBS[S.job].caster ? 520 : JOBS[S.job].weapon.type === 'shuriken' ? 760 : 720;
    const delay = far ? (JOBS[S.job].caster ? .12 : .06) + Math.hypot(t.x - P.x, t.y - P.y) / sp : (JOBS[S.job].weapon.type === 'dagger' ? .06 : .1);
    later(delay, () => { if (!t.dead || st === 2) cbFx(line, st, t); });
    return r; }; }
/* a quick look at every line's blows from the console: cbDemo() */
function cbDemo(){ const t = mobs.find(m => !m.dead); if (!t) return; let i = 0; const go = () => { if (i >= 3) return; cbFx(cbLine(), i++, t); setTimeout(go, 600); }; go(); }

/* ---------- (v329) skill poses: no pose stands in for more than four skills of one class, and every skill you use has one ---------- */
const SK329 = {acts:{orbit:{n:5, fps:9, th:'หมุนลูกพลังหน้าอก'}, kneelpray:{n:5, fps:7, th:'คุกเข่าพนมมือ'}, bless:{n:5, fps:9, th:'ยื่นฝ่ามืออวยพร'}, release:{n:5, fps:10, th:'ไขว้แขนแล้วกางออก'},
    beckon:{n:5, fps:9, th:'กวาดแขนเรียกจากพื้น'}, staffspin:{n:5, fps:11, th:'หมุนไม้เท้าเป็นวง'}, sidestep:{n:5, fps:14, th:'ก้าวหลบข้าง'}, focus:{n:5, fps:8, th:'แตะหน้าผากรวมสมาธิ'}},
  map:{ // mage (was invoke ×8, skyraise ×5)
    barrier:'orbit', meditate:'kneelpray', blink:'sidestep', starstep:'sidestep', starveil:'staffspin', elemseal:'staffspin', frostnova:'release', cataclysm:'release', meteor:'release',
    // healer (was invoke ×7, wai ×5)
    herbstorm:'staffspin', ward:'orbit', amrita:'bless', holylight:'bless', purify:'bless', sanctum:'bless', massrevive:'kneelpray', revive:'kneelpray', judgment:'release',
    // summoner (was invoke ×7, point ×5)
    callsingha:'beckon', callkinnaree:'beckon', unity:'beckon', royaledict:'beckon', spiritlink:'orbit', soulpact:'orbit', heavenfall:'release', astralray:'sweep',
    // hunter and rogue skills that had no pose at all
    doubleshot:'kneelshot', backstep:'sidestep', poison:'throw', tigerleap:'sidestep', killerinstinct:'focus', tigerdance:'ramwai',
    // the rest that leaned on one pose five or six times: swordsman slam, hunter aim-up, rogue crouch, cat wai, dog lunge
    judgement:'crossslash', tuskcharge:'lunge', hunterfocus:'focus', snarefield:'settrap', thiefsense:'focus', venomblade:'twinspin',
    catblessing:'bless', purr:'focus', houndrush:'stab', waveslash:'sweep'}};
for (const a in SK329.acts) SPR.ACTIONS[a] = SK329.acts[a];
for (const id in SK329.map){ const sk = SKILLS[id]; if (!sk) continue; sk.act = SK329.map[id];
  for (const j in JOBS){ const ch = jobChain(j); if (!ch.includes(sk.job)) continue; SPR.CHAR_ACTIONS[j] = [...new Set([...(SPR.CHAR_ACTIONS[j] || []), sk.act])]; } }
/* every pose a job's skills use is in that job's sheet; a skill naming a pose that does not exist falls back to a fitting one */
{ const FALL = {spin:'whirl'};
  for (const id in SKILLS){ const sk = SKILLS[id]; if (!sk.act || SPR.ACTIONS[sk.act]) continue; if (FALL[sk.act]) sk.act = FALL[sk.act]; }
  for (const j in JOBS){ const ch = jobChain(j), want = new Set(SPR.CHAR_ACTIONS[j] || []);
    for (const id in SKILLS){ const sk = SKILLS[id]; if (sk.act && SPR.ACTIONS[sk.act] && ch.includes(sk.job)) want.add(sk.act); } SPR.CHAR_ACTIONS[j] = [...want]; } }
/* a blow stays whole: a second strike in the same attack (twin fists, a double hit) used to restart the old swing and its clock */
if (typeof updPlayer === 'function'){ const _up = updPlayer;
  updPlayer = function(){ if (CB329.pose && T < CB329.until && P.skAct === CB329.pose){ P.atkAnim = 0; if (P.act === null) P.act = CB329.pose; } else CB329.pose = null; return _up.apply(this, arguments); }; }

/* ---------- (v330) each class's own sound on its combo: a light accent on the first two blows, a full finisher on the third
   (synthesised like every other sound in the game, through the effects volume; never louder than a normal hit) ---------- */
const CBS = (() => {
  const R = () => (typeof SFX !== 'undefined' && SFX.raw ? SFX.raw() : null);
  function tone(a, out, type, f, t, d, v, to, lp){ const s = a.createOscillator(), g = a.createGain(); s.type = type; s.frequency.setValueAtTime(f, t); if (to) s.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + d);
    let n = s; if (lp){ const fl = a.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; s.connect(fl); n = fl; } n.connect(g); g.connect(out);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .004); g.gain.exponentialRampToValueAtTime(.0004, t + d); s.start(t); s.stop(t + d + .05); }
  function hiss(a, out, nb, t, d, v, f, to, q = 1, type = 'bandpass'){ const s = a.createBufferSource(), g = a.createGain(), fl = a.createBiquadFilter(); s.buffer = nb; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, t); if (to) fl.frequency.exponentialRampToValueAtTime(to, t + d); fl.Q.value = q;
    s.connect(fl); fl.connect(g); g.connect(out); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .003); g.gain.exponentialRampToValueAtTime(.0004, t + d); s.start(t); s.stop(t + d + .05); }
  const V = {
    blade(a, o, nb, t, st){ hiss(a, o, nb, t, .09, .18, 5200, 2600, 3); tone(a, o, 'triangle', st === 2 ? 2400 : 1800, t + .01, st === 2 ? .45 : .2, .07, st === 2 ? 2300 : 1700); if (st === 2) tone(a, o, 'sine', 3600, t + .02, .5, .04); },
    rune(a, o, nb, t, st){ tone(a, o, 'sine', 520 + st * 140, t, .22 + st * .1, .1, 1300 + st * 300); if (st === 2){ hiss(a, o, nb, t + .02, .35, .14, 900, 200, .8); tone(a, o, 'sine', 180, t, .35, .12, 70); } },
    ranger(a, o, nb, t, st){ hiss(a, o, nb, t, .06, .12, 3000, 6000, 2); tone(a, o, 'triangle', 300, t, .06, .07, 160); if (st === 2) hiss(a, o, nb, t + .03, .22, .1, 7000, 2500, 4); },
    muay(a, o, nb, t, st){ tone(a, o, 'sine', 150, t, .12 + st * .06, .2 + st * .05, 55); hiss(a, o, nb, t, .05, .2, 1400, 600, 1); if (st === 2) hiss(a, o, nb, t + .01, .2, .16, 500, 120, .7, 'lowpass'); },
    healer(a, o, nb, t, st){ const base = [880, 1046, 1318][st]; tone(a, o, 'sine', base, t, .4, .07); tone(a, o, 'sine', base * 1.5, t + .05, .45, .04); if (st === 2) tone(a, o, 'sine', base * 2, t + .1, .6, .04); },
    rogue(a, o, nb, t, st){ hiss(a, o, nb, t, .05, .16, 7000, 3500, 5); if (st >= 1) hiss(a, o, nb, t + .06, .05, .14, 6500, 3200, 5); if (st === 2) tone(a, o, 'sawtooth', 220, t, .18, .05, 110, 900); },
    summoner(a, o, nb, t, st){ tone(a, o, 'sine', 660, t, .3, .06, 990); tone(a, o, 'sine', 990, t + .04, .3, .04, 660); if (st === 2){ tone(a, o, 'triangle', 330, t, .5, .06, 495); hiss(a, o, nb, t, .4, .06, 2500, 5000, 3); } },
    occult(a, o, nb, t, st){ tone(a, o, 'sawtooth', 110 + st * 20, t, .25, .06, 70, 700); hiss(a, o, nb, t, .2, .08, 600, 300, 4); if (st === 2) tone(a, o, 'sine', 55, t, .5, .12, 40); },
    merchant(a, o, nb, t, st){ tone(a, o, 'sine', 120, t, .14, .2, 60); const n = st === 2 ? 5 : 2; for (let i = 0; i < n; i++){ tone(a, o, 'square', 2600 + i * 230, t + .03 + i * .045, .08, .025, 2500 + i * 230, 5000); } if (st === 2) hiss(a, o, nb, t, .25, .12, 400, 150, .8, 'lowpass'); },
    catfolk(a, o, nb, t, st){ hiss(a, o, nb, t, .07, .14, 4200, 8000, 3); if (st === 2){ tone(a, o, 'sawtooth', 700, t + .02, .22, .05, 420, 2400); tone(a, o, 'sine', 1400, t + .02, .2, .03, 900); } },
    dogfolk(a, o, nb, t, st){ tone(a, o, 'square', 180, t, .06, .08, 120, 1200); hiss(a, o, nb, t, .04, .14, 2200, 1200, 2); if (st === 2){ tone(a, o, 'sawtooth', 300, t + .05, .5, .05, 520, 1500); tone(a, o, 'sawtooth', 302, t + .05, .5, .04, 524, 1500); } },
    ninja(a, o, nb, t, st){ hiss(a, o, nb, t, .1, .1, 6000, 9000, 6); tone(a, o, 'triangle', 3200, t + .02, .06, .04, 2800); if (st === 2) hiss(a, o, nb, t + .03, .3, .1, 1800, 600, .7); }};
  return {play(line, st){ const r = R(); if (!r || !V[line] || r.vol.s <= 0) return; try { V[line](r.ac, r.out, r.nb, r.ac.currentTime + .005, st); } catch (e) {} }};
})();
{ const _fx = cbFx; cbFx = function(line, st){ CBS.play(line, st); return _fx.apply(this, arguments); }; }
