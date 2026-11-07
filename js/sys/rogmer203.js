/* VAYRATHEN — js/sys/rogmer203.js — (v203) the thief and merchant lines, from docs/PROPOSAL_ROGUE_MERCHANT.md
   (the owner said go)
   นักย่อง   ลอบสังหาร → ฟันทะลุเงา: dash straight through everything in a line and come out the far side ·
             จู่โจมจากเงา removed (a copy of ใจเสือ; its points come back) · ประทับเงามรณะ: a marked monster that dies
             bursts in shadow on those around it · พยัคฆ์พุ่งเงา → พยัคฆ์กระโจน: leap in and strike everything round
             where you land, stunning it
   พ่อค้า    ถล่มทอง → ทุ่มถุงทอง: a sack of gold bursts round the target · พายุขวาน → ขวานบูมเมอแรง: the axe flies out
             down a line and spins back, hitting twice · หัตถ์ไมดาส: the target turns to gold — held still 3 s and taking
             +50% damage (a boss is not held, but takes the extra damage) · ห่าเหรียญทอง removed (a copy of the other
             coin skills; its points come back) */
'use strict';
const RM_DROP = {bandit:['ambush'], tycoon:['goldshower']};
const RM_GONE = Object.values(RM_DROP).flat();
for (const [j, ids] of Object.entries(RM_DROP)){ if (JOBS[j]) JOBS[j].skills = JOBS[j].skills.filter(id => !ids.includes(id));
  if (typeof SK8 !== 'undefined' && SK8[j]) for (const k of ['a', 'b', 'c']) SK8[j][k] = SK8[j][k].filter(id => !ids.includes(id)); }
for (const id in SKILLS){ const s = SKILLS[id]; if (!s.req) continue; for (const q of Object.keys(s.req)) if (RM_GONE.includes(q)) delete s.req[q]; if (!Object.keys(s.req).length) s.req = undefined; }
function rmRefund(){ if (!S || !S.skills) return; let n = 0;
  for (const id of RM_GONE) if (S.skills[id]){ n += S.skills[id]; delete S.skills[id]; }
  if (Array.isArray(S.hot)) S.hot = S.hot.map(h => (RM_GONE.includes(h) ? null : h));
  if (n){ S.skPts = (S.skPts || 0) + n; derive(); dirty = true; if (typeof renderHotbar === 'function') renderHotbar();
    if (typeof log === 'function') log(L(`สกิลปรับใหม่: คืน ${n} แต้มสกิลจากสกิลที่ถูกนำออก`, `Skills reworked: ${n} skill points returned from removed skills`), 'g'); } }
EV.on('tick', () => { if ((rmRefund.t = (rmRefund.t || 0) + 1) % 30 === 0) rmRefund(); });
{ const _d0 = derive; derive = function(){ if (S && S.skills && !rmRefund.busy && RM_GONE.some(id => S.skills[id])){ rmRefund.busy = 1; try { rmRefund(); } finally { rmRefund.busy = 0; } } return _d0.apply(this, arguments); }; }

const RMD = (id, o) => { const s = SKILLS[id]; if (s) Object.assign(s, o); return s; };
const rmP = v => Math.round(v * 100) + '%';
const rmD = id => lv => rmP(SKILLS[id].dmg(lv));
/* ---------- นักย่อง ---------- */
RMD('assassinate', {name:'ฟันทะลุเงา', en:'Shadow Rend', short:'ทะลุเงา', shortEn:'Rend', type:'line', fx:'shadowRend', len:180, width:34, dmg:lv => 4 + lv * .4,
  desc:lv => L(`พุ่งทะลุทุกตัวในแนว 180 ไปโผล่อีกฝั่ง · ${rmD('assassinate')(lv)} ATK · พิษ 40% ATK/วิ 6 วิ`, `Dash straight through everything in a 180 line and out the far side · ${rmD('assassinate')(lv)} ATK · poison 40% ATK/s for 6 s`)});
RMD('deathmark', {desc:lv => L(`ฟันเป้าเดียว ${rmD('deathmark')(lv)} ATK · ประทับตรา: รับดาเมจ +30% 8 วิ · ถ้าตายระหว่างนั้น ระเบิดเงาใส่มอนรอบ ๆ (รัศมี 100 · ${rmP(3 + lv * .3)} ATK)`, `${rmD('deathmark')(lv)} ATK to one foe · marked: takes +30% damage for 8 s · if it dies meanwhile it bursts in shadow on those around it (100 · ${rmP(3 + lv * .3)} ATK)`)});
RMD('tigerpounce', {name:'พยัคฆ์กระโจน', en:'Tiger Leap', short:'กระโจน', shortEn:'Leap',
  desc:lv => L(`กระโจนเข้าหาเป้าไกลสุด 240 · ${rmD('tigerpounce')(lv)} ATK · ลงพื้นตีรอบจุดที่ลง 90 · ${rmP(2 + lv * .25)} ATK · มึน 1 วิ`, `Leap at a foe up to 240 away · ${rmD('tigerpounce')(lv)} ATK · the landing strikes everything within 90 for ${rmP(2 + lv * .25)} ATK · stun 1 s`)});
/* ---------- พ่อค้า ---------- */
RMD('goldrush', {name:'ทุ่มถุงทอง', en:'Gold Sack', short:'ถุงทอง', shortEn:'Sack', type:'aoeTarget', fx:'none', range:190, radius:80, dmg:lv => 3 + lv * .45,
  desc:lv => L(`ทุ่มถุงทองใส่เป้า ระเบิดเหรียญรอบเป้า 80 · ${rmD('goldrush')(lv)} ATK · มึน 0.8 วิ · ใช้เงิน ${SKILLS.goldrush.bia(lv).toLocaleString()} เบี้ย`, `Hurl a sack of gold that bursts round the target (80) · ${rmD('goldrush')(lv)} ATK · stun 0.8 s · costs ${SKILLS.goldrush.bia(lv).toLocaleString()} Bia`)});
RMD('axestorm', {name:'ขวานบูมเมอแรง', en:'Boomerang Axe', short:'บูมเมอแรง', shortEn:'Boomerang', type:'line', fx:'axeBoomerang', len:200, width:34, hits:undefined, radius:undefined, st2:undefined, dmg:lv => 2.4 + lv * .3,
  desc:lv => L(`ขว้างขวานพุ่งไปในแนว 200 แล้วหมุนกลับ โดน 2 รอบ · รอบละ ${rmD('axestorm')(lv)} ATK`, `Throw the axe down a 200 line; it spins back and hits twice · ${rmD('axestorm')(lv)} ATK each pass`)});
RMD('midasstrike', {desc:lv => L(`${rmD('midasstrike')(lv)} ATK · เป้ากลายเป็นทอง หยุดนิ่ง 3 วิ และรับดาเมจ +50% (บอสไม่หยุด แต่รับดาเมจเพิ่ม) · ใช้เงิน ${SKILLS.midasstrike.bia(lv).toLocaleString()} เบี้ย`, `${rmD('midasstrike')(lv)} ATK · the target turns to gold: held 3 s and taking +50% damage (a boss is not held, but takes the extra) · costs ${SKILLS.midasstrike.bia(lv).toLocaleString()} Bia`)});

/* ---------- the mechanics ---------- */
const rmMul = (m, mult, sk) => (typeof skillPhys === 'function' ? skillPhys(m, mult, sk && sk.elem) : physDamage(m, mult));
const rmNear = (x, y, r, skip) => mobs.filter(m => !m.dead && !m.pvp && m !== skip && Math.hypot(m.x - x, m.y - y) < r + m.def.r);
{ const _ex = execSkill; execSkill = function(id, lv, t){
    const tg = t && !t.dead ? t : null, x0 = P.x, y0 = P.y, r = _ex.apply(this, arguments);
    // ฟันทะลุเงา: once the cut has landed, you come out on the far side of the line
    if (id === 'assassinate' && tg){ const d = Math.hypot(tg.x - x0, tg.y - y0) || 1, ux = (tg.x - x0) / d, uy = (tg.y - y0) / d, go = Math.min(SKILLS.assassinate.len, d + 40);
      rmShadowTrail(x0, y0, x0 + ux * go, y0 + uy * go);
      later(.2, () => { P.x = clamp(x0 + ux * go, 20, W - 20); P.y = clamp(y0 + uy * go, 20, H - 20); if (typeof pushOut === 'function') pushOut(P, 12); P.dir = SPR.dirFromVec(ux, uy); }); }
    // พยัคฆ์กระโจน: the landing strikes everything round you
    if (id === 'tigerpounce' && tg) later(.28, () => { const sk = SKILLS.tigerpounce; rmDust(P.x, P.y, 90);
      for (const m of rmNear(P.x, P.y, 90, tg)){ applyDamage(m, rmMul(m, 2 + lv * .25, sk), sk); applyStatus(m, {stun:1}); } });
    // ทุ่มถุงทอง: the sack flies, then bursts in coins
    if (id === 'goldrush' && tg) rmSack(x0, y0, tg.x, tg.y);
    // ขวานบูมเมอแรง: out, and back again a moment later
    if (id === 'axestorm' && tg){ const d = Math.hypot(tg.x - x0, tg.y - y0) || 1, ux = (tg.x - x0) / d, uy = (tg.y - y0) / d, sk = SKILLS.axestorm;
      rmAxe(x0, y0, ux, uy, sk.len);
      later(.62, () => { for (const m of mobs){ if (m.dead || m.pvp) continue; const rx = m.x - P.x, ry = m.y - P.y, along = rx * ux + ry * uy, side = Math.abs(rx * uy - ry * ux);
        if (along > -10 && along < sk.len && side < sk.width + m.def.r) applyDamage(m, rmMul(m, sk.dmg(lv), sk), sk); } }); }
    return r; }; }
{ const _ad = applyDamage; applyDamage = function(m, res, sk){
    if (m && !m.dead && res && res.dmg > 0 && !res.poison && m._goldT > T && !(sk && sk.id === 'midasstrike')) res = {...res, dmg:Math.round(res.dmg * 1.5)};
    const r = _ad.apply(this, arguments), id = sk && sk.id;
    if (m && res && !res.miss && !res.poison){
      if (id === 'deathmark' && !m.dead) m._dmT = T + 8;
      if (id === 'midasstrike' && !m.dead){ m._goldT = T + 3; if (!m.def.boss) applyStatus(m, {stun:3}); addText(m.x, m.y - MOB_H[m.type] - 20, L('กลายเป็นทอง!', 'Turned to gold!'), '#ffd84a', 13); }
      if (m.dead && m._dmT > T && !m._dmBoom){ m._dmBoom = 1; const lv = (S.skills && S.skills.deathmark) || 1, sk2 = SKILLS.deathmark; rmShadowBurst(m.x, m.y, 100);
        for (const o of rmNear(m.x, m.y, 100, m)) applyDamage(o, rmMul(o, 3 + lv * .3, sk2), sk2); }
    }
    return r; }; }

/* ---------- the looks (soft, natural shapes) ---------- */
const rmH = (i, k = 0) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
function rmSmoke(g, x, y, r, a, col = '40,30,55'){ const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.6, `rgba(${col},${a * .45})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
function rmShadowTrail(x0, y0, x1, y1){ if (typeof skfxAdd !== 'function') return;
  skfxAdd({life:.7, t:0, draw(g, k){ for (let i = 0; i < 10; i++){ const u = i / 9, px = x0 + (x1 - x0) * u, py = y0 + (y1 - y0) * u - 18; g.globalAlpha = (1 - k) * .8 * Math.min(1, k * 5 + .2);
      rmSmoke(g, px + Math.sin(i * 2 + k * 6) * 4, py - k * 10, 10 + k * 10 + rmH(i) * 6, .7); }
    g.globalAlpha = (1 - k); g.strokeStyle = 'rgba(190,160,255,.9)'; g.lineWidth = 2 * (1 - k) + .5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0 - 18); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 26, x1, y1 - 18); g.stroke(); g.globalAlpha = 1; }}); }
function rmShadowBurst(x, y, r){ if (typeof skfxAdd !== 'function') return;
  skfxAdd({life:.8, t:0, draw(g, k){ for (let i = 0; i < 12; i++){ const a = i / 12 * 6.283 + rmH(i, 3), rr = r * (.2 + k * .9); g.globalAlpha = (1 - k) * .75; rmSmoke(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr * .5 - 14 - k * 10, 12 + k * 14, .75, '30,18,45'); }
    g.globalAlpha = (1 - k) * .9; rmSmoke(g, x, y - 16, r * .5 * (1 - k * .5), .8, '120,70,200'); g.globalAlpha = 1; }}); try { skfxShake(2.5); } catch (e) {} }
function rmDust(x, y, r){ if (typeof skfxAdd !== 'function') return;
  skfxAdd({life:.6, t:0, draw(g, k){ for (let i = 0; i < 10; i++){ const a = i / 10 * 6.283, rr = r * (.3 + k * .8); g.globalAlpha = (1 - k) * .6; rmSmoke(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr * .5 - k * 8, 10 + k * 12, .6, '160,130,95'); } g.globalAlpha = 1; }}); try { skfxShake(2); } catch (e) {} }
function rmSack(x0, y0, x1, y1){ if (typeof skfxAdd !== 'function') return;
  skfxAdd({life:.42, t:0, draw(g, k){ const x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k - 30 - Math.sin(k * Math.PI) * 50;
      g.save(); g.translate(x, y); g.rotate(k * 7); g.fillStyle = '#8a5a2a'; g.beginPath(); g.ellipse(0, 2, 8, 9, 0, 0, 7); g.fill(); g.fillStyle = '#a8743a'; g.beginPath(); g.ellipse(-2, 0, 5, 6, 0, 0, 7); g.fill();
      g.strokeStyle = '#5a3a18'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-4, -7); g.quadraticCurveTo(0, -10, 4, -7); g.stroke(); g.fillStyle = '#ffd84a'; g.beginPath(); g.arc(0, -9, 2.4, 0, 7); g.fill(); g.restore(); }});
  later(.42, () => skfxAdd({life:.9, t:0, add:true, draw(g, k){ const n = 26;
    for (let i = 0; i < n; i++){ const a = rmH(i, 5) * 6.283, sp = 30 + rmH(i, 6) * 70, px = x1 + Math.cos(a) * sp * k, py = y1 - 20 + Math.sin(a) * sp * k * .5 - (60 * k - 90 * k * k) * (1 + rmH(i, 7));
      const f = Math.abs(Math.sin(k * 14 + i)); g.globalAlpha = 1 - k; g.fillStyle = '#ffd84a'; g.beginPath(); g.ellipse(px, py, 2.6 * f + .6, 2.6, 0, 0, 7); g.fill(); g.fillStyle = '#fff6c0'; g.beginPath(); g.ellipse(px - .5 * f, py - .6, 1.2 * f + .2, 1.2, 0, 0, 7); g.fill(); }
    const gr = g.createRadialGradient(x1, y1 - 10, 0, x1, y1 - 10, 60); gr.addColorStop(0, `rgba(255,220,110,${.55 * (1 - k)})`); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.globalAlpha = 1; g.fillStyle = gr; g.beginPath(); g.ellipse(x1, y1 - 6, 60, 34, 0, 0, 7); g.fill(); }})); }
function rmAxe(x0, y0, ux, uy, len){ if (typeof skfxAdd !== 'function') return;
  skfxAdd({life:1.05, t:0, draw(g, k){ const out = k < .5 ? Math.sin(k / .5 * Math.PI / 2) : Math.cos((k - .5) / .5 * Math.PI / 2), x = P.x + ux * len * out + (x0 - P.x) * (k < .5 ? 1 : 0) * 0, y = P.y + uy * len * out - 22;
      g.save(); g.translate(x, y); g.rotate(k * 34); g.strokeStyle = '#6a4424'; g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-9, 0); g.lineTo(9, 0); g.stroke();
      g.fillStyle = '#c8ccd6'; g.beginPath(); g.moveTo(5, -1); g.quadraticCurveTo(13, -9, 15, -2); g.quadraticCurveTo(14, 6, 6, 3); g.closePath(); g.fill(); g.strokeStyle = '#7a808c'; g.lineWidth = .8; g.stroke();
      g.restore(); g.globalAlpha = .35; g.strokeStyle = 'rgba(230,235,245,.9)'; g.lineWidth = 6; g.beginPath(); g.arc(x, y, 12, k * 34, k * 34 + 2.2); g.stroke(); g.globalAlpha = 1; }}); }
/* a monster turned to gold glows gold until it wears off */
{ const _dm = drawMobW; drawMobW = function(g, m){ const r = _dm.apply(this, arguments);
    if (m && !m.dead && m._goldT > T){ const x = m.x - cam.x, y = m.y - cam.y, h = (MOB_H[m.type] || 30) * (m.def.boss ? (m.def.bsz || 1.6) : 1);
      g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y - h * .5, 0, x, y - h * .5, h * .7); gr.addColorStop(0, 'rgba(255,215,90,.55)'); gr.addColorStop(1, 'rgba(255,190,60,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y - h * .5, h * .55, h * .7, 0, 0, 7); g.fill();
      for (let i = 0; i < 5; i++){ const tw = Math.max(0, Math.sin(T * 5 + i * 1.7)); g.globalAlpha = tw; g.fillStyle = '#fff6c0'; g.beginPath(); g.arc(x + (rmH(i, m.id || 1) - .5) * h * .8, y - h * (.2 + rmH(i, 9) * .7), 1.4, 0, 7); g.fill(); }
      g.restore(); }
    return r; }; }
// the boomerang draws its own flight: no travelling wave from linefx192.js on top of it
if (typeof skfxCast === 'function'){ const _c = skfxCast; skfxCast = function(id){ if (id === 'axestorm') return; return _c.apply(this, arguments); }; }
