/* VAYRATHEN — js/sys/sovbond274.js — (v274) Royal Bond comes back to the Sovereign, with limits (game/skills.js BOND):
   bind a region boss at or below your level (at 30% HP or less) · call it with the skill: 45 s on the field, then
   90 s of rest · it takes one of the beast places (the boss is no longer an extra on top of the beasts). */
'use strict';
if (JOBS.sovereign && !JOBS.sovereign.skills.includes('royalbond')) JOBS.sovereign.skills.push('royalbond');
if (typeof SK5_GONE !== 'undefined'){ const i = SK5_GONE.indexOf('royalbond'); if (i >= 0) SK5_GONE.splice(i, 1); } if (typeof SK5_KEEP !== 'undefined') SK5_KEEP.add('royalbond');   // the v209 trim no longer takes it away
if (SKILLS.royalbond){ SKILLS.royalbond.req = {sovlore:5};
  SKILLS.royalbond.desc = () => L(`ใช้กับบอสประจำแผนที่ที่ HP ≤ 30% และเลเวลไม่เกินคุณ เพื่อผูกพันธะ (บอสโลก ดันเจี้ยน หอคอย การรุกราน ผูกไม่ได้) · ใช้อีกครั้งเพื่อเรียกออกมาสู้ ${BOND.dur} วิ แล้วพัก ${BOND.rest} วิ · นับเป็น 1 ในช่องสัตว์อัญเชิญ (เรียกออกมาแล้วสัตว์ตัวเก่าสุดกลับไป) · ผูกตัวใหม่จะแทนตัวเดิม`,
    `Use on a region boss at 30% HP or less and no higher level than you to bind it (not world, dungeon, tower or invasion bosses) · use again to call it out for ${BOND.dur} s, then it rests ${BOND.rest} s · it takes one of your beast places (your oldest beast goes home) · a new bond replaces the old`); }
/* (it rests after leaving the field: game/skills.js sets S.bound.restUntil as it goes) */
{ let out = false; EV.on('tick', () => { const now = !!(S && S.bound && SUMMONS.some(s => s.beast === 'bound' && !s.dead)); if (out && !now && bondRest() > 0) toast(L(`บอสพันธะกลับไปพัก ${BOND.rest} วิ`, `Your bound boss rests for ${BOND.rest} s`)); out = now; }); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'royalbond', t:['ผูกพันธะราชันย์', 'Royal Bond'], b:() => L(
  `<p>จักรพรรดิหิมพานต์ (สายผู้อัญเชิญ) เรียนได้เมื่อตำราราชันย์ Lv 5 · ตีบอสประจำแผนที่ (เลเวลไม่เกินคุณ) ให้ HP ≤ 30% แล้วใช้สกิลเพื่อผูกพันธะ · ใช้สกิลอีกครั้งเรียกบอสออกมาสู้ ${BOND.dur} วิ แล้วพัก ${BOND.rest} วิ · บอสพันธะนับเป็น 1 ในช่องสัตว์อัญเชิญ (ไม่ได้ออกเพิ่มนอกโควตาเหมือนเดิม)</p>`,
  `<p>The Himmapan Sovereign (summoner line) learns it at Sovereign Lore 5 · bring a region boss (no higher level than you) to 30% HP and use it to bind the boss · use it again to call the boss out for ${BOND.dur} s, then it rests ${BOND.rest} s · the bound boss takes one of your beast places (no longer an extra on top)</p>`)});
