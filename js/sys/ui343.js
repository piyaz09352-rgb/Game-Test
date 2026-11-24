/* VAYRATHEN — js/sys/ui343.js — (v343) the owner, on a phone: «the chips get in the way»
   The chips (Auto · ออนไลน์ · พักจอ · GM) sat under the minimap, and on a phone, where the skill buttons reach up, they
   were moved out to the left of the minimap — into the middle of the field. Now they live INSIDE the minimap card, a small
   row along its bottom edge (hud343.css), on every screen: nothing in the field, nothing under a thumb. When the minimap
   is folded away they go back under it as before. */
'use strict';
{ const _h6c = typeof h6Chips === 'function' ? h6Chips : null;
  const place = () => { const ch = el('chips'), mc = el('mapCard'), ui = el('ui'); if (!ch || !mc || !ui) return false;
    const inside = ui.classList.contains('h6') && !mc.classList.contains('folded') && mc.offsetWidth > 0;
    if (inside && ch.parentNode !== mc){ mc.appendChild(ch); ch.classList.add('inmap'); }
    else if (!inside && ch.parentNode === mc){ ui.appendChild(ch); ch.classList.remove('inmap'); }
    return inside; };
  if (_h6c) h6Chips = function(){ if (place()) return; return _h6c.apply(this, arguments); };
  if (typeof h6Layout === 'function'){ const _l = h6Layout; h6Layout = function(){ const r = _l.apply(this, arguments); try { place(); } catch (e) {} return r; }; }
  EV.on('tick', () => { try { place(); } catch (e) {} }); }
