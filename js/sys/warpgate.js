/* VAYRATHEN — js/sys/warpgate.js — map exits as a dazzling ground warp
   On the ground: a frayed misty halo, a slowly turning ring of rune marks, four swirling rings of light whose colours flow
   through cyan, violet and rose (each ring broken and turning its own way), a bright pulsing core and a flare that
   sweeps across it. Above it (drawn over everything): short shafts of coloured light rising, floating orbs bobbing
   around, and sparkles that twinkle and drift up. Lighter on low graphics. */
'use strict';
globalThis.GATE_V2 = true;
const wgQ = () => (typeof GFX !== 'undefined' ? [.45, .75, 1][GFX.fx] ?? 1 : 1);
const wgHue = (t, k) => (200 + Math.sin(t * .6 + k * .9) * 70 + k * 18 + 360) % 360;   // cyan → violet → rose and back
function wgGround(ctx, gt, cx, cy){
  const x = gt.x - cx, y = gt.y - cy - 4, t = T, RX = 46, RY = 23, seed = (gt.x % 97) / 97, pul = .85 + Math.sin(t * 2.4 + seed * 6) * .15;
  ctx.save();
  ctx.fillStyle = 'rgba(20,24,60,.22)'; ctx.beginPath(); ctx.ellipse(x, y, RX * 1.2, RY * 1.2, 0, 0, 7); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  const ell = (r0, r1, stops) => { ctx.save(); ctx.scale(1, RY / RX); const gr = ctx.createRadialGradient(x, y * RX / RY, r0, x, y * RX / RY, r1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y * RX / RY, r1, 0, 7); ctx.fill(); ctx.restore(); };
  // the halo
  const h0 = wgHue(t, 0);
  ell(RX * .1, RX * 1.45, [[0, `hsla(${h0},90%,80%,${.38 * pul})`], [.55, `hsla(${(h0 + 40) % 360},90%,70%,${.2 * pul})`], [1, 'hsla(260,90%,70%,0)']]);
  for (let i = 0, n = Math.round(16 * wgQ()); i < n; i++){ const a = i / n * 6.283 + t * .5 + seed * 6, r = 1.02 + Math.sin(t * 1.7 + i * 2.1) * .1;
    ctx.fillStyle = `hsla(${wgHue(t, i * .3)},90%,80%,${.14 * pul})`; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * RX * r, y + Math.sin(a) * RY * r, 8, 4.5, a, 0, 7); ctx.fill(); }
  // rune marks turning around the edge
  for (let i = 0; i < 24; i++){ const a = i / 24 * 6.283 - t * .35, px = x + Math.cos(a) * RX * 1.08, py = y + Math.sin(a) * RY * 1.08;
    ctx.fillStyle = `hsla(${wgHue(t, 2)},100%,85%,${(.35 + .35 * Math.sin(t * 4 + i)) * pul})`; ctx.fillRect(px - 1.5, py - .8, i % 3 ? 2 : 3, 1.6); }
  // the swirling rings
  for (let k = 0; k < 4; k++){ const f = 1 - k * .21, rx = RX * f, ry = RY * f, dir = k % 2 ? -1 : 1, rot = t * (1.3 + k * .4) * dir + k, hue = wgHue(t, k);
    for (let s = 0; s < 3; s++){ const a0 = rot + s * 2.094, a1 = a0 + 1.55 + Math.sin(t * 2 + k + s) * .25;
      ctx.strokeStyle = `hsla(${hue},95%,72%,${.28 * pul})`; ctx.lineWidth = 8 - k; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, a0, a1); ctx.stroke();
      ctx.strokeStyle = `hsla(${hue},100%,92%,${(.6 + k * .08) * pul})`; ctx.lineWidth = 2.2 - k * .3; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, a0, a1); ctx.stroke(); } }
  // the core and a flare sweeping across
  ell(0, RX * .42, [[0, `rgba(255,255,255,${.95 * pul})`], [.45, `hsla(${(h0 + 60) % 360},100%,85%,${.55 * pul})`], [1, 'hsla(0,0%,100%,0)']]);
  const fl = (t * .7 + seed) % 2; if (fl < 1){ const fx = x - RX + fl * RX * 2; ctx.fillStyle = `rgba(255,255,255,${Math.sin(fl * Math.PI) * .35})`; ctx.beginPath(); ctx.ellipse(fx, y, 5, RY * .9, 0, 0, 7); ctx.fill(); }
  ctx.restore();
}
function wgAbove(ctx, gt, cx, cy){
  const x = gt.x - cx, y = gt.y - cy - 4, t = T, RX = 46, RY = 23, seed = (gt.x % 97) / 97, q = wgQ();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  // rising shafts of coloured light
  for (let i = 0, n = Math.round(7 * q); i < n; i++){ const u = (t * .35 + i / n + seed) % 1, a = i * 2.39 + seed * 7, px = x + Math.cos(a) * RX * .55, py = y + Math.sin(a) * RY * .55, h = 30 + 50 * Math.sin(u * Math.PI);
    const gr = ctx.createLinearGradient(0, py - h, 0, py); gr.addColorStop(0, 'hsla(0,0%,100%,0)'); gr.addColorStop(1, `hsla(${wgHue(t, i)},100%,80%,${.35 * Math.sin(u * Math.PI)})`);
    ctx.fillStyle = gr; ctx.fillRect(px - 2, py - h, 4, h); }
  // floating orbs
  for (let i = 0; i < 6; i++){ const a = i * 1.047 + t * .45 + seed * 9, px = x + Math.cos(a) * RX * (.95 + (i % 2) * .22), py = y + Math.sin(a) * RY * .9 - 16 - Math.sin(t * 2 + i) * 6, r = 7 + (i % 3);
    const gl = ctx.createRadialGradient(px, py, 0, px, py, r); gl.addColorStop(0, 'rgba(255,255,245,.95)'); gl.addColorStop(.4, `hsla(${wgHue(t, i)},100%,80%,.55)`); gl.addColorStop(1, 'hsla(0,0%,100%,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill(); }
  // twinkling sparkles drifting up
  for (let i = 0, n = Math.round(14 * q); i < n; i++){ const u = (t * .45 + i / n + seed) % 1, a = i * 2.3 + seed * 5, px = x + Math.cos(a) * RX * .75, py = y + Math.sin(a) * RY * .75 - u * 70, al = Math.sin(u * Math.PI) * (.6 + .4 * Math.sin(t * 9 + i));
    ctx.fillStyle = `hsla(${wgHue(t, i * .5)},100%,90%,${al})`; ctx.fillRect(px - .5, py - 2.5, 1, 5); ctx.fillRect(px - 2.5, py - .5, 5, 1); }
  ctx.restore();
}
VFX.drawGate = function(){};
const wgVisible = gt => Math.abs(gt.x - cam.x - VW / 2) < VW && Math.abs(gt.y - cam.y - VH / 2) < VH;
{ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g, ...a){ const r = _u.call(this, g, ...a); if (typeof GATES !== 'undefined') for (const gt of GATES) if (wgVisible(gt)) wgGround(g, gt, cam.x, cam.y); return r; }; }
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a); if (typeof GATES !== 'undefined') for (const gt of GATES) if (wgVisible(gt)) wgAbove(g, gt, cam.x, cam.y); return r; }; }
