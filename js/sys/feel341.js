/* VAYRATHEN — js/sys/feel341.js — (v341) the rest of the feel of a fight
   The owner: «do them all, in detail».
   1. Cost: the effects of v339–v341 follow the graphics level (GFX.fx) and step down by themselves when the frame rate
      drops (PERF.fps under 28): on «low», or on a struggling phone, the drifting orb, the sparks and the stuck arrows
      are left out and the trails are drawn as a single line. (Measured: the v339 effects cost ~0.02 ms a frame.)
   3. Shooting and throwing: an arrow, a kunai or a thrown star leaves a thin ribbon of light in the colour of the weapon's
      grade, and where it lands it STAYS in the monster for a moment (an arrow and a kunai stuck in at the angle they flew,
      a star bitten into the hide), moving with it, then fades. Up to three at a time in one monster; gone when it dies.
   4. What you hit is heard: under the weapon's own sound a short layer tells the body — the ring of iron (hollow armour,
      brass automatons), a thud and grit of stone (golems, walking rock), the crack of a shell (crabs, beetles, turtles,
      clams, pangolins), the hollow knock of clay (haunted jars and lanterns), a cold breath through a spirit, the squelch
      of a jelly, the thump of flesh. A critical adds a deep boom beneath.
   5. A refined weapon's swing: from +7 its trail throws sparks off the tip, from +10 small arcs crackle along the edge,
      from +13 the edge runs through the colours (the same steps as the weapon's own glow, refinefx.js). */
'use strict';
const F341 = {stick:new Map(), sparks:[], last:0, ph:new WeakMap()};
const feelQ = () => Math.max(0, ((typeof GFX !== 'undefined' ? GFX.fx : 1) ?? 1) - (typeof PERF !== 'undefined' && PERF.fps > 0 && PERF.fps < 28 ? 1 : 0));

// ---- 1. the orb and the trail follow the graphics level ----
if (typeof feelOrb === 'function'){ const _fo = feelOrb; feelOrb = function(g){ if (feelQ() < 1) return; return _fo.apply(this, arguments); }; }

// ---- 5. refined swings ----
function f341Rf(){ return typeof myWeaponRf === 'function' ? myWeaponRf() : 0; }
if (typeof feelTrail === 'function'){ const _ft = feelTrail; feelTrail = function(g){ const r = _ft.apply(this, arguments);
    try { const rf = f341Rf(), tr = FEEL.trail, q = feelQ(); if (rf >= 7 && tr.length >= 2 && q > 0){
        const tier = typeof RF_TIER === 'function' ? RF_TIER(rf) : 2, col = (typeof RF_COL !== 'undefined' && RF_COL[tier]) || '255,190,60', p1 = tr[tr.length - 1], p0 = tr[tr.length - 2];
        if (T - p1.t < .03){ const vx = (p1.b[0] - p0.b[0]) * 6, vy = (p1.b[1] - p0.b[1]) * 6, n = (tier >= 3 ? 3 : 2) * q;
          for (let i = 0; i < n; i++) F341.sparks.push({x:p1.b[0], y:p1.b[1], vx:vx * (.3 + Math.random() * .5) + (Math.random() - .5) * 90, vy:vy * (.3 + Math.random() * .5) - 20 - Math.random() * 60, t:0, life:.25 + Math.random() * .25, col}); }
        g.save(); g.globalCompositeOperation = 'lighter';
        if (tier >= 3){   // +10: arcs crackling along the edge of the sweep
          const pts = tr.slice(-5); g.strokeStyle = `rgba(${col},.85)`; g.lineWidth = 1; g.beginPath();
          pts.forEach((p, i) => { const x = p.b[0] - cam.x + (i ? (Math.random() - .5) * 6 : 0), y = p.b[1] - cam.y + (i ? (Math.random() - .5) * 6 : 0); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); }
        if (tier >= 4){   // +13: the edge runs through the colours
          for (let i = 1; i < tr.length; i++){ const a = tr[i - 1], b = tr[i], al = Math.max(0, 1 - (T - b.t) / .16);
            g.strokeStyle = `hsla(${(T * 400 + i * 40) % 360},100%,70%,${al * .8})`; g.lineWidth = 2; g.beginPath(); g.moveTo(a.b[0] - cam.x, a.b[1] - cam.y); g.lineTo(b.b[0] - cam.x, b.b[1] - cam.y); g.stroke(); } }
        g.restore(); } } catch (e) {}
    return r; }; }

// ---- 3. shots and throws: a ribbon of light, and they stay where they land ----
const F341_SHOT = {arrow:1, kunai:1, shuriken:1};
if (typeof updFx === 'function'){ const _uf = updFx; updFx = function(dt){
    for (const p of projs){ if (!F341_SHOT[p.k] || p.delay > 0) continue;
      const h = F341.ph.get(p) || []; h.push([p.x, p.y]); if (h.length > 7) h.shift(); F341.ph.set(p, h);
      if (!p._f341 && typeof p.hit === 'function'){ p._f341 = 1; const _h = p.hit;
        p.hit = function(){ const r = _h.apply(this, arguments); try { f341Stick(p); } catch (e) {} return r; }; } }
    return _uf.apply(this, arguments); }; }
function f341Stick(p){ const m = p.t; if (!m || m.dead || !MOB_H[m.type] || feelQ() < 1) return;
  const list = F341.stick.get(m) || []; if (list.length >= 3) list.shift();
  const h = MOB_H[m.type], ang = p.ang || 0;
  // where it went in: a little short of the middle on the side it came from, spread so three do not overlap
  list.push({k:p.k, ang, dx:-Math.cos(ang) * h * .12 + (Math.random() - .5) * h * .22, dy:-h * (.22 + Math.random() * .26), t:0, spin:Math.random() * 6});
  F341.stick.set(m, list); }
function f341DrawStick(g){ const fade = 1.1;
  for (const [m, list] of F341.stick){ if (m.dead || !mobs.includes(m)){ F341.stick.delete(m); continue; }
    for (const s of list){ const a = Math.min(1, (fade - s.t) / .3); if (a <= 0) continue; const x = m.x - cam.x + s.dx, y = m.y - cam.y + s.dy;
      g.save(); g.globalAlpha = a; g.translate(x, y);
      if (s.k === 'arrow'){ g.rotate(s.ang); g.fillStyle = '#8a6a3a'; g.fillRect(-9, -.6, 8, 1.3);   // the shaft that sticks out, the head buried
        g.fillStyle = '#f06e5a'; g.fillRect(-10, -1.9, 3, 1.3); g.fillRect(-10, .6, 3, 1.3);
        g.fillStyle = 'rgba(60,30,20,.45)'; g.beginPath(); g.arc(-1.6, 0, 1.4, 0, 7); g.fill(); }   // a dark mark where it went in
      else if (s.k === 'kunai'){ g.rotate(s.ang); g.fillStyle = '#2a2a30'; g.fillRect(-7, -.9, 5, 1.8); g.strokeStyle = '#2a2a30'; g.lineWidth = 1; g.beginPath(); g.arc(-8.6, 0, 1.6, 0, 7); g.stroke();
        g.fillStyle = '#c8ccd4'; g.fillRect(-2, -1, 2, 2); }
      else { g.rotate(s.spin); g.fillStyle = '#b8bcc6'; g.beginPath(); for (let i = 0; i < 8; i++){ const an = i / 8 * Math.PI * 2, r = i % 2 ? 1.2 : 4; if (i === 2) continue; g.lineTo(Math.cos(an) * r, Math.sin(an) * r * .7); } g.closePath(); g.fill(); }   // a star half sunk in
      g.restore(); } } }
function f341DrawShots(g){ if (feelQ() < 1) return; const col = typeof feelTierCol === 'function' ? feelTierCol() : '226,232,245';
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (const p of projs){ const h = F341.ph.get(p); if (!h || h.length < 2 || p.delay > 0) continue;
    for (let i = 1; i < h.length; i++){ const a = i / h.length; g.strokeStyle = `rgba(${col},${a * .55})`; g.lineWidth = 1 + a * 1.6;
      g.beginPath(); g.moveTo(h[i - 1][0] - cam.x, h[i - 1][1] - cam.y); g.lineTo(h[i][0] - cam.x, h[i][1] - cam.y); g.stroke(); } }
  g.restore(); }
function f341DrawSparks(g){ if (!F341.sparks.length) return; g.save(); g.globalCompositeOperation = 'lighter';
  for (const s of F341.sparks){ const a = 1 - s.t / s.life, x = s.x - cam.x, y = s.y - cam.y; g.strokeStyle = `rgba(${s.col},${a})`; g.lineWidth = 1.3;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - s.vx * .02, y - s.vy * .02); g.stroke(); }
  g.restore(); }
EV.on('tick', dt => {
  for (const [, list] of F341.stick){ for (const s of list) s.t += dt; while (list.length && list[0].t > 1.1) list.shift(); }
  for (const s of F341.sparks){ s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 260 * dt; s.vx *= .96; } F341.sparks = F341.sparks.filter(s => s.t < s.life);
  if (F341.sparks.length > 80) F341.sparks.splice(0, F341.sparks.length - 80);
});
if (typeof LIVE !== 'undefined'){ const _o = LIVE.drawOver; LIVE.drawOver = function(g){ const r = _o.apply(this, arguments);
    try { if (S){ f341DrawShots(g); f341DrawStick(g); f341DrawSparks(g); } } catch (e) {}
    return r; }; }

// ---- 4. the body you hit, heard ----
function f341Mat(m){ const mb = SPR.MOBS && SPR.MOBS[m.type], sp = (mb && mb.spec) || {}, k = sp.kind || '', a = sp.arch, t = m.type || '';
  if (a === 'bug' || k === 'turtle' || k === 'clam' || k === 'pangolin' || k === 'dungbeetle' || k === 'mantis' || k === 'snail' || /crab|lobster|beetle|turtle|clam|scorp|shrimp/.test(t)) return 'shell';
  if (k === 'armor' || k === 'automaton' || /hollowarmor|automaton|brass/.test(t)) return 'metal';
  if ((sp.tree && !/golem|stalag|basalt|cinder/.test(t)) || /charredent|treant|woodsent/.test(t)) return 'wood';
  if (a === 'rock' || /golem|stalag|sentinel|^stone/.test(t)) return 'stone';
  if (a === 'slime' || t === 'dewblob' || k === 'squid' || k === 'octopus' || /jelly|slime/.test(t)) return 'jelly';
  if (k === 'jar' || k === 'lantern' || /urn|jar|lantern|lamp/.test(t)) return 'clay';
  if (a === 'floater' || k === 'lotus' || k === 'chakra' || /wraith|ghost|phantom|spirit|shade|krasue|preta|phi(?!uw)/.test(t)) return 'ghost';
  return 'flesh'; }
function f341Tone(ac, out, t, f0, f1, dur, type, gain){ const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur); o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .02); }
function f341Noise(ac, out, nb, t, dur, ftype, f0, f1, q, gain){ if (!nb) return; const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = nb; fl.type = ftype; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur); fl.Q.value = q;
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur); s.connect(fl); fl.connect(g); g.connect(out); s.start(t, Math.random() * .5, dur + .02); }
function f341Hit(m, crit){ const raw = SFX.raw && SFX.raw(); if (!raw || !(raw.vol && raw.vol.s > 0)) return;
  const now = performance.now(); if (now - F341.last < 55) return; F341.last = now;
  const {ac, out, nb} = raw, t = ac.currentTime + .075, v = .22;   // a hair after the weapon's own sound, under it
  switch (f341Mat(m)){
    case 'metal': for (const [f, gn] of [[1870, 1], [2890, .6], [4210, .35]]) f341Tone(ac, out, t, f * (.97 + Math.random() * .06), f * .98, .42, 'sine', v * .5 * gn); f341Noise(ac, out, nb, t, .04, 'highpass', 3000, 2500, .7, v * .8); break;
    case 'stone': f341Tone(ac, out, t, 110, 52, .16, 'sine', v * 1.4); f341Noise(ac, out, nb, t, .14, 'lowpass', 900, 250, .8, v * 1.1); f341Noise(ac, out, nb, t + .03, .1, 'bandpass', 2400, 1600, 2, v * .35); break;
    case 'shell': f341Noise(ac, out, nb, t, .035, 'bandpass', 2600, 2100, 3, v * 1.3); f341Noise(ac, out, nb, t + .03, .045, 'bandpass', 1700, 1300, 3, v * .9); f341Tone(ac, out, t, 220, 120, .07, 'triangle', v * .5); break;
    case 'wood': f341Tone(ac, out, t, 190, 120, .12, 'triangle', v * 1.1); f341Noise(ac, out, nb, t, .07, 'bandpass', 850, 600, 2.5, v * .9); f341Noise(ac, out, nb, t + .02, .05, 'highpass', 2500, 2000, .7, v * .3); break;
    case 'clay': f341Tone(ac, out, t, 420, 300, .14, 'triangle', v * .9); f341Tone(ac, out, t, 630, 520, .1, 'sine', v * .4); f341Noise(ac, out, nb, t, .05, 'bandpass', 1200, 900, 1.5, v * .6); break;
    case 'ghost': f341Noise(ac, out, nb, t, .32, 'bandpass', 1500, 380, 4, v * .9); f341Tone(ac, out, t, 740, 520, .3, 'sine', v * .25); break;
    case 'jelly': f341Tone(ac, out, t, 330, 120, .17, 'sine', v * .9); f341Noise(ac, out, nb, t, .12, 'lowpass', 700, 200, 6, v * .7); break;
    default: f341Tone(ac, out, t, 150, 70, .1, 'sine', v * 1.1); f341Noise(ac, out, nb, t, .06, 'lowpass', 1100, 400, .7, v * .7); }
  if (crit){ f341Tone(ac, out, t, 78, 38, .32, 'sine', v * 1.8); f341Noise(ac, out, nb, t, .1, 'lowpass', 2200, 300, .7, v * .9); } }
if (typeof applyDamage === 'function'){ const _ad = applyDamage; applyDamage = function(m, res, sk){
    const own = res && 'em' in res && !res.pet && !res._clone && !res._cd && !res.magic && !res.miss && !res.poison && res.dmg > 0 && m && !m.dead && !m.pvp && (sk || T - FEEL.swT < .9);
    const r = _ad.apply(this, arguments);
    try { if (own) f341Hit(m, !!res.crit); } catch (e) {}
    return r; }; }

/* ---- 2b. what is left when a body falls (with the seven-frame deaths drawn in gfx/beasts.js · sprites.js · dinos.js) ----
   a puff of dust where an animal or a shell hits the ground, rubble thrown from a golem, plates and a few sparks from
   iron, splinters from wood, shards from a clay jar, droplets from a jelly, and a spirit's last wisps rising away.
   Timed to the moment the body lands (the death frames: buckle, over, down). Any death — yours, a party's, an AI's. */
const F341D = {p:[]};
const F341_DCOL = {flesh:'150,125,95', shell:'140,130,115', stone:'125,118,108', metal:'170,175,185', wood:'95,70,45', clay:'175,120,80', jelly:'150,210,240', ghost:'200,220,255'};
function f341Death(m){ const mat = f341Mat(m), h = MOB_H[m.type] || 30, x = m.x, y = m.y, q = feelQ(); if (q < 1) return;
  const boss = !!(m.def && m.def.boss), sc = boss ? 1.8 : 1, n = Math.round((boss ? 14 : 8) * (q > 1 ? 1 : .7)), col = F341_DCOL[mat] || F341_DCOL.flesh;
  const add = o => F341D.p.push(Object.assign({x, y, z:0, vx:0, vy:0, vz:0, t:0, life:.6, delay:0, r:2, col, kind:'chunk', rot:Math.random() * 6}, o));
  if (mat === 'ghost'){ for (let i = 0; i < n; i++) add({kind:'wisp', z:h * (.3 + Math.random() * .5), vx:(Math.random() - .5) * 16, vz:22 + Math.random() * 26, life:.9 + Math.random() * .5, delay:Math.random() * .4, r:(3 + Math.random() * 4) * sc}); return; }
  if (mat === 'jelly'){ for (let i = 0; i < n; i++){ const a = Math.random() * 6.28, s = 30 + Math.random() * 50; add({kind:'drop', z:h * .3, vx:Math.cos(a) * s, vy:Math.sin(a) * s * .5, vz:40 + Math.random() * 60, life:.55, delay:.15, r:1.6 * sc}); } return; }
  const land = .42;   // the body is down about here
  for (let i = 0; i < Math.round(n * .8); i++){ const a = Math.random() * 6.28; add({kind:'dust', vx:Math.cos(a) * (14 + Math.random() * 18) * sc, vy:Math.sin(a) * (6 + Math.random() * 8) * sc, life:.7 + Math.random() * .3, delay:land, r:(4 + Math.random() * 4) * sc}); }
  if (mat === 'stone' || mat === 'metal' || mat === 'wood' || mat === 'clay'){
    for (let i = 0; i < n; i++){ const a = Math.random() * 6.28, s = 30 + Math.random() * 55;
      add({kind:mat === 'wood' ? 'splinter' : mat === 'clay' ? 'shard' : 'chunk', z:h * (.2 + Math.random() * .5), vx:Math.cos(a) * s, vy:Math.sin(a) * s * .5, vz:30 + Math.random() * 70, life:.65 + Math.random() * .3, delay:mat === 'clay' ? .3 : .12 + Math.random() * .2, r:(1.6 + Math.random() * 2) * sc}); }
    if (mat === 'metal') for (let i = 0; i < 6; i++){ const a = Math.random() * 6.28; add({kind:'spark', col:'255,210,120', z:h * .4, vx:Math.cos(a) * 70, vy:Math.sin(a) * 35, vz:40 + Math.random() * 60, life:.35, delay:.2}); } } }
EV.on('tick', dt => {
  for (const m of mobs) if (m.dead && !m._f341d){ m._f341d = 1; if (m.deadT < .3 && !m.vanish) try { f341Death(m); } catch (e) {} }
  for (const p of F341D.p){ if (p.delay > 0){ p.delay -= dt; continue; } p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    if (p.kind === 'wisp'){ p.vz *= .98; } else if (p.kind === 'dust'){ p.vx *= .9; p.vy *= .9; } else { p.vz -= 260 * dt; if (p.z < 0){ p.z = 0; p.vz *= -.3; p.vx *= .6; p.vy *= .6; } } }
  F341D.p = F341D.p.filter(p => p.delay > 0 || p.t < p.life); if (F341D.p.length > 160) F341D.p.splice(0, F341D.p.length - 160);
});
function f341DrawDeath(g){ if (!F341D.p.length) return; g.save();
  for (const p of F341D.p){ if (p.delay > 0) continue; const k = p.t / p.life, a = Math.max(0, 1 - k), x = p.x - cam.x, y = p.y - cam.y - p.z;
    if (p.kind === 'dust'){ g.fillStyle = `rgba(${p.col},${a * .35})`; g.beginPath(); g.ellipse(x, p.y - cam.y, p.r * (1 + k * 1.6), p.r * .55 * (1 + k * 1.2), 0, 0, 7); g.fill(); }
    else if (p.kind === 'wisp'){ g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(${p.col},${a * .45})`; g.beginPath(); g.arc(x, y, p.r * (1 - k * .5), 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; }
    else if (p.kind === 'drop'){ g.fillStyle = `rgba(${p.col},${a * .9})`; g.beginPath(); g.arc(x, y, p.r, 0, 7); g.fill(); }
    else if (p.kind === 'spark'){ g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(${p.col},${a})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x - p.vx * .03, y + p.vz * .03); g.stroke(); g.globalCompositeOperation = 'source-over'; }
    else { g.fillStyle = `rgba(${p.col},${Math.min(1, a * 1.6)})`; g.save(); g.translate(x, y); g.rotate(p.rot + p.t * 8);
      if (p.kind === 'splinter') g.fillRect(-p.r * 1.4, -p.r * .3, p.r * 2.8, p.r * .6);
      else if (p.kind === 'shard'){ g.beginPath(); g.moveTo(0, -p.r); g.lineTo(p.r, p.r * .7); g.lineTo(-p.r * .8, p.r * .5); g.closePath(); g.fill(); }
      else { g.beginPath(); g.moveTo(-p.r, -p.r * .5); g.lineTo(p.r * .4, -p.r); g.lineTo(p.r, p.r * .3); g.lineTo(-p.r * .2, p.r); g.closePath(); g.fill(); }
      g.restore(); } }
  g.restore(); }
if (typeof LIVE !== 'undefined'){ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g){ const r = _u.apply(this, arguments); try { if (S) f341DrawDeath(g); } catch (e) {} return r; }; }
