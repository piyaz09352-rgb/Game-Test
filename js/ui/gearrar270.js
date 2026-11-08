/* VAYRATHEN — js/ui/gearrar270.js — (v270) equipment that looks like what it is
   The owner: equipment in the UI should carry its own patterns and colours by how rare it is and by what kind it is —
   cool and grand.
   · RARITY, on every gear cell (bag, trade, market) and every equipped slot:
       ธรรมดา Common     — warm bronze rim on parchment
       หายาก Rare       — a sapphire frame, a silver edge and a fine wave pattern
       ล้ำค่า Epic      — an amethyst frame with a slowly turning rune circle and violet gems at the corners
       ตำนาน Legendary  — gold and crimson: sunbeams turning behind the item, a gold light running round the frame,
                          a pulsing glow and sparkles
   · KIND: a small emblem in the corner of each cell — sword, armour, helmet, trousers, boots, accessory, shield,
     arrows — in the rarity's colour, so a glance tells you what and how good.
   · THE DETAIL CARD: a ribbon in the rarity's colours with its stars (★ to ★★★★), the kind's emblem large and faint
     behind the card, carved corners, and on a Legendary a sweep of gold light across the ribbon and the frame.
   Looks only: nothing about the items changes. Turned down for "reduce motion". */
'use strict';
const GR270_SVG = {
  weapon:'<path d="M20 3l-9.5 9.5-1.6-1.6L18.4 1.4 21 1zM8 12.5l3.5 3.5-1.6 1.6-1.2-1.2-3.4 3.4.9.9-1.4 1.4-3.6-3.6 1.4-1.4.9.9 3.4-3.4-1.2-1.2z"/>',
  armor:'<path d="M8 2l4 2 4-2 5 3-1.5 6-2.5-1V21H7V10l-2.5 1L3 5zm2 6v3h4V8z"/>',
  head:'<path d="M12 2c5 0 9 4 9 9v4h-3v-3h-2v6H8v-6H6v3H3v-4c0-5 4-9 9-9zm-1 3v6h2V5z"/>',
  pants:'<path d="M5 2h14l1 20h-6l-2-12-2 12H4z"/>',
  shoes:'<path d="M6 2h6v10l7 3c2 1 3 2.5 3 5v1H2v-5l2-2z"/>',
  acc:'<path d="M12 1l3 4-3 3-3-3zM12 9a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>',
  shield:'<path d="M12 1l9 3v7c0 6-4 10-9 12-5-2-9-6-9-12V4zm0 4v14c3-1.5 5-4.5 5-8V7z"/>',
  ammo:'<path d="M21 2l-1 5-2-2L6 17l1 3-2 2-1-3-3-1 2-2 3 1L18 5l-2-2zM14 2l-1 4-1.5-1.5L4 12 3 11l7.5-7.5L9 2z"/>'
};
const gr270Uri = k => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'>${GR270_SVG[k]}</svg>`)}")`;
function gr270Slot(it){ return (it && (it.kind === 'ammo' ? 'ammo' : it.slot === 'acc2' ? 'acc' : it.slot)) || null; }
/* tag the cells: rarity class and kind */
function gr270Tag(root){
  const q = (root && root.querySelectorAll ? root : document).querySelectorAll('.bslot[data-bagsel],.bslot[data-mksel],.bslot[data-tsel]');
  for (const b of q){ const id = b.dataset.bagsel || b.dataset.mksel || b.dataset.tsel, it = typeof ITEMS !== 'undefined' && ITEMS[id];
    const want = it && (it.kind === 'gear' || it.kind === 'ammo' || (it.slot && GR270_SVG[gr270Slot(it)])) ? `gr${it.rar || 0}` : '';
    if (want ? b.classList.contains(want) && b.classList.contains('grx') && b.dataset.gs === gr270Slot(it) : !b.classList.contains('grx')) continue;   // the bag rewrites a cell's class in place: check the class itself
    b.classList.remove('gr0', 'gr1', 'gr2', 'gr3', 'grx'); if (want){ b.classList.add(want, 'grx'); b.dataset.gs = gr270Slot(it); } else delete b.dataset.gs; }
  for (const s of (root && root.querySelectorAll ? root : document).querySelectorAll('.eqsl')){ const m = /eqsl-(\w+)/.exec(s.className); if (m && s.dataset.gs !== m[1]) s.dataset.gs = m[1] === 'acc2' ? 'acc' : m[1]; }
}
{ let pend = false; const run = () => { pend = false; try { gr270Tag(document); } catch (e) {} };
  new MutationObserver(() => { if (!pend){ pend = true; requestAnimationFrame(run); } }).observe(document.documentElement, {childList:true, subtree:true}); }

/* the looks */
{ const P = 'html body', B = `${P} #ui#ui.ui .bslot.grx.grx`, E = `${P} #ui.ui .eqsl`, R = [
    {g1:'#c99a5a', g2:'#7a5228', g3:'#fff1d6', gl:'rgba(201,154,90,.0)'},
    {g1:'#3d9bff', g2:'#0e3f8a', g3:'#dff0ff', gl:'rgba(61,155,255,.55)'},
    {g1:'#b46bff', g2:'#4a1690', g3:'#f3e6ff', gl:'rgba(180,107,255,.6)'},
    {g1:'#ffb830', g2:'#a01e10', g3:'#fff4c0', gl:'rgba(255,170,40,.75)'}];
  let css = `gr-x{display:block}
@property --gra{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes gr270Spin{to{transform:rotate(360deg)}}@keyframes gr270Run{to{--gra:360deg}}
@keyframes gr270Pulse{0%,100%{box-shadow:0 0 10px var(--gl),0 0 0 1px rgba(60,20,0,.45)}50%{box-shadow:0 0 22px var(--gl),0 0 0 1px rgba(60,20,0,.45)}}
@keyframes gr270Sweep{0%{background-position:-160% 0}60%,100%{background-position:260% 0}}
@keyframes gr270Twinkle{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}
`;
  R.forEach((c, i) => { css += `${B}.gr${i},${E}.rr${i},${P} .gdx.r${i}{--g1:${c.g1};--g2:${c.g2};--g3:${c.g3};--gl:${c.gl}}\n`; });
  // the cell: a frame drawn as a gradient border, the rarity's pattern inside, the item above it all
  css += `
${B}{isolation:isolate;border:2px solid transparent !important;border-radius:12px !important;
  background:radial-gradient(circle at 50% 42%,var(--g3) 0,color-mix(in srgb,var(--g3) 70%,var(--g1)) 55%,color-mix(in srgb,var(--g1) 45%,var(--g2)) 100%) padding-box,
    linear-gradient(145deg,var(--g3),var(--g1) 35%,var(--g2) 70%,var(--g1)) border-box !important;
  box-shadow:0 0 0 1px rgba(60,30,0,.25),0 2px 0 color-mix(in srgb,var(--g2) 60%,transparent) !important;animation:none !important}
${B} > svg,${B} > img,${B} > .sico,${B} > i,${B} > em{position:relative;z-index:2}
${B} > svg:first-of-type,${B} > img:first-of-type,${B} > .sico{filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))}
${B} > .grbadge{position:absolute;z-index:3;left:4%;bottom:4%;width:30%;height:30%;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle at 40% 35%,color-mix(in srgb,var(--g1) 60%,#fff),var(--g1) 45%,var(--g2));box-shadow:0 0 0 1.5px var(--g3),0 1px 3px rgba(0,0,0,.45)}
${B} > .grbadge::before{content:"";position:absolute;inset:22%;background:var(--g3);-webkit-mask:var(--gsi) center/contain no-repeat;mask:var(--gsi) center/contain no-repeat;filter:drop-shadow(0 1px 0 rgba(0,0,0,.4))}
${B} svg.iart > rect{display:none}
${B}::after{display:none !important}
${B}.gr1{background:repeating-linear-gradient(135deg,rgba(255,255,255,.0) 0 5px,rgba(255,255,255,.28) 5px 6px) padding-box,
    radial-gradient(circle at 50% 40%,#f4faff 0,#bfe0ff 45%,#4a98e8 100%) padding-box,linear-gradient(145deg,#ffffff,#9cc8f0 30%,#1e5fb8 65%,#cfe6ff) border-box !important;
  box-shadow:0 0 9px var(--gl),0 0 0 1px rgba(10,40,90,.35) !important}
${B}.gr2{background:repeating-conic-gradient(from 0deg at 50% 45%,rgba(255,255,255,.16) 0 5deg,rgba(255,255,255,0) 5deg 15deg) padding-box,
    radial-gradient(circle at 50% 42%,#fbf3ff 0,#d9b6ff 42%,#7a32d0 100%) padding-box,linear-gradient(145deg,#ffe9a8,#c78bff 30%,#4a1690 70%,#ffd27a) border-box !important;
  box-shadow:0 0 12px var(--gl),0 0 0 1px rgba(50,10,90,.4) !important}
${B}.gr3{border-width:2.5px !important;background:radial-gradient(circle at 50% 42%,#fffbe6 0,#ffd770 34%,#e0701a 70%,#7a1408 100%) padding-box,
    conic-gradient(from var(--gra),#fff6c0,#ffb830,#c0301a,#ffb830,#fff6c0,#ffd060,#a01e10,#ffd060,#fff6c0) border-box !important;
  animation:gr270Run 3.2s linear infinite,gr270Pulse 2.4s ease-in-out infinite !important}
/* Epic: a rune circle turning behind the item · Legendary: sunbeams turning behind it */
${B}.gr2 > :first-child,${B}.gr3 > :first-child{position:relative;z-index:2}
${B}.gr2{--rays:repeating-conic-gradient(from 0deg,rgba(255,255,255,.0) 0 10deg,rgba(255,240,255,.35) 10deg 12deg)}
${B}.gr3{--rays:repeating-conic-gradient(from 0deg,rgba(255,255,255,0) 0 9deg,rgba(255,250,210,.55) 9deg 15deg)}
${B}.gr2 > .grrays,${B}.gr3 > .grrays{position:absolute;z-index:1;left:50%;top:46%;width:108%;height:108%;margin:-54% 0 0 -54%;border-radius:50%;pointer-events:none;
  background:var(--rays);-webkit-mask:radial-gradient(circle,#000 0 34%,transparent 70%);mask:radial-gradient(circle,#000 0 34%,transparent 70%);animation:gr270Spin 9s linear infinite}
${B}.gr3 > .grrays{animation-duration:6s}
${B}.gr2 > .grgem{position:absolute;z-index:3;width:7px;height:7px;pointer-events:none;transform:rotate(45deg);background:linear-gradient(135deg,#fff,#c78bff 50%,#4a1690);box-shadow:0 0 4px rgba(200,140,255,.9)}
${B}.gr3 > .grgem{position:absolute;z-index:3;width:8px;height:8px;pointer-events:none;transform:rotate(45deg);background:linear-gradient(135deg,#fffbe0,#ffb830 50%,#a01e10);box-shadow:0 0 6px rgba(255,190,60,.95)}
${B} > .grgem.a{left:3px;top:3px}${B} > .grgem.b{right:3px;top:3px}
${B}.gr3 > .grspk{position:absolute;z-index:3;width:10px;height:10px;pointer-events:none;background:radial-gradient(circle,#fff 0 18%,transparent 20%),linear-gradient(transparent 44%,#fff 44% 56%,transparent 56%),linear-gradient(90deg,transparent 44%,#fff 44% 56%,transparent 56%);
  -webkit-mask:radial-gradient(circle,#000 0 50%,transparent 70%);mask:radial-gradient(circle,#000 0 50%,transparent 70%);animation:gr270Twinkle 2.2s ease-in-out infinite}
${B}.gr3 > .grspk.a{right:14%;top:18%}${B}.gr3 > .grspk.b{left:20%;top:52%;animation-delay:1.1s}
`;
  for (const k in GR270_SVG) css += `${B}[data-gs="${k}"],${E}[data-gs="${k}"],${P} .gdx[data-gs="${k}"]{--gsi:${gr270Uri(k)}}\n`;
  // equipped slots: a rarity ring round the round slot, a turning halo on Epic and Legendary
  css += `
${E}.rr1 .eqbox,${E}.rr2 .eqbox,${E}.rr3 .eqbox{position:relative;isolation:isolate}
${E}.full.rr1 .eqbox{box-shadow:0 0 0 3px #fff,0 0 0 6px var(--g1),0 0 14px var(--gl) !important;background:radial-gradient(circle at 50% 40%,#f4faff,#bfe0ff 60%,#6aaef0) !important}
${E}.full.rr2 .eqbox{box-shadow:0 0 0 3px #fff3c0,0 0 0 6px var(--g1),0 0 16px var(--gl) !important;background:radial-gradient(circle at 50% 40%,#fbf3ff,#d9b6ff 60%,#9a5ae0) !important}
${E}.full.rr3 .eqbox{box-shadow:0 0 0 3px #fff6c0,0 0 0 6px #e08a20,0 0 0 8px #8a1a0a,0 0 22px var(--gl) !important;background:radial-gradient(circle at 50% 40%,#fffbe6,#ffd770 50%,#e0701a) !important;animation:gr270Pulse 2.4s ease-in-out infinite}
${E}.full.rr2 .eqbox::before,${E}.full.rr3 .eqbox::before{content:"";position:absolute;inset:-14%;border-radius:50%;z-index:-1;pointer-events:none;
  background:repeating-conic-gradient(from 0deg,rgba(255,255,255,0) 0 8deg,color-mix(in srgb,var(--g1) 70%,#fff) 8deg 11deg);-webkit-mask:radial-gradient(circle,transparent 0 58%,#000 60% 70%,transparent 72%);mask:radial-gradient(circle,transparent 0 58%,#000 60% 70%,transparent 72%);animation:gr270Spin 12s linear infinite}
${E}.full.rr3 .eqbox::before{inset:-22%;background:repeating-conic-gradient(from 0deg,rgba(255,240,180,0) 0 7deg,rgba(255,220,120,.9) 7deg 12deg);-webkit-mask:radial-gradient(circle,transparent 0 50%,#000 54% 66%,transparent 72%);mask:radial-gradient(circle,transparent 0 50%,#000 54% 66%,transparent 72%);animation-duration:7s}
${E}.full .eqbox svg,${E}.full .eqbox img{position:relative;z-index:1}
/* the detail card */
${P} .gdx.r1,${P} .gdx.r2,${P} .gdx.r3,${P} .gdx.r0{position:relative;isolation:isolate;border:2px solid transparent !important;
  background:linear-gradient(180deg,color-mix(in srgb,var(--g3) 92%,#fff),#fffaf0 40%,#f7ecd4) padding-box,linear-gradient(160deg,var(--g3),var(--g1) 30%,var(--g2) 60%,var(--g1)) border-box !important;
  box-shadow:0 0 0 1px rgba(60,30,0,.25),0 0 18px var(--gl),0 8px 18px rgba(40,20,0,.25) !important}
${P} .gdx.r3{background:linear-gradient(180deg,#fff8dc,#fffaf0 40%,#f7ecd4) padding-box,conic-gradient(from var(--gra),#fff6c0,#ffb830,#c0301a,#ffb830,#fff6c0,#ffd060,#a01e10,#ffd060,#fff6c0) border-box !important;animation:gr270Run 4s linear infinite}
${P} .gdx[data-gs] .gdx-top{position:relative}
${P} .gdx[data-gs] .gdx-band{position:relative;overflow:hidden;min-height:22px;letter-spacing:.6px;color:#fff !important;text-shadow:0 1px 0 rgba(0,0,0,.45),0 0 6px rgba(0,0,0,.25) !important;
  background:linear-gradient(90deg,var(--g2),var(--g1) 30%,color-mix(in srgb,var(--g1) 50%,var(--g3)) 50%,var(--g1) 70%,var(--g2)) !important;box-shadow:inset 0 -2px 0 rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.45)}
${P} .gdx.r0[data-gs] .gdx-band{color:#4a2a08 !important;text-shadow:0 1px 0 rgba(255,255,255,.6) !important}
${P} .gdx.r1[data-gs] .gdx-band{background:repeating-linear-gradient(135deg,rgba(255,255,255,0) 0 6px,rgba(255,255,255,.18) 6px 7px),linear-gradient(90deg,#0e3f8a,#3d9bff 30%,#bfe0ff 50%,#3d9bff 70%,#0e3f8a) !important}
${P} .gdx.r2[data-gs] .gdx-band{background:repeating-conic-gradient(from 0deg at 50% 120%,rgba(255,255,255,0) 0 4deg,rgba(255,255,255,.14) 4deg 8deg),linear-gradient(90deg,#3a0e70,#b46bff 30%,#ffe9a8 50%,#b46bff 70%,#3a0e70) !important}
${P} .gdx.r3[data-gs] .gdx-band{background:linear-gradient(100deg,transparent 35%,rgba(255,255,255,.75) 50%,transparent 65%) 0 0/50% 100% no-repeat,linear-gradient(90deg,#7a1408,#e0701a 22%,#ffd060 40%,#fff6c0 50%,#ffd060 60%,#e0701a 78%,#7a1408) !important;animation:gr270Sweep 3.4s ease-in-out infinite}
${P} .gdx[data-gs] .gdx-band span::after{content:attr(data-stars);margin-left:8px;color:#fff3b0;letter-spacing:1px;text-shadow:0 0 6px rgba(255,220,120,.9)}
${P} .gdx[data-gs]::marker{content:none}
${P} .gdx[data-gs] > .grbig{position:absolute;right:8px;top:30px;width:118px;height:118px;z-index:-1;pointer-events:none;background:var(--g1);opacity:.13;-webkit-mask:var(--gsi) center/contain no-repeat;mask:var(--gsi) center/contain no-repeat}
${P} .gdx[data-gs] > .grcorner{position:absolute;width:18px;height:18px;pointer-events:none;z-index:1;border:2.5px solid var(--g1);filter:drop-shadow(0 0 3px var(--gl))}
${P} .gdx[data-gs] > .grcorner.a{left:5px;bottom:5px;border-right:0;border-top:0;border-radius:0 0 0 8px}
${P} .gdx[data-gs] > .grcorner.b{right:5px;bottom:5px;border-left:0;border-top:0;border-radius:0 0 8px 0}
${P} .gdx[data-gs] .gdx-ic{position:relative;isolation:isolate;border:2px solid transparent !important;background:radial-gradient(circle at 50% 42%,var(--g3),color-mix(in srgb,var(--g1) 55%,var(--g3)) 70%,var(--g1)) padding-box,linear-gradient(145deg,var(--g3),var(--g1),var(--g2)) border-box !important;box-shadow:0 0 12px var(--gl) !important}
${P} .gdx.r2[data-gs] .gdx-ic::before,${P} .gdx.r3[data-gs] .gdx-ic::before{content:"";position:absolute;inset:-6px;border-radius:inherit;z-index:-1;pointer-events:none;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,0) 0 9deg,color-mix(in srgb,var(--g1) 60%,#fff) 9deg 13deg);animation:gr270Spin 10s linear infinite;-webkit-mask:radial-gradient(circle,transparent 0 55%,#000 58%);mask:radial-gradient(circle,transparent 0 55%,#000 58%)}
/* the ribbon's words: white with a dark edge, the stars bright gold (the light theme recolours band text) */
${P} .gdx[data-gs] .gdx-band span,${P} #ui#ui .gdx[data-gs] .gdx-band span,${P} .gdx[data-gs] .gdx-band span.sdk{color:#fff !important;-webkit-text-fill-color:#fff !important;font-weight:900 !important;font-size:12px !important;letter-spacing:1px;
  text-shadow:0 1px 0 rgba(0,0,0,.55),0 0 3px rgba(0,0,0,.55),0 0 8px color-mix(in srgb,var(--g2) 80%,transparent) !important}
${P} .gdx.r0[data-gs] .gdx-band span,${P} #ui#ui .gdx.r0[data-gs] .gdx-band span{color:#fff8e8 !important;-webkit-text-fill-color:#fff8e8 !important}
${P} .gdx[data-gs] .gdx-band span::after,${P} #ui#ui .gdx[data-gs] .gdx-band span::after{content:attr(data-stars) !important;margin-left:8px;font-size:12px;color:#ffe680 !important;-webkit-text-fill-color:#ffe680 !important;opacity:1 !important;letter-spacing:2px;
  text-shadow:0 0 2px #7a4a00,0 0 8px rgba(255,220,120,.95) !important;vertical-align:0 !important}
${P} .gdx.r0[data-gs] .gdx-band{background:linear-gradient(90deg,#5a3a18,#a87a44 30%,#e8c890 50%,#a87a44 70%,#5a3a18) !important}
/* the light theme's pass (sunread.js) marks dark see-through boxes .slt and whitens them: not these */
${B} > .grbadge,${B} > .grbadge.slt{background:radial-gradient(circle at 40% 35%,color-mix(in srgb,var(--g1) 60%,#fff),var(--g1) 45%,var(--g2)) !important;border:0 !important}
${B}.gr2 > .grgem,${B}.gr2 > .grgem.slt{background:linear-gradient(135deg,#fff,#c78bff 50%,#4a1690) !important}
${B}.gr3 > .grgem,${B}.gr3 > .grgem.slt{background:linear-gradient(135deg,#fffbe0,#ffb830 50%,#a01e10) !important}
${B} > .grrays,${B} > .grrays.slt{background:var(--rays) !important}
${P} .gdx[data-gs] > .grbig,${P} .gdx[data-gs] > .grbig.slt{background:var(--g1) !important}
${P} .gdx[data-gs] > .grcorner,${P} .gdx[data-gs] > .grcorner.slt{background:none !important}
@media (prefers-reduced-motion:reduce){${B},${B} > *,${E} .eqbox,${E} .eqbox::before,${P} .gdx,${P} .gdx *,${P} .gdx *::before{animation:none !important}}
`;
  const st = document.createElement('style'); st.id = 'gr270css'; st.textContent = css;
  const put = () => { if (st.parentNode !== document.head || document.head.lastElementChild !== st) document.head.appendChild(st); };
  put(); window.addEventListener('load', put); setTimeout(put, 1500);   // last in the head: later stylesheets (themes) must not cover it
}
/* the extra pieces inside an Epic / Legendary cell and on the detail card */
function gr270Dress(root){
  for (const b of (root || document).querySelectorAll('.bslot.grx')) if (!b.querySelector(':scope > .grbadge')) b.insertAdjacentHTML('afterbegin', '<gr-x class="grbadge"></gr-x>');
  for (const b of (root || document).querySelectorAll('.bslot:not(.grx) > gr-x')) b.remove();
  for (const b of (root || document).querySelectorAll('.bslot.grx.gr2,.bslot.grx.gr3')){ if (b.querySelector(':scope > .grrays')) continue;
    b.insertAdjacentHTML('afterbegin', '<gr-x class="grrays"></gr-x>'); b.insertAdjacentHTML('beforeend', '<gr-x class="grgem a"></gr-x><gr-x class="grgem b"></gr-x>' + (b.classList.contains('gr3') ? '<gr-x class="grspk a"></gr-x><gr-x class="grspk b"></gr-x>' : '')); }
  for (const b of (root || document).querySelectorAll('.bslot.grx:not(.gr2):not(.gr3) > .grrays,.bslot.grx:not(.gr2):not(.gr3) > .grgem,.bslot.grx:not(.gr3) > .grspk')) b.remove();
  for (const c of (root || document).querySelectorAll('.gdx[data-gs]')){ if (c.querySelector(':scope > .grbig')) continue; const r = +((/\br(\d)\b/.exec(c.className) || [0, 0])[1]);
    c.insertAdjacentHTML('afterbegin', '<gr-x class="grbig"></gr-x><gr-x class="grcorner a"></gr-x><gr-x class="grcorner b"></gr-x>');
    const s = c.querySelector('.gdx-band span'); if (s) s.dataset.stars = '★'.repeat(r + 1); }
}
{ let pend = false; new MutationObserver(() => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; try { gr270Dress(document); } catch (e) {} }); }).observe(document.documentElement, {childList:true, subtree:true}); }
