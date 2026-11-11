/* VAYRATHEN — js/sys/bossfury.js — bosses with teeth
   Ferocity: every boss has 30% more HP, hits harder each phase and always hurts (a minimum % of your Max HP gets through armour).
   Phases by HP: 1 (above 70%) · 2 Wrathful (70%) · 3 Frenzied (40%) · 4 Berserk Fury (15%, permanently enraged).
     Each new phase: a roar that knocks you back, a bigger, glowing body, shorter skill cooldowns and new moves.
   Rage meter (under its name): fills from the damage it takes and the time it fights; full → Rampage for 7 s
     (faster, harder hits, skills come twice as often), then it calms and the meter starts again.
   Fury moves (on top of each boss's own list), every one telegraphed so you can roll or step out:
     Crushing Leap (2+) · Rampage Dash, 2–4 dashes (2+) · Burrow Ambush: digs under, hunts you unseen, erupts beneath you (3+)
     — fliers soar out of sight and dive instead · Death Spin (3+) · Shock Rings: roll through them (3+) · Soul Vortex: drags you in, then slams (4).
   While burrowed or in the sky it cannot be hit. Phase 4 chains two skills back to back. */
'use strict';

const FURY = {hp:1.95, atk:[1.1, 1.2, 1.35, 1.55], minHit:[.02, .025, .03, .04], cd:[1, .85, .72, .58]};
const FURY_PH = [null, null, ['โกรธจัด', 'Wrathful'], ['คลั่ง', 'Frenzied'], ['บ้าคลั่งสุดขีด', 'Berserk Fury']];
const FURY_SK = {leap:['กระโจนถล่มปฐพี', 'Crushing Leap'], dash:['พุ่งทะลวงต่อเนื่อง', 'Rampage Dash'], burrow:['มุดดินจู่โจม', 'Burrow Ambush'], soar:['ทะยานฟ้าโฉบ', 'Sky Dive'],
  spin:['พายุหมุนสังหาร', 'Death Spin'], ring:['คลื่นกระแทก', 'Shock Rings'], pull:['ดูดกลืนวิญญาณ', 'Soul Vortex'],
  breath:['ลมหายใจมรณะ', 'Deadly Breath'], miasma:['หมอกพิษ', 'Toxic Miasma'], mist:['หายตัวในหมอก', 'Mist Vanish']};
/* the breath takes the boss's element: fire burns, water chills, shadow curses... (see afflict.js) */
const BREATH_COL = {fire:['255,150,50', '255,230,120'], water:['120,200,255', '220,245,255'], wind:['190,255,200', '255,255,255'], earth:['200,170,110', '240,220,170'], holy:['255,240,170', '255,255,230'], shadow:['170,90,230', '230,190,255'], neutral:['150,230,90', '220,255,170']};
const furyOf = m => m.fz || (m.fz = {phase:1, rage:0, berserk:0, lastHp:m.hp, z:0, rings:[]});
const bossAtkMul = m => (m.fz ? FURY.atk[m.fz.phase - 1] * (m.fz.berserk > 0 ? 1.15 : 1) : FURY.atk[0]);
const bossMinHit = m => Math.round(DER.maxhp * FURY.minHit[(m.fz ? m.fz.phase : 1) - 1]);
const furyLabel = m => { const F = m.fz; return F.berserk > 0 ? ` · ${L('อาละวาด!', 'RAMPAGE!')}` : F.phase > 1 ? ` · ${L(...FURY_PH[F.phase])}` : ''; };
const furyArch = m => (typeof SPECIES_ARCH !== 'undefined' && SPECIES_ARCH[m.type]) || 'human';
const furySay = (m, id) => { addText(m.x, m.y - MOB_H[m.type] - 30, L(...FURY_SK[id]), '#ff9a6a', 16); };
const rollSafe = () => P.roll || P.dead;

/* ---------- ferocity at spawn + harder hits ---------- */
{
  HK.spawn.push(m => { if (m.def.boss){ if (!m.def.wb) { m.maxhp = Math.round(m.maxhp * FURY.hp); m.hp = Math.round(m.hp * FURY.hp); } furyOf(m).lastHp = m.hp; } });
  HK.atkMul.push((m, mult) => (m.def.boss ? mult * bossAtkMul(m) : mult));
  HK.dmgGuard.push((m, res) => {   // underground / in the sky: nothing lands
    if (!(m && m.fz && m.fz.hidden)) return;
    if (res && !res.poison && T - (m.fz.immT || 0) > .6){ m.fz.immT = T; addText(m.x, m.y - 24, m.fz.act && m.fz.act.id === 'soar' ? L('บนฟ้า', 'In the sky') : m.fz.act && m.fz.act.mist ? L('ในหมอก', 'In the mist') : L('ใต้ดิน', 'Underground'), '#d8c8a0', 12); }
    return false; });
  const _hunt = bossHunt;
  bossHunt = function(m, dt, dp, rooted){ if (m.fz && (m.fz.act || m.fz.hidden)) return false; return _hunt(m, dt, dp, rooted); };
}

/* ---------- phases and rage ---------- */
function furyPhaseUp(m, F){
  const d = m.def, ph = F.phase;
  if (typeof bossShout === 'function') bossShout(m, ph >= 3 ? 'fury' : 'rage', L(FURY_PH[ph][0], FURY_PH[ph][1])); else banner(L(`${d.name} · ${FURY_PH[ph][0]}!`, `${d.en} · ${FURY_PH[ph][1]}!`)); SFX.play('roar');
  VFX.play('roar', {x:m.x, y:m.y, r:170}); VFX.play('enrage', {m}); VFX.shake(6 + ph);
  const dx = P.x - m.x, dy = P.y - m.y, l = Math.hypot(dx, dy) || 1;
  if (l < 150 && !rollSafe()){ P.x = clamp(P.x + dx / l * 60, 30, W - 30); P.y = clamp(P.y + dy / l * 40, 40, H - 30); if (typeof pushOut === 'function') pushOut(P, 8); P.cast = null; mobAttack(m, .6, true); }
  if (ph >= 4){ m.enraged = true; F.rage = 0; F.berserk = 5; }   // the last phase opens with a short rampage instead of a permanent one
  m.busy = 1; m.bcd = 1.1; m.charge = null;
}
function furyBerserk(m, F){
  F.berserk = 4.5; F.rage = 0; F.rcd = 22; m.enraged = true;   // shorter, and at most once every ~22 s
  if (!F.txtT || T - F.txtT > 20){ F.txtT = T; addText(m.x, m.y - MOB_H[m.type] - 44, 'RAMPAGE!', '#ff4a3a', 16); } SFX.play('roar'); VFX.play('enrage', {m}); VFX.shake(5);
}

/* ---------- fury moves ---------- */
/* (v276) only what really digs goes underground (the owner: some bosses should not burrow): snakes and worms, insects,
   crabs and scorpions, stone giants, jellies, frogs and toads, crocodiles, lizards, boars and rats. Ghosts and floating
   things vanish into a mist instead; fliers soar; everything else gets a different move (a leap or a rampage). */
function furyDig(m){
  const a = furyArch(m), lk = (typeof BP_INFO !== 'undefined' && BP_INFO[m.type] && BP_INFO[m.type].look) || {}, race = m.def.race;
  if (a === 'bird') return 'soar';
  if (a === 'floater' || race === 'undead' || race === 'ghost' || race === 'spirit') return 'mist';
  if (['serpent', 'bug', 'rock', 'slime', 'squat'].includes(a)) return 'burrow';
  if (a === 'quad' && ['croc', 'lizard', 'boar', 'rat'].includes(lk.head)) return 'burrow';
  return a === 'human' ? 'dash' : 'leap';
}
function furyPick(m, F){
  const fly = furyArch(m) === 'bird', pool = F.phase >= 2 ? ['leap', 'dash', 'breath', 'miasma'] : ['breath', 'miasma'];
  if (F.phase >= 3) pool.push(furyDig(m), 'spin', 'ring');
  if (F.phase >= 4) pool.push('pull', furyDig(m));
  let id = pool[Math.floor(Math.random() * pool.length)];
  if (id === F.lastId && pool.length > 1) id = pool[(pool.indexOf(id) + 1) % pool.length];
  return (F.lastId = id);
}
function furyStart(m, F, id){
  const ph = F.phase; m.atkT = 0; m.lunge = .3; furySay(m, id); m.charge = null; m.lastSk = id; m.lastSkT = T;
  switch (id){
    case 'breath': { const a = Math.atan2(P.y - m.y, P.x - m.x); F.act = {id, t:0, wind:.75, dur:.75 + 1.5, ang:a, len:180 + ph * 10, half:.6, tick:0}; SFX.play('roar'); break; }
    case 'miasma': { const tx = P.x, ty = P.y; VFX.play('warnCircle', {x:tx, y:ty, r:72, t:.7});
      later(.7, () => { if (m.dead) return; VFX.play('bossField', {x:tx, y:ty, r:72, life:6, elem:'poison'}); SFX.play('boom');
        for (let k = 0; k < 12; k++) later(k * .5, () => { if (m.dead || P.dead) return; if (inHit(tx, ty, 72) && !rollSafe()){ m._fx = 'miasma'; mobAttack(m, .22, true); m._fx = null; } }); });
      F.act = {id, t:0, dur:.9}; break; }
    case 'leap': { const r = 76 + ph * 8;   // (v276) a real leap: it crouches, springs high, its shadow falls where it will land, and it crashes down
      F.act = {id, t:0, st:'crouch', cw:.42, dur:.78 - ph * .04, x0:m.x, y0:m.y, tx:m.x, ty:m.y, r, h:95 + ph * 14}; VFX.play('dustPuff', {x:m.x, y:m.y}); break; }
    case 'mist': F.act = {id:'burrow', mist:true, t:0, st:'dig', w:.55, hunt:1.5 + ph * .25}; VFX.play('smokeBomb', {x:m.x, y:m.y}); break;
    case 'dash': F.act = {id, t:0, n:ph + (F.berserk > 0 ? 1 : 0), st:'aim', w:0}; break;
    case 'burrow': case 'soar': F.act = {id, t:0, st:'dig', w:.55, hunt:1.5 + ph * .25}; VFX.play(id === 'soar' ? 'roar' : 'quake', {x:m.x, y:m.y, r:50}); VFX.shake(3); break;
    case 'spin': F.act = {id, t:0, dur:2.2 + ph * .3, tick:.3}; SFX.play('roar'); break;
    case 'ring': { const n = ph >= 4 ? 4 : 3; F.act = {id, t:0, dur:.6 + n * .55}; VFX.play('warnCircle', {x:m.x, y:m.y, r:60, t:.6});
      for (let i = 0; i < n; i++) later(.6 + i * .55, () => { if (m.dead) return; F.rings.push({x:m.x, y:m.y, t:0, hit:false}); VFX.shake(3); SFX.play('boom'); VFX.play('earthsplitBoom', {x:m.x, y:m.y, r:50}); }); break; }
    case 'pull': F.act = {id, t:0, dur:1.7, r:120}; VFX.play('warnCircle', {x:m.x, y:m.y, r:120, t:1.7}); SFX.play('roar'); break;
  }
}
function furyEnd(m, F){ F.act = null; F.hidden = false; F.z = 0; F.sq = null; }
/* runs the move in progress; returns true while the boss is busy with it */
function furyStep(m, F, dt){
  const a = F.act, d = m.def; a.t += dt;
  switch (a.id){
    case 'leap': {
      if (a.st === 'crouch'){ const k = clamp(a.t / a.cw, 0, 1); F.sq = [1 + .2 * k, 1 - .26 * k];   // gathers itself: low and wide, eyes on you
        m.dir = SPR.dirFromVec(P.x - m.x, P.y - m.y); m.atkT = 0;
        if (a.t >= a.cw){ a.st = 'air'; a.t0 = a.t; a.x0 = m.x; a.y0 = m.y; a.tx = clamp(P.x, 40, W - 40); a.ty = clamp(P.y, 60, H - 40); a.trail = [];
          for (let i = 0; i < 3; i++) VFX.play('dustPuff', {x:m.x + rand(-16, 16), y:m.y + rand(-4, 4)}); VFX.shake(2); if (SFX.swing) SFX.swing('fist'); }
        return true; }
      if (a.st === 'air'){ const k = clamp((a.t - a.t0) / a.dur, 0, 1), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        m.x = a.x0 + (a.tx - a.x0) * e; m.y = a.y0 + (a.ty - a.y0) * e; F.z = Math.sin(k * Math.PI) * a.h; m.moved = true; m.dir = SPR.dirFromVec(a.tx - a.x0, a.ty - a.y0);
        const st = Math.cos(k * Math.PI); F.sq = [1 - .1 * Math.abs(st), 1 + .16 * Math.abs(st)];   // stretched on the way up and on the way down
        a.trail.push([m.x, m.y, F.z]); if (a.trail.length > 7) a.trail.shift();
        if (k >= 1){ F.z = 0; pushOut(m, d.r * .6); a.st = 'land'; a.t0 = a.t; F.sq = [1.32, .66];
          VFX.play('earthsplitBoom', {x:m.x, y:m.y, r:a.r}); VFX.play('quake', {x:m.x, y:m.y, r:a.r}); VFX.play('roar', {x:m.x, y:m.y, r:a.r * 1.3});
          for (let i = 0; i < 6; i++){ const an = i / 6 * Math.PI * 2; VFX.play('dustPuff', {x:m.x + Math.cos(an) * a.r * .7, y:m.y + Math.sin(an) * a.r * .4}); }
          VFX.shake(10); SFX.play('boom'); a.boom = {x:m.x, y:m.y, t:0};
          if (inHit(m.x, m.y, a.r) && !rollSafe()){ mobAttack(m, 1.9, true); P.stunT = Math.max(P.stunT || 0, .45); const l = Math.hypot(P.x - m.x, P.y - m.y) || 1; P.x = clamp(P.x + (P.x - m.x) / l * 36, 30, W - 30); P.y = clamp(P.y + (P.y - m.y) / l * 24, 40, H - 30); }
          if (F.phase >= 3) F.rings.push({x:m.x, y:m.y, t:0, hit:false}); }
        return true; }
      const k = clamp((a.t - a.t0) / .32, 0, 1); F.sq = [1.32 - .32 * k, .66 + .34 * k];   // squashed by the landing, then it rises
      if (k >= 1){ F.sq = null; furyEnd(m, F); m.busy = .45; }
      return true; }
    case 'dash': {
      if (a.st === 'aim'){ if (a.w === 0){ const dx = P.x - m.x, dy = P.y - m.y, l = Math.hypot(dx, dy) || 1; a.ux = dx / l; a.uy = dy / l; a.len = Math.min(320, l + 70); a.hit = false;
          VFX.play('warnLine', {x:m.x, y:m.y, ux:a.ux, uy:a.uy, len:a.len, w:46, t:.45}); m.dir = SPR.dirFromVec(a.ux, a.uy); }
        a.w += dt; if (a.w >= .45){ a.st = 'go'; a.left = a.len; } return true; }
      const step = Math.min(a.left, 700 * dt); m.x = clamp(m.x + a.ux * step, 40, W - 40); m.y = clamp(m.y + a.uy * step, 60, H - 40); a.left -= step; m.moved = true;
      if (Math.random() < .7) VFX.play('dustPuff', {x:m.x, y:m.y});
      if (!a.hit && Math.hypot(P.x - m.x, P.y - m.y) < d.r + 18 && !rollSafe()){ a.hit = true; mobAttack(m, 1.6, true); VFX.shake(4); const l = Math.hypot(P.x - m.x, P.y - m.y) || 1; P.x = clamp(P.x + (P.x - m.x) / l * 30, 30, W - 30); P.y = clamp(P.y + (P.y - m.y) / l * 20, 40, H - 30); }
      if (a.left <= 0){ a.n--; if (a.n <= 0){ furyEnd(m, F); m.busy = .6; } else { a.st = 'aim'; a.w = 0; } }
      return true; }
    case 'burrow': case 'soar': {
      const fly = a.id === 'soar';
      if (a.st === 'dig'){ a.w -= dt; if (fly) F.z = (1 - Math.max(0, a.w) / .55) * 120; if (a.w <= 0){ F.hidden = true; a.st = 'hunt'; a.trail = 0; } return true; }
      if (a.st === 'hunt'){ a.hunt -= dt; const dx = P.x - m.x, dy = P.y - m.y, l = Math.hypot(dx, dy) || 1, sp = Math.max(150, d.speed * 2.6);
        if (l > 8){ m.x += dx / l * Math.min(l, sp * dt); m.y += dy / l * Math.min(l, sp * dt); }
        a.trail -= dt; if (a.trail <= 0){ a.trail = .07; if (!fly && !a.mist) VFX.play('dustPuff', {x:m.x + rand(-6, 6), y:m.y}); }
        if (a.hunt <= 0){ a.st = 'warn'; a.w = .8; a.tx = P.x; a.ty = P.y; VFX.play('warnCircle', {x:a.tx, y:a.ty, r:78, t:.8}); }
        return true; }
      if (a.st === 'warn'){ a.w -= dt; m.x += (a.tx - m.x) * Math.min(1, dt * 6); m.y += (a.ty - m.y) * Math.min(1, dt * 6); if (fly) F.z = 130;
        if (a.w <= 0){ m.x = a.tx; m.y = a.ty; F.hidden = false; a.st = 'erupt'; a.w = fly ? .2 : .05; } return true; }
      if (a.st === 'erupt'){ a.w -= dt; if (fly) F.z = Math.max(0, F.z - dt * 650);
        if (a.w <= 0){ F.z = 0; pushOut(m, d.r * .6); VFX.play('earthsplitBoom', {x:m.x, y:m.y, r:78}); VFX.play(fly ? 'roar' : a.mist ? 'smokeBomb' : 'quake', {x:m.x, y:m.y, r:78}); VFX.shake(8); SFX.play('boom');
          if (inHit(m.x, m.y, 78) && !rollSafe()){ mobAttack(m, 2.1, true); P.stunT = Math.max(P.stunT || 0, .6); addText(P.x, P.y - 60, L('ลอยกระเด็น!', 'Knocked up!'), '#ffd56a', 14); }
          furyEnd(m, F); m.busy = .7; } return true; }
      return true; }
    case 'spin': {
      const dx = P.x - m.x, dy = P.y - m.y, l = Math.hypot(dx, dy) || 1, sp = 85 + F.phase * 10; if (l > 10){ m.x += dx / l * sp * dt; m.y += dy / l * sp * dt; m.moved = true; }
      m.dir = Math.floor(a.t * 18) % 8; a.tick -= dt; if (Math.random() < .5) VFX.play('dustPuff', {x:m.x + rand(-20, 20), y:m.y + rand(-6, 6)});
      if (a.tick <= 0){ a.tick = .32; if (inHit(m.x, m.y, 74) && !rollSafe()) mobAttack(m, .55, true); }
      if (a.t >= a.dur){ furyEnd(m, F); m.busy = .8; addText(m.x, m.y - MOB_H[m.type] - 10, 'Dizzy…', '#d8d0ff', 12); }
      return true; }
    case 'ring': case 'miasma': if (a.t >= a.dur){ furyEnd(m, F); m.busy = .3; } return true;
    case 'breath': {
      if (a.t < a.wind){ const want = Math.atan2(P.y - m.y, P.x - m.x); let dd = want - a.ang; dd = Math.atan2(Math.sin(dd), Math.cos(dd)); a.ang += clamp(dd, -dt * 1.2, dt * 1.2); m.dir = SPR.dirFromVec(Math.cos(a.ang), Math.sin(a.ang)); return true; }
      m.atkT = 0; a.tick -= dt;
      if (a.tick <= 0){ a.tick = .35; const dx = P.x - m.x, dy = P.y - m.y, l = Math.hypot(dx, dy); let da = Math.atan2(dy, dx) - a.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
        if (l < a.len && Math.abs(da) < a.half && !rollSafe()){ m._fx = 'breath'; mobAttack(m, .32, true); m._fx = null; } }
      if (a.t >= a.dur){ furyEnd(m, F); m.busy = .5; }
      return true; }
    case 'pull': {
      const dx = m.x - P.x, dy = m.y - P.y, l = Math.hypot(dx, dy) || 1;
      if (l < 330 && l > d.r + 10 && !rollSafe()){ const k = Math.min(l - d.r - 10, (70 + F.phase * 10) * dt); P.x += dx / l * k; P.y += dy / l * k; pushOut(P, 8); }
      if (a.t >= a.dur){ VFX.play('earthsplitBoom', {x:m.x, y:m.y, r:a.r}); VFX.play('roar', {x:m.x, y:m.y, r:a.r}); VFX.shake(7); SFX.play('boom');
        if (inHit(m.x, m.y, a.r) && !rollSafe()) mobAttack(m, 2.3, true); furyEnd(m, F); m.busy = .7; }
      return true; }
  }
  furyEnd(m, F); return false;
}

/* ---------- the boss brain, wrapped ---------- */
{
  const _upd = updBoss;
  updBoss = function(m, dt){
    const F = furyOf(m), d = m.def;
    // rage: damage taken + time in the fight
    const lost = Math.max(0, F.lastHp - m.hp); F.lastHp = m.hp;
    if (F.berserk > 0){ F.berserk -= dt; if (F.berserk <= 0) m.enraged = d.bossSkills.includes('enrage') && m.hp < m.maxhp * .3; }   // calms down quietly
    else if ((F.rcd = (F.rcd || 0) - dt) > 0) F.rage = 0;
    else { F.rage += Math.min(lost / m.maxhp * 120, 6) + dt * (.8 + F.phase * .5); if (F.rage >= 100) furyBerserk(m, F); }
    // phase by HP
    const fr = m.hp / m.maxhp, ph = fr > .7 ? 1 : fr > .4 ? 2 : fr > .15 ? 3 : 4;
    if (ph > F.phase && !F.act){ F.phase = ph; furyPhaseUp(m, F); return true; }
    if (F.act) return furyStep(m, F, dt);
    if (m.charge || m.busy > 0) return _upd(m, dt);
    // from phase 2 on, half of its moves are fury moves
    const cdm = FURY.cd[F.phase - 1] * (F.berserk > 0 ? .55 : 1);
    if ((m.bcd ?? 3) - dt <= 0 && dist(m, P) < 460 && Math.random() < (F.phase >= 2 ? .55 : .3)){
      furyStart(m, F, furyPick(m, F)); m.bcd = rand(3.5, 6) * cdm;
      if (F.phase >= 4 && !F.combo && Math.random() < .45){ F.combo = true; m.bcd = .4; } else F.combo = false;   // phase 4: two moves back to back
      return true;
    }
    const b0 = m.bcd ?? 3, r = _upd(m, dt);
    if (m.bcd > b0 + .3){ m.bcd *= cdm; if (F.phase >= 4 && !F.combo && Math.random() < .45){ F.combo = true; m.bcd = Math.min(m.bcd, (m.busy || 0) + .3); } else F.combo = false; }
    return r;
  };
}

/* moves left hanging when the fight stops (you died, fled to town, left the map) end cleanly; shock rings travel */
EV.on('tick', dt => {
  for (const m of mobs){ const F = m.fz; if (!F) continue;
    if (F.act && (!m.aggro || m.dead || P.dead)){ furyEnd(m, F); }
    for (const r of F.rings){ r.t += dt; const rad = r.t * 260, dd = Math.hypot(P.x - r.x, (P.y - r.y) * 1.6);
      if (!r.hit && Math.abs(dd - rad) < 13 && !rollSafe() && !m.dead){ r.hit = true; mobAttack(m, .9, true); } }
    F.rings = F.rings.filter(r => r.t < .95); }
});

/* ---------- drawing ---------- */
/* hidden boss: a moving dirt mound (burrow) or a dark shadow growing on the ground (sky dive) */
function furyHidden(g, m, x, y){
  const F = m.fz, a = F.act || {}, fly = a.id === 'soar';
  if (fly){ const k = a.st === 'warn' ? 1 - Math.max(0, a.w) / .8 : .3; g.fillStyle = `rgba(0,0,0,${.15 + k * .25})`; g.beginPath(); g.ellipse(x, y, m.def.r * (.6 + k * .8), m.def.r * (.25 + k * .3), 0, 0, 7); g.fill(); return; }
  if (a.mist){ g.save(); for (let i = 0; i < 7; i++){ const ph = (T * .7 + i / 7) % 1, an = i * 2.4 + T * .8, rr = m.def.r * (.4 + .6 * ph);   // (v276) a drifting dark mist
      g.globalAlpha = .35 * Math.sin(ph * Math.PI); g.fillStyle = i % 2 ? '#4a3a6a' : '#2a2238'; g.beginPath(); g.ellipse(x + Math.cos(an) * rr, y - 6 - ph * 18 + Math.sin(an) * rr * .3, m.def.r * (.5 + ph * .4), m.def.r * (.3 + ph * .25), 0, 0, 7); g.fill(); }
    g.restore(); return; }
  const w = m.def.r * 1.1, bob = Math.sin(T * 14) * 1.2;
  g.fillStyle = 'rgba(40,28,16,.35)'; g.beginPath(); g.ellipse(x, y + 2, w * 1.2, w * .4, 0, 0, 7); g.fill();
  g.fillStyle = '#6a4e30'; g.beginPath(); g.ellipse(x, y - 2 + bob, w, w * .42, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#8a6a44'; for (let i = 0; i < 6; i++){ const a2 = Math.PI + (i + .5) / 6 * Math.PI; g.beginPath(); g.arc(x + Math.cos(a2) * w * .75, y - 2 + Math.sin(a2) * w * .32 + bob, 2 + (i % 2), 0, 7); g.fill(); }
}
/* a boss in phase 2+ smoulders: a pulsing aura under it (red when raging) */
function furyAura(g, m, x, y){
  const F = m.fz; if (!F || m.dead || (F.phase < 2 && !(F.berserk > 0))) return;
  const col = F.berserk > 0 ? '255,40,30' : F.phase >= 4 ? '255,60,40' : F.phase >= 3 ? '255,110,40' : '255,170,60', r = m.def.r * (1.7 + F.phase * .15) + Math.sin(T * 6) * 3;
  g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${F.berserk > 0 ? .5 : .32})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * .45, 0, 0, 7); g.fill();
  if (F.phase >= 3 || F.berserk > 0) for (let i = 0; i < 5; i++){ const ph = (T * .8 + i / 5 + m.id * .1) % 1, ex = x + Math.sin(i * 2.4 + T) * m.def.r * .8, ey = y - ph * MOB_H[m.type] * 1.1;
    g.globalAlpha = (1 - ph) * .9; g.fillStyle = `rgb(${col})`; g.fillRect(ex, ey, 1.6, 1.6); }
  g.restore();
}
/* (v276) the breath, drawn as the thing itself — no red cone marking where it reaches (the owner found the marker cheap):
   while it rears back, its element gathers into a glowing ball at its mouth; then a stream pours out — a white-hot core,
   the element's colour round it, smoke or mist at the far end — spreading as it goes, with embers, shards or bubbles
   by element, and a glow on the ground under it. Where the stream is is where it burns. */
const BREATH_RIM = {fire:'190,50,10', water:'40,110,210', wind:'110,190,160', earth:'120,85,45', holy:'230,170,50', shadow:'80,25,130', poison:'60,140,40', neutral:'70,150,40'};
const BREATH_STYLE = {fire:'flame', water:'frost', wind:'gale', earth:'sand', holy:'light', shadow:'shade', poison:'gas', neutral:'gas'};
function furyBreathDraw(m, a, x, y){
  const [c1, c2] = BREATH_COL[m.def.elem] || BREATH_COL.neutral, st = BREATH_STYLE[m.def.elem] || 'gas', z = Math.min(2, PX / 2 + .4), hy = y - MOB_H[m.type] * PX * .45, q = typeof fxQ === 'function' ? fxQ() : 1;
  const mx = x + Math.cos(a.ang) * m.def.r * .6 * PX, my = hy + Math.sin(a.ang) * m.def.r * .35 * PX;
  ctx.save(); ctx.globalCompositeOperation = st === 'gas' || st === 'sand' || st === 'shade' ? 'source-over' : 'lighter';
  if (a.t < a.wind){ const k = a.t / a.wind;   // gathering: motes stream into a growing ball at the mouth
    for (let i = 0; i < 18 * q; i++){ const ph = (T * 1.8 + i / 18) % 1, an = i * 2.39 + T, rr = (1 - ph) * 60 * z; ctx.globalAlpha = ph * k; ctx.fillStyle = `rgb(${i % 2 ? c1 : c2})`; ctx.beginPath(); ctx.arc(mx + Math.cos(an) * rr, my + Math.sin(an) * rr * .7, 1.6 * z, 0, 7); ctx.fill(); }
    const R = (5 + k * 12) * z * (1 + Math.sin(T * 30) * .06), gr = ctx.createRadialGradient(mx, my, 0, mx, my, R * 2.2); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.3, `rgba(${c2},.85)`); gr.addColorStop(1, `rgba(${c1},0)`);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .4 + k * .6; ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(mx, my, R * 2.2, 0, 7); ctx.fill(); ctx.restore(); return; }
  const grow = Math.min(1, (a.t - a.wind) / .25), fade = a.t > a.dur - .3 ? Math.max(0, (a.dur - a.t) / .3) : 1, L0 = a.len * PX * grow;
  ctx.translate(mx, my); ctx.scale(1, .62); ctx.rotate(a.ang);
  // the glow on the ground under the stream
  ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createLinearGradient(0, 0, L0, 0); gg.addColorStop(0, `rgba(${c2},${.28 * fade})`); gg.addColorStop(1, `rgba(${c1},0)`);
  ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L0 * .5, -Math.tan(a.half) * L0 * .55, L0, -Math.tan(a.half) * L0 * .8); ctx.lineTo(L0, Math.tan(a.half) * L0 * .8); ctx.quadraticCurveTo(L0 * .5, Math.tan(a.half) * L0 * .55, 0, 0); ctx.fill();
  const qq = Math.max(.7, q), N = Math.round((st === 'gas' ? 40 : 64) * qq), rim = BREATH_RIM[m.def.elem] || BREATH_RIM.neutral;
  const pt = (i, spd) => { const ph = (T * spd + i / N + Math.sin(i * 7.3) * .05) % 1, rr = ph * L0, spread = a.half * (.2 + .8 * ph), an = Math.sin(i * 12.9898) * spread + Math.sin(T * 7 + i) * .07; return [ph, Math.cos(an) * rr, Math.sin(an) * rr]; };
  // the body of the stream: big soft billows in the element's colour, solid enough to read on any ground
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < N; i++){ const [ph, px, py] = pt(i, st === 'gas' ? 1.1 : 2.1), sz = (st === 'gas' ? 8 + ph * 26 : 6 + ph * 22) * z;
    ctx.globalAlpha = fade * (st === 'gas' ? .45 : .72) * (1 - ph * .5); const gr = ctx.createRadialGradient(px, py, 0, px, py, sz); gr.addColorStop(0, `rgba(${ph < .45 ? c2 : c1},1)`); gr.addColorStop(.45, `rgba(${c1},.95)`); gr.addColorStop(.82, `rgba(${rim},.75)`); gr.addColorStop(1, `rgba(${rim},0)`);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(px, py, sz, 0, 7); ctx.fill(); }
  // the hot heart: bright flecks that glow (shards, grit or rays by element)
  ctx.globalCompositeOperation = st === 'gas' || st === 'sand' ? 'source-over' : 'lighter';
  for (let i = 0; i < N; i++){ const [ph, px, py] = pt(i + .5, st === 'gas' ? 1.3 : 2.6), sz = (2.5 + ph * 9) * z; ctx.globalAlpha = fade * .85 * (1 - ph * .6);
    if (st === 'frost' && i % 3 === 0){ ctx.fillStyle = 'rgba(240,252,255,1)'; ctx.beginPath(); ctx.moveTo(px, py - sz); ctx.lineTo(px + sz * .4, py); ctx.lineTo(px, py + sz); ctx.lineTo(px - sz * .4, py); ctx.fill(); continue; }   // ice shards
    if (st === 'sand' && i % 2 === 0){ ctx.fillStyle = 'rgba(110,80,50,1)'; ctx.fillRect(px, py, 2.6 * z, 2.2 * z); continue; }   // grit and pebbles
    if (st === 'light' && i % 4 === 0){ ctx.strokeStyle = `rgba(${c2},1)`; ctx.lineWidth = 1.4 * z; ctx.beginPath(); ctx.moveTo(px - sz * 1.6, py); ctx.lineTo(px + sz * 1.6, py); ctx.stroke(); continue; }   // rays
    if (st === 'gas' && i % 3){ ctx.strokeStyle = `rgba(${c2},.9)`; ctx.lineWidth = 1 * z; ctx.beginPath(); ctx.arc(px, py, sz * .6, 0, 7); ctx.stroke(); continue; }   // bubbles
    const gr = ctx.createRadialGradient(px, py, 0, px, py, sz); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, `rgba(${c2},1)`); gr.addColorStop(1, `rgba(${c1},0)`); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(px, py, sz, 0, 7); ctx.fill(); }
  // a white-hot core along the middle, and smoke rising from the far end
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = fade * .8; const cg = ctx.createLinearGradient(0, 0, L0 * .7, 0); cg.addColorStop(0, 'rgba(255,255,255,.9)'); cg.addColorStop(1, `rgba(${c2},0)`);
  ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(L0 * .3, 0, L0 * .34, 8 * z, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(L0 * .18, 0, L0 * .2, 4 * z, 0, 0, 7); ctx.fill();
  if (st === 'flame' || st === 'shade'){ ctx.globalCompositeOperation = 'source-over'; for (let i = 0; i < 6 * q; i++){ const ph = (T * .9 + i / 6) % 1; ctx.globalAlpha = fade * .25 * (1 - ph); ctx.fillStyle = st === 'flame' ? '#3a3330' : '#2a1a3a'; ctx.beginPath(); ctx.arc(L0 * (.8 + ph * .25), Math.sin(i * 5) * L0 * .2 - ph * 30 * z, (10 + ph * 20) * z, 0, 7); ctx.fill(); } }
  ctx.restore();
}
/* (v276) the leap: where it will land, its shadow on the ground darkens and grows as it falls (no painted ring); dust
   streams behind it in the air; on landing a crater of cracks and a shock ring spread out */
function furyLeapDraw(m, a){
  const z = Math.min(2, PX / 2 + .4);
  if (a.st === 'air'){ const k = clamp((a.t - a.t0) / a.dur, 0, 1), tx = sx(a.tx), ty = sy(a.ty), r = a.r * PX * (.35 + .65 * k);
    ctx.save(); ctx.fillStyle = `rgba(10,6,4,${.12 + .4 * k})`; ctx.beginPath(); ctx.ellipse(tx, ty, r, r * .42, 0, 0, 7); ctx.fill();
    ctx.fillStyle = `rgba(10,6,4,${.2 + .3 * k})`; ctx.beginPath(); ctx.ellipse(tx, ty, r * .55, r * .23, 0, 0, 7); ctx.fill();
    for (let i = 0; i < (a.trail || []).length; i++){ const [px, py, pz] = a.trail[i], kk = i / a.trail.length; ctx.globalAlpha = kk * .35; ctx.fillStyle = '#c8b090'; ctx.beginPath(); ctx.arc(sx(px) + Math.sin(i * 3) * 6 * z, sy(py - pz * .5) + 10 * z, (4 + kk * 7) * z, 0, 7); ctx.fill(); }
    ctx.restore(); }
  if (a.boom){ const b = a.boom; b.t += 1 / 60; }
}
/* screen overlay: rage bar under the boss's HP bar, shock rings, the spin's whirl and the vortex */
EV.on('draw', () => {
  for (const m of mobs){ const F = m.fz; if (!F || m.dead || F.hop) continue;   // (F.hop: a small monster's jump borrows the lift, not the fury)
    const x = sx(m.x), y = sy(m.y); if (x < -200 || x > SW + 200 || y < -200 || y > SH + 200) continue;
    if (!F.hidden && (m.hp < m.maxhp || m === P.target || m.def.boss)){
      const top = sy(m.y - MOB_H[m.type] * (1 + (F.phase - 1) * .04) - (F.z || 0)) - 8, w = 110, rg = F.berserk > 0 ? Math.min(1, F.berserk / 4.5) : clamp(F.rage / 100, 0, 1);
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - w / 2 - 1, top + 5, w + 2, 4);
      const gr = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, '#ffb040'); gr.addColorStop(1, F.berserk > 0 ? '#ff2a1a' : '#ff6a2a');
      ctx.fillStyle = gr; ctx.fillRect(x - w / 2, top + 6, w * rg, 2);
      for (let i = 1; i < 4; i++){ ctx.fillStyle = F.phase > i ? '#ff5a3a' : 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(x + w / 2 + 6 + (i - 1) * 7, top + 7, 2.4, 0, 7); ctx.fill(); }
    }
    for (const r of F.rings){ const rad = r.t * 260 * PX, cx = sx(r.x), cy = sy(r.y), k = r.t / .95;
      ctx.save(); ctx.strokeStyle = `rgba(255,150,70,${(1 - k) * .9})`; ctx.lineWidth = 5 * Math.min(2, PX / 2 + .5); ctx.beginPath(); ctx.ellipse(cx, cy, rad, rad / 1.6, 0, 0, 7); ctx.stroke();
      ctx.strokeStyle = `rgba(255,240,200,${(1 - k) * .7})`; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
    const a = F.act; if (!a) continue;
    if (a.id === 'breath') furyBreathDraw(m, a, x, y);
    if (a.id === 'leap') furyLeapDraw(m, a);
    if (a.id === 'spin'){ ctx.save(); ctx.translate(x, y - MOB_H[m.type] * PX * .4); ctx.scale(1, .5); for (let i = 0; i < 3; i++){ ctx.strokeStyle = `rgba(255,220,180,${.55 - i * .15})`; ctx.lineWidth = 3 - i; ctx.beginPath(); ctx.arc(0, 0, (m.def.r + 18 + i * 10) * PX, T * 14 + i * 2, T * 14 + i * 2 + 2.4); ctx.stroke(); } ctx.restore(); }
    if (a.id === 'pull'){ ctx.save(); ctx.translate(x, y); ctx.scale(1, .55); for (let i = 0; i < 4; i++){ const k = ((T * .9 + i / 4) % 1), r = (1 - k) * a.r * PX; ctx.strokeStyle = `rgba(190,120,255,${k * .7})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r, -T * 4 + i, -T * 4 + i + 4); ctx.stroke(); } ctx.restore(); }
  }
});

WIKI_SYS.push({id:'bossfury', t:['ความโหดของบอส', 'Boss ferocity'], b:() => `<p>${L('บอสทุกตัว HP มากขึ้น 30% ตีแรงขึ้นตามระยะ และตีทะลุเกราะเสมอ (อย่างน้อยร้อยละของ Max HP คุณ)', 'Every boss has 30% more HP, hits harder each phase and always gets through armour (a share of your Max HP)')}</p>
  <table class="wkt"><tr><th>${L('ระยะ', 'Phase')}</th><th>HP</th><th>${L('ท่าใหม่', 'New moves')}</th></tr>
  <tr><td>1</td><td>100–70%</td><td>${L('ท่าประจำตัวบอส · ลมหายใจมรณะ (ตามธาตุ: ไฟลวก/พิษ/ช้า/คำสาป) · หมอกพิษ', 'its own moves · Deadly Breath (by element: burn/poison/slow/curse) · Toxic Miasma')}</td></tr>
  <tr><td>2 ${L('โกรธจัด', 'Wrathful')}</td><td>70%</td><td>${L('กระโจนถล่มปฐพี · พุ่งทะลวงต่อเนื่อง', 'Crushing Leap · Rampage Dash')}</td></tr>
  <tr><td>3 ${L('คลั่ง', 'Frenzied')}</td><td>40%</td><td>${L('มุดดินจู่โจม (ตัวบินจะทะยานฟ้าโฉบ) · พายุหมุนสังหาร · คลื่นกระแทก', 'Burrow Ambush (fliers: Sky Dive) · Death Spin · Shock Rings')}</td></tr>
  <tr><td>4 ${L('บ้าคลั่งสุดขีด', 'Berserk Fury')}</td><td>15%</td><td>${L('ดูดกลืนวิญญาณ · ใช้ท่าต่อกัน 2 ท่า · คลั่งสั้น ๆ ตอนเข้าเฟส', 'Soul Vortex · two moves back to back · a short rampage on entry')}</td></tr></table>
  <p>${L('แถบส้มใต้เลือดบอสคือ<b>ความคลั่ง</b> เติมจากดาเมจที่โดนและเวลาที่สู้ เต็มแล้วจะ<b>อาละวาด</b> 7 วิ (เร็ว แรง ใช้ท่าถี่) · ทุกท่ามีวงเตือนสีแดง กลิ้ง (Dodge) ผ่านคลื่นกระแทกและหนีจากวงได้ · ตอนมุดดิน/อยู่บนฟ้าตีไม่โดน', 'The orange bar under its HP is <b>Rage</b>: it fills from damage and time; when full the boss goes on a 7s <b>Rampage</b> (faster, harder, more skills) · every move is telegraphed in red, roll through shock rings and out of circles · it cannot be hit while underground or in the sky')}</p>`});
