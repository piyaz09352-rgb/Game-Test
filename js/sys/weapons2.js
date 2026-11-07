/* VAYRATHEN — js/sys/weapons2.js — (v159) every kind of weapon plays its own way
   Weapon kinds and what each one does on its own (on top of its numbers), shown on the item card as "ลักษณะเฉพาะ":
     ดาบมือเดียว   1H sword      smaller blade; a shield fits beside it · PARRY: 8% (+0.4% per refine) to turn aside a
                                 melee blow completely
     ดาบสองมือ     greatsword    a big blade held in both hands · ARMOUR PIERCE 25% · SEVERE: crits hit +30% harder ·
                                 BERSERK: below 40% HP every hit lands 20% harder
     คทามือเดียว   rod           small; a shield fits beside it · SUPPORT: healing and shields +15%, damage taken −6%
     ไม้เท้ายาว     longstaff     long, in both hands · OVERWHELMING: MATK +20% (spells take 10% longer to cast)
     มีดสั้น       dagger        one hand, a shield fits beside it · ARMOUR PIERCE 20% · VENOM: 15% per hit to poison
     คาตานะ        katana        long single blade in both hands (replaces the twin daggers) · SPEED: ASPD +6 ·
                                 CRIT +8%, crits +20% harder · BLEED: 12% per hit · EVASION: FLEE +10%, Perfect Dodge +5%
     สนับมือ        fist weapons  both hands always · ARMOUR PIERCE 30% · HEAVY: +8% damage · BLEED 10% ·
                                 MINI-STUN 8% (0.4 s, not bosses) · COMBO: every 3rd hit in a row on one target ×1.5
     ธนู           bow           both hands, needs arrows · ACCURATE: HIT +20 · RAPID: ASPD +4 · STEADY FIRE: each hit
                                 in a row on one target +3% damage, up to +18%
   Base numbers are fixed: two pieces of the same item and grade always have the same base stats (only the random
   options differ). Weapon power follows one curve by level, with a set ratio per kind, so each tier is a real step.
   Ceilings come slowly: CRIT past 35% counts half (at most 70%), Perfect Dodge at most 25%, damage taken −60% at most,
   cast time −70% at most. */
'use strict';

/* ---------- the katana takes the twin daggers' place ---------- */
const KATANA_TIER = [['ฝึกหัด', 'Apprentice'], ['เหล็กกล้า', 'Steel'], ['ยันต์เพลิง', 'Ember'], ['นิลกาฬ', 'Obsidian'], ['นาคราช', 'Naga'], ['สุริยเทพ', 'Solar'], ['อัคนีกาฬ', 'Infernal'], ['วชิระ', 'Vajra'], ['เทวราช', 'Devaraja'], ['หิมพานต์', 'Himmapan'], ['จักรพรรดิ', 'Chakravartin']];
const isKatana = st => !!(st && st.wtype === 'dagger' && (st.hands === '2h' || st.katana) && !st.claw && !st.twin);
// (v194) a two-handed dagger NAMED a twin dagger (the Shadow Tiger's own pair) is a pair of daggers, not a katana
for (const [id, it] of Object.entries(ITEMS)) if (/^k_/.test(id) && it && it.kind === 'gear' && it.st && it.st.wtype === 'dagger' && it.st.hands === '2h' && !it.st.katana && /มีดคู่|twin dagger/i.test(`${it.name || ''} ${it.en || ''}`)) it.st.twin = 1;   // class weapons only (the shop's katanas were named twin daggers before their rename)
function katanaRename(){
  for (const g of GEAR_LIST){ const m = /^w_tdagger(\d+)$/.exec(g[0]); if (!m) continue; const t = KATANA_TIER[+m[1]] || KATANA_TIER[0];
    g[2] = `คาตานะ${t[0]}`; g[3] = `${t[1]} Katana`; g[6].katana = 1; g[6].hands = '2h';
    for (const o of [GEAR[g[0]], ITEMS[g[0]]]) if (o){ o.name = g[2]; o.en = g[3]; if (o.st) o.st.katana = 1; } }
  for (const k in ITEMS){ const it = ITEMS[k]; if (it && it.base && /^w_tdagger\d+$/.test(it.base)){ it.name = ITEMS[it.base].name; it.en = ITEMS[it.base].en; if (it.st) it.st.katana = 1; } }
}
// (v208) the owner: a thief holds a dagger in EACH hand — the shop's twin daggers stay twin daggers (one blade in each
// hand), they are no longer turned into a katana. A katana found, forged or dropped (st.katana) is still a katana.
for (const g of GEAR_LIST) if (/^w_tdagger\d+$/.test(g[0])){ g[6].twin = 1; delete g[6].katana; for (const o of [GEAR[g[0]], ITEMS[g[0]]]) if (o && o.st){ o.st.twin = 1; delete o.st.katana; } }
for (const k in ITEMS){ const it = ITEMS[k]; if (it && it.st && (/^w_tdagger\d+$/.test(k) || (it.base && /^w_tdagger\d+$/.test(it.base)))){ it.st.twin = 1; delete it.st.katana; if (it.base && ITEMS[it.base]){ it.name = ITEMS[it.base].name; it.en = ITEMS[it.base].en; } } }
/* the thief line's own bare weapons are single daggers now (a katana is something you find, buy or forge) */
if (JOBS.rogue){ JOBS.rogue.weapon.name = 'มีดสั้นหางไก่'; JOBS.rogue.weapon.en = 'Rooster-tail Dagger'; }
if (JOBS.bandit){ JOBS.bandit.weapon.name = 'มีดสั้นเงาเสือ'; JOBS.bandit.weapon.en = 'Tiger Shadow Dagger'; }
if (typeof HANDS_RULE !== 'undefined') HANDS_RULE.dagger = n => (/คาตานะ|katana|คู่|twin/i.test(n) ? '2h' : '1h');
if (typeof handsFixAll === 'function') handsFixAll();
if (typeof BAG_SUB !== 'undefined'){ const r = BAG_SUB.find(b => b[0] === 'dagger2'); if (r){ r[1] = 'มีดคู่'; r[2] = 'Twin daggers'; } }   // (v208)
/* the hero holds a katana in both hands (no second blade) */
if (typeof SPR !== 'undefined' && SPR.heroKey){ const _hk = SPR.heroKey;
  SPR.heroKey = function(job, gear = {}){ const key = _hk.apply(this, arguments), cfg = SPR.CHARS && SPR.CHARS[key];
    if (cfg && cfg.weapon === 'dagger'){ const wi = gear && gear.weapon && ITEMS[gear.weapon]; const kat = !!(wi && isKatana(wi.st));
      const line = typeof jobChain === 'function' && JOBS[job] ? (() => { let j = job; while (JOBS[j] && JOBS[j].parent && JOBS[j].parent !== 'novice') j = JOBS[j].parent; return j; })() : '';
      cfg.katana = kat; if (kat){ cfg.offWeapon = false; cfg.shield = null; }
      else if (wi && wi.st && wi.st.hands === '2h'){ cfg.offWeapon = true; cfg.shield = null; }   // (v208) twin daggers: a blade in each hand
      else if (!wi && line === 'rogue'){ cfg.offWeapon = true; cfg.shield = null; }               // (v208) the thief line's own weapon is a pair of daggers
      else cfg.offWeapon = false; }
    return key; }; }

/* ---------- one power curve for every weapon kind ---------- */
const WPN_CURVE = L => 22 + L * 1.25;
const WPN_KIND = st => {
  if (!st || !st.wtype) return null; const two = st.hands === '2h';
  if (st.wtype === 'sword') return two ? 'gsword' : 'sword';
  if (st.wtype === 'staff') return two ? 'lstaff' : 'rod';
  if (st.wtype === 'dagger') return st.claw ? 'fist' : isKatana(st) ? 'katana' : st.twin ? 'twin' : 'dagger';
  return st.wtype; };
const WPN_RATIO = {sword:[1, 0], gsword:[1.24, 0], dagger:[.84, 0], katana:[1.1, 0], twin:[1.08, 0], fist:[1, 0], bow:[.94, 0], rod:[.45, 1.2], lstaff:[.5, 1.5]};
for (const g of GEAR_LIST){ if (g[1] !== 'weapon' || !g[6] || g[6].line) continue; const k = WPN_KIND(g[6]), r = WPN_RATIO[k]; if (!r) continue;
  const c = WPN_CURVE(g[4]); g[6].watk = Math.round(c * r[0]); if (r[1]) g[6].wmatk = Math.round(c * r[1]);
  for (const o of [GEAR[g[0]], ITEMS[g[0]]]) if (o && o.st){ o.st.watk = g[6].watk; if (r[1]) o.st.wmatk = g[6].wmatk; } }
/* class weapons (boss-only) stay a step above the open ones of their level */
for (const g of GEAR_LIST){ if (g[1] !== 'weapon' || !g[6] || !g[6].line) continue; const k = WPN_KIND(g[6]), r = WPN_RATIO[k]; if (!r) continue;
  const c = WPN_CURVE(g[4]) * 1.08; g[6].watk = Math.max(g[6].watk || 0, Math.round(c * r[0])); if (r[1]) g[6].wmatk = Math.max(g[6].wmatk || 0, Math.round(c * r[1]));
  for (const o of [GEAR[g[0]], ITEMS[g[0]]]) if (o && o.st){ o.st.watk = g[6].watk; if (r[1]) o.st.wmatk = g[6].wmatk; } }

/* ---------- fixed base stats ---------- */
{ const _is = instStats; instStats = function(base, r, opts){ return _is.call(this, base, r, opts, null); }; }
if (typeof S !== 'undefined' && S && S.inst) for (const k in S.inst){ const d = S.inst[k]; if (d && ITEMS[d.b]){ d.q = {}; d.st = instStats(ITEMS[d.b], d.r || 0, d.o || []); regInst(k, d); } }

/* ---------- what you hold right now ---------- */
function wkNow(){
  const id = S && S.gear && S.gear.weapon, it = id && ITEMS[id], jt = JOBS[S.job] && JOBS[S.job].weapon;
  if (it && it.st && typeof canWield === 'function' && canWield(it)) return {k:WPN_KIND(it.st), rf:it.rf || 0};
  if (!jt) return {k:null, rf:0};
  return {k:WPN_KIND({wtype:jt.type, hands:jt.hands, claw:jt.type === 'dagger' && /กรงเล็บ|claw/i.test(jt.name + jt.en)}), rf:S.refine || 0};
}
const WTRAIT = {
  sword:{th:'ปัดป้อง: 8% (+0.4%/ขั้นตีบวก) ปัดการโจมตีระยะประชิดทิ้ง · ใช้คู่โล่ได้', en:'Parry: 8% (+0.4% per refine) to turn aside a melee blow · shield allowed'},
  gsword:{th:'เจาะเกราะ 25% · รุนแรง: คริแรงขึ้น 30% · บ้าคลั่ง: HP ต่ำกว่า 40% ตีแรงขึ้น 20%', en:'Armour pierce 25% · Severe: crits +30% · Berserk: below 40% HP +20% damage'},
  rod:{th:'สนับสนุน: ฮีลและโล่ +15% · รับดาเมจ −6% · ใช้คู่โล่ได้', en:'Support: heals and shields +15% · damage taken −6% · shield allowed'},
  lstaff:{th:'ดาเมจมหาศาล: MATK +20% · ร่ายช้าลง 10%', en:'Overwhelming: MATK +20% · casting 10% slower'},
  dagger:{th:'เจาะเกราะ 20% · พิษ: 15% ต่อครั้งที่ตี · ใช้คู่โล่ได้', en:'Armour pierce 20% · Venom: 15% per hit · shield allowed'},
  twin:{th:'มีดคู่ (มือละเล่ม): เจาะเกราะ 20% · พิษ 15% ต่อครั้ง · เร็ว: ASPD +4 · CRIT +5%', en:'Twin daggers (one in each hand): armour pierce 20% · venom 15% per hit · speed: ASPD +4 · CRIT +5%'},
  katana:{th:'เร็ว: ASPD +6 · CRIT +8% คริแรงขึ้น 20% · เลือดออก 12% ต่อครั้ง · หลบ: FLEE +10% หลบแน่นอน +5%', en:'Speed: ASPD +6 · CRIT +8%, crits +20% · Bleed 12% per hit · Evasion: FLEE +10%, Perfect Dodge +5%'},
  fist:{th:'เจาะเกราะ 30% · หนัก +8% · เลือดไหล 10% · มึนสั้น 8% · คอมโบ: ทุกหมัดที่ 3 ต่อเนื่อง ×1.5', en:'Armour pierce 30% · Heavy +8% · Bleed 10% · Mini-stun 8% · Combo: every 3rd hit in a row ×1.5'},
  bow:{th:'แม่นยำ: HIT +20 · ยิงเร็ว: ASPD +4 · ยิงต่อเนื่อง: ตีเป้าเดิมต่อกัน +3% ต่อครั้ง สูงสุด +18%', en:'Accurate: HIT +20 · Rapid: ASPD +4 · Steady fire: +3% per hit in a row on one target, up to +18%'}
};
const WK_PIERCE = {gsword:.25, dagger:.2, twin:.2, fist:.3};

/* numbers that live in DER */
{ const _dv = derive;
  derive = function(){ const r = _dv.apply(this, arguments); if (!DER || !DER.pas || !S) return r;
    const {k} = wkNow(), pas = DER.pas; DER.wk = k;
    if (k === 'rod'){ pas.healPow = (pas.healPow || 0) + .15; pas.wkRed = .06; }
    if (k === 'lstaff'){ DER.matk = Math.round(DER.matk * 1.2); DER.castMul *= 1.1; }
    if (k === 'katana'){ DER.aspd = Math.min(ASPD_CAP, DER.aspd + 6); DER.crit = +(DER.crit + 8).toFixed(1); DER.critDmg += .2; DER.flee = Math.round(DER.flee * 1.1); pas.dodge = (pas.dodge || 0) + .05; }
    if (k === 'twin'){ DER.aspd = Math.min(ASPD_CAP, DER.aspd + 4); DER.crit = +(DER.crit + 5).toFixed(1); }   // (v208)
    if (k === 'gsword') DER.critDmg += .3;
    if (k === 'bow'){ DER.hit += 20; DER.aspd = Math.min(ASPD_CAP, DER.aspd + 4); }
    DER.interval = aspdIv(DER.aspd);
    // ceilings that come slowly
    DER.critRaw = DER.crit; DER.crit = +Math.min(70, DER.crit <= 35 ? DER.crit : 35 + (DER.crit - 35) * .5).toFixed(1);
    pas.dodge = Math.min(.25, pas.dodge || 0);
    if (pas.dmgRed) pas.dmgRed = Math.min(.6, pas.dmgRed);
    DER.castMul = Math.max(.3, DER.castMul);
    return r; }; }

/* armour pierce, berserk, heavy fists, steady fire and fist combos: the physical hit */
const WKC = {tgt:null, chain:0};
{ const _pd = physDamage;
  physDamage = function(m, mult){ const k = DER && DER.wk, pierce = WK_PIERCE[k] || 0, d = m && m.def;
    const save = d ? d.def : 0; if (d && pierce) d.def = save * (1 - pierce);
    let res; try { res = _pd.apply(this, arguments); } finally { if (d && pierce) d.def = save; }
    if (!res || res.miss || !res.dmg) return res;
    let f = 1;
    if (k === 'gsword' && S.hp < DER.maxhp * .4) f *= 1.2;
    if (k === 'fist') f *= 1.08;
    if (WKC.tgt === m) WKC.chain++; else { WKC.tgt = m; WKC.chain = 1; }
    if (k === 'bow') f *= 1 + Math.min(.18, (WKC.chain - 1) * .03);
    if (k === 'fist' && WKC.chain % 3 === 0){ f *= 1.5; res.combo = true; }
    if (f !== 1) res.dmg = Math.max(1, Math.round(res.dmg * f));
    return res; }; }
/* what the blade leaves behind: venom, bleeding, a short stun */
{ const _ad = applyDamage;
  applyDamage = function(m, res, sk){ const k = DER && DER.wk, live = m && !m.dead && res && !res.miss && !res.magic && !res.poison && !res.bleed && res.dmg > 0 && !m.pvp;
    const out = _ad.apply(this, arguments);
    if (live && !m.dead && !m.def.boss){
      const roll = p => Math.random() < p, st = m.st || (m.st = {});
      if ((k === 'dagger' || k === 'twin') && roll(.15)){ applyStatus(m, {poison:[.3, 4]}); addText(m.x, m.y - MOB_H[m.type] - 18, L('พิษ', 'Venom'), '#7fe05a', 12); }
      if ((k === 'katana' && roll(.12)) || (k === 'fist' && roll(.1))){ st.bleed = 4; st.bleedDps = DER.atk * .3; st.bleedT = 1; addText(m.x, m.y - MOB_H[m.type] - 18, L('เลือดออก', 'Bleed'), '#ff4a5a', 12); }
      if (k === 'fist' && roll(.08)) applyStatus(m, {stun:.4}); }
    if (live && res.combo) addText(m.x, m.y - MOB_H[m.type] - 30, L('คอมโบ!', 'Combo!'), '#ffd56a', 13);
    return out; }; }
{ const _us = updStatus;
  updStatus = function(m, dt){ const s = m.st;
    if (s && s.bleed > 0){ s.bleed -= dt; s.bleedT -= dt; if (s.bleedT <= 0){ s.bleedT = 1; applyDamage(m, {dmg:Math.max(1, Math.round(s.bleedDps)), poison:true, bleed:true}); const t = texts[texts.length - 1]; if (t) t.col = '#ff4a5a'; } }
    return _us.apply(this, arguments); }; }
/* parry with a one-handed sword; the rod's support softens every blow */
{ const _ma = mobAttack;
  mobAttack = function(m, mult = 1, noDodge = false){
    if (DER && DER.wk === 'sword' && !noDodge && !m.def.range && !P.dead && Math.random() < .08 + Math.min(15, wkNow().rf) * .004){
      m.lunge = .2; m.atkT = 0; addText(P.x, P.y - 48, L('ปัดป้อง!', 'Parry!'), '#e8f0ff', 14); SFX.play('shieldhit'); return; }
    if (DER && DER.pas && DER.pas.wkRed){ const hp0 = S.hp; const r = _ma.apply(this, arguments); const lost = hp0 - S.hp; if (lost > 0 && S.hp > 0) S.hp = Math.min(DER.maxhp, S.hp + Math.round(lost * DER.pas.wkRed)); return r; }
    return _ma.apply(this, arguments); }; }

/* ---------- the item card says it ---------- */
{ const _gs = gearStatText;
  gearStatText = function(st){ let s = _gs.apply(this, arguments);
    if (isKatana(st)) s = s.replace(/มีดคู่/g, 'คาตานะ').replace(/Twin daggers/g, 'Katana');
    const k = st && st.watk != null ? WPN_KIND(st) : null, t = k && WTRAIT[k];
    return t ? `${s} · ${L('ลักษณะเฉพาะ', 'Trait')}: ${L(t.th, t.en)}` : s; }; }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'weapons2', t:['ชนิดอาวุธและลักษณะเฉพาะ', 'Weapon kinds and traits'], b:() => `<ul>${Object.entries(WTRAIT).map(([k, t]) => `<li><b>${L(...({sword:['ดาบมือเดียว', '1H sword'], gsword:['ดาบสองมือ', 'Greatsword'], rod:['คทามือเดียว', 'Rod'], lstaff:['ไม้เท้ายาว (สองมือ)', 'Longstaff'], dagger:['มีดสั้น', 'Dagger'], katana:['คาตานะ (สองมือ)', 'Katana'], fist:['สนับมือ (สองมือ)', 'Fist weapons'], bow:['ธนู (สองมือ + ลูกธนู)', 'Bow']})[k])}</b> — ${L(t.th, t.en)}</li>`).join('')}</ul>
  <p>${L('ค่าพื้นฐานของไอเท็มไม่สุ่ม (ชิ้นเดียวกันเกรดเดียวกันได้เท่ากัน) · ออปชั่นยังสุ่ม · CRIT เกิน 35% นับครึ่ง สูงสุด 70% · หลบแน่นอนสูงสุด 25% · ลดดาเมจสูงสุด 60%', 'Base stats are fixed (same item and grade = same numbers) · options still roll · CRIT past 35% counts half, 70% at most · Perfect Dodge 25% at most · damage reduction 60% at most')}</p>`});
