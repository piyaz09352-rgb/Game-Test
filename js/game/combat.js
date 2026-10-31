/* VAYRATHEN — js/game/combat.js */
'use strict';

/* ---------- combat ---------- */
function physDamage(m, mult, elem){
  const d = m.def, st = m.st || {}, pas = DER.pas || {};
  let crit = Math.random() * 100 < DER.crit;
  const hb = hideBuff(); if (hb && hb.sureCrit){ crit = true; hb.sureCrit = 0; }
  if (!crit){ const hc = clamp(DER.hit - (90 + d.lvl * 1.4) + 80, 5, 95); if (Math.random() * 100 > hc) return {miss:true}; }
  const el = elem || DER.welem, em = elemMod(el, d.elem);
  let atk = DER.atk * (1 + buffSum('atkPct'));
  if (buffSum('crit') && !crit && Math.random() * 100 < buffSum('crit')) crit = true;
  if (pas.lowHpAtk && S.hp < DER.maxhp * .3) atk *= 1 + pas.lowHpAtk;
  const def = d.def * (st.defDown > 0 ? 1 - st.defDownPct : 1);
  let dmg = (atk * rand(.9, 1.1) * mult - def) * (1 - (d.defPct || 0));
  dmg *= em * SIZE_MOD[JOBS[S.job].weapon.type][d.size];
  if (slotHas('c_hare') && d.size === 's') dmg *= 1.15;
  dmg *= 1 + ((DER.race || {})[d.race] || 0);
  if (pas.petFocus && S.pet && PET.target === m) dmg *= 1 + pas.petFocus;
  if (pas.luckyElem && el === luckyElem()) dmg *= 1 + pas.luckyElem;
  if (crit) dmg *= DER.critDmg;
  return {dmg: em === 0 ? 0 : Math.max(1, Math.round(dmg)), crit, em};
}
function magicDamage(m, mult, elem){
  const d = m.def, em = elemMod(elem, d.elem), pas = DER.pas || {};
  let dmg = (DER.matk * rand(.9, 1.1) * mult - d.lvl / 2) * em * (1 - (d.defPct || 0) / 2);
  if (pas.luckyElem && elem === luckyElem()) dmg *= 1 + pas.luckyElem;
  dmg *= 1 + ((DER.race || {})[d.race] || 0);
  return {dmg: em === 0 ? 0 : Math.max(1, Math.round(dmg)), em, magic:true, elem};
}
function applyDamage(m, res, sk){
  if (!m || m.dead) return;
  if (m.pvp){ if (typeof pvpDeal === 'function') pvpDeal(m, res, sk); return; }   // a duel opponent: the damage travels to them
  const y = m.y - MOB_H[m.type] - 4;
  if (res.miss){ addText(m.x, y, 'Miss', '#cfcfcf'); return; }
  if (res.magic && !res.shur) res.crit = false; // spells never crit (a thrown star can: v184)
  if (m.st && m.st.shock > 0 && !res.poison) res.dmg = Math.round(res.dmg * 1.15);
  if (!res.poison){ const w = JOBS[S.job].weapon.type;
    if (res.magic && !res.shur) sk ? SFX.impact(res.elem || sk.elem) : SFX.play('orbhit', {elem:res.elem});   // spell hit by element · caster basic orb pop
    else if (sk && w === 'fist'){ const k = muayStrike(sk); SFX.play('mh_' + k, {big:true}); if (k === 'jab' || k === 'hook') P.mtSk = k === 'jab' ? 'hook' : 'jab'; if (res.crit) SFX.play('crit'); }
    else if (sk) SFX.play(res.crit ? 'crit' : 'skill_hit');                                         // physical skill: heavy hit
    else if (w === 'fist') { if (res.crit) SFX.play('crit'); else SFX.play('mh_' + (P.mt || 'jab')); }   // (v184) a critical normal attack: the crit sound alone
    else { if (res.crit) SFX.play('crit'); else SFX.hit(w); } }                                         // basic attack: weapon voice
  m.hp -= res.dmg; if (m.wb && typeof wbHit === 'function') wbHit(res.dmg); if (typeof nmHit === 'function') nmHit(m, res.dmg); m.flash = .12; m.aggro = true; if (m.atkT > .4) m.hurtT = .25;
  if (m.hp > 0 && res.dmg > 0 && !res.poison) SFX.mob('hurt', m);
  if (!res.poison) unhide();
  const col = res.poison ? '#2f9e3a' : res.crit ? '#ffd56a' : res.magic ? '#ffb46b' : '#ffffff';
  let s = String(res.dmg); if (res.crit) s += '!';
  addText(m.x + rand(-8, 8), y, s, col, res.crit ? 56 : res.poison ? 24 : 38);   // big numbers that never shrink below this when zoomed out; crits stand out the most
  if (res.em >= 1.5 && texts.length){ const e0 = res.elem || (sk && sk.elem) || DER.welem; texts[texts.length - 1].ring = (typeof ELEM_COL !== 'undefined' && ELEM_COL[e0]) || '#9ff0c8'; }   // a hit that beats the element: the number gets a rim in that element's colour
  if (res.crit && SETTINGS.dmgNumbers) VFX.play('critBurst', {x:m.x, y:y + 6});
  // v56: a crit no longer jolts the screen (it read as the whole picture blinking)
  if (res.em === 0) addText(m.x, y - 18, L('ธาตุไม่มีผล', 'Immune'), '#ff9a9a', 12);
  if (m.def.boss && !m.split && m.hp < m.maxhp * .5 && m.type !== 'boss' && !m.wb && !m.dg){   // other bosses: their own half-HP shout (js/sys/bosslines.js)
    m.split = true; const ln = typeof bossLine === 'function' && bossLine(m.type, 0);
    if (ln){ if (typeof bossShout === 'function') bossShout(m, 'shock', null, ln); else banner(L(...ln)); addText(m.x, m.y - MOB_H[m.type] - 30, L(nm(m.def), m.def.en), '#ffd27a', 14); }
  }
  if (m.def.boss && !m.split && m.hp < m.maxhp * .5 && m.type === 'boss'){   // only the Golden Jelly King splits into jellies
    m.split = true;
    for (let i = 0; i < 8; i++){
      const a = i / 8 * Math.PI * 2;
      const c = spawnMob('dewblob', m.x + Math.cos(a) * 60, m.y + Math.sin(a) * 40, {zone:ZB, minion:true});
      c.aggro = true;
    }
    banner(L('ราชาเจลลี่แตกตัวเป็นเจลลี่ 8 ตัว!', 'The Jelly King splits into 8 jellies!'));
  }
  if (m.hp <= 0) killMob(m);
}
const GEAR_DROP = .025;   // (v192) half (sys/economy.js)  ·   // was .02: gear from 1 kill in 20    // balance: a piece of gear from 1 normal kill in 50, so hunting the right affixes is reachable
/* (v101) EXP by level gap (monster Lv − your Lv): stronger monsters give more, much weaker ones less */
const EXP_GAP = [[10, 1.2], [5, 1.1], [-5, 1], [-10, .9], [-15, .75], [-20, .6], [-30, .4], [-Infinity, .2]];
const expGap = lv => { const g = (lv || 1) - S.lvl; return (EXP_GAP.find(([d]) => g >= d) || [0, 1])[1]; };
function killMob(m){
  if (m.wb && typeof wbEligible === 'function' && !wbEligible()){ m.dead = true; m.deadT = 0; if (P.target === m) P.target = null; wbReward(m); return; }   // world boss: no EXP or drops without taking part
  m.dead = true; m.deadT = 0; if (typeof nmKilled === 'function') nmKilled(m);
  if (P.target === m) P.target = null;
  const d = m.def, nmul = isEvent() ? EVENT_MUL : 1;
  const gx = expGap(d.lvl), be = Math.round(d.exp * RATE * nmul * gx * (m.minion ? .3 : 1) * (S.pet ? 1 + MOVES.pet.expBonus + (DER.pas.petExp || 0) : 1)), je = Math.round(d.jexp * JRATE * nmul * gx * (m.minion ? .3 : 1));
  // (v27) EXP no longer floats over the monster: it is a line in the chat window's System tab (syschat.js)
  questKill(m.type); partyShareExp(be, je, m.x, m.y); SFX.play(d.boss ? 'boom' : 'mobDie');
  for (const [id, ch] of d.drops){ if (!m.minion && Math.random() < ch * nmul) dropLoot(id, m.x, m.y); }
  // equipment drops: GEAR_DROP (2%) from monsters, every boss drops one piece (and often a second)
  if (!m.minion){ const n = d.boss ? 1 + (Math.random() < .6 ? 1 : 0) + (Math.random() < .2 ? 1 : 0) : Math.random() < GEAR_DROP * nmul ? 1 : 0;
    for (let i = 0; i < n; i++){ const g0 = gearDrop(m), g = g0 && rollGear(g0, d.boss ? 'boss' : 'mob', m.x, m.y - MOB_H[m.type]); if (g){ dropLoot(g, m.x + rand(-10, 10), m.y + rand(-6, 6)); if (!d.boss) addText(m.x, m.y - MOB_H[m.type] - 32, 'Gear!', '#ffd56a', 14); } } }
  if (!m.minion && Math.random() < d.cardRate * nmul){
    S.cards[d.card] = (S.cards[d.card] || 0) + 1; bump('cards'); EV.emit('card', d.card);
    if (typeof cardPop === 'function') cardPop(d.card); else banner(L(`ได้ ${nm(CARDS[d.card])}!`, `${nm(CARDS[d.card])}!`)); log(L(`ได้ Card: ${nm(CARDS[d.card])}`, `Got a card: ${nm(CARDS[d.card])}`), 'c');
  }
  if (d.boss && !d.wb){
    boss = null; bossTimer = bossGap();
    const mv = typeof ECON !== 'undefined' ? ECON.mvpBia : 3000; S.bia += mv;
    banner(L(`คุณคือ MVP! +${mv.toLocaleString()} เบี้ย`, `You are the MVP! +${mv.toLocaleString()} Bia`)); log(L(`MVP: ล้ม${d.name} ได้ ${mv.toLocaleString()} เบี้ย`, `MVP: defeated ${d.en}, +${mv.toLocaleString()} Bia`), 'g');
    { const ln = typeof bossLine === 'function' && bossLine(m.type, 1); if (ln) log(L(...ln), 'g'); }
    for (const o of mobs) if (o.minion && !o.dead){ o.dead = true; o.deadT = 0; }
  }
  gainExp(be, je); dirty = true;
  bump('kills'); if (d.boss) bump('bosses'); EV.emit('kill', m);
}
function gainExp(b, j){
  const lv0 = S.lvl, jl0 = S.jlvl;
  S.exp += b;
  while (S.lvl < LV_MAX && S.exp >= nextBase(S.lvl)){
    S.exp -= nextBase(S.lvl); S.lvl++; S.statPts += statGain(S.lvl);
    derive(); S.hp = DER.maxhp; S.sp = DER.maxsp;
    pulseChar();
    log(L(`Base Level ${S.lvl}! ได้ Stat Point ${statGain(S.lvl)}`, `Base Level ${S.lvl}! +${statGain(S.lvl)} Stat Points`), 'g');
    save();
  }
  const max = JOBS[S.job].jobMax;
  if (S.jlvl < max){
    S.jexp += j;
    while (S.jlvl < max && S.jexp >= nextJob(S.jlvl)){
      S.jexp -= nextJob(S.jlvl); S.jlvl++; S.skPts++;
      pulseChar();
      log(L(`Job Level ${S.jlvl} ได้ Skill Point 1`, `Job Level ${S.jlvl}, +1 Skill Point`), 'j');
      if (JOBS[S.job].next && S.jlvl === max) banner(L(`Job Lv ${max}! ไปหาครูวายราที่ศาลเพื่อเปลี่ยน Job`, `Job Lv ${max}! Visit Master Vayra at the shrine to change Job`));
    }
    if (S.jlvl >= max) S.jexp = 0;
  }
  if (S.lvl > lv0) EV.emit('level', S.lvl);
  if (S.lvl > lv0){ fx.push({k:'lvl', n:S.lvl, x:P.x, y:P.y, t:0, life:2}); VFX.play('levelUp', {}); SFX.levelUp(); }
  if (S.jlvl > jl0){ fx.push({k:'jlvl', n:S.jlvl, x:P.x, y:P.y, t:S.lvl > lv0 ? -1.3 : 0, life:1.6}); if (S.lvl === lv0){ VFX.play('levelUp', {job:true}); SFX.jobUp(); } }
  dirty = true;
}
function playerDie(){
  S.hp = 0; P.dead = true; P.deadT = 3; P.target = null; P.cast = null; P.pending = null;
  bump('deaths'); EV.emit('die');
  const loss = Math.floor(nextBase(S.lvl) * .01); S.exp = Math.max(0, S.exp - loss);
  log(L(`คุณล้มลง เสีย EXP ${loss}`, `You fell. Lost ${loss} EXP`), 'r'); banner(L('คุณล้มลง… จะฟื้นที่หมู่บ้านอาเรน', 'You fell… you will wake in Aren village'));
  for (const m of mobs) m.aggro = false;
  dirty = true;
}
function respawn(){
  if (MAP_ID !== 0) loadMap(0);
  P.dead = false; P.x = VSPAWN.x; P.y = VSPAWN.y; P.tx = null; P.dir = 0; P.act = null; S.hp = Math.round(DER.maxhp * .5); S.sp = Math.round(DER.maxsp * .5); dirty = true;
}
/* Muay Thai sounds: basic attacks run a combo, skills use the strike their pose shows */
const MT_COMBO = ['jab', 'hook', 'jab', 'kick', 'elbow', 'knee', 'jab', 'uppercut', 'teep', 'kick'];
function muayStrike(sk){ const a = sk.act || '';
  return a === 'punch' || a === 'flurry' ? (P.mtSk || 'jab') : a === 'uppercut' ? 'uppercut' : a === 'kick' || a === 'spinkick' ? 'kick' : a === 'knee' ? 'knee' : a === 'teep' ? 'teep' : a === 'elbow' ? 'elbow' : 'hook'; }
/* (v184) the ninja's normal attack: one star from the pouch, thrown spinning; it hits with MATK in the stars' element and,
   unlike a spell, it can land a critical hit (LUK, CRIT and the ninja's crit skills count) */
function shurShot(t, mul = 1){
  const elem = DER.welem;
  return {k:'shuriken', elem, x:P.x, y:P.y - 30, t, delay:.06, speed:760, hit:() => {
    const r = magicDamage(t, .95 * mul, elem); r.shur = true;
    const hb = hideBuff() || P.buffs.smokescreen; let cr = (DER.crit || 0) + buffSum('crit'); if (hb && hb.sureCrit){ cr = 100; hb.sureCrit = 0; }
    if (r.dmg > 0 && Math.random() * 100 < cr){ r.crit = true; r.dmg = Math.round(r.dmg * (DER.critDmg || 1.5)); }
    applyDamage(t, r); VFX.play('slashHit', {x:t.x, y:t.y - MOB_H[t.type] * .5}); }};
}
function basicAttack(t){
  P.swing = 1; P.atkAnim = .42; P.act = null; if (!JOBS[S.job].caster){ if (JOBS[S.job].weapon.type === 'fist'){ P.mt = MT_COMBO[(P.mtI = ((P.mtI || 0) + 1) % MT_COMBO.length)]; SFX.play('mt_' + P.mt); } else SFX.swing(JOBS[S.job].weapon.type); } P.dir = SPR.dirFromVec(t.x - P.x, t.y - P.y);
  const mul = P.buffs.backstep ? P.buffs.backstep.nextShot : 1; if (P.buffs.backstep){ delete P.buffs.backstep; renderBuffs(); }
  if (usesArrows() && !useArrows(1)){ P.atkAnim = 0; return; }
  if (JOBS[S.job].caster){ SFX.play('orb', {elem:DER.welem}); projs.push({k:'orb', elem:DER.welem, x:P.x, y:P.y - 34, t, delay:.12, speed:520, hit:() => { applyDamage(t, magicDamage(t, .7, DER.welem)); VFX.play('orbHit', {x:t.x, y:t.y - MOB_H[t.type] * .5, elem:DER.welem}); }}); return; }
  { const wt = JOBS[S.job].weapon.type; if (wt === 'dagger' || wt === 'sword') later(wt === 'dagger' ? .06 : .1, () => VFX.play('swingArc', {x:P.x, y:P.y, ang:Math.atan2(t.y - P.y, t.x - P.x), flip:typeof DAGGER_LEFT !== 'undefined' && DAGGER_LEFT.includes(P.dir | 0), kind:wt})); }
  const strike = () => { if (JOBS[S.job].weapon.type === 'shuriken'){ projs.push(shurShot(t, mul)); return; }   // (v184) a thrown star: magic damage
    if (JOBS[S.job].ranged) projs.push({k:'arrow', elem:DER.welem, x:P.x, y:P.y - 20, t, delay:0, speed:720, hit:() => { applyDamage(t, physDamage(t, mul)); VFX.play('arrowHit', {x:t.x, y:t.y - MOB_H[t.type] * .5, elem:DER.welem}); }}); else applyDamage(t, physDamage(t, mul)); };
  strike();
  if (DER.pas.dbl && Math.random() < DER.pas.dbl){ later(.14, () => { if (!t.dead){ strike(); VFX.play('slashHit', {x:t.x, y:t.y - MOB_H[t.type] * .5, gold:true}); } }); }
}
