/* VAYRATHEN — js/sys/heavyhit220.js — (v220) heavy weapons feel heavy
   When a war axe or a greatsword (or a hand axe) lands its normal attack, the chop throws up a puff of dust and grit
   where it bites, the screen jolts a little and the moment holds for a few hundredths of a second (hit-stop), so the
   weight of the blow reads. Respects the Settings switch for screen shake. (v222: the short hit-stop freeze was removed; it read as stutter.) */
'use strict';
function hhHeavy(){ try { const k = SPR.heroKey(S.job, typeof visGear === 'function' ? visGear(S.gear) : S.gear || {}, S.look), c = SPR.CHARS[k] || {}; return c.weapon === 'sword' && (c.twoHand || c.axe) ? (c.twoHand ? 2 : 1) : 0; } catch (e) { return 0; } }
{ const _ba = basicAttack;
  basicAttack = function(t){ const r = _ba.apply(this, arguments); const h = t && !JOBS[S.job].caster && !JOBS[S.job].ranged ? hhHeavy() : 0;
    if (h && P.atkAnim > 0) later(.22, () => { if (!t || t.dead && t.deadT > .3) return; const x = t.x, y = t.y + 4;
      for (let i = 0; i < (h === 2 ? 5 : 3); i++) VFX.play('dustPuff', {x:x + (Math.random() - .5) * 16, y});
      if (h === 2) VFX.play('stoneHit', {x, y:y - 6});
      VFX.shake(h === 2 ? 2 : 1.2); });   /* (v222) no hit-stop: freezing the picture on every heavy blow felt like the game stuttering */
    return r; }; }
