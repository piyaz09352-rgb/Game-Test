/* VAYRATHEN — js/sys/balance225.js — (v225) toughness per class line
   tools/tower-report.js and tools/balance-report.js agreed: the rogue line hunts at an average pace but nearly dies on
   every hunt (lowest HP 0–21%, the most potions) and stops 16–26 levels short in the tower; the dogfolk line hunts at
   an average pace but is never in danger (lowest HP 43–81%) and climbs 34–54 levels past its own. Their damage is fine,
   so only their toughness changes: max HP and defence × by job tier [tier 1, 2, 3, 4]. 1 = unchanged. */
'use strict';
const LINE_HP = {rogue:[1.15, 1.2, 1.5, 1.4], dogfolk:[1, .85, .82, .85], catfolk:[1.1, 1.15, 1.3, 1.3]};   // (v253) the cat line died at Lv 80–115 on same-level maps: more HP
const LINE_DEF = {rogue:[1.2, 1.3, 1.7, 1.6], dogfolk:[1, .8, .78, .8]};
{ const _d = derive; derive = function(){ const r = _d.apply(this, arguments); const ch = jobChain(), line = ch[1], ti = Math.min(3, Math.max(0, ch.length - 2));
    if (DER && line){ if (LINE_HP[line]) DER.maxhp = Math.max(1, Math.round(DER.maxhp * LINE_HP[line][ti])); if (LINE_DEF[line]) DER.def = Math.round(DER.def * LINE_DEF[line][ti]);
      if (S && S.hp > DER.maxhp) S.hp = DER.maxhp; }
    return r; }; }
