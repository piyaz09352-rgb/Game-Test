/* VAYRATHEN — js/sys/skillsfx.js — (v90) every weapon skill sounds like what it does
   Basic attacks keep their weapon voice (sword clang, dagger tick, bow thunk …). Weapon skills used to share one
   "heavy swing" and one "heavy hit", so a whirlwind, a dash and an arrow rain all sounded the same. Now each skill's
   pattern has its own release and its own impact:
     slash · heavy (slams, quakes) · spin (around you) · dash (charges, lunges) · blink (vanish / step back) ·
     shot (arrows, darts, throws) · rain (falls on an area) · line (a wave or a pierce through a row) ·
     flurry (many quick blows) · trap · steal (coins) · roar.
   Spells (by element) and muay strikes (by limb) already had their own voices and are unchanged. */
'use strict';

const SKSFX = {cast:null, hit:null, last:{}};
/* which pattern a skill is, from what it does */
function skPattern(sk){
  if (!sk) return 'slash';
  const t = sk.type, fx = sk.fx || '', a = sk.act || '';
  if (t === 'steal' || fx === 'coins') return 'steal';
  if (t === 'trap' || fx === 'trap' || a === 'settrap') return 'trap';
  if (fx === 'roar' || a === 'shout') return 'roar';
  if (t === 'blink' || t === 'backstep' || /blink/i.test(fx)) return 'blink';
  if (t === 'dash' || fx === 'charge' || a === 'lunge') return 'dash';
  if (t === 'line' || fx === 'pierce' || fx === 'waveslash') return 'line';
  if (/rain/.test(fx) || t === 'aoeTarget' || t === 'fieldDot') return 'rain';
  if (t === 'ranged' || t === 'bolt' || /arrow|dart/.test(fx) || a === 'throw' || a === 'aimup') return 'shot';
  if (t === 'stone' || /quake|earthsplit/.test(fx) || a === 'slam' || a === 'heave') return 'heavy';
  if (t === 'aoeSelf' || /storm/.test(fx) || a === 'whirl' || a === 'twinspin') return 'spin';
  if ((sk.hits || 1) >= 3 || fx === 'thousand' || a === 'flurry') return 'flurry';
  return 'slash';
}
/* small synth on the game's own sound output */
function skx(){ const r = typeof SFX !== 'undefined' && SFX.raw ? SFX.raw() : null; return r && r.vol.s > 0 ? r : null; }
function skOsc(r, type, f, t, d, v, o = {}){
  const a = r.ac, s = a.createOscillator(), g = a.createGain(); s.type = type; s.frequency.setValueAtTime(f, t);
  if (o.to) s.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + (o.glide || d));
  let node = s; if (o.lp){ const fl = a.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; s.connect(fl); node = fl; }
  node.connect(g); g.connect(r.out);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + (o.at ?? .005)); g.gain.exponentialRampToValueAtTime(.0004, t + d);
  s.start(t); s.stop(t + d + .05);
}
function skNoise(r, t, d, v, o = {}){
  const a = r.ac, s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); s.buffer = r.nb; s.loop = true;
  f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 2000, t); if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + d); f.Q.value = o.q || 1;
  s.connect(f); f.connect(g); g.connect(r.out); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + (o.at || .003)); g.gain.exponentialRampToValueAtTime(.0004, t + d);
  s.start(t, Math.random() * .5); s.stop(t + d + .05);
}
/* the moment the skill goes off */
const SK_CAST = {
  slash(r, t){ skNoise(r, t, .2, .45, {f:1200, to:6500, q:1.6}); skOsc(r, 'sine', 2350, t + .05, .4, .07); skOsc(r, 'sine', 3520, t + .06, .25, .035); },
  heavy(r, t){ skNoise(r, t, .3, .35, {f:300, to:1400, q:.8}); skOsc(r, 'sine', 90, t + .18, .5, .5, {to:32}); skNoise(r, t + .18, .45, .4, {f:260, q:.6, type:'lowpass'}); },
  spin(r, t){ [0, .09, .18, .27].forEach((o, i) => skNoise(r, t + o, .13, .32, {f:i % 2 ? 1800 : 900, to:i % 2 ? 700 : 2600, q:1.8})); skOsc(r, 'triangle', 220, t, .4, .08, {to:440}); },
  dash(r, t){ skNoise(r, t, .32, .4, {f:350, to:3200, q:.9, at:.05}); skOsc(r, 'sine', 110, t + .26, .22, .4, {to:50}); },
  blink(r, t){ skOsc(r, 'sine', 1900, t, .14, .16, {to:260}); skNoise(r, t, .12, .2, {f:6000, to:1500, q:3}); skOsc(r, 'sine', 300, t + .12, .1, .1, {to:1500}); },
  shot(r, t){ skOsc(r, 'triangle', 190, t, .2, .32, {to:115}); skNoise(r, t + .02, .28, .22, {f:1300, to:4200, q:3}); skOsc(r, 'sine', 1200, t + .03, .3, .06, {to:2400}); },
  rain(r, t){ skOsc(r, 'sine', 500, t, .45, .1, {to:1600}); skNoise(r, t, .4, .16, {f:2500, to:6000, q:4, at:.1});
    for (let i = 0; i < 6; i++) skNoise(r, t + .4 + i * .055 + Math.random() * .02, .05, .26, {f:2200 + Math.random() * 1200, q:1.4}); },
  line(r, t){ skNoise(r, t, .4, .45, {f:4200, to:700, q:2.2, at:.02}); skOsc(r, 'sawtooth', 330, t, .32, .1, {to:110, lp:1600}); skOsc(r, 'sine', 1660, t + .02, .35, .05); },
  flurry(r, t){ for (let i = 0; i < 5; i++) skNoise(r, t + i * .055, .07, .34, {f:1500 + i * 300, to:4500, q:1.6}); },
  trap(r, t){ skOsc(r, 'square', 900, t, .03, .14, {lp:3000}); skOsc(r, 'square', 600, t + .07, .04, .14, {lp:2400}); skNoise(r, t + .07, .06, .25, {f:3500, q:5}); },
  steal(r, t){ [1568, 2093, 2637, 2093].forEach((f, i) => { skOsc(r, 'sine', f, t + i * .05, .25, .08); skOsc(r, 'sine', f * 2.7, t + i * .05, .08, .03); }); skNoise(r, t, .1, .15, {f:7000, q:4}); },
  roar(r, t){ skOsc(r, 'sawtooth', 95, t, .6, .22, {to:70, lp:600, at:.04}); skOsc(r, 'sawtooth', 142, t, .55, .12, {to:100, lp:700, at:.04}); skNoise(r, t, .5, .25, {f:500, q:.7, at:.05}); }
};
/* each blow that lands */
const SK_HIT = {
  slash(r, t){ skNoise(r, t, .06, .55, {f:3600, q:1.1}); skOsc(r, 'square', 240, t, .13, .2, {to:80, lp:1500}); },
  heavy(r, t){ skNoise(r, t, .05, .6, {f:900, q:.7}); skOsc(r, 'sine', 120, t, .45, .6, {to:35, glide:.25}); skNoise(r, t + .03, .35, .3, {f:220, q:.6, type:'lowpass'}); },
  spin(r, t){ skNoise(r, t, .05, .38, {f:2400, q:1.2}); skOsc(r, 'square', 300, t, .08, .12, {to:120, lp:1600}); },
  dash(r, t){ skNoise(r, t, .07, .5, {f:600, q:.7}); skOsc(r, 'sine', 95, t, .28, .5, {to:40}); },
  blink(r, t){ skNoise(r, t, .04, .5, {f:5200, q:1.5}); skOsc(r, 'sine', 1400, t, .1, .08, {to:500}); },
  shot(r, t){ skNoise(r, t, .04, .4, {f:2000, q:1}); skOsc(r, 'triangle', 330, t, .1, .25, {to:150}); },
  rain(r, t){ skNoise(r, t, .05, .32, {f:1600 + Math.random() * 1400, q:1.2}); skOsc(r, 'sine', 210, t, .08, .14, {to:100}); },
  line(r, t){ skNoise(r, t, .09, .5, {f:5200, to:1800, q:2}); skOsc(r, 'square', 420, t, .1, .14, {to:140, lp:2200}); },
  flurry(r, t){ skNoise(r, t, .035, .42, {f:3000 + Math.random() * 1500, q:1.3}); skOsc(r, 'square', 280, t, .05, .1, {to:140, lp:1600}); },
  trap(r, t){ skOsc(r, 'square', 520, t, .05, .2, {lp:2000}); skNoise(r, t, .12, .35, {f:1400, q:.9}); },
  steal(r, t){ skOsc(r, 'sine', 2093, t, .15, .08); skNoise(r, t, .05, .3, {f:2600, q:1}); },
  roar(r, t){ skNoise(r, t, .08, .45, {f:700, q:.7}); skOsc(r, 'sine', 80, t, .3, .45, {to:38}); }
};
function skPlay(set, kind){
  const r = skx(), fn = set[kind]; if (!r || !fn) return;
  const now = r.ac.currentTime, k = (set === SK_CAST ? 'c' : 'h') + kind;
  if (SKSFX.last[k] && now - SKSFX.last[k] < (set === SK_CAST ? .05 : .045)) return;   // a skill hitting many monsters at once is one sound, not a wall
  SKSFX.last[k] = now; fn(r, now + .005);
}
/* the cast and the hits know which skill they belong to */
{ const _ex = execSkill;
  execSkill = function(id){ const was = SKSFX.cast; SKSFX.cast = SKILLS[id] || null; try { return _ex.apply(this, arguments); } finally { SKSFX.cast = was; } }; }
{ const _ad = applyDamage;
  applyDamage = function(m, res, sk){ const was = SKSFX.hit; SKSFX.hit = sk && typeof sk === 'object' ? sk : sk && SKILLS[sk] || null; try { return _ad.apply(this, arguments); } finally { SKSFX.hit = was; } }; }
{ const _pl = SFX.play;
  SFX.play = function(name, o){
    if (name === 'skill_phys' && SKSFX.cast){ skPlay(SK_CAST, skPattern(SKSFX.cast)); return; }
    if (name === 'skill_hit' && SKSFX.hit){ skPlay(SK_HIT, skPattern(SKSFX.hit)); return; }
    if (name === 'crit' && SKSFX.hit && JOBS[S.job].weapon.type !== 'fist'){ skPlay(SK_HIT, skPattern(SKSFX.hit)); }   // a skill's critical keeps its own blow under the big drum
    return _pl.apply(this, arguments);
  };
}
