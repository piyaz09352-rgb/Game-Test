/* VAYRATHEN — js/data/world4.js — ยุคดึกดำบรรพ์ (Age of Dinosaurs) and แดนมังกรอสูร (Realm of Dragons and Demons)
   Two dinosaur regions carry the east road on past Goldbloom Hills (Lv ~75–100).
   Four regions that carry the south road on past the Sea of Cinders: two dragon lands (volcanic) and two demon
   lands (dark), Lv ~165–235. Thai legend and western fantasy side by side: wyverns and drakes beside Chinese-style
   mangkorn and the makara; imps and a demon knight beside the yomaban and the copper cauldron of Naraka.
   Loaded before data/world.js, which calls WORLD_DRAGON() right after WORLD_MORE() and before it lays out the
   realm, so the layout gives these maps their levels, links and monster levels like any other region on the road. */
'use strict';

/* [key, th, en, road, biome, hue, land, bgm, world-map picture spot, raw level range (before LVMAP), desc th, desc en] */
const W4_MAPS = [
  // ยุคดึกดำบรรพ์ (Age of Dinosaurs): on past the end of the east road, Lv ~75–100 — Thailand's own dinosaurs from the Isan
  // digs (Phu Wiang, Khon Kaen, Korat) beside the famous ones
  ['phuwiang', 'ป่าดึกดำบรรพ์ภูเวียง', 'Primeval Phu Wiang', 'e', 'primeval', null, 'fertile', 'bgm_nature1', [.885, .655], [75, 87],
    'ป่าเฟิร์นยักษ์ที่ไดโนเสาร์ยังเดินอยู่เหมือนเมื่อร้อยล้านปีก่อน', 'A forest of giant ferns where dinosaurs still walk as they did a hundred million years ago'],
  ['amberbasin', 'แอ่งอำพันโบราณ', 'Ancient Amber Basin', 'e', 'amberfen', null, 'fertile', 'bgm_nature4', [.925, .725], [86, 100],
    'บึงน้ำสีอำพันที่ทีเร็กซ์ครองและกระดูกโบราณโผล่จากดิน', 'An amber-coloured marsh ruled by the tyrant, old bones jutting from the mud'],
  ['dragonvale', 'หุบมังกรเพลิง', 'Dragonfire Vale', 's', 'dragonvale', null, 'volcanic', 'bgm_battle3', [.105, .655], [161, 173],
    'หุบเขาไฟที่ไวเวิร์นทำรังบนหินร้อน', 'A volcanic vale where wyverns nest on the hot rock'],
  ['dragonroost', 'รังมังกรบรรพกาล', 'Elder Dragon Roost', 's', 'dragonroost', null, 'volcanic', 'bgm_adventure', [.072, .725], [172, 185],
    'หน้าผาทองที่มังกรเฒ่านอนเฝ้าสมบัติมาพันปี', 'Golden cliffs where old dragons have slept on their hoards for a thousand years'],
  ['narakagate', 'ประตูนรกภูมิ', 'Gate of Naraka', 's', 'naraka', null, 'dark', 'bgm_battle2', [.112, .795], [184, 198],
    'ประตูสู่นรกที่ยมบาลเฝ้าและกระทะทองแดงเดือดไม่หยุด', 'The gate of hell, kept by the yomaban, where the copper cauldrons never stop boiling'],
  ['demonthrone', 'บัลลังก์จอมมาร', 'Throne of the Demon Lord', 's', 'demonthrone', null, 'dark', 'bgm_battle1', [.175, .845], [197, 214],
    'พระราชวังผลึกม่วงของราชันมังกรอสูร', 'The violet crystal palace of the Dragon-Demon Sovereign']
];

/* species of each region, weakest first: [id, th, en, 0, archetype, look, element, race, size, extra] */
const W4_SPECIES = {
  phuwiang:[
    ['compsog', 'คอมพ์ซอกนาทัสจิ๋ว', 'Little Compsognathus', 0, 'quad', {plan:'theropod', sz:0.73, skin:'#7a9a3a', belly:'#e8e0a0', stripe:'#3a5a1a', len:.7, leg:.8, girth:.55, skull:1.2, arms:1.3}, 'earth', 'brute', 's', {aggro:true, k:{spd:18}}],
    ['dinonest', 'รังไข่ไดโนเสาร์', 'Dinosaur Egg Clutch', 0, 'slime', {col:'#e0d0a8', emissive:false, top:'leaf', topCol:'#5a8a3a', eye:'#3a2a1a', size:1.1}, 'earth', 'brute', 's', {k:{def:2, hp:1.2, spd:-25}}],
    ['kinnareemimus', 'คินนรีมิมัสขอนแก่น', 'Kinnareemimus of Khon Kaen', 0, 'quad', {plan:'theropod', sz:1.07, skin:'#c8a060', belly:'#f4ecd0', stripe:'#8a5a2a', feathers:'#e8d0a0', beak:true, len:.8, leg:1.35, girth:.7, skull:.75, neck:1.8, arms:1.7, upright:1.4, backFeathers:true, tailFan:true, featherLegs:true}, 'wind', 'brute', 'm', {k:{spd:22}}],
    ['sirindhorna', 'สิรินธรน่าโคราช', 'Sirindhorna of Korat', 0, 'quad', {plan:'theropod', sz:1.53, skin:'#6a8a5a', belly:'#d8e0b8', stripe:'#3a5a3a', spots:true, beak:true, len:1.1, leg:1, girth:1.15, skull:.9, snout:.8, arms:1.5, upright:.6, acc:'#d8c8a0'}, 'earth', 'brute', 'm', {k:{hp:1.3}}],
    ['phuwiangraptor', 'แร็พเตอร์ป่าภูเวียง', 'Phu Wiang Raptor', 0, 'quad', {plan:'theropod', sz:1.22, skin:'#a8603a', belly:'#f0d8b0', stripe:'#3a2a1a', feathers:'#c84a2a', len:.85, leg:1.1, girth:.7, skull:1, snout:1.15, arms:1.6, sickle:true, backFeathers:true, tailFan:true, neckFeathers:true, eyeGlow:'#ffd04a'}, 'wind', 'brute', 'm', {aggro:true, k:{spd:16, atk:1.15}}],
    ['redcrestptero', 'เทอโรซอร์หงอนแดง', 'Red-crested Pterosaur', 0, 'bird', {plan:'ptero', skin:'#8a6a4a', belly:'#e8d8b8', wing:'#6a4a32', wingMem:'#a87a5a', crest:'#d83a2a', acc:'#e8c890', size:1, beak:1}, 'wind', 'brute', 'm', {aggro:true, k:{spd:12}}],
    ['greenstego', 'สเตโกซอรัสแผ่นหลังส้ม', 'Orange-plated Stegosaurus', 0, 'quad', {plan:'stego', sz:2.0, skin:'#6a7a4a', belly:'#c8c8a0', stripe:'#4a5a32', plates:'#d8763a', acc:'#e8dcc0'}, 'earth', 'brute', 'l', {k:{hp:1.4, def:1.5, spd:-10}}],
    ['phuwiangosaurus', 'ภูเวียงโกซอรัส', 'Phuwiangosaurus', 0, 'quad', {plan:'sauropod', sz:2.56, skin:'#7a8a8a', belly:'#d0d8c8', stripe:'#5a6a6a', len:1, leg:1, girth:1}, 'earth', 'brute', 'l', {k:{hp:1.8, spd:-12}}]
  ],
  amberbasin:[
    ['siamosaurus', 'สยามโมซอรัสจับปลา', 'Fisher Siamosaurus', 0, 'quad', {plan:'theropod', sz:1.96, skin:'#4a6a7a', belly:'#d8e0d0', stripe:'#2a4a5a', sail:'#c8603a', len:1.15, leg:.95, girth:.95, skull:1.1, snout:1.7, deep:.7, wide:.8, upright:.7}, 'water', 'brute', 'm', {aggro:true}],
    ['isanosaurus', 'อีสานโนซอรัส', 'Isanosaurus', 0, 'quad', {plan:'sauropod', sz:1.77, skin:'#9a7a5a', belly:'#e8d8b8', stripe:'#6a4a2a', spots:true, len:.85, leg:.9, girth:.85, neck:.85}, 'earth', 'brute', 'l', {k:{hp:1.5, spd:-10}}],
    ['triceratops', 'ไทรเซราท็อปส์', 'Triceratops', 0, 'quad', {plan:'ceratops', sz:2.15, skin:'#7a5a3a', belly:'#c8b090', stripe:'#5a3a22', frill:'#c8783a', acc:'#f0e8d0'}, 'earth', 'brute', 'l', {aggro:true, k:{hp:1.4, def:1.6, spd:-4}}],
    ['ankylosaurus', 'แองคิโลซอรัสหางตะบอง', 'Club-tailed Ankylosaurus', 0, 'quad', {plan:'ankylo', sz:1.7, skin:'#5a5a3a', belly:'#b8a878', stripe:'#8a7a4a', spots:true, acc:'#8a8060'}, 'earth', 'brute', 'm', {k:{def:2.2, hp:1.2, spd:-12}}],
    ['fossilraptor', 'โครงกระดูกแร็พเตอร์', 'Fossil Raptor', 0, 'quad', {plan:'theropod', sz:1.22, skin:'#e8e0c8', belly:'#c8c0a8', stripe:'#8a8270', cracks:true, len:.8, leg:1.1, girth:.65, skull:1, sickle:true, arms:1.5, eyeGlow:'#7affc8', dark:'#5a5448'}, 'shadow', 'undead', 'm', {aggro:true, k:{spd:14}}],
    ['ambergolem', 'หุ่นอำพันโบราณ', 'Ancient Amber Golem', 0, 'rock', {col:'#d89a3a', acc:'#8a5a1a', eye:'#fff0a0', crystals:'#ffc04a', glowCrystal:true, bulk:1.05}, 'earth', 'formless', 'l', {k:{def:2.2, hp:1.3, spd:-10}}],
    ['skyquetzal', 'เควตซัลโคแอตลัสเงาเมฆ', 'Cloudshadow Quetzalcoatlus', 0, 'bird', {plan:'ptero', sz:1.44, skin:'#c8c8c0', belly:'#f0f0e8', wing:'#7a8a9a', wingMem:'#9aa8b8', crest:'#e83a2a', acc:'#f0e0b0', size:1.4, neck:1.6, beak:1.3}, 'wind', 'brute', 'l', {aggro:true}],
    ['marshplesio', 'พลีซิโอซอร์บึงอำพัน', 'Amber Marsh Plesiosaur', 0, 'serpent', {skin:'#3a5a5a', belly:'#c8d8c8', stripe:'#1a3a3a', len:1.3, rise:16, thick:1.3, tailTip:'#5a8a7a'}, 'water', 'brute', 'l', {range:120, shot:'ice', k:{hp:1.3}}]
  ],
  dragonvale:[
    ['wyvernling', 'ลูกไวเวิร์นเพลิง', 'Flame Wyvernling', 0, 'quad', {plan:'wyvern', skin:'#c8401a', belly:'#ffb860', stripe:'#6a1408', wing:'#6a1408', wingMem:'#d8502a', acc:'#f0e0c0', spines:'#3a0e06', len:.8, leg:.9, girth:.7, span:.8, eyeGlow:'#ffd04a'}, 'fire', 'dragon', 's', {aggro:true, k:{spd:12}}],
    ['drakehound', 'หมามังกรเกล็ดแดง', 'Red-scaled Drake Hound', 0, 'quad', {skin:'#9a2a1a', belly:'#e89a5a', stripe:'#3a0e08', spots:true, head:'dog', len:1.05, leg:.85, mane:'#ff7a2a', eyeGlow:'#ff9a3a'}, 'fire', 'dragon', 'm', {aggro:true, k:{spd:16, atk:1.1}}],
    ['dragonegg', 'ไข่มังกรฟักเพลิง', 'Hatching Dragon Egg', 0, 'slime', {col:'#e8c070', emissive:false, spikes:true, eye:'#ff3a1a', size:.9}, 'fire', 'dragon', 's', {k:{def:2.2, hp:1.3, spd:-20}}],
    ['emberwyrm', 'งูมังกรถ่านแดง', 'Ember Wyrm', 0, 'serpent', {skin:'#4a1a12', belly:'#ff8a2a', stripe:'#ffc84a', crest:'#ff5a1a', legs:true, len:1.25, rise:7, thick:1.05, eyeGlow:'#ffe07a', tailTip:'#ffb04a'}, 'fire', 'dragon', 'm', {range:120, shot:'fire'}],
    ['cinderroc', 'นกรอคเกล็ดไฟ', 'Cinder Roc', 0, 'bird', {body:'#5a2418', wing:'#a8341a', belly:'#ffb04a', headCol:'#2a1410', crest:'#ff6a1a', beak:'#f0c050', hook:true, tail:'fan', tailCol:'#ff8a2a', size:1.25, wingGlow:'#ff6a1a'}, 'fire', 'brute', 'm', {aggro:true, k:{spd:10}}],
    ['koboldscale', 'ทหารโคโบลด์เกล็ด', 'Scaled Kobold Soldier', 0, 'human', {skin:'#b85a2a', top:'#5a2a1a', pants:'#3a1a10', hair:'#2a1410', horns:'#e8d0a0', tail:'#b85a2a', fangs:true, short:true, spikes:6, hat:'helm', hatCol:'#7a6a5a', weapon:'sword', iris:'irisGr'}, 'fire', 'dragon', 's', {aggro:true, k:{def:1.3}}],
    ['scalegolem', 'หินเกล็ดมังกร', 'Dragonscale Golem', 0, 'rock', {col:'#5a2a22', acc:'#a8401a', eye:'#ffc04a', crystals:'#ff6a2a', glowCrystal:true, bulk:1.08}, 'earth', 'dragon', 'l', {k:{def:2.2, hp:1.4, spd:-10}}],
    ['dragoncultist', 'นักบวชลัทธิมังกร', 'Dragon Cult Priest', 0, 'human', {skin:'#d8a880', top:'#8a1a1a', pants:'#2a0a0a', hair:'#1a1a1a', hat:'headwrap', hatCol:'#c83a1a', weapon:'staff', wings:'#5a0a0a', wingStyle:'bat', wingMem:'#c8301a', necklace:true, iris:'irisBr'}, 'fire', 'human', 'm', {range:140, shot:'fire'}]
  ],
  dragonroost:[
    ['goldhatchling', 'ลูกมังกรทองหลงรัง', 'Lost Golden Hatchling', 0, 'quad', {skin:'#e8b83a', belly:'#fff0b0', stripe:'#a8781a', head:'lizard', len:.8, leg:.6, girth:.75, wing:'#f0d070', crown:true, eyeGlow:'#ffffff'}, 'holy', 'dragon', 's', {k:{spd:8}}],
    ['jadeloong', 'มังกรหยกสวรรค์', 'Celestial Jade Loong', 0, 'serpent', {skin:'#2a9a6a', belly:'#e8f0b0', stripe:'#106a4a', crest:'#f0d070', legs:true, len:1.45, rise:13, thick:1.1, eyeGlow:'#fff4a0', tailTip:'#f0d070'}, 'wind', 'dragon', 'l', {range:130, shot:'ice'}],
    ['stormdrake', 'มังกรสายฟ้า', 'Storm Drake', 0, 'quad', {plan:'dragon', skin:'#2a4a8a', belly:'#a8c8f0', stripe:'#1a2a5a', wing:'#1a2a5a', wingMem:'#5a7ac8', acc:'#e8e8ff', spines:'#f0f080', len:.95, girth:.85, eyeGlow:'#a0e0ff'}, 'wind', 'dragon', 'm', {aggro:true, range:120, shot:'bolt'}],
    ['makara', 'มกรเฝ้ารัง', 'Makara of the Roost', 0, 'quad', {skin:'#3a7a7a', belly:'#d8e8c0', stripe:'#1a4a4a', head:'croc', len:1.35, leg:.5, girth:1.15, tusks:true, acc:'#f4ecd8', fishTail:'#4ab0a0', eyeGlow:'#ffd36a'}, 'water', 'dragon', 'l', {k:{hp:1.4, def:1.4, spd:-6}}],
    ['bonedragon', 'มังกรกระดูก', 'Bone Dragon', 0, 'quad', {plan:'dragon', skin:'#e8e0c8', belly:'#b8b098', stripe:'#6a6050', cracks:true, wing:'#c8c0a8', wingMem:'#5a5448', acc:'#c8c0a8', spines:'#8a8270', len:1, girth:.8, eyeGlow:'#7affc8', dark:'#3a3428'}, 'shadow', 'undead', 'l', {aggro:true, night:true, k:{atk:1.15}}],
    ['dragonhawk', 'เหยี่ยวหงอนมังกร', 'Dragon-crested Hawk', 0, 'bird', {body:'#8a5a2a', wing:'#5a3a1a', belly:'#f0e0b0', bars:'#5a3a1a', crest:'#e3b04b', beak:'#f0d060', hook:true, horns:'#e8d8b0', tail:'short'}, 'wind', 'brute', 's', {range:140, shot:'dart', k:{spd:14}}],
    ['dragonpearl', 'ดวงแก้วมังกร', 'Dragon Pearl Spirit', 0, 'floater', {col:'#d8f0ff', kind:'pearl', glow:'#a0e0ff', orbit:'#f0d070', dark:'#3a5a7a', size:.9}, 'water', 'formless', 's', {range:130, shot:'holy'}],
    ['dragonknight', 'อัศวินมังกร', 'Dragon Knight', 0, 'human', {skin:'#c89a70', top:'#7a6a3a', pants:'#3a3424', hair:'#2a2a2a', hat:'helm', hatCol:'#c8a040', weapon:'sword', wings:'#2a5a3a', wingStyle:'bat', wingMem:'#5ab07a', belt:'#e3b04b', iris:'irisBr'}, 'neutral', 'human', 'm', {aggro:true, k:{def:1.5, atk:1.1}}]
  ],
  narakagate:[
    ['impling', 'ภูตจิ๋วปีกค้างคาว', 'Bat-winged Imp', 0, 'human', {skin:'#a82a3a', top:'#2a0a12', pants:'#1a060a', hair:'#1a0a0a', horns:'#f0e0c0', wings:'#2a0a10', wingStyle:'bat', wingMem:'#8a1a3a', tail:'#a82a3a', fangs:true, short:true, spikes:5, iris:'irisGr'}, 'shadow', 'demon', 's', {aggro:true, k:{spd:18}}],
    ['hellhound', 'หมานรกไฟดำ', 'Black-flame Hellhound', 0, 'quad', {skin:'#1e1416', belly:'#4a2a2a', stripe:'#ff4a1a', head:'dog', len:1.1, leg:.95, girth:1.05, mane:'#ff3a0a', ruff:true, eyeGlow:'#ff2a0a'}, 'fire', 'demon', 'm', {aggro:true, k:{spd:16, atk:1.15}}],
    ['cauldronooze', 'เมือกกระทะทองแดง', 'Copper Cauldron Ooze', 0, 'slime', {col:'#c87a3a', emissive:true, top:'crown', topCol:'#7a3a1a', eye:'#2a0a0a', size:1.15}, 'fire', 'formless', 'm', {k:{hp:1.4, spd:-12}}],
    ['ngiwtree', 'ต้นงิ้วนรก', 'Naraka Thorn Tree', 0, 'rock', {col:'#2a1a1a', acc:'#6a1a1a', eye:'#ff5a3a', tree:true, veins:'#ff3a1a', moss:'#4a0a0a'}, 'shadow', 'plant', 'l', {k:{hp:1.5, def:1.6, spd:-14}}],
    ['tormentwisp', 'วิญญาณรับทัณฑ์', 'Tormented Soul', 0, 'floater', {col:'#e86a5a', kind:'wisp', chain:true, arms:true, tails:2, dark:'#3a0a0a', hair:'#1a0a0a'}, 'shadow', 'undead', 's', {aggro:true, range:120, shot:'dark'}],
    ['yomaban', 'ยมบาลเฝ้าประตู', 'Yomaban Gatekeeper', 0, 'human', {skin:'#3a3a52', top:'#1a1a1a', pants:'#5a0a0a', hair:'#0a0a0a', hat:'helm', hatCol:'#1a1a1a', fangs:true, beard:true, weapon:'staff', necklace:true, iris:'irisVi'}, 'shadow', 'demon', 'l', {aggro:true, scale:1.25, fs:88, k:{hp:1.3, def:1.4}}],
    ['nightmaresteed', 'ม้าฝันร้าย', 'Nightmare Steed', 0, 'quad', {skin:'#14101a', belly:'#2a1a2a', head:'horse', leg:1.1, len:1.1, mane:'#c83aff', hoof:true, acc:'#ff6a2a', eyeGlow:'#ff3aff', socks:'#3a1a3a'}, 'shadow', 'demon', 'l', {k:{spd:20, atk:1.1}}],
    ['magmafiend', 'อสูรหินหลอม', 'Molten Fiend', 0, 'rock', {col:'#2a1414', acc:'#5a2a1a', eye:'#ffe04a', veins:'#ff4a0a', strata:true, bulk:1.15}, 'fire', 'demon', 'l', {k:{def:2, hp:1.4, spd:-8}}]
  ],
  demonthrone:[
    ['souljelly', 'เมือกกลืนวิญญาณ', 'Soul-devouring Jelly', 0, 'slime', {col:'#7a3ac8', emissive:true, jelly:true, eye:'#ffe0ff', size:1.05}, 'shadow', 'formless', 's', {aggro:true}],
    ['marasoldier', 'ทหารพญามาร', 'Soldier of Mara', 0, 'human', {skin:'#7a1a3a', top:'#2a0a2a', pants:'#1a0618', hair:'#0a0a0a', hat:'helm', hatCol:'#3a1a3a', horns:'#c8a8ff', fangs:true, weapon:'sword', belt:'#c83aff', iris:'irisVi'}, 'shadow', 'demon', 'm', {aggro:true, k:{def:1.3}}],
    ['dreadeye', 'ตาปีศาจลอยฟ้า', 'Floating Dread Eye', 0, 'floater', {col:'#ff4a8a', kind:'mask', glow:'#ffe04a', dark:'#2a0a2a', horns:'#1a0a1a', batWings:'#4a1a4a', tails:0}, 'shadow', 'demon', 's', {range:140, shot:'dark'}],
    ['chimera', 'ไคเมราปีกเพลิง', 'Flame-winged Chimera', 0, 'quad', {skin:'#a8742a', belly:'#e8c890', head:'cat', len:1.15, girth:1.1, mane:'#5a1a0a', ruff:true, wing:'#7a1a2a', horns:'spike', acc:'#2a1a1a', eyeGlow:'#ff6a1a', tuft:true}, 'fire', 'demon', 'l', {aggro:true, k:{atk:1.2}}],
    ['cursegargoyle', 'การ์กอยล์คำสาป', 'Cursed Gargoyle', 0, 'rock', {col:'#4a3a5a', acc:'#2a1a3a', eye:'#c83aff', crystals:'#9a5aff', form:'golem', bulk:.95, moss:'#2a3a2a'}, 'earth', 'demon', 'm', {k:{def:2.4, hp:1.2, spd:-6}}],
    ['dreadwyrm', 'มังกรอสูรดำ', 'Dread Wyrm', 0, 'serpent', {skin:'#1a1020', belly:'#6a2a8a', stripe:'#c83aff', hood:'#2a1a3a', crest:'#c83aff', heads:2, spread:1.5, len:1.4, rise:15, thick:1.2, eyeGlow:'#ff3aff'}, 'shadow', 'dragon', 'l', {aggro:true, range:120, shot:'dark', k:{hp:1.3}}],
    ['flamefiend', 'ปีศาจเพลิงเขาโค้ง', 'Curved-horn Flame Fiend', 0, 'human', {skin:'#8a2a0a', top:'#1a0a06', pants:'#0a0404', hair:'#ff5a0a', horns:'#2a1a1a', hornLen:4, wings:'#3a0a06', wingStyle:'bat', wingMem:'#ff6a1a', fangs:true, weapon:'sword', iris:'irisGr'}, 'fire', 'demon', 'l', {aggro:true, scale:1.3, fs:88, k:{hp:1.2, atk:1.2}}],
    ['demonknight', 'อัศวินปีศาจ', 'Demon Knight', 0, 'human', {skin:'#4a4a5a', top:'#14141e', pants:'#0a0a12', hair:'#c8c8d8', hat:'helm', hatCol:'#2a2a3a', horns:'#a8a8b8', wings:'#14141e', wingStyle:'bat', wingMem:'#7a0a1e', weapon:'sword', belt:'#a8141e', iris:'irisVi'}, 'shadow', 'demon', 'm', {aggro:true, k:{def:1.6, atk:1.15}}]
  ]
};

/* one boss per region: [id, th, en, 0, archetype, look, element, race, skills] */
const W4_BOSSES = {
  phuwiang:['siamotyrannus', 'สยามโมไทรันนัสราชาแห่งภูเวียง', 'Siamotyrannus, King of Phu Wiang', 0, 'quad', {plan:'theropod', sz:0.6, skin:'#9a5a2a', belly:'#ecd2a0', stripe:'#4a2410', len:1.1, leg:1, girth:1.2, skull:1.25, eyeGlow:'#ffd04a'}, 'earth', 'brute', ['charge', 'roar', 'quake', 'enrage']],
  amberbasin:['trextyrant', 'ไทรันโนซอรัสเร็กซ์ทรราช', 'Tyrannosaurus Rex the Tyrant', 0, 'quad', {plan:'theropod', sz:0.64, skin:'#a8642e', belly:'#f0d8a8', stripe:'#4a2a14', len:1.15, leg:1, girth:1.3, skull:1.3, arms:.8, upright:1.3, eyeGlow:'#ffd04a'}, 'earth', 'brute', ['charge', 'roar', 'quake', 'slam', 'enrage']],
  dragonvale:['wyvernqueen', 'ราชินีไวเวิร์นอัคคี', 'Wyvern Queen of the Flames', 0, 'quad', {plan:'wyvern', skin:'#b8300f', belly:'#ffc070', stripe:'#4a0a04', wing:'#4a0a04', wingMem:'#e8582a', acc:'#f0d070', spines:'#2a0804', crown:true, len:1.1, girth:1.1, eyeGlow:'#ffe04a'}, 'fire', 'dragon', ['charge', 'meteor', 'barrage', 'enrage']],
  dragonroost:['elderdragon', 'พญามังกรบรรพกาล', 'The Elder Dragon', 0, 'quad', {plan:'dragon', skin:'#c8962a', belly:'#fff0c0', stripe:'#6a4a10', cracks:true, wing:'#6a4a10', wingMem:'#e8b860', acc:'#f4ecd8', spines:'#8a5a1a', crown:true, len:1.15, girth:1.15, eyeGlow:'#7affc8'}, 'earth', 'dragon', ['quake', 'wave', 'roar', 'heal', 'enrage']],
  narakagate:['narakawarden', 'ผู้คุมนรกอเวจี', 'Warden of Avici', 0, 'human', {skin:'#2a2a3e', top:'#3a0a0a', pants:'#1a0606', hair:'#ff3a0a', hatCol:'#c8a040', horns:'#e8d8c0', hornLen:3, fangs:true, beard:true, weapon:'staff', wings:'#1a0a0a', wingStyle:'bat', wingMem:'#a81a0a', necklace:true, iris:'irisGr'}, 'fire', 'demon', ['field', 'summon', 'slam', 'wave', 'enrage']],
  demonthrone:['dragondemonking', 'ราชันมังกรอสูร', 'The Dragon-Demon Sovereign', 0, 'quad', {plan:'dragon', skin:'#1a0e1e', belly:'#8a1a3a', stripe:'#c83aff', wing:'#2a0a2a', wingMem:'#7a1a4a', acc:'#ff3a6a', spines:'#c83aff', crown:true, len:1.2, girth:1.2, eyeGlow:'#ff2a4a', hornUp:2.4}, 'shadow', 'demon', ['meteor', 'teleport', 'summon', 'wave', 'field', 'enrage']]
};

/* field notes (shown in the wiki and on the target card) — every one written for its creature */
const W4_LOREMAP = {
  compsog:['ไดโนเสาร์ตัวเท่าไก่ที่วิ่งเป็นฝูงใต้ใบเฟิร์น มันขโมยอาหารจากรังของตัวใหญ่และหนีไวเกินกว่าใครจะจับทัน', 'A dinosaur no bigger than a chicken that runs in packs under the ferns, stealing food from the big ones and gone before anyone can catch it.'],
  dinonest:['รังไข่ไดโนเสาร์ที่ฝังอยู่ในกองใบไม้อุ่น ๆ ไข่บางฟองขยับได้ราวกับรู้ว่ามีคนแปลกหน้าเข้ามาใกล้', 'A clutch of dinosaur eggs buried in warm leaf litter. Some of the eggs twitch as if they know a stranger is near.'],
  kinnareemimus:['ไดโนเสาร์ขายาวคล้ายนกกระจอกเทศ ขุดพบที่ขอนแก่นและตั้งชื่อตามกินรี มันวิ่งเร็วที่สุดในป่าภูเวียง', 'A long-legged, ostrich-like dinosaur dug up in Khon Kaen and named after the kinnaree. It is the fastest runner in the Phu Wiang forest.'],
  sirindhorna:['ไดโนเสาร์กินพืชที่ขุดพบในโคราช ตั้งชื่อเป็นเกียรติแด่สมเด็จพระเทพฯ มันเล็มใบเฟิร์นอย่างสงบแต่จะสู้เมื่อถูกรังแก', 'A plant-eater found near Korat and named in honour of Princess Sirindhorn. It browses ferns peacefully but fights back when bullied.'],
  phuwiangraptor:['นักล่าขนแดงที่ล่าเป็นทีม ตัวหนึ่งหลอกล่อ อีกตัวซุ่มจากด้านข้าง กรงเล็บโค้งของมันคมเหมือนเคียว', 'A red-feathered hunter that hunts as a team: one lures, another strikes from the side. Its curved claw is sharp as a sickle.'],
  redcrestptero:['สัตว์เลื้อยคลานบินได้ที่มีหงอนแดงบนหัว มันร่อนเหนือยอดไม้และโฉบลงมาจิกทุกอย่างที่เป็นประกาย', 'A flying reptile with a red crest on its head. It glides above the treetops and dives to peck at anything that glitters.'],
  greenstego:['ไดโนเสาร์หลังแผ่นสีส้มเดินช้า ๆ ในป่าเฟิร์น แผ่นบนหลังเปลี่ยนสีเข้มขึ้นเมื่อมันโกรธ และหางหนามฟาดได้แรงมาก', 'A slow dinosaur with orange plates down its back. The plates flush darker when it is angry, and its spiked tail hits very hard.'],
  phuwiangosaurus:['ไดโนเสาร์คอยาวตัวแรกที่ขุดพบในไทยที่ภูเวียง ตัวใหญ่เท่าบ้านหลายหลัง แต่ละก้าวทำให้พื้นดินสั่น', 'The first long-necked dinosaur dug up in Thailand, at Phu Wiang. It is as big as several houses, and the ground shakes with every step.'],
  siamosaurus:['ไดโนเสาร์หลังใบเรือที่ยืนรอปลาในบึง ปากยาวแบบจระเข้ของมันงับปลาได้แม่นยำ ฟันของมันพบครั้งแรกในไทย', 'A sail-backed dinosaur that stands in the marsh waiting for fish. Its long crocodile-like jaws snap them up, and its teeth were first found in Thailand.'],
  isanosaurus:['ไดโนเสาร์คอยาวรุ่นแรก ๆ ของโลกที่ขุดพบในอีสาน ตัวเล็กกว่าญาติแต่ก็ยังสูงเกินกว่าต้นไม้ส่วนใหญ่', 'One of the world\'s earliest long-necked dinosaurs, found in Isan. Smaller than its kin, yet still taller than most trees.'],
  triceratops:['ไดโนเสาร์สามเขามีแผงคอใหญ่ มันพุ่งชนด้วยหัวลงต่ำเหมือนรถถัง และไม่มีนักล่าตัวไหนอยากเผชิญหน้ากับมันตรง ๆ', 'A three-horned dinosaur with a great frill. It charges head-down like a war elephant, and no hunter wants to meet it face to face.'],
  ankylosaurus:['ไดโนเสาร์หุ้มเกราะทั้งตัวมีหางเป็นตะบองกระดูก มันหมอบต่ำเมื่อถูกโจมตีแล้วฟาดหางกลับจนกระดูกศัตรูแตก', 'An armoured dinosaur with a bony club for a tail. It crouches when attacked, then swings that club hard enough to break bones.'],
  fossilraptor:['โครงกระดูกแร็พเตอร์ที่ลุกขึ้นจากชั้นหินอำพัน ไม่มีใครรู้ว่าอะไรปลุกมัน แต่มันยังล่าเหมือนตอนมีชีวิต', 'A raptor skeleton risen from the amber beds. Nobody knows what woke it, but it still hunts as it did in life.'],
  ambergolem:['ก้อนอำพันขนาดยักษ์ที่มีแมลงและใบไม้โบราณติดอยู่ข้างใน มันเดินได้เพราะยางไม้ยังจำชีวิตของป่าดึกดำบรรพ์ได้', 'A giant mass of amber with ancient insects and leaves trapped inside. It walks because the resin still remembers the life of the primeval forest.'],
  skyquetzal:['สัตว์บินได้ตัวใหญ่ที่สุดที่เคยมีมา ยืนสูงเท่ายีราฟ มันเดินสี่ขาบนพื้นและงับเหยื่อด้วยจะงอยปากยาว', 'The largest flying animal there ever was, as tall as a giraffe. It stalks the ground on all fours and snatches prey with its long beak.'],
  marshplesio:['สัตว์เลื้อยคลานคอยาวที่ว่ายในบึงอำพัน มันโผล่หัวจากน้ำเงียบ ๆ แล้วพ่นน้ำเย็นจัดใส่ผู้ที่เดินริมฝั่ง', 'A long-necked reptile that swims in the amber marsh. It lifts its head silently from the water and sprays icy water at anyone on the bank.'],
  siamotyrannus:['ไทรันโนซอรัสรุ่นบรรพบุรุษที่ขุดพบในไทย เป็นราชาแห่งป่าภูเวียง เสียงคำรามของมันทำให้ไดโนเสาร์ทั้งป่าหยุดนิ่ง', 'An ancestral tyrannosaur dug up in Thailand and king of the Phu Wiang forest. Its roar makes every dinosaur in the forest freeze.'],
  trextyrant:['ทีเร็กซ์ตัวใหญ่ที่สุดที่ครองแอ่งอำพัน แรงกัดของมันบดกระดูกได้ในคำเดียว และมันจำกลิ่นทุกคนที่หนีรอดไปได้', 'The greatest T. rex of the Amber Basin. Its bite crushes bone in one snap, and it remembers the scent of everyone who got away.'],
  wyvernling:['ลูกไวเวิร์นที่เพิ่งหัดบิน ชอบกระโจนใส่ผู้บุกรุกจากก้อนหินร้อน แม้ตัวเล็กแต่ไฟในคอร้อนพอจะละลายเกราะเหล็ก', 'A young wyvern still learning to fly. It leaps at intruders from the hot rocks, and its small throat already burns hot enough to soften iron.'],
  drakehound:['สุนัขล่าเนื้อที่ลัทธิมังกรเลี้ยงด้วยถ่านไฟจนขนกลายเป็นเกล็ดแดง มันดมกลิ่นทองได้ไกลหลายลี้', 'A hunting hound the dragon cult raised on live coals until its fur turned to red scale. It can smell gold from miles away.'],
  dragonegg:['ไข่มังกรที่ถูกทิ้งไว้ในบ่อลาวา เปลือกแข็งเหมือนเหล็กและจะกลิ้งเข้าใส่ใครก็ตามที่เข้าใกล้รัง', 'A dragon egg left in a pool of lava. Its shell is hard as steel, and it rolls at anyone who wanders too close to the nest.'],
  emberwyrm:['มังกรไร้ปีกที่เลื้อยอยู่ใต้ถ่านคุ ขาสั้นนับสิบคู่พาลำตัวยาวไปได้เร็ว และพ่นเปลวไฟจากระยะไกล', 'A wingless wyrm that crawls beneath glowing coals. Dozens of short legs carry its long body fast, and it spits fire from afar.'],
  cinderroc:['นกยักษ์ที่ทำรังบนปากปล่อง ขนของมันลุกเป็นไฟเมื่อโกรธ ชาวบ้านเชื่อว่ามันเป็นพาหนะของมังกร', 'A giant bird that nests on the crater rim. Its feathers catch fire when it is angry, and villagers say it carries dragons on its back.'],
  koboldscale:['คนแคระเผ่าโคโบลด์ที่บูชามังกรเป็นเทพ พวกมันขูดเกล็ดที่ร่วงมาทำเกราะ และเฝ้าทางเข้ารังด้วยชีวิต', 'Kobolds who worship dragons as gods. They make armour from shed scales and guard the way to the nests with their lives.'],
  scalegolem:['กองหินที่เกล็ดมังกรนับพันแผ่นหลอมติดกันจนมีชีวิต ผลึกบนหลังเรืองแสงตามจังหวะหัวใจของภูเขาไฟ', 'A heap of rock where thousands of shed dragon scales fused together and woke. The crystals on its back pulse with the volcano.'],
  dragoncultist:['นักบวชที่สวมลอมพอกแดงสวดอัญเชิญมังกรทุกคืน พวกเขาเชื่อว่าใครถูกมังกรเผาจะได้ไปเกิดบนสวรรค์', 'A priest in a red crown who chants to the dragons every night, believing that whoever a dragon burns is reborn in heaven.'],
  goldhatchling:['ลูกมังกรทองที่พลัดจากแม่ มันส่งเสียงร้องเรียกหาแม่ทั้งวัน และกัดทุกคนที่ไม่ใช่มังกร', 'A golden hatchling separated from its mother. It cries for her all day and bites anything that is not a dragon.'],
  jadeloong:['มังกรจีนสีหยกที่ลงมาจากเมฆ เชื่อกันว่ามันนำฝนมาให้แผ่นดิน แต่จะโกรธหากมีใครแตะต้องไข่มุกของมัน', 'A jade-green loong come down from the clouds. It brings rain to the land, but grows furious if anyone touches its pearl.'],
  stormdrake:['มังกรปีกกว้างที่บินอยู่ในพายุ เขาของมันดึงสายฟ้าลงมาได้ และเสียงคำรามดังเหมือนฟ้าผ่า', 'A broad-winged drake that flies inside the storm. Its antlers call lightning down, and its roar sounds like thunder.'],
  makara:['มกรตามตำนานไทย ปากจระเข้ งาช้าง หางปลา คอยเฝ้าประตูรังเหมือนรูปปั้นที่ราวบันไดวัด', 'The makara of Thai legend, crocodile jaws, elephant tusks and a fish tail, guarding the roost like the statues on temple stairs.'],
  bonedragon:['ซากมังกรที่ตายไปนานแต่ยังลุกขึ้นมาเฝ้าสมบัติ เปลวไฟสีเขียวในเบ้าตาจะลุกโชนเมื่อพระจันทร์ขึ้น', 'The bones of a long-dead dragon that still rise to guard its hoard. Green fire flares in its sockets when the moon comes up.'],
  dragonhawk:['เหยี่ยวที่กินเศษเนื้อจากรังมังกรจนงอกหงอนและเขาเล็ก ๆ มันโฉบลงมาจากหน้าผาเร็วเกินกว่าตาจะตาม', 'A hawk that fed on scraps from the dragon nests until it grew a crest and small horns. It stoops from the cliffs faster than an eye can follow.'],
  dragonpearl:['ไข่มุกวิเศษที่หลุดจากปากมังกรเฒ่า มันลอยไปมาอย่างมีชีวิต และยิงแสงใส่ผู้ที่คิดจะเก็บไป', 'A magic pearl that slipped from an old dragon\'s mouth. It drifts about as if alive and shoots light at anyone who tries to take it.'],
  dragonknight:['อัศวินที่สาบานตนรับใช้มังกรบรรพกาล เกราะทองของเขาทำจากเกล็ดที่มังกรมอบให้ด้วยตัวเอง', 'A knight sworn to serve the Elder Dragon. His golden armour is made from scales the dragon gave him with its own claws.'],
  impling:['ภูตตัวจิ๋วจากนรกที่ชอบแกล้งคน มันบินว่อนเป็นฝูงและหัวเราะแหลมทุกครั้งที่ข่วนโดน', 'A tiny imp from hell that loves to torment people. Imps swarm in flocks and shriek with laughter every time they draw blood.'],
  hellhound:['หมานรกที่ไฟดำลุกอยู่บนแผงคอ มันวิ่งไม่เหนื่อยและตามกลิ่นวิญญาณที่หนีออกจากนรกได้เสมอ', 'A hellhound with black fire burning in its mane. It never tires and can always follow the scent of a soul that fled hell.'],
  cauldronooze:['น้ำทองแดงเดือดที่ล้นจากกระทะในนรกจนกลายเป็นเมือกมีชีวิต ใครโดนตัวมันจะร้อนเหมือนถูกต้มทั้งเป็น', 'Boiling copper that spilled from the cauldrons of hell and came alive as an ooze. Its touch burns like being boiled alive.'],
  ngiwtree:['ต้นงิ้วหนามเหล็กในนรกที่คนผิดศีลต้องปีนขึ้นลง กิ่งของมันเคลื่อนไหวได้และเกี่ยวผู้คนที่เดินผ่าน', 'The iron-thorned silk-cotton tree of Thai hell that sinners must climb. Its branches move and snag anyone who walks by.'],
  tormentwisp:['วิญญาณที่ยังรับโทษไม่หมดลากโซ่ตามหลัง มันยื่นมือเข้าหาคนเป็นเพื่อขอให้ช่วย แต่กลับดูดพลังไปแทน', 'A soul still serving its sentence, dragging a chain behind it. It reaches for the living as if begging for help, but drains them instead.'],
  yomaban:['ยมบาลผู้เฝ้าประตูนรก ถือไม้เท้าตัดสินบาปและจำชื่อทุกคนที่ผ่านประตูไปได้ไม่ลืม', 'A yomaban who keeps the gate of hell. He carries the staff of judgement and never forgets the name of anyone who passes.'],
  nightmaresteed:['ม้าสีดำที่ควบออกมาจากฝันร้าย กีบไฟของมันทิ้งรอยไหม้บนพื้น และเสียงร้องทำให้ศัตรูขวัญเสีย', 'A black horse that gallops out of nightmares. Its burning hooves scorch the ground and its scream shakes the bravest heart.'],
  magmafiend:['อสูรที่เกิดจากหินหลอมใต้นรก เส้นลาวาบนตัวเต้นตามความโกรธ และมันแข็งแกร่งเกินกว่าดาบธรรมดาจะทำอะไรได้', 'A fiend born of the molten rock beneath hell. The lava in its veins throbs with its rage, and ordinary blades barely scratch it.'],
  souljelly:['เมือกสีม่วงที่กลืนวิญญาณของผู้พ่ายแพ้ ใบหน้าเลือนรางลอยวนอยู่ข้างในตัวมันตลอดเวลา', 'A violet jelly that swallows the souls of the fallen. Faint faces drift round and round inside it.'],
  marasoldier:['ทหารของพญามารที่เคยขวางทางพระพุทธเจ้า พวกมันยังเดินสวนสนามรอบบัลลังก์และไม่เคยยอมแพ้', 'A soldier of Mara, the tempter who once stood in the Buddha\'s path. They still march around the throne and never surrender.'],
  dreadeye:['ดวงตาปีศาจที่ลอยอยู่บนปีกค้างคาว มันมองเห็นทุกอย่างในพระราชวังและยิงแสงมืดใส่ผู้บุกรุก', 'A demon eye borne up on bat wings. It sees everything in the palace and fires beams of darkness at intruders.'],
  chimera:['สัตว์ประหลาดที่ราชันมังกรอสูรสร้างจากสิงห์ แพะ และมังกร ปีกเพลิงของมันพาร่างใหญ่โจมตีจากฟ้า', 'A monster the Sovereign stitched together from lion, goat and dragon. Its burning wings carry its great body down from the sky.'],
  cursegargoyle:['รูปปั้นการ์กอยล์ที่ถูกสาปให้เฝ้าระเบียงวัง ผลึกม่วงบนหลังมันงอกขึ้นเรื่อย ๆ ตามคำสาปที่ยังไม่จาง', 'A gargoyle cursed to keep the palace balconies. The violet crystals on its back keep growing as long as the curse holds.'],
  dreadwyrm:['มังกรสองเศียรที่ดื่มความมืดจนเกล็ดดำสนิท มันพันรอบเสาวังและพ่นหมอกมืดใส่ทุกคนที่เข้ามา', 'A two-headed wyrm that drank darkness until its scales turned black. It coils around the palace pillars and breathes shadow at all who enter.'],
  flamefiend:['ปีศาจเขาโค้งที่ผมลุกเป็นไฟ เป็นแม่ทัพที่ราชันไว้ใจที่สุด ดาบของมันเผาทุกอย่างที่ฟันโดน', 'A curve-horned fiend whose hair is fire, the Sovereign\'s most trusted general. Its sword burns whatever it cuts.'],
  demonknight:['อัศวินที่ขายวิญญาณให้ราชันมังกรอสูรเพื่อแลกพลัง ชุดเกราะดำของเขาไม่มีร่างกายอยู่ข้างในอีกแล้ว', 'A knight who sold his soul to the Sovereign for power. Nothing of his body is left inside the black armour now.'],
  wyvernqueen:['ราชินีไวเวิร์นผู้ปกครองหุบมังกรเพลิง มงกุฎทองบนหัวคือรางวัลจากราชันมังกรอสูร และไข่ทุกฟองในหุบคือลูกของนาง', 'The Wyvern Queen rules Dragonfire Vale. Her golden crown was a gift from the Sovereign, and every egg in the vale is hers.'],
  elderdragon:['มังกรเฒ่าที่สุดในแผ่นดิน เกล็ดทองแตกลายงาเพราะอายุนับพันปี มันรู้ความลับของการผนึกวายราแต่จะบอกเฉพาะผู้ที่ชนะมันได้', 'The oldest dragon in the land, its golden scales crazed with a thousand years. It knows the secret of the Vayra seal and tells it only to those who defeat it.'],
  narakawarden:['ผู้คุมนรกอเวจีขุมลึกที่สุด ถือคทาที่เคยลงโทษคนบาปมานับไม่ถ้วน เปลวไฟบนหัวของมันไม่เคยดับ', 'The warden of Avici, deepest of the hells. Its staff has punished countless sinners and the fire on its head has never gone out.'],
  dragondemonking:['ราชันมังกรอสูร ผู้เป็นทั้งมังกรและปีศาจ มันหลอมวิญญาณมังกรเข้ากับเลือดอสูรจนเป็นอมตะ และรอวันที่ผนึกวายราจะพังลง', 'The Dragon-Demon Sovereign, both dragon and demon. It forged a dragon\'s soul with demon blood to become deathless, and waits for the Vayra seal to break.']
};

/* ---------- colour for the monsters that had almost none (v153) ----------
   26 monsters were drawn in near-greys (a slate buffalo, a white yeti, a grey tiger, stone statues in plain stone).
   Each now keeps what it is but wears believable colour: the warm hide and pink nose of a real animal, the painted
   red, green and gold of temple stucco, ice that is blue rather than white, ghosts with a sickly tint and a glow. */
const W4_RECOLOR = {
  wildbuffalo:{skin:'#4e4250', belly:'#7a6a62', muzzle:'#b08a80', acc:'#ece0c0'},
  pierrat:{skin:'#8a6a52', belly:'#e8d0b4', nose:'#e8909a'},
  stuccoyaksha:{skin:'#2e8a5a', top:'#c8382a', pants:'#e3b04b', hair:'#1a1a1a', hatCol:'#e3b04b'},
  lankypreta:{skin:'#9aae86', top:'#4a3a62', pants:'#3a2e4a', hair:'#22201e'},
  serow:{skin:'#4a382a', belly:'#c8a882', mane:'#f2ede2', stripe:'#2a1e16'},
  mistspirit:{col:'#a8d6ee'},
  phipop:{skin:'#8c9e78', top:'#7a2638', pants:'#3a2a2a', hair:'#121212'},
  stoneapsara:{skin:'#d8a888', top:'#b0622e', pants:'#c88a3a', hair:'#3a2a1e'},
  carvedmonkey:{skin:'#b8865a', belly:'#6e8a4a'},
  ghostcrab:{shell:'#e6cf9c', acc:'#e88a4a'},
  skylotus:{col:'#f4b6d2', topCol:'#f0d070'},
  misttiger:{skin:'#7488a2', stripe:'#26304a', belly:'#dfe6f0', eyeGlow:'#9ae0ff'},
  snowdeva:{col:'#c8e4ff'},
  smokewisp:{col:'#9a8676', dark:'#3a1e10', glow:'#ff7a2a'},
  ashghoul:{skin:'#6e5a4c', top:'#3a1a10', hair:'#c8a088'},
  snowowl:{body:'#f6f4ec', bars:'#4a4038', eyeGlow:'#ffcc3a'},
  iceworm:{skin:'#9ccbe6', belly:'#e4f2fa', tailTip:'#4a98d4'},
  yeti:{skin:'#8aa6c0', top:'#c2d6ea', pants:'#a8c0d8', hair:'#e8f0f8', iris:'irisBl'},
  iceslime:{col:'#96d4f0', eye:'#1a4a6a'},
  dvarapala:{skin:'#c8a070', top:'#2a6a3a', pants:'#b8322a', hatCol:'#e3b04b'},
  elderpop:{skin:'#86987a', top:'#5a1a2a', hair:'#eeeeea'},
  // the new lands' own animals, given living colours (bands, a pale belly, a coloured frill or plates)
  phuwiangosaurus:{skin:'#4e7a72', stripe:'#2a4a46', belly:'#e6d8b0'},
  isanosaurus:{skin:'#b07a44', stripe:'#6a3a1e', belly:'#f0e0b8'},
  triceratops:{skin:'#8c6a42', stripe:'#4a3220', belly:'#e2c898', frill:'#d8642a'},
  ankylosaurus:{skin:'#7e6a3a', stripe:'#4a381e', belly:'#d8c490', acc:'#c89a5a'},
  greenstego:{skin:'#6a8a3a', stripe:'#3a5a22', belly:'#e8e0b0', plates:'#e0662a'},
  sirindhorna:{skin:'#5a8e4a', stripe:'#2e5a2e', belly:'#ecebc4'}
};
function W4_RECOLOR_APPLY(){
  for (const row of [...SPECIES, ...BOSSES]){ const o = W4_RECOLOR[row[0]]; if (o) row[5] = {...row[5], ...o}; }
}

function WORLD_DRAGON(){
  if (MAPS.some(m => m.w4)) return;
  W4_MAPS.forEach(([key, th, en, road, biome, hue, land, bgm, pic, raw, dth, den]) => {
    const id = MAPS.length, sp = W4_SPECIES[key], bs = W4_BOSSES[key];
    SPECIES.push(...sp.map(s => s.slice()));
    BOSSES.push(bs.slice());
    MAPS.push({id, name:th, en, lv:[0, 0], biome, hue, mobs:sp.map(s => s[0]), boss:bs[0], desc:[dth, den], w4:true, landFix:land, bgm, wmPic:pic});
    ROADS[road].push(id);                // on past the end of its road
    ROAD_LV_RAW[road].push(raw.slice()); // raw levels: the layout stretches them with LVMAP like the rest of the road
  });
  W4_RECOLOR_APPLY();
}
