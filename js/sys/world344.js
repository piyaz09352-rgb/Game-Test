/* VAYRATHEN — js/sys/world344.js — (v344) the owner: «do 1–5 in detail»
   2. Sound sliders: «เสียงตอนตีโดน» and «เสียงฝีเท้า» get their own sliders in Settings (0 = off), under the effects one.
   3. Packs that behave like animals (no number changes):
      · a monster brought low (under 20% HP) breaks off and runs to its nearest kin, then turns and fights again;
      · a monster that is hit gives a cry, and kin of its own kind close by come to its aid;
      · shy animals (deer, hares, birds on the ground, squirrels, sheep…) bolt when you walk up to them — until one is hit.
      Bosses, pack leaders, monsters in towers and dungeons and monsters under the room host's control online are left alone.
   4. The scenery answers: tall grass and bushes sway and part as you or a monster pass through; a monster crossing water
      leaves rings; when a boss roars the leaves round it are torn loose and blown away.
   5. Victory: the hero raises the weapon (gfx: SK_POSE.cheer) when a boss falls or at a level up; at low HP, standing
      still, the hero is bent over and panting (SK_POSE.tired). */
'use strict';
const W344 = {sway:[], leaf:[], ring:[], lastLv:0};

// ---- the two actions for every hero sheet ----
for (const j in SPR.CHAR_ACTIONS) SPR.CHAR_ACTIONS[j] = [...new Set([...(SPR.CHAR_ACTIONS[j] || []), 'cheer', 'tired'])];
if (typeof heroSheet === 'function'){ const _hs = heroSheet; heroSheet = function(){ const sh = _hs.apply(this, arguments);
    if (sh && sh.index && !sh.index.cheer){ for (const a of ['cheer', 'tired']){ const A = SPR.ACTIONS[a]; sh.index[a] = {n:A.n, fps:A.fps, loop:!!A.loop}; } if (SPR.CHAR_ACTIONS[sh.key]) SPR.CHAR_ACTIONS[sh.key] = [...new Set([...SPR.CHAR_ACTIONS[sh.key], 'cheer', 'tired'])]; }
    return sh; }; }

// ---- 5. victory and fatigue ----
const w344Cheer = () => { if (P.dead || P.ride || P.cast) return; P.cheerT = 1.1; };
if (typeof playerAct === 'function'){ const _pa = playerAct; playerAct = function(){ const a = _pa.apply(this, arguments);
    if (P.cheerT > 0 && (a === 'idle' || a === 'walk' || a === 'tired')) return 'cheer';
    if (a === 'idle' && S && DER && DER.maxhp && S.hp / DER.maxhp < .25 && !P.target) return 'tired';
    return a; }; }
EV.on('tick', dt => {
  if (P.cheerT > 0){ P.cheerT -= dt; if (P.moving || P.atkAnim > 0 || P.skillAnim > 0 || P.cast) P.cheerT = 0; }
  if (S){ if (W344.lastLv && S.lvl > W344.lastLv) w344Cheer(); W344.lastLv = S.lvl; }
  for (const m of mobs) if (m.dead && m.def && m.def.boss && !m.vanish && !m._w344 && m.hp <= 0){ m._w344 = 1; if (Math.hypot(m.x - P.x, m.y - P.y) < 600) setTimeout(w344Cheer, 1400); }
});

// ---- 3. packs ----
const W344_SHY = /deer|hare|rabbit|squirrel|fowl|egret|sheep|ram|goat|serow|muntjac|camel|chicken|duck|goose/;
const w344Free = m => m && !m.dead && m.def && !m.def.boss && !m.elite && !m.wb && !m.dg && !m.tw && !m.inv && !m.minion && !m.dummy && !m.pvp && !(typeof nmSlave === 'function' && nmSlave() && !m.mine);
const w344Kin = (m, r) => mobs.filter(o => o !== m && !o.dead && o.type === m.type && w344Free(o) && Math.hypot(o.x - m.x, o.y - m.y) < r);
if (typeof applyDamage === 'function'){ const _ad = applyDamage; applyDamage = function(m, res){ const r = _ad.apply(this, arguments);
    try { if (w344Free(m) && res && res.dmg > 0){ m.shyOff = 1;
        if (!m.callT || T - m.callT > 4){ m.callT = T; for (const o of w344Kin(m, 190).slice(0, 2)) if (!o.aggro){ o.aggro = true; o.calledT = T; } }   // a cry: kin close by come
        if (m.hp > 0 && m.hp < m.maxhp * .2 && !m.fledOnce){ const kin = w344Kin(m, 520).filter(o => Math.hypot(o.x - P.x, o.y - P.y) > Math.hypot(m.x - P.x, m.y - P.y));
          if (kin.length){ m.fledOnce = 1; const k = kin[0]; m.fleeTo = {x:k.x, y:k.y, t:2.4}; } } } } catch (e) {}
    return r; }; }
if (typeof updMob === 'function'){ const _um = updMob; updMob = function(m, dt){
    if (m.fleeTo && !m.dead){ const f = m.fleeTo; f.t -= dt; const d = Math.hypot(f.x - m.x, f.y - m.y);
      if (f.t <= 0 || d < 24 || (m.st && (m.st.stun > 0 || m.st.freeze > 0))){ m.fleeTo = null; m.aggro = true; }
      else { const sp = (m.def.speed || 40) * 1.25 * dt, nx = m.x + (f.x - m.x) / d * sp, ny = m.y + (f.y - m.y) / d * sp; if (walkable(nx, ny, m.def.r || 10)){ m.x = nx; m.y = ny; } else { m.fleeTo = null; m.aggro = true; }
        m.moving = true; m.dir = SPR.dirFromVec(f.x - m.x, f.y - m.y); m.atkT = 9; if (m.flash > 0) m.flash -= dt; return; } }
    if (!m.aggro && !m.shyOff && w344Free(m) && W344_SHY.test(m.type) && !P.dead){ const d = Math.hypot(m.x - P.x, m.y - P.y);
      if (d < 85 && (!m.shyT || T - m.shyT > 2.5)){ m.shyT = T; const a = Math.atan2(m.y - P.y, m.x - P.x) + (Math.random() - .5) * .6, r = 90 + Math.random() * 40;
        m.tx = clamp(m.x + Math.cos(a) * r, m.zone.x0, m.zone.x1); m.ty = clamp(m.y + Math.sin(a) * r, m.zone.y0, m.zone.y1); m.wait = 0; m.bolt = .9; } }
    if (m.bolt > 0){ m.bolt -= dt; const sp0 = m.def.speed; m.def.speed = sp0 * 2.1; try { return _um.apply(this, arguments); } finally { m.def.speed = sp0; } }
    return _um.apply(this, arguments); }; }

// ---- 4. the scenery answers ----
const W344_SOFT = /^(bush|flowerbed|hedge|kelp|seafan|anemone)$/;
function w344Props(){ return (typeof PROPS !== 'undefined' && PROPS) || []; }
EV.on('tick', dt => {
  if (!S || (typeof feelQ === 'function' && feelQ() < 1)) { W344.sway.length = 0; return; }
  const movers = [P, ...mobs.filter(m => !m.dead && m.moving && Math.abs(m.x - P.x) < 700 && Math.abs(m.y - P.y) < 420)];
  if ((W344.k = (W344.k || 0) + 1) % 3 === 0){ const ps = w344Props();
    for (const w of movers){ if (w === P && !P.moving) continue;
      for (const p of ps){ if (!p || !W344_SOFT.test(p.type) || Math.abs(p.x - w.x) > 26 || Math.abs(p.y - w.y) > 16) continue;   // a bush or a bed of flowers you brush past shakes
        if (!W344.sway.find(s => s.p === p)) W344.sway.push({p, x:p.x, y:p.y, t:0, dir:Math.sign(p.x - w.x) || 1, big:1}); }
      // the grass painted on the ground parts at the feet of whoever walks on it
      const gk = w === P ? (typeof LIFE_STEP !== 'undefined' ? LIFE_STEP.gk : 'grass') : (typeof lifeGround === 'function' && (W344.k % 9 === 0) ? (w.gk = lifeGround(w.x, w.y)) : w.gk);
      if (gk === 'grass' && W344.sway.filter(s => s.w === w).length < 2) W344.sway.push({w, x:w.x, y:w.y + 1, t:0, dir:(W344.k % 2 ? 1 : -1)}); } }
  for (const s of W344.sway) s.t += dt; W344.sway = W344.sway.filter(s => s.t < .7);
  for (const m of mobs){ if (m.dead || !m.moving || Math.abs(m.x - P.x) > 700) continue; if ((m.ripT = (m.ripT || 0) - dt) > 0) continue; m.ripT = .35;
    if (typeof waterAt === 'function' && waterAt(m.x, m.y)) W344.ring.push({x:m.x, y:m.y, t:0, r:(m.def.r || 12) * .8}); }
  for (const r of W344.ring) r.t += dt; W344.ring = W344.ring.filter(r => r.t < .9);
  for (const m of mobs){ if (m.dead || !m.def || !m.def.boss) continue; const roar = (m.bAct === 'broar' || m.rageT > 0 || (typeof mobAnim === 'function' && mobAnim(m)[0] === 'broar'));
    if (roar && (!m.leafT || T - m.leafT > 1.2)){ m.leafT = T; for (let i = 0; i < 18; i++){ const a = Math.random() * 6.28, d = 30 + Math.random() * 90;
        W344.leaf.push({x:m.x + Math.cos(a) * d, y:m.y + Math.sin(a) * d * .5, z:8 + Math.random() * 30, vx:Math.cos(a) * (60 + Math.random() * 60), vy:Math.sin(a) * 25, vz:20 + Math.random() * 30, t:0, life:1.2 + Math.random() * .6, rot:Math.random() * 6, col:Math.random() < .5 ? '96,140,60' : '150,130,60'}); } } }
  for (const l of W344.leaf){ l.t += dt; l.x += l.vx * dt; l.y += l.vy * dt; l.z = Math.max(0, l.z + l.vz * dt); l.vz -= 30 * dt; l.vx *= .985; l.rot += dt * 6; }
  W344.leaf = W344.leaf.filter(l => l.t < l.life); if (W344.leaf.length > 120) W344.leaf.splice(0, W344.leaf.length - 120);
});
function w344Draw(g){
  for (const r of W344.ring){ const k = r.t / .9, x = r.x - cam.x, y = r.y - cam.y; g.strokeStyle = `rgba(220,240,255,${(1 - k) * .5})`; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, r.r * (1 + k * 1.8), r.r * .4 * (1 + k * 1.8), 0, 0, 7); g.stroke(); }
  for (const s of W344.sway){ const k = s.t / .7, a = Math.sin(k * Math.PI * 3) * (1 - k) * .55 * s.dir, x = s.x - cam.x, y = s.y - cam.y, sc = s.big ? 1.6 : 1;   // blades or leaves flicked aside, then swaying back
    g.save(); g.translate(x, y); g.scale(sc, sc); g.strokeStyle = s.big ? `rgba(70,130,60,${(1 - k) * .9})` : `rgba(120,170,75,${(1 - k) * .8})`; g.lineWidth = 1.2; g.lineCap = 'round';
    for (let i = -2; i <= 2; i++){ const sp = s.big ? 1 : -1; g.beginPath(); g.moveTo(i * 2.6, 0); g.quadraticCurveTo(i * 2.6 + a * 8 + i * sp * k * 2, -5, i * 3.2 + a * 13 + i * k * 3, -9 + Math.abs(i)); g.stroke(); } g.restore(); }
  for (const l of W344.leaf){ const a = Math.min(1, (l.life - l.t) * 2); g.save(); g.translate(l.x - cam.x, l.y - cam.y - l.z); g.rotate(l.rot); g.fillStyle = `rgba(${l.col},${a})`; g.beginPath(); g.ellipse(0, 0, 3.2, 1.4, 0, 0, 7); g.fill(); g.restore(); } }
if (typeof LIVE !== 'undefined'){ const _o = LIVE.drawOver; LIVE.drawOver = function(g){ const r = _o.apply(this, arguments); try { if (S) w344Draw(g); } catch (e) {} return r; }; }

// ---- 2. the sliders ----
if (typeof renderSettings === 'function'){ const _rs = renderSettings; renderSettings = function(){ const r = _rs.apply(this, arguments);
    try { const sfx = document.getElementById('set-sfxVol'), row = sfx && sfx.closest('label'); if (row && !document.getElementById('set-hitVol')){
        const mk = (id, th, en) => { const v = SETTINGS[id] ?? 100, l = document.createElement('label'); l.className = 'set';
          l.innerHTML = `<span><b>${L(th, en)}</b><small id="${id}V">${v}%</small></span><input type="range" id="set-${id}" data-set="${id}" min="0" max="100" step="5" value="${v}">`; return l; };
        row.after(mk('stepVol', 'เสียงฝีเท้า', 'Footsteps')); row.after(mk('hitVol', 'เสียงตอนตีโดน', 'Hit sounds')); } } catch (e) {}
    return r; }; }
document.addEventListener('input', e => { if (e.target.id === 'set-hitVol' || e.target.id === 'set-stepVol'){ const k = e.target.dataset.set; SETTINGS[k] = +e.target.value; const s = document.getElementById(k + 'V'); if (s) s.textContent = e.target.value + '%'; } });
