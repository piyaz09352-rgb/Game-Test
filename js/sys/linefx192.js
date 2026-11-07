/* VAYRATHEN — js/sys/linefx192.js — (v192) no more laser beams, and skills that look like their class
   The owner disliked the skills that "shoot a beam of light": every line skill (16 of them) got the same straight white
   laser from skillfx.js on top of its own effect, and Pierce itself was a thin straight line. Both are gone. A line skill
   now sends something that travels down its path, chosen by its element:
     fire = a flame wave throwing embers · water = a breaking wave and spray · wind = three spinning wind blades ·
     earth = rock spikes bursting out of the ground one after another · holy = crosses of light springing up in a row ·
     shadow (and claw skills) = shadow claw rakes · anything else = a crescent sword wave.
   Buffs, dashes and spins with no element all came out the same gold for every class (Golden Shield alone is used by
   15 skills): their light now takes the colour of the class line, so a swordsman's, a mage's and a cat's look different. */
'use strict';
const LFX_LINE_COL = {
  blade:['#ffe9e0', '#e0533a', '#7a1f14'], rune:['#f1e6ff', '#a774ff', '#43207a'], ranger:['#eaffdf', '#6fd25a', '#2a6b22'],
  muay:['#fff0d8', '#ff9a3a', '#8a3d0e'], healer:['#ecfff4', '#62e0a8', '#1f7a52'], rogue:['#efe4ff', '#8a5cd8', '#2e1858'],
  summoner:['#fff8dc', '#ffcf4a', '#9a6a10'], occult:['#e8ffe8', '#5ad08a', '#1e3a2a'], merchant:['#fffbe0', '#ffd23a', '#a07408'],
  catfolk:['#fff0f6', '#ff7fb8', '#8a2a5a'], dogfolk:['#e6f2ff', '#5aa0ff', '#1a3f7a'], ninja:['#ffe6e6', '#e04a5a', '#1a1a3a']};
const lfxLine = job => { let k = job; for (let i = 0; i < 9 && JOBS[k] && JOBS[k].parent && JOBS[k].parent !== 'novice'; i++) k = JOBS[k].parent; return k; };
{ const _c = skfxCol; skfxCol = function(sk){
    if (sk && !sk.elem && ['buff', 'restore', 'dash', 'aoeSelf', 'melee'].includes(sk.type) && !/thunder|wrath|tempest|ice|frost|deluge/.test(sk.fx || '')){ const c = LFX_LINE_COL[lfxLine(sk.job)]; if (c) return c; }
    return _c.apply(this, arguments); }; }

/* ---------- line skills ---------- */
SKFX_CAT.line = 'linewave';   // skillfx.js has no such case: its laser is not drawn any more
function lfxStyle(sk){ const e = sk.elem, f = sk.fx || '';
  if (e === 'fire' || /fire/i.test(f)) return 'flame'; if (e === 'water' || /water/i.test(f)) return 'wave'; if (e === 'wind' || /wind/i.test(f)) return 'blades';
  if (e === 'earth' || /earthsplit/.test(f) && e !== 'holy') return 'spikes'; if (e === 'holy') return 'crosses'; if (e === 'shadow' || /reaper|paw/i.test(f)) return 'claws';
  return 'crescent'; }
function lfxCrescent(x0, y0, ux, uy, len, w, col, o = {}){
  const ang = Math.atan2(uy, ux);
  skfxAdd({x0, y0, ux, uy, len, w:w * 1.6, col, life:o.life || .5, t:-(o.delay || 0), add:true, spin:o.spin || 0, draw(g, k){   // (big and slow enough to read as something flying)
    const e = k * (2 - k) * .85 + k * .15, x = this.x0 + this.ux * this.len * e, y = this.y0 + this.uy * this.len * e - 18, a = (k < .12 ? k / .12 : 1) * (1 - k * .85);
    g.save(); g.translate(x, y); g.rotate(ang + this.spin * k * 12); g.scale(1, .62);
    const R = this.w;
    g.globalAlpha = a * .7; g.fillStyle = this.col[1]; g.beginPath(); g.arc(0, 0, R, -1.15, 1.15); g.arc(-R * .42, 0, R * .9, 1.0, -1.0, true); g.closePath(); g.fill();
    g.globalAlpha = a; g.strokeStyle = this.col[0]; g.lineWidth = 2.2; g.beginPath(); g.arc(0, 0, R * .96, -1.0, 1.0); g.stroke();
    g.restore();
    if (Math.random() < .55 && k < .9) skfxPart({x:x + skfxR(-6, 6), y:y + 18 + skfxR(-4, 4), z:18 + skfxR(-6, 10), vx:-this.ux * skfxR(20, 70), vy:-this.uy * skfxR(10, 35), vz:skfxR(-10, 40), life:skfxR(.25, .5), size:o.part || 2, col:this.col[Math.random() < .5 ? 0 : 1], shape:o.shape || 'dot', g:o.g || 0});
  }});
}
function lfxLineWave(sk, t){
  const tx = t && !t.dead ? t.x : P.x + (P.face || 1) * 100, ty = t && !t.dead ? t.y : P.y;
  const d = Math.hypot(tx - P.x, ty - P.y) || 1, ux = (tx - P.x) / d, uy = (ty - P.y) / d;
  lfxWave({x0:P.x + ux * 10, y0:P.y + uy * 6, ux, uy, len:sk.len || 200, w:Math.max(18, (sk.width || 30) * .7), col:skfxCol(sk), tier:skfxTier(sk), style:lfxStyle(sk)});
}
function lfxWave({x0, y0, ux, uy, len, w, col, tier, style}){
  const at = q => ({x:x0 + ux * len * q, y:y0 + uy * len * q});
  switch (style){
    case 'flame': lfxCrescent(x0, y0, ux, uy, len, w * 1.1, col, {part:4, shape:'smoke'});
      for (let i = 1; i <= 6; i++){ const p = at(i / 6); later(i * .05, () => skfxBurst(p.x, p.y, 6, 4, {s0:10, s1:50, vz0:40, vz1:120, l0:.3, l1:.6, p:{g:-60, size:2, col:col[i % 2]}})); } break;
    case 'wave': lfxCrescent(x0, y0, ux, uy, len, w * 1.25, col, {part:2.5, g:-420});
      for (let i = 1; i <= 5; i++){ const p = at(i / 5); later(i * .06, () => skfxRing(p.x, p.y, 16 + tier * 3, col[0], .35, 2)); } break;
    case 'blades': for (let i = 0; i < 3; i++) lfxCrescent(x0 - uy * (i - 1) * 12, y0 + ux * (i - 1) * 6, ux, uy, len, w * .55, col, {delay:i * .08, spin:1, life:.55}); break;
    case 'spikes': { const n = 7; for (let i = 1; i <= n; i++){ const p = at(i / n), h = 16 + tier * 4 + skfxR(-4, 6);
        skfxAdd({x:p.x, y:p.y, h, life:.7, t:-i * .05, layer:'over', draw(g, k){ const up = k < .2 ? k / .2 : k > .7 ? (1 - k) / .3 : 1;
          g.globalAlpha = 1; g.fillStyle = col[2]; g.beginPath(); g.moveTo(this.x - 7, this.y); g.lineTo(this.x, this.y - this.h * up); g.lineTo(this.x + 7, this.y); g.closePath(); g.fill();
          g.fillStyle = col[1]; g.beginPath(); g.moveTo(this.x - 2, this.y); g.lineTo(this.x, this.y - this.h * up); g.lineTo(this.x + 4, this.y); g.closePath(); g.fill(); }});
        later(i * .05, () => skfxDust(p.x, p.y, 3)); } break; }
    case 'crosses': { const n = 5; for (let i = 1; i <= n; i++){ const p = at(i / n);
        skfxAdd({x:p.x, y:p.y, life:.55, t:-i * .06, add:true, draw(g, k){ const a = (k < .2 ? k / .2 : 1 - (k - .2) / .8), s = 10 + tier * 2;
          g.globalAlpha = a; g.fillStyle = col[0]; g.fillRect(this.x - 2, this.y - 26 - s, 4, s * 2); g.fillRect(this.x - s * .7, this.y - 26 - s * .35, s * 1.4, 4);
          g.globalAlpha = a * .5; g.fillStyle = col[1]; g.beginPath(); g.ellipse(this.x, this.y, s, s * .45, 0, 0, Math.PI * 2); g.fill(); }});
        later(i * .06, () => skfxMotes(p.x, p.y, col[1], 4, 60)); } break; }
    case 'claws': { const n = 4, ang = Math.atan2(uy, ux); for (let i = 1; i <= n; i++){ const p = at(i / n);
        skfxAdd({x:p.x, y:p.y, life:.45, t:-i * .06, draw(g, k){ const a = 1 - k, r = 16 + tier * 2, draw = Math.min(1, k * 4);
          g.save(); g.translate(this.x, this.y - 20); g.rotate(ang + Math.PI / 2 + .5); g.lineCap = 'round';
          for (let j = -1; j <= 1; j++){ g.globalAlpha = a; g.strokeStyle = col[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(j * 7, -r); g.lineTo(j * 7 + 3, -r + r * 2 * draw); g.stroke();
            g.strokeStyle = col[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(j * 7, -r); g.lineTo(j * 7 + 3, -r + r * 2 * draw); g.stroke(); }
          g.restore(); }}); } break; }
    default: lfxCrescent(x0, y0, ux, uy, len, w, col, {});
  }
  const e = at(1); later(.32, () => { skfxGlow(e.x, e.y - 16, 24 + tier * 4, col[1], .3); skfxBurst(e.x, e.y, 14, 8 + tier * 3, {s0:40, s1:140, p:{size:2, col:col[0]}}); });
  skfxShake(.8 + tier * .4);
}
/* the beam effects themselves (a skill's own, and the ones bosses fire in a line: bossact.js) become travelling waves */
const LFX_BEAM = {pierce:['crescent', 'neutral'], fireLine:['flame', 'fire'], waterLine:['wave', 'water'], windBlade:['blades', 'wind'], reaperLine:['claws', 'shadow'], pawLine:['claws', 'neutral']};
{ const _cast = skfxCast; skfxCast = function(id, lv, t, from){ const r = _cast.apply(this, arguments); const sk = SKILLS[id];
    if (sk && sk.type === 'line' && !LFX_BEAM[sk.fx]) try { lfxLineWave(sk, t); } catch (e) {}   // a beam fx draws its own wave below
    return r; }; }
if (typeof VFX !== 'undefined' && VFX.play){ const _vp = VFX.play; VFX.play = function(name, o){
    const b = LFX_BEAM[name]; if (!b || !o || o.ux == null) return _vp.apply(this, arguments);
    const sk = SKFX.cur && SKILLS[SKFX.cur.id], el = (sk && sk.elem) || b[1], col = sk && SKFX.cur && T - SKFX.cur.t < .5 ? skfxCol(sk) : SKFX_EL[el] || SKFX_EL.neutral;
    try { lfxWave({x0:o.x, y0:o.y, ux:o.ux, uy:o.uy, len:o.len || 200, w:22, col, tier:sk ? skfxTier(sk) : 3, style:b[0]}); } catch (e) {} }; }
