/* VAYRATHEN — js/sys/refinefx.js — refined weapons shine
   A refined weapon shines on the weapon itself, more with every +: a glow along the blade from +1, a white-hot
      edge and glints from +4, rising sparks and a tip flare from +7, crackling arcs from +10, and a radiant
      rainbow-edged blade with a spinning star from +13 (the tiers are listed by rfWeaponFx below).
      Other players see your glow too (online), and the Equipment window preview shows it. */
'use strict';

const RF_TIER = rf => (rf >= 13 ? 4 : rf >= 10 ? 3 : rf >= 7 ? 2 : rf >= 4 ? 1 : 0);
const RF_COL = ['255,250,235', '120,190,255', '190,130,255', '255,190,60', '255,225,140'];
/* your weapon's refine (a worn weapon of your class, or the class's own weapon) */
function myWeaponRf(){ const id = S && S.gear && S.gear.weapon, it = id && ITEMS[id]; return it && canWield(it) ? it.rf || 0 : (S && S.refine) || 0; }
/* the hero sprite: the look carries the glow tier (never sent as your online look key) */
{ const _hs = heroSheet;
  heroSheet = function(job = S.job, gear = S.gear, look = S.look){
    if (gear === S.gear && job === S.job){ const t = RF_TIER(myWeaponRf()); if (t) look = {...(look || {sex:'m', hair:0, color:''}), rft:t}; }
    return _hs(job, gear, look);
  };
}
const rfPres = () => ({rf:myWeaponRf()});
{ const _gl = ghostLook;
  ghostLook = function(k, rf){ const lk = _gl(k); const t = RF_TIER(clamp(rf | 0, 0, 15)); return t ? {...(lk || {sex:'m', hair:0, color:''}), rft:t} : lk; };
}
/* the glow lives on the weapon itself: SPR records where each blade is in every frame it draws (SPR.WDRAWS),
   and the effect is laid along that line, so it follows every swing and nothing lights up the body.
   +1–+3  a soft coloured glow along the blade and a few glints
   +4–+6  blue: a brighter glow with a white-hot edge, more glints
   +7–+9  violet: wider bloom, sparks drifting up off the blade, a flare at the tip
   +10–+12 gold: heavy bloom, rising embers, crackling arcs along the blade, a big tip star
   +13–+15 radiant: white-gold with a shifting rainbow edge, double arcs, a spinning star at the tip */
const rfNear = (x, y) => { let best = null, bd = 26; for (const d of SPR.WDRAWS){ const k = Math.hypot(d.x - x, d.y - y); if (k < bd){ bd = k; best = d; } } return best; };
function rfStar(g, x, y, s, rot = 0){
  g.beginPath();
  for (let i = 0; i < 8; i++){ const a = rot + i * Math.PI / 4, r = i % 2 ? s * .22 : s; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  g.closePath(); g.fill();
}
function rfWeaponFx(g, segs, rf, seed){
  if (!rf || !segs || !segs.length) return;
  const t = RF_TIER(rf), k = Math.min(1, rf / 15), c = RF_COL[t], pul = .85 + Math.sin(T * (3 + t) + seed) * .15;
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [x0, y0, x1, y1] of segs){
    let ax = x0, ay = y0, bx = x1, by = y1; const L0 = Math.hypot(bx - ax, by - ay);
    if (L0 < 4){ const mx = (ax + bx) / 2, my = (ay + by) / 2; ax = mx; ay = my - 2; bx = mx; by = my + 2; }   // seen end-on: still a small bright spot
    const at = f => [ax + (bx - ax) * f, ay + (by - ay) * f], len = Math.max(4, Math.hypot(bx - ax, by - ay));
    // bloom: three widening strokes along the blade
    const W = 1.6 + rf * .26;
    for (const [w, a] of [[W * 2.6, .07 + k * .07], [W * 1.6, .14 + k * .1], [W, .26 + k * .16]]){
      g.strokeStyle = `rgba(${c},${a * pul})`; g.lineWidth = w; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); }
    if (t >= 1){ g.strokeStyle = `rgba(255,255,255,${(.3 + k * .2) * pul})`; g.lineWidth = Math.max(1, W * .3); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); }
    if (t >= 4){ const h = (T * 120 + seed * 40) % 360; g.strokeStyle = `hsla(${h},100%,62%,${.4 * pul})`; g.lineWidth = W * .9; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); }
    // glints riding the blade
    const n = 1 + Math.round(rf * .9) + t;
    for (let i = 0; i < n; i++){
      const ph = (T * (.7 + t * .15) + i / n + seed * .37) % 1, f = (i * .618 + seed * .1) % 1, [px, py] = at(f);
      const j = (i % 2 ? 1 : -1) * (1.5 + t), al = Math.sin(ph * Math.PI) * (.5 + k * .5), sz = (1 + (i % 3) * .5) * (1 + t * .2);
      g.fillStyle = `rgba(${c},${al})`; rfStar(g, px + j * .4, py - j * .3, sz * 1.6, T * .5 + i);
      if (t >= 2){ g.fillStyle = `rgba(255,255,255,${al})`; g.fillRect(px - .7, py - .7, 1.4, 1.4); }
    }
    // sparks and embers drifting up off the blade
    if (t >= 2){ const m = 3 + rf;
      for (let i = 0; i < m; i++){ const ph = (T * (.5 + t * .1) + i / m + seed) % 1, [px, py] = at((i * .381 + seed * .2) % 1);
        const ex = px + Math.sin(ph * 6 + i) * 2, ey = py - ph * (7 + t * 3), al = (1 - ph) * (.45 + k * .5), r = (1 - ph * .5) * (.8 + t * .3);
        g.fillStyle = t >= 3 ? `rgba(255,${200 + (i % 3) * 18},${110 + t * 30},${al})` : `rgba(${c},${al})`; g.beginPath(); g.arc(ex, ey, r, 0, 7); g.fill(); } }
    // crackling arcs along the blade
    if (t >= 3){ const arcs = t >= 4 ? 2 : 1;
      for (let a = 0; a < arcs; a++){ /* (v106) arcs stay on: no flicker */
        g.strokeStyle = a ? `rgba(255,255,255,.75)` : `rgba(${c},.9)`; g.lineWidth = 1 + (t - 3) * .4; g.beginPath();
        const steps = 6, nx = -(by - ay) / len, ny = (bx - ax) / len;
        for (let i = 0; i <= steps; i++){ const [px, py] = at(i / steps), o = (i && i < steps ? (Math.sin(T * 4 + i * 2.7 + a * 3 + seed) * (1.5 + t * .6)) : 0); g.lineTo(px + nx * o, py + ny * o); }
        g.stroke(); } }
    // a flare at the tip
    if (rf >= 7){ const s = (1.6 + rf * .18) * pul, [tx, ty] = [bx, by];
      const gr = g.createRadialGradient(tx, ty, 0, tx, ty, s * 1.3); gr.addColorStop(0, `rgba(255,255,255,${.35 + k * .2})`); gr.addColorStop(.35, `rgba(${c},${.35 + k * .3})`); gr.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = gr; g.beginPath(); g.arc(tx, ty, s * 1.3, 0, 7); g.fill();
      g.fillStyle = `rgba(255,255,255,${.3 + k * .15})`; rfStar(g, tx, ty, s * (t >= 4 ? 1.1 : .8), t >= 4 ? T * 1.6 : 0); }
  }
  g.restore();
}
/* fallback for a hero whose frame carries no weapon line: a small glow at the weapon hand */
const rfHand = (x, y) => [[x + 6, y - 14, x + 6, y - 24]];
/* (v161) a weapon put away on the back does not shine over the body */
{ const _over = LIVE.drawOver;
  LIVE.drawOver = function(g, ...a){
    const r = _over.call(this, g, ...a);
    if (S && !P.dead && !(typeof SHEATH !== 'undefined' && (SHEATH.on || P.ride))){ const x = P.x - cam.x, y = P.y - cam.y - (P.ride ? 14 : 0), rf = myWeaponRf(); if (rf){ const d = rfNear(x, y); rfWeaponFx(g, d ? d.segs : rfHand(x, y), rf, 1); } }
    if (typeof NET !== 'undefined' && NET.ghosts && SETTINGS.oFx !== false) for (const gh of NET.ghosts.values()){ const rf = clamp((gh.q && gh.q.rf) | 0, 0, 15); if (!rf || (gh.q && gh.q.dead)) continue;
      const x = gh.x - cam.x, y = gh.y - cam.y - (gh.q.r ? 14 : 0), d = rfNear(x, y); rfWeaponFx(g, d ? d.segs : rfHand(x, y), rf, (gh.peer || '').length); }
    return r;
  };
}
/* the Equipment window preview sparkles too */
{ const _dp = drawEquipPrev;
  drawEquipPrev = function(){ _dp(); const cv = document.getElementById('eqPrev'), rf = myWeaponRf(); if (!cv || !rf || (typeof EQ !== 'undefined' && EQ.tab === 'cos')) return;
    const d = [...SPR.WDRAWS].reverse().find(w => w.g === cv.getContext('2d')); if (!d) return;
    const g = cv.getContext('2d'); g.save(); rfWeaponFx(g, d.segs, rf, 3); g.restore(); };
}
/* keep the preview twinkling while the window is open */
EV.on('tick', () => { if (myWeaponRf() && el('win-equip') && !el('win-equip').hidden && (typeof EQ === 'undefined' || EQ.tab !== 'cos')){ RFX.t = (RFX.t || 0) + 1; if (RFX.t % 3 === 0) drawEquipPrev(); } });
const RFX = {};

/* Auto Loot is gone: drops land on the ground; you pick them up, or a rented helper animal does (beastkeeper.js) */

