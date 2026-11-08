/* VAYRATHEN — js/sys/skillsig277.js — (v277) every skill lands with its own signature
   The owner: skills looked plain and alike ("ไม่มีสีสัน ไม่สมจริง ให้อลังการและไม่ซ้ำกัน"). Until now every skill added
   the same seal-and-column on top of its own effect, which made them all read the same. Now each skill gets one of
   eighteen signature motifs — a blooming lotus, a coiling naga, a spinning chakra, kranok flames, a constellation,
   erupting crystals, garuda feathers, forked lightning, a vortex, ripples, a yantra, falling petals, a pillar of embers,
   ink-brush strokes, phantom blades, crescent slashes, sprouting vines, a sunburst — drawn in its element's colours.
   No two skills of the same class share a motif (each class takes the motif that suits the element first), and a
   per-skill variant (count, spin, tilt) keeps any two skills in the game apart. Skills that cost more are grander:
   bigger, denser, longer, and the strongest shake the ground. Lines repeat their motif along their path; self buffs
   and heals rise round the caster. The skill's own effect still plays underneath. */
'use strict';
const SIGFX = {list:[], of:{}};
const SIG_PAL = {fire:['255,120,40', '255,232,150', '150,30,10'], water:['70,170,255', '215,245,255', '20,70,160'], wind:['110,235,185', '235,255,245', '30,130,100'],
  earth:['210,160,80', '250,232,175', '105,68,28'], holy:['255,222,120', '255,255,236', '200,140,40'], shadow:['170,100,255', '236,205,255', '60,20,110'],
  poison:['140,230,70', '232,255,182', '48,110,20'], neutral:['255,190,90', '255,246,212', '170,100,30'], heal:['120,240,150', '232,255,232', '30,130,60']};
const SIG_MOTIFS = ['lotus', 'naga', 'chakra', 'flames', 'stars', 'shards', 'feathers', 'lightning', 'vortex', 'ripples', 'yantra', 'petals', 'embers', 'ink', 'blades', 'crescent', 'vines', 'sunburst'];
const SIG_PREF = {fire:['flames', 'embers', 'sunburst', 'chakra', 'ink', 'crescent', 'blades', 'stars'], water:['ripples', 'lotus', 'naga', 'shards', 'vortex', 'petals'],
  wind:['vortex', 'lightning', 'feathers', 'crescent', 'petals', 'blades', 'ripples'], earth:['shards', 'vines', 'chakra', 'embers', 'ink', 'blades'],
  holy:['sunburst', 'lotus', 'yantra', 'lightning', 'feathers', 'stars', 'chakra'], shadow:['ink', 'crescent', 'stars', 'vortex', 'yantra', 'blades'],
  poison:['vines', 'ink', 'petals', 'ripples', 'vortex'], neutral:['blades', 'crescent', 'chakra', 'lightning', 'stars', 'ink', 'vines', 'sunburst', 'feathers'],
  self:['lotus', 'yantra', 'petals', 'feathers', 'sunburst', 'naga', 'stars', 'embers', 'vines', 'ripples']};
const SIG_SELF = ['buff', 'heal', 'restore', 'summon', 'conjure', 'petcall', 'blink', 'backstep', 'command', 'bond'];
const sigH = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const sigR = (i, k = 0) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
const sigQ = () => (typeof fxQ === 'function' ? Math.max(.45, fxQ()) : 1);
const sigE = k => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);

const SIG_USE = {};
/* give every skill its motif: class by class, the element's favourite first, never twice in a class */
function sigAssign(){
  const order = []; for (const j of Object.values(JOBS)) for (const id of (j.skills || [])) if (!order.includes(id)) order.push(id);
  for (const id in SKILLS) if (!order.includes(id)) order.push(id);
  const jobOf = {}; for (const [jk, j] of Object.entries(JOBS)) for (const id of (j.skills || [])) (jobOf[id] = jobOf[id] || []).push(jk);
  const used = {};
  for (const id of order){ const sk = SKILLS[id]; if (!sk || sk.type === 'passive' || SIGFX.of[id]) continue;
    const self = SIG_SELF.includes(sk.type), pref = [...(self ? SIG_PREF.self : SIG_PREF[sk.elem] || SIG_PREF.neutral), ...SIG_MOTIFS];
    const jobs = jobOf[id] || ['_' + id], taken = new Set(jobs.flatMap(j => used[j] || [])), h = sigH(id);
    // among the motifs this class has not used, the element's favourites first — but a motif already worn by many skills
    // across the game gives way to a fresher one, so the whole realm stays varied
    const free = pref.filter((mo, i) => !taken.has(mo) && pref.indexOf(mo) === i);
    const pick = free.length ? free.slice(0, 8).sort((a, b) => (SIG_USE[a] || 0) + free.indexOf(a) * 2.5 - ((SIG_USE[b] || 0) + free.indexOf(b) * 2.5))[0] : SIG_MOTIFS[h % SIG_MOTIFS.length];
    SIG_USE[pick] = (SIG_USE[pick] || 0) + 1;
    for (const j of jobs) (used[j] = used[j] || []).push(pick);
    SIGFX.of[id] = {mo:pick, n:h % 3, spin:h & 8 ? 1 : -1, tilt:((h >>> 5) % 7 - 3) * .06, seed:h % 997}; }
}

/* ---------- the motifs (world coordinates; k: 0 → 1 over the effect's life; f: the effect) ---------- */
const SIG_DRAW = {
  lotus(g, x, y, k, f, layer){ const [c, l] = f.pal, R = f.r * (.55 + .5 * sigE(k)), n = 8 + f.v.n * 2, a = Math.sin(Math.min(1, k * 1.4) * Math.PI) ** .7;
    if (layer === 'under'){ const gr = g.createRadialGradient(x, y, 0, x, y, R * 1.2); gr.addColorStop(0, `rgba(${l},${.45 * a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, R * 1.2, R * .55, 0, 0, 7); g.fill(); return; }
    for (let ring = 0; ring < 2; ring++) for (let i = 0; i < n; i++){ const an = i / n * Math.PI * 2 + ring * Math.PI / n + k * .6 * f.v.spin, open = sigE(k * 1.3 - ring * .15), rr = R * (.35 + .55 * open) * (1 - ring * .3);
      const px = x + Math.cos(an) * rr * .5, py = y + Math.sin(an) * rr * .22 - (8 + 22 * open) * (1 - ring * .4);
      g.save(); g.translate(px, py); g.rotate(an + Math.PI / 2); g.globalAlpha = a * (.9 - ring * .2); const pg = g.createLinearGradient(0, -rr * .4, 0, rr * .1); pg.addColorStop(0, `rgba(${l},1)`); pg.addColorStop(1, `rgba(${c},.9)`);
      g.fillStyle = pg; g.beginPath(); g.ellipse(0, -rr * .15, rr * .12, rr * .3, 0, 0, 7); g.fill(); g.restore(); } },
  naga(g, x, y, k, f, layer){ const [c, l, d] = f.pal, H = 70 + f.r * .7, turns = 1.6 + f.v.n * .4, rr = f.r * .6, a = Math.min(1, (1 - k) * 2.5), up = sigE(k * 1.25);
    if (layer === 'under'){ const gr = g.createRadialGradient(x, y, 0, x, y, rr * 1.4); gr.addColorStop(0, `rgba(${l},${.4 * a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rr * 1.4, rr * .6, 0, 0, 7); g.fill(); return; }
    // a naga rising in a coil round the spot: a thick scaled body, dark below and light along its back, a crested head with glowing eyes
    const pts = []; for (let i = 0; i <= 46; i++){ const s2 = i / 46 * up, an = s2 * turns * Math.PI * 2 * f.v.spin; pts.push([x + Math.cos(an) * rr * (1 - s2 * .35), y + Math.sin(an) * rr * .42 - s2 * H, Math.sin(an)]); }
    g.save(); g.globalAlpha = a; g.lineCap = 'round';
    for (let i = 1; i < pts.length; i++){ const t2 = i / pts.length, w = 5 + 10 * Math.sin(Math.min(1, t2 * 1.1) * Math.PI * .9), back = pts[i][2] < 0;
      g.strokeStyle = `rgb(${back ? d : c})`; g.lineWidth = w; g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke();
      if (!back){ g.strokeStyle = `rgba(${l},.9)`; g.lineWidth = w * .3; g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1] - w * .25); g.lineTo(pts[i][0], pts[i][1] - w * .25); g.stroke(); if (i % 3 === 0){ g.fillStyle = `rgba(${d},.8)`; g.beginPath(); g.arc(pts[i][0], pts[i][1] + w * .15, w * .14, 0, 7); g.fill(); } } }
    const [hx, hy] = pts[pts.length - 1], [px0, py0] = pts[pts.length - 3], ang = Math.atan2(hy - py0, hx - px0);
    g.translate(hx, hy); g.rotate(ang); g.fillStyle = `rgb(${c})`; g.beginPath(); g.moveTo(14, 0); g.quadraticCurveTo(4, -10, -6, -7); g.lineTo(-6, 7); g.quadraticCurveTo(4, 10, 14, 0); g.fill();
    g.fillStyle = `rgb(${l})`; for (const sd of [-1, 1]){ g.beginPath(); g.moveTo(-2, sd * 6); g.lineTo(-12, sd * 15); g.lineTo(-4, sd * 4); g.fill(); }   // the crest
    g.globalCompositeOperation = 'lighter'; for (const sd of [-1, 1]){ const eg = g.createRadialGradient(5, sd * 3.5, 0, 5, sd * 3.5, 6); eg.addColorStop(0, 'rgba(255,255,220,1)'); eg.addColorStop(1, `rgba(${l},0)`); g.fillStyle = eg; g.beginPath(); g.arc(5, sd * 3.5, 6, 0, 7); g.fill(); }
    g.restore(); },
  chakra(g, x, y, k, f, layer){ const [c, l] = f.pal, R = f.r * (.5 + .55 * sigE(k)), a = Math.min(1, (1 - k) * 2), rot = k * 9 * f.v.spin, sp = 8 + f.v.n * 4;
    g.save(); g.translate(x, layer === 'under' ? y : y - 6); g.scale(1, .45); g.globalAlpha = a; g.strokeStyle = `rgb(${layer === 'under' ? c : l})`;
    if (layer === 'under'){ g.lineWidth = 6; g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke(); g.restore(); return; }
    g.lineWidth = 2.4; g.beginPath(); g.arc(0, 0, R * .92, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, R * .3, 0, 7); g.stroke();
    for (let i = 0; i < sp; i++){ const an = rot + i / sp * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(an) * R * .3, Math.sin(an) * R * .3); g.lineTo(Math.cos(an) * R * .92, Math.sin(an) * R * .92); g.stroke();
      g.fillStyle = `rgb(${c})`; g.beginPath(); g.moveTo(Math.cos(an) * R * .92, Math.sin(an) * R * .92); g.lineTo(Math.cos(an + .12) * R * 1.12, Math.sin(an + .12) * R * 1.12); g.lineTo(Math.cos(an + .24) * R * .92, Math.sin(an + .24) * R * .92); g.fill(); }
    g.restore(); },
  flames(g, x, y, k, f, layer){ const [c, l, d] = f.pal, n = Math.round((9 + f.v.n * 3) * f.q), R = f.r * .8, a = Math.sin(Math.min(1, k * 1.2) * Math.PI);
    if (layer === 'under'){ const gr = g.createRadialGradient(x, y, 0, x, y, R * 1.2); gr.addColorStop(0, `rgba(${c},${.4 * a})`); gr.addColorStop(1, `rgba(${d},0)`); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, R * 1.2, R * .5, 0, 0, 7); g.fill(); return; }
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++){ const an = i / n * Math.PI * 2 + f.v.seed, rr = R * (.3 + .7 * sigR(i, f.v.seed)), px = x + Math.cos(an) * rr, py = y + Math.sin(an) * rr * .42, h = (34 + 42 * sigR(i, 3)) * a * (1 + Math.sin(T * 18 + i) * .15), w = 8 + 5 * sigR(i, 5);
      const fg = g.createLinearGradient(px, py, px, py - h); fg.addColorStop(0, `rgba(${c},.95)`); fg.addColorStop(.5, `rgba(${l},.8)`); fg.addColorStop(1, `rgba(${l},0)`); g.fillStyle = fg;
      g.beginPath(); g.moveTo(px - w, py); g.quadraticCurveTo(px - w * .8, py - h * .5, px + Math.sin(T * 9 + i) * w * .6, py - h); g.quadraticCurveTo(px + w * .8, py - h * .5, px + w, py); g.fill(); }
    g.restore(); },
  stars(g, x, y, k, f, layer){ if (layer === 'under') return; const [c, l] = f.pal, n = 6 + f.v.n * 2, R = f.r * (.4 + .7 * sigE(k)), a = Math.min(1, (1 - k) * 2.2);
    const pts = []; for (let i = 0; i < n; i++){ const an = i / n * Math.PI * 2 + f.v.seed + k * f.v.spin; pts.push([x + Math.cos(an) * R * (.6 + .4 * sigR(i, 2)), y + Math.sin(an) * R * .45 - 26 - sigR(i, 4) * 26]); }
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * .7; g.strokeStyle = `rgba(${l},1)`; g.lineWidth = 1.2; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); g.closePath(); g.stroke();
    for (const [i, [px, py]] of pts.entries()){ const s = (8 + 5 * Math.sin(T * 10 + i)) * a; g.globalAlpha = a; g.fillStyle = `rgba(${l},1)`; g.beginPath();
      for (let j = 0; j < 8; j++){ const an = j / 8 * Math.PI * 2, r2 = j % 2 ? s * .3 : s * 1.4; g.lineTo(px + Math.cos(an) * r2, py + Math.sin(an) * r2); } g.fill();
      const gg = g.createRadialGradient(px, py, 0, px, py, s * 3); gg.addColorStop(0, `rgba(${c},.7)`); gg.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gg; g.beginPath(); g.arc(px, py, s * 3, 0, 7); g.fill(); }
    g.restore(); },
  shards(g, x, y, k, f, layer){ const [c, l, d] = f.pal, n = 7 + f.v.n * 2, R = f.r * .75, grow = sigE(k * 2.2), a = Math.min(1, (1 - k) * 2.5);
    if (layer === 'under'){ g.globalAlpha = a * .5; g.strokeStyle = `rgb(${d})`; g.lineWidth = 2; for (let i = 0; i < n; i++){ const an = i / n * Math.PI * 2 + f.v.seed; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * R * grow, y + Math.sin(an) * R * .45 * grow); g.stroke(); } g.globalAlpha = 1; return; }
    for (let i = 0; i < n; i++){ const an = i / n * Math.PI * 2 + f.v.seed, rr = R * (.45 + .5 * sigR(i, 1)), px = x + Math.cos(an) * rr, py = y + Math.sin(an) * rr * .45, h = (26 + 26 * sigR(i, 6)) * grow, w = 5 + 3 * sigR(i, 8), lean = Math.cos(an) * .35 + f.v.tilt;
      g.save(); g.globalAlpha = a; g.translate(px, py); g.rotate(lean); g.fillStyle = `rgb(${c})`; g.beginPath(); g.moveTo(-w, 0); g.lineTo(0, -h); g.lineTo(w, 0); g.lineTo(0, w * .4); g.fill();
      g.fillStyle = `rgba(${l},.9)`; g.beginPath(); g.moveTo(-w * .2, -2); g.lineTo(0, -h); g.lineTo(w * .6, -2); g.fill(); g.restore(); } },
  feathers(g, x, y, k, f, layer){ const [c, l] = f.pal, n = Math.round((12 + f.v.n * 3) * f.q), a = Math.min(1, (1 - k) * 2);
    if (layer === 'under'){ const gr = g.createRadialGradient(x, y, 0, x, y, f.r); gr.addColorStop(0, `rgba(${l},${.35 * a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, f.r, f.r * .45, 0, 0, 7); g.fill(); return; }
    for (let i = 0; i < n; i++){ const an = sigR(i, 1) * Math.PI * 2, burst = sigE(k * 2), fall = Math.max(0, k - .3), px = x + Math.cos(an) * f.r * burst * (.4 + .7 * sigR(i, 2)) + Math.sin(T * 3 + i) * 8 * fall, py = y - 60 * burst * sigR(i, 3) + fall * 50 - 14;
      g.save(); g.globalAlpha = a; g.translate(px, py); g.rotate(an + Math.sin(T * 4 + i) * .6); const L = 15 + 8 * sigR(i, 4);
      const fg = g.createLinearGradient(0, -L, 0, L); fg.addColorStop(0, `rgba(${l},1)`); fg.addColorStop(1, `rgba(${c},1)`); g.fillStyle = fg;
      g.beginPath(); g.moveTo(0, -L); g.quadraticCurveTo(L * .5, -L * .2, L * .12, L); g.lineTo(-L * .12, L); g.quadraticCurveTo(-L * .5, -L * .2, 0, -L); g.fill();
      g.strokeStyle = `rgba(${c},1)`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, L * 1.2); g.lineTo(0, -L); g.stroke();
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * .5; const gg = g.createRadialGradient(0, 0, 0, 0, 0, L); gg.addColorStop(0, `rgba(${l},.8)`); gg.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gg; g.beginPath(); g.arc(0, 0, L, 0, 7); g.fill(); g.restore(); } },
  lightning(g, x, y, k, f, layer){ const [c, l] = f.pal, n = 3 + f.v.n, a = k < .5 ? 1 : (1 - k) * 2;
    if (layer === 'under'){ const gr = g.createRadialGradient(x, y, 0, x, y, f.r); gr.addColorStop(0, `rgba(${l},${.55 * a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, f.r, f.r * .45, 0, 0, 7); g.fill(); return; }
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    for (let b = 0; b < n; b++){ if (Math.floor(T * 22 + b) % 3 === 0 && k > .2) continue; const ex = x + (sigR(b, 1) - .5) * f.r * 1.2, ey = y + (sigR(b, 2) - .5) * f.r * .5; let px = ex + (sigR(b, 3) - .5) * 40, py = ey - 170;
      for (const [w, col] of [[5, `rgba(${c},${.6 * a})`], [1.8, `rgba(${l},${a})`]]){ g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(px, py); let qx = px, qy = py;
        for (let s = 1; s <= 7; s++){ const t2 = s / 7; qx = px + (ex - px) * t2 + (s < 7 ? (sigR(b * 9 + s, Math.floor(T * 14)) - .5) * 22 : 0); qy = py + (ey - py) * t2; g.lineTo(qx, qy); } g.stroke(); } }
    g.restore(); },
  vortex(g, x, y, k, f, layer){ const [c, l] = f.pal, arms = 3 + f.v.n, R = f.r * (1 - .3 * k), a = Math.sin(Math.min(1, k * 1.15) * Math.PI);
    g.save(); g.translate(x, y - (layer === 'under' ? 0 : 12)); g.scale(1, .45); g.lineCap = 'round';
    for (let i = 0; i < arms; i++) for (let s = 0; s < 3; s++){ const base = i / arms * Math.PI * 2 + T * 6 * f.v.spin + s * .4; g.strokeStyle = `rgba(${s ? l : c},${a * (layer === 'under' ? .35 : .8 - s * .2)})`; g.lineWidth = layer === 'under' ? 7 : 3 - s * .7;
      g.beginPath(); for (let j = 0; j <= 18; j++){ const t2 = j / 18, an = base + t2 * 2.6 * f.v.spin, rr = R * (1 - t2 * .85); j ? g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr) : g.moveTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.stroke(); }
    g.restore(); },
  ripples(g, x, y, k, f, layer){ const [c, l] = f.pal, n = 3 + f.v.n;
    if (layer === 'under'){ for (let i = 0; i < n; i++){ const kk = (k * 1.4 - i * .18); if (kk <= 0 || kk >= 1) continue; const R = f.r * sigE(kk) * 1.15; g.strokeStyle = `rgba(${i % 2 ? l : c},${(1 - kk) * .9})`; g.lineWidth = 6 * (1 - kk) + 1.5; g.beginPath(); g.ellipse(x, y, R, R * .45, 0, 0, 7); g.stroke(); } return; }
    // a crown of water bursting up in the middle, and droplets leaping out
    const cr = Math.sin(Math.min(1, k * 2) * Math.PI), a = 1 - k; g.save(); g.globalAlpha = a;
    for (let i = 0; i < 12; i++){ const an = i / 12 * Math.PI * 2, bx = x + Math.cos(an) * 16, by = y + Math.sin(an) * 7, h = 34 * cr * (.7 + .3 * sigR(i, 9)); const sg = g.createLinearGradient(bx, by, bx, by - h); sg.addColorStop(0, `rgba(${c},.9)`); sg.addColorStop(1, `rgba(${l},.9)`);
      g.fillStyle = sg; g.beginPath(); g.moveTo(bx - 3, by); g.quadraticCurveTo(bx + Math.cos(an) * 6, by - h * .6, bx + Math.cos(an) * 8, by - h); g.lineTo(bx + 3, by); g.fill(); g.fillStyle = `rgba(${l},1)`; g.beginPath(); g.arc(bx + Math.cos(an) * 8, by - h - 3, 2.6, 0, 7); g.fill(); }
    for (let i = 0; i < 14 * f.q; i++){ const an = sigR(i, 1) * Math.PI * 2, rr = f.r * .9 * sigR(i, 2), t2 = (k * 1.6 + sigR(i, 3)) % 1, px = x + Math.cos(an) * rr, py = y + Math.sin(an) * rr * .45 - Math.sin(t2 * Math.PI) * 30;
      g.fillStyle = `rgba(${l},1)`; g.beginPath(); g.ellipse(px, py, 3, 4, 0, 0, 7); g.fill(); } g.restore(); },
  yantra(g, x, y, k, f, layer){ const [c, l] = f.pal, R = f.r * (.7 + .4 * sigE(k)), a = Math.min(1, k * 4, (1 - k) * 2.2), rot = k * 2.2 * f.v.spin;
    if (layer === 'under'){ g.save(); g.translate(x, y); g.scale(1, .45); g.globalAlpha = a;
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, R * 1.1); gr.addColorStop(0, `rgba(${l},.35)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R * 1.1, 0, 7); g.fill();
      g.strokeStyle = `rgb(${c})`; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke(); g.strokeStyle = `rgb(${l})`; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R * .86, 0, 7); g.stroke();
      for (let i = 0; i < 16; i++){ const an = rot * -.5 + i / 16 * Math.PI * 2; g.fillStyle = `rgb(${i % 2 ? c : l})`; g.beginPath(); g.ellipse(Math.cos(an) * R * 1.08, Math.sin(an) * R * 1.08, 6, 3, an, 0, 7); g.fill(); }   // a ring of petals outside
      const pts = 4 + f.v.n; g.lineWidth = 2.6; g.strokeStyle = `rgb(${l})`; for (const off of [0, Math.PI / pts]){ g.beginPath(); for (let i = 0; i <= pts; i++){ const an = rot + off + i / pts * Math.PI * 2; i ? g.lineTo(Math.cos(an) * R * .82, Math.sin(an) * R * .82) : g.moveTo(Math.cos(an) * R * .82, Math.sin(an) * R * .82); } g.stroke(); }
      g.restore(); return; }
    g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 10 * f.q; i++){ const an = i / 10 * Math.PI * 2 + rot, t2 = (k * 1.5 + i / 10) % 1, px = x + Math.cos(an) * R * .7, py = y + Math.sin(an) * R * .3 - t2 * 64;
      g.globalAlpha = a * (1 - t2); g.strokeStyle = `rgba(${l},1)`; g.lineWidth = 2.2; g.beginPath(); g.moveTo(px - 4, py); g.lineTo(px + 4, py); g.moveTo(px, py - 6); g.lineTo(px, py + 6); g.arc(px, py, 4, 0, Math.PI); g.stroke(); } g.restore(); },
  petals(g, x, y, k, f, layer){ const [c, l] = f.pal, n = Math.round((22 + f.v.n * 6) * f.q), a = Math.min(1, k * 5, (1 - k) * 2);
    if (layer === 'under'){ const gr = g.createRadialGradient(x, y, 0, x, y, f.r * 1.1); gr.addColorStop(0, `rgba(${l},${.32 * a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, f.r * 1.1, f.r * .5, 0, 0, 7); g.fill(); return; }
    for (let i = 0; i < n; i++){ const t2 = (k + sigR(i, 1) * .5), an = sigR(i, 2) * Math.PI * 2 + t2 * 3 * f.v.spin, rr = f.r * (.2 + .9 * sigR(i, 3)) * (1 - t2 * .3), px = x + Math.cos(an) * rr, py = y + Math.sin(an) * rr * .45 - (1 - Math.min(1, t2)) * 110;
      g.save(); g.globalAlpha = a; g.translate(px, py); g.rotate(T * 3 + i); g.scale(1, .55 + .45 * Math.abs(Math.sin(T * 5 + i)));   // tumbling
      const pg = g.createLinearGradient(-7, 0, 7, 0); pg.addColorStop(0, `rgba(${l},1)`); pg.addColorStop(1, `rgba(${c},1)`); g.fillStyle = pg; g.beginPath(); g.moveTo(-7, 0); g.quadraticCurveTo(0, -6, 7, 0); g.quadraticCurveTo(0, 6, -7, 0); g.fill(); g.restore(); } },
  embers(g, x, y, k, f, layer){ const [c, l] = f.pal, a = Math.sin(Math.min(1, k * 1.1) * Math.PI), w = f.r * .45;
    if (layer === 'under'){ g.strokeStyle = `rgba(${c},${a * .8})`; g.lineWidth = 4; g.beginPath(); g.ellipse(x, y, f.r * sigE(k), f.r * .45 * sigE(k), 0, 0, 7); g.stroke(); return; }
    g.save(); g.globalCompositeOperation = 'lighter'; const cg = g.createLinearGradient(x - w, 0, x + w, 0); cg.addColorStop(0, `rgba(${c},0)`); cg.addColorStop(.5, `rgba(${l},${.7 * a})`); cg.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = cg; g.fillRect(x - w, y - 200 * a, w * 2, 200 * a);
    for (let i = 0; i < 26 * f.q; i++){ const t2 = (k * 1.8 + sigR(i, 1)) % 1, px = x + (sigR(i, 2) - .5) * f.r * 1.4 + Math.sin(T * 5 + i) * 5, py = y - t2 * 150; g.globalAlpha = a * (1 - t2); g.fillStyle = `rgba(${i % 3 ? c : l},1)`; g.fillRect(px, py, 2.4, 2.4); }
    g.restore(); },
  ink(g, x, y, k, f, layer){ const [c, l, d] = f.pal, n = 5 + f.v.n, a = Math.min(1, (1 - k) * 1.8), grow = sigE(k * 2);
    g.save(); g.lineCap = 'round'; g.globalAlpha = a;
    for (let i = 0; i < n; i++){ const an = i / n * Math.PI * 2 + f.v.seed, L = f.r * (.6 + .5 * sigR(i, 1)) * grow, cx2 = x + Math.cos(an + .5 * f.v.spin) * L * .6, cy2 = y + Math.sin(an + .5 * f.v.spin) * L * .3 - (layer === 'under' ? 0 : 14), ex = x + Math.cos(an) * L, ey = y + Math.sin(an) * L * .45 - (layer === 'under' ? 0 : 14);
      for (let s = 0; s < 6; s++){ const t0 = s / 6, t1 = (s + 1) / 6, P2 = t => [(1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx2 + t * t * ex, (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy2 + t * t * ey];
        g.strokeStyle = `rgb(${layer === 'under' ? d : s % 2 ? c : d})`; g.lineWidth = (layer === 'under' ? 9 : 6) * (1 - t0 * .8); g.beginPath(); g.moveTo(...P2(t0)); g.lineTo(...P2(t1)); g.stroke(); }
      if (layer !== 'under'){ g.fillStyle = `rgb(${l})`; g.beginPath(); g.arc(ex + Math.cos(an) * 8, ey + Math.sin(an) * 4, 2.5, 0, 7); g.fill(); } }
    g.restore(); },
  blades(g, x, y, k, f, layer){ const [c, l] = f.pal, n = 5 + f.v.n * 2, a = Math.min(1, (1 - k) * 3);
    if (layer === 'under'){ if (k < .45) return; g.globalAlpha = a; for (let i = 0; i < n; i++){ const an = i / n * Math.PI * 2, px = x + Math.cos(an) * f.r * .6, py = y + Math.sin(an) * f.r * .27;
        const gr = g.createRadialGradient(px, py, 0, px, py, 18); gr.addColorStop(0, `rgba(${l},.9)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.beginPath(); g.ellipse(px, py, 18, 7, 0, 0, 7); g.fill(); } g.globalAlpha = 1; return; }
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++){ const an = i / n * Math.PI * 2 + k * 4 * f.v.spin, circ = Math.min(1, k / .45), drop = Math.max(0, (k - .45) / .18), rr = f.r * .6, px = x + Math.cos(an) * rr, py = y + Math.sin(an) * rr * .45 - 90 * (1 - Math.min(1, drop)) * circ;
      g.save(); g.globalAlpha = a; g.translate(px, py); g.rotate(drop > 0 ? Math.PI : an + Math.PI / 2); const Lb = 34;
      const tg = g.createLinearGradient(0, -Lb * 1.6, 0, 0); tg.addColorStop(0, `rgba(${c},0)`); tg.addColorStop(1, `rgba(${c},.45)`); g.fillStyle = tg; g.fillRect(-4, -Lb * 1.6, 8, Lb * 1.6);   // its glowing trail
      const bg = g.createLinearGradient(0, -Lb, 0, Lb); bg.addColorStop(0, 'rgba(255,255,255,1)'); bg.addColorStop(.4, `rgba(${l},1)`); bg.addColorStop(1, `rgba(${c},.4)`); g.fillStyle = bg;
      g.beginPath(); g.moveTo(0, -Lb); g.lineTo(5.5, -Lb * .1); g.lineTo(0, Lb * .55); g.lineTo(-5.5, -Lb * .1); g.fill(); g.fillStyle = `rgba(${c},1)`; g.fillRect(-8, Lb * .5, 16, 3); g.restore(); }   // blade and crossguard
    g.restore(); },
  crescent(g, x, y, k, f, layer){ const [c, l] = f.pal, n = 2 + f.v.n, a = Math.min(1, (1 - k) * 2.5);
    if (layer === 'under') return;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++){ const kk = Math.min(1, Math.max(0, k * 2.2 - i * .25)); if (kk <= 0) continue; const R = f.r * (1 + i * .2), st = -1.4 + i * .6 * f.v.spin + f.v.tilt * 4, sweep = 2.6 * sigE(kk);
      g.save(); g.translate(x, y - 22); g.scale(1, .55); g.globalAlpha = a * (1 - kk * .3);
      const cg = g.createRadialGradient(0, 0, R * .7, 0, 0, R); cg.addColorStop(0, `rgba(${c},0)`); cg.addColorStop(.75, `rgba(${c},.9)`); cg.addColorStop(1, `rgba(${l},1)`); g.fillStyle = cg;
      g.beginPath(); g.arc(0, 0, R, st, st + sweep); g.arc(R * .1, -R * .04, R * .78, st + sweep, st, true); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2.2; g.beginPath(); g.arc(0, 0, R, st + sweep * .2, st + sweep); g.stroke(); g.restore(); }
    g.restore(); },
  vines(g, x, y, k, f, layer){ const [c, l, d] = f.pal, n = 5 + f.v.n, grow = sigE(k * 1.8), a = Math.min(1, (1 - k) * 2.2);
    g.save(); g.lineCap = 'round'; g.globalAlpha = a;
    for (let i = 0; i < n; i++){ const an = i / n * Math.PI * 2 + f.v.seed, L = f.r * (.7 + .4 * sigR(i, 1)), pts = [];
      for (let s = 0; s <= 10 * grow; s++){ const t2 = s / 10, w = Math.sin(t2 * 8 + i) * 8; pts.push([x + Math.cos(an) * L * t2 - Math.sin(an) * w, y + Math.sin(an) * L * t2 * .45 + Math.cos(an) * w * .45 - (layer === 'under' ? 0 : t2 * 20 * Math.sin(t2 * Math.PI))]); }
      for (let s = 1; s < pts.length; s++){ g.strokeStyle = `rgb(${layer === 'under' ? d : c})`; g.lineWidth = 4 * (1 - s / 11) + 1; g.beginPath(); g.moveTo(...pts[s - 1]); g.lineTo(...pts[s]); g.stroke();
        if (layer !== 'under' && s % 3 === 0){ g.fillStyle = `rgb(${l})`; g.beginPath(); g.ellipse(pts[s][0] + 4, pts[s][1] - 3, 4, 2, .6, 0, 7); g.fill(); } } }
    g.restore(); },
  sunburst(g, x, y, k, f, layer){ const [c, l] = f.pal, a = Math.sin(Math.min(1, k * 1.2) * Math.PI), rays = 12 + f.v.n * 4, R = f.r * (.8 + .5 * sigE(k)), cy = y - 30;
    if (layer === 'under'){ const gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, `rgba(${l},${.5 * a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, R, R * .45, 0, 0, 7); g.fill(); return; }
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, cy); g.rotate(k * f.v.spin);
    for (let i = 0; i < rays; i++){ const an = i / rays * Math.PI * 2, L = R * (i % 2 ? .7 : 1); g.globalAlpha = a * .5; const rg = g.createLinearGradient(0, 0, Math.cos(an) * L, Math.sin(an) * L); rg.addColorStop(0, `rgba(${l},1)`); rg.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = rg; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(an - .05) * L, Math.sin(an - .05) * L); g.lineTo(Math.cos(an + .05) * L, Math.sin(an + .05) * L); g.fill(); }
    g.globalAlpha = a; g.strokeStyle = `rgba(${l},1)`; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R * .35, 0, 7); g.stroke(); const hg = g.createRadialGradient(0, 0, 0, 0, 0, R * .3); hg.addColorStop(0, 'rgba(255,255,255,1)'); hg.addColorStop(1, `rgba(${l},0)`); g.fillStyle = hg; g.beginPath(); g.arc(0, 0, R * .3, 0, 7); g.fill();
    g.restore(); }
};

/* ---------- playing a skill's signature ---------- */
function sigPlay(id, lv, t){
  const sk = SKILLS[id]; if (!sk || sk.type === 'passive') return; if (!SIGFX.of[id]) sigAssign(); const v = SIGFX.of[id]; if (!v) return;
  const sp = (() => { try { return sk.sp(lv); } catch (e){ return 10; } })(), p = clamp(sp / 55 * (sk.req ? 1.25 : 1), .45, 1.4);
  const self = SIG_SELF.includes(sk.type), pal = SIG_PAL[sk.type === 'heal' || sk.type === 'restore' ? 'heal' : sk.elem] || SIG_PAL.neutral;
  const tg = t && typeof t.x === 'number' ? t : null, at = self || sk.type === 'aoeSelf' || !tg ? P : tg, d = Math.hypot(at.x - P.x, at.y - P.y);
  const delay = self ? 0 : sk.fx === 'meteor' ? .9 : ['bolt', 'ranged', 'line'].includes(sk.type) ? Math.min(.55, d / 400) : ['aoeTarget', 'fieldDot'].includes(sk.type) ? .2 : .05;
  const r = (sk.radius || (sk.type === 'aoeSelf' ? 84 : self ? 50 : 54)) * (1 + .35 * p), dur = 1 + .7 * p, q = sigQ();
  const add = (x, y, rr, dl) => later(dl, () => SIGFX.list.push({x, y, r:rr, t0:T, dur, pal, v, mo:v.mo, q, p, follow:self ? P : null}));
  if (sk.type === 'line' && tg){ const n = 3; for (let i = 1; i <= n; i++) add(P.x + (tg.x - P.x) * i / n, P.y + (tg.y - P.y) * i / n, r * .7, delay * i / n); }
  else add(at.x, at.y, r, delay);
  if (p >= 1.15) later(delay + .1, () => VFX.shake(3 + p * 2));
}
grandFx = function(id, lv, t){ try { sigPlay(id, lv, t); } catch (e) {} };   // replaces the seal-and-column every skill shared
function sigDraw(g, layer){
  if (!SIGFX.list.length) return; const now = T;
  for (const f of SIGFX.list){ const k = (now - f.t0) / f.dur; if (k < 0 || k > 1) continue; const x = (f.follow ? f.follow.x : f.x) - cam.x, y = (f.follow ? f.follow.y : f.y) - cam.y;
    if (x < -200 || x > VW + 200 || y < -200 || y > VH + 260) continue;
    // a self buff or heal is drawn whole behind the hero (both its layers in the ground pass), so it never hides your face
    if (f.follow){ if (layer !== 'under') continue; for (const ly of ['under', 'over']){ g.save(); try { SIG_DRAW[f.mo](g, x, y, k, f, ly); } catch (e) {} g.restore(); } continue; }
    g.save(); try { SIG_DRAW[f.mo](g, x, y, k, f, layer); } catch (e) {} g.restore(); }
}
EV.on('tick', () => { if (SIGFX.list.length) SIGFX.list = SIGFX.list.filter(f => T - f.t0 < f.dur); });
{ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g, ...a){ const r = _u.call(this, g, ...a); sigDraw(g, 'under'); return r; }; }
{ const _o = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a); sigDraw(g, 'over'); return r; }; }
