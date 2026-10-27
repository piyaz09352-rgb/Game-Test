/* VAYRATHEN — js/sys/compslot.js — every companion keeps its own place
   The caught pet, the rented helper and the costume pet each get their own slot around you, so none of
   them stands inside you or inside another one: beside you on the right, on the left, and in front.
   A last nudge each tick pushes any two that still touch (or touch you) apart. */
'use strict';

const CSLOT = {min:36, rx:38, ry:24};   // min: between two companions · rx/ry: the oval around you they stay out of
/* who is out right now, in a fixed order so each keeps the same slot */
function compList(){
  const l = [];
  if (S && S.pet && typeof PET !== 'undefined') l.push(PET);
  if (typeof helperOf === 'function' && helperOf() && typeof HLP !== 'undefined') l.push(HLP);
  if (typeof PETF !== 'undefined' && S && S.cos && S.cos.pet && typeof XPET !== 'undefined' && XPET[S.cos.pet]) l.push(PETF);
  return l;
}
{ const _cs = compSpot;
  compSpot = function(o, side){
    const l = compList(), i = l.indexOf(o);
    if (l.length < 2 || i < 0) return _cs(o, side);
    if (i < 2) return _cs(o, i ? -1 : 1);   // first two: right and left
    // the third walks a step further behind you, or stands in front when you stop
    const [fx, fy] = dirVec(P.dir || 0);
    let x, y;
    if (P.moving || COMP.still < .6){ x = P.x - fx * 78; y = P.y - fy * 54 + 10; }
    else { x = P.x; y = P.y + 46; }
    x += o.wx || 0; y += o.wy || 0;
    if (typeof walkable === 'function' && !walkable(x, y, 8)){ x = P.x; y = P.y - 40; }
    return {x, y};
  };
}
/* keep them apart: from each other, and off your body. (v90) Your body is an oval wider than it is deep (a pet just
   in front of your feet still covered your legs), a companion inside it is pushed out sideways at once, and summoned
   beasts are kept off you and off the pets too, in a fight as well. */
function compSeparate(){
  const l = compList(); if (P.dead) return;
  if (typeof SUMMONS !== 'undefined') for (const s of SUMMONS) if (s.kind === 'beast' && !s.dead) l.push(s);
  if (!l.length) return;
  for (let i = 0; i < l.length; i++){ const o = l[i];
    if (o === HLP && HLP.tgt) continue;   // a helper fetching a drop may pass by
    const dx = o.x - P.x, dy = o.y - P.y, e = Math.hypot(dx / CSLOT.rx, dy / CSLOT.ry);
    if (e >= 1) continue;
    const side = Math.abs(dx) > 2 ? Math.sign(dx) : (i % 2 ? -1 : 1);
    o.x = P.x + side * Math.max(Math.abs(dx), CSLOT.rx * Math.sqrt(Math.max(0, 1 - (dy / CSLOT.ry) ** 2)) + 1);
  }
  for (let a = 0; a < l.length; a++) for (let b = a + 1; b < l.length; b++){
    const A = l[a], B = l[b], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
    if (d >= CSLOT.min) continue;
    const ux = d ? dx / d : 1, uy = d ? dy / d : 0, k = (CSLOT.min - d) * .25;
    A.x -= ux * k; A.y -= uy * k; B.x += ux * k; B.y += uy * k;
  }
}
EV.on('tick', compSeparate);
