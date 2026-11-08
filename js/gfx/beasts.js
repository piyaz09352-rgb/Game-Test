/* VAYRATHEN — js/gfx/beasts.js
   Monster archetypes for the 20 new maps. Each archetype is a parameterised voxel-ish model drawn with the
   same rasteriser as the heroes (sprites.js), so a handful of bodies become ~130 distinct Thai-folklore
   species just by changing palette, proportions and parts:
     quad     four-legged beasts (boar, cat, bovine, deer/horse, dog, bear, lizard/croc, elephant)
     bird     birds and bats (wings flap; flyers hover)
     serpent  snakes, nagas, eels, millipedes (segmented S-curve, hood, crown, several heads)
     bug      crabs, scorpions, spiders, beetles
     squat    frogs, toads, turtles, clams
     floater  wisps, krasue, haunted jars, squid, lanterns
     slime    jellies with toppers (mushroom cap, lotus, spikes, crown)
     rock     stalagmites and coral that walk
     human    (yaksha, monkeys, ghosts, warriors…) uses the hero model with a monster costume (MOBS[k].human)
   Opt-in details (a monster that does not set them renders exactly as before):
     quad     cracks, shaggy, socks (lower-leg colour), fishTail (fin colour), tusks:'curved', heads (elephant)
     bird     headCol (bare head), bars (barred breast), mantle (hackles/ruff), casque, horns, wingGlow, bats: ears, snout, noseLeaf
     serpent  tailTip (colour of the last quarter), crest (naga crest), spread (fan many heads wider)
     bug      kind:'shrimp', eyeStalks, crown
     squat    turtles: scute (plate seams), ridges (leatherback keels), spots, headStripe, eyeGlow
     floater  tails (count), veil (long hair), hood (shroud), puffs, spikes, lamp, bands, ring; kinds 'vortex', 'star', 'pearl'
     slime    jelly (bell + tentacles), top:'halo'
     rock     crystals, veins (glowing), tree (burnt branches)
     human    necklace, bun
   BEAST.make(key, spec) registers SPR.MOBS[key]; materials are generated with SPR.prim.ramp(). */
'use strict';

const BEAST = (() => {
  const {ell, cap, frustum, rotX, rotY, rotZ, add, mul, lerp3, ramp} = SPR.prim, M = SPR.M;
  const mat = (key, part, col) => (col ? ramp(`${key}_${part}`, col) : null);
  const emis = (key, part, col) => (col ? ramp(`${key}_${part}`, col, {emissive:true}) : null);

  /* shared motion: returns {bob, lun, sw, fall, eyes, tilt, ph} for an action frame */
  function motion(act, f, n){
    const ph = f / n * Math.PI * 2, o = {bob:0, lun:0, sw:0, fall:0, eyes:'open', tilt:0, ph, flap:Math.sin(ph * 2)};
    if (act === 'idle'){ o.bob = Math.sin(ph) * .4; o.flap = Math.sin(ph) * .5; }
    if (act === 'walk'){ o.sw = Math.sin(ph) * .55; o.bob = Math.abs(Math.cos(ph)) * .9; }
    if (act === 'attack'){ o.lun = [0, -2.5, 7, 2][f]; o.tilt = [0, .25, -.35, 0][f]; o.sw = [0, -.3, .5, .1][f]; o.flap = [0, 1, -1, 0][f]; }
    if (act === 'hurt'){ o.lun = -2; o.tilt = .3; o.eyes = 'hurt'; }
    if (act === 'die'){ o.fall = [.35, .9, 1.35, 1.55][f]; o.eyes = 'closed'; }
    return o;
  }
  /* two eyes painted on a head ellipsoid (n = surface normal) */
  function eyesTex(n, o, eyeM, opt = {}){
    if (n[2] < (opt.front ?? .15)) return;
    const sp = opt.sp ?? .45, ey0 = opt.y ?? .15, rx = opt.rx ?? .13, ry = opt.ry ?? .18;
    for (const sx of [-1, 1]){ const ex = n[0] - sx * sp, ey = n[1] - ey0;
      if (o.eyes === 'closed'){ if (Math.abs(ey) < .05 && Math.abs(ex) < rx) return {m:eyeM, t:1}; continue; }
      if (o.eyes === 'hurt'){ if (Math.abs(Math.abs(ex) - Math.abs(ey)) < .05 && Math.abs(ex) < rx) return {m:eyeM, t:1}; continue; }
      const r2 = (ex / rx) ** 2 + (ey / ry) ** 2;
      if (r2 < 1){ if (opt.glow) return {m:eyeM, t:r2 > .7 ? 1 : 0};
        // (v96) a living eye: a white catch-light up and to one side, a darker rim, a lighter lower half
        if (((ex + rx * .32) / (rx * .3)) ** 2 + ((ey - ry * .34) / (ry * .3)) ** 2 < 1) return {m:M.white, t:0};
        return {m:eyeM, t:r2 > .72 ? 3 : ey > ry * .3 && ex < 0 ? 0 : ey < -ry * .35 ? 1 : 2}; } }
  }
  const fallPre = (cx, o, h) => { if (o.fall) cx.pre = p => { const q = rotZ([p[0], p[1] - h, p[2]], o.fall); return [q[0], Math.max(.5, q[1] + h - o.fall * h * .45), q[2]]; }; };

  /* ---------------- quadruped ---------------- */
  function quad(key, s){
    const SK = mat(key, 'skin', s.skin), BE = mat(key, 'belly', s.belly) ?? SK, AC = mat(key, 'acc', s.acc) ?? M.tusk, ST = mat(key, 'stripe', s.stripe),
      MN = mat(key, 'mane', s.mane), EY = s.eyeGlow ? emis(key, 'eye', s.eyeGlow) : M.slimeE, WG = mat(key, 'wing', s.wing),
      SO = mat(key, 'socks', s.socks), FT = mat(key, 'fin', s.fishTail);
    const len = s.len ?? 1, leg = s.leg ?? 1, gir = s.girth ?? 1, hd = s.head || 'boar';
    return (cx, act, f, n) => {
      const o = motion(act, f, n), legL = 8.5 * leg, R = 9.4 * gir, by = legL + R * .72, L = 7 * len;
      // (v119) gaits from life: elephants and crocodiles do not bounce (no moment with all feet off the ground);
      // a crocodile walks with its body bending side to side; a cat's stripes run down its flanks
      const heavy = hd === 'elephant' || hd === 'croc', croc = hd === 'croc';
      if (heavy) o.bob *= .3;
      fallPre(cx, o, by);
      const bend = croc ? (act === 'walk' ? 1.5 : act === 'idle' ? .35 : 0) : 0;
      const T = p => [p[0] + (bend ? Math.sin(o.ph * (act === 'walk' ? 1 : .5) + p[2] * .09) * bend : 0), p[1] + o.bob, p[2] + o.lun];
      const stripeOn = nn => (hd === 'cat' ? Math.sin(nn[2] * 15 + Math.sin(nn[1] * 6) * 1.3) > .6 && nn[1] > -.45 : Math.sin(nn[0] * 9 + nn[2] * 3) > .55 && nn[1] > -.3);
      const skinTex = nn => (ST && stripeOn(nn) ? {m:ST} : s.spots && Math.sin(nn[0] * 13) * Math.sin(nn[2] * 11 + nn[1] * 7) > .6 ? {m:ST || M.slimeE, t:2}
        : s.cracks && Math.abs(Math.sin(nn[0] * 7 + Math.sin(nn[1] * 9) * 1.6 + nn[2] * 4)) < .06 ? {dt:2}           // weathered stone
        : s.shaggy && nn[1] < .3 && Math.sin(nn[0] * 23 + nn[2] * 19) > .35 ? {dt:1} : nn[1] < -.55 ? {m:BE} : undefined);   // long hanging coat
      // legs
      const splay = hd === 'croc' || hd === 'lizard' ? 3 : 0;
      for (const [sd, z, k] of [[-1, L * .8, 1], [1, L * .8, -1], [-1, -L * .8, -1], [1, -L * .8, 1]]){
        cx.gid = 20 + sd + (z > 0 ? 4 : 0);
        // (v119) a cat strikes with a fore paw: on the blow the front foot on the striking side lifts and reaches
        const paw = hd === 'cat' && act === 'attack' && z > 0 && sd > 0 ? (f === 2 ? 1 : f === 1 ? .4 : 0) : 0;
        const top = T([sd * (R * .55), by - R * .3, z]), foot = add(add(top, rotX([sd * splay, -(by - R * .3) + .6, 0], o.sw * k)), [0, paw * 6, paw * 4]);
        cap(cx, top, foot, 2.6 * gir * (hd === 'elephant' ? 1.5 : 1), 2.1 * gir * (hd === 'elephant' ? 1.4 : 1), SK, {tex:(nn, lo, q, t) => (t > .8 ? {m:s.hoof ? AC : SK, t:2} : SO && t > .5 ? {m:SO} : undefined)});
      }
      // body
      cx.gid = 1; ell(cx, T([0, by, -L * .7]), R, R * .88, SK, {tex:skinTex});
      cx.gid = 2; ell(cx, T([0, by + .5, L * .5]), R * 1.06, R * .95, SK, {tex:skinTex});
      // (v119) crocodile: two rows of bony plates (osteoderms) down the back
      if (croc){ cx.gid = 2; for (let z = -L * 1.1, st = L * .5; z <= L * .9; z += st) for (const sd of [-1, 1]) ell(cx, T([sd * R * .24, by + R * .84, z]), 1.1, .8, ST || SK, {}); }   // 5 per row: enough to read, light to build
      // tail
      cx.gid = 3; { let p0 = T([0, by + R * .3, -L * .7 - R * .9]); const thick = hd === 'croc' || hd === 'lizard';
        const cat = hd === 'cat', segs = thick ? 6 : cat ? 6 : 4;
        for (let i = 1; i <= segs; i++){ const k = i / segs;
          // (v119) a big cat's long tail: hangs low, curls up at the tip and sways slowly; a crocodile's is a heavy oar with a ridge
          const sway = cat ? Math.sin(o.ph * (act === 'idle' ? .5 : 1) + k * 2.4) * 3.4 * k : Math.sin(o.ph + k * 2) * 2 * k;
          const p1 = T([sway, by + R * .3 - k * (thick ? 6 : cat ? 9 : 5) + (cat ? k * k * k * 9 : 0) + (s.tailUp ? k * 10 : 0), -L * .7 - R * .9 - k * (thick ? 12 : cat ? 10 : 7)]);
          cap(cx, p0, p1, (thick ? 3.6 : cat ? 1.5 : 1.4) * (1 - k * .6) * gir, (thick ? 3.2 : cat ? 1.3 : 1.2) * (1 - k * .65) * gir, cat && ST && i % 2 && k > .4 ? ST : SK, {});
          if (croc && i < segs && i % 2){ cx.gid = 3; ell(cx, add(p1, [0, (3.2 * (1 - k * .65)) * gir * .9, 0]), .9 * (1 - k * .5), 1 * (1 - k * .5), ST || SK, {}); }
          p0 = p1; }
        if (s.tuft){ cx.gid = 4; ell(cx, p0, 2.2, 2.2, MN || SK); }
        if (FT){ cx.gid = 4; for (const sd of [-1, 1]) ell(cx, add(p0, [sd * 3.4 * gir, .5, -2.4]), 4.6 * gir, 1.5 * gir, FT, {rz:3.6, tex:nn => (Math.sin(nn[0] * 14) > .5 ? {dt:1} : undefined)}); } }   // fish tail (wari kunchon)
      // wings (winged horse, kotchasi…)
      if (WG){ for (const sd of [-1, 1]){ cx.gid = 5 + sd; for (let i = 0; i < 4; i++){ const k = i / 3; ell(cx, T([sd * (R * .6 + k * 9), by + R * .8 + k * 4 + o.flap * k * 4, -2 - k * 3]), 5 - k * 1.6, 1.8, WG, {rz:4.5 - k * 1.5}); } } }
      // neck + head
      const neckUp = hd === 'deer' || hd === 'horse' ? 9 : hd === 'cat' || hd === 'dog' || hd === 'bear' ? 3 : hd === 'croc' || hd === 'lizard' ? -2 : 1.5;
      const hr = (hd === 'elephant' ? 8.2 : hd === 'croc' || hd === 'lizard' ? 5.4 : hd === 'cat' || hd === 'bear' ? 6.6 : 6.2) * gir;
      const nh = hd === 'elephant' ? s.heads || 1 : 1;   // Erawan: three heads side by side (middle first)
      for (let hi = 0; hi < nh; hi++){ const G = g => (cx.gid = g + hi * 100), hx = hi ? (hi % 2 ? -1 : 1) * hr * 1.55 : 0;
      const hc = T(rotX([hx, by + neckUp + R * .25 - (hi ? 1.2 : 0), L * .5 + R * .85 + (hd === 'croc' ? 2 : 0) - (hi ? 2.5 : 0)], o.tilt * .4));
      if (neckUp > 4){ G(7); cap(cx, T([0, by + R * .4, L * .5 + R * .5]), hc, R * .45, hr * .55, SK, {}); }
      if (MN && !hi){ G(8); if (s.ruff) ell(cx, add(hc, [0, -.5, -4.2]), hr * 1.22, hr * 1.2, MN, {tex:nn => (Math.sin(Math.atan2(nn[0], nn[1]) * 9) > .4 ? {dt:1} : undefined)});
        else for (let i = 0; i < 7; i++){ const z = L * .5 + 2 - i * 2.6; G(30 + i); cap(cx, T([0, by + R * .85, z]), T([0, by + R * .85 + 4 + (i % 2) * 2, z - 2.4]), 1.8, .5, MN, {}); } }
      G(9); ell(cx, hc, hr * (hd === 'croc' || hd === 'lizard' ? 1.15 : 1), hr * (hd === 'croc' || hd === 'lizard' ? .7 : .95), SK, {tex:nn => eyesTex(nn, o, EY, {glow:!!s.eyeGlow, sp:hd === 'croc' || hd === 'lizard' ? .5 : .45, y:hd === 'croc' ? .45 : .18})});
      // muzzle
      G(10);
      if (hd === 'boar') cap(cx, add(hc, [0, -1.5, hr * .6]), add(hc, [0, -2.2, hr + 2.5]), 3.4 * gir, 3 * gir, BE, {});
      if (hd === 'dog') cap(cx, add(hc, [0, -1.5, hr * .5]), add(hc, [0, -2.5, hr + 4]), 2.8 * gir, 2 * gir, SK, {tex:(nn, lo, q, t) => (t > .85 && nn[2] > .4 ? {m:M.slimeE} : undefined)});
      if (hd === 'cat' || hd === 'bear'){ ell(cx, add(hc, [0, -2.4, hr * .8]), 3.2 * gir, 2.4 * gir, BE, {tex:(nn) => (nn[1] > .3 && Math.abs(nn[0]) < .3 && nn[2] > .5 ? {m:M.slimeE} : undefined)}); }
      if (hd === 'bovine' || hd === 'horse' || hd === 'deer') cap(cx, add(hc, [0, -1, hr * .5]), add(hc, [0, -3.2, hr + (hd === 'bovine' ? 2.6 : 4.5)]), 3.4 * gir, 2.8 * gir, BE, {});
      if (hd === 'croc' || hd === 'lizard') cap(cx, add(hc, [0, -.8, hr * .6]), add(hc, [0, -1.4, hr + (hd === 'croc' ? 10 : 5)]), 3.4 * gir, 2.4 * gir, SK, {tex:(nn, lo, q, t) => (nn[1] < -.2 ? {m:BE} : Math.abs(nn[1]) < .12 && nn[2] < .9 ? {m:M.white, t:1} : undefined)});
      if (hd === 'elephant'){ let p0 = add(hc, [0, -2, hr * .8]);
        // (v119) the trunk swings slowly; on the attack it rises and curls up to trumpet, then strikes down
        const up = act === 'attack' ? [0, 1, .3, 0][f] : 0;
        for (let i = 1; i <= 6; i++){ const k = i / 6, p1 = add(hc, [Math.sin(o.ph * (act === 'idle' ? .5 : 1) + k * 2) * k * 1.4, -2 - k * 10 + k * k * 4 + up * k * k * 15, hr * .8 + k * 4 + k * k * 2 + o.lun * .3 - up * k * k * 4]); G(40 + i); cap(cx, p0, p1, 2.4 - k * 1.1, 2.3 - k * 1.1, SK, {}); p0 = p1; }
        // ears fan slowly to cool (faster when it moves or attacks)
        for (const sd of [-1, 1]){ G(50 + sd); const fan = Math.sin(o.ph * (act === 'idle' ? 1 : 2) + sd * .6) * .14; ell(cx, add(hc, [sd * hr * (.95 + fan), .5, -2 - fan * 6]), 1.4, hr * .8, SK, {rz:hr * .7}); } }
      // ears
      G(11);
      for (const sd of [-1, 1]){
        if (hd === 'cat' || hd === 'dog') cap(cx, add(hc, [sd * hr * .5, hr * .6, -.5]), add(hc, [sd * hr * .62, hr * 1.2 + (hd === 'dog' ? 1 : 0), -1]), 1.8 * gir, .5, SK, {});
        if (hd === 'bear') ell(cx, add(hc, [sd * hr * .62, hr * .72, -1]), 1.9 * gir, 1.9 * gir, SK);
        if (hd === 'boar' || hd === 'bovine' || hd === 'deer' || hd === 'horse') cap(cx, add(hc, [sd * hr * .65, hr * .55, -1]), add(hc, [sd * hr * 1.0, hr * .95, -2.2]), 1.8 * gir, .7, SK, {});
      }
      // horns / antlers / tusks
      if (s.horns){ for (const sd of [-1, 1]){ G(60 + sd);
        if (s.horns === 'buffalo'){ const a0 = add(hc, [sd * hr * .5, hr * .6, -1]), a1 = add(hc, [sd * hr * 1.6, hr * 1.0, -3.5]), a2 = add(hc, [sd * hr * 1.3, hr * 1.6, -5]); cap(cx, a0, a1, 1.6 * gir, 1.1 * gir, AC, {}); cap(cx, a1, a2, 1.1 * gir, .4, AC, {}); }
        else if (s.horns === 'antler'){ const a0 = add(hc, [sd * 2, hr * .8, -1]), a1 = add(hc, [sd * 4, hr * 1.9, -3]); cap(cx, a0, a1, .8, .5, AC, {}); cap(cx, lerp3(a0, a1, .5), add(hc, [sd * 6.5, hr * 1.5, -2]), .5, .35, AC, {}); cap(cx, lerp3(a0, a1, .85), add(hc, [sd * 2.6, hr * 2.4, -5]), .45, .3, AC, {}); }
        else if (s.horns === 'spike') cap(cx, add(hc, [sd * 2.2, hr * .7, -.5]), add(hc, [sd * 2.8, hr * 1.6, -3.5]), 1.1, .3, AC, {});
        else if (s.horns === 'unicorn' && sd > 0) cap(cx, add(hc, [0, hr * .8, 1]), add(hc, [0, hr * 1.9, 2.5]), 1.1, .3, AC, {});
      } }
      if (s.tusks === 'curved'){ for (const sd of [-1, 1]){ G(64 + sd); const a0 = add(hc, [sd * 2.6, -3, hr * .6]), a1 = add(hc, [sd * 4.8, -9.5, hr + 3]), a2 = add(hc, [sd * 2.6, -5, hr + 8]); cap(cx, a0, a1, 1.5, 1.2, AC, {}); cap(cx, a1, a2, 1.2, .4, AC, {}); } }   // mammoth: down, out and up
      else if (s.tusks){ for (const sd of [-1, 1]){ G(64 + sd); cap(cx, add(hc, [sd * 2.6, -3, hr * .6]), add(hc, [sd * 3.4, hd === 'elephant' ? -7 : 1.5, hr + (hd === 'elephant' ? 6 : 3)]), hd === 'elephant' ? 1.3 : 1, .45, AC, {}); } }
      if (s.crown){ G(70); frustum(cx, add(hc, [0, 0, -1]), hc[1] + hr * .9 + 2, hc[1] + hr * .9, 3.2, 3.6, M.gold, {}); }
      }
      cx.pre = null;
    };
  }

  /* ---------------- bird / bat ---------------- */
  function bird(key, s){
    const B = mat(key, 'body', s.body), W = mat(key, 'wing', s.wing) ?? B, K = mat(key, 'beak', s.beak || '#e8b43a'), BE = mat(key, 'belly', s.belly) ?? B,
      CR = mat(key, 'crest', s.crest), EY = s.eyeGlow ? emis(key, 'eye', s.eyeGlow) : M.slimeE, TL = mat(key, 'tail', s.tailCol) ?? W,
      HD = mat(key, 'head', s.headCol) ?? B, BA = mat(key, 'bars', s.bars), MA = mat(key, 'mantle', s.mantle), NL = mat(key, 'nose', s.noseLeaf),
      WGL = s.wingGlow ? emis(key, 'wglow', s.wingGlow) : null, HN = mat(key, 'horn', s.horns), CQ = mat(key, 'casque', s.casque);
    const sz = s.size ?? 1, fly = s.fly ?? true, bat = !!s.bat;
    return (cx, act, f, n) => {
      // (v120) a raptor's strike: wings swept high, then a full downstroke as it drops on the prey, feet thrown forward
      const o = motion(act, f, n), lift = fly ? 14 + Math.sin(o.ph * 2) * 1.5 + (act === 'attack' ? [0, 3, -3, 0][f] : 0) : 7,
        fl = act === 'die' ? 0 : act === 'attack' ? [-.2, 1.5, -1.4, .2][f] * (fly ? 1 : .7) : fly ? Math.sin(o.ph * (act === 'walk' ? 4 : 2) + 1) : o.flap * .6;
      fallPre(cx, o, lift);
      const T = p => [p[0] * sz, (p[1] + (act === 'die' ? -lift * o.fall * .5 : 0)) * sz + lift + o.bob, p[2] * sz + o.lun];
      if (!fly){ for (const sd of [-1, 1]){ cx.gid = 1 + sd; const hip = T([sd * 2.2, 0, 0]); cap(cx, hip, [hip[0], .4, hip[2] + o.sw * sd * 3], .8, .6, K, {}); } }
      if (fly && act === 'attack' && f >= 1 && f <= 2){ for (const sd of [-1, 1]){ cx.gid = 1 + sd; const hip = T([sd * 2, -1.5, 0]), reach = f === 2 ? 1 : .5;   // talons out
        const toe = T([sd * 2.4, -5 - reach * 2, 3 + reach * 4]); cap(cx, hip, toe, .8, .55, K, {}); for (const t of [-1, 0, 1]) cap(cx, toe, add(toe, [t * .9, -.8, 1.4]), .35, .15, K, {}); } }
      cx.gid = 3; ell(cx, T([0, 0, 0]), 6.4, 6, B, {tex:nn => (BA && nn[1] < .25 && nn[2] > -.1 && Math.sin(nn[1] * 24) > .45 ? {m:BA} : nn[1] < -.3 || (nn[2] > .5 && nn[1] < .2) ? {m:BE} : undefined)});
      // wings: three feathers / membrane panels hinged at the shoulder
      for (const sd of [-1, 1]){ cx.gid = 4 + sd; const a = fl * .9;
        for (let i = 0; i < 4; i++){ const k = i / 3, r = 5 + k * 9, up = Math.sin(a) * r, out = Math.cos(a) * r;
          ell(cx, T([sd * (4 + out * .9), 2 + up, -1 - k * 2]), bat ? 5.6 - k : 4.4 - k * 1.2, bat ? 1.3 : 1.8, W, {rz:bat ? 5.4 - k : 4 - k * 1.5, tex:nn => (WGL && Math.abs(Math.sin(nn[0] * 7 + nn[2] * 4)) < .1 ? {m:WGL} : bat && nn[1] < -.4 ? {m:B, t:2} : !bat && nn[1] < -.2 ? {m:TL, t:1} : undefined)}); } }
      // tail
      cx.gid = 7;
      if (s.tail === 'fan'){ for (let i = -2; i <= 2; i++) cap(cx, T([0, 0, -5]), T([i * 3, 5 + Math.abs(i) * -1, -13]), 1.6, 2.6, TL, {tex:(nn, lo, q, t) => (t > .8 ? {m:CR || M.gold, t:1} : undefined)}); }
      else if (s.tail === 'long'){ cap(cx, T([0, 0, -5]), T([0, -2, -17]), 2.2, 1, TL, {}); cap(cx, T([1, 0, -5]), T([3, -3, -15]), 1.6, .8, TL, {}); }
      else if (!bat) cap(cx, T([0, 0, -5]), T([0, -1, -10]), 2.6, 1.2, TL, {});
      // head
      const hc = T([0, 5.5, 4.5]);
      if (MA){ cx.gid = 12; ell(cx, add(hc, [0, -3 * sz, -2.4 * sz]), 5.4 * sz, 4 * sz, MA, {tex:nn => (Math.sin(Math.atan2(nn[0], nn[1]) * 9) > .45 ? {dt:1} : undefined)}); }   // hackles / ruff / fur mantle
      cx.gid = 8; ell(cx, hc, 4.4 * sz, 4.2 * sz, HD, {tex:nn => eyesTex(nn, o, EY, {glow:!!s.eyeGlow, sp:.5, y:.15, rx:.16, ry:.2})});
      cx.gid = 9;
      if (bat){ const ek = s.ears ?? 1; for (const sd of [-1, 1]) cap(cx, add(hc, [sd * 2.4 * sz, 3 * sz, -.5]), add(hc, [sd * (2.4 + 1.2 * ek) * sz, (3 + 4.5 * ek) * sz, -1.5]), 1.6 * sz * ek, .4, B, {});
        if (s.snout){ cx.gid = 13; cap(cx, add(hc, [0, -.8 * sz, 3 * sz]), add(hc, [0, -1.5 * sz, 6.4 * sz]), 2 * sz, 1.1 * sz, B, {tex:(nn, lo, q, t) => (t > .9 && nn[2] > .5 ? {m:M.slimeE} : undefined)}); }   // flying-fox muzzle
        if (NL){ cx.gid = 14; ell(cx, add(hc, [0, .4 * sz, 3.8 * sz]), 1.3 * sz, 2 * sz, NL, {}); } }   // nose-leaf
      else { const bl = s.beakLen ?? 1; cap(cx, add(hc, [0, -.5 * sz, 3.4 * sz]), add(hc, [0, (s.hook ? -2.2 : -1) * sz, (3.4 + 4 * bl) * sz]), 1.6 * sz * (s.beakW ?? 1), .45, K, {});
        if (CQ){ cx.gid = 14; cap(cx, add(hc, [0, 1 * sz, 3.2 * sz]), add(hc, [0, .6 * sz, (3.4 + 2.2 * bl) * sz]), 1.4 * sz * (s.beakW ?? 1), .5, CQ, {tex:nn => (Math.sin(nn[2] * 16) > .6 ? {dt:1} : undefined)}); } }   // hornbill casque
      if (HN){ cx.gid = 15; for (const sd of [-1, 1]) cap(cx, add(hc, [sd * 1.8 * sz, 3 * sz, -1 * sz]), add(hc, [sd * 3.4 * sz, 7.4 * sz, -4.6 * sz]), 1.2 * sz, .3, HN, {}); }
      if (CR){ cx.gid = 10; for (let i = 0; i < 3; i++) cap(cx, add(hc, [0, 3.5 * sz, (1 - i * 1.6) * sz]), add(hc, [0, (7 + (i === 1 ? 2 : 0)) * sz, (-1 - i * 2) * sz]), 1.2 * sz, .4, CR, {}); }
      if (s.crown){ cx.gid = 11; frustum(cx, add(hc, [0, 0, 0]), hc[1] + 6 * sz, hc[1] + 3.6 * sz, 2.2 * sz, 2.8 * sz, M.gold, {}); }
      cx.pre = null;
    };
  }

  /* ---------------- serpent / naga / eel / millipede ---------------- */
  function serpent(key, s){
    const SK = mat(key, 'skin', s.skin), BE = mat(key, 'belly', s.belly) ?? SK, ST = mat(key, 'stripe', s.stripe), HO = mat(key, 'hood', s.hood),
      EY = s.eyeGlow ? emis(key, 'eye', s.eyeGlow) : M.slimeE, WG = mat(key, 'wing', s.wing), TT = mat(key, 'tip', s.tailTip), CS = mat(key, 'crest', s.crest);
    const len = s.len ?? 1, th = s.thick ?? 1, heads = s.heads || 1;
    return (cx, act, f, n) => {
      const o = motion(act, f, n), N = Math.round(10 * len), wav = act === 'walk' ? o.ph * 2 : o.ph * .5;
      const rise = (s.rise ?? (s.hood ? 9 : 4)) + (act === 'attack' ? [0, 3, -2, 0][f] : 0) - (act === 'die' ? o.fall * 6 : 0);
      // body segments from tail (k=0) to neck (k=1)
      let prev = null;
      // v21: slender, tapering to a thin tail, lying on the ground in an S; top-lit, with real scale patterns
      const top = (nn, t) => { const y = nn[1] + (h3(Math.floor(t * 50), Math.floor((nn[0] + 2) * 10), 5) - .5) * .16; return y > .55 ? 0 : y > -.15 ? 1 : y > -.6 ? 2 : 3; };
      const pat = (nn, kk) => { if (nn[1] < -.35) return BE; if (TT && kk < .22) return TT; if (!ST) return null;
        if (s.grub || s.legs) return Math.sin(kk * N * Math.PI) > .3 ? ST : null;
        if (s.hood || s.diamond) return Math.abs(((kk * N * 1.2) % 1) - .5) * 2 < .35 - Math.abs(nn[0]) * .3 ? ST : null;   // cobra / viper: chevrons and diamonds along the back
        return Math.sin(kk * N * Math.PI * 1.4) > .45 ? ST : null; };                                                        // kraits, sea snakes: rings
      for (let i = 0; i <= N; i++){ const k = i / N, z = -14 * len + k * 22 * len, x = Math.sin(wav + k * 5) * 4 * (1 - k * .6), y = (s.grub ? 2.6 : 1.5) * th + Math.max(0, k - .7) / .3 * rise * (s.legs ? 0 : 1);
        const p = [x, y + (act === 'idle' ? Math.sin(o.ph + k * 3) * .3 : 0), z + o.lun * k]; cx.gid = 1 + i;
        const r = (s.grub ? 3.6 + Math.sin(k * Math.PI) * 1.6 : (1.45 + Math.sin(Math.min(1, k * 1.15) * Math.PI) * .95) * Math.min(1, .3 + k * 2.4)) * th, pr = prev && prev.r || r;
        if (prev) cap(cx, prev, p, pr, r, SK, {step:.35, tex:(nn, lo, q, t) => { const kk = (i - 1 + t) / N, m = pat(nn, kk); return {m:m || undefined, t:Math.min(3, top(nn, kk) + (s.grub && Math.sin(kk * N * 3) > .5 ? 1 : 0))}; }});
        p.r = r;
        if (s.legs){ for (const sd of [-1, 1]){ cx.gid = 100 + i * 2 + sd; cap(cx, p, [p[0] + sd * 4, .4, p[2] + Math.sin(o.ph * 3 + i) * 1.4], .7, .5, BE, {}); } }
        prev = p; }
      if (WG){ for (const sd of [-1, 1]){ cx.gid = 60 + sd; for (let i = 0; i < 4; i++){ const k = i / 3; ell(cx, [prev[0] + sd * (3 + k * 8), prev[1] + 2 + k * 4 + o.flap * k * 3, prev[2] - 6 - k * 2], 4.6 - k * 1.4, 1.6, WG, {rz:4 - k}); } } }
      // heads (a fan of necks for many-headed nagas)
      for (let h = 0; h < heads; h++){
        // (v120) many heads are many necks: each sways on its own beat instead of moving as one block
        const hs = heads > 1 ? Math.sin(o.ph + h * 1.3) : 0;
        const a = heads === 1 ? 0 : (h / (heads - 1) - .5) * 1.6, neck = [prev[0] + Math.sin(a) * 5 * (heads > 1 ? s.spread ?? 1 : 0) + hs * .9, prev[1] + (heads > 1 ? 3 + Math.cos(a) * 2 : 1) + (heads > 1 ? Math.cos(o.ph + h * 1.3) * .7 : 0), prev[2] + 2 + Math.cos(a) * (heads > 1 ? 1 : 0)];
        if (heads > 1){ cx.gid = 70 + h; cap(cx, prev, neck, 2.4 * th, 2 * th, SK, {}); }
        const hl = heads > 1 ? .55 + .45 * Math.abs(Math.sin(h * 1.7 + 1)) : 1;   // the heads do not all strike equally far
        const hc = add(neck, [0, 1, 2.5 + o.lun * .3 * hl]);
        const flare = act === 'attack' ? [0, .55, .4, .1][f] : 0;              // a cobra spreads its hood wider to threaten and strike
        if (HO){ cx.gid = 80 + h;   // a cobra's hood: a flat fan spread sideways behind the head (not a ball)
          for (let j = 0; j < 6; j++){ const y = -4.6 + j * .95, w = (Math.sin((j + .5) / 6 * Math.PI) * 3.2 * (1 + flare) + .6) * th, c = add(hc, [0, y * th, -1.6 - (5 - j) * .08]);
            for (const sd of [-1, 1]) cap(cx, c, add(c, [sd * w, -.2, -.3]), 1.05 * th, .6 * th, HO, {tex:nn => (nn[2] > .3 && Math.abs(nn[0]) < .5 && j < 4 ? {m:BE, t:1} : {t:nn[1] > .4 ? 1 : 2})}); } }
        if (s.grub){ cx.gid = 90 + h; ell(cx, hc, 3.4 * th, 2.8 * th, SK, {rz:4.6 * th, tex:nn => eyesTex(nn, o, EY, {glow:!!s.eyeGlow, sp:.55, y:.35, rx:.14, ry:.16, front:-.2})}); }
        else { cx.gid = 90 + h;   // a snake's head: wide at the jaws, flat, a narrower snout, small side eyes
          ell(cx, add(hc, [0, -.2, -.6]), 2.3 * th, 1.45 * th, SK, {rz:2.6 * th, tex:nn => eyesTex(nn, o, EY, {glow:!!s.eyeGlow, sp:.62, y:.3, rx:.11, ry:.13, front:-.15}) || (nn[1] < -.3 ? {m:BE} : ST && (s.hood || s.diamond) && nn[1] > .5 && Math.abs(nn[0]) < .25 ? {m:ST} : undefined)});
          cap(cx, add(hc, [0, -.3, .6]), add(hc, [0, -.6, 2.6 * th]), 1.6 * th, .9 * th, SK, {tex:nn => (nn[1] < -.3 ? {m:BE} : Math.abs(nn[1] + .1) < .07 ? {dt:2} : undefined)});
          if (act === 'attack' && f === 2){ cx.gid = 150 + h; cap(cx, add(hc, [0, -.8, 2.4 * th]), add(hc, [0, -1.2, 3.8 * th]), .2, .1, M.mouth, {}); cap(cx, add(hc, [-.2, -.9, 3.8 * th]), add(hc, [-.6, -1.1, 4.4 * th]), .12, .08, M.mouth, {}); cap(cx, add(hc, [.2, -.9, 3.8 * th]), add(hc, [.6, -1.1, 4.4 * th]), .12, .08, M.mouth, {}); } }   // the forked tongue
        if (CS){ cx.gid = 200 + h; for (let i = 0; i < 4; i++) cap(cx, add(hc, [0, 2.2 * th, 1.4 - i * 1.9]), add(hc, [0, (5.6 - i * .7) * th, -1.2 - i * 2.2]), .9 * th, .25, CS, {}); }   // naga crest (ngon)
        if (s.crown){ cx.gid = 95 + h; frustum(cx, add(hc, [0, 0, -.5]), hc[1] + 6 * th, hc[1] + 2.2 * th, 1.2, 2.6 * th, M.gold, {tex:(nn, kk) => (kk > .8 ? {m:M.gem} : undefined)}); }
      }
    };
  }

  /* ---------------- crab / scorpion / spider / beetle ---------------- */
  function bug(key, s){
    const SH = mat(key, 'shell', s.shell), LG = mat(key, 'leg', s.leg) ?? SH, AC = mat(key, 'acc', s.acc) ?? SH, EY = s.eyeGlow ? emis(key, 'eye', s.eyeGlow) : M.slimeE;
    const kind = s.kind || 'crab', sz = s.size ?? 1, DKB = mat(key, 'bugdark', s.tipCol || '#1e1814');
    return (cx, act, f, n) => {
      const o = motion(act, f, n), by = (kind === 'spider' ? 7 : 5) * sz;
      fallPre(cx, o, by);
      const T = p => [p[0] * sz + (kind === 'crab' && act === 'walk' ? Math.sin(o.ph * 2) * .8 : 0), p[1] * sz + o.bob * .5, p[2] * sz + o.lun];   // (v120) a crab's body shuffles side to side
      const nl = kind === 'spider' ? 4 : 3;
      // (v120) gaits from life: a spider walks in an alternating tetrapod (L1-R2-L3-R4 together, then the others);
      // a crab walks sideways, its legs reaching out and pulling in across the body
      const crab = kind === 'crab';
      for (let i = 0; i < nl; i++) for (const sd of [-1, 1]){ cx.gid = 1 + i * 2 + (sd > 0 ? 1 : 0); const z = (i - (nl - 1) / 2) * 4.5;
        const ph = kind === 'spider' ? ((i + (sd > 0 ? 1 : 0)) % 2) * Math.PI : i * 1.5 + (sd > 0 ? Math.PI : 0), sw = Math.sin(o.ph * 2 + ph) * (act === 'walk' ? 1.6 : .3);
        const sx = crab ? sw * .9 : 0, sz2 = crab ? sw * .25 : sw, lift = kind === 'spider' && act === 'walk' ? Math.max(0, Math.cos(o.ph * 2 + ph)) * 1.4 : 0;
        const LL = s.legLen ?? 1, hip = T([sd * 6, by / sz, z]), knee = T([sd * (6 + 6 * LL) + sx, by / sz + (kind === 'spider' ? 6 : 3) * LL + lift, z * (LL > 1 ? 1 + (LL - 1) * .5 : 1) + sz2]), foot = [knee[0] + sd * 3 * sz * LL + sx, .4 + lift * .6, knee[2] + sz2];
        cap(cx, hip, knee, 1.2 * sz, 1 * sz, LG, {}); cap(cx, knee, foot, 1 * sz, .6, LG, {}); }
      if (kind === 'spider'){ cx.gid = 20; ell(cx, T([0, by / sz + 3, -9]), 9, 8, SH, {tex:nn => (Math.sin(nn[0] * 6) * Math.sin(nn[2] * 6) > .5 ? {m:AC, t:1} : undefined)}); }
      const shr = kind === 'shrimp';
      cx.gid = 21; ell(cx, T([0, by / sz, 0]), kind === 'spider' ? 6 : shr ? 6.2 : 9.5, kind === 'spider' ? 5 : shr ? 5 : 5.6, SH, {rz:kind === 'crab' ? 7 : shr ? 10 : 8, tex:nn => (shr && nn[2] < .4 && Math.sin(nn[2] * 11) > .75 ? {dt:1} : kind === 'beetle' && Math.abs(nn[0]) < .05 && nn[1] > 0 ? {m:SH, t:3} : nn[1] < -.4 ? {m:LG} : eyesTex(nn, o, EY, {glow:!!s.eyeGlow, sp:kind === 'spider' ? .25 : .3, y:.45, rx:.1, ry:.12, front:.3}))});
      if (kind === 'spider'){ cx.gid = 22; ell(cx, T([0, by / sz + 1.6, -8]), 7.2 * sz, 6 * sz, SH, {rz:7 * sz, tex:nn => (AC !== SH && nn[1] > .2 && Math.abs(Math.abs(nn[0]) - .25) < .09 && nn[2] < .6 ? {m:AC} : AC !== SH && nn[1] > .5 && Math.abs(nn[0]) < .12 && Math.sin(nn[2] * 12) > 0 ? {m:AC} : undefined)});   // the abdomen behind the head-body
        for (const sd of [-1, 1]){ cx.gid = 24 + sd; cap(cx, T([sd * 1.4, by / sz - .5, 5]), T([sd * 1.6, by / sz - 2.2, 7]), .9 * sz, .3, DKB, {}); } }   // fangs
      if (kind === 'crab' || kind === 'scorpion' || shr){ for (const sd of [-1, 1]){ cx.gid = 30 + sd; const a = act === 'attack' ? [0, .5, -.4, 0][f] : Math.sin(o.ph) * .1;
        const sh = T([sd * 6, by / sz + 1, 6]), el = T([sd * 9, by / sz + 3 + a * 3, shr ? 17 : 11]); cap(cx, sh, el, 1.6, 1.4, LG, {}); cx.gid = 33 + sd;   // v21: a real pincer — the palm and two fingers that open when it strikes
        const big = s.bigClaw && sd > 0 ? 1.5 : 1, palm = add(el, [sd * 1 * sz, 1 * sz, 3.2 * sz * big]), op = act === 'attack' ? [.2, .7, .1, .3][f] : .25 + Math.sin(o.ph) * .08;
        ell(cx, palm, 2.8 * sz * big, 2.1 * sz * big, AC, {rz:3 * sz * big, tex:nn => (nn[1] > .5 ? {dt:-1} : undefined)});
        const tip0 = add(palm, [sd * .4 * big, 1 * big, 2.4 * sz * big]); cap(cx, tip0, add(tip0, [sd * .3, 1.2 * big * op * 3, 4.2 * sz * big]), 1.1 * sz * big, .25, AC, {});
        const tip1 = add(palm, [-sd * .2 * big, -.8 * big, 2.4 * sz * big]); cap(cx, tip1, add(tip1, [0, -.3 * big, 4.6 * sz * big]), 1.2 * sz * big, .25, DKB, {}); } }
      if (kind === 'scorpion' || s.stinger){ let p0 = T([0, by / sz + 2, kind === 'spider' ? -14 : -8]); const lift = act === 'attack' ? [0, -.3, .5, 0][f] : 0;
        for (let i = 1; i <= 6; i++){ const k = i / 6, p1 = T([0, by / sz + 2 + Math.sin(k * 2.6) * 14, -8 - Math.cos(k * 2.6) * 10 + k * k * 10 + lift * k * 8]); cx.gid = 40 + i; cap(cx, p0, p1, 2.2 - k, 2 - k, SH, {}); p0 = p1; }
        cx.gid = 48; ell(cx, p0, 2.2 * sz, 1.9 * sz, AC); cap(cx, p0, add(p0, [0, -2.4 * sz, 3.2 * sz]), .9 * sz, .15, DKB, {}); }   // the bulb and its curved sting
      if (shr){ let p0 = T([0, by / sz + 1, -7]);   // prawn: segmented abdomen ending in a tail fan, long antennae and rostrum
        for (let i = 1; i <= 5; i++){ const k = i / 5, p1 = T([0, by / sz + 1 - k * 3.4 + Math.sin(o.ph + k * 2) * .5, -7 - k * 12]); cx.gid = 40 + i; cap(cx, p0, p1, 4.6 - k * 2.4, 4.2 - k * 2.4, SH, {tex:(nn, lo, q, t) => (t > .85 ? {dt:1} : undefined)}); p0 = p1; }
        cx.gid = 48; for (const a of [-1, 0, 1]) ell(cx, add(p0, [a * 2.4 * sz, -.4 * sz, -2.6 * sz]), 2 * sz, 1 * sz, AC, {rz:3 * sz});
        for (const sd of [-1, 1]){ cx.gid = 51 + sd; cap(cx, T([sd * 1.6, by / sz + 2, 8]), T([sd * (7 + Math.sin(o.ph + sd) * 1.5), by / sz + 9, 25]), .5, .2, LG, {}); }
        cx.gid = 54; cap(cx, T([0, by / sz + 2.5, 7]), T([0, by / sz + 4, 15]), .9, .2, SH, {}); }
      if (s.eyeStalks){ for (const sd of [-1, 1]){ cx.gid = 56 + sd; const t0 = T([sd * 2.4, by / sz + 3, 5.5]), t1 = T([sd * 3, by / sz + 8, 6.5]); cap(cx, t0, t1, .7 * sz, .5 * sz, SH, {}); ell(cx, t1, 1.3 * sz, 1.6 * sz, EY); } }   // crab eyes on stalks
      if (s.crown){ cx.gid = 59; const b = T([0, by / sz + (kind === 'spider' ? 4.6 : 5.4), 2]); frustum(cx, b, b[1] + 3 * sz, b[1], 2.4 * sz, 3 * sz, M.gold, {tex:(nn, kk) => (kk > .8 ? {m:M.gem} : undefined)}); }
      // (v96) more body plans for look-alike bugs: a rhino horn, raised wing cases, a row of back spines
      if (s.horn){ cx.gid = 60; const h0 = T([0, by / sz + 3.5, 6.5]), h1 = T([0, by / sz + 9.5, 10.5]), h2 = T([0, by / sz + 12.5, 8.5]); cap(cx, h0, h1, 1.9 * sz, 1.1 * sz, AC, {}); cap(cx, h1, h2, 1.1 * sz, .25, AC, {}); }
      if (s.elytra){ const EL = mat(key, 'elytra', s.elytra), up = act === 'walk' ? .3 + Math.sin(o.ph * 3) * .1 : .25;
        for (const sd of [-1, 1]){ cx.gid = 62 + sd; ell(cx, T([sd * (5 + up * 4), by / sz + 6 + up * 5, -3]), 3.4 * sz, 2 * sz, EL, {rz:8.5 * sz, tex:nn => (Math.abs(nn[0]) < .12 ? {dt:1} : undefined)});
          cx.gid = 64 + sd; ell(cx, T([sd * (9 + up * 6), by / sz + 8 + up * 6, -6]), 4.2 * sz, .5 * sz, mat(key, 'membrane', '#e8e0d0'), {rz:7 * sz}); } }
      if (s.spines){ for (let i = 0; i < 5; i++){ cx.gid = 66 + i; const b = T([0, by / sz + (kind === 'spider' ? 7.5 : 5), -7 + i * 3]); cap(cx, b, add(b, [0, (4.5 - Math.abs(i - 2)) * sz, -1.2 * sz]), 1.1 * sz, .2, AC, {}); } }
      if (s.shellHouse){ cx.gid = 50; ell(cx, T([0, by / sz + 6, -4]), 8, 8, mat(key, 'house', s.shellHouse), {tex:nn => (Math.sin(Math.atan2(nn[0], nn[2]) * 4 + nn[1] * 6) > .5 ? {dt:1} : undefined)}); }
      cx.pre = null;
    };
  }

  /* ---------------- frog / toad / turtle / clam ---------------- */
  function squat(key, s){
    const SK = mat(key, 'skin', s.skin), BE = mat(key, 'belly', s.belly) ?? SK, SH = mat(key, 'shell', s.shell), EY = s.eyeGlow ? emis(key, 'eye', s.eyeGlow) : M.slimeE, PR = s.pearl ? emis(key, 'pearl', s.pearl) : null,
      SC = mat(key, 'scute', s.scute), SP = mat(key, 'spot', s.spots), HS = mat(key, 'hstripe', s.headStripe);
    const kind = s.kind || 'frog', sz = s.size ?? 1;
    const spot = nn => (SP && Math.sin(nn[0] * 19) * Math.sin(nn[2] * 17 + nn[1] * 5) > .8 ? {m:SP} : undefined);
    const XA = mat(key, 'xacc', s.horns || s.spines || null) || M.tusk, XT = mat(key, 'xtail', s.tail || null);
    return (cx, act, f, n) => {
      /* (v96) more body plans for look-alikes: a long newt tail, head horns, a row of back spines (rear: where the tail
         starts, head: the top of the head, top: the back's height, len: the back's length) */
      const extra = (rear, head, top, len) => {
        if (XT){ let p0 = T(rear); for (let i = 1; i <= 6; i++){ const k = i / 6, p1 = T([Math.sin(o.ph + k * 3) * 2 * k, rear[1] - k * 2.4, rear[2] - k * 14]); cx.gid = 70 + i; cap(cx, p0, p1, (2.6 - k * 2) * sz, (2.4 - k * 2) * sz, XT, {}); p0 = p1; } }
        if (s.horns){ for (const sd of [-1, 1]){ cx.gid = 78 + sd; const b = T([head[0] + sd * 2.4, head[1], head[2]]); cap(cx, b, add(b, [sd * 2.6 * sz, 4.6 * sz, -2.4 * sz]), 1.2 * sz, .2, XA, {}); } }
        if (s.spines){ for (let i = 0; i < 5; i++){ cx.gid = 82 + i; const b = T([0, top - .8, rear[2] + 1 + i * len / 5]); cap(cx, b, add(b, [0, (3.6 - Math.abs(i - 2) * .8) * sz, -1.4 * sz]), 1.1 * sz, .2, XA, {}); } }
      };
      const o = motion(act, f, n), hop = kind === 'frog' || kind === 'toad' ? (act === 'walk' ? Math.max(0, Math.sin(o.ph)) * 5 : act === 'attack' ? [0, 0, 4, 0][f] : 0) : 0;
      fallPre(cx, o, 6);
      const T = p => [p[0] * sz, p[1] * sz + hop + o.bob * .3, p[2] * sz + o.lun];
      if (kind === 'clam'){ const open = act === 'attack' ? [.2, .6, .9, .3][f] : act === 'die' ? 0 : .25 + Math.sin(o.ph) * .1;
        cx.gid = 1; ell(cx, T([0, 4, 0]), 11, 4.5, SH, {tex:nn => (Math.sin(Math.atan2(nn[0], nn[2]) * 7) > .6 ? {dt:1} : undefined)});
        cx.pre = p => { if (p[1] < 6 * sz) return p; const q = rotX([p[0], p[1] - 6 * sz, p[2] + 9 * sz], -open); return [q[0], q[1] + 6 * sz, q[2] - 9 * sz]; };
        cx.gid = 2; ell(cx, T([0, 8.5, 0]), 11, 4.2, SH, {tex:nn => (Math.sin(Math.atan2(nn[0], nn[2]) * 7) > .6 ? {dt:1} : undefined)}); cx.pre = null;
        if (PR){ cx.gid = 3; ell(cx, T([0, 7.5, 3]), 3, 3, PR); }
        return; }
      const frog = kind === 'frog' || kind === 'toad', IR = mat(key, 'iris', s.eyeGlow ? null : (s.iris || '#d8a83a'));
      if (frog){   // v21: a real frog — low wide body, a flat head with a wide mouth, eyes on top with gold irises,
                   // folded hind legs with big thighs and webbed feet, thin front legs
        const sh = nn => { const y = nn[1]; return y > .55 ? 0 : y > -.15 ? 1 : y > -.6 ? 2 : 3; };
        const coat = nn => (nn[1] < -.35 ? {m:BE} : s.warts && Math.sin(nn[0] * 17) * Math.sin(nn[2] * 15) > .65 ? {dt:1} : s.stripe && Math.abs(nn[0]) < .1 && nn[1] > .2 ? {m:mat(key, 'stripe', s.stripe)} : spot(nn));
        const leap = act === 'walk' ? Math.max(0, Math.sin(o.ph)) : act === 'attack' ? [0, .2, 1, .2][f] : 0;
        for (const sd of [-1, 1]){ cx.gid = 1 + (sd > 0 ? 1 : 0);
          const hip = T([sd * 3.6, 4, -4]), knee = T([sd * 7.2, 3.2 - leap * 1.5, -.6 - leap * 4]), ft = T([sd * 6, .5 - leap * 2, -6 - leap * 5]);
          cap(cx, hip, knee, 2.8 * sz, 1.9 * sz, SK, {tex:nn => ({...(coat(nn) || {}), t:sh(nn)})}); cap(cx, knee, ft, 1.5 * sz, 1 * sz, SK, {tex:nn => ({...(coat(nn) || {}), t:sh(nn)})});
          for (const a of [-.7, -.2, .3]) cap(cx, ft, add(ft, [sd * Math.cos(a) * 2.2 * sz, 0, Math.sin(a) * 2.2 * sz + .6]), .55 * sz, .5 * sz, SK, {});
          cx.gid = 3 + (sd > 0 ? 1 : 0); const sh0 = T([sd * 3, 4, 3.4]), fh = T([sd * 4.6, .5, 5.6 + o.sw * sd]); cap(cx, sh0, fh, 1.2 * sz, .8 * sz, SK, {}); for (const a of [-.5, .1, .7]) cap(cx, fh, add(fh, [sd * Math.cos(a) * 1.3 * sz, 0, Math.sin(a) * 1.3 * sz + .5]), .4 * sz, .3 * sz, SK, {}); }
        cx.gid = 10; cap(cx, T([0, 4.6, -4]), T([0, 5.4, 3]), 5.4 * sz, 4.6 * sz, SK, {step:.3, tex:(nn, lo, q, t) => ({...(coat(nn) || {}), t:sh(nn)})});
        cx.gid = 11; ell(cx, T([0, 5.6, 5.6]), 4.6 * sz, 2.8 * sz, SK, {rz:3.4 * sz, tex:nn => (Math.abs(nn[1] + .15) < .08 && nn[2] > -.2 ? {m:M.mouth, t:2} : {...(coat(nn) || {}), t:sh(nn)})});
        for (const sd of [-1, 1]){ cx.gid = 20 + sd; ell(cx, T([sd * 2.9, 8, 6]), 1.7 * sz, 1.6 * sz, SK, {tex:nn => (nn[2] > .05 && nn[1] > -.35 ? (o.eyes === 'closed' ? {m:SK, t:2} : Math.abs(nn[1] - .05) < .16 && Math.abs(nn[0] * sd - .1) < .45 ? {m:M.slimeE, t:3} : {m:s.eyeGlow ? EY : IR, t:nn[1] > .4 ? 0 : 1}) : undefined)}); }
        // (v120) the vocal sac: a toad's throat swells as it calls (now and then at rest, and before it lunges)
        { const croak = act === 'attack' ? [0, 1, .4, 0][f] : act === 'idle' ? Math.pow(Math.max(0, Math.sin(o.ph * 2)), 3) : 0;
          if (croak > .05){ cx.gid = 12; ell(cx, T([0, 4.1, 7.6 + croak * .8]), (1.6 + 2.4 * croak) * sz, (1.2 + 2 * croak) * sz, (typeof BE !== 'undefined' && BE) || SK, {}); } }
        if (s.crown){ cx.gid = 25; frustum(cx, T([0, 0, 2]), 12 * sz + hop, 9.6 * sz + hop, 2.6, 3.2, M.gold, {}); }
        extra([0, 4.6, -4.5], [0, 7.6, 5], 9.6, 4.4);
        cx.pre = null; return; }
      for (const [sd, z] of [[-1, 4], [1, 4], [-1, -4], [1, -4]]){ cx.gid = 1 + sd + (z > 0 ? 4 : 0); const top = T([sd * 6, 4, z]); cap(cx, top, [top[0] + sd * 3, .5, top[2] + z * .3 + o.sw * sd * 2], 2.2 * sz, 1.8 * sz, SK, {}); }
      if (kind === 'turtle'){
        cx.gid = 10; ell(cx, T([0, 6, -1]), 10.5, 6.6, SH, {rz:12, tex:nn => { const a = Math.atan2(nn[0], nn[2]);
          if (s.ridges) return nn[1] < -.55 ? {m:BE} : Math.abs(Math.sin(nn[0] * 7.5)) < .14 ? (SC ? {m:SC} : {dt:1}) : spot(nn);   // leatherback: lengthwise keels
          return Math.sin(a * 5) * Math.sin(nn[1] * 9) > .55 ? (SC ? {m:SC} : {dt:1}) : nn[1] < -.55 ? {m:BE} : spot(nn); }});
        cx.gid = 11; const hc = T([0, 6 + (act === 'attack' ? 1 : 0), 12 + (act === 'attack' ? [0, -2, 3, 0][f] : 0)]);
        cap(cx, T([0, 5, 7]), hc, 2.6 * sz, 3 * sz, SK, {tex:spot}); cx.gid = 12; ell(cx, hc, 3.2 * sz, 2.8 * sz, SK, {tex:nn => eyesTex(nn, o, EY, {sp:.58, y:.22, rx:.1, ry:.12, glow:!!s.eyeGlow}) || (HS && nn[2] < .85 && Math.abs(Math.sin(nn[1] * 9 + nn[2] * 2)) < .3 ? {m:HS} : spot(nn))});
        cx.gid = 13; cap(cx, T([0, 5, -10]), T([0, 3, -14]), 1.6, .5, SK, {});
        extra([0, 5, -10], [hc[0] / sz, (hc[1] - o.bob * .3) / sz + 2, (hc[2] - o.lun) / sz - 1], 12.4, 8);
        if (s.lotus){ cx.gid = 14; for (let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2; ell(cx, T([Math.cos(a) * 2.6, 13.5, -1 + Math.sin(a) * 2.6]), 1.8, 3.2, mat(key, 'lotus', '#f08ab0'), {}); } }
      } else {
        cx.gid = 10; ell(cx, T([0, 6, -1]), 9.6, 6.8, SK, {tex:nn => (nn[1] < -.35 || (nn[2] > .6 && nn[1] < -.05) ? {m:BE} : s.warts && Math.sin(nn[0] * 17) * Math.sin(nn[2] * 15) > .7 ? {dt:1} : s.stripe && Math.abs(nn[0]) < .12 && nn[1] > 0 ? {m:mat(key, 'stripe', s.stripe)} : undefined)});
        for (const sd of [-1, 1]){ cx.gid = 20 + sd; ell(cx, T([sd * 4.4, 12, 4.5]), 3.2 * sz, 3.2 * sz, SK, {tex:nn => (nn[2] > .2 && nn[1] > -.2 ? (o.eyes === 'closed' ? {m:SK, t:2} : {m:EY, t:nn[1] > .35 ? 0 : 1}) : undefined)}); }
        if (s.crown){ cx.gid = 25; frustum(cx, T([0, 0, 1]), 15 * sz + hop, 12.6 * sz + hop, 3, 3.6, M.gold, {}); }
        extra([0, 5, -9], [0, 13.5, 4], 12.6, 9);
      }
      cx.pre = null;
    };
  }

  /* ---------------- floating spirits ---------------- */
  function floater(key, s){
    const C = s.emissive === false ? mat(key, 'body', s.col) : emis(key, 'body', s.col), D = mat(key, 'dark', s.dark || '#2a1a2e'), H = mat(key, 'hair', s.hair || '#1e1824'),
      SK = mat(key, 'skin', s.skin || '#f2d6c0'), G = s.glow ? emis(key, 'glow', s.glow) : C, LP = s.lamp ? emis(key, 'lamp', s.lamp) : null, RG = s.ring ? emis(key, 'ring', s.ring) : null;
    const kind = s.kind || 'wisp', sz = s.size ?? 1, nt = s.tails ?? 3;
    return (cx, act, f, n) => {
      const o = motion(act, f, n), fl = Math.sin(o.ph) * 1.6, dim = act === 'die' ? [.2, .45, .7, .9][f] : 0, base = (kind === 'krasue' ? 24 : 20) + fl - dim * 12;
      const sway = act === 'walk' ? Math.sin(o.ph) * .2 : act === 'attack' ? [0, -.25, .35, 0][f] : Math.sin(o.ph) * .06;
      cx.pre = p => { const v = rotX([p[0], p[1] - base, p[2]], sway); return [v[0], Math.max(.5, v[1] + base), v[2] + o.lun]; };
      const P = p => [p[0] * sz, base + p[1] * sz, p[2] * sz];
      if (kind === 'wisp' || kind === 'mask'){
        cx.gid = 1; ell(cx, P([0, 0, 0]), 8 * (1 - dim * .3), 9 * (1 - dim * .4), C, {tex:nn => eyesTex(nn, o, D, {sp:.32, y:.12, rx:.14, ry:.22, front:.3}) || (nn[1] < -.25 && nn[1] > -.42 && Math.abs(nn[0]) < .16 && nn[2] > .6 ? {m:D} : s.bands && Math.sin(nn[1] * 14 + o.ph * 2) > .6 ? {dt:1} : undefined)});
        // (v27) the ghost's body: one long shroud that narrows into a curling, swaying tail, ragged strands at its hem
        { let p0 = P([0, -3, -.4]), r0 = 7.2 * (1 - dim * .3);
          for (let k = 1; k <= 8; k++){ const t = k / 8, p1 = P([Math.sin(o.ph + t * 3.2) * 2.6 * t, -3 - t * 15, -t * t * 6 + Math.cos(o.ph + t * 2) * 1.2 * t]), r1 = 7.2 * (1 - t * .9) * (1 - dim * .3);
            cx.gid = 5 + k; cap(cx, p0, p1, r0, r1, C, {tex:nn => (Math.sin(Math.atan2(nn[0], nn[2]) * 5 + o.ph * 2 + t * 4) > .6 ? {dt:1} : undefined)}); p0 = p1; r0 = r1; } }
        for (let j = 0; j < Math.max(0, nt - 1); j++){ const a = (nt > 2 ? j / (nt - 2) - .5 : 0) * 2.8; let q0 = P([Math.sin(a) * 5, -6, Math.cos(a) * 3 - 1]);
          for (let k = 1; k <= 3; k++){ const t = k / 3, q1 = P([Math.sin(a) * (5 + t * 2.4) + Math.sin(o.ph + j + t * 3) * 1.4, -6 - t * 8, Math.cos(a) * 3 - 1 - t * 2]); cx.gid = 40 + j * 4 + k; cap(cx, q0, q1, 1.9 * (1 - t * .6), 1.7 * (1 - t * .75), C, {}); q0 = q1; } }
        if (!s.puffs && !s.hood){ const reach = act === 'attack' ? [0, .4, 1, .4][f] : .25 + Math.sin(o.ph) * .1;   // thin arms reaching forward
          for (const sd of [-1, 1]){ const sh = P([sd * 6.2, -2.5, .5]), el = P([sd * 8.2, -6 + reach * 4, 3.5 + reach * 4]), hd = P([sd * 6.4, -8.5 + reach * 7, 7.5 + reach * 6]);
            cx.gid = 60 + (sd > 0 ? 2 : 0); cap(cx, sh, el, 1.9, 1.3, C, {}); cx.gid = 61 + (sd > 0 ? 2 : 0); cap(cx, el, hd, 1.3, .6, C, {}); } }
        if (s.veil){ cx.gid = 70; ell(cx, P([0, 1.6, -1.4]), 8.8, 9.2, H, {tex:nn => (nn[2] > .2 && nn[1] < .5 && Math.abs(nn[0]) < .6 ? false : undefined)});   // long wet hair over the face
          for (let i = 0; i < 7; i++){ const a = (i / 6 - .5) * 3.4; cx.gid = 71 + i; cap(cx, P([Math.sin(a) * 7.6, -1, Math.cos(a) * 4 - 3]), P([Math.sin(a) * 8.4 + Math.sin(o.ph + i) * 1.2, -15 - (i % 3) * 2.5, Math.cos(a) * 4 - 4]), 2, .9, H, {}); } }
        if (s.hood){ cx.gid = 80; ell(cx, P([0, 2.2, -1.2]), 9.6, 10, D, {tex:nn => (nn[2] > .3 && nn[1] < .6 && Math.abs(nn[0]) < .58 ? false : undefined)});   // burial shroud
          cx.gid = 81; cap(cx, P([0, 9, -4]), P([0, 12, -9]), 3.4, .6, D, {}); for (const sd of [-1, 1]){ cx.gid = 82 + sd; cap(cx, P([sd * 7, -2, -1]), P([sd * 8.4 + Math.sin(o.ph) * sd, -17, -2]), 3.4, 1.4, D, {}); } }
        if (s.puffs){ for (let i = 0; i < 6; i++){ const a = (i / 5 - .5) * 3.2; cx.gid = 90 + i; ell(cx, P([Math.sin(a) * 8.4, (i % 2 ? 4 : -3) + Math.sin(o.ph + i) * 1.2, Math.cos(a) * 3 - 4]), 4.6, 4, C, {}); } }   // billowing cloud
        if (s.spikes){ for (let i = 0; i < 7; i++){ const a = (i / 6 - .5) * 3.6, d = [Math.sin(a), Math.cos(a) * .9, -.3]; cx.gid = 100 + i; cap(cx, P(mul(d, 6.5)), P(mul(d, 13 + (i % 2) * 3)), 1.8, .2, G, {}); } }   // ice shards
        if (LP){ cx.gid = 110; ell(cx, P([0, 5.4, -.6]), 8.4, 4.6, D, {tex:nn => (nn[1] < .1 ? false : undefined)}); cx.gid = 111; ell(cx, P([0, 7.6, 6.4]), 2.2, 2.2, LP, {}); }   // miner's helmet and lamp
        if (kind === 'mask'){ cx.gid = 30; for (const sd of [-1, 1]) cap(cx, P([sd * 4, 6, -1]), P([sd * 6, 13, -3]), 1.6, .4, G, {}); cx.gid = 31; frustum(cx, P([0, 0, -1]), base + 15 * sz, base + 7 * sz, 1.4, 6, G, {}); }
      } else if (kind === 'vortex'){   // a whirlwind funnel, wide on top, spinning
        for (let i = 0; i < 9; i++){ const k = i / 8, r = (2 + k * 9) * (1 - dim * .4), a = o.ph * 3 + k * 5; cx.gid = 1 + i;
          ell(cx, P([Math.cos(a) * k * 2, -19 + k * 25, Math.sin(a) * k * 2]), r, 2.4 + k * 1.6, C, {rz:r, tex:nn => (Math.sin(Math.atan2(nn[0], nn[2]) * 3 + a * 2) > .45 ? {dt:1} : undefined)}); }
        cx.gid = 12; for (const sd of [-1, 1]) ell(cx, P([sd * 2.8, 4.2, 9.6]), 1.2, 1.6, G === C ? D : G, {});
      } else if (kind === 'star'){   // a glowing core with five rays and a comet tail
        cx.gid = 1; ell(cx, P([0, 0, 0]), 6.4 * (1 - dim * .3), 6.4 * (1 - dim * .3), C, {tex:nn => eyesTex(nn, o, D, {sp:.35, y:.05, rx:.13, ry:.2, front:.3})});
        for (let i = 0; i < 5; i++){ const a = i / 5 * Math.PI * 2 + o.ph * .5; cx.gid = 2 + i; cap(cx, P([Math.sin(a) * 5, Math.cos(a) * 5, -1]), P([Math.sin(a) * 12.5, Math.cos(a) * 12.5, -1.5]), 2.4, .3, G, {}); }
        for (let j = 0; j < nt; j++){ const i = j - (nt - 1) / 2; cx.gid = 10 + j; cap(cx, P([i * 2, 1.5, -4]), P([i * 4 + Math.sin(o.ph + j) * 1.5, 7 - Math.abs(i) * 2, -19 - (j % 2) * 4]), 2.4, .3, G, {}); }
      } else if (kind === 'pearl'){   // a lustrous pearl
        cx.gid = 1; ell(cx, P([0, 0, 0]), 7.6, 7.6, C, {tex:nn => eyesTex(nn, o, D, {sp:.32, y:.05, rx:.12, ry:.18, front:.3}) || (Math.sin(nn[1] * 5 + nn[0] * 3) > .8 ? {t:0} : undefined)});
        for (let i = 0; i < 3; i++){ const a = o.ph + i * 2.1; cx.gid = 3 + i; ell(cx, P([Math.cos(a) * 11, Math.sin(a * 2) * 2, Math.sin(a) * 6]), 1.4, 1.4, G, {}); }   // orbiting motes
      } else if (kind === 'krasue'){
        // a floating head with long black hair and glowing dangling organs
        cx.gid = 1; ell(cx, P([0, 0, 0]), 8, 8.4, SK, {tex:nn => eyesTex(nn, o, mat(key, 'eyeR', '#ff3a3a'), {sp:.36, y:.12, rx:.12, ry:.14, glow:true}) || (nn[1] < -.42 && nn[1] > -.55 && Math.abs(nn[0]) < .16 && nn[2] > .6 ? {m:mat(key, 'lips', '#8a1020')} : undefined)});
        cx.gid = 2; ell(cx, P([0, 1.4, -1.5]), 8.8, 8.8, H, {tex:nn => (nn[2] > .3 && nn[1] < .45 ? false : undefined)});
        for (let i = 0; i < 6; i++){ cx.gid = 3 + i; const a = i / 6 * Math.PI * 2; cap(cx, P([Math.cos(a) * 6, -2, -4 + Math.sin(a) * 4]), P([Math.cos(a) * 7.5 + Math.sin(o.ph + i) * 1.4, -14 - (i % 3) * 2, -5 + Math.sin(a) * 4]), 2, 1, H, {}); }
        const org = emis(key, 'organ', s.glow || '#ff5a6a');
        for (let i = 0; i < 4; i++){ cx.gid = 12 + i; let p0 = P([(i - 1.5) * 1.6, -7, 1]); for (let k = 1; k <= 4; k++){ const t = k / 4, p1 = P([(i - 1.5) * 1.8 + Math.sin(o.ph * 2 + i + t * 3) * 1.6 * t, -7 - t * 11, 1 + Math.cos(o.ph + i) * t]); cap(cx, p0, p1, 1.4 - t * .5, 1.3 - t * .5, org, {}); p0 = p1; } }
      } else if (kind === 'jar'){
        cx.gid = 1; ell(cx, P([0, -1, 0]), 8, 9.5, C, {rz:8, tex:nn => (Math.abs(nn[1] - .1) < .06 ? {m:D} : Math.sin(Math.atan2(nn[0], nn[2]) * 6) * Math.sin(nn[1] * 6) > .6 ? {m:D, t:1} : eyesTex(nn, o, G, {sp:.3, y:.25, rx:.12, ry:.14, glow:true}))});
        cx.gid = 2; frustum(cx, P([0, 0, 0]), base + 11 * sz, base + 8 * sz, 3.6, 4.6, C, {}); cx.gid = 3; ell(cx, P([0, 11.5 + Math.max(0, Math.sin(o.ph * 2)) * 1.6, 0]), 4.4, 1.6, D, {});
        cx.gid = 4; ell(cx, P([0, 12, 0]), 2.6, 1.6, G, {});
      } else if (kind === 'squid'){
        cx.gid = 1; ell(cx, P([0, 4, 0]), 7, 10, C, {tex:nn => eyesTex(nn, o, D, {sp:.45, y:-.3, rx:.14, ry:.16, front:.3}) || (Math.sin(nn[1] * 10) > .7 ? {dt:1} : undefined)});
        cx.gid = 2; frustum(cx, P([0, 0, 0]), base + 15 * sz, base + 12 * sz, .5, 5, C, {});
        for (let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2; let p0 = P([Math.cos(a) * 4, -4, Math.sin(a) * 4]); cx.gid = 3 + i;
          for (let k = 1; k <= 4; k++){ const t = k / 4, p1 = P([Math.cos(a) * (4 + t * 4) + Math.sin(o.ph * 2 + i) * t * 1.5, -4 - t * 10, Math.sin(a) * (4 + t * 4)]); cap(cx, p0, p1, 1.4 - t * .6, 1.3 - t * .6, C, {}); p0 = p1; } }
      } else { // lantern-like orb with tassels
        cx.gid = 1; ell(cx, P([0, 0, 0]), 9, 9.6, C, {rz:9, tex:nn => eyesTex(nn, o, D, {sp:.3, y:.1, rx:.13, ry:.2, front:.35}) || (Math.abs(Math.sin(Math.atan2(nn[0], nn[2]) * 3.5)) < .1 ? {dt:1} : undefined)});
        cx.gid = 2; frustum(cx, P([0, 0, 0]), base + 10.5 * sz, base + 8.8 * sz, 5, 6.6, D, {}); cx.gid = 3; frustum(cx, P([0, 0, 0]), base - 8.8 * sz, base - 10.5 * sz, 6.6, 5, D, {});
      }
      // (v96) more body plans for look-alike spirits: ghost arms, horns, bat wings, orbiting sparks, a hanging chain
      if (s.arms){ for (const sd of [-1, 1]){ cx.gid = 100 + sd; const a0 = P([sd * 7.5, 1, 1]), a1 = P([sd * 12, -5 + Math.sin(o.ph + sd) * 1.5, 4]), a2 = P([sd * 11, -10 + Math.sin(o.ph * 2 + sd) * 2, 7]);
        cap(cx, a0, a1, 1.6 * sz, 1.2 * sz, C, {}); cap(cx, a1, a2, 1.2 * sz, .9 * sz, C, {}); for (const w of [-1, 0, 1]) cap(cx, a2, add(a2, [w * .9 * sz, -2.2 * sz, 1 * sz]), .5 * sz, .2, D, {}); } }
      if (s.horns){ const HN = mat(key, 'horn', s.horns); for (const sd of [-1, 1]){ cx.gid = 104 + sd; const b = P([sd * 4.2, 8, -1]); cap(cx, b, add(b, [sd * 3.6 * sz, 5.6 * sz, -2.6 * sz]), 1.5 * sz, .25, HN, {}); } }
      if (s.batWings){ const WG = mat(key, 'bwing', s.batWings), up = Math.sin(o.ph * 3) * .5; for (const sd of [-1, 1]){ cx.gid = 108 + sd;
        const r = P([sd * 7, 3, -3]); for (let i = 0; i < 4; i++){ const a = .9 - i * .45 + up; cap(cx, r, add(r, [sd * Math.cos(a) * 11 * sz, Math.sin(a) * 9 * sz, -2 * sz]), .9 * sz, .5 * sz, WG, {}); } } }
      if (s.orbit){ const OB = emis(key, 'orbit', s.orbit); for (let i = 0; i < 3; i++){ const a = o.ph * 1.5 + i * 2.09; cx.gid = 112 + i; ell(cx, P([Math.cos(a) * 13, 2 + Math.sin(a * 2) * 3, Math.sin(a) * 13]), 2 * sz, 2 * sz, OB, {}); } }
      if (s.chain){ let p0 = P([0, -10, 0]); for (let i = 1; i <= 4; i++){ const p1 = P([Math.sin(o.ph + i) * .8 * i, -10 - i * 3.2, 0]); cx.gid = 116; cap(cx, p0, p1, .9 * sz, .9 * sz, D, {}); p0 = p1; } cx.gid = 117; ell(cx, p0, 2.4 * sz, 2.4 * sz, G, {}); }
      if (RG){ cx.gid = 120; ell(cx, P([0, 0, 0]), 12.5, 3, RG, {rz:1, tex:(nn, lo, q) => (q < .6 ? false : undefined)}); }   // halo ring
      cx.pre = null;
    };
  }

  /* ---------------- jelly ---------------- */
  function slime(key, s){
    const B = s.emissive ? emis(key, 'body', s.col) : mat(key, 'body', s.col), E = mat(key, 'eye', s.eye || '#2a1a24'), TP = mat(key, 'top', s.topCol || '#e0603a'), sz = s.size ?? 1;
    return (cx, act, f, n) => {
      const ph = f / n * Math.PI * 2; let sq = 1, hop = 0, lun = 0, melt = 0; const o = {eyes:'open'};
      if (act === 'idle') sq = 1 + Math.sin(ph) * .07;
      if (act === 'walk'){ hop = Math.max(0, Math.sin(ph)) * 4; sq = 1 + Math.cos(ph) * .12; }
      if (act === 'attack'){ sq = [1.15, .8, 1.2, 1][f]; lun = [0, -1, 5, 1][f]; hop = [0, 0, 2, 0][f]; }
      if (act === 'hurt'){ sq = [.78, .9][f]; o.eyes = 'hurt'; }
      if (act === 'die'){ melt = [.15, .45, .7, .9][f]; o.eyes = 'closed'; }
      const jl = s.jelly ? .72 : 1, r = 9 * sz, h = (1 - melt) / sq, yc = r * .82 * h + hop * sz + (s.jelly ? 8 * sz * (1 - melt) + Math.sin(ph) * sz : 0);   // jellyfish: a bell that drifts above its tentacles
      if (s.jelly && melt < .6){ for (let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2; let p0 = [Math.cos(a) * r * .55, yc - r * .3, lun + Math.sin(a) * r * .55];
        for (let k = 1; k <= 3; k++){ const t = k / 3, p1 = [Math.cos(a) * r * (.55 - t * .15) + Math.sin(ph * 2 + i + t * 3) * 1.4 * t, Math.max(.6, yc - r * .3 - t * (yc - r * .3 - .6)), lun + Math.sin(a) * r * (.55 - t * .15)]; cx.gid = 30 + i; cap(cx, p0, p1, .9 * sz, .4 * sz, TP, {}); p0 = p1; } } }
      // (v27) a puddle where it sits, a glossy highlight, a darker rim and a few bubbles inside: it reads as wet jelly
      const shroom = s.top === 'mushroom', bw = shroom ? .72 : 1;
      if (!s.jelly){ cx.gid = 0; frustum(cx, [0, 0, lun], .7, .35, r * (1.08 + melt * .7) * bw, r * (1.15 + melt * .8) * bw, B, {tex:() => ({t:2})}); }
      const gloss = nn => { const d = -nn[0] * .42 + nn[1] * .62 + nn[2] * .66; return d > .9 ? {m:M.white, t:0} : d > .8 ? {t:0} : undefined; };
      const bub = (nn, q) => (!shroom && !s.spikes && q < .5 && h3(Math.floor(nn[0] * 5), Math.floor(nn[1] * 5), 3) > .9 ? {dt:-1} : undefined);
      cx.gid = 1; ell(cx, [0, yc, lun], r * Math.sqrt(sq) * (1 + melt * .5) * bw, r * .86 * h * jl, B, {rz:r * .9 * bw, tex:(nn, lo, q) => eyesTex(nn, o, E, {sp:.33, y:.02, rx:.14, ry:.24, front:.35}) || gloss(nn)
        || (s.spikes && Math.sin(nn[0] * 9) * Math.sin(nn[1] * 9 + nn[2] * 5) > .75 ? {dt:1} : q > .82 ? {dt:1} : bub(nn, q))});
      if (shroom && melt < .6){ cx.gid = 2; for (const sd of [-1, 1]) ell(cx, [sd * 3.2 * sz, 1.4 + hop * sz * .3, lun + 2 + (act === 'walk' ? Math.sin(ph) * sd * 1.6 : 0)], 2 * sz, 1.3 * sz, B, {}); }   // little feet
      if (s.spikes && !s.jelly && s.topCol && !s.emissive && melt < .6){ cx.gid = 29; cap(cx, [0, yc + r * .8 * h, lun - 1], [1, yc + r * .8 * h + 4 * sz, lun - 2], 1 * sz, .6 * sz, mat(key, 'stem', '#6a4a2a'), {}); }   // a fruit's stalk
      const top = yc + r * .78 * h * jl;
      if (s.spikes && melt < .6){ for (let i = 0; i < 9; i++){ const a = i * 2.4, y = .2 + (i % 3) * .3; cx.gid = 10 + i; const d = [Math.cos(a) * Math.sqrt(1 - y * y), y, Math.sin(a) * Math.sqrt(1 - y * y)]; const b = [d[0] * r, yc + d[1] * r * .86 * h, d[2] * r + lun]; cap(cx, b, add(b, mul(d, 4 * sz)), 1.6 * sz, .3, TP, {}); } }
      if (s.top === 'mushroom' && melt < .6){ cx.gid = 20; ell(cx, [0, top + 2.4 * sz, lun - 1], r * 1.22, r * .58, TP, {rz:r * 1.1, tex:nn => (nn[1] < -.3 ? {m:B, t:Math.sin(Math.atan2(nn[0], nn[2]) * 16) > 0 ? 2 : 3} : Math.sin(nn[0] * 10) * Math.sin(nn[2] * 10 + 1) > .55 ? {m:M.white, t:1} : undefined)}); }
      if (s.top === 'lotus' && melt < .6){ for (let i = 0; i < 7; i++){ const a = i / 7 * Math.PI * 2; cx.gid = 20 + i; ell(cx, [Math.cos(a) * 3.4 * sz, top + 2.5 * sz, lun + Math.sin(a) * 3.4 * sz], 2 * sz, 3.8 * sz, TP, {}); } cx.gid = 28; ell(cx, [0, top + 2 * sz, lun], 2 * sz, 1.6 * sz, M.gold); }
      if (s.top === 'leaf' && melt < .6){ cx.gid = 20; cap(cx, [0, top, lun], [0, top + 6 * sz, lun - 2], 1, .6, TP, {}); cx.gid = 21; ell(cx, [2.4 * sz, top + 6 * sz, lun - 2], 3.4 * sz, 1.2 * sz, TP, {rz:2}); }
      if (s.top === 'halo' && melt < .6){ cx.gid = 20; ell(cx, [0, top + 4 * sz, lun], 6.4 * sz, 1.8 * sz, M.gold, {rz:1, tex:(nn, lo, q) => (q < .5 ? false : undefined)}); }   // ring of light
      if (s.top === 'crown' && melt < .6){ cx.gid = 20; frustum(cx, [0, 0, lun - 1], top + 5 * sz, top + 1, 4 * sz, 5 * sz, M.crown, {}); cx.gid = 21; ell(cx, [0, top + 3 * sz, lun + 3 * sz], 1.4 * sz, 1.4 * sz, M.gem); }
    };
  }

  /* ---------------- walking rock / coral ---------------- */
  function rock(key, s){
    const C = mat(key, 'body', s.col), A = mat(key, 'acc', s.acc || s.col), EY = emis(key, 'eye', s.eye || '#ffd36a'), sz = s.size ?? 1,
      CY = mat(key, 'crystal', s.crystals), VN = s.veins ? emis(key, 'vein', s.veins) : null;
    return (cx, act, f, n) => {
      const o = motion(act, f, n);
      fallPre(cx, o, 10);
      const T = p => [p[0] * sz, p[1] * sz + o.bob * .4, p[2] * sz + o.lun];
      for (const sd of [-1, 1]){ cx.gid = 1 + sd; const top = T([sd * 4, 5, 0]); cap(cx, top, [top[0], .5, top[2] + o.sw * sd * 3], 2.6 * sz, 2.4 * sz, C, {}); }
      if (s.coral){ cx.gid = 5; ell(cx, T([0, 9, 0]), 8, 7, C, {tex:nn => eyesTex(nn, o, EY, {glow:true, sp:.35, y:.15}) || (Math.sin(nn[0] * 12) * Math.sin(nn[1] * 12) > .6 ? {dt:1} : undefined)});
        for (let i = 0; i < 7; i++){ const a = i * 2.3, b = T([Math.cos(a) * 5, 13, Math.sin(a) * 4 - 2]), t = T([Math.cos(a) * 8, 22 + (i % 3) * 3, Math.sin(a) * 6 - 3]); cx.gid = 10 + i; cap(cx, b, t, 1.8, .9, A, {}); cx.gid = 20 + i; ell(cx, t, 1.6, 1.6, A); } }
      else { cx.gid = 5; frustum(cx, T([0, 0, 0]), (26 + o.bob) * sz, 4 * sz, 1.2, 9, C, {tex:(nn, k) => (k > .55 && k < .7 ? eyesTex([nn[0], .15, nn[2] + .3], o, EY, {glow:true, sp:.4, y:.15, rx:.2, ry:.9, front:.2}) : VN && Math.abs(Math.sin(Math.atan2(nn[0], nn[2]) * 4 + k * 13)) < .1 ? {m:VN} : s.tree && Math.abs(Math.sin(Math.atan2(nn[0], nn[2]) * 9)) < .2 ? {dt:1} : Math.sin(k * 30 + nn[0] * 3) > .8 ? {dt:1} : undefined)});
        for (const sd of [-1, 1]){ cx.gid = 7 + sd; const sh = T([sd * 7, 13, 0]); cap(cx, sh, T([sd * 10, 6 + (act === 'attack' ? [0, 6, -3, 0][f] : 0), 4]), 2.4, 2.8, A, {}); }
        if (s.tree){ for (let i = 0; i < 4; i++){ const a = i * 1.7 + .4; cx.gid = 30 + i; cap(cx, T([Math.cos(a) * 1.4, 24, Math.sin(a) * 1.4]), T([Math.cos(a) * 8, 32 + (i % 2) * 4, Math.sin(a) * 5]), 1.6, .4, C, {}); } }   // bare burnt branches
        if (CY){ for (let i = 0; i < 6; i++){ const a = i * 2.4, b = T([Math.cos(a) * 5, 9 + (i % 3) * 5, Math.sin(a) * 4 - 1]); cx.gid = 40 + i; cap(cx, b, add(b, [Math.cos(a) * 5 * sz, (6 + (i % 2) * 3) * sz, Math.sin(a) * 3 * sz - 2]), 2 * sz, .3, CY, {}); } } }   // crystal shards
      cx.pre = null;
    };
  }

  /* ---------------- quadruped, natural anatomy (v21) ----------------
     The old quad was two balls on four sticks. This one is built like the real animal: a tapered torso (chest, waist,
     hips) as one chain, a neck at the family's angle, a skull with a proper muzzle and nose, small side-set eyes,
     two-jointed legs (hind legs with a backward hock), paws or hooves, a tail that hangs and sways, and the coat
     painted on: belly shading, fur grain, tiger stripes, clouded-leopard blotches, spots, a bear's chest crescent,
     manes and ruffs. Walk is a diagonal gait. Families set the proportions; len / leg / girth still scale them. */
  const FAM = {
    cat:   {Lb:15, rc:5.8, rh:5.3, leg:8.6, lt:2.1, neck:[3.2, 4.2], hr:4.3, ml:2.4, mr:[2.3, 1.7], ear:'cat', tail:[15, 1.5, .9], dip:.8},
    dog:   {Lb:13, rc:5.6, rh:4.8, leg:9.6, lt:1.8, neck:[4.5, 4.2], hr:3.9, ml:4.6, mr:[2.1, 1.3], ear:'dog', tail:[8, 1.6, .7], dip:.4},
    bear:  {Lb:16.5, rc:5.4, rh:5.1, leg:10.6, lt:3, neck:[3.4, 4.4], hr:5.3, ml:4.2, mr:[2.5, 1.8], ear:'bear', tail:[1.6, 1.4, 1], dip:-.4, hump:1},   // (v158) a real bear stands tall on heavy legs
    deer:  {Lb:13.5, rc:5.9, rh:5.7, leg:12.6, lt:1.45, neck:[8.2, 4.6], hr:3.4, ml:4.8, mr:[1.9, 1.3], ear:'leaf', tail:[3, 1.2, .8], dip:.3},
    goat:  {Lb:12.5, rc:6.2, rh:5.8, leg:10.4, lt:1.75, neck:[6.4, 4.2], hr:3.6, ml:4.2, mr:[2, 1.4], ear:'leaf', tail:[2.4, 1.2, .8], dip:.2},
    horse: {Lb:15.5, rc:6.6, rh:6.4, leg:13.4, lt:1.7, neck:[8.8, 5.4], hr:3.7, ml:6.4, mr:[2.2, 1.7], ear:'horse', tail:[9, 1.7, 1.1], dip:.4},
    bovine:{Lb:16, rc:7.8, rh:7.2, leg:9.6, lt:2.5, neck:[2.6, 5], hr:4.6, ml:4, mr:[3, 2.6], ear:'side', tail:[10, .9, .5], dip:.2, dew:1},
    boar:  {Lb:14, rc:7.2, rh:5.8, leg:6.4, lt:1.9, neck:[1.2, 4.2], hr:4.8, ml:4.8, mr:[3, 2.2], ear:'small', tail:[5, .7, .4], dip:-.3, ridge:1},
    lizard:{Lb:11, rc:3.6, rh:3.4, leg:3.4, lt:1.05, neck:[.6, 2.6], hr:2.6, ml:3, mr:[1.7, 1.05], ear:'none', tail:[16, 2.2, .45], dip:0, sprawl:1, flat:1},
    croc:  {Lb:13, rc:4.9, rh:4.7, leg:3.4, lt:1.5, neck:[.3, 3.2], hr:3.4, ml:7.5, mr:[2.3, 1.45], ear:'none', tail:[15, 3.5, .7], dip:0, sprawl:1, flat:1, scutes:1},
    elephant:{Lb:13.5, rc:6.3, rh:6.1, leg:12.8, lt:2.55, neck:[1.6, 4.4], hr:5.6, ml:0, mr:[2.6, 1.2], ear:'elephant', tail:[7, .7, .45], dip:.5, trunk:1},
    // dinosaurs (data/world4.js): a two-legged hunter with a level tail; a long-necked giant on pillar legs; a frilled
    // horn-face and a plated back on short pillar legs. All carry the tail out behind them instead of letting it hang.
    theropod:{Lb:12, rc:5.4, rh:5.8, leg:12.5, lt:2.2, neck:[3.8, 5], hr:3.5, ml:6.4, mr:[2.6, 2.3], skullZ:1.45, ear:'none', tail:[17, 3.2, .45], dip:0, biped:1, dino:1},
    sauropod:{Lb:16, rc:8, rh:8.6, leg:11.5, lt:3, neck:[17, 10], hr:2.7, ml:2.4, mr:[1.6, 1.2], ear:'none', tail:[24, 3.2, .35], dip:.3, flat:1, pillar:1, dino:1, thinNeck:1},
    ceratops:{Lb:14, rc:7, rh:7.2, leg:7.4, lt:2.5, neck:[1, 4.6], hr:4.9, ml:3.2, mr:[2.4, 1.9], ear:'none', tail:[10, 2.6, .5], dip:0, pillar:1, dino:1},
    stego:{Lb:15, rc:6.8, rh:8, leg:8, lt:2.4, neck:[-.5, 4.4], hr:2.9, ml:2.6, mr:[1.6, 1.2], ear:'none', tail:[13, 2.8, .5], dip:-.6, flat:1, pillar:1, dino:1}
  };
  const famOf = s => ({cat:'cat', dog:'dog', bear:'bear', deer:s.horns === 'spike' ? 'goat' : 'deer', horse:'horse', bovine:'bovine', boar:'boar', lizard:'lizard', croc:'croc', elephant:'elephant', theropod:'theropod', sauropod:'sauropod', ceratops:'ceratops', stego:'stego'})[s.head || 'boar'];
  const h3 = (a, b, c) => { const v = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return v - Math.floor(v); };
  function quad2(key, s){
    const fam = famOf(s), F = FAM[fam];
    const SK = mat(key, 'skin', s.skin), BE = mat(key, 'belly', s.belly) ?? SK, AC = mat(key, 'acc', s.acc) ?? M.tusk, ST = mat(key, 'stripe', s.stripe),
      MN = mat(key, 'mane', s.mane), SO = mat(key, 'socks', s.socks), DK = mat(key, 'dark', s.dark || '#16110e'), NO = mat(key, 'nose', s.nose || '#1a1414'),
      MZ = mat(key, 'muzzle', s.muzzle) ?? (fam === 'bear' ? mat(key, 'muzzle', '#a88a6a') : F.dino ? SK : BE), CV = mat(key, 'chestv', s.chestV || (fam === 'bear' ? '#ece6d6' : null)),
      EY = s.eyeGlow ? emis(key, 'eye', s.eyeGlow) : M.slimeE, HO = s.hoof ? (mat(key, 'hoof', '#2a2420')) : null,
      WG = mat(key, 'wing', s.wing), FT = mat(key, 'fin', s.fishTail),
      PL = mat(key, 'plate', s.plates), SL = mat(key, 'sail', s.sail), FR = mat(key, 'frill', s.frill);   // dinosaur parts (opt-in)
    // no two species alike: each key nudges its own proportions a little (length, legs, head, tail)
    const kh = [...key].reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7), J = i => 1 + (h3(kh % 997, i, 9) - .5) * .16;
    const len = (s.len ?? 1) * J(1), legK = (s.leg ?? 1) * J(2), gir = s.girth ?? 1, tailK = J(4);
    const gb = 1 + (gir - 1) * .55, Lb = F.Lb * len * (1 + (gir - 1) * .25), rc = F.rc * gb, rh = F.rh * gb, LL = F.leg * legK, lt = F.lt * (fam === 'elephant' || fam === 'bear' ? Math.sqrt(gir) : gir), hr = F.hr * Math.sqrt(gir) * J(3);
    const sprawl = !!F.sprawl, ele = fam === 'elephant';
    const cat = fam === 'cat', clouded = cat && s.spots && ST, tiger = cat && ST && !s.spots, spotted = !cat && s.spots;
    /* the coat: one function for every part; t runs along the part, nn is the surface direction */
    const coat = (nn, t, part) => {
      const ang = Math.atan2(nn[0], nn[1]);
      if (part !== 'leg' && part !== 'tail' && nn[1] < -.42 && BE !== SK) return {m:BE};                       // pale underside
      if (fam === 'croc' && part !== 'leg'){                                                                     // (v274) a crocodile's hide: dark crossbands and square scales, not a smooth loaf
        if ((part === 'torso' || part === 'tail') && nn[1] > .05 && Math.sin(t * Math.PI * (part === 'tail' ? 7 : 5) + Math.sin(ang * 2) * .4) > .86) return {m:ST || DK};
        const su = t * (part === 'tail' ? 30 : part === 'head' ? 14 : 24), sv = (ang + Math.PI) * (part === 'tail' ? 3.2 : 4.6);
        if (Math.abs(su - Math.round(su)) < .09 || Math.abs(sv - Math.round(sv)) < .08) return {dt:1};
        if (h3(Math.floor(su), Math.floor(sv), 11) > .86) return {dt:1}; }
      if (CV && part === 'torso' && t > .8 && nn[2] > .25 && nn[1] > -.15 && nn[1] < .6 && Math.abs(Math.abs(nn[0]) - (.6 - nn[1]) * .55) < .12) return {m:CV};   // the bear's chest crescent
      if (tiger && part !== 'head' || tiger && part === 'head' && nn[1] > .2){                                  // tiger stripes: narrow, forked, around the body
        const f = part === 'tail' ? 9 : part === 'leg' ? 5 : part === 'neck' ? 4 : 7.5, w = Math.sin((t + Math.sin(ang * 3 + t * 9) * .035) * Math.PI * f * 2);
        if (w > .78 && Math.abs(nn[1]) < .95 - (part === 'leg' ? .3 : 0) && Math.abs(nn[2]) < .82) return {m:ST};
        if (part === 'tail' && t > .86) return {m:ST}; }
      if (clouded && part !== 'leg'){                                                                           // clouded-leopard: big dark-rimmed blotches
        const u = t * (part === 'tail' ? 7 : 3.2), v = (ang + Math.PI) * (part === 'tail' ? .8 : 1.05), cu = Math.floor(u), cv = Math.floor(v), fu = u - cu - .5, fv = v - cv - .5;
        const r = Math.hypot(fu * (1 + h3(cu, cv, 1) * .5), fv), R = .34 + h3(cu, cv, 2) * .1;
        if (part === 'tail' && Math.abs(fv) > .2) return Math.abs(fu) < .16 ? {m:ST} : undefined;
        if (r < R) return r > R - .12 ? {m:ST} : {m:SK, dt:1};
        if (h3(cu * 3, cv * 5, Math.floor(t * 20)) > .93) return {m:ST}; }
      if ((clouded || spotted || (cat && s.spots)) && part === 'leg' && h3(Math.floor(t * 6), Math.floor((ang + 4) * 2), 3) > .7 && Math.sin(t * 40) > .2) return {m:ST || DK};
      if (spotted && part === 'torso' && Math.sin(nn[0] * 13) * Math.sin(nn[2] * 11 + nn[1] * 7 + t * 9) > .62) return {m:ST || DK};
      if (s.cracks && Math.abs(Math.sin(nn[0] * 7 + Math.sin(nn[1] * 9) * 1.6 + t * 11)) < .06) return {dt:2};
      if (SO && part === 'leg' && t > .55) return {m:SO};
      if (HO && part === 'leg' && t > .92) return {m:HO};
      // fur grain: a few darker flecks, more on a shaggy coat
      { const strand = Math.floor((ang + 4) * 14), along = t * 26 + h3(strand, 3, part.length) * 3; if (Math.abs(Math.sin(along * Math.PI)) < (s.shaggy || fam === 'bear' ? .22 : .1) && h3(strand, Math.floor(along), 5) > .35) return {dt:1}; }   // (v157) fur in strands along the body, not static
      return undefined;
    };
    /* limbs and the torso are chains of spheres; lit sphere by sphere they look ribbed, so their light is taken from
       how far the surface faces up (a smooth, top-lit barrel) — dark pattern colours never take the highlight */
    const DARKS = new Set([ST, DK, NO].filter(v => v != null));
    const shade = (nn, part, t) => { const r = coat(nn, t, part) || {}, y = nn[1] + (h3(Math.floor(t * 40), Math.floor((nn[0] + 2) * 14), 7) - .5) * .18;
      let tt = y > .55 ? 0 : y > -.15 ? 1 : y > -.6 ? 2 : 3; tt = Math.max(0, Math.min(3, tt + (r.dt || 0))); if (DARKS.has(r.m) && tt < 2) tt = 2; return {m:r.m, t:tt}; };
    return (cx, act, f, n) => {
      const o = motion(act, f, n), walk = act === 'walk', ph = o.ph;
      const CR = fam === 'croc', yF = CR ? LL * .8 + rc * .3 : LL + rc * .55, yH = CR ? LL * .78 + rh * .28 : LL * .96 + rh * .5, by = (yF + yH) / 2;   // (v274) a crocodile's belly sits low, near the ground
      fallPre(cx, o, by);
      const T = p => [p[0], p[1] + o.bob * .6, p[2] + o.lun];
      const zc = Lb * .5, zh = -Lb * .5;
      const chest = T([0, yF + (F.hump ? .4 : 0), zc]), hip = T([0, yH, zh]), mid = T([0, (yF + yH) / 2 - F.dip, 0]);
      // legs (far side first so the near ones sit on top)
      const legs = F.biped ? [[-1, -1, 0], [1, -1, Math.PI]] : [[-1, 1, 0], [1, 1, Math.PI], [-1, -1, Math.PI], [1, -1, 0]];
      for (const [sd, fr, off] of legs){
        const sw = walk ? Math.sin(ph + off) * .5 : o.sw * (fr > 0 ? 1 : -1) * .5, lift = walk ? Math.max(0, Math.cos(ph + off)) * 1.1 : 0;
        cx.gid = 20 + (sd > 0 ? 1 : 0) + (fr > 0 ? 2 : 0);
        const w = (fr > 0 ? rc : rh) * .5;
        if (sprawl){   // lizards and crocodiles: the upper limb sticks out sideways, the forearm goes down
          const top = T([sd * w * 1.3, (fr > 0 ? yF : yH) - (fr > 0 ? rc : rh) * .2, fr > 0 ? zc - rc * .3 : zh + rh * .3]), up = (fr > 0 ? yF : yH) * .75;
          const elbow = add(top, [sd * up * .9, up * .1, Math.sin(sw * 1.4) * up * .9]), foot = [elbow[0] + sd * .5, .35 + lift * .5, elbow[2] + .6];
          cap(cx, top, elbow, lt * 1.2, lt * .85, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'leg', t * .5)});
          cap(cx, elbow, foot, lt * .85, lt * .65, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'leg', .5 + t * .5)});
          for (const a of [-.6, -.2, .2, .6]) cap(cx, foot, add(foot, [Math.sin(a) * lt * 1.6, -.1, Math.cos(a) * lt * 1.6]), lt * .3, lt * .18, fam === 'croc' ? DK : SK, {});
        } else if (ele || F.pillar){   // elephants (and the big dinosaurs): straight pillars with a round foot
          const top = T([sd * w, (fr > 0 ? yF - rc * .2 : yH - rh * .2), fr > 0 ? zc - rc * .2 : zh + rh * .2]), h = top[1] - .4, knee = add(top, rotX([0, -h * .5, fr > 0 ? .2 : -.2], sw * .45)), foot = add(knee, rotX([0, -h * .5 + lift * .6, 0], sw * .55));
          cap(cx, top, knee, lt * 1.15, lt, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'leg', t * .5)});
          cap(cx, knee, foot, lt, lt * 1.05, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'leg', .5 + t * .5)});
          ell(cx, add(foot, [0, .3, .2]), lt * 1.15, lt * .45, SK, {tex:nn => (nn[2] > .5 && Math.abs(Math.sin(nn[0] * 9)) < .25 ? {m:AC, t:1} : {dt:1})});   // toenails
        } else if (fr > 0){
          const top = T([sd * w, yF - rc * .25, zc - rc * .15]), l1 = (yF - rc * .25) * .52, l2 = (yF - rc * .25) - l1 - .5;
          const elbow = add(top, rotX([0, -l1, .25], sw * .7)), foot = add(elbow, rotX([0, -l2 + lift, 0], sw * 1.05));
          cap(cx, top, elbow, lt * 1.25, lt * .95, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'leg', t * .5)});
          cap(cx, elbow, foot, lt * .9, lt * .7, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'leg', .5 + t * .5)});
          ell(cx, add(foot, [0, .35, .5]), lt * (cat || fam === 'bear' ? 1.05 : .78), lt * .6, HO || (fam === 'bear' ? DK : SK), {tex:nn => (HO ? undefined : coat(nn, .99, 'leg'))});
        } else {
          const top = T([sd * w, yH - rh * .1, zh + rh * .2]), h = yH - rh * .1, l1 = h * .46, l2 = h * .3, l3 = h - l1 - l2 - .5;
          const knee = add(top, rotX([0, -l1, l1 * .45], sw * .6)), hock = add(knee, rotX([0, -l2, -l2 * .75], sw * .6)), foot = add(hock, rotX([0, -l3 + lift, .2], sw * .9));
          cap(cx, top, knee, lt * 1.6, lt * 1.0, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'leg', t * .4)});   // the thigh
          cap(cx, knee, hock, lt * 1.0, lt * .72, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'leg', .4 + t * .3)});
          cap(cx, hock, foot, lt * .72, lt * .66, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'leg', .7 + t * .3)});
          ell(cx, add(foot, [0, .35, .5]), lt * (cat || fam === 'bear' ? 1 : .76), lt * .6, HO || (fam === 'bear' ? DK : SK), {tex:nn => (HO ? undefined : coat(nn, .99, 'leg'))});
        }
      }
      if (F.biped){ for (const sd of [-1, 1]){ cx.gid = 26 + (sd > 0 ? 1 : 0); const sw = walk ? Math.sin(ph + (sd > 0 ? Math.PI : 0)) * .3 : o.sw * .3;   // a theropod's small fore arms
        const sh = add(chest, [sd * rc * .62, -rc * .35, rc * .25]), el2 = add(sh, rotX([sd * .3, -2.6 * gir, 1.2 * gir], sw)), hd2 = add(el2, rotX([0, -.4, 2.2 * gir], sw));
        cap(cx, sh, el2, .95 * gir, .7 * gir, SK, {}); cap(cx, el2, hd2, .7 * gir, .45 * gir, SK, {}); cap(cx, hd2, add(hd2, [0, -.8, .9]), .4, .15, AC, {}); } }
      // torso: hips → waist → chest, one smooth chain
      // (v157) real torsos are deeper than they are wide: a back row and a belly row of smaller spheres instead of one
      // round barrel (which made bears, buffalo and elephants look like balloons); the back dips a little at the waist
      if (CR){ const ch = (rh + rc) * .47, k = .66, sx = .44, L = (p, r) => add(p, [-r * sx, 0, 0]), R = (p, r) => add(p, [r * sx, 0, 0]);   // (v274) a crocodile is wide and flat, not a deep round loaf: two rows side by side
        for (const [A, B, r0, r1, t0] of [[hip, mid, rh, ch, 0], [mid, chest, ch, rc, .5]]){ cx.gid = t0 ? 2 : 1;
          for (const S of [L, R]) cap(cx, S(A, r0), S(B, r1), r0 * k, r1 * k, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'torso', t0 + t * .5)});
          cap(cx, add(A, [0, r0 * .12, 0]), add(B, [0, r1 * .12, 0]), r0 * k * .92, r1 * k * .92, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'torso', t0 + t * .5)}); } }
      else { const k = .74, dy = .3, ch = (rh + rc) * .47, up = (p, r) => add(p, [0, r * dy, 0]), dn = (p, r) => add(p, [0, -r * dy, 0]);
        cx.gid = 1; cap(cx, up(hip, rh), up(add(mid, [0, -F.dip * .4, 0]), ch), rh * k, ch * k, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'torso', t * .5)});
        cap(cx, dn(hip, rh), dn(mid, ch), rh * k * .96, ch * k * 1.02, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'torso', t * .5)});
        cx.gid = 2; cap(cx, up(add(mid, [0, -F.dip * .4, 0]), ch), up(chest, rc), ch * k, rc * k, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'torso', .5 + t * .5)});
        cap(cx, dn(mid, ch), dn(chest, rc), ch * k * 1.02, rc * k * .98, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'torso', .5 + t * .5)}); }
      if (F.hump){ cx.gid = 3; ell(cx, add(chest, [0, rc * .55, -rc * .5]), rc * .8, rc * .55, SK, {tex:nn => coat(nn, .8, 'torso')}); }
      if (F.dew){ cx.gid = 3; cap(cx, add(chest, [0, -rc * .3, rc * .5]), add(chest, [0, -rc * .95, rc * .35]), rc * .38, rc * .2, SK, {}); }   // the dewlap of cattle
      if (F.scutes){ cx.gid = 4; for (let i = 0; i < 13; i++){ const k = i / 12, p = lerp3(hip, chest, k), top = (k < .5 ? rh : rc) * (CR ? .72 : .9); for (const sd of [-1, 0, 1]) ell(cx, add(p, [sd * 1.25, top + (sd ? 0 : .25), 0]), sd ? .8 : .7, sd ? .62 : .72, CR ? SK : ST || DK, {rz:.9, tex:nn => (nn[1] > .55 ? {t:1} : nn[1] > 0 ? {t:2} : {t:3})}); } }   // (v274) three rows of raised bony plates
      if (F.ridge || s.ruff == null && MN && fam === 'boar'){ cx.gid = 4; for (let i = 0; i < 7; i++){ const k = i / 6, p = lerp3(hip, chest, .2 + k * .8); cap(cx, add(p, [0, (k < .5 ? rh : rc) * .85, 0]), add(p, [0, (k < .5 ? rh : rc) * .85 + 1.6 + k * 1.2, -.8]), .9, .3, MN || DK, {}); } }
      if (PL){ for (let i = 0; i < 7; i++){ const k = i / 6, p = lerp3(hip, chest, -.1 + k * 1.05), h = (2.2 + (1 - Math.abs(k - .45) * 1.8) * 3.6) * gir; cx.gid = 80 + i;   // stegosaur plates, staggered
        ell(cx, add(p, [(i % 2 ? .8 : -.8) * gir, (k < .5 ? rh : rc) * .8 + h * .55, 0]), .9 * gir, h, PL, {rz:h * 1.05, tex:nn => (Math.abs(nn[1]) > .82 ? {dt:1} : undefined)}); } }
      if (SL){ for (let i = 0; i < 9; i++){ const k = i / 8, p = lerp3(hip, chest, k), h = (1.8 + Math.sin(k * Math.PI) * 7.5) * gir; cx.gid = 90 + i;   // a spinosaur's skin sail
        ell(cx, add(p, [0, (k < .5 ? rh : rc) * .75 + h * .5, 0]), .45 * gir, h * .58, SL, {rz:Lb / 8 + .9, tex:nn => (Math.abs(nn[2]) < .1 ? {dt:1} : undefined)}); } }
      if (WG){ for (const sd of [-1, 1]){ cx.gid = 5 + (sd > 0 ? 1 : 0) + 30; const shp = add(chest, [sd * rc * .55, rc * .7, -rc * .3]), a = (walk ? Math.sin(ph * 2) * .7 : Math.sin(ph) * .25) + .55, arm = 7 * gir;   // feathered wings
          const wr = add(shp, [sd * Math.cos(a) * arm, Math.sin(a) * arm, -1.5]); cap(cx, shp, wr, 1.7 * gir, 1 * gir, WG, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'wing', t)});
          for (let i = 0; i < 6; i++){ const k = i / 5, out = (8 - k * 2.6) * gir, tip = add(wr, [sd * Math.cos(a - k * .45) * out * (1 - k * .3), Math.sin(a - k * .45) * out * (1 - k * .3), -(1.5 + k * 5) * gir]); cap(cx, wr, tip, 1.05 * gir, .4, WG, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'wing', t)}); }
          for (let i = 1; i <= 3; i++){ const p = lerp3(shp, wr, i / 3.4); cap(cx, p, add(p, [0, -.5, -5 * gir]), 1.2 * gir, .55, WG, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'wing', t)}); } } }
      // tail
      { cx.gid = 5; const [tl0, t0, t1] = F.tail, tl = tl0 * tailK, segs = 6; let p0 = add(hip, [0, rh * .45, -rh * .8]);
        for (let i = 1; i <= segs; i++){ const k = i / segs, sway = Math.sin(ph + k * 2.2) * (walk ? 1.2 : .7) * k;
          const droop = cat ? (s.tailUp ? 5 : -2 + k * k * 5) : fam === 'dog' ? (s.tailUp ? 4 : -1) : sprawl ? -(yH - 1) / k * Math.min(1, k * 1.6) : F.dino ? -yH * .35 * k : -tl * .7;
          const p1 = add(add(hip, [0, rh * .45, -rh * .8]), [sprawl ? Math.sin(ph * (walk ? 1 : .5) + k * 3) * 2.2 * k : sway, droop * k - (cat ? tl * .45 * Math.sin(k * 1.6) : 0), -tl * k * (cat ? .75 : sprawl || F.dino ? .95 : .45)]);
          cap(cx, p0, p1, (t0 + (t1 - t0) * (k - 1 / segs)) * gir, (t0 + (t1 - t0) * k) * gir, i === segs && (s.tuft || fam === 'bovine') ? (MN || DK) : SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'tail', (i - 1 + t) / segs)});
          if (fam === 'croc'){ const rr = (t0 + (t1 - t0) * k) * gir; for (let j = 0; j < 2; j++){ const q = lerp3(p0, p1, .25 + j * .5); for (const sd of (k < .55 ? [-1, 1] : [0])) ell(cx, add(q, [sd * rr * .45, rr * .95, 0]), .6 * (1.2 - k * .6), (1.1 - k * .5) * gir, ST || DK, {rz:.7}); } }   // (v274) the tail's double crest, a single one toward the tip
          p0 = p1; }
        if (s.tuft || fam === 'bovine' || ele){ ell(cx, p0, (ele ? .9 : 1.4) * gir, (ele ? 1.3 : 1.8) * gir, MN || DK); }
        if (s.club){ ell(cx, p0, 2.8 * gir, 2 * gir, AC, {rz:2.6 * gir, tex:nn => (Math.sin(nn[0] * 11) * Math.sin(nn[2] * 9) > .5 ? {dt:1} : undefined)}); }   // an ankylosaur's tail club
        if (FT){ for (const sd of [-1, 1]) cap(cx, p0, add(p0, [sd * 3.6 * gir, 1.2, -3.2 * gir]), 1.6 * gir, .5, FT, {tex:nn => (Math.sin(nn[0] * 14) > .5 ? {dt:1} : undefined)}); } }   // a fish's tail fin
      // neck and head
      const [nUp, nFw] = F.neck, look = o.tilt * .5 + (act === 'idle' ? Math.sin(ph) * .05 : 0);
      const nb = add(chest, [0, rc * .35, rc * .45]), hc = T(add([0, yF + (F.hump ? .4 : 0), zc], [0, rc * .35 + nUp, rc * .45 + nFw + (act === 'attack' ? [0, -1, 2.2, .6][f] : 0)]));
      cx.gid = 7; cap(cx, nb, add(hc, [0, -hr * .25, -hr * .3]), rc * (F.thinNeck ? .36 : fam === 'deer' || fam === 'horse' || fam === 'goat' ? .5 : .7), hr * .8, SK, {step:.3, tex:(nn, lo, q, t) => shade(nn, 'neck', t)});
      if (MN && !s.ruff && fam !== 'boar'){ cx.gid = 8; for (let i = 0; i < 6; i++){ const k = i / 5, p = lerp3(nb, hc, k); cap(cx, add(p, [0, rc * .45 * (1 - k * .5), -.6]), add(p, [0, rc * .45 * (1 - k * .5) + (fam === 'horse' ? 1.6 : 2.4), -1.6]), fam === 'horse' ? .9 : 1.3, .4, MN, {}); } }
      if (MN && s.ruff){ cx.gid = 8; ell(cx, add(hc, [0, -1, -hr * .9]), hr * 1.3, hr * 1.25, MN, {tex:nn => (Math.sin(Math.atan2(nn[0], nn[1]) * 11) > .45 ? {dt:1} : undefined)}); }
      // skull, muzzle, nose — as a function so the three-headed Airavata can have three
      const drawHead = (hd, hi) => { const G = g => (cx.gid = g + hi * 100);
      if (ele){ G(8); for (const sd of [-1, 1]) ell(cx, add(hd, [sd * hr * .32, hr * .42, -hr * .12]), hr * .58, hr * .5, SK, {tex:nn => coat(nn, .45, 'head')});   // (v158) the two domes of the forehead
        cap(cx, add(hd, [0, -hr * .05, hr * .2]), add(hd, [0, -hr * .45, hr * .7]), hr * .7, hr * .52, SK, {tex:(nn, lo, q, t) => (Math.abs(Math.sin(t * 22)) < .15 ? {dt:1} : coat(nn, .5, 'head'))}); }   // the long, wrinkled face
      G(9); ell(cx, hd, hr * (ele ? .85 : 1), hr * (F.flat ? .62 : ele ? .78 : .9), SK, {rz:hr * (F.skullZ || 1), tex:nn => eyesTex(nn, o, EY, {glow:!!s.eyeGlow, sp:F.flat ? .55 : .62, y:F.flat ? .5 : ele ? .1 : .26, rx:F.flat ? .1 : .085, ry:F.flat ? .14 : .1, front:F.flat ? -.2 : .05}) || coat(nn, .5, 'head')});
      const m0 = add(hd, [0, -hr * (F.flat ? .1 : .2), hr * .55]), m1 = add(hd, [0, -hr * (F.flat ? .2 : .2) - F.ml * (F.flat ? .06 : .3), hr * .55 + F.ml]);
      if (ele){   // the trunk, hanging and swaying, curling up when it attacks
        let p0 = add(hd, [0, -hr * .25, hr * .75]); const curl = act === 'attack' ? [0, .6, 1, .3][f] : 0;
        for (let i = 1; i <= 7; i++){ const k = i / 7, p1 = add(hd, [Math.sin(ph + k * 2) * k * .8, -hr * .25 - k * 13 * (1 - curl * .8) + k * k * (3 + curl * 12), hr * .75 + k * 2.6 + k * k * (1.5 + curl * 3) + o.lun * .2]);
          G(40 + i); cap(cx, p0, p1, (2.3 - k * 1.3) * Math.sqrt(gir), (2.3 - (k + 1 / 7) * 1.3) * Math.sqrt(gir), SK, {tex:(nn, lo, q, t) => (Math.sin((k + t / 7) * 70) > .6 ? {dt:1} : undefined)}); p0 = p1; } }
      else {
        G(10); cap(cx, m0, m1, F.mr[0] * Math.sqrt(gir), F.mr[1] * Math.sqrt(gir), MZ, {tex:(nn, lo, q, t) => (fam === 'croc' && Math.abs(nn[1] + .05) < .1 && t > .1 && Math.sin(t * 46) > -.1 ? {m:M.white, t:1} : fam === 'croc' && Math.abs(nn[1] + .05) < .1 ? {m:DK} : F.flat && Math.abs(nn[1] + .05) < .07 ? {m:DK} : nn[1] < -.55 && t > .5 ? {dt:1} : t > .3 && nn[1] > .3 && MZ !== SK ? {m:SK} : undefined)});
        if (F.flat){ for (const sd of [-1, 1]) ell(cx, add(m1, [sd * F.mr[1] * .35, F.mr[1] * .6, F.mr[1] * .2]), .3, .25, NO); }
        if (fam === 'croc'){ G(13); for (const sd of [-1, 1]) ell(cx, add(hd, [sd * hr * .42, hr * .55, -hr * .05]), hr * .3, hr * .26, SK, {tex:nn => (nn[2] > .15 && nn[1] > -.1 && nn[1] < .7 ? {m:EY, t:0} : coat(nn, .45, 'head'))}); ell(cx, add(m1, [0, F.mr[1] * .5, F.mr[1] * .15]), F.mr[1] * .55, F.mr[1] * .35, SK, {}); }   // (v274) raised eyes on top of the head, a knob at the snout's tip
        else ell(cx, add(m1, [0, F.mr[1] * .35, F.mr[1] * .55]), F.mr[1] * (fam === 'boar' ? .95 : .62), F.mr[1] * (fam === 'boar' ? .8 : .45), NO);
        if (act === 'attack' && f === 2){ G(11); ell(cx, add(m1, [0, -F.mr[1] * .8, 0]), F.mr[1] * .7, F.mr[1] * .35, M.mouth); } }
      // ears
      G(12);
      for (const sd of [-1, 1]){
        const e0 = add(hd, [sd * hr * .55, hr * .62, -hr * .25]);
        if (F.ear === 'cat') cap(cx, e0, add(e0, [sd * .5, hr * .55, -.3]), hr * .32, .25, SK, {tex:nn => (nn[2] > .3 && !tiger ? {m:BE} : tiger && nn[2] < 0 ? {m:DK} : undefined)});
        else if (F.ear === 'dog') cap(cx, e0, add(e0, [sd * .4, hr * .8, -.4]), hr * .3, .2, SK, {});
        else if (F.ear === 'bear') ell(cx, add(e0, [sd * .3, .2, 0]), hr * .33, hr * .33, SK, {tex:nn => (nn[2] > .4 ? {m:DK} : undefined)});
        else if (F.ear === 'leaf') cap(cx, add(e0, [0, -.4, 0]), add(e0, [sd * hr * .85, hr * .25, -.8]), hr * .26, hr * .16, SK, {tex:nn => (nn[2] > .3 ? {m:BE} : undefined)});
        else if (F.ear === 'horse') cap(cx, e0, add(e0, [sd * .3, hr * .7, .2]), hr * .22, .25, SK, {});
        else if (F.ear === 'elephant') ell(cx, add(hd, [sd * hr * .95, -.4, -hr * .95]), hr * .95, hr * 1.15, SK, {rz:.45, tex:nn => (nn[0] * sd < -.2 ? {m:BE, dt:1} : Math.abs(Math.sin(nn[1] * 8)) < .12 ? {dt:1} : undefined)});
        else if (F.ear === 'none'){}
        else if (F.ear === 'side') cap(cx, add(e0, [0, -.8, 0]), add(e0, [sd * hr * .9, -.6, -.4]), hr * .25, hr * .18, SK, {});
        else cap(cx, e0, add(e0, [sd * .5, hr * .5, -.6]), hr * .24, .2, SK, {});
      }
      if (FR){ G(13); ell(cx, add(hd, [0, hr * .45, -hr * .85]), hr * 1.5, hr * 1.3, FR, {rz:1, tex:nn => (Math.hypot(nn[0], nn[1]) > .86 ? {m:AC} : undefined)}); }   // a ceratopsian's neck frill
      // horns, antlers, tusks
      if (s.horns === 'tri'){ for (const sd of [-1, 1]){ G(60 + sd); cap(cx, add(hd, [sd * hr * .35, hr * .6, hr * .1]), add(hd, [sd * hr * .5, hr * 1.2, hr * 1.4 + 3]), 1, .25, AC, {}); }   // two brow horns
        if (!ele){ G(62); cap(cx, add(m1, [0, F.mr[1] * .5, -1]), add(m1, [0, F.mr[1] + 2.2, .3]), .8, .2, AC, {}); } }   // and a nose horn
      else if (s.horns){ for (const sd of [-1, 1]){ G(60 + sd);
        if (s.horns === 'spike'){ const a0 = add(hd, [sd * hr * .3, hr * .75, -hr * .1]), a1 = add(a0, [sd * .3, hr * .9, -hr * .55]), a2 = add(a1, [sd * .1, hr * .25, -hr * .5]); cap(cx, a0, a1, .75, .45, AC, {}); cap(cx, a1, a2, .45, .15, AC, {}); }
        else if (s.horns === 'buffalo'){ const a0 = add(hd, [sd * hr * .45, hr * .55, -.6]), a1 = add(hd, [sd * hr * 1.7, hr * .9, -2.6]), a2 = add(hd, [sd * hr * 1.5, hr * 1.7, -4.4]); cap(cx, a0, a1, 1.3 * gir, .9 * gir, AC, {}); cap(cx, a1, a2, .9 * gir, .3, AC, {}); }
        else if (s.horns === 'antler'){ const a0 = add(hd, [sd * hr * .35, hr * .8, -.4]), a1 = add(a0, [sd * 2.2, hr * 1.5, -1.6]), a2 = add(a1, [sd * 1, 2.4, -1.2]); cap(cx, a0, a1, .55, .4, AC, {}); cap(cx, a1, a2, .4, .2, AC, {}); cap(cx, lerp3(a0, a1, .45), add(lerp3(a0, a1, .45), [sd * .4, 1.6, 1.4]), .35, .15, AC, {}); cap(cx, a1, add(a1, [sd * 1.8, .6, .2]), .3, .15, AC, {}); }
        else if (s.horns === 'unicorn' && sd > 0) cap(cx, add(hd, [0, hr * .8, hr * .3]), add(hd, [0, hr * 2.1, hr * .8]), .8, .2, AC, {});
      } }
      if (s.tusks){ for (const sd of [-1, 1]){ G(64 + sd);
        if (ele){ const a0 = add(hd, [sd * hr * .45, -hr * .45, hr * .55]);
          if (s.tusks === 'curved'){ const a1 = add(a0, [sd * 2.4, -4.6, 3]), a2 = add(a1, [-sd * 1.2, 2.2, 3.6]); cap(cx, a0, a1, 1.2 * gir, 1 * gir, AC, {}); cap(cx, a1, a2, 1 * gir, .35, AC, {}); }
          else { const a1 = add(a0, [sd * .8, -3.2, 3.4]), a2 = add(a1, [0, .8, 2.2]); cap(cx, a0, a1, 1 * gir, .8 * gir, AC, {}); cap(cx, a1, a2, .8 * gir, .3, AC, {}); } }
        else { const a0 = add(m1, [sd * F.mr[1] * .6, -F.mr[1] * .3, -1]); cap(cx, a0, add(a0, [sd * .8, s.tusks === 'curved' ? 2.6 : 1.6, .9]), .45, .2, M.tusk, {}); } } }
      if (s.crown){ G(70); frustum(cx, add(hd, [0, 0, -.5]), hd[1] + hr * .9 + 2, hd[1] + hr * .85, 2.4, 2.8, M.gold, {}); }
      };
      const nh = s.heads || 1;
      for (let hi = nh - 1; hi >= 0; hi--){ const ox = hi ? (hi % 2 ? -1 : 1) * hr * 1.9 : 0; drawHead(hi ? add(hc, [ox, -.6, -1.4]) : hc, hi); }
      cx.pre = null;
    };
  }

  /* ---------------- birds, natural shape (v21) ----------------
     A real bird's build instead of a ball with paddles: a tapered body, a neck, a small head with side eyes and a
     proper beak, broad wings made of an arm and splayed flight feathers (folded along the body when it walks),
     a feathered tail and thin legs with toes. Bats keep the old model. */
  function bird2(key, s){
    const B = mat(key, 'body', s.body), W = mat(key, 'wing', s.wing) ?? B, K = mat(key, 'beak', s.beak || '#e8b43a'), BE = mat(key, 'belly', s.belly) ?? B,
      CR = mat(key, 'crest', s.crest), EY = s.eyeGlow ? emis(key, 'eye', s.eyeGlow) : M.slimeE, TL = mat(key, 'tail', s.tailCol) ?? W,
      HD = mat(key, 'head', s.headCol) ?? B, BA = mat(key, 'bars', s.bars), MA = mat(key, 'mantle', s.mantle), WGL = s.wingGlow ? emis(key, 'wglow', s.wingGlow) : null,
      HN = mat(key, 'horn', s.horns), CQ = mat(key, 'casque', s.casque), LG = mat(key, 'legs', s.legCol || '#5a4a3a');
    const sz = s.size ?? 1, fly = s.fly ?? true, bl = s.beakLen ?? 1, nk = s.neckLen ?? 1, lgk = s.legLen ?? 1;
    const top = (nn, t) => { const y = nn[1] + (h3(Math.floor(t * 30), Math.floor((nn[0] + 2) * 12), 3) - .5) * .16; return y > .5 ? 0 : y > 0 ? 1 : y > -.5 ? 2 : 3; };
    return (cx, act, f, n) => {
      const o = motion(act, f, n), lift = fly ? 13 + Math.sin(o.ph * 2) * 1.2 : 6.5 * sz * lgk, fl = act === 'die' ? -.2 : fly ? Math.sin(o.ph * (act === 'walk' ? 4 : 2) + 1) : o.flap * .25;
      fallPre(cx, o, lift);
      const T = p => [p[0] * sz, (p[1] + (act === 'die' ? -lift * o.fall * .5 : 0)) * sz + lift + o.bob * .5, p[2] * sz + o.lun];
      const pitch = fly ? .12 : act === 'attack' ? [0, -.1, .35, 0][f] : 0;
      const P3 = p => T(rotX(p, pitch));
      // legs
      if (!fly){ for (const sd of [-1, 1]){ cx.gid = 1 + (sd > 0 ? 1 : 0); const hip = P3([sd * 1.3, -2.2, 0]), sw = act === 'walk' ? Math.sin(o.ph + (sd > 0 ? Math.PI : 0)) * .4 : 0;
        const kn = add(hip, rotX([0, -lift * .5 / sz * sz, .4], sw)), ft = [kn[0], .4, kn[2] + Math.sin(sw) * 1.5];
        cap(cx, hip, kn, .9 * sz, .5 * sz, B, {}); cap(cx, kn, ft, .45 * sz, .4 * sz, LG, {});
        for (const a of [-.5, 0, .5]) cap(cx, ft, add(ft, [Math.sin(a) * 1.6 * sz, 0, Math.cos(a) * 1.6 * sz]), .3 * sz, .2 * sz, LG, {}); cap(cx, ft, add(ft, [0, 0, -1.1 * sz]), .3 * sz, .2 * sz, LG, {}); } }
      else { for (const sd of [-1, 1]){ cx.gid = 1 + (sd > 0 ? 1 : 0); cap(cx, P3([sd * 1.2, -2.6, -1]), P3([sd * 1, -3.6, -4]), .5 * sz, .35 * sz, LG, {}); } }
      // body: tail base → chest
      cx.gid = 3; const tb = P3([0, .3, -5.5]), ch = P3([0, .8, 3]);
      cap(cx, tb, ch, 2.6 * sz, 4.4 * sz, B, {step:.3, tex:(nn, lo, q, t) => { let m; if (nn[1] < -.25 && t > .25) m = BE; if (BA && t > .45 && nn[1] < .3 && Math.sin((nn[1] + t) * 22) > .5) m = BA; return {m, t:top(nn, t)}; }});
      // tail
      cx.gid = 7;
      if (s.tail === 'fan'){ for (let i = -3; i <= 3; i++){ const e = add(tb, rotX([i * 1.6 * sz, 6 * sz - Math.abs(i) * .9 * sz, -6.5 * sz], 0)); cap(cx, tb, e, 1.1 * sz, .8 * sz, TL, {tex:(nn, lo, q, t) => (t > .8 && CR ? {m:CR, t:1} : {t:top(nn, t)})}); } }
      else { const L = s.tail === 'long' ? 12 : 6.5; for (const dx of [-1.1, 0, 1.1]) cap(cx, tb, add(tb, [dx * sz, (fly ? -.5 : -1.8) * sz, -L * sz]), 1.4 * sz, .55 * sz, TL, {tex:(nn, lo, q, t) => ({t:top(nn, t)})}); }
      // wings
      for (const sd of [-1, 1]){ cx.gid = 4 + (sd > 0 ? 1 : 0); const sh = P3([sd * 2.8, 2.2, 1.5]);
        if (fly || act === 'attack' || act === 'hurt'){
          const a = (fly ? fl * .85 : act === 'attack' ? [.3, 1, .4, .1][f] : .6) + .1, arm = 6.5 * sz, wr = add(sh, [sd * Math.cos(a) * arm, Math.sin(a) * arm, -.6 * sz]);
          cap(cx, sh, wr, 1.6 * sz, 1 * sz, W, {tex:(nn, lo, q, t) => ({t:Math.min(3, top(nn, t))})});
          for (let i = 0; i < 6; i++){ const k = i / 5, fa = a + (k - .2) * .25 * sd * 0, out = (7.5 - k * 2.4) * sz, back = (1 + k * 4.2) * sz;   // primaries fan out and back from the wrist
            const tip = add(wr, [sd * Math.cos(a - k * .35) * out * (1 - k * .35), Math.sin(a - k * .35) * out * (1 - k * .35), -back]);
            cap(cx, wr, tip, .95 * sz, .38 * sz, W, {tex:(nn, lo, q, t) => (WGL && t > .5 ? {m:WGL} : t > .72 ? {m:TL === W ? W : TL, t:Math.max(2, top(nn, t))} : {t:top(nn, t)})}); }
          for (let i = 1; i <= 3; i++){ const p = lerp3(sh, wr, i / 3.4); cap(cx, p, add(p, [0, -.4 * sz, -4.4 * sz]), 1.1 * sz, .5 * sz, W, {tex:(nn, lo, q, t) => ({t:top(nn, t) + (t > .7 ? 1 : 0) > 3 ? 3 : top(nn, t) + (t > .7 ? 1 : 0)})}); }   // secondaries along the arm
        } else {
          cap(cx, sh, P3([sd * 2.9, 1.2, -6.8]), 2.4 * sz, 1.1 * sz, W, {tex:(nn, lo, q, t) => (WGL && t > .6 ? {m:WGL} : t > .75 ? {m:TL, t:2} : {t:top(nn, t)})});   // folded along the body
        } }
      // neck, head, beak
      const hc = P3([0, 5.2 + (nk - 1) * 6, 6.4 + (nk - 1) * 1.5]);
      if (MA){ cx.gid = 12; ell(cx, add(hc, [0, -2.4 * sz, -1.6 * sz]), 3.6 * sz, 2.8 * sz, MA, {tex:nn => (Math.sin(Math.atan2(nn[0], nn[1]) * 9) > .45 ? {dt:1} : undefined)}); }
      cx.gid = 6; cap(cx, add(ch, [0, 1 * sz, .5 * sz]), add(hc, [0, -1 * sz, -.6 * sz]), 2.8 * sz, 2 * sz, HD === B ? B : HD, {tex:(nn, lo, q, t) => ({m:nn[1] < -.2 && t < .6 ? BE : undefined, t:top(nn, t)})});
      cx.gid = 8; ell(cx, hc, 2.6 * sz, 2.5 * sz, HD, {tex:nn => eyesTex(nn, o, EY, {glow:!!s.eyeGlow, sp:.62, y:.22, rx:.1, ry:.12, front:-.1})});
      cx.gid = 9; const b0 = add(hc, [0, -.3 * sz, 2 * sz]), b1 = add(hc, [0, (s.hook ? -2 : -.9) * sz, (2.2 + 3.4 * bl) * sz]);
      cap(cx, b0, b1, 1.1 * sz * (s.beakW ?? 1), .25 * sz, K, {tex:(nn, lo, q, t) => (Math.abs(nn[1]) < .1 && t > .2 ? {dt:2} : undefined)});
      if (CQ){ cx.gid = 14; cap(cx, add(hc, [0, 1.3 * sz, 1.6 * sz]), add(hc, [0, 1.1 * sz, (2.4 + 1.8 * bl) * sz]), 1.05 * sz * (s.beakW ?? 1), .45 * sz, CQ, {tex:nn => (Math.sin(nn[2] * 16) > .6 ? {dt:1} : undefined)}); }
      if (HN){ cx.gid = 15; for (const sd of [-1, 1]) cap(cx, add(hc, [sd * 1.2 * sz, 2 * sz, -.6 * sz]), add(hc, [sd * 2.4 * sz, 5.4 * sz, -3.4 * sz]), .9 * sz, .25, HN, {}); }
      if (CR){ cx.gid = 10; for (let i = 0; i < 3; i++) cap(cx, add(hc, [0, 2.2 * sz, (.6 - i * 1.1) * sz]), add(hc, [0, (4.6 + (i === 1 ? 1.2 : 0)) * sz, (-1 - i * 1.4) * sz]), .8 * sz, .3, CR, {}); }
      if (s.crown){ cx.gid = 11; frustum(cx, hc, hc[1] + 4.4 * sz, hc[1] + 2.4 * sz, 1.6 * sz, 2.1 * sz, M.gold, {}); }
      cx.pre = null;
    };
  }

  /* ---------------- bats, natural shape (v23) ----------------
     A furry body and head with big ears (and the dog-like snout of a flying fox or a nose-leaf), and wings that are
     real bat wings: an arm to the wrist, three long fingers fanned out, and a thin membrane stretched between them. */
  function bat2(key, s){
    const B = mat(key, 'body', s.body), W = mat(key, 'wing', s.wing) ?? B, MA = mat(key, 'mantle', s.mantle), NL = mat(key, 'nose', s.noseLeaf),
      EY = s.eyeGlow ? emis(key, 'eye', s.eyeGlow) : M.slimeE, BN = mat(key, 'bone', s.bone || s.wing || s.body);
    const sz = s.size ?? 1, ek = s.ears ?? 1;
    return (cx, act, f, n) => {
      const o = motion(act, f, n), lift = 14 + Math.sin(o.ph * 2) * 1.4, fl = act === 'die' ? -.3 : Math.sin(o.ph * (act === 'walk' ? 4 : 2) + 1);
      fallPre(cx, o, lift);
      const T = p => [p[0] * sz, (p[1] + (act === 'die' ? -lift * o.fall * .5 : 0)) * sz + lift + o.bob * .4, p[2] * sz + o.lun];
      const fur = nn => { const y = nn[1]; return {t:y > .5 ? 1 : y > -.2 ? 2 : 3}; };
      // wings first (behind the body when seen from the front)
      for (const sd of [-1, 1]){ cx.gid = 4 + (sd > 0 ? 1 : 0); const a = fl * .95 + .15, sh = T([sd * 2, 1.2, .2]);
        const wr = add(sh, [sd * Math.cos(a) * 5.5 * sz, Math.sin(a) * 5.5 * sz, .8 * sz]);
        const tips = [0, 1, 2].map(i => { const b = a - .35 - i * .5; return add(wr, [sd * Math.cos(b) * (8 - i * .8) * sz, Math.sin(b) * (8 - i * .8) * sz, -(1 + i * 1.6) * sz]); });
        const foot = T([sd * 1.4, -4.4, -1.4]);
        // the membrane: thin strands between the fingers, and from the last finger back to the leg
        const edges = [tips[0], tips[1], tips[2], foot];
        for (let j = 0; j < 3; j++) for (let u = 0; u <= 1; u += .25) cap(cx, j < 2 ? wr : lerp3(wr, sh, u * .6), lerp3(edges[j], edges[j + 1], u), .55 * sz, .35 * sz, W, {tex:nn => ({t:nn[1] > .3 ? 2 : 3})});
        cap(cx, sh, wr, .7 * sz, .55 * sz, BN, {}); for (const tp of tips) cap(cx, wr, tp, .4 * sz, .2 * sz, BN, {});
        cap(cx, wr, add(wr, [sd * .3, .9 * sz, .5 * sz]), .35 * sz, .15, BN, {}); }   // the thumb claw
      // body, legs, head
      cx.gid = 3; cap(cx, T([0, -3.2, -.8]), T([0, 1.4, .3]), 2.2 * sz, 2.9 * sz, B, {tex:nn => fur(nn)});
      if (MA){ cx.gid = 6; ell(cx, T([0, 2, .4]), 3.2 * sz, 2.4 * sz, MA, {tex:nn => (Math.sin(Math.atan2(nn[0], nn[1]) * 9) > .4 ? {dt:1} : undefined)}); }
      for (const sd of [-1, 1]){ cx.gid = 1 + (sd > 0 ? 1 : 0); const hp = T([sd * 1.2, -3.4, -1]); cap(cx, hp, T([sd * 1.4, -4.6, -1.6]), .5 * sz, .35 * sz, B, {}); }
      const hc = T([0, 3.6, 1.4]);
      cx.gid = 8; ell(cx, hc, 2.2 * sz, 2 * sz, B, {tex:nn => eyesTex(nn, o, EY, {glow:!!s.eyeGlow, sp:.48, y:.18, rx:.12, ry:.13, front:-.05}) || fur(nn)});
      cx.gid = 9; for (const sd of [-1, 1]) cap(cx, add(hc, [sd * 1.2 * sz, 1.2 * sz, -.3]), add(hc, [sd * (1.6 + .9 * ek) * sz, (2.4 + 3 * ek) * sz, -.8]), 1.1 * sz * Math.min(1.3, ek), .25, B, {tex:nn => (nn[2] > .3 ? {m:NL || W, t:2} : undefined)});
      if (s.snout){ cx.gid = 13; cap(cx, add(hc, [0, -.4, 1.2 * sz]), add(hc, [0, -.9 * sz, 3.6 * sz]), 1.3 * sz, .7 * sz, B, {tex:(nn, lo, q, t) => (t > .85 && nn[2] > .4 ? {m:M.slimeE} : fur(nn))}); }
      else { cx.gid = 13; ell(cx, add(hc, [0, -.6 * sz, 1.7 * sz]), 1 * sz, .8 * sz, B, {}); }
      if (NL){ cx.gid = 14; ell(cx, add(hc, [0, .2 * sz, 2.2 * sz]), .9 * sz, 1.4 * sz, NL, {}); }
      // (v96) more body plans for look-alike bats: horns, a long whip tail, a second pair of small wings
      if (s.horns){ const HN = mat(key, 'horn', s.horns); for (const sd of [-1, 1]){ cx.gid = 16; cap(cx, add(hc, [sd * .9 * sz, 1.4 * sz, .4 * sz]), add(hc, [sd * 2 * sz, 4.6 * sz, -1.6 * sz]), .8 * sz, .2, HN, {}); } }
      if (s.whip){ const WT = mat(key, 'whip', s.whip); let p0 = T([0, -3.4, -1.4]); for (let i = 1; i <= 6; i++){ const k = i / 6, p1 = T([Math.sin(o.ph * 2 + k * 4) * 1.6 * k, -3.4 - k * 7, -1.4 - k * 3]); cx.gid = 17; cap(cx, p0, p1, (.8 - k * .5) * sz, (.7 - k * .5) * sz, WT, {}); p0 = p1; }
        cx.gid = 18; ell(cx, p0, 1.4 * sz, .6 * sz, WT, {rz:1.4 * sz}); }
      if (s.wings2){ const W2 = mat(key, 'wing2', s.wings2); for (const sd of [-1, 1]){ cx.gid = 19 + (sd > 0 ? 1 : 0); const r = T([sd * 1.6, -1.6, -.4]), a = -fl * .6 - .5;
        for (let i = 0; i < 3; i++){ const b = a - i * .35; cap(cx, r, add(r, [sd * Math.cos(b) * 6 * sz, Math.sin(b) * 6 * sz, -1 * sz]), .6 * sz, .35 * sz, W2, {}); } } }
      if (act === 'attack' && f === 2){ cx.gid = 15; for (const sd of [-1, 1]) cap(cx, add(hc, [sd * .5, -1.2 * sz, 1.8 * sz]), add(hc, [sd * .5, -2 * sz, 1.9 * sz]), .3, .1, M.white, {}); }
      cx.pre = null;
    };
  }

  /* ---------------- humanoid monsters (hero rig, monster costume) ---------------- */
  function humanCfg(key, s){
    const m = (part, col, def) => (col ? `${key}_${part}` : def);
    const reg = (part, col, o) => { if (col) ramp(`${key}_${part}`, col, o); };
    reg('skin', s.skin); reg('top', s.top); reg('pants', s.pants); reg('hair', s.hair); reg('hat', s.hatCol); reg('tail', s.tail); reg('wing', s.wings); reg('horn', s.horns); reg('cape', s.cape); reg('belt', s.belt);
    return {name:key, hair:m('hair', s.hair, 'hairBlack'), iris:s.iris || 'irisBr', skinM:m('skin', s.skin, 'skin'), top:m('top', s.top, 'cloth'), sleeve:s.sleeve === false ? m('skin', s.skin, 'skin') : m('top', s.top, 'cloth'),
      pants:m('pants', s.pants, 'cloth'), boots:s.boots || m('skin', s.skin, 'skin'), belt:m('belt', s.belt, 'leather'), forearm:m('skin', s.skin, 'skin'),
      weapon:s.weapon || 'fist', hat:s.hat, bandMat:s.hatCol ? `${key}_hat` : 'cloth', hatMat:s.hatCol ? `${key}_hat` : undefined, capMat:s.hatCol ? `${key}_hat` : 'leather',
      tail:s.tail ? `${key}_tail` : null, tailW:s.tailW, tailUp:s.tailUp, tailFin:s.tailFin ? `${key}_tail` : null, wings:s.wings ? `${key}_wing` : null, horns:s.horns ? `${key}_horn` : null, hornLen:s.hornLen, hornSpread:s.hornSpread,
      fangs:!!s.fangs, cape:s.cape ? `${key}_cape` : null, skirt:s.skirt ? [11.4, .9, 6.6, 8.6, `${key}_pants`, s.skirtTrim || null] : null, baggy:!!s.baggy, beard:s.beard ? `${key}_hair` : null,
      spikes:s.spikes ?? 8, spikeLen:s.spikeLen ?? 3, jag:.1, bangF:8, strands:9, short:!!s.short, aura:s.aura || 'auraGold', ringMat:null, backHair:!!s.longHair, necklace:!!s.necklace, bun:!!s.bun};
  }

  /* ---------------- stone things, natural build (v27) ----------------
     golem: a hunched body of piled boulders: stubby legs, a heavy chest, a small head sunk between the shoulders and
            long arms that end in fists near the ground. The stone is faceted (each face catches the light on its own),
            cracked, and can carry moss, strata, glowing veins or crystals growing out of the back.
     spire: a stalagmite that walks: a tall dripstone cone with growth rings, two rock arms and stub feet.
     tree:  a burnt stump on its roots, bark grooves, ember cracks, bare branches for arms.
     coral: a coral colony on a stony base that walks on short legs, branches that fork twice with polyp tips. */
  function rock2(key, s){
    const C = mat(key, 'body', s.col), A = mat(key, 'acc', s.acc || s.col), EY = emis(key, 'eye', s.eye || '#ffd36a'), sz = s.size ?? 1,
      CY = s.crystals ? ramp(`${key}_crystal`, s.crystals, {emissive:!!s.glowCrystal}) : null, VN = s.veins ? emis(key, 'vein', s.veins) : null,
      MS = mat(key, 'moss', s.moss), DK = mat(key, 'dark', s.dark || '#1a1612');
    const kh = [...key].reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7), J = i => 1 + (h3(kh % 997, i, 5) - .5) * .2;
    const form = s.tree ? 'tree' : s.coral ? 'coral' : s.form || 'golem', bulk = (s.bulk ?? 1) * J(1), armK = J(2), headK = J(3);
    /* faceted stone: the normal is snapped to a coarse grid and each facet gets its own light; cracks and veins on top */
    const stone = (nn, lo, wy, part) => {
      const fx = Math.floor(nn[0] * 2.6 + 3), fy = Math.floor(nn[1] * 2.6 + 3), fz = Math.floor(nn[2] * 2.6 + 3), hv = h3(fx + part * 7, fy, fz + kh % 13);
      const y = nn[1] + (hv - .5) * .55;
      let t = y > .5 ? 0 : y > -.1 ? 1 : y > -.55 ? 2 : 3;
      if (MS && nn[1] > .45 && h3(Math.floor(nn[0] * 6), Math.floor(nn[2] * 6), part) > .3) return {m:MS, t:Math.max(1, t)};
      if (s.strata && Math.sin(wy * 1.6 + Math.sin(nn[0] * 3) * .6) > .55) return {m:A, t:Math.min(3, t + 1)};
      const cr = Math.abs(Math.sin(nn[0] * 6.5 + Math.sin(nn[1] * 8 + part) * 1.4 + nn[2] * 3));
      if (VN && cr < .07) return {m:VN};
      if (cr < .045) return {m:DK, t:3};
      return {t};
    };
    const eyes = (nn, o) => eyesTex(nn, o, EY, {glow:true, sp:.36, y:.05, rx:.17, ry:.09, front:.35});
    return (cx, act, f, n) => {
      const o = motion(act, f, n), walk = act === 'walk', ph = o.ph, atk = act === 'attack';
      fallPre(cx, o, 10);
      const T = p => [p[0] * sz, p[1] * sz + o.bob * .5, p[2] * sz + o.lun];
      const lump = (gid, c, rx, ry, part, m = C) => { cx.gid = gid; const W = T(c); ell(cx, W, rx * sz, ry * sz, m, {rz:Math.min(rx, ry) * sz, tex:(nn, lo) => stone(nn, lo, W[1] + lo[1], part)}); };
      const limb = (gid, a, b, r0, r1, part, m = C) => { cx.gid = gid; const A0 = T(a), B0 = T(b); cap(cx, A0, B0, r0 * sz, r1 * sz, m, {step:.4, tex:(nn, lo, q, t) => stone(nn, lo, A0[1] + (B0[1] - A0[1]) * t, part + Math.floor(t * 3))}); };
      // feet and legs (the far one first)
      const legs = (hipY, spread, r) => { for (const sd of [-1, 1]){ const sw = walk ? Math.sin(ph + (sd > 0 ? Math.PI : 0)) * 2.2 : o.sw * sd * 1.4, lift = walk ? Math.max(0, Math.cos(ph + (sd > 0 ? Math.PI : 0))) * 1.6 : 0;
        limb(2 + (sd > 0 ? 1 : 0), [sd * spread, hipY, 0], [sd * (spread + .4), 2 + lift, sw + .6], r, r * .9, 10 + sd);
        lump(4 + (sd > 0 ? 1 : 0), [sd * (spread + .5), 1.3 + lift, sw + 1.4], r * 1.15, r * .6, 12 + sd); } };
      if (form === 'golem'){
        const B = bulk, hipY = 7.5 * B;
        legs(hipY, 3.6 * B, 2.6 * B);
        lump(8, [0, hipY + 1, -.4], 5.2 * B, 3.4 * B, 20);   // pelvis
        const chY = hipY + 8 * B;
        lump(10, [0, chY - 2.5 * B, -1], 6.8 * B, 5.6 * B, 21);   // belly / back
        lump(11, [0, chY, 1.2], 8.2 * B, 6.4 * B, 22);   // the chest, leaning forward
        // crystals or a mossy ridge on the back
        if (CY){ for (let i = 0; i < 6; i++){ const a = -1.2 + i * .48, b = [Math.sin(a) * 5.5 * B, chY + 1.5 + (i % 2) * 2, -4.5 * B], tip = add(b, [Math.sin(a) * 3.5, 6 + (i % 3) * 2.5, -3.5]); cx.gid = 40 + i;
          cap(cx, T(b), T(tip), 2 * sz, .35 * sz, CY, {tex:nn => ({t:nn[0] > .2 ? 0 : nn[0] > -.3 ? 1 : 2})}); } }
        // arms: shoulder boulder, upper arm, forearm, a big fist that hangs low
        const raise = atk ? [0, 1, -.4, .2][f] : 0;
        for (const sd of [-1, 1]){ const sh = [sd * 8.6 * B, chY + 2.2 * B, 1.2], swing = walk ? -Math.sin(ph + (sd > 0 ? 0 : Math.PI)) * 2.4 : 0;
          const el = [sd * 10.6 * B, chY - 4 * B * armK + raise * 9, 3 + swing + raise * 3], fist = [sd * 10.4 * B, Math.max(3.2, chY - 10.5 * B * armK + raise * 20), 5 + swing * 1.4 + (atk && f === 2 ? 6 : 0) + raise * 2];
          limb(14 + (sd > 0 ? 3 : 0), sh, el, 2.8 * B, 2.4 * B, 30 + sd); limb(15 + (sd > 0 ? 3 : 0), el, fist, 2.4 * B, 2.6 * B, 32 + sd);
          lump(16 + (sd > 0 ? 3 : 0), fist, 3.4 * B, 3 * B, 34 + sd); lump(13 + (sd > 0 ? 1 : 0) * 10, sh, 4 * B, 3.6 * B, 36 + sd); }
        // the head, sunk between the shoulders
        cx.gid = 25; const hc = T([0, chY + 4.6 * B, 4.6 * B]); ell(cx, hc, 3.4 * B * headK * sz, 2.9 * B * sz, C, {rz:3 * sz, tex:(nn, lo) => eyes(nn, o) || stone(nn, lo, hc[1] + lo[1], 50)});
        cx.gid = 26; ell(cx, add(hc, [0, 1.6 * sz, -.4]), 3.8 * B * sz, 1.4 * sz, A, {rz:1.5 * sz, tex:(nn, lo) => (nn[1] < -.2 ? false : stone(nn, lo, hc[1], 51))});   // brow ridge
        // (v96) more body plans for look-alike golems: horns, shoulder spikes, a second pair of arms
        if (s.horns){ const HN = mat(key, 'horn', s.horns); for (const sd of [-1, 1]){ cx.gid = 27 + (sd > 0 ? 1 : 0) * 50; const b = add(hc, [sd * 2.4 * B * sz, 1.8 * sz, -.6 * sz]); cap(cx, b, add(b, [sd * 4 * sz, 4.4 * sz, -2.4 * sz]), 1.4 * B * sz, .3, HN, {}); } }
        if (s.pauldrons){ const PD = mat(key, 'pauldron', s.pauldrons); for (const sd of [-1, 1]) for (let i = 0; i < 3; i++){ cx.gid = 80 + i + (sd > 0 ? 3 : 0); const b = T([sd * 8.6 * B, chY + 4.6 * B, 1.2 - i * 2.2]); cap(cx, b, add(b, [sd * (2 + i) * sz, (5.4 - i) * sz, -1.4 * sz]), 1.5 * sz, .3, PD, {}); } }
        if (s.fourArms){ for (const sd of [-1, 1]){ const sh = [sd * 7.2 * B, chY - 3 * B, 2.4], swing = walk ? Math.sin(ph + (sd > 0 ? 0 : Math.PI)) * 2 : 0, fist = [sd * 12 * B, chY - 6 * B, 7 + swing];
          limb(86 + (sd > 0 ? 2 : 0), sh, fist, 2 * B, 1.8 * B, 90 + sd); lump(87 + (sd > 0 ? 2 : 0), fist, 2.4 * B, 2.2 * B, 92 + sd); } }
      } else if (form === 'spire'){
        legs(4.5, 3, 2.2);
        cx.gid = 8; const base = T([0, 0, 0]), H = 27 * bulk;
        frustum(cx, base, base[1] + H * sz, base[1] + 3 * sz, .9 * sz, 7.6 * bulk * sz, C, {tex:(nn, k, y) => (k > .38 && k < .52 ? eyes([nn[0], (.45 - k) * 6, nn[2] + .2], o) : undefined)
          || (Math.sin(y * 2.2 + nn[0] * 1.5) > .72 ? {dt:1} : VN && Math.abs(Math.sin(Math.atan2(nn[0], nn[2]) * 3 + k * 9)) < .09 ? {m:VN} : CY && k > .7 && h3(Math.floor(Math.atan2(nn[0], nn[2]) * 3), Math.floor(k * 12), 2) > .7 ? {m:CY} : undefined)});
        for (const sd of [-1, 1]){ const raise = atk ? [0, 1, -.3, 0][f] : 0, sh = [sd * 5.6, 13, 1.2], hand = [sd * 10, 6.5 + raise * 9, 4 + (atk && f === 2 ? 5 : 0) + (walk ? Math.sin(ph) * sd * 1.6 : 0)];
          limb(14 + (sd > 0 ? 2 : 0), sh, hand, 2.2, 1.9, 30 + sd, A); lump(15 + (sd > 0 ? 2 : 0), hand, 2.4, 2.2, 32 + sd, A); }
        if (CY){ for (let i = 0; i < 4; i++){ const a = i * 1.9, b = [Math.cos(a) * 3.4, 15 + i * 2.5, Math.sin(a) * 2.6 - 1]; cx.gid = 40 + i; cap(cx, T(b), T(add(b, [Math.cos(a) * 3.6, 4, Math.sin(a) * 2 - 1])), 1.4 * sz, .25, CY, {}); } }
      } else if (form === 'tree'){
        // roots as legs
        for (const sd of [-1, 1]){ const sw = walk ? Math.sin(ph + (sd > 0 ? Math.PI : 0)) * 2 : 0, lift = walk ? Math.max(0, Math.cos(ph + (sd > 0 ? Math.PI : 0))) * 1.4 : 0;
          for (let r = 0; r < 2; r++){ const fx = sd * (3 + r * 2.4); limb(2 + r * 2 + (sd > 0 ? 1 : 0), [sd * 2.2, 7, r ? -1.5 : .5], [fx, 1 + lift, sw + (r ? -2.5 : 2)], 1.9, .8, 10 + r); } }
        cx.gid = 8; const base = T([0, 0, 0]), H = 25 * bulk;
        frustum(cx, base, base[1] + H * sz, base[1] + 5 * sz, 5.6 * sz, 7 * sz, C, {tex:(nn, k, y) => {
          const a = Math.atan2(nn[0], nn[2]);
          if (k > .2 && k < .42 && nn[2] > .2){ const ex = Math.abs(Math.abs(nn[0]) - .38), ey = Math.abs(k - .31); if (ex < .13 && ey < .045) return {m:EY}; if (Math.abs(nn[0]) < .3 && Math.abs(k - .52) < .05 && nn[2] > .5) return {m:DK, t:3}; }
          const g = Math.abs(Math.sin(a * 7 + Math.sin(y * .9) * .5));
          if (VN && g < .12 && h3(Math.floor(a * 7), Math.floor(y * .5), 4) > .45) return {m:VN};
          return g < .22 ? {dt:1} : g > .9 ? {dt:-1} : undefined; }});
        cx.gid = 9; ell(cx, T([0, H, 0]), 5.6 * sz, 1.6 * sz, DK, {rz:1, tex:nn => (VN && Math.hypot(nn[0], nn[2]) < .45 ? {m:VN} : {t:Math.hypot(nn[0], nn[2]) > .8 ? 2 : 3})});   // the burnt top
        for (let i = 0; i < 4; i++){ const sd = i % 2 ? 1 : -1, up = i < 2, raise = atk ? [0, 1, -.4, 0][f] : 0;
          const a0 = [sd * 4.4, up ? 19 : 14, .6], a1 = [sd * (up ? 8 : 9), (up ? 25 : 13) + (up ? 0 : raise * 8), up ? -1 : 3 + (atk && f === 2 ? 5 : 0)], a2 = add(a1, [sd * 2.4, up ? 5 : -3, up ? -1 : 2]);
          limb(20 + i * 2, a0, a1, 1.4, .9, 40 + i); limb(21 + i * 2, a1, a2, .9, .3, 44 + i); }
      } else {   // coral on a stony base
        legs(4, 3.4, 1.9);
        lump(8, [0, 6.5, 0], 6.8 * bulk, 4.4 * bulk, 20, A);
        cx.gid = 9; const cb = T([0, 10, 0]); ell(cx, cb, 7 * sz, 4.6 * sz, C, {rz:5 * sz, tex:nn => eyes(nn, o) || (Math.sin(nn[0] * 14) * Math.sin(nn[2] * 14 + nn[1] * 6) > .55 ? {dt:1} : {t:nn[1] > .4 ? 0 : nn[1] > -.2 ? 1 : 2})});
        let g = 30;
        for (let i = 0; i < 6; i++){ const a = -1.4 + i * .56 + (h3(kh % 97, i, 1) - .5) * .3, b = [Math.sin(a) * 4.6, 12.5, Math.cos(a) * 1.6 - 2], m = [Math.sin(a) * 7, 19 + (i % 2) * 3, Math.cos(a) * 2 - 3];
          cx.gid = g++; cap(cx, T(b), T(m), 1.7 * sz, 1.2 * sz, C, {tex:nn => ({t:nn[0] * Math.sin(a) > .2 ? 0 : 1})});
          for (const fk of [-.45, .45]){ const e = add(m, [Math.sin(a + fk) * 3.4, 4.2 + (fk > 0 ? 1.2 : 0), Math.cos(a + fk) * 1.4 - .6]); cx.gid = g++; cap(cx, T(m), T(e), 1.1 * sz, .8 * sz, C, {tex:nn => ({t:nn[1] > .3 ? 0 : 1})}); cx.gid = g++; ell(cx, T(e), 1.3 * sz, 1.2 * sz, A, {}); } }
      }
      cx.pre = null;
    };
  }

  /* ---------------- humanoid monsters, natural build (v27) ----------------
     They used to wear the chibi hero body. Now each has a real build of its own:
       man    normal proportions (soldiers, devas, priests, ghosts of people)
       brute  yaksha, ogres, giants, asura: a huge chest and shoulders, a small head, thick arms, tusks
       gaunt  preta, phi pop, ghouls, skeletons: tall and thin, hunched, a long neck, bony limbs and claws
       ape    monkeys and the yeti: short bent legs, a forward lean, long arms, a muzzle and ears
       mer    mermaids and Matchanu: a fish tail instead of legs
     Hats (ลอมพอก tall crown, งอบ straw hat, headband, helmet, headwrap), weapons, wings, tails, horns, capes and
     skirts come from the same spec as before, so world.js did not need to change. */
  const HB = {
    man:  {leg:10, hip:2.3, waist:2.9, chest:4.1, tor:7.6, sh:4.9, arm:[4.6, 4.4], ar:1.2, head:3.2, neck:1.3, lean:.04, lr:1.45},
    brute:{leg:9.2, hip:3.3, waist:4.7, chest:6.8, tor:8.4, sh:7.8, arm:[5.4, 5.2], ar:2.2, head:3, neck:.5, lean:.22, lr:2.4},
    gaunt:{leg:11.5, hip:1.7, waist:1.9, chest:3.1, tor:8.2, sh:4.2, arm:[5.8, 5.6], ar:.85, head:3.1, neck:2.2, lean:.38, lr:1},
    ape:  {leg:6.6, hip:2.7, waist:3.4, chest:5.1, tor:7.6, sh:5.4, arm:[6.2, 6], ar:1.6, head:3.2, neck:.6, lean:.6, lr:1.9},
    kappa:{leg:6.2, hip:2.6, waist:3.4, chest:4.6, tor:6.8, sh:4.9, arm:[4.8, 4.6], ar:1.2, head:3.5, neck:.5, lean:.42, lr:1.6},
    mer:  {leg:10, hip:2.6, waist:2.8, chest:3.9, tor:7.4, sh:4.7, arm:[4.5, 4.3], ar:1.15, head:3.2, neck:1.3, lean:.05, lr:1.4}};
  const humBody = (key, s) => s.body || (s.shell ? 'kappa' : s.tailFin ? 'mer' : /monkey|yeti/.test(key) ? 'ape' : /preta|pop|ghoul|skel|krahang|kongkoi/.test(key) ? 'gaunt'
    : /yaksha|ogre|giant|dvarapala|asura|vessavana|ogress|imp|agnilord/.test(key) ? 'brute' : 'man');
  function hum2(key, s){
    const body = humBody(key, s), H0 = HB[body], kh = [...key].reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7), J = i => 1 + (h3(kh % 997, i, 11) - .5) * .14;
    // (v129) s.tall: an unnaturally tall build (the preta of Thai belief is as tall as a palm tree); s.neck: a long neck
    const sk = s.short ? .8 : s.tall || 1, LEG = H0.leg * sk * J(1), TOR = H0.tor * sk * J(2), SH = H0.sh * J(3), HD = H0.head * J(4), AR = H0.ar * J(5), LR = H0.lr * J(5);
    const SK = mat(key, 'skin', s.skin) ?? M.skin, TP = mat(key, 'top', s.top) ?? SK, PN = mat(key, 'pants', s.pants) ?? TP, HR = mat(key, 'hair', s.hair) ?? M.hairBlack,
      HT = mat(key, 'hat', s.hatCol) ?? (s.hat === 'ngob' ? M.straw : M.gold), TL = mat(key, 'tail', s.tail), WG = mat(key, 'wing', s.wings), HN = mat(key, 'horn', s.horns), CP = mat(key, 'cape', s.cape),
      BL = mat(key, 'belt', s.belt) ?? M.leather, IR = M[s.iris] ?? M.eye, TR = s.skirtTrim ? (M[s.skirtTrim] ?? M.gold) : null, DK = mat(key, 'dark', '#141012'),
      SLV = s.sleeve === false ? SK : TP, MZ = body === 'ape' ? mat(key, 'muzzle', s.muzzle || '#d8c0a0') : null;
    const skel = /skel/.test(key), glowEye = /undead/.test(s.race || '') || body === 'gaunt' ? emis(key, 'eyeG', s.eyeGlow || '#d8ff8a') : null;
    const sz = s.size ?? (body === 'brute' ? 1.3 : body === 'ape' || body === 'kappa' ? 1.15 : 1.2);   // natural builds are slimmer than the chibi heroes, so a little bigger reads at the same size
    const furT = (nn, t) => (h3(Math.floor(t * 24), Math.floor((Math.atan2(nn[0], nn[1]) + 4) * 8), 2) > .8 ? {dt:1} : undefined);
    const lit = nn => { const y = nn[1]; return y > .55 ? 0 : y > -.15 ? 1 : y > -.6 ? 2 : 3; };   // smooth, top-lit limbs (no ribbing)
    const bone = (nn, t) => (skel && Math.sin(t * 30) > .55 ? {m:DK, t:3} : undefined);
    return (cx, act, f, n) => {
      const o = motion(act, f, n), walk = act === 'walk', atk = act === 'attack', ph = o.ph;
      // (v121) weight and character in how they move:
      //   brute (giants, yaksha): weight shifts from foot to foot as they walk; a two-handed blow from high over the
      //     head, sinking into the knees as it lands
      //   gaunt (ghosts, phi pop): they drift — a slow float, leaning, arms reaching ahead as they come
      //   ape (the monkey king): springs up off the ground on the attack
      const brute = body === 'brute', gaunt = body === 'gaunt', ape = body === 'ape';
      const sink = atk && brute ? [0, .2, 1.4, .5][f] : 0, spring = atk && ape ? [0, 1.2, 2.6, .3][f] : 0, drift = gaunt && act !== 'die' ? Math.sin(ph * .5) * .7 + .6 : 0;
      const hop = s.oneLeg && walk ? Math.abs(Math.sin(ph)) * 2.6 : 0;   // (v129) the one-legged Phi Kongkoi hops
      const hipY = (body === 'mer' ? 5.5 : LEG + 1) + o.bob * .5 - sink + spring + drift + hop;
      fallPre(cx, o, hipY);
      const shift = walk ? Math.sin(ph) * (brute ? .75 : .3) : gaunt && act === 'idle' ? Math.sin(ph * .5) * .5 : 0;
      const T = p => [p[0] * sz + shift * Math.min(1, p[1] / Math.max(1, hipY)), p[1] * sz, p[2] * sz + o.lun];
      const C = (g, a, b, r0, r1, m, tx) => { cx.gid = g; cap(cx, T(a), T(b), r0 * sz, r1 * sz, m, {step:.35, tex:(nn, lo, q, t) => { const r = tx && tx(nn, t); return r && r.m != null && r.t != null ? r : {m:r && r.m, t:Math.max(0, Math.min(3, lit(nn) + (r && r.dt || 0)))}; }}); };
      const E = (g, c, rx, ry, m, o2 = {}) => { cx.gid = g; ell(cx, T(c), rx * sz, ry * sz, m, o2.tex ? {...o2, rz:o2.rz != null ? o2.rz * sz : undefined} : {rz:o2.rz != null ? o2.rz * sz : undefined}); };
      // ---- legs (or a fish tail)
      if (body === 'mer'){ let p0 = [0, hipY, 0], r0 = H0.hip * 1.3;
        for (let k = 1; k <= 6; k++){ const t = k / 6, p1 = [Math.sin(ph + t * 3) * 1.4 * t, Math.max(1.2, hipY - t * 5), -t * 7 - Math.max(0, t - .5) * 4], r1 = H0.hip * 1.3 * (1 - t * .7);
          C(2 + k, p0, p1, r0, r1, TL || PN, (nn, tt) => (Math.sin(tt * 18 + nn[0] * 4) > .6 ? {dt:1} : undefined)); p0 = p1; r0 = r1; }
        for (const sd of [-1, 1]) C(10 + (sd > 0 ? 1 : 0), p0, add(p0, [sd * 3.6, 1.6, -2.4]), 1.2, .3, TL || PN); }
      else for (const sd of (s.oneLeg ? [-1] : [-1, 1])){
        const one = s.oneLeg ? .12 : 1;   // a single leg stands under the middle of the body, and hops instead of striding
        const off = sd > 0 ? Math.PI : 0, sw = s.oneLeg ? 0 : walk ? Math.sin(ph + off) * .55 : atk ? sd * [0, .1, -.25, 0][f] : 0, lift = s.oneLeg ? hop * .4 : walk ? Math.max(0, Math.cos(ph + off)) * 1.6 : 0;
        const hip = [sd * H0.hip * .85 * one, hipY, 0], foot = [sd * H0.hip * (body === 'brute' || body === 'ape' || body === 'kappa' ? 1.2 : .95) * one, .9 + lift, Math.sin(sw) * LEG * .9];
        const bend = body === 'ape' || body === 'kappa' ? 2.6 : body === 'gaunt' ? 1.2 : .7, knee = [ (hip[0] + foot[0]) / 2 + sd * (body === 'ape' ? .8 : 0), (hip[1] + foot[1]) / 2 + .3, (hip[2] + foot[2]) / 2 + bend + lift * .5];
        C(2 + (sd > 0 ? 1 : 0), hip, knee, LR * 1.15, LR, s.baggy ? PN : PN, bone);
        C(4 + (sd > 0 ? 1 : 0), knee, foot, LR, LR * .75, body === 'man' && !s.sleeve === false ? PN : PN, (nn, t) => (t > .62 && !s.baggy ? {m:SK} : bone(nn, t)));
        E(6 + (sd > 0 ? 1 : 0), add(foot, [0, -.2, 1.1]), LR * 1.15, LR * .7, body === 'man' && s.weapon === 'sword' && !s.skirt ? BL : SK, {rz:LR});
      }
      // ---- torso: pelvis, waist and a chest that leans forward
      const lean = H0.lean + (atk ? [0, -.15, .3, .1][f] : 0) + (act === 'hurt' ? -.2 : 0), up = [0, Math.cos(lean), Math.sin(lean)];
      const base = [0, hipY + .4, 0], at = k => add(base, mul(up, TOR * k)), chest = at(.66), neckB = at(1 + (s.neck || 0));
      if (s.neck) C(15, at(.95), neckB, SH * .32, SH * .26, SK);   // (v129) a long thin neck
      E(12, at(.08), H0.waist * 1.08, H0.hip * 1.1 + .8, s.skirt ? PN : PN, {rz:H0.waist, tex:nn => ({t:lit(nn)})});
      C(13, at(.12), at(.5), H0.waist, H0.chest * .86, TP, (nn, t) => (t < .22 ? {m:BL} : skel && Math.abs(nn[0]) < .7 && Math.sin(t * 22) > .3 ? {m:DK, t:3} : body === 'ape' || /yeti/.test(key) ? furT(nn, t) : undefined));
      E(14, chest, H0.chest, TOR * .36, TP, {rz:H0.chest * .8, tex:nn => (skel && nn[2] > 0 && Math.sin(nn[1] * 14) > .4 && Math.abs(nn[0]) > .12 ? {m:DK, t:3} : s.sleeve === false && nn[2] > .45 && body !== 'ape' && !s.necklace ? {m:SK, t:lit(nn)} : body === 'brute' && nn[2] > .5 && Math.abs(nn[0]) < .08 ? {t:2} : {t:lit(nn)})});
      // skirt / sarong / robe
      if (s.skirt){ cx.gid = 15; const b0 = T(at(.12)), long = /merchant|matron|pop|ogress|kinnaree|laplaefolk/.test(key), bot = long ? 1 : hipY * .45;
        frustum(cx, [b0[0], 0, b0[2]], b0[1], bot * sz, H0.waist * 1.08 * sz, (H0.waist * 1.35 + (long ? 1.2 : .6)) * sz, PN, {tex:(nn, k) => (TR && k > .86 ? {m:TR} : Math.sin(Math.atan2(nn[0], nn[2]) * 7) > .75 ? {dt:1} : undefined)}); }
      // cape
      if (CP){ for (let i = 0; i <= 8; i++){ const k = i / 8, sw = Math.sin(ph + k * 2) * k * (walk ? 1.6 : .6); E(16, add(neckB, [sw * .5, -k * (TOR + LEG * .7), -H0.chest * .7 - k * 2.4]), SH * .9 + k * 1.6, 2.2, CP, {rz:1.2, tex:nn => (nn[2] > .4 ? false : {t:Math.min(3, lit(nn) + (Math.sin(nn[0] * 9) > .6 ? 1 : 0))})}); } }
      // wings, feathered, behind the shoulders
      if (WG && s.kradong){ const fl = Math.sin(ph * 2) * .35 + (walk || atk ? .25 : 0);   // กระด้ง: round woven rice trays for wings
        for (const sd of [-1, 1]){ const c = add(at(.78), [sd * (SH * .7 + 5.2), 2 + fl * 4, -H0.chest * .9 - 1]); cx.gid = 17 + (sd > 0 ? 5 : 0);
          ell(cx, T(c), 6.2 * sz, 5.2 * sz, WG, {rz:1.1 * sz, tex:nn => { const r = Math.hypot(nn[0], nn[1]); return r > .9 ? {dt:1} : Math.sin((nn[0] + nn[1]) * 26) * Math.sin((nn[0] - nn[1]) * 26) > .2 ? {dt:1} : undefined; }}); } }
      else if (WG && s.wingStyle === 'bat'){ const fl = Math.sin(ph * 2) * .3 + (walk ? .12 : 0) + (atk ? [0, .35, -.25, 0][f] : 0);   // a dragon's or demon's wings: bone and membrane
        const WM = mat(key, 'wmem', s.wingMem) ?? WG;
        for (const sd of [-1, 1]){ const g0 = 140 + (sd > 0 ? 20 : 0), root = add(at(.82), [sd * 1.8, 0, -H0.chest * .85]);
          const wrist = add(root, [sd * Math.cos(.9 + fl) * 8.5, Math.sin(.9 + fl) * 8.5 + 1.5, -3]);
          C(g0, root, wrist, 1.25, .8, WG, () => ({t:0}));
          const tips = [0, 1, 2, 3].map(i => { const a = .75 - i * .5 + fl * (1 + i * .25), r = 11 - i * 1.4; return add(wrist, [sd * Math.cos(a) * r, Math.sin(a) * r - 1.5, -1.5 - i * 1.1]); });
          tips.forEach((tp, i) => C(g0 + 1 + i, wrist, tp, .6, .2, WG, () => ({t:i < 2 ? 0 : 1})));
          C(g0 + 5, add(wrist, [sd * .6, 1.6, 0]), add(wrist, [sd * .9, 3.2, .4]), .5, .1, WG, () => ({t:0}));   // the thumb claw
          // the membrane: thin panels between each pair of fingers, and from the last finger back to the body
          const edges = [...tips, add(root, [0, -6.5, -1.2])];
          for (let i = 0; i < edges.length - 1; i++) for (let k = 1; k <= 4; k++){ const t = k / 4.6, p1 = lerp3(wrist, edges[i], t), p2 = lerp3(i === edges.length - 2 ? root : wrist, edges[i + 1], t), c = lerp3(p1, p2, .5);
            const w = Math.hypot(p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]) * .55 + .5;
            E(g0 + 6 + i, add(c, [0, -k * .25, 0]), w * (.9 - k * .08), 1.1 + (1 - t) * .8, WM, {rz:.32, tex:nn => (Math.abs(nn[1]) > .8 ? {dt:1} : {t:1})}); } } }
      else if (WG){ const fl = Math.sin(ph * 2) * .25 + (walk ? .1 : 0);
        for (const sd of [-1, 1]){ const root = add(at(.8), [sd * 1.6, 0, -H0.chest * .8]);
          for (let i = 0; i < 5; i++){ const a = .35 + i * .26 + fl; C(17 + i + (sd > 0 ? 5 : 0), root, add(root, [sd * Math.cos(a) * (9 - i * .9), Math.sin(a) * (9 - i * .9) - 2, -2 - i * .6]), 1.4, .4, WG, () => ({t:i < 2 ? 0 : 1})); } } }
      // tail
      if (TL && body !== 'mer'){ let p0 = at(.05); p0 = add(p0, [0, 0, -H0.waist * .9]); const tw = s.tailW || 1.1;
        for (let k = 1; k <= 7; k++){ const t = k / 7, p1 = add(at(.05), [Math.sin(ph + t * 3) * 1.2 * t, s.tailUp ? t * 9 - t * t * 2 : -t * 5 + t * t * 6, -H0.waist - t * 7 + (s.tailUp ? t * t * 3 : 0)]);
          C(28 + k, p0, p1, tw * (1 - t * .45), tw * (1 - (t + .14) * .45), TL, furT); p0 = p1; }
        if (s.tailFin){ for (const sd of [-1, 1]) C(36 + (sd > 0 ? 1 : 0), p0, add(p0, [sd * 2.6, 1.2, -1.6]), 1, .2, TL); } }
      if (s.pestle){ const b = add(at(.02), [0, -1, -H0.waist * .6]), sw = Math.sin(ph) * .8; C(38, b, add(b, [sw, -hipY + 1.2, -3.2]), 1.1, 1.3, M.wood, (nn, t) => (t > .9 || t < .08 ? {dt:1} : undefined)); }   // สาก: a rice pestle for a third leg
      if (s.shell){ const SH2 = mat(key, 'shell', s.shell); cx.gid = 39; const c = T(add(at(.5), [0, 0, -H0.chest * .55]));
        ell(cx, c, H0.chest * 1.25 * sz, TOR * .62 * sz, SH2, {rz:H0.chest * .9 * sz, tex:nn => { if (nn[2] > .15) return false; const u = Math.atan2(nn[0], -nn[2]) * 1.6, v = nn[1] * 2.2; return Math.abs(u - Math.round(u)) < .08 || Math.abs(v - Math.round(v)) < .08 ? {t:3} : {t:lit(nn)}; }}); }
      if (s.leaves){ const LF = mat(key, 'leaf', s.leaves); for (let i = 0; i < 9; i++){ const a = (i / 9) * Math.PI * 2, b = add(at(.1), [Math.sin(a) * H0.waist, 0, Math.cos(a) * H0.waist * .8]);   // banana-leaf skirt
          C(150 + i, b, add(b, [Math.sin(a) * 2.2 + Math.sin(ph + i) * .5, -hipY + 1.4, Math.cos(a) * 2]), 1.5, .6, LF, (nn, t) => (Math.abs(nn[0] * Math.cos(a) - nn[2] * Math.sin(a)) < .12 ? {dt:-1} : Math.sin(t * 30) > .7 ? {dt:1} : undefined)); } }
      // ---- arms (the right one holds the weapon and does the attack)
      const handOf = {};
      for (const sd of [-1, 1]){
        const off = sd > 0 ? 0 : Math.PI, sw = walk ? -Math.sin(ph + off + Math.PI) * .5 : 0, sh = add(at(.86), [sd * SH * .82, 0, 0]);
        let ea = sw + (body === 'ape' ? .5 : body === 'gaunt' ? .55 : 0), fa = ea + (body === 'gaunt' ? .5 : .25), out = body === 'brute' ? .35 : .12;
        if (atk && sd > 0){ ea = [0, -2.6, .9, .3][f] + (body === 'gaunt' ? .4 : 0); fa = ea + [0, -.3, .1, .3][f]; }
        if (atk && sd < 0 && !s.weapon){ ea = [0, .2, 1.2, .5][f]; fa = ea; }
        if (atk && sd < 0 && s.weapon === 'sword' && brute){ ea = [0, -2.3, .8, .25][f]; fa = ea + [0, -.2, .1, .3][f]; out = .2; }   // both hands on the hilt
        if (gaunt && walk){ ea += .65; fa += .35; }                                                                             // reaching ahead
        const el = add(sh, [sd * Math.sin(out) * H0.arm[0], -Math.cos(ea) * H0.arm[0] * Math.cos(out), Math.sin(ea) * H0.arm[0]]);
        const hd = add(el, [sd * .2, -Math.cos(fa) * H0.arm[1], Math.sin(fa) * H0.arm[1]]);
        E(40 + (sd > 0 ? 4 : 0), sh, AR * 1.5, AR * 1.4, SLV, {rz:AR * 1.3});
        C(41 + (sd > 0 ? 4 : 0), sh, el, AR * 1.25, AR, SLV, bone); C(42 + (sd > 0 ? 4 : 0), el, hd, AR, AR * .85, SK, bone);
        E(43 + (sd > 0 ? 4 : 0), hd, AR * (body === 'brute' ? 1.35 : 1.15), AR * (body === 'brute' ? 1.25 : 1.05), SK, {rz:AR});
        if (body === 'gaunt') for (let i = -1; i <= 1; i++) C(50 + i + (sd > 0 ? 4 : 0), hd, add(hd, [sd * .3 + i * .5, -2.4, .8]), .35, .12, DK);   // long claws
        handOf[sd] = {hd, el};
      }
      // ---- weapon
      const R = handOf[1];
      if (s.weapon === 'sword'){ const d = [0, -Math.cos(atk ? [0, -2.4, 1.3, .6][f] : .9), Math.sin(atk ? [0, -2.4, 1.3, .6][f] : .9)], dir = [d[0], -d[1], d[2]];
        C(60, R.hd, add(R.hd, mul(dir, -2)), .55, .5, M.leather); C(61, add(R.hd, mul(dir, .8)), add(R.hd, mul(dir, .9)), 1.6, 1.6, M.gold);
        C(62, add(R.hd, mul(dir, 1)), add(R.hd, mul(dir, 10 * (body === 'brute' ? 1.25 : 1))), .75, .2, M.steel, nn => ({t:nn[0] > .2 ? 0 : 1})); }
      else if (s.weapon === 'staff'){ const top = add(R.hd, [0, 10, 1.4]); C(60, add(R.hd, [0, -6, -.8]), top, .5, .45, M.wood); E(61, top, 1.5, 1.5, M.orb, {}); }
      else if (s.weapon === 'bow'){ const L = handOf[-1].hd; for (let i = 0; i < 6; i++){ const a0 = -1.1 + i * .37, a1 = a0 + .37; C(60 + i, add(L, [0, Math.sin(a0) * 6, Math.cos(a0) * 2.2]), add(L, [0, Math.sin(a1) * 6, Math.cos(a1) * 2.2]), .45, .45, M.wood); } }
      // ---- neck, head, face
      C(70, neckB, add(neckB, mul(up, H0.neck + .6)), body === 'brute' ? H0.chest * .5 : .9 + HD * .2, body === 'brute' ? HD * .8 : .8 + HD * .2, SK);
      const hc = add(add(neckB, mul(up, H0.neck + HD * .9)), [0, 0, body === 'brute' ? 1.4 : body === 'ape' ? 1.4 : .5]);
      const face = nn => eyesTex(nn, o, glowEye || IR, {glow:!!glowEye, sp:.34, y:.1, rx:.12, ry:body === 'gaunt' ? .16 : .12, front:.3})
        || (nn[2] > .7 && nn[1] < -.3 && nn[1] > -.45 && Math.abs(nn[0]) < (body === 'brute' ? .32 : .18) ? {m:M.mouth} : body === 'gaunt' && nn[2] > .3 && Math.abs(Math.abs(nn[0]) - .5) < .12 && nn[1] < 0 ? {t:3} : undefined);
      E(71, hc, HD * (body === 'brute' ? 1.12 : 1), HD * 1.08, SK, {rz:HD, tex:nn => face(nn) || {t:lit(nn) === 3 ? 2 : lit(nn)}});
      if (MZ){ E(72, add(hc, [0, -HD * .35, HD * .8]), HD * .6, HD * .45, MZ, {tex:nn => (nn[2] > .6 && nn[1] > .2 && Math.abs(nn[0]) < .3 ? {m:DK} : undefined)});
        for (const sd of [-1, 1]) E(73 + (sd > 0 ? 1 : 0), add(hc, [sd * HD * 1.05, HD * .15, -.2]), HD * .38, HD * .45, MZ); }
      if (body === 'brute'){ E(75, add(hc, [0, HD * .3, HD * .55]), HD * .95, HD * .3, SK, {tex:() => ({t:1})}); }   // heavy brow
      if (s.fangs){ for (const sd of [-1, 1]) C(76 + (sd > 0 ? 1 : 0), add(hc, [sd * HD * .32, -HD * .55, HD * .82]), add(hc, [sd * HD * .44, -HD * (body === 'brute' ? -.05 : .25), HD * 1.02]), .42, .12, M.tusk); }
      if (s.beak){ const BK = mat(key, 'beak', s.beak); C(160, add(hc, [0, -HD * .2, HD * .75]), add(hc, [0, -HD * .45, HD * 1.6]), HD * .45, HD * .12, BK); }
      if (s.dish){ cx.gid = 161; const d = T(add(hc, [0, HD * .95, -.2])); frustum(cx, [d[0], 0, d[2]], d[1] + .5 * sz, d[1] - .3 * sz, HD * .75 * sz, HD * .62 * sz, mat(key, 'dish', s.dish), {tex:(nn, k) => (k < .35 && Math.hypot(nn[0], nn[2]) < .78 ? {m:M.orb, t:Math.hypot(nn[0], nn[2]) < .3 ? 0 : 1} : undefined)}); }
      // hair: a cap over the skull (not over the face), long hair down the back, a beard, spiky fur/straw
      if (!skel){ E(78, add(hc, [0, HD * .14, -HD * .16]), HD * 1.1, HD * 1.1, HR, {rz:HD, tex:nn => (nn[2] > .2 && nn[1] < .42 ? false : nn[1] < -.35 && nn[2] > -.3 ? false : furT(nn, nn[1]))}); }
      if (s.longHair){ for (let i = 0; i < 5; i++){ const a = (i / 4 - .5) * 2.2; C(79 + i, add(hc, [Math.sin(a) * HD * .9, 0, -HD * .5]), add(hc, [Math.sin(a) * HD * 1.1 + Math.sin(ph + i) * .5, -HD - TOR * .8, -HD * .9 - TOR * .2]), HD * .45, HD * .3, HR, furT); } }
      if (s.beard){ C(85, add(hc, [0, -HD * .5, HD * .6]), add(hc, [0, -HD * 1.9, HD * .7]), HD * .62, HD * .2, HR, furT); }
      if ((s.spikes ?? 0) > 0){ const ns = s.spikes, sl = (s.spikeLen || 2.5) * .8; for (let i = 0; i < ns; i++){ const a = i * 2.39996, y = .1 + (i / ns) * .8, rr = Math.sqrt(1 - y * y), d = [Math.cos(a) * rr, y, Math.sin(a) * rr - .3];
        const b = add(hc, mul(d, HD * .95)); C(86 + (i % 6), b, add(b, mul(d, sl)), .7, .15, s.hat === 'ngob' || /scarecrow/.test(key) ? M.straw : HR); } }
      // horns
      if (HN){ const hl = s.hornLen || 2.2; for (const sd of [-1, 1]){ const b = add(hc, [sd * HD * .55, HD * .7, 0]), m1 = add(b, [sd * hl * .7, hl * .9, -.3]); C(92 + (sd > 0 ? 2 : 0), b, m1, .8, .55, HN); C(93 + (sd > 0 ? 2 : 0), m1, add(m1, [sd * hl * .1, hl * .9, -hl * .3]), .55, .12, HN); } }
      // hats
      const top = add(hc, [0, HD * .82, 0]);
      if (s.hat === 'lomphok'){ cx.gid = 100; const b = T(top); frustum(cx, [b[0], 0, b[2]], b[1] + 10 * sz, b[1] - .4, .25 * sz, HD * 1.02 * sz, HT, {tex:(nn, k) => (Math.abs(k - .62) < .05 || Math.abs(k - .35) < .04 ? {m:M.gold, t:0} : k > .9 ? {m:M.gold} : undefined)}); }
      else if (s.hat === 'ngob'){ cx.gid = 100; const b = T(add(top, [0, -.2, 0])); frustum(cx, [b[0], 0, b[2]], b[1] + 3.4 * sz, b[1], .4 * sz, HD * 2.6 * sz, HT, {tex:(nn, k) => (Math.sin(Math.atan2(nn[0], nn[2]) * 14) > .7 ? {dt:1} : undefined)}); }
      else if (s.hat === 'band'){ E(100, add(hc, [0, HD * .45, 0]), HD * 1.14, HD * .3, HT, {rz:HD * 1.1, tex:(nn, lo, q) => (nn[1] > .3 || nn[1] < -.3 ? false : undefined)}); }
      else if (s.hat === 'cap'){ E(100, add(hc, [0, HD * .35, -.2]), HD * 1.18, HD * .95, HT, {rz:HD, tex:nn => (nn[1] < .05 ? false : {t:lit(nn)})}); C(101, add(hc, [0, HD * 1.2, 0]), add(hc, [0, HD * 1.9, -.4]), .5, .2, HT); }
      else if (s.hat === 'headwrap'){ E(100, add(hc, [0, HD * .5, -.2]), HD * 1.16, HD * .78, HT, {rz:HD, tex:nn => (nn[1] < .0 ? false : Math.sin(nn[1] * 12 + nn[0] * 4) > .5 ? {dt:1} : undefined)}); E(101, add(hc, [HD * .6, HD * .9, -HD * .6]), HD * .45, HD * .4, HT); }
      // (v27) bosses wear a king's regalia: flame-shaped gold epaulettes (อินทรธนู), armbands, a jewelled belt and a gem on the chest
      if (s.boss){ const RG = mat(key, 'regal', '#f0c040'), GM = mat(key, 'gem', s.gem || '#d82a3a');
        for (const sd of [-1, 1]){ const sh = add(at(.86), [sd * SH * .82, AR * .9, 0]);
          for (let i = 0; i < 3; i++) C(110 + i + (sd > 0 ? 3 : 0), add(sh, [sd * (i - 1) * .9, 0, -.2]), add(sh, [sd * ((i - 1) * 1.4 + 1.6), 2.6 + (i === 1 ? 1.2 : 0), -.6]), .7, .15, RG, () => ({t:0}));
          const el2 = add(sh, [sd * .4, -H0.arm[0] * .45, .6]); E(117 + (sd > 0 ? 1 : 0), el2, AR * 1.35, AR * .45, RG, {rz:AR * 1.3}); }
        E(119, at(.14), H0.waist * 1.12, 1, RG, {rz:H0.waist * 1.05, tex:nn => (Math.abs(nn[0]) < .12 && nn[2] > .5 ? {m:GM, t:0} : {t:lit(nn) > 1 ? 1 : 0})});
        E(120, add(chest, [0, TOR * .08, H0.chest * .82]), H0.chest * .26, H0.chest * .3, GM, {rz:.6, tex:nn => ({t:nn[1] > .3 ? 0 : 1})});
        if (!s.hat) E(121, add(hc, [0, HD * .55, 0]), HD * 1.12, HD * .26, RG, {rz:HD * 1.1, tex:nn => (nn[1] > .4 || nn[1] < -.4 ? false : Math.abs(nn[0]) < .1 && nn[2] > .5 ? {m:GM, t:0} : undefined)}); }
      if (s.necklace){ E(102, add(neckB, [0, -.2, .3]), H0.chest * .62, 1, M.gold, {rz:H0.chest * .55, tex:(nn, lo, q) => (q < .5 ? false : undefined)}); }
      cx.pre = null;
    };
  }

  const KINDS = {quad, bird, serpent, bug, squat, floater, slime, rock:rock2};
  const POINTY_HATS = ['lomphok', 'wizard'];   // no tall pointed hats on monsters (the owner's call): they are dropped here
  function make(key, spec){
    if (POINTY_HATS.includes(spec.hat)) spec = {...spec, hat:undefined};
    const fs = spec.fs || 64;
    // (v164) every humanoid monster wears the heroes' own body (the owner's call: the v27 "natural build" read as a lump
    // of bread), dressed in its own skin, clothes, hair, hat, horns, fangs, wings and weapon; giants are drawn a size up,
    // ghosts and ghouls thin
    if (spec.arch === 'human'){ const body = humBody(key, spec), cfg = humanCfg(key, spec);
      Object.assign(cfg, {paint:true, jag:.2, bangF:12, strands:10, spikes:spec.spikes ?? 14, spikeLen:spec.spikeLen ?? 4.6, bangs:!spec.hat || spec.hat === 'band' || spec.hat === 'headwrap', paintBangs:typeof BANG_SWEEP !== 'undefined' ? BANG_SWEEP : undefined, crown:3,
        bodyScale:body === 'brute' ? 1.12 : body === 'gaunt' ? .96 : 1, slim:body === 'gaunt' ? .82 : body === 'brute' ? 1.18 : undefined, iris:spec.iris || (/preta|pop|ghoul|skel|krahang|wraith|ghost|phi/.test(key) ? 'irisRd' : 'irisBr')});
      SPR.MOBS[key] = {name:key, fs:Math.max(fs, 96), scale:spec.scale || 1, human:cfg, model:() => {}}; }
    else if (spec.arch === 'quad' && !spec.old) SPR.MOBS[key] = (spec.head === 'elephant' || spec.wing) && fs < 96 ? {name:key, fs:96, scale:(spec.scale || 1) * ((spec.scale || 1) >= 2 ? 1 : 1.15), model:quad2(key, spec)} : {name:key, fs, scale:(spec.scale || 1) * ((spec.scale || 1) >= 2 ? 1 : 1.15), model:quad2(key, spec)};   // natural anatomy (v21)
    else if (spec.arch === 'bird' && spec.bat && !spec.old) SPR.MOBS[key] = {name:key, fs, scale:spec.scale || 1, model:bat2(key, spec)};   // natural bats (v23)
    else if (spec.arch === 'bird' && !spec.bat && !spec.old) SPR.MOBS[key] = {name:key, fs, scale:spec.scale || 1, model:bird2(key, spec)};   // natural birds (v21)
    else SPR.MOBS[key] = {name:key, fs, scale:spec.scale || 1, model:KINDS[spec.arch](key, spec)};
  }
  return {make};
})();
