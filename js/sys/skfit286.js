/* VAYRATHEN — js/sys/skfit286.js — (v286) the skill window never shows a scroll bar
   The owner asked several times: the skill tree of the longer lines (occult, merchant, dog folk, ninja, the tier-3 classes …)
   was about 100 px taller than its frame at every screen size, so a scroll bar popped up beside it (and the skill card
   on a phone had one too). Now the tree and the card are scaled down just enough to fit their frame, and scrolling is
   switched off. Measured after every draw and on every resize; the connector lines are redrawn at the new size. */
'use strict';

function skFitOne(el, min = .5){
  if (!el || !el.isConnected) return 1;
  el.style.overflow = 'hidden'; if (el.style.zoom) el.style.zoom = '';
  const room = el.clientHeight, need = el.scrollHeight; if (!room || need <= room + 1) return 1;
  const k = Math.max(min, Math.floor(room / need * 1000) / 1000); el.style.zoom = String(k);
  // zoom changes the height it measures against: settle it in two more passes
  for (let i = 0; i < 2 && el.scrollHeight > el.clientHeight + 1 && k > min; i++) el.style.zoom = String(Math.max(min, +el.style.zoom * el.clientHeight / el.scrollHeight - .005));
  return +el.style.zoom || 1;
}
function skFit(){
  const pane = document.getElementById('pane-skill'); if (!pane || !pane.isConnected || !pane.offsetParent) return;
  const tree = document.getElementById('skTree'), det = pane.querySelector('.skmain > .skdetail');
  if (tree){ tree.dataset.prevz = tree.style.zoom || (typeof skTab !== 'undefined' && pane.dataset.skzTab === String(skTab) && pane.dataset.skz) || '1'; tree.style.rowGap = '';   // (v292) the tree may be rebuilt on a press: its last scale is also kept on the pane, per tab tree.style.paddingTop = tree.style.paddingBottom = ''; tree.style.overflow = 'hidden'; if (tree.style.zoom) tree.style.zoom = '';
    // first the air between the rows goes (26 px → 8 px) and the padding thins; only what still does not fit is scaled
    if (tree.scrollHeight > tree.clientHeight + 1){ tree.style.rowGap = '8px'; tree.style.paddingTop = '8px'; tree.style.paddingBottom = '8px'; } }
  const k = skFitOne(tree, .6); skFitOne(det, .6); if (typeof skTab !== 'undefined'){ pane.dataset.skz = String(k); pane.dataset.skzTab = String(skTab); }
  if (k !== 1 && typeof drawSkLines === 'function') drawSkLines();
}
{ const _r = renderSkills; renderSkills = function(){ const r = _r.apply(this, arguments); try { skFit(); } catch (e) {} return r; }; }   // (v292) one pass: a second one a frame later disagreed by a hair and the tree twitched
window.addEventListener('resize', () => requestAnimationFrame(() => { try { skFit(); } catch (e) {} }));
{ const st = document.createElement('style'); st.textContent = 'html body #pane-skill > .skmain > #skTree,html body #pane-skill > .skmain > .skdetail{overflow:hidden!important;scrollbar-width:none}html body #pane-skill > .skmain > #skTree::-webkit-scrollbar,html body #pane-skill > .skmain > .skdetail::-webkit-scrollbar{display:none}'; document.head.appendChild(st); }
