/* VAYRATHEN — js/data/monsters.js */
'use strict';

const MOB = {
  dewblob:{name:'เจลลี่น้ำค้าง',en:'Dew Jelly',lvl:1,hp:50,atk:[6,9],def:0,elem:'water',race:'plant',size:'s',exp:6,jexp:4,speed:26,delay:1.6,r:10,
    drops:[['jelly',.7],['redpot',.06]],card:'c_dew',cardRate:.01},
  hare:{name:'กระต่ายเขาเห็ด',en:'Mushroom Hare',lvl:4,hp:95,atk:[11,15],def:2,elem:'earth',race:'brute',size:'s',exp:14,jexp:10,speed:46,delay:1.4,r:11,
    drops:[['hide',.55],['redpot',.08]],card:'c_hare',cardRate:.01},
  boar:{name:'หมูป่าหญ้าทอง',en:'Golden Grass Boar',lvl:9,hp:240,atk:[21,29],def:6,elem:'earth',race:'brute',size:'m',exp:42,jexp:30,speed:55,delay:1.5,r:16,
    drops:[['tusk',.5],['ore',.05],['redpot',.1]],card:'c_boar',cardRate:.008},
  lantern:{name:'ผีโคมลอย',en:'Lantern Ghost',lvl:13,hp:420,atk:[29,39],def:4,elem:'shadow',race:'undead',size:'s',exp:95,jexp:65,speed:50,delay:1.4,r:12,aggro:true,
    drops:[['wick',.5],['ore',.07],['bluepot',.08]],card:'c_lantern',cardRate:.008},
  boss:{name:'ราชาเจลลี่ทองคำ',en:'Golden Jelly King',lvl:25,hp:7000,atk:[52,72],def:14,defPct:.2,elem:'water',race:'plant',size:'l',exp:3000,jexp:1800,speed:38,delay:1.3,r:30,aggro:true,boss:true,
    drops:[['ore',1],['crown',1],['bluepot',1]],card:'c_boss',cardRate:.15}
};
