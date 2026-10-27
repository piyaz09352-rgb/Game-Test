/* VAYRATHEN — js/sys/setclean.js — a shorter menu and Settings: nothing twice, nothing off-topic
   · Menu: "บันทึกและออก" is gone (the game saves by itself; Settings → "กลับหน้าเริ่มเกม" is the way out).
   · Settings: "ออกจากระบบ" lives on the title screen only (its account bar), not here as well.
   · "ทดสอบความลื่น" is gone: the graphics setting already tunes itself (Auto) and lowers itself when frames drop.
   · "กล้องเลื่อนนุ่ม" is folded into "ภาพนุ่มนวล" (one switch: smooth picture = smooth camera too).
   · "โทนอุ่น" slider is gone: the "อบอุ่น" preset is the warm look.
   · "รักษาระยะ (สายเวท/ธนู)" moves from Display to Controls, and "ขนาด UI" back to Display, where they belong. */
'use strict';

SETTINGS.smoothCam = true;
/* the menu: no save-and-exit */
function scMenu(){ const b = el('btnExit'); if (b) b.remove(); const sep = document.querySelector('#rail .msep'); if (sep && !sep.nextElementSibling) sep.remove(); }
scMenu(); setTimeout(scMenu, 0); EV.on('netready', scMenu);
{ const _rs = renderSettings;
  renderSettings = function(){
    const out = _rs.apply(this, arguments); const pane = el('pane-settings'); if (!pane) return out;
    const rowOf = n => n && (n.closest('.set') || n.closest('.row') || n);
    for (const id of ['setLogout', 'setPerf']){ const n = el(id); if (!n) continue; const r = n.closest('.row'); n.remove(); if (r && !r.querySelector('button, input, select')) r.remove(); }
    const cam = pane.querySelector('[data-smooth="smoothCam"]'); if (cam) rowOf(cam).remove();
    const warm = pane.querySelector('[data-vis="w"]'); if (warm) rowOf(warm).remove();
    // move "keep distance" to Controls and "UI size" to Display
    const secs = [...pane.querySelectorAll('.sec')], secOf = re => secs.find(s => re.test(s.textContent));
    const ctrl = secOf(/การควบคุม|Controls/), disp = secOf(/การแสดงผล|Display/), light = secOf(/แสงและสี|Light/);
    const kite = rowOf(el('set-kite')), ui = rowOf(el('set-uiScale'));
    if (kite && ctrl){ let after = ctrl; while (after.nextElementSibling && !after.nextElementSibling.classList.contains('sec')) after = after.nextElementSibling; after.after(kite); }
    if (ui && disp && light) light.before(ui);
    pane.querySelectorAll('.row').forEach(r => { if (!r.querySelector('button, input, select')) r.remove(); });
    return out;
  };
}
