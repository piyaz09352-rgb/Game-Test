/* VAYRATHEN — js/sys/fashfix244.js — (v244) the wardrobe preview turns to show what you are trying on
   Trying a wing, jetpack or other back piece used to leave the hero facing you, so the piece hid behind the body
   (the card's own picture already shows it from behind). Now a back piece turns the preview to the back-right view
   (the same angle as its card), and anything else turns it back to face you. The ‹ › buttons still turn it freely. */
'use strict';
const FFX_BACK = id => typeof cthKind === 'function' ? cthKind(id) === 'wing' || cthKind(id) === 'back' : !!(typeof WINGS !== 'undefined' && WINGS[id]);
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-costry]'); if (!t || typeof EQ === 'undefined') return;
  const id = t.dataset.costry;
  setTimeout(() => { const back = FFX_BACK(id), dir = EQ.dir | 0, facingAway = dir >= 3 && dir <= 5;
    if (back && !facingAway) EQ.dir = 5; else if (!back && facingAway) EQ.dir = 0; else return;
    if (typeof drawEquipPrev === 'function') try { drawEquipPrev(); } catch (err) {} }, 0); });
