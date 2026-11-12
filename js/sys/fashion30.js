/* VAYRATHEN — js/sys/fashion30.js — the wardrobe, rebuilt: five collections of 30 (v29)
   ปีก Wings · ส่วนหัว Headpieces · หน้ากาก Masks · ชุดเซต Ready-made outfits · สัตว์ขี่ Mounts — thirty of each, every
   one its own design (its own cut, colours, glow and particles), and nothing else: the older everyday outfits, hats,
   fashion shoes and cosmetic pets are gone from the wardrobe.
   · Wings: the eleven older wing cuts plus four new ones (dragon, blades, silk ribbons, leaves), each pair its own colours and sparks.
   · Headpieces: Thai chada crowns, halos, flower wreaths, antlers, kirin horns, knight helms, phoenix plumes, beast ears,
     royal crowns, dragon horns and the classic crests (drawn by the sprite engine, gfx/sprites.js).
   · Masks: a new place on the face (S.cos.mask) — eleven cuts: domino, butterfly, full, Khon, fox, oni, skull, veil,
     visor, tiger, phantom and sun — with glowing eyes on the grand ones.
   · Ready-made outfits: the whole body (top, sleeves, trousers, skirt, cape, trims, jewellery) in one piece.
   · Mounts: clouds, lotuses, carpets, magic circles, fire clouds, crystals, flying swords and a crescent moon you stand
     on, and twelve Himmapan beasts you sit on, each wrapped in its own aura.
   Costumes never change stats. Every piece can be tried on free; buying keeps it for the whole account. Other players
   see all of it. */
'use strict';

/* ---------- materials (the glowing ones light up on their own) ---------- */
{ const hx = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const add = (name, ramp, o = {}) => { if (SPR.M[name] != null) return; SPR.M[name] = SPR.MATS.length; SPR.MATS.push({name, hex:ramp, ramp:ramp.map(hx), emissive:!!o.emissive, noEdge:!!o.noEdge}); };
  add('sakuraGlow', ['#ffffff', '#ffd6ea', '#ff8ac0', '#c8407e'], {emissive:true});
  add('jadeGlow', ['#ffffff', '#c8fff0', '#4ae8b8', '#12a078'], {emissive:true});
  add('bloodGlow', ['#ffd0d0', '#ff5a6a', '#d01a32', '#6a0614'], {emissive:true});
  add('auroraGlow', ['#ffffff', '#b8fff0', '#6ad8ff', '#8a5aff'], {emissive:true});
  add('lavaGlow', ['#fff6c0', '#ffb84a', '#ff5a1a', '#a01a08'], {emissive:true});
  add('cyanGlow', ['#ffffff', '#c8f8ff', '#3ad0ff', '#1a7ad0'], {emissive:true});
  add('roseGlow', ['#ffffff', '#ffc8d8', '#ff6a9a', '#b81a50'], {emissive:true});
  add('limeGlow', ['#ffffff', '#eaffc0', '#a8f04a', '#5aa818'], {emissive:true});
  add('royalBlue', ['#9ec4ff', '#2a5ad8', '#173a96', '#0c1f58']);
  add('wine', ['#e88aa0', '#8a1a3a', '#5a0c24', '#2e0412']);
  add('forest', ['#9ae0a8', '#2a8a4a', '#185a2e', '#0a3018']);
  add('sand', ['#fff4d8', '#e8cc94', '#b89458', '#7a5a2e']);
  add('silver', ['#ffffff', '#d8dee8', '#9aa4b8', '#5a6278']);
  add('bronze', ['#ffd8a8', '#c8823a', '#8a501a', '#4a280a']);
  add('onyx', ['#6a6a7a', '#2a2a34', '#16161e', '#08080c']);
  add('lavender', ['#ffffff', '#d8c8ff', '#9a7ae0', '#5a3aa0']);
  add('coral', ['#ffe0d4', '#ff8a6a', '#d0503a', '#7a2418']);
  add('aqua', ['#e0ffff', '#6ae0e8', '#2a9aa8', '#0e5a64']);
  add('peacock', ['#c8fff4', '#1ab8a8', '#0e6a8a', '#082e5a']);
}
const FZM = SPR.M;

/* ---------- out with the old wardrobe ---------- */
for (const k of Object.keys(COSTUME)) if (k !== 'hc_hide') delete COSTUME[k];
for (const k of Object.keys(WINGS)) delete WINGS[k];
for (const k of Object.keys(XCOS)) delete XCOS[k];
for (const k of Object.keys(XMOUNT)) delete XMOUNT[k];
if (typeof XPET !== 'undefined') for (const k of Object.keys(XPET)) delete XPET[k];
if (typeof COS2 !== 'undefined') for (const k of Object.keys(COS2)) delete COS2[k];
if (typeof FASH_SLOTS !== 'undefined') for (const k of Object.keys(FASH_SLOTS)) delete FASH_SLOTS[k];
if (typeof COS_SETS !== 'undefined') for (const k of Object.keys(COS_SETS)) delete COS_SETS[k];

/* ---------- 30 ready-made outfits ---------- */
const FT = {
  hem:(m, y = .44) => n => (n[1] > y ? {m} : undefined),
  zip:m => n => (n[2] > .5 && Math.abs(n[0]) < .05 && n[1] > -.4 ? {m} : undefined),
  sash:m => n => (Math.abs(n[0] * .78 + n[1] * .62 - .02) < .14 ? {m} : undefined),
  chev:m => n => (n[2] > .3 && Math.abs(Math.abs(n[0]) * 1.4 - (n[1] + .3)) < .07 ? {m} : undefined),
  stars:m => n => (Math.sin(n[0] * 31) * Math.sin(n[1] * 29 + 2) > .86 ? {m} : undefined),
  scales:m => n => (Math.sin(n[0] * 22 + Math.sin(n[1] * 22) * 2) > .7 ? {m} : undefined),
  waves:m => n => (Math.abs(Math.sin(n[0] * 14 + Math.sin(n[1] * 9) * 1.6)) < .12 ? {m} : undefined),
  kanok:m => n => (n[2] > .2 && Math.sin(n[0] * 18 + Math.cos(n[1] * 14) * 2.4) > .8 && n[1] < .3 ? {m} : undefined),
  dots:m => n => (Math.sin(n[0] * 26) * Math.sin(n[1] * 26 + 1) > .7 ? {m} : undefined),
  stripes:m => n => (Math.sin(n[1] * 16) > .7 ? {m} : undefined),
  combo:(...fs) => n => { for (const f of fs){ const r = f(n); if (r) return r; } }
};
const F_TOP0 = {chest:null, chestTex:null, chestTrim:null, pauldron:null, cape:null, capeTex:null, runeLines:false, armband:null, handWrap:null, pouch:false, necklace:false, pendant:null, ribbon:null, cosTop:true};
/* cut: royal · armour · robe · dress · ninja · battle · court · sky ; a main, b second, c glow trim, tex: the jacket pattern */
function fSet(cut, a, b, c, tex, more = {}){
  const L0 = {top:a, sleeve:b, forearm:c, pants:a, bootCuff:c, belt:c, skirtM:a, skirtT:c, topTex:tex};
  const CUT = {
    royal:{armband:c, chest:a, chestTrim:c, pauldron:c, cape:b, capeTex:'gold', necklace:true, pendant:'gem', neckMat:c},
    armour:{sleeve:a, armband:c, chest:b, chestTex:'scale', chestTrim:c, pauldron:c, cape:a, capeTex:'gold', pants:b},
    robe:{sleeve:a, forearm:b, cape:b, capeTex:'gold', necklace:true, pendant:'orb', neckMat:c},
    dress:{sleeve:'pearl', forearm:'pearl', armband:c, necklace:true, pendant:'gem', neckMat:c, ribbon:b, pants:b},
    ninja:{sleeve:a, forearm:a, handWrap:b, belt:b, bootCuff:b, pants:a, skirtT:b},
    battle:{armband:c, chest:b, chestTrim:c, pauldron:c, cape:c, capeTex:'gold', handWrap:b},
    court:{sleeve:b, forearm:a, armband:c, pants:b, cape:a, necklace:true, neckMat:c, pendant:'gem'},
    sky:{sleeve:'pearl', armband:c, cape:b, capeTex:'gold', necklace:true, pendant:'orb', neckMat:c}
  };
  return {...F_TOP0, ...L0, ...(CUT[cut] || {}), ...more};
}
const F_SETS = [
  ['s_suriya', 'ชุดสุริยเทพจักรพรรดิ', 'Solar Emperor Regalia', 'royal', 'pearl', 'goldLight', 'goldLight', FT.combo(FT.kanok(FZM.goldLight), FT.hem(FZM.goldLight)), 160],
  ['s_chandra', 'ชุดจันทราเทวีรัตติกาล', 'Moon Goddess of Night', 'sky', 'midnight', 'lavender', 'cyanGlow', FT.combo(FT.stars(FZM.cyanGlow), FT.hem(FZM.silver)), 150],
  ['s_naga', 'ชุดพญานาคราชมรกต', 'Emerald Naga Sovereign', 'armour', 'forest', 'emerald', 'jadeGlow', FT.combo(FT.scales(FZM.jadeGlow), FT.hem(FZM.gold)), 160],
  ['s_garuda', 'ชุดครุฑพ่าห์สงคราม', 'Garuda War Raiment', 'battle', 'scarlet', 'gold', 'goldLight', FT.combo(FT.kanok(FZM.goldLight), FT.hem(FZM.gold)), 160],
  ['s_kinnaree', 'ชุดกินรีหิมพานต์', 'Himmapan Kinnaree', 'dress', 'roseGold', 'sakura', 'goldLight', FT.combo(FT.sash(FZM.goldLight), FT.hem(FZM.goldLight)), 140],
  ['s_asura', 'ชุดอสูรราชันย์โลหิต', 'Blood Asura King', 'armour', 'abyss', 'crimsonV', 'bloodGlow', FT.combo(FT.chev(FZM.bloodGlow), FT.hem(FZM.crimsonV)), 170],
  ['s_seraph', 'ชุดเทวทูตเจ็ดสวรรค์', 'Seventh Heaven Seraph', 'sky', 'pearl', 'ivory', 'goldLight', FT.combo(FT.chev(FZM.goldLight), FT.hem(FZM.goldLight)), 170],
  ['s_void', 'ชุดจอมเวทห้วงจักรวาล', 'Cosmic Void Archmage', 'robe', 'midnight', 'voidGlow', 'voidGlow', FT.combo(FT.stars(FZM.voidGlow), FT.hem(FZM.voidGlow)), 150],
  ['s_phoenix', 'ชุดหงส์เพลิงนิรันดร์', 'Eternal Phoenix', 'battle', 'sunset', 'ember', 'lavaGlow', FT.combo(FT.chev(FZM.lavaGlow), FT.hem(FZM.ember)), 160],
  ['s_glacier', 'ชุดราชินีธารน้ำแข็ง', 'Glacier Queen', 'dress', 'frost', 'iceGlow', 'iceGlow', FT.combo(FT.waves(FZM.iceGlow), FT.hem(FZM.iceGlow)), 150],
  ['s_sakura', 'ชุดซามูไรซากุระโปรย', 'Falling Sakura Samurai', 'ninja', 'ivory', 'sakuraGlow', 'sakuraGlow', FT.combo(FT.dots(FZM.sakuraGlow), FT.sash(FZM.sakura)), 120],
  ['s_shadow', 'ชุดนินจาเงาทมิฬ', 'Tamil Shadow Ninja', 'ninja', 'onyx', 'bloodGlow', 'bloodGlow', FT.combo(FT.zip(FZM.bloodGlow), FT.stripes(FZM.charcoal)), 120],
  ['s_aurora', 'ชุดนักบุญแสงเหนือ', 'Aurora Saint', 'robe', 'ivory', 'auroraGlow', 'auroraGlow', FT.combo(FT.waves(FZM.auroraGlow), FT.hem(FZM.auroraGlow)), 160],
  ['s_siam', 'ชุดราชสำนักกรุงศรี', 'Ayutthaya Court Regalia', 'court', 'wine', 'gold', 'goldLight', FT.combo(FT.kanok(FZM.gold), FT.hem(FZM.goldLight)), 140],
  ['s_lanna', 'ชุดเจ้านางล้านนา', 'Lanna Princess', 'dress', 'plum', 'sand', 'gold', FT.combo(FT.stripes(FZM.gold), FT.hem(FZM.sand)), 120],
  ['s_hanuman', 'ชุดหนุมานชาญศึก', 'Hanuman the Valiant', 'battle', 'white', 'silver', 'cyanGlow', FT.combo(FT.chev(FZM.cyanGlow), FT.hem(FZM.silver)), 150],
  ['s_tosakan', 'ชุดทศกัณฐ์ราชันย์ลงกา', 'Tosakan, King of Lanka', 'royal', 'forest', 'gold', 'limeGlow', FT.combo(FT.kanok(FZM.goldLight), FT.hem(FZM.limeGlow)), 170],
  ['s_knight', 'ชุดอัศวินเหล็กเงินจันทร์', 'Moonsteel Knight', 'armour', 'silver', 'royalBlue', 'cyanGlow', FT.combo(FT.chev(FZM.royalBlue), FT.hem(FZM.silver)), 140],
  ['s_desert', 'ชุดสุลต่านทะเลทราย', 'Desert Sultan', 'court', 'sand', 'peacock', 'goldLight', FT.combo(FT.dots(FZM.peacock), FT.hem(FZM.goldLight)), 130],
  ['s_ocean', 'ชุดเทพสมุทรคลื่นคราม', 'Sapphire Tide Deity', 'sky', 'aqua', 'royalBlue', 'cyanGlow', FT.combo(FT.waves(FZM.cyanGlow), FT.hem(FZM.aqua)), 150],
  ['s_forest', 'ชุดภูตพงไพรมรกต', 'Emerald Wildwood Fae', 'dress', 'mint', 'forest', 'limeGlow', FT.combo(FT.stars(FZM.limeGlow), FT.hem(FZM.forest)), 130],
  ['s_lava', 'ชุดขุนศึกลาวาเดือด', 'Molten Warlord', 'armour', 'obsid', 'ember', 'lavaGlow', FT.combo(FT.scales(FZM.lavaGlow), FT.hem(FZM.ember)), 160],
  ['s_peacock', 'ชุดนกยูงราชินี', 'Peacock Queen', 'royal', 'peacock', 'royalBlue', 'goldLight', FT.combo(FT.dots(FZM.goldLight), FT.hem(FZM.peacock)), 150],
  ['s_bloodmoon', 'ชุดแวมไพร์จันทร์เลือด', 'Blood Moon Vampire', 'court', 'onyx', 'wine', 'bloodGlow', FT.combo(FT.chev(FZM.bloodGlow), FT.hem(FZM.wine)), 150],
  ['s_thunder', 'ชุดเทพสายฟ้าฟาด', 'Thunder Deity', 'battle', 'royalBlue', 'silver', 'cyanGlow', FT.combo(FT.chev(FZM.cyanGlow), FT.stripes(FZM.silver)), 150],
  ['s_lotus', 'ชุดบุษบาบัวทอง', 'Golden Lotus Maiden', 'dress', 'pearl', 'roseGlow', 'goldLight', FT.combo(FT.sash(FZM.roseGlow), FT.hem(FZM.goldLight)), 140],
  ['s_rune', 'ชุดนักปราชญ์อักขระโบราณ', 'Ancient Rune Sage', 'robe', 'bronze', 'sand', 'goldLight', FT.combo(FT.stripes(FZM.goldLight), FT.hem(FZM.bronze)), 120],
  ['s_coral', 'ชุดเงือกปะการังแดง', 'Red Coral Mermaid', 'dress', 'coral', 'aqua', 'roseGlow', FT.combo(FT.scales(FZM.roseGlow), FT.hem(FZM.aqua)), 130],
  ['s_star', 'ชุดไอดอลดาวกระจาย', 'Starburst Idol', 'sky', 'lavender', 'sakuraGlow', 'goldLight', FT.combo(FT.stars(FZM.goldLight), FT.hem(FZM.sakuraGlow)), 120],
  ['s_eclipse', 'ชุดราหูอมจันทร์', 'Rahu Eclipse', 'royal', 'abyss', 'lavaGlow', 'voidGlow', FT.combo(FT.kanok(FZM.voidGlow), FT.hem(FZM.lavaGlow)), 180]
];
for (const [id, th, en, cut, a, b, c, tex, price] of F_SETS){
  COSTUME[id] = {slot:'top', th, en, src:'coin', price:{c:price}, grand:true, sw:[a, c], look:fSet(cut, a, b, c, tex)};
  SPR.GEAR_LOOK[id] = COSTUME[id].look;
}

/* ---------- 30 headpieces ---------- */
const F_HEADS = [
  ['h_halo', 'วงรัศมีเทวทูต', 'Seraph Halo', {hat:'halo', hatMat:'goldLight'}, 70],
  ['h_halov', 'วงรัศมีจันทร์ม่วง', 'Violet Moon Halo', {hat:'halo', hatMat:'voidGlow', crestMat:'silver', crestN:1}, 80],
  ['h_haloc', 'วงรัศมีน้ำแข็งนิรันดร์', 'Everfrost Halo', {hat:'halo', hatMat:'iceGlow', crestMat:'frost', crestN:1}, 80],
  ['h_wreath', 'มาลัยซากุระบาน', 'Blooming Sakura Wreath', {hat:'wreath', hatMat:'sakuraGlow', crestMat:'pearl'}, 60],
  ['h_wreathj', 'มาลัยพฤกษามรกต', 'Emerald Leaf Wreath', {hat:'wreath', hatMat:'jadeGlow', crestMat:'forest', crestGem:true}, 60],
  ['h_wreathg', 'มาลัยดาวเรืองทอง', 'Golden Marigold Wreath', {hat:'wreath', hatMat:'sun', crestMat:'lavaGlow'}, 60],
  ['h_antler', 'เขากวางทองคำ', 'Golden Deer Antlers', {hat:'antlers', hatMat:'goldLight', crestMat:'gem'}, 80],
  ['h_antleri', 'เขากวางผลึกน้ำแข็ง', 'Ice Crystal Antlers', {hat:'antlers', hatMat:'iceGlow', crestMat:'cyanGlow', crestGem:true}, 90],
  ['h_antlerv', 'เขากวางวิญญาณม่วง', 'Spirit Stag Antlers', {hat:'antlers', hatMat:'voidGlow', crestMat:'lavender', crestGem:true}, 90],
  ['h_kirin', 'เขากิเลนมงคล', 'Auspicious Kilen Horn', {hat:'kirin', hatMat:'goldLight', crestMat:'jade', crestN:1}, 80],
  ['h_kirinr', 'เขายูนิคอร์นสายรุ้ง', 'Rainbow Unicorn Horn', {hat:'kirin', hatMat:'auroraGlow', crestMat:'pearl', hatTall:1.2}, 90],
  ['h_helm', 'หมวกอัศวินขนนกแดง', 'Crimson-plumed Knight Helm', {hat:'helm', hatMat:'silver', crestMat:'gold', plume:'scarlet'}, 90],
  ['h_helmg', 'หมวกเทพสงครามทองคำ', 'Golden War God Helm', {hat:'helm', hatMat:'gold', crestMat:'goldLight', plume:'pearl'}, 110],
  ['h_helmd', 'หมวกอัศวินมรณะ', 'Death Knight Helm', {hat:'helm', hatMat:'onyx', crestMat:'bloodGlow', plume:'crimsonV'}, 110],
  ['h_plume', 'มงกุฎขนหงส์เพลิง', 'Phoenix Plume Crown', {hat:'plumes', hatMat:'lavaGlow', crestMat:'goldLight', crestN:5}, 100],
  ['h_plumep', 'มงกุฎขนนกยูง', 'Peacock Plume Crown', {hat:'plumes', hatMat:'peacock', crestMat:'goldLight', crestN:7}, 100],
  ['h_fox', 'หูจิ้งจอกเก้าหาง', 'Nine-tailed Fox Ears', {hat:'ears', hatMat:'pearl', crestMat:'sakuraGlow', hornLen:1}, 50],
  ['h_cat', 'หูแมวดำราตรี', 'Midnight Cat Ears', {hat:'ears', hatMat:'onyx', crestMat:'roseGlow', hornLen:-2, hornSpread:.6}, 50],
  ['h_bunny', 'หูกระต่ายจันทร์', 'Moon Rabbit Ears', {hat:'ears', hatMat:'white', crestMat:'sakura', hornLen:5, hornSpread:-1.4, crestGem:true}, 50],
  ['h_crown', 'มงกุฎจักรพรรดิทองคำ', 'Golden Emperor Crown', {hat:'crown', hatMat:'goldLight', crestMat:'gold', crestN:8}, 120],
  ['h_crowni', 'มงกุฎราชินีหิมะ', 'Snow Queen Crown', {hat:'crown', hatMat:'iceGlow', crestMat:'silver', crestN:10}, 120],
  ['h_crownb', 'มงกุฎราชาโลหิต', 'Blood King Crown', {hat:'crown', hatMat:'crimsonV', crestMat:'bloodGlow', crestN:6}, 120],
  ['h_dragon', 'เขามังกรมรกต', 'Emerald Dragon Horns', {hat:'dragon', hatMat:'emerald', crestMat:'jadeGlow'}, 110],
  ['h_dragonl', 'เขามังกรลาวา', 'Lava Dragon Horns', {hat:'dragon', hatMat:'obsid', crestMat:'lavaGlow'}, 110],
  ['h_tiara', 'มงกุฎเทพธิดาดารา', 'Star Goddess Tiara', {hat:'crest', bandMat:'silver', crestMat:'auroraGlow', crestN:7, crestGem:true}, 80],
  ['h_horns', 'เขาจอมมารห้วงลึก', 'Abyssal Overlord Horns', {hat:null, horns:'bloodGlow', hornLen:4, hornSpread:1.6}, 90]
];
/* (v89) the tall golden spire headpieces (three chadas and the gold lomphok) are gone: anyone who bought one gets
   the coins back once, and stops wearing it */
const F_GONE = {h_chada:90, h_chadaj:100, h_chadan:100, h_lomphok:90};
EV.on('tick', () => { if (!S || !S.lvl || typeof ACC === 'undefined' || !ACC || ACC.goneHeads) return;
  let back = 0; const w = ACC.wardrobe || {};
  for (const id in F_GONE) if (w[id]){ delete w[id]; back += F_GONE[id]; }
  if (S.cos && F_GONE[S.cos.head] && !COSTUME[S.cos.head]) S.cos.head = null;
  ACC.goneHeads = 1; if (back){ ACC.coins = (ACC.coins || 0) + back; toast(L(`ชุดหัวแบบยอดแหลมถูกนำออกแล้ว · คืน ${back} เหรียญ`, `The spire headpieces were retired · ${back} coins refunded`)); }
  accSave(true); });
for (const [id, th, en, look, price] of F_HEADS){
  COSTUME[id] = {slot:'head', th, en, src:'coin', price:{c:price}, grand:true, sw:[look.hatMat || look.bandMat || look.horns, look.crestMat || look.hatMat || look.horns], look:{hat:null, ...look}};
  SPR.GEAR_LOOK[id] = COSTUME[id].look;
}

/* ---------- 30 masks (a new place on the face) ---------- */
const F_MASKS = [
  ['k_khon', 'หัวโขนทศกัณฐ์', 'Tosakan Khon Mask', 'khon', 'forest', 'goldLight', null, {}, 120],
  ['k_khonh', 'หัวโขนหนุมาน', 'Hanuman Khon Mask', 'khon', 'white', 'cyanGlow', null, {}, 120],
  ['k_khong', 'หัวโขนพญาครุฑ', 'Garuda Khon Mask', 'khon', 'scarlet', 'goldLight', 'goldLight', {}, 130],
  ['k_fox', 'หน้ากากจิ้งจอกจันทรา', 'Moon Fox Mask', 'fox', 'pearl', 'bloodGlow', null, {}, 70],
  ['k_foxb', 'หน้ากากจิ้งจอกเพลิงดำ', 'Black Flame Fox Mask', 'fox', 'onyx', 'lavaGlow', 'lavaGlow', {}, 90],
  ['k_foxs', 'หน้ากากจิ้งจอกซากุระ', 'Sakura Fox Mask', 'fox', 'white', 'sakuraGlow', null, {}, 70],
  ['k_oni', 'หน้ากากยักษ์โอนิแดง', 'Red Oni Mask', 'oni', 'crimsonV', 'goldLight', 'goldLight', {horns:'ivory', hornLen:-2, hornSpread:-.6}, 100],
  ['k_onib', 'หน้ากากยักษ์ฟ้าคราม', 'Azure Oni Mask', 'oni', 'royalBlue', 'silver', 'cyanGlow', {horns:'silver', hornLen:-2.5, hornSpread:-.8}, 100],
  ['k_skull', 'หน้ากากหัวกะโหลกวิญญาณ', 'Spirit Skull Mask', 'skull', 'pearl', 'silver', 'cyanGlow', {}, 90],
  ['k_skullg', 'หน้ากากกะโหลกทองคำ', 'Golden Skull Mask', 'skull', 'goldLight', 'gold', 'bloodGlow', {}, 110],
  ['k_skullv', 'หน้ากากมรณะม่วง', 'Violet Reaper Mask', 'skull', 'onyx', 'voidGlow', 'voidGlow', {}, 110],
  ['k_domino', 'หน้ากากงานเต้นรำทอง', 'Golden Masquerade', 'domino', 'goldLight', 'gold', null, {}, 50],
  ['k_dominov', 'หน้ากากราตรีกำมะหยี่', 'Velvet Night Domino', 'domino', 'wine', 'goldLight', null, {}, 50],
  ['k_dominos', 'หน้ากากเงินจันทร์', 'Silver Moon Domino', 'domino', 'silver', 'cyanGlow', null, {}, 50],
  ['k_fly', 'หน้ากากผีเสื้อราตรี', 'Night Butterfly Mask', 'butterfly', 'midnight', 'voidGlow', null, {}, 70],
  ['k_flyr', 'หน้ากากผีเสื้อสายรุ้ง', 'Rainbow Butterfly Mask', 'butterfly', 'auroraGlow', 'pearl', null, {}, 80],
  ['k_flyg', 'หน้ากากผีเสื้อมรกต', 'Emerald Butterfly Mask', 'butterfly', 'emerald', 'goldLight', null, {}, 70],
  ['k_veil', 'ผ้าคลุมหน้าเจ้าหญิงทะเลทราย', 'Desert Princess Veil', 'veil', 'sakura', 'goldLight', null, {}, 60],
  ['k_veiln', 'ผ้าคลุมหน้านินจาทมิฬ', 'Shadow Ninja Veil', 'veil', 'onyx', 'bloodGlow', null, {}, 60],
  ['k_veilb', 'ผ้าคลุมหน้านางรำ', 'Dancer Pearl Veil', 'veil', 'pearl', 'iceGlow', null, {}, 60],
  ['k_visor', 'หน้ากากไซเบอร์นีออน', 'Neon Cyber Visor', 'visor', 'onyx', 'silver', 'cyanGlow', {}, 90],
  ['k_visorr', 'หน้ากากนักรบเลือดเหล็ก', 'Iron Blood Visor', 'visor', 'silver', 'onyx', 'bloodGlow', {}, 90],
  ['k_visorg', 'หน้ากากอัศวินแสงทอง', 'Golden Paladin Visor', 'visor', 'gold', 'goldLight', 'goldLight', {}, 100],
  ['k_tiger', 'หน้ากากเสือสมิง', 'Saming Tiger Mask', 'tiger', 'sun', 'onyx', 'goldLight', {}, 90],
  ['k_tigerw', 'หน้ากากพยัคฆ์ขาวหิมะ', 'White Snow Tiger Mask', 'tiger', 'white', 'royalBlue', 'cyanGlow', {}, 90],
  ['k_phantom', 'หน้ากากปีศาจโรงละคร', 'Opera Phantom Mask', 'phantom', 'pearl', 'silver', null, {}, 70],
  ['k_phantomb', 'หน้ากากเงาครึ่งซีก', 'Half-shadow Mask', 'phantom', 'onyx', 'voidGlow', 'voidGlow', {}, 80],
  ['k_sun', 'หน้ากากสุริยเทพ', 'Sun God Mask', 'sun', 'goldLight', 'lavaGlow', null, {}, 110],
  ['k_moon', 'หน้ากากจันทราเทวี', 'Moon Goddess Mask', 'sun', 'silver', 'iceGlow', 'cyanGlow', {}, 110],
  ['k_rahu', 'หน้ากากราหู', 'Rahu Mask', 'full', 'abyss', 'voidGlow', 'bloodGlow', {fangs:true}, 120]
];
for (const [id, th, en, st, fm, tr, eye, more, price] of F_MASKS){
  COSTUME[id] = {slot:'mask', th, en, src:'coin', price:{c:price}, grand:true, sw:[fm, tr], look:{faceMask:fm, fmStyle:st, fmTrim:tr, fmEye:eye, ...more}};
  SPR.GEAR_LOOK[id] = COSTUME[id].look;
}

/* ---------- 30 pairs of wings ---------- */
const F_WINGS = [
  ['w_seraph', 'ปีกเทวทูตเจ็ดสวรรค์', 'Seventh Heaven Wings', 'ether', ['#ffffff', '#fff2c0', '#e8b040'], '#fff0b0', '255,228,150', 'sparkle', 1.2, {halo:true}, 200],
  ['w_fallen', 'ปีกเทวดาตกสวรรค์', 'Fallen Angel Wings', 'tattered', ['#e8e0ff', '#5a4a8a', '#1a1030'], '#c8b8ff', '170,140,255', 'star', 1.15, {halo:true, dark:true}, 190],
  ['w_swan', 'ปีกหงส์ขาวบริสุทธิ์', 'Pure Swan Wings', 'feather', ['#ffffff', '#eef6ff', '#a8c8e8'], '#ffffff', '220,240,255', 'feather', 1.05, {}, 140],
  ['w_raven', 'ปีกอีกาแห่งลางร้าย', 'Raven of Omen Wings', 'raven', ['#6a6a8a', '#22222e', '#0a0a10'], '#8a8aa8', '140,120,200', 'feather', 1.1, {}, 140],
  ['w_sakura', 'ปีกกลีบซากุระ', 'Sakura Petal Wings', 'petal', ['#ffffff', '#ffd0e4', '#ff7aaa'], '#ffffff', '255,170,210', 'petal', 1, {}, 150],
  ['w_lotus', 'ปีกกลีบบัวทอง', 'Golden Lotus Wings', 'lotus', ['#fff8e0', '#ffd88a', '#e8a030'], '#fff0c0', '255,210,120', 'gold', 1.05, {}, 160],
  ['w_bat', 'ปีกค้างคาวรัตติกาล', 'Night Bat Wings', 'bat', ['#8a6aa8', '#3a1a5a', '#14061e'], '#0a0410', '170,80,255', 'star', 1.05, {}, 130],
  ['w_demon', 'ปีกปีศาจโลหิต', 'Blood Demon Wings', 'spine', ['#ff6a6a', '#a8102a', '#2a0610'], '#1a0408', '255,40,60', 'ember', 1.15, {}, 160],
  ['w_void', 'ปีกห้วงจักรวาล', 'Cosmic Void Wings', 'void', ['#e8c8ff', '#5a1aa8', '#0e0420'], '#c48aff', '170,100,255', 'star', 1.1, {}, 190],
  ['w_galaxy', 'ปีกทางช้างเผือก', 'Milky Way Wings', 'orbit', ['#c8f0ff', '#1a4aa8', '#040a24'], '#8ad8ff', '120,200,255', 'star', 1.2, {}, 200],
  ['w_satan', 'ปีกซาตานนรกันต์', 'Satan Hellfire Wings', 'satan', ['#ff8a3a', '#3a0a10', '#0a0204'], '#ff5a1a', '255,80,30', 'ember', .95, {}, 220],
  ['w_satanv', 'ปีกเจ้านรกน้ำแข็ง', 'Frozen Hell Lord Wings', 'icicle', ['#9ae8ff', '#0a2a4a', '#02060e'], '#5ad0ff', '90,200,255', 'frost', .95, {}, 220],
  ['w_devil', 'ปีกเดวิลราตรี', 'Midnight Devil Wings', 'devil', ['#ff7aa8', '#c0124a', '#30041a'], '#ffb0cc', '255,70,140', 'sparkle', 1, {}, 160],
  ['w_imp', 'ปีกปีศาจน้อยมรกต', 'Emerald Imp Wings', 'mini', ['#c8ffb0', '#2a9a3a', '#06220a'], '#e8ffd0', '120,255,140', 'sparkle', .9, {}, 130],
  ['w_fairy', 'ปีกภูตแสงรุ้ง', 'Prismatic Fae Wings', 'butterfly', ['#ffffff', '#9ff0d8', '#4ab0e8'], '#ffffff', '160,255,220', 'sparkle', .95, {}, 140],
  ['w_monarch', 'ปีกผีเสื้อจักรพรรดิ', 'Monarch Butterfly Wings', 'swallowtail', ['#fff2c0', '#ff9a2a', '#1a0a04'], '#1a0a04', '255,170,60', 'gold', 1, {}, 150],
  ['w_phoenix', 'ปีกหงส์เพลิงนิรันดร์', 'Eternal Phoenix Wings', 'flame', ['#fff6c0', '#ffa030', '#e02a10'], '#ff6a20', '255,140,40', 'ember', 1.15, {}, 200],
  ['w_blueflame', 'ปีกเปลวไฟน้ำเงิน', 'Blue Soulfire Wings', 'wisp', ['#ffffff', '#6ad0ff', '#1a4ae0'], '#3a8aff', '90,170,255', 'ember', 1.1, {}, 200],
  ['w_crystal', 'ปีกผลึกธารน้ำแข็ง', 'Glacier Crystal Wings', 'crystal', ['#ffffff', '#c8f2ff', '#5ab4f0'], '#e8fbff', '150,220,255', 'frost', 1.05, {}, 170],
  ['w_amethyst', 'ปีกผลึกอเมทิสต์', 'Amethyst Crystal Wings', 'amethyst2', ['#fbf4ff', '#c79cff', '#6a2fc0'], '#3a1478', '200,150,255', 'sparkle', 1.1, {}, 170],   // (v89) new cut
  ['w_garuda', 'ปีกพญาครุฑกนกทอง', 'Golden Kanok Garuda Wings', 'kanok', ['#fff4b0', '#ffc83a', '#b8700e'], '#6a3a06', '255,200,80', 'gold', 1.05, {}, 210],
  ['w_kanokj', 'ปีกกนกหยกเทวา', 'Jade Kanok Deva Wings', 'cloud', ['#e0fff0', '#4ad8a0', '#0e6a48'], '#063a26', '120,255,200', 'sparkle', 1.05, {}, 210],
  ['w_dragon', 'ปีกมังกรมรกต', 'Emerald Dragon Wings', 'dragon', ['#c8ffd8', '#2a9a5a', '#0a3a1e'], '#06200e', '90,255,160', 'ember', 1.15, {}, 210],
  ['w_dragonr', 'ปีกมังกรเพลิงกาฬ', 'Black Fire Dragon Wings', 'bone', ['#ff9a5a', '#5a0a0a', '#120202'], '#ff5a1a', '255,90,40', 'ember', 1.2, {}, 220],
  ['w_blade', 'ปีกดาบเทวะทองคำ', 'Golden Deva Blade Wings', 'blade', ['#ffffff', '#ffe08a', '#c8901a'], '#fff6d0', '255,215,110', 'gold', 1.1, {}, 220],
  ['w_bladei', 'ปีกดาบน้ำแข็งพันเล่ม', 'Thousand Ice Blades', 'flake', ['#ffffff', '#bfeeff', '#3a9ae0'], '#e8fbff', '140,215,255', 'frost', 1.1, {}, 220],
  ['w_ribbon', 'ปีกแพรไหมนางฟ้า', 'Celestial Silk Ribbons', 'ribbon', ['#ffffff', '#ffc8e0', '#c85aa0'], '#fff0f8', '255,170,220', 'petal', 1.1, {}, 170],
  ['w_ribbong', 'ปีกแพรทองราชสำนัก', 'Royal Gold Silk Wings', 'silk2', ['#fffbe8', '#ffd45a', '#b8780e'], '#7a4a06', '255,210,110', 'gold', 1.1, {}, 170],   // (v89) new cut
  ['w_leaf', 'ปีกใบไม้พงไพร', 'Wildwood Leaf Wings', 'leaf', ['#e0ffc0', '#5ac83a', '#1a5a12'], '#0e3a08', '150,255,110', 'petal', 1, {}, 140],
  ['w_autumn', 'ปีกใบเมเปิลฤดูใบไม้ร่วง', 'Autumn Maple Wings', 'maple', ['#fff0c0', '#ff8a2a', '#9a1a0a'], '#5a0a04', '255,150,70', 'ember', 1, {}, 140]
];
for (const [id, th, en, kind, c, edge, glow, fx, span, more, price] of F_WINGS) WINGS[id] = {set:null, th, en, kind, c, edge, glow, fx, span, price:{c:price}, ...more};

/* the four new wing cuts (wing space: x outwards 0…45, y up is negative) */
const WING_X = {
  /* (v89) amethyst: long faceted crystal shards fanned into a wing over a violet veil, a cluster of small gems at the root */
  amethyst2(g, W, t, s){ const c = W.c, sway = Math.sin(t * 1.6) * .025;
    const SH = [[-1.32, 24], [-1.05, 34], [-.78, 41], [-.5, 40], [-.22, 35], [.06, 28], [.34, 20]];
    // the veil between the shards
    g.beginPath(); g.moveTo(0, 0); for (const [a, l] of SH){ g.lineTo(Math.cos(a + sway) * l * .78, Math.sin(a + sway) * l * .78); } g.closePath();
    g.save(); g.globalAlpha = .38; g.fillStyle = wlg(g, 0, -30, 36, 10, [c[0], c[1], c[2]]); g.fill(); g.restore();
    for (let i = 0; i < SH.length; i++){ const [a0, l] = SH[i], a = a0 + sway * (1 + i * .15), w = 3.2 + (l > 34 ? 1.2 : 0);
      g.save(); g.rotate(a);
      // two facets: lit upper half, shaded lower half, a bright ridge between
      g.beginPath(); g.moveTo(2, 0); g.lineTo(l * .25, -w); g.lineTo(l, 0); g.closePath(); g.fillStyle = wlg(g, 0, -w, l, 0, [c[0], c[1], c[1]]); g.fill();
      g.beginPath(); g.moveTo(2, 0); g.lineTo(l * .25, w); g.lineTo(l, 0); g.closePath(); g.fillStyle = wlg(g, 0, 0, l, w, [c[1], c[2], c[2]]); g.fill();
      g.shadowBlur = 0; g.beginPath(); g.moveTo(2, 0); g.lineTo(l * .25, -w); g.lineTo(l, 0); g.lineTo(l * .25, w); g.closePath(); g.strokeStyle = W.edge; g.lineWidth = .55; g.stroke();
      g.beginPath(); g.moveTo(l * .25, 0); g.lineTo(l * .97, 0); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = .5; g.stroke();
      g.restore(); }
    // the gem cluster at the shoulder
    for (const [x, y, r, a] of [[4, -3, 4.2, -.9], [9, 1, 3.4, -.2], [6, -8, 3, -1.3], [11, -5, 2.6, -.6]]){
      g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, -r * 1.5); g.lineTo(r * .8, 0); g.lineTo(0, r * 1.2); g.lineTo(-r * .8, 0); g.closePath();
      g.fillStyle = wlg(g, 0, -r, 0, r, [c[0], c[1], c[2]]); g.fill(); g.strokeStyle = W.edge; g.lineWidth = .5; g.stroke(); g.restore(); } },
  /* (v89) royal gold silk: three tiers of long embroidered silk panels with ruby tassels, on a gilded arm */
  silk2(g, W, t, s){ const c = W.c, arm = u => [u * 34, -20 * Math.sin(u * 2.2) - u * 6];
    const panel = (x, y, ang, len, w, fill, ph, bead) => { const bend = Math.sin(t * 2 + ph) * 1.6;
      g.save(); g.translate(x, y); g.rotate(ang);
      g.beginPath(); g.moveTo(-w * .5, 0); g.bezierCurveTo(-w, len * .4, -w * .6 + bend, len * .8, bend, len); g.bezierCurveTo(w * .6 + bend, len * .8, w, len * .4, w * .5, 0); g.closePath();
      g.fillStyle = fill; g.fill(); g.shadowBlur = 0; g.strokeStyle = W.edge; g.lineWidth = .6; g.stroke();
      // embroidery: a gold seam down the middle and a row of small stitches near the hem
      g.beginPath(); g.moveTo(0, 1); g.quadraticCurveTo(bend * .4, len * .5, bend * .9, len * .9); g.strokeStyle = 'rgba(255,248,220,.75)'; g.lineWidth = .45; g.stroke();
      g.fillStyle = W.edge; for (let i = 1; i < 4; i++){ const v = .55 + i * .1; g.beginPath(); g.arc(bend * v - w * .32 * (1 - v), len * v, .45, 0, 7); g.fill(); g.beginPath(); g.arc(bend * v + w * .32 * (1 - v), len * v, .45, 0, 7); g.fill(); }
      // a ruby bead and a short tassel at the tip of the long panels
      if (bead){ g.beginPath(); g.arc(bend, len + .8, 1.2, 0, 7); g.fillStyle = '#c8203a'; g.fill(); g.beginPath(); g.moveTo(bend - .8, len + 1.8); g.lineTo(bend, len + 5); g.lineTo(bend + .8, len + 1.8); g.fillStyle = c[1]; g.fill(); }
      g.restore(); };
    const f1 = wlg(g, 0, -24, 0, 22, [c[0], c[1], c[2]]), f2 = wlg(g, 0, -14, 0, 16, [c[0], c[0], c[1]]);
    for (let i = 5; i >= 0; i--){ const u = .3 + i / 5 * .7, [ax, ay] = arm(u); panel(ax, ay, -.3 - u * 1.2, 16 + u * 16, 7.5, f1, i, true); }   // outer panels sweep out to the side
    for (let i = 4; i >= 0; i--){ const u = .14 + i / 4 * .5, [ax, ay] = arm(u); panel(ax, ay + 1.5, -.1 - u * .9, 11 + u * 7, 6.5, f2, i + 3); }
    for (let i = 0; i < 3; i++){ const u = .04 + i * .12, [ax, ay] = arm(u); panel(ax, ay + 3, .2 - u * .6, 8 + u * 5, 5.5, f2, i + 7); }
    // the gilded arm with a small ruby at the elbow
    g.beginPath(); for (let i = 0; i <= 14; i++){ const [ax, ay] = arm(i / 14); i ? g.lineTo(ax, ay) : g.moveTo(ax, ay); } g.strokeStyle = c[2]; g.lineWidth = 2.2; g.lineCap = 'round'; g.stroke();
    g.strokeStyle = c[0]; g.lineWidth = .7; g.stroke();
    { const [ex, ey] = arm(.5); g.beginPath(); g.arc(ex, ey, 1.8, 0, 7); g.fillStyle = '#d8283e'; g.fill(); g.strokeStyle = c[0]; g.lineWidth = .6; g.stroke(); } },
  dragon(g, W, t, s){ const c = W.c, el = [15, -20], tip = [44, -28], fing = [[46, -6], [38, 8], [26, 14], [14, 12]];
    g.beginPath(); g.moveTo(0, 0); g.lineTo(el[0], el[1]); g.lineTo(tip[0], tip[1]);
    for (const f of fing){ g.quadraticCurveTo((f[0] + el[0]) / 2 + 4, (f[1] + el[1]) / 2 + 6, f[0], f[1]); }
    g.quadraticCurveTo(6, 10, 0, 4); g.closePath(); g.fillStyle = wlg(g, 0, -28, 20, 16, [c[1], c[2], c[2]]); g.fill();
    g.save(); g.clip(); g.shadowBlur = 0; g.globalAlpha = .35; g.strokeStyle = c[0]; g.lineWidth = .6;
    for (let i = 0; i < 14; i++){ g.beginPath(); g.arc(8 + (i % 5) * 8, -14 + Math.floor(i / 5) * 9, 3, 0, Math.PI); g.stroke(); } g.restore();
    g.strokeStyle = W.edge === '#06200e' || W.edge === '#120202' ? c[0] : W.edge; g.lineWidth = 2; g.lineCap = 'round'; g.shadowBlur = 0;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(el[0], el[1]); g.lineTo(tip[0], tip[1]); g.stroke();
    g.lineWidth = 1.1; for (const f of fing){ g.beginPath(); g.moveTo(el[0], el[1]); g.lineTo(f[0], f[1]); g.stroke(); }
    g.fillStyle = c[0]; g.beginPath(); g.moveTo(el[0], el[1] - 1); g.lineTo(el[0] - 2, el[1] - 7); g.lineTo(el[0] + 2.2, el[1] - 1.5); g.fill();
    g.beginPath(); g.moveTo(tip[0], tip[1]); g.lineTo(tip[0] + 4, tip[1] - 3); g.lineTo(tip[0] + .5, tip[1] + 2); g.fill(); },
  blade(g, W, t, s){ const c = W.c;
    for (let i = 0; i < 7; i++){ const a = -1.15 + i * .27 + Math.sin(t * 2 + i) * .03, len = 22 + (3 - Math.abs(i - 3)) * 4 + i * 1.2;
      g.save(); g.rotate(a); g.translate(6, 0);
      const gr = g.createLinearGradient(0, 0, len, 0); gr.addColorStop(0, c[2]); gr.addColorStop(.4, c[1]); gr.addColorStop(1, c[0]);
      g.beginPath(); g.moveTo(0, 0); g.lineTo(len * .2, -2.4); g.lineTo(len, 0); g.lineTo(len * .2, 2.4); g.closePath(); g.fillStyle = gr; g.fill();
      g.strokeStyle = W.edge; g.lineWidth = .6; g.stroke(); g.globalAlpha = .7; g.beginPath(); g.moveTo(1, 0); g.lineTo(len * .95, 0); g.strokeStyle = '#ffffff'; g.stroke(); g.globalAlpha = 1;
      g.fillStyle = c[2]; g.fillRect(-1.2, -3, 2.4, 6); g.restore(); } },
  ribbon(g, W, t, s){ const c = W.c;
    for (let r = 0; r < 3; r++){ const ph = t * 2.2 + r * 1.3, base = -6 + r * 6, gr = g.createLinearGradient(0, -20, 46, 10); gr.addColorStop(0, c[0]); gr.addColorStop(.5, c[1]); gr.addColorStop(1, c[2]);
      g.beginPath(); for (let i = 0; i <= 20; i++){ const u = i / 20, x = u * (40 - r * 6), y = base - u * 18 + Math.sin(ph + u * 5) * 5 * u; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.strokeStyle = gr; g.lineWidth = 5 - r * 1.1; g.lineCap = 'round'; g.stroke();
      g.globalAlpha = .6; g.strokeStyle = W.edge; g.lineWidth = .6; g.stroke(); g.globalAlpha = 1; } },
  leaf(g, W, t, s){ const c = W.c;
    for (let row = 0; row < 3; row++) for (let i = 0; i < 5 - row; i++){ const u = (i + .5) / 5, x = 6 + u * (38 - row * 8), y = -10 - row * 7 + u * u * 14 - Math.sin(u * 3) * 8 + row * 10, a = -.5 + u * 1.3 + Math.sin(t * 2 + i + row) * .06;
      g.save(); g.translate(x, y); g.rotate(a); const len = 12 - row * 2, gr = g.createLinearGradient(0, -len, 0, len); gr.addColorStop(0, c[0]); gr.addColorStop(.5, c[1]); gr.addColorStop(1, c[2]);
      g.beginPath(); g.moveTo(0, -len); g.quadraticCurveTo(len * .55, 0, 0, len); g.quadraticCurveTo(-len * .55, 0, 0, -len); g.fillStyle = gr; g.fill();
      g.strokeStyle = W.edge; g.lineWidth = .7; g.stroke(); g.beginPath(); g.moveTo(0, -len * .9); g.lineTo(0, len * .9); g.stroke(); g.restore(); } }
};
/* v31: the second wing of each pair gets a cut of its own, so no two of the 30 look alike */
const wFill = (g, W, x0, y0, x1, y1) => wlg(g, x0, y0, x1, y1, [W.c[0], W.c[1], W.c[2]]);
const wLine = (g, col, w) => { g.shadowBlur = 0; g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); };
const wPoly = (g, pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
Object.assign(WING_X, {
  // torn, ragged feathers with gaps, and a few falling away
  tattered(g, W, t){ const c = W.c;
    for (let i = 0; i < 10; i++){ const u = i / 9, x = 4 + u * 30, y = -4 - Math.sin(u * 2.6) * 22, h = H2(i * 7 + 3);
      const len = (i % 3 === 1 ? 10 : 18 + u * 12) * (.8 + h * .35), a = -2.5 + u * 1.6 + Math.sin(t * 2 + i) * .03;
      feather(g, x, y, a, len, 3.4 - u, wFill(g, W, x, y - 10, x + 10, y + len), W.edge, i % 3 === 1 ? null : c[2]);
      g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = c[2]; g.beginPath(); g.moveTo(-2, len * .7); g.lineTo(0, len * .55); g.lineTo(2, len * .72); g.lineTo(0, len * 1.02); g.fill(); g.restore(); }
    for (let k = 0; k < 3; k++){ const p = (t * .25 + k / 3) % 1; g.globalAlpha = 1 - p;
      feather(g, 18 + k * 9 + Math.sin(t + k) * 3, 6 + p * 26, 2.8 + Math.sin(t * 1.5 + k), 7, 2, c[1], W.edge); }
    g.globalAlpha = 1; },
  // long swept primaries trailing back like a diving bird
  raven(g, W, t){ const c = W.c;
    for (let i = 0; i < 7; i++){ const u = i / 6, x = 8 + u * 26, y = -10 - u * 16;
      feather(g, x, y, -1.05 + u * .55 + Math.sin(t * 2.4 + i) * .025, 30 + u * 8, 2.6, wFill(g, W, x, y, x + 30, y + 10), W.edge, c[2]); }
    g.beginPath(); g.moveTo(0, 2); g.quadraticCurveTo(14, -26, 36, -27); g.quadraticCurveTo(22, -12, 6, 8); g.closePath(); g.fillStyle = wFill(g, W, 0, -26, 30, 8); g.fill();
    for (let i = 0; i < 6; i++){ const u = i / 5; feather(g, 4 + u * 26, -6 - u * 18 + 4, -.9 + u * .5, 10, 2.4, c[1], W.edge); }
    g.beginPath(); g.moveTo(2, 0); g.quadraticCurveTo(16, -24, 36, -27); wLine(g, c[0], 1.2); },
  // a fan of pointed lotus petals in two rows
  lotus(g, W, t){ const c = W.c, pet = (a, len, wd, fill) => { g.save(); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * .45, -wd, len, 0); g.quadraticCurveTo(len * .45, wd, 0, 0);
      g.fillStyle = fill; g.fill(); g.strokeStyle = W.edge; g.lineWidth = .6; g.shadowBlur = 0; g.stroke(); g.beginPath(); g.moveTo(len * .1, 0); g.lineTo(len * .85, 0); g.globalAlpha = .5; g.stroke(); g.globalAlpha = 1; g.restore(); };
    for (let i = 0; i < 7; i++) pet(-1.35 + i * .3 + Math.sin(t * 1.8 + i) * .02, 40 - Math.abs(i - 3) * 3, 7, wlg(g, 0, 0, 40, 0, [c[2], c[1], c[1]]));
    for (let i = 0; i < 6; i++) pet(-1.2 + i * .3, 26 - Math.abs(i - 2.5) * 2, 5.5, wlg(g, 0, 0, 26, 0, [c[1], c[0], c[0]]));
    g.fillStyle = c[0]; g.beginPath(); g.arc(2, 0, 3, 0, 7); g.fill(); },
  // bony spines with a torn membrane between the first two only
  spine(g, W, t){ const c = W.c, sp = [[40, -30], [46, -10], [36, 10], [22, 18]];
    g.beginPath(); g.moveTo(0, 0); g.lineTo(sp[0][0], sp[0][1]); g.quadraticCurveTo(40, -18, sp[1][0], sp[1][1]); g.lineTo(30, 0); g.closePath(); g.fillStyle = wFill(g, W, 0, -30, 40, 0); g.globalAlpha = .85; g.fill(); g.globalAlpha = 1;
    sp.forEach((s, i) => { const mx = s[0] * .5, my = s[1] * .5 - 4;
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(mx, my, s[0], s[1]); wLine(g, c[0], 2.2 - i * .3);
      for (const k of [.35, .7]){ g.fillStyle = c[0]; g.beginPath(); g.arc(s[0] * k + (mx - s[0] * .5) * k, s[1] * k + (my - s[1] * .5) * k, 1.8, 0, 7); g.fill(); }
      g.save(); g.translate(s[0], s[1]); g.rotate(Math.atan2(s[1], s[0])); g.fillStyle = W.edge === '#1a0408' ? c[0] : W.edge; g.beginPath(); g.moveTo(0, -1.6); g.lineTo(6, -3.5); g.lineTo(0, 1.6); g.fill(); g.restore(); }); },
  // a star with rings of orbiting lights
  orbit(g, W, t){ const c = W.c, cx = 22, cy = -12;
    for (let r = 0; r < 3; r++){ const rx = 12 + r * 7, ry = 4 + r * 2.4, rot = -.5 + r * .35;
      g.save(); g.translate(cx, cy); g.rotate(rot); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.strokeStyle = r === 1 ? c[0] : c[1]; g.lineWidth = 1.2; g.globalAlpha = .8; g.stroke(); g.globalAlpha = 1;
      for (let k = 0; k < 2 + r; k++){ const a = t * (1.2 - r * .25) + k * 6.28 / (2 + r) + r; g.fillStyle = k ? c[1] : c[0]; g.beginPath(); g.arc(Math.cos(a) * rx, Math.sin(a) * ry, 2.2 - r * .3, 0, 7); g.fill(); }
      g.restore(); }
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, 8); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.5, c[0]); gr.addColorStop(1, c[2]); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, 7, 0, 7); g.fill();
    g.beginPath(); g.moveTo(0, 0); g.lineTo(cx - 7, cy + 2); wLine(g, c[1], 1.4); },
  // a frozen sheet with jagged icicles hanging off it
  icicle(g, W, t){ const c = W.c, top = [[0, 0], [10, -18], [22, -26], [34, -30], [44, -24]], bot = [];
    for (let i = 0; i <= 7; i++){ const u = i / 7, x = 44 - u * 42, y = -20 + u * 18; bot.push([x, y]); if (i < 7) bot.push([x - 3, y + 10 + H2(i * 5) * 12 * (1 - u * .4)]); }
    wPoly(g, top.concat(bot)); g.fillStyle = wFill(g, W, 10, -30, 30, 20); g.fill(); g.strokeStyle = W.edge; g.lineWidth = .8; g.shadowBlur = 0; g.stroke();
    g.globalAlpha = .55; g.strokeStyle = '#ffffff'; g.lineWidth = .5; for (let i = 0; i < 5; i++){ g.beginPath(); g.moveTo(4 + i * 8, -6 - i * 3); g.lineTo(10 + i * 8, -20 - i * 2); g.stroke(); } g.globalAlpha = 1; },
  // small, round and scalloped, with a little heart
  mini(g, W, t){ const c = W.c; g.save(); g.scale(.72, .72);
    g.beginPath(); g.moveTo(0, 2); g.quadraticCurveTo(10, -32, 34, -26); for (let i = 0; i < 4; i++){ const u = (i + 1) / 4; g.quadraticCurveTo(38 - u * 6, -20 + u * 12, 34 - u * 30 + 6, -8 + u * 16 - 4); }
    g.quadraticCurveTo(4, 14, 0, 2); g.fillStyle = wFill(g, W, 0, -30, 30, 14); g.fill(); g.strokeStyle = W.edge; g.lineWidth = 1.2; g.shadowBlur = 0; g.stroke();
    const hx = 17, hy = -10, b = 1 + Math.sin(t * 4) * .08; g.translate(hx, hy); g.scale(b, b); g.beginPath(); g.moveTo(0, 3); g.bezierCurveTo(-6, -2, -3, -7, 0, -3.5); g.bezierCurveTo(3, -7, 6, -2, 0, 3); g.fillStyle = c[0]; g.fill(); g.restore(); },
  // butterfly wings with long tails and eyespots
  swallowtail(g, W, t){ const c = W.c;
    g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(10, -34, 40, -36, 42, -20); g.bezierCurveTo(40, -8, 18, -4, 0, 0); g.fillStyle = wFill(g, W, 0, -34, 40, 0); g.fill(); g.strokeStyle = W.edge; g.lineWidth = 1.4; g.shadowBlur = 0; g.stroke();
    g.beginPath(); g.moveTo(0, 2); g.bezierCurveTo(20, 2, 30, 10, 24, 18); g.quadraticCurveTo(26, 30 + Math.sin(t * 3) * 2, 22, 38); g.quadraticCurveTo(18, 26, 14, 20); g.quadraticCurveTo(4, 18, 0, 2); g.fillStyle = wFill(g, W, 0, 0, 24, 36); g.fill(); g.stroke();
    for (const [x, y, r] of [[30, -22, 4.5], [18, 12, 3]]){ g.fillStyle = c[2]; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = c[0]; g.beginPath(); g.arc(x, y, r * .6, 0, 7); g.fill(); g.fillStyle = c[2]; g.beginPath(); g.arc(x + r * .15, y - r * .15, r * .25, 0, 7); g.fill(); }
    g.fillStyle = c[0]; for (let i = 0; i < 6; i++){ g.beginPath(); g.arc(14 + i * 5, -30 + Math.abs(i - 2.5) * 2.4, .9, 0, 7); g.fill(); } },
  // loose spirit flames floating in an arc
  wisp(g, W, t){ const c = W.c;
    for (let i = 0; i < 6; i++){ const u = i / 5, a = -2.4 + u * 1.9, r = 20 + H2(i * 3) * 10, x = 4 + Math.cos(a + 1.57) * r + u * 6, y = -8 + Math.sin(a + 1.57) * -r * .9 + Math.sin(t * 3 + i * 1.7) * 2, s = 1 - u * .3 + Math.sin(t * 7 + i) * .06;
      g.save(); g.translate(x, y); g.scale(s, s);
      g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(-6, 4, -4, -4, 0, -11 - Math.sin(t * 6 + i) * 1.5); g.bezierCurveTo(4, -4, 6, 4, 0, 6); g.fillStyle = wlg(g, 0, -11, 0, 6, [c[0], c[1], c[2]]); g.fill();
      g.beginPath(); g.ellipse(0, 2, 2, 3, 0, 0, 7); g.fillStyle = '#ffffff'; g.fill(); g.restore(); }
    g.globalAlpha = .4; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(18, -30, 40, -14); wLine(g, c[1], .8); g.globalAlpha = 1; },
  // auspicious cloud scrolls stacked into a wing
  cloud(g, W, t){ const c = W.c, puffs = [[8, -6, 7], [16, -16, 8], [27, -22, 8], [38, -20, 7], [42, -8, 6], [33, -6, 7], [22, -2, 7], [12, 6, 6], [26, 8, 5]];
    g.fillStyle = wFill(g, W, 0, -28, 30, 14); g.beginPath(); for (const [x, y, r] of puffs){ g.moveTo(x + r, y); g.arc(x, y + Math.sin(t * 1.6 + x) * .6, r, 0, 7); } g.fill();
    g.strokeStyle = W.edge; g.lineWidth = .9; g.shadowBlur = 0; g.lineCap = 'round';
    for (const [x, y, r] of puffs){ g.beginPath(); for (let k = 0; k <= 18; k++){ const a = k * .5, rr = r * .7 * (1 - k / 22); k ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + rr, y); } g.stroke(); } },
  // a bare skeleton with a faint burning membrane and glowing joints
  bone(g, W, t){ const c = W.c, el = [16, -20], tip = [42, -30], fing = [[46, -6], [36, 8], [24, 14]];
    g.beginPath(); g.moveTo(0, 0); g.lineTo(el[0], el[1]); g.lineTo(tip[0], tip[1]); for (const f of fing) g.lineTo(f[0], f[1]); g.closePath();
    g.globalAlpha = .28 + Math.sin(t * 3) * .06; g.fillStyle = W.edge; g.fill(); g.globalAlpha = 1;
    const bn = (x0, y0, x1, y1, w) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); wLine(g, c[0], w); for (const [x, y] of [[x0, y0], [x1, y1]]){ g.fillStyle = c[0]; g.beginPath(); g.arc(x, y, w * .75, 0, 7); g.fill(); } };
    bn(0, 0, el[0], el[1], 2.6); bn(el[0], el[1], tip[0], tip[1], 2); for (const f of fing) bn(el[0], el[1], f[0], f[1], 1.4);
    g.save(); g.globalCompositeOperation = 'lighter'; for (const [x, y] of [el, tip, ...fing]){ g.fillStyle = `rgba(${W.glow},${.5 + Math.sin(t * 4 + x) * .3})`; g.beginPath(); g.arc(x, y, 2.2, 0, 7); g.fill(); } g.restore(); },
  // one great snowflake, slowly turning
  flake(g, W, t){ const c = W.c, cx = 22, cy = -12, R = 20; g.save(); g.translate(cx, cy); g.rotate(t * .3);
    for (let i = 0; i < 6; i++){ g.save(); g.rotate(i * 1.047);
      g.beginPath(); g.moveTo(0, 0); g.lineTo(R, 0); for (const k of [.4, .65, .85]){ const b = R * (1 - k) * .55 + 2; g.moveTo(R * k, 0); g.lineTo(R * k + b * .6, -b); g.moveTo(R * k, 0); g.lineTo(R * k + b * .6, b); }
      wLine(g, c[1], 2.6); g.stroke(); g.strokeStyle = c[0]; g.lineWidth = 1.1; g.stroke(); g.restore(); }
    wPoly(g, [0, 1, 2, 3, 4, 5].map(i => [Math.cos(i * 1.047) * 5, Math.sin(i * 1.047) * 5])); g.fillStyle = c[0]; g.fill(); g.restore();
    g.beginPath(); g.moveTo(0, 0); g.lineTo(cx - 6, cy + 3); wLine(g, c[1], 1.2); },
  // one big maple leaf
  maple(g, W, t){ const c = W.c; g.save(); g.translate(22, -10); g.rotate(-.5 + Math.sin(t * 1.8) * .04);
    const pts = []; const lobes = [[0, -24], [7, -12], [20, -14], [14, -2], [20, 8], [6, 6], [3, 18], [0, 12], [-3, 18], [-6, 6], [-20, 8], [-14, -2], [-20, -14], [-7, -12]];
    for (const [x, y] of lobes) pts.push([x, y]); wPoly(g, pts); g.fillStyle = wlg(g, 0, -24, 0, 18, [c[0], c[1], c[2]]); g.fill(); g.strokeStyle = W.edge; g.lineWidth = .9; g.shadowBlur = 0; g.stroke();
    g.beginPath(); for (const [x, y] of [[0, -24], [20, -14], [20, 8], [-20, 8], [-20, -14]]){ g.moveTo(0, 12); g.lineTo(x * .85, y * .85); } wLine(g, W.edge, .7); g.restore();
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(10, 4, 22 - 3, 2); wLine(g, W.edge, 1.2); }
});
{ const _ws = wingShape; wingShape = function(g, W){ const f = WING_X[W.kind]; return f ? f.apply(this, arguments) : _ws.apply(this, arguments); }; }

/* ---------- 30 mounts ---------- */
const F_MOUNTS = [
  // you stand on these
  ['m_cloud', 'เมฆมงคลทองคำ', 'Golden Auspicious Cloud', 'cloud2', 12, ['#ffffff', '#ffd36a'], {}, 70],
  ['m_storm', 'เมฆพายุสายฟ้า', 'Thunderstorm Cloud', 'cloud2', 12, ['#8a8ab8', '#6ad0ff'], {bolt:true}, 90],
  ['m_dusk', 'เมฆสนธยา', 'Twilight Cloud', 'cloud2', 12, ['#ffc8a8', '#ff7aaa'], {}, 70],
  ['m_lotus', 'บัวลอยสวรรค์', 'Heavenly Lotus', 'lotus2', 10, ['#fff4fa', '#e8709e'], {}, 80],
  ['m_lotusi', 'บัวผลึกน้ำแข็ง', 'Ice Crystal Lotus', 'lotus2', 10, ['#ffffff', '#5ab4f0'], {}, 90],
  ['m_lotusg', 'บัวทองคำพันกลีบ', 'Thousand-petal Gold Lotus', 'lotus2', 10, ['#fff8d0', '#e8a030'], {}, 100],
  ['m_carpet', 'พรมวิเศษลายไทย', 'Thai Magic Carpet', 'carpet2', 9, ['#b81e30', '#ffc83a'], {}, 80],
  ['m_carpetn', 'พรมวิเศษดารานภา', 'Starry Night Carpet', 'carpet2', 9, ['#1a1a5a', '#9ad8ff'], {}, 90],
  ['m_circle', 'วงเวทสุริยะ', 'Solar Magic Circle', 'disc', 6, ['#ffd36a', '#fff6c0'], {}, 100],
  ['m_circlev', 'วงเวทห้วงมืด', 'Abyssal Magic Circle', 'disc', 6, ['#a05aff', '#e8c8ff'], {}, 100],
  ['m_circlej', 'วงเวทพฤกษา', 'Verdant Magic Circle', 'disc', 6, ['#4ae8a8', '#d8fff0'], {}, 100],
  ['m_fire', 'เมฆเพลิงหงส์', 'Phoenix Fire Cloud', 'fire', 11, ['#ffb030', '#ff3a10'], {}, 120],
  ['m_bluefire', 'เมฆไฟวิญญาณสีคราม', 'Blue Spirit Flame', 'fire', 11, ['#9ae8ff', '#2a6aff'], {}, 120],
  ['m_crystal', 'ผลึกน้ำแข็งลอยฟ้า', 'Floating Ice Crystal', 'crystal', 10, ['#e8fbff', '#5ab4f0'], {}, 110],
  ['m_amethyst', 'ผลึกอเมทิสต์ลอยฟ้า', 'Floating Amethyst', 'crystal', 10, ['#f4e8ff', '#9a5ae0'], {}, 110],
  ['m_sword', 'กระบี่เหาะทองคำ', 'Golden Flying Sword', 'sword', 8, ['#fff2b0', '#d8a020'], {}, 120],
  ['m_swordj', 'กระบี่เหาะหยกเขียว', 'Jade Flying Sword', 'sword', 8, ['#d8fff0', '#2ab888'], {}, 120],
  ['m_moon', 'เสี้ยวจันทร์เหินฟ้า', 'Crescent Moon Glider', 'moon', 12, ['#f4f8ff', '#9ab8ff'], {}, 130],
  // you ride these
  ['m_singha', 'ราชสีห์ทองคำ', 'Golden Singha', 'beast', 16, ['#ffd36a', '#b8700e'], {mob:'goldsingha', scale:1, aura:'255,210,100'}, 120],
  ['m_erawan', 'ช้างเอราวัณสามเศียร', 'Three-headed Erawan', 'beast', 19, ['#f4f0e6', '#c8a050'], {mob:'youngerawan', scale:.9, aura:'255,240,200'}, 140],
  ['m_garuda', 'พญาครุฑทะยานฟ้า', 'Soaring Garuda', 'beast', 20, ['#e02a1a', '#ffc83a'], {mob:'goldgaruda', scale:.95, fly:8, aura:'255,150,60'}, 150],
  ['m_pegasus', 'ม้าปีกสวรรค์', 'Heavenly Winged Horse', 'beast', 25, ['#ffffff', '#9ad8ff'], {mob:'wingedhorse', scale:1, fly:6, aura:'170,220,255'}, 140],
  ['m_kilen', 'กิเลนมงคล', 'Auspicious Kilen', 'beast', 21, ['#ffd36a', '#2ab888'], {mob:'kilen', scale:1, aura:'120,255,190'}, 130],
  ['m_snowlion', 'สิงโตหิมะแผงเทอร์คอยส์', 'Turquoise Snow Lion', 'beast', 16, ['#ffffff', '#3ad0d0'], {mob:'snowlion', scale:.9, aura:'120,240,255'}, 130],
  ['m_tiger', 'เสือหมอกสมิง', 'Mist Tiger', 'beast', 18, ['#ffd8a0', '#5a5a7a'], {mob:'misttiger', scale:1, aura:'200,200,255'}, 120],
  ['m_drake', 'มังกรลาวา', 'Lava Drake', 'beast', 12, ['#ff8a3a', '#3a0a0a'], {mob:'lavadrake', scale:.85, aura:'255,100,40'}, 160],
  ['m_wyrm', 'มังกรน้ำแข็ง', 'Ice Wyrm', 'beast', 9, ['#e8fbff', '#3a8ae0'], {mob:'icewyrm', scale:.8, aura:'140,210,255'}, 160],
  ['m_airavata', 'ไอราวตะช้างทรงเทพ', 'Airavata', 'beast', 19, ['#ffffff', '#ffd36a'], {mob:'airavata', scale:.75, aura:'255,240,180'}, 170],
  ['m_hamsa', 'หงส์สวรรค์', 'Heavenly Hamsa', 'beast', 15, ['#ffffff', '#ffc8e0'], {mob:'heavenhamsa', scale:.95, fly:7, aura:'255,200,230'}, 140],
  ['m_naga', 'พญานาคสวรรค์', 'Celestial Naga', 'beast', 11, ['#9ff0e4', '#2a8a9a'], {mob:'celestialnaga', scale:.8, aura:'120,255,230'}, 170]
];
for (const [id, th, en, kind, lift, c, more, price] of F_MOUNTS){ const m = {slot:'mount', th, en, kind, lift, c, price:{c:price}, ...more}; XMOUNT[id] = m; XCOS[id] = m; }

const fxGlow = (g, x, y, rx, ry, rgb, a) => { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, rx); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); g.restore(); };
const fxRGB = h => { const n = parseInt(h.slice(1), 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; };
const MOUNT_X = {
  cloud2(g, M, x, by, dir, t, moving){ const [c0, c1] = M.c;
    for (let i = 0; i < 8; i++){ const a = i / 8 * 6.283 + t * .4, cx = x + Math.cos(a) * 12, cy = by + 3 + Math.sin(a) * 3.6, r = 6.4 + Math.sin(i * 2.3 + t * 2) * 1.2;
      const gr = g.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, r); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, c0); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); }
    g.strokeStyle = c1; g.lineWidth = 1; for (const s of [-1, 1]){ g.beginPath(); g.arc(x + s * 14, by + 3, 3, s > 0 ? 3.1 : 0, s > 0 ? 7.6 : 4.6); g.stroke(); }
    if (M.bolt && Math.sin(t * 7) > .7){ g.strokeStyle = c1; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 4, by + 8); g.lineTo(x - 1, by + 14); g.lineTo(x - 4, by + 15); g.lineTo(x, by + 22); g.stroke(); }
    if (moving) for (let i = 0; i < 4; i++){ const ph = (t * 1.5 + i / 4) % 1; g.fillStyle = `rgba(255,255,255,${.6 * (1 - ph)})`; g.beginPath(); g.arc(x - (dir >= 1 && dir <= 3 ? -1 : 1) * (14 + ph * 16), by + 4, 3 * (1 - ph) + 1, 0, 7); g.fill(); } },
  lotus2(g, M, x, by, dir, t){ const [c0, c1] = M.c; fxGlow(g, x, by + 3, 24, 10, fxRGB(c1), .35);
    g.fillStyle = '#3f8a4a'; g.beginPath(); g.ellipse(x, by + 5, 18, 5.4, 0, 0, 7); g.fill();
    for (const [rr, n, s] of [[13, 11, 1], [9, 8, .8]]) for (let i = 0; i < n; i++){ const a = -Math.PI + (i + .5) / n * Math.PI, px = x + Math.cos(a) * rr, py = by + 3 + Math.sin(a) * 2;
      g.save(); g.translate(px, py); g.rotate(a + Math.PI / 2); g.scale(s, s); const gr = g.createLinearGradient(0, -10, 0, 2); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, 2); g.quadraticCurveTo(4.4, -4, 0, -11); g.quadraticCurveTo(-4.4, -4, 0, 2); g.fill(); g.restore(); } },
  carpet2(g, M, x, by, dir, t){ const [c0, c1] = M.c, w = 32, h = 11;
    g.beginPath(); for (let i = 0; i <= 12; i++){ const u = i / 12, xx = x - w / 2 + u * w, yy = by + Math.sin(u * 6 + t * 6) * 1.6; i ? g.lineTo(xx, yy - h / 2) : g.moveTo(xx, yy - h / 2); }
    for (let i = 12; i >= 0; i--){ const u = i / 12, xx = x - w / 2 + u * w, yy = by + Math.sin(u * 6 + t * 6) * 1.6; g.lineTo(xx, yy + h / 2); } g.closePath();
    g.fillStyle = c0; g.fill(); g.strokeStyle = c1; g.lineWidth = 1.2; g.stroke();
    g.save(); g.clip(); g.strokeStyle = c1; g.globalAlpha = .8; g.lineWidth = .6; for (let i = 0; i < 6; i++){ const xx = x - w / 2 + 3 + i * 5.2; g.beginPath(); g.moveTo(xx, by - 3); g.lineTo(xx + 2.5, by); g.lineTo(xx, by + 3); g.lineTo(xx - 2.5, by); g.closePath(); g.stroke(); } g.restore(); },
  disc(g, M, x, by, dir, t){ const [c0, c1] = M.c, rgb = fxRGB(c0); fxGlow(g, x, by + 4, 26, 10, rgb, .45);
    g.save(); g.translate(x, by + 4); g.scale(1, .38); g.globalCompositeOperation = 'lighter'; g.strokeStyle = c0; g.shadowColor = c0; g.shadowBlur = 6;
    g.lineWidth = 1.4; g.beginPath(); g.arc(0, 0, 22, 0, 7); g.stroke(); g.lineWidth = .8; g.beginPath(); g.arc(0, 0, 17, 0, 7); g.stroke();
    g.rotate(t * .8); g.strokeStyle = c1; g.beginPath(); for (let i = 0; i < 6; i++){ const a = i / 6 * 6.283; g.lineTo(Math.cos(a) * 17, Math.sin(a) * 17); } g.closePath(); g.stroke();
    g.beginPath(); for (let i = 0; i < 6; i++){ const a = i / 6 * 6.283 + .52; g.lineTo(Math.cos(a) * 17, Math.sin(a) * 17); } g.closePath(); g.stroke();
    g.rotate(-t * 1.8); for (let i = 0; i < 12; i++){ const a = i / 12 * 6.283; g.save(); g.translate(Math.cos(a) * 19.5, Math.sin(a) * 19.5); g.rotate(a); g.fillStyle = c1; g.fillRect(-1, -.6, 2, 1.2); g.restore(); }
    g.restore();
    for (let i = 0; i < 5; i++){ const ph = (t * .6 + i / 5) % 1, a = i * 1.26 + t; g.fillStyle = `rgba(${rgb},${1 - ph})`; g.fillRect(x + Math.cos(a) * 16, by + 4 - ph * 22, 1.2, 1.2); } },
  fire(g, M, x, by, dir, t){ const [c0, c1] = M.c; fxGlow(g, x, by + 3, 24, 11, fxRGB(c1), .5);
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++){ const u = (i / 13 - .5) * 2, ph = (t * 1.6 + H2(i)) % 1, fx = x + u * 15, fy = by + 4 - ph * 12, r = (5 - Math.abs(u) * 2.2) * (1 - ph * .6);
      const gr = g.createRadialGradient(fx, fy, 0, fx, fy, r); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, c0); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(fx, fy, r, 0, 7); g.fill(); }
    g.restore(); },
  crystal(g, M, x, by, dir, t){ const [c0, c1] = M.c; fxGlow(g, x, by + 2, 22, 9, fxRGB(c1), .4);
    const shard = (cx, cy, w, h, a) => { g.save(); g.translate(cx, cy); g.rotate(a); const gr = g.createLinearGradient(-w, 0, w, 0); gr.addColorStop(0, c1); gr.addColorStop(.5, c0); gr.addColorStop(1, c1);
      g.beginPath(); g.moveTo(0, -h); g.lineTo(w, 0); g.lineTo(0, h * .5); g.lineTo(-w, 0); g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = .5; g.stroke(); g.restore(); };
    g.beginPath(); g.moveTo(x - 16, by); g.lineTo(x, by - 4); g.lineTo(x + 16, by); g.lineTo(x + 6, by + 12); g.lineTo(x - 6, by + 12); g.closePath();
    const gr = g.createLinearGradient(x, by - 4, x, by + 12); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = .7; g.stroke();
    for (let i = 0; i < 3; i++){ const a = t * .9 + i * 2.09; shard(x + Math.cos(a) * 20, by - 2 + Math.sin(a) * 4, 2, 5, Math.sin(t + i) * .4); } },
  sword(g, M, x, by, dir, t){ const [c0, c1] = M.c, fl = dir === 2 || dir === 1 || dir === 3 ? -1 : 1; fxGlow(g, x, by + 2, 26, 7, fxRGB(c1), .35);
    g.save(); g.translate(x, by + 2); g.scale(fl, 1);
    const gr = g.createLinearGradient(0, -3, 0, 3); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.5, c0); gr.addColorStop(1, c1);
    g.beginPath(); g.moveTo(-18, -2.4); g.lineTo(20, -2.4); g.lineTo(27, 0); g.lineTo(20, 2.4); g.lineTo(-18, 2.4); g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = c1; g.lineWidth = .6; g.stroke();
    g.fillStyle = c1; g.fillRect(-20, -5, 3, 10); g.fillRect(-28, -1.4, 8, 2.8); g.beginPath(); g.arc(-29, 0, 2, 0, 7); g.fill();
    for (let i = 0; i < 4; i++){ const ph = (t * 2 + i / 4) % 1; g.globalAlpha = 1 - ph; g.fillStyle = c0; g.fillRect(-30 - ph * 18, -1 + Math.sin(i * 3) * 2, 3, .8); } g.restore(); },
  moon(g, M, x, by, dir, t){ const [c0, c1] = M.c; fxGlow(g, x, by, 26, 14, fxRGB(c1), .45);
    g.save(); g.translate(x, by + 2); g.rotate(Math.sin(t * 1.2) * .05);
    const gr = g.createLinearGradient(0, -6, 0, 10); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.4, c0); gr.addColorStop(1, c1);
    g.beginPath(); g.arc(0, -10, 21, .35, Math.PI - .35); g.arc(0, -16, 19, Math.PI - .48, .48, true); g.closePath(); g.fillStyle = gr; g.shadowColor = c1; g.shadowBlur = 8; g.fill(); g.restore();
    for (let i = 0; i < 6; i++){ const ph = (t * .5 + i / 6) % 1, a = i * 1.05; g.fillStyle = `rgba(255,255,255,${(1 - ph) * .9})`; g.fillRect(x + Math.cos(a) * 22, by + 6 - ph * 18, 1, 1); } }
};
{ const _dm = drawMountX;
  drawMountX = function(g, M, x, y, dir, t, moving, part){
    if (M.kind === 'beast'){ if (part === 'under' && M.aura){ fxGlow(g, x, y, 24, 9, M.aura, .4 + .15 * Math.sin(t * 3));
        for (let i = 0; i < 6; i++){ const ph = (t * .7 + i / 6) % 1, a = i * 1.05 + t * .5; g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(${M.aura},${1 - ph})`; g.fillRect(x + Math.cos(a) * 18, y - ph * 30, 1.3, 1.3); g.restore(); } }
      return _dm.apply(this, arguments); }
    const f = MOUNT_X[M.kind]; if (!f) return _dm.apply(this, arguments);
    if (part !== 'under') return; const by = y - M.lift + Math.sin(t * 2.4) * 1.5;
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x, y, 16, 5, 0, 0, 7); g.fill();
    g.save(); f(g, M, x, by, dir, t, moving); g.restore();
  }; }

/* ---------- the mask place: worn look, other players, the preview ---------- */
if (!GHOST_SLOTS.includes('mask')) GHOST_SLOTS.push('mask');
{ const _vg = visGear; visGear = function(g){ const out = _vg(g); if (S && S.cos && g === S.gear && S.cos.mask && COSTUME[S.cos.mask] && cosUsable(S.cos.mask)) out.mask = typeof dyeId === 'function' ? dyeId(S.cos.mask) : S.cos.mask; return out; }; }
{ const _eps = eqPreviewSheet;
  eqPreviewSheet = function(){ const c = EQ.tab === 'cos' && EQ.try && COSTUME[EQ.try]; if (c && c.slot === 'mask'){ const g = {...visGear(S.gear), mask:EQ.try}; return heroSheet(S.job, g, S.look); } return _eps(); }; }
/* the preview also shows the mount you try or wear */
{ const _dp = drawEquipPrev;
  drawEquipPrev = function(){ const id = EQ.tab === 'cos' && EQ.try && XMOUNT[EQ.try] ? EQ.try : null; if (!id) return _dp.apply(this, arguments);
    const cv = document.getElementById('eqPrev'), sh = heroSheet(); if (!cv || !sh) return; const M = XMOUNT[id]; const K = sh.K, w = 92, h = 100, fx = w / 2, fy = h - 8; if (cv.width !== w * K || cv.height !== h * K){ cv.width = w * K; cv.height = h * K; }
    const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(K, 0, 0, K, 0, 0);
    drawMountX(g, M, fx, fy, EQ.dir, T, false, 'under');
    const lift = M.lift + (M.fly ? M.fly + Math.sin(T * 3) * 2 : 0) + (M.kind !== 'beast' ? Math.sin(T * 2.4) * 1.5 : 0);
    g.save(); g.translate(0, -lift); SPR.draw(g, sh, M.kind === 'beast' ? 'sit' : 'idle', EQ.dir, T, fx, fy); g.restore();
    drawMountX(g, M, fx, fy, EQ.dir, T, false, 'over'); }; }
{ const _rf = typeof cthRender === 'function' ? cthRender : null;
  if (_rf) cthRender = function(id){
    const c0 = COSTUME[id]; if (!c0 || c0.slot !== 'mask') return _rf.apply(this, arguments);
    const c = document.createElement('canvas'); c.width = CTH_W; c.height = CTH_H; const g = c.getContext('2d'), SC = CTH_W / 120, s = 3.5 * SC;
    const bg = g.createRadialGradient(CTH_W / 2, CTH_H * .55, 4, CTH_W / 2, CTH_H * .55, CTH_W * .75); bg.addColorStop(0, 'rgba(255,214,120,.42)'); bg.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = bg; g.fillRect(0, 0, CTH_W, CTH_H);
    // (v198) pieces painted on the face (glasses, visors, marks, mouth cloths) are shown close up: at head size they were too small to make out
    const lk = c0.look || {}, close = !!(lk.faceMask || lk.ninjaMask), z = close ? 5.6 * SC : s, fy = close ? CTH_HEAD - 9.5 : CTH_HEAD;
    try { g.setTransform(z, 0, 0, z, CTH_W / 2, CTH_H * .5 + fy * z); cthHero(g, {weapon:null, mask:id}, 0); } catch (e) { return null; }
    return c.toDataURL('image/png'); }; }

/* ---------- wearing ---------- */
{ const _cw = cosWear;
  cosWear = function(id){ S.cos = S.cos || {}; if (COSTUME[id] && COSTUME[id].slot === 'mask'){ if (!cosUsable(id)) return; S.cos.mask = S.cos.mask === id ? null : id;
      if (S.cos.mask && cosTrial(id)) toast(L(`ทดลองใช้: ${itemName2(id)}`, `Trying: ${itemName2(id)}`)); dirty = true; save(); renderEquip(); if (typeof NET !== 'undefined') NET.presT = 0; return; }
    return _cw.apply(this, arguments); }; }
/* old saves: anything worn that no longer exists comes off */
function fashionTidy(){ if (!S || !S.cos) return; for (const k of Object.keys(S.cos)){ const id = S.cos[k]; if (!id) continue; const base = String(id).split('~')[0];
  if (!(COSTUME[base] || WINGS[base] || XCOS[base])) S.cos[k] = null; } }
EV.on('map', fashionTidy); setTimeout(() => { try { fashionTidy(); } catch (e) {} }, 1200);

/* ---------- the wardrobe: five tabs of thirty ---------- */
const FW_TABS = [['wing', 'ปีก', 'Wings'], ['head', 'ส่วนหัว', 'Headpieces'], ['mask', 'หน้ากาก', 'Masks'], ['top', 'ชุดเซต', 'Outfit sets'], ['mount', 'สัตว์ขี่', 'Mounts']];
const FW = {tab:'wing', top:{}};
const fwSlot = id => (WINGS[id] ? 'wing' : XCOS[id] ? XCOS[id].slot : COSTUME[id] ? COSTUME[id].slot : '');
const fwIds = tab => tab === 'wing' ? Object.keys(WINGS) : tab === 'mount' ? Object.keys(XMOUNT) : Object.keys(COSTUME).filter(k => COSTUME[k].slot === tab && k !== 'hc_hide');
function fwSwatch(id, i){ const d = WINGS[id] || XCOS[id]; if (d) return d.c[i ? (d.c.length > 2 ? 2 : 1) : (d.c.length > 2 ? 1 : 0)]; const c = COSTUME[id], m = c && c.sw && SPR.MATS[SPR.M[c.sw[i]]]; return m ? m.hex[1] : '#888'; }
renderWardrobe = function(){
  const pane = document.getElementById('pane-equip'); if (!pane) return; S.cos = S.cos || {};
  const old = pane.querySelector('.fwgrid'); if (old) FW.top[FW.tab] = old.scrollTop;
  const sel = EQ.try && fwSlot(EQ.try) ? EQ.try : null, d = sel && (COSTUME[sel] || WINGS[sel] || XCOS[sel]);
  const tile = id => { const own = cosHave(id), tr = cosTrial(id), on = S.cos[fwSlot(id)] === id;
    return `<button class="cosit grand${on ? ' on' : ''}${sel === id ? ' sel' : ''}" data-costry="${id}"><i class="cosw" data-cth="${id}" style="--c1:${fwSwatch(id, 0)};--c2:${fwSwatch(id, 1)}"></i><b>${itemName2(id)}</b>
      <small>${on ? L('สวมอยู่', 'Wearing') : own ? L('มีแล้ว', 'Owned') : tr ? `<em class="trial">${L('ทดลองฟรี', 'Free trial')}</em>` : L('ยังไม่มี', 'Locked')}</small></button>`; };
  const price = id => { const p = (COSTUME[id] || WINGS[id] || XCOS[id] || {}).price; return p ? (p.z ? `${fmtN(p.z)} ${CUR()}` : `${p.c} ${L('เหรียญ', 'coins')}`) : ''; };
  const ids = fwIds(FW.tab).filter(cosHave), owned = ids.length;   // (v274) the owner: the wardrobe lists only what you own (browse and buy in the Coin Shop)
  pane.innerHTML = eqTabs() + `<div class="cosw2 fw">
    <div class="eqstage"><div class="eqaura"><i></i><canvas id="eqPrev"></canvas></div>
      <div class="eqplate"><b>${escH(S.name || nm(JOBS[S.job]))}</b><small>${sel ? `${L('ลองสวม', 'Trying on')}: ${itemName2(sel)}` : L('ชุดแฟชั่นไม่เปลี่ยนค่าพลัง', 'Costumes never change stats')}</small></div>
      <div class="eqrot"><button class="ibtn" data-eqrot="-1" aria-label="${L('หมุนซ้าย', 'Turn left')}">‹</button><button class="ibtn" data-eqrot="1" aria-label="${L('หมุนขวา', 'Turn right')}">›</button></div>
      ${d ? `<div class="cosact">${cosUsable(sel) ? `<button class="btn gold" data-coswear="${sel}">${S.cos[fwSlot(sel)] === sel ? L('ถอดออก', 'Take off') : cosTrial(sel) ? L('ทดลองสวม', 'Try it on') : L('สวมใส่', 'Wear')}</button>` : ''}
        ${!cosHave(sel) && d.price ? `<button class="btn" data-cosbuy="${sel}">${L('ซื้อถาวร', 'Buy to keep')} · ${price(sel)}</button>` : ''}
        ${cosTrial(sel) ? `<p class="hint">${L('ทดลองใช้ฟรี · ยังไม่กำหนดวันหมดอายุ', 'Free trial · no end date yet')}</p>` : ''}
        ${XMOUNT[sel] ? `<p class="hint">${L('แสดงตอนขี่พาหนะ (R)', 'Shows while riding (R)')}</p>` : cosUsable(sel) && typeof dyeUI === 'function' && !COSTUME[sel] || (COSTUME[sel] && COSTUME[sel].slot !== 'mask') ? dyeUI(sel) : ''}</div>` : ''}
    </div>
    <div class="wrcol"><div class="wrtabs">${FW_TABS.map(([k, th, en]) => `<button class="${k === FW.tab ? 'on' : ''}" data-fwtab="${k}">${L(th, en)}</button>`).join('')}</div>
      <div class="cosgrid fwgrid"><div class="sec">${L(...FW_TABS.find(x => x[0] === FW.tab).slice(1))} <span class="ct">${L('มี', 'own')} ${owned}</span></div>
        <div class="coslist">${ids.map(tile).join('')}</div>${ids.length ? '' : `<div class="fwempty"><p>${L('ยังไม่มีชุดในหมวดนี้', 'Nothing in this section yet')}</p><button class="btn gold" data-cshopen="1">◈ ${L('ไปร้านค้าเหรียญ', 'Go to the Coin Shop')}</button></div>`}
        <p class="hint">${L('เป็นของทั้งบัญชี ทุกตัวละครใช้ได้ · ซื้อถาวรได้ที่ช่างตัดชุดในนครอาเรน', 'Shared by your whole account · buy to keep from the tailor in Aren')}</p></div></div></div>`;
  const grid = pane.querySelector('.fwgrid'); if (grid) grid.scrollTop = FW.top[FW.tab] || 0;
  drawEquipPrev();
};
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-fwtab]'); if (!b) return; const g = pane => pane && pane.querySelector('.fwgrid');
  const gr = g(document.getElementById('pane-equip')); if (gr) FW.top[FW.tab] = gr.scrollTop; FW.tab = b.dataset.fwtab; renderWardrobe(); });
/* trying something on opens its own tab */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-costry]'); if (!b) return; const s = fwSlot(b.dataset.costry); if (s && s !== FW.tab && FW_TABS.some(x => x[0] === s)) FW.tab = s; }, true);
{ const st = document.createElement('style');
  st.textContent = `.cosw2.fw{align-items:start}.cosw2.fw .eqstage{position:sticky;top:0}
  .fw .wrcol{display:flex;flex-direction:column;min-width:0;gap:8px}
  .fw .wrtabs{display:flex;flex-wrap:wrap;gap:6px}.fw .wrtabs button{border:1px solid rgba(232,194,106,.55);background:linear-gradient(180deg,#2a3563,#171e3d);color:var(--rn-cream,#f7edd6);border-radius:9px;padding:5px 14px;font:600 13px var(--thai,sans-serif);cursor:pointer}
  .fw .wrtabs button.on{background:linear-gradient(180deg,#fff0c2,#e8c26a 50%,#b8862f);color:#2a1a00;border-color:#fff0c2}
  .fw .fwgrid{max-height:calc(100dvh - 210px);overflow-y:auto;overscroll-behavior:contain;padding-right:4px}
  .fw .fwgrid > .sec:first-child{margin-top:0;position:sticky;top:0;z-index:2;padding:4px 2px;background:linear-gradient(#fdf6e8 75%,rgba(253,246,232,0))}
  /* (v193) every card the same height: a name takes at most two lines */
  .fw .coslist .cosit b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.5em;line-height:1.25em;word-break:break-word}`;
  document.head.appendChild(st); }

/* the tailor: every collection for sale (coins), grouped */
{ const _t = NPC_OPEN.tailor;
  NPC_OPEN.tailor = n => { _t(n); const shop = document.querySelector('#dialog .db'); if (!shop) return;
    shop.querySelectorAll(':scope > .sec, :scope > .shop').forEach(x => x.remove());
    const html = FW_TABS.map(([k, th, en]) => { const rows = fwIds(k).filter(id => (COSTUME[id] || WINGS[id] || XCOS[id] || {}).price).map(id => { const D = COSTUME[id] || WINGS[id] || XCOS[id], own = cosHave(id), can = (ACC.coins || 0) >= D.price.c;
      return `<div class="srow${own ? ' owned' : ''}"><span class="ic"><i class="cosw" data-cth="${id}" style="--c1:${fwSwatch(id, 0)};--c2:${fwSwatch(id, 1)}"></i></span><div class="nm"><b>${itemName2(id)}</b><small>${L(th, en)}${own ? ` · ${L('มีแล้ว', 'owned')}` : ` · ${L('ลองฟรีในตู้เสื้อผ้า', 'try free in the wardrobe')}`}</small></div>
        <span class="pr">${D.price.c} <small>${L('เหรียญ', 'coins')}</small></span><button class="btn sm" data-cosbuy="${id}" ${own || !can ? 'disabled' : ''}>${own ? '✓' : L('ซื้อ', 'Buy')}</button></div>`; }).join('');
      return `<div class="sec">${L(th, en)} · 30</div><div class="shop">${rows}</div>`; }).join('');
    shop.insertAdjacentHTML('afterbegin', html); };
}
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'fashion30', t:['ตู้เสื้อผ้า 5 คอลเลกชัน', 'Wardrobe: five collections'], b:() => `<p>${L('ปีก · ส่วนหัว · หน้ากาก · ชุดเซต · สัตว์ขี่ อย่างละ 30 แบบ ไม่ซ้ำกัน · ไม่เปลี่ยนค่าพลัง · ลองสวมฟรีได้ทุกชิ้น ซื้อถาวรด้วยเหรียญวายราที่ช่างตัดชุด · ผู้เล่นอื่นเห็นทั้งหมด', 'Wings · Headpieces · Masks · Outfit sets · Mounts, thirty of each, all different · no stats · every piece can be tried free; buy to keep with Vayra Coins at the tailor · other players see all of it')}</p>`});
