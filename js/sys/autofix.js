/* VAYRATHEN — js/sys/autofix.js — Auto never stands around for long
   · a target that takes no damage for 6 s (stuck behind something, out of reach, immune) is skipped for 20 s
   · a roam point it gets no closer to for 5 s is dropped and a new one picked
   · sitting to rest ends after 12 s at most, or at 75% HP (and the caster SP goal); then no new rest for 10 s
   · standing in the same spot doing nothing for 8 s resets Auto's plan */
'use strict';

const AFX = {tgt:null, hp:0, tgtT:0, roamD:0, roamT:0, restT:0, restCd:0, px:0, py:0, stillT:0, dmgT:0};
{ const _ub = updBot;
  updBot = function(dt){
    const r = _ub.apply(this, arguments);
    if (!BOT.on || BOT.pause > 0 || P.dead) return r;
    AFX.restCd = Math.max(0, AFX.restCd - dt);
    // hunting a target that never loses HP
    const t = P.target;
    if (BOT.state === 'hunt' && t && !t.dead){
      if (t !== AFX.tgt){ AFX.tgt = t; AFX.hp = t.hp; AFX.tgtT = 0; }
      else if (t.hp < AFX.hp - 0.5){ AFX.hp = t.hp; AFX.tgtT = 0; }
      else if ((AFX.tgtT += dt) > 6){ BOT.skip.set(t, 20); P.target = null; P.pending = null; P.tx = null; AFX.tgt = null; AFX.tgtT = 0; }
    } else { AFX.tgt = null; AFX.tgtT = 0; }
    // roaming towards a point it never reaches
    if (BOT.state === 'roam' && BOT.roam){
      const d = Math.hypot(BOT.roam.x - P.x, BOT.roam.y - P.y);
      if (d < AFX.roamD - 20 || !AFX.roamD){ AFX.roamD = d; AFX.roamT = 0; }
      else if ((AFX.roamT += dt) > 5){ BOT.roam = null; AFX.roamD = 0; AFX.roamT = 0; }
    } else { AFX.roamD = 0; AFX.roamT = 0; }
    // resting: cap it
    if (BOT.resting){
      const hp = S.hp / DER.maxhp, sp = S.sp / DER.maxsp, spGoal = JOBS[S.job].caster ? .6 : 0;
      AFX.restT += dt;
      if (AFX.restCd > 0 || AFX.restT > 12 || (hp >= .75 && sp >= spGoal)){
        BOT.resting = false; if (P.sit){ P.sit = false; renderHotbar(); } if (AFX.restT > 0.5) AFX.restCd = 10; AFX.restT = 0; BOT.state = 'idle'; BOT.think = 0; }
    } else AFX.restT = 0;
    // standing still, doing nothing
    const moved = Math.hypot(P.x - AFX.px, P.y - AFX.py) > 4; AFX.px = P.x; AFX.py = P.y;
    if (moved || BOT.resting || BOT.state === 'flee' || P.cast || P.channel || (t && !t.dead && t.hp < AFX.hp + 1 && AFX.tgtT < 1)) AFX.stillT = 0;
    else if ((AFX.stillT += dt) > 8){ AFX.stillT = 0; if (t) BOT.skip.set(t, 15); P.target = null; P.pending = null; P.tx = null; BOT.roam = null; BOT.state = 'idle'; BOT.think = 0; }
    return r;
  };
}
