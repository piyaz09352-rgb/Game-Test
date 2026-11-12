/* VAYRATHEN — js/data/mapstory_south.js — (v214) map stories, the south road: «บั้งไฟแสนส่งฟ้า» (The Great Rocket to the Sky)
   20 maps, Lv 70–235: the Weeping Plains, the oasis and the Khmer sanctuary, the sand-buried city and old Ayodhya,
   the gorge and the dunes, the canyon and the mines, the lava fields, the ash forest and Agni's crater, then the dragon
   lands, the gate of Naraka and the Demon Lord's throne.

   The tale: no rain has fallen in the south for three years. Phirun, a rocket maker's daughter on the Weeping Plains,
   learns that the rain naga who carried the clouds is gone, so the sky no longer hears the people. Her late father
   said that when the rain is lost you fire a great rocket (บั้งไฟแสน, as in the Rocket Festival legend) to remind Phaya
   Thaen. Every map's people give one part of it — saltpetre from the temple bats, the plan from a buried library, a
   brass nozzle cast in old Ayodhya, a kite-tail, cactus glue, red clay, sulphur, iron bands, flint, a phoenix-feather
   fuse, the launch chant, Agni's sacred fire, a carved naga head, a cloud-calling pearl, a pass through hell — while the
   Cult of the Dry Flame, who chained the rain naga under the Demon Lord's throne, tries to stop you. At the end the naga
   is freed and the rocket carries her back into the sky: the first rain falls on the south. */
'use strict';

const MS_PHIRUN = {id:'ms_phirun', name:'พิรุณ', en:'Phirun', role:['ช่างบั้งไฟสาว · เนื้อเรื่องเสริม', 'Rocket maker · Side story'],
  sex:'f', hair:9, color:'hairAuburn', eye:'irisBl', gear:{armor:'s_desert', head:'ms_h_rocket', mask:'f_blushs'}};

MS_ARCS.push({id:'south', title:['บั้งไฟแสนส่งฟ้า', 'The Great Rocket to the Sky'], maps:[9, 37, 10, 38, 13, 39, 21, 40, 22, 41, 23, 42, 24, 43, 25, 44, 63, 64, 65, 66],
  blurb:['สร้างบั้งไฟแสนกับพิรุณ เพื่อนำฝนกลับคืนสู่แดนใต้', 'Build the great rocket with Phirun and bring the rain back to the south'],
  title_id:'ms_south', titleName:['ผู้นำฝนคืนฟ้า', 'Rainbringer of the South'], mount:'ms_m_rocket', comp:MS_PHIRUN, compArmor:'ms_t_rain',
  doneSay:['ฝนตกทุกปีแล้วนะ ทุ่งกุลาเขียวไปหมดเลย! ขอบคุณเจ้าจริง ๆ', 'The rain comes every year now and the Kula plain is all green! Thank you, truly.']});

const msN = (id, name, en, roleTh, roleEn, sex, hair, color, eye, gear, wing) => ({id, name, en, role:[roleTh, roleEn], sex, hair, color, eye, gear, wing});

Object.assign(MS_CH, {
  9:{npc:MS_PHIRUN, title:['น้ำตาทุ่งกุลา', 'Tears of the Kula Plain'], cos:'ms_h_rocket', steps:[
    {k:'kill', t:'dustdevil', n:10,
      say:['ฝนไม่ตกที่ทุ่งนี้มาสามปีแล้ว… พายุฝุ่นหมุนวนไม่หยุดเลย ช่วยสลายพายุฝุ่น 10 ลูกก่อนนะ ข้าจะได้ออกไปดูโอ่งน้ำฝน', 'No rain has fallen here for three years… the dust devils never stop. Break up 10 of them so I can check the rain jars.'],
      done:['ขอบใจนะ! พ่อข้าเป็นช่างบั้งไฟ ท่านเคยบอกว่าถ้าฝนหายไป ต้องจุดบั้งไฟแสนขึ้นไปเตือนพญาแถนบนฟ้า', 'Thank you! My father was a rocket maker. He said when the rain is lost, you fire a great rocket to remind Phaya Thaen in the sky.']},
    {k:'find', n:3, what:['โอ่งดินที่มีคำขอฝน', 'Clay jar with a rain prayer'],
      say:['ชาวบ้านเขียนคำขอฝนไว้ในโอ่งดินเก่า 3 ใบกลางทุ่ง ไปดูหน่อยว่ายังอยู่ไหม', 'The villagers wrote rain prayers inside three old clay jars out on the plain. See if they are still there.'],
      done:['ทุกโอ่งเขียนเหมือนกัน «นาคพิรุณหายไป ฟ้าจึงไม่ได้ยินเรา» …นาคพิรุณคือผู้พาเมฆฝนมาที่นี่ ชื่อข้าก็ตั้งตามท่าน', 'Every jar says the same: «The rain naga is gone, so the sky cannot hear us.» …She carried the rain clouds here. I was named after her.']},
    {k:'item', t:'m_banteng', n:5,
      say:['ข้าจะทำบั้งไฟแสนเอง! เริ่มจากของจากวัวแดง 5 ชิ้นไว้หุ้มหัวบั้งไฟ ช่วยข้าหน่อยนะ', "I'll build the great rocket myself! First, 5 pieces from the banteng to wrap its head. Help me?"],
      done:['หัวบั้งไฟเสร็จแล้ว! แต่ยังต้องการอีกเยอะ ทั้งดินประสิว กำมะถัน หาง ชนวน… ทุกอย่างอยู่ทางใต้ เจ้าไปด้วยกันนะ! นี่ ผ้าโพกช่างบั้งไฟของพ่อ ข้าเย็บเพิ่มให้เจ้าผืนหนึ่ง', "The rocket's head is done! But we need so much more — saltpetre, sulphur, a tail, a fuse… all of it lies south. Come with me! Here, a copy of Father's rocket maker's head wrap."]}
  ]},
  37:{npc:msN('ms_baitoei', 'ใบเตย', 'Bai Toei', 'นักบวชสาวแห่งโอเอซิส', 'Oasis priestess', 'f', 13, 'hairGreen', 'irisGr', {armor:'ms_t_oasis', head:'h_wreathj'}),
    title:['โอเอซิสที่กำลังแห้ง', 'The Shrinking Oasis'], cos:'ms_t_oasis',
    kh:['โอเอซิส! น้ำที่นี่จะใช้ผสมดินบั้งไฟได้ไหมนะ', 'An oasis! Could this water mix our rocket powder?'], steps:[
    {k:'kill', t:'oasis_crocodile', n:12, say:['ตะกวดโอเอซิสดุขึ้นทุกวัน เพราะน้ำเหลือน้อยลง ช่วยไล่ 12 ตัวก่อนนะ ข้าจะได้ทำพิธีเรียกน้ำ', 'The oasis monitors grow fiercer as the water shrinks. Drive off 12 so I can perform the water rite.'],
      done:['น้ำในสระลดลงทุกคืน เหมือนมีใครดูดมันไป… คนในชุดคลุมสีส้มแดงมาเดินวนรอบสระทุกคืนเดือนมืด', 'The pool drops every night, as if something drinks it… people in red-orange robes circle it on moonless nights.']},
    {k:'find', n:3, what:['ตราเปลวไฟที่ฝังในทราย', 'Flame seal buried in the sand'], say:['พวกนั้นฝังอะไรไว้รอบสระ 3 จุด ช่วยขุดขึ้นมาดูที', 'They buried something in three places round the pool. Dig them up.'],
      done:['ตราเปลวไฟของ «ลัทธิเปลวแล้ง»! พวกมันสาปให้น้ำระเหย… — «คนพวกนี้แหละที่ขโมยฝนไป» พิรุณกำหมัด', 'The flame seal of the «Cult of the Dry Flame»! They cursed the water away… — «These are the ones who stole the rain,» Phirun says, fists clenched.']},
    {k:'elite', t:'oasis_shaman', name:['หมอผีลัทธิเปลวแล้ง', 'Shaman of the Dry Flame'], say:['หมอผีของลัทธิยังทำพิธีอยู่ที่ริมสระ หยุดมันที!', "The cult's shaman is still chanting by the pool. Stop him!"],
      done:['น้ำในสระกลับมาใสแล้ว ตักไปผสมดินบั้งไฟได้เลย ชุดนักบวชโอเอซิสนี้ ให้เจ้าใส่กันแดดทะเลทรายนะ', 'The pool runs clear again — take some for your rocket powder. Wear this oasis priest robe against the desert sun.']}
  ]},
  // (v298) a new adventure for the land
  10:{npc:msN('ms_sila', 'ศิลา', 'Sila', 'ช่างแกะหินฝึกหัด', 'Apprentice stone carver', 'm', 4, 'hairBrown', 'irisBr', {armor:'s_rune', mask:'ms_k_dust'}),
    title:['ช่างหลวงแห่งยุครุ่งเรือง', 'The Royal Craftsman of the Golden Age'], cos:'ms_k_dust',
    kh:['เมืองนี้สวยจัง ถนนปูหินขอบทอง ธงหลวงโบกไปทั้งเมือง', 'This city is beautiful: stone streets edged with gold, royal banners flying everywhere.'], steps:[
    {k:'kill', t:'brassautomaton', n:12, say:['ข้าเป็นช่างแกะหินฝึกหัดของเมืองนี้ หุ่นกลทองเหลืองที่ช่างหลวงรุ่นก่อนสร้างไว้เฝ้าเมืองเฟืองเพี้ยน มันทุบรูปปั้นใหม่ที่เราเพิ่งแกะเสร็จ ช่วยหยุด 12 ตัวที', 'I am an apprentice stone carver here. The brass automatons the old royal craftsmen built to guard the city have slipped a gear and smash the statues we just finished. Stop 12 of them.'],
      done:['ขอบใจ! อาจารย์ช่างหลวงทิ้งแบบพิมพ์เขียว 3 แผ่นไว้ ถ้าหาเจอ ข้าจะซ่อมหุ่นให้กลับมาเฝ้าเมืองได้', 'Thank you! The royal master left three blueprints. If I can find them I can mend the automatons so they guard the city again.']},
    {k:'find', n:3, what:['แบบพิมพ์เขียวของช่างหลวง', 'Blueprint of the royal craftsman'], say:['แบบพิมพ์เขียวซ่อนอยู่ใต้ฐานรูปปั้นทองตามถนนใหญ่', 'The blueprints are hidden under the gilded statues along the great avenues.'],
      done:['ครบแล้ว! ต้องใช้เฟืองทองเหลืองของหุ่นเก่ามาเปลี่ยน', 'All three! Now I need brass gears from the old automatons.']},
    {k:'item', t:'m_brassautomaton', n:5, say:['เก็บเฟืองทองเหลืองมา 5 ชิ้น ข้าจะประกอบหุ่นตัวใหม่', 'Bring me 5 brass gears and I will build a new automaton.'],
      done:['หุ่นตัวใหม่เดินเวรยามแล้ว! แต่สิงห์หินหน้าประตูเมืองยังไม่ยอมให้มันผ่าน', 'The new automaton walks its watch! But the stone lion at the city gate will not let it pass.']},
    {k:'elite', t:'khmerlion', name:['สิงห์หินผู้เฝ้าประตูเมือง', 'The Stone Lion of the Gate'], say:['สิงห์หินผู้เฝ้าประตูเมืองเห็นหุ่นใหม่เป็นศัตรู มันกระโจนเข้ามาแล้ว!', 'The stone lion of the gate takes the new automaton for an enemy and is coming for it!'],
      done:['สิงห์หินยอมรับหุ่นใหม่แล้ว เมืองของเราจะรุ่งเรืองต่อไป ชุดช่างหลวงนี้ข้าให้เจ้านะ', 'The stone lion accepts the new automaton, and our city will go on flourishing. This outfit of a royal craftsman is yours.']}
  ]},
  38:{npc:msN('ms_chanpha', 'จันทร์ผา', 'Chanpha', 'นักล่าสมบัติสาว', 'Treasure hunter', 'f', 16, 'hairBlack', 'irisGd', {armor:'s_desert', head:'ms_h_explorer', mask:'f_round'}),
    title:['หอสมุดใต้ทราย', 'The Library Under the Sand'], cos:'ms_h_explorer',
    kh:['หอสมุดใต้ทราย… แบบบั้งไฟแสนต้องอยู่ที่นี่แน่!', "A library under the sand… the rocket's plan must be here!"], steps:[
    {k:'kill', t:'sandcity_jarspirit', n:12, say:['ภูตไหทรายเฝ้าทางเข้าหอสมุด ไล่มันสัก 12 ตัว ข้าจะได้ขุดเข้าไป', "Sand-jar spirits guard the library door. Drive off 12 and I'll dig us in."],
      done:['ประตูหอสมุดโผล่แล้ว! ข้างในมีคัมภีร์ใบลานเป็นพันผูก', 'The library door is out! Inside there are thousands of palm-leaf books.']},
    {k:'find', n:3, what:['คัมภีร์ใบลานเรื่องบั้งไฟ', 'Palm-leaf book on rockets'], say:['แบบบั้งไฟถูกแบ่งเป็น 3 ผูก ซ่อนอยู่คนละมุม ช่วยหาด้วยนะ', 'The plan is in three bundles, hidden in three corners. Help me find them.'],
      done:['ครบสามผูกแล้ว! บั้งไฟแสนต้องมีปากทองเหลือง หางยาว ดินอัดแน่น และไฟศักดิ์สิทธิ์จุดชนวน… รายการยาวเลยนะพิรุณ', 'All three! A great rocket needs a brass nozzle, a long tail, tightly packed clay and sacred fire for the fuse… quite a list, Phirun.']},
    {k:'elite', t:'sandcity_golem', name:['ยักษ์ทรายผู้เฝ้าหอสมุด', 'The Sand Giant of the Library'], say:['ยักษ์ทรายตื่นแล้ว มันจะฝังหอสมุดอีกรอบ หนีไม่ทันแน่ ต้องสู้!', "The sand giant is awake and will bury the library again — we can't outrun it, we fight!"],
      done:['เรารอดมาได้พอดี! หมวกนักล่าสมบัติใบนี้ข้าใส่มาสิบปี ให้เจ้าเป็นของขวัญ', "We made it out just in time! I've worn this treasure hunter's hat for ten years — it's yours."]}
  ]},
  13:{npc:msN('ms_tani', 'นางตานีน้อย', 'Little Nang Tani', 'วิญญาณต้นกล้วยเฝ้าโรงหล่อ', 'Banana-tree spirit of the foundry', 'f', 19, 'hairMint', 'irisGr', {armor:'ms_t_tani', head:'f_clip'}, 'a_butterfly'),
    title:['โรงหล่อปืนใหญ่กรุงเก่า', 'The Old Cannon Foundry'], cos:'ms_t_tani',
    kh:['กรุงเก่าเงียบจนขนลุก… ปากบั้งไฟทองเหลืองต้องหล่อจากโรงหล่อที่นี่', 'The old capital is eerily quiet… the brass nozzle has to be cast in its foundry.'], steps:[
    {k:'kill', t:'ayutsoldier', n:12, say:['อย่ากลัวข้านะ ข้าคือนางตานี วิญญาณต้นกล้วยที่เฝ้าโรงหล่อ ทหารผียังรบไม่เลิก ช่วยปลดปล่อยพวกเขา 12 ตน', "Don't be afraid — I'm Nang Tani, the banana-tree spirit who keeps the foundry. The ghost soldiers still fight their old war; free 12 of them."],
      done:['พวกเขาได้พักแล้ว… โรงหล่อยังมีทองเหลืองเหลืออยู่ แต่เตาหลอมดับมานานแล้ว', 'They can rest now… there is still brass in the foundry, but the furnace went cold long ago.']},
    {k:'item', t:'m_celadonjar', n:5, say:['เตาหลอมต้องจุดด้วยของจากไหศิลาดล 5 ใบ', 'The furnace must be lit with 5 offerings from the celadon jars.'],
      done:['ไฟติดแล้ว! ปากบั้งไฟทองเหลืองหล่อเสร็จ สวยงามเหมือนปืนใหญ่สมัยกรุงศรี', 'The fire is lit! The brass nozzle is cast — as fine as an Ayutthaya cannon.']},
    {k:'elite', t:'vaultpython', name:['งูหลามเฝ้าคลังสมบัติ', 'The Vault Python'], say:['งูหลามยักษ์ขดทับปากบั้งไฟไว้ มันคิดว่าเป็นสมบัติ!', 'A giant python has coiled round the nozzle — it thinks it is treasure!'],
      done:['ปากบั้งไฟเป็นของเจ้าแล้ว ชุดใบตองนางตานีนี้ ข้าทอจากใบกล้วยที่ไม่มีวันเหี่ยว รับไว้นะ', "The nozzle is yours. Take this Nang Tani gown, woven from banana leaves that never wilt."]}
  ]},
  39:{npc:msN('ms_lomchoi', 'ลมโชย', 'Lom Choi', 'เด็กชายเล่นว่าว', 'Kite-flying boy', 'm', 7, 'hairSky', 'irisBl', {armor:'s_thunder', head:'ms_h_wind'}),
    title:['ว่าวในหุบผาลมกรด', 'Kites in the Howling Gorge'], cos:'ms_h_wind',
    kh:['ลมแรงจนผมข้าปลิวเลย! ที่นี่แหละเหมาะลองหางบั้งไฟ', 'The wind is blowing my hair everywhere! Just the place to test a rocket tail.'], steps:[
    {k:'kill', t:'galegorge_hawk', n:12, say:['เหยี่ยวหุบผาฉีกว่าวข้าทุกตัว! ไล่มันไป 12 ตัวนะ', 'The gorge hawks shred every kite I fly! Drive off 12.'],
      done:['ว่าวข้าบินได้อีกแล้ว! หางว่าวยาว ๆ ช่วยให้มันไม่หมุนติ้ว หางบั้งไฟก็เหมือนกันนะ', 'My kite flies again! A long tail keeps it from spinning — a rocket tail works the same way.']},
    {k:'find', n:3, what:['เสาวัดลมบนหน้าผา', 'Wind post on the cliff'], say:['ต้องรู้ทิศลมก่อนจุดบั้งไฟ ไปอ่านเสาวัดลม 3 ต้นให้ข้าที', 'You must know the wind before you launch. Go read the three wind posts for me.'],
      done:['ลมใหญ่พัดขึ้นใต้ตลอดปี… บั้งไฟแสนต้องมีหางยาวสามวา ข้าทำให้เลย', 'The great wind always blows south… a great rocket needs a tail three fathoms long. I will make it.']},
    {k:'elite', t:'galegorge_wolf', name:['หมาป่าหอนลม', 'The Wind-howling Wolf'], say:['หมาป่าหอนลมคาบหางบั้งไฟไปแล้ว! ตามไปเร็ว!', 'The wind-howling wolf ran off with the tail! After it!'],
      done:['หางบั้งไฟเสร็จแล้ว ผูกด้วยเชือกว่าวที่เหนียวที่สุด! คาดผมสายลมนี้ ใส่แล้วจะได้ยินเสียงลมพูดนะ', 'The tail is done, tied with my toughest kite string! Wear this wind headband — you will hear the wind talk.']}
  ]},
  // (v298) a new adventure for the land
  21:{npc:msN('ms_dara', 'ดารา', 'Dara', 'หัวหน้ากองคาราวาน', 'Caravan leader', 'f', 10, 'hairBlack', 'irisGd', {armor:'ms_t_caravan', mask:'k_veil'}),
    title:['คาราวานกลางพายุทราย', 'The Caravan in the Sandstorm'], cos:'ms_t_caravan',
    kh:['ร้อนจนอากาศสั่นไหว… ทรายปลิวเข้าตาตลอดเลย', 'So hot the air shimmers… and the sand keeps blowing into my eyes.'], steps:[
    {k:'kill', t:'dungbeetle', n:12, say:['พายุทรายพัดคาราวานกระจัดกระจาย ด้วงกลิ้งลูกหินก็กลิ้งไหน้ำของเราไปด้วย ช่วยไล่ 12 ตัวที', 'The sandstorm scattered the caravan, and the dung beetles rolled away our water jars. Drive off 12 of them.'],
      done:['ขอบใจ! ถุงน้ำ 3 ใบยังหายอยู่กลางทะเลทราย ถ้าไม่มีน้ำ อูฐกับคนในคาราวานไปต่อไม่ได้', 'Thank you! Three water skins are still lost out in the desert. Without water neither the camels nor the people can go on.']},
    {k:'find', n:3, what:['ถุงน้ำที่หายในพายุทราย', 'Water skin lost in the storm'], say:['ถุงน้ำน่าจะตกอยู่ข้างหินที่ลมกัดเป็นรูปเห็ด ทรายกลบไปครึ่งหนึ่งแล้ว', 'The water skins probably fell beside the mushroom-shaped rocks, half buried in sand.'],
      done:['เจอแล้ว! แต่ต้องมีโล่กันทรายไว้ให้อูฐเดินฝ่าพายุ เปลือกด้วงแข็งพอ', 'Found them! But the camels need sand shields to walk through the storm, and beetle shell is hard enough.']},
    {k:'item', t:'m_dungbeetle', n:5, say:['เปลือกด้วงกลิ้งลูกหิน 5 ชิ้น พอทำโล่ให้ทั้งขบวน', 'Five dung-beetle shells are enough for shields for the whole train.'],
      done:['คาราวานพร้อมออกเดินทางแล้ว แต่มีบางอย่างเคลื่อนไหวอยู่ใต้เนินทราย…', 'The caravan is ready to go, but something is moving under the dunes…']},
    {k:'elite', t:'sandworm', name:['หนอนทรายใต้เนินมรณะ', 'The Worm Beneath the Dunes'], say:['หนอนทรายยักษ์โผล่จากใต้เนิน จะกลืนอูฐทั้งตัว! ปกป้องคาราวาน!', 'A giant sandworm has burst from the dune to swallow a camel whole! Protect the caravan!'],
      done:['คาราวานรอดแล้ว! ชุดเดินทางนี้กันทรายกันแดดได้ดี ข้าให้เจ้านะ', 'The caravan is safe! This travelling outfit keeps out sand and sun. It is yours.']}
  ]},
  40:{npc:msN('ms_namkaew', 'หนามแก้ว', 'Nam Kaew', 'สาวเจ้าของไร่กระบองเพชร', 'Cactus farmer', 'f', 3, 'hairRose', 'irisPk', {armor:'s_forest', head:'ms_h_cactus', mask:'f_blush'}),
    title:['ยางกระบองเพชร', 'Cactus Sap'], cos:'ms_h_cactus',
    kh:['กระบองเพชรออกดอกด้วย! สวยจัง', 'The cacti are flowering! How pretty.'], steps:[
    {k:'kill', t:'cactus_scorpion', n:12, say:['แมงป่องกระบองเพชรเต็มไร่ข้าเลย ช่วยไล่ 12 ตัวนะ แล้วข้าจะให้ยางกระบองเพชร', "Cactus scorpions are all over my farm. Chase off 12 and I'll give you cactus sap."],
      done:['ไร่ปลอดภัยแล้ว ยางกระบองเพชรของที่นี่เหนียวยิ่งกว่ากาวหนังวัวอีก', 'The farm is safe. Our cactus sap is stickier than hide glue.']},
    {k:'item', t:'m_cactus_beetle', n:5, say:['ด้วงกระบองเพชรช่วยทำยางเหนียวพิเศษ ข้าต้องใช้ 5 ชิ้น', 'The cactus beetles make the extra-sticky glue. I need 5 pieces.'],
      done:['ยางเหนียวพิเศษเสร็จแล้ว! ติดหางบั้งไฟเข้ากับลำได้แน่นปึ้ก', 'Extra-sticky glue, done! The tail will hold to the rocket no matter what.']},
    {k:'elite', t:'cactus_crocodile', name:['ตะกวดหนามเหล็ก', 'The Iron-spined Monitor'], say:['ตะกวดหนามเหล็กกินกระบองเพชรของข้าไปครึ่งไร่ ช่วยข้าด้วย!', 'The iron-spined monitor has eaten half my farm! Help!'],
      done:['เจ้ากล้าหาญมาก! กิ๊บดอกกระบองเพชรนี้ ข้าทำจากดอกที่บานแค่คืนเดียว', 'So brave! This cactus-flower pin is made from a bloom that opens for only one night.']}
  ]},
  // (v298) a new adventure for the land
  22:{npc:msN('ms_sueanoi', 'เสือน้อย', 'Suea Noi', 'อดีตโจรกลับใจ', 'Reformed bandit', 'm', 11, 'hairCrimson', 'irisRd', {armor:'s_shadow', mask:'ms_k_bandana'}),
    title:['ค่ายชนเผ่าแห่งหุบเขาต้องห้าม', 'The Tribal Camp of the Forbidden Valley'], cos:'ms_k_bandana',
    kh:['หุบเขาหินแดงนี้มีชนเผ่าอยู่จริงด้วย… ทุกคนจ้องเรามาจากเต็นท์หนังสัตว์', 'Tribes really do live in this red rock valley… everyone is watching us from their hide tents.'], steps:[
    {k:'kill', t:'rockpangolin', n:12, say:['ข้าเคยปล้นคนผ่านทาง แต่ตอนนี้ชนเผ่ารับข้าไว้ ตัวลิ่นหินผาขุดอุโมงค์ใต้เต็นท์จนพังไปหลายหลัง ชนเผ่าโทษคนนอก ช่วยไล่ 12 ตัวให้เขาเห็นว่าเราเป็นมิตร', 'I used to rob travellers, but the tribe took me in. Cliff pangolins have dug under their tents and brought several down, and the tribe blames outsiders. Drive off 12 so they see we are friends.'],
      done:['หัวหน้าเผ่ายอมคุยแล้ว! ขนนกศักดิ์สิทธิ์ 3 เส้นของเสาโทเทมปลิวหายไปกับลมกรด ถ้าหาเจอ เผ่าจะยอมรับเรา', 'The chief will talk now! Three sacred feathers blew off the totem in the gale. Find them and the tribe will accept us.']},
    {k:'find', n:3, what:['ขนนกศักดิ์สิทธิ์ของเผ่า', 'Sacred feather of the tribe'], say:['ขนนกศักดิ์สิทธิ์ติดอยู่ตามเสาหินที่ลมกัดเซาะ ระวังตกหน้าผานะ', 'The sacred feathers caught on the wind-carved pillars. Mind the cliff edge.'],
      done:['ครบแล้ว! แต่เสาโทเทมแตกร้าว ต้องเอาเกล็ดหินของตัวลิ่นมาปะ', 'All three! But the totem has cracked, and only pangolin scales can mend it.']},
    {k:'item', t:'m_rockpangolin', n:5, say:['เกล็ดตัวลิ่นแข็งเหมือนหินผา เอามา 5 ชิ้น ช่างของเผ่าจะปะเสาโทเทมให้', 'Pangolin scales are as hard as the cliffs. Bring 5 and the carver of the tribe will mend the totem.'],
      done:['เสาโทเทมกลับมาตั้งตรงแล้ว ชนเผ่าร้องเพลงต้อนรับเรา!', 'The totem stands tall again and the tribe sings to welcome us!']},
    {k:'elite', t:'redpuma', name:['ราชาเสือแห่งหน้าผาแดง', 'King of the Red Cliffs'], say:['เสือภูเขาแดงตัวใหญ่ที่สุดลงมาจากหน้าผาจะจู่โจมค่าย! ช่วยเผ่าด้วย', 'The greatest red puma is coming down the cliffs to attack the camp! Help the tribe.'],
      done:['ชนเผ่ายกให้เราเป็นพี่น้องแล้ว ข้าเองก็ได้บ้านใหม่ ชุดนี้ช่างเผ่าเย็บให้เจ้านะ', 'The tribe calls us kin now, and I have found a home at last. The tailor of the tribe sewed this outfit for you.']}
  ]},
  41:{npc:msN('ms_thongdaeng', 'ทองแดง', 'Thongdaeng', 'เด็กชายคนงานเหมือง', 'Young miner', 'm', 15, 'hairChestnut', 'irisBr', {armor:'s_knight', head:'ms_h_miner'}),
    title:['กำมะถันในเหมืองลึก', 'Sulphur in the Deep Mine'], cos:'ms_h_miner',
    kh:['กลิ่นไข่เน่าเลย! แต่ถ้าไม่มีกำมะถัน บั้งไฟก็ไม่มีแรง', 'Smells like rotten eggs! But without sulphur the rocket has no power.'], steps:[
    {k:'kill', t:'sulphur_wisp', n:12, say:['ภูตกำมะถันลุกเป็นไฟในอุโมงค์ ข้าเข้าไปขุดไม่ได้ ช่วยดับมัน 12 ตน', "Sulphur wisps burst into flame in the tunnels — I can't dig. Put out 12 of them."],
      done:['อุโมงค์ปลอดภัยแล้ว ข้าจะขุดกำมะถันเหลืองที่บริสุทธิ์ที่สุดให้', 'The tunnels are safe. I will dig you the purest yellow sulphur.']},
    {k:'item', t:'m_sulphur_beetle', n:5, say:['ด้วงกำมะถันกินแร่จนอ้วน ในตัวมันมีกำมะถันบริสุทธิ์ เก็บมา 5 ชิ้น', 'The sulphur beetles grow fat on ore — pure sulphur inside. Bring me 5.'],
      done:['ครบแล้ว! ผสมกับดินประสิวและถ่าน กลายเป็นดินดำชั้นเยี่ยม', 'Got them! Mixed with saltpetre and charcoal, it makes the finest black powder.']},
    {k:'elite', t:'sulphur_golem', name:['ยักษ์กำมะถันใต้เหมือง', 'The Sulphur Giant Below'], say:['ยักษ์กำมะถันตื่นขึ้นที่ก้นเหมือง ถ้าไม่หยุดมัน เหมืองจะถล่ม!', "The sulphur giant has woken at the bottom of the mine. If we don't stop it, the mine will collapse!"],
      done:['เหมืองเงียบลงแล้ว หมวกคนงานเหมืองใบนี้มีโคมเล็ก ๆ ติดอยู่ เอาไปส่องทางนะ', "The mine is quiet. This miner's cap has a little lamp on it — take it to light your way."]}
  ]},
  23:{npc:msN('ms_plaew', 'เปลว', 'Plaew', 'ผู้เฝ้าไฟแห่งทุ่งลาวา', 'Fire-keeper', 'f', 21, 'hairOrange', 'irisRd', {armor:'ms_t_ember', head:'f_clipstar'}),
    title:['ผู้เฝ้าไฟแห่งทุ่งลาวา', 'The Fire-keeper of the Lava Fields'], cos:'ms_t_ember',
    kh:['ร้อนมาก! อย่าให้บั้งไฟโดนลาวานะ ระเบิดตูมแน่', 'So hot! Keep the rocket away from the lava or it will go off with a bang.'], steps:[
    {k:'kill', t:'magmaslime', n:12, say:['ก้อนแมกมาไหลออกมาท่วมทาง ช่วยกำจัด 12 ก้อน แล้วข้าจะหลอมเหล็กให้', "Magma slimes are flooding the path. Clear 12 and I'll forge you iron."],
      done:['เหล็กที่หลอมด้วยไฟลาวาแข็งที่สุด เอาไปรัดลำบั้งไฟไม่ให้แตก', 'Iron forged in lava fire is the strongest. It will band the rocket so it cannot split.']},
    {k:'find', n:3, what:['แท่งเหล็กชุบลาวา', 'Lava-quenched iron bar'], say:['ข้าชุบเหล็กไว้ในบ่อลาวา 3 บ่อ ไปตักขึ้นมาให้หน่อย', 'I left iron quenching in three lava pools. Fish them out for me.'],
      done:['ปลอกเหล็กรัดบั้งไฟเสร็จแล้ว แต่… ข้ารู้สึกว่ามีคนแอบตามเรามา', 'The iron bands are done. But… I feel someone has been following us.']},
    {k:'elite', t:'cinderimp', name:['ภูตเถ้าสายลับลัทธิ', 'The Cult\'s Cinder Spy'], say:['ภูตเถ้านี่เป็นสายลับของลัทธิ! มันจะไปรายงานจอมมารว่าเรากำลังทำบั้งไฟ หยุดมัน!', "That cinder imp is a cult spy! It's going to tell the Demon Lord about our rocket — stop it!"],
      done:['ทันเวลา! ชุดผู้เฝ้าไฟนี้กันไฟได้ทุกชนิด ใส่แล้วเดินบนถ่านได้สบาย', 'Just in time! This fire-keeper suit stops any flame — you could walk on embers in it.']}
  ]},
  42:{npc:msN('ms_boonlek', 'บุญเหล็ก', 'Boonlek', 'คนแจวแพข้ามธารแมกมา', 'Magma raftman', 'm', 5, 'hairAsh', 'irisGd', {armor:'s_lava', mask:'ms_k_goggle'}),
    title:['แพข้ามธารแมกมา', 'The Raft Across the Magma'], cos:'ms_k_goggle',
    kh:['แม่น้ำเป็นไฟเลย… เราจะข้ามไปยังไงนะ', 'The river is made of fire… how will we cross?'], steps:[
    {k:'kill', t:'magmariver_serpent', n:12, say:['งูแมกมาพันแพข้าไว้ ข้ามไม่ได้ ไล่ 12 ตัวนะ', "Magma serpents have wrapped round my raft — we can't cross. Drive off 12."],
      done:['แพหินลอยลาวาของข้าพร้อมแล้ว แต่หินเหล็กไฟสำหรับจุดชนวนต้องหาที่ก้นแม่น้ำ', 'My lava raft is ready. The flint for the fuse, though, lies at the bottom of the river.']},
    {k:'item', t:'m_magmariver_lizard', n:5, say:['กิ้งก่าแมกมากลืนหินเหล็กไฟไว้ในท้อง เก็บมา 5 ชิ้น', 'The magma lizards swallow the flint. Bring me 5 pieces.'],
      done:['หินเหล็กไฟครบแล้ว! ตีกันทีเดียว ประกายไฟพุ่งเลย', 'The flint is here! Strike it once and sparks fly.']},
    {k:'elite', t:'magmariver_golem', name:['ยักษ์ลาวาผู้เฝ้าท่า', 'The Lava Giant of the Ford'], say:['ยักษ์ลาวาขวางท่าข้ามไว้ ต้องจัดการก่อนแพจะไปถึงอีกฝั่ง', 'The lava giant bars the ford. We must deal with it before the raft can cross.'],
      done:['ข้ามฝั่งได้แล้ว! แว่นกันความร้อนนี้ใส่แล้วมองลาวาได้ไม่แสบตา', 'We are across! These heat goggles let you look at lava without stinging eyes.']}
  ]},
  24:{npc:msN('ms_hongthao', 'หงส์เถ้า', 'Hong Thao', 'ผู้เลี้ยงลูกหงส์เพลิง', 'Phoenix keeper', 'f', 18, 'hairSilver', 'irisRd', {armor:'s_phoenix', head:'h_plume'}, 'ms_b_phoenix'),
    title:['ขนหงส์เพลิงในป่าเถ้าถ่าน', 'A Phoenix Feather in the Ashen Forest'], cos:'ms_b_phoenix',
    kh:['ป่านี้ไหม้หมดเลย… น่าสงสารต้นไม้จัง', 'This whole forest burned… the poor trees.'], steps:[
    {k:'kill', t:'smokewisp', n:12, say:['ภูตควันไล่ล่าลูกหงส์เพลิงที่ข้าเลี้ยงไว้ ช่วยข้าด้วย ปราบ 12 ตน', 'Smoke wisps are hunting the phoenix chicks I raise. Help me — defeat 12.'],
      done:['ลูกหงส์ปลอดภัยแล้ว ขนหงส์เพลิงไม่มีวันมอด ใช้เป็นชนวนบั้งไฟได้ดีที่สุด', 'The chicks are safe. A phoenix feather never stops burning — the best rocket fuse there is.']},
    {k:'find', n:3, what:['ขนหงส์เพลิงที่ร่วงในเถ้า', 'Phoenix feather in the ashes'], say:['ลูกหงส์ผลัดขน 3 เส้นไว้ในกองเถ้า เก็บมาก่อนลมจะพัดไป', 'The chicks shed three feathers in the ash heaps. Gather them before the wind takes them.'],
      done:['สามขนเรืองแสงในมือเจ้า… ลูกหงส์ร้องเพลงเหมือนจะขอบคุณ', 'Three feathers glow in your hands… the chicks sing as if to thank you.']},
    {k:'elite', t:'charredent', name:['ต้นไม้ยักษ์ที่ถูกเผาจนคลั่ง', 'The Maddened Charred Ent'], say:['ต้นไม้ยักษ์ถูกไฟเผาจนคลั่ง มันจะเหยียบรังลูกหงส์!', 'The great tree was burned mad — it will trample the nest!'],
      done:['ป่าจะงอกใหม่ได้แล้ว ประกายขนหงส์นี้จะวนรอบตัวเจ้า เหมือนลูกหงส์ตามไปด้วย', 'The forest can grow again. These phoenix sparks will circle you, as if the chicks came along.']}
  ]},
  43:{npc:msN('ms_ruesi', 'ฤๅษีหินดำ', 'The Black-stone Hermit', 'ฤๅษีบนยอดเสาหิน', 'Hermit of the pillars', 'm', 2, 'hairWhite', 'irisBr', {armor:'ms_t_hermit', head:'ms_x_tathian'}),
    title:['คาถาส่งบั้งไฟ', 'The Launch Chant'], cos:'ms_t_hermit',
    kh:['เสาหินสูงเสียดฟ้า… บนยอดมีฤๅษีอยู่จริงเหรอ', 'Stone pillars up to the sky… does a hermit really live on top?'], steps:[
    {k:'kill', t:'basalt_fiend', n:12, say:['หลานเอ๋ย ภูตบะซอลต์รบกวนการบำเพ็ญของข้า ช่วยไล่ 12 ตนเถิด', 'Child, the basalt fiends disturb my meditation. Drive off 12 of them.'],
      done:['บั้งไฟจะขึ้นถึงฟ้าได้ต้องมีคาถาส่ง ข้าจารไว้บนใบลาน แต่ลมพัดกระจัดกระจายไปหมด', 'A rocket reaches the sky only with a launch chant. I wrote it on palm leaves, but the wind scattered them.']},
    {k:'find', n:3, what:['ใบลานคาถาส่งบั้งไฟ', 'Palm leaf of the launch chant'], say:['ใบลาน 3 แผ่นติดอยู่ตามเสาหิน ไปเก็บมาให้ครบ', 'Three leaves are caught among the pillars. Bring them all.'],
      done:['ครบแล้ว… จงท่องคาถานี้ตอนจุดชนวน พญาแถนจะได้ยินเสียงของเจ้า', 'All of them… recite this as you light the fuse and Phaya Thaen will hear your voice.']},
    {k:'elite', t:'basalt_golem', name:['ยักษ์หินดำผู้ขวางทาง', 'The Black-stone Giant'], say:['ยักษ์หินดำไม่ยอมให้คาถาออกจากยอดเขา จงพิสูจน์ใจของเจ้า', 'The black-stone giant will not let the chant leave the peak. Prove your heart.'],
      done:['เจ้าทำได้ ชุดฤๅษีหินดำนี้ จะทำให้ใจเจ้านิ่งเหมือนหินผา', 'You have done it. This black-stone hermit robe will keep your heart as steady as rock.']}
  ]},
  25:{npc:msN('ms_akkhanee', 'อัคนีน้อย', 'Little Akkhanee', 'นักบวชไฟฝึกหัด', 'Apprentice fire priestess', 'f', 7, 'hairCrimson', 'irisGd', {armor:'s_lava', head:'ms_h_agni'}),
    title:['ไฟศักดิ์สิทธิ์จากปล่องอัคนี', "Sacred Fire from Agni's Crater"], cos:'ms_h_agni',
    kh:['ไฟศักดิ์สิทธิ์อยู่ในปล่องนี้… ข้าตื่นเต้นจัง', 'The sacred fire is in this crater… I am so excited.'], steps:[
    {k:'kill', t:'magmatoad', n:12, say:['คางคกแมกมาบุกแท่นบูชา ช่วยไล่ 12 ตัวก่อนนะ', 'Magma toads have overrun the altar. Drive off 12 first.'],
      done:['ท่านอัคนีผู้เฝ้าปล่องถูกเสียงอสูรปลุกให้คลั่ง แต่ไฟศักดิ์สิทธิ์ยังลุกอยู่ในแท่นบูชา', 'Lord Agni was driven mad by the whisper, but the sacred fire still burns on the altar.']},
    {k:'item', t:'m_flamegaruda', n:5, say:['ต้องใช้ขนครุฑเพลิง 5 ชิ้นทำคบเพลิงเก็บไฟศักดิ์สิทธิ์', 'We need 5 flame-garuda feathers to make a torch for the sacred fire.'],
      done:['คบเพลิงพร้อมแล้ว เปลวไฟนี้จะไม่มีวันดับจนกว่าบั้งไฟจะถึงฟ้า', 'The torch is ready. This flame will not die until the rocket reaches the sky.']},
    {k:'elite', t:'agnipriest', name:['นักบวชอัคนีที่ถูกล้างสมอง', 'The Brainwashed Agni Priest'], say:['นั่นพี่ชายข้า! ลัทธิล้างสมองเขาจนจำใครไม่ได้ ช่วยปลุกเขาที!', 'That is my brother! The cult has washed his mind clean. Wake him!'],
      done:['พี่ชายข้ากลับมาเป็นคนเดิมแล้ว! มงกุฎเปลวอัคนีนี้ ข้าอยากให้เจ้าใส่', 'My brother is himself again! I want you to wear this Agni flame crown.']}
  ]},
  44:{npc:msN('ms_thandaeng', 'ถ่านแดง', 'Than Daeng', 'สาวพายเรือทะเลถ่าน', 'Cinder-sea boatwoman', 'f', 12, 'hairCrimson', 'irisGd', {armor:'ms_t_cinder', head:'f_bow'}),
    title:['หัวพญานาคจากไม้ทะเลถ่าน', 'The Naga Head from Cinder-wood'], cos:'ms_t_cinder',
    kh:['ทะเลถ่านแดง… เกือบถึงแดนมังกรแล้วนะ', 'The Sea of Cinders… we are nearly in dragon country.'], steps:[
    {k:'kill', t:'cinder_serpent', n:12, say:['งูถ่านแดงพันหัวเรือข้า ไล่ 12 ตัวนะ แล้วข้าจะพาไปหาไม้ถ่านแดง', "Cinder serpents coil round my prow. Drive off 12 and I'll take you to the cinder-wood."],
      done:['ไม้ที่โตในทะเลถ่านแข็งเหมือนเหล็ก ใช้แกะหัวพญานาคประดับบั้งไฟได้', 'Wood grown in the cinder sea is hard as iron — good for carving a naga head for the rocket.']},
    {k:'find', n:3, what:['ไม้ถ่านแดงที่ยังไม่มอด', 'Smouldering cinder-wood'], say:['ไม้ถ่านแดงที่ดีที่สุดยังคุอยู่ 3 จุด ระวังมือพองนะ', 'The best cinder-wood still smoulders in three spots. Mind your hands.'],
      done:['ข้าแกะหัวพญานาคเสร็จแล้ว ตาสีแดงเหมือนมีชีวิต! — «นาคพิรุณ… รอเราอีกนิดนะ» พิรุณกระซิบ', 'The naga head is carved, its red eyes almost alive! — «Rain naga… wait for us a little longer,» Phirun whispers.']},
    {k:'elite', t:'cinder_golem', name:['ยักษ์ถ่านแดงผู้กลืนเรือ', 'The Boat-swallowing Cinder Giant'], say:['ยักษ์ถ่านแดงโผล่จากทะเลถ่าน มันกลืนเรือมาแล้วนับไม่ถ้วน!', 'The cinder giant has risen from the sea — it has swallowed countless boats!'],
      done:['ชุดนักพายทะเลถ่านนี้ทนไฟและทนร้อน เอาไปใส่ข้ามแดนมังกรนะ', 'This cinder-sea paddler suit stands any heat. Wear it into dragon country.']}
  ]},
  63:{npc:msN('ms_mangkornkaew', 'มังกรแก้ว', 'Mangkorn Kaew', 'สาวผู้ฝึกมังกร', 'Dragon tamer', 'f', 23, 'hairTeal', 'irisTl', {armor:'s_naga', head:'ms_h_horns'}),
    title:['ไข่มังกรของลัทธิ', "The Cult's Dragon Eggs"], cos:'ms_h_horns',
    kh:['มังกรเต็มหุบเลย! แต่ทำไมพวกมันดูเศร้าจัง', 'The vale is full of dragons! But why do they look so sad?'], steps:[
    {k:'kill', t:'dragoncultist', n:12, say:['ลัทธิเปลวแล้งขโมยไข่มังกรไปบังคับให้มังกรรับใช้จอมมาร ช่วยปราบสาวกลัทธิ 12 คน!', "The Cult of the Dry Flame stole dragon eggs to force the dragons to serve the Demon Lord. Defeat 12 cultists!"],
      done:['สาวกลัทธิพูดถึง «นาคที่ถูกล่ามไว้ใต้บัลลังก์จอมมาร» …นาคพิรุณยังมีชีวิตอยู่!', 'The cultists spoke of «the naga chained beneath the Demon Lord\'s throne»… the rain naga is alive!']},
    {k:'find', n:3, what:['ไข่มังกรที่ลัทธิซ่อนไว้', 'Dragon egg hidden by the cult'], say:['ไข่มังกร 3 ฟองถูกซ่อนไว้ในหุบ หาให้เจอก่อนมันจะเย็นลง', 'Three dragon eggs are hidden in the vale. Find them before they go cold.'],
      done:['ไข่ทั้งสามฟักแล้ว! ลูกมังกรร้องเรียกแม่ แม่มังกรสัญญาว่าจะช่วยเราในวันสุดท้าย', 'All three hatched! The hatchlings cry for their mother, and she promises to help us on the last day.']},
    {k:'elite', t:'scalegolem', name:['ยักษ์เกล็ดมังกรที่ลัทธิสร้าง', "The Cult's Scale Golem"], say:['ลัทธิสร้างยักษ์จากเกล็ดมังกรที่ถลกมา มันโหดร้ายที่สุด!', 'The cult built a golem from stolen dragon scales — the cruellest thing they have made!'],
      done:['เขามังกรน้อยนี้ แม่มังกรมอบให้เจ้าเป็นการขอบคุณ', 'The mother dragon gives you these little dragon horns in thanks.']}
  ]},
  64:{npc:msN('ms_maemuk', 'แม่นางมุก', 'Mae Nang Muk', 'ผู้รักษาไข่มุกมังกร', 'Keeper of the dragon pearl', 'f', 4, 'hairWhite', 'irisSv', {armor:'s_glacier', head:'h_crowni'}, 'ms_b_pearl'),
    title:['ไข่มุกเรียกเมฆ', 'The Cloud-calling Pearl'], cos:'ms_b_pearl',
    kh:['รังมังกรบรรพกาล… ข้าไม่เคยเห็นอะไรยิ่งใหญ่เท่านี้มาก่อน', 'The Elder Dragon Roost… I have never seen anything so vast.'], steps:[
    {k:'kill', t:'stormdrake', n:12, say:['มังกรพายุถูกเสียงอสูรปลุกให้คลั่ง มันจะปลุกท่านผู้เฒ่า ช่วยสงบพวกมัน 12 ตัว', 'The storm drakes are maddened and will wake the Elder. Calm 12 of them.'],
      done:['มังกรบรรพกาลหลับใหลมาพันปี ไข่มุกในรังของท่านเรียกเมฆได้ แต่ถูกลัทธิทุบแตกไปครึ่งหนึ่ง', 'The Elder Dragon has slept a thousand years. The pearl in the roost calls clouds, but the cult cracked half of it.']},
    {k:'item', t:'m_dragonpearl', n:5, say:['ไข่มุกมังกรแตกเป็นเสี่ยง ๆ เก็บเศษมา 5 ชิ้น ข้าจะประกอบให้', "The pearl lies in pieces. Bring me 5 and I'll make it whole."],
      done:['ไข่มุกเรียกเมฆเต็มดวงแล้ว ใส่ไว้ในหัวพญานาคของบั้งไฟ… เมฆจะตามบั้งไฟขึ้นไปเอง', 'The cloud-calling pearl is whole. Set it in the naga head… the clouds will follow the rocket up.']},
    {k:'elite', t:'dragonknight', name:['อัศวินมังกรผู้ทรยศ', 'The Traitor Dragon Knight'], say:['อัศวินมังกรตนนี้ทรยศรังไปเข้ากับลัทธิ มันมาแย่งไข่มุกคืน!', 'This dragon knight betrayed the roost for the cult — he has come for the pearl!'],
      done:['บั้งไฟแสนครบทุกชิ้นแล้ว! ไข่มุกน้อย ๆ เหล่านี้จะลอยวนรอบตัวเจ้าตลอดไป', 'The great rocket is complete! These little pearls will float around you always.']}
  ]},
  // (v296) นรกอเวจี: a new adventure in the lava cavern under the volcano
  65:{npc:msN('ms_yomthut', 'ยมทูตน้อย', 'Little Yomathut', 'เสมียนพญายม', "Yama's clerk", 'm', 8, 'hairViolet', 'irisVi', {armor:'ms_t_yama', head:'hc_hide'}),
    title:['บัญชีพญายมในถ้ำลาวา', "Yama's Ledger in the Lava Cave"], cos:'ms_t_yama',
    kh:['ร้อนจนแสบหน้าเลย… ถ้ำนี้มีแต่หินดำกับลาวา นาคพิรุณอยู่ลึกเข้าไปข้างในนี่เอง', 'The heat stings my face… nothing but black rock and lava. The rain naga is somewhere deep inside.'], steps:[
    {k:'kill', t:'lavamole', n:12, say:['หยุดก่อน! ข้าเป็นเสมียนพญายม ตุ่นหินเพลิงขุดทะลุห้องเก็บบัญชีบุญบาปของท่านพญายม ขุดหินร้อนไปทั่ว ช่วยไล่ 12 ตัวที', "Halt! I am Yama's clerk. Lava moles have dug into the vault of the ledger of good and evil and are tunnelling through the hot rock everywhere. Drive off 12 of them."],
      done:['ขอบใจ! แต่หน้าบัญชีปลิวหายไปกับลมร้อน 3 แผ่น ถ้าหาไม่เจอ ข้าบอกไม่ได้ว่าใครควรผ่านประตูนี้', 'Thank you! But three pages of the ledger blew away on the hot wind. Without them I cannot tell who may pass the gate.']},
    {k:'find', n:3, what:['หน้าบัญชีพญายม', "Page of Yama's ledger"], say:['หน้าบัญชีทนไฟได้ มันตกอยู่ริมบ่อลาวาสักแห่ง ระวังอย่าเดินตกลงไปนะ', 'The pages do not burn. They fell beside the lava pools somewhere. Mind you do not fall in.'],
      done:['ครบแล้ว! ในบัญชีเขียนว่าเจ้าทำความดีมามาก ผ่านได้ แต่ต้องมีกล่องทนร้อนใส่บัญชีไปด้วย', 'All three! The ledger says you have done much good, so you may pass. But the ledger must travel in a heat-proof box.']},
    {k:'item', t:'m_volcanosnail', n:5, say:['เปลือกหอยทากภูเขาไฟทนความร้อนได้ดีที่สุด เอามา 5 ชิ้น ข้าจะต่อเป็นกล่อง', 'The hide of the volcano snail bears heat best of all. Bring me 5 pieces and I will build the box.'],
      done:['กล่องเสร็จแล้ว! ถือใบเบิกทางกับบัญชีไว้ ทางไปบัลลังก์จอมมารอยู่ลึกเข้าไปในถ้ำ', 'The box is done! Keep the pass and the ledger safe. The way to the Demon Lord\'s throne lies deeper in the cave.']},
    {k:'elite', t:'obsidianmantis', name:['ตั๊กแตนตำข้าวผู้เฝ้าทางลึก', 'The Mantis of the Deep Way'], say:['ตั๊กแตนตำข้าวออบซิเดียนตัวใหญ่ที่สุดยกเคียวขวางทาง! มันไม่อ่านบัญชีหรอก ต้องสู้!', 'The greatest obsidian mantis raises its scythes to bar the way! It will not read any ledger. Fight!'],
      done:['ผ่านได้แล้ว! ชุดเสมียนยมโลกนี้ ใส่แล้วผีไม่กล้ามองหน้าเลย ไปช่วยนาคพิรุณเถอะ', "You may pass! In this underworld clerk's robe, no ghost will dare meet your eye. Go and free the rain naga."]}
  ]},
  66:{npc:MS_PHIRUN, title:['บั้งไฟแสนส่งฟ้า', 'The Great Rocket to the Sky'], cos:'ms_t_rain', finale:true, steps:[
    {k:'kill', t:'marasoldier', n:12, say:['นาคพิรุณถูกล่ามโซ่อยู่ใต้บัลลังก์! ทหารมารเต็มไปหมด ช่วยข้าฝ่าไป 12 ตน!', 'The rain naga is chained beneath the throne! Demon soldiers everywhere — help me cut through twelve!'],
      done:['เห็นแล้ว… นาคสีฟ้าตัวใหญ่ถูกล่ามด้วยโซ่ไฟ น้ำตาของท่านกลายเป็นไอก่อนถึงพื้น', 'There… a great blue naga bound in chains of fire. Her tears turn to steam before they touch the ground.']},
    {k:'find', n:3, what:['หมุดโซ่ไฟที่ตรึงนาคพิรุณ', 'Fire-chain spike binding the naga'], say:['โซ่ไฟถูกตรึงไว้ด้วยหมุด 3 อัน ถอนออกให้หมด!', 'The fire chains are pinned by three spikes. Pull them all!'],
      done:['โซ่ขาดแล้ว! นาคพิรุณลืมตา… แต่จอมมารรู้ตัวแล้ว!', 'The chains break! The rain naga opens her eyes… but the Demon Lord knows!']},
    {k:'elite', t:'demonknight', hp:2.5, name:['อัศวินมารผู้คุมโซ่', 'The Demon Knight of the Chains'], say:['อัศวินมารมาแล้ว! ข้าจะเตรียมจุดบั้งไฟ เจ้าช่วยถ่วงเวลาให้ที!', 'The demon knight is here! I will ready the rocket — hold him off!'],
      done:['เราชนะ! พิรุณจุดชนวนด้วยไฟศักดิ์สิทธิ์ ท่องคาถาของฤๅษี บั้งไฟแสนพุ่งขึ้นฟ้าพร้อมนาคพิรุณ เมฆดำก่อตัว… ฝนแรกตกลงทั่วแดนใต้! ชุดผู้นำฝนนี้ข้าตัดจากเมฆก้อนแรก ขอบคุณที่เดินทางมาด้วยกันนะ!', "We won! Phirun lights the fuse with the sacred fire and recites the hermit's chant. The great rocket soars into the sky with the rain naga, dark clouds gather… and the first rain falls across the south! I cut this Rainbringer's outfit from the first cloud. Thank you for coming all this way with me!"]}
  ]}
});
