/* VAYRATHEN — js/sys/buyqty.js — buy as many as you want
   Every stackable thing in a shop (potions, talismans, arrows, refine materials) gets a quantity box:
   − / number / + / MAX and one Buy button that shows the total price. Hold − or + to count quickly.
   The last amount you chose for an item is remembered while the game is open. */
'use strict';

const QTY = {last:{}, MAX:9999};
/* kind: 'item' = ITEMS price each · 'pack' = arrows, GEAR price per pack · 'fg' = Blacksmith Phet's materials */
const qtyUnit = (id, kind) => (kind === 'pack' ? (GEAR[id] && GEAR[id].buy) || 0 : (ITEMS[id] && ITEMS[id].buy) || 0);
function qtyBox(id, kind = 'item'){
  const n = QTY.last[id] || 1, unit = qtyUnit(id, kind), lvOk = kind !== 'pack' || !GEAR[id] || S.lvl >= GEAR[id].lv;
  return `<span class="qty" data-qty="${id}" data-qk="${kind}"><button class="qb" data-qd="-1" aria-label="${L('ลด', 'Less')}">−</button><input class="qn" type="number" inputmode="numeric" min="1" max="${QTY.MAX}" value="${n}" aria-label="${L('จำนวน', 'Amount')}"><button class="qb" data-qd="1" aria-label="${L('เพิ่ม', 'More')}">+</button><button class="qb qm" data-qmax="1">MAX</button></span>
    <button class="btn sm gold qgo" data-qbuy="${id}" data-qk="${kind}" ${lvOk && S.bia >= unit ? '' : 'disabled'}>${L('ซื้อ', 'Buy')} <b class="qsum">${(unit * n).toLocaleString()}</b></button>`;
}
const qtyOf = box => { const i = box.querySelector('.qn'); let n = Math.floor(+i.value || 1); n = clamp(n, 1, QTY.MAX); return n; };
function qtySet(box, n){
  const id = box.dataset.qty, kind = box.dataset.qk, unit = qtyUnit(id, kind), i = box.querySelector('.qn');
  n = clamp(Math.floor(n) || 1, 1, QTY.MAX); i.value = n; QTY.last[id] = n;
  const go = box.parentElement.querySelector(`[data-qbuy="${CSS.escape(id)}"]`);
  if (go){ go.querySelector('.qsum').textContent = (unit * n).toLocaleString(); const lvOk = kind !== 'pack' || !GEAR[id] || S.lvl >= GEAR[id].lv; go.disabled = !lvOk || S.bia < unit * n; }
}
function qtyBuy(id, kind, n){
  const unit = qtyUnit(id, kind), cost = unit * n; if (!unit || n < 1) return;
  if (kind === 'pack' && GEAR[id] && S.lvl < GEAR[id].lv){ toast(L(`ต้อง Lv ${GEAR[id].lv}`, `Needs Lv ${GEAR[id].lv}`)); return; }
  if (S.bia < cost){ toast(L('เงินไม่พอ', 'Not enough Bia')); return; }
  S.bia -= cost;
  if (kind === 'pack'){ const gr = GEAR[id]; addItem(id, (gr.pack || 1) * n); if (!S.gear.ammo || !S.inv[S.gear.ammo]){ S.gear.ammo = id; derive(); } }
  else addItem(id, n);
  const got = kind === 'pack' ? (GEAR[id].pack || 1) * n : n;
  SFX.play('coin'); log(L(`ซื้อ ${nm(ITEMS[id] || GEAR[id])} ×${got.toLocaleString()} · ${cost.toLocaleString()} เบี้ย`, `Bought ${nm(ITEMS[id] || GEAR[id])} ×${got.toLocaleString()} · ${cost.toLocaleString()} Bia`));
  toast(L(`ซื้อแล้ว ×${got.toLocaleString()}`, `Bought ×${got.toLocaleString()}`));
  dirty = true; save();
  // redraw the shop so prices, wallet and "have" counts are current
  const d = document.getElementById('dialog');
  if ((kind === 'fg' || (kind === 'pack' && el('win-forge') && !el('win-forge').hidden)) && typeof WIN_RENDER !== 'undefined' && WIN_RENDER.forge) WIN_RENDER.forge();
  else if (d && !d.hidden && d.dataset.npc){ const npc = NPCS.find(x => x.id === d.dataset.npc); if (npc) openNpc(npc); }
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-qbuy],[data-qmax]'); if (!t) return;
  e.preventDefault(); e.stopPropagation();
  if (t.dataset.qmax){ const box = t.closest('.qty'), unit = qtyUnit(box.dataset.qty, box.dataset.qk); qtySet(box, unit ? Math.max(1, Math.floor(S.bia / unit)) : 1); return; }
  if (t.disabled) return;
  const box = t.parentElement.querySelector(`.qty[data-qty="${CSS.escape(t.dataset.qbuy)}"]`); if (!box) return;
  qtyBuy(t.dataset.qbuy, t.dataset.qk, qtyOf(box));
}, true);
/* − / +: one step per tap; hold to repeat, faster and in bigger steps the longer you hold */
{
  let hold = null;
  const stop = () => { if (hold){ clearTimeout(hold.t); hold = null; } };
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest && e.target.closest('.qty [data-qd]'); if (!b) return;
    e.preventDefault(); stop(); const box = b.closest('.qty'), dir = +b.dataset.qd;
    let k = 0; const step = () => { const n = qtyOf(box), s = k < 8 ? 1 : k < 20 ? 5 : k < 35 ? 10 : 50; qtySet(box, n + dir * s); k++; hold = {t:setTimeout(step, k === 1 ? 380 : Math.max(35, 110 - k * 4))}; };
    step();
  });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave', 'blur']) document.addEventListener(ev, stop, true);
}
document.addEventListener('input', e => { const i = e.target; if (!i.classList || !i.classList.contains('qn')) return; const box = i.closest('.qty'); const n = Math.floor(+i.value); if (n >= 1) qtySet(box, n); });
document.addEventListener('change', e => { const i = e.target; if (i.classList && i.classList.contains('qn')) qtySet(i.closest('.qty'), +i.value); });
document.addEventListener('keydown', e => { const i = e.target; if (!i.classList || !i.classList.contains('qn')) return;
  if (e.key === 'Enter'){ e.preventDefault(); const box = i.closest('.qty'), go = box.parentElement.querySelector(`[data-qbuy="${CSS.escape(box.dataset.qty)}"]`); if (go && !go.disabled) go.click(); }
  e.stopPropagation(); }, true);
{
  const st = document.createElement('style');
  st.textContent = `.qty{display:inline-flex;align-items:center;gap:2px;flex:none;background:rgba(0,0,0,.28);border:1px solid rgba(227,176,75,.3);border-radius:999px;padding:2px}
    .qty .qb{width:26px;height:26px;border:0;border-radius:50%;background:rgba(227,176,75,.16);color:#ffe6a0;font:700 16px/1 sans-serif;cursor:pointer;touch-action:none;user-select:none}
    .qty .qb:hover{background:rgba(227,176,75,.32)}.qty .qb:active{transform:scale(.92)}
    .qty .qm{width:auto;padding:0 8px;border-radius:999px;font-size:11px;letter-spacing:.04em}
    .qty .qn{width:58px;height:26px;border:0;background:transparent;color:#fff;text-align:center;font:600 14px var(--display,sans-serif);-moz-appearance:textfield}
    .qty .qn::-webkit-outer-spin-button,.qty .qn::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
    .qgo{white-space:nowrap;min-width:84px}.qgo .qsum{font-weight:700}
    .srow .qty{margin-left:auto}
    @media (pointer:coarse){.qty .qb{width:32px;height:32px}.qty .qn{height:32px}}
    @media (max-width:640px){.srow:has(.qty){flex-wrap:wrap}.srow:has(.qty) .qty{margin-left:0}}`;
  document.head.appendChild(st);
}
