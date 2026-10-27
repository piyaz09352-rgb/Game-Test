/* VAYRATHEN — js/sys/eqring.js — (v140) the equipment doll as a ring
   The worn pieces were eight wide cards in two columns with the hero small between them. Now the hero stands large in
   the middle and the eight pieces are round badges in a ring around them — head at the top, weapon on the right,
   shield on the left, shoes at the bottom, accessories and the rest between. A badge shows the item picture, its +
   level and its rarity colour; tap it for the full card (with "ถอดชิ้นนี้"), the small × still takes it off.
   Layout only (CSS on the existing doll), so every rule of the equipment window is unchanged. */
'use strict';

{ const pos = {head:-90, acc:-40, weapon:0, acc2:40, shoes:90, pants:140, shield:180, armor:220};
  const at = a => { const r = a * Math.PI / 180; return `left:${(50 + 43 * Math.cos(r)).toFixed(1)}%;top:${(50 + 45.5 * Math.sin(r)).toFixed(1)}%`; };
  const st = document.createElement('style');
  st.textContent = `
html body #ui.ui #pane-equip .eqdoll2.e6{position:relative!important;display:block!important;width:100%;max-width:560px;aspect-ratio:1/1.12;margin-bottom:22px!important;max-height:min(72vh,600px);container-type:size;--b:min(84px,17cqmin);margin:0 auto;
  background:radial-gradient(circle at 50% 50%,rgba(255,244,214,.9) 0 30%,rgba(255,232,180,.35) 52%,transparent 70%)}
html body #ui.ui #pane-equip .eqdoll2.e6::before{content:'';position:absolute;inset:9%;border-radius:50%;border:2px dashed rgba(200,150,60,.45);pointer-events:none}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqside{display:contents!important}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqstage{position:absolute!important;left:50%;top:50%;transform:translate(-50%,-50%)!important;transform-origin:50% 50%;width:min(70cqw,64cqh)!important;aspect-ratio:1/1;height:auto!important;margin:0!important;z-index:1}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqstage canvas#eqPrev{width:100%!important;height:auto!important;image-rendering:auto}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqplate{margin-top:-4px}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqrot{position:absolute!important;left:-2%!important;right:-2%!important;top:auto!important;bottom:30%!important;display:flex!important;justify-content:space-between!important;pointer-events:none;transform:scale(.8)}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqrot .ibtn{pointer-events:auto}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqrot{display:none!important}   /* (v149) no turn buttons in the ring */
@container (max-height: 320px){ html body #ui.ui #pane-equip .eqdoll2.e6 .eqrot,html body #ui.ui #pane-equip .eqdoll2.e6 .eqplate{display:none!important} }
html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl{position:absolute!important;width:var(--b)!important;height:var(--b)!important;min-width:0!important;max-width:none!important;min-height:0!important;padding:0!important;margin:0!important;
  transform:translate(-50%,-50%);border-radius:50%!important;overflow:visible!important;display:grid!important;grid-template:1fr/1fr!important;place-items:center;z-index:2;
  background:radial-gradient(circle at 35% 30%,#fffdf6,#f6e6c2)!important;box-shadow:0 3px 8px rgba(90,60,20,.25),inset 0 0 0 3px var(--rr,#e3c88a)!important;border:0!important}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl .eqtx,html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl .cusm{display:none!important}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl .eqbox{position:relative!important;left:auto!important;top:auto!important;inset:auto!important;grid-area:1/1!important;justify-self:center!important;align-self:center!important;width:calc(var(--b) * .79)!important;height:calc(var(--b) * .79)!important;min-height:0!important;margin:0!important;padding:0!important;border-radius:50%!important;cursor:pointer}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl .eqbox{display:block!important}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl .eqbox svg.sico,html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl .eqbox svg,html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl .eqbox img{position:static!important;display:block!important;width:calc(var(--b) * .66)!important;height:calc(var(--b) * .66)!important;margin:calc(var(--b) * .065)!important;min-width:0!important;max-width:none!important;max-height:none!important;margin:0!important}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl .eqx{position:absolute!important;top:2%;right:2%;z-index:3}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl::before{display:none!important}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl::after{content:attr(data-ring)!important;position:absolute!important;inset:auto auto -16px 50%!important;transform:translateX(-50%)!important;width:auto!important;height:auto!important;background:rgba(255,250,236,.9)!important;padding:1px 6px!important;border-radius:999px!important;white-space:nowrap;font:700 10px/1.2 Sarabun,system-ui,sans-serif!important;color:#7a5a2a!important;pointer-events:none;opacity:1!important}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl.rr1{--rr:#7ad8a0}html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl.rr2{--rr:#6aa8ff}html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl.rr3{--rr:#c07aff}html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl.rr4{--rr:#ffb03a}html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl.rr5{--rr:#ff6a8a}

/* (v145) the hero alone in the middle of the ring: no stage backdrop (curtains, rays, sparkles), a soft round glow under
   the feet instead; one +N on each badge (the item picture already carries it) */
html body #ui.ui #pane-equip .eqdoll2.e6 .eqstage{background:none!important;border:0!important;box-shadow:none!important}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqaura{background:none!important;border:0!important;box-shadow:none!important}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqaura > i,html body #ui.ui #pane-equip .eqdoll2.e6 .e6c{display:none!important}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqaura::before,html body #ui.ui #pane-equip .eqdoll2.e6 .eqaura::after,html body #ui.ui #pane-equip .eqdoll2.e6 .eqstage::before,html body #ui.ui #pane-equip .eqdoll2.e6 .eqstage::after{display:none!important}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqaura{position:relative}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqstage .eqaura{position:absolute!important;inset:0!important;width:auto!important;height:auto!important;max-width:none!important;max-height:none!important;overflow:visible!important;margin:0!important;padding:0!important;transform:none!important}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqstage .eqaura canvas#eqPrev{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;margin:0!important;z-index:1;transform:none!important;filter:drop-shadow(0 4px 6px rgba(80,50,10,.25))}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqplate{position:absolute!important;left:50%;top:76%;transform:translateX(-50%);white-space:nowrap;z-index:2;background:rgba(255,250,236,.85)!important;border-radius:12px;padding:2px 12px!important;display:inline-flex!important;flex-direction:column;align-items:center;line-height:1.25}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqstage{text-align:center}
html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl .eqrf{display:none!important}
${Object.entries(pos).map(([k, a]) => `html body #ui.ui #pane-equip .eqdoll2.e6 .eqsl-${k}{${at(a)}}`).join('\n')}`;
  document.head.appendChild(st); }
/* the slot name under each badge */
{ const NAMES = {head:['หมวก', 'Head'], armor:['เกราะ', 'Body'], pants:['กางเกง', 'Legs'], shoes:['รองเท้า', 'Feet'], weapon:['อาวุธ', 'Weapon'], shield:['โล่', 'Shield'], acc:['เครื่องประดับ', 'Accessory'], acc2:['เครื่องประดับ 2', 'Accessory 2']};
  const tag = () => { for (const [k, n] of Object.entries(NAMES)){ const e = document.querySelector(`html body #ui.ui #pane-equip .eqdoll2 .eqsl-${k}`); if (e && e.dataset.ring !== L(...n)) e.dataset.ring = L(...n); } };
  if (typeof renderEquip === 'function'){ const _re = renderEquip; renderEquip = function(){ const r = _re.apply(this, arguments); tag(); return r; }; } }
