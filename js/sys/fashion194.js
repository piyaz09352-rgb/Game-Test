/* VAYRATHEN — js/sys/fashion194.js — (v194) the AI / Future collection: 50 new wardrobe pieces
   The owner asked for fifty new looks themed on AI, robots and the far future, and said plainly that a back piece does
   not have to be a pair of wings. None of these are wings:
   · ด้านหลัง Back (14): jetpacks, a reactor-core pack, a satellite antenna, four mechanical arms, a cable tail, an energy
     ring, floating sword drones, companion drones, a drone swarm, hologram screens, hex shield plates, falling binary
     code and a little robot-cat helper. Each is drawn from the way you face (back, side, front) and moves slowly.
   · ส่วนหัว Head (10): headsets (one with cat ears), twin antennas, digital halos, a circuit crown, a mecha helmet, a
     V-fin and an LED band (3D models in gfx/sprites.js, TECH_HATS).
   · ใบหน้า Face (8): cyber shades, a scanner monocle, glowing circuit lines, a respirator, an LED screen face, a scan-line
     visor, the classic visor and tech face marks (painted on the face, gfx/sprites.js FM).
   · ชุดเซต Outfits (12): androids, mecha pilots, hackers, virtual idols, astronauts… with circuit, hex-grid, panel and
     code patterns that glow.
   · สัตว์ขี่ Mounts (6): a hoverboard, a flying saucer, a hover bike, a quad drone, a data cube and a hex pad.
   In the wardrobe every tab shows the new collection first, under its own heading. Costumes never change stats. */
'use strict';

/* ---------- materials ---------- */
{ const hx = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const add = (name, ramp, o = {}) => { if (SPR.M[name] != null) return; SPR.M[name] = SPR.MATS.length; SPR.MATS.push({name, hex:ramp, ramp:ramp.map(hx), emissive:!!o.emissive, noEdge:!!o.noEdge}); };
  add('chrome', ['#ffffff', '#e4f0ff', '#9ab0cc', '#4a5a78']);
  add('gunmetal', ['#8a92a8', '#4a5064', '#2a2e3c', '#14161e']);
  add('plateW', ['#ffffff', '#f0f4fa', '#c8d0e0', '#8a94aa']);
  add('neonPink', ['#ffffff', '#ffc8f0', '#ff4ad0', '#a0108a'], {emissive:true});
  add('neonOrange', ['#ffffff', '#ffe0b0', '#ff9a2a', '#c0500a'], {emissive:true});
  add('holoGlow', ['#ffffff', '#d0f8ff', '#8ab8ff', '#c060ff'], {emissive:true});
}
const AIM = SPR.M;
const AI_IDS = new Set();

/* ---------- 12 outfit sets ---------- */
const FT2 = {
  circuit:m => n => ((Math.abs(Math.sin(n[0] * 20)) < .07 && Math.sin(n[1] * 11) > 0) || (Math.abs(Math.sin(n[1] * 20)) < .07 && Math.sin(n[0] * 13 + 1) > .2) ? {m} : undefined),
  hex:m => n => { const a = n[0] * 15, b = n[1] * 15; return Math.min(Math.abs(Math.sin(a)), Math.abs(Math.sin(a * .5 + b * .866)), Math.abs(Math.sin(-a * .5 + b * .866))) < .09 ? {m} : undefined; },
  panel:m => n => (Math.abs(Math.sin(n[1] * 7 + .4)) < .09 || (n[2] > 0 && Math.abs(Math.sin(n[0] * 5)) < .07) ? {m} : undefined),
  grid:m => n => (Math.abs(Math.sin(n[0] * 18)) < .08 || Math.abs(Math.sin(n[1] * 18)) < .08 ? {m} : undefined),
  code:m => n => (Math.sin(n[0] * 40) > .82 && Math.sin(n[1] * 30 + Math.floor(n[0] * 40 / 6.283) * 2.3) > .2 ? {m} : undefined),
  core:m => n => (n[2] > .6 && Math.hypot(n[0], n[1] + .05) < .17 ? {m} : undefined)
};
const AI_SETS = [
  ['ai_s_neon', 'ชุดไรเดอร์นีออนซิตี้', 'Neon City Rider', 'ninja', 'onyx', 'gunmetal', 'cyanGlow', FT.combo(FT2.circuit(AIM.cyanGlow), FT.zip(AIM.cyanGlow)), {chest:'gunmetal', chestTrim:'cyanGlow'}, 150],
  ['ai_s_android', 'ชุดแอนดรอยด์ขาวมุก', 'Pearl Android', 'battle', 'plateW', 'chrome', 'cyanGlow', FT.combo(FT2.core(AIM.cyanGlow), FT2.panel(AIM.chrome)), {cape:null, pauldron:'chrome'}, 170],
  ['ai_s_mech', 'ชุดนักบินเมคา', 'Mecha Pilot Suit', 'armour', 'royalBlue', 'plateW', 'lavaGlow', FT.combo(FT2.hex(AIM.plateW), FT.hem(AIM.lavaGlow)), {cape:null, chestTex:null, chest:'plateW'}, 170],
  ['ai_s_hacker', 'ชุดแฮกเกอร์เงามืด', 'Shadow Hacker', 'ninja', 'charcoal', 'onyx', 'limeGlow', FT.combo(FT2.code(AIM.limeGlow), FT.hem(AIM.limeGlow)), {cape:'onyx', capeTex:null}, 140],
  ['ai_s_idol', 'ชุดไอดอลเสมือนจริง', 'Virtual Idol', 'dress', 'lavender', 'neonPink', 'neonPink', FT.combo(FT2.grid(AIM.neonPink), FT.hem(AIM.holoGlow)), {sleeve:'plateW', forearm:'plateW'}, 150],
  ['ai_s_astro', 'ชุดนักบินอวกาศ', 'Deep Space Astronaut', 'battle', 'plateW', 'neonOrange', 'neonOrange', FT.combo(FT.stripes(AIM.neonOrange), FT2.core(AIM.cyanGlow)), {cape:null, pauldron:'plateW', handWrap:'gunmetal', chest:'plateW'}, 160],
  ['ai_s_quantum', 'ชุดนักวิทย์ควอนตัม', 'Quantum Scientist', 'robe', 'mint', 'white', 'holoGlow', FT.combo(FT2.circuit(AIM.holoGlow), FT.hem(AIM.holoGlow)), {cape:'white', capeTex:null, sleeve:'white', pendant:'orb', neckMat:'holoGlow'}, 150],
  ['ai_s_titan', 'ชุดเกราะไททันทองคำ', 'Golden Titan Frame', 'armour', 'goldLight', 'gunmetal', 'lavaGlow', FT.combo(FT2.panel(AIM.gunmetal), FT2.core(AIM.lavaGlow)), {chestTex:null, cape:null, chest:'goldLight', sleeve:'goldLight'}, 190],
  ['ai_s_ghost', 'ชุดสายลับพรางแสง', 'Cloaked Ghost Agent', 'ninja', 'midnight', 'gunmetal', 'voidGlow', FT.combo(FT2.hex(AIM.voidGlow), FT.zip(AIM.voidGlow)), {}, 150],
  ['ai_s_chrome', 'ชุดโครมเหลวสีเงิน', 'Liquid Chrome', 'royal', 'chrome', 'gunmetal', 'iceGlow', FT.combo(FT.waves(AIM.iceGlow), FT.hem(AIM.chrome)), {cape:'chrome', capeTex:null, pendant:'orb', neckMat:'iceGlow'}, 170],
  ['ai_s_cyborg', 'ชุดนักรบไซบอร์กแดง', 'Crimson Cyborg', 'battle', 'crimsonV', 'gunmetal', 'bloodGlow', FT.combo(FT2.circuit(AIM.bloodGlow), FT.chev(AIM.gunmetal)), {cape:null, pauldron:'gunmetal'}, 170],
  ['ai_s_holo', 'ชุดเทพธิดาโฮโลแกรม', 'Hologram Goddess', 'sky', 'sky', 'holoGlow', 'holoGlow', FT.combo(FT2.grid(AIM.holoGlow), FT.hem(AIM.holoGlow)), {cape:'holoGlow', capeTex:null}, 180]
];
for (const [id, th, en, cut, a, b, c, tex, more, price] of AI_SETS){
  COSTUME[id] = {slot:'top', th, en, src:'coin', price:{c:price}, grand:true, sw:[a, c], look:fSet(cut, a, b, c, tex, more)};
  SPR.GEAR_LOOK[id] = COSTUME[id].look; AI_IDS.add(id);
}

/* ---------- 10 headpieces ---------- */
const AI_HEADS = [
  ['ai_h_set', 'หูฟังไซเบอร์ฟ้า', 'Cyan Cyber Headset', {hat:'headset', hatMat:'gunmetal', crestMat:'cyanGlow'}, 90],
  ['ai_h_setr', 'หูฟังเกมเมอร์แดง', 'Red Gamer Headset', {hat:'headset', hatMat:'onyx', crestMat:'bloodGlow'}, 90],
  ['ai_h_cat', 'หูฟังหูแมวนีออน', 'Neon Cat-ear Headphones', {hat:'headset', catEar:true, hatMat:'plateW', crestMat:'neonPink'}, 110],
  ['ai_h_ant', 'เสาอากาศคู่หุ่นยนต์', 'Robot Twin Antennas', {hat:'antenna', hatMat:'chrome', crestMat:'limeGlow'}, 80],
  ['ai_h_halo', 'วงรัศมีดิจิทัล', 'Digital Halo', {hat:'holoHalo', hatMat:'aqua', crestMat:'cyanGlow'}, 120],
  ['ai_h_halop', 'วงรัศมีโฮโลชมพู', 'Pink Holo Halo', {hat:'holoHalo', hatMat:'sakura', crestMat:'neonPink'}, 120],
  ['ai_h_crown', 'มงกุฎวงจรควอนตัม', 'Quantum Circuit Crown', {hat:'techCrown', hatMat:'chrome', crestMat:'lavender'}, 140],
  ['ai_h_helm', 'หมวกเมคาไพลอต', 'Mecha Pilot Helmet', {hat:'mechHelm', hatMat:'plateW', crestMat:'lavaGlow'}, 130],
  ['ai_h_vfin', 'ครีบ V หุ่นรบ', 'Battle Mech V-fin', {hat:'vfin', hatMat:'plateW', crestMat:'bloodGlow', finMat:'goldLight'}, 130],
  ['ai_h_led', 'คาดผมไฟ LED', 'LED Light Band', {hat:'ledBand', hatMat:'onyx', crestMat:'cyanGlow'}, 70]
];
for (const [id, th, en, look, price] of AI_HEADS){
  COSTUME[id] = {slot:'head', th, en, src:'coin', price:{c:price}, grand:true, sw:[look.hatMat, look.crestMat], look:{hat:null, ...look}};
  SPR.GEAR_LOOK[id] = COSTUME[id].look; AI_IDS.add(id);
}

/* ---------- 8 face pieces ---------- */
const AI_FACES = [
  ['ai_f_visor', 'ไวเซอร์ไซเบอร์ฟ้า', 'Cyan Cyber Visor', {faceMask:'gunmetal', fmStyle:'visor', fmTrim:'chrome', fmEye:'cyanGlow'}, 90],
  ['ai_f_shade', 'แว่นไซเบอร์ทรงเหลี่ยม', 'Angular Cyber Shades', {faceMask:'onyx', fmStyle:'cybshade', fmTrim:'chrome', fmEye:'neonPink'}, 80],
  ['ai_f_mono', 'เลนส์สแกนตาเดียว', 'Scanner Monocle', {faceMask:'gunmetal', fmStyle:'monocle', fmTrim:'chrome', fmEye:'bloodGlow'}, 70],
  ['ai_f_circ', 'ลายวงจรเรืองแสง', 'Glowing Circuit Lines', {faceMask:'cyanGlow', fmStyle:'circuit', fmTrim:'plateW'}, 60],
  ['ai_f_resp', 'หน้ากากกรองอากาศหุ่นยนต์', 'Robot Respirator', {faceMask:'gunmetal', fmStyle:'respirator', fmTrim:'chrome', fmEye:'cyanGlow'}, 90],
  ['ai_f_led', 'หน้าจอ LED ยิ้มแป้น', 'Smiling LED Screen', {faceMask:'onyx', fmStyle:'ledface', fmTrim:'chrome', fmEye:'cyanGlow'}, 110],
  ['ai_f_scan', 'ไวเซอร์สแกนเนอร์แดง', 'Red Scanner Visor', {faceMask:'onyx', fmStyle:'scanline', fmTrim:'gunmetal', fmEye:'bloodGlow'}, 90],
  ['ai_f_mark', 'มาร์กเทคใต้ตา', 'Tech Face Marks', {faceMask:'neonPink', fmStyle:'techmark', fmTrim:'onyx'}, 50]
];
for (const [id, th, en, look, price] of AI_FACES){
  COSTUME[id] = {slot:'mask', th, en, src:'coin', price:{c:price}, grand:false, sw:[look.faceMask, look.fmEye || look.fmTrim], look};
  SPR.GEAR_LOOK[id] = look; AI_IDS.add(id);
}

/* ---------- 14 back pieces (none of them wings) ---------- */
const AI_BACK = [
  ['ai_b_jet', 'เจ็ทแพ็คนีออนฟ้า', 'Neon Jetpack', 'tJet', ['#e8f6ff', '#8a9ab8', '#3a4458'], '90,210,255', 150],
  ['ai_b_jetr', 'เจ็ทแพ็คเพลิงสุริยะ', 'Solar Flare Jetpack', 'tJet', ['#fff4e0', '#e05a2a', '#5a1a0e'], '255,150,60', 150],
  ['ai_b_core', 'เป้แกนปฏิกรณ์', 'Reactor Core Pack', 'tCore', ['#f0f4fa', '#9aa4b8', '#3a4050'], '120,255,200', 160],
  ['ai_b_ant', 'เสาอากาศดาวเทียม', 'Satellite Uplink', 'tAntenna', ['#ffffff', '#b8c4d8', '#4a5468'], '255,90,110', 130],
  ['ai_b_arms', 'แขนกลสี่ข้าง', 'Four Mech Arms', 'tArms', ['#e8ecf4', '#6a7288', '#262a36'], '255,190,60', 190],
  ['ai_b_tail', 'หางกลสายเคเบิล', 'Cable Mech Tail', 'tTail', ['#d8dee8', '#4a5064', '#1a1c24'], '200,110,255', 140],
  ['ai_b_ring', 'วงแหวนปฏิกรณ์', 'Reactor Ring', 'tRing', ['#ffffff', '#6ad8ff', '#1a5aa8'], '110,210,255', 180],
  ['ai_b_fang', 'ดาบโดรนลอยฟ้า', 'Floating Sword Drones', 'tFunnel', ['#ffffff', '#c8d4e8', '#3a4a6a'], '120,200,255', 200],
  ['ai_b_drone', 'โดรนคู่หูบินวน', 'Twin Companion Drones', 'tDrone', ['#ffffff', '#c8ccd8', '#4a5064'], '90,230,255', 150],
  ['ai_b_swarm', 'ฝูงโดรนสามเหลี่ยม', 'Delta Drone Swarm', 'tSwarm', ['#ffe0f4', '#ff4ad0', '#7a1068'], '255,90,210', 160],
  ['ai_b_holo', 'จอโฮโลแกรมลอยวน', 'Orbiting Holo Screens', 'tHolo', ['#e8fbff', '#6ad8ff', '#2a6ab8'], '120,220,255', 170],
  ['ai_b_hex', 'แผ่นเกราะหกเหลี่ยม', 'Hex Shield Plates', 'tHex', ['#fff8e0', '#ffc84a', '#a8700e'], '255,200,80', 170],
  ['ai_b_code', 'ออร่าโค้ดไบนารี', 'Binary Code Aura', 'tCode', ['#e8ffe0', '#6af07a', '#1a7a2a'], '110,255,140', 120],
  ['ai_b_bot', 'โดรนแมวผู้ช่วย', 'Robo-cat Helper', 'tBot', ['#ffffff', '#e8eef8', '#7a8aa8'], '120,220,255', 140]
];
for (const [id, th, en, kind, c, glow, price] of AI_BACK){ WINGS[id] = {set:null, th, en, kind, c, edge:c[2], glow, fx:'none', span:1, price:{c:price}, tech:true}; AI_IDS.add(id); }

const TKX = {
  lg(g, x0, y0, x1, y1, cols){ const gr = g.createLinearGradient(x0, y0, x1, y1); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); return gr; },
  glow(g, x, y, r, rgb, a){ g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore(); },
  rr(g, x, y, w, h, r){ g.beginPath(); g.roundRect(x, y, w, h, r); },
  hex(g, x, y, r, a = 0){ g.beginPath(); for (let i = 0; i < 6; i++){ const q = a + i * Math.PI / 3; g.lineTo(x + Math.cos(q) * r, y + Math.sin(q) * r); } g.closePath(); },
  line(g, col, w){ g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); },
  /* a jointed arm: from (x,y) by segment lengths and angles */
  seg(g, pts, w, c){ g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); TKX.line(g, c[2], w + 1.2); TKX.line(g, c[1], w); TKX.line(g, c[0], w * .35);
    for (const p of pts){ g.fillStyle = c[2]; g.beginPath(); g.arc(p[0], p[1], w * .62, 0, 7); g.fill(); } }
};

/* things worn on the back: seen whole from behind, on the back edge from the side, poking out from behind when facing you */
function aiPack(g, W, x, y, t, part, o, dir, draw){
  const away = dir >= 3 && dir <= 5, side = dir === 2 || dir === 6, layer = away || side ? 'front' : 'back'; if (part !== layer) return;
  const f = BK_FACE[dir] || [0, 1], by = y - (o.ride ? 31 : 16) + (o.sit ? 4 : 0);
  g.save(); g.translate(x - f[0] * (side ? 7.5 : 4), by); if (side) g.scale(dir === 2 ? .7 : -.7, 1); else if (dir === 1 || dir === 7) g.scale(-.9, 1); else if (dir === 3 || dir === 5) g.scale(.9, 1);
  draw(g, W.c, t, away, side); g.restore();
}
/* things floating around you: the half in front of you is drawn over the body */
function aiOrbit(part, a){ return (Math.sin(a) > 0) === (part === 'front'); }
const AI_DRAW = {
  tJet(g, W, x, y, t, part, o, dir){ aiPack(g, W, x, y, t, part, o, dir, (g, c, t, away) => {
    const fl = .75 + Math.sin(t * 23) * .12 + Math.sin(t * 37) * .08, rgb = W.glow;
    for (const sd of [-1, 1]){ const cx = sd * 5.6;
      TKX.glow(g, cx, 10 + 6 * fl, 7, rgb, .55);
      g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(0, 7, 0, 7 + 13 * fl); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.3, `rgba(${rgb},.95)`); gr.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(cx - 2.2, 7); g.quadraticCurveTo(cx, 7 + 16 * fl, cx + 2.2, 7); g.closePath(); g.fill(); g.restore();
      TKX.rr(g, cx - 2.9, -8, 5.8, 15, 2.8); g.fillStyle = TKX.lg(g, cx - 3, 0, cx + 3, 0, [c[1], c[0], c[1], c[2]]); g.fill(); TKX.line(g, c[2], .7);
      g.fillStyle = c[2]; g.fillRect(cx - 2.4, 5.4, 4.8, 2.4); g.fillStyle = `rgba(${rgb},1)`; g.fillRect(cx - 1.8, -5, 3.6, .9); }
    TKX.rr(g, -3.4, -6, 6.8, 10, 2); g.fillStyle = c[2]; g.fill(); g.fillStyle = `rgba(${rgb},${.6 + .4 * Math.sin(t * 3)})`; g.beginPath(); g.arc(0, -1, 1.5, 0, 7); g.fill(); }); },
  tCore(g, W, x, y, t, part, o, dir){ aiPack(g, W, x, y, t, part, o, dir, (g, c, t, away) => {
    const rgb = W.glow, pu = .7 + .3 * Math.sin(t * 2.4);
    for (const sd of [-1, 1]){ g.beginPath(); g.moveTo(sd * 4.6, -6); g.quadraticCurveTo(sd * 8.5, -12, sd * 4, -14); TKX.line(g, c[2], 2.2); TKX.line(g, `rgba(${rgb},.9)`, .8); }
    TKX.rr(g, -6.2, -8, 12.4, 15, 3); g.fillStyle = TKX.lg(g, 0, -8, 0, 7, [c[0], c[1], c[2]]); g.fill(); TKX.line(g, c[2], .8);
    for (const sd of [-1, 1]){ g.fillStyle = c[2]; for (let i = 0; i < 3; i++) g.fillRect(sd * 4.4 - .6, -4 + i * 2.6, 1.2, 1.4); }
    TKX.glow(g, 0, -.5, 9 * pu, rgb, .7); g.beginPath(); g.arc(0, -.5, 3.4, 0, 7); g.fillStyle = c[2]; g.fill();
    g.beginPath(); g.arc(0, -.5, 2.6, 0, 7); g.fillStyle = `rgba(${rgb},1)`; g.fill(); g.beginPath(); g.arc(0, -.5, 1.2, 0, 7); g.fillStyle = '#ffffff'; g.fill();
    g.save(); g.translate(0, -.5); g.rotate(t * 1.5); g.strokeStyle = c[0]; g.lineWidth = .5; for (let i = 0; i < 3; i++){ g.rotate(2.094); g.beginPath(); g.arc(0, 0, 3.2, 0, .9); g.stroke(); } g.restore(); }); },
  tAntenna(g, W, x, y, t, part, o, dir){ aiPack(g, W, x, y, t, part, o, dir, (g, c, t, away, side) => {
    const rgb = W.glow, mx = 3.5, top = -34;
    g.beginPath(); g.moveTo(mx, -5); g.lineTo(mx, top + 4); TKX.line(g, c[2], 1.6); TKX.line(g, c[1], .7);
    g.beginPath(); g.moveTo(-3, -5); g.lineTo(-3, -20); TKX.line(g, c[2], 1.1); g.fillStyle = `rgba(${rgb},${.5 + .5 * Math.sin(t * 4)})`; g.beginPath(); g.arc(-3, -20.5, 1.2, 0, 7); g.fill();
    g.save(); g.translate(mx, top + 4); g.rotate(-.5 + Math.sin(t * .6) * .25); g.beginPath(); g.ellipse(0, 0, 6.5, 2.6, 0, Math.PI, 0); g.closePath(); g.fillStyle = TKX.lg(g, -6, 0, 6, 0, [c[1], c[0], c[1]]); g.fill(); TKX.line(g, c[2], .7);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -4.5); TKX.line(g, c[2], .7); g.fillStyle = `rgba(${rgb},1)`; g.beginPath(); g.arc(0, -4.8, 1, 0, 7); g.fill();
    for (let k = 0; k < 3; k++){ const ph = (t * .6 + k / 3) % 1; g.strokeStyle = `rgba(${rgb},${.9 * (1 - ph)})`; g.lineWidth = .8; g.beginPath(); g.arc(0, -4.8, 2 + ph * 10, -2.4, -.7); g.stroke(); } g.restore();
    TKX.rr(g, -5.6, -7, 11.2, 12, 2.4); g.fillStyle = TKX.lg(g, 0, -7, 0, 5, [c[0], c[1], c[2]]); g.fill(); TKX.line(g, c[2], .7);
    g.fillStyle = c[2]; g.fillRect(-3.6, -3, 7.2, 3.4); for (let i = 0; i < 4; i++){ g.fillStyle = (Math.floor(t * 3) + i) % 4 ? `rgba(${rgb},.35)` : `rgba(${rgb},1)`; g.fillRect(-3 + i * 1.7, -2, 1.1, 1.4); } }); },
  tArms(g, W, x, y, t, part, o, dir){ aiPack(g, W, x, y, t, part, o, dir, (g, c, t, away, side) => {
    const rgb = W.glow;
    for (const [sd, up, ph] of [[-1, 1, 0], [1, 1, 1.6], [-1, -.2, 3.1], [1, -.2, 4.4]]){ if (side && sd < 0) continue;
      const w1 = Math.sin(t * 1.1 + ph) * .15, a1 = (up > 0 ? -.75 : .1) + w1, a2 = a1 + (up > 0 ? -.9 : .9) * .6 + Math.sin(t * 1.4 + ph) * .2;
      const p0 = [sd * 3.6, up > 0 ? -5 : 2], p1 = [p0[0] + sd * Math.cos(a1) * 10, p0[1] + Math.sin(a1) * 10], p2 = [p1[0] + sd * Math.cos(a2) * 9, p1[1] + Math.sin(a2) * 9];
      TKX.seg(g, [p0, p1, p2], up > 0 ? 2 : 1.6, c);
      const op = .35 + .25 * Math.sin(t * 2 + ph); g.save(); g.translate(p2[0], p2[1]); g.rotate(Math.atan2(p2[1] - p1[1], (p2[0] - p1[0])));
      for (const s of [-1, 1]){ g.beginPath(); g.moveTo(0, 0); g.lineTo(2.6, s * (1.2 + op * 2)); g.lineTo(4.4, s * op); TKX.line(g, c[2], 1.2); TKX.line(g, c[0], .4); }
      g.fillStyle = `rgba(${rgb},1)`; g.beginPath(); g.arc(0, 0, .9, 0, 7); g.fill(); g.restore(); }
    TKX.rr(g, -5.4, -8, 10.8, 13, 3); g.fillStyle = TKX.lg(g, 0, -8, 0, 5, [c[0], c[1], c[2]]); g.fill(); TKX.line(g, c[2], .8);
    g.fillStyle = `rgba(${rgb},.95)`; g.fillRect(-3, -4, 6, 1); g.fillRect(-3, -1.6, 6, 1); }); },
  tTail(g, W, x, y, t, part, o, dir){ aiPack(g, W, x, y, t, part, o, dir, (g, c, t, away, side) => {
    const rgb = W.glow, n = 12, pts = [];
    for (let i = 0; i <= n; i++){ const k = i / n, a = .4 + k * 2 + Math.sin(t * 1.3 - k * 3) * .35 * k; pts.push([Math.sin(a) * (3 + k * 14) * (away ? 1 : 1.1), 6 + k * 10 - k * k * 16 + Math.cos(t * 1.1 - k * 2) * k * 2]); }
    for (let i = 0; i < n; i++){ const [ax, ay] = pts[i], [bx, by] = pts[i + 1], w = 2.6 - i / n * 1.4; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); TKX.line(g, c[2], w + 1); TKX.line(g, i % 2 ? c[1] : c[0], w);
      if (i % 3 === 1){ g.fillStyle = `rgba(${rgb},.9)`; g.beginPath(); g.arc(ax, ay, .6, 0, 7); g.fill(); } }
    const [tx, ty] = pts[n], [px, py] = pts[n - 1], an = Math.atan2(ty - py, tx - px); TKX.glow(g, tx, ty, 6, rgb, .7);
    g.save(); g.translate(tx, ty); g.rotate(an); g.beginPath(); g.moveTo(4.4, 0); g.lineTo(0, -2); g.lineTo(-1, 0); g.lineTo(0, 2); g.closePath(); g.fillStyle = `rgba(${rgb},1)`; g.fill(); TKX.line(g, c[2], .5); g.restore();
    TKX.rr(g, -3.6, 2, 7.2, 6, 2); g.fillStyle = c[1]; g.fill(); TKX.line(g, c[2], .7); }); },
  tRing(g, W, x, y, t, part, o, dir){
    const away = dir >= 3 && dir <= 5, side = dir === 2 || dir === 6; if ((part === 'front') !== away) return;
    const c = W.c, rgb = W.glow, f = BK_FACE[dir] || [0, 1], cy = y - (o.ride ? 49 : 34) + (o.sit ? 4 : 0) + Math.sin(t * 1.2) * .8;
    g.save(); g.translate(x - f[0] * (side ? 9 : 3), cy); if (side) g.scale(.3, 1); else if (dir % 2) g.scale(.8, 1);
    TKX.glow(g, 0, 0, 24, rgb, .25);
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(${rgb},.5)`; g.lineWidth = 3.2; g.beginPath(); g.arc(0, 0, 16, 0, 7); g.stroke();
    g.globalCompositeOperation = 'source-over'; g.strokeStyle = c[2]; g.lineWidth = 2.4; g.beginPath(); g.arc(0, 0, 16, 0, 7); g.stroke();
    g.save(); g.rotate(t * .5); for (let i = 0; i < 8; i++){ g.rotate(Math.PI / 4); g.strokeStyle = i % 2 ? c[0] : c[1]; g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, 16, .08, .62); g.stroke(); } g.restore();
    g.save(); g.rotate(-t * .9); g.strokeStyle = `rgba(${rgb},.85)`; g.lineWidth = .7; g.setLineDash([2.2, 1.6]); g.beginPath(); g.arc(0, 0, 12.4, 0, 7); g.stroke(); g.setLineDash([]); g.restore();
    for (let i = 0; i < 4; i++){ const a = t * .5 + i * Math.PI / 2; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(Math.cos(a) * 16, Math.sin(a) * 16, 1.1, 0, 7); g.fill(); }
    g.restore(); },
  tFunnel(g, W, x, y, t, part, o, dir){
    const away = dir >= 3 && dir <= 5, side = dir === 2 || dir === 6; if ((part === 'front') !== away) return;
    const c = W.c, rgb = W.glow, f = BK_FACE[dir] || [0, 1], cy = y - (o.ride ? 38 : 23) + (o.sit ? 4 : 0);
    g.save(); g.translate(x - f[0] * (side ? 8 : 3), cy); if (side) g.scale(.35, 1);
    for (let i = 0; i < 6; i++){ const u = (i / 5 - .5) * 2, a = u * 1.15 - Math.PI / 2, r = 15 + Math.abs(u) * 2, bob = Math.sin(t * 1.6 + i * 1.1) * 1.2, bx = Math.cos(a) * r, byy = Math.sin(a) * r * .9 + bob + 4;
      g.save(); g.translate(bx, byy); g.rotate(a + Math.PI / 2);
      TKX.glow(g, 0, 7, 4, rgb, .55); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(${rgb},${.5 + .3 * Math.sin(t * 9 + i)})`; g.beginPath(); g.moveTo(-1, 6); g.lineTo(0, 9 + Math.sin(t * 13 + i)); g.lineTo(1, 6); g.fill(); g.restore();
      g.beginPath(); g.moveTo(0, -9); g.lineTo(1.9, -2); g.lineTo(1.4, 5); g.lineTo(-1.4, 5); g.lineTo(-1.9, -2); g.closePath(); g.fillStyle = TKX.lg(g, -2, 0, 2, 0, [c[1], c[0], c[1]]); g.fill(); TKX.line(g, c[2], .6);
      g.beginPath(); g.moveTo(0, -8); g.lineTo(0, 3); TKX.line(g, `rgba(${rgb},.9)`, .5); g.fillStyle = c[2]; g.fillRect(-2.6, 3.4, 5.2, 1.4); g.restore(); }
    g.restore(); },
  tDrone(g, W, x, y, t, part, o, dir){
    const c = W.c, rgb = W.glow, top = y - (o.ride ? 54 : 39) + (o.sit ? 4 : 0);
    for (let i = 0; i < 2; i++){ const a = t * .8 + i * Math.PI; if (!aiOrbit(part, a)) continue;
      const px = x + Math.cos(a) * 19, py = top + Math.sin(a) * 4 + Math.sin(t * 2.2 + i) * 1.6 - i * 3, s = .85 + Math.sin(a) * .15;
      g.save(); g.translate(px, py); g.scale(s, s); TKX.glow(g, 0, 3, 6, rgb, .35);
      for (const sd of [-1, 1]){ g.beginPath(); g.moveTo(sd * 2, -.5); g.lineTo(sd * 5.5, -1.6); TKX.line(g, c[2], .9); g.save(); g.translate(sd * 5.5, -2.2); g.scale(1, .3);
        g.globalAlpha = .55; g.fillStyle = c[0]; g.beginPath(); g.arc(0, 0, 3.2, 0, 7); g.fill(); g.globalAlpha = 1; g.rotate(t * 30 * sd); g.fillStyle = c[2]; g.fillRect(-3.2, -.4, 6.4, .8); g.restore(); }
      g.beginPath(); g.ellipse(0, 0, 3.4, 2.6, 0, 0, 7); g.fillStyle = TKX.lg(g, 0, -2.6, 0, 2.6, [c[0], c[1], c[2]]); g.fill(); TKX.line(g, c[2], .5);
      g.fillStyle = '#1a1e2a'; TKX.rr(g, -2.2, -1, 4.4, 1.8, .8); g.fill(); g.fillStyle = `rgba(${rgb},1)`; g.beginPath(); g.arc(Math.sin(t * 1.3 + i) * 1, -.1, .55, 0, 7); g.fill();
      g.restore(); } },
  tSwarm(g, W, x, y, t, part, o, dir){
    const c = W.c, rgb = W.glow, top = y - (o.ride ? 48 : 33) + (o.sit ? 4 : 0);
    for (let i = 0; i < 7; i++){ const a = t * .55 + i * Math.PI * 2 / 7; if (!aiOrbit(part, a)) continue;
      const px = x + Math.cos(a) * 21, py = top + Math.sin(a) * 5 + Math.sin(t * 1.7 + i * 2) * 3 - (i % 2) * 6, s = .8 + Math.sin(a) * .2;
      for (let k = 1; k <= 3; k++){ const b = a - k * .09; g.fillStyle = `rgba(${rgb},${.35 - k * .1})`; g.fillRect(x + Math.cos(b) * 21 - .6, top + Math.sin(b) * 5 + Math.sin(t * 1.7 + i * 2) * 3 - (i % 2) * 6 - .6, 1.2, 1.2); }
      g.save(); g.translate(px, py); g.scale(s, s); g.rotate(Math.cos(a) > 0 ? .2 : -.2); TKX.glow(g, 0, 0, 5, rgb, .4);
      g.beginPath(); g.moveTo(0, -3); g.lineTo(3.2, 2.2); g.lineTo(0, 1); g.lineTo(-3.2, 2.2); g.closePath(); g.fillStyle = TKX.lg(g, 0, -3, 0, 2.2, [c[0], c[1], c[2]]); g.fill(); TKX.line(g, c[2], .4);
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, -.2, .6, 0, 7); g.fill(); g.restore(); } },
  tHolo(g, W, x, y, t, part, o, dir){
    const c = W.c, rgb = W.glow, cy = y - (o.ride ? 40 : 25) + (o.sit ? 4 : 0);
    for (let i = 0; i < 3; i++){ const a = t * .4 + i * 2.094; if (!aiOrbit(part, a)) continue;
      const px = x + Math.cos(a) * 20, py = cy + Math.sin(a) * 3.5 + Math.sin(t * 1.3 + i) * 1.2 - (i - 1) * 4, wv = Math.max(.25, Math.abs(Math.sin(a + Math.PI / 2))) * (Math.sin(a) > 0 ? 1 : .8);
      g.save(); g.translate(px, py); g.scale(wv, 1); g.globalCompositeOperation = 'lighter';
      g.fillStyle = `rgba(${rgb},.16)`; g.fillRect(-6, -4.5, 12, 9); g.strokeStyle = `rgba(${rgb},.9)`; g.lineWidth = .6; g.strokeRect(-6, -4.5, 12, 9);
      g.fillStyle = `rgba(${rgb},.75)`; for (let r = 0; r < 4; r++){ const ln = 3 + ((i * 7 + r * 3 + Math.floor(t * 2)) % 6); g.fillRect(-4.6, -3 + r * 1.8, ln, .6); }
      if (i === 1){ g.strokeStyle = c[0]; g.beginPath(); for (let k = 0; k <= 8; k++) g.lineTo(-4.6 + k * 1.15, 3 - Math.abs(Math.sin(t * 2 + k)) * 2.2); g.stroke(); }
      const sl = ((t * .8 + i * .3) % 1) * 9 - 4.5; g.fillStyle = `rgba(255,255,255,.35)`; g.fillRect(-6, sl, 12, .5);
      g.restore(); } },
  tHex(g, W, x, y, t, part, o, dir){
    const c = W.c, rgb = W.glow, cy = y - (o.ride ? 39 : 24) + (o.sit ? 4 : 0);
    for (let i = 0; i < 5; i++){ const a = t * .45 + i * Math.PI * 2 / 5; if (!aiOrbit(part, a)) continue;
      const px = x + Math.cos(a) * 18, py = cy + Math.sin(a) * 4 + Math.sin(t + i) * 1.4 + (i % 2 ? -7 : 3), wv = .45 + Math.abs(Math.sin(a)) * .55;
      g.save(); g.translate(px, py); g.scale(wv, 1); g.globalCompositeOperation = 'lighter';
      TKX.hex(g, 0, 0, 4.6, Math.PI / 6); g.fillStyle = `rgba(${rgb},.22)`; g.fill(); g.strokeStyle = c[1]; g.lineWidth = .9; g.stroke();
      TKX.hex(g, 0, 0, 2.6, Math.PI / 6); g.strokeStyle = `rgba(${rgb},${.5 + .4 * Math.sin(t * 2 + i)})`; g.lineWidth = .5; g.stroke(); g.restore(); } },
  tCode(g, W, x, y, t, part, o, dir){
    const c = W.c, rgb = W.glow, top = y - (o.ride ? 70 : 56) + (o.sit ? 6 : 0);
    if (part === 'back'){ g.save(); g.strokeStyle = `rgba(${rgb},.5)`; g.lineWidth = .8; g.beginPath(); g.ellipse(x, y + (o.ride ? -15 : 0), 16, 4.8, 0, 0, 7); g.stroke();
      g.setLineDash([1.5, 2]); g.beginPath(); g.ellipse(x, y + (o.ride ? -15 : 0), 12, 3.4, 0, 0, 7); g.stroke(); g.setLineDash([]); g.restore(); }
    g.save(); g.font = 'bold 5px monospace'; g.textAlign = 'center';
    for (let i = 0; i < 18; i++){ if ((i % 2 === 0) !== (part === 'back')) continue; const ph = (t * .35 + BKC.hash(i, 1)) % 1, col = Math.floor(BKC.hash(i, 2) * 9);
      const px = x + (col - 4) * 5.5 + Math.sin(i) * 1.5, py = top + ph * 58; g.globalAlpha = Math.sin(ph * Math.PI) * .9;
      g.fillStyle = i % 5 ? c[1] : c[0]; g.fillText((Math.floor(t * 3 + i * 7) % 2) ? '1' : '0', px, py); }
    g.restore(); },
  tBot(g, W, x, y, t, part, o, dir){
    if (part !== 'front') return; const c = W.c, rgb = W.glow, side = dir === 2 || dir === 6, sd = dir === 2 || dir === 1 || dir === 3 ? 1 : -1;
    const px = x + sd * (side ? 12 : 17), py = y - (o.ride ? 53 : 38) + (o.sit ? 4 : 0) + Math.sin(t * 2) * 1.8;
    g.save(); g.translate(px, py); g.rotate(Math.sin(t * 1.3) * .06);
    TKX.glow(g, 0, 7, 6, rgb, .45); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(${rgb},${.6 + .3 * Math.sin(t * 11)})`; g.beginPath(); g.moveTo(-1.6, 4.4); g.lineTo(0, 8.5); g.lineTo(1.6, 4.4); g.fill(); g.restore();
    for (const s of [-1, 1]){ g.beginPath(); g.moveTo(s * 2, -3.6); g.lineTo(s * 4.6, -7); g.lineTo(s * 5, -2.2); g.closePath(); g.fillStyle = c[1]; g.fill(); TKX.line(g, c[2], .5); g.fillStyle = `rgba(${rgb},.9)`; g.beginPath(); g.moveTo(s * 3.2, -3.6); g.lineTo(s * 4.4, -5.6); g.lineTo(s * 4.6, -3); g.fill(); }
    g.beginPath(); g.ellipse(0, 0, 5.6, 4.8, 0, 0, 7); g.fillStyle = TKX.lg(g, 0, -4.8, 0, 4.8, [c[0], c[1], c[2]]); g.fill(); TKX.line(g, c[2], .6);
    TKX.rr(g, -4, -2.2, 8, 4.2, 2); g.fillStyle = '#141824'; g.fill();
    const blink = Math.sin(t * .9) > .97; g.strokeStyle = `rgba(${rgb},1)`; g.lineWidth = .7; g.lineCap = 'round';
    for (const s of [-1, 1]){ g.beginPath(); if (blink){ g.moveTo(s * 2 - 1, 0); g.lineTo(s * 2 + 1, 0); } else { g.moveTo(s * 2 - 1, .6); g.lineTo(s * 2, -.6); g.lineTo(s * 2 + 1, .6); } g.stroke(); }
    g.fillStyle = 'rgba(255,140,180,.6)'; for (const s of [-1, 1]){ g.beginPath(); g.ellipse(s * 3.6, 2.6, .9, .5, 0, 0, 7); g.fill(); }
    g.beginPath(); g.moveTo(0, -4.8); g.lineTo(0, -7.4); TKX.line(g, c[2], .5); g.fillStyle = `rgba(${rgb},1)`; g.beginPath(); g.arc(0, -7.8, .8, 0, 7); g.fill();
    g.restore(); }
};
{ const _dw = drawWings;
  drawWings = function(g, id, x, y, dir, t, o = {}){
    const W = wingDef(id); if (!W || !W.tech) return _dw.apply(this, arguments);
    const f = AI_DRAW[W.kind]; if (!f) return; const part = o.part === 'front' ? 'front' : 'back';
    g.save(); if (o.scale && o.scale !== 1){ g.translate(x, y); g.scale(o.scale, o.scale); g.translate(-x, -y); }
    try { f(g, W, x, y, t, part, o, dir || 0); } finally { g.restore(); }
  }; }

/* ---------- 6 mounts ---------- */
const AI_MOUNTS = [
  ['ai_m_board', 'โฮเวอร์บอร์ดนีออน', 'Neon Hoverboard', 'hoverboard', 8, ['#3ad0ff', '#ff4ad0'], {}, 110],
  ['ai_m_ufo', 'จานบินแม่เหล็ก', 'Magnetic Saucer', 'ufo', 11, ['#d8e4f4', '#6af07a'], {}, 150],
  ['ai_m_bike', 'มอเตอร์ไซค์ลอยฟ้า', 'Hover Bike', 'hoverbike', 10, ['#e02a3a', '#3ad0ff'], {}, 170],
  ['ai_m_quad', 'แท่นโดรนสี่ใบพัด', 'Quad Drone Deck', 'quad', 12, ['#4a5064', '#ffc84a'], {}, 140],
  ['ai_m_cube', 'ลูกบาศก์ข้อมูล', 'Floating Data Cube', 'datacube', 12, ['#6ad8ff', '#c060ff'], {}, 130],
  ['ai_m_hex', 'แท่นหกเหลี่ยมพลังงาน', 'Energy Hex Pad', 'hexpad', 7, ['#ffc84a', '#fff4c0'], {}, 120]
];
for (const [id, th, en, kind, lift, c, more, price] of AI_MOUNTS){ const m = {slot:'mount', th, en, kind, lift, c, price:{c:price}, ...more}; XMOUNT[id] = m; XCOS[id] = m; AI_IDS.add(id); }
Object.assign(MOUNT_X, {
  hoverboard(g, M, x, by, dir, t, moving){ const [c0, c1] = M.c, fl = dir === 2 || dir === 1 || dir === 3 ? -1 : 1, side = dir === 2 || dir === 6;
    g.save(); g.translate(x, by + 4); g.scale(fl * (side ? 1 : .8), 1);
    for (const sd of [-1, 1]){ fxGlow(g, sd * 9, 4, 8, 4, fxRGB(c0), .55); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = c0; g.globalAlpha = .55 + .3 * Math.sin(t * 9 + sd); g.beginPath(); g.ellipse(sd * 9, 3.2, 3.6, 1.2, 0, 0, 7); g.fill(); g.restore(); }
    g.beginPath(); g.moveTo(-17, -1); g.quadraticCurveTo(-20, -3.4, -15, -2.6); g.lineTo(15, -2.6); g.quadraticCurveTo(20, -3.4, 17, -1); g.quadraticCurveTo(16, 2, 12, 2); g.lineTo(-12, 2); g.quadraticCurveTo(-16, 2, -17, -1); g.closePath();
    g.fillStyle = '#1a1e2a'; g.fill(); g.strokeStyle = c0; g.lineWidth = .9; g.shadowColor = c0; g.shadowBlur = 4; g.stroke(); g.shadowBlur = 0;
    g.fillStyle = c1; g.fillRect(-11, -1.4, 22, .9); g.fillStyle = c0; for (let i = 0; i < 3; i++) g.fillRect(-4 + i * 3, .2, 1.6, .8);
    if (moving) for (let i = 0; i < 5; i++){ const ph = (t * 2 + i / 5) % 1; g.globalAlpha = 1 - ph; g.fillStyle = i % 2 ? c0 : c1; g.fillRect(-18 - ph * 16, -1 + (i % 3) * 1.2, 4, .7); }
    g.restore(); },
  ufo(g, M, x, by, dir, t){ const [c0, c1] = M.c, rgb = fxRGB(c1);
    g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(0, by + 6, 0, by + 26); gr.addColorStop(0, `rgba(${rgb},.35)`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr;
    g.beginPath(); g.moveTo(x - 7, by + 6); g.lineTo(x - 13, by + 24); g.lineTo(x + 13, by + 24); g.lineTo(x + 7, by + 6); g.closePath(); g.fill(); g.restore();
    g.beginPath(); g.ellipse(x, by + 3, 21, 6, 0, 0, 7); g.fillStyle = TKX.lg(g, x, by - 3, x, by + 9, ['#ffffff', c0, '#5a6278']); g.fill(); g.strokeStyle = '#3a4050'; g.lineWidth = .7; g.stroke();
    g.beginPath(); g.ellipse(x, by + 1.6, 14, 3.4, 0, 0, 7); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = .5; g.stroke();
    for (let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2 + t * 1.2, s = Math.sin(a); if (s < -.1) continue; g.fillStyle = (i + Math.floor(t * 4)) % 3 ? c1 : '#ffffff'; g.beginPath(); g.arc(x + Math.cos(a) * 18, by + 4 + s * 3.4, 1, 0, 7); g.fill(); } },
  hoverbike(g, M, x, by, dir, t, moving){ const [c0, c1] = M.c, fl = dir === 2 || dir === 1 || dir === 3 ? -1 : 1, side = dir === 2 || dir === 6;
    g.save(); g.translate(x, by + 3); g.scale(fl * (side ? 1 : .75), 1);
    for (const sx of [-12, 11]){ fxGlow(g, sx, 6, 8, 3.5, fxRGB(c1), .6); g.beginPath(); g.ellipse(sx, 2.4, 6, 2.8, 0, 0, 7); g.fillStyle = '#22262f'; g.fill(); g.strokeStyle = c1; g.lineWidth = .9; g.stroke(); g.fillStyle = c1; g.globalAlpha = .7 + .3 * Math.sin(t * 10); g.fillRect(sx - 4, 4.2, 8, .8); g.globalAlpha = 1; }
    g.beginPath(); g.moveTo(-18, -1); g.lineTo(-10, -4); g.lineTo(6, -4); g.lineTo(16, -9); g.lineTo(20, -7); g.lineTo(15, -1); g.lineTo(12, 2); g.lineTo(-14, 2); g.closePath();
    g.fillStyle = TKX.lg(g, 0, -9, 0, 2, ['#ffffff', c0, '#4a0a12']); g.fill(); g.strokeStyle = '#2a0a10'; g.lineWidth = .7; g.stroke();
    g.fillStyle = c1; g.beginPath(); g.moveTo(15, -8.4); g.lineTo(19.2, -7); g.lineTo(17.6, -5.6); g.closePath(); g.fill(); g.fillRect(-8, -2.6, 12, .8);
    g.beginPath(); g.moveTo(12, -6); g.lineTo(9, -12); TKX.line(g, '#2a2e3a', 1.1);
    if (moving) for (let i = 0; i < 5; i++){ const ph = (t * 2.4 + i / 5) % 1; g.globalAlpha = 1 - ph; g.fillStyle = c1; g.fillRect(-20 - ph * 18, -1 + (i % 3) * 1.6, 5, .8); }
    g.restore(); },
  quad(g, M, x, by, dir, t){ const [c0, c1] = M.c;
    g.save(); g.translate(x, by + 3);
    for (const [px, py] of [[-15, -2], [15, -2], [-10, 4], [10, 4]]){ g.beginPath(); g.moveTo(0, 1); g.lineTo(px, py); TKX.line(g, c0, 1.4);
      g.save(); g.translate(px, py - 1.6); g.scale(1, .3); g.globalAlpha = .45; g.fillStyle = '#e8eef8'; g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fill(); g.globalAlpha = 1; g.rotate(t * 28 * Math.sign(px)); g.fillStyle = '#2a2e3a'; g.fillRect(-6, -.6, 12, 1.2); g.restore();
      g.fillStyle = c1; g.beginPath(); g.arc(px, py, 1, 0, 7); g.fill(); }
    g.beginPath(); g.ellipse(0, 1, 11, 3.6, 0, 0, 7); g.fillStyle = TKX.lg(g, 0, -2.6, 0, 4.6, ['#9aa4b8', c0, '#16181e']); g.fill(); g.strokeStyle = c1; g.lineWidth = .8; g.stroke();
    g.fillStyle = (Math.floor(t * 2) % 2) ? c1 : '#ff3a4a'; g.beginPath(); g.arc(0, 4, .9, 0, 7); g.fill(); g.restore(); },
  datacube(g, M, x, by, dir, t){ const [c0, c1] = M.c, rgb = fxRGB(c0); fxGlow(g, x, by + 6, 22, 9, rgb, .4);
    const a = t * .6, s = 9, P3 = []; for (const X of [-1, 1]) for (const Y of [-1, 1]) for (const Z of [-1, 1]){ const rx = X * Math.cos(a) - Z * Math.sin(a), rz = X * Math.sin(a) + Z * Math.cos(a); P3.push([x + rx * s, by + 7 + Y * s * .55 + rz * s * .32, rz]); }
    const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = `rgba(${rgb},.12)`; g.beginPath(); for (const i of [2, 3, 7, 6]) g.lineTo(P3[i][0], P3[i][1]); g.closePath(); g.fill();
    for (const [i, j] of E){ g.strokeStyle = (P3[i][2] + P3[j][2]) > 0 ? c0 : `rgba(${rgb},.45)`; g.lineWidth = (P3[i][2] + P3[j][2]) > 0 ? 1.1 : .6; g.beginPath(); g.moveTo(P3[i][0], P3[i][1]); g.lineTo(P3[j][0], P3[j][1]); g.stroke(); }
    for (const p of P3){ g.fillStyle = c1; g.beginPath(); g.arc(p[0], p[1], .9, 0, 7); g.fill(); }
    for (let i = 0; i < 6; i++){ const ph = (t * .7 + i / 6) % 1; g.fillStyle = `rgba(${rgb},${1 - ph})`; g.fillRect(x + (BKC.hash(i, 4) - .5) * 20, by + 14 + ph * 8, 1, 1.6); }
    g.restore(); },
  hexpad(g, M, x, by, dir, t){ const [c0, c1] = M.c, rgb = fxRGB(c0); fxGlow(g, x, by + 4, 26, 10, rgb, .45);
    g.save(); g.translate(x, by + 4); g.scale(1, .38);
    TKX.hex(g, 0, 0, 22, 0); g.fillStyle = 'rgba(20,24,34,.85)'; g.fill(); g.strokeStyle = c0; g.lineWidth = 1.8; g.shadowColor = c0; g.shadowBlur = 6; g.stroke(); g.shadowBlur = 0;
    g.globalCompositeOperation = 'lighter';
    for (let q = 0; q < 7; q++){ const a = q / 6 * Math.PI * 2, r = q === 6 ? 0 : 11.5, cx2 = Math.cos(a) * r, cy2 = Math.sin(a) * r, on = .25 + .55 * Math.max(0, Math.sin(t * 2 - q * .9));
      TKX.hex(g, cx2, cy2, 5.6, 0); g.fillStyle = `rgba(${rgb},${on * .5})`; g.fill(); g.strokeStyle = c1; g.lineWidth = .7; g.stroke(); }
    g.restore();
    for (let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2 + t * .4, ph = (t * .8 + i / 6) % 1; g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(${rgb},${(1 - ph) * .8})`; g.fillRect(x + Math.cos(a) * 20, by + 4 + Math.sin(a) * 7.6 - ph * 14, 1, 2.2); g.restore(); } }
});

/* ---------- the wardrobe: the new collection first, under its own heading ---------- */
{ const _rw = renderWardrobe;
  renderWardrobe = function(){ const r = _rw.apply(this, arguments);
    try { const grid = document.querySelector('#pane-equip .fwgrid'); grid && grid.querySelectorAll(':scope > .aisec, :scope > .aisec2').forEach(e => e.remove());
      const old = grid && grid.querySelector(':scope > .aibox'), list = grid && grid.querySelector(':scope > .coslist:not(.aibox)');
      if (old){ if (list) list.prepend(...old.children); old.remove(); }
      if (list){ const ai = [...list.children].filter(b => AI_IDS.has(b.dataset.costry));
        if (ai.length){ const sec = document.createElement('div'); sec.className = 'sec aisec'; sec.innerHTML = `✦ ${L('คอลเลกชัน AI ล้ำยุค', 'AI · Future collection')} <span class="ct">${ai.filter(b => cosHave(b.dataset.costry)).length}/${ai.length}</span>`;
          const box = document.createElement('div'); box.className = 'coslist aibox'; ai.forEach(b => box.appendChild(b)); list.before(sec, box);
          const s2 = document.createElement('div'); s2.className = 'sec aisec2'; s2.textContent = L('คอลเลกชันเดิม', 'Classic collection'); list.before(s2); } }
      if (typeof cthScan === 'function') cthScan(); } catch (e) {}
    return r; }; }
{ const st = document.createElement('style'); st.textContent = `.fw .fwgrid > .sec.aisec{color:#0e6a8a;background:linear-gradient(90deg,rgba(90,210,255,.18),rgba(192,96,255,.1),transparent);border-radius:8px;padding:3px 8px}
  .fw .coslist.aibox .cosit{border-color:rgba(90,200,255,.7)}`; document.head.appendChild(st); }
/* the tailor: real counts on each heading (it said "30" for every collection) */
{ const _t = NPC_OPEN.tailor;
  NPC_OPEN.tailor = n => { _t(n); const shop = document.querySelector('#dialog .db'); if (!shop) return;
    shop.querySelectorAll(':scope > .sec').forEach(sec => { const s = sec.nextElementSibling; if (s && s.classList.contains('shop')) sec.textContent = sec.textContent.replace(/·\s*\d+$/, '· ' + s.querySelectorAll('.srow').length); }); }; }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'fashion194', t:['คอลเลกชัน AI ล้ำยุค', 'AI · Future collection'], b:() => L(
  '<p>ชุดใหม่ 50 ชิ้นธีม AI หุ่นยนต์ และโลกอนาคต: ด้านหลัง 14 (เจ็ทแพ็ค แขนกล โดรน วงแหวนพลังงาน จอโฮโลแกรม ฯลฯ ไม่มีปีก) · ส่วนหัว 10 · ใบหน้า 8 · ชุดเซต 12 · สัตว์ขี่ 6</p><p>ลองสวมฟรีในตู้เสื้อผ้า ซื้อเก็บได้ที่ช่างตัดชุด ไม่เปลี่ยนค่าพลัง</p>',
  '<p>50 new pieces themed on AI, robots and the future: back 14 (jetpacks, mech arms, drones, energy rings, hologram screens… no wings) · head 10 · face 8 · outfits 12 · mounts 6</p><p>Try them free in the wardrobe, buy to keep from the tailor. No stats.</p>')});

/* ---------- (v195) the Golden Jelly King wears the floating-hearts aura instead of wings ---------- */
const JK_HEART = {c:['#ffe0ec', '#ff7aa8', '#e0306a'], glow:'255,120,170'};
function jkHearts(g, m, x, y, part){
  const h = ((typeof MOB_H !== 'undefined' && MOB_H[m.type]) || 40) * .62, k = Math.max(1, h / 40) * .75, top = y - h * 1.1, c = JK_HEART.c, t = T;
  if (part === 'back'){ g.save(); g.globalCompositeOperation = 'lighter'; const cy = y - h * .5, gr = g.createRadialGradient(x, cy, 2, x, cy, h * .9); gr.addColorStop(0, `rgba(${JK_HEART.glow},.28)`); gr.addColorStop(1, `rgba(${JK_HEART.glow},0)`);
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, cy, h * .8, h * .95, 0, 0, 7); g.fill(); g.restore(); }
  g.save();
  for (let i = 0; i < 18; i++){ if ((i % 2 === 0) !== (part === 'back')) continue;
    const ph = (t * .25 + BKC.hash(i, 1)) % 1, a = Math.sin(ph * Math.PI), px = x + (BKC.hash(i, 2) - .5) * h * 1.5 + Math.sin(t * .9 + i) * 3 * k, py = top + h * 1.15 - ph * h * 1.3;
    g.globalAlpha = a * .95; BKC.heart(g, px, py, (2.8 + BKC.hash(i, 3) * 2.2) * k); g.fillStyle = i % 3 ? c[1] : c[0]; g.fill(); g.strokeStyle = c[2]; g.lineWidth = .6 * k; g.stroke(); }
  g.restore();
}
{ const _dm = drawMobW; drawMobW = function(g, m){
    const on = m && m.type === 'boss' && !m.dead && !(m.fz && m.fz.hidden), x = m.x - cam.x, y = m.y - cam.y;
    if (on) jkHearts(g, m, x, y, 'back'); const r = _dm.apply(this, arguments); if (on) jkHearts(g, m, x, y, 'front'); return r; }; }

/* (v195) one scrollbar in the wardrobe: the window itself stays put and only the list of pieces scrolls
   (the list had its own height guess, a little taller than the window on laptops, so both scrolled) */
{ const st = document.createElement('style'); st.textContent = `#pane-equip:has(> .cosw2.fw){overflow:hidden!important;display:flex;flex-direction:column;min-height:0}
  #pane-equip:has(> .cosw2.fw) > :not(.cosw2){flex:none}
  #pane-equip > .cosw2.fw{flex:1 1 auto;min-height:0;align-items:stretch}
  .cosw2.fw > .eqstage{max-height:100%;overflow-y:auto;scrollbar-width:none}.cosw2.fw > .eqstage::-webkit-scrollbar{display:none}
  .fw .wrcol{min-height:0;height:100%}
  .fw .fwgrid{max-height:none!important;flex:1 1 auto;min-height:0}`; document.head.appendChild(st); }
