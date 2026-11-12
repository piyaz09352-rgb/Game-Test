/* VAYRATHEN — js/data/world.js
   The realm: the capital Aren + 30 regions on four roads (monsters Lv 1–300), 130 monster
   species built from the archetypes in gfx/beasts.js, one boss per map with its own skill set, the loot each
   species drops, boss cards, armour/headgear sold at the central market, and the market's daily prices.
   Monster stats come from one level curve (statsFor) so every map scales evenly. */
'use strict';

const RACE_EXTRA = {fish:['สัตว์น้ำ', 'Fish'], insect:['แมลง', 'Insect'], demon:['อสูร', 'Demon'], dragon:['นาค', 'Dragon'], human:['มนุษย์', 'Human'], formless:['ไร้รูป', 'Formless'], angel:['เทพ', 'Angel']};
for (const k in RACE_EXTRA){ RACE_TH[k] = RACE_EXTRA[k][0]; RACE_EN[k] = RACE_EXTRA[k][1]; }

/* ---------- level curve ----------
   HP: an on-level monster lasts about 2 s against a hero's skill rotation at every level (level-appropriate gear and stats):
       quadratic up to Lv 9, then 100 + 16 HP a level (5–10 basic hits), and from Lv 60 more (3rd-class skills do most of the
       damage there, so 10–18 basic hits). It used to be 2.3·L² capped at 327·L^0.845: 25–70 basic hits, 7–20 s a kill.
   EXP: one on-level kill is worth 1 / MOB_KILLS(L) of a level (≈ 3 kills at Lv 1, 16 at Lv 10, 61 at Lv 30, 137 at Lv 60, 253 at Lv 120, 387 at Lv 240),
        Job EXP is 30% of it. Sturdier species (k.hp) give a little more; k.exp overrides that (bosses ×22). */
const MOB_KILLS = L => 3 + 2.6 * L * L / (L + 10 + Math.max(0, L - 100));
const mobExp = (XL, k = {}) => nextBase(Math.max(1, XL)) / MOB_KILLS(XL) * (k.exp || Math.min(1.5, k.hp || 1));
function statsFor(L, k = {}, XL = L){
  const hp = Math.round(Math.min(30 + 2.3 * L * L, 100 + 16 * L + 7.3 * Math.max(0, L - 60) ** 1.4) * (k.hp || 1)), a = 5 + L * 2.4, e = mobExp(XL, k);
  return {lvl:L, hp, atk:[Math.round(a * .85 * (k.atk || 1)), Math.round(a * 1.15 * (k.atk || 1))], def:Math.round(L * .45 * (k.def || 1)),
    exp:Math.max(1, Math.round(e)), jexp:Math.max(1, Math.round(e * .3)),
    speed:Math.round(40 + (k.spd || 0)), delay:k.delay || 1.5};
}
/* loot part names by archetype */
const PART = {quad:['หนัง', 'Hide'], bird:['ขนนก', 'Feather'], serpent:['เกล็ด', 'Scale'], bug:['กระดอง', 'Carapace'], squat:['ผิวมัน', 'Slick Skin'],
  floater:['เถ้าวิญญาณ', 'Spirit Ash'], slime:['เมือก', 'Ooze'], rock:['เศษหิน', 'Rubble'], human:['เครื่องราง', 'Charm'], fish:['ครีบ', 'Fin']};

/* ---------- species ----------
   [id, th, en, lvl, archetype, look, elem, race, size, extra]
   extra: aggro, range (shoots), k (stat multipliers), night */
const SPECIES = [
  // 1 ป่าไผ่กระซิบ
  ['bamboomonkey', 'ลิงลมไผ่', 'Bamboo Monkey', 13, 'human', {skin:'#9a6a42', top:'#7a4f2e', pants:'#6a4426', hair:'#5a3a22', tail:'#7a4f2e', sleeve:false, short:true, spikes:10}, 'wind', 'brute', 's', {}],
  ['junglefowl', 'ไก่ฟ้าพญาลอ', 'Siamese Fireback', 14, 'bird', {body:'#5a6470', wing:'#3a4250', belly:'#1e2228', headCol:'#d8302a', crest:'#1e2228', mantle:'#8a9098', tailCol:'#1a1e24', tail:'fan', fly:false}, 'fire', 'brute', 's', {}],
  ['greenviper', 'งูเขียวหางไหม้', 'Green Pit Viper', 16, 'serpent', {skin:'#4caa3a', belly:'#d8e870', stripe:null, tailTip:'#a8402a', len:.9}, 'earth', 'brute', 's', {aggro:true}],
  ['bamboogrub', 'หนอนไผ่ยักษ์', 'Giant Bamboo Grub', 15, 'serpent', {skin:'#f0e2b0', belly:'#d8c48a', grub:true, len:.7, rise:3}, 'earth', 'insect', 's', {k:{hp:1.3, spd:-15}}],
  ['bamboojackal', 'หมาจิ้งจอกป่าไผ่', 'Bamboo Jackal', 18, 'quad', {skin:'#b07a3a', belly:'#f0d8a8', head:'dog', len:.9, leg:.95}, 'neutral', 'brute', 'm', {aggro:true, k:{spd:12}}],
  ['termiteshroom', 'เห็ดโคนเดินได้', 'Walking Termite Shroom', 20, 'slime', {col:'#e8dcc0', top:'mushroom', topCol:'#b89a6a'}, 'earth', 'plant', 's', {}],
  // 2 หนองบัวแดง
  ['goldfrog', 'กบนาลายทอง', 'Gold-striped Frog', 21, 'squat', {skin:'#5a8a3a', belly:'#e8e0a0', stripe:'#e3b04b', kind:'frog'}, 'water', 'fish', 's', {}],
  ['giantleech', 'ปลิงยักษ์', 'Giant Leech', 22, 'serpent', {skin:'#3a2a24', belly:'#7a5a3a', stripe:'#a07a3a', grub:true, len:.8, rise:2}, 'water', 'insect', 's', {aggro:true}],
  ['egret', 'นกกระยางขาว', 'White Egret', 24, 'bird', {body:'#f4f0e8', wing:'#e8e4dc', beak:'#e8b43a', tail:'short', fly:false, beakLen:1.8, size:1.1, neckLen:1.9, legLen:2.1, legCol:'#2a2a2a'}, 'wind', 'brute', 'm', {}],
  ['paddycrab', 'ปูนาดำ', 'Black Paddy Crab', 23, 'bug', {shell:'#2a2a30', leg:'#4a3a3a', acc:'#7a3a2a', kind:'crab'}, 'water', 'fish', 's', {k:{def:1.6}}],
  ['paddyturtle', 'เต่านา', 'Snail-eating Paddy Turtle', 26, 'squat', {skin:'#5a5444', shell:'#4a3a2a', belly:'#e8d8a0', kind:'turtle', scute:'#c8a860', headStripe:'#e8d8a0'}, 'water', 'brute', 'm', {k:{def:2, hp:1.2, spd:-15}}],
  ['lotusjelly', 'เจลลี่บัวชมพู', 'Lotus Jelly', 25, 'slime', {col:'#f4a6c4', top:'lotus', topCol:'#f07ab0'}, 'water', 'plant', 's', {}],
  ['waterwraith', 'ผีพรายน้ำ', 'Water Wraith', 29, 'floater', {col:'#7ad0e8', kind:'wisp', veil:true, hair:'#141a20'}, 'shadow', 'undead', 's', {aggro:true, night:true}],
  // 3 ริมน้ำเจ้าพระยา
  ['watermonitor', 'ตะกวดริมน้ำ', 'Water Monitor', 30, 'quad', {skin:'#4a4a38', belly:'#8a8a6a', stripe:'#c8b870', spots:true, head:'lizard', len:1.3, leg:.55, girth:.85}, 'earth', 'brute', 'm', {}],
  ['riverotter', 'นากเล็กเล็บสั้น', 'River Otter', 29, 'quad', {skin:'#6a4a32', belly:'#c8a882', head:'dog', len:1.1, leg:.55, girth:.8}, 'water', 'brute', 's', {k:{spd:10}}],
  ['forestcobra', 'งูเห่าดง', 'Forest Cobra', 33, 'serpent', {skin:'#3a3026', belly:'#c8b890', hood:'#4a3a2a', len:1.1, rise:12}, 'shadow', 'brute', 'm', {aggro:true, range:120, shot:'dart'}],
  ['firekingfisher', 'นกกระเต็นไฟ', 'Fire Kingfisher', 32, 'bird', {body:'#2a8ad0', wing:'#1a6ab0', belly:'#f08a3a', beak:'#e04a2a', tail:'short', beakLen:1.6}, 'fire', 'brute', 's', {range:130, shot:'fire'}],
  ['wildbuffalo', 'ควายน้ำดุ', 'Wild Water Buffalo', 36, 'quad', {skin:'#3a3a3e', belly:'#5a5a5e', acc:'#d8c8a0', head:'bovine', horns:'buffalo', girth:1.2, hoof:true, socks:'#b8b0a0'}, 'earth', 'brute', 'l', {k:{hp:1.4, atk:1.2, spd:-5}}],
  ['waterbug', 'แมงดานา', 'Giant Water Bug', 31, 'bug', {shell:'#5a4a32', leg:'#3a2a1a', kind:'beetle'}, 'water', 'insect', 's', {}],
  // 4 ตลาดน้ำร้าง
  ['boatscarecrow', 'หุ่นฟางเฝ้าเรือ', 'Boat Scarecrow', 37, 'human', {skin:'#e2b955', top:'#8a2a2a', pants:'#6a4a2a', hair:'#c8a050', hat:'ngob', weapon:'staff', spikes:14, spikeLen:4}, 'fire', 'formless', 'm', {}],
  ['phantommerchant', 'ผีแม่ค้า', 'Phantom Merchant', 40, 'human', {skin:'#c8d8e0', top:'#5a7aa0', pants:'#3a4a6a', hair:'#2a2a3a', skirt:true, longHair:true, hat:'ngob', iris:'irisBl'}, 'shadow', 'undead', 'm', {aggro:true}],
  ['boatlamp', 'ตะเกียงเรือหลอน', 'Haunted Boat Lamp', 39, 'floater', {col:'#7ae8c8', kind:'lantern', dark:'#2a3a3a'}, 'fire', 'undead', 's', {range:120, shot:'fire'}],
  ['pierrat', 'หนูท่าเรือ', 'Pier Rat', 36, 'quad', {skin:'#7a7470', belly:'#c8b8b0', head:'dog', len:.8, leg:.5, girth:.7}, 'neutral', 'brute', 's', {aggro:true, k:{spd:15}}],
  ['watersnake', 'งูปลิงน้ำ', 'Water Snake', 41, 'serpent', {skin:'#4a6a7a', belly:'#c8d8c0', stripe:'#2a3a4a', len:1.2}, 'water', 'brute', 's', {}],
  ['sabercrab', 'ปูก้ามดาบ', 'Fiddler Crab', 44, 'bug', {shell:'#2a4a6a', leg:'#c8603a', acc:'#f0a040', kind:'crab', bigClaw:true, eyeStalks:true}, 'water', 'fish', 'm', {k:{def:1.5, atk:1.15}}],
  // 5 วัดร้างกลางป่า
  ['stuccoyaksha', 'ยักษ์ปูนปั้นเฝ้าวัด', 'Stucco Temple Yaksha', 46, 'human', {skin:'#d8d0c0', top:'#b8a890', pants:'#a89878', hair:'#c8c0b0', hat:'lomphok', hatCol:'#c8b890', fangs:true, weapon:'sword', iris:'irisGr'}, 'earth', 'formless', 'l', {k:{hp:1.4, def:1.8, spd:-8}, scale:1.25, fs:88}],
  ['stonesingha', 'สิงห์หินร้าว', 'Cracked Stone Singha', 48, 'quad', {skin:'#9a948a', belly:'#7a756c', mane:'#b8b2a6', ruff:true, head:'cat', tuft:true, eyeGlow:'#ffd36a', cracks:true}, 'earth', 'formless', 'm', {k:{def:2, spd:-5}}],
  ['chapelbat', 'ค้างคาวแม่ไก่วัด', 'Temple Flying Fox', 45, 'bird', {body:'#3a2a22', wing:'#2a1e1a', mantle:'#c8823a', bat:true, snout:true, ears:.7, size:1.15}, 'shadow', 'brute', 's', {aggro:true, k:{spd:15}}],
  ['lankypreta', 'ผีเปรตผอมสูง', 'Lanky Preta', 52, 'human', {tall:1.4, neck:.35, skin:'#a8b0a0', top:'#5a5a4a', pants:'#4a4a3a', hair:'#3a3a32', sleeve:false, short:true, spikes:4, iris:'irisGr'}, 'shadow', 'undead', 'l', {aggro:true, scale:1.3, fs:88, k:{hp:1.2}}],
  ['goldgecko', 'ตุ๊กแกทองคำ', 'Golden Gecko', 47, 'quad', {skin:'#c8a03a', belly:'#f0d890', stripe:'#e0603a', spots:true, head:'lizard', len:1, leg:.5, girth:.7}, 'earth', 'brute', 's', {}],
  ['offeringsquirrel', 'กระรอกขโมยของไหว้', 'Offering-thief Squirrel', 44, 'quad', {skin:'#8a5a32', belly:'#e8c898', head:'cat', len:.7, leg:.6, girth:.65, tailUp:true}, 'wind', 'brute', 's', {k:{spd:18}}],
  ['templelantern', 'ผีโคมวัด', 'Temple Lantern', 50, 'floater', {col:'#ffc860', kind:'lantern', dark:'#6a2a1a'}, 'holy', 'undead', 's', {range:130, shot:'holy'}],
  // 6 ถ้ำหินปูนเชียงดาว
  ['vampirebat', 'ค้างคาวแวมไพร์ถ้ำ', 'Cave Vampire Bat', 53, 'bird', {body:'#8a7a80', wing:'#5a4a52', bat:true, ears:1.5, noseLeaf:'#c88a8a', eyeGlow:'#ff3a3a', size:1.1}, 'shadow', 'brute', 's', {aggro:true, k:{spd:18}}],
  ['giantscorpion', 'แมงป่องช้าง', 'Giant Scorpion', 56, 'bug', {shell:'#2a2a3a', leg:'#3a3a4a', acc:'#c84a3a', kind:'scorpion'}, 'earth', 'insect', 'm', {aggro:true, k:{atk:1.2}}],
  ['cavespider', 'ต่อถ้ำตาซีด', 'Pale Cave Hornet', 55, 'bug', {shell:'#e6dcc2', leg:'#b8a888', acc:'#5a4a3a', kind:'hornet', eyeGlow:'#a0e0ff'}, 'shadow', 'insect', 'm', {}],
  ['stalagwalker', 'หินงอกเดินได้', 'Walking Stalagmite', 58, 'rock', {col:'#a8a090', acc:'#8a8274', eye:'#7ae0ff', form:'spire', crystals:'#c8f0ff'}, 'earth', 'formless', 'm', {k:{def:2.2, hp:1.3, spd:-10}}],
  ['firemillipede', 'กิ้งกือไฟ', 'Fire Millipede', 54, 'serpent', {skin:'#a8301a', belly:'#2a1a14', stripe:'#2a1a14', legs:true, len:1.1, rise:0, thick:.8}, 'fire', 'insect', 'm', {}],
  ['minerspirit', 'วิญญาณคนขุดแร่', "Miner's Spirit", 60, 'floater', {col:'#c8d8e0', kind:'wisp', lamp:'#ffd36a', dark:'#5a4a32', tails:2}, 'shadow', 'undead', 's', {aggro:true, range:120, shot:'ice'}],
  // 7 ดอยหมอก
  ['serow', 'เลียงผาภูเขา', 'Mountain Serow', 61, 'quad', {skin:'#3a3430', belly:'#8a7a6a', acc:'#2a2420', head:'deer', horns:'spike', mane:'#d8d0c0', leg:1.05}, 'earth', 'brute', 'm', {k:{spd:10}}],
  ['blackbear', 'หมีควายดอย', 'Asiatic Black Bear', 66, 'quad', {skin:'#1e1c22', chestV:'#ece6d6', muzzle:'#a88a6a', head:'bear', girth:1.25, len:.9, shaggy:true}, 'earth', 'brute', 'l', {aggro:true, k:{hp:1.4, atk:1.2}}],
  ['cloudedleopard', 'เสือดาวหมอก', 'Clouded Leopard', 64, 'quad', {skin:'#b8a888', belly:'#e8e0c8', stripe:'#4a4036', spots:true, head:'cat', len:1.1}, 'wind', 'brute', 'm', {aggro:true, k:{spd:15}}],
  ['hornbill', 'นกเงือกกรามช้าง', 'Wreathed Hornbill', 63, 'bird', {body:'#1e1e22', wing:'#2a2a2e', belly:'#f0ece0', beak:'#f0d060', casque:'#e8c860', tail:'long', tailCol:'#f0ece0', beakLen:2, beakW:1.6, size:1.2}, 'wind', 'brute', 'm', {}],
  ['mistspirit', 'วิญญาณหมอก', 'Mist Spirit', 67, 'floater', {col:'#e8f0f4', kind:'wisp', puffs:true, tails:5}, 'wind', 'formless', 's', {range:120, shot:'ice'}],
  ['kongkoi', 'ผีกองกอย', 'Kong Koi', 65, 'human', {oneLeg:true, skin:'#4a3a3a', top:'#2a2a24', pants:'#2a2a24', hair:'#1a1a1a', spikes:18, spikeLen:6, fangs:true, iris:'irisGr'}, 'shadow', 'undead', 's', {aggro:true, k:{spd:12}}],
  // 8 ป่าช้าวัดเก่า
  ['krasue', 'ผีกระสือ', 'Krasue', 70, 'floater', {kind:'krasue', col:'#ff6a7a', glow:'#ff5a6a'}, 'shadow', 'undead', 'm', {aggro:true, range:120, shot:'fire'}],
  ['krahang', 'ผีกระหัง', 'Krahang', 71, 'human', {skin:'#8a7a6a', top:'#3a3a2e', pants:'#2a2a24', hair:'#1a1814', wings:'#a88a50', kradong:true, pestle:true, fangs:true}, 'shadow', 'undead', 'm', {aggro:true}],
  ['phipop', 'ผีปอบ', 'Phi Pop', 74, 'human', {skin:'#c8c0b8', top:'#e8e0d0', pants:'#c8c0b0', hair:'#2a2a2a', longHair:true, skirt:true, fangs:true, iris:'irisVi'}, 'shadow', 'undead', 'm', {aggro:true, k:{atk:1.15}}],
  ['skelsoldier', 'โครงกระดูกทหาร', 'Skeleton Soldier', 72, 'human', {skin:'#e8e4d4', top:'#8a6a3a', pants:'#5a4a32', hair:'#e8e4d4', hat:'cap', hatCol:'#6a5a3a', weapon:'sword', short:true, spikes:0}, 'shadow', 'undead', 'm', {}],
  ['omencrow', 'อีกาดำ', 'Crow of Omen', 69, 'bird', {body:'#18161e', wing:'#22202a', beak:'#3a3a40', eyeGlow:'#ff3a3a', tail:'short'}, 'shadow', 'brute', 's', {aggro:true, k:{spd:15}}],
  ['vengefulshade', 'ผีโหงพราย', 'Vengeful Shade', 77, 'floater', {col:'#7a5aa8', kind:'mask', glow:'#c8a0ff'}, 'shadow', 'undead', 'm', {aggro:true, range:120, shot:'dark'}],
  ['hauntedurn', 'ไหผีปู่โสม', 'Haunted Treasure Urn', 75, 'floater', {kind:'jar', col:'#8a6a4a', dark:'#3a2a1a', glow:'#ffd36a', emissive:false}, 'shadow', 'undead', 's', {k:{def:2}}],
  // 9 ทุ่งกุลาร้องไห้
  ['banteng', 'วัวแดงทุ่งแล้ง', 'Wild Banteng', 78, 'quad', {skin:'#a8582a', belly:'#f0e8d8', acc:'#2a2420', head:'bovine', horns:'spike', girth:1.15, hoof:true, socks:'#f4f0e8'}, 'earth', 'brute', 'l', {k:{hp:1.4, atk:1.15}}],
  ['vulture', 'พญาแร้ง', 'Red-headed Vulture', 79, 'bird', {body:'#1e1a1e', wing:'#141218', belly:'#2a2226', headCol:'#d8402a', beak:'#3a3034', mantle:'#e8e0d8', hook:true, size:1.2}, 'wind', 'brute', 'm', {aggro:true}],
  ['kingcobra', 'งูจงอาง', 'King Cobra', 84, 'serpent', {skin:'#5a5a32', belly:'#e8d890', stripe:'#c8b870', hood:'#5a5a32', len:1.4, rise:16, thick:1.2}, 'shadow', 'brute', 'l', {aggro:true, range:130, shot:'dart', k:{atk:1.2}}],
  ['sandscorpion', 'แมงป่องทราย', 'Sand Scorpion', 80, 'bug', {shell:'#c8a870', leg:'#a8885a', acc:'#7a5a32', kind:'scorpion'}, 'earth', 'insect', 'm', {}],
  ['dustdevil', 'ฝุ่นพายุ', 'Dust Devil', 82, 'floater', {col:'#d8c098', kind:'vortex', emissive:false, dark:'#5a4428'}, 'wind', 'formless', 'm', {aggro:true, k:{spd:20}}],
  ['isanscarecrow', 'หุ่นไล่กาอีสาน', 'Isan Scarecrow', 77, 'human', {skin:'#e2b955', top:'#3a5a8a', pants:'#8a2a2a', hair:'#c8a050', hat:'headwrap', hatCol:'#c83a3a', sleeve:false, baggy:true, spikes:14, spikeLen:4}, 'fire', 'formless', 'm', {}],
  // 10 ปราสาทหินขอมโบราณ
  ['stonenaga', 'นาคหินเจ็ดเศียร', 'Seven-headed Stone Naga', 90, 'serpent', {skin:'#9a948a', belly:'#7a756c', hood:'#a8a298', heads:7, spread:2.6, len:1.2, rise:10, thick:1.1, eyeGlow:'#7ae0ff'}, 'earth', 'formless', 'l', {k:{def:2, hp:1.3}, range:130, shot:'ice'}],
  ['khmerlion', 'สิงห์ขอม', 'Khmer Lion', 86, 'quad', {skin:'#c08870', belly:'#9a6a50', mane:'#9a6a50', ruff:true, head:'cat', tuft:true, eyeGlow:'#ffd36a', girth:1.1}, 'earth', 'formless', 'm', {k:{def:1.8}}],
  ['stoneapsara', 'อัปสราศิลา', 'Stone Apsara', 88, 'human', {skin:'#b0a898', top:'#a0988a', pants:'#a0988a', hair:'#8a8274', hat:'lomphok', hatCol:'#c8b48a', skirt:true, skirtTrim:'gold', iris:'irisGr'}, 'holy', 'formless', 'm', {range:130, shot:'holy'}],
  ['khmerghost', 'หมาจิ้งจอกปราสาทหิน', 'Sanctuary Jackal', 87, 'quad', {skin:'#8a6a44', belly:'#d8c4a0', stripe:'#3a2a1a', head:'dog', len:1, leg:1.05, girth:.85}, 'shadow', 'brute', 'm', {aggro:true}],
  ['carvedmonkey', 'ลิงหินแกะสลัก', 'Carved Stone Monkey', 85, 'human', {skin:'#9a948a', top:'#8a8478', pants:'#8a8478', hair:'#7a746a', tail:'#9a948a', sleeve:false, short:true}, 'earth', 'formless', 's', {k:{def:1.8, spd:10}}],
  ['sanctuarybat', 'ค้างคาวปราสาท', 'Sanctuary Bat', 89, 'bird', {body:'#6a4a2a', wing:'#4a3420', bat:true, ears:1.2, noseLeaf:'#a86a4a', eyeGlow:'#ffd36a'}, 'shadow', 'brute', 's', {aggro:true, k:{spd:18}}],
  // 11 ชายฝั่งอันดามัน
  ['ghostcrab', 'ปูลมทราย', 'Ghost Crab', 93, 'bug', {shell:'#f0e8d8', leg:'#d8ccb8', acc:'#e8dcc8', kind:'crab', eyeStalks:true}, 'water', 'fish', 's', {k:{spd:20}}],
  ['hermitcrab', 'ปูเสฉวนยักษ์', 'Giant Hermit Crab', 97, 'bug', {shell:'#e05a3a', leg:'#c84a2a', acc:'#f08a5a', kind:'crab', shellHouse:'#e8d0b0'}, 'water', 'fish', 'm', {k:{def:2.2, hp:1.2}}],
  ['leatherback', 'เต่ามะเฟือง', 'Leatherback Turtle', 99, 'squat', {skin:'#2a3440', shell:'#1e262e', belly:'#e8eef0', kind:'turtle', size:1.1, ridges:true, scute:'#3a4a58', spots:'#c8d4dc'}, 'water', 'brute', 'l', {k:{hp:1.6, def:1.6, spd:-12}}],
  ['pirategull', 'นกนางนวลโจร', 'Pirate Gull', 95, 'bird', {body:'#f4f4f0', wing:'#8a9098', beak:'#e8b43a', tail:'short'}, 'wind', 'brute', 's', {aggro:true}],
  ['seakrait', 'งูทะเลลายปล้อง', 'Banded Sea Krait', 98, 'serpent', {skin:'#3a7ab0', belly:'#c8e0f0', stripe:'#1a1a22', len:1.2}, 'water', 'brute', 'm', {aggro:true, k:{atk:1.2}}],
  ['walkcoral', 'ปะการังเดินได้', 'Walking Coral', 100, 'rock', {col:'#f08aa8', acc:'#ffb0c8', eye:'#7ae0ff', coral:true}, 'water', 'plant', 'm', {k:{def:1.6}}],
  ['firejelly', 'แมงกะพรุนไฟ', 'Fire Jellyfish', 96, 'slime', {col:'#ff7a5a', emissive:true, jelly:true, topCol:'#ffb08a'}, 'fire', 'fish', 's', {range:110, shot:'fire'}],
  // 12 เกาะผีเสื้อสมุทร
  ['lostmermaid', 'นางเงือกหลงทาง', 'Lost Mermaid', 104, 'human', {skin:'#f0d8c8', top:'#3ab0a8', pants:'#3ab0a8', hair:'#2a5a8a', tail:'#3ab0a8', tailFin:true, longHair:true, iris:'irisBl'}, 'water', 'fish', 'm', {range:130, shot:'ice'}],
  ['maninmangkon', 'ม้านิลมังกร', 'Ma Nin Mangkon', 108, 'quad', {skin:'#1a1c26', belly:'#3a4a6a', acc:'#e3b04b', mane:'#3ab0a8', head:'horse', horns:'antler', leg:1.1, hoof:true, stripe:'#2e3e5e'}, 'water', 'dragon', 'l', {aggro:true, k:{hp:1.3, spd:15}}],
  ['giantclam', 'หอยมือเสือ', 'Giant Clam', 101, 'squat', {kind:'clam', shell:'#7ab0a8', pearl:'#f0f8ff'}, 'water', 'fish', 'm', {k:{def:2.5, hp:1.3, spd:-30}}],
  ['giantsquid', 'ปลาหมึกยักษ์', 'Giant Squid', 106, 'floater', {kind:'squid', col:'#c86a8a', dark:'#2a1a24', emissive:false}, 'water', 'fish', 'm', {range:120, shot:'dark'}],
  ['seawraith', 'ผีพรายทะเล', 'Sea Wraith', 103, 'floater', {col:'#5ad0c0', kind:'wisp', veil:true, hair:'#2a4a32', tails:5}, 'shadow', 'undead', 's', {aggro:true}],
  ['seaserpent', 'งูทะเลยักษ์', 'Sea Serpent', 110, 'serpent', {skin:'#1a5a8a', belly:'#a8d8e8', stripe:'#0a3a5a', len:1.5, thick:1.3, rise:12}, 'water', 'dragon', 'l', {aggro:true, k:{hp:1.3, atk:1.15}}],
  // 13 กรุงเก่าอโยธยา
  ['ghosthorse', 'ม้าศึกผี', 'Phantom Warhorse', 109, 'quad', {skin:'#8aa0b0', belly:'#c8d8e0', mane:'#3a4a5a', head:'horse', leg:1.15, hoof:true, eyeGlow:'#7ae0ff'}, 'shadow', 'undead', 'l', {aggro:true, k:{spd:18}}],
  ['ghostelephant', 'ช้างศึกผี', 'Ghost War Elephant', 116, 'quad', {skin:'#7a8a98', belly:'#6a7a88', acc:'#e8e0c8', head:'elephant', tusks:true, girth:1.35, leg:1.1, eyeGlow:'#7ae0ff'}, 'shadow', 'undead', 'l', {k:{hp:1.7, atk:1.2, spd:-8}, scale:1.15, fs:88}],
  ['ayutsoldier', 'ทหารผีอยุธยา', 'Ayutthaya Ghost Soldier', 111, 'human', {skin:'#9ab0b8', top:'#8a2a2a', pants:'#3a2a2a', hair:'#1a1a1a', hat:'band', hatCol:'#c8a040', weapon:'sword', iris:'irisBl'}, 'shadow', 'undead', 'm', {aggro:true}],
  ['celadonjar', 'ไหลายครามหลอน', 'Cursed Celadon Jar', 110, 'floater', {kind:'jar', col:'#9ac8b8', dark:'#2a5a6a', glow:'#7ae0ff', emissive:false}, 'shadow', 'undead', 's', {range:120, shot:'ice', k:{def:1.8}}],
  ['whiteraven', 'กาเผือกเฝ้ากรุ', 'White Raven of the Vault', 112, 'bird', {body:'#f0f0f4', wing:'#d8d8e0', beak:'#3a3a40', eyeGlow:'#ff5a5a', tail:'long'}, 'holy', 'brute', 's', {aggro:true}],
  ['treasurespirit', 'ผีเฝ้าทรัพย์', 'Treasure Guardian Spirit', 115, 'human', {skin:'#e8c860', top:'#c89a2a', pants:'#a87a1a', hair:'#3a2a1a', hat:'lomphok', hatCol:'#e3b04b', weapon:'staff', iris:'irisBr'}, 'holy', 'undead', 'm', {range:140, shot:'holy'}],
  ['vaultpython', 'งูเหลือมกรุ', 'Vault Python', 114, 'serpent', {skin:'#a88a5a', belly:'#e8d8b0', stripe:'#4a3a24', len:1.6, thick:1.4, rise:6}, 'earth', 'brute', 'l', {k:{hp:1.5}}],
  // 14 ป่าหิมพานต์ชั้นนอก
  ['kilen', 'กิเลน', 'Kilen', 119, 'quad', {skin:'#3a8a5a', belly:'#e3b04b', acc:'#e3b04b', mane:'#e05a3a', head:'deer', horns:'antler', hoof:true, stripe:'#2a6a44'}, 'fire', 'dragon', 'm', {aggro:true}],
  ['kotchasi', 'คชสีห์', 'Kotchasi', 123, 'quad', {skin:'#e8d8b0', belly:'#c8b890', acc:'#f0f0e8', mane:'#e3b04b', ruff:true, head:'elephant', tusks:true, girth:1.2, tuft:true}, 'earth', 'dragon', 'l', {k:{hp:1.4, atk:1.15}}],
  ['karawek', 'นกการเวก', 'Karawek Bird', 117, 'bird', {body:'#3a6ad0', wing:'#e03a6a', belly:'#f0d060', crest:'#e3b04b', tail:'long', tailCol:'#3ab0a8'}, 'wind', 'angel', 's', {range:130, shot:'holy'}],
  ['wingedhorse', 'ม้าปีก', 'Winged Horse', 121, 'quad', {skin:'#f4f0e8', belly:'#e0dccf', mane:'#e3b04b', wing:'#f4f0e8', head:'horse', leg:1.1, hoof:true}, 'wind', 'angel', 'l', {k:{spd:18}}],
  ['goldsingha', 'สิงห์ทอง', 'Golden Singha', 125, 'quad', {skin:'#e3b04b', belly:'#c8902a', mane:'#f0d070', ruff:true, head:'cat', tuft:true}, 'holy', 'dragon', 'm', {aggro:true, k:{atk:1.2}}],
  ['kinnorn', 'กินนร', 'Kinnorn', 120, 'human', {skin:'#f0d8c0', top:'#e3b04b', pants:'#c84a3a', hair:'#2a1a14', wings:'#f0e8d0', tail:'#e3b04b', tailW:2.4, tailUp:true, hat:'lomphok', hatCol:'#e3b04b', weapon:'bow', iris:'irisBr'}, 'wind', 'angel', 'm', {range:150, shot:'arrow'}],
  // 15 สระอโนดาต
  ['goldhamsa', 'หงส์ทอง', 'Golden Hamsa', 127, 'bird', {body:'#f0d070', wing:'#e3b04b', belly:'#fff0c0', beak:'#e05a3a', crest:'#e05a3a', tail:'fan', size:1.15}, 'holy', 'angel', 'm', {range:130, shot:'holy'}],
  ['matchanu', 'มัจฉานุ', 'Matchanu', 131, 'human', {skin:'#f4f0e8', top:'#3ab0a8', pants:'#2a8a8a', hair:'#f4f0e8', tail:'#3ab0a8', tailFin:true, sleeve:false, weapon:'sword', fangs:true}, 'water', 'demon', 'm', {aggro:true, k:{atk:1.2, spd:10}}],
  ['lakenaga', 'นาคน้อยสระ', 'Little Lake Naga', 129, 'serpent', {skin:'#2a8a7a', belly:'#c8e8d8', hood:'#3ab0a8', crown:true, len:1.2, rise:12}, 'water', 'dragon', 'm', {range:130, shot:'ice'}],
  ['skylotus', 'บัวสวรรค์เดินได้', 'Living Celestial Lotus', 126, 'slime', {col:'#fdf6fb', emissive:true, top:'lotus', topCol:'#ffffff', size:1.15}, 'holy', 'plant', 'm', {}],
  ['waterelephant', 'วารีกุญชร', 'Water Elephant', 134, 'quad', {skin:'#4a8ac8', belly:'#8ac0e8', acc:'#f0f0f8', head:'elephant', tusks:true, girth:1.3, fishTail:'#3ab0c8'}, 'water', 'dragon', 'l', {k:{hp:1.6, spd:-6}}],
  ['goldshrimp', 'กุ้งทองสระ', 'Golden Lake Shrimp', 128, 'bug', {shell:'#f0b040', leg:'#e08a2a', acc:'#4a8ad0', kind:'shrimp'}, 'water', 'fish', 's', {k:{spd:15}}],
  // 16 เมืองลับแล
  ['laplaefolk', 'ชาวลับแลเงา', 'Shadow Laplae Folk', 136, 'human', {skin:'#c8b8b0', top:'#5a3a6a', pants:'#3a2a4a', hair:'#2a1a2a', skirt:true, hat:'ngob', iris:'irisVi'}, 'shadow', 'human', 'm', {aggro:true}],
  ['spiritkoel', 'กาเหว่าสื่อวิญญาณ', 'Spirit Koel', 135, 'bird', {body:'#1a1a2a', wing:'#2a2a4a', beak:'#a8c840', eyeGlow:'#ff3a3a', tail:'long'}, 'shadow', 'brute', 's', {range:130, shot:'dark'}],
  ['misttiger', 'เสือลายพราง', 'Mist Tiger', 141, 'quad', {skin:'#c8c0b8', belly:'#f0ece8', stripe:'#4a4a5a', head:'cat', len:1.15, girth:1.1}, 'wind', 'brute', 'l', {aggro:true, k:{atk:1.25, spd:12}}],
  ['wanderdurian', 'ทุเรียนหมอนทองเดินได้', 'Wandering Durian', 138, 'slime', {col:'#8aa83a', spikes:true, topCol:'#6a8a2a'}, 'earth', 'plant', 'm', {k:{def:1.8, hp:1.3}}],
  ['woodsentinel', 'หุ่นไม้เฝ้าเมือง', 'Wooden Sentinel', 143, 'human', {skin:'#8a5a32', top:'#6a4426', pants:'#5a3a22', hair:'#4a2e1a', hat:'cap', hatCol:'#6a4426', weapon:'sword', short:true, spikes:0}, 'earth', 'formless', 'l', {k:{def:2, hp:1.3}, scale:1.2, fs:88}],
  ['laplaemist', 'วิญญาณหมอกลับแล', 'Laplae Mist', 140, 'floater', {col:'#c8b8e8', kind:'wisp', hood:true, dark:'#3a2a4a', tails:1}, 'shadow', 'formless', 's', {aggro:true, range:120, shot:'dark'}],
  // 17 บาดาลนาคา
  ['nagaretainer', 'นาคบริวาร', 'Naga Retainer', 148, 'serpent', {skin:'#2a6a6a', belly:'#a8d8c8', hood:'#3a8a8a', crest:'#e3b04b', len:1.3, rise:14}, 'water', 'dragon', 'm', {aggro:true}],
  ['nagawarrior', 'ทหารนาคา', 'Naga Warrior', 152, 'human', {skin:'#3a8a7a', top:'#e3b04b', pants:'#1a4a4a', hair:'#0a2a2a', hat:'lomphok', hatCol:'#e3b04b', weapon:'sword', tail:'#3a8a7a', tailW:2.2, iris:'irisGr'}, 'water', 'dragon', 'm', {aggro:true, k:{atk:1.2}}],
  ['abyssjelly', 'แมงกะพรุนบาดาล', 'Abyssal Jelly', 147, 'slime', {col:'#3ac8c0', emissive:true, jelly:true, topCol:'#7af0e0'}, 'water', 'fish', 's', {range:110, shot:'ice'}],
  ['emeraldcrab', 'ปูมรกต', 'Emerald Crab', 150, 'bug', {shell:'#2aa86a', leg:'#1a7a4a', acc:'#7af0b0', kind:'crab', bigClaw:true}, 'water', 'fish', 'm', {k:{def:2}}],
  ['thundereel', 'ปลาไหลไฟฟ้า', 'Thunder Eel', 154, 'serpent', {skin:'#e8d040', belly:'#3a3a2a', stripe:'#3a3a2a', len:1.4, eyeGlow:'#7ae0ff'}, 'wind', 'fish', 'm', {aggro:true, range:120, shot:'bolt'}],
  ['spiritpearl', 'ไข่มุกวิญญาณ', 'Spirit Pearl', 149, 'floater', {col:'#f0f4ff', kind:'pearl', ring:'#a8e0ff', glow:'#c8f0ff', dark:'#4a5a7a'}, 'holy', 'formless', 's', {range:130, shot:'holy'}],
  ['abyssturtle', 'เต่าบาดาล', 'Abyss Turtle', 156, 'squat', {skin:'#2a4a5a', shell:'#1a3a4a', belly:'#7ab0c0', kind:'turtle', size:1.2, scute:'#5af0d0', eyeGlow:'#7af0d0'}, 'water', 'dragon', 'l', {k:{hp:1.7, def:2, spd:-12}}],
  // 18 ป่าหิมพานต์ชั้นใน
  ['thaktho', 'ทักทอ', 'Thak Tho', 160, 'quad', {skin:'#5a3a6a', belly:'#8a6aa0', acc:'#e3b04b', head:'elephant', tusks:true, horns:'spike', girth:1.2}, 'shadow', 'dragon', 'l', {aggro:true, k:{hp:1.4}}],
  ['kraisorn', 'ไกรสรจำแลง', 'Kraisorn', 163, 'quad', {skin:'#f4f0e8', belly:'#e0d8c8', mane:'#c84a3a', ruff:true, head:'cat', tuft:true}, 'fire', 'dragon', 'm', {aggro:true, k:{atk:1.2, spd:10}}],
  ['sakuna', 'สกุณไกรสร', 'Sakuna Kraisorn', 166, 'bird', {body:'#e3b04b', wing:'#c84a3a', belly:'#f4f0e8', beak:'#3a2a1a', crest:'#c84a3a', mantle:'#e08a2a', hook:true, size:1.35}, 'fire', 'dragon', 'l', {aggro:true, range:130, shot:'fire'}],
  ['asurabird', 'อสูรปักษา', 'Asura Bird', 161, 'bird', {body:'#3a1a2a', wing:'#5a1a2a', eyeGlow:'#ff3a3a', hook:true, tail:'long', size:1.2}, 'shadow', 'demon', 'm', {aggro:true}],
  ['himogre', 'ยักษ์ป่าหิมพานต์', 'Himmapan Ogre', 168, 'human', {skin:'#4a8a4a', top:'#c84a3a', pants:'#3a2a1a', hair:'#1a1a1a', hat:'lomphok', hatCol:'#e3b04b', fangs:true, horns:'#f0e8d0', weapon:'sword', iris:'irisGr'}, 'earth', 'demon', 'l', {aggro:true, scale:1.35, fs:96, k:{hp:1.5, atk:1.25}}],
  ['hemaraj', 'เหมราช', 'Hemaraj', 165, 'quad', {skin:'#f0c040', belly:'#e0a020', mane:'#fff0a0', ruff:true, head:'cat', tuft:true, wing:'#fff0a0'}, 'holy', 'dragon', 'l', {k:{hp:1.3}}],
  ['wingednaga', 'นาคปักษิณ', 'Winged Naga', 169, 'serpent', {skin:'#6a3a8a', belly:'#d8b8e8', hood:'#8a4aa8', wing:'#c8a8e8', crown:true, len:1.3, rise:14}, 'wind', 'dragon', 'l', {range:140, shot:'bolt'}],
  // 19 เขาไกรลาส
  ['snowsingha', 'สิงห์ไกรลาส', 'Kailash Singha', 172, 'quad', {skin:'#f4f8ff', belly:'#d8e4f0', mane:'#a8c8e8', ruff:true, head:'cat', tuft:true, eyeGlow:'#7ae0ff'}, 'water', 'dragon', 'm', {aggro:true, k:{atk:1.2}}],
  ['gandharva', 'คนธรรพ์', 'Gandharva', 174, 'human', {skin:'#7aa0e0', top:'#e3b04b', pants:'#3a4a8a', hair:'#1a1a3a', hat:'lomphok', hatCol:'#e3b04b', weapon:'staff', iris:'irisVi'}, 'holy', 'angel', 'm', {range:150, shot:'holy'}],
  ['younggaruda', 'ครุฑน้อย', 'Young Garuda', 177, 'bird', {body:'#c83a2a', wing:'#a82a1a', belly:'#f0d070', beak:'#e3b04b', crest:'#e3b04b', hook:true, size:1.15}, 'wind', 'angel', 'l', {aggro:true, k:{atk:1.2, spd:15}}],
  ['frostyaksha', 'ยักษ์น้ำแข็ง', 'Frost Yaksha', 180, 'human', {skin:'#a8d0f0', top:'#3a5a8a', pants:'#2a3a6a', hair:'#f4f8ff', hat:'lomphok', hatCol:'#c8e0f0', fangs:true, horns:'#f4f8ff', weapon:'sword', iris:'irisBl'}, 'water', 'demon', 'l', {aggro:true, scale:1.35, fs:96, k:{hp:1.5, atk:1.25}}],
  ['icesentinel', 'หินน้ำแข็งเฝ้าเขา', 'Ice Sentinel', 175, 'rock', {col:'#8a96a2', acc:'#d8f0ff', eye:'#7ae0ff', crystals:'#c8f0ff', moss:'#e8f4ff', bulk:1.15}, 'water', 'formless', 'm', {k:{def:2.2, hp:1.3, spd:-10}}],
  ['snowdeva', 'วิญญาณเทพหิมะ', 'Snow Deva Wisp', 182, 'floater', {col:'#f4f8ff', kind:'mask', glow:'#a8d0f0'}, 'holy', 'angel', 's', {range:140, shot:'ice'}],
  // 20 เขาพระสุเมรุ
  ['guardiandeva', 'เทวดาผู้พิทักษ์', 'Guardian Deva', 188, 'human', {skin:'#f0d8b0', top:'#e3b04b', pants:'#c83a2a', hair:'#1a1a1a', hat:'lomphok', hatCol:'#f0d070', weapon:'sword', iris:'irisBr', necklace:true, skirt:true, skirtTrim:'gold'}, 'holy', 'angel', 'm', {aggro:true, k:{atk:1.2}}],
  ['youngerawan', 'ช้างเอราวัณน้อย', 'Young Erawan', 192, 'quad', {skin:'#f0dcd4', belly:'#e8d0c8', acc:'#e3b04b', head:'elephant', tusks:true, crown:true, girth:1.3}, 'holy', 'angel', 'l', {k:{hp:1.7, spd:-5}}],
  ['goldkinnaree', 'กินรีทอง', 'Golden Kinnaree', 186, 'human', {skin:'#f4e0c8', top:'#e3b04b', pants:'#e3b04b', hair:'#2a1a14', wings:'#f0d070', skirt:true, skirtTrim:'gold', hat:'lomphok', hatCol:'#f0d070', longHair:true}, 'holy', 'angel', 'm', {range:150, shot:'holy'}],
  ['celestialsingha', 'สิงห์สวรรค์', 'Celestial Singha', 190, 'quad', {skin:'#fff4d0', belly:'#f0d070', mane:'#e3b04b', ruff:true, head:'cat', tuft:true, crown:true}, 'holy', 'angel', 'l', {aggro:true, k:{atk:1.25}}],
  ['goldnaga', 'นาคทองสุวรรณ', 'Golden Naga', 194, 'serpent', {skin:'#e3b04b', belly:'#fff0c0', hood:'#f0c040', crown:true, heads:3, spread:2, len:1.3, rise:14, thick:1.15}, 'holy', 'dragon', 'l', {range:140, shot:'holy', k:{hp:1.3}}],
  ['asura', 'อสูรอสุรา', 'Asura', 196, 'human', {skin:'#c83a2a', top:'#2a1a1a', pants:'#1a0a0a', hair:'#1a1a1a', fangs:true, horns:'#2a1a1a', hornLen:3, weapon:'sword', iris:'irisVi'}, 'shadow', 'demon', 'l', {aggro:true, scale:1.3, fs:96, k:{atk:1.3, hp:1.3}}],
  ['goldgaruda', 'ครุฑทอง', 'Golden Garuda', 198, 'bird', {body:'#e3b04b', wing:'#c83a2a', belly:'#fff0c0', beak:'#c83a2a', crest:'#c83a2a', hook:true, crown:true, size:1.4}, 'wind', 'angel', 'l', {aggro:true, k:{atk:1.2, spd:15}}],
  ['fallenstar', 'ดาวตกวิญญาณ', 'Fallen Star Spirit', 189, 'floater', {col:'#fff0a0', kind:'star', glow:'#ffd36a', tails:5, size:1.1}, 'fire', 'formless', 's', {range:140, shot:'fire'}],
  /* v27: folk creatures of the old capital (กรุงเก่าอโยธยา) */
  ['ayutyaksha', 'ยักษ์เฝ้ากรุงเก่า', 'Old Capital Yaksha', 113, 'human', {skin:'#3a8a6a', top:'#c8a040', pants:'#8a2a2a', hair:'#1a1a1a', hat:'lomphok', hatCol:'#e3b04b', fangs:true, weapon:'sword', necklace:true, iris:'irisGr', body:'brute'}, 'earth', 'demon', 'l', {aggro:true, k:{hp:1.3}}],
  ['krahangluang', 'กระหังกรุงเก่า', 'Old Capital Krahang', 116, 'human', {skin:'#6a5a4a', top:'#2a2a24', pants:'#3a2a1a', hair:'#141210', wings:'#c8a060', kradong:true, pestle:true, fangs:true, beard:true, size:1.35, body:'gaunt'}, 'wind', 'undead', 'm', {aggro:true}],
  ['moatkappa', 'ตะพาบคูเมือง', 'Moat Softshell Turtle', 109, 'squat', {skin:'#6a7a5a', shell:'#5a6a48', belly:'#e8e0c8', kind:'turtle', scute:'#7a8a68', headStripe:'#c8c0a0', size:1.25}, 'water', 'fish', 's', {}],
  ['nangtani', 'ผีนางตานี', 'Lady Tani', 117, 'human', {skin:'#d8e8c8', top:'#5a9a3a', pants:'#3a6a2a', hair:'#0a140a', longHair:true, leaves:'#6aa83a', iris:'irisGr', body:'man', size:1.3}, 'earth', 'undead', 'm', {aggro:true}]
];

/* ---------- bosses (one per map) ----------
   [id, th, en, lvl, archetype, look, elem, race, skills, extra]   skills from BOSS_SKILL (game/mobs.js) */
const BOSSES = [
  ['whitemonkeyking', 'พญาลิงเผือก', 'White Monkey King', 24, 'human', {skin:'#f4f0e8', top:'#e3b04b', pants:'#c83a2a', hair:'#f4f0e8', tail:'#f4f0e8', hat:'band', hatCol:'#e3b04b', weapon:'staff', sleeve:false, fangs:true}, 'wind', 'brute', ['slam', 'summon', 'charge']],
  ['lotusturtle', 'พญาเต่าบัวหลวง', 'Lotus Turtle Lord', 32, 'squat', {skin:'#6a7a3e', shell:'#4a5a2e', belly:'#e0d6a4', kind:'turtle', lotus:true}, 'water', 'brute', ['quake', 'heal', 'summon']],
  ['aikhiam', 'ไอ้เคี่ยมพญาตะกวด', 'Ai Khiam the Monitor King', 41, 'quad', {skin:'#4a4a2e', belly:'#e0d6a0', stripe:'#22220f', spots:'#e8cc60', head:'lizard', len:1.65, leg:.45, girth:1.12}, 'water', 'brute', ['charge', 'slam', 'roar']],
  ['marketmatron', 'นางพรายแม่ค้า', 'Wraith Matron of the Market', 49, 'human', {skin:'#c8d8e0', top:'#a83a5a', pants:'#3a2a4a', hair:'#1a1a2a', skirt:true, skirtTrim:'gold', longHair:true, hat:'ngob', necklace:true, cape:'#3a1a3a', iris:'irisVi'}, 'shadow', 'undead', ['teleport', 'summon', 'field', 'barrage']],
  ['dvarapala', 'ทวารบาลยักษ์ศิลา', 'Stone Dvarapala Giant', 57, 'human', {skin:'#a8a090', top:'#8a8274', pants:'#7a7266', hair:'#6a6458', hat:'lomphok', hatCol:'#b8a888', fangs:true, weapon:'sword', iris:'irisGr'}, 'earth', 'formless', ['slam', 'wave', 'quake', 'enrage']],
  ['cavematriarch', 'นางพญาต่อถ้ำมืด', 'Hornet Queen of the Dark Cave', 65, 'bug', {shell:'#c8902a', leg:'#3a2418', acc:'#2a1418', kind:'hornet', eyeGlow:'#ff3a6a', crown:true}, 'shadow', 'insect', ['field', 'summon', 'barrage', 'teleport']],
  ['saming', 'พญาเสือสมิงดอย', 'Saming, the Highland Werething Tiger', 73, 'quad', {skin:'#d97424', belly:'#f6efe0', stripe:'#16120e', head:'cat', len:1.25, girth:1.1, eyeGlow:'#ffd36a'}, 'wind', 'demon', ['charge', 'teleport', 'roar', 'enrage']],
  ['elderpop', 'ผีปอบเฒ่า', 'Elder Pop', 81, 'human', {skin:'#b8b0a8', top:'#4a4440', pants:'#3a3430', hair:'#e8e4dc', longHair:true, fangs:true, beard:true, iris:'irisVi'}, 'shadow', 'undead', ['heal', 'summon', 'field', 'barrage']],
  ['khankhak', 'พญาคันคาก', 'Phaya Khankhak, the Toad King', 89, 'squat', {skin:'#7a6a3a', belly:'#e8dcb0', stripe:'#2a1e10', kind:'toad', warts:true, crown:true}, 'water', 'brute', ['meteor', 'heal', 'summon', 'charge']],
  ['templecolossus', 'ราชสีห์ศิลาเทวาลัย', 'Temple Lion Colossus', 97, 'quad', {skin:'#a89a84', belly:'#8a7c66', mane:'#6a7a4a', ruff:true, head:'cat', tuft:true, eyeGlow:'#ff6a3a', girth:1.15, cracks:true, crown:true}, 'earth', 'formless', ['slam', 'meteor', 'roar', 'enrage']],
  ['andamancrab', 'ปูยักษ์อันดามัน', 'Andaman Colossus Crab', 105, 'bug', {shell:'#4f5a36', leg:'#3e4a2c', acc:'#e0742e', kind:'crab', bigClaw:true}, 'water', 'fish', ['slam', 'barrage', 'heal', 'charge']],
  ['seaogress', 'นางผีเสื้อสมุทร', 'The Sea Ogress', 113, 'human', {skin:'#5a8aa0', top:'#1a3a5a', pants:'#0a2a3a', hair:'#0a1a2a', longHair:true, fangs:true, horns:'#e8e0d0', skirt:true, iris:'irisVi'}, 'water', 'demon', ['teleport', 'wave', 'barrage']],
  ['phantomgeneral', 'แม่ทัพผีอโยธยา', 'Phantom General of Ayodhya', 121, 'human', {skin:'#9ab0b8', top:'#a82a2a', pants:'#2a1a1a', hair:'#1a1a1a', hat:'lomphok', hatCol:'#e3b04b', weapon:'sword', cape:'#5a1a1a', iris:'irisBl'}, 'shadow', 'undead', ['charge', 'summon', 'wave', 'enrage']],
  ['lordkotchasi', 'พญาคชสีห์', 'Lord Kotchasi', 129, 'quad', {skin:'#e8c050', belly:'#c8902a', acc:'#fff8e8', mane:'#c83a2a', ruff:true, head:'elephant', tusks:true, crown:true, girth:1.25, tuft:true}, 'earth', 'dragon', ['charge', 'roar', 'quake', 'enrage']],
  ['waterelephantking', 'วารีกุญชรราชา', 'King of the Water Elephants', 138, 'quad', {skin:'#2a5a9a', belly:'#7ab0e0', acc:'#f8f8ff', head:'elephant', tusks:true, crown:true, girth:1.35, fishTail:'#e3b04b', stripe:'#e3b04b', spots:true}, 'water', 'dragon', ['meteor', 'charge', 'heal', 'field']],
  ['laplaelord', 'เจ้าเมืองลับแล', 'Lord of Laplae', 147, 'human', {skin:'#d8c8c0', top:'#4a2a5a', pants:'#2a1a3a', hair:'#e8e0d8', hat:'lomphok', hatCol:'#c8a8e8', beard:true, weapon:'staff', cape:'#3a1a4a', iris:'irisVi'}, 'shadow', 'human', ['teleport', 'summon', 'barrage', 'field']],
  ['nagaking', 'พญานาคราช', 'The Naga King', 160, 'serpent', {skin:'#1f6e52', belly:'#e8d27a', hood:'#d9a63a', crown:true, heads:7, spread:2.4, len:1.55, rise:16, thick:1.3, eyeGlow:'#ffd36a'}, 'water', 'dragon', ['barrage', 'field', 'quake', 'enrage']],
  ['tenfacedogre', 'ยักษ์ทศพักตร์', 'The Ten-faced Ogre King', 172, 'human', {skin:'#3a7a4a', top:'#e3b04b', pants:'#a82a2a', hair:'#1a1a1a', hat:'lomphok', hatCol:'#e3b04b', fangs:true, horns:'#f0e8d0', weapon:'sword', cape:'#a82a2a', iris:'irisGr'}, 'shadow', 'demon', ['summon', 'meteor', 'slam', 'enrage']],
  ['garudaking', 'พญาครุฑ', 'The Garuda King', 186, 'bird', {body:'#c82a1a', wing:'#e3b04b', belly:'#f0d070', beak:'#e3b04b', crest:'#e3b04b', hook:true, crown:true, size:1.4, tail:'fan', tailCol:'#c82a1a', mantle:'#e3b04b'}, 'wind', 'angel', ['charge', 'barrage', 'roar', 'enrage']],
  ['vessavana', 'ท้าวเวสสุวรรณ', 'Vessavana, Lord of Giants', 205, 'human', {skin:'#2a5aa8', top:'#e3b04b', pants:'#a82a2a', hair:'#1a1a1a', hat:'lomphok', hatCol:'#f0d070', fangs:true, weapon:'sword', cape:'#e3b04b', iris:'irisVi'}, 'holy', 'demon', ['meteor', 'summon', 'slam', 'wave', 'heal', 'enrage']]
];

/* ---------- maps ----------
   biome keys are read by world/maps.js (ground painter, props, weather) */
const MAPS = [
  {id:0, name:'ทุ่งสุวรรณิน', en:'Suwannin Fields', lv:[1, 15], biome:'fields', mobs:['dewblob', 'hare', 'boar', 'lantern', 'kaipa', 'kobna'], boss:'boss', wx:.5, wy:.93,
    desc:['หมู่บ้านอาเรนกับทุ่งนาสีทอง', 'Aren village and the golden rice fields']},
  {id:1, name:'ป่าไผ่กระซิบ', en:'Whispering Bamboo', lv:[12, 22], biome:'bamboo', mobs:['bamboomonkey', 'junglefowl', 'greenviper', 'bamboogrub', 'bamboojackal', 'termiteshroom'], boss:'whitemonkeyking', wx:.33, wy:.86,
    desc:['ป่าไผ่หนาทึบ ลมพัดใบไผ่เสียงกระซิบ', 'Dense bamboo where the leaves whisper in the wind']},
  {id:2, name:'หนองบัวแดง', en:'Red Lotus Marsh', lv:[20, 30], biome:'marsh', mobs:['goldfrog', 'giantleech', 'egret', 'paddycrab', 'paddyturtle', 'lotusjelly', 'waterwraith'], boss:'lotusturtle', wx:.18, wy:.78,
    desc:['บึงบัวแดงกว้างสุดตา', 'A marsh of red lotus as far as the eye can see']},
  {id:3, name:'ริมน้ำเจ้าพระยา', en:'Chao Phraya Riverside', lv:[28, 38], biome:'river', mobs:['watermonitor', 'riverotter', 'forestcobra', 'firekingfisher', 'wildbuffalo', 'waterbug'], boss:'aikhiam', wx:.3, wy:.68,
    desc:['ตลิ่งแม่น้ำ ต้นจาก และควายป่า', 'River banks, nipa palms and wild buffalo']},
  {id:4, name:'ตลาดน้ำร้าง', en:'Abandoned Floating Market', lv:[36, 46], biome:'floatmarket', mobs:['boatscarecrow', 'phantommerchant', 'boatlamp', 'pierrat', 'watersnake', 'sabercrab'], boss:'marketmatron', wx:.47, wy:.72,
    desc:['ท่าเรือไม้ผุ เรือร้าง และตะเกียงหลอน', 'Rotting piers, empty boats and haunted lamps']},
  {id:5, name:'วัดร้างกลางป่า', en:'Forest Temple Ruins', lv:[44, 54], biome:'templeruins', mobs:['stuccoyaksha', 'stonesingha', 'chapelbat', 'lankypreta', 'goldgecko', 'offeringsquirrel', 'templelantern'], boss:'dvarapala', wx:.62, wy:.66,
    desc:['เจดีย์ร้างที่รากไม้โอบไว้', 'Crumbling chedi wrapped in roots']},
  {id:6, name:'ถ้ำหินปูนเชียงดาว', en:'Chiang Dao Caves', lv:[52, 62], biome:'cave', mobs:['vampirebat', 'giantscorpion', 'cavespider', 'stalagwalker', 'firemillipede', 'minerspirit'], boss:'cavematriarch', wx:.78, wy:.6,
    desc:['ถ้ำหินงอกหินย้อยที่มืดสนิท', 'Pitch-dark caverns of stalactites']},
  {id:7, name:'ดอยหมอก', en:'Misty Highlands', lv:[60, 70], biome:'highland', mobs:['serow', 'blackbear', 'cloudedleopard', 'hornbill', 'mistspirit', 'kongkoi'], boss:'saming', wx:.86, wy:.5,
    desc:['ดอยสูง ป่าสน และทะเลหมอก', 'High peaks, pine forest and a sea of mist']},
  {id:8, name:'ป่าช้าวัดเก่า', en:'Old Temple Cemetery', lv:[68, 78], biome:'cemetery', mobs:['krasue', 'krahang', 'phipop', 'skelsoldier', 'omencrow', 'vengefulshade', 'hauntedurn'], boss:'elderpop', wx:.72, wy:.47,
    desc:['ป่าช้าที่ผีออกทุกคืน', 'A graveyard where ghosts walk every night']},
  {id:9, name:'ทุ่งกุลาร้องไห้', en:'The Weeping Plains', lv:[76, 86], biome:'dryplain', mobs:['banteng', 'vulture', 'kingcobra', 'sandscorpion', 'dustdevil', 'isanscarecrow'], boss:'khankhak', wx:.57, wy:.52,
    desc:['ทุ่งแล้งแห่งอีสาน ฝุ่นตลบ', 'The parched plains of Isan, thick with dust']},
  {id:10, name:'ปราสาทหินขอมโบราณ', en:'Ancient Khmer Sanctuary', lv:[84, 94], biome:'khmer', mobs:['stonenaga', 'khmerlion', 'stoneapsara', 'khmerghost', 'carvedmonkey', 'sanctuarybat'], boss:'templecolossus', wx:.42, wy:.55,
    desc:['ปรางค์ศิลาแลงบนเนินเขา', 'Laterite prangs on a sacred hill']},
  {id:11, name:'ชายฝั่งอันดามัน', en:'Andaman Coast', lv:[92, 102], biome:'beach', mobs:['ghostcrab', 'hermitcrab', 'leatherback', 'pirategull', 'seakrait', 'walkcoral', 'firejelly'], boss:'andamancrab', wx:.15, wy:.55,
    desc:['หาดทรายขาว น้ำทะเลสีมรกต', 'White sand and emerald sea']},
  {id:12, name:'เกาะผีเสื้อสมุทร', en:'Sea-Ogress Isle', lv:[100, 110], biome:'isle', mobs:['lostmermaid', 'maninmangkon', 'giantclam', 'giantsquid', 'seawraith', 'seaserpent'], boss:'seaogress', wx:.08, wy:.42,
    desc:['เกาะกลางทะเลของนางผีเสื้อสมุทร', 'The island of the Sea Ogress']},
  {id:13, name:'กรุงเก่าอโยธยา', en:'Ruins of Ayodhya', lv:[108, 118], biome:'ayodhya', mobs:['ghosthorse', 'ghostelephant', 'ayutsoldier', 'celadonjar', 'whiteraven', 'treasurespirit', 'vaultpython', 'ayutyaksha', 'krahangluang', 'moatkappa', 'nangtani'], boss:'phantomgeneral', wx:.27, wy:.4,
    desc:['ซากกรุงเก่าที่ทหารผียังเฝ้าอยู่', 'The old capital, still guarded by ghost soldiers']},
  {id:14, name:'ป่าหิมพานต์ชั้นนอก', en:'Outer Himmapan', lv:[116, 126], biome:'himmapan', mobs:['kilen', 'kotchasi', 'karawek', 'wingedhorse', 'goldsingha', 'kinnorn'], boss:'lordkotchasi', wx:.42, wy:.33,
    desc:['ป่าในตำนานที่สัตว์หิมพานต์อาศัย', 'The legendary forest of mythical beasts']},
  {id:15, name:'สระอโนดาต', en:'Lake Anodat', lv:[124, 136], biome:'anodat', mobs:['goldhamsa', 'matchanu', 'lakenaga', 'skylotus', 'waterelephant', 'goldshrimp'], boss:'waterelephantking', wx:.6, wy:.36,
    desc:['สระศักดิ์สิทธิ์ใจกลางหิมพานต์', 'The sacred lake at the heart of Himmapan']},
  {id:16, name:'เมืองลับแล', en:'Hidden City of Laplae', lv:[134, 146], biome:'laplae', mobs:['laplaefolk', 'spiritkoel', 'misttiger', 'wanderdurian', 'woodsentinel', 'laplaemist'], boss:'laplaelord', wx:.78, wy:.32,
    desc:['เมืองที่ซ่อนอยู่ในม่านหมอก', 'A city hidden behind a veil of mist']},
  {id:17, name:'บาดาลนาคา', en:'Naga Underworld', lv:[146, 158], biome:'badan', mobs:['nagaretainer', 'nagawarrior', 'abyssjelly', 'emeraldcrab', 'thundereel', 'spiritpearl', 'abyssturtle'], boss:'nagaking', wx:.9, wy:.22,
    desc:['เมืองบาดาลของพญานาค แสงผลึกเขียวมรกต', 'The underworld of the nagas, lit by emerald crystal']},
  {id:18, name:'ป่าหิมพานต์ชั้นใน', en:'Inner Himmapan', lv:[158, 170], biome:'innerhim', mobs:['thaktho', 'kraisorn', 'sakuna', 'asurabird', 'himogre', 'hemaraj', 'wingednaga'], boss:'tenfacedogre', wx:.68, wy:.18,
    desc:['ชั้นในสุดของหิมพานต์ ที่อสูรครอง', 'The deepest Himmapan, ruled by demons']},
  {id:19, name:'เขาไกรลาส', en:'Mount Kailash', lv:[170, 185], biome:'kailash', mobs:['snowsingha', 'gandharva', 'younggaruda', 'frostyaksha', 'icesentinel', 'snowdeva'], boss:'garudaking', wx:.47, wy:.13,
    desc:['ภูเขาหิมะอันศักดิ์สิทธิ์', 'The sacred snow mountain']},
  {id:20, name:'เขาพระสุเมรุ', en:'Mount Meru', lv:[185, 200], biome:'meru', mobs:['guardiandeva', 'youngerawan', 'goldkinnaree', 'celestialsingha', 'goldnaga', 'asura', 'goldgaruda', 'fallenstar'], boss:'vessavana', wx:.3, wy:.06,
    desc:['ยอดเขาจักรวาล ประตูสู่สวรรค์', 'The axis of the world, gate of heaven']}
];

/* the two extra species of the starting fields */
SPECIES.push(
  ['kaipa', 'ไก่ป่าตุ้มหูแดง', 'Red Junglefowl', 6, 'bird', {body:'#c4582c', wing:'#3a5a2a', belly:'#2a2420', tailCol:'#1a2a3a', crest:'#e03a2a', mantle:'#e8a030', tail:'fan', fly:false, size:.85}, 'fire', 'brute', 's', {}],
  ['kobna', 'กบนา', 'Paddy Frog', 3, 'squat', {skin:'#7a8a4a', belly:'#e8e0b0', kind:'frog', warts:true, size:.85}, 'water', 'fish', 's', {}]
);

/* ---------- ten more regions (ids 21–30) — levels are filled in by the layout below ---------- */
SPECIES.push(
  // 21 ทะเลทรายสุริยัน
  ['sandlizard', 'กิ้งก่าทะเลทราย', 'Dune Lizard', 0, 'quad', {skin:'#c8a060', belly:'#f0dca8', stripe:'#8a6a3a', head:'lizard', len:1.1, leg:.6, girth:.85}, 'earth', 'brute', 's', {k:{spd:12}}],
  ['dunevulture', 'แร้งทะเลทราย', 'Dune Vulture', 0, 'bird', {body:'#f0ece0', wing:'#2a2420', belly:'#f4f0e4', headCol:'#f0c040', beak:'#e8b040', hook:true, size:1.1}, 'wind', 'brute', 'm', {aggro:true}],
  ['sandworm', 'หนอนทรายยักษ์', 'Giant Sandworm', 0, 'serpent', {skin:'#d8b878', belly:'#b8985a', grub:true, len:1.3, rise:6, thick:1.4}, 'earth', 'insect', 'l', {k:{hp:1.5, spd:-8}}],
  ['goldscarab', 'ด้วงสุริยะทองคำ', 'Golden Sun Scarab', 0, 'bug', {shell:'#e3b04b', leg:'#6a4a1a', acc:'#f8e070', kind:'beetle'}, 'fire', 'insect', 's', {k:{def:1.6}}],
  ['sandgolem', 'หุ่นทรายเดินได้', 'Sand Golem', 0, 'rock', {col:'#d8bc80', acc:'#b89a5a', eye:'#ffd36a', strata:true, bulk:.92}, 'earth', 'formless', 'm', {k:{def:2, hp:1.3, spd:-10}}],
  ['mirage', 'ภาพลวงตาทะเลทราย', 'Desert Mirage', 0, 'floater', {col:'#fff0b8', kind:'wisp', bands:true, tails:0, dark:'#8a6a3a'}, 'fire', 'formless', 's', {range:130, shot:'fire', night:true}],
  // 22 ผาหินแดง
  ['redpuma', 'เสือผาแดง', 'Red Cliff Puma', 0, 'quad', {skin:'#b8643a', belly:'#f0d0a8', head:'cat', len:1.05, eyeGlow:'#ffd36a'}, 'fire', 'brute', 'm', {aggro:true, k:{spd:16, atk:1.15}}],
  ['rockhawk', 'เหยี่ยวเพเรกรินผาแดง', 'Red Cliff Peregrine', 0, 'bird', {body:'#4a5260', wing:'#3a4250', belly:'#ece4d4', bars:'#3a3a44', beak:'#e8c050', hook:true}, 'wind', 'brute', 's', {range:140, shot:'dart'}],
  ['rattleviper', 'งูกะปะผาแดง', 'Red Rock Viper', 0, 'serpent', {skin:'#a84a2a', belly:'#e8b880', stripe:'#5a2010', len:1}, 'earth', 'brute', 's', {aggro:true, k:{atk:1.2}}],
  ['canyonspider', 'ต่อหัวเสือหุบเขา', 'Canyon Tiger Hornet', 0, 'bug', {shell:'#d88a2a', leg:'#5a3018', acc:'#3a1e10', kind:'hornet'}, 'earth', 'insect', 'm', {aggro:true}],
  ['redgolem', 'หินแดงเดินได้', 'Red Rock Golem', 0, 'rock', {col:'#b85a3a', acc:'#8a3a22', eye:'#ffb04a', strata:true, bulk:1.1}, 'earth', 'formless', 'l', {k:{def:2.2, hp:1.4, spd:-12}}],
  ['banditghost', 'วิญญาณโจรผา', 'Canyon Bandit Shade', 0, 'human', {skin:'#c8b8a8', top:'#6a2a1a', pants:'#3a2a1a', hair:'#2a1a1a', hat:'headwrap', weapon:'sword', iris:'irisGr'}, 'shadow', 'undead', 'm', {aggro:true}],
  // 23 ทุ่งลาวา
  ['magmaslime', 'เจลลี่แมกมา', 'Magma Slime', 0, 'slime', {col:'#ff6a2a', emissive:true, top:'leaf', topCol:'#ffd04a'}, 'fire', 'formless', 's', {}],
  ['firelizard', 'ซาลาแมนเดอร์ไฟ', 'Fire Salamander', 0, 'quad', {skin:'#c83a1a', belly:'#ffb04a', stripe:'#ffd04a', head:'lizard', len:1.2, leg:.55, eyeGlow:'#ffd04a'}, 'fire', 'dragon', 'm', {aggro:true}],
  ['ashbat', 'ค้างคาวเถ้าถ่าน', 'Cinder Bat', 0, 'bird', {body:'#3a2a2a', wing:'#5a2a1a', bat:true, eyeGlow:'#ff8a2a', wingGlow:'#ff6a1a'}, 'fire', 'brute', 's', {aggro:true, k:{spd:18}}],
  ['lavaserpent', 'งูลาวา', 'Lava Serpent', 0, 'serpent', {skin:'#2a1a1a', belly:'#ff6a1a', stripe:'#ffb04a', len:1.2, rise:8}, 'fire', 'dragon', 'm', {range:120, shot:'fire'}],
  ['cinderimp', 'ภูตไฟจอมซน', 'Cinder Imp', 0, 'human', {skin:'#d84a2a', top:'#3a1a1a', pants:'#2a1010', hair:'#ff8a2a', horns:'#2a1a1a', fangs:true, short:true, spikes:12, iris:'irisGr'}, 'fire', 'demon', 's', {aggro:true, k:{spd:14}}],
  ['embergolem', 'หินถ่านเพลิง', 'Ember Golem', 0, 'rock', {col:'#3a2a26', acc:'#ff6a1a', eye:'#ffd04a', veins:'#ff6a1a'}, 'fire', 'formless', 'l', {k:{def:2, hp:1.4, spd:-10}}],
  // 24 ป่าเถ้าถ่าน
  ['ashwolf', 'หมาป่าเถ้า', 'Ash Wolf', 0, 'quad', {skin:'#6a6464', belly:'#a8a0a0', head:'dog', len:1, eyeGlow:'#ff6a2a'}, 'fire', 'brute', 'm', {aggro:true, k:{spd:14}}],
  ['charredent', 'ตอไม้ไหม้เดินได้', 'Charred Treant', 0, 'rock', {col:'#2a2420', acc:'#ff6a1a', eye:'#ffb04a', tree:true}, 'earth', 'plant', 'l', {k:{hp:1.5, def:1.6, spd:-12}}],
  ['smokewisp', 'วิญญาณควันไฟ', 'Smoke Wisp', 0, 'floater', {col:'#8a8484', kind:'wisp', puffs:true, tails:1, emissive:false, dark:'#1a1414'}, 'shadow', 'formless', 's', {range:120, shot:'fire'}],
  ['cinderbeetle', 'ด้วงถ่านแดง', 'Cinder Beetle', 0, 'bug', {shell:'#2a1a1a', leg:'#1a1010', acc:'#ff6a1a', kind:'beetle'}, 'fire', 'insect', 's', {k:{def:1.6}}],
  ['phoenixchick', 'ลูกนกเพลิง', 'Phoenix Chick', 0, 'bird', {body:'#ff6a1a', wing:'#ffb04a', belly:'#ffe08a', crest:'#ff3a1a', tail:'fan', tailCol:'#ffd04a'}, 'fire', 'angel', 's', {range:120, shot:'fire'}],
  ['ashghoul', 'ผีเถ้าถ่าน', 'Ash Ghoul', 0, 'human', {skin:'#5a5450', top:'#2a2420', pants:'#1a1614', hair:'#8a8480', longHair:true, fangs:true, iris:'irisGr'}, 'shadow', 'undead', 'm', {aggro:true, night:true}],
  // 25 ปล่องภูเขาไฟอัคนี
  ['lavadrake', 'มังกรลาวาน้อย', 'Lava Drake', 0, 'quad', {skin:'#8a1a10', belly:'#ff8a2a', stripe:'#ffd04a', head:'croc', len:1.3, leg:.6, girth:1.1, eyeGlow:'#ffd04a'}, 'fire', 'dragon', 'l', {aggro:true, k:{hp:1.4, atk:1.2}}],
  ['firedjinn', 'ญินเพลิง', 'Flame Djinn', 0, 'floater', {col:'#ff8a2a', kind:'mask', glow:'#ffd04a', dark:'#8a1a10', tails:5}, 'fire', 'demon', 'm', {range:140, shot:'fire'}],
  ['magmatoad', 'คางคกแมกมา', 'Magma Toad', 0, 'squat', {skin:'#4a2a20', belly:'#ff8a2a', stripe:'#ffd04a', kind:'toad', warts:true}, 'fire', 'brute', 'm', {k:{hp:1.3}}],
  ['flamegaruda', 'ครุฑเพลิงน้อย', 'Young Flame Garuda', 0, 'bird', {body:'#e83a1a', wing:'#ffb04a', belly:'#ffe08a', beak:'#e3b04b', crest:'#ffd04a', hook:true, size:1.2, wingGlow:'#ffe08a'}, 'fire', 'angel', 'm', {aggro:true}],
  ['obsidiangolem', 'หินออบซิเดียน', 'Obsidian Golem', 0, 'rock', {col:'#1a1620', acc:'#6a3a8a', eye:'#ff6a2a', crystals:'#8a5ac8', glowCrystal:true, bulk:1.05}, 'fire', 'formless', 'l', {k:{def:2.6, hp:1.5, spd:-12}}],
  ['agnipriest', 'นักบวชอัคนี', 'Agni Priest', 0, 'human', {skin:'#c87a4a', top:'#c83a1a', pants:'#8a1a10', hair:'#1a1a1a', hat:'lomphok', hatCol:'#ffb04a', weapon:'staff', iris:'irisGr'}, 'fire', 'human', 'm', {range:150, shot:'fire'}],
  // 26 ทะเลสาบน้ำแข็ง
  ['frosttoad', 'คางคกน้ำแข็ง', 'Frost Toad', 0, 'squat', {skin:'#7ab0d8', belly:'#e8f4ff', stripe:'#c8e0f0', kind:'toad'}, 'water', 'fish', 's', {}],
  ['snowfox', 'จิ้งจอกหิมะ', 'Snow Fox', 0, 'quad', {skin:'#f4f8ff', belly:'#ffffff', head:'dog', len:.9, eyeGlow:'#7ae0ff', tuft:true}, 'water', 'brute', 's', {aggro:true, k:{spd:16}}],
  ['icefisher', 'นกกระเต็นน้ำแข็ง', 'Ice Kingfisher', 0, 'bird', {body:'#4a8ac8', wing:'#2a5a9a', belly:'#f0f4f8', beak:'#2a2a2a', tail:'short', beakLen:1.5, size:.9}, 'water', 'brute', 'm', {}],
  ['frostjelly', 'เจลลี่น้ำแข็ง', 'Frost Jelly', 0, 'slime', {col:'#a8e0ff', emissive:true, spikes:true, topCol:'#e8f8ff'}, 'water', 'formless', 's', {range:110, shot:'ice'}],
  ['snowowl', 'นกเค้าหิมะ', 'Snow Owl', 0, 'bird', {body:'#f4f8ff', wing:'#d8e4f0', belly:'#ffffff', bars:'#5a5a64', beak:'#3a3a3a', tail:'short'}, 'wind', 'brute', 's', {range:130, shot:'ice'}],
  ['icecrab', 'ปูน้ำแข็ง', 'Ice Crab', 0, 'bug', {shell:'#7ab0e0', leg:'#5a8ac0', acc:'#e8f8ff', kind:'crab', bigClaw:true}, 'water', 'fish', 'm', {k:{def:1.8}}],
  // 27 ถ้ำน้ำแข็งนิรันดร์
  ['icebat', 'ค้างคาวน้ำแข็ง', 'Ice Bat', 0, 'bird', {body:'#5a7a9a', wing:'#3a5a7a', bat:true, eyeGlow:'#7ae0ff', wingGlow:'#c8f4ff', ears:1.3}, 'water', 'brute', 's', {aggro:true, k:{spd:18}}],
  ['frostspider', 'แตนผลึกน้ำแข็ง', 'Crystal Frost Wasp', 0, 'bug', {shell:'#a8d0f0', leg:'#5a88b0', acc:'#2a4a6a', kind:'wasp', eyeGlow:'#7ae0ff'}, 'water', 'insect', 'm', {aggro:true}],
  ['crystalgolem', 'หุ่นผลึกน้ำแข็ง', 'Crystal Golem', 0, 'rock', {col:'#c8e8f8', acc:'#7ab8e0', eye:'#7ae0ff', crystals:'#e8f8ff', bulk:.95}, 'water', 'formless', 'l', {k:{def:2.4, hp:1.4, spd:-12}}],
  ['iceworm', 'หนอนน้ำแข็ง', 'Ice Worm', 0, 'serpent', {skin:'#e8f4ff', belly:'#c8dce8', grub:true, len:1.1, rise:5}, 'water', 'insect', 'm', {k:{hp:1.3, spd:-6}}],
  ['frostwisp', 'วิญญาณเยือกแข็ง', 'Frost Wisp', 0, 'floater', {col:'#c8f0ff', kind:'wisp', spikes:true, glow:'#e8fbff', dark:'#2a4a6a'}, 'water', 'formless', 's', {range:130, shot:'ice'}],
  ['yeti', 'มนุษย์หิมะ', 'Yeti', 0, 'human', {skin:'#f4f8ff', top:'#e8f0f8', pants:'#d8e4f0', hair:'#ffffff', fangs:true, spikes:16, spikeLen:5, iris:'irisBl'}, 'water', 'brute', 'l', {aggro:true, scale:1.3, fs:96, k:{hp:1.5, atk:1.2}}],
  // 28 ธารน้ำแข็งพันปี
  ['mammoth', 'ช้างแมมมอธ', 'Woolly Mammoth', 0, 'quad', {skin:'#6a4a32', belly:'#8a6a4a', acc:'#f4ecd8', mane:'#5a3a22', head:'elephant', tusks:'curved', girth:1.35, shaggy:true}, 'earth', 'brute', 'l', {k:{hp:1.7, spd:-6}}],
  ['icewolf', 'หมาป่าน้ำแข็ง', 'Glacier Wolf', 0, 'quad', {skin:'#c8d8e8', belly:'#f4f8ff', head:'dog', len:1.05, eyeGlow:'#7ae0ff'}, 'water', 'brute', 'm', {aggro:true, k:{spd:16}}],
  ['glacierhawk', 'อินทรีธารน้ำแข็ง', 'Glacier Eagle', 0, 'bird', {body:'#3a2e28', wing:'#3a2e28', belly:'#3a2e28', tailCol:'#f4f4f0', tail:'long', mantle:'#f4f4f0', beak:'#f0b030', beakW:1.5, hook:true, size:1.25}, 'wind', 'brute', 'm', {range:140, shot:'ice'}],
  ['frostgiant', 'ยักษ์ธารน้ำแข็ง', 'Glacier Giant', 0, 'human', {skin:'#8ab8d8', top:'#5a7a9a', pants:'#3a5a7a', hair:'#e8f0f8', beard:true, weapon:'sword', iris:'irisBl'}, 'water', 'demon', 'l', {aggro:true, scale:1.35, fs:96, k:{hp:1.5, atk:1.25}}],
  ['iceslime', 'เมือกน้ำแข็งใส', 'Clear Ice Ooze', 0, 'slime', {col:'#e8f8ff', topCol:'#a8d8f0'}, 'water', 'formless', 's', {}],
  ['icewyrm', 'นาคน้ำแข็ง', 'Ice Wyrm', 0, 'serpent', {skin:'#a8d0f0', belly:'#f4f8ff', hood:'#7ab0e0', len:1.3, rise:12, thick:1.2, eyeGlow:'#7ae0ff'}, 'water', 'dragon', 'l', {k:{hp:1.4}}],
  // 29 ป้อมน้ำแข็งพญาหิมะ
  ['frostknight', 'หมีขาวป้อมน้ำแข็ง', 'Citadel Polar Bear', 0, 'quad', {skin:'#ecf0f2', muzzle:'#c8ccd0', head:'bear', girth:1.3, len:1.05, shaggy:true}, 'water', 'brute', 'l', {aggro:true, k:{def:1.6}}],
  ['icegargoyle', 'การ์กอยล์น้ำแข็ง', 'Ice Gargoyle', 0, 'bird', {body:'#7a8a9a', wing:'#5a6a7a', bat:true, eyeGlow:'#7ae0ff', size:1.3, horns:'#c8e0f0', snout:true}, 'water', 'formless', 'm', {aggro:true, k:{def:1.8}}],
  ['snowlion', 'สิงโตหิมะแผงคราม', 'Turquoise-maned Snow Lion', 0, 'quad', {skin:'#f4f8ff', belly:'#e8f0f8', mane:'#3ac8b0', ruff:true, head:'cat', tuft:true, shaggy:true}, 'water', 'dragon', 'l', {aggro:true, k:{atk:1.25}}],
  ['frostwraith', 'วิญญาณป้อมน้ำแข็ง', 'Citadel Wraith', 0, 'floater', {col:'#6a8ac8', kind:'wisp', hood:true, spikes:true, dark:'#1a2a4a', glow:'#e8f8ff', tails:5}, 'shadow', 'undead', 's', {range:140, shot:'ice', night:true}],
  ['icesentry', 'ทหารผลึกเฝ้าป้อม', 'Crystal Sentry', 0, 'rock', {col:'#d8f0ff', acc:'#8ac0e8', eye:'#ffffff', veins:'#7ae0ff', form:'spire'}, 'water', 'formless', 'm', {k:{def:2.4, hp:1.3, spd:-10}}],
  ['frostnaga', 'นาคราชหิมะ', 'Snow Naga', 0, 'serpent', {skin:'#e8f4ff', belly:'#a8d0f0', hood:'#c8e0f0', crown:true, len:1.3, rise:14, eyeGlow:'#7ae0ff'}, 'water', 'dragon', 'l', {range:130, shot:'ice'}],
  // 30 ประตูสวรรค์ดาวดึงส์
  ['devaguard', 'เทวดาเฝ้าประตู', 'Gate Deva', 0, 'human', {skin:'#f8e8c8', top:'#e3b04b', pants:'#f8f0e0', hair:'#1a1a1a', hat:'lomphok', hatCol:'#f0d070', weapon:'sword', cape:'#f0d070', iris:'irisBr'}, 'holy', 'angel', 'm', {k:{def:1.5}}],
  ['airavata', 'ช้างเอราวัณสามเศียร', 'Airavata', 0, 'quad', {skin:'#ffffff', belly:'#f0f0f8', acc:'#e3b04b', head:'elephant', tusks:true, crown:true, girth:1.4, heads:3}, 'holy', 'angel', 'l', {k:{hp:1.8, spd:-5}}],
  ['heavenhamsa', 'หงส์สวรรค์', 'Heavenly Hamsa', 0, 'bird', {body:'#fff8e8', wing:'#f0d070', belly:'#ffffff', beak:'#e3b04b', tail:'fan', tailCol:'#f0d070', size:1.2}, 'holy', 'angel', 'm', {range:140, shot:'holy'}],
  ['lightjelly', 'ดวงแก้วสวรรค์', 'Celestial Orb', 0, 'slime', {col:'#fff4c0', emissive:true, top:'halo'}, 'holy', 'formless', 's', {range:120, shot:'holy'}],
  ['celestialnaga', 'นาคสวรรค์', 'Celestial Naga', 0, 'serpent', {skin:'#f0d070', belly:'#fff4c0', hood:'#e3b04b', crown:true, crest:'#fff4c0', len:1.4, rise:14, eyeGlow:'#ffffff'}, 'holy', 'dragon', 'l', {k:{hp:1.4}}],
  ['starwisp', 'ดาวตกน้อย', 'Little Fallen Star', 0, 'floater', {col:'#fff8d0', kind:'star', size:.8, tails:1, dark:'#6a5a2a'}, 'holy', 'formless', 's', {range:130, shot:'holy'}]
);
BOSSES.push(
  ['scorpionking', 'ราชาแมงป่องทราย', 'Sand Scorpion King', 0, 'bug', {shell:'#c8902a', leg:'#8a5a1a', acc:'#f8d060', kind:'scorpion', eyeGlow:'#ff6a2a'}, 'earth', 'insect', ['charge', 'field', 'quake', 'enrage']],
  ['redcliffgiant', 'ยักษ์ผาแดง', 'Red Cliff Giant', 0, 'human', {skin:'#a84a2a', top:'#6a2a1a', pants:'#3a1a10', hair:'#1a1a1a', fangs:true, horns:'#e8d8c0', weapon:'sword', iris:'irisGr'}, 'earth', 'demon', ['slam', 'wave', 'summon', 'enrage']],
  ['firenaga', 'พญานาคเพลิง', 'Fire Naga Lord', 0, 'serpent', {skin:'#8a1a10', belly:'#ffb04a', hood:'#c83a1a', crown:true, heads:3, spread:2, len:1.5, rise:16, thick:1.3, eyeGlow:'#ffd04a'}, 'fire', 'dragon', ['meteor', 'field', 'barrage', 'enrage']],
  ['ashwolfking', 'ราชาหมาป่าเถ้า', 'Ash Wolf King', 0, 'quad', {skin:'#4a4444', belly:'#8a8080', mane:'#ff6a1a', ruff:true, head:'dog', girth:1.25, eyeGlow:'#ff6a1a'}, 'fire', 'brute', ['charge', 'summon', 'roar', 'enrage']],
  ['agnilord', 'จอมเวทอัคนี', 'Agni, Lord of the Crater', 0, 'human', {skin:'#c83a1a', top:'#ffb04a', pants:'#8a1a10', hair:'#ffd04a', hat:'lomphok', hatCol:'#ffd04a', horns:'#2a1a1a', weapon:'staff', cape:'#c83a1a', iris:'irisGr'}, 'fire', 'demon', ['meteor', 'wave', 'teleport', 'field', 'enrage']],
  ['iceturtlelord', 'พญาเต่าน้ำแข็ง', 'Ice Turtle Lord', 0, 'squat', {skin:'#7ab0d8', shell:'#c8e8f8', belly:'#f4f8ff', kind:'turtle', size:1.3}, 'water', 'brute', ['quake', 'heal', 'barrage']],
  ['frostqueen', 'ราชินีผึ้งน้ำแข็ง', 'Frost Bee Queen', 0, 'bug', {shell:'#d8f0ff', leg:'#3a6a9a', acc:'#2a4a7a', kind:'bee', eyeGlow:'#7ae0ff', crown:true}, 'water', 'insect', ['field', 'summon', 'barrage', 'teleport']],
  ['mammothking', 'พญาช้างแมมมอธ', 'Mammoth King', 0, 'quad', {skin:'#4a2e1c', belly:'#6a4a32', acc:'#f4ecd8', mane:'#c8c0b0', head:'elephant', tusks:'curved', crown:true, girth:1.45, shaggy:true, eyeGlow:'#7ae0ff'}, 'earth', 'brute', ['charge', 'quake', 'roar', 'enrage']],
  ['snowking', 'พญาหิมะ', 'The Snow King', 0, 'human', {skin:'#c8e0f0', top:'#e8f4ff', pants:'#7aa8d0', hair:'#ffffff', hat:'lomphok', hatCol:'#c8e8f8', beard:true, weapon:'sword', cape:'#a8d0f0', iris:'irisBl'}, 'water', 'demon', ['wave', 'barrage', 'summon', 'heal', 'enrage']],
  ['asuraking', 'ราชาอสูรไวรา', 'Vaira, the Asura King', 0, 'human', {skin:'#8a1a2a', top:'#1a0a10', pants:'#0a0508', hair:'#1a1a1a', fangs:true, horns:'#f0d070', hornLen:4, weapon:'sword', cape:'#2a0a14', iris:'irisVi'}, 'shadow', 'demon', ['meteor', 'teleport', 'summon', 'wave', 'heal', 'enrage']]
);
MAPS.push(
  {id:21, name:'ทะเลทรายสุริยัน', en:'Sun-scorched Dunes', lv:[0, 0], biome:'desert', mobs:['sandlizard', 'dunevulture', 'sandworm', 'goldscarab', 'sandgolem', 'mirage'], boss:'scorpionking', desc:['เนินทรายทองที่แดดแผดเผาไม่เคยหยุด', 'Golden dunes under a sun that never rests']},
  {id:22, name:'ผาหินแดง', en:'Red Rock Canyon', lv:[0, 0], biome:'canyon', mobs:['redpuma', 'rockhawk', 'rattleviper', 'canyonspider', 'redgolem', 'banditghost'], boss:'redcliffgiant', desc:['หุบผาสีเลือดที่โจรผีซุ่มรอ', 'Blood-red cliffs where ghost bandits lie in wait']},
  {id:23, name:'ทุ่งลาวา', en:'Lava Fields', lv:[0, 0], biome:'lavafield', mobs:['magmaslime', 'firelizard', 'ashbat', 'lavaserpent', 'cinderimp', 'embergolem'], boss:'firenaga', desc:['พื้นหินดำที่ลาวาไหลเป็นสาย', 'Black rock veined with rivers of lava']},
  {id:24, name:'ป่าเถ้าถ่าน', en:'Ashen Forest', lv:[0, 0], biome:'ashforest', mobs:['ashwolf', 'charredent', 'smokewisp', 'cinderbeetle', 'phoenixchick', 'ashghoul'], boss:'ashwolfking', desc:['ป่าที่ถูกไฟเผาจนเหลือแต่ตอและเถ้า', 'A forest burned to stumps and drifting ash']},
  {id:25, name:'ปล่องภูเขาไฟอัคนี', en:'Agni Crater', lv:[0, 0], biome:'crater', mobs:['lavadrake', 'firedjinn', 'magmatoad', 'flamegaruda', 'obsidiangolem', 'agnipriest'], boss:'agnilord', desc:['ปากปล่องภูเขาไฟที่เดือดพล่าน', 'The boiling mouth of the volcano']},
  {id:26, name:'ทะเลสาบน้ำแข็ง', en:'Frozen Lake', lv:[0, 0], biome:'frozenlake', mobs:['frosttoad', 'snowfox', 'icefisher', 'frostjelly', 'snowowl', 'icecrab'], boss:'iceturtlelord', desc:['ทะเลสาบที่แข็งตัวทั้งปี', 'A lake frozen through every season']},
  {id:27, name:'ถ้ำน้ำแข็งนิรันดร์', en:'Eternal Ice Cave', lv:[0, 0], biome:'icecave', mobs:['icebat', 'frostspider', 'crystalgolem', 'iceworm', 'frostwisp', 'yeti'], boss:'frostqueen', desc:['ถ้ำผลึกน้ำแข็งที่ไม่เคยละลาย', 'Caverns of crystal ice that never melts']},
  {id:28, name:'ธารน้ำแข็งพันปี', en:'Millennial Glacier', lv:[0, 0], biome:'glacier', mobs:['mammoth', 'icewolf', 'glacierhawk', 'frostgiant', 'iceslime', 'icewyrm'], boss:'mammothking', desc:['ธารน้ำแข็งที่ไหลช้ามาพันปี', 'A glacier that has crept for a thousand years']},
  {id:29, name:'ป้อมน้ำแข็งพญาหิมะ', en:'Citadel of the Snow King', lv:[0, 0], biome:'frostcitadel', mobs:['frostknight', 'icegargoyle', 'snowlion', 'frostwraith', 'icesentry', 'frostnaga'], boss:'snowking', desc:['ป้อมปราการน้ำแข็งบนยอดเขาเหนือเมฆ', 'An ice fortress above the clouds']},
  {id:30, name:'ประตูสวรรค์ดาวดึงส์', en:'Gate of Tavatimsa', lv:[0, 0], biome:'tavatimsa', mobs:['devaguard', 'airavata', 'heavenhamsa', 'lightjelly', 'celestialnaga', 'starwisp'], boss:'asuraking', desc:['ประตูสวรรค์ที่ราชาอสูรบุกขึ้นมา', 'The gate of heaven, stormed by the Asura King']}
);

/* ---------- the realm's layout ----------
   The capital Aren (map 0) sits in the middle. Four roads leave it: east through the fertile lands (Lv 5–75),
   south through the arid lands into the volcano (Lv 70–163), west into the frozen lands (Lv 150–235) and north
   through the lands of darkness up to the lands of light (Lv 210–300). Each map links back toward the capital and
   on to the next one; levels rise the farther you go. */
const LANDS = {
  capital:['นครหลวง', 'Capital', '#e3b04b'], fertile:['ดินแดนอุดมสมบูรณ์', 'Fertile Lands', '#5aa84a'], arid:['ดินแดนแห้งแล้ง', 'Arid Lands', '#d0a050'],
  volcanic:['ดินแดนภูเขาไฟ', 'Volcanic Lands', '#e0502a'], frozen:['ดินแดนเหน็บหนาว', 'Frozen Lands', '#6ab0e0'], dark:['ดินแดนแห่งความมืด', 'Lands of Darkness', '#8a5ab0'], light:['ดินแดนแห่งแสงสว่าง', 'Lands of Light', '#f0d070']};
const ROADS = {e:[1, 2, 3, 4, 11, 12, 15], s:[9, 10, 13, 21, 22, 23, 24, 25], w:[7, 26, 27, 28, 19, 29], n:[5, 6, 8, 16, 17, 18, 14, 20, 30]};
/* (v253) maps end at Lv 300, the hero's top level (they were stretched to 350: seven maps sat above anything a hero
   could reach). Levels are the raw ones again: east 5–74, south 70–160, west 150–214, north 210–300. EXP was always
   the raw level's (LVINV), so levelling speed is exactly as before; monsters past Lv 150 are now their own level's
   strength instead of the stretched one. Bosses stay a few levels above their map. */
const LVMAP = L => L;
const LVINV = L => L;
const ROAD_LV_RAW = {e:[[5, 15], [14, 24], [23, 33], [32, 42], [41, 52], [50, 62], [60, 74]],
  s:[[70, 82], [80, 92], [90, 102], [100, 112], [110, 122], [120, 134], [132, 146], [144, 160]],
  w:[[150, 162], [160, 172], [170, 182], [180, 192], [190, 202], [200, 214]],
  n:[[210, 220], [218, 228], [226, 236], [234, 244], [242, 252], [250, 262], [260, 272], [272, 286], [286, 300]]};
if (typeof WORLD_MORE === 'function') WORLD_MORE();   // v29: thirty more regions and three hundred more species (data/world3.js)
if (typeof WORLD_DRAGON === 'function') WORLD_DRAGON();   // dinosaurs past the east road, dragons & demons past the south road (data/world4.js)
/* (v294) วังบาดาล: the sea creatures of the drowned naga palace (the 'fish' body in gfx/beasts.js). They join the list only
   after the regions of world3/world4 have been generated from the roads' monsters, and at its end, so every older species
   keeps exactly the same generated relatives, card and order as before (saves, cards and quests stay valid) */
const CARD_LV_KEEP = {nagaretainer:249, nagawarrior:252, emeraldcrab:251, spiritpearl:250};   // (v294) the level their cards were dealt at before they moved maps
const SPECIES_LATE = new Set(['abyssshark', 'mantaray', 'giantpuffer', 'abyssangler', 'seahorseknight', 'lionfish', 'swordfish', 'abyssoctopus', 'armorlobster']);   // (systems that number species in turn put these last)
SPECIES.push(
  ['abyssshark', 'ฉลามบาดาล', 'Abyss Shark', 155, 'fish', {kind:'shark', col:'#4a6478', belly:'#e8eef2', fin:'#3e5668', size:1.1}, 'water', 'fish', 'l', {aggro:true, scale:1.15, k:{atk:1.25, spd:12}}],
  ['mantaray', 'ปลากระเบนราหู', 'Manta Ray', 151, 'fish', {kind:'manta', col:'#26303e', belly:'#eef2f4', stripe:'#d8e0e6', size:1.05}, 'water', 'fish', 'l', {k:{hp:1.4, spd:8}}],
  ['giantpuffer', 'ปลาปักเป้ายักษ์', 'Giant Pufferfish', 148, 'fish', {kind:'puffer', col:'#e0c060', belly:'#f8f4e0', fin:'#c89a3a', spot:'#5a4a2a'}, 'water', 'fish', 'm', {k:{def:1.8, hp:1.2, spd:-15}}],
  ['abyssangler', 'ปลาตกเบ็ดห้วงลึก', 'Abyssal Anglerfish', 157, 'fish', {kind:'angler', col:'#4c3a46', belly:'#8a7080', fin:'#2e2230', lure:'#9af0ff', eyeGlow:'#9af0ff'}, 'shadow', 'fish', 'm', {aggro:true, range:130, shot:'ice'}],
  ['seahorseknight', 'ม้าน้ำองครักษ์', 'Seahorse Sentinel', 150, 'fish', {kind:'seahorse', col:'#e0a040', belly:'#f4d890', fin:'#f0e0b0'}, 'water', 'fish', 's', {range:120, shot:'ice'}],
  ['lionfish', 'ปลาสิงโต', 'Lionfish', 149, 'fish', {kind:'lionfish', col:'#c8503a', belly:'#f4e8e0', stripe:'#f8f0ea', fin:'#e07a5a'}, 'shadow', 'fish', 's', {aggro:true, k:{atk:1.15}}],
  ['swordfish', 'ปลากระโทงดาบ', 'Swordfish', 153, 'fish', {kind:'swordfish', col:'#1a3aa0', belly:'#d8e4ee', fin:'#142a70', size:.95}, 'water', 'fish', 'm', {aggro:true, k:{spd:20, atk:1.2}}],
  ['abyssoctopus', 'ปลาหมึกยักษ์ห้วงลึก', 'Abyssal Octopus', 156, 'fish', {kind:'octopus', col:'#a84a5a', belly:'#f0c8c8', spot:'#7a2a3a', size:1.1}, 'water', 'fish', 'l', {range:120, shot:'dark', part:['หนวด', 'Tentacle'], k:{hp:1.4}}],
  ['armorlobster', 'กุ้งมังกรเกราะ', 'Armored Lobster', 152, 'bug', {kind:'shrimp', shell:'#c8402a', leg:'#a8301e', acc:'#f0c040', bigClaw:true, size:1.25}, 'water', 'fish', 'm', {k:{def:2.2}}]
);
MAPS[17].mobs = ['abyssshark', 'mantaray', 'giantpuffer', 'abyssangler', 'seahorseknight', 'lionfish', 'swordfish', 'abyssoctopus', 'armorlobster', 'abyssjelly', 'thundereel', 'abyssturtle'];
const ROAD_LV = Object.fromEntries(Object.entries(ROAD_LV_RAW).map(([d, a]) => [d, a.map(([lo, hi]) => [LVMAP(lo), Math.max(LVMAP(lo) + 2, LVMAP(hi))])]));
const ROAD_LAND = {e:() => 'fertile', s:k => k < Math.round(ROADS.s.filter(i => !MAPS[i].landFix).length * 5 / 8) ? 'arid' : 'volcanic', w:() => 'frozen', n:k => k < Math.round(ROADS.n.length * 2 / 3) ? 'dark' : 'light'};
const OPP = {n:'s', s:'n', e:'w', w:'e'}, DIRV = {n:[0, -1], s:[0, 1], e:[1, 0], w:[-1, 0]};
{
  const SP = {}; SPECIES.forEach(s => { SP[s[0]] = s; }); const BS = {}; BOSSES.forEach(b => { BS[b[0]] = b; });
  Object.assign(MAPS[0], {name:'นครอาเรน', en:'Aren, the Capital', land:'capital', links:{}, wx:.5, wy:.5, desc:['เมืองหลวงกลางอาณาจักร กับทุ่งสุวรรณินรอบเมือง', 'The capital at the heart of the realm, ringed by the Suwannin fields']});
  for (const d in ROADS) ROADS[d].forEach((id, k) => {
    const mp = MAPS[id], [c, e] = ROAD_LV[d][k], [a, b] = mp.lv, n = mp.mobs.length;
    mp.mobs.forEach((t, i) => { const s = SP[t]; if (!s) return; s[3] = b > a && s[3] ? Math.round(clamp(c + (s[3] - a) / (b - a) * (e - c), c - 1, e + 1)) : Math.round(c + i / Math.max(1, n - 1) * (e - c)); });
    const bs = BS[mp.boss]; bs[3] = Math.min(360, e + (b > a && bs[3] ? clamp(bs[3] - b, 3, 12) : 8));
    mp.lv = [c, e]; mp.land = mp.landFix || ROAD_LAND[d](k);
    mp.links = {[OPP[d]]:k ? ROADS[d][k - 1] : 0}; if (k < ROADS[d].length - 1) mp.links[d] = ROADS[d][k + 1];
    const [vx, vy] = DIRV[d], r = .1 + k * .345 / Math.max(ROADS[d].length - 1, 1), z = k % 2 ? .04 : -.04;   // world-map position: out along its road, zig-zagging
    mp.wx = .5 + (vx ? vx * r : z); mp.wy = .5 + (vy ? vy * r : z * .8);
  });
  for (const d in ROADS) MAPS[0].links[d] = ROADS[d][0];
}
/* (v294) วังบาดาล (map 17) became a sea of fish; the palace's nagas, its pearl spirit and its crab moved next door: the
   Crimson Lake (55) and the Cursed Spire (54), at those maps' levels */
for (const [id, to] of [['nagaretainer', 55], ['spiritpearl', 55], ['nagawarrior', 54], ['emeraldcrab', 54]]){ const sp = SPECIES.find(x => x[0] === id), mp = MAPS[to];
  if (!sp || !mp) continue; if (!mp.mobs.includes(id)) mp.mobs.push(id); sp[3] = Math.round((mp.lv[0] + mp.lv[1]) / 2); }

/* ---------- market & shrine NPC looks ---------- */
Object.assign(SPR.CHARS, {
  trader:{name:'เถ้าแก่ฮง', en:'Taokae Hong (NPC)', hair:'hairBlack', iris:'irisBr', spikes:4, spikeLen:1.4, top:'crimson', sleeve:'crimson', pants:'indigo', boots:'wood', belt:'gold', hat:'cap', capMat:'indigoD', jag:.05, bangF:6, strands:7, short:true, beard:'hairBlack', weapon:'fist', necklace:true},
  armorer:{name:'ช่างเหล็กมั่น', en:'Smith Man (NPC)', hair:'hairBrown', iris:'irisBr', spikes:10, spikeLen:2.6, top:'leather', sleeve:'skin', pants:'brownCl', boots:'boots', belt:'red', hat:'headwrap', bandMat:'red', jag:.1, bangF:8, strands:8, weapon:'sword', handWrap:'leather'},
  boatman:{name:'ตาพุ่ม', en:'Grandpa Phum (NPC)', hair:'hairWhite', iris:'irisBr', spikes:5, spikeLen:1.6, top:'indigo', sleeve:'indigo', pants:'indigoD', boots:'skin', belt:'cloth', hat:'ngob', jag:.04, bangF:5, strands:6, beard:'hairWhite', weapon:'staff', baggy:true},
  keeper:{name:'ผู้เฝ้าศาล', en:'Shrine Keeper (NPC)', hair:'hairSilver', iris:'irisBr', spikes:5, spikeLen:1.6, top:'white', sleeve:'white', pants:'white', boots:'skin', belt:'gold', skirt:[11.4, .9, 6.6, 8.6, 'white', 'gold'], jag:.04, bangF:5, strands:6, weapon:'staff', necklace:true, bun:true}
});
for (const k of ['trader', 'armorer', 'boatman', 'keeper']) SPR.CHAR_ACTIONS[k] = ['idle'];

/* ---------- build everything ---------- */
const SPECIES_ARCH = {};
for (const [id, th, en, lvl, arch, look, elem, race, size, x] of SPECIES){
  const st = statsFor(lvl, x.k, LVINV(lvl)), mat = `m_${id}`;
  BEAST.make(id, {arch, race, ...look, scale:x.scale || 1, fs:x.fs || 64});
  ITEMS[mat] = {name:(x.part || PART[arch])[0] + th, en:`${en} ${(x.part || PART[arch])[1]}`, sell:Math.round(4 + lvl * 3.2), kind:'etc'};
  const pot = lvl < 30 ? 'redpot' : lvl < 70 ? 'orangepot' : lvl < 130 ? 'whitepot' : lvl < 200 ? 'elixirpot' : 'divinepot';
  MOB[id] = {name:th, en, ...st, elem, race, size, r:size === 'l' ? 18 : size === 'm' ? 14 : 11, aggro:!!x.aggro, range:x.range || 0, shot:x.shot || null, night:!!x.night,
    drops:[[mat, .55], [pot, .07], ['ore', .03 + Math.min(.06, lvl / 3000)], ['bluepot', .03]], card:null, cardRate:0, h:null};
  SPECIES_ARCH[id] = arch;
}
/* ---------- a card for every monster species ----------
   Ten kinds of card (what it gives), and four places they go (v28: weapon, body armour, headgear, feet):
   weapon: + damage to one race and a main stat · aim (weapon): HIT/DEX · armour: HP and VIT/DEF ·
   guard (armour): DEF/MDEF/HP · vigor (armour): HP/VIT · head: INT/DEX/AGI and SP/MDEF · mind (head): MDEF/SP ·
   feet: FLEE/move speed · swift (feet): FLEE/AGI · stride (feet): DEF/HP.
   Strength grows with the monster's level tier (1 per 25 levels). */
const CARD_SLOTS = ['weapon', 'armor', 'head', 'guard', 'mind', 'aim', 'swift', 'vigor', 'stride', 'shoes'];   // the ten kinds
const CARD_HOME = {guard:'armor', mind:'head', aim:'weapon', swift:'shoes', vigor:'armor', stride:'shoes'};    // kind → the place it goes
const RACE_PREY = {brute:'plant', plant:'insect', insect:'fish', fish:'brute', undead:'human', human:'undead', demon:'angel', angel:'demon', dragon:'dragon', formless:'formless'};
function speciesCard(id, th, en, lvl, race, elem, i){
  const t = Math.max(1, Math.ceil(lvl / 25)), slot = CARD_SLOTS[i % CARD_SLOTS.length], st = {}, pt = [[], []];
  const prey = RACE_PREY[race] || 'brute', main = ['str', 'dex', 'int', 'agi', 'luk', 'vit'][i % 6];
  if (slot === 'weapon'){ st.race = {[prey]:(4 + t * 2) / 100}; st[main] = t; pt[0].push(`ดาเมจต่อเผ่า${RACE_TH[prey]} +${4 + t * 2}%`); pt[1].push(`+${4 + t * 2}% damage to ${RACE_EN[prey]}`); }
  if (slot === 'armor'){ st.hp = lvl * 5; st.vit = Math.ceil(t / 2); st.def = t * 2; pt[0].push(`Max HP +${lvl * 5}`, `DEF +${t * 2}`); pt[1].push(`Max HP +${lvl * 5}`, `DEF +${t * 2}`); }
  if (slot === 'head'){ const k = ['int', 'dex', 'agi'][i % 3]; st[k] = t + 1; st.sp = lvl; st.mdef = t; pt[0].push(`Max SP +${lvl}`, `MDEF +${t}`); pt[1].push(`Max SP +${lvl}`, `MDEF +${t}`); }
  if (slot === 'guard'){ st.def = t * 2; st.mdef = t; st.hp = lvl * 3; pt[0].push(`DEF +${t * 2}`, `MDEF +${t}`, `Max HP +${lvl * 3}`); pt[1].push(`DEF +${t * 2}`, `MDEF +${t}`, `Max HP +${lvl * 3}`); }
  if (slot === 'mind'){ st.mdef = t; st.sp = lvl; st[i % 2 ? 'luk' : 'int'] = t; pt[0].push(`MDEF +${t}`, `Max SP +${lvl}`); pt[1].push(`MDEF +${t}`, `Max SP +${lvl}`); }
  if (slot === 'aim'){ st.hit = t * 3; st.dex = t; pt[0].push(`HIT +${t * 3}`); pt[1].push(`HIT +${t * 3}`); }
  if (slot === 'swift'){ st.flee = t * 2; st.agi = t; pt[0].push(`FLEE +${t * 2}`); pt[1].push(`FLEE +${t * 2}`); }
  if (slot === 'vigor'){ st.hp = lvl * 4; st.vit = t; pt[0].push(`Max HP +${lvl * 4}`); pt[1].push(`Max HP +${lvl * 4}`); }
  if (slot === 'stride'){ st.def = t; st.hp = lvl * 3; st.vit = Math.ceil(t / 2); pt[0].push(`DEF +${t}`, `Max HP +${lvl * 3}`); pt[1].push(`DEF +${t}`, `Max HP +${lvl * 3}`); }
  if (slot === 'shoes'){ st.flee = t; st.agi = Math.ceil(t / 2); st.movePct = .02; pt[0].push(`FLEE +${t}`, 'ความเร็วเดิน +2%'); pt[1].push(`FLEE +${t}`, 'Move speed +2%'); }
  for (const k of ['str', 'agi', 'vit', 'int', 'dex', 'luk']) if (st[k]){ pt[0].push(`${k.toUpperCase()} +${st[k]}`); pt[1].push(`${k.toUpperCase()} +${st[k]}`); }
  CARDS[`c_${id}`] = {name:`Card ${th}`, en:`${en} Card`, slot:CARD_HOME[slot] || slot, kind:slot, bonus:st, desc:[pt[0].join(', '), pt[1].join(', ')]};
  return `c_${id}`;
}
SPECIES.forEach(([id, th, en, lvl, arch, look, elem, race], i) => { const c = speciesCard(id, th, en, lvl, race, elem, i); MOB[id].card = c; MOB[id].cardRate = .002; });   // 1 card in 500 kills (was 1 in 167)
const BOSS_CARD_SLOT = ['weapon', 'armor', 'head'];
const BOSS_CARD_BONUS = [{str:3, vit:2}, {vit:4, hpPct:.05}, {dex:3, agi:2}, {int:4, spPct:.05}, {agi:3, luk:3}, {str:4, atkPct:.03}, {vit:3, def:8}, {int:3, matkPct:.04}, {dex:4, crit:3},
  {str:3, agi:3}, {vit:5, hpPct:.07}, {int:5, matkPct:.05}, {str:5, atkPct:.05}, {agi:5, crit:5}, {dex:5, atkPct:.04}, {vit:6, def:12}, {int:6, spPct:.1}, {all:3}, {all:4, crit:3}, {all:6, atkPct:.05, matkPct:.05},
  {str:6, def:10}, {str:6, atkPct:.06}, {int:7, matkPct:.06}, {agi:6, crit:6}, {int:8, matkPct:.08}, {vit:8, hpPct:.1}, {dex:7, atkPct:.06}, {vit:9, def:16}, {all:5, spPct:.1}, {all:8, atkPct:.08, matkPct:.08}];
BOSSES.forEach(([id, th, en, lvl, arch, look, elem, race, skills], i) => {
  const st = statsFor(lvl, {hp:28, atk:.8, def:1, exp:22, delay:1.5}, LVINV(lvl)), card = `c_${id}`;
  BEAST.make(id, {arch, race, boss:true, ...look, scale:arch === 'human' ? 1.7 : arch === 'bug' && /^(hornet|wasp|bee)$/.test(look.kind || '') ? 1.9 : arch === 'squat' || arch === 'bug' ? 2.6 : 2.2, fs:arch === 'human' ? 128 : 150});
  const b = BOSS_CARD_BONUS[i % BOSS_CARD_BONUS.length], pt = (all) => Object.keys(b).map(k => { const v = b[k]; return k === 'all' ? `${all} +${v}` : /Pct$/.test(k) ? `${{hp:'Max HP', sp:'Max SP', atk:'ATK', matk:'MATK'}[k.replace('Pct', '')]} +${Math.round(v * 100)}%` : k === 'crit' ? `CRIT +${v}%` : `${k.toUpperCase()} +${v}`; }).join(', ');
  CARDS[card] = {name:`Card ${th}`, en:`${en} Card`, slot:CARD_HOME[CARD_SLOTS[i % CARD_SLOTS.length]] || CARD_SLOTS[i % CARD_SLOTS.length], bonus:b, desc:[pt('ทุก Stat'), pt('All Stats')]};
  MOB[id] = {name:th, en, ...st, defPct:.05, elem, race, size:'l', r:30, aggro:true, boss:true, bossSkills:skills,
    drops:[['ore', 1], ['ore', .6], [lvl < 70 ? 'orangepot' : lvl < 130 ? 'whitepot' : lvl < 200 ? 'elixirpot' : 'divinepot', 1], ['bluepot', 1]], card, cardRate:.1};
  SPECIES_ARCH[id] = arch;
});
/* the old fields' boss gets skills too */
MOB.boss.bossSkills = ['slam', 'summon', 'heal'];
MOB.boss.summon = 'dewblob';
/* the starting fields' own monsters (data/monsters.js) follow the same EXP rule */
for (const id of ['dewblob', 'hare', 'boar', 'lantern']) if (MOB[id]){ const e = mobExp(MOB[id].lvl); MOB[id].exp = Math.max(1, Math.round(e)); MOB[id].jexp = Math.max(1, Math.round(e * .3)); }

const mapOf = id => MAPS[id] || MAPS[0];
const MAP_BOSS_OF = {}; MAPS.forEach(m => { MAP_BOSS_OF[m.boss] = m.id; });
