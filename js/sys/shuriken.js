/* VAYRATHEN — js/sys/shuriken.js — (v184) the ninja line throws ดาวกระจาย
   What changed for นินจา → นินจาเงา → จอมนินจาคาเงะ:
   · the weapon is ดาวกระจาย (wtype 'shuriken', data/gear.js): held in one hand but a two-handed class of weapon (no
     shield, and no two-blow double strike: it is a ranged weapon)
   · the normal attack is ranged and magic: one star thrown at the target (combat.js shurShot) for MATK damage in the
     element of the stars in the pouch; unlike a spell it can be a critical hit (LUK, CRIT and the ninja's crit skills)
   · every throw uses one star from the pouch, 1:1, like arrows for a bow; the stars (iron, fire, frost, gale, stone,
     silver, shadow) are sold in packs of 100 at the smith (โรงตีเหล็ก › ร้านอุปกรณ์ › ดาวกระจาย), the weapons in its weapon tab
   · the skills are thrown stars and ninjutsu, all magic (sys/newlines.js)
   This file moves an old ninja save over: a dagger or katana that no longer fits goes back to the bag, and a ninja with
   no stars at all is handed 1,000 iron stars once. */
'use strict';

const SHUR = {gift:1000};
const shurUser = () => !!(S && JOBS[S.job] && JOBS[S.job].weapon.type === 'shuriken');
EV.on('tick', () => {
  if (typeof PAUSED !== 'undefined' && PAUSED || !S || !S.lvl || !shurUser()) return;
  S.gear = S.gear || {};
  // a worn weapon the ninja cannot use any more (the old kunai, ninjato and katana) goes back into the bag
  const w = S.gear.weapon; if (w && ITEMS[w] && !canWield(ITEMS[w])){ addItem(w, 1); S.gear.weapon = null; derive(); dirty = true; }
  if (S.gear.ammo && !ammoFits(S.gear.ammo)) S.gear.ammo = null;
  if (S.starGift !== 1){ S.starGift = 1;
    if (!arrowCount()){ addItem('s_iron', SHUR.gift); S.gear.ammo = 's_iron'; derive(); dirty = true;
      log(L('ได้รับดาวกระจายเหล็ก 1,000 ดวง · นินจาปาดาวกระจายแล้ว ใช้ 1 ดวงต่อการโจมตี 1 ครั้ง ซื้อเพิ่มที่โรงตีเหล็ก', 'Received 1,000 iron stars · ninjas now throw shuriken, one per attack · buy more at the smith'), 'g'); } }
  if (!S.gear.ammo){ const o = ammoOther(); if (o){ S.gear.ammo = o[0]; derive(); } }
});
/* (v183's skilluniq.js gave the Kage's passive speed and dodge; it keeps them and gains the MATK the stars need) */
if (SKILLS.kagemastery) SKILLS.kagemastery.pas = lv => ({matkPct:+(lv * .03).toFixed(2), aspdPct:+(lv * .02).toFixed(2), dodge:+(lv * .005).toFixed(3)});
if (SKILLS.kagemastery && typeof nlDesc === 'function') SKILLS.kagemastery.desc = nlDesc(SKILLS.kagemastery);
