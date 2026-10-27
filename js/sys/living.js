/* VAYRATHEN — js/sys/living.js — a living world
   Everything here is drawn on top of the painted ground each frame, without touching game state:
   · trees, palms, bamboo, reeds and bushes sway in a gusting wind (and rustle when you brush past)
   · water glints, ripples, drifts with the current and laps at the shore; a fish jumps now and then;
     lava pools glow and bubble; ice catches a sweeping glint
   · flocks of birds cross the sky, butterflies and dragonflies by day,
     fireflies at night, leaves drift down from the trees, lamps and crystals flicker, chimneys smoke
   It all follows the graphics level (GFX.fx: 0 low · 1 medium · 2 high). */
'use strict';

const LIVE = (() => {
  // effect level follows the graphics preset, and steps down by itself while the frame rate is struggling (< 28 FPS)
  const lv = () => Math.max(0, (typeof GFX !== 'undefined' ? GFX.fx : 1) - (typeof PERF !== 'undefined' && PERF.fps < 28 && PERF.fps > 0 ? 1 : 0));
  const H1 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const wind = () => .62 + .3 * Math.sin(T * .23) + .12 * Math.sin(T * .71 + 1);
  const outdoor = () => { const B = MAP_ID ? BIOME[MAPS[MAP_ID].biome] : null; return !B || (B.fx !== 'dark'); };
  const view = (x, y, m = 60) => x > cam.x - m && x < cam.x + VW + m && y > cam.y - m && y < cam.y + VH + m;

  /* ---------- swaying plants ---------- */
  const SWAY = {tree:[.022, 1.05], palm:[.04, .85], bamboo:[.055, 1.25], banana:[.032, 1], himtree:[.024, .95], pine:[.016, 1.15], reed:[.08, 1.6], bush:[.02, 1.35], deadtree:[.008, .7], coral:[.035, .6]};
  const RUSTLE = {bush:1, reed:1, bamboo:1, banana:1};
  function sway(p){
    const s = SWAY[p.type]; if (!s || !lv()) return 0;
    let k = s[0] * wind() * (Math.sin(T * s[1] + p.x * .013 + p.y * .007) * .72 + Math.sin(T * s[1] * 2.3 + p.x * .05) * .28);
    if (RUSTLE[p.type]){
      if (P.moving && Math.abs(P.x - p.x) < 24 && Math.abs(P.y - p.y) < 14) p.rusT = T;
      const r = p.rusT ? Math.max(0, 1 - (T - p.rusT) * 1.4) : 0; if (r > 0) k += Math.sin(T * 19 + p.x) * .07 * r;
    }
    return k;
  }

  /* ---------- water ---------- */
  const star = (g, x, y, r, a) => { g.globalAlpha = a; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * .25, y - r * .25); g.lineTo(x + r, y); g.lineTo(x + r * .25, y + r * .25); g.lineTo(x, y + r); g.lineTo(x - r * .25, y + r * .25); g.lineTo(x - r, y); g.lineTo(x - r * .25, y - r * .25); g.closePath(); g.fill(); };
  function surface(g, w, pts, area){
    // pts(u, v) → a point inside the water for 0..1 hashes; area = how many glints it can hold
    const L = lv(), n = Math.min(L ? 46 : 18, Math.round(area / (L > 1 ? 650 : 1100)));
    if (w.kind === 'lava'){
      g.fillStyle = `rgba(255,150,40,${.1 + .07 * Math.sin(T * 1.6 + w.seed)})`; g.fillRect(-10, -10, VW + 20, VH + 20);
      for (let i = 0; i < n; i++){ const s = w.seed + i * 3.7, per = 2.2 + H1(s) * 1.8, ph = ((T + H1(s + 1) * per) % per) / per, cyc = Math.floor((T + H1(s + 1) * per) / per);
        const [x, y] = pts(H1(s + cyc * .13), H1(s + 2 + cyc * .17)); if (!view(x + cam.x, y + cam.y, 10)) continue;
        if (ph < .8){ const r = Math.max(.2, 1 + ph * 4); g.fillStyle = `rgba(255,${200 - ph * 80 | 0},80,${.85 - ph * .4})`; g.beginPath(); g.ellipse(x, y, r, r * .7, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,250,200,.7)'; g.beginPath(); g.arc(x - r * .3, y - r * .3, r * .3, 0, 7); g.fill(); }
        else { const k = (ph - .8) / .2; g.strokeStyle = `rgba(255,210,90,${(1 - k) * .8})`; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, 4 + k * 7, (4 + k * 7) * .5, 0, 0, 7); g.stroke(); } }
      return;
    }
    const ice = w.kind === 'ice';
    // drifting wave crests
    g.lineWidth = 1; g.lineCap = 'round';
    for (let i = 0; i < n; i++){ const s = w.seed + i * 1.93; let [x, y] = pts(H1(s), H1(s + .5));
      const fw = (T * 14 + s * 40) % 60;
      x += Math.sin(T * .45 + s) * 7 + (w.flow || 0) * (fw - 30); y += Math.cos(T * .38 + s * 1.3) * 2;
      const a = ((ice ? .14 : .26) + .2 * Math.sin(T * 1.6 + s * 3)) * (w.flow ? Math.sin(fw / 60 * Math.PI) : 1), l = 5 + H1(s + 3) * 7;
      if (a <= 0) continue; g.strokeStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.moveTo(x - l, y); g.quadraticCurveTo(x, y - 1.8, x + l, y); g.stroke(); }
    // sun glints
    g.fillStyle = '#fff';
    for (let i = 0; i < n * .5; i++){ const s = w.seed + 50 + i * 2.71, a = Math.pow(Math.max(0, Math.sin(T * 2.1 + s * 5)), 10); if (a < .05) continue; const [x, y] = pts(H1(s), H1(s + .3)); star(g, x, y, 1.6 + a * 1.4, a * .95); }
    g.globalAlpha = 1;
    if (ice){ const k = ((T * .12 + w.seed * .01) % 1.6) - .3; const [x0, y0] = pts(k, .5); const gr = g.createLinearGradient(x0 - 40, y0 - 30, x0 + 40, y0 + 30); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,.16)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x0 - 60, y0 - 200, 120, 400); return; }
    // ripple rings (a drop, a bug, a fish under the surface)
    for (let j = 0; j < Math.max(1, Math.round(n / 10)); j++){ const s = w.seed + 90 + j * 5.3, per = 3.2 + H1(s) * 2, t0 = T + H1(s + 1) * per, ph = (t0 % per) / per, cyc = Math.floor(t0 / per);
      if (ph > .6) continue; const k = ph / .6, [x, y] = pts(H1(s + cyc * .31), H1(s + 2 + cyc * .23));
      for (let q = 0; q < 2; q++){ const kk = k - q * .25; if (kk <= 0) continue; g.strokeStyle = `rgba(255,255,255,${(1 - kk) * .45})`; g.beginPath(); g.ellipse(x, y, 2 + kk * 15, (2 + kk * 15) * .42, 0, 0, 7); g.stroke(); } }
    // a fish leaps
    if (lv() && !w.foam){ const s = w.seed + 300, per = 6.5 + H1(s) * 4, t0 = T + H1(s + 1) * per, ph = t0 % per, cyc = Math.floor(t0 / per);
      if (ph < 1.05){ const [x, y] = pts(.3 + H1(s + cyc) * .4, .3 + H1(s + 4 + cyc) * .4), dir = H1(s + 9 + cyc) < .5 ? -1 : 1;
        if (ph < .7){ const k = ph / .7, fx = x + dir * (k - .5) * 22, fy = y - Math.sin(k * Math.PI) * 13, ang = dir * (k - .5) * 2.4;
          g.save(); g.translate(fx, fy); g.rotate(ang); g.fillStyle = '#c8d4dc'; g.beginPath(); g.ellipse(0, 0, 4.2, 1.6, 0, 0, 7); g.fill(); g.fillStyle = '#8a9ca8'; g.beginPath(); g.moveTo(-dir * 3.6, 0); g.lineTo(-dir * 6.4, -2); g.lineTo(-dir * 6.4, 2); g.closePath(); g.fill(); g.restore();
          if (k < .2 || k > .8){ g.fillStyle = 'rgba(255,255,255,.7)'; for (let d = 0; d < 4; d++) g.fillRect(x + dir * ((k < .5 ? -11 : 11)) + (d - 1.5) * 2, y - 2 - H1(d + cyc) * 4, 1, 1); } }
        else { const k = (ph - .7) / .35; g.strokeStyle = `rgba(255,255,255,${(1 - k) * .6})`; g.beginPath(); g.ellipse(x + dir * 11, y, 3 + k * 12, (3 + k * 12) * .4, 0, 0, 7); g.stroke(); } } }
  }
  function drawWater(g){
    for (const w of WATERS){
      if (w.k === 'pond'){
        if (!view(w.x, w.y, Math.max(w.rx, w.ry) + 20)) continue;
        const x = w.x - cam.x, y = w.y - cam.y;
        if (!lv()){ if (w.kind === 'water'){ const k = (T * .35 + w.seed * .01) % 1; g.strokeStyle = `rgba(255,255,255,${Math.sin(k * Math.PI) * .3})`; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, w.rx - 6 + k * 7, w.ry - 5 + k * 5, 0, 0, 7); g.stroke(); } continue; }   // low: just the lapping shore
        g.save(); g.beginPath(); g.ellipse(x, y, w.rx, w.ry, 0, 0, 7); g.clip();
        surface(g, w, (u, v) => { const a = u * 6.283, d = Math.sqrt(v) * .9; return [x + Math.cos(a) * w.rx * d, y + Math.sin(a) * w.ry * d]; }, w.rx * w.ry * 3);
        g.restore();
        if (w.kind === 'water'){ // waves lapping at the shore
          for (let q = 0; q < 2; q++){ const k = (T * .35 + q * .5 + w.seed * .01) % 1; g.strokeStyle = `rgba(255,255,255,${Math.sin(k * Math.PI) * .32})`; g.lineWidth = 1.2;
            g.beginPath(); g.ellipse(x, y, w.rx - 6 + k * 7, w.ry - 5 + k * 5, 0, 0, 7); g.stroke(); } }
        else if (w.kind === 'lava'){ g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, w.rx + 24); gr.addColorStop(0, 'rgba(255,120,30,0)'); gr.addColorStop(.75, `rgba(255,110,30,${.1 + .06 * Math.sin(T * 2 + w.seed)})`); gr.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, w.rx + 24, w.ry + 18, 0, 0, 7); g.fill(); g.restore(); }
      } else {
        const ry = (w.y1 - w.y0) / 2, mid = (w.y0 + w.y1) / 2, top = mid - ry - 20, bot = mid + ry + 20;
        if (bot < cam.y - 20 || top > cam.y + VH + 20) continue;
        if (!lv() && !w.foam) continue;
        const cy = x => mid + Math.sin(x / 260) * 18 - cam.y, x0 = Math.floor(cam.x / 30) * 30 - 30, x1 = cam.x + VW + 60;
        g.save(); g.beginPath();
        for (let X = x0; X <= x1; X += 30) g.lineTo(X - cam.x, cy(X) - ry + 4);
        for (let X = x1; X >= x0; X -= 30) g.lineTo(X - cam.x, cy(X) + ry - 4);
        g.closePath(); g.clip();
        const ww = {...w, flow:w.foam ? 0 : 1};
        surface(g, ww, (u, v) => { const X = cam.x + u * VW; return [X - cam.x, cy(X) + (v - .5) * ry * 1.7]; }, VW * ry * 2);
        if (w.foam){ // the sea: crests rolling in toward the beach
          const shoreTop = w.y0 > 400; for (let q = 0; q < 3; q++){ const k = (T * .18 + q / 3) % 1, off = (shoreTop ? -1 : 1) * (1 - k) * ry * 1.4;
            g.strokeStyle = `rgba(255,255,255,${Math.sin(k * Math.PI) * .28})`; g.lineWidth = 1.6; g.beginPath();
            for (let X = x0; X <= x1; X += 15){ const yy = cy(X) + (shoreTop ? -ry : ry) + off + Math.sin(X / 34 + q) * 2; X === x0 ? g.moveTo(X - cam.x, yy) : g.lineTo(X - cam.x, yy); } g.stroke(); } }
        g.restore();
        if (w.foam){ // foam line sliding up and down the sand
          const yb = w.y0 < 400 ? w.y1 : w.y0, sl = Math.sin(T * 1.1 + w.seed) * 5; g.strokeStyle = `rgba(255,255,255,${.45 + .2 * Math.sin(T * 1.1)})`; g.lineWidth = 2.2; g.beginPath();
          for (let X = x0; X <= x1; X += 10){ const yy = yb + Math.sin(X / 260) * 18 + Math.sin(X / 40 + 1 + T * .8) * 3 + sl * (w.y0 < 400 ? 1 : -1) - cam.y; X === x0 ? g.moveTo(X - cam.x, yy) : g.lineTo(X - cam.x, yy); } g.stroke(); }
      }
    }
  }

  /* waterfalls live in world/falls.js (they are part of the terrain) */

  /* ---------- creatures and air ---------- */
  const A = {fly:[], ff:[], birds:[], leaves:[], birdT:6, map:-1, last:0};
  function reset(){ A.fly = []; A.ff = []; A.birds = []; A.leaves = []; A.map = MAP_ID; }
  function biome(){ return MAP_ID ? BIOME[MAPS[MAP_ID].biome] : null; }
  function step(dt){
    if (A.map !== MAP_ID) reset();
    const B = biome(), L = lv(), night = isNight(), out = outdoor(), cx = cam.x + VW / 2, cy = cam.y + VH / 2;
    // butterflies by day where flowers grow; fireflies at night or in dark lands
    const wantFly = !night && out && L && (!B || B.flowers) ? (L > 1 ? 8 : 5) : 0, wantFF = (night || !out) && L ? (L > 1 ? 18 : 10) : 0;
    const keep = (arr, n, mk) => { for (let i = arr.length - 1; i >= 0; i--){ const o = arr[i]; if (Math.abs(o.x - cx) > VW || Math.abs(o.y - cy) > VH) arr.splice(i, 1); } while (arr.length < n) arr.push(mk()); if (arr.length > n) arr.length = n; };
    const flowerCols = (B && B.flowers) || ['#f6e7f0', '#ffe08a', '#a8d8ff'];
    keep(A.fly, wantFly, () => ({x:cam.x + Math.random() * VW, y:cam.y + Math.random() * VH, tx:0, ty:0, t:0, ph:Math.random() * 9, col:flowerCols[Math.floor(Math.random() * flowerCols.length)] === '#ffffff' ? '#fff8d0' : flowerCols[Math.floor(Math.random() * flowerCols.length)]}));
    for (const b of A.fly){ b.t -= dt; if (b.t <= 0){ b.t = 1 + Math.random() * 2.5; b.tx = b.x + (Math.random() - .5) * 120; b.ty = b.y + (Math.random() - .5) * 70; }
      b.x += (b.tx - b.x) * dt * .9 + Math.sin(T * 3 + b.ph) * dt * 14; b.y += (b.ty - b.y) * dt * .9 + Math.cos(T * 4 + b.ph) * dt * 10; }
    keep(A.ff, wantFF, () => ({x:cam.x + Math.random() * VW, y:cam.y + Math.random() * VH, ph:Math.random() * 9, sp:.5 + Math.random()}));
    for (const f of A.ff){ f.x += Math.sin(T * .7 * f.sp + f.ph) * dt * 12; f.y += Math.cos(T * .9 * f.sp + f.ph * 2) * dt * 8; }
    // a flock crossing the sky
    if (out && !night && L){ A.birdT -= dt; if (A.birdT <= 0){ A.birdT = 14 + Math.random() * 18; const n = 3 + Math.floor(Math.random() * 4), dir = Math.random() < .5 ? 1 : -1, y0 = cam.y + VH * (.15 + Math.random() * .6), sp = 55 + Math.random() * 25;
      for (let i = 0; i < n; i++) A.birds.push({x:cam.x + (dir > 0 ? -60 : VW + 60) - dir * (i % 2 ? i * 14 : i * 9), y:y0 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 10, vx:dir * sp, vy:(Math.random() - .5) * 6, ph:Math.random() * 6, z:70 + Math.random() * 30}); } }
    for (const b of A.birds){ b.x += b.vx * dt; b.y += b.vy * dt; }
    A.birds = A.birds.filter(b => b.x > cam.x - 300 && b.x < cam.x + VW + 300);
    // leaves let go of the trees in the wind
    if (L && out){ const LEAF = {tree:['#6fa84a', '#a8c84a', '#d8b84a'], himtree:['#f0c8e0', '#f8e0a0'], palm:['#7ab04a'], banana:['#8ac85a'], pine:['#4a7a4a'], bamboo:['#9ac85a', '#c8d87a'], deadtree:['#a8784a', '#8a5a3a']};
      for (const p of PROPS){ const lc = LEAF[p.type]; if (!lc || !view(p.x, p.y - 60, 40)) continue; if (Math.random() < dt * .09 * wind() * (L > 1 ? 1 : .5) && A.leaves.length < 40){ const im = propImg(p.type, p.variant);
        A.leaves.push({x:p.x + (Math.random() - .5) * im.w * .6, y:p.y, z:im.h * (.45 + Math.random() * .4), vz:-(10 + Math.random() * 8), ph:Math.random() * 6, col:lc[Math.floor(Math.random() * lc.length)], life:0}); } } }
    for (const l of A.leaves){ l.life += dt; l.z += l.vz * dt; l.x += (14 * wind() + Math.sin(T * 2 + l.ph) * 10) * dt; if (l.z <= 0){ l.z = 0; l.vz = 0; } }
    A.leaves = A.leaves.filter(l => (l.z > 0 && l.life < 12) || (l.z === 0 && (l.rest = (l.rest || 0) + dt) < 2.5));
  }
  const GLOW = {};
  function glowSprite(col){ let c = GLOW[col]; if (c) return c; c = GLOW[col] = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(1, `rgba(${col},0)`); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return c; }
  function drawOver(g){
    const L = lv(); if (!L) return;
    const now = performance.now(), dt = Math.min(.1, (now - (A.last || now)) / 1000); A.last = now; step(dt);
    const B = biome(), night = isNight(), out = outdoor();
    // lamps, stalls, shop fronts and crystals glow (v58: a slow breath, no flicker)
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const p of PROPS){ const im = propImg(p.type, p.variant); if (!im.glow || !view(p.x, p.y, 80)) continue;
      const fl = .9 + .1 * Math.sin(T * 1.1 + p.x), col = p.type === 'crystal' ? '150,220,255' : p.type === 'portal' ? '200,150,255' : '255,190,90', gx = p.x + im.glow[0] - cam.x, gy = p.y + im.glow[1] - cam.y, r = im.glow[2] * .7;
      g.globalAlpha = (night ? .35 : .16) * fl; g.drawImage(glowSprite(col), gx - r, gy - r, r * 2, r * 2); }   // (v59) one cached glow picture per colour, no gradient built per lamp per frame
    g.globalAlpha = 1;
    // fireflies
    for (const f of A.ff){ const a = Math.max(0, Math.sin(T * 2.2 * f.sp + f.ph)); if (a < .05) continue; const x = f.x - cam.x, y = f.y - cam.y - 14;
      const gr = g.createRadialGradient(x, y, 0, x, y, 6); gr.addColorStop(0, `rgba(220,255,140,${a})`); gr.addColorStop(1, 'rgba(180,255,100,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); }
    g.restore();
    // chimney smoke from houses
    for (const p of PROPS){ if (p.type !== 'house' || !view(p.x, p.y - 80, 60)) continue; const im = propImg(p.type, p.variant), bx = p.x + im.w * .18 - cam.x, by = p.y - im.ay + im.h * .12 - cam.y;
      for (let i = 0; i < 6; i++){ const ph = (T * .22 + i / 6) % 1; g.fillStyle = `rgba(230,230,235,${.32 * (1 - ph)})`; g.beginPath(); g.arc(bx + ph * 16 * wind() + Math.sin(T + i) * 2, by - ph * 44, 2.5 + ph * 7, 0, 7); g.fill(); } }
    // falling leaves
    for (const l of A.leaves){ if (!view(l.x, l.y, 20)) continue; const x = l.x - cam.x, y = l.y - l.z - cam.y, fl = Math.sin(T * 5 + l.ph);
      g.save(); g.translate(x, y); g.rotate(Math.sin(T * 2 + l.ph) * .9); g.scale(1, Math.max(.25, Math.abs(fl))); g.globalAlpha = l.z === 0 ? Math.max(0, 1 - (l.rest || 0) / 2.5) : 1; g.fillStyle = l.col; g.beginPath(); g.ellipse(0, 0, 2.2, 1.1, 0, 0, 7); g.fill(); g.restore(); }
    // butterflies
    for (const b of A.fly){ const x = b.x - cam.x, y = b.y - cam.y, z = 12 + Math.sin(T * 2 + b.ph) * 4, fl = Math.abs(Math.sin(T * 15 + b.ph));
      g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(x, y, 2, .8, 0, 0, 7); g.fill();
      g.fillStyle = b.col; for (const s of [-1, 1]){ g.beginPath(); g.ellipse(x + s * 1.6 * fl, y - z, 1.8 * fl + .3, 1.5, s * .3, 0, 7); g.fill(); }
      g.fillStyle = '#3a2a2a'; g.fillRect(x - .4, y - z - 1.2, .8, 2.4); }
    // dragonflies over water by day
    if (!night && out) for (const w of WATERS){ if (w.k !== 'pond' || w.kind !== 'water' || !view(w.x, w.y, 40)) continue;
      for (let i = 0; i < 2; i++){ const s = w.seed + i * 11, per = 1.6, cyc = Math.floor((T + H1(s) * per) / per), ph = ((T + H1(s) * per) % per) / per, e = ph < .35 ? ph / .35 : 1;
        const p0 = [w.x + (H1(s + cyc) - .5) * w.rx * 1.4, w.y + (H1(s + 1 + cyc) - .5) * w.ry * 1.2], p1 = [w.x + (H1(s + cyc + 1) - .5) * w.rx * 1.4, w.y + (H1(s + 2 + cyc) - .5) * w.ry * 1.2];
        const x = p0[0] + (p1[0] - p0[0]) * e - cam.x, y = p0[1] + (p1[1] - p0[1]) * e - cam.y - 10, fl = Math.abs(Math.sin(T * 40 + i));
        g.strokeStyle = '#2a6a8a'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + 3, y); g.stroke();
        g.fillStyle = `rgba(220,240,255,${.5 + fl * .3})`; g.beginPath(); g.ellipse(x, y - 1, 1.2, 3 * fl + .5, 0, 0, 7); g.fill(); } }
    // birds: shadows sweep the ground, the flock flaps above
    for (const b of A.birds){ const x = b.x - cam.x, y = b.y - cam.y, fl = Math.sin(T * 9 + b.ph);
      g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.ellipse(x, y, 4, 1.5, 0, 0, 7); g.fill();
      g.strokeStyle = '#2a2420'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 5, y - b.z - fl * 3); g.quadraticCurveTo(x - 2, y - b.z - 1, x, y - b.z); g.quadraticCurveTo(x + 2, y - b.z - 1, x + 5, y - b.z - fl * 3); g.stroke(); }
  }
  function drawUnder(g){ drawWater(g); }
  function ents(){}
  return {sway, drawUnder, drawOver, ents};
})();
