/* VAYRATHEN — js/sys/catdog205.js — (v205) the cat folk and dog folk lines, from docs/PROPOSAL_CAT_DOG.md (the owner
   said go). Nothing is removed. Effects are drawn with natural, soft shapes.
   เจ้าเหมียว ข่วนคลั่ง → ข่วนเป็นกากบาท: two crossing rakes leave glowing claw marks and a deep bleeding wound ·
             กระโจนจันทร์ → กระโดดกำแพง: vault over the foe, land behind it, and the next blow is a sure critical ·
             หน้ามุ้งมิ้ง → ไหมพรมพันตัว: a ball of yarn rolls down a line and ties up whatever it touches ·
             สัญชาตญาณนักล่า → ตาแมวยามค่ำ: 10 s of seeing weak spots, each hit strips 5% more armour (to 30%) ·
             มนต์เสน่ห์ราชินี: monsters around turn on each other for 4 s (bosses are not fooled)
   เจ้าตูบ   งับกระดูก → งับไม่ปล่อย: bite and hang on 3 s, the foe cannot move · หอนรวมพล → ฝูงหมาป่าวิญญาณ: three
             spirit wolves hunt for 10 s · ขนเหล็ก → ขุดหลุมหลบ: dig in for 2 s untouchable, then burst out ·
             หอนจันทร์เพ็ญ: a full moon rises over the spot for 15 s — ATK and speed +20% under it, monsters there flee ·
             เทวดาเฝ้าเจ้านาย → ยืนบังให้นาย: 6 s, damage taken −40% for you and the players around you */
'use strict';
const CDD = (id, o) => { const s = SKILLS[id]; if (s) Object.assign(s, o); return s; };
const cdP = v => Math.round(v * 100) + '%';
const cdD = id => lv => cdP(SKILLS[id].dmg(lv));
const cdLv = id => (S && S.skills && S.skills[id]) || 1;
/* ---------- เจ้าเหมียว ---------- */
CDD('furyswipe', {name:'ข่วนเป็นกากบาท', en:'Cross Rake', short:'กากบาท', shortEn:'Cross', fx:'none', hits:() => 2, every:.16, dmg:lv => 2 + lv * .25,
  desc:lv => L(`ข่วนไขว้ 2 ทาง ทางละ ${cdD('furyswipe')(lv)} ATK · ทิ้งรอยเล็บเรืองแสง · แผลฉีกเลือดไหล ${cdP(.3 + lv * .03)} ATK/วิ 6 วิ`, `Two crossing rakes of ${cdD('furyswipe')(lv)} ATK leave glowing claw marks · a deep wound bleeds ${cdP(.3 + lv * .03)} ATK a second for 6 s`)});
CDD('moonpounce', {name:'กระโดดกำแพง', en:'Wall Vault', short:'กระโดด', shortEn:'Vault', fx:'none', stun:undefined,
  desc:lv => L(`กระโดดข้ามหัวเป้าไปลงข้างหลัง ${cdD('moonpounce')(lv)} ATK · ตีครั้งถัดไปติดคริแน่นอน`, `Vault over the foe and land behind it · ${cdD('moonpounce')(lv)} ATK · your next blow is a sure critical`)});
CDD('cuteface', {name:'ไหมพรมพันตัว', en:'Yarn Tangle', short:'ไหมพรม', shortEn:'Yarn', type:'line', kind:'active', fx:'none', len:190, width:30, dmg:lv => 1.2 + lv * .15, st:undefined,
  desc:lv => L(`โยนไหมพรมกลิ้งไปในแนว 190 · ${cdD('cuteface')(lv)} ATK · พันตัวมอนที่โดน ตรึง 2 วิ`, `Roll a ball of yarn down a 190 line · ${cdD('cuteface')(lv)} ATK · ties up everything it touches for 2 s`)});
CDD('hunterinstinct', {name:'ตาแมวยามค่ำ', en:'Night Eyes', short:'ตาแมว', shortEn:'Eyes', fx:'none', buff:lv => ({t:10, nightEye:1}),
  desc:lv => L(`10 วิ · มองเห็นจุดอ่อน ทุกครั้งที่ตีโดน เกราะเป้าลดลง 5% สะสมสูงสุด 30% (8 วิ)`, `10 s · you see weak spots: each hit strips 5% more armour, up to 30% (8 s)`)});
CDD('royalcharm', {st:undefined,
  desc:lv => L(`รอบตัว 160 · ${cdD('royalcharm')(lv)} ATK · มอนหันไปตีกันเอง 4 วิ (บอสไม่โดน)`, `Around you (160) · ${cdD('royalcharm')(lv)} ATK · monsters turn on each other for 4 s (not bosses)`)});
/* ---------- เจ้าตูบ ---------- */
CDD('crunch', {name:'งับไม่ปล่อย', en:'Lockjaw', short:'งับค้าง', shortEn:'Lockjaw', hits:() => 6, every:.5, dmg:lv => 1 + lv * .06, st:undefined,
  desc:lv => L(`งับค้างไว้ 3 วิ · 6 ครั้ง ครั้งละ ${cdD('crunch')(lv)} ATK · เป้าขยับไม่ได้`, `Bite and hang on for 3 s · 6 bites of ${cdD('crunch')(lv)} ATK · the foe cannot move`)});
CDD('packhowl', {name:'ฝูงหมาป่าวิญญาณ', en:'Spirit Wolves', short:'หมาป่าวิญญาณ', shortEn:'Wolves', fx:'none', team:undefined, cd:30, buff:lv => ({t:10, wolves:3}),
  desc:lv => L(`เรียกหมาป่าวิญญาณ 3 ตัว 10 วิ วิ่งไล่กัดมอนใกล้ ๆ ตัวละ ${cdP(.8 + lv * .06)} ATK ทุก 0.8 วิ`, `Call 3 spirit wolves for 10 s; they hunt the nearest monsters, biting for ${cdP(.8 + lv * .06)} ATK every 0.8 s`)});
CDD('ironfur', {name:'ขุดหลุมหลบ', en:'Dig In', short:'ขุดหลุม', shortEn:'Dig', fx:'none', cd:18, buff:lv => ({t:2, invuln:1, burrow:1}),
  desc:lv => L(`มุดดินหลบ 2 วิ ไม่โดนอะไรเลย · โผล่ขึ้นมากระแทกมอนรอบ ๆ 90 · ${cdP(3 + lv * .3)} ATK · มึน 0.8 วิ`, `Dig in for 2 s, untouchable · burst out, hitting everything within 90 for ${cdP(3 + lv * .3)} ATK · stun 0.8 s`)});
CDD('lunarhowl', {fx:'none', cd:30,
  desc:lv => L(`พระจันทร์เต็มดวงขึ้น 15 วิ รัศมี 170 · อยู่ใต้แสงจันทร์ ATK +20% ตีเร็ว +20% · มอนในวงตอนหอน ${cdD('lunarhowl')(lv)} ATK และหวาดกลัว ${(2 + lv * .2).toFixed(1)} วิ`, `A full moon rises for 15 s (170) · under it: ATK +20%, 20% faster · monsters there as you howl take ${cdD('lunarhowl')(lv)} ATK and flee ${(2 + lv * .2).toFixed(1)} s`)});
CDD('guardianangel', {name:'ยืนบังให้นาย', en:'Stand Guard', short:'ยืนบัง', shortEn:'Guard', fx:'none', team:1, buff:lv => ({t:6, dmgRed:+(.3 + lv * .01).toFixed(2), standGuard:1}),
  desc:lv => L(`6 วิ · รับดาเมจ −${cdP(.3 + lv * .01)} ทั้งตัวเองและผู้เล่นรอบตัว (ยืนบังรับแทน)`, `6 s · damage taken −${cdP(.3 + lv * .01)} for you and the players around you (you take the blows for them)`)});

/* ---------- the mechanics ---------- */
const cdPhys = (m, mult, sk) => (typeof skillPhys === 'function' ? skillPhys(m, mult, sk && sk.elem) : physDamage(m, mult));
const cdNear = (x, y, r, skip) => mobs.filter(m => !m.dead && !m.pvp && m !== skip && Math.hypot(m.x - x, m.y - y) < r + m.def.r);
const CD = {wolves:[], moons:[], confused:new Map(), marks:[]};
{ const _ex = execSkill; execSkill = function(id, lv, t){
    const tg = t && !t.dead ? t : null, x0 = P.x, y0 = P.y, r = _ex.apply(this, arguments);
    if (id === 'furyswipe' && tg){ cdClawFx(tg); later(.2, () => { if (!tg.dead){ const s = tg.st || (tg.st = {}); s.poison = 6; s.poisonDps = DER.atk * (.3 + lv * .03); s.poisonT = 1; addText(tg.x, tg.y - MOB_H[tg.type] - 14, L('แผลฉีก', 'Torn'), '#ff6a6a', 12); } }); }
    if (id === 'moonpounce' && tg){ const d = Math.hypot(tg.x - x0, tg.y - y0) || 1, ux = (tg.x - x0) / d, uy = (tg.y - y0) / d;
      cdVaultFx(x0, y0, tg.x + ux * 34, tg.y + uy * 34);
      later(.3, () => { P.x = clamp(tg.x + ux * 34, 20, W - 20); P.y = clamp(tg.y + uy * 34, 20, H - 20); if (typeof pushOut === 'function') pushOut(P, 10); P.dir = SPR.dirFromVec(-ux, -uy); P._rgSure = T; }); }
    if (id === 'cuteface' && tg) cdYarnFx(x0, y0, tg.x, tg.y, SKILLS.cuteface.len);
    if (id === 'royalcharm') for (const m of cdNear(P.x, P.y, 160)) if (!m.def.boss){ CD.confused.set(m, T + 4); m.aggro = false; addText(m.x, m.y - MOB_H[m.type] - 16, L('สับสน!', 'Confused!'), '#ffb0e0', 12); }
    if (id === 'crunch' && tg && !tg.def.boss) applyStatus(tg, {stop:3});
    if (id === 'packhowl'){ CD.wolves = []; for (let i = 0; i < 3; i++) CD.wolves.push({x:P.x + (i - 1) * 20, y:P.y + 14, t:null, until:T + 10, bite:0, dir:1, run:0, seed:i * 3 + Math.random()}); cdHowlFx(P.x, P.y); }
    if (id === 'ironfur'){ CD.burrow = {x:P.x, y:P.y, until:T + 2, lv}; }
    if (id === 'lunarhowl'){ CD.moons.push({x:P.x, y:P.y, t0:T, until:T + 15}); for (const m of cdNear(P.x, P.y, 170)) applyStatus(m, {fear:2 + lv * .2}); }
    if (id === 'guardianangel') cdGuardFx();
    return r; }; }
{ const _ad = applyDamage; applyDamage = function(m, res, sk){ const r = _ad.apply(this, arguments), id = sk && sk.id;
    if (m && !m.dead && res && !res.miss && !res.poison){
      if (id === 'cuteface' && !m.def.boss){ applyStatus(m, {root:2}); m._yarnT = T + 2; }
      if (P.buffs && P.buffs.hunterinstinct && P.buffs.hunterinstinct.nightEye && !res.magic && !res.pet && !res._cd){ const s = m.st || (m.st = {}); applyStatus(m, {defDown:[Math.min(.3, ((s.defDown > 0 && s.defDownPct) || 0) + .05), 8]}); }
    }
    return r; }; }
EV.on('tick', dt => {
  // confused monsters strike the nearest other monster
  for (const [m, until] of CD.confused){ if (m.dead || T > until){ CD.confused.delete(m); continue; } m.aggro = false;
    if ((m._cfT = (m._cfT || 0) - dt) <= 0){ m._cfT = .9; const o = cdNear(m.x, m.y, 90, m)[0]; if (o){ const a = m.def.atk ? (Array.isArray(m.def.atk) ? (m.def.atk[0] + m.def.atk[1]) / 2 : m.def.atk) : 20; m.lunge = .2; m.dir = SPR.dirFromVec(o.x - m.x, o.y - m.y);
      applyDamage(o, {dmg:Math.max(1, Math.round(a * 1.5)), _cd:1}); } } }
  // spirit wolves hunt
  CD.wolves = CD.wolves.filter(w => T < w.until);
  for (const w of CD.wolves){ if (!w.t || w.t.dead || Math.hypot(w.t.x - P.x, w.t.y - P.y) > 260) w.t = mobs.filter(m => !m.dead && !m.pvp && Math.hypot(m.x - P.x, m.y - P.y) < 240).sort((a, b) => Math.hypot(a.x - w.x, a.y - w.y) - Math.hypot(b.x - w.x, b.y - w.y))[0] || null;
    const tx = w.t ? w.t.x - (w.t.x > w.x ? 14 : -14) : P.x + (w.seed % 3 - 1) * 22, ty = w.t ? w.t.y : P.y + 14, d = Math.hypot(tx - w.x, ty - w.y);
    if (d > 3){ const sp = Math.min(d, 210 * dt); w.x += (tx - w.x) / d * sp; w.y += (ty - w.y) / d * sp; w.run += dt * 12; if (Math.abs(tx - w.x) > 1) w.dir = tx > w.x ? 1 : -1; }
    if (w.t && d < 8 && (w.bite -= dt) <= 0){ w.bite = .8; const lv = cdLv('packhowl'); applyDamage(w.t, {...physDamage(w.t, .8 + lv * .06), _cd:1}, SKILLS.packhowl); w.snap = T; } }
  // digging in: when it ends, burst out
  const b = CD.burrow; if (b && T >= b.until){ CD.burrow = null; const sk = SKILLS.ironfur; cdBurstFx(P.x, P.y);
    for (const m of cdNear(P.x, P.y, 90)){ applyDamage(m, cdPhys(m, 3 + b.lv * .3, sk), sk); applyStatus(m, {stun:.8}); } }
  // under the full moon
  CD.moons = CD.moons.filter(o => T < o.until);
  if (CD.moons.some(o => Math.hypot(P.x - o.x, P.y - o.y) < 170) && typeof addBuff === 'function' && (!P.buffs.moonlit || P.buffs.moonlit.t < .5)) addBuff('moonlit', {t:1.2, atkPct:.2, aspdPct:.2});
});

/* ---------- the looks ---------- */
const cdH = (i, k = 0) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
function cdSoft(g, x, y, r, a, col){ const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.6, `rgba(${col},${a * .45})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
// glowing claw marks crossing on the foe, fading slowly
function cdClawFx(m){ if (typeof skfxAdd !== 'function') return;
  for (const [a, delay] of [[.75, 0], [-.75, .16]]) later(delay, () => skfxAdd({life:1.1, t:0, add:true, draw(g, k){ if (m.dead && k > .3) return; const x = m.x, y = m.y - (MOB_H[m.type] || 30) * .55, draw = Math.min(1, k * 7), al = k < .15 ? 1 : 1 - (k - .15) / .85;
    g.save(); g.translate(x, y); g.rotate(a); g.lineCap = 'round';
    for (let j = -1; j <= 1; j++){ const L = 13 - Math.abs(j) * 2; g.beginPath(); g.moveTo(j * 4.5, -L); g.quadraticCurveTo(j * 4.5 + 3, 0, j * 4.5, -L + L * 2 * draw);
      g.globalAlpha = al * .5; g.strokeStyle = 'rgba(255,90,140,1)'; g.lineWidth = 5; g.stroke(); g.globalAlpha = al; g.strokeStyle = 'rgba(255,235,245,1)'; g.lineWidth = 1.6; g.stroke(); }
    g.restore(); }})); }
// the vault: an arc through the air with a soft trail and a little dust where the cat lands
function cdVaultFx(x0, y0, x1, y1){ if (typeof skfxAdd !== 'function') return;
  skfxAdd({life:.55, t:0, draw(g, k){ const n = 14; g.save(); g.lineCap = 'round';
    for (let i = 0; i < n; i++){ const u = i / (n - 1) * Math.min(1, k * 1.8), px = x0 + (x1 - x0) * u, py = y0 + (y1 - y0) * u - Math.sin(u * Math.PI) * 60 - 16; g.globalAlpha = (1 - k) * (u / Math.max(.01, Math.min(1, k * 1.8))) * .5; cdSoft(g, px, py, 7, .7, '255,200,230'); }
    if (k > .55){ const q = (k - .55) / .45; g.globalAlpha = 1 - q; for (let i = 0; i < 6; i++){ const a = i / 6 * 6.283; cdSoft(g, x1 + Math.cos(a) * q * 18, y1 + Math.sin(a) * q * 7, 7 + q * 6, .55, '170,140,105'); } }
    g.restore(); }}); }
// a ball of yarn rolling down the line, its loose thread trailing and winding round whatever it catches
function cdYarnFx(x0, y0, tx, ty, len){ if (typeof skfxAdd !== 'function') return; const d = Math.hypot(tx - x0, ty - y0) || 1, ux = (tx - x0) / d, uy = (ty - y0) / d;
  skfxAdd({life:.9, t:0, draw(g, k){ const u = Math.min(1, k * 1.4), bx = x0 + ux * len * u, by = y0 + uy * len * u - 6 - Math.abs(Math.sin(u * 9)) * 3, al = k > .8 ? (1 - k) / .2 : 1;
    g.save(); g.globalAlpha = al; g.strokeStyle = '#e86a9a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x0, y0 - 14);
    for (let i = 1; i <= 16; i++){ const q = i / 16 * u; g.lineTo(x0 + ux * len * q + Math.sin(q * 30) * 3 * uy, y0 + uy * len * q - 6 + Math.sin(q * 30) * 2 * -ux); } g.stroke();
    const gr = g.createRadialGradient(bx - 2, by - 2, 1, bx, by, 7); gr.addColorStop(0, '#ffc0d8'); gr.addColorStop(.6, '#e86a9a'); gr.addColorStop(1, '#a8406a'); g.fillStyle = gr; g.beginPath(); g.arc(bx, by, 6.5, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,230,240,.8)'; g.lineWidth = .8; for (let i = 0; i < 3; i++){ g.beginPath(); g.arc(bx, by, 5.5, u * 20 + i * 2.1, u * 20 + i * 2.1 + 1.6); g.stroke(); }
    g.restore(); }}); }
// tied-up monsters show loops of yarn round them
{ const _dm = drawMobW; drawMobW = function(g, m){ const r = _dm.apply(this, arguments);
    if (m && !m.dead && m._yarnT > T){ const x = m.x - cam.x, y = m.y - cam.y, h = MOB_H[m.type] || 30, rr = (m.def.r || 12) * 1.1;
      g.save(); g.strokeStyle = '#e86a9a'; g.lineWidth = 1.4; for (let i = 0; i < 3; i++){ g.beginPath(); g.ellipse(x, y - h * (.3 + i * .18), rr, rr * .35, (i - 1) * .25, 0, 7); g.stroke(); } g.restore(); }
    const cf = CD.confused.get(m); if (m && !m.dead && cf && cf > T){ const x = m.x - cam.x, y = m.y - cam.y - (MOB_H[m.type] || 30) - 6;
      g.save(); for (let i = 0; i < 3; i++){ const a = T * 4 + i * 2.09; g.fillStyle = i % 2 ? '#ffd0ea' : '#ffe8a0'; g.beginPath(); g.arc(x + Math.cos(a) * 9, y + Math.sin(a) * 3, 2, 0, 7); g.fill(); } g.restore(); }
    return r; }; }
// spirit wolves: translucent blue wolves with a glow, legs moving as they run
function cdWolf(g, w){ const x = w.x - cam.x, y = w.y - cam.y, s = 1, run = Math.sin(w.run), snap = w.snap && T - w.snap < .2;
  g.save(); g.translate(x, y); g.scale(w.dir, 1);
  g.globalAlpha = .25; g.fillStyle = '#000'; g.beginPath(); g.ellipse(0, 0, 11, 3, 0, 0, 7); g.fill();
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = .5; cdSoft(g, 0, -9, 18, .45, '120,190,255'); g.globalCompositeOperation = 'source-over';
  g.globalAlpha = .82; const body = g.createLinearGradient(0, -16, 0, -2); body.addColorStop(0, '#e8f4ff'); body.addColorStop(1, '#6aa8e8'); g.fillStyle = body; g.strokeStyle = 'rgba(40,90,160,.7)'; g.lineWidth = .8;
  // legs
  g.lineCap = 'round'; g.strokeStyle = '#8ac0f0'; g.lineWidth = 2.2; for (const [lx, ph] of [[-6, 0], [-3, Math.PI], [5, Math.PI], [8, 0]]){ const sw = Math.sin(w.run + ph) * 3; g.beginPath(); g.moveTo(lx, -6); g.lineTo(lx + sw, -1); g.stroke(); }
  // tail
  g.strokeStyle = '#cfe6ff'; g.lineWidth = 3; g.beginPath(); g.moveTo(-9, -10); g.quadraticCurveTo(-15, -14 + run * 2, -18, -9 + run * 2); g.stroke();
  // body and head
  g.fillStyle = body; g.beginPath(); g.ellipse(0, -9, 10, 4.6, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(10, -12 - (snap ? 1 : 0), 4.6, 3.8, -.2, 0, 7); g.fill();
  g.beginPath(); g.moveTo(13, -12); g.quadraticCurveTo(18, -11, 18, snap ? -8.5 : -10); g.quadraticCurveTo(15, -9, 12, -10); g.fill();   // muzzle
  g.beginPath(); g.moveTo(8, -15); g.quadraticCurveTo(8.5, -19.5, 10.5, -16); g.closePath(); g.fill(); g.beginPath(); g.moveTo(10.5, -15.5); g.quadraticCurveTo(12, -19.5, 13, -15); g.closePath(); g.fill();   // ears
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(12.6, -12.8, .9, 0, 7); g.fill();
  g.restore(); }
// digging in: a mound of earth where you vanished, dirt kicked up
function cdMound(g, b){ const x = b.x - cam.x, y = b.y - cam.y, k = Math.min(1, (T - (b.until - 2)) / .3);
  g.save(); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y, 16, 5, 0, 0, 7); g.fill();
  const gr = g.createRadialGradient(x - 3, y - 6, 1, x, y - 2, 16); gr.addColorStop(0, '#a07a52'); gr.addColorStop(.7, '#6e5034'); gr.addColorStop(1, '#4a321e'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(x - 15 * k, y); g.quadraticCurveTo(x - 9, y - 11 * k, x, y - 12 * k); g.quadraticCurveTo(x + 9, y - 11 * k, x + 15 * k, y); g.closePath(); g.fill();
  for (let i = 0; i < 6; i++){ const ph = (T * 2 + cdH(i)) % 1, a = -1.2 - cdH(i, 2) * .8 + (i % 2 ? 2.4 : 0); g.globalAlpha = 1 - ph; g.fillStyle = '#7a5636'; g.beginPath(); g.ellipse(x + Math.cos(a) * ph * 16, y - 10 - Math.sin(-a) * ph * 12 + ph * ph * 14, 1.8, 1.3, 0, 0, 7); g.fill(); }
  g.restore(); }
{ const _dp = drawPlayerW; drawPlayerW = function(g){ if (CD.burrow && !P.dead){ cdMound(g, CD.burrow); return; } return _dp.apply(this, arguments); }; }
function cdBurstFx(x, y){ if (typeof skfxAdd !== 'function') return; try { skfxShake(3); } catch (e) {}
  skfxAdd({life:.8, t:0, draw(g, k){ for (let i = 0; i < 12; i++){ const a = i / 12 * 6.283, rr = 20 + k * 70; g.globalAlpha = (1 - k) * .6; cdSoft(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr * .5 - k * 8, 10 + k * 14, .6, '160,128,92'); }
    for (let i = 0; i < 16; i++){ const a = cdH(i, 4) * 6.283, sp = 25 + cdH(i, 5) * 60, px = x + Math.cos(a) * sp * k, py = y + Math.sin(a) * sp * k * .5 - (90 * k - 130 * k * k);
      g.globalAlpha = 1 - k; g.fillStyle = i % 2 ? '#7a5636' : '#9a764e'; g.beginPath(); g.ellipse(px, py, 2.4, 1.7, a, 0, 7); g.fill(); } g.globalAlpha = 1; }}); }
function cdHowlFx(x, y){ if (typeof skfxAdd !== 'function') return;
  skfxAdd({life:1, t:0, add:true, draw(g, k){ for (let i = 0; i < 3; i++){ const q = k * 1.4 - i * .2; if (q < 0 || q > 1) continue; const R = 14 + q * 70; g.globalAlpha = (1 - q) * .45; cdSoft(g, x, y - 20, R, .35, '140,200,255'); } g.globalAlpha = 1; }}); }
function cdGuardFx(){ if (typeof skfxAdd !== 'function') return;
  skfxAdd({life:6, t:0, draw(g, k){ if (!P.buffs.guardianangel) return; const x = P.x, y = P.y, a = Math.min(1, k * 8) * Math.min(1, (1 - k) * 6);
    g.save(); g.globalAlpha = a * (.55 + .15 * Math.sin(T * 4)); g.strokeStyle = 'rgba(255,225,150,.9)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 16, 22, 30, 0, 0, 7); g.stroke();
    g.globalCompositeOperation = 'lighter'; cdSoft(g, x, y - 16, 30, .3, '255,220,140'); g.restore(); }}); }
// the full moon: a big pale moon hanging over the spot, a cool pool of moonlight on the ground beneath
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a);
    for (const o of CD.moons){ const x = o.x - cam.x, y = o.y - cam.y, rise = Math.min(1, (T - o.t0) / 1.2), fade = Math.min(1, (o.until - T) * .8);
      g.save(); g.globalAlpha = fade;
      g.save(); g.translate(x, y); g.scale(1, .5); const pool = g.createRadialGradient(0, 0, 0, 0, 0, 170); pool.addColorStop(0, `rgba(200,220,255,${.22 * rise})`); pool.addColorStop(.85, `rgba(170,200,255,${.12 * rise})`); pool.addColorStop(1, 'rgba(170,200,255,0)'); g.fillStyle = pool; g.beginPath(); g.arc(0, 0, 170, 0, 7); g.fill(); g.restore();
      const my = y - 120 - rise * 30, mr = 22;
      g.globalCompositeOperation = 'lighter'; cdSoft(g, x, my, mr * 3, .35 * rise, '200,220,255'); g.globalCompositeOperation = 'source-over';
      g.globalAlpha = fade * rise; const mg = g.createRadialGradient(x - 6, my - 6, 2, x, my, mr); mg.addColorStop(0, '#fffef6'); mg.addColorStop(.7, '#eef0f8'); mg.addColorStop(1, '#c8d0e8'); g.fillStyle = mg; g.beginPath(); g.arc(x, my, mr, 0, 7); g.fill();
      g.fillStyle = 'rgba(160,170,200,.35)'; for (const [cx, cy, cr] of [[-7, -4, 5], [6, 5, 4], [2, -9, 2.6], [-3, 9, 3]]){ g.beginPath(); g.arc(x + cx, my + cy, cr, 0, 7); g.fill(); }
      g.globalAlpha = fade * rise * .25; const beam = g.createLinearGradient(0, my, 0, y); beam.addColorStop(0, 'rgba(210,225,255,.6)'); beam.addColorStop(1, 'rgba(210,225,255,0)'); g.fillStyle = beam;
      g.beginPath(); g.moveTo(x - mr * .8, my + mr * .5); g.lineTo(x - 120, y); g.lineTo(x + 120, y); g.lineTo(x + mr * .8, my + mr * .5); g.closePath(); g.fill();
      g.restore(); }
    for (const w of CD.wolves) cdWolf(g, w);
    return r; }; }
// the yarn draws its own roll: no travelling wave from linefx192.js on top of it
if (typeof skfxCast === 'function'){ const _c = skfxCast; skfxCast = function(id){ if (id === 'cuteface') return; return _c.apply(this, arguments); }; }
