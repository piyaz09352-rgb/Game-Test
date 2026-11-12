/* VAYRATHEN — js/sys/paneguard.js — open windows stop blinking while you play (v60)
   Every kill, pick-up or Auto step refreshes the open windows. The Equipment / Fashion window was rebuilt from
   scratch each time, so the hero in its preview, the costume pictures and the scroll position blinked and jumped
   while Auto was running. Now a window's contents are only replaced when what it shows has actually changed;
   otherwise the same picture simply stays (the hero preview keeps animating). */
'use strict';

{ const d = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  const guard = id => { const e = document.getElementById(id); if (!e || e.__pg) return; e.__pg = true;
    Object.defineProperty(e, 'innerHTML', {configurable:true, get(){ return d.get.call(this); },
      set(v){ v = typeof artIds === 'function' ? artIds(this, String(v)) : String(v); if (v === this.__pgLast && this.childNodes.length) return; this.__pgLast = v; d.set.call(this, v); }}); };
  for (const id of ['pane-equip', 'pane-stat', 'pane-skill', 'pane-quest', 'pane-log', 'bagGrid', 'bagInfo', 'hotbar', 'goal']) guard(id); }
