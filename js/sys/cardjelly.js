/* VAYRATHEN — js/sys/cardjelly.js — Card ราชาเจลลี่ทองคำ: drain HP and SP
   With the Golden Jelly King card in its socket, every hit YOU deal (normal attacks and skills) gives back
   3% of the damage as HP and 3% as SP (at least 1 each on a hit that lands). It replaces the old "all stats +3". */
'use strict';

const JELLY_DRAIN = .03;   // v28: 3% (was 1%)
{ const _ad = applyDamage;
  applyDamage = function(m, res, sk){
    const hp0 = m && !m.dead ? m.hp : 0, r = _ad.apply(this, arguments);
    // (v27h) only YOUR hits, as the card says: not poison/burn ticks, not your pet or summoned beasts
    const own = !(res && (res.poison || res.pet)) && !(sk && (sk.type === 'conjure' || sk.type === 'summon' || sk.beast));
    if (m && res && !res.miss && own && typeof slotHas === 'function' && slotHas('c_boss') && !P.dead && !m.pvp){
      const dealt = Math.max(0, hp0 - Math.max(0, m.hp)); if (dealt > 0){
        const h = Math.max(1, Math.round(dealt * JELLY_DRAIN)), s = Math.max(1, Math.round(dealt * JELLY_DRAIN));
        S.hp = Math.min(DER.maxhp, S.hp + h); S.sp = Math.min(DER.maxsp, S.sp + s);
        JD.acc = (JD.acc || 0) + h; if (T - (JD.t || -9) > .8){ JD.t = T; addText(P.x + 10, P.y - 58, `+${JD.acc}`, '#ffd34a', 11); JD.acc = 0; } } }
    return r;
  };
}
const JD = {};
