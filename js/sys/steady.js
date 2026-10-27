/* VAYRATHEN — js/sys/steady.js — the HUD stops flashing in combat (v34)
   Every kill, pick-up or stat change redraws the panels; the hotbar, quest card and touch buttons were rebuilt from
   scratch each time even when nothing on them changed, which made them blink while fighting. For these HUD parts
   a redraw with the very same markup is now skipped, so what is on screen stays put. */
'use strict';
{ const d = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  const STEADY = new Set(['hotbar', 'goal', 'moba', 'mobaSk', 'tSt', 'charStats', 'partyHud']);
  Object.defineProperty(Element.prototype, 'innerHTML', {configurable:true, enumerable:d.enumerable, get:d.get,
    set(v){ if (this.id && STEADY.has(this.id)){ const s = String(v).replace(/(id="|url\(#|href="#)[^"')]*/g, '$1');   // item art gets fresh gradient ids each draw: ignore them
      if (this.__steady === s && this.isConnected && this.childNodes.length) return; this.__steady = s; } d.set.call(this, v); } }); }
