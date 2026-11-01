/* VAYRATHEN — js/sys/phi237.js — (v237) keeps the quest card under the character card at a golden gap
   (the character card's height now follows its width ÷ φ, so the quest card below has to move with it). */
'use strict';
function phiLayout(){
  const c = el('charCard'), g = el('goalCard'), ui = el('ui'); if (!c || !g || !ui || g.hidden || getComputedStyle(g).position !== 'absolute') return;
  const edge = parseFloat(getComputedStyle(c).top) || 12, gap = Math.round(edge / 1.618), top = Math.round(c.offsetTop + c.offsetHeight + gap);
  if (g.style.getPropertyValue('top') !== top + 'px') g.style.setProperty('top', top + 'px', 'important');
}
setInterval(() => { try { phiLayout(); } catch (e) {} }, 400); window.addEventListener('resize', () => setTimeout(phiLayout, 50));
