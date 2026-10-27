/* VAYRATHEN — js/sys/backcute.js — the back slot is not only wings any more (v56)
   The wings that looked odd or unnatural (floating orbs, loose flames, swirl clouds, snowflakes, blades, grass, maple
   stars, hellfire, spines, bones, tube ribbons, the eyed monarch and the tiny imp) are gone. In their place: auras that
   drift around the hero (stars, hearts, sakura, soap bubbles, butterflies, music notes, snow, a rainbow), two cute
   backpacks, a big ribbon bow, a heart balloon and a pair of little angel wings.
   Everything moves slowly and fades smoothly: nothing flashes or blinks. Dyes still recolour every piece (W.c). */
'use strict';

for (const id of ['w_galaxy', 'w_blueflame', 'w_kanokj', 'w_bladei', 'w_blade', 'w_leaf', 'w_autumn', 'w_satan', 'w_demon', 'w_dragonr', 'w_ribbon', 'w_monarch', 'w_imp', 'w_satanv']) delete WINGS[id];

const BACK_CUTE = [
  ['a_sparkle', 'ออร่าดาวระยิบระยับ', 'Twinkling Star Aura', 'aStar', ['#ffffff', '#ffe58a', '#f5a623'], '255,214,110', 120],
  ['a_heart', 'ออร่าหัวใจลอยฟ่อง', 'Floating Hearts Aura', 'aHeart', ['#ffe0ec', '#ff7aa8', '#e0306a'], '255,120,170', 120],
  ['a_sakura', 'ออร่ากลีบซากุระโปรย', 'Sakura Petal Aura', 'aPetal', ['#ffffff', '#ffc8dc', '#ff8ab4'], '255,180,210', 120],
  ['a_bubble', 'ออร่าฟองสบู่สีรุ้ง', 'Rainbow Bubble Aura', 'aBubble', ['#ffffff', '#bfefff', '#c8a8ff'], '170,220,255', 110],
  ['a_butterfly', 'ผีเสื้อแสงบินวน', 'Glowing Butterflies', 'aFly', ['#ffffff', '#9fe8ff', '#7a8cff'], '150,210,255', 130],
  ['a_note', 'ออร่าตัวโน้ตดนตรี', 'Music Note Aura', 'aNote', ['#ffffff', '#c8a8ff', '#7a4ae0'], '190,150,255', 110],
  ['a_snow', 'ออร่าหิมะแรกโปรย', 'First Snow Aura', 'aSnow', ['#ffffff', '#e0f6ff', '#8ac8f0'], '200,235,255', 110],
  ['a_rainbow', 'วงรุ้งรัศมี', 'Rainbow Halo Ring', 'aRainbow', ['#ff8a8a', '#ffe08a', '#8ad0ff'], '255,220,170', 140],
  ['b_bunny', 'กระเป๋าเป้กระต่ายน้อย', 'Bunny Backpack', 'bBunny', ['#ffffff', '#ffd0e0', '#ff8ab0'], '255,190,215', 90],
  ['b_bear', 'กระเป๋าเป้หมีน้อย', 'Teddy Bear Backpack', 'bBear', ['#ffe8c8', '#c8905a', '#7a4a24'], '230,180,120', 90],
  ['b_bow', 'โบว์ใหญ่ชมพูพาสเทล', 'Big Pastel Bow', 'bBow', ['#ffffff', '#ffb0cc', '#e05a8a'], '255,170,200', 80],
  ['b_bowb', 'โบว์ใหญ่ฟ้าน้ำทะเล', 'Big Sky-blue Bow', 'bBow', ['#ffffff', '#a8dcff', '#3a8ae0'], '160,210,255', 80],
  ['b_balloon', 'ลูกโป่งหัวใจ', 'Heart Balloon', 'bBalloon', ['#ffe0ea', '#ff5a8a', '#c8204e'], '255,110,150', 70]
];
for (const [id, th, en, kind, c, glow, price] of BACK_CUTE) WINGS[id] = {set:null, th, en, kind, c, edge:c[2], glow, fx:'none', span:1, price:{c:price}, cute:true};
WINGS.w_angel = {set:null, th:'ปีกนางฟ้าจิ๋ว', en:'Little Angel Wings', kind:'feather', c:['#ffffff', '#fff4fa', '#ffc0d8'], edge:'#f0a8c4', glow:'255,210,230', fx:'feather', span:.62, price:{c:110}};

/* small shapes */
const BKC = {
  star(g, x, y, r){ g.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); },
  heart(g, x, y, r){ g.beginPath(); g.moveTo(x, y + r * .9); g.bezierCurveTo(x - r * 1.4, y - r * .1, x - r * .7, y - r * 1.2, x, y - r * .45); g.bezierCurveTo(x + r * .7, y - r * 1.2, x + r * 1.4, y - r * .1, x, y + r * .9); g.closePath(); },
  petal(g, x, y, r, a){ g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(r * .8, 0, 0, r); g.quadraticCurveTo(-r * .8, 0, 0, -r); g.closePath(); g.restore(); },
  snow(g, x, y, r){ g.beginPath(); for (let i = 0; i < 3; i++){ const a = i * Math.PI / 3; g.moveTo(x - Math.cos(a) * r, y - Math.sin(a) * r); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } },
  note(g, x, y, r, col){ g.fillStyle = col; g.strokeStyle = col; g.lineWidth = r * .28; g.beginPath(); g.ellipse(x, y, r * .62, r * .45, -.4, 0, 7); g.fill();
    g.beginPath(); g.moveTo(x + r * .5, y - r * .1); g.lineTo(x + r * .5, y - r * 1.9); g.quadraticCurveTo(x + r * 1.3, y - r * 1.5, x + r * 1.2, y - r * .8); g.stroke(); },
  hash(i, k){ const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); }
};
/* where the hero's back is, from the way they face (S SW W NW N NE E SE) */
const BK_FACE = [[0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1]];
/* drifting particles: deterministic from the time (no state), half behind the hero and half in front */
function bkParticles(g, W, x, top, t, part, n, speed, draw){
  for (let i = 0; i < n; i++){ if ((i % 2 === 0) !== (part === 'back')) continue;
    const ph = (t * speed + BKC.hash(i, 1)) % 1, a = Math.sin(ph * Math.PI);
    const px = x + (BKC.hash(i, 2) - .5) * 50 + Math.sin(t * .9 + i) * 3, py = top + 58 - ph * 62;
    g.globalAlpha = a * .95; draw(px, py, i, ph); }
  g.globalAlpha = 1;
}
const BK_DRAW = {
  aura(g, W, x, y, t, part, o, kind){
    const top = y - (o.ride ? 70 : 56) + (o.sit ? 6 : 0), c = W.c;
    if (part === 'back'){ g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, top + 32, 2, x, top + 32, 34); gr.addColorStop(0, `rgba(${W.glow},.32)`); gr.addColorStop(1, `rgba(${W.glow},0)`); g.fillStyle = gr; g.beginPath(); g.ellipse(x, top + 32, 30, 36, 0, 0, 7); g.fill(); g.restore();
      g.save(); g.strokeStyle = `rgba(${W.glow},.55)`; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y + (o.ride ? -15 : 0), 15, 4.5, 0, 0, 7); g.stroke(); g.restore(); }
    g.save();
    if (kind === 'aStar') bkParticles(g, W, x, top, t, part, 14, .32, (px, py, i) => { BKC.star(g, px, py, 2.4 + BKC.hash(i, 3) * 2); g.fillStyle = i % 3 ? c[1] : c[0]; g.fill(); g.strokeStyle = c[2]; g.lineWidth = .5; g.stroke(); });
    else if (kind === 'aHeart') bkParticles(g, W, x, top, t, part, 12, .28, (px, py, i) => { BKC.heart(g, px, py, 2.6 + BKC.hash(i, 3) * 1.8); g.fillStyle = i % 3 ? c[1] : c[0]; g.fill(); g.strokeStyle = c[2]; g.lineWidth = .5; g.stroke(); });
    else if (kind === 'aPetal') bkParticles(g, W, x, top, t, part, 16, -.22, (px, py, i, ph) => { BKC.petal(g, px + Math.sin(ph * 9 + i) * 4, py, 2.8, ph * 6 + i); g.fillStyle = i % 2 ? c[1] : c[2]; g.fill(); });
    else if (kind === 'aBubble') bkParticles(g, W, x, top, t, part, 12, .25, (px, py, i) => { const r = 2.6 + BKC.hash(i, 3) * 2.8, gr = g.createLinearGradient(px - r, py - r, px + r, py + r); gr.addColorStop(0, '#ffb8e0'); gr.addColorStop(.5, c[1]); gr.addColorStop(1, c[2]);
      g.beginPath(); g.arc(px, py, r, 0, 7); g.fillStyle = 'rgba(255,255,255,.18)'; g.fill(); g.strokeStyle = gr; g.lineWidth = .7; g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(px - r * .35, py - r * .4, r * .25, 0, 7); g.fill(); });
    else if (kind === 'aNote') bkParticles(g, W, x, top, t, part, 10, .26, (px, py, i) => BKC.note(g, px, py, 2.8 + BKC.hash(i, 3) * 1.2, i % 2 ? c[1] : c[2]));
    else if (kind === 'aSnow') bkParticles(g, W, x, top, t, part, 16, -.18, (px, py, i) => { BKC.snow(g, px, py, 2.2 + BKC.hash(i, 3) * 1.6); g.strokeStyle = i % 2 ? c[1] : c[2]; g.lineWidth = .8; g.lineCap = 'round'; g.stroke(); });
    else if (kind === 'aFly'){ for (let i = 0; i < 3; i++){ const a = t * .7 + i * 2.1, px = x + Math.cos(a) * 20, py = top + 30 + Math.sin(a * 1.3) * 10 - i * 4, front = Math.sin(a) > 0;
        if (front !== (part === 'front')) continue; const fl = .35 + Math.abs(Math.sin(t * 6 + i)) * .65;
        g.save(); g.translate(px, py); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(${W.glow},.3)`; g.beginPath(); g.arc(0, 0, 5, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over';
        for (const sd of [-1, 1]){ g.save(); g.scale(sd * fl, 1); g.fillStyle = c[1]; g.beginPath(); g.ellipse(2.2, -1.4, 2.4, 1.8, -.5, 0, 7); g.fill(); g.fillStyle = c[2]; g.beginPath(); g.ellipse(1.6, 1.4, 1.5, 1.2, .5, 0, 7); g.fill(); g.restore(); }
        g.fillStyle = '#3a2a5a'; g.fillRect(-.35, -2, .7, 4); g.restore(); } }
    else if (kind === 'aRainbow' && part === 'back'){ const cy = top + 22, cols = ['#ff7a7a', '#ffb05a', '#ffe06a', '#7ae08a', '#6ac0ff', '#9a8aff'];
      g.globalAlpha = .7; for (let i = 0; i < cols.length; i++){ g.strokeStyle = cols[i]; g.lineWidth = 1.6; g.beginPath(); g.arc(x, cy, 22 - i * 1.6, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); }
      g.globalAlpha = 1; for (const sd of [-1, 1]){ g.fillStyle = '#ffffff'; for (let j = 0; j < 3; j++){ g.beginPath(); g.arc(x + sd * (17 + j * 3), cy + 6 - j * 1.2, 2.6 - j * .4, 0, 7); g.fill(); } } }
    g.restore();
  },
  /* a backpack: seen whole from behind, at the side from the side, and only its straps from the front */
  bag(g, W, x, y, t, part, o, dir, kind){
    const away = dir >= 3 && dir <= 5, f = BK_FACE[dir] || [0, 1], c = W.c, by = y - (o.ride ? 30 : 15) + (o.sit ? 4 : 0) + Math.sin(t * 2) * .3;
    if (!away && dir !== 2 && dir !== 6){ if (part === 'front'){ g.save(); g.strokeStyle = c[2]; g.lineWidth = 1.6; g.lineCap = 'round'; for (const sd of [-1, 1]){ g.beginPath(); g.moveTo(x + sd * 4.6, by - 7); g.lineTo(x + sd * 5.4, by + 3); g.stroke(); } g.restore(); }
      if (part !== 'back') return; }
    else if ((part === 'front') !== (away || dir === 2 || dir === 6)) return;   // seen from the side it hangs on the back edge, over the body
    const bx = x - f[0] * (dir === 2 || dir === 6 ? 7.5 : 5), w = 10, h = 11;
    g.save(); g.translate(bx, by); if (dir === 2 || dir === 6) g.scale(.7, 1);
    const ears = kind === 'bBunny' ? [[-3, -h / 2 - 7, 1.8, 6], [3, -h / 2 - 7, 1.8, 6]] : [[-4, -h / 2 - 1.5, 2.6, 2.6], [4, -h / 2 - 1.5, 2.6, 2.6]];
    for (const [ex, ey, rx, ry] of ears){ g.fillStyle = c[1]; g.beginPath(); g.ellipse(ex, ey, rx, ry, 0, 0, 7); g.fill(); g.strokeStyle = c[2]; g.lineWidth = .7; g.stroke(); g.fillStyle = kind === 'bBunny' ? '#ff9ac0' : c[0]; g.beginPath(); g.ellipse(ex, ey + ry * .1, rx * .5, ry * .62, 0, 0, 7); g.fill(); }
    const gr = g.createLinearGradient(0, -h / 2, 0, h / 2); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]);
    g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 4); g.fillStyle = gr; g.fill(); g.strokeStyle = c[2]; g.lineWidth = .8; g.stroke();
    if (away){ g.fillStyle = '#2a1a1a'; for (const sd of [-1, 1]){ g.beginPath(); g.arc(sd * 2, -1.2, .75, 0, 7); g.fill(); } g.beginPath(); g.ellipse(0, .6, .7, .5, 0, 0, 7); g.fillStyle = kind === 'bBunny' ? '#ff6a9a' : '#3a2010'; g.fill();
      g.fillStyle = 'rgba(255,120,160,.45)'; for (const sd of [-1, 1]){ g.beginPath(); g.ellipse(sd * 3.4, 1.2, 1.1, .6, 0, 0, 7); g.fill(); }
      g.beginPath(); g.roundRect(-3.2, 2.4, 6.4, 2.4, 1.2); g.fillStyle = c[2]; g.fill(); }
    g.restore();
  },
  bow(g, W, x, y, t, part, o, dir){
    const away = dir >= 3 && dir <= 5; if ((part === 'front') !== away) return;
    const f = BK_FACE[dir] || [0, 1], c = W.c, bx = x - f[0] * 5, by = y - (o.ride ? 27 : 12) + (o.sit ? 4 : 0), sw = Math.sin(t * 1.6) * .05;
    g.save(); g.translate(bx, by); if (dir === 2 || dir === 6) g.scale(.6, 1);
    for (const sd of [-1, 1]){ g.save(); g.rotate(sd * (.12 + sw)); g.fillStyle = c[1]; g.strokeStyle = c[2]; g.lineWidth = .8;
      g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(sd * 6, -9, sd * 15, -6, sd * 13, 1); g.bezierCurveTo(sd * 12, 6, sd * 5, 4, 0, 0); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(sd * 2, 0); g.quadraticCurveTo(sd * 8, -4, sd * 11, -1); g.strokeStyle = c[0]; g.lineWidth = .7; g.stroke();
      g.beginPath(); g.moveTo(sd * 1, 1); g.lineTo(sd * (4 + Math.sin(t * 2 + sd) * .6), 13); g.lineTo(sd * 7, 11.5); g.lineTo(sd * 3, 1); g.closePath(); g.fillStyle = c[1]; g.fill(); g.strokeStyle = c[2]; g.lineWidth = .7; g.stroke(); g.restore(); }
    g.beginPath(); g.ellipse(0, 0, 2.6, 3, 0, 0, 7); g.fillStyle = c[2]; g.fill(); g.restore();
  },
  balloon(g, W, x, y, t, part, o, dir){
    if (part !== 'back') return; const c = W.c, sx = x + 5, sy = y - (o.ride ? 30 : 15) + (o.sit ? 4 : 0), bx = x + 15 + Math.sin(t * .9) * 2, byy = y - (o.ride ? 72 : 58) + Math.sin(t * 1.3) * 1.5;
    g.save(); g.strokeStyle = 'rgba(80,60,70,.7)'; g.lineWidth = .5; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo((sx + bx) / 2 + 3, (sy + byy) / 2, bx, byy + 8); g.stroke();
    const gr = g.createRadialGradient(bx - 2.5, byy - 2.5, 1, bx, byy, 11); gr.addColorStop(0, c[0]); gr.addColorStop(.45, c[1]); gr.addColorStop(1, c[2]);
    BKC.heart(g, bx, byy, 8.5); g.fillStyle = gr; g.fill(); g.strokeStyle = c[2]; g.lineWidth = .6; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(bx - 3.6, byy - 3.4, 1.4, 2.4, -.6, 0, 7); g.fill();
    g.beginPath(); g.moveTo(bx - 1, byy + 8); g.lineTo(bx + 1, byy + 8); g.lineTo(bx, byy + 9.6); g.closePath(); g.fillStyle = c[2]; g.fill(); g.restore();
  }
};
{ const _dw = drawWings;
  drawWings = function(g, id, x, y, dir, t, o = {}){
    const W = wingDef(id); if (!W || !W.cute) return _dw.apply(this, arguments);
    const part = o.part === 'front' ? 'front' : 'back', k = W.kind;
    g.save(); if (o.scale && o.scale !== 1){ g.translate(x, y); g.scale(o.scale, o.scale); g.translate(-x, -y); }
    if (k[0] === 'a') BK_DRAW.aura(g, W, x, y, t, part, o, k);
    else if (k === 'bBunny' || k === 'bBear') BK_DRAW.bag(g, W, x, y, t, part, o, dir || 0, k);
    else if (k === 'bBow') BK_DRAW.bow(g, W, x, y, t, part, o, dir || 0);
    else if (k === 'bBalloon') BK_DRAW.balloon(g, W, x, y, t, part, o, dir || 0);
    g.restore();
  }; }

/* ---------- the face slot: cute things girls pick most (v56) ----------
   Round and big "Korean style" glasses, heart and star glasses, cat-eye frames, blush, cat whiskers, a cheek plaster,
   heart & star stickers, a cloth mask with a cat mouth, and (v57) things worn at the side of the head: elf ears,
   floppy puppy ears, lamb ears, mermaid fins, feather ears and fluffy earmuffs. The scary or odd masks (skulls, oni, khon heads, visors, tigers, Rahu…)
   are gone; five pretty ones stay (masquerade, rainbow butterfly, sakura fox, two veils). */
for (const id of Object.keys(COSTUME)) if (COSTUME[id].slot === 'mask' && !['k_domino', 'k_flyr', 'k_foxs', 'k_veil', 'k_veilb'].includes(id)) delete COSTUME[id];
const FACE_CUTE = [
  ['f_round', 'แว่นกลมกรอบทอง', 'Round Gold Glasses', {faceMask:'sky', fmStyle:'round', fmTrim:'gold'}, 50],
  ['f_roundp', 'แว่นกลมพาสเทลชมพู', 'Pastel Pink Round Glasses', {faceMask:'sky', fmStyle:'round', fmTrim:'rose'}, 50],
  ['f_big', 'แว่นใหญ่สไตล์เกาหลี', 'Big Korean-style Glasses', {faceMask:'sky', fmStyle:'big', fmTrim:'charcoal'}, 50],
  ['f_heart', 'แว่นหัวใจชมพูหวาน', 'Sweet Pink Heart Glasses', {faceMask:'sakura', fmStyle:'heart', fmTrim:'rose'}, 60],
  ['f_heartr', 'แว่นหัวใจเชอร์รี่', 'Cherry Heart Glasses', {faceMask:'scarlet', fmStyle:'heart', fmTrim:'crimson'}, 60],
  ['f_star', 'แว่นดาวทองประกาย', 'Golden Star Glasses', {faceMask:'sun', fmStyle:'star', fmTrim:'goldLight'}, 60],
  ['f_cateye', 'แว่นตาแมวคลาสสิก', 'Classic Cat-eye Glasses', {faceMask:'sky', fmStyle:'cateye', fmTrim:'onyx'}, 55],
  ['f_blush', 'แก้มแดงระเรื่อ', 'Rosy Blush', {faceMask:'sakura', fmStyle:'blush', fmTrim:'sakura'}, 40],
  ['f_blushs', 'แก้มชมพูแวววาว', 'Sparkly Pink Blush', {faceMask:'rose', fmStyle:'blush', fmTrim:'goldLight'}, 45],
  ['f_whisker', 'หนวดแมวเหมียว', 'Kitty Whiskers', {faceMask:'rose', fmStyle:'whisker', fmTrim:'charcoal'}, 45],
  ['f_plaster', 'พลาสเตอร์แก้มลายจุด', 'Polka-dot Cheek Plaster', {faceMask:'cream', fmStyle:'plaster', fmTrim:'sakura'}, 40],
  ['f_sticker', 'สติกเกอร์หัวใจกับดาว', 'Heart & Star Stickers', {faceMask:'rose', fmStyle:'sticker', fmTrim:'goldLight'}, 45],
  ['f_cloth', 'หน้ากากผ้าแมวเหมียว', 'Kitty Cloth Mask', {faceMask:'white', fmStyle:'cloth', fmTrim:'sakura'}, 50],
  ['f_elf', 'หูเอลฟ์', 'Elf Ears', {sideEar:'elf'}, 55],
  ['f_elfl', 'หูเอลฟ์ยาวกับต่างหูทอง', 'Long Elf Ears & Gold Earrings', {sideEar:'elfl', earring:'goldLight'}, 65],
  ['f_elfp', 'หูเอลฟ์กับต่างหูไข่มุก', 'Elf Ears & Pearl Drops', {sideEar:'elf', earring:'pearl', earBig:true}, 60],
  ['f_puppy', 'หูลูกหมาพับสีน้ำตาล', 'Floppy Puppy Ears', {sideEar:'puppy', sideMat:'tan', sideIn:'cream'}, 55],
  ['f_puppyw', 'หูลูกหมาขาวขนปุย', 'Fluffy White Puppy Ears', {sideEar:'puppy', sideMat:'white', sideIn:'sakura'}, 55],
  ['f_sheep', 'หูแกะน้อย', 'Little Lamb Ears', {sideEar:'sheep', sideMat:'cream', sideIn:'sakura'}, 55],
  ['f_fin', 'หูครีบนางเงือก', 'Mermaid Fin Ears', {sideEar:'fin', sideMat:'sky', sideIn:'pearl'}, 65],
  ['f_feather', 'หูขนนกสีขาว', 'White Feather Ears', {sideEar:'feather', sideMat:'white', sideIn:'goldLight'}, 60],
  ['f_muff', 'ที่ปิดหูขนปุยชมพู', 'Pink Fluffy Earmuffs', {sideEar:'muff', sideMat:'sakura', sideIn:'white'}, 50]
];
for (const [id, th, en, look, price] of FACE_CUTE){
  COSTUME[id] = {slot:'mask', th, en, src:'coin', price:{c:price}, grand:false, sw:[look.sideMat || (look.sideEar ? 'skin' : look.fmTrim), look.sideIn || look.earring || look.faceMask || 'skin'], look};
  SPR.GEAR_LOOK[id] = look;
}
/* (v57) ears that sit on top of the head, hair bows and clips belong to the head slot: they replace the hat instead of
   poking through it. Same ids as before, so anything already bought stays owned. */
const HEAD_CUTE = [
  ['f_cat', 'หูแมวขาวชมพู', 'White Kitty Ears', {earKind:'cat', earMat:'white', earIn:'sakura'}, 60],
  ['f_catb', 'หูแมวดำ', 'Black Kitty Ears', {earKind:'cat', earMat:'onyx', earIn:'rose'}, 60],
  ['f_bunny', 'หูกระต่ายขาว', 'White Bunny Ears', {earKind:'bunny', earMat:'white', earIn:'sakura'}, 60],
  ['f_lop', 'หูกระต่ายพับสีครีม', 'Cream Lop Bunny Ears', {earKind:'lop', earMat:'cream', earIn:'rose'}, 60],
  ['f_bear', 'หูหมีน้อยสีน้ำตาล', 'Little Bear Ears', {earKind:'bear', earMat:'tan', earIn:'cream'}, 55],
  ['f_panda', 'หูแพนด้า', 'Panda Ears', {earKind:'bear', earMat:'onyx', earIn:'onyx', bandMat:'white'}, 55],
  ['f_fox', 'หูจิ้งจอกส้ม', 'Orange Fox Ears', {earKind:'fox', earMat:'sunset', earIn:'white'}, 60],
  ['f_mouse', 'หูหนูกลมม่วงพาสเทล', 'Pastel Mouse Ears', {earKind:'mouse', earMat:'lilac', earIn:'sakura'}, 55],
  ['f_bow', 'โบว์ผมแดงใหญ่', 'Big Red Hair Bow', {hairBow:'scarlet', bowKnot:'gold'}, 50],
  ['f_bowp', 'โบว์ชมพูกับกิ๊บดาว', 'Pink Bow & Star Clips', {hairBow:'sakura', bowKnot:'white', hairClip:'star', clipMat:'goldLight'}, 60],
  ['f_clip', 'กิ๊บดอกซากุระ', 'Sakura Hair Clips', {hairClip:'flower', clipMat:'sakura'}, 40],
  ['f_clipstar', 'กิ๊บดาวทอง', 'Gold Star Clips', {hairClip:'star', clipMat:'goldLight'}, 40]
];
for (const [id, th, en, l0, price] of HEAD_CUTE){ const look = {hat:null, ...l0};
  COSTUME[id] = {slot:'head', th, en, src:'coin', price:{c:price}, grand:false, sw:[l0.earMat || l0.hairBow || l0.clipMat, l0.earIn || l0.bowKnot || l0.clipMat], look};
  SPR.GEAR_LOOK[id] = look;
}
/* a piece worn in the face slot before it moved to the head slot moves with it */
EV.on('tick', () => { const c = typeof S !== 'undefined' && S && S.cos; if (!c || !c.mask || !COSTUME[c.mask] || COSTUME[c.mask].slot !== 'head') return;
  c.head = c.mask; c.mask = null; dirty = true; if (typeof renderEquip === 'function') renderEquip(); });
/* the wardrobe tabs say what they hold now */
if (typeof FW_TABS !== 'undefined') for (const t of FW_TABS){ if (t[0] === 'wing'){ t[1] = 'ด้านหลัง'; t[2] = 'Back'; } if (t[0] === 'mask'){ t[1] = 'ใบหน้า'; t[2] = 'Face'; } }
