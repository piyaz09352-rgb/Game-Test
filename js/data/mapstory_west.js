/* VAYRATHEN — js/data/mapstory_west.js — (v215) map stories, the west road: «ผ้าทอตะวัน» (The Sun-woven Cloth)
   12 maps, Lv 150–235: the Misty Highlands, the snow-pine woods, the frozen lake and the fjord, the ice cave, the aurora
   tundra and the glacier, the sapphire grotto, Mount Kailash, the frozen shipwreck, the Snow King's citadel and the
   blizzard peak.

   The tale: an endless winter creeps down from the west and the highland orchids no longer bloom. Dok Ueang, a weaver
   girl of the Misty Highlands, remembers her grandmother's tale of the Sun-woven Cloth, a cloth whose threads hold the
   warmth of the sun. Every map gives one thread or one part of the loom — serow wool, pine-resin green, fox-fur silver,
   fjord blue, cave-crystal light, aurora colours, mammoth wool, a sapphire needle, a gandharva's blessing song, a shuttle
   from a frozen ship, the Snow King's own tears. The winter is not wickedness but grief: the Snow King froze the whole
   west to keep his dying queen from passing. At the top of the blizzard peak the cloth warms her frozen heart; she smiles,
   thanks him and goes to rest, the king weeps warm tears at last, and spring comes back to the west. */
'use strict';

const MS_DOKUEANG = {id:'ms_dokueang', name:'ดอกเอื้อง', en:'Dok Ueang', role:['สาวช่างทอแห่งดอยหมอก · เนื้อเรื่องเสริม', 'Highland weaver · Side story'],
  sex:'f', hair:20, color:'hairBlack', eye:'irisBr', gear:{armor:'s_lanna', head:'ms_h_orchid', mask:'f_blush'}};

MS_ARCS.push({id:'west', title:['ผ้าทอตะวัน', 'The Sun-woven Cloth'], maps:[7, 45, 26, 46, 27, 47, 28, 48, 19, 49, 29, 50],
  blurb:['ทอผ้าที่เก็บไออุ่นของตะวันกับดอกเอื้อง เพื่อละลายฤดูหนาวที่ไม่มีวันสิ้นสุด', 'Weave a cloth that holds the sun\'s warmth with Dok Ueang and melt the endless winter'],
  title_id:'ms_west', titleName:['ผู้ทอฤดูใบไม้ผลิ', 'Spring Weaver'], mount:'ms_m_suncloth', comp:MS_DOKUEANG, compArmor:'ms_t_suncloth',
  doneSay:['ดอกเอื้องบานเต็มดอยแล้ว! ยายต้องภูมิใจในตัวเรามากแน่ ๆ ขอบคุณนะ', 'The orchids cover the whole mountain! Grandma would be so proud of us. Thank you.']});

Object.assign(MS_CH, {
  7:{npc:MS_DOKUEANG, title:['ดอกเอื้องไม่บาน', "The Orchids That Won't Bloom"], cos:'ms_h_orchid', steps:[
    {k:'kill', t:'mistspirit', n:10,
      say:['หนาวจัง… ปีนี้ดอกเอื้องบนดอยไม่บานเลยสักดอก ภูตหมอกพาความหนาวมาจากทางตะวันตก ช่วยไล่ 10 ตนก่อนนะ', 'So cold… not one orchid has bloomed on the mountain this year. The mist spirits carry the cold from the west. Drive off 10 of them first.'],
      done:['ขอบใจจ้ะ… ยายเคยเล่าว่าความหนาวที่ไม่มีวันจบ ละลายได้ด้วย «ผ้าทอตะวัน» ผ้าที่ด้ายทุกเส้นเก็บไออุ่นของแดดไว้', 'Thank you… Grandma used to say an endless winter can be melted by the «Sun-woven Cloth», a cloth whose every thread holds the warmth of the sun.']},
    {k:'find', n:3, what:['กระถางดอกเอื้องที่จับแข็ง', 'Frozen orchid pot'], say:['ยายฝากกระถางเอื้องไว้ 3 กระถางตามลานดอย ไปดูหน่อยว่ายังรอดไหม', 'Grandma left three orchid pots around the mountain. See if they survived.'],
      done:['ใต้กระถางมีผ้าทอผืนเล็กของยาย ลายตะวันยังอุ่นอยู่เลย… «ด้ายตะวันซ่อนอยู่ในทุกแผ่นดินทางตะวันตก» ยายเขียนไว้', "Under the pots lies a little cloth Grandma wove, its sun pattern still warm… «The sun's threads hide in every land of the west,» she wrote."]},
    {k:'item', t:'m_serow', n:5,
      say:['ด้ายเส้นแรกต้องปั่นจากขนเลียงผาที่หากินบนหน้าผา เก็บมาให้ข้า 5 ชิ้นนะ', 'The first thread must be spun from the wool of the cliff serow. Bring me 5.'],
      done:['ด้ายเส้นแรกเสร็จแล้ว อุ่นเหมือนแดดยามเช้า! ข้าจะทอผ้าตะวันให้สำเร็จ เจ้าไปด้วยกันนะ นี่ กิ๊บดอกเอื้องของข้า ทำเพิ่มให้เจ้าอันหนึ่ง', 'The first thread is spun, warm as morning sun! I will weave the Sun Cloth — come with me. Here, a copy of my orchid hairpin.']}
  ]},
  45:{npc:{id:'ms_maihom', name:'ไม้หอม', en:'Mai Hom', role:['เด็กชายตัดไม้ป่าสน', 'Pine-wood boy'], sex:'m', hair:6, color:'hairBrown', eye:'irisGr', gear:{armor:'s_forest', head:'h_antler', mask:'ms_k_scarf'}},
    title:['ยางสนสีเขียว', 'Green Pine Resin'], cos:'ms_k_scarf',
    kh:['ต้นสนหอมจัง… ยายบอกว่าด้ายสีเขียวย้อมจากยางสน', 'The pines smell lovely… Grandma said the green thread is dyed with pine resin.'], steps:[
    {k:'kill', t:'snowpine_wisp', n:12, say:['ภูตหิมะแช่แข็งยางสนจนกรีดไม่ออก ช่วยไล่ 12 ตน แล้วข้าจะพาไปกรีดยาง', "Snow wisps freeze the pine resin solid. Drive off 12 and I'll show you where to tap it."],
      done:['ยางเริ่มไหลแล้ว! ยางจากต้นสนที่แก่ที่สุดให้สีเขียวสดที่สุด', 'The resin flows again! The oldest pines give the brightest green.']},
    {k:'find', n:3, what:['ต้นสนแก่ที่มีรอยกรีดยาง', 'Old tapped pine'], say:['ต้นสนแก่ 3 ต้นที่ปู่กรีดไว้ ยังมียางสะสมอยู่ ไปเก็บมานะ', 'Three old pines Grandpa tapped still hold resin. Go and collect it.'],
      done:['ด้ายย้อมยางสนเป็นสีเขียวเหมือนป่าหน้าร้อน… แต่หมีสนหิมะได้กลิ่นยางแล้ว!', 'The resin-dyed thread is green as a summer forest… but the snow-pine bear has caught the scent!']},
    {k:'elite', t:'snowpine_bear', name:['หมีสนหิมะหิวโหย', 'The Hungry Snow-pine Bear'], say:['หมีตัวนั้นจำศีลไม่ได้เพราะหนาวเกินไป มันหิวจนคลั่ง ระวังนะ!', 'It is too cold for that bear to hibernate — it is mad with hunger. Careful!'],
      done:['หมีวิ่งกลับเข้าป่าแล้ว ผ้าพันคอสนเขียวผืนนี้ข้าถักเอง ใส่แล้วอุ่นถึงคอเลย', 'The bear ran back into the woods. I knitted this pine-green scarf myself — it keeps you warm right up to the chin.']}
  ]},
  26:{npc:{id:'ms_plangern', name:'ปลาเงิน', en:'Pla Ngoen', role:['สาวตกปลาน้ำแข็ง', 'Ice-fishing girl'], sex:'f', hair:14, color:'hairSilver', eye:'irisBl', gear:{armor:'s_glacier', head:'ms_h_furhat'}},
    title:['ด้ายเงินจากทะเลสาบน้ำแข็ง', 'Silver Thread from the Frozen Lake'], cos:'ms_h_furhat',
    kh:['ทะเลสาบแข็งเป็นกระจกเลย! ระวังลื่นนะ', 'The lake is frozen like a mirror! Mind you don\'t slip.'], steps:[
    {k:'kill', t:'frosttoad', n:12, say:['คางคกน้ำแข็งนั่งทับรูตกปลาของข้าหมด ช่วยไล่ 12 ตัวนะ', 'Frost toads are sitting on all my fishing holes. Drive off 12.'],
      done:['ตกปลาได้แล้ว! ด้ายเงินทำจากขนจิ้งจอกหิมะที่ร่วงตามริมทะเลสาบ', 'I can fish again! The silver thread is made from snow-fox fur shed along the shore.']},
    {k:'item', t:'m_snowfox', n:5, say:['เก็บขนจิ้งจอกหิมะมา 5 ชิ้น ข้าจะปั่นเป็นด้ายเงินแวววาว', "Bring me 5 bits of snow-fox fur and I'll spin a shining silver thread."],
      done:['ด้ายเงินเสร็จแล้ว แวววาวเหมือนแสงจันทร์บนน้ำแข็ง… แต่ปูน้ำแข็งยักษ์ใต้ทะเลสาบกำลังทุบน้ำแข็งขึ้นมา!', 'The silver thread shines like moonlight on ice… but the giant ice crab beneath the lake is smashing its way up!']},
    {k:'elite', t:'icecrab', name:['ปูน้ำแข็งยักษ์', 'The Giant Ice Crab'], say:['ถ้ามันทุบน้ำแข็งแตก ทั้งหมู่บ้านตกปลาจะจมน้ำ หยุดมันที!', 'If it cracks the ice the whole fishing village will sink. Stop it!'],
      done:['หมู่บ้านปลอดภัยแล้ว หมวกขนจิ้งจอกใบนี้ อุ่นที่สุดในทะเลสาบ ให้เจ้านะ', 'The village is safe. This fox-fur hat is the warmest on the lake — it is yours.']}
  ]},
  46:{npc:{id:'ms_thara', name:'ธารา', en:'Thara', role:['นายพรานแห่งฟยอร์ด', 'Fjord hunter'], sex:'m', hair:9, color:'hairNavy', eye:'irisBl', gear:{armor:'ms_t_fjord', head:'f_clipstar'}},
    title:['สีครามแห่งฟยอร์ด', 'Fjord Blue'], cos:'ms_t_fjord',
    kh:['หน้าผาน้ำแข็งสูงจนมองไม่เห็นยอด… น้ำข้างล่างสีครามสวยมาก', 'Ice cliffs taller than I can see… and the water below is such a deep blue.'], steps:[
    {k:'kill', t:'fjord_wolf', n:12, say:['ฝูงหมาป่าฟยอร์ดล้อมเรือข้าไว้ ช่วยไล่ 12 ตัวนะ', 'A fjord wolf pack has surrounded my boat. Drive off 12.'],
      done:['สีครามของด้ายย้อมจากแมงกะพรุนฟยอร์ดที่เรืองแสงใต้น้ำ แต่เรือเล็กติดน้ำแข็งอยู่ทั่วอ่าว', 'Fjord-blue dye comes from the jellyfish that glow beneath the water, but boats are stuck in the ice all over the bay.']},
    {k:'find', n:3, what:['เรือเล็กที่ติดน้ำแข็ง', 'Ice-locked boat'], say:['เรือของชาวประมง 3 ลำติดน้ำแข็งอยู่ ข้างในมีถังย้อมสีคราม ไปช่วยเอาออกมาที', 'Three fishing boats are trapped in the ice with blue dye vats aboard. Help get them out.'],
      done:['ได้ถังย้อมครบแล้ว! ด้ายสีครามสวยเหมือนน้ำในฟยอร์ด… แต่ยักษ์ธารน้ำแข็งกำลังเลื่อนลงมาปิดอ่าว!', 'All the vats! The thread is as blue as the fjord… but the glacier giant is sliding down to seal the bay!']},
    {k:'elite', t:'fjord_golem', name:['ยักษ์ธารน้ำแข็ง', 'The Glacier Giant'], say:['ถ้ามันปิดอ่าว เราจะออกเรือไม่ได้ตลอดฤดู ต้องหยุดมัน!', 'If it seals the bay no boat can leave all season. We must stop it!'],
      done:['อ่าวเปิดแล้ว ชุดนายพรานฟยอร์ดนี้กันลมทะเลได้ดีที่สุด เอาไปใส่เถอะ', 'The bay is open. This fjord hunter suit keeps out the sea wind — take it.']}
  ]},
  27:{npc:{id:'ms_phalueak', name:'ผลึก', en:'Phalueak', role:['หมอยาแห่งถ้ำน้ำแข็ง', 'Ice-cave healer'], sex:'f', hair:22, color:'hairWhite', eye:'irisTl', gear:{armor:'s_aurora', mask:'ms_k_crystal', head:'h_haloc'}},
    title:['แสงในถ้ำนิรันดร์', 'Light in the Eternal Cave'], cos:'ms_k_crystal',
    kh:['ถ้ำนี้มืดแต่ผลึกน้ำแข็งเรืองแสงสวยจัง', 'This cave is dark, but the ice crystals glow so beautifully.'], steps:[
    {k:'kill', t:'icebat', n:12, say:['ค้างคาวน้ำแข็งกัดคนป่วยที่ข้ารักษาอยู่ ช่วยไล่ 12 ตัวนะ', 'Ice bats keep biting the sick people I am treating. Drive off 12.'],
      done:['ขอบใจ… แสงในผลึกน้ำแข็งเกิดจากภูตเยือกแข็ง ถ้าเก็บแสงของพวกมันได้ จะทอเป็นด้ายแสงได้', 'Thank you… the light in the crystals comes from frost wisps. If we gather their light, it can be spun into a thread of light.']},
    {k:'item', t:'m_frostwisp', n:5, say:['เก็บประกายจากภูตเยือกแข็ง 5 ชิ้น ข้าจะกลั่นเป็นด้ายแสง', 'Gather 5 glimmers from the frost wisps and I will distil a thread of light.'],
      done:['ด้ายแสงเรืองรองในมือเจ้า… แต่เยติผู้เฝ้าถ้ำไม่ชอบให้ใครเอาแสงออกไป', 'The thread of light glows in your hands… but the yeti who guards the cave hates anyone taking its light.']},
    {k:'elite', t:'yeti', name:['เยติผู้เฝ้าถ้ำ', 'The Cave-keeper Yeti'], say:['เยติขวางปากถ้ำไว้แล้ว! มันแรงมาก ระวังนะ', 'The yeti is blocking the cave mouth! It is enormously strong — careful!'],
      done:['เราออกมาได้แล้ว ประกายผลึกที่แก้มนี้ ข้าวาดให้คนที่กล้าหาญที่สุดเท่านั้นนะ', 'We are out. I paint these crystal sparkles on the cheeks of only the bravest.']}
  ]},
  47:{npc:{id:'ms_saengnuea', name:'แสงเหนือ', en:'Saeng Nuea', role:['สาวร่ายรำแสงเหนือ', 'Aurora dancer'], sex:'f', hair:11, color:'hairLilac', eye:'irisVi', gear:{armor:'s_seraph', head:'h_halov'}, wing:'ms_b_aurora'},
    title:['สีของแสงเหนือ', 'The Colours of the Aurora'], cos:'ms_b_aurora',
    kh:['ท้องฟ้ามีแสงสีเขียวม่วงพลิ้วไปมา… สวยที่สุดที่เคยเห็นเลย', 'Green and violet light ripples across the sky… the most beautiful thing I have ever seen.'], steps:[
    {k:'kill', t:'aurora_fiend', n:12, say:['ภูตทุนดรากลืนแสงเหนือไปทีละสี ข้ารำเรียกแสงไม่ขึ้นแล้ว ช่วยไล่ 12 ตนนะ', 'The tundra fiends swallow the aurora one colour at a time — my dance cannot call it any more. Drive off 12.'],
      done:['แสงกลับมาบางส่วนแล้ว… ถ้าจะทอสีแสงเหนือลงด้าย ต้องเก็บแสงจากเสาหินโทเท็ม 3 ต้น', 'Some of the light is back… to weave the aurora into thread, we must gather it from three totem stones.']},
    {k:'find', n:3, what:['เสาโทเท็มแสงเหนือ', 'Aurora totem'], say:['เสาโทเท็มเก็บแสงเหนือไว้ทุกคืน ไปแตะทั้ง 3 ต้นนะ', 'The totems gather the aurora every night. Touch all three.'],
      done:['ด้ายเจ็ดสีของแสงเหนือเสร็จแล้ว! — «ผ้าของเราจะสวยที่สุดในโลกเลย» ดอกเอื้องยิ้มกว้าง', 'The seven-coloured aurora thread is done! — «Our cloth will be the most beautiful in the world,» Dok Ueang beams.']},
    {k:'elite', t:'aurora_stag', name:['กวางแสงเหนือที่ถูกสาป', 'The Cursed Aurora Stag'], say:['กวางแสงเหนือผู้นำแสงมาถูกความหนาวสาปจนคลั่ง ช่วยปลดคำสาปที!', 'The aurora stag who leads the light has been driven mad by the cold. Lift the curse!'],
      done:['กวางวิ่งพาแสงเหนือข้ามฟ้าแล้ว ปีกแสงเหนือคู่นี้ ข้ารำทอให้เจ้า ใส่แล้วพลิ้วเหมือนท้องฟ้าคืนนี้', 'The stag runs the aurora across the sky again. I danced these aurora wings for you — they ripple like tonight\'s sky.']}
  ]},
  28:{npc:{id:'ms_phupha', name:'ภูผา', en:'Phu Pha', role:['เด็กชายเลี้ยงแมมมอธ', 'Mammoth herder'], sex:'m', hair:15, color:'hairChestnut', eye:'irisBr', gear:{armor:'ms_t_herder', head:'h_antleri'}},
    title:['ขนแมมมอธพันปี', 'Thousand-year Mammoth Wool'], cos:'ms_t_herder',
    kh:['แมมมอธตัวใหญ่กว่าบ้านอีก! แต่ดูใจดีนะ', 'The mammoths are bigger than houses! But they look gentle.'], steps:[
    {k:'kill', t:'icewolf', n:12, say:['หมาป่าน้ำแข็งไล่ล่าลูกแมมมอธในฝูงข้า ช่วยไล่ 12 ตัวนะ', 'Ice wolves hunt the calves in my herd. Drive off 12.'],
      done:['ฝูงปลอดภัยแล้ว แมมมอธผลัดขนทุกปี ขนของมันอุ่นที่สุดในโลก แต่ลูกแมมมอธ 3 ตัวหนีหายไปตอนหมาป่าบุก', 'The herd is safe. Mammoths shed every year and their wool is the warmest in the world — but three calves ran off when the wolves came.']},
    {k:'find', n:3, what:['ลูกแมมมอธที่พลัดหลง', 'Lost mammoth calf'], say:['ช่วยตามหาลูกแมมมอธ 3 ตัวที่พลัดหลง แล้วข้าจะให้ขนแมมมอธที่ดีที่สุด', 'Find the three lost calves and I will give you the finest mammoth wool.'],
      done:['ลูก ๆ กลับมาครบแล้ว! แม่แมมมอธให้ขนอุ่น ๆ เป็นการขอบคุณ ด้ายขาวหนานุ่มเลย', 'All three calves are home! Their mother gives warm wool in thanks — a thick, soft white thread.']},
    {k:'elite', t:'icewyrm', name:['หนอนน้ำแข็งยักษ์', 'The Giant Ice Wyrm'], say:['หนอนน้ำแข็งยักษ์ทะลุธารน้ำแข็งขึ้นมา มันกินลูกแมมมอธ!', 'A giant ice wyrm burst up through the glacier — it eats the calves!'],
      done:['ฝูงข้าปลอดภัยแล้ว ชุดคนเลี้ยงแมมมอธนี้ทอจากขนแมมมอธ อุ่นทั้งฤดู', 'My herd is safe. This mammoth herder outfit is woven of mammoth wool — warm all season.']}
  ]},
  48:{npc:{id:'ms_phailin', name:'ไพลิน', en:'Phailin', role:['ช่างเจียระไนไพลิน', 'Sapphire cutter'], sex:'f', hair:5, color:'hairNavy', eye:'irisBl', gear:{armor:'s_void', head:'ms_h_sapphire', mask:'f_round'}},
    title:['เข็มไพลิน', 'The Sapphire Needle'], cos:'ms_h_sapphire',
    kh:['ถ้ำนี้มีแต่ไพลินสีน้ำเงินเต็มผนัง… ระยิบระยับไปหมด', 'The walls are covered in blue sapphires… everything sparkles.'], steps:[
    {k:'kill', t:'sapphire_crawler', n:12, say:['แมลงถ้ำกัดกินผลึกไพลินจนพรุน ช่วยไล่ 12 ตัวนะ', 'Cave crawlers are gnawing holes in the sapphires. Drive off 12.'],
      done:['ผ้าตะวันต้องเย็บขอบด้วยเข็มไพลิน เพราะเข็มเหล็กจะเย็นจนด้ายแตก', 'The Sun Cloth must be hemmed with a sapphire needle — an iron needle grows so cold the thread snaps.']},
    {k:'item', t:'m_sapphire_wisp', n:5, say:['ประกายจากภูตไพลิน 5 ชิ้นใช้ขัดเข็มให้แหลมคม หามาให้ข้าที', 'Five glimmers from the sapphire wisps will polish the needle sharp. Bring them.'],
      done:['เข็มไพลินเสร็จแล้ว แหลมจนแสงลอดผ่านได้! …แต่ยักษ์ผลึกได้ยินเสียงขัดเข็ม', 'The sapphire needle is done, so sharp the light passes through it! …but the crystal giant heard the polishing.']},
    {k:'elite', t:'sapphire_golem', name:['ยักษ์ผลึกไพลิน', 'The Sapphire Giant'], say:['ยักษ์ผลึกคิดว่าเราขโมยหัวใจของมัน! ต้องสู้แล้ว!', 'The crystal giant thinks we stole its heart! We have to fight!'],
      done:['ยักษ์สงบแล้ว มงกุฎไพลินนี้ข้าเจียระไนเอง ส่องแสงเหมือนน้ำแข็งยามเช้า', 'The giant is calm. I cut this sapphire crown myself — it shines like ice at dawn.']}
  ]},
  19:{npc:{id:'ms_khontan', name:'คนธรรพ์น้อย', en:'Little Gandharva', role:['นักดนตรีแห่งเขาไกรลาส', 'Musician of Kailash'], sex:'m', hair:12, color:'hairGold', eye:'irisGd', gear:{armor:'s_suriya', head:'h_wreathg'}, wing:'ms_b_notes'},
    title:['เพลงอวยพรกี่ทอผ้า', 'The Loom Blessing Song'], cos:'ms_b_notes',
    kh:['เขาไกรลาส… สูงจนเหมือนแตะสวรรค์ได้เลย', 'Mount Kailash… so high it seems to touch heaven.'], steps:[
    {k:'kill', t:'frostyaksha', n:12, say:['ยักษ์น้ำแข็งทุบพิณของข้าพัง! ข้าเล่นเพลงไม่ได้ ช่วยไล่ 12 ตนนะ', 'The frost yakshas smashed my harp! I cannot play. Drive off 12.'],
      done:['ผ้าที่จะสู้กับฤดูหนาวนิรันดร์ ต้องได้รับพรจากเพลงของคนธรรพ์ แต่ธงมนต์ 3 ผืนที่ใช้บรรเลงถูกลมพัดไป', 'A cloth that can fight endless winter needs a gandharva\'s song as its blessing — but the three prayer flags I play to were blown away.']},
    {k:'find', n:3, what:['ธงมนต์ที่ปลิวไปกับลม', 'Windblown prayer flag'], say:['ธงมนต์ 3 ผืนติดอยู่ตามหน้าผา ช่วยเก็บมาให้ข้า', 'Three prayer flags are caught on the cliffs. Bring them back to me.'],
      done:['ข้าบรรเลงเพลงอวยพรแล้ว… ด้ายทุกเส้นในตะกร้าของดอกเอื้องส่องแสงอบอุ่น!', 'I have played the blessing… every thread in Dok Ueang\'s basket glows with warmth!']},
    {k:'elite', t:'icesentinel', name:['ทวารบาลน้ำแข็ง', 'The Ice Sentinel'], say:['ทวารบาลน้ำแข็งของพญาหิมะมาขวางไม่ให้พรไปถึงผ้า!', 'The Snow King\'s ice sentinel has come to stop the blessing reaching the cloth!'],
      done:['เพลงของข้าจะตามเจ้าไปทุกที่ โน้ตเพลงคนธรรพ์เหล่านี้จะลอยวนรอบตัวเจ้า', 'My song will go with you everywhere — these gandharva notes will float around you.']}
  ]},
  49:{npc:{id:'ms_nawa', name:'นาวา', en:'Nawa', role:['กัปตันเรือน้อย', 'Young ship captain'], sex:'f', hair:2, color:'hairAuburn', eye:'irisBl', gear:{armor:'ms_t_captain', head:'f_bow'}},
    title:['กระสวยจากซากเรือ', 'A Shuttle from the Wreck'], cos:'ms_t_captain',
    kh:['เรือทั้งลำจมอยู่ในน้ำแข็ง… คนบนเรือไปไหนหมดนะ', 'A whole ship frozen in the ice… where did its crew go?'], steps:[
    {k:'kill', t:'wreck_crab', n:12, say:['ปูยักษ์ทำรังในเรือของปู่ข้า ช่วยไล่ 12 ตัวนะ ข้าจะได้ขึ้นไปเก็บของ', 'Giant crabs nest in my grandfather\'s ship. Drive off 12 so I can go aboard.'],
      done:['เรือลำนี้ทำจากไม้สักทองที่ไม่มีวันผุ ปู่บอกว่าไม้นี้เหมาะทำกระสวยทอผ้า', 'This ship is built of golden teak that never rots. Grandfather said it makes the best loom shuttles.']},
    {k:'item', t:'m_wreck_bear', n:5, say:['หมีที่ยึดห้องเก็บของไว้คาบเศษไม้สักไปหมด เอาคืนมา 5 ชิ้น', 'The bears in the hold carried off the teak scraps. Bring back 5.'],
      done:['กระสวยไม้สักทองเสร็จแล้ว ลื่นเหมือนปลาว่ายน้ำ… แต่วิญญาณกะลาสียังไม่ยอมให้ใครเอาของจากเรือไป', 'The golden-teak shuttle is done, slick as a swimming fish… but the sailors\' spirits still let no one take anything from the ship.']},
    {k:'elite', t:'wreck_warrior', name:['ผีกะลาสีน้ำแข็ง', 'The Frozen Sailor'], say:['ผีกะลาสียังเฝ้าเรือแม้ตายไปนาน ปลดปล่อยเขาให้ได้พักเถอะ', 'The sailor still guards the ship long after death. Free him so he can rest.'],
      done:['เขาได้พักแล้ว… ชุดกัปตันเรือน้ำแข็งนี้เป็นของปู่ ข้าคิดว่าปู่อยากให้เจ้าใส่', 'He rests at last… this ice-ship captain\'s coat was Grandfather\'s. I think he would want you to wear it.']}
  ]},
  29:{npc:{id:'ms_janhima', name:'จันทร์หิมะ', en:'Jan Hima', role:['เจ้าหญิงแห่งป้อมหิมะ', 'Princess of the Snow Citadel'], sex:'f', hair:4, color:'hairWhite', eye:'irisSv', gear:{armor:'s_glacier', head:'ms_h_snowtiara'}, wing:'w_crystal'},
    title:['น้ำตาของพญาหิมะ', "The Snow King's Tears"], cos:'ms_h_snowtiara',
    kh:['ป้อมน้ำแข็งเงียบเชียบ… ทำไมรู้สึกเศร้าจัง', 'The ice citadel is so silent… why does it feel so sad?'], steps:[
    {k:'kill', t:'icesentry', n:12, say:['อย่ากลัว ข้าคือลูกสาวพญาหิมะ ยามน้ำแข็งเฝ้าพ่อจนไม่ให้ใครเข้าใกล้ ช่วยข้าผ่านไป 12 ตน', 'Do not be afraid — I am the Snow King\'s daughter. The ice sentries let no one near my father. Help me past 12 of them.'],
      done:['พ่อไม่ได้ใจร้าย… เมื่อแม่ป่วยหนัก พ่อแช่แข็งทั้งแผ่นดินเพื่อไม่ให้แม่จากไป ความหนาวทั้งหมดคือความเศร้าของพ่อ', 'Father is not cruel… when Mother fell gravely ill, he froze the whole land so she would never leave. All this cold is his grief.']},
    {k:'find', n:3, what:['ผลึกน้ำตาของพญาหิมะ', "Crystal of the Snow King's tears"], say:['น้ำตาของพ่อแข็งเป็นผลึก 3 ก้อนในป้อม ถ้าทอลงผ้า ผ้าจะเข้าใจหัวใจของพ่อ', 'Father\'s tears froze into three crystals in the citadel. Woven into the cloth, they will let it understand his heart.'],
      done:['ด้ายเส้นสุดท้ายทอจากน้ำตาพ่อ… ผ้าทอตะวันพร้อมแล้ว — «เราจะไม่ทำร้ายพ่อเจ้า เราจะช่วยเขา» ดอกเอื้องจับมือเจ้าหญิง', 'The last thread is spun from Father\'s tears… the Sun Cloth is ready. — «We won\'t hurt your father. We will help him,» Dok Ueang says, taking the princess\'s hand.']},
    {k:'elite', t:'frostnaga', name:['นาคน้ำแข็งของพญาหิมะ', "The Snow King's Frost Naga"], say:['นาคน้ำแข็งของพ่อเข้าใจผิดว่าเรามาทำร้าย ต้องหยุดมันก่อน!', "Father's frost naga thinks we came to harm him. We must stop it first!"],
      done:['ทางขึ้นยอดเขาพายุหิมะเปิดแล้ว พ่อกับแม่อยู่ที่นั่น มงกุฎเจ้าหญิงหิมะนี้ ข้าอยากให้เจ้าใส่', 'The way to Blizzard Peak is open; Father and Mother are there. I want you to wear this snow princess tiara.']}
  ]},
  50:{npc:MS_DOKUEANG, title:['ผ้าทอตะวัน', 'The Sun-woven Cloth'], cos:'ms_t_suncloth', finale:true, steps:[
    {k:'kill', t:'blizzard_wisp', n:12, say:['พายุหิมะแรงจนมองไม่เห็นทาง ภูตพายุหมุนวนรอบยอดเขา ช่วยข้าฝ่าไป 12 ตน!', 'The blizzard is so thick we cannot see. Storm wisps whirl round the peak — help me through twelve!'],
      done:['เห็นแล้ว… พญาหิมะนั่งข้างโลงน้ำแข็ง ข้างในคือพระมเหสีที่หลับใหลมาร้อยปี', 'There… the Snow King sits beside an ice coffin, and inside lies his queen, asleep for a hundred years.']},
    {k:'find', n:3, what:['หินตั้งกี่ทอผ้าบนยอดเขา', 'Loom stone on the peak'], say:['ข้าต้องขึงผ้าบนหินตั้งกี่ 3 ก้อน แล้วทอให้เสร็จตรงนี้ เจ้าช่วยหาหินให้หน่อยนะ', 'I must string the cloth on three loom stones and finish it right here. Help me find them.'],
      done:['ผ้าทอตะวันเสร็จแล้ว อุ่นจนหิมะรอบตัวละลาย… แต่ขุนพลพายุหิมะของพญาหิมะขวางไว้!', 'The Sun-woven Cloth is finished, so warm the snow melts around us… but the Snow King\'s blizzard general blocks the way!']},
    {k:'elite', t:'blizzard_warrior', hp:2.5, name:['ขุนพลพายุหิมะ', 'The Blizzard General'], say:['ขุนพลคนนี้สาบานว่าจะไม่ให้ใครแตะโลงของพระมเหสี เราต้องผ่านเขาไปให้ได้!', 'The general has sworn no one will touch the queen\'s coffin. We must get past him!'],
      done:['ดอกเอื้องห่มผ้าทอตะวันบนโลงน้ำแข็ง พระมเหสีลืมตา ยิ้มให้พญาหิมะ ขอบคุณที่รักนาง แล้วจากไปอย่างสงบ พญาหิมะร้องไห้ด้วยน้ำตาอุ่นเป็นครั้งแรก หิมะละลาย ดอกเอื้องบานทั่วแผ่นดินตะวันตก นี่ ชุดผ้าทอตะวัน ข้าทอเผื่อเจ้าอีกชุด ขอบคุณที่เดินทางมาด้วยกันนะ!', 'Dok Ueang lays the Sun-woven Cloth over the ice coffin. The queen opens her eyes, smiles at the Snow King, thanks him for loving her, and passes peacefully. For the first time the king weeps warm tears; the snow melts and orchids bloom across the west. Here — I wove a Sun-cloth outfit for you too. Thank you for walking this road with me!']}
  ]}
});
