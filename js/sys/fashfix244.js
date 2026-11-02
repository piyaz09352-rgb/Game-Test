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
/* (v245) the equipment ring stays a circle: on a short screen its height is capped but its width filled the column,
   so the ring became a flat ellipse and the slots shrank to 15 px (the ✕ squashed into an oval). Width = height. */
function eqSquare(){ const d = document.querySelector('#pane-equip .eqdoll2.e6'), pane = el('pane-equip'); if (!d || !pane || !d.offsetWidth) return;
  for (const k of ['width', 'height', 'max-height', 'margin-left', 'margin-right']) d.style.removeProperty(k);
  const w = d.offsetWidth, h = d.offsetHeight; if (h < 40 || w <= h + 4) return;   // a PC: already a circle
  // as big as the column allows: its height less the tabs, the stats and the gaps
  const cs = getComputedStyle(pane), padV = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  let used = 0; for (const c of pane.children){ if (c === d || !c.offsetHeight) continue; const m = getComputedStyle(c); used += c.offsetHeight + parseFloat(m.marginTop) + parseFloat(m.marginBottom); }
  const md = getComputedStyle(d), gap = parseFloat(md.marginTop) + parseFloat(md.marginBottom) + (parseFloat(cs.rowGap) || 0) * (pane.children.length - 1);
  const side = Math.max(h, Math.min(w, pane.clientHeight - padV - used - gap - 4));
  for (const [k, v] of [['width', side + 'px'], ['height', side + 'px'], ['max-height', 'none'], ['margin-left', 'auto'], ['margin-right', 'auto']]) d.style.setProperty(k, v, 'important'); }
if (typeof renderEquip === 'function'){ const _re = renderEquip; renderEquip = function(){ const r = _re.apply(this, arguments); try { eqSquare(); } catch (e) {} return r; }; }
window.addEventListener('resize', () => setTimeout(() => { try { eqSquare(); } catch (e) {} }, 150));
