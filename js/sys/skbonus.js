/* VAYRATHEN — js/sys/skbonus.js — (v88) enough Skill Points to max every skill of every class
   Each class gives 1 point per Job Level (49 from Job Lv 1 to 50), but some classes' six skills need more than that
   (Rogue 55, Asura Astrologer 60, every 4th class 60 …). Now each class tops up what it is short of: the missing
   points arrive the moment you become that class, once. Characters already past a class get theirs on loading.
   Runs only when the class changes (one small sum), never per frame. */
'use strict';

const SKB = {job:null};
const skNeed = j => (JOBS[j].skills || []).reduce((a, id) => a + (SKILLS[id] ? SKILLS[id].max : 0), 0);
// (v161) not for the eight-skill tiers (skills8.js): their 49 points are meant to fall short, so a build has to choose
const skGap = j => (typeof SK8 !== 'undefined' && SK8[j] ? 0 : Math.max(0, skNeed(j) - Math.max(0, (JOBS[j].jobMax || 1) - 1)));
function skBonusSync(){
  if (!S || !S.job || !JOBS[S.job]) return 0; S.skb = S.skb || {}; let add = 0;
  for (const j of jobChain()){ const owe = skGap(j), got = S.skb[j] | 0; if (owe > got){ add += owe - got; S.skb[j] = owe; } }
  if (add){ S.skPts = (S.skPts || 0) + add; dirty = true;
    log(L(`ได้ Skill Point โบนัสอาชีพ ${add} แต้ม (ให้อัปสกิลได้ครบทุกตัว)`, `Class bonus: +${add} Skill Points (enough to max every skill)`), 'j');
    toast(L(`+${add} Skill Point โบนัสอาชีพ`, `+${add} class bonus Skill Points`)); if (typeof renderSkills === 'function') try { renderSkills(); } catch (e) {} }
  return add;
}
EV.on('tick', () => { if (!S || S.job === SKB.job || typeof PAUSED !== 'undefined' && PAUSED) return; SKB.job = S.job; skBonusSync(); });
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'skbonus', t:['Skill Point โบนัสอาชีพ', 'Class bonus Skill Points'], b:() => `<p>${L('ทุกอาชีพได้ Skill Point 1 แต้มต่อ Job Level และถ้าสกิลของอาชีพนั้นต้องใช้มากกว่า จะได้แต้มโบนัสส่วนที่ขาดทันทีที่เปลี่ยนเป็นอาชีพนั้น อัปสกิลได้ครบทุกตัวทุกอาชีพ', 'Every class gives 1 Skill Point per Job Level, and when its skills need more, the missing points arrive the moment you become that class: every skill of every class can be maxed')}</p>`});
