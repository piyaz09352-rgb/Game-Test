/* VAYRATHEN — js/sys/steadymoba.js — (v112) the touch buttons stop blinking
   Why they blinked: every time the game marked itself changed (a cast, a kill, a pick-up: many times a minute under
   Auto) the side panel was redrawn, which redraws the hotbar, which rebuilt the touch buttons from scratch: new
   skill icons, cooldown rings reset to nothing for a frame, the "A" badges added again. On a phone that reads as the
   skill buttons (often the 3rd, sitting mid-ring) jumping and flashing.
   Now the three touch button groups keep their buttons when the new markup is exactly the same as what they already
   hold: only a real change (another skill, a skill level, the potion count, riding, Auto on/off) rebuilds them. */
'use strict';
for (const id of ['mobaAct', 'mobaPot', 'mobaUtil']){
  const box = el(id); if (!box) continue;
  const d = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  Object.defineProperty(box, 'innerHTML', {configurable:true,
    get(){ return d.get.call(this); },
    set(v){ v = String(v); if (v === this.__smH && this.childElementCount) return; this.__smH = v; d.set.call(this, v); }});
}
