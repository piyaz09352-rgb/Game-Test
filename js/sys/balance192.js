/* VAYRATHEN — js/sys/balance192.js — (v192) every class line hunts at about the same pace
   Measured with tools/balance-report.js (Auto plays each line at Lv 15 · 45 · 80 · 115 on a same-level map): the
   casters killed a third to two thirds as fast as the average and the hunter half again as fast late on. Each line's
   damage (normal attacks and skills, everything that goes through physDamage / magicDamage) is scaled by its job tier.
   Damage was not what held the casters back: the report showed them casting 20–46% of the time and waiting out the
   1.5 s delay after every area spell (physical ones wait 0.8 s), so their cast time and after-cast delay are shortened.
   1 = unchanged. Re-run the report after any change. */
'use strict';
const LINE_POW = {   // [tier 1 (Lv <40), tier 2, tier 3, tier 4] · (v324) retuned from a full report after the v323 Auto fixes
  blade:[1.09, 1.1, 0.7, 0.88], rune:[1.65, 0.59, 1.26, 1.1], ranger:[0.6, 0.63, 1.6, 1.4], muay:[0.79, 0.58, 0.71, 0.82],
  healer:[2.9, 1.6, 2.05, 1.02], rogue:[1.21, 1.3, 1.76, 1.5], summoner:[1.45, 1.08, 1.11, 0.75], occult:[3.21, 3.13, 1.96, 1.4],
  merchant:[1.6, 1.17, 1.06, 0.95], catfolk:[1.41, 0.79, 0.56, 0.92], dogfolk:[1.53, 1.09, 0.82, 0.88], ninja:[0.23, 1.46, 1.3, 1.5]
};
/* (v323) the slot a line uses is its job tier, and the last job is reached around Lv 70, so the fourth slot is never used:
   a Lv 115 hero still uses the third. The ranger kept pace at Lv 80 (82 % of the average) but fell to 54 % at Lv 115,
   where monster HP outgrows its arrows: from Lv 100 on its damage is raised on top of its slot */
const LINE_LV100 = {blade:1.58, rune:0.98, healer:0.69, ranger:1.72, rogue:1.08, summoner:1.03, occult:0.67, merchant:1.09, catfolk:1.32, dogfolk:1.13};
function linePow(){
  const ch = jobChain(), line = ch[1]; if (!line || !LINE_POW[line]) return 1;
  return (LINE_POW[line][Math.min(3, Math.max(0, ch.length - 2))] || 1) * ((S.lvl || 1) >= 100 && LINE_LV100[line] || 1);
}
{ const _p = physDamage; physDamage = function(){ const r = _p.apply(this, arguments); if (r && r.dmg > 0) r.dmg = Math.max(1, Math.round(r.dmg * linePow())); return r; }; }
{ const _m = magicDamage; magicDamage = function(){ const r = _m.apply(this, arguments); if (r && r.dmg > 0) r.dmg = Math.max(1, Math.round(r.dmg * linePow())); return r; }; }
const LINE_CAST = {rune:[.45, .5, .6, .6], healer:[.55, .55, .55, .55], occult:[.4, .5, .5, .5], summoner:[.8, .8, 1, 1]};   // cast time × by tier
const LINE_ACD = {rune:[.5, .55, .6, .6], healer:[.55, .55, .55, .55], occult:[.45, .5, .5, .5], summoner:[.8, .8, 1, 1]};    // after-cast delay × by tier
{ const _d = derive; derive = function(){ const r = _d.apply(this, arguments); const ch = jobChain(), line = ch[1], ti = Math.min(3, Math.max(0, ch.length - 2));
    if (DER && line){ if (LINE_CAST[line]) DER.castMul *= LINE_CAST[line][ti]; if (LINE_ACD[line]) DER.acdMul = (DER.acdMul || 1) * LINE_ACD[line][ti]; }
    return r; }; }
/* (v198) SP cost × by tier: the report showed the hexer at Lv 15 limited by SP, not damage (most SP potions of any
   line, little time casting), so its skills cost less SP while it is still on its first job */
const LINE_SP = {occult:[.6, 1, 1, 1]};
for (const id in SKILLS){ const sk = SKILLS[id], ln = typeof NL_LINE_OF !== 'undefined' && NL_LINE_OF[sk.job]; if (!ln || !LINE_SP[ln] || typeof sk.sp !== 'function' || sk._spLine) continue;
  const o = sk.sp; sk._spLine = 1; sk.sp = lv => { const ch = jobChain(), ti = Math.min(3, Math.max(0, ch.length - 2)); return ch[1] === ln ? Math.max(1, Math.round(o(lv) * LINE_SP[ln][ti])) : o(lv); }; }
/* (v209) summoned beasts hit harder for the summoner line (its own spells barely matter: the beasts do the killing) */
{ const _d = derive; derive = function(){ const r = _d.apply(this, arguments); if (DER && DER.pas && jobChain()[1] === 'summoner') DER.pas.sumAtk = (DER.pas.sumAtk || 0) + .9; return r; }; }

/* (v324) the lines without INT ran dry: their SP comes back half as fast (js/game/player.js) and their pool is small,
   so at Lv 115 a swordsman, rogue or merchant had spent its SP within 6 s and then only swung — its skills looked
   «unused» in the report (Earthsplit, Judgement, Assassinate, Axe Whirl: 1–2 casts in 5 minutes) while a ninja still
   had half its 1,400 SP after 20 s. Their skills cost less SP (the stat line of the job names no INT) */
const SP_NOINT = .55;
{ const rootLine = job => { let j = job, g = 0; while (j && JOBS[j] && JOBS[j].parent && JOBS[j].parent !== 'novice' && g++ < 6) j = JOBS[j].parent; return j; };
  for (const id in SKILLS){ const sk = SKILLS[id]; if (typeof sk.sp !== 'function' || sk._spNoInt || !sk.job || sk.job === 'novice') continue;
    const ln = rootLine(sk.job), J = JOBS[ln]; if (!J || /INT/.test(J.stat || '')) continue;
    const o = sk.sp; sk._spNoInt = 1; sk.sp = lv => Math.max(1, Math.round(o(lv) * SP_NOINT)); } }
/* (v324) the mage's three great spells (Tempest, Earth Swallow, Deluge) hit hard but took 4 s to cast with a 15 s
   cooldown: two casts each in five minutes. A shorter cast and cooldown make them part of the fight */
for (const id of ['tempest', 'earthswallow', 'deluge']){ const sk = SKILLS[id]; if (!sk || sk._v324) continue; sk._v324 = 1;
  const c0 = sk.cast, d0 = sk.cd;
  if (c0 != null) sk.cast = typeof c0 === 'function' ? lv => c0(lv) * .62 : c0 * .62;
  if (d0 != null) sk.cd = typeof d0 === 'function' ? lv => d0(lv) * .8 : d0 * .8; }
