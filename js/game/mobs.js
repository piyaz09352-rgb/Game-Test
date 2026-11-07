/* VAYRATHEN — js/game/mobs.js */
'use strict';

/* ---------- mobs ---------- */
function spawnMob(type, x, y, opt = {}){
  const d = MOB[type];
  const m = {id:++mobId, type, def:d, x, y, hx:x, hy:y, hp:d.hp, maxhp:d.hp, aggro:false, tx:null, ty:null, wait:rand(0, 2),
    atkCd:0, flash:0, dead:false, deadT:0, face:1, dir:0, atkT:9, hurtT:0, moving:false, zone:opt.zone || ZA, minion:!!opt.minion, split:false, born:T};
  mobs.push(m); return m;
}
function addSlots(type, n, zone, night = false){ for (let i = 0; i < n; i++) spawnSlots.push({type, zone, night, mob:null, timer:rand(0, 2)}); }

/* respawn pace (seconds) */
const MOB_RESPAWN = [2.5, 5];                // a spawn slot waits this long after its monster dies (was 6–12)
const BOSS_GAP = [25 * 60, 35 * 60];         // region boss: after a kill the next comes 25–35 min later, random (about every 30 min)
const BOSS_FIRST = [60, 30 * 60];            // a map whose boss clock isn't running yet: the first one is somewhere in the next 1–30 min
const bossGap = () => rand(BOSS_GAP[0], BOSS_GAP[1]), bossFirst = () => rand(BOSS_FIRST[0], BOSS_FIRST[1]);

const CYCLE = 180, NIGHT_AT = 120;
/* the world runs on Thailand time (UTC+7, no daylight saving) */
const thNow = () => new Date((typeof wNow === 'function' ? wNow() : Date.now()) + 7 * 3600e3 + (window.GM_TOFS || 0) * 3600e3);   // GM_TOFS: a GM's time-of-day preview (hours, this screen only)
const thHour = () => { const d = thNow(); return d.getUTCHours() + d.getUTCMinutes() / 60; };
const isNight = () => { const h = thHour(); return h >= 18.5 || h < 6; };      // darkness and night monsters: 18:30–06:00
const isEvent = () => { const h = thHour(); return h >= 17 || h < 2; };        // after-work event 17:00–02:00: EXP and drops x1.5
const EVENT_MUL = 1.5;

function updSlots(dt){
  if (typeof nmSlave === 'function' && nmSlave()){ mobs = mobs.filter(m => !m.dead || m.deadT < (m.vanish ? .6 : 1.2)); return; }   // the room's host spawns for everyone
  const night = isNight();
  for (const s of spawnSlots){
    if (s.night && !night && !(typeof msDayWant === 'function' && msDayWant(s.type))){   /* (v220) a story step that needs a night monster brings it out by day too */
      if (s.mob && !s.mob.dead){ s.mob.dead = true; s.mob.deadT = 0; s.mob.vanish = true; if (P.target === s.mob) P.target = null; }
      s.mob = null; s.timer = rand(0, 3); continue;
    }
    if (!s.mob || s.mob.dead){
      s.timer -= dt;
      if (s.timer <= 0){ const p = randIn(s.zone, MOB[s.type].r); s.mob = spawnMob(s.type, p.x, p.y, {zone:s.zone}); s.timer = rand(MOB_RESPAWN[0], MOB_RESPAWN[1]); }
    }
  }
  if (!boss){
    bossTimer -= dt;
    if (bossTimer <= 0){
      const mp = MAPS[MAP_ID], bt = mp.boss, at = bossSpot();
      boss = spawnMob(bt, at.x, at.y, {zone:MAP_ID === 0 ? ZB : MAPZ}); boss.roamT = rand(12, 20);
      if (BOSS_RESTORE && T < BOSS_RESTORE.until) boss.hp = Math.max(1, Math.round(boss.maxhp * BOSS_RESTORE.f)); BOSS_RESTORE = null;
      boss.bcd = 3; VFX.play('bossArrive', {x:at.x, y:at.y});
      banner(L(`Boss ${MOB[bt].name} ปรากฏตัวที่${mp.name}!`, `Boss: ${MOB[bt].en} appears in ${mp.en}!`)); log(L(`Boss ${MOB[bt].name} Lv.${MOB[bt].lvl} ปรากฏตัวแล้ว`, `Boss ${MOB[bt].en} Lv.${MOB[bt].lvl} has appeared`), 'g');
    }
  }
  mobs = mobs.filter(m => !m.dead || m.deadT < (m.vanish ? .6 : 1.2));
}

/* a random place for the boss to appear: open ground, away from the gates and not on top of the player */
function bossSpot(){
  const zone = MAP_ID === 0 ? ZB : MAPZ;
  for (let i = 0; i < 60; i++){ const q = randIn(zone, 30);
    if (!walkable(q.x, q.y, 30) || GATES.some(g => Math.hypot(g.x - q.x, g.y - q.y) < 420) || Math.hypot(P.x - q.x, P.y - q.y) < 450) continue; return q; }
  return randIn(zone, 30);
}
/* a boss on your screen spots you from as far as the longest bow shot (Wildwarden 210 + Hawk's Eye 80) */
const BOSS_SIGHT = 290;
// "on screen" for a boss. While nothing is drawn (hidden tab / screen rest) the camera is stale, so use a screen-sized box around the hero instead
const bossSeesYou = m => { const still = document.hidden || (typeof REST !== 'undefined' && REST.on), cx = still ? P.x - VW / 2 : cam.x, cy = still ? P.y - VH / 2 : cam.y;
  return m.x > cx - 20 && m.x < cx + VW + 20 && m.y > cy - 20 && m.y < cy + VH + 40; };
function updMob(m, dt){
  if (m.dead){ m.deadT += dt; return; }
  const d = m.def;
  // bosses don't guard one spot: while calm they wander to a new part of the map every 15–30 s
  if (d.boss && !m.aggro && (m.roamT = (m.roamT || 0) - dt) <= 0){ m.roamT = rand(15, 30); const q = randIn(m.zone, 30); if (walkable(q.x, q.y, d.r)){ m.hx = q.x; m.hy = q.y; m.tx = null; m.wait = 0; } }
  if (m.stunT > 0){ m.stunT -= dt; m.moving = false; return; }
  m.flash = Math.max(0, m.flash - dt);
  if (updStatus(m, dt)){ m.moving = false; return; }
  const spd = mobSpeedMul(m), rooted = mobRooted(m);
  if (hideBuff() && m.aggro && !m.taunt && !d.boss){ m.aggro = false; m.tx = m.hx; m.ty = m.hy; } m.atkCd -= dt; m.atkT += dt; m.hurtT = Math.max(0, m.hurtT - dt); m.moved = false;
  const dp = dist(m, P);
  if (!P.dead && d.aggro && !m.aggro && !hideBuff() && dp < (d.boss ? (bossSeesYou(m) ? BOSS_SIGHT : 240) : 150) * (typeof wxSight === 'function' ? wxSight() : 1) && !inVillage(P)) m.aggro = true;
  if (m.aggro){
    if (P.dead || inVillage(P) || (!d.boss && Math.hypot(m.x - m.hx, m.y - m.hy) > 400)){
      if (d.boss){ m.hx = m.x; m.hy = m.y; m.flee = 0; }                       // a boss gives up only when you die or reach the village
      m.aggro = false; m.tx = m.hx; m.ty = m.hy; m.wait = 0;
    } else {
      if (d.boss && bossHunt(m, dt, dp, rooted)) { m.moving = m.moved; return; }
      if (d.boss && updBoss(m, dt)) { m.moving = m.moved; return; }
      const reach = d.range ? d.range : (d.reach || d.r + 12), fury = d.boss ? 1 + Math.min(.7, (m.flee || 0) * .18) : 1;
      const fo = m.foe && !m.foe.dead && (SUMMONS.includes(m.foe) || (typeof petIsFoe === 'function' && petIsFoe(m.foe))) ? m.foe : (m.foe = null), tg = fo || P, dt0 = fo ? dist(m, fo) : dp;   // a bound beast that hit it pulls it away from you
      if (dt0 > reach + (fo ? 8 : 0)){ if (!rooted) moveTo(m, tg.x, tg.y, d.speed * 1.3 * spd * (m.enraged ? 1.3 : 1) * fury, dt); }
      else { m.dir = SPR.dirFromVec(tg.x - m.x, tg.y - m.y); if (m.atkCd <= 0){ if (fo){ m.lunge = .2; m.atkT = 0; SFX.mob('atk', m); if (fo === PET) petHurt(m); else hitBeast(fo, m); } else if (d.range) mobShoot(m); else mobAttack(m); m.atkCd = d.delay * (m.enraged ? .7 : 1); } }
    }
  } else {
    if (m.wait > 0) m.wait -= dt;
    else {
      if (m.tx == null){
        const a = Math.random() * 7, r = rand(20, 100);
        m.tx = clamp(m.hx + Math.cos(a) * r, m.zone.x0, m.zone.x1); m.ty = clamp(m.hy + Math.sin(a) * r, m.zone.y0, m.zone.y1);
      }
      if (rooted || moveTo(m, m.tx, m.ty, d.speed * spd, dt)){ m.tx = null; m.wait = rand(1, 4); }
    }
  }
  if (MAP_ID === 0 && inVillage(m)){ const a = Math.atan2(m.y - 800, m.x - 1200); m.x = 1200 + Math.cos(a) * 470; m.y = 800 + Math.sin(a) * 470; }   // monsters stay out of round Aren
  pushOut(m, d.r * .6);
  if (m.tx != null && m.wait <= 0 && !m.aggro && Math.random() < dt * .3) m.tx = null; // unstick
  m.moving = m.moved;
}

function mobAttack(m, mult = 1, noDodge = false){
  const d = m.def, nightMul = 1, st = m.st || {};
  const mhit = 95 + d.lvl * 1.55, chance = clamp(mhit - DER.flee + 80, 5, 95);   // (v100) Flee never dodges more than 95%
  m.lunge = .2; m.atkT = 0;
  if (!m.def.range && !noDodge) SFX.mob('atk', m);
  if (P.roll){ addText(P.x, P.y - 48, 'Dodge!', '#9fd8ff'); return; }
  if (!noDodge && Math.random() * 100 > chance){ addText(P.x, P.y - 48, 'Miss', '#9fd8ff'); return; }
  if (DER.pas.dodge && Math.random() < DER.pas.dodge){ addText(P.x, P.y - 48, 'Perfect Dodge', '#d8f0ff', 13); SFX.play('pdodge'); VFX.play('blink', {x:P.x, y:P.y, x2:P.x, y2:P.y}); return; }
  const raw = rand(d.atk[0], d.atk[1]) * mult * (m.enraged ? 1.5 : 1) * nightMul * (st.atkDown > 0 ? 1 - st.atkDownPct : 1);
  // (v100) two-layer defence: hard DEF (gear, buffs) takes a share off, less and less per point (70% at most), then soft DEF (VIT) a flat amount.
  // Early on the old flat subtraction is kinder, so the hero takes whichever of the two is smaller: low levels feel the same, high DEF keeps paying off
  const flat = raw - DER.def - buffDef(), layered = typeof bhRed === 'function' ? raw * (1 - bhRed(bhHardDef())) - bhSoftDef() : flat;
  let dmg = Math.max(1, Math.round(Math.min(flat, layered)));
  if (d.boss && typeof bossPunch === 'function') dmg = Math.max(dmg, bossPunch(m, mult, noDodge));   // (v55) bosses hit for real: a share of a frail hero's HP, cut by DEF/MDEF and damage reduction
  else if (d.boss && typeof bossMinHit === 'function') dmg = Math.max(dmg, Math.round(bossMinHit(m) * Math.min(1.5, mult)));   // a boss always hurts: armour can't shrug it off
  const rfl = Math.min(.5, buffSum('reflect')); if (rfl > 0){ const r = Math.max(1, Math.round(dmg * rfl)); applyDamage(m, {dmg:r}); }   // every reflect buff counts (Golden Shield, Bastion …)
  const bk = P.buffs.barrier ? 'barrier' : Object.keys(P.buffs).find(k => P.buffs[k].barrier > 0), br = bk && P.buffs[bk];   // any shield buff (Mana Barrier, Sacred Ward, a friend's shield)
  if (br){ const a = Math.min(br.barrier, dmg); br.barrier -= a; dmg -= a; VFX.play('barrierHit', {x:P.x, y:P.y}); SFX.play('shieldhit'); if (br.barrier <= 0){ delete P.buffs[bk]; renderBuffs(); } if (dmg <= 0){ addText(P.x, P.y - 48, 'Absorbed', '#9fd0ff', 13); return; } }
  S.hp -= dmg; if (!DER.pas.noFlinch) P.hurt = .25; P.sit = false; SFX.play('hurt');
  addText(P.x, P.y - 48, String(dmg), '#ff8a80');
  if (S.hp <= 0 && DER.pas.lastStand && P.lastStandCd <= 0){ S.hp = Math.max(1, Math.round(DER.maxhp * DER.pas.lastStand)); P.lastStandCd = 300; SFX.play('laststand'); VFX.play('laststand', {x:P.x, y:P.y}); banner(L('ยืนหยัดจนวาระสุดท้าย!', 'Last Stand!')); return; }
  if (S.hp <= 0) playerDie();
}

/* ---------- ranged monsters: a projectile that lands after its flight ---------- */
function mobShoot(m){
  m.lunge = .2; m.atkT = 0; SFX.mob('shot', m);
  const h = MOB_H[m.type] * .55, d = Math.hypot(P.x - m.x, P.y - m.y), t = d / 260;
  VFX.play('mobShot', {x:m.x, y:m.y - h, tx:P.x, ty:P.y - 20, t, kind:m.def.shot || 'dart'});
  later(t, () => { if (!m.dead && !P.dead && Math.hypot(P.x - m.x, P.y - m.y) < (m.def.range || 120) + 80) mobAttack(m, .9); });
}

/* ---------- boss skills ----------
   Every boss cycles through its own list with a telegraph (a red circle or line on the ground) so the player can
   step out of the way. slam/quake: area around the boss · charge: dash along a line · barrage: a fan of shots ·
   meteor: circles land around the player · summon: calls 2 monsters of its map (4 at most) · heal: recovers 3% HP · roar: stuns
   nearby · field: a lingering pool under the player · teleport: blinks behind the player · wave: a long line hit ·
   enrage: below 30% HP hits harder and faster (once). Bosses ignore every status. */
const BOSS_SKILL_TH = {slam:['ทุบพื้น', 'Ground Slam'], quake:['แผ่นดินไหว', 'Earthquake'], charge:['พุ่งชน', 'Charge'], barrage:['ระดมยิง', 'Barrage'], meteor:['ฝนอุกกาบาต', 'Meteor Rain'],
  summon:['เรียกบริวาร', 'Summon'], heal:['ฟื้นพลัง', 'Regenerate'], roar:['คำรามสะท้าน', 'Terrifying Roar'], field:['บ่อพิษ', 'Cursed Pool'], teleport:['หายตัว', 'Vanish'], wave:['คลื่นพลัง', 'Shockwave'], enrage:['คลั่ง', 'Enrage']};
const inHit = (x, y, r) => Math.hypot(P.x - x, (P.y - y) * 1.6) < r;
function bossCast(m, id){
  const d = m.def, at = {x:P.x, y:P.y}, e = d.elem;
  const say = () => { addText(m.x, m.y - MOB_H[m.type] - 26, L(...BOSS_SKILL_TH[id]), '#ffb0a0', 15); };
  m.atkT = 0; m.lunge = .3;
  switch (id){
    case 'slam': case 'quake': {
      const r = id === 'quake' ? 170 : 105, wait = id === 'quake' ? 1.3 : .9; say();
      VFX.play('warnCircle', {x:m.x, y:m.y, r, t:wait});
      later(wait, () => { if (m.dead) return; VFX.play(id === 'quake' ? 'quake' : 'earthsplitBoom', {x:m.x, y:m.y, r}); VFX.shake(id === 'quake' ? 6 : 4); SFX.play('boom'); if (inHit(m.x, m.y, r)) mobAttack(m, id === 'quake' ? 1.6 : 2.2, true); });
      return 1.4;
    }
    case 'charge': {
      const dx = at.x - m.x, dy = at.y - m.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, len = 260; say();
      VFX.play('warnLine', {x:m.x, y:m.y, ux, uy, len, w:44, t:.75});
      later(.75, () => { if (m.dead) return; const x0 = m.x, y0 = m.y; m.charge = {ux, uy, left:len, x0, y0, hit:false}; });
      return 1.5;
    }
    case 'wave': {
      const dx = at.x - m.x, dy = at.y - m.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, len = 340; say();
      VFX.play('warnLine', {x:m.x, y:m.y, ux, uy, len, w:50, t:.8});
      later(.8, () => { if (m.dead) return; VFX.play('bossWave', {x:m.x, y:m.y, ux, uy, len, elem:e});
        const px = P.x - m.x, py = P.y - m.y, along = px * ux + py * uy, off = Math.abs(px * uy - py * ux); if (along > 0 && along < len && off < 30) mobAttack(m, 2, true); });
      return 1.3;
    }
    case 'barrage': {
      say(); const n = 7, base = Math.atan2(at.y - m.y, at.x - m.x);
      for (let i = 0; i < n; i++){ const a = base + (i - (n - 1) / 2) * .16, tx = m.x + Math.cos(a) * 260, ty = m.y + Math.sin(a) * 260, tt = .55;
        later(i * .06, () => { if (m.dead) return; VFX.play('mobShot', {x:m.x, y:m.y - MOB_H[m.type] * .5, tx, ty:ty - 16, t:tt, kind:d.shot || {fire:'fire', water:'ice', holy:'holy', wind:'bolt'}[e] || 'dark'});
          later(tt, () => { const k = ((P.x - m.x) * (tx - m.x) + (P.y - m.y) * (ty - m.y)) / (260 * 260); if (k > 0 && k < 1.1){ const cx = m.x + (tx - m.x) * k, cy = m.y + (ty - m.y) * k; if (Math.hypot(P.x - cx, P.y - cy) < 20) mobAttack(m, .8, true); } }); }); }
      return 1.4;
    }
    case 'meteor': {
      say();
      for (let i = 0; i < 5; i++){ const x = at.x + (i ? rand(-90, 90) : 0), y = at.y + (i ? rand(-50, 50) : 0), wt = 1 + i * .18;
        VFX.play('warnCircle', {x, y, r:46, t:wt});
        later(wt, () => { if (m.dead) return; VFX.play('boom', {x, y, big:false}); if (e === 'fire') VFX.play('groundFire', {x, y, r:20, life:2.4}); if (inHit(x, y, 46)) mobAttack(m, 1.5, true); }); }
      return 2;
    }
    case 'summon': {
      say(); const pool = MAP_ID === 0 ? [d.summon || 'dewblob'] : MAPS[MAP_ID].mobs.filter(t => !MOB[t].night);
      const have = mobs.filter(o => o.minion && !o.dead).length, cap = typeof BOSS_SUM !== 'undefined' ? BOSS_SUM.cap(m) : 4; if (have >= cap) return .5;
      const n = Math.min(cap - have, typeof BOSS_SUM !== 'undefined' ? BOSS_SUM.n(m) : 2);   // (v55) more of them (bosshard.js)
      for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2, x = m.x + Math.cos(a) * 80, y = m.y + Math.sin(a) * 48;
        const c = spawnMob(pool[Math.floor(Math.random() * pool.length)], x, y, {zone:m.zone, minion:true}); c.aggro = true; VFX.play('bossSummon', {x, y}); }
      return 1.2;
    }
    case 'heal': {
      if (m.hp > m.maxhp * .8) return 0;
      say(); const h = Math.round(m.maxhp * .03); m.hp = Math.min(m.maxhp, m.hp + h); addText(m.x, m.y - MOB_H[m.type] - 8, `+${h.toLocaleString()}`, '#c4ffe0', 15); VFX.play('heal', {x:m.x, y:m.y});
      return 1;
    }
    case 'roar': {
      say(); VFX.play('warnCircle', {x:m.x, y:m.y, r:150, t:.7});
      SFX.play('roar'); later(.7, () => { if (m.dead) return; VFX.play('roar', {x:m.x, y:m.y}); VFX.shake(5); if (inHit(m.x, m.y, 150) && !P.roll){ P.stunT = 1.4; P.cast = null; VFX.play('stunStars', {}); addText(P.x, P.y - 60, 'Stun', '#ffd56a', 14); } });
      return 1.3;
    }
    case 'field': {
      say(); const x = at.x, y = at.y; VFX.play('warnCircle', {x, y, r:70, t:.6});
      later(.6, () => { if (m.dead) return; VFX.play('bossField', {x, y, r:70, life:5, elem:e});
        for (let k = 0; k < 10; k++) later(k * .5, () => { if (!m.dead && inHit(x, y, 70)) mobAttack(m, .35, true); }); });
      return 1.1;
    }
    case 'teleport': {
      say(); const bx = P.x - Math.cos(Math.atan2(P.y - m.y, P.x - m.x)) * 60, by = P.y - Math.sin(Math.atan2(P.y - m.y, P.x - m.x)) * 30;
      VFX.play('blink', {x:m.x, y:m.y, x2:bx, y2:by}); m.x = clamp(bx, 40, W - 40); m.y = clamp(by, 60, H - 40);
      return .6;
    }
  }
  return 0;
}
/* returns true when the boss is busy (casting / charging) this frame */
/* boss frenzy: it never lets you walk away. The longer you keep your distance the faster it runs (up to +70%),
   and when you are far it leaps onto you — a red circle marks where it will land. */
function bossHunt(m, dt, dp, rooted){
  const d = m.def;
  m.flee = dp > 200 ? (m.flee || 0) + dt : Math.max(0, (m.flee || 0) - dt * .6);
  if (m.flee > 1.5 && !m.furyMsg){ m.furyMsg = true; addText(m.x, m.y - MOB_H[m.type] - 30, L('คลั่ง! ไล่ล่า', 'Frenzy! Hunting you'), '#ff7a5a', 15); SFX.play('roar'); VFX.play('enrage', {m}); }
  if (m.flee < .2) m.furyMsg = false;
  m.leapCd = (m.leapCd ?? 4) - dt;
  if (m.leapT > 0){ m.leapT -= dt; return true; }
  if (!rooted && dp > 260 && m.leapCd <= 0 && !m.charge){
    m.leapCd = m.enraged ? 4.5 : 7; const tx = P.x, ty = P.y, wait = .75; m.leapT = wait + .15;
    VFX.play('warnCircle', {x:tx, y:ty, r:64, t:wait}); VFX.play('dustPuff', {x:m.x, y:m.y});
    later(wait, () => { if (m.dead) return; const x0 = m.x, y0 = m.y; m.x = clamp(tx, 40, W - 40); m.y = clamp(ty, 60, H - 40); pushOut(m, d.r * .6);
      VFX.play('blink', {x:x0, y:y0, x2:m.x, y2:m.y}); VFX.play('earthsplitBoom', {x:m.x, y:m.y, r:64}); VFX.shake(5); SFX.play('boom');
      if (inHit(m.x, m.y, 64) && !P.roll) mobAttack(m, 1.4, true); });
    return true;
  }
  return false;
}
function updBoss(m, dt){
  const d = m.def;
  if (!m.enraged && d.bossSkills.includes('enrage') && m.hp < m.maxhp * .3){ m.enraged = true; VFX.play('enrage', {m}); if (typeof bossShout === 'function') bossShout(m, 'rage', L('คลั่ง! โจมตีแรงและเร็วขึ้น', 'Enraged: faster, harder hits')); else banner(L(`${d.name} คลั่ง! โจมตีแรงและเร็วขึ้น`, `${d.en} is enraged! Faster, harder hits`)); }
  if (m.charge){
    const c = m.charge, step = Math.min(c.left, 520 * dt); m.x += c.ux * step; m.y += c.uy * step; c.left -= step; m.moved = true; m.dir = SPR.dirFromVec(c.ux, c.uy);
    if (!c.hit && Math.hypot(P.x - m.x, P.y - m.y) < d.r + 18){ c.hit = true; mobAttack(m, 2.2, true); VFX.shake(4); }
    if (Math.random() < .6) VFX.play('dustPuff', {x:m.x, y:m.y});
    m.x = clamp(m.x, 40, W - 40); m.y = clamp(m.y, 60, H - 40);
    if (c.left <= 0) m.charge = null;
    return true;
  }
  if (m.busy > 0){ m.busy -= dt; return true; }
  m.bcd = (m.bcd ?? 3) - dt;
  if (m.bcd <= 0 && dist(m, P) < 420){
    const list = d.bossSkills.filter(s => s !== 'enrage'), id = list[Math.floor(Math.random() * list.length)];
    const busy = bossCast(m, id);
    m.busy = busy; m.bcd = rand(3.5, 6) * (m.enraged ? .65 : 1);
    if (busy) return true;
  }
  return false;
}
