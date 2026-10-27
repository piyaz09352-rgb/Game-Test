/* VAYRATHEN — js/sys/tapsize.js — (v112) buttons big enough for a thumb on phones and tablets
   An audit of every window and shop on a sideways phone (844×390) found most buttons drawn 18–24 px tall on screen,
   tabs 20 px, the stat "+" 17 px, the quantity −/+ 24 px, checkboxes 8 px and the "take off" × 10 px. The game's
   interface is scaled down to fit a phone (UIZ ≈ 0.74 there), so its CSS sizes shrink with it.
   Phone guidelines ask for touch targets of about 44 points (iOS) / 48 dp (Android). On touch screens only, this
   sets minimum sizes in real screen pixels (divided by the current interface scale): ordinary buttons, inputs and
   selects ≥ 44 px, small buttons and tabs ≥ 40 px, close buttons and −/+ ≥ 42 px square, checkboxes ≥ 24 px
   (a window squeezed to fit the screen shrinks these a little more, so they land at about 32–40 px).
   A mouse and keyboard keep the compact desktop sizes. Recomputed when the interface scale changes. */
'use strict';
const TAPS = {z:0, st:null};
const tsTouch = () => typeof GFX !== 'undefined' && GFX.touch || matchMedia('(pointer:coarse)').matches;
function tsApply(){
  if (!tsTouch()) return;
  const z = typeof UIZ === 'number' && UIZ > 0 ? UIZ : 1; if (Math.abs(z - TAPS.z) < .01 && TAPS.st) return; TAPS.z = z;
  const px = n => Math.round(n / z) + 'px', W = '.win:not([hidden])', D = '#dialog';
  if (!TAPS.st){ TAPS.st = document.createElement('style'); TAPS.st.id = 'tapsize'; document.head.appendChild(TAPS.st); }
  TAPS.st.textContent = `
${W} .btn,${D} .btn,${W} select,${D} select,${W} input:not([type=checkbox]):not([type=radio]):not([type=range]),${D} input:not([type=checkbox]):not([type=radio]):not([type=range]){min-height:${px(44)}}
${W} .btn.sm,${D} .btn.sm,${W} .wktab,${D} .wktab,${W} .bagtab,${W} [data-eqtab],${W} [data-fgtab],${W} [data-twkv],${W} [data-mvptab],${W} [data-mltab],${W} .bagv{min-height:${px(40)};min-width:${px(40)}}
${W} .ibtn,${D} .ibtn{min-width:${px(42)};min-height:${px(42)}}
${W} .qb,${D} .qb{min-width:${px(36)};min-height:${px(36)}}
${W} .qty .qn,${D} .qty .qn{min-height:${px(36)}}
/* a shop row with a quantity picker: the name keeps a readable width, the picker and buy button wrap below it */
${W} .srow:has(.qty),${D} .srow:has(.qty){flex-wrap:wrap;row-gap:${px(6)}}
${W} .srow:has(.qty) .nm,${D} .srow:has(.qty) .nm{flex:1 1 45%;min-width:45%}
[data-wclose],.dialog .dx,#dialog .dx{width:${px(42)}!important;height:${px(42)}!important;min-width:${px(42)}!important;position:relative}
[data-wclose]::after,.dialog .dx::after,#dialog .dx::after{content:'';position:absolute;inset:-${px(8)}}
${W} .btn.plus{min-width:${px(38)};min-height:${px(38)}}
${W} input[type=checkbox],${D} input[type=checkbox],${W} input[type=radio]{width:${px(24)};height:${px(24)}}
${W} .eqx{min-width:${px(24)};min-height:${px(24)};display:inline-flex;align-items:center;justify-content:center}
${W} .wrow,${W} .crrow,${W} .wkrow,${W} .srow{min-height:${px(36)}}`;
}
tsApply();
EV.on('tick', () => { if (typeof UIZ === 'number' && Math.abs(UIZ - TAPS.z) >= .01) tsApply(); });
addEventListener('resize', () => setTimeout(tsApply, 50));
