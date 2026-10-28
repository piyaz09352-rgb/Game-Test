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
    // (v169) the one-handed sword recordings were taken out at the owner's request (to be made again); nothing recorded for now
  },
  gain:{}, buf:{}, busy:{}, fail:{}, sw:-9, lag:.08
};
/* which recorded kind a weapon type is for the hero now: a one-handed sword is 'sword1' (a greatsword, the merchant's axes
   and two-handed blades are other kinds, not recorded yet) */
function sfxsKind(w){
  if (w !== 'sword' || !S) return null;
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
  SFX.swing = function(w){ const k = sfxsKind(w);
    if (k && sfxsPlay('atk_' + k)){ const raw = SFX.raw(); SFXS.sw = raw ? raw.ac.currentTime : -9; return; }
    return _sw.apply(this, arguments); };
  SFX.hit = function(w){ const k = sfxsKind(w), raw = SFX.raw && SFX.raw();
    if (k && raw){ const now = raw.ac.currentTime, at = now - SFXS.sw < SFXS.lag ? SFXS.sw + SFXS.lag : now;
      if (sfxsPlay('hit_' + k, at)) return; }
    return _hit.apply(this, arguments); };
}
/* load the recordings once the sound system is up (it starts with the first tap or key press) */
EV.on('tick', () => { if (SFXS.ready) return; const raw = SFX.raw && SFX.raw(); if (!raw) return; SFXS.ready = 1; for (const k in SFXS.files) sfxsLoad(k); });
