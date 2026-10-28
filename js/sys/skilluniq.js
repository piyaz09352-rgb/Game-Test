/* VAYRATHEN — js/sys/skilluniq.js — (v183) no two skills of a class do the same thing
   Within each class line (all three tiers), skills that were the same move with bigger numbers now each get a job of
   their own: a second effect on what they hit (st2: bleed, armour break, slow, blind, fear, pull …), an execute on wounded
   foes (exec), life drawn from the damage (drain2), something that happens to you as it goes off (onCast), or a passive
   that raises different things. Damage stays about where it was. The cat and dog folk also get the moves that make them
   cats and dogs (see the wiki entry at the end).
   Each skill's text gains a line for what was added; effects taken away (a stun, a knockback) leave its text too. */
'use strict';

const USQ = {th:{}, en:{}};
const usqP = v => `${Math.round(v * 100)}%`;
const usqN = v => `${+(+v).toFixed(1)}`;
const USQ_DOT = {bleed:['เลือดไหล', 'Bleed'], burn:['ไฟลุก', 'Burn'], poison:['พิษ', 'Poison']};
function usqStText(st, dot){
  const out = typeof nlSt === 'function' ? nlSt({...st, poison:null}).slice() : [];
  if (st.poison){ const [a, t, mag] = st.poison, n = USQ_DOT[dot || 'poison'], k = mag ? 'MATK' : 'ATK'; out.push([`${n[0]} ${usqP(a)} ${k}/วิ ${usqN(t)} วิ`, `${n[1]} ${usqP(a)} ${k}/s for ${usqN(t)}s`]); }
  if (st.knock) out.push([`กระเด็น`, `knockback`]);
  if (st.pull) out.push([`ดึงศัตรูเข้าหาตัว`, `pulls foes in`]);
  return out;
}
/* what each change adds to the skill's text */
function usqExtra(s, lv){
  const th = [], en = [], push = ([a, b]) => { th.push(a); en.push(b); };
  if (s.st2) usqStText(s.st2(lv), s.dot).forEach(push);
  if (s.exec) push([`เป้าที่ HP ต่ำกว่า 30% โดนเพิ่ม ${usqP(s.exec)}`, `+${usqP(s.exec)} on foes under 30% HP`]);
  if (s.drain2) push([`ดูดเลือด ${usqP(s.drain2)} ของดาเมจ`, `heals you for ${usqP(s.drain2)} of the damage`]);
  if (s.castTxt) push(s.castTxt(lv));
  return th.length ? L(th.join(' · '), en.join(' · ')) : '';
}
/* a skill's own text, minus what was taken away, plus what was added */
function usqDesc(s, cut){
  const d0 = s.desc;
  s.desc = function(lv){ let d = typeof d0 === 'function' ? d0.call(this, lv) : String(d0 || '');
    for (const re of cut || []) d = d.replace(re, '');
    const x = usqExtra(s, lv); return x ? `${d} · ${x}` : d; };
}
const USQ_CUT = {stun:[/\s*·\s*(Stun|มึน)\s*[\d.]+\s*(วิ|s)/g], knock:[/\s*·\s*(Knockback|กระเด็น|knockback)/g]};
/* the changes, line by line: [skill id, {fields}, [effects taken away]] */
const USQ_EDIT = [
  // นักดาบ
  ['judgement', {elem:'holy', st2:lv => ({defDown:[.15 + lv * .015, 8]})}],
  ['goldshield', {buff:lv => ({t:30, reflect:+(lv * .025).toFixed(3)})}, null, lv => L(`30 วิ · สะท้อนดาเมจ ${usqP(lv * .025)}`, `30s · reflects ${usqP(lv * .025)} of damage`)],
  ['bastion', {buff:lv => ({t:30, def:lv * 12})}, null, lv => L(`30 วิ · DEF +${lv * 12} · ส่งให้ผู้เล่นรอบตัวด้วย`, `30s · DEF +${lv * 12} · also reaches players around you`)],
  ['warking', {st2:lv => ({atkDown:[.15 + lv * .015, 8]})}],
  ['shieldbash', {knock:0, st2:lv => ({taunt:1, defDown:[.1 + lv * .01, 6]})}, ['knock']],
  // นักเวท
  ['firebolt', {dot:'burn', st2:lv => ({poison:[.06 + lv * .006, 4, 1]})}],
  ['wrath', {st2:lv => ({shock:.4})}],
  ['cataclysm', {st2:lv => ({stun:1.2})}],
  // นักธนู
  ['eaglearrow', {st2:lv => ({defDown:[.1 + lv * .015, 6]})}],
  ['spiritarrow', {drain2:.08}],
  ['stormvolley', {st2:lv => ({shock:.4})}],
  ['heavenpiercer', {exec:.5}],
  // นักมวย
  ['elbowstorm', {st2:lv => ({defDown:[.1 + lv * .01, 6]})}],
  ['kneeclinch', {st2:lv => ({atkDown:[.15 + lv * .015, 6]})}],
  ['crocodile', {knock:0, st2:lv => ({slow:[.3 + lv * .01, 4]})}, ['knock']],
  ['elbowback', {stun:null, dot:'bleed', st2:lv => ({poison:[.15 + lv * .015, 5]})}, ['stun']],
  ['nakmuay', {st2:lv => ({knock:70})}],
  ['hanuman', {st2:lv => ({knock:40})}],
  // หมอยา
  ['elixir', {onCast:lv => { const g = Math.round(DER.maxsp * (.05 + lv * .01)); S.sp = Math.min(DER.maxsp, S.sp + g); addText(P.x, P.y - 62, `+${g} SP`, '#9fd0ff', 13); },
    castTxt:lv => [`ฟื้น SP ${usqP(.05 + lv * .01)} ด้วย`, `also restores ${usqP(.05 + lv * .01)} SP`]}],
  ['purify', {onCast:lv => addBuff('purify', {t:8, dmgRed:+(.1 + lv * .01).toFixed(2)}),
    castTxt:lv => [`หลังชำระ รับดาเมจ −${usqP(.1 + lv * .01)} 8 วิ`, `then damage taken −${usqP(.1 + lv * .01)} for 8s`]}],
  ['divinewrath', {st2:lv => ({stun:.6})}],
  ['judgment', {st2:lv => ({blind:3 + lv * .2})}],
  // โจร
  ['assassinate', {st2:lv => ({poison:[.2 + lv * .02, 6]})}],
  ['deathmark', {st2:lv => ({curse:[.15 + lv * .015, 8, 0]})}],
  ['tigerpounce', {st2:lv => ({stun:.5})}],
  // อัญเชิญ
  ['goldenhong', {drain2:.06}],
  ['gatestorm', {st2:lv => ({knock:40})}],
  ['heavenfall', {st2:lv => ({stun:1})}],
  // ไสยเวท
  ['hexmastery', {pas:lv => ({castPct:+(lv * .03).toFixed(2), curseAmp:+(lv * .02).toFixed(2)})}],
  ['soulrend', {drain2:.1}],
  ['darkstar', {st2:lv => ({fear:2 + lv * .1})}],
  ['grimreap', {exec:.5}],
  ['shadowlance', {st2:lv => ({defDown:[.1 + lv * .015, 6]})}],
  // พ่อค้า
  ['tycoonaxe', {pas:lv => ({critDmg:+(lv * .04).toFixed(2), biaPct:+(lv * .03).toFixed(2)})}],
  ['axestorm', {st2:lv => ({pull:30})}],
  ['goldenarc', {st2:lv => ({knock:45})}],
  ['goldrush', {st2:lv => ({stun:.8})}],
  ['goldshower', {st2:lv => ({slow:[.25 + lv * .01, 3]})}],
  // เผ่าแมว: ข่วนให้เลือดไหล ขย้ำเกราะ ปิดเหยื่อ · กระโจนจากเงาแล้วคริแน่ · อุ้งเท้าตรึง หางกวาดกระเด็น
  ['scratch', {dot:'bleed', st2:lv => ({poison:[.05 + lv * .005, 4]})}],
  ['furyswipe', {st2:lv => ({defDown:[.1 + lv * .015, 6]})}],
  ['thousandscratch', {exec:.4}],
  ['moonpounce', {stun:null, onCast:lv => later(.3, () => addBuff('moonpounce', {t:4})),
    castTxt:lv => ['ลงพื้นแล้วตีถัดไปคริแน่นอน', 'the next blow after landing is a sure critical']}, ['stun']],
  ['shadowpaw', {st2:lv => ({slow:[.25 + lv * .015, 4]})}],
  ['comettail', {st2:lv => ({knock:50})}],
  // เผ่าหมา: กัดให้เลือดไหล · พุ่งโล่ยั่วศัตรู · หมุนเขี้ยวดึงฝูงเข้ามา · เทวดาเฝ้าเจ้านายพาฟื้นจากความตาย
  ['shieldcharge', {stun:null, st2:lv => ({taunt:1, atkDown:[.15 + lv * .015, 6]})}, ['stun']],
  ['fangspin', {dot:'bleed', st2:lv => ({poison:[.1 + lv * .01, 5]})}],
  ['wolfstorm', {st2:lv => ({pull:40})}],
  ['guardianangel', {buff:lv => ({t:60, revive:+(.2 + lv * .03).toFixed(2)}), cd:60}, null, lv => L(`60 วิ · ถ้าล้มลง เทวดาพาฟื้นทันทีด้วย HP ${usqP(.2 + lv * .03)}`, `60s · if you fall, the angel brings you back at once with ${usqP(.2 + lv * .03)} HP`)],
  // นินจา
  ['shadowflash', {st2:lv => ({blind:2 + lv * .2})}],
  ['kagemastery', {pas:lv => ({aspdPct:+(lv * .02).toFixed(2), dodge:+(lv * .005).toFixed(3)})}],
  ['fuuton', {st2:lv => ({knock:40})}],
  ['dragonflame', {dot:'burn', st2:lv => ({poison:[.1 + lv * .01, 4]})}],
  ['kunairain', {st2:lv => ({slow:[.25 + lv * .01, 4]})}]
];
for (const [id, o, cut, text] of USQ_EDIT){ const s = SKILLS[id]; if (!s) continue;
  Object.assign(s, o);
  const isNew = typeof NL_JOBS !== 'undefined' && NL_JOBS[s.job];
  if (isNew && (o.buff || o.pas || o.stun === null)) s.desc = nlDesc(s);   // the new lines' text is built from the skill itself
  if (text) s.desc = text;
  usqDesc(s, (cut || []).flatMap(k => USQ_CUT[k] || []));
}
/* some skills land their hits through their own code without naming the skill: the skill that went off last stands in
   for them while its hits can still be landing (normal attacks, and arrows shot by them, are told apart) */
const USQC = {id:null, until:-9, basic:0};
{ const _ba = basicAttack; basicAttack = function(){ USQC.basic++; const n0 = typeof projs !== 'undefined' ? projs.length : 0;
    try { return _ba.apply(this, arguments); } finally { USQC.basic--;
      if (typeof projs !== 'undefined') for (let i = n0; i < projs.length; i++){ const q = projs[i]; if (q && typeof q.hit === 'function' && !q._usqB){ q._usqB = 1; const h = q.hit; q.hit = function(){ USQC.basic++; try { return h.apply(this, arguments); } finally { USQC.basic--; } }; } } } }; }
const USQ_ID = new Map(); for (const k in SKILLS) USQ_ID.set(SKILLS[k], k);   // older skills do not carry their own id
const usqSkillOf = sk => (sk && typeof sk === 'object' ? sk : !sk && !USQC.basic && USQC.id && T < USQC.until ? SKILLS[USQC.id] : null);
/* what was added happens on every hit */
HK.dmgAfter.push((m, res, sk0) => {
  if (!res || res.miss || res.usq || res.poison || !m) return;
  const sk = usqSkillOf(sk0); if (!sk || !(sk.st2 || sk.drain2 || sk.exec)) return;
  const id = sk.id || USQ_ID.get(sk), lv = (S.skills && S.skills[id]) || 1;
  if (sk.st2 && !m.dead){ const k = id; m._usq = m._usq || {}; if (!(T - (m._usq[k] || -9) < .5)){ m._usq[k] = T; const st = sk.st2(lv);
      if (st.pull && !m.def.boss){ const d = Math.hypot(m.x - P.x, m.y - P.y) || 1, step = Math.min(st.pull, Math.max(0, d - 24)); m.x -= (m.x - P.x) / d * step; m.y -= (m.y - P.y) / d * step; if (typeof pushOut === 'function') pushOut(m, m.def.r * .6); }
      const rest = {...st}; delete rest.pull; if (Object.keys(rest).length) applyStatus(m, rest, lv); } }
  if (sk.drain2 && res.dmg > 0){ const h = Math.round(res.dmg * sk.drain2); if (h > 0){ S.hp = Math.min(DER.maxhp, S.hp + h); addText(P.x, P.y - 52, `+${h}`, '#c4ffe0', 12); } }
  if (sk.exec && res.dmg > 0 && !m.dead && m.hp < m.maxhp * .3){ const extra = Math.round(res.dmg * sk.exec); if (extra > 0) applyDamage(m, {dmg:extra, crit:false, usq:true}); }
});
/* and what happens to you as the skill goes off */
{ const _ex = execSkill; execSkill = function(id, lv, t){ const s = SKILLS[id];
    if (s){ const hits = s.hits ? (typeof s.hits === 'function' ? s.hits(lv || 1) : s.hits) : 1, dur = (s.dur ? (typeof s.dur === 'function' ? s.dur(lv || 1) : s.dur) : 0);
      USQC.id = id; USQC.until = T + Math.min(6, 1.2 + hits * (s.every || .15) + dur); }
    const r = _ex.apply(this, arguments); if (s && s.onCast) try { s.onCast(lv || (S.skills && S.skills[id]) || 1); } catch (e) {} return r; }; }
/* the moon pounce's sure critical: the next physical blow after landing */
{ const _pd = physDamage; physDamage = function(m){
    if (!(P.buffs && P.buffs.moonpounce) || !DER) return _pd.apply(this, arguments);
    delete P.buffs.moonpounce; if (typeof renderBuffs === 'function') renderBuffs();
    const c = DER.crit; DER.crit = 1000; try { return _pd.apply(this, arguments); } finally { DER.crit = c; } }; }

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'catdog', t:['เอกลักษณ์ของเผ่าแมวและเผ่าหมา', 'What makes the cat and dog folk'], b:() => `<p>${L(
  'เผ่าแมว: ว่องไว ขี้เล่น มีเสน่ห์ และโชคดี · ข่วนให้เลือดไหล ขย้ำเกราะ และปิดเหยื่อที่ใกล้ตาย · กระโจนเข้าหาเป้า กระโจนจันทร์ลงพื้นแล้วตีถัดไปคริแน่นอน · เหมียวอ้อนทำให้ศัตรูหลงเสน่ห์ไม่ยอมตี หน้ามุ้งมิ้งทำให้มืดบอด มนต์ราชินีทำให้ศัตรูรับดาเมจเพิ่ม · หลบหลีกสมบูรณ์ เก้าชีวิตรอดจากความตาย แมวกวักได้เงินเพิ่ม',
  'Cat folk: quick, playful, charming and lucky · claws that bleed, shred armour and finish off the wounded · pounces, and a moon pounce that lands into a sure critical · a meow that charms foes into not attacking, puppy eyes that blind, a royal charm that makes foes take more damage · perfect dodges, nine lives to cheat death, a lucky cat for more money')}</p><p>${L(
  'เผ่าหมา: ผู้พิทักษ์ที่ภักดีและฝูงที่แข็งแรง · เห่าขู่ยั่วมอนให้มาตีตัวเอง พุ่งโล่ยั่วและลดแรงศัตรู · หอนเรียกฝูงให้ทั้งทีมแรงขึ้น ตีเร็วขึ้น และฟื้นเลือด · กัดและหมุนเขี้ยวให้เลือดไหล พายุหมาป่าดึงฝูงศัตรูเข้ามา · จมูกไวดมจุดอ่อน (ลด DEF) · ขนเหล็กสะท้อนดาเมจ ยืนหยัดลดดาเมจทั้งทีม เทวดาเฝ้าเจ้านายพาฟื้นจากความตาย หอนจันทร์เพ็ญทำให้ศัตรูกลัววิ่งหนี',
  'Dog folk: loyal guardians and a strong pack · barks that draw monsters onto you, a shield charge that taunts and weakens · howls that make the whole party stronger, faster and heal them · bites and fang spins that bleed, a wolf storm that pulls the pack of foes in · a keen nose that sniffs out weak spots (DEF down) · iron fur that reflects, a stand that guards the party, a guardian angel that brings you back from death, a moon howl that sends foes running')}</p>`});
