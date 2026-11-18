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
/* (v314) every boss move now has a pose, not only those ten: the pose starts where every move starts (js/sys/bossact.js
   baStart: the boss's own list, the fury moves, the nature kit, the signature move) and is timed by the same wind-up, so the
   blow lands as the red mark fills. Each body plan acts it with its own limbs (js/gfx/sprites.js BOSS_POSE ext).
     slam quake trample ring boulder leap g_quake          → bslam   (rear and crash down / stomp)
     charge rend dash rush stampede wave                   → bcharge (head down, brace, drive)
     roar warcry enrage                                    → broar   (head up, mouth wide)
     breath torrent venom acid miasma mist gust web barrage
     boltvolley feather                                    → bbreath (head back, then thrust forward with the jaw open)
     bladestorm spin                                       → bspin   (a whole turn on its feet, tail lashing)
     teleport shadowstep burrow soar split                 → bvanish (sinks low and fades)
     meteor field heal healaura shell summon pull, others  → bcast   (stands tall and channels) */
const BPOSE = {
  act:{slam:'bslam', quake:'bslam', trample:'bslam', ring:'bslam', boulder:'bslam', leap:'bslam', g_quake:'bslam',
    charge:'bcharge', rend:'bcharge', dash:'bcharge', rush:'bcharge', stampede:'bcharge', wave:'bcharge',
    roar:'broar', warcry:'broar', enrage:'broar',
    breath:'bbreath', torrent:'bbreath', venom:'bbreath', acid:'bbreath', miasma:'bbreath', mist:'bbreath', gust:'bbreath', web:'bbreath', barrage:'bbreath', boltvolley:'bbreath', feather:'bbreath',
    bladestorm:'bspin', spin:'bspin',
    teleport:'bvanish', shadowstep:'bvanish', burrow:'bvanish', soar:'bvanish', split:'bvanish'},
  kind:{heavy:'bslam', dash:'bcharge', spin:'bspin', roar:'broar', blink:'bvanish', power:'bcast', spell:'bcast'},
  hitK:{bslam:.62, bcharge:.56, broar:.4, bcast:.5, bbreath:.5, bspin:.5, bvanish:.6, bphase:.5}};   // where in the pose the blow is
function bposeFor(id, kind){ return BPOSE.act[id] || BPOSE.kind[kind] || 'bcast'; }
function bposeStart(m, act, wait){ if (!m || !m.def || !m.def.boss || typeof SHEETS === 'undefined' || !SHEETS) return; const sh = SHEETS[m.type]; if (!sh || !SPR.bossActs) return; SPR.bossActs(sh); if (!sh.index[act]) return;
  m.bp = {act, t0:T, total:Math.min(2.4, Math.max(.8, wait / BPOSE.hitK[act]))}; }
if (typeof baStart === 'function'){ const _bs = baStart; baStart = function(m, id, kind, wind, name, sig){ const r = _bs.apply(this, arguments);
  try { if (m && m.ba && !m.dead) bposeStart(m, bposeFor(id, kind), m.ba.wind); } catch (e) { console.warn('bosspose', e); } return r; }; }
if (typeof VFX !== 'undefined' && VFX.play){ const _vp = VFX.play; VFX.play = function(name, o){ if (name === 'enrage' && o && o.m && o.m.enraged && !(o.m.bp && T - o.m.bp.t0 < o.m.bp.total)) try { bposeStart(o.m, 'broar', .6); } catch (e) {} return _vp.apply(this, arguments); }; }
{ const _ma = mobAnim; mobAnim = function(m){ const b = m && m.bp; if (b && !m.dead){ const e = (T - b.t0) / b.total; if (e >= 0 && e < 1) return [b.act, e * .8 - .0001]; m.bp = null; } return _ma.apply(this, arguments); }; }   // 8 frames at 10 a second = .8
/* (v314) a new phase: the boss reels back, then rises roaring (the roar and its knock-back are js/sys/bossfury.js) */
if (typeof furyPhaseUp === 'function'){ const _fp = furyPhaseUp; furyPhaseUp = function(m){ const r = _fp.apply(this, arguments); try { bposeStart(m, 'bphase', .5); } catch (e) {} return r; }; }
