/* VAYRATHEN — js/sys/endgame.js — goals after Tier 4
   · ดันเจี้ยนใหม่ "วิหารเทพเขาไกรลาส" (Lv 150+, at Gatekeeper Saeng): its guardian wears a divine armour — without a full
     team (a tank, a healer and a damage dealer together) it takes only half damage and hits 30% harder. Clearing it
     pays more and always drops 2 extra pieces of Lv 150+ gear (Epic or better), with a chance of a class-set piece.
   · Class sets (ชุดประจำสาย), one per line, 4 pieces each (armour, headgear, legs, feet), Lv 150, only for that line:
     2 pieces → the line's own bonus · 4 pieces → a bigger one plus +8% damage. They also drop (rarely) from region
     bosses Lv 150+ and from the Kailash chest. */
'use strict';

/* ---------- the class sets ---------- */
const CSET = {
  blade:['ขุนพลวชิระ', 'Vajra General', {dmgRed:.05, critRes:8}, {dmgRed:.1, critRes:15, hpPct:.1}],
  rune:['จตุธาตุทิพย์', 'Divine Elements', {castPct:.08, matkPct:.05}, {castPct:.15, matkPct:.12}],
  muay:['คาดเชือกทองคำ', 'Golden Kard Chuek', {comboPct:.01, atkPct:.05}, {comboPct:.02, atkPct:.12}],
  ranger:['พรานพนาเทพ', 'Divine Ranger', {petAtk:.2, atkPct:.05}, {petAtk:.4, atkPct:.12}],
  healer:['เวชบดีทอง', 'Golden Physician', {healPow:.15, spPct:.08}, {healPow:.3, spPct:.15, matkPct:.06}],
  rogue:['พยัคฆ์ราตรี', 'Night Tiger', {crit:5, critDmg:.2}, {crit:10, critDmg:.4, atkPct:.06}],
  summoner:['จักรพรรดิหิมวันต์', 'Himavanta Emperor', {sumAtk:.15, matkPct:.04}, {sumAtk:.3, matkPct:.1}]};
const CSET_SLOTS = [['armor', 'เกราะ', 'Armour', 'a_himmapan', {def:48, mdef:12, hp:1100}], ['head', 'มงกุฎ', 'Crown', 'h_himmapan', {def:16, mdef:10}],
  ['acc', 'เครื่องราง', 'Talisman', 'x_himmapan', {def:20, hp:600}], ['shoes', 'รองเท้า', 'Boots', 'sh_9', {def:12, flee:16, movePct:.06}]];
for (const line in CSET){ const [th, en] = CSET[line];
  for (const [slot, sth, sen, art, st] of CSET_SLOTS){ const id = `cs_${line}_${slot}`;
    ITEMS[id] = {name:`${sth}${th}`, en:`${en} ${sen}`, kind:'gear', slot, lv:150, st:{...st, line, cset:line}, buy:0, sell:40000, artAs:art, desc:[`ชุดประจำสาย · ${th}`, `Class set · ${en}`]};
    if (SPR.GEAR_LOOK[art]) SPR.GEAR_LOOK[id] = SPR.GEAR_LOOK[art]; } }
const csetCount = () => { const c = {}; for (const sl in S.gear || {}){ const it = S.gear[sl] && ITEMS[S.gear[sl]]; if (it && it.st && it.st.cset) c[it.st.cset] = (c[it.st.cset] || 0) + 1; } return c; };
const csetBonus = (line, n) => { const b = {}; if (n >= 2) Object.assign(b, CSET[line][2]); if (n >= 4){ Object.assign(b, CSET[line][3]); b.allDmg = .08; } return b; };
{ const _d = derive;
  derive = function(){ const r = _d.apply(this, arguments); if (!DER || !S || !S.gear) return r; const c = csetCount();
    for (const line in c){ const b = csetBonus(line, c[line]);
      for (const k in b){ const v = b[k];
        if (k === 'atkPct') DER.atk = Math.round(DER.atk * (1 + v)); else if (k === 'matkPct') DER.matk = Math.round(DER.matk * (1 + v));
        else if (k === 'hpPct') DER.maxhp = Math.round(DER.maxhp * (1 + v)); else if (k === 'spPct') DER.maxsp = Math.round(DER.maxsp * (1 + v));
        else if (k === 'castPct') DER.castMul = Math.max(.2, DER.castMul * (1 - v)); else if (k === 'crit') DER.crit = +(DER.crit + v).toFixed(1);
        else if (k === 'critDmg') DER.critDmg += v; else DER.pas[k] = (DER.pas[k] || 0) + v; } }
    return r; }; }
// all damage +% for magic too (the physical side is in rogue2.js)
HK.outMul.push((mult, elem, kind) => (kind === 'magic' && DER && DER.pas && DER.pas.allDmg ? mult * (1 + DER.pas.allDmg) : mult));
const csetTxt = b => Object.entries(b).map(([k, v]) => ({dmgRed:`Damage Taken −${v * 100}%`, critRes:`Critical Resistance +${v}%`, castPct:`Cast Time −${v * 100}%`,
  matkPct:`MATK +${Math.round(v * 100)}%`, atkPct:`ATK +${Math.round(v * 100)}%`, comboPct:`Combo DMG +${v * 100}%/stack`, petAtk:`Pet DMG +${v * 100}%`, healPow:`Healing +${v * 100}%`,
  spPct:`Max SP +${Math.round(v * 100)}%`, hpPct:`Max HP +${Math.round(v * 100)}%`, crit:`CRIT +${v}%`, critDmg:`Critical Damage +${v * 100}%`, sumAtk:`Summon DMG +${v * 100}%`, allDmg:`All Damage +${v * 100}%`}[k] || '')).filter(Boolean).join(' · ');
{ const _gl = gearLines;
  gearLines = function(id){ const s = _gl.apply(this, arguments), it = ITEMS[id], cs = it && it.st && it.st.cset; if (!cs) return s; const n = S ? (csetCount()[cs] || 0) : 0, [th, en] = CSET[cs];
    return `${s}<span class="csetl">${L(`เซ็ต ${th}`, `${en} set`)} (${n}/4) · <span class="${n >= 2 ? 'on' : ''}">2: ${csetTxt(CSET[cs][2])}</span> · <span class="${n >= 4 ? 'on' : ''}">4: ${csetTxt(csetBonus(cs, 4))}</span></span>`; }; }
function csetDrop(x, y){ const line = jobChain()[1] || 'rogue'; if (!CSET[line]) return; const sl = CSET_SLOTS[Math.floor(Math.random() * 4)][0], id = makeInst(`cs_${line}_${sl}`, Math.max(2, rollRarity('boss')));
  if (x != null) dropLoot(id, x, y); else addItem(id, 1); banner(L(`✦ ชิ้นส่วนชุดประจำสาย: ${nm(ITEMS[id])} ✦`, `✦ Class set piece: ${nm(ITEMS[id])} ✦`)); SFX.play('drop3'); }
EV.on('kill', m => { if (!m || !m.def || !m.def.boss || m.def.lvl < 150 || m.minion) return; if (Math.random() < .06) csetDrop(m.x, m.y); });

/* ---------- the Kailash temple dungeon ---------- */
if (typeof DUNGEONS !== 'undefined' && !DUNGEONS.some(d => d.id === 'kailash')){
  DUNGEONS.push({id:'kailash', base:19, min:150, th:'วิหารเทพเขาไกรลาส', en:'Divine Temple of Kailash', name:'วิหารเทพเขาไกรลาส',
    d:['ผู้พิทักษ์สวมเกราะเทวะ ต้องมีทีมครบ แทงค์ หมอ สายตี จึงทำลายได้ · ของ Lv 150+ ล้ำค่าขึ้นไป และชุดประจำสาย', 'Its guardian wears divine armour: only a full team (tank, healer, damage) can break it · Lv 150+ Epic gear and class sets']}); }
const inKailash = () => typeof DG !== 'undefined' && DG.active && DG.did === 'kailash';
HK.outMul.push((mult, elem, kind, m) => (inKailash() && m && m.def && m.def.boss && !(typeof TEAM !== 'undefined' && TEAM.full) ? mult * .5 : mult));
HK.atkMul.push((m, mult) => (inKailash() && m.def.boss && !(typeof TEAM !== 'undefined' && TEAM.full) ? mult * 1.3 : mult));
EV.on('tick', () => { if (!inKailash() || typeof boss === 'undefined' || !boss || boss.dead) return; if (T - (DG.kwarn || -99) > 20 && !(typeof TEAM !== 'undefined' && TEAM.full)){ DG.kwarn = T; toast(L('เกราะเทวะ: ผู้พิทักษ์รับดาเมจครึ่งเดียว · ต้องมีแทงค์ หมอ และสายตีอยู่ด้วยกัน', 'Divine armour: the guardian takes half damage · bring a tank, a healer and a damage dealer')); } });
{ const _r = dgReward;
  dgReward = function(){ const r = _r.apply(this, arguments); if (DG.did !== 'kailash') return r;
    const pool = GEAR_LIST.filter(g => g[1] !== 'ammo' && g[4] >= 150 && lineOk(g[6]) && (g[1] !== 'weapon' || g[6].wtype === JOBS[S.job].weapon.type));
    for (let i = 0; i < 2 && pool.length; i++){ const id = makeInst(pool[Math.floor(Math.random() * pool.length)][0], Math.max(2, rollRarity('wb'))); addItem(id, 1); log(L(`หีบเทวะ: ${nm(ITEMS[id])}`, `Divine chest: ${nm(ITEMS[id])}`), 'g'); }
    if (Math.random() < .35) csetDrop(); S.bia += DG.lv * 600; return r; }; }

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'endgame', t:['หลัง Tier 4: ดันเจี้ยนเทวะและชุดประจำสาย', 'After Tier 4: Kailash and class sets'], b:() => `<p>${L('ดันเจี้ยน "วิหารเทพเขาไกรลาส" (Lv 150+) คุยกับนายประตูแสงในอาเรน · ผู้พิทักษ์รับดาเมจครึ่งเดียวและตีแรงขึ้น 30% ถ้าทีมไม่ครบแทงค์ หมอ สายตี · ผ่านได้ของ Lv 150+ ล้ำค่าขึ้นไปเพิ่ม 2 ชิ้น และลุ้นชุดประจำสาย', 'The "Divine Temple of Kailash" (Lv 150+) opens at Gatekeeper Saeng in Aren · its guardian takes half damage and hits 30% harder unless your team has a tank, a healer and a damage dealer · clearing it gives 2 extra Lv 150+ Epic pieces and a chance at a class set piece')}</p>
  <ul>${Object.keys(CSET).map(k => `<li><b>${L(CSET[k][0], CSET[k][1])}</b> (${nm(JOBS[k])}): 2 ${L('ชิ้น', 'pcs')} ${csetTxt(CSET[k][2])} · 4 ${L('ชิ้น', 'pcs')} ${csetTxt(csetBonus(k, 4))}</li>`).join('')}</ul><p>${L('ชิ้นส่วนชุดดรอปจากบอสประจำแคว้น Lv 150+ (6%) และหีบวิหารเทวะ (35%)', 'Set pieces drop from region bosses Lv 150+ (6%) and the Kailash chest (35%)')}</p>`});
{ const st = document.createElement('style'); st.textContent = `.csetl{display:block;color:#c9b6ff}.csetl .on{color:#7dffb0;font-weight:700}`; document.head.appendChild(st); }

/* ---------- wiki pages for the newer systems ---------- */
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push(
  {id:'sockets2', t:['ช่อง Card บนอุปกรณ์', 'Card sockets'], b:() => `<p>${L('อุปกรณ์ที่ดรอปจากมอน/บอส บอสโลก หีบดันเจี้ยน หรือคราฟต์ สุ่มช่อง Card 1–3 ช่อง (ของร้าน NPC ไม่มีช่อง) · กระเป๋า → แท็บการ์ด → เลือกการ์ด → "ใส่" ที่อุปกรณ์ · ถอดด้วย ✕ · การ์ดติดไปกับไอเท็มเวลาเทรด ขาย/ย่อยแล้วหายด้วย · การ์ดใส่ได้เฉพาะตำแหน่งที่เขียนบนการ์ด', 'Gear from monsters, bosses, the world boss, dungeon chests or crafting rolls 1–3 card sockets (NPC shop gear has none) · Bag → Cards → pick a card → "Slot" on a piece · remove with ✕ · cards travel with the item in trades and are lost if it is sold or salvaged · a card fits only the place printed on it')}</p>`},
  {id:'lockbulk', t:['ล็อค · ขาย/ย่อยหลายชิ้น', 'Locks · bulk sell/salvage'], b:() => `<p>${L('ล็อคอุปกรณ์ด้วยปุ่ม 🔓 ในกระเป๋า: ชิ้นที่ล็อคขาย ย่อย เทรด หรือวางตลาดไม่ได้ · ช่างตีเหล็ก → ขายคืน และหลอมของ (I) → แยกชิ้นส่วน: ติ๊กหลายชิ้น "เลือกตามเกรด" แล้วกดทีเดียว · ตั้งเกรดได้ (ความหายาก เก็บชิ้นมีการ์ด เก็บชิ้นดีกว่าที่สวม เก็บชิ้นตีบวก) · ตั้งขาย/ย่อยอัตโนมัติตอนเก็บของได้', 'Lock gear with 🔓 in the bag: locked pieces cannot be sold, salvaged, traded or listed · Forge → Sell back and Crafting (I) → Salvage: tick many, "Tick by grade", one button · grade settings (rarity, keep carded, keep upgrades, keep refined) · optional auto sell/salvage on pickup')}</p>`},
  {id:'castres', t:['ต้านทานการร่าย · ต้านทานคริ', 'Cast & Critical Resistance'], b:() => `<p>${L('ร่ายเวทได้เสมอแม้ติดพิษ/ไฟ · โดนตีมีโอกาสขัด 100% โดน DoT 35% ลดด้วย Cast Resistance (DEX×0.15% + INT×0.1% + สกิล สูงสุด 90%) · มอนตีคริได้ (×1.5 มอน 5% บอส 10%) ลดด้วย Critical Resistance (LUK×0.2% + VIT×0.1% + สกิล ของ การ์ด)', 'You can always cast, even poisoned or burning · a hit breaks a cast 100%, a DoT tick 35%, cut by Cast Resistance (DEX×0.15% + INT×0.1% + skills, max 90%) · monsters crit too (×1.5, 5% / bosses 10%), cut by Critical Resistance (LUK×0.2% + VIT×0.1% + skills, gear, cards)')}</p>`},
  {id:'poisonel', t:['ธาตุพิษ', 'Poison element'], b:() => `<p>${L('ธาตุใหม่: แรงต่อดิน 125% · อ่อนต่อศักดิ์สิทธิ์ 75% ความมืด 50% · พิษต่อพิษ 0% · งู แมงป่อง แมงมุม ตะขาบ คางคก ปลิง เป็นธาตุพิษ · สายโจรใช้ "อาบพิษอาวุธ" ให้อาวุธเป็นธาตุพิษได้', 'New element: 125% vs Earth · 75% vs Holy, 50% vs Shadow · 0% vs Poison · snakes, scorpions, spiders, centipedes, toads and leeches are Poison · thieves can coat their weapon with "Venom Coat"')}</p>`},
  {id:'t4trial', t:['เปลี่ยนเป็น Tier 4', 'Becoming Tier 4'], b:() => `<p>${L('ครบ Job Lv 50 ของ Tier 3 และ Base Lv 150 แล้ว คุยกับครูวายราเพื่อเปลี่ยนเป็น Tier 4 ได้ทันที (ยกเลิกบททดสอบปราบบอสแล้ว)', 'At Job Lv 50 of a Tier-3 class and Base Lv 150, talk to Master Vayra to become Tier 4 at once (the boss trial was called off)')}</p>`},
  {id:'combat2', t:['คอมโบ · ทีมครบบทบาท · เลือกพื้นที่', 'Combos · full team · ground aim'], b:() => `<p>${L('มวย: ใช้สกิลต่อกันใน 3.5 วิ = คอมโบ ยิ่งต่อยิ่งแรง "ปิดฉากมวยไทย" ใช้คอมโบทั้งหมด · ทีมครบ แทงค์+หมอ+สายตี อยู่ใกล้กัน: ตีบอส +20% โดนบอส −10% · สกิลวงพื้นที่: PC วงตามเมาส์ คลิกซ้ายใช้ · มือถือ ลากปุ่มสกิลไปบนสนามแล้วปล่อย · หาปาร์ตี้ได้ที่หน้าต่างโซเชียล', 'Muay: chain skills within 3.5 s for a combo that grows, the Finisher spends it all · full team (tank + healer + damage) close together: +20% to bosses, −10% from them · area skills: PC circle follows the mouse, left click casts · mobile: drag the skill button onto the field and let go · find a party in the Social window')}</p>`});
