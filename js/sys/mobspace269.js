/* VAYRATHEN — js/sys/mobspace269.js — (v269) monsters keep their distance and their place
   The owner: the whole tower hall should not walk over and bury the hero; monsters should stand spread over the room
   and attack only when someone comes within their range. Close-range monsters keep a gap of about two body-widths
   and never stand on the hero. Every map should have a fair share of ranged monsters.
   · TOWER: a wave is spread over the whole floor (the back line still toward the gate), each monster calm at its own
     spot, wandering a little; it joins the fight when the hero comes into its sight (or hits it), like on any map.
   · CLOSE RANGE, everywhere: a melee monster strikes from about two body-widths away and is pushed back if it comes
     closer, and monsters fighting the hero spread round them instead of piling on one spot.
   · RANGED SHARE: every hunting map has at least two ranged kinds among its six (a melee kind that already has a
     ranged or spell skill learns to shoot, in its element's colour). */
'use strict';
/* ---------- the tower: calm, spread out ---------- */
{ const _m = twMob; twMob = function(){ const m = _m.apply(this, arguments); if (m && !m.def.boss){ m.aggro = false; m.hx = m.x; m.hy = m.y; m.tx = null; m.wait = Math.random() * 2; } return m; }; }
{ const _sp = twSpawn; twSpawn = function(){ const r = _sp.apply(this, arguments); if (!TW.active || TW.phase !== 'fight' || typeof twmC !== 'function') return r;
    const c = twmC(), wave = mobs.filter(m => m.tw === TW.f && !m.dead && !m.def.boss), e = typeof twmEntry === 'function' ? twmEntry() : {x:P.x, y:P.y};
    for (const m of wave){ const back = m.twRole && m.twRole !== 'melee';
      for (let k = 0; k < 30; k++){ const x = c.x + (Math.random() - .5) * TWM_RX * 1.7, y = c.y + (back ? -Math.random() : Math.random() * 2 - 1) * TWM_RY * .85;
        if (!walkable(x, y, 16) || Math.hypot(x - e.x, y - e.y) < 260 || Math.hypot(x - P.x, y - P.y) < 220 || wave.some(o => o !== m && o.hx != null && o.placed && Math.hypot(o.x - x, o.y - y) < 46)) continue;
        m.x = m.hx = x; m.y = m.hy = y; m.placed = true; break; }
      m.aggro = false; }
    return r; }; }
// in the tower the calm ones see a little further (a wide hall), and a hit wakes its neighbours
{ const _u = updMob; updMob = function(m, dt){
    if (m && !m.dead && m.tw && !m.aggro && typeof TW !== 'undefined' && TW.active && !P.dead && Math.hypot(m.x - P.x, m.y - P.y) < 210) m.aggro = true;
    return _u.apply(this, arguments); }; }
// the last few of a wave (three or fewer, or after 25 s of the fight) stop waiting and come for the hero: no hunting
// round the corners of a big hall for one straggler
{ let f0 = -1, t0 = 0; EV.on('tick', dt => { if (typeof TW === 'undefined' || !TW.active || TW.phase !== 'fight' || P.dead) { f0 = -1; return; }
    if (f0 !== TW.f){ f0 = TW.f; t0 = 0; } t0 += dt;
    const left = mobs.filter(m => m.tw === TW.f && !m.dead); if (!left.length || (left.length > 3 && t0 < 25)) return;
    for (const m of left){ if (!m.aggro){ m.aggro = true; m.wait = 0; }
      // (v271) one that still cannot get to you (stuck behind the hall's edge) steps in after a while, so a floor never runs out on a straggler
      if (Math.hypot(m.x - P.x, m.y - P.y) > 300) m.farT = (m.farT || 0) + dt; else m.farT = 0;
      if (m.farT > 8){ m.farT = 0; for (let k = 0; k < 24; k++){ const a = Math.random() * 6.283, d = 150 + Math.random() * 100, x = P.x + Math.cos(a) * d, y = P.y + Math.sin(a) * d * .7;
          if (walkable(x, y, (m.def.r || 12) * .6)){ if (typeof VFX !== 'undefined' && VFX.play) try { VFX.play('blink', {x:m.x, y:m.y, x2:x, y2:y}); } catch (e) {} m.x = m.hx = x; m.y = m.hy = y; break; } } } } }); }
{ const _ad = applyDamage; applyDamage = function(m){ const was = m && m.aggro; const r = _ad.apply(this, arguments);
    if (m && m.tw && !was && !m.dead) for (const o of mobs) if (o !== m && o.tw === m.tw && !o.dead && !o.aggro && Math.hypot(o.x - m.x, o.y - m.y) < 160) o.aggro = true;
    return r; }; }

/* ---------- close range: a gap, no stacking, everywhere ---------- */
const MSP_GAP = 22;   // ≈ two body-widths between the monster's edge and the hero's
{ const _u = updMob; updMob = function(m, dt){ const out = _u.apply(this, arguments); if (!m || m.dead || !m.def || P.dead) return out;
    const d = m.def, melee = !d.range || !d.boss, minD = melee && m.aggro ? (d.r || 12) + 12 + MSP_GAP * .6 : (d.r || 12) + 12;   // any monster, calm or ranged too, never stands inside the hero
    // spread round the hero: two monsters fighting side by side do not overlap
    if (melee && m.aggro) for (const o of mobs){ if (o === m || o.dead || !o.aggro || !o.def) continue; const ox = m.x - o.x, oy = m.y - o.y, od = Math.hypot(ox, oy) || .01, want = ((d.r || 12) + (o.def.r || 12)) * .9;
      if (od < want){ const k = (want - od) / od * .5, nx = m.x + ox * k, ny = m.y + oy * k; if (walkable(nx, ny, (d.r || 12) * .6)){ m.x = nx; m.y = ny; } } }
    // then out of the hero's space, last, so nothing pushes it back in (sideways along a wall when straight back is blocked)
    { const ex = m.x - P.x, ey = m.y - P.y, ed = Math.hypot(ex, ey) || .01;
      if (ed < minD){ const ux = ex / ed, uy = ey / ed;
        for (const a of [0, .6, -.6, 1.2, -1.2, 1.8, -1.8]){ const c = Math.cos(a), sn = Math.sin(a), nx = P.x + (ux * c - uy * sn) * minD, ny = P.y + (ux * sn + uy * c) * minD; if (walkable(nx, ny, (d.r || 12) * .5)){ m.x = nx; m.y = ny; break; } } } }
    return out; }; }
// the hero's melee reaches across that gap: short-reach classes (claws, fists, daggers: 24) would otherwise never land a hit
const MSP_REACH = Math.ceil(12 + MSP_GAP * .6 + 8);
{ const _dv = derive; derive = function(){ const r = _dv.apply(this, arguments); if (typeof DER !== 'undefined' && DER.range > 0 && DER.range < 100) DER.range += MSP_REACH - 24; return r; }; }   // melee only (+10: 24 → 34, 30 → 40), each class keeps its own edge
// melee strikes from the gap (their reach grows to it)
for (const k in MOB){ const d = MOB[k]; if (!d || d.range || !d.r) continue; d.reach = Math.max(d.reach || d.r + 12, d.r + 12 + MSP_GAP); }

/* ---------- a fair share of ranged kinds on every hunting map ---------- */
{ const SHOT = typeof MSK_SHOT !== 'undefined' ? MSK_SHOT : {};
  const shooty = k => (MOB[k].msk || []).some(s => ['spit', 'volley', 'snare', 'bolt', 'nova', 'hex', 'hush', 'frost', 'web', 'blind'].includes(s));
  for (const mp of MAPS){ if (!mp || !mp.mobs || !mp.boss) continue; const kinds = mp.mobs.filter(k => MOB[k] && !MOB[k].boss && !MOB[k].night);
    let ranged = kinds.filter(k => MOB[k].range > 0).length;
    for (const k of kinds.filter(shooty).concat(kinds)){ if (ranged >= 2) break; const d = MOB[k]; if (d.range > 0) continue;
      d.range = 130 + ((d.lvl || 1) % 4) * 10; d.shot = d.shot || SHOT[d.elem] || 'dark'; d.reach = undefined; ranged++; } } }

/* ---------- the tower on the minimap: the floor number big, and every monster easy to see ---------- */
{ const _d = drawMini; drawMini = function(){ _d.apply(this, arguments);
    try { if (typeof TW === 'undefined' || !TW.active || el('mapCard').classList.contains('folded')) return;
      const mm = el('minimap'), g = mm.getContext('2d'), w = mm.width, h = mm.height, u = w / 170, t = typeof twmTierOf === 'function' ? twmTierOf(TW.f) : 0;
      const css = w / (mm.getBoundingClientRect().width || w);   // canvas pixels per screen pixel: a phone's small map still gets readable sizes
      const col = (typeof TWZ268 !== 'undefined' && TWZ268.Z[t] && TWZ268.Z[t].crys) || '255,220,140', n = String(TW.f), kx = w / W, ky = h / H;
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.lineJoin = 'round';
      // monsters: a red dot with a dark rim (a boss a gold one, pulsing), big enough to spot on the hall's purple floor
      const left = mobs.filter(m => !m.dead && m.tw);
      for (const m of left){ const boss = m.def && m.def.boss, r = Math.max((boss ? 4.2 : 2.4) * u, (boss ? 5 : 3) * css) * (boss ? 1 + Math.sin(T * 6) * .12 : 1), x = m.x * kx, y = m.y * ky;
        g.fillStyle = boss ? '#ffd23a' : m.aggro ? '#ff4a3a' : '#ff8a6a'; g.strokeStyle = 'rgba(20,6,6,.9)'; g.lineWidth = Math.max(1.2 * u, 1.2 * css); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.stroke(); }
      // the floor badge: «ชั้น», the number, and how many are left
      const fN = Math.max(34 * u, 18 * css), fL = Math.max(9 * u, 9 * css), fC = Math.max(8 * u, 8 * css);
      g.textBaseline = 'alphabetic'; g.textAlign = 'left';
      g.font = `900 ${Math.round(fN)}px Georgia,"Times New Roman",serif`; const nw = g.measureText(n).width;
      g.font = `800 ${Math.round(fL)}px Sarabun,"Noto Sans Thai",sans-serif`; const lab = L('ชั้น', 'FLOOR'), lw = g.measureText(lab).width;
      const cnt = TW.phase === 'fight' ? L(`เหลือ ${left.length}`, `${left.length} left`) : '';
      g.font = `700 ${Math.round(fC)}px Sarabun,"Noto Sans Thai",sans-serif`; const cw = cnt ? g.measureText(cnt).width : 0;
      const pad = Math.max(6 * u, 5 * css), bw = Math.max(nw, lw, cw) + pad * 2, bh = fL * 1.25 + fN * .95 + (cnt ? fC * 1.3 : 0) + pad * .6, x0 = Math.max(4 * u, 3 * css), y0 = x0;
      g.fillStyle = 'rgba(10,8,20,.66)'; g.beginPath(); g.roundRect ? g.roundRect(x0, y0, bw, bh, 6 * u) : g.rect(x0, y0, bw, bh); g.fill(); g.strokeStyle = `rgba(${col},.85)`; g.lineWidth = Math.max(1.2 * u, css); g.stroke();
      let y = y0 + fL * 1.1;
      g.font = `800 ${Math.round(fL)}px Sarabun,"Noto Sans Thai",sans-serif`; g.fillStyle = `rgb(${col})`; g.fillText(lab, x0 + (bw - lw) / 2, y);
      y += fN * .9; g.font = `900 ${Math.round(fN)}px Georgia,"Times New Roman",serif`; g.lineWidth = Math.max(3 * u, 2.4 * css); g.strokeStyle = 'rgba(0,0,0,.85)'; g.strokeText(n, x0 + (bw - nw) / 2, y); g.fillStyle = '#fff6dc'; g.fillText(n, x0 + (bw - nw) / 2, y);
      if (cnt){ y += fC * 1.25; g.font = `700 ${Math.round(fC)}px Sarabun,"Noto Sans Thai",sans-serif`; g.fillStyle = left.length ? '#ffb0a0' : '#9ff0c8'; g.fillText(cnt, x0 + (bw - cw) / 2, y); }
      g.restore(); } catch (e) {} }; }
