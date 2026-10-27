/* VAYRATHEN — js/sys/chatfix.js — (v141) the chat window: readable, and "ทั้งหมด" really shows everything that matters
   Found while checking the chat window on PC and phone:
   · the System tab's lines were coloured for the old dark panel (pale blue, pale yellow…) — on today's light panel
     they were nearly invisible;
   · the "ทั้งหมด" (All) tab left out the game's own lines (level up, quests, achievements, rare finds): offline it was
     an empty box, online you had to switch tab to see what just happened to you;
   · an empty tab was a blank panel with no word of what would appear there.
   The usual MMO pattern: one "All" stream mixing chat and the important system lines (dimmed, so talk still stands
   out), separate tabs to filter, and the noisy lines (every EXP gain, every pickup) only in the System tab.
   Now: dark, readable colours on the light panel · "ทั้งหมด" mixes chat with the important system lines in time
   order (EXP and pickups stay in "ระบบ") · every empty tab says what will show there. */
'use strict';

/* (v143) a boss's battle cries ("ยักษ์ทศพักตร์: หนีไปไหนก็ไม่พ้น!!!") already show in a speech bubble over the boss: in
   "ทั้งหมด" they buried the chat (a long fight shouts every few seconds), so they stay in "ระบบ" only */
const CHF_BOSSN = new Set(); let CHF_BN = 0;
function chfBossLine(c){ if (!c || c.cls !== 'r' || typeof c.text !== 'string') return false; const i = c.text.indexOf(': '); if (i < 1 || i > 48) return false;
  if (!CHF_BN && typeof MOB !== 'undefined'){ CHF_BN = 1; for (const m of Object.values(MOB)) if (m && m.boss){ try { CHF_BOSSN.add(nm(m)); } catch (e) {} if (m.name) CHF_BOSSN.add(m.name); if (m.en) CHF_BOSSN.add(m.en); } CHF_BOSSN.add('ราหูอสูรจันทรคราส'); }
  return CHF_BOSSN.has(c.text.slice(0, i)); }
// (v144) items found (cards, drops, pickups, money) are not news for the chat either: they stay in "ระบบ"
const CHF_ITEM = /^(ได้|เก็บ|ดรอป|Got|Picked|Found)\b|Card|การ์ด|ไอเทม|เบี้ย|ดรอป|◈/i;
const CHF = {important:c => { if (chfBossLine(c)) return false; const k = typeof sysCat === 'function' ? sysCat(c) : 'etc';
  const t = c.text || '', lvl = /Level|เลเวล|เปลี่ยนอาชีพ|Job/i.test(t);   // level ups and class changes are news (they sit in the EXP group)
  if (lvl) return true; if (k === 'item' || k === 'money' || k === 'exp' || CHF_ITEM.test(t)) return false; return k === 'etc' || c.cls === 'g'; }};
/* (v144) the channel tabs (โลก · แผนที่ · ปาร์ตี้ · กิลด์) are for what players say there: no item finds, no boss lines, no
   other game news — only GM announcements, the Hall of Fame news, and the answer to something you just tried to send
   ("you are not in a party"…) */
const CHF_SEND = {t:0};
if (typeof sendChat === 'function'){ const _sc = sendChat; sendChat = function(){ CHF_SEND.t = Date.now(); return _sc.apply(this, arguments); }; }
const chfKeep = c => c.ch !== 'sys' || c.who === '[GM]' || (typeof c.text === 'string' && c.text.startsWith('🏆')) || (c.at && Math.abs(c.at - CHF_SEND.t) < 4000);
{ const _rc = renderChat;
  renderChat = function(){
    if (typeof chatTab !== 'undefined' && chatTab !== 'all' && chatTab !== 'sys' && typeof NET !== 'undefined' && Array.isArray(NET.chat)){
      const real = NET.chat; NET.chat = real.filter(chfKeep);
      try { return chatEmpty(_rc.apply(this, arguments)); } finally { NET.chat = real; } }
    if (typeof chatTab === 'undefined' || chatTab !== 'all' || typeof NET === 'undefined' || !Array.isArray(NET.chat) || typeof SYSC === 'undefined') return chatEmpty(_rc.apply(this, arguments));
    const real = NET.chat, extra = SYSC.filter(CHF.important).slice(-15).map(c => ({ch:'sys', who:'', text:c.text, at:c.at || 0, local:true}));
    NET.chat = real.concat(extra).sort((a, b) => (a.at || 0) - (b.at || 0));
    try { return chatEmpty(_rc.apply(this, arguments)); } finally { NET.chat = real; }
  }; }
function chatEmpty(r){ const box = el('chatLog'); if (box && !box.children.length){ const d = document.createElement('div'); d.className = 'cl cempty';
    const t = typeof chatTab !== 'undefined' ? chatTab : 'all';
    d.textContent = t === 'party' ? L('ข้อความในปาร์ตี้จะแสดงที่นี่', 'Party messages show here') : t === 'guild' ? L('ข้อความในกิลด์จะแสดงที่นี่', 'Guild messages show here')
      : t === 'map' ? L('ข้อความจากคนในแผนที่นี้จะแสดงที่นี่', 'Messages from players on this map show here') : t === 'world' ? L('ข้อความจากทุกแผนที่จะแสดงที่นี่', 'Messages from every map show here')
      : L('แชทและข่าวสำคัญของคุณ (เลเวลอัป เควสต์ ความสำเร็จ) จะแสดงที่นี่ · EXP และของที่เก็บ ดูที่แท็บ "ระบบ"', 'Chat and your important news (level ups, quests, achievements) show here · EXP and pickups are in the System tab');
    box.appendChild(d); } return r; }
/* a new important system line shows in "ทั้งหมด" straight away */
if (typeof sysMsg === 'function'){ const _sm = sysMsg; sysMsg = function(text, cls){ const r = _sm.apply(this, arguments);
    if (typeof chatTab !== 'undefined' && chatTab === 'all' && typeof renderChat === 'function' && SYSC.length && CHF.important(SYSC[SYSC.length - 1])) renderChat(); return r; }; }
{ const st = document.createElement('style'); st.textContent = `
html body #chatLog .cl{color:#2a2418}
html body #chatLog .ch-sys{color:#6a5430!important;background:rgba(255,240,205,.55)!important;font-weight:600!important;font-size:.92em}
html body #chatLog .ch-me{color:#3a4a6a}html body #chatLog .sc-exp{color:#8a5a00}html body #chatLog .sc-g{color:#17794e}html body #chatLog .sc-r{color:#b8322a}html body #chatLog .sc-c{color:#6a32b0}html body #chatLog .sc-sys{color:#5a6478}
html body #chatLog .cempty{color:#8a7a5a;font-style:italic;text-align:center;padding:10px 6px}`; document.head.appendChild(st); }
