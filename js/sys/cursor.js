/* VAYRATHEN — js/sys/cursor.js — game cursors, pick up by pointing, and a pick-up button on touch
   · A gold game cursor everywhere; over a monster it turns into a sword, over a drop into a grabbing hand, over an
     NPC into a speech bubble, and over buttons into a gold pointing hand.
   · Mouse: pointing at a drop shows the grabbing hand; click (or tap) it and your hero walks over and picks it up
     (v94: pointing alone no longer sends the hero, the owner's choice).
   · Joystick (touch): a "เก็บ" button beside Ride/Capture/Sit/Auto picks up the nearest drop; it shows how many
     drops are close by. Z still works on a keyboard. */
'use strict';

const CUR_SVG = {
  arrow:`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M3 2l20 11-9 2.2L10 25z" fill="#ffd66a" stroke="#3a1c08" stroke-width="2" stroke-linejoin="round"/><path d="M6 6l12 7-6 1.4" fill="none" stroke="#fff6d0" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  hand:`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M11 3.5a2 2 0 0 1 4 0V13l1-.2V9.5a2 2 0 0 1 4 0V14l.8-.1V12a2 2 0 0 1 4 0v7.5c0 5-3.2 9-8.5 9S8 25 6.5 21.5L3.6 15a2 2 0 0 1 3.4-2l2.8 3.6.2-.1z" fill="#ffd66a" stroke="#3a1c08" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  grab:`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M8 13a2 2 0 0 1 4 0v-1a2 2 0 0 1 4 0v.5a2 2 0 0 1 4 0V14a2 2 0 0 1 4 0v6c0 5-3 8.5-8 8.5S7.5 25.5 6.5 22L5 17.5A2 2 0 0 1 8.5 16z" fill="#9ff0c8" stroke="#0e3a24" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 2.5v5M12.5 5l3.5 3.5L19.5 5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  sword:`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M3 3l4 .5L22 18.5l-3 3L4 6.5z" fill="#e8f0ff" stroke="#1c2440" stroke-width="1.8" stroke-linejoin="round"/><path d="M17 24l7-7M21 21l5 5" stroke="#3a1c08" stroke-width="3.4" stroke-linecap="round"/><path d="M17 24l7-7" stroke="#ffd66a" stroke-width="2" stroke-linecap="round"/><path d="M21 21l5 5" stroke="#b8501c" stroke-width="2" stroke-linecap="round"/></svg>`,
  talk:`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M3 2l14 8-6.5 1.6L8 19z" fill="#ffd66a" stroke="#3a1c08" stroke-width="1.8" stroke-linejoin="round"/><rect x="14" y="13" width="16" height="12" rx="5" fill="#fff6e0" stroke="#3a1c08" stroke-width="1.6"/><path d="M18 25l-1 4 4-4" fill="#fff6e0" stroke="#3a1c08" stroke-width="1.4" stroke-linejoin="round"/><circle cx="18.5" cy="19" r="1.3" fill="#3a1c08"/><circle cx="22" cy="19" r="1.3" fill="#3a1c08"/><circle cx="25.5" cy="19" r="1.3" fill="#3a1c08"/></svg>`
};
const CUR_HOT = {arrow:[3, 2], hand:[12, 3], grab:[16, 14], sword:[3, 3], talk:[3, 2]};
const CUR_FB = {arrow:'default', hand:'pointer', grab:'grab', sword:'crosshair', talk:'pointer'};
const curOf = k => `url("data:image/svg+xml,${encodeURIComponent(CUR_SVG[k])}") ${CUR_HOT[k][0]} ${CUR_HOT[k][1]}, ${CUR_FB[k]}`;
{
  const st = document.createElement('style');
  st.textContent = `body,.app,canvas#cv{cursor:${curOf('arrow')}}
    button:not(:disabled),.btn:not(:disabled),.mb,.hk,a,label.set,select,[role=tab],[data-bagsel],[data-win-open],summary,.mo,.mu{cursor:${curOf('hand')}!important}
    input[type=text],input:not([type]),input[type=number],input[type=search],textarea{cursor:text!important}
    .wt{cursor:grab!important}`;
  document.head.appendChild(st);
}
let curNow = '';
const curSet = k => { if (curNow === k) return; curNow = k; cv.style.cursor = curOf(k); };
const npcAtPt = p => NPCS.find(n => Math.hypot(p.x - n.x, p.y - (n.y - 22)) < 22);
cv.addEventListener('pointermove', e => {
  const p = worldPt(e);
  curSet(hoverMob ? 'sword' : hoverLoot ? 'grab' : npcAtPt(p) ? 'talk' : 'arrow');   // (v94) pointing only shows the hand; a click or tap picks it up (input.js)
});
cv.addEventListener('pointerleave', () => { curNow = ''; });

/* the touch pick-up button */
const LOOT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V8a1.6 1.6 0 0 1 3.2 0v2M10.2 10V6.5a1.6 1.6 0 0 1 3.2 0V10M13.4 10V7.5a1.6 1.6 0 0 1 3.2 0V12M16.6 11a1.6 1.6 0 0 1 3.2 0v3.5c0 4-2.6 7-6.6 7S7.5 19.5 6.6 17L5 13.4a1.6 1.6 0 0 1 2.8-1.5L9 13.5"/></svg>';
const lootNear = () => { let n = 0; for (const l of LOOT) if (dist(l, P) < 120) n++; return n; };
function lootGrab(){
  const l = nearestLoot(); if (!l){ toast(L('ไม่มีของใกล้ ๆ', 'Nothing to pick up nearby')); return; }
  if (typeof botPauseFromManual === 'function') botPauseFromManual();
  P.loot = l; P.target = null; P.npc = null; P.tx = null; P.sit = false; P.pending = null;
}
{ const _ma = mobaAction; mobaAction = function(kind){ if (kind === 'loot'){ if (!P.dead && !PAUSED) lootGrab(); return; } return _ma.apply(this, arguments); }; }
{ const _rm = renderMoba;
  renderMoba = function(){ const r = _rm.apply(this, arguments); const u = el('mobaUtil');
    if (u && !u.querySelector('[data-mo="loot"]')) u.insertAdjacentHTML('afterbegin', `<button class="mu lootb" data-mo="loot" aria-label="${L('เก็บของ', 'Pick up')}">${LOOT_ICON}<em class="lootn" hidden></em></button>`);
    return r; };
}
let lootNT = 0;
EV.on('tick', dt => { lootNT -= dt; if (lootNT > 0) return; lootNT = .25;
  const b = document.querySelector('#mobaUtil .lootb em'); if (!b) return; const n = lootNear(); b.hidden = !n; if (n) b.textContent = n > 9 ? '9+' : n;
  b.parentElement.classList.toggle('on', n > 0); });
{
  const st = document.createElement('style');
  st.textContent = `.mu.lootb{position:relative}.mu.lootb.on{color:#9ff0c8;box-shadow:0 0 10px rgba(120,240,180,.55)}
    .mu.lootb em{position:absolute;right:-4px;top:-4px;min-width:15px;height:15px;padding:0 3px;border-radius:8px;background:#1aa860;color:#fff;font:700 10px/15px var(--body);font-style:normal;text-align:center}`;
  document.head.appendChild(st);
}
