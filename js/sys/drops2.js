/* VAYRATHEN — js/sys/drops2.js — (v159) drops are random, special pieces come from bosses only
   · A monster's gear drop is any piece near its level: any weapon type, armour, headgear, shoes, accessories, no
     matter which class is doing the killing (it used to roll only the killer's own weapon type). Trading, the market
     and the bank decide who ends up wearing it.
   · Special pieces drop from bosses only:
       – class weapons (the ones marked "เฉพาะสาย…", made for one line) never drop from ordinary monsters
       – the Legendary grade (ตำนาน) never rolls on an ordinary monster's drop
   · Elites (หัวหน้าฝูง, the alpha of a pack) are not bosses: their drop is a better roll than a normal monster's
     (more Rare and Epic) but never a class weapon and never Legendary. */
'use strict';

const DROP2 = {m:null};
const dropBoss = m => !!(m && m.def && m.def.boss && !m.elite);
const gearSpecial = g => !!(g[6] && (g[6].line || g[6].special || g[6].set));
gearDrop = function(m){
  DROP2.m = m;
  const lvl = m.def.lvl, boss = dropBoss(m);
  const pool = GEAR_LIST.filter(g => g[1] !== 'ammo' && g[4] <= lvl + 5 && g[4] >= Math.min(lvl, LV_MAX) - 30 && (boss || !gearSpecial(g)));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)][0];
};
RAR_ODDS.mob = [.64, .27, .09, 0];
RAR_ODDS.elite = [.42, .4, .18, 0];
{ const _rg = rollGear;
  rollGear = function(id, src){ const m = DROP2.m; DROP2.m = null;
    if (m && !dropBoss(m) && (src === 'boss' || src === 'fury' || src === 'rampage' || src === 'mob')) arguments[1] = m.elite ? 'elite' : 'mob';
    return _rg.apply(this, arguments); }; }
