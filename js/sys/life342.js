/* VAYRATHEN — js/sys/life342.js — (v342) the world feels alive, and every blow can be read
   The owner: «do them all».
   5. Wind-up: an ordinary monster's bite or swipe used to land the instant it started (the hit came at the first frame
      of its attack, the strike frame came after). Now the monster gathers first and the blow lands on its strike frame,
      a beat later (~0.22 s) — the same damage and the same rhythm, but you can see it coming. If you are out of its
      reach by then, it bites air. Bosses (their skills have their own warnings), ranged monsters and every other way a
      monster can hurt you are unchanged.
   2. A boss's death: the moment slows (a third of the speed for about a second), it roars a last time, then goes down
      the way its body does (gfx: DIEX) and stays a little longer; its element bursts from it as it falls — fire into
      embers, water into spray, wind into gusts of leaves, earth into stones, holy into rising light, shadow into smoke.
   3. Idle life and sleep: see gfx/beasts.js (FIDX, SLEEPX) — picked here (mobAnim): a monster standing at rest now and
      then does something of its own; at night a calm one far from you lies down to sleep.
   4. Footsteps: see the end of this file. */
'use strict';
const LIFE = {upd:null, pend:[], slow:0};

// ---- 5. wind-up ----
const LIFE_WIND = .22;
if (typeof updMob === 'function'){ const _um = updMob; updMob = function(m){ const was = LIFE.upd; LIFE.upd = m; try { return _um.apply(this, arguments); } finally { LIFE.upd = was; } }; }
if (typeof mobAttack === 'function'){ const _ma = mobAttack; mobAttack = function(m, mult = 1, noDodge = false){
    if (LIFE.upd === m && m && m.def && mult === 1 && !noDodge && !m.def.boss && !m.def.range && !m.pvp && !m.windT){
      m.windT = LIFE_WIND; m.atkT = 0; m.lunge = 0; LIFE.pend.push(m); return; }   // the anim starts now (gather), the blow comes at its strike frame
    return _ma.apply(this, arguments); };
  EV.on('tick', dt => {
    if (!LIFE.pend.length) return;
    for (const m of LIFE.pend.slice()){ if ((m.windT -= dt) > 0) continue; LIFE.pend.splice(LIFE.pend.indexOf(m), 1); m.windT = 0;
      if (m.dead || P.dead || !mobs.includes(m)) continue;
      const st = m.st || {}; if (st.stun > 0 || st.freeze > 0 || st.sleep > 0) continue;   // stunned in the middle of it: no blow
      const reach = (m.def.reach || m.def.r + 12) + 26; if (Math.hypot(P.x - m.x, P.y - m.y) > reach){ m.atkT = Math.max(m.atkT, .3); continue; }   // you stepped away: it bites air
      const t0 = m.atkT; try { _ma(m); } catch (e) {} m.atkT = Math.max(t0, .2); }
  });
}

// ---- 2. a boss's death ----
const LIFE_BOSS_COL = {fire:['255,140,50', '255,210,90'], water:['110,180,255', '210,240,255'], wind:['130,210,120', '220,255,190'], earth:['150,115,75', '200,170,120'],
  holy:['255,230,150', '255,255,230'], shadow:['110,60,150', '60,30,80'], undead:['150,170,150', '90,100,90'], neutral:['200,190,170', '240,235,220']};
const LIFE_FX = [];
function lifeBossBurst(m){ const el = (m.def && m.def.elem) || 'neutral', [c1, c2] = LIFE_BOSS_COL[el] || LIFE_BOSS_COL.neutral, h = (MOB_H[m.type] || 40) * ((m.def && m.def.bsz) || 1.6) * .5;
  const q = typeof feelQ === 'function' ? feelQ() : 1, n = q >= 2 ? 46 : q === 1 ? 30 : 12;
  for (let i = 0; i < n; i++){ const a = Math.random() * 6.28, s = 20 + Math.random() * 70, col = Math.random() < .5 ? c1 : c2;
    const kind = el === 'fire' ? 'ember' : el === 'water' ? 'drop' : el === 'wind' ? 'leaf' : el === 'earth' ? 'stone' : el === 'holy' ? 'mote' : el === 'shadow' || el === 'undead' ? 'smoke' : 'dust';
    const up = kind === 'ember' || kind === 'mote' || kind === 'smoke';
    LIFE_FX.push({x:m.x + Math.cos(a) * h * .3, y:m.y + Math.sin(a) * h * .15, z:h * (.2 + Math.random() * .8), vx:Math.cos(a) * s, vy:Math.sin(a) * s * .5, vz:up ? 15 + Math.random() * 40 : 30 + Math.random() * 60,
      t:0, life:(up ? 1.1 : .8) + Math.random() * .5, r:(kind === 'smoke' || kind === 'dust' ? 5 + Math.random() * 6 : 1.4 + Math.random() * 2), col, kind, rot:Math.random() * 6, grav:up ? 0 : 200}); }
  LIFE_FX.push({x:m.x, y:m.y, z:h * .5, vx:0, vy:0, vz:0, t:0, life:.7, r:h * 1.2, col:c2, kind:'glow', grav:0}); }   // a short glow where it stood (local, not over the screen)
if (typeof advance === 'function'){ const _adv = advance; advance = function(dt){ if (LIFE.slow > 0 && !document.hidden){ LIFE.slow -= dt; arguments[0] = dt * .35; } return _adv.apply(this, arguments); }; }
EV.on('tick', dt => {
  for (const m of mobs){ if (!m.dead || !m.def || !m.def.boss || m.vanish || m.hp > 0) continue;   // only a boss brought down (a bound or captured one just leaves)
    if (m.bdT == null){ m.bdT = 0; if (SETTINGS.hitStop !== false && Math.hypot(m.x - P.x, m.y - P.y) < 520) LIFE.slow = 1.05; }
    m.bdT += dt; if (m.bdT < 3.2) m.deadT = Math.min(m.deadT, .78);   // it lies there a while before it fades
    if (!m.bdBurst && m.bdT > .5){ m.bdBurst = 1; try { lifeBossBurst(m); } catch (e) {} } }
  for (const p of LIFE_FX){ p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz -= p.grav * dt; if (p.z < 0 && p.grav){ p.z = 0; p.vz *= -.25; p.vx *= .6; p.vy *= .6; }
    if (p.kind === 'leaf'){ p.vx += Math.sin(p.t * 6 + p.rot) * 40 * dt; } if (p.kind === 'smoke' || p.kind === 'dust'){ p.vx *= .96; p.vy *= .96; } }
  for (let i = LIFE_FX.length - 1; i >= 0; i--) if (LIFE_FX[i].t >= LIFE_FX[i].life) LIFE_FX.splice(i, 1);
});
function lifeDrawFx(g){ if (!LIFE_FX.length) return; g.save();
  for (const p of LIFE_FX){ const k = p.t / p.life, a = Math.max(0, 1 - k), x = p.x - cam.x, y = p.y - cam.y - p.z;
    if (p.kind === 'glow'){ g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, p.r); gr.addColorStop(0, `rgba(${p.col},${a * .5})`); gr.addColorStop(1, `rgba(${p.col},0)`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, p.r, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; continue; }
    if (p.kind === 'smoke' || p.kind === 'dust'){ g.fillStyle = `rgba(${p.col},${a * (p.kind === 'smoke' ? .5 : .35)})`; g.beginPath(); g.arc(x, y, p.r * (1 + k * 1.5), 0, 7); g.fill(); continue; }
    if (p.kind === 'ember' || p.kind === 'mote'){ g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(${p.col},${a})`; g.beginPath(); g.arc(x, y, p.r * (1 - k * .5), 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; continue; }
    g.fillStyle = `rgba(${p.col},${Math.min(1, a * 1.5)})`; g.save(); g.translate(x, y); g.rotate(p.rot + p.t * 5);
    if (p.kind === 'leaf'){ g.beginPath(); g.ellipse(0, 0, p.r * 1.8, p.r * .8, 0, 0, 7); g.fill(); }
    else if (p.kind === 'drop'){ g.beginPath(); g.arc(0, 0, p.r, 0, 7); g.fill(); }
    else { g.beginPath(); g.moveTo(-p.r, -p.r * .6); g.lineTo(p.r * .6, -p.r); g.lineTo(p.r, p.r * .5); g.lineTo(-p.r * .3, p.r); g.closePath(); g.fill(); }
    g.restore(); }
  g.restore(); }
if (typeof LIVE !== 'undefined'){ const _o = LIVE.drawOver; LIVE.drawOver = function(g){ const r = _o.apply(this, arguments); try { if (S) lifeDrawFx(g); } catch (e) {} return r; }; }
// what a monster is seen doing (render.js asks mobAnim)
if (typeof mobAnim === 'function'){ const _mA = mobAnim; mobAnim = function(m){
    if (m.dead && m.def && m.def.boss && !m.vanish && m.bdT != null){ const sh = typeof SHEETS !== 'undefined' && SHEETS && SHEETS[m.type];
      if (m.bdT < .45 && sh && sh.index && sh.index.broar) return ['broar', m.bdT * 1.8];   // a last roar…
      return ['die', Math.max(0, m.bdT - (sh && sh.index && sh.index.broar ? .45 : 0))]; }   // …then down (the moment itself is slowed)
    return lifeIdle(m) || _mA.apply(this, arguments); }; }

// ---- 3. life at rest: a fidget now and then; asleep at night ----
/* who sleeps: a calm monster of the field, at night, with you not close; never a boss, a spirit, a fish or a stone body
   (they keep the night), and not every one — about two in three, so a night field still has some awake */
function lifeSleeps(m){ const mb = SPR.MOBS && SPR.MOBS[m.type], sp = (mb && mb.spec) || {}, el = m.def && m.def.elem;
  if (m.def.boss || m.elite || el === 'undead' || el === 'shadow' || sp.arch === 'floater' || sp.arch === 'fish' || sp.arch === 'rock' || sp.arch === 'sky' || sp.kind === 'armor' || sp.kind === 'automaton') return false;
  return ((m.id * 2654435761) >>> 0) % 3 !== 0; }
function lifeIdle(m){
  if (m.dead || m.aggro || m.moving || m.atkT < .45 || m.hurtT > 0 || m.windT > 0 || m.fz || (m.st && (m.st.stun > 0 || m.st.freeze > 0))) return null;
  const sh = typeof SHEETS !== 'undefined' && SHEETS && SHEETS[m.type]; if (!sh || !sh.index || !sh.index.fidget) return null;
  if (typeof isNight === 'function' && isNight() && !m.def.boss && Math.hypot(m.x - P.x, m.y - P.y) > 230 && lifeSleeps(m)){ m.sleepT = (m.sleepT || 0); return ['sleep', T + m.id * .7]; }
  if (m.def.boss) return null;
  if (m.fidN == null) m.fidN = T + 2 + Math.random() * 6;
  if (T >= m.fidN && !(m.fidS > T - 1.05)){ m.fidS = T; m.fidN = T + 5 + Math.random() * 8; }
  if (m.fidS != null && T - m.fidS < 1) return ['fidget', T - m.fidS];
  return null; }

// ---- 4. footsteps: the ground under your feet, heard and seen ----
/* what you are standing on: water first, then the painted ground's colour under your feet, nudged by the land's own
   kind (a snowfield, a desert, a cave). Sounds are short and quiet, made on the fly, under the music: grass brushes,
   sand hisses, snow crunches, stone and paving click, earth thuds, water splashes. A puff of dust, a spray of snow or a
   ring of water at the foot; on the deer, hooves. Large monsters kick up dust as they walk. */
const LIFE_STEP = {last:-1, gk:'grass', gT:-9, fx:[]};
const LIFE_SNOW = ['frozenlake', 'icecave', 'glacier', 'frostcitadel'], LIFE_SAND = ['desert', 'canyon', 'beach', 'dryplain', 'isle'], LIFE_STONE = ['cave', 'lavafield', 'crater', 'kailash', 'templeruins', 'khmer'];
function lifeGround(x, y){
  const bi = MAP_ID && MAPS[MAP_ID] && MAPS[MAP_ID].biome;
  if (bi === 'badan') return 'sand';   // the sea floor: you walk on sand under the water
  if (bi === 'tavatimsa' || bi === 'meru') return 'stone';   // heaven's courts are paved
  if (typeof waterAt === 'function' && waterAt(x, y)) return 'water';
  let r = 120, g = 160, b = 90;
  try { const c = terr.getContext('2d', {willReadFrequently:true}), d = c.getImageData(Math.max(0, Math.round(x * TS)), Math.max(0, Math.round(y * TS)), 1, 1).data; r = d[0]; g = d[1]; b = d[2]; } catch (e) {}
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx - mn, lum = (r + g + b) / 3;
  if (lum > 200 && sat < 40) return 'snow';
  if (LIFE_SNOW.includes(bi) && lum > 150) return 'snow';
  if (b > r + 12 && b > g && lum < 170) return 'water';
  if (sat < 22 && lum < 200) return 'stone';
  if (r > 165 && g > 135 && b < 140 && r - b > 45 && g > r * .72) return LIFE_SAND.includes(bi) || g < r * .95 ? 'sand' : 'grass';
  if (g > r && g > b) return 'grass';
  if (LIFE_STONE.includes(bi)) return 'stone';
  return r > g ? 'dirt' : 'grass'; }
function lifeStepSound(kind, ride){ const raw = SFX.raw && SFX.raw(); if (!raw || !(raw.vol && raw.vol.s > 0) || typeof f341Noise !== 'function') return;
  const {ac, out, nb} = raw, t = ac.currentTime, v = .055 * (.85 + Math.random() * .3);
  if (ride){ f341Tone(ac, out, t, 260, 180, .05, 'triangle', v * 1.4); f341Noise(ac, out, nb, t, .04, 'bandpass', 1500, 1100, 2, v); return; }   // a hoof
  switch (kind){
    case 'water': f341Noise(ac, out, nb, t, .14, 'bandpass', 1100, 420, 1.5, v * 1.6); f341Tone(ac, out, t + .02, 620, 300, .08, 'sine', v * .6); break;
    case 'snow': f341Noise(ac, out, nb, t, .05, 'bandpass', 1400, 900, 3, v * 1.3); f341Noise(ac, out, nb, t + .045, .05, 'bandpass', 1100, 800, 3, v * 1.1); break;
    case 'sand': f341Noise(ac, out, nb, t, .09, 'highpass', 3200, 2400, .7, v * 1.1); break;
    case 'stone': f341Tone(ac, out, t, 340, 220, .03, 'triangle', v * 1.2); f341Noise(ac, out, nb, t, .025, 'highpass', 3500, 3000, .7, v * .9); break;
    case 'dirt': f341Tone(ac, out, t, 130, 80, .06, 'sine', v * 1.3); f341Noise(ac, out, nb, t, .05, 'lowpass', 900, 400, .7, v * .8); break;
    default: f341Noise(ac, out, nb, t, .07, 'bandpass', 1900, 1300, 1.2, v * .9); }   // grass
}
const LIFE_STEP_COL = {water:'200,230,255', snow:'245,250,255', sand:'215,190,140', dirt:'150,120,85', stone:'170,165,155', grass:'120,160,80'};
function lifeStepPuff(x, y, kind, big){ const q = typeof feelQ === 'function' ? feelQ() : 1; if (q < 1) return;
  const col = LIFE_STEP_COL[kind] || LIFE_STEP_COL.grass, n = big ? 5 : kind === 'grass' || kind === 'stone' ? 1 : 3;
  if (kind === 'water'){ LIFE_STEP.fx.push({x, y, t:0, life:.5, kind:'ring', r:big ? 10 : 5, col}); for (let i = 0; i < 4; i++){ const a = Math.random() * 6.28; LIFE_STEP.fx.push({x, y, z:2, vx:Math.cos(a) * 25, vy:Math.sin(a) * 12, vz:35 + Math.random() * 30, t:0, life:.35, kind:'drop', r:1.2, col}); } return; }
  for (let i = 0; i < n; i++){ const a = Math.random() * 6.28; LIFE_STEP.fx.push({x:x + Math.cos(a) * 3, y:y + Math.sin(a) * 1.5, z:0, vx:Math.cos(a) * (big ? 22 : 12), vy:Math.sin(a) * 5, vz:big ? 10 : 6, t:0, life:big ? .7 : .45, kind:'puff', r:(big ? 5 : 2.6) * (.8 + Math.random() * .4), col}); } }
EV.on('tick', dt => {
  if (S && !P.dead && P.moving && !P.roll){ const act = P.act; if (act === 'walk' || act === 'ride'){
      const fps = act === 'ride' ? 11 : 12, per = act === 'ride' ? 3 : 4, idx = Math.floor((P.animT || 0) * fps / per);
      if (idx !== LIFE_STEP.last){ LIFE_STEP.last = idx;
        if (T - LIFE_STEP.gT > .3){ LIFE_STEP.gT = T; LIFE_STEP.gk = lifeGround(P.x, P.y); }
        try { lifeStepSound(LIFE_STEP.gk, act === 'ride'); } catch (e) {}
        lifeStepPuff(P.x + (idx % 2 ? 3 : -3), P.y, LIFE_STEP.gk, act === 'ride'); } } }
  else LIFE_STEP.last = -1;
  for (const m of mobs){ if (m.dead || !m.moving || !m.def) continue; const big = m.def.boss || m.def.size === 'l' || (m.def.bsz || 0) > 1.4; if (!big) continue;
    if ((m.stepT = (m.stepT || 0) - dt) <= 0){ m.stepT = m.def.boss ? .42 : .55; if (Math.abs(m.x - P.x) < 700 && Math.abs(m.y - P.y) < 450) lifeStepPuff(m.x, m.y, 'dirt', true); } }
  for (const p of LIFE_STEP.fx){ p.t += dt; if (p.vx != null){ p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; if (p.kind === 'drop') p.vz -= 220 * dt; else { p.vx *= .9; p.vy *= .9; p.vz *= .9; } } }
  LIFE_STEP.fx = LIFE_STEP.fx.filter(p => p.t < p.life); if (LIFE_STEP.fx.length > 90) LIFE_STEP.fx.splice(0, LIFE_STEP.fx.length - 90);
});
function lifeDrawSteps(g){ if (!LIFE_STEP.fx.length) return; g.save();
  for (const p of LIFE_STEP.fx){ const k = p.t / p.life, a = 1 - k, x = p.x - cam.x, y = p.y - cam.y - (p.z || 0);
    if (p.kind === 'ring'){ g.strokeStyle = `rgba(${p.col},${a * .7})`; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, p.r * (1 + k * 2), p.r * .45 * (1 + k * 2), 0, 0, 7); g.stroke(); }
    else if (p.kind === 'drop'){ g.fillStyle = `rgba(${p.col},${a})`; g.beginPath(); g.arc(x, y, p.r, 0, 7); g.fill(); }
    else { g.fillStyle = `rgba(${p.col},${a * .4})`; g.beginPath(); g.ellipse(x, y, p.r * (1 + k), p.r * .6 * (1 + k), 0, 0, 7); g.fill(); } }
  g.restore(); }
if (typeof LIVE !== 'undefined'){ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g){ const r = _u.apply(this, arguments); try { if (S) lifeDrawSteps(g); } catch (e) {} return r; }; }
