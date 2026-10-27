/* VAYRATHEN — js/sys/bosslines.js — every region boss speaks for itself
   Before, every boss used the Golden Jelly King's lines: at half HP each one "split into 8 jellies" (and really spawned
   jellies), and the kill log always said "ล้มราชาเจลลี่ทองคำ". Now only the Jelly King splits; every other boss shouts
   its own line at half HP and has its own last words. [half-HP line, last words] in Thai and English. */
'use strict';

const BOSS_LINES = {
  boss:[['ราชาเจลลี่แตกตัวเป็นเจลลี่ 8 ตัว!', 'The Jelly King splits into 8 jellies!'], ['ดึ๋ง… ดึ๋ง… ราชาเจลลี่ละลายหายไป', 'Boing… boing… the Jelly King melts away']],
  whitemonkeyking:[['พญาลิงเผือกกระโดดโลดเต้น: "เจ้ามนุษย์ จับข้าให้ได้สิ!"', 'The White Monkey King leaps about: "Catch me if you can, human!"'], ['"ข้าแค่… ซนเกินไปหน่อย…"', '"I was just… a little too playful…"']],
  lotusturtle:[['พญาเต่าบัวหลวงหดหัวแล้วพุ่งออกมาใหม่: "ช้าแต่ไม่แพ้!"', 'The Lotus Turtle Lord pulls in, then bursts out: "Slow, but never beaten!"'], ['"บัวโรยแล้ว… หนองนี้เป็นของเจ้า"', '"The lotus wilts… this pond is yours"']],
  aikhiam:[['ไอ้เคี่ยมฟาดหางจนน้ำแตกกระจาย: "แม่น้ำนี้ไม่มีใครข้ามได้!"', 'Ai Khiam lashes its tail: "No one crosses my river!"'], ['ไอ้เคี่ยมจมหายลงใต้สายน้ำ…', 'Ai Khiam sinks beneath the current…']],
  marketmatron:[['นางพรายแม่ค้าหัวเราะคิกคัก: "ของดีราคาถูก… แลกด้วยชีวิตเจ้า!"', 'The Wraith Matron cackles: "Bargain prices… paid with your life!"'], ['"ตลาด… วายแล้ว…"', '"The market… is closed…"']],
  dvarapala:[['ทวารบาลยักษ์ศิลาสะเทือนทั้งวัด: "ผู้ใดล่วงล้ำเขตศักดิ์สิทธิ์!"', 'The Stone Dvarapala shakes the temple: "Who trespasses on holy ground!"'], ['ศิลาร้าว… ทวารบาลหลับใหลอีกครั้ง', 'The stone cracks… the guardian sleeps again']],
  cavematriarch:[['พญาแมงมุมถ้ำมืดพ่นใย: "ลูก ๆ ของข้า ออกมา!"', 'The Cave Matriarch spits silk: "My children, come out!"'], ['ใยขาดผึง… ถ้ำมืดเงียบงัน', 'The web snaps… the dark cave falls silent']],
  saming:[['เสือสมิงคำรามกึกก้องดอย: "เนื้อมนุษย์… หอมนัก!"', 'Saming roars across the highlands: "Human flesh… how sweet!"'], ['"มนตร์สมิง… เสื่อมแล้ว…"', '"The werething spell… is broken…"']],
  elderpop:[['ผีปอบเฒ่าแสยะยิ้ม: "ตับเจ้า… ข้าขอนะ"', 'Elder Pop grins: "Your liver… I\'ll take it"'], ['ผีปอบเฒ่าสลายเป็นควันดำ', 'Elder Pop dissolves into black smoke']],
  khankhak:[['พญาคันคากร้องอ๊บก้องฟ้า: "ฝนจงตก ฟ้าจงร้อง!"', 'Phaya Khankhak croaks to the sky: "Let rain fall, let thunder roar!"'], ['"ข้าแพ้… แต่ฝนยังต้องตก"', '"I fall… but the rain must still come"']],
  templecolossus:[['ราชสีห์ศิลาเทวาลัยลุกขึ้นจากแท่น: "ปราสาทนี้ต้องไม่ถูกแตะต้อง!"', 'The Temple Lion rises from its plinth: "This sanctuary shall not be touched!"'], ['ราชสีห์ศิลาแตกเป็นเสี่ยง ๆ', 'The stone lion breaks to pieces']],
  andamancrab:[['ปูยักษ์อันดามันหนีบก้ามดังเปรี๊ยะ: "เข้ามาใกล้ ๆ อีกนิดสิ!"', 'The Andaman Crab snaps its claws: "Come a little closer!"'], ['ปูยักษ์คลานกลับลงทะเล…', 'The giant crab crawls back into the sea…']],
  seaogress:[['นางผีเสื้อสมุทรกรีดร้อง: "ไม่มีใครหนีจากเกาะข้าได้!"', 'The Sea Ogress shrieks: "No one escapes my island!"'], ['"พระอภัย… ข้ายังรอ…"', '"My prince… I am still waiting…"']],
  phantomgeneral:[['แม่ทัพผีอโยธยาชูดาบ: "ทหาร! ตั้งทัพ!"', 'The Phantom General raises his blade: "Soldiers! To arms!"'], ['"กรุง… ยังไม่แตก…"', '"The capital… has not fallen…"']],
  lordkotchasi:[['พญาคชสีห์ชูงวงคำราม: "พลังแห่งช้างและสิงห์!"', 'Lord Kotchasi trumpets and roars: "The might of elephant and lion!"'], ['พญาคชสีห์ก้มหัวยอมรับผู้ชนะ', 'Lord Kotchasi bows to the victor']],
  waterelephantking:[['วารีกุญชรราชาพ่นน้ำเป็นสาย: "สระอโนดาตไม่ต้อนรับเจ้า!"', 'The Water Elephant King sprays a torrent: "Anodat does not welcome you!"'], ['วารีกุญชรราชาจมหายลงสระศักดิ์สิทธิ์', 'The Water Elephant King sinks into the holy lake']],
  laplaelord:[['เจ้าเมืองลับแลยิ้มเย็น: "เข้ามาแล้ว… ก็อย่าหวังว่าจะได้กลับ"', 'The Lord of Laplae smiles coldly: "Once in… never out"'], ['"เมืองลับแล… เปิดประตูให้เจ้าแล้ว"', '"Laplae… opens its gate to you"']],
  nagaking:[['พญานาคราชแผ่พังพาน: "บาดาลจะกลืนเจ้า!"', 'The Naga King spreads his hood: "The underworld will swallow you!"'], ['พญานาคราชคืนร่างสู่บาดาล', 'The Naga King returns to the depths']],
  tenfacedogre:[['ยักษ์ทศพักตร์หัวเราะสิบเสียง: "สิบหน้า สิบความพิโรธ!"', 'The Ten-faced Ogre laughs with ten voices: "Ten faces, ten furies!"'], ['"สิบหน้า… ก็ยังแพ้…"', '"Ten faces… and still defeated…"']],
  garudaking:[['พญาครุฑกางปีกบดบังฟ้า: "ดูซิว่าเจ้าบินได้หรือไม่!"', 'The Garuda King spreads his wings across the sky: "Let\'s see if you can fly!"'], ['พญาครุฑบินกลับสู่ยอดไกรลาส', 'The Garuda King flies back to Kailash']],
  vessavana:[['ท้าวเวสสุวรรณยกกระบองทอง: "ข้าคือเจ้าแห่งยักษ์ทั้งปวง!"', 'Vessavana lifts his golden club: "I am lord of all giants!"'], ['"เจ้า… คู่ควรขึ้นเขาพระสุเมรุ"', '"You… are worthy of Meru"']],
  scorpionking:[['ราชาแมงป่องทรายชูหางพิษ: "ทรายร้อนจะเป็นหลุมศพเจ้า!"', 'The Scorpion King raises his stinger: "The hot sand will be your grave!"'], ['ราชาแมงป่องมุดหายลงใต้เนินทราย', 'The Scorpion King burrows away under the dunes']],
  redcliffgiant:[['ยักษ์ผาแดงทุบหน้าผาจนหินร่วง: "ภูเขานี้คือร่างข้า!"', 'The Red Cliff Giant pounds the cliff: "This mountain is my body!"'], ['ยักษ์ผาแดงล้มลงเป็นกองหิน', 'The Red Cliff Giant crumbles into rubble']],
  firenaga:[['พญานาคเพลิงพ่นไฟลุกท่วม: "ลาวาคือเลือดของข้า!"', 'The Fire Naga breathes a blaze: "Lava is my blood!"'], ['เปลวไฟของพญานาคเพลิงมอดดับลง', 'The Fire Naga\'s flames die down']],
  ashwolfking:[['ราชาหมาป่าเถ้าหอนเรียกฝูง: "ฝูงข้า! ล่ามัน!"', 'The Ash Wolf King howls: "My pack! Hunt it down!"'], ['เสียงหอนสุดท้ายจางหายในเถ้าถ่าน', 'The last howl fades into the ashes']],
  agnilord:[['จอมเวทอัคนีลอยเหนือปล่องไฟ: "เผาให้มอดไหม้!"', 'Agni rises over the crater: "Burn to cinders!"'], ['"ไฟ… ไม่มีวันดับ…"', '"The fire… never dies…"']],
  iceturtlelord:[['พญาเต่าน้ำแข็งกระทืบจนน้ำแข็งแตก: "เย็นยะเยือก… เหมือนหัวใจข้า"', 'The Ice Turtle Lord stomps the ice: "Cold… like my heart"'], ['พญาเต่าน้ำแข็งหลับไปใต้ทะเลสาบ', 'The Ice Turtle Lord sleeps beneath the lake']],
  frostqueen:[['ราชินีแมงมุมน้ำแข็งถักใยเยือกแข็ง: "ติดอยู่ในใยข้าชั่วนิรันดร์!"', 'The Frost Spider Queen weaves frozen silk: "Caught in my web forever!"'], ['ใยน้ำแข็งแตกละเอียดเป็นเกล็ดหิมะ', 'The ice web shatters into snowflakes']],
  mammothking:[['พญาช้างแมมมอธชูงาคู่: "ธารน้ำแข็งพันปีจะทับเจ้า!"', 'The Mammoth King raises his tusks: "A thousand years of ice will crush you!"'], ['พญาช้างแมมมอธทรุดลงบนหิมะ', 'The Mammoth King sinks into the snow']],
  snowking:[['พญาหิมะเรียกพายุ: "ฤดูหนาวไม่มีวันสิ้นสุด!"', 'The Snow King calls a storm: "Winter never ends!"'], ['"ฤดูใบไม้ผลิ… มาถึงแล้วสินะ"', '"So… spring has come"']],
  asuraking:[['ราชาอสูรไวราแผดเสียง: "สวรรค์จะต้องเป็นของข้า!"', 'Vaira roars: "Heaven shall be mine!"'], ['"ประตูสวรรค์… ไม่ใช่ของข้า…"', '"The gate of heaven… was never mine…"']]
};
function bossLine(type, i){ const r = BOSS_LINES[type]; return r ? r[i] : null; }
