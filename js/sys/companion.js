/* VAYRATHEN — js/sys/companion.js — companions with room to breathe
   Pets (caught or cosmetic) and summoned beasts keep their own space instead of standing inside you:
   · on the move they trail behind you, one on each side, a body-length or two away;
   · standing still and out of a fight they settle beside and in front of you (where they can be seen), then
     potter about their spot, look around, glance back at you now and then;
   · they never vanish behind things: when a tree, a house, another hero or you stand in front of a companion,
     its see-through silhouette is drawn on top so you always know where it is.
   Fighting is unchanged (beasts still take their sides of the target). */
'use strict';

const COMP = {still:0};
const compCalm = () => !P.dead && !(P.target && !P.target.dead) && !mobs.some(m => !m.dead && m.aggro && Math.hypot(m.x - P.x, m.y - P.y) < 260);
/* each companion's own wander offset, re-picked every few seconds while you stand still */
function compWander(o, dt, r = 14){
  o.wT = (o.wT || 0) - dt;
  if (COMP.still < 1.5 || !compCalm()){ o.wx = (o.wx || 0) * .9; o.wy = (o.wy || 0) * .9; o.wT = Math.min(o.wT, .5); return; }
  if (o.wT <= 0){ o.wT = 2.5 + Math.random() * 4; o.wx = (Math.random() - .5) * 2 * r; o.wy = (Math.random() - .5) * r; }
}
/* where a pet should be: side = +1 right, -1 left */
function compSpot(o, side){
  const [fx, fy] = dirVec(P.dir || 0), px = -fy, py = fx;
  let x, y;
  if (P.moving || COMP.still < .6){ x = P.x - fx * 44 + px * 22 * side; y = P.y - fy * 30 + py * 14 * side + 8; }
  else { x = P.x + side * 48; y = P.y + 16; }
  x += o.wx || 0; y += o.wy || 0;
  if (typeof walkable === 'function' && !walkable(x, y, 8)){ const mx = P.x - (x - P.x), my = y; if (walkable(mx, my, 8)){ x = mx; } else { x = P.x + side * 20; y = P.y + 24; } }
  return {x, y};
}
/* idle looking about: mostly at you, sometimes away */
function compFace(o){
  o.lookT = (o.lookT || 0) - 1 / 60;
  if (o.lookT > 0) return; o.lookT = 1.5 + Math.random() * 3;
  o.dir = Math.random() < .55 ? SPR.dirFromVec(P.x - o.x, P.y - o.y) : Math.floor(Math.random() * 8);
}
EV.on('tick', dt => {
  COMP.still = P.moving ? 0 : COMP.still + dt;
  if (typeof PETF !== 'undefined'){ compWander(PETF, dt); if (!PETF.moving) compFace(PETF); }
  if (S.pet) compWander(PET, dt);
  for (const s of SUMMONS) if (s.kind === 'beast') compWander(s, dt, 18);
});
/* the caught pet: same follow, new spot */
updPet = function(dt){
  if (!S.pet) return;
  PET.t += dt;
  const sp = compSpot(PET, 1), tx = sp.x, ty = sp.y, d = Math.hypot(tx - PET.x, ty - PET.y);
  if (d > 300){ PET.x = tx; PET.y = ty; }
  PET.moving = d > 6;
  if (PET.moving) moveTo(PET, tx, ty, Math.min(220, (P.ride ? SPEED * MOVES.ride.speed : SPEED) * (d > 60 ? 1.4 : d < 24 ? .5 : 1.05)), dt);
  else compFace(PET);
  const pa = DER.pas.petAtk || 0; PET.atkCd -= dt;
  const t = P.target && !P.target.dead && dist(P.target, PET) < 200 ? P.target : null; PET.target = t;
  if (pa && t && PET.atkCd <= 0){
    PET.atkCd = 1.5; PET.dir = SPR.dirFromVec(t.x - PET.x, t.y - PET.y);
    const mul = pa * (P.petBuff > 0 ? 1.3 : 1), bite = () => { if (!t.dead){ applyDamage(t, physDamage(t, mul)); VFX.play('clawHit', {x:t.x, y:t.y - MOB_H[t.type] * .5, small:true}); } };
    bite(); if (DER.pas.petTwin) later(.25, bite);
  }
};
/* ---------- never hidden: a silhouette over whatever stands in front ---------- */
function compHidden(x, y, h){
  // you, other heroes, NPCs and tall props in front of (below) the companion that overlap it
  const box = (ox, oy, w, hh) => oy > y + 1 && Math.abs(ox - x) < w + 8 && oy - hh < y && y - h < oy;
  if (box(P.x, P.y, 12, 44)) return true;
  for (const n of NPCS) if (box(n.x, n.y, 12, 44)) return true;
  if (typeof NET !== 'undefined' && NET.ghosts) for (const gh of NET.ghosts.values()) if (box(gh.x, gh.y, 12, 44)) return true;
  for (const p of PROPS){ if (p.y <= y || p.y - y > 160 || Math.abs(p.x - x) > 90) continue; const im = propImg(p.type, p.variant); if (im.h < 30) continue;
    if (x > p.x - im.ax + im.w * .15 && x < p.x - im.ax + im.w * .85 && y > p.y - im.ay + im.h * .1 && y - h * .5 < p.y) return true; }
  return false;
}
{
  const _over = LIVE.drawOver;
  LIVE.drawOver = function(g, ...a){
    const r = _over.call(this, g, ...a);
    const ghost = (x, y, h, draw) => { if (!compHidden(x, y, h)) return; g.save(); g.globalAlpha = .5; draw(); g.restore();
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .18 + .06 * Math.sin(T * 4); g.fillStyle = '#ffe6a0'; g.beginPath(); g.ellipse(x - cam.x, y - cam.y - h * .45, 11, h * .5, 0, 0, 7); g.fill(); g.restore(); };
    if (S.pet && SHEETS && SHEETS[S.pet]) ghost(PET.x, PET.y, MOB_H[S.pet] || 26, () => drawPetW(g));
    if (typeof PETF !== 'undefined' && S.cos && S.cos.pet && typeof XPET !== 'undefined' && XPET[S.cos.pet] && cosUsable(S.cos.pet)) ghost(PETF.x, PETF.y, 26, () => drawPetX(g, XPET[S.cos.pet], PETF, T));
    for (const s of SUMMONS) if (s.kind === 'beast' && !s.dead){ const B = beastDef(s); ghost(s.x, s.y, (B && MOB_H[B.mob]) || 34, () => drawBeast(g, s)); }
    return r;
  };
}
