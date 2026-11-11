/* VAYRATHEN — js/sys/skillsig283.js — (v283) no two skills in the whole game share a signature
   The owner: "ทุกสกิลจะต้องไม่มีเอฟเฟคซ้ำกันเลย ไม่ซ้ำกับคลาสไหนด้วย". skillsig277.js kept motifs apart only within a
   class: across the game 143 active skills drew from 18 motifs, so eighteen neutral skills all burst into the same
   phantom blades and fifteen into the same lotus. Now:
   · four more motifs — a halo of rings climbing a column, a comet that streaks in and bursts, spears of the earth
     rising in a ring, orbs circling with trails;
   · motifs are handed out across the whole game, not class by class: each skill takes the motif its element likes
     that the fewest skills already use (still never one its own class has), so every motif carries about the same
     number of skills instead of a few carrying most;
   · every skill then turns its palette its own step round the colour wheel: a neutral or self skill anywhere on the
     wheel (gold, green, cyan, violet, rose …), an elemental skill a smaller step that keeps it recognisably fire,
     water, holy …; the count, spin and tilt of the motif still differ per skill as before.
   No two skills share (motif, element, hue). sigReport() lists any pair that does; tests/unique283.test.js keeps
   it empty. Loaded right after skillsig277.js. */
'use strict';

/* ---------- four more motifs (same calling convention as SIG_DRAW's: world coordinates, k 0→1, f the effect) ---------- */
Object.assign(SIG_DRAW, {
  halo(g, x, y, k, f, layer){ const [c, l] = f.pal, n = 3 + f.v.n, a = Math.min(1, k * 4, (1 - k) * 2.2), R = f.r * .7;
    if (layer === 'under'){ g.globalAlpha = a * .5; g.strokeStyle = `rgba(${c},1)`; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, R * sigE(k), R * .45 * sigE(k), 0, 0, 7); g.stroke(); g.globalAlpha = 1; return; }
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++){ const t2 = (k * 1.2 + i / n) % 1, rr = R * (1 - t2 * .35), h = t2 * 110; g.globalAlpha = a * (1 - t2) * .9; g.strokeStyle = `rgba(${i % 2 ? l : c},1)`; g.lineWidth = 3 - t2; g.beginPath(); g.ellipse(x, y - h, rr, rr * .38, 0, 0, 7); g.stroke(); }
    const gr = g.createLinearGradient(x, y, x, y - 120); gr.addColorStop(0, `rgba(${l},${.35 * a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - R * .5, y - 120, R, 120); g.restore(); },
  comet(g, x, y, k, f, layer){ const [c, l] = f.pal, a = Math.min(1, (1 - k) * 2.2), fall = Math.min(1, k / .45), dir = f.v.spin, sx = x - dir * 220 * (1 - fall), sy = y - 170 * (1 - fall);
    if (layer === 'under'){ if (k < .45) return; const R = f.r * (.5 + .5 * sigE((k - .45) / .55)); g.globalAlpha = a * .6; g.strokeStyle = `rgba(${l},1)`; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, R, R * .45, 0, 0, 7); g.stroke(); g.globalAlpha = 1; return; }
    g.save(); g.globalCompositeOperation = 'lighter';
    if (k < .5){ for (let i = 0; i < 9 * f.q; i++){ const t2 = i / 9, px = sx + dir * t2 * 90 * (1.2 - fall), py = sy - t2 * 70 * (1.2 - fall) + Math.sin(T * 20 + i) * 3; g.globalAlpha = a * (1 - t2); g.fillStyle = `rgba(${i % 2 ? l : c},1)`; g.beginPath(); g.arc(px, py, 7 * (1 - t2) + 1.5, 0, 7); g.fill(); }
      g.globalAlpha = a; g.fillStyle = '#fff'; g.beginPath(); g.arc(sx, sy, 6, 0, 7); g.fill(); }
    else { const kk = (k - .5) / .5, n = 10 + f.v.n * 4; for (let i = 0; i < n; i++){ const an = i / n * Math.PI * 2 + f.v.seed, d = f.r * kk * (.7 + .5 * sigR(i, 3)); g.globalAlpha = a * (1 - kk); g.strokeStyle = `rgba(${i % 2 ? l : c},1)`; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x + Math.cos(an) * d * .4, y + Math.sin(an) * d * .18); g.lineTo(x + Math.cos(an) * d, y + Math.sin(an) * d * .45); g.stroke(); } }
    g.restore(); },
  spears(g, x, y, k, f, layer){ const [c, l, d] = f.pal, n = 6 + f.v.n * 2, up = sigE(Math.min(1, k * 2.5)), a = Math.min(1, (1 - k) * 2.5), R = f.r * .65;
    for (let i = 0; i < n; i++){ const an = i / n * Math.PI * 2 + f.v.seed + (f.v.spin > 0 ? .2 : 0), px = x + Math.cos(an) * R, py = y + Math.sin(an) * R * .45, h = (40 + 30 * sigR(i, 4)) * up;
      if (layer === 'under'){ g.globalAlpha = a * .6; g.fillStyle = `rgba(${d},1)`; g.beginPath(); g.ellipse(px, py, 9, 4, 0, 0, 7); g.fill(); continue; }
      g.globalAlpha = a; const gr = g.createLinearGradient(px, py, px, py - h); gr.addColorStop(0, `rgba(${d},1)`); gr.addColorStop(.7, `rgba(${c},1)`); gr.addColorStop(1, `rgba(${l},1)`); g.fillStyle = gr; g.beginPath(); g.moveTo(px - 7, py); g.lineTo(px, py - h); g.lineTo(px + 7, py); g.closePath(); g.fill(); }
    g.globalAlpha = 1; },
  orbs(g, x, y, k, f, layer){ if (layer === 'under') return; const [c, l] = f.pal, n = 3 + f.v.n, a = Math.min(1, k * 5, (1 - k) * 2), R = f.r * (.5 + .3 * sigE(k)); g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++){ const base = i / n * Math.PI * 2 + T * 5 * f.v.spin + f.v.tilt * 5; for (let s = 0; s < 6; s++){ const an = base - s * .18 * f.v.spin, px = x + Math.cos(an) * R, py = y - 30 + Math.sin(an) * R * .4 - Math.sin(an * 2 + T * 3) * 8; g.globalAlpha = a * (1 - s / 6); g.fillStyle = `rgba(${s ? c : l},1)`; g.beginPath(); g.arc(px, py, (s ? 5 : 7) * (1 - s / 8), 0, 7); g.fill(); } }
    g.restore(); }
});
for (const mo of ['halo', 'comet', 'spears', 'orbs']) if (!SIG_MOTIFS.includes(mo)) SIG_MOTIFS.push(mo);
for (const [el, add] of [['fire', ['comet']], ['holy', ['halo']], ['earth', ['spears']], ['shadow', ['orbs']], ['water', ['orbs']], ['wind', ['comet']], ['poison', ['spears']], ['neutral', ['comet', 'orbs', 'spears', 'halo']], ['self', ['halo', 'orbs']]])
  for (const mo of add) if (SIG_PREF[el] && !SIG_PREF[el].includes(mo)) SIG_PREF[el].push(mo);

/* ---------- handing out motifs across the whole game ---------- */
const sigElemKey = sk => (SIG_SELF.includes(sk.type) ? 'self' : sk.type === 'heal' || sk.type === 'restore' ? 'heal' : SIG_PAL[sk.elem] ? sk.elem : 'neutral');
SIGFX.of = {};
sigAssign = function(){
  const order = []; for (const j of Object.values(JOBS)) for (const id of (j.skills || [])) if (!order.includes(id)) order.push(id);
  for (const id in SKILLS) if (!order.includes(id)) order.push(id);
  const jobOf = {}; for (const [jk, j] of Object.entries(JOBS)) for (const id of (j.skills || [])) (jobOf[id] = jobOf[id] || []).push(jk);
  const usedJ = {}, useMo = {}, useKey = {};
  for (const id of order){ const sk = SKILLS[id]; if (!sk || sk.type === 'passive' || SIGFX.of[id]) continue;
    const self = SIG_SELF.includes(sk.type), ek = sigElemKey(sk), pref = [...new Set([...(self ? SIG_PREF.self : SIG_PREF[sk.elem] || SIG_PREF.neutral), ...SIG_MOTIFS])];
    const jobs = jobOf[id] || ['_' + id], taken = new Set(jobs.flatMap(j => usedJ[j] || [])), h = sigH(id);
    // the motif the fewest skills use so far — counted across the game and within this element — the element's favourites breaking ties
    let pick = null, best = 1e9; pref.forEach((mo, i) => { if (taken.has(mo)) return; const sc = (useMo[mo] || 0) * 3 + (useKey[mo + '|' + ek] || 0) * 6 + i * .5; if (sc < best){ best = sc; pick = mo; } });
    if (!pick) pick = pref.slice().sort((a, b) => (useMo[a] || 0) - (useMo[b] || 0))[0];
    const key = pick + '|' + ek, hue = useKey[key] || 0; useKey[key] = hue + 1; useMo[pick] = (useMo[pick] || 0) + 1; for (const j of jobs) (usedJ[j] = usedJ[j] || []).push(pick);
    SIGFX.of[id] = {mo:pick, n:hue % 3, spin:h & 8 ? 1 : -1, tilt:((h >>> 5) % 7 - 3) * .06, seed:h % 997, hue, ek}; }
};

/* ---------- each skill's own turn of the colour wheel ---------- */
const SIG_HUE_N = [0, 72, 144, 216, 288, 36, 108, 180, 252, 324, 54, 126, 198, 270, 342, 18, 90, 162, 234, 306];   // neutral and self skills: anywhere on the wheel
const SIG_HUE_E = [0, 38, -38, 76, -76, 114, -114, 19, -19, 57, -57, 95, -95];                                  // an element keeps its family
function sigRotStr(s, deg){ const [r0, g0, b0] = s.split(',').map(v => +v / 255), mx = Math.max(r0, g0, b0), mn = Math.min(r0, g0, b0), l = (mx + mn) / 2, d = mx - mn; let h = 0, sat = 0;
  if (d){ sat = d / (1 - Math.abs(2 * l - 1)); h = mx === r0 ? ((g0 - b0) / d) % 6 : mx === g0 ? (b0 - r0) / d + 2 : (r0 - g0) / d + 4; h *= 60; }
  if (sat < .12) return s;   // white and near-white highlights stay white
  h = (h + deg + 720) % 360; const c = (1 - Math.abs(2 * l - 1)) * sat, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m0 = l - c / 2;
  const [R, G, B] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [R, G, B].map(v => Math.round((v + m0) * 255)).join(','); }
const sigHueOf = (sk, v) => { const ek = v.ek || sigElemKey(sk); return ek === 'neutral' || ek === 'self' ? SIG_HUE_N[v.hue % SIG_HUE_N.length] : SIG_HUE_E[v.hue % SIG_HUE_E.length]; };
{ const _sp = sigPlay;
  sigPlay = function(id, lv, t){
    const sk = SKILLS[id]; if (!sk || sk.type === 'passive') return; if (!SIGFX.of[id]) sigAssign(); const v = SIGFX.of[id]; if (!v) return;
    const key = sk.type === 'heal' || sk.type === 'restore' ? 'heal' : SIG_PAL[sk.elem] ? sk.elem : 'neutral', base = SIG_PAL[key], deg = sigHueOf(sk, v);
    SIG_PAL[key] = deg ? base.map(s => sigRotStr(s, deg)) : base;   // sigPlay keeps the palette array it reads, so the swap can be undone at once
    try { return _sp.apply(this, arguments); } finally { SIG_PAL[key] = base; } }; }

/* any two active skills with the same motif, element and hue: [] when every skill is its own */
function sigReport(){ sigAssign(); const seen = {}, out = [];
  for (const j of Object.values(JOBS)) for (const id of (j.skills || [])){ const sk = SKILLS[id], v = SIGFX.of[id]; if (!sk || sk.type === 'passive' || !v) continue;
    const key = `${v.mo}|${v.ek}|${v.hue}`; if (seen[key]) out.push(`${seen[key]} ~ ${id} (${key})`); else seen[key] = id; }
  return out; }
