/* VAYRATHEN — js/sys/skills8.js — (v159) eight skills a tier, three ways to play every class, and points to choose with
   Every class tier (2, 3 and 4) now has the same EIGHT skills, every one up to Lv 10. A tier gives 49 Skill Points for
   80 levels of skills, so you can max about five of the eight: you pick a way to play and give up the rest.
   Each skill belongs to one STYLE (สาย) of its line, shown on the skill window:
     สายดาบ  (Swordsman → Warlord → Bulwark)      ตีปกติ (basic attacks) · กระบวนท่า (big techniques) · แทงค์ (tank)
     สายเวท  (Mage → Astromancer → Archsage)       เวทต่อเนื่อง (orb basic attacks) · เวทระเบิด (burst spells) · ควบคุม (control & wards)
     สายพราน (Hunter → Wildwarden → Sylvan Lord)    ยิงปกติ (basic shots) · สกิลศร (arrow skills) · สัตว์/กับดัก (pets & traps)
     สายมวย  (Muay → Grandmaster → Ring Lord)       หมัดปกติ (basic strikes) · แม่ไม้ (master moves) · ทนทาน (endurance)
     สายหมอ  (Herbalist → Royal Physician → Divine) ซัพพอต (heals) · ดาเมจ (a healer turned hard hitter) · บัพทีม (team buffs)
     สายโจร  (Rogue → Shadow Bandit → Shadow Tiger) ตีปกติ/คริ · ลอบสังหาร (assassination) · พิษ/หลบหลีก (venom & evasion)
     สายอัญเชิญ (Summoner → Sovereign → Emperor)    สัตว์อัญเชิญ (summons) · เวทวิญญาณ (your own spells) · เสริม (support)
   Each tier adds two new skills (42 in all) that complete the styles; tier 4 adds a SIGNATURE skill for its line —
   a skill much stronger than anything before it. Older skills that stopped at Lv 1–8 now run to Lv 10 on the same
   curve (their top level is the same power as before, reached in more steps). Because the old points no longer fit,
   every character gets all of its Skill Points back once, to place again.
   Items, skills and stats work together: the weapon traits (weapons2.js) lean the same way as the styles — a
   one-handed sword and shield for the tank, a greatsword for techniques, a rod for support, a longstaff for bursts,
   a katana for basic-attack crits, a dagger and shield for venom. */
'use strict';

const SK8_PATH = {
  blade:{a:['ตีปกติ', 'Basic attacks', '#e8a23a'], b:['กระบวนท่า', 'Techniques', '#e2574c'], c:['แทงค์', 'Tank', '#4a8ad8']},
  rune:{a:['เวทต่อเนื่อง', 'Orb casting', '#3aa8d8'], b:['เวทระเบิด', 'Burst spells', '#e2574c'], c:['ควบคุม', 'Control', '#8a6ad8']},
  ranger:{a:['ยิงปกติ', 'Basic shots', '#e8a23a'], b:['สกิลศร', 'Arrow skills', '#e2574c'], c:['สัตว์/กับดัก', 'Pets & traps', '#3aa86a']},
  muay:{a:['หมัดปกติ', 'Basic strikes', '#e8a23a'], b:['แม่ไม้', 'Master moves', '#e2574c'], c:['ทนทาน', 'Endurance', '#4a8ad8']},
  healer:{a:['ซัพพอต', 'Support', '#3aa86a'], b:['ดาเมจ', 'Damage', '#e2574c'], c:['บัพทีม', 'Team buffs', '#d8a02a']},
  rogue:{a:['ตีปกติ/คริ', 'Basic & crits', '#e8a23a'], b:['ลอบสังหาร', 'Assassination', '#e2574c'], c:['พิษ/หลบหลีก', 'Venom & evasion', '#3aa86a']},
  summoner:{a:['สัตว์อัญเชิญ', 'Summons', '#3aa8d8'], b:['เวทวิญญาณ', 'Spirit magic', '#e2574c'], c:['เสริม', 'Support', '#d8a02a']}
};
const SK8_LINE = {blade:'blade', warlord:'blade', bulwark:'blade', rune:'rune', astro:'rune', archsage:'rune', ranger:'ranger', warden:'ranger', sylvan:'ranger',
  muay:'muay', grandmaster:'muay', ringlord:'muay', healer:'healer', physician:'healer', divinehealer:'healer', rogue:'rogue', bandit:'rogue', tigershade:'rogue',
  summoner:'summoner', sovereign:'summoner', himmaemperor:'summoner'};
const pc = v => `${Math.round(v * 100)}%`;

/* ---------- the 42 new skills ---------- */
const SK8_NEW = {
  /* swordsman line */
  bladerhythm:{job:'blade', name:'จังหวะดาบ', en:'Blade Rhythm', max:10, type:'passive', pas:lv => ({autoPct:lv * .03, aspdPct:lv * .012, dbl:lv * .01}),
    desc:lv => L(`ตีปกติแรงขึ้น ${lv * 3}% · ตีเร็วขึ้น ${+(lv * 1.2).toFixed(1)}% · โอกาสตี 2 ครั้ง ${lv}%`, `Basic attacks +${lv * 3}% · ${+(lv * 1.2).toFixed(1)}% faster · ${lv}% double strike`)},
  guardstance:{job:'blade', name:'ท่าตั้งรับ', en:'Guard Stance', short:'ตั้งรับ', shortEn:'Guard', max:10, type:'buff', sp:() => 20, cd:40, fx:'goldshield', anim:'skill', act:'shout',
    buff:lv => ({t:20, dmgRed:+(lv * .03).toFixed(2)}), desc:lv => L(`20 วิ · รับดาเมจ −${lv * 3}%`, `20s · damage taken −${lv * 3}%`)},   // (v166) only the damage cut: DEF and reflect are Bastion's
  warpath:{job:'warlord', name:'วิถีขุนศึก', en:'Warpath', max:10, type:'passive', pas:lv => ({autoPct:lv * .04, critDmg:lv * .03, aspdPct:lv * .01}),
    desc:lv => L(`ตีปกติแรงขึ้น ${lv * 4}% · คริแรงขึ้น ${lv * 3}% · ตีเร็วขึ้น ${lv}%`, `Basic attacks +${lv * 4}% · crits +${lv * 3}% · ${lv}% faster`)},
  cleave:{job:'warlord', name:'ฟันซ้ำ', en:'Cleave', max:10, type:'passive', pas:lv => ({autoExtra:lv * .07, dbl:lv * .01}),
    desc:lv => L(`ทุกครั้งที่ตีปกติ ฟันซ้ำอีก ${lv * 7}% ATK · โอกาสตี 2 ครั้ง ${lv}%`, `Every basic attack cleaves again for ${lv * 7}% ATK · ${lv}% double strike`)},
  peerless:{job:'bulwark', name:'ดาบไร้เทียมทาน', en:'Peerless Blade', max:10, type:'passive', sig:1, pas:lv => ({autoPct:lv * .06, autoExtra:lv * .1, aspdPct:lv * .015}),
    desc:lv => L(`[สกิลประจำสาย] ตีปกติแรงขึ้น ${lv * 6}% · ฟันซ้ำ ${lv * 10}% ATK ทุกครั้ง · ตีเร็วขึ้น ${+(lv * 1.5).toFixed(1)}%`, `[Signature] Basic attacks +${lv * 6}% · a follow-up cut of ${lv * 10}% ATK every swing · ${+(lv * 1.5).toFixed(1)}% faster`)},
  warking:{job:'bulwark', name:'ราชันย์สงคราม', en:'King of War', short:'ราชันย์', shortEn:'War King', max:10, type:'aoeSelf', sig:1, sp:lv => 60 + lv * 3, cd:28, radius:170, fx:'bladestorm', anim:'skill', act:'spin',
    hits:() => 5, every:.3, dmg:lv => 2.2 + lv * .28, desc:lv => L(`[สกิลประจำสาย] หมุนดาบกวาดรอบตัว 170 · 5 ครั้ง ครั้งละ ${pc(2.2 + lv * .28)} ATK`, `[Signature] Sweep everything within 170 · 5 hits × ${pc(2.2 + lv * .28)} ATK`)},
  /* mage line */
  manastream:{job:'rune', name:'กระแสมนตรา', en:'Mana Stream', max:10, type:'passive', pas:lv => ({orbPct:lv * .08, aspdPct:lv * .015, spRegen:lv * .5}),
    desc:lv => L(`ลูกแก้วเวท (ตีปกติ) แรงขึ้น ${lv * 8}% · ยิงเร็วขึ้น ${+(lv * 1.5).toFixed(1)}% · ฟื้น SP เร็วขึ้น`, `Orb (basic) attacks +${lv * 8}% · ${+(lv * 1.5).toFixed(1)}% faster · faster SP regen`)},
  frostnova:{job:'rune', name:'วงเยือกแข็ง', en:'Frost Nova', short:'เยือกแข็ง', shortEn:'Nova', max:10, type:'aoeSelf', elem:'water', magic:true, sp:lv => 16 + lv * 2, cd:12, radius:90, fx:'frostsea', anim:'cast', act:'invoke',
    hits:() => 1, dmg:lv => .8 + lv * .12, st:lv => ({freeze:[.4 + lv * .05, 2]}), desc:lv => L(`รอบตัว 90 · ${pc(.8 + lv * .12)} MATK · แช่แข็ง ${Math.round((.4 + lv * .05) * 100)}% 2 วิ · ธาตุน้ำ`, `Around you (90) · ${pc(.8 + lv * .12)} MATK · ${Math.round((.4 + lv * .05) * 100)}% freeze 2s · Water`)},
  navagraha:{job:'astro', name:'ดาวนพเคราะห์', en:'Nine Planets', max:10, type:'passive', pas:lv => ({orbs:6 - lv * .45, orbPct:lv * .06}),
    desc:lv => L(`ดาวเคราะห์โคจรรอบตัว ยิงมอนใกล้ ๆ เองทุก ${+(6 - lv * .45).toFixed(2)} วิ · ลูกแก้วเวทแรงขึ้น ${lv * 6}%`, `Planets circle you and fire on their own every ${+(6 - lv * .45).toFixed(2)}s · orb attacks +${lv * 6}%`)},
  gravity:{job:'astro', name:'แรงโน้มถ่วงดารา', en:'Star Gravity', short:'โน้มถ่วง', shortEn:'Gravity', max:10, type:'aoeTarget', elem:'earth', magic:true, sp:lv => 24 + lv * 2, cd:14, cast:() => 1, range:220, radius:100, fx:'meteor', anim:'cast', act:'point',
    hits:() => 1, dmg:lv => 1 + lv * .15, st:lv => ({slow:[.5, 4], root:1 + lv * .1}), desc:lv => L(`รอบเป้า 100 · ${pc(1 + lv * .15)} MATK · ช้าลง 50% 4 วิ · ตรึง ${+(1 + lv * .1).toFixed(1)} วิ`, `Around the target (100) · ${pc(1 + lv * .15)} MATK · 50% slow 4s · root ${+(1 + lv * .1).toFixed(1)}s`)},
  arcanestorm:{job:'archsage', name:'พายุลูกแก้วจตุธาตุ', en:'Arcane Storm', max:10, type:'passive', sig:1, pas:lv => ({orbPct:lv * .1, orbMulti:Math.floor(lv / 4)}),
    desc:lv => L(`[สกิลประจำสาย] ลูกแก้วเวทแรงขึ้น ${lv * 10}% · ยิงลูกแก้วเพิ่ม ${Math.floor(lv / 4)} ลูกต่อครั้ง (Lv 4 · 8)`, `[Signature] Orb attacks +${lv * 10}% · ${Math.floor(lv / 4)} extra orb(s) per attack (Lv 4 · 8)`)},
  cataclysm:{job:'archsage', name:'มหาวินาศ', en:'Cataclysm', short:'มหาวินาศ', shortEn:'Cataclysm', max:10, type:'aoeTarget', sig:1, elem:'fire', magic:true, sp:lv => 90 + lv * 5, cd:30, cast:() => 3.5, range:260, radius:180, fx:'meteor', anim:'cast', act:'invoke',
    hits:() => 6, every:.3, dmg:lv => 2 + lv * .3, desc:lv => L(`[สกิลประจำสาย] ฟ้าถล่มพื้นที่กว้าง 180 · 6 ครั้ง ครั้งละ ${pc(2 + lv * .3)} MATK · Cast 3.5 วิ`, `[Signature] The sky falls on a wide area (180) · 6 hits × ${pc(2 + lv * .3)} MATK · Cast 3.5s`)},
  /* hunter line */
  rapidfire:{job:'ranger', name:'ยิงรัว', en:'Rapid Fire', max:10, type:'passive', pas:lv => ({autoPct:lv * .03, aspdPct:lv * .015, crit:lv * .5}),
    desc:lv => L(`ยิงปกติแรงขึ้น ${lv * 3}% · ยิงเร็วขึ้น ${+(lv * 1.5).toFixed(1)}% · CRIT +${lv * .5}%`, `Basic shots +${lv * 3}% · ${+(lv * 1.5).toFixed(1)}% faster · CRIT +${lv * .5}%`)},
  beastbond:{job:'ranger', name:'ใจผูกสัตว์', en:'Beast Bond', max:10, type:'passive', pas:lv => ({petAtk:lv * .05, petFocus:lv * .02}),
    desc:lv => L(`สัตว์เลี้ยงแรงขึ้น ${lv * 5}% · เป้าที่สัตว์เลี้ยงตีอยู่โดนเราแรงขึ้น ${lv * 2}%`, `Pet +${lv * 5}% · targets your pet is fighting take +${lv * 2}% from you`)},
  deadeye:{job:'warden', name:'ตาพญาเหยี่ยว', en:'Deadeye', max:10, type:'passive', pas:lv => ({autoPct:lv * .04, critDmg:lv * .03, autoExtra:lv * .05}),
    desc:lv => L(`ยิงปกติแรงขึ้น ${lv * 4}% · คริแรงขึ้น ${lv * 3}% · ศรตามอีก ${lv * 5}% ATK ทุกครั้ง`, `Basic shots +${lv * 4}% · crits +${lv * 3}% · a follow-up arrow of ${lv * 5}% ATK every shot`)},
  snarefield:{job:'warden', name:'ทุ่งบ่วงไพร', en:'Snare Field', short:'บ่วงไพร', shortEn:'Snare', max:10, type:'aoeTarget', sp:lv => 20 + lv * 2, cd:10, range:220, radius:90, fx:'rootsnare', anim:'attack', act:'aimup',
    hits:() => 1, dmg:lv => 1.5 + lv * .2, st:lv => ({root:1.5 + lv * .1, slow:[.4, 4]}), desc:lv => L(`รอบเป้า 90 · ${pc(1.5 + lv * .2)} ATK · ตรึง ${+(1.5 + lv * .1).toFixed(1)} วิ · ช้าลง 40%`, `Around the target (90) · ${pc(1.5 + lv * .2)} ATK · root ${+(1.5 + lv * .1).toFixed(1)}s · 40% slow`)},
  thousandarrows:{job:'sylvan', name:'พันศรพงไพร', en:'Thousand Arrows', max:10, type:'passive', sig:1, pas:lv => ({autoExtra:lv * .12, aspdPct:lv * .015, autoPct:lv * .03}),
    desc:lv => L(`[สกิลประจำสาย] ทุกครั้งที่ยิงปกติ ศรตามอีก ${lv * 12}% ATK · ยิงเร็วขึ้น ${+(lv * 1.5).toFixed(1)}% · ยิงปกติแรงขึ้น ${lv * 3}%`, `[Signature] Every basic shot is followed by ${lv * 12}% ATK · ${+(lv * 1.5).toFixed(1)}% faster · basic shots +${lv * 3}%`)},
  heavenpiercer:{job:'sylvan', name:'ศรทะลวงฟ้า', en:'Heaven Piercer', short:'ทะลวงฟ้า', shortEn:'Piercer', max:10, type:'line', sig:1, sp:lv => 70 + lv * 3, cd:25, len:420, width:26, fx:'pierce', anim:'attack', act:'aimup',
    dmg:lv => 10 + lv * 1.2, desc:lv => L(`[สกิลประจำสาย] ศรเดียวทะลุทุกตัวในแนว 420 · ${pc(10 + lv * 1.2)} ATK`, `[Signature] One arrow through everything in a 420 line · ${pc(10 + lv * 1.2)} ATK`)},
  /* muay line */
  shinguard:{job:'muay', name:'แข้งเหล็ก', en:'Iron Shins', max:10, type:'passive', pas:lv => ({hpPct:lv * .025, def:lv * 1.5, dmgRed:lv * .01}),
    desc:lv => L(`Max HP +${+(lv * 2.5).toFixed(1)}% · DEF +${+(lv * 1.5).toFixed(1)} · รับดาเมจ −${lv}%`, `Max HP +${+(lv * 2.5).toFixed(1)}% · DEF +${+(lv * 1.5).toFixed(1)} · damage taken −${lv}%`)},
  jabflow:{job:'muay', name:'หมัดไหลลื่น', en:'Flowing Jabs', max:10, type:'passive', pas:lv => ({autoPct:lv * .035, aspdPct:lv * .012, dbl:lv * .01}),
    desc:lv => L(`ต่อยปกติแรงขึ้น ${+(lv * 3.5).toFixed(1)}% · ต่อยเร็วขึ้น ${+(lv * 1.2).toFixed(1)}% · โอกาสต่อย 2 ครั้ง ${lv}%`, `Basic strikes +${+(lv * 3.5).toFixed(1)}% · ${+(lv * 1.2).toFixed(1)}% faster · ${lv}% double strike`)},
  stoneskin:{job:'grandmaster', name:'กายหินผา', en:'Stone Body', short:'กายหิน', shortEn:'Stone', max:10, type:'buff', sp:() => 25, cd:40, fx:'goldshield', anim:'skill', act:'wai',
    buff:lv => ({t:25, dmgRed:lv * .03, def:lv * 4}), desc:lv => L(`25 วิ · รับดาเมจ −${lv * 3}% · DEF +${lv * 4}`, `25s · damage taken −${lv * 3}% · DEF +${lv * 4}`)},
  thousandfists:{job:'grandmaster', name:'พันหมัด', en:'Thousand Fists', max:10, type:'passive', pas:lv => ({autoExtra:lv * .08, aspdPct:lv * .01}),
    desc:lv => L(`ทุกหมัดปกติ ต่อยซ้ำอีก ${lv * 8}% ATK · ต่อยเร็วขึ้น ${lv}%`, `Every basic strike lands a second blow of ${lv * 8}% ATK · ${lv}% faster`)},
  unbreakable:{job:'ringlord', name:'ยอดมวยไม่มีวันล้ม', en:'Unbreakable', max:10, type:'passive', pas:lv => ({dmgRed:lv * .015, hpPct:lv * .03, ...(lv >= 5 ? {noFlinch:1} : {})}),
    desc:lv => L(`รับดาเมจ −${+(lv * 1.5).toFixed(1)}% · Max HP +${lv * 3}% · Lv 5: ไม่ชะงักเมื่อโดนตี`, `Damage taken −${+(lv * 1.5).toFixed(1)}% · Max HP +${lv * 3}% · Lv 5: no flinching`)},
  nakmuay:{job:'ringlord', name:'นาคบิดหาง', en:'Naga Tail Twist', short:'นาคบิดหาง', shortEn:'Naga Twist', max:10, type:'melee', sig:1, sp:lv => 55 + lv * 3, cd:22, fx:'punch', anim:'attack', act:'spinkick',
    dmg:lv => 12 + lv * 1.3, stun:() => 2, desc:lv => L(`[สกิลประจำสาย] เตะหมุนตัวสุดแรง ${pc(12 + lv * 1.3)} ATK · มึน 2 วิ`, `[Signature] An all-out spinning kick · ${pc(12 + lv * 1.3)} ATK · stun 2s`)},
  /* healer line */
  zealot:{job:'healer', name:'หมอผู้เกรี้ยวกราด', en:'Zealot', max:10, type:'passive', pas:lv => ({matkPct:lv * .04, castPct:lv * .01}),
    desc:lv => L(`MATK +${lv * 4}% · ร่ายเร็วขึ้น ${lv}% · ทำให้หมอยาตีแรงพอล่าเดี่ยวได้`, `MATK +${lv * 4}% · ${lv}% faster casting · lets a healer hunt alone`)},
  divinewrath:{job:'physician', name:'ทัณฑ์สวรรค์', en:'Divine Wrath', short:'ทัณฑ์', shortEn:'Wrath', max:10, type:'bolt', elem:'holy', magic:true, sp:lv => 14 + lv, cd:1.2, cast:() => .9, range:220, fx:'holy', anim:'cast', act:'point',
    hits:() => 2, dmg:lv => 3 + lv * .35, desc:lv => L(`2 ลูก ลูกละ ${pc(3 + lv * .35)} MATK · ธาตุศักดิ์สิทธิ์`, `2 bolts × ${pc(3 + lv * .35)} MATK · Holy`)},
  sanctum:{job:'physician', name:'อาศรมคุ้มภัย', en:'Sanctum', short:'อาศรม', shortEn:'Sanctum', max:10, type:'buff', sp:() => 30, cd:40, fx:'heal', anim:'skill', act:'wai', share:1,
    buff:lv => ({t:30, dmgRed:lv * .02, regenPct:.01, every:3}), desc:lv => L(`30 วิ · รับดาเมจ −${lv * 2}% · ฟื้น HP 1% ทุก 3 วิ · ส่งให้ผู้เล่นรอบตัวด้วย`, `30s · damage taken −${lv * 2}% · regain 1% HP every 3s · also reaches players near you`)},
  lifeweave:{job:'divinehealer', name:'สายใยแห่งชีวิต', en:'Lifeweave', max:10, type:'passive', sig:1, pas:lv => ({healPow:lv * .05, freeSp:lv * .01, regenHp:lv * 30}),
    desc:lv => L(`[สกิลประจำสาย] ฟื้นแรงขึ้น ${lv * 5}% · ${lv}% ไม่เสีย SP · ฟื้น HP ${lv * 30} ทุก 10 วิ`, `[Signature] Heals +${lv * 5}% · ${lv}% chance to cost no SP · regain ${lv * 30} HP every 10s`)},
  judgment:{job:'divinehealer', name:'พิพากษาสวรรค์', en:'Heaven\'s Judgment', short:'พิพากษา', shortEn:'Judgment', max:10, type:'aoeTarget', sig:1, elem:'holy', magic:true, sp:lv => 80 + lv * 4, cd:22, cast:() => 2.5, range:240, radius:160, fx:'holy', anim:'cast', act:'invoke',
    hits:() => 5, every:.3, dmg:lv => 2 + lv * .3, desc:lv => L(`[สกิลประจำสาย] เสาแสงพิพากษารอบเป้า 160 · 5 ครั้ง ครั้งละ ${pc(2 + lv * .3)} MATK · ธาตุศักดิ์สิทธิ์`, `[Signature] Pillars of judgment around the target (160) · 5 hits × ${pc(2 + lv * .3)} MATK · Holy`)},
  /* rogue line */
  evasion:{job:'rogue', name:'หลบหลีก', en:'Evasion', max:10, type:'passive', pas:lv => ({flee:lv * 3, dodge:lv * .006}),
    desc:lv => L(`FLEE +${lv * 3} · หลบแน่นอน +${+(lv * .6).toFixed(1)}%`, `FLEE +${lv * 3} · Perfect Dodge +${+(lv * .6).toFixed(1)}%`)},
  bladedance:{job:'bandit', name:'ระบำใบมีด', en:'Blade Dance', max:10, type:'passive', pas:lv => ({autoExtra:lv * .07, aspdPct:lv * .01}),
    desc:lv => L(`ทุกครั้งที่ตีปกติ ฟันซ้ำอีก ${lv * 7}% ATK · ตีเร็วขึ้น ${lv}%`, `Every basic attack adds a cut of ${lv * 7}% ATK · ${lv}% faster`)},
  ambush:{job:'bandit', name:'จู่โจมจากเงา', en:'Ambush', max:10, type:'passive', pas:lv => ({critDmg:lv * .04, atkPct:lv * .015}),
    desc:lv => L(`ดาเมจคริ +${lv * 4}% · ATK +${+(lv * 1.5).toFixed(1)}% (เสริมสกิลลอบสังหาร)`, `Crit damage +${lv * 4}% · ATK +${+(lv * 1.5).toFixed(1)}% (for assassination skills)`)},
  phantom:{job:'tigershade', name:'ร่างมายา', en:'Phantom Body', max:10, type:'passive', sig:1, pas:lv => ({dodge:lv * .01, flee:lv * 4, lowHpAtk:lv * .03}),
    desc:lv => L(`[สกิลประจำสาย] หลบแน่นอน +${lv}% · FLEE +${lv * 4} · HP ต่ำกว่า 30% ตีแรงขึ้น ${lv * 3}%`, `[Signature] Perfect Dodge +${lv}% · FLEE +${lv * 4} · below 30% HP +${lv * 3}% damage`)},
  thousandcuts:{job:'tigershade', name:'พันคมพยัคฆ์', en:'Thousand Cuts', short:'พันคม', shortEn:'Cuts', max:10, type:'buff', sig:1, sp:() => 50, cd:45, fx:'stealth', anim:'skill', act:'crouch',
    buff:lv => ({t:12, autoExtra:lv * .15, aspdPct:lv * .03}), desc:lv => L(`[สกิลประจำสาย] 12 วิ · ทุกครั้งที่ตีปกติ ฟันซ้ำ ${lv * 15}% ATK · ตีเร็วขึ้น ${lv * 3}%`, `[Signature] 12s · every basic attack adds ${lv * 15}% ATK · ${lv * 3}% faster`)},
  /* summoner line */
  spiritbolt:{job:'summoner', name:'ศรวิญญาณ', en:'Spirit Bolt', short:'ศรวิญญาณ', shortEn:'Bolt', max:10, type:'bolt', elem:'holy', magic:true, sp:lv => 8 + lv, cd:.6, cast:() => .7, range:220, fx:'holy', anim:'cast', act:'point',
    hits:lv => 1 + Math.floor(lv / 5), dmg:lv => 1.5 + lv * .2, desc:lv => L(`${1 + Math.floor(lv / 5)} ลูก ลูกละ ${pc(1.5 + lv * .2)} MATK · ธาตุศักดิ์สิทธิ์ (Lv 5 · 10: +1 ลูก)`, `${1 + Math.floor(lv / 5)} bolt(s) × ${pc(1.5 + lv * .2)} MATK · Holy (Lv 5 · 10: +1)`)},
  spiritmind:{job:'summoner', name:'จิตวิญญาณ', en:'Spirit Mind', max:10, type:'passive', pas:lv => ({matkPct:lv * .035, castPct:lv * .01}),
    desc:lv => L(`MATK +${+(lv * 3.5).toFixed(1)}% · ร่ายเร็วขึ้น ${lv}%`, `MATK +${+(lv * 3.5).toFixed(1)}% · ${lv}% faster casting`)},
  astralray:{job:'sovereign', name:'รังสีดารา', en:'Astral Ray', short:'รังสีดารา', shortEn:'Ray', max:10, type:'line', elem:'holy', magic:true, sp:lv => 26 + lv * 2, cd:3, len:260, width:22, fx:'pierce', anim:'cast', act:'point',
    dmg:lv => 4 + lv * .5, desc:lv => L(`ลำแสงเส้นตรง 260 · ${pc(4 + lv * .5)} MATK ทุกตัวในแนว · ธาตุศักดิ์สิทธิ์`, `A 260 beam · ${pc(4 + lv * .5)} MATK to everything in line · Holy`)},
  beastward:{job:'sovereign', name:'พิทักษ์สรรพสัตว์', en:'Beast Ward', short:'พิทักษ์', shortEn:'Ward', max:10, type:'buff', sp:() => 25, cd:40, fx:'goldshield', anim:'skill', act:'wai',
    buff:lv => ({t:30, dmgRed:lv * .02, sumAtkB:lv * .02}), desc:lv => L(`30 วิ · รับดาเมจ −${lv * 2}% · สัตว์อัญเชิญแรงขึ้น ${lv * 2}%`, `30s · damage taken −${lv * 2}% · summons +${lv * 2}%`)},
  himmapanlord:{job:'himmaemperor', name:'เจ้าแห่งหิมพานต์', en:'Lord of Himmapan', max:10, type:'passive', sig:1, pas:lv => ({sumAtk:lv * .05, sumDurPct:lv * .03}),
    desc:lv => L(`[สกิลประจำสาย] สัตว์อัญเชิญแรงขึ้น ${lv * 5}% · อยู่นานขึ้น ${lv * 3}%`, `[Signature] Summons +${lv * 5}% · last ${lv * 3}% longer`)},
  heavenfall:{job:'himmaemperor', name:'สวรรค์ทลาย', en:'Heavenfall', short:'สวรรค์ทลาย', shortEn:'Heavenfall', max:10, type:'aoeTarget', sig:1, elem:'holy', magic:true, sp:lv => 85 + lv * 4, cd:24, cast:() => 2.5, range:240, radius:170, fx:'meteor', anim:'cast', act:'invoke',
    hits:() => 5, every:.3, dmg:lv => 2 + lv * .28, desc:lv => L(`[สกิลประจำสาย] ฟ้าสวรรค์ถล่มรอบเป้า 170 · 5 ครั้ง ครั้งละ ${pc(2 + lv * .28)} MATK · ธาตุศักดิ์สิทธิ์`, `[Signature] Heaven falls around the target (170) · 5 hits × ${pc(2 + lv * .28)} MATK · Holy`)}
};
/* a few older skills come back into the lists; the two one-level buffs get real levels */
if (SKILLS.vitalspot) SK8_NEW.vitalspot = {...SKILLS.vitalspot, job:'rogue', max:10};
if (SKILLS.herbdart) SK8_NEW.herbdart = {...SKILLS.herbdart, job:'healer', req:undefined};
if (SKILLS.thread) Object.assign(SKILLS.thread, {max:10, buff:lv => ({def:lv * 2, t:45}), desc:lv => L(`DEF +${lv * 2} · 45 วิ · ส่งให้ผู้เล่นรอบตัวด้วย`, `DEF +${lv * 2} · 45s · also reaches players near you`), _k8:1});
if (SKILLS.ramwai) Object.assign(SKILLS.ramwai, {max:10, buff:lv => ({atkPct:lv * .015, crit:lv, t:20}), desc:lv => L(`ATK +${+(lv * 1.5).toFixed(1)}% · CRIT +${lv}% · 20 วิ`, `ATK +${+(lv * 1.5).toFixed(1)}% · CRIT +${lv}% · 20s`), _k8:1});
for (const [id, s] of Object.entries(SK8_NEW)) SKILLS[id] = {...(SKILLS[id] || {}), ...s};

/* ---------- the eight per tier and the style of each ---------- */
const SK8 = {
  blade:{a:['swordmastery', 'bladerhythm', 'warcry'], b:['waveslash', 'charge', 'quake'], c:['provoke', 'guardstance']},
  warlord:{a:['warpath', 'cleave'], b:['earthsplit', 'bladestorm', 'tuskcharge'], c:['roar', 'goldshield', 'guardheart']},
  bulwark:{a:['peerless'], b:['vanguard', 'judgement', 'shieldbash', 'warking'], c:['warbanner', 'bastion', 'vajrabody']},
  rune:{a:['focus', 'manastream'], b:['firebolt', 'icebolt', 'thunder', 'stonespike'], c:['barrier', 'frostnova']},
  astro:{a:['astrowisdom', 'navagraha'], b:['meteor', 'frostsea', 'wrath', 'earthrage'], c:['starveil', 'gravity']},
  archsage:{a:['fourelements', 'arcanestorm'], b:['solarfall', 'deluge', 'tempest', 'earthswallow', 'cataclysm'], c:['elemseal']},
  ranger:{a:['hunterfocus', 'rapidfire'], b:['doubleshot', 'arrowrain', 'backstep'], c:['spiketrap', 'hawkeye', 'beastbond']},
  warden:{a:['mountedarcher', 'deadeye'], b:['pierce', 'firerain', 'pinarrow'], c:['tiger', 'wildkin', 'snarefield']},
  sylvan:{a:['packcall', 'forestblood', 'thousandarrows'], b:['eaglearrow', 'stormvolley', 'spiritarrow', 'heavenpiercer'], c:['rootsnare']},
  muay:{a:['waikhru', 'muaymastery', 'jabflow'], b:['combo', 'roundkick', 'flyingknee', 'elbowback'], c:['shinguard']},
  grandmaster:{a:['ramwai', 'thousandfists'], b:['crocodile', 'hanuman', 'monkick', 'grabthrow', 'flowart'], c:['stoneskin']},
  ringlord:{a:['drumrally', 'kardchuek'], b:['elbowstorm', 'shinstorm', 'finisher', 'kneeclinch', 'nakmuay'], c:['unbreakable']},
  healer:{a:['herbheal', 'poultice', 'antidote', 'herbalism'], b:['holywater', 'herbdart', 'zealot'], c:['thread']},
  physician:{a:['elixir', 'purify', 'royaltext'], b:['holycircle', 'divinewrath'], c:['revive', 'tonic', 'sanctum']},
  divinehealer:{a:['amrita', 'divinehand', 'lifeweave'], b:['holylight', 'judgment'], c:['sanctuary', 'massrevive', 'blessing']},
  rogue:{a:['dualwield', 'vitalspot', 'thiefsense'], b:['backstab', 'shadowlunge'], c:['hamstring', 'smokebomb', 'evasion']},
  bandit:{a:['tigerheart', 'bladedance'], b:['assassinate', 'knifevolley', 'ambush'], c:['shadowstep', 'plunder', 'venomblade']},
  tigershade:{a:['moonclaw', 'tigerfang', 'thousandcuts'], b:['deathmark', 'tigerpounce', 'tigerclaw', 'shadowexec'], c:['phantom']},
  summoner:{a:['callsingha', 'callnaga', 'sumlore'], b:['spiritburst', 'spiritbolt', 'spiritmind'], c:['callkinnaree', 'soulpact']},
  sovereign:{a:['callgaruda', 'callerawan', 'sovlore', 'royalbond'], b:['goldenhong', 'astralray'], c:['unity', 'beastward']},
  himmaemperor:{a:['beastcharge', 'kaisorn', 'emperorgrace', 'himmapanlord'], b:['gatestorm', 'emperorwrath', 'heavenfall'], c:['royaledict']}
};
const SK8_OF = {};   // skill id → style letter
for (const [job, P0] of Object.entries(SK8)){ const list = [...P0.a, ...P0.b, ...P0.c].filter(id => SKILLS[id]);
  if (JOBS[job]){ JOBS[job].skills = list; for (const id of list){ SKILLS[id].job = job; SK8_OF[id] = list.includes(id) && P0.a.includes(id) ? 'a' : P0.b.includes(id) ? 'b' : 'c'; } } }

/* ---------- older skills that stopped below Lv 10 run to Lv 10 on the same curve ---------- */
const SK8_NOSTRETCH = new Set(['royalbond']);
const SK8_FN = ['dmg', 'heal', 'buff', 'pas', 'desc', 'st', 'stun', 'freeze', 'poison', 'sp', 'dist', 'cast', 'hits'];
const sk8Stretch = (id, s) => { const m0 = s.max; if (m0 >= 10 || SK8_NOSTRETCH.has(id) || s._k8) return; const k = m0 / 10;
  for (const f of SK8_FN) if (typeof s[f] === 'function'){ const o = s[f]; s[f] = f === 'hits' ? (lv => o(Math.max(1, Math.round(lv * k)))) : (lv => o(lv * k)); }
  s.max = 10; s._k8 = m0; };
for (const job of Object.keys(SK8)) for (const id of (JOBS[job] ? JOBS[job].skills : [])) sk8Stretch(id, SKILLS[id]);
/* prerequisites stay within the tier's eight (one on a skill outside them is dropped) and are re-scaled to the new levels */
for (const job of Object.keys(SK8)) for (const id of (JOBS[job] ? JOBS[job].skills : [])){ const s = SKILLS[id]; if (!s.req) continue; const r = {};
  for (const [q, n] of Object.entries(s.req)){ if (!SKILLS[q] || !JOBS[job].skills.includes(q)) continue; const m0 = SKILLS[q]._k8; r[q] = Math.min(10, Math.max(1, m0 ? Math.ceil(n * 10 / m0) : n)); }
  s.req = Object.keys(r).length ? r : undefined; }
// a new skill asks for an older skill of its own style (never another new one, so no loop can form)
for (const id of Object.keys(SK8_NEW)) if (SKILLS[id] && !SKILLS[id].req){ const job = SKILLS[id].job, st = SK8_OF[id], first = st && SK8[job][st].find(x => x !== id && SKILLS[x] && SKILLS[x].job === job && !SK8_NEW[x]); if (first) SKILLS[id].req = {[first]:SKILLS[id].sig ? 5 : 3}; }
// and a last guard: any requirement that would close a loop is removed
for (const job of Object.keys(SK8)){ const list = JOBS[job] ? JOBS[job].skills : [];
  const loops = (a, seen = new Set()) => { if (seen.has(a)) return true; seen.add(a); return Object.keys(SKILLS[a].req || {}).some(q => list.includes(q) && loops(q, new Set(seen))); };
  for (const id of list) if (loops(id)) SKILLS[id].req = undefined; }

/* ---------- orb (basic) attacks for casters: orbPct, orbMulti ---------- */
{ const _md = magicDamage; magicDamage = function(m, mult){ const r = _md.apply(this, arguments); const p = DER && DER.pas && DER.pas.orbPct;
    if (p && !r.miss && (mult === .7 || mult === .3)) r.dmg = Math.max(1, Math.round(r.dmg * (1 + p))); return r; }; }
{ const _ba = basicAttack; basicAttack = function(t){ const r = _ba.apply(this, arguments); const n = (DER && DER.pas && DER.pas.orbMulti) | 0;
    if (n > 0 && JOBS[S.job].caster && t && !t.dead) for (let i = 0; i < n; i++) projs.push({k:'orb', elem:DER.welem, x:P.x + (i ? -10 : 10), y:P.y - 38, t, delay:.12 + (i + 1) * .1, speed:520, hit:() => { if (t.dead) return; const d = magicDamage(t, .7, DER.welem); d.dmg = Math.round(d.dmg * .6); applyDamage(t, d); VFX.play('orbHit', {x:t.x, y:t.y - MOB_H[t.type] * .5, elem:DER.welem}); }});
    return r; }; }

/* ---------- every character places its points again once ---------- */
{ const _d = derive; derive = function(){
    if (S && S.skills && !S._sk8){ S._sk8 = 1; let back = 0; for (const id in S.skills){ back += S.skills[id] | 0; } S.skills = {};
      if (S.hot) S.hot = S.hot.map(h => (h && (h.k === 'skill' || SKILLS[h]) ? null : h)); S.skPts = (S.skPts || 0) + back; dirty = true;
      if (back) setTimeout(() => { if (typeof banner === 'function') banner(L(`ระบบสกิลใหม่: คืน Skill Point ${back} แต้ม · เลือกสายการเล่นแล้วลงใหม่ได้เลย (S)`, `New skill system: ${back} Skill Points returned · pick a style and place them again (S)`)); }, 1500); }
    return _d.apply(this, arguments); }; }

/* ---------- (v161/v162) the class bonus no longer tops up the eight-skill tiers ----------
   skbonus.js used to add the points a class was short of to max every skill (31 a tier after v159), which let every
   build learn everything. Those bonus points are taken back, class line by class line (each line keeps its own points,
   classswap.js), when that line is in use: its skills are refunded and the bonus is taken off.
   (v162) v161 took the bonus of EVERY line off the line in use, which left some classes with no points at all. Now a
   line never has fewer points than its Job Levels gave: 49 for each finished tier and one per Job Level in the
   current one, counted with the points already spent. A line that is short gets the difference back at once. */
const sk8Earned = () => { let n = 0; for (const j of jobChain()){ if (!SK8[j]) continue; n += j === S.job ? Math.max(0, (S.jlvl | 0) - 1) : Math.max(0, (JOBS[j].jobMax || 1) - 1); } return n; };
const sk8Spent = () => { let n = 0; for (const id in S.skills || {}){ const sk = SKILLS[id]; if (sk && SK8[sk.job]) n += S.skills[id] | 0; } return n; };
{ const _d = derive; derive = function(){
    if (S && S.skills && S._sk8 && S.job && JOBS[S.job]){
      let bonus = 0; S.skb = S.skb || {};
      for (const j of jobChain()) if (SK8[j] && (S.skb[j] | 0) > 0){ bonus += S.skb[j] | 0; S.skb[j] = 0; }
      if (bonus > 0){ const back = sk8Spent(); for (const id in S.skills){ const sk = SKILLS[id]; if (sk && SK8[sk.job]) delete S.skills[id]; }
        if (S.hot) S.hot = S.hot.map(h => (h && (h.k === 'skill' || SKILLS[h]) && SKILLS[h.id || h] && SK8[SKILLS[h.id || h].job] ? null : h));
        S.skPts = Math.max(0, (S.skPts || 0) + back - bonus); dirty = true;
        setTimeout(() => { if (typeof banner === 'function') banner(L(`ปรับแต้มสกิล: นำแต้มโบนัสที่ทำให้อัปได้ทุกสกิลออก ${bonus} แต้ม · คืนแต้มให้ลงสายใหม่ (S)`, `Skill points fixed: ${bonus} bonus points that let you max every skill were removed · points refunded to place again (S)`)); }, 1500); }
      const short = sk8Earned() - ((S.skPts || 0) + sk8Spent());
      if (short > 0){ S.skPts = (S.skPts || 0) + short; dirty = true;
        setTimeout(() => { if (typeof toast === 'function') toast(L(`คืน Skill Point ${short} แต้มที่ขาดไป`, `${short} missing Skill Points given back`)); }, 1600); }
    }
    return _d.apply(this, arguments); }; }

/* ---------- the skill window shows each skill's style ---------- */
const sk8Style = id => { const s = SKILLS[id], line = s && SK8_LINE[s.job], st = SK8_OF[id]; return line && st ? SK8_PATH[line][st] : null; };
{ const _rs = renderSkills;
  renderSkills = function(){ const r = _rs.apply(this, arguments); const pane = document.getElementById('pane-skill'); if (!pane) return r;
    pane.querySelectorAll('.skn[data-node]').forEach(n => { const p = sk8Style(n.dataset.node), sg = SKILLS[n.dataset.node] && SKILLS[n.dataset.node].sig; if (!p) return;
      n.style.setProperty('--sty', p[2]); n.classList.add('sk8'); if (sg) n.classList.add('sk8sig');
      if (!n.querySelector('.sk8tag')){ const t = document.createElement('i'); t.className = 'sk8tag'; t.textContent = L(p[0], p[1]); n.appendChild(t); } });
    const det = pane.querySelector('.skdetail .nm'), sel = typeof SKSEL !== 'undefined' && SKSEL, p = sel && sk8Style(sel);
    if (det && p && !det.querySelector('.sk8line')) det.insertAdjacentHTML('afterbegin', `<small class="sk8line" style="--sty:${p[2]}">${L('สาย', 'Style')}: <b>${L(p[0], p[1])}</b>${SKILLS[sel].sig ? ` · <b>${L('สกิลประจำสาย', 'Signature')}</b>` : ''}</small>`);
    const top = pane.querySelector('.sktop'), job = typeof skTab !== 'undefined' ? String(skTab).replace('>', '') : S.job, line = SK8_LINE[job];
    if (top && line && !pane.querySelector('.sk8legend')){ const P0 = SK8_PATH[line];
      top.insertAdjacentHTML('afterend', `<div class="sk8legend">${['a', 'b', 'c'].map(k => `<span style="--sty:${P0[k][2]}">${L(P0[k][0], P0[k][1])}</span>`).join('')}<small>${L('5 สกิลต่อขั้น · แต้มพอลงเกือบครบทุกสกิล', '5 skills a tier · points for nearly all of them')}</small></div>`); }
    return r; }; }
{ const st = document.createElement('style');
  st.textContent = `
.skn.sk8 .sknb{box-shadow:inset 0 -3px 0 var(--sty)}
.skn.sk8 .sk8tag{position:absolute;left:50%;bottom:-9px;transform:translateX(-50%);padding:0 6px;border-radius:8px;background:var(--sty);color:#fff;font:700 9.5px/1.5 var(--display,sans-serif);font-style:normal;white-space:nowrap;pointer-events:none;box-shadow:0 1px 2px rgba(0,0,0,.25)}
.skn.sk8{position:relative}
.skn.sk8sig .sknb{box-shadow:inset 0 -3px 0 var(--sty),0 0 0 2px #ffcf4a,0 0 12px rgba(255,190,60,.7)}
.sk8legend{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:4px 0 8px}
.sk8legend span{padding:1px 10px;border-radius:10px;background:var(--sty);color:#fff;font:700 12px/1.6 var(--display,sans-serif)}
.sk8legend small{color:#7a6a4a;font-size:11px}
.sk8line{display:block;color:var(--sty) !important;font-weight:600}`;
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'skills8', t:['สายการเล่นและสกิล 8 ช่อง', 'Play styles and the eight skills'], b:() => `<p>${L('ทุกอาชีพมีสกิล 8 สกิลต่อขั้น (ขั้น 2–4) ทุกสกิลสูงสุด Lv 10 · แต้มต่อขั้น 49 แต้ม พอสำหรับราว 5 สกิล จึงต้องเลือกสาย · ขั้นที่ 4 มีสกิลประจำสายที่แรงที่สุดของสาย', 'Every class has 8 skills per tier (tiers 2–4), each up to Lv 10 · 49 points per tier is enough for about 5, so you choose a style · tier 4 adds the signature skills')}</p>
  <ul>${Object.values(SK8_PATH).map(p => `<li>${['a', 'b', 'c'].map(k => L(p[k][0], p[k][1])).join(' · ')}</li>`).join('')}</ul>`});
