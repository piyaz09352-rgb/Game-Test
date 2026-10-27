/* VAYRATHEN — js/sys/achieve.js
   Achievements (ความสำเร็จ) and titles (ฉายา).
   Each achievement watches a counter (kills, bosses, level, crafts …), unlocks once per character, pays Vayra
   Coins and usually grants a title. The chosen title is drawn above the hero's glowing name (everyone online
   sees it) in the colour of its tier: bronze · silver · gold · legendary. Window: Y. */
'use strict';

const ACH_TIER = [{th:'ทองแดง', en:'Bronze', c:'#e0a070'}, {th:'เงิน', en:'Silver', c:'#d8e4f4'}, {th:'ทอง', en:'Gold', c:'#ffd76a'}, {th:'ตำนาน', en:'Legend', c:'#ff9cf0'}];
const ACH_CAT = [['hunt', 'การล่า', 'Hunting'], ['grow', 'การเติบโต', 'Growth'], ['story', 'เนื้อเรื่อง', 'Story'], ['craft', 'ช่างและสมบัติ', 'Craft & treasure'], ['world', 'โลกและสังคม', 'World & people']];
const sv = k => (S.st && S.st[k]) || 0;
const visitedN = () => Object.keys(S.visited || {}).length;
const jobTier = () => (JOBS[S.job] || {}).tier || 1;
/* [id, cat, tier, th, en, desc th, desc en, progress () => [now, goal], coins, title [th, en] | null, extra reward] */
const ACH = [
  ['hunt1', 'hunt', 0, 'ล่าครั้งแรก', 'First Hunt', 'ล้มมอนสเตอร์ตัวแรก', 'Defeat your first monster', () => [sv('kills'), 1], 2, ['ผู้เริ่มล่า', 'Fledgling Hunter']],
  ['hunt100', 'hunt', 0, 'นักล่ามือใหม่', 'Novice Hunter', 'ล้มมอน 100 ตัว', 'Defeat 100 monsters', () => [sv('kills'), 100], 5, ['นักล่ามือใหม่', 'Novice Hunter']],
  ['hunt1k', 'hunt', 1, 'นักล่าผู้ชำนาญ', 'Seasoned Hunter', 'ล้มมอน 1,000 ตัว', 'Defeat 1,000 monsters', () => [sv('kills'), 1000], 15, ['นักล่าผู้ชำนาญ', 'Seasoned Hunter']],
  ['hunt10k', 'hunt', 2, 'ตำนานนักล่า', 'Legendary Hunter', 'ล้มมอน 10,000 ตัว', 'Defeat 10,000 monsters', () => [sv('kills'), 10000], 50, ['ตำนานนักล่า', 'Legend of the Hunt']],
  ['boss1', 'hunt', 0, 'ผู้ล้มบอส', 'Bossbreaker', 'ล้มบอสตัวแรก', 'Defeat your first boss', () => [sv('bosses'), 1], 5, ['ผู้ล้มบอส', 'Bossbreaker']],
  ['boss10', 'hunt', 1, 'ผู้พิชิต', 'Conqueror', 'ล้มบอส 10 ครั้ง', 'Defeat 10 bosses', () => [sv('bosses'), 10], 15, ['ผู้พิชิต', 'Conqueror']],
  ['boss50', 'hunt', 2, 'ผู้สยบอสูร', 'Demon Queller', 'ล้มบอส 50 ครั้ง', 'Defeat 50 bosses', () => [sv('bosses'), 50], 40, ['ผู้สยบอสูร', 'Demon Queller']],
  ['wb1', 'hunt', 1, 'ผู้ต้านภัยพิบัติ', 'Calamity Breaker', 'ร่วมล้มบอสโลก', 'Help defeat a world boss', () => [sv('wbkills'), 1], 20, ['ผู้ต้านภัยพิบัติ', 'Calamity Breaker']],
  ['wb10', 'hunt', 3, 'วีรชนแห่งอาณาจักร', 'Hero of the Realm', 'ร่วมล้มบอสโลก 10 ครั้ง', 'Help defeat 10 world bosses', () => [sv('wbkills'), 10], 80, ['วีรชนแห่งอาณาจักร', 'Hero of the Realm']],
  ['pet1', 'hunt', 0, 'เพื่อนของสรรพสัตว์', 'Friend of Beasts', 'จับสัตว์เลี้ยงตัวแรก', 'Capture your first pet', () => [sv('captures'), 1], 3, ['เพื่อนของสรรพสัตว์', 'Friend of Beasts']],
  ['lv10', 'grow', 0, 'ผู้ตื่น', 'Awakened', 'Base Lv 10', 'Reach Base Lv 10', () => [S.lvl, 10], 3, ['ผู้ตื่น', 'the Awakened']],
  ['lv30', 'grow', 0, 'นักผจญภัย', 'Adventurer', 'Base Lv 30', 'Reach Base Lv 30', () => [S.lvl, 30], 5, ['นักผจญภัย', 'Adventurer']],
  ['lv60', 'grow', 1, 'ยอดฝีมือ', 'Elite', 'Base Lv 60', 'Reach Base Lv 60', () => [S.lvl, 60], 15, ['ยอดฝีมือ', 'the Elite']],
  ['lv90', 'grow', 2, 'ปรมาจารย์', 'Grandmaster', 'Base Lv 90', 'Reach Base Lv 90', () => [S.lvl, 90], 30, ['ปรมาจารย์', 'Grandmaster']],
  ['lv120', 'grow', 3, 'ผู้อยู่เหนือขีดจำกัด', 'Beyond the Limit', 'Base Lv 120', 'Reach Base Lv 120', () => [S.lvl, 120], 100, ['ผู้อยู่เหนือขีดจำกัด', 'Beyond the Limit']],
  ['lv200', 'grow', 3, 'ตำนานแห่งวายรา', 'Legend of Vayra', 'Base Lv 200', 'Reach Base Lv 200', () => [S.lvl, 200], 150, ['ตำนานแห่งวายรา', 'Legend of Vayra']],
  ['lv300', 'grow', 3, 'จุดสูงสุดแห่งวายรา', 'Summit of Vayra', 'Base Lv 300 (เลเวลตัน)', 'Reach the Lv 300 cap', () => [S.lvl, 300], 300, ['จุดสูงสุดแห่งวายรา', 'Summit of Vayra']],
  ['job2', 'grow', 0, 'ผู้เลือกทาง', 'Pathfinder', 'เปลี่ยนเป็นอาชีพขั้นที่ 2', 'Become a 2nd-tier class', () => [jobTier(), 2], 5, ['ผู้เลือกทาง', 'Pathfinder']],
  ['job3', 'grow', 2, 'ผู้นำแห่งสาย', 'Master of the Path', 'เปลี่ยนเป็นอาชีพขั้นที่ 3', 'Become a 3rd-tier class', () => [jobTier(), 3], 25, ['ผู้นำแห่งสาย', 'Master of the Path']],
  ['tut', 'grow', 0, 'ผู้มาใหม่', 'Newcomer', 'จบบทสอนเล่น', 'Finish the tutorial', () => [S.tut && S.tut.done ? 1 : 0, 1], 5, ['ผู้มาใหม่', 'Newcomer']],
  ['die10', 'grow', 0, 'ผู้ไม่ยอมแพ้', 'Unbowed', 'ล้มลงแล้วลุกขึ้นใหม่ 10 ครั้ง', 'Fall and rise again 10 times', () => [sv('deaths'), 10], 3, ['ผู้ไม่ยอมแพ้', 'the Unbowed']],
  ['shard1', 'story', 0, 'ผู้ถือศิลา', 'Shardbearer', 'ได้ศิลาผนึกชิ้นแรก', 'Recover your first seal shard', () => [S.shards || 0, 1], 5, ['ผู้ถือศิลา', 'Shardbearer']],
  ['shard10', 'story', 1, 'ผู้พิทักษ์ผนึก', 'Seal Warden', 'ได้ศิลาผนึก 10 ชิ้น', 'Recover 10 seal shards', () => [S.shards || 0, 10], 20, ['ผู้พิทักษ์ผนึก', 'Seal Warden']],
  ['sealbearer', 'story', 3, 'ผู้ผนึกแห่งวายรา', 'Sealbearer of Vayra', `รวบรวมศิลาผนึกครบ ${MAPS.length} ชิ้น`, `Recover all ${MAPS.length} shards`, () => [S.shards || 0, MAPS.length], 150, ['ผู้ผนึกแห่งวายรา', 'Sealbearer of Vayra']],
  ['side3', 'story', 1, 'ผู้ฟังเรื่องเล่า', 'Listener', 'จบเนื้อเรื่องเสริม 3 ตอน', 'Finish 3 side-story chapters', () => [sv('side'), 3], 10, ['ผู้ฟังเรื่องเล่า', 'the Listener']],
  ['sideall', 'story', 2, 'ศิษย์แห่งครูวายรา', 'Disciple of Vayra', 'จบเนื้อเรื่องเสริม "บันทึกครูวายรา" ทุกตอน', 'Finish the whole side story "Vayra\'s Journal"', () => [sv('side'), 10], 40, ['ศิษย์แห่งครูวายรา', 'Disciple of Vayra']],
  ['daily1', 'story', 0, 'วันแรกของงาน', 'First Shift', 'ทำภารกิจรายวันสำเร็จ 1 อย่าง', 'Complete a daily task', () => [sv('dailies'), 1], 2, null],
  ['daily30', 'story', 1, 'ผู้ขยันขันแข็ง', 'Diligent', 'ทำภารกิจรายวันสำเร็จ 30 อย่าง', 'Complete 30 daily tasks', () => [sv('dailies'), 30], 20, ['ผู้ขยันขันแข็ง', 'the Diligent']],
  ['streak7', 'story', 2, 'เจ็ดวันไม่ขาด', 'Seven Straight Days', 'ทำภารกิจรายวันครบทั้ง 3 อย่าง 7 วันติด', 'Clear all three dailies 7 days in a row', () => [(ACC.streak || {}).best || 0, 7], 30, ['ผู้มาทุกวัน', 'Ever Present'], 'c_daily'],
  ['card1', 'craft', 0, 'การ์ดใบแรก', 'First Card', 'ได้ Card ใบแรก', 'Get your first card', () => [sv('cards'), 1], 3, ['นักสะสมการ์ด', 'Card Collector']],
  ['card25', 'craft', 2, 'คลังการ์ด', 'Card Vault', 'ได้ Card 25 ใบ', 'Get 25 cards', () => [sv('cards'), 25], 30, ['เจ้าคลังการ์ด', 'Keeper of Cards']],
  ['ref7', 'craft', 0, 'ช่างตีบวก', 'Refiner', 'ตีบวกอุปกรณ์ถึง +7', 'Refine a piece to +7', () => [typeof maxRefine === 'function' ? maxRefine() : S.refine || 0, 7], 5, ['ช่างตีบวก', 'Refiner']],
  ['ref10', 'craft', 1, 'ผู้กล้าเสี่ยง', 'Risk Taker', 'ตีบวกอุปกรณ์ถึง +10', 'Refine a piece to +10', () => [typeof maxRefine === 'function' ? maxRefine() : S.refine || 0, 10], 15, ['ผู้กล้าเสี่ยง', 'Risk Taker']],
  ['ref15', 'craft', 3, 'หัตถ์เทวะ', 'Hand of the Gods', 'ตีบวกอุปกรณ์ถึง +15', 'Refine a piece to +15', () => [typeof maxRefine === 'function' ? maxRefine() : S.refine || 0, 15], 80, ['หัตถ์เทวะ', 'Hand of the Gods']],
  ['craft1', 'craft', 0, 'ช่างหลอมฝึกหัด', 'Apprentice Smith', 'หลอมของครั้งแรก', 'Craft your first item', () => [sv('crafts'), 1], 3, ['ช่างหลอมฝึกหัด', 'Apprentice Smith']],
  ['craft25', 'craft', 2, 'ช่างหลอมทองคำ', 'Golden Smith', 'หลอมของ 25 ครั้ง', 'Craft 25 items', () => [sv('crafts'), 25], 30, ['ช่างหลอมทองคำ', 'Golden Smith']],
  ['epic1', 'craft', 1, 'ประกายล้ำค่า', 'Epic Glow', 'ได้ไอเทมล้ำค่าขึ้นไป', 'Obtain an Epic item or better', () => [sv('epic'), 1], 10, null],
  ['legend1', 'craft', 3, 'ผู้ถูกเลือกโดยตำนาน', 'Chosen by Legend', 'ได้ไอเทมตำนาน', 'Obtain a Legendary item', () => [sv('legend'), 1], 50, ['ผู้ถูกเลือกโดยตำนาน', 'Chosen by Legend']],
  ['rich', 'craft', 1, 'เศรษฐีน้อย', 'Well-off', 'มีเงิน 100,000 เบี้ย', 'Hold 100,000 Bia', () => [S.bia, 100000], 10, ['เศรษฐีน้อย', 'the Well-off']],
  ['rich2', 'craft', 2, 'มหาเศรษฐี', 'Tycoon', 'มีเงิน 1,000,000 เบี้ย', 'Hold 1,000,000 Bia', () => [S.bia, 1000000], 40, ['มหาเศรษฐี', 'Tycoon']],
  ['map10', 'world', 0, 'นักสำรวจ', 'Explorer', 'ไปให้ถึง 10 แคว้น', 'Visit 10 regions', () => [visitedN(), 10], 5, ['นักสำรวจ', 'Explorer']],
  ['map31', 'world', 2, 'ผู้เดินทั่วอาณาจักร', 'Realm Walker', 'ไปให้ครบทุกแคว้น', 'Visit every region', () => [visitedN(), MAPS.length], 40, ['ผู้เดินทั่วอาณาจักร', 'Realm Walker']],
  ['cos5', 'world', 1, 'แฟชั่นนิสต้า', 'Fashionista', 'มีชุดแฟชั่น 5 ชุด', 'Own 5 costumes', () => [typeof cosCount === 'function' ? cosCount() - 1 : 0, 5], 10, ['แฟชั่นนิสต้า', 'Fashionista']],
  ['guild', 'world', 0, 'สมาชิกกิลด์', 'Guildmate', 'เข้าร่วมหรือก่อตั้งกิลด์', 'Join or found a guild', () => [S.guild ? 1 : 0, 1], 5, ['สหายกิลด์', 'Guildmate']],
  ['trade1', 'world', 0, 'พ่อค้าแม่ค้า', 'Trader', 'แลกของกับผู้เล่นอื่นสำเร็จ', 'Complete a trade with another player', () => [sv('trades'), 1], 5, ['พ่อค้าแม่ค้า', 'Merchant']],
  ['legendary', 'world', 3, 'ผู้เป็นตำนาน', 'Living Legend', 'ปลดล็อกความสำเร็จ 30 อย่าง', 'Unlock 30 achievements', () => [Object.keys(S.ach || {}).length, 30], 120, ['ผู้เป็นตำนาน', 'Living Legend'], 'c_starlight']
].map(a => ({id:a[0], cat:a[1], tier:a[2], th:a[3], en:a[4], dth:a[5], den:a[6], prog:a[7], coin:a[8], title:a[9], cos:a[10]}));
const ACH_BY = Object.fromEntries(ACH.map(a => [a.id, a]));
ACH_BY.legendary.cos2 = 'hc_tiara';
const titleOf = id => ACH_BY[id] && ACH_BY[id].title;
const titleTxt = id => { const t = titleOf(id); return t ? L(t[0], t[1]) : ''; };
/* titles you hold: unlocked achievements, plus Hall of Fame titles (fame.js) */
const achHas = id => !!((S.ach && S.ach[id]) || (S.fame && S.fame.titles && S.fame.titles[id]));
const titleCol = id => (ACH_BY[id] ? ACH_TIER[ACH_BY[id].tier].c : '#ffe08a');

let achBusy = false, achQ = [];
function achCheck(){
  if (achBusy || !S || !S.lvl) return; achBusy = true;
  try { S.ach = S.ach || {};
    for (const a of ACH){ if (S.ach[a.id]) continue; let p; try { p = a.prog(); } catch (e){ continue; } if (p[0] >= p[1]) achUnlock(a); }
  } finally { achBusy = false; }
}
function achUnlock(a){
  S.ach[a.id] = Date.now();
  // (v27) coins go to the ACCOUNT, achievements belong to a hero: each achievement pays its coins once per account
  // (a new hero used to earn them all over again — and character creation paid them twice)
  if (a.coin && typeof ACC !== 'undefined'){ const g = ACC.achC = ACC.achC && typeof ACC.achC === 'object' ? ACC.achC : {}; if (!g[a.id]){ g[a.id] = 1; coinAdd(a.coin, L(a.th, a.en)); } }
  if (a.cos) cosGrant(a.cos, true); if (a.cos2) cosGrant(a.cos2, true);
  if (a.title && !S.title) S.title = a.id;
  log(L(`ปลดล็อกความสำเร็จ: ${a.th}${a.title ? ` · ได้ฉายา «${a.title[0]}»` : ''}`, `Achievement: ${a.en}${a.title ? ` · title «${a.title[1]}»` : ''}`), 'g');
  achQ.push(a); if (achQ.length === 1) achPop(); SFX.play('ach'); dirty = true; reWin('ach');
}
/* the golden popup at the top of the screen */
function achPop(){
  const a = achQ[0]; if (!a) return; let p = el('achPop');
  if (!p){ p = document.createElement('div'); p.id = 'achPop'; p.className = 'achpop'; el('ui').appendChild(p); }
  p.style.setProperty('--tc', ACH_TIER[a.tier].c);
  p.innerHTML = `<i class="achgem"></i><div><small>${L('ปลดล็อกความสำเร็จ', 'Achievement unlocked')} · ${L(ACH_TIER[a.tier].th, ACH_TIER[a.tier].en)}</small><b>${L(a.th, a.en)}</b><span>${a.title ? `${L('ฉายา', 'Title')} «${L(...a.title)}»` : ''}${a.coin ? ` · ◈ +${a.coin}` : ''}${a.cos ? ` · ✦ ${cosName(a.cos)}` : ''}</span></div>`;
  p.hidden = false; p.classList.remove('show'); void p.offsetWidth; p.classList.add('show');
  clearTimeout(p._t); p._t = setTimeout(() => { p.classList.remove('show'); setTimeout(() => { achQ.shift(); if (achQ.length) achPop(); else p.hidden = true; }, 400); }, 3200);
}
['stat', 'level', 'kill', 'card', 'chapter', 'craft', 'job', 'map', 'refine', 'costume', 'trade', 'guild', 'tut', 'daily', 'side', 'wboss'].forEach(n => EV.on(n, () => achCheck()));

/* ---------- window (Y) ---------- */
mkWin('ach', 'ความสำเร็จ', 'Achievements', 'Y', '<path d="M6 3h8v4a4 4 0 01-8 0z"/><path d="M6 4.5H3.5a2.5 2.5 0 003 3M14 4.5h2.5a2.5 2.5 0 01-3 3M10 11v3M7 17h6M8 14h4v3H8z"/>');
const ACHW = {tab:'all'};
WIN_RENDER.ach = function(){
  const pane = el('pane-ach'); if (!pane) return; achCheck(); S.ach = S.ach || {};
  const got = Object.keys(S.ach).length, titles = Object.values(ACH_BY).filter(a => a.title && achHas(a.id));
  const bar = (p) => `<div class="achbar"><i style="width:${Math.min(100, p[0] / p[1] * 100)}%"></i><span>${fmtN(Math.min(p[0], p[1]))}/${fmtN(p[1])}</span></div>`;
  const card = a => { const on = !!S.ach[a.id], p = (() => { try { return a.prog(); } catch (e){ return [0, 1]; } })();
    return `<div class="achc${on ? ' on' : ''}" style="--tc:${ACH_TIER[a.tier].c}"><i class="achgem"></i><div class="achm"><b>${L(a.th, a.en)}</b><small>${L(a.dth, a.den)}</small>${on ? `<em>${new Date(S.ach[a.id]).toLocaleDateString(LANG === 'en' ? 'en-GB' : 'th-TH')}</em>` : bar(p)}</div>
      <div class="achr">${a.coin ? `<span>◈ ${a.coin}</span>` : ''}${a.title ? `<span class="tt">«${L(...a.title)}»</span>` : ''}${a.cos ? `<span>✦ ${cosName(a.cos)}</span>` : ''}</div></div>`; };
  pane.innerHTML = `<div class="achhead"><div><b>${got}/${ACH.length}</b><small>${L('ความสำเร็จ', 'unlocked')}</small></div><div><b>◈ ${fmtN(ACC.coins)}</b><small>${L('เหรียญวายรา', 'Vayra Coins')}</small></div>
      <div class="achnow"><small>${L('ฉายาที่ใช้', 'Current title')}</small><b style="color:${titleCol(S.title)}">${S.title ? `«${titleTxt(S.title)}»` : L('— ไม่ใช้ —', '— none —')}</b></div></div>
    <div class="wktabs achtabs">${[['all', 'ทั้งหมด', 'All'], ...ACH_CAT, ['titles', 'ฉายา', 'Titles']].map(([k, th, en]) => `<button class="wktab${ACHW.tab === k ? ' on' : ''}" data-achtab="${k}"><span>${L(th, en)}</span></button>`).join('')}</div>
    ${ACHW.tab === 'titles' ? `<div class="titlelist"><button class="tlrow${!S.title ? ' on' : ''}" data-settitle=""><b>${L('ไม่ใช้ฉายา', 'No title')}</b></button>${titles.map(a => `<button class="tlrow${S.title === a.id ? ' on' : ''}" data-settitle="${a.id}" style="--tc:${ACH_TIER[a.tier].c}"><b>«${L(...a.title)}»</b><small>${L(a.th, a.en)} · ${L(ACH_TIER[a.tier].th, ACH_TIER[a.tier].en)}</small></button>`).join('') || ''}</div>
      <p class="hint">${L('ฉายาแสดงเหนือชื่อตัวละคร ผู้เล่นออนไลน์คนอื่นเห็นด้วย', 'Your title shows above your name, and other players see it')}</p>`
    : `<div class="achlist">${ACH.filter(a => ACHW.tab === 'all' || a.cat === ACHW.tab).sort((a, b) => (!!S.ach[b.id] - !!S.ach[a.id]) || a.tier - b.tier).map(card).join('')}</div>`}`;
};
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-achtab],[data-settitle]'); if (!b) return;
  if (b.dataset.achtab){ ACHW.tab = b.dataset.achtab; WIN_RENDER.ach(); return; }
  const id = b.dataset.settitle; S.title = id && achHas(id) ? id : ''; SFX.play('click'); dirty = true; save(); WIN_RENDER.ach(); if (typeof NET !== 'undefined') NET.presT = 0;
});
