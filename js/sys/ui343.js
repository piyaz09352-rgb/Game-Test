/* VAYRATHEN — js/sys/ui343.js — (v343) the owner, on a phone: «the chips get in the way»
   The chips (Auto · ออนไลน์ · พักจอ · GM) sat under the minimap, and on a phone, where the skill buttons reach up, they
   were moved out to the left of the minimap — into the middle of the field. Now they live INSIDE the minimap card, a small
   row along its bottom edge (hud343.css), on every screen: nothing in the field, nothing under a thumb. When the minimap
   is folded away they go back under it as before. */
'use strict';
{ const _h6c = typeof h6Chips === 'function' ? h6Chips : null;
  const place = () => { const ch = el('chips'), mc = el('mapCard'), ui = el('ui'); if (!ch || !mc || !ui) return false;
    const inside = false;   // (v348) the owner: «ปรับให้อยู่ใต้แผนที่จะสวยกว่า» — the chips sit under the minimap card again (js below)
    // decide again only when something that matters changed (not every frame: moving it in and out to measure would flicker)
    const key = [inside, mc.clientWidth, [...ch.children].filter(e => !e.hidden && e.style.display !== 'none').map(e => e.textContent).join('|')].join('/');
    if (key === place.key) return ch.parentNode === mc; place.key = key;
    if (inside && ch.parentNode !== mc){ mc.appendChild(ch); ch.classList.add('inmap'); }
    // (v345) more chips than fit across the card (Auto · ออนไลน์ · พักจอ · GM on a phone): they go under the card instead
    if (inside && ch.offsetWidth > mc.clientWidth - 12){ ui.appendChild(ch); ch.classList.remove('inmap'); return false; }
    else if (!inside && ch.parentNode === mc){ ui.appendChild(ch); ch.classList.remove('inmap'); }
    return inside; };
  if (_h6c) h6Chips = function(){ if (place()) return; const r = _h6c.apply(this, arguments);
    // (v348) on a phone the skill wheel's top button sits just under the card: a tighter gap keeps the chips under the
    // card (where the owner wants them) instead of out in the field beside it
    const ui = el('ui'), ch = el('chips'), mc = el('mapCard');
    if (ui && ch && mc && ch.offsetWidth && typeof hudPut === 'function' && typeof brect === 'function'){ const U = brect(ui), M = brect(mc), C = brect(ch);
      if (C.right <= M.left + 2){ const k = (U.height / (ui.offsetHeight || 1)) || 1, m = Math.max(6, Math.round(U.right - M.right));
        hudPut(ch, m, M.bottom - U.top + 3 * k, 'r'); const C2 = brect(ch);
        const hit = [...document.querySelectorAll('#ui .mo')].some(b => { if (!b.offsetWidth) return false; const B = brect(b); return B.left < C2.right && B.right > C2.left && B.top < C2.bottom && B.bottom > C2.top; });
        if (!hit) return r;
        // still under a button at the right: under the card's left edge (the wheel's top button is at its right)
        hudPut(ch, Math.round(U.right - M.left - C2.width), M.bottom - U.top + 3 * k, 'r'); const C3 = brect(ch);
        const hit2 = C3.left < M.left - 2 || [...document.querySelectorAll('#ui .mo')].some(b => { if (!b.offsetWidth) return false; const B = brect(b); return B.left < C3.right && B.right > C3.left && B.top < C3.bottom && B.bottom > C3.top; });
        if (hit2) return _h6c.apply(this, arguments); } }
    return r; };
  if (typeof h6Layout === 'function'){ const _l = h6Layout; h6Layout = function(){ const r = _l.apply(this, arguments); try { place(); } catch (e) {} return r; }; }
  EV.on('tick', () => { try { place(); } catch (e) {} }); }

/* (v343) the owner: «the joystick button disappears». The stick only shows in joystick mode, and «Auto» picked it from
   the browser's own guess (pointer: coarse) — a phone that reports a fine pointer (a stylus, some Android browsers, a
   picture turned in Settings) got mouse mode and no stick. Now any touch screen counts, and the first real touch
   switches Auto to the stick at once. The stick is also kept on screen: a saved layout that left it outside, or a
   zero size, puts it back in the bottom-left corner. */
if (typeof controlMode === 'function'){ const touchy = () => !!(matchMedia('(any-pointer:coarse)').matches || (navigator.maxTouchPoints || 0) > 0 || UI343.touched);
  const UI343 = globalThis.UI343 = {touched:false};
  controlMode = function(){ const c = SETTINGS.control || 'auto'; return c === 'auto' ? (touchy() ? 'joy' : 'mouse') : c; };
  addEventListener('touchstart', () => { if (UI343.touched) return; UI343.touched = true; if ((SETTINGS.control || 'auto') === 'auto' && !el('ui').classList.contains('moba')) try { applyControlMode(); } catch (e) {} }, {passive:true, capture:true});
  EV.on('tick', () => { const ui = el('ui'), jz = el('joyZone'), j = el('joy'); if (!ui || !jz || !j || !ui.classList.contains('moba') || ui.classList.contains('on-title') || (typeof HE !== 'undefined' && HE.on)) return;
    if ((UI343.chk = (UI343.chk || 0) + 1) % 30) return;
    const U = ui.getBoundingClientRect(), r = j.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const lost = r.width < 20 || getComputedStyle(jz).display === 'none' || cx < U.left - 4 || cx > U.right + 4 || cy < U.top - 4 || cy > U.bottom + 4;
    if (lost){ for (const p of ['left', 'top', 'right', 'bottom', 'transform', 'transform-origin', 'width', 'height', 'display']) jz.style.removeProperty(p); ui.classList.remove('hejoy');
      if (typeof HE !== 'undefined' && HE.data){ for (const o in HE.data) if (HE.data[o]) delete HE.data[o].joy; try { heSave(); } catch (e) {} }
      if (typeof mlyLayout === 'function') try { mlyLayout(); } catch (e) {} } }); }
