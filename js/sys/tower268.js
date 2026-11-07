/* VAYRATHEN — js/sys/tower268.js — (v268) the tower: monsters ready before they arrive, and every floor its own place
   The owner: monster and boss animations appeared too late (some still a coarse lump), and climbing felt like staying
   in the same room.
   · READY IN TIME: the next floor's squad and bosses are drawn by lot as soon as a floor is cleared (or the climb
     starts), and their pictures are painted during the rest on the stairs — idle, walk and attack first, in every
     direction — so they arrive fully drawn. Bosses are painted at a higher density (sprites.js) so they stay sharp.
   · EVERY FLOOR ITS OWN PLACE: the hall's light takes the zone's colour (the cursed forest green, the temple of magic
     violet-blue, the demon kingdom red, the gods' land gold, the king's throne crimson), the crystals and drifting
     lights follow it, and each floor lays its own scatter on the stones — coins and broken stones, moss and mushrooms,
     glowing runes and candles, lava cracks and bones, petals and golden feathers, rose petals — placed by the floor
     number, so no two floors look alike. Entering a new zone says so. */
'use strict';
/* ---------- pre-rolled squads and bosses ---------- */
const T268 = {q:null};
const _twsqPick = twsqPick, _t267Pick = typeof t267Pick === 'function' ? t267Pick : null;
function t268Roll(f){
  const q = {f, roles:{}, idx:{}, boss:[]};
  for (const r of ['melee', 'ranged', 'caster', 'support']){ q.roles[r] = []; q.idx[r] = 0; for (let k = 0; k < 3; k++) q.roles[r].push(_twsqPick(f, r)); }   // three kinds a role: a squad of ~12 species, each painted in time
  if (f % 5 === 0 && _t267Pick) for (let k = 0; k < 3; k++) q.boss.push(_t267Pick());
  const kinds = [...new Set([...q.boss, ...(f === 100 ? ['asuraking'] : []), ...Object.values(q.roles).flat()])];
  // painted in passes, so every kind has something real to show first: one idle frame facing you, then the whole idle,
  // then walking, then attacking
  T268.q = q; T268.todo = []; for (const pass of [['idle', 0, 1], ['idle', -1, 99], ['walk', -1, 99], ['attack', -1, 99]]) for (const k of kinds) T268.todo.push([k, ...pass]);
}
twsqPick = function(f, role){ const q = T268.q; if (q && q.f === f && role && q.roles[role] && q.roles[role].length){ const l = q.roles[role]; return l[q.idx[role]++ % l.length]; } return _twsqPick.apply(this, arguments); };
if (_t267Pick) t267Pick = function(){ const q = T268.q; if (q && typeof TW !== 'undefined' && q.f === TW.f && q.boss.length) return q.boss.shift(); return _t267Pick.apply(this, arguments); };
{ const _st = twStart; twStart = function(f0){ t268Roll(f0 || 1); return _st.apply(this, arguments); }; }
{ const _c = twClear; twClear = function(){ const r = _c.apply(this, arguments); if (TW.active) t268Roll(TW.f); return r; }; }
/* paint their pictures: a good share of each frame while resting, a little while fighting */
function t268Paint(){
  if (typeof TW === 'undefined' || !TW.active || !T268.todo || !T268.todo.length || typeof SPR === 'undefined' || !SPR.prime) return;
  const t0 = performance.now();
  let ms = TW.phase === 'rest' ? 14 : 3;
  while (T268.todo.length && performance.now() - t0 < ms){ const [k, act, dir, nf] = T268.todo[0], sh = SHEETS[k];
    if (!sh || SPR.prime(sh, [act], ms - (performance.now() - t0), dir, nf)) T268.todo.shift(); }
}
// on the display's own clock (not the game tick): a fast-forwarded game never stalls on it
{ const loop = () => { try { t268Paint(); } catch (e) {} requestAnimationFrame(loop); }; requestAnimationFrame(loop); }

/* ---------- every floor its own place ---------- */
const TWZ268 = {
  Z:[ {tint:null, crys:'150,230,255', lights:[['255,200,110', .15, 0], ['120,190,255', .12, 2.1], ['255,230,160', .1, 4.2]], kind:'stones'},
      {tint:'120,200,110', a:.3, crys:'170,255,140', lights:[['140,255,120', .15, 0], ['200,255,150', .12, 2.1], ['120,180,90', .1, 4.2]], kind:'moss'},
      {tint:'140,130,255', a:.28, crys:'200,160,255', lights:[['180,120,255', .17, 0], ['90,170,255', .13, 2.1], ['230,150,255', .11, 4.2]], kind:'runes'},
      {tint:'255,110,80', a:.32, crys:'255,140,90', lights:[['255,90,40', .17, 0], ['255,160,60', .13, 2.1], ['200,40,40', .11, 4.2]], kind:'lava'},
      {tint:'255,225,140', a:.22, crys:'255,240,170', lights:[['255,230,140', .15, 0], ['255,255,220', .12, 2.1], ['255,200,120', .1, 4.2]], kind:'feathers'},
      {tint:'255,90,120', a:.3, crys:'255,170,200', lights:[['255,80,110', .17, 0], ['255,200,120', .13, 2.1], ['200,60,140', .11, 4.2]], kind:'roses'} ],
  z(){ const t = typeof TW !== 'undefined' && typeof twmTierOf === 'function' ? twmTierOf(TW.f) : 0; return this.Z[t] || this.Z[0]; },
  bits:null, bitsF:-1
};
const t268On = () => typeof timgOn === 'function' && timgOn();
function t268Bits(f){
  if (TWZ268.bitsF === f && TWZ268.bits) return TWZ268.bits; let sd = f * 7919 + 13; const r = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  const c = twmC(), out = [], n = 14 + (f % 9);
  for (let i = 0; i < n * 4 && out.length < n; i++){ const x = c.x + (r() - .5) * TWM_RX * 1.8, y = c.y + (r() - .5) * TWM_RY * 1.7;
    if (!twzInOct(x, y, 30) || Math.hypot((x - c.x) / 330, (y - c.y) / 185) < 1) continue;   // keep the compass clear
    out.push({x, y, s:.7 + r() * .7, a:r() * 6.283, v:r()}); }
  TWZ268.bits = out; TWZ268.bitsF = f; return out;
}
function t268Bit(g, kind, b, x, y){ const s = b.s; g.save(); g.translate(x, y);
  if (kind === 'stones'){ g.fillStyle = 'rgba(70,60,80,.55)'; for (let k = 0; k < 3; k++){ g.beginPath(); g.ellipse((k - 1) * 7 * s, (k % 2) * 3, 5 * s, 3 * s, b.a, 0, 7); g.fill(); }
    if (b.v < .45){ g.fillStyle = '#e8b840'; g.strokeStyle = '#8a5a10'; g.lineWidth = 1; for (let k = 0; k < 3; k++){ g.beginPath(); g.ellipse(10 * s + k * 4, -2 + k, 3.2 * s, 1.8 * s, 0, 0, 7); g.fill(); g.stroke(); } } }
  else if (kind === 'moss'){ g.fillStyle = 'rgba(80,140,50,.55)'; g.beginPath(); g.ellipse(0, 0, 18 * s, 8 * s, b.a * .2, 0, 7); g.fill();
    if (b.v < .6) for (let k = 0; k < 3; k++){ const mx = (k - 1) * 8 * s; g.fillStyle = '#e8e0d0'; g.fillRect(mx - 1, -6 * s, 2, 6 * s); g.fillStyle = k % 2 ? '#c8402a' : '#9a5ad0'; g.beginPath(); g.ellipse(mx, -6 * s, 5 * s, 3 * s, 0, Math.PI, 0); g.fill(); } }
  else if (kind === 'runes'){ const pu = .5 + Math.sin(T * 2 + b.a) * .3; g.strokeStyle = `rgba(190,150,255,${pu})`; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, 0, 16 * s, 8 * s, 0, 0, 7); g.stroke();
    g.beginPath(); for (let k = 0; k < 5; k++){ const a = b.a + k * 2.513; g.lineTo(Math.cos(a) * 14 * s, Math.sin(a) * 7 * s); } g.closePath(); g.stroke();
    if (b.v < .5){ g.fillStyle = '#f2e8d0'; g.fillRect(18 * s, -9 * s, 3 * s, 9 * s); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,190,90,${.7 + Math.sin(T * 9 + b.a) * .2})`; g.beginPath(); g.ellipse(19.5 * s, -11 * s, 2 * s, 3.4 * s, 0, 0, 7); g.fill(); } }
  else if (kind === 'lava'){ g.globalCompositeOperation = 'lighter'; const pu = .6 + Math.sin(T * 1.8 + b.a) * .3; g.strokeStyle = `rgba(255,${100 + b.v * 60 | 0},30,${pu})`; g.lineWidth = 2.4; g.beginPath(); let px = -18 * s, py = 0; g.moveTo(px, py);
    for (let k = 0; k < 5; k++){ px += 8 * s; py = Math.sin(b.a + k * 1.7) * 5 * s; g.lineTo(px, py); } g.stroke(); g.globalCompositeOperation = 'source-over';
    if (b.v < .4){ g.fillStyle = '#e8dcc8'; g.beginPath(); g.ellipse(10 * s, -4 * s, 4 * s, 3.4 * s, 0, 0, 7); g.fill(); g.fillStyle = '#2a1a1a'; g.fillRect(8 * s, -5 * s, 1.6, 1.6); g.fillRect(11 * s, -5 * s, 1.6, 1.6); } }
  else if (kind === 'feathers'){ g.rotate(b.a); g.fillStyle = 'rgba(255,230,150,.85)'; g.beginPath(); g.ellipse(0, 0, 9 * s, 2.6 * s, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(190,140,50,.8)'; g.lineWidth = .8; g.beginPath(); g.moveTo(-9 * s, 0); g.lineTo(9 * s, 0); g.stroke();
    g.rotate(-b.a); g.fillStyle = 'rgba(255,190,210,.8)'; for (let k = 0; k < 3; k++){ g.beginPath(); g.ellipse(12 * s + k * 5, 4 + k * 2, 2.6 * s, 1.6 * s, b.a + k, 0, 7); g.fill(); } }
  else if (kind === 'roses'){ g.fillStyle = 'rgba(200,30,60,.85)'; for (let k = 0; k < 5; k++){ g.beginPath(); g.ellipse(Math.cos(b.a + k * 1.3) * 12 * s, Math.sin(b.a + k * 1.3) * 6 * s, 3 * s, 1.8 * s, b.a + k, 0, 7); g.fill(); } }
  g.restore(); }
{ const _u = LIVE.drawUnder; LIVE.drawUnder = function(g, ...a){
    if (t268On()){ const z = TWZ268.z();
      if (z.tint){ g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(${z.tint},${z.a})`; g.fillRect(-10, -10, VW + 20, VH + 20); g.globalCompositeOperation = 'soft-light'; g.fillStyle = `rgba(${z.tint},${z.a * .6})`; g.fillRect(-10, -10, VW + 20, VH + 20); g.restore(); }
      for (const b of t268Bits(TW.f)){ const x = b.x - cam.x, y = b.y - cam.y; if (x < -40 || y < -40 || x > VW + 40 || y > VH + 40) continue; t268Bit(g, z.kind, b, x, y); } }
    return _u.call(this, g, ...a); }; }
/* entering a new zone says so */
{ let lastTier = -1; EV.on('tick', () => { if (!t268On()){ lastTier = -1; return; } const t = twmTierOf(TW.f); if (t === lastTier) return; const first = lastTier < 0; lastTier = t;
    const T0 = TWM_TIERS[t]; if (!first && T0) banner(L(`เข้าสู่ ${T0.th}`, `Entering ${T0.en}`)); }); }
