/* VAYRATHEN — js/sys/sfxsamples.js — (v168) recorded sounds for normal attacks, weapon by weapon
   The owner records a swing and a hit for each kind of weapon; each pair is listed in SFXS.files. When a hero
   attacks with that kind of weapon, the recording plays instead of the built-in synthesised voice. A kind with no
   recording yet (or one that has not finished loading) keeps the synthesised sound.
   · the hit waits for the swing: a melee blow deals its damage the moment it starts, so the two would sound at once;
     the hit is placed about 80 ms after the swing began, when the blade has come round
   · each play is pitched a hair up or down (±4%) so a run of blows does not sound like one sample repeating
   · the test page (one HTML file) carries the recordings inside it (window.SFX_DATA, added by the build) */
'use strict';

const SFXS = {
  files:{
    // (v169) the one-handed sword swing/hit recordings were taken out at the owner's request (to be made again)
    atk_sword1:'audio/sfx/sword1_attack.mp3',   // (v173) a one-handed sword's normal attack: one blow, one sound
    atk_dagger1:'audio/sfx/dagger1_attack.mp3',   // (v174) a single dagger's normal attack
    atk_bow1:'audio/sfx/bow_shot.mp3',   // (v178) a bow's normal shot (the arrow's landing keeps its own sound)
    atk_star1:'audio/sfx/shuriken_throw.mp3',   // (v185) the ninja's star thrown (its landing keeps the built-in "tink")
    atk_fist1:'audio/sfx/fist_attack1.mp3', atk_fist2:'audio/sfx/fist_attack2.mp3',   // (v179) the boxers' knuckles and gloves: first and second punch
    atk_2h1:'audio/sfx/twohand_attack1.mp3', atk_2h2:'audio/sfx/twohand_attack2.mp3',   // (v177) two-handed weapons that strike twice: first blow, second blow
    crit:'audio/sfx/critical2.mp3',   // (v181) every critical hit of the hero's (v184: louder, a new file name so no old copy is kept)
    miss:'audio/sfx/miss.mp3'   // (v172) every attack that misses ("Miss"), whoever swings it
  },
  gain:{miss:.55, atk_sword1:.55, atk_dagger1:.75, atk_2h1:.55, atk_2h2:.55, atk_bow1:.6, atk_fist1:.6, atk_fist2:.6, atk_star1:.6, crit:1}, buf:{}, busy:{}, fail:{}, sw:-9, lag:.08
};
/* which recorded kind a weapon type is for the hero now: a one-handed sword is 'sword1' (a greatsword, the merchant's axes
   and two-handed blades are other kinds, not recorded yet) */
/* the fists in use are claws: a worn กรงเล็บ, or the cat folk's own claws with no gloves or knuckles worn */
function sfxsClaw(){ const id = S.gear && S.gear.weapon, it = id && ITEMS[id], base = (it && it.base) || id || '';
  if (/^w_claw\d+$/.test(base) || /_claw/.test(base)) return true;
  if (it && it.st && it.st.wtype === 'fist') return !!(it.st.claw);
  return typeof NL_LINE_OF !== 'undefined' && NL_LINE_OF[S.job] === 'catfolk'; }
function sfxsKind(w){
  if (!S) return null;
  // (v177) a blow of a two-handed weapon's double strike (twohand2.js): its own recording for the first and the second blow
  if (typeof BA2 !== 'undefined' && BA2.blow && typeof ba2On === 'function' && ba2On()){
    // (v179) knuckles and gloves punch with the boxers' own sounds; claws (the cat folk, a worn กรงเล็บ) keep the blade-like two-handed ones
    if (w === 'fist' && !sfxsClaw()) return 'fist' + BA2.blow;
    return '2h' + BA2.blow; }
  if (w === 'bow') return 'bow1';
  if (w === 'shuriken') return 'star1';   // (v185) a thrown star
  if (w === 'dagger'){   // (v174) a single dagger: not twin daggers (a worn มีดคู่, or the thief line's own pair) and not a two-handed katana
    const id = S.gear && S.gear.weapon, it = id && ITEMS[id], base = (it && it.base) || id || '';
    if (/^w_tdagger\d+$/.test(base) || (it && it.st && it.st.hands === '2h') || (!it && SPR.CHARS[S.job] && SPR.CHARS[S.job].twin)) return null;
    return 'dagger1'; }
  if (w !== 'sword') return null;
  if (typeof NL_LINE_OF !== 'undefined' && NL_LINE_OF[S.job] === 'merchant') return null;   // axes
  const id = S.gear && S.gear.weapon, it = id && ITEMS[id];
  if (it && it.st && it.st.hands === '2h') return null;
  if (!it && SPR.CHARS[S.job] && SPR.CHARS[S.job].twoHand) return null;                       // a class whose own blade is two-handed
  return 'sword1';
}
function sfxsLoad(k){
  const raw = SFX.raw && SFX.raw(); if (!raw || SFXS.buf[k] || SFXS.busy[k] || SFXS.fail[k]) return;
  const src = (typeof SFX_DATA !== 'undefined' && SFX_DATA[k]) || SFXS.files[k]; if (!src) return;
  SFXS.busy[k] = 1;
  fetch(src).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(b => new Promise((ok, no) => raw.ac.decodeAudioData(b, ok, no)))
    .then(bf => { SFXS.buf[k] = bf; }).catch(() => { SFXS.fail[k] = 1; }).finally(() => { SFXS.busy[k] = 0; });
}
function sfxsPlay(k, at){
  const raw = SFX.raw && SFX.raw(), b = SFXS.buf[k];
  if (!raw || !b){ sfxsLoad(k); return false; }
  if (!(raw.vol && raw.vol.s > 0)) return true;   // sound effects are off: stay silent, do not fall back to the synth
  const s = raw.ac.createBufferSource(), g = raw.ac.createGain();
  s.buffer = b; s.playbackRate.value = .96 + Math.random() * .08; g.gain.value = SFXS.gain[k] ?? .5;
  s.connect(g); g.connect(raw.out); s.start(Math.max(raw.ac.currentTime, at || 0));
  return true;
}
{ const _sw = SFX.swing, _hit = SFX.hit;
  /* (v173) one recording per blow (atk_<kind>): swing and impact in one sound, played as the blow starts; the separate
     hit sound is then left out for that weapon. The blow waits a moment before it sounds (the hit roll comes right after
     the swing begins): a miss plays the recorded miss in its place. */
  // the blow's sound: the recording of this kind, or the built-in one (fallback); a miss right after takes its place
  SFXS.blow = (k, fallback) => { const rec = k && SFXS.buf['atk_' + k];
    if (k && !rec) sfxsLoad('atk_' + k);
    if (rec || SFXS.buf.miss){ const me = SFXS.pend = {};
      queueMicrotask(() => { if (SFXS.pend !== me) return; SFXS.pend = null;
        if (rec && sfxsPlay('atk_' + k)){ const raw = SFX.raw(); SFXS.sw = raw ? raw.ac.currentTime : -9; } else fallback(); });
      return; }
    fallback(); };
  SFX.swing = function(w){ const a = arguments, self = this; SFXS.blow(sfxsKind(w), () => _sw.apply(self, a)); };
  SFX.hit = function(w){ const k = sfxsKind(w), raw = SFX.raw && SFX.raw();
    if (k && k !== 'bow1' && k !== 'star1' && SFXS.buf['atk_' + k] && !SFXS.files['hit_' + k]) return;   // the blow's recording already has its impact (an arrow still lands with its own)
    if (k && raw){ const now = raw.ac.currentTime, at = now - SFXS.sw < SFXS.lag ? SFXS.sw + SFXS.lag : now;
      if (sfxsPlay('hit_' + k, at)) return; }
    return _hit.apply(this, arguments); };
}
/* load the recordings once the sound system is up (it starts with the first tap or key press) */
EV.on('tick', () => { if (SFXS.ready) return; const raw = SFX.raw && SFX.raw(); if (!raw) return; SFXS.ready = 1; for (const k in SFXS.files) sfxsLoad(k); });

/* (v172) every "Miss" of the hero's own attacks — normal attacks and skills, any weapon, on monsters and in PvP or guild
   war — plays the recorded miss; on a normal attack it takes the place of the swing. A monster missing the hero (the
   blue "Miss" over the hero) is not the hero's attack and stays silent */
const SFXM = {t:-9};
{ const _at = addText;
  addText = function(x, y, txt, col){
    if (txt === 'Miss' && col === '#cfcfcf' && SFXS.buf.miss){ if (SFXS.pend) SFXS.pend = null;
      const now = performance.now(); if (now - SFXM.t > 60){ SFXM.t = now; sfxsPlay('miss'); } }
    return _at.apply(this, arguments); }; }

/* (v177) knuckles, gloves and claws voice their blows through the boxing sounds (mt_* as the blow starts, mh_* when it
   lands): in a two-handed double strike the recorded blows take their place */
{ const _pl = SFX.play;
  SFX.play = function(name){
    if (typeof name === 'string' && typeof BA2 !== 'undefined' && BA2.blow && (name.startsWith('mt_') || name.startsWith('mh_'))){
      const k = sfxsKind('fist');
      if (k && SFXS.buf['atk_' + k]){ if (name.startsWith('mt_')){ const a = arguments, self = this; SFXS.blow(k, () => _pl.apply(self, a)); } return; } }
    return _pl.apply(this, arguments); }; }

/* (v181) a critical hit: the recorded cue in place of the built-in drum */
/* (v184) louder (file +4 dB, gain 1); on a normal attack the crit is the only sound: the blow's recording waiting to sound
   (SFXS.pend) is dropped, and combat.js leaves out the weapon's hit voice when the blow is critical */
{ const _pl = SFX.play; SFX.play = function(name){ if (name === 'crit' && SFXS.buf.crit){ SFXS.pend = null; sfxsPlay('crit'); return; } return _pl.apply(this, arguments); }; }
