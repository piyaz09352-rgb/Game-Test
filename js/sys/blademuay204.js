/* VAYRATHEN — js/sys/blademuay204.js — (v204) the swordsman and boxer lines, from docs/PROPOSAL_BLADE_MUAY.md
   (the owner said go, and asked for good, realistic effects). Nothing is removed, so no points move.
   นักดาบ  ทวนช้างศึก → ฟันเสยฟ้า: an uppercut throws the foe into the air; it crashes down and stuns those around ·
           โล่ทองคำ → ตอบโต้: for 8 s every blow a monster lands on you is answered with a cut · พุ่งโล่กระแทก →
           กำแพงโล่: a great shield planted in front for 5 s, pushing monsters back and taking half of what comes from
           the front · ปักธงศึก: a war banner stays planted 15 s; inside its circle you have ATK +20% and heal ·
           ดาบพิพากษา: a giant sword of light drops from the sky and the ground splits in light along the line
   นักมวย  รำมวยไหว้ครู → จรดมวย: 10 s of 30% dodging, each dodge answered with a counter punch · จระเข้ฟาดหาง: a
           wide sweeping kick forwards that throws monsters far back · พุ่งจับทุ่ม → จับทุ่มข้ามหัว: grab the foe and
           throw it over your head to crash down behind you · ปี่กลองเร้าใจ: the drums also slow the monsters around ·
           พุ่งเข่าโหนคอ → โหนคอตีเข่ารัว: hold the foe by the neck and drive in five knees */
'use strict';
const BMD = (id, o) => { const s = SKILLS[id]; if (s) Object.assign(s, o); return s; };
const bmP = v => Math.round(v * 100) + '%';
const bmD = id => lv => bmP(SKILLS[id].dmg(lv));
const bmLv = id => (S && S.skills && S.skills[id]) || 1;
/* ---------- นักดาบ ---------- */
BMD('tuskcharge', {name:'ฟันเสยฟ้า', en:'Skyward Cleave', short:'เสยฟ้า', shortEn:'Skyward', type:'melee', fx:'none', act:'slam', range:undefined, knock:undefined, stun:undefined,
  desc:lv => L(`ฟันเสย ${bmD('tuskcharge')(lv)} ATK ส่งเป้าลอยขึ้นฟ้า แล้วตกกระแทกพื้น · มอนรอบ ๆ 80 โดน ${bmP(3 + lv * .3)} ATK และมึน 1.2 วิ`, `An uppercut for ${bmD('tuskcharge')(lv)} ATK throws the foe into the air; it crashes down, hitting those within 80 for ${bmP(3 + lv * .3)} ATK and stunning them 1.2 s`)});
BMD('goldshield', {name:'ตอบโต้', en:'Riposte', short:'ตอบโต้', shortEn:'Riposte', cd:15, buff:lv => ({t:8, riposte:+(1.5 + lv * .05).toFixed(2)}),
  desc:lv => L(`8 วิ · ทุกครั้งที่มอนตีโดนเรา ฟันสวนกลับทันที ${bmP(1.5 + lv * .05)} ATK · คูลดาวน์ 15 วิ`, `8 s · every blow a monster lands on you is answered at once with a cut for ${bmP(1.5 + lv * .05)} ATK · cooldown 15 s`)});
BMD('shieldbash', {name:'กำแพงโล่', en:'Shield Wall', short:'กำแพงโล่', shortEn:'Wall', type:'buff', kind:'buff', fx:'none', act:'guard', cd:16, range:undefined, dmg:undefined, stun:undefined, st2:undefined, buff:lv => ({t:5, wall:1}),
  desc:lv => L(`ตั้งโล่ยักษ์ข้างหน้า 5 วิ · ผลักมอนที่เข้ามาถอยออก · ดาเมจที่มาจากด้านหน้าลดลงครึ่งหนึ่ง`, `Plant a great shield in front for 5 s · pushes monsters back · halves the damage that comes from the front`)});
BMD('warbanner', {st:undefined, cd:30,
  desc:lv => L(`ปักธงศึกค้างไว้ 15 วิ (${bmD('warbanner')(lv)} ATK รอบตัวตอนปัก) · อยู่ในวงธง 160: ATK +20% · ฟื้น HP 2% ทุก 2 วิ`, `Plant a war banner for 15 s (${bmD('warbanner')(lv)} ATK around you as it lands) · inside its 160 circle: ATK +20% · heal 2% HP every 2 s`)});
BMD('judgement', {fx:'none'});
/* ---------- นักมวย ---------- */
BMD('ramwai', {name:'จรดมวย', en:'Muay Guard', short:'จรดมวย', shortEn:'Guard', cd:30, buff:lv => ({t:10, guardDodge:.3}),
  desc:lv => L(`10 วิ · หลบการโจมตีได้ 30% · ทุกครั้งที่หลบ สวนหมัด ${bmP(1.5 + lv * .15)} ATK · คูลดาวน์ 30 วิ`, `10 s · dodge 30% of attacks · every dodge is answered with a counter punch for ${bmP(1.5 + lv * .15)} ATK · cooldown 30 s`)});
BMD('crocodile', {type:'line', fx:'none', len:140, width:50, radius:undefined,
  desc:lv => L(`เตะเหวี่ยงไปข้างหน้าเป็นแนวกว้าง 140 · ${bmD('crocodile')(lv)} ATK · ผลักมอนถอยไปไกล · ช้าลง 40% 4 วิ`, `A wide sweeping kick forwards (140) · ${bmD('crocodile')(lv)} ATK · throws monsters far back · slowed 40% for 4 s`)});
BMD('grabthrow', {name:'จับทุ่มข้ามหัว', en:'Overhead Throw', short:'ทุ่มข้ามหัว', shortEn:'Throw', type:'melee', fx:'none', range:undefined, knock:undefined, stun:undefined,
  desc:lv => L(`คว้าเป้าทุ่มข้ามหัวไปตกข้างหลัง ${bmD('grabthrow')(lv)} ATK · กระแทกพื้นโดนมอนรอบจุดตก 70 · ${bmP(3 + lv * .3)} ATK · มึน 1.8 วิ`, `Grab the foe and throw it over your head (${bmD('grabthrow')(lv)} ATK); it crashes down behind you, hitting those within 70 for ${bmP(3 + lv * .3)} ATK · stun 1.8 s`)});
BMD('drumrally', {desc:lv => L(`60 วิ · ตีเร็วขึ้น 20% · ATK +10% · ส่งให้ผู้เล่นรอบตัว · มอนรอบตัว 160 ช้าลง 40% 6 วิ`, `60 s · 20% faster · ATK +10% · also for players near you · monsters within 160 slowed 40% for 6 s`)});
BMD('kneeclinch', {name:'โหนคอตีเข่ารัว', en:'Clinch Knees', short:'เข่ารัว', shortEn:'Knees', type:'melee', fx:'punch', range:undefined, stun:undefined, hits:() => 5, every:.18, dmg:lv => 1.2 + lv * .07,
  desc:lv => L(`จับคอเป้าไว้ ตีเข่า 5 ครั้งติด ครั้งละ ${bmD('kneeclinch')(lv)} ATK · เป้าขยับไม่ได้ระหว่างนั้น · ATK ศัตรู −30% 6 วิ`, `Hold the foe by the neck and drive in 5 knees of ${bmD('kneeclinch')(lv)} ATK · it cannot move meanwhile · its ATK −30% for 6 s`)});

/* ---------- the mechanics ---------- */
const bmPhys = (m, mult, sk) => (typeof skillPhys === 'function' ? skillPhys(m, mult, sk && sk.elem) : physDamage(m, mult));
const bmNear = (x, y, r, skip) => mobs.filter(m => !m.dead && !m.pvp && m !== skip && Math.hypot(m.x - x, m.y - y) < r + m.def.r);
const BM = {banners:[], flights:[]};
{ const _ex = execSkill; execSkill = function(id, lv, t){
    const tg = t && !t.dead ? t : null, r = _ex.apply(this, arguments);
    if (id === 'tuskcharge' && tg){ BM.flights.push({m:tg, t0:T, dur:.75, dx:0, dy:0, h:tg.def.boss ? 0 : 75, kind:'launch'}); bmUpcut(tg);
      later(.75, () => { const sk = SKILLS.tuskcharge; bmSlam(tg.x, tg.y, 80, '170,140,105');
        for (const m of bmNear(tg.x, tg.y, 80)){ applyDamage(m, bmPhys(m, 3 + lv * .3, sk), sk); applyStatus(m, {stun:1.2}); } }); }
    if (id === 'warbanner'){ BM.banners.push({x:P.x, y:P.y, t0:T, until:T + 15}); }
    if (id === 'judgement' && tg) bmJudgeFx(P.x, P.y, tg.x, tg.y, SKILLS.judgement.len);
    if (id === 'grabthrow' && tg){ const d = Math.hypot(tg.x - P.x, tg.y - P.y) || 1, ux = (tg.x - P.x) / d, uy = (tg.y - P.y) / d, nx = P.x - ux * 46, ny = P.y - uy * 46, sk = SKILLS.grabthrow;
      if (!tg.def.boss){ const fx = tg.x, fy = tg.y; tg.x = clamp(nx, 20, W - 20); tg.y = clamp(ny, 20, H - 20); BM.flights.push({m:tg, t0:T, dur:.5, dx:fx - tg.x, dy:fy - tg.y, h:60, kind:'throw'}); }
      later(tg.def.boss ? .1 : .5, () => { bmSlam(tg.x, tg.y, 70, '170,140,105'); for (const m of bmNear(tg.x, tg.y, 70)){ applyDamage(m, bmPhys(m, 3 + lv * .3, sk), sk); applyStatus(m, {stun:1.8}); } }); }
    if (id === 'kneeclinch' && tg && !tg.def.boss) applyStatus(tg, {stop:1.1});
    if (id === 'drumrally'){ for (const m of bmNear(P.x, P.y, 160)) applyStatus(m, {slow:[.4, 6]}); bmDrumFx(P.x, P.y); }
    if (id === 'shieldbash') bmWallFx();
    return r; }; }
{ const _ad = applyDamage; applyDamage = function(m, res, sk){ const r = _ad.apply(this, arguments), id = sk && sk.id;
    if (id === 'crocodile' && m && !m.dead && !m.def.boss && res && !res.miss){ const d = Math.hypot(m.x - P.x, m.y - P.y) || 1, fx = m.x, fy = m.y;
      m.x = clamp(m.x + (m.x - P.x) / d * 80, 20, W - 20); m.y = clamp(m.y + (m.y - P.y) / d * 80, 20, H - 20); if (typeof pushOut === 'function') pushOut(m, m.def.r * .5);
      BM.flights.push({m, t0:T, dur:.35, dx:fx - m.x, dy:fy - m.y, h:14, kind:'knock'}); }
    return r; }; }
// riposte, guard dodges and the shield wall all answer a monster's blow
{ const _ma = mobAttack; mobAttack = function(m, mult, noDodge){
    const g = P.buffs && P.buffs.ramwai && P.buffs.ramwai.guardDodge;
    if (g && m && !m.dead && !noDodge && Math.random() < g){ m.lunge = .2; m.atkT = 0; addText(P.x, P.y - 48, L('หลบ!', 'Slip!'), '#ffe08a');
      const lv = bmLv('ramwai'); later(.08, () => { if (m.dead) return; applyDamage(m, physDamage(m, 1.5 + lv * .15), SKILLS.ramwai); VFX.play('punchHit', {x:m.x, y:m.y - MOB_H[m.type] * .5, gold:true}); }); bmAfterimage(); return; }
    const wall = P.buffs && P.buffs.shieldbash && P.buffs.shieldbash.wall && m && bmFront(m);
    const hp0 = S.hp, r = _ma.apply(this, arguments);
    if (wall && S.hp < hp0){ S.hp = Math.min(DER.maxhp, S.hp + Math.round((hp0 - S.hp) * .5)); bmWallHit(m); }
    const rp = P.buffs && P.buffs.goldshield && P.buffs.goldshield.riposte;
    if (rp && m && !m.dead && S.hp < hp0){ applyDamage(m, physDamage(m, rp), SKILLS.goldshield); bmRiposteFx(m); }
    return r; }; }
const bmFront = m => { const [fx, fy] = typeof dirVec === 'function' ? dirVec(P.dir || 0) : [1, 0]; return (m.x - P.x) * fx + (m.y - P.y) * fy > 0; };
EV.on('tick', dt => {
  // the shield wall pushes back whatever comes at it
  if (P.buffs && P.buffs.shieldbash && P.buffs.shieldbash.wall){ const [fx, fy] = typeof dirVec === 'function' ? dirVec(P.dir || 0) : [1, 0];
    for (const m of mobs){ if (m.dead || m.pvp || m.def.boss) continue; const rx = m.x - P.x, ry = m.y - P.y, d = Math.hypot(rx, ry); if (d > 80 + m.def.r || rx * fx + ry * fy < 0) continue;
      m.x += fx * 90 * dt; m.y += fy * 90 * dt; } }
  // inside the banner's circle
  BM.banners = BM.banners.filter(b => T < b.until);
  const inB = BM.banners.some(b => Math.hypot(P.x - b.x, P.y - b.y) < 160);
  if (inB && typeof addBuff === 'function' && (!P.buffs.bannerAura || P.buffs.bannerAura.t < .5)) addBuff('bannerAura', {t:1.2, atkPct:.2});
  if (inB && (BM.healT = (BM.healT || 0) - dt) <= 0){ BM.healT = 2; if (!P.dead && S.hp < DER.maxhp){ const h = Math.round(DER.maxhp * .02); S.hp = Math.min(DER.maxhp, S.hp + h); addText(P.x, P.y - 52, `+${h}`, '#c4ffe0', 11); } }
  BM.flights = BM.flights.filter(f => T - f.t0 < f.dur && !f.m.dead);
});
/* thrown and launched monsters fly along their arc */
{ const _dm = drawMobW; drawMobW = function(g, m){ const f = BM.flights.find(q => q.m === m);
    if (!f) return _dm.apply(this, arguments);
    const k = Math.min(1, (T - f.t0) / f.dur), ox = f.dx * (1 - k), oy = f.dy * (1 - k) - Math.sin(k * Math.PI) * f.h;
    g.save(); g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(m.x - cam.x + ox, m.y - cam.y + f.dy * (1 - k), m.def.r * (1 - Math.sin(k * Math.PI) * .4), m.def.r * .4, 0, 0, 7); g.fill();
    g.translate(ox, oy); const r = _dm.apply(this, arguments); g.restore(); return r; }; }
// the boomerang-style travelling waves of linefx192.js stay off these: they draw their own
if (typeof skfxCast === 'function'){ const _c = skfxCast; skfxCast = function(id){ if (id === 'judgement' || id === 'crocodile') { if (id === 'crocodile') bmSweepFx(); return; } return _c.apply(this, arguments); }; }

/* ---------- the looks ---------- */
const bmH = (i, k = 0) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
function bmSoft(g, x, y, r, a, col){ const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.6, `rgba(${col},${a * .45})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
// a crash into the ground: a ring of dust rolling out, clods thrown up, a shake
function bmSlam(x, y, r, col){ if (typeof skfxAdd !== 'function') return; try { skfxShake(3); } catch (e) {}
  skfxAdd({life:.75, t:0, draw(g, k){ for (let i = 0; i < 14; i++){ const a = i / 14 * 6.283 + bmH(i), e = typeof g2ease === 'function' ? g2ease(k) : k, rr = r * (.25 + e);
      g.globalAlpha = (1 - k) * .7; bmSoft(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr * .5 - k * 8, 10 + k * 14, .6, col); }
    for (let i = 0; i < 12; i++){ const a = bmH(i, 4) * 6.283, sp = 20 + bmH(i, 5) * 50, px = x + Math.cos(a) * sp * k, py = y + Math.sin(a) * sp * k * .5 - (70 * k - 110 * k * k);
      g.globalAlpha = 1 - k; g.fillStyle = i % 2 ? '#7a5636' : '#9a764e'; g.beginPath(); g.ellipse(px, py, 2.2, 1.6, a, 0, 7); g.fill(); }
    g.globalAlpha = (1 - k) * .8; g.strokeStyle = 'rgba(235,215,180,.8)'; g.lineWidth = 2 * (1 - k) + .5; g.beginPath(); g.ellipse(x, y, r * k * 1.1, r * k * .55, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }}); }
// a cut answering a blow: a bright crescent across the attacker
function bmRiposteFx(m){ if (typeof skfxAdd !== 'function') return; const x = m.x, y = m.y - (MOB_H[m.type] || 30) * .5, a = Math.atan2(m.y - P.y, m.x - P.x);
  skfxAdd({life:.3, t:0, add:true, draw(g, k){ g.save(); g.translate(x, y); g.rotate(a + .9); g.globalAlpha = 1 - k; const R = 16 + k * 6;
    const gr = g.createLinearGradient(-R, 0, R, 0); gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(.5, 'rgba(255,250,230,1)'); gr.addColorStop(1, 'rgba(255,220,140,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, -1.2, 1.2); g.arc(-4, 0, R * .9, 1.1, -1.1, true); g.closePath(); g.fill(); g.restore(); }}); addText(m.x, m.y - (MOB_H[m.type] || 30) - 18, L('สวน!', 'Riposte!'), '#ffe08a', 12); }
function bmAfterimage(){ if (typeof skfxAdd !== 'function') return; const x = P.x, y = P.y, sh = heroSheet(), dir = P.dir || 0, act = P.act || 'idle', t0 = P.animT, side = (Math.random() < .5 ? -1 : 1) * 14;
  skfxAdd({life:.35, t:0, layer:'under', draw(g, k){ g.save(); g.globalAlpha = (1 - k) * .45; g.filter = 'brightness(1.6) saturate(.5)'; SPR.draw(g, sh, act, dir, t0, x + side * k, y); g.filter = 'none'; g.restore(); }}); }
// the planted shield: a tall rounded shield of light in front, glowing rim, a sheen sweeping across it
function bmWallFx(){ if (typeof skfxAdd !== 'function') return;
  skfxAdd({life:5, t:0, draw(g, k){ if (!P.buffs.shieldbash) return; const [fx, fy] = typeof dirVec === 'function' ? dirVec(P.dir || 0) : [1, 0], x = P.x + fx * 26, y = P.y + fy * 13, side = Math.abs(fx) > .5, w = side ? 9 : 26, h = 40;
    const a = Math.min(1, k * 10) * Math.min(1, (1 - k) * 8); g.save(); g.globalAlpha = a; g.translate(x, y - h * .55);
    const gr = g.createLinearGradient(-w, -h / 2, w, h / 2); gr.addColorStop(0, 'rgba(255,240,190,.55)'); gr.addColorStop(.5, 'rgba(230,200,120,.35)'); gr.addColorStop(1, 'rgba(180,140,60,.5)');
    g.beginPath(); g.moveTo(-w, -h / 2 + 6); g.quadraticCurveTo(-w, -h / 2, -w + 6, -h / 2); g.lineTo(w - 6, -h / 2); g.quadraticCurveTo(w, -h / 2, w, -h / 2 + 6); g.lineTo(w, h * .15); g.quadraticCurveTo(w * .8, h * .42, 0, h / 2); g.quadraticCurveTo(-w * .8, h * .42, -w, h * .15); g.closePath();
    g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(255,225,140,.95)'; g.lineWidth = 2; g.stroke();
    g.save(); g.clip(); const sx = ((T * .9) % 1) * w * 4 - w * 2; const sg = g.createLinearGradient(sx - 8, 0, sx + 8, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.55)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sg; g.fillRect(-w, -h / 2, w * 2, h); g.restore();
    g.fillStyle = 'rgba(255,235,160,.9)'; g.beginPath(); g.ellipse(0, -h * .05, w * .3, w * .3 * (side ? 2.2 : 1), 0, 0, 7); g.fill(); g.restore(); }}); }
function bmWallHit(m){ if (typeof skfxAdd !== 'function') return; const [fx, fy] = typeof dirVec === 'function' ? dirVec(P.dir || 0) : [1, 0], x = P.x + fx * 26, y = P.y + fy * 13 - 22;
  skfxAdd({life:.3, t:0, add:true, draw(g, k){ g.globalAlpha = 1 - k; bmSoft(g, x, y, 10 + k * 18, .8, '255,230,150'); g.globalAlpha = 1; }}); }
// the war banner: a pole with a cloth that ripples in the wind, a warm circle on the ground
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a);
    for (const b of BM.banners){ const x = b.x - cam.x, y = b.y - cam.y, age = T - b.t0, rise = Math.min(1, age / .35), fade = Math.min(1, (b.until - T) * 1.5);
      g.save(); g.globalAlpha = fade;
      g.save(); g.translate(x, y); g.scale(1, .5); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 160); gr.addColorStop(0, 'rgba(255,200,90,0)'); gr.addColorStop(.85, `rgba(255,200,90,${.12 + .05 * Math.sin(T * 2)})`); gr.addColorStop(1, 'rgba(255,190,80,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 160, 0, 7); g.fill();
      g.strokeStyle = `rgba(255,215,120,${.35 + .1 * Math.sin(T * 2)})`; g.lineWidth = 2; g.setLineDash([6, 6]); g.lineDashOffset = -T * 10; g.beginPath(); g.arc(0, 0, 158, 0, 7); g.stroke(); g.restore();
      const H = 62 * rise; g.strokeStyle = '#5a3a1e'; g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - H); g.stroke();
      g.fillStyle = '#e8c060'; g.beginPath(); g.arc(x, y - H - 2, 2.6, 0, 7); g.fill();
      if (rise >= 1){ const top = y - H + 3, L = 34, D = 22; g.beginPath(); g.moveTo(x, top);
        for (let i = 0; i <= 12; i++){ const u = i / 12; g.lineTo(x + u * L, top + Math.sin(u * 4 - T * 5) * 3.5 * u); }
        for (let i = 12; i >= 0; i--){ const u = i / 12; g.lineTo(x + u * L - u * 3, top + D + Math.sin(u * 4 - T * 5 + .6) * 3.5 * u - u * 2); } g.closePath();
        const cg = g.createLinearGradient(x, top, x + L, top + D); cg.addColorStop(0, '#9a1a20'); cg.addColorStop(.6, '#c8282c'); cg.addColorStop(1, '#8a1418'); g.fillStyle = cg; g.fill();
        g.strokeStyle = '#e8c060'; g.lineWidth = 1.2; g.stroke();
        g.fillStyle = '#f2d27a'; g.beginPath(); g.arc(x + L * .42, top + D * .5 + Math.sin(.42 * 4 - T * 5) * 1.5, 5, 0, 7); g.fill(); g.fillStyle = '#9a1a20'; g.beginPath(); g.arc(x + L * .42, top + D * .5 + Math.sin(.42 * 4 - T * 5) * 1.5, 2.6, 0, 7); g.fill(); }
      if (age < .5){ g.globalAlpha = (1 - age / .5) * .8; bmSoft(g, x, y, 30, .6, '170,140,105'); }
      g.restore(); }
    return r; }; }
// the judgement: a giant sword of light falls point-first, then the ground splits in light along the line
function bmJudgeFx(px, py, tx, ty, len){ if (typeof skfxAdd !== 'function') return;
  const d = Math.hypot(tx - px, ty - py) || 1, ux = (tx - px) / d, uy = (ty - py) / d, sx = px + ux * Math.min(d, len * .55), sy = py + uy * Math.min(d, len * .55);
  skfxAdd({life:.42, t:0, draw(g, k){ const e = k * k, hy = sy - 240 * (1 - e), L = 110, W = 14;
      g.save(); g.globalAlpha = Math.min(1, k * 4); g.globalCompositeOperation = 'lighter'; bmSoft(g, sx, hy - L * .4, 70, .6, '255,230,150'); g.globalCompositeOperation = 'source-over';
      const bg = g.createLinearGradient(sx - W, 0, sx + W, 0); bg.addColorStop(0, '#e8d8a8'); bg.addColorStop(.5, '#ffffff'); bg.addColorStop(1, '#d8c088');
      g.fillStyle = bg; g.beginPath(); g.moveTo(sx - W, hy - L); g.lineTo(sx + W, hy - L); g.lineTo(sx + W * .7, hy - 8); g.quadraticCurveTo(sx, hy + 6, sx - W * .7, hy - 8); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,240,190,.9)'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx, hy - L); g.lineTo(sx, hy - 6); g.stroke();
      g.fillStyle = '#e0b048'; g.beginPath(); g.ellipse(sx, hy - L - 2, 22, 4.5, 0, 0, 7); g.fill(); g.fillStyle = '#8a5a20'; g.fillRect(sx - 3, hy - L - 24, 6, 22); g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(sx, hy - L - 27, 4.5, 0, 7); g.fill();
      g.restore(); }});
  later(.42, () => { try { skfxShake(5); } catch (e) {}
    const pts = []; let a = Math.atan2(uy, ux); for (let i = 0; i <= 16; i++){ const u = i / 16; a += (bmH(i, 9) - .5) * .25; pts.push([px + ux * len * u + Math.cos(a + 1.57) * (bmH(i, 10) - .5) * 10, py + uy * len * u + Math.sin(a + 1.57) * (bmH(i, 10) - .5) * 5]); }
    skfxAdd({life:1.4, t:0, layer:'under', draw(g, k){ const n = Math.max(2, Math.ceil(pts.length * Math.min(1, k * 4))), al = 1 - Math.max(0, k - .4) / .6;
      g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
      for (const [w, c] of [[7, `rgba(60,40,20,${.7 * al})`], [4, `rgba(255,220,130,${.75 * al})`], [1.6, `rgba(255,255,240,${al})`]]){ g.strokeStyle = c; g.lineWidth = w; g.beginPath(); for (let i = 0; i < n; i++) i ? g.lineTo(pts[i][0], pts[i][1]) : g.moveTo(pts[i][0], pts[i][1]); g.stroke(); }
      g.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i += 2){ g.globalAlpha = al * (.4 + .3 * Math.sin(T * 8 + i)); bmSoft(g, pts[i][0], pts[i][1] - 4, 14, .5, '255,225,140'); }
      g.restore(); }});
    skfxAdd({life:.6, t:0, add:true, draw(g, k){ g.globalAlpha = 1 - k; bmSoft(g, sx, sy - 10, 40 + k * 50, .8, '255,240,190'); g.globalAlpha = 1; }}); });
}
// the sweeping kick: a wide soft arc of wind with dust thrown along it
function bmSweepFx(){ if (typeof skfxAdd !== 'function') return; const t = P.target, a0 = t && !t.dead ? Math.atan2(t.y - P.y, t.x - P.x) : (P.face || 1) > 0 ? 0 : Math.PI, x = P.x, y = P.y;
  skfxAdd({life:.42, t:0, draw(g, k){ const sw = -1.1 + k * 2.2;
    g.save(); g.translate(x, y - 14); g.scale(1, .55);
    for (let i = 0; i < 3; i++){ const R = 60 + i * 26, al = (1 - k) * (.5 - i * .12), a1 = a0 + sw, a2 = a0 + sw - .9;
      g.strokeStyle = `rgba(255,250,235,${al * 1.6})`; g.lineWidth = 14 - i * 3; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, R, a2, a1); g.stroke(); }
    g.restore();
    for (let i = 0; i < 8; i++){ const a = a0 + sw - bmH(i, 12) * .8, rr = 60 + bmH(i, 13) * 70; g.globalAlpha = (1 - k) * .5; bmSoft(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr * .55, 8 + k * 8, .55, '170,140,105'); }
    g.globalAlpha = 1; }}); }
// the drums: soft rings of sound rolling out, a pulse on each beat
function bmDrumFx(x, y){ if (typeof skfxAdd !== 'function') return;
  skfxAdd({life:1.6, t:0, draw(g, k){ for (let i = 0; i < 4; i++){ const q = k * 1.6 - i * .22; if (q < 0 || q > 1) continue; const R = 30 + q * 150;
      g.globalAlpha = (1 - q) * .55; g.strokeStyle = 'rgba(255,215,140,.9)'; g.lineWidth = 3 * (1 - q) + .6; g.beginPath(); g.ellipse(x, y - 4, R, R * .5, 0, 0, 7); g.stroke();
      g.globalAlpha = (1 - q) * .25; g.lineWidth = 8 * (1 - q); g.strokeStyle = 'rgba(255,190,90,.6)'; g.stroke(); }
    g.globalAlpha = 1; }}); }

// the uppercut: a bright crescent sweeping upwards through the foe
function bmUpcut(m){ if (typeof skfxAdd !== 'function') return; const x = m.x, y = m.y - (MOB_H[m.type] || 30) * .5;
  skfxAdd({life:.32, t:0, add:true, draw(g, k){ g.save(); g.translate(x, y); g.rotate(-1.57 + (k - .5) * 1.2); g.globalAlpha = 1 - k; const R = 26 + k * 10;
    const gr = g.createLinearGradient(-R, 0, R, 0); gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(.5, 'rgba(255,252,235,1)'); gr.addColorStop(1, 'rgba(255,215,130,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, -1.3, 1.3); g.arc(-6, 0, R * .88, 1.2, -1.2, true); g.closePath(); g.fill(); g.restore(); }}); }
