/* VAYRATHEN — js/sys/gear335.js — (v335) gear for every class
   The owner chose (after a look at every line's items): armour in three kinds, the newer lines' own sets, the merchant's
   own axe, more bows for the hunter, and pieces at Lv 220 and 260 where the far tiers had 40-level gaps.
   1. Three kinds of body armour at every tier: the old plate stays (heavy · เกราะหนัก: DEF and HP), joined by light
      leathers (เกราะเบา: FLEE, CRIT, HIT) and robes (เสื้อคลุม: MDEF, SP, MATK). Anyone can wear any kind; the kind that
      suits the line simply gives what it needs. Each kind looks different on the hero.
   2. Lv 220 and 260 pieces for every weapon family, body armour (all three kinds), headgear, accessories, shields,
      legs and shoes: halfway between the tiers around them.
   3. The merchant line's own axe (ขวานทองวาณิช, one- and two-handed) and a crossbow family for bow users (หน้าไม้: harder
      shots, a little slower).
   4. Sets for the five newer lines (ไสยเวท · พ่อค้า · เจ้าเหมียว · เจ้าตูบ · นินจา) at Lv 40, 90 and 150, like the other seven.
      Their bosses and the dungeon guardians drop them; every dungeon guardian now has a chance at a piece of your line's set.
   5. A full set (4 pieces) wraps the hero in a soft glow of the line's colour. */
'use strict';
const G335 = {};
{ const mk = (id, slot, th, en, lv, price, st, art) => { if (ITEMS[id]) return; GEAR_LIST.push([id, slot, th, en, lv, price, st]);
    GEAR[id] = {id, slot, name:th, en, lv, buy:price, st, pack:1};
    ITEMS[id] = {name:th, en, buy:price, sell:Math.round(price * .4), kind:'gear', slot, lv, st, pack:1, ...(st.wtype ? {wtype:st.wtype} : {}), ...(art ? {artAs:art} : {})};
    if (art && SPR.GEAR_LOOK[art] && !SPR.GEAR_LOOK[id]) SPR.GEAR_LOOK[id] = SPR.GEAR_LOOK[art]; };
  G335.mk = mk;
  const avg = (a, b) => { const o = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])){ const x = a[k], y = b[k];
    o[k] = typeof x === 'number' && typeof y === 'number' ? (Number.isInteger(x) && Number.isInteger(y) ? Math.round((x + y) / 2) : +((x + y) / 2).toFixed(3)) : (x !== undefined ? x : y); } return o; };
  const g = id => GEAR_LIST.find(r => r[0] === id);
  const swapTier = (s, from, to) => (s.includes(from) ? s.replace(from, to) : `${s} ${to}`);

  // ---- 2a. weapons at Lv 220 / 260 (indices 11 and 12 follow the tier list) ----
  WEAPON_TIERS.push([220, 'ราชันย์', 'Sovereign'], [260, 'ทิพย์', 'Celestial']);
  for (const r of [...GEAR_LIST]){ if (r[1] !== 'weapon') continue; const m = /^(w_[a-z]+)(\d+)$/.exec(r[0]); if (!m) continue; const i = +m[2], pre = m[1];
    if (i === 8 && g(`${pre}9`)){ const b = g(`${pre}9`); mk(`${pre}11`, 'weapon', swapTier(r[2], 'เทวราช', 'ราชันย์'), swapTier(r[3], 'Devaraja', 'Sovereign'), 220, Math.round((r[5] + b[5]) / 2), avg(r[6], b[6]), (ITEMS[r[0]] && ITEMS[r[0]].artAs) || r[0]); }
    if (i === 9 && g(`${pre}10`)){ const b = g(`${pre}10`); mk(`${pre}12`, 'weapon', swapTier(r[2], 'หิมพานต์', 'ทิพย์'), swapTier(r[3], 'Himmapan', 'Celestial'), 260, Math.round((r[5] + b[5]) / 2), avg(r[6], b[6]), (ITEMS[r[0]] && ITEMS[r[0]].artAs) || r[0]); } }

  // ---- 2b. armour, headgear, accessories at Lv 220 / 260 ----
  for (const [lo, hi, id, th, en, lv] of [['a_devaraja', 'a_himmapan', 'a_sovereign', 'เกราะราชันย์', 'Sovereign Armour', 220], ['a_himmapan', 'a_chakra', 'a_celestial', 'เกราะทิพย์', 'Celestial Armour', 260],
      ['h_devaraja', 'h_himmapan', 'h_sovereign', 'มงกุฎราชันย์', 'Sovereign Crown', 220], ['h_himmapan', 'h_chakra', 'h_celestial', 'ชฎาทิพย์', 'Celestial Chada', 260],
      ['x_devaraja', 'x_himmapan', 'x_sovereign', 'ตราราชันย์', 'Sovereign Seal', 220], ['x_himmapan', 'x_chakra', 'x_celestial', 'มณีทิพย์', 'Celestial Gem', 260]]){
    const a = g(lo), b = g(hi); if (a && b) mk(id, a[1], th, en, lv, Math.round((a[5] + b[5]) / 2), avg(a[6], b[6]), (ITEMS[lo] && ITEMS[lo].artAs) || lo); }
  for (const [p, th, en] of [['sd', 'โล่', 'Shield'], ['pt', 'กางเกง', 'Trousers'], ['sh', 'รองเท้า', 'Boots']]){
    const t8 = g(`${p}_8`), t9 = g(`${p}_9`), t10 = g(`${p}_10`);
    if (t8 && t9) mk(`${p}_11`, t8[1], `${th}ราชันย์`, `Sovereign ${en}`, 220, Math.round((t8[5] + t9[5]) / 2), avg(t8[6], t9[6]), `${p}_8`);
    if (t9 && t10) mk(`${p}_12`, t9[1], `${th}ทิพย์`, `Celestial ${en}`, 260, Math.round((t9[5] + t10[5]) / 2), avg(t9[6], t10[6]), `${p}_9`); }

  // ---- 1. three kinds of body armour ----
  const HEAVY = GEAR_LIST.filter(r => r[1] === 'armor' && !r[6].line && !/^cs_/.test(r[0]) && !/^a_[lr]\d/.test(r[0])).sort((a, b) => a[4] - b[4]);
  const LN = [['เสื้อผ้าป่านพราน', 'Hemp Hunter Shirt'], ['เสื้อหนังกวาง', 'Deerskin Tunic'], ['ชุดหนังรัดตัว', 'Strapped Leathers'], ['ชุดหนังเงา', 'Shadow Leathers'], ['ชุดหนังเกล็ดงู', 'Snakescale Leathers'],
    ['ชุดพรางยันต์ลม', 'Wind Yantra Garb'], ['ชุดหนังนาคเงิน', 'Silver Naga Leathers'], ['ชุดหนังสุวรรณ', 'Golden Leathers'], ['ชุดเงาอัคนี', 'Infernal Shade Garb'], ['ชุดลมวชิระ', 'Vajra Wind Garb'],
    ['ชุดเทพวายุ', 'Vayu Deity Garb'], ['ชุดลมราชันย์', 'Sovereign Wind Garb'], ['ชุดหนังหิมพานต์', 'Himmapan Leathers'], ['ชุดเงาทิพย์', 'Celestial Shade Garb'], ['ชุดวายุจักรพรรดิ', 'Chakravartin Wind Garb']];
  const RN = [['เสื้อคลุมผ้าฝ้าย', 'Cotton Robe'], ['เสื้อคลุมย้อมคราม', 'Indigo Robe'], ['เสื้อคลุมนักพรต', 'Hermit Robe'], ['เสื้อคลุมลงอักขระ', 'Glyph Robe'], ['เสื้อคลุมจันทรา', 'Moon Robe'],
    ['เสื้อคลุมยันต์มหาเวท', 'Great Yantra Robe'], ['เสื้อคลุมนาคมณี', 'Naga Jewel Robe'], ['เสื้อคลุมสุริยเทพ', 'Solar Robe'], ['เสื้อคลุมอัคนีกาฬ', 'Infernal Robe'], ['เสื้อคลุมวชิระ', 'Vajra Robe'],
    ['เสื้อคลุมเทวราช', 'Devaraja Robe'], ['เสื้อคลุมราชันย์', 'Sovereign Robe'], ['เสื้อคลุมหิมพานต์', 'Himmapan Robe'], ['เสื้อคลุมทิพย์', 'Celestial Robe'], ['เสื้อคลุมจักรพรรดิ', 'Chakravartin Robe']];
  const LC = ['greenD', 'brownCl', 'brownCl', 'charcoal', 'greenD', 'teal', 'teal', 'gold', 'scarlet', 'charcoal', 'teal', 'plum', 'greenD', 'plum', 'gold'];
  const RC = ['cream', 'teal', 'brownCl', 'plum', 'teal', 'plum', 'teal', 'gold', 'scarlet', 'cream', 'gold', 'plum', 'teal', 'cream', 'gold'];
  HEAVY.forEach((r, i) => { const h = r[6], lv = r[4], n = Math.min(i, LN.length - 1); ITEMS[r[0]].akind = 'heavy';
    const li = {def:Math.round((h.def || 0) * .6), mdef:Math.round((h.mdef || 0) * .8), hp:Math.round((h.hp || 0) * .6), flee:Math.round(3 + lv * .14), crit:Math.round(1 + lv / 35), hit:Math.round(2 + lv * .08),
      ...(lv >= 60 ? {agi:Math.floor(lv / 40)} : {}), ...(h.all ? {all:h.all} : {}), ...(h.hpPct ? {hpPct:+(h.hpPct * .6).toFixed(3)} : {})};
    const ro = {def:Math.round((h.def || 0) * .45), mdef:Math.round(Math.max(2, (h.mdef || 0) * 1.5 + lv * .05)), hp:Math.round((h.hp || 0) * .5), sp:Math.round(10 + lv * .7), matkPct:+(.02 + lv / 4000).toFixed(3),
      ...(lv >= 30 ? {int:Math.floor(lv / 35) + 1} : {}), ...(h.all ? {all:h.all} : {})};
    mk(`a_l${i}`, 'armor', LN[n][0], LN[n][1], lv, r[5], li, r[0]); mk(`a_r${i}`, 'armor', RN[n][0], RN[n][1], lv, r[5], ro, r[0]);
    ITEMS[`a_l${i}`].akind = 'light'; ITEMS[`a_r${i}`].akind = 'robe';
    // how they look: light = a leather vest in the tier's colour; robe = a long coat-skirt, glyph lines from Lv 80, a cape from Lv 140
    const lc = LC[n], rc = RC[n];
    SPR.GEAR_LOOK[`a_l${i}`] = {chest:'leather', chestTex:'vest', top:lc, sleeve:lc};
    SPR.GEAR_LOOK[`a_r${i}`] = {top:rc, sleeve:rc, skirt:[11.6, 1.1, 6.4, 9.2, rc, 'tech'], skirtAll:true, skirtStripes:false, ...(lv >= 80 ? {runeLines:true} : {}), ...(lv >= 140 ? {cape:'scarlet', capeTex:'gold'} : {})}; });
  G335.HEAVY = HEAVY.map(r => r[0]);

  // ---- 3. the merchant's own axe, and crossbows ----
  WEAPON_TIERS.forEach(([lv, tth, ten], i) => {
    const c = (typeof WPN_CURVE === 'function' ? WPN_CURVE(lv) : 22 + lv * 1.25), cl = c * 1.08, P0 = Math.round((400 + lv * lv * 9) * 1.25), art = i <= 10 ? i : (i === 11 ? 8 : 9);
    mk(`w_maxe${i}`, 'weapon', `ขวานทองวาณิช${tth}`, `${ten} Golden Merchant Axe`, lv, P0, {wtype:'sword', hands:'1h', axe:1, line:'merchant', watk:Math.round(cl * 1.02), luk:i + 1, crit:3 + i, ...(i >= 2 ? {str:i} : {})}, `w_axe${art}`);
    mk(`w_mgaxe${i}`, 'weapon', `ขวานศึกทองวาณิช${tth}`, `${ten} Golden Merchant War Axe`, lv, Math.round(P0 * 1.15), {wtype:'sword', hands:'2h', axe:1, line:'merchant', watk:Math.round(cl * 1.26), luk:i + 1, crit:3 + i, ...(i >= 2 ? {str:i + 1} : {})}, `w_gaxe${art}`);
    mk(`w_xbow${i}`, 'weapon', `หน้าไม้${tth}`, `${ten} Crossbow`, lv, Math.round((400 + lv * lv * 9) * 1.15), {wtype:'bow', hands:'2h', watk:Math.round(c * .88 * 1.2), hit:4 + i * 2, aspdPct:-.05, ...(i >= 2 ? {dex:i + 1} : {}), ...(i >= 4 ? {crit:i} : {})}, `w_bow${art}`);
  });
  if (typeof G10_CW !== 'undefined') Object.assign(G10_CW, {occult:'hexrod', catfolk:'catclaw', dogfolk:'collar', ninja:'moonstar', merchant:'mgaxe'});
}

// ---- 4. sets for the five newer lines ----
{ const NEW = {occult:['ไสยมนตรา', 'Arcane Hex', {curseAmp:.1, matkPct:.04}, {curseAmp:.2, matkPct:.1}],
    merchant:['วาณิชทองคำ', 'Golden Merchant', {atkPct:.05, crit:4}, {atkPct:.12, crit:8}],
    catfolk:['วิเชียรมาศเทพ', 'Divine Siamese', {crit:4, critDmg:.15}, {crit:8, critDmg:.3, atkPct:.06}],
    dogfolk:['บางแก้วเทพ', 'Divine Bangkaew', {dmgRed:.05, hpPct:.05}, {dmgRed:.1, hpPct:.1, atkPct:.05}],
    ninja:['เงาจันทร์', 'Moonshadow', {castPct:.06, matkPct:.04}, {castPct:.12, matkPct:.1, crit:4}]};
  for (const line in NEW){ if (typeof CSET === 'undefined' || CSET[line] || !JOBS[line]) continue; CSET[line] = NEW[line]; const [th, en, b2, b4] = NEW[line];
    // Lv 150 class set (armour, crown, talisman, boots)
    if (typeof CSET_SLOTS !== 'undefined') for (const [slot, sth, sen, art, st] of CSET_SLOTS){ const id = `cs_${line}_${slot}`;
      ITEMS[id] = {name:`${sth}${th}`, en:`${en} ${sen}`, kind:'gear', slot, lv:150, st:{...st, line, cset:line}, buy:0, sell:40000, artAs:art, desc:[`ชุดประจำสาย · ${th}`, `Class set · ${en}`]};
      if (SPR.GEAR_LOOK[art]) SPR.GEAR_LOOK[id] = SPR.GEAR_LOOK[art]; }
    // Lv 40 and 90 line sets (vest, circlet, greaves, boots)
    if (typeof G10_TIERS !== 'undefined') for (const [t, lv, tth, ten, k] of G10_TIERS){ const key = `${line}${t}`;
      CSET[key] = [`${tth}${th}`, `${en} ${ten}`, g10Scale(b2, k), g10Scale(b4, k)];
      for (const [slot, sth, sen] of G10_SET_SLOTS){ const id = `cs_${key}_${slot === 'pants' ? 'legs' : slot}`, near = g10Near(slot, lv); if (!near) continue;
        const st = {}; for (const s in near[6]) st[s] = typeof near[6][s] === 'number' ? Math.round(near[6][s] * 1.15 * 100) / 100 : near[6][s];
        Object.assign(st, {line, cset:key});
        ITEMS[id] = {name:`${sth}${tth}${th}`, en:`${en} ${ten} ${sen}`, kind:'gear', slot, lv, st, buy:0, sell:Math.round(400 + lv * lv * 2), artAs:near[0], desc:[`ชุดประจำสาย${g10LineName(line)} · ${tth}`, `${g10LineName(line)} line set · ${ten}`]};
        if (SPR.GEAR_LOOK[near[0]]) SPR.GEAR_LOOK[id] = SPR.GEAR_LOOK[near[0]]; } } }
  if (typeof G10_LINES !== 'undefined') for (const l in NEW) if (!G10_LINES.includes(l)) G10_LINES.push(l);
  // the bosses share out all twelve lines now (they cycled through the first seven)
  if (typeof BOSSES !== 'undefined' && typeof G10_BOSS_LINE !== 'undefined') BOSSES.forEach(([id], i) => { G10_BOSS_LINE[id] = G10_LINES[i % G10_LINES.length]; });
}
// the item card names the armour's kind
{ const KIND = {heavy:['เกราะหนัก', 'Heavy armour'], light:['เกราะเบา', 'Light armour'], robe:['เสื้อคลุม', 'Robe']};
  if (typeof gearLines === 'function'){ const _gl = gearLines; gearLines = function(id){ const s = _gl.apply(this, arguments), it = ITEMS[id], k = it && (it.akind || (it.base && ITEMS[it.base] && ITEMS[it.base].akind));
    return k && KIND[k] ? `<span class="g335k g335k-${k}">${L(KIND[k][0], KIND[k][1])}</span> ${s}` : s; }; }
  const st = document.createElement('style'); st.textContent = `.g335k{display:inline-block;padding:0 6px;margin-right:4px;border-radius:8px;font:700 10.5px/16px var(--thai,sans-serif);color:#fff}
    .g335k-heavy{background:#6a7488}.g335k-light{background:#3a9a6a}.g335k-robe{background:#7a5ad0}`; document.head.appendChild(st); }

// ---- 4b. every dungeon guardian may leave a piece of your line's set ----
if (typeof dgReward === 'function'){ const _r = dgReward; dgReward = function(){ const r = _r.apply(this, arguments);
  try { if (Math.random() < .4 && typeof g10SetIds === 'function'){ const line = jobChain()[1]; if (line){
      const pool = g10SetIds(line).filter(id => ITEMS[id].lv <= DG.lv + 5 && ITEMS[id].lv >= DG.lv - 70);
      if (pool.length){ const id = makeInst(pool[Math.floor(Math.random() * pool.length)], Math.max(1, rollRarity('boss'))); addItem(id, 1);
        banner(L(`✦ ชิ้นส่วนชุดประจำสาย: ${nm(ITEMS[id])} ✦`, `✦ Line set piece: ${nm(ITEMS[id])} ✦`)); log(L(`ผู้พิทักษ์ทิ้ง ${nm(ITEMS[id])} ไว้`, `The guardian left ${nm(ITEMS[id])}`), 'g'); SFX.play('drop2'); } } } } catch (e) {}
  return r; }; }

// ---- 5. a full set glows ----
const G335_COL = {blade:'255,190,90', rune:'140,170,255', muay:'255,120,90', ranger:'120,220,120', healer:'120,240,200', rogue:'190,120,255', summoner:'255,220,120',
  occult:'200,90,220', merchant:'255,215,80', catfolk:'255,170,210', dogfolk:'210,190,150', ninja:'150,170,230'};
const g335Full = gear => { const c = {}; for (const sl in gear || {}){ const it = gear[sl] && ITEMS[gear[sl]]; const cs = it && it.st && it.st.cset; if (cs) c[cs] = (c[cs] || 0) + 1; }
  for (const k in c) if (c[k] >= 4) return k.replace(/\d+$/, ''); return null; };
function g335Aura(g, x, y, line, t){ const col = G335_COL[line] || '255,220,140', r = 16 * PX, a = .22 + Math.sin(t * 2.4) * .06;
  g.save(); const gr = g.createRadialGradient(x, y - 2 * PX, r * .2, x, y - 2 * PX, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.beginPath(); g.ellipse(x, y - 2 * PX, r, r * .45, 0, 0, 7); g.fill();
  g.strokeStyle = `rgba(${col},${a + .15})`; g.lineWidth = 1.2 * PX; g.beginPath(); g.ellipse(x, y - 2 * PX, r * .75, r * .32, 0, t * .8, t * .8 + 4.2); g.stroke(); g.restore(); }
EV.on('draw', () => { if (typeof ctx === 'undefined' || P.dead || (typeof SETTINGS !== 'undefined' && SETTINGS.oFx === false)) return; const line = g335Full(S && S.gear); if (line) g335Aura(ctx, sx(P.x), sy(P.y), line, T);
  if (typeof AIA !== 'undefined' && AIA.map === MAP_ID) for (const a of AIA.list) if (a.setLine){ const x = sx(a.x), y = sy(a.y); if (x > -60 && x < SW + 60 && y > -60 && y < SH + 60) g335Aura(ctx, x, y, a.setLine, T + a.animT); } });

// ---- 6. (v336) every set looks like its own ----
/* The line sets (Lv 40 / 90 / 150), class sets and land sets borrowed the plain armour of their level, so a full set
   looked like any shop piece. Now the body piece wears the line's (or the land's) colours: higher grades add gold
   shoulder plates, and the top grade a cape. Robed lines keep a long skirt. */
{ const LINE = {blade:['navy', 'scarlet'], rune:['plum', 'gold', 1], ranger:['greenD', 'leather'], muay:['scarlet', 'gold'], healer:['teal', 'cream', 1], rogue:['charcoal', 'plum'],
    summoner:['cream', 'navy', 1], occult:['charcoal', 'plum', 1], merchant:['brownCl', 'gold'], catfolk:['cream', 'scarlet'], dogfolk:['brownCl', 'steel'], ninja:['charcoal', 'scarlet']};
  const LAND = {fertile:['greenD', 'gold'], arid:['cream', 'brownCl', 1], volcanic:['scarlet', 'charcoal'], frozen:['cream', 'teal'], dark:['charcoal', 'plum', 1], light:['cream', 'gold', 1]};
  for (const id in ITEMS){ const it = ITEMS[id], st = it && it.st; if (!st || !st.cset || it.slot !== 'armor' || it.base) continue;
    const cs = String(st.cset), m = /^z_([a-z]+)(\d)$/.exec(cs), lm = /^([a-z]+)(\d)?$/.exec(cs);
    const pal = m ? LAND[m[1]] : lm ? LINE[lm[1]] : null; if (!pal) continue;
    const grade = m ? +m[2] : lm[2] ? +lm[2] : 3, [c, trim, robe] = pal;
    SPR.GEAR_LOOK[id] = {...(SPR.GEAR_LOOK[it.artAs] || {}), top:c, sleeve:c, chestTrim:trim === 'cream' ? 'gold' : trim, ...(robe ? {skirt:[11.6, 1.1, 6.4, 9.2, c, trim === 'gold' ? 'gold' : 'tech'], skirtAll:true, skirtStripes:false, runeLines:grade >= 2} : {}),
      ...(grade >= 2 ? {pauldron:'gold'} : {}), ...(grade >= 3 ? {cape:trim === 'cream' || trim === 'steel' ? 'gold' : trim, capeTex:'gold'} : {})}; } }

// ---- 7. (v336) new kinds of sets: boss sets, two cross-line sets, and a 4-piece bonus you choose ----
/* · Boss sets (ชุดบอส): four great bosses each leave their own 4-piece set (25% a kill, field or dungeon): the Golden
     Jelly King (Lv 25), the Water Elephant King (Lv 75), the Phantom General of Ayodhya (Lv 105), the Garuda King (Lv 205).
   · Cross-line sets (ชุดข้ามสาย) for anyone: นักรบเวท (ATK and MATK together) and ผู้พิทักษ์ศักดิ์สิทธิ์ (toughness and
     healing), Lv 120, from dungeon guardians of Lv 90 and up.
   · On these sets the 4-piece bonus follows a path the wearer picks in the item card: บุก (power), ทน (toughness) or
     ไว (speed). Two pieces always give the set's own bonus. */
const G336_PATH = {atk:['บุก', 'Power', {atkPct:.08, matkPct:.08, crit:3}], def:['ทน', 'Toughness', {dmgRed:.08, hpPct:.1}], spd:['ไว', 'Speed', {castPct:.08, critDmg:.15, crit:2}]};
const G336_SETS = {
  bjelly:{th:'ราชาเจลลี่ทองคำ', en:'Golden Jelly King', lv:25, boss:'boss', col:['cream', 'gold'], b2:{hpPct:.05, healPow:.05}},
  bwater:{th:'วารีกุญชร', en:'Water Elephant', lv:75, boss:'waterelephantking', col:['teal', 'gold'], b2:{hpPct:.06, dmgRed:.03}},
  bphantom:{th:'แม่ทัพผีอโยธยา', en:'Phantom General', lv:105, boss:'phantomgeneral', col:['charcoal', 'steel'], b2:{atkPct:.05, critRes:6}},
  bgaruda:{th:'พญาครุฑ', en:'Garuda King', lv:205, boss:'garudaking', col:['gold', 'scarlet'], b2:{atkPct:.06, matkPct:.06}},
  xspell:{th:'นักรบเวท', en:'Spellblade', lv:120, cross:true, col:['plum', 'steel'], b2:{atkPct:.05, matkPct:.05}},
  xward:{th:'ผู้พิทักษ์ศักดิ์สิทธิ์', en:'Holy Warden', lv:120, cross:true, col:['cream', 'gold'], b2:{dmgRed:.05, healPow:.1}}};
const g336Path = key => (S && S.setPath && G336_PATH[S.setPath[key]] ? S.setPath[key] : 'atk');
if (typeof CSET !== 'undefined' && typeof g10Near === 'function'){
  const SL = [['armor', 'เกราะ', 'Armour'], ['head', 'มงกุฎ', 'Crown'], ['pants', 'สนับ', 'Greaves'], ['shoes', 'รองเท้า', 'Boots']];
  for (const key in G336_SETS){ const D = G336_SETS[key];
    const arr = [D.th, D.en, D.b2, null]; Object.defineProperty(arr, 3, {get:() => G336_PATH[g336Path(key)][2], enumerable:true}); CSET[key] = arr;
    for (const [slot, sth, sen] of SL){ const id = `cs_${key}_${slot === 'pants' ? 'legs' : slot}`, near = g10Near(slot, D.lv); if (!near || ITEMS[id]) continue;
      const st = {}; for (const s in near[6]) st[s] = typeof near[6][s] === 'number' ? Math.round(near[6][s] * 1.2 * 100) / 100 : near[6][s]; st.cset = key;
      ITEMS[id] = {name:`${sth}${D.th}`, en:`${D.en} ${sen}`, kind:'gear', slot, lv:D.lv, st, buy:0, sell:Math.round(500 + D.lv * D.lv * 2.2), artAs:near[0], desc:[D.cross ? 'ชุดข้ามสาย · ใส่ได้ทุกอาชีพ' : 'ชุดบอส', D.cross ? 'Cross-line set · any class' : 'Boss set']};
      SPR.GEAR_LOOK[id] = {...(SPR.GEAR_LOOK[near[0]] || {}), ...(slot === 'armor' ? {top:D.col[0], sleeve:D.col[0], chestTrim:D.col[1] === 'steel' ? 'charcoal' : D.col[1], pauldron:'gold', cape:D.col[1] === 'steel' ? 'charcoal' : D.col[1], capeTex:'gold'} : {})}; } }
  // boss sets drop from their boss
  EV.on('kill', m => { if (!m || !m.def || m.minion) return; for (const key in G336_SETS){ const D = G336_SETS[key]; if (D.boss !== m.type || Math.random() >= .25) continue;
      const ids = Object.keys(ITEMS).filter(id => id.startsWith(`cs_${key}_`) && !ITEMS[id].base); if (!ids.length) return;
      const id = makeInst(ids[Math.floor(Math.random() * ids.length)], Math.max(1, rollRarity('boss'))); dropLoot(id, m.x + rand(-12, 12), m.y + rand(-8, 8));
      banner(L(`✦ ชุดบอส: ${nm(ITEMS[id])} ✦`, `✦ Boss set: ${nm(ITEMS[id])} ✦`)); SFX.play('drop3'); } });
  // cross-line sets from dungeon guardians Lv 90+
  if (typeof dgReward === 'function'){ const _r = dgReward; dgReward = function(){ const r = _r.apply(this, arguments);
    try { if (DG.lv >= 90 && Math.random() < .15){ const key = Math.random() < .5 ? 'xspell' : 'xward', ids = Object.keys(ITEMS).filter(id => id.startsWith(`cs_${key}_`) && !ITEMS[id].base);
        if (ids.length){ const id = makeInst(ids[Math.floor(Math.random() * ids.length)], Math.max(1, rollRarity('boss'))); addItem(id, 1); banner(L(`✦ ชุดข้ามสาย: ${nm(ITEMS[id])} ✦`, `✦ Cross-line set: ${nm(ITEMS[id])} ✦`)); } } } catch (e) {}
    return r; }; }
  // the path picker in the item card
  if (typeof gearLines === 'function'){ const _gl = gearLines; gearLines = function(id){ const s = _gl.apply(this, arguments), it = ITEMS[id], cs = it && it.st && it.st.cset; if (!cs || !G336_SETS[cs]) return s;
    const cur = g336Path(cs); return `${s}<span class="g336p">${L('โบนัส 4 ชิ้น เลือกทาง', '4-piece path')}: ${Object.entries(G336_PATH).map(([k, v]) => `<button class="g336b${k === cur ? ' on' : ''}" data-setpath="${cs}|${k}">${L(v[0], v[1])}</button>`).join('')}</span>`; }; }
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-setpath]'); if (!b) return; e.preventDefault(); e.stopPropagation();
    const [cs, k] = b.dataset.setpath.split('|'); if (!G336_SETS[cs] || !G336_PATH[k]) return; S.setPath = S.setPath || {}; S.setPath[cs] = k; derive(); dirty = true; save();
    for (const x of document.querySelectorAll(`[data-setpath^="${cs}|"]`)) x.classList.toggle('on', x.dataset.setpath === `${cs}|${k}`);
    toast(L(`ทางของชุด: ${G336_PATH[k][0]}`, `Set path: ${G336_PATH[k][1]}`)); }, true);
  const st = document.createElement('style'); st.textContent = `.g336p{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-top:4px;font:600 11px var(--thai,sans-serif)}
    .g336b{border:1px solid rgba(130,110,230,.55);background:#fff;color:#3a2a90;border-radius:9px;padding:1px 9px;font:700 11px var(--thai,sans-serif);cursor:pointer}
    .g336b.on{background:linear-gradient(135deg,#8a5cff,#4f9dff);color:#fff;border-color:transparent}`; document.head.appendChild(st); }
