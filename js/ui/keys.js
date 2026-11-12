/* VAYRATHEN — js/ui/keys.js — (v100) one keyboard for every layout, and one list of keys
   · Keys are read by WHERE they sit on the keyboard (e.code), not by the letter they type (e.key). With the Thai
     layout on, A types "ฟ", 1 types "ๅ", 2 types "/" and 3 types "-": the old shortcuts read the letter, so in Thai
     nothing worked and number keys opened the guide or zoomed out. keyOf(e) gives the same name ('a', '1', '-')
     whichever language the keyboard is in. Phone keyboards that send no position fall back to the letter.
   · typing(e): a text box, a list, a text area or an editable area has focus, or a Thai/IME word is still being
     composed. Every shortcut stands aside then, so typing in chat or a search box never moves or opens anything.
   · KEYMAP is the single list of shortcuts. The guide (?) is drawn from it, so what it says is what the keys do. */
'use strict';

const KEY_CODE = {Space:' ', Minus:'-', Equal:'=', Slash:'/', NumpadAdd:'+', NumpadSubtract:'-', NumpadEnter:'enter', Enter:'enter', Escape:'escape', Tab:'tab',
  ArrowUp:'arrowup', ArrowDown:'arrowdown', ArrowLeft:'arrowleft', ArrowRight:'arrowright'};
function keyOf(e){
  const c = e.code || '';
  if (/^Key[A-Z]$/.test(c)) return c.slice(3).toLowerCase();
  if (/^(Digit|Numpad)[0-9]$/.test(c)) return c.slice(-1);
  if (KEY_CODE[c]) return KEY_CODE[c];
  if (/^F\d{1,2}$/.test(c)) return c.toLowerCase();
  return String(e.key || '').toLowerCase();   // no position (some phone keyboards): the letter typed
}
const typing = e => !!(e.isComposing || e.keyCode === 229 || (e.target && e.target.closest && e.target.closest('input,select,textarea,[contenteditable=""],[contenteditable="true"]')));
const plainKey = e => !(e.ctrlKey || e.metaKey || e.altKey);

/* [keys shown, Thai, English] — keep in step with js/ui/input.js and the handlers named beside each line */
const KEYMAP = [
  [['คลิก|Click'], 'เดิน · คลิกมอนสเตอร์เพื่อโจมตี · คลิก NPC เพื่อคุย', 'Walk · click a monster to attack · click an NPC to talk'],
  [['1–8'], 'Skill (1–6) และยา (7–8) ในแถบลัด', 'Skills (1–6) and potions (7–8) on the hotbar'],
  [['R'], 'ขี่/ลงพาหนะ เร็วขึ้น 70%', 'Mount/dismount, 70% faster'],
  [['T'], 'จับมอนสเตอร์ที่ HP ไม่เกิน 30% มาเป็น Pet', 'Capture a monster at 30% HP or less as a pet'],
  [['X'], 'นั่งพับเพียบ ฟื้น HP/SP เร็วขึ้น 2 เท่า', 'Sit, recover HP/SP twice as fast'],
  [['Z'], 'เก็บของที่ใกล้ที่สุด', 'Pick up the nearest loot'],
  [['Tab'], 'เลือกมอนตัวถัดไป · Shift+Tab ยกเลิกเป้า', 'Target the next monster · Shift+Tab clears it'],               // js/sys/tlock.js
  [['B'], 'เปิด/ปิด Auto · Shift+B ตั้งค่า Auto', 'Auto on/off · Shift+B Auto settings'],
  [['W', 'A', 'S', 'D'], 'เดิน (เหมือนปุ่มลูกศร)', 'Move (like the arrow keys)'],
  [['C', 'K', 'E', 'Q'], 'สถานะ · Skill · กระเป๋า · อุปกรณ์', 'Status · Skills · Bag · Equipment'],
  [['J', 'M', 'N', 'L'], 'เควสต์ · แผนที่โลก · ผู้เล่นออนไลน์ · บันทึก', 'Quests · World map · Players online · Log'],
  [['F1', 'Y', 'G', 'I'], 'วิกิ · ความสำเร็จและฉายา · กิลด์ · หลอมของ', 'Wiki · Achievements & titles · Guild · Crafting'],
  [['F', 'P', 'U', 'Alt+Z'], 'เพื่อน · สนามประลอง · ตลาดผู้เล่น · ปาร์ตี้', 'Friends · Arena · Player market · Party'],   // Alt+Z: js/sys/party.js
  [['O', '?'], 'ตั้งค่า · คู่มือนี้', 'Settings · this guide'],
  [['V', 'F2'], 'วงล้ออีโมต · โหมดถ่ายรูป', 'Emote wheel · photo mode'],                                                       // js/sys/cosx.js
  [['Enter'], 'เปิดแชต · Enter อีกครั้งเพื่อส่ง (ช่องว่าง = ปิดแชต) · Esc ออกจากช่องแชต', 'Open chat · Enter again sends (empty = closes the chat) · Esc leaves the chat box'],  // js/ui/hud.js, js/net/online.js
  [['↑', '↓', '←', '→'], 'เดินด้วยปุ่มลูกศร (หรือ W A S D)', 'Move with the arrows (or W A S D)'],
  [['H'], 'ซ่อน/แสดง UI ทั้งหมด', 'Hide/show all UI'],
  [['Esc'], 'ปิดหน้าต่างบนสุด', 'Close the top window'],
  [['+', '−'], 'ซูมเข้า/ออก · ล้อเมาส์ · บีบนิ้ว', 'Zoom in/out · mouse wheel · pinch']];
const kbdHTML = k => { const [th, en] = k.split('|'); return `<kbd>${en ? `<span data-th="${th}" data-en="${en}">${L(th, en)}</span>` : escH(k)}</kbd>`; };
function keysHelpHTML(){
  return KEYMAP.map(([ks, th, en]) => `<dt>${ks.map(kbdHTML).join(' ')}</dt><dd><span data-th="${escH(th)}" data-en="${escH(en)}">${escH(L(th, en))}</span></dd>`).join('')
    + `<dt></dt><dd><small><span data-th="ปุ่มลัดใช้ได้ทั้งแป้นไทยและอังกฤษ ไม่ต้องสลับภาษา · ระหว่างพิมพ์ในช่องข้อความ ปุ่มลัดจะหยุดทำงาน" data-en="Shortcuts work with the Thai or English layout, no need to switch · they pause while you type in a text box">${L('ปุ่มลัดใช้ได้ทั้งแป้นไทยและอังกฤษ ไม่ต้องสลับภาษา · ระหว่างพิมพ์ในช่องข้อความ ปุ่มลัดจะหยุดทำงาน', 'Shortcuts work with the Thai or English layout, no need to switch · they pause while you type in a text box')}</span></small></dd>`;
}
{ const dl = document.querySelector('#win-help dl.keys'); if (dl) dl.innerHTML = keysHelpHTML(); }
