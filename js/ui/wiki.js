/* VAYRATHEN — js/ui/wiki.js
   In-game wiki (K): everything in the game, read straight from the game's own data so it is never out of date.
   Tabs: Systems · Classes & skills · Monsters · Bosses · Items · Equipment · Cards · Regions.
   Each tab has a search box and a list; picking an entry opens its page on the right (stacked on small screens).
   Entries link to each other: a monster's drops open the item, an item lists who drops it, a region lists its
   monsters, and so on. */
'use strict';

const WIKI = {tab:'sys', q:'', sel:null, land:'all', hist:[]};
const WIKI_TABS = [
  ['sys', 'ระบบเกม', 'Systems', 'scroll'], ['job', 'อาชีพ & สกิล', 'Classes', 'sword'], ['mob', 'มอนสเตอร์', 'Monsters', 'paw'],
  ['boss', 'บอส', 'Bosses', 'crack'], ['item', 'ไอเทม', 'Items', 'pot'], ['gear', 'อุปกรณ์', 'Equipment', 'armor'],
  ['card', 'การ์ด', 'Cards', 'card'], ['map', 'แคว้น', 'Regions', 'leaf']];

/* ---------- indexes built once from the game data ---------- */
let WIKI_IX = null;
function wikiIndex(){
  if (WIKI_IX) return WIKI_IX;
  const where = {}, droppers = {};
  MAPS.forEach(mp => { for (const t of [...mp.mobs, mp.boss]) (where[t] = where[t] || []).push(mp.id); });
  for (const k in MOB) for (const [id, ch] of MOB[k].drops || []) (droppers[id] = droppers[id] || []).push([k, ch]);
  const skillOf = {}; for (const j in JOBS) for (const id of JOBS[j].skills) skillOf[id] = j;
  return (WIKI_IX = {where, droppers, skillOf});
}
const wkLink = (tab, id, label, cls = '') => `<a class="wkl ${cls}" data-wk="${tab}:${id}">${label}</a>`;
const wkPct = v => (v >= .1 ? Math.round(v * 100) : +(v * 100).toFixed(2)) + '%';

/* (v57) a card's effects, one per line, each with what it means in plain words */
const WK_FX = [
  [/^Max HP \+/, 'เลือดสูงสุดมากขึ้น อึดขึ้น', 'More maximum HP'], [/^Max SP \+/, 'SP สูงสุดมากขึ้น ใช้สกิลได้นานขึ้น', 'More maximum SP for skills'],
  [/^DEF \+/, 'โดนตีกายภาพเบาลง', 'Takes less physical damage'], [/^MDEF \+/, 'โดนเวทเบาลง', 'Takes less magic damage'],
  [/^ATK \+/, 'ตีกายภาพแรงขึ้น', 'Physical hits do more'], [/^MATK \+/, 'เวทแรงขึ้น', 'Spells do more'],
  [/^HIT \+/, 'แม่นขึ้น ตีพลาดน้อยลง', 'Misses less'], [/^FLEE \+/, 'หลบการโจมตีได้บ่อยขึ้น', 'Dodges more often'],
  [/^CRIT \+/, 'ตีคริติคอล (แรงพิเศษ) บ่อยขึ้น', 'Lands critical hits more often'], [/^ต้านคริ/, 'ศัตรูคริใส่เราได้ยากขึ้น', 'Enemies crit you less'],
  [/^ต้านสถานะ/, 'ติดมึน พิษ แช่แข็ง ฯลฯ ยากขึ้น', 'Resists stun, poison, freeze and other statuses'],
  [/^STR \+/, 'พลัง: ตีกายภาพแรงขึ้น', 'Strength: harder physical hits'], [/^AGI \+/, 'ว่องไว: ตีเร็วและหลบเก่งขึ้น', 'Agility: faster attacks, more dodging'],
  [/^VIT \+/, 'อดทน: เลือดและป้องกันมากขึ้น', 'Vitality: more HP and defence'], [/^INT \+/, 'ปัญญา: เวทแรงและ SP มากขึ้น', 'Intelligence: stronger spells, more SP'],
  [/^DEX \+/, 'แม่นยำ: ตีโดนง่ายและร่ายเร็วขึ้น', 'Dexterity: hits land and casts are quicker'], [/^LUK \+/, 'โชค: คริและหลบได้บ่อยขึ้นเล็กน้อย', 'Luck: a little more crit and dodge'],
  [/^ทุก Stat/, 'เพิ่มสเตตัสทั้ง 6 ตัวพร้อมกัน', 'Raises all six stats'], [/^ร่ายเร็วขึ้น/, 'ร่ายสกิลเสร็จเร็วขึ้น', 'Spells finish casting sooner'],
  [/^รับดาเมจ −/, 'ดาเมจที่โดนทุกอย่างลดลง', 'All damage taken is lower'], [/^ASPD/, 'ตีเร็วขึ้น', 'Attacks faster'],
  [/^ความเร็วเดิน/, 'เดินเร็วขึ้น', 'Moves faster'], [/^คูลดาวน์/, 'ใช้สกิลซ้ำได้เร็วขึ้น', 'Skills come back sooner'], [/^ฟื้นฟูแรงขึ้น/, 'ฮีลและการฟื้นเลือดได้มากขึ้น', 'Heals and regeneration restore more'],
  [/^ดาเมจต่อเผ่า(.+?) \+/, 'ตีมอนเผ่า$1แรงขึ้น', 'Hits $1 monsters harder'], [/^เจาะเกราะเผ่า(.+?) /, 'ทะลุเกราะมอนเผ่า$1 บางส่วน', 'Partly ignores the armour of $1 monsters'],
  [/^ดาเมจธาตุ(.+?) \+/, 'ตีด้วยธาตุ$1แรงขึ้น', 'Your $1-element hits do more'], [/^รับดาเมจธาตุ(.+?) −/, 'โดนธาตุ$1เบาลง', 'Takes less $1-element damage'],
  [/^รับดาเมจจากเผ่า(.+?) −/, 'โดนมอนเผ่า$1ตีเบาลง', '$1 monsters hit you softer'],
  [/^โจมตีมีโอกาส (\S+) ติด(.+?) (\S+) วิ/, 'ทุกครั้งที่ตีมีโอกาส $1 ทำให้ศัตรูติด$2 นาน $3 วินาที', 'Each hit has a $1 chance to inflict $2 for $3 s'],
  [/^ดูด HP และ SP/, 'ได้ HP และ SP คืนตามดาเมจที่ทำ', 'Heals HP and SP from damage dealt']];
function wkCardFx(id){
  const d = CARDS[id] && CARDS[id].desc; if (!d) return '';
  const th = String(d[0]).split(/,\s*/), en = String(d[1] || '').split(/,\s*/);
  const rows = th.map((t, i) => { const f = WK_FX.find(([re]) => re.test(t)); let ex = '';
    if (f){ const mm = t.match(f[0]); ex = (L(f[1], f[2])).replace(/\$(\d)/g, (_, n) => mm[+n] || ''); }
    return `<li><b class="wkfx">${escH(L(t, en[i] || t))}</b>${ex ? `<small>${ex}</small>` : ''}</li>`; });
  return `<h4>${L('ผลของการ์ด', 'What it does')}</h4><ul class="wkfxl">${rows.join('')}</ul>`;
}
/* (v57) everything a boss can leave behind, not only its item list */
function wkBossLoot(id){
  const m = MOB[id]; if (!m || !m.boss) return '';
  const mp = (typeof MAPS !== 'undefined' ? Object.values(MAPS) : []).find(x => x && x.boss === id), land = mp && mp.land;
  const line = typeof g10BossLine === 'function' ? g10BossLine({type:id, def:m}) : null;
  const rows = [
    ['💰', L('เงิน 3,000 เบี้ย', '3,000 Bia'), L('ทุกครั้งที่ล้ม (MVP)', 'Every kill (MVP)')],
    ['⚔️', L('อุปกรณ์ 1–3 ชิ้น', '1–3 pieces of gear'), L('แน่นอน · ระดับตามเลเวลบอส มีโอกาสได้ของหายาก', 'Always · graded by the boss level, rare ones possible')],
    line ? ['✦', L(`ของประจำสาย${g10LineName(line)}`, `${g10LineName(line)} line gear`), L('35% · ในนั้น 18% เป็นของตำนาน', '35% · 18% of those are Legendary')] : null,
    land && typeof ZS_LANDS !== 'undefined' && ZS_LANDS[land] ? ['🧩', L(`ชิ้นส่วนเซต${ZS_LANDS[land][0]}`, `${ZS_LANDS[land][1]} set piece`), '25%'] : null,
    m.lvl >= 150 && typeof CSET !== 'undefined' ? ['👑', L('ชิ้นส่วนเซตประจำอาชีพของคุณ', 'A piece of your class set'), L('6% (บอส Lv 150+)', '6% (Lv 150+ bosses)')] : null,
    ITEMS.drill_d ? ['💎', nm(ITEMS.drill_d), L('12% · เจาะช่องการ์ดสำเร็จแน่นอน', '12% · always adds a card socket')] : null
  ].filter(Boolean);
  return `<h4>${L('รางวัลจากการล้มบอส', 'Boss rewards')}</h4><div class="wkloot">${rows.map(([ic, a, b]) => `<div><em>${ic}</em><b>${a}</b><small>${b}</small></div>`).join('')}</div>`;
}
const wkElem = e => `<span class="wkel el-${e || 'neutral'}">${elemName(e || 'neutral')}</span>`;
const wkRace = r => (typeof RACE_TH !== 'undefined' && RACE_TH[r] ? L(RACE_TH[r], RACE_EN[r]) : r);
const wkSize = s => L(SIZE_TH[s], SIZE_EN[s]);
const wkMobPic = (k, big) => { const a = typeof mobArt === 'function' ? mobArt(k) : ''; return `<span class="wkpic${big ? ' big' : ''}">${a ? `<img data-mart="${k}" src="${a}" alt="">` : '<b>?</b>'}</span>`; };

/* ---------- system articles ---------- */
const WIKI_SYS = [
  {id:'start', t:['เริ่มต้นเล่น', 'Getting started'], b:() => L(
    `<p>เริ่มเป็น <b>ชาวบ้าน</b> ที่นครอาเรน ตีมอนในทุ่งสุวรรณินเพื่อเก็บ EXP · ลงแต้ม Stat (A) และสกิล (S) · ถึง Job Lv 10 และลงสกิล "พร้อมออกเดินทาง" แล้วคุยกับ <b>ครูวายรา</b> เพื่อเปลี่ยนอาชีพ</p>
     <ul><li>เดิน: คลิก/แตะพื้น หรือจอยซ้าย · แตะแผนที่ย่อเพื่อเดินไปจุดนั้น</li><li>โจมตี: คลิกมอน หรือปุ่มโจมตีใหญ่</li><li>ยา: ช่อง 7–8 หรือปุ่มยาข้างจอย</li><li>Auto (B): ให้ตัวละครล่ามอนเอง ตั้งชุดสกิลได้</li><li>บัญชีละ 3 ตัวละคร เลือกที่หน้าเริ่มเกม</li></ul>`,
    `<p>You start as a <b>Villager</b> in Aren. Hunt in the Suwannin Fields for EXP · spend Stat (A) and Skill (S) points · at Job Lv 10 with "Ready to Journey" learned, talk to <b>Master Vayra</b> to change class.</p>
     <ul><li>Move: click/tap the ground or use the left stick · tap the minimap to walk there</li><li>Attack: click a monster or the big attack button</li><li>Potions: slots 7–8 or the buttons by the stick</li><li>Auto (B): the hero hunts on its own with your skill set</li><li>3 characters per account, picked on the title screen</li></ul>`)},
  {id:'stats', t:['ค่าสถานะ (Stat)', 'Stats'], b:() => { const capRow = [1, 45, 70, 100, 130, 150, 180, 200, 240, 270, 300];   // (v243) current: what each stat does, the points and the cap that grows with level
    return `<table class="wkt"><tr><th>Stat</th><th>${L('ผล', 'Effect')}</th></tr>
    <tr><td>STR</td><td>${L('พลังโจมตีของอาวุธระยะใกล้ (หลัก) · เพิ่มพลังโจมตีระยะไกลเล็กน้อย', 'Close-range weapon ATK (main) · a little ranged ATK')}</td></tr>
    <tr><td>AGI</td><td>${L('ตีเร็วขึ้น · หลบ (FLEE) · ต้านเชื่องช้าและตรึง', 'Faster attacks · FLEE (dodge) · resists slow and root')}</td></tr>
    <tr><td>VIT</td><td>${L('HP สูงสุด · ป้องกัน (DEF) · ฟื้น HP เร็วขึ้น · ต้านมึน พิษ เลือดไหล ไฟลวก', 'Max HP · DEF · faster HP recovery · resists stun, poison, bleed, burn')}</td></tr>
    <tr><td>INT</td><td>${L('พลังเวท (ยิ่งสูงยิ่งคุ้ม) · SP สูงสุด · ป้องกันเวท (MDEF) · ร่ายเร็วขึ้น · ฟื้น SP เร็วขึ้น · ต้านใบ้ แช่แข็ง ตาพร่า', 'Magic ATK (pays more the higher it goes) · Max SP · MDEF · faster casts · faster SP recovery · resists silence, freeze, blind')}</td></tr>
    <tr><td>DEX</td><td>${L('ความแม่น (HIT) · พลังโจมตีของธนู (หลัก) · ร่ายเร็วขึ้นมาก · เพิ่มพลังโจมตีระยะใกล้เล็กน้อย', 'HIT · bow ATK (main) · much faster casts · a little close-range ATK')}</td></tr>
    <tr><td>LUK</td><td>${L('คริติคอล · หลบแน่นอน (Perfect Dodge) · เพิ่มพลังโจมตีเล็กน้อย · ต้านคำสาป', 'Critical hits · Perfect Dodge · a little ATK · resists curse')}</td></tr></table>
    <ul><li>${L('คริติคอลแรงกว่าตีปกติและไม่พลาด · เวทไม่คริ ยกเว้นดาวกระจายของนินจา', 'Crits hit harder than normal hits and never miss · spells never crit, except the ninja\'s stars')}</li>
    <li>${L('ตีมอนที่เลเวลสูงกว่าเรา ต้องมีความแม่น (DEX) มากขึ้น ไม่งั้นจะตีพลาดบ่อย', 'Monsters above your level need more HIT (DEX), or you miss often')}</li>
    <li>${L('บอสสายเวทยิงเข้าทางป้องกันเวท (MDEF) เกราะหนาช่วยไม่ได้', 'Caster bosses hit your MDEF: heavy armour does not help')}</li></ul>
    <h4>${L('แต้มสเตตัส', 'Stat points')}</h4>
    <ul><li>${L('เริ่มเกมได้ 48 แต้ม · ขึ้นเลเวลได้ 8 แต้ม และได้มากขึ้นอีก 1 แต้มทุก 38 เลเวล (ถึง Lv 300 ได้เลเวลละ 15)', 'You start with 48 points · each level gives 8, one more every 38 levels (15 a level by Lv 300)')}</li>
    <li>${L('ยิ่งสเตตัสสูง แต่ละแต้มยิ่งแพง (ราคาขึ้นทุก 10 แต้ม)', 'The higher a stat, the more each point costs (up every 10 points)')}</li>
    <li>${L('รีเซตสเตตัสได้ฟรีทุกเมื่อ ที่หน้าต่างสถานะ', 'Reset your stats for free any time in the Status window')}</li></ul>
    <h4>${L('เพดานสเตตัส (โตตามเลเวล)', 'Stat cap (grows with your level)')}</h4>
    <div class="wkscroll"><table class="wkt"><tr><th>Lv</th>${capRow.map(l => `<td>${l}</td>`).join('')}</tr><tr><th>${L('เพดาน', 'Cap')}</th>${capRow.map(l => `<td>${STAT_CAP(l)}</td>`).join('')}</tr></table></div>
    <ul><li>${L('แต้มแต่ละช่วงพอดันสเตตัสหลัก 2 ตัวถึงเพดาน และยังมีเหลือให้ตัวอื่น ที่ Lv 300 ได้ประมาณ 150 · 150 · 90 · 60 ต้องเลือกว่าจะเน้นอะไร', 'At every level the points are enough to raise two main stats to the cap with some left for others: about 150 · 150 · 90 · 60 at Lv 300, so choose what to focus on')}</li>
    <li>${L('ค่าที่ได้จากอุปกรณ์ การ์ด และบัฟ บวกเพิ่มได้เกินเพดาน', 'Bonuses from gear, cards and buffs add on top and may go past the cap')}</li></ul>`; }},
  {id:'elem', t:['ธาตุ', 'Elements'], b:() => { const E = ELEM;
    return `<p>${L('ดาเมจ % เมื่อธาตุโจมตี (แถว) ตีใส่ธาตุมอน (คอลัมน์) · เขียว = แรง แดง = เบา', 'Damage % when an attack element (row) hits a monster element (column) · green = strong, red = weak')}</p>
      <div class="wkscroll"><table class="wkt wkel-t"><tr><th></th>${E.map(e => `<th>${wkElem(e)}</th>`).join('')}</tr>${E.map(a => `<tr><th>${wkElem(a)}</th>${ETAB[a].map(v => `<td class="${v > 100 ? 'up' : v < 100 ? 'dn' : ''}">${v}</td>`).join('')}</tr>`).join('')}</table></div>
      <p>${L('ธนูใช้ธาตุของลูกธนูที่ใส่ · การ์ดผีโคมลอยทำให้อาวุธเป็นธาตุศักดิ์สิทธิ์', 'Bows use the element of the arrows worn · the Lantern Ghost card makes your weapon Holy')}</p>`; }},
  {id:'size', t:['ขนาดมอนกับอาวุธ', 'Size & weapons'], b:() => `<table class="wkt"><tr><th>${L('อาวุธ', 'Weapon')}</th><th>${wkSize('s')}</th><th>${wkSize('m')}</th><th>${wkSize('l')}</th></tr>
    ${Object.keys(SIZE_MOD).map(w => `<tr><td>${L(...WTYPE[w])}</td>${['s', 'm', 'l'].map(z => `<td class="${SIZE_MOD[w][z] < 1 ? 'dn' : ''}">${Math.round(SIZE_MOD[w][z] * 100)}%</td>`).join('')}</tr>`).join('')}</table>`},
  {id:'refine', t:['ตีบวกอาวุธ', 'Refining'], b:() => `<p>${L('ตีบวกที่ป้าบัวคำ ใช้หินวายรา 1 ก้อน + เงิน 200 × ขั้น · ATK +5 ต่อขั้น (สายเวทได้ MATK ด้วย) · สูงสุด +15', 'Refine with Auntie Buakham: 1 Vayra Ore + 200 × level in Bia · +5 ATK per level (staffs add MATK) · up to +15')}</p>
    <table class="wkt"><tr><th>${L('ขั้น', 'Level')}</th><th>${L('โอกาสสำเร็จ', 'Success')}</th></tr>${[[1, 4], [5, 7], [8, 10], [11, 15]].map(([a, b]) => `<tr><td>+${a}–+${b}</td><td>${REFINE_RATE(a)}%</td></tr>`).join('')}</table>
    <p>${L('ตั้งแต่ +5 ถ้าล้มเหลวจะลดลง 1 ขั้น', 'From +5, a failure drops it one level')}</p>`},
  {id:'time', t:['เวลา กลางคืน และอีเว้น', 'Time, night & events'], b:() => L(
    `<p>โลกใช้ <b>เวลาประเทศไทย</b> · <b>กลางคืน 18:30–06:00</b> มืดลงและมีมอนกลางคืนออกมา · <b>อีเว้นหลังเลิกงาน 17:00–02:00</b> EXP และของดรอป ×1.5</p>`,
    `<p>The world runs on <b>Thailand time</b> · <b>Night 18:30–06:00</b> gets dark and night monsters come out · <b>After-work event 17:00–02:00</b>: EXP and drops ×1.5</p>`)},
  {id:'boss', t:['บอส', 'Bosses'], b:() => L(
    `<p>ทุกแคว้นมีบอส 1 ตัว เกิดสุ่มตำแหน่งและเดินย้ายที่ไปเรื่อย ๆ · บอสมีสกิลพร้อมวงเตือนสีแดงบนพื้น ให้เดินหลบ · ถ้าหนีไกล บอสจะคลั่งวิ่งเร็วขึ้นและกระโดดใส่ · HP ต่ำกว่า 30% บางตัวคลั่งตีแรงขึ้น · ดรอปการ์ด 15% และอุปกรณ์แน่นอน 1 ชิ้น</p>`,
    `<p>Every region has one boss that spawns at a random spot and roams · its skills show red warning areas on the ground: step out · run far and it goes into a frenzy, running faster and leaping at you · some enrage below 30% HP · 15% card drop and one guaranteed piece of gear</p>`)},
  {id:'pet', t:['สัตว์เลี้ยงและการจับ', 'Pets & capture'], b:() => L(
    `<p>ตีมอนให้ HP เหลือไม่เกิน 30% แล้วกด T (หรือปุ่มจับ) เพื่อจับเป็นสัตว์เลี้ยง · สัตว์เลี้ยงเดินตามและเพิ่ม EXP · สายพรานสั่งให้ช่วยตีได้ · จอมอัญเชิญหิมพานต์ผูกพันธะบอสเป็นสัตว์คู่กายถาวรได้ (สกิลผูกพันธะราชันย์)</p>`,
    `<p>Bring a monster to 30% HP or less and press T (or Capture) to make it your pet · pets follow you and add EXP · hunters can make them fight · the Himmapan Sovereign can bind a boss as a permanent companion (Royal Bond)</p>`)},
  {id:'gear', t:['อุปกรณ์และดรอป', 'Gear & drops'], b:() => L(
    `<p>มอนทุกตัวมีโอกาสดรอปอุปกรณ์ (~2%) ในช่วงเลเวลใกล้ตัวมัน (−30 ถึง +5) · อาวุธจะดรอปเฉพาะชนิดที่อาชีพคุณใช้ได้ · บอสดรอปแน่นอน 1 ชิ้น และอีก 35% · เกราะ หมวก ลูกธนู ซื้อได้ที่ช่างตีเหล็กเพชร (ลูกธนูที่ร้านป้าบัวคำ) · อุปกรณ์ที่สวมแสดงบนตัวละคร</p>`,
    `<p>Any monster can drop gear (~2%) near its level (−30 to +5) · weapons only drop in your class's weapon type · bosses always drop one piece, 35% for a second · armour, helmets and arrows are sold by Blacksmith Phet · worn gear shows on your hero</p>`)},
  {id:'auto', t:['ออโต้และเก็บของ', 'Auto & looting'], b:() => L(
    `<p>Auto (B) ล่ามอนที่เหมาะกับเลเวล ใช้สกิลตามชุดที่ตั้ง (หมุนใช้ทุกสกิลที่ติ๊ก) กินยา นั่งพัก และกลับเมืองเมื่อยาหมด · กดสั่งเองเมื่อไหร่จะหยุด 5 วิ · ของดรอปตกที่พื้น ต้องเก็บเอง (กด Z / ชี้เมาส์ / ปุ่มเก็บ) หรือเช่าสัตว์ช่วยเก็บที่ลุงบุญมา</p>`,
    `<p>Auto (B) hunts monsters fit for your level, rotates every ticked skill, drinks potions, rests and heads home when out of potions · any manual input pauses it for 5s · drops land on the ground: pick them up yourself (Z, point the mouse, or the pick-up button) or rent a helper animal from Uncle Boonma</p>`)},
  {id:'online', t:['ออนไลน์', 'Online'], b:() => L(
    `<p>เปิดผ่านลิงก์ claude.ai เพื่อเห็นผู้เล่นอื่นในแคว้นเดียวกัน (แคว้นละสูงสุด 20 คน) · แชทรวม/แผนที่/ปาร์ตี้ · ปาร์ตี้แบ่ง EXP 30% ให้เพื่อนที่อยู่ใกล้ · เซฟสำรองบนคลาวด์ทุก 30 วิ</p>`,
    `<p>Open from the claude.ai link to see other players in your region (up to 20 per region) · global/map/party chat · party members nearby get 30% of your EXP · cloud backup every 30s</p>`)}
];

/* ---------- list + page per tab ---------- */
function wikiList(){
  const q = WIKI.q.trim().toLowerCase(), hit = (...s) => !q || s.some(x => String(x || '').toLowerCase().includes(q));
  const ix = wikiIndex();
  switch (WIKI.tab){
    case 'sys': return WIKI_SYS.filter(a => hit(a.t[0], a.t[1])).map(a => ({id:a.id, h:`<span class="wkic">${tabIcon('scroll')}</span><b>${L(...a.t)}</b>`}));
    case 'job': return Object.keys(JOBS).filter(j => hit(JOBS[j].name, JOBS[j].en, ...JOBS[j].skills.map(id => SKILLS[id].name + SKILLS[id].en)))
      .map(j => ({id:j, h:`<span class="wkpic"><canvas class="wkjob" data-wkjob="${j}" width="40" height="40"></canvas></span><span class="wn"><b>${nm(JOBS[j])}</b><small>Tier ${JOBS[j].tier} · ${JOBS[j].stat || ''}</small></span>`}));
    case 'mob': case 'boss': { const boss = WIKI.tab === 'boss';
      return Object.keys(MOB).filter(k => !!MOB[k].boss === boss && (!SPR.MOBS || SPR.MOBS[k] || boss) && (WIKI.land === 'all' || (ix.where[k] || []).some(i => MAPS[i].land === WIKI.land)) && hit(MOB[k].name, MOB[k].en))
        .sort((a, b) => MOB[a].lvl - MOB[b].lvl).map(k => ({id:k, h:`${wkMobPic(k)}<span class="wn"><b>${nm(MOB[k])}</b><small>Lv ${MOB[k].lvl} · ${elemName(MOB[k].elem || 'neutral')}</small></span>`})); }
    case 'item': return Object.keys(ITEMS).filter(id => ITEMS[id].kind !== 'gear' && ITEMS[id].kind !== 'ammo' && hit(ITEMS[id].name, ITEMS[id].en))
      .map(id => ({id, h:`<span class="wkpic">${itemIcon(id)}</span><span class="wn"><b>${nm(ITEMS[id])}</b><small>${ITEMS[id].kind === 'use' ? L('ใช้ได้', 'Usable') : ITEMS[id].kind === 'etc' ? L('ของสะสม', 'Loot') : L('วัสดุ', 'Material')}</small></span>`}));
    case 'gear': return GEAR_LIST.filter(([id]) => hit(ITEMS[id].name, ITEMS[id].en)).map(([id, slot]) => ({id, h:`<span class="wkpic">${itemIcon(id)}</span><span class="wn"><b>${nm(ITEMS[id])}</b><small>${slot === 'ammo' ? L('ลูกธนู', 'Arrows') : L(SLOT_TH[slot], SLOT_EN[slot])} · Lv ${ITEMS[id].lv}</small></span>`}));
    case 'card': return Object.keys(CARDS).filter(c => hit(CARDS[c].name, CARDS[c].en)).map(c => ({id:c, h:`<span class="wkpic">${cardHTML(c, 'mini')}</span><span class="wn"><b>${cardTitle(c)}</b><small>${L(SLOT_TH[CARDS[c].slot], SLOT_EN[CARDS[c].slot])}</small></span>`}));
    case 'map': return MAPS.filter(m => (WIKI.land === 'all' || m.land === WIKI.land) && hit(m.name, m.en)).map(m => ({id:m.id, h:`<span class="wkdot" style="background:${LANDS[m.land][2]}"></span><span class="wn"><b>${nm(m)}</b><small>Lv ${m.lv[0]}–${m.lv[1]}</small></span>`}));
  }
  return [];
}
function wikiPage(){
  const id = WIKI.sel, ix = wikiIndex();
  if (id == null) return `<p class="empty">${L('เลือกหัวข้อจากรายการ', 'Pick an entry from the list')}</p>`;
  switch (WIKI.tab){
    case 'sys': { const a = WIKI_SYS.find(x => x.id === id); return a ? `<h3>${L(...a.t)}</h3>${a.b()}` : ''; }
    case 'job': { const j = JOBS[id]; if (!j) return '';
      const chain = []; for (let k = id; k; k = JOBS[k].parent) chain.unshift(k);
      return `<div class="wkhead"><span class="wkpic big"><canvas class="wkjob" data-wkjob="${id}" width="72" height="72"></canvas></span><div><h3>${nm(j)}</h3><p class="wksub">Tier ${j.tier} · ${j.stat || ''} · ${L(...WTYPE[j.weapon.type])} · ${j.ranged ? L('ระยะไกล', 'Ranged') : j.caster ? L('สายเวท', 'Caster') : L('ประชิด', 'Melee')}</p>
        <p class="wkpath">${chain.map(k => wkLink('job', k, nm(JOBS[k]), k === id ? 'on' : '')).join(' → ')}${(j.next || []).length ? ` → ${j.next.map(k => wkLink('job', k, nm(JOBS[k]))).join(' / ')}` : ''}</p></div></div>
        <div class="wkstats"><span>HP ×${j.hp}</span><span>SP ×${j.sp}</span><span>${L('ระยะ', 'Range')} ${j.range}</span><span>Job Lv ${j.jobMax}</span><span>${nm(j.weapon)} · ATK ${j.weapon.atk}${j.weapon.matk ? ' · MATK ' + j.weapon.matk : ''}</span></div>
        <h4>${L('สกิล', 'Skills')} (${j.skills.reduce((a, s) => a + SKILLS[s].max, 0)} ${L('แต้ม', 'pts')})</h4>
        <div class="wkskills">${j.skills.map(s => { const k = SKILLS[s]; return `<div class="wksk"><span class="wkpic">${skillIcon(s)}</span><div><b>${skName(k)} <small>Lv ${k.max}${k.type === 'passive' ? ' · Passive' : ' · ' + typeLabel(k)}</small></b><small>${k.desc(k.max)}</small>${k.req ? `<small class="rq">${L('ต้องมี', 'Requires')}: ${reqText(k)}</small>` : ''}</div></div>`; }).join('')}</div>`; }
    case 'mob': case 'boss': { const m = MOB[id]; if (!m) return '';
      const maps = ix.where[id] || [];
      return `<div class="wkhead">${wkMobPic(id, true)}<div><h3>${m.boss ? '♛ ' : ''}${nm(m)}</h3><p class="wksub">Lv ${m.lvl} · ${wkElem(m.elem)} · ${wkRace(m.race)} · ${wkSize(m.size)}${m.night ? ' · ' + L('ออกกลางคืน', 'Night only') : ''}${m.aggro ? ' · ' + L('ไล่ตี', 'Aggressive') : ''}</p></div></div>
        ${MOB_LORE[id] ? `<p class="wklore"><i>${L(...MOB_LORE[id])}</i></p>` : ''}
        <div class="wkstats"><span>HP ${m.hp.toLocaleString()}</span><span>ATK ${m.atk[0].toLocaleString()}–${m.atk[1].toLocaleString()}</span><span>DEF ${m.def}</span><span>EXP ${(m.exp * RATE).toLocaleString()}</span><span>Job ${(m.jexp * JRATE).toLocaleString()}</span>${m.range ? `<span>${L('ยิงไกล', 'Ranged')} ${m.range}</span>` : ''}</div>
        <h4>${L('ธาตุที่ได้ผลดี', 'Best elements against it')}</h4><p>${ELEM.filter(e => ETAB[e][ELEM.indexOf(m.elem || 'neutral')] > 100).map(wkElem).join(' ') || '—'}</p>
        ${m.bossSkills ? `<h4>${L('สกิลบอส', 'Boss skills')}</h4><p>${m.bossSkills.map(k => `<span class="wchip sk">${L(...BOSS_SKILL_TH[k])}</span>`).join(' ')}</p>` : ''}
        <h4>${L('ของดรอป', 'Drops')}</h4><div class="wkdrops">${(m.drops || []).map(([d, ch]) => `<a class="wkdrop" data-wk="${ITEMS[d] && ITEMS[d].kind === 'gear' ? 'gear' : 'item'}:${d}">${itemIcon(d)}<span>${nm(ITEMS[d])}<small>${wkPct(ch)}</small></span></a>`).join('')}
          ${m.card ? `<a class="wkdrop" data-wk="card:${m.card}">${cardHTML(m.card, 'mini')}<span>${cardTitle(m.card)}<small>${wkPct(m.cardRate || .002)}</small></span></a>` : ''}</div>
        ${wkBossLoot(id)}
        <h4>${L('พบที่', 'Found in')}</h4><p>${maps.map(i => wkLink('map', i, nm(MAPS[i]))).join(' · ') || '—'}</p>`; }
    case 'item': case 'gear': { const it = ITEMS[id]; if (!it) return ''; const dr = (ix.droppers[id] || []).sort((a, b) => MOB[a[0]].lvl - MOB[b[0]].lvl);
      const g = GEAR[id];
      return `<div class="wkhead"><span class="wkpic big">${itemIcon(id)}</span><div><h3>${nm(it)}</h3><p class="wksub">${g ? (g.slot === 'ammo' ? L('ลูกธนู', 'Arrows') : L(SLOT_TH[g.slot], SLOT_EN[g.slot])) + ` · Lv ${g.lv}` : it.kind}</p></div></div>
        ${itemDesc(id) ? `<p>${itemDesc(id)}</p>` : ''}${g ? `<div class="wkstats"><span>${gearStatText(g.st)}</span>${g.st.wtype ? `<span>${L('ใช้ได้กับ', 'For')} ${Object.keys(JOBS).filter(j => JOBS[j].weapon.type === g.st.wtype).map(j => wkLink('job', j, nm(JOBS[j]))).join(', ')}</span>` : ''}</div>` : ''}
        <div class="wkstats">${it.buy ? `<span>${L('ราคาซื้อ', 'Buy')} ${it.buy.toLocaleString()}</span>` : ''}${it.sell ? `<span>${L('ขาย', 'Sell')} ${it.sell.toLocaleString()}</span>` : ''}</div>
        <h4>${L('ได้จาก', 'Obtained from')}</h4>
        ${dr.length ? `<div class="wkdrops">${dr.slice(0, 40).map(([k, ch]) => `<a class="wkdrop" data-wk="${MOB[k].boss ? 'boss' : 'mob'}:${k}">${wkMobPic(k)}<span>${nm(MOB[k])}<small>Lv ${MOB[k].lvl} · ${wkPct(ch)}</small></span></a>`).join('')}</div>`
          : g ? `<p>${g.slot === 'weapon' || g.slot === 'acc' ? L(`มอนเลเวล ${Math.max(1, g.lv - 5)}–${g.lv + 30} มีโอกาสดรอป · บอสดรอปแน่นอน`, `Monsters of Lv ${Math.max(1, g.lv - 5)}–${g.lv + 30} can drop it · bosses always drop gear`) : L(`ซื้อที่ช่างตีเหล็กเพชร หรือดรอปจากมอนเลเวล ${Math.max(1, g.lv - 5)}–${g.lv + 30}`, `Blacksmith Phet, or monsters of Lv ${Math.max(1, g.lv - 5)}–${g.lv + 30}`)}</p>`
          : `<p>${it.buy ? L('ซื้อที่ป้าบัวคำ', 'Sold by Auntie Buakham') : '—'}</p>`}`; }
    case 'card': { const c = CARDS[id]; if (!c) return ''; const k = CARD_MOB[id];
      return `<div class="wkcard">${cardHTML(id)}</div><p>${L('ใส่ในช่อง Card ของ', 'Goes in the card socket of the')} <b>${L(SLOT_TH[c.slot], SLOT_EN[c.slot])}</b> ${L('(อุปกรณ์ต้องมีช่องว่าง เจาะเพิ่มได้ที่ช่างเจาะมณี)', '(the gear needs a free socket; Driller Manee can add one)')}</p>${wkCardFx(id)}${k ? `<h4>${L('ดรอปจาก', 'Dropped by')}</h4><div class="wkdrops"><a class="wkdrop" data-wk="${MOB[k].boss ? 'boss' : 'mob'}:${k}">${wkMobPic(k)}<span>${nm(MOB[k])}<small>Lv ${MOB[k].lvl} · ${wkPct(MOB[k].cardRate || .002)}</small></span></a></div>` : ''}`; }
    case 'map': { const mp = MAPS[id]; if (!mp) return ''; const bd = MOB[mp.boss];
      return `<div class="wkhead"><span class="wkdot big" style="background:${LANDS[mp.land][2]}"></span><div><h3>${nm(mp)}</h3><p class="wksub">${L(LANDS[mp.land][0], LANDS[mp.land][1])} · Lv ${mp.lv[0]}–${mp.lv[1]}${S.visited && S.visited[mp.id] ? '' : ' · ' + L('ยังไม่เคยไป', 'Unexplored')}</p></div></div>
        <p><i>${L(...mp.desc)}</i></p><button class="btn sm" data-wkmap="${mp.id}">🗺 ${L('ดูบนแผนที่โลก', 'Show on world map')}</button>
        <h4>${L('เชื่อมกับ', 'Connects to')}</h4><p>${Object.entries(mp.links || {}).map(([d, j]) => `${{n:'↑', s:'↓', e:'→', w:'←'}[d]} ${wkLink('map', j, nm(MAPS[j]))}`).join(' · ') || '—'}</p>
        <h4>♛ ${L('บอส', 'Boss')}</h4><div class="wkdrops"><a class="wkdrop" data-wk="boss:${mp.boss}">${wkMobPic(mp.boss)}<span>${nm(bd)}<small>Lv ${bd.lvl}</small></span></a></div>
        <h4>${L('มอนสเตอร์', 'Monsters')}</h4><div class="wkdrops">${mp.mobs.map(k => `<a class="wkdrop" data-wk="mob:${k}">${wkMobPic(k)}<span>${nm(MOB[k])}<small>Lv ${MOB[k].lvl}${MOB[k].night ? ' · ' + L('กลางคืน', 'night') : ''}</small></span></a>`).join('')}</div>`; }
  }
  return '';
}
function renderWiki(){
  const pane = document.getElementById('pane-wiki'); if (!pane) return;
  const list = wikiList();
  if (WIKI.sel == null || !list.some(e => String(e.id) === String(WIKI.sel))) WIKI.sel = list.length ? list[0].id : null;
  const landOk = ['mob', 'boss', 'map'].includes(WIKI.tab);
  pane.innerHTML = `<div class="wk">
    <nav class="wktabs">${WIKI_TABS.map(([k, th, en, g]) => `<button class="wktab${WIKI.tab === k ? ' on' : ''}" data-wktab="${k}">${tabIcon(g)}<span>${L(th, en)}</span></button>`).join('')}</nav>
    <div class="wkbody">
      <div class="wkside">
        <label class="wkq">${tabIcon('eye')}<input id="wkQ" placeholder="${L('ค้นหา…', 'Search…')}" value="${WIKI.q.replace(/"/g, '&quot;')}" autocomplete="off"></label>
        ${landOk ? `<select id="wkLand"><option value="all">${L('ทุกดินแดน', 'All lands')}</option>${Object.keys(LANDS).map(k => `<option value="${k}" ${WIKI.land === k ? 'selected' : ''}>${L(LANDS[k][0], LANDS[k][1])}</option>`).join('')}</select>` : ''}
        <div class="wklist" id="wkList">${list.map(e => `<button class="wkrow${String(e.id) === String(WIKI.sel) ? ' on' : ''}" data-wksel="${e.id}">${e.h}</button>`).join('') || `<p class="empty">${L('ไม่พบ', 'Nothing found')}</p>`}</div>
        <small class="wkcount">${list.length} ${L('รายการ', 'entries')}</small>
      </div>
      <article class="wkpage" id="wkPage">${WIKI.hist.length ? `<button class="btn sm wkback" data-wkback="1">← ${L('ย้อนกลับ', 'Back')}</button>` : ''}${wikiPage()}</article>
    </div></div>`;
  const q = el('wkQ'); q.addEventListener('input', () => { WIKI.q = q.value; const pos = q.selectionStart; WIKI.sel = null; renderWiki(); const n = el('wkQ'); n.focus(); n.setSelectionRange(pos, pos); });
  q.addEventListener('keydown', e => e.stopPropagation());
  const ld = el('wkLand'); if (ld) ld.addEventListener('change', () => { WIKI.land = ld.value; WIKI.sel = null; renderWiki(); });
  // class portraits
  for (const cv of pane.querySelectorAll('canvas.wkjob')){ const sh = heroSheet(cv.dataset.wkjob, {}, S.look); if (!sh) continue; const K = sh.K, fs = sh.fs, c = SPR.ensure(sh, 'idle'), g = cv.getContext('2d');
    g.imageSmoothingEnabled = false; g.drawImage(c, fs / 2 - 16 * K, sh.anchor[1] - 46 * K, 32 * K, 32 * K, 0, 0, cv.width, cv.height); }
  const on = pane.querySelector('.wkrow.on'); if (on && on.scrollIntoViewIfNeeded) on.scrollIntoViewIfNeeded(false);
}
function wikiOpen(tab, id){
  WIKI.hist.push([WIKI.tab, WIKI.sel]); if (WIKI.hist.length > 30) WIKI.hist.shift();
  WIKI.tab = tab; WIKI.sel = isNaN(+id) || tab !== 'map' ? id : +id; WIKI.q = ''; WIKI.land = 'all'; renderWiki();
  const pg = el('wkPage'); if (pg) pg.scrollTop = 0;
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-wktab],[data-wksel],[data-wk],[data-wkback],[data-wkmap]'); if (!t) return;
  const d = t.dataset;
  if (d.wktab){ WIKI.tab = d.wktab; WIKI.sel = null; WIKI.q = ''; WIKI.land = 'all'; WIKI.hist = []; renderWiki(); }
  else if (d.wksel != null){ WIKI.sel = WIKI.tab === 'map' ? +d.wksel : d.wksel; renderWiki(); if (compactUI && compactUI()){ const pg = el('wkPage'); pg && pg.scrollIntoView({block:'start'}); } }
  else if (d.wk){ const [tab, id] = d.wk.split(':'); wikiOpen(tab, id); }
  else if (d.wkmap != null){ openWin('world'); WM.sel = +d.wkmap; renderWorld(); }
  else if (d.wkback){ const h = WIKI.hist.pop(); if (h){ WIKI.tab = h[0]; WIKI.sel = h[1]; WIKI.q = ''; renderWiki(); } }
});

{ const st = document.createElement('style');   /* (v57) card effects and boss rewards */
  st.textContent = `.wkfxl{list-style:none;margin:4px 0 8px;padding:0;display:grid;gap:4px}
  .wkfxl li{display:flex;flex-direction:column;padding:5px 9px;border-radius:9px;background:#e8f8ec;border-left:4px solid #1a8a3a}
  .wkfxl .wkfx{font:800 13px Sarabun,sans-serif;color:#0f5a26}.wkfxl small{font:600 12px Sarabun,sans-serif;color:#2a2a2a}
  .wkloot{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px;margin:4px 0 8px}
  .wkloot > div{display:grid;grid-template-columns:28px 1fr;grid-template-rows:auto auto;column-gap:6px;padding:6px 8px;border-radius:10px;background:#fff7e6;border:1.5px solid #e2c48a}
  .wkloot em{grid-row:1/3;font-style:normal;font-size:20px;align-self:center;text-align:center}
  .wkloot b{font:800 13px Sarabun,sans-serif;color:#141414}.wkloot small{font:600 12px Sarabun,sans-serif;color:#5a4020}`;
  document.head.appendChild(st); }
