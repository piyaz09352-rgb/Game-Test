/* VAYRATHEN — js/sys/nanguard.js — (v184) money and item counts can never become NaN
   A sale once left the purse showing "NaN": a single bad number (a count or a price that was not a number) poisons the
   purse for good, and a save then writes it as null. Now:
   · addItem only takes real numbers (anything else counts as 1, a zero or less adds nothing)
   · a bag count that is not a finite number is dropped; Bia and Vayra coins that stop being finite go back to the last
     good amount (checked every frame and right before each save)
   · a selling price is always a whole finite number (an item with no price sells for 0) */
'use strict';

const NG = {bia:0, coin:0};
function ngFix(){
  if (!S) return;
  if (Number.isFinite(S.bia)) NG.bia = S.bia; else S.bia = NG.bia;
  if (S.inv) for (const k in S.inv){ const n = S.inv[k]; if (!Number.isFinite(n)) delete S.inv[k]; else if (n % 1) S.inv[k] = Math.round(n); }
  if (typeof ACC !== 'undefined' && ACC){ if (Number.isFinite(ACC.coins)) NG.coin = ACC.coins; else if ('coins' in ACC) ACC.coins = NG.coin;
    if (ACC.bank && 'bia' in ACC.bank && !Number.isFinite(ACC.bank.bia)) ACC.bank.bia = 0; }
}
{ const _ai = addItem;
  addItem = function(id, n){ n = n == null ? 1 : +n; if (!Number.isFinite(n)) n = 1; if (n <= 0 && !(S.inv[id] > 0)) return; return _ai.call(this, id, Math.round(n)); }; }
{ const _sv = save; save = function(){ ngFix(); return _sv.apply(this, arguments); }; }
EV.on('tick', ngFix);
/* prices: every item's sell value is a finite whole number */
for (const k in ITEMS){ const it = ITEMS[k]; if (it && it.sell != null && !Number.isFinite(+it.sell)) it.sell = 0; }
{ const _mr = marketRate; marketRate = function(){ const r = _mr.apply(this, arguments); return Number.isFinite(r) ? r : 1; }; }
