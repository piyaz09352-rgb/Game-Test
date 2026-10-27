/* VAYRATHEN — js/sys/menutrim.js — a lighter menu (v27)
   · The menu no longer lists Log (your messages are in the chat's System tab), Crafting (the forger in Aren, or key I)
     and the World map — the world map is a small globe button at the bottom-right corner of the minimap (key M still works).
   · v32: the globe sits above the minimap, in the clock row beside the hide-UI eye, never on the map.
   · v28: the Arena (สนามประลอง) leaves the menu too (key P still opens it); the player market is now called ตลาดกลาง. */
'use strict';
{ const st = document.createElement('style');
  st.textContent = `#rail .mb[data-win="log"],#rail .mb[data-win="craft"],#rail .mb[data-win="world"],#rail .mb[data-win="arena"]{display:none!important}
  #mmWorld{position:relative;flex:none;z-index:3;width:26px;height:26px;border-radius:50%;border:2px solid #fff;background:linear-gradient(180deg,#5fb0ff,#2a6ad8);color:#fff;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.35)}
  #mmWorld svg{width:15px;height:15px}#mmWorld[hidden]{display:none}`;
  document.head.appendChild(st); }
function mmWorldPlace(){
  const card = el('mapCard'), cv = el('minimap'); if (!card || !cv) return;
  let b = el('mmWorld');
  if (!b){ b = document.createElement('button'); b.id = 'mmWorld'; b.type = 'button'; b.dataset.winOpen = 'world'; b.title = L('แผนที่โลก (M)', 'World map (M)'); b.setAttribute('aria-label', L('แผนที่โลก', 'World map'));
    b.innerHTML = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="10" cy="10" r="7"/><path d="M3 10h14M10 3c2.4 2.2 2.4 11.8 0 14M10 3c-2.4 2.2-2.4 11.8 0 14"/></svg>';
    b.addEventListener('click', e => { e.stopPropagation(); if (typeof toggleWin === 'function') toggleWin('world'); else openWin('world'); });
    (card.querySelector('.mt') || card).appendChild(b); }
  const shown = cv.offsetParent && cv.offsetHeight > 20; b.hidden = !shown;
}
setInterval(mmWorldPlace, 700); window.addEventListener('resize', () => setTimeout(mmWorldPlace, 50));
