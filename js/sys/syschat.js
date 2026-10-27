/* VAYRATHEN — js/sys/syschat.js — the chat window's "ระบบ" (System) tab
   Everything about YOU goes here instead of floating over the monsters: EXP and Job EXP from each kill, items you
   pick up, Bia, level-ups, quests and the rest of the game log. It keeps its own list (80 lines), so it never
   pushes real chat out, never counts as unread and never pops the preview line. The chat window is available
   offline too, so the System tab always works. */
'use strict';

const SYSC = [], SYSF = {f:'all'};
/* (v27) filter chips: everything · EXP · items · money · the rest */
const SYS_CATS = [['all', 'ทั้งหมด', 'All'], ['exp', 'EXP', 'EXP'], ['item', 'ไอเท็ม', 'Items'], ['money', 'เงิน', 'Money'], ['etc', 'อื่น ๆ', 'Other']];
function sysCat(c){ const t = c.text;
  if (c.cls === 'exp' || /EXP|Job Level|Base Level|เลเวล|Level up/i.test(t)) return 'exp';
  if (/เหรียญ|เบี้ย|Bia|Coin|Bia/i.test(t)) return 'money';
  if (/เก็บ|Picked up|การ์ด|Card|ไอเท็ม|Gear|สว่าน|Drill|ได้รับ|Got /i.test(t)) return 'item';
  return 'etc'; }
const sysPlain = s => (typeof bannerText === 'function' ? bannerText(s) : String(s).replace(/<[^>]*>/g, ''));
function sysMsg(text, cls = ''){
  const t = sysPlain(text).trim(); if (!t) return;
  SYSC.push({text:t, cls, at:Date.now(), tm:new Date().toTimeString().slice(0, 5)}); if (SYSC.length > 80) SYSC.shift();
  if (typeof chatTab !== 'undefined' && chatTab === 'sys' && typeof renderChat === 'function') renderChat();
}
/* every line of the game log is a system line too */
{ const _log = log; log = function(s, cls){ const r = _log.apply(this, arguments); try { sysMsg(s, cls); } catch (e) {} return r; }; }
/* EXP: one line per kill in the System tab, nothing over the monster */
EV.on('kill', m => {
  if (!m || !m.def || m.dummy || (m.wb && typeof wbEligible === 'function' && !wbEligible())) return;
  const d = m.def, nmul = isEvent() ? EVENT_MUL : 1;
  const be = Math.round(d.exp * RATE * nmul * (m.minion ? .3 : 1) * (S.pet ? 1 + MOVES.pet.expBonus + (DER.pas.petExp || 0) : 1)), je = Math.round(d.jexp * JRATE * nmul * (m.minion ? .3 : 1));
  if (be || je) sysMsg(L(`${nm(d)}: EXP +${be.toLocaleString()} · Job +${je.toLocaleString()}`, `${nm(d)}: EXP +${be.toLocaleString()} · Job +${je.toLocaleString()}`), 'exp');
});
/* the tab, and the list it shows */
{ const tabs = document.querySelector('#chatBox .ctabs'), first = tabs && tabs.querySelector('.csz');
  if (tabs && !tabs.querySelector('[data-ctab="sys"]')){ const b = document.createElement('button'); b.className = 'ctab'; b.dataset.ctab = 'sys'; b.textContent = L('ระบบ', 'System'); tabs.insertBefore(b, first || null); } }
{ const _rc = renderChat;
  renderChat = function(){
    const box = el('chatLog'); let bar = el('sysfBar');
    if (box && !bar){ bar = document.createElement('div'); bar.id = 'sysfBar'; bar.className = 'sysf'; box.parentNode.insertBefore(bar, box); }
    if (bar) bar.hidden = chatTab !== 'sys';
    try { const on = document.querySelector('#chatBox .ctab.on'), row = on && on.parentNode; if (row && row.scrollWidth > row.clientWidth) row.scrollLeft = Math.max(0, on.offsetLeft - row.clientWidth / 2 + on.offsetWidth / 2); } catch (e) {}   // the chosen tab stays in view on a phone
    if (chatTab !== 'sys') return _rc.apply(this, arguments);
    if (!box) return;
    const rows = SYSC.concat((typeof NET !== 'undefined' ? NET.chat : []).filter(c => c.ch === 'sys').map(c => ({text:c.text, cls:'sys', at:c.at || 0}))).sort((a, b) => a.at - b.at).slice(-60);
    box.textContent = ''; bar.textContent = '';
    for (const [k, th, en] of SYS_CATS){ const b = document.createElement('button'); b.type = 'button'; b.dataset.sysf = k; b.className = SYSF.f === k ? 'on' : ''; b.textContent = L(th, en); bar.appendChild(b); }
    for (const c of rows){ if (SYSF.f !== 'all' && sysCat(c) !== SYSF.f) continue; const d = document.createElement('div'); d.className = `cl ch-me${c.cls ? ' sc-' + c.cls : ''}`; d.textContent = c.text; box.appendChild(d); }
    if (!rows.length){ const d = document.createElement('div'); d.className = 'cl ch-me'; d.textContent = L('ข้อความระบบของคุณจะแสดงที่นี่: EXP ไอเท็ม เงิน เลเวล เควสต์', 'Your system messages show here: EXP, items, Bia, levels, quests'); box.appendChild(d); }
    box.scrollTop = box.scrollHeight;
  };
}
/* the chat window works offline too (System tab), and system lines never count as unread */
if (typeof chatShow === 'function'){
  chatShow = function(){
    const cb = el('chatBox'), bt = el('chatBtn'); if (!cb || !bt) return;
    const open = chatIsOpen(); cb.hidden = !open; bt.hidden = open;
    if (open){ CHAT.unread = 0; CHAT.seen = NET.chat.length; }
    el('chatBadge').hidden = !CHAT.unread; el('chatBadge').textContent = CHAT.unread > 99 ? '99+' : String(CHAT.unread);
  };
}
{ const st = document.createElement('style');
  st.textContent = `#chatLog .ch-me{color:#cfe3ff}#chatLog .sc-exp{color:#ffe08a}#chatLog .sc-g{color:#9ff0c8}#chatLog .sc-r{color:#ff9a8a}#chatLog .sc-c{color:#d8b8ff}#chatLog .sc-sys{color:#b8c4d8}`;
  document.head.appendChild(st); }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-sysf]'); if (!b) return; e.stopPropagation(); SYSF.f = b.dataset.sysf; renderChat(); }, true);
{ const st = document.createElement('style');
  st.textContent = `#sysfBar.sysf{display:flex;gap:3px;flex-wrap:wrap;padding:3px 2px 3px}#sysfBar[hidden]{display:none}
  #sysfBar button{font:600 10.5px/1 var(--display,sans-serif);padding:3px 7px;border-radius:8px;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.35);color:#dfe8f8;cursor:pointer}
  #sysfBar button.on{background:#ffd34a;color:#3a2400;border-color:#fff}
  @media (max-width:900px){#chatBox .ctabs{overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap}#chatBox .ctabs::-webkit-scrollbar{display:none}#chatBox .ctabs .ctab{flex:0 0 auto;padding:2px 7px;white-space:nowrap}#chatBox .ctabs .csz{flex:0 0 auto}}`;
  document.head.appendChild(st); }
