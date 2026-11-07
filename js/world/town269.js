/* VAYRATHEN — js/world/town269.js — (v269) Aren: keepers who walk right, a garden you walk round, shops that live
   The owner: the smith's and the pharmacy's keepers walked wrongly; paths should be walkable but bushes, grass beds and
   the fountain should not be (and no one should stand on them); and the shop pictures are too still.
   · THE KEEPERS: the check that keeps an NPC from being hidden behind a building (npcclear222) ran again every time a
     strolling keeper took a step, and pushed them about — the smith drifted away from the forge and the pharmacist
     jittered back and forth. It now looks at where a keeper's place is, not where they are mid-stroll; their place is
     where they were set down, and they only stroll to spots that are walkable and not behind a building.
   · THE GARDEN (plaza.jpg): the flower beds, hedges and bushes inside the rings and the fountain are solid; the stone
     paths, the rings and the middle stay open (the beds are read from the picture: green and leafy, not stone).
     Anyone standing on them is moved to the nearest path.
   · THE SHOPS: every shop picture has its own small life over it — the forge's fire glows and throws sparks, the
     smelter's chimney smokes, the cook's pot and the herbalist's cauldron steam, lanterns flicker, the gem orb pulses,
     coins and mirrors glint, petals fall by the tailor's and the festival's blossom, fireworks pop over the festival
     shop, butterflies and hearts round the animal farm. */
'use strict';
/* ---------- the garden's solid parts (fractions of the plaza picture) ---------- */
const T269_BEDS = [0.415,0.178,0.429,0.178,0.443,0.178,0.458,0.178,0.543,0.178,0.558,0.178,0.572,0.178,0.586,0.178,0.329,0.203,0.343,0.203,0.358,0.203,0.372,0.203,0.386,0.203,0.4,0.203,0.415,0.203,0.429,0.203,0.443,0.203,0.458,0.203,0.543,0.203,0.558,0.203,0.572,0.203,0.586,0.203,0.601,0.203,0.615,0.203,0.629,0.203,0.644,0.203,0.329,0.229,0.343,0.229,0.358,0.229,0.372,0.229,0.386,0.229,0.4,0.229,0.415,0.229,0.443,0.229,0.572,0.229,0.586,0.229,0.601,0.229,0.615,0.229,0.629,0.229,0.672,0.229,0.3,0.254,0.315,0.254,0.329,0.254,0.343,0.254,0.372,0.254,0.644,0.254,0.672,0.254,0.686,0.254,0.286,0.28,0.3,0.28,0.315,0.28,0.329,0.28,0.343,0.28,0.429,0.28,0.572,0.28,0.658,0.28,0.686,0.28,0.701,0.28,0.715,0.28,0.272,0.305,0.286,0.305,0.386,0.305,0.4,0.305,0.601,0.305,0.715,0.305,0.729,0.305,0.257,0.331,0.272,0.331,0.372,0.331,0.386,0.331,0.615,0.331,0.629,0.331,0.729,0.331,0.744,0.331,0.243,0.356,0.257,0.356,0.272,0.356,0.358,0.356,0.372,0.356,0.629,0.356,0.644,0.356,0.729,0.356,0.744,0.356,0.758,0.356,0.243,0.381,0.257,0.381,0.272,0.381,0.3,0.381,0.343,0.381,0.358,0.381,0.644,0.381,0.658,0.381,0.701,0.381,0.729,0.381,0.744,0.381,0.758,0.381,0.243,0.407,0.257,0.407,0.272,0.407,0.729,0.407,0.744,0.407,0.229,0.508,0.243,0.508,0.257,0.508,0.329,0.508,0.343,0.508,0.358,0.508,0.629,0.508,0.644,0.508,0.658,0.508,0.744,0.508,0.758,0.508,0.772,0.508,0.243,0.534,0.257,0.534,0.343,0.534,0.358,0.534,0.372,0.534,0.386,0.534,0.615,0.534,0.629,0.534,0.644,0.534,0.658,0.534,0.715,0.534,0.744,0.534,0.758,0.534,0.243,0.559,0.257,0.559,0.272,0.559,0.286,0.559,0.3,0.559,0.358,0.559,0.372,0.559,0.386,0.559,0.4,0.559,0.615,0.559,0.629,0.559,0.644,0.559,0.729,0.559,0.744,0.559,0.758,0.559,0.257,0.585,0.272,0.585,0.315,0.585,0.386,0.585,0.4,0.585,0.415,0.585,0.586,0.585,0.601,0.585,0.615,0.585,0.729,0.585,0.744,0.585,0.272,0.61,0.286,0.61,0.3,0.61,0.315,0.61,0.329,0.61,0.572,0.61,0.672,0.61,0.701,0.61,0.715,0.61,0.729,0.61,0.286,0.636,0.3,0.636,0.315,0.636,0.458,0.636,0.472,0.636,0.529,0.636,0.543,0.636,0.558,0.636,0.686,0.636,0.701,0.636,0.715,0.636,0.4,0.661,0.615,0.661,0.629,0.661,0.644,0.661,0.343,0.686,0.358,0.686,0.372,0.686,0.386,0.686,0.429,0.686,0.629,0.686,0.644,0.686,0.658,0.686,0.358,0.712,0.372,0.712,0.386,0.712,0.4,0.712,0.429,0.712,0.443,0.712,0.458,0.712,0.472,0.712,0.529,0.712,0.543,0.712,0.558,0.712,0.572,0.712,0.586,0.712,0.601,0.712,0.615,0.712,0.629,0.712,0.644,0.712,0.415,0.737,0.429,0.737,0.443,0.737,0.543,0.737,0.558,0.737,0.572,0.737,0.586,0.737];
const T269_FOUNT = (() => { const o = [[.5, .62]]; for (let k = 0; k < 10; k++){ const a = k / 10 * 6.283; o.push([+(.5 + Math.cos(a) * .045).toFixed(3), +(.62 + Math.sin(a) * .05).toFixed(3)]); } return o; })();
function t269Garden(){
  if (typeof MAP_ID === 'undefined' || MAP_ID !== 0 || (typeof DG !== 'undefined' && DG.active) || typeof arnPlaza !== 'function') return;
  const p = arnPlaza(); if (!p) return;
  for (let i = obstacles.length - 1; i >= 0; i--) if (obstacles[i].t269) obstacles.splice(i, 1);
  for (let i = 0; i < T269_BEDS.length; i += 2){ const [x, y] = arnAt(p, T269_BEDS[i], T269_BEDS[i + 1]); obstacles.push({x, y, r:8, t269:true}); }
  for (const [fx, fy] of T269_FOUNT){ const [x, y] = arnAt(p, fx, fy); obstacles.push({x, y, r:22, t269:true}); }
  NAV.grid = null;
  // nobody stands on a bed or in the fountain
  const free = e => { if (walkable(e.x, e.y, 10)) return; for (let t = 1; t < 60; t++){ const a = t * 2.4, d = 6 + t * 3, x = e.x + Math.cos(a) * d, y = e.y + Math.sin(a) * d * .8; if (walkable(x, y, 10)){ e.x = x; e.y = y; return; } } };
  for (const n of NPCS) free(n);
  free(P);
  if (typeof TL !== 'undefined') TL.map = null;   // the townsfolk pick their spots again, round the beds
  if (typeof ARN_L !== 'undefined') ARN_L.clear();
}
{ const _tp = timgPlaza; timgPlaza = function(){ const r = _tp.apply(this, arguments); try { t269Garden(); } catch (e) {} return r; }; }

/* ---------- the keepers walk right ---------- */
// (their place, not their stroll, is what the hidden-NPC check looks at: npcclear222.js ncSig)
// nothing drawn over the figure there: no building in front of it, no tree, bush or lamp touching it
const t269Clear = (x, y) => { const q = {x, y}; return !PROPS.some(p => Math.abs(p.x - x) < 280 && Math.abs(p.y - y) < 420 && (!NC_STRUCT.has(p.type) || p.y > y + 1) && ncCover(q, p) > .03); };
// a stroll target: walkable, not behind a building's picture, not on top of another NPC
function t269Spot(n, x, y){
  if (!walkable(x, y, 10) || NPCS.some(m => m !== n && Math.hypot(m.x - x, m.y - y) < 26)) return false;
  if (typeof ncCover !== 'function' || typeof NC_STRUCT === 'undefined') return true;
  NC.used = [];
  try { return t269Clear(x, y); }
  finally { for (const im of NC.used) delete im._ncA; NC.used = []; }
}
if (typeof arnLife === 'function'){
  // the keeper's place is where the town set them down (after the hidden-NPC check), not a spot behind the shop
  arnLife = function(n){ let s = ARN_L.get(n); if (!s){ s = {hx:n.x, hy:n.y, st:'idle', t:1 + Math.random() * 3, tx:n.x, ty:n.y, dir:0, sayCd:4 + Math.random() * 8, fx:[], spots:null}; ARN_L.set(n, s); }
    if (!s.spots){ s.spots = [];
      // the place itself must be clear too: if not, the nearest clear spot in front becomes the place
      if (!t269Spot(n, s.hx, s.hy)) for (let t = 1; t < 40; t++){ const a = t * 2.4, d = 6 + t * 4, x = s.hx + Math.cos(a) * d * .8, y = s.hy + Math.abs(Math.sin(a)) * d; if (t269Spot(n, x, y)){ s.hx = n.x = s.tx = x; s.hy = n.y = s.ty = y; break; } }
      // strolls: the spot and the way there (checked every few steps) are clear
      for (let k = 0; k < 30 && s.spots.length < 6; k++){ const x = s.hx + (Math.random() - .5) * 90, y = s.hy + Math.random() * 28 - 6;
        let ok = true; for (let f = .25; f <= 1 && ok; f += .25) ok = t269Spot(n, s.hx + (x - s.hx) * f, s.hy + (y - s.hy) * f); if (ok) s.spots.push([x, y]); }
      s.spots.push([s.hx, s.hy]); }
    return s; };
  // pick strolls only from the checked spots: replace the target the old code picked when it is not one of them
  EV.on('tick', () => { if (typeof MAP_ID === 'undefined' || MAP_ID !== 0) return;
    for (const [n, s] of ARN_L){ if (s.st !== 'walk' || !s.spots || s.spots.some(q => q[0] === s.tx && q[1] === s.ty)) continue; const atHome = Math.hypot(n.x - s.hx, n.y - s.hy) < 3, q = atHome ? s.spots[(Math.random() * s.spots.length) | 0] : [s.hx, s.hy]; s.tx = q[0]; s.ty = q[1]; } });   // out from the place and back: only checked ways
}

/* ---------- the shops come alive ---------- */
// [kind, fx, fy, extra] in fractions of each shop picture (mirrored with the picture)
const T269_FX = {
  shop:[['lamp', .04, .42, '120,200,255'], ['lamp', .96, .42, '120,200,255'], ['twinkle', .5, .55, .25], ['twinkle', .5, .12, .05]],
  smith:[['fire', .42, .6], ['sparks', .36, .72], ['lamp', .13, .52, '255,170,80'], ['lamp', .87, .52, '255,170,80'], ['twinkle', .2, .76, .04], ['twinkle', .78, .78, .04]],
  forger:[['smoke', .84, .06], ['fire', .77, .74], ['sparks', .77, .72], ['lamp', .86, .34, '255,150,60']],
  driller:[['orb', .5, .62, '200,120,255'], ['twinkle', .5, .6, .08], ['twinkle', .5, .08, .06], ['lamp', .07, .5, '220,150,255'], ['lamp', .93, .5, '220,150,255']],
  herbal:[['steam', .73, .6, '170,255,150'], ['bubbles', .73, .63], ['lamp', .92, .32, '255,200,110'], ['lamp', .08, .52, '255,200,110']],
  cook:[['steam', .72, .6], ['steam', .38, .64], ['lamp', .08, .3, '255,170,80'], ['lamp', .92, .3, '255,170,80'], ['fire', .72, .72]],
  tailor:[['twinkle', .67, .66, .04], ['petals', .07, .14], ['twinkle', .5, .4, .1], ['lamp', .5, .5, '255,190,220']],
  banker:[['twinkle', .62, .62, .06], ['twinkle', .3, .6, .06], ['twinkle', .5, .38, .08], ['lamp', .5, .55, '255,220,120']],
  registrar:[['twinkle', .84, .62, .05], ['twinkle', .08, .84, .03], ['lamp', .05, .46, '255,200,110'], ['lamp', .95, .46, '255,200,110'], ['flag', .32, .04]],
  festival:[['firework', .64, .04], ['petals', .06, .1], ['twinkle', .5, .4, .12], ['lamp', .3, .55, '255,140,200'], ['lamp', .7, .55, '255,140,200']],
  trader:[['twinkle', .55, .58, .1], ['flag', .3, .08], ['flag', .75, .06], ['lamp', .5, .52, '255,200,110']],
  beast:[['butterfly', .2, .35], ['butterfly', .8, .3], ['hearts', .88, .72], ['hearts', .12, .72], ['lamp', .5, .48, '255,200,110']]
};
const T269 = {fx:new Map()};
const t269Shops = () => { if (typeof MAP_ID === 'undefined' || MAP_ID !== 0 || (typeof DG !== 'undefined' && DG.active) || typeof BIMG === 'undefined' || typeof VSHOP === 'undefined') return [];
  const out = []; for (const p of PROPS){ if (p.type !== 'vshop') continue; const v = p.variant % 1000, k = (VSHOP[v] || {}).k, pic = BIMG.ready[k]; if (!pic || !T269_FX[k]) continue;
    const im = propImg('vshop', v), s = Math.min((im.w - 6) / pic.width, (im.h - 6) / pic.height), w = pic.width * s, h = pic.height * s;
    out.push({p, k, mir:p.variant >= 1000, x0:p.x - w / 2, y0:p.y + (im.h - im.ay) - 2 - h, w, h}); }
  return out; };
const t269At = (b, fx, fy) => [b.x0 + (b.mir ? 1 - fx : fx) * b.w, b.y0 + fy * b.h];
EV.on('map', () => T269.fx.clear());
EV.on('tick', dt => {
  const shops = t269Shops(); if (!shops.length) return;
  for (const b of shops){ if (Math.abs(b.p.x - P.x) > 900 || Math.abs(b.p.y - P.y) > 600) continue;
    let L0 = T269.fx.get(b.p); if (!L0){ L0 = []; T269.fx.set(b.p, L0); }
    for (const [kind, fx, fy, ex] of T269_FX[b.k]){ const [x, y] = t269At(b, fx, fy), add = o => L0.push({x, y, t:0, ...o}), R = Math.random;
      if (kind === 'smoke' && R() < dt * 2.2) add({vx:4 + R() * 4, vy:-14 - R() * 6, life:3 + R(), r:4, c:'190,190,198', grow:3, a:.45});
      else if (kind === 'steam' && R() < dt * 2.6) add({x:x + (R() - .5) * 6, vx:(R() - .5) * 4, vy:-12 - R() * 6, life:1.6, r:2.5, c:ex || '245,245,250', grow:3, a:.4});
      else if (kind === 'sparks' && R() < dt * 3) for (let i = 0; i < 3; i++) add({vx:(R() - .5) * 50, vy:-25 - R() * 35, g:80, life:.6, r:1, c:'255,190,70', add:1, a:1});
      else if (kind === 'bubbles' && R() < dt * 3) add({x:x + (R() - .5) * 8, vx:0, vy:-8 - R() * 5, life:1.1, r:1.4, c:'180,255,150', ring:1, a:.9});
      else if (kind === 'twinkle' && R() < dt * 1.3) add({x:x + (R() - .5) * (ex || .05) * 2 * b.w, y:y + (R() - .5) * (ex || .05) * b.h, vx:0, vy:0, life:.7, r:3, c:'255,250,220', star:1, add:1, a:1});
      else if (kind === 'petals' && R() < dt * 1.2) add({x:x + (R() - .5) * 14, vx:(b.mir ? -1 : 1) * (6 + R() * 8), vy:8 + R() * 6, life:3, r:1.6, c:'255,170,200', petal:R() * 6, a:.95});
      else if (kind === 'firework' && R() < dt * .35){ const c = ['255,120,200', '120,220,255', '255,230,110'][(R() * 3) | 0]; for (let i = 0; i < 14; i++){ const a = i / 14 * 6.283; add({y:y - 8 - R() * 10, vx:Math.cos(a) * 28, vy:Math.sin(a) * 28, g:20, life:.9, r:1.3, c, add:1, a:1}); } }
      else if (kind === 'hearts' && R() < dt * .6) add({vx:(R() - .5) * 6, vy:-10, life:1.6, r:2.4, c:'255,120,160', heart:1, a:1});
      else if (kind === 'butterfly' && !L0.some(q => q.bf === fx)) add({bf:fx, vx:0, vy:0, life:1e9, r:2, c:'255,220,120', cx:x, cy:y, ph:R() * 6}); }
    for (const q of L0){ q.t += dt; if (q.bf != null){ q.x = q.cx + Math.sin(T * .7 + q.ph) * 22; q.y = q.cy + Math.sin(T * 1.3 + q.ph) * 9; continue; } q.x += q.vx * dt; q.y += q.vy * dt; q.vy += (q.g || 0) * dt; if (q.petal != null) q.vx += Math.sin(T * 3 + q.petal) * 10 * dt; }
    for (let i = L0.length - 1; i >= 0; i--) if (L0[i].t >= L0[i].life) L0.splice(i, 1);
    if (L0.length > 120) L0.splice(0, L0.length - 120); }
});
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a); const shops = t269Shops(); if (!shops.length) return r;
    const night = typeof nightA !== 'undefined' ? nightA : 0; g.save();
    for (const b of shops){ const sx = b.p.x - cam.x, sy = b.p.y - cam.y; if (sx < -120 || sx > VW + 120 || sy < -40 || sy > VH + 200) continue;
      // light: lamps flicker, fires and the orb breathe (stronger after dark)
      g.globalCompositeOperation = 'lighter';
      for (const [kind, fx, fy, ex] of T269_FX[b.k]){ if (kind !== 'lamp' && kind !== 'fire' && kind !== 'orb') continue; const [x, y] = t269At(b, fx, fy), X = x - cam.x, Y = y - cam.y;
        const fl = kind === 'orb' ? .7 + Math.sin(T * 2.2 + fx * 9) * .3 : .75 + Math.sin(T * 11 + fx * 31) * .12 + Math.sin(T * 23 + fy * 17) * .08, c = kind === 'fire' ? '255,140,50' : ex, rr = (kind === 'lamp' ? 10 : 16) * (1 + night * .6);
        const gr = g.createRadialGradient(X, Y, 0, X, Y, rr); gr.addColorStop(0, `rgba(${c},${(.32 + night * .3) * fl})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(X - rr, Y - rr, rr * 2, rr * 2); }
      // flags flutter: a little pennant waving on the painted pole
      g.globalCompositeOperation = 'source-over';
      for (const [kind, fx, fy] of T269_FX[b.k]){ if (kind !== 'flag') continue; const [x, y] = t269At(b, fx, fy), X = x - cam.x, Y = y - cam.y, d = b.mir ? -1 : 1;
        g.fillStyle = 'rgba(230,60,50,.9)'; g.beginPath(); g.moveTo(X, Y); for (let i = 0; i <= 6; i++) g.lineTo(X + d * i * 2, Y + Math.sin(T * 6 - i * .9) * 1.4 * (i / 6)); for (let i = 6; i >= 0; i--) g.lineTo(X + d * i * 2, Y + 5 - i * .45 + Math.sin(T * 6 - i * .9) * 1.4 * (i / 6)); g.closePath(); g.fill(); }
      // the particles
      for (const q of T269.fx.get(b.p) || []){ const u = q.t / q.life, X = q.x - cam.x, Y = q.y - cam.y, al = (q.a || 1) * (q.bf != null ? 1 : u < .15 ? u / .15 : 1 - u);
        g.globalCompositeOperation = q.add ? 'lighter' : 'source-over'; g.globalAlpha = Math.max(0, al);
        if (q.star){ const s = q.r * Math.sin(u * Math.PI); g.fillStyle = `rgba(${q.c},1)`; g.fillRect(X - s * 1.6, Y - .5, s * 3.2, 1); g.fillRect(X - .5, Y - s * 1.6, 1, s * 3.2); g.beginPath(); g.arc(X, Y, s * .45, 0, 7); g.fill(); }
        else if (q.ring){ g.strokeStyle = `rgba(${q.c},1)`; g.lineWidth = .8; g.beginPath(); g.arc(X, Y, q.r, 0, 7); g.stroke(); }
        else if (q.heart){ g.fillStyle = `rgba(${q.c},1)`; g.beginPath(); g.arc(X - 1.4, Y, 1.6, 0, 7); g.arc(X + 1.4, Y, 1.6, 0, 7); g.moveTo(X - 3, Y + .4); g.lineTo(X, Y + 3.6); g.lineTo(X + 3, Y + .4); g.fill(); }
        else if (q.bf != null){ const w = Math.abs(Math.sin(T * 14 + q.ph)) * 2.6 + .6; g.fillStyle = 'rgba(255,215,110,.95)'; g.beginPath(); g.ellipse(X - w * .8, Y, w, 1.8, -.4, 0, 7); g.ellipse(X + w * .8, Y, w, 1.8, .4, 0, 7); g.fill(); g.fillStyle = '#4a3020'; g.fillRect(X - .4, Y - 1.5, .8, 3); }
        else if (q.petal != null){ g.fillStyle = `rgba(${q.c},1)`; g.beginPath(); g.ellipse(X, Y, q.r * 1.4, q.r * .8, T * 2 + q.petal, 0, 7); g.fill(); }
        else { g.fillStyle = `rgba(${q.c},1)`; g.beginPath(); g.arc(X, Y, q.r * (1 + (q.grow || 0) * u), 0, 7); g.fill(); } }
      g.globalAlpha = 1; }
    g.restore(); return r; }; }
