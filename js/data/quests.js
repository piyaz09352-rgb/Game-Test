/* VAYRATHEN — js/data/quests.js
   Story and quests.
   MAIN STORY "ผนึกวายรา" (The Seal of Vayra): long ago the realm bound the Asura King beneath Mount Meru with a
   seal of stone shards, one kept in each region by its guardian. The seal is cracking: the Asura's whisper has
   turned every guardian into a raging boss. Chapter by chapter the hero walks the four roads out of the capital —
   east, south, west, then north to the gate of heaven — hunts the beasts the
   curse has stirred, gathers what the shrine keeper needs for the rite, defeats the region's boss and takes back
   its shard. Chapter 0 is given by Master Vayra in the village; every other chapter by the shrine keeper of that map.
   BOUNTIES: each shrine keeper (and Master Vayra) also posts a repeatable hunt for one monster of that map. */
'use strict';

const STORY = [
  ['ศิลาผนึกใต้ทุ่งสุวรรณินเริ่มร้าว เจลลี่ทั้งทุ่งคลั่งเพราะเสียงกระซิบของอสูร ไปปราบมันแล้วนำศิลาชิ้นแรกกลับมา', 'The shard beneath the Suwannin fields is cracking and the jellies rage at the Asura\'s whisper. Calm the fields and bring the first shard home.'],
  ['ลมในป่าไผ่พัดเสียงร้องของพญาลิงเผือก ผู้เฝ้าศิลาชิ้นที่สองถูกคำสาปครอบงำ', 'The bamboo wind carries the White Monkey King\'s howl. The keeper of the second shard has fallen to the curse.'],
  ['บัวแดงเหี่ยวเฉาทั้งหนอง พญาเต่าบัวหลวงหลับใหลและกลายเป็นศัตรู', 'The red lotus wilt across the marsh. The Lotus Turtle Lord slumbers no more and has turned on us.'],
  ['ไอ้เคี่ยมตื่นจากใต้ท้องน้ำเจ้าพระยา ชาวเรือไม่กล้าล่องผ่านอีกต่อไป', 'Ai Khiam has risen from the river bed. No boat dares the Chao Phraya now.'],
  ['ตลาดน้ำร้างตั้งแต่นางพรายแม่ค้าคืนชีพ ตะเกียงเรือลุกไหม้เองทุกคืน', 'The floating market emptied when the Wraith Matron returned. Its boat lamps burn by themselves each night.'],
  ['ทวารบาลศิลาที่เคยเฝ้าประตูวัดลุกขึ้นทำลายทุกสิ่งที่เข้าใกล้', 'The stone Dvarapala who once guarded the temple gate now crushes all who come near.'],
  ['ในถ้ำมืดเชียงดาว พญาแมงมุมทอใยรอบศิลาชิ้นที่หก', 'Deep in Chiang Dao\'s dark, the Spider Matriarch has woven her web around the sixth shard.'],
  ['เสือสมิงกลับมาล่าคนบนดอยหมอก เสียงเรียกชื่อจากในหมอกคือมันเอง', 'The Saming hunts the misty peaks again. The voice calling your name from the fog is its own.'],
  ['ผีปอบเฒ่าสูบพลังจากป่าช้า ศิลาชิ้นที่แปดถูกฝังอยู่ใต้โกศของมัน', 'The Elder Pop drinks the graveyard\'s strength. The eighth shard lies beneath its urn.'],
  ['ฝนไม่ตกที่ทุ่งกุลามาหลายปี พญาคันคากกักฝนไว้ทั้งหมด', 'No rain has fallen on the Kula plains for years. Phaya Khankhak holds every cloud.'],
  ['ราชสีห์ศิลาแห่งเทวาลัยขอมขยับตัวเป็นครั้งแรกในพันปี', 'The stone lion of the Khmer sanctuary has moved for the first time in a thousand years.'],
  ['ปูยักษ์อันดามันลากเรือประมงลงทะเลทีละลำ', 'The Andaman Colossus Crab drags fishing boats into the sea one by one.'],
  ['นางผีเสื้อสมุทรรู้ว่ามีคนตามหาศิลา นางรออยู่บนเกาะของนาง', 'The Sea Ogress knows someone seeks the shards. She waits on her island.'],
  ['แม่ทัพผีแห่งอโยธยายังรบสงครามที่จบไปแล้วหลายร้อยปี', 'The Phantom General of Ayodhya still fights a war that ended centuries ago.'],
  ['เขตหิมพานต์เปิดออก พญาคชสีห์ขวางทางเข้าป่าในตำนาน', 'The border of Himmapan has opened. Lord Kotchasi bars the way into the legend.'],
  ['สระอโนดาตขุ่นมัว วารีกุญชรราชาไม่ยอมให้ใครแตะน้ำศักดิ์สิทธิ์', 'Lake Anodat has clouded. The King of Water Elephants lets no one touch the sacred water.'],
  ['เมืองลับแลซ่อนตัวในหมอกเพื่อปกป้องเจ้าเมืองที่ถูกสาป', 'Laplae hides in its mist to shield a lord who is already cursed.'],
  ['พญานาคราชกริ้วโกรธ บาดาลสั่นสะเทือนจนถึงผิวดิน', 'The Naga King rages and the underworld shakes the ground above.'],
  ['ยักษ์ทศพักตร์ตั้งตนเป็นใหญ่ในหิมพานต์ชั้นใน รวบรวมอสูรไว้รอวันผนึกแตก', 'The Ten-faced Ogre King rules inner Himmapan, gathering demons for the day the seal breaks.'],
  ['พญาครุฑถูกเสียงอสูรหลอกว่าผู้ถือศิลาคือศัตรู', 'The Garuda King has been told by the Asura that the shard-bearer is the enemy.'],
  ['ท้าวเวสสุวรรณ ผู้คุมยักษ์ทั้งปวง ถูกคำสาปของราชาอสูรผูกไว้ที่ประตูสวรรค์ ปลดปล่อยท่านแล้วผนึกจะสมบูรณ์', 'Vessavana, lord of all giants, is bound by the Asura King\'s curse at heaven\'s gate. Free him and the seal is whole.']
,
  ['ราชาแมงป่องทรายขุดศิลาชิ้นนี้ลงไปใต้เนินทราย แดดทะเลทรายร้อนขึ้นทุกวันที่มันครอบครอง', 'The Sand Scorpion King has buried this shard beneath the dunes. The desert sun burns hotter every day he holds it.'],
  ['ยักษ์ผาแดงตั้งตนเป็นเจ้าแห่งหุบเขา โจรผีทั้งหลายรับใช้มัน', 'The Red Cliff Giant calls himself lord of the canyon, and the ghost bandits serve him.'],
  ['พญานาคเพลิงตื่นขึ้นในทุ่งลาวา ลมหายใจของมันหลอมหินให้ไหลเป็นสาย', 'The Fire Naga Lord has woken in the lava fields. Its breath melts the rock into rivers.'],
  ['ราชาหมาป่าเถ้าพาฝูงล่าอยู่ในป่าที่ไหม้ ทุกตอไม้ยังคุกรุ่น', 'The Ash Wolf King runs his pack through the burned forest. Every stump still smoulders.'],
  ['จอมเวทอัคนีผู้เฝ้าปล่องภูเขาไฟถูกเสียงอสูรปลุกให้คลั่ง ภูเขาไฟพร้อมระเบิด', 'Agni, keeper of the crater, has been driven mad by the Asura. The volcano is ready to burst.'],
  ['พญาเต่าน้ำแข็งหลับใต้ทะเลสาบ ศิลาถูกแช่แข็งไว้ในกระดองของมัน', 'The Ice Turtle Lord sleeps beneath the lake, the shard frozen into its shell.'],
  ['ราชินีแมงมุมน้ำแข็งทอใยผลึกปิดถ้ำนิรันดร์ ไม่มีใครออกมาได้', 'The Frost Spider Queen has sealed the eternal cave with crystal webs. None who enter come out.'],
  ['พญาช้างแมมมอธเดินนำฝูงข้ามธารน้ำแข็ง เหยียบทุกสิ่งที่ขวางหน้า', 'The Mammoth King leads his herd across the glacier and tramples all in its way.'],
  ['พญาหิมะปิดป้อมเหนือเมฆ ยึดศิลาไว้เพื่อแลกกับคำสัญญาของราชาอสูร', 'The Snow King has shut his citadel above the clouds, keeping the shard for a promise the Asura made him.'],
  ['ราชาอสูรไวราทะลวงผนึกออกมาได้ครึ่งตัว และบุกถึงประตูสวรรค์ดาวดึงส์ นี่คือการต่อสู้ครั้งสุดท้าย', 'Vaira, the Asura King, has half broken the seal and stormed the gate of Tavatimsa. This is the final battle.']
];
const ENDING = [`ศิลาทั้ง ${MAPS.length} ชิ้นกลับคืนสู่ที่ ผนึกวายราสว่างขึ้นอีกครั้ง เสียงกระซิบใต้เขาพระสุเมรุเงียบลง เจ้าคือผู้ผนึกแห่งวายรา`,
  `All ${MAPS.length} shards are home and the Seal of Vayra shines again. The whisper beneath Mount Meru falls silent. You are the Sealbearer of Vayra.`];

/* v29: a chapter for each of the thirty new regions (data/world3.js), told from its own land and its lord */
for (const mp of MAPS) if (mp.w3 && !STORY[mp.id]){ const bs = BOSSES.find(r => r[0] === mp.boss) || [];
  STORY[mp.id] = [`${mp.desc[0]} ${bs[1] || 'เจ้าแห่งแคว้น'}ถูกเสียงอสูรครอบงำและยึดศิลาผนึกของ${mp.name}ไว้ ไปปราบมันแล้วนำศิลากลับมา`,
    `${mp.desc[1]}. The Asura's whisper has taken ${bs[2] || 'its lord'}, who now holds the seal shard of ${mp.en}. Defeat it and bring the shard home.`]; }
/* chapters: hunt the first two monsters of the map, gather 5 of a third's loot, defeat the boss */
// story order: the capital, then the east road, south, west and finally north (by level)
const STORY_ORDER = [0, ...ROADS.e, ...ROADS.s, ...ROADS.w, ...ROADS.n];
const QUESTS = STORY_ORDER.map((m, i) => {
  const mp = MAPS[m], a = mp.mobs[0], b = mp.mobs[1], c = mp.mobs[2] || mp.mobs[0], n = i === 0 ? 8 : 15, mat = i === 0 ? 'jelly' : `m_${c}`;
  return {id:`main${m}`, ch:i, map:m, giver:i === 0 ? 'job' : 'warp', lv:mp.lv[0],
    title:[`บทที่ ${i}: ${mp.name}`, `Chapter ${i}: ${mp.en}`], story:STORY[m],
    goals:[{k:'kill', t:a, n}, {k:'kill', t:b, n}, {k:'item', t:mat, n:5}, {k:'boss', t:mp.boss, n:1}],
    reward:{bia:500 + mp.lv[0] * 150, exp:Math.round(nextBase(Math.max(1, mp.lv[0])) * .8), jexp:Math.round(nextJob(Math.min(40, Math.max(1, Math.round(mp.lv[0] / 4)))) * 2),
      items:[[mp.lv[0] < 30 ? 'redpot' : mp.lv[0] < 70 ? 'orangepot' : mp.lv[0] < 130 ? 'whitepot' : 'elixirpot', 10], ['bluepot', 5], ['talisman', 2]], shard:i}};
});
ITEMS.shard = {name:'ศิลาผนึกวายรา', en:'Vayra Seal Shard', kind:'key', desc:[`เศษศิลาผนึกโบราณ รวบรวมให้ครบ ${MAPS.length} ชิ้น`, `A shard of the ancient seal. Gather all ${MAPS.length}.`]};

/* ---------- state ---------- */
function qState(){ const q = S.quest || (S.quest = {main:0, active:null, prog:{}, done:{}, bounty:{}}); q.bounty = q.bounty || {}; q.prog = q.prog || {};
  if (q.v !== 2){ q.v = 2; q.done = q.done || {}; const k = QUESTS.findIndex(Q => !q.done[Q.id]); q.main = k < 0 ? QUESTS.length : k; }   // saves from the old one-road world
  return q; }
const curMain = () => QUESTS[qState().main] || null;
function questAccept(id){
  const q = qState(), Q = QUESTS.find(x => x.id === id); if (!Q || q.active) return;
  q.active = id; q.prog = {}; log(L(`รับเควสต์ ${Q.title[0]}`, `Quest accepted: ${Q.title[1]}`), 'g'); banner(L(Q.title[0], Q.title[1])); SFX.play('quest'); dirty = true; save();
}
function goalNow(g){ const q = qState(); return g.k === 'item' ? Math.min(g.n, S.inv[g.t] || 0) : Math.min(g.n, q.prog[g.k + ':' + g.t] || 0); }
function questReady(Q){ return Q && Q.goals.every(g => goalNow(g) >= g.n); }
function questTurnIn(){
  const q = qState(), Q = QUESTS.find(x => x.id === q.active); if (!questReady(Q)) return;
  for (const g of Q.goals) if (g.k === 'item'){ S.inv[g.t] -= g.n; if (S.inv[g.t] <= 0) delete S.inv[g.t]; }
  const r = Q.reward; S.bia += r.bia; gainExp(r.exp, r.jexp); for (const [id, n] of r.items) addItem(id, n);
  S.shards = (S.shards || 0) + 1; addItem('shard', 1);
  q.done[Q.id] = 1; if (typeof EV !== 'undefined') EV.emit('chapter', Q);
  q.active = null; q.prog = {}; q.main = QUESTS.findIndex(x => !q.done[x.id]); if (q.main < 0) q.main = QUESTS.length;
  VFX.play('jobChange', {x:P.x, y:P.y}); SFX.play('quest');
  log(L(`สำเร็จ ${Q.title[0]} · ได้ ${r.bia.toLocaleString()} เบี้ย · ศิลาผนึก ${S.shards}/${QUESTS.length}`, `Completed ${Q.title[1]} · ${r.bia.toLocaleString()} Bia · Seal shards ${S.shards}/${QUESTS.length}`), 'g');
  if (q.main >= QUESTS.length){ banner(L('ผนึกวายราสมบูรณ์!', 'The Seal of Vayra is whole!')); log(L(...ENDING), 'g'); S.title = 'sealbearer'; }
  else banner(L(`ได้ศิลาผนึกชิ้นที่ ${S.shards} · บทต่อไปที่${MAPS[QUESTS[q.main].map].name}`, `Shard ${S.shards} recovered · next chapter: ${MAPS[QUESTS[q.main].map].en}`));
  dirty = true; save();
}
/* bounties: one monster of the map, 25 kills, repeatable */
function bountyFor(mapId){
  const q = qState(), b = q.bounty[mapId];
  if (b) return b;
  const mp = MAPS[mapId], pool = mp.mobs.filter(t => !MOB[t].night), t = pool[(Math.floor(Date.now() / 3.6e6) + mapId) % pool.length];
  return {t, n:25, have:0, taken:false, bia:200 + MOB[t].lvl * 60, exp:Math.round(nextBase(Math.max(1, MOB[t].lvl)) * .25)};
}
function bountyTake(mapId){ const q = qState(), b = bountyFor(mapId); b.taken = true; b.have = 0; q.bounty[mapId] = b; SFX.play('quest'); log(L(`รับค่าหัว: ${MOB[b.t].name} ×${b.n}`, `Bounty taken: ${MOB[b.t].en} ×${b.n}`)); dirty = true; save(); }
function bountyClaim(mapId){ const q = qState(), b = q.bounty[mapId]; if (!b || b.have < b.n) return; S.bia += b.bia; gainExp(b.exp, Math.round(b.exp * .5)); delete q.bounty[mapId];
  SFX.play('coin'); VFX.play('coins', {x:P.x, y:P.y - 30}); log(L(`ค่าหัวสำเร็จ +${b.bia.toLocaleString()} เบี้ย`, `Bounty complete +${b.bia.toLocaleString()} Bia`), 'g'); dirty = true; save(); }
/* every kill feeds the active chapter and any bounty for that monster */
function questKill(type){
  const q = qState(), Q = QUESTS.find(x => x.id === q.active);
  if (Q) for (const g of Q.goals){ if ((g.k === 'kill' || g.k === 'boss') && g.t === type){ const k = g.k + ':' + type, before = q.prog[k] || 0; if (before < g.n){ q.prog[k] = before + 1; if (before + 1 === g.n) toast(L(`เป้าหมายครบ: ${MOB[type].name} ${g.n}/${g.n}`, `Objective done: ${MOB[type].en} ${g.n}/${g.n}`)); dirty = true; } } }
  for (const m in q.bounty){ const b = q.bounty[m]; if (b.taken && b.t === type && b.have < b.n){ b.have++; if (b.have === b.n) toast(L('ค่าหัวครบแล้ว กลับไปรับรางวัลที่ผู้เฝ้าศาล', 'Bounty complete: return to the shrine keeper')); dirty = true; } }
}
/* a line for the quest card on the HUD */
function questTracker(){
  const q = qState(), Q = QUESTS.find(x => x.id === q.active);
  const lines = [];
  if (Q){ lines.push(`<b>${L(Q.title[0], Q.title[1])}</b>`);
    for (const g of Q.goals){ const h = goalNow(g), nmT = g.k === 'item' ? nm(ITEMS[g.t]) : nm(MOB[g.t]); lines.push(`<span class="${h >= g.n ? 'qok' : ''}">${g.k === 'boss' ? '♛ ' : g.k === 'item' ? '◆ ' : '· '}${nmT} ${h}/${g.n}</span>`); }
    if (questReady(Q)) lines.push(`<em>${L(`กลับไปหา${Q.giver === 'job' ? 'ครูวายรา' : `ผู้เฝ้าศาล ${MAPS[Q.map].name}`}`, `Return to ${Q.giver === 'job' ? 'Master Vayra' : `the shrine keeper of ${MAPS[Q.map].en}`}`)}</em>`);
  } else if (curMain()){ const N = curMain(); lines.push(`<b>${L('เควสต์หลัก', 'Main story')}:</b> ${L(`คุยกับ${N.giver === 'job' ? 'ครูวายรา' : 'ผู้เฝ้าศาล'}ที่${MAPS[N.map].name}`, `talk to ${N.giver === 'job' ? 'Master Vayra' : 'the shrine keeper'} in ${MAPS[N.map].en}`)} (Lv ${N.lv}+)`); }
  for (const m in q.bounty){ const b = q.bounty[m]; if (b.taken) lines.push(`<span class="${b.have >= b.n ? 'qok' : ''}">${L('ค่าหัว', 'Bounty')}: ${nm(MOB[b.t])} ${b.have}/${b.n}</span>`); }
  return lines.join('<br>');
}
/* what an NPC shows above its head: '!' a quest to take, '?' one to hand in */
function npcMark(n){
  const q = qState(), Q = QUESTS.find(x => x.id === q.active), N = curMain();
  if (Q && Q.giver === n.id && Q.map === MAP_ID && questReady(Q)) return '?';
  if (!Q && N && N.giver === n.id && N.map === MAP_ID) return '!';
  if (n.id === 'warp' || n.id === 'job'){ const b = q.bounty[MAP_ID]; if (b && b.taken && b.have >= b.n) return '?'; }
  return '';
}
/* quest section of the giver's dialog */
function questDialog(n){
  const q = qState(), Q = QUESTS.find(x => x.id === q.active), N = curMain();
  let h = '', say = '';
  if (Q && Q.giver === n.id && Q.map === MAP_ID){
    say = questReady(Q) ? L('เจ้าทำสำเร็จแล้ว ศิลาชิ้นนี้คืนสู่ผนึก รับรางวัลไปเถิด', 'You have done it. This shard returns to the seal. Take your reward.') : L(...Q.story);
    h += `<div class="sec">${L(Q.title[0], Q.title[1])}</div><div class="qbox">${Q.goals.map(g => { const v = goalNow(g); return `<div class="qg${v >= g.n ? ' ok' : ''}"><span>${g.k === 'boss' ? L('ปราบ Boss', 'Defeat boss') : g.k === 'item' ? L('เก็บ', 'Gather') : L('ล่า', 'Hunt')} ${g.k === 'item' ? nm(ITEMS[g.t]) : nm(MOB[g.t])}</span><b>${v}/${g.n}</b></div>`; }).join('')}
      <small>${L('รางวัล', 'Reward')}: ${Q.reward.bia.toLocaleString()} ${CUR()} · EXP · ${L('ยา', 'potions')} · ${L('ศิลาผนึก', 'Seal shard')}</small>
      <button class="btn gold wide" data-qturnin="1" ${questReady(Q) ? '' : 'disabled'}>${questReady(Q) ? L('ส่งเควสต์', 'Hand in') : L('ยังไม่ครบ', 'Not finished yet')}</button></div>`;
  } else if (!Q && N && N.giver === n.id && N.map === MAP_ID){
    say = L(...N.story);
    h += `<div class="sec">${L(N.title[0], N.title[1])}</div><div class="qbox"><p class="hint">${L(`แนะนำ Lv ${N.lv}+`, `Suggested Lv ${N.lv}+`)}</p>${N.goals.map(g => `<div class="qg"><span>${g.k === 'boss' ? L('ปราบ Boss', 'Defeat boss') : g.k === 'item' ? L('เก็บ', 'Gather') : L('ล่า', 'Hunt')} ${g.k === 'item' ? nm(ITEMS[g.t]) : nm(MOB[g.t])}</span><b>×${g.n}</b></div>`).join('')}
      <button class="btn gold wide" data-qaccept="${N.id}">${L('รับเควสต์', 'Accept')}</button></div>`;
  } else if (Q && Q.map !== MAP_ID && (n.id === 'warp' || n.id === 'job')){
    h += `<p class="hint">${L(`เควสต์หลักของเจ้าอยู่ที่${MAPS[Q.map].name}`, `Your main quest is in ${MAPS[Q.map].en}`)}</p>`;
  } else if (!N && (n.id === 'warp' || n.id === 'job')){ h += `<p class="hint">${L(...ENDING)}</p>`; }
  // bounty board
  if (n.id === 'warp' || n.id === 'job'){
    const b = bountyFor(MAP_ID);
    h += `<div class="sec">${L('ประกาศค่าหัว', 'Bounty board')}</div><div class="qbox"><div class="qg${b.taken && b.have >= b.n ? ' ok' : ''}"><span>${L('ล่า', 'Hunt')} ${nm(MOB[b.t])} Lv ${MOB[b.t].lvl}</span><b>${b.taken ? `${b.have}/${b.n}` : `×${b.n}`}</b></div>
      <small>${L('รางวัล', 'Reward')}: ${b.bia.toLocaleString()} ${CUR()} · EXP · ${L('ทำซ้ำได้', 'repeatable')}</small>
      ${!b.taken ? `<button class="btn wide" data-btake="${MAP_ID}">${L('รับค่าหัว', 'Take bounty')}</button>` : `<button class="btn gold wide" data-bclaim="${MAP_ID}" ${b.have >= b.n ? '' : 'disabled'}>${L('รับรางวัล', 'Claim reward')}</button>`}</div>`;
  }
  return {h, say};
}
