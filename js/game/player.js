/* VAYRATHEN — js/game/player.js */
'use strict';

/* ---------- player ---------- */
/* no way to reach the current target: drop it (the auto skips it for a while) */
function navGiveUp(){
  P.navFail = false;
  if (P.target){ if (BOT.on) BOT.skip.set(P.target, 8); P.target = null; }
  P.pending = null; P.moving = false;
}
function updPlayer(dt){
  const act = playerAct(); if (act !== P.act){ P.act = act; P.animT = 0; } P.animT += dt; P.atkAnim -= dt;
  P.skillAnim -= dt;
  updPet(dt);
  if (P.dead){ P.deadT -= dt; if (P.deadT <= 0) respawn(); return; }
  if (P.stunT > 0){ P.stunT -= dt; P.moving = false; P.tx = null; return; }
  { const d = document.getElementById('dialog'); if (!d.hidden && d.dataset.npc){ const n = NPCS.find(n => n.id === d.dataset.npc); if (n && dist(n, P) > 110) closeDialog(); } }
  const SPD = (P.ride ? SPEED * (MOVES.ride.speed + (DER.pas.rideSpd || 0)) : SPEED) * DER.move * (typeof afMoveMul === 'function' ? afMoveMul() : 1);   // slowed / rooted / frozen
  P.atkCd -= dt; P.kiteCd = (P.kiteCd || 0) - dt; if (!P.target) P.kite = null; P.swing = Math.max(0, P.swing - dt * 4); P.itemCd -= dt; P.hurt = Math.max(0, (P.hurt || 0) - dt);
  for (const k in P.cds) P.cds[k] -= dt;
  if (P.acd > 0) P.acd -= dt;
  const vmul = (inVillage(P) ? 2 : 1) * (P.sit ? 2 : 1);
  P.rH += dt * vmul; P.rS += dt * vmul;
  if (P.rH >= 6){ P.rH = 0; S.hp = Math.min(DER.maxhp, S.hp + Math.max(1, Math.floor(DER.maxhp / 200) + Math.floor(DER.b.vit / 5))); }
  if (P.rS >= (/INT/.test(JOBS[S.job].stat) ? 4 : 8) / (P.buffs.meditate ? 2 : 1)){ P.rS = 0; S.sp = Math.min(DER.maxsp, S.sp + 1 + Math.floor(DER.maxsp / 100) + Math.floor(DER.b.int / 6) + (DER.pas.spRegen || 0)); }
  if (P.roll){ updRoll(dt); P.moving = false; return; }
  if (P.capT > 0){ P.capT -= dt; P.moving = false; if (P.capT <= 0) resolveCapture(); return; }
  if (P.spin > 0) P.spin -= dt;
  if (P.cast){
    P.cast.t += dt; P.moving = false;
    if (P.cast.t >= P.cast.total){ const c = P.cast; P.cast = null; fireSkill(c.id, c.lv, c.target); }
    return;
  }
  if (P.sit){ P.moving = false; return; }
  let t = P.target; if (t && t.dead){ P.target = t = null; }
  if (P.pending){
    if (!t){ P.pending = null; }
    else if (dist(P, t) > skillRange(P.pending) + t.def.r){ P.moving = !navTo(P, t.x, t.y, SPD, dt); pushOut(P, 12); if (P.navFail) navGiveUp(); return; }
    else { const id = P.pending; P.pending = null; trySkill(id); return; }
  }
  if (P.loot && !LOOT.includes(P.loot)) P.loot = null;
  if (P.loot){
    if (dist(P, P.loot) > 14){ P.moving = !navTo(P, P.loot.x, P.loot.y, SPD, dt); if (P.navFail){ P.navFail = false; P.loot = null; } }
    else { pickLoot(P.loot); P.moving = false; }
  } else if (P.npc){
    if (dist(P, P.npc) > 40) P.moving = !navTo(P, P.npc.x, P.npc.y + 16, SPD, dt);
    else { if (typeof EV !== 'undefined') EV.emit('npc', P.npc.id); openNpc(P.npc); P.npc = null; P.moving = false; }
  } else if (t && SETTINGS.kite && (JOBS[S.job].caster || JOBS[S.job].ranged) && (P.kite || (dist(P, t) < t.def.r + 34 && (P.kiteCd || 0) <= 0 && !t.def.boss || (t.def.boss && dist(P, t) < t.def.r + 40 && (P.kiteCd || 0) <= 0)))){
    // ระยะห่างเสมอ: back off to about two-thirds of your range, then keep attacking
    if (!P.kite){ const d = dist(P, t) || 1, back = DER.range * .65; let kx = P.x + (P.x - t.x) / d * back, ky = P.y + (P.y - t.y) / d * back;
      kx = clamp(kx, 40, W - 40); ky = clamp(ky, 60, H - 40); if (!walkable(kx, ky, 12)){ const a = Math.atan2(P.y - t.y, P.x - t.x) + (Math.random() < .5 ? 1.2 : -1.2); kx = clamp(P.x + Math.cos(a) * back, 40, W - 40); ky = clamp(P.y + Math.sin(a) * back, 60, H - 40); }
      P.kite = {x:kx, y:ky, t:.9}; }
    P.kite.t -= dt; const done = navTo(P, P.kite.x, P.kite.y, SPD * 1.05, dt); P.moving = !done;
    if (done || P.kite.t <= 0 || P.navFail){ P.kite = null; P.navFail = false; P.kiteCd = 1.6; }
  } else if (t){
    const hold = BOT.on && BOT.pause <= 0 ? botHoldRange() : 0, rng = (hold || DER.range) + t.def.r;
    if (dist(P, t) > rng){ P.moving = !navTo(P, t.x, t.y, SPD, dt); if (P.navFail) navGiveUp(); }
    else { P.moving = false; P.face = t.x < P.x ? -1 : 1; P.dir = SPR.dirFromVec(t.x - P.x, t.y - P.y); if (P.atkCd <= 0 && !hold){ basicAttack(t); P.atkCd = Math.max(.2, DER.interval / (1 + ((DER.pas && DER.pas.aspdPct) || 0))); } }
  } else if (P.tx != null){
    const arrived = navTo(P, P.tx, P.ty, SPD, dt); P.moving = !arrived; if (arrived || P.navFail){ P.tx = null; if (P.navFail){ P.navFail = false; if (BOT.on) BOT.roam = null; } }
  } else P.moving = false;
  pushOut(P, 12);
}
