/* VAYRATHEN — js/sys/netboss.js — a boss hurts EVERYONE near it, not just the player whose game runs it
   Whoever runs a boss (or an alpha) sends each telegraph it draws — circles, lines, shock rings, pools — as a
   room event. Every other player on the map sees the same red warning on their screen and, when it goes off,
   their own game checks whether THEY are inside it and applies the hit and its status (stun, burn, poison …).
   Ongoing moves that the shared snapshot already carries (the breath cone, the death spin, the soul vortex pull)
   are checked locally against you every few tenths of a second. Rolling through still dodges. */
'use strict';

const NB = {ctx:null, sk:null};
const NB_MUL = {slam:2.2, quake:1.6, charge:2.2, wave:2, meteor:1.5, field:.35, roar:0, leap:1.9, burrow:2.1, soar:2.1, pull:2.3, dash:1.6, miasma:.22, hunt:1.4, ring:.9};
const nbOn = () => typeof nmActive === 'function' && nmActive() && NET.room && NET.on;
/* the owner side: remember which boss and skill is drawing telegraphs right now */
{
  const _cast = bossCast;
  bossCast = function(m, id){ const p = [NB.ctx, NB.sk]; NB.ctx = m; NB.sk = id; try { return _cast(m, id); } finally { [NB.ctx, NB.sk] = p; } };
  if (typeof furyStart === 'function'){ const _fs = furyStart; furyStart = function(m, F, id){ const p = [NB.ctx, NB.sk]; NB.ctx = m; NB.sk = id; try { return _fs(m, F, id); } finally { [NB.ctx, NB.sk] = p; } }; }
  if (typeof furyStep === 'function'){ const _st = furyStep; furyStep = function(m, F, dt){ const p = [NB.ctx, NB.sk]; NB.ctx = m; NB.sk = F.act ? F.act.id : null; try { return _st(m, F, dt); } finally { [NB.ctx, NB.sk] = p; } }; }
  const _hunt = bossHunt;
  bossHunt = function(m, dt, dp, rooted){ const p = [NB.ctx, NB.sk]; NB.ctx = m; NB.sk = 'hunt'; try { return _hunt(m, dt, dp, rooted); } finally { [NB.ctx, NB.sk] = p; } };
  const _play = VFX.play;
  VFX.play = function(key, o){
    if (NB.ctx && NB.sk && !NB.remote && (key === 'warnCircle' || key === 'warnLine') && o && nbOn() && NB.ctx.nid){
      const m = NB.ctx, e = {r:NET.mapName, n:m.nid, s:NB.sk, k:key === 'warnCircle' ? 'c' : 'l', x:Math.round(o.x), y:Math.round(o.y), t:+(o.t || .8).toFixed(2)};
      if (e.k === 'c') e.rr = Math.round(o.r || 60); else { e.ux = +(+o.ux).toFixed(3); e.uy = +(+o.uy).toFixed(3); e.len = Math.round(o.len || 260); e.w = Math.round(o.w || 44); }
      NET.room.emit('bz', e).catch(() => {});
    }
    return _play(key, o);
  };
}
/* rings appear later (after a leap, or one by one): send each new ring */
EV.on('tick', () => {
  if (!nbOn()) return;
  for (const m of mobs){ const F = m.fz; if (!F || m.dead || !m.nid || F.remote) continue; const n = F.rings.length;
    if (n > (m._nbR || 0)) for (let i = m._nbR || 0; i < n; i++){ const r = F.rings[i]; if (r._sent) continue; r._sent = true; NET.room.emit('bz', {r:NET.mapName, n:m.nid, s:'ring', k:'ring', x:Math.round(r.x), y:Math.round(r.y), t:0}).catch(() => {}); }
    m._nbR = n; }
});
/* the receiving side */
function nbHit(m, s, mult){
  if (P.dead || P.roll || inVillage(P)) return;
  if (s === 'roar'){ if (!(P.stunT > 0)){ P.stunT = 1.4; P.cast = null; VFX.play('stunStars', {}); addText(P.x, P.y - 60, 'Stun', '#ffd56a', 14); } m.lastSk = s; m.lastSkT = T; if (typeof applyMobFx === 'function') applyMobFx(m, 'silence', 1); return; }
  m.lastSk = s; m.lastSkT = T; mobAttack(m, mult, true);
}
function onBz(msg){
  const d = msg.data || {}; if (msg.isMe || d.r !== NET.mapName || typeof d.n !== 'string') return;
  const m = NM.byId.get(d.n); if (!m || m.dead) return;
  const s = typeof d.s === 'string' && NB_MUL[d.s] != null ? d.s : 'slam', mult = NB_MUL[s], x = clamp(+d.x || 0, 0, W), y = clamp(+d.y || 0, 0, H), t = clamp(+d.t || 0, 0, 3);
  if (Math.hypot(P.x - x, P.y - y) > 900) return;
  NB.remote = true;
  try {
    if (d.k === 'ring'){ if (m.fz){ m.fz.rings.push({x, y, t:0, hit:false}); } return; }
    if (d.k === 'c'){ const r = clamp(+d.rr || 60, 10, 260); VFX.play('warnCircle', {x, y, r, t});
      const tick = s === 'field' || s === 'miasma' ? (s === 'field' ? 10 : 12) : 1;
      for (let k = 0; k < tick; k++) later(t + k * .5, () => { if (!m.dead && Math.hypot(P.x - x, (P.y - y) * 1.6) < r) nbHit(m, s, mult); });
      if (s === 'field') later(t, () => VFX.play('bossField', {x, y, r, life:5, elem:m.def.elem})); if (s === 'miasma') later(t, () => VFX.play('bossField', {x, y, r, life:6, elem:'poison'}));
      return; }
    if (d.k === 'l'){ const ux = clamp(+d.ux || 0, -1, 1), uy = clamp(+d.uy || 0, -1, 1), len = clamp(+d.len || 260, 20, 600), w = clamp(+d.w || 44, 10, 120); VFX.play('warnLine', {x, y, ux, uy, len, w, t});
      later(t + (s === 'charge' || s === 'dash' ? .25 : 0), () => { if (m.dead) return; const px = P.x - x, py = P.y - y, along = px * ux + py * uy, off = Math.abs(px * uy - py * ux); if (along > 0 && along < len && off < w / 2 + 6) nbHit(m, s, mult); }); }
  } finally { NB.remote = false; }
}
EV.on('netready', () => { if (NET.room) NET.room.on('bz', onBz, () => {}); });
/* moves the snapshot carries: breath cone, death spin, soul vortex — checked against you here */
EV.on('tick', dt => {
  if (!nbOn() || P.dead) return;
  for (const m of mobs){ const F = m.fz, a = F && F.act; if (!a || !F.remote || m.dead) continue;
    a.nb = (a.nb || 0) - dt; const dx = P.x - m.x, dy = P.y - m.y, l = Math.hypot(dx, dy);
    if (a.id === 'pull' && l < 330 && l > m.def.r + 10 && !P.roll){ const k = Math.min(l - m.def.r - 10, 90 * dt); P.x -= dx / l * k; P.y -= dy / l * k; pushOut(P, 8); }
    if (a.nb > 0) continue;
    if (a.id === 'breath' && a.t >= 1 && a.ang != null){ a.nb = .35; let da = Math.atan2(dy, dx) - a.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); if (l < 190 && Math.abs(da) < .6 && !P.roll){ m._fx = 'breath'; mobAttack(m, .32, true); m._fx = null; } }
    else if (a.id === 'spin'){ a.nb = .32; if (Math.hypot(dx, dy * 1.6) < 74 && !P.roll){ m.lastSk = 'spin'; m.lastSkT = T; mobAttack(m, .55, true); } }
  }
});
