/* VAYRATHEN — js/sys/mobarms325.js — (v325) armed monsters: fitting weapons, a glow of their own, bosses in fashion wings
   The owner: every monster that carries a sword or other weapon glows, each in a colour no other monster has; a boss's
   glow is grander and more special than an ordinary monster's; and the monsters carry different kinds of weapon, each
   one fitting what it is. Winged bosses wear one of the fashion wings (js/sys/costume2.js WINGS), picked at random each
   time the boss appears, in place of their plain painted wings.
   · Weapons: yakshas, giants and temple guardians carry a club (กระบอง: Thai yakshas and Vessavana hold one), soldiers
     and guards a spear (หอก / ทวน with a red tassel), brutes and frost giants an axe, swift fiends claws, a few a katana or
     a greatsword. The metal follows the monster's element (fire ember, shadow obsidian, earth jade, holy gold).
   · Glow (laid along the weapon the sprite drew this frame, SPR.WDRAWS): ordinary monsters a soft bloom and a bright
     edge; pack leaders a little more; bosses a wide bloom, a white-hot core, a shine that runs up the blade, motes
     circling it, a star flaring at the tip and embers drifting off, all gathering while a move winds up.
     No flashes: everything breathes slowly. */
'use strict';
const MA325 = {
  arms:{   // monster id: look changes (weapon kind and flags)
    stuccoyaksha:{weapon:'sword', mace:1, twoHand:1}, ayutyaksha:{weapon:'sword', mace:1, twoHand:1}, himogre:{weapon:'sword', mace:1, twoHand:1}, frostyaksha:{weapon:'sword', mace:1},
    woodsentinel:{weapon:'sword', mace:1}, cactus_warrior:{weapon:'sword', mace:1},
    ayutsoldier:{weapon:'sword', spear:1}, matchanu:{weapon:'sword', spear:1}, nagawarrior:{weapon:'sword', spear:1}, devaguard:{weapon:'sword', spear:1},
    kingtomb_warrior:{weapon:'sword', spear:1}, milkyway_warrior:{weapon:'sword', spear:1}, dragonknight:{weapon:'sword', spear:1}, impling:{weapon:'sword', spear:1},
    asura:{weapon:'sword', axe:1, twoHand:1}, frostgiant:{weapon:'sword', axe:1, twoHand:1}, blizzard_warrior:{weapon:'sword', axe:1, twoHand:1},
    oasis_warrior:{weapon:'sword', axe:1}, marasoldier:{weapon:'sword', axe:1},
    banditghost:{weapon:'dagger'}, hexspire_warrior:{weapon:'dagger', katana:1}, glowcap_warrior:{weapon:'dagger', claw:1}, flamefiend:{weapon:'dagger', claw:1}, ashghoul:{weapon:'dagger', claw:1},
    asuramaze_warrior:{weapon:'sword', twoHand:1}, demonknight:{weapon:'sword', twoHand:1},
    // bosses
    dvarapala:{weapon:'sword', mace:1, twoHand:1}, vessavana:{weapon:'sword', mace:1, twoHand:1, wTier:5}, redcliffgiant:{weapon:'sword', mace:1, twoHand:1}, basalt_lord:{weapon:'sword', mace:1, twoHand:1},
    snowking:{weapon:'sword', axe:1, twoHand:1}, sulphur_lord:{weapon:'sword', axe:1, twoHand:1},
    phantomgeneral:{weapon:'sword', twoHand:1}, asuraking:{weapon:'sword', twoHand:1}, tenfacedogre:{weapon:'sword', twoHand:1},
    asuramaze_lord:{weapon:'dagger', katana:1}, skygarden_lord:{weapon:'sword', spear:1}, mangrove_lord:{weapon:'sword', spear:1},
    gloom_lord:{weapon:'dagger', claw:1}, sapphire_lord:{weapon:'dagger', claw:1}, suncourt_lord:{weapon:'sword'}},
  tier:{fire:2, shadow:3, earth:4, holy:5},   // the metal by element (sprites.js BL: steel, steel, ember, obsidian, jade, sun)
  col:{}, wing:new Set(),
  // (v325) the owner (a brown wooden sentinel with a plain white wing): «wings and characters like this, I don't want them:
  // colourful, in beautiful outfits». The plain painted wings that js/gfx/variety.js gave some human monsters are gone; the
  // ones whose legend has wings wear a fitting fashion wing (the krahang keeps its winnowing baskets: that is the legend)
  mobWing:{kinnorn:'w_swan', goldkinnaree:'tws_kanok', impling:'w_bat', flamefiend:'w_devil', demonknight:'w_fallen', dragonknight:'w_dragon', dragoncultist:'w_raven'},
  keepWing:new Set(['krahang', 'krahangluang']),
  // outfits by element for monsters in drab clothes: [top, pants, trim]
  dress:{fire:[['scarlet', 'wine', 'gold'], ['sunset', 'crimson', 'gold'], ['coral', 'wine', 'gold']],
    water:[['royalBlue', 'ivory', 'gold'], ['aqua', 'navy', 'silver'], ['peacock', 'navy', 'gold']],
    earth:[['forest', 'sand', 'gold'], ['emerald', 'bronze', 'gold'], ['teal', 'ochre', 'gold']],
    wind:[['mint', 'teal', 'ivory'], ['sky', 'royalBlue', 'silver'], ['teal', 'cream', 'gold']],
    holy:[['ivory', 'gold', 'gold'], ['cream', 'sky', 'gold'], ['sakura', 'ivory', 'gold']],
    shadow:[['plum', 'midnight', 'gold'], ['wine', 'indigoD', 'silver'], ['lavender', 'plum', 'silver'], ['crimsonV', 'onyx', 'gold']],
    neutral:[['navy', 'scarlet', 'gold'], ['rose', 'navy', 'gold']]}};
const ma325Drab = mat => { const d = SPR.MATS[SPR.M[mat]], hx = d && d.hex && d.hex[1]; if (!hx) return false;
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hx.substr(i, 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, sat = mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1));
  const hu = mx === mn ? 0 : mx === r ? ((g - b) / (mx - mn) + 6) % 6 * 60 : mx === g ? ((b - r) / (mx - mn) + 2) * 60 : ((r - g) / (mx - mn) + 4) * 60;
  return sat < .32 || l < .2 || l > .9 || (hu > 12 && hu < 50 && l < .4); };   // grey, black, washed-out white, or dark brown
const ma325Near = (a, b) => { const A = SPR.MATS[SPR.M[a]], B = SPR.MATS[SPR.M[b]]; if (!A || !B || !A.ramp || !B.ramp) return false; const p = A.ramp[1], q = B.ramp[1]; return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 70; };   // clothes the colour of the skin
{ const armed = [];
  for (const k in SPR.MOBS){ const h = SPR.MOBS[k].human; if (!h) continue; const a = MA325.arms[k], d = (typeof MOB !== 'undefined' && MOB[k]) || {};
    if (a){ for (const f of ['mace', 'spear', 'axe', 'twoHand', 'katana', 'claw']) delete h[f]; Object.assign(h, a); }
    if (h.weapon && h.weapon !== 'fist'){ if (h.wTier == null) h.wTier = MA325.tier[d.elem] ?? 1; armed.push(k); }
    if (d.boss && h.wings){ MA325.wing.add(k); delete h.wings; delete h.wingTip; }
    else if (h.wings && !MA325.keepWing.has(k)){ delete h.wings; delete h.wingTip; }
    // a drab outfit becomes a colourful one in the monster's element (the skin, hair and face stay its own)
    if ((ma325Drab(h.top) && ma325Drab(h.pants)) || ma325Near(h.top, h.skinM)){ const P = MA325.dress[d.elem] || MA325.dress.neutral, hh = [...k].reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7), [tp, pa, tr] = P[Math.abs(hh) % P.length];
      if (h.sleeve === h.top) h.sleeve = tp; h.top = tp; h.pants = pa; if (h.skirt){ h.skirt = [...h.skirt]; h.skirt[4] = pa; h.skirt[5] = tr; }
      h.belt = tr; h.necklace = true; h.armband = tr; h.bootCuff = tr; if (h.hatMat && ma325Drab(h.hatMat)){ h.hatMat = h.bandMat = h.capMat = tr; } } }
  // a colour for each armed monster that no other has: hues a golden angle apart, in three tones in turn
  armed.sort().forEach((k, i) => { const hu = (i * 137.508 + 18) % 360, [s, l] = [[92, 62], [78, 70], [96, 55]][i % 3];
    MA325.col[k] = [`hsl(${hu},100%,92%)`, `hsl(${hu},${s}%,${l}%)`, `hsl(${hu},${s}%,${l - 18}%)`]; }); }

/* the pool: real wings only (feathers, membranes, flame, crystal, kanok...), not the cute charms, balloons or machines */
const MA325_KINDS = new Set(['ether', 'tattered', 'feather', 'raven', 'petal', 'lotus', 'bat', 'void', 'devil', 'satan', 'butterfly', 'flame', 'crystal', 'amethyst2', 'kanok', 'dragon', 'silk2']);
const ma325Wings = () => MA325.pool || (MA325.pool = Object.keys(WINGS).filter(k => !WINGS[k].cute && !WINGS[k].tech && MA325_KINDS.has(WINGS[k].kind)));
/* ordinary monsters and pack leaders */
function ma325Glow(g, d, m){
  const c = MA325.col[m.type]; if (!c) return;
  const el = !!m.elite, k = (el ? 1.35 : 1) * (.85 + Math.sin(T * 1.4 + (m.id || 0)) * .15), seed = (m.id || 0) * .37;
  g.save(); g.setTransform(d.mt); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (const [x0, y0, x1, y1] of d.segs){ let ax = x0, ay = y0, bx = x1, by = y1;
    if (Math.hypot(bx - ax, by - ay) < 3){ const mx = (ax + bx) / 2, my = (ay + by) / 2; ax = mx; ay = my - 1.5; bx = mx; by = my + 1.5; }
    for (const [w, al, cc] of [[7, .12, c[2]], [4.2, .2, c[1]], [2.2, .34, c[1]], [.9, .55, c[0]]]){ g.globalAlpha = Math.min(1, al * k); g.strokeStyle = cc; g.lineWidth = w; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); }
    for (let i = 0; i < (el ? 2 : 1); i++){ const ph = (T * .4 + i / 2 + seed) % 1, f = (i * .618 + seed) % 1;
      g.globalAlpha = Math.sin(ph * Math.PI) * .4; g.fillStyle = c[0]; g.beginPath(); g.arc(ax + (bx - ax) * f + Math.sin(ph * 5 + i), ay + (by - ay) * f - ph * 6, .7, 0, 7); g.fill(); } }
  g.restore();
}
/* bosses: grander (replaces the plain element glow of js/sys/bossact.js) */
baWeaponGlow = function(g, d, m){
  const c = MA325.col[m.type] || ['#fff6d0', '#ffc850', '#c07a10'], b = m.ba;
  const wind = b && !b.rel ? baEase((T - b.t0) / b.wind) : b && b.rel ? Math.max(0, 1 - (T - b.tr) / .5) : 0;
  const k = (.9 + Math.sin(T * 1.2 + (m.id || 0)) * .1) * (1 + wind * .8), seed = (m.id || 0) * .37;
  g.save(); g.setTransform(d.mt); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (const [x0, y0, x1, y1] of d.segs){ let ax = x0, ay = y0, bx = x1, by = y1;
    if (Math.hypot(bx - ax, by - ay) < 3){ const mx = (ax + bx) / 2, my = (ay + by) / 2; ax = mx; ay = my - 2; bx = mx; by = my + 2; }
    const L = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / L, ny = (bx - ax) / L;
    // a wide bloom, then brighter layers down to a white-hot core
    for (const [w, al, cc] of [[11, .06, c[2]], [7, .1, c[2]], [4.4, .16, c[1]], [2.4, .26, c[1]], [1, .5, c[0]], [.45, .7, '#ffffff']]){
      g.globalAlpha = Math.min(1, al * k); g.strokeStyle = cc; g.lineWidth = w; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); }
    // a shine running up the blade from hilt to tip
    { const ph = (T * .7 + seed) % 1, e = ph * ph * (3 - 2 * ph), sx = ax + (bx - ax) * e, sy = ay + (by - ay) * e, r = 4 + 2 * k;
      const gr = g.createRadialGradient(sx, sy, 0, sx, sy, r); gr.addColorStop(0, 'rgba(255,255,255,.75)'); gr.addColorStop(.35, c[0]); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = Math.sin(ph * Math.PI) * .7; g.fillStyle = gr; g.beginPath(); g.arc(sx, sy, r, 0, 7); g.fill(); }
    // motes circling the blade
    for (let i = 0; i < 4; i++){ const a = T * 2.4 + i * 1.571 + seed, f = ((T * .25 + i * .25 + seed) % 1), px = ax + (bx - ax) * f + nx * Math.cos(a) * 3.2, py = ay + (by - ay) * f + ny * Math.cos(a) * 3.2 - Math.sin(a) * 1.2;
      g.globalAlpha = (.35 + .3 * Math.sin(a)) * Math.min(1.4, k); g.fillStyle = i % 2 ? c[0] : c[1]; g.beginPath(); g.arc(px, py, .9, 0, 7); g.fill(); }
    // a four-point star breathing at the tip
    { const s = (2.6 + Math.sin(T * 1.6 + seed) * .8) * (1 + wind * .6);
      g.globalAlpha = .55 * Math.min(1.3, k); g.fillStyle = c[0];
      g.beginPath(); g.moveTo(bx, by - s * 2); g.lineTo(bx + s * .22, by); g.lineTo(bx, by + s * 2); g.lineTo(bx - s * .22, by); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(bx - s * 2, by); g.lineTo(bx, by + s * .22); g.lineTo(bx + s * 2, by); g.lineTo(bx, by - s * .22); g.closePath(); g.fill();
      g.globalAlpha = .4 * k; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(bx, by, s * .35, 0, 7); g.fill(); }
    // embers drifting off
    const n = 5 + Math.round(wind * 4);
    for (let i = 0; i < n; i++){ const ph = (T * .45 + i / n + seed) % 1, f = (i * .618 + seed) % 1, px = ax + (bx - ax) * f, py = ay + (by - ay) * f;
      g.globalAlpha = Math.sin(ph * Math.PI) * .5 * Math.min(1.5, k); g.fillStyle = i % 3 ? c[1] : c[0];
      g.beginPath(); g.arc(px + Math.sin(ph * 5 + i) * 1.6, py - ph * 9, .9 + (1 - ph) * .6, 0, 7); g.fill(); } }
  g.restore();
};
/* the glow on ordinary armed monsters, and a winged boss's fashion wings (behind it, or in front when it turns away) */
{ const _dm = drawMobW;
  drawMobW = function(g, m){
    const ok = m && !m.dead && m.def, hum = ok && !m.def.boss && MA325.col[m.type];
    const fw = ok && !m.def.boss && MA325.mobWing[m.type], wg = ok && (fw || m.def.boss && MA325.wing.has(m.type)) && !(m.fz && m.fz.hidden) && typeof drawWings === 'function' && typeof WINGS !== 'undefined';
    let wid = null, wo = null;
    if (wg){ const ids = ma325Wings(); wid = fw && WINGS[fw] ? fw : m._ma325w && WINGS[m._ma325w] ? m._ma325w : (m._ma325w = ids[Math.floor(Math.random() * ids.length)]);
      const bz = !m.def.boss ? (m.elite ? 1.3 : 1) : m.def.bsz || (typeof BOSS_SZ !== 'undefined' ? BOSS_SZ : 1), fz = m.fz, k = bz * (fz ? 1 + ((fz.phase || 1) - 1) * .04 : 1);
      wo = {x:m.x - cam.x, y:m.y - cam.y - (fz ? fz.z || 0 : 0), k, dir:m.dir || 0, moving:!!m.moving}; }
    const wDraw = part => { try { g.save(); if (T - m.born < .4) g.globalAlpha = (T - m.born) / .4; g.translate(wo.x, wo.y); g.scale(wo.k, wo.k);
      drawWings(g, wid, 0, 0, wo.dir, T, {part, moving:wo.moving}); } catch (e) {} finally { g.restore(); } };
    if (wg) wDraw('back');
    const n0 = hum ? SPR.WDRAWS.length : 0, r = _dm.apply(this, arguments);
    if (hum && SPR.WDRAWS.length > n0){ const d = SPR.WDRAWS[SPR.WDRAWS.length - 1]; if (d.g === g && d.mt) try { ma325Glow(g, d, m); } catch (e) {} }
    if (wg) wDraw('front');
    return r; }; }
