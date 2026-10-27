/* VAYRATHEN — js/sys/starter.js — starter equipment for every class
   A new hero (ชาวบ้าน) begins with a full starter set, and every job change hands over that class's own starter
   kit. Starter gear is deliberately modest: just above the class's bare-handed weapon and the cheapest shop
   pieces, so it helps the first steps of each class and is then replaced by shop, crafted or dropped gear.
   · ชาวบ้าน (Lv 1):   weapon · shirt · head cloth · charm
   · 2nd classes (Lv 1 to wear, given at the job change): class weapon · class outfit · headband · charm
   · 3rd classes (Lv 40 to wear, given at the job change): class weapon · class armour · helm · seal
   The weapon is worn at once (the old one goes to the bag); the other pieces replace an empty slot or an earlier starter piece.
   Each kit is given once per character and class. Characters made before this get their current class's kit once. */
'use strict';

/* [job, weapon name th/en, armour th/en, head th/en, charm th/en, main stat, second stat] */
const KIT_DEF = [
  ['novice', ['มีดไม้ไผ่ฝึกหัด', 'Training Bamboo Knife'], ['เสื้อผ้าฝ้ายชาวบ้าน', "Villager's Cotton Shirt"], ['ผ้าโพกชาวบ้าน', "Villager's Head Cloth"], ['พระเครื่องนำทาง', 'Wayfarer Amulet'], 'luk', 'vit'],
  ['blade', ['ดาบศิษย์นักดาบ', "Swordsman's Practice Blade"], ['ชุดฝึกนักดาบ', "Swordsman's Training Garb"], ['ผ้าคาดนักดาบ', "Swordsman's Headband"], ['เครื่องรางนักดาบ', "Swordsman's Charm"], 'str', 'vit'],
  ['rune', ['ไม้เท้าศิษย์เวท', "Apprentice Mage's Staff"], ['เสื้อคลุมศิษย์เวท', "Apprentice Mage's Robe"], ['ผ้าคาดศิษย์เวท', "Apprentice Mage's Band"], ['เครื่องรางศิษย์เวท', "Apprentice Mage's Charm"], 'int', 'dex'],
  ['ranger', ['ธนูไม้ไผ่ศิษย์พราน', "Young Hunter's Bow"], ['เสื้อหนังศิษย์พราน', "Young Hunter's Jerkin"], ['ผ้าคาดศิษย์พราน', "Young Hunter's Band"], ['เครื่องรางศิษย์พราน', "Young Hunter's Charm"], 'dex', 'agi'],
  ['muay', ['ผ้าพันมือศิษย์มวย', "Young Boxer's Wraps"], ['ชุดซ้อมนักมวย', "Boxer's Training Shorts"], ['มงคลศิษย์มวย', "Young Boxer's Mongkhon"], ['ประเจียดศิษย์มวย', "Young Boxer's Prajiad"], 'str', 'agi'],
  ['healer', ['ไม้เท้าว่านศิษย์หมอ', "Apprentice Healer's Staff"], ['เสื้อคลุมศิษย์หมอยา', "Apprentice Healer's Robe"], ['ผ้าคาดศิษย์หมอยา', "Apprentice Healer's Band"], ['ถุงสมุนไพรนำโชค', 'Lucky Herb Pouch'], 'int', 'vit'],
  ['rogue', ['มีดคู่ศิษย์ย่อง', "Young Prowler's Twin Knives"], ['ชุดพรางศิษย์ย่อง', "Young Prowler's Garb"], ['ผ้าปิดหน้าศิษย์ย่อง', "Young Prowler's Mask Cloth"], ['เครื่องรางศิษย์ย่อง', "Young Prowler's Charm"], 'agi', 'luk'],
  ['summoner', ['คทาสังข์ศิษย์อัญเชิญ', "Apprentice Summoner's Conch Rod"], ['เสื้อคลุมศิษย์อัญเชิญ', "Apprentice Summoner's Robe"], ['ผ้าคาดศิษย์อัญเชิญ', "Apprentice Summoner's Band"], ['ตะกรุดศิษย์อัญเชิญ', "Apprentice Summoner's Takrut"], 'int', 'dex'],
  ['warlord', ['ดาบสองมือประจำการขุนศึก', "Warlord's Service Greatsword"], ['เกราะประจำการขุนศึก', "Warlord's Service Armour"], ['หมวกประจำการขุนศึก', "Warlord's Service Helm"], ['ตราประจำการขุนศึก', "Warlord's Service Seal"], 'str', 'vit'],
  ['astro', ['ไม้เท้าโหราประจำตำแหน่ง', "Court Astrologer's Staff"], ['เสื้อคลุมโหราประจำตำแหน่ง', "Court Astrologer's Robe"], ['มงคลโหราประจำตำแหน่ง', "Court Astrologer's Mongkhon"], ['ตราโหราประจำตำแหน่ง', "Court Astrologer's Seal"], 'int', 'dex'],
  ['warden', ['ธนูประจำการพรานพงไพร', "Forest Warden's Service Bow"], ['เกราะหนังพรานพงไพร', "Forest Warden's Leather Armour"], ['หมวกพรานพงไพร', "Forest Warden's Hat"], ['ตราพรานพงไพร', "Forest Warden's Seal"], 'dex', 'agi'],
  ['grandmaster', ['เชือกคาดชัยปรมาจารย์', "Grandmaster's Victory Wraps"], ['ชุดประลองปรมาจารย์', "Grandmaster's Bout Garb"], ['มงคลปรมาจารย์', "Grandmaster's Mongkhon"], ['ประเจียดปรมาจารย์', "Grandmaster's Prajiad"], 'str', 'agi'],
  ['physician', ['ไม้เท้าราชแพทย์ประจำวัง', "Royal Physician's Staff"], ['เสื้อคลุมราชแพทย์', "Royal Physician's Robe"], ['มงคลราชแพทย์', "Royal Physician's Mongkhon"], ['ตราราชแพทย์', "Royal Physician's Seal"], 'int', 'vit'],
  ['bandit', ['มีดคู่ประจำตัวจอมโจร', "Shadow Bandit's Twin Knives"], ['ชุดพรางจอมโจรเงา', "Shadow Bandit's Garb"], ['หมวกจอมโจรเงา', "Shadow Bandit's Hood"], ['ตราจอมโจรเงา', "Shadow Bandit's Seal"], 'agi', 'luk'],
  ['sovereign', ['คทาประจำตัวจอมอัญเชิญ', "Sovereign's Service Sceptre"], ['เสื้อคลุมจอมอัญเชิญ', "Sovereign's Robe"], ['มงคลจอมอัญเชิญ', "Sovereign's Mongkhon"], ['ตราจอมอัญเชิญ', "Sovereign's Seal"], 'int', 'dex']
];
/* looks and pictures borrow the matching shop pieces */
const KIT_LOOK = {
  1:{armor:'a_cotton', head:'h_cloth', acc:'x_ring'},
  2:{armor:'a_buffalo', head:'h_cloth', acc:'x_bead', casterArmor:'a_cotton', casterHead:'h_cloth'},
  3:{armor:'a_padded', head:'h_lotus', acc:'x_charm', casterArmor:'a_yantra', casterHead:'h_mongkhon', casterAcc:'x_moon'}
};
const KIT = {};   // job → [weapon id, armour id, head id, charm id]
for (const [job, wN, aN, hN, xN, s1, s2] of KIT_DEF){
  const J = JOBS[job]; if (!J) continue;
  const tier = J.tier || 1, w = J.weapon, wt = w.type, caster = wt === 'staff', lv = tier >= 3 ? 40 : 1, LK = KIT_LOOK[Math.min(3, tier)];
  const ids = ['w', 'a', 'h', 'x'].map(s => `k_${job}_${s}`);
  // weapon: a little above the class's bare weapon
  const wst = {wtype:wt, watk:w.atk + (tier === 1 ? 4 : tier === 2 ? 4 : 6)};
  if (caster) wst.wmatk = (w.matk || 0) + (tier === 3 ? 10 : 6);
  wst.hands = job === 'warlord' ? '2h' : HANDS_DEF[wt];   // the Warlord fights with a two-handed sword
  if (tier >= 2) wst[s1] = tier === 3 ? 2 : 1;
  const ast = tier === 1 ? {def:3, hp:15} : tier === 2 ? {def:7, hp:50} : {def:18, mdef:3, hp:260};
  const hst = tier === 1 ? {def:1, hp:10} : tier === 2 ? {def:2, hp:30, [s1]:1} : {def:6, mdef:2, [s1]:2};
  const xst = tier === 1 ? {[s1]:1, hp:15} : tier === 2 ? {[s1]:2, [s2]:1} : {[s1]:3, [s2]:2, hpPct:.02};
  const art = {w:`w_${wt}${tier === 3 ? 2 : 0}`, a:caster && LK.casterArmor ? LK.casterArmor : LK.armor, h:caster && LK.casterHead ? LK.casterHead : LK.head, x:caster && LK.casterAcc ? LK.casterAcc : LK.acc};
  const mk = (id, slot, nmz, st, key) => { ITEMS[id] = {name:nmz[0], en:nmz[1], kind:'gear', slot, lv, st, buy:0, sell:Math.max(10, lv * 6 + 20), starter:job, artAs:art[key], desc:['อุปกรณ์เริ่มต้นประจำอาชีพ', 'Class starter equipment']};
    if (slot === 'weapon') ITEMS[id].wtype = wt; if (slot !== 'weapon' && SPR.GEAR_LOOK[art[key]]) SPR.GEAR_LOOK[id] = SPR.GEAR_LOOK[art[key]]; };
  mk(ids[0], 'weapon', wN, wst, 'w'); mk(ids[1], 'armor', aN, ast, 'a'); mk(ids[2], 'head', hN, hst, 'h'); mk(ids[3], 'acc', xN, xst, 'x');
  KIT[job] = ids;
}
/* pictures: the borrowed shop art (each copy still gets its own gradient ids) */
{ const _pick = iaPick;
  // v33: follow a borrowed picture that itself borrows (Tier-4 crown → h_vajra → h_chada), so no icon comes out blank
  const artOf = it => it && (it.artAs || (it.base && ITEMS[it.base] && ITEMS[it.base].artAs));
  iaPick = function(id){ let a = artOf(ITEMS[id]); if (!a) return _pick(id);
    for (let i = 0; i < 4; i++){ const nx = artOf(ITEMS[a]); if (!nx || nx === a) break; a = nx; }
    const r = _pick(a); return {...r, frame:Math.max(r.frame || 0, 1)}; };
}

/* hand a kit over (once per character and class) */
function kitGive(job, quiet){
  const ids = KIT[job]; if (!ids || !S) return false; S.kits = S.kits || {}; if (S.kits[job]) return false; S.kits[job] = 1;
  S.gear = S.gear || {}; const got = [];
  for (const id of ids){
    const it = ITEMS[id]; const key = makeInst(id, 0); if (!ITEMS[key]) continue; got.push(key);
    const slot = it.slot, cur = S.gear[slot], canWear = S.lvl >= it.lv && canWield(it);
    const ci = cur && ITEMS[cur], wear = canWear && (!ci || (ci.starter && ci.starter !== job) || (slot === 'weapon' && !(canWield(ci) && ci.lv > it.lv)));
    if (wear){ if (cur) addItem(cur, 1); S.gear[slot] = key; } else S.inv[key] = (S.inv[key] || 0) + 1;
  }
  derive(); dirty = true;
  if (!quiet){ banner(L(`ได้รับอุปกรณ์เริ่มต้น${nm(JOBS[job])}!`, `${nm(JOBS[job])} starter kit received!`)); SFX.play('quest');
    log(L(`อุปกรณ์เริ่มต้น${nm(JOBS[job])}: ${got.map(k => nm(ITEMS[k])).join(' · ')}`, `${nm(JOBS[job])} starter kit: ${got.map(k => nm(ITEMS[k])).join(' · ')}`), 'g'); }
  if (typeof renderEquip === 'function' && el('win-equip') && !el('win-equip').hidden) renderEquip();
  save(); return true;
}
/* a new hero, and every job change */
{ const _ng = newGame;
  newGame = function(...a){ const r = _ng.apply(this, a); setTimeout(() => kitGive('novice', true), 0); return r; };
}
EV.on('job', job => kitGive(job));
/* heroes made before starter kits: their current class's kit, once */
EV.on('tick', () => { if (PAUSED || !S || !S.lvl || S.kitv === 1) return; S.kitv = 1; if (!(S.kits && S.kits[S.job])) kitGive(S.job); });

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'starter', t:['อุปกรณ์เริ่มต้น', 'Starter equipment'], b:() => `<p>${L('ตัวละครใหม่ได้ชุดเริ่มต้นชาวบ้านครบ 4 ชิ้น (อาวุธ เสื้อ ผ้าโพก พระเครื่อง) และทุกครั้งที่เปลี่ยนอาชีพจะได้ชุดเริ่มต้นของอาชีพนั้น: อาวุธประจำอาชีพ ชุด หมวก และเครื่องราง · อาวุธสวมให้ทันที ชิ้นอื่นสวมเมื่อช่องว่าง · ชุดขั้น 3 ใส่ได้ที่ Lv 40 · เป็นของเริ่มต้นที่แรงกว่าของพื้นฐานเล็กน้อย ควรเปลี่ยนเป็นของจากร้าน ของหลอม หรือของดรอปเมื่อเก่งขึ้น', 'A new hero gets the 4-piece villager starter set (weapon, shirt, head cloth, amulet), and every job change gives that class\'s starter kit: class weapon, outfit, headgear and charm · the weapon is worn at once, other pieces when the slot is empty · 3rd-class kits need Lv 40 · starter gear is a small step above the basics: swap it for shop, crafted or dropped gear as you grow')}</p>`});
