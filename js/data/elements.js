/* VAYRATHEN — js/data/elements.js */
'use strict';

/* ---------- data ---------- */
const ELEM = ['neutral','earth','water','fire','wind','holy','shadow'];
const ELEM_TH = {neutral:'ไร้ธาตุ',earth:'ดิน',water:'น้ำ',fire:'ไฟ',wind:'ลม',holy:'ศักดิ์สิทธิ์',shadow:'ความมืด'};
const ELEM_EN = {neutral:'Neutral',earth:'Earth',water:'Water',fire:'Fire',wind:'Wind',holy:'Holy',shadow:'Shadow'};
const elemName = e => L(ELEM_TH[e], ELEM_EN[e]);
/* v27: the same element on both sides always deals 50% (it used to be 25%, or nothing for holy and shadow) */
const ETAB = {
  neutral:[100,100,100,100,100,100,100],
  earth:[100,50,100,150,50,75,75],
  water:[100,100,50,150,50,75,75],
  fire:[100,50,50,50,150,75,75],
  wind:[100,150,150,50,50,75,75],
  holy:[100,100,100,100,100,50,175],
  shadow:[100,100,100,100,100,175,50]
};
const elemMod = (a, d) => ETAB[a][ELEM.indexOf(d)] / 100;
const SIZE_TH = {s:'เล็ก', m:'กลาง', l:'ใหญ่'};
const SIZE_EN = {s:'Small', m:'Medium', l:'Large'};
const RACE_TH = {plant:'พืช', brute:'สัตว์', undead:'ผี/อมตะ'};
const RACE_EN = {plant:'Plant', brute:'Brute', undead:'Undead'};
const SIZE_MOD = {fist:{s:1,m:1,l:.75}, dagger:{s:1,m:.85,l:.7}, sword:{s:.75,m:1,l:.75}, bow:{s:1,m:.9,l:.8}, staff:{s:1,m:1,l:1}};
