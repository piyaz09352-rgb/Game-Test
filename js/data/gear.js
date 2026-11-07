/* VAYRATHEN — js/data/gear.js
   What the central market (ตลาดกลาง) sells: potions by tier, armour, headgear and elemental arrows,
   plus the Return Talisman. Gear is worn from the Equipment window (Q); arrows set the element of
   bow attacks and bow skills (and the colour of the arrow you see). */
'use strict';

Object.assign(ITEMS, {
  orangepot:{name:'ยาส้ม', en:'Orange Potion', buy:180, kind:'use', heal:240, desc:['ฟื้น HP 240', 'Restores 240 HP']},
  whitepot:{name:'ยาขาว', en:'White Potion', buy:700, kind:'use', heal:900, desc:['ฟื้น HP 900', 'Restores 900 HP']},
  elixirpot:{name:'ยาอายุวัฒนะ', en:'Elixir of Life', buy:2600, kind:'use', heal:3000, desc:['ฟื้น HP 3,000', 'Restores 3,000 HP']},
  bigbluepot:{name:'ยาฟ้าเข้ม', en:'Deep Blue Potion', buy:1800, kind:'use', spheal:220, desc:['ฟื้น SP 220', 'Restores 220 SP']},
  divinepot:{name:'ยาทิพย์', en:'Divine Draught', buy:6500, kind:'use', heal:8000, desc:['ฟื้น HP 8,000', 'Restores 8,000 HP']},
  skypot:{name:'ยาฟ้าสวรรค์', en:'Celestial Blue', buy:4800, kind:'use', spheal:600, desc:['ฟื้น SP 600', 'Restores 600 SP']},
  talisman:{name:'ยันต์กลับบ้าน', en:'Return Talisman', buy:250, kind:'use', recall:true, desc:['วาร์ปกลับหมู่บ้านอาเรน', 'Warps you back to Aren village']}
});

/* [id, slot, th, en, req Lv, price, stats] */
const GEAR_LIST = [
  ['a_cotton', 'armor', 'เสื้อฝ้ายทอมือ', 'Handwoven Cotton Shirt', 1, 120, {def:3}],
  ['a_buffalo', 'armor', 'เสื้อหนังควาย', 'Buffalo Leather Vest', 15, 900, {def:8, hp:60}],
  ['a_rattan', 'armor', 'เกราะหวายสาน', 'Woven Rattan Armour', 30, 3200, {def:14, hp:150}],
  ['a_padded', 'armor', 'เกราะนวมนักรบ', "Warrior's Padded Armour", 45, 8500, {def:20, mdef:4, hp:300}],
  ['a_scale', 'armor', 'เกราะเกล็ดเหล็ก', 'Iron Scale Armour', 60, 18000, {def:28, mdef:5, hp:500}],
  ['a_yantra', 'armor', 'เสื้อยันต์ลงอาคม', 'Inscribed Yantra Shirt', 80, 38000, {def:34, mdef:12, hp:800, sp:40}],
  ['a_naga', 'armor', 'เกราะเกล็ดนาคทอง', 'Golden Naga Scale Armour', 100, 72000, {def:44, mdef:16, hpPct:.05}],
  ['a_suvarna', 'armor', 'เกราะสุวรรณเทวา', 'Celestial Gold Armour', 115, 140000, {def:56, mdef:22, hpPct:.08, all:2}],
  ['h_cloth', 'head', 'ผ้าโพกหัว', 'Head Cloth', 1, 80, {def:1}],
  ['h_ngob', 'head', 'หมวกงอบ', 'Palm-leaf Ngob Hat', 10, 600, {def:2, hp:40}],
  ['h_leather', 'head', 'หมวกหนังนักเดินทาง', "Traveller's Leather Cap", 25, 2400, {def:4, hp:90}],
  ['h_lotus', 'head', 'หมวกเหล็กกลีบบัว', 'Lotus-petal Iron Helm', 45, 7800, {def:7, mdef:2}],
  ['h_mongkhon', 'head', 'มงคลลงยันต์', 'Inscribed Mongkhon', 65, 21000, {def:6, mdef:8, sp:60}],
  ['h_chada', 'head', 'ชฎานักรบ', "Warrior's Chada", 85, 46000, {def:10, mdef:8, str:2, dex:2}],
  ['h_goldchada', 'head', 'ชฎาทองคำ', 'Golden Chada', 110, 110000, {def:14, mdef:12, all:2}],
  // arrows: sold 100 to a quiver and used up one per shot; the quiver you wear decides the element of bow attacks
  ['q_wood', 'ammo', 'ลูกธนูไม้ไผ่', 'Bamboo Arrows', 1, 50, {elem:'neutral', atk:2}],
  ['q_fire', 'ammo', 'ลูกธนูไฟ', 'Fire Arrows', 20, 2400, {elem:'fire', atk:6}],
  ['q_ice', 'ammo', 'ลูกธนูน้ำแข็ง', 'Ice Arrows', 20, 2400, {elem:'water', atk:6}],
  ['q_wind', 'ammo', 'ลูกธนูลม', 'Wind Arrows', 20, 2400, {elem:'wind', atk:6}],
  ['q_earth', 'ammo', 'ลูกธนูหิน', 'Stone Arrows', 20, 2400, {elem:'earth', atk:6}],
  ['q_holy', 'ammo', 'ลูกธนูเงินศักดิ์สิทธิ์', 'Silver Arrows', 50, 9000, {elem:'holy', atk:10}],
  ['q_shadow', 'ammo', 'ลูกธนูความมืด', 'Shadow Arrows', 50, 9000, {elem:'shadow', atk:10}],
  // (v184) throwing stars for the ninja line's pouch (one per throw): they add MATK and lend their element to the throw
  ['s_iron', 'ammo', 'ดาวกระจายเหล็ก', 'Iron Stars', 1, 60, {star:1, elem:'neutral', smatk:3}],
  ['s_fire', 'ammo', 'ดาวกระจายเพลิง', 'Fire Stars', 20, 2600, {star:1, elem:'fire', smatk:8}],
  ['s_ice', 'ammo', 'ดาวกระจายน้ำแข็ง', 'Frost Stars', 20, 2600, {star:1, elem:'water', smatk:8}],
  ['s_wind', 'ammo', 'ดาวกระจายวายุ', 'Gale Stars', 20, 2600, {star:1, elem:'wind', smatk:8}],
  ['s_earth', 'ammo', 'ดาวกระจายศิลา', 'Stone Stars', 20, 2600, {star:1, elem:'earth', smatk:8}],
  ['s_holy', 'ammo', 'ดาวกระจายเงินศักดิ์สิทธิ์', 'Silver Stars', 50, 9600, {star:1, elem:'holy', smatk:14}],
  ['s_shadow', 'ammo', 'ดาวกระจายเงามืด', 'Shadow Stars', 50, 9600, {star:1, elem:'shadow', smatk:14}]
];
/* weapons and accessories: these only drop from monsters (not sold). Weapons are kept per weapon type, so a
   class can only wield its own kind; armour, headgear and accessories fit every class.
   weapon stats: watk / wmatk replace the class's starting weapon; other keys add like any gear */
/* how a weapon is held: 1h มือเดียว (dagger, blade, rod) · 2h สองมือ (knuckles, bow, greatsword, longstaff) */
const HANDS_DEF = {dagger:'1h', sword:'1h', staff:'1h', fist:'2h', bow:'2h', shuriken:'2h'};   // (v184) the ninja's throwing stars: held in one hand, a two-handed class of weapon
const handsOf = st => (st && st.wtype ? st.hands || HANDS_DEF[st.wtype] || '1h' : null);
const handsTxt = h => (h === '2h' ? L('สองมือ', 'Two-handed') : L('มือเดียว', 'One-handed'));
const WEAPON_TIERS = [[10, 'ฝึกหัด', 'Apprentice'], [30, 'เหล็กกล้า', 'Steel'], [55, 'ยันต์เพลิง', 'Ember'], [80, 'นิลกาฬ', 'Obsidian'], [100, 'นาคราช', 'Naga'], [115, 'สุริยเทพ', 'Solar'],
  [140, 'อัคนีกาฬ', 'Infernal'], [170, 'วชิระ', 'Vajra'], [200, 'เทวราช', 'Devaraja'], [240, 'หิมพานต์', 'Himmapan'], [280, 'จักรพรรดิ', 'Chakravartin']];   // Lv 140–280: the roads past 120
const WEAPON_KINDS = {sword:['ดาบ', 'Blade', 1, 0], dagger:['มีดสั้น', 'Dagger', .82, 0], staff:['คทา', 'Staff', .45, 1], fist:['สนับมือ', 'Knuckles', .8, 0], bow:['ธนู', 'Bow', .88, 0]};
for (const wt in WEAPON_KINDS){ const [th, en, ak, mk] = WEAPON_KINDS[wt];
  WEAPON_TIERS.forEach(([lv, tth, ten], i) => { const atk = Math.round((18 + lv * 1.25) * ak), st = {wtype:wt, watk:atk};
    if (mk) st.wmatk = Math.round(25 + lv * 1.5); if (i >= 2) st[wt === 'staff' ? 'int' : wt === 'bow' ? 'dex' : wt === 'dagger' ? 'agi' : 'str'] = i; if (i >= 4) st.crit = i;
    st.hands = HANDS_DEF[wt]; GEAR_LIST.push([`w_${wt}${i}`, 'weapon', `${th}${tth}`, `${ten} ${en}`, lv, 400 + lv * lv * 9, st]); }); }
/* (v184) ดาวกระจาย — the ninja line's weapon: thrown stars that strike with magic (MATK), held in one hand but counted as
   two-handed (no shield). Each throw uses one star from the pouch (the ammo slot), like a bow uses arrows. */
WEAPON_TIERS.forEach(([lv, tth, ten], i) => { const st = {wtype:'shuriken', hands:'2h', watk:Math.round((18 + lv * 1.25) * .35), wmatk:Math.round((25 + lv * 1.5) * 1.08)};
  if (i >= 2){ st.int = i; st.dex = Math.ceil(i / 2); } if (i >= 4) st.crit = i;
  GEAR_LIST.push([`w_shuriken${i}`, 'weapon', `ดาวกระจาย${tth}`, `${ten} Shuriken`, lv, 400 + lv * lv * 9, st]); });
/* two-handed lines: greatswords for sword classes, longstaves for staff classes. Held in both hands: more power
   (ATK +20% · MATK +25%), slower swings (ASPD −8). One-handed blades and rods swing faster (ASPD +3). */
WEAPON_TIERS.forEach(([lv, tth, ten], i) => {
  const gs = {wtype:'sword', hands:'2h', watk:Math.round((18 + lv * 1.25) * 1.2)}; if (i >= 2) gs.str = i + 1; if (i >= 4) gs.crit = i;
  GEAR_LIST.push([`w_gsword${i}`, 'weapon', `ดาบสองมือ${tth}`, `${ten} Greatsword`, lv, Math.round((400 + lv * lv * 9) * 1.15), gs]);
  // twin daggers (มีดคู่): the thief line's two-handed weapon — a blade in each hand, more power and more critical hits, still quick
  const td = {wtype:'dagger', hands:'2h', watk:Math.round((18 + lv * 1.25) * .82 * 1.22), crit:3 + i}; if (i >= 2) td.agi = i + 1;
  GEAR_LIST.push([`w_tdagger${i}`, 'weapon', `มีดคู่${tth}`, `${ten} Twin Daggers`, lv, Math.round((400 + lv * lv * 9) * 1.15), td]);
  // the boxer's own two-handed pairs (worn on both fists, like the thief's twin daggers):
  //   นวมคู่ (boxing gloves) — the heaviest punches; กรงเล็บคู่ (strapped-on claws) — three blades over each fist, more critical hits
  const gv = {wtype:'fist', hands:'2h', glove:1, watk:Math.round((18 + lv * 1.25) * .8 * 1.18), hp:20 + lv * 3}; if (i >= 2) gv.str = i + 1;
  GEAR_LIST.push([`w_glove${i}`, 'weapon', `นวมคู่${tth}`, `${ten} Boxing Gloves`, lv, Math.round((400 + lv * lv * 9) * 1.15), gv]);
  const cl = {wtype:'fist', hands:'2h', claw:1, watk:Math.round((18 + lv * 1.25) * .8 * 1.1), crit:5 + i}; if (i >= 2) cl.agi = i + 1;
  GEAR_LIST.push([`w_claw${i}`, 'weapon', `กรงเล็บคู่${tth}`, `${ten} Twin Claws`, lv, Math.round((400 + lv * lv * 9) * 1.2), cl]);
  const ls = {wtype:'staff', hands:'2h', watk:Math.round((18 + lv * 1.25) * .45 * 1.2), wmatk:Math.round((25 + lv * 1.5) * 1.25)}; if (i >= 2) ls.int = i + 1; if (i >= 4) ls.crit = i;
  GEAR_LIST.push([`w_lstaff${i}`, 'weapon', `ไม้เท้ายาว${tth}`, `${ten} Longstaff`, lv, Math.round((400 + lv * lv * 9) * 1.15), ls]);
  // class weapons (only their own line can use them; `line` = the tier-2 class of the line)
  const P0 = Math.round((400 + lv * lv * 9) * 1.25), mk0 = Math.round(25 + lv * 1.5), ak0 = 18 + lv * 1.25;
  GEAR_LIST.push([`w_estaff${i}`, 'weapon', `คทาจตุธาตุ${tth}`, `${ten} Elemental Staff`, lv, P0, {wtype:'staff', hands:'2h', line:'rune', watk:Math.round(ak0 * .45), wmatk:Math.round(mk0 * 1.3), castPct:+(.05 + i * .01).toFixed(2), int:i + 1}]);
  GEAR_LIST.push([`w_hstaff${i}`, 'weapon', `ไม้เท้าโอสถ${tth}`, `${ten} Herbal Staff`, lv, P0, {wtype:'staff', hands:'2h', line:'healer', watk:Math.round(ak0 * .45), wmatk:Math.round(mk0 * 1.15), healPow:+(.08 + i * .02).toFixed(2), vit:i + 1}]);
  GEAR_LIST.push([`w_sstaff${i}`, 'weapon', `คทาสังข์อัญเชิญ${tth}`, `${ten} Conch Sceptre`, lv, P0, {wtype:'staff', hands:'2h', line:'summoner', watk:Math.round(ak0 * .45), wmatk:Math.round(mk0 * 1.1), sumAtk:+(.08 + i * .02).toFixed(2), int:i + 1}]);
  // ดาบขุนพล: the warrior line's own blade (v28, it took over from the retired warrior shields): one-handed, cuts the damage you take
  GEAR_LIST.push([`w_bsword${i}`, 'weapon', `ดาบขุนพล${tth}`, `${ten} Warlord Blade`, lv, P0, {wtype:'sword', hands:'1h', line:'blade', watk:Math.round(ak0 * 1.05), hp:Math.round(30 + lv * 2.2), dmgRed:+(.02 + i * .004).toFixed(3), critRes:2 + i, ...(i >= 2 ? {vit:i} : {})}]);
  GEAR_LIST.push([`w_wbow${i}`, 'weapon', `ธนูยาวพงไพร${tth}`, `${ten} Wildwood Longbow`, lv, P0, {wtype:'bow', hands:'2h', line:'ranger', watk:Math.round(ak0 * .88 * 1.12), petAtk:+(.08 + i * .02).toFixed(2), range:10 + i * 2, dex:i + 1}]);
});
/* accessories: rings, amulets and charms for every class */
GEAR_LIST.push(
  ['x_ring', 'acc', 'แหวนทองเหลือง', 'Brass Ring', 5, 300, {luk:1, hp:20}],
  ['x_bead', 'acc', 'สร้อยลูกปัดนำโชค', 'Lucky Bead Necklace', 20, 1500, {luk:2, crit:2}],
  ['x_amulet', 'acc', 'จี้หยกพิทักษ์', 'Jade Guardian Amulet', 40, 6000, {vit:3, hpPct:.04}],
  ['x_charm', 'acc', 'เครื่องรางนักรบ', "Warrior's Charm", 55, 12000, {str:3, dex:2, atkPct:.03}],
  ['x_moon', 'acc', 'แหวนจันทรา', 'Moonstone Ring', 70, 22000, {int:4, spPct:.08, matkPct:.04}],
  ['x_tiger', 'acc', 'เขี้ยวเสือสมิง', 'Saming Fang Charm', 90, 42000, {agi:4, crit:4, atkPct:.04}],
  ['x_naga', 'acc', 'มณีนาคราช', 'Naga Jewel', 105, 70000, {all:2, hpPct:.05, spPct:.05}],
  ['x_sun', 'acc', 'ตราสุริยเทพ', 'Solar Seal', 118, 120000, {all:4, atkPct:.05, matkPct:.05}],
  // Lv 140–280: armour, headgear and accessories for the far roads (same steps as the weapons)
  ['a_infernal', 'armor', 'เกราะอัคนีกาฬ', 'Infernal Plate', 140, 190000, {def:68, mdef:28, hpPct:.1, all:2}],
  ['a_vajra', 'armor', 'เกราะวชิระ', 'Vajra Armour', 170, 280000, {def:82, mdef:34, hpPct:.12, all:2}],
  ['a_devaraja', 'armor', 'เกราะเทวราช', 'Devaraja Armour', 200, 390000, {def:96, mdef:40, hpPct:.14, all:3}],
  ['a_himmapan', 'armor', 'เกราะหิมพานต์', 'Himmapan Armour', 240, 560000, {def:115, mdef:48, hpPct:.16, all:3}],
  ['a_chakra', 'armor', 'เกราะจักรพรรดิ', 'Chakravartin Armour', 280, 760000, {def:134, mdef:56, hpPct:.18, all:4}],
  ['h_infernal', 'head', 'มงกุฎอัคนีกาฬ', 'Infernal Crown', 140, 170000, {def:18, mdef:15, all:2}],
  ['h_vajra', 'head', 'ชฎาวชิระ', 'Vajra Chada', 170, 250000, {def:22, mdef:18, all:2}],
  ['h_devaraja', 'head', 'มงกุฎเทวราช', 'Devaraja Crown', 200, 350000, {def:26, mdef:22, all:3}],
  ['h_himmapan', 'head', 'ชฎาหิมพานต์', 'Himmapan Chada', 240, 500000, {def:31, mdef:26, all:3}],
  ['h_chakra', 'head', 'มหามงกุฎจักรพรรดิ', 'Chakravartin Great Crown', 280, 690000, {def:36, mdef:30, all:4}],
  ['x_infernal', 'acc', 'แหวนอัคนีกาฬ', 'Infernal Ring', 140, 160000, {all:3, atkPct:.06, matkPct:.06}],
  ['x_vajra', 'acc', 'ตราวชิระ', 'Vajra Seal', 170, 240000, {all:3, atkPct:.07, matkPct:.07, crit:4}],
  ['x_devaraja', 'acc', 'มณีเทวราช', 'Devaraja Jewel', 200, 340000, {all:4, atkPct:.08, matkPct:.08, hpPct:.05}],
  ['x_himmapan', 'acc', 'เครื่องรางหิมพานต์', 'Himmapan Talisman', 240, 480000, {all:4, atkPct:.09, matkPct:.09, crit:5}],
  ['x_chakra', 'acc', 'จักรรัตนะ', 'Chakra Gem', 280, 660000, {all:5, atkPct:.1, matkPct:.1, hpPct:.06}]
);
/* ---------- the paper doll: 8 places (v29) ----------
   อาวุธ Weapon · โล่ Shield (left hand) · หมวก Head · เกราะ Body · กางเกง Legs · รองเท้า Feet · เครื่องประดับ ×2 — plus the quiver for bow users.
   Shields, legs and feet have eleven tiers from Lv 1 to Lv 280; they drop from monsters near their level and the
   blacksmith sells them. Shield: DEF, Max HP and BLOCK · Legs: DEF, Max HP, VIT · Feet: DEF, FLEE and move speed. */
const EQ_ALL = ['weapon', 'shield', 'head', 'armor', 'pants', 'shoes', 'acc', 'acc2'];
const EQ_NEW_LV = [1, 15, 30, 50, 75, 100, 130, 170, 210, 250, 280];
const EQ_NEW = {
  shield:{p:'sd', n:[['โล่ไม้ไผ่สาน', 'Woven Bamboo Shield'], ['โล่หนังควาย', 'Buffalo Hide Shield'], ['โล่หวายเคลือบรัก', 'Lacquered Rattan Shield'], ['โล่เหล็กกลีบบัว', 'Lotus Steel Shield'], ['โล่ลงยันต์', 'Yantra Ward Shield'], ['โล่เกล็ดนาคราช', 'Naga Scale Shield'], ['โล่สุริยเทพ', 'Solar Aegis'], ['โล่อัคนีกาฬ', 'Infernal Bulwark'], ['โล่วชิระ', 'Vajra Shield'], ['โล่เทวราช', 'Devaraja Aegis'], ['โล่หิมพานต์', 'Himmapan Aegis']],
    st:(L, i) => ({def:Math.round(1 + L * .1), hp:Math.round(15 + L * 1.5), block:Math.round(3 + i * .8), ...(i >= 5 ? {mdef:Math.round(L * .04)} : {})})},
  pants:{p:'pt', n:[['กางเกงขาก๊วย', "Farmer's Trousers"], ['กางเกงหนังควาย', 'Buffalo Leather Trousers'], ['โจงกระเบนนักรบ', "Warrior's Chong Kraben"], ['สนับแข้งเหล็กกล้า', 'Steel Legguards'], ['สนับเพลาลงยันต์', 'Inscribed Sanap Phlao'], ['สนับเพลาเกล็ดนาค', 'Naga Scale Legguards'], ['สนับเพลาสุริยเทพ', 'Solar Legguards'], ['สนับเพลาอัคนี', 'Infernal Legguards'], ['สนับเพลาวชิระ', 'Vajra Legguards'], ['สนับเพลาเทวราช', 'Devaraja Legguards'], ['สนับเพลาหิมพานต์', 'Himmapan Legguards']],
    st:(L, i) => ({def:Math.round(1 + L * .06), hp:Math.round(10 + L * 1.2), ...(i >= 3 ? {vit:i >> 1} : {})})},
  shoes:{p:'sh', n:[['รองเท้าแตะฟาง', 'Straw Sandals'], ['รองเท้าหนังควาย', 'Buffalo Leather Shoes'], ['รองเท้าสานหวาย', 'Woven Rattan Boots'], ['รองเท้าบู๊ตเหล็ก', 'Steel Boots'], ['รองเท้ายันต์เหาะ', 'Yantra Wind Boots'], ['รองเท้าเกล็ดนาค', 'Naga Scale Boots'], ['รองเท้าสุริยเทพ', 'Solar Boots'], ['รองเท้าอัคนี', 'Infernal Boots'], ['รองเท้าวชิระ', 'Vajra Boots'], ['รองเท้าเทวราช', 'Devaraja Boots'], ['รองเท้าหิมพานต์', 'Himmapan Boots']],
    st:(L, i) => ({def:Math.round(1 + L * .035), flee:Math.round(1 + L * .03), movePct:+(.02 + i * .006).toFixed(3)})}
};
for (const sl in EQ_NEW){ const D = EQ_NEW[sl];
  EQ_NEW_LV.forEach((lv, i) => GEAR_LIST.push([`${D.p}_${i}`, sl, D.n[i][0], D.n[i][1], lv, Math.round(260 + lv * lv * 6.5), D.st(lv, i)])); }
Object.assign(SLOT_TH, {shield:'มือซ้าย', pants:'กางเกง', shoes:'รองเท้า', acc2:'เครื่องประดับ 2'});
Object.assign(SLOT_EN, {shield:'Left hand', pants:'Legs', shoes:'Feet', acc2:'Accessory 2'});
/* fewer places, same strength: body armour and headgear carry what the retired places used to give
   (armour: Max HP of the mouth pieces · headgear: MDEF, Max SP, HIT and FLEE), about three quarters of it */
for (const g of GEAR_LIST){ const L = g[4], st = g[6];
  if (g[1] === 'armor'){ st.hp = (st.hp || 0) + Math.round(.75 * (20 + L * 2)); }   // v29: shields and legs are back with their own DEF/HP, so armour keeps only the mouth-piece share
  if (g[1] === 'head'){ st.mdef = (st.mdef || 0) + Math.round(.75 * (1 + L * .07)); st.sp = (st.sp || 0) + Math.round(.75 * (8 + L * .6)); st.hit = (st.hit || 0) + Math.round(.75 * (2 + L * .08)); st.flee = (st.flee || 0) + Math.round(.75 * (1 + L * .05)); } }
/* ---------- retired pieces (v28): warlord shields, earrings, eyewear, masks and mouth pieces no longer exist (shields and legs came back in v29) ----------
   A save or bank that still holds one: the piece is sold for twice its shop sell price (more for rarer rolls), the
   cards in it go back to the card tab, and a class-set legguard becomes the same set's talisman (accessory). */
const GONE_RE = /^(sw|er|ey|fc|mo)_(\d+)$/, GONE_SL = ['ear', 'eye', 'face', 'mouth'], CS_PANTS = /^cs_([a-z]+)_pants/;
function goneSell(b){ const m = GONE_RE.exec(b); if (!m) return 0; const lv = EQ_NEW_LV[+m[2]] || 1; return Math.round((260 + lv * lv * 6.5) * (m[1] === 'sw' ? 1.3 : 1) * .4); }
function gonePurge(inv, inst, gear){
  const out = {n:0, z:0, cards:{}}; inv = inv || {}; inst = inst || {};
  const base = k => String((inst[k] && inst[k].b) || k).split('~')[0], card = c => { if (typeof c === 'string') out.cards[c] = (out.cards[c] || 0) + 1; };
  const drop = (k, q) => { const d = inst[k]; out.n += q; out.z += Math.round(goneSell(base(k)) * (1 + ((d && d.r) | 0) * .9) * 2) * q; if (d){ (Array.isArray(d.c) ? d.c : []).forEach(card); delete inst[k]; } };
  const ren = k => { const nk = String(k).replace(CS_PANTS, 'cs_$1_acc'); if (nk === k) return k; const d = inst[k]; if (d){ d.b = String(d.b).replace(CS_PANTS, 'cs_$1_acc'); (Array.isArray(d.c) ? d.c : []).forEach(card); d.c = []; d.k = 0; inst[nk] = d; delete inst[k]; } return nk; };
  for (const k of Object.keys(inv)){ const b = base(k);
    if (GONE_RE.test(b)){ drop(k, Math.max(1, inv[k] | 0)); delete inv[k]; }
    else if (CS_PANTS.test(b)){ const q = inv[k]; delete inv[k]; const nk = ren(k); inv[nk] = (inv[nk] || 0) + q; } }
  if (gear) for (const sl of Object.keys(gear)){ const k = gear[sl];
    if (GONE_SL.includes(sl)){ delete gear[sl]; if (!k) continue; const b = base(k);
      if (GONE_RE.test(b)) drop(k, 1); else { const nk = CS_PANTS.test(b) ? ren(k) : k; inv[nk] = (inv[nk] || 0) + 1; } }   // an off-hand weapon goes back to the bag
    else if (k && GONE_RE.test(base(k))){ drop(k, 1); gear[sl] = null; } }
  for (const k of Object.keys(inst)) if (GONE_RE.test(base(k))) drop(k, 0);   // strays: just the cards
  return out;
}
const GEAR = {};
for (const [id, slot, th, en, lv, price, st] of GEAR_LIST){ const pack = slot === 'ammo' ? 100 : 1; GEAR[id] = {id, slot, name:th, en, lv, buy:price, st, pack}; ITEMS[id] = {name:th, en, buy:price, sell:Math.round(price * .4 / pack), kind:slot === 'ammo' ? 'ammo' : 'gear', slot, lv, st, pack}; }
const GEAR_SLOT = {shield:['โล่ (มือซ้าย)', 'Shield (left hand)'], pants:['กางเกง', 'Legs'], shoes:['รองเท้า', 'Footwear'], armor:['เกราะ', 'Armor'], head:['หมวก', 'Headgear'], ammo:['ลูกธนู', 'Arrows'], weapon:['อาวุธ', 'Weapon'], acc:['เครื่องประดับ', 'Accessory']};
for (const id in GEAR) if (GEAR[id].st.wtype) ITEMS[id].wtype = GEAR[id].st.wtype;
const lineOk = st => !(st && st.line && !jobChain().includes(st.line));   // class gear: only its own line
const canWield = it => lineOk(it.st) && (!it.wtype || it.wtype === JOBS[S.job].weapon.type) && !(it.st && it.st.wtype === 'dagger' && it.st.hands === '2h' && !jobChain().includes('rogue') && !jobChain().includes('ninja'))   // twin daggers / katana: the thief and ninja lines only
  && (typeof wieldOk !== 'function' || wieldOk(it));   // (v164) extra rules (sys/newlines.js: axes for the merchant line only, and only axes for it)
/* monsters drop gear near their level: armour, headgear, accessories, and weapons of the killer's own class */
function gearDrop(m){
  const lvl = m.def.lvl, wt = JOBS[S.job].weapon.type;
  const pool = GEAR_LIST.filter(g => g[1] !== 'ammo' && g[4] <= lvl + 5 && g[4] >= Math.min(lvl, LV_MAX) - 30 && lineOk(g[6]) && (g[1] !== 'weapon' || (g[6].wtype === wt && !(g[6].hands === '2h' && wt === 'dagger' && !jobChain().includes('rogue')))));
  if (!pool.length) return null; return pool[Math.floor(Math.random() * pool.length)][0];
}
/* ---------- arrows ---------- */
/* (v184) two kinds of ammo: arrows for bows, throwing stars (st.star) for the ninja's ดาวกระจาย; each only fits its own weapon */
const ammoWant = () => (JOBS[S.job].weapon.type === 'shuriken' ? 'star' : 'arrow');
const ammoKind = id => (ITEMS[id] && ITEMS[id].st && ITEMS[id].st.star ? 'star' : 'arrow');
const usesArrows = () => JOBS[S.job].weapon.type === 'bow' || JOBS[S.job].weapon.type === 'shuriken';
const ammoFits = id => usesArrows() && !!ITEMS[id] && ITEMS[id].kind === 'ammo' && ammoKind(id) === ammoWant();
const ammoStarter = () => (ammoWant() === 'star' ? 's_iron' : 'q_wood');
const ammoOther = () => GEAR_LIST.find(g => g[1] === 'ammo' && S.inv[g[0]] > 0 && S.lvl >= g[4] && ammoKind(g[0]) === ammoWant());
function arrowCount(){ const id = S.gear && S.gear.ammo, n = id && ammoFits(id) ? S.inv[id] || 0 : 0; if (n) return n; const o = ammoOther(); return o ? S.inv[o[0]] : 0; }
/* (v190) the ammo slot only ever holds what this class shoots: stars left from the ninja in a hunter's quiver (or arrows in
   a ninja's pouch, or either on a class that shoots nothing) are taken out of the slot; they stay in the bag.
   Run on the game tick by sys/shuriken.js (EV is made later than this file) */
function ammoClean(){ if (typeof PAUSED !== 'undefined' && PAUSED || !S || !S.gear || !S.gear.ammo) return;
  if (!ammoFits(S.gear.ammo) || !(S.inv[S.gear.ammo] > 0)){ S.gear.ammo = null; derive(); dirty = true; } }   // wrong kind, or a stack at 0
/* take n arrows from the worn quiver; when it runs dry switch to any other arrows in the bag. false = none left */
function useArrows(n = 1){
  if (!usesArrows()) return true;
  S.gear = S.gear || {};
  if (S.gear.ammo && !ammoFits(S.gear.ammo)) S.gear.ammo = null;   // arrows in a ninja's pouch (or stars in a quiver) do not count
  const star = ammoWant() === 'star';
  // (v190) nothing loaded = no shot: arrows (or stars) lying in the bag are not used until you load them yourself
  // (it used to take any from the bag, so a hunter with an empty slot still shot). A loaded stack that runs out
  // mid-fight empties the slot (v190 follow-up: no switching to other stacks either).
  if (!S.gear.ammo){ if (T - (P.noArrowT || -9) > 2){ P.noArrowT = T; toast(star ? L('ยังไม่ได้ใส่ดาวกระจาย · เปิดกระเป๋าแล้วกด "ใส่ดาวกระจาย"', 'No stars loaded · open the bag and load some') : L('ยังไม่ได้ใส่ลูกธนู · เปิดกระเป๋าแล้วกด "ใส่ลูกธนู"', 'No arrows loaded · open the bag and load some')); }
    if (BOT.on){ setBot(false); banner(star ? L('Auto หยุด: ยังไม่ได้ใส่ดาวกระจาย', 'Auto stopped: no stars loaded') : L('Auto หยุด: ยังไม่ได้ใส่ลูกธนู', 'Auto stopped: no arrows loaded')); } return false; }
  // the loaded stack only: when it is empty you load another yourself (no switching to other arrows in the bag)
  const id = S.gear.ammo, have = id ? S.inv[id] || 0 : 0;
  if (!have){ if (T - (P.noArrowT || -9) > 2){ P.noArrowT = T; toast(star ? L('ดาวกระจายหมด! ซื้อได้ที่ร้านตีบวก (โรงตีเหล็ก)', 'Out of throwing stars! Buy more at the smith') : L('ลูกธนูหมด! ซื้อได้ที่ร้านป้าบัวคำ', 'Out of arrows! Buy more from Auntie Buakham\'s store')); }
    if (BOT.on){ setBot(false); banner(star ? L('Auto หยุด: ดาวกระจายหมด', 'Auto stopped: out of stars') : L('Auto หยุด: ลูกธนูหมด', 'Auto stopped: out of arrows')); } return false; }
  S.inv[id] = have - Math.min(have, n); if (!S.inv[id]){ delete S.inv[id]; S.gear.ammo = null; derive(); toast(star ? L('ดาวกระจายหมด · ใส่กองใหม่ในกระเป๋า', 'Out of stars · load more from the bag') : L('ลูกธนูหมด · ใส่กองใหม่ในกระเป๋า', 'Out of arrows · load more from the bag')); } dirty = true;   // (v190) the last one shot empties the slot
  return true;
}
function gearStatText(st){
  const out = [];
  if (st.elem) out.push(elemName(st.elem));
  if (st.watk) out.push(`${st.claw ? L('กรงเล็บคู่', 'Twin claws') : st.glove ? L('นวมคู่', 'Boxing gloves') : st.wtype === 'dagger' && handsOf(st) === '2h' ? L('มีดคู่', 'Twin daggers') : st.axe ? L('ขวาน', 'Axe') : st.wtype === 'shuriken' && st.hands === '1h' ? L('คุไน', 'Kunai') : L(...WTYPE[st.wtype])} (${st.wtype === 'shuriken' && st.hands !== '1h' ? handsTxt('2h') : handsTxt(handsOf(st))}) · ATK ${st.watk}`);
  if (st.wmatk) out.push(`MATK ${st.wmatk}`);
  if (st.smatk) out.push(`MATK +${st.smatk}`);
  if (st.atk) out.push(`ATK +${st.atk}`);
  if (st.crit) out.push(`CRIT +${st.crit}%`);
  if (st.atkPct) out.push(`ATK +${Math.round(st.atkPct * 100)}%`);
  if (st.matkPct) out.push(`MATK +${Math.round(st.matkPct * 100)}%`);
  if (st.spPct) out.push(`Max SP +${Math.round(st.spPct * 100)}%`);
  if (st.block) out.push(`Block ${st.block}%`);
  if (st.hit) out.push(`HIT +${st.hit}`);
  if (st.flee) out.push(`FLEE +${st.flee}`);
  if (st.movePct) out.push(`Move Speed +${Math.round(st.movePct * 100)}%`);
  if (st.def) out.push(`DEF +${st.def}`);
  if (st.critRes) out.push(`Critical Resistance +${st.critRes}%`);
  if (st.dmgRed) out.push(`Damage Taken −${+(st.dmgRed * 100).toFixed(1)}%`);
  if (st.castPct) out.push(`Cast Time −${Math.round(st.castPct * 100)}%`);
  if (st.healPow) out.push(`Healing +${Math.round(st.healPow * 100)}%`);
  if (st.sumAtk) out.push(`Summon DMG +${Math.round(st.sumAtk * 100)}%`);
  if (st.petAtk) out.push(`Pet DMG +${Math.round(st.petAtk * 100)}%`);
  if (st.range) out.push(`Range +${st.range}`);
  if (st.line && JOBS[st.line]) out.push(L(`เฉพาะสาย${JOBS[st.line].name}`, `${JOBS[st.line].en} line only`));
  if (st.mdef) out.push(`MDEF +${st.mdef}`);
  if (st.hp) out.push(`Max HP +${st.hp}`);
  if (st.hpPct) out.push(`Max HP +${Math.round(st.hpPct * 100)}%`);
  if (st.sp) out.push(`Max SP +${st.sp}`);
  for (const k of ['str', 'agi', 'vit', 'int', 'dex', 'luk']) if (st[k]) out.push(`${k.toUpperCase()} +${st[k]}`);
  if (st.all) out.push(`All Stats +${st.all}`);
  return out.join(' · ');
}

/* the market buyer's daily prices: each loot family trades between 80% and 130% of its base price */
function marketRate(id){
  const day = Math.floor(Date.now() / 864e5), it = ITEMS[id];
  let h = 0; const key = (it && it.en ? it.en.split(' ').pop() : id) + day;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return .8 + (h % 51) / 100;
}
