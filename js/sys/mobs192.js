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
    const pool = {quad:['slam', 'rally', 'pounce'], rock:['harden', 'slam', 'blind'], squat:['blind', 'slam'], slime:['mend', 'spit', 'web'], bug:['web', 'bite', 'spit'],
      bird:['volley', 'dive', 'blind'], serpent:['coil', 'spit', 'frost'], floater:['hex', 'nova', 'hush']}[d.nature || 'quad'] || ['slam', 'rend'];
    const extra = (d.race === 'undead' || d.race === 'demon' ? ['hex', 'hush'] : []).concat(pool, ['slam', 'rend', 'bolt']).find(id => MSK[id] && !d.msk.includes(id));
    if (extra) d.msk = d.msk.concat(extra); }
}
/* skills come back sooner on tougher monsters */
{ const _c = mskCast; mskCast = function(m, id){ const r = _c.apply(this, arguments);
    const f = m && m.def ? mobRamp(m.def.lvl) : 0;
    if (f && !m.def.boss && m.mskCd && m.mskCd[id] > T){ m.mskCd[id] = T + (m.mskCd[id] - T) * (1 - MOB192.cdCut * f); if (m.mskGap > T) m.mskGap = T + (m.mskGap - T) * (1 - MOB192.cdCut * f); }
    return r; }; }
