/* VAYRATHEN — js/sys/bosspose304.js — (v304) a boss moves like the skill it is using
   The owner asked whether monsters act out their skills: they did not — a boss played its one attack pose for every
   skill. Bosses first (ordinary monsters are left as they are): each boss skill now plays one of four eight-frame
   poses drawn in js/gfx/sprites.js (BOSS_POSE), stretched so that the blow lands when the red warning fills:
     slam, quake            → bslam   rears up, hangs, crashes down as the warning ends
     charge, wave, barrage  → bcharge draws back over its haunches, then drives forward
     roar, enraged          → broar   sinks, throws its front up and shakes
     meteor, field, heal,
     summon                 → bcast   rises, leans back and sways while it channels
   Human bosses use the people's own slam / shout / lunge / invoke poses. Timing and damage are unchanged. */
'use strict';
const BPOSE = {
  act:{slam:'bslam', quake:'bslam', charge:'bcharge', wave:'bcharge', barrage:'bcharge', roar:'broar', meteor:'bcast', field:'bcast', heal:'bcast', summon:'bcast'},
  wait:{slam:.9, quake:1.3, charge:.75, wave:.8, barrage:.35, roar:.7, meteor:1, field:.6, heal:.45, summon:.5},   // when the skill lands (js/game/mobs.js bossCast)
  hitK:{bslam:.62, bcharge:.56, broar:.4, bcast:.5}};                                                                // where in the pose the blow is
function bposeStart(m, act, wait){ if (!m || !m.def || !m.def.boss || typeof SHEETS === 'undefined' || !SHEETS) return; const sh = SHEETS[m.type]; if (!sh || !SPR.bossActs) return; SPR.bossActs(sh); if (!sh.index[act]) return;
  m.bp = {act, t0:T, total:Math.min(2.4, Math.max(.8, wait / BPOSE.hitK[act]))}; }
if (typeof bossCast === 'function'){ const _bc = bossCast; bossCast = function(m, id){ const r = _bc.apply(this, arguments); if (r && BPOSE.act[id]) try { bposeStart(m, BPOSE.act[id], BPOSE.wait[id]); } catch (e) { console.warn('bosspose', e); } return r; }; }
if (typeof VFX !== 'undefined' && VFX.play){ const _vp = VFX.play; VFX.play = function(name, o){ if (name === 'enrage' && o && o.m && o.m.enraged) try { bposeStart(o.m, 'broar', .6); } catch (e) {} return _vp.apply(this, arguments); }; }
{ const _ma = mobAnim; mobAnim = function(m){ const b = m && m.bp; if (b && !m.dead){ const e = (T - b.t0) / b.total; if (e >= 0 && e < 1) return [b.act, e * .8 - .0001]; m.bp = null; } return _ma.apply(this, arguments); }; }   // 8 frames at 10 a second = .8 s of pose time
