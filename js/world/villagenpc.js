/* VAYRATHEN — js/world/villagenpc.js — Aren's NPCs to their own places, the shops at work, and the shops on the minimap (v58)
   Loaded after all the NPCs have been added (and after npcspace.js nudged them apart), so the plan in village2.js wins.
   · the yards are alive: sparks fly from the smith's anvil at each hammer blow, smoke curls from the forge and the
     kiln, the gem driller's wheel turns, steam rises from the cook's wok. Everything moves slowly and fades softly
   · the minimap shows each shop as a round badge in its roof colour with the trade's symbol */
'use strict';
/* (v60) the boatman (ตาพุ่ม · วาร์ป) waits in the middle of Aren, right beside where you arrive */
VNPC_AT.boatman = [VSPAWN.x + 66, VSPAWN.y + 46];
villageNpcs();

const VLIVE = {H:n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }};
function vSmoke(g, x, y, n, rise, col, sp = .2){
  for (let i = 0; i < n; i++){ const ph = (T * sp + i / n) % 1, w = typeof LIVE !== 'undefined' ? .8 : 1;
    g.fillStyle = `rgba(${col},${.34 * (1 - ph) * Math.min(1, ph * 6)})`; g.beginPath(); g.arc(x + ph * 12 * w + Math.sin(T * .8 + i) * 2, y - ph * rise, 2 + ph * 6, 0, 7); g.fill(); }
}
function vSparks(g, x, y, per, seed){
  const t = (T + seed) % per, k = t / .45; if (k > 1) return;
  const cyc = Math.floor((T + seed) / per);
  for (let i = 0; i < 7; i++){ const a = -Math.PI * (.15 + VLIVE.H(cyc * 7 + i) * .7), v = 14 + VLIVE.H(cyc * 3 + i * 1.3) * 16;
    const px = x + Math.cos(a) * v * k, py = y + Math.sin(a) * v * k + 26 * k * k;
    g.fillStyle = `rgba(255,${190 - k * 90 | 0},70,${1 - k})`; g.beginPath(); g.arc(px, py, 1.1 * (1 - k * .5), 0, 7); g.fill(); }
  g.fillStyle = `rgba(255,220,140,${.4 * (1 - k)})`; g.beginPath(); g.arc(x, y, 4 + k * 3, 0, 7); g.fill();
}
function vWheel(g, x, y){
  const a = T * 2.4; g.strokeStyle = 'rgba(60,64,72,.8)'; g.lineWidth = .9;
  for (let i = 0; i < 3; i++){ const b = a + i * 2.094; g.beginPath(); g.moveTo(x + Math.cos(b) * 1.2, y + Math.sin(b) * 1.2); g.lineTo(x + Math.cos(b) * 5.4, y + Math.sin(b) * 5.4); g.stroke(); }
}
function villageLive(g){
  if (MAP_ID !== 0 || typeof PROPS === 'undefined') return;
  const cx = cam.x, cy = cam.y, inView = (x, y) => x > cx - 80 && x < cx + VW + 80 && y > cy - 120 && y < cy + VH + 60;
  for (const p of PROPS){
    if (p.type !== 'vshop' || !inView(p.x, p.y)) continue;
    const k = (VSHOP[p.variant] || {}).k, x = p.x - cx, y = p.y - cy;
    if (k === 'smith'){ vSparks(g, x + 48, y - 15, 1.6, p.x * .01); vSmoke(g, x - 50, y - 30, 4, 34, '200,200,205'); }
    else if (k === 'forger'){ vSmoke(g, x - 48, y - 46, 5, 46, '170,170,175', .16); }
    else if (k === 'driller'){ vWheel(g, x + 47, y - 18); vSparks(g, x + 41, y - 16, 2.6, p.x * .02); }
    else if (k === 'cook'){ vSmoke(g, x - 49, y - 17, 5, 30, '255,255,255', .26); }
  }
}
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a); villageLive(g); if (typeof lavaVentSteam === 'function') lavaVentSteam(g); return r; }; }

/* the minimap: a badge for every shop instead of a plain dot */
{ const _dm = drawMini;
  drawMini = function(){
    const r = _dm.apply(this, arguments);
    if (MAP_ID !== 0 || el('mapCard').classList.contains('folded')) return r;
    const mm = el('minimap'), g = mm.getContext('2d'), kx = mm.width / W, ky = mm.height / H, u = mm.width / 170, R = 3.9 * u;
    g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `${Math.round(5.6 * u)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    const px = P.x * kx, py = P.y * ky;
    for (const [id, type, v, x, y] of VPLAN){ if (type !== 'vshop') continue; const V = VSHOP[v], bx = x * kx, by = (y - 30) * ky;
      if (Math.hypot(bx - px, by - py) < R * 2.2) continue;   // never hide your own arrow
      g.fillStyle = V.roof[0]; g.strokeStyle = '#fff'; g.lineWidth = .9 * u; g.beginPath(); g.arc(bx, by, R, 0, 7); g.fill(); g.stroke();
      g.fillText(V.ico, bx, by + .3 * u); }
    g.restore(); return r;
  }; }
