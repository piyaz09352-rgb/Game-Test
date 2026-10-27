/* VAYRATHEN — js/sys/grandfx.js — every skill lands with grandeur
   On top of each skill's own effect: a spinning magic seal where it lands, a column of light, god-rays,
   double shockwaves, star sparks that rain down and glints that twinkle. Bigger skills (more SP) get more:
   ultimates add a screen flash and a shake. Self buffs and heals get a rising aura of stars. */
'use strict';

const GFX_COL = {fire:'rgba(255,140,40,1)', water:'rgba(120,210,255,1)', wind:'rgba(170,255,210,1)', earth:'rgba(230,180,100,1)', holy:'rgba(255,236,160,1)', shadow:'rgba(190,140,255,1)', poison:'rgba(150,230,80,1)', neutral:'rgba(255,200,80,1)'};
function grandFx(id, lv, t){
  const sk = SKILLS[id]; if (!sk || sk.type === 'passive') return;
  const sp = (() => { try { return sk.sp(lv); } catch (e){ return 10; } })(), tier = sk.req ? 1.25 : 1;
  const p = clamp(sp / 55 * tier, .3, 1.3), col = GFX_COL[sk.elem] || (sk.type === 'heal' ? 'rgba(140,240,150,1)' : GFX_COL.neutral);
  const self = ['buff', 'heal', 'restore', 'summon', 'conjure', 'petcall', 'blink', 'backstep', 'command'].includes(sk.type);
  if (self){ VFX.play('grandSelf', {x:P.x, y:P.y, col, p}); return; }
  const tg = t && typeof t.x === 'number' ? t : null, at = sk.type === 'aoeSelf' || !tg ? P : tg, d = Math.hypot(at.x - P.x, at.y - P.y);
  const delay = sk.fx === 'meteor' ? .9 : sk.type === 'bolt' || sk.type === 'ranged' || sk.type === 'line' ? Math.min(.6, d / 380) : sk.type === 'aoeTarget' || sk.type === 'fieldDot' ? .25 : .05;
  const x = at.x, y = at.y, r = sk.radius || (sk.type === 'aoeSelf' ? 70 : 36);
  later(delay, () => VFX.play('grand', {x, y, col, p, r, elem:sk.elem}));
}
{ const _f = fireSkill; fireSkill = function(id, lv, t){ const r = _f(id, lv, t); if (r !== false) try { grandFx(id, lv, t); } catch (e) {} return r; }; }
