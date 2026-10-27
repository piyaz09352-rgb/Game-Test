/* VAYRATHEN — js/sys/touchsize.js — (v113) buttons big enough for a thumb on touch screens
   An audit on a sideways phone (844×390) opened every window and NPC and measured every button: these were under
   30 px (some 14–19 px) — the fold/close icons, the small "×" on gear slots, the UI toggle, the tutorial's
   close link and start button, the chat button, the menu toggle and the number boxes in Settings.
   On touch screens (pointer: coarse) only:
   · small HUD icon buttons that stand clear of others (quest fold, minimap buttons, the UI toggle, the world-map
     button, the "×" on gear slots) get an invisible tap ring, so they look the same but are easy to hit;
     the tutorial's link gets taller padding;
   · the chat button, the menu toggle, the tutorial button and number boxes are at least 34 px tall.
   The guides (Apple, Google) ask for about 44 px; 34–36 px is what fits this dense HUD without covering the map. */
'use strict';

/* the HUD is drawn zoomed (#ui zoom < 1 on small screens), so sizes are set in screen pixels: N px / zoom */
const TSZ = {z:0};
function tszZoom(){ const ui = el('ui'); const z = ui ? (parseFloat(ui.style.zoom) || parseFloat(getComputedStyle(ui).zoom) || 1) : 1;
  if (Math.abs(z - TSZ.z) > .001){ TSZ.z = z; document.documentElement.style.setProperty('--uiz', z.toFixed(3)); }
  const g = el('goalCard'), gz = g ? (parseFloat(getComputedStyle(g).zoom) || 1) : 1;   // the quest card has a zoom of its own
  if (Math.abs(gz - (TSZ.g || 0)) > .001){ TSZ.g = gz; document.documentElement.style.setProperty('--gcz', gz.toFixed(3)); } }
EV.on('tick', () => { if ((TSZ.t = (TSZ.t || 0) + 1) % 30 === 0) tszZoom(); }); addEventListener('resize', () => setTimeout(tszZoom, 150)); setTimeout(tszZoom, 0);
/* small see-through icon buttons keep their look: an invisible tap ring around them does the work.
   A ring needs its button to be positioned, so static ones get .tszr (position:relative) */
const TSZ_RING = '#goalCard .ibtn.fold,#mapCard .ibtn,.uitoggle,#mmWorld,.eqx';   // only HUD buttons that stand clear of other controls (a ring over a neighbour would steal its taps)
function tszMark(){ if (!matchMedia('(pointer:coarse)').matches) return;
  for (const b of document.querySelectorAll(TSZ_RING)) if (!b.classList.contains('tszr') && getComputedStyle(b).position === 'static') b.classList.add('tszr'); }
EV.on('tick', () => { if ((TSZ.m = (TSZ.m || 0) + 1) % 45 === 0) tszMark(); });
{ const st = document.createElement('style');
  st.textContent = `@media (pointer:coarse){
  .tszr{position:relative}
  :is(#goalCard .ibtn.fold,#mapCard .ibtn,.uitoggle,#mmWorld,.eqx){overflow:visible!important}
  :is(#goalCard .ibtn.fold,#mapCard .ibtn,.uitoggle,#mmWorld,.eqx)::after{content:'';position:absolute;inset:calc(-7px / var(--uiz,1));border-radius:12px}
  #goalCard .ibtn.fold::after{inset:calc(-7px / var(--uiz,1) / var(--gcz,1))}
  .tutx{padding-block:calc(8px / var(--uiz,1))!important}
  .chatbtn,.railtog{min-height:calc(38px / var(--uiz,1))!important}
  .tutbox .btn,.tut .btn,.tutBox .btn,#tutBox .btn{min-height:calc(38px / var(--uiz,1))}
  .win input[type=number],.win input[type=text],.win input:not([type]),.win select,#dialog input,#dialog select{min-height:calc(36px / var(--uiz,1))}
}`;
  document.head.appendChild(st); }
/* (v132) the smith's workshop (refine · forge · shop) is big: its window takes about 80% of the screen, content scrolls inside */
{ const st = document.createElement('style'); st.textContent = `html body #win-forge{width:calc(80vw / var(--uiz,1))!important;max-width:none!important;height:calc(80vh / var(--uiz,1))!important;max-height:none!important}
html body #win-forge .wb,html body #win-forge #pane-forge{max-height:none!important}`; document.head.appendChild(st); }
