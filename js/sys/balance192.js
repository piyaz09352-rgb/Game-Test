/* VAYRATHEN — js/sys/balance192.js — (v192) every class line hunts at about the same pace
   Measured with tools/balance-report.js (Auto plays each line at Lv 15 · 45 · 80 · 115 on a same-level map): the
   casters killed a third to two thirds as fast as the average and the hunter half again as fast late on. Each line's
   damage (normal attacks and skills, everything that goes through physDamage / magicDamage) is scaled by its job tier.
   Damage was not what held the casters back: the report showed them casting 20–46% of the time and waiting out the
   1.5 s delay after every area spell (physical ones wait 0.8 s), so their cast time and after-cast delay are shortened.
   1 = unchanged. Re-run the report after any change. */
'use strict';
const LINE_POW = {   // [tier 1 (Lv <40), tier 2, tier 3, tier 4]
  blade:[.88, .88, .7, .8], rune:[1.6, 1.4, 1.2, 1.25], ranger:[.62, 1.05, 1.42, 1.4], muay:[.95, .82, 1.06, .88],
  healer:[1.5, 1.4, 1.4, 1.3], rogue:[1.05, 1.05, 1.45, 1.35], summoner:[1.6, 1.05, .75, .7], occult:[3.3, 1.5, 1.4, 1.4],
  merchant:[.88, .92, 1.35, .95], catfolk:[.85, .8, .88, .95], dogfolk:[.95, .95, .8, .97], ninja:[.52, 1.35, 1.45, 1.5]
};
function linePow(){
  const ch = jobChain(), line = ch[1]; if (!line || !LINE_POW[line]) return 1;
  return LINE_POW[line][Math.min(3, Math.max(0, ch.length - 2))] || 1;
}
{ const _p = physDamage; physDamage = function(){ const r = _p.apply(this, arguments); if (r && r.dmg > 0) r.dmg = Math.max(1, Math.round(r.dmg * linePow())); return r; }; }
{ const _m = magicDamage; magicDamage = function(){ const r = _m.apply(this, arguments); if (r && r.dmg > 0) r.dmg = Math.max(1, Math.round(r.dmg * linePow())); return r; }; }
const LINE_CAST = {rune:[.45, .5, .6, .6], healer:[.55, .55, .55, .55], occult:[.4, .5, .5, .5], summoner:[.8, .8, 1, 1]};   // cast time × by tier
const LINE_ACD = {rune:[.5, .55, .6, .6], healer:[.55, .55, .55, .55], occult:[.45, .5, .5, .5], summoner:[.8, .8, 1, 1]};    // after-cast delay × by tier
{ const _d = derive; derive = function(){ const r = _d.apply(this, arguments); const ch = jobChain(), line = ch[1], ti = Math.min(3, Math.max(0, ch.length - 2));
    if (DER && line){ if (LINE_CAST[line]) DER.castMul *= LINE_CAST[line][ti]; if (LINE_ACD[line]) DER.acdMul = (DER.acdMul || 1) * LINE_ACD[line][ti]; }
    return r; }; }
