/* VAYRATHEN — js/ui/startq272.js — (v272) one thing at a time when you come into the game
   On entering, the login-reward window, the tutorial card, "what's new" and achievement cards all came up at once in
   the middle of the screen (on a phone they covered nearly all of it). Now: the login reward first, on its own; then
   "what's new"; the tutorial card and achievement cards wait out of sight while either is open, then appear. */
'use strict';
const sq272Busy = () => { const w = document.getElementById('win-login'), c = document.getElementById('confirm'); return !!((w && !w.hidden) || (c && !c.hidden)); };
// "what's new" waits for the login-reward window (it already waited for other confirm boxes)
if (typeof whatsNew === 'function'){ const _wn = whatsNew; whatsNew = function(force){ const w = document.getElementById('win-login'); if (!force && w && !w.hidden) return; return _wn.apply(this, arguments); }; }
// achievement cards wait their turn (the queue keeps them)
if (typeof achPop === 'function'){ const _ap = achPop; achPop = function(){ if (sq272Busy()){ clearTimeout(achPop._w); achPop._w = setTimeout(() => achPop(), 900); return; } return _ap.apply(this, arguments); }; }
// the tutorial card steps aside while a startup window is open
{ const st = document.createElement('style'); st.textContent = 'html body #ui.sq-busy #tutBox{visibility:hidden !important}'; document.head.appendChild(st);
  setInterval(() => { const ui = document.getElementById('ui'); if (ui) ui.classList.toggle('sq-busy', sq272Busy()); }, 250); }
