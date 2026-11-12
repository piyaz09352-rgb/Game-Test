/* VAYRATHEN — js/data/mapstory_north.js — (v217) map stories, the north road: «ประทีปพันดวง» (The Thousand Lamps)
   19 maps, Lv 210–300, from the lands of darkness up to the lands of light: the forest temple ruins, the mire, the
   caves and the glowcap forest, the cemetery and the tomb of kings, Laplae, the cursed spire, the naga underworld, the
   crimson lake and the asura labyrinth, then Himmapan, the floating gardens, the Milky Way, Mount Meru, the crystal
   palace, the gate of Tavatimsa and the Throne of the Sun. (The Floating Deva City is a town, not a chapter.)

   The tale: the lamps of the ruined forest temple have gone out one by one as the Asura's darkness rises in the north.
   Prathip, the girl who keeps them, learns from the abbot's last words that a path of a thousand lamps once ran from
   the temple to heaven, and that each lamp is lit by an act of kindness. Map by map she lights one more — by giving
   rest to a drowned lantern-bearer, a kind miner's ghost, a little ghost prince, a lost asura boy, the seventh chick of
   the Pleiades… The lamps gather into a road of light the Asura cannot cross, and at the Throne of the Sun the last
   lamp shows her the star her temple-dancer mother became. */
'use strict';

const MS_PRATHIP = {id:'ms_prathip', name:'ประทีป', en:'Prathip', role:['เด็กหญิงจุดประทีปแห่งวัดร้าง · เนื้อเรื่องเสริม', 'Temple lamp-keeper · Side story'],
  sex:'f', hair:16, color:'hairBlack', eye:'irisGd', gear:{armor:'s_lotus', head:'ms_h_lamp', mask:'f_blush'}};

MS_ARCS.push({id:'north', title:['ประทีปพันดวง', 'The Thousand Lamps'], maps:[5, 51, 6, 52, 8, 53, 16, 54, 17, 55, 56, 18, 57, 14, 58, 20, 59, 30, 60],
  blurb:['จุดประทีปทีละดวงด้วยความเมตตากับประทีป จากดินแดนแห่งความมืดสู่บัลลังก์สุริยะ', 'Light one lamp at a time with kindness alongside Prathip, from the lands of darkness to the Throne of the Sun'],
  title_id:'ms_north', titleName:['ผู้จุดประทีปพันดวง', 'Lamplighter of a Thousand Lamps'], mount:'ms_m_barge', comp:MS_PRATHIP, compArmor:'ms_t_sun',
  doneSay:['ทุกคืนข้าจะมองหาดาวของแม่ แล้วจุดประทีปให้ทุกคนที่ยังหลงทางนะ ขอบคุณที่จุดดวงแรก ๆ กับข้า', 'Every night I look for Mother\'s star, and I light a lamp for everyone still lost. Thank you for lighting the first ones with me.']});

const msNN = (id, name, en, roleTh, roleEn, sex, hair, color, eye, gear, wing) => ({id, name, en, role:[roleTh, roleEn], sex, hair, color, eye, gear, wing});
const msS3 = (kill, killN, mid, end) => [kill, mid, end];   // (readability only)
void msS3;

Object.assign(MS_CH, {
  5:{npc:MS_PRATHIP, title:['ประทีปดวงแรก', 'The First Lamp'], cos:'ms_h_lamp', steps:[
    {k:'kill', t:'stuccoyaksha', n:10, say:['ประทีปในวิหารดับไปทีละดวง ตั้งแต่ยักษ์ปูนปั้นตื่นขึ้นมาเฝ้าวัดแทนหลวงพ่อ ช่วยสงบพวกเขา 10 ตนก่อนนะ', 'The lamps in the hall have died one by one since the stucco yakshas woke to guard the temple in the abbot\'s place. Calm 10 of them first.'],
      done:['ขอบใจนะ… ก่อนหลวงพ่อจากไป ท่านบอกว่าเคยมีทางประทีปพันดวงจากวัดนี้ไปถึงสวรรค์ ทุกดวงจุดด้วยความเมตตา', 'Thank you… before the abbot passed he told me a path of a thousand lamps once ran from this temple to heaven, every lamp lit by an act of kindness.']},
    {k:'find', n:3, what:['ตะเกียงดินที่ดับแล้ว', 'Cold clay lamp'], say:['ตะเกียงดินเก่า 3 ดวงตกอยู่ในซากวิหาร เก็บมาให้ข้าทำความสะอาดหน่อยนะ', 'Three old clay lamps lie in the ruined hall. Bring them so I can clean them.'],
      done:['ใต้ตะเกียงมีอักษรใบลานเขียนว่า «ประทีปดวงแรกต้องจุดด้วยน้ำมันที่ได้จากการแบ่งปัน»', 'Under the lamps a palm-leaf note reads: «The first lamp must burn oil that was shared.»']},
    {k:'item', t:'m_offeringsquirrel', n:5, say:['กระรอกที่ขโมยของถวายวัดไปเก็บไว้เยอะเลย ขอคืนมา 5 ชิ้น ข้าจะแบ่งเป็นน้ำมันจุดประทีป', 'The squirrels have hoarded the temple offerings. Bring back 5 and I will share them out as lamp oil.'],
      done:['ประทีปดวงแรกสว่างแล้ว! แสงพุ่งไปทางเหนือเหมือนชี้ทาง… เจ้าไปจุดดวงต่อไปกับข้านะ นี่ ปิ่นประทีปของข้า ทำเพิ่มให้เจ้าอันหนึ่ง', 'The first lamp is lit! Its light points north like a road… come and light the next one with me. Here, a copy of my lamp hairpin.']}
  ]},
  51:{npc:msNN('ms_maen', 'ป้าแม้น', 'Auntie Maen', 'แม่ค้าพายเรือในบึงเงา', 'Mire boatwoman', 'f', 0, 'hairSilver', 'irisBr', {armor:'s_bloodmoon', mask:'ms_k_shadow'}),
    title:['คนถือโคมผู้จมน้ำ', 'The Drowned Lantern-bearer'], cos:'ms_k_shadow',
    kh:['บึงนี้มืดจนมองไม่เห็นมือตัวเองเลย… ข้าจะถือประทีปไว้ใกล้ ๆ นะ', 'This mire is so dark I can\'t see my own hand… I\'ll keep the lamp close.'], steps:[
    {k:'kill', t:'gloom_jelly', n:12, say:['วุ้นเงาเกาะเรือข้าจนพายไม่ไป ช่วยกำจัด 12 ก้อนนะ', 'Shadow jellies cling to my boat so I can\'t pole it. Clear 12 of them.'],
      done:['ขอบใจ… มีวิญญาณคนถือโคมจมอยู่ในบึงนี้มาร้อยปี เขาตามหาโคมที่ทำหายตอนเรือล่ม', 'Thank you… a lantern-bearer\'s spirit has been drowned in this mire for a hundred years, searching for the lamps he lost when his boat sank.']},
    {k:'find', n:3, what:['โคมที่จมอยู่ในบึง', 'Sunken lantern'], say:['โคมของเขา 3 ดวงจมอยู่ตามกอหญ้า ลองหาดูนะ', 'His three lanterns lie sunk among the reeds. See if you can find them.'],
      done:['เขาได้โคมคืนแล้ว ยิ้มก่อนจางหายไป… ประทีปดวงที่สองติดเองในมือประทีป!', 'He has his lanterns back and smiles as he fades… the second lamp lights by itself in Prathip\'s hands!']},
    {k:'elite', t:'gloom_elephant', name:['ช้างเงาแห่งบึงมรณะ', 'The Shadow Elephant of the Mire'], say:['ช้างเงาได้กลิ่นแสงประทีปแล้ว มันเกลียดแสงที่สุด!', 'The shadow elephant has smelled the lamplight — it hates light above all!'],
      done:['บึงสว่างขึ้นนิดหนึ่งแล้ว ผ้าคลุมหน้านี้ป้าใส่พายเรือในหมอกมาทั้งชีวิต ให้เจ้านะ', 'The mire is a little brighter. I have worn this veil poling through the fog all my life — it is yours.']}
  ]},
  6:{npc:msNN('ms_lungmuang', 'ลุงเหมือง', 'Uncle Mueang', 'วิญญาณคนขุดแร่ใจดี', 'Kind miner\'s ghost', 'm', 2, 'hairAsh', 'irisBr', {armor:'s_knight', head:'ms_h_minerwrap'}),
    title:['ตะเกียงของคนขุดแร่', "The Miner's Lamp"], cos:'ms_h_minerwrap',
    kh:['ถ้ำนี้ลึกจัง… ข้าได้ยินเสียงใครเคาะหินอยู่ข้างใน', 'This cave goes so deep… I can hear someone tapping stone inside.'], steps:[
    {k:'kill', t:'cavespider', n:12, say:['อย่ากลัวนะหนู ลุงตายในถ้ำนี้นานแล้ว แต่ยังห่วงลูกน้อง ฝูงต่อถ้ำล้อมพวกเขาไว้ ช่วยไล่ 12 ตัวที', 'Don\'t be scared, child — I died in this cave long ago but still watch over my crew. Cave hornets have them surrounded; drive off 12.'],
      done:['ลูกน้องลุงปลอดภัยแล้ว… ลุงทำตะเกียงหายตอนถ้ำถล่ม ถ้าได้คืน ลุงจะได้นำทางพวกเขาออกไป', 'My crew are safe… I lost my lamp when the tunnel fell in. If I had it back, I could lead them out.']},
    {k:'item', t:'m_firemillipede', n:5, say:['ไส้ตะเกียงลุงทำจากเปลือกตะขาบไฟ ช่วยหามา 5 ชิ้นนะ', 'My lamp wick was made from fire-millipede shell. Bring me 5 pieces.'],
      done:['ตะเกียงลุงสว่างอีกครั้ง! ลุงนำลูกน้องออกจากถ้ำแล้ว… ประทีปดวงที่สามติดแล้ว!', 'My lamp burns again! I have led my crew out of the cave… the third lamp is lit!']},
    {k:'elite', t:'stalagwalker', name:['หินย้อยเดินได้ผู้ขวางทาง', 'The Walking Stalagmite'], say:['หินย้อยยักษ์ขวางปากถ้ำไว้ ลุงพาลูกน้องผ่านไม่ได้!', 'A giant walking stalagmite is blocking the mouth of the cave — I can\'t get my crew past!'],
      done:['ทางออกโล่งแล้ว ผ้าโพกคนขุดแร่ผืนนี้ลุงใส่มาทั้งชีวิต เอาไปเถอะหนู', 'The way out is clear. I wore this miner\'s head wrap my whole life — take it, child.']}
  ]},
  52:{npc:msNN('ms_hethom', 'เห็ดหอม', 'Het Hom', 'ภูตเห็ดเรืองแสงน้อย', 'Little glowcap sprite', 'f', 8, 'hairMint', 'irisTl', {armor:'s_forest', head:'f_clip'}, 'ms_b_spores'),
    title:['วงเห็ดเรืองแสง', 'The Glowing Fairy Rings'], cos:'ms_b_spores',
    kh:['เห็ดส่องแสงสีฟ้าทั้งป่าเลย! สวยเหมือนดาวบนดิน', 'The whole forest glows blue with mushrooms! Like stars on the ground.'], steps:[
    {k:'kill', t:'glowcap_fiend', n:12, say:['ภูตร้ายกินแสงเห็ดจนป่ามืดลง เห็ดน้อยร้องไห้ ช่วยไล่ 12 ตนนะ', 'Fiends are eating the mushrooms\' light and the forest is going dark. The little mushrooms are crying — drive off 12.'],
      done:['แสงกลับมาบ้างแล้ว… แต่วงเห็ด 3 วงที่เป็นบ้านของเพื่อนข้ายังมืดอยู่', 'Some light is back… but the three fairy rings where my friends live are still dark.']},
    {k:'find', n:3, what:['วงเห็ดที่มืดลง', 'Darkened fairy ring'], say:['ไปเต้นรำรอบวงเห็ดทั้ง 3 วงนะ แสงจะกลับมาเอง', 'Go and dance round all three rings — their light will come back on its own.'],
      done:['เพื่อน ๆ ของข้าตื่นแล้ว! สปอร์เรืองแสงลอยขึ้นฟ้าเป็นประทีปดวงที่สี่!', 'My friends are awake! Glowing spores drift up into the sky as the fourth lamp!']},
    {k:'elite', t:'glowcap_stag', name:['กวางเห็ดผู้หลงแสง', 'The Light-mad Glowcap Stag'], say:['กวางเห็ดกินแสงเข้าไปมากจนคลั่ง ช่วยปลอบมันที!', 'The glowcap stag ate so much light it went mad. Soothe it!'],
      done:['กวางกลับไปนอนในป่าแล้ว สปอร์เรืองแสงพวกนี้อยากอยู่กับเจ้า ให้มันลอยวนรอบตัวนะ', 'The stag has gone back to sleep. These glowing spores want to stay with you — let them float around you.']}
  ]},
  8:{npc:msNN('ms_luangta', 'หลวงตาเฝ้าป่าช้า', 'The Cemetery Elder', 'ชีปะขาวเฝ้าป่าช้า', 'White-robed cemetery keeper', 'm', 1, 'hairWhite', 'irisBr', {armor:'ms_t_whiterobe', head:'ms_x_tathian'}),
    title:['สวดส่งวิญญาณ', 'Prayers for the Restless'], cos:'ms_t_whiterobe',
    kh:['ป่าช้านี้หนาวยะเยือกเลย… แต่ข้าไม่กลัวหรอก ถ้ามีเจ้าอยู่ด้วย', 'This cemetery is icy cold… but I am not afraid with you here.'], steps:[
    {k:'kill', t:'skelsoldier', n:12, say:['ทหารโครงกระดูกยังเดินรบอยู่ในป่าช้า เพราะไม่มีใครจุดประทีปส่งพวกเขา ช่วยให้พวกเขาได้พัก 12 ตนเถิดหลาน', 'The skeleton soldiers still march here because no one lit a lamp to send them on. Let 12 of them rest, child.'],
      done:['ดีแล้ว… แต่ยังมีโกศเก่าที่ไม่มีใครเหลียวแล วิญญาณในนั้นอยากได้ยินเสียงสวดสักครั้ง', 'Good… but there are old urns no one tends. The souls inside long to hear a prayer, just once.']},
    {k:'item', t:'m_hauntedurn', n:5, say:['นำเถ้าจากโกศหลอนมา 5 ชิ้น หลวงตาจะสวดส่งให้', 'Bring 5 ashes from the haunted urns and I will pray them on their way.'],
      done:['วิญญาณได้ไปสู่สุคติแล้ว… ประทีปดวงที่ห้าสว่างเงียบ ๆ ในป่าช้า', 'The souls have gone to a good rest… the fifth lamp glows quietly in the cemetery.']},
    {k:'elite', t:'krahang', name:['กระหังผู้ไม่ยอมไป', 'The Krahang Who Will Not Go'], say:['กระหังตนนี้ยังติดค้างความแค้น มันจะดับประทีปของหนู ระวังด้วย!', 'This krahang still clings to its grudge — it will snuff out Prathip\'s lamp. Careful!'],
      done:['มันได้ปล่อยวางแล้ว ชุดขาวถือศีลนี้ จะทำให้ใจเจ้าสงบแม้อยู่ในที่มืดที่สุด', 'It has let go at last. This white robe of the precepts will keep your heart calm even in the darkest places.']}
  ]},
  53:{npc:msNN('ms_prince', 'พระองค์เจ้าน้อย', 'The Little Prince', 'วิญญาณเจ้าชายน้อย', 'Little ghost prince', 'm', 3, 'hairBlack', 'irisGd', {armor:'s_siam', head:'ms_h_prince'}),
    title:['ตราของเจ้าชายน้อย', "The Little Prince's Seals"], cos:'ms_h_prince',
    kh:['สุสานนี้ใหญ่โตเหมือนวัง… แต่เงียบเหงาเหลือเกิน', 'This tomb is as grand as a palace… and so lonely.'], steps:[
    {k:'kill', t:'kingtomb_warrior', n:12, say:['เจ้าเป็นใคร… ทหารองครักษ์ของข้าคลั่งไปหมดแล้ว ช่วยให้พวกเขาหลับ 12 คนได้ไหม', 'Who are you…? My guards have all gone mad. Could you put 12 of them to sleep?'],
      done:['ขอบใจ… ข้าสิ้นพระชนม์ตอนยังเด็ก ยังไม่ได้รับตราตั้งเป็นเจ้าชายเลย ตรา 3 ดวงหายไปในสุสาน', 'Thank you… I died as a child, before I ever received my princely seals. The three seals are lost in the tomb.']},
    {k:'find', n:3, what:['ตราประทับของเจ้าชาย', "Prince's seal"], say:['ตรา 3 ดวงซ่อนอยู่ในห้องต่าง ๆ ช่วยข้าตามหาด้วยนะ', 'The three seals are hidden in different chambers. Help me find them.'],
      done:['ครบแล้ว! ข้าเป็นเจ้าชายจริง ๆ แล้ว… ตราทั้งสามเรืองแสงเป็นประทีปดวงที่หก!', 'All three! Now I am truly a prince… the seals glow together as the sixth lamp!']},
    {k:'elite', t:'kingtomb_elephant', name:['ช้างทรงผู้ซื่อสัตย์', 'The Faithful Royal Elephant'], say:['ช้างทรงของข้ายังเฝ้าประตูสุสานอยู่ มันไม่รู้ว่าข้าตายแล้ว…', 'My royal elephant still guards the tomb gate — it doesn\'t know I am gone…'],
      done:['ช้างทรงหลับแล้ว ข้าไปพักกับมันได้แล้ว ชฎาเจ้าชายน้อยนี้ ข้าอยากให้เจ้าใส่แทนข้า', 'My elephant sleeps, and now I can rest with it. I want you to wear this little prince\'s crown for me.']}
  ]},
  16:{npc:msNN('ms_laplae', 'แม่หญิงลับแล', 'Lady of Laplae', 'ชาวเมืองลับแล', 'Laplae villager', 'f', 11, 'hairBlack', 'irisGr', {armor:'ms_t_laplae', head:'h_wreathj'}),
    title:['เมืองที่ห้ามโกหก', 'The Town Where No One Lies'], cos:'ms_t_laplae',
    kh:['ได้ยินว่าเมืองลับแลห้ามพูดโกหก ข้าจะพูดแต่ความจริงนะ… ข้าหิวจัง', 'They say no one may lie in Laplae. I\'ll only tell the truth… I\'m really hungry.'], steps:[
    {k:'kill', t:'misttiger', n:12, say:['ยินดีต้อนรับ แต่อย่าโกหกนะ! เสือหมอกเข้ามาในเมืองเพราะหมอกคำสาปหนาขึ้น ช่วยไล่ 12 ตัวที', 'Welcome — but never lie! Mist tigers prowl the town because the cursed fog has thickened. Drive off 12.'],
      done:['เจ้าพูดความจริงเสมอ ข้าเชื่อใจได้… หมอกหนาขึ้นเพราะเจ้าเมืองถูกสาป ต้องใช้ผลไม้ที่ชาวเมืองปลูกด้วยใจจริงมาแก้', 'You always tell the truth — I can trust you… The fog thickens because our lord is cursed. Only fruit grown with an honest heart can lift it.']},
    {k:'item', t:'m_wanderdurian', n:5, say:['ทุเรียนเดินได้ขโมยผลไม้ของชาวเมืองไป เอาคืนมา 5 ชิ้น', 'The wandering durians stole our fruit. Bring back 5.'],
      done:['หมอกจางลงแล้ว! ชาวเมืองจุดประทีปขอบคุณ เป็นประทีปดวงที่เจ็ด', 'The fog is lifting! The townsfolk light a lamp in thanks — the seventh lamp.']},
    {k:'elite', t:'woodsentinel', name:['ทหารไม้ผู้เฝ้าหมอก', 'The Wooden Sentinel of the Fog'], say:['ทหารไม้ของเจ้าเมืองยังถูกคำสาปบังคับ มันจะปิดเมืองตลอดกาล!', 'Our lord\'s wooden sentinel is still bound by the curse — it will seal the town forever!'],
      done:['เมืองลับแลเปิดแล้ว ชุดชาวลับแลนี้ ใส่แล้วอย่าลืมพูดความจริงเสมอนะ', 'Laplae is open again. Wear this Laplae dress — and never forget to tell the truth.']}
  ]},
  54:{npc:msNN('ms_witch', 'มดน้อยกลับใจ', 'Mot Noi', 'แม่มดน้อยผู้แก้คำสาป', 'Reformed little witch', 'f', 15, 'hairViolet', 'irisVi', {armor:'s_void', head:'hc_witch', mask:'ms_k_witch'}),
    title:['กระจกคำสาป', 'The Cursed Mirrors'], cos:'ms_k_witch',
    kh:['หอคอยนี้น่ากลัวจัง… แต่ทำไมแม่มดคนนี้ดูใจดีล่ะ', 'This tower is frightening… so why does this witch look so kind?'], steps:[
    {k:'kill', t:'hexspire_mask', n:12, say:['ข้าเคยเป็นแม่มดร้าย แต่ข้าอยากแก้คำสาปที่เคยทำไว้ หน้ากากคำสาปลอยอยู่เต็มหอคอย ช่วยทำลาย 12 อันนะ', 'I was a wicked witch once, but now I want to undo my curses. Cursed masks float all over the tower — destroy 12 of them.'],
      done:['ขอบใจ… คำสาปของข้าซ่อนอยู่ในกระจก 3 บาน ถ้าทุบกระจกได้ ทุกคนที่ข้าสาปจะเป็นอิสระ', 'Thank you… my curses hide in three mirrors. Break them and everyone I cursed will be free.']},
    {k:'find', n:3, what:['กระจกคำสาป', 'Cursed mirror'], say:['กระจก 3 บานแขวนอยู่ในหอคอย อย่าจ้องนานนะ', 'The three mirrors hang in the tower. Don\'t stare into them for long.'],
      done:['กระจกแตกหมดแล้ว! แสงที่ถูกขังไว้พุ่งออกมาเป็นประทีปดวงที่แปด', 'Every mirror is broken! The trapped light bursts out as the eighth lamp.']},
    {k:'elite', t:'hexspire_steed', name:['อาชาคำสาป', 'The Hexed Steed'], say:['ม้าคำสาปตัวสุดท้ายที่ข้าสร้าง มันไม่ยอมให้ข้ากลับตัว!', 'The last cursed horse I made won\'t let me change my ways!'],
      done:['ข้าเริ่มต้นใหม่ได้แล้ว ลายดาวแม่มดนี้ ข้าวาดให้คนที่เชื่อว่าทุกคนเปลี่ยนแปลงได้', 'Now I can start again. I paint these witch-star marks for those who believe anyone can change.']}
  ]},
  // (v294) วังบาดาล: a new adventure for the drowned naga palace at the bottom of the sea
  17:{npc:msNN('ms_nakee', 'นาคีน้อย', 'Little Nakee', 'นาคีแห่งวังบาดาล', 'Young naga maiden of the sunken palace', 'f', 22, 'hairTeal', 'irisTl', {armor:'ms_t_naga', head:'f_clip'}),
    title:['วังบาดาลใต้น้ำวน', 'The Palace Beneath the Whirlpool'], cos:'ms_t_naga',
    kh:['กระโดดลงน้ำวนแล้วหายใจใต้น้ำได้! ปลาตัวใหญ่ว่ายอยู่เหนือหัวเต็มเลย', 'We jumped into the whirlpool and we can breathe under the sea! Huge fish are swimming right over our heads.'], steps:[
    {k:'kill', t:'abyssshark', n:12, say:['ตั้งแต่น้ำวนเปิดขึ้นเหนือวัง ไข่มุกที่ส่องสว่างวังบาดาลก็ถูกดูดกระจายไปทั่วก้นทะเล พอวังมืด ฝูงฉลามก็มาวนรอบประตูวัง ช่วยไล่ 12 ตัวนะ', 'Since the whirlpool opened above the palace, the pearls that lit it were sucked away and scattered over the sea floor. With the palace dark, sharks circle its gates. Drive off 12 of them.'],
      done:['ขอบใจ! ไข่มุกประจำวังมีสามเม็ด ตกอยู่ในซากเสาวังที่ล้มอยู่ตามพื้นทราย', 'Thank you! The palace had three great pearls. They fell among the toppled columns lying in the sand.']},
    {k:'find', n:3, what:['ไข่มุกประจำวัง', 'Palace pearl'], say:['ไข่มุกสามเม็ดเรืองแสงอยู่ใต้ทราย ระวังปลาหมึกยักษ์ที่ชอบเอาของแวววาวไปซ่อนนะ', 'The three pearls glow under the sand. Watch out for the giant octopus, it loves to hide shiny things.'],
      done:['ครบสามเม็ดแล้ว! แต่ไข่มุกจะสว่างได้ต้องมีแสงจากห้วงลึกจุดให้ก่อน', 'All three! But a pearl only shines once it is lit with light from the deep.']},
    {k:'item', t:'m_abyssangler', n:5, say:['ปลาตกเบ็ดห้วงลึกห้อยดวงไฟไว้หน้าปาก ครีบของมันยังมีแสงติดอยู่ เก็บมาให้ข้า 5 ชิ้นนะ ข้าจะใช้จุดไข่มุก', 'The abyssal anglerfish dangle lamps before their jaws, and their fins still hold that light. Bring me 5 and I will light the pearls with them.'],
      done:['ไข่มุกสว่างแล้ว! แสงส่องลอดน้ำวนขึ้นไปถึงผิวทะเล เป็นประทีปดวงที่เก้า', 'The pearls are shining! Their light rises through the whirlpool to the surface: the ninth lamp.']},
    {k:'elite', t:'abyssoctopus', name:['หมึกยักษ์ผู้กลืนน้ำวน', 'The Octopus Who Swallowed the Whirlpool'], say:['น้ำวนไม่ได้เกิดเอง! หมึกยักษ์ตัวนี้สูบน้ำจนวังพังเพื่อขโมยไข่มุก มันมาเอาคืนแล้ว!', 'The whirlpool was no accident! This octopus sucked in the sea until the palace broke, to steal the pearls, and now it has come for them again!'],
      done:['วังบาดาลสงบแล้ว ปลาทุกตัวกลับมาว่ายรอบวังเหมือนเดิม ชุดนาคีน้อยนี้ทอจากเกล็ดที่ข้าลอกคราบ ใส่แล้วว่ายน้ำได้เก่งเหมือนปลาเลย', 'The sunken palace is at peace and the fish swim round it again. This naga dress is woven from my shed scales. Wear it and you will swim like a fish.']}
  ]},
  55:{npc:msNN('ms_bualuead', 'บัวเลือด', 'Bua Lueat', 'สาวพายเรือทะเลสาบโลหิต', 'Crimson Lake boatwoman', 'f', 19, 'hairCrimson', 'irisRd', {armor:'s_bloodmoon', head:'h_crownb'}, 'ms_b_redlotus'),
    title:['ประทีปบัวแดง', 'The Red Lotus Lamps'], cos:'ms_b_redlotus',
    kh:['น้ำเป็นสีแดง… แต่ดอกบัวแดงสวยมากเลย', 'The water is red… but the red lotuses are beautiful.'], steps:[
    {k:'kill', t:'crimsonlake_fiend', n:12, say:['ทะเลสาบแดงเพราะน้ำตาของคนที่รอคนรักไม่กลับ ภูตร้ายมากินความเศร้า ช่วยไล่ 12 ตน', 'The lake is red with the tears of those whose loves never came home, and fiends feed on the sorrow. Drive off 12.'],
      done:['ทุกปีคนที่นี่ลอยประทีปบัวแดงไปหาคนที่จากไป แต่ปีนี้ไม่มีใครกล้าออกเรือ', 'Every year people here float red lotus lamps to those they lost, but this year no one dares go out.']},
    {k:'find', n:3, what:['ประทีปบัวแดงที่ยังไม่ได้ลอย', 'Unfloated red lotus lamp'], say:['ประทีปบัวแดง 3 ดวงวางอยู่ริมทะเลสาบ ช่วยลอยแทนพวกเขาหน่อยนะ', 'Three red lotus lamps sit on the shore. Float them for the people here.'],
      done:['ประทีปลอยไปกลางทะเลสาบ น้ำค่อย ๆ ใสขึ้น… เป็นประทีปดวงที่สิบ', 'The lamps drift to the middle of the lake and the water slowly clears… the tenth lamp.']},
    {k:'elite', t:'crimsonlake_elephant', name:['ช้างโลหิตใต้ทะเลสาบ', 'The Blood Elephant of the Lake'], say:['ช้างโลหิตโผล่ขึ้นมาจะกลืนประทีป!', 'The blood elephant has risen to swallow the lamps!'],
      done:['ทะเลสาบสงบแล้ว ปีกบัวแดงนี้ ข้าทำจากกลีบบัวที่ลอยไปหาคนรัก', 'The lake is calm. I made these red lotus wings from petals that floated to the ones we love.']}
  ]},
  56:{npc:msNN('ms_yaknoi', 'ยักษ์น้อยหลงทาง', 'Little Lost Yaksha', 'ยักษ์น้อยใจดี', 'Kind young yaksha', 'm', 11, 'hairCrimson', 'irisRd', {armor:'s_tosakan', head:'ms_h_asurahorn'}),
    title:['ทางออกจากเขาวงกต', 'The Way Out of the Labyrinth'], cos:'ms_h_asurahorn',
    kh:['ยักษ์ตัวเล็กนี่ร้องไห้อยู่… อย่ากลัวนะ เราจะช่วยเอง', 'This little yaksha is crying… don\'t be scared, we\'ll help.'], steps:[
    {k:'kill', t:'asuramaze_warrior', n:12, say:['ฮือ… ข้าไม่อยากเป็นทหารอสูร ข้าอยากออกไปดูโลกข้างนอก แต่ทหารอสูรไล่จับข้า ช่วยด้วย 12 ตน!', 'Waah… I don\'t want to be an asura soldier, I want to see the world outside, but the soldiers are hunting me. Help — 12 of them!'],
      done:['ขอบใจ… เขาวงกตนี้เปลี่ยนทางทุกคืน แต่ปู่ของข้าทิ้งหมุดบอกทางไว้ 3 จุด', 'Thank you… the labyrinth changes every night, but my grandfather left three waymarks.']},
    {k:'find', n:3, what:['หมุดบอกทางในเขาวงกต', 'Labyrinth waymark'], say:['ตามหาหมุด 3 จุด แล้วเราจะรู้ทางออก', 'Find the three marks and we will know the way out.'],
      done:['เจอทางออกแล้ว! ข้าเห็นแสงอาทิตย์เป็นครั้งแรก… น้ำตาข้ากลายเป็นประทีปดวงที่สิบเอ็ด!', 'We found the way out! I see sunlight for the first time… my tears turn into the eleventh lamp!']},
    {k:'elite', t:'asuramaze_steed', name:['อาชาอสูรผู้เฝ้าประตู', 'The Asura Steed of the Gate'], say:['ม้าอสูรเฝ้าประตูทางออก มันไม่ให้ใครออกไปจากเขาวงกต!', 'The asura steed guards the exit and lets no one leave!'],
      done:['ข้าเป็นอิสระแล้ว! เขายักษ์น้อยนี้ ข้าอยากให้เจ้าใส่ เป็นเพื่อนกันตลอดไปนะ', 'I\'m free! I want you to wear these little yaksha horns — friends forever.']}
  ]},
  18:{npc:msNN('ms_phranboon', 'พรานบุญ', 'Phran Boon', 'พรานแห่งป่าหิมพานต์', 'Hunter of Himmapan', 'm', 6, 'hairBrown', 'irisBr', {armor:'ms_t_hunter', head:'h_antler'}),
    title:['บ่วงของพรานบุญ', "Phran Boon's Lasso"], cos:'ms_t_hunter',
    kh:['ป่าหิมพานต์! มีสัตว์ในตำนานเต็มไปหมดเลย', 'Himmapan! It\'s full of creatures from the legends.'], steps:[
    {k:'kill', t:'himogre', n:12, say:['ข้าคือพรานบุญ ผู้เคยคล้องนางมโนห์รา ยักษ์หิมพานต์ไล่ล่าสัตว์ในป่า ช่วยข้าไล่ 12 ตน', 'I am Phran Boon, who once lassoed Princess Manohra. Himmapan ogres are hunting the forest beasts — help me drive off 12.'],
      done:['ข้าทำบ่วงนาคบาศหายไป บ่วงที่ใช้คล้องสัตว์โดยไม่ทำร้าย ถ้ามีมันคืน ข้าจะช่วยสัตว์ที่ติดกับดักได้', 'I lost my naga lasso — the one that catches without harming. With it I could free the beasts caught in traps.']},
    {k:'item', t:'m_sakuna', n:5, say:['ขนนกสกุณาใช้ถักบ่วงใหม่ได้ เก็บมา 5 ชิ้น', 'Sakuna feathers can braid a new lasso. Bring me 5.'],
      done:['บ่วงใหม่เสร็จแล้ว! ข้าปลดสัตว์ออกจากกับดักได้ทุกตัว พวกมันส่งเสียงขอบคุณเป็นประทีปดวงที่สิบสอง', 'The new lasso is done! I freed every beast from the traps, and their thanks became the twelfth lamp.']},
    {k:'elite', t:'thaktho', name:['ทักทอผู้หลงเสียงอสูร', 'The Whisper-maddened Thaktho'], say:['ทักทอได้ยินเสียงอสูรจนคลั่ง ข้าจะคล้องมันไว้ เจ้าช่วยสงบมันที!', 'The thaktho has been driven mad by the whisper. I\'ll lasso it — you calm it!'],
      done:['สัตว์ทั้งป่าปลอดภัยแล้ว ชุดพรานบุญนี้ใส่เดินป่าหิมพานต์ได้ทุกที่', 'Every beast in the forest is safe. Wear this Phran Boon outfit anywhere in Himmapan.']}
  ]},
  57:{npc:msNN('ms_kinnareegarden', 'กินรีชาวสวน', 'Kinnaree Gardener', 'กินรีดูแลสวนลอยฟ้า', 'Kinnaree of the floating gardens', 'f', 14, 'hairRose', 'irisPk', {armor:'s_kinnaree', head:'ms_h_flowercrown'}, 'w_fairy'),
    title:['ประทีปดอกไม้ลอยฟ้า', 'The Floating Flower Lamps'], cos:'ms_h_flowercrown',
    kh:['สวนลอยอยู่บนเมฆ! ข้ากลัวตกจัง', 'A garden floating on the clouds! I\'m scared of falling.'], steps:[
    {k:'kill', t:'skygarden_fiend', n:12, say:['ภูตร้ายกัดกินรากสวนลอยฟ้า สวนกำลังจะร่วงลงมา ช่วยไล่ 12 ตนนะ', 'Fiends are gnawing the roots of the floating gardens and they\'re about to fall. Drive off 12.'],
      done:['สวนลอยได้มั่นคงแล้ว… ดอกไม้ประทีป 3 ดอกที่เคยส่องทางให้สวนลอยไปผิดที่', 'The gardens float steady again… three lamp-flowers that guided them have drifted away.']},
    {k:'find', n:3, what:['ดอกไม้ประทีปที่ลอยหลง', 'Lost lamp-flower'], say:['ช่วยพาดอกไม้ประทีปทั้ง 3 ดอกกลับมาที่สวนนะ', 'Bring all three lamp-flowers back to the garden.'],
      done:['ดอกไม้ประทีปบานพร้อมกัน เป็นประทีปดวงที่สิบสาม!', 'The lamp-flowers bloom together — the thirteenth lamp!']},
    {k:'elite', t:'skygarden_elephant', name:['ช้างเมฆผู้เหยียบสวน', 'The Cloud Elephant'], say:['ช้างเมฆหลงทางมาเหยียบสวน ถ้ามันเหยียบอีก สวนจะแตก!', 'A cloud elephant has wandered onto the gardens — one more step and they\'ll break!'],
      done:['สวนปลอดภัยแล้ว มาลัยสวนลอยฟ้านี้ ข้าร้อยจากดอกไม้ที่บานกลางเมฆ', 'The gardens are safe. I strung this floating-garden wreath from flowers that bloom among the clouds.']}
  ]},
  14:{npc:msNN('ms_manohra', 'นางมโนห์รา', 'Princess Manohra', 'กินรีเจ้าหญิงแห่งเขาไกรลาส', 'Kinnaree princess', 'f', 4, 'hairBlack', 'irisGd', {armor:'ms_t_manohra', head:'h_tiara'}, 'w_swan'),
    title:['ระบำของมโนห์รา', "Manohra's Dance"], cos:'ms_t_manohra',
    kh:['นางมโนห์ราตัวจริง! ข้าเคยดูละครเรื่องนี้ตอนเด็ก', 'The real Manohra! I watched this story as a play when I was little.'], steps:[
    {k:'kill', t:'karawek', n:12, say:['นกการเวกส่งเสียงไพเราะ แต่วันนี้มันถูกเสียงอสูรครอบงำ ร้องจนดอกไม้เหี่ยว ช่วยสงบมัน 12 ตัว', 'The karawek birds sing so sweetly, but today the whisper has them and their song wilts the flowers. Calm 12 of them.'],
      done:['ขอบใจ… ข้าจะร่ายระบำส่องแสงให้ป่าหิมพานต์ แต่ต้องใช้ขนกิเลนประดับผ้าคล้อง', 'Thank you… I will dance a dance of light for Himmapan, but I need kilen hair to trim my sash.']},
    {k:'item', t:'m_kilen', n:5, say:['เก็บขนกิเลนมา 5 ชิ้นนะ ข้าจะประดับผ้าคล้องสำหรับระบำ', 'Bring me 5 kilen hairs to trim my dancing sash.'],
      done:['ข้าร่ายระบำแล้ว… แสงทองแผ่ไปทั้งป่า เป็นประทีปดวงที่สิบสี่!', 'I have danced… golden light spreads through the forest — the fourteenth lamp!']},
    {k:'elite', t:'kotchasi', name:['คชสีห์ผู้ขวางระบำ', 'The Kotchasi Who Stopped the Dance'], say:['คชสีห์ถูกเสียงอสูรหลอกว่าระบำของข้าจะปลุกภัยร้าย มันมาขวางแล้ว!', 'The kotchasi was told my dance would wake disaster — it has come to stop me!'],
      done:['ระบำของข้าจบลงอย่างงดงาม ชุดมโนห์รานี้ ข้ามอบให้เพื่อนผู้กล้าหาญ', 'My dance ended beautifully. I give this Manohra gown to my brave friend.']}
  ]},
  58:{npc:msNN('ms_chick', 'ลูกเจี๊ยบดาว', 'Star Chick', 'ลูกไก่ดาวตัวที่เจ็ด', 'The seventh star chick', 'f', 6, 'hairGold', 'irisGd', {armor:'s_star', head:'f_bowp'}, 'ms_b_chicks'),
    title:['ดาวลูกไก่ตัวที่เจ็ด', 'The Seventh Star Chick'], cos:'ms_b_chicks',
    kh:['ทางช้างเผือก… เดินอยู่บนดวงดาวจริง ๆ!', 'The Milky Way… we\'re really walking on stars!'], steps:[
    {k:'kill', t:'milkyway_wisp', n:12, say:['จิ๊บ ๆ! ข้าคือลูกไก่ตัวที่เจ็ดของดาวลูกไก่ ข้าพลัดหลงจากแม่ ภูตดาวไล่จิกข้า ช่วยไล่ 12 ตนนะ', 'Cheep! I\'m the seventh chick of the Pleiades and I lost my mother. Star wisps keep pecking me — drive off 12!'],
      done:['ขอบใจ จิ๊บ! พี่ ๆ ของข้า 3 ตัวก็หลงอยู่บนทางช้างเผือกเหมือนกัน', 'Thank you, cheep! Three of my brothers and sisters are lost on the Milky Way too.']},
    {k:'find', n:3, what:['ลูกไก่ดาวที่พลัดหลง', 'Lost star chick'], say:['ช่วยตามหาพี่ ๆ ของข้า 3 ตัวนะ ฟังเสียงจิ๊บ ๆ ดี ๆ', 'Find my three siblings — listen for the cheeping.'],
      done:['ครบแล้ว! แม่ไก่ดาวส่องแสงรับพวกเรากลับ… เป็นประทีปดวงที่สิบห้า!', 'All together! Mother Hen shines to welcome us home… the fifteenth lamp!']},
    {k:'elite', t:'milkyway_spire', name:['ยอดผลึกดาวที่ขวางทาง', 'The Star-crystal Spire'], say:['ยอดผลึกดาวงอกขึ้นมาขวางทางกลับบ้านของพวกเรา!', 'A star-crystal spire has grown across our way home!'],
      done:['พวกเราได้กลับบ้านแล้ว จิ๊บ! ลูกไก่ดาวพวกนี้จะบินวนรอบเจ้าเป็นเพื่อนนะ', 'We\'re home, cheep! These star chicks will fly around you as your friends.']}
  ]},
  20:{npc:msNN('ms_devanoi', 'เทวดาน้อยเฝ้าเขา', 'Little Mountain Deva', 'เทวดาผู้เฝ้าเขาพระสุเมรุ', 'Deva of Mount Meru', 'm', 12, 'hairGold', 'irisGd', {armor:'s_seraph', head:'h_halo', mask:'ms_k_deva'}),
    title:['ดาวตกบนเขาพระสุเมรุ', 'Fallen Stars on Mount Meru'], cos:'ms_k_deva',
    kh:['เขาพระสุเมรุ ศูนย์กลางจักรวาล… ข้าตัวเล็กนิดเดียวเลย', 'Mount Meru, the centre of the universe… I feel so tiny.'], steps:[
    {k:'kill', t:'asura', n:12, say:['อสูรบุกขึ้นเขาพระสุเมรุ ข้าเฝ้าทางอยู่คนเดียว ช่วยขับไล่ 12 ตนเถิด', 'Asuras are storming Mount Meru and I guard the way alone. Help me drive back 12.'],
      done:['ดาวหลายดวงร่วงจากฟ้าตอนอสูรบุก ถ้าส่งพวกมันกลับขึ้นฟ้าไม่ได้ ฟ้าจะมืดลง', 'Many stars fell from the sky when the asuras attacked. If we can\'t send them back, the sky will darken.']},
    {k:'item', t:'m_fallenstar', n:5, say:['เก็บแสงของดาวตก 5 ดวงมา ข้าจะส่งกลับขึ้นฟ้า', 'Gather the light of 5 fallen stars and I will send them home.'],
      done:['ดาวกลับขึ้นฟ้าแล้ว! หนึ่งดวงไม่ยอมขึ้น มันขอเป็นประทีปดวงที่สิบหกให้ประทีป', 'The stars have gone home! One wouldn\'t leave — it asked to be Prathip\'s sixteenth lamp.']},
    {k:'elite', t:'celestialsingha', name:['สิงห์สวรรค์ผู้หลงผิด', 'The Misled Celestial Singha'], say:['สิงห์สวรรค์ถูกอสูรหลอกว่าพวกเราเป็นศัตรู!', 'The celestial singha was tricked into thinking we are enemies!'],
      done:['ทางขึ้นสวรรค์ปลอดภัยแล้ว ลายทองเทวดานี้ ข้าวาดให้มนุษย์ที่ใจงามเท่าเทวดา', 'The way to heaven is safe. I paint these golden deva marks for mortals with hearts as fair as any deva\'s.']}
  ]},
  59:{npc:msNN('ms_nangkaew', 'นางแก้ว', 'Nang Kaew', 'ธิดาแห่งวังแก้วมณี', 'Lady of the Crystal Palace', 'f', 22, 'hairSky', 'irisSv', {armor:'ms_t_crystal', head:'h_haloc'}, 'w_crystal'),
    title:['ประทีปแก้วในวังมณี', 'The Crystal Lamps of the Palace'], cos:'ms_t_crystal',
    kh:['วังทั้งหลังทำจากแก้ว! ข้ามองเห็นตัวเองเป็นร้อยคนเลย', 'The whole palace is made of crystal! I can see a hundred of myself.'], steps:[
    {k:'kill', t:'gempalace_fiend', n:12, say:['ภูตร้ายแอบเข้าวังแก้ว ทำให้แก้วขุ่นมัว ช่วยไล่ 12 ตนนะเพคะ', 'Fiends have crept into the crystal palace and clouded the glass. Drive off 12, please.'],
      done:['แก้วใสขึ้นแล้ว… ในวังมีประทีปแก้ว 3 ดวงที่ส่องแสงไปถึงประตูสวรรค์ แต่ดับไปหมดแล้ว', 'The crystal is clear again… three crystal lamps in the palace once shone all the way to heaven\'s gate, but they have all gone out.']},
    {k:'find', n:3, what:['ประทีปแก้วที่ดับ', 'Darkened crystal lamp'], say:['ประทีปแก้ว 3 ดวงตั้งอยู่ในห้องต่าง ๆ ให้ประทีปจุดไฟให้นะ', 'The three crystal lamps stand in different halls. Let Prathip light them.'],
      done:['แสงสะท้อนกันในวังแก้วเป็นพันดวง… เป็นประทีปดวงที่สิบเจ็ด', 'The light reflects through the palace a thousandfold… the seventeenth lamp.']},
    {k:'elite', t:'gempalace_serpent', name:['งูแก้วผู้กลืนแสง', 'The Light-swallowing Crystal Serpent'], say:['งูแก้วกลืนแสงประทีปแล้ว! ต้องทำให้มันคายออกมา!', 'The crystal serpent has swallowed the lamplight! Make it spit it out!'],
      done:['วังแก้วสว่างไสวแล้ว ชุดนางแก้วนี้ ทอจากแสงที่สะท้อนในวัง', 'The crystal palace is radiant again. This crystal gown is woven from light reflected in its halls.']}
  ]},
  // (v297) สวรรค์: a new adventure on the island of heaven at the top of the world tree
  30:{npc:msNN('ms_gatedeva', 'ทวารเทวี', 'The Gate Devi', 'เทวีผู้เฝ้าประตูสวรรค์', 'Devi of the heavenly gate', 'f', 4, 'hairWhite', 'irisGd', {armor:'s_seraph', head:'ms_h_gate'}, 'w_angel'),
    title:['ทางแสงบนต้นไม้โลก', 'The Path of Light on the World Tree'], cos:'ms_h_gate',
    kh:['เราปีนต้นไม้โลกขึ้นมาถึงเกาะลอยฟ้าแล้ว! ข้างล่างเป็นทะเลเมฆทั้งนั้นเลย', 'We climbed the world tree all the way to the floating island! There is nothing but a sea of clouds below.'], steps:[
    {k:'kill', t:'devachakra', n:12, say:['ยินดีต้อนรับสู่ดาวดึงส์ ผู้เดินทางขึ้นต้นไม้โลก! ราชาอสูรปลุกจักรเทพให้หมุนคลั่ง มันตัดกิ่งต้นไม้โลกจนทางแสงขาด ช่วยหยุด 12 วงนะ', 'Welcome to Tavatimsa, you who climbed the world tree! The Asura King woke the divine chakras into a frenzy, and they cut the branches of the world tree until the path of light broke. Stop 12 of them.'],
      done:['ขอบใจ! ใบทองของต้นไม้โลก 3 ใบร่วงลงบนเกาะ ถ้าเก็บมาได้ ข้าจะต่อทางแสงขึ้นมาใหม่ให้คนข้างล่างปีนตามมาได้', 'Thank you! Three golden leaves of the world tree fell onto the island. Bring them and I will join the path of light again, so those below can climb up after you.']},
    {k:'find', n:3, what:['ใบทองของต้นไม้โลก', 'Golden leaf of the world tree'], say:['ใบทองเรืองแสงอยู่บนเกาะ ระวังอย่าเดินตกช่องเมฆนะ ข้างล่างลึกจนมองไม่เห็นพื้นโลก', 'The golden leaves glow somewhere on the island. Mind the gaps in the clouds: they drop so far you cannot see the earth.'],
      done:['ครบสามใบ! แต่ทางแสงจะสว่างได้ต้องมีแสงจากดอกบัวเทวาเติมให้ก่อน', 'All three! But the path will only shine once the light of the deva lotus is poured into it.']},
    {k:'item', t:'m_heavenlotus', n:5, say:['บัวเทวามีดวงแสงอยู่กลางดอก เก็บประกายของมันมา 5 ชิ้นนะ ข้าจะเติมลงในใบทอง', 'The deva lotus holds a spirit of light in its heart. Bring me 5 shards of its glow and I will pour them into the golden leaves.'],
      done:['ทางแสงพันรอบต้นไม้โลกลงไปถึงพื้นดินแล้ว แสงจากประทีปทุกดวงไหลขึ้นมาตาม เป็นประทีปดวงที่สิบแปด', 'The path of light winds round the world tree all the way down to the earth, and the light of every lamp flows up along it: the eighteenth lamp.']},
    {k:'elite', t:'skywhale', name:['วาฬเมฆผู้ถูกเสียงอสูรครอบงำ', 'The Whisper-bound Cloud Whale'], say:['วาฬเมฆที่เคยร้องเพลงกล่อมเกาะสวรรค์ถูกเสียงอสูรครอบงำ มันจะพุ่งชนต้นไม้โลก! ช่วยปลุกมันที', 'The cloud whale that used to sing the island to sleep is bound by the Asura\'s whisper. It means to ram the world tree! Wake it.'],
      done:['วาฬเมฆร้องเพลงอีกครั้งแล้ว มงกุฎทวารสวรรค์นี้ ข้ามอบให้ผู้ปีนต้นไม้โลกขึ้นมาถึงสวรรค์', 'The cloud whale sings again. I give this heavenly-gate crown to the one who climbed the world tree to heaven.']}
  ]},
  60:{npc:MS_PRATHIP, title:['ประทีปดวงที่พัน', 'The Thousandth Lamp'], cos:'ms_t_sun', finale:true, steps:[
    {k:'kill', t:'suncourt_fiend', n:12, say:['บัลลังก์สุริยะ… ความมืดสุดท้ายของอสูรมาขวางอยู่ที่นี่ ช่วยข้าฝ่าไป 12 ตน!', 'The Throne of the Sun… the Asura\'s last darkness waits here. Help me break through twelve of them!'],
      done:['เห็นไหม… ประทีปทุกดวงที่เราจุดเรียงเป็นทางแสงยาวจากวัดร้างมาถึงที่นี่ อสูรข้ามทางนี้ไม่ได้แล้ว', 'Look… every lamp we lit lines up into a road of light from the ruined temple all the way here. The Asura can no longer cross it.']},
    {k:'find', n:3, what:['กระจกสุริยะที่หันผิดทาง', 'Misturned sun mirror'], say:['กระจกสุริยะ 3 บานต้องหันรับแสงประทีป แล้วประทีปดวงสุดท้ายจะติด', 'Three sun mirrors must be turned to catch the lamplight. Then the last lamp will light.'],
      done:['กระจกรับแสงครบแล้ว… แต่ขุนพลแห่งราชสำนักสุริยะที่ถูกเสียงอสูรครอบงำมาขวาง!', 'The mirrors catch the light… but a general of the Sun Court, bound by the whisper, stands in the way!']},
    {k:'elite', t:'suncourt_warrior', hp:2.5, name:['ขุนพลสุริยะผู้หลงทาง', 'The Lost General of the Sun'], say:['ขุนพลคนนี้เคยปกป้องสวรรค์ ช่วยเขาให้ตื่นจากความมืดที!', 'This general once guarded heaven. Help him wake from the darkness!'],
      done:['ประทีปดวงที่พันสว่างขึ้น… ท้องฟ้าเหนือบัลลังก์มีดาวดวงใหม่ส่องแสงอ่อนโยน — «นั่นแม่ของข้า…» ประทีปน้ำตาไหลแต่ยิ้มกว้าง แม่ของนางเป็นนางรำในวัด ที่กลายเป็นดาวคอยส่องทางให้ลูก ชุดผู้จุดประทีปพันดวงนี้ ข้ากับแม่อยากให้เจ้าใส่ ขอบคุณที่เดินทางมาด้วยกันนะ!', "The thousandth lamp blazes… and above the throne a new star shines softly. — «That's my mother…» Prathip weeps, smiling. Her mother, a temple dancer, became a star to light her daughter's way. Mother and I want you to wear this Lamplighter's raiment. Thank you for walking all this way with me!"]}
  ]}
});
