/* VAYRATHEN — js/data/world3.js — thirty more regions and three hundred more species (v29)
   Loaded before data/world.js, which calls WORLD_MORE() just before it lays the realm out.
   · 30 new regions, woven into the four roads between the old ones (east +6, south +8, west +6, north +10), so the
     level climb is gentler: every road is re-spread evenly from its first to its last level and every monster's level
     follows its region (the old ones too).
   · Each new region has 10 species of its own (11 in the last five; 305 in all, 500 in the realm) and a boss. A species is built from a
     creature kind that lives along the same road (so it fits the land), recoloured to the region's palette, reshaped
     (size, length, build) and given its own name, element and nature: no two look or read alike.
   · Each region also gets its own ground colours (a tinted copy of its biome, world/biome3.js). */
'use strict';

/* [key, th, en, road, biome, element, hue, adjective th, adjective en, desc th, desc en] */
const W3_MAPS = [
  ['sunflower', 'ทุ่งทานตะวัน', 'Sunflower Meadow', 'e', 'highland', 'earth', 48, 'ตะวัน', 'Sunpetal', 'ทุ่งดอกทานตะวันสูงท่วมหัว', 'Sunflowers taller than a man'],
  ['orchard', 'สวนผลไม้ป่า', 'Wild Orchard', 'e', 'bamboo', 'wind', 95, 'สวนป่า', 'Orchard', 'สวนผลไม้ที่ไม่มีใครดูแลมานาน', 'An orchard left to the wild'],
  ['rainbowfall', 'น้ำตกเจ็ดสี', 'Seven-hued Falls', 'e', 'river', 'water', 190, 'รุ้ง', 'Rainbow', 'น้ำตกที่ละอองน้ำเป็นสายรุ้ง', 'Falls whose spray hangs in rainbows'],
  ['mangrove', 'ป่าโกงกาง', 'Mangrove Shore', 'e', 'marsh', 'water', 150, 'โกงกาง', 'Mangrove', 'รากโกงกางพันกันริมทะเล', 'Tangled mangrove roots by the sea'],
  ['firefly', 'หุบเขาหิ่งห้อย', 'Firefly Valley', 'e', 'highland', 'holy', 70, 'หิ่งห้อย', 'Firefly', 'หุบเขาที่หิ่งห้อยนับล้านส่องแสง', 'A valley lit by a million fireflies'],
  ['goldbloom', 'เนินบัวตอง', 'Goldbloom Hills', 'e', 'beach', 'wind', 40, 'บัวตอง', 'Goldbloom', 'เนินเขาดอกบัวตองเหลืองอร่าม', 'Hills ablaze with golden daisies'],
  ['oasis', 'โอเอซิสมรกต', 'Emerald Oasis', 's', 'desert', 'water', 160, 'โอเอซิส', 'Oasis', 'แอ่งน้ำเขียวกลางทะเลทราย', 'A green pool in the heart of the dunes'],
  ['sandcity', 'นครร้างใต้ผืนทราย', 'Sand-buried City', 's', 'desert', 'earth', 35, 'ทรายกลบ', 'Sandbound', 'ยอดปราสาทโผล่พ้นเนินทราย', 'Spires of a city poking through the sand'],
  ['galegorge', 'หุบผาลมกรด', 'Howling Gorge', 's', 'canyon', 'wind', 20, 'ลมกรด', 'Galecut', 'ลมกรดหวีดหวิวในหุบผาแคบ', 'A narrow gorge where the wind howls'],
  ['cactus', 'ป่ากระบองเพชร', 'Cactus Barrens', 's', 'dryplain', 'earth', 110, 'หนาม', 'Thornback', 'ดงกระบองเพชรยักษ์', 'A forest of giant cacti'],
  ['sulphur', 'เหมืองกำมะถัน', 'Sulphur Mines', 's', 'cave', 'fire', 55, 'กำมะถัน', 'Sulphur', 'อุโมงค์เหมืองที่ควันเหลืองลอยอบอวล', 'Mine tunnels thick with yellow fumes'],
  ['magmariver', 'แม่น้ำแมกมาคู่', 'Twin Magma Rivers', 's', 'lavafield', 'fire', 10, 'แมกมา', 'Magma', 'สองสายลาวาที่ไหลมาบรรจบ', 'Two rivers of lava meeting'],
  ['basalt', 'ป่าเสาบะซอลต์', 'Basalt Pillars', 's', 'crater', 'earth', 0, 'บะซอลต์', 'Basalt', 'เสาหินดำหกเหลี่ยมนับพัน', 'Thousands of black hexagonal pillars'],
  ['cinder', 'ทะเลถ่านแดง', 'Sea of Cinders', 's', 'ashforest', 'fire', 25, 'ถ่านแดง', 'Cinder', 'ทุ่งถ่านที่ยังคุแดงไม่ดับ', 'Fields of embers that never go out'],
  ['snowpine', 'ป่าสนหิมะ', 'Snowpine Woods', 'w', 'glacier', 'water', 200, 'สนหิมะ', 'Snowpine', 'ป่าสนที่หิมะทับจนกิ่งโน้ม', 'Pines bowed under heavy snow'],
  ['fjord', 'ฟยอร์ดน้ำแข็ง', 'Ice Fjord', 'w', 'frozenlake', 'water', 210, 'ฟยอร์ด', 'Fjord', 'ร่องน้ำแข็งระหว่างหน้าผาสูง', 'Frozen water between towering cliffs'],
  ['aurora', 'ทุ่งแสงเหนือ', 'Aurora Tundra', 'w', 'glacier', 'holy', 170, 'แสงเหนือ', 'Aurora', 'ทุ่งน้ำแข็งใต้ม่านแสงเหนือ', 'Tundra beneath the aurora'],
  ['sapphire', 'ถ้ำผลึกไพลิน', 'Sapphire Grotto', 'w', 'icecave', 'water', 225, 'ไพลิน', 'Sapphire', 'ถ้ำที่ผนังเป็นผลึกสีน้ำเงินเข้ม', 'A cave walled with deep-blue crystal'],
  ['wreck', 'ซากเรือน้ำแข็ง', 'Frozen Shipwreck', 'w', 'frozenlake', 'shadow', 240, 'เรือผี', 'Wreckborn', 'เรือสำเภาที่ถูกน้ำแข็งกลืนกิน', 'A junk swallowed by the ice'],
  ['blizzard', 'ยอดเขาพายุหิมะ', 'Blizzard Peak', 'w', 'frostcitadel', 'wind', 195, 'พายุหิมะ', 'Blizzard', 'ยอดเขาที่พายุหิมะไม่เคยหยุด', 'A peak where the blizzard never ends'],
  ['gloom', 'บึงเงามรณะ', 'Mire of Shadows', 'n', 'cemetery', 'shadow', 280, 'เงามรณะ', 'Gloom', 'บึงดำที่เงาเคลื่อนไหวได้เอง', 'A black mire where shadows move'],
  ['glowcap', 'ป่าเห็ดเรืองแสง', 'Glowcap Forest', 'n', 'himmapan', 'earth', 300, 'เห็ดเรือง', 'Glowcap', 'ดงเห็ดยักษ์ที่เรืองแสงในความมืด', 'Giant mushrooms glowing in the dark'],
  ['kingtomb', 'สุสานกษัตริย์', 'Tomb of Kings', 'n', 'khmer', 'shadow', 45, 'สุสาน', 'Tomb', 'สุสานหินของกษัตริย์โบราณ', 'Stone tombs of forgotten kings'],
  ['hexspire', 'หอคอยคำสาป', 'Cursed Spire', 'n', 'cave', 'shadow', 265, 'คำสาป', 'Hexed', 'หอคอยที่คำสาปซึมทุกก้อนอิฐ', 'A tower cursed to every brick'],
  ['crimsonlake', 'ทะเลสาบโลหิต', 'Crimson Lake', 'n', 'laplae', 'shadow', 350, 'โลหิต', 'Crimson', 'ทะเลสาบสีเลือดใต้จันทร์แดง', 'A blood-red lake under a red moon'],
  ['asuramaze', 'เขาวงกตอสูร', 'Asura Labyrinth', 'n', 'badan', 'fire', 330, 'อสูร', 'Asura', 'เขาวงกตที่อสูรใช้ขังเชลย', 'The maze where asuras keep their captives'],
  ['skygarden', 'สวนสวรรค์ลอยฟ้า', 'Floating Gardens', 'n', 'innerhim', 'holy', 120, 'ลอยฟ้า', 'Skyborne', 'สวนบนเกาะลอยเหนือเมฆ', 'Gardens on islands above the clouds'],
  ['milkyway', 'ทางช้างเผือก', 'Milky Way Path', 'n', 'kailash', 'holy', 230, 'ดารา', 'Starlit', 'ทางเดินดวงดาวสู่สวรรค์', 'A road of stars toward heaven'],
  ['gempalace', 'วังแก้วมณี', 'Crystal Palace', 'n', 'meru', 'water', 185, 'มณี', 'Gemstone', 'พระราชวังที่สร้างจากแก้วมณี', 'A palace built of gemstones'],
  ['suncourt', 'บัลลังก์สุริยะ', 'Throne of the Sun', 'n', 'tavatimsa', 'holy', 45, 'สุริยะ', 'Solar', 'บัลลังก์ทองที่ดวงอาทิตย์ประทับ', 'The golden throne where the sun sits']
];
/* what a creature is called, by body and kind */
const W3_NOUN = {
  'quad:bear':['หมี', 'Bear'], 'quad:bovine':['กระทิง', 'Gaur'], 'quad:cat':['เสือ', 'Cat'], 'quad:croc':['จระเข้', 'Crocodile'], 'quad:deer':['กวาง', 'Stag'], 'quad:dog':['หมาป่า', 'Wolf'],
  'quad:elephant':['ช้าง', 'Elephant'], 'quad:horse':['ม้า', 'Steed'], 'quad:lizard':['ตะกวด', 'Lizard'], 'quad:boar':['หมูป่า', 'Boar'], 'quad:rat':['หนู', 'Rat'], 'quad:-':['สัตว์ร้าย', 'Beast'],
  'bird:fan':['ไก่ฟ้า', 'Pheasant'], 'bird:long':['นกหางยาว', 'Longtail'], 'bird:short':['นกน้อย', 'Finch'], 'bird:-':['เหยี่ยว', 'Hawk'],
  'bug:beetle':['ด้วง', 'Beetle'], 'bug:ant':['มด', 'Ant'], 'bug:crab':['ปู', 'Crab'], 'bug:scorpion':['แมงป่อง', 'Scorpion'], 'bug:shrimp':['กุ้ง', 'Shrimp'], 'bug:spider':['แมงมุม', 'Spider'], 'bug:hornet':['ต่อ', 'Hornet'], 'bug:wasp':['แตน', 'Wasp'], 'bug:bee':['ผึ้ง', 'Bee'], 'bug:-':['แมลง', 'Bug'],
  'floater:jar':['ผีไห', 'Jar Spirit'], 'floater:krasue':['กระสือ', 'Krasue'], 'floater:lantern':['โคมผี', 'Lantern'], 'floater:mask':['หน้ากากผี', 'Mask'], 'floater:pearl':['ภูตมุก', 'Pearl Spirit'],
  'floater:squid':['หมึกลอยฟ้า', 'Sky Squid'], 'floater:star':['ภูตดาว', 'Star Wisp'], 'floater:vortex':['วังวน', 'Vortex'], 'floater:wisp':['ภูต', 'Wisp'], 'floater:-':['วิญญาณ', 'Spirit'],
  'human:bow':['นักธนู', 'Archer'], 'human:staff':['หมอผี', 'Shaman'], 'human:sword':['นักรบ', 'Warrior'], 'human:-':['อสูร', 'Fiend'],
  'rock:spire':['หินงอก', 'Spire'], 'rock:-':['ยักษ์หิน', 'Golem'], 'serpent:true':['หนอน', 'Crawler'], 'serpent:-':['งู', 'Serpent'],
  'slime:halo':['เจลลี่รัศมี', 'Halo Jelly'], 'slime:leaf':['ภูตใบไม้', 'Leafling'], 'slime:lotus':['เจลลี่บัว', 'Lotus Jelly'], 'slime:mushroom':['เห็ด', 'Shroom'], 'slime:-':['เจลลี่', 'Jelly'],
  'squat:clam':['หอย', 'Clam'], 'squat:frog':['กบ', 'Frog'], 'squat:toad':['คางคก', 'Toad'], 'squat:turtle':['เต่า', 'Turtle'], 'squat:-':['สัตว์ครึ่งบกครึ่งน้ำ', 'Amphibian']};
const W3_VAR = [['ยักษ์', 'Great'], ['เฒ่า', 'Elder'], ['สนธยา', 'Dusk'], ['คลั่ง', 'Feral']];
const W3_SUBKEY = {quad:'head', bug:'kind', squat:'kind', slime:'top', floater:'kind', human:'weapon', bird:'tail', rock:'form', serpent:'grub'};
const w3Sub = (arch, look) => { const v = look[W3_SUBKEY[arch]]; return `${arch}:${v === true ? 'true' : v || '-'}`; };
const w3Noun = (arch, look) => W3_NOUN[w3Sub(arch, look)] || W3_NOUN[`${arch}:-`] || ['สัตว์', 'Creature'];
/* colour: pull every colour of the look toward the region's hue, keep its lightness (and a little of its own hue) */
function w3Hsl(hex){ const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l]; const d = mx - mn, s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [h * 60, s, l]; }
function w3Hex(h, s, l){ h = ((h % 360) + 360) % 360 / 360; const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return '#' + [f(h + 1 / 3), f(h), f(h - 1 / 3)].map(v => Math.round(clamp(v, 0, 1) * 255).toString(16).padStart(2, '0')).join(''); }
function w3Tint(hex, hue, k, seed, force = 0){ const [h, s0, l0] = w3Hsl(hex); if (!force && s0 < .08 && l0 > .85) return hex;   // keep near-whites (eyes, teeth)
  const s = force ? Math.max(s0, .3 + force * .05) : s0, l = force ? clamp(l0 + (force % 2 ? -1 : 1) * .12, .1, .9) : l0;
  const dh = ((hue - h + 540) % 360) - 180, nh = h + dh * k + (seed % 40 - 20), ns = clamp(s * (.85 + (seed % 7) * .06) + .08, 0, 1);
  return w3Hex(nh, ns, clamp(l + ((seed >> 3) % 9 - 4) * .02, .06, .94)); }
function w3Look(look, hue, seed, force = 0){
  const nat = look.head === 'croc' || look.head === 'rat' || look.head === 'boar';   // (v276) real furred and scaled animals keep their real colours, a little tinted (insects take the region's colours: real beetles come in every colour)   // (v274) crocodiles get a real crocodile's colours (olive hide, cream belly, dark bands), only a little tinted by the region (teal or mint ones from the lava-drake template looked like toys)
  if (look.head === 'croc'){ look = {...look, skin:'#4f5a33', belly:'#d6cc98', stripe:'#2a3019'}; delete look.eyeGlow; }
  const o = {}; let i = 0;
  for (const k in look){ const v = look[k];
    if (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)){ o[k] = w3Tint(v, hue + (force ? i * 47 : 0), nat ? Math.min(.6, .18 + force * .08) : force ? .55 : i++ % 3 === 2 ? .45 : .75, (seed + i * 37) & 255, nat ? 0 : force); if (nat) i++;   /* a natural animal takes more of the region's colour only while it is still too like another */ if (force) i++; }
    else if (typeof v === 'number' && /^(len|size|girth|leg|thick|neckLen|legLen|bulk|beakLen|rise)$/.test(k)) o[k] = +(v * (.88 + ((seed + k.length * 13) % 25) / 100)).toFixed(2);
    else o[k] = Array.isArray(v) ? v.slice() : v; }
  return o;
}
/* no new creature may be a near-copy of another of its body (tests/data.test.js uses the same measure) */
const w3IsCol = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v), w3On = v => v != null && v !== false;
function w3Diff(a, b){ let n = 0;
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])){ const x = a[k], y = b[k]; if (!w3On(x) && !w3On(y)) continue;
    if (w3IsCol(x) && w3IsCol(y)){ const p = [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)), q = [1, 3, 5].map(i => parseInt(y.slice(i, i + 2), 16)); if (p.some((v, i) => Math.abs(v - q[i]) > 40)) n++; }
    else if (typeof x === 'number' || typeof y === 'number'){ if (Math.abs((x ?? 1) - (y ?? 1)) > .15) n++; } else if (x !== y) n++; }
  return n; }
function w3Unique(arch, look, hue, seed, extra = {}){
  const others = [...SPECIES, ...BOSSES].filter(r => r[4] === arch).map(r => r[5]); let best = null, bd = -1;
  for (let t = 0; t < 14; t++){ const o = {...w3Look(look, hue + t * 53, (seed + t * 101) >>> 0, t >= 4 ? t - 3 : 0), ...extra};
    if (t >= 6) for (const k in o) if (typeof o[k] === 'number' && /^(len|size|girth|leg|thick|neckLen|legLen|bulk|beakLen|rise)$/.test(k)) o[k] = +(o[k] * (1 + (t - 5) * .07)).toFixed(2);
    if (t >= 8){ const h2 = hue + t * 61;   // last resort: a second colour or a changed body part the drawing already knows
      if (arch === 'slime'){ if (!o.topCol) o.topCol = w3Hex(h2 + 120, .6, .6); o.size = +(1 + ((t % 3) - 1) * .22).toFixed(2); }
      if (arch === 'floater'){ if (!o.dark) o.dark = w3Hex(h2 + 200, .4, .2); if (o.tails) o.tails = clamp(o.tails + (t % 2 ? 1 : -2), 1, 7); } }
    const d = Math.min(99, ...others.map(x => w3Diff(o, x))); if (d >= 2) return o; if (d > bd){ bd = d; best = o; } }
  return best; }
const W3_LOREMAP = {};
const W3_HABIT = {quad:['เดินหากินเป็นฝูงเล็ก ๆ และดุร้ายเมื่อถูกรบกวน', 'roams in small packs and turns savage when disturbed'], bird:['บินวนเหนือหัวนักเดินทางแล้วโฉบลงมาอย่างรวดเร็ว', 'circles over travellers and swoops down fast'],
  bug:['ซ่อนตัวใต้ก้อนหินและพุ่มไม้ รอเหยื่อเดินผ่าน', 'hides under stones and brush, waiting for prey to pass'], floater:['ลอยเงียบ ๆ ในอากาศและส่องแสงจาง ๆ ยามค่ำ', 'drifts silently and glows faintly at night'],
  human:['ตั้งค่ายอยู่ห่าง ๆ และไม่ชอบให้ใครเข้าใกล้ถิ่นของมัน', 'keeps its own camp and lets no one near its ground'], rock:['นิ่งเหมือนก้อนหินจนกว่าจะมีใครเหยียบเข้ามาใกล้', 'lies still as stone until someone steps too close'],
  serpent:['เลื้อยไปตามร่องดินและฉกเร็วกว่าตาจะมองทัน', 'slides along the furrows and strikes faster than the eye'], slime:['ไหลไปตามพื้นชื้นและกลืนทุกอย่างที่ขวางทาง', 'oozes over damp ground and swallows whatever is in its way'],
  squat:['หมอบนิ่งริมน้ำ แล้วกระโดดใส่ทันทีที่เผลอ', 'squats by the water and leaps the moment you look away']};
const w3Hash = s => { let h = 2166136261; for (const c of s){ h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

/* (v276) the owner: too many people and elephants among the monsters — make room for rats, ants, beetles, boars.
   About two in three regional creatures made from a person or an elephant (unless a story quest names them) become one of these
   instead (each region picks by its own hash, so the realm keeps its variety). Natural colours; the region still tints
   them a little. A person who shot from afar becomes an ant that spits. Ids stay as they were (saves and quests). */
const W3_SMALL = [
  {arch:'quad', race:'brute', size:'s', look:{head:'rat', skin:'#6e6058', belly:'#cbbcaa', len:1, leg:1, girth:1}},
  {arch:'bug', race:'insect', size:'s', look:{kind:'ant', shell:'#8a2a1a', leg:'#5a1a10', acc:'#3a0e08', size:1, legLen:1}},
  {arch:'bug', race:'insect', size:'m', look:{kind:'beetle', shell:'#3a2a1a', leg:'#2a1a10', acc:'#6a4a2a', horn:true, size:1.1, legLen:1}},
  {arch:'quad', race:'brute', size:'m', look:{head:'boar', skin:'#5a4a3a', belly:'#8a7a66', stripe:'#3a2e24', tusks:true, len:1, leg:1, girth:1}},
  {arch:'bug', race:'insect', size:'s', look:{kind:'ant', shell:'#2a2420', leg:'#1a1614', acc:'#4a3a30', size:1.1, legLen:1}},
  {arch:'quad', race:'brute', size:'s', look:{head:'rat', skin:'#4a4440', belly:'#9a9088', len:1.05, leg:1, girth:1}},
  {arch:'bug', race:'insect', size:'m', look:{kind:'beetle', shell:'#2a3a1a', leg:'#1a2410', acc:'#5a7a2a', size:1, legLen:1}}];
const W3_KEEP = new Set(['asuramaze_steed','asuramaze_warrior','aurora_fiend','aurora_stag','basalt_fiend','basalt_golem','blizzard_warrior','blizzard_wisp','cactus_crocodile','cactus_scorpion','cinder_golem','cinder_serpent','crimsonlake_elephant','crimsonlake_fiend','firefly_fiend','firefly_golem','fjord_golem','fjord_wolf','fm_clr','fm_disc','fm_mile','fm_spd','fm_story','galegorge_hawk','galegorge_wolf','gempalace_fiend','gempalace_serpent','gloom_elephant','gloom_jelly','glowcap_fiend','glowcap_stag','goldbloom_golem','goldbloom_wolf','hexspire_mask','hexspire_steed','kingtomb_elephant','kingtomb_warrior','m_banteng','m_carvedmonkey','m_celadonjar','m_dragonpearl','m_fallenstar','m_firemillipede','m_flamegaruda','m_frostwisp','m_giantclam','m_goldshrimp','m_hauntedurn','m_heavenhamsa','m_hermitcrab','m_kilen','m_offeringsquirrel','m_sakuna','m_serow','m_snowfox','m_spiritpearl','m_tormentwisp','m_wanderdurian','magmariver_golem','magmariver_serpent','mangrove_crawler','mangrove_golem','milkyway_spire','milkyway_wisp','oasis_crocodile','oasis_shaman','orchard_crawler','orchard_fiend','rainbowfall_crab','rainbowfall_golem','sandcity_golem','sandcity_jarspirit','sapphire_crawler','sapphire_golem','skygarden_elephant','skygarden_fiend','snowpine_bear','snowpine_wisp','sulphur_golem','sulphur_wisp','suncourt_fiend','suncourt_warrior','sunflower_beetle','sunflower_golem','wreck_crab','wreck_warrior']);   // creatures a story quest names: they stay what the story says
function w3Small(arch, look, seed, x, sid){
  if (W3_KEEP.has(sid)) return null;
  const hum = arch === 'human', ele = arch === 'quad' && look.head === 'elephant'; if (!hum && !ele) return null;
  if ((seed >>> 3) % 100 >= (hum ? 70 : 75)) return null;
  const ranged = hum && (x.range || x.shot), pick = ranged ? W3_SMALL[(seed >>> 9) % 2 ? 1 : 4] : W3_SMALL[(seed >>> 9) % W3_SMALL.length];
  const lk = {...pick.look}, v = (seed >>> 5) % 5;
  if (lk.head === 'rat') [lk.skin, lk.belly] = [['#6e6058', '#cbbcaa'], ['#4a4440', '#9a9088'], ['#8a6a4a', '#d8c4a8'], ['#d8d0c4', '#f4eee6'], ['#33302c', '#6a645c']][v];   // brown, grey, sandy, white, black rats
  if (lk.head === 'boar') [lk.skin, lk.belly] = [['#5a4a3a', '#8a7a66'], ['#3a3430', '#6a625a'], ['#7a5a3a', '#a88a66'], ['#4a3a2e', '#7a6a5a'], ['#6a6058', '#9a9088']][v];
  if (lk.len) { lk.len = +(1 + ((seed >>> 11) % 5 - 2) * .1).toFixed(2); lk.girth = +(1 + ((seed >>> 13) % 5 - 2) * .1).toFixed(2); }
  if (lk.size) lk.size = +(.9 + ((seed >>> 11) % 5) * .08).toFixed(2);
  return {arch:pick.arch, race:pick.race, size:pick.size, look:lk, shot:ranged ? 'dart' : null};
}
/* (v278) five people of the old roads became animals; the regions still choose their templates as before (so every
   regional creature, its id and the quests that name it stay the same) */
const W3_WAS = {khmerghost:['human', {weapon:'sword'}], moatkappa:['human', {}], icefisher:['human', {weapon:'staff'}], frostknight:['human', {weapon:'sword'}], koboldscale:['human', {weapon:'sword'}]};
function WORLD_MORE(){
  if (MAPS.length > 31) return;
  const SP = {}; SPECIES.forEach(s => { SP[s[0]] = s; }); const BS = {}; BOSSES.forEach(b => { BS[b[0]] = b; });
  const roadPool = {}; for (const d in ROADS) roadPool[d] = ROADS[d].flatMap(id => MAPS[id].mobs).filter(t => SP[t]);
  const added = {e:[], s:[], w:[], n:[]}, usedNm = new Set(SPECIES.map(x => x[2])), used = new Set(Object.keys(SP));
  W3_MAPS.forEach(([key, th, en, road, biome, elem, hue, ath, aen, dth, den], mi) => {
    const id = MAPS.length, quota = 10 + (mi >= 25 ? 1 : 0), pool = roadPool[road].slice(), seen = new Set(), mobsOut = [];
    // ten templates: different kinds first, in a mixed order unique to the region
    pool.sort((a, b) => w3Hash(key + a) - w3Hash(key + b));
    for (const pass of [0, 1]) for (const t of pool){ if (mobsOut.length >= quota) break; const s = SP[t], o0 = W3_WAS[t], sub = o0 ? w3Sub(o0[0], o0[1]) : w3Sub(s[4], s[5]); if (pass === 0 && seen.has(sub)) continue; if (mobsOut.some(m => m.t === t)) continue; seen.add(sub); mobsOut.push({t, s}); }
    const ids = mobsOut.map(({t, s}, i) => {
      let [, , , , arch, look, el0, race, size, x] = s; const seed = w3Hash(key + t), was = W3_WAS[t], [, idEn] = was ? w3Noun(was[0], was[1]) : w3Noun(arch, look);
      const sm = w3Small(arch, look, seed, x, `${key}_${idEn.toLowerCase().replace(/[^a-z]/g, '')}`); if (sm){ arch = sm.arch; look = sm.look; race = sm.race; size = sm.size; x = {...x}; if (sm.shot) x.shot = sm.shot; else { delete x.range; delete x.shot; } }
      const [nth, nen] = w3Noun(arch, look);
      let sid = `${key}_${['hornet', 'wasp', 'bee'].includes(look.kind) ? 'spider' : idEn.toLowerCase().replace(/[^a-z]/g, '')}`;   /* the id keeps the old creature's name */   /* (v274) the spiders became hornets and wasps: their ids stay, so saves and quests still find them */ while (used.has(sid)) sid += 'x'; used.add(sid);
      const elm = i % 5 < 3 ? elem : el0, xx = {...x}; if (i % 4 === 0) xx.aggro = true; delete xx.night;
      let vth = '', ven = '', vi = 0; while (usedNm.has(`${aen} ${ven}${nen}`)){ [vth, ven] = W3_VAR[vi++ % W3_VAR.length]; ven += ' '; } usedNm.add(`${aen} ${ven}${nen}`);
      SPECIES.push([sid, `${nth}${vth}${ath}`, `${aen} ${ven}${nen}`, 0, arch, w3Unique(arch, look, hue, seed), elm, race, size, xx]);
      const hb = W3_HABIT[arch] || W3_HABIT.quad;
      W3_LOREMAP[sid] = [`${nth}${vth}${ath}แห่ง${th} ${dth} สีกายของมันกลืนไปกับแผ่นดินแถบนี้ ${hb[0]}`, `The ${aen} ${ven}${nen} of ${en}. ${den}; its colours match the land, and it ${hb[1]}.`];
      return sid; });
    // the boss: a recoloured boss of the same road, crowned with the region's name
    const bTpl = BOSSES.filter(b => roadPool[road].length && ROADS[road].some(m => MAPS[m].boss === b[0]));
    const bt = bTpl[mi % bTpl.length] || BOSSES[mi % BOSSES.length], bid = `${key}_lord`;
    const [bnth, bnen] = w3Noun(bt[4], bt[5]);
    BOSSES.push([bid, `เจ้า${bnth}${ath}`, `${aen} ${bnen} Lord`, 0, bt[4], w3Unique(bt[4], bt[5], hue, w3Hash(bid), {crown:true}), elem, bt[7], bt[8].slice()]);
    W3_LOREMAP[bid] = [`เจ้า${bnth}${ath} ผู้ครองแห่ง${th} ${dth} มันเฝ้าถิ่นนี้มานานจนสัตว์ทั้งแคว้นยอมก้มหัว และจะออกมาเมื่อมีผู้ล่าเหยียบเข้ามาในถิ่น`, `The ${aen} ${bnen} Lord rules ${en}. ${den}; every creature of the region bows to it, and it comes out when hunters trespass.`];
    MAPS.push({id, name:th, en, lv:[0, 0], biome, hue, mobs:ids, boss:bid, desc:[dth, den], w3:true});
    added[road].push(id);
  });
  // weave the new regions between the old ones and re-spread each road's levels evenly
  for (const d in ROADS){ const old = ROADS[d].slice(), nw = added[d], out = []; let j = 0;
    old.forEach((id, i) => { out.push(id); const share = Math.round((i + 1) * nw.length / old.length) - Math.round(i * nw.length / old.length); for (let k = 0; k < share; k++) out.push(nw[j++]); });
    while (j < nw.length) out.push(nw[j++]);
    ROADS[d].length = 0; ROADS[d].push(...out);
    const raw = ROAD_LV_RAW[d], lo = raw[0][0], hi = raw[raw.length - 1][1], n = out.length, step = (hi - lo) / n;
    raw.length = 0; for (let k = 0; k < n; k++){ const a = Math.round(lo + k * step); raw.push([a, Math.round(Math.min(hi, a + step * 1.25 + 2))]); } }
}
