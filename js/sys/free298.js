/* VAYRATHEN — js/sys/free298.js — (v298) the owner: «bring back free fashion, the helper robots and the free deer to ride»
   · every hero has the Golden Deer in the bag from the start and can ride at once (R / the Ride button);
   · every helper robot can be taken for free and kept (the coin shop and Uncle Boonma show «use free» instead of rent prices);
   · fashion: every outfit is free to wear (js/sys/costume2.js cosHave). */
'use strict';
const FREE298 = {forever:3153600000};   // a robot kept "for good": a hundred years on the real clock
if (ITEMS.mount1){ ITEMS.mount1.buy = 0; ITEMS.mount1.desc = ['สัตว์ขี่ฟรีของทุกคน · ขี่แล้วเดินเร็วขึ้น 30% · กด R หรือปุ่ม «ขี่» · อยู่ในกระเป๋าตลอด ใช้ไม่หมด', 'Everyone\'s free mount · 30% faster · press R or the Ride button · stays in the bag, never used up']; }
function free298Grant(){ if (!S || !S.inv) return; if (!(S.inv.mount1 > 0)){ S.inv.mount1 = 1; dirty = true; } }
{ let last = null; EV.on('tick', () => { if (S && S !== last){ last = S; free298Grant(); } }); }

/* robots: «use free» instead of rent prices, wherever they are offered */
function free298Bot(k){ if (!HELPERS[k]) return; S.helper = {k, left:FREE298.forever}; S.helperFree = S.helperFree || null; dirty = true;
  if (typeof toast === 'function') toast(L(`${HELPERS[k].en} มาอยู่กับคุณแล้ว (ฟรี)`, `${HELPERS[k].en} is with you now (free)`)); if (typeof save === 'function') save(); }
const free298Fix = root => { if (!root) return; for (const box of root.querySelectorAll('.rentbtns, .cshit.bot .cshb')){ const b0 = box.querySelector('[data-rentpet]'); if (!b0) continue; const k = b0.dataset.rentpet;
    const mine = S.helper && S.helper.k === k; box.innerHTML = mine ? `<span class="pr">✓ ${L('อยู่กับคุณ', 'With you')}</span>` : `<button class="btn sm gold" data-botuse="${k}">${L('ใช้ฟรี', 'Use free')}</button>`; } };
if (typeof cshBots === 'function'){ const _cb = cshBots; cshBots = function(){ const d = document.createElement('div'); d.innerHTML = _cb.apply(this, arguments); free298Fix(d);
    for (const h of d.querySelectorAll('.cshnow span')) h.innerHTML = h.innerHTML.replace(/กำลังเช่า|Renting/, L('อยู่กับคุณ', 'With you')).replace(/ · (เหลือ|left).*$/, ''); return d.innerHTML; }; }
if (typeof NPC_OPEN !== 'undefined' && NPC_OPEN.beastkeeper){ const _bk = NPC_OPEN.beastkeeper; NPC_OPEN.beastkeeper = function(){ const r = _bk.apply(this, arguments); free298Fix(el('dialog')); return r; }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-botuse]'); if (!b) return; e.stopPropagation(); free298Bot(b.dataset.botuse);
  if (typeof winOpen === 'function' && winOpen('cshop')) reWin('cshop'); const n = NPCS.find(x => x.id === 'beastkeeper'); if (n && !el('dialog').hidden && el('dialog').dataset.npc === 'beastkeeper') NPC_OPEN.beastkeeper(n); }, true);
