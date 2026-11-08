/* VAYRATHEN — js/sys/bosscoin272.js — (v272) region bosses drop Vayra Coins
   Agreed with the owner: a region boss gives 1–2 Vayra Coins, a strong one (Lv 150 and up) 3–5 — to everyone who
   helped bring it down (3% of its HP, or the last blow), not only the one who landed the last blow.
   · At most 30 coins a day from bosses (per account), so hopping maps for bosses does not flood the coin shop.
   · A boss more than 20 levels below you gives none (no going back to farm the first maps).
   · Bosses of the tower, the dungeons, the world boss and the invasion's warlord have their own rewards and do not count. */
'use strict';
const BCOIN = {cap:30, gap:20, share:.03, my:new WeakMap(), paid:new WeakSet()};
const bcoinOk = m => m && m.def && m.def.boss && !m.wb && !m.def.wb && !m.tw && !m.dg && !m.def.dg && !m.inv && !m.minion && !(typeof TW !== 'undefined' && TW.active) && !(typeof DG !== 'undefined' && DG.active);
{ const _ad = applyDamage; applyDamage = function(m){ const h0 = m && bcoinOk(m) ? m.hp : 0; const r = _ad.apply(this, arguments);
    if (h0 && m.maxhp){ BCOIN.my.set(m, (BCOIN.my.get(m) || 0) + Math.max(0, h0 - Math.max(0, m.hp)) / m.maxhp); } return r; }; }
function bcoinPay(m){
  if (!bcoinOk(m) || BCOIN.paid.has(m) || typeof coinAdd !== 'function' || typeof ACC === 'undefined') return; BCOIN.paid.add(m);
  if ((m.def.lvl || 0) < S.lvl - BCOIN.gap) return;
  const d = typeof dayKey === 'function' ? dayKey() : 0, st = ACC.bossCoin = ACC.bossCoin && ACC.bossCoin.d === d ? ACC.bossCoin : {d, n:0};
  if (st.n >= BCOIN.cap){ if (!st.told){ st.told = 1; toast(L('วันนี้ได้เหรียญจากบอสครบ 30 แล้ว', 'You have had today\'s 30 coins from bosses')); } return; }
  const strong = (m.def.lvl || 0) >= 150, n = Math.min(BCOIN.cap - st.n, strong ? 3 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2));
  st.n += n; coinAdd(n, L(`บอส ${nm(m.def)} · วันนี้ ${st.n}/${BCOIN.cap}`, `boss ${nm(m.def)} · today ${st.n}/${BCOIN.cap}`));
  if (typeof addText === 'function') addText(m.x, m.y - (typeof MOB_H !== 'undefined' && MOB_H[m.type] || 60) - 40, `◈ +${n}`, '#c8a0ff', 18);
}
// the last blow is mine
EV.on('kill', m => { try { bcoinPay(m); } catch (e) {} });
// someone else landed it: I still get mine if I helped enough
EV.on('tick', () => { if (typeof mobs === 'undefined') return; for (const m of mobs) if (m.dead && bcoinOk(m) && !BCOIN.paid.has(m) && (BCOIN.my.get(m) || 0) >= BCOIN.share) try { bcoinPay(m); } catch (e) {} });
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'bosscoin', t:['เหรียญวายราจากบอส', 'Vayra Coins from bosses'], b:() => L(
  '<p>บอสประจำแคว้นดรอปเหรียญวายรา 1–2 เหรียญ · บอสเก่ง (Lv 150 ขึ้นไป) 3–5 เหรียญ · ได้ทุกคนที่ช่วยตีอย่างน้อย 3% ของ HP · วันละไม่เกิน 30 เหรียญต่อบัญชี · บอสที่เลเวลต่ำกว่าเราเกิน 20 ไม่ให้เหรียญ · บอสในหอคอย ดันเจี้ยน บอสโลก และแม่ทัพการรุกราน มีรางวัลของตัวเองแยกต่างหาก</p>',
  '<p>Region bosses drop 1–2 Vayra Coins · strong bosses (Lv 150+) 3–5 · everyone who dealt at least 3% of its HP gets them · at most 30 a day per account · a boss more than 20 levels below you gives none · tower, dungeon, world boss and invasion warlords have their own rewards</p>')});
