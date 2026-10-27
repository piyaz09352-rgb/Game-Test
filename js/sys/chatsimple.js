/* VAYRATHEN — js/sys/chatsimple.js — (v159) the chat window: only what players say, in a box that stays put
   The chat had grown tabs (ทั้งหมด · โลก · แผนที่ · ปาร์ตี้ · กิลด์ · ระบบ), a drag grip and grow/shrink buttons, and it
   carried game news: EXP from kills, items picked up, rare finds, boss cries, NPC lines. Now:
   · one list, no tabs: what players type (world, map, party, guild and whispers, each with its small tag), oldest at
     the top; the only other line is the answer to something you just tried to send ("you are not in a party")
   · no EXP, no items or rare finds, no boss or NPC speech, no Hall of Fame news in the chat
   · a fixed size and place: no drag grip, no grow / shrink buttons, and it no longer fades while idle; the – button
     still tucks it away and the chat button brings it back
   · the channel you send to is still picked in the box beside the text field */
'use strict';

const CHS = {H:120, sentAt:0};
if (typeof sendChat === 'function'){ const _sc = sendChat; sendChat = function(){ CHS.sentAt = Date.now(); return _sc.apply(this, arguments); }; }
const chsPlayer = c => !!c && typeof c.text === 'string' && (c.ch !== 'sys' ? !!c.who : (!c.who && c.at && Math.abs(c.at - CHS.sentAt) < 4000 && !c.text.startsWith('🏆')));
chatTab = 'all';
renderChat = function(){
  const box = el('chatLog'); if (!box || typeof NET === 'undefined' || !Array.isArray(NET.chat)) return;
  const rows = NET.chat.filter(chsPlayer).slice(-50), TAG = {all:['โลก', 'World'], map:['แผนที่', 'Map'], party:['ปาร์ตี้', 'Party'], guild:['กิลด์', 'Guild'], w:['กระซิบ', 'Whisper']};
  const atEnd = box.scrollHeight - box.scrollTop - box.clientHeight < 24;
  box.textContent = '';
  for (const c of rows){ const d = document.createElement('div'); d.className = `cl ch-${c.ch}${c.me ? ' me' : ''}`;
    if (TAG[c.ch]){ const t = document.createElement('span'); t.className = 'ctag'; t.textContent = L(...TAG[c.ch]); d.appendChild(t); }
    if (c.who){ const b = document.createElement('b'); b.textContent = c.who; d.appendChild(b); d.appendChild(document.createTextNode(': ')); }
    d.appendChild(document.createTextNode(c.text)); box.appendChild(d); }
  if (!rows.length){ const d = document.createElement('div'); d.className = 'cl cempty'; d.textContent = L('ข้อความจากผู้เล่นจะแสดงที่นี่', 'What players say shows here'); box.appendChild(d); }
  if (atEnd || rows.length && rows[rows.length - 1].me) box.scrollTop = box.scrollHeight;
  if (typeof chatNew === 'function') chsNew();
};
/* the unread count and the preview line on the tucked-away chat button count only player messages */
function chsNew(){
  if (typeof CHAT === 'undefined') return; const list = NET.chat.filter(chsPlayer), n = list.length;
  if (chatIsOpen()){ CHAT.seen = n; CHAT.unread = 0; chatShow(); return; }
  if (CHAT.seenP == null) CHAT.seenP = n;
  if (n > CHAT.seenP){ const last = list[n - 1]; if (!last.me) CHAT.unread += n - CHAT.seenP;
    const pv = el('chatPrev'); if (pv){ pv.textContent = (last.who ? last.who + ': ' : '') + last.text; pv.classList.add('on'); clearTimeout(CHAT.pvT); CHAT.pvT = setTimeout(() => pv.classList.remove('on'), 6000); } }
  CHAT.seenP = n; CHAT.seen = NET.chat.length; chatShow();
}
/* one height, always */
if (typeof setChatH === 'function'){ setChatH = function(){ CHAT.h = CHS.H; const lg = el('chatLog'); if (lg){ lg.style.height = CHS.H + 'px'; lg.style.display = ''; } }; }
if (typeof CHAT !== 'undefined') CHAT.h = CHS.H;
{ const st = document.createElement('style');
  st.textContent = `
html body .ui .chatbox .ctab,html body .ui .chatbox .cgrip,html body .ui .chatbox .csz:not(.cmin){display:none !important}
html body .ui .chatbox .ctabs{justify-content:flex-end;min-height:0;padding:2px 4px 0 !important;border:none !important;background:none !important}
html body .ui .chatbox #chatLog{height:${CHS.H}px !important;min-height:${CHS.H}px;max-height:${CHS.H}px}
html body .ui .chatbox.idle{background:linear-gradient(180deg,rgba(255,251,240,.92),rgba(250,238,212,.9)) !important;border-color:rgba(176,124,40,.45) !important;opacity:1 !important}
html body .ui .chatbox.idle *{opacity:1 !important}`;
  document.head.appendChild(st); }
if (typeof renderChat === 'function') try { renderChat(); } catch (e) {}
