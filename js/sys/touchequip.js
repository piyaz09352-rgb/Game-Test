/* VAYRATHEN — js/sys/touchequip.js — (v110) wearing gear on a phone
   The problem: on a touch screen a tap on a bag item opened the floating item card (itemtip.js), which covers much
   of the window; the only "สวม" button was a small one (≈27×19 px) in the detail strip under the bag, often under
   that card, and a double tap does not reach the game as a double-click on phones. So gear could not be put on.
   How mobile RPGs do it: a tap on an item opens its card WITH the actions on it (Equip / Use), big enough for a thumb
   (44 px or more), a second tap on the same item does the main action, and tapping outside closes the card.
   Here, on touch screens:
   · a tap on a bag item shows its card with a big action bar: สวมใส่ (gear) / ใช้ (potions, food) / ปิด;
   · a quick second tap (within half a second) on the same bag item does that action at once (the old double-click);
   · the small "สวม" / "ใช้" buttons under the bag are made thumb-sized too.
   Uses the game's own [data-wear] / [data-use] actions, so every rule (level, hands, shields, ammo) still applies. */
'use strict';

const TE = {bag:false, last:{id:null, t:0}};
const teTouch = () => typeof GFX !== 'undefined' && GFX.touch || matchMedia('(pointer:coarse)').matches;
function teAct(id){
  const it = ITEMS[id]; if (!it || !(S.inv[id] > 0)) return null;
  if (it.kind === 'use') return {k:'use', th:'ใช้', en:'Use', ok:true};
  if (it.kind === 'gear') return {k:'wear', th:'สวมใส่', en:'Wear', ok:S.lvl >= (it.lv || 0)};
  if (it.kind === 'ammo' && S.gear.ammo !== id && typeof usesArrows === 'function' && usesArrows()) return {k:'wear', th:'ใส่ลูกธนู', en:'Load', ok:S.lvl >= (it.lv || 0)};
  return null;
}
function teDo(id){
  const a = teAct(id); if (!a || !a.ok) return false;
  const b = document.createElement('button'); b.dataset[a.k] = id; b.hidden = true; document.body.appendChild(b); b.click(); b.remove();   // the game's own handler
  if (typeof itHide === 'function') itHide();
  if (typeof renderBag === 'function') renderBag();
  return true;
}
/* touches: remember whether this one started on a bag item; a second quick tap on the same item acts;
   a touch on the card's own buttons must not let itemtip.js close the card first */
document.addEventListener('touchstart', e => {
  const t = e.target; if (!t || !t.closest) return;
  if (t.closest('#itTip .tebar')){ e.stopPropagation(); return; }
  const s = t.closest('[data-bagsel]'); TE.bag = !!s;
  if (s && BAG.tab !== 'card'){ const id = s.dataset.bagsel, now = e.timeStamp || performance.now();   // (v132) when the finger touched, not when the busy page got round to it
    if (TE.last.id === id && now - TE.last.t < 500){ TE.last = {id:null, t:0}; if (teDo(id)){ e.stopPropagation(); e.preventDefault && e.cancelable && e.preventDefault(); } return; }
    TE.last = {id, t:now}; }
}, {capture:true, passive:false});
/* the card from a bag tap gets the action bar */
if (typeof itShow === 'function'){
  const _show = itShow;
  itShow = function(id, x, y, src){
    const r = _show.apply(this, arguments), tip = el('itTip'); if (!tip) return r;
    const old = tip.querySelector('.tebar'), want = src === 'touch' && TE.bag && teTouch() && teAct(id);
    if (!want){ if (old){ old.remove(); ITIP.w = tip.offsetWidth; ITIP.h = tip.offsetHeight; } return r; }
    if (!old){ const a = teAct(id);
      tip.insertAdjacentHTML('beforeend', `<div class="tebar"><button class="btn gold" data-teact="${escH(id)}" ${a.ok ? '' : 'disabled'}>${L(a.th, a.en)}${a.ok ? '' : ` · Lv ${ITEMS[id].lv}`}</button><button class="btn" data-teclose="1">${L('ปิด', 'Close')}</button></div>`);
      ITIP.w = tip.offsetWidth; ITIP.h = tip.offsetHeight; return _show.apply(this, arguments); }   // measure again with the bar
    return r;
  };
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-teact],[data-teclose]'); if (!t) return;
  e.stopPropagation(); if (t.dataset.teclose){ itHide(); return; } teDo(t.dataset.teact);
}, true);

{ const st = document.createElement('style'); st.textContent = `
#itTip .tebar{display:flex;gap:8px;margin-top:10px;pointer-events:auto}
#itTip .tebar .btn{flex:1;min-height:62px;font-size:19px;font-weight:800;border-radius:14px}   /* the card is often scaled down to fit a phone: still ≥ 44 px on screen */
#itTip .tebar .btn:not(.gold){flex:0 0 auto;min-width:72px}
@media (pointer:coarse){ .gdx-act .btn[data-wear],.gdx-act .btn[data-use],#bagInfo .btn[data-wear],#bagInfo .btn[data-use]{min-height:44px;min-width:96px;font-size:15px;padding:6px 14px} }`;
  document.head.appendChild(st); }
