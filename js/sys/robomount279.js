/* VAYRATHEN — js/sys/robomount279.js — (v279) robot fashion mounts, sold for Vayra Coins
   The owner asked for real robots to ride: four machines, drawn in the game's own canvas (no pictures needed), each
   walking or flying with the rider on top. They are wardrobe mounts like the others: bought in the Coin Shop
   (แฟชั่น → พาหนะ), account-wide, worn from the wardrobe, shown while riding (R), seen by other players.
   A worn fashion mount also counts as owning a mount (mount279.js), so it can be ridden without the Golden Deer.
     ม้าเหล็กจักรกล  Mech Steed     four steel legs at a trot, a visor head, glowing joints
     เสือจักรกล      Mecha Tiger    a low armoured cat, striped plates, a jaw that glows
     หุ่นเดินสองขา   Bipedal Walker a cockpit deck on two stomping legs, shoulder cannons, a scanning lamp
     มังกรเหล็ก      Iron Dragon    flies: beating plated wings, a segmented tail, thrusters under its belly
   Loaded before coinshop274.js so the shop prices them with the rest. */
'use strict';

const ROBO_MOUNTS = [
  ['rb_m_steed', 'ม้าเหล็กจักรกล', 'Mech Steed', 'robosteed', 18, ['#c9d3de', '#38e1ff'], {}, 180],
  ['rb_m_tiger', 'เสือจักรกล', 'Mecha Tiger', 'robotiger', 16, ['#f0a020', '#ff4a2a'], {}, 200],
  ['rb_m_walker', 'หุ่นเดินสองขา', 'Bipedal Walker', 'robowalker', 24, ['#7a8696', '#ffd23a'], {}, 220],
  ['rb_m_dragon', 'มังกรเหล็ก', 'Iron Dragon', 'robodragon', 26, ['#5a6a8a', '#ff5ad0'], {}, 260]];
for (const [id, th, en, kind, lift, c, more, price] of ROBO_MOUNTS){ const m = {slot:'mount', th, en, kind, lift, c, price:{c:price}, robot:1, ...more}; XMOUNT[id] = m; XCOS[id] = m; }

const RB = {
  lg(g, x0, y0, x1, y1, cols){ const gr = g.createLinearGradient(x0, y0, x1, y1); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); return gr; },
  glow(g, x, y, r, col, a){ g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore(); },
  joint(g, x, y, r, col, t){ g.fillStyle = '#20252e'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = col; g.globalAlpha = .7 + .3 * Math.sin(t * 6 + x); g.beginPath(); g.arc(x, y, r * .5, 0, 7); g.fill(); g.globalAlpha = 1; },
  /* a leg in two parts from (hx,hy) down to the ground at gy; ph = step phase; back = knee bends backwards */
  leg(g, hx, hy, gy, ph, w, cols, accent, t, back){ const lift = Math.max(0, Math.sin(ph)) * 3.2, fx = hx + Math.cos(ph) * 3.4, fy = gy - lift, kx = (hx + fx) / 2 + (back ? -3 : 3), ky = (hy + fy) / 2 - 1;
    g.lineCap = 'round'; g.strokeStyle = '#1c2028'; g.lineWidth = w + 1.6; g.beginPath(); g.moveTo(hx, hy); g.lineTo(kx, ky); g.lineTo(fx, fy); g.stroke();
    g.strokeStyle = RB.lg(g, hx - w, 0, hx + w, 0, cols); g.lineWidth = w; g.beginPath(); g.moveTo(hx, hy); g.lineTo(kx, ky); g.lineTo(fx, fy); g.stroke();
    RB.joint(g, kx, ky, w * .62, accent, t); g.fillStyle = '#2a303a'; g.beginPath(); g.roundRect(fx - w * .9, fy - 1.4, w * 1.8, 2.6, 1); g.fill(); },
  face(dir){ const fl = dir === 2 || dir === 1 || dir === 3 ? -1 : 1, side = dir === 2 || dir === 6; return {fl, sx:side ? 1 : dir === 0 || dir === 4 ? .62 : .82}; }
};

/* a four-legged robot (steed or tiger) under the rider; by = where the rider's feet are, the ground is lift below */
function roboQuad(g, M, x, by, dir, t, moving, cat){
  const [c0, c1] = M.c, L = M.lift, {fl, sx} = RB.face(dir), sp = moving ? t * 11 : t * 1.2, amp = moving ? 1 : .15;
  g.save(); g.translate(x, by); g.scale(fl * sx, 1);
  const bw = cat ? 19 : 16, bt = cat ? 3 : 1, bb = cat ? 10 : 9, bob = moving ? Math.abs(Math.sin(sp)) * -1.2 : Math.sin(t * 2) * .4;
  g.translate(0, bob);
  const cols = ['#5a6472', c0, '#3a424e'], legs = [[-bw + 4, Math.PI], [bw - 5, 0], [-bw + 7, 0], [bw - 2, Math.PI]];
  // far legs first (darker), then the body, then the near legs
  g.globalAlpha = .75; for (const [lx, p0] of legs.slice(2)) RB.leg(g, lx, bb - 2, L - bob, sp * amp + p0 + .9, cat ? 3.4 : 3, ['#3a424e', '#59636f', '#2a303a'], c1, t, lx < 0); g.globalAlpha = 1;
  // tail
  g.strokeStyle = '#2a303a'; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(-bw, bt + 2);
  if (cat) g.bezierCurveTo(-bw - 8, bt - 2, -bw - 12, bt - 10 + Math.sin(t * 3) * 2, -bw - 7, bt - 14 + Math.sin(t * 3) * 2);
  else { g.quadraticCurveTo(-bw - 7, bt + 3, -bw - 8, bt + 11 + Math.sin(sp) * 1.5); }
  g.stroke(); g.strokeStyle = c1; g.lineWidth = .9; g.stroke();
  // body: armoured hull with a saddle plate and panel lines
  g.beginPath(); g.roundRect(-bw, bt, bw * 2, bb - bt + 3, cat ? 6 : 5); g.fillStyle = RB.lg(g, 0, bt, 0, bb + 3, ['#ffffff', c0, '#4a525e']); g.fill(); g.strokeStyle = '#1c2028'; g.lineWidth = .9; g.stroke();
  g.fillStyle = '#2a303a'; g.beginPath(); g.roundRect(-7, bt - 1.6, 13, 3.2, 1.4); g.fill(); g.fillStyle = c1; g.fillRect(-5, bt - .7, 9, 1.2);
  g.strokeStyle = 'rgba(20,24,32,.55)'; g.lineWidth = .6; for (const px of [-bw + 6, -2, bw - 8]){ g.beginPath(); g.moveTo(px, bt + 1); g.lineTo(px + 1.5, bb + 2); g.stroke(); }
  if (cat){ g.fillStyle = '#1c2028'; for (const px of [-12, -5, 2, 9]){ g.beginPath(); g.moveTo(px, bt); g.lineTo(px + 3, bt); g.lineTo(px + 1, bb + 1); g.lineTo(px - 1.5, bb + 1); g.closePath(); g.fill(); } }
  g.fillStyle = c1; g.globalAlpha = .55 + .4 * Math.sin(t * 4); g.fillRect(-bw + 3, bb, bw * 2 - 6, 1); g.globalAlpha = 1;
  for (const rx of [-bw + 2.5, bw - 2.5]){ g.fillStyle = '#d8dee6'; g.beginPath(); g.arc(rx, bt + 2.5, .8, 0, 7); g.fill(); }
  // head and neck
  if (cat){ const hx = bw + 4, hy = bt + 1;
    g.beginPath(); g.moveTo(hx - 6, hy - 4); g.lineTo(hx + 8, hy - 4); g.lineTo(hx + 11, hy + 1); g.lineTo(hx + 8, hy + 6); g.lineTo(hx - 4, hy + 7); g.closePath();
    g.fillStyle = RB.lg(g, 0, hy - 4, 0, hy + 7, ['#ffffff', c0, '#4a525e']); g.fill(); g.strokeStyle = '#1c2028'; g.lineWidth = .9; g.stroke();
    for (const ex of [hx - 4, hx + 1]){ g.fillStyle = '#2a303a'; g.beginPath(); g.moveTo(ex, hy - 4); g.lineTo(ex + 2, hy - 9); g.lineTo(ex + 4, hy - 4); g.closePath(); g.fill(); }
    g.fillStyle = c1; g.shadowColor = c1; g.shadowBlur = 6; g.fillRect(hx + 3, hy - 2, 4, 1.6); g.shadowBlur = 0;
    const jaw = moving ? (Math.sin(t * 5) + 1) * .8 : .3; g.fillStyle = '#1c2028'; g.beginPath(); g.moveTo(hx + 1, hy + 4); g.lineTo(hx + 10, hy + 2 + jaw); g.lineTo(hx + 8, hy + 6 + jaw); g.closePath(); g.fill();
    RB.glow(g, hx + 7, hy + 4, 5, c1, .5);
  } else { const nx = bw - 2, ny = bt + 1;
    g.beginPath(); g.moveTo(nx - 2, ny + 3); g.lineTo(nx + 5, ny - 9); g.lineTo(nx + 9, ny - 8); g.lineTo(nx + 5, ny + 4); g.closePath(); g.fillStyle = RB.lg(g, nx, 0, nx + 9, 0, ['#4a525e', c0, '#ffffff']); g.fill(); g.strokeStyle = '#1c2028'; g.lineWidth = .8; g.stroke();
    g.beginPath(); g.moveTo(nx + 3, ny - 13); g.lineTo(nx + 14, ny - 10); g.lineTo(nx + 15, ny - 6); g.lineTo(nx + 7, ny - 5); g.closePath(); g.fillStyle = RB.lg(g, 0, ny - 13, 0, ny - 5, ['#ffffff', c0, '#5a6472']); g.fill(); g.stroke();
    g.fillStyle = '#2a303a'; g.beginPath(); g.moveTo(nx + 4, ny - 13); g.lineTo(nx + 5, ny - 17); g.lineTo(nx + 7, ny - 12.5); g.closePath(); g.fill();
    g.fillStyle = c1; g.shadowColor = c1; g.shadowBlur = 6; g.fillRect(nx + 7, ny - 10.5, 6, 1.6); g.shadowBlur = 0;
    g.strokeStyle = c1; g.lineWidth = 1.1; g.globalAlpha = .8; g.beginPath(); for (let i = 0; i < 4; i++){ g.moveTo(nx + 1 + i * 1.4, ny - 10 + i * 2.4); g.lineTo(nx - 2 + i * 1.4, ny - 8 + i * 2.4 + Math.sin(t * 6 + i)); } g.stroke(); g.globalAlpha = 1;   // a mane of light
  }
  for (const [lx, p0] of legs.slice(0, 2)) RB.leg(g, lx, bb - 1, L - bob, sp * amp + p0, cat ? 3.8 : 3.4, cols, c1, t, lx < 0);
  if (moving) for (let i = 0; i < 3; i++){ const ph = (t * 2 + i / 3) % 1; g.fillStyle = `rgba(200,210,220,${.5 * (1 - ph)})`; g.beginPath(); g.arc(-bw - 4 - ph * 12, L - bob - 1 - ph * 3, 1.5 + ph * 2.5, 0, 7); g.fill(); }
  g.restore();
}

Object.assign(MOUNT_X, {
  robosteed(g, M, x, by, dir, t, moving){ roboQuad(g, M, x, by, dir, t, moving, false); },
  robotiger(g, M, x, by, dir, t, moving){ roboQuad(g, M, x, by, dir, t, moving, true); },
  robowalker(g, M, x, by, dir, t, moving){ const [c0, c1] = M.c, L = M.lift, {fl, sx} = RB.face(dir), sp = moving ? t * 7 : 0, bob = moving ? Math.abs(Math.sin(sp)) * -1.6 : Math.sin(t * 2) * .5;
    g.save(); g.translate(x, by + bob); g.scale(fl * sx, 1);
    const cols = ['#4a525e', c0, '#2a303a'];
    g.globalAlpha = .8; RB.leg(g, -7, 10, L - bob, sp + Math.PI, 4.2, ['#3a424e', '#5a6472', '#2a303a'], c1, t, true); g.globalAlpha = 1;
    // hip block and the deck the rider stands on
    g.fillStyle = '#2a303a'; g.beginPath(); g.roundRect(-8, 5, 16, 7, 2); g.fill();
    g.beginPath(); g.moveTo(-15, 0); g.lineTo(15, 0); g.lineTo(12, 7); g.lineTo(-12, 7); g.closePath(); g.fillStyle = RB.lg(g, 0, 0, 0, 7, ['#ffffff', c0, '#4a525e']); g.fill(); g.strokeStyle = '#1c2028'; g.lineWidth = .9; g.stroke();
    g.fillStyle = '#ffd23a'; for (let i = 0; i < 6; i++){ g.save(); g.beginPath(); g.rect(-13 + i * 4.4, 4.6, 2.2, 1.6); g.fill(); g.restore(); }   // hazard stripes
    g.fillStyle = '#1c2028'; for (let i = 0; i < 6; i++) g.fillRect(-11 + i * 4.4, 4.6, 2.2, 1.6);
    // shoulder cannons
    for (const s of [-1, 1]){ g.fillStyle = RB.lg(g, 0, -3, 0, 2, ['#8a96a6', '#3a424e']); g.beginPath(); g.roundRect(s > 0 ? 12 : -20, -3, 8, 4.4, 1.5); g.fill(); g.strokeStyle = '#1c2028'; g.lineWidth = .7; g.stroke();
      g.fillStyle = '#1c2028'; g.fillRect(s > 0 ? 19 : -22, -2, 3, 2.4); g.fillStyle = c1; g.globalAlpha = .6 + .4 * Math.sin(t * 5 + s); g.fillRect(s > 0 ? 21.6 : -22.4, -1.4, .9, 1.2); g.globalAlpha = 1; }
    // the scanning lamp at the front
    g.fillStyle = '#1c2028'; g.beginPath(); g.arc(13, 3.6, 2.6, 0, 7); g.fill(); g.fillStyle = c1; g.shadowColor = c1; g.shadowBlur = 8; g.beginPath(); g.arc(13, 3.6, 1.4, 0, 7); g.fill(); g.shadowBlur = 0;
    g.save(); g.globalCompositeOperation = 'lighter'; const sw = Math.sin(t * 1.6) * .25; g.fillStyle = RB.lg(g, 13, 0, 40, 0, ['rgba(255,230,120,.35)', 'rgba(255,230,120,0)']); g.beginPath(); g.moveTo(13, 3.6); g.lineTo(40, 3.6 + (sw - .3) * 30); g.lineTo(40, 3.6 + (sw + .3) * 30); g.closePath(); g.fill(); g.restore();
    RB.leg(g, 7, 10, L - bob, sp, 4.6, cols, c1, t, true);
    // steam from the joints when it stomps
    if (moving){ const ph = (t * 1.4) % 1; g.fillStyle = `rgba(230,236,244,${.45 * (1 - ph)})`; g.beginPath(); g.arc(-9 - ph * 6, 8 - ph * 10, 1.6 + ph * 3, 0, 7); g.fill(); }
    g.restore(); },
  robodragon(g, M, x, by, dir, t, moving){ const [c0, c1] = M.c, L = M.lift, {fl, sx} = RB.face(dir), flap = Math.sin(t * (moving ? 9 : 5)), hov = Math.sin(t * 2.2) * 1.6;
    g.save(); g.translate(x, by + hov); g.scale(fl * sx, 1);
    // thrusters under the belly
    for (const tx of [-6, 5]){ g.save(); g.globalCompositeOperation = 'lighter'; const fh = 8 + Math.sin(t * 20 + tx) * 2; g.fillStyle = RB.lg(g, 0, 8, 0, 8 + fh, ['rgba(255,255,255,.9)', c1, 'rgba(0,0,0,0)']); g.beginPath(); g.moveTo(tx - 2.2, 8); g.lineTo(tx + 2.2, 8); g.lineTo(tx, 8 + fh); g.closePath(); g.fill(); g.restore(); }
    RB.glow(g, 0, L - hov, 12, c1, .25);
    // far wing
    const wing = (s, a) => { g.save(); g.translate(-2, 1); g.scale(1, s); g.rotate(-.25 - flap * .45); g.globalAlpha = a;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(-6, -20); g.lineTo(-14, -16); g.lineTo(-20, -6); g.lineTo(-24, 2); g.lineTo(-14, 0); g.lineTo(-8, 3); g.closePath();
      g.fillStyle = RB.lg(g, 0, -20, 0, 3, ['#ffffff', c0, '#2a303a']); g.fill(); g.strokeStyle = '#1c2028'; g.lineWidth = .8; g.stroke();
      g.strokeStyle = c1; g.lineWidth = .8; g.beginPath(); g.moveTo(-1, -1); g.lineTo(-6, -19); g.moveTo(-3, 0); g.lineTo(-14, -15); g.moveTo(-5, 1); g.lineTo(-20, -5); g.stroke(); g.restore(); };
    wing(1, .7);
    // tail in plated segments
    for (let i = 0; i < 7; i++){ const u = i / 6, tx = -12 - i * 3.6, ty = 4 + Math.sin(t * 3 - i * .7) * (1 + i * .5) + i * .6, r = 3.6 - i * .4;
      g.fillStyle = i % 2 ? c0 : '#4a525e'; g.strokeStyle = '#1c2028'; g.lineWidth = .6; g.beginPath(); g.arc(tx, ty, r, 0, 7); g.fill(); g.stroke(); if (i === 6){ g.fillStyle = c1; g.beginPath(); g.moveTo(tx - 1, ty); g.lineTo(tx - 6, ty - 3); g.lineTo(tx - 5, ty + 2); g.closePath(); g.fill(); } }
    // body
    g.beginPath(); g.ellipse(0, 4, 15, 5.5, 0, 0, 7); g.fillStyle = RB.lg(g, 0, -1, 0, 10, ['#ffffff', c0, '#2a303a']); g.fill(); g.strokeStyle = '#1c2028'; g.lineWidth = .9; g.stroke();
    g.fillStyle = '#2a303a'; for (let i = 0; i < 5; i++){ g.beginPath(); g.moveTo(-9 + i * 4.5, -.5); g.lineTo(-7 + i * 4.5, -4); g.lineTo(-5 + i * 4.5, -.5); g.closePath(); g.fill(); }   // back spines
    g.fillStyle = c1; g.globalAlpha = .6 + .35 * Math.sin(t * 4); g.fillRect(-10, 6.4, 20, 1); g.globalAlpha = 1;
    // neck and head
    g.beginPath(); g.moveTo(11, 1); g.quadraticCurveTo(17, -6, 19, -11); g.lineTo(23, -10); g.quadraticCurveTo(20, -3, 14, 6); g.closePath(); g.fillStyle = RB.lg(g, 11, 0, 23, 0, ['#4a525e', c0]); g.fill(); g.strokeStyle = '#1c2028'; g.lineWidth = .8; g.stroke();
    g.beginPath(); g.moveTo(17, -15); g.lineTo(29, -12); g.lineTo(31, -9); g.lineTo(24, -7); g.lineTo(18, -9); g.closePath(); g.fillStyle = RB.lg(g, 0, -15, 0, -7, ['#ffffff', c0, '#3a424e']); g.fill(); g.stroke();
    const jaw = (Math.sin(t * 2.5) + 1) * .9; g.fillStyle = '#2a303a'; g.beginPath(); g.moveTo(19, -8.5); g.lineTo(29, -8 + jaw); g.lineTo(22, -5.5 + jaw); g.closePath(); g.fill();
    g.fillStyle = '#2a303a'; g.beginPath(); g.moveTo(18, -14); g.lineTo(14, -20); g.lineTo(21, -15); g.closePath(); g.fill();
    g.fillStyle = c1; g.shadowColor = c1; g.shadowBlur = 7; g.beginPath(); g.moveTo(22, -12.5); g.lineTo(26, -11.5); g.lineTo(22, -10.6); g.closePath(); g.fill(); g.shadowBlur = 0;
    RB.glow(g, 28, -8, 5, c1, .4 + .3 * Math.sin(t * 3));
    // near wing and claws
    wing(1, 1);
    for (const cx of [-5, 6]){ g.strokeStyle = '#2a303a'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, 8); g.lineTo(cx + 1.5, 12 + Math.sin(t * 3 + cx) * .6); g.stroke(); }
    if (moving) for (let i = 0; i < 4; i++){ const ph = (t * 1.8 + i / 4) % 1; g.fillStyle = i % 2 ? `rgba(255,255,255,${.6 * (1 - ph)})` : c1; g.globalAlpha = i % 2 ? 1 : .6 * (1 - ph); g.fillRect(-20 - ph * 18, 2 + i * 1.5, 3, .8); } g.globalAlpha = 1;
    g.restore(); }
});
