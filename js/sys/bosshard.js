/* VAYRATHEN — js/sys/bosshard.js — (v55) harder bosses, rarer crits, useful pets, armour penetration
   BOSSES
     · drawn 1.6× bigger (render.js reads BOSS_SZ) with a taller name/HP plate and a wider body to hit.
     · summon more minions, more often: 4 a call (+2 for every other player near the boss, +1 per phase), up to 8
       alive (+3 per player near), and a call on their own every 20 / 16 / 13 / 10 s by phase while they fight.
     · hit for real (bossPunch, used by mobAttack): a share of a frail hero's HP at the boss's level,
       melee 30% · skills 125% × the skill's power, × the phase multiplier, then cut by your defences:
       hard DEF (gear) → % · soft DEF (VIT) → flat · skills also weigh MDEF the same way · damage reduction last.
       A frail class with no defensive gear or stats dies to a skill; a geared tank survives it but feels every hit.
       The old floor (a % of your Max HP) stays and is higher: 6 / 8 / 10 / 13 %.
   CRIT
     · every monster has a crit shield (Lv × 0.1, bosses +5) taken off your CRIT. (v100) No cap on crit chance.
   PETS (caught)
     · hit with their own ATK + half of yours (ATK or MATK, the higher), and take hits with half your DEF added.
     · knocked out → back after 3 minutes; until then every pet bonus stops (pet passives, EXP bonus, its buffs).
   ARMOUR PENETRATION
     · Ignore DEF % (all / boss / normal monsters / by race), Armor Pierce (flat DEF), Ignore MDEF % (all / boss / normal / by race).
     · sources: random options on weapons and accessories, and race cards (ignore DEF of their prey race).
     · the Status details drawer lists hard/soft DEF and MDEF, the reduction they give, and every penetration stat. */
'use strict';

const BOSS_SZ = 1.6;
const BH = {melee:.30, skill:1.25, cap:100, sumEvery:[20, 16, 13, 10]};
if (typeof FURY !== 'undefined') FURY.minHit = [.06, .08, .10, .13];

/* boss bodies: taller plates, a wider body (boss species are unique, so this touches bosses only) */
for (const k in MOB){ const d = MOB[k]; if (!d.boss || d.__bz) continue; d.__bz = 1; if (MOB_H[k]) MOB_H[k] = Math.round(MOB_H[k] * 1.55); d.r = Math.round(d.r * 1.35); }

/* ---------- defences ---------- */
const bhSoftDef = () => Math.floor(((DER && DER.b && DER.b.vit) || 0) / 2) + 4;
const bhSoftMdef = () => Math.floor(((DER && DER.b && DER.b.int) || 0) / 2);
const bhHardDef = () => Math.max(0, (DER.def || 0) + (typeof buffDef === 'function' ? buffDef() : 0) - bhSoftDef());
const bhHardMdef = () => Math.max(0, (DER.mdef || 0) - bhSoftMdef());
const bhRed = h => Math.min(.7, h / (h + 120));   // (v100) hard DEF/MDEF → % less damage, less and less per point, 70% at most
const bhDmgRed = () => (typeof clRed === 'function' ? clRed() : 0);
/* a frail hero's HP at this level (a caster with little VIT and plain gear) */
const bhRefHP = lv => (35 + lv * 6.3) * (1 + lv / 500) + lv * 3;
const bhPlayersNear = m => { let n = 0; if (typeof NET !== 'undefined' && NET.ghosts) for (const g of NET.ghosts.values()) if (g.q && !g.q.dead && Math.hypot(g.x - m.x, g.y - m.y) < 650) n++; return Math.min(4, n); };

function bossPunch(m, mult = 1, skill = false){
  const lv = m.def.lvl || 1, ph = typeof bossAtkMul === 'function' ? bossAtkMul(m) : 1;
  let raw = bhRefHP(lv) * (skill ? BH.skill : BH.melee) * mult * ph;
  const pr = bhRed(bhHardDef()), mr = bhRed(bhHardMdef());
  raw *= skill ? 1 - (pr + mr) / 2 : 1 - pr;
  raw -= skill ? (bhSoftDef() + bhSoftMdef()) / 2 : bhSoftDef();
  raw *= 1 - bhDmgRed();
  const floor = typeof bossMinHit === 'function' ? bossMinHit(m) * Math.min(1.5, mult) : 1;
  return Math.max(1, Math.round(Math.max(raw, floor)));
}

/* ---------- more minions, more often ---------- */
const BOSS_SUM = {
  n:m => 4 + bhPlayersNear(m) * 2 + ((m.fz && m.fz.phase) || 1) - 1,
  cap:m => 8 + bhPlayersNear(m) * 3
};
{ const _ub = updBoss;
  updBoss = function(m, dt){ const r = _ub.apply(this, arguments);
    if (!m.dead && m.aggro && !(m.fz && (m.fz.act || m.fz.hidden)) && Math.hypot(P.x - m.x, P.y - m.y) < 650 && !P.dead){
      m.sumT = (m.sumT == null ? 8 : m.sumT) - dt;
      if (m.sumT <= 0){ m.sumT = BH.sumEvery[(((m.fz && m.fz.phase) || 1) - 1)] || 20; try { bossCast(m, 'summon'); } catch (e) {} } }
    return r; }; }

/* ---------- penetration totals (gear options, cards, buffs, passives), cached briefly ---------- */
const PEN = {t:-9, v:{}};
function penAll(){
  if (T - PEN.t < .5 && PEN.t <= T) return PEN.v;
  const v = {}, add = (k, x) => { if (!/^(defIgn|mdefIgn|pierce)/.test(k) || !(+x > 0)) return; k = k.replace(/Pct$/, ''); x = +x; if (k !== 'pierce' && x >= 1) return; v[k] = (v[k] || 0) + x; };   // random options carry …Pct (rarity.js rounds anything else)
  for (const id of Object.values((S && S.gear) || {})){ const it = id && ITEMS[id]; if (!it) continue; for (const k in it) add(k, it[k]); if (it.st) for (const k in it.st) add(k, it.st[k]); }
  if (S && S.slots && typeof CARDS !== 'undefined') for (const sl in S.slots){ const c = CARDS[S.slots[sl]]; if (c && c.bonus) for (const k in c.bonus) add(k, c.bonus[k]); }
  for (const b of Object.values((P && P.buffs) || {})) if (b) for (const k in b) add(k, b[k]);
  if (DER && DER.pas) for (const k in DER.pas) add(k, DER.pas[k]);
  PEN.t = T; return PEN.v = v;
}
const penIgn = (pre, d) => { const v = penAll(); return Math.min(.7, (v[pre] || 0) + (v[pre + 'Race_' + d.race] || 0) + (d.boss ? v[pre + 'Boss'] || 0 : v[pre + 'Normal'] || 0)); };
const critShield = d => +(((d.lvl || 1) * .1) + (d.boss ? 5 : 0)).toFixed(1);

{ const _pd = physDamage;
  physDamage = function(m, mult, elem){
    const d = m && m.def; if (!d || !DER) return _pd.apply(this, arguments);
    const c0 = DER.crit, def0 = d.def, dp0 = d.defPct, ign = penIgn('defIgn', d), pierce = penAll().pierce || 0;
    DER.crit = Math.max(0, Math.min(BH.cap, c0 - critShield(d)));
    if (ign > 0 || pierce > 0){ d.def = Math.max(0, (def0 || 0) * (1 - ign) - pierce); if (dp0) d.defPct = dp0 * (1 - ign); }
    try { return _pd.apply(this, arguments); } finally { DER.crit = c0; d.def = def0; d.defPct = dp0; } }; }
{ const _md = magicDamage;
  magicDamage = function(m, mult, elem){
    const d = m && m.def; if (!d) return _md.apply(this, arguments);
    const ign = penIgn('mdefIgn', d); if (!(ign > 0)) return _md.apply(this, arguments);
    const lv0 = d.lvl, dp0 = d.defPct; d.lvl = lv0 * (1 - ign); if (dp0) d.defPct = dp0 * (1 - ign);
    try { return _md.apply(this, arguments); } finally { d.lvl = lv0; d.defPct = dp0; } }; }

/* random options and race cards can carry penetration */
if (typeof AFFIX !== 'undefined') AFFIX.push(['defIgnPct', [3, 0, 0, 1], L => +(.03 + Math.min(.07, L / 2500)).toFixed(3)], ['mdefIgnPct', [3, 0, 1, 1], L => +(.03 + Math.min(.07, L / 2500)).toFixed(3)],
  ['pierce', [3, 0, 0, 1], L => 2 + Math.floor(L / 15)]);
if (typeof gearStatText === 'function'){ const _gs = gearStatText;
  gearStatText = function(st){ let s = _gs.apply(this, arguments); const out = [];
    if (st.defIgnPct) out.push(`Ignore DEF +${+(st.defIgnPct * 100).toFixed(1)}%`);
    if (st.mdefIgnPct) out.push(`Ignore MDEF +${+(st.mdefIgnPct * 100).toFixed(1)}%`);
    if (st.pierce) out.push(`Armor Pierce +${st.pierce}`);
    if (!out.length) return s; return s ? `${s} · ${out.join(' · ')}` : out.join(' · '); }; }

/* ---------- pets: scale with the hero, 3-minute knock-out ---------- */
const PET_DOWN = 180;
const bhPow = () => Math.max(DER.atk * (1 + buffSum('atkPct')), DER.matk * (1 + buffSum('matkPct')));
const bhPetWrap = fn => function(){ const p = PD(); if (!p || !DER) return fn.apply(this, arguments); const a0 = p.atk; p.atk = Math.round(a0 + bhPow() * .5);
  try { return fn.apply(this, arguments); } finally { p.atk = a0; } };
if (typeof petHit === 'function'){ petHit = bhPetWrap(petHit); petSkill = bhPetWrap(petSkill); }
if (typeof petHurt === 'function'){ const _ph = petHurt;
  petHurt = function(m){ const p = PD(); if (!p || PET.down > 0) return _ph.apply(this, arguments); const d0 = p.def; p.def = Math.round((d0 || 0) + (DER.def || 0) * .5);
    try { _ph.apply(this, arguments); } finally { p.def = d0; }
    if (PET.down > 0){ PET.down = Math.max(PET.down, PET_DOWN - 1); petBuffsOff(); } }; }
const petDownNow = () => !!(S && S.pet && typeof PET !== 'undefined' && PET.down > 0);
function petBuffsOff(){ if (P.buffs.petHowl){ delete P.buffs.petHowl; } P.petBuff = 0; PET.buffT = 0; PET.defT = 0; derive(); if (typeof renderBuffs === 'function') renderBuffs(); }
{ const _dv = derive; derive = function(){ const r = _dv.apply(this, arguments);
  if (DER && DER.pas && petDownNow()){ const pas = {...DER.pas}; for (const k in pas) if (/^pet/.test(k)) pas[k] = 0; DER.pas = pas; }
  if (typeof MOVES !== 'undefined' && MOVES.pet){ if (MOVES.pet.__xb == null) MOVES.pet.__xb = MOVES.pet.expBonus; MOVES.pet.expBonus = petDownNow() ? 0 : MOVES.pet.__xb; }
  return r; }; }
if (typeof updPet === 'function'){ const _up = updPet;
  updPet = function(){ const was = petDownNow(); const r = _up.apply(this, arguments); const now = petDownNow();
    if (was !== now){ derive(); if (!now){ const p = PD(); if (p) log(L(`${petName(p)} เกิดใหม่แล้ว · บัพและสกิลกลับมาทำงาน`, `${petName(p)} is back · its buffs and skills work again`), 'g'); } }
    return r; }; }

/* ---------- the Status details drawer: defence and penetration ---------- */
if (typeof sdHTML === 'function'){ const _sd = sdHTML;
  sdHTML = function(){ const h = _sd.apply(this, arguments); if (!DER) return h;
    const v = penAll(), pc = x => `${Math.round((x || 0) * 1000) / 10}%`, row = (a, b) => (typeof sdRow === 'function' ? sdRow(a, b) : `<div class="sdr"><span>${a}</span><b>${b}</b></div>`);
    const hd = bhHardDef(), sd = bhSoftDef(), hm = bhHardMdef(), sm = bhSoftMdef();
    const races = Object.keys(v).filter(k => /^defIgnRace_/.test(k)).map(k => row(`Ignore DEF · ${(typeof RACE_EN !== 'undefined' && RACE_EN[k.slice(11)]) || k.slice(11)}`, pc(v[k])))
      .concat(Object.keys(v).filter(k => /^mdefIgnRace_/.test(k)).map(k => row(`Ignore MDEF · ${(typeof RACE_EN !== 'undefined' && RACE_EN[k.slice(12)]) || k.slice(12)}`, pc(v[k]))));
    const sec = `<div class="sdsec"><h4>Defense (Hard / Soft)</h4><div>${[
      row('Hard DEF (gear)', `${hd} <small>−${pc(bhRed(hd))}</small>`), row('Soft DEF (VIT)', `${sd} <small>flat</small>`),
      row('Hard MDEF (gear)', `${hm} <small>−${pc(bhRed(hm))}</small>`), row('Soft MDEF (INT)', `${sm} <small>flat</small>`),
      row('Damage Reduction', pc(bhDmgRed()))].join('')}</div></div>
      <div class="sdsec"><h4>Armor Penetration</h4><div>${[
      row('Ignore DEF (all)', pc(v.defIgn)), row('Ignore DEF · Boss', pc(v.defIgnBoss)), row('Ignore DEF · Normal', pc(v.defIgnNormal)), row('Armor Pierce (flat DEF)', `+${v.pierce || 0}`),
      row('Ignore MDEF (all)', pc(v.mdefIgn)), row('Ignore MDEF · Boss', pc(v.mdefIgnBoss)), row('Ignore MDEF · Normal', pc(v.mdefIgnNormal)), ...races].join('')}</div></div>
      <div class="sdsec"><h4>Critical</h4><div>${[
      row('Critical Cap', L('ไม่มี', 'None')), row('Monster Crit Shield', `Lv × 0.1 <small>(Boss +5)</small>`),
      row(`vs Lv ${S.lvl} monster`, `${Math.max(0, Math.min(BH.cap, DER.crit - S.lvl * .1)).toFixed(1)}%`)].join('')}</div></div>`;
    const i = h.lastIndexOf('</div>'); return i < 0 ? h + sec : h.slice(0, i) + sec + h.slice(i); }; }

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'bosshard', t:['บอสโหด คริ เจาะเกราะ', 'Hard bosses, crits, penetration'], b:() => `<ul>
  <li>${L('บอสตัวใหญ่ขึ้น เสกลูกสมุนครั้งละ 4+ ตัว (มีผู้เล่นอื่นใกล้ ๆ ยิ่งเยอะ) และเสกเองทุก 10–20 วินาที', 'Bosses are bigger, call 4+ minions at a time (more with other players near) and call again every 10–20 s')}</li>
  <li>${L('สกิลบอสแรงพอฆ่าอาชีพสายบางที่ไม่มีของป้องกันได้ในทีเดียว · DEF MDEF และลดดาเมจช่วยได้', 'Boss skills can one-shot frail classes without defence · DEF, MDEF and damage reduction help')}</li>
  <li>${L('มอนทุกตัวมีค่าต้านคริ (Lv × 0.1 บอส +5) · โอกาสคริไม่มีเพดาน', 'Every monster has a crit shield (Lv × 0.1, bosses +5) · crit chance has no cap')}</li>
  <li>${L('เจาะเกราะ: Ignore DEF/MDEF % (ทั้งหมด บอส มอนธรรมดา ตามเผ่า) และ Armor Pierce · ดูได้ในรายละเอียดสถานะ', 'Penetration: Ignore DEF/MDEF % (all, boss, normal, by race) and Armor Pierce · see the Status details')}</li>
  <li>${L('สัตว์ที่จับได้ตีแรงตามตัวละคร · ตายแล้วเกิดใหม่ใน 3 นาที ระหว่างนั้นบัพและสกิลของมันหยุด', 'Caught pets scale with you · when one falls it returns in 3 minutes and its bonuses stop until then')}</li></ul>`});

/* ---------- (v55) ASPD: stats alone stop at ASPD_STAT (180); flat ASPD from gear options and Swift cards takes it up to ASPD_CAP (190) ---------- */
function aspdFlat(){ let v = 0;
  for (const id of Object.values((S && S.gear) || {})){ const it = id && ITEMS[id]; if (it && it.st && +it.st.aspd) v += +it.st.aspd; }
  if (S && S.slots && typeof CARDS !== 'undefined') for (const sl in S.slots){ const c = CARDS[S.slots[sl]]; if (c && c.bonus && +c.bonus.aspd) v += +c.bonus.aspd; }
  return v; }
{ const _dv = derive; derive = function(){ const r = _dv.apply(this, arguments);
  if (DER){ const f = aspdFlat(); if (f){ DER.aspd = Math.min(ASPD_CAP, DER.aspd + f); DER.interval = aspdIv(DER.aspd); if ('_iv' in DER) DER._iv = DER.interval; } }
  return r; }; }
if (typeof AFFIX !== 'undefined') AFFIX.push(['aspd', [3, 0, 0, 2], L => 1 + Math.floor(L / 60)]);
if (typeof gearStatText === 'function'){ const _g2 = gearStatText; gearStatText = function(st){ const s = _g2.apply(this, arguments); if (!st || !st.aspd || /ASPD/.test(s)) return s; return s ? `${s} · ASPD +${st.aspd}` : `ASPD +${st.aspd}`; }; }
