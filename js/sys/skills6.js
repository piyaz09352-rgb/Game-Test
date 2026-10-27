/* VAYRATHEN — js/sys/skills6.js — (v76) every class gets the same shape of skills, per tier:
   4 active skills (กดใช้) · 1 buff (บัพ) · 1 passive (พาสซีฟ). Villager (novice) keeps its own three.
   Each skill carries `kind` ('active' | 'buff' | 'passive') so the skill window shows it plainly.
   · melee lines get a charge to reach far attackers; ranged and caster lines get something to protect themselves
   · two passives that overlapped were folded into one (their bonuses add up) and the freed skill points come back once
   · new effects: flee buff, invulnerability, auto-revive, damage shared with summons, no cast interruption,
     repel melee attackers, finish low-HP targets, sacrifice summons for a big blast.
   Loaded after classlines.js and rogue2.js, so its job lists are the final word. */
'use strict';

const S6X = {t:null, n:0};
const s6merge = (a, b) => { const pa = SKILLS[a].pas, pb = SKILLS[b].pas, da = SKILLS[a].desc, db = SKILLS[b].desc;
  SKILLS[a].pas = lv => { const o = {...pa(lv)}; for (const [k, v] of Object.entries(pb(lv))) o[k] = (o[k] || 0) + v; return o; };
  SKILLS[a].desc = lv => `${da(lv)} · ${db(lv)}`; };
const s6beasts = () => (typeof SUMMONS === 'undefined' ? [] : SUMMONS.filter(s => s.kind === 'beast' && s.beast !== 'bound' && !s.dead));

/* ---------- new skills ---------- */
Object.assign(SKILLS, {
  /* tier 2 */
  warcry:{job:'blade', name:'ปลุกใจนักรบ', en:'War Cry', short:'ปลุกใจ', shortEn:'War Cry', max:10, type:'buff', sp:() => 25, cd:60, fx:'roar', anim:'skill', act:'shout', req:{swordmastery:1},
    buff:lv => ({t:60, atkPct:+(lv * .015).toFixed(3), regenPct:.01, every:3}), desc:lv => L(`60 วิ · ATK +${+(lv * 1.5).toFixed(1)}% · ฟื้น HP 1% ทุก 3 วิ`, `60s · ATK +${+(lv * 1.5).toFixed(1)}% · regain 1% HP every 3s`)},
  hunterfocus:{job:'ranger', name:'สมาธิพราน', en:"Hunter's Focus", short:'สมาธิพราน', shortEn:'Focus', max:10, type:'buff', sp:() => 25, cd:60, fx:'ramwai', anim:'skill', act:'aimup', req:{hawkeye:1},
    buff:lv => ({t:60, aspdPct:+(lv * .015).toFixed(3), crit:lv}), desc:lv => L(`60 วิ · ตีเร็วขึ้น ${+(lv * 1.5).toFixed(1)}% · CRIT +${lv}%`, `60s · attacks ${+(lv * 1.5).toFixed(1)}% faster · CRIT +${lv}%`)},
  elbowback:{job:'muay', name:'ศอกกลับ', en:'Spinning Elbow', short:'ศอกกลับ', shortEn:'Elbow', max:10, type:'melee', sp:lv => 8 + lv, cd:4, fx:'punch', anim:'attack', act:'uppercut', req:{combo:1},
    dmg:lv => 1.8 + lv * .22, stun:lv => .4 + lv * .04, desc:lv => L(`ศอกกลับหมุนตัว ${pct(1.8 + lv * .22)} ATK · มึน ${+(.4 + lv * .04).toFixed(2)} วิ`, `Spinning back elbow ${pct(1.8 + lv * .22)} ATK · stun ${+(.4 + lv * .04).toFixed(2)}s`)},
  antidote:{job:'healer', name:'ยาถอนพิษ', en:'Antidote', short:'ถอนพิษ', shortEn:'Antidote', max:5, type:'heal', cast:() => .4, sp:() => 10, cd:10, fx:'heal', anim:'skill', act:'tend', req:{herbheal:3},
    heal:lv => Math.round((20 + lv * 15 + DER.matk * .2 * lv) * (1 + (DER.pas.healPow || 0))), cleanse:1,
    desc:lv => L(`ล้างพิษ มึน เผา แช่แข็ง ทุกอาการ · ฟื้น HP ${20 + lv * 15} + MATK · ส่งให้ผู้เล่นรอบตัวด้วย`, `Cure every ailment · restore ${20 + lv * 15} HP + MATK · also reaches players around you`)},
  thiefsense:{job:'rogue', name:'สัญชาตญาณโจร', en:"Thief's Instinct", short:'สัญชาตญาณ', shortEn:'Instinct', max:10, type:'buff', sp:() => 20, cd:60, fx:'stealth', anim:'skill', act:'crouch', req:{dualwield:1},
    buff:lv => ({t:45, flee:lv * 4, crit:lv}), desc:lv => L(`45 วิ · FLEE +${lv * 4} · CRIT +${lv}%`, `45s · FLEE +${lv * 4} · CRIT +${lv}%`)},
  soulpact:{job:'summoner', name:'พันธะวิญญาณ', en:'Soul Pact', short:'พันธะ', shortEn:'Pact', max:10, type:'buff', sp:() => 30, cd:60, cast:() => .6, fx:'barrier', anim:'cast', act:'invoke', req:{sumlore:1},
    buff:lv => ({t:60, sumAtkB:+(lv * .03).toFixed(2), pact:.3}), desc:lv => L(`60 วิ · สัตว์อัญเชิญแรง +${lv * 3}% · สัตว์อัญเชิญรับดาเมจแทน 30%`, `60s · summons +${lv * 3}% damage · summons take 30% of the damage for you`)},
  /* tier 3 */
  tuskcharge:{job:'warlord', name:'ทวนช้างศึก', en:'War Tusk Charge', short:'ทวนช้าง', shortEn:'Tusk', max:10, type:'dash', sp:lv => 20 + lv * 2, cd:6, range:220, fx:'charge', anim:'attack', act:'lunge', req:{guardheart:1},
    dmg:lv => 3 + lv * .3, stun:lv => .6 + lv * .06, knock:40, desc:lv => L(`พุ่ง 220 · ${pct(3 + lv * .3)} ATK · กระเด็น · มึน ${+(.6 + lv * .06).toFixed(1)} วิ`, `Charge 220 · ${pct(3 + lv * .3)} ATK · knockback · stun ${+(.6 + lv * .06).toFixed(1)}s`)},
  starveil:{job:'astro', name:'ม่านดารา', en:'Star Veil', short:'ม่านดารา', shortEn:'Veil', max:10, type:'buff', sp:() => 40, cd:40, fx:'barrier', anim:'cast', act:'invoke', req:{astrowisdom:1},
    buff:lv => ({t:30, barrier:Math.round(Math.min(DER.maxsp * (.5 + lv * .1), DER.maxhp * 1.5)), matkPct:+(lv * .015).toFixed(3), repel:1}),
    desc:lv => L(`30 วิ · โล่ดูดซับ ${50 + lv * 10}% ของ Max SP · MATK +${+(lv * 1.5).toFixed(1)}% · ผลักมอนที่เข้ามาตีประชิด`, `30s · shield of ${50 + lv * 10}% Max SP · MATK +${+(lv * 1.5).toFixed(1)}% · pushes back melee attackers`)},
  pinarrow:{job:'warden', name:'ศรตรึงร่าง', en:'Pinning Arrow', short:'ตรึงร่าง', shortEn:'Pin', max:10, type:'ranged', sp:lv => 18 + lv * 2, cd:6, range:260, fx:'arrow', anim:'attack', act:'attack', req:{pierce:1},
    dmg:lv => 2.5 + lv * .25, root:lv => 1.5 + lv * .15, desc:lv => L(`ยิง ${pct(2.5 + lv * .25)} ATK · ตรึงอยู่กับที่ ${+(1.5 + lv * .15).toFixed(1)} วิ`, `Shoot ${pct(2.5 + lv * .25)} ATK · root for ${+(1.5 + lv * .15).toFixed(1)}s`)},
  grabthrow:{job:'grandmaster', name:'พุ่งจับทุ่ม', en:'Clinch Throw', short:'จับทุ่ม', shortEn:'Throw', max:10, type:'dash', sp:lv => 20 + lv * 2, cd:7, range:220, fx:'charge', anim:'attack', act:'heave', req:{flowart:1},
    dmg:lv => 3 + lv * .3, stun:lv => 1 + lv * .08, knock:50, desc:lv => L(`พุ่ง 220 จับทุ่ม · ${pct(3 + lv * .3)} ATK · มึน ${+(1 + lv * .08).toFixed(1)} วิ`, `Dash 220 and throw · ${pct(3 + lv * .3)} ATK · stun ${+(1 + lv * .08).toFixed(1)}s`)},
  revive:{job:'physician', name:'ชุบชีวิต', en:'Resurrection Charm', short:'ชุบชีวิต', shortEn:'Revive', max:5, type:'buff', sp:() => 50, cd:120, cast:() => 1.5, fx:'elixir', anim:'cast', act:'wai', req:{elixir:1},
    buff:lv => ({t:90, revive:+(.2 + lv * .06).toFixed(2)}), desc:lv => L(`90 วิ · ถ้าล้มลง ฟื้นทันทีด้วย HP ${Math.round((.2 + lv * .06) * 100)}% · ส่งให้ผู้เล่นรอบตัวด้วย`, `90s · if you fall, rise at once with ${Math.round((.2 + lv * .06) * 100)}% HP · also reaches players around you`)},
  purify:{job:'physician', name:'ชำระมลทิน', en:'Purify', short:'ชำระ', shortEn:'Purify', max:5, type:'heal', sp:() => 30, cd:12, cast:() => .6, fx:'elixir', anim:'cast', act:'invoke', req:{royaltext:1},
    heal:lv => Math.round((100 + lv * 60 + DER.matk * .5 * lv) * (1 + (DER.pas.healPow || 0))), cleanse:1,
    desc:lv => L(`ล้างทุกอาการ · ฟื้น HP ${100 + lv * 60} + MATK · ส่งให้ผู้เล่นรอบตัวด้วย`, `Cure every ailment · restore ${100 + lv * 60} HP + MATK · also reaches players around you`)},
  goldenhong:{job:'sovereign', name:'อัญเชิญหงส์ทอง', en:'Golden Hamsa', short:'หงส์ทอง', shortEn:'Hamsa', max:10, type:'aoeTarget', elem:'holy', magic:true, sp:lv => 30 + lv * 3, cd:6, cast:() => 1.2, range:240, radius:110, fx:'spiritburst', anim:'cast', act:'invoke', req:{sovlore:1},
    hits:() => 3, every:.3, dmg:lv => 1 + lv * .15, desc:lv => L(`หงส์ทองโฉบลงรอบเป้า 110 · 3 ครั้ง ครั้งละ ${pct(1 + lv * .15)} MATK · ธาตุศักดิ์สิทธิ์`, `A golden hamsa swoops (110) · 3 hits × ${pct(1 + lv * .15)} MATK · holy`)},
  /* tier 4 */
  tigerclaw:{job:'tigershade', name:'กรงเล็บพยัคฆ์', en:'Tiger Claws', short:'กรงเล็บ', shortEn:'Claws', max:10, type:'aoeSelf', sp:lv => 35 + lv * 2, cd:6, radius:100, fx:'bladestorm', anim:'attack', act:'flurry', req:{tigerfang:3},
    hits:() => 4, every:.15, dmg:lv => 1 + lv * .12, st:lv => ({poison:[.3 + lv * .03, 6]}),
    desc:lv => L(`ตะปบรอบตัว 100 · 4 ครั้ง ครั้งละ ${pct(1 + lv * .12)} ATK · เลือดไหล ${pct(.3 + lv * .03)} ATK/วิ 6 วิ`, `Claws around you (100) · 4 hits × ${pct(1 + lv * .12)} ATK · bleed ${pct(.3 + lv * .03)} ATK/s for 6s`)},
  shadowexec:{job:'tigershade', name:'เงาพิฆาต', en:'Shadow Execution', short:'พิฆาต', shortEn:'Execute', max:10, type:'melee', sp:lv => 40 + lv * 2, cd:8, fx:'assassinate', anim:'attack', act:'stab', req:{deathmark:3},
    dmg:lv => (5 + lv * .5) * (S6X.t && !S6X.t.dead && S6X.t.hp < S6X.t.maxhp * .3 ? 2 : 1),
    desc:lv => L(`${pct(5 + lv * .5)} ATK · เป้าที่ HP ต่ำกว่า 30% โดน 2 เท่า`, `${pct(5 + lv * .5)} ATK · double on targets under 30% HP`)},
  shieldbash:{job:'bulwark', name:'พุ่งโล่กระแทก', en:'Shield Rush', short:'โล่กระแทก', shortEn:'Rush', max:10, type:'dash', sp:lv => 30 + lv * 2, cd:8, range:220, fx:'charge', anim:'attack', act:'guard', req:{vajrabody:1},
    dmg:lv => 4 + lv * .4, stun:lv => 1 + lv * .1, knock:30, desc:lv => L(`พุ่งโล่ 220 · ${pct(4 + lv * .4)} ATK · มึน ${+(1 + lv * .1).toFixed(1)} วิ`, `Shield rush 220 · ${pct(4 + lv * .4)} ATK · stun ${+(1 + lv * .1).toFixed(1)}s`)},
  warbanner:{job:'bulwark', name:'ปักธงศึก', en:'War Banner', short:'ธงศึก', shortEn:'Banner', max:10, type:'aoeSelf', sp:() => 40, cd:20, radius:160, fx:'roar', anim:'skill', act:'plant', req:{vajrabody:5},
    dmg:lv => 2 + lv * .2, st:() => ({taunt:1}), desc:lv => L(`ปักธงรอบตัว 160 · ${pct(2 + lv * .2)} ATK · ดึงมอนทั้งหมดมาตีเรา · รับดาเมจ −${10 + lv * 2}% 10 วิ`, `Plant a banner (160) · ${pct(2 + lv * .2)} ATK · taunts all · damage taken −${10 + lv * 2}% for 10s`)},
  elemseal:{job:'archsage', name:'ผนึกจตุธาตุ', en:'Four-Element Seal', short:'จตุธาตุ', shortEn:'Seal', max:10, type:'buff', sp:() => 60, cd:60, cast:() => 1, fx:'manaRestore', anim:'cast', act:'invoke', req:{fourelements:1},
    buff:lv => ({t:40, matkPct:+(lv * .03).toFixed(2), dmgRed:.2, noBreak:1}), desc:lv => L(`40 วิ · MATK +${lv * 3}% · ร่ายไม่หลุด · รับดาเมจ −20%`, `40s · MATK +${lv * 3}% · casts can't be broken · damage taken −20%`)},
  kneeclinch:{job:'ringlord', name:'พุ่งเข่าโหนคอ', en:'Flying Clinch Knee', short:'เข่าโหน', shortEn:'Clinch', max:10, type:'dash', sp:lv => 30 + lv * 2, cd:7, range:220, fx:'charge', anim:'attack', act:'knee', req:{kardchuek:1},
    dmg:lv => 4 + lv * .4, stun:lv => .8 + lv * .07, desc:lv => L(`พุ่ง 220 โหนคอตีเข่า · ${pct(4 + lv * .4)} ATK · มึน ${+(.8 + lv * .07).toFixed(1)} วิ`, `Leap 220, clinch and knee · ${pct(4 + lv * .4)} ATK · stun ${+(.8 + lv * .07).toFixed(1)}s`)},
  drumrally:{job:'ringlord', name:'ปี่กลองเร้าใจ', en:'War Drums', short:'ปี่กลอง', shortEn:'Drums', max:10, type:'buff', sp:() => 50, cd:60, fx:'ramwai', anim:'skill', act:'wai', req:{kardchuek:3},
    buff:lv => ({t:60, aspdPct:+(lv * .02).toFixed(2), atkPct:+(lv * .01).toFixed(2)}), desc:lv => L(`60 วิ · ตีเร็วขึ้น ${lv * 2}% · ATK +${lv}% · ส่งให้ผู้เล่นรอบตัวด้วย`, `60s · attacks ${lv * 2}% faster · ATK +${lv}% · also reaches players around you`)},
  spiritarrow:{job:'sylvan', name:'ศรวิญญาณพงไพร', en:'Forest Spirit Arrows', short:'ศรวิญญาณ', shortEn:'Spirit', max:10, type:'ranged', sp:lv => 35 + lv * 2, cd:5, range:260, fx:'arrow', anim:'attack', act:'attack', req:{forestblood:1},
    hits:() => 5, dmg:lv => 1.2 + lv * .14, desc:lv => L(`5 ดอก ดอกละ ${pct(1.2 + lv * .14)} ATK`, `5 arrows × ${pct(1.2 + lv * .14)} ATK`)},
  rootsnare:{job:'sylvan', name:'กับดักรากไม้', en:'Root Snare', short:'รากไม้', shortEn:'Roots', max:10, type:'aoeTarget', elem:'earth', sp:lv => 35 + lv * 2, cd:12, range:240, radius:110, fx:'earthsplitBoom', anim:'attack', act:'settrap', req:{eaglearrow:3},
    dmg:lv => 2 + lv * .2, st:lv => ({root:2 + lv * .2}), desc:lv => L(`รากไม้รอบเป้า 110 · ${pct(2 + lv * .2)} ATK · ตรึง ${+(2 + lv * .2).toFixed(1)} วิ`, `Roots burst (110) · ${pct(2 + lv * .2)} ATK · root ${+(2 + lv * .2).toFixed(1)}s`)},
  sanctuary:{job:'divinehealer', name:'สวรรค์คุ้มภัย', en:'Heaven\'s Sanctuary', short:'คุ้มภัย', shortEn:'Sanctuary', max:10, type:'buff', sp:() => 80, cd:60, fx:'goldshield', anim:'cast', act:'wai', req:{divinehand:3},
    buff:lv => ({t:+(2 + lv * .1).toFixed(1), invuln:1}), desc:lv => L(`ไม่รับดาเมจ ${+(2 + lv * .1).toFixed(1)} วิ · ส่งให้ผู้เล่นรอบตัวด้วย`, `Immune to damage for ${+(2 + lv * .1).toFixed(1)}s · also reaches players around you`)},
  massrevive:{job:'divinehealer', name:'คืนชีพหมู่', en:'Mass Resurrection', short:'คืนชีพ', shortEn:'Revive', max:10, type:'buff', sp:() => 100, cd:180, cast:() => 2, fx:'elixir', anim:'cast', act:'invoke', req:{divinehand:5},
    buff:lv => ({t:120, revive:+(.3 + lv * .03).toFixed(2)}), desc:lv => L(`120 วิ · ทุกคนรอบตัว ถ้าล้มลง ฟื้นทันทีด้วย HP ${Math.round((.3 + lv * .03) * 100)}%`, `120s · everyone around you rises at once with ${Math.round((.3 + lv * .03) * 100)}% HP if they fall`)},
  kaisorn:{...SKILLS.callsingha, job:'himmaemperor', name:'อัญเชิญไกรสรราชสีห์', en:'Call the Kaisorn Lion', short:'ไกรสร', shortEn:'Kaisorn', max:10, sp:lv => 40 + lv * 3, cd:20, cast:() => 1, req:{emperorgrace:1},
    dmg:lv => 2.5 + lv * .3, dur:() => 30, hpMul:lv => 2 + lv * .15,
    desc:lv => L(`[แทงค์] ราชาราชสีห์ 30 วิ · HP ${pct(.66 * (2 + lv * .15))} ของ HP คุณ · ดึงมอนมาตีตัวเอง · ตะปบแรง ${pct(.6 * (2.5 + lv * .3))} ATK/MATK`, `[Tank] King lion for 30s · HP ${pct(.66 * (2 + lv * .15))} of yours · taunts · claws ${pct(.6 * (2.5 + lv * .3))} ATK/MATK`)},
  emperorwrath:{job:'himmaemperor', name:'พิโรธจักรพรรดิ', en:"Emperor's Wrath", short:'พิโรธ', shortEn:'Wrath', max:10, type:'aoeSelf', elem:'holy', magic:true, sp:lv => 60 + lv * 4, cd:15, cast:() => 1, radius:180, fx:'roar', anim:'cast', act:'invoke', req:{emperorgrace:5},
    dmg:lv => (3 + lv * .3) * (1 + S6X.n * .4), desc:lv => L(`สละสัตว์อัญเชิญทั้งหมด ระเบิดรอบตัว 180 · ${pct(3 + lv * .3)} MATK · แรงขึ้น +40% ต่อสัตว์ 1 ตัว`, `Sacrifice every summon for a blast (180) · ${pct(3 + lv * .3)} MATK · +40% per summon`)}
});

/* ---------- changed skills ---------- */
Object.assign(SKILLS.poultice, {type:'heal', max:5, cd:8, sp:() => 14, heal:lv => Math.round((30 + lv * 25 + DER.matk * .1 * lv) * (1 + (DER.pas.healPow || 0))), regen:lv => .015 * lv, buff:undefined,
  desc:lv => L(`ฟื้น HP ${30 + lv * 25} + MATK ทันที · ต่อด้วยฟื้น ${+(lv * 1.5).toFixed(1)}% ทุก 2 วิ 12 วิ`, `Restore ${30 + lv * 25} HP + MATK · then ${+(lv * 1.5).toFixed(1)}% every 2s for 12s`)});
Object.assign(SKILLS.smokebomb, {type:'aoeSelf', radius:90, max:5, cd:15, dmg:() => 0, st:lv => ({stun:+(1 + lv * .2).toFixed(1)}),
  desc:lv => L(`ระเบิดควันรอบตัว 90 · มอนมึน ${+(1 + lv * .2).toFixed(1)} วิ · หายตัว ${2 + lv} วิ · นัดแรก Crit แน่นอน`, `Smoke burst (90) · stuns ${+(1 + lv * .2).toFixed(1)}s · vanish ${2 + lv}s · first hit sure Crit`)});
s6merge('swordmastery', 'ironbody'); s6merge('hawkeye', 'beasttrain'); s6merge('dualwield', 'vitalspot'); s6merge('tigerheart', 'shadowedge');
{ const tb = SKILLS.tonic.buff, td = SKILLS.tonic.desc;
  SKILLS.tonic.buff = lv => ({...tb(lv), barrier:Math.round(DER.maxsp * (.15 + lv * .05))});
  SKILLS.tonic.desc = lv => `${td(lv)} · ${L(`โล่ดูดซับ ${15 + lv * 5}% ของ Max SP`, `shield of ${15 + lv * 5}% Max SP`)}`; }
SKILLS.charge.max = 10; SKILLS.charge.desc = lv => L(`พุ่ง 120 เข้าหาเป้า · ${pct(1.5 + lv * .2)} ATK · มึน 0.5 วิ`, `Dash 120 to the target · ${pct(1.5 + lv * .2)} ATK · stun 0.5s`); SKILLS.charge.stun = () => .5;

/* req chains that pointed at folded skills */
const S6_REQ = {provoke:{swordmastery:3}, goldshield:{swordmastery:10}, charge:{waveslash:3}, wildkin:{hawkeye:10}, spiketrap:{doubleshot:1},
  venomblade:{tigerheart:1}, knifevolley:{tigerheart:3}, plunder:{tigerheart:1}, shadowstep:{smokebomb:1}, poultice:{herbheal:1}, tonic:{royaltext:3}, barrier:{focus:3}};
for (const id in S6_REQ) if (SKILLS[id]) SKILLS[id].req = S6_REQ[id];

/* ---------- the lists: [active ×4, buff, passive] ---------- */
const S6_JOBS = {
  blade:['waveslash', 'quake', 'provoke', 'charge', 'warcry', 'swordmastery'],
  rune:['firebolt', 'icebolt', 'thunder', 'stonespike', 'barrier', 'focus'],
  ranger:['doubleshot', 'arrowrain', 'backstep', 'spiketrap', 'hunterfocus', 'hawkeye'],
  muay:['combo', 'roundkick', 'flyingknee', 'elbowback', 'waikhru', 'muaymastery'],
  healer:['herbheal', 'holywater', 'poultice', 'antidote', 'thread', 'herbalism'],
  rogue:['backstab', 'hamstring', 'smokebomb', 'shadowlunge', 'thiefsense', 'dualwield'],
  summoner:['callsingha', 'callnaga', 'callkinnaree', 'spiritburst', 'soulpact', 'sumlore'],
  warlord:['roar', 'earthsplit', 'bladestorm', 'tuskcharge', 'goldshield', 'guardheart'],
  astro:['meteor', 'frostsea', 'wrath', 'earthrage', 'starveil', 'astrowisdom'],
  warden:['pierce', 'firerain', 'tiger', 'pinarrow', 'mountedarcher', 'wildkin'],
  grandmaster:['crocodile', 'hanuman', 'monkick', 'grabthrow', 'ramwai', 'flowart'],
  physician:['elixir', 'holycircle', 'revive', 'purify', 'tonic', 'royaltext'],
  bandit:['assassinate', 'knifevolley', 'shadowstep', 'plunder', 'venomblade', 'tigerheart'],
  sovereign:['callgaruda', 'callerawan', 'goldenhong', 'royalbond', 'unity', 'sovlore'],
  tigershade:['deathmark', 'tigerpounce', 'tigerclaw', 'shadowexec', 'shadowclone', 'tigerfang'],
  bulwark:['vanguard', 'judgement', 'shieldbash', 'warbanner', 'bastion', 'vajrabody'],
  archsage:['solarfall', 'deluge', 'tempest', 'earthswallow', 'elemseal', 'fourelements'],
  ringlord:['elbowstorm', 'shinstorm', 'finisher', 'kneeclinch', 'drumrally', 'kardchuek'],
  sylvan:['eaglearrow', 'stormvolley', 'spiritarrow', 'rootsnare', 'packcall', 'forestblood'],
  divinehealer:['amrita', 'holylight', 'sanctuary', 'massrevive', 'blessing', 'divinehand'],
  himmaemperor:['beastcharge', 'gatestorm', 'kaisorn', 'emperorwrath', 'royaledict', 'emperorgrace']
};
for (const j in S6_JOBS){ if (!JOBS[j]) continue; const L6 = S6_JOBS[j];
  L6.forEach((id, i) => { const s = SKILLS[id]; if (!s) return; s.job = j; s.kind = i < 4 ? 'active' : i === 4 ? 'buff' : 'passive'; });
  JOBS[j].skills = L6.filter(id => SKILLS[id]); }
for (const id in SKILLS) if (!SKILLS[id].kind) SKILLS[id].kind = SKILLS[id].type === 'passive' ? 'passive' : SKILLS[id].type === 'buff' ? 'buff' : 'active';
for (const id in SKILLS) SKILLS[id].id = id;
/* a req on a skill that is no longer in its line would lock it forever: drop those */
{ const line = j => { const o = new Set(); for (let k = j; k; k = JOBS[k].parent) for (const id of JOBS[k].skills) o.add(id); return o; };
  for (const j in S6_JOBS){ const have = line(j); for (const id of S6_JOBS[j]){ const s = SKILLS[id]; if (s && s.req) for (const r in s.req) if (!have.has(r)) delete s.req[r]; } } }

/* poses: every skill's body action is in its class's sprite set */
for (const j in S6_JOBS){ if (!SPR.CHARS[j]) continue; const acts = new Set(SPR.CHAR_ACTIONS[j] || []);
  for (let k = j; k; k = JOBS[k].parent) for (const id of JOBS[k].skills) if (SKILLS[id] && SKILLS[id].act) acts.add(SKILLS[id].act);
  SPR.CHAR_ACTIONS[j] = [...acts]; }

/* skills shared with players around you (allybuff.js) */
if (typeof AB !== 'undefined'){
  AB.buff = AB.buff.filter(id => id !== 'poultice'); AB.heal.push('poultice', 'antidote', 'purify'); AB.buff.push('revive', 'massrevive', 'sanctuary', 'drumrally');
  Object.assign(AB_CAP, {atkPct:.3, matkPct:.3, aspdPct:.25, revive:.6, invuln:1, barrier:99999});
}

/* ---------- refund the points of folded skills, once per character ---------- */
const S6_GONE = ['ironbody', 'beasttrain', 'vitalspot', 'shadowedge', 'ward', 'shadowstorm', 'shadowlunge2'];
function s6Refund(){
  if (!S || !S.skills) return; let back = 0;
  for (const id of S6_GONE) if (S.skills[id]){ back += S.skills[id] | 0; delete S.skills[id]; }
  // skills no longer in the character's line (old lists) also give their points back
  const have = new Set(); for (let k = S.job; k && JOBS[k]; k = JOBS[k].parent) for (const id of JOBS[k].skills) have.add(id);
  for (const id in S.skills) if (!have.has(id) && SKILLS[id] && SKILLS[id].job !== 'novice'){ back += S.skills[id] | 0; delete S.skills[id]; }
  for (const id in S.skills) if (SKILLS[id] && S.skills[id] > SKILLS[id].max){ back += S.skills[id] - SKILLS[id].max; S.skills[id] = SKILLS[id].max; }
  if (S.hot) S.hot = S.hot.map(h => (h && !S.skills[h] && SKILLS[h] && !have.has(h) ? null : h));
  if (back){ S.skPts = (S.skPts || 0) + back; dirty = true; setTimeout(() => toast(L(`จัดสกิลอาชีพใหม่ (4 กดใช้ · 1 บัพ · 1 พาสซีฟ): คืน Skill Point ${back} แต้ม`, `Class skills reshaped (4 active · 1 buff · 1 passive): ${back} Skill Points back`)), 2200); }
}
{ const _d = derive; derive = function(){ if (S && S.skills && !S._s6Done){ S._s6Done = 1; s6Refund(); } return _d.apply(this, arguments); }; }

/* ---------- what the new skills do beyond their base type ---------- */
{ const _ex = execSkill;
  execSkill = function(id, lv, t){
    const sk = SKILLS[id];
    S6X.t = t || null;
    if (id === 'emperorwrath'){ const own = s6beasts(); S6X.n = own.length;
      for (const s of own){ VFX.play('beastFade', {x:s.x, y:s.y, col:(HIMMA[s.beast] || {}).aura}); VFX.play('earthsplitBoom', {x:s.x, y:s.y, r:60}); }
      SUMMONS = SUMMONS.filter(s => !own.includes(s)); }
    const r = _ex.apply(this, arguments);
    if (!sk) return r;
    if (sk.knock && sk.type === 'dash' && t) later(.08, () => { if (!t.dead) applyStatus(t, {knock:sk.knock}); });
    if (sk.root && t) later(.2, () => { if (!t.dead) applyStatus(t, {root:sk.root(lv)}); });
    if (sk.cleanse && typeof afCure === 'function') afCure(null, L('ชำระล้างอาการ', 'Cleansed'));
    if (id === 'poultice') addBuff('poulticeR', {t:12, regenPct:sk.regen(lv), every:2});
    if (id === 'smokebomb'){ addBuff('smokebomb', {stealth:1, sureCrit:1, t:2 + lv}); VFX.play('smokeCloud', {x:P.x, y:P.y, r:90});
      for (const m of mobs) if (m.aggro && !m.def.boss){ m.aggro = false; m.tx = m.hx; m.ty = m.hy; } }
    if (id === 'warbanner') addBuff('warbanner', {t:10, dmgRed:+(.1 + lv * .02).toFixed(2)});
    return r;
  };
}
/* flee buff, invulnerability, star veil's push, soul pact's share */
{ const _ma = mobAttack;
  mobAttack = function(m, mult, noDodge){
    if (Object.values(P.buffs).some(b => b.invuln)){ addText(P.x, P.y - 48, 'Immune', '#ffe08a', 13); return; }
    const fl = buffSum('flee'); if (fl && DER) DER.flee += fl;
    try { return _ma.apply(this, arguments); } finally { if (fl && DER) DER.flee -= fl; }
  };
}
HK.atkMul.push((m, mult) => { S6X.pact = 0; const b = P.buffs.soulpact; if (b && b.pact && s6beasts().length){ S6X.pact = b.pact; return mult * (1 - b.pact); } return mult; });
HK.atkAfter.push((m, mult, noDodge, dmg) => {
  if (S6X.pact && dmg > 0){ const own = s6beasts(); if (own.length){ const s = own[Math.floor(Math.random() * own.length)]; if (s.hp) s.hp = Math.max(1, s.hp - Math.round(dmg * S6X.pact / (1 - S6X.pact))); } }
  const v = P.buffs.starveil; if (v && v.repel && m && !m.dead && !m.def.range && !m.def.boss && T - (m._s6rep || 0) > 1){ m._s6rep = T; applyStatus(m, {knock:40}); VFX.play('barrierHit', {x:P.x, y:P.y}); }
});
/* revive charm: falling with it on → rise at once */
{ const _pd = playerDie;
  playerDie = function(){
    const k = Object.keys(P.buffs).find(id => P.buffs[id].revive > 0);
    if (k && DER){ const f = P.buffs[k].revive; delete P.buffs[k]; renderBuffs(); S.hp = Math.max(1, Math.round(DER.maxhp * f)); P.dead = false;
      SFX.play('laststand'); VFX.play('laststand', {x:P.x, y:P.y}); VFX.play('levelUp', {}); banner(L('ฟื้นคืนชีพ!', 'Resurrected!')); dirty = true; return; }
    return _pd.apply(this, arguments);
  };
}
/* four-element seal: nothing breaks your cast */
if (typeof afBreakCast === 'function'){ const _bc = afBreakCast; afBreakCast = function(){ if (P.buffs.elemseal) return false; return _bc.apply(this, arguments); }; }
/* buff readout for the new keys */
if (typeof buffEffect === 'function'){ const _be = buffEffect; buffEffect = function(b){ const out = [_be.apply(this, arguments)].filter(Boolean);
  if (b.flee) out.push(`FLEE +${b.flee}`); if (b.aspdPct) out.push(L(`ตีเร็ว +${Math.round(b.aspdPct * 100)}%`, `ASPD +${Math.round(b.aspdPct * 100)}%`)); if (b.matkPct) out.push(`MATK +${Math.round(b.matkPct * 100)}%`);
  if (b.dmgRed) out.push(L(`รับดาเมจ −${Math.round(b.dmgRed * 100)}%`, `Damage taken −${Math.round(b.dmgRed * 100)}%`));
  if (b.invuln) out.push(L('ไม่รับดาเมจ', 'Immune')); if (b.revive) out.push(L(`ฟื้นคืนชีพ ${Math.round(b.revive * 100)}%`, `Revive ${Math.round(b.revive * 100)}%`));
  if (b.noBreak) out.push(L('ร่ายไม่หลุด', 'Unbreakable cast')); if (b.pact) out.push(L('สัตว์อัญเชิญรับดาเมจแทน 30%', 'Summons take 30%')); if (b.repel) out.push(L('ผลักศัตรู', 'Repel'));
  return [...new Set(out.join(' · ').split(' · '))].join(' · '); }; }
