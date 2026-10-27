/* VAYRATHEN — js/sys/dmgclear.js — nothing covers the damage numbers (v60)
   In a busy boss fight the numbers were hidden behind the boss's shout bubble and the tall name plates (title,
   name, guild) of you and the players around you. Now:
   · the boss's shout sits under the target frame at the top, one compact line, and goes after 2.5 s,
     instead of beside the boss's head where the numbers fly
   · while you are fighting (a hit in the last 3 s), every hero's name plate turns see-through, and comes back
     once the fight is over
   · damage numbers are drawn above everything else on the picture, as before. */
'use strict';

const DCL = {hitT:-99};
{ const _at = addText; addText = function(x, y, s){ if (/\d/.test(String(s))) DCL.hitT = T; return _at.apply(this, arguments); }; }
const dclFight = () => T - DCL.hitT < 3;

/* name plates fade in a fight */
{ const _hn = heroName;
  heroName = function(){ if (!dclFight()) return _hn.apply(this, arguments);
    const c = typeof MAINCTX !== 'undefined' ? MAINCTX : ctx, a = c.globalAlpha; c.globalAlpha = a * .3;
    try { return _hn.apply(this, arguments); } finally { c.globalAlpha = a; } }; }

/* the boss's shout: under the target frame, centred, short */
if (typeof shoutPlace === 'function'){
  shoutPlace = function(){
    const e = SHOUT.el, ui = el('ui'); if (!e || !ui) return;
    e.style.visibility = ''; e.classList.add('top'); e.classList.remove('lf');
    e.style.left = Math.round(Math.max(6, (ui.offsetWidth - e.offsetWidth) / 2)) + 'px'; e.style.top = shoutTop() + 'px';
  };
  const _bs = bossShout;
  bossShout = function(){ const r = _bs.apply(this, arguments); SHOUT.t = Math.min(SHOUT.t, T + 2.5); return r; };
  const st = document.createElement('style');
  st.textContent = `#bossShout.top{max-width:min(420px,80vw);padding:4px 10px;align-items:center}
  #bossShout.top::before,#bossShout.top::after{display:none}
  #bossShout.top .bsf{font-size:16px}
  #bossShout.top .bsq{font-size:12.5px}`;
  document.head.appendChild(st);
}
