/* VAYRATHEN — js/sys/cute.js — small details everywhere, to make the world cute and lovely
   1) Scenery: every map is sprinkled with tiny things that suit it — flowers that nod in the wind, clover, pebbles
      and mushrooms on the green roads; dry tufts, pebbles and little cacti in the deserts; snowdrops and ice
      crystals in the cold lands; glowing mushrooms in the dark places; ember stones in the volcanic ones; pastel
      flowers with gold glints in the heavenly realms; potted flowers around Aren.
   2) Heroes and monsters: rosy cheeks for every hero, soft dust puffs under your feet when you walk, monsters
      breathe gently and squash when they are hit, you squash a little when you are hurt, and a defeated
      monster vanishes in a puff of cloud and stars.
   3) Fights: damage numbers pop with a springy bounce and a cream outline; level-ups shower hearts and stars;
      picked-up items leave a sparkle.
   4) Windows and buttons: they open with a soft pop, buttons squish when pressed (css/systems.css).
   Everything follows the graphics level (fewer details on low), and none of it changes the game. */
'use strict';

const CUTE = {decor:[], parts:[], stepT:0, map:-1};
const cuteOn = () => !(typeof PHOTO !== 'undefined' && PHOTO.on && PHOTO.clean);
const cuteLv = () => (typeof GFX === 'undefined' ? 1 : [0.35, .7, 1][GFX.fx] ?? 1);

/* ---------- 1) scenery ---------- */
const CUTE_THEME = b => (['primeval', 'amberfen'].includes(b) ? 'primeval' : ['desert', 'dryplain', 'canyon', 'dragonroost', 'oasis'].includes(b) ? 'dry' : ['lavafield', 'crater', 'ashforest', 'dragonvale', 'naraka'].includes(b) ? 'fire'
  : ['glacier', 'frozenlake', 'icecave', 'frostcitadel', 'kailash'].includes(b) ? 'snow' : ['cemetery', 'cave', 'badan', 'demonthrone'].includes(b) ? 'dark'
  : ['tavatimsa', 'meru', 'anodat', 'himmapan', 'innerhim'].includes(b) ? 'heaven' : !b ? 'town' : 'lush');
const CUTE_KINDS = {
  primeval:[['tuft', 4], ['pebble', 3], ['clover', 1]],   // the Early Cretaceous had almost no flowers (data/world4.js)
  lush:[['flower', 1], ['clover', 2], ['pebble', 3], ['mush', 1], ['tuft', 4]],   // (v154) far fewer cartoon flowers: the ground has its own detail now (world/ground2.js)
  town:[['pot', 2], ['flower', 4], ['clover', 2], ['bud', 3]],
  dry:[['tuft', 5], ['pebble', 4], ['cactus', 1]],
  fire:[['ember', 4], ['cinder', 5]],   
  snow:[['snowdrop', 3], ['pebble', 3]],
  dark:[['glowmush', 5], ['pebble', 3], ['wisp', 1]],
  heaven:[['flower', 2], ['tuft', 3], ['pebble', 2], ['glint', 1]]
};
const PETALS = {lush:['#e8dfc8', '#e8c84a', '#c890b8', '#f0ece0'], town:['#ff7aa8', '#ffd84a', '#ff9a5a', '#ffffff'], heaven:['#f0e4c8', '#e8c8d8', '#f4ecd0']};
function cuteRng(seed){ let h = seed >>> 0 || 1; return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; }; }
function cuteBuild(){
  CUTE.map = MAP_ID; CUTE.decor = [];
  const mp = MAPS[MAP_ID] || {}, th = CUTE_THEME(MAP_ID === 0 ? null : mp.biome), kinds = CUTE_KINDS[th], tot = kinds.reduce((s, k) => s + k[1], 0), rnd = cuteRng(9973 * (MAP_ID + 3));
  const n = Math.round(W * H / 4200 * cuteLv());
  for (let i = 0, tries = 0; i < n && tries < n * 4; tries++){
    const x = 30 + rnd() * (W - 60), y = 40 + rnd() * (H - 70);
    let u = rnd() * tot, kind = kinds[0][0]; for (const [k, w] of kinds){ u -= w; if (u <= 0){ kind = k; break; } }
    if (typeof walkable === 'function' && !walkable(x, y, 5)) continue;
    if (typeof waterAt === 'function' && waterAt(x, y, 6)) continue;
    if (GATES.some(g => Math.hypot(g.x - x, g.y - y) < 60)) continue;
    if (MAP_ID === 0 && typeof inVillage === 'function' && inVillage({x, y}) && kind !== 'pot' && kind !== 'flower' && kind !== 'bud') continue;
    const pal = PETALS[th] || PETALS.lush;
    // little clusters: flowers and buds come in twos and threes
    const cl = (kind === 'flower' || kind === 'bud' || kind === 'snowdrop' || kind === 'glowmush') ? 1 + Math.floor(rnd() * 3) : 1;
    for (let c = 0; c < cl; c++) CUTE.decor.push({x:x + (c ? (rnd() - .5) * 14 : 0), y:y + (c ? (rnd() - .5) * 7 : 0), k:kind, c:pal[Math.floor(rnd() * pal.length)], s:1.25 + rnd() * .6, ph:rnd() * 6.28});
    i++;
  }
  CUTE.decor.sort((a, b) => a.y - b.y);
}
/* (v97) the little ground decorations are painted once into small pictures (a few sway positions each) and stamped,
   instead of ~200 vector shapes every frame; the ones that glow or twinkle are still drawn live */
const CUTE_STATIC = new Set(['flower', 'bud', 'clover', 'pebble', 'mush', 'pot', 'tuft', 'cactus', 'bone', 'cinder', 'sulfur', 'snowdrop']), CUTE_SPR = new Map();
function cuteSprite(d, sw, R){
  const key = `${d.k}|${d.c}|${d.k === 'tuft' ? MAP_ID : ''}|${Math.round(d.s * 10)}|${sw}|${R}`; let c = CUTE_SPR.get(key); if (c) return c;
  if (CUTE_SPR.size > 900) CUTE_SPR.clear();
  const s = Math.round(d.s * 10) / 10, hw = 8 * s + 3, top = 11 * s + 3, bot = 3, k = R / 4;   // R: device pixels per world unit, ×4
  c = document.createElement('canvas'); c.width = Math.ceil(hw * 2 * k); c.height = Math.ceil((top + bot) * k);
  const g = c.getContext('2d'); g.scale(k, k); g.translate(hw, top);
  cuteShape(g, {...d, s}, sw / 3 * .9, false, 0, 0); c.ox = hw; c.oy = top; c.k = k; CUTE_SPR.set(key, c); return c;
}
function cuteDecor(g){
  if (CUTE.map !== MAP_ID) cuteBuild();
  const x0 = cam.x - 20, x1 = cam.x + VW + 20, y0 = cam.y - 20, y1 = cam.y + VH + 20, night = typeof isNight === 'function' && isNight();
  const tr = g.getTransform(), R = Math.max(4, Math.round(Math.abs(tr.a) * 1.35 * 4));
  for (const d of CUTE.decor){ if (d.y < y0) continue; if (d.y > y1) break; if (d.x < x0 || d.x > x1) continue;
    if (CUTE_STATIC.has(d.k)){ const q = Math.round(Math.sin(T * 1.8 + d.ph) * 3), c = cuteSprite(d, q, R), sc = 1.35 / c.k;
      g.drawImage(c, d.x - cam.x - c.ox * 1.35, d.y - cam.y - c.oy * 1.35, c.width * sc, c.height * sc); continue; }
    g.save(); g.translate(d.x - cam.x, d.y - cam.y); g.scale(1.35, 1.35); cuteShape(g, d, Math.sin(T * 1.8 + d.ph) * .9, night, 0, 0); g.restore();
  }
}
function cuteShape(g, d, sw, night, x, y){
  const s = d.s;
    switch (d.k){
      case 'flower': {   // a stem, two leaves and five round petals that nod in the wind
        g.strokeStyle = '#3f8a3a'; g.lineWidth = .9; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sw * .5, y - 3 * s, x + sw, y - 5.5 * s); g.stroke();
        g.fillStyle = '#5cb04a'; g.beginPath(); g.ellipse(x - 1.4, y - 1.8 * s, 1.5, .7, -.5, 0, 7); g.ellipse(x + 1.4, y - 2.6 * s, 1.5, .7, .5, 0, 7); g.fill();
        const cx = x + sw, cy = y - 6 * s; g.fillStyle = d.c; for (let i = 0; i < 5; i++){ const a = i * 1.2566 + d.ph; g.beginPath(); g.arc(cx + Math.cos(a) * 1.5 * s, cy + Math.sin(a) * 1.2 * s, 1.15 * s, 0, 7); g.fill(); }
        g.fillStyle = '#ffe36a'; g.beginPath(); g.arc(cx, cy, .9 * s, 0, 7); g.fill(); break; }
      case 'bud': { g.strokeStyle = '#4a9a3e'; g.lineWidth = .8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + sw * .6, y - 3.5 * s); g.stroke();
        g.fillStyle = d.c; g.beginPath(); g.ellipse(x + sw * .6, y - 4.2 * s, 1.1 * s, 1.5 * s, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x + sw * .6 - .5, y - 5 * s, .7, .7); break; }
      case 'clover': { g.fillStyle = '#3c6a30'; for (let i = 0; i < 3; i++){ const a = i * 2.094 - 1.57 + sw * .05; g.beginPath(); g.arc(x + Math.cos(a) * 1.4, y - 1.5 + Math.sin(a) * 1, 1.25 * s, 0, 7); g.fill(); }
        g.fillStyle = '#5a8a42'; g.fillRect(x - .4, y - 2.2, .8, .8); break; }
      case 'pebble': { g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.ellipse(x + .4, y + .5, 2.2 * s, .9 * s, 0, 0, 7); g.fill();
        g.fillStyle = '#b9b0a2'; g.beginPath(); g.ellipse(x, y - .4, 2 * s, 1.3 * s, 0, 0, 7); g.fill(); g.fillStyle = '#e4ddd0'; g.beginPath(); g.ellipse(x - .5, y - .9, .8 * s, .45 * s, 0, 0, 7); g.fill(); break; }
      case 'mush': { g.fillStyle = '#e8dcc4'; g.fillRect(x - .7, y - 2.6 * s, 1.4, 2.6 * s); g.fillStyle = '#9a6a3e'; g.beginPath(); g.ellipse(x, y - 2.8 * s, 2.4 * s, 1.6 * s, 0, Math.PI, 0); g.fill();
        g.fillStyle = '#fff'; g.fillRect(x - 1.2, y - 3.6 * s, .8, .8); g.fillRect(x + .6, y - 3.2 * s, .7, .7); break; }
      case 'pot': { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x, y + .4, 3.2, 1.1, 0, 0, 7); g.fill();
        g.fillStyle = '#c4683a'; g.beginPath(); g.moveTo(x - 2.8, y - 3.6); g.lineTo(x + 2.8, y - 3.6); g.lineTo(x + 2, y); g.lineTo(x - 2, y); g.closePath(); g.fill(); g.fillStyle = '#e08a54'; g.fillRect(x - 3.1, y - 4.3, 6.2, 1.1);
        for (let i = -1; i <= 1; i++){ g.fillStyle = '#4fa646'; g.beginPath(); g.ellipse(x + i * 1.6, y - 5.2, 1.1, .6, i * .6, 0, 7); g.fill(); g.fillStyle = i ? d.c : '#ffd84a'; g.beginPath(); g.arc(x + i * 1.8 + sw * .2, y - 7 + Math.abs(i) * .6, 1.2, 0, 7); g.fill(); } break; }
      case 'tuft': { g.strokeStyle = typeof MAP_ID !== 'undefined' && MAPS[MAP_ID] && /^(grass|forest|primeval|amberfen|bamboo|river|marsh|himmapan|anodat|meru|tavatimsa)$/.test(MAPS[MAP_ID].biome) ? '#4e7034' : '#a8905a'; g.lineWidth = .8; for (let i = -2; i <= 2; i++){ g.beginPath(); g.moveTo(x + i * .8, y); g.quadraticCurveTo(x + i * 1.2, y - 2.5 * s, x + i * 1.8 + sw * .5, y - 4 * s * (1 - Math.abs(i) * .15)); g.stroke(); } break; }
      case 'cactus': { g.fillStyle = '#5a9a4a'; g.beginPath(); g.ellipse(x, y - 3.5 * s, 1.8 * s, 3.6 * s, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x - 2.4 * s, y - 3.6 * s, .9 * s, 1.6 * s, 0, 0, 7); g.fill();
        g.fillStyle = '#ff8fb4'; g.beginPath(); g.arc(x, y - 7 * s, 1 * s, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x - .9, y - 5.5 * s, .6, 3 * s); break; }
      case 'bone': { g.fillStyle = '#efe6d2'; g.fillRect(x - 2.4, y - 1, 4.8, 1); for (const e of [-2.4, 2.4]){ g.beginPath(); g.arc(x + e, y - 1.3, .75, 0, 7); g.arc(x + e, y - .2, .75, 0, 7); g.fill(); } break; }
      case 'cinder': { g.fillStyle = '#100c0b'; g.beginPath(); g.ellipse(x + .3, y + .3, 2.3 * s, 1 * s, 0, 0, 7); g.fill(); g.fillStyle = '#2e2826'; g.beginPath(); g.ellipse(x, y - .4, 2 * s, 1.3 * s, .3, 0, 7); g.fill();
        g.fillStyle = '#4a4240'; g.beginPath(); g.ellipse(x - .5, y - .9, .7 * s, .4 * s, 0, 0, 7); g.fill(); break; }
      case 'sulfur': { g.fillStyle = '#b89a28'; g.beginPath(); g.ellipse(x, y - .2, 2.8 * s, 1.2 * s, 0, 0, 7); g.fill(); g.fillStyle = '#ecd860'; for (let i = 0; i < 3; i++){ g.beginPath(); g.arc(x - 1.4 + i * 1.4, y - .6 - (i % 2) * .5, .55 * s, 0, 7); g.fill(); } break; }
      case 'ember': { const gl = .55 + Math.sin(T * 3 + d.ph) * .3; g.fillStyle = '#3a2a26'; g.beginPath(); g.ellipse(x, y - .6, 2.3 * s, 1.4 * s, 0, 0, 7); g.fill();
        g.fillStyle = `rgba(255,${120 + gl * 80 | 0},40,${gl})`; g.beginPath(); g.ellipse(x - .3, y - .9, 1.2 * s, .6 * s, 0, 0, 7); g.fill(); break; }
      case 'snowdrop': { g.strokeStyle = '#5a9a7a'; g.lineWidth = .8; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 1 + sw * .3, y - 4, x + 2 + sw * .4, y - 4.2 * s); g.stroke();
        g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x + 2 + sw * .4, y - 3.4 * s, 1 * s, 1.4 * s, .3, 0, 7); g.fill(); g.fillStyle = '#bfe8ff'; g.fillRect(x + 1.8 + sw * .4, y - 2.3 * s, .6, .6); break; }
      case 'crystal': { const tw = .6 + Math.sin(T * 2.5 + d.ph) * .4; g.fillStyle = 'rgba(170,225,255,.9)'; g.beginPath(); g.moveTo(x, y - 6 * s); g.lineTo(x + 1.6 * s, y - 2); g.lineTo(x, y); g.lineTo(x - 1.6 * s, y - 2); g.closePath(); g.fill();
        g.fillStyle = `rgba(255,255,255,${tw})`; g.fillRect(x - .4, y - 4.6 * s, .8, 2); if (tw > .9){ g.fillRect(x - 2, y - 5 * s, 4, .5); g.fillRect(x - .25, y - 6.8 * s, .5, 3.6); } break; }
      case 'glowmush': { const gl = (night ? .85 : .5) + Math.sin(T * 2 + d.ph) * .15; g.fillStyle = '#d8d0e8'; g.fillRect(x - .5, y - 2.2 * s, 1, 2.2 * s);
        g.fillStyle = `rgba(150,${200 + (d.ph * 8 | 0) % 50},255,${gl})`; g.beginPath(); g.ellipse(x, y - 2.4 * s, 1.9 * s, 1.3 * s, 0, Math.PI, 0); g.fill();
        g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = gl * .35; g.fillStyle = '#9ad8ff'; g.beginPath(); g.arc(x, y - 3, 4 * s, 0, 7); g.fill(); g.restore(); break; }
      case 'wisp': { const fy = y - 6 - Math.sin(T * 1.5 + d.ph) * 2; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .5 + Math.sin(T * 3 + d.ph) * .2; g.fillStyle = '#b8f0ff'; g.beginPath(); g.arc(x, fy, 1.4, 0, 7); g.fill(); g.globalAlpha *= .4; g.beginPath(); g.arc(x, fy, 3.5, 0, 7); g.fill(); g.restore(); break; }
      case 'glint': { const tw = Math.max(0, Math.sin(T * 2.2 + d.ph)); if (tw < .2) break; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = tw; g.fillStyle = '#fff2b0';
        g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x + .6, y - 3.6); g.lineTo(x, y - 1.2); g.lineTo(x - .6, y - 3.6); g.closePath(); g.fill(); g.fillRect(x - 2.4, y - 3.85, 4.8, .5); g.restore(); break; }
    }
}


/* ---------- little particles: dust puffs, poof clouds, hearts, stars ---------- */
function cuteAdd(p){ if (CUTE.parts.length > 260 * cuteLv()) return; CUTE.parts.push(Object.assign({t:0, z:0, vx:0, vy:0, vz:0, g:0, size:2, rot:0}, p)); }
function cuteHeart(g, x, y, r, col){ g.fillStyle = col; g.beginPath(); g.moveTo(x, y + r * .9); g.bezierCurveTo(x - r * 1.6, y - r * .2, x - r * .7, y - r * 1.4, x, y - r * .5); g.bezierCurveTo(x + r * .7, y - r * 1.4, x + r * 1.6, y - r * .2, x, y + r * .9); g.fill(); }
function cuteStar(g, x, y, r, col, rot = 0){ g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++){ const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
function cuteParts(g, under){
  for (const p of CUTE.parts){ if (!!p.under !== under) continue;
    const k = p.t / p.life, x = p.x - cam.x, y = p.y - cam.y - p.z, a = p.k === 'puff' ? (1 - k) * .55 : k < .15 ? k / .15 : 1 - Math.max(0, (k - .55) / .45);
    if (a <= 0) continue; g.globalAlpha = a;
    if (p.k === 'puff'){ g.fillStyle = p.col || '#f4ecdc'; g.beginPath(); g.arc(x, y, p.size * (.6 + k * .9), 0, 7); g.fill(); }
    else if (p.k === 'cloud'){ const r = p.size * (.7 + k * .6); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, r, 0, 7); g.arc(x - r * .8, y + r * .25, r * .7, 0, 7); g.arc(x + r * .8, y + r * .2, r * .72, 0, 7); g.fill();
      g.fillStyle = 'rgba(210,220,240,.8)'; g.beginPath(); g.ellipse(x, y + r * .55, r * 1.3, r * .3, 0, 0, 7); g.fill(); }
    else if (p.k === 'heart') cuteHeart(g, x, y, p.size * (k < .15 ? .6 + k / .15 * .4 : 1), p.col);
    else if (p.k === 'star') cuteStar(g, x, y, p.size, p.col, p.rot);
    else if (p.k === 'spark'){ g.fillStyle = p.col; g.fillRect(x - p.size, y - .35, p.size * 2, .7); g.fillRect(x - .35, y - p.size, .7, p.size * 2); }
  }
  g.globalAlpha = 1;
}
EV.on('tick', dt => {
  if (!dt) dt = 1 / 60;
  for (const p of CUTE.parts){ p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vz -= p.g * dt; p.z = Math.max(0, p.z + p.vz * dt); p.rot += (p.vr || 0) * dt; }
  CUTE.parts = CUTE.parts.filter(p => p.t < p.life);
  if (!cuteOn() || PAUSED) return;
  // soft dust puffs under your feet
  if (P.moving && !P.dead && !P.ride){ CUTE.stepT -= dt; if (CUTE.stepT <= 0){ CUTE.stepT = .2; const dir = Math.random() < .5 ? -1 : 1;
    const theme = CUTE_THEME(MAP_ID === 0 ? null : (MAPS[MAP_ID] || {}).biome), col = theme === 'snow' ? '#ffffff' : theme === 'dry' ? '#e8d4a8' : theme === 'fire' ? '#8a7a74' : '#efe6d2';
    cuteAdd({k:'puff', under:true, x:P.x + dir * 3, y:P.y + 1, vx:dir * 6, vy:-2, size:2.2, life:.45, col}); } }
});
/* a defeated monster leaves in a puff of cloud and a ring of little stars */
EV.on('kill', m => { if (!m || !cuteOn()) return; const h = (typeof MOB_H !== 'undefined' && MOB_H[m.type]) || 20, y = m.y - h * .4;
  for (let i = 0; i < 5; i++){ const a = i / 5 * 6.28; cuteAdd({k:'cloud', x:m.x + Math.cos(a) * 6, y:y + Math.sin(a) * 3, vx:Math.cos(a) * 14, vy:Math.sin(a) * 6, size:3 + Math.random() * 2, life:.55}); }
  const cols = ['#ffe36a', '#ffb0d0', '#a8e0ff', '#ffffff'];
  for (let i = 0; i < 6; i++){ const a = i / 6 * 6.28 + Math.random() * .4; cuteAdd({k:'star', x:m.x, y:y, z:4, vx:Math.cos(a) * 34, vy:Math.sin(a) * 14, vz:30 + Math.random() * 30, g:90, size:1.8 + Math.random(), col:cols[i % 4], life:.8, vr:6}); }
});
/* level up: hearts and stars bubble up around you */
EV.on('level', () => { if (!cuteOn()) return; const cols = ['#ff7aa8', '#ffb0d0', '#ffe36a', '#ffffff', '#b98cff'];
  for (let i = 0; i < 18; i++){ const a = Math.random() * 6.28, r = 6 + Math.random() * 14; cuteAdd({k:i % 3 ? 'heart' : 'star', x:P.x + Math.cos(a) * r, y:P.y + Math.sin(a) * r * .4, z:10 + Math.random() * 20, vz:22 + Math.random() * 26, vx:Math.cos(a) * 6, size:i % 3 ? 2.2 + Math.random() : 2, col:cols[i % 5], life:1.4 + Math.random() * .6, vr:3}); }
});
/* picking something up: a twinkle where it was */
EV.on('pickup', () => { if (!cuteOn()) return; for (let i = 0; i < 5; i++){ const a = i / 5 * 6.28; cuteAdd({k:'spark', x:P.x + Math.cos(a) * 7, y:P.y - 14 + Math.sin(a) * 4, vy:-10, size:1.6, col:'#fff4c0', life:.5}); }
  cuteAdd({k:'heart', x:P.x + 6, y:P.y - 30, z:0, vz:16, size:2, col:'#ff8fb4', life:.9}); });
{ const _pl = pickLoot; pickLoot = function(l){ const had = !!l; const r = _pl.apply(this, arguments); if (had && cuteOn()) for (let i = 0; i < 4; i++){ const a = i / 4 * 6.28; cuteAdd({k:'spark', x:l.x + Math.cos(a) * 5, y:l.y - 6 + Math.sin(a) * 3, vy:-12, size:1.5, col:'#fff4c0', life:.45}); } return r; }; }

/* draw: scenery and puffs on the ground, clouds/hearts/stars above everything */
{ const _du = LIVE.drawUnder; LIVE.drawUnder = function(g){ _du.call(this, g); if (!cuteOn()) return; g.save(); cuteDecor(g); cuteParts(g, true); g.restore(); }; }
{ const _do = LIVE.drawOver; LIVE.drawOver = function(g, ...a){ const r = _do.call(this, g, ...a); if (CUTE.parts.length){ g.save(); cuteParts(g, false); g.restore(); } return r; }; }
EV.on('map', () => { CUTE.map = -1; CUTE.parts = []; });

/* ---------- 2) monsters breathe and squash when hit; you squash a little when hurt ---------- */
{ const _dm = drawMobW;
  drawMobW = function(g, m){
    if (!cuteOn() || m.dead || (m.fz && m.fz.hidden)) return _dm(g, m);
    const x = m.x - cam.x, y = m.y - cam.y, hit = m.flash > 0 ? Math.min(1, m.flash / .12) : 0, br = m.moving ? 0 : Math.sin(T * 2.6 + m.id) * .025;
    const sxk = 1 + hit * .14 - br * .5, syk = 1 - hit * .12 + br;
    if (Math.abs(sxk - 1) < .002 && Math.abs(syk - 1) < .002) return _dm(g, m);
    g.save(); g.translate(x, y); g.scale(sxk, syk); g.translate(-x, -y); const r = _dm(g, m); g.restore(); return r;
  };
}
{ const _dp = drawPlayerW;
  drawPlayerW = function(g){
    if (!cuteOn() || !(P.hurt > 0) || P.dead) return _dp(g);
    const x = P.x - cam.x, y = P.y - cam.y, k = Math.min(1, P.hurt / .25); g.save(); g.translate(x, y); g.scale(1 + k * .08, 1 - k * .07); g.translate(-x, -y); const r = _dp(g); g.restore(); return r;
  };
}

/* ---------- 3) springy damage numbers with a cream outline ---------- */
{ const _dt = drawDmgText;
  drawDmgText = function(t){
    const crit = t.size >= 20 && /!$/.test(t.s); if (crit || !cuteOn()) return _dt(t);
    const k = t.t / t.life, z = clamp(PX / 2.2, 1.15, 2.6), x = sx(t.x), y = sy(t.y);
    // elastic pop: overshoot, settle, then drift up a touch and fade
    const e = Math.min(1, k / .22), pop = k < .22 ? 1 + Math.sin(e * Math.PI * 1.5) * .45 * (1 - e) + (1 - e) * .3 : 1, rise = k * 10 * z;
    const ouch = t.col === '#ff8a80';
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    ctx.globalAlpha = k > .65 ? 1 - (k - .65) / .35 : 1; ctx.translate(x + (ouch && k < .2 ? Math.sin(k * 90) * 2 : 0), y - rise); ctx.scale(pop * z, pop * z * (k < .08 ? .85 + k * 1.9 : 1));
    ctx.font = FD(900, t.size);
    if (t.ring){ ctx.lineWidth = 12; ctx.strokeStyle = t.ring; ctx.strokeText(t.s, 0, 0); }
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(40,20,30,.85)'; ctx.strokeText(t.s, 0, 0);
    ctx.lineWidth = 2.2; ctx.strokeStyle = ouch ? '#ffe0e0' : 'rgba(255,248,232,.95)'; ctx.strokeText(t.s, 0, 0);
    const gr = ctx.createLinearGradient(0, -t.size * .8, 0, 1); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.45, t.col); gr.addColorStop(1, t.col);
    ctx.fillStyle = /^[\d,]+$/.test(t.s) ? gr : t.col; ctx.fillText(t.s, 0, 0);
    ctx.restore();
  };
}

/* ---------- heroes: rosy cheeks for everyone (sprites build with cfg.blush) ---------- */
if (SPR.CHARS) for (const k in SPR.CHARS){ const c = SPR.CHARS[k]; if (c && c.paint) c.blush = true; }

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'cute', t:['รายละเอียดน่ารัก', 'Cute details'], b:() => `<ul>
  <li>${L('ทุกแมพมีดอกไม้ ใบโคลเวอร์ ก้อนกรวด เห็ด กระบองเพชร ดอกหิมะ เห็ดเรืองแสง หินถ่านไฟ ฯลฯ ตามภูมิประเทศ ดอกไม้โยกตามลม', 'Every map has flowers, clover, pebbles, mushrooms, cacti, snowdrops, glowing mushrooms or ember stones to suit it; flowers nod in the wind')}</li>
  <li>${L('ฝุ่นนุ่ม ๆ ใต้เท้าตอนเดิน · มอนหายใจและยุบตัวเมื่อโดนตี · มอนที่ล้มหายไปเป็นก้อนเมฆและดาว', 'Soft dust under your feet · monsters breathe and squash when hit · defeated monsters vanish in a puff of cloud and stars')}</li>
  <li>${L('ตัวเลขดาเมจเด้งดึ๋ง · เลเวลอัปมีหัวใจและดาว · เก็บของมีประกาย · แก้มชมพูทุกตัวละคร', 'Springy damage numbers · hearts and stars on level-up · sparkles on pick-up · rosy cheeks for every hero')}</li>
  <li>${L('ปรับกราฟิกเป็น "ต่ำ" จะลดรายละเอียดเหล่านี้', 'The "low" graphics setting thins these details out')}</li></ul>`});
