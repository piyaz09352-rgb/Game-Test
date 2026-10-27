/* VAYRATHEN — js/gfx/dinos.js — dinosaurs, pterosaurs and dragons built on real body plans
   The archetypes in gfx/beasts.js are mammals, birds and snakes; a dinosaur drawn from them reads as a sausage on
   sticks. These models follow the animals' skeletons instead (data/world4.js picks one with look.plan):
     theropod  a hunter balanced over its hips: deep skull with a jaw that opens, teeth, an S-shaped neck, a barrel
               ribcage, big thigh muscles, shin, long metatarsus on three forward toes, small two-fingered arms, and a
               long tail held straight out as a counterweight. Options: snout (spinosaur), beak (ornithomimid, no
               teeth), feathers (raptor / ornithomimid tufts on arms, back and tail), sickle (raised toe claw),
               sail (spinosaur), crest, horns (brow horns).
     sauropod  pillar legs on round elephant feet, a deep barrel, a long neck rising forward, a small head with
               high nostrils, and a whip tail.
     ceratops  a heavy quadruped with shorter fore legs: a huge head with a parrot beak, a bony frill fringed with
               knobs, two long brow horns and a nose horn.
     stego     hips far higher than the shoulders, a small head carried low, two staggered rows of kite-shaped
               plates, and four tail spikes (the thagomizer).
     ankylo    a wide, low, armoured body: rows of bony studs, side spikes, a broad triangular head with corner
               horns, and a bone club at the end of the tail.
     ptero     a pterosaur: a long-beaked crested head on a long neck, a short body, and wings of skin stretched from
               a very long fourth finger to the ankle (folded when it walks on all fours).
     dragon    a western dragon: four legs, an S-neck, a horned head with a jaw, a spined back, a long tail ending in
               a spade, and bat-like wings of membrane between long finger bones.
     wyvern    the same dragon on two legs, its wings being its arms.
   Flat parts (plates, frills, sails, wing membranes) are built as rows of small capsules in the part's own plane,
   so they read as thin sheets from the side and as edges from the front — the ellipsoid impostors of the renderer
   always face the camera and cannot make a sheet on their own. */
'use strict';

const DINO = (() => {
  const {ell, cap, rotX, rotY, rotZ, add, mul, lerp3, ramp} = SPR.prim, M = SPR.M;
  const mat = (key, part, col) => (col ? ramp(`${key}_${part}`, col) : null);
  const emis = (key, part, col) => (col ? ramp(`${key}_${part}`, col, {emissive:true}) : null);
  const h3 = (a, b, c) => { const v = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return v - Math.floor(v); };
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const lenOf = v => Math.hypot(v[0], v[1], v[2]);

  /* the shared motion of every monster model (same timing as gfx/beasts.js) */
  function motion(act, f, n){
    const ph = f / n * Math.PI * 2, o = {bob:0, lun:0, sw:0, fall:0, eyes:'open', tilt:0, ph, jaw:0, flap:Math.sin(ph * 2), walk:act === 'walk', atk:act === 'attack'};
    if (act === 'idle'){ o.bob = Math.sin(ph) * .35; o.flap = Math.sin(ph) * .5; o.jaw = .26 + Math.max(0, Math.sin(ph)) * .1; }
    if (act === 'walk') o.jaw = .12;
    if (act === 'walk'){ o.bob = Math.abs(Math.cos(ph)) * .8; }
    if (act === 'attack'){ o.lun = [0, -2.5, 6, 2][f]; o.tilt = [0, .25, -.35, 0][f]; o.jaw = [0, .55, .75, .2][f]; o.flap = [0, 1, -1, 0][f]; }
    if (act === 'hurt'){ o.lun = -2; o.tilt = .3; o.eyes = 'hurt'; o.jaw = .3; }
    if (act === 'die'){ o.fall = [.35, .9, 1.35, 1.55][f]; o.eyes = 'closed'; o.jaw = .25; }
    return o;
  }
  const fallPre = (cx, o, h) => { if (o.fall) cx.pre = p => { const q = rotZ([p[0], p[1] - h, p[2]], o.fall); return [q[0], Math.max(.5, q[1] + h - o.fall * h * .45), q[2]]; }; };

  /* the skin: a pale belly, dark bands across the back, optional spots, and a fine grain of scales */
  function skinOf(P, s){
    return (part, t0 = 0, t1 = 1) => (nn, lo, q, t = .5) => {
      const tt = t0 + (t1 - t0) * t;
      if (P.BE && nn[1] < -.42 && part !== 'leg' && part !== 'toe') return {m:P.BE};
      if (P.ST && (part === 'body' || part === 'tail' || part === 'neck' || part === 'head') && nn[1] > .12){
        const band = Math.sin(tt * (part === 'tail' ? 9 : part === 'head' ? 3 : 6) * Math.PI * 2 + Math.abs(nn[0]) * 2.4);   // chevrons: bands bend back down the flanks
        if (band > .7 - (nn[1] - .12) * .25) return {m:P.ST}; }
      if (s.spots && h3(Math.floor(nn[0] * 6 + tt * 13), Math.floor(nn[1] * 6), Math.floor(nn[2] * 6)) > .8 && nn[1] > -.3) return {m:P.ST || P.DK, t:2};
      if (s.cracks && Math.abs(Math.sin(nn[0] * 7 + Math.sin(nn[1] * 9) * 1.6 + tt * 11)) < .06) return {dt:2};
      if (h3(Math.floor(nn[0] * 11 + tt * 31), Math.floor(nn[1] * 11), Math.floor(nn[2] * 11)) > .82) return {dt:1};   // scales
      return undefined;
    };
  }
  function palette(key, s){
    return {SK:mat(key, 'skin', s.skin), BE:mat(key, 'belly', s.belly), ST:mat(key, 'stripe', s.stripe), DK:mat(key, 'dark', s.dark || '#1e1814'),
      AC:mat(key, 'acc', s.acc || '#efe6cf'), CL:mat(key, 'claw', s.claw || '#2a2420'), FE:mat(key, 'feather', s.feathers), SL:mat(key, 'sail', s.sail),
      PL:mat(key, 'plate', s.plates), FR:mat(key, 'frill', s.frill), WG:mat(key, 'wbone', s.wing), WM:mat(key, 'wmem', s.wingMem || s.wing),
      CR:mat(key, 'crest', s.crest), EY:s.eyeGlow ? emis(key, 'eye', s.eyeGlow) : mat(key, 'eye', s.eye || '#e8b030')};
  }

  /* a sheet in its own plane: rows of thin capsules from points on edge A to the matching points on edge B */
  function sheetFill(cx, A, B, r, m, rows, tex){ for (let i = 0; i <= rows; i++){ const t = i / rows; cap(cx, A(t), B(t), r, r, m, tex ? {tex:(nn, lo, q, u) => tex(nn, t, u)} : {}); } }
  /* a side-set reptile eye with a bony brow and a glint */
  function eye(cx, c, side, r, P, o, glow){
    const e = add(c, [side * r * .15, 0, 0]);
    if (o.eyes === 'closed'){ cap(cx, add(e, [0, 0, -r * .8]), add(e, [0, 0, r * .8]), r * .35, r * .35, P.DK, {}); return; }
    ell(cx, e, r, r, P.EY, glow ? {} : {tex:nn => (nn[1] > .25 && nn[2] > .2 ? {m:M.white, t:0} : Math.abs(nn[2]) < .22 && !glow ? {m:P.DK, t:3} : undefined)});
    cap(cx, add(e, [side * r * .2, r * .9, -r]), add(e, [side * r * .2, r * 1.05, r * 1.1]), r * .55, r * .4, P.SK, {});   // brow ridge
  }
  /* a jawed head built like a theropod skull, not two balls: a deep, narrow, boxy upper skull that tapers to the
     snout (roof and cheek rows of small spheres, so it keeps its shape from every side), a dark antorbital opening
     in the cheek, an eye under a bony brow with a little horn boss, a dark lip line with a row of teeth, a separate
     lower jaw hinged under the back of the skull that swings open on a red mouth and tongue, and nostrils at the tip.
     Returns key points for horns and crests. */
  function jawHead(cx, P, s, sk, hc, o, opt){
    const Ls = 7.2 * (opt.snout ?? 1) * sk, deep = 3.3 * (opt.deep ?? 1) * sk, wide = 1.75 * (opt.wide ?? 1) * sk, z0 = -2.2 * sk;
    const pitch = opt.pitch ?? 0, jaw = Math.min(.95, o.jaw * (opt.jawK ?? 1)), R = p => add(hc, rotX(p, pitch));
    const H = u => deep * (1 - .48 * u), Wd = u => wide * (1 - .42 * u), top = u => deep * .5 - u * deep * .2, N = 12;
    const fen = (u, nn, sd) => !opt.beak && u > .32 && u < .58 && nn[0] * sd > .35 && nn[1] > -.35 && nn[1] < .55;   // the antorbital opening
    // upper skull: roof row and cheek row on both sides, plus a keel down the middle of the roof
    for (let i = 0; i <= N; i++){ const u = i / N, z = z0 + u * Ls, h = H(u), w = Wd(u), r = Math.min(h * .3, w * .62), yT = top(u);
      for (const sd of [-1, 1]){ cx.gid = 60 + (sd > 0 ? 1 : 0);
        ell(cx, R([sd * (w - r), yT - r, z]), r, r, P.SK, {tex:nn => (nn[1] > .35 && P.ST && Math.sin(u * 9) > .5 ? {m:P.ST} : (h3(i, Math.floor(nn[0] * 6), Math.floor(nn[1] * 6)) > .84 ? {dt:1} : undefined))});
        ell(cx, R([sd * (w - r * .9), yT - h * .62, z]), r * 1.05, r * 1.05, P.SK, {tex:nn => (fen(u, nn, sd) ? {m:P.DK, t:3} : nn[1] < -.55 ? {m:P.DK, t:2} : undefined)}); }   // cheek, with the lip line under it
      cx.gid = 62; ell(cx, R([0, yT - r * .7, z]), r * .9, r * .9, P.SK, {}); }
    const tip = R([0, top(1) - H(1) * .45, z0 + Ls + .4 * sk]);
    cx.gid = 63; ell(cx, tip, Wd(1) * .9, H(1) * .45, P.SK, {});
    // brow ridges over the eyes, with a small horn boss (tyrannosaur lacrimal / postorbital)
    for (const sd of [-1, 1]){ const u = .16, b = R([sd * Wd(u) * .9, top(u) - H(u) * .18, z0 + u * Ls]);
      cx.gid = 64 + (sd > 0 ? 1 : 0); cap(cx, add(b, [0, .35 * sk, -1.1 * sk]), add(b, [0, .5 * sk, 1.3 * sk]), .55 * sk, .45 * sk, P.SK, {});
      if (!opt.beak) cap(cx, add(b, [0, .5 * sk, .2 * sk]), add(b, [sd * .15, 1.15 * sk, .5 * sk]), .45 * sk, .12, P.AC, {});
      eye(cx, add(b, [sd * .1 * sk, -.75 * sk, .15 * sk]), sd, .5 * sk, P, o, !!s.eyeGlow); }
    // nostrils
    cx.gid = 66; for (const sd of [-1, 1]) ell(cx, R([sd * Wd(.92) * .55, top(.92) - H(.92) * .15, z0 + .92 * Ls]), .28 * sk, .2 * sk, P.DK, {});
    // teeth hang from the lip line
    if (!opt.beak){ cx.gid = 67; for (let i = 2; i <= N; i++){ const u = i / N; for (const sd of [-1, 1]){ const b = R([sd * Wd(u) * .78, top(u) - H(u) * .88, z0 + u * Ls]); cap(cx, b, add(b, rotX([0, -.95 * sk * (1.15 - u * .4), .15 * sk], pitch)), .32 * sk, .08, M.tusk, {}); } } }
    else { cx.gid = 67; cap(cx, add(tip, [0, .2 * sk, -1.2 * sk]), add(tip, [0, -.45 * sk, .35 * sk]), H(1) * .38, .15, P.AC, {}); }   // a horny beak
    // the lower jaw: hinged under the back of the skull, swings down
    const hinge = R([0, top(0) - H(0) * .92, z0 + .35 * sk]), J = p => add(hinge, rotX(p, pitch + jaw)), JL = Ls * .94;
    if (jaw > .08){ cx.gid = 68; for (let i = 1; i <= 6; i++){ const u = i / 6; ell(cx, lerp3(J([0, .5 * sk, JL * u * .95]), R([0, top(u) - H(u) * .8, z0 + u * Ls]), .5), Wd(u) * .55, Wd(u) * .55, M.mouth, {}); }   // mouth and tongue
      cx.gid = 68; cap(cx, J([0, .45 * sk, JL * .15]), J([0, .55 * sk, JL * .7]), Wd(.3) * .32, Wd(.7) * .25, M.mouth, {tex:() => ({t:0})}); }
    for (let i = 0; i <= 8; i++){ const u = i / 8, d = (1.45 - u * .7) * sk, w = Wd(u) * .82, r = Math.min(d * .55, w * .6);
      for (const sd of [-1, 1]){ cx.gid = 69 + (sd > 0 ? 1 : 0); ell(cx, J([sd * (w - r), -d * .45, JL * u]), r, r, opt.beak ? P.AC : P.SK, {tex:nn => (nn[1] < -.3 && P.BE ? {m:P.BE} : undefined)});
        if (!opt.beak && i > 0 && jaw > .08){ const b = J([sd * (w - r) * .9, d * .1, JL * u]); cap(cx, b, add(b, rotX([0, .8 * sk * (1.1 - u * .4), 0], pitch + jaw)), .3 * sk, .08, M.tusk, {}); } } }
    return {R, tip, deep:H(0), w:Wd(0)};
  }
  /* a three-toed bird-like foot, the middle toe longest; sickle: a raised killing claw on the second toe */
  function foot3(cx, P, f, sd, sz, sickle){
    cx.gid = 30 + (sd > 0 ? 1 : 0);
    for (const [a, l] of [[-.45, .8], [0, 1], [.45, .8]]){ const tp = add(f, [Math.sin(a) * 2.6 * sz * l, -.3, Math.cos(a) * 2.6 * sz * l]); cap(cx, f, tp, .75 * sz, .45 * sz, P.SK, {}); cap(cx, tp, add(tp, [0, -.2, .8 * sz]), .4 * sz, .12, P.CL, {}); }
    if (sickle){ const b = add(f, [-sd * .7 * sz, .9 * sz, .9 * sz]); cap(cx, f, b, .55 * sz, .5 * sz, P.SK, {}); cap(cx, b, add(b, [0, .9 * sz, 1.6 * sz]), .45 * sz, .1, P.CL, {}); }
  }
  /* a column leg on a round foot with nails (sauropods, ceratopsians, stegosaurs) */
  function pillarLeg(cx, P, skin, top, len, r, sw, lift, sd, fore){
    const knee = add(top, rotX([0, -len * .52, fore ? .5 : -.4], sw)), foot = add(knee, rotX([0, -len * .48 + lift, fore ? -.2 : .3], sw * 1.1));
    cap(cx, top, knee, r * 1.2, r * .95, P.SK, {tex:skin('leg')}); cap(cx, knee, foot, r * .95, r * .9, P.SK, {tex:skin('leg')});
    ell(cx, add(foot, [0, .2, .3]), r * 1.1, r * .55, P.SK, {tex:nn => (nn[2] > .45 && Math.abs(Math.sin(nn[0] * 8)) < .3 ? {m:P.AC, t:1} : {dt:1})});   // nails on the front of the foot
    return foot;
  }
  /* a tail as a chain: from base, out along -z, held level (rise = how much it lifts at the end) */
  function tail(cx, P, skin, base, len, r0, r1, o, opt = {}){
    const n = opt.segs || 9; let p0 = base; const pts = [base];
    for (let i = 1; i <= n; i++){ const k = i / n, sway = Math.sin(o.ph * (o.walk ? 1 : .5) + k * 2.6) * (o.walk ? 2.2 : 1.1) * k * (opt.sway ?? 1);
      const p1 = add(base, [sway, (opt.rise ?? 0) * k - (opt.droop ?? 0) * Math.sin(k * Math.PI * .5), -len * k]);
      cx.gid = 40 + i; cap(cx, p0, p1, r0 + (r1 - r0) * (k - 1 / n), r0 + (r1 - r0) * k, P.SK, {step:.35, tex:skin('tail', k - 1 / n, k)}); pts.push(p1); p0 = p1; }
    return pts;
  }
  /* membrane wing: an arm to the wrist, long finger bones fanned out, skin stretched between them and back to the body */
  function wing(cx, P, root, sd, span, o, opt = {}){
    const fl = (opt.fold ? -.9 : 0) + o.flap * (opt.fold ? .15 : .55) + (opt.lift ?? .35);
    const elbow = add(root, [sd * Math.cos(fl * .6 + .2) * span * .28, Math.sin(fl * .6 + .2) * span * .28 + 1, -span * .06]);
    const wrist = add(elbow, [sd * Math.cos(fl + .1) * span * .3, Math.sin(fl + .1) * span * .3, opt.fold ? -span * .2 : span * .05]);
    cx.gid = 80 + (sd > 0 ? 10 : 0); cap(cx, root, elbow, 1.2 * opt.bone, .9 * opt.bone, P.WG, {}); cap(cx, elbow, wrist, .9 * opt.bone, .7 * opt.bone, P.WG, {});
    const fingers = (opt.fingers || [[.55, .62], [.05, .8], [-.45, .66], [-.95, .5]]).map(([a, l]) => add(wrist, [sd * Math.cos(a + fl * .8) * span * l * (opt.fold ? .35 : 1), Math.sin(a + fl * .8) * span * l * (opt.fold ? .35 : 1) - (opt.fold ? 1 : 0), -span * l * (opt.fold ? .45 : .32)]));
    fingers.forEach((tp, i) => { cx.gid = 81 + i + (sd > 0 ? 10 : 0); cap(cx, wrist, tp, .6 * opt.bone, .22 * opt.bone, P.WG, {}); });
    cx.gid = 86 + (sd > 0 ? 10 : 0); cap(cx, wrist, add(wrist, [sd * .4, 1.6 * opt.bone, .8]), .5 * opt.bone, .12, P.CL, {});   // thumb claw
    // skin: between each pair of fingers (scalloped: each panel sags a little between the tips), and from the last finger back to the body
    const edges = [...fingers, opt.trail || add(root, [0, -2, -span * .35])];
    for (let i = 0; i < edges.length - 1; i++){
      const a = edges[i], b = edges[i + 1], from = i === edges.length - 2 ? root : wrist;
      sheetFill(cx, t => lerp3(wrist, a, .1 + t * .9), t => lerp3(from, b, .1 + t * .9 * (1 - .06 * Math.sin(t * Math.PI))), .62 * opt.bone, P.WM, Math.max(7, Math.round(span / 1.8)), (nn, t, u) => (u > .92 ? {dt:1} : {t:nn[1] > .3 ? 1 : 2}));
    }
    return {wrist, fingers};
  }

  /* ---------------- theropod ---------------- */
  function theropod(key, s){
    const P = palette(key, s), skin = skinOf(P, s), g = s.girth ?? 1, L = s.len ?? 1, LG = s.leg ?? 1, sk = (s.skull ?? 1.1) * Math.sqrt(g);
    const H = 11.5 * LG, BL = 8.5 * L, tl = 19 * L * (s.tailLen ?? 1), up = (s.upright ?? 1) * 4.6 * g;   // up: the chest rides higher than the hips
    return (cx, act, f, n) => {
      const o = motion(act, f, n), ph = o.ph, walk = o.walk;
      fallPre(cx, o, H);
      const T = p => [p[0], p[1] + o.bob, p[2]];
      const hip = T([0, H, 0]), chest = T([0, H + up, BL]), belly = add(lerp3(hip, chest, .55), [0, -.8 * g, 0]);
      // legs: thigh, shin, long metatarsus, three toes — far leg first
      for (const sd of [-1, 1]){ const off = sd > 0 ? Math.PI : 0, sw = walk ? Math.sin(ph + off) * .55 : (o.atk ? [0, .1, -.25, 0][f] * sd : 0), lift = walk ? Math.max(0, Math.cos(ph + off)) * 2.2 : 0;
        const top = add(hip, [sd * 3.3 * g, -.4, .8]);
        const knee = add(top, rotX([sd * .4, -H * .42, H * .2], sw)), ankle = add(knee, rotX([0, -H * .34, -H * .22], sw * .6)), ft = add(ankle, rotX([0, -H * .24 + .6 + lift, H * .05], sw * .3));
        // the thigh: a long muscle wrapped round the femur (thick at the hip, narrowing to the knee), not a ball
        cx.gid = 20 + (sd > 0 ? 2 : 0); cap(cx, add(top, [0, 1.2 * g, -1.2 * g]), lerp3(top, knee, .72), 3.7 * g, 2.5 * g, P.SK, {step:.35, tex:skin('leg')});
        cap(cx, top, knee, 2.9 * g, 1.9 * g, P.SK, {step:.4, tex:skin('leg')});
        cap(cx, lerp3(knee, ankle, .05), lerp3(knee, ankle, .5), 1.9 * g, 1.45 * g, P.SK, {});   // the calf
        cx.gid = 21 + (sd > 0 ? 2 : 0); cap(cx, knee, ankle, 2 * g, 1.25 * g, P.SK, {step:.4, tex:skin('leg')}); cap(cx, ankle, ft, 1.2 * g, 1 * g, P.SK, {});
        foot3(cx, P, ft, sd, Math.sqrt(g) * (s.foot ?? 1), s.sickle);
        if (P.FE && s.featherLegs){ cx.gid = 24; for (let i = 0; i < 4; i++) cap(cx, lerp3(top, knee, .2 + i * .2), add(lerp3(top, knee, .2 + i * .2), [sd * 1.6, -1.6, -1.8]), .9, .3, P.FE, {}); } }
      // tail, level behind the hips
      const tp = tail(cx, P, skin, add(hip, [0, .9 * g, -2.4 * g]), tl, 3.9 * g, .35, o, {rise:3.2, droop:1.6, segs:12});
      if (P.FE && s.tailFan){ cx.gid = 52; const e = tp[tp.length - 1]; for (const a of [-.9, -.45, 0, .45, .9]) cap(cx, tp[tp.length - 3], add(e, [Math.sin(a) * 3, .3, -Math.cos(a) * 2.2]), .8, .35, P.FE, {}); }
      // torso: hips → ribcage → chest
      // torso: deeper than it is wide — a back row and a belly row (ribcage, gut) rather than one round barrel
      cx.gid = 1; cap(cx, add(hip, [0, 1.4 * g, 0]), add(belly, [0, 1.8 * g, 0]), 3.6 * g, 3.9 * g, P.SK, {step:.35, tex:skin('body', 0, .5)});
      cap(cx, add(hip, [0, -1, .6]), add(belly, [0, -1.6 * g, 0]), 3.4 * g, 4.3 * g, P.SK, {step:.35, tex:skin('body', 0, .5)});
      cx.gid = 2; cap(cx, add(belly, [0, 1.8 * g, 0]), add(chest, [0, .8 * g, 0]), 3.9 * g, 3.4 * g, P.SK, {step:.35, tex:skin('body', .5, 1)});
      cap(cx, add(belly, [0, -1.6 * g, 0]), add(chest, [0, -1.2 * g, .4]), 4.3 * g, 3.5 * g, P.SK, {step:.35, tex:skin('body', .5, 1)});
      if (P.SL){ cx.gid = 3; sheetFill(cx, t => add(lerp3(hip, chest, -.15 + t * 1.1), [0, 3.6 * g, 0]), t => add(lerp3(hip, chest, -.15 + t * 1.1), [0, 3.6 * g + (2 + Math.sin(t * Math.PI) * 10.5) * g, (t - .5) * -1.2]), .55 * g, P.SL, 14,
        (nn, t, u) => (Math.abs(Math.sin(t * 14 * Math.PI)) < .2 ? {m:P.ST || P.DK, t:1} : {t:u > .85 ? 2 : u > .4 ? 0 : 1})); }   // spinosaur sail on long spines
      if (P.FE && s.backFeathers){ cx.gid = 3; for (let i = 0; i < 7; i++){ const p = lerp3(hip, chest, i / 6); cap(cx, add(p, [0, 4.2 * g, 0]), add(p, [0, 5.6 * g, -2.4]), 1, .35, P.FE, {}); } }
      // arms: small, two clawed fingers (longer and feathered on raptors and ornithomimids)
      const AL = (s.arms ?? 1);
      for (const sd of [-1, 1]){ cx.gid = 26 + (sd > 0 ? 1 : 0); const sw = walk ? Math.sin(ph + (sd > 0 ? 0 : Math.PI)) * .25 : o.atk ? [0, -.4, .5, 0][f] : Math.sin(ph) * .08;
        const sh = add(chest, [sd * 3.4 * g, -1.6 * g, .4]), el = add(sh, rotX([sd * .5, -2.8 * AL * g, .8 * AL], sw)), hd = add(el, rotX([sd * .2, -.6, 2.6 * AL * g], sw));
        cap(cx, sh, el, 1.1 * g, .8 * g, P.SK, {}); cap(cx, el, hd, .8 * g, .55 * g, P.SK, {});
        for (const d of [-.35, .35]) cap(cx, hd, add(hd, [d * sd, -.9, 1.1 * AL]), .38, .12, P.CL, {});
        if (P.FE && AL > 1.2){ for (let i = 0; i < 4; i++) cap(cx, lerp3(sh, hd, .3 + i * .2), add(lerp3(sh, hd, .3 + i * .2), [sd * .8, -2.4, -1.4]), .7, .25, P.FE, {}); } }
      // neck: S-curve up from the chest, head carried forward
      const nb = add(chest, [0, 1.4 * g, 3 * g]), nm = add(nb, [0, 2.6 * (s.neck ?? 1), 1.8]), hc = add(add(nm, [0, 1.6 * (s.neck ?? 1), 2.6 * sk]), [0, o.atk ? [0, .6, -2.2, -.6][f] : 0, o.lun * .8]);
      cx.gid = 5; cap(cx, nb, nm, 4.2 * g, 3.5 * g, P.SK, {step:.4, tex:skin('neck', 0, .5)}); cap(cx, nm, add(hc, [0, -.6, -2.6 * sk]), 3.5 * g, 2.6 * sk, P.SK, {step:.4, tex:skin('neck', .5, 1)});
      if (P.FE && s.neckFeathers){ cx.gid = 6; for (let i = 0; i < 5; i++){ const p = lerp3(nb, hc, i / 5); cap(cx, add(p, [0, 2.2, -.6]), add(p, [0, 3.6, -2.4]), .9, .3, P.FE, {}); } }
      const hd = jawHead(cx, P, s, sk, hc, o, {snout:s.snout, beak:s.beak, deep:s.deep, wide:s.wide, pitch:(o.atk ? [0, -.15, .2, 0][f] : 0) + (s.headPitch ?? .08), skin});
      if (s.horns){ cx.gid = 67; for (const sd of [-1, 1]){ const b = hd.R([sd * hd.w * .7, hd.deep * 1.05, -.4 * sk]); cap(cx, b, add(b, [sd * .3, 1.8 * sk, -1.1 * sk]), .8 * sk, .15, P.AC, {}); } }   // brow horns (Ceratosaurus / Carnotaurus style)
      if (P.CR){ cx.gid = 68; sheetFill(cx, t => hd.R([0, hd.deep * .9, -1.4 * sk + t * 6 * sk]), t => hd.R([0, hd.deep * .9 + 2.4 * sk * Math.sin(t * Math.PI), -1.4 * sk + t * 6 * sk]), .4 * sk, P.CR, 8); }   // a head crest
      cx.pre = null;
    };
  }

  /* ---------------- sauropod ---------------- */
  function sauropod(key, s){
    const P = palette(key, s), skin = skinOf(P, s), g = s.girth ?? 1, L = s.len ?? 1, LG = s.leg ?? 1, NK = s.neck ?? 1;
    const H = 11 * LG, BL = 12 * L;
    return (cx, act, f, n) => {
      const o = motion(act, f, n), ph = o.ph, walk = o.walk;
      fallPre(cx, o, H);
      const T = p => [p[0], p[1] + o.bob * .4, p[2]];
      const hip = T([0, H + 2.2 * g, -BL * .45]), sho = T([0, H + 2.2 * g + (s.shoulderUp ?? 1), BL * .5]), mid = lerp3(hip, sho, .5);
      // legs: a lateral-sequence walk on four columns
      for (const [sd, fr, off] of [[-1, 1, 0], [1, 1, Math.PI], [-1, -1, Math.PI * .5], [1, -1, Math.PI * 1.5]]){
        const sw = walk ? Math.sin(ph + off) * .35 : 0, lift = walk ? Math.max(0, Math.cos(ph + off)) * 1.4 : 0, top = add(fr > 0 ? sho : hip, [sd * 4.6 * g, -2.6 * g, 0]);
        cx.gid = 20 + (sd > 0 ? 1 : 0) + (fr > 0 ? 2 : 0); pillarLeg(cx, P, skin, top, top[1] - .4, 2.6 * g * (fr > 0 ? .92 : 1), sw, lift, sd, fr > 0); }
      // the barrel
      cx.gid = 1; cap(cx, hip, mid, 6.2 * g, 7.4 * g, P.SK, {step:.35, tex:skin('body', 0, .5)}); cx.gid = 2; cap(cx, mid, sho, 7.4 * g, 6.4 * g, P.SK, {step:.35, tex:skin('body', .5, 1)});
      // whip tail
      tail(cx, P, skin, add(hip, [0, .6 * g, -4.5 * g]), 28 * L, 4.6 * g, .25, o, {droop:3.5, rise:1.5, segs:12, sway:1.3});
      // the long neck: rises forward, then levels; it sways gently
      const NL = 26 * NK; let p0 = add(sho, [0, 2 * g, 4.4 * g]); const seg = 8;
      for (let i = 1; i <= seg; i++){ const k = i / seg, sway = Math.sin(o.ph * .5 + k * 2) * 1.2 * k;
        const p1 = add(add(sho, [0, 2 * g, 4.4 * g]), [sway, NL * .62 * Math.sin(k * 1.35), NL * .55 * k + (o.atk ? [0, -1, 3, 1][f] * k * k : 0)]);
        cx.gid = 5 + i; cap(cx, p0, p1, (3.7 - k * 2.1) * g, (3.7 - (k + 1 / seg) * 2.1) * g, P.SK, {step:.4, tex:skin('neck', k - 1 / seg, k)}); p0 = p1; }
      // the small head: a rounded snout, a high bump for the nostrils
      const hc = add(p0, [0, .2, 1.4]);
      cx.gid = 60; ell(cx, hc, 2.1 * g, 1.9 * g, P.SK, {rz:2.6, tex:skin('head')}); cap(cx, add(hc, [0, -.2, .8]), add(hc, [0, -.7, 3.6 * g]), 1.6 * g, 1.2 * g, P.SK, {tex:skin('head')});
      cx.gid = 61; ell(cx, add(hc, [0, 1.3 * g, .4]), 1.1 * g, .9 * g, P.SK, {});   // nasal arch
      if (o.jaw > .2){ cx.gid = 62; cap(cx, add(hc, [0, -1.3 * g, .4]), add(hc, [0, -1.9 * g - o.jaw * 1.2, 3.2 * g]), .9 * g, .7 * g, P.SK, {}); }
      cx.gid = 63; for (const sd of [-1, 1]) eye(cx, add(hc, [sd * 1.75 * g, .55 * g, -.2]), sd, .5 * g, P, o, !!s.eyeGlow);
      cx.pre = null;
    };
  }

  /* ---------------- ceratopsian ---------------- */
  function ceratops(key, s){
    const P = palette(key, s), skin = skinOf(P, s), g = s.girth ?? 1, L = s.len ?? 1, LG = s.leg ?? 1;
    const H = 8 * LG, BL = 12 * L;
    return (cx, act, f, n) => {
      const o = motion(act, f, n), ph = o.ph, walk = o.walk;
      fallPre(cx, o, H);
      const T = p => [p[0], p[1] + o.bob * .5, p[2]];
      const hip = T([0, H + 2.4 * g, -BL * .4]), sho = T([0, H + 1.2 * g, BL * .45]), mid = lerp3(hip, sho, .5);
      for (const [sd, fr, off] of [[-1, 1, 0], [1, 1, Math.PI], [-1, -1, Math.PI], [1, -1, 0]]){
        const sw = walk ? Math.sin(ph + off) * .45 : 0, lift = walk ? Math.max(0, Math.cos(ph + off)) * 1.4 : 0, top = add(fr > 0 ? sho : hip, [sd * (fr > 0 ? 5 : 4.4) * g, -2.4 * g, 0]);
        cx.gid = 20 + (sd > 0 ? 1 : 0) + (fr > 0 ? 2 : 0); pillarLeg(cx, P, skin, top, top[1] - .4, 2.3 * g, sw, lift, sd, fr > 0); }
      cx.gid = 1; cap(cx, hip, mid, 5.8 * g, 6.6 * g, P.SK, {step:.35, tex:skin('body', 0, .5)}); cx.gid = 2; cap(cx, mid, sho, 6.6 * g, 5.6 * g, P.SK, {step:.35, tex:skin('body', .5, 1)});
      tail(cx, P, skin, add(hip, [0, 0, -4.4 * g]), 12 * L, 3.6 * g, .4, o, {droop:3, segs:7});
      // the head, carried low and forward; on the attack it drops and thrusts the horns
      const hc = add(sho, [0, -.4 + (o.atk ? [0, .8, -1.6, -.4][f] : 0), 6.2 * g + o.lun * .8]), pitch = o.atk ? [0, -.2, .35, .1][f] : .1;
      const R = p => add(hc, rotX(p, pitch)), sk = g;
      // the frill: a broad shield angled up and back from the skull, fringed with knobs
      if (P.FR){ cx.gid = 58; const fw = 7.4 * sk, fh = 7 * sk;
        sheetFill(cx, t => R([(t - .5) * 2 * fw * .55, 1.2 * sk, -2.6 * sk]), t => R([(t - .5) * 2 * fw, 1.2 * sk + fh * Math.sin(Math.max(.2, 1 - Math.abs(t - .5) * 1.6) * Math.PI * .5), -2.6 * sk - fh * .55]), .7 * sk, P.FR, 16,
          (nn, t, u) => (u > .82 ? {m:P.AC, t:1} : Math.abs(Math.sin(t * 9)) < .18 && u > .3 ? {dt:1} : undefined));
        for (let i = 0; i <= 10; i++){ const t = i / 10; ell(cx, R([(t - .5) * 2 * fw, 1.2 * sk + fh * Math.sin(Math.max(.2, 1 - Math.abs(t - .5) * 1.6) * Math.PI * .5) + .4, -2.6 * sk - fh * .55 - .2]), .75 * sk, .75 * sk, P.AC, {}); } }   // epoccipital knobs
      // skull and parrot beak
      cx.gid = 60; ell(cx, R([0, 0, 0]), 3.6 * sk, 3.4 * sk, P.SK, {rz:3.8 * sk, tex:skin('head')});
      cx.gid = 61; cap(cx, R([0, -.2, 1.8 * sk]), R([0, -1.2 * sk, 6 * sk]), 2.8 * sk, 1.6 * sk, P.SK, {tex:skin('head')});
      cx.gid = 62; cap(cx, R([0, -1 * sk, 5.6 * sk]), R([0, -2.6 * sk, 7.2 * sk]), 1.4 * sk, .35, P.DK, {});   // upper beak, hooked
      cx.gid = 63; cap(cx, R([0, -2.2 * sk, 2 * sk]), add(R([0, -2.4 * sk, 6.2 * sk]), [0, -o.jaw * 2, 0]), 1.8 * sk, .8 * sk, P.SK, {});
      // horns: two long brow horns sweeping forward, a short nose horn
      if (s.horns !== false){ cx.gid = 64; for (const sd of [-1, 1]){ const b = R([sd * 1.7 * sk, 2.4 * sk, .4 * sk]), m2 = add(b, [sd * .8 * sk, 3.2 * sk, 3 * sk]); cap(cx, b, m2, 1 * sk, .65 * sk, P.AC, {}); cap(cx, m2, add(m2, [0, .8 * sk, 3.2 * sk]), .65 * sk, .12, P.AC, {}); }
        cap(cx, R([0, .4 * sk, 4.8 * sk]), R([0, 2.6 * sk, 5.8 * sk]), .8 * sk, .15, P.AC, {}); }
      cx.gid = 65; for (const sd of [-1, 1]) eye(cx, R([sd * 3 * sk, 1.2 * sk, .9 * sk]), sd, .62 * sk, P, o, !!s.eyeGlow);
      cx.pre = null;
    };
  }

  /* ---------------- stegosaur ---------------- */
  function stego(key, s){
    const P = palette(key, s), skin = skinOf(P, s), g = s.girth ?? 1, L = s.len ?? 1, LG = s.leg ?? 1;
    const H = 8 * LG, BL = 12 * L;
    return (cx, act, f, n) => {
      const o = motion(act, f, n), ph = o.ph, walk = o.walk;
      fallPre(cx, o, H);
      const T = p => [p[0], p[1] + o.bob * .5, p[2]];
      const hip = T([0, H + 6 * g, -BL * .3]), sho = T([0, H * .72 + 2 * g, BL * .5]), top = add(lerp3(hip, sho, .3), [0, 1.6 * g, 0]);
      for (const [sd, fr, off] of [[-1, 1, 0], [1, 1, Math.PI], [-1, -1, Math.PI], [1, -1, 0]]){
        const sw = walk ? Math.sin(ph + off) * .4 : 0, lift = walk ? Math.max(0, Math.cos(ph + off)) * 1.3 : 0, t0 = add(fr > 0 ? sho : hip, [sd * 3.8 * g, -2.2 * g, 0]);
        cx.gid = 20 + (sd > 0 ? 1 : 0) + (fr > 0 ? 2 : 0); pillarLeg(cx, P, skin, t0, t0[1] - .4, (fr > 0 ? 1.8 : 2.5) * g, sw, lift, sd, fr > 0); }
      // the arched body: highest over the hips
      cx.gid = 1; cap(cx, hip, top, 5.6 * g, 6.2 * g, P.SK, {step:.35, tex:skin('body', 0, .4)}); cx.gid = 2; cap(cx, top, sho, 6.2 * g, 4.4 * g, P.SK, {step:.35, tex:skin('body', .4, 1)});
      const tp = tail(cx, P, skin, add(hip, [0, -.4, -4 * g]), 16 * L, 3.8 * g, .5, o, {droop:5, rise:1, segs:9});
      // the thagomizer: two pairs of spikes near the tip, pointing out and back
      cx.gid = 55; const e = tp[tp.length - 2]; for (const [sd, up, k] of [[-1, .5, 0], [1, .5, 0], [-1, .9, 1], [1, .9, 1]]){ const b = lerp3(e, tp[tp.length - 1], k * .5); cap(cx, b, add(b, [sd * 4.2 * g, up * 3 * g, -2.4 * g]), .9 * g, .12, P.AC, {}); }
      // plates: two staggered rows along the back, biggest over the hips, each a kite-shaped sheet
      if (P.PL){ const N = 9; for (let i = 0; i < N; i++){ const k = i / (N - 1), along = k < .62 ? lerp3(tp[3], hip, k / .62) : lerp3(hip, sho, (k - .62) / .38 * .85), side = i % 2 ? 1 : -1;
        const h = (2.6 + Math.sin(Math.min(1, k * 1.25) * Math.PI) * 6.2) * g, w = h * .62, b = add(along, [side * 1.1 * g, (k < .62 ? 3.2 : 5.4) * g - (k < .62 ? (1 - k / .62) * 1.8 : 0), 0]);
        cx.gid = 70 + i; sheetFill(cx, t => add(b, [0, 0, (t - .5) * w]), t => add(b, [side * .25, h * (1 - Math.abs(t - .45) * 1.5), (t - .5) * w * .4 - h * .12]), .45 * g, P.PL, 7, (nn, t, u) => (u > .85 ? {dt:-1} : Math.abs(t - .5) < .06 ? {dt:1} : undefined)); } }
      // the small head, low and forward, on a short neck sloping down
      const hc = add(sho, [0, -2.6 * g + (o.atk ? [0, .4, -.8, 0][f] : 0), 6 * g + o.lun * .6]);
      cx.gid = 5; cap(cx, add(sho, [0, -.4, 3.6 * g]), add(hc, [0, .2, -1.6]), 3.2 * g, 1.8 * g, P.SK, {tex:skin('neck')});
      cx.gid = 60; ell(cx, hc, 1.9 * g, 1.6 * g, P.SK, {rz:2.4 * g, tex:skin('head')}); cap(cx, add(hc, [0, -.2, .8]), add(hc, [0, -.8 * g, 3.8 * g]), 1.5 * g, .9 * g, P.SK, {tex:skin('head')});
      cx.gid = 61; cap(cx, add(hc, [0, -1.2 * g, .6]), add(hc, [0, -1.4 * g - o.jaw * 1.2, 3.4 * g]), .8 * g, .5 * g, P.SK, {});
      cx.gid = 62; for (const sd of [-1, 1]) eye(cx, add(hc, [sd * 1.5 * g, .4 * g, .4]), sd, .45 * g, P, o, !!s.eyeGlow);
      cx.pre = null;
    };
  }

  /* ---------------- ankylosaur ---------------- */
  function ankylo(key, s){
    const P = palette(key, s), skin = skinOf(P, s), g = s.girth ?? 1, L = s.len ?? 1;
    const H = 5.2 * (s.leg ?? 1), BL = 11 * L;
    return (cx, act, f, n) => {
      const o = motion(act, f, n), ph = o.ph, walk = o.walk;
      fallPre(cx, o, H);
      const T = p => [p[0], p[1] + o.bob * .4, p[2]];
      const hip = T([0, H + 3.4 * g, -BL * .4]), sho = T([0, H + 3 * g, BL * .45]);
      for (const [sd, fr, off] of [[-1, 1, 0], [1, 1, Math.PI], [-1, -1, Math.PI], [1, -1, 0]]){
        const sw = walk ? Math.sin(ph + off) * .45 : 0, lift = walk ? Math.max(0, Math.cos(ph + off)) * 1.1 : 0, t0 = add(fr > 0 ? sho : hip, [sd * 5.6 * g, -2.4 * g, 0]);
        cx.gid = 20 + (sd > 0 ? 1 : 0) + (fr > 0 ? 2 : 0); pillarLeg(cx, P, skin, t0, t0[1] - .4, 2 * g, sw, lift, sd, fr > 0); }
      // a wide, low body: three chains side by side under one armoured back
      for (const x of [-3.4, 0, 3.4]){ cx.gid = 1 + (x > 0 ? 1 : 0); cap(cx, add(hip, [x * g, 0, 0]), add(sho, [x * g, 0, 0]), 4.4 * g, 4.2 * g, P.SK, {step:.35, tex:skin('body')}); }
      // studs: rows of bony scutes, and spikes along the flanks
      cx.gid = 3; for (let r = -3; r <= 3; r++) for (let i = 0; i < 7; i++){ const p = lerp3(hip, sho, i / 6), y = 4.2 * g * Math.cos(r / 3.6 * Math.PI * .5); ell(cx, add(p, [r * 1.9 * g, y - .3, (r % 2) * .8]), 1 * g, .75 * g, P.AC, {tex:() => ({dt:h3(r, i, 1) > .5 ? 1 : 0})}); }
      cx.gid = 4; for (const sd of [-1, 1]) for (let i = 0; i < 6; i++){ const p = lerp3(hip, sho, i / 5); cap(cx, add(p, [sd * 6.8 * g, -.6, 0]), add(p, [sd * (9 + (i % 2)) * g, -.2, -1.4 * g]), 1 * g, .12, P.AC, {}); }
      // tail ending in a bone club
      const tp = tail(cx, P, skin, add(hip, [0, 0, -4.6 * g]), 13 * L, 3.2 * g, 1, o, {droop:1, rise:.8, segs:8, sway:1.8});
      cx.gid = 56; const e = tp[tp.length - 1]; for (const sd of [-1, 1]) ell(cx, add(e, [sd * 2 * g, 0, -.6]), 2.4 * g, 2 * g, P.AC, {tex:() => ({dt:1})}); ell(cx, add(e, [0, .3, -1.6 * g]), 2 * g, 1.8 * g, P.AC, {});
      // a broad triangular head with horns at the back corners
      const hc = add(sho, [0, -1.4 * g + (o.atk ? [0, .4, -.8, 0][f] : 0), 5.4 * g + o.lun * .5]);
      cx.gid = 60; for (const sd of [-1, 1]) ell(cx, add(hc, [sd * 1.4 * g, 0, -.6]), 2.6 * g, 2.2 * g, P.SK, {tex:skin('head')}); cap(cx, hc, add(hc, [0, -.6, 3.4 * g]), 2.4 * g, 1.4 * g, P.SK, {tex:skin('head')});
      cx.gid = 61; for (const sd of [-1, 1]) cap(cx, add(hc, [sd * 3 * g, 1, -1.8 * g]), add(hc, [sd * 4.4 * g, 1.4, -3.2 * g]), .9 * g, .12, P.AC, {});
      cx.gid = 62; for (const sd of [-1, 1]) eye(cx, add(hc, [sd * 2.6 * g, .7 * g, .2]), sd, .45 * g, P, o, !!s.eyeGlow);
      cx.pre = null;
    };
  }

  /* ---------------- pterosaur ---------------- */
  function ptero(key, s){
    const P = palette(key, s), skin = skinOf(P, s), sz = s.size ?? 1, NK = s.neck ?? 1, BK = s.beak ?? 1;
    return (cx, act, f, n) => {
      const o = motion(act, f, n), ph = o.ph, walk = o.walk, fly = !walk && act !== 'die';
      const H = fly ? 14 * sz + Math.sin(ph) * 1.5 : 7 * sz;
      fallPre(cx, o, H);
      const hip = [0, H, -2 * sz], chest = [0, H + (fly ? 0 : 2.4 * sz), 3.4 * sz];
      // hind legs (hang when flying, plant when walking) and a short tail
      for (const sd of [-1, 1]){ cx.gid = 20 + (sd > 0 ? 1 : 0); const sw = walk ? Math.sin(ph + (sd > 0 ? Math.PI : 0)) * .45 : 0;
        const k = add(hip, rotX([sd * 1.4 * sz, -H * .48, fly ? -1.2 : .6], sw)), ft = add(k, rotX([0, -H * .48 + .5, fly ? -2 : .2], sw)); cap(cx, add(hip, [sd * 1.2 * sz, 0, 0]), k, 1.1 * sz, .7 * sz, P.SK, {}); cap(cx, k, ft, .7 * sz, .5 * sz, P.SK, {});
        for (const a of [-.3, 0, .3]) cap(cx, ft, add(ft, [Math.sin(a) * 1.2 * sz, -.2, Math.cos(a) * 1.2 * sz * (fly ? -1 : 1)]), .3 * sz, .1, P.CL, {}); }
      cx.gid = 1; cap(cx, hip, chest, 2.6 * sz, 3 * sz, P.SK, {tex:skin('body')}); cap(cx, hip, add(hip, [0, -.4, -2.6 * sz]), 1.4 * sz, .3, P.SK, {});
      // wings: skin from the long fourth finger back to the ankle; folded into walking struts on the ground
      for (const sd of [-1, 1]){ const root = add(chest, [sd * 2.2 * sz, .6 * sz, 0]);
        const w = wing(cx, P, root, sd, 20 * sz, o, {bone:sz, fold:!fly, lift:fly ? .2 : 0, fingers:[[.15, 1]], trail:add(hip, [sd * 1.4 * sz, -H * .45, -1])});
        if (!fly){ cx.gid = 25 + (sd > 0 ? 1 : 0); const sw = walk ? Math.sin(ph + (sd > 0 ? 0 : Math.PI)) * .4 : 0, hand = [w.wrist[0], .6, w.wrist[2] + 2 + sw * 2]; cap(cx, w.wrist, hand, .7 * sz, .5 * sz, P.WG, {}); } }
      // long neck and the big beaked head with its crest
      const nb = add(chest, [0, 1.4 * sz, 2 * sz]), hc = add(nb, [0, 4.4 * sz * NK + (o.atk ? [0, .8, -2, -.4][f] : 0), 3.6 * sz * NK + o.lun * .7]);
      cx.gid = 5; cap(cx, nb, hc, 1.7 * sz, 1.2 * sz, P.SK, {tex:skin('neck')});
      cx.gid = 60; ell(cx, hc, 1.9 * sz, 1.8 * sz, P.SK, {tex:skin('head')});
      const tip = add(hc, [0, -1.4 * sz, 9 * sz * BK]); cx.gid = 61; cap(cx, add(hc, [0, .2, 1]), tip, 1.4 * sz, .2, P.AC, {});
      cx.gid = 62; cap(cx, add(hc, [0, -1, .6]), add(tip, [0, -.6 - o.jaw * 3 * sz, -.6]), 1 * sz, .15, P.AC, {});
      if (P.CR){ cx.gid = 63; sheetFill(cx, t => add(hc, [0, 1.2 * sz, -.8 * sz + t * 2.4 * sz]), t => add(hc, [0, 1.2 * sz + (5.5 - t * 4) * sz, -(4.4 - t * 3) * sz]), .45 * sz, P.CR, 7); }   // the head crest, sweeping back
      cx.gid = 64; for (const sd of [-1, 1]) eye(cx, add(hc, [sd * 1.5 * sz, .5 * sz, .5]), sd, .5 * sz, P, o, !!s.eyeGlow);
      cx.pre = null;
    };
  }

  /* ---------------- dragon (four legs and two wings) / wyvern (two legs, the wings are its arms) ---------------- */
  function dragon(key, s, wyvern){
    const P = palette(key, s), skin = skinOf(P, s), g = s.girth ?? 1, L = s.len ?? 1, LG = s.leg ?? 1, span = 22 * (s.span ?? 1) * g;
    const H = (wyvern ? 11 : 9) * LG, BL = 11 * L, SP = mat(key, 'spine', s.spines || s.acc || '#2a2420');
    return (cx, act, f, n) => {
      const o = motion(act, f, n), ph = o.ph, walk = o.walk;
      fallPre(cx, o, H);
      const T = p => [p[0], p[1] + o.bob, p[2]];
      const hip = T([0, H + 1.6 * g, -BL * .4]), sho = T([0, H + (wyvern ? 2.4 : 1.8) * g, BL * .45]), mid = lerp3(hip, sho, .5);
      // hind legs: a big thigh, a backward ankle, clawed feet; fore legs: a lion's stride (dragon only)
      for (const sd of [-1, 1]){ const off = sd > 0 ? Math.PI : 0, sw = walk ? Math.sin(ph + off) * .5 : 0, lift = walk ? Math.max(0, Math.cos(ph + off)) * 1.8 : 0;
        const top = add(hip, [sd * 3.4 * g, -1, .4]), knee = add(top, rotX([sd * .3, -H * .45, H * .22], sw)), ank = add(knee, rotX([0, -H * .3, -H * .2], sw * .6)), ft = add(ank, rotX([0, -H * .25 + .6 + lift, H * .06], sw * .3));
        cx.gid = 20 + (sd > 0 ? 2 : 0); ell(cx, add(top, [sd * .3, -1.2, .2]), 3.4 * g, 4 * g, P.SK, {tex:skin('leg')}); cap(cx, top, knee, 3 * g, 1.9 * g, P.SK, {step:.4, tex:skin('leg')});
        cx.gid = 21 + (sd > 0 ? 2 : 0); cap(cx, knee, ank, 1.8 * g, 1.2 * g, P.SK, {tex:skin('leg')}); cap(cx, ank, ft, 1.2 * g, 1 * g, P.SK, {}); foot3(cx, P, ft, sd, Math.sqrt(g) * 1.1, false);
        if (!wyvern){ const sw2 = walk ? Math.sin(ph + off + Math.PI) * .5 : o.atk ? [0, -.6, .7, 0][f] * (sd > 0 ? 1 : .2) : 0, lift2 = walk ? Math.max(0, Math.cos(ph + off + Math.PI)) * 1.8 : 0;
          const t2 = add(sho, [sd * 3.6 * g, -2, .6]), el = add(t2, rotX([sd * .4, -H * .48, -.4], sw2)), pw = add(el, rotX([0, -H * .48 + .6 + lift2, .6], sw2 * 1.2));
          cx.gid = 24 + (sd > 0 ? 1 : 0); cap(cx, t2, el, 2.6 * g, 1.6 * g, P.SK, {tex:skin('leg')}); cap(cx, el, pw, 1.6 * g, 1.1 * g, P.SK, {}); foot3(cx, P, pw, sd, Math.sqrt(g), false); } }
      // body and the spined back
      cx.gid = 1; cap(cx, hip, mid, 4.6 * g, 5.4 * g, P.SK, {step:.35, tex:skin('body', 0, .5)}); cx.gid = 2; cap(cx, mid, sho, 5.4 * g, 4.6 * g, P.SK, {step:.35, tex:skin('body', .5, 1)});
      cx.gid = 3; for (let i = 0; i < 8; i++){ const p = lerp3(hip, sho, i / 7); cap(cx, add(p, [0, 4.6 * g, 0]), add(p, [0, (6.4 + (i % 2) * .6) * g, -1.6 * g]), .9 * g, .1, SP, {}); }
      // tail with spines and a spade-shaped tip
      const tp = tail(cx, P, skin, add(hip, [0, .6, -3.6 * g]), 24 * L, 3.8 * g, .35, o, {droop:2.5, rise:1.4, segs:11, sway:1.4});
      cx.gid = 53; for (let i = 1; i < tp.length - 2; i += 2) cap(cx, add(tp[i], [0, (3.8 - i * .3) * g, 0]), add(tp[i], [0, (4.8 - i * .3) * g, -1.2]), .6 * g, .1, SP, {});
      { const e = tp[tp.length - 1], d = sub(e, tp[tp.length - 2]), u = mul(d, 1 / (lenOf(d) || 1)); cx.gid = 54;
        sheetFill(cx, t => add(e, [(t - .5) * 5 * g, 0, 0]), t => add(e, [(t - .5) * 1.4 * g, 0, -2.8 * g * (1 - Math.abs(t - .5)) + u[2] * 2]), .5 * g, SP, 7); }
      // wings from the shoulders
      for (const sd of [-1, 1]){ const root = add(sho, [sd * 3 * g, 3.4 * g, wyvern ? 0 : -1.6]); wing(cx, P, root, sd, span, o, {bone:g * 1.15, lift:walk ? .1 : .4, fold:false, trail:add(mid, [sd * 3.4 * g, 2, -BL * .3])}); }
      // neck, S-curved, and the head
      const nb = add(sho, [0, 1.6 * g, 3.4 * g]), nm = add(nb, [0, 4.2 * (s.neck ?? 1), 2.6]), hc = add(nm, [0, 3.4 * (s.neck ?? 1) + (o.atk ? [0, .8, -2.4, -.6][f] : 0), 3.4 * g + o.lun * .8]);
      cx.gid = 5; cap(cx, nb, nm, 3.4 * g, 2.6 * g, P.SK, {step:.4, tex:skin('neck', 0, .5)}); cap(cx, nm, add(hc, [0, -.4, -2.2 * g]), 2.6 * g, 2.2 * g, P.SK, {step:.4, tex:skin('neck', .5, 1)});
      cx.gid = 6; for (let i = 0; i < 5; i++){ const p = lerp3(nb, hc, i / 5); cap(cx, add(p, [0, 2.6 * g, -.4]), add(p, [0, 3.6 * g, -1.6]), .6 * g, .1, SP, {}); }
      const sk = (s.skull ?? 1) * g, hd = jawHead(cx, P, s, sk * .85, hc, o, {snout:1.05, deep:.95, wide:1.05, pitch:(o.atk ? [0, -.2, .25, 0][f] : 0) + .05, skin});
      // horns: two long swept horns, and smaller cheek spikes
      cx.gid = 67; for (const sd of [-1, 1]){ const b = hd.R([sd * hd.w * .6, hd.deep * .9, -1.6 * sk]), m2 = add(b, [sd * 1 * sk, 1.6 * sk, -2.6 * sk]);
        cap(cx, b, m2, .9 * sk, .55 * sk, P.AC, {}); cap(cx, m2, add(m2, [sd * .4 * sk, (s.hornUp ?? 1.6) * sk, -2.4 * sk]), .55 * sk, .1, P.AC, {});
        cap(cx, hd.R([sd * hd.w * .9, -.3 * sk, -1.4 * sk]), hd.R([sd * hd.w * 1.5, -.4 * sk, -2.6 * sk]), .45 * sk, .1, SP, {}); }
      if (s.crown){ cx.gid = 69; for (let i = 0; i < 5; i++){ const a = (i / 4 - .5) * 1.6, b = hd.R([Math.sin(a) * hd.w * .6, hd.deep * 1.15, -.8 * sk + Math.cos(a) * .4]); cap(cx, b, add(b, [0, 1.6 * sk, 0]), .4 * sk, .12, M.gold, {}); } }
      cx.pre = null;
    };
  }

  const plans = {theropod, sauropod, ceratops, stego, ankylo, ptero, dragon:(k, s) => dragon(k, s, false), wyvern:(k, s) => dragon(k, s, true)};
  return {plans};
})();

/* monsters whose look names a body plan (look.plan) are built here; everything else goes on to gfx/beasts.js */
{ const _mk = BEAST.make;
  BEAST.make = function(key, spec){
    const plan = spec && DINO.plans[spec.plan];
    if (!plan) return _mk.call(this, key, spec);
    // sz: the animal's real size class relative to a hero (data/world4.js). The frame must hold the whole animal in
    // any of the 8 facings, so it is sized from how far the body reaches from its feet (tail tip, neck, wings)
    const scale = (spec.scale || 1) * (spec.sz || 1), L = spec.len || 1, reach = {theropod:30 * L, sauropod:44 * L, ceratops:24 * L, stego:26 * L, ankylo:22 * L, ptero:26 * (spec.size || 1), dragon:36 * L, wyvern:34 * L}[spec.plan] || 30;
    SPR.MOBS[key] = {name:key, fs:Math.max(spec.fs || 96, 96, Math.ceil(reach * 2.1 * scale)), scale, model:plan(key, spec)};
  }; }
