/* VAYRATHEN — js/sys/invcombo.js — bag and equipment in one window
   The Inventory window and the Equipment window are now one: the character with its gear slots on the left,
   the whole bag on the right (stacked on a phone). Pick an item in the bag and press สวมใส่ (or double-tap it)
   and it goes straight onto the character. The bag menu button, E and Q all open this window; the separate
   Equipment button is gone from the menu. The wardrobe tab still takes the whole window. */
'use strict';

{
  const we = el('win-equip'), wb = we && we.querySelector('.wb'), pe = el('pane-equip'), pb = el('pane-bag');
  if (we && wb && pe && pb){
    const box = document.createElement('div'); box.className = 'invcombo';
    wb.insertBefore(box, pe); box.appendChild(pe); box.appendChild(pb);
    we.classList.add('invwin');
    const t = we.querySelector('.wt b'); if (t) t.innerHTML = `<span data-en="Inventory · Equipment">กระเป๋า · อุปกรณ์</span>`;
    const eb = document.querySelector('#rail .mb[data-win="equip"]'), bb = document.querySelector('#rail .mb[data-win="bag"]');
    if (eb){ const d = el('dotEquip'); if (d && bb) bb.appendChild(d); eb.remove(); }   // the card dot moves to the bag button
    if (bb){ bb.setAttribute('aria-label', 'กระเป๋า · อุปกรณ์'); bb.dataset.enLabel = 'Inventory · Equipment'; }
  }
}
const invId = id => id === 'bag' ? 'equip' : id;
{ const _o = openWin; openWin = function(id, ...a){ id = invId(id); const r = _o.call(this, id, ...a); if (id === 'equip'){ if (typeof renderBag === 'function') renderBag(); requestAnimationFrame(invFit); } return r; }; }
{ const _c = closeWin; closeWin = function(id, ...a){ return _c.call(this, invId(id), ...a); }; }
{ const _t = toggleWin; toggleWin = function(id, ...a){ return _t.call(this, invId(id), ...a); }; }
{ const _s = syncMenu; syncMenu = function(){ _s.apply(this, arguments); const b = document.querySelector('.mb[data-win="bag"]'); if (b) b.setAttribute('aria-pressed', UIS.open.equip ? 'true' : 'false'); }; }
if (UIS.open.bag){ delete UIS.open.bag; UIS.open.equip = 1; }
/* side by side, the character side shrinks to fit the window's height (any screen), down to 70% */
function invFit(){
  const pe = el('pane-equip'), w = el('win-equip'); if (!pe || !w || w.hidden) return;
  const kids = [...pe.children]; kids.forEach(c => { c.style.zoom = ''; });
  const side = getComputedStyle(document.querySelector('.invcombo')).gridTemplateColumns.split(' ').length > 1;
  if (!side || w.classList.contains('cosmode') || !pe.clientHeight) return;
  const z = Math.max(.7, Math.min(1, (pe.clientHeight - 4) / pe.scrollHeight));
  if (z < 1) kids.forEach(c => { c.style.zoom = z.toFixed(3); });
}
addEventListener('resize', () => setTimeout(invFit, 150));
/* the wardrobe tab uses the whole window; the gear tab shows the bag beside the doll */
{
  const _re = renderEquip;
  renderEquip = function(){
    const out = _re.apply(this, arguments), w = el('win-equip');
    if (w) w.classList.toggle('cosmode', typeof EQ !== 'undefined' && EQ.tab === 'cos');
    invFit(); return out;
  };
}
{
  const st = document.createElement('style');
  st.textContent = `#win-equip.invwin{width:min(1060px,calc(100% - 24px));left:max(12px,calc(50% - 530px))}
    .invcombo{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);grid-template-rows:minmax(0,1fr);gap:10px;align-items:stretch;container-type:inline-size;min-height:0;height:100%;overflow:hidden}
    .invcombo > .pane{min-height:0;max-height:100%!important;overflow-y:auto!important;overscroll-behavior:contain}
    .invcombo > #pane-equip{min-width:0}
    .invcombo > #pane-bag{min-width:0;border-radius:12px;border:1px solid rgba(227,176,75,.25);background:rgba(0,0,0,.18)}
    .invcombo #pane-bag .bagh [data-win-open="equip"]{display:none}
    .invcombo .eqbagw{display:none}
    @container (min-width:400px) and (max-width:540px){.invcombo .eqdoll2{grid-template-columns:minmax(0,1fr) 128px minmax(0,1fr);grid-template-areas:"L stage R";align-items:start}.invcombo .eqstage{position:static}}
    #win-equip.cosmode .invcombo{grid-template-columns:minmax(0,1fr)}
    #win-equip.cosmode #pane-bag{display:none}
    @media (max-width:820px){.invcombo{grid-template-columns:minmax(0,1fr);grid-template-rows:none;overflow-y:auto;height:100%}.invcombo > .pane{max-height:none!important;overflow:visible!important}}
    @media (max-width:820px){#win-equip.invwin .invcombo > #pane-bag .bagw{max-height:min(420px,calc(var(--sh,600px) - 230px))}}`;
  document.head.appendChild(st);
}
