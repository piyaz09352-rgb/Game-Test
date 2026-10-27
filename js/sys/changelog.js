/* VAYRATHEN — js/sys/changelog.js — (v127) ประวัติอัปเดต: every update in one scrollable page
   The "what's new" pop-up shows only the latest version; a player back after a while missed the rest. This page
   lists them all, newest first. Open it from the pop-up ("ดูประวัติทั้งหมด") or Settings → "ประวัติอัปเดต". */
'use strict';

const CHANGELOG = [
  ['v150', ['เลือกตีหลายชนิด · ปุ่มโจมตีใหม่ · สเตตัสแยกตามอาชีพ', 'Fight chosen kinds · new attack button · stats per class']],
  ['v150', ['เลือกตีมอนได้หลายชนิด · ปุ่มโจมตีใหม่ · สเตตัสแยกตามอาชีพ', 'Fight several chosen kinds · new attack button · stats per class']],
  ['v149', ['ปีกไม่ถูกตัด · ไม่มีปุ่มหมุน · ตัวละครพอดีวง', 'Wings uncut · no turn buttons · hero fits the ring']],
  ['v148', ['ตารางเทียบค่าอุปกรณ์ ตอนนี้ → ถ้าใส่', 'Gear stat table now → with this']],
  ['v147', ['ตัวละครกลางวงพอดี เห็นครบตัว', 'Hero exactly centred, shown whole']],
  ['v146', ['ปุ่มยาอยู่ที่เดิมทุกครั้ง', 'Potions always in the same place']],
  ['v145', ['ตัวละครใหญ่กลางวงอุปกรณ์ ไม่มีฉากหลัง', 'Large hero in the ring, no backdrop']],
  ['v144', ['แชทโลกมีแต่คำคุยของผู้เล่น', 'World chat is only players talking']],
  ['v143', ['คำพูดบอสไม่ท่วมแชททั้งหมด', 'Boss cries no longer flood All']],
  ['v142', ['เพลงใหม่ 12 เพลง ครบทุกแมพ', '12 new songs, music on every map']],
  ['v141', ['แชทอ่านง่าย · แท็บทั้งหมดมีข่าวสำคัญ', 'Readable chat · important news in All']],
  ['v140', ['หน้าต่างอุปกรณ์แบบวงกลมรอบตัวละคร', 'Equipment as a ring around the hero']],
  ['v139', ['มีดสั้นมือเดียวถือโล่ได้', 'One-handed daggers take a shield']],
  ['v138', ['การ์ดตัวละคร/เควสต์ใหญ่ขึ้น', 'Bigger hero and quest cards']],
  ['v137', ['บอสที่ฆ่าแล้วไม่เกิดซ้ำหลังเข้าเกมใหม่', 'A killed boss stays down after relogging']],
  ['v136', ['คนอื่นเห็นสัตว์เลี้ยงที่จับมา', 'Others see your caught pet']],
  ['v135', ['แก้จอว่างบน PC (หน่วยความจำการ์ดจอ)', 'Blank screen on PC fixed (graphics memory)']],
  ['v134', ['กลับเข้าแมพเดิมเร็วขึ้น 2–3 เท่า', 'Returning to a map is 2–3× faster']],
  ['v133', ['ซูมกล้อง 40%–150%', 'Camera zoom 40%–150%']],
  ['v132', ['ไม่มีแสงวาบ · ตีบวก/ซื้อไม่ค้าง · หน้าต่างช่าง 80% · UI 5 ขนาด · สัตว์อัญเชิญไม่บังตัว · การ์ดตัวละครเล็กลง', 'No flashes · smooth refine and buying · 80% workshop windows · 5 UI sizes · beasts keep clear · smaller hero card']],
  ['v132', ['ไม่มีจอวาบ · ตีบวก/ซื้อของไม่ค้าง · หน้าต่างช่าง 80% · UI 5 ขนาด · สัตว์อัญเชิญไม่บัง', 'No blinks · smooth refine/buy · 80% workshop windows · 5 UI sizes · beasts keep clear']],
  ['v132', ['ไม่มีแสงวาบ · ตีบวกและซื้อของไม่ค้าง · หน้าต่างช่าง 80% · UI 5 ขนาด', 'No flashes · smooth refining and buying · 80% workshop windows · five UI sizes']],
  ['v132', ['ไม่มีแสงวาบ · ตีบวก/ซื้อของไม่ค้าง · หน้าต่างช่าง 80% · ขนาด UI 5 ระดับ', 'No flashes · refine/buy without freezes · smith window 80% · five UI sizes']],
  ['v132', ['จอไม่วาบตอนใช้สกิล เสาแสงอัญเชิญจางลง', 'No screen blink on skills, softer summon light']],
  ['v131', ['สัตว์หิมพานต์และผีไทยตามวรรณคดี ไม่มีชิ้นส่วนสุ่ม', 'Himmapan beasts and Thai ghosts as the stories tell']],
  ['v130', ['บอสประจำแคว้นไม่ซ้อนกันตอนเปลี่ยนรอบ', 'No second region boss when the round turns over']],
  ['v130', ['บอสประจำแมพไม่ซ้อนสองตัวตอนขึ้นรอบใหม่', 'No second region boss when the round turns over']],
  ['v129', ['ผีเปรตสูงผอมคอยาว · ผีกองกอยขาเดียวกระโดด', 'Tall long-necked preta · one-legged hopping Kongkoi']],
  ['v128', ['มอนประจำภูมิภาคใช้สีตามดินแดน', 'Regional monsters wear their land\'s colours']],
  ['v127', ['บทสอนบนมือถือย้ายลงด้านล่างใต้ตัวละคร ย่อเก็บได้ · หน้าประวัติอัปเดต', 'Tutorial card on phones sits low and folds · this update history page']],
  ['v126', ['บอสคู่กายจากผูกพันธะราชันย์ตัวใหญ่ขึ้น · เอราวัณเล็กลง · ยกเลิกบททดสอบ Tier 4 · ใส่/ถอดการ์ดไม่กระตุก · ปุ่มยาจัดเป็นแถว · เอฟเฟกต์เปลี่ยนอาชีพไม่แสงจ้า', 'Bound boss bigger · Erawan smaller · Tier-4 trial removed · cards slot without a hitch · tidy potions · gentle class-change effect']],
  ['v125', ['ตั้งค่า: ตัววัดความลื่น และโหมดตรวจหน้าตามอน/บอส', 'Settings: smoothness meter and a look inspector']],
  ['v124', ['แผนที่โลกซูมด้วยสองนิ้ว แตะสองครั้ง หรือลูกกลิ้งเมาส์', 'World map: pinch, double-tap or mouse-wheel zoom']],
  ['v123', ['รูปปีกที่ว่างในตู้เสื้อผ้ากลับมา · สีย้อมเข้มไม่กลายเป็นขาวบนมือถือโหมดมืด', 'Blank wing pictures fixed · dark dyes stay dark in phone dark mode']],
  ['v122', ['มอนที่เป็นสัตว์จริง 174 ชนิด หน้าตาและขนาดตามจริง', '174 real-animal monsters look and size like the real thing']],
  ['v117–121', ['บอสตัวใหญ่ตามตำนาน ก้าวหนักแน่น หน้าตาและท่าทางตามสัตว์จริง (เสือ จระเข้ ช้าง นาค ครุฑ ปู แมงมุม คางคก ยักษ์ ผี)', 'Bosses sized from legend, heavy steps, looks and moves from life']],
  ['v116', ['การ์ดไอเท็มไม่ซ้อนไม่กะพริบ · สกิลไม่ซ้ำ 4 สกิลได้เอฟเฟกต์และท่าใหม่ · แยกร่างเงา → กรงเล็บจันทรา', 'No stacked tooltips · four look-alike skills redesigned · Shadow Clones → Moon Claws']],
  ['v115', ['กระเป๋าช่องใหญ่ 2 เท่า แยกประเภทอาวุธ · การ์ดไอเท็มไม่ซ้ำ · หน้าต่างสถานะไม่กะพริบ', 'Bigger bag squares, weapons by kind · no repeated cards · steady status window']],
  ['v113–114', ['ปุ่มเล็กบนมือถือกดง่ายขึ้น · เก็บของไม่กระตุก · หน้าจอ HUD จัดตำแหน่งเฉพาะตอนเปลี่ยน', 'Easier small buttons · no hitch on pickup · HUD lays out only on change']],
  ['v111', ['เงินของเกมเปลี่ยนเป็น "เบี้ย" (แปลงให้ 1:1)', 'The money is now Bia (converted 1:1)']],
  ['v110', ['มือถือ: แตะไอเท็มแล้วมีปุ่มสวมใส่ใหญ่ · แตะสองครั้งสวมได้', 'Phones: big Wear button on item cards · double-tap to wear']],
  ['v106–109', ['ตัดชื่อเกมอื่นออก · ไม่มีอะไรกะพริบ · ปุ่มสกิลมือถือไม่ทับกัน · ออโต้ต่อบัพตอนใกล้หมด · กรอบมอนอยู่บนสุด', 'Other game names removed · nothing blinks · skill buttons never overlap · smarter Auto buffs · monster card on top']],
  ['v104–105', ['ปิดเทศกาลและสภาพอากาศชั่วคราว · ลดอาการกระตุก · จำกัดเฟรมเรตได้', 'Festivals and weather paused · less stutter · frame-rate cap']],
  ['v103', ['ระบบจดหมาย · อันดับหอคอยรายสัปดาห์ · ปีนหอคอยกับปาร์ตี้', 'Mail · weekly tower ranking · party tower climbs']],
  ['v102', ['หอคอยวายรา (ปีนไม่สิ้นสุด) · แก้อาวุธมือเดียว/สองมือ', 'The Vayra Tower · one- and two-handed weapons fixed']]];

mkWin('changelog', 'ประวัติอัปเดต', 'Update history', '', '<path d="M4 4h12v12H4z"/><path d="M7 8h6M7 11h6M7 14h4"/>', false);
WIN_RENDER.changelog = function(){
  const pane = el('pane-changelog'); if (!pane) return;
  pane.innerHTML = `<div class="clog">${CHANGELOG.map(([v, t], i) => `<div class="clrow${i === 0 ? ' new' : ''}"><b>${v}</b><p>${L(t[0], t[1])}</p></div>`).join('')}
    <p class="hint">${L('รายละเอียดทั้งหมดอยู่ใน docs/UPDATES.md', 'Full details are in docs/UPDATES.md')}</p></div>`;
};
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-clopen]')) openWin('changelog'); });
/* a link in the what's-new pop-up and a row in Settings */
if (typeof whatsNew === 'function'){ const _wn = whatsNew; whatsNew = function(){ const r = _wn.apply(this, arguments);   // (wnHTML is a const; the pop-up gets the link after it opens)
    const d = el('confirm'), ul = d && !d.hidden && d.querySelector('.wnl'); if (ul && !d.querySelector('[data-clopen]')) ul.insertAdjacentHTML('afterend', `<p style="margin-top:8px"><button class="btn sm" data-clopen="1">${L('ดูประวัติทั้งหมด', 'See every update')}</button></p>`);
    return r; }; }
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#confirm [data-clopen]')){ const c = el('confirm'); if (c) c.hidden = true; } }, true);
if (typeof renderSettings === 'function'){ const _rs = renderSettings;
  renderSettings = function(){ const r = _rs.apply(this, arguments); const pane = el('pane-settings'); if (pane && !el('clSet')) pane.insertAdjacentHTML('beforeend', `<div class="set" id="clSet"><span><b>${L('ประวัติอัปเดต', 'Update history')}</b><small>${L('ทุกเวอร์ชัน ใหม่สุดก่อน', 'Every version, newest first')}</small></span><button class="btn sm" data-clopen="1">${L('เปิด', 'Open')}</button></div>`); return r; }; }
{ const st = document.createElement('style'); st.textContent = `#win-changelog{width:min(560px,94vw)}.clog{display:flex;flex-direction:column;gap:6px;color:#1b1b1b;max-height:62vh;overflow-y:auto}
.clrow{display:grid;grid-template-columns:78px 1fr;gap:10px;padding:7px 10px;border-radius:10px;background:#fbf5e8;border:1.5px solid #ecdcb8}.clrow.new{background:#fff3cf;border-color:#e3b04b}
.clrow b{color:#7a3a14}.clrow p{margin:0;line-height:1.45}`; document.head.appendChild(st); }
