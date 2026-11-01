/* VAYRATHEN — js/data/mapstory_east.js — (v212) map stories, the east road: «ตะเกียงรุ่งอรุณ» (The Dawn Lantern)
   The owner asked for story quests on every map: a tale that fits the map, carries on from map to map and pulls you
   along, with rewards that grow with the difficulty and NPCs dressed in wardrobe pieces like player characters.
   This is the first road (Aren and the 15 maps east, Lv 1–100); the south, west and north roads follow the same shape.

   The tale: Khao Hom, granddaughter of Ta Thian the lantern maker of Aren, finds her lost grandpa's handwriting on
   sky lanterns fallen in the fields and sets out east with you. On every map a local NPC has their own trouble, and
   their story turns up a trace of Ta Thian — a carving, a krathong wish, a mooring post, a pipe song… — until the trail
   ends in the Ancient Amber Basin, where he sealed himself in amber to keep the Dawn Lantern from his old apprentice
   Khamao, who wanted to trade its light to the Asura King.

   Each chapter: three steps, each handed back to its NPC — hunt · find (glowing spots on the map) or gather · defeat a
   named elite. The last step gives the NPC's own wardrobe piece (they wear it, so you see it before you earn it). */
'use strict';

const MS_ARCS = [
  {id:'east', title:['ตะเกียงรุ่งอรุณ', 'The Dawn Lantern'], maps:[0, 1, 31, 2, 32, 3, 33, 4, 11, 34, 12, 35, 15, 36, 61, 62],
    blurb:['ตามหาตาเทียนช่างโคมกับข้าวหอม ตลอดเส้นทางตะวันออก', 'Search the east road with Khao Hom for Ta Thian the lantern maker'],
    title_id:'ms_east', mount:'ms_m_krathong'}
];

// the travelling companion: walks the whole east road beside you once she has joined (after the Aren chapter)
const MS_KHAOHOM = {id:'ms_khaohom', name:'ข้าวหอม', en:'Khao Hom', role:['ช่างโคมฝึกหัด · เนื้อเรื่องเสริม', 'Apprentice lantern maker · Side story'],
  sex:'f', hair:5, color:'hairChestnut', eye:'irisGd', gear:{armor:'s_lanna', head:'ms_h_khaohom', mask:'f_blush'}};
// after the last chapter she wears the outfit she made, and her grandpa stands beside her in Aren
const MS_TATHIAN = {id:'ms_tathian', name:'ตาเทียน', en:'Grandpa Thian', role:['ช่างโคมแห่งอาเรน', 'Lantern maker of Aren'],
  sex:'m', hair:2, color:'hairWhite', eye:'irisBr', gear:{armor:'s_rune', head:'ms_x_tathian'}};

const MS_CH = {
  0:{npc:MS_KHAOHOM, title:['โคมลอยที่หลงทาง', 'The Lost Lanterns'], cos:'ms_h_khaohom', steps:[
    {k:'kill', t:'lantern', n:6,
      say:['สวัสดีจ้ะ! ข้าชื่อข้าวหอม หลานสาวตาเทียนช่างโคมแห่งอาเรน… ตาหายไปทางตะวันออกตั้งแต่ข้ายังเล็ก แต่ช่วงนี้โคมลอยที่ตกกลางทุ่งมีลายมือตาเขียนอยู่! ช่วยปลอบโคมลอยหลงทาง 6 ดวงให้หน่อยนะ ข้าจะได้เก็บกระดาษมาอ่าน',
        "Hello! I'm Khao Hom, granddaughter of Ta Thian, the lantern maker of Aren… Grandpa vanished down the east road when I was little, but lately the lanterns that fall in the fields carry his handwriting! Please calm six stray lanterns so I can read their paper."],
      done:['ดูสิ! ลายมือตาจริง ๆ ด้วย… แต่หมึกเลือนไปครึ่งหนึ่ง กระดาษที่เหลือคงปลิวไปตามทุ่ง', "Look! It really is Grandpa's hand… but half the ink has faded. The other pages must have blown across the fields."]},
    {k:'find', n:3, what:['กระดาษโคมลายมือตาเทียน', "Lantern paper in Ta Thian's hand"],
      say:['เห็นแสงวิบวับตามพื้นทุ่งไหม? นั่นแหละกระดาษโคม! เก็บมาให้ครบ 3 แผ่นนะ', 'See the little glints in the grass? Those are lantern papers! Bring me all three.'],
      done:['«ข้าไปตามแสงรุ่งอรุณทางตะวันออก ถ้าใครพบกระดาษนี้ จงบอกข้าวหอมว่าตายังจุดโคมอยู่» …ตายังอยู่! ตายังอยู่จริง ๆ!', '«I follow the dawn light east. Whoever finds this, tell Khao Hom her grandpa still keeps the lantern lit.» …He\'s alive! He\'s really alive!']},
    {k:'item', t:'wick', n:3,
      say:['ข้าจะออกตามหาตา! แต่ต้องมีโคมนำทางก่อน ช่วยหาไส้เทียนวิญญาณ 3 อันจากโคมลอยกลางทุ่งให้ข้าจุดโคมหน่อยนะ', "I'm going to find him! But I need a guiding lantern first. Bring me three Spirit Wicks from the field lanterns so I can light one."],
      done:['โคมนำทางของข้าติดแล้ว! เปลวไฟเอนไปทางตะวันออก… ทางป่าไผ่กระซิบ เจ้าไปด้วยกันนะ สัญญาแล้วนะ! นี่ โบว์ที่ตาผูกให้ตอนข้าเกิด ข้าทำเพิ่มให้เจ้าอันหนึ่ง', "My guiding lantern is lit! The flame leans east… toward the Whispering Bamboo. You'll come with me — promise? Here, a copy of the bow Grandpa tied for me when I was born."]}
  ]},
  1:{npc:{id:'ms_khlui', name:'น้องขลุ่ย', en:'Little Khlui', role:['เด็กเป่าขลุ่ยแห่งป่าไผ่', 'Flute boy of the bamboo'], sex:'m', hair:3, color:'hairBlack', eye:'irisBr', gear:{armor:'s_hanuman', head:'ms_h_bamboo', mask:'f_plaster'}},
    title:['เพลงขลุ่ยที่หายไป', 'The Missing Flute Song'], cos:'ms_h_bamboo',
    kh:['เปลวโคมเอนเข้าหาดงไผ่ตลอดเลย ตาต้องเคยผ่านทางนี้แน่ ๆ', 'My lantern flame keeps leaning toward the bamboo. Grandpa must have come this way.'], steps:[
    {k:'kill', t:'bamboomonkey', n:10,
      say:['ฮือ… ลิงแสมขโมยขลุ่ยข้าไปแล้ว! ขลุ่ยนั่นคุณตาช่างโคมแกะให้ข้า แลกกับลำไผ่ทำโครงโคม ไล่ฝูงลิงให้ข้าที 10 ตัวได้ไหม', 'Waah… the macaques stole my flute! An old lantern maker carved it for me, in trade for lantern bamboo. Can you chase off ten of the monkeys?'],
      done:['ลิงหนีไปเยอะเลย! แต่ขลุ่ยยังไม่กลับมา… พวกมันชอบซ่อนของไว้ในลำไผ่ที่มีรอยสลัก — «คุณตาช่างโคม!? นั่นตาของข้าแน่ ๆ!» ข้าวหอมร้อง', "Lots of them ran off! But my flute isn't back… they hide things in the carved bamboo. — «An old lantern maker!? That must be Grandpa!» cries Khao Hom."]},
    {k:'find', n:3, what:['ลำไผ่ที่มีรอยสลักของตาเทียน', "Bamboo carved by Ta Thian"],
      say:['คุณตาสลักรูปโคมไว้บนลำไผ่ 3 ต้น บอกว่าถ้าลมพัดผ่านจะร้องเป็นเพลง ลองหาดูนะ', 'He carved lanterns into three bamboo stems — he said when the wind blows through, they sing. Try to find them.'],
      done:['ได้ยินไหม… ลมพัดผ่านรอยสลักแล้วเป็นทำนองเพลง! — «นี่คือเพลงกล่อมที่ตาเคยร้องให้ข้าฟัง» ข้าวหอมกระซิบ น้ำตาคลอ', 'Hear that? The wind through the carvings makes a tune! — «That\'s the lullaby Grandpa used to sing me,» Khao Hom whispers, teary-eyed.']},
    {k:'elite', t:'bamboomonkey', name:['จ่าฝูงหางขาว', 'White-tail the Alpha'],
      say:['ขลุ่ยอยู่ที่จ่าฝูงหางขาว! มันตัวใหญ่ ดุมาก ระวังด้วยนะ', 'White-tail, the alpha, has my flute! He\'s big and mean — be careful.'],
      done:['ขลุ่ยข้ากลับมาแล้ว! ในกระบอกขลุ่ยมีกระดาษม้วนเล็ก ๆ… «ทุ่งดอกไม้สีทองจะหันหน้าบอกทาง» นี่ ผ้าโพกลายไผ่ของข้า ให้เจ้าเป็นที่ระลึก', 'My flute\'s back! There\'s a tiny scroll inside… «The golden flowers will turn to show the way.» Here, my bamboo-print head wrap — a keepsake.']}
  ]},
  31:{npc:{id:'ms_tawan', name:'น้องทานตะวัน', en:'Nong Tawan', role:['สาวชาวไร่ทานตะวัน', 'Sunflower farm girl'], sex:'f', hair:8, color:'hairBlonde', eye:'irisBr', gear:{armor:'s_lotus', head:'ms_h_ngob', mask:'f_blushs'}},
    title:['ทานตะวันที่หันผิดทาง', 'The Sunflowers That Face the Night'], cos:'ms_h_ngob',
    kh:['ทานตะวันที่นี่หันหน้าไปทางตะวันออกทั้งที่เป็นกลางคืน… แปลกจัง', 'The sunflowers face east even at night… how strange.'], steps:[
    {k:'kill', t:'sunflower_beetle', n:12,
      say:['เดือดร้อนแล้ว! ด้วงทานตะวันกินเมล็ดในไร่จนเกือบหมด เมล็ดพวกนี้คุณตาช่างโคมฝากไว้ บอกว่าเป็น «เมล็ดรุ่งอรุณ» ช่วยไล่ด้วง 12 ตัวหน่อยนะ', 'Disaster! Sunflower beetles are eating nearly every seed. The lantern maker left these seeds with us — «dawn seeds», he called them. Please chase off 12 beetles!'],
      done:['เมล็ดที่เหลือเรืองแสงอ่อน ๆ ในมือ… อุ่นเหมือนแสงแดดยามเช้าเลย', 'The seeds that are left glow softly in my hand… warm as morning sun.']},
    {k:'item', t:'m_sunflower_finch', n:5,
      say:['ข้าจะทำหุ่นไล่กาตัวใหม่ แต่ต้องใช้ขนนกฟินช์ 5 ชิ้นมาประดับให้มันดูน่ากลัว… ไม่สิ น่ารัก!', "I'm making a new scarecrow, but I need five finch feathers to make it look scary… no — cute!"],
      done:['หุ่นไล่กาน่ารักที่สุดในทุ่ง! เอ๊ะ… หุ่นไล่กาตัวเก่าตรงขอบไร่หายไปไหน', 'The cutest scarecrow in the fields! Huh… where did the old scarecrow at the edge of the farm go?']},
    {k:'elite', t:'sunflower_golem', name:['หุ่นไล่กายักษ์ที่ตื่นขึ้น', 'The Woken Scarecrow Giant'],
      say:['หุ่นไล่กาตัวเก่าดูดแสงจากเมล็ดรุ่งอรุณจนตื่นขึ้นมาอาละวาด! ช่วยหยุดมันที', 'The old scarecrow drank the light of the dawn seeds and woke up raging! Please stop it!'],
      done:['ในอกหุ่นไล่กามีเมล็ดรุ่งอรุณเม็ดใหญ่ที่สุด กับโน้ตของตาเทียน «ข้าทิ้งรอยไว้ที่บึงบัวแดง» นี่ งอบทานตะวันของข้า สวมแล้วแดดไม่แผดเผาเลยนะ', "Inside the scarecrow's chest: the biggest dawn seed, and a note from Ta Thian — «I left a trail at the Red Lotus Marsh.» Take my sunflower ngob hat; the sun can't scorch you in it."]}
  ]},
  2:{npc:{id:'ms_buaphan', name:'บัวผัน', en:'Bua Phan', role:['แม่ค้าบัวสาว', 'Lotus seller'], sex:'f', hair:11, color:'hairBlack', eye:'irisPk', gear:{armor:'ms_t_lotus', head:'f_clip'}, wing:'a_sakura'},
    title:['พรายบัวผู้รอคอย', 'The Wraith Who Waits'], cos:'ms_t_lotus',
    kh:['บัวแดงที่นี่เหี่ยวหมดเลย… แต่ทำไมใจข้าเต้นแรงจัง', 'All the red lotuses are wilting… so why is my heart racing?'], steps:[
    {k:'kill', t:'giantleech', n:12,
      say:['ข้าพายเรือเก็บบัวไม่ได้เลยจ้ะ ปลิงควายตัวยักษ์เต็มบึง ช่วยกำจัดสัก 12 ตัวนะ แล้วข้าจะเล่าเรื่องคุณตาช่างโคมให้ฟัง', "I can't paddle out for lotuses — the marsh is full of giant leeches. Clear out 12 and I'll tell you about the old lantern maker."],
      done:['ขอบใจจ้ะ… เมื่อสิบปีก่อน คุณตามาที่นี่ ลอยกระทงให้พรายน้ำตนหนึ่งที่รอคนรักอยู่ทุกคืน', 'Thank you… Ten years ago he came here and floated krathongs for a water wraith who waits for her love every night.']},
    {k:'find', n:3, what:['กระทงใบตองของตาเทียน', "Ta Thian's banana-leaf krathong"],
      say:['กระทงของคุณตายังลอยค้างอยู่ตามกอบัว 3 ใบ ข้างในมีคำอธิษฐาน ลองไปเก็บมาดูนะ', 'Three of his krathongs still drift among the lotus clumps, each with a wish inside. Go and look.'],
      done:['คำอธิษฐานเขียนว่า «ขอให้นางได้พบคนที่รอ» — «ตาเป็นแบบนี้แหละ ใจดีกับทุกคน แม้แต่ผี» ข้าวหอมยิ้ม', 'The wish reads «May she find the one she waits for.» — «That\'s just like Grandpa,» Khao Hom smiles, «kind to everyone, even ghosts.»']},
    {k:'elite', t:'waterwraith', name:['พรายบัวผู้รอคอย', 'The Waiting Lotus Wraith'],
      say:['เสียงอสูรทำให้พรายตนนั้นคลั่ง นางดึงคนลงน้ำแล้ว! ช่วยปลดปล่อยนางทีนะ', 'The Asura\'s whisper drove her mad — she\'s dragging people under! Please set her free.'],
      done:['นางยิ้มก่อนจางหาย ทิ้งแหวนทองเหลืองที่สลักว่า «เทียน» ไว้… นางบอกว่าคุณตาล่องเรือไปทางสวนผลไม้ป่า ชุดแม่ค้าบัวของข้า เจ้าเอาไปใส่เถอะ สวยกว่าข้าใส่อีก', 'She smiled as she faded, leaving a brass ring engraved «Thian»… she said the old man rowed toward the Wild Orchard. Take my lotus-seller dress — it suits you better than me!']}
  ]},
  32:{npc:{id:'ms_somo', name:'ส้มโอ', en:'Som-O', role:['เด็กเฝ้าสวนผลไม้', 'Orchard keeper'], sex:'m', hair:6, color:'hairOrange', eye:'irisGr', gear:{armor:'s_forest', head:'h_wreathj', mask:'ms_k_fruit'}},
    title:['สวนผลไม้ของภูตตะกละ', "The Glutton's Orchard"], cos:'ms_k_fruit',
    kh:['กลิ่นมะม่วงหอมจัง… ตาชอบกินข้าวเหนียวมะม่วงที่สุดเลย', 'It smells of mango… Grandpa loved mango sticky rice more than anything.'], steps:[
    {k:'kill', t:'orchard_crawler', n:12,
      say:['หนอนผลไม้กินมะม่วงในสวนข้าจนเป็นรูพรุน! ช่วยข้ากำจัด 12 ตัวนะ แล้วข้าจะแบ่งมะม่วงให้', "Fruit worms have chewed holes in every mango! Help me squash 12 and I'll share my mangoes."],
      done:['มะม่วงหวานฉ่ำ เอาไปเลย! เอ๊ะ ข้าวหอม… เจ้าคือหลานคุณตาเทียนใช่ไหม? คุณตาเคยแลกน้ำมันโคมกับผลไม้ที่นี่ทุกปี', "Sweet juicy mangoes — have some! Wait, Khao Hom… you're Ta Thian's granddaughter? He traded lantern oil for fruit here every year."]},
    {k:'item', t:'m_orchard_pheasant', n:5,
      say:['ไก่ฟ้าในสวนมีขนสวยมาก คุณตาเคยเอาขนมาประดับโคม เก็บมาให้ข้า 5 ชิ้น ข้าจะทำพู่โคมให้ข้าวหอม', "The orchard pheasants have lovely feathers — he used them to trim lanterns. Bring me 5 and I'll make Khao Hom a lantern tassel."],
      done:['พู่โคมสีรุ้งเสร็จแล้ว! แต่… ทำไมผลไม้ทั้งสวนหายไปในคืนเดียว ใครขโมยไปนะ', 'A rainbow tassel, done! But… why did the whole orchard\'s fruit vanish in one night? Who took it?']},
    {k:'elite', t:'orchard_fiend', name:['ภูตตะกละกินผลไม้', 'The Gluttonous Orchard Fiend'],
      say:['ภูตตะกละนั่นเอง! มันกินผลไม้ทั้งสวน แล้วยังจะกินลังไม้ที่คุณตาฝากไว้อีก ช่วยข้าด้วย!', "It's the gluttonous fiend! It ate the whole orchard and now it's after the crate the old man left with us — help!"],
      done:['ในลังไม้มีพายเรือเล็ก ๆ กับโน้ต «ล่องไปกับแม่แจวเรือที่ท่าเจ้าพระยา» นี่ สติกเกอร์แก้มผลไม้ของข้า ใส่แล้วน่ารักนะ', 'Inside the crate: a little oar and a note — «Ride with the ferry rower at the Chao Phraya pier.» Here, my fruit-cheek stickers. They make you look adorable!']}
  ]},
  3:{npc:{id:'ms_jaem', name:'พี่แจ่ม', en:'Jaem', role:['แม่แจวเรือข้ามฟาก', 'Ferry rower'], sex:'f', hair:2, color:'hairBrown', eye:'irisBr', gear:{armor:'ms_t_rower', head:'f_bow'}},
    title:['ท่าเรือของแม่แจว', "The Ferry Rower's Pier"], cos:'ms_t_rower',
    kh:['ข้าไม่เคยเห็นแม่น้ำกว้างขนาดนี้เลย… ตาต้องนั่งเรือข้ามไปแน่ ๆ', "I've never seen a river this wide… Grandpa must have crossed by boat."], steps:[
    {k:'kill', t:'watermonitor', n:12,
      say:['เรือข้าออกไม่ได้เพราะตะกวดยึดท่าน้ำ! ไล่มันสัก 12 ตัว แล้วข้าจะพาเจ้าลงเรือ', "My boat can't leave — monitor lizards have taken the pier! Drive off 12 and I'll row you anywhere."],
      done:['ท่าน้ำโล่งแล้ว! แม่ข้าเคยแจวเรือพาคุณตาเทียนล่องลงใต้ แม่จดบันทึกการเดินทางไว้ที่หลักผูกเรือ', "The pier's clear! My mother once rowed Ta Thian downriver. She carved the trip into the mooring posts."]},
    {k:'find', n:3, what:['หลักผูกเรือที่มีรอยจาร', 'Carved mooring post'],
      say:['หลักผูกเรือเก่า 3 หลักตามริมน้ำ แม่สลักไว้ว่าพาคุณตาไปถึงไหน ลองไปอ่านดู', 'Three old mooring posts along the bank — Mother carved how far she took him. Go read them.'],
      done:['«ส่งตาเทียนถึงน้ำตกเจ็ดสี ท่านบอกว่าจะหาแก้วสีมาทำโคม» …แต่ไม้พายของแม่ที่ข้าใช้ หายไปเมื่อเช้านี้!', '«Took Ta Thian as far as the Seven-hued Falls; he wanted colored glass for his lantern.» …But my mother\'s oar went missing this morning!']},
    {k:'elite', t:'riverotter', name:['นากจอมขโมยไม้พาย', 'The Oar-thief Otter'],
      say:['เจ้านากเจ้าเล่ห์นั่นแหละ! มันคาบไม้พายแม่ข้าวิ่งไปริมฝั่ง ไปเอาคืนมาที!', "That sneaky otter! It ran off along the bank with Mother's oar in its mouth. Get it back!"],
      done:['ไม้พายแม่กลับมาแล้ว ขอบใจนะ! ชุดแม่แจวเรือของข้า ตัดเย็บเองกับมือ เจ้าเอาไปใส่ล่องเรือนะ', "Mother's oar is home — thank you! Take my ferry rower's outfit; I sewed it myself."]}
  ]},
  33:{npc:{id:'ms_rung', name:'น้องรุ้ง', en:'Rung', role:['กินรีน้อยแห่งน้ำตก', 'Little kinnaree of the falls'], sex:'f', hair:14, color:'hairSky', eye:'irisTl', gear:{armor:'s_kinnaree', head:'h_wreath'}, wing:'ms_b_rainbow'},
    title:['แก้วเจ็ดสีของกินรี', "The Kinnaree's Seven-hued Glass"], cos:'ms_b_rainbow',
    kh:['น้ำตกเป็นสีรุ้งจริง ๆ ด้วย! ข้าจะวาดลายนี้ลงโคมใบต่อไป', "The falls really are rainbow-colored! I'll paint this on my next lantern."], steps:[
    {k:'kill', t:'rainbowfall_crab', n:12,
      say:['อ๊ะ! มนุษย์… อย่าบอกใครนะว่าเห็นกินรีอาบน้ำ! ถ้าเจ้าช่วยไล่ปูที่หนีบปีกข้า 12 ตัว ข้าจะไม่โกรธ', "Ah! A human… don't tell anyone you saw a kinnaree bathing! Chase off 12 crabs that keep pinching my wings and I won't be cross."],
      done:['ขอบใจจ้ะ… เจ้าคงเป็นเพื่อนคุณตาช่างโคมสินะ ท่านเคยขอแก้วสีจากข้าไปทำโคม', 'Thank you… you must be friends of the old lantern maker. He once asked me for colored glass.']},
    {k:'item', t:'m_rainbowfall_wisp', n:5,
      say:['แก้วสีเกิดจากละอองรุ้ง ถ้าเจ้าเก็บละอองจากภูตรุ้งมาได้ 5 ชิ้น ข้าจะหลอมแก้วให้ข้าวหอมทำโคมเหมือนคุณตา', "The glass is made of rainbow mist. Bring me 5 from the rainbow wisps and I'll melt glass for Khao Hom's lantern."],
      done:['แก้วเจ็ดสีเสร็จแล้ว! …แต่ยักษ์ศิลาใต้น้ำตกตื่นขึ้นเพราะเสียงกระซิบ มันจะทุบแก้วทั้งหมด!', "The seven-hued glass is done! …but the stone giant under the falls has woken to the whisper — it'll smash all the glass!"]},
    {k:'elite', t:'rainbowfall_golem', name:['ยักษ์ศิลาเจ็ดสี', 'The Seven-hued Stone Giant'],
      say:['ช่วยหยุดยักษ์ศิลาก่อนมันทุบโถงแก้วของข้านะ!', 'Stop the stone giant before it smashes my glass hall!'],
      done:['โคมของข้าวหอมได้กระจกเจ็ดสีแล้ว สวยเหมือนโคมของคุณตา! คุณตาบอกข้าว่าจะไปซื้อน้ำมันโคมที่ตลาดน้ำ… ปีกรุ้งคู่นี้ ข้าทอจากละอองน้ำตก ให้เจ้านะ', "Khao Hom's lantern has seven-hued panes — as lovely as her grandpa's! He told me he'd buy lamp oil at the floating market… Take these rainbow wings; I wove them from the falls' mist."]}
  ]},
  4:{npc:{id:'ms_choi', name:'แม่ช้อย', en:'Mae Choi', role:['แม่ค้าขนมตลาดน้ำ', 'Floating-market sweets seller'], sex:'f', hair:17, color:'hairBlack', eye:'irisBr', gear:{armor:'s_siam', head:'f_clipstar', mask:'ms_k_veil'}},
    title:['ชายสวมหน้ากากโคมดำ', 'The Man in the Black Lantern Mask'], cos:'ms_k_veil',
    kh:['ตลาดน้ำเงียบเชียบ… ตะเกียงบนเรือลุกขึ้นเองได้ยังไงกัน', 'The market is so quiet… how do the boat lamps light themselves?'], steps:[
    {k:'kill', t:'boatlamp', n:12,
      say:['อย่าเข้าใกล้ตะเกียงเรือนะ! มันลุกไหม้เองทุกคืน ตั้งแต่ชายแปลกหน้ามาเหมาน้ำมันโคมทั้งตลาด ช่วยดับมัน 12 ดวงที', "Don't go near the boat lamps! They've burned by themselves every night since a stranger bought up all the lamp oil in the market. Please put out twelve."],
      done:['ชายคนนั้นสวมหน้ากากรูปโคมสีดำ… — «ตาเทียนตัวจริงไม่เคยเหมาน้ำมันจนคนอื่นไม่มีใช้หรอก» ข้าวหอมว่า', 'The man wore a black lantern-shaped mask… — «The real Ta Thian would never buy up all the oil and leave none for others,» says Khao Hom.']},
    {k:'find', n:3, what:['ไหน้ำมันโคมที่ถูกซ่อน', 'Hidden jar of lamp oil'],
      say:['ข้าเห็นเขาซ่อนไหน้ำมันไว้ 3 ไหตามท่าเรือ ไปหามาคืนแม่ค้าทุกคนทีนะ', 'I saw him hide three oil jars around the piers. Find them and give the oil back to everyone.'],
      done:['บนไหมีตราประทับ «เขม่า» …ข้าวหอมหน้าซีด «เขม่าคือลูกศิษย์ของตา ที่ถูกไล่ออกเพราะเล่นของต้องห้าม»', 'The jars bear a seal: «Khamao». Khao Hom goes pale. «Khamao was Grandpa\'s apprentice — sent away for meddling with forbidden things.»']},
    {k:'elite', t:'phantommerchant', name:['พ่อค้าผีโคมดำ', 'The Black-lantern Phantom Merchant'],
      say:['เขม่าทิ้งพ่อค้าผีไว้เฝ้าตลาด มันกินแสงตะเกียงทุกดวง! ช่วยกำจัดมันที', 'Khamao left a phantom merchant to guard the market — it eats every lamp\'s light! Please get rid of it.'],
      done:['ตะเกียงกลับมาเป็นของคนในตลาดแล้ว… ผ้าคลุมหน้าแม่ค้าราตรีนี่ ใส่แล้วผีไม่กล้าแตะตัวนะ เก็บไว้เถอะ', "The lamps belong to the market folk again… Take this night-vendor's veil — ghosts won't dare touch you in it."]}
  ]},
  11:{npc:{id:'ms_samut', name:'สมุทร', en:'Samut', role:['ไต้ก๋งน้อย', 'Little skipper'], sex:'m', hair:9, color:'hairNavy', eye:'irisBl', gear:{armor:'ms_t_sailor', head:'f_clipstar'}},
    title:['แผนที่ของนกนางนวลโจรสลัด', "The Pirate Gulls' Chart"], cos:'ms_t_sailor',
    kh:['ทะเล! ตาเคยเล่าว่าทะเลอันดามันใสจนเห็นปลาว่ายอยู่ใต้เท้า', 'The sea! Grandpa said the Andaman is so clear you can see fish under your feet.'], steps:[
    {k:'kill', t:'pirategull', n:12,
      say:['อาฮอย! นกนางนวลโจรสลัดขโมยแผนที่เดินเรือของพ่อข้าไป! ช่วยไล่มัน 12 ตัว แผนที่อาจหล่นลงมา', "Ahoy! Pirate gulls snatched my father's sea chart! Chase off 12 — maybe they'll drop it."],
      done:['แผนที่หล่นลงมาแล้ว แต่ขาดเป็นชิ้น ๆ แถมปูเสฉวนคาบเศษไปทำบ้านหมด', "The chart fell, but it's in pieces — and hermit crabs have carried the scraps off to line their shells."]},
    {k:'item', t:'m_hermitcrab', n:5,
      say:['เก็บของจากปูเสฉวนมา 5 ชิ้น ข้าจะต่อแผนที่ให้ครบ', "Bring me 5 bits from the hermit crabs and I'll piece the chart together."],
      done:['แผนที่ครบแล้ว! มีวงกลมสีแดงที่ป่าโกงกาง กับลายมือ «ที่ซ่อนเรือของเทียน» …แต่งูสมิงทะเลขดอยู่ตรงทางเข้าอ่าว', "The chart is whole! There's a red circle at the mangroves, in Ta Thian's hand: «Where I hid my boat.» …but a sea krait is coiled at the bay's mouth."]},
    {k:'elite', t:'seakrait', name:['งูสมิงทะเลลายแผนที่', 'The Chart-striped Sea Krait'],
      say:['มันพันเสาเรือข้าไว้ ข้าออกเรือไม่ได้! ช่วยไล่มันที', "It's wrapped round my mast — I can't sail! Drive it off!"],
      done:['เราออกเรือได้แล้ว! ชุดกะลาสีอันดามันชุดนี้พ่อข้าให้มา แต่ข้ายังตัวเล็กเกินจะใส่ เจ้าเอาไปเถอะ', "We can sail! This Andaman sailor suit was my father's gift, but I'm still too small for it. It's yours."]}
  ]},
  34:{npc:{id:'ms_muk', name:'มุก', en:'Muk', role:['สาวเก็บหอยป่าโกงกาง', 'Mangrove shell gatherer'], sex:'f', hair:20, color:'hairAuburn', eye:'irisBr', gear:{armor:'s_ocean', head:'ms_h_shell'}},
    title:['เรือที่ซ่อนในรากโกงกาง', 'The Boat in the Mangrove Roots'], cos:'ms_h_shell',
    kh:['รากไม้พันกันเหมือนเขาวงกตเลย… ตาซ่อนเรือไว้ตรงไหนนะ', 'The roots tangle like a maze… where did Grandpa hide his boat?'], steps:[
    {k:'kill', t:'mangrove_crawler', n:12,
      say:['ระวังเท้านะจ๊ะ! แมลงโกงกางเต็มโคลนเลย ช่วยไล่ 12 ตัว ข้าจะได้พาไปดูรากที่เรืองแสง', "Mind your feet! The mud's full of mangrove crawlers. Clear 12 and I'll show you the glowing roots."],
      done:['รากโกงกางบางต้นเรืองแสงมาสิบปีแล้ว ตั้งแต่ชายแก่ถือโคมมาพักที่นี่', 'Some mangrove roots have glowed for ten years — ever since an old man with a lantern rested here.']},
    {k:'find', n:3, what:['รากโกงกางเรืองแสง', 'Glowing mangrove root'],
      say:['รากที่เรืองแสงมี 3 จุด ลองไปดูสิ อาจมีอะไรซ่อนอยู่', 'There are three glowing roots. Go look — something might be hidden there.'],
      done:['เจองอบเก่า ใบเรือขาด กับหีบไม้ว่างเปล่า… โน้ตในหีบเขียนว่า «เขม่าตามมา ข้าต้องไปขอความช่วยเหลือที่เกาะผีเสื้อสมุทร»', 'An old hat, a torn sail and an empty chest… the note inside: «Khamao follows me. I must seek help on the Sea-Ogress Isle.»']},
    {k:'elite', t:'mangrove_golem', name:['ยักษ์รากโกงกาง', 'The Mangrove-root Giant'],
      say:['รากไม้ตื่นขึ้นพันเรือคุณตาไว้แน่น! ถ้าไม่ปราบ เราตามไปเกาะไม่ได้นะ', "The roots woke and bound his boat fast! Unless we beat it, we can't follow him to the isle."],
      done:['เรือคุณตาลอยได้อีกครั้ง! หมวกเก็บหอยใบนี้ข้าสานเอง ใส่กันแดดกันฝนได้ดีนะ', 'His boat floats again! I wove this shell-gatherer\'s hat myself — good against sun and rain.']}
  ]},
  12:{npc:{id:'ms_soi', name:'สร้อยสมุทร', en:'Soi Samut', role:['นางเงือกน้อย', 'Little mermaid'], sex:'f', hair:22, color:'hairTeal', eye:'irisTl', gear:{armor:'s_coral', mask:'ms_k_fin', head:'f_clip'}, wing:'a_bubble'},
    title:['เพลงปี่ของพระอภัย', "Phra Aphai's Pipe Song"], cos:'ms_k_fin',
    kh:['นี่คือเกาะของนางผีเสื้อสมุทรในนิทานพระอภัยมณีใช่ไหม… ขนลุกเลย', "This is the Sea Ogress's island from the tale of Phra Aphai Mani, isn't it… goosebumps."], steps:[
    {k:'kill', t:'seawraith', n:12,
      say:['ชู่… อย่าส่งเสียงดัง ผีทะเลกำลังล่ามนุษย์! ข้าคือเงือกที่ช่วยคุณตาช่างโคมไว้ ช่วยไล่ผีทะเล 12 ตนก่อน แล้วข้าจะเล่าให้ฟัง', "Shh… sea wraiths are hunting humans! I'm the mermaid who helped the lantern maker. Drive off 12 wraiths, then I'll tell you everything."],
      done:['คุณตาเป่าปี่เพลงเดียวกับพระอภัยมณี นางผีเสื้อสมุทรเคลิ้มหลับ ท่านจึงผ่านไปได้ แต่ปี่เลานั้นแตกกลางทาง', 'He played the same pipe song as Phra Aphai Mani; the Ogress fell into a trance and let him pass. But the pipe cracked on the way.']},
    {k:'item', t:'m_giantclam', n:5,
      say:['ของจากหอยมือเสือใช้ซ่อมปี่ได้ ช่วยหามา 5 ชิ้นนะ ข้าจะซ่อมปี่ให้ข้าวหอมเป่าเพลงของตา', "Treasures from the giant clams can mend the pipe. Bring me 5 and I'll fix it for Khao Hom to play her grandpa's song."],
      done:['ปี่ซ่อมเสร็จแล้ว! ข้าวหอมเป่าเพลงกล่อมที่ได้ยินในป่าไผ่… ทะเลสงบลงทันที! แต่งูทะเลผู้เฝ้าเกาะยังไม่ยอมให้ผ่าน', "The pipe is mended! Khao Hom plays the lullaby from the bamboo grove… and the sea calms at once! But the serpent guarding the isle still won't let us pass."]},
    {k:'elite', t:'seaserpent', name:['งูทะเลผู้เฝ้าเกาะ', 'The Isle-guardian Serpent'],
      say:['มันถูกเสียงอสูรครอบงำ ไม่ฟังเพลงแล้ว ต้องสู้อย่างเดียว!', "The Asura's whisper has it — it won't listen to music now. We have to fight!"],
      done:['ทางเปิดแล้ว คุณตาไปต่อทางหุบเขาหิ่งห้อย… หูครีบไข่มุกนี้ ใส่แล้วเจ้าจะได้ยินเสียงทะเลทุกที่เลยนะ', 'The way is open — he went on to the Firefly Valley… Wear these pearl fin-ears and you\'ll hear the sea wherever you go.']}
  ]},
  35:{npc:{id:'ms_saeng', name:'แสง', en:'Saeng', role:['เด็กชายหิ่งห้อย', 'Firefly boy'], sex:'m', hair:12, color:'hairMint', eye:'irisGd', gear:{armor:'s_shadow', head:'f_clipstar'}, wing:'ms_b_firefly'},
    title:['หิ่งห้อยในขวดแก้ว', 'Fireflies in Glass Jars'], cos:'ms_b_firefly',
    kh:['หุบเขามืดสนิทเลย… หิ่งห้อยหายไปไหนหมด', 'The valley is pitch dark… where have all the fireflies gone?'], steps:[
    {k:'kill', t:'firefly_fiend', n:12,
      say:['ภูตมืดไล่จับหิ่งห้อยไปหมดแล้ว หุบเขาเลยมืด ข้ากลัว… ช่วยไล่ภูต 12 ตัวได้ไหม', "Dark fiends caught all the fireflies, so the valley went dark. I'm scared… could you drive off 12?"],
      done:['มีคนสั่งให้ภูตจับหิ่งห้อยใส่ขวด… ชายหน้ากากโคมดำ เขาบอกว่า «แสงทั้งหมดต้องเป็นของข้า»', 'Someone ordered the fiends to jar the fireflies… a man in a black lantern mask. He said «All light must be mine.»']},
    {k:'find', n:3, what:['ขวดแก้วขังหิ่งห้อย', 'Jar of trapped fireflies'],
      say:['ขวดแก้วถูกซ่อนไว้ 3 ใบ เปิดฝาปล่อยหิ่งห้อยให้หน่อยนะ', 'Three jars are hidden around the valley. Open them and let the fireflies go!'],
      done:['หิ่งห้อยบินเป็นสายไปทางสระอโนดาต เหมือนชี้ทางให้เรา! …แต่ขวดยักษ์ที่เขม่าใช้ขังหิ่งห้อยทั้งหุบลุกขึ้นเดินได้!', 'The fireflies stream away toward Lake Anodat, as if showing us the way! …but the giant jar Khamao used for the whole valley has got up and walked!']},
    {k:'elite', t:'firefly_golem', name:['ยักษ์ขวดแก้ว', 'The Glass-jar Giant'],
      say:['ทุบขวดยักษ์ให้แตก หิ่งห้อยที่เหลือจะได้เป็นอิสระ!', 'Smash the giant jar and the last fireflies will be free!'],
      done:['หุบเขาสว่างไสวอีกครั้ง! หิ่งห้อยฝูงนี้อยากตามเจ้าไปด้วย ข้าให้มันเป็นเพื่อนเจ้านะ', 'The valley glows again! This little swarm wants to follow you — I\'ll let them keep you company.']}
  ]},
  15:{npc:{id:'ms_arunee', name:'อรุณี', en:'Arunee', role:['หงส์ทองแห่งสระอโนดาต', 'Golden hamsa of Lake Anodat'], sex:'f', hair:4, color:'hairGold', eye:'irisGd', gear:{armor:'ms_t_hamsa', head:'h_plume'}, wing:'w_swan'},
    title:['น้ำศักดิ์สิทธิ์ของโคมรุ่งอรุณ', 'Holy Water for the Dawn Lantern'], cos:'ms_t_hamsa',
    kh:['สระอโนดาต… ข้ารู้สึกได้ว่าโคมของข้าอุ่นขึ้น', 'Lake Anodat… I can feel my lantern growing warm.'], steps:[
    {k:'kill', t:'matchanu', n:12,
      say:['มัจฉานุตัวน้อยถูกเสียงอสูรปลุกให้ซน แย่งน้ำศักดิ์สิทธิ์ไปเล่น ช่วยห้ามพวกมัน 12 ตัวนะเจ้าคะ', 'The little Matchanu have been stirred by the whisper and splash the holy water about. Please stop 12 of them.'],
      done:['ข้าจำคุณตาเทียนได้ ท่านมาตักน้ำศักดิ์สิทธิ์เติมโคมรุ่งอรุณ เพื่อให้เปลวไฟของผนึกไม่ดับ', "I remember Ta Thian. He came to fill the Dawn Lantern with holy water, so the seal's flame would never go out."]},
    {k:'item', t:'m_goldshrimp', n:5,
      say:['ต้องใช้ของจากกุ้งทอง 5 ชิ้นทำพิธีเปิดสระ เจ้าหามาให้ได้ไหม ข้าจะตักน้ำให้ข้าวหอมด้วย', "The rite to open the lake needs 5 offerings from the golden shrimp. Can you bring them? I'll draw water for Khao Hom too."],
      done:['พิธีสำเร็จ น้ำในขวดของข้าวหอมส่องแสง… แต่นาคน้อยตนหนึ่งโดนคำสาปของเขม่า มันขวางทางออกจากสระ', "The rite is done; the water in Khao Hom's flask shines… but a young naga, cursed by Khamao, blocks the way out."]},
    {k:'elite', t:'lakenaga', name:['นาคน้อยหลงคำสาป', 'The Cursed Young Naga'],
      say:['ช่วยปลุกเขาจากคำสาปทีนะเจ้าคะ แต่ระวัง เขี้ยวเขามีพิษ', 'Please wake him from the curse — but careful, his fangs carry venom.'],
      done:['นาคน้อยกลับเป็นปกติ เขาบอกว่าเขม่าตามคุณตาไปที่เนินบัวตอง… ชุดหงส์ทองนี้ทอจากขนหงส์ที่ร่วงในสระ ให้เจ้านะเจ้าคะ', 'The young naga is himself again — he says Khamao chased the old man to the Goldbloom Hills… Take this golden hamsa gown, woven from feathers shed on the lake.']}
  ]},
  36:{npc:{id:'ms_fai', name:'ฝ้าย', en:'Fai', role:['ช่างเขียนร่มกระดาษ', 'Paper umbrella painter'], sex:'f', hair:6, color:'hairChestnut', eye:'irisBr', gear:{armor:'s_peacock', head:'f_bowp', mask:'ms_k_paint'}},
    title:['ร่มลายบัวตองกับความจริง', 'Painted Umbrellas and the Truth'], cos:'ms_k_paint',
    kh:['ดอกบัวตองเหลืองทั้งเนินเลย… ข้าสัญญากับตัวเองว่าจะไม่ร้องไห้จนกว่าจะเจอตา', "The whole hill is gold with blooms… I promised myself I won't cry until I find Grandpa."], steps:[
    {k:'kill', t:'goldbloom_wolf', n:12,
      say:['หมาป่าบัวตองบุกร้านร่มข้า ฉีกร่มกระดาษไปหลายคัน ช่วยไล่ 12 ตัวหน่อยนะ', 'Goldbloom wolves raided my umbrella shop and tore up my paper parasols! Please drive off 12.'],
      done:['เมื่อเดือนก่อน มีชายแก่ถือโคมกับชายสวมหน้ากากดำผ่านมา ทะเลาะกันเสียงดัง ข้าวาดเรื่องที่เห็นไว้บนร่ม 3 คัน', 'Last month an old man with a lantern and a man in a black mask passed by, arguing loudly. I painted what I saw on three umbrellas.']},
    {k:'find', n:3, what:['ร่มกระดาษที่วาดเรื่องราว', 'Painted paper umbrella'],
      say:['ร่ม 3 คันปลิวไปกับลม ลองไปเก็บดู เจ้าจะรู้เรื่องทั้งหมด', "The wind carried the three umbrellas off. Find them and you'll see the whole story."],
      done:['ภาพบนร่มเล่าว่า เขม่าอยากได้โคมรุ่งอรุณไปแลกพลังจากราชาอสูร ตาเทียนไม่ยอม จึงหนีไปทางป่าดึกดำบรรพ์… ข้าวหอมกำมือแน่น', "The paintings tell it: Khamao wants the Dawn Lantern to trade for the Asura King's power. Ta Thian refused and fled toward the primeval forest… Khao Hom clenches her fists."]},
    {k:'elite', t:'goldbloom_golem', name:['หุ่นดินบัวตอง', 'The Goldbloom Clay Golem'],
      say:['เขม่าปั้นหุ่นดินไว้ขวางทางไปป่าดึกดำบรรพ์! ช่วยทลายมันที!', 'Khamao sculpted a clay golem to bar the way to the primeval forest! Break it!'],
      done:['ทางเปิดแล้ว! ลายดอกบัวตองที่ข้าวาดบนแก้ม ใส่แล้วสดใสเหมือนเนินนี้ตลอดไปนะ', 'The way is open! Wear these goldbloom cheek paintings — bright as these hills forever.']}
  ]},
  61:{npc:{id:'ms_namfon', name:'น้ำฝน', en:'Namfon', role:['นักขุดฟอสซิล', 'Fossil hunter'], sex:'f', hair:1, color:'hairBrown', eye:'irisGr', gear:{armor:'ms_t_explorer', mask:'f_round', head:'hc_hide'}},
    title:['รอยเท้าโบราณ', 'Ancient Footprints'], cos:'ms_t_explorer',
    kh:['ไดโนเสาร์จริง ๆ!? ตาไม่เคยเล่าเรื่องนี้เลย!', 'Real dinosaurs!? Grandpa never told me about this!'], steps:[
    {k:'kill', t:'compsog', n:12,
      say:['ระวัง! คอมซอกเนธัสตัวเล็กแต่กัดเจ็บนะ ช่วยไล่ 12 ตัวก่อน ข้าจะได้ขุดต่อ', 'Watch out! Compsognathus are small but they bite! Chase off 12 so I can keep digging.'],
      done:['ข้าเจอรอยเท้ามนุษย์ปนกับรอยเท้าไดโนเสาร์! รอยใหม่ด้วย… เป็นของชายแก่ที่เดินแบกของหนัก', 'I found human footprints among the dinosaur tracks! Fresh ones… an old man carrying something heavy.']},
    {k:'find', n:3, what:['รอยเท้าฟอสซิลกับรอยรองเท้าฟาง', 'Fossil tracks with straw-sandal prints'],
      say:['รอยเท้าแยกเป็น 3 จุด ลองตามดูสิ ข้าจะจดบันทึก', "The tracks split into three spots. Follow them — I'll take notes."],
      done:['รอยเท้าทั้งหมดมุ่งไปแอ่งอำพันโบราณ… ข้าวหอมมองเห็นแสงสีทองไกล ๆ ตรงนั้น «นั่นแสงโคมรุ่งอรุณ!»', "Every track leads to the Ancient Amber Basin… Khao Hom sees a golden glow far off. «That's the Dawn Lantern's light!»"]},
    {k:'elite', t:'phuwiangraptor', name:['แร็พเตอร์ตาเดียว', 'One-eye the Raptor'],
      say:['แร็พเตอร์ตาเดียวตามกลิ่นเรามา! ต้องจัดการก่อนเข้าแอ่งอำพัน', 'One-eye the raptor is tracking our scent! Deal with it before we enter the basin.'],
      done:['เจ้าเก่งมาก! ชุดนักสำรวจภูเวียงชุดนี้มีกระเป๋าเยอะ เอาไว้ใส่ของที่เจอระหว่างทางนะ', 'Amazing! Take this Phu Wiang explorer outfit — lots of pockets for whatever you find on the road.']}
  ]},
  62:{npc:MS_KHAOHOM, title:['ตะเกียงรุ่งอรุณ', 'The Dawn Lantern'], cos:'ms_t_dawn', finale:true, steps:[
    {k:'kill', t:'ambergolem', n:12,
      say:['ตาอยู่ที่นี่! ข้ารู้สึกได้… แต่หุ่นอำพันเต็มแอ่งไปหมด ช่วยข้าฝ่าไปที 12 ตัว!', "Grandpa's here, I can feel it… but amber golems fill the basin. Help me break through twelve of them!"],
      done:['ดูนั่น! ก้อนอำพันยักษ์กลางแอ่ง… มีคนอยู่ข้างใน กอดโคมไว้แน่น นั่นตา!', "Look! A giant lump of amber in the middle… someone's inside, hugging a lantern tight. It's Grandpa!"]},
    {k:'find', n:3, what:['เศษอำพันที่มีเสียงของตา', "Amber shard holding Grandpa's voice"],
      say:['อำพันแตกเป็นเสี่ยง ๆ มีเสียงตาก้องอยู่ข้างใน เก็บมาให้ครบ 3 ชิ้น ข้าจะใช้เปลวโคมของข้าละลายอำพัน', "Shards have broken off, and Grandpa's voice echoes inside them. Bring me three, and I'll melt the amber with my lantern flame."],
      done:['เสียงตาบอกว่า «ข้าผนึกตัวเองไว้ในอำพัน เพื่อไม่ให้เขม่าแย่งโคมไปได้» …แล้วเขม่าก็มาถึง!', 'Grandpa\'s voice says «I sealed myself in amber so Khamao could never take the lantern» …and then Khamao arrives!']},
    {k:'elite', t:'ambergolem', hp:2.5, name:['อสูรอำพันของเขม่า', "Khamao's Amber Colossus"],
      say:['เขม่าปลุกอสูรอำพันตัวใหญ่ที่สุดขึ้นมา! นี่คือการต่อสู้ครั้งสุดท้าย ข้าจะจุดโคมส่องทางให้เจ้า!', "Khamao has woken the greatest amber colossus! This is the last fight — I'll light the way for you!"],
      done:['อำพันละลาย… ตาเทียนลืมตาขึ้นแล้วยิ้ม «ข้าวหอมของตาโตแล้วนะ» เขม่าคุกเข่าขอโทษ ตาให้อภัยและพาทุกคนกลับอาเรน นี่ ชุดช่างโคมรุ่งอรุณ ข้ากับตาตัดให้เจ้า ขอบคุณที่เดินทางมากับข้านะ!', "The amber melts… Ta Thian opens his eyes and smiles. «My little Khao Hom, all grown up.» Khamao kneels and begs forgiveness; Grandpa forgives him and takes everyone home to Aren. Here — a Dawn Lantern-maker's outfit Grandpa and I made for you. Thank you for walking this road with me!"]}
  ]}
};
