/* VAYRATHEN — js/game/save.js
   One character per account (v29; per browser + per claude.ai account in the cloud). Classes are switched at a camp
   instead (sys/classswap.js). Slot 0 keeps the old key; a hero left in an old second or third slot moves into it. */
'use strict';

const SLOTS = 1, SLOTKEY = 'vayrathen-slot';
let SLOT = 0; try { SLOT = Math.min(SLOTS - 1, Math.max(0, +localStorage.getItem(SLOTKEY) || 0)); } catch (e) {}
const slotKey = i => (i ? `${KEY}-s${i}` : KEY);
try { if (!localStorage.getItem(KEY)) for (const i of [1, 2]){ const r = localStorage.getItem(`${KEY}-s${i}`); if (r){ localStorage.setItem(KEY, r); localStorage.removeItem(`${KEY}-s${i}`); break; } } } catch (e) {}
function setSlot(i){ SLOT = i; try { localStorage.setItem(SLOTKEY, String(i)); } catch (e) {} }

/* ---------- save ---------- */
function save(){ if (typeof instPrune === 'function') instPrune(); S.x = P.x; S.y = P.y; S.savedAt = Date.now(); try { localStorage.setItem(slotKey(SLOT), JSON.stringify(S)); } catch (e) {} if (typeof cloudSave === 'function') cloudSave(); }
function load(i = SLOT){
  try { const raw = localStorage.getItem(slotKey(i)); if (raw){ const o = JSON.parse(raw); if (o && o.v >= 1){ biaMig(o); if (o.bank) biaMig(o.bank); const s = Object.assign(newS(), o); if (!JOBS[s.job]){ if (document.readyState === 'loading') return null; s.job = 'novice'; }   /* (v236) while the page is still loading, later job lines are not registered yet: never turn a hero into a villager then */ if (!Array.isArray(s.hot) || s.hot.length !== 6) s.hot = [null, null, null, null, null, null]; if (JOBS[s.job] && JOBS[s.job].weapon.type === 'bow' && !s.arrowGift){ s.arrowGift = 1; s.gear = s.gear || {}; s.inv.q_wood = (s.inv.q_wood || 0) + 500; if (!s.gear.ammo) s.gear.ammo = 'q_wood'; }
    if (!s.look) s.look = {sex:'m', hair:0, color:''}; if (typeof instReg === 'function') instReg(s); return migrateSave(s); } } } catch (e) {}
  return null;
}
function deleteSlot(i){ try { localStorage.removeItem(slotKey(i)); } catch (e) {} if (typeof cloudDelete === 'function') cloudDelete(i); }
const allSlots = () => Array.from({length:SLOTS}, (_, i) => load(i));
