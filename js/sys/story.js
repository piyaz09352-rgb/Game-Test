/* VAYRATHEN — js/sys/story.js
   Side story "บันทึกครูวายรา" (Vayra's Journal): ten chapters told by Grandma Lao, the village storyteller in
   Aren. They follow the main story at a distance: chapter k opens once you hold 3k seal shards (or reach its
   level). Each sends you to a region of the main road to hunt and gather, then back to Grandma Lao for the
   next page of the journal. Rewards: Vayra Coins, Bia, EXP, the Envoy's Lomphok (chapter 5) and the Siamese
   Court Regalia with the title "Disciple of Vayra" (chapter 10). */
'use strict';

const SIDE_TXT = [
  ['ครูวายราที่เจ้ารู้จัก เมื่อหกสิบปีก่อนเป็นแค่เด็กเลี้ยงควายในทุ่งนี้ วันหนึ่งฝนตกหนัก เด็กน้อยหลบใต้ต้นตาลแล้วเห็นแสงเรืองจากเมือกเจลลี่… ไปดูให้ยายหน่อยว่าทุ่งยังเรืองแสงอยู่ไหม',
   'The Master Vayra you know was, sixty years ago, just a buffalo boy in these fields. One stormy day he sheltered under a palm and saw jelly ooze glowing… go and see whether the fields still glow.'],
  ['แสงนั้นคือเศษผนึกที่หลุดออกมา เด็กน้อยเก็บไว้ในกระบอกไม้ไผ่ แล้วเดินตามแสงเข้าป่าไผ่ ที่นั่นมีลิงคอยขโมยของ… เขาเรียนรู้ว่าพลังไม่ใช่ของใครคนเดียว',
   'The glow was a stray piece of the seal. The boy kept it in a bamboo tube and followed its light into the bamboo grove, where monkeys stole everything… he learned that power belongs to no one alone.'],
  ['หนุ่มวายราล่องเรือไปตามลำน้ำ หาคนที่อ่านอักษรบนศิลาได้ ชาวเรือเล่าว่ามีฤๅษีอยู่ปลายน้ำ แต่ทางนั้นมีจระเข้ยักษ์ขวางอยู่',
   'Young Vayra took a boat downriver to find someone who could read the writing on the shard. Boatmen spoke of a hermit at the river mouth, but giant crocodiles guarded the way.'],
  ['ฤๅษีปลายน้ำสอนวายราว่าผนึกไม่ได้ทำจากหิน แต่ทำจากคำสัญญาของผู้คนทุกแคว้น ศิลาแต่ละชิ้นคือคำสัญญาหนึ่งข้อ',
   'The hermit taught Vayra that the seal is not made of stone but of promises: every shard is a promise kept by the people of one region.'],
  ['วายราได้รับเชิญเป็นราชทูตไปเจรจากับเจ้าเมืองทางใต้ เขาสวมลอมพอกขาวเดินทางไกล ยายยังเก็บลอมพอกใบนั้นไว้ ถ้าเจ้าช่วยงานนี้เสร็จ ยายจะยกให้',
   'Vayra was sent as royal envoy to the southern lords, wearing a white lomphok on the long road. Grandma still keeps that hat; finish this errand and it is yours.'],
  ['ในการเจรจา มีคนหนึ่งทรยศ นำเสียงกระซิบของอสูรเข้ามาในวัง วายราต้องหนีเข้าป่าลึกพร้อมศิลาสามชิ้น ศัตรูไล่ตามมาไม่หยุด',
   'At the talks a traitor let the Asura\'s whisper into the palace. Vayra fled into the deep forest with three shards while enemies hunted him day and night.'],
  ['ในป่านั้นเองที่วายราพบเสือสมิงตัวแรก มันไม่ได้ทำร้ายเขา มันแค่เฝ้ามอง… ว่ากันว่าหมวกลายเสือของครูวายราได้มาจากคืนนั้น',
   'In that forest Vayra met his first Saming. It did not attack; it only watched… they say the tiger-striped hat he wears came from that night.'],
  ['หลายปีผ่านไป วายรารวบรวมคนจากทุกแคว้นมาสาบานใหม่ ผนึกที่แตกถูกซ่อมด้วยคำสัญญาใหม่ แต่ราคาคือเขาต้องอยู่เฝ้ามันตลอดไป',
   'Years later Vayra gathered people from every region to swear anew. The broken seal was mended with new promises, but the price was that he must guard it for the rest of his life.'],
  ['วายราไม่เคยมีศิษย์ เขารอคนที่ศิลาเลือก คนที่ได้ยินเสียงกระซิบแต่ไม่ฟังมัน… ยายคิดว่าเขารอเจ้ามาทั้งชีวิตแล้ว',
   'Vayra never took a disciple. He waited for the one the shards would choose: someone who hears the whisper and does not listen to it… Grandma thinks he has waited his whole life for you.'],
  ['หน้าสุดท้ายของบันทึกเขียนไว้ว่า "เมื่อศิษย์ของข้ามาถึง จงมอบชุดราชสำนักให้เขา ชุดที่ข้าใส่วันสาบาน" รับไปเถิดหลาน เจ้าคือศิษย์แห่งครูวายรา',
   'The last page reads: "When my disciple comes, give them the court regalia I wore on the day of the oath." Take it, child. You are the disciple of Vayra.']
];
/* chapter k: a region along the main road; hunt its first monster, gather its third's loot */
const SIDE = SIDE_TXT.map((t, k) => { const m = MAPS[STORY_ORDER[Math.min(STORY_ORDER.length - 1, k * 3)]], a = m.mobs[0], c = m.mobs[2] || m.mobs[1] || m.mobs[0];
  return {k, map:m.id, lv:m.lv[0], shards:k * 3, title:[`ตอนที่ ${k + 1}`, `Part ${k + 1}`], story:t,
    goals:[{k:'kill', t:a, n:20 + k * 2}, {k:'item', t:k === 0 ? 'jelly' : `m_${c}`, n:5}],
    reward:{coin:5 + k * 2, bia:800 + m.lv[0] * 200, exp:Math.round(nextBase(Math.max(1, m.lv[0])) * .5), cos:k === 4 ? 'hc_lomphok' : k === 9 ? 'c_royal' : null}}; });
const sideSt = () => S.side || (S.side = {i:0, active:false, prog:{}});
const sideOpen = Q => Q && ((S.shards || 0) >= Q.shards || S.lvl >= Q.lv + 5);
const sideHave = g => (g.k === 'item' ? Math.min(g.n, S.inv[g.t] || 0) : Math.min(g.n, sideSt().prog[g.t] || 0));
const sideReady = Q => Q.goals.every(g => sideHave(g) >= g.n);
EV.on('kill', m => { const s = sideSt(), Q = SIDE[s.i]; if (!s.active || !Q) return; for (const g of Q.goals) if (g.k === 'kill' && g.t === m.type){ s.prog[g.t] = Math.min(g.n, (s.prog[g.t] || 0) + 1); dirty = true; } });
function sideAccept(){ const s = sideSt(), Q = SIDE[s.i]; if (!Q || s.active || !sideOpen(Q)) return; s.active = true; s.prog = {}; SFX.play('quest'); banner(L(`บันทึกครูวายรา · ${Q.title[0]}`, `Vayra's Journal · ${Q.title[1]}`)); dirty = true; save(); }
function sideTurnIn(){
  const s = sideSt(), Q = SIDE[s.i]; if (!Q || !s.active || !sideReady(Q)) return;
  for (const g of Q.goals) if (g.k === 'item'){ S.inv[g.t] -= g.n; if (S.inv[g.t] <= 0) delete S.inv[g.t]; }
  const r = Q.reward; S.bia += r.bia; gainExp(r.exp, Math.round(r.exp * .4)); coinAdd(r.coin, L('บันทึกครูวายรา', "Vayra's Journal")); if (r.cos) cosGrant(r.cos);
  s.i++; s.active = false; s.prog = {}; bump('side'); EV.emit('side', Q.k); VFX.play('jobChange', {x:P.x, y:P.y}); SFX.play('quest');
  log(L(`จบบันทึกครูวายรา ${Q.title[0]}`, `Vayra's Journal ${Q.title[1]} complete`), 'g'); dirty = true; save();
}
function sideHTML(){
  const s = sideSt(), Q = SIDE[s.i];
  if (!Q) return `<div class="sidew done"><b>${L('บันทึกครูวายรา', "Vayra's Journal")}</b><p class="hint">${L('อ่านจบทุกหน้าแล้ว', 'Every page has been read')}</p></div>`;
  return `<div class="sidew"><div class="dailyh"><b>${L('บันทึกครูวายรา', "Vayra's Journal")} · ${L(...Q.title)}</b><span>${s.i}/${SIDE.length}</span></div>
    ${s.active ? Q.goals.map(g => { const h = sideHave(g); return `<div class="qg${h >= g.n ? ' ok' : ''}"><span>${g.k === 'item' ? L('เก็บ', 'Gather') : L('ล่า', 'Hunt')} ${g.k === 'item' ? nm(ITEMS[g.t]) : nm(MOB[g.t])} <small>(${nm(MAPS[Q.map])})</small></span><b>${h}/${g.n}</b></div>`; }).join('') + `<p class="hint">${sideReady(Q) ? L('ครบแล้ว กลับไปหายายเล่าที่นครอาเรน', 'Done: return to Grandma Lao in Aren') : ''}</p>`
      : `<p class="hint">${sideOpen(Q) ? L('คุยกับยายเล่าที่นครอาเรนเพื่อฟังตอนต่อไป', 'Talk to Grandma Lao in Aren for the next part') : L(`เปิดเมื่อได้ศิลาผนึก ${Q.shards} ชิ้น หรือ Lv ${Q.lv + 5}`, `Opens at ${Q.shards} seal shards or Lv ${Q.lv + 5}`)}</p>`}</div>`;
}
function sideTrack(){ const s = sideSt(), Q = SIDE[s.i]; if (!Q || !s.active) return ''; return `<br><span class="${sideReady(Q) ? 'qok' : ''}">📜 ${L('บันทึก', 'Journal')} ${Q.goals.map(g => `${sideHave(g)}/${g.n}`).join(' · ')}</span>`; }

addTownNpc({id:'teller', name:'ยายเล่า', en:'Grandma Lao', role:'นักเล่าเรื่อง · เนื้อเรื่องเสริม', roleEn:'Storyteller · Side story', x:230, y:800},
  {job:'novice', look:{sex:'f', hair:0, color:'hairSilver'}, gear:{armor:'c_sakura', head:'hc_hide'}});
NPC_OPEN.teller = n => {
  const s = sideSt(), Q = SIDE[s.i];
  let say, body;
  if (!Q){ say = L('บันทึกเล่มนี้จบแล้วหลาน แต่เรื่องของเจ้ายังไม่จบหรอก', 'This journal is finished, child. Your own story is not.'); body = ''; }
  else if (s.active){ say = sideReady(Q) ? L(...Q.story) : L('ไปให้ถึงก่อนแล้วค่อยกลับมาฟังต่อนะหลาน', 'Go there first, then come back for the rest of the tale.');
    body = `<div class="qbox">${Q.goals.map(g => { const h = sideHave(g); return `<div class="qg${h >= g.n ? ' ok' : ''}"><span>${g.k === 'item' ? L('เก็บ', 'Gather') : L('ล่า', 'Hunt')} ${g.k === 'item' ? nm(ITEMS[g.t]) : nm(MOB[g.t])}</span><b>${h}/${g.n}</b></div>`; }).join('')}
      <small>${L('รางวัล', 'Reward')}: ◈ ${Q.reward.coin} · ${fmtN(Q.reward.bia)} ${CUR()} · EXP${Q.reward.cos ? ' · ✦ ' + cosName(Q.reward.cos) : ''}</small>
      <button class="btn gold wide" data-sideturn="1" ${sideReady(Q) ? '' : 'disabled'}>${sideReady(Q) ? L('ฟังตอนจบของบทนี้', 'Hear the end of this part') : L('ยังไม่ครบ', 'Not finished yet')}</button></div>`; }
  else if (sideOpen(Q)){ say = L(...Q.story); body = `<div class="qbox"><b>${L('บันทึกครูวายรา', "Vayra's Journal")} · ${L(...Q.title)}</b><p class="hint">${L(`ไปที่${MAPS[Q.map].name}`, `Go to ${MAPS[Q.map].en}`)}</p>
      <button class="btn gold wide" data-sideacc="1">${L('รับเรื่องเล่า', 'Take the tale')}</button></div>`; }
  else { say = L('นั่งก่อนหลาน… เรื่องตอนต่อไปต้องรอให้เจ้าเก่งกว่านี้อีกหน่อย', 'Sit a while, child… the next part must wait until you are a little stronger.');
    body = `<p class="hint">${L(`เปิดเมื่อได้ศิลาผนึก ${Q.shards} ชิ้น หรือ Lv ${Q.lv + 5}`, `Opens at ${Q.shards} seal shards or Lv ${Q.lv + 5}`)}</p>`; }
  npcFrame(n, say, body);
};
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-sideacc],[data-sideturn]'); if (!b || b.disabled) return;
  if (b.dataset.sideacc) sideAccept(); else sideTurnIn(); const n = NPCS.find(x => x.id === 'teller'); if (n) NPC_OPEN.teller(n); });
