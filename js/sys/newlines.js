/* VAYRATHEN — js/sys/newlines.js — (v164) five new class lines, each with three tiers and eight skills a tier
     ไสยเวท   ไสยเวท → จอมขมังเวท → ราชันย์ไสยเวท       dark magic: curses, hexes and statuses (staff · INT)
     พ่อค้า    พ่อค้า → นายวาณิช → มหาเศรษฐีวาณิช        the middle way: an axe (one hand + shield, or two hands), money skills, trade buffs
     เผ่าแมว  เจ้าเหมียว → แมวป่าจอมซน → ราชินีวิเชียรมาศ   cat folk: claws, pounces, charm and nine lives (AGI · DEX)
     เผ่าหมา  เจ้าตูบ → อัศวินหมาเฝ้าวัง → อัศวินบางแก้ว   dog folk: a loyal guard with sword and shield, bites and howls (VIT · STR)
     นินจา    นินจา → นินจาเงา → จอมนินจาคาเงะ           kunai and ninjato, ninjutsu (fire, water, wind, lightning), smoke and clones (AGI · DEX)
   Every tier has the same three play styles as the other lines (a · b · c), 49 points for 80 levels of skills, and
   tier 4 opens at Job Lv 50 of tier 3 and Base Lv 150. Statuses, money costs, effects, looks, weapons and kits are in
   newlines2.js. */
'use strict';

/* ---------- the classes ---------- */
const NL_JOBS = {
  occult:{tier:2, name:'ไสยเวท', en:'Hexer', parent:'novice', next:['shaman'], hp:.7, sp:5.6, delay:60, range:150, caster:true, jobMax:50, stat:'INT · DEX',
    weapon:{name:'ไม้เท้ากะโหลกหมอผี', en:'Skull Staff', atk:14, type:'staff', matk:30}},
  shaman:{tier:3, name:'จอมขมังเวท', en:'Dark Shaman', parent:'occult', next:['hexlord'], hp:.9, sp:8.2, delay:56, range:150, caster:true, jobMax:50, stat:'INT · DEX',
    weapon:{name:'ไม้เท้าขมังเวท', en:'Shaman Staff', atk:30, type:'staff', matk:82}},
  hexlord:{tier:4, name:'ราชันย์ไสยเวท', en:'Hex Sovereign', parent:'shaman', hp:1.05, sp:10.5, delay:54, range:160, caster:true, jobMax:50, stat:'INT · DEX',
    weapon:{name:'คทาราชันย์ไสยเวท', en:'Hex Sovereign Sceptre', atk:40, type:'staff', matk:210}},
  merchant:{tier:2, name:'พ่อค้า', en:'Merchant', parent:'novice', next:['tradelord'], hp:.95, sp:3, delay:54, range:28, jobMax:50, stat:'STR · LUK',
    weapon:{name:'ขวานมือเดียวพ่อค้า', en:"Merchant's Hand Axe", atk:36, type:'sword'}},
  tradelord:{tier:3, name:'นายวาณิช', en:'Trade Master', parent:'merchant', next:['tycoon'], hp:1.3, sp:3.6, delay:54, range:30, jobMax:50, stat:'STR · LUK',
    weapon:{name:'ขวานศึกวาณิช', en:'Trade Master War Axe', atk:90, type:'sword'}},
  tycoon:{tier:4, name:'มหาเศรษฐีวาณิช', en:'Grand Tycoon', parent:'tradelord', hp:1.6, sp:4, delay:52, range:30, jobMax:50, stat:'STR · LUK',
    weapon:{name:'ขวานทองมหาเศรษฐี', en:"Tycoon's Golden Axe", atk:150, type:'sword'}},
  catfolk:{tier:2, name:'เจ้าเหมียว', en:'Kitty Folk', parent:'novice', next:['lynx'], hp:.8, sp:2.6, delay:42, range:24, jobMax:50, stat:'AGI · DEX',
    weapon:{name:'กรงเล็บแมวน้อย', en:'Kitten Claws', atk:30, type:'fist'}},
  lynx:{tier:3, name:'แมวป่าจอมซน', en:'Wildcat Dancer', parent:'catfolk', next:['catqueen'], hp:1.05, sp:3.2, delay:40, range:24, jobMax:50, stat:'AGI · DEX',
    weapon:{name:'กรงเล็บแมวป่า', en:'Wildcat Claws', atk:84, type:'fist'}},
  catqueen:{tier:4, name:'ราชินีวิเชียรมาศ', en:'Royal Siamese', parent:'lynx', hp:1.25, sp:3.8, delay:36, range:24, jobMax:50, stat:'AGI · DEX · LUK',
    weapon:{name:'กรงเล็บวิเชียรมาศ', en:'Wichienmaat Claws', atk:145, type:'fist'}},
  dogfolk:{tier:2, name:'เจ้าตูบ', en:'Puppy Guard', parent:'novice', next:['houndknight'], hp:1.05, sp:2.2, delay:56, range:28, jobMax:50, stat:'VIT · STR',
    weapon:{name:'ดาบเฝ้าบ้าน', en:'Housewatch Sword', atk:36, type:'sword'}},
  houndknight:{tier:3, name:'อัศวินหมาเฝ้าวัง', en:'Hound Knight', parent:'dogfolk', next:['bangkaew'], hp:1.5, sp:2.8, delay:52, range:30, jobMax:50, stat:'VIT · STR',
    weapon:{name:'ดาบอัศวินเฝ้าวัง', en:'Palace Hound Blade', atk:88, type:'sword'}},
  bangkaew:{tier:4, name:'อัศวินบางแก้ว', en:'Bangkaew Paladin', parent:'houndknight', hp:1.9, sp:3.2, delay:50, range:30, jobMax:50, stat:'VIT · STR',
    weapon:{name:'ดาบศักดิ์สิทธิ์บางแก้ว', en:'Bangkaew Holy Blade', atk:148, type:'sword'}},
  ninja:{tier:2, name:'นินจา', en:'Ninja', parent:'novice', next:['shinobi'], hp:.85, sp:2.8, delay:40, range:24, jobMax:50, stat:'AGI · DEX',
    weapon:{name:'คุไนนินจา', en:'Ninja Kunai', atk:34, type:'dagger'}},
  shinobi:{tier:3, name:'นินจาเงา', en:'Shadow Shinobi', parent:'ninja', next:['kage'], hp:1.05, sp:3.4, delay:36, range:26, jobMax:50, stat:'AGI · DEX',
    weapon:{name:'นินจาโตะเงา', en:'Shadow Ninjato', atk:86, type:'dagger'}},
  kage:{tier:4, name:'จอมนินจาคาเงะ', en:'Kage', parent:'shinobi', hp:1.2, sp:3.8, delay:32, range:26, jobMax:50, stat:'AGI · DEX · LUK',
    weapon:{name:'ดาบคาเงะ', en:'Kage Blade', atk:150, type:'dagger'}}
};
for (const [id, j] of Object.entries(NL_JOBS)) JOBS[id] = {ranged:false, ...j, skills:[]};
for (const l of ['occult', 'merchant', 'catfolk', 'dogfolk', 'ninja']) if (!JOBS.novice.next.includes(l)) JOBS.novice.next.push(l);
const NL_LINES = ['occult', 'merchant', 'catfolk', 'dogfolk', 'ninja'];
const NL_LINE_OF = {occult:'occult', shaman:'occult', hexlord:'occult', merchant:'merchant', tradelord:'merchant', tycoon:'merchant', catfolk:'catfolk', lynx:'catfolk', catqueen:'catfolk',
  dogfolk:'dogfolk', houndknight:'dogfolk', bangkaew:'dogfolk', ninja:'ninja', shinobi:'ninja', kage:'ninja'};
const nlLine = () => { for (const j of jobChain()) if (NL_LINE_OF[j]) return NL_LINE_OF[j]; return null; };

/* ---------- the words a skill's text is made of ---------- */
const nlP = v => `${Math.round(v * 100)}%`;
const nlN = v => +(+v).toFixed(1);
const NL_STAT = {   // [th, en, how the value reads]
  atkPct:['ATK', 'ATK', nlP], matkPct:['MATK', 'MATK', nlP], aspdPct:['ความเร็วโจมตี', 'Attack speed', nlP], crit:['CRIT', 'CRIT', v => `${nlN(v)}%`],
  critDmg:['แรงคริ', 'Critical damage', nlP], flee:['FLEE', 'FLEE', nlN], def:['DEF', 'DEF', nlN], hpPct:['Max HP', 'Max HP', nlP], spPct:['Max SP', 'Max SP', nlP],
  castPct:['เวลาร่าย −', 'Cast time −', nlP], fistAtk:['ATK มือ', 'Fist ATK', nlN], daggerAtk:['ATK มีด', 'Dagger ATK', nlN], dodge:['หลบหลีกสมบูรณ์', 'Perfect dodge', nlP],
  shieldBlock:['บล็อก', 'Block', v => `${nlN(v)}%`], critRes:['ต้านทานคริ', 'Critical Resistance', v => `${nlN(v)}%`], biaPct:['เบี้ยจากการขาย', 'Bia from selling', nlP],
  reflect:['สะท้อนดาเมจ', 'Reflect damage', nlP], move:['ความเร็วเดิน', 'Move speed', nlP], curseAmp:['ผลคำสาป', 'Curse power', nlP]};
const nlStats = (o, sign = '+') => Object.entries(o || {}).filter(([k, v]) => NL_STAT[k] && v).map(([k, v]) => {
  const [th, en, f] = NL_STAT[k], neg = k === 'castPct';
  return [`${th}${neg ? '' : ` ${sign}`}${f(v)}`, `${en}${neg ? '' : ` ${sign}`}${f(v)}`]; });
const NL_ST = {
  stun:v => [`Stun ${nlN(v)} วิ`, `Stun ${nlN(v)}s`], stop:v => [`หยุดนิ่ง ${nlN(v)} วิ`, `Held ${nlN(v)}s`], root:v => [`ตรึงกับที่ ${nlN(v)} วิ`, `Rooted ${nlN(v)}s`],
  slow:v => [`ช้าลง ${nlP(v[0])} ${nlN(v[1])} วิ`, `Slowed ${nlP(v[0])} for ${nlN(v[1])}s`], poison:v => [`พิษ ${nlP(v[0])} ATK/วิ ${nlN(v[1])} วิ`, `Poison ${nlP(v[0])} ATK/s for ${nlN(v[1])}s`],
  defDown:v => [`DEF ศัตรู −${nlP(v[0])} ${nlN(v[1])} วิ`, `Enemy DEF −${nlP(v[0])} for ${nlN(v[1])}s`], atkDown:v => [`ATK ศัตรู −${nlP(v[0])} ${nlN(v[1])} วิ`, `Enemy ATK −${nlP(v[0])} for ${nlN(v[1])}s`],
  taunt:() => ['ดึงความสนใจมอน', 'Taunts'], shock:v => [`ช็อต ${nlN(v)} วิ`, `Shock ${nlN(v)}s`], freeze:v => [`แช่แข็ง ${nlP(v[0])} ${nlN(v[1])} วิ`, `Freeze ${nlP(v[0])} for ${nlN(v[1])}s`],
  curse:v => [`คำสาป: ศัตรูรับดาเมจ +${nlP(v[0])} และเสีย ${nlP(v[2] || 0)} MATK/วิ ${nlN(v[1])} วิ`, `Curse: enemy takes +${nlP(v[0])} damage and ${nlP(v[2] || 0)} MATK/s for ${nlN(v[1])}s`],
  blind:v => [`มืดบอด ${nlN(v)} วิ (ตีพลาดครึ่งหนึ่ง)`, `Blind ${nlN(v)}s (misses half its blows)`], fear:v => [`หวาดกลัววิ่งหนี ${nlN(v)} วิ`, `Fear: runs away ${nlN(v)}s`],
  doom:v => [`คำสาปมรณะ: ครบ ${nlN(v[0])} วิ ระเบิด ${nlP(v[1])} MATK`, `Doom: after ${nlN(v[0])}s it bursts for ${nlP(v[1])} MATK`], charm:v => [`หลงเสน่ห์ ไม่โจมตี ${nlN(v)} วิ`, `Charmed: will not attack for ${nlN(v)}s`]};
const nlSt = o => Object.entries(o || {}).filter(([k, v]) => NL_ST[k] && v).map(([k, v]) => NL_ST[k](v));
const NL_ELEM = {fire:['ธาตุไฟ', 'Fire'], water:['ธาตุน้ำ', 'Water'], wind:['ธาตุลม', 'Wind'], earth:['ธาตุดิน', 'Earth'], holy:['ศักดิ์สิทธิ์', 'Holy'], shadow:['ธาตุมืด', 'Shadow'], poison:['ธาตุพิษ', 'Poison']};
/* a skill's text from what it is */
function nlDesc(s){
  return lv => {
    const th = [], en = [], push = ([a, b]) => { th.push(a); en.push(b); }, kind = s.magic ? 'MATK' : 'ATK';
    if (s.lead) push(s.lead);
    if (s.dmg){ const h = s.hits ? s.hits(lv) : 1, d = s.dmg(lv);
      const where = s.type === 'aoeSelf' ? [`รอบตัว ${s.radius}`, `around you (${s.radius})`] : s.type === 'aoeTarget' || s.type === 'fieldDot' ? [`รัศมี ${s.radius}`, `radius ${s.radius}`]
        : s.type === 'line' ? [`เส้นตรง ${s.len}`, `a line of ${s.len}`] : s.type === 'dash' ? ['พุ่งเข้าหาเป้า', 'dashes in'] : null;
      if (where) push(where);
      if (d > 0) push(h > 1 ? [`${h} ครั้ง ครั้งละ ${nlP(d)} ${kind}`, `${h} hits × ${nlP(d)} ${kind}`] : [`${nlP(d)} ${kind}`, `${nlP(d)} ${kind}`]); }
    if (s.heal) push([`ฟื้น HP ${nlP(s.healPct(lv))} ของ Max HP`, `Restores ${nlP(s.healPct(lv))} of Max HP`]);
    if (s.st) nlSt(s.st(lv)).forEach(push); else if (s.stun) push(NL_ST.stun(s.stun(lv)));
    if (s.knock) push([`กระเด็น`, `knockback`]);
    if (s.buff){ const b = s.buff(lv); nlStats(b).forEach(push); if (b.dmgRed) push([`รับดาเมจ −${nlP(b.dmgRed)}`, `Damage taken −${nlP(b.dmgRed)}`]); if (b.stealth) push(['ล่องหน', 'Stealth']);
      if (b.sureCrit) push(['ตีถัดไปคริแน่นอน', 'next blow is a sure critical']); push([`นาน ${nlN(b.t)} วิ`, `for ${nlN(b.t)}s`]); if (s.team) push(['ส่งให้ผู้เล่นรอบตัวด้วย', 'also reaches players near you']); }
    if (s.pas){ const p = s.pas(lv); nlStats(p).forEach(push); if (p.dmgRed) push([`รับดาเมจ −${nlP(p.dmgRed)}`, `Damage taken −${nlP(p.dmgRed)}`]); if (p.lastStand) push(['รอดจากความตาย 1 ครั้งทุก 5 นาที', 'survives a deadly blow once every 5 minutes']); }
    if (s.dist) push([`ถอย/วาร์ป ${Math.round(s.dist(lv))}`, `moves ${Math.round(s.dist(lv))}`]);
    if (s.drain) push([`ดูดเลือดคืน ${nlP(s.drain)} ของดาเมจ`, `heals you for ${nlP(s.drain)} of the damage`]);
    if (s.bia) push([`ใช้เงิน ${s.bia(lv).toLocaleString()} เบี้ย`, `costs ${s.bia(lv).toLocaleString()} Bia`]);
    if (s.elem && NL_ELEM[s.elem]) push(NL_ELEM[s.elem]);
    if (s.cast){ const c = s.cast(lv); if (c > 0) push([`ร่าย ${nlN(c)} วิ`, `cast ${nlN(c)}s`]); }
    if (s.tail) push(s.tail);
    return L(th.join(' · '), en.join(' · '));
  };
}
/* building blocks: nlPas = passive, nlBuf = buff, nlAtk = attack (any damaging type), nlDeb = debuff, nlHeal = heal */
const nlSk = (id, job, th, en, short, o) => { const s = {id, job, name:th, en, short:short[0], shortEn:short[1], max:10, anim:'skill', ...o}; s.kind = s.type === 'passive' ? 'passive' : s.type === 'buff' ? 'buff' : 'active'; if (!s.sp) s.sp = () => 0; s.desc = nlDesc(s); SKILLS[id] = s; return s; };
const nlPas = (id, job, th, en, pas, extra = {}) => nlSk(id, job, th, en, [th.slice(0, 6), en.split(' ')[0]], {type:'passive', pas, ...extra});
const nlBuf = (id, job, th, en, short, o) => nlSk(id, job, th, en, short, {type:'buff', fx:'goldshield', act:'guard', cd:30, ...o});
const nlAtk = (id, job, th, en, short, o) => nlSk(id, job, th, en, short, {anim:'attack', ...o});
const nlDeb = (id, job, th, en, short, o) => nlSk(id, job, th, en, short, {type:'debuff', anim:'cast', act:'point', cd:6, range:200, ...o});
const nlHeal = (id, job, th, en, short, o) => nlSk(id, job, th, en, short, {type:'heal', fx:'heal', act:'drink', cd:10, heal:lv => Math.round(((typeof DER !== 'undefined' && DER) ? DER.maxhp : 500) * o.healPct(lv)), ...o});

/* ======================= ไสยเวท (dark magic) ======================= */
nlPas('darklore', 'occult', 'ศาสตร์มืด', 'Dark Lore', lv => ({matkPct:lv * .03, curseAmp:lv * .02}));
nlDeb('curse', 'occult', 'คำสาปแช่ง', 'Curse', ['สาปแช่ง', 'Curse'], {fx:'curseMark', sp:lv => 14 + lv, cd:3, magic:true, st:lv => ({curse:[.04 + lv * .012, 10, .2 + lv * .04]})});
nlAtk('voodoo', 'occult', 'ตุ๊กตาสาป', 'Voodoo Doll', ['ตุ๊กตา', 'Voodoo'], {type:'fieldDot', fx:'hexField', magic:true, elem:'shadow', sp:lv => 22 + lv * 2, cd:6, cast:lv => 1 + lv * .05, range:200, radius:70, hits:() => 5, every:1, dmg:lv => .35 + lv * .07, anim:'cast', act:'seal'});
nlAtk('darkbolt', 'occult', 'ลูกไฟผี', 'Ghost Bolt', ['ไฟผี', 'Bolt'], {type:'bolt', fx:'hex', magic:true, elem:'shadow', sp:lv => 10 + lv * 2, cd:.6, cast:lv => .6 + lv * .1, range:180, hits:lv => 1 + Math.floor(lv / 3), dmg:lv => 1 + lv * .18, anim:'cast', act:'point'});
nlAtk('soulrend', 'occult', 'ฉีกวิญญาณ', 'Soul Rend', ['ฉีกวิญญาณ', 'Rend'], {type:'aoeTarget', fx:'soulRend', magic:true, elem:'shadow', sp:lv => 20 + lv * 3, cd:2, cast:lv => 1.2 + lv * .1, range:200, radius:70, dmg:lv => 1.5 + lv * .5, anim:'cast', act:'invoke'});
nlDeb('blindhex', 'occult', 'มนต์มืดบอด', 'Blinding Hex', ['มืดบอด', 'Blind'], {fx:'curseMark', sp:lv => 16 + lv, st:lv => ({blind:3 + lv * .4, slow:[.15 + lv * .015, 4]})});
nlAtk('fearspirit', 'occult', 'ผีหลอก', 'Haunting', ['ผีหลอก', 'Haunt'], {type:'aoeSelf', fx:'hauntRing', sp:lv => 24 + lv * 2, cd:12, radius:100, dmg:() => 0, st:lv => ({fear:1.5 + lv * .2}), anim:'cast', act:'shout'});
nlBuf('spiritward', 'occult', 'ยันต์กันผี', 'Spirit Ward', ['ยันต์', 'Ward'], {fx:'barrier', act:'seal', sp:() => 30, buff:lv => ({t:40, dmgRed:+(lv * .02).toFixed(2), matkPct:+(lv * .01).toFixed(2)})});
nlPas('darkpact', 'shaman', 'สัญญาอเวจี', 'Abyssal Pact', lv => ({matkPct:lv * .02, curseAmp:lv * .03, spPct:lv * .02}));
nlAtk('plaguecurse', 'shaman', 'คำสาประบาด', 'Plague Curse', ['สาประบาด', 'Plague'], {type:'aoeTarget', fx:'hexField', magic:true, elem:'shadow', sp:lv => 34 + lv * 3, cd:5, cast:() => 1.6, range:220, radius:95, hits:() => 3, every:.5, dmg:lv => .55 + lv * .1, st:lv => ({curse:[.05 + lv * .012, 10, .25 + lv * .04]}), anim:'cast', act:'invoke'});
nlAtk('lifedrain', 'shaman', 'ดูดชีวิต', 'Life Drain', ['ดูดชีวิต', 'Drain'], {type:'bolt', fx:'hex', magic:true, elem:'shadow', sp:lv => 22 + lv * 2, cd:1.5, cast:() => .8, range:200, dmg:lv => 2 + lv * .35, drain:.25, anim:'cast', act:'point'});
nlAtk('ghostfire', 'shaman', 'ไฟผีกระสือ', 'Krasue Fire', ['ไฟกระสือ', 'Krasue'], {type:'aoeTarget', fx:'ghostFire', magic:true, elem:'shadow', sp:lv => 40 + lv * 3, cd:4, cast:() => 2, range:220, radius:100, hits:() => 4, every:.3, dmg:lv => .7 + lv * .13, anim:'cast', act:'invoke'});
nlAtk('grimreap', 'shaman', 'เคียวมัจจุราช', "Reaper's Scythe", ['เคียวมัจจุ', 'Scythe'], {type:'line', fx:'reaperLine', magic:true, elem:'shadow', sp:lv => 30 + lv * 3, cd:4, cast:() => 1, len:200, width:30, dmg:lv => 3 + lv * .45, anim:'cast', act:'crossslash'});
nlPas('nightmind', 'shaman', 'จิตทมิฬ', 'Night Mind', lv => ({matkPct:lv * .02, castPct:lv * .02}));
nlAtk('sleephex', 'shaman', 'มนต์สะกดหลับ', 'Sleep Hex', ['สะกดหลับ', 'Sleep'], {type:'aoeTarget', fx:'sleepMist', magic:true, sp:lv => 30 + lv * 2, cd:14, cast:() => 1, range:220, radius:85, dmg:() => 0, st:lv => ({stop:2 + lv * .3}), anim:'cast', act:'seal'});
nlDeb('weakenhex', 'shaman', 'มนต์อ่อนแรง', 'Weakening Hex', ['อ่อนแรง', 'Weaken'], {fx:'curseMark', sp:lv => 22 + lv * 2, st:lv => ({atkDown:[.03 * lv, 12], defDown:[.03 * lv, 12]})});
nlPas('hexmastery', 'hexlord', 'ราชาแห่งคำสาป', 'King of Curses', lv => ({matkPct:lv * .03, curseAmp:lv * .04}));
nlDeb('doomcurse', 'hexlord', 'คำสาปมรณะ', 'Doom', ['สาปมรณะ', 'Doom'], {fx:'curseMark', magic:true, sp:lv => 50 + lv * 4, cd:8, cast:() => 1.2, st:lv => ({doom:[5, 6 + lv * .9], curse:[.08 + lv * .01, 6, .3]})});
nlBuf('reaperform', 'hexlord', 'ร่างมัจจุราช', 'Reaper Form', ['ร่างมัจจุ', 'Reaper'], {fx:'darkAura', act:'invoke', sp:() => 60, cd:45, buff:lv => ({t:30, matkPct:+(lv * .03).toFixed(2), castPct:+(lv * .02).toFixed(2)})});
nlAtk('abyssgate', 'hexlord', 'ประตูนรก', 'Gate of the Abyss', ['ประตูนรก', 'Abyss'], {type:'aoeTarget', fx:'abyssGate', magic:true, elem:'shadow', sig:1, sp:lv => 100 + lv * 6, cd:16, cast:() => 3.5, range:260, radius:150, hits:() => 6, every:.3, dmg:lv => .9 + lv * .14, st:() => ({fear:1.5}), anim:'cast', act:'invoke'});
nlAtk('darkstar', 'hexlord', 'ดาวมรณะ', 'Death Star', ['ดาวมรณะ', 'Star'], {type:'aoeTarget', fx:'darkStar', magic:true, elem:'shadow', sp:lv => 60 + lv * 4, cd:7, cast:() => 2, range:240, radius:80, dmg:lv => 3.5 + lv * .55, anim:'cast', act:'invoke'});
nlAtk('shadowlance', 'hexlord', 'หอกเงา', 'Shadow Lance', ['หอกเงา', 'Lance'], {type:'line', fx:'reaperLine', magic:true, elem:'shadow', sp:lv => 45 + lv * 3, cd:4, cast:() => 1.2, len:240, width:36, dmg:lv => 4 + lv * .55, anim:'cast', act:'point'});
nlAtk('masshex', 'hexlord', 'มนต์สะกดหมู่', 'Mass Hex', ['สะกดหมู่', 'Mass Hex'], {type:'aoeSelf', fx:'hauntRing', magic:true, sp:lv => 50 + lv * 3, cd:16, radius:150, dmg:() => 0, st:lv => ({fear:2 + lv * .15, blind:4 + lv * .3}), anim:'cast', act:'shout'});
nlAtk('soulcage', 'hexlord', 'กรงวิญญาณ', 'Soul Cage', ['กรงวิญญาณ', 'Cage'], {type:'aoeTarget', fx:'soulCage', magic:true, elem:'shadow', sp:lv => 45 + lv * 3, cd:12, cast:() => 1, range:220, radius:90, dmg:lv => 1 + lv * .2, st:lv => ({root:2.5 + lv * .2, curse:[.06 + lv * .01, 8, .2]}), anim:'cast', act:'seal'});

/* ======================= พ่อค้า (axe and money) ======================= */
nlPas('axemastery', 'merchant', 'ชำนาญขวาน', 'Axe Mastery', lv => ({atkPct:lv * .02, crit:lv * .5}));
nlAtk('cleavestrike', 'merchant', 'จามขวาน', 'Cleaving Chop', ['จามขวาน', 'Chop'], {type:'melee', fx:'slash', act:'slam', sp:lv => 8 + lv, cd:.8, dmg:lv => 1.6 + lv * .3, st:lv => ({defDown:[lv * .015, 5]})});
nlAtk('axewhirl', 'merchant', 'ขวานพายุ', 'Axe Whirl', ['ขวานพายุ', 'Whirl'], {type:'aoeSelf', fx:'bladestorm', act:'whirl', sp:lv => 14 + lv * 2, cd:3, radius:70, hits:() => 2, every:.2, dmg:lv => .9 + lv * .15});
nlAtk('coinbash', 'merchant', 'ทุ่มเหรียญ', 'Coin Bash', ['ทุ่มเหรียญ', 'Coin Bash'], {type:'melee', fx:'coinBurst', act:'slam', sp:lv => 6 + lv, cd:1, dmg:lv => 2.2 + lv * .5, bia:lv => 30 + lv * 20});
nlAtk('coinvolley', 'merchant', 'โปรยเหรียญ', 'Coin Volley', ['โปรยเหรียญ', 'Coins'], {type:'bolt', fx:'coin', act:'throw', sp:lv => 10 + lv, cd:1.2, range:170, hits:() => 3, dmg:lv => .55 + lv * .12, bia:lv => 10 + lv * 6});
nlPas('haggle', 'merchant', 'ต่อราคา', 'Haggle', lv => ({biaPct:lv * .02, critRes:lv}));
nlPas('cartguard', 'merchant', 'เกวียนคุ้มกัน', 'Cart Guard', lv => ({def:lv * 2, hpPct:lv * .02}));
nlBuf('merchantcry', 'merchant', 'ตะโกนขายของ', 'Market Cry', ['ตะโกนขาย', 'Cry'], {fx:'ramwai', act:'shout', sp:() => 25, cd:40, team:1, buff:lv => ({t:40, atkPct:+(lv * .015).toFixed(3), crit:+(lv * .5).toFixed(1)})});
nlPas('bigaxe', 'tradelord', 'ขวานใหญ่', 'Great Axe', lv => ({atkPct:lv * .025, critDmg:lv * .02}));
nlAtk('axestorm', 'tradelord', 'พายุขวาน', 'Axe Storm', ['พายุขวาน', 'Storm'], {type:'aoeSelf', fx:'bladestorm', act:'whirl', sp:lv => 26 + lv * 2, cd:4, radius:100, hits:() => 4, every:.18, dmg:lv => .8 + lv * .12});
nlAtk('goldrush', 'tradelord', 'ถล่มทอง', 'Gold Rush', ['ถล่มทอง', 'Gold Rush'], {type:'melee', fx:'coinBurst', act:'slam', sp:lv => 16 + lv * 2, cd:2.5, dmg:lv => 4 + lv * .65, bia:lv => 100 + lv * 60});
nlAtk('cartcrash', 'tradelord', 'เข็นเกวียนทลาย', 'Cart Crash', ['เกวียนทลาย', 'Cart'], {type:'line', fx:'earthsplit', act:'heave', sp:lv => 24 + lv * 2, cd:4, len:180, width:34, dmg:lv => 2.5 + lv * .4, knock:30});
nlAtk('debtcollect', 'tradelord', 'ทวงหนี้', 'Debt Collector', ['ทวงหนี้', 'Collect'], {type:'dash', fx:'charge', act:'lunge', sp:lv => 20 + lv * 2, cd:5, range:150, dmg:lv => 2 + lv * .35, stun:() => 1});
nlBuf('tradewind', 'tradelord', 'ลมการค้า', 'Trade Winds', ['ลมการค้า', 'Winds'], {fx:'ramwai', act:'shout', sp:() => 35, cd:45, team:1, buff:lv => ({t:40, aspdPct:+(lv * .02).toFixed(2), flee:lv * 3})});
nlPas('appraisal', 'tradelord', 'ตาทองประเมินค่า', 'Golden Eye', lv => ({crit:lv, biaPct:lv * .02}));
nlBuf('moneywall', 'tradelord', 'กำแพงเงิน', 'Wall of Money', ['กำแพงเงิน', 'Money Wall'], {fx:'goldshield', sp:() => 30, cd:40, bia:lv => 200 + lv * 80, buff:lv => ({t:25, def:lv * 5, dmgRed:+(lv * .025).toFixed(3)})});
nlPas('tycoonaxe', 'tycoon', 'ขวานเศรษฐี', "Tycoon's Axe", lv => ({atkPct:lv * .03, crit:lv}));
nlAtk('goldenarc', 'tycoon', 'วงขวานทอง', 'Golden Arc', ['วงขวานทอง', 'Arc'], {type:'aoeSelf', fx:'bladestorm', act:'whirl', sp:lv => 40 + lv * 3, cd:4, radius:120, hits:() => 3, every:.2, dmg:lv => 1.6 + lv * .25});
nlAtk('midasstrike', 'tycoon', 'หัตถ์ไมดาส', 'Midas Strike', ['ไมดาส', 'Midas'], {type:'melee', fx:'coinBurst', act:'slam', sig:1, sp:lv => 50 + lv * 4, cd:8, dmg:lv => 9 + lv * 1.2, st:() => ({stun:1.2}), bia:lv => 500 + lv * 250});
nlAtk('coinstorm', 'tycoon', 'พายุเงินทอง', 'Storm of Gold', ['พายุทอง', 'Gold Storm'], {type:'aoeTarget', fx:'coinStorm', act:'throw', sp:lv => 45 + lv * 3, cd:5, range:220, radius:130, hits:() => 5, every:.25, dmg:lv => .9 + lv * .14, bia:lv => 150 + lv * 60});
nlAtk('goldshower', 'tycoon', 'ห่าเหรียญทอง', 'Gold Shower', ['ห่าเหรียญ', 'Shower'], {type:'bolt', fx:'coin', act:'throw', sp:lv => 30 + lv * 2, cd:1.5, range:190, hits:() => 5, dmg:lv => .75 + lv * .1, bia:lv => 60 + lv * 30});
nlBuf('grandmarket', 'tycoon', 'ตลาดนัดใหญ่', 'Grand Market', ['ตลาดใหญ่', 'Market'], {fx:'ramwai', act:'shout', sp:() => 55, cd:50, team:1, buff:lv => ({t:45, atkPct:+(lv * .02).toFixed(2), matkPct:+(lv * .02).toFixed(2), dmgRed:+(lv * .01).toFixed(2)})});
nlBuf('goldbody', 'tycoon', 'กายทองคำ', 'Body of Gold', ['กายทอง', 'Gold Body'], {fx:'goldshield', sp:() => 45, cd:40, buff:lv => ({t:20, dmgRed:+(lv * .03).toFixed(2), reflect:+(lv * .01).toFixed(2)})});
nlPas('wealthaura', 'tycoon', 'บารมีเศรษฐี', 'Aura of Wealth', lv => ({biaPct:lv * .03, hpPct:lv * .02, critRes:lv}));

/* ======================= เผ่าแมว (cat folk) ======================= */
nlPas('catreflex', 'catfolk', 'ประสาทแมว', 'Cat Reflexes', lv => ({flee:lv * 2, crit:lv * .5, fistAtk:lv * 2}));
nlAtk('scratch', 'catfolk', 'ข่วนรัว', 'Scratch Flurry', ['ข่วนรัว', 'Scratch'], {type:'melee', fx:'clawRake', act:'rake', sp:lv => 8 + lv, cd:.8, hits:() => 4, every:.07, dmg:lv => .45 + lv * .08});
nlAtk('pounce', 'catfolk', 'กระโจนตะครุบ', 'Pounce', ['ตะครุบ', 'Pounce'], {type:'dash', fx:'charge', act:'pounce', sp:lv => 12 + lv, cd:3, range:150, dmg:lv => 1.8 + lv * .3, stun:() => .5});
nlAtk('tailwhip', 'catfolk', 'ฟาดหาง', 'Tail Whip', ['ฟาดหาง', 'Tail'], {type:'aoeSelf', fx:'clawRing', act:'spinkick', sp:lv => 14 + lv, cd:3, radius:60, dmg:lv => 1.2 + lv * .2, knock:20});
nlAtk('meow', 'catfolk', 'เหมียวอ้อน', 'Pleading Meow', ['เหมียว', 'Meow'], {type:'aoeSelf', fx:'heartRing', act:'wai', sp:lv => 18 + lv, cd:12, radius:100, dmg:() => 0, st:lv => ({charm:1.5 + lv * .2, atkDown:[lv * .03, 8]})});
nlHeal('catnap', 'catfolk', 'งีบแมว', 'Cat Nap', ['งีบแมว', 'Nap'], {act:'crouch', sp:lv => 14 + lv, healPct:lv => .06 + lv * .012});
nlPas('ninelives', 'catfolk', 'เก้าชีวิต', 'Nine Lives', lv => ({hpPct:lv * .02, dodge:lv * .006}));
nlBuf('purr', 'catfolk', 'ครางคู', 'Purr', ['ครางคู', 'Purr'], {fx:'ramwai', act:'wai', sp:() => 22, cd:35, team:1, buff:lv => ({t:30, flee:lv * 3, aspdPct:+(lv * .015).toFixed(3)})});
nlPas('wildclaws', 'lynx', 'กรงเล็บแมวป่า', 'Wildcat Claws', lv => ({fistAtk:lv * 4, crit:lv, critDmg:lv * .02}));
nlAtk('furyswipe', 'lynx', 'ข่วนคลั่ง', 'Fury Swipes', ['ข่วนคลั่ง', 'Fury'], {type:'melee', fx:'clawRake', act:'rake', sp:lv => 20 + lv * 2, cd:2, hits:() => 6, every:.07, dmg:lv => .5 + lv * .07});
nlAtk('moonpounce', 'lynx', 'กระโจนจันทร์', 'Moon Pounce', ['จันทร์', 'Moon'], {type:'dash', fx:'charge', act:'pounce', sp:lv => 24 + lv * 2, cd:4, range:170, dmg:lv => 3 + lv * .45, stun:() => .8});
nlAtk('catcyclone', 'lynx', 'แมวหมุนพายุ', 'Cat Cyclone', ['แมวพายุ', 'Cyclone'], {type:'aoeSelf', fx:'clawRing', act:'whirl', sp:lv => 28 + lv * 2, cd:4, radius:100, hits:() => 5, every:.14, dmg:lv => .5 + lv * .08});
nlAtk('shadowpaw', 'lynx', 'อุ้งเท้าเงา', 'Shadow Paw', ['อุ้งเงา', 'Paw'], {type:'line', fx:'pawLine', act:'rake', sp:lv => 22 + lv * 2, cd:3, len:160, width:30, dmg:lv => 2.4 + lv * .35});
nlAtk('cuteface', 'lynx', 'หน้ามุ้งมิ้ง', 'Puppy-Eyes Kitty', ['มุ้งมิ้ง', 'Cute'], {type:'aoeSelf', fx:'heartRing', act:'wai', sp:lv => 30 + lv * 2, cd:14, radius:130, dmg:() => 0, st:lv => ({charm:1.5 + lv * .15, atkDown:[lv * .03, 10]})});
nlBuf('catwalk', 'lynx', 'ย่างแมว', 'Catwalk', ['ย่างแมว', 'Catwalk'], {fx:'ramwai', act:'wai', sp:() => 30, cd:40, buff:lv => ({t:30, flee:lv * 4, aspdPct:+(lv * .02).toFixed(2)})});
nlPas('luckycat', 'lynx', 'แมวกวักนำโชค', 'Lucky Cat', lv => ({crit:lv, biaPct:lv * .02, critRes:lv}));
nlPas('royalclaws', 'catqueen', 'กรงเล็บราชินี', 'Royal Claws', lv => ({atkPct:lv * .03, crit:lv * 1.5}));
nlAtk('thousandscratch', 'catqueen', 'พันรอยข่วน', 'Thousand Scratches', ['พันข่วน', 'Thousand'], {type:'melee', fx:'clawRake', act:'rake', sp:lv => 34 + lv * 3, cd:3, hits:() => 10, every:.06, dmg:lv => .45 + lv * .06});
nlBuf('hunterinstinct', 'catqueen', 'สัญชาตญาณนักล่า', "Hunter's Instinct", ['นักล่า', 'Instinct'], {fx:'ramwai', act:'crouch', sp:() => 40, cd:40, buff:lv => ({t:20, aspdPct:+(lv * .02).toFixed(2), crit:lv})});
nlAtk('starpounce', 'catqueen', 'กระโจนดาวตก', 'Shooting Star Pounce', ['ดาวตก', 'Star'], {type:'aoeTarget', fx:'starPounce', act:'pounce', sig:1, sp:lv => 60 + lv * 4, cd:10, range:200, radius:110, dmg:lv => 6 + lv * .8, st:() => ({stun:1})});
nlAtk('comettail', 'catqueen', 'หางดาวหาง', 'Comet Tail', ['ดาวหาง', 'Comet'], {type:'line', fx:'pawLine', act:'spinkick', sp:lv => 40 + lv * 3, cd:4, len:220, width:34, dmg:lv => 3.5 + lv * .5});
nlAtk('royalcharm', 'catqueen', 'มนต์เสน่ห์ราชินี', 'Royal Charm', ['เสน่ห์', 'Charm'], {type:'aoeSelf', fx:'heartRing', act:'wai', sp:lv => 45 + lv * 3, cd:16, radius:160, dmg:() => 0, st:lv => ({charm:2 + lv * .2, atkDown:[lv * .04, 12]})});
nlBuf('catblessing', 'catqueen', 'พรแมวมงคล', 'Blessing of the Lucky Cat', ['พรแมว', 'Blessing'], {fx:'ramwai', act:'wai', sp:() => 50, cd:50, team:1, buff:lv => ({t:40, crit:lv, flee:lv * 3, atkPct:+(lv * .015).toFixed(3)})});
nlPas('ninthlife', 'catqueen', 'ชีวิตที่เก้า', 'The Ninth Life', lv => ({dodge:lv * .008, hpPct:lv * .03, lastStand:lv >= 10 ? .3 : 0}));

/* ======================= เผ่าหมา (dog folk) ======================= */
nlPas('loyalheart', 'dogfolk', 'ใจภักดี', 'Loyal Heart', lv => ({hpPct:lv * .03, def:lv * 2}));
nlAtk('guardbark', 'dogfolk', 'เห่าขู่', 'Warning Bark', ['เห่าขู่', 'Bark'], {type:'aoeSelf', fx:'barkRing', act:'shout', sp:lv => 12 + lv, cd:6, radius:110, dmg:lv => .5 + lv * .1, st:lv => ({taunt:1, atkDown:[lv * .02, 6]})});
nlBuf('shieldwall', 'dogfolk', 'ยืนเฝ้า', 'Stand Guard', ['ยืนเฝ้า', 'Guard'], {fx:'goldshield', act:'guard', sp:() => 22, cd:30, buff:lv => ({t:25, def:lv * 5, dmgRed:+(lv * .015).toFixed(3)})});
nlAtk('bite', 'dogfolk', 'งับ', 'Bite', ['งับ', 'Bite'], {type:'melee', fx:'biteSnap', act:'lunge', sp:lv => 8 + lv, cd:.8, dmg:lv => 1.8 + lv * .3, st:lv => ({defDown:[lv * .02, 6]})});
nlAtk('tackle', 'dogfolk', 'พุ่งชน', 'Tackle', ['พุ่งชน', 'Tackle'], {type:'dash', fx:'charge', act:'lunge', sp:lv => 12 + lv, cd:3, range:150, dmg:lv => 1.6 + lv * .28, stun:() => .6});
nlBuf('howl', 'dogfolk', 'หอนเรียกฝูง', 'Pack Howl', ['หอน', 'Howl'], {fx:'barkRing', act:'shout', sp:() => 25, cd:40, team:1, buff:lv => ({t:40, atkPct:+(lv * .015).toFixed(3), def:lv * 2})});
nlPas('keennose', 'dogfolk', 'จมูกไว', 'Keen Nose', lv => ({crit:lv * .5, critRes:lv, flee:lv}));
nlHeal('wagtail', 'dogfolk', 'กระดิกหาง', 'Wagging Tail', ['กระดิกหาง', 'Wag'], {act:'wai', sp:lv => 14 + lv, healPct:lv => .05 + lv * .01});
nlPas('guardianpaw', 'houndknight', 'อุ้งเท้าผู้พิทักษ์', 'Guardian Paw', lv => ({dmgRed:lv * .015, shieldBlock:lv, critRes:lv}));
nlBuf('ironfur', 'houndknight', 'ขนเหล็ก', 'Iron Fur', ['ขนเหล็ก', 'Iron Fur'], {fx:'goldshield', act:'guard', sp:() => 35, cd:35, buff:lv => ({t:30, def:lv * 8, reflect:+(lv * .01).toFixed(2)})});
nlAtk('crunch', 'houndknight', 'งับกระดูก', 'Bone Crunch', ['งับกระดูก', 'Crunch'], {type:'melee', fx:'biteSnap', act:'lunge', sp:lv => 18 + lv * 2, cd:2, hits:() => 2, every:.15, dmg:lv => 1.8 + lv * .25, st:() => ({stun:.4})});
nlAtk('houndrush', 'houndknight', 'ฝูงพุ่ง', 'Hound Rush', ['ฝูงพุ่ง', 'Rush'], {type:'line', fx:'earthsplit', act:'lunge', sp:lv => 24 + lv * 2, cd:4, len:200, width:30, dmg:lv => 2.5 + lv * .35, knock:25});
nlAtk('fangspin', 'houndknight', 'หมุนเขี้ยว', 'Fang Spin', ['หมุนเขี้ยว', 'Spin'], {type:'aoeSelf', fx:'bladestorm', act:'whirl', sp:lv => 24 + lv * 2, cd:4, radius:90, hits:() => 3, every:.18, dmg:lv => .8 + lv * .12});
nlBuf('packhowl', 'houndknight', 'หอนรวมพล', 'Rallying Howl', ['รวมพล', 'Rally'], {fx:'barkRing', act:'shout', sp:() => 40, cd:45, team:1, buff:lv => ({t:40, atkPct:+(lv * .02).toFixed(2), aspdPct:+(lv * .015).toFixed(3)})});
nlHeal('loyalvow', 'houndknight', 'คำสัตย์ภักดี', 'Vow of Loyalty', ['สัตย์ภักดี', 'Vow'], {act:'wai', sp:lv => 24 + lv * 2, healPct:lv => .08 + lv * .012});
nlDeb('sniffout', 'houndknight', 'ดมกลิ่นจุดอ่อน', 'Sniff Out', ['ดมกลิ่น', 'Sniff'], {fx:'curseMark', sp:lv => 16 + lv, st:lv => ({defDown:[lv * .03, 12]})});
nlPas('bangkaewblood', 'bangkaew', 'สายเลือดบางแก้ว', 'Bangkaew Blood', lv => ({hpPct:lv * .04, dmgRed:lv * .015, def:lv * 3}));
nlBuf('stalwart', 'bangkaew', 'ยืนหยัดไม่ถอย', 'Stalwart', ['ยืนหยัด', 'Stalwart'], {fx:'goldshield', act:'guard', sp:() => 50, cd:45, team:1, buff:lv => ({t:30, dmgRed:+(lv * .02).toFixed(2), def:lv * 6})});
nlAtk('kingfang', 'bangkaew', 'เขี้ยวราชันย์', 'Fang of the King', ['เขี้ยวราชา', 'King Fang'], {type:'melee', fx:'biteSnap', act:'lunge', sig:1, sp:lv => 50 + lv * 4, cd:9, dmg:lv => 8 + lv * 1, st:() => ({stun:1.5})});
nlAtk('wolfstorm', 'bangkaew', 'พายุหมาป่า', 'Wolf Storm', ['พายุหมาป่า', 'Wolves'], {type:'aoeSelf', fx:'bladestorm', act:'whirl', sp:lv => 40 + lv * 3, cd:5, radius:130, hits:() => 4, every:.18, dmg:lv => 1 + lv * .15});
nlAtk('shieldcharge', 'bangkaew', 'กระแทกโล่', 'Shield Charge', ['กระแทกโล่', 'Charge'], {type:'dash', fx:'charge', act:'guard', sp:lv => 35 + lv * 3, cd:5, range:170, dmg:lv => 3 + lv * .45, stun:() => 1});
nlAtk('lunarhowl', 'bangkaew', 'หอนจันทร์เพ็ญ', 'Full Moon Howl', ['จันทร์เพ็ญ', 'Moon Howl'], {type:'aoeSelf', fx:'barkRing', act:'shout', sp:lv => 40 + lv * 3, cd:12, radius:170, dmg:lv => .6 + lv * .1, st:lv => ({taunt:1, atkDown:[lv * .03, 10]})});
nlPas('packleader', 'bangkaew', 'จ่าฝูง', 'Leader of the Pack', lv => ({atkPct:lv * .02, critRes:lv, hpPct:lv * .02}));
nlHeal('guardianangel', 'bangkaew', 'เทวดาเฝ้าเจ้านาย', 'Guardian Angel', ['เทวดาเฝ้า', 'Angel'], {act:'wai', sp:lv => 40 + lv * 3, cd:15, healPct:lv => .1 + lv * .015});

/* ======================= นินจา ======================= */
nlPas('shinobiway', 'ninja', 'วิถีนินจา', 'Way of the Shinobi', lv => ({daggerAtk:lv * 3, crit:lv * .5, flee:lv}));
nlAtk('quickslash', 'ninja', 'ฟันฉับ', 'Quick Slash', ['ฟันฉับ', 'Slash'], {type:'melee', fx:'slash', act:'crossslash', sp:lv => 8 + lv, cd:.7, hits:() => 2, every:.1, dmg:lv => 1 + lv * .18});
nlAtk('ninjadash', 'ninja', 'ก้าวเงาฟัน', 'Shadow Step Slash', ['ก้าวเงา', 'Step'], {type:'dash', fx:'shadowBlink', act:'lunge', sp:lv => 12 + lv, cd:3, range:160, dmg:lv => 1.6 + lv * .28});
nlAtk('katon', 'ninja', 'คาถาไฟ ลูกไฟ', 'Fire Release: Fireball', ['คาถาไฟ', 'Katon'], {type:'aoeTarget', fx:'katon', act:'seal', elem:'fire', sp:lv => 16 + lv * 2, cd:2.5, range:200, radius:60, dmg:lv => 1.4 + lv * .4});
nlAtk('suiton', 'ninja', 'คาถาน้ำ กระสุนน้ำ', 'Water Release: Water Shot', ['คาถาน้ำ', 'Suiton'], {type:'bolt', fx:'ice', act:'seal', elem:'water', sp:lv => 12 + lv, cd:1.5, range:180, dmg:lv => 1.2 + lv * .3, freeze:lv => [.1 + lv * .02, 1.5]});
nlAtk('kunaithrow', 'ninja', 'ปาคุไน', 'Kunai Throw', ['ปาคุไน', 'Kunai'], {type:'bolt', fx:'kunai', act:'throw', sp:lv => 8 + lv, cd:.8, range:170, hits:lv => 1 + Math.floor(lv / 3), dmg:lv => .7 + lv * .12});
nlBuf('smokescreen', 'ninja', 'ระเบิดควัน', 'Smoke Bomb', ['ระเบิดควัน', 'Smoke'], {fx:'smokeBomb', act:'crouch', sp:() => 20, cd:25, buff:lv => ({t:3 + lv * .3, stealth:1, flee:lv * 3, sureCrit:1})});
nlSk('kawarimi', 'ninja', 'คาถาสลับร่าง', 'Substitution', ['สลับร่าง', 'Kawarimi'], {type:'backstep', fx:'smokeBomb', act:'crouch', sp:lv => 10 + lv, cd:5, dist:lv => 60 + lv * 5});
nlPas('bladeart', 'shinobi', 'วิชาดาบเงา', 'Shadow Blade Art', lv => ({atkPct:lv * .02, crit:lv, critDmg:lv * .02}));
nlAtk('iai', 'shinobi', 'ชักดาบสายฟ้า', 'Lightning Draw', ['ชักดาบ', 'Iai'], {type:'melee', fx:'slash', act:'crossslash', sp:lv => 20 + lv * 2, cd:2.5, dmg:lv => 3.2 + lv * .45});
nlAtk('fuuton', 'shinobi', 'คาถาลม ใบมีดลม', 'Wind Release: Wind Blade', ['คาถาลม', 'Fuuton'], {type:'line', fx:'windBlade', act:'seal', elem:'wind', sp:lv => 22 + lv * 2, cd:3, len:200, width:30, dmg:lv => 2.2 + lv * .35});
nlAtk('raiton', 'shinobi', 'คาถาสายฟ้า', 'Lightning Release', ['สายฟ้า', 'Raiton'], {type:'aoeTarget', fx:'thunder', act:'seal', elem:'wind', sp:lv => 26 + lv * 2, cd:3, range:200, radius:80, hits:() => 2, every:.25, dmg:lv => 1.8 + lv * .3, st:() => ({shock:1.5})});
nlAtk('dragonflame', 'shinobi', 'คาถาไฟ มังกรเพลิง', 'Fire Release: Dragon Flame', ['มังกรเพลิง', 'Dragon'], {type:'line', fx:'fireLine', act:'seal', elem:'fire', sp:lv => 28 + lv * 2, cd:4, len:220, width:34, dmg:lv => 2.6 + lv * .4});
nlBuf('shadowclone', 'shinobi', 'แยกเงาพราง', 'Shadow Clones', ['แยกเงา', 'Clones'], {fx:'shadowBlink', act:'seal', sp:() => 35, cd:35, buff:lv => ({t:20, flee:lv * 4, crit:lv})});
nlAtk('shurikenstorm', 'shinobi', 'พายุดาวกระจาย', 'Shuriken Storm', ['ดาวกระจาย', 'Shuriken'], {type:'aoeTarget', fx:'shurikenRain', act:'throw', sp:lv => 24 + lv * 2, cd:3, range:200, radius:90, hits:() => 4, every:.15, dmg:lv => .5 + lv * .08});
nlDeb('poisonkunai', 'shinobi', 'คุไนอาบพิษ', 'Poisoned Kunai', ['คุไนพิษ', 'Venom'], {fx:'poison', act:'throw', anim:'attack', sp:lv => 14 + lv, cd:4, st:lv => ({poison:[.25 + lv * .04, 8], slow:[.1 + lv * .02, 5]})});
nlPas('kagemastery', 'kage', 'วิถีคาเงะ', 'Way of the Kage', lv => ({atkPct:lv * .03, crit:lv, critDmg:lv * .03}));
nlAtk('shadowflash', 'kage', 'ประกายเงาพันดาบ', 'Thousand Shadow Flash', ['พันดาบ', 'Flash'], {type:'melee', fx:'slash', act:'crossslash', sp:lv => 40 + lv * 3, cd:3, hits:() => 8, every:.06, dmg:lv => .55 + lv * .07});
nlAtk('blinkstrike', 'kage', 'ก้าวพริบตา', 'Blink Strike', ['พริบตา', 'Blink'], {type:'dash', fx:'shadowBlink', act:'lunge', sp:lv => 30 + lv * 3, cd:4, range:200, dmg:lv => 3 + lv * .4, stun:() => .6});
nlAtk('kirin', 'kage', 'คาถาสายฟ้า กิเลน', 'Lightning Release: Kirin', ['กิเลน', 'Kirin'], {type:'aoeTarget', fx:'kirin', act:'seal', elem:'wind', sig:1, sp:lv => 70 + lv * 5, cd:12, cast:() => 1.5, range:240, radius:140, dmg:lv => 7 + lv * .9, st:() => ({shock:2})});
nlAtk('waterdragon', 'kage', 'คาถาน้ำ มังกรวารี', 'Water Release: Water Dragon', ['มังกรวารี', 'Water Dragon'], {type:'line', fx:'waterLine', act:'seal', elem:'water', sp:lv => 45 + lv * 3, cd:5, len:240, width:40, dmg:lv => 3.2 + lv * .45, st:lv => ({slow:[.2 + lv * .02, 5]})});
nlBuf('thousandshadows', 'kage', 'พันเงาพราง', 'Thousand Shadows', ['พันเงา', 'Shadows'], {fx:'shadowBlink', act:'seal', sp:() => 50, cd:40, buff:lv => ({t:20, flee:lv * 5, dmgRed:+(lv * .015).toFixed(3), crit:lv})});
nlAtk('kunairain', 'kage', 'ฝนคุไน', 'Kunai Rain', ['ฝนคุไน', 'Kunai Rain'], {type:'aoeTarget', fx:'kunaiRain', act:'throw', sp:lv => 40 + lv * 3, cd:4, range:220, radius:120, hits:() => 6, every:.12, dmg:lv => .5 + lv * .07});
nlPas('silentkill', 'kage', 'สังหารเงียบ', 'Silent Killing', lv => ({crit:lv, critDmg:lv * .03, flee:lv * 2}));

/* ---------- the eight a tier and the style of each ---------- */
Object.assign(SK8, {
  occult:{a:['darklore', 'curse', 'voodoo'], b:['darkbolt', 'soulrend'], c:['blindhex', 'fearspirit', 'spiritward']},
  shaman:{a:['darkpact', 'plaguecurse', 'lifedrain'], b:['ghostfire', 'grimreap', 'nightmind'], c:['sleephex', 'weakenhex']},
  hexlord:{a:['hexmastery', 'doomcurse', 'reaperform'], b:['abyssgate', 'darkstar', 'shadowlance'], c:['masshex', 'soulcage']},
  merchant:{a:['axemastery', 'cleavestrike', 'axewhirl'], b:['coinbash', 'coinvolley'], c:['haggle', 'cartguard', 'merchantcry']},
  tradelord:{a:['bigaxe', 'axestorm'], b:['goldrush', 'cartcrash', 'debtcollect'], c:['tradewind', 'appraisal', 'moneywall']},
  tycoon:{a:['tycoonaxe', 'goldenarc'], b:['midasstrike', 'coinstorm', 'goldshower'], c:['grandmarket', 'goldbody', 'wealthaura']},
  catfolk:{a:['catreflex', 'scratch'], b:['pounce', 'tailwhip'], c:['meow', 'catnap', 'ninelives', 'purr']},
  lynx:{a:['wildclaws', 'furyswipe'], b:['moonpounce', 'catcyclone', 'shadowpaw'], c:['cuteface', 'catwalk', 'luckycat']},
  catqueen:{a:['royalclaws', 'thousandscratch', 'hunterinstinct'], b:['starpounce', 'comettail'], c:['royalcharm', 'catblessing', 'ninthlife']},
  dogfolk:{a:['loyalheart', 'guardbark', 'shieldwall'], b:['bite', 'tackle'], c:['howl', 'keennose', 'wagtail']},
  houndknight:{a:['guardianpaw', 'ironfur'], b:['crunch', 'houndrush', 'fangspin'], c:['packhowl', 'loyalvow', 'sniffout']},
  bangkaew:{a:['bangkaewblood', 'stalwart'], b:['kingfang', 'wolfstorm', 'shieldcharge'], c:['lunarhowl', 'packleader', 'guardianangel']},
  ninja:{a:['shinobiway', 'quickslash', 'ninjadash'], b:['katon', 'suiton'], c:['kunaithrow', 'smokescreen', 'kawarimi']},
  shinobi:{a:['bladeart', 'iai'], b:['fuuton', 'raiton', 'dragonflame'], c:['shadowclone', 'shurikenstorm', 'poisonkunai']},
  kage:{a:['kagemastery', 'shadowflash', 'blinkstrike'], b:['kirin', 'waterdragon'], c:['thousandshadows', 'kunairain', 'silentkill']}
});
Object.assign(SK8_PATH, {
  occult:{a:['สาปแช่ง', 'Curses', '#8a5ad8'], b:['เวทมืด', 'Dark spells', '#e2574c'], c:['สะกด', 'Hexes', '#3aa86a']},
  merchant:{a:['ขวานศึก', 'Axe work', '#e8a23a'], b:['ทุ่มทุน', 'Money power', '#e2574c'], c:['ค้าขาย', 'Trade & guard', '#d8a02a']},
  catfolk:{a:['ข่วนรัว', 'Scratching', '#e8a23a'], b:['กระโจน', 'Pounces', '#e2574c'], c:['ออดอ้อน', 'Charm & lives', '#d86aa8']},
  dogfolk:{a:['ผู้พิทักษ์', 'Guardian', '#4a8ad8'], b:['เขี้ยวเล็บ', 'Fangs', '#e2574c'], c:['ฝูงหมา', 'The pack', '#3aa86a']},
  ninja:{a:['ดาบนินจา', 'Blade', '#e8a23a'], b:['นินจุตสึ', 'Ninjutsu', '#e2574c'], c:['ลับลวงพราง', 'Stealth & throws', '#6a7ad8']}
});
for (const j of Object.keys(NL_JOBS)) SK8_LINE[j] = NL_LINE_OF[j];
for (const job of Object.keys(NL_JOBS)){ const P0 = SK8[job], list = [...P0.a, ...P0.b, ...P0.c];
  JOBS[job].skills = list;
  for (const id of list){ SKILLS[id].job = job; SK8_OF[id] = P0.a.includes(id) ? 'a' : P0.b.includes(id) ? 'b' : 'c'; }
  // each style is learned in order: a skill asks for the one before it in its style (Lv 3; a signature asks for Lv 5)
  for (const st of ['a', 'b', 'c']){ const l = P0[st]; for (let i = 1; i < l.length; i++) SKILLS[l[i]].req = {[l[i - 1]]:SKILLS[l[i]].sig ? 5 : 3}; } }
if (typeof CS_LINES !== 'undefined') for (const l of NL_LINES) if (!CS_LINES.includes(l)) CS_LINES.push(l);
if (typeof AB !== 'undefined') for (const id of ['merchantcry', 'tradewind', 'grandmarket', 'purr', 'catblessing', 'howl', 'packhowl', 'stalwart']) if (!AB.buff.includes(id)) AB.buff.push(id);
