/* VAYRATHEN — js/sys/gearfx.js — all worn gear shines, with an element flavour
   Before only the weapon glowed. Now every refined piece you wear adds a soft glow where it sits on the body
   (helmet → head, armour → chest, shoes → feet), kept gentle so the
   sprite's detail still shows (low alpha, small radius, a slow pulse). On top, the element of your weapon
   (or arrows) adds its own touch, stronger with your total refine:
     ลม/สายฟ้า (wind): small lightning arcs crackling around the body · ไฟ: embers rising · น้ำ: frost motes and bubbles
     ดิน: pebbles orbiting the feet · ศักดิ์สิทธิ์: golden motes and a faint halo · มืด: violet wisps
     no element: from +7 total a few white sparks, from +10 faint lightning.
   The weapon glow itself is toned down a little so the blade's detail stays visible.
   Online: your gear glow (ga) and element (ge) travel in your presence so other players see it too. */
'use strict';

const GEARFX_ZONES = {head:[0, -50, 13], armor:[0, -32, 15], shoes:[0, -5, 10]};
const GEARFX_ELEM = ['neutral', 'wind', 'fire', 'water', 'earth', 'holy', 'shadow'];
const GEARFX_COL = {neutral:'255,246,220', wind:'150,220,255', fire:'255,150,70', water:'120,200,255', earth:'210,170,100', holy:'255,230,140', shadow:'190,120,255'};
/* refine of each worn piece except the weapon: {zone: rf} */
function gearRfs(){
  const out = {}; if (!S || !S.gear) return out;
  for (const z in GEARFX_ZONES){ const id = S.gear[z], it = id && ITEMS[id]; if (it && it.rf) out[z] = it.rf | 0; }
  return out;
}
const gearElem = () => (typeof DER !== 'undefined' && DER && GEARFX_ELEM.includes(DER.welem) ? DER.welem : 'neutral');
/* presence: "head,armor,_,shoes" refines as one short string + element index (place 3 was the retired legs: kept empty so older games still read the feet) */
const GEARFX_ORD = ['head', 'armor', 'shield', 'shoes'];   // v55: place 3 carries the shield's refine (its glow: shieldfx.js)
function gfxPres(){ const r = gearRfs(); return {ga:GEARFX_ORD.map(z => r[z] || 0).join(','), ge:GEARFX_ELEM.indexOf(gearElem())}; }
function gfxParse(q){ const r = {}; if (!q || typeof q.ga !== 'string') return r; const a = q.ga.split(',').slice(0, 5); GEARFX_ORD.forEach((z, i) => { const v = clamp(+a[i] | 0, 0, 15); if (v && z) r[z] = v; }); return r; }

function gearGlow(g, x, y, rfs, elem, wrf, seed, flip){
  // (v166) only the worn armour pieces light up the body: a +15 weapon used to count here too, so a hero with nothing but a
  // refined weapon got lightning arcs crackling across the face even with the weapon put away (its glow belongs on the blade)
  const zones = Object.keys(rfs), total = zones.reduce((a, z) => a + rfs[z], 0);
  if (!zones.length) return;
  const c = GEARFX_COL[elem] || GEARFX_COL.neutral, pul = .8 + Math.sin(T * 2.2 + seed) * .2;
  g.save(); g.globalCompositeOperation = 'lighter';
  // 1) soft glow on each refined piece (gentle: never washes the sprite out)
  for (const z of zones){ if (!GEARFX_ZONES[z]) continue;
    const rf = rfs[z], [dx, dy, r0] = GEARFX_ZONES[z], k = Math.min(1, rf / 15), cx = x + dx * flip, cy = y + dy, r = r0 * (1 + k * .5);
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(${c},${(.07 + k * .09) * pul})`); gr.addColorStop(.6, `rgba(${c},${(.025 + k * .035) * pul})`); gr.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
    // glints that twinkle on the piece
    const n = 1 + Math.floor(rf / 4);
    for (let i = 0; i < n; i++){ const ph = (T * .8 + i / n + seed * .3 + dy * .01) % 1, a = Math.sin(ph * Math.PI) * (.25 + k * .35);
      const px = cx + Math.sin(i * 2.4 + seed) * r0 * .7, py = cy + Math.cos(i * 1.7 + seed) * r0 * .5;
      g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(px - .6, py - .6, 1.2, 1.2); g.fillStyle = `rgba(${c},${a * .7})`; g.fillRect(px - 1.8, py - .3, 3.6, .6); g.fillRect(px - .3, py - 1.8, .6, 3.6); }
  }
  // 2) the element's touch, scaled by the total refine you wear
  const lv = Math.min(1, total / 30);
  if (total >= 4) elemFx(g, x, y, elem === 'neutral' ? (total >= 10 ? 'spark+' : total >= 7 ? 'spark' : '') : elem, lv, seed, c);
  g.restore();
}
function elemFx(g, x, y, e, lv, seed, c){
  if (!e) return;
  const n = Math.max(1, Math.round((2 + lv * 6) * (typeof GFX !== 'undefined' ? [.35, .7, 1][GFX.fx] ?? 1 : 1)));   // fewer particles on lower graphics
  if (e === 'wind' || e === 'spark+'){   // lightning: short jagged arcs that flick on and off around the body
    for (let a = 0; a < 1 + Math.round(lv * 2); a++){
      /* (v106) sparks stay on: no flicker */
      const ang = (T * 1.1 + a * 2.1 + seed) % 6.28, r = 13 + a * 2, x0 = x + Math.cos(ang) * r, y0 = y - 22 + Math.sin(ang) * r * .5;   // (v166) round the waist, below the face, and calmer
      g.strokeStyle = `rgba(${e === 'wind' ? '170,230,255' : '230,240,255'},${.45 + lv * .3})`; g.lineWidth = .9; g.beginPath(); g.moveTo(x0, y0);
      for (let i = 1; i <= 4; i++){ const t = i / 4; g.lineTo(x0 + Math.cos(ang + 1.6) * 8 * t + Math.sin(T * 1.8 + i * 3 + a) * 1.6, y0 + Math.sin(ang + 1.6) * 4 * t + Math.cos(T * 2.1 + i * 2 + a) * 1.6); }
      g.stroke(); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x0 - .6, y0 - .6, 1.2, 1.2); }
    if (e === 'spark+') return;
  }
  for (let i = 0; i < n; i++){
    const ph = (T * .55 + i / n + seed * .17) % 1, s = Math.sin(i * 12.9898 + seed) * .5 + .5, al = Math.sin(ph * Math.PI) * (.3 + lv * .4);
    if (e === 'fire'){ const px = x + (s - .5) * 22 + Math.sin(ph * 7 + i) * 2, py = y - 4 - ph * 40; g.fillStyle = `rgba(255,${150 + (i % 3) * 30},70,${al})`; g.beginPath(); g.arc(px, py, 1.3 * (1 - ph * .5), 0, 7); g.fill(); }
    else if (e === 'water'){ const px = x + (s - .5) * 24, py = y - 6 - ph * 34; if (i % 2){ g.strokeStyle = `rgba(160,220,255,${al})`; g.lineWidth = .7; g.beginPath(); g.arc(px, py, 1.6, 0, 7); g.stroke(); }
      else { g.fillStyle = `rgba(220,245,255,${al})`; g.fillRect(px - 1.4, py - .3, 2.8, .6); g.fillRect(px - .3, py - 1.4, .6, 2.8); } }
    else if (e === 'earth'){ const ang = T * .9 + i / n * 6.28 + seed, px = x + Math.cos(ang) * 14, py = y - 2 + Math.sin(ang) * 4 - Math.abs(Math.sin(T * 2 + i)) * 3; g.fillStyle = `rgba(${i % 2 ? '200,160,100' : '150,120,80'},${.45 + lv * .3})`; g.fillRect(px - 1.2, py - 1, 2.4, 2); }
    else if (e === 'holy'){ const px = x + (s - .5) * 22, py = y - 8 - ph * 36; g.fillStyle = `rgba(255,236,150,${al})`; g.fillRect(px - .7, py - .7, 1.4, 1.4); g.fillRect(px - 2, py - .2, 4, .4); }
    else if (e === 'shadow'){ const px = x + (s - .5) * 20 + Math.sin(ph * 5 + i) * 3, py = y - 4 - ph * 30; g.fillStyle = `rgba(150,90,220,${al * .7})`; g.beginPath(); g.ellipse(px, py, 2.2 * (1 - ph * .4), 1.2, Math.sin(i) , 0, 7); g.fill(); }
    else if (e === 'spark'){ const px = x + (s - .5) * 22, py = y - 6 - ph * 32; g.fillStyle = `rgba(255,250,230,${al})`; g.fillRect(px - .6, py - .6, 1.2, 1.2); }
  }
  if (e === 'holy'){ g.strokeStyle = `rgba(255,230,140,${.18 + lv * .2})`; g.lineWidth = .9; g.beginPath(); g.ellipse(x, y - 50, 7, 2, 0, 0, 7); g.stroke(); }
}
/* draw it over you and over other heroes */
{ const _over = LIVE.drawOver;
  LIVE.drawOver = function(g, ...a){
    const r = _over.call(this, g, ...a);
    if (S && !P.dead && !(typeof hideBuff === 'function' && hideBuff())){ const flip = (P.dir || 0) >= 4 ? -1 : 1;
      gearGlow(g, P.x - cam.x, P.y - cam.y - (P.ride ? 14 : 0), gearRfs(), gearElem(), typeof myWeaponRf === 'function' ? myWeaponRf() : 0, 1, flip); }
    if (typeof NET !== 'undefined' && NET.ghosts && SETTINGS.oFx !== false) for (const gh of NET.ghosts.values()){ const q = gh.q || {}; if (q.dead) continue;
      const rfs = gfxParse(q), el = GEARFX_ELEM[clamp(q.ge | 0, 0, GEARFX_ELEM.length - 1)] || 'neutral';
      gearGlow(g, gh.x - cam.x, gh.y - cam.y - (q.r ? 14 : 0), rfs, el, clamp(q.rf | 0, 0, 15), (gh.peer || '').length, (q.d || 0) >= 4 ? -1 : 1); }
    return r;
  };
}
/* the weapon glow: a bit softer so the blade's detail shows, and tinted toward the element */
{ const _wf = rfWeaponFx;
  rfWeaponFx = function(g, segs, rf, seed){ g.save(); g.globalAlpha *= .3; const r = _wf.call(this, g, segs, rf, seed); g.restore();
    const e = gearElem(); if (e !== 'neutral' && segs && segs.length && rf >= 4){ g.save(); g.globalCompositeOperation = 'lighter';
      const [x0, y0, x1, y1] = segs[0], c = GEARFX_COL[e];
      for (let i = 0; i < 3 + Math.floor(rf / 4); i++){ const f = (T * .9 + i * .37 + seed) % 1, px = x0 + (x1 - x0) * f, py = y0 + (y1 - y0) * f;
        if (e === 'wind'){ if (true){ g.strokeStyle = `rgba(${c},.7)`; g.lineWidth = .8; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.sin(T * 5 + i) * 4, py - 3); g.lineTo(px + Math.cos(T * 2.3 + i) * 3, py - 6); g.stroke(); } }
        else { g.fillStyle = `rgba(${c},${.5 * Math.sin(f * Math.PI)})`; g.beginPath(); g.arc(px, py - f * 3, 1.1, 0, 7); g.fill(); } }
      g.restore(); }
    return r; };
}
