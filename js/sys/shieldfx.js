/* VAYRATHEN — js/sys/shieldfx.js — (v55) a refined shield shines like a refined weapon, tier by tier
   SPR records where the shield is in each frame (SPR.SDRAWS); the glow is laid on it so it follows every move.
   +1–3 a soft glow on the face · +4–6 blue, a white-hot rim · +7–9 violet, a turning ring of runes and glints
   +10–12 gold, crackling arcs round the rim · +13–15 radiant, a rainbow rim and a spinning star on the boss.
   Other players see it too (the refine travels in the presence string gearfx.js already sends). */
'use strict';

const myShieldRf = () => { const id = S && S.gear && S.gear.shield, it = id && ITEMS[id]; return it ? it.rf || 0 : 0; };
const sfNear = (x, y) => { let best = null, bd = 30; for (const d of SPR.SDRAWS){ const k = Math.hypot(d.x - x, d.y - y); if (k < bd){ bd = k; best = d; } } return best; };
function shieldFx(g, segs, rf, seed){
  if (!rf || !segs || !segs.length || typeof RF_TIER !== 'function') return;
  const t = RF_TIER(rf), k = Math.min(1, rf / 15), c = RF_COL[t], pul = .85 + Math.sin(T * (2.5 + t) + seed) * .15;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [x, y, r0] of segs){
    const r = r0 * 1.05;
    const gr = g.createRadialGradient(x, y, r * .2, x, y, r * (1.5 + k * .5)); gr.addColorStop(0, `rgba(${c},${(.18 + k * .2) * pul})`); gr.addColorStop(.6, `rgba(${c},${(.08 + k * .1) * pul})`); gr.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * (1.5 + k * .5), 0, 7); g.fill();
    g.lineWidth = 1 + t * .35; g.strokeStyle = `rgba(${c},${(.35 + k * .35) * pul})`; g.beginPath(); g.ellipse(x, y, r * .85, r, 0, 0, 7); g.stroke();
    if (t >= 1){ g.lineWidth = .9; g.strokeStyle = `rgba(255,255,255,${(.35 + k * .3) * pul})`; g.beginPath(); g.ellipse(x, y, r * .8, r * .95, 0, 0, 7); g.stroke(); }
    const n = 2 + Math.round(rf * .6) + t;   // glints running round the rim
    for (let i = 0; i < n; i++){ const a = T * (.8 + t * .2) + i / n * 6.283 + seed, px = x + Math.cos(a) * r * .85, py = y + Math.sin(a) * r, al = (.4 + k * .5) * (.6 + .4 * Math.sin(T * 5 + i));
      g.fillStyle = `rgba(${c},${al})`; if (typeof rfStar === 'function') rfStar(g, px, py, 1.4 + t * .4, T + i); else g.fillRect(px - 1, py - 1, 2, 2); }
    if (t >= 2){ g.strokeStyle = `rgba(${c},${.5 * pul})`; g.lineWidth = .8; g.setLineDash([2, 3]); g.lineDashOffset = -T * 12; g.beginPath(); g.ellipse(x, y, r * 1.25, r * 1.45, 0, 0, 7); g.stroke(); g.setLineDash([]); }
    if (t >= 3){ for (let a2 = 0; a2 < (t >= 4 ? 2 : 1); a2++){ /* (v106) arcs stay on: no flicker */ const a0 = T * 2.3 + a2 * 3;
      g.strokeStyle = a2 ? 'rgba(255,255,255,.75)' : `rgba(${c},.9)`; g.lineWidth = 1; g.beginPath();
      for (let i = 0; i <= 6; i++){ const a = a0 + i * .22, j = i && i < 6 ? Math.sin(T * 4 + i * 2.1 + a2) * 2.2 : 0; g.lineTo(x + Math.cos(a) * (r * .9 + j), y + Math.sin(a) * (r * 1.05 + j)); } g.stroke(); } }
    if (t >= 4){ const h = (T * 120 + seed * 40) % 360; g.strokeStyle = `hsla(${h},100%,62%,${.45 * pul})`; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, y, r * .9, r * 1.05, 0, 0, 7); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.55)'; if (typeof rfStar === 'function') rfStar(g, x, y, r * .45, T * 1.6); }
    else if (rf >= 7){ g.fillStyle = `rgba(255,255,255,${.25 + k * .15})`; if (typeof rfStar === 'function') rfStar(g, x, y, r * .3, 0); }
  }
  g.restore();
}
{ const _over = LIVE.drawOver;
  LIVE.drawOver = function(g, ...a){
    const r = _over.call(this, g, ...a);
    if (S && !P.dead && !(typeof hideBuff === 'function' && hideBuff())){ const rf = myShieldRf(); if (rf){ const d = sfNear(P.x - cam.x, P.y - cam.y - (P.ride ? 14 : 0)); if (d) shieldFx(g, d.segs, rf, 2); } }
    if (typeof NET !== 'undefined' && NET.ghosts && SETTINGS.oFx !== false && typeof gfxParse === 'function') for (const gh of NET.ghosts.values()){ const q = gh.q || {}; if (q.dead) continue;
      const rf = gfxParse(q).shield; if (!rf) continue; const d = sfNear(gh.x - cam.x, gh.y - cam.y - (q.r ? 14 : 0)); if (d) shieldFx(g, d.segs, rf, (gh.peer || '').length); }
    return r; }; }
/* your own presence: gearRfs() only covers head/armour/shoes, so add the shield's refine */
if (typeof gearRfs === 'function'){ const _gr = gearRfs; gearRfs = function(){ const o = _gr.apply(this, arguments); const rf = myShieldRf(); if (rf) o.shield = rf; return o; }; }
/* the Equipment preview too */
if (typeof drawEquipPrev === 'function'){ const _dp = drawEquipPrev;
  drawEquipPrev = function(){ _dp.apply(this, arguments); const cv = document.getElementById('eqPrev'), rf = myShieldRf(); if (!cv || !rf || (typeof EQ !== 'undefined' && EQ.tab === 'cos')) return;
    const d = [...SPR.SDRAWS].reverse().find(w => w.g === cv.getContext('2d')); if (d){ const g = cv.getContext('2d'); g.save(); shieldFx(g, d.segs, rf, 3); g.restore(); } }; }
