/* VAYRATHEN — js/sys/feel339.js — (v339) the feel of a blow, and the look of a spell
   The owner: «do them all, make them good, with effects that fit».
   1. Impact: a weapon hit that lands freezes the moment for a heartbeat (hit-stop: longer on a critical), the monster is
      knocked back a step (not bosses, pack leaders or anything rooted), and a small ring of light bursts where it was hit.
      No screen shake and no flash over the screen (the owner does not want them).
   2. Swing trails: while you attack or use a skill, the blade leaves a short ribbon of light along the path it really
      took (read from where the sprite drew the weapon each frame), in the colour of the weapon's grade.
   3. Spell circles: while a spell is being cast a sigil of your line turns on the ground under you — the mage's ring of
      four elements, the herbalist's lotus, the hexer's black yantra, the summoner's conch spiral, the ninja's star wheel;
      other lines a ring in their colour.
   4. Casters at rest: a little orb of light drifts around mages, herbalists, summoners and hexers when they stand or walk.
   Settings: the existing «สั่นจอ/หยุดภาพตอนโดน» (hitStop) switch also turns off the hit-stop here; «เอฟเฟคผู้เล่นอื่น» is
   not touched (this is your own hero). */
'use strict';
const FEEL = {trail:[], kb:new Map(), rings:[], lastAct:'', orbA:0};
const FEEL_LINE = () => { try { return jobChain()[1] || 'novice'; } catch (e) { return 'novice'; } };
// the grade colour of the weapon in hand (same steps as the sprite's look tiers)
const FEEL_TIER_COL = ['226,232,245', '170,215,255', '255,170,90', '190,140,255', '110,235,200', '255,215,110'];
function feelTierCol(){ const id = S && S.gear && S.gear.weapon, it = id && ITEMS[id], L = it && it.lv || 1; return FEEL_TIER_COL[L < 30 ? 0 : L < 80 ? 1 : L < 115 ? 2 : L < 170 ? 3 : L < 240 ? 4 : 5]; }

// ---- 1. impact ----
if (typeof applyDamage === 'function'){ const _ad = applyDamage; applyDamage = function(m, res, sk){
  const ok = m && !m.dead && res && !res.miss && !res.poison && res.dmg > 0 && !m.pvp, phys = ok && !res.magic;
  const r = _ad.apply(this, arguments);
  try { if (ok){
      if (phys && typeof skfxStop === 'function' && !sk) skfxStop(res.crit ? .075 : .04);   // skills already carry their own hit-stop (skillfx.js)
      if (phys && m.def && !m.def.boss && !m.elite && !m.wb && !(typeof mobRooted === 'function' && mobRooted(m))){ const d = Math.max(1, Math.hypot(m.x - P.x, m.y - P.y)), k = (res.crit ? 12 : 6) * (sk ? 1.3 : 1);
        FEEL.kb.set(m, {vx:(m.x - P.x) / d * k * 9, vy:(m.y - P.y) / d * k * 9, t:.12}); }
      FEEL.rings.push({x:m.x, y:m.y - (MOB_H[m.type] || 30) * .5, t:0, crit:!!res.crit, col:res.magic ? '255,190,120' : feelTierCol()}); if (FEEL.rings.length > 24) FEEL.rings.shift(); } } catch (e) {}
  return r; }; }
EV.on('tick', dt => {
  for (const [m, k] of FEEL.kb){ if (m.dead || (k.t -= dt) <= 0){ FEEL.kb.delete(m); continue; }
    const nx = m.x + k.vx * dt, ny = m.y + k.vy * dt; if (walkable(nx, ny, (m.def && m.def.r) || 10)){ m.x = nx; m.y = ny; } k.vx *= .82; k.vy *= .82; }
  for (const r of FEEL.rings) r.t += dt; FEEL.rings = FEEL.rings.filter(r => r.t < .32);
});

// ---- 2. swing trails ----
function feelHeroSeg(){ if (!SPR.WDRAWS || !SPR.WDRAWS.length) return null; const x = P.x - cam.x, y = P.y - cam.y - (P.ride ? 14 : 0); let best = null, bd = 30;
  for (const d of SPR.WDRAWS){ const k = Math.hypot(d.x - x, d.y - y); if (k < bd){ bd = k; best = d; } } if (!best || !best.segs || !best.segs.length) return null;
  const s0 = best.segs[0]; const da = Math.hypot(s0[0] - x, s0[1] - (y - 20)), db = Math.hypot(s0[2] - x, s0[3] - (y - 20));
  return da > db ? [s0[2], s0[3], s0[0], s0[1]] : s0; }   // [hilt x, y, tip x, y]
function feelTrail(g){
  const act = P.act || 'idle', swinging = (act === 'attack' || act === 'skill' || /^c_/.test(act)) && !P.dead && !P.ride, w = JOBS[S.job] && JOBS[S.job].weapon.type;
  if (swinging && w !== 'bow' && w !== 'shuriken' && w !== 'fist'){ const s = feelHeroSeg(); if (s) FEEL.trail.push({a:[s[0] + cam.x, s[1] + cam.y], b:[s[2] + cam.x, s[3] + cam.y], t:T}); }
  FEEL.trail = FEEL.trail.filter(p => T - p.t < .16); if (FEEL.trail.length < 2) return;
  const col = feelTierCol(); g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 1; i < FEEL.trail.length; i++){ const p0 = FEEL.trail[i - 1], p1 = FEEL.trail[i], a = Math.max(0, 1 - (T - p1.t) / .16) * .42;
    if (Math.hypot(p1.b[0] - p0.b[0], p1.b[1] - p0.b[1]) > 60) continue;   // a jump between frames (a new swing), not a sweep
    const q = (pt, k) => [pt[0] - cam.x + (k ? 0 : 0), pt[1] - cam.y];
    const A0 = q([p0.a[0] + (p0.b[0] - p0.a[0]) * .35, p0.a[1] + (p0.b[1] - p0.a[1]) * .35]), B0 = q(p0.b), A1 = q([p1.a[0] + (p1.b[0] - p1.a[0]) * .35, p1.a[1] + (p1.b[1] - p1.a[1]) * .35]), B1 = q(p1.b);
    const gr = g.createLinearGradient(A1[0], A1[1], B1[0], B1[1]); gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(1, `rgba(${col},${a})`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(A0[0], A0[1]); g.lineTo(B0[0], B0[1]); g.lineTo(B1[0], B1[1]); g.lineTo(A1[0], A1[1]); g.closePath(); g.fill();
    g.strokeStyle = `rgba(255,255,255,${a * .8})`; g.lineWidth = 1; g.beginPath(); g.moveTo(B0[0], B0[1]); g.lineTo(B1[0], B1[1]); g.stroke(); }
  g.restore(); }
// impact rings, drawn with the trails
function feelRings(g){ if (!FEEL.rings.length) return; g.save(); g.globalCompositeOperation = 'lighter';
  for (const r of FEEL.rings){ const k = r.t / .32, rad = (r.crit ? 16 : 10) * (.4 + k * 1.1), a = (1 - k) * (r.crit ? .8 : .55), x = r.x - cam.x, y = r.y - cam.y;
    g.strokeStyle = `rgba(${r.col},${a})`; g.lineWidth = r.crit ? 2.2 : 1.4; g.beginPath(); g.ellipse(x, y, rad, rad * .7, 0, 0, 7); g.stroke();
    if (k < .35){ g.fillStyle = `rgba(255,255,255,${(.35 - k) * 2 * a})`; g.beginPath(); g.arc(x, y, (r.crit ? 5 : 3.5) * (1 - k), 0, 7); g.fill(); }
    if (r.crit) for (let i = 0; i < 6; i++){ const an = i / 6 * 6.28 + r.x, d0 = rad * .6, d1 = rad * 1.25; g.beginPath(); g.moveTo(x + Math.cos(an) * d0, y + Math.sin(an) * d0 * .7); g.lineTo(x + Math.cos(an) * d1, y + Math.sin(an) * d1 * .7); g.stroke(); } }
  g.restore(); }

// ---- 3. spell circles of each line, on the ground ----
const FEEL_LCOL = {blade:'255,190,90', rune:'150,170,255', ranger:'130,220,120', muay:'255,130,90', healer:'120,240,200', rogue:'190,120,255', summoner:'255,220,120',
  occult:'190,80,220', merchant:'255,215,80', catfolk:'255,170,210', dogfolk:'215,190,150', ninja:'150,170,235', novice:'220,220,240'};
function feelSigil(g, x, y, line, k, t){   // k: how far the cast has run (0..1)
  const col = FEEL_LCOL[line] || '220,220,240', R = 35 + k * 3, a = .3 + k * .35, sp = t * (line === 'occult' ? -.6 : .8);
  g.save(); g.translate(x, y); g.scale(1, .5); g.globalCompositeOperation = 'lighter'; g.lineWidth = 1.4;
  g.strokeStyle = `rgba(${col},${a})`; g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, R * .78, 0, 7 * k + .1); g.stroke();
  if (line === 'rune'){ ['255,120,80', '120,190,255', '120,230,150', '255,220,110'].forEach((c, i) => { const an = sp + i * Math.PI / 2; g.fillStyle = `rgba(${c},${a + .2})`; g.beginPath(); g.arc(Math.cos(an) * R * .9, Math.sin(an) * R * .9, 3.4, 0, 7); g.fill(); }); }
  else if (line === 'healer'){ for (let i = 0; i < 8; i++){ const an = sp * .5 + i * Math.PI / 4; g.fillStyle = `rgba(255,170,210,${a * .6})`; g.beginPath(); g.ellipse(Math.cos(an) * R * .5, Math.sin(an) * R * .5, R * .32, R * .12, an, 0, 7); g.fill(); } }
  else if (line === 'occult'){ g.strokeStyle = `rgba(30,10,40,${a + .2})`; g.lineWidth = 2.2; for (let i = 0; i < 2; i++){ g.save(); g.rotate(sp + i * Math.PI / 4); g.strokeRect(-R * .55, -R * .55, R * 1.1, R * 1.1); g.restore(); }
    g.strokeStyle = `rgba(${col},${a})`; g.lineWidth = 1; for (let i = 0; i < 8; i++){ const an = -sp + i * Math.PI / 4; g.beginPath(); g.moveTo(Math.cos(an) * R * .82, Math.sin(an) * R * .82); g.lineTo(Math.cos(an) * R * .96, Math.sin(an) * R * .96); g.stroke(); } }
  else if (line === 'summoner'){ g.beginPath(); for (let i = 0; i <= 40; i++){ const u = i / 40, an = sp + u * 9, r = R * .9 * (1 - u * .85); i ? g.lineTo(Math.cos(an) * r, Math.sin(an) * r) : g.moveTo(Math.cos(an) * r, Math.sin(an) * r); } g.stroke(); }
  else if (line === 'ninja'){ for (let i = 0; i < 4; i++){ g.save(); g.rotate(sp * 2 + i * Math.PI / 2); g.fillStyle = `rgba(${col},${a * .7})`; g.beginPath(); g.moveTo(0, 0); g.lineTo(R * .7, -R * .12); g.lineTo(R * .85, 0); g.lineTo(R * .7, R * .12); g.closePath(); g.fill(); g.restore(); } }
  else { for (let i = 0; i < 6; i++){ const an = sp + i * Math.PI / 3; g.fillStyle = `rgba(${col},${a})`; g.beginPath(); g.arc(Math.cos(an) * R * .9, Math.sin(an) * R * .9, 1.8, 0, 7); g.fill(); } }
  g.restore(); }
if (typeof LIVE !== 'undefined'){ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g){ const r = _u.apply(this, arguments);
    try { if (S && !P.dead && P.cast && P.cast.total > 0) feelSigil(g, P.x - cam.x, P.y - cam.y, FEEL_LINE(), Math.min(1, P.cast.t / P.cast.total), T); } catch (e) {}
    return r; };
  const _o = LIVE.drawOver; LIVE.drawOver = function(g){ const r = _o.apply(this, arguments);
    try { if (S){ feelTrail(g); feelRings(g); feelOrb(g); } } catch (e) {}
    return r; }; }

// ---- 4. a drifting orb for casters at rest ----
function feelOrb(g){ const line = FEEL_LINE(); if (!['rune', 'healer', 'summoner', 'occult'].includes(line) || P.dead || P.ride || (P.act && P.act !== 'idle' && P.act !== 'walk')) return;
  if (typeof SHEATH !== 'undefined' && SHEATH.on) return;
  const col = FEEL_LCOL[line], an = T * 1.6, x = P.x - cam.x + Math.cos(an) * 14, y = P.y - cam.y - 30 + Math.sin(an * 2) * 3, front = Math.sin(an) > 0;
  const r = front ? 7 : 4.5, al = front ? 1 : .4;   // on the far half of its path it is smaller and faint, as if behind the hero
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = al; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,255,255,.9)`); gr.addColorStop(.35, `rgba(${col},.75)`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore(); }
