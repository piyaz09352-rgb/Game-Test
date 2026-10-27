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
/* the level cap and the stat cap. Stat points are budgeted so that at Lv 300 a hero can raise exactly two stats to
   150 and a third to 90 (48 to start + every level's points = 3,198): Lv 2–120 give ⌊Lv/5⌋+3, Lv 121–171 give 7,
   Lv 172–300 give 8. */
const LV_MAX = 300, STAT_MAX = 150;
const STAT_CAP = () => STAT_MAX;
const statGain = lv => (lv <= 120 ? Math.floor(lv / 5) + 3 : lv <= 171 ? 7 : 8);
/* job EXP per job level. A class tier spans more base levels the higher it is (Villager ≈ Lv 1–10, 2nd class ≈ Lv 10–65,
   3rd class ≈ Lv 65–125), so its table is scaled per tier: ×1 · ×3 · ×18 (monsters give Job EXP = 30% of their base EXP).
   (v58) the 4th class (Lv 150–300) had no entry and fell back to ×1, so its 50 job levels went by in ~1,700 kills while
   the 3rd class needs ~31,000. It is ×140 now: Job Lv 50 lands around Base Lv 260–270, the endgame stretch. */
const JOB_TIER_MUL = [1, 1, 3, 18, 140];
const jobTierMul = () => (typeof S !== 'undefined' && S && typeof JOBS !== 'undefined' && JOBS[S.job] ? JOB_TIER_MUL[JOBS[S.job].tier] || 1 : 1);
const nextJob = J => Math.floor((5 * Math.pow(J, 1.5) + 5) * jobTierMul());
const statCost = x => Math.floor((x - 1) / 10) + 2;
