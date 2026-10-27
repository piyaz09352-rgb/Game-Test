/* VAYRATHEN — js/sys/sfx2.js — sounds for the newer skills (all synthesised, on the sound-effects volume)
   แยกร่างเงา: a smoky whoosh · ปามีดเงา: a flurry of blade whistles · พยัคฆ์พุ่งเงา/เฉือนเอ็น: a lunge swish ·
   อาบพิษอาวุธ: a bubbling hiss · สุริยาถล่ม: fire roar and crackle · มหาอุทกภัย: rain hiss and thunder ·
   พายุอสนีบาต: howling wind and thunder claps · ธรณีสูบ: a deep rumble and crashing rocks · ปิดฉากมวยไทย: a heavy impact */
'use strict';

const SX = (() => {
  const R = () => (typeof SFX !== 'undefined' && SFX.raw ? SFX.raw() : null);
  function noise(type, f0, f1, dur, gain, at = 0, q = .8){ const r = R(); if (!r || !r.vol || r.vol.s <= 0) return; const ac = r.ac, t = ac.currentTime + at;
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = r.nb; s.loop = true; s.playbackRate.value = .6 + Math.random() * .6;
    fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + Math.min(.08, dur * .2)); g.gain.exponentialRampToValueAtTime(.0004, t + dur);
    s.connect(fl); fl.connect(g); g.connect(r.out); s.start(t); s.stop(t + dur + .05); }
  function tone(type, f0, f1, dur, gain, at = 0){ const r = R(); if (!r || !r.vol || r.vol.s <= 0) return; const ac = r.ac, t = ac.currentTime + at;
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .01); g.gain.exponentialRampToValueAtTime(.0004, t + dur); o.connect(g); g.connect(r.out); o.start(t); o.stop(t + dur + .05); }
  const thunder = (at = 0) => setTimeout(() => { if (typeof AMB !== 'undefined' && AMB.thunder) AMB.thunder(); else noise('lowpass', 900, 80, 2, .4); }, at * 1000);
  return {
    whoosh(){ noise('bandpass', 2400, 300, .55, .35, 0, 1.2); noise('lowpass', 600, 120, .7, .2, .05); },
    knives(n = 10){ for (let i = 0; i < n; i++){ noise('bandpass', 5200, 2400, .09, .16, i * .05, 3); tone('triangle', 1800, 900, .05, .03, i * .05); } },
    lunge(){ noise('bandpass', 900, 3200, .22, .3, 0, 1); tone('sawtooth', 160, 60, .18, .08, .16); },
    venom(){ for (let i = 0; i < 6; i++) tone('sine', 300 + Math.random() * 400, 900 + Math.random() * 500, .08, .05, i * .07); noise('highpass', 3000, 1800, .5, .1); },
    fire(){ noise('lowpass', 700, 140, 2.6, .45); for (let i = 0; i < 18; i++) noise('bandpass', 2500 + Math.random() * 2500, 1500, .04, .18, .1 + Math.random() * 2.6, 4); for (let i = 0; i < 4; i++) noise('lowpass', 400, 60, .8, .5, .3 + i * .5); },
    rain(){ noise('highpass', 4200, 2600, 4.8, .2, 0, .4); noise('bandpass', 1600, 1200, 4.8, .1, .1, .6); thunder(.8); thunder(3); for (let i = 0; i < 16; i++) tone('triangle', 3000 + Math.random() * 1500, 2000, .04, .03, .5 + Math.random() * 4); },
    storm(){ const r = R(); if (!r) return; for (let k = 0; k < 3; k++) noise('bandpass', 300 + k * 200, 900 - k * 100, 2, .25, k * 1.4, 2.5); thunder(.3); thunder(1.6); thunder(3.1); },
    quake(){ noise('lowpass', 160, 40, 4, .7); tone('sine', 55, 30, 3, .25); for (let i = 0; i < 10; i++){ noise('lowpass', 700, 90, .6, .55, .3 + i * .38); tone('square', 90, 40, .25, .05, .3 + i * .38); } },
    impact(){ noise('lowpass', 1200, 80, .5, .6); tone('sine', 120, 40, .4, .3); }
  };
})();
const SX_MAP = {shadowclone:'whoosh', smokebomb:'whoosh', knifevolley:'knives', tigerpounce:'lunge', hamstring:'lunge', venomblade:'venom',
  solarfall:'fire', deluge:'rain', tempest:'storm', earthswallow:'quake', earthrage:'quake', finisher:'impact', judgement:'impact', vanguard:'impact'};
{ const _ex = execSkill;
  execSkill = function(id){ const r = _ex.apply(this, arguments); const k = SX_MAP[id]; if (k) try { SX[k](); } catch (e) {} return r; }; }
