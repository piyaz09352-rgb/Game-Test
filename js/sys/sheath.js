/* VAYRATHEN — js/sys/sheath.js — (v159) weapons are put away when there is no fight
   Every character carries the weapon in hand only while fighting. Four seconds after the last swing, skill, cast or
   blow taken, the weapon and the shield go on the back (a blade or staff across the back, hilt over the right
   shoulder; a bow upright between the shoulders; a dagger at the hip; the shield flat on the back under the blade).
   Riding always carries them on the back. The first attack draws them again at once.
   Wings never hide them: when the camera sees your back and something is stowed there, the wings are drawn behind
   the body instead of over it. (The model side is in gfx/sprites.js: cfg.sheathed and the riding pose.) */
'use strict';

const SHEATH = {t:-99, on:true, wait:4};
const sheathFight = () => { SHEATH.t = T; if (SHEATH.on){ SHEATH.on = false; } };
{ const _ba = basicAttack; basicAttack = function(){ sheathFight(); return _ba.apply(this, arguments); }; }
{ const _ex = execSkill; execSkill = function(){ sheathFight(); return _ex.apply(this, arguments); }; }
{ const _ma = mobAttack; mobAttack = function(){ const r = _ma.apply(this, arguments); sheathFight(); return r; }; }
EV.on('tick', () => {
  if (typeof P === 'undefined' || !P) return;
  if (P.cast || P.channel || (P.target && !P.target.dead && P.target.aggro && Math.hypot(P.target.x - P.x, P.target.y - P.y) < 260)) SHEATH.t = T;
  SHEATH.on = T - SHEATH.t > SHEATH.wait;
});
/* the player's own picture: the stowed look while out of a fight */
{ const _hs = heroSheet;
  heroSheet = function(job = S.job, gear = S.gear, look = S.look){
    if (SHEATH.on && job === S.job && gear === S.gear) look = {...(look || {sex:'m', hair:0, color:''}), sh:1};
    return _hs.call(this, job, gear, look); }; }
/* wings behind the body when the back carries something */
const sheathBack = () => { const j = JOBS[S.job], w = j && j.weapon && j.weapon.type; return w && w !== 'fist' || !!(S.gear && S.gear.shield); };
if (typeof drawWings === 'function'){ const _dw = drawWings;
  drawWings = function(g, id, x, y, dir, t, o = {}){
    const away = dir >= 3 && dir <= 5, mine = typeof P !== 'undefined' && typeof cam !== 'undefined' && Math.abs(x - (P.x - cam.x)) < 2 && Math.abs(y - (P.y - cam.y)) < 2;   // (v161) the hero is drawn at screen position
    if (away && mine && (SHEATH.on || P.ride) && sheathBack()){ if (o.part === 'front') return; if (o.part === 'back') return _dw.call(this, g, id, x, y, dir, t, {...o, part:'front'}); }
    return _dw.apply(this, arguments); }; }
