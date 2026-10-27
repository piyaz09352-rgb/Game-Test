/* VAYRATHEN — js/sys/ambience.js — the world's own sounds, all synthesised (no recordings)
   · waterfalls roar as you walk near (louder the closer), rivers and the sea murmur, lava bubbles
   · wind that gusts with the swaying trees · rain and storm hiss · thunder for every lightning strike
   · birds chirp by day, crickets sing at night (outdoors)
   · every boss has its own roar: pitch, growl and length come from what it is (a great bird shrieks, an elephant
     trumpets, a serpent hisses, a giant bellows) and it plays when the boss notices you, changes phase or rampages.
   Volume follows the sound-effects slider. Nature always plays together with the background music (quieter in town). */
'use strict';

const AMB = (() => {
  let on = false, A = null, nodes = null, chirpT = 2, cricketT = 1;
  function build(){
    const r = SFX.raw && SFX.raw(); if (!r) return false; A = r;
    const ac = r.ac, mk = (type, f, q) => { const s = ac.createBufferSource(); s.buffer = r.nb; s.loop = true; s.playbackRate.value = .5 + Math.random() * .5;
      const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = ac.createGain(); g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(r.out); s.start(); return {s, fl, g}; };
    nodes = {fall:mk('lowpass', 1100, .4), fall2:mk('bandpass', 2600, .6), water:mk('bandpass', 700, .5), wind:mk('bandpass', 380, .8), rain:mk('highpass', 2600, .4), lava:mk('lowpass', 260, .8)};
    return true;
  }
  const set = (n, v) => { if (!nodes) return; const g = nodes[n].g.gain; g.setTargetAtTime(Math.max(0, v), A.ac.currentTime, .35); };
  function update(){
    const r = SFX.raw && SFX.raw(); if (!r){ return; } if (!nodes && !build()) return;
    const sv = r.vol ? r.vol.s : .6, mute = sv <= 0 || document.hidden;
    const k = mute ? 0 : (inVillage(P) ? .5 : 1.8);   // nature plays together with the music everywhere (softer in town), loud enough to hear over the recorded songs
    // waterfalls / lava falls
    let wf = 0, lava = 0; for (const f of WFALLS){ const d = Math.hypot(P.x - f.x, P.y - f.y), v = Math.pow(Math.max(0, 1 - d / 460), 2); if (f.kind === 'lava') lava = Math.max(lava, v); else wf = Math.max(wf, v); }
    // rivers and sea bands, ponds
    let wat = 0; for (const w of WATERS){ if (w.kind !== 'water') { if (w.kind === 'lava' && w.k === 'pond'){ const d = Math.hypot(P.x - w.x, P.y - w.y) - w.rx; lava = Math.max(lava, Math.max(0, 1 - d / 220) * .5); } continue; }
      if (w.k === 'band'){ const mid = (w.y0 + w.y1) / 2, d = Math.abs(P.y - mid) - (w.y1 - w.y0) / 2; wat = Math.max(wat, Math.max(0, 1 - d / 320) * (w.foam ? (.7 + .3 * Math.sin(T * .9)) : .6)); }
      else { const d = Math.hypot(P.x - w.x, P.y - w.y) - w.rx; wat = Math.max(wat, Math.max(0, 1 - d / 160) * .3); } }
    const out = !(MAP_ID && BIOME[MAPS[MAP_ID].biome] && BIOME[MAPS[MAP_ID].biome].fx === 'dark'), wxw = typeof wxNow === 'function' ? wxNow() : 'clear', wk = typeof WXS !== 'undefined' ? WXS.k : 0;
    const gust = .55 + .3 * Math.sin(T * .23) + .15 * Math.sin(T * .71 + 1);
    set('fall', wf * .32 * k); set('fall2', wf * .1 * k); set('water', wat * .12 * k); set('lava', lava * .2 * k);
    set('wind', out ? (.018 + gust * .02 + (wxw === 'storm' ? .05 : 0)) * k : .008 * k);
    set('rain', (wxw === 'rain' ? .05 : wxw === 'storm' ? .09 : 0) * wk * k);
    if (nodes) nodes.wind.fl.frequency.setTargetAtTime(300 + gust * 260, A.ac.currentTime, .6);
  }
  // birds by day, crickets by night
  function critters(dt){
    if (!nodes || !A) return; const sv = A.vol ? A.vol.s : .6; if (sv <= 0 || document.hidden) return; const kv = inVillage(P) ? 1.2 : 2.2;
    const out = !(MAP_ID && BIOME[MAPS[MAP_ID].biome] && BIOME[MAPS[MAP_ID].biome].fx === 'dark'), wxw = typeof wxNow === 'function' ? wxNow() : 'clear'; if (!out || wxw === 'storm') return;
    const ac = A.ac, now = ac.currentTime;
    if (isNight()){ if ((cricketT -= dt) > 0) return; cricketT = .5 + Math.random() * 1.5;
      const f = 4100 + Math.random() * 600, n = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++){ const o = ac.createOscillator(), g = ac.createGain(), t = now + i * .055; o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.012 * kv, t + .006); g.gain.exponentialRampToValueAtTime(.0003, t + .04); o.connect(g); g.connect(A.out); o.start(t); o.stop(t + .05); }
      return; }
    if ((chirpT -= dt) > 0 || wxw === 'rain') return; chirpT = 3 + Math.random() * 8;
    const base = 2200 + Math.random() * 1500, n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++){ const o = ac.createOscillator(), g = ac.createGain(), t = now + i * (.09 + Math.random() * .05); o.type = 'sine';
      o.frequency.setValueAtTime(base, t); o.frequency.exponentialRampToValueAtTime(base * (1.3 + Math.random() * .4), t + .06);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.022 * kv, t + .01); g.gain.exponentialRampToValueAtTime(.0003, t + .08); o.connect(g); g.connect(A.out); o.start(t); o.stop(t + .1); }
  }
  function thunder(){
    if (inVillage(P)) return;   // safe zones stay quiet
    const r = SFX.raw && SFX.raw(); if (!r || !r.vol || r.vol.s <= 0){ SFX.play('boom'); return; }
    const ac = r.ac, now = ac.currentTime, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = r.nb; s.loop = true; s.playbackRate.value = .4;
    f.type = 'lowpass'; f.frequency.setValueAtTime(1800, now); f.frequency.exponentialRampToValueAtTime(120, now + 2.4);
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(.5, now + .02); g.gain.exponentialRampToValueAtTime(.18, now + .3); g.gain.exponentialRampToValueAtTime(.0004, now + 2.8);
    s.connect(f); f.connect(g); g.connect(r.out); s.start(now); s.stop(now + 3);
  }
  /* a boss's own roar */
  const ARCH_V = {bird:{f:620, to:900, noise:3000, d:.8, wave:'sawtooth'}, quad:{f:95, to:60, noise:500, d:1.3, wave:'sawtooth'}, human:{f:120, to:80, noise:700, d:1.1, wave:'square'},
    squat:{f:70, to:45, noise:350, d:1.2, wave:'square'}, bug:{f:240, to:180, noise:4200, d:.9, wave:'sawtooth'}, serpent:{f:160, to:110, noise:5200, d:1.4, wave:'triangle'}};
  function roar(m){
    const r = SFX.raw && SFX.raw(); if (!r || !r.vol || r.vol.s <= 0 || !m || !m.def) return;
    const d0 = Math.hypot(P.x - m.x, P.y - m.y); if (d0 > 700) return; const att = Math.max(.15, 1 - d0 / 700);
    const arch = (typeof SPECIES_ARCH !== 'undefined' && SPECIES_ARCH[m.type]) || 'human', V = ARCH_V[arch] || ARCH_V.human;
    let h = 0; for (const c of m.type) h = (h * 31 + c.charCodeAt(0)) % 997; const pm = .8 + (h % 40) / 100, elephant = /elephant|erawan|kotchasi/.test(m.type);
    const ac = r.ac, now = ac.currentTime, dur = V.d * (1 + (m.fz && m.fz.berserk > 0 ? .3 : 0)), vol = .28 * att * (m.fz && m.fz.phase >= 3 ? 1.2 : 1);
    const o = ac.createOscillator(), o2 = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), fl = ac.createBiquadFilter(), g = ac.createGain();
    o.type = elephant ? 'square' : V.wave; o2.type = 'sawtooth'; const f0 = (elephant ? 420 : V.f) * pm, f1 = (elephant ? 640 : V.to) * pm;
    o.frequency.setValueAtTime(f0, now); o.frequency.linearRampToValueAtTime(f0 * 1.15, now + dur * .25); o.frequency.exponentialRampToValueAtTime(f1, now + dur);
    o2.frequency.setValueAtTime(f0 * 1.51, now); o2.frequency.exponentialRampToValueAtTime(f1 * 1.5, now + dur);
    lfo.frequency.value = 18 + (h % 12); lg.gain.value = f0 * .06; lfo.connect(lg); lg.connect(o.frequency);
    fl.type = 'bandpass'; fl.frequency.value = elephant ? 1400 : Math.min(2600, f0 * 5); fl.Q.value = 1.2;
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(vol, now + .06); g.gain.setValueAtTime(vol, now + dur * .6); g.gain.exponentialRampToValueAtTime(.0004, now + dur);
    o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(r.out); o.start(now); o2.start(now); lfo.start(now); o.stop(now + dur + .05); o2.stop(now + dur + .05); lfo.stop(now + dur + .05);
    const s = ac.createBufferSource(), nf = ac.createBiquadFilter(), ng = ac.createGain(); s.buffer = r.nb; s.loop = true; nf.type = 'bandpass'; nf.frequency.value = V.noise; nf.Q.value = .7;
    ng.gain.setValueAtTime(0, now); ng.gain.linearRampToValueAtTime(vol * .7, now + .05); ng.gain.exponentialRampToValueAtTime(.0004, now + dur * .9); s.connect(nf); nf.connect(ng); ng.connect(r.out); s.start(now); s.stop(now + dur);
  }
  let upT = 0;
  EV.on('tick', dt => { upT -= dt; if (upT <= 0){ upT = .25; update(); } critters(dt); });
  return {thunder, roar};
})();
