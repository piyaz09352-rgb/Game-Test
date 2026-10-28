/* VAYRATHEN — js/sys/bossact.js — (v161) bosses fight like heroes: a wind-up, a release, a combo
   Bosses had plenty of moves, but they showed them as a red mark on the ground, a small name and a 0.4 s nudge, so a
   boss never looked strong. Now every boss move is acted out the way the heroes' skills are:
   · WIND-UP (as long as its red mark, or about half a second): the boss takes a pose for the kind of move —
       heavy (slams, quakes, stomps): rises up and swells, rocks and dust lift around its feet
       dash (charges, pounces): crouches low and draws back, dust kicks up behind
       spin (blade storms, death spins): winds round, wind lines circle it
       spell (bolts, meteors, breaths, fields, curses …): floats a little, a magic seal turns under it and light gathers in
       roar (roars, war cries): swells up, the air ripples around it
       vanish (teleports, shadow steps, burrows): fades out
       power (heals, guards, summons): a seal under it and rising light
     and a cast bar with the move's name fills under its feet, like a hero's casting bar (a signature move gets a gold bar).
   · RELEASE: the strike frames play, and the move goes off with the heroes' skill effects in the boss's element colour:
     double shockwaves, cracks and flying rocks for a slam, a burst of light for a spell, rings racing out for a roar,
     a column of light for a power. A boss moving fast (a charge, a dash) leaves afterimages behind it.
   · BASIC ATTACKS are a three-blow combo: a slash one way, a slash back, then a heavy finisher (×1.25) with a
     shockwave. Weapon-users (giants, yaksha, kings) cut crescents of light; beasts rake with three claw marks.
   Nothing here blinks or flashes the screen: every glow grows or fades smoothly. */
'use strict';

const BA = {ctx:0, warn:[], slow:1};   // slow: a test switch that makes the swing marks last longer
const BA_KIND = {
  slam:'heavy', quake:'heavy', trample:'heavy', leap:'heavy', ring:'heavy', boulder:'heavy', g_quake:'heavy', stampede:'dash',
  charge:'dash', pounce:'dash', rend:'dash', dash:'dash',
  bladestorm:'spin', spin:'spin',
  roar:'roar', warcry:'roar', enrage:'roar',
  teleport:'blink', shadowstep:'blink', burrow:'blink', soar:'blink', split:'blink',
  heal:'power', healaura:'power', shell:'power', summon:'power'
};
const BA_SIG = {meteor:'spell', pillars:'spell', curse:'spell', web:'spell', vortex:'spell', wave:'spell', quake:'heavy', pounce:'blink'};
const baKind = id => BA_KIND[id] || 'spell';
const baCol = m => (typeof SKFX_EL !== 'undefined' && (SKFX_EL[m.def.elem] || SKFX_EL.neutral)) || ['#fff8e0', '#ffc24a', '#c9761a'];
const baBz = m => m.def.bsz || (typeof BOSS_SZ !== 'undefined' ? BOSS_SZ : 1.6);
const baH = m => (typeof MOB_H !== 'undefined' && MOB_H[m.type]) || 40;
function baName(id){
  const t = (typeof BOSS_SKILL_TH !== 'undefined' && BOSS_SKILL_TH[id]) || (typeof FURY_SK !== 'undefined' && FURY_SK[id]) || (typeof BP !== 'undefined' && BP.name && BP.name[id]);
  return t ? L(t[0], t[1]) : '';
}
const baEase = p => 1 - Math.pow(1 - Math.max(0, Math.min(1, p)), 3);

/* ---------- start of a move ---------- */
function baStart(m, id, kind, wind, name, sig){
  if (!m || m.dead || typeof skfxAdd !== 'function') return;
  wind = Math.max(.45, Math.min(2.2, wind || .55));
  const col = baCol(m), bz = baBz(m), x = m.x, y = m.y;
  m.ba = {id, kind, t0:T, wind, name, sig:!!sig, col, rel:false, x, y, em:0};
  if (kind === 'spell' || kind === 'power' || sig) skfxGlyph(x, y, 30 * bz * (sig ? 1.35 : 1), col[1], wind + .35, kind === 'power' ? -1 : 1);
  if (kind === 'heavy') skfxAdd({x, y, r:34 * bz, col:col[1], life:wind, layer:'under', add:true, draw(g, k){ const a = .35 * baEase(k / .8);
    const gr = g.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r); gr.addColorStop(0, this.col); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = a; g.fillStyle = gr; g.beginPath(); g.ellipse(this.x, this.y, this.r, this.r * .5, 0, 0, Math.PI * 2); g.fill(); }});
  if (kind === 'roar') for (let i = 0; i < 3; i++) skfxRing(x, y, 46 * bz, col[0], .5, 2, i * wind / 3);
}

/* while it winds up: particles every frame; at the end the release */
function baStep(m, dt){
  const b = m.ba; if (!b) return;
  if (m.dead){ m.ba = null; return; }
  const t = T - b.t0, bz = baBz(m), h = baH(m), x = m.x, y = m.y, col = b.col;
  if (!b.rel && t < b.wind){
    b.em += dt * 26 * ([.35, .7, 1][GFX.fx] ?? 1);
    while (b.em >= 1){ b.em -= 1;
      if (b.kind === 'spell' || b.kind === 'power' || b.sig){ const a = skfxR(0, Math.PI * 2), r = skfxR(38, 62) * bz;   // light gathers into the body
        skfxPart({x:x + Math.cos(a) * r, y:y + Math.sin(a) * r * .5, z:skfxR(6, h * .9), vx:-Math.cos(a) * r * 2, vy:-Math.sin(a) * r, vz:skfxR(10, 40), life:.5, size:2, col:col[1]}); }
      else if (b.kind === 'heavy'){ const a = skfxR(0, Math.PI * 2), r = skfxR(14, 40) * bz;   // pebbles and dust lift around the feet
        skfxPart({x:x + Math.cos(a) * r, y:y + Math.sin(a) * r * .5, z:1, vz:skfxR(30, 90), g:-60, life:skfxR(.4, .8), size:skfxR(1.4, 2.6), col:col[2], add:false, shape:'rock'}); }
      else if (b.kind === 'dash'){ const dx = Math.cos(b.ang ?? 0), dy = Math.sin(b.ang ?? 0);
        skfxPart({x:x - dx * 12 * bz + skfxR(-8, 8), y:y - dy * 6 * bz, z:2, vx:-dx * skfxR(30, 70), vy:-dy * 20, vz:skfxR(5, 25), size:6, grow:10, life:skfxR(.4, .7), col:'rgba(170,150,125,1)', add:false, shape:'smoke', drag:2}); }
      else if (b.kind === 'spin'){ const a = T * 9 + skfxR(0, Math.PI * 2), r = 34 * bz;
        skfxPart({x:x + Math.cos(a) * r, y:y + Math.sin(a) * r * .5, z:skfxR(8, h * .6), vx:-Math.sin(a) * 160, vy:Math.cos(a) * 80, life:.25, size:1.4, col:col[0], shape:'line'}); }
    }
    if (b.kind === 'dash' && b.ang == null) b.ang = Math.atan2(P.y - y, P.x - x);
    return;
  }
  if (!b.rel){ b.rel = true; b.tr = T; m.atkT = .2; baRelease(m, b, bz, h); }
  if (T - b.tr > .5) m.ba = null;
}
function baRelease(m, b, bz, h){
  const x = m.x, y = m.y, col = b.col;
  skfxGlow(x, y - h * .55, 26 * bz, col[1], .3, .7);
  switch (b.kind){
    case 'heavy':
      skfxRing(x, y, 74 * bz, col[1], .45, 7); skfxRing(x, y, 50 * bz, col[0], .4, 5, .08); skfxCracks(x, y, 58 * bz, 2.4);
      skfxBurst(x, y, 4, 24, {s0:70, s1:260, vz0:80, vz1:240, l0:.45, l1:.9, p:{g:-600, size:3, col:col[2], add:false, shape:'rock'}});
      skfxDust(x, y, 14); VFX.shake(4.5); break;
    case 'dash': skfxDust(x, y, 12); skfxRing(x, y, 40 * bz, col[0], .3, 4); VFX.shake(2.5); break;
    case 'spin':
      for (let i = 0; i < 3; i++) skfxRing(x, y, (40 + i * 16) * bz, col[i % 2], .4, 4, i * .07);
      skfxAdd({x, y, r:44 * bz, h, col:col[0], life:.5, add:true, draw(g, k){ g.lineCap = 'round';
        for (let i = 0; i < 3; i++){ const a0 = k * 9 + i * 2.09; g.globalAlpha = .8 * (1 - k); g.strokeStyle = this.col; g.lineWidth = 5 * (1 - k) + 1;
          g.beginPath(); g.ellipse(this.x, this.y - this.h * .4, this.r, this.r * .45, 0, a0, a0 + 1.4); g.stroke(); } }});
      VFX.shake(3); break;
    case 'roar':
      for (let i = 0; i < 3; i++) skfxRing(x, y, (90 + i * 40) * bz, col[i ? 0 : 1], .55, 6 - i, i * .1);
      skfxDust(x, y, 12); VFX.shake(4); break;
    case 'blink': skfxRing(x, y, 36 * bz, col[1], .35, 4); skfxBurst(x, y, h * .5, 16, {s0:40, s1:150, p:{col:col[1], size:2}}); break;
    case 'power': skfxPillar(x, y, col[1], .8, 26 * bz, 150 * bz); for (let i = 0; i < 3; i++) skfxRing(x, y, (38 + i * 12) * bz, col[i % 2], .5, 3, i * .1); skfxMotes(x, y, col[1], 14, 90); break;
    default:   // a spell: a burst of light from the body, sparks thrown up
      skfxRing(x, y, 52 * bz, col[0], .4, 5); skfxRing(x, y, 34 * bz, col[1], .35, 3, .06);
      skfxBurst(x, y, h * .55, 18, {s0:60, s1:200, vz0:40, vz1:180, p:{g:-300, size:2, col:col[1], drag:1.5}});
      VFX.shake(b.sig ? 4 : 2.5);
  }
  if (b.sig){ skfxRing(x, y, 130 * bz, col[1], .6, 6, .05); skfxRing(x, y, 170 * bz, col[0], .7, 4, .12); }
  try { baHeroFx(m, b, bz); } catch (e) {}
}

/* ---------- hooks: where moves begin ---------- */
{ const _pl = VFX.play;
  VFX.play = function(key, o){ if (BA.ctx && (key === 'warnCircle' || key === 'warnLine') && o && isFinite(o.t)) BA.warn.push(o.t); return _pl.apply(this, arguments); }; }
const baWrap = (fn, pick) => function(m){
  if (!m || !m.def || !m.def.boss) return fn.apply(this, arguments);
  const was = BA.warn; BA.warn = []; BA.ctx++;
  let r; try { r = fn.apply(this, arguments); } finally { BA.ctx--; }
  try { const w = BA.warn.length ? Math.min(...BA.warn) : 0; const p = pick(m, arguments, w, r); if (p) baStart(m, p.id, p.kind, p.wind, p.name, p.sig); } catch (e) { console.warn('bossact', e); }
  BA.warn = was; return r;
};
if (typeof bossCast === 'function') bossCast = baWrap(bossCast, (m, a, w, r) => {
  const id = a[1]; if (r === 0 || (id === 'heal' && !r)) return null;   // a heal at high HP does nothing
  return {id, kind:baKind(id), wind:w || (id === 'charge' ? .75 : .55), name:baName(id)}; });
if (typeof furyStart === 'function') furyStart = baWrap(furyStart, (m, a, w) => {
  const id = a[2], F = a[1], act = F && F.act;
  const wind = w || (act && (act.wind || (id === 'leap' ? act.dur * .7 : id === 'dash' || id === 'spin' ? .5 : act.w))) || .55;
  return {id, kind:baKind(id), wind, name:baName(id)}; });
if (typeof sigStart === 'function') sigStart = baWrap(sigStart, m => {
  const s = m.sig; if (!s) return null;
  return {id:'sig', kind:BA_SIG[s.kind] || 'spell', wind:Math.min(1.6, s.dur * .75), name:L(s.s.th, s.s.en), sig:true}; });

/* ---------- basic attacks: a three-blow combo ---------- */
const BA_WEAPON = new Set(['human', 'giant', 'yaksha', 'humanoid', 'demon']);
function baSwing(m, n){
  const col = baCol(m), bz = baBz(m), h = baH(m), a = Math.atan2(P.y - m.y, P.x - m.x), heavy = n === 3;
  const arch = typeof furyArch === 'function' ? furyArch(m) : 'beast', blade = BA_WEAPON.has(arch);
  const reach = Math.min(Math.hypot(P.x - m.x, P.y - m.y), 60 * bz), cx = m.x + Math.cos(a) * reach * .55, cy = m.y + Math.sin(a) * reach * .55;
  if (blade){   // a crescent of light swept across the target, back and forth, the finisher wider
    const R = (heavy ? 46 : 34) * Math.sqrt(bz), fl = n === 2 ? -1 : 1;
    skfxAdd({x:P.x - Math.cos(a) * R * .35, y:P.y - 24 - Math.sin(a) * R * .2, R, a, fl, col, life:(heavy ? .38 : .3) * BA.slow, add:true, draw(g, k){ const e = baEase(k / .6), s0 = this.a - this.fl * 1.5, s1 = s0 + this.fl * 3 * e;
      g.save(); g.translate(this.x, this.y); g.scale(1, .62); g.lineCap = 'round';
      const lo = Math.min(s0, s1), hi = Math.max(s0, s1), tail = this.fl > 0 ? Math.max(lo, hi - 1.3) : lo, head = this.fl > 0 ? hi : Math.min(hi, lo + 1.3);
      g.globalAlpha = .5 * (1 - k); g.strokeStyle = this.col[1]; g.lineWidth = (heavy ? 12 : 8) * (1 - k) + 1; g.beginPath(); g.arc(0, 0, this.R, tail, head); g.stroke();
      g.globalAlpha = .95 * (1 - k); g.strokeStyle = this.col[0]; g.lineWidth = (heavy ? 3.5 : 2.4) * (1 - k) + .6; g.beginPath(); g.arc(0, 0, this.R, tail, head); g.stroke();
      g.restore(); }});
  } else {   // three claw rakes across the target
    const len = (heavy ? 44 : 32) * Math.sqrt(bz), tilt = (n === 2 ? -1 : 1) * .9;
    skfxAdd({x:P.x, y:P.y - 22, len, tilt, col, life:(heavy ? .4 : .32) * BA.slow, add:true, draw(g, k){ const e = baEase(k / .45);
      g.save(); g.translate(this.x, this.y); g.rotate(this.tilt); g.lineCap = 'round';
      for (let i = -1; i <= 1; i++){ const ox = i * 7, L0 = -this.len / 2, L1 = L0 + this.len * e;
        g.globalAlpha = .45 * (1 - k); g.strokeStyle = this.col[1]; g.lineWidth = 6 * (1 - k) + 1; g.beginPath(); g.moveTo(ox, L0); g.lineTo(ox + 2, L1); g.stroke();
        g.globalAlpha = .95 * (1 - k); g.strokeStyle = this.col[0]; g.lineWidth = 1.8 * (1 - k) + .5; g.beginPath(); g.moveTo(ox, L0); g.lineTo(ox + 2, L1); g.stroke(); }
      g.restore(); }});
  }
  if (heavy){ skfxRing(P.x, P.y, 44, col[0], .35, 5); skfxGlow(P.x, P.y - 20, 26, col[1], .22, .6); skfxSparks(P.x, P.y, 20, col[0], 10, a); skfxDust(m.x, m.y, 6); VFX.shake(3); }
  else skfxSparks(P.x, P.y, 20, col[0], 5, a);
}
{ const _ma = mobAttack;
  mobAttack = function(m, mult, noDodge){
    if (!m || !m.def || !m.def.boss || BA.ctx || arguments.length > 1 || m.charge || m.ba) return _ma.apply(this, arguments);
    const n = m.bcmb = ((m.bcmb || 0) % 3) + 1;
    try { baSwing(m, n); } catch (e) {}
    return n === 3 ? _ma.call(this, m, 1.25) : _ma.call(this, m);
  }; }

/* ---------- each frame ---------- */
EV.on('tick', () => { if (typeof mobs === 'undefined') return; const dt = Math.min(.05, T - (BA.lt ?? T)); BA.lt = T; for (const m of mobs) if (m.ba) baStep(m, dt); });

/* the pose: lift, squash and stretch around the feet; the wind-back frame is held while it winds up; afterimages when it moves fast */
{ const _dm = drawMobW;
  drawMobW = function(g, m){
    if (!m || !m.def || !m.def.boss || m.dead) return _dm.apply(this, arguments);
    const b = m.ba, bz = baBz(m), x = m.x - cam.x, y = m.y - cam.y;
    // afterimages
    const tr = m._batr || (m._batr = {px:m.x, py:m.y, t:T, g:[]}), dt = T - tr.t;
    if (dt > 0){ const v = Math.hypot(m.x - tr.px, m.y - tr.py) / dt; if (v > 260 && (!tr.g.length || T - tr.g[tr.g.length - 1].t > .045)) tr.g.push({x:m.x, y:m.y, t:T}); tr.px = m.x; tr.py = m.y; tr.t = T; }
    tr.g = tr.g.filter(q => T - q.t < .28).slice(-4);
    if (tr.g.length){ const ox = m.x, oy = m.y, oz = m.fz ? m.fz.z : 0;
      for (const q of tr.g){ g.save(); g.globalAlpha = .32 * (1 - (T - q.t) / .28); m.x = q.x; m.y = q.y; try { _dm.call(this, g, m); } catch (e) {} g.restore(); }
      m.x = ox; m.y = oy; if (m.fz) m.fz.z = oz; }
    if (!b) return _dm.apply(this, arguments);
    const t = T - b.t0, p = baEase(t / b.wind), r = b.rel ? Math.min(1, (T - b.tr) / .3) : 0;
    let lift = 0, sx = 1, sy = 1, al = 1;
    if (!b.rel){
      switch (b.kind){
        case 'heavy': lift = 10 * bz * p; sy = 1 + .06 * p; sx = 1 - .03 * p; break;
        case 'dash': sy = 1 - .1 * p; sx = 1 + .08 * p; break;
        case 'spin': sx = 1 + .05 * p * Math.sin(T * 12); break;
        case 'roar': sx = sy = 1 + .08 * p; break;
        case 'blink': al = 1 - .75 * p; break;
        case 'power': lift = 3 * bz * p; sy = 1 + .03 * p; break;
        default: lift = 5 * bz * p; sy = 1 + .03 * p;
      }
    } else {
      const q = 1 - r;
      switch (b.kind){
        case 'heavy': sy = 1 - .14 * q; sx = 1 + .12 * q; break;
        case 'dash': sy = 1 + .06 * q; sx = 1 - .05 * q; break;
        case 'roar': sx = sy = 1 + .1 * q; break;
        case 'blink': al = .25 + .75 * r; break;
        default: sy = 1 - .05 * q; sx = 1 + .04 * q;
      }
    }
    const atk = m.atkT, fz = m.fz, z0 = fz ? fz.z || 0 : 0;
    if (!b.rel) m.atkT = .15;   // hold the wind-back frame of the attack
    if (fz) fz.z = z0 + lift;
    g.save(); if (al < 1) g.globalAlpha = al;
    g.translate(x, y - (fz ? 0 : lift)); g.scale(sx, sy); g.translate(-x, -y);
    try { return _dm.apply(this, arguments); }
    finally { g.restore(); m.atkT = atk; if (fz) fz.z = z0; baBar(g, m, b, x, y); }
  }; }

/* the cast bar under the boss: the move's name over a bar that fills until it goes off */
function baBar(g, m, b, x, y){
  if (b.rel || !b.name) return;
  const k = Math.min(1, (T - b.t0) / b.wind), w = b.sig ? 120 : 96, h = 7, X = Math.round(x - w / 2), Y = Math.round(y + 16);
  g.save();
  g.globalAlpha = Math.min(1, (T - b.t0) * 8);
  g.fillStyle = 'rgba(16,10,6,.82)'; g.beginPath(); g.roundRect ? g.roundRect(X - 2, Y - 2, w + 4, h + 4, 5) : g.rect(X - 2, Y - 2, w + 4, h + 4); g.fill();
  const gr = g.createLinearGradient(X, 0, X + w, 0); gr.addColorStop(0, b.sig ? '#ffd86b' : b.col[2]); gr.addColorStop(1, b.sig ? '#fff4c2' : b.col[1]);
  g.fillStyle = gr; g.beginPath(); g.roundRect ? g.roundRect(X, Y, Math.max(2, w * k), h, 3) : g.rect(X, Y, w * k, h); g.fill();
  g.font = `700 ${b.sig ? 14 : 12}px Mali, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'bottom';
  g.lineWidth = 3; g.strokeStyle = 'rgba(16,10,6,.9)'; g.strokeText(b.name, x, Y - 3); g.fillStyle = b.sig ? '#ffe9a0' : '#fff2e0'; g.fillText(b.name, x, Y - 3);
  g.restore();
}

/* ---------- (v166) a boss move that matches a hero skill goes off with that skill's own effect ----------
   A slam cracks the ground like Earthsplit, a quake is the hero's Quake, a charge leaves the hero's charge trail, a
   wave or breath is the hero's line skill of its element (Fire Line, Water Line, Wind Blade, Reaper Line), meteors fall
   like the Meteor spell (Fire Rain for a fire boss), a vanish is Shadow Step, a summon is the conjurer's circle, a pounce
   is Star Pounce, a curse ground is Hex Field, a miasma is the poison cloud. The boss's own marks and damage are unchanged. */
const BA_LINE = {fire:'fireLine', water:'waterLine', wind:'windBlade', shadow:'reaperLine', earth:'earthsplit'};
function baHeroFx(m, b, bz){
  const x = m.x, y = m.y, e = m.def.elem || 'neutral', a = Math.atan2(P.y - y, P.x - x), ux = Math.cos(a), uy = Math.sin(a);
  const id = b.sig && m.sig ? 'sig_' + m.sig.kind : b.id, line = len => { const k = BA_LINE[e]; if (k) VFX.play(k, {x, y, ux, uy, len, tx:P.x, ty:P.y}); };
  switch (id){
    case 'slam': case 'leap':
      for (let i = 0; i < 4; i++){ const q = a + i * Math.PI / 2 + .4; VFX.play('earthsplit', {x, y, ux:Math.cos(q), uy:Math.sin(q), len:70 * bz}); } break;
    case 'quake': case 'ring': case 'sig_quake': VFX.play('quake', {x, y, r:90 * bz}); break;
    case 'charge': case 'dash': case 'stampede': VFX.play('charge', {x, y, x2:x + ux * 220, y2:y + uy * 220}); break;
    case 'wave': case 'breath': case 'sig_wave': line(300); if (!BA_LINE[e]) VFX.play('waveslash', {x, y, tx:P.x, ty:P.y}); break;
    case 'teleport': case 'shadowstep': VFX.play('shadowBlink', {x:b.x, y:b.y, x2:x, y2:y}); break;
    case 'summon': VFX.play('conjure', {x, y}); break;
    case 'pounce': case 'sig_pounce': VFX.play('starPounce', {x:P.x, y:P.y, r:90}); break;
    case 'field': case 'sig_curse': if (e === 'shadow' || id === 'sig_curse') VFX.play('hexField', {x:P.x, y:P.y, r:70, dur:3}); break;
    case 'miasma': VFX.play('smokeCloud', {x, y, r:90 * bz}); break;
    case 'pull': case 'sig_vortex': VFX.play('darkStar', {x, y, r:70 * bz}); break;
    case 'sig_pillars': VFX.play('holycircle', {x:P.x, y:P.y, r:80, dur:1.2}); break;
  }
}
/* meteors are aimed when the move begins: the hero's Meteor (or Fire Rain) falls on the marked ground with them */
{ const _bs = baStart;
  baStart = function(m, id, kind, wind, name, sig){ const r = _bs.apply(this, arguments);
    try { if (id === 'meteor' || (sig && m.sig && m.sig.kind === 'meteor')){ const x = P.x, y = P.y, e = m.def.elem;
      if (e === 'fire') VFX.play('firerain', {x, y, r:100, dur:Math.max(1, wind + .4)}); else later(Math.max(0, (wind || 1) - .55), () => { if (!m.dead) VFX.play('meteor', {x, y, r:90, hits:5, every:.18}); }); } } catch (e) {}
    return r; }; }

/* ---------- (v166) a boss's weapon carries a faint glow of its power ----------
   Laid along the blade the sprite drew this frame (SPR.WDRAWS), in the boss's element colour: a soft bloom that
   breathes slowly (never blinks), a thin bright edge, and a few embers drifting off it. While a move winds up the glow
   gathers to about twice as strong, then settles back after the release. */
function baWeaponGlow(g, d, m){
  const col = baCol(m), b = m.ba, wind = b && !b.rel ? baEase((T - b.t0) / b.wind) : b && b.rel ? Math.max(0, 1 - (T - b.tr) / .5) : 0;
  const k = (.9 + Math.sin(T * 1.3 + (m.id || 0)) * .1) * (1 + wind * .9), seed = (m.id || 0) * .37;
  g.save(); g.setTransform(d.mt); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (const [x0, y0, x1, y1] of d.segs){
    let ax = x0, ay = y0, bx = x1, by = y1; if (Math.hypot(bx - ax, by - ay) < 3){ const mx = (ax + bx) / 2, my = (ay + by) / 2; ax = mx; ay = my - 1.5; bx = mx; by = my + 1.5; }
    for (const [w, al, c] of [[6.5, .09, col[2]], [4, .15, col[1]], [2.2, .24, col[1]], [.8, .36, col[0]]]){
      g.globalAlpha = Math.min(1, al * k); g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); }
    const n = 3 + Math.round(wind * 3);
    for (let i = 0; i < n; i++){ const ph = (T * .45 + i / n + seed) % 1, f = (i * .618 + seed) % 1, px = ax + (bx - ax) * f, py = ay + (by - ay) * f;
      g.globalAlpha = Math.sin(ph * Math.PI) * .45 * Math.min(1.5, k); g.fillStyle = col[0];
      g.beginPath(); g.arc(px + Math.sin(ph * 5 + i) * 1.2, py - ph * 7, .8 + (1 - ph) * .5, 0, 7); g.fill(); }
  }
  g.restore();
}
{ const _dm = drawMobW;
  drawMobW = function(g, m){
    const hum = m && m.def && m.def.boss && !m.dead && SPR.MOBS[m.type] && SPR.MOBS[m.type].human;
    const n0 = hum ? SPR.WDRAWS.length : 0, r = _dm.apply(this, arguments);
    if (hum && SPR.WDRAWS.length > n0){ const d = SPR.WDRAWS[SPR.WDRAWS.length - 1]; if (d.g === g && d.mt) try { baWeaponGlow(g, d, m); } catch (e) {} }
    return r; }; }
