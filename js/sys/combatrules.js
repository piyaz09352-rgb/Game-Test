/* VAYRATHEN — js/sys/combatrules.js — (v100) three rules for what stats do in a fight
   · MOBBED: every monster past the second one fighting you takes 10% off your Flee (5 on you → −30%). Dragging a
     whole pack around no longer leaves an AGI hero untouchable.
   · PERFECT DODGE from LUK: 1% for every 10 LUK, on top of any dodge passive. It works even when Flee fails.
   · STATUS RESIST from stats, on top of the "Status Resist" gear option (js/sys/afflict.js afRes):
       VIT → stun, poison, bleed, burn · INT → silence, freeze, blind · LUK → curse · AGI → slow, root
     stat ÷ 250, at most 40% from stats (100 in a stat = 40%). Gear and stats stack as two separate rolls.
   The Status details drawer lists all three. */
'use strict';

const RO_MOB = {range:90, step:.1};
const RO_RES_STAT = {stun:'vit', poison:'vit', bleed:'vit', burn:'vit', silence:'int', freeze:'int', blind:'int', curse:'luk', slow:'agi', root:'agi'};
const roResOf = k => { const s = RO_RES_STAT[k]; return s && DER && DER.b ? Math.min(.4, (DER.b[s] || 0) / 250) : 0; };
const roLukDodge = () => (DER && DER.b ? (DER.b.luk || 0) * .001 : 0);
/* monsters close enough to be fighting you right now */
function roMobbed(){ let n = 0;
  for (const m of mobs) if (!m.dead && !m.vanish && m.aggro && Math.hypot(m.x - P.x, m.y - P.y) <= (m.def.range || 0) + (m.def.r || 0) + RO_MOB.range) n++;
  return n; }
const roFleeMul = n => Math.max(0, 1 - Math.max(0, n - 2) * RO_MOB.step);

{ const _dv = derive; derive = function(){ const r = _dv.apply(this, arguments);
  if (DER && DER.pas){ DER.pas.dodge = +((DER.pas.dodge || 0) + roLukDodge()).toFixed(3); }
  return r; }; }
{ const _ma = mobAttack;
  mobAttack = function(m){ if (!DER) return _ma.apply(this, arguments);
    const f0 = DER.flee, k = roFleeMul(roMobbed()); if (k < 1) DER.flee = Math.round(f0 * k);
    try { return _ma.apply(this, arguments); } finally { DER.flee = f0; } }; }
const roResisted = k => { if (!(Math.random() < roResOf(k))) return false;
  if (T - (P.afResT || 0) > 1){ P.afResT = T; afText('Resist!', '#e8f0ff'); } return true; };
{ const _af = afflict;
  afflict = function(k, dur, opt){ if (!P.dead && !(opt && opt.force) && roResisted(k)) return; return _af.apply(this, arguments); }; }
{ const _fx = applyMobFx;
  applyMobFx = function(m, k){ if (k === 'stun' && !P.dead && roResisted('stun')) return; return _fx.apply(this, arguments); }; }

/* (v115) the status window no longer lists the dodge & resist breakdown (the player asked for it to go); the rules still apply */

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'combatrules', t:['หลบและต้านสถานะ', 'Dodge & status resist'], b:() => `<ul>
  <li>${L('โดนรุม: มอนตัวที่ 3 ขึ้นไปที่สู้กับเราอยู่ ลด Flee ตัวละ 10%', 'Mobbed: each monster past the 2nd fighting you takes 10% off your Flee')}</li>
  <li>${L('Perfect Dodge: LUK ทุก 10 แต้ม หลบได้แน่นอน 1% แม้ Flee ไม่พอ', 'Perfect Dodge: 1% per 10 LUK, works even when Flee fails')}</li>
  <li>${L('ต้านสถานะจากสเตตัส (สเตตัส ÷ 250 สูงสุด 40%): VIT ต้านมึน พิษ เลือดไหล ไฟลวก · INT ต้านใบ้ แช่แข็ง ตาพร่า · LUK ต้านคำสาป · AGI ต้านช้าและตรึง · ซ้อนกับออปชัน Status Resist บนของ', 'Status resist from stats (stat ÷ 250, up to 40%): VIT stun, poison, bleed, burn · INT silence, freeze, blind · LUK curse · AGI slow and root · stacks with the Status Resist gear option')}</li>
  <li>${L('EXP ตามช่วงเลเวล (มอน − เรา): สูงกว่า 10+ ได้ 120% · 5+ ได้ 110% · ต่ำกว่า 6–10 ได้ 90% · 11–15 ได้ 75% · 16–20 ได้ 60% · 21–30 ได้ 40% · เกิน 30 ได้ 20%', 'EXP by level gap (monster − you): 10+ higher 120% · 5+ higher 110% · 6–10 lower 90% · 11–15 lower 75% · 16–20 lower 60% · 21–30 lower 40% · over 30 lower 20%')}</li>
  <li>${L('ฟื้นตัวทุก 6 วิ HP = Max HP ÷ 200 + VIT ÷ 5 · ทุก 8 วิ SP = 1 + Max SP ÷ 100 + INT ÷ 6 (สาย INT ทุก 4 วิ) · นั่งหรืออยู่ในเมืองเร็วขึ้น 2 เท่า', 'Recovery: every 6 s HP = Max HP ÷ 200 + VIT ÷ 5 · every 8 s SP = 1 + Max SP ÷ 100 + INT ÷ 6 (INT classes every 4 s) · sitting or in town doubles it')}</li></ul>`});
