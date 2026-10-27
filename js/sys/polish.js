/* VAYRATHEN — js/sys/polish.js — the round of "what's missing"
   · Tier-4 starter kits (Lv 150 weapon, armour, crown, seal) for all 7 tier-4 classes, given at the job change
   · Tier-4 looks: each class gets its own signature pieces (pauldrons, crown, necklace, cape)
   · Class weapons get their own icon colour and a badge, so they are told apart from shop weapons
   · Monster cards gain one of the new stats, by place: weapon → element damage of the monster's element, armour/legs →
     damage reduction, head → faster casting, shield/mouth → critical resistance, ears → stronger healing, face → shorter cooldowns
   · Random options on gear can roll the new stats too (Critical Resistance, Damage Reduction, Cast Time, Healing, Cooldown)
   · Auto per class: the warrior line taunts first when 2+ monsters are on you; the Archsage saves grand spells for 3+ monsters
   · The bag comparison shows Critical Resistance and Damage Reduction
   · Party roles: with a tank (warrior line), a healer (healer line) and a damage dealer nearby, everyone in the group deals
     +20% to bosses and takes −10% from them ("ทีมครบบทบาท")
   · Wiki: one page per class line (role, skills per tier, class weapon) */
'use strict';

/* ---------- tier-4 starter kits ---------- */
const K4 = {
  tigershade:[['มีดคู่พยัคฆ์เงาประจำตัว', 'Shadow Tiger Twin Knives'], 'w_tdagger6', 'agi', 'luk', '2h'],
  bulwark:[['ดาบขุนพลประจำตำแหน่ง', 'Bulwark Service Blade'], 'w_sword6', 'vit', 'str', '1h'],
  archsage:[['คทาจตุธาตุประจำตำแหน่ง', 'Archsage Service Staff'], 'w_lstaff6', 'int', 'dex', '2h'],
  ringlord:[['นวมเจ้าสังเวียน', 'Ring Lord Gloves'], 'w_glove6', 'str', 'agi', '2h'],
  sylvan:[['ธนูจ้าวพนาไพร', 'Sylvan Lord Bow'], 'w_bow6', 'dex', 'agi', '2h'],
  divinehealer:[['ไม้เท้าเวชบดี', 'Divine Physician Staff'], 'w_lstaff6', 'int', 'vit', '2h'],
  himmaemperor:[['คทาจักรพรรดิ', "Emperor's Sceptre"], 'w_lstaff6', 'int', 'dex', '2h']
};
for (const job in K4){ const J = JOBS[job]; if (!J || typeof KIT === 'undefined') continue;
  const [wN, wArt, s1, s2, hands] = K4[job], wt = J.weapon.type, caster = wt === 'staff', lv = 150, ids = ['w', 'a', 'h', 'x'].map(s => `k_${job}_${s}`);
  const wst = {wtype:wt, hands, watk:J.weapon.atk + 25, [s1]:4, ...(caster ? {wmatk:(J.weapon.matk || 0) + 30} : {}), ...(wt === 'dagger' && hands === '2h' ? {crit:6} : {}), ...(job === 'ringlord' ? {glove:1} : {})};
  const parts = [['weapon', wN, wst, wArt], ['armor', [`เกราะ${J.name}`, `${J.en} Armour`], {def:42, mdef:10, hp:900, [s1]:3}, caster ? 'a_vajra' : 'a_infernal'],
    ['head', [`มงกุฎ${J.name}`, `${J.en} Crown`], {def:14, mdef:8, [s1]:4, [s2]:2}, 'h_vajra'], ['acc', [`ตรา${J.name}`, `${J.en} Seal`], {[s1]:6, [s2]:4, hpPct:.04}, 'x_vajra']];
  parts.forEach(([slot, nmz, st, art], i) => { const id = ids[i]; ITEMS[id] = {name:nmz[0], en:nmz[1], kind:'gear', slot, lv, st, buy:0, sell:lv * 6 + 20, starter:job, artAs:art, desc:['อุปกรณ์เริ่มต้นประจำอาชีพ Tier 4', 'Tier-4 class starter equipment']};
    if (slot === 'weapon') ITEMS[id].wtype = wt; else if (SPR.GEAR_LOOK[art]) SPR.GEAR_LOOK[id] = SPR.GEAR_LOOK[art]; });
  KIT[job] = ids; }
/* tier-4 heroes from before the kits: their kit once */
EV.on('tick', () => { if (PAUSED || !S || !S.lvl || S.kit4 === 1 || !JOBS[S.job]) return; S.kit4 = 1; if (JOBS[S.job].tier === 4 && K4[S.job] && typeof kitGive === 'function') kitGive(S.job); });

/* ---------- tier-4 signature looks ---------- */
const LOOK4 = {bulwark:{pauldron:'gold', forearm:'gold', cape:'navy', capeTex:'gold', necklace:true},
  archsage:{necklace:true, crown:4, ringMat:'rune', pauldron:'gold'},
  ringlord:{necklace:true, handWrap:'gold', armband:'gold', crown:2},
  sylvan:{pauldron:'leather', cape:'jade', capeTex:'gold', crown:2},
  divinehealer:{necklace:true, crown:3, pauldron:'gold'},
  himmaemperor:{pauldron:'gold', necklace:true, crown:6},
  tigershade:{pauldron:'gold', necklace:true}};
for (const j in LOOK4) if (SPR.CHARS[j]) Object.assign(SPR.CHARS[j], LOOK4[j]);

/* ---------- class weapons: their own colour and badge on the icon ---------- */
const CW_TINT = {estaff:[200, '#7ab8ff', 'จ'], hstaff:[85, '#7dff9a', 'อ'], sstaff:[35, '#ffd34a', 'ส'], wbow:[95, '#9ff07d', 'พ'], bsword:[20, '#ffb04a', 'ข']};
{ const _art = itemArt;
  itemArt = function(id){ let s = _art.apply(this, arguments); const b = (ITEMS[id] && ITEMS[id].base) || id, m = /^w_(estaff|hstaff|sstaff|wbow|bsword)\d+$/.exec(b); if (!m) return s; const [h, c] = CW_TINT[m[1]];
    s = s.replace(/(<svg[^>]*>)/, `$1<g style="filter:hue-rotate(${h}deg) saturate(1.3)">`).replace(/<\/svg>$/, `</g><circle cx="33" cy="33" r="5" fill="${c}" stroke="#fff" stroke-width="1.4"/><path d="M33 30.2l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill="#fff"/></svg>`);
    return s; }; }

/* ---------- cards: one new stat each ---------- */
const cardPlus = (c, k, v, th, en) => { if (!CARDS[c]) return; CARDS[c].bonus = {...(CARDS[c].bonus || {}), [k]:v}; CARDS[c].desc = [`${CARDS[c].desc[0]}, ${th}`, `${CARDS[c].desc[1]}, ${en}`]; };
if (typeof SPECIES !== 'undefined') SPECIES.forEach(([id, th, en, lvl, arch, look, elem]) => { const c = `c_${id}`, cd = CARDS[c]; if (!cd) return; const kd = cd.kind || cd.slot, t = Math.max(1, Math.ceil(lvl / 25));
  if (kd === 'weapon'){ const e = elem && elem !== 'neutral' ? elem : 'neutral'; cardPlus(c, `elem_${e}`, +(t * .02).toFixed(2), `ดาเมจธาตุ${ELEM_TH[e]} +${t * 2}%`, `${ELEM_EN[e]} damage +${t * 2}%`); }
  else if (kd === 'armor' || kd === 'stride') cardPlus(c, 'dmgRed', +(t * .005).toFixed(3), `รับดาเมจ −${+(t * .5).toFixed(1)}%`, `Damage taken −${+(t * .5).toFixed(1)}%`);
  else if (kd === 'head') cardPlus(c, 'castPct', +(t * .01).toFixed(2), `ร่ายเร็วขึ้น ${t}%`, `Cast time −${t}%`);
  else if (kd === 'guard' || kd === 'vigor') cardPlus(c, 'critRes', t * 2, `ต้านทานคริ +${t * 2}%`, `Critical Resistance +${t * 2}%`);
  else if (kd === 'mind') cardPlus(c, 'healPow', +(t * .02).toFixed(2), `ฟื้นแรงขึ้น ${t * 2}%`, `Healing +${t * 2}%`);
  else if (kd === 'swift') cardPlus(c, 'cdr', +(t * .01).toFixed(2), `คูลดาวน์ −${t}%`, `Cooldown −${t}%`); });
/* the new stats from worn cards and the new random options count */
const PX_MAP = {dmgRed:'dmgRed', dmgRedPct:'dmgRed', critRes:'critRes', castPct:'castPct', healPow:'healPow', healPowPct:'healPow', cdr:'cdr', cdrPct:'cdr'};
function pxSum(){ const o = {}; const add = st => { if (!st) return; for (const k in st) if (PX_MAP[k]) o[PX_MAP[k]] = (o[PX_MAP[k]] || 0) + (+st[k] || 0); };
  for (const sl in S.slots || {}){ const c = S.slots[sl]; if (c && CARDS[c]) add(CARDS[c].bonus); }
  for (const sl in S.gear || {}){ const it = S.gear[sl] && ITEMS[S.gear[sl]]; if (it && it.st){ const st = {}; for (const k of ['dmgRedPct', 'healPowPct', 'cdrPct']) if (it.st[k]) st[k] = it.st[k]; add(st); } }
  return o; }
{ const _d = derive;
  derive = function(){ const r = _d.apply(this, arguments); if (!DER || !S) return r; const o = pxSum();
    if (o.castPct) DER.castMul = Math.max(.2, DER.castMul * (1 - o.castPct));
    for (const k of ['dmgRed', 'critRes', 'healPow']) if (o[k]) DER.pas[k] = (DER.pas[k] || 0) + o[k];
    DER.cdrX = o.cdr || 0;
    DER.critResV = typeof critResPct === 'function' ? +critResPct().toFixed(1) : 0; DER.dmgRedV = typeof clRed === 'function' ? Math.round(clRed() * 1000) / 10 : 0;
    return r; }; }
// cards on worn gear are counted by the card system; worn-gear dmgRed/critRes/castPct are already counted in classlines.js, so only cards and the % options are added here
{ const _se = sdExtra; sdExtra = function(k){ return _se.apply(this, arguments) + (k === 'cdr' ? (DER && DER.cdrX) || 0 : 0); }; }
{ const _eb = sdElemBonus; sdElemBonus = function(e){ let v = _eb.apply(this, arguments); for (const sl in S.slots || {}){ const c = S.slots[sl]; if (c && CARDS[c] && CARDS[c].bonus) v += +CARDS[c].bonus['elem_' + e] || 0; } return v; }; }

/* ---------- random options: the new stats can roll ---------- */
if (typeof AFFIX !== 'undefined'){
  AFFIX.push(['castPct', [2, 0, 2, 1], L => .02 + Math.min(.03, L / 4000)], ['healPowPct', [1, 0, 1, 2], L => .03 + Math.min(.05, L / 3000)],
    ['dmgRedPct', [0, 2, 1, 1], L => .01 + Math.min(.02, L / 8000)], ['cdrPct', [1, 0, 1, 2], L => .01 + Math.min(.03, L / 6000)], ['critRes', [0, 2, 2, 1], L => 1 + Math.floor(L / 40)]); }
{ const _gs = gearStatText;
  gearStatText = function(st){ let s = _gs.apply(this, arguments); const out = [];
    if (st.healPowPct) out.push(`Healing +${Math.round(st.healPowPct * 100)}%`);
    if (st.dmgRedPct) out.push(`Damage Taken −${+(st.dmgRedPct * 100).toFixed(1)}%`);
    if (st.cdrPct) out.push(`Cooldown −${Math.round(st.cdrPct * 100)}%`);
    if (!out.length) return s; return s ? `${s} · ${out.join(' · ')}` : out.join(' · '); }; }

/* ---------- Auto per class ---------- */
{ const _bp = botPick;
  botPick = function(t){ if (!t || !S) return _bp.apply(this, arguments);
    const line = jobChain(), saved = {}, hold = (id, v) => { if (!(id in saved)) saved[id] = BOT.used[id]; BOT.used[id] = v; };
    if (line.includes('rune')){ const n = mobs.filter(m => !m.dead && Math.hypot(m.x - t.x, m.y - t.y) < 150).length; if (n < 3) for (const id of ['solarfall', 'deluge', 'tempest', 'earthswallow']) hold(id, 1e15); }
    if (line.includes('blade') && threats().length >= 2) for (const id of ['vanguard', 'roar', 'provoke']) if (skl(id)) hold(id, -1);
    try { return _bp.apply(this, arguments); } finally { for (const id in saved){ if (saved[id] === undefined) delete BOT.used[id]; else BOT.used[id] = saved[id]; } } }; }

/* ---------- the bag comparison: the new defensive stats ---------- */
if (typeof CMP_STATS !== 'undefined'){ CMP_STATS.push(['critResV', 'Critical Resistance', '%'], ['dmgRedV', 'Damage Reduction', '%']);
  const _w = cmpWeights; cmpWeights = function(){ return {..._w.apply(this, arguments), critResV:.3, dmgRedV:.6}; }; }

/* ---------- party roles: a full team hits bosses harder and takes less from them ---------- */
const roleOf = j => { const c = jobChain(j); return c.includes('blade') ? 'tank' : c.includes('healer') ? 'heal' : c.length > 1 ? 'dps' : ''; };
function teamFull(){ if (typeof NET === 'undefined' || !NET.ghosts || typeof abNear !== 'function') return false; const r = new Set([roleOf(S.job)]);
  for (const g of abNear()) if (g.q && JOBS[g.q.j]) r.add(roleOf(g.q.j)); return r.has('tank') && r.has('heal') && r.has('dps'); }
const TEAM = {t:0, full:false};
EV.on('tick', dt => { if ((TEAM.t -= dt) > 0) return; TEAM.t = 2; const f = teamFull(); if (f && !TEAM.full) toast(L('ทีมครบบทบาท! ตีบอสแรงขึ้น 20% · โดนบอสเบาลง 10%', 'Full team! +20% damage to bosses · −10% damage from them')); TEAM.full = f; });
HK.outMul.push((mult, elem, kind, m) => (TEAM.full && m && m.def && m.def.boss ? mult * 1.2 : mult));
HK.atkMul.push((m, mult) => (TEAM.full && m.def.boss ? mult * .9 : mult));

/* ---------- wiki: one page per class line ---------- */
const LINES = [['blade', 'สายนักรบ', 'Warrior line', 'แทงค์ แนวหน้า ดึงมอน ป้องกันเพื่อน', 'Tank: front line, taunts, protects the team', 'โล่ขุนพล', 'Bulwark shields'],
  ['rune', 'สายเวท', 'Mage line', 'เวทวงกว้าง 4 ธาตุ เวทใหญ่ร่ายค้าง', 'Wide spells of four elements, channelled grand spells', 'คทาจตุธาตุ', 'Elemental staff'],
  ['muay', 'สายมวย', 'Muay line', 'คอมโบ ยิ่งต่อยิ่งแรง ปิดฉากแรงมาก', 'Combos that build up, a crushing finisher', 'นวมคู่ · กรงเล็บคู่', 'Gloves · twin claws'],
  ['ranger', 'สายพราน', 'Hunter line', 'ยิงไกล สัตว์เลี้ยงช่วยสู้', 'Ranged, with a pet', 'ธนูยาวพงไพร', 'Wildwood longbow'],
  ['healer', 'สายหมอ', 'Healer line', 'ฟื้นฟู บัพทั้งทีม', 'Heals and team buffs', 'ไม้เท้าโอสถ', 'Herbal staff'],
  ['rogue', 'สายโจร', 'Thief line', 'ตีเป้าเดียว คริติคอล ธาตุพิษ แยกร่าง', 'Single target, crits, poison, clones', 'มีดคู่', 'Twin daggers'],
  ['summoner', 'สายอัญเชิญ', 'Summoner line', 'เรียกสัตว์หิมพานต์สู้แทน', 'Himmapan beasts fight for you', 'คทาสังข์อัญเชิญ', 'Conch sceptre']];
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'classguide', t:['คู่มืออาชีพ', 'Class guide'], b:() => LINES.map(([j0, th, en, rth, ren, wth, wen]) => {
  const tiers = []; for (let j = j0; j; j = JOBS[j] && JOBS[j].next ? JOBS[j].next[0] : null){ tiers.push(j); if (tiers.length > 4) break; }
  return `<h4>${L(th, en)}</h4><p>${L(rth, ren)} · ${L('อาวุธประจำสาย', 'Class weapon')}: ${L(wth, wen)}</p><ul>${tiers.map(j => `<li><b>${nm(JOBS[j])}</b> (Tier ${JOBS[j].tier}): ${JOBS[j].skills.map(id => skName(SKILLS[id])).join(' · ')}</li>`).join('')}</ul>`; }).join('')
  + `<p>${L('Tier 4: Job Lv 50 ของ Tier 3 + Base Lv 150 คุยกับครูวายรา', 'Tier 4: Job Lv 50 in tier 3 and Base Lv 150, talk to Master Vayra')}</p>`});

/* ---------- balance pass (tier 4, Lv 160, starter kit, 20 s of Auto on 4 dummies) ----------
   measured before: Shadow Tiger 36k/s (29k on one target) · Sylvan 24k · Archsage 19k (area) · Ring Lord 12k · Emperor 10k ·
   Divine Physician 9k (support) · Bulwark 9k (tank, takes ⅓ of the damage). Target: damage dealers 15–20k, support/tank ~10–12k. */
const JOB_BAL = {tigershade:.5, bandit:.85, sylvan:.95, ringlord:1, grandmaster:1, himmaemperor:1.3, divinehealer:1.2, bulwark:1.1};
HK.outMul.push(mult => mult * (JOB_BAL[S && S.job] || 1));

/* ---------- Cast Resistance from the casters' own passives ---------- */
for (const [id, per] of [['focus', 2], ['astrowisdom', 2], ['fourelements', 3], ['royaltext', 2], ['divinehand', 3], ['sumlore', 1], ['sovlore', 2], ['emperorgrace', 2]]){ const sk = SKILLS[id]; if (!sk || !sk.pas) continue;
  const p0 = sk.pas, d0 = sk.desc; sk.pas = lv => ({...p0(lv), castRes:lv * per}); sk.desc = lv => `${d0(lv)} · ${L(`ต้านทานการร่าย +${lv * per}%`, `Cast Resistance +${lv * per}%`)}`; }

/* ---------- poison monsters: snakes, scorpions, spiders, centipedes, toads and leeches are Poison now ---------- */
for (const id in MOB){ const d = MOB[id]; if (!d || d.boss || d.elem === 'poison') continue; if (/viper|cobra|snake|scorpion|spider|krait|millipede|centipede|wasp|toad|leech|python/.test(id)) d.elem = 'poison'; }

/* ---------- first-time tips for the newer systems ---------- */
if (typeof TIPS !== 'undefined'){
  Object.assign(TIPS, {
    sockets:['ช่อง Card บนอุปกรณ์', 'Card sockets', 'อุปกรณ์ที่ดรอปหรือคราฟต์มีช่อง Card 1–3 ช่อง · กระเป๋า → แท็บการ์ด → เลือกการ์ด → กด "ใส่" ที่อุปกรณ์', 'Dropped or crafted gear has 1–3 card sockets · Bag → Cards tab → pick a card → press "Slot" on a piece'],
    castres:['ร่ายต่อได้!', 'Kept casting!', 'โดนตีหรือติดพิษตอนร่ายอาจโดนขัด · ค่า Cast Resistance (DEX, INT, สกิลติดตัว) ช่วยให้ร่ายต่อได้', 'Hits and poison may break a cast · Cast Resistance (DEX, INT, passives) helps you keep casting'],
    combo:['คอมโบ!', 'Combo!', 'ใช้สกิลต่อกันภายใน 3.5 วิ ทุกขั้นแรงขึ้น · เจ้าสังเวียนใช้ "ปิดฉากมวยไทย" เพื่อใช้คอมโบทั้งหมด', 'Chain skills within 3.5 s, each stack hits harder · the Ring Lord spends them all with the Finisher'],
    team:['ทีมครบบทบาท!', 'Full team!', 'มีแทงค์ หมอ และสายตีอยู่ใกล้กัน: ตีบอสแรงขึ้น 20% โดนบอสเบาลง 10%', 'A tank, a healer and a damage dealer together: +20% damage to bosses, −10% from them'],
    ground:['เลือกพื้นที่', 'Aim on the ground', 'สกิลวงพื้นที่: วงตามเมาส์ คลิกซ้ายใช้ · คลิกขวา/Esc ยกเลิก', 'Area skills: the circle follows the mouse · left click casts · right click / Esc cancels']});
  EV.on('card', () => tip('sockets'));
  EV.on('tick', () => { if (!S || !S.lvl) return; if (P.crT && T - P.crT < .5) tip('castres'); if (typeof CMB !== 'undefined' && CMB.n >= 2) tip('combo'); if (TEAM.full) tip('team'); if (typeof GT !== 'undefined' && GT.id) tip('ground'); });
}

/* ---------- (v160) the Tier-4 boss trial was called off in v126; its code and its saved count (S.t4q) are gone ---------- */
{ const _ld = load, _sv = save; const t4x = () => { if (typeof S !== 'undefined' && S && 't4q' in S) delete S.t4q; };
  load = function(){ const r = _ld.apply(this, arguments); if (r && 't4q' in r) delete r.t4q; return r; }; save = function(){ t4x(); return _sv.apply(this, arguments); }; }
