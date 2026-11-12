/* VAYRATHEN — js/sys/birds.js — (v161) real birds instead of little "v" marks
   · In the sky (by day, outdoors) flocks cross the land, each kind flying the way it really flies:
       นกยางขาว (cattle egret)  white, slow deep wingbeats, neck folded back, legs trailing; flies in a loose V over
                                water and open fields
       อีกา (house crow)         black, steady rowing wingbeats, two to four together
       นกนางแอ่น (barn swallow)  small, dark blue above and pale below, forked tail; quick flaps between glides and
                                sudden turns
       นกเอี้ยง (common myna)    brown with a black head, white wing patches flash as it flaps
     Birds flap for a while and then glide on spread wings; each casts a soft shadow on the ground far below.
   · On the ground, small groups of sparrows (นกกระจอก) and mynas peck and hop on open ground near you. Walk up to them,
     or let a monster come near, and they burst up and fly away from you, then new ones land somewhere else later.
   · None at night, in caves and dark lands; fewer on low graphics (but never none). Nothing blinks: wings move, nothing flashes.
   (The old flock of "v" marks in living.js is off.) */
'use strict';

const BIRDS = (() => {
  const SP = {
    egret:{len:13, span:30, hz:2.4, glide:.45, body:'#f4f1e8', shade:'#d8d2c2', wing:'#faf8f0', tip:'#e9e4d6', bill:'#e8b830', leg:'#3a3228', tail:'fan', neck:true, speed:62},
    crow:{len:11, span:24, hz:3.6, glide:.25, body:'#24221f', shade:'#121110', wing:'#2c2a27', tip:'#1a1917', bill:'#1a1917', tail:'fan', speed:70},
    swallow:{len:7.5, span:16, hz:7, glide:.5, body:'#1e2f5a', shade:'#14203f', wing:'#1b2a50', tip:'#111a33', belly:'#f0e6d6', bill:'#1a1917', tail:'fork', speed:110, weave:1},
    myna:{len:9, span:18, hz:5, glide:.3, body:'#6a4a32', shade:'#4a3222', wing:'#5a3e2a', tip:'#2a1e16', patch:'#f2efe8', head:'#1e1a18', bill:'#f0c020', tail:'fan', speed:80}
  };
  const GROUND = {
    sparrow:{len:5.2, body:'#8a6a48', back:'#6a4e32', belly:'#d8c8b0', head:'#7a5a3a', cap:'#5a4a3a', bill:'#3a3028', leg:'#7a5a46'},
    myna:{len:7, body:'#6a4a32', back:'#5a3e2a', belly:'#7a5a40', head:'#1e1a18', cap:'#1e1a18', bill:'#f0c020', leg:'#e0b030', eye:'#f0c020'}
  };
  const B = {sky:[], ground:[], up:[], skyT:5, gT:2, map:-1, lt:null};
  const lvl = () => Math.max(0, (typeof GFX !== 'undefined' ? GFX.fx : 1) - (typeof PERF !== 'undefined' && PERF.fps < 28 && PERF.fps > 0 ? 1 : 0));
  const biome = () => (MAP_ID && typeof BIOME !== 'undefined' && MAPS[MAP_ID] ? BIOME[MAPS[MAP_ID].biome] : null);
  const ok = () => { const b = biome(); return !(b && (b.fx === 'dark' || b.underwater)) && !(typeof isNight === 'function' && isNight()); };
  const R = (a, b) => a + Math.random() * (b - a);
  const kindsHere = () => { const b = biome() || {}, n = (MAP_ID && MAPS[MAP_ID] && MAPS[MAP_ID].biome) || '';
    if (/snow|ice|frost/.test(n)) return ['crow'];
    if (/desert|sand|ash|volcan|lava/.test(n)) return ['crow', 'crow', 'myna'];
    if (/swamp|marsh|river|lake|coast|beach|sea|paddy|field|plain/.test(n) || b.water) return ['egret', 'egret', 'swallow', 'crow'];
    return ['swallow', 'crow', 'myna', 'egret']; };

  /* ---------- a flock crossing the sky ---------- */
  function spawnFlock(){
    const ks = kindsHere(), k = ks[Math.floor(Math.random() * ks.length)], s = SP[k], dir = Math.random() < .5 ? 1 : -1;
    const n = k === 'egret' ? 3 + Math.floor(Math.random() * 5) : k === 'crow' ? 2 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 5);
    const y0 = cam.y + VH * R(.12, .7), ang = R(-.25, .25), vx = Math.cos(ang) * dir * s.speed * R(.9, 1.1), vy = Math.sin(ang) * s.speed;
    const x0 = dir > 0 ? cam.x - 80 : cam.x + VW + 80, z = R(90, 150);
    for (let i = 0; i < n; i++){
      // egrets in a loose V behind the leader, the others in a loose scatter
      const back = k === 'egret' ? Math.ceil(i / 2) * 18 : R(0, 40) + i * 8, side = k === 'egret' ? (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 13 : R(-22, 22);
      B.sky.push({k, s, x:x0 - Math.sign(vx) * back, y:y0 + side * .6, z:z + R(-8, 8), vx, vy, ph:R(0, 6), fl:R(.6, 2), gl:0, turn:0, sz:R(.92, 1.08)});
    }
  }
  function stepSky(dt){
    for (const b of B.sky){
      if (b.gl > 0){ b.gl -= dt; if (b.gl <= 0) b.fl = R(.7, 2.2); }
      else { b.fl -= dt; b.ph += dt * b.s.hz * Math.PI * 2; if (b.fl <= 0 && Math.random() < b.s.glide){ b.gl = R(.5, 1.4); } else if (b.fl <= 0) b.fl = R(.6, 1.6); }
      if (b.s.weave){ b.turn += dt; if (b.turn > .6){ b.turn = 0; const a = Math.atan2(b.vy, b.vx) + R(-.5, .5), sp = Math.hypot(b.vx, b.vy); b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp * .6; } }
      b.x += b.vx * dt; b.y += b.vy * dt; b.z += Math.sin(T * .9 + b.ph * .1) * dt * 3;
    }
    B.sky = B.sky.filter(b => b.x > cam.x - 300 && b.x < cam.x + VW + 300 && b.y > cam.y - 300 && b.y < cam.y + VH + 300);
  }
  /* one bird from above: body along its heading, wings swept by the flap (full span on the downstroke, folded on the
     upstroke), a fanned or forked tail, the head and bill in front */
  function drawFlyer(g, b, x, y){
    const s = b.s, k = b.sz, a = Math.atan2(b.vy * .6, b.vx), gliding = b.gl > 0, f = gliding ? .15 : Math.sin(b.ph);
    const span = s.span * k * (gliding ? 1 : .62 + .38 * Math.max(0, -Math.cos(b.ph))), lift = gliding ? -1 : f * 3.2, L = s.len * k;
    g.save(); g.translate(x, y); g.rotate(a);
    // wings (the far one a touch darker)
    for (const sd of [-1, 1]){
      const tipX = -L * .12 - span * .12, tipY = sd * span * .5, root = [L * .12, sd * L * .1], rootB = [-L * .22, sd * L * .1];
      g.fillStyle = sd < 0 ? s.shade : s.wing; g.beginPath(); g.moveTo(root[0], root[1]);
      g.quadraticCurveTo(L * .1, sd * span * .32 + lift * sd * -.4, tipX, tipY + lift * sd * -.6);
      g.quadraticCurveTo(-L * .3, sd * span * .3, rootB[0], rootB[1]); g.closePath(); g.fill();
      g.fillStyle = s.tip; g.beginPath(); g.moveTo(tipX, tipY + lift * sd * -.6); g.quadraticCurveTo(tipX + L * .1, sd * span * .4, tipX + L * .12, sd * span * .36); g.lineTo(tipX - L * .05, sd * span * .4); g.closePath(); g.fill();
      if (s.patch && !gliding){ g.fillStyle = s.patch; g.beginPath(); g.ellipse(-L * .02, sd * span * .3, L * .08, span * .05, 0, 0, 7); g.fill(); }
    }
    // tail
    g.fillStyle = s.shade; g.beginPath();
    if (s.tail === 'fork'){ g.moveTo(-L * .3, -L * .06); g.lineTo(-L * .95, -L * .26); g.lineTo(-L * .55, 0); g.lineTo(-L * .95, L * .26); g.lineTo(-L * .3, L * .06); }
    else { g.moveTo(-L * .3, -L * .08); g.lineTo(-L * .62, -L * .16); g.quadraticCurveTo(-L * .7, 0, -L * .62, L * .16); g.lineTo(-L * .3, L * .08); }
    g.closePath(); g.fill();
    // body, belly, head, bill
    g.fillStyle = s.body; g.beginPath(); g.ellipse(0, 0, L * .42, L * .13, 0, 0, 7); g.fill();
    if (s.belly){ g.fillStyle = s.belly; g.beginPath(); g.ellipse(L * .02, L * .04, L * .3, L * .06, 0, 0, 7); g.fill(); }
    const hx = s.neck ? L * .32 : L * .42;
    g.fillStyle = s.head || s.body; g.beginPath(); g.arc(hx, 0, L * .12, 0, 7); g.fill();
    g.fillStyle = s.bill; g.beginPath(); g.moveTo(hx + L * .1, -L * .03); g.lineTo(hx + L * (s.neck ? .34 : .22), 0); g.lineTo(hx + L * .1, L * .03); g.closePath(); g.fill();
    if (s.neck){ g.strokeStyle = s.leg; g.lineWidth = .8; g.beginPath(); g.moveTo(-L * .3, -L * .03); g.lineTo(-L * .78, -L * .05); g.moveTo(-L * .3, L * .03); g.lineTo(-L * .78, L * .05); g.stroke(); }
    g.restore();
  }

  /* ---------- small birds on the ground ---------- */
  function spawnGround(){
    const want = lvl() > 1 ? 2 : 1; if (B.ground.length >= want * 4) return;
    for (let t = 0; t < 12; t++){
      const x = cam.x + R(.1, .9) * VW, y = cam.y + R(.2, .9) * VH;
      if (Math.hypot(x - P.x, y - P.y) < 140) continue;
      if (typeof walkable === 'function' && !walkable(x, y, 10)) continue;
      if (mobs.some(m => !m.dead && Math.hypot(m.x - x, m.y - y) < 90)) continue;
      const k = Math.random() < .7 ? 'sparrow' : 'myna', n = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++){ const bx = x + R(-18, 18), by = y + R(-8, 8); if (typeof walkable === 'function' && !walkable(bx, by, 4)) continue;
        B.ground.push({k, s:GROUND[k], x:bx, y:by, f:Math.random() < .5 ? 1 : -1, st:'peck', t:R(.3, 1.5), hop:0, hx:0, hy:0, sz:R(.9, 1.1)}); }
      return;
    }
  }
  function stepGround(dt){
    for (const b of B.ground){
      // a threat near: take off
      const near = Math.hypot(P.x - b.x, P.y - b.y) < (P.moving ? 75 : 45) || mobs.some(m => !m.dead && m.moving && Math.hypot(m.x - b.x, m.y - b.y) < 60);
      if (near){ const d = Math.hypot(b.x - P.x, b.y - P.y) || 1, a = Math.atan2(b.y - P.y, b.x - P.x) + R(-.5, .5), s = SP[b.k === 'myna' ? 'myna' : 'swallow'];
        B.up.push({k:b.k, s:{...s, len:b.s.len * 1.6, span:b.s.len * 3.4, body:b.s.back, shade:b.s.back, wing:b.s.body, tip:b.s.cap, head:b.s.head, belly:b.s.belly, patch:b.k === 'myna' ? '#f2efe8' : null, tail:'fan', weave:0}, x:b.x, y:b.y, z:2, vz:R(70, 110), vx:Math.cos(a) * R(130, 170), vy:Math.sin(a) * R(80, 110), ph:R(0, 6), fl:9, gl:0, sz:1});
        b.gone = true; void d; continue; }
      b.t -= dt;
      if (b.st === 'hop'){ b.hop += dt / .22; b.x += b.hx * dt / .22; b.y += b.hy * dt / .22; if (b.hop >= 1){ b.hop = 0; b.st = 'peck'; b.t = R(.4, 1.6); } }
      else if (b.t <= 0){ const r = Math.random();
        if (r < .45){ b.st = 'hop'; b.hop = 0; const a = R(0, 6.28), d = R(4, 9); b.hx = Math.cos(a) * d; b.hy = Math.sin(a) * d * .5; if (typeof walkable === 'function' && !walkable(b.x + b.hx, b.y + b.hy, 3)){ b.hx = -b.hx; b.hy = -b.hy; } b.f = b.hx >= 0 ? 1 : -1; }
        else if (r < .75){ b.st = 'peck'; b.t = R(.5, 1.4); }
        else { b.st = 'look'; b.t = R(.6, 1.6); if (Math.random() < .5) b.f = -b.f; } }
    }
    B.ground = B.ground.filter(b => !b.gone && Math.abs(b.x - (cam.x + VW / 2)) < VW && Math.abs(b.y - (cam.y + VH / 2)) < VH);
    for (const b of B.up){ b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.vz = Math.max(20, b.vz - 40 * dt); b.ph += dt * 9 * Math.PI * 2; }
    B.up = B.up.filter(b => b.z < 260 && b.x > cam.x - 200 && b.x < cam.x + VW + 200 && b.y > cam.y - 250 && b.y < cam.y + VH + 200);
  }
  /* a small bird standing, seen from the side: body, tail up, head with bill, legs; pecking dips the head */
  function drawPercher(g, b, x, y){
    const s = b.s, L = s.len * b.sz, f = b.f, hop = b.st === 'hop' ? Math.sin(b.hop * Math.PI) * 3 : 0, peck = b.st === 'peck' ? Math.max(0, Math.sin(T * 9 + b.x)) : 0;
    g.fillStyle = 'rgba(0,0,0,.16)'; g.beginPath(); g.ellipse(x, y, L * .55, L * .18, 0, 0, 7); g.fill();
    g.save(); g.translate(x, y - hop); g.scale(f, 1);
    g.strokeStyle = s.leg; g.lineWidth = .7; g.beginPath(); g.moveTo(-L * .05, -L * .35); g.lineTo(-L * .08, 0); g.moveTo(L * .1, -L * .35); g.lineTo(L * .08, 0); g.stroke();
    g.fillStyle = s.back; g.beginPath(); g.moveTo(-L * .35, -L * .62); g.lineTo(-L * .85, -L * .9); g.lineTo(-L * .78, -L * .7); g.closePath(); g.fill();   // tail
    g.fillStyle = s.body; g.beginPath(); g.ellipse(0, -L * .55, L * .48, L * .3, -.15, 0, 7); g.fill();
    g.fillStyle = s.belly; g.beginPath(); g.ellipse(L * .08, -L * .45, L * .32, L * .16, -.1, 0, 7); g.fill();
    g.fillStyle = s.back; g.beginPath(); g.ellipse(-L * .08, -L * .62, L * .34, L * .17, -.2, 0, 7); g.fill();   // folded wing
    const hx = L * .42, hy = -L * .78 + peck * L * .5;
    g.fillStyle = s.head; g.beginPath(); g.arc(hx, hy, L * .2, 0, 7); g.fill();
    g.fillStyle = s.cap; g.beginPath(); g.arc(hx - L * .02, hy - L * .06, L * .15, Math.PI, 0); g.fill();
    g.fillStyle = s.bill; g.beginPath(); g.moveTo(hx + L * .16, hy - L * .04); g.lineTo(hx + L * .36, hy + L * .02 + peck * L * .08); g.lineTo(hx + L * .15, hy + L * .06); g.closePath(); g.fill();
    g.fillStyle = s.eye || '#101010'; g.beginPath(); g.arc(hx + L * .06, hy - L * .03, L * .045, 0, 7); g.fill();
    g.restore();
  }

  function step(){
    const now = T, dt = Math.min(.05, Math.max(0, now - (B.lt ?? now))); B.lt = now;
    if (B.map !== MAP_ID){ B.map = MAP_ID; B.sky = []; B.ground = []; B.up = []; }
    if (!dt) return;
    const L = Math.max(1, lvl()), go = ok();   // cheap enough to keep even on low graphics (fewer there)
    if (go){ B.skyT -= dt; if (B.skyT <= 0){ B.skyT = R(12, 26) / L; spawnFlock(); }
      B.gT -= dt; if (B.gT <= 0){ B.gT = R(6, 14); spawnGround(); } }
    else { B.ground = []; }
    stepSky(dt); stepGround(dt);
  }
  function drawGround(g){
    step();
    for (const b of B.ground){ const x = b.x - cam.x, y = b.y - cam.y; if (x < -20 || x > VW + 20 || y < -20 || y > VH + 20) continue; drawPercher(g, b, x, y); }
  }
  function drawSky(g){
    for (const list of [B.up, B.sky]) for (const b of list){
      const x = b.x - cam.x, y = b.y - cam.y; if (x < -60 || x > VW + 60 || y - b.z < -60 || y > VH + 80) continue;
      const sh = Math.min(.14, .05 + 6 / (b.z + 30));   // a soft shadow far below, fainter the higher it flies
      g.fillStyle = `rgba(0,0,0,${sh.toFixed(3)})`; g.beginPath(); g.ellipse(x + b.z * .18, y, b.s.span * .3 * b.sz, b.s.span * .1 * b.sz, 0, 0, 7); g.fill();
      drawFlyer(g, b, x, y - b.z);
    }
  }
  return {drawGround, drawSky, B};
})();
{ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g, ...a){ const r = _u.call(this, g, ...a); try { BIRDS.drawGround(g); } catch (e) {} return r; }; }
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a); try { BIRDS.drawSky(g); } catch (e) {} return r; }; }
