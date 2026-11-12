/* VAYRATHEN — js/sys/tamed.js — monsters fight by their nature, and captured pets fight beside you
   1) Reach by nature. Every monster attacks from a distance that suits its body and weapon:
      archers shoot from far, casters and spirits throw spells, serpents strike from a coil, sword-bearers reach
      further than fists, big beasts further than small ones, slimes have to touch you. Bosses keep their own skills.
   2) Captured pets (T) become real companions with their own stats, rolled when they are caught:
      · Grade (ระดับ): C ธรรมดา · B ดี · A ยอดเยี่ยม · S หายาก · SS ตำนาน — multiplies every stat (LUK and elite
        monsters raise the odds a little). Grade also sets how many skills it knows (1 · 1 · 2 · 2 · 3).
      · Class (คลาส): Brawler · Guardian · Swift · Mystic · Hunter — drawn from what suits the creature
        (rocks lean Guardian, birds Swift or Hunter, spirits Mystic …) and shapes its stats.
      · Stats come from the monster itself, so a higher-level catch is a stronger pet: HP, ATK, DEF, attack speed,
        CRIT, element, and its attack range by nature (melee reach or a ranged shot / spell).
      · Skills, each with its own rolled grade (C → SS, stronger and faster with each grade): heavy strikes,
        stuns, venom, elemental bursts, shockwaves, life leech, healing you, shielding you, rallying you, provoking.
      In a fight the pet runs to your target (or to whatever is attacking you) and attacks with its own stats.
      Monsters it hits may turn on it (Guardians draw them on purpose). At 0 HP it is knocked out for 25 s and
      follows you weakly, then gets back up; out of combat it recovers. Ranger pet passives still add on top. */
'use strict';

/* ---------- 1) monster reach by nature ---------- */
const ELEM_SHOT = {fire:'fire', water:'ice', holy:'holy', wind:'bolt', shadow:'dark', undead:'dark', poison:'dark', ghost:'dark', earth:'dart', neutral:'dart'};
const CASTERS = new Set(['krahang', 'icefisher', 'laplaelord', 'agnilord']);
const POLE = new Set(['boatscarecrow', 'isanscarecrow', 'whitemonkeyking']);
const BASE_ARCH = {dewblob:'slime', hare:'quad', boar:'quad', lantern:'floater'};
function natureOf(k){
  const d = MOB[k]; if (!d) return null; const a = (typeof SPECIES_ARCH !== 'undefined' && SPECIES_ARCH[k]) || BASE_ARCH[k] || 'quad';
  const h = SPR.MOBS[k] && SPR.MOBS[k].human, wp = a === 'human' ? (h && h.weapon) || 'fist' : null;
  return {a, wp};
}
for (const k in MOB){
  const d = MOB[k]; if (!d || d.boss || k === 'dummy' || k === 'crowncrystal') continue;
  const n = natureOf(k); d.nature = n.a; d.natWp = n.wp;
  if (d.range) continue;                                       // already a shooter
  if (n.a === 'human'){
    if (n.wp === 'bow'){ d.range = 170; d.shot = 'arrow'; }
    else if (n.wp === 'staff' && CASTERS.has(k)){ d.range = 135; d.shot = ELEM_SHOT[d.elem] || 'dark'; }
    else d.reach = d.r + (POLE.has(k) ? 28 : n.wp === 'sword' ? 24 : 15);
  }
  else if (n.a === 'floater'){ d.range = 110; d.shot = ELEM_SHOT[d.elem] || 'dark'; }
  else d.reach = d.r + ({serpent:26, bird:20, rock:18, quad:d.size === 'l' ? 22 : 16, squat:14, bug:14, slime:10, fish:20}[n.a] || 14);
}
const mobReach = d => (d.range ? d.range : d.reach || d.r + 12);

/* ---------- 2) pets ---------- */
const PG = [
  {k:'C', th:'ธรรมดา', en:'Common', c:'#d8d0c0', w:50, mul:1, sk:1},
  {k:'B', th:'ดี', en:'Fine', c:'#7fe08a', w:28, mul:1.15, sk:1},
  {k:'A', th:'ยอดเยี่ยม', en:'Superb', c:'#5ab4ff', w:14, mul:1.32, sk:2},
  {k:'S', th:'หายาก', en:'Rare', c:'#c77dff', w:6, mul:1.55, sk:2},
  {k:'SS', th:'ตำนาน', en:'Legendary', c:'#ffb830', w:2, mul:1.85, sk:3}];
const SKG = [{w:45, m:1}, {w:30, m:1.2}, {w:16, m:1.45}, {w:7, m:1.75}, {w:2, m:2.2}];   // skill grades share the C…SS letters and colours
const PCLS = {
  brawler:{th:'นักสู้', en:'Brawler', atk:1.2, hp:1, def:1, spd:1, crit:3, sk:['maul', 'frenzy', 'quake', 'stun', 'howl']},
  guardian:{th:'ผู้พิทักษ์', en:'Guardian', atk:.8, hp:1.6, def:1.6, spd:1.1, crit:0, taunt:true, sk:['taunt', 'guard', 'stun', 'quake', 'mend']},
  swift:{th:'จู่โจมไว', en:'Swift', atk:.9, hp:.85, def:.8, spd:.7, crit:10, sk:['maul', 'venom', 'frenzy', 'leech']},
  mystic:{th:'นักเวท', en:'Mystic', atk:1.05, hp:.85, def:.8, spd:1.05, crit:0, magic:true, sk:['burst', 'mend', 'guard', 'leech', 'howl']},
  hunter:{th:'นักล่า', en:'Hunter', atk:1.1, hp:.9, def:.9, spd:.9, crit:6, sk:['maul', 'venom', 'stun', 'howl', 'burst']}};
const PCLS_POOL = {quad:{brawler:3, guardian:2, swift:2, hunter:2, mystic:.5}, rock:{guardian:4, brawler:2, mystic:.5}, squat:{guardian:2, brawler:3, mystic:1},
  slime:{guardian:2, mystic:2, brawler:1}, bug:{swift:3, hunter:2, brawler:1}, bird:{swift:3, hunter:3, mystic:1}, serpent:{hunter:3, swift:2, mystic:1},
  floater:{mystic:4, hunter:1, swift:1}, staff:{mystic:3, guardian:1}, bow:{hunter:4, swift:1}, sword:{brawler:2, guardian:2, hunter:1}, fist:{brawler:2, swift:2}};
const PSK = {
  maul:{th:'ขย้ำสุดแรง', en:'Mauling Strike', cd:7, d:g => L(`ตีแรง ×${(1.8 * g).toFixed(1)}`, `Hits for ×${(1.8 * g).toFixed(1)}`)},
  frenzy:{th:'คลั่งสงคราม', en:'Frenzy', cd:22, d:g => L(`ATK ตัวเอง +${Math.round(30 * g)}% 8 วิ`, `Own ATK +${Math.round(30 * g)}% for 8 s`)},
  quake:{th:'กระแทกรอบทิศ', en:'Shockwave', cd:12, d:g => L(`ตีรอบตัว ×${(1.3 * g).toFixed(1)}`, `Hits all around ×${(1.3 * g).toFixed(1)}`)},
  stun:{th:'กระแทกสลบ', en:'Stunning Blow', cd:14, d:g => L(`ตี ×1.2 สลบ ${(1 * g).toFixed(1)} วิ`, `Hits ×1.2, stuns ${(1 * g).toFixed(1)} s`)},
  howl:{th:'คำรามปลุกใจ', en:'Rallying Howl', cd:28, d:g => L(`ATK คุณ +${Math.round(6 * g)}% 12 วิ`, `Your ATK +${Math.round(6 * g)}% for 12 s`)},
  taunt:{th:'ยั่วยุ', en:'Provoke', cd:15, d:g => L(`ดึงมอนรอบ ${Math.round(110 * Math.min(1.5, g))} ให้ตีตัวเอง · DEF +${Math.round(20 * g)}%`, `Pulls monsters within ${Math.round(110 * Math.min(1.5, g))} onto itself · DEF +${Math.round(20 * g)}%`)},
  guard:{th:'โล่ผูกพัน', en:'Bond Shield', cd:25, d:g => L(`โล่ให้คุณ ${Math.round(8 * g)}% Max HP`, `Shields you for ${Math.round(8 * g)}% Max HP`)},
  mend:{th:'พรรักษา', en:'Mending Blessing', cd:18, d:g => L(`ฟื้น HP คุณ ${Math.round(6 * g)}%`, `Heals you ${Math.round(6 * g)}%`)},
  venom:{th:'พิษร้าย', en:'Venom', cd:12, d:g => L(`ตี + พิษ 5 วิ`, `Hit + 5 s of venom`)},
  burst:{th:'ระเบิดธาตุ', en:'Elemental Burst', cd:10, d:g => L(`เวทธาตุ ×${(2.2 * g).toFixed(1)}`, `Elemental spell ×${(2.2 * g).toFixed(1)}`)},
  leech:{th:'ดูดพลังชีวิต', en:'Life Leech', cd:12, d:g => L(`ตี ×${(1.4 * g).toFixed(1)} ดูดเลือดให้คุณ`, `Hits ×${(1.4 * g).toFixed(1)}, heals you`)}};
const pick = w => { let t = 0; for (const k in w) t += w[k]; let u = Math.random() * t; for (const k in w){ u -= w[k]; if (u <= 0) return k; } return Object.keys(w)[0]; };
function rollGrade(bonus = 0){
  const ws = PG.map((g, i) => g.w * (i ? 1 + bonus * i : Math.max(.3, 1 - bonus * 2)));
  let u = Math.random() * ws.reduce((a, b) => a + b, 0); for (let i = 0; i < ws.length; i++){ u -= ws[i]; if (u <= 0) return i; } return 0;
}
/* everything a pet is, rolled from the monster that was caught */
function petRoll(type, opt = {}){
  const d = MOB[type]; if (!d) return null; const n = natureOf(type) || {a:'quad'};
  const luk = (DER && DER.b && DER.b.luk) || 0, bonus = Math.min(.5, luk * .004 + (opt.elite ? .25 : 0));
  const g = opt.g != null ? opt.g : rollGrade(bonus);
  const cls = pick(PCLS_POOL[n.wp || n.a] || {brawler:1}), C = PCLS[cls], G = PG[g];
  const pool = C.sk.slice(), sk = [];
  for (let i = 0; i < G.sk && pool.length; i++){ const id = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const sw = SKG.map((s, j) => s.w * (j ? 1 + g * .35 * j : 1)); let u = Math.random() * sw.reduce((a, b) => a + b, 0), sg = 0; for (let j = 0; j < sw.length; j++){ u -= sw[j]; if (u <= 0){ sg = j; break; } }
    sk.push([id, sg]); }
  const p = {type, lv:d.lvl, g, cls, sk, v:1}; petStats(p); p.hp = p.mhp; return p;
}
function petStats(p){
  const d = MOB[p.type], C = PCLS[p.cls] || PCLS.brawler, m = PG[p.g].mul;
  p.mhp = Math.max(30, Math.round(d.hp * .5 * m * C.hp));
  p.atk = Math.max(5, Math.round((d.atk[0] + d.atk[1]) / 2 * .6 * m * C.atk));
  p.def = Math.round((d.def || 0) * m * C.def);
  p.delay = +Math.max(.6, (d.delay || 1.5) * C.spd).toFixed(2);
  p.crit = C.crit + p.g * 2; p.elem = d.elem || 'neutral';
  p.ranged = !!(d.range || C.magic); p.range = d.range ? d.range : C.magic ? 120 : mobReach(d); p.shot = d.shot || (C.magic ? ELEM_SHOT[p.elem] || 'holy' : null);
  return p;
}
const PD = () => (S && S.petd && S.pet && S.petd.type === S.pet ? S.petd : null);
const petAlive = () => { const p = PD(); return !!(p && !(PET.down > 0)); };
function petEnsure(){ if (S && S.pet && (!S.petd || S.petd.type !== S.pet)){ S.petd = petRoll(S.pet); dirty = true; } if (S && !S.pet) S.petd = null; }
const gradeTag = (g, big) => `<span class="pgr g${g}${big ? ' big' : ''}" style="--gc:${PG[g].c}">${PG[g].k}</span>`;
const petName = p => `${nm(MOB[p.type])}`;

/* catching: roll the new pet and announce it */
{ const _rc = resolveCapture;
  resolveCapture = function(){
    const t = P.capTarget; _rc();
    if (t && t.dead && t.vanish && S.pet === t.type){
      S.petd = petRoll(t.type, {elite:!!t.elite}); const p = S.petd;
      banner(L(`จับได้! ${petName(p)} · ระดับ ${PG[p.g].k} ${PG[p.g].th} · ${PCLS[p.cls].th}`, `Caught! ${petName(p)} · Grade ${PG[p.g].k} · ${PCLS[p.cls].en}`));
      log(L(`Pet ใหม่: ${petName(p)} Lv ${p.lv} [${PG[p.g].k}] ${PCLS[p.cls].th} · สกิล: ${p.sk.map(([id, sg]) => `${PSK[id].th} (${PG[sg].k})`).join(', ')}`,
        `New pet: ${petName(p)} Lv ${p.lv} [${PG[p.g].k}] ${PCLS[p.cls].en} · skills: ${p.sk.map(([id, sg]) => `${PSK[id].en} (${PG[sg].k})`).join(', ')}`), 'g');
      if (p.g >= 3){ VFX.play('jobChange', {x:PET.x, y:PET.y}); SFX.play('drop' + Math.min(3, p.g - 0)); }
      PET.hp = p.hp; PET.down = 0; save();
    }
  };
}
{ const _rel = releasePet; releasePet = function(){ _rel(); S.petd = null; }; }

/* ---------- the pet in a fight ---------- */
PET.cd = {}; PET.down = 0; PET.buffT = 0; PET.defT = 0; PET.atkT = 9;
const petEnemyNear = r => { let best = null, bd = r; for (const m of mobs){ if (m.dead || m.vanish || !m.aggro || m.dummy) continue; const d = Math.hypot(m.x - P.x, m.y - P.y); if (d < bd){ bd = d; best = m; } } return best; };
function petTarget(){
  const t = P.target; if (t && !t.dead && !t.vanish && !t.pvp && Math.hypot(t.x - P.x, t.y - P.y) < 340) return t;
  return petEnemyNear(220);
}
/* one hit from the pet (its own ATK, element, crit; the ranger's pet passives on top) */
function petHit(t, mul = 1, o = {}){
  const p = PD(); if (!p || !t || t.dead) return 0;
  const d = t.def, em = typeof ETAB !== 'undefined' && ETAB[p.elem] && ELEM.includes(d.elem) ? elemMod(p.elem, d.elem) : 1, crit = !o.noCrit && Math.random() * 100 < p.crit;
  let atk = p.atk * (PET.buffT > 0 ? 1 + PET.buffAmt : 1) * (1 + (DER.pas.petAtk || 0)) * (P.petBuff > 0 ? 1.3 : 1);
  let dmg = o.magic || PCLS[p.cls].magic ? (atk * rand(.9, 1.1) * mul - d.lvl * .3) : (atk * rand(.9, 1.1) * mul - (d.def || 0) * .6);
  dmg = Math.max(1, Math.round(dmg * em * (crit ? 1.5 : 1) * (1 - (d.defPct || 0) * .5))); if (em === 0) dmg = 0;
  const _at = addText; addText = (x, y, s, col, sz) => _at(x, y, s, crit ? '#ffcf5a' : '#ffd9a8', sz ? Math.min(sz, crit ? 17 : 14) : 14);
  try { applyDamage(t, {dmg, crit:false, em, poison:true, pet:true}); } finally { addText = _at; }
  if (crit) addText(t.x, t.y - MOB_H[t.type] - 16, 'CRIT!', '#ffcf5a', 11);
  // monsters it hurts may turn on it (Guardians draw them on purpose)
  if (!t.dead && !d.boss && !t.pvp && Math.random() < (PCLS[p.cls].taunt ? .7 : .22)){ t.foe = PET; t.aggro = true; }
  return dmg;
}
function petShootOrStrike(t, mul, o = {}){
  const p = PD(); if (!p) return;
  PET.atkT = 0; PET.dir = SPR.dirFromVec(t.x - PET.x, t.y - PET.y); SFX.mob('atk', {def:MOB[p.type], type:p.type});
  if (p.ranged || o.magic){ const h = (MOB_H[p.type] || 26) * .55, dd = Math.hypot(t.x - PET.x, t.y - PET.y), tt = Math.min(.6, dd / 300);
    VFX.play('mobShot', {x:PET.x, y:PET.y - h, tx:t.x, ty:t.y - (MOB_H[t.type] || 26) * .5, t:tt, kind:(o.magic ? ELEM_SHOT[p.elem] : p.shot) || 'dart'});
    later(tt, () => { const dmg = petHit(t, mul, o); if (o.after) o.after(dmg); }); }
  else { const dmg = petHit(t, mul, o); VFX.play('clawHit', {x:t.x, y:t.y - MOB_H[t.type] * .5, small:true}); if (o.after) o.after(dmg); }
}
function petSkill(t){
  const p = PD(); if (!p) return false;
  for (const [id, sg] of p.sk){
    const S0 = PSK[id], g = SKG[sg].m, cd = S0.cd * (1 - sg * .06); if ((PET.cd[id] || 0) > 0) continue;
    const say = () => addText(PET.x, PET.y - (MOB_H[p.type] || 26) - 10, L(S0.th, S0.en), PG[sg].c, 12);
    const inR = (t && Math.hypot(t.x - PET.x, t.y - PET.y) <= p.range + t.def.r + 6);
    let used = false;
    if (id === 'mend'){ if (S.hp < DER.maxhp * .6){ const h = Math.round(DER.maxhp * .06 * g); S.hp = Math.min(DER.maxhp, S.hp + h); addText(P.x, P.y - 52, `+${h}`, '#c4ffe0', 14); VFX.play('heal', {x:P.x, y:P.y}); used = true; } }
    else if (id === 'guard'){ if (S.hp < DER.maxhp * .75 && t){ const amt = Math.round(DER.maxhp * .08 * g); const br = P.buffs.barrier; if (!br || (br.barrier || 0) < amt){ addBuff('barrier', {t:8, barrier:amt}); VFX.play('barrierHit', {x:P.x, y:P.y}); used = true; } } }
    else if (id === 'howl'){ if (t){ addBuff('petHowl', {t:12, atkPct:+(.06 * g).toFixed(3)}); VFX.play('petcall', {x:PET.x, y:PET.y}); used = true; } }
    else if (id === 'frenzy'){ if (t){ PET.buffT = 8; PET.buffAmt = .3 * g; VFX.play('petcall', {x:PET.x, y:PET.y}); used = true; } }
    else if (id === 'taunt'){ if (t){ const r = 110 * Math.min(1.5, g); for (const m of mobs) if (!m.dead && !m.def.boss && !m.pvp && Math.hypot(m.x - PET.x, m.y - PET.y) < r){ m.foe = PET; m.aggro = true; m.taunt = 3; }
        PET.defT = 6; PET.defAmt = .2 * g; VFX.play('provoke', {m:{x:PET.x, y:PET.y, type:p.type, def:MOB[p.type]}, x:PET.x, y:PET.y}); used = true; } }
    else if (t && inR){
      if (id === 'maul'){ petShootOrStrike(t, 1.8 * g); used = true; }
      else if (id === 'stun'){ petShootOrStrike(t, 1.2, {after:() => { if (!t.dead) applyStatus(t, {stun:1 * g}); }}); used = true; }
      else if (id === 'venom'){ petShootOrStrike(t, 1, {after:() => { if (!t.dead && !t.def.boss){ const s = t.st || (t.st = {}); s.poison = 5; s.poisonDps = p.atk * .18 * g; s.poisonT = 1; } }}); used = true; }
      else if (id === 'burst'){ petShootOrStrike(t, 2.2 * g, {magic:true}); VFX.play('boom', {x:t.x, y:t.y, big:false}); used = true; }
      else if (id === 'leech'){ petShootOrStrike(t, 1.4 * g, {after:dmg => { const h = Math.max(1, Math.round(dmg * .35)); if (S.hp < DER.maxhp){ S.hp = Math.min(DER.maxhp, S.hp + h); addText(P.x, P.y - 52, `+${h}`, '#c4ffe0', 13); } }}); used = true; }
      else if (id === 'quake'){ let n = 0; for (const m of mobs){ if (m.dead || m.vanish || m.dummy && m !== t || Math.hypot(m.x - PET.x, m.y - PET.y) > 75 + m.def.r) continue; if (!m.aggro && m !== t) continue; petHit(m, 1.3 * g); n++; }
        if (n){ PET.atkT = 0; VFX.play('earthsplitBoom', {x:PET.x, y:PET.y, r:70}); SFX.play('boom'); used = true; } }
    }
    if (used){ PET.cd[id] = cd; say(); return true; }
  }
  return false;
}
/* a monster hits the pet */
function petHurt(m){
  const p = PD(); if (!p || PET.down > 0) return;
  const d = m.def, st = m.st || {};
  let dmg = rand(d.atk[0], d.atk[1]) * (m.enraged ? 1.5 : 1) * (st.atkDown > 0 ? 1 - st.atkDownPct : 1) - p.def * (PET.defT > 0 ? 1 + PET.defAmt : 1);
  dmg = Math.max(1, Math.round(dmg));
  PET.hp = Math.max(0, (PET.hp ?? p.mhp) - dmg); p.hp = PET.hp; PET.hurt = .2;
  addText(PET.x, PET.y - (MOB_H[p.type] || 26) - 4, String(dmg), '#ffb0a0', 12);
  if (PET.hp <= 0){ PET.down = 180; for (const o of mobs) if (o.foe === PET) o.foe = null;
    addText(PET.x, PET.y - (MOB_H[p.type] || 26) - 14, 'Knocked out!', '#ff9a8a', 13); log(L(`${petName(p)} ตาย · จะเกิดใหม่ในอีก 3 นาที (บัพและสกิลของสัตว์หยุดจนกว่าจะเกิดใหม่)`, `${petName(p)} fell · back in 3 minutes (its buffs and skills stop until then)`)); }
}
/* follow, chase, fight */
updPet = function(dt){
  if (!S.pet) return; petEnsure(); const p = PD(); if (!p) return;
  if (PET.hp == null || PET.type !== p.type){ PET.hp = p.hp ?? p.mhp; PET.type = p.type; PET.down = 0; }
  PET.t += dt; PET.atkT += dt; PET.hurt = Math.max(0, (PET.hurt || 0) - dt);
  for (const k in PET.cd) PET.cd[k] -= dt; PET.buffT -= dt; PET.defT -= dt;
  const t = !(PET.down > 0) ? petTarget() : null; PET.target = t;
  if (PET.down > 0){ PET.down -= dt; if (PET.down <= 0){ PET.hp = Math.round(p.mhp * .3); addText(PET.x, PET.y - 30, L('ลุกขึ้นแล้ว!', 'Back up!'), '#9fe8a0', 12); } }
  else if (!t && PET.hp < p.mhp){ PET.regT = (PET.regT || 0) + dt; if (PET.regT >= 1){ PET.regT = 0; PET.hp = Math.min(p.mhp, PET.hp + Math.max(1, Math.round(p.mhp * .04))); } }
  p.hp = PET.hp;
  const spd = Math.min(240, (P.ride ? SPEED * MOVES.ride.speed : SPEED) * 1.15);
  if (t){
    const reach = p.range + t.def.r * .6, d = Math.hypot(t.x - PET.x, t.y - PET.y);
    if (d > 420 || Math.hypot(P.x - PET.x, P.y - PET.y) > 420){ const sp = compSpot(PET, 1); PET.x = sp.x; PET.y = sp.y; }
    if (d > reach){ PET.moving = true; moveTo(PET, t.x + (PET.x - t.x) / (d || 1) * reach * .7, t.y + (PET.y - t.y) / (d || 1) * reach * .7, spd, dt); }
    else { PET.moving = false; PET.dir = SPR.dirFromVec(t.x - PET.x, t.y - PET.y); PET.atkCd -= dt;
      if (PET.atkCd <= 0){ PET.atkCd = p.delay; if (!petSkill(t)){ petShootOrStrike(t, 1); if (DER.pas.petTwin) later(.25, () => { if (!t.dead) petHit(t, 1); }); } } }
    return;
  }
  // no fight: the usual companion follow (sys/companion.js)
  const sp = compSpot(PET, 1), d = Math.hypot(sp.x - PET.x, sp.y - PET.y);
  if (d > 300){ PET.x = sp.x; PET.y = sp.y; }
  PET.moving = d > 6;
  if (PET.moving) moveTo(PET, sp.x, sp.y, Math.min(220, (P.ride ? SPEED * MOVES.ride.speed : SPEED) * (d > 60 ? 1.4 : d < 24 ? .5 : 1.05) * (PET.down > 0 ? .7 : 1)), dt);
  else compFace(PET);
};
/* drawing: attack pose, knocked-out fade, HP bar and grade badge while fighting */
drawPetW = function(g){
  if (!S.pet || !SHEETS[S.pet]) return; const p = PD();
  const x = PET.x - cam.x, y = PET.y - cam.y;
  shadowW(g, x, y, MOB[S.pet].r * .8);
  g.save(); if (PET.down > 0) g.globalAlpha = .45;
  const act = PET.atkT < .45 ? 'attack' : PET.hurt > 0 ? 'hurt' : PET.moving ? 'walk' : 'idle';
  SPR.draw(g, SHEETS[S.pet], act, PET.dir || 0, act === 'attack' ? PET.atkT : PET.t, x, y);
  g.restore();
  if (!p) return;
  const h = MOB_H[S.pet] || 26, w = 40, by = y - h - 9;
  if (SETTINGS.nameTags){   // v34: the caught pet's name over it, in its grade colour
    const nmT = nm(MOB[S.pet]), ny = by - 4; g.font = '800 9px Mali, sans-serif'; g.textAlign = 'center'; g.lineJoin = 'round';
    g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = 2.5; g.strokeText(nmT, x, ny); g.fillStyle = '#fff4d0'; g.fillText(nmT, x, ny); }
  const fight = PET.target || PET.hp < p.mhp || PET.down > 0; if (!fight) return;   // v34: a wider bar and a readable grade letter
  g.fillStyle = 'rgba(0,0,0,.65)'; g.fillRect(x - w / 2 - 1, by - 1, w + 2, 6);
  g.fillStyle = PET.down > 0 ? '#7a6a6a' : '#6fe08a'; g.fillRect(x - w / 2, by, w * Math.max(0, PET.hp / p.mhp), 4);
  g.font = '800 10px Mali, sans-serif'; g.textAlign = 'center'; g.fillStyle = PG[p.g].c; g.strokeStyle = 'rgba(0,0,0,.85)'; g.lineWidth = 2.5;
  g.strokeText(PG[p.g].k, x - w / 2 - 8, by + 5); g.fillText(PG[p.g].k, x - w / 2 - 8, by + 5);
};
/* monsters can fight the pet (mobs.js asks for this) */
const petIsFoe = f => f === PET && petAlive();
/* buff name for the howl */
if (typeof BUFF_TH !== 'undefined') BUFF_TH.petHowl = ['คำรามปลุกใจ (Pet)', 'Rallying Howl (Pet)'];

/* ---------- the pet card (bag → Pet tab) ---------- */
const PET_PIC = {};
function petPic(type){
  if (PET_PIC[type]) return PET_PIC[type];
  try { const c = document.createElement('canvas'); c.width = 120; c.height = 120; const g = c.getContext('2d');
    const bg = g.createRadialGradient(60, 70, 4, 60, 70, 80); bg.addColorStop(0, 'rgba(255,230,170,.35)'); bg.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = bg; g.fillRect(0, 0, 120, 120);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(60, 106, 26, 7, 0, 0, 7); g.fill();
    const fs = (SPR.MOBS[type] && SPR.MOBS[type].fs) || 60, s = Math.min(2.6, 110 / fs); g.setTransform(s, 0, 0, s, 60, 106); cthMob(g, type, 1);
    return (PET_PIC[type] = c.toDataURL()); } catch (e){ return ''; }
}
function petCardHTML(){
  petEnsure(); const p = PD(); if (!p) return '';
  const C = PCLS[p.cls], G = PG[p.g], hp = Math.round(PET.hp ?? p.mhp);
  const stat = (k, v) => `<div class="pst"><small>${k}</small><b>${v}</b></div>`;
  return `<div class="petcard" style="--gc:${G.c}">
    <div class="petpic"><img src="${petPic(p.type)}" alt="">${gradeTag(p.g, true)}</div>
    <div class="petinfo"><b class="petnm">${petName(p)} <small>Lv ${p.lv}</small></b>
      <div class="pettags"><span class="ptag" style="color:${G.c}">${L('ระดับ', 'Grade')} ${G.k} · ${L(G.th, G.en)}</span><span class="ptag">${L(C.th, C.en)}</span><span class="ptag">${elemName(p.elem)}</span><span class="ptag">${p.ranged ? L('โจมตีระยะไกล', 'Ranged') : L('ระยะประชิด', 'Melee')} ${Math.round(p.range)}</span></div>
      <div class="pbar petHp"><i style="width:${Math.round(hp / p.mhp * 100)}%"></i><span>HP ${fmtN(hp)} / ${fmtN(p.mhp)}${PET.down > 0 ? ` · ${L('หมดแรง', 'knocked out')} ${Math.ceil(PET.down)}s` : ''}</span></div>
      <div class="pstats">${stat('ATK', fmtN(p.atk))}${stat('DEF', fmtN(p.def))}${stat(L('ตีทุก', 'Every'), p.delay + 's')}${stat('CRIT', p.crit + '%')}</div></div>
    <div class="petsk"><div class="sec">${L('สกิล', 'Skills')}</div>${p.sk.map(([id, sg]) => `<div class="pskl">${gradeTag(sg)}<div><b>${L(PSK[id].th, PSK[id].en)}</b><small>${PSK[id].d(SKG[sg].m)} · CD ${Math.round(PSK[id].cd * (1 - sg * .06))}s</small></div></div>`).join('')}</div>
    <div class="petfoot"><small>${L('ช่วยโจมตีเป้าหมายของคุณและมอนที่ตีคุณ', 'Attacks your target and whatever attacks you')} · EXP +${Math.round((MOVES.pet.expBonus + (DER.pas.petExp || 0)) * 100)}%${DER.pas.petAtk ? ` · ${L('สกิลพราน', 'ranger bonus')} +${Math.round(DER.pas.petAtk * 100)}%` : ''}</small><button class="btn sm" data-release="1">${L('ปล่อย', 'Release')}</button></div>
  </div>`;
}

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'pets2', t:['สัตว์เลี้ยงที่จับได้', 'Captured pets'], b:() => `<p>${L('ตีมอนให้ HP เหลือไม่เกิน 30% แล้วกด T เพื่อจับ · Pet ที่จับได้จะสุ่ม', 'Bring a monster to 30% HP or less and press T · every catch rolls')}:</p>
  <table class="wkt"><tr><th>${L('ระดับ', 'Grade')}</th><th>${L('โอกาส', 'Odds')}</th><th>${L('ค่าพลัง', 'Stats')}</th><th>${L('สกิล', 'Skills')}</th></tr>${PG.map(g => `<tr><td style="color:${g.c}">${g.k} ${L(g.th, g.en)}</td><td>${g.w}%</td><td>×${g.mul}</td><td>${g.sk}</td></tr>`).join('')}</table>
  <p>${L('คลาส: นักสู้ (ATK สูง) · ผู้พิทักษ์ (HP/DEF สูง ดึงมอน) · จู่โจมไว (ตีเร็ว CRIT สูง) · นักเวท (เวทธาตุระยะไกล) · นักล่า (สมดุล CRIT ดี) — สุ่มตามธรรมชาติของสัตว์ · ค่าพลังมาจากตัวมอนเอง มอนเลเวลสูงจึงได้ Pet แรงกว่า · สกิลแต่ละอันสุ่มเกรด C–SS ของตัวเอง · LUK และมอนหัวหน้าฝูงช่วยให้ได้ระดับสูงขึ้น', 'Classes: Brawler (high ATK) · Guardian (high HP/DEF, draws monsters) · Swift (fast, high CRIT) · Mystic (ranged elemental spells) · Hunter (balanced, good CRIT) — drawn from the creature\'s nature · stats come from the monster itself, so higher-level catches are stronger · each skill rolls its own grade C–SS · LUK and elite monsters raise the odds')}</p>
  <p>${L('ระยะโจมตีของมอนเป็นไปตามธรรมชาติ: นักธนูยิงไกล ผี/นักเวทร่ายเวท งูฉกไกล ผู้ถือดาบเอื้อมไกลกว่ามือเปล่า สัตว์ใหญ่ไกลกว่าสัตว์เล็ก', 'Monsters attack by their nature: archers shoot from afar, spirits and casters cast, serpents strike from a coil, swords reach further than fists, big beasts further than small ones')}</p>`});
