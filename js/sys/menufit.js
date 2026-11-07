/* VAYRATHEN — js/sys/menufit.js — the open menu never covers the controls
   When the "เมนู" grid opens it used to run down over the skill buttons, the potion and util buttons and the
   joystick on a phone or tablet. Now, once it is open:
   · it widens to 4, then 5 icons a row (smaller tiles) when 3 a row would reach the controls below it;
   · if even that is too tall it stops just above them and scrolls inside;
   · tapping anywhere outside the menu folds it away again.
   Works with any layout, including buttons moved by the player (จัดตำแหน่งปุ่ม). */
'use strict';

const MFIT = {busy:false};
function menuObstacles(){
  const sel = '#mobaAct .mo, #mobaAct button, #mobaUtil .mo, #mobaUtil button, #mobaPot .mo, #mobaPot button, #joy, #chatBox, #chatBtn, #dock, #lootChip, .fishbtn, #restChip';
  return [...document.querySelectorAll(sel)].filter(e => !e.hidden && e.offsetParent !== null && e.offsetWidth > 0).map(e => e.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0);
}
function menuFit(){
  if (MFIT.busy) return; const rl = el('rail'), mn = rl && rl.querySelector('.menu'); if (!mn) return;
  MFIT.busy = true;
  try {
    const open = !rl.hidden && !rl.classList.contains('folded') && rl.offsetParent !== null;
    if (!open){ if (mn.style.maxHeight) mn.style.maxHeight = ''; mn.classList.remove('cols4', 'cols5', 'mscroll'); if (rl.classList.contains('mpop')){ rl.classList.remove('mpop'); mn.style.translate = ''; } return; }
    // (v89) on a phone or tablet the open menu pops up as a card, five icons a row (v250: under the menu button)
    if (el('ui').classList.contains('moba') || compactUI()){ menuPop(rl, mn); return; }
    if (rl.classList.contains('mpop')){ rl.classList.remove('mpop'); mn.style.translate = ''; }
    const ui = el('ui').getBoundingClientRect(), obs = menuObstacles(), gap = 8;
    const floorOf = () => { const M = mn.getBoundingClientRect();
      return {M, floor:obs.reduce((f, o) => (o.left < M.right && o.right > M.left && o.bottom > M.top + 24 ? Math.min(f, o.top - gap) : f), ui.bottom - gap)}; };
    mn.style.maxHeight = ''; mn.classList.remove('cols4', 'cols5', 'mscroll');
    let {M, floor} = floorOf();
    for (const c of ['cols4', 'cols5']){ if (M.bottom <= floor) break; mn.classList.remove('cols4', 'cols5'); mn.classList.add(c); ({M, floor} = floorOf()); }
    if (M.bottom > floor){ const k = (M.height / (mn.offsetHeight || 1)) || 1; mn.style.maxHeight = Math.max(110, Math.floor((floor - M.top) / k)) + 'px'; mn.classList.add('mscroll'); }
  } finally { MFIT.busy = false; }
}
function menuPop(rl, mn){
  const fresh = !rl.classList.contains('mpop'); rl.classList.add('mpop');
  mn.style.translate = ''; mn.style.maxHeight = ''; mn.classList.remove('cols4', 'cols5', 'mscroll');
  const ui = el('ui'), u = ui.getBoundingClientRect(), k = (u.height / (ui.offsetHeight || 1)) || 1;
  mn.style.setProperty('--mt', ui.offsetWidth >= 600 ? '90px' : '66px');   // (v250) wide enough for every whole name («สมุดนักผจญภัย», «สนับสนุนกาแฟ») when there is room
  const room = Math.floor(ui.offsetHeight * .84); if (mn.offsetHeight > room){ mn.style.maxHeight = room + 'px'; mn.classList.add('mscroll'); }
  // (v250) the card drops down under the «เมนู» button, as on a PC, instead of floating in the middle of the screen
  // over whatever window was open, cut off from the button that opened it; nudged back inside the screen if needed
  const M = mn.getBoundingClientRect(), pad = 8 * k;
  const dx = M.left < u.left + pad ? u.left + pad - M.left : M.right > u.right - pad ? u.right - pad - M.right : 0;
  const dy = M.bottom > u.bottom - pad ? Math.max(u.top + pad - M.top, u.bottom - pad - M.bottom) : 0;
  mn.style.translate = `${Math.round(dx / k)}px ${Math.round(dy / k)}px`;
  if (fresh){ mn.classList.remove('popin'); void mn.offsetWidth; mn.classList.add('popin'); }
}
{ const _sr = setRail; setRail = function(f){ const r = _sr.apply(this, arguments); setTimeout(menuFit, 0); return r; }; }
{ const _lh = layoutHud; layoutHud = function(){ const out = _lh.apply(this, arguments); menuFit(); return out; }; }
window.addEventListener('resize', () => setTimeout(menuFit, 120));
/* a tap outside the open menu folds it */
document.addEventListener('pointerdown', e => {
  const rl = el('rail'); if (!rl || rl.classList.contains('folded') || RAIL.fold) return;
  if (e.target.closest && e.target.closest('#rail')) return;
  setRail(true);
}, true);
/* the pop-up: a card of its own above everything, under the menu button, springing up once as it opens */
{ const st = document.createElement('style'); st.textContent = `
  .ui .rail.mpop{z-index:90!important}
  .ui .rail.mpop:not(.folded) .menu{position:absolute!important;top:100%;right:0;margin:0!important;z-index:60;padding:10px;border-radius:16px;background:var(--panel,#fffaf0);box-shadow:0 10px 34px rgba(60,40,10,.35),0 0 0 2px rgba(227,176,75,.75)}
  #ui .rail.mpop:not(.folded) .menu{grid-template-columns:repeat(5,var(--mt,62px))!important;gap:6px!important}
  #ui .rail.mpop:not(.folded) .menu .mb{width:100%!important;max-width:none!important;height:52px!important}
  #ui .rail.mpop:not(.folded) .menu .mb .tip{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ui .rail.mpop .menu.mscroll{overflow-y:auto}
  .ui .rail.mpop:not(.folded) .menu{top:calc(100% + 6px)!important;transform-origin:top right}
  .ui .rail.mpop .menu.popin{animation:mpopin .18s ease-out}
  @keyframes mpopin{from{scale:.9}to{scale:1}}`; document.head.appendChild(st); }
