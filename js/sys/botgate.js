/* VAYRATHEN — js/sys/botgate.js — (v180) Auto keeps away from the warp gates
   Auto hunting used to chase a monster standing next to a map's exit, or pick a wandering spot by it, walk onto the
   gate and carry the hero off to another map. Now, while Auto is running:
   · monsters within BOTG.r of a gate are not picked as targets (one already attacking you is still fought, from where you stand)
   · a wandering spot or a walk target near a gate is dropped and another one chosen
   · if the hero still ends up close to a gate (pushed, chased) Auto steps back toward the middle of the map
   · walking onto a gate does not change maps while Auto is in charge (stop Auto, or take over by hand, to travel) */
'use strict';

const BOTG = {r:190, back:120};
const botgNear = (x, y, r = BOTG.r) => typeof GATES !== 'undefined' && GATES.some(g => Math.hypot(g.x - x, g.y - y) < r);
const botgOn = () => typeof BOT !== 'undefined' && BOT.on && !(BOT.pause > 0) && !(typeof DG !== 'undefined' && DG.active);
{ const _sh = botShun; botShun = function(m){ if (botgOn() && m && botgNear(m.x, m.y) && !(m.aggro && dist(m, P) < 90)) return true; return _sh.apply(this, arguments); }; }
{ const _ub = updBot;
  updBot = function(dt){
    const r = _ub.apply(this, arguments);
    if (!botgOn() || P.dead) return r;
    if (BOT.roam && botgNear(BOT.roam.x, BOT.roam.y)){ BOT.roam = null; if (P.tx != null && botgNear(P.tx, P.ty)){ P.tx = null; P.ty = null; } }
    if (P.tx != null && botgNear(P.tx, P.ty)){ P.tx = null; P.ty = null; }
    if (P.target && !P.target.dead && botgNear(P.target.x, P.target.y) && !(P.target.aggro && dist(P.target, P) < 90)){ P.target = null; P.pending = null; }
    // too close already: step back toward the middle of the map
    if (botgNear(P.x, P.y, BOTG.back)){ const c = (typeof CAMP !== 'undefined' && CAMP) || {x:W / 2, y:H / 2}, d = Math.max(1, Math.hypot(c.x - P.x, c.y - P.y));
      P.target = null; P.pending = null; BOT.roam = null; P.tx = P.x + (c.x - P.x) / d * 160; P.ty = P.y + (c.y - P.y) / d * 160; }
    return r; }; }
{ const _cg = checkGates; checkGates = function(){ if (botgOn()) return; return _cg.apply(this, arguments); }; }
