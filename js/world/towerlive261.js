/* VAYRATHEN — js/world/towerlive261.js — (v261) the tower's halls come alive
   The owner: the tower's objects looked flat and did not belong together — "the fire in the tower should be real
   fire". Now, on every tower floor:
   · FIRE: the braziers burn — layered flame tongues that flicker every frame (each brazier on its own rhythm), a
     white-hot core, a soft glow, sparks rising and fading, and a pool of firelight on the floor that breathes with it.
     The flames sort with everything else, so a hero in front of a brazier stands in front of its fire.
   · VOLUME: square pillars and pedestals have a lit front, a darker side face and a lit top, and a cast shadow.
   · CRYSTALS pulse with their zone's light and shed small sparkles; the GATE at the back shimmers (bands of light
     drifting up the doorway, motes rising); MIST drifts slowly round the platform's edge.
   · LIGHT: each zone has its own dimness (the cursed forest and the demon kingdom darkest, the gods' land brightest);
     the darkness is lifted round every flame, crystal and the gate, and the screen's edges fall into a soft vignette. */
'use strict';
const TWL = {sparks:[], seed:1, dark:[.1, .34, .28, .3, .04, .18]};
const twlOn = () => typeof twmOn === 'function' && twmOn();
const twlH = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const twlProps = type => (twlOn() ? PROPS.filter(p => p.type === type) : []);
const TWL_FIRE_Y = 52;   // the bowl's rim above the brazier's foot

/* ---------- volume: pillars and pedestals with a lit front, a dark side and a top ---------- */
PROP_TYPES.twpillar = (seed, v = 0) => { const T0 = TWM_TIERS[v % TWM_TIERS.length];
  return makeProp({w:70, h:176, ax:32, ay:166, seed, shadow:[26, 8, 6], collide:20, paint(g){
    const side = (x, y0, y1, d, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + d, y0 - d * .5); g.lineTo(x + d, y1 - d * .5); g.lineTo(x, y1); g.closePath(); g.fill(); };
    const top = (x0, x1, y, d, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.lineTo(x1 + d, y - d * .5); g.lineTo(x0 + d, y - d * .5); g.closePath(); g.fill(); };
    // base block
    g.fillStyle = T0.wall[0]; g.fillRect(-24, -18, 48, 18); side(24, -18, 0, 7, T0.wall[1]); top(-24, 24, -18, 7, 'rgba(255,255,255,.35)'); g.fillStyle = T0.acc; g.fillRect(-24, -18, 48, 3);
    // shaft: lit front, darker side, coursed stone
    const gr = g.createLinearGradient(-18, 0, 18, 0); gr.addColorStop(0, T0.wall[0]); gr.addColorStop(.25, '#ffffff22'); gr.addColorStop(.6, T0.wall[0]); gr.addColorStop(1, T0.wall[1]);
    g.fillStyle = T0.wall[0]; g.fillRect(-18, -142, 36, 124); g.fillStyle = gr; g.globalAlpha = .55; g.fillRect(-18, -142, 36, 124); g.globalAlpha = 1;
    side(18, -142, -18, 7, T0.wall[1]); g.fillStyle = 'rgba(0,0,0,.18)'; side(18, -142, -18, 7, 'rgba(0,0,0,.2)');
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; for (let y = -134; y < -18; y += 16){ g.beginPath(); g.moveTo(-18, y); g.lineTo(18, y); g.lineTo(25, y - 3.5); g.stroke(); }
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-18, -142, 3, 124);                                                           // the shadow edge on the left
    // gold bands that wrap round the side too
    for (const y of [-42, -102]){ g.fillStyle = T0.acc; g.fillRect(-20, y, 40, 8); side(20, y, y + 8, 7, T0.rim); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(-20, y, 40, 1.5); g.fillStyle = T0.carpet; g.fillRect(-4, y + 1.5, 8, 5); }
    // capital with a lit top
    g.fillStyle = T0.wall[0]; g.fillRect(-25, -156, 50, 14); side(25, -156, -142, 7, T0.wall[1]); g.fillStyle = T0.acc; g.fillRect(-27, -160, 54, 4); side(27, -160, -156, 7, T0.rim);
    top(-27, 27, -160, 7, 'rgba(255,255,255,.4)'); }}); };
PROP_TYPES.twbrazier = (seed, v = 0) => { const T0 = TWM_TIERS[v % TWM_TIERS.length];
  return makeProp({w:52, h:66, ax:24, ay:60, seed, shadow:[16, 5, 3], collide:12, glow:[0, -60, 70], paint(g){
    const side = (x, y0, y1, d, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + d, y0 - d * .5); g.lineTo(x + d, y1 - d * .5); g.lineTo(x, y1); g.closePath(); g.fill(); };
    g.fillStyle = T0.wall[0]; g.fillRect(-13, -38, 26, 38); side(13, -38, 0, 6, T0.wall[1]); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(-13, -38, 3, 38);
    g.fillStyle = T0.acc; g.fillRect(-15, -40, 30, 4); side(15, -40, -36, 6, T0.rim); g.fillRect(-15, -4, 30, 4);
    // the bowl (the fire itself is alive, drawn every frame)
    g.fillStyle = T0.rim; g.beginPath(); g.moveTo(-16, -42); g.lineTo(16, -42); g.lineTo(11, -52); g.lineTo(-11, -52); g.closePath(); g.fill();
    g.fillStyle = T0.acc; g.beginPath(); g.moveTo(-15, -43); g.lineTo(15, -43); g.lineTo(12, -48); g.lineTo(-12, -48); g.closePath(); g.fill();
    g.fillStyle = '#2a1408'; g.beginPath(); g.ellipse(0, -52, 11, 3, 0, 0, 7); g.fill();
    g.fillStyle = '#ff6a1a'; for (let i = 0; i < 7; i++){ g.beginPath(); g.arc(-8 + i * 2.7, -52 + (i % 2) * .8, 1.6, 0, 7); g.fill(); } }}); };   // glowing coals

/* ---------- real fire ---------- */
function twlFlame(g, x, y, ph, s = 1){
  const t = T * 1.0 + ph, f1 = Math.sin(t * 9.1) * .5 + Math.sin(t * 13.7 + 1.3) * .3 + Math.sin(t * 23.3) * .2, h = (22 + f1 * 5) * s, w = 9 * s;
  g.save(); g.globalCompositeOperation = 'lighter';
  // the halo
  const hg = g.createRadialGradient(x, y - h * .45, 1, x, y - h * .45, h * 1.6); hg.addColorStop(0, 'rgba(255,150,50,.3)'); hg.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = hg; g.beginPath(); g.arc(x, y - h * .45, h * 1.6, 0, 7); g.fill();
  g.globalCompositeOperation = 'source-over';   // the body in its own colours (added light turned to a white blob on the pale halls)
  // three tongues, each leaning and licking on its own
  for (let k = 0; k < 3; k++){ const kk = k - 1, lean = Math.sin(t * 5.3 + k * 2.1) * 3 * s + kk * 3 * s, th = h * (k === 1 ? 1 : .72 + Math.sin(t * 7 + k) * .08), tw = w * (k === 1 ? 1 : .7);
    const gr = g.createLinearGradient(0, y, 0, y - th); gr.addColorStop(0, 'rgba(255,236,150,.98)'); gr.addColorStop(.3, 'rgba(255,160,40,.95)'); gr.addColorStop(.7, 'rgba(225,70,20,.75)'); gr.addColorStop(1, 'rgba(150,30,10,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x + kk * 4 * s - tw, y);
    g.bezierCurveTo(x + kk * 4 * s - tw * 1.1, y - th * .45, x + lean - tw * .3, y - th * .7, x + lean, y - th);
    g.bezierCurveTo(x + lean + tw * .3, y - th * .7, x + kk * 4 * s + tw * 1.1, y - th * .45, x + kk * 4 * s + tw, y); g.closePath(); g.fill(); }
  g.globalCompositeOperation = 'lighter';
  // the white-hot core
  const cg = g.createRadialGradient(x, y - 4 * s, 1, x, y - 4 * s, 8 * s); cg.addColorStop(0, 'rgba(255,255,220,.7)'); cg.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = cg; g.beginPath(); g.ellipse(x, y - 4 * s, 5 * s, 7 * s, 0, 0, 7); g.fill();
  g.restore();
}
/* sparks: born at the flames, rising and fading */
EV.on('tick', dt => {
  if (!twlOn()){ TWL.sparks.length = 0; return; }
  for (const p of twlProps('twbrazier')) if (Math.random() < dt * 6) TWL.sparks.push({x:p.x + (Math.random() - .5) * 10, y:p.y - TWL_FIRE_Y - 10, vx:(Math.random() - .5) * 14, vy:-30 - Math.random() * 40, life:1, c:Math.random() < .5 ? '255,200,90' : '255,120,40'});
  for (const p of twlProps('twcrystal')) if (Math.random() < dt * 2.5) TWL.sparks.push({x:p.x + (Math.random() - .5) * 30, y:p.y - 30 - Math.random() * 60, vx:0, vy:-10 - Math.random() * 10, life:1, c:twmT().glow, star:true});
  for (const s of TWL.sparks){ s.x += s.vx * dt + Math.sin(T * 3 + s.y * .05) * dt * 8; s.y += s.vy * dt; s.life -= dt * (s.star ? .6 : .9); }
  if (TWL.sparks.length > 400) TWL.sparks.splice(0, TWL.sparks.length - 400);
  for (let i = TWL.sparks.length - 1; i >= 0; i--) if (TWL.sparks[i].life <= 0) TWL.sparks.splice(i, 1);
});
// the flames sort with the hall: drawn right after their brazier
{ const _e = LIVE.ents; LIVE.ents = function(list, g){ _e.apply(this, arguments); if (!twlOn()) return;
    for (const p of twlProps('twbrazier')){ const ph = twlH(p.x * .13 + p.y * .07) * 20; list.push({y:p.y + .4, f:() => twlFlame(g, p.x - cam.x, p.y - cam.y - TWL_FIRE_Y, ph, 1)}); }
    // the gate's shimmer, behind whatever stands in front of it
    const st = twmStairs(), T0 = twmT(); if (!T0.throne) list.push({y:st.y - 70, f:() => twlGate(g, st.x - cam.x, st.y - 60 - cam.y, T0)}); }; }
function twlGate(g, x, gy, T0){
  g.save(); g.beginPath(); g.moveTo(x - 40, gy); g.lineTo(x - 40, gy - 96); g.quadraticCurveTo(x, gy - 140, x + 40, gy - 96); g.lineTo(x + 40, gy); g.closePath(); g.clip();
  g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 5; k++){ const yy = gy - ((T * 30 + k * 28) % 140); const gr = g.createLinearGradient(0, yy - 14, 0, yy + 14); gr.addColorStop(0, `rgba(${T0.glow},0)`); gr.addColorStop(.5, `rgba(${T0.glow},.35)`); gr.addColorStop(1, `rgba(${T0.glow},0)`); g.fillStyle = gr; g.fillRect(x - 40, yy - 14, 80, 28); }
  for (let k = 0; k < 10; k++){ const ph = k * 1.7, yy = gy - ((T * 24 + k * 15) % 130), xx = x + Math.sin(T * 1.3 + ph) * 26; g.fillStyle = `rgba(255,255,255,${.5 * (1 - (gy - yy) / 130)})`; g.beginPath(); g.arc(xx, yy, 1.4, 0, 7); g.fill(); }
  const p = .5 + Math.sin(T * 2) * .2, cg = g.createRadialGradient(x, gy - 50, 4, x, gy - 50, 70); cg.addColorStop(0, `rgba(${T0.glow},${.35 * p})`); cg.addColorStop(1, `rgba(${T0.glow},0)`); g.fillStyle = cg; g.fillRect(x - 40, gy - 140, 80, 140);
  g.restore();
}

/* ---------- under the hall's things: firelight on the floor, crystal glow, drifting mist ---------- */
{ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g, ...a){ const r = _u.call(this, g, ...a); if (!twlOn()) return r;
    const T0 = twmT(), c = twmC();
    // mist drifting round the platform (outside its edge)
    g.save(); g.beginPath(); g.rect(cam.x - cam.x - 400, -400, VW + 800, VH + 800); twzPath(g, twzOct(c, TWM_RX, TWM_RY).map(([x, y]) => [x - cam.x, y - cam.y])); g.clip('evenodd');
    for (let i = 0; i < 14; i++){ const a = i / 14 * 6.283 + T * .03 * (i % 2 ? 1 : -1), rx = TWM_RX * (1.05 + twlH(i) * .3), ry = TWM_RY * (1.1 + twlH(i + 9) * .35), x = c.x + Math.cos(a) * rx - cam.x, y = c.y + Math.sin(a) * ry - cam.y + 60;
      const m = g.createRadialGradient(x, y, 10, x, y, 160); m.addColorStop(0, `rgba(${T0.glow},.12)`); m.addColorStop(1, `rgba(${T0.glow},0)`); g.fillStyle = m; g.beginPath(); g.ellipse(x, y, 180, 60, 0, 0, 7); g.fill(); }
    g.restore();
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const p of twlProps('twbrazier')){ const ph = twlH(p.x * .13 + p.y * .07) * 20, fl = .75 + Math.sin((T + ph) * 9.1) * .12 + Math.sin((T + ph) * 13.7) * .08, x = p.x - cam.x, y = p.y - cam.y;
      const lp = g.createRadialGradient(x, y, 4, x, y, 120 * fl); lp.addColorStop(0, `rgba(255,170,70,${.32 * fl})`); lp.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = lp; g.beginPath(); g.ellipse(x, y, 130 * fl, 70 * fl, 0, 0, 7); g.fill(); }
    for (const p of twlProps('twcrystal')){ const pu = .7 + Math.sin(T * 2.2 + p.x * .01) * .3, x = p.x - cam.x, y = p.y - cam.y;
      const lp = g.createRadialGradient(x, y, 4, x, y, 100); lp.addColorStop(0, `rgba(${T0.glow},${.3 * pu})`); lp.addColorStop(1, `rgba(${T0.glow},0)`); g.fillStyle = lp; g.beginPath(); g.ellipse(x, y, 100, 50, 0, 0, 7); g.fill(); }
    g.restore();
    return r; }; }

/* ---------- over everything: sparks, crystal pulse, and the zone's light ---------- */
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a); if (!twlOn()) return r;
    const T0 = twmT();
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const s of TWL.sparks){ const x = s.x - cam.x, y = s.y - cam.y; if (x < -20 || y < -20 || x > VW + 20 || y > VH + 20) continue;
      g.fillStyle = `rgba(${s.c},${Math.max(0, s.life) * (s.star ? .9 : .85)})`; if (s.star){ g.fillRect(x - .6, y - 2.4, 1.2, 4.8); g.fillRect(x - 2.4, y - .6, 4.8, 1.2); } else { g.beginPath(); g.arc(x, y, 1.3, 0, 7); g.fill(); } }
    for (const p of twlProps('twcrystal')){ const pu = .5 + Math.sin(T * 2.2 + p.x * .01) * .5, x = p.x - cam.x, y = p.y - cam.y - 60; const cg = g.createRadialGradient(x, y, 2, x, y, 46); cg.addColorStop(0, `rgba(${T0.glow},${.35 * pu})`); cg.addColorStop(1, `rgba(${T0.glow},0)`); g.fillStyle = cg; g.beginPath(); g.arc(x, y, 46, 0, 7); g.fill(); }
    g.restore();
    twlLight(g, T0);
    return r; }; }
/* the zone's dimness, lifted round every light, and a soft vignette */
function twlLight(g, T0){
  const d = TWL.dark[TWM.tier] || 0; const W0 = Math.ceil(VW / 4), H0 = Math.ceil(VH / 4);
  const cv2 = TWL.cv || (TWL.cv = document.createElement('canvas')); if (cv2.width !== W0 || cv2.height !== H0){ cv2.width = W0; cv2.height = H0; }
  const c = cv2.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W0, H0);
  if (d > 0){ c.fillStyle = `rgba(6,4,14,${d})`; c.fillRect(0, 0, W0, H0); c.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, k) => { const gx = (x - cam.x) / 4, gy = (y - cam.y) / 4, rr = r / 4; if (gx < -rr || gy < -rr || gx > W0 + rr || gy > H0 + rr) return; const gr = c.createRadialGradient(gx, gy, 1, gx, gy, rr); gr.addColorStop(0, `rgba(0,0,0,${k})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.beginPath(); c.arc(gx, gy, rr, 0, 7); c.fill(); };
    for (const p of twlProps('twbrazier')){ const ph = twlH(p.x * .13 + p.y * .07) * 20; hole(p.x, p.y - 40, 190 + Math.sin((T + ph) * 9.1) * 12, .95); }
    for (const p of twlProps('twcrystal')) hole(p.x, p.y - 50, 150, .8);
    const st = twmStairs(); hole(st.x, st.y - 90, 230, .9); hole(P.x, P.y - 20, 130, .55); }
  c.globalCompositeOperation = 'source-over';
  const v = c.createRadialGradient(W0 / 2, H0 / 2, Math.min(W0, H0) * .35, W0 / 2, H0 / 2, Math.max(W0, H0) * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = v; c.fillRect(0, 0, W0, H0);
  g.save(); g.imageSmoothingEnabled = true; g.drawImage(cv2, 0, 0, W0 * 4, H0 * 4); g.restore();
}
