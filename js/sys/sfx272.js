/* VAYRATHEN — js/sys/sfx272.js — (v272) sounds for the new systems, made in the browser like the rest
   · a war horn when an invasion is announced and when it starts · drums when the warlord appears ·
     a short fanfare when it is driven back · a soft chime when a new material goes into the album.
   Played through the game's own sound output (SFX.raw), so the sound-effects volume and mute apply. */
'use strict';
function sfx272(name){
  const R = typeof SFX !== 'undefined' && SFX.raw ? SFX.raw() : null; if (!R || !R.ac || !R.out || (R.vol && R.vol.s <= 0)) return; const a = R.ac, t = a.currentTime, out = R.out;
  const tone = (type, f, t0, dur, v, f2) => { const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.linearRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + Math.min(.12, dur * .3)); g.gain.exponentialRampToValueAtTime(.0005, t0 + dur); o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + dur + .05); };
  const thump = (t0, v) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(140, t0); o.frequency.exponentialRampToValueAtTime(42, t0 + .25);
    g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(.0005, t0 + .32); o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + .4);
    if (R.nb){ const n = a.createBufferSource(), f = a.createBiquadFilter(), ng = a.createGain(); n.buffer = R.nb; f.type = 'lowpass'; f.frequency.value = 900; ng.gain.setValueAtTime(v * .5, t0); ng.gain.exponentialRampToValueAtTime(.0005, t0 + .12); n.connect(f); f.connect(ng); ng.connect(out); n.start(t0); n.stop(t0 + .15); } };
  if (name === 'horn'){ for (const [f, d] of [[146.8, 0], [146.8 * 1.5, .02]]){ tone('sawtooth', f * .995, t + d, 1.25, .07); tone('sawtooth', f * 1.005, t + d, 1.25, .05); } tone('sawtooth', 196, t + 1.25, .9, .07); tone('sawtooth', 293.6, t + 1.25, .9, .05); }
  else if (name === 'drums'){ [0, .28, .56, .7, .84, 1.12].forEach((d, i) => thump(t + d, i === 5 ? .5 : .32)); }
  else if (name === 'fanfare'){ [[523, 0], [659, .12], [784, .24], [1046, .38]].forEach(([f, d]) => { tone('triangle', f, t + d, d === .38 ? .9 : .22, .09); tone('square', f, t + d, d === .38 ? .6 : .18, .02); }); }
  else if (name === 'chime'){ tone('sine', 1318.5, t, .7, .06); tone('sine', 1975.5, t + .08, .9, .045); tone('sine', 2637, t + .16, .6, .02); }
}
// hook them in
if (typeof invBar === 'function'){
  // the horn: at the warning, and when it begins (on the invaded map)
  let lastW = null, lastA = null, bossSeen = null, doneSeen = null;
  EV.on('tick', () => { if (typeof invWindow !== 'function' || !S || !S.lvl) return; const w = invWindow(); if (!w) return;
    if (!w.active && lastW !== w.key && INV.warned[w.key]){ lastW = w.key; sfx272('horn'); }
    if (w.active && lastA !== w.key && MAP_ID === invMap(w.key)){ lastA = w.key; sfx272('horn'); }
    if (INV.boss && !INV.boss.dead && bossSeen !== INV.boss){ bossSeen = INV.boss; sfx272('drums'); }
    if (INV.done[w.key] && doneSeen !== w.key){ doneSeen = w.key; sfx272('fanfare'); } });
}
if (typeof albMark === 'function'){ const _am = albMark; albMark = function(id){ const had = !!(S && S.album && S.album[id]); const r = _am.apply(this, arguments); if (!had && ALB.seeded && S && S.album && S.album[id]) sfx272('chime'); return r; }; }
