/* VAYRATHEN — js/sys/mage2.js — the Archsage's grand spells, second pass
   After the cast finishes the mage HOLDS the casting pose for 3 more seconds (can't move or attack) and the spell
   keeps working on the area for those 3 seconds (a hit every 0.5 s at 35% power), each with its own look and effect:
     สุริยาถล่ม  (fire)  : suns crash down, the ground burns, monsters hit keep burning (fire damage over 5 s)
     มหาอุทกภัย (water) : several roaming thunderstorms (no cloud, v31); soaked monsters take +30% Wind damage for 10 s
     พายุอสนีบาต (wind)  : a giant hurricane with lightning; caught monsters lose magic defence (+25% magic damage for 8 s)
     ธรณีสูบ    (earth) : a huge black pit, the ground cracks, big boulders fall from the sky, and the pit pulls monsters into it */
'use strict';

/* lighter on slow machines: follows the graphics preset (Low/Medium/High) and drops further while FPS is under 35 */
const fxQ = () => ((typeof GFX !== 'undefined' ? [.35, .7, 1][GFX.fx] : 1) ?? 1) * (typeof PERF !== 'undefined' && PERF.fps < 35 ? .6 : 1);
const GRAND = {solarfall:'sun', deluge:'rain', tempest:'storm', earthswallow:'pit'};
const MG = {fields:[], tick:0};
/* ---------- casting: hold the pose 3 s while the spell keeps going ---------- */
{ const _ex = execSkill;
  execSkill = function(id, lv, t){ const r = _ex.apply(this, arguments), kind = GRAND[id], sk = SKILLS[id];
    if (kind && sk){ const tg = t && !t.dead ? t : P.target; const x = tg ? tg.x : P.x, y = tg ? tg.y : P.y;
      MG.fields.push({kind, x, y, r:sk.radius, t0:T, dur:6, rocks:[], seed:Math.random() * 99});
      if (!(typeof DUEL !== 'undefined' && !DUEL.over)) P.channel = {id, lv, x, y, r:sk.radius, t:3, wait:1.6, next:0}; }   // no 3 s hold in a duel
    return r; }; }
{ const _pa = playerAct; playerAct = function(){ if (P.channel && !P.dead) return heroSheet().index.cast ? 'cast' : 'skill'; return _pa.apply(this, arguments); }; }
{ const _up = updPlayer;
  updPlayer = function(dt){ if (!P.channel || P.dead) return _up.apply(this, arguments);
    const t = P.target; P.target = null; P.pending = null; P.tx = null; const r = _up.apply(this, arguments); P.target = t; P.moving = false; return r; }; }
{ const _ts = trySkill; trySkill = function(){ if (P.channel) return; return _ts.apply(this, arguments); }; }
{ const _ub = updBot; updBot = function(){ if (P.channel) return; return _ub.apply(this, arguments); }; }
EV.on('tick', dt => {
  const c = P.channel; if (c){ if (P.dead){ P.channel = null; } else if ((c.wait -= dt) <= 0){ c.t -= dt; c.next -= dt;   // the main hits land first, then the 3 s hold
      if (c.next <= 0){ c.next = .5; const sk = SKILLS[c.id];
        for (const m of mobs){ if (m.dead || Math.hypot(m.x - c.x, m.y - c.y) > c.r + m.def.r) continue; applyDamage(m, magicDamage(m, sk.dmg(c.lv) * .35, sk.elem), sk); } }
      if (c.t <= 0) P.channel = null; } }
  // the pit pulls monsters in while it is open
  for (const f of MG.fields){ if (f.kind !== 'pit' || T - f.t0 > f.dur - .5) continue;
    for (const m of mobs){ if (m.dead) continue; const d = Math.hypot(m.x - f.x, m.y - f.y); if (d > f.r * 1.4 || d < 6) continue;
      const sp = (m.def.boss ? 25 : 140) * dt; m.x += (f.x - m.x) / d * Math.min(sp, d - 4); m.y += (f.y - m.y) / d * Math.min(sp, d - 4); } }
  MG.fields = MG.fields.filter(f => T - f.t0 < f.dur);
  // burning monsters
  if ((MG.tick -= dt) <= 0){ MG.tick = 1; for (const m of mobs) if (!m.dead && m.burnT > T) applyDamage(m, {dmg:Math.max(1, Math.round(m.burnDps || 1)), poison:true, elem:'fire'}); }
});
/* each grand spell's lasting effect on whatever it hits */
HK.dmgAfter.push((m, res, sk) => { if (!m || m.dead || !sk || !res || res.poison) return; const id = sk.id || Object.keys(GRAND).find(k => SKILLS[k] === sk); if (!GRAND[id]) return;
  if (id === 'solarfall'){ m.burnT = T + 5; m.burnDps = DER.matk * .25; }
  else if (id === 'deluge') m.wetT = T + 10;
  else if (id === 'tempest') m.mdefT = T + 8; });
HK.outMul.push((mult, elem, kind, m) => { if (!m) return mult;
  if (elem === 'wind' && m.wetT > T) mult *= 1.3;
  if (kind === 'magic' && m.mdefT > T) mult *= 1.25;
  return mult; });
for (const id in GRAND) if (SKILLS[id]){ const sk = SKILLS[id], d0 = sk.desc; sk.id = id;
  const extra = {solarfall:['เผาพื้นที่ มอนที่โดนติดไฟ 5 วิ', 'burns the ground, monsters keep burning for 5s'], deluge:['พายุฝนฟ้าคะนองหลายลูก มอนที่เปียกโดนธาตุลมแรงขึ้น 30% 10 วิ', 'several thunderstorms, soaked monsters take +30% Wind damage for 10s'],
    tempest:['พายุเฮอริเคนลูกใหญ่ ลดต้านทานเวทย์ (ดาเมจเวทย์ +25%) 8 วิ', 'a giant hurricane, lowers magic defence (+25% magic damage) for 8s'], earthswallow:['หลุมดำดูดมอนเข้าหาจุดศูนย์กลาง หินยักษ์ถล่ม', 'a black pit pulls monsters to its centre, giant boulders fall']}[id];
  sk.desc = lv => `${d0(lv)} · ${L(`ร่ายค้าง 3 วิ ต่อเนื่อง · ${extra[0]}`, `hold the cast 3s more · ${extra[1]}`)}`; }

/* ---------- the looks ---------- */
const mgR = (f, i, k) => { const a = Math.sin(i * 12.9898 + f.seed * 7.1) * 43758.5453; return (a - Math.floor(a)) * (k || 1); };
/* the thunderstorm (v31): no cloud. Several ordinary storm cells wander over the area, each a dark slanting curtain
   of heavy rain with its own lightning strikes hitting the ground (a jagged white-yellow bolt, a flash and a splash). */
function mgCells(g, f, x, y){
  const N = Math.max(3, Math.round(5 * fxQ())), slot = Math.floor(T * 7);
  for (let c = 0; c < N; c++){
    const a = mgR(f, c + 400, 6.28) + T * .15 * (c % 2 ? 1 : -1), d = f.r * (.25 + mgR(f, c + 410, .55)), cx = x + Math.cos(a) * d, gy = y + Math.sin(a) * d * .5, w = 34 + mgR(f, c + 420, 22), top = gy - 230;
    // the rain curtain: darker in the middle, fading out at the top and on its sides
    const cg = g.createLinearGradient(0, top, 0, gy); cg.addColorStop(0, 'rgba(60,80,110,0)'); cg.addColorStop(.35, 'rgba(60,80,110,.22)'); cg.addColorStop(1, 'rgba(60,80,110,.32)');
    g.fillStyle = cg; g.beginPath(); g.moveTo(cx - w * .7 - 26, top); g.lineTo(cx + w * .7 - 26, top); g.lineTo(cx + w, gy); g.lineTo(cx - w, gy); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(200,220,245,.75)'; g.lineWidth = 1.3;
    for (let i = 0, M = Math.round(22 * fxQ()); i < M; i++){ const ph = (T * 2.6 + mgR(f, c * 50 + i)) % 1, ox = (mgR(f, c * 50 + i + 7) - .5) * 2 * w, px = cx + ox - 26 * (1 - ph), py = top + ph * 230;
      g.beginPath(); g.moveTo(px, py); g.lineTo(px + 3, py + 14); g.stroke(); }
    // splashes where the rain lands
    g.strokeStyle = 'rgba(210,230,255,.6)'; g.lineWidth = 1;
    for (let i = 0; i < 4; i++){ const ph = (T * 2 + mgR(f, c * 30 + i + 200)) % 1, sx = cx + (mgR(f, c * 30 + i + 210) - .5) * 2 * w; g.globalAlpha *= 1; g.beginPath(); g.ellipse(sx, gy + 2, 2 + ph * 7, (2 + ph * 7) * .35, 0, 0, 7); g.stroke(); }
    // lightning: each cell strikes now and then, at its own moments
    const hit = mgR(f, slot * 13 + c * 7, 1); if (hit < .78) continue;
    const bx = cx + (mgR(f, slot + c * 3 + 900) - .5) * w; let px = bx - 18, py = top + 10;
    const pts = [[px, py]]; while (py < gy){ py += 14 + mgR(f, slot + py + c, 12); px += (mgR(f, slot * 3 + py + c) - .45) * 16; pts.push([px, Math.min(py, gy)]); }
    g.save(); g.globalCompositeOperation = 'lighter';
    const fl = g.createRadialGradient(bx, gy, 0, bx, gy, 70); fl.addColorStop(0, 'rgba(255,250,210,.55)'); fl.addColorStop(1, 'rgba(255,250,210,0)'); g.fillStyle = fl; g.beginPath(); g.ellipse(bx, gy, 70, 30, 0, 0, 7); g.fill();
    for (const [lw, col] of [[6, 'rgba(160,190,255,.35)'], [2.6, 'rgba(255,245,170,.95)'], [1, 'rgba(255,255,255,1)']]){ g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.beginPath(); pts.forEach((p2, i) => i ? g.lineTo(p2[0], p2[1]) : g.moveTo(p2[0], p2[1])); g.stroke(); }
    // a small fork off the main bolt
    const mid = pts[Math.floor(pts.length / 2)]; if (mid){ g.strokeStyle = 'rgba(255,245,170,.8)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(mid[0], mid[1]); g.lineTo(mid[0] + 14, mid[1] + 18); g.lineTo(mid[0] + 10, mid[1] + 34); g.stroke(); }
    g.restore(); }
}
function mgUnder(g){
  for (const f of MG.fields){ const age = T - f.t0, x = f.x - cam.x, y = f.y - cam.y, fade = Math.min(1, age * 2, (f.dur - age) * 1.5); if (fade <= 0) continue;
    g.save(); g.globalAlpha = fade;
    if (f.kind === 'pit'){ const rr = f.r * Math.min(1, age * 1.4);
      const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(0,0,0,.95)'); gr.addColorStop(.55, 'rgba(20,10,30,.85)'); gr.addColorStop(.8, 'rgba(70,45,25,.6)'); gr.addColorStop(1, 'rgba(70,45,25,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rr, rr * .5, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(40,25,15,.9)'; g.lineWidth = 2.2;   // cracks running out of the pit
      for (let i = 0, N = Math.round(12 * fxQ()); i < N; i++){ const a = mgR(f, i, 6.28), L1 = rr * (1.1 + mgR(f, i + 40, .8)); g.beginPath(); g.moveTo(x + Math.cos(a) * rr * .5, y + Math.sin(a) * rr * .25);
        for (let k = 1; k <= 4; k++){ const q = k / 4, w = (mgR(f, i * 9 + k, 1) - .5) * 14; g.lineTo(x + Math.cos(a) * (rr * .5 + (L1 - rr * .5) * q) + w, y + (Math.sin(a) * (rr * .25 + (L1 - rr * .5) * q * .5)) + w * .4); } g.stroke(); }
      // a slow swirl inside
      g.strokeStyle = 'rgba(150,90,255,.35)'; g.lineWidth = 1.5; for (let i = 0; i < 3; i++){ g.beginPath(); g.ellipse(x, y, rr * (.25 + i * .15), rr * (.12 + i * .07), T * (1 + i * .4), 0, 4.2); g.stroke(); } }
    else if (f.kind === 'sun'){ const gr = g.createRadialGradient(x, y, 0, x, y, f.r); gr.addColorStop(0, 'rgba(255,170,60,.55)'); gr.addColorStop(.7, 'rgba(255,90,20,.3)'); gr.addColorStop(1, 'rgba(255,60,0,0)');
      g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, f.r, f.r * .5, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(40,15,5,.35)'; g.globalCompositeOperation = 'source-over'; for (let i = 0; i < 7; i++){ const a = mgR(f, i, 6.28), d = mgR(f, i + 9, f.r * .8); g.beginPath(); g.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * .5, 14, 6, 0, 0, 7); g.fill(); } }
    else if (f.kind === 'rain'){ g.fillStyle = 'rgba(90,150,230,.28)'; g.beginPath(); g.ellipse(x, y, f.r, f.r * .5, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(200,230,255,.6)'; g.lineWidth = 1; for (let i = 0, N = Math.round(14 * fxQ()); i < N; i++){ const ph = (T * 1.6 + mgR(f, i)) % 1, a = mgR(f, i + 3, 6.28), d = mgR(f, i + 7, f.r * .9);
        g.globalAlpha = fade * (1 - ph); g.beginPath(); g.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * .5, 3 + ph * 12, (3 + ph * 12) * .4, 0, 0, 7); g.stroke(); } }
    else if (f.kind === 'storm'){ g.fillStyle = 'rgba(30,40,70,.35)'; g.beginPath(); g.ellipse(x, y, f.r * 1.1, f.r * .55, 0, 0, 7); g.fill(); }
    g.restore(); }
}
function mgOver(g){
  for (const f of MG.fields){ const age = T - f.t0, x = f.x - cam.x, y = f.y - cam.y, fade = Math.min(1, age * 2, (f.dur - age) * 1.5); if (fade <= 0) continue;
    g.save(); g.globalAlpha = fade;
    if (f.kind === 'rain'){ g.strokeStyle = 'rgba(170,200,240,.55)'; g.lineWidth = 1.1;   // a light rain over the whole area, the storm cells on top
      for (let i = 0, N = Math.round(40 * fxQ()); i < N; i++){ const ph = (T * 2.2 + mgR(f, i)) % 1, a = mgR(f, i + 1, 6.28), d = Math.sqrt(mgR(f, i + 2)) * f.r, px = x + Math.cos(a) * d - 30 + ph * 30, py = y + Math.sin(a) * d * .5 - 190 + ph * 190;
        g.beginPath(); g.moveTo(px, py); g.lineTo(px + 4, py + 16); g.stroke(); }
      mgCells(g, f, x, y); }
    else if (f.kind === 'sun'){ g.globalCompositeOperation = 'lighter';   // flames on the ground and on burning monsters
      for (let i = 0, N = Math.round(26 * fxQ()); i < N; i++){ const a = mgR(f, i, 6.28), d = Math.sqrt(mgR(f, i + 1)) * f.r * .95, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * .5, ph = (T * 1.8 + mgR(f, i + 2)) % 1, h = 10 + mgR(f, i + 3, 16);
        g.fillStyle = `rgba(255,${120 + Math.round(ph * 100)},40,${.6 * (1 - ph)})`; g.beginPath(); g.moveTo(px - 5, py); g.quadraticCurveTo(px - 2, py - h * (1 - ph * .3), px, py - h * 1.2 - ph * 10); g.quadraticCurveTo(px + 2, py - h * .5, px + 5, py); g.fill(); } }
    else if (f.kind === 'storm'){ const R = f.r * Math.min(1, age * .8 + .3);   // the hurricane: stacked spinning rings, a funnel, debris and lightning
      const fg = g.createLinearGradient(0, y - 250, 0, y); fg.addColorStop(0, 'rgba(120,140,170,.55)'); fg.addColorStop(1, 'rgba(90,110,140,.15)');   // the funnel body
      g.fillStyle = fg; g.beginPath(); g.moveTo(x - R * .3, y); g.quadraticCurveTo(x - R * .55, y - 140, x - R * 1.15, y - 250); g.lineTo(x + R * 1.15, y - 250); g.quadraticCurveTo(x + R * .55, y - 140, x + R * .3, y); g.closePath(); g.fill();
      for (let k = 0; k < 11; k++){ const hy = y - k * 23, rr = R * (.3 + k * .085), rot = T * (4 - k * .2);
        g.strokeStyle = `rgba(${215 + k * 3},${228 + k * 2},255,${.85 - k * .04})`; g.lineWidth = 4.5 - k * .25;
        for (let s = 0; s < 3; s++){ g.beginPath(); g.ellipse(x, hy, rr, rr * .3, 0, rot + s * 2.1, rot + s * 2.1 + 1.7); g.stroke(); } }
      for (let i = 0, N = Math.round(30 * fxQ()); i < N; i++){ const a = T * (2.4 + mgR(f, i)) + mgR(f, i + 5, 6.28), hh = mgR(f, i + 6, 220), rr = R * (.3 + hh / 400);
        g.fillStyle = i % 3 ? 'rgba(120,110,90,.9)' : 'rgba(70,140,60,.9)'; g.fillRect(x + Math.cos(a) * rr - 2, y - hh + Math.sin(a) * rr * .3 - 1.5, 4, 3); }
      if (Math.sin(T * 13 + f.seed) > .6){ g.strokeStyle = 'rgba(230,240,255,.95)'; g.lineWidth = 2.2; const bx = x + (mgR(f, Math.floor(T * 8), 2) - 1) * R * .8;
        g.beginPath(); g.moveTo(bx, y - 260); for (let k = 1; k <= 6; k++) g.lineTo(bx + (mgR(f, Math.floor(T * 8) + k, 2) - 1) * 18, y - 260 + k * 44); g.stroke(); } }
    else if (f.kind === 'pit'){ // boulders falling from the sky onto the pit
      for (let i = 0, N = Math.round(12 * fxQ()); i < N; i++){ const st = .2 + i * .38, ph = (age - st) / .7; if (ph < 0 || ph > 1.6) continue; const a = mgR(f, i, 6.28), d = mgR(f, i + 1, f.r * .7), gx = x + Math.cos(a) * d, gy = y + Math.sin(a) * d * .5, sz = 18 + mgR(f, i + 2, 18);
        if (ph <= 1){ const py = gy - 320 * (1 - ph * ph); g.fillStyle = '#6a5440'; g.beginPath(); g.ellipse(gx, py, sz, sz * .85, mgR(f, i + 3, 3), 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(gx - sz * .3, py - sz * .3, sz * .4, sz * .3, 0, 0, 7); g.fill();
          g.strokeStyle = 'rgba(255,170,80,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(gx, py - sz); g.lineTo(gx, py - sz - 30); g.stroke(); }
        else { const k = ph - 1; g.fillStyle = `rgba(150,120,90,${.6 * (1 - k / .6)})`; g.beginPath(); g.ellipse(gx, gy, sz * (1.5 + k * 4), sz * (.6 + k * 1.5), 0, 0, 7); g.fill(); if (k < .05) VFX.shake(3); } } }
    g.restore(); }
  // flames on monsters that are still burning
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const m of mobs){ if (m.dead || !(m.burnT > T)) continue; const x = m.x - cam.x, y = m.y - cam.y, h = MOB_H[m.type] || 30;
    for (let i = 0; i < 4; i++){ const ph = (T * 2 + i * .25) % 1; g.fillStyle = `rgba(255,${140 + i * 20},40,${.55 * (1 - ph)})`; g.beginPath(); g.ellipse(x + (i - 1.5) * 5, y - h * .4 - ph * h * .7, 3.5 * (1 - ph * .5), 6 * (1 - ph * .4), 0, 0, 7); g.fill(); } }
  g.restore();
}
{ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g, ...a){ const r = _u.call(this, g, ...a); if (MG.fields.length) mgUnder(g); return r; }; }
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a); mgOver(g); return r; }; }
