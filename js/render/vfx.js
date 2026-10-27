/* VAYRATHEN — js/render/vfx.js
   Skill effects with a Thai temple-art flavour: gold kanok flame sparks, lotus petals, yantra circles,
   lacquer-red and gold light. Everything is in world units and drawn in three layers:
     under  – ground marks (cast circles, cracks, scorch, traps, target rings)
     world  – things that stand among characters (the spirit tiger)
     over   – projectiles, particles, light, bolts (additive glow)
   Detail follows the graphics preset (GFX.fx 0–2): fewer particles and no extra glow on low. */
'use strict';

const VFX = (() => {
  let parts = [], fxs = [], shakeA = 0, shakeT = 0;
  const lvlMul = () => [0.35, .7, 1][GFX.fx] ?? 1;
  const N = n => Math.max(1, Math.round(n * lvlMul()));
  const R = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2;

  /* ---------- cached glow sprites (one soft radial texture per colour) ---------- */
  const glowCache = {};
  function glowTex(col){
    if (glowCache[col]) return glowCache[col];
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.18, col); gr.addColorStop(.55, col.replace(/[\d.]+\)$/, '0.35)')); gr.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return (glowCache[col] = c);
  }
  /* kanok flame (กนก) spark: a teardrop with a curled tip, cached per colour */
  const kanokCache = {};
  function kanokTex(col){
    if (kanokCache[col]) return kanokCache[col];
    const c = document.createElement('canvas'); c.width = 24; c.height = 32; const g = c.getContext('2d');
    g.translate(12, 28); g.fillStyle = col; g.beginPath();
    g.moveTo(0, 0); g.bezierCurveTo(-9, -6, -7, -18, 0, -26); g.bezierCurveTo(1, -20, 6, -18, 4, -12); g.bezierCurveTo(9, -10, 8, -3, 0, 0); g.fill();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(-1, -8, 2, 5, -.2, 0, TAU); g.fill();
    return (kanokCache[col] = c);
  }
  const AURA_RGB = {auraGold:['rgba(255,190,70,1)', 'rgba(255,240,180,1)'], auraGreen:['rgba(80,230,150,1)', 'rgba(210,255,230,1)'], auraViolet:['rgba(170,110,255,1)', 'rgba(235,215,255,1)'], auraWhite:['rgba(120,190,255,1)', 'rgba(225,240,255,1)']};
  const GOLD = 'rgba(255,200,80,1)', GOLDL = 'rgba(255,236,160,1)', RED = 'rgba(255,90,60,1)', FIRE = 'rgba(255,140,40,1)', ICE = 'rgba(120,210,255,1)',
    WIND = 'rgba(170,255,210,1)', VIOLET = 'rgba(190,140,255,1)', GREEN = 'rgba(140,240,150,1)', POISON = 'rgba(150,230,80,1)', WHITE = 'rgba(255,255,255,1)', LOTUS = 'rgba(255,150,190,1)';
  const ELC = {fire:FIRE, water:ICE, wind:WIND, earth:'rgba(230,180,100,1)', holy:GOLDL, shadow:VIOLET, neutral:GOLD};

  /* ---------- particles ---------- */
  // p: x,y (ground), z (height), vx,vy,vz, g (gravity on z), drag, life, size, grow, col, shape: dot|glow|kanok|petal|leaf|shard|rock|line|smoke|ring|star|note
  function emit(p){ if (parts.length > 900 * lvlMul()) return; parts.push(Object.assign({t:0, z:0, vx:0, vy:0, vz:0, g:0, drag:0, rot:R(0, TAU), vr:0, grow:0, alpha:1, shape:'glow', add:true}, p)); }
  function burst(x, y, z, n, o){ for (let i = 0; i < N(n); i++){ const a = R(0, TAU), s = R(o.s0 ?? 20, o.s1 ?? 80); emit(Object.assign({x, y, z, vx:Math.cos(a) * s, vy:Math.sin(a) * s * .5, vz:R(o.vz0 ?? 10, o.vz1 ?? 60), life:R(o.l0 ?? .35, o.l1 ?? .7)}, o.p)); } }
  function add(f){ fxs.push(Object.assign({t:0, life:1, layer:'over'}, f)); return f; }
  function shake(a){ if (typeof SETTINGS !== 'undefined' && SETTINGS.shake === false) return; shakeA = Math.max(shakeA, a * (GFX.fx ? 1 : .5)); shakeT = .25; }
  function shakeOffset(){ if (shakeT <= 0) return [0, 0]; return [R(-1, 1) * shakeA * (shakeT / .25), R(-1, 1) * shakeA * (shakeT / .25)]; }

  /* ---------- drawing helpers ---------- */
  let g = null, CX = 0, CY = 0;
  const sx = x => x - CX, sy = y => y - CY;
  function glow(x, y, r, col, a = 1){ if (a <= 0 || r <= 0) return;
    // (v132) a glow lights an effect, it never floods the screen: no brighter than .55 and no wider than 150 px
    r = Math.min(r, 150); g.globalAlpha = Math.min(.55, a); g.drawImage(glowTex(col), sx(x) - r, sy(y) - r, r * 2, r * 2); }
  function ring(x, y, r, col, a, w = 1.5, sq = .45){ if (a <= 0) return; g.globalAlpha = Math.min(1, a); g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.ellipse(sx(x), sy(y), Math.max(.1, r), Math.max(.1, r * sq), 0, 0, TAU); g.stroke(); }
  function disc(x, y, r, col, a, sq = .45){ if (a <= 0) return; g.globalAlpha = Math.min(1, a); g.fillStyle = col; g.beginPath(); g.ellipse(sx(x), sy(y), Math.max(.1, r), Math.max(.1, r * sq), 0, 0, TAU); g.fill(); }
  /* yantra circle: two rings, an 8-point star, spokes and dots — the magic circle under every spell */
  function yantra(x, y, r, col, a, rot, sq = .45){
    if (a <= 0) return;
    g.save(); g.translate(sx(x), sy(y)); g.scale(1, sq); g.rotate(rot); g.globalAlpha = Math.min(1, a); g.strokeStyle = col; g.fillStyle = col;
    g.lineWidth = 1.4; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
    g.lineWidth = .9; g.beginPath(); g.arc(0, 0, r * .82, 0, TAU); g.stroke();
    g.beginPath(); for (let i = 0; i <= 16; i++){ const aa = i / 16 * TAU, rr = i % 2 ? r * .45 : r * .8; g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } g.stroke();
    g.beginPath(); g.arc(0, 0, r * .3, 0, TAU); g.stroke();
    for (let i = 0; i < 12; i++){ const aa = i / 12 * TAU; g.beginPath(); g.arc(Math.cos(aa) * r * .91, Math.sin(aa) * r * .91, 1.3, 0, TAU); g.fill(); }
    for (let i = 0; i < 4; i++){ const aa = i / 4 * TAU + Math.PI / 4; g.beginPath(); g.moveTo(Math.cos(aa) * r * .3, Math.sin(aa) * r * .3); g.quadraticCurveTo(Math.cos(aa + .5) * r * .55, Math.sin(aa + .5) * r * .55, Math.cos(aa) * r * .78, Math.sin(aa) * r * .78); g.stroke(); }
    g.restore();
  }
  function bolt(x0, y0, x1, y1, col, w, seed, branches = 2, amp = 16){
    let s = seed * 9973; const rr = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - .5; };
    const seg = 9, pts = [];
    for (let i = 0; i <= seg; i++){ const k = i / seg; pts.push([x0 + (x1 - x0) * k + (i && i < seg ? rr() * amp : 0), y0 + (y1 - y0) * k]); }
    const path = () => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(sx(p[0]), sy(p[1])) : g.moveTo(sx(p[0]), sy(p[1])))); };
    g.strokeStyle = col; g.lineWidth = w * 3; g.globalAlpha *= .35; path(); g.stroke(); g.globalAlpha /= .35;
    g.strokeStyle = WHITE; g.lineWidth = w; path(); g.stroke();
    for (let b = 0; b < branches; b++){ const i = 2 + Math.floor((rr() + .5) * (seg - 4)), p = pts[i]; g.lineWidth = w * .6; g.beginPath(); g.moveTo(sx(p[0]), sy(p[1])); let bx = p[0], by = p[1]; for (let k = 0; k < 3; k++){ bx += rr() * 18 + (b ? 6 : -6); by += 8; g.lineTo(sx(bx), sy(by)); } g.stroke(); }
  }

  /* ---------- the effects ---------- */
  const E = {
    heal(o){
      add({x:o.x, y:o.y, life:1, draw(k){ glow(this.x, this.y - 20, 30 + k * 10, GREEN, .5 * (1 - k)); ring(this.x, this.y, 12 + k * 18, 'rgba(160,255,170,1)', 1 - k, 1.2); }});
      for (let i = 0; i < N(14); i++){ const a = i / 14 * TAU; emit({x:o.x + Math.cos(a) * 12, y:o.y + Math.sin(a) * 5, z:R(0, 8), vz:R(25, 45), vx:-Math.sin(a) * 18, vy:Math.cos(a) * 8, life:R(.7, 1.1), size:R(2.5, 4), shape:i % 3 ? 'leaf' : 'petal', col:i % 3 ? 'rgba(120,220,120,1)' : LOTUS, add:false, vr:R(-4, 4)}); }
      for (let i = 0; i < N(6); i++) emit({x:o.x + R(-10, 10), y:o.y, z:R(10, 30), vz:20, life:.8, size:3, shape:'plus', col:'rgba(170,255,180,1)'});
    },
    stoneHit(o){ burst(o.x, o.y, 12, 8, {s0:20, s1:60, vz0:20, vz1:70, p:{g:-260, size:R(1.5, 2.5), shape:'rock', col:'rgba(150,140,125,1)', add:false}}); burst(o.x, o.y, 4, 5, {s0:8, s1:24, vz0:4, vz1:12, p:{size:7, grow:14, shape:'smoke', col:'rgba(200,185,160,1)', add:false, life:.6}}); },
    waveslash(o){
      const ang = Math.atan2(o.ty - o.y, o.tx - o.x);
      add({x:o.x, y:o.y, ang, life:.32, draw(k){
        const r = 20 + k * 14, a0 = this.ang - 1.3 + k * .6, a1 = this.ang + 1.3;
        g.save(); g.translate(sx(this.x), sy(this.y - 16)); g.scale(1, .62);
        g.globalAlpha = 1 - k; g.lineCap = 'round';
        g.strokeStyle = 'rgba(255,214,110,.35)'; g.lineWidth = 12 * (1 - k) + 2; g.beginPath(); g.arc(0, 0, r, a0, a1); g.stroke();
        g.strokeStyle = 'rgba(255,248,220,1)'; g.lineWidth = 3.2 * (1 - k) + 1; g.beginPath(); g.arc(0, 0, r, a0 + .3, a1); g.stroke();
        g.restore();
      }});
      for (let i = 0; i < N(10); i++){ const a = ang + R(-1.2, 1.2), r = R(18, 32); emit({x:o.x + Math.cos(a) * r, y:o.y + Math.sin(a) * r * .6, z:R(8, 24), vx:Math.cos(a) * 40, vy:Math.sin(a) * 20, vz:R(10, 40), life:R(.3, .55), size:R(3, 5), shape:'kanok', col:GOLD}); }
    },
    slashHit(o){
      const big = o.big ? 1.6 : 1;
      add({x:o.x, y:o.y, life:.22, seed:Math.random(), draw(k){ glow(this.x, this.y, 18 * big * (1 - k * .5), GOLD, 1 - k);
        g.globalAlpha = 1 - k; g.strokeStyle = WHITE; g.lineWidth = 1.5; for (let i = 0; i < 4; i++){ const a = this.seed * 6 + i * Math.PI / 4 * 2, l = (8 + k * 14) * big; g.beginPath(); g.moveTo(sx(this.x + Math.cos(a) * l * .3), sy(this.y + Math.sin(a) * l * .3)); g.lineTo(sx(this.x + Math.cos(a) * l), sy(this.y + Math.sin(a) * l)); g.stroke(); } }});
      burst(o.x, o.y + 10, 10, 6 * big, {s0:30, s1:90, p:{size:R(1.5, 3), shape:'dot', col:GOLDL, life:.35, g:-120}});
    },
    /* a critical hit: an X of light slashes across the target, a bright core pops, two shockwaves race out, light spikes
       fan around it and golden sparks spray up — with a faint gold screen flash. Rapid crits (multi-hit skills, Auto)
       get the full show at most ~6 times a second and a small star the rest of the time. */
    critBurst(o){
      const full = !E._critT || T - E._critT > .16; if (full) E._critT = T;
      add({x:o.x, y:o.y, life:.3, draw(k){ g.globalAlpha = 1 - k; g.fillStyle = 'rgba(255,230,120,1)'; star(sx(this.x), sy(this.y), 12 + k * 14, 3 + k * 2, 4, k * 2); glow(this.x, this.y, 26, GOLD, .8 * (1 - k)); }});
      if (!full) return;
      const rot = R(-.5, .5);
      add({x:o.x, y:o.y, rot, life:.42, draw(k){ const X = sx(this.x), Y = sy(this.y), e = 1 - Math.pow(1 - Math.min(1, k * 3.2), 3), a = k < .5 ? 1 : 1 - (k - .5) / .5;
        g.save(); g.globalCompositeOperation = 'lighter'; g.translate(X, Y); g.rotate(this.rot); g.lineCap = 'round';
        for (const [d, del] of [[1, 0], [-1, .06]]){ const kk = Math.max(0, Math.min(1, (k - del) * 3.6)), L = 46 * (1 - Math.pow(1 - kk, 3));   // two slashes, one a beat after the other
          if (kk <= 0) continue; const w = 7 * (1 - k) + 1.2, ux = d * .74, uy = .67, nx = -uy, ny = ux;   // a tapered blade of light: thin at the tips, widest in the middle
          const L2 = L * 1.25; const blade = (hw, col, al) => { g.globalAlpha = al; g.fillStyle = col; g.beginPath(); g.moveTo(-L2 * ux, -L2 * uy); g.lineTo(nx * hw, ny * hw); g.lineTo(L2 * ux, L2 * uy); g.lineTo(-nx * hw, -ny * hw); g.closePath(); g.fill(); };
          blade(w * 2.6, 'rgba(255,140,20,1)', a * .45); blade(w * 1.5, 'rgba(255,215,90,1)', a * .8); blade(w * .7, '#fffdf2', a); }
        // light spikes
        g.globalAlpha = a * .8; g.fillStyle = 'rgba(255,225,130,1)';
        for (let i = 0; i < 12; i++){ const an = i / 12 * TAU + this.rot * 2, r1 = 10 + e * 26, r2 = r1 + (i % 2 ? 18 : 34) * (1 - k * .6); g.beginPath(); g.moveTo(Math.cos(an - .07) * r1, Math.sin(an - .07) * r1); g.lineTo(Math.cos(an) * r2, Math.sin(an) * r2); g.lineTo(Math.cos(an + .07) * r1, Math.sin(an + .07) * r1); g.fill(); }
        g.restore();
        // a hot core and two shockwaves
        glow(this.x, this.y, 30 * (1 - k * .5), 'rgba(255,225,150,1)', (1 - k) * .8);
        ring(this.x, this.y + 4, 12 + e * 62, 'rgba(255,215,120,1)', (1 - k) * .95, 3.5 * (1 - k) + 1, .5);
        ring(this.x, this.y + 4, 8 + Math.max(0, k - .12) * 120, 'rgba(255,255,255,1)', (1 - k) * .7, 2, .5); }});
      burst(o.x, o.y, 6, 18, {s0:80, s1:220, vz0:40, vz1:160, l0:.35, l1:.7, p:{g:-260, drag:2.5, size:R(1.6, 3.2), shape:'star', col:GOLDL}});
      burst(o.x, o.y, 6, 10, {s0:40, s1:120, vz0:20, vz1:80, l0:.25, l1:.45, p:{size:R(2, 3.5), shape:'dot', col:'rgba(255,250,230,1)'}});
      flash('rgba(255,215,120,1)', .14); shake(4.2);
    },
    quake(o){
      add({x:o.x, y:o.y, r:o.r, layer:'under', life:1.4, seed:Math.random(), draw(k){
        let s = this.seed * 1000; const rr = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
        g.globalAlpha = Math.min(1, (1 - k) * 1.6); g.strokeStyle = 'rgba(70,45,25,1)'; g.lineWidth = 1.6;
        for (let i = 0; i < 9; i++){ const a = i / 9 * TAU + rr() * .4; let px = this.x, py = this.y; g.beginPath(); g.moveTo(sx(px), sy(py)); for (let j = 1; j <= 4; j++){ const l = this.r * j / 4 * Math.min(1, k * 6); px = this.x + Math.cos(a + (rr() - .5) * .5) * l; py = this.y + Math.sin(a + (rr() - .5) * .5) * l * .45; g.lineTo(sx(px), sy(py)); } g.stroke(); }
        ring(this.x, this.y, this.r * Math.min(1, k * 3), 'rgba(255,220,150,1)', (1 - k * 3) * .9, 3);
      }});
      burst(o.x, o.y, 2, 22, {s0:40, s1:140, vz0:40, vz1:120, l0:.5, l1:.9, p:{g:-300, size:R(1.6, 3.4), shape:'rock', col:'rgba(140,110,80,1)', add:false}});
      for (let i = 0; i < N(14); i++){ const a = i / 14 * TAU; emit({x:o.x + Math.cos(a) * o.r * .8, y:o.y + Math.sin(a) * o.r * .36, z:2, vx:Math.cos(a) * 30, vy:Math.sin(a) * 14, vz:8, size:8, grow:20, life:R(.6, 1), shape:'smoke', col:'rgba(190,160,120,1)', add:false}); }
    },
    charge(o){
      if (!isFinite(o.x2) || !isFinite(o.y2)){ o = {...o, x2:isFinite(o.tx) ? o.tx : o.x + (o.dir < 0 ? -40 : 40), y2:isFinite(o.ty) ? o.ty : o.y}; }   // a dash shown without an end point (e.g. by a clone)
      if (!isFinite(o.x) || !isFinite(o.y)) return;
      add({x:o.x, y:o.y, x2:o.x2, y2:o.y2, life:.45, draw(k){ g.globalAlpha = 1 - k; const w = 10 * (1 - k);
        const gr = g.createLinearGradient(sx(this.x), sy(this.y), sx(this.x2), sy(this.y2)); gr.addColorStop(0, 'rgba(255,210,110,0)'); gr.addColorStop(1, 'rgba(255,240,190,.9)');
        g.strokeStyle = gr; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx(this.x), sy(this.y - 16)); g.lineTo(sx(this.x2), sy(this.y2 - 16)); g.stroke(); }});
      for (let i = 0; i < N(12); i++){ const k = Math.random(); emit({x:o.x + (o.x2 - o.x) * k, y:o.y + (o.y2 - o.y) * k, z:2, vz:R(5, 20), vx:R(-15, 15), vy:R(-8, 8), size:6, grow:12, life:R(.4, .7), shape:'smoke', col:'rgba(200,175,140,1)', add:false}); }
    },
    provoke(o){
      const m = o.m; if (!m) return;
      add({m, life:1, draw(k){ const x = this.m.x, y = this.m.y - MOB_H[this.m.type] - 14 - k * 6; glow(x, y, 14, RED, (1 - k) * .9); g.globalAlpha = 1 - k; g.fillStyle = 'rgba(255,240,220,1)'; g.font = '700 14px Mali, sans-serif'; g.textAlign = 'center'; g.fillText('!', sx(x), sy(y) + 5); ring(this.m.x, this.m.y, this.m.def.r + 4 + k * 16, 'rgba(255,90,60,1)', 1 - k, 2); }});
      add({x:o.x, y:o.y, life:.5, draw(k){ ring(this.x, this.y, 10 + k * 40, 'rgba(255,120,80,1)', 1 - k, 2.5); }});
    },
    castCircle(o){
      const col = ELC[o.elem || 'neutral'];
      add({life:o.total + .25, layer:'under', col, draw(k, f){ if (!P.cast && f.t < f.life - .25) f.t = f.life - .25; const a = Math.min(1, f.t * 4) * (f.t > f.life - .25 ? (f.life - f.t) / .25 : 1);
        yantra(P.x, P.y, 26, this.col, a * .9, T * 1.4); yantra(P.x, P.y, 16, 'rgba(255,240,200,1)', a * .6, -T * 2.2); glow(P.x, P.y - 4, 26, this.col, a * .35); }});
      const el = o.elem || 'neutral', shp = el === 'fire' ? 'flame' : el === 'water' ? 'flake' : el === 'wind' ? 'line' : 'dot';
      for (let i = 0; i < N(Math.round(o.total * 18)); i++) later(i / 18, () => { if (!P.cast) return;
        emit({x:P.x + R(-22, 22), y:P.y + R(-8, 8), z:0, vz:el === 'water' ? R(8, 20) : R(20, 50), vx:el === 'wind' ? R(-30, 30) : 0, life:R(.5, .9), size:el === 'fire' ? R(1.8, 3) : el === 'water' ? R(1.6, 2.6) : R(1.2, 2.2), shape:shp, col:el === 'fire' ? 'rgba(235,85,25,1)' : col, add:el !== 'water' && el !== 'fire', vr:R(-3, 3)}); });
    },
    fireHit(o){
      add({x:o.x, y:o.y, life:.4, draw(k){ glow(this.x, this.y, 10 + k * 22, FIRE, (1 - k) * 1.1); ring(this.x, this.y + 10, 6 + k * 18, 'rgba(255,170,80,1)', 1 - k, 2); }});
      add({x:o.x, y:o.y + 10, life:1.2, layer:'under', draw(k){ disc(this.x, this.y, 12, 'rgba(40,20,10,1)', .35 * (1 - k)); disc(this.x, this.y, 6, 'rgba(255,120,40,1)', .4 * (1 - k * 1.5)); }});
      burst(o.x, o.y + 10, 6, 8, {s0:10, s1:50, vz0:30, vz1:70, l0:.3, l1:.55, p:{g:-40, size:R(2.4, 4), shape:'flame', col:'rgba(230,75,25,1)', add:false}});
      burst(o.x, o.y + 10, 10, 10, {s0:30, s1:110, vz0:20, vz1:80, p:{g:-160, size:R(1.5, 3), shape:'dot', col:'rgba(255,190,90,1)'}});
      burst(o.x, o.y + 10, 6, 4, {s0:5, s1:20, vz0:15, vz1:30, p:{size:5, grow:12, shape:'smoke', col:'rgba(90,70,60,1)', add:false, life:.8}});
    },
    iceHit(o){
      add({x:o.x, y:o.y, life:.35, draw(k){ glow(this.x, this.y, 8 + k * 18, ICE, 1 - k); }});
      // crystals burst out of the ground under the target, a frost ring spreads
      add({x:o.x, y:o.y + 10, life:.9, layer:'under', draw(k){ ring(this.x, this.y, 6 + k * 20, 'rgba(200,240,255,1)', (1 - k) * .9, 1.6); disc(this.x, this.y, 14, 'rgba(180,230,255,1)', .25 * (1 - k)); }});
      add({x:o.x, y:o.y + 10, life:.7, seed:Math.random() * 9, draw(k){ const a = Math.min(1, k * 6) * (1 - k);
        for (let i = 0; i < 5; i++){ const ang = this.seed + i * 1.26, r = 5 + (i % 2) * 3, h = (7 + (i % 3) * 3) * Math.min(1, k * 5);
          const bx = sx(this.x + Math.cos(ang) * r), by = sy(this.y + Math.sin(ang) * r * .5);
          g.globalAlpha = a; g.fillStyle = 'rgba(150,215,250,1)'; g.beginPath(); g.moveTo(bx - 2, by); g.lineTo(bx, by - h); g.lineTo(bx + 2, by); g.fill();
          g.fillStyle = 'rgba(240,252,255,1)'; g.beginPath(); g.moveTo(bx - .6, by); g.lineTo(bx, by - h + 1); g.lineTo(bx + 1, by); g.fill(); } }});
      burst(o.x, o.y + 10, 10, 8, {s0:10, s1:50, vz0:10, vz1:40, l0:.6, l1:1, p:{g:30, size:R(1.6, 2.6), shape:'flake', col:'rgba(235,250,255,1)', add:false, vr:3}});
      burst(o.x, o.y + 10, 10, 9, {s0:30, s1:100, vz0:30, vz1:90, p:{g:-260, size:R(2, 3.5), shape:'shard', col:'rgba(210,245,255,1)', add:false}});
      burst(o.x, o.y + 10, 8, 6, {s0:5, s1:20, p:{size:R(1, 2), shape:'star', col:WHITE, life:.6}});
    },
    /* electrocuted (Shock): crackling arcs crawl over the body, a blue pulse lights it from inside, sparks drip
       off; when it wears off a puff of scorched smoke. Bosses only get the visual (they ignore statuses). */
    shocked(o){ const m = o.m; if (!m) return; m.shockEnd = T + (m.def.boss ? .9 : 2);
      if (m.shockFx) return; m.shockFx = 1;
      add({m, life:99, seed:0, nt:0, draw(k, f){ const M_ = this.m, h = MOB_H[M_.type] || 30;
        if (M_.dead || T > M_.shockEnd){ f.t = f.life; M_.shockFx = 0; burst(M_.x, M_.y, h * .6, 5, {s0:5, s1:20, vz0:10, vz1:25, p:{size:4, grow:10, shape:'smoke', col:'rgba(70,70,80,1)', add:false, life:.9}}); return; }
        if (T > this.nt){ this.nt = T + .06; this.seed = Math.random() * 1000; }
        const cx0 = M_.x, cy0 = M_.y - h * .5, rx = Math.max(8, M_.def.r * .9), ry = h * .5, pulse = .55 + Math.sin(T * 40) * .25;
        g.save(); g.globalCompositeOperation = 'lighter';
        glow(cx0, cy0, Math.max(rx, ry) * 1.3, 'rgba(120,180,255,1)', .45 * pulse);
        let sd = this.seed; const rnd = () => { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; };
        for (let i = 0; i < 3; i++){ const a0 = rnd() * TAU, a1 = a0 + 1.5 + rnd() * 2;
          bolt(cx0 + Math.cos(a0) * rx, cy0 + Math.sin(a0) * ry, cx0 + Math.cos(a1) * rx * .9, cy0 + Math.sin(a1) * ry * .9, i ? 'rgba(170,220,255,1)' : 'rgba(240,250,255,1)', i ? 1 : 1.6, rnd(), 0, 5); }
        g.restore();
        if (Math.random() < .35 * lvlMul()) emit({x:cx0 + R(-rx, rx), y:M_.y, z:h * R(.2, .9), vx:R(-20, 20), vz:R(10, 40), g:-200, life:R(.25, .45), size:R(1, 1.8), shape:'dot', col:'rgba(200,235,255,1)'});
      }}); },
    frozen(o){ const m = o.m; if (!m || m.frozenFx) return; m.frozenFx = 1;
      add({m, life:99, draw(k, f){ const s = this.m.st; if (this.m.dead || !s || !(s.freeze > 0)){ f.t = f.life; this.m.frozenFx = 0; burst(this.m.x, this.m.y, 8, 8, {s0:20, s1:70, vz0:20, vz1:70, p:{g:-260, size:2.5, shape:'shard', col:'rgba(210,245,255,1)', add:false}}); return; }
        const r = this.m.def.r + 3, h = MOB_H[this.m.type] + 4; g.globalAlpha = .55; g.fillStyle = 'rgba(170,225,255,1)'; g.strokeStyle = 'rgba(240,252,255,1)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(sx(this.m.x - r), sy(this.m.y)); g.lineTo(sx(this.m.x - r * .8), sy(this.m.y - h * .8)); g.lineTo(sx(this.m.x - r * .1), sy(this.m.y - h)); g.lineTo(sx(this.m.x + r * .7), sy(this.m.y - h * .85)); g.lineTo(sx(this.m.x + r), sy(this.m.y)); g.closePath(); g.fill(); g.globalAlpha = .9; g.stroke(); }}); },
    thunder(o){
      add({x:o.x, y:o.y, r:o.r, life:.6, layer:'under', draw(k){ yantra(this.x, this.y, this.r, WIND, (1 - k) * .8, k * 3); }});
      for (let i = 0; i < 4; i++) later(.04 + i * .06, () => add({x:o.x + R(-o.r, o.r) * .7, y:o.y + R(-o.r, o.r) * .3, life:.28, seed:Math.random(), draw(k){ g.globalAlpha = 1 - k; bolt(this.x + 6, this.y - 140, this.x, this.y, 'rgba(170,220,255,1)', 1.6, this.seed); glow(this.x, this.y, 22, 'rgba(170,220,255,1)', 1 - k); }}));
      burst(o.x, o.y, 4, 14, {s0:40, s1:130, vz0:10, vz1:50, p:{size:1.6, shape:'dot', col:'rgba(200,235,255,1)', life:.4}});
      flash('rgba(200,230,255,1)', .25);
    },
    barrier(o){ add({life:.6, draw(k){ ring(P.x, P.y - 18, 14 + k * 24, 'rgba(140,200,255,1)', 1 - k, 2.5, .9); glow(P.x, P.y - 18, 30, 'rgba(120,180,255,1)', .6 * (1 - k)); }}); burst(o.x, o.y, 20, 12, {s0:20, s1:60, p:{size:2, shape:'star', col:'rgba(190,225,255,1)', life:.7}}); },
    barrierHit(){ add({life:.3, draw(k){ ring(P.x, P.y - 18, 22 + k * 6, 'rgba(200,230,255,1)', (1 - k) * .9, 2, .95); }}); },
    blink(o){
      for (const [x, y] of [[o.x, o.y], [o.x2, o.y2]]){
        add({x, y, life:.5, draw(k){ g.save(); g.translate(sx(this.x), sy(this.y - 16)); g.globalAlpha = 1 - k; g.strokeStyle = 'rgba(190,255,225,1)'; g.lineWidth = 1.5;
          for (let i = 0; i < 3; i++){ g.beginPath(); g.ellipse(0, 0, 8 + k * 14 + i * 4, (8 + k * 14 + i * 4) * .5, k * 4 + i, 0, Math.PI * 1.3); g.stroke(); } g.restore(); }});
        burst(x, y, 16, 10, {s0:30, s1:80, vz0:10, vz1:40, p:{size:R(2.5, 4), shape:'leaf', col:'rgba(170,240,200,1)', add:false, life:.6, vr:6}});
      }
      add({x:o.x, y:o.y, x2:o.x2, y2:o.y2, life:.25, draw(k){ g.globalAlpha = (1 - k) * .8; g.strokeStyle = 'rgba(200,255,230,1)'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx(this.x), sy(this.y - 16)); g.lineTo(sx(this.x2), sy(this.y2 - 16)); g.stroke(); }});
    },
    /* arriving on a new map (gate travel or shrine warp): the screen opens from light, a beam lands on the hero,
       a double yantra blooms on the ground, a soft shockwave rolls out and motes spiral up */
    mapArrive(o){ const gold = !!o.gold, C = gold ? GOLD : 'rgba(110,210,255,1)', CL = gold ? GOLDL : 'rgba(215,248,255,1)', X0 = o.x, Y0 = o.y;
      add({x:X0, y:Y0, life:1.6, layer:'under', draw(k, f){ const t = f.t, a = Math.min(1, t * 4) * Math.min(1, (1.6 - t) * 1.6), R1 = 18 + Math.min(1, t * 2.2) * 34;
        disc(this.x, this.y, R1 * 1.1, C, .2 * a); yantra(this.x, this.y, R1, C, a, t * 1.6); yantra(this.x, this.y, R1 * .62, CL, a * .85, -t * 2.4);
        ring(this.x, this.y, R1 * 1.18, CL, a * .7, 1.6); }});
      // the beam: drops from the sky in a blink, holds, then thins away
      add({x:X0, y:Y0, life:1.25, draw(k, f){ const t = f.t, H = 240, drop = Math.min(1, t / .16), a = (t < .16 ? 1 : Math.max(0, 1 - (t - .16) / 1.09)), X = sx(this.x), Y = sy(this.y), top = Y - H, bot = top + H * drop;
        const w = 22 * (1 - Math.max(0, t - .3) * .55);
        let gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.6, CL); gr.addColorStop(1, C);
        g.globalAlpha = a * .38; g.fillStyle = gr; g.fillRect(X - w, top, w * 2, bot - top);
        gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,1)');
        g.globalAlpha = a * .45; g.fillStyle = gr; g.fillRect(X - w * .28, top, w * .56, bot - top);
        if (drop >= 1){ glow(this.x, this.y - 14, 40 * a + 10, C, a * .7); glow(this.x, this.y - 8, 20, 'rgba(255,255,255,1)', a * .35); } }});
      // landing: a flash, two shockwave rings across the ground, dust of light
      later(.16, () => { flash(CL, .22); shake(2);
        for (let j = 0; j < 2; j++) later(j * .1, () => add({x:X0, y:Y0, life:.65, layer:'under', draw(k){ ring(this.x, this.y, 12 + k * 90, CL, (1 - k) * .9, 4 - k * 3); ring(this.x, this.y, 8 + k * 70, C, (1 - k) * .5, 1.5); }}));
        burst(X0, Y0, 14, 22, {s0:30, s1:110, vz0:40, vz1:150, l0:.6, l1:1.1, p:{g:-110, size:R(1.6, 3.2), shape:'star', col:CL}});
        burst(X0, Y0, 8, 10, {s0:50, s1:90, vz0:4, vz1:18, l0:.4, l1:.7, p:{size:5, grow:12, shape:'smoke', col:'rgba(240,250,255,1)'}}); });
      // motes spiralling up around the hero
      add({x:X0, y:Y0, life:1.4, draw(k, f){ const n = 12; for (let i = 0; i < n; i++){ const q = (f.t * .9 + i / n) % 1, an = q * TAU * 1.6 + i * 2.1, r = 16 - q * 8;
        glow(this.x + Math.cos(an) * r, this.y + Math.sin(an) * r * .45 - q * 70, 4, i % 3 ? CL : C, Math.sin(q * Math.PI) * (1 - k)); } }});
    },
    leaf(o){ E.blink(o); },
    bowFlash(o){ const a = Math.atan2(o.ty - o.y, o.tx - o.x); add({x:o.x + Math.cos(a) * 10, y:o.y + Math.sin(a) * 6 - 20, life:.18, draw(k){ glow(this.x, this.y, 12, GOLDL, 1 - k); }}); },
    arrowHit(o){ const el = o.elem || 'neutral'; if (el !== 'neutral'){ const hit = {fire:'fireHit', water:'iceHit', holy:'holyHit', shadow:'poisonHit'}[el];
        if (hit && E[hit] && el !== 'shadow') E[hit]({x:o.x, y:o.y}); else add({x:o.x, y:o.y, life:.35, draw(k){ glow(this.x, this.y, 8 + k * 18, ELC[el], 1 - k); ring(this.x, this.y + 8, 4 + k * 14, ELC[el], 1 - k, 1.6); }});
        if (el === 'wind') burst(o.x, o.y + 10, 10, 6, {s0:40, s1:110, vz0:10, vz1:40, p:{size:R(2, 3), shape:'line', col:WIND, life:.35}});
        if (el === 'earth') burst(o.x, o.y + 10, 8, 6, {s0:30, s1:90, vz0:30, vz1:80, p:{g:-300, size:R(1.6, 2.6), shape:'rock', col:'rgba(150,110,70,1)', add:false}});
        if (el === 'shadow') burst(o.x, o.y + 10, 8, 5, {s0:10, s1:30, vz0:10, vz1:30, p:{size:4, grow:8, shape:'smoke', col:'rgba(90,50,130,1)', add:false, life:.7}}); }
      burst(o.x, o.y + 10, 10, 5, {s0:20, s1:70, vz0:20, vz1:50, p:{g:-200, size:R(1.2, 2), shape:'line', col:'rgba(230,210,170,1)', add:false, life:.4}}); add({x:o.x, y:o.y, life:.18, draw(k){ glow(this.x, this.y, 10, WHITE, 1 - k); }}); },
    arrowrain(o){
      add({x:o.x, y:o.y, r:o.r, life:1.2, layer:'under', draw(k){ ring(this.x, this.y, this.r, 'rgba(255,220,150,1)', Math.min(1, k * 5) * (1 - k), 1.5); disc(this.x, this.y, this.r, 'rgba(255,200,120,1)', .12 * (1 - k)); }});
      for (let i = 0; i < N(26); i++){ const a = R(0, TAU), d = Math.sqrt(Math.random()) * o.r, tx = o.x + Math.cos(a) * d, ty = o.y + Math.sin(a) * d * .5, delay = .1 + R(0, o.hits * o.every + .2);
        later(delay, () => { add({x:tx, y:ty, life:.28, draw(k){ g.globalAlpha = 1; const h = 120 * (1 - k); g.strokeStyle = 'rgba(245,235,210,1)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(sx(this.x - 8 - h * .15), sy(this.y - h - 10)); g.lineTo(sx(this.x - h * .15), sy(this.y - h)); g.stroke(); glow(this.x - h * .15, this.y - h, 4, GOLDL, .8); }});
          later(.28, () => { burst(tx, ty, 2, 3, {s0:10, s1:40, vz0:10, vz1:30, p:{g:-200, size:1.4, shape:'rock', col:'rgba(160,140,110,1)', add:false, life:.35}}); stuck.push({x:tx, y:ty, t:2.5}); }); }); }
    },
    trapSet(o){ burst(o.x, o.y, 2, 6, {s0:10, s1:30, vz0:5, vz1:20, p:{size:5, grow:8, shape:'smoke', col:'rgba(170,150,120,1)', add:false, life:.5}}); },
    trapSnap(o){
      add({x:o.x, y:o.y, life:.5, layer:'under', draw(k){ g.globalAlpha = 1 - k; g.strokeStyle = 'rgba(120,90,50,1)'; g.lineWidth = 2;
        for (let i = 0; i < 8; i++){ const a = i / 8 * TAU, l = 6 + 12 * Math.min(1, k * 5); g.beginPath(); g.moveTo(sx(this.x + Math.cos(a) * 3), sy(this.y + Math.sin(a) * 1.5)); g.lineTo(sx(this.x + Math.cos(a) * l * .5), sy(this.y + Math.sin(a) * l * .25 - l)); g.stroke(); } }});
      burst(o.x, o.y, 6, 10, {s0:30, s1:90, vz0:30, vz1:90, p:{g:-280, size:R(1.5, 2.5), shape:'line', col:'rgba(190,160,90,1)', add:false}}); shake(2);
    },
    petcall(o){ for (let i = 0; i < N(6); i++) emit({x:o.x + R(-8, 8), y:o.y, z:R(16, 26), vz:R(18, 30), vx:R(-12, 12), life:1, size:5, shape:'note', col:'rgba(180,255,190,1)', add:false}); add({x:o.x, y:o.y, life:.6, draw(k){ ring(this.x, this.y, 6 + k * 26, 'rgba(160,255,180,1)', 1 - k, 2); }}); },
    earthsplit(o){
      add({x:o.x, y:o.y, ux:o.ux, uy:o.uy, len:o.len, life:1.5, layer:'under', seed:Math.random(), draw(k){
        let s = this.seed * 1000; const rr = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - .5; };
        const L0 = this.len * Math.min(1, k * 5), a = Math.min(1, (1 - k) * 1.5), nx = -this.uy, ny = this.ux;
        g.globalAlpha = a; g.lineCap = 'round';
        const pts = []; for (let i = 0; i <= 12; i++){ const d = L0 * i / 12, j = rr() * 6; pts.push([this.x + this.ux * d + nx * j, this.y + this.uy * d + ny * j * .5]); }
        g.strokeStyle = 'rgba(60,35,20,1)'; g.lineWidth = 6; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(sx(p[0]), sy(p[1])) : g.moveTo(sx(p[0]), sy(p[1])))); g.stroke();
        g.strokeStyle = `rgba(255,${150 + 60 * (1 - k) | 0},60,1)`; g.lineWidth = 2; g.stroke();
      }});
      for (let i = 1; i <= 7; i++) later(i * .04, () => { const d = o.len * i / 7, x = o.x + o.ux * d, y = o.y + o.uy * d;
        add({x, y, life:.7, draw(k){ g.globalAlpha = Math.min(1, (1 - k) * 2); g.fillStyle = 'rgba(120,90,60,1)'; g.strokeStyle = 'rgba(60,40,25,1)'; g.lineWidth = 1; const h = 14 * Math.sin(Math.min(1, k * 3) * Math.PI * .5) * (1 - k * .6);
          for (const dx of [-5, 0, 5]){ g.beginPath(); g.moveTo(sx(this.x + dx - 3), sy(this.y)); g.lineTo(sx(this.x + dx), sy(this.y - h - (dx ? 0 : 5))); g.lineTo(sx(this.x + dx + 3), sy(this.y)); g.closePath(); g.fill(); g.stroke(); } }});
        burst(x, y, 2, 4, {s0:20, s1:60, vz0:30, vz1:90, p:{g:-300, size:R(1.5, 3), shape:'rock', col:'rgba(140,110,80,1)', add:false}}); glowAt(x, y - 4, 14, FIRE, .25); });
    },
    goldshield(o){ add({life:.8, draw(k){ ring(P.x, P.y - 18, 10 + k * 34, GOLDL, 1 - k, 3, .9); glow(P.x, P.y - 18, 40, GOLD, (1 - k) * .7); }}); burst(o.x, o.y, 20, 18, {s0:30, s1:90, p:{size:R(3, 5), shape:'kanok', col:GOLD, life:.8}}); },
    roar(o){
      for (let i = 0; i < 3; i++) later(i * .12, () => add({x:o.x, y:o.y, r:o.r, life:.6, draw(k){ ring(this.x, this.y, this.r * k * 1.1, 'rgba(255,200,140,1)', (1 - k) * .9, 4 - i); ring(this.x, this.y - 20, this.r * .5 * k, 'rgba(255,230,190,1)', (1 - k) * .5, 2, 1); }}));
      burst(o.x, o.y, 2, 20, {s0:60, s1:160, vz0:5, vz1:20, p:{size:7, grow:16, shape:'smoke', col:'rgba(200,170,130,1)', add:false, life:.7}});
      flash('rgba(255,210,150,1)', .18);
    },
    bladestorm(o){
      add({life:o.hits * o.every + .1, r:o.r, draw(k, f){ const n = 6, a0 = f.t * 14;
        for (let i = 0; i < n; i++){ const a = a0 + i / n * TAU, x = P.x + Math.cos(a) * this.r * .6, y = P.y + Math.sin(a) * this.r * .28;
          g.save(); g.translate(sx(x), sy(y - 16)); g.rotate(a + Math.PI / 2); g.globalAlpha = .9; g.fillStyle = 'rgba(235,245,255,1)'; g.fillRect(-1, -9, 2, 18); g.fillStyle = GOLD; g.fillRect(-3, 8, 6, 2); g.restore(); }
        g.save(); g.translate(sx(P.x), sy(P.y - 14)); g.scale(1, .45); g.globalAlpha = .5; g.strokeStyle = 'rgba(255,240,200,1)'; g.lineWidth = 3;
        for (let i = 0; i < 3; i++){ g.beginPath(); g.arc(0, 0, this.r * (.5 + i * .18), a0 + i, a0 + i + 2.2); g.stroke(); } g.restore();
        if (Math.random() < .5 * lvlMul()) emit({x:P.x + R(-this.r, this.r) * .6, y:P.y + R(-10, 10), z:2, vz:R(5, 20), size:6, grow:10, life:.5, shape:'smoke', col:'rgba(210,190,160,1)', add:false}); }});
    },
    laststand(o){ add({x:o.x, y:o.y, life:1.2, draw(k){ g.globalAlpha = (1 - k) * .8; const w = 22 * (1 - k * .5); const gr = g.createLinearGradient(0, sy(this.y - 120), 0, sy(this.y)); gr.addColorStop(0, 'rgba(255,230,140,0)'); gr.addColorStop(1, 'rgba(255,230,140,.9)'); g.fillStyle = gr; g.fillRect(sx(this.x - w / 2), sy(this.y - 120), w, 120); }}); burst(o.x, o.y, 10, 24, {s0:20, s1:90, vz0:40, vz1:110, p:{size:R(3, 5), shape:'kanok', col:GOLD, life:1}}); shake(3); },
    meteor(o){
      add({x:o.x, y:o.y, r:o.r, life:.55 + o.hits * o.every + .4, layer:'under', draw(k){ yantra(this.x, this.y, this.r, 'rgba(255,140,60,1)', Math.min(1, k * 4) * (1 - k) * 1.2, k * 2); disc(this.x, this.y, this.r, 'rgba(255,90,30,1)', .12 * (1 - k)); }});
      for (let i = 0; i < o.hits; i++){
        const tx = o.x + R(-o.r, o.r) * .6, ty = o.y + R(-o.r, o.r) * .3, t0 = .55 + i * o.every - .45;
        later(Math.max(0, t0), () => {
          add({x:tx, y:ty, life:.45, draw(k){ const h = 200 * (1 - k), x = this.x - h * .55, y = this.y - h;
            g.globalAlpha = 1; const gr = g.createLinearGradient(sx(x - 50), sy(y - 90), sx(x), sy(y)); gr.addColorStop(0, 'rgba(255,120,30,0)'); gr.addColorStop(1, 'rgba(255,200,120,.95)');
            g.strokeStyle = gr; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx(x - 50), sy(y - 90)); g.lineTo(sx(x), sy(y)); g.stroke();
            glow(x, y, 16, FIRE, 1); g.globalAlpha = 1; g.fillStyle = 'rgba(90,50,35,1)'; g.beginPath(); g.arc(sx(x), sy(y), 4.5, 0, TAU); g.fill();
            if (Math.random() < .7 * lvlMul()) emit({x:x + R(-3, 3), y:y + R(-3, 3), vz:R(-10, 10), vx:R(-10, 10), life:.5, size:R(1.5, 2.5), shape:'dot', col:'rgba(255,170,80,1)'}); }});
          later(.45, () => { E.boom({x:tx, y:ty, big:true}); E.groundFire({x:tx, y:ty, r:R(18, 26), life:R(3.2, 4.2)}); }); });
      }
    },
    orbHit(o){ const col = ELC[o.elem] && o.elem !== 'neutral' ? ELC[o.elem] : 'rgba(170,140,255,1)'; add({x:o.x, y:o.y, life:.3, draw(k){ glow(this.x, this.y, 6 + k * 16, col, 1 - k); ring(this.x, this.y + 8, 3 + k * 12, col, 1 - k, 1.4); }});
      burst(o.x, o.y, 10, 6, {s0:20, s1:60, vz0:10, vz1:40, p:{size:R(1.4, 2.2), shape:'star', col, life:.4}}); },
    manaRestore(o){ add({x:o.x, y:o.y, life:1.4, draw(k){ yantra(P.x, P.y, 22 + k * 8, 'rgba(120,180,255,1)', Math.sin(k * Math.PI), k * 3); glow(P.x, P.y - 24, 26, 'rgba(110,170,255,1)', .5 * (1 - k)); }});
      for (let i = 0; i < N(22); i++) later(i * .04, () => { const a = R(0, TAU); emit({x:P.x + Math.cos(a) * 26, y:P.y + Math.sin(a) * 10, z:R(0, 6), vx:-Math.cos(a) * 18, vy:-Math.sin(a) * 7, vz:R(20, 40), life:R(.6, 1), size:R(1.6, 2.6), shape:'star', col:'rgba(150,200,255,1)'}); }); },
    /* ---------- monsters & bosses ---------- */
    // a red danger zone that fills up until the hit lands
    warnCircle(o){ add({x:o.x, y:o.y, r:o.r, life:o.t, layer:'under', draw(k){ disc(this.x, this.y, this.r, 'rgba(220,40,30,1)', .16 + k * .14); disc(this.x, this.y, this.r * k, 'rgba(255,70,40,1)', .22);
      ring(this.x, this.y, this.r, 'rgba(255,90,60,1)', .7 + Math.sin(T * 20) * .2, 1.6); }}); },
    warnLine(o){ add({...o, life:o.t, layer:'under', draw(k){ const px = -this.uy, py = this.ux, w = this.w / 2, x0 = this.x, y0 = this.y, x1 = x0 + this.ux * this.len, y1 = y0 + this.uy * this.len;
      const quad = (l, a) => { g.globalAlpha = a; g.beginPath(); g.moveTo(sx(x0 + px * w), sy(y0 + py * w * .5)); g.lineTo(sx(x0 + this.ux * l + px * w), sy(y0 + this.uy * l + py * w * .5)); g.lineTo(sx(x0 + this.ux * l - px * w), sy(y0 + this.uy * l - py * w * .5)); g.lineTo(sx(x0 - px * w), sy(y0 - py * w * .5)); g.closePath(); g.fill(); };
      g.fillStyle = 'rgba(220,40,30,1)'; quad(this.len, .18); g.fillStyle = 'rgba(255,80,50,1)'; quad(this.len * k, .25); }}); },
    mobShot(o){ const col = {fire:FIRE, ice:ICE, holy:GOLDL, dark:VIOLET, bolt:'rgba(180,220,255,1)', dart:POISON, arrow:GOLD}[o.kind] || VIOLET;
      add({...o, life:o.t, draw(k){ const x = this.x + (this.tx - this.x) * k, y = this.y + (this.ty - this.y) * k - Math.sin(k * Math.PI) * 10;
        glow(x, y, 9, col, 1); glow(x, y, 4, WHITE, .9); if (Math.random() < .5 * lvlMul()) emit({x, y:y + 10, z:10, vz:R(-5, 5), life:.3, size:R(1, 2), shape:'dot', col}); }});
      later(o.t, () => add({x:o.tx, y:o.ty, life:.3, draw(k){ glow(this.x, this.y, 8 + k * 14, col, 1 - k); }})); },
    bossArrive(o){ E.jobChange({x:o.x, y:o.y}); flash('rgba(255,80,60,1)', .25); shake(5);
      add({x:o.x, y:o.y, life:2, layer:'under', draw(k){ yantra(this.x, this.y, 60 + k * 30, 'rgba(255,90,60,1)', (1 - k), k * 3); }}); },
    earthsplitBoom(o){ add({x:o.x, y:o.y, r:o.r, life:.6, layer:'under', draw(k){ ring(this.x, this.y, this.r * (.3 + k * .7), 'rgba(255,220,170,1)', 1 - k, 3); disc(this.x, this.y, this.r * k, 'rgba(120,90,60,1)', .3 * (1 - k)); }});
      burst(o.x, o.y, 4, 22, {s0:60, s1:200, vz0:40, vz1:140, p:{g:-320, size:R(2, 4), shape:'rock', col:'rgba(110,85,60,1)', add:false}});
      burst(o.x, o.y, 6, 10, {s0:20, s1:80, vz0:10, vz1:30, p:{size:8, grow:18, shape:'smoke', col:'rgba(150,130,110,1)', add:false, life:1}}); },
    bossWave(o){ const col = ELC[o.elem] || VIOLET;
      add({...o, life:.55, draw(k){ const l = this.len * Math.min(1, k * 2.2), x = this.x + this.ux * l, y = this.y + this.uy * l;
        glow(x, y - 12, 26, col, 1 - k * .6); for (let i = 0; i < 6; i++){ const t = l - i * 14; if (t < 0) break; glow(this.x + this.ux * t, this.y + this.uy * t - 12, 18 - i * 2, col, (1 - k) * (1 - i / 6)); } }}); },
    bossSummon(o){ add({x:o.x, y:o.y, life:.8, layer:'under', draw(k){ yantra(this.x, this.y, 22, 'rgba(190,120,255,1)', 1 - k, k * 4); }});
      burst(o.x, o.y, 4, 10, {s0:10, s1:40, vz0:30, vz1:70, p:{size:R(1.5, 2.5), shape:'star', col:VIOLET, life:.8}}); },
    bossField(o){ const col = o.elem === 'fire' ? 'rgba(255,110,40,1)' : o.elem === 'water' ? 'rgba(90,170,255,1)' : o.elem === 'holy' ? GOLDL : o.elem === 'earth' ? 'rgba(160,200,80,1)' : 'rgba(160,90,220,1)';
      add({x:o.x, y:o.y, r:o.r, life:o.life, layer:'under', draw(k){ const a = Math.min(1, k * 8) * (k > .85 ? (1 - k) / .15 : 1);
        disc(this.x, this.y, this.r, col, .3 * a); ring(this.x, this.y, this.r, col, .8 * a, 1.6); ring(this.x, this.y, this.r * (.5 + (T * .6 % 1) * .5), col, .5 * a, 1); }});
      for (let i = 0; i < N(o.life * 10); i++) later(i / 10, () => emit({x:o.x + R(-o.r, o.r) * .8, y:o.y + R(-o.r, o.r) * .35, z:0, vz:R(10, 25), life:R(.6, 1), size:R(2, 4), grow:3, shape:'bubble', col, add:false})); },
    /* a raging monster: one red flash and shake when it starts, then (once per monster, never stacked) a soft red glow on
       the ground under it and a few embers rising — only while it is actually raging. Nothing is drawn over the sprite
       itself any more: stacked bright glows on top used to wash the boss out into a yellow-red blob. */
    enrage(o){ const m = o.m; if (!m) return; flash('rgba(255,40,30,1)', .18); shake(5);
      if (m._enrFx && !m._enrFx.done) return; const fxo = m._enrFx = {done:false};
      add({m, layer:'under', life:9999, draw(k, f){ const mm = this.m, on = mm.enraged || (mm.fz && mm.fz.berserk > 0);
        if (mm.dead || !mobs.includes(mm)){ f.t = f.life; fxo.done = true; return; } if (!on) return;
        const r = (mm.def.r || 16) * 1.5; g.save(); g.globalCompositeOperation = 'lighter';
        glow(mm.x, mm.y - 2, r, 'rgba(255,50,30,1)', .28 + Math.sin(T * 7) * .08); g.restore();
        if (Math.random() < .25 * lvlMul()) emit({x:mm.x + R(-1, 1) * r * .6, y:mm.y, z:R(0, MOB_H[mm.type] * .6), vz:R(20, 45), life:.55, size:R(1.6, 2.6), shape:'flame', col:'rgba(230,70,30,1)', add:false}); }}); },
    stunStars(){ add({life:1.4, draw(k){ for (let i = 0; i < 3; i++){ const a = T * 6 + i * 2.1; g.fillStyle = 'rgba(255,230,120,1)'; g.globalAlpha = 1 - k * .5; star(sx(P.x + Math.cos(a) * 9), sy(P.y - 46 + Math.sin(a) * 3), 3, 1.2, 4, a); } }}); },
    dustPuff(o){ emit({x:o.x + R(-8, 8), y:o.y, z:2, vx:R(-15, 15), vz:R(5, 15), life:.6, size:5, grow:10, shape:'smoke', col:'rgba(170,150,120,1)', add:false}); },
    /* burning ground: a glowing scorch with flames licking up from it, smoke and drifting embers */
    groundFire(o){
      const f = add({x:o.x, y:o.y, r:o.r, life:o.life, layer:'under', seed:Math.random() * 9, draw(k){ const a = Math.min(1, k * 8) * (k > .75 ? (1 - k) / .25 : 1);
        disc(this.x, this.y, this.r * 1.2, 'rgba(30,18,12,1)', .5 * a); disc(this.x, this.y, this.r * .9, 'rgba(120,40,15,1)', .45 * a);
        g.save(); g.globalCompositeOperation = 'lighter'; disc(this.x, this.y, this.r * .7, 'rgba(255,110,30,1)', (.35 + Math.sin(T * 9 + this.seed) * .1) * a);
        glow(this.x, this.y - 6, this.r * 1.4, 'rgba(255,120,40,1)', .45 * a); g.restore(); }});
      // flames: emitted over the life of the fire
      const n = Math.round(o.life * 14 * lvlMul());
      for (let i = 0; i < n; i++) later(i / 14 / lvlMul(), () => { if (f.t > f.life * .85) return; const a = R(0, TAU), d = Math.sqrt(Math.random()) * o.r * .9;
        emit({x:o.x + Math.cos(a) * d, y:o.y + Math.sin(a) * d * .45, z:0, vx:R(-4, 4), vz:R(18, 36), life:R(.35, .65), size:R(2.4, 4.2), shape:'flame', col:Math.random() < .5 ? 'rgba(240,90,25,1)' : 'rgba(255,160,40,1)', add:false, vr:R(-2, 2)});
        if (Math.random() < .35) emit({x:o.x + R(-o.r, o.r) * .6, y:o.y, z:R(4, 10), vx:R(-15, 15), vz:R(30, 60), g:-20, life:R(.6, 1.1), size:R(1, 1.6), shape:'dot', col:'rgba(255,200,110,1)'});
        if (Math.random() < .2) emit({x:o.x + R(-6, 6), y:o.y, z:R(10, 18), vx:R(-5, 5), vz:R(10, 18), life:R(1, 1.6), size:5, grow:12, shape:'smoke', col:'rgba(60,45,40,1)', add:false}); });
    },
    boom(o){
      const s = o.big ? 1.6 : 1;
      add({x:o.x, y:o.y, life:.6, draw(k){ glow(this.x, this.y - 10, 30 * s * (.6 + k), FIRE, (1 - k) * 1.2); glow(this.x, this.y - 10, 14 * s, 'rgba(255,240,200,1)', (1 - k * 2)); ring(this.x, this.y, 50 * s * k, 'rgba(255,190,110,1)', 1 - k, 3); }});
      add({x:o.x, y:o.y, life:3, layer:'under', draw(k){ disc(this.x, this.y, 22 * s, 'rgba(40,25,18,1)', .45 * (1 - k)); disc(this.x, this.y, 10 * s, 'rgba(255,110,40,1)', .5 * (1 - k * 2)); }});
      burst(o.x, o.y, 6, 18 * s, {s0:40, s1:170, vz0:40, vz1:150, p:{g:-260, size:R(1.6, 3), shape:'dot', col:'rgba(255,180,90,1)'}});
      burst(o.x, o.y, 6, 10 * s, {s0:30, s1:120, vz0:50, vz1:150, p:{g:-320, size:R(2, 3.5), shape:'rock', col:'rgba(80,55,40,1)', add:false}});
      burst(o.x, o.y, 10, 6 * s, {s0:8, s1:30, vz0:15, vz1:40, p:{size:9, grow:22, shape:'smoke', col:'rgba(70,55,50,1)', add:false, life:1.1}});
    },
    wrath(o){
      add({x:o.x, y:o.y, r:o.r, life:.25 + o.hits * o.every + .5, layer:'under', draw(k){ yantra(this.x, this.y, this.r, 'rgba(180,230,255,1)', Math.min(1, k * 4) * (1 - k), -k * 3); disc(this.x, this.y, this.r, 'rgba(60,70,130,1)', .25 * (1 - k)); }});
      add({x:o.x, y:o.y, r:o.r, life:.25 + o.hits * o.every + .6, draw(k){ // storm cloud above the area
        for (let i = 0; i < 7; i++){ const a = i / 7 * TAU + k * 2; glow(this.x + Math.cos(a) * this.r * .5, this.y - 150 + Math.sin(a) * 10, 34, 'rgba(70,80,120,1)', .5 * Math.sin(k * Math.PI)); } }});
      for (let i = 0; i < o.hits; i++) later(.25 + i * o.every, () => {
        for (let j = 0; j < 2; j++){ const x = o.x + R(-o.r, o.r) * .7, y = o.y + R(-o.r, o.r) * .3;
          add({x, y, life:.35, seed:Math.random(), draw(k){ g.globalAlpha = 1 - k; bolt(this.x + 10, this.y - 160, this.x, this.y, 'rgba(160,210,255,1)', 2.4, this.seed, 3); glow(this.x, this.y, 30, 'rgba(170,220,255,1)', 1 - k); ring(this.x, this.y, 30 * k + 6, 'rgba(210,240,255,1)', 1 - k, 2); }});
          burst(x, y, 4, 8, {s0:40, s1:140, vz0:10, vz1:60, p:{size:1.8, shape:'dot', col:'rgba(210,240,255,1)', life:.4}}); }
        flash('rgba(210,235,255,1)', .3);
      });
    },
    frostsea(o){
      // พายุหิมะ (Blizzard): 1) the ground under the storm freezes into a cracked sheet of ice with frost crystals at the rim,
      // 2) a whirling column of snow and wind arcs spins over it, 3) ice shards rain down on every hit and shatter,
      // 4) when the storm passes the ice stays a moment, then melts away
      const hits = o.hits || 4, every = o.every || .5, dur = .3 + hits * every, life = dur + 1.4, r = o.r;
      const tiles = [], rim = [];
      for (let i = 0; i < 14; i++){ const a = i / 14 * TAU + R(-.15, .15), pts = [[0, 0]]; let x = 0, y = 0, aa = a;
        for (let k = 0; k < 4; k++){ aa += R(-.45, .45); x += Math.cos(aa) * r * .26; y += Math.sin(aa) * r * .26 * .45; pts.push([x, y]); } tiles.push(pts); }
      for (let i = 0; i < 22; i++){ const a = i / 22 * TAU + R(-.1, .1), d = r * R(.82, 1.02); rim.push([Math.cos(a) * d, Math.sin(a) * d * .45, R(3, 7), R(-.4, .4)]); }
      const edge = []; for (let i = 0; i < 28; i++){ const a = i / 28 * TAU; edge.push([Math.cos(a), Math.sin(a) * .45, R(.9, 1.06)]); }
      // frozen ground
      add({x:o.x, y:o.y, r, life, layer:'under', draw(k, f){ const t = f.t, grow = Math.min(1, t / .45), melt = t > life - .8 ? (life - t) / .8 : 1, Z = sx(1) - sx(0), R0 = this.r * grow * Z, X = sx(this.x), Y = sy(this.y);
        g.globalAlpha = .55 * melt; g.beginPath(); edge.forEach(([cx, cy, m], i) => { const px = X + cx * R0 * m, py = Y + cy * R0 * m; i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath();
        const gr = g.createRadialGradient(X - R0 * .25, Y - R0 * .12, 2, X, Y, R0); gr.addColorStop(0, 'rgba(245,252,255,1)'); gr.addColorStop(.55, 'rgba(170,220,250,1)'); gr.addColorStop(1, 'rgba(90,160,220,1)');
        g.fillStyle = gr; g.fill(); g.globalAlpha = .9 * melt; g.strokeStyle = 'rgba(235,250,255,1)'; g.lineWidth = 1.6; g.stroke();
        g.globalAlpha = .7 * melt; g.strokeStyle = 'rgba(255,255,255,1)'; g.lineWidth = 1;
        for (const c of tiles){ g.beginPath(); const n = Math.max(1, Math.ceil(c.length * grow)); g.moveTo(X, Y); for (let q = 1; q < n; q++) g.lineTo(X + c[q][0] * grow * Z, Y + c[q][1] * grow * Z); g.stroke(); }
        g.globalAlpha = .35 * melt; g.fillStyle = 'rgba(255,255,255,1)'; for (let i = 0; i < 5; i++){ const a = i * 1.3 + 0.4, d = R0 * (.25 + (i % 3) * .2); g.beginPath(); g.ellipse(X + Math.cos(a) * d, Y + Math.sin(a) * d * .45, 3.5 * Z, Z, -.3, 0, TAU); g.fill(); }
        // frost crystals around the rim
        for (const [cx, cy, h, tl] of rim){ const hh = h * grow * melt * Z, px = X + cx * grow * Z, py = Y + cy * grow * Z, w = 1.3 * Z; if (hh < .5) continue;
          g.globalAlpha = .9 * melt; g.fillStyle = 'rgba(120,190,240,1)'; g.beginPath(); g.moveTo(px - w, py); g.lineTo(px + tl * 2 * Z, py - hh); g.lineTo(px + w, py); g.closePath(); g.fill();
          g.fillStyle = 'rgba(235,250,255,1)'; g.beginPath(); g.moveTo(px - w * .6, py); g.lineTo(px + tl * 2 * Z, py - hh); g.lineTo(px, py); g.closePath(); g.fill(); } }});
      // whirling snow column
      const flakes = []; for (let i = 0; i < N(130); i++) flakes.push({a:R(0, TAU), d:R(.1, 1) * r, z:R(4, 70), w:R(1.8, 3.4), s:R(1.6, 3.2), vz:R(-14, -4)});
      add({x:o.x, y:o.y, r, life:dur + .5, draw(k, f){ const t = f.t, fade = Math.min(1, t * 3) * (t > dur ? Math.max(0, 1 - (t - dur) / .5) : 1), X = this.x, Y = this.y, Z = sx(1) - sx(0);
        for (let j = 0; j < 3; j++){ const rr = this.r * (.45 + j * .25), z = 14 + j * 16, a0 = t * (3.2 - j * .6) + j * 2;
          g.globalAlpha = .45 * fade; g.strokeStyle = 'rgba(225,245,255,1)'; g.lineWidth = 2 - j * .4; g.beginPath(); g.ellipse(sx(X), sy(Y - z), rr * Z, rr * .45 * Z, 0, a0, a0 + 2.2); g.stroke();
          g.globalAlpha = .25 * fade; g.beginPath(); g.ellipse(sx(X), sy(Y - z), rr * .9 * Z, rr * .4 * Z, 0, a0 + Math.PI, a0 + Math.PI + 1.6); g.stroke(); }
        // storm cloud overhead and wind-driven snow streaks
        for (let j = 0; j < 5; j++){ const a = t * .8 + j * 1.25, cx = X + Math.cos(a) * this.r * .45, cy = Y + Math.sin(a) * this.r * .2;
          g.globalAlpha = .28 * fade; g.fillStyle = j % 2 ? 'rgba(200,220,240,1)' : 'rgba(150,175,205,1)'; g.beginPath(); g.ellipse(sx(cx), sy(cy - 88), this.r * .55, this.r * .16, 0, 0, TAU); g.fill(); }
        g.strokeStyle = 'rgba(240,250,255,1)'; g.lineWidth = 1.2;
        for (let j = 0; j < 26; j++){ const ph = (t * 1.6 + j * .37) % 1, a = j * 2.4 + t * 2.6, d = this.r * ((j * 37 % 100) / 100), x0 = X + Math.cos(a) * d, y0 = Y + Math.sin(a) * d * .45, z = 80 * (1 - ph);
          g.globalAlpha = .55 * fade * Math.sin(ph * Math.PI); g.beginPath(); g.moveTo(sx(x0 - 9), sy(y0 - z - 10)); g.lineTo(sx(x0), sy(y0 - z)); g.stroke(); }
        g.fillStyle = 'rgba(250,253,255,1)';
        for (const p of flakes){ const a = p.a + t * p.w, z = ((p.z + p.vz * t) % 70 + 70) % 70 + 4, x = X + Math.cos(a) * p.d, y = Y + Math.sin(a) * p.d * .45;
          g.globalAlpha = .9 * fade; const ss = p.s * Z; g.fillRect(sx(x) - ss / 2, sy(y - z) - ss / 2, ss, ss); }
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = .25 * fade; g.drawImage(glowTex(ICE), sx(X - this.r), sy(Y - 30 - this.r * .6), this.r * 2 * Z, this.r * 1.2 * Z); g.globalCompositeOperation = 'source-over'; }});
      // ice shards rain on every hit
      const shard = (x, y) => add({x, y, life:.38, draw(k){ const z = 90 * (1 - k), X = sx(this.x), Y = sy(this.y - z), Z = 1.2;
        g.globalAlpha = 1; g.fillStyle = 'rgba(150,210,250,1)'; g.beginPath(); g.moveTo(X, Y + 7 * Z); g.lineTo(X - 2.6 * Z, Y - 6 * Z); g.lineTo(X + 2.6 * Z, Y - 6 * Z); g.closePath(); g.fill();
        g.fillStyle = 'rgba(245,252,255,1)'; g.beginPath(); g.moveTo(X, Y + 7 * Z); g.lineTo(X - Z, Y - 6 * Z); g.lineTo(X + 1.2 * Z, Y - 6 * Z); g.closePath(); g.fill();
        g.globalAlpha = .4; g.strokeStyle = 'rgba(220,245,255,1)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X, Y - 6 * Z); g.lineTo(X, Y - 20 * Z); g.stroke(); }});
      for (let i = 0; i < hits; i++) later(Math.max(0, .3 + i * every - .38), () => { for (let q = 0; q < N(6); q++){ const a = R(0, TAU), d = Math.sqrt(Math.random()) * r * .9, x = o.x + Math.cos(a) * d, y = o.y + Math.sin(a) * d * .45;
          later(R(0, .12), () => { shard(x, y); later(.38, () => { burst(x, y, 2, 6, {s0:30, s1:90, vz0:30, vz1:80, p:{g:-260, size:R(1.6, 2.6), shape:'shard', col:'rgba(220,245,255,1)', add:false}}); ring(x, y, 4, 'rgba(255,255,255,1)', .6); }); }); }
        VFX.shake(1.2); });
      // gust of cold mist at the start
      later(.05, () => { for (let i = 0; i < N(18); i++){ const a = R(0, TAU), d = Math.sqrt(Math.random()) * r;
        emit({x:o.x + Math.cos(a) * d, y:o.y + Math.sin(a) * d * .45, z:R(0, 6), vx:-Math.sin(a) * R(20, 40), vy:Math.cos(a) * R(10, 20), vz:R(2, 8), life:R(1.2, 2), size:R(6, 10), grow:R(10, 18), shape:'smoke', col:'rgba(220,242,255,1)', add:false}); } });
      later(dur, () => burst(o.x, o.y, 6, 24, {s0:30, s1:140, vz0:30, vz1:100, p:{g:-300, size:R(2, 3.5), shape:'shard', col:'rgba(215,245,255,1)', add:false}}));
      flash('rgba(200,240,255,1)', .18);
    },
    seal(o){
      const m = o.m; if (!m) return;
      add({m, life:1.4, draw(k){ const x = this.m.x, y = this.m.y - MOB_H[this.m.type] * .5, s = 14 * Math.min(1, k * 4);
        g.save(); g.translate(sx(x), sy(y)); g.rotate(k * 3); g.globalAlpha = Math.min(1, (1 - k) * 2); g.strokeStyle = GOLDL; g.lineWidth = 1.6;
        g.strokeRect(-s, -s, s * 2, s * 2); g.rotate(Math.PI / 4); g.strokeRect(-s * .8, -s * .8, s * 1.6, s * 1.6); g.beginPath(); g.arc(0, 0, s * .45, 0, TAU); g.stroke();
        g.beginPath(); g.moveTo(0, -s * .45); g.quadraticCurveTo(s * .5, 0, 0, s * .45); g.stroke(); g.restore(); glow(x, y, 26, GOLD, .5 * (1 - k)); }});
      add({x:o.x, y:o.y, m, life:.35, draw(k){ g.globalAlpha = 1 - k; g.strokeStyle = GOLDL; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sx(this.x), sy(this.y - 30)); g.lineTo(sx(this.x + (this.m.x - this.x) * Math.min(1, k * 3)), sy(this.y - 30 + (this.m.y - MOB_H[this.m.type] * .5 - this.y + 30) * Math.min(1, k * 3))); g.stroke(); }});
    },
    auspice(o){
      add({life:1.6, draw(k){ yantra(P.x, P.y - 24, 34, GOLDL, Math.sin(k * Math.PI), k * 4, 1); g.globalAlpha = .5 * Math.sin(k * Math.PI); g.strokeStyle = GOLD; g.lineWidth = 1;
        for (let i = 0; i < 12; i++){ const a = i / 12 * TAU + k; g.beginPath(); g.moveTo(sx(P.x + Math.cos(a) * 36), sy(P.y - 24 + Math.sin(a) * 36)); g.lineTo(sx(P.x + Math.cos(a) * 52), sy(P.y - 24 + Math.sin(a) * 52)); g.stroke(); } }});
      burst(o.x, o.y, 24, 16, {s0:20, s1:70, p:{size:R(2, 4), shape:'star', col:GOLDL, life:1}});
    },
    orbShot(o){ const m = o.m, c = ORB_COL[Math.floor(Math.random() * 9)]; add({x:o.x, y:o.y, m, c, life:.25, draw(k){ const x = this.x + (this.m.x - this.x) * k, y = this.y + (this.m.y - MOB_H[this.m.type] * .5 - this.y) * k; glow(x, y, 9, this.c, 1); }}); later(.25, () => add({x:m.x, y:m.y - MOB_H[m.type] * .5, c, life:.25, draw(k){ glow(this.x, this.y, 8 + k * 12, this.c, 1 - k); }})); },
    pierce(o){
      add({x:o.x, y:o.y, ux:o.ux, uy:o.uy, len:o.len, life:.45, draw(k){ const d = this.len * Math.min(1, k * 3), x = this.x + this.ux * d, y = this.y + this.uy * d - 20;
        g.globalAlpha = 1 - k; const gr = g.createLinearGradient(sx(this.x), sy(this.y - 20), sx(x), sy(y)); gr.addColorStop(0, 'rgba(180,255,200,0)'); gr.addColorStop(1, 'rgba(230,255,235,1)');
        g.strokeStyle = gr; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx(this.x), sy(this.y - 20)); g.lineTo(sx(x), sy(y)); g.stroke(); glow(x, y, 12, WIND, 1);
        for (let i = 1; i < 4; i++){ const dd = d * i / 4; ring(this.x + this.ux * dd, this.y + this.uy * dd - 20, 6 + k * 6, 'rgba(200,255,220,1)', (1 - k) * .8, 1.2, 1); } }});
    },
    tigerCall(o){ play('conjure', {x:o.x, y:o.y, col:'auraGold'}); add({x:o.x, y:o.y, life:.9, draw(k){ ring(this.x, this.y, 8 + k * 40, 'rgba(255,170,80,1)', 1 - k, 3); glow(this.x, this.y - 14, 30, 'rgba(255,150,60,1)', (1 - k) * .8); }}); burst(o.x, o.y, 10, 22, {s0:20, s1:80, vz0:10, vz1:60, p:{size:8, grow:14, shape:'smoke', col:'rgba(255,160,90,1)', life:.9}}); },
    /* ---------- Summoner: a turning yantra and a pillar of light where a Himmapan beast steps out ---------- */
    conjure(o){ const [C, CL] = AURA_RGB[o.col] || AURA_RGB.auraGold;
      if (o.small){ const R0 = 22;
        add({x:o.x, y:o.y, life:1.1, layer:'under', draw(k){ const a = Math.sin(Math.min(1, k * 1.3) * Math.PI); yantra(this.x, this.y, 10 + k * R0, C, a, k * 5); yantra(this.x, this.y, 6 + k * R0 * .6, CL, a * .8, -k * 7); }});
        burst(o.x, o.y, 14, 10, {s0:20, s1:90, vz0:30, vz1:120, l0:.5, l1:1, p:{g:-90, size:R(1.8, 3.2), shape:'star', col:CL}}); return; }
      /* a grand summoning: light gathers into a triple yantra, a pillar of light breaks open, a shockwave, a rain of stars */
      const life = 2.6, X0 = o.x, Y0 = o.y;
      // 1) ground: three counter-turning yantras, a glowing disc and a ring of rune sparks — they bloom, hold, fade
      add({x:X0, y:Y0, life, layer:'under', draw(k, f){ const t = f.t, a = Math.min(1, t * 2.4) * Math.min(1, (life - t) * 1.6), R1 = 30 + Math.min(1, t * 2) * 36;
        disc(this.x, this.y, R1 * 1.05, C, .22 * a); disc(this.x, this.y, R1 * .55, CL, .18 * a);
        yantra(this.x, this.y, R1, C, a, t * 1.4); yantra(this.x, this.y, R1 * .72, CL, a * .9, -t * 2.2); yantra(this.x, this.y, R1 * .42, C, a * .8, t * 3.4);
        ring(this.x, this.y, R1 * 1.12, CL, a * .8, 2); ring(this.x, this.y, R1 * 1.22, C, a * .5, 1);
        for (let i = 0; i < 12; i++){ const an = i / 12 * TAU + t * .9, px = this.x + Math.cos(an) * R1 * 1.17, py = this.y + Math.sin(an) * R1 * 1.17 * .45; glow(px, py, 5 + Math.sin(t * 8 + i) * 1.5, CL, a * .9); } }});
      // 2) gathering: motes stream in toward the circle before it opens
      for (let i = 0; i < N(26); i++){ const an = R(0, TAU), d = R(70, 120);
        add({x:X0 + Math.cos(an) * d, y:Y0 + Math.sin(an) * d * .5, z:R(10, 60), life:.55, draw(k){ const e = k * k, x = this.x + (X0 - this.x) * e, y = this.y + (Y0 - this.y) * e; glow(x, y - this.z * (1 - e) - 10, 6, CL, Math.sin(k * Math.PI)); }}); }
      // 3) the pillar of light (wide, tall, with a bright core), spiralling sparks inside
      later(.45, () => { shake(5); flash(CL, .35);
        add({x:X0, y:Y0, life:1.5, draw(k){ const a = Math.sin(Math.min(1, k * 1.6) * Math.PI * .5 + (k > .5 ? (k - .5) * Math.PI : 0)) * (1 - Math.max(0, k - .55) / .45), X = sx(this.x), Y = sy(this.y), H = 220, w = 18 + (1 - k) * 14;
          g.save(); g.globalCompositeOperation = 'lighter';
          let gr = g.createLinearGradient(0, Y - H, 0, Y); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.35, CL); gr.addColorStop(1, C);
          g.globalAlpha = a * .32; g.fillStyle = gr; g.fillRect(X - w * 1.8, Y - H, w * 3.6, H);
          g.globalAlpha = a * .5; gr = g.createLinearGradient(0, Y - H, 0, Y); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, CL);
          g.fillStyle = gr; g.fillRect(X - w * .45, Y - H, w * .9, H); g.restore();
          glow(this.x, this.y - 24, 60, C, a); glow(this.x, this.y - 10, 34, 'rgba(255,255,255,1)', a * .45);
          if (Math.random() < 1.2 * lvlMul()){ const an = R(0, TAU); emit({x:this.x + Math.cos(an) * R(4, 20), y:this.y + Math.sin(an) * 6, z:R(0, 40), vz:R(90, 200), life:R(.6, 1.1), size:R(1.6, 3.4), shape:'star', col:Math.random() < .5 ? CL : 'rgba(255,255,255,1)'}); } }});
        // shockwave rings across the ground
        for (let j = 0; j < 3; j++) later(j * .12, () => add({x:X0, y:Y0, life:.7, layer:'under', draw(k){ ring(this.x, this.y, 20 + k * 120, CL, (1 - k) * .95, 5 - k * 4); ring(this.x, this.y, 14 + k * 100, C, (1 - k) * .6, 2); }}));
        // a rain of stars and petals, and dust kicked up at the rim
        burst(X0, Y0, 30, 40, {s0:40, s1:170, vz0:60, vz1:220, l0:.7, l1:1.4, p:{g:-140, size:R(1.8, 3.8), shape:'star', col:CL}});
        burst(X0, Y0, 20, 18, {s0:30, s1:120, vz0:30, vz1:140, l0:.8, l1:1.5, p:{g:-60, size:R(2, 4), shape:'glow', col:C}});
        burst(X0, Y0, 6, 12, {s0:60, s1:110, vz0:5, vz1:25, l0:.5, l1:.9, p:{size:6, grow:16, shape:'smoke', col:'rgba(255,240,220,1)'}}); });
      // 4) a crown of light over the beast as it steps out
      later(.9, () => add({x:X0, y:Y0, life:1, draw(k){ const a = Math.sin(k * Math.PI); for (let i = 0; i < 8; i++){ const an = i / 8 * TAU + k * 2; glow(this.x + Math.cos(an) * 22, this.y - 54 + Math.sin(an) * 6, 6, CL, a); } glow(this.x, this.y - 54, 18, C, a * .6); }}));
    },
    beastFade(o){ const [C, CL] = AURA_RGB[o.col] || AURA_RGB.auraGold; burst(o.x, o.y, 14, 18, {s0:10, s1:60, vz0:30, vz1:90, l0:.5, l1:1, p:{g:-60, size:R(1.5, 3), shape:'star', col:CL}}); add({x:o.x, y:o.y, life:.6, draw(k){ glow(this.x, this.y - 14, 26, C, (1 - k) * .7); }}); },
    spiritburst(o){
      add({x:o.x, y:o.y, r:o.r, life:.7, layer:'under', draw(k){ yantra(this.x, this.y, this.r * (.4 + k * .6), GOLDL, (1 - k), k * 4); disc(this.x, this.y, this.r, 'rgba(255,230,160,1)', .2 * (1 - k)); }});
      later(.15, () => { flash(GOLDL, .2); add({x:o.x, y:o.y, r:o.r, life:.5, draw(k){ ring(this.x, this.y, this.r * (.3 + k), GOLDL, 1 - k, 3); glow(this.x, this.y - 12, this.r * .7, GOLD, (1 - k)); }});
        burst(o.x, o.y, o.r * .6, 18, {s0:30, s1:120, vz0:40, vz1:160, l0:.5, l1:1, p:{g:-80, size:R(1.6, 3), shape:'star', col:GOLDL}}); });
    },
    himmagate(o){ const life = .35 + o.hits * o.every + .8;
      add({x:o.x, y:o.y, r:o.r, life, layer:'under', draw(k, f){ const a = Math.min(1, f.t * 4) * Math.min(1, (life - f.t) * 2); yantra(this.x, this.y, this.r, GOLD, a, f.t * 1.2); yantra(this.x, this.y, this.r * .62, GOLDL, a * .9, -f.t * 1.8); disc(this.x, this.y, this.r, 'rgba(255,210,120,1)', .16 * a); }});
      add({x:o.x, y:o.y, r:o.r, life, draw(k, f){ const a = Math.min(1, f.t * 3) * Math.min(1, (life - f.t) * 2), X = sx(this.x), Y = sy(this.y), w = this.r * .55;
        g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * .45; g.strokeStyle = GOLDL; g.lineWidth = 3;
        g.beginPath(); g.moveTo(X - w, Y); g.lineTo(X - w, Y - 70); g.quadraticCurveTo(X, Y - 112, X + w, Y - 70); g.lineTo(X + w, Y); g.stroke();
        const gr = g.createLinearGradient(0, Y - 100, 0, Y); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, GOLD); g.fillStyle = gr; g.globalAlpha = a * .3; g.fillRect(X - w, Y - 90, w * 2, 90); g.restore();
        if (Math.random() < .8 * lvlMul()) emit({x:this.x + R(-w, w), y:this.y + R(-4, 4), z:R(0, 30), vz:R(40, 100), life:R(.6, 1), size:R(1.5, 3), shape:'star', col:GOLDL}); }});
      for (let i = 0; i < o.hits; i++) later(.35 + i * o.every, () => { shake(3); flash(GOLDL, .18);
        add({x:o.x, y:o.y, r:o.r, life:.45, draw(k){ ring(this.x, this.y, this.r * (.2 + k * .9), GOLDL, 1 - k, 4 - k * 3); glow(this.x, this.y - 20, this.r * .6, GOLD, 1 - k); }});
        burst(o.x, o.y, o.r * .7, 14, {s0:40, s1:150, vz0:30, vz1:140, l0:.4, l1:.8, p:{g:-100, size:R(1.6, 3), shape:'star', col:GOLDL}}); });
    },
    tigerFade(o){ burst(o.x, o.y, 12, 16, {s0:10, s1:50, vz0:20, vz1:50, p:{size:7, grow:12, shape:'smoke', col:'rgba(255,170,100,1)', life:.8}}); },
    clawHit(o){ const s = o.small ? .7 : 1; add({x:o.x, y:o.y, life:.25, draw(k){ g.globalAlpha = 1 - k; g.strokeStyle = 'rgba(255,200,140,1)'; g.lineWidth = 2 * s;
      for (let i = -1; i <= 1; i++){ g.beginPath(); g.moveTo(sx(this.x - 8 * s + i * 5 * s), sy(this.y - 10 * s)); g.lineTo(sx(this.x + 8 * s + i * 5 * s), sy(this.y + 10 * s)); g.stroke(); } glow(this.x, this.y, 12 * s, 'rgba(255,160,80,1)', (1 - k) * .7); }}); },
    firerain(o){
      add({x:o.x, y:o.y, r:o.r, life:o.dur + 1.2, layer:'under', draw(k, f){ const on = f.t < this.life - 1; disc(this.x, this.y, this.r, 'rgba(255,100,30,1)', (on ? .18 : .18 * (this.life - f.t))); ring(this.x, this.y, this.r, 'rgba(255,170,90,1)', on ? .7 : .7 * (this.life - f.t), 1.5);
        if (on && Math.random() < .8 * lvlMul()){ const a = R(0, TAU), d = Math.sqrt(Math.random()) * this.r; emit({x:this.x + Math.cos(a) * d, y:this.y + Math.sin(a) * d * .5, z:0, vz:R(20, 45), life:R(.4, .8), size:R(3, 5), shape:'kanok', col:'rgba(255,140,50,1)'}); } }});
      const n = N(Math.round(o.dur * 14));
      for (let i = 0; i < n; i++){ const a = R(0, TAU), d = Math.sqrt(Math.random()) * o.r, tx = o.x + Math.cos(a) * d, ty = o.y + Math.sin(a) * d * .5;
        later(.15 + R(0, o.dur), () => add({x:tx, y:ty, life:.25, draw(k){ const h = 110 * (1 - k); g.globalAlpha = 1; g.strokeStyle = 'rgba(255,190,110,1)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(sx(this.x - 6 - h * .2), sy(this.y - h - 9)); g.lineTo(sx(this.x - h * .2), sy(this.y - h)); g.stroke(); glow(this.x - h * .2, this.y - h, 6, FIRE, 1); if (k > .9) glowAt(this.x, this.y, 10, FIRE, .5); }})); }
    },
    poisonHit(o){ const m = o.m; if (!m) return; burst(m.x, m.y, MOB_H[m.type] * .5, 8, {s0:10, s1:40, vz0:10, vz1:40, p:{size:R(2, 3.5), shape:'bubble', col:POISON, add:false, life:.7}}); },
    stealth(o){ burst(o.x, o.y, 14, 16, {s0:20, s1:70, vz0:10, vz1:40, p:{size:R(2.5, 4), shape:'leaf', col:'rgba(110,170,90,1)', add:false, life:.8, vr:5}}); burst(o.x, o.y, 6, 8, {s0:10, s1:30, p:{size:8, grow:12, shape:'smoke', col:'rgba(120,150,110,1)', add:false, life:.8}}); },
    jobChange(o){
      add({x:o.x, y:o.y, life:2.4, draw(k){ const a = Math.sin(Math.min(1, k * 1.2) * Math.PI);
        g.globalAlpha = a * .8; const w = 34; const gr = g.createLinearGradient(0, sy(this.y - 220), 0, sy(this.y)); gr.addColorStop(0, 'rgba(255,230,150,0)'); gr.addColorStop(1, 'rgba(255,230,150,.9)'); g.fillStyle = gr; g.fillRect(sx(this.x - w / 2), sy(this.y - 220), w, 220);
        yantra(this.x, this.y, 46, GOLDL, a, k * 3); yantra(this.x, this.y, 30, 'rgba(255,170,90,1)', a, -k * 4); }});
      for (let i = 0; i < 3; i++) later(i * .3, () => burst(o.x, o.y, 10, 22, {s0:30, s1:110, vz0:60, vz1:160, l0:.8, l1:1.4, p:{g:-90, size:R(3, 5.5), shape:i === 1 ? 'petal' : 'kanok', col:i === 1 ? LOTUS : GOLD, add:i !== 1, vr:4}}));
      shake(3); flash('rgba(255,235,170,1)', .3);
    },
    /* ---------- Class change aura (follows the hero, coloured by the new class):
       1) energy streams converge into the hero, 2) a white-hot flash and a shockwave ring,
       3) a tall flame-shaped aura burns around the body with rising sparks for a few seconds, then fades ---------- */
    classAura(o){
      const C = o.col || GOLD, CL = o.colL || GOLDL, T0 = .9, life = T0 + 4.2;
      // 1) converge
      for (let i = 0; i < N(36); i++) later(R(0, T0 - .15), () => { const a = R(0, TAU), d = R(70, 120), t = R(.35, .55);
        emit({x:P.x + Math.cos(a) * d, y:P.y + Math.sin(a) * d * .45, z:R(10, 50), vx:-Math.cos(a) * d / t, vy:-Math.sin(a) * d * .45 / t, vz:R(-10, 30), life:t, size:R(2, 3.5), shape:'star', col:CL}); });
      add({life:T0, layer:'under', draw(k){ yantra(P.x, P.y, 50 - k * 22, C, k, k * 6); yantra(P.x, P.y, 28 - k * 10, CL, k * .8, -k * 8); }});
      // 2) burst
      later(T0, () => { flash(CL, .45); shake(5); burst(P.x, P.y, 20, 40, {s0:60, s1:200, vz0:40, vz1:180, l0:.6, l1:1.2, p:{g:-120, size:R(2.5, 4.5), shape:'star', col:CL}});
        add({life:.8, layer:'under', draw(k){ ring(P.x, P.y, 10 + k * 150, CL, (1 - k) * 1.2, 4 - k * 3); ring(P.x, P.y, 6 + k * 110, C, (1 - k), 2); }}); });
      // 3) burning aura
      add({life, draw(k, f){ const t = f.t - T0; if (t < 0) return; const a = Math.min(1, t * 3) * (f.t > life - 1 ? (life - f.t) : 1), X = sx(P.x), Y = sy(P.y);
        g.save(); g.globalCompositeOperation = 'lighter';
        for (let j = 0; j < 3; j++){ const h = 46 + j * 10 + Math.sin(T * 7 + j) * 4, w = 15 + j * 5;
          g.globalAlpha = a * (.32 - j * .08); const gr = g.createLinearGradient(0, Y - h, 0, Y + 4); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.35, CL); gr.addColorStop(1, C); g.fillStyle = gr;
          g.beginPath(); g.moveTo(X - w, Y + 2);
          for (let q = 0; q <= 8; q++){ const u = q / 8, px = X - w + u * w * 2, tip = Math.sin(u * Math.PI); g.lineTo(px + Math.sin(T * 9 + q * 1.7 + j) * 2.5, Y - h * (.55 + .45 * tip) - (q % 2 ? 6 : 0) * tip); }
          g.lineTo(X + w, Y + 2); g.closePath(); g.fill(); }
        g.restore();
        glow(P.x, P.y - 22, 34, C, a * .55);
        ring(P.x, P.y, 26 + Math.sin(T * 5) * 3, CL, a * .7, 1.6);
        if (Math.random() < .9 * lvlMul()) emit({x:P.x + R(-14, 14), y:P.y + R(-4, 4), z:R(0, 20), vz:R(40, 90), vx:R(-6, 6), life:R(.6, 1.1), size:R(1.5, 3), shape:Math.random() < .3 ? 'star' : 'glow', col:Math.random() < .5 ? C : CL}); }});
    },
    /* ---------- Level up: a pillar of gold from the sky, a turning yantra under the feet,
       lotus petals and kanok sparks spiralling up around the hero (follows the player) ---------- */
    levelUp(o){
      const jb = !!o.job, C = jb ? 'rgba(130,240,200,1)' : GOLD, CL = jb ? 'rgba(210,255,235,1)' : GOLDL, big = jb ? .75 : 1;
      add({life:2.6, layer:'under', draw(k){ const a = Math.min(1, k * 5) * (k > .7 ? (1 - k) / .3 : 1);
        yantra(P.x, P.y, (34 + Math.min(1, k * 4) * 18) * big, C, a, k * 4); yantra(P.x, P.y, 22 * big, CL, a * .8, -k * 6);
        disc(P.x, P.y, 50 * big, C, .16 * a); }});
      add({life:2.2, draw(k){ const a = Math.min(1, k * 6) * (1 - k), h = 260 * Math.min(1, k * 3), w = (26 + Math.sin(k * 40) * 2) * big;
        g.globalAlpha = a * .85; const gr = g.createLinearGradient(0, sy(P.y - 260), 0, sy(P.y));
        gr.addColorStop(0, jb ? 'rgba(160,255,220,0)' : 'rgba(255,230,150,0)'); gr.addColorStop(.6, jb ? 'rgba(160,255,220,.5)' : 'rgba(255,230,150,.5)'); gr.addColorStop(1, jb ? 'rgba(220,255,240,.95)' : 'rgba(255,245,200,.95)');
        g.fillStyle = gr; g.fillRect(sx(P.x - w / 2), sy(P.y - h), w, h); g.fillRect(sx(P.x - w / 6), sy(P.y - h), w / 3, h);
        glow(P.x, P.y - 20, 40 * big, C, a * .9);
        for (let i = 0; i < 3; i++){ const kk = (k * 2.2 + i / 3) % 1; ring(P.x, P.y - kk * 70, 16 + kk * 10, CL, (1 - kk) * a, 2); } }});
      // shockwave
      add({life:.7, layer:'under', draw(k){ ring(P.x, P.y, 10 + k * 90 * big, CL, (1 - k) * .9, 3); ring(P.x, P.y, 6 + k * 60 * big, C, (1 - k) * .6, 1.5); }});
      // spiralling petals and sparks
      for (let i = 0; i < N(26); i++) later(i * .045, () => { const a = i * .9;
        emit({x:P.x + Math.cos(a) * 22, y:P.y + Math.sin(a) * 9, z:R(0, 10), vx:-Math.sin(a) * 40, vy:Math.cos(a) * 16, vz:R(70, 120), g:-30, drag:1.2, life:R(1, 1.6), size:R(3, 5),
          shape:i % 3 ? 'kanok' : 'petal', col:i % 3 ? C : (jb ? 'rgba(200,255,230,1)' : LOTUS), add:i % 3 !== 0, vr:R(-5, 5)}); });
      later(.15, () => burst(P.x, P.y, 30, 22, {s0:40, s1:150, vz0:80, vz1:180, l0:.6, l1:1.1, p:{g:-160, size:R(1.6, 2.6), shape:'star', col:CL}}));
      if (!jb){ shake(4); flash('rgba(255,240,190,1)', .35); } else flash('rgba(200,255,230,1)', .2);
    },
    /* ---------- Muay Fighter / Grandmaster ---------- */
    punch(o){ const a = Math.atan2(o.ty - o.y, o.tx - o.x); for (let i = 0; i < 3; i++) later(i * .1, () => add({x:o.x + Math.cos(a) * 14, y:o.y + Math.sin(a) * 8, a, life:.16, draw(k){ g.globalAlpha = 1 - k; g.strokeStyle = 'rgba(255,240,210,1)'; g.lineWidth = 2;
      for (let j = -1; j <= 1; j++){ const ox = Math.cos(this.a + Math.PI / 2) * j * 3; g.beginPath(); g.moveTo(sx(this.x + ox - Math.cos(this.a) * 10), sy(this.y - 18 - Math.sin(this.a) * 6)); g.lineTo(sx(this.x + ox + Math.cos(this.a) * (6 + k * 10)), sy(this.y - 18 + Math.sin(this.a) * (4 + k * 6))); g.stroke(); } }})); },
    punchHit(o){ add({x:o.x, y:o.y, life:.22, draw(k){ ring(this.x, this.y, 4 + k * 14, 'rgba(255,230,190,1)', 1 - k, 2.5, 1); glow(this.x, this.y, 12, 'rgba(255,200,120,1)', 1 - k); }}); burst(o.x, o.y + 10, 10, 4, {s0:30, s1:70, p:{size:1.6, shape:'dot', col:'rgba(255,230,180,1)', life:.25}}); },
    kickArc(o){ add({x:o.x, y:o.y, r:o.r, life:.4, draw(k){ g.save(); g.translate(sx(this.x), sy(this.y - 10)); g.scale(1, .45); g.globalAlpha = 1 - k; g.lineCap = 'round';
        g.strokeStyle = 'rgba(255,220,160,.45)'; g.lineWidth = 14 * (1 - k) + 2; g.beginPath(); g.arc(0, 0, this.r * .8, k * 7, k * 7 + 4.4); g.stroke();
        g.strokeStyle = 'rgba(255,250,235,1)'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, this.r * .8, k * 7 + 1.4, k * 7 + 4.4); g.stroke(); g.restore(); }});
      burst(o.x, o.y, 2, 14, {s0:40, s1:120, vz0:5, vz1:20, p:{size:6, grow:12, shape:'smoke', col:'rgba(210,185,150,1)', add:false, life:.5}}); shake(2); },
    ramwai(o){ add({life:1.4, draw(k){ yantra(P.x, P.y, 26 + k * 6, GOLD, Math.sin(k * Math.PI), k * 3); for (let i = 0; i < 3; i++){ const kk = (k * 1.5 + i * .33) % 1; ring(P.x, P.y - kk * 40, 14, 'rgba(255,210,120,1)', (1 - kk) * .8, 2); } }});
      burst(o.x, o.y, 20, 18, {s0:20, s1:70, vz0:30, vz1:70, p:{size:R(3, 5), shape:'kanok', col:GOLD, life:1}}); },
    hanuman(o){ const m = o.m; later(.12, () => { if (!m) return; const x = m.x, y = m.y;
      add({x, y, life:.6, draw(k){ g.globalAlpha = (1 - k) * .9; const gr = g.createLinearGradient(0, sy(this.y - 90), 0, sy(this.y)); gr.addColorStop(0, 'rgba(255,220,120,0)'); gr.addColorStop(1, 'rgba(255,230,150,.9)'); g.fillStyle = gr; g.fillRect(sx(this.x - 9), sy(this.y - 90 * Math.min(1, k * 4)), 18, 90 * Math.min(1, k * 4)); }});
      burst(x, y, 10, 16, {s0:20, s1:70, vz0:80, vz1:160, p:{g:-200, size:R(3, 5), shape:'kanok', col:GOLD, life:.8}}); shake(3); }); },
    net(o){ const m = o.m; if (!m) return; add({m, life:1.6, draw(k){ const x = this.m.x, y = this.m.y, r = this.m.def.r + 8, a = Math.min(1, k * 6) * (k > .8 ? (1 - k) * 5 : 1);
      g.globalAlpha = a; g.strokeStyle = 'rgba(220,200,150,1)'; g.lineWidth = 1;
      for (let i = -3; i <= 3; i++){ g.beginPath(); g.moveTo(sx(x + i * r / 3), sy(y - r * 1.2)); g.lineTo(sx(x + i * r / 3 * 1.2), sy(y)); g.stroke(); g.beginPath(); g.ellipse(sx(x), sy(y - r * .6), r * (.4 + Math.abs(i) * .1), r * .25, 0, 0, TAU); g.stroke(); } }}); },
    monkick(o){ E.pierce(o); burst(o.x + o.ux * 30, o.y + o.uy * 30, 4, 14, {s0:40, s1:110, vz0:5, vz1:30, p:{size:7, grow:12, shape:'smoke', col:'rgba(210,185,150,1)', add:false, life:.6}}); shake(3); },

    /* ---------- Herbalist / Royal Physician ---------- */
    regenTick(o){ for (let i = 0; i < N(4); i++) emit({x:o.x + R(-8, 8), y:o.y, z:R(4, 20), vz:R(15, 30), life:.7, size:R(2.5, 3.5), shape:'leaf', col:'rgba(140,220,120,1)', add:false, vr:R(-4, 4)}); },
    holyHit(o){ add({x:o.x, y:o.y, life:.45, draw(k){ glow(this.x, this.y, 14 + k * 16, GOLDL, 1 - k); ring(this.x, this.y + 10, 6 + k * 20, 'rgba(255,245,200,1)', 1 - k, 2); }}); burst(o.x, o.y, 8, 10, {s0:20, s1:70, vz0:20, vz1:70, p:{g:-120, size:R(2, 3), shape:'star', col:GOLDL, life:.6}}); },
    smokeCloud(o){ add({x:o.x, y:o.y, r:o.r, life:2.6, layer:'under', draw(k){ disc(this.x, this.y, this.r, 'rgba(120,170,80,1)', .25 * Math.sin(Math.min(1, k * 2) * Math.PI * .5) * (1 - k)); }});
      for (let i = 0; i < N(22); i++){ const a = R(0, TAU), d = Math.sqrt(Math.random()) * o.r; later(R(0, .5), () => emit({x:o.x + Math.cos(a) * d, y:o.y + Math.sin(a) * d * .5, z:R(2, 10), vz:R(3, 10), vx:R(-8, 8), vy:R(-4, 4), size:R(8, 12), grow:R(10, 20), life:R(1.4, 2.2), shape:'smoke', col:'rgba(150,200,100,1)', add:false})); } },
    elixir(o){ E.heal(o); add({x:o.x, y:o.y, life:1.4, draw(k){ yantra(this.x, this.y, 24, 'rgba(160,255,190,1)', Math.sin(k * Math.PI), k * 3); g.globalAlpha = .6 * Math.sin(k * Math.PI); const gr = g.createLinearGradient(0, sy(this.y - 100), 0, sy(this.y)); gr.addColorStop(0, 'rgba(180,255,200,0)'); gr.addColorStop(1, 'rgba(180,255,200,.8)'); g.fillStyle = gr; g.fillRect(sx(this.x - 12), sy(this.y - 100), 24, 100); }});
      for (let i = 0; i < N(14); i++) emit({x:o.x + R(-20, 20), y:o.y + R(-6, 6), z:R(0, 10), vz:R(20, 50), life:R(.9, 1.4), size:R(3, 5), shape:'petal', col:LOTUS, add:false, vr:R(-3, 3)}); },
    holycircle(o){ add({x:o.x, y:o.y, r:o.r, life:o.dur + 1, layer:'under', draw(k, f){ const on = f.t < this.life - 1, a = on ? 1 : this.life - f.t; yantra(this.x, this.y, this.r, GOLDL, .9 * a, f.t * .8); disc(this.x, this.y, this.r, 'rgba(255,240,180,1)', .15 * a);
        if (on && Math.random() < .7 * lvlMul()){ const an = R(0, TAU), d = Math.sqrt(Math.random()) * this.r; emit({x:this.x + Math.cos(an) * d, y:this.y + Math.sin(an) * d * .45, vz:R(20, 40), life:R(.6, 1), size:R(1.5, 2.5), shape:'star', col:GOLDL}); } }}); },
    sleep(o){ const m = o.m; if (!m) return; add({m, life:3, draw(k, f){ if (this.m.dead || !(this.m.st && this.m.st.stop > 0) && f.t > .5){ f.t = f.life; return; }
      g.globalAlpha = .9; g.fillStyle = 'rgba(200,220,255,1)'; g.font = '700 9px Mali, sans-serif'; g.textAlign = 'center';
      for (let i = 0; i < 3; i++){ const kk = (f.t * .6 + i / 3) % 1; g.globalAlpha = Math.sin(kk * Math.PI); g.fillText('z', sx(this.m.x + 6 + kk * 10), sy(this.m.y - MOB_H[this.m.type] - kk * 18)); } }}); burst(m.x, m.y, MOB_H[m.type] * .6, 10, {s0:10, s1:30, p:{size:6, grow:8, shape:'smoke', col:'rgba(190,200,255,1)', add:false, life:.8}}); },

    /* ---------- Rogue / Shadow Bandit ---------- */
    shadowSlash(o){ const a = Math.atan2(o.ty - o.y, o.tx - o.x); add({x:o.tx, y:o.ty, a, life:.3, draw(k){ g.globalAlpha = 1 - k; g.strokeStyle = 'rgba(190,140,255,1)'; g.lineWidth = 3 * (1 - k) + 1; g.lineCap = 'round';
      for (const d of [-1, 1]){ g.beginPath(); g.moveTo(sx(this.x - 12), sy(this.y - 26 + d * 8)); g.lineTo(sx(this.x + 12), sy(this.y - 14 - d * 8)); g.stroke(); } glow(this.x, this.y - 20, 14, VIOLET, (1 - k) * .8); }}); },
    assassinate(o){ add({x:o.tx, y:o.ty, life:.5, draw(k){ g.globalAlpha = 1 - k; g.strokeStyle = 'rgba(255,70,70,1)'; g.lineWidth = 5 * (1 - k) + 1; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx(this.x - 22), sy(this.y - 40)); g.lineTo(sx(this.x + 22), sy(this.y)); g.stroke();
      g.strokeStyle = WHITE; g.lineWidth = 1.5; g.stroke(); glow(this.x, this.y - 20, 26, RED, 1 - k); }}); burst(o.tx, o.ty, 16, 16, {s0:30, s1:120, vz0:20, vz1:80, p:{g:-200, size:R(1.5, 3), shape:'dot', col:'rgba(255,90,90,1)'}}); shake(4); flash('rgba(255,120,120,1)', .15); },
    thousand(o){ for (let i = 0; i < N(14); i++) later(R(0, o.hits * o.every + .1), () => { const a = R(0, TAU), x = o.x + Math.cos(a) * R(0, o.r), y = o.y + Math.sin(a) * R(0, o.r) * .45, b = R(0, TAU);
      add({x, y, b, life:.18, draw(k){ g.globalAlpha = 1 - k; g.strokeStyle = 'rgba(220,200,255,1)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(sx(this.x + Math.cos(this.b) * 12), sy(this.y - 16 + Math.sin(this.b) * 6)); g.lineTo(sx(this.x - Math.cos(this.b) * 12), sy(this.y - 16 - Math.sin(this.b) * 6)); g.stroke(); glow(this.x, this.y - 16, 8, VIOLET, 1 - k); }}); });
      add({x:o.x, y:o.y, r:o.r, life:.8, layer:'under', draw(k){ disc(this.x, this.y, this.r, 'rgba(60,30,90,1)', .3 * (1 - k)); }}); },
    coins(o){ burst(o.x, o.y, 6, 10, {s0:20, s1:60, vz0:40, vz1:90, p:{g:-240, size:R(1.8, 2.6), shape:'coin', col:'rgba(255,215,90,1)', add:false, life:.8}}); },
    smokeBomb(o){ burst(o.x, o.y, 6, 26, {s0:20, s1:90, vz0:5, vz1:40, p:{size:9, grow:18, shape:'smoke', col:'rgba(150,150,160,1)', add:false, life:R(.9, 1.3)}}); add({x:o.x, y:o.y, life:.25, draw(k){ glow(this.x, this.y - 12, 26, WHITE, 1 - k); }}); },
    shadowBlink(o){ for (const [x, y] of [[o.x, o.y], [o.x2, o.y2]]) burst(x, y, 10, 12, {s0:20, s1:60, vz0:5, vz1:30, p:{size:7, grow:12, shape:'smoke', col:'rgba(80,60,110,1)', add:false, life:.6}});
      add({x:o.x, y:o.y, x2:o.x2, y2:o.y2, life:.3, draw(k){ g.globalAlpha = (1 - k) * .7; g.strokeStyle = 'rgba(170,130,255,1)'; g.lineWidth = 3; g.beginPath(); g.moveTo(sx(this.x), sy(this.y - 16)); g.lineTo(sx(this.x2), sy(this.y2 - 16)); g.stroke(); }}); },
    poisonblade(o){},
    refine(o){ if (o.ok){ burst(o.x, o.y, 20, 26, {s0:30, s1:120, vz0:30, vz1:110, p:{g:-200, size:R(1.5, 3), shape:'dot', col:GOLDL}}); } else burst(o.x, o.y, 20, 10, {s0:10, s1:40, vz0:10, vz1:30, p:{size:8, grow:14, shape:'smoke', col:'rgba(110,105,100,1)', add:false, life:1}}); },
    /* a one-handed weapon's cut: a thin bright crescent sweeping across in front of the hero, from the weapon hand's side */
    swingArc(o){
      const ang = o.ang, fl = o.flip ? -1 : 1, big = o.kind === 'sword';
      add({x:o.x, y:o.y, life:big ? .22 : .17, draw(k){
        const e = 1 - Math.pow(1 - Math.min(1, k / .7), 2), r = (big ? 24 : 18), a0 = ang - fl * 1.4, a1 = a0 + fl * 2.6 * e, X = sx(this.x + Math.cos(ang) * 6), Y = sy(this.y - 18 + Math.sin(ang) * 4);
        g.save(); g.translate(X, Y); g.scale(1, .7); g.lineCap = 'round';
        const lo = fl > 0 ? Math.min(a0, a1) : Math.min(a0, a1), hi = Math.max(a0, a1), tail = Math.max(lo, hi - .9);
        g.globalAlpha = (1 - k) * .45; g.strokeStyle = big ? 'rgba(255,220,140,1)' : 'rgba(200,230,255,1)'; g.lineWidth = (big ? 7 : 5) * (1 - k) + 1;
        g.beginPath(); fl > 0 ? g.arc(0, 0, r, Math.max(a0, a1 - 1.1), a1) : g.arc(0, 0, r, a1, Math.min(a0, a1 + 1.1)); g.stroke();
        g.globalAlpha = 1 - k; g.strokeStyle = '#ffffff'; g.lineWidth = 1.6 * (1 - k) + .5;
        g.beginPath(); fl > 0 ? g.arc(0, 0, r, Math.max(a0, a1 - .7), a1) : g.arc(0, 0, r, a1, Math.min(a0, a1 + .7)); g.stroke();
        g.restore(); void tail; }});
    },
    /* the grand layer every skill gets on top of its own effect (sys/grandfx.js): a magic seal on the ground,
       a column of light, god-rays, double shockwaves, sparks that rain down and glints that twinkle (วิบวับ) */
    grand(o){
      const col = o.col || GOLD, p = Math.min(1.3, o.p || .5), r = (o.r || 36) * (.75 + p * .5), big = p >= .55, lo = !GFX.fx;
      add({x:o.x, y:o.y, r, layer:'under', life:.8 + p * .5, rot:R(0, TAU), draw(k){ const e = Math.min(1, k * 5); yantra(this.x, this.y, this.r * (.55 + .55 * e), col, (1 - k) * .95, this.rot + k * 2.4); if (big) yantra(this.x, this.y, this.r * .5 * e, WHITE, (1 - k) * .55, -this.rot - k * 3); disc(this.x, this.y, this.r * 1.1 * e, col, (1 - k) * .14); }});
      if (big) add({x:o.x, y:o.y, life:.5 + p * .35, w:5 + p * 11, draw(k){ const a = (1 - k) * (k < .12 ? k / .12 : 1), X = sx(this.x), Y = sy(this.y), h = 80 + p * 130, w = this.w * (1 - k * .5);
        g.globalAlpha = a * .75; const gr = g.createLinearGradient(X, Y - h, X, Y); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.55, col); gr.addColorStop(1, WHITE); g.fillStyle = gr; g.fillRect(X - w / 2, Y - h, w, h);
        g.globalAlpha = a; g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(X - w / 7, Y - h * .85, w / 3.5, h * .85); glow(this.x, this.y - 8, 26 + p * 34, col, a); }});
      if (big && !lo) add({x:o.x, y:o.y, life:.45 + p * .3, rot:R(0, TAU), draw(k){ const X = sx(this.x), Y = sy(this.y - 16), L = (36 + p * 70) * (.35 + k * .9), wd = 1 + p * 2.6;
        g.save(); g.translate(X, Y); g.scale(1, .7); g.rotate(this.rot + k * .9); g.globalAlpha = (1 - k) * .5; g.fillStyle = col;
        for (let i = 0; i < 12; i++){ g.rotate(TAU / 12); const l = L * (i % 2 ? .6 : 1); g.beginPath(); g.moveTo(0, -1.5); g.lineTo(l, -wd); g.lineTo(l, wd); g.lineTo(0, 1.5); g.fill(); } g.restore(); }});
      for (let i = 0; i < (p > .8 ? 3 : big ? 2 : 1); i++) later(i * .09, () => add({x:o.x, y:o.y, life:.5, layer:'under', draw(k){ ring(this.x, this.y, r * (.25 + k * 1.5), col, (1 - k) * .95, 3.2 * (1 - k) + .6); ring(this.x, this.y, r * (.2 + k * 1.35), WHITE, (1 - k) * .7, 1.2 * (1 - k) + .3); }}));
      burst(o.x, o.y, 14, Math.round(10 + p * 20), {s0:30, s1:90 + p * 90, vz0:30, vz1:90 + p * 80, l0:.7, l1:1.4, p:{g:-70, drag:1.4, size:2.4, shape:'star', col:Math.random() < .5 ? WHITE : col}});
      add({x:o.x, y:o.y, life:1.2 + p * .5, pts:[...Array(N(8 + p * 16))].map(() => ({dx:R(-1, 1) * r * 1.4, dy:R(-.6, .4) * r - R(6, 46), ph:R(0, TAU), f:R(7, 13), s:R(1.6, 3.6)})), draw(k){
        for (const q of this.pts){ const tw = Math.pow(Math.max(0, Math.sin(k * q.f + q.ph)), 4) * (1 - k * .8); if (tw < .05) continue; const X = sx(this.x + q.dx), Y = sy(this.y + q.dy - k * 10);
          glow(this.x + q.dx, this.y + q.dy - k * 10, q.s * 4, col, tw * .7); g.globalAlpha = tw; g.fillStyle = WHITE; star(X, Y, q.s * 2.3, q.s * .3, 4, 0); } }});
      // the element's signature on big skills
      if (big){ const el = o.elem, X = o.x, Y = o.y;
        if (el === 'fire') for (let i = 0; i < 7; i++){ const a = i / 7 * TAU, px = X + Math.cos(a) * r * .8, py = Y + Math.sin(a) * r * .4; later(i * .04, () => { for (let k = 0; k < N(6); k++) emit({x:px + R(-4, 4), y:py, z:R(0, 6), vz:R(70, 150), vx:R(-8, 8), life:R(.5, .8), size:R(3, 5), shape:'kanok', col:k % 2 ? FIRE : 'rgba(255,220,120,1)'}); glowAt(px, py - 10, 26, FIRE, .8); }); }
        else if (el === 'water') add({x:X, y:Y, life:1.1, sp:[...Array(9)].map((_, i) => ({a:i / 9 * TAU + R(-.2, .2), h:R(14, 26) * (.7 + p * .4)})), draw(k){ const grow = Math.min(1, k * 6), fade = k > .7 ? (1 - k) / .3 : 1;
          for (const q of this.sp){ const bx = sx(this.x + Math.cos(q.a) * r * .7), by = sy(this.y + Math.sin(q.a) * r * .35), h = q.h * grow, w = 4 + q.h * .12; g.globalAlpha = fade * .9; const gr = g.createLinearGradient(bx, by - h, bx, by); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(110,190,255,.85)'); g.fillStyle = gr;
            g.beginPath(); g.moveTo(bx - w, by); g.lineTo(bx - w * .2, by - h * .6); g.lineTo(bx, by - h); g.lineTo(bx + w * .3, by - h * .55); g.lineTo(bx + w, by); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = .6; g.stroke(); } }});
        else if (el === 'wind'){ for (let i = 0; i < N(26); i++){ const a = i / 26 * TAU * 2; emit({x:X + Math.cos(a) * 10, y:Y + Math.sin(a) * 5, z:i * 2, vz:R(30, 70), vx:-Math.sin(a) * 90, vy:Math.cos(a) * 40, drag:1.5, life:R(.6, 1), size:R(2.5, 4), shape:i % 3 ? 'leaf' : 'star', col:WIND}); }
          add({x:X, y:Y, life:.35, seed:Math.random(), draw(k){ g.globalAlpha = 1 - k; for (let i = 0; i < 3; i++) bolt(this.x + (i - 1) * r * .5, this.y - 160, this.x + (i - 1) * r * .3, this.y, 'rgba(180,255,230,1)', 1.4, this.seed + i, 2, 18); }}); }
        else if (el === 'earth'){ burst(X, Y, 4, 22, {s0:40, s1:130, vz0:80, vz1:170, p:{g:-380, size:3, shape:'rock', col:'rgba(150,120,90,1)', add:false, life:1}}); VFX.play('quake', {x:X, y:Y, r:r * 1.2}); }
        else if (el === 'holy') for (let i = 0; i < 5; i++){ const px = X + R(-r, r), py = Y + R(-r, r) * .45; later(i * .07, () => add({x:px, y:py, life:.6, draw(k){ const a = 1 - k, Xs = sx(this.x), Ys = sy(this.y); g.globalAlpha = a * .8; const gr = g.createLinearGradient(Xs, Ys - 200, Xs, Ys); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, GOLDL); g.fillStyle = gr; g.fillRect(Xs - 3, Ys - 200, 6, 200); glow(this.x, this.y, 18, GOLDL, a); }})); }
        else if (el === 'shadow') add({x:X, y:Y, life:1, draw(k){ g.save(); g.translate(sx(this.x), sy(this.y - 6)); g.scale(1, .45); for (let i = 0; i < 3; i++){ g.rotate(k * 4 + i * 2.1); g.globalAlpha = (1 - k) * .7; g.strokeStyle = i % 2 ? VIOLET : 'rgba(80,30,140,1)'; g.lineWidth = 3 - i * .6; g.beginPath(); g.arc(0, 0, r * (1.2 - k * .9) * (1 - i * .18), 0, 4.2); g.stroke(); } g.restore(); }});
      }
      // v56: no flash or shake on rapid crits
    },
    grandSelf(o){
      const col = o.col || GOLD, p = Math.min(1.2, o.p || .5);
      add({x:o.x, y:o.y, layer:'under', life:1.1, rot:R(0, TAU), draw(k){ yantra(this.x, this.y, 26 + k * 12, col, (1 - k), this.rot + k * 3); }});
      add({x:o.x, y:o.y, life:.9, draw(k){ const a = (1 - k) * (k < .1 ? k / .1 : 1), X = sx(this.x), Y = sy(this.y), h = 70 + p * 60; g.globalAlpha = a * .55;
        const gr = g.createLinearGradient(X, Y - h, X, Y); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, col); g.fillStyle = gr; g.beginPath(); g.ellipse(X, Y - h / 2, 16 + p * 6, h / 2, 0, 0, TAU); g.fill(); }});
      for (let i = 0; i < N(18 + p * 14); i++){ const a = i / 9 * TAU; emit({x:o.x + Math.cos(a) * 16, y:o.y + Math.sin(a) * 6, z:R(0, 10), vz:R(35, 70), vx:-Math.sin(a) * 22, vy:Math.cos(a) * 9, drag:1, life:R(.8, 1.4), size:R(1.8, 3), shape:'star', col:i % 2 ? WHITE : col}); }
    },
  };
  const ORB_COL = ['rgba(255,120,80,1)', 'rgba(255,240,200,1)', 'rgba(255,90,90,1)', 'rgba(150,230,140,1)', 'rgba(255,220,110,1)', 'rgba(255,170,220,1)', 'rgba(120,150,255,1)', 'rgba(170,140,255,1)', 'rgba(120,240,255,1)'];
  let stuck = [];                                     // arrows left standing in the ground for a moment
  let flashA = 0, flashCol = WHITE;
  function flash(col, a){ return;   // v56: no full-screen flashes (they read as blinking)
    if (!GFX.fx) return; flashCol = col; flashA = Math.max(flashA, a); }
  function glowAt(x, y, r, col, a){ add({x, y, r, col, a, life:.25, draw(k){ glow(this.x, this.y, this.r, this.col, this.a * (1 - k)); }}); }
  function star(x, y, R0, r0, n, rot){ g.beginPath(); for (let i = 0; i <= n * 2; i++){ const a = rot + i / (n * 2) * TAU, rr = i % 2 ? r0 : R0; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); }

  /* ---------- update ---------- */
  function update(dt){
    if (shakeT > 0) shakeT -= dt; else shakeA = 0;
    if (flashA > 0) flashA = Math.max(0, flashA - dt * 1.6);
    for (const p of parts){
      p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz += p.g * dt;
      if (p.drag){ const f = Math.max(0, 1 - p.drag * dt); p.vx *= f; p.vy *= f; }
      if (p.z < 0 && p.g < 0){ p.z = 0; p.vz *= -.3; p.vx *= .6; p.vy *= .6; }
      p.rot += p.vr * dt;
    }
    parts = parts.filter(p => p.t < p.life);
    for (const f of fxs) f.t += dt; fxs = fxs.filter(f => f.t < f.life);
    for (const s of stuck) s.t -= dt; stuck = stuck.filter(s => s.t > 0);
    // trails behind projectiles
    for (const p of projs){ if (p.delay > 0) continue;
      if (p.k === 'fire' && Math.random() < .9 * lvlMul()) emit({x:p.x + R(-2, 2), y:p.y + R(-2, 2), vz:R(5, 20), vx:R(-10, 10), life:R(.25, .45), size:R(1.6, 3), shape:'dot', col:'rgba(255,170,70,1)'});
      if (p.k === 'holy' && Math.random() < .7 * lvlMul()) emit({x:p.x, y:p.y + R(-3, 3), vz:R(-5, 5), life:R(.3, .5), size:R(1, 2), shape:'star', col:GOLDL});
      if (p.k === 'ice' && Math.random() < .7 * lvlMul()) emit({x:p.x, y:p.y + R(-3, 3), vz:R(-5, 5), life:R(.3, .5), size:R(1, 2), shape:'star', col:'rgba(220,250,255,1)'});
      if (p.k === 'dart' && Math.random() < .5 * lvlMul()) emit({x:p.x, y:p.y, life:.3, size:1.5, shape:'dot', col:POISON});
    }
    // warp gates: sparkles drift up the light pillar
    if (typeof GATES !== 'undefined' && !globalThis.GATE_V2) for (const gt of GATES) if (Math.random() < dt * 9 * lvlMul()) emit({x:gt.x + R(-12, 12), y:gt.y + R(-4, 4), z:R(0, 20), vz:R(25, 55), vx:R(-4, 4), life:R(1.2, 2.2), size:R(1.2, 2.4), shape:Math.random() < .3 ? 'star' : 'glow', col:Math.random() < .5 ? 'rgba(170,240,255,1)' : 'rgba(255,224,150,1)'});
    // poisoned monsters bubble
    for (const m of mobs) if (m.st && m.st.poison > 0 && Math.random() < dt * 4 * lvlMul()) emit({x:m.x + R(-6, 6), y:m.y, z:MOB_H[m.type] * R(.3, .8), vz:R(10, 25), life:.7, size:R(1.5, 3), shape:'bubble', col:POISON, add:false});
  }


  /* ---------- warp points between maps: a sacred light gate ----------
     ground: a rotating golden yantra with a lotus of light and aura ripples rolling outward;
     body (drawn in depth order): a tall pillar of light with a cyan core, spiralling motes, a crystal lotus
     hovering on top and light rays fanning out. Sparkles keep rising from it (see update). */
  const GATE_C = 'rgba(120,230,255,1)', GATE_G = 'rgba(255,214,120,1)';
  function gateGround(gt){
    const x = gt.x, y = gt.y, t = T;
    g.save(); g.globalCompositeOperation = 'lighter';
    glow(x, y, 70, GATE_C, .35 + Math.sin(t * 2) * .08); glow(x, y, 46, GATE_G, .22);
    disc(x, y, 40, 'rgba(90,200,255,1)', .14);
    yantra(x, y, 40, GATE_G, .85, t * .5);
    yantra(x, y, 28, GATE_C, .75, -t * .8);
    // lotus petals of light
    g.save(); g.translate(sx(x), sy(y)); g.scale(1, .45); g.rotate(t * .3); g.globalAlpha = .55; g.strokeStyle = 'rgba(255,240,190,1)'; g.lineWidth = 1.2;
    for (let i = 0; i < 8; i++){ g.rotate(TAU / 8); g.beginPath(); g.moveTo(0, -6); g.quadraticCurveTo(7, -14, 0, -22); g.quadraticCurveTo(-7, -14, 0, -6); g.stroke(); }
    g.restore();
    // aura ripples rolling outward
    for (let i = 0; i < 3; i++){ const k = (t * .45 + i / 3) % 1; ring(x, y, 22 + k * 58, i % 2 ? GATE_C : GATE_G, (1 - k) * .7, 1.6 - k); }
    // rune ticks on the outer rim
    g.globalAlpha = .7; g.fillStyle = GATE_G; for (let i = 0; i < 16; i++){ const a = i / 16 * TAU + t * .5; g.fillRect(sx(x + Math.cos(a) * 46) - 1, sy(y + Math.sin(a) * 46 * .45) - 1, 2, 2); }
    g.restore();
  }
  function drawGate(ctx, gt, cx, cy){
    begin(ctx, cx, cy); const x = gt.x, y = gt.y, t = T, H = 130, pulse = .8 + Math.sin(t * 3) * .2;
    g.save(); g.globalCompositeOperation = 'lighter';
    // pillar of light: wide soft beam + bright core
    for (const [w, a, c0] of [[30, .28, 'rgba(110,210,255,'], [16, .45, 'rgba(170,240,255,'], [6, .8, 'rgba(255,255,255,']]){
      const gr = g.createLinearGradient(0, sy(y - H), 0, sy(y)); gr.addColorStop(0, c0 + '0)'); gr.addColorStop(.35, c0 + (a * .6 * pulse) + ')'); gr.addColorStop(1, c0 + (a * pulse) + ')');
      g.globalAlpha = 1; g.fillStyle = gr; g.beginPath(); g.moveTo(sx(x - w * .5), sy(y)); g.lineTo(sx(x - w * .32), sy(y - H)); g.lineTo(sx(x + w * .32), sy(y - H)); g.lineTo(sx(x + w * .5), sy(y)); g.closePath(); g.fill(); }
    // light rays fanning from the crystal
    const cyy = y - 74 + Math.sin(t * 2) * 4;
    g.save(); g.translate(sx(x), sy(cyy)); g.rotate(t * .25);
    for (let i = 0; i < 12; i++){ g.rotate(TAU / 12); g.globalAlpha = (.18 + .12 * Math.sin(t * 3 + i)) * pulse; g.fillStyle = i % 2 ? 'rgba(255,220,140,1)' : 'rgba(150,230,255,1)';
      g.beginPath(); g.moveTo(0, -3); g.lineTo(46 + (i % 3) * 8, 0); g.lineTo(0, 3); g.closePath(); g.fill(); }
    g.restore();
    glow(x, cyy, 34, GATE_C, .7 * pulse); glow(x, cyy, 18, 'rgba(255,255,255,1)', .8);
    // spiralling motes around the pillar
    for (let i = 0; i < 14; i++){ const k = (t * .35 + i / 14) % 1, a = k * TAU * 2 + i, r = 14 + Math.sin(k * Math.PI) * 6, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * .45 - k * H * .9;
      g.globalAlpha = Math.sin(k * Math.PI) * .9; g.fillStyle = i % 3 ? 'rgba(200,245,255,1)' : 'rgba(255,225,150,1)'; g.fillRect(sx(px) - 1, sy(py) - 1, 2, 2); }
    g.restore();
    // crystal lotus hovering on top (solid, drawn normally)
    g.save(); g.translate(sx(x), sy(cyy)); const sp = Math.cos(t * 1.6);
    g.globalAlpha = 1; g.fillStyle = 'rgba(120,210,250,1)'; g.beginPath(); g.moveTo(0, -12); g.lineTo(6 * sp, 0); g.lineTo(0, 12); g.lineTo(-6 * sp, 0); g.closePath(); g.fill();
    g.fillStyle = 'rgba(235,252,255,1)'; g.beginPath(); g.moveTo(0, -12); g.lineTo(2.5 * sp, -1); g.lineTo(0, 12); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,214,120,1)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -12); g.lineTo(6 * sp, 0); g.lineTo(0, 12); g.lineTo(-6 * sp, 0); g.closePath(); g.stroke();
    g.fillStyle = 'rgba(255,214,120,1)'; for (const s2 of [-1, 1]){ g.beginPath(); g.moveTo(0, 12); g.quadraticCurveTo(s2 * 10, 10, s2 * 12, 3); g.quadraticCurveTo(s2 * 6, 8, 0, 12); g.fill(); }
    g.restore();
  }

  /* ---------- draw ---------- */
  function begin(ctx, cx, cy){ g = ctx; CX = cx; CY = cy; }
  function drawLayer(layer){
    g.save();
    if (layer === 'over') g.globalCompositeOperation = 'lighter';
    for (const f of fxs){ if (f.layer !== layer || f.bad) continue; const k = clamp(f.t / f.life, 0, 1); g.globalAlpha = 1;
      // one broken effect (a bad number) is dropped instead of stopping the whole game
      g.save(); try { f.draw.call(f, k, f); } catch (e) { f.bad = true; f.t = f.life; console.warn('vfx dropped', e && e.message); } g.restore(); }
    g.restore();
  }
  function drawUnder(ctx, cx, cy){
    begin(ctx, cx, cy);
    // traps: bamboo spikes in a ring
    g.save();
    for (const tr of TRAPS){ const a = tr.arm > 0 ? .5 : 1; g.globalAlpha = a; g.fillStyle = 'rgba(60,45,30,.5)'; g.beginPath(); g.ellipse(sx(tr.x), sy(tr.y), 10, 4.5, 0, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(200,170,100,1)'; g.lineWidth = 1.2; for (let i = 0; i < 8; i++){ const an = i / 8 * TAU; g.beginPath(); g.moveTo(sx(tr.x + Math.cos(an) * 8), sy(tr.y + Math.sin(an) * 3.6)); g.lineTo(sx(tr.x + Math.cos(an) * 5), sy(tr.y + Math.sin(an) * 2.2 - 5)); g.stroke(); } }
    for (const s of stuck){ g.globalAlpha = Math.min(1, s.t); g.strokeStyle = 'rgba(230,215,180,1)'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx(s.x), sy(s.y)); g.lineTo(sx(s.x - 3), sy(s.y - 8)); g.stroke(); }
    g.restore();
    drawLayer('under');
    if (typeof GATES !== 'undefined' && !globalThis.GATE_V2) for (const gt of GATES) gateGround(gt);
    // persistent buffs under the player
    if (P.buffs.goldshield){ const b = P.buffs.goldshield; yantra(P.x, P.y, 20, GOLD, .55 * Math.min(1, b.t), T * .8); }
  }
  function drawOver(ctx, cx, cy){
    begin(ctx, cx, cy);
    drawLayer('over');
    g.save(); g.globalCompositeOperation = 'lighter';
    // persistent buff auras
    if (P.buffs.barrier){ ring(P.x, P.y - 18, 22 + Math.sin(T * 4), 'rgba(140,200,255,1)', .55, 1.5, .95); glow(P.x, P.y - 18, 26, 'rgba(110,170,255,1)', .18); }
    if (P.buffs.goldshield){ const a = .35 + Math.sin(T * 5) * .1; ring(P.x, P.y - 18, 24, GOLDL, a, 1.4, .95); }
    if (DER && DER.pas && DER.pas.orbs && !P.dead && GFX.fx){ for (let i = 0; i < 9; i++){ const a = T * 1.6 + i / 9 * TAU; glow(P.x + Math.cos(a) * 20, P.y - 22 + Math.sin(a) * 7, 4.5, ORB_COL[i], .9); } }
    // particles
    for (const p of parts){
      const k = p.t / p.life, a = p.alpha * (k < .15 ? k / .15 : 1 - (k - .15) / .85), size = p.size + p.grow * k;
      const x = sx(p.x), y = sy(p.y - p.z);
      g.globalCompositeOperation = p.add ? 'lighter' : 'source-over';
      g.globalAlpha = Math.max(0, a);
      switch (p.shape){
        case 'glow': g.drawImage(glowTex(p.col), x - size, y - size, size * 2, size * 2); break;
        case 'dot': g.fillStyle = p.col; g.fillRect(x - size / 2, y - size / 2, size, size); break;
        case 'kanok': g.save(); g.translate(x, y); g.rotate(p.rot * .2); g.drawImage(kanokTex(p.col), -size * .75, -size * 1.8, size * 1.5, size * 2); g.restore(); break;
        case 'petal': g.save(); g.translate(x, y); g.rotate(p.rot); g.fillStyle = p.col; g.beginPath(); g.ellipse(0, 0, size, size * .45, 0, 0, TAU); g.fill(); g.restore(); break;
        case 'leaf': g.save(); g.translate(x, y); g.rotate(p.rot); g.fillStyle = p.col; g.beginPath(); g.moveTo(-size, 0); g.quadraticCurveTo(0, -size * .7, size, 0); g.quadraticCurveTo(0, size * .7, -size, 0); g.fill(); g.restore(); break;
        case 'shard': g.save(); g.translate(x, y); g.rotate(p.rot); g.fillStyle = p.col; g.beginPath(); g.moveTo(0, -size); g.lineTo(size * .45, 0); g.lineTo(0, size); g.lineTo(-size * .45, 0); g.fill(); g.restore(); break;
        case 'rock': g.fillStyle = p.col; g.fillRect(x - size / 2, y - size / 2, size, size * .8); break;
        case 'line': g.save(); g.translate(x, y); g.rotate(p.rot); g.fillStyle = p.col; g.fillRect(-size * 1.5, -.5, size * 3, 1); g.restore(); break;
        case 'smoke': g.fillStyle = p.col; g.globalAlpha = Math.max(0, a) * .45; g.beginPath(); g.arc(x, y, size, 0, TAU); g.fill(); break;
        case 'star': g.fillStyle = p.col; star(x, y, size, size * .35, 4, p.rot); break;
        case 'plus': g.fillStyle = p.col; g.fillRect(x - size / 2, y - .75, size, 1.5); g.fillRect(x - .75, y - size / 2, 1.5, size); break;
        case 'bubble': g.strokeStyle = p.col; g.lineWidth = 1; g.beginPath(); g.arc(x, y, size, 0, TAU); g.stroke(); break;
        case 'coin': g.fillStyle = p.col; g.beginPath(); g.ellipse(x, y, size, size * Math.abs(Math.cos(p.rot * 3)) + .4, 0, 0, TAU); g.fill(); break;
        case 'flame': { g.save(); g.translate(x, y); g.rotate(p.rot * .15); const f = size;
          g.fillStyle = p.col; g.beginPath(); g.moveTo(0, -f * 1.9); g.quadraticCurveTo(f * 1.1, -f * .3, f * .7, f * .4); g.quadraticCurveTo(0, f * 1.1, -f * .7, f * .4); g.quadraticCurveTo(-f * 1.1, -f * .3, 0, -f * 1.9); g.fill();
          g.fillStyle = 'rgba(255,240,190,1)'; g.beginPath(); g.ellipse(0, f * .1, f * .35, f * .6, 0, 0, TAU); g.fill(); g.restore(); break; }
        case 'flake': { g.save(); g.translate(x, y); g.rotate(p.rot); g.strokeStyle = p.col; g.lineWidth = Math.max(.6, size * .22); g.beginPath();
          for (let i = 0; i < 3; i++){ const a = i * Math.PI / 3, c = Math.cos(a) * size, s2 = Math.sin(a) * size; g.moveTo(-c, -s2); g.lineTo(c, s2); }
          g.stroke(); g.restore(); break; }
        case 'note': g.fillStyle = p.col; g.beginPath(); g.ellipse(x, y, 2.2, 1.6, -.4, 0, TAU); g.fill(); g.fillRect(x + 1.4, y - 7, 1, 7); break;
      }
    }
    g.restore();
  }
  /* projectiles (stone, bolts, arrows, darts) */
  function drawProj(ctx, p, cx, cy){
    begin(ctx, cx, cy);
    const x = Math.round(sx(p.x)), y = Math.round(sy(p.y));
    g.save();
    if (p.k === 'arrow'){
      // a real arrow inside a streak of light coloured by the arrow's element (the worn quiver)
      const el = p.elem || 'neutral', col = ELC[el] || GOLD, ang = p.ang || 0;
      g.translate(x, y); g.rotate(ang);
      g.globalCompositeOperation = 'lighter';
      const tr = g.createLinearGradient(-30, 0, 4, 0); tr.addColorStop(0, 'rgba(0,0,0,0)'); tr.addColorStop(1, col);
      g.globalAlpha = .8; g.fillStyle = tr; g.fillRect(-30, -2.2, 34, 4.4); g.globalAlpha = 1; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(-16, -.5, 18, 1);
      g.drawImage(glowTex(col), -6, -7, 16, 14);
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#8a6a3a'; g.fillRect(-11, -.6, 14, 1.4);                                   // shaft
      g.fillStyle = el === 'neutral' ? '#d0d6dc' : col; g.beginPath(); g.moveTo(7, 0); g.lineTo(2, -2.4); g.lineTo(2, 2.4); g.closePath(); g.fill();   // head
      g.fillStyle = el === 'neutral' ? '#f06e5a' : '#f4f0e8'; g.fillRect(-12, -2, 3, 1.4); g.fillRect(-12, .7, 3, 1.4);   // fletching
      if (GFX.fx && Math.random() < .8 * lvlMul()){ const bx = p.x - Math.cos(ang) * 10, by = p.y - Math.sin(ang) * 10;
        const sh = {fire:'flame', water:'flake', wind:'line', earth:'rock', holy:'star', shadow:'smoke'}[el] || 'dot';
        emit({x:bx, y:by + 14, z:14, vx:R(-10, 10), vy:R(-5, 5), vz:R(-6, 12), life:R(.2, .45), size:sh === 'smoke' ? 3 : R(1.2, 2.4), grow:sh === 'smoke' ? 5 : 0, shape:sh, col:el === 'fire' ? 'rgba(235,85,25,1)' : col, add:sh !== 'flame' && sh !== 'rock' && sh !== 'smoke' && sh !== 'flake', rot:ang, vr:sh === 'line' ? 0 : R(-3, 3)}); }
    }
    else if (p.k === 'stone'){ g.translate(x, y); g.rotate((p.ang || 0) + T * 12); g.fillStyle = '#8f877b'; g.fillRect(-2.5, -2, 5, 4); g.fillStyle = '#b8b0a2'; g.fillRect(-2.5, -2, 3, 2); }
    else if (p.k === 'dart'){ g.translate(x, y); g.rotate(p.ang || 0); g.fillStyle = '#9adf62'; g.fillRect(-6, -.5, 8, 1); g.fillStyle = '#e8f0c0'; g.fillRect(-7, -1.5, 2, 3); }
    else if (p.k === 'holy'){ g.globalCompositeOperation = 'lighter'; g.drawImage(glowTex(GOLDL), x - 12, y - 12, 24, 24); g.drawImage(glowTex('rgba(150,220,255,1)'), x - 6, y - 6, 12, 12); }
    else if (p.k === 'orb'){
      // staff bolt: a spinning arcane orb tinted by the weapon element, with a short comet tail
      const col = ELC[p.elem] && p.elem !== 'neutral' ? ELC[p.elem] : 'rgba(170,140,255,1)';
      g.globalCompositeOperation = 'lighter'; g.drawImage(glowTex(col), x - 12, y - 12, 24, 24); g.drawImage(glowTex(WHITE), x - 4, y - 4, 8, 8);
      g.translate(x, y); g.rotate(T * 10); g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, 5, 0, 4); g.stroke();
      if (GFX.fx && Math.random() < .7 * lvlMul()) emit({x:p.x, y:p.y + 14, z:14, vx:R(-8, 8), vz:R(-4, 6), life:R(.2, .4), size:R(1.2, 2), shape:'star', col});
    }
    else if (p.k === 'ice'){
      // ice lance: a pale crystal spear in a cold halo, shedding snowflakes and mist
      g.globalCompositeOperation = 'lighter'; g.drawImage(glowTex(ICE), x - 16, y - 16, 32, 32); g.globalCompositeOperation = 'source-over';
      g.translate(x, y); g.rotate(p.ang || 0);
      g.fillStyle = 'rgba(120,190,240,1)'; g.beginPath(); g.moveTo(10, 0); g.lineTo(-1, -3.6); g.lineTo(-11, 0); g.lineTo(-1, 3.6); g.closePath(); g.fill();
      g.fillStyle = 'rgba(235,252,255,1)'; g.beginPath(); g.moveTo(10, 0); g.lineTo(-1, -2); g.lineTo(-8, 0); g.closePath(); g.fill();
      g.fillStyle = 'rgba(190,235,255,1)'; for (const sd of [-1, 1]){ g.beginPath(); g.moveTo(-3, sd * 2.5); g.lineTo(-8, sd * 6); g.lineTo(-6, sd * 2); g.fill(); }
      if (GFX.fx && Math.random() < .7 * lvlMul()){ const bx = p.x - Math.cos(p.ang || 0) * 8, by = p.y - Math.sin(p.ang || 0) * 8;
        emit({x:bx, y:by + 16, z:16 + R(-3, 3), vx:R(-12, 12), vy:R(-6, 6), vz:R(-8, 8), life:R(.4, .8), size:R(1.6, 2.8), shape:'flake', col:'rgba(225,248,255,1)', add:false, vr:R(-4, 4)});
        if (Math.random() < .4) emit({x:bx, y:by + 16, z:16, vz:R(2, 8), life:.6, size:3, grow:6, shape:'smoke', col:'rgba(200,235,255,1)', add:false}); }
    }
    else {
      // fire bolt: a tear of flame pointing along its flight, white-hot core, embers and flame licks behind
      g.globalCompositeOperation = 'lighter'; const f = 1 + Math.sin(T * 30 + (p.wob || 0)) * .15;
      g.globalAlpha = .55; g.drawImage(glowTex('rgba(255,90,20,1)'), x - 14 * f, y - 14 * f, 28 * f, 28 * f); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      g.translate(x, y); g.rotate((p.ang || 0) + Math.PI / 2);
      g.fillStyle = 'rgba(190,40,15,1)'; g.beginPath(); g.moveTo(0, -7); g.quadraticCurveTo(7.5 * f, 3, 0, 17 * f); g.quadraticCurveTo(-7.5 * f, 3, 0, -7); g.fill();
      g.fillStyle = 'rgba(255,110,30,1)'; g.beginPath(); g.moveTo(0, -6); g.quadraticCurveTo(6 * f, 2, 0, 15 * f); g.quadraticCurveTo(-6 * f, 2, 0, -6); g.fill();
      g.fillStyle = 'rgba(255,200,80,1)'; g.beginPath(); g.moveTo(0, -4); g.quadraticCurveTo(3.6, 1, 0, 9 * f); g.quadraticCurveTo(-3.6, 1, 0, -4); g.fill();
      g.fillStyle = 'rgba(255,250,225,1)'; g.beginPath(); g.ellipse(0, -1.5, 1.8, 2.6, 0, 0, TAU); g.fill();
      if (GFX.fx && Math.random() < .9 * lvlMul()){ const bx = p.x - Math.cos(p.ang || 0) * 6, by = p.y - Math.sin(p.ang || 0) * 6;
        emit({x:bx, y:by + 16, z:16 + R(-2, 2), vx:R(-10, 10), vy:R(-5, 5), vz:R(10, 30), life:R(.25, .45), size:R(1.8, 3), shape:'flame', col:'rgba(235,80,25,1)', add:false});
        if (Math.random() < .5) emit({x:bx, y:by + 16, z:16, vx:R(-30, 30), vy:R(-14, 14), vz:R(20, 60), g:-60, life:R(.4, .7), size:R(1, 1.6), shape:'dot', col:'rgba(255,210,120,1)'}); }
    }
    g.restore();
  }
  /* the spirit tiger: a translucent orange beast with dark stripes, drawn among the characters */
  function drawTiger(ctx, s, cx, cy){
    begin(ctx, cx, cy);
    const x = sx(s.x), y = sy(s.y), face = Math.cos((s.dir || 0) * Math.PI / 4 + Math.PI / 2) < 0 ? -1 : 1, run = s.moving ? Math.sin(s.t * 14) : 0, lunge = s.pounce > 0 ? s.pounce * 20 : 0;
    const fade = Math.min(1, s.t * 3, (s.dur - s.t) * 2);
    g.save(); g.translate(x + face * lunge, y); g.scale(face, 1);
    g.globalAlpha = .28 * fade; g.fillStyle = 'rgba(30,15,5,1)'; g.beginPath(); g.ellipse(0, 0, 18, 5, 0, 0, TAU); g.fill();
    g.globalCompositeOperation = 'lighter'; g.drawImage(glowTex('rgba(255,140,50,1)'), -30, -40, 60, 50); g.globalCompositeOperation = 'source-over';
    g.globalAlpha = .85 * fade;
    const body = 'rgba(255,165,70,1)', dark = 'rgba(90,40,15,1)';
    g.fillStyle = body;
    for (const [lx, ph] of [[-10, 0], [-5, Math.PI], [7, Math.PI], [12, 0]]){ const sw = Math.sin(s.t * 14 + ph) * 4 * (s.moving ? 1 : 0); g.fillRect(lx + sw - 2, -10, 4, 10); }
    g.beginPath(); g.ellipse(0, -16, 17, 8, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(17, -22 + run, 8, 7, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(12, -28); g.lineTo(14, -32); g.lineTo(17, -28); g.fill(); g.beginPath(); g.moveTo(19, -28); g.lineTo(22, -32); g.lineTo(23, -27); g.fill();
    g.strokeStyle = body; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-16, -18); g.quadraticCurveTo(-26, -24 + run * 3, -24, -32); g.stroke();
    g.fillStyle = dark; for (const sx0 of [-10, -5, 0, 5, 10]) g.fillRect(sx0, -23, 1.6, 7);
    g.fillRect(15, -26 + run, 1.5, 3); g.fillStyle = 'rgba(255,255,220,1)'; g.fillRect(20, -24 + run, 2, 2);
    g.fillStyle = 'rgba(255,240,220,1)'; g.beginPath(); g.ellipse(21, -19 + run, 4, 2.5, 0, 0, TAU); g.fill();
    g.restore();
    if (Math.random() < .3 * lvlMul()) emit({x:s.x + R(-14, 14), y:s.y, z:R(6, 24), vz:R(10, 25), life:.6, size:R(1.5, 3), shape:'dot', col:'rgba(255,170,80,1)'});
  }
  function drawFlash(ctx, w, h){ if (flashA <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = flashA * .5; ctx.fillStyle = flashCol; ctx.fillRect(0, 0, w, h); ctx.restore(); }
  function play(key, o){ const f = E[key]; if (f) f(o || {}); }
  return {play, update, drawUnder, drawOver, drawProj, drawTiger, drawGate, drawFlash, shake, shakeOffset};
})();
