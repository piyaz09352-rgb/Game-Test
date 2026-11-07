/* VAYRATHEN — js/sys/skillfix199.js — (v199) the three urgent findings of docs/SKILL_AUDIT.md
   · รังสีดารา (ผู้อัญเชิญ) was a straight ray of light, the kind of beam the owner asked to be rid of (v192): it is now
     ทางดาราศักดิ์สิทธิ์, a row of holy crosses springing up one after another down its path (linefx192's holy wave)
   · two skills were called ระเบิดควัน: the thief's (stuns everything round you) is now ระเบิดผงมึน; the ninja keeps the name
   · five passives only raised the money from selling loot, which does nothing in a fight. Each now helps in combat:
       ต่อราคา      the merchant's coin skills cost up to 30% less money · crit resist
       ตาทองประเมินค่า CRIT and critical damage
       ขวานเศรษฐี   critical damage (the selling bonus is gone)
       บารมีเศรษฐี  Max HP, ATK and crit resist
       แมวกวักนำโชค CRIT, critical damage and crit resist */
'use strict';
const SKF = (id, o) => { const s = SKILLS[id]; if (!s) return null; Object.assign(s, o); if (typeof nlDesc === 'function' && !o.desc && s.pas) s.desc = nlDesc(s); return s; };
const skfP = v => Math.round(v * 100) + '%';
/* ---------- the ray becomes a path of holy crosses ---------- */
SKF('astralray', {name:'ทางดาราศักดิ์สิทธิ์', en:'Holy Star Path', short:'ทางดารา', shortEn:'Star Path', fx:'holyPath', width:30,
  desc:lv => { const s = SKILLS.astralray; return L(`กากบาทแสงผุดขึ้นเรียงแถว 260 · ${skfP(s.dmg(lv))} MATK ทุกตัวในแนว · ธาตุศักดิ์สิทธิ์`, `Crosses of light spring up in a 260 line · ${skfP(s.dmg(lv))} MATK to everything on it · holy`); }});
/* ---------- one ระเบิดควัน only ---------- */
SKF('smokebomb', {name:'ระเบิดผงมึน', en:'Daze Powder Bomb', short:'ผงมึน', shortEn:'Daze'});
/* ---------- selling bonuses become combat bonuses ---------- */
SKF('haggle', {pas:lv => ({critRes:lv, coinSave:+(lv * .03).toFixed(2)}),
  desc:lv => L(`ติดตัว · สกิลใช้เงินเสียเบี้ยน้อยลง ${lv * 3}% · ต้านทานคริ +${lv}`, `Passive · money skills cost ${lv * 3}% less Bia · crit resist +${lv}`)});
SKF('appraisal', {pas:lv => ({crit:lv, critDmg:+(lv * .02).toFixed(2)})});
SKF('tycoonaxe', {pas:lv => ({critDmg:+(lv * .04).toFixed(2)})});
SKF('wealthaura', {pas:lv => ({hpPct:+(lv * .02).toFixed(2), atkPct:+(lv * .015).toFixed(3), critRes:lv})});
SKF('luckycat', {pas:lv => ({crit:lv, critDmg:+(lv * .02).toFixed(2), critRes:lv})});
// ต่อราคา: every skill of the merchant line that costs money costs less
for (const id in SKILLS){ const s = SKILLS[id]; if (typeof s.bia !== 'function' || s._skfBia || !(typeof NL_LINE_OF !== 'undefined' && NL_LINE_OF[s.job] === 'merchant')) continue;
  const o = s.bia; s._skfBia = 1; s.bia = lv => Math.max(1, Math.round(o(lv) * (1 - Math.min(.3, (typeof DER !== 'undefined' && DER && DER.pas && DER.pas.coinSave) || 0)))); }
{ const s = SKILLS.smokebomb; if (s && typeof s.desc === 'function'){ const o = s.desc; s.desc = lv => String(o(lv)).replace('ระเบิดควันรอบตัว', 'ปาผงมึนรอบตัว').replace(/smoke bomb/i, 'daze powder'); } }
