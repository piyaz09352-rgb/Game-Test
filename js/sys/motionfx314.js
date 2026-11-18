/* VAYRATHEN — js/sys/motionfx314.js — (v314) speed you can see: flashing, vanishing, dashing, fast attacks
   The owner: «เอฟเฟคความเร็วในการโจมตี การเคลื่อนที่แบบ วาบ หายตัว พุ่ง». These moves had a burst of particles and
   nothing more; the hero just appeared at the other end. Now the body itself shows the speed, drawn from its own frames:
   · FLASH (blink, backstep skills): the hero breaks up where it stood (an afterimage that fades and drifts up, shards of
     light thrown off), a trail of fading afterimages marks the path, and the hero fades back in where it lands with a
     small ring at its feet.
   · DASH (dash skills, dodge roll): afterimages in a row behind it, streaks along the path and dust at both ends.
   · VANISH (Veil, Smoke Bomb): a puff of smoke, the body fades out instead of switching off, and while hidden it shows as
     a faint shimmer, like heat haze; it fades back in with another puff when it is seen again.
   · FAST ATTACKS: the quicker the hero swings (measured from the time between blows: attack speed, buffs), the more
     afterimages of the swing follow it and the more wind streaks fly from the blow.
   · Bosses: a boss that teleports leaves its afterimage behind and fades in where it lands (its dashes already leave
     afterimages: js/sys/bossact.js).
   Nothing flashes the screen. Settings ▸ «class skill effects» (SETTINGS.classFx) turns all of it off. */
'use strict';
const MFX = {g:[], last:{x:0, y:0, map:-1}, sk:null, arrive:-9, hid:false, hideT:-9, atkGap:9, lastAtk:-9, spd:0, rollT:0};
const mfxOn = () => !(typeof SETTINGS !== 'undefined' && SETTINGS.classFx === false);
const mfxLerp = (a, b, k) => a + (b - a) * k;
const MFX_COL = {flash:['#f2fbff', '#8fd4ff', '#3a7ad8'], dash:['#fff4d8', '#ffc870', '#c07a2a']};

/* an afterimage of the hero's own frame at a place and moment */
function mfxGhost(x, y, o){ if (MFX.g.length > 18) MFX.g.shift(); MFX.g.push(Object.assign({x, y, act:P.act || 'idle', dir:P.dir || 0, at:P.animT || 0, t0:T, life:.32, a:.5, glow:0, rise:0}, o)); }

/* the moment the hero jumps from one place to another */
function mfxTrail(x0, y0, x1, y1, kind){
  MFX.n = (MFX.n || 0) + 1;
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(3, Math.min(7, Math.round(d / 26))), flash = kind !== 'dash', col = flash ? MFX_COL.flash : MFX_COL.dash;
  for (let i = 0; i < n; i++){ const k = i / n;
    mfxGhost(mfxLerp(x0, x1, k), mfxLerp(y0, y1, k), {life:.2 + k * .2, a:(flash ? .3 : .38) + k * .22, glow:flash ? .35 : .15, act:flash ? (P.act || 'idle') : 'walk'}); }
  if (typeof skfxAdd !== 'function') return;
  if (flash){
    mfxGhost(x0, y0, {life:.34, a:.85, glow:.55, rise:14});   // the body breaking up where it stood
    skfxBurst(x0, y0, 22, 14, {s0:40, s1:150, vz0:20, vz1:110, l0:.25, l1:.5, p:{size:1.8, col:col[1], shape:'line', drag:2}});
    skfxBurst(x1, y1, 18, 10, {s0:20, s1:70, vz0:10, vz1:60, l0:.3, l1:.55, p:{size:1.6, col:col[0], drag:1.5}});
    skfxRing(x1, y1, 26, col[1], .32, 3); MFX.arrive = T;
  } else {
    skfxDust(x0, y0, 9); skfxDust(x1, y1, 6);
    const ux = (x1 - x0) / (d || 1), uy = (y1 - y0) / (d || 1);
    skfxAdd({x0, y0, x1, y1, ux, uy, d, life:.32, add:true, draw(g, k){   // speed streaks along the path
      g.save(); g.lineCap = 'round';
      for (let i = 0; i < 7; i++){ const off = (i - 3) * 4.5, h = 10 + (i * 37 % 26), s = (i * .13) % .4, e = Math.min(1, s + .7);
        const ax = this.x0 + this.ux * this.d * s - this.uy * off, ay = this.y0 + this.uy * this.d * s + this.ux * off * .5 - h,
          bx = this.x0 + this.ux * this.d * e - this.uy * off, by = this.y0 + this.uy * this.d * e + this.ux * off * .5 - h;
        g.globalAlpha = .55 * (1 - k); g.strokeStyle = i % 2 ? col[0] : col[1]; g.lineWidth = 2.2 * (1 - k) + .4;
        g.beginPath(); g.moveTo(mfxLerp(ax, bx, k * .8), mfxLerp(ay, by, k * .8)); g.lineTo(bx, by); g.stroke(); }
      g.restore(); }});
  }
}

/* which kind of move just moved the hero */
if (typeof execSkill === 'function'){ const _ex = execSkill; execSkill = function(id){ const sk = typeof SKILLS !== 'undefined' && SKILLS[id]; if (sk) MFX.sk = {type:sk.type, t:T}; return _ex.apply(this, arguments); }; }
/* the time between blows tells how fast the hero attacks */
if (typeof basicAttack === 'function'){ const _ba = basicAttack; basicAttack = function(){ const gap = T - MFX.lastAtk; MFX.lastAtk = T;
    if (gap < 2){ MFX.atkGap = gap; const k = Math.max(0, Math.min(1, (.82 - gap) / .5)); MFX.spd = MFX.spd * .5 + k * .5; } else MFX.spd = 0;
    const r = _ba.apply(this, arguments);
    try { if (mfxOn() && MFX.spd > .3 && typeof skfxAdd === 'function'){ const t = arguments[0], a = t && !t.dead ? Math.atan2(t.y - P.y, t.x - P.x) : 0, spd = MFX.spd;   // wind thrown off the blow
      skfxAdd({x:P.x, y:P.y, a, spd, life:.22, add:true, draw(g, k){ g.save(); g.lineCap = 'round';
        for (let i = 0; i < 2 + Math.round(this.spd * 3); i++){ const q = this.a + (i - 1.5) * .32, r0 = 14 + k * 26, r1 = r0 + 10 + this.spd * 10, z = 20 + (i % 3) * 6;
          g.globalAlpha = .5 * this.spd * (1 - k); g.strokeStyle = i % 2 ? '#ffffff' : '#d8ecff'; g.lineWidth = 1.6;
          g.beginPath(); g.moveTo(this.x + Math.cos(q) * r0, this.y + Math.sin(q) * r0 * .5 - z); g.lineTo(this.x + Math.cos(q) * r1, this.y + Math.sin(q) * r1 * .5 - z); g.stroke(); }
        g.restore(); }}); } } catch (e) {}
    return r; }; }

EV.on('tick', () => {
  if (typeof P === 'undefined') return;
  const L = MFX.last, d = Math.hypot(P.x - L.x, P.y - L.y), on = mfxOn() && !P.dead;
  if (on && L.map === MAP_ID && d > 34 && d < 900){ const s = MFX.sk && T - MFX.sk.t < .5 ? MFX.sk.type : null;
    if (s === 'dash') mfxTrail(L.x, L.y, P.x, P.y, 'dash'); else if (s === 'blink' || s === 'backstep') mfxTrail(L.x, L.y, P.x, P.y, 'flash'); }
  L.x = P.x; L.y = P.y; L.map = MAP_ID;
  if (on && P.roll && T - MFX.rollT > .045){ MFX.rollT = T; mfxGhost(P.x, P.y, {act:'roll', life:.24, a:.32}); }   // a dodge roll leaves a row of afterimages
  if (MFX.spd > 0 && T - MFX.lastAtk > 1.6) MFX.spd = 0;
  const hid = typeof hideBuff === 'function' && !!hideBuff();
  if (hid !== MFX.hid){ MFX.hid = hid; MFX.hideT = T;
    if (on && typeof skfxBurst === 'function'){ skfxBurst(P.x, P.y, 14, 12, {s0:15, s1:55, vz0:8, vz1:40, l0:.5, l1:.9, p:{size:6, grow:12, col:'rgba(120,120,130,1)', add:false, shape:'smoke', drag:2.5}});
      if (hid) mfxGhost(P.x, P.y, {life:.38, a:.7, glow:0}); } }   // the body fades out instead of switching off
  MFX.g = MFX.g.filter(q => T - q.t0 < q.life);
});

{ const _dp = drawPlayerW;
  drawPlayerW = function(g){
    if (!mfxOn() || P.dead || typeof heroSheet !== 'function') return _dp.apply(this, arguments);
    const sh = heroSheet();
    for (const q of MFX.g){ const k = (T - q.t0) / q.life, a = q.a * Math.pow(1 - k, 1.4), x = q.x - cam.x, y = q.y - cam.y - q.rise * k, act = sh.index[q.act] ? q.act : 'idle';
      g.save(); g.globalAlpha = a; SPR.draw(g, sh, act, q.dir, q.at, x, y);
      if (q.glow){ g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * q.glow; SPR.draw(g, sh, act, q.dir, q.at, x, y); }
      g.restore(); }
    const x = P.x - cam.x, y = P.y - cam.y, act = P.act || 'idle';
    // fast attacks: afterimages of the swing just behind the real one
    if (MFX.spd > .15 && P.atkAnim > 0 && !P.spin && sh.index[act]){ const n = 1 + Math.round(MFX.spd * 2);
      const [fx, fy] = typeof dirVec === 'function' ? dirVec(P.dir || 0) : [0, 0];
      for (let j = n; j >= 1; j--){ const bx = x - fx * j * 3.5, by = y - fy * j * 2, at = Math.max(0, P.animT - j * .045);   // a step behind in time and in place
        g.save(); g.globalAlpha = .34 * MFX.spd / j; SPR.draw(g, sh, act, P.dir || 0, at, bx, by);
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = .16 * MFX.spd / j; SPR.draw(g, sh, act, P.dir || 0, at, bx, by); g.restore(); } }
    // hidden: a faint shimmer either side, like heat haze
    if (MFX.hid && !P.ride){ const w = Math.sin(T * 7) * 1.6; g.save(); g.globalAlpha = .1; SPR.draw(g, sh, sh.index[act] ? act : 'idle', P.dir || 0, P.animT, x + 1.5 + w, y); SPR.draw(g, sh, sh.index[act] ? act : 'idle', P.dir || 0, P.animT, x - 1.5 - w, y); g.restore(); }
    // fading back in after a flash or out of hiding
    const fin = Math.min(1, (T - MFX.arrive) / .2, MFX.hid ? 1 : (T - MFX.hideT) / .3 + .35);
    if (fin < 1){ g.save(); g.globalAlpha *= Math.max(.15, fin); try { return _dp.apply(this, arguments); } finally { g.restore(); } }
    return _dp.apply(this, arguments);
  }; }

/* bosses: a teleport leaves the boss's afterimage behind it, and it fades in where it lands */
if (typeof VFX !== 'undefined' && VFX.play){ const _vp = VFX.play; VFX.play = function(name, o){
    if (name === 'shadowBlink' && o && isFinite(o.x2) && typeof mobs !== 'undefined' && mfxOn()) try { const m = mobs.find(q => q.def && q.def.boss && !q.dead && Math.hypot(q.x - o.x2, q.y - o.y2) < 6);
      if (m && Math.hypot(o.x - o.x2, o.y - o.y2) > 20){ m._mfx = {x:o.x, y:o.y, t:T}; if (typeof skfxBurst === 'function') skfxBurst(o.x, o.y, 30, 14, {s0:40, s1:140, vz0:20, vz1:120, l0:.3, l1:.6, p:{size:2, col:'#c8b8ff', shape:'line', drag:2}}); } } catch (e) {}
    return _vp.apply(this, arguments); }; }
{ const _dm = drawMobW;
  drawMobW = function(g, m){
    const q = m && m._mfx; if (!q || m.dead) return _dm.apply(this, arguments);
    const k = (T - q.t) / .4; if (k >= 1){ m._mfx = null; return _dm.apply(this, arguments); }
    const ox = m.x, oy = m.y; g.save(); g.globalAlpha = .6 * (1 - k); m.x = q.x; m.y = q.y; m._mfx = null;
    try { g.translate(0, -12 * k); _dm.call(this, g, m); } catch (e) {} finally { m.x = ox; m.y = oy; m._mfx = q; g.restore(); }
    g.save(); g.globalAlpha *= Math.min(1, .2 + k * 1.2); try { return _dm.apply(this, arguments); } finally { g.restore(); }
  }; }
