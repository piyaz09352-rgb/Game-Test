/* VAYRATHEN — js/sys/bossnature.js — (v117) bosses that are big, and move like big animals
   SIZE — each boss gets its own scale (×1.8 to ×2.6 on screen, from ×1.6 for all before) from what it is in real life or in the legend it comes from, against a hero
   of about 1.7 m: a crocodile like Ai Khiam (saltwater crocodiles reach ~6 m), a standing elephant (~3 m at the
   shoulder), the temple guardian giants, the Naga, Thotsakan and Vessavana the lord of giants are the largest;
   ghosts and the forest monkey king the smallest. Height (name plate, HP bar), body radius (where it can be hit)
   and how far it is drawn off screen all follow.
   GAIT — biomechanics: animals of similar shape move alike at the same Froude number, so stride frequency goes
   with 1/√(leg length), and larger animals choose relatively slower speeds with longer ground contact. A boss
   drawn s times bigger therefore steps √s times slower (walk and idle cycles), walks a little slower (s^-0.15),
   breathes slowly at rest (render.js), and its picture follows its real position with a little weight instead
   of snapping. It turns to face a new direction only after holding it for a moment, so it no longer flickers
   between two facings while circling you.
   Its strength is unchanged except where size changes reach (a bigger body is a bigger target). */
'use strict';

const BOSS_SIZE = {
  whitemonkeyking:2.0, lotusturtle:2.3, aikhiam:2.8, marketmatron:1.9, dvarapala:3.0, cavematriarch:1.6, frostqueen:1.5, saming:2.3,
  elderpop:1.8, khankhak:2.4, templecolossus:2.9, andamancrab:2.6, seaogress:2.7, phantomgeneral:2.2, lordkotchasi:3.0,
  waterelephantking:3.1, laplaelord:2.0, nagaking:3.2, tenfacedogre:3.2, garudaking:3.0, vessavana:3.4};
const BN_OLD = 1.6;   // the one size every boss had before (bosshard.js), whose plate and radius changes are undone here
for (const k in MOB){ const d = MOB[k]; if (!d.boss || d.__bn) continue; d.__bn = 1;
  // the legend size, brought onto the screen: the boss sprites are already drawn large, so 1.8 → ×1.8 and 3.4 → ×2.6
  const legend = BOSS_SIZE[k] || (d.lv >= 150 ? 2.8 : d.lv >= 80 ? 2.4 : 2.0), f = +(1.8 + (legend - 1.8) * .5).toFixed(2);
  d.bsz = f;
  if (MOB_H[k]) MOB_H[k] = Math.round(MOB_H[k] / 1.55 * f * .97);         // plate height: bosshard made it ×1.55 for ×1.6
  d.r = Math.round(d.r / 1.35 * (.55 + .45 * f));                         // body radius grows less than height (legs, not barrels)
  if (d.spd) d.spd = Math.round(d.spd * Math.pow(f / BN_OLD, -.15)); }
/* the gait: √(size) slower cycles for bosses (and a little for elites) */
{ const _ma = mobAnim; mobAnim = function(m){ const r = _ma.apply(this, arguments); if (!m || !m.def) return r;
    const f = m.def.boss ? m.def.bsz || BN_OLD : m.elite ? 1.3 : 1; if (f === 1) return r;
    if (r[0] === 'walk' || r[0] === 'idle') return [r[0], r[1] / Math.sqrt(f)];
    return r; }; }
/* weight: the picture eases after the real position, and the facing changes only once it is held */
{ const _dm = drawMobW; drawMobW = function(g, m){
    if (!m || !m.def || !m.def.boss || m.dead) return _dm.apply(this, arguments);
    const now = T, dt = Math.min(.1, Math.max(0, now - (m._bnT || now))); m._bnT = now;
    if (m._vx == null || Math.hypot(m.x - m._vx, m.y - m._vy) > 120){ m._vx = m.x; m._vy = m.y; }
    const k = 1 - Math.exp(-dt * 11 / Math.sqrt(m.def.bsz || BN_OLD)); m._vx += (m.x - m._vx) * k; m._vy += (m.y - m._vy) * k;
    if (m._vd == null) m._vd = m.dir || 0;
    if ((m.dir || 0) !== m._vd){ m._vdT = (m._vdT || 0) + dt; if (m._vdT > .22 || m.atkT < .4){ m._vd = m.dir || 0; m._vdT = 0; } } else m._vdT = 0;
    const x = m.x, y = m.y, d = m.dir; m.x = m._vx; m.y = m._vy; m.dir = m._vd;
    const sx0 = m._vx - cam.x, sy0 = m._vy - cam.y, tr = BN_TRAIT[m.type], moving = m.moving && !(m.atkT < .4);
    g.save();
    if (tr === 'stalk' && moving){ g.translate(sx0, sy0); g.scale(1.04, .9); g.translate(-sx0, -sy0); }          // a big cat lowers its body to stalk
    if (tr === 'hover'){ g.translate(0, -Math.sin(T * 2.2 + (m.id || 0)) * 5); }                                   // a great bird hangs on slow wingbeats
    if (tr === 'heavy' && moving){ const ph = Math.floor(T * 2.4 / Math.sqrt(m.def.bsz || BN_OLD) * 2 + (m.id || 0)); if (ph !== m._step){ m._step = ph; bnDust(m._vx + (ph % 2 ? 1 : -1) * m.def.r * .45, m._vy); } }
    try { return _dm.apply(this, arguments); } finally { g.restore(); m.x = x; m.y = y; m.dir = d; } }; }
/* real-life habits shown in the way each one moves:
   stalk — big cats creep low toward prey; hover — large birds glide on slow beats; heavy — elephants and giants:
   a puff of dust at each footfall (they never leave the ground at once, so no bounce) */
const BN_TRAIT = {saming:'stalk', templecolossus:'stalk', garudaking:'hover', lordkotchasi:'heavy', waterelephantking:'heavy', dvarapala:'heavy',
  tenfacedogre:'heavy', vessavana:'heavy', aikhiam:'heavy'};
const BN_DUST = [];
function bnDust(x, y){ if (BN_DUST.length > 24) BN_DUST.shift(); BN_DUST.push({x, y, t:0}); }
EV.on('tick', dt => { for (let i = BN_DUST.length - 1; i >= 0; i--) if ((BN_DUST[i].t += dt) > .7) BN_DUST.splice(i, 1); });
EV.on('draw', () => { if (!BN_DUST.length) return; const g = ctx, z = typeof PX !== 'undefined' ? PX : 2; g.save();
  for (const p of BN_DUST){ const k = p.t / .7; g.globalAlpha = (1 - k) * .45; g.fillStyle = '#c8b89a';
    for (let i = -1; i <= 1; i++){ g.beginPath(); g.ellipse(sx(p.x + i * 7 * (1 + k)), sy(p.y - 2 - k * 6), (5 + k * 9) * z * .5, (2.5 + k * 4) * z * .5, 0, 0, 7); g.fill(); } }
  g.restore(); });

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'bossnature', t:['บอสตัวใหญ่', 'Giant bosses'], b:() => `<p>${L(
  'บอสแต่ละตัวมีขนาดตามของจริงหรือตามตำนาน เทียบกับคนสูงราว 1.7 เมตร เช่น จระเข้ยักษ์ไอ้เคี่ยม ช้างวารีกุญชร ทวารบาลยักษ์ พญานาค ทศกัณฐ์ และท้าวเวสสุวรรณ ตัวใหญ่ที่สุด · ตัวยิ่งใหญ่ยิ่งก้าวช้า หายใจช้า หันตัวหนักแน่น เหมือนสัตว์ใหญ่จริงๆ',
  'Each boss is sized from life or legend against a 1.7 m hero: the great crocodile, the water elephant, the temple guardians, the Naga, Thotsakan and Vessavana are the largest · the bigger it is, the slower it steps and breathes and the heavier it turns, like real large animals')}</p>`});
