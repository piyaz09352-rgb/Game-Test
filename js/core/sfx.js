/* VAYRATHEN — js/core/sfx.js
   All sound is synthesised with Web Audio (no files):
   · SFX.play(name) — hits, swings, arrows, spells, pickups, UI.
   · SFX.music(mood) — a looping Thai-style ensemble per region: ranat (xylophone) melody on a pentatonic scale,
     khim (plucked strings) answering, khlui (flute) long notes in calm places, ching/chap cymbals keeping the
     cycle, klong drum on the strong beats. Each region picks its mood (tempo, register, density); bosses switch
     to a faster battle cycle. Volumes come from Settings (music / effects). The context starts on the first click. */
'use strict';

const SFX = (() => {
  let ac = null, master = null, mus = null, mbus = null, fxg = null, noiseBuf = null;
  const vol = () => (typeof SETTINGS === 'undefined' ? {m:.35, s:.6} : {m:(SETTINGS.musicVol ?? 35) / 100, s:(SETTINGS.sfxVol ?? 60) / 100 * (SETTINGS.sfx === false ? 0 : 1)});
  function ctx(){
    if (ac) { if (ac.state === 'suspended' && !SFX.away) ac.resume(); return ac; }   // (v188) not while the phone is busy (a call, another app): bgm.js sets SFX.away
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    master = ac.createGain(); master.connect(ac.destination);
    mus = ac.createGain(); mus.connect(master); fxg = ac.createGain(); fxg.connect(master); applyVol();
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // music bus: dry + a generated hall reverb (2.4 s), so the ensemble sounds like it plays in a pavilion
    mbus = ac.createGain(); mbus.connect(mus);
    try { const len = Math.round(ac.sampleRate * 2.4), ir = ac.createBuffer(2, len, ac.sampleRate);
      for (let c = 0; c < 2; c++){ const ch = ir.getChannelData(c); for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2) * (i < 120 ? i / 120 : 1); }
      const cv = ac.createConvolver(), wet = ac.createGain(); cv.buffer = ir; wet.gain.value = .32; mbus.connect(cv); cv.connect(wet); wet.connect(mus); } catch (e) {}
    return ac;
  }
  function applyVol(){ if (!ac) return; const v = vol(); mus.gain.value = v.m * .55; fxg.gain.value = v.s; }
  // ---------- voices ----------
  function osc(type, f, t, d, v, out, o = {}){
    const a = ac, s = a.createOscillator(), g = a.createGain(); s.type = type; s.frequency.setValueAtTime(f, t);
    if (o.to) s.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + (o.glide || d));
    if (o.vib){ const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = o.vib; lg.gain.value = f * .012; l.connect(lg); lg.connect(s.frequency); l.start(t); l.stop(t + d + .1); }
    let node = s; if (o.lp){ const fl = a.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; s.connect(fl); node = fl; }
    node.connect(g); g.connect(out);
    const at = o.at ?? .005; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + at); g.gain.exponentialRampToValueAtTime(.0004, t + d);
    s.start(t); s.stop(t + d + .05);
  }
  function noise(t, d, v, out, o = {}){
    const s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter(); s.buffer = noiseBuf; s.loop = true;
    f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 2000, t); if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + d); f.Q.value = o.q || 1;
    s.connect(f); f.connect(g); g.connect(out); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + (o.at || .003)); g.gain.exponentialRampToValueAtTime(.0004, t + d);
    s.start(t, Math.random() * .5); s.stop(t + d + .05);
  }
  const ranat = (f, t, v, out) => { osc('triangle', f, t, .5, v, out); osc('sine', f * 4.02, t, .08, v * .25, out); noise(t, .02, v * .3, out, {f:f * 3, q:4}); };
  const khim = (f, t, v, out) => { osc('sawtooth', f, t, .9, v * .5, out, {lp:f * 4}); osc('triangle', f * 2, t, .4, v * .25, out); };
  const khlui = (f, t, d, v, out) => { osc('sine', f, t, d, v, out, {at:.08, vib:5.5}); noise(t, d * .6, v * .06, out, {f:f * 2, q:2, at:.06}); };
  const ching = (t, v, out, open) => { osc('sine', 3100, t, open ? .45 : .06, v * .25, out); osc('sine', 4320, t, open ? .35 : .05, v * .18, out); noise(t, open ? .3 : .05, v * .35, out, {f:7000, q:3}); };
  const klong = (t, v, out, f = 90) => { osc('sine', f, t, .35, v, out, {to:f * .55, glide:.25}); noise(t, .05, v * .3, out, {f:400, q:1}); };
  const gong = (t, v, out) => { [110, 147.5, 196, 261].forEach((f, i) => osc('sine', f, t, 3.2 - i * .5, v * (1 - i * .2), out, {at:.01, vib:1.5})); noise(t, .2, v * .4, out, {f:300, q:.8}); };
  const bell = (f, t, v, out) => { osc('sine', f, t, 1.6, v, out); osc('sine', f * 2.76, t, .7, v * .3, out); osc('sine', f * 5.4, t, .3, v * .15, out); };

  // ---------- effects ----------
  const FX = {
    swing(t, o){ noise(t, .14, .35, fxg, {f:900, to:3000, q:1.2, type:'bandpass'}); },
    hit(t){ noise(t, .08, .5, fxg, {f:1200, q:.7}); osc('square', 180, t, .1, .2, fxg, {to:70, lp:900}); },
    crit(t){ // critical: an all-out blow on a great drum — "TOOM!" A hard crack of the stick, a huge boom diving in pitch,
      // a sub-bass punch you feel more than hear, a gritty overdriven body, and a long rolling rumble (original synthesis)
      noise(t, .02, 1, fxg, {f:3000, q:.6}); noise(t, .05, .6, fxg, {f:900, q:.8});        // the crack of the hit
      osc('sine', 150, t, .75, 1.2, fxg, {to:40, glide:.22, at:.001});                     // the boom
      osc('sine', 75, t, .9, 1, fxg, {to:30, glide:.35, at:.003});                         // sub-bass punch
      osc('square', 110, t, .32, .35, fxg, {to:45, glide:.2, lp:420, at:.002});            // gritty body
      osc('triangle', 260, t, .12, .4, fxg, {to:120, glide:.08});                          // the shell's knock
      noise(t + .02, .7, .55, fxg, {f:200, to:55, q:.6, type:'lowpass'});                   // rolling rumble
      osc('sine', 48, t + .06, .55, .5, fxg, {at:.02}); },                                   // the floor shaking
    punch(t){ noise(t, .06, .55, fxg, {f:500, q:.8}); osc('sine', 140, t, .12, .4, fxg, {to:60}); },
    arrow(t){ osc('triangle', 520, t, .12, .25, fxg, {to:180, glide:.1}); noise(t, .1, .2, fxg, {f:3000, to:1200, q:2}); },
    cast(t){ osc('sine', 300, t, .5, .12, fxg, {to:900, glide:.45, at:.1}); noise(t, .45, .1, fxg, {f:1500, to:4000, q:3, at:.15}); },
    fire(t){ noise(t, .5, .45, fxg, {f:600, to:200, q:.6, type:'lowpass', at:.01}); osc('sawtooth', 110, t, .3, .1, fxg, {to:60, lp:500}); },
    ice(t){ for (let i = 0; i < 4; i++) osc('sine', 1800 + i * 430, t + i * .03, .25, .1, fxg); noise(t, .2, .2, fxg, {f:6000, q:5}); },
    thunder(t){ noise(t, .9, .7, fxg, {f:300, to:80, q:.5, type:'lowpass'}); noise(t, .12, .5, fxg, {f:4000, q:.6}); },
    holy(t){ bell(880, t, .14, fxg); bell(1320, t + .05, .08, fxg); },
    heal(t){ [523, 659, 784].forEach((f, i) => osc('sine', f, t + i * .07, .4, .12, fxg)); },
    hurt(t){ osc('sawtooth', 220, t, .15, .2, fxg, {to:120, lp:900}); noise(t, .06, .3, fxg, {f:800}); },
    mobDie(t){ osc('triangle', 400, t, .3, .2, fxg, {to:90, glide:.28}); noise(t, .2, .15, fxg, {f:1000, to:300}); },
    coin(t){ osc('square', 1318, t, .08, .12, fxg, {lp:5000}); osc('square', 1760, t + .07, .25, .12, fxg, {lp:5000}); },
    pickup(t){ osc('triangle', 880, t, .1, .2, fxg); osc('triangle', 1320, t + .05, .15, .2, fxg); },
    potion(t){ for (let i = 0; i < 3; i++) osc('sine', 300 + i * 120, t + i * .06, .1, .2, fxg, {to:500 + i * 120, glide:.08}); },
    click(t){ osc('triangle', 1200, t, .04, .12, fxg); },
    warp(t){ osc('sine', 200, t, .9, .2, fxg, {to:1600, glide:.8, at:.05}); noise(t, .8, .1, fxg, {f:800, to:5000, q:4, at:.2}); },
    roar(t){ osc('sawtooth', 90, t, .9, .4, fxg, {to:55, lp:400, at:.05}); noise(t, .9, .35, fxg, {f:300, q:.5, type:'lowpass', at:.05}); },
    boom(t){ osc('sine', 80, t, .6, .6, fxg, {to:35}); noise(t, .5, .5, fxg, {f:500, to:90, type:'lowpass'}); },
    quest(t){ [523, 659, 784, 1046].forEach((f, i) => ranat(f, t + i * .09, .14, fxg)); },
    levelUp(t){ [0, 2, 3, 4, 5, 7].forEach((n, i) => ranat(PENT[n] * 2, t + i * .07, .14, fxg)); bell(PENT[5] * 2, t + .45, .1, fxg); },
    jobUp(t){ [2, 4, 5].forEach((n, i) => ranat(PENT[n] * 2, t + i * .08, .12, fxg)); },
    orb(t){ osc('sine', 660, t, .25, .12, fxg, {to:1320, glide:.12}); osc('triangle', 990, t + .02, .2, .06, fxg); },
    // ===== basic attacks: short, dry, quieter — one voice per weapon type (swing on the attack, hit on contact) =====
    atk_sword(t){ // blade cutting the air: a doppler whoosh (rise then fall) with a thin steel shimmer
      noise(t, .09, .34, fxg, {f:500, to:3400, q:2.2, at:.035}); noise(t + .07, .16, .26, fxg, {f:3400, to:700, q:2, at:.01});
      [3150, 4730, 6080].forEach((f, i) => osc('sine', f, t + .03, .16 - i * .03, .018, fxg)); },
    atk_dagger(t){ // a thin, fast "fiu" as the blade cuts the air
      noise(t, .07, .26, fxg, {f:2600, to:8500, q:3}); osc('sine', 5200, t + .03, .05, .02, fxg, {to:7400, glide:.04}); },
    atk_star(t){ // (v184) a throwing star leaving the hand: a short flick, then the whirr of the spinning blades fading away
      noise(t, .03, .22, fxg, {f:1800, to:3600, q:1.4}); [0, .035, .07, .105].forEach((d, i) => noise(t + .02 + d, .03, .12 - i * .022, fxg, {f:5200 - i * 300, q:4}));
      osc('sine', 6400, t + .02, .12, .012, fxg, {to:5200, glide:.1}); },
    atk_staff(t){ noise(t, .16, .22, fxg, {f:500, to:1400, q:1.1}); },
    atk_fist(t){ noise(t, .05, .2, fxg, {f:900, to:1800, q:1}); },
    atk_bow(t){ osc('triangle', 196, t, .16, .26, fxg, {to:150, glide:.12}); osc('sine', 392, t, .08, .1, fxg); noise(t + .02, .12, .1, fxg, {f:4000, to:2200, q:3}); },
    hit_sword(t){ // steel biting in: sharp transient, slicing hiss, body thud and a short inharmonic steel ring
      noise(t, .018, .55, fxg, {f:3800, q:.9}); noise(t + .005, .11, .32, fxg, {f:1500, to:600, q:1.1});
      osc('sine', 125, t, .12, .34, fxg, {to:65});
      [1180, 1730, 2660, 3920].forEach((f, i) => osc('sine', f, t, .28 - i * .05, .05 - i * .008, fxg)); },
    hit_dagger(t){ // a keen slice: a hissing "chuap" that falls in pitch as the edge goes through, a needle-thin steel ring, a soft cut thud
      noise(t, .09, .5, fxg, {f:7800, to:2200, q:2.4}); noise(t, .025, .35, fxg, {f:4200, q:1});
      osc('sine', 3950, t + .005, .22, .05, fxg); osc('sine', 5930, t + .005, .12, .025, fxg);
      osc('sine', 260, t, .07, .22, fxg, {to:120, glide:.05}); },
    hit_star(t){ // (v184) the star biting in: a bright "tink" of steel, a short bite and a small thud
      noise(t, .02, .42, fxg, {f:5200, q:1.2}); osc('sine', 3300, t, .16, .05, fxg); osc('sine', 4870, t, .09, .03, fxg);
      noise(t + .004, .05, .2, fxg, {f:1600, to:800, q:1}); osc('sine', 200, t, .06, .16, fxg, {to:110}); },
    hit_staff(t){ osc('sine', 210, t, .09, .26, fxg, {to:120}); noise(t, .05, .25, fxg, {f:700, q:1.2}); },
    hit_fist(t){ noise(t, .05, .4, fxg, {f:480, q:.8}); osc('sine', 130, t, .1, .32, fxg, {to:60}); },
    hit_bow(t){ noise(t, .04, .3, fxg, {f:1800, q:1}); osc('sine', 260, t, .06, .18, fxg, {to:140}); },
    // ===== buffs (each family has its own voice), buff ending, passive effects =====
    bf_shield(t){ [523, 784, 1046, 1568].forEach((f, i) => osc('sine', f, t + i * .05, .6, .07, fxg)); osc('triangle', 130, t, .5, .12, fxg, {to:196, at:.08}); noise(t, .5, .06, fxg, {f:6000, q:3, at:.1}); },
    bf_power(t){ klong(t, .35, fxg, 85); klong(t + .22, .3, fxg, 110); ching(t + .1, .5, fxg, true); [3, 5, 7, 8].forEach((n, i) => ranat(PENT[n] * 2, t + .25 + i * .07, .11, fxg)); },
    bf_stealth(t){ noise(t, .45, .3, fxg, {f:1500, to:300, q:.8, at:.02}); osc('sine', 440, t + .1, .4, .05, fxg, {to:220}); },
    bf_herb(t){ for (let i = 0; i < 5; i++) noise(t + i * .05, .06, .12, fxg, {f:3000 + i * 300, q:2}); [659, 880].forEach((f, i) => osc('sine', f, t + .15 + i * .1, .4, .08, fxg)); },
    bf_pet(t){ osc('sine', 1800, t, .12, .12, fxg, {to:2400, glide:.1}); osc('sine', 2200, t + .16, .18, .12, fxg, {to:1600, glide:.15}); },
    bf_tiger(t){ osc('sawtooth', 120, t, .6, .3, fxg, {to:70, lp:600, at:.04}); noise(t, .55, .25, fxg, {f:400, q:.6, type:'lowpass', at:.04}); },
    bf_end(t){ osc('sine', 880, t, .18, .06, fxg, {to:660}); osc('sine', 660, t + .12, .22, .05, fxg, {to:440}); },
    regen(t){ osc('sine', 1046, t, .3, .045, fxg); osc('sine', 1568, t + .06, .3, .035, fxg); },
    laststand(t){ osc('sine', 60, t, .18, .5, fxg); osc('sine', 60, t + .28, .18, .5, fxg); [261.6, 329.6, 392, 523.3].forEach((f, i) => osc('triangle', f, t + .5 + i * .04, 1.1, .08, fxg, {at:.2})); noise(t + .5, 1, .08, fxg, {f:5000, q:2, at:.3}); },
    pdodge(t){ noise(t, .12, .3, fxg, {f:2500, to:6000, q:1.5}); osc('sine', 2637, t + .05, .2, .06, fxg); },
    shieldhit(t){ osc('sine', 1760, t, .2, .1, fxg); osc('sine', 2637, t, .15, .06, fxg); noise(t, .05, .15, fxg, {f:5000, q:2}); },
    planet(t){ osc('sine', 1318, t, .18, .06, fxg, {to:1760}); },
    // ===== potions and items: HP potions grow fuller by tier, SP potions bubble blue, the talisman flutters and warps =====
    pot_hp(t, o = {}){ const k = o.tier || 1; osc('sine', 220, t, .08, .2, fxg, {to:160}); osc('sine', 200, t + .1, .08, .18, fxg, {to:150});
      [523, 659, 784, 1046, 1318].slice(0, 2 + k).forEach((f, i) => osc('triangle', f, t + .18 + i * .05, .35, .08, fxg)); if (k >= 3) bell(1568, t + .4, .06, fxg); },
    pot_sp(t, o = {}){ const k = o.tier || 1; osc('sine', 220, t, .08, .2, fxg, {to:160}); for (let i = 0; i < 4 + k * 2; i++){ const f = 500 + Math.random() * 900; osc('sine', f, t + .12 + i * .035, .06, .08, fxg, {to:f * 1.8}); } osc('sine', 880, t + .3, .4, .06, fxg, {to:1320}); },
    talisman(t){ for (let i = 0; i < 6; i++) noise(t + i * .04, .05, .15, fxg, {f:2000 + i * 200, q:3}); bell(1046, t + .25, .08, fxg); },
    // ===== Muay Thai: every strike sounds different (air on the throw, a different smack on contact) =====
    mt_jab(t){ noise(t, .05, .22, fxg, {f:1800, to:3600, q:1.4}); },
    mt_hook(t){ noise(t, .1, .26, fxg, {f:900, to:2600, q:1.1}); },
    mt_uppercut(t){ noise(t, .12, .28, fxg, {f:600, to:3200, q:1.2}); osc('sine', 180, t, .1, .06, fxg, {to:360}); },
    mt_elbow(t){ noise(t, .06, .3, fxg, {f:2600, to:5200, q:1.8}); },
    mt_knee(t){ noise(t, .09, .26, fxg, {f:700, to:1600, q:1}); },
    mt_kick(t){ noise(t, .2, .34, fxg, {f:400, to:2400, q:.9}); noise(t + .05, .12, .12, fxg, {f:2400, to:4200, q:2}); },
    mt_spin(t){ noise(t, .14, .26, fxg, {f:500, to:1800, q:1}); noise(t + .14, .2, .36, fxg, {f:400, to:2800, q:.9}); },
    mt_teep(t){ noise(t, .12, .24, fxg, {f:300, to:900, q:.8}); },
    mh_jab(t, o = {}){ const v = o.big ? 1.3 : 1; noise(t, .035, .4 * v, fxg, {f:2600, q:1}); osc('sine', 190, t, .06, .16 * v, fxg, {to:110}); },
    mh_hook(t, o = {}){ const v = o.big ? 1.3 : 1; noise(t, .06, .45 * v, fxg, {f:1500, q:.8}); osc('sine', 120, t, .12, .32 * v, fxg, {to:60}); },
    mh_uppercut(t, o = {}){ const v = o.big ? 1.3 : 1; noise(t, .07, .45 * v, fxg, {f:1200, q:.8}); osc('sine', 100, t, .18, .38 * v, fxg, {to:45}); osc('triangle', 520, t, .05, .06, fxg); },
    mh_elbow(t, o = {}){ const v = o.big ? 1.3 : 1; noise(t, .03, .5 * v, fxg, {f:4200, q:1.3}); osc('square', 700, t, .03, .06 * v, fxg, {lp:3000}); osc('sine', 160, t, .07, .2 * v, fxg, {to:80}); },
    mh_knee(t, o = {}){ const v = o.big ? 1.3 : 1; osc('sine', 75, t, .2, .5 * v, fxg, {to:40}); noise(t, .07, .35 * v, fxg, {f:450, q:.9}); },
    mh_kick(t, o = {}){ const v = o.big ? 1.3 : 1; noise(t, .05, .55 * v, fxg, {f:1900, q:.6}); noise(t + .01, .09, .3 * v, fxg, {f:600, q:.8}); osc('sine', 85, t, .2, .42 * v, fxg, {to:42}); },
    mh_teep(t, o = {}){ const v = o.big ? 1.3 : 1; osc('sine', 150, t, .15, .38 * v, fxg, {to:70}); noise(t, .08, .3 * v, fxg, {f:700, q:.7}); },
    // ===== monsters: a voice when they attack and when they are hit, per body type; o.p = pitch (size), o.v = loudness =====
    ma_quad(t, o){ const p = o.p, v = o.v; osc('sawtooth', 140 * p, t, .22, .18 * v, fxg, {to:90 * p, lp:700}); noise(t + .14, .05, .45 * v, fxg, {f:2200 * p, q:1.5}); },
    ma_bird(t, o){ const p = o.p, v = o.v; osc('sawtooth', 1500 * p, t, .16, .1 * v, fxg, {to:900 * p, lp:4000, vib:30}); noise(t, .1, .2 * v, fxg, {f:900, to:400, q:1}); },
    ma_serpent(t, o){ const p = o.p, v = o.v; noise(t, .3, .3 * v, fxg, {f:5000 * p, q:3, at:.04}); noise(t + .22, .05, .4 * v, fxg, {f:1600, q:1}); },
    ma_bug(t, o){ const p = o.p, v = o.v; for (let i = 0; i < 6; i++) noise(t + i * .028, .018, .35 * v, fxg, {f:3800 * p, q:6}); },
    ma_squat(t, o){ const p = o.p, v = o.v; osc('square', 110 * p, t, .16, .16 * v, fxg, {to:70 * p, lp:600}); noise(t + .12, .07, .4 * v, fxg, {f:700, q:.8}); },
    ma_floater(t, o){ const p = o.p, v = o.v; osc('sine', 520 * p, t, .4, .12 * v, fxg, {to:260 * p, vib:7, at:.05}); osc('sine', 790 * p, t, .35, .06 * v, fxg, {to:395 * p, vib:6}); noise(t, .3, .1 * v, fxg, {f:1800, q:4, at:.08}); },
    ma_slime(t, o){ const p = o.p, v = o.v; osc('sine', 300 * p, t, .12, .2 * v, fxg, {to:120 * p}); noise(t + .05, .1, .3 * v, fxg, {f:900, to:300, q:2}); },
    ma_rock(t, o){ const p = o.p, v = o.v; noise(t, .25, .35 * v, fxg, {f:250, q:.6, type:'lowpass'}); osc('sine', 70 * p, t + .1, .25, .45 * v, fxg, {to:40}); },
    ma_human(t, o){ const p = o.p, v = o.v; osc('sawtooth', 160 * p, t, .14, .12 * v, fxg, {to:120 * p, lp:900}); noise(t + .03, .12, .3 * v, fxg, {f:1200, to:3400, q:1.3}); },
    mh_quad(t, o){ const p = o.p, v = o.v; osc('sawtooth', 620 * p, t, .14, .14 * v, fxg, {to:380 * p, lp:2200}); },
    mh_bird(t, o){ const p = o.p, v = o.v; osc('square', 1900 * p, t, .09, .07 * v, fxg, {to:1300 * p, lp:5000}); noise(t, .06, .15 * v, fxg, {f:3000, q:2}); },
    mh_serpent(t, o){ const p = o.p, v = o.v; noise(t, .12, .3 * v, fxg, {f:4200 * p, q:2.5}); },
    mh_bug(t, o){ const p = o.p, v = o.v; noise(t, .04, .45 * v, fxg, {f:2500 * p, q:2}); noise(t + .04, .03, .3 * v, fxg, {f:4500 * p, q:4}); },
    mh_squat(t, o){ const p = o.p, v = o.v; osc('square', 180 * p, t, .1, .14 * v, fxg, {to:120 * p, lp:800}); osc('square', 150 * p, t + .1, .08, .1 * v, fxg, {to:100 * p, lp:800}); },
    mh_floater(t, o){ const p = o.p, v = o.v; osc('sine', 1100 * p, t, .22, .1 * v, fxg, {to:1700 * p, vib:12}); noise(t, .1, .12 * v, fxg, {f:5000, q:3}); },
    mh_slime(t, o){ const p = o.p, v = o.v; osc('sine', 240 * p, t, .1, .2 * v, fxg, {to:420 * p}); noise(t, .08, .25 * v, fxg, {f:600, q:3}); },
    mh_rock(t, o){ const p = o.p, v = o.v; noise(t, .08, .45 * v, fxg, {f:1500 * p, q:1.2}); osc('square', 400 * p, t, .04, .06 * v, fxg, {lp:2000}); },
    mh_human(t, o){ const p = o.p, v = o.v; osc('sawtooth', 210 * p, t, .13, .14 * v, fxg, {to:150 * p, lp:900}); osc('sawtooth', 640 * p, t, .1, .04 * v, fxg, {to:480 * p, lp:1600}); },
    m_shot(t, o){ const p = o.p, v = o.v; osc('triangle', 700 * p, t, .18, .12 * v, fxg, {to:300 * p}); noise(t, .15, .15 * v, fxg, {f:2500, to:900, q:2}); },
    // caster basic: a small elemental orb — soft pluck going out, a pop on contact
    orb(t, o = {}){ const f = ORB_F[o.elem] || 660; osc('sine', f, t, .22, .1, fxg, {to:f * 1.8, glide:.12}); osc('triangle', f * 1.5, t + .02, .16, .05, fxg); },
    orbhit(t, o = {}){ const f = ORB_F[o.elem] || 660; osc('sine', f * 1.2, t, .1, .12, fxg, {to:f * .6}); noise(t, .05, .14, fxg, {f:f * 3, q:2}); },
    // ===== skills: fuller, layered, louder than a basic hit =====
    skill_phys(t, o = {}){ const w = o.w || 'sword';
      if (w === 'bow'){ osc('triangle', 150, t, .22, .32, fxg, {to:110}); noise(t, .25, .25, fxg, {f:5000, to:1500, q:2}); osc('sine', 880, t + .03, .25, .08, fxg, {to:1760, glide:.2}); return; }
      if (w === 'fist'){ noise(t, .14, .4, fxg, {f:700, to:2400, q:.9}); osc('sine', 95, t + .05, .25, .45, fxg, {to:45}); return; }
      noise(t, .22, .42, fxg, {f:900, to:5200, q:1.4}); osc('sawtooth', 120, t, .2, .15, fxg, {to:70, lp:700}); osc('sine', 1760, t + .06, .35, .06, fxg); },
    buff(t){ [0, 2, 4].forEach((n, i) => osc('triangle', PENT[n + 3] * 2, t + i * .06, .3, .1, fxg)); noise(t, .4, .06, fxg, {f:5000, q:2, at:.1}); },
    skill_hit(t){ noise(t, .1, .55, fxg, {f:1500, q:.7}); osc('square', 200, t, .16, .26, fxg, {to:60, lp:1200}); osc('sine', 70, t, .22, .3, fxg, {to:40}); },
    // ===== spells: each element has its own voice for the release and for each hit =====
    sp_fire(t){ noise(t, .55, .45, fxg, {f:700, to:180, q:.6, type:'lowpass', at:.02}); osc('sawtooth', 100, t, .4, .12, fxg, {to:55, lp:450});
      for (let i = 0; i < 7; i++) noise(t + .05 + Math.random() * .4, .025, .25, fxg, {f:2500 + Math.random() * 2500, q:3}); },
    sp_water(t){ [1568, 2093, 2637, 3136].forEach((f, i) => osc('sine', f, t + i * .035, .5, .08, fxg)); noise(t, .25, .16, fxg, {f:7000, q:5}); osc('sine', 392, t, .5, .1, fxg, {to:784, glide:.4, at:.05}); },
    sp_wind(t){ for (let i = 0; i < 5; i++){ const q = t + i * .045; osc('sawtooth', 1800 + Math.random() * 1600, q, .05, .08, fxg, {to:300, glide:.05, lp:6000}); } noise(t, .14, .55, fxg, {f:4500, q:.6}); noise(t + .08, .9, .55, fxg, {f:260, to:70, q:.5, type:'lowpass'}); },
    sp_earth(t){ osc('sine', 60, t, .7, .5, fxg, {to:35}); noise(t, .6, .45, fxg, {f:280, to:90, q:.7, type:'lowpass'}); for (let i = 0; i < 5; i++) noise(t + .08 + i * .07, .05, .3, fxg, {f:900 + i * 200, q:1.5}); },
    sp_holy(t){ bell(784, t, .12, fxg); bell(1175, t + .06, .08, fxg); bell(1568, t + .12, .06, fxg); noise(t, .8, .06, fxg, {f:6000, q:2, at:.2}); },
    sp_shadow(t){ osc('sine', 110, t, .8, .25, fxg, {to:55, at:.25}); osc('sawtooth', 117, t, .7, .08, fxg, {to:52, lp:500, at:.2}); noise(t, .7, .2, fxg, {f:300, to:1200, q:4, at:.3}); },
    sp_poison(t){ for (let i = 0; i < 7; i++){ const q = t + i * .05 + Math.random() * .03, f = 300 + Math.random() * 500; osc('sine', f, q, .07, .12, fxg, {to:f * 2.2, glide:.06}); } noise(t, .45, .15, fxg, {f:3500, q:1.5, at:.05}); },
    sp_neutral(t){ osc('sine', 523, t, .4, .14, fxg, {to:1046, glide:.15}); osc('triangle', 784, t + .05, .35, .08, fxg); noise(t, .2, .1, fxg, {f:3000, q:3}); },
    im_fire(t){ noise(t, .18, .45, fxg, {f:900, to:250, q:.7, type:'lowpass'}); noise(t, .03, .25, fxg, {f:3500, q:3}); },
    im_water(t){ osc('sine', 2637, t, .12, .07, fxg); noise(t, .1, .3, fxg, {f:6500, q:2}); osc('sine', 330, t, .1, .14, fxg, {to:180}); },
    im_wind(t){ noise(t, .08, .45, fxg, {f:5000, q:.7}); osc('sawtooth', 2400, t, .05, .06, fxg, {to:400, lp:6000}); },
    im_earth(t){ osc('sine', 90, t, .18, .4, fxg, {to:45}); noise(t, .12, .35, fxg, {f:600, q:1}); },
    im_holy(t){ osc('sine', 1568, t, .25, .08, fxg); osc('sine', 2349, t, .2, .05, fxg); noise(t, .06, .15, fxg, {f:7000, q:2}); },
    im_shadow(t){ osc('sine', 180, t, .2, .22, fxg, {to:70}); noise(t, .12, .2, fxg, {f:500, q:3}); },
    im_poison(t){ osc('sine', 500, t, .06, .12, fxg, {to:1100}); noise(t, .12, .18, fxg, {f:2800, q:2}); },
    im_neutral(t){ osc('sine', 880, t, .1, .1, fxg, {to:440}); noise(t, .06, .2, fxg, {f:2500, q:1.5}); },
    // casting hum, tinted by element
    cast(t, o = {}){ const f = CAST_F[o.elem] || 300; osc('sine', f, t, .5, .12, fxg, {to:f * 3, glide:.45, at:.1}); noise(t, .45, .09, fxg, {f:f * 5, to:f * 13, q:3, at:.15}); },
    chat(t){ osc('sine', 1046, t, .08, .08, fxg); osc('sine', 1568, t + .06, .1, .06, fxg); },
    // ===== rarity drops: rare = two bright notes, epic = a rising arpeggio with shimmer, legendary = fanfare + gong + choir pad =====
    drop1(t){ ranat(PENT[5] * 2, t, .13, fxg); ranat(PENT[7] * 2, t + .08, .13, fxg); noise(t + .05, .25, .05, fxg, {f:7000, q:3}); },
    drop2(t){ [3, 5, 7, 8, 9].forEach((n, i) => ranat(PENT[n] * 2, t + i * .06, .12, fxg)); bell(PENT[9] * 2, t + .32, .08, fxg); noise(t, .7, .06, fxg, {f:8000, to:4000, q:4, at:.2}); },
    drop3(t){ klong(t, .45, fxg, 70); gong(t, .35, fxg); [0, 2, 4, 5, 7, 9].forEach((n, i) => ranat(PENT[n] * 2, t + .15 + i * .07, .13, fxg));
      [523.3, 659.3, 784, 1046.5].forEach((f, i) => osc('sine', f, t + .55, 1.6, .045, fxg, {at:.3, vib:5})); bell(PENT[9] * 2, t + .6, .1, fxg); noise(t + .5, 1.4, .05, fxg, {f:9000, q:5, at:.4}); },
    // achievement: a bright khong wong run up and a bell
    ach(t){ [0, 2, 3, 5, 7, 9].forEach((n, i) => ranat(PENT[n] * 2, t + i * .055, .12, fxg)); bell(PENT[9] * 2, t + .36, .1, fxg); bell(PENT[7] * 2, t + .5, .07, fxg); ching(t + .36, .5, fxg, true); },
    craft(t){ osc('square', 880, t, .05, .08, fxg, {lp:3000}); noise(t, .05, .3, fxg, {f:3000, q:2}); osc('square', 880, t + .14, .05, .08, fxg, {lp:3000}); noise(t + .14, .05, .3, fxg, {f:3200, q:2}); bell(1318, t + .3, .08, fxg); },
    trade(t){ osc('square', 1318, t, .08, .1, fxg, {lp:5000}); osc('square', 1760, t + .07, .1, .1, fxg, {lp:5000}); osc('square', 2093, t + .15, .25, .1, fxg, {lp:5000}); },
    daily(t){ [5, 7, 9].forEach((n, i) => ranat(PENT[n] * 2, t + i * .08, .13, fxg)); ching(t + .24, .5, fxg, true); },
    wbhorn(t){ [0, .55].forEach(o => { osc('sawtooth', 110, t + o, .9, .14, fxg, {lp:700, at:.12, vib:4}); osc('sawtooth', 165, t + o, .9, .1, fxg, {lp:900, at:.12, vib:4}); }); gong(t + 1.1, .4, fxg); klong(t + 1.1, .5, fxg, 60); },
    tut(t){ bell(1046, t, .07, fxg); bell(1568, t + .1, .05, fxg); }
  };
  const ORB_F = {fire:520, water:880, wind:1040, earth:330, holy:990, shadow:390, poison:620, neutral:660};
  const CAST_F = {fire:220, water:392, wind:330, earth:130, holy:440, shadow:110, poison:262, neutral:300};
  const PENT = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3, 784, 880];
  const last = {};
  function play(name, o){ const a = ctx(); if (!a || !FX[name] || vol().s <= 0) return; const now = a.currentTime;
    if (last[name] && now - last[name] < .04) return; last[name] = now; FX[name](now + .005, o); }
  /* monster voice: body type decides the sound, size and boss decide pitch and weight */
  const MOB_ARCH = {dewblob:'slime', hare:'quad', boar:'quad', lantern:'floater', boss:'slime'};
  function mob(kind, m){ if (!m || !m.def) return; const a0 = (typeof SPECIES_ARCH !== 'undefined' && SPECIES_ARCH[m.type]) || MOB_ARCH[m.type] || 'quad', arch = a0 === 'fish' ? 'serpent' : a0 === 'cave' ? 'quad' : a0;   // (v294) fish use the serpent voice
    const sz = m.def.size, p = (sz === 'l' ? .7 : sz === 'm' ? .88 : 1.1) * (m.def.boss ? .75 : 1), v = m.def.boss ? 1.4 : 1;
    const name = (kind === 'atk' ? 'ma_' : kind === 'shot' ? 'm_shot' : 'mh_') + (kind === 'shot' ? '' : arch); play(name, {p, v}); }
  /* which voices to use: weapon type for basic attacks, element for spells */
  const WPN = w => ({sword:'sword', dagger:'dagger', staff:'staff', fist:'fist', bow:'bow', shuriken:'star'})[w] || 'sword';
  const EL = e => (['fire', 'water', 'wind', 'earth', 'holy', 'shadow', 'poison'].includes(e) ? e : 'neutral');

  // ---------- music ----------
  /* moods: scale offsets on a pentatonic, tempo, which voices play, register */
  const MOODS = {
    village:{bpm:84, root:261.6, mel:'ranat', flute:true, drum:.5, dens:.65},
    field:{bpm:92, root:293.7, mel:'ranat', flute:false, drum:.6, dens:.75},
    forest:{bpm:76, root:220, mel:'khim', flute:true, drum:.4, dens:.55},
    water:{bpm:70, root:246.9, mel:'khim', flute:true, drum:.3, dens:.5},
    dark:{bpm:58, root:146.8, mel:'khim', flute:false, drum:.35, dens:.35, low:true},
    sacred:{bpm:72, root:329.6, mel:'bell', flute:true, drum:.25, dens:.5},
    dry:{bpm:88, root:196, mel:'khim', flute:false, drum:.7, dens:.6},
    battle:{bpm:132, root:220, mel:'ranat', flute:false, drum:1, dens:.95, bass:true, counter:true},
    // title: slow and grand, bells over a held pad · night: hushed khim and flute · world boss: driving, low, with gongs
    title:{bpm:64, root:261.6, mel:'bell', flute:true, drum:.25, dens:.55, pad:true, bass:true, counter:true},
    night:{bpm:62, root:220, mel:'khim', flute:true, drum:.18, dens:.4, pad:true},
    worldboss:{bpm:126, root:174.6, mel:'ranat', flute:false, drum:1, dens:.95, low:true, pad:true, bass:true, counter:true, gong:true}
  };
  for (const k of ['village', 'field', 'forest', 'dry', 'sacred']) Object.assign(MOODS[k], {bass:true, counter:k !== 'forest'});
  MOODS.sacred.pad = true; MOODS.water.pad = true;
  let cur = null, next = 0, step = 0, seq = null, seq2 = null, timer = null;
  let muted = false;   // a recorded track (sys/bgm.js) is playing instead
  function makeSeq(mood, seed){
    let s = seed; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const motif = () => { const m = []; let p = Math.floor(r() * 5); for (let i = 0; i < 8; i++){ p = Math.max(0, Math.min(9, p + Math.floor(r() * 5) - 2)); m.push(r() < mood.dens ? p : -1); } return m; };
    const A = motif(), B = motif(), C = motif();
    return [A, B, A, C, A, B, C, A].flat();      // 64 eighth notes, a classic Thai repeating cycle
  }
  function music(name){
    if (cur === name) return; cur = name; step = 0; const a = ctx(); if (!a) return;
    const mood = MOODS[name] || MOODS.field, sd = (name.length * 7919 + (typeof MAP_ID !== 'undefined' ? MAP_ID : 0) * 131) % 233280 || 1; seq = makeSeq(mood, sd); seq2 = makeSeq({...mood, dens:mood.dens * .6}, (sd * 17 + 3) % 233280 || 2);
    next = a.currentTime + .1;
    if (!timer) timer = setInterval(tick, 60);
  }
  function tick(){
    if (!ac || !cur || muted || vol().m <= 0 || document.hidden) { if (ac) next = Math.max(next, ac.currentTime + .05); return; }
    const mood = MOODS[cur] || MOODS.field, e = 60 / mood.bpm / 2;
    while (next < ac.currentTime + .25){
      // the cycle modulates every 64 steps like a Thai "thang" change: home, up a fourth, home, up a fifth
      const i = step % seq.length, sec = Math.floor(step / seq.length) % 4, tr = Math.pow(2, [0, 5, 0, 7][sec] / 12), out = mbus || mus;
      const P5 = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21], p = seq[i], root = mood.root * (mood.low ? .5 : 1) * tr, f = root * Math.pow(2, P5[Math.max(0, p)] / 12);
      if (p >= 0){ if (mood.mel === 'ranat') ranat(f * 2, next, .09, out); else if (mood.mel === 'bell') bell(f * 2, next, .06, out); else khim(f, next, .1, out); }
      // counter-melody: the khim answers on the off-beats a register lower
      if (mood.counter && i % 2 === 1 && seq2[i] >= 0) khim(root * Math.pow(2, P5[seq2[i]] / 12) * (mood.mel === 'khim' ? 2 : 1), next, .055, out);
      if (i % 8 === 0 && mood.flute) khlui(root * (i % 16 ? 1.5 : 2), next, e * 6, .05, out);
      if (i % 4 === 0 && p < 0) khim(root * .5 * (i % 16 ? 1.5 : 1), next, .06, out);
      // bass (low pluck on the strong beats: root, fifth, root, sixth) and a soft held pad
      if (mood.bass && i % 4 === 0){ const bn = [0, 7, 0, 9][(i / 4) % 4]; osc('triangle', root * .25 * Math.pow(2, bn / 12), next, e * 3.5, .16, out, {lp:500}); }
      if (mood.pad && i % 16 === 0) [0, 7, 12].forEach((n, j) => osc('sawtooth', root * .5 * Math.pow(2, n / 12), next, e * 16, .018 - j * .004, out, {lp:900, at:e * 4, vib:4}));
      if (mood.gong && i % 32 === 0) gong(next, .18, out);
      if (i % 2 === 0) ching(next, .08 * (mood.drum > .3 ? 1 : .6), out, i % 4 === 0);           // ching on, chap off
      if (i % 8 === 0) klong(next, .22 * mood.drum, out); if (mood.drum > .8 && i % 4 === 2) klong(next, .14, out, 130);
      next += e; step++;
    }
  }
  return {muteMusic:v => { muted = !!v; }, raw:() => { const a = ac; return a && fxg ? {ac:a, out:fxg, nb:noiseBuf, vol:vol()} : null; }, play, mob, music, swing:w => play('atk_' + WPN(w)), hit:w => play('hit_' + WPN(w)), spell:e => play('sp_' + EL(e)), impact:e => play('im_' + EL(e)), WPN, EL, setVolume:applyVol, unlock:() => ctx(), levelUp:() => play('levelUp'), jobUp:() => play('jobUp')};
})();
/* the browser only lets audio start after a click or key */
['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, () => SFX.unlock(), {once:true, capture:true}));
