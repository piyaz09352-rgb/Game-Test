/* VAYRATHEN — js/sys/skillfx.js — (v77) one impact standard for every skill, on top of each skill's own effect
   Built from how action games make hits feel heavy (hit-stop, shake, flash, shockwaves, layered sparks):
   · release: a burst of light and a ring at the caster in the skill's element colour
   · impact (first hit of a cast): the target lights up white, a shockwave ring, sparks along the hit, a short
     hit-stop (the game freezes for 50–160 ms, particles keep moving) and a shake that grows with the tier
   · each kind of skill adds its own layer: dash = afterimages + speed streaks + dust · slam = double shockwave,
     cracks and rocks · sky AoE = a target ring that fills, then a blast and a scorch mark · line = a beam ·
     shot = a muzzle flash · buff = rising rings and a turning glyph · heal = a light column and rising pluses ·
     summon = a light pillar · trap/trick = a snap ring
   · tier-4 big skills: the ground dims, speed lines rush in and the skill's name sweeps across the screen
   · casting: a glyph grows under the caster and light gathers in
   Multi-hit skills only spark on later hits. Shake follows the Settings switch. Fewer particles on low graphics. */
'use strict';

const SKFX = {fx:[], parts:[], stop:0, flash:null, dim:0, dimT:0, cut:null, lines:null, cur:null, ultT:-9, last:0};
const SKFX_EL = {fire:['#fff4c2', '#ff8a1f', '#c7261a'], water:['#e6fbff', '#3fb8f0', '#1a4fa8'], wind:['#f2fff7', '#8ef0c0', '#2fa37a'],
  earth:['#f3d9a4', '#b0793e', '#5a3b1e'], holy:['#fffff0', '#ffd86b', '#e8a93a'], shadow:['#e2d0ff', '#9a5cf0', '#3a1a6e'], poison:['#e9ffb0', '#8bd12f', '#4e6b12'],
  neutral:['#fff8e0', '#ffc24a', '#c9761a'], heal:['#f4fff0', '#7cf0a0', '#2fa35a'], bolt:['#ffffff', '#fff36b', '#7a5cff']};
const SKFX_CAT = {melee:'strike', stone:'shot', bolt:'shot', ranged:'shot', aoeTarget:'sky', fieldDot:'sky', aoeSelf:'slam', line:'beam', dash:'dash',
  blink:'blink', backstep:'blink', buff:'buff', restore:'buff', heal:'heal', conjure:'summon', summon:'summon', petcall:'summon', command:'summon', bond:'summon',
  trap:'trick', debuff:'trick', steal:'trick'};
const skfxN = n => Math.max(1, Math.round(n * ([.35, .7, 1][GFX.fx] ?? 1)));
const skfxR = (a, b) => a + Math.random() * (b - a);
function skfxTier(sk){ const j = JOBS[sk.job]; return j ? j.tier || 1 : 1; }
function skfxCol(sk){
  if (sk.type === 'heal') return SKFX_EL.heal;
  const f = sk.fx || '';
  if (sk.elem && SKFX_EL[sk.elem]) return SKFX_EL[sk.elem];
  if (/ice|frost|deluge/.test(f)) return SKFX_EL.water;
  if (/thunder|wrath|tempest/.test(f)) return SKFX_EL.bolt;
  if (/poison|venom|dart/.test(f)) return SKFX_EL.poison;
  if (/shadow|assass|smoke|stealth/.test(f) || ['rogue', 'bandit', 'tigershade'].includes(sk.job)) return SKFX_EL.shadow;
  if (/holy|elixir|heal/.test(f)) return SKFX_EL.holy;
  if (/fire|meteor|solar/.test(f)) return SKFX_EL.fire;
  if (/quake|earth|stone/.test(f)) return SKFX_EL.earth;
  const w = DER && DER.welem; return SKFX_EL[w] || SKFX_EL.neutral;
}
const skfxAdd = f => (SKFX.fx.length < 120 && SKFX.fx.push(Object.assign({t:0, life:.5, layer:'over'}, f)), f);
function skfxPart(p){ if (SKFX.parts.length > 700 * ([.35, .7, 1][GFX.fx] ?? 1)) return; SKFX.parts.push(Object.assign({t:0, z:0, vx:0, vy:0, vz:0, g:0, drag:0, life:.5, size:2, col:'#fff', add:true, shape:'dot'}, p)); }
function skfxBurst(x, y, z, n, o){ for (let i = 0; i < skfxN(n); i++){ const a = skfxR(0, Math.PI * 2), s = skfxR(o.s0 ?? 40, o.s1 ?? 160);
  skfxPart(Object.assign({x, y, z, vx:Math.cos(a) * s, vy:Math.sin(a) * s * .5, vz:skfxR(o.vz0 ?? 20, o.vz1 ?? 120), life:skfxR(o.l0 ?? .3, o.l1 ?? .7)}, o.p || {})); } }
function skfxShake(a){ VFX.shake(a); }
function skfxStop(s){ if (SETTINGS.hitStop === false) return; SKFX.stop = Math.max(SKFX.stop, s); }
function skfxFlash(col, a){ if (!SKFX.flash || SKFX.flash.a < a) SKFX.flash = {col, a, t:0}; }

/* ---------- pieces ---------- */
function skfxRing(x, y, r, col, life = .35, w = 5, delay = 0){ skfxAdd({x, y, r, col, w, life, t:-delay, layer:'under', draw(g, k){ const e = 1 - Math.pow(1 - k, 3);
  g.globalAlpha = .9 * (1 - k); g.strokeStyle = this.col; g.lineWidth = Math.max(.5, this.w * (1 - k)); g.beginPath(); g.ellipse(this.x, this.y, Math.max(.5, this.r * e), Math.max(.5, this.r * e * .5), 0, 0, Math.PI * 2); g.stroke(); }}); }
function skfxGlow(x, y, r, col, life = .25, a = .9){ skfxAdd({x, y, r, col, life, a, add:true, draw(g, k){ const gr = g.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * (1 + k * .4));
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(.25, this.col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = this.a * (1 - k); g.fillStyle = gr; g.beginPath(); g.arc(this.x, this.y, this.r * (1 + k * .4), 0, Math.PI * 2); g.fill(); }}); }
function skfxCracks(x, y, r, life = 2){ const arms = Array.from({length:7}, () => ({a:skfxR(0, Math.PI * 2), l:skfxR(.5, 1) * r, b:skfxR(-.5, .5)}));
  skfxAdd({x, y, life, layer:'under', draw(g, k){ g.globalAlpha = .55 * (1 - k); g.strokeStyle = 'rgba(40,24,12,1)'; g.lineWidth = 1.6;
    for (const a of arms){ g.beginPath(); g.moveTo(this.x, this.y); const mx = this.x + Math.cos(a.a + a.b * .3) * a.l * .5, my = this.y + Math.sin(a.a + a.b * .3) * a.l * .25;
      g.lineTo(mx, my); g.lineTo(this.x + Math.cos(a.a) * a.l, this.y + Math.sin(a.a) * a.l * .5); g.stroke(); }
    g.fillStyle = 'rgba(30,18,10,1)'; g.globalAlpha = .25 * (1 - k); g.beginPath(); g.ellipse(this.x, this.y, r * .45, r * .22, 0, 0, Math.PI * 2); g.fill(); }}); }
function skfxScorch(x, y, r, col, life = 2.2){ skfxAdd({x, y, r, col, life, layer:'under', draw(g, k){ const gr = g.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
  gr.addColorStop(0, this.col); gr.addColorStop(.6, 'rgba(20,10,5,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = .55 * (1 - k); g.fillStyle = gr;
  g.beginPath(); g.ellipse(this.x, this.y, this.r, this.r * .5, 0, 0, Math.PI * 2); g.fill(); }}); }
function skfxDust(x, y, n = 8){ skfxBurst(x, y, 2, n, {s0:20, s1:70, vz0:5, vz1:30, l0:.4, l1:.8, p:{size:5, grow:10, col:'rgba(150,130,110,1)', add:false, shape:'smoke', drag:2}}); }
function skfxGlyph(x, y, r, col, life, spin = 1){ skfxAdd({x, y, r, col, life, layer:'under', draw(g, k){ const a = k < .2 ? k / .2 : k > .75 ? (1 - k) / .25 : 1;
  g.save(); g.translate(this.x, this.y); g.scale(1, .5); g.rotate(SKFX.last * spin); g.globalAlpha = .8 * a; g.strokeStyle = this.col; g.lineWidth = 1.4;
  g.beginPath(); g.arc(0, 0, this.r, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(0, 0, this.r * .78, 0, Math.PI * 2); g.stroke();
  g.beginPath(); for (let i = 0; i <= 8; i++){ const q = i * Math.PI * 2 / 8 * 3; g.lineTo(Math.cos(q) * this.r * .78, Math.sin(q) * this.r * .78); } g.stroke();
  for (let i = 0; i < 12; i++){ const q = i * Math.PI / 6; g.beginPath(); g.arc(Math.cos(q) * this.r * .89, Math.sin(q) * this.r * .89, 1.3, 0, Math.PI * 2); g.fillStyle = this.col; g.fill(); }
  g.restore(); }}); }
function skfxPillar(x, y, col, life = .7, w = 18, h = 120){ skfxAdd({x, y, col, life, add:true, draw(g, k){ const a = (k < .15 ? k / .15 : 1 - (k - .15) / .85) * .4,   /* (v132) a soft column of light, not a blinding beam */ ww = w * (k < .15 ? .4 + k * 4 : 1 - k * .5);
  const gr = g.createLinearGradient(this.x - ww, 0, this.x + ww, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.5, this.col); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = .75 * a; g.fillStyle = gr; g.fillRect(this.x - ww, this.y - h, ww * 2, h);
  g.globalAlpha = .9 * a; g.fillStyle = '#ffffff'; g.fillRect(this.x - ww * .12, this.y - h, ww * .24, h); }}); }
function skfxMotes(x, y, col, n = 10, up = 70){ for (let i = 0; i < skfxN(n); i++) skfxPart({x:x + skfxR(-14, 14), y:y + skfxR(-4, 4), z:skfxR(0, 10), vz:skfxR(up * .6, up * 1.3), vx:skfxR(-10, 10), life:skfxR(.6, 1.1), size:skfxR(1.4, 2.6), col}); }
function skfxSparks(x, y, z, col, n, dir){ for (let i = 0; i < skfxN(n); i++){ const a = (dir ?? skfxR(0, Math.PI * 2)) + skfxR(-.9, .9), s = skfxR(120, 380);
  skfxPart({x, y, z, vx:Math.cos(a) * s, vy:Math.sin(a) * s * .5, vz:skfxR(30, 160), g:-500, drag:3, life:skfxR(.25, .5), size:skfxR(1.2, 2.2), col, shape:'line'}); } }

/* ---------- per kind of skill ---------- */
function skfxRelease(sk, col, tier){
  const z = 30; skfxGlow(P.x, P.y - z, 18 + tier * 6, col[1], .22); skfxRing(P.x, P.y, 22 + tier * 10, col[0], .3, 3);
  skfxBurst(P.x, P.y, z, 4 + tier * 3, {s0:30, s1:110, vz0:10, vz1:70, p:{size:1.8, col:col[1], g:-120, drag:2}});
}
function skfxCast(id, lv, t, from){
  const sk = SKILLS[id]; if (!sk || sk.type === 'passive') return;
  const cat = SKFX_CAT[sk.type] || 'strike', tier = skfxTier(sk), col = skfxCol(sk), big = tier >= 4 && sk.kind === 'active' && (sk.cd || 0) >= 5;
  SKFX.cur = {id, t:T, n:0, cat, tier, col, big};
  skfxRelease(sk, col, tier);
  const tx = t && !t.dead ? t.x : P.x, ty = t && !t.dead ? t.y : P.y;
  switch (cat){
    case 'dash': { const x0 = from.x, y0 = from.y, x1 = P.x, y1 = P.y, d = Math.hypot(x1 - x0, y1 - y0);
      skfxDust(x0, y0, 10); skfxDust(x1, y1, 8);
      for (let i = 1; i <= 5; i++){ const q = i / 6; skfxAdd({x:x0 + (x1 - x0) * q, y:y0 + (y1 - y0) * q, col:col[1], life:.28 + q * .1, t:-q * .05, add:true, draw(g, k){
        g.globalAlpha = .55 * (1 - k); g.fillStyle = this.col; g.beginPath(); g.ellipse(this.x, this.y - 18, 7, 18, 0, 0, Math.PI * 2); g.fill();
        g.globalAlpha = .35 * (1 - k); g.beginPath(); g.ellipse(this.x, this.y - 40, 6, 6, 0, 0, Math.PI * 2); g.fill(); }}); }
      if (d > 8) skfxAdd({x0, y0, x1, y1, life:.3, add:true, draw(g, k){ const ux = (this.x1 - this.x0) / d, uy = (this.y1 - this.y0) / d;
        g.globalAlpha = .8 * (1 - k); g.strokeStyle = col[0]; g.lineCap = 'round';
        for (let i = -2; i <= 2; i++){ g.lineWidth = i ? 1.2 : 3; const ox = -uy * i * 6, oy = ux * i * 4;
          g.beginPath(); g.moveTo(this.x0 + ox + ux * d * k * .6, this.y0 - 20 + oy + uy * d * k * .6); g.lineTo(this.x1 + ox, this.y1 - 20 + oy); g.stroke(); } }});
      break; }
    case 'slam': { const r = sk.radius || 80;
      skfxRing(P.x, P.y, r * 1.15, col[1], .4, 6); skfxRing(P.x, P.y, r * .8, col[0], .35, 4, .08); skfxCracks(P.x, P.y, r);
      skfxBurst(P.x, P.y, 4, 14 + tier * 8, {s0:60, s1:220, vz0:60, vz1:200, l0:.4, l1:.8, p:{g:-600, size:2.6, col:col[2], add:false, shape:'rock'}});
      skfxDust(P.x, P.y, 10); skfxShake(2 + tier); break; }
    case 'sky': { const r = sk.radius || 80, lead = sk.fx === 'meteor' ? .55 : .3;
      skfxAdd({x:tx, y:ty, r, life:lead + .05, layer:'under', draw(g, k){ g.globalAlpha = .7; g.strokeStyle = col[1]; g.lineWidth = 2; g.beginPath(); g.ellipse(this.x, this.y, this.r, this.r * .5, 0, 0, Math.PI * 2); g.stroke();
        g.globalAlpha = .25; g.fillStyle = col[1]; g.beginPath(); g.ellipse(this.x, this.y, this.r * k, this.r * .5 * k, 0, 0, Math.PI * 2); g.fill(); }});
      later(lead, () => { skfxGlow(tx, ty - 10, r * 1.1, col[1], .35); skfxRing(tx, ty, r * 1.35, col[0], .4, 6); skfxRing(tx, ty, r, col[1], .45, 4, .07);
        skfxScorch(tx, ty, r * .9, col[2]); skfxBurst(tx, ty, 6, 18 + tier * 8, {s0:60, s1:240, vz0:60, vz1:220, p:{g:-500, size:2.2, col:col[1], drag:1}});
        skfxShake(1.5 + tier); if (tier >= 3) skfxFlash(col[1], tier >= 4 ? .3 : .16); });
      break; }
    case 'beam': { const d = Math.hypot(tx - P.x, ty - P.y) || 1, ux = (tx - P.x) / d, uy = (ty - P.y) / d, len = sk.len || 200, w = (sk.width || 24) * .8;
      skfxAdd({x:P.x, y:P.y - 18, ux, uy, len, w, life:.42, add:true, draw(g, k){ const ww = this.w * (k < .15 ? k / .15 : 1 - (k - .15) / .85), ex = this.x + this.ux * this.len, ey = this.y + this.uy * this.len;
        g.lineCap = 'round'; g.globalAlpha = .55; g.strokeStyle = col[1]; g.lineWidth = ww * 2; g.beginPath(); g.moveTo(this.x, this.y); g.lineTo(ex, ey); g.stroke();
        g.globalAlpha = .95; g.strokeStyle = '#ffffff'; g.lineWidth = ww * .5; g.beginPath(); g.moveTo(this.x, this.y); g.lineTo(ex, ey); g.stroke(); }});
      skfxGlow(P.x + ux * len, P.y - 18 + uy * len, 30, col[1], .35); skfxShake(1 + tier); break; }
    case 'shot': { const d = Math.hypot(tx - P.x, ty - P.y) || 1; skfxGlow(P.x + (tx - P.x) / d * 14, P.y - 24 + (ty - P.y) / d * 7, 16, col[1], .14); break; }
    case 'buff': {
      for (let i = 0; i < 3; i++) skfxRing(P.x, P.y, 34 + i * 10, col[i % 2], .45, 3, i * .1);
      skfxGlyph(P.x, P.y, 34, col[1], 1.2); skfxMotes(P.x, P.y, col[1], 12); skfxGlow(P.x, P.y - 24, 34, col[1], .4, .55); break; }
    case 'heal': skfxPillar(P.x, P.y, col[1], .7, 16, 110); skfxMotes(P.x, P.y, col[1], 10, 80);
      for (let i = 0; i < skfxN(6); i++) skfxPart({x:P.x + skfxR(-16, 16), y:P.y, z:skfxR(10, 40), vz:skfxR(30, 60), life:skfxR(.7, 1.1), size:4, col:col[1], shape:'plus'}); break;
    case 'summon': skfxPillar(P.x, P.y, col[1], .8, 22, 150); skfxGlyph(P.x, P.y, 40, col[1], 1, -1); skfxShake(2); break;
    case 'blink': skfxRing(from.x, from.y, 30, col[1], .35, 3); skfxRing(P.x, P.y, 30, col[1], .35, 3, .05); skfxBurst(P.x, P.y, 20, 10, {s0:30, s1:90, p:{col:col[1], size:1.8}}); break;
    case 'trick': skfxRing(tx, ty, 34, col[1], .35, 3); skfxGlow(tx, ty - 16, 22, col[1], .2); break;
  }
  if (big && T - SKFX.ultT > 4){ SKFX.ultT = T; }   // (v132) no darkening of the whole screen, no flash, no speed lines: with Auto casting big skills every few seconds the screen blinked dark and bright like lightning
}

/* ---------- the hit lands ---------- */
HK.dmgAfter.push((m, res, sk, hp0) => {
  const c = SKFX.cur; if (!sk || !res || !(res.dmg > 0) || !c || c.id !== sk.id || T - c.t > 4 || !m) return;
  c.n++; const h = (typeof MOB_H !== 'undefined' ? MOB_H[m.type] : 30) || 30, x = m.x, y = m.y, z = h * .55, dir = Math.atan2(m.y - P.y, m.x - P.x);
  if (c.n === 1){
    const size = c.big ? .16 : c.tier >= 3 ? .11 : c.cat === 'shot' || c.cat === 'sky' ? .05 : .075;
    skfxStop(res.crit ? size + .04 : size); skfxShake((c.cat === 'shot' ? 1 : 2) + c.tier * (c.big ? 1.4 : .8));
    skfxAdd({m, life:.09, add:true, draw(g){ g.globalAlpha = .85; const gr = g.createRadialGradient(this.m.x, this.m.y - z, 0, this.m.x, this.m.y - z, h * .7);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(this.m.x, this.m.y - z, h * .7, 0, Math.PI * 2); g.fill(); }});
    skfxRing(x, y, 40 + c.tier * 14 + (c.big ? 40 : 0), c.col[0], .32, 5); skfxGlow(x, y - z, 22 + c.tier * 6, c.col[1], .2);
    skfxSparks(x, y, z, c.col[0], 8 + c.tier * 5 + (res.crit ? 10 : 0), c.cat === 'slam' || c.cat === 'sky' ? null : dir);
    if (res.crit) skfxFlash('#ffd34d', .12);
    if (c.big){ skfxRing(x, y, 120, c.col[1], .45, 6, .06); skfxRing(x, y, 170, c.col[0], .5, 4, .12); skfxFlash(c.col[1], .35); }
  } else if (c.n < 40){ skfxSparks(x, y, z, c.col[0], 3 + c.tier, dir); if (c.n % 3 === 0) skfxStop(.035); }
});

/* casting: a glyph grows under the caster and light gathers to the hands */
function skfxCasting(dt){
  const c = P.cast; if (!c || !SKILLS[c.id]) return; const sk = SKILLS[c.id], col = skfxCol(sk);
  if (Math.random() < dt * 28 * ([.35, .7, 1][GFX.fx] ?? 1)){ const a = skfxR(0, Math.PI * 2), r = skfxR(30, 46);
    skfxPart({x:P.x + Math.cos(a) * r, y:P.y + Math.sin(a) * r * .5, z:skfxR(4, 40), vx:-Math.cos(a) * r * 2.2, vy:-Math.sin(a) * r * 1.1, vz:skfxR(10, 40), life:.45, size:1.8, col:col[1]}); }
}

/* ---------- wiring ---------- */
{ const _ex = execSkill;
  execSkill = function(id, lv, t){ const from = {x:P.x, y:P.y}; const r = _ex.apply(this, arguments); try { skfxCast(id, lv, t, from); } catch (e) { console.warn('skillfx', e); } return r; };
}
/* hit-stop: advance() lives in main.js, which loads after this file */
function skfxHookAdvance(){ if (typeof advance !== 'function' || advance.skfx) return; const _adv = advance;
  advance = function(dt, draw){ if (SKFX.stop > 0 && !document.hidden){ const s = Math.min(SKFX.stop, dt); SKFX.stop -= dt; dt = dt - s + s * .08; } return _adv.call(this, dt, draw); };
  advance.skfx = 1; }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', skfxHookAdvance); else setTimeout(skfxHookAdvance, 0);
function skfxStep(){
  const now = performance.now() / 1000, dt = Math.min(.05, Math.max(0, now - (SKFX.now || now))); SKFX.now = now; SKFX.last += dt;
  for (const f of SKFX.fx) f.t += dt; SKFX.fx = SKFX.fx.filter(f => f.t < f.life);
  for (const p of SKFX.parts){ p.t += dt; const dr = Math.max(0, 1 - p.drag * dt); p.vx *= dr; p.vy *= dr; p.x += p.vx * dt; p.y += p.vy * dt; p.vz += p.g * dt; p.z = Math.max(0, p.z + p.vz * dt); if (p.grow) p.size += p.grow * dt; }
  SKFX.parts = SKFX.parts.filter(p => p.t < p.life);
  if (SKFX.dimT > 0) SKFX.dimT -= dt; if (SKFX.flash){ SKFX.flash.t += dt; if (SKFX.flash.t > .14) SKFX.flash = null; }
  if (SKFX.cut){ SKFX.cut.t += dt; if (SKFX.cut.t > 1.1) SKFX.cut = null; } if (SKFX.lines){ SKFX.lines.t += dt; if (SKFX.lines.t > .4) SKFX.lines = null; }
  if (P.cast) skfxCasting(dt);
  return dt;
}
function skfxDrawList(g, cx, cy, layer){
  g.save(); g.translate(-cx, -cy);
  for (const f of SKFX.fx){ if (f.layer !== layer || f.t < 0) continue; g.save(); if (f.add) g.globalCompositeOperation = 'lighter'; f.draw(g, Math.min(1, f.t / f.life)); g.restore(); }
  if (layer === 'over') for (const p of SKFX.parts){ const k = p.t / p.life, a = k > .6 ? (1 - k) / .4 : 1; g.globalAlpha = a; g.globalCompositeOperation = p.add ? 'lighter' : 'source-over';
    const X = p.x, Y = p.y - p.z;
    if (p.shape === 'line'){ g.strokeStyle = p.col; g.lineWidth = p.size; g.beginPath(); g.moveTo(X, Y); g.lineTo(X - p.vx * .03, Y - (p.vy * .03 - p.vz * .03)); g.stroke(); }
    else if (p.shape === 'plus'){ g.fillStyle = p.col; g.fillRect(X - p.size, Y - p.size * .3, p.size * 2, p.size * .6); g.fillRect(X - p.size * .3, Y - p.size, p.size * .6, p.size * 2); }
    else if (p.shape === 'smoke'){ g.globalAlpha = a * .35; g.fillStyle = p.col; g.beginPath(); g.arc(X, Y, p.size, 0, Math.PI * 2); g.fill(); }
    else if (p.shape === 'rock'){ g.fillStyle = p.col; g.fillRect(X - p.size / 2, Y - p.size / 2, p.size, p.size); }
    else { g.fillStyle = p.col; g.beginPath(); g.arc(X, Y, p.size, 0, Math.PI * 2); g.fill(); } }
  g.restore(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
{ const _du = VFX.drawUnder;
  VFX.drawUnder = function(g, cx, cy){
    skfxStep();
    if (SKFX.dimT > 0){ const k = SKFX.dimT, a = (k > .6 ? (.75 - k) / .15 : k < .2 ? k / .2 : 1) * .42; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = Math.max(0, a); g.fillStyle = '#05030c'; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore(); }
    if (P.cast && SKILLS[P.cast.id]){ const col = skfxCol(SKILLS[P.cast.id]); g.save(); g.translate(-cx, -cy); g.translate(P.x, P.y); g.scale(1, .5); g.rotate(SKFX.last * 1.2);
      g.globalAlpha = .75; g.strokeStyle = col[1]; g.lineWidth = 1.5; const r = 30; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke();
      g.beginPath(); for (let i = 0; i <= 8; i++){ const q = i * Math.PI * 2 / 8 * 3; g.lineTo(Math.cos(q) * r * .8, Math.sin(q) * r * .8); } g.stroke(); g.restore(); }
    const r = _du.apply(this, arguments); skfxDrawList(g, cx, cy, 'under'); return r;
  };
  const _do = VFX.drawOver;
  VFX.drawOver = function(g, cx, cy){ const r = _do.apply(this, arguments); skfxDrawList(g, cx, cy, 'over'); return r; };
  const _df = VFX.drawFlash;
  VFX.drawFlash = function(ctx, w, h){
    const r = _df.apply(this, arguments);
    if (SKFX.flash){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = SKFX.flash.a * (1 - SKFX.flash.t / .14); ctx.fillStyle = SKFX.flash.col; ctx.fillRect(0, 0, w, h); ctx.restore(); }
    if (SKFX.lines){ const k = SKFX.lines.t / .4, cxs = sx(P.x), cys = sy(P.y - 24); ctx.save(); ctx.globalAlpha = .55 * (1 - k); ctx.strokeStyle = SKFX.lines.col; ctx.lineCap = 'round';
      for (let i = 0; i < 28; i++){ const a = i / 28 * Math.PI * 2 + (i % 3) * .07, R0 = Math.max(w, h) * .75, R1 = Math.max(w, h) * (.32 + (i % 4) * .05 + k * .1);
        ctx.lineWidth = 1.5 + (i % 3); ctx.beginPath(); ctx.moveTo(cxs + Math.cos(a) * R0, cys + Math.sin(a) * R0); ctx.lineTo(cxs + Math.cos(a) * R1, cys + Math.sin(a) * R1); ctx.stroke(); }
      ctx.restore(); }
    if (SKFX.cut){ const c = SKFX.cut, t = c.t, inK = Math.min(1, t / .14), outK = t > .9 ? (t - .9) / .2 : 0, ease = 1 - Math.pow(1 - inK, 3);
      const bh = Math.min(76, h * .12), by = h * .3, x = (ease - 1) * w + outK * w;
      ctx.save(); ctx.translate(x, by);
      const gr = ctx.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,250,235,0)'); gr.addColorStop(.18, 'rgba(255,250,235,.94)'); gr.addColorStop(.82, 'rgba(255,250,235,.94)'); gr.addColorStop(1, 'rgba(255,250,235,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, w, bh);
      ctx.fillStyle = c.col[1]; ctx.fillRect(0, 0, w, 3); ctx.fillRect(0, bh - 3, w, 3);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#16121c'; ctx.font = FD(900, Math.round(bh * .5)); ctx.fillText(c.name, w / 2, bh * .44);
      ctx.font = FD(600, Math.round(bh * .2)); ctx.fillStyle = '#4a3a20'; ctx.fillText(c.sub, w / 2, bh * .82);
      ctx.restore(); }
    return r;
  };
}

/* ---------- UI standard: frame by skill kind, seconds left on cooldowns ---------- */
function skfxKinds(){
  const mark = (e, id) => { const s = id && SKILLS[id]; if (!e || !s) return; e.dataset.kind = s.kind || 'active'; e.classList.toggle('skult', skfxTier(s) >= 4 && s.kind === 'active'); };
  for (const b of document.querySelectorAll('#hotbar .hk[data-hot]')){ const h = hotbarDef()[+b.dataset.hot]; if (h && h.k === 'skill') mark(b, h.id); }
  for (const b of document.querySelectorAll('.mo.sk[data-id]')) mark(b, b.dataset.id);
  for (const n of document.querySelectorAll('#pane-skill .skn[data-node]')) mark(n, n.dataset.node);
}
{ const _rh = renderHotbar; renderHotbar = function(){ const r = _rh.apply(this, arguments); skfxKinds(); return r; }; }
{ const _rs = renderSkills; renderSkills = function(){ const r = _rs.apply(this, arguments); skfxKinds(); return r; }; }
{ const _h = hud; hud = function(){ const r = _h.apply(this, arguments);
  for (const c of document.querySelectorAll('.cdv')){ const id = c.dataset.cd, left = P.cds[id] || 0; const s = left > .05 ? (left < 3 ? left.toFixed(1) : String(Math.ceil(left))) : '';
    if (c.dataset.s !== s){ c.dataset.s = s; c.textContent = s; } }
  return r; }; }
{ const st = document.createElement('style'); st.textContent = `
.cdv{display:flex;align-items:center;justify-content:center;font:800 15px/1 var(--display,Sarabun);color:#fff;text-shadow:0 0 3px #000,0 1px 2px #000}
.hk[data-kind="active"],.mo.sk[data-kind="active"]{box-shadow:inset 0 0 0 2px #e8b84a}
.hk[data-kind="buff"],.mo.sk[data-kind="buff"]{box-shadow:inset 0 0 0 2px #5bd17a;border-radius:16px}
.hk[data-kind="passive"],.mo.sk[data-kind="passive"]{box-shadow:inset 0 0 0 2px #9aa3ad}
.hk.skult,.mo.sk.skult{box-shadow:inset 0 0 0 2px #e8b84a,0 0 0 2px #9a5cf0}
#pane-skill .skn[data-kind="active"]{outline:2px solid #e8b84a;outline-offset:-2px}
#pane-skill .skn[data-kind="buff"]{outline:2px solid #5bd17a;outline-offset:-2px;border-radius:14px}
#pane-skill .skn[data-kind="passive"]{outline:2px solid #9aa3ad;outline-offset:-2px;border-radius:50%}
#pane-skill .skn.skult{outline:2px solid #9a5cf0;box-shadow:0 0 0 3px #e8b84a}`;
  document.head.appendChild(st); }
