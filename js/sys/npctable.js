/* VAYRATHEN — js/sys/npctable.js — (v159) the bank and the tailor as table lists
   นายคลังทองดี (the account bank) and ช่างพิมพ์ลดา (the tailor) showed big cards, four or five to a screen. Their
   lists are now tables: a header row, one slim row per item (small icon · name and details · amount or price ·
   buttons), alternate row shading and the header kept in view while the list scrolls. The rows keep the same parts
   as before, so the other add-ons that read them (costume slots, try-on, fashion sets) still find what they need. */
'use strict';

const NPTAB = {
  tailor:{cols:[['ชุด', 'Outfit'], ['ราคา', 'Price'], ['', '']]},
  banker:{cols:[['ไอเท็ม', 'Item'], ['', ''], ['', '']]}
};
function npctDecorate(id){
  const d = document.getElementById('dialog'); if (!d || d.hidden || d.dataset.npc !== id) return;
  const cfg = NPTAB[id];
  d.querySelectorAll('.db .shop').forEach(sh => {
    sh.classList.add('ntab');
    if (!sh.querySelector(':scope > .srow') || (sh.firstElementChild && sh.firstElementChild.classList.contains('nthead'))) return;
    const h = document.createElement('div'); h.className = 'nthead';
    h.innerHTML = cfg.cols.map(([th, en]) => `<span>${L(th, en)}</span>`).join('');
    sh.insertBefore(h, sh.firstChild);
  });
}
for (const id of Object.keys(NPTAB)){
  const wrap = () => { const f = NPC_OPEN[id]; if (!f || f._npct) return; const g = function(){ const r = f.apply(this, arguments); npctDecorate(id); return r; }; g._npct = true; NPC_OPEN[id] = g; };
  wrap(); addEventListener('load', wrap);   // late add-ons may wrap the tailor again after this file
}
/* a redraw from anywhere (buying, try-on, the bank buttons) gets its table back */
new MutationObserver(() => { const d = document.getElementById('dialog'); if (d && !d.hidden && NPTAB[d.dataset.npc]) npctDecorate(d.dataset.npc); })
  .observe(document.getElementById('dialog'), {childList:true, subtree:true});
{ const st = document.createElement('style');
  st.textContent = `
#dialog .nthead{display:flex;gap:8px;padding:4px 10px;background:#e9dcbf;color:#5a3d12;font:700 12px var(--display,sans-serif);border-bottom:1px solid #d4b47a}
#dialog .nthead span:first-child{flex:1}#dialog .nthead span:nth-child(2){width:120px;text-align:right}#dialog .nthead span:nth-child(3){width:96px}
#dialog .shop.ntab{gap:0 !important;border:1px solid #d4b47a;border-radius:8px;flex:0 0 auto !important;overflow:visible !important}#dialog .shop.ntab > *{flex-shrink:0 !important}#dialog .shop.ntab > :first-child{border-radius:8px 8px 0 0 !important}#dialog .shop.ntab > :last-child{border-radius:0 0 8px 8px !important}
#dialog .shop.ntab > .srow{display:flex;align-items:center;gap:8px;min-height:0 !important;padding:3px 10px !important;margin:0 !important;border-radius:0 !important;
  border:none !important;border-bottom:1px solid rgba(180,140,80,.28) !important;box-shadow:none !important;background:#fffaf0 !important}
#dialog .shop.ntab > .srow:nth-child(odd){background:#f6ecd8 !important}
#dialog .shop.ntab > .srow:last-child{border-bottom:none !important}
#dialog .shop.ntab > .srow > .ic,#dialog .shop.ntab > .srow > canvas,#dialog .shop.ntab > .srow > .cosic{flex:0 0 30px !important;width:30px !important;height:30px !important;min-width:0 !important}
#dialog .shop.ntab > .srow > .ic > *{max-width:26px !important;max-height:26px !important;width:26px !important;height:26px !important}
#dialog .shop.ntab > .srow .nm{flex:1;min-width:0}
#dialog .shop.ntab > .srow .nm b{font-size:13px !important;line-height:1.25}
#dialog .shop.ntab > .srow .nm small{font-size:11px !important;line-height:1.2;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#dialog .shop.ntab > .srow .pr{width:120px;text-align:right;font-size:13px}
#dialog .shop.ntab > .srow .btn.sm{min-height:26px !important;padding:2px 10px !important;font-size:12px !important}
#dialog .shop.ntab > p.hint{padding:6px 10px;margin:0}
/* every shop row lines up: price, amount box and buy button sit in fixed columns whatever the numbers */
:is(#dialog,.win) .srow > .pr{flex:0 0 84px !important;width:84px !important;text-align:right !important;white-space:nowrap}
:is(#dialog,.win) .srow > .qty{flex:0 0 156px !important;width:156px !important;display:inline-flex !important;align-items:center;justify-content:space-between;box-sizing:border-box}
:is(#dialog,.win) .srow > .qty .qn{width:42px !important;min-width:0 !important;text-align:center}
:is(#dialog,.win) .srow > .qgo{flex:0 0 112px !important;width:112px !important;justify-content:center;text-align:center;white-space:nowrap;box-sizing:border-box}
:is(#dialog,.win) .srow > .btn.sm:last-child:not(.qgo){flex:0 0 auto;min-width:64px;justify-content:center}`;
  document.head.appendChild(st); }
/* the windows an NPC opens (the smith's forge, the forger's crafting, the guild registrar, the castle-war general,
   the market) are 60% of the screen too, and open in the middle */
const NPC_WINS = ['forge', 'craft', 'guild', 'siege', 'market'];
if (typeof WC_IDS !== 'undefined') for (const w of NPC_WINS) if (!WC_IDS.includes(w)) WC_IDS.push(w);
{ const st = document.createElement('style');
  // (v188) only the big-screen UI: a phone or a tablet held upright (compact UI) sizes them in winfit.js. This 60% cap
  // used to apply there too, so they opened half as wide as every other window and pushed to the left edge
  st.textContent = NPC_WINS.map(w => `#ui:not(.compact) #win-${w}`).join(',') + `{width:calc(60vw / var(--uiz,1)) !important;max-width:calc(60vw / var(--uiz,1)) !important;
    height:calc(60vh / var(--uiz,1)) !important;max-height:calc(60vh / var(--uiz,1)) !important;display:flex;flex-direction:column}` +
    `@media (max-height:560px){` + NPC_WINS.map(w => `#ui:not(.compact) #win-${w}`).join(',') + `{height:calc(86vh / var(--uiz,1)) !important;max-height:calc(86vh / var(--uiz,1)) !important}}` +   /* (v161) a phone on its side: more of the short screen */
    NPC_WINS.map(w => `#ui #win-${w}[hidden]`).join(',') + `{display:none !important}` +
    NPC_WINS.map(w => `#ui #win-${w} > .pane`).join(',') + `{flex:1 1 auto;min-height:0;max-height:none !important;overflow:auto}`;
  document.head.appendChild(st); }
