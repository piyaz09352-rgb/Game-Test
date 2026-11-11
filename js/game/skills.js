/* VAYRATHEN — js/game/skills.js
   Using skills: range checks, casting, SP, cooldowns and the effect of every skill type in data/jobs.js.
   Also the things skills leave in the world: delayed hits, traps, the spirit tiger, the Nine Planets orbs,
   player buffs (shield, barrier, veil, omen) and the monster statuses (stun, freeze, stop, root, slow,
   poison, DEF/ATK down, taunt). Visuals go through VFX (js/render/vfx.js). */
'use strict';

let LATER = [], TRAPS = [], SUMMONS = [];
const later = (t, fn) => LATER.push({t, fn});

/* ---------- monster statuses ---------- */
function applyStatus(m, st, lv){
  if (!m || m.dead || !st) return;
  // bosses shrug off every status (stun, freeze, sleep, slow, poison, debuffs, knockback)
  if (m.def.boss){ if (T - (m.immT || -9) > .8){ m.immT = T; addText(m.x, m.y - MOB_H[m.type] - 14, 'Immune', '#d8c8ff', 12); } return; }
  const s = m.st || (m.st = {}), boss = 1;
  if (st.stun) s.stun = Math.max(s.stun || 0, st.stun * boss);
  if (st.freeze && Math.random() < st.freeze[0]){ s.freeze = Math.max(s.freeze || 0, st.freeze[1] * boss); VFX.play('frozen', {m}); }
  if (st.stop){ s.stop = Math.max(s.stop || 0, st.stop * boss); }
  if (st.root) s.root = Math.max(s.root || 0, st.root * boss);
  if (st.slow){ s.slow = Math.max(s.slow || 0, st.slow[1]); s.slowAmt = Math.max(s.slowAmt || 0, st.slow[0]); }
  if (st.poison){ s.poison = st.poison[1]; s.poisonDps = st.poison[0] * (st.poison[2] ? DER.matk : DER.atk); s.poisonT = 1; }   // [dps × ATK, seconds, 1 = herbal poison: × MATK]
  if (st.defDown){ s.defDown = st.defDown[1]; s.defDownPct = st.defDown[0]; }
  if (st.atkDown){ s.atkDown = st.atkDown[1]; s.atkDownPct = st.atkDown[0]; }
  if (st.shock){ s.shock = Math.max(s.shock || 0, st.shock); s.stun = Math.max(s.stun || 0, .35); VFX.play('shocked', {m}); }
  if (st.taunt){ m.aggro = true; m.taunt = 3; }
  if (st.knock){ const d = Math.hypot(m.x - P.x, m.y - P.y) || 1; if (!m.def.boss){ m.x += (m.x - P.x) / d * st.knock; m.y += (m.y - P.y) / d * st.knock; pushOut(m, m.def.r * .6); } }
}
/* returns true when the monster cannot act this frame */
function updStatus(m, dt){
  const s = m.st; if (!s) return false;
  for (const k of ['stun', 'freeze', 'stop', 'root', 'slow', 'poison', 'defDown', 'atkDown', 'shock']) if (s[k] > 0){ s[k] -= dt; if (s[k] <= 0){ s[k] = 0; if (k === 'slow') s.slowAmt = 0; } }
  if (m.taunt > 0){ m.taunt -= dt; m.aggro = true; }
  if (s.poison > 0){ s.poisonT -= dt; if (s.poisonT <= 0){ s.poisonT = 1; applyDamage(m, {dmg:Math.max(1, Math.round(s.poisonDps)), poison:true}); } }
  return s.stun > 0 || s.freeze > 0 || s.stop > 0;
}
const mobSpeedMul = m => (m.st && m.st.slow > 0 ? 1 - m.st.slowAmt : 1);
const mobRooted = m => !!(m.st && (m.st.root > 0));

/* ---------- player buffs ---------- */
function addBuff(id, o){ P.buffs[id] = Object.assign({t:o.t || 10, max:o.t || 10}, o); renderBuffs(); }
function updBuffs(dt){
  let ch = false;
  for (const k in P.buffs){ const b = P.buffs[k]; b.t -= dt;
    if (b.regenPct){ b.rt = (b.rt || 0) + dt; if (b.rt >= b.every){ b.rt = 0; const h = Math.round(DER.maxhp * b.regenPct * (1 + (DER.pas.healPow || 0))); if (S.hp < DER.maxhp){ S.hp = Math.min(DER.maxhp, S.hp + h); addText(P.x, P.y - 50, `+${h}`, '#c4ffe0', 13); VFX.play('regenTick', {x:P.x, y:P.y}); SFX.play('regen'); } } } if (b.t <= 0 || (k === 'barrier' && b.barrier <= 0)){ delete P.buffs[k]; ch = true; if (SKILLS[k]) SFX.play('bf_end'); } }
  if (P.petBuff > 0) P.petBuff -= dt;
  if (P.lastStandCd > 0) P.lastStandCd -= dt;
  if (ch) renderBuffs();
}
const buffDef = () => Object.values(P.buffs).reduce((a, b) => a + (b.def || 0), 0) + (P.ride && DER.pas.rideDef ? DER.pas.rideDef : 0);
const hideBuff = () => P.buffs.stealth || P.buffs.smokebomb || null;
const unhide = () => { if (hideBuff()){ delete P.buffs.stealth; delete P.buffs.smokebomb; renderBuffs(); } };
const buffSum = k => Object.values(P.buffs).reduce((a, b) => a + (b[k] || 0), 0);
function luckyElem(){ const E = ['fire', 'water', 'wind', 'earth', 'holy', 'shadow'], ph = Math.floor(S.worldT / CYCLE) * 2 + (isNight() ? 1 : 0); return E[(ph * 7 + 3) % 6]; }

/* ---------- ranges ---------- */
function skillRange(id){
  const s = SKILLS[id];
  if (s.type === 'melee' || s.type === 'ranged') return DER.range;
  if (s.type === 'dash') return s.range + DER.range;
  if (s.type === 'line') return Math.max(DER.range, s.len * .8);
  return s.range || DER.range;
}
const BUFF_SND = {barrier:'bf_shield', goldshield:'bf_shield', ramwai:'bf_power', stealth:'bf_stealth', smokeBomb:'bf_stealth', heal:'bf_herb', petcall:'bf_pet', tiger:'bf_tiger'};
const needsTarget = s => ['melee', 'stone', 'bolt', 'ranged', 'aoeTarget', 'dash', 'debuff', 'fieldDot', 'line', 'steal', 'command'].includes(s.type);
function nearestFoe(r){ let best = null, bd = r; for (const m of mobs){ if (m.dead || m.vanish) continue; const d = dist(m, P); if (d < bd){ bd = d; best = m; } } return best; }

/* ---------- use ---------- */
function trySkill(id){
  const lv = skl(id), sk = SKILLS[id];
  if (!sk || !lv || sk.type === 'passive' || P.dead || P.cast || P.roll || P.stunT > 0) return;
  if (P.acd > 0) return;
  if ((P.cds[id] || 0) > 0){ toast(L(`${skName(sk)} ยังติด Cooldown`, `${skName(sk)} is on cooldown`)); return; }
  const cost = sk.sp(lv);
  if (S.sp < cost){ toast(L('SP ไม่พอ', 'Not enough SP')); return; }
  if (P.ride && !DER.pas.rideAtk && sk.type !== 'buff' && sk.type !== 'heal'){ P.ride = false; renderHotbar(); }
  P.sit = false;
  let t = P.target;
  if (needsTarget(sk)){
    if (!t || t.dead) t = P.target = nearestFoe(skillRange(id) + 140);
    if (!t){ toast(L('ไม่มีเป้าหมายใกล้ ๆ', 'No target nearby')); return; }
    if (dist(P, t) > skillRange(id) + t.def.r){ P.pending = id; return; }
    P.face = t.x < P.x ? -1 : 1; P.dir = SPR.dirFromVec(t.x - P.x, t.y - P.y);
  }
  if (sk.type === 'heal' && S.hp >= DER.maxhp){ toast(L('HP เต็มแล้ว', 'HP is full')); return; }
  if (sk.type === 'petcall' && !S.pet){ toast(L('ยังไม่มี Pet', 'You have no pet')); return; }
  if (usesArrows() && ammoWant() === 'arrow' && !sk.magic && ['ranged', 'line', 'aoeTarget', 'fieldDot', 'debuff'].includes(sk.type) && sk.job !== 'novice'){
    const n = sk.type === 'ranged' ? (sk.hits ? sk.hits(lv) : 1) : sk.type === 'aoeTarget' || sk.type === 'fieldDot' ? 5 : 1;
    if (!useArrows(n)) return;
  }
  // Cast time (หลอดร่าย) comes first: nothing is paid yet, walking away cancels it for free. DEX/INT shorten it.
  if (sk.cast){
    const total = sk.cast(lv) * DER.castMul;
    if (total > .05){ P.cast = {id, lv, t:0, total, target:t}; VFX.play('castCircle', {id, total, elem:sk.elem}); SFX.play('cast', {elem:sk.elem}); return; }
  }
  fireSkill(id, lv, t);
}
/* the moment a skill goes off: pay SP, start its own Cooldown and the global After-Cast Delay (ดีเลย์หลังใช้สกิล) */
const skCd = (sk, lv) => typeof sk.cd === 'function' ? sk.cd(lv) : sk.cd || 0;
function skAcd(sk, lv){
  if (sk.acd != null) return typeof sk.acd === 'function' ? sk.acd(lv) : sk.acd;
  const t = sk.type;
  if (t === 'aoeTarget' || t === 'aoeSelf' || t === 'fieldDot') return sk.magic ? 1.5 : .8;
  if (t === 'bolt') return .7;
  if (t === 'heal' || t === 'buff' || t === 'debuff' || t === 'restore' || t === 'summon' || t === 'petcall' || t === 'conjure' || t === 'command') return .8;
  if (t === 'blink' || t === 'backstep') return .3;
  return .45;
}
function fireSkill(id, lv, t){
  const sk = SKILLS[id], cost = sk.sp(lv);
  if (S.sp < cost){ toast(L('SP ไม่พอ', 'Not enough SP')); return false; }
  if (!(DER.pas.freeSp && Math.random() < DER.pas.freeSp)) S.sp -= cost;
  if (typeof bump === 'function'){ bump('skills'); EV.emit('skill', id); }
  P.cds[id] = skCd(sk, lv);
  P.acd = P.acdMax = skAcd(sk, lv) * (DER.acdMul || 1);
  execSkill(id, lv, t); if (typeof nmSkillFx === 'function') nmSkillFx(id, t);
  return true;
}

/* damage helpers that know about passives, buffs and statuses */
function skillPhys(m, mult, elem){
  const res = physDamage(m, mult, elem);
  return res;
}
function skillMagic(m, mult, elem){
  const res = magicDamage(m, mult, elem);
  return res;
}

function execSkill(id, lv, t){
  const sk = SKILLS[id], anim = sk.anim;
  const sh = heroSheet(), pose = sk.act && sh && sh.index[sk.act];
  if (pose){ P.skAct = sk.act; P.skillAnim = pose.loop ? .55 : pose.n / pose.fps + .06; P.atkAnim = 0; if (anim === 'attack') P.swing = 1; }
  else if (anim === 'attack'){ P.swing = 1; P.atkAnim = .45; } else if (anim !== 'cast'){ P.skAct = null; P.skillAnim = .55; }
  if (sk.type === 'heal' || sk.type === 'restore') SFX.play('heal');
  else if (sk.type === 'buff' || sk.type === 'petcall' || sk.type === 'summon' || sk.type === 'conjure' || sk.type === 'command') SFX.play(BUFF_SND[sk.fx] || 'buff');
  else if (sk.magic) SFX.spell(sk.elem);                                     // spell release: element voice
  else if (sk.type === 'debuff') SFX.play('buff');
  else if (JOBS[S.job].weapon.type === 'fist' && sk.act){ const a = sk.act; SFX.play(a === 'spinkick' ? 'mt_spin' : a === 'kick' ? 'mt_kick' : a === 'knee' ? 'mt_knee' : a === 'teep' ? 'mt_teep' : a === 'uppercut' ? 'mt_uppercut' : a === 'elbow' ? 'mt_elbow' : 'mt_hook'); if (a === 'knee') later(.12, () => SFX.play('mt_jab')); }
  else SFX.play('skill_phys', {w:JOBS[S.job].weapon.type});                  // weapon skill: heavier than a basic swing
  P.act = null;
  if (t && !t.dead) P.dir = SPR.dirFromVec(t.x - P.x, t.y - P.y);
  if (needsTarget(sk) && (!t || t.dead)) return;
  const hitM = (m, mult, elem) => applyDamage(m, sk.magic ? skillMagic(m, mult, elem || sk.elem) : skillPhys(m, mult, elem || sk.elem), sk);
  const inR = (cx, cy, r) => mobs.filter(m => !m.dead && Math.hypot(m.x - cx, m.y - cy) < r + m.def.r);
  const hits = sk.hits ? sk.hits(lv) : 1, every = sk.every || .12;
  switch (sk.type){
    case 'restore': {
      const g = Math.round(DER.maxsp * sk.restore(lv)); S.sp = Math.min(DER.maxsp, S.sp + g); addText(P.x, P.y - 50, `+${g} SP`, '#9fd0ff');
      if (sk.buff) addBuff(id, sk.buff(lv)); VFX.play(sk.fx, {x:P.x, y:P.y}); break;
    }
    case 'heal': {
      const h = sk.heal(lv); S.hp = Math.min(DER.maxhp, S.hp + h);
      addText(P.x, P.y - 50, `+${h}`, '#c4ffe0'); VFX.play(sk.fx || 'heal', {x:P.x, y:P.y}); break;
    }
    case 'stone':
      projs.push({k:'stone', x:P.x, y:P.y - 22, t, delay:0, speed:520, hit:() => { hitM(t, sk.dmg(lv)); if (sk.stun(lv)) applyStatus(t, {stun:sk.stun(lv)}); VFX.play('stoneHit', {x:t.x, y:t.y}); }});
      break;
    case 'melee':
      VFX.play(sk.fx, {x:P.x, y:P.y, tx:t.x, ty:t.y, dir:P.dir, m:t});
      for (let i = 0; i < hits; i++) later(.12 + i * (sk.every || .1), () => { if (t.dead) return;
        hitM(t, sk.dmg(lv)); if (sk.stun && i === hits - 1) applyStatus(t, {stun:sk.stun(lv)});
        VFX.play(sk.fx === 'punch' ? 'punchHit' : 'slashHit', {x:t.x + rand(-4, 4), y:t.y - MOB_H[t.type] * .5 + rand(-4, 4), gold:true, big:hits === 1}); if (hits === 1) VFX.shake(2); });
      if (sk.fx === 'punch') P.swing = 1;
      break;
    case 'bolt':
      for (let i = 0; i < hits; i++) projs.push({k:sk.fx, x:P.x, y:P.y - 36, t, delay:i * (sk.fx === 'shuriken' || sk.fx === 'kunai' || sk.fx === 'coin' ? .08 : .14), speed:sk.fx === 'ice' ? 470 : sk.fx === 'kunai' || sk.fx === 'shuriken' ? 760 : 540, wob:Math.random() * 6,
        hit:() => { hitM(t, sk.dmg(lv)); if (sk.freeze) applyStatus(t, {freeze:sk.freeze(lv)}); if (sk.poison) applyStatus(t, {poison:sk.poison(lv)});
          VFX.play({ice:'iceHit', holy:'holyHit', dart:'poisonHit', hex:'hexHit', kunai:'slashHit', shuriken:'slashHit', coin:'coinHit'}[sk.fx] || 'fireHit', {x:t.x, y:t.y - MOB_H[t.type] * .5, m:t}); }});
      break;
    case 'ranged': {
      const mul = P.buffs.backstep ? P.buffs.backstep.nextShot : 1; delete P.buffs.backstep;
      for (let i = 0; i < hits; i++) projs.push({k:'arrow', glow:true, elem:DER.welem, x:P.x, y:P.y - 20, t, delay:i * .12, speed:820, hit:() => { hitM(t, sk.dmg(lv) * mul); VFX.play('arrowHit', {x:t.x, y:t.y - MOB_H[t.type] * .5, elem:DER.welem}); }});
      VFX.play('bowFlash', {x:P.x, y:P.y, tx:t.x, ty:t.y});
      break;
    }
    case 'aoeTarget': {
      const cx = t.x, cy = t.y, r = sk.radius;
      VFX.play(sk.fx, {x:cx, y:cy, r, hits, every, lv});
      const lead = sk.fx === 'meteor' ? .55 : sk.fx === 'himmagate' ? .35 : sk.fx === 'spiritburst' ? .15 : sk.fx === 'wrath' ? .25 : sk.fx === 'arrowrain' ? .35 : sk.fx === 'frostsea' ? .3 : .05;
      const st = sk.st ? sk.st(lv) : null;
      for (let i = 0; i < hits; i++) later(lead + i * every, () => { for (const m of inR(cx, cy, r)){ hitM(m, sk.dmg(lv)); if (st && i === 0) applyStatus(m, st, lv);
          if (sk.elem === 'wind' && sk.magic){ if (m.def.boss) VFX.play('shocked', {m}); else applyStatus(m, {shock:2}); } } if (sk.fx === 'meteor' || sk.fx === 'wrath') VFX.shake(sk.fx === 'meteor' ? 5 : 4); });
      break;
    }
    case 'aoeSelf': {
      const r = sk.radius, st = sk.st ? sk.st(lv) : null;
      VFX.play(sk.fx, {x:P.x, y:P.y, r, hits, every, lv});
      if (sk.fx === 'bladestorm') P.spin = hits * every;
      for (let i = 0; i < hits; i++) later(.08 + i * every, () => {
        for (const m of inR(P.x, P.y, r)){ if (sk.dmg(lv) > 0) hitM(m, sk.dmg(lv)); if (st && i === 0) applyStatus(m, st, lv); if (sk.knock && i === 0) applyStatus(m, {knock:sk.knock}); }
      });
      if (sk.fx === 'quake' || sk.fx === 'roar') VFX.shake(sk.fx === 'roar' ? 4 : 3);
      break;
    }
    case 'line': {
      const d = Math.hypot(t.x - P.x, t.y - P.y) || 1, ux = (t.x - P.x) / d, uy = (t.y - P.y) / d, len = sk.len, w = sk.width;
      VFX.play(sk.fx, {x:P.x, y:P.y, ux, uy, len});
      later(sk.fx === 'pierce' ? .08 : .15, () => {
        for (const m of mobs){ if (m.dead) continue; const rx = m.x - P.x, ry = m.y - P.y, along = rx * ux + ry * uy, side = Math.abs(rx * uy - ry * ux);
          if (along > -8 && along < len + m.def.r && side < w + m.def.r){ hitM(m, sk.dmg(lv)); if (sk.knock) applyStatus(m, {knock:sk.knock}); } }
        if (sk.fx === 'earthsplit') VFX.shake(4);
      });
      break;
    }
    case 'dash': {
      const d = Math.hypot(t.x - P.x, t.y - P.y), stop = Math.max(0, d - ((t.def && +t.def.r) || 14) - 14) || 0, ux = (t.x - P.x) / (d || 1), uy = (t.y - P.y) / (d || 1);
      if (isFinite(ux) && isFinite(uy) && isFinite(stop)){ VFX.play('charge', {x:P.x, y:P.y, x2:P.x + ux * stop, y2:P.y + uy * stop});
        P.x += ux * stop; P.y += uy * stop; pushOut(P, 12); }
      later(.05, () => { if (!t.dead){ hitM(t, sk.dmg(lv)); if (sk.stun) applyStatus(t, {stun:sk.stun(lv)}); VFX.play('slashHit', {x:t.x, y:t.y - MOB_H[t.type] * .5, gold:true, big:true}); VFX.shake(3); } });
      break;
    }
    case 'blink': case 'backstep': {
      const [fx0, fy0] = dirVec(P.dir || 0), dd = sk.dist(lv) * (sk.type === 'backstep' ? -1 : 1);
      const x0 = P.x, y0 = P.y; P.x = clamp(P.x + fx0 * dd, 20, W - 20); P.y = clamp(P.y + fy0 * dd, 20, H - 20); pushOut(P, 12);
      VFX.play(sk.type === 'backstep' ? 'leaf' : sk.fx || 'blink', {x:x0, y:y0, x2:P.x, y2:P.y});
      if (sk.buff) addBuff('backstep', sk.buff(lv));
      P.target = sk.type === 'blink' ? null : P.target; P.tx = null;
      break;
    }
    case 'buff': {
      const b = sk.buff(lv); addBuff(id, b); VFX.play(sk.fx, {x:P.x, y:P.y});
      if (b.stealth) for (const m of mobs) if (m.aggro && !m.def.boss){ m.aggro = false; m.tx = m.hx; m.ty = m.hy; }
      break;
    }
    case 'debuff':
      VFX.play(sk.fx, {x:P.x, y:P.y, m:t});
      if (sk.fx === 'poison') projs.push({k:'dart', x:P.x, y:P.y - 22, t, delay:0, speed:700, hit:() => { applyStatus(t, sk.st(lv), lv); VFX.play('poisonHit', {m:t}); }});
      else later(sk.fx === 'seal' || sk.fx === 'sleep' ? .35 : .05, () => { applyStatus(t, sk.st(lv), lv); if (sk.fx === 'poisonblade') VFX.play('poisonHit', {m:t}); });
      break;
    case 'trap': {
      const tx = t && !t.dead && dist(P, t) < 200 ? t.x : P.x, ty = t && !t.dead && dist(P, t) < 200 ? t.y : P.y + 4;
      while (TRAPS.length >= 2) TRAPS.shift();
      TRAPS.push({x:tx, y:ty, lv, arm:.4, life:30, sk}); VFX.play('trapSet', {x:tx, y:ty});
      break;
    }
    case 'conjure': conjure(sk, lv); break;
    case 'bond': bondCast(sk, lv, t || (P.target && !P.target.dead ? P.target : null)); break;
    case 'command': {
      const own = SUMMONS.filter(s => s.kind === 'beast' && !s.dead && !beastDef(s).support);
      if (!own.length){ toast(L('ยังไม่มีสัตว์อัญเชิญ', 'No summons out')); break; }
      VFX.play('conjure', {x:P.x, y:P.y, col:'auraGold', small:true});
      own.forEach((s, i) => later(.12 + i * .12, () => { if (t.dead) return; s.x = t.x + (i % 2 ? 18 : -18); s.y = t.y + 6; s.target = t; s.atkT = .45; s.dir = SPR.dirFromVec(t.x - s.x, t.y - s.y);
        const B = beastDef(s); if (!B) return; applyDamage(t, beastHit(s, B, t, sk.dmg(lv) * beastPack()), sk); beastPull(s, B, t); VFX.play(B.role === 'magic' ? 'orbHit' : 'clawHit', {x:t.x, y:t.y - MOB_H[t.type] * .5, elem:B.elem}); }));
      VFX.shake(3); break;
    }
    case 'summon':
      SUMMONS = SUMMONS.filter(s => s.kind !== 'tiger');
      SUMMONS.push({kind:'tiger', x:P.x - 20, y:P.y + 8, t:0, dur:sk.dur(lv), lv, atkCd:.4, dir:0, target:null, sk});
      VFX.play('tigerCall', {x:P.x - 20, y:P.y + 8}); VFX.shake(2);
      break;
    case 'fieldDot': {
      const cx = t.x, cy = t.y, r = sk.radius;
      VFX.play(sk.fx, {x:cx, y:cy, r, dur:hits * every});
      for (let i = 0; i < hits; i++) later(.3 + i * every, () => { for (const m of inR(cx, cy, r)) hitM(m, sk.dmg(lv), sk.elem || 'fire'); });
      break;
    }
    case 'steal': {
      // Pickpocket / Plunder: a quick hand at the target (or everyone around it), an item from its drop table and some money
      const victims = sk.radius ? inR(t.x, t.y, sk.radius) : [t];
      VFX.play('coins', {x:t.x, y:t.y - MOB_H[t.type] * .5});
      for (const m of victims){
        if (m.stolen >= 2) continue; m.stolen = (m.stolen || 0) + 1; m.aggro = true;
        const z = sk.bia(lv); S.bia += z; addText(m.x, m.y - MOB_H[m.type] - 6, `+${z} ${CUR()}`, '#ffe08a', 13);
        if (m.def.drops && m.def.drops.length && Math.random() < sk.chance(lv)){ const dr = m.def.drops[Math.floor(Math.random() * m.def.drops.length)]; addItem(dr[0], 1); log(L(`ล้วงได้ ${nm(ITEMS[dr[0]])}`, `Stole ${nm(ITEMS[dr[0]])}`)); addText(m.x, m.y - MOB_H[m.type] - 22, nm(ITEMS[dr[0]]), '#9ff0c8', 12); }
      }
      break;
    }
    case 'petcall':
      PET.x = P.x + 18; PET.y = P.y + 6; P.petBuff = 15; VFX.play('petcall', {x:PET.x, y:PET.y});
      break;
  }
  dirty = true;
}

/* ---------- per-frame world bits ---------- */
function updSkills(dt){
  if (LATER.length){ const due = []; LATER = LATER.filter(l => ((l.t -= dt) > 0 ? true : (due.push(l), false))); for (const l of due) l.fn(); }
  updBuffs(dt);
  if (P.spin > 0) P.spin -= dt;
  // traps
  for (const tr of TRAPS){
    tr.life -= dt; if (tr.arm > 0){ tr.arm -= dt; continue; }
    const m = mobs.find(m => !m.dead && Math.hypot(m.x - tr.x, m.y - tr.y) < 14 + m.def.r * .6);
    if (m){ tr.life = 0; applyDamage(m, physDamage(m, tr.sk.dmg(tr.lv)), tr.sk); applyStatus(m, {root:tr.sk.root(tr.lv)}); VFX.play('trapSnap', {x:tr.x, y:tr.y}); }
  }
  TRAPS = TRAPS.filter(t => t.life > 0);
  // spirit tiger
  for (const s of SUMMONS){
    if (s.kind === 'beast'){ updBeast(s, dt); continue; }
    s.t += dt; s.atkCd -= dt;
    let tg = s.target; if (!tg || tg.dead || dist(tg, P) > 320) tg = s.target = (P.target && !P.target.dead ? P.target : nearestFoe(260));
    if (tg){ const d = dist(s, tg); if (d > tg.def.r + 16){ moveTo(s, tg.x, tg.y, 175, dt); s.moving = true; } else { s.moving = false; s.dir = SPR.dirFromVec(tg.x - s.x, tg.y - s.y);
        if (s.atkCd <= 0){ s.atkCd = 1; s.pounce = .3; if (s.sk) applyDamage(tg, physDamage(tg, s.sk.dmg(s.lv)), s.sk); VFX.play('clawHit', {x:tg.x, y:tg.y - MOB_H[tg.type] * .5}); } } }
    else { const d = Math.hypot(P.x - 24 - s.x, P.y + 6 - s.y); s.moving = d > 10; if (s.moving) moveTo(s, P.x - 24, P.y + 6, 150, dt); }
    if (s.pounce > 0) s.pounce -= dt;
  }
  SUMMONS = SUMMONS.filter(s => { if ((s.dead || s.t >= s.dur) && s.beast === 'bound' && S.bound && !s.rested){ s.rested = true; S.bound.restUntil = Date.now() + BOND.rest * 1000; }   // (v274) it rests once it leaves
    if (s.dead) return false; if (s.t < s.dur && !(s.kind === 'beast' && P.dead && s.beast !== 'bound')) return true; VFX.play(s.kind === 'beast' ? 'beastFade' : 'tigerFade', {x:s.x, y:s.y, col:s.kind === 'beast' ? beastDef(s).aura : null}); return false; });
  // (v274) the bound boss comes only when called (Royal Bond), no longer by itself
  // Nine Planets orbs
  if (DER.pas.orbs && !P.dead){
    P.orbT -= dt;
    if (P.orbT <= 0){ const m = nearestFoe(140); P.orbT = m ? DER.pas.orbs : .5; if (m){ VFX.play('orbShot', {x:P.x, y:P.y - 30, m}); SFX.play('planet'); later(.25, () => { if (!m.dead) applyDamage(m, magicDamage(m, .3, ['fire', 'water', 'wind', 'earth', 'holy'][Math.floor(Math.random() * 5)]), SKILLS.navagraha); }); } }
  }
  // Battle Recovery
  if (DER.pas.regenHp && !P.dead){ P.regenT += dt; if (P.regenT >= 10){ P.regenT = 0; const h = DER.pas.regenHp; if (S.hp < DER.maxhp){ S.hp = Math.min(DER.maxhp, S.hp + h); addText(P.x, P.y - 50, `+${h}`, '#c4ffe0', 13); SFX.play('regen'); } } }
}

/* small buff icons under the character card */
const BUFF_TH = {goldshield:['โล่ทอง', 'Shield'], barrier:['เกราะ', 'Barrier'], stealth:['พราง', 'Veil'], auspice:['ฤกษ์', 'Omen'], backstep:['เล็ง', 'Aim'],
  waikhru:['ไหว้ครู', 'Wai Khru'], ramwai:['รำมวย', 'Ram Muay'], poultice:['ลูกประคบ', 'Compress'], thread:['สายสิญจน์', 'Thread'], smokebomb:['หายตัว', 'Hidden'], ward:['สายสิญจน์', 'Ward']};
/* buff icons: a row of little lacquer tiles beside the character card. Each shows a glyph, a dark sweep
   for time used, seconds left, and blinks in the last 3 seconds. Hover (or tap) for the name and effect. */
const BUFF_IC = {
  meditate:['#8ac0ff', '<circle cx="10" cy="5" r="2.2"/><path d="M10 7.5v4M5 16c1.5-2.4 3-3.4 5-3.4s3.5 1 5 3.4M6.5 11.5l3.5 1 3.5-1"/>'],
  barrier:['#7fc4ff', '<circle cx="10" cy="10" r="7"/><path d="M10 5.5l3.9 2.25v4.5L10 14.5l-3.9-2.25v-4.5z"/>'],
  ward:['#fff3b0', '<rect x="4" y="4" width="12" height="12" rx="1"/><path d="M10 4.8l5.2 5.2-5.2 5.2L4.8 10z"/><circle cx="10" cy="10" r="1.3"/>'],
  spiritlink:['#c8a8ff', '<circle cx="6.5" cy="10" r="3.6"/><circle cx="13.5" cy="10" r="3.6"/><path d="M3 4.5l2 1.5M17 4.5l-2 1.5"/>'],
  unity:['#ffb0d8', '<path d="M3.5 14.5l1.5-8 3 4 2-5 2 5 3-4 1.5 8z"/><path d="M5 17h10"/>'],
  goldshield:['#f5c858', '<path d="M10 2.8l6 2.4v4.3c0 3.8-2.6 6.3-6 7.7-3.4-1.4-6-3.9-6-7.7V5.2z"/><path d="M10 6v8M6.8 9.2h6.4"/>'],
  auspice:['#ffd36a', '<circle cx="10" cy="10" r="3.2"/><path d="M10 2.5v2.4M10 15.1v2.4M2.5 10h2.4M15.1 10h2.4M4.7 4.7l1.7 1.7M13.6 13.6l1.7 1.7M4.7 15.3l1.7-1.7M13.6 6.4l1.7-1.7"/>'],
  stealth:['#8fdc8a', '<path d="M4 16c0-7 4-11 12-12-1 8-5 12-12 12z"/><path d="M4 16l7-7"/>'],
  smokebomb:['#b7b2c9', '<path d="M5.5 15h9a3 3 0 00.4-6A4.5 4.5 0 006.3 8 3.5 3.5 0 005.5 15z"/><path d="M8 11.5h4"/>'],
  backstep:['#c8f0a8', '<circle cx="10" cy="10" r="6"/><circle cx="10" cy="10" r="1.6"/><path d="M10 2.5v3M10 14.5v3M2.5 10h3M14.5 10h3"/>'],
  waikhru:['#ffb27a', '<path d="M10 2.8c-1.4 2-2.6 4.6-2.6 7.6v3.3L6 17h8l-1.4-3.3v-3.3c0-3-1.2-5.6-2.6-7.6z"/><path d="M10 5v9"/>'],
  ramwai:['#ff8a5a', '<circle cx="10" cy="7.5" r="4.3"/><path d="M13.4 10.2c1.6 2 2.2 4.4 2.1 6.8M7 11.5L5 17"/><path d="M6.3 6.2h7.4"/>'],
  poultice:['#9fe0a0', '<circle cx="10" cy="11" r="5.5"/><path d="M10 5.5V3M7.2 3.2L10 5.5l2.8-2.3M5.2 9l9.6 4M14.8 9l-9.6 4"/>'],
  thread:['#f2f0e6', '<path d="M3.5 10a6.5 6.5 0 1013 0 6.5 6.5 0 10-13 0"/><path d="M8 15.8c1 1.6 3 1.6 4 0M10 16.5v1.5"/>'],
  pet:['#ffcf8a', '<circle cx="6.5" cy="7.5" r="1.7"/><circle cx="10" cy="5.5" r="1.7"/><circle cx="13.5" cy="7.5" r="1.7"/><path d="M6.5 14c0-2.4 1.6-4 3.5-4s3.5 1.6 3.5 4c0 1.6-1.6 2.3-3.5 1.6-1.9.7-3.5 0-3.5-1.6z"/>'],
  luck:['#e8c8ff', '<path d="M10 10C8 6 4 6 4.3 9 4.6 12 10 10 10 10zM10 10c4 2 4 6 1 5.7C8 15.4 10 10 10 10zM10 10c-2 4-6 4-5.7 1M10 10c2-4 6-4 5.7-1-.3 3-5.7 1-5.7 1z"/><path d="M10 10l2.5 7"/>']
};
function buffEffect(b){
  const out = [];
  if (b.atkPct) out.push(`ATK +${Math.round(b.atkPct * 100)}%`);
  if (b.crit) out.push(`CRIT +${b.crit}%`);
  if (b.def) out.push(`DEF +${b.def}`);
  if (b.reflect) out.push(L(`สะท้อน ${Math.round(b.reflect * 100)}%`, `Reflect ${Math.round(b.reflect * 100)}%`));
  if (b.barrier) out.push(L(`ดูดซับ ${b.barrier}`, `Absorbs ${b.barrier}`));
  if (b.regenPct) out.push(L(`ฟื้น HP ${Math.round(b.regenPct * 100)}% ทุก ${b.every} วิ`, `Heal ${Math.round(b.regenPct * 100)}% HP every ${b.every}s`));
  if (b.stealth) out.push(L('หายตัว · นัดแรก Crit แน่นอน', 'Hidden · next hit is a sure Crit'));
  if (b.nextShot) out.push(L(`นัดถัดไป ×${b.nextShot.toFixed(1)}`, `Next shot ×${b.nextShot.toFixed(1)}`));
  if (b.spRegenX) out.push(L(`ฟื้น SP เร็วขึ้น ×${b.spRegenX}`, `SP regen ×${b.spRegenX}`));
  if (b.sumAtkB) out.push(`Summon DMG +${Math.round(b.sumAtkB * 100)}%`);
  if (b.sumHaste) out.push(`Summon Speed +${Math.round(b.sumHaste * 100)}%`);
  return out.join(' · ');
}
/* a 2–4 letter caption under each tile: what the buff mainly does, so the row reads at a glance */
const BUFF_CAP = {barrier:['โล่มนตร์', 'M.SHLD'], goldshield:['สะท้อน', 'REFLECT'], ward:['กันภัย', 'WARD'], waikhru:['ATK↑', 'ATK↑'], ramwai:['ATK+CRI', 'ATK+CRI'], poultice:['ฟื้น HP', 'REGEN'],
  thread:['DEF↑', 'DEF↑'], meditate:['SP×2', 'SP×2'], spiritlink:['สัตว์แรง', 'PET↑'], unity:['สัตว์เร็ว', 'PET⚡'], stealth:['ซ่อนตัว', 'HIDE'], smokebomb:['ม่านควัน', 'SMOKE'], backstep:['เล็ง', 'AIM'], auspice:['ฤกษ์ดี', 'OMEN']};
function buffCap(b, k){
  if (k && BUFF_CAP[k]) return BUFF_CAP[k][1];   // buff tags are short on-screen labels: English, like HP/SP
  return b.barrier ? 'SHLD' : b.reflect ? 'REFL' : b.dmgRed ? 'RED↑' : b.def ? 'DEF↑' : b.atkPct ? 'ATK↑' : b.matkPct ? 'MATK↑' : b.aspdPct ? 'ASPD↑' : b.crit ? 'CRI↑' : b.regenPct ? 'REGN' : b.stealth ? 'HIDE'
    : b.venom ? 'VENOM' : b.clone ? 'CLONE' : b.nextShot ? 'AIM' : b.spRegenX ? 'SP↑' : b.sumAtkB ? 'PET↑' : '';
}
function buffList(){
  const list = Object.keys(P.buffs).map(k => { const b = P.buffs[k], sk = SKILLS[k];
    return {k, ic:BUFF_IC[k] || BUFF_IC.auspice, t:b.t, max:b.max, name:sk ? nm(sk) : (BUFF_TH[k] ? L(...BUFF_TH[k]) : k), eff:buffEffect(b), cap:buffCap(b, k)}; });
  if (P.petBuff > 0) list.push({k:'pet', ic:BUFF_IC.pet, t:P.petBuff, max:15, name:L('ปลุกสัตว์ป่า', 'Pet Rally'), eff:L('สัตว์เลี้ยงตีแรงขึ้น 30%', 'Pet hits 30% harder'), cap:L('สัตว์↑', 'PET↑')});
  if (DER && DER.pas && DER.pas.luckyElem) list.push({k:'luck', ic:BUFF_IC.luck, t:0, max:0, name:L('ธาตุนำโชค', 'Lucky element'), eff:`${elemName(luckyElem())}`, cap:L('โชค', 'LUCK'), pas:true});
  return list;
}
let BUFF_SIG = '';
function renderBuffs(){
  const box = document.getElementById('buffs'); if (!box) return;
  const list = buffList(); BUFF_SIG = list.map(b => b.k).join(',');
  // the same buffs as on screen: just refresh timers, never rebuild (a rebuild replays the fade-in, so tiles blinked on every hit)
  const look = list.map(b => `${b.k}|${b.cap}|${b.neg ? 1 : 0}|${b.name}|${b.eff}`).join(';');
  if (box.dataset.look === look && box.children.length){ tickBuffBars(true); return; } box.dataset.look = look;
  // good effects first (gold tiles, ▲), then afflictions (red tiles, ▼) after a small gap
  const tile = b => `<button class="bf${b.neg ? ' neg' : b.pas ? ' pas' : ''}" data-k="${b.k}" style="--c:${b.ic[0]}" aria-label="${b.name}">
    <span class="bfi"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${b.ic[1]}</svg>
    <i class="sw"></i><i class="mk">${b.neg ? '▼' : b.pas ? '◆' : '▲'}</i><b class="tm"></b></span>${b.cap ? `<em class="cap">${b.cap}</em>` : ''}
    <span class="btip"><strong>${b.neg ? L('ผลเสีย · ', 'Debuff · ') : ''}${b.name}</strong>${b.eff ? `<small>${b.eff}</small>` : ''}</span></button>`;
  const pos = list.filter(b => !b.neg), neg = list.filter(b => b.neg);
  // keep the tiles already on screen (keyed by buff), only add or drop what changed, so nothing flashes
  const tmp = document.createElement('div'); tmp.innerHTML = pos.map(tile).join('') + (neg.length ? `<span class="bfsep${pos.length ? '' : ' none'}"></span>` + neg.map(tile).join('') : '');
  const old = {}; for (const c of box.querySelectorAll(':scope > .bf')) old[c.dataset.k] = c;
  const keep = [...tmp.children].map(n => { n.dataset.sig = (n.querySelector('.cap') ? n.querySelector('.cap').textContent : '') + n.className + (n.getAttribute('aria-label') || '') + (n.querySelector('small') ? n.querySelector('small').textContent : '');
    const o = n.dataset.k && old[n.dataset.k]; return o && o.dataset.sig === n.dataset.sig ? o : n; });
  keep.forEach((n, i) => { if (box.children[i] !== n) box.insertBefore(n, box.children[i] || null); });
  while (box.children.length > keep.length) box.lastElementChild.remove();
  box.hidden = !list.length; tickBuffBars(true); fitBuffs();
}
/* the tile grid never runs under the minimap: as many 44px columns as fit between the character card and the map (at least 3) */
function fitBuffs(){
  const box = document.getElementById('buffs'), mc = document.getElementById('mapCard'); if (!box || box.hidden) return;
  const bl = box.getBoundingClientRect().left, mr = mc && !mc.hidden ? mc.getBoundingClientRect().left : innerWidth, z = (box.getBoundingClientRect().width / (box.offsetWidth || 1)) || 1;
  const cols = clamp(Math.floor((mr - bl - 8) / (44 * z)), 3, 6); box.style.setProperty('width', `${cols * 44}px`, 'important');
}
addEventListener('resize', () => setTimeout(fitBuffs, 120));
function tickBuffBars(force){
  const box = document.getElementById('buffs'); if (!box) return;
  const list = buffList();
  if (list.map(b => b.k).join(',') !== BUFF_SIG){ renderBuffs(); return; }
  if (box.hidden) return;
  for (const b of list){
    const e = box.querySelector(`.bf[data-k="${b.k}"]`); if (!e) continue;
    const f = b.max ? clamp(1 - b.t / b.max, 0, 1) : 0;
    e.querySelector('.sw').style.background = f > 0 ? `conic-gradient(rgba(0,0,0,.6) ${f * 360}deg, transparent 0)` : 'none';
    const tm = b.max ? (b.t >= 60 ? `${Math.ceil(b.t / 60)}m` : `${Math.ceil(b.t)}`) : '';
    const el = e.querySelector('.tm'); if (el.textContent !== tm) el.textContent = tm;
    e.classList.toggle('ending', b.max > 0 && b.t < 3);
  }
}
document.addEventListener('click', e => { const b = e.target.closest('.bf'); if (!b) return;
  const x = buffList().find(v => v.k === b.dataset.k); if (x) toast(`${x.name}${x.eff ? ' · ' + x.eff : ''}${x.max ? ` · ${Math.ceil(x.t)}${L(' วิ', 's')}` : ''}`); });

/* ---------- Himmapan beasts (Summoner / Himmapan Sovereign) ----------
   Each beast is drawn with the matching monster's own sprite (see drawBeast in render.js) and fights in one of three clear roles:
     tank  · guards you: lots of HP, takes less damage, draws monsters onto itself (Guardian Roar taunts a whole pack)
     phys  · physical claws and talons: rolls to hit against DEF, can miss and crit, fast single-target pressure
     magic · spells: never miss, ignore DEF, area spells and support (the Kinnaree heals)
   Every beast has HP, a basic attack and its own skill it uses on a cooldown (its name pops above it).
   Power comes from the summoner: magic beasts use your MATK; physical and tank beasts use the higher of your ATK or MATK.
   Every summon takes your buffs: ATK/MATK buffs raise its damage, Def buffs guard it. */
const BEAST_ROLE = {tank:{th:'แทงค์', en:'Tank', col:'#8fd0ff'}, phys:{th:'กายภาพ', en:'Physical', col:'#ffb070'}, magic:{th:'เวทมนตร์', en:'Magic', col:'#d6b0ff'}};
const HIMMA = {
  singha:{mob:'goldsingha', name:['ราชสีห์', 'Singha'], role:'tank', elem:'holy', speed:185, reach:14, scale:.9, aura:'auraGold', hp:1.1, def:1.6, taken:.7,
    basic:{kind:'melee', every:1.2, mul:.6, fx:'claw'},
    skill:{name:['สีหนาทพิทักษ์', 'Guardian Roar'], cd:9, kind:'taunt', radius:120, mul:.7, guard:4}},
  naga:{mob:'lakenaga', name:['นาคา', 'Naga'], role:'magic', elem:'water', speed:150, reach:150, scale:.95, aura:'auraWhite', hp:.45, def:.6, taken:1,
    basic:{kind:'bolt', every:1.4, mul:1, proj:'orb'},
    skill:{name:['อุทกพิโรธ', 'Tidal Wrath'], cd:7, kind:'geyser', radius:55, mul:.9, hits:3, slow:[.35, 3]}},
  kinnaree:{mob:'goldkinnaree', name:['กินรี', 'Kinnaree'], role:'magic', support:true, elem:'holy', speed:170, reach:130, scale:.72, fly:6, aura:'auraGreen', hp:.4, def:.5, taken:1,
    basic:{kind:'bolt', every:1.6, mul:.5, proj:'holy'},
    skill:{name:['ระบำฟื้นชีวา', 'Dance of Life'], cd:3, kind:'heal'}},
  garuda:{mob:'goldgaruda', name:['พญาครุฑ', 'Garuda'], role:'phys', elem:'wind', speed:240, reach:18, scale:1.05, fly:16, aura:'auraGold', hp:.6, def:.9, taken:1, crit:20,
    basic:{kind:'melee', every:.75, mul:.7, fx:'talon'},
    skill:{name:['ครุฑโฉบ', 'Garuda Dive'], cd:6, kind:'dive', radius:55, mul:1.6}},
  erawan:{mob:'youngerawan', name:['เอราวัณ', 'Erawan'], role:'phys', elem:'holy', speed:135, reach:20, scale:1.1, aura:'auraWhite', hp:.9, def:1.2, taken:.9, crit:5,
    basic:{kind:'melee', every:1.5, mul:1, fx:'tusk'},
    skill:{name:['กระทืบธรณี', 'Earth Stomp'], cd:8, kind:'stomp', radius:75, mul:1.3, stun:true}}
};
/* the bound boss (Sovereign's "Royal Bond"): a permanent tank with its own HP, built from YOUR stats at BEAST_STAT (60%) */
function boundDef(){
  const b = S.bound; if (!b || !MOB[b.type]) return null; const d = MOB[b.type];
  return {mob:b.type, name:[nm(d), nm(d)], role:'tank', elem:d.elem || 'neutral', speed:190, reach:d.range ? Math.min(160, d.range) : 16,
    // (v126) a bound boss stands about two-thirds the size of the wild one (bosses are drawn ×1.8–2.6 now; the old
    // formula read their tall name plate and shrank them to a quarter); h0 is its plate height at sprite size
    scale:d.boss ? +((d.bsz || 1.6) * .66).toFixed(2) : Math.min(.75, 44 / Math.max(30, MOB_H[b.type] || 40)), h0:d.boss ? Math.round((MOB_H[b.type] || 60) / (d.bsz || 1.6)) : 0, aura:'auraViolet', bound:true, hp:1, def:1, taken:.85,
    basic:{kind:d.range ? 'bolt' : 'melee', every:Math.max(.5, DER ? DER.interval * 1.4 : 1.2), mul:1, proj:'holy', fx:'claw'},
    skill:{name:['คำรามราชันย์', 'Sovereign Roar'], cd:10, kind:'taunt', radius:130, mul:1, guard:4, heal:.08}};
}
const beastDef = s => (s.beast === 'bound' ? (s.def || (s.def = boundDef())) : HIMMA[s.beast]);
// (v132) beside and behind you, never in front: a beast standing lower on the screen than you is drawn over you.
// Wider than before, and wider still for big beasts (×size): they keep clear of your hero.
const BEAST_SLOT = [[-96, 6], [96, 6], [-128, -30], [128, -30], [-62, -62], [62, -62]];
const beastMax = () => 2 + ((DER && DER.pas.sumMax) || 0);
const beastMul = () => 1 + ((DER && DER.pas.sumAtk) || 0) + buffSum('sumAtkB') + buffSum('atkPct') + buffSum('matkPct');
const beastHaste = () => 1 + buffSum('sumHaste') + buffSum('aspdPct');
/* balance: a beast gets only part of its summoner's stats: BEAST_STAT of your power (ATK/MATK) and of your Max HP (the bound boss too).
   It used to get all of it, and a full pack out-damaged the Summoner several times over. */
const BEAST_STAT = .6;
const beastHpOf = (B, sk, lv) => Math.max(1, Math.round(DER.maxhp * BEAST_STAT * (B.hp || .5) * (sk && sk.hpMul ? sk.hpMul(lv) : 1)));
/* a beast's physical strike: hits against DEF, can miss and crit (claws, talons, tusks) */
function beastPhys(m, mult, elem, critB = 0){
  const d = m.def, st = m.st || {};
  const crit = Math.random() * 100 < 5 + (DER.crit || 0) * .5 + critB;
  if (!crit){ const hc = clamp(DER.hit + 15 - (90 + d.lvl * 1.4) + 80, 10, 98); if (Math.random() * 100 > hc) return {miss:true}; }
  const em = elemMod(elem, d.elem), pow = Math.max(DER.matk, DER.atk) * (1 + buffSum('atkPct'));
  const def = d.def * (st.defDown > 0 ? 1 - st.defDownPct : 1);
  let dmg = (pow * rand(.9, 1.1) * mult - def) * (1 - (d.defPct || 0)) * em;
  dmg *= 1 + ((DER.race || {})[d.race] || 0);
  if (crit) dmg *= 1.5;
  return {dmg:em === 0 ? 0 : Math.max(1, Math.round(dmg)), crit, em};
}
/* one hit of this beast on m: magic beasts cast, the bound beast uses your better stat, the rest strike physically */
function beastHit(s, B, m, mult){
  if (B.bound) return DER.atk > DER.matk ? beastPhys(m, mult, B.elem) : magicDamage(m, mult, B.elem);
  return B.role === 'magic' ? magicDamage(m, mult, B.elem) : beastPhys(m, mult, B.elem, B.crit || 0);
}
const BEAST_DMG = .3;   // balance: beast attacks hit at this fraction of the skill's listed power (×BEAST_STAT, ×pack share)
/* a bigger pack shares the power: with more than BEAST_PACK fighting beasts out (the Kinnaree does not count), each one hits
   for BEAST_PACK / n of its share, so Legion and the bound boss add bodies and skills rather than multiplying the damage */
const BEAST_PACK = 2;
const beastPack = () => { const n = SUMMONS.filter(s => s.kind === 'beast' && !s.dead && !(beastDef(s) || {}).support).length; return Math.min(1, BEAST_PACK / Math.max(1, n)); };
const beastPower = s => (s.sk.dmg ? s.sk.dmg(s.lv) : .4 + s.lv * .2) * beastMul() * BEAST_DMG * BEAST_STAT * beastPack();
/* tanks (and sometimes physical beasts) pull the monster they hit onto themselves */
function beastPull(s, B, m){
  if (!m || m.dead || m.pvp || m.def.boss) return;
  const cur = m.foe && !m.foe.dead && SUMMONS.includes(m.foe) ? m.foe : null;
  if (B.role === 'tank' || (!cur && B.role === 'phys' && Math.random() < .3)){ m.foe = s; m.aggro = true; }
}
function conjure(sk, lv){
  const kind = sk.beast, B = HIMMA[kind], pas = DER.pas || {};
  SUMMONS = SUMMONS.filter(s => !(s.kind === 'beast' && s.beast === kind));                // one of each kind; calling again renews it
  const mine = SUMMONS.filter(s => s.kind === 'beast' && s.beast !== 'bound'), cap = beastMax() - (SUMMONS.some(s => s.beast === 'bound') ? 1 : 0);   // (v274) the bound boss takes one of the places
  while (mine.length >= Math.max(1, cap)){ const old = mine.shift(); SUMMONS = SUMMONS.filter(s => s !== old); VFX.play('beastFade', {x:old.x, y:old.y, col:HIMMA[old.beast].aura}); }
  const slot = BEAST_SLOT[mine.length % BEAST_SLOT.length], x = clamp(P.x + slot[0], 20, W - 20), y = clamp(P.y + slot[1], 20, H - 20);
  const dur = (sk.dur(lv) + (pas.sumDur || 0)) * (1 + (pas.sumDurPct || 0)), hp = beastHpOf(B, sk, lv);
  SUMMONS.push({kind:'beast', beast:kind, x, y, t:0, dur, lv, sk, atkCd:.6, atkT:0, skCd:B.skill.cd * .35, skT:0, dir:P.dir || 0, target:null, moving:false, hp, maxhp:hp});
  VFX.play('conjure', {x, y, col:B.aura}); VFX.shake(2); SFX.play('jobUp');
  later(.95, () => addText(x, y - 74, L(B.name[0], B.name[1]), '#ffe7a0', 18));
  log(L(`อัญเชิญ${B.name[0]} (${BEAST_ROLE[B.role].th})`, `Summoned the ${B.name[1]} (${BEAST_ROLE[B.role].en})`), 'g');
}
/* Royal Bond: on a boss at 30% HP or less → bind it for good (it leaves the field and becomes yours).
   With no such boss targeted → call your bound beast back if it has fallen or is not out. */
/* (v274) Royal Bond is back for the Sovereign, with limits so summons do not pile up:
   · only a region boss at or below your level can be bound (no world boss, dungeon / tower guardian or invasion warlord)
   · the bound boss comes only when you call it, stays BOND.dur seconds, then rests BOND.rest seconds
   · it takes one of the beast places (Garuda, Erawan …): calling it sends the oldest beast home */
const BOND = {dur:45, rest:90};
const bondRest = () => Math.max(0, Math.ceil(((S.bound && S.bound.restUntil) || 0) - Date.now()) / 1000) | 0;
function bondNo(t){
  if (t.wb || t.dg || t.tw || t.inv || t.invBoss || t.minion) return L('บอสตัวนี้ผูกพันธะไม่ได้ (บอสโลก ดันเจี้ยน หอคอย และการรุกราน)', 'This boss cannot be bound (world, dungeon, tower and invasion bosses)');
  if ((t.def.lvl || 0) > S.lvl) return L(`ผูกพันธะได้เฉพาะบอสเลเวลไม่เกินคุณ (บอส Lv ${t.def.lvl})`, `Only a boss at or below your level can be bound (this one is Lv ${t.def.lvl})`);
  return '';
}
function bondCast(sk, lv, t){
  const out = SUMMONS.find(s => s.beast === 'bound');
  if (t && !t.dead && t.def.boss && dist(t, P) < 260){
    if (t.hp / t.maxhp > .3){ toast(L('ต้องทำให้บอสเหลือ HP ไม่เกิน 30% ก่อน', 'Bring the boss to 30% HP or less first')); P.cds[sk.id] = 1; return; }
    const why = bondNo(t); if (why){ toast(why); P.cds[sk.id] = 1; return; }
    const prev = S.bound && MOB[S.bound.type];
    S.bound = {type:t.type, hp:1}; if (out) SUMMONS = SUMMONS.filter(s => s !== out);
    VFX.play('conjure', {x:t.x, y:t.y, col:'auraViolet'}); VFX.play('classAura', {col:'rgba(170,110,255,1)', colL:'rgba(235,215,255,1)'}); VFX.shake(5); SFX.play('jobUp');
    t.vanish = true; killMob(t);
    banner(L(`ผูกพันธะกับ ${nm(t.def)} สำเร็จ!`, `${nm(t.def)} is bound to you!`)); log(L(`ผูกพันธะ ${nm(t.def)}${prev ? ` แทน ${nm(prev)}` : ''}`, `Bound ${nm(t.def)}${prev ? ` in place of ${nm(prev)}` : ''}`), 'g');
    later(.6, spawnBound); save(); return;
  }
  if (!S.bound){ toast(L('ยังไม่มีบอสที่ผูกพันธะ · ใช้กับบอสที่ HP ≤ 30%', 'No bound boss yet · use it on a boss at 30% HP or less')); P.cds[sk.id] = 1; return; }
  if (out && !out.dead){ toast(L(`บอสพันธะอยู่ในสนามแล้ว · เหลือ ${Math.ceil(out.dur - out.t)} วิ`, `Your bound boss is out · ${Math.ceil(out.dur - out.t)} s left`)); P.cds[sk.id] = 1; return; }
  const rest = bondRest(); if (rest > 0){ toast(L(`บอสพันธะกำลังพัก · อีก ${rest} วิ`, `Your bound boss is resting · ${rest} s`)); P.cds[sk.id] = 1; return; }
  S.bound.hp = 1; spawnBound();
}
function spawnBound(){
  if (!S.bound || !DER || SUMMONS.some(s => s.beast === 'bound') || S.bound.hp <= 0) return;
  { const mine = SUMMONS.filter(q => q.kind === 'beast' && q.beast !== 'bound'); while (mine.length >= beastMax()){ const old = mine.shift(); SUMMONS = SUMMONS.filter(q => q !== old); VFX.play('beastFade', {x:old.x, y:old.y, col:HIMMA[old.beast] ? HIMMA[old.beast].aura : 'auraViolet'}); } }   // (v274) it takes a beast's place
  const s = {kind:'beast', beast:'bound', x:clamp(P.x - 34, 20, W - 20), y:clamp(P.y - 4, 20, H - 20), t:0, dur:BOND.dur, lv:1, sk:SKILLS.royalbond, atkCd:.8, atkT:0, skCd:4, skT:0, dir:P.dir || 0, target:null, moving:false};
  s.def = boundDef(); if (!s.def) return;
  s.maxhp = Math.round(DER.maxhp * BEAST_STAT); s.hp = Math.max(1, Math.round(s.maxhp * (S.bound.hp || 1)));
  SUMMONS.push(s); VFX.play('conjure', {x:s.x, y:s.y, col:'auraViolet'});
}
/* a monster hits a beast: your DEF (× the beast's toughness) and Def buffs guard it; tanks take less, and the barrier soaks first for them */
function hitBeast(s, m, mult = 1){
  if (!s || s.dead) return; const d = m.def, B = beastDef(s); if (!B) return;
  const st = m.st || {};
  let dmg = rand(d.atk[0], d.atk[1]) * mult * (m.enraged ? 1.5 : 1) * (st.atkDown > 0 ? 1 - st.atkDownPct : 1);
  dmg = Math.max(1, Math.round((dmg - DER.def * (B.def || 1) - buffDef()) * (B.taken || 1) * (s.guard > 0 ? .5 : 1)));
  if (B.role === 'tank'){ const br = P.buffs.barrier; if (br){ const a = Math.min(br.barrier, dmg); br.barrier -= a; dmg -= a; if (br.barrier <= 0){ delete P.buffs.barrier; renderBuffs(); } } }
  if (dmg <= 0) return;
  s.hp -= dmg; s.hurt = .2; addText(s.x, s.y - 40, String(dmg), B.role === 'tank' ? '#9fd0ff' : '#ffb0e0', 11);
  if (s.hp <= 0){ s.dead = true; s.hp = 0; VFX.play('beastFade', {x:s.x, y:s.y, col:B.aura});
    if (s.beast === 'bound'){ S.bound.hp = 0; toast(L(`${nm(MOB[S.bound.type])} ล้มลง · ใช้สกิลผูกพันธะราชันย์เพื่อเรียกกลับ`, `${nm(MOB[S.bound.type])} fell · use Royal Bond to call it back`)); }
    else log(L(`${B.name[0]}หมดแรง กลับคืนป่าหิมพานต์`, `The ${B.name[1]} is spent and returns to Himmapan`)); }
}
/* the beast's own skill: its name pops over it, then the effect */
function beastSkill(s, B, tg, all){
  const K = B.skill, mult = beastPower(s) * (K.mul || 1), top = MOB_H_OF(B.mob) * (B.scale || 1) + (B.fly || 0);
  s.skT = .7; s.atkT = .45;
  addText(s.x, s.y - top - 14, `${L(...K.name)}!`, BEAST_ROLE[B.role].col, 12);
  if (K.kind === 'heal'){
    const pct = s.sk.heal(s.lv) * (1 + (DER.pas.healPow || 0)), h = Math.round(DER.maxhp * pct);
    if (S.hp < DER.maxhp){ S.hp = Math.min(DER.maxhp, S.hp + h); addText(P.x, P.y - 50, `+${h}`, '#c4ffe0', 13); }
    for (const o of all) if (o.maxhp && !o.dead && o.hp < o.maxhp){ o.hp = Math.min(o.maxhp, o.hp + Math.round(o.maxhp * pct)); VFX.play('heal', {x:o.x, y:o.y}); }
    VFX.play('heal', {x:P.x, y:P.y}); SFX.play('regen'); return;
  }
  if (K.kind === 'taunt'){
    s.guard = K.guard || 4; if (K.heal) s.hp = Math.min(s.maxhp, s.hp + Math.round(s.maxhp * K.heal));
    VFX.play('roar', {x:s.x, y:s.y, r:K.radius}); VFX.shake(3); SFX.play('bf_shield');
    for (const m of mobs){ if (m.dead || m.vanish || Math.hypot(m.x - s.x, m.y - s.y) > K.radius + m.def.r) continue;
      applyDamage(m, beastHit(s, B, m, mult), s.sk);
      if (!m.def.boss && !m.pvp){ m.foe = s; m.aggro = true; m.taunt = 3; VFX.play('provoke', {m}); } }
    return;
  }
  if (!tg) return;
  if (K.kind === 'geyser'){
    const cx = tg.x, cy = tg.y;
    for (let i = 0; i < (K.hits || 3); i++) later(.1 + i * .3, () => {
      VFX.play('orbHit', {x:cx + rand(-14, 14), y:cy - 8, elem:B.elem}); VFX.play('iceHit', {x:cx, y:cy - 6});
      for (const m of mobs){ if (m.dead || Math.hypot(m.x - cx, m.y - cy) > K.radius + m.def.r) continue;
        applyDamage(m, magicDamage(m, mult, B.elem), s.sk); if (i === 0 && K.slow) applyStatus(m, {slow:K.slow}); } });
    return;
  }
  if (K.kind === 'dive' || K.kind === 'stomp'){
    if (K.kind === 'dive'){ s.diveT = .35; s.x = tg.x - 10; s.y = tg.y + 4; }
    const cx = K.kind === 'stomp' ? s.x : tg.x, cy = K.kind === 'stomp' ? s.y : tg.y;
    later(K.kind === 'dive' ? .2 : 0, () => {
      VFX.play('quake', {x:cx, y:cy, r:K.radius}); VFX.shake(K.kind === 'stomp' ? 4 : 3); if (K.kind === 'dive') VFX.play('critBurst', {x:cx, y:cy - 14});
      for (const m of mobs){ if (m.dead || Math.hypot(m.x - cx, m.y - cy) > K.radius + m.def.r) continue;
        applyDamage(m, beastHit(s, B, m, mult), s.sk); beastPull(s, B, m);
        if (K.stun && s.sk.stun) applyStatus(m, {stun:s.sk.stun(s.lv)}); } });
  }
}
function updBeast(s, dt){
  const B = beastDef(s); if (!B) { s.dead = true; return; }
  s.t += dt; s.atkCd -= dt; s.skCd -= dt * (1 + (beastHaste() - 1) * .5);
  for (const k of ['atkT', 'hurt', 'skT', 'guard', 'diveT']) if (s[k] > 0) s[k] -= dt;
  if (s.maxhp == null){ s.maxhp = beastHpOf(B, s.sk, s.lv); s.hp = s.maxhp; }                 // beasts called before this update
  if (s.beast === 'bound'){ s.maxhp = Math.round(DER.maxhp * BEAST_STAT); if (S.bound) S.bound.hp = s.hp / s.maxhp;
    for (const b of Object.values(P.buffs)) if (b.regenPct && b.rt === 0) s.hp = Math.min(s.maxhp, s.hp + Math.round(s.maxhp * b.regenPct)); }
  if (B.role === 'tank'){ s.regT = (s.regT || 0) + dt; if (s.regT >= 6){ s.regT = 0; s.hp = Math.min(s.maxhp, s.hp + Math.max(1, Math.floor(s.maxhp / 100))); } }
  const all = SUMMONS.filter(o => o.kind === 'beast'), idx = all.indexOf(s), slot = BEAST_SLOT[Math.max(0, idx) % BEAST_SLOT.length];
  const gap = 1 + Math.max(0, (B.scale || 1) - 1) * .6, wy = Math.min(s.wy || 0, 4);   // big beasts stand further out; idle wandering never brings them in front
  const home = () => { const hx = P.x + slot[0] * gap + (s.wx || 0), hy = P.y + slot[1] * gap + wy, d = Math.hypot(hx - s.x, hy - s.y);
    if (d > 420){ s.x = hx; s.y = hy; }                                                         // fell far behind (warp, blink): catch up
    s.moving = d > 10; if (s.moving){ moveTo(s, hx, hy, B.speed * (d > 120 ? 1.6 : d < 30 ? .45 : 1), dt); s.dir = SPR.dirFromVec(hx - s.x, hy - s.y); } else if (typeof compFace === 'function') compFace(s); };
  // support: the Kinnaree dances heals on her own timer and only plinks at foes close to you
  if (B.support && s.skCd <= 0 && !P.dead){
    const hurt = S.hp < DER.maxhp || all.some(o => o.maxhp && !o.dead && o.hp < o.maxhp);
    if (hurt){ s.skCd = B.skill.cd; beastSkill(s, B, null, all); } else s.skCd = .5;
  }
  let tg = s.target; if (!tg || tg.dead || dist(tg, P) > 340) tg = s.target = (P.target && !P.target.dead && dist(P.target, P) < 340 ? P.target : nearestFoe(280));
  if (B.support && tg && dist(tg, P) > 200) tg = null;
  if (!tg){ home(); return; }
  if (B.role === 'tank' && s.skCd <= 0 && mobs.some(m => !m.dead && !m.vanish && Math.hypot(m.x - s.x, m.y - s.y) < B.skill.radius + m.def.r)){ s.skCd = B.skill.cd; beastSkill(s, B, tg, all); }
  const d = dist(s, tg), reach = B.reach + tg.def.r, ranged = B.basic.kind === 'bolt';
  if (d > reach){ // surround the target: each beast takes its own side instead of piling up on one spot
    if (B.support){ home(); return; }
    const a = Math.max(0, idx) * 2.1 + .6, gx = tg.x + Math.cos(a) * (ranged ? B.reach * .8 : reach * .8), gy = tg.y + Math.sin(a) * (ranged ? B.reach * .4 : reach * .5);
    moveTo(s, gx, gy, B.speed, dt); s.moving = true; s.dir = SPR.dirFromVec(gx - s.x, gy - s.y);
    if (Math.hypot(gx - s.x, gy - s.y) > 6) return; }
  s.moving = false; s.dir = SPR.dirFromVec(tg.x - s.x, tg.y - s.y);
  // its own skill first (damage dealers), then the basic attack
  if (!B.support && B.role !== 'tank' && s.skCd <= 0 && s.atkCd <= .2){ s.skCd = B.skill.cd; s.atkCd = Math.max(s.atkCd, .6); beastSkill(s, B, tg, all); return; }
  if (s.atkCd > 0) return;
  s.atkCd = B.basic.every / beastHaste(); s.atkT = .45; s.lx = tg.x - s.x; s.ly = tg.y - s.y;
  const mult = beastPower(s) * (B.basic.mul || 1), sk = s.sk;
  if (ranged){ const t0 = tg, r0 = beastHit(s, B, t0, mult), k = B.basic.proj === 'orb' ? 'orb' : 'holy';
    projs.push({k, elem:B.elem, x:s.x, y:s.y - 16 - (B.fly || 0), t:t0, delay:0, speed:470, wob:Math.random() * 6, hit:() => { applyDamage(t0, r0, sk); beastPull(s, B, t0);
      VFX.play(k === 'orb' ? 'orbHit' : 'holyHit', {x:t0.x, y:t0.y - MOB_H[t0.type] * .5, elem:B.elem, m:t0}); }}); }
  else { const r = beastHit(s, B, tg, mult); applyDamage(tg, r, sk); beastPull(s, B, tg);
    const hy = tg.y - MOB_H[tg.type] * .5;
    if (B.basic.fx === 'tusk') VFX.play('slashHit', {x:tg.x, y:hy, big:true}); else VFX.play('clawHit', {x:tg.x, y:hy, small:B.basic.fx === 'talon'});
    if (r.crit) VFX.play('critBurst', {x:tg.x, y:hy}); }
}
