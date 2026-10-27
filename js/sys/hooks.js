/* VAYRATHEN — js/sys/hooks.js — one place where the systems plug into combat and monsters
   Before this, several systems (boss fury, afflictions, alphas, weather, monster feelings) each wrapped the same
   core functions on top of one another, four deep for a monster's hit. Now each core function is wrapped ONCE,
   here, and the systems register small handlers in a list. Easier to follow, cheaper to run, and adding a system
   no longer changes the order the others run in.

   HK.spawn      (m, opt)                          after a monster is created
   HK.atkMul     (m, mult, noDodge) → mult         a monster's hit on you: change its multiplier
   HK.atkAfter   (m, mult, noDodge, dmg, dead0)    after a monster's hit (dmg = HP you lost, 0 on a miss)
   HK.dmgGuard   (m, res, sk) → false              before your damage lands on a monster; false = it does not land
   HK.dmgAfter   (m, res, sk, hp0)                 after your damage landed (hp0 = its HP before)
   HK.physGuard  (m, mult, elem) → result          before a physical hit is rolled; return a result to replace it (e.g. a miss)
   HK.outMul     (mult, elem, kind, m) → mult      your outgoing damage multiplier (kind 'phys' | 'magic')
   HK.mobPre     (m, dt) → true                    before a monster's AI; true = handled, skip the AI this frame
   HK.mobPost    (m, dt, aggro0)                   after a monster's AI ran
   HK.diePre / HK.diePost ()                       around your death */
'use strict';

const HK = {spawn:[], atkMul:[], atkAfter:[], dmgGuard:[], dmgAfter:[], physGuard:[], outMul:[], mobPre:[], mobPost:[], diePre:[], diePost:[]};
{
  const _spawn = spawnMob;
  spawnMob = function(type, x, y, opt = {}){ const m = _spawn(type, x, y, opt); for (const f of HK.spawn) f(m, opt); return m; };
  const _atk = mobAttack;
  mobAttack = function(m, mult = 1, noDodge = false){
    if (m && m.def) for (const f of HK.atkMul) mult = f(m, mult, noDodge);
    const hp0 = S.hp, dead0 = P.dead; const r = _atk(m, mult, noDodge);
    if (m && m.def){ const dmg = Math.max(0, hp0 - S.hp); for (const f of HK.atkAfter) f(m, mult, noDodge, dmg, dead0); }
    return r;
  };
  const _apply = applyDamage;
  applyDamage = function(m, res, sk){
    for (const f of HK.dmgGuard) if (f(m, res, sk) === false) return;
    const hp0 = m && m.hp; const r = _apply(m, res, sk);
    for (const f of HK.dmgAfter) f(m, res, sk, hp0);
    return r;
  };
  const _phys = physDamage;
  physDamage = function(m, mult, elem){
    for (const f of HK.physGuard){ const r = f(m, mult, elem); if (r) return r; }
    for (const f of HK.outMul) mult = f(mult, elem || (DER && DER.welem), 'phys', m);
    return _phys(m, mult, elem);
  };
  const _mag = magicDamage;
  magicDamage = function(m, mult, elem){ for (const f of HK.outMul) mult = f(mult, elem, 'magic', m); return _mag(m, mult, elem); };
  const _upd = updMob;
  updMob = function(m, dt){
    if (!m.dead) for (const f of HK.mobPre) if (f(m, dt) === true) return;
    const ag0 = m.aggro; _upd(m, dt);
    for (const f of HK.mobPost) f(m, dt, ag0);
  };
  const _die = playerDie;
  playerDie = function(){ for (const f of HK.diePre) f(); const r = _die(); for (const f of HK.diePost) f(); return r; };
}
