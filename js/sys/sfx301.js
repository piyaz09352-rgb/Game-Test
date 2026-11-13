/* VAYRATHEN — js/sys/sfx301.js — (v301) the moments that still had no sound
   The owner asked for the sounds not made yet, «a boss getting angry and the rest». Made in the browser like the
   game's other sounds (through SFX.raw, so the effects volume and mute apply). Now heard:
   · a boss enraged (below 30% HP): a long falling roar over a rising rumble and two heavy drum hits
   · a boss starting a skill: a short low warning stab (a different pitch for each kind of skill)
   · a boss appearing on the map: a distant gong and a low drone
   · the hero falling: a falling tone and a soft thud · HP dropping under a quarter: two heartbeats
   · the hero stunned: a wobbling ring · «not enough …» (SP, coins, room): a soft double «no»
   · mounting the deer: hoof beats and a harness bell; getting down: one hoof and a short bell
   · refining: an anvil ring and a rising sparkle on success, a dull crack on failure
   · three sounds the game already asked for but that did not exist: blink, equip, drop. */
'use strict';
const SFX3 = {last:{}, low:false, lowT:0, stun:false};
function sfx301(name, o = {}){
  const R = typeof SFX !== 'undefined' && SFX.raw ? SFX.raw() : null; if (!R || !R.ac || !R.out || (R.vol && R.vol.s <= 0)) return false;
  const a = R.ac, t = a.currentTime + .01, out = R.out, now = performance.now(); if (SFX3.last[name] && now - SFX3.last[name] < (o.gap ?? 120)) return false; SFX3.last[name] = now;
  const tone = (type, f, t0, dur, v, f2, at = .02) => { const s = a.createOscillator(), g = a.createGain(); s.type = type; s.frequency.setValueAtTime(f, t0); if (f2) s.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
    g.gain.setValueAtTime(.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + Math.min(at, dur * .4)); g.gain.exponentialRampToValueAtTime(.0005, t0 + dur); s.connect(g); g.connect(out); s.start(t0); s.stop(t0 + dur + .05); return s; };
  const noise = (t0, dur, v, type, f, f2, q = .8) => { if (!R.nb) return; const n = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(); n.buffer = R.nb; n.loop = true; fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, t0); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + Math.min(.04, dur * .3)); g.gain.exponentialRampToValueAtTime(.0005, t0 + dur); n.connect(fl); fl.connect(g); g.connect(out); n.start(t0); n.stop(t0 + dur + .05); };
  const thump = (t0, v, f = 130) => { tone('sine', f, t0, .3, v, f * .32, .005); noise(t0, .1, v * .45, 'lowpass', 700); };
  const growl = (t0, dur, v, f, f2) => { const s = a.createOscillator(), lfo = a.createOscillator(), lg = a.createGain(), fl = a.createBiquadFilter(), g = a.createGain();   // a voice: a saw through a moving throat, roughened by a fast wobble
    s.type = 'sawtooth'; s.frequency.setValueAtTime(f, t0); s.frequency.exponentialRampToValueAtTime(f2, t0 + dur); lfo.type = 'square'; lfo.frequency.value = 31; lg.gain.value = f * .18; lfo.connect(lg); lg.connect(s.frequency);
    fl.type = 'bandpass'; fl.Q.value = 2.2; fl.frequency.setValueAtTime(520, t0); fl.frequency.exponentialRampToValueAtTime(1300, t0 + dur * .25); fl.frequency.exponentialRampToValueAtTime(300, t0 + dur);
    g.gain.setValueAtTime(.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + .07); g.gain.setValueAtTime(v, t0 + dur * .55); g.gain.exponentialRampToValueAtTime(.0005, t0 + dur); s.connect(fl); fl.connect(g); g.connect(out); s.start(t0); lfo.start(t0); s.stop(t0 + dur + .05); lfo.stop(t0 + dur + .05); };
  switch (name){
    case 'bossRage': { const big = o.size || 1, f = 150 / big; thump(t, .7, 110); thump(t + .16, .55, 90); growl(t + .05, 1.5, .42, f * 1.5, f * .55); growl(t + .05, 1.5, .25, f * 2.02, f * .8);
      noise(t + .05, 1.4, .22, 'bandpass', 900, 260, 1.2); tone('sine', 38, t, 1.7, .5, 70, .5); thump(t + 1.25, .6, 80); break; }
    case 'bossWarn': { const f = o.f || 98; tone('sawtooth', f, t, .42, .2, f * .94, .015); tone('sawtooth', f * 1.498, t, .42, .13, f * 1.4, .015); tone('square', f / 2, t, .5, .16); noise(t, .12, .12, 'highpass', 2500); thump(t, .45, 95); break; }
    case 'bossCome': tone('sine', 62, t, 2.4, .34, 55, .4); tone('triangle', 196, t + .05, 2.2, .2, 190, .01); tone('sine', 392.5, t + .05, 1.6, .1, 388, .01); tone('sine', 587, t + .05, 1, .05); noise(t + .05, .5, .1, 'bandpass', 1800, 600, 3); thump(t + .05, .5, 100); break;
    case 'fall': tone('triangle', 440, t, .7, .2, 110, .01); tone('sine', 330, t + .05, .8, .14, 70, .01); thump(t + .62, .5, 90); noise(t + .62, .25, .12, 'lowpass', 500); break;
    case 'heart': thump(t, .5, 70); thump(t + .2, .38, 62); thump(t + .85, .42, 70); thump(t + 1.05, .3, 62); break;
    case 'stun': for (let i = 0; i < 3; i++){ tone('sine', 1320 - i * 180, t + i * .11, .3, .09, 990 - i * 160, .005); } tone('triangle', 660, t, .55, .06, 520); break;
    case 'deny': tone('square', 196, t, .09, .1, 185, .005); tone('square', 156, t + .11, .14, .1, 147, .005); break;
    case 'mount': for (const [d, v] of [[0, .4], [.13, .3], [.3, .4], [.43, .3]]){ noise(t + d, .06, v * .5, 'bandpass', 1500, 900, 4); tone('sine', 210, t + d, .07, v * .35, 120, .003); } tone('sine', 2093, t + .5, .5, .07); tone('sine', 3136, t + .5, .35, .035); break;
    case 'dismount': noise(t, .07, .22, 'bandpass', 1300, 800, 4); tone('sine', 190, t, .08, .14, 110, .003); tone('sine', 1760, t + .08, .3, .05); break;
    case 'refineOk': tone('triangle', 1245, t, .5, .22, 1240, .003); tone('sine', 2490, t, .35, .1); noise(t, .05, .25, 'highpass', 3500); for (let i = 0; i < 5; i++) tone('sine', 1047 * Math.pow(1.189, i), t + .2 + i * .06, .3, .08, null, .005); break;
    case 'refineFail': tone('triangle', 311, t, .3, .2, 150, .003); noise(t, .2, .3, 'lowpass', 1400, 300); tone('sawtooth', 110, t + .05, .35, .1, 62); break;
    case 'blink': noise(t, .22, .16, 'bandpass', 600, 4200, 2); tone('sine', 520, t, .2, .1, 1560, .01); tone('sine', 1560, t + .16, .18, .06, 780, .005); break;
    case 'equip': noise(t, .07, .2, 'bandpass', 2600, 1500, 3); tone('triangle', 740, t + .03, .12, .1, 880, .004); tone('sine', 1480, t + .08, .16, .05); break;
    case 'drop': noise(t, .09, .16, 'lowpass', 900, 300); tone('sine', 240, t, .12, .16, 110, .004); break;
    default: return false;
  }
  return true;
}
/* ---------- where they are heard ---------- */
if (typeof SFX !== 'undefined'){ const _pl = SFX.play; SFX.play = function(name){ if (name === 'blink' || name === 'equip' || name === 'drop'){ sfx301(name, {gap:60}); return; } return _pl.apply(this, arguments); }; }
if (typeof VFX !== 'undefined' && VFX.play){ const _vp = VFX.play; VFX.play = function(name, o){ if (name === 'enrage' && o && o.m && o.m.enraged) try { sfx301('bossRage', {size:Math.min(1.6, Math.max(.8, ((o.m.def && o.m.def.scale) || 1))), gap:1500}); } catch (e) {} return _vp.apply(this, arguments); }; }
if (typeof bossCast === 'function'){ const _bc = bossCast, F = {summon:110, heal:147, roar:82, field:98, quake:73, charge:123, volley:131, meteor:87, nova:92};
  bossCast = function(m, id){ const r = _bc.apply(this, arguments); if (r) try { sfx301('bossWarn', {f:F[id] || 98 + (String(id).length % 5) * 6, gap:500}); } catch (e) {} return r; }; }
if (typeof HK !== 'undefined' && HK.spawn) HK.spawn.push(m => { if (m && m.def && m.def.boss && typeof T !== 'undefined' && T > 2 && typeof dist === 'function' && dist(m, P) < 900) try { sfx301('bossCome', {gap:4000}); } catch (e) {} });
if (typeof playerDie === 'function'){ const _pd = playerDie; playerDie = function(){ const was = P.dead; const r = _pd.apply(this, arguments); if (!was && P.dead) try { sfx301('fall', {gap:1500}); } catch (e) {} return r; }; }
if (typeof toggleRide === 'function'){ const _tr = toggleRide; toggleRide = function(){ const was = !!P.ride; const r = _tr.apply(this, arguments); if (!!P.ride !== was) try { sfx301(P.ride ? 'mount' : 'dismount', {gap:300}); } catch (e) {} return r; }; }
if (typeof toast === 'function'){ const _to = toast; toast = function(s){ if (typeof s === 'string' && /ไม่พอ|Not enough|ไม่มีที่ว่าง|เต็มแล้ว|is full|ยังใช้ไม่ได้|not ready/i.test(s)) try { sfx301('deny', {gap:450}); } catch (e) {} return _to.apply(this, arguments); }; }
if (typeof log === 'function'){ const _lg = log; log = function(s){ if (typeof s === 'string'){ if (/ตีบวกสำเร็จ|Refine success/.test(s)) try { sfx301('refineOk'); } catch (e) {} else if (/ตีบวกล้มเหลว|Refine failed/.test(s)) try { sfx301('refineFail'); } catch (e) {} } return _lg.apply(this, arguments); }; }
if (typeof EV !== 'undefined') EV.on('tick', dt => { if (typeof S === 'undefined' || !S || typeof DER === 'undefined' || !DER || !DER.maxhp || P.dead){ SFX3.low = false; return; }
  const low = S.hp > 0 && S.hp < DER.maxhp * .25; SFX3.lowT -= dt; if (low && (!SFX3.low || SFX3.lowT <= 0) && !(typeof SETTINGS !== 'undefined' && SETTINGS.heartbeat === false)){ sfx301('heart', {gap:2500}); SFX3.lowT = 6; } SFX3.low = low;
  const st = (P.stunT || 0) > 0; if (st && !SFX3.stun) sfx301('stun', {gap:900}); SFX3.stun = st; });
