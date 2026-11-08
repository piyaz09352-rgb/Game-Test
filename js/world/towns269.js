/* VAYRATHEN — js/world/towns269.js — (v269) the four crossroads towns come alive like Aren
   · SOLID GREENS: bushes, flower beds and hedges in the towns (and in Aren) are no longer walked through — people,
     townsfolk and the hero go round them, and anyone set down on one steps off to the nearest clear spot.
   · THE KEEPERS (potions, smith, bank, healer, the local kitchen, the costume shop) potter about in front of their shop
     the way Aren's do: a few steps out and back along checked ways, a turn to the counter to work (sparks at the
     smith's, steam at the kitchen, a glint at the bank…), a look and a line when you come close.
   · THE BUILDINGS: the smithy's forge glows through the door and throws sparks, smoke curls from its roof; the kitchen
     steams; the apothecary, the bank and the costume shop glint now and then. */
'use strict';
/* ---------- solid greens ---------- */
const T269_SOFT = {bush:[[0, 0, .3]], flowerbed:[[-.2, -.1, .2], [.2, -.1, .2]], hedge:[[-.18, -.15, .24], [.18, -.15, .24]]};   // [dx, dy, r] as fractions of the prop's width
const t269TownMap = () => typeof MAP_ID !== 'undefined' && (MAP_ID === 0 || (typeof isTown === 'function' && isTown(MAP_ID))) && !(typeof DG !== 'undefined' && DG.active);
function t269Greens(){
  if (!t269TownMap()) return;
  for (let i = obstacles.length - 1; i >= 0; i--) if (obstacles[i].t269g) obstacles.splice(i, 1);
  const c = MAP_ID === 0 && typeof ARC !== 'undefined' ? ARC : {x:W / 2, y:H / 2}, R = MAP_ID === 0 ? 900 : 1300;
  for (const p of PROPS){ const parts = T269_SOFT[p.type]; if (!parts || Math.hypot(p.x - c.x, p.y - c.y) > R) continue; const im = propImg(p.type, p.variant), w = im.w;
    for (const [dx, dy, r] of parts) obstacles.push({x:p.x + dx * w, y:p.y + dy * w, r:r * w, prop:p, t269g:true}); }
  NAV.grid = null;
  const free = e => { if (walkable(e.x, e.y, 10)) return; for (let t = 1; t < 60; t++){ const a = t * 2.4, d = 6 + t * 3, x = e.x + Math.cos(a) * d, y = e.y + Math.sin(a) * d * .8; if (walkable(x, y, 10)){ e.x = x; e.y = y; return; } } };
  for (const n of NPCS) free(n); free(P);
  if (typeof TL !== 'undefined') TL.map = null;
  if (typeof ARN_L !== 'undefined') ARN_L.clear();
}
EV.on('map', () => setTimeout(() => { try { t269Greens(); } catch (e) {} }, 0));

/* ---------- the keepers ---------- */
const t269Job = n => typeof ARN_JOB === 'undefined' ? null : ARN_JOB[n.id] && n.twTown ? ARN_JOB[n.id] : n.twKind === 4 ? ARN_JOB.cook : n.twKind === 5 ? ARN_JOB.tailor : null;
EV.on('tick', dt => {
  if (typeof MAP_ID === 'undefined' || typeof isTown !== 'function' || !isTown(MAP_ID) || PAUSED || typeof arnLife !== 'function') return;
  const dlg = document.getElementById('dialog'), talk = dlg && !dlg.hidden ? dlg.dataset.npc : null;
  for (const n of NPCS){ if (!n.twTown) continue; const job = t269Job(n); if (!job) continue; const s = arnLife(n), dP = Math.hypot(P.x - n.x, P.y - n.y);
    if (talk === n.id || P.npc === n || dP < 70){ s.st = 'look'; s.dir = SPR.dirFromVec(P.x - n.x, P.y - n.y); s.moving = false;
      if ((s.sayCd -= dt) <= 0 && dP < 120 && talk !== n.id && typeof tlSay === 'function'){ s.sayCd = 14 + Math.random() * 10; tlSay(n, job.say[(Math.random() * job.say.length) | 0]); if (typeof TL !== 'undefined') TL.map = MAP_ID; }
      continue; }
    if (s.st === 'look'){ s.st = 'idle'; s.t = 1; }
    s.sayCd -= dt;
    if (s.st === 'walk'){ const dx = s.tx - n.x, dy = s.ty - n.y, d = Math.hypot(dx, dy); if (d < 2){ s.st = Math.random() < .55 ? 'work' : 'idle'; s.t = s.st === 'work' ? 3 + Math.random() * 3 : 1.5 + Math.random() * 3; s.moving = false; continue; }
      const sp = 22 * dt; n.x += dx / d * Math.min(sp, d); n.y += dy / d * Math.min(sp, d); s.dir = SPR.dirFromVec(dx, dy); s.moving = true; continue; }
    if ((s.t -= dt) > 0){ if (s.st === 'work'){ s.dir = 4; if (Math.random() < dt * 5 && typeof arnWorkFx === 'function') arnWorkFx(n, s, job.fx); } continue; }
    // out from the place to a checked spot, and back
    const atHome = Math.hypot(n.x - s.hx, n.y - s.hy) < 3, q = atHome ? s.spots[(Math.random() * s.spots.length) | 0] : [s.hx, s.hy];
    s.tx = q[0]; s.ty = q[1]; s.st = 'walk';
    if (s.sayCd <= 0 && dP < 260 && Math.random() < .3 && typeof tlSay === 'function'){ s.sayCd = 18 + Math.random() * 14; tlSay(n, job.say[(Math.random() * job.say.length) | 0]); if (typeof TL !== 'undefined') TL.map = MAP_ID; }
  }
  for (const s of ARN_L.values()){ for (const f of s.fx){ f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += (f.g || 0) * dt; } s.fx = s.fx.filter(f => f.t < f.life); }
});
// drawn in their own town clothes, walking or turned to the counter, their work effects over them
{ const _d = drawNpcW; drawNpcW = function(g, n){ const s = n && n.twTown && typeof ARN_L !== 'undefined' && ARN_L.get(n); if (!s || typeof isTown !== 'function' || !isTown(MAP_ID)) return _d.apply(this, arguments);
    const sh = typeof twSheet === 'function' ? twSheet(n) : null; if (!sh) return _d.apply(this, arguments);
    const x = n.x - cam.x, y = n.y - cam.y; if (x < -60 || x > VW + 60 || y < -80 || y > VH + 40) return;
    shadowW(g, x, y, 9); SPR.draw(g, sh, s.moving && sh.index && sh.index.walk ? 'walk' : 'idle', s.dir || 0, T + n.x * .01, x, y, {lazy:true});
    for (const f of s.fx){ const u = f.t / f.life, fx = f.x - cam.x, fy = f.y - cam.y; g.globalAlpha = 1 - u;
      if (f.puff){ g.fillStyle = `rgba(${f.c},.5)`; g.beginPath(); g.arc(fx, fy, f.r * (1 + u * 1.5), 0, 7); g.fill(); }
      else if (f.plus){ g.fillStyle = `rgba(${f.c},1)`; g.fillRect(fx - 3, fy - 1, 6, 2); g.fillRect(fx - 1, fy - 3, 2, 6); }
      else { g.fillStyle = `rgba(${f.c},1)`; g.beginPath(); g.arc(fx, fy, f.r, 0, 7); g.fill(); } }
    g.globalAlpha = 1; }; }

/* ---------- the buildings ---------- */
// [kind, dx, dy] as fractions of the building's picture box, from its foot (the door is the middle of the front)
const T269_TFX = {smith:[['fire', 0, -.32], ['sparks', 0, -.28], ['smoke', .28, -.95]], food:[['steam', -.15, -.9], ['steam', .15, -.9], ['fire', 0, -.3]],
  shop:[['twinkle', 0, -.4]], bank:[['twinkle', 0, -.38]], costume:[['twinkle', 0, -.42]], healer:[['heal', 0, -.45]]};
const T269T = {fx:new Map()};
const t269Blds = () => { if (typeof MAP_ID === 'undefined' || typeof isTown !== 'function' || !isTown(MAP_ID) || typeof TW_TYPES === 'undefined') return [];
  const out = []; for (const p of PROPS){ if (p.type !== 'tbld') continue; const k = TW_TYPES[p.variant % 10]; if (!T269_TFX[k]) continue; const im = propImg('tbld', p.variant); out.push({p, k, w:im.w, h:im.ay}); } return out; };
EV.on('map', () => T269T.fx.clear());
EV.on('tick', dt => {
  for (const b of t269Blds()){ if (Math.abs(b.p.x - P.x) > 900 || Math.abs(b.p.y - P.y) > 600) continue;
    let L0 = T269T.fx.get(b.p); if (!L0){ L0 = []; T269T.fx.set(b.p, L0); } const R = Math.random;
    for (const [kind, fx, fy] of T269_TFX[b.k]){ const x = b.p.x + fx * b.w, y = b.p.y + fy * b.h, add = o => L0.push({x, y, t:0, ...o});
      if (kind === 'smoke' && R() < dt * 2) add({vx:4 + R() * 4, vy:-14 - R() * 6, life:3 + R(), r:4, c:'190,190,198', grow:3, a:.4});
      else if (kind === 'steam' && R() < dt * 1.6) add({x:x + (R() - .5) * 8, vx:(R() - .5) * 4, vy:-12 - R() * 6, life:1.8, r:3, c:'245,245,250', grow:3, a:.35});
      else if (kind === 'sparks' && R() < dt * 2.5) for (let i = 0; i < 3; i++) add({vx:(R() - .5) * 50, vy:-25 - R() * 30, g:80, life:.6, r:1, c:'255,190,70', add:1, a:1});
      else if (kind === 'twinkle' && R() < dt * .9) add({x:x + (R() - .5) * b.w * .5, y:y + (R() - .5) * b.h * .3, vx:0, vy:0, life:.7, r:3, c:'255,250,220', star:1, add:1, a:1});
      else if (kind === 'heal' && R() < dt * .8) add({x:x + (R() - .5) * 20, vx:0, vy:-14, life:1.3, r:2, c:'140,255,170', plus:1, a:1}); }
    for (const q of L0){ q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += (q.g || 0) * dt; }
    for (let i = L0.length - 1; i >= 0; i--) if (L0[i].t >= L0[i].life) L0.splice(i, 1); if (L0.length > 80) L0.splice(0, L0.length - 80); }
});
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a); const bl = t269Blds(); if (!bl.length) return r;
    const night = typeof nightA !== 'undefined' ? nightA : 0; g.save();
    for (const b of bl){ const sx = b.p.x - cam.x, sy = b.p.y - cam.y; if (sx < -120 || sx > VW + 120 || sy < -40 || sy > VH + 200) continue;
      g.globalCompositeOperation = 'lighter';
      for (const [kind, fx, fy] of T269_TFX[b.k]){ if (kind !== 'fire') continue; const X = sx + fx * b.w, Y = sy + fy * b.h, fl = .75 + Math.sin(T * 11 + b.p.x) * .12 + Math.sin(T * 23 + b.p.y) * .08, rr = 22 * (1 + night * .5);
        const gr = g.createRadialGradient(X, Y, 0, X, Y, rr); gr.addColorStop(0, `rgba(255,140,50,${(.35 + night * .3) * fl})`); gr.addColorStop(1, 'rgba(255,140,50,0)'); g.fillStyle = gr; g.fillRect(X - rr, Y - rr, rr * 2, rr * 2); }
      for (const q of T269T.fx.get(b.p) || []){ const u = q.t / q.life, X = q.x - cam.x, Y = q.y - cam.y; g.globalCompositeOperation = q.add ? 'lighter' : 'source-over'; g.globalAlpha = Math.max(0, (q.a || 1) * (u < .15 ? u / .15 : 1 - u));
        if (q.star){ const s = q.r * Math.sin(u * Math.PI); g.fillStyle = `rgba(${q.c},1)`; g.fillRect(X - s * 1.6, Y - .5, s * 3.2, 1); g.fillRect(X - .5, Y - s * 1.6, 1, s * 3.2); }
        else if (q.plus){ g.fillStyle = `rgba(${q.c},1)`; g.fillRect(X - 3, Y - 1, 6, 2); g.fillRect(X - 1, Y - 3, 2, 6); }
        else { g.fillStyle = `rgba(${q.c},1)`; g.beginPath(); g.arc(X, Y, q.r * (1 + (q.grow || 0) * u), 0, 7); g.fill(); } }
      g.globalAlpha = 1; }
    g.restore(); return r; }; }
