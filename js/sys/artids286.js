/* VAYRATHEN — js/sys/artids286.js — (v286) item art keeps the same ids from one redraw to the next
   Loaded last of everything that wraps innerHTML, so the renumbering (artIds, js/ui/itemart.js) happens before any of
   the "skip a redraw that changes nothing" checks (steady, keepscroll, nofl, dlgmorph …) look at the markup. The
   windows that paneguard.js guards do the same in their own setter. */
'use strict';
{ const d = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  Object.defineProperty(Element.prototype, 'innerHTML', {configurable:true, enumerable:d.enumerable, get:d.get,
    set(v){ return d.set.call(this, typeof v === 'string' && typeof artIds === 'function' ? artIds(this, v) : v); }});
  const ia = Element.prototype.insertAdjacentHTML;
  Element.prototype.insertAdjacentHTML = function(pos, v){ return ia.call(this, pos, typeof v === 'string' && typeof artIds === 'function' ? artIds(this, v) : v); }; }
