/* VAYRATHEN — js/sys/economy.js — (v192) a harder economy, set in one place
   The owner asked for drops and money to be harder (half) and every rate back to x1 (core/util.js RATE/JRATE).
   Monsters drop no money: income is selling their loot, so halving both the drop chances and the sell prices leaves
   about a quarter of the old income from hunting. Change ECON to tune it; 1 = the v191 values.
   Runs last (after every item and monster is defined); gear made later (instances, refines) takes its base's price. */
'use strict';
const ECON = {drop:.5, card:.5, sell:.5, mvpBia:1500};
for (const k in MOB){ const d = MOB[k]; if (!d || d._econ) continue; d._econ = 1;
  if (Array.isArray(d.drops)) d.drops = d.drops.map(([id, ch]) => [id, ch * ECON.drop]);
  if (d.cardRate) d.cardRate *= ECON.card; }
for (const k in ITEMS){ const it = ITEMS[k]; if (!it || it._econ || typeof it.sell !== 'number') continue; it._econ = 1; it.sell = Math.max(1, Math.round(it.sell * ECON.sell)); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'econ', t:['เศรษฐกิจและอัตรา', 'Economy and rates'], b:() => L(
  `<p>อัตรา EXP · Job · ดรอป = x1 (ปกติ)</p><p>โอกาสดรอปของและการ์ด และราคาที่ NPC รับซื้อ เหลือครึ่งหนึ่งของเดิม (v192) · v269: ไม่มีของดรอปไหนเกิน 50% · การ์ดมอน 0.01% หัวหน้าฝูง 0.02% บอส 0.005% · บอสให้ MVP ${ECON.mvpBia.toLocaleString()} เบี้ย</p>`,
  `<p>EXP · Job · drop rates = x1 (normal)</p><p>Item and card drop chances and NPC buy-back prices are half of before (v192) · v269: no drop above 50% · cards: monsters 0.01%, alphas 0.02%, bosses 0.005% · a boss gives the MVP ${ECON.mvpBia.toLocaleString()} Bia</p>`)});
