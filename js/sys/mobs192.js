/* VAYRATHEN — js/sys/mobs192.js — (v192) monsters get tougher from the Lv 20 maps on
   The owner found monsters too easy (the balance report showed almost nobody drinking a potion on a same-level map),
   but the first maps must stay gentle for new players. So below Lv 20 nothing changes; from Lv 20 a ramp grows to full
   at Lv 60 and stays there:
     · HP and attack up to +60%;
     · their skills (sys/balance30.js) come up to 30% sooner after each use;
     · from Lv 40 every monster learns a third skill that fits its body (a brute a stun, a caster a curse, …).
   Bosses are handled by sys/boss192.js. */
'use strict';
const MOB192 = {from:20, full:60, hp:.6, atk:.6, cdCut:.3, third:40};
const mobRamp = lv => clamp(((lv || 1) - MOB192.from) / (MOB192.full - MOB192.from), 0, 1);
for (const k in MOB){ const d = MOB[k]; if (!d || d.boss || d._m192 || k === 'dummy' || k === 'crowncrystal' || !d.hp) continue; d._m192 = 1;
  const f = mobRamp(d.lvl); if (!f) continue;
  d.hp = Math.round(d.hp * (1 + MOB192.hp * f));
  if (Array.isArray(d.atk)) d.atk = d.atk.map(v => Math.round(v * (1 + MOB192.atk * f)));
  // a third skill from Lv 40: the first fitting one it does not have yet
  if ((d.lvl || 0) >= MOB192.third && Array.isArray(d.msk) && d.msk.length < 3){
    const pool = {quad:['slam', 'rally', 'maul'], rock:['harden', 'slam', 'blind'], squat:['blind', 'slam'], slime:['mend', 'spit', 'web'], bug:['web', 'bite', 'spit'],
      bird:['volley', 'gale', 'blind'], serpent:['coil', 'spit', 'frost'], fish:['bite', 'frost', 'spit'], cave:['maul', 'harden', 'slam'], sky:['nova', 'hex', 'gale'], land:['slam', 'rend', 'harden'], floater:['hex', 'nova', 'hush']}[d.nature || 'quad'] || ['slam', 'rend'];
    const fly = d.nature === 'bug' && typeof SPECIES !== 'undefined' && (() => { const r = SPECIES.find(x => x[0] === k); return !!(r && /^(hornet|wasp|bee)$/.test((r[5] || {}).kind || '')); })();   // (v274) hornets and wasps: a sting, never a web · (v283) told by their kind, not by a dive they no longer have
    const extra = (d.race === 'undead' || d.race === 'demon' ? ['hex', 'hush'] : []).concat(fly ? pool.filter(x => x !== 'web') : pool, ['slam', 'rend', 'bolt']).find(id => MSK[id] && !d.msk.includes(id));
    if (extra) d.msk = d.msk.concat(extra); }
}
/* skills come back sooner on tougher monsters */
{ const _c = mskCast; mskCast = function(m, id){ const r = _c.apply(this, arguments);
    const f = m && m.def ? mobRamp(m.def.lvl) : 0;
    if (f && !m.def.boss && m.mskCd && m.mskCd[id] > T){ m.mskCd[id] = T + (m.mskCd[id] - T) * (1 - MOB192.cdCut * f); if (m.mskGap > T) m.mskGap = T + (m.mskGap - T) * (1 - MOB192.cdCut * f); }
    return r; }; }
/* (v241) the new stat point curve (js/data/items.js) gives less than the old one in mid game (the old one flooded
   Lv 60–120 with 15–27 points a level, then fell to 7): at Lv 115 a hero has about a third fewer points. Ordinary
   monsters are eased by the share of points the hero lost at that level: HP × ratio^0.35, attack × ratio^0.2
   (ratio = new points ÷ old points, never above 1): Lv 80 ≈ −7% HP · Lv 115 ≈ −15% HP, −9% attack · Lv 180 ≈ −7% ·
   Lv 240 ≈ −1% · from Lv 280 nothing. Lv 40–120 at least −7.5% HP / −4.5% attack: the new cap keeps the main stat
   lower there (at Lv 45 the hero has more points than before but kills were 8% slower).
   Measured with tools/balance-report.js. */
const MOB241 = (() => { const old = lv => lv <= 120 ? Math.floor(lv / 5) + 3 : lv <= 171 ? 7 : 8; const r = [1, 1]; let a = 48, b = 48;
  for (let lv = 2; lv <= 400; lv++){ a += old(lv); b += statGain(lv);
    const capT = clamp((lv - 35) / 10, 0, 1) * clamp((150 - lv) / 30, 0, 1);   // Lv 40–120: the cap that grows with level keeps the main stat lower than before even where the points are not fewer
    r[lv] = Math.min(1, b / a, 1 - .2 * capT); } return lv => r[clamp((lv || 1) | 0, 1, 400)]; })();
for (const k in MOB){ const d = MOB[k]; if (!d || d.boss || d._m241 || k === 'dummy' || k === 'crowncrystal' || !d.hp) continue; d._m241 = 1;
  const q = MOB241(d.lvl); if (q >= 1) continue;
  d.hp = Math.round(d.hp * Math.pow(q, .35)); if (Array.isArray(d.atk)) d.atk = d.atk.map(v => Math.max(1, Math.round(v * Math.pow(q, .2)))); }
