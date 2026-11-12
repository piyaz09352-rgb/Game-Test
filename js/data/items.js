/* VAYRATHEN — js/data/items.js */
'use strict';

const ITEMS = {
  jelly:{name:'เยลลี่น้ำค้าง',en:'Dew Jelly',sell:6,kind:'etc'},
  hide:{name:'หนังกระต่าย',en:'Rabbit Hide',sell:14,kind:'etc'},
  tusk:{name:'เขี้ยวหมูป่า',en:'Boar Tusk',sell:35,kind:'etc'},
  wick:{name:'ไส้เทียนวิญญาณ',en:'Spirit Wick',sell:60,kind:'etc'},
  crown:{name:'มงกุฎเจลลี่',en:'Jelly Crown',sell:2500,kind:'etc'},
  ore:{name:'หินวายรา',en:'Vayra Ore',kind:'mat',desc:['แร่สำหรับตีบวกอาวุธ','Ore for refining weapons']},
  redpot:{name:'ยาแดง',en:'Red Potion',buy:40,kind:'use',heal:60,desc:['ฟื้น HP 60','Restores 60 HP']},
  bluepot:{name:'ยาฟ้า',en:'Blue Potion',buy:300,kind:'use',spheal:40,desc:['ฟื้น SP 40','Restores 40 SP']}
};
const CARDS = {
  c_dew:{name:'Card เจลลี่น้ำค้าง',en:'Dew Jelly Card',slot:'armor',desc:['Max HP +200, LUK +1','Max HP +200, LUK +1']},
  c_hare:{name:'Card กระต่ายเขาเห็ด',en:'Mushroom Hare Card',slot:'weapon',desc:['ดาเมจต่อขนาดเล็ก +15%','+15% damage to small monsters']},
  c_boar:{name:'Card หมูป่าหญ้าทอง',en:'Golden Grass Boar Card',slot:'head',desc:['VIT +2, Max HP +5%','VIT +2, Max HP +5%']},
  c_lantern:{name:'Card ผีโคมลอย',en:'Lantern Ghost Card',slot:'weapon',desc:['อาวุธเป็นธาตุ Holy','Weapon becomes Holy']},
  c_boss:{name:'Card ราชาเจลลี่ทองคำ',en:'Golden Jelly King Card',slot:'head',desc:['ดูด HP และ SP 3% ของดาเมจที่ทำได้','Drains 3% of the damage you deal as HP and SP']}
};
const cardDesc = c => L(...CARDS[c].desc);
const itemDesc = id => (ITEMS[id].desc ? L(...ITEMS[id].desc) : '');
const SLOT_TH = {weapon:'อาวุธ', armor:'เกราะ', head:'หมวก', acc:'เครื่องประดับ'};
const SLOT_EN = {weapon:'Weapon', armor:'Armor', head:'Headgear', acc:'Accessory'};
const STAT_TH = {str:'พลัง',agi:'ว่องไว',vit:'อดทน',int:'ปัญญา',dex:'แม่นยำ',luk:'โชค'};
const STAT_EN = {str:'Strength',agi:'Agility',vit:'Vitality',int:'Intelligence',dex:'Dexterity',luk:'Luck'};
const REFINE_RATE = n => n <= 4 ? 100 : n <= 7 ? 70 : n <= 10 ? 40 : 15;

const nextBase = L => Math.floor(9 * Math.pow(L, 1.8) + 6);
/* the level cap and the stat cap (v241).
   Stat points: 8 + ⌊Lv / 38⌋ every level (48 to start), rising a little every 38 levels with no jumps: 3,483 at Lv 300.
   The stat cap follows the points you have at your level: the highest value that still lets you raise two stats to it,
   a third to 60% of it and a fourth to 40% (at Lv 300: 150 · 150 · 90 · 60). Lv 70 ≈ 56 · Lv 130 ≈ 84 · Lv 180 ≈ 104 ·
   Lv 240 ≈ 128 · Lv 300 = 150. Both keep going past Lv 300 (the level cap can be raised later, up to 999) without a
   new rule. Never shown to players. */
const LV_MAX = 300;
const statGain = lv => 8 + Math.floor(lv / 38);
const STAT_TO = [0, 0];   // points needed to raise a stat from 1 to n
const statTo = n => { while (STAT_TO.length <= n){ const x = STAT_TO.length - 1; STAT_TO.push(STAT_TO[x] + Math.floor((x - 1) / 10) + 2); } return STAT_TO[Math.max(1, n)]; };
const statNeed = c => 2 * statTo(c) + statTo(Math.round(c * .6)) + statTo(Math.round(c * .4));
const STAT_CAPS = [30, 30];   // the cap at each level, filled as needed
/* (v290) the owner: no stat cap ("ใครสั่ง"). STAT_CAP stays as the function every window asks, but it no longer
   limits anything: a stat goes as high as your points take it (each point still costs more every 10). The old
   level-based curve is kept as STAT_CAP_OLD for the balance tools. */
function STAT_CAP(){ return 999; }
function STAT_CAP_OLD(lv){
  lv = Math.max(1, Math.min(999, (lv != null ? lv : (typeof S !== 'undefined' && S && S.lvl) || 1) | 0));
  if (STAT_CAPS.length <= lv){ let t = 48; for (let l = 2; l < STAT_CAPS.length; l++) t += statGain(l); let c = 1;
    for (let l = STAT_CAPS.length; l <= lv; l++){ t += statGain(l); while (statNeed(c + 1) <= t) c++; STAT_CAPS[l] = Math.max(30, c); } }
  return STAT_CAPS[lv];
}
/* job EXP per job level. A class tier spans more base levels the higher it is (Villager ≈ Lv 1–10, 2nd class ≈ Lv 10–65,
   3rd class ≈ Lv 65–125), so its table is scaled per tier: ×1 · ×3 · ×18 (monsters give Job EXP = 30% of their base EXP).
   (v58) the 4th class (Lv 150–300) had no entry and fell back to ×1, so its 50 job levels went by in ~1,700 kills while
   the 3rd class needs ~31,000. It is ×140 now: Job Lv 50 lands around Base Lv 260–270, the endgame stretch. */
const JOB_TIER_MUL = [1, 1, 3, 18, 140];
const jobTierMul = () => (typeof S !== 'undefined' && S && typeof JOBS !== 'undefined' && JOBS[S.job] ? JOB_TIER_MUL[JOBS[S.job].tier] || 1 : 1);
const nextJob = J => Math.floor((5 * Math.pow(J, 1.5) + 5) * jobTierMul());
const statCost = x => Math.floor((x - 1) / 10) + 2;
