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
{ const _ad = applyDamage; applyDamage = function(m){ const was = m && m.aggro; const r = _ad.apply(this, arguments);
    if (m && m.tw && !was && !m.dead) for (const o of mobs) if (o !== m && o.tw === m.tw && !o.dead && !o.aggro && Math.hypot(o.x - m.x, o.y - m.y) < 160) o.aggro = true;
    return r; }; }

/* ---------- close range: a gap, no stacking, everywhere ---------- */
const MSP_GAP = 22;   // ≈ two body-widths between the monster's edge and the hero's
{ const _u = updMob; updMob = function(m, dt){ const out = _u.apply(this, arguments); if (!m || m.dead || !m.def || m.def.range || !m.aggro || P.dead) return out;
    const d = m.def, minD = (d.r || 12) + 12 + MSP_GAP * .6, dx = m.x - P.x, dy = m.y - P.y, dd = Math.hypot(dx, dy) || .01;
    if (dd < minD){ const k = (minD - dd) / dd; const nx = m.x + dx * k, ny = m.y + dy * k; if (walkable(nx, ny, (d.r || 12) * .6)){ m.x = nx; m.y = ny; } }
    // spread round the hero: two monsters fighting side by side do not overlap
    for (const o of mobs){ if (o === m || o.dead || !o.aggro || !o.def) continue; const ox = m.x - o.x, oy = m.y - o.y, od = Math.hypot(ox, oy) || .01, want = ((d.r || 12) + (o.def.r || 12)) * .9;
      if (od < want){ const k = (want - od) / od * .5, nx = m.x + ox * k, ny = m.y + oy * k; if (walkable(nx, ny, (d.r || 12) * .6)){ m.x = nx; m.y = ny; } } }
    return out; }; }
// melee strikes from the gap (their reach grows to it)
for (const k in MOB){ const d = MOB[k]; if (!d || d.range || !d.r) continue; d.reach = Math.max(d.reach || d.r + 12, d.r + 12 + MSP_GAP); }

/* ---------- a fair share of ranged kinds on every hunting map ---------- */
{ const SHOT = typeof MSK_SHOT !== 'undefined' ? MSK_SHOT : {};
  const shooty = k => (MOB[k].msk || []).some(s => ['spit', 'volley', 'snare', 'bolt', 'nova', 'hex', 'hush', 'frost', 'web', 'blind'].includes(s));
  for (const mp of MAPS){ if (!mp || !mp.mobs || !mp.boss) continue; const kinds = mp.mobs.filter(k => MOB[k] && !MOB[k].boss && !MOB[k].night);
    let ranged = kinds.filter(k => MOB[k].range > 0).length;
    for (const k of kinds.filter(shooty).concat(kinds)){ if (ranged >= 2) break; const d = MOB[k]; if (d.range > 0) continue;
      d.range = 130 + ((d.lvl || 1) % 4) * 10; d.shot = d.shot || SHOT[d.elem] || 'dark'; d.reach = undefined; ranged++; } } }

/* ---------- the floor number, big on the minimap (no longer carved on the floor) ---------- */
{ const _d = drawMini; drawMini = function(){ _d.apply(this, arguments);
    try { if (typeof TW === 'undefined' || !TW.active || el('mapCard').classList.contains('folded')) return;
      const mm = el('minimap'), g = mm.getContext('2d'), w = mm.width, h = mm.height, u = w / 170, t = typeof twmTierOf === 'function' ? twmTierOf(TW.f) : 0;
      const col = (typeof TWZ268 !== 'undefined' && TWZ268.Z[t] && TWZ268.Z[t].crys) || '255,220,140', n = String(TW.f);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.lineJoin = 'round';
      g.font = `900 ${Math.round(34 * u)}px Georgia,"Times New Roman",serif`; const nw = g.measureText(n).width;
      g.font = `800 ${Math.round(9 * u)}px Sarabun,"Noto Sans Thai",sans-serif`; const lab = L('ชั้น', 'FLOOR'), lw = g.measureText(lab).width;
      const bw = Math.max(nw, lw) + 12 * u, bh = 44 * u, x0 = 4 * u, y0 = 4 * u;
      g.fillStyle = 'rgba(10,8,20,.62)'; g.beginPath(); g.roundRect ? g.roundRect(x0, y0, bw, bh, 6 * u) : g.rect(x0, y0, bw, bh); g.fill(); g.strokeStyle = `rgba(${col},.85)`; g.lineWidth = 1.2 * u; g.stroke();
      g.fillStyle = `rgb(${col})`; g.fillText(lab, x0 + (bw - lw) / 2, y0 + 11 * u);
      g.font = `900 ${Math.round(34 * u)}px Georgia,"Times New Roman",serif`; g.lineWidth = 3 * u; g.strokeStyle = 'rgba(0,0,0,.85)'; g.strokeText(n, x0 + (bw - nw) / 2, y0 + bh - 5 * u);
      g.fillStyle = '#fff6dc'; g.fillText(n, x0 + (bw - nw) / 2, y0 + bh - 5 * u); g.restore(); } catch (e) {} }; }
