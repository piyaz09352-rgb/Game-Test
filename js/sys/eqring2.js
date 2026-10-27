/* VAYRATHEN — js/sys/eqring2.js — (v159) the equipment ring, even and in colour
   The ring of worn pieces looked uneven and pale: the dashed ring did not run through the badges (the top and bottom
   badges sat off it), every badge was the same cream disc with two or three thin rings of different colours around
   it (the rarity, the slot, the item's own frame), and the item picture sat a little high in it.
   · the badges sit exactly on the ring, which is a true circle, at even 45° steps, mirrored left and right
   · each badge is a coloured disc of its own slot's colour (head sky blue, body green, legs teal, feet amber,
     weapon red-orange, shield gold, accessories violet and pink) with a white rim, like the menu icons; the item's
     rarity shows as one outer halo; the picture sits dead centre
   · the slot name is a small pill of the same colour; empty slots are the same disc, faded, with the slot's outline
   · the stage behind the hero is a warm sunrise glow, and the ring itself is drawn in the slot colours */
'use strict';

{ const pos = {head:-90, acc:-45, weapon:0, acc2:45, shoes:90, pants:135, shield:180, armor:225}, R = 40;
  const at = a => { const r = a * Math.PI / 180; return `left:${(50 + R * Math.cos(r)).toFixed(2)}% !important;top:${(50 + R * Math.sin(r)).toFixed(2)}% !important`; };
  const P = 'html body #ui.ui #pane-equip .eqdoll2.e6';
  const st = document.createElement('style');
  st.textContent = `
${P}{aspect-ratio:1/1 !important;max-width:min(560px,100%) !important;
  background:radial-gradient(circle at 50% 50%,rgba(255,250,232,1) 0 22%,rgba(255,226,170,.75) 38%,rgba(255,196,140,.35) 52%,rgba(150,200,255,.18) 64%,transparent 72%) !important}
${P}::before{inset:${50 - R}% !important;border:3px solid transparent !important;border-radius:50% !important;
  background:conic-gradient(from -90deg,#45b4ff,#c47cff,#ff6a3d,#ff6fb5,#ffb02e,#4ad8c8,#e8c26a,#33d08a,#45b4ff) border-box !important;
  -webkit-mask:linear-gradient(#000 0 0) padding-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.55}
${P} .eqsl{transform:translate(-50%,-50%) !important;
  background:radial-gradient(circle at 34% 28%,color-mix(in srgb,var(--sc) 30%,#fff) 0,var(--sc) 58%,color-mix(in srgb,var(--sc) 62%,#2a1400) 100%) !important;
  box-shadow:0 5px 12px rgba(70,40,10,.3),inset 0 0 0 3px rgba(255,255,255,.92),inset 0 -6px 10px rgba(0,0,0,.18) !important}
${P} .eqsl.rr1{box-shadow:0 0 0 3px #7ad8a0,0 0 14px rgba(122,216,160,.7),0 5px 12px rgba(70,40,10,.3),inset 0 0 0 3px rgba(255,255,255,.92),inset 0 -6px 10px rgba(0,0,0,.18) !important}
${P} .eqsl.rr2{box-shadow:0 0 0 3px #6aa8ff,0 0 14px rgba(106,168,255,.75),0 5px 12px rgba(70,40,10,.3),inset 0 0 0 3px rgba(255,255,255,.92),inset 0 -6px 10px rgba(0,0,0,.18) !important}
${P} .eqsl.rr3{box-shadow:0 0 0 3px #c07aff,0 0 16px rgba(192,122,255,.8),0 5px 12px rgba(70,40,10,.3),inset 0 0 0 3px rgba(255,255,255,.92),inset 0 -6px 10px rgba(0,0,0,.18) !important}
${P} .eqsl.rr4{box-shadow:0 0 0 3px #ffb830,0 0 18px rgba(255,184,48,.85),0 5px 12px rgba(70,40,10,.3),inset 0 0 0 3px rgba(255,255,255,.92),inset 0 -6px 10px rgba(0,0,0,.18) !important}
${P} .eqsl:not(.full){filter:saturate(.55) brightness(1.08);opacity:.85}
${P} .eqsl .eqbox{width:68% !important;height:68% !important;margin:0 !important;background:none !important;border:0 !important;box-shadow:none !important;
  display:flex !important;align-items:center !important;justify-content:center !important;place-self:center !important;transform:none !important}
${P} .eqsl .eqbox > svg,${P} .eqsl .eqbox > img{width:100% !important;height:100% !important;margin:0 !important;filter:drop-shadow(0 2px 3px rgba(0,0,0,.3))}
${P} .eqsl .eqbox > svg.ghost{width:56% !important;height:56% !important;color:#fff !important;opacity:.95}
${P} .eqsl::after{background:var(--sc) !important;color:#fff !important;-webkit-text-fill-color:#fff !important;border:2px solid #fff !important;border-radius:10px !important;
  padding:0 8px !important;font:700 11px/1.5 var(--display,sans-serif) !important;text-shadow:0 1px 1px rgba(0,0,0,.35) !important;box-shadow:0 2px 4px rgba(0,0,0,.2) !important;bottom:-12px !important;inset:auto auto -12px 50% !important}
${P} .eqsl .eqx{position:absolute !important;top:0 !important;right:0 !important;left:auto !important;bottom:auto !important;width:22px !important;height:22px !important;min-width:0 !important;padding:0 !important;border-radius:50% !important;background:#fff !important;border:2px solid #e05a4a !important;color:#e05a4a !important;display:grid !important;place-items:center;box-shadow:0 1px 3px rgba(0,0,0,.25) !important;z-index:4}
${P} .eqsl .eqx svg{width:12px !important;height:12px !important;stroke:#e05a4a !important}
${Object.entries(pos).map(([k, a]) => `${P} .eqsl-${k}{${at(a)}}`).join('\n')}`;
  document.head.appendChild(st); }
