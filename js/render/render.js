/* VAYRATHEN — js/render/render.js */
'use strict';

/* ---------- canvas: 1 world unit = PX screen px. PX is picked from the screen height (auto balance),
   then multiplied by the player's zoom (wheel / pinch / + − buttons). ---------- */
let PX = 2, PX_AUTO = 2, UIZ = 1;
const ZSTEPS = [.4, .5, .6, .75, 1, 1.25, 1.5];   // (v133) further out (40%), not as far in (150%)
const ZOOM = {lvl:1, target:1, t:0};
try { const z = +localStorage.getItem('vayrathen-zoom'); if (z > 0) ZOOM.lvl = ZOOM.target = clamp(z, ZSTEPS[0], ZSTEPS[ZSTEPS.length - 1]); } catch (e) {}   // a saved 175% / 200% becomes 150%
const cv = $('#cv'), ctx = cv.getContext('2d'), MAINCTX = ctx;
let NCTX = null;   // (v59) when set, hero name tags draw into this canvas instead (namecache.js bakes them once)
const night = document.createElement('canvas'), nctx = night.getContext('2d');
let VW = 400, VH = 250, SW = 800, SH = 500, DPR = 1, SHEETS = null;
/* the player's sprite sheet for the current class + worn gear (head, armour, weapon, accessory show on the body) */
function heroSheet(job = S.job, gear = S.gear, look = S.look){ if (!SHEETS) return null; const k = SPR.heroKey(job, typeof visGear === 'function' ? visGear(gear) : gear || {}, look); return SHEETS[k] || (SHEETS[k] = SPR.sheet('char', k)); }
const cam = {x:0, y:0}, CAMS = {x:null, y:null, t:0, map:-1};
let nightA = 0;
/* height of each monster (name tag, HP bar, hit point); generated species get it from their archetype and scale */
const MOB_H0 = {dewblob:22, hare:26, boar:32, lantern:44, boss:70};
const ARCH_H = {quad:30, bird:30, serpent:26, bug:22, squat:22, floater:42, slime:22, rock:32, human:46};
const MOB_H = new Proxy(MOB_H0, {get:(o, k) => o[k] ?? (o[k] = Math.round((ARCH_H[typeof SPECIES_ARCH !== 'undefined' && SPECIES_ARCH[k]] || 30) * ((SPR.MOBS[k] && SPR.MOBS[k].scale) || 1)))});
function applyPX(px){
  const ow = SW / PX, oh = SH / PX;
  PX = Math.max(px, SW / W, SH / H);
  VW = Math.ceil(SW / PX); VH = Math.ceil(SH / PX);
  // zoom around the screen centre (your hero), not the top-left corner: shift the camera by half the change
  if (CAMS.x != null && isFinite(ow)){ CAMS.x += (ow - SW / PX) / 2; CAMS.y += (oh - SH / PX) / 2; }
  { const nw = Math.ceil(VW / 2), nh = Math.ceil(VH / 2); if (night.width !== nw || night.height !== nh){ night.width = nw; night.height = nh; } }   // (v218) the night layer at half size: it is a soft darkness, a quarter of the pixels to fill
}
function resize(){
  const w = $('#wrap').clientWidth;
  // stage fills the window below the title bar (no page scroll)
  const app = document.querySelector('.app'), pb = parseFloat(getComputedStyle(app).paddingBottom) || 0;
  const top = brect($('#wrap')).top + window.scrollY;
  SW = w; SH = Math.max(200, Math.round(vpH() - top - pb));
  // auto balance: about 270 world units of height on any screen (v83: closer, so heroes and monsters read bigger; half steps keep pixels even)
  // (v188) the camera sits 20% further out at every zoom step (phones too: their 2 px floor becomes 1.6 px)
  PX_AUTO = clamp(Math.round(SH / 270 * 2) / 2, 2, 4.5) * .8;
  // one UI scale for every screen: proportional above 1280×720, gently smaller below it (square-root curve, so phone
  // text and buttons stay readable and touchable), times the player's own size setting (Settings → UI size)
  { const f = SH > SW * 1.15 ? Math.min(SH / 1280, SW / 720) : Math.min(SH / 720, SW / 1280), us = typeof SETTINGS !== 'undefined' ? +SETTINGS.uiScale || 1 : 1;
    UIZ = clamp((f >= 1 ? Math.min(f, 1.75) : Math.pow(f, .5)) * us, .5, 2.2); }
  const ui = $('#ui'); ui.style.zoom = UIZ; ui.style.setProperty('--sh', SH / UIZ + 'px'); $('#wrap').style.setProperty('--sh', SH + 'px');
  DPR = Math.min(GFX.dpr, window.devicePixelRatio || 1);   // the quality preset caps the canvas resolution
  // (v190) only when the size really changes: setting a canvas's width or height (even to the same number) wipes it, and
  // resize() runs whenever the HUD lays itself out again (opening a window, switching a tab, pressing a button), so the
  // game picture and the minimap blinked on every click
  const cw = Math.round(SW * DPR), ch = Math.round(SH * DPR); if (cv.width !== cw) cv.width = cw; if (cv.height !== ch) cv.height = ch; if (cv.style.height !== SH + 'px') cv.style.height = SH + 'px';
  applyPX(PX_AUTO * ZOOM.lvl);
  const mmc = $('#minimap'), mw = mmc.clientWidth || (w < 700 ? 104 : 170); { const a = Math.round(mw * DPR), b = Math.round(mw * 2 / 3 * DPR); if (mmc.width !== a) mmc.width = a; if (mmc.height !== b) mmc.height = b; }
}
function setZoom(z, snap = true){
  if (snap){ let best = ZSTEPS[0]; for (const s of ZSTEPS) if (Math.abs(s - z) < Math.abs(best - z)) best = s; z = best; }
  ZOOM.target = clamp(z, ZSTEPS[0], ZSTEPS[ZSTEPS.length - 1]);
  if (snap) try { localStorage.setItem('vayrathen-zoom', ZOOM.target); } catch (e) {}
  const v = document.getElementById('zoomV'); if (v) v.textContent = Math.round(ZOOM.target * 100) + '%';
  const sz = document.getElementById('set-zoom'); if (sz && snap) sz.value = String(ZOOM.target);
}
// Settings → camera zoom (the same steps as the wheel / pinch / minimap buttons)
document.addEventListener('change', e => { if (e.target && e.target.id === 'set-zoom') setZoom(+e.target.value, true); });
function zoomStep(d){ const i = ZSTEPS.findIndex(s => s >= ZOOM.target - .01); setZoom(ZSTEPS[clamp(i + d, 0, ZSTEPS.length - 1)]); }
function updZoom(){
  const now = performance.now(), dt = Math.min(.1, (now - (ZOOM.t || now)) / 1000); ZOOM.t = now;
  if (ZOOM.lvl === ZOOM.target) return;
  ZOOM.lvl *= Math.pow(ZOOM.target / ZOOM.lvl, Math.min(1, dt * 11));   // eased in log space: zooming in and out feel the same speed
  if (Math.abs(ZOOM.lvl - ZOOM.target) < .002){ ZOOM.lvl = ZOOM.target; try { localStorage.setItem('vayrathen-zoom', ZOOM.target); } catch (e) {} }
  applyPX(PX_AUTO * ZOOM.lvl);
}
const F = (w, s) => `${w} ${s}px "Mali", system-ui, sans-serif`;
const FD = (w, s) => `${w} ${s}px "Mali", sans-serif`;
const sx = x => (x - cam.x) * PX, sy = y => (y - cam.y) * PX;

function shadowW(g, x, y, r){ g.fillStyle = 'rgba(24,40,16,.28)'; g.beginPath(); g.ellipse(Math.round(x), Math.round(y), r, Math.max(2, r * .38), 0, 0, 7); g.fill(); }
function playerAct(){
  if (P.dead) return 'die';
  if (P.roll) return 'roll';
  if (P.capT > 0) return 'capture';
  if (P.ride) return P.moving ? 'ride' : 'rideIdle';
  if (P.sit) return 'sit';
  if (P.cast) return heroSheet().index.cast ? 'cast' : 'skill';
  if (P.skillAnim > 0) return P.skAct && heroSheet().index[P.skAct] ? P.skAct : 'skill';
  if (P.atkAnim > 0) return 'attack';
  if (P.hurt > 0) return 'hurt';
  if (P.moving) return 'walk';
  return 'idle';
}
function mobAnim(m){
  if (m.dead) return ['die', m.deadT];
  if (m.atkT < .4) return ['attack', m.atkT];
  if (m.hurtT > 0) return ['hurt', .25 - m.hurtT];
  if (m.moving) return ['walk', T + m.id * .37];
  return ['idle', T + m.id * .37];
}
/* a summoned Himmapan beast: the monster's own sprite drawn solid, standing on a thin ring in its role colour
   (tank blue · physical orange · magic violet). It lunges into its strikes, flashes when it uses its skill or is hit,
   a tank shows a shield bubble while Guardian Roar holds, and a role badge, its name and an HP bar float over it. */
const BEAST_GLOW = {auraGold:'255,200,90', auraGreen:'110,235,170', auraViolet:'180,130,255', auraWhite:'150,205,255'};
const ROLE_RGB = {tank:'120,195,255', phys:'255,160,90', magic:'200,150,255'};
function roleIcon(g, role, x, y, r, col){
  g.save(); g.fillStyle = col; g.strokeStyle = 'rgba(10,6,14,.9)'; g.lineWidth = 1; g.beginPath();
  if (role === 'tank'){ g.moveTo(x - r, y - r * .8); g.lineTo(x + r, y - r * .8); g.lineTo(x + r, y); g.quadraticCurveTo(x + r * .8, y + r * .8, x, y + r * 1.1); g.quadraticCurveTo(x - r * .8, y + r * .8, x - r, y); g.closePath(); }
  else if (role === 'phys'){ for (let i = -1; i <= 1; i++){ g.moveTo(x + i * r * .55 - r * .2, y - r); g.lineTo(x + i * r * .55 + r * .25, y - r); g.lineTo(x + i * r * .55 - r * .05, y + r); g.closePath(); } }
  else { g.moveTo(x, y - r * 1.2); g.lineTo(x + r * .35, y - r * .35); g.lineTo(x + r * 1.2, y); g.lineTo(x + r * .35, y + r * .35); g.lineTo(x, y + r * 1.2); g.lineTo(x - r * .35, y + r * .35); g.lineTo(x - r * 1.2, y); g.lineTo(x - r * .35, y - r * .35); g.closePath(); }
  g.stroke(); g.fill(); g.restore();
}
function drawBeast(g, s){
  const B = beastDef(s), sh = B && SHEETS && SHEETS[B.mob]; if (!sh) return;
  const bound = s.beast === 'bound', role = B.role || 'magic', rc = ROLE_RGB[role];
  const dive = s.diveT > 0 ? Math.sin(s.diveT / .35 * Math.PI) * 26 : 0, fly = (B.fly ? B.fly + Math.sin(s.t * 3) * 3 : 0) + dive;
  const lk = s.atkT > 0 && s.lx != null ? Math.sin(clamp(1 - s.atkT / .45, 0, 1) * Math.PI) * 6 / (Math.hypot(s.lx, s.ly) || 1) : 0;
  const x = s.x - cam.x + (s.lx || 0) * lk, y = s.y - cam.y + (s.ly || 0) * lk * .6;
  if (x < -80 || x > VW + 80 || y < -100 || y > VH + 80) return;
  const fade = Math.max(0, Math.min(1, s.t * 2.5, bound ? 1 : (s.dur - s.t) * 1.5)), warn = 1;   // v34: no blinking before it leaves (the seconds left show in its name)
  const act = s.atkT > 0 ? 'attack' : s.moving ? 'walk' : 'idle', k = (B.scale || 1) * (s.skT > 0 ? 1 + Math.sin(s.skT / .7 * Math.PI) * .08 : 1), top = (B.h0 || MOB_H_OF(B.mob)) * (B.scale || 1) + fly;
  g.save();
  // role ring on the ground (slowly turning dashes) + a soft contact shadow
  g.globalAlpha = fade; g.strokeStyle = `rgba(${rc},${.55 + Math.sin(T * 3 + s.x) * .15})`; g.lineWidth = 1; g.setLineDash([4, 3]); g.lineDashOffset = -T * 10;
  g.beginPath(); g.ellipse(x, y, 17 * (B.scale || 1) + (bound ? 6 : 0), 6 * (B.scale || 1) + (bound ? 2 : 0), 0, 0, 7); g.stroke(); g.setLineDash([]);
  shadowW(g, x, y, 13 * (B.scale || 1));
  g.translate(x, y - fly); g.scale(k, k);
  g.globalAlpha = fade * warn; SPR.draw(g, sh, act, s.dir || 0, s.t, 0, 0);
  const fl = (s.hurt > 0 ? .45 : 0) + (s.skT > 0 ? Math.sin(s.skT / .7 * Math.PI) * .5 : 0) + (bound ? 0 : .05);
  if (fl > .01){ g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(.7, fl) * fade * warn; SPR.draw(g, sh, act, s.dir || 0, s.t, 0, 0); }
  g.restore();
  // tank's Guardian Roar: a shield bubble
  if (s.guard > 0){ g.save(); const a = Math.min(1, s.guard) * (.55 + Math.sin(T * 6) * .15), R = 20 * (B.scale || 1) + 4;
    g.strokeStyle = `rgba(${rc},${a})`; g.lineWidth = 1.4; g.beginPath(); g.ellipse(x, y - top * .5, R, top * .62, 0, 0, 7); g.stroke();
    g.globalAlpha = a * .18; g.fillStyle = `rgb(${rc})`; g.fill(); g.restore(); }
  s.tagFade = fade;
}
/* beast HP bar + role badge + name, drawn at screen resolution with the same scale as the hero plate (a little smaller) */
function drawBeastTags(){
  const z = TAG_Z();
  for (const s of SUMMONS){
    if (s.kind !== 'beast' || !(s.tagFade > .4)) continue; const B = beastDef(s); if (!B) continue;
    const role = B.role || 'magic', rc = ROLE_RGB[role], fly = B.fly ? B.fly + Math.sin(s.t * 3) * 3 : 0, x = sx(s.x), top = sy(s.y - (B.h0 || MOB_H_OF(B.mob)) * (B.scale || 1) - fly);
    if (x < -80 || x > SW + 80 || top < -60 || top > SH + 60) continue;
    const w = Math.round(46 * z), h = Math.max(3, Math.round(5 * z)), f = clamp((s.hp || 0) / (s.maxhp || 1), 0, 1), bx = Math.round(x - w / 2), by = Math.round(top - 3 * z - h);
    ctx.fillStyle = 'rgba(10,6,14,.85)'; ctx.fillRect(bx - 1, by - 1, w + 2, h + 2); ctx.fillStyle = f > .3 ? (role === 'tank' ? '#7cc4ff' : '#7fe08a') : '#ff6a6a'; ctx.fillRect(bx, by, Math.round(w * f), h);
    if (!SETTINGS.nameTags) continue;
    const left = Math.ceil(s.dur - s.t), fs = Math.round(14 * z); ctx.save(); ctx.font = `800 ${fs}px Mali, sans-serif`; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    const lb = s.beast === 'bound' ? `♛ ${B.name[0]}` : left <= 5 ? `${L(...B.name)} ${left}s` : L(...B.name), ly = by - 3 * z, tw = ctx.measureText(lb).width, ox = 4 * z;
    ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.lineWidth = 2.6 * z; ctx.strokeText(lb, x + ox, ly); ctx.fillStyle = `rgb(${rc})`; ctx.fillText(lb, x + ox, ly);
    roleIcon(ctx, role, x + ox - tw / 2 - 7 * z, ly - fs * .36, 4.5 * z, `rgb(${rc})`); ctx.restore();
  }
}
const MOB_H_OF = k => (typeof MOB_H !== 'undefined' && MOB_H[k]) || 34;
function drawMobW(g, m){
  const sh = m.st && m.st.stun > 0 && m.st.shock > 0 && !m.dead ? (Math.random() - .5) * 2.4 : 0;   // electrocuted: twitching
  const x = m.x - cam.x + sh, y = m.y - cam.y;
  const mg = m.def.boss ? 40 * (m.def.bsz || 1.6) : 0;   // (v117) a giant can stand half off screen and still show
  if (x < -70 - mg || x > VW + 70 + mg || y < -90 || y > VH + 80 + mg * 2) return;
  const [act, t] = mobAnim(m), fz = m.fz;
  if (fz && fz.hidden){ if (typeof furyHidden === 'function') furyHidden(g, m, x, y); return; }   // a burrowed / soaring boss
  const lift = fz ? fz.z || 0 : 0;
  if (fz && typeof furyAura === 'function') furyAura(g, m, x, y);
  if (m.elite && !m.dead && typeof eliteAura === 'function') eliteAura(g, m, x, y);
  g.save();
  if (m.dead) g.globalAlpha = m.vanish ? Math.max(0, 1 - m.deadT * 2) : (m.deadT > .8 ? Math.max(0, 1 - (m.deadT - .8) * 2.5) : 1);
  else if (T - m.born < .4) g.globalAlpha = (T - m.born) / .4;
  shadowW(g, x, y, (m.type === 'lantern' ? 6 : m.def.r * .95) * (lift ? Math.max(.4, 1 - lift / 160) : 1));
  if (fz || m.def.boss){ const bz = m.def.boss ? m.def.bsz || (typeof BOSS_SZ !== 'undefined' ? BOSS_SZ : 1) : 1, k = bz * (fz ? 1 + ((fz.phase || 1) - 1) * .04 + (fz.berserk > 0 ? .05 : 0) : 1); g.translate(x, y - lift); { const br = !m.dead && act === 'idle' ? Math.sin(T * 1.9 / Math.sqrt(bz) + (m.id || 0)) : 0; g.scale(k * (1 - br * .01), k * (1 + br * .022)); }   /* (v117) a big chest breathes slowly */
    SPR.draw(g, SHEETS[m.type], act, m.dir || 0, t, 0, 0);
    if (fz && (fz.phase >= 3 || fz.berserk > 0)){ g.globalCompositeOperation = 'lighter'; g.globalAlpha = fz.berserk > 0 ? .26 : .14; /* (v117) a steady glow, no pulsing */ SPR.draw(g, SHEETS[m.type], act, m.dir || 0, t, 0, 0); } }
  else if (m.elite){ g.translate(x, y); g.scale(1.3, 1.3); SPR.draw(g, SHEETS[m.type], act, m.dir || 0, t, 0, 0);
    if (!m.dead){ g.globalCompositeOperation = 'lighter'; g.globalAlpha = .1 + Math.sin(T * 4 + m.id) * .05; SPR.draw(g, SHEETS[m.type], act, m.dir || 0, t, 0, 0); } }
  else if (!m.dead && act === 'idle'){ const br = Math.sin(T * 2.6 + (m.id || 0) * 1.7);   // (v83) idle breathing: a slow chest swell, feet stay planted
    g.translate(x, y); g.scale(1 - br * .012, 1 + br * .028); SPR.draw(g, SHEETS[m.type], act, m.dir || 0, t, 0, 0); }
  else SPR.draw(g, SHEETS[m.type], act, m.dir || 0, t, x, y);
  g.restore();
  if (false && m.flash > 0 && !m.dead){ g.save(); g.globalCompositeOperation = 'lighter';   // v56: no white hit flash (the squash shows the hit)
 g.globalAlpha = Math.min(.6, m.flash * 5); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x, y - MOB_H[m.type] * .5, m.def.r, MOB_H[m.type] * .45, 0, 0, 7); g.fill(); g.restore(); }
}
function drawNpcW(g, n){
  const x = n.x - cam.x, y = n.y - cam.y;
  if (x < -60 || x > VW + 60 || y < -80 || y > VH + 40) return;
  const near = dist(n, P) < 110;
  shadowW(g, x, y, 9);
  SPR.draw(g, (typeof NPC_LOOKS !== 'undefined' && NPC_LOOKS[n.id] && npcSheet(n.id)) || SHEETS[NPC_SPR[n.id] || 'aunt'], 'idle', near ? SPR.dirFromVec(P.x - n.x, P.y - n.y) : 0, T + (n.id === 'job' ? 0 : .5), x, y, {lazy:true});
}
function drawPlayerW(g){
  const x = P.x - cam.x, y = P.y - cam.y;
  const act = P.act || 'idle', art = S.job === 'novice' && ART.has('villager', act, P.dir || 0);
  if (!art && (!P.dead || P.animT < 4)) shadowW(g, x, y, P.ride ? 16 : 9);
  if (P.roll){ g.save(); g.globalAlpha = .35; SPR.draw(g, heroSheet(), 'roll', P.dir || 0, P.animT, x - P.roll.vx * 8, y - P.roll.vy * 8); g.restore(); }
  const veil = hideBuff() ? .38 + Math.sin(T * 6) * .06 : 1;
  if (veil < 1){ g.save(); g.globalAlpha = veil; }
  if (art) ART.draw(g, 'villager', act, P.dir || 0, P.animT, x, y);
  else SPR.draw(g, heroSheet(), P.spin > 0 ? (heroSheet().index.whirl ? 'whirl' : 'skill') : act, P.spin > 0 && !heroSheet().index.whirl ? Math.floor(T * 16) % 8 : P.dir || 0, P.spin > 0 ? T : P.animT, x, y);
  if (veil < 1) g.restore();
  if (false && P.hurt > 0 && !P.dead){ g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .35; g.fillStyle = '#ff4040'; g.beginPath(); g.ellipse(x, y - 22, 10, 21, 0, 0, 7); g.fill(); g.restore(); }
}
function drawPetW(g){
  if (!S.pet || !SHEETS[S.pet]) return;
  const x = PET.x - cam.x, y = PET.y - cam.y;
  shadowW(g, x, y, MOB[S.pet].r * .8);
  SPR.draw(g, SHEETS[S.pet], PET.moving ? 'walk' : 'idle', PET.dir || 0, PET.t, x, y);
}
function drawPropW(g, p, im, x, y){
  // trees and houses fade when the player walks behind them
  // (v59) no save()/restore() per prop: on phones that pair alone was a third of the frame. State is set and put back by hand.
  const behind = P.y < p.y && P.y > p.y - im.h * .9 && Math.abs(P.x - p.x) < im.w * .42 && im.h > 50;
  const sm = g.imageSmoothingEnabled, a0 = g.globalAlpha; if (!sm) g.imageSmoothingEnabled = true;
  if (behind) g.globalAlpha = a0 * .55;
  const sk = typeof LIVE !== 'undefined' ? LIVE.sway(p) : 0;   // wind: the crown leans, the foot stays put
  if (sk){ const m = g.getTransform(); g.translate(x, y); g.transform(1, 0, -sk, 1, 0, 0); g.drawImage(im.img, -im.ax, -im.ay, im.w, im.h); g.setTransform(m); }
  else g.drawImage(im.img, x - im.ax, y - im.ay, im.w, im.h);
  if (behind) g.globalAlpha = a0;
  if (!sm) g.imageSmoothingEnabled = false;
}
function nameTag(x, y, s, col = '#fff', bg = 'rgba(20,18,30,.72)'){
  if (!SETTINGS.nameTags && bg === 'rgba(20,18,30,.72)') return;
  const z = clamp(PX / 2, .5, 2.6); ctx.font = F(500, Math.round(12 * z)); const w = ctx.measureText(s).width + 10 * z;
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 13 * z, w, 17 * z, 4); ctx.fill();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(s, x, y);
}

/* ---------- the hero plate ----------
   Over the head, bottom-up: guild ⟨…⟩ · name (glowing gilded lettering, no level) · «title» · and the cast bar on top of them all.
   Under the feet: a slim HP bar and an SP bar.
   Everything scales with the world zoom (PX, which already follows the screen size and the zoom buttons), so the plate keeps
   the same proportion to the character on phones, tablets, laptops and 4K screens. */
const TAG_Z = () => clamp(PX / 2, .45, 2.8) * (typeof SETTINGS !== 'undefined' && +SETTINGS.uiScale ? clamp(+SETTINGS.uiScale, .7, 1.3) : 1);   // (v132) five UI sizes
const HEAD_H = ride => (ride ? 58 : 43);          // world units from the feet to just above the hair (riding: the mount lifts you)
const HERO_NAME = {me:['#fffdf0', '#ffe08a', '#e8a032', 'rgba(255,190,70,', '#3a1a04'], mate:['#f4fff8', '#9ff0c8', '#2fb884', 'rgba(90,240,170,', '#05301e'], other:['#f6f9ff', '#cfe0ff', '#7fa2e8', 'rgba(140,180,255,', '#0c1838']};
/* draws title / name / guild stacked upward from headY (screen px) and returns the top of the stack.
   The name: a deep outline, a thin gold rim, a gilded gradient fill with a band of light sweeping across it, a pulsing
   glow, carved kanok flourishes on both sides and a twinkle. Heroes at Lv 100+ get a ring of sparks, Lv 120 a crown jewel.
   The title: an enamelled ribbon plaque in the title's tier colour with gold edges and swallow-tail ends, its text gilded. */
function nameFlourish(x0, mid, d, z, c1, glow){
  const ctx = NCTX || MAINCTX;
  ctx.save(); ctx.translate(x0, mid); ctx.scale(d * z, z);
  ctx.strokeStyle = c1; ctx.lineWidth = 1.2; ctx.shadowColor = glow + '.9)'; ctx.shadowBlur = 5 * z; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(5, -5, 11, -4, 12, 0); ctx.bezierCurveTo(13, 3, 9, 4, 8, 1.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2, 0); ctx.quadraticCurveTo(10, 4, 18, 0); ctx.stroke();
  ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(20, -2.6); ctx.lineTo(22.6, 0); ctx.lineTo(20, 2.6); ctx.lineTo(17.4, 0); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/* the title plaque, by tier: 0 bronze · 1 silver · 2 gold · 3 legend. The harder the title, the grander the plaque:
   bronze is a plain enamel tab; silver adds side gems; gold adds swallow-tail ribbons, a glow and a running glint;
   legend adds spread wings of light, a prismatic rim, a crown jewel and orbiting sparks. Text is always large,
   bright and outlined so it reads at a glance. */
const TITLE_TIER = [
  {edge:['#5a2e10', '#f0b080', '#8a4a20'], bg:['#3a1c0c', '#24100a'], ink:'#ffe2c8', glow:'rgba(240,160,100,'},
  {edge:['#5a6070', '#ffffff', '#8a94a8'], bg:['#1e2636', '#10141e'], ink:'#f4f8ff', glow:'rgba(200,220,255,'},
  {edge:['#8a5a10', '#fff3c0', '#c88a1a'], bg:['#4a2408', '#24100a'], ink:'#fff6d0', glow:'rgba(255,200,80,'},
  {edge:['#8a2a8a', '#ffffff', '#4a8aff'], bg:['#3a0c4a', '#140620'], ink:'#ffffff', glow:'rgba(255,140,240,'}
];
function titlePlaque(x, bottom, t, tier, z, pul, star){
  const ctx = NCTX || MAINCTX;
  const D = TITLE_TIER[clamp(tier, 0, 3)], ts = Math.round(12.5 * z);
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.font = `800 ${ts}px "Mali", system-ui, sans-serif`;
  const tw = ctx.measureText(t).width, ph = ts + 8 * z, pw = tw + (tier >= 2 ? 26 : 18) * z, cy = bottom - 3 * z - ph / 2, y0 = cy - ph / 2, cx = x;
  const tail = tier >= 2 ? 8 * z : 0, nb = 3.6 * z;
  const shape = () => { ctx.beginPath(); ctx.moveTo(cx - pw / 2, y0); ctx.lineTo(cx + pw / 2, y0);
    if (tail){ ctx.lineTo(cx + pw / 2 + tail, cy - 1.5 * z); ctx.lineTo(cx + pw / 2 + tail - nb, cy); ctx.lineTo(cx + pw / 2 + tail, cy + 1.5 * z); } else ctx.quadraticCurveTo(cx + pw / 2 + 5 * z, cy, cx + pw / 2, y0 + ph);
    ctx.lineTo(cx + pw / 2, y0 + ph); ctx.lineTo(cx - pw / 2, y0 + ph);
    if (tail){ ctx.lineTo(cx - pw / 2 - tail, cy + 1.5 * z); ctx.lineTo(cx - pw / 2 - tail + nb, cy); ctx.lineTo(cx - pw / 2 - tail, cy - 1.5 * z); } else ctx.quadraticCurveTo(cx - pw / 2 - 5 * z, cy, cx - pw / 2, y0);
    ctx.closePath(); };
  // legend: wings of light spreading behind the plaque
  if (tier >= 3){ ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const d of [-1, 1]) for (let i = 0; i < 4; i++){ const len = (16 + i * 5) * z * (1 + .08 * Math.sin(T * 2 + i)), a = -.5 + i * .32, bx = cx + d * (pw / 2 + tail - 2 * z);
      ctx.save(); ctx.translate(bx, cy); ctx.scale(d, 1); ctx.rotate(a); const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, `hsla(${(T * 60 + i * 40) % 360},100%,80%,.75)`); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -1.2 * z); ctx.quadraticCurveTo(len * .6, -3.5 * z, len, 0); ctx.quadraticCurveTo(len * .6, 2 * z, 0, 1.2 * z); ctx.fill(); ctx.restore(); }
    ctx.restore(); }
  // body
  const bg = ctx.createLinearGradient(0, y0, 0, y0 + ph); bg.addColorStop(0, D.bg[0]); bg.addColorStop(1, D.bg[1]);
  shape(); ctx.fillStyle = bg; if (tier >= 2){ ctx.shadowColor = D.glow + (.7 + .3 * pul) + ')'; ctx.shadowBlur = (6 + 6 * pul + (tier - 2) * 6) * z; } ctx.fill(); ctx.shadowBlur = 0;
  // rim (legend: shifting prism colours)
  let eg; if (tier >= 3){ eg = ctx.createLinearGradient(cx - pw / 2, 0, cx + pw / 2, 0); for (let i = 0; i <= 6; i++) eg.addColorStop(i / 6, `hsl(${(T * 80 + i * 60) % 360},95%,72%)`); }
  else { eg = ctx.createLinearGradient(0, y0, 0, y0 + ph); eg.addColorStop(0, D.edge[1]); eg.addColorStop(.5, D.edge[2]); eg.addColorStop(1, D.edge[0]); }
  shape(); ctx.strokeStyle = eg; ctx.lineWidth = (tier >= 2 ? 1.6 : 1.2) * z; ctx.stroke();
  if (tier >= 1){ ctx.globalAlpha = .55; ctx.strokeStyle = D.edge[1]; ctx.lineWidth = .6 * z; ctx.beginPath(); ctx.moveTo(cx - pw / 2 + 3 * z, y0 + 2.4 * z); ctx.lineTo(cx + pw / 2 - 3 * z, y0 + 2.4 * z); ctx.stroke(); ctx.globalAlpha = 1;
    for (const d of [-1, 1]){ const gx = cx + d * (pw / 2 - 5 * z), r = 2 * z; ctx.fillStyle = tier >= 3 ? `hsl(${(T * 90 + d * 90) % 360},90%,70%)` : tier === 2 ? '#ff4a5a' : '#bfe4ff'; ctx.beginPath(); ctx.moveTo(gx, cy - r); ctx.lineTo(gx + r, cy); ctx.lineTo(gx, cy + r); ctx.lineTo(gx - r, cy); ctx.closePath(); ctx.fill(); } }
  // the text: dark outline, tier glow, bright fill
  ctx.lineWidth = 3.4 * z; ctx.strokeStyle = 'rgba(0,0,0,.92)'; ctx.strokeText(t, cx, cy + .5 * z);
  ctx.fillStyle = D.ink; ctx.shadowColor = D.glow + '1)'; ctx.shadowBlur = (tier >= 2 ? 6 : 3) * z; ctx.fillText(t, cx, cy + .5 * z); ctx.shadowBlur = 0;
  // gold and legend: a glint running across
  if (tier >= 2){ const ph2 = ((T * .35 + x * .004) % 1.6) / 1.6; if (ph2 < 1){ ctx.save(); shape(); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; const gx = cx - pw / 2 + ph2 * pw, gl = ctx.createLinearGradient(gx - 8 * z, 0, gx + 8 * z, 0);
    gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(.5, 'rgba(255,255,255,.45)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gl; ctx.fillRect(gx - 8 * z, y0, 16 * z, ph); ctx.restore(); } }
  let top = y0 - 2 * z;
  // legend: crown jewel and orbiting sparks
  if (tier >= 3){ const jy = y0 - 1 * z, r = 3.4 * z; ctx.fillStyle = '#ffd34a'; ctx.beginPath(); ctx.moveTo(cx - 6 * z, jy); ctx.lineTo(cx - 3 * z, jy - 4 * z); ctx.lineTo(cx, jy - 1.5 * z); ctx.lineTo(cx + 3 * z, jy - 4 * z); ctx.lineTo(cx + 6 * z, jy); ctx.closePath(); ctx.fill();
    ctx.fillStyle = `hsl(${(T * 100) % 360},95%,72%)`; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8 * z; ctx.beginPath(); ctx.arc(cx, jy - 5.5 * z, r * .7, 0, 7); ctx.fill(); ctx.shadowBlur = 0; top = jy - 9 * z;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++){ const a = T * 1.6 + i * 1.257, px = cx + Math.cos(a) * (pw / 2 + 6 * z), py = cy + Math.sin(a) * (ph * .9), k = .5 + .5 * Math.sin(a);
      ctx.globalAlpha = .4 + .6 * k; ctx.fillStyle = `hsl(${(i * 72 + T * 60) % 360},100%,80%)`; star(px, py, (1.2 + 1.6 * k) * z); } ctx.restore(); }
  ctx.restore(); return top;
}
const NAME_K = 2;   // name, guild and title over a hero's head are drawn twice the base tag size
function heroName(x, headY, s, kind = 'me', opt = {}){
  const ctx = NCTX || MAINCTX;
  const z = TAG_Z() * NAME_K;
  if (!SETTINGS.nameTags) return headY - 2 * z;
  const [c0, c1, c2, glow, ink] = HERO_NAME[kind] || HERO_NAME.me, fs = Math.round(15 * z), gs = Math.round(fs * .7), ts = Math.round(fs * .7), pul = .5 + .5 * Math.sin(T * 2.4 + x * .01), lv = opt.lv | 0;
  const gy = headY - 3 * z, y = opt.guild ? gy - gs - 8 * z : headY - 4 * z;   // room under the name for Thai vowels below the line, so it never touches the guild tag
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  if (opt.guild){ ctx.font = `700 ${gs}px "Mali", system-ui, sans-serif`; const t = `⟨${opt.guild}⟩`;
    ctx.lineWidth = 3.2 * z; ctx.strokeStyle = 'rgba(2,24,26,.92)'; ctx.strokeText(t, x, gy);
    const gg = ctx.createLinearGradient(0, gy - gs, 0, gy); gg.addColorStop(0, '#e8fff8'); gg.addColorStop(1, '#4ad8c0'); ctx.fillStyle = gg; ctx.shadowColor = 'rgba(80,240,210,.7)'; ctx.shadowBlur = 5 * z; ctx.fillText(t, x, gy); ctx.shadowBlur = 0; }
  ctx.font = `800 ${fs}px "Mali", system-ui, sans-serif`;
  const w = ctx.measureText(s).width, top = y - fs * .82, mid = y - fs * .32;
  // a soft glowing plate behind the name
  { const pg = ctx.createRadialGradient(x, mid, 0, x, mid, w * .75 + 14 * z); pg.addColorStop(0, glow + (.18 + .1 * pul) + ')'); pg.addColorStop(1, glow + '0)'); ctx.fillStyle = pg; ctx.fillRect(x - w - 20 * z, mid - fs, w * 2 + 40 * z, fs * 2); }
  for (const d of [-1, 1]) nameFlourish(x + d * (w / 2 + 5 * z), mid, d, z, c1, glow);
  // outline: a glowing halo, a crisp dark edge, then a thin bright rim
  ctx.lineWidth = 6.5 * z; ctx.strokeStyle = glow + (.55 + .3 * pul) + ')'; ctx.shadowColor = glow + '1)'; ctx.shadowBlur = (7 + 5 * pul) * z; ctx.strokeText(s, x, y); ctx.shadowBlur = 0;
  ctx.lineWidth = 3.6 * z; ctx.strokeStyle = ink; ctx.strokeText(s, x, y);
  // gilded fill with a sweeping band of light
  const sw = ((T * .45 + x * .002) % 1.6) / 1.6, bx = x - w / 2 - 20 * z + sw * (w + 40 * z), fg = ctx.createLinearGradient(x - w / 2, top, x + w / 2, y + 2);
  fg.addColorStop(0, c1); fg.addColorStop(Math.max(0, Math.min(1, (bx - (x - w / 2)) / w - .12)), c2);
  fg.addColorStop(Math.max(0, Math.min(1, (bx - (x - w / 2)) / w)), '#ffffff'); fg.addColorStop(Math.max(0, Math.min(1, (bx - (x - w / 2)) / w + .12)), c1); fg.addColorStop(1, c2);
  const vg = ctx.createLinearGradient(0, top, 0, y + 2); vg.addColorStop(.45, c0); vg.addColorStop(1, c1);
  vg.addColorStop(0, '#ffffff'); ctx.fillStyle = vg; ctx.fillText(s, x, y);
  ctx.globalAlpha = .35; ctx.fillStyle = fg; ctx.fillText(s, x, y); ctx.globalAlpha = 1;
  // twinkle
  const tx = x - w / 2 + ((T * .35 + x * .003) % 1.4) / 1.4 * (w + 20 * z) - 10 * z, ty = top + fs * .12, a = Math.max(0, Math.sin(((T * .35 + x * .003) % 1.4) / 1.4 * Math.PI));
  const star = (sx0, sy0, r) => { ctx.beginPath(); ctx.moveTo(sx0, sy0 - r); ctx.lineTo(sx0 + r * .26, sy0 - r * .26); ctx.lineTo(sx0 + r, sy0); ctx.lineTo(sx0 + r * .26, sy0 + r * .26); ctx.lineTo(sx0, sy0 + r); ctx.lineTo(sx0 - r * .26, sy0 + r * .26); ctx.lineTo(sx0 - r, sy0); ctx.lineTo(sx0 - r * .26, sy0 - r * .26); ctx.closePath(); ctx.fill(); };
  if (a > .05){ ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.shadowColor = glow + '1)'; ctx.shadowBlur = 8 * z; star(tx, ty, 3.6 * z); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }
  // prestige: sparks orbiting the name at Lv 100+
  if (lv >= 100){ ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++){ const an = T * 1.3 + i * 1.047, px = x + Math.cos(an) * (w / 2 + 14 * z), py = mid + Math.sin(an) * fs * .62, k = .5 + .5 * Math.sin(an);
      ctx.globalAlpha = .35 + .65 * k; ctx.fillStyle = i % 2 ? '#fff4c0' : c1; star(px, py, (1.2 + 1.4 * k) * z); }
    ctx.restore(); }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  let out = top - 3 * z;
  if (lv >= 120){ const cy = top - 4 * z, r = 3.6 * z; ctx.save(); ctx.fillStyle = '#ffd34a'; ctx.strokeStyle = '#5a3006'; ctx.lineWidth = 1 * z;
    ctx.beginPath(); ctx.moveTo(x - 7 * z, cy + 2 * z); ctx.lineTo(x - 8 * z, cy - 4 * z); ctx.lineTo(x - 3.5 * z, cy - 1 * z); ctx.lineTo(x, cy - 6.5 * z); ctx.lineTo(x + 3.5 * z, cy - 1 * z); ctx.lineTo(x + 8 * z, cy - 4 * z); ctx.lineTo(x + 7 * z, cy + 2 * z); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff3a5a'; ctx.shadowColor = '#ff6a8a'; ctx.shadowBlur = (4 + 4 * pul) * z; ctx.beginPath(); ctx.arc(x, cy - .5 * z, r * .38, 0, 7); ctx.fill(); ctx.restore(); out = cy - 8 * z; }
  if (opt.title) out = titlePlaque(x, out, opt.title, opt.tier | 0, z, pul, star);
  ctx.restore();
  return out;
}
/* floating numbers: a quick pop, a dark outline and a glow in their own colour; criticals: see drawCrit */
function drawDmgText(t){
  const k = t.t / t.life, z = clamp(PX / 2.2, 1.15, 2.6), crit = t.size >= 20 && /!$/.test(t.s), x = sx(t.x), y = sy(t.y);
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  if (!crit){
    const pop = k < .1 ? 1.35 - k / .1 * .35 : 1; ctx.globalAlpha = 1 - k * k; ctx.translate(x, y); ctx.scale(pop * z, pop * z);
    ctx.font = FD(800, t.size); if (t.ring){ ctx.lineWidth = 11; ctx.strokeStyle = t.ring; ctx.strokeText(t.s, 0, 0); } ctx.globalAlpha *= .4; ctx.lineWidth = 8; ctx.strokeStyle = t.col; ctx.strokeText(t.s, 0, 0); ctx.globalAlpha /= .4; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText(t.s, 0, 0);
    ctx.fillStyle = t.col; ctx.fillText(t.s, 0, 0); ctx.restore(); return; }   // (v59) no shadowBlur glow: it was one of the costliest things drawn each frame
  drawCrit(t, k, z, x, y);
}
/* criticals (v28): an italic, per-digit "stamp" in the style of modern action RPGs —
   · a CRITICAL tag slides in above the number; the digits drop in one after another with an overshoot
   · each digit: white-hot top → gold → ember bottom, a dark red-black rim, a bright inner edge, a hot glow while fresh
   · behind it: a slash of light across the hit, a shockwave ring and shards flying out
   · it then holds, drifts up and shrinks away. A bigger hit (more digits) gets a bigger stamp. */
function drawCrit(t, k, z, x, y){
  const s = t.s.replace(/!$/, ''), n = s.length, big = Math.min(1.35, 1 + Math.max(0, n - 3) * .07), fs = (t.size + 6) * big;
  const out = k > .72 ? (k - .72) / .28 : 0;
  ctx.globalAlpha = 1 - out * out; ctx.translate(x, y - 6 * z - out * 10 * z); ctx.scale(z * (1 - out * .18), z * (1 - out * .18));
  ctx.font = FD(900, Math.round(fs));
  if (!t._cw){ t._cw = [...s].map(ch => ctx.measureText(ch).width * .92); t._w = t._cw.reduce((a, b) => a + b, 0); t._sd = (t.x * 9301 + t.y * 49297) % 1000 / 1000; }
  const W = t._w, H = fs, ang = -.2 + t._sd * .12;
  // 1) slash of light across the hit
  if (k < .45){ const q = Math.min(1, k / .1), f = 1 - Math.max(0, (k - .12) / .33);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.rotate(ang); const L2 = (W * .9 + 40) * q, th = H * .2 * f;
    const sg = ctx.createLinearGradient(-L2, 0, L2, 0); sg.addColorStop(0, 'rgba(255,120,30,0)'); sg.addColorStop(.5, `rgba(255,250,220,${.95 * f})`); sg.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(-L2, -H * .38); ctx.lineTo(0, -H * .38 - th); ctx.lineTo(L2, -H * .38); ctx.lineTo(0, -H * .38 + th); ctx.closePath(); ctx.fill(); ctx.restore(); }
  // 2) shockwave ring + core flash
  if (k < .5){ const q = k / .5; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(255,200,90,${(1 - q) * .8})`; ctx.lineWidth = 5 * (1 - q) + 1; ctx.beginPath(); ctx.ellipse(0, -H * .38, W * .45 + 50 * q, (W * .45 + 50 * q) * .42, 0, 0, 7); ctx.stroke();
    if (k < .18){ const fr = ctx.createRadialGradient(0, -H * .38, 0, 0, -H * .38, W * .7); fr.addColorStop(0, `rgba(255,245,200,${.7 * (1 - k / .18)})`); fr.addColorStop(1, 'rgba(255,140,40,0)'); ctx.fillStyle = fr; ctx.fillRect(-W, -H * 1.2, W * 2, H * 1.6); }
    ctx.restore(); }
  // 3) shards
  if (k < .6){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; const q = k / .6;
    for (let i = 0; i < 9; i++){ const a = i / 9 * Math.PI * 2 + t._sd * 6, sp = 30 + (i * 37 % 23), r = W * .3 + sp * Math.sqrt(q) * 1.6, px = Math.cos(a) * r, py = -H * .38 + Math.sin(a) * r * .55 + q * q * 18;
      ctx.save(); ctx.translate(px, py); ctx.rotate(a); ctx.fillStyle = i % 3 ? `rgba(255,214,110,${1 - q})` : `rgba(255,255,255,${1 - q})`;
      ctx.beginPath(); ctx.moveTo(5 * (1 - q) + 2, 0); ctx.lineTo(0, 1.4); ctx.lineTo(-3, 0); ctx.lineTo(0, -1.4); ctx.closePath(); ctx.fill(); ctx.restore(); }
    ctx.restore(); }
  // 4) the CRITICAL tag
  { const q = Math.min(1, k / .14), e = 1 - Math.pow(1 - q, 3); ctx.save(); ctx.globalAlpha *= q; ctx.transform(1, 0, -.22, 1, 0, 0);
    ctx.font = FD(900, Math.round(fs * .34)); ctx.textAlign = 'left'; const tx = -W / 2 - 4 - (1 - e) * 26, ty = -H * .86;
    ctx.lineWidth = 4; ctx.strokeStyle = '#3a0500'; ctx.strokeText('CRITICAL', tx, ty);
    const tg = ctx.createLinearGradient(0, ty - fs * .3, 0, ty); tg.addColorStop(0, '#fff7d0'); tg.addColorStop(1, '#ff9a2a'); ctx.fillStyle = tg; ctx.fillText('CRITICAL', tx, ty); ctx.restore(); }
  // 5) the digits, stamped one by one
  ctx.save(); ctx.transform(1, 0, -.18, 1, 0, 0); ctx.textAlign = 'left';
  const g = ctx.createLinearGradient(0, -H * .82, 0, 0); g.addColorStop(0, '#ffffff'); g.addColorStop(.3, '#fff3a8'); g.addColorStop(.62, '#ffbe2a'); g.addColorStop(1, '#ff5a12');
  let cx = -W / 2; const hot = Math.max(0, 1 - k / .35);
  for (let i = 0; i < n; i++){ const ch = s[i], cw = t._cw[i], d = k - i * .022, q = Math.max(0, Math.min(1, d / .12));
    if (q <= 0){ cx += cw; continue; }
    const sc = q < 1 ? 2.1 - 1.1 * (1 - Math.pow(1 - q, 3)) + Math.sin(q * Math.PI) * .18 : 1 + Math.sin((d - .12) * 26) * .03 * Math.max(0, 1 - (d - .12) * 4), wob = (1 - q) * -10;
    ctx.save(); ctx.globalAlpha *= Math.min(1, q * 1.6); ctx.translate(cx + cw / 2, wob); ctx.scale(sc, sc); ctx.translate(-cw / 2 - cw * .04, 0);
    if (t.ring){ ctx.lineWidth = 16; ctx.strokeStyle = t.ring; ctx.strokeText(ch, 0, 0); }
    if (hot > 0){ ctx.save(); ctx.shadowColor = `rgba(255,70,10,${hot})`; ctx.shadowBlur = 16; ctx.lineWidth = 11; ctx.strokeStyle = `rgba(232,30,8,${.55 + hot * .45})`; ctx.strokeText(ch, 0, 0); ctx.restore(); }
    else { ctx.lineWidth = 11; ctx.strokeStyle = 'rgba(200,24,6,.55)'; ctx.strokeText(ch, 0, 0); }
    ctx.lineWidth = 6.5; ctx.strokeStyle = '#2e0300'; ctx.strokeText(ch, 0, 0);
    ctx.lineWidth = 2; ctx.strokeStyle = '#ffd36a'; ctx.strokeText(ch, 0, 0);
    ctx.fillStyle = g; ctx.fillText(ch, 0, 0);
    // a white-hot glint sweeping across the fresh digits
    if (k < .5){ const gx = (k / .5) * (W + 40) - W / 2 - 20 - cx; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= .8 * (1 - k / .5);
      const sw = ctx.createLinearGradient(gx - 14, 0, gx + 14, 0); sw.addColorStop(0, 'rgba(255,255,255,0)'); sw.addColorStop(.5, 'rgba(255,255,255,.95)'); sw.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sw; ctx.fillText(ch, 0, 0); ctx.restore(); }
    ctx.restore(); cx += cw; }
  ctx.restore();
  ctx.restore();
}
/* HP + SP under the feet: framed, rounded, coloured by how full they are; a soft white trail shows HP just lost */
function vitalBars(x, footY, hp, sp, o = {}){
  const z = TAG_Z(), w = Math.round(38 * z), hh = Math.max(3, Math.round(4 * z)), sh = sp == null ? 0 : Math.max(2, Math.round(3 * z)), gap = sh ? Math.max(1, Math.round(z)) : 0;
  const x0 = Math.round(x - w / 2), y0 = Math.round(footY + 5 * z), H = hh + gap + sh;
  hp = clamp(hp || 0, 0, 1);
  ctx.save();
  ctx.fillStyle = 'rgba(8,6,12,.78)'; ctx.beginPath(); ctx.roundRect(x0 - 1.5, y0 - 1.5, w + 3, H + 3, 2.5); ctx.fill();
  ctx.strokeStyle = o.foe ? 'rgba(255,120,100,.8)' : 'rgba(240,200,120,.45)'; ctx.lineWidth = 1; ctx.stroke();
  if (o.trail != null && o.trail > hp){ ctx.fillStyle = 'rgba(255,240,220,.55)'; ctx.fillRect(x0, y0, w * clamp(o.trail, 0, 1), hh); }
  const hc = o.foe ? ['#ff8a7a', '#c8322a'] : hp > .5 ? ['#8ff09a', '#2f9a48'] : hp > .25 ? ['#ffe07a', '#c08a1a'] : ['#ff8a7a', '#c8322a'];
  let g = ctx.createLinearGradient(0, y0, 0, y0 + hh); g.addColorStop(0, hc[0]); g.addColorStop(1, hc[1]); ctx.fillStyle = g; ctx.fillRect(x0, y0, w * hp, hh);
  if (sh){ g = ctx.createLinearGradient(0, y0 + hh + gap, 0, y0 + H); g.addColorStop(0, '#9fd4ff'); g.addColorStop(1, '#2f6fd0'); ctx.fillStyle = g; ctx.fillRect(x0, y0 + hh + gap, w * clamp(sp, 0, 1), sh); }
  if (o.foe){ ctx.font = `700 ${Math.round(10 * z)}px Mali, sans-serif`; ctx.textAlign = 'right'; ctx.fillStyle = '#ffb0a0'; ctx.fillText('⚔', x0 - 3 * z, y0 + H); }
  ctx.restore();
}
const VIT = {trail:1};

/* cast bar on top of the hero plate while a skill is chanted: the skill name and a bar in the skill's element colour
   (v34: wider, thicker and a larger name, in proportion with the hero plate) */
const CAST_COL = {fire:['#ffb070', '#d0401c'], water:['#bfe8ff', '#3a8ee0'], wind:['#d8c0ff', '#7a4ae0'], holy:['#fff6c0', '#e3b04b'], earth:['#e8cf90', '#8a5a22'], shadow:['#d0a0ff', '#4a1e80'], poison:['#c8f090', '#4a8a1e'], neutral:['#f7dc9a', '#c98f2e']};
function drawHeadCast(topY){
  const c = P.cast; if (!c || P.dead) return; const sk = SKILLS[c.id]; if (!sk) return;
  const z = TAG_Z(), k = clamp(c.t / c.total, 0, 1), x = sx(P.x), h = Math.max(6, Math.round(8 * z)), y = (topY != null ? topY : sy(P.y - HEAD_H(P.ride))) - h - 3 * z;
  const w = Math.round(96 * z), x0 = Math.round(x - w / 2), y0 = Math.round(y), [c1, c2] = CAST_COL[sk.elem] || CAST_COL.neutral;
  ctx.save();
  // frame
  ctx.fillStyle = 'rgba(12,6,4,.82)'; ctx.beginPath(); ctx.roundRect(x0 - 2, y0 - 2, w + 4, h + 4, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(240,195,90,.75)'; ctx.lineWidth = 1; ctx.stroke();
  // fill
  const g = ctx.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.shadowColor = c1; ctx.shadowBlur = 6 * z; ctx.beginPath(); ctx.roundRect(x0, y0, Math.max(1, w * k), h, 2); ctx.fill(); ctx.shadowBlur = 0;
  // a bright tip that runs along the bar
  if (k > .02 && k < .99){ ctx.fillStyle = '#fff'; ctx.globalAlpha = .85; ctx.fillRect(x0 + w * k - 1, y0 - 1, 2, h + 2); ctx.globalAlpha = 1; }
  // name (and seconds left) just above
  const fs = Math.round(14 * z); ctx.font = `800 ${fs}px "Mali", system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  const t = `${skName(sk)} · ${Math.max(0, c.total - c.t).toFixed(1)}s`; ctx.lineWidth = 3 * z; ctx.strokeStyle = 'rgba(20,8,4,.9)'; ctx.strokeText(t, x, y0 - 4 * z); ctx.fillStyle = c1; ctx.fillText(t, x, y0 - 4 * z);
  ctx.restore();
  return y0 - 4 * z - fs;
}
let HOLE_SPR = null;
function holeSpr(){ if (HOLE_SPR) return HOLE_SPR; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return (HOLE_SPR = c); }
function render(){
  updZoom(); SPR.tick();
  const [shx, shy] = VFX.shakeOffset();
  { const tx = clamp(P.x - VW / 2, 0, W - VW), ty = clamp(P.y - VH / 2, 0, H - VH), now = performance.now(), dt = Math.min(.1, (now - (CAMS.t || now)) / 1000); CAMS.t = now;
    // smooth camera: eases after the hero (snaps on a new map or a long jump); crisp mode follows exactly
    if (!GFX.smooth || SETTINGS.smoothCam === false || CAMS.x == null || CAMS.map !== MAP_ID || Math.hypot(tx - CAMS.x, ty - CAMS.y) > 260){ CAMS.x = tx; CAMS.y = ty; CAMS.map = MAP_ID; }
    else { const k = 1 - Math.exp(-dt * 8); CAMS.x += (tx - CAMS.x) * k; CAMS.y += (ty - CAMS.y) * k; }
    cam.x = GFX.smooth ? CAMS.x + shx : Math.round(CAMS.x + shx); cam.y = GFX.smooth ? CAMS.y + shy : Math.round(CAMS.y + shy); }
  // painted ground (2 px per world unit) straight to the screen
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = GFX.preset === 'ultra' ? 'high' : 'medium';   // (v105) 'high' only at the sharpest preset
  // (v260) a view wider or taller than the map (far zoom in a small map, the tower's halls): fill the rest first, or the
  // last frame (the town you came from) shows through at the edges
  if (VW > W || VH > H){ ctx.fillStyle = typeof twmOn === 'function' && twmOn() && typeof twmT === 'function' ? twmT().sky[1] : '#0b0d12'; ctx.fillRect(0, 0, cv.width, cv.height); }
  ctx.drawImage(terr, cam.x * TS, cam.y * TS, VW * TS, VH * TS, 0, 0, VW * PX * DPR, VH * PX * DPR);
  let g = ctx; g.setTransform(PX * DPR, 0, 0, PX * DPR, 0, 0);
  g.translate(-.5, -.5);
  if (P.tx != null && !P.target){ const a = (T * 3) % 1; g.strokeStyle = `rgba(255,240,180,${1 - a})`; g.lineWidth = 1; g.beginPath(); g.ellipse(Math.round(P.tx - cam.x) + .5, Math.round(P.ty - cam.y) + .5, 4 + a * 5, (4 + a * 5) * .45, 0, 0, 7); g.stroke(); }
  const tg = P.target;
  if (tg && !tg.dead){ g.strokeStyle = '#e3665e'; g.lineWidth = 1; g.setLineDash([3, 2]); g.lineDashOffset = -T * 10; g.beginPath(); g.ellipse(Math.round(tg.x - cam.x) + .5, Math.round(tg.y - cam.y) + .5, tg.def.r + 5, (tg.def.r + 5) * .42, 0, 0, 7); g.stroke(); g.setLineDash([]); }
  g.setTransform(PX * DPR, 0, 0, PX * DPR, 0, 0); g.imageSmoothingEnabled = !!GFX.smooth; g.imageSmoothingQuality = 'high';
  if (typeof LIVE !== 'undefined') LIVE.drawUnder(g);   // water glints, currents, ripples, lava bubbles
  VFX.drawUnder(g, cam.x, cam.y);
  const ents = [];
  if (typeof LIVE !== 'undefined') LIVE.ents(ents, g);   // waterfalls
  for (const p of PROPS){
    const im = propImg(p.type, p.variant), x = p.x - cam.x, y = p.y - cam.y;
    if (x + im.w < 0 || x - im.w > VW || y - im.h > VH || y + 30 < 0) continue;
    ents.push({y:p.y, f:() => drawPropW(g, p, im, x, y)});
  }
  if (S.pet) ents.push({y:PET.y, f:() => drawPetW(g)});
  // (v105) only what could show: things far off screen are not queued, sorted and drawn every frame
  const near = (x, y, mx, up) => x > cam.x - mx && x < cam.x + VW + mx && y > cam.y - 60 && y < cam.y + VH + up;
  for (const n of NPCS) if (near(n.x, n.y, 140, 200)) ents.push({y:n.y, f:() => drawNpcW(g, n)});
  for (const l of LOOT) if (near(l.x, l.y, 60, 60)) ents.push({y:l.y - 2, f:() => drawLootW(g, l)});
  for (const m of mobs) if (m === P.target || (m.def && (m.def.boss || m.wb)) || near(m.x, m.y, 160, 260)) ents.push({y:m.y + (m.dead ? -.5 : 0), f:() => drawMobW(g, m)});
  ents.push({y:P.y, f:() => drawPlayerW(g)});
  if (typeof drawGhostsInto === 'function') drawGhostsInto(ents, g);
  for (const gt of GATES) if (Math.abs(gt.x - cam.x - VW / 2) < VW) ents.push({y:gt.y, f:() => VFX.drawGate(g, gt, cam.x, cam.y)});
  for (const sm of SUMMONS) ents.push({y:sm.y, f:() => sm.kind === 'beast' ? drawBeast(g, sm) : VFX.drawTiger(g, sm, cam.x, cam.y)});
  ents.sort((a, b) => a.y - b.y).forEach(e => e.f());
  for (const p of projs){ if (p.delay > 0) continue; VFX.drawProj(g, p, cam.x, cam.y); }
  for (const f of fx){
    const x = f.x - cam.x, y = f.y - cam.y, k = f.t / f.life;
  }
  VFX.drawOver(g, cam.x, cam.y);
  if (typeof LIVE !== 'undefined') LIVE.drawOver(g);   // birds, butterflies, fireflies, leaves, smoke, cloud shadows
  const target = isNight() && !(typeof twmOn === 'function' && twmOn()) ? .58 : 0;   // (v264) indoors in the tower: no night veil (it dulled the hall's own fire and light)
  nightA += ((SETTINGS.nightFx ? target : 0) - nightA) * .02;
  if (nightA > .01){
    nctx.setTransform(1, 0, 0, 1, 0, 0); nctx.globalCompositeOperation = 'source-over'; nctx.clearRect(0, 0, night.width, night.height); nctx.setTransform(night.width / VW, 0, 0, night.height / VH, 0, 0);
    nctx.fillStyle = `rgba(14,12,48,${nightA})`; nctx.fillRect(0, 0, VW, VH);
    nctx.globalCompositeOperation = 'destination-out';
    // (v97) one soft round picture stamped for every light, not a new gradient per lantern per frame; off-screen ones skipped
    const hole = (x, y, r, a) => { if (x < -r || y < -r || x > VW + r || y > VH + r) return; nctx.globalAlpha = a; nctx.drawImage(holeSpr(), x - r, y - r, r * 2, r * 2); nctx.globalAlpha = 1; };
    hole(P.x - cam.x, P.y - cam.y - 18, 120, .95);
    for (const m of mobs) if (m.type === 'lantern' && !m.dead) hole(m.x - cam.x, m.y - cam.y - 24, 55, .85);
    if (MAP_ID === 0) hole(SHRINE.x - cam.x, SHRINE.y - cam.y - 40, 110, .7);
    for (const gt of GATES) hole(gt.x - cam.x, gt.y - cam.y - 40, 90, .8);
    for (const p of PROPS){ if (p.x < cam.x - 200 || p.x > cam.x + VW + 200 || p.y < cam.y - 100 || p.y > cam.y + VH + 300) continue; const im = propImg(p.type, p.variant); if (im.glow) hole(p.x + im.glow[0] - cam.x, p.y + im.glow[1] - cam.y, im.glow[2], .8); }   // (v59) only those on screen
    g.imageSmoothingEnabled = true; g.drawImage(night, 0, 0, VW, VH); g.imageSmoothingEnabled = false;
  }
  drawWeather(g);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  VFX.drawFlash(ctx, SW, SH);
  // overlay UI at screen resolution
  for (const m of mobs){
    if (m.dead || (m.fz && m.fz.hidden)) continue;
    const x = sx(m.x), y = sy(m.y);
    if (x < -80 || x > SW + 80 || y < -60 || y > SH + 120) continue;
    const top = sy(m.y - MOB_H[m.type] * (m.fz ? 1 + ((m.fz.phase || 1) - 1) * .04 : m.elite ? 1.3 : 1) - (m.fz ? m.fz.z || 0 : 0)) - 8;
    if (m.hp < m.maxhp || m === P.target){
      const w = m.def.boss ? 110 : m.elite ? 64 : 44;
      ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(x - w / 2 - 1, top - 1, w + 2, 6);
      ctx.fillStyle = m.def.boss ? '#e3b04b' : m.elite ? '#ff9a3a' : '#e3665e'; ctx.fillRect(x - w / 2, top, w * clamp(m.hp / m.maxhp, 0, 1), 4);
    }
    if (m === hoverMob || m === P.target || m.def.boss || m.elite || m.tagTxt) nameTag(x, top - 6, `${m.tagTxt ? '✦ ' + L(...m.tagTxt) + ' ' : m.def.boss ? '♛ ' : m.elite ? '★ ' + L('หัวหน้าฝูง', 'Alpha') + ' ' : ''}Lv.${m.def.lvl} ${nm(m.def)}${DER.pas.insight ? ` · ${elemName(m.def.elem)}` : ''}${m.fz && typeof furyLabel === 'function' ? furyLabel(m) : ''}`, m.def.boss ? '#f5d48a' : m.elite ? '#ffc870' : m.def.aggro ? '#ffb0a8' : '#fff');
  }
  if (typeof drawLootTags === 'function') drawLootTags();
  for (const n of NPCS){ const x = sx(n.x), y = sy(n.y); if (x > -100 && x < SW + 100 && y > -60 && y < SH + 60){ if (typeof npcNameTag === 'function') npcNameTag(x, y + 22, npcTag(n)); else nameTag(x, y + 20, typeof npcTag === 'function' ? npcTag(n) : `${nm(n)} · ${L(n.role, n.roleEn)}`, '#bff0dc'); const mk = npcMark(n) || (n.id === 'job' && !jobChangeBlock() ? '!' : ''); if (mk){ ctx.font = FD(700, 24); ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(40,20,5,.85)'; const yy = sy(n.y - 50) + Math.sin(T * 4) * 3; ctx.strokeText(mk, x, yy); ctx.fillStyle = mk === '?' ? '#9ff0c8' : '#ffd36a'; ctx.fillText(mk, x, yy); } } }
  for (const gt of GATES){ const x = sx(gt.x), y = sy(gt.y); if (x < -120 || x > SW + 120 || y < -80 || y > SH + 80) continue; const mp = MAPS[gt.to];
    nameTag(clamp(x, 90, SW - 90), y - 150 * PX, `${gt.side === 'w' ? '◀ ' : ''}${nm(mp)} · Lv ${mp.lv[0]}–${mp.lv[1]}${gt.side === 'e' ? ' ▶' : ''}`, '#ffe6a0', 'rgba(60,20,10,.85)'); }
  drawBeastTags();
  if (typeof drawGhostTags === 'function') drawGhostTags();
  if (!P.dead){
    const hf = S.hp / DER.maxhp; VIT.trail = Math.max(hf, VIT.trail - .6 / 60);
    vitalBars(sx(P.x), sy(P.y), hf, S.sp / DER.maxsp, {trail:VIT.trail});   // HP + SP under your feet
    P.tagTop = heroName(sx(P.x), sy(P.y - HEAD_H(P.ride)), (typeof GM !== 'undefined' && GM.on ? '[GM] ' : '') + (S.name || nm(JOBS[S.job])), 'me', {title:typeof titleTxt === 'function' ? titleTxt(S.title) : '', tc:typeof titleCol === 'function' ? titleCol(S.title) : '', tier:typeof ACH_BY !== 'undefined' && ACH_BY[S.title] ? ACH_BY[S.title].tier : 0, guild:S.guild && S.guild.name, lv:S.lvl});   // title · name · guild over the head (no level)
    const ct = drawHeadCast(P.tagTop); if (ct != null) P.tagTop = ct;   // the cast bar sits on top of the plate
  } else P.tagTop = sy(P.y - HEAD_H(false));
  if (typeof EV !== 'undefined') EV.emit('draw');
  for (const f of fx){
    if ((f.k !== 'lvl' && f.k !== 'jlvl') || f.t < 0) continue;
    const k = f.t / f.life, lv = f.k === 'lvl', pop = f.t < .25 ? 1.6 - Math.sin(f.t / .25 * Math.PI / 2) * .6 : 1;
    const x = sx(P.x), y = (P.tagTop != null ? P.tagTop : sy(P.y - 60)) - (lv ? 10 : 6) * TAG_Z() - Math.min(1, k * 3) * 14;
    ctx.save(); ctx.globalAlpha = k > .75 ? (1 - k) / .25 : 1; ctx.translate(x, y); ctx.scale(pop, pop); ctx.textAlign = 'center';
    const s = lv ? 'LEVEL UP' : 'JOB LEVEL UP', sz = lv ? 22 : 15;
    ctx.font = FD(700, sz); ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = lv ? 'rgba(70,30,8,.9)' : 'rgba(8,50,40,.9)'; ctx.strokeText(s, 0, 0);
    const gr = ctx.createLinearGradient(0, -sz, 0, 2); gr.addColorStop(0, lv ? '#fff6d0' : '#e8fff4'); gr.addColorStop(.55, lv ? '#f5c858' : '#7fe8c0'); gr.addColorStop(1, lv ? '#c07a18' : '#2f9f7a');
    ctx.fillStyle = gr; ctx.fillText(s, 0, 0);
    if (f.n){ ctx.font = FD(600, lv ? 13 : 11); ctx.lineWidth = 3; const t2 = lv ? `Base Lv ${f.n}` : `Job Lv ${f.n}`; ctx.strokeText(t2, 0, lv ? 16 : 13); ctx.fillStyle = '#fff'; ctx.fillText(t2, 0, lv ? 16 : 13); }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  for (const t of texts) drawDmgText(t);
  ctx.globalAlpha = 1;
  if (toastT > 0){ ctx.globalAlpha = Math.min(1, toastT * 2); nameTag(SW / 2, SH * .64, toastMsg, '#ffd0c8', 'rgba(20,18,30,.85)'); ctx.globalAlpha = 1; }
}

/* ---------- biome weather: darkness (caves, graveyard), drifting mist, snow, dust, petals, embers, bubbles ---------- */
const WX = {parts:[], mist:null};
function drawWeather(g){
  const B = MAP_ID ? BIOME[MAPS[MAP_ID].biome] : null; if (!B || !B.fx && !B.tint) return;
  if (B.tint){ g.fillStyle = B.tint; g.fillRect(0, 0, VW, VH); }
  if (B.fx === 'dark'){
    nctx.setTransform(1, 0, 0, 1, 0, 0); nctx.globalCompositeOperation = 'source-over'; nctx.clearRect(0, 0, night.width, night.height); nctx.setTransform(night.width / VW, 0, 0, night.height / VH, 0, 0);
    nctx.fillStyle = `rgba(8,6,16,${B.fxA + (isNight() ? .15 : 0)})`; nctx.fillRect(0, 0, VW, VH);
    nctx.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a) => { if (x < -r || y < -r || x > VW + r || y > VH + r) return; nctx.globalAlpha = a; nctx.drawImage(holeSpr(), x - r, y - r, r * 2, r * 2); nctx.globalAlpha = 1; };
    hole(P.x - cam.x, P.y - cam.y - 18, 140, .95);
    for (const p of PROPS){ const im = propImg(p.type, p.variant); if (im.glow) hole(p.x + im.glow[0] - cam.x, p.y + im.glow[1] - cam.y, im.glow[2] * 1.3, .85); }
    for (const m of mobs) if (!m.dead && m.def.shot) hole(m.x - cam.x, m.y - cam.y - 20, 40, .6);
    for (const gt of GATES) hole(gt.x - cam.x, gt.y - cam.y - 40, 100, .9);
    g.imageSmoothingEnabled = true; g.drawImage(night, 0, 0, VW, VH); g.imageSmoothingEnabled = false;
    return;
  }
  if (!GFX.fx) return;
  const n = Math.round(({mist:14, snow:90, dust:40, petals:40, embers:46, bubbles:40}[B.fx] || 0) * (GFX.fx === 1 ? .6 : 1));
  while (WX.parts.length < n) WX.parts.push({x:Math.random() * VW, y:Math.random() * VH, s:Math.random(), p:Math.random() * 6.28});
  WX.parts.length = n;
  const dt = 1 / 60, a = B.fxA;
  for (const q of WX.parts){
    if (B.fx === 'mist'){ q.x += (6 + q.s * 8) * dt; if (q.x > VW + 120) q.x = -120;
      const gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, 70 + q.s * 70); gr.addColorStop(0, `rgba(235,240,245,${a * .55})`); gr.addColorStop(1, 'rgba(235,240,245,0)'); g.fillStyle = gr; g.fillRect(q.x - 140, q.y - 140, 280, 280); continue; }
    if (B.fx === 'snow'){ q.y += (14 + q.s * 18) * dt; q.x += Math.sin(T + q.p) * 8 * dt; g.fillStyle = `rgba(255,255,255,${.5 + q.s * .5})`; g.fillRect(q.x, q.y, 1 + q.s * 1.4, 1 + q.s * 1.4); }
    else if (B.fx === 'dust'){ q.x += (30 + q.s * 40) * dt; q.y += Math.sin(T * 2 + q.p) * 6 * dt; g.fillStyle = `rgba(210,180,130,${a * (.4 + q.s * .6)})`; g.fillRect(q.x, q.y, 2 + q.s * 3, 1); }
    else if (B.fx === 'petals'){ q.y += (8 + q.s * 10) * dt; q.x += (6 + Math.sin(T + q.p) * 10) * dt; g.save(); g.translate(q.x, q.y); g.rotate(T * 2 + q.p); g.fillStyle = MAP_ID === 20 ? `rgba(255,220,120,${.6 + q.s * .4})` : `rgba(255,170,210,${.6 + q.s * .4})`; g.beginPath(); g.ellipse(0, 0, 1.8, .9, 0, 0, 7); g.fill(); g.restore(); }
    else if (B.fx === 'embers'){ q.y -= (8 + q.s * 14) * dt; q.x += Math.sin(T * 1.5 + q.p) * 6 * dt; g.fillStyle = `rgba(255,${120 + q.s * 80 | 0},60,${.5 + Math.sin(T * 5 + q.p) * .3})`; g.fillRect(q.x, q.y, 1.2, 1.2); }
    else if (B.fx === 'bubbles'){ q.y -= (10 + q.s * 14) * dt; q.x += Math.sin(T * 2 + q.p) * 5 * dt; g.strokeStyle = `rgba(200,255,250,${.35 + q.s * .4})`; g.lineWidth = .6; g.beginPath(); g.arc(q.x, q.y, 1 + q.s * 2, 0, 7); g.stroke(); }
    if (q.y > VH + 4){ q.y = -4; q.x = Math.random() * VW; } if (q.y < -6){ q.y = VH + 4; q.x = Math.random() * VW; } if (q.x > VW + 6) q.x = -6;
  }
}
