/* VAYRATHEN — js/sys/combatrules.js — (v100) three rules for what stats do in a fight
   · MOBBED: (v292) every monster past the third fighting you takes 5% off your Flee (6 on you → −15%, never below 40%). Dragging a
     whole pack around no longer leaves an AGI hero untouchable.
   · PERFECT DODGE from LUK: 1% for every 10 LUK, on top of any dodge passive. It works even when Flee fails.
   · STATUS RESIST from stats, on top of the "Status Resist" gear option (js/sys/afflict.js afRes):
       VIT → stun, poison, bleed, burn · INT → silence, freeze, blind · LUK → curse · AGI → slow, root
     stat ÷ 250, at most 40% from stats (100 in a stat = 40%). Gear and stats stack as two separate rolls.
   The Status details drawer lists all three. */
'use strict';

const RO_MOB = {range:90, step:.05, free:3};   // (v292) mobbed: −5% Flee per monster past the third (was −10% past the second): a pack leader's family alone no longer strips an AGI hero
const RO_RES_STAT = {stun:'vit', poison:'vit', bleed:'vit', burn:'vit', silence:'int', freeze:'int', blind:'int', curse:'luk', slow:'agi', root:'agi'};
const roResOf = k => { const s = RO_RES_STAT[k]; return s && DER && DER.b ? Math.min(.4, (DER.b[s] || 0) / 250) : 0; };
const roLukDodge = () => (DER && DER.b ? (DER.b.luk || 0) * .001 : 0);
/* monsters close enough to be fighting you right now */
function roMobbed(){ let n = 0;
  for (const m of mobs) if (!m.dead && !m.vanish && m.aggro && Math.hypot(m.x - P.x, m.y - P.y) <= (m.def.range || 0) + (m.def.r || 0) + RO_MOB.range) n++;
  return n; }
const roFleeMul = n => Math.max(.4, 1 - Math.max(0, n - RO_MOB.free) * RO_MOB.step);

{ const _dv = derive; derive = function(){ const r = _dv.apply(this, arguments);
  if (DER && DER.pas){ DER.pas.dodge = +((DER.pas.dodge || 0) + roLukDodge()).toFixed(3); }
  return r; }; }
{ const _ma = mobAttack;
  mobAttack = function(m){ if (!DER) return _ma.apply(this, arguments);
    const f0 = DER.flee, k = roFleeMul(roMobbed()); if (k < 1) DER.flee = Math.round(f0 * k);
    try { return _ma.apply(this, arguments); } finally { DER.flee = f0; } }; }
const roResisted = k => { if (!(Math.random() < roResOf(k))) return false;
  if (T - (P.afResT || 0) > 1){ P.afResT = T; afText('Resist!', '#e8f0ff'); } return true; };
{ const _af = afflict;
  afflict = function(k, dur, opt){ if (!P.dead && !(opt && opt.force) && roResisted(k)) return; return _af.apply(this, arguments); }; }
{ const _fx = applyMobFx;
  applyMobFx = function(m, k){ if (k === 'stun' && !P.dead && roResisted('stun')) return; return _fx.apply(this, arguments); }; }

/* (v115) the status window no longer lists the dodge & resist breakdown (the player asked for it to go); the rules still apply */

/* (v248) the wiki page «Dodge & status resist» (its numbers and formulas) is gone at the owner's request; the rules still apply */
