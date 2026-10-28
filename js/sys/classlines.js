/* VAYRATHEN — js/sys/classlines.js — the other six lines reworked, each with a tier 4 (like the thief line)
   Few skills per tier (about 5 · 5 · 4–5), each one with a clear job:
     นักรบ   นักดาบ → ขุนศึก → ขุนพลปราการ (bulwark)     tank / front line: cuts damage, taunts, shields the team
     เวท     นักเวท → มหาโหรา → จอมเวทจตุธาตุ (archsage)  four elements (ดิน น้ำ ลม ไฟ) and a grand spell for each
     มวย     นักมวย → ปรมาจารย์มวย → เจ้าสังเวียน (ringlord) combos: every skill in a row adds a stack, the finisher spends them
     พราน    พราน → พรานพงไพร → จ้าวพนาไพร (sylvan)          ranged with a pet
     หมอ     หมอยา → ราชแพทย์ → เวชบดีทิพย์ (divinehealer)    heals and team buffs
     อัญเชิญ ผู้อัญเชิญ → จอมอัญเชิญหิมพานต์ → จักรพรรดิหิมพานต์ (himmaemperor) beasts
   Tier 4 opens at Job Lv 50 of the tier-3 class and Base Lv 150 (rogueline.js holds that gate).
   Class weapons (gear.js): คทาจตุธาตุ (mage) · ไม้เท้าโอสถ (healer) · คทาสังข์อัญเชิญ (summoner) · ธนูยาวพงไพร (hunter) ·
   ดาบขุนพล (warrior blade); each one works only for its own line.
   Points in skills that left a line come back once per character. */
'use strict';

const CL = {};
const clSet = (id, o) => { if (SKILLS[id]) Object.assign(SKILLS[id], o); };
const clJob = (id, o) => { JOBS[id] = Object.assign({tier:4, ranged:false, jobMax:50}, o); };
/* stat keys from passives, buffs and gear: dmgRed (damage taken), comboPct/comboCap (muay), castPct/healPow/sumAtk/petAtk/range (gear) */
const CL_GEAR_KEYS = ['dmgRed', 'castPct', 'healPow', 'sumAtk', 'petAtk', 'range', 'critRes'];
{ const _d = derive;
  derive = function(){ const r = _d.apply(this, arguments); if (!DER || !S || !S.gear) return r;
    const add = {}; for (const sl in S.gear){ const it = S.gear[sl] && ITEMS[S.gear[sl]]; if (!it || !it.st || (sl === 'weapon' && !canWield(it))) continue; for (const k of CL_GEAR_KEYS) if (it.st[k]) add[k] = (add[k] || 0) + it.st[k]; }
    if (add.castPct) DER.castMul = Math.max(.2, DER.castMul * (1 - add.castPct));
    if (add.range && JOBS[S.job].ranged) DER.range += add.range;
    for (const k of ['dmgRed', 'healPow', 'sumAtk', 'petAtk', 'critRes']) if (add[k]) DER.pas[k] = (DER.pas[k] || 0) + add[k];
    // the warrior line's guard: a chance to block an ordinary hit outright
    if (DER.pas.shieldBlock) DER.block = Math.min(50, (DER.block || 0) + DER.pas.shieldBlock);
    return r; }; }
const clRed = () => Math.min(.5, ((DER && DER.pas && DER.pas.dmgRed) || 0) + buffSum('dmgRed'));
HK.atkMul.push((m, mult) => mult * (1 - clRed()));
/* monsters land critical hits too (×1.5): 5% for monsters, 10% for bosses, cut by your Critical Resistance
   (LUK × 0.2% + VIT × 0.1% + skills, gear and buffs with critRes) */
const critResPct = () => !DER ? 0 : DER.b.luk * .2 + DER.b.vit * .1 + ((DER.pas && DER.pas.critRes) || 0) + buffSum('critRes');
const MCRIT = {t:-9};
HK.atkMul.push((m, mult) => { const ch = (m.def.boss ? 10 : 5) - critResPct(); if (ch > 0 && Math.random() * 100 < ch){ MCRIT.t = T; return mult * 1.5; } return mult; });
HK.atkAfter.push((m, mult, nd, dmg) => { if (dmg > 0 && T - MCRIT.t < .05){ MCRIT.t = -9; addText(P.x, P.y - 64, 'Critical hit!', '#ff5a5a', 13); } });

/* ======================= นักรบ: tank / front line ======================= */
clSet('ironbody', {max:10, pas:lv => ({hpPct:lv * .03, def:lv, regenHp:lv * 2, noFlinch:lv >= 10 ? 1 : 0}),
  desc:lv => L(`Max HP +${lv * 3}% · DEF +${lv} · ฟื้น HP ${lv * 2} ทุก 10 วิ${lv >= 10 ? ' · ไม่ชะงักเมื่อโดนตี' : ' · Lv 10: ไม่ชะงักเมื่อโดนตี'}`, `Max HP +${lv * 3}% · DEF +${lv} · ${lv * 2} HP every 10s${lv >= 10 ? ' · never flinch' : ' · Lv 10: never flinch'}`)});
clSet('provoke', {req:{ironbody:3}});
JOBS.blade.skills = ['swordmastery', 'ironbody', 'waveslash', 'quake', 'provoke'];
SKILLS.guardheart = {job:'warlord', name:'ใจผู้พิทักษ์', en:"Guardian's Heart", max:10, type:'passive', pas:lv => ({dmgRed:lv * .02, hpPct:lv * .02, shieldBlock:lv, critRes:lv}),
  desc:lv => L(`รับดาเมจ −${lv * 2}% · Max HP +${lv * 2}% · ต้านทานคริ +${lv}% · บล็อก +${lv}%`, `Damage taken −${lv * 2}% · Max HP +${lv * 2}% · Critical Resistance +${lv}% · Block +${lv}%`)};
clSet('goldshield', {max:10, buff:lv => ({def:lv * 6, reflect:lv * .015, t:30}), desc:lv => L(`DEF +${lv * 6} · สะท้อนดาเมจ ${+(lv * 1.5).toFixed(1)}% · 30 วิ`, `DEF +${lv * 6} · Reflect ${+(lv * 1.5).toFixed(1)}% · 30s`)});
JOBS.warlord.skills = ['guardheart', 'goldshield', 'roar', 'earthsplit', 'bladestorm'];
JOBS.warlord.next = ['bulwark'];
clJob('bulwark', {name:'ขุนพลปราการ', en:'Bulwark General', parent:'warlord', hp:1.9, sp:3, delay:50, range:30, stat:'VIT · STR',
  weapon:{name:'ดาบขุนพลปราการ', en:'Bulwark Blade', atk:150, type:'sword'}, skills:['vajrabody', 'bastion', 'vanguard', 'judgement']});
Object.assign(SKILLS, {
  vajrabody:{job:'bulwark', name:'กายวชิระ', en:'Vajra Body', max:10, type:'passive', pas:lv => ({dmgRed:lv * .015, def:lv * 3, hpPct:lv * .03, lastStand:lv >= 10 ? .3 : 0}),
    desc:lv => L(`รับดาเมจ −${+(lv * 1.5).toFixed(1)}% · DEF +${lv * 3} · Max HP +${lv * 3}%${lv >= 10 ? ' · รอดจากความตาย 1 ครั้งทุก 5 นาที' : ' · Lv 10: รอดจากความตาย'}`, `Damage taken −${+(lv * 1.5).toFixed(1)}% · DEF +${lv * 3} · Max HP +${lv * 3}%${lv >= 10 ? ' · survive a death every 5 min' : ' · Lv 10: survive a death'}`)},
  bastion:{job:'bulwark', name:'ปราการพิทักษ์', en:'Bastion', short:'ปราการ', shortEn:'Bastion', max:10, type:'buff', sp:() => 45, cd:45, fx:'goldshield', anim:'skill', req:{vajrabody:3},
    buff:lv => ({t:30, def:lv * 12, reflect:+(lv * .02).toFixed(2)}),   // (v166) DEF and reflect for the party; the damage cut is Guard Stance's (self)
    desc:lv => L(`30 วิ · DEF +${lv * 12} · สะท้อน ${lv * 2}% · ส่งให้ผู้เล่นรอบตัวด้วย`, `30s · DEF +${lv * 12} · reflect ${lv * 2}% · also reaches players around you`)},
  vanguard:{job:'bulwark', name:'ทัพหน้าทลาย', en:'Vanguard Crash', short:'ทัพหน้า', shortEn:'Crash', max:10, type:'aoeSelf', sp:lv => 30 + lv * 2, cd:6, radius:110, fx:'quake', anim:'skill', req:{vajrabody:1},
    hits:() => 3, every:.25, dmg:lv => 1.5 + lv * .25, st:lv => ({taunt:1, atkDown:[.02 * lv, 6]}),
    desc:lv => L(`รอบตัว 110 · 3 ครั้ง ครั้งละ ${pct(1.5 + lv * .25)} ATK · ดึงมอนทั้งหมด · ATK มอน −${lv * 2}% 6 วิ`, `Around you (110) · 3 hits × ${pct(1.5 + lv * .25)} ATK · taunts all · enemy ATK −${lv * 2}% for 6s`)},
  judgement:{job:'bulwark', name:'ดาบพิพากษา', en:'Judgement Blade', short:'พิพากษา', shortEn:'Judge', max:10, type:'line', sp:lv => 35 + lv * 2, cd:5, len:220, width:34, fx:'earthsplit', anim:'attack', req:{vanguard:3},
    dmg:lv => 6 + lv * .6, desc:lv => L(`เส้นตรง 220 · ${pct(6 + lv * .6)} ATK ทุกตัวในแนว`, `Line 220 · ${pct(6 + lv * .6)} ATK to all in its path`)}
});

/* ======================= เวท: ดิน น้ำ ลม ไฟ ======================= */
SKILLS.stonespike = {job:'rune', name:'หนามศิลา', en:'Stone Spikes', short:'หนามศิลา', shortEn:'Spikes', max:5, type:'aoeTarget', elem:'earth', magic:true, sp:lv => 16 + lv * 3, cd:1.2, cast:lv => 1 + lv * .15, range:220, radius:60, fx:'quake', anim:'cast',
  dmg:lv => 1.5 + lv * .6, st:() => ({stun:.6}), desc:lv => L(`หนามหินพุ่งรอบเป้า 60 · ${pct(1.5 + lv * .6)} MATK · Stun 0.6 วิ · ธาตุดิน`, `Stone spikes around the target (60) · ${pct(1.5 + lv * .6)} MATK · Stun 0.6s · Earth`)};
clSet('thunder', {req:{}});
JOBS.rune.skills = ['focus', 'firebolt', 'icebolt', 'thunder', 'stonespike'];
SKILLS.earthrage = {job:'astro', name:'ธรณีพิโรธ', en:'Wrath of the Earth', short:'ธรณี', shortEn:'Quake', max:10, type:'aoeTarget', elem:'earth', magic:true, sp:lv => 40 + lv * 3, cd:6, cast:() => 3, range:240, radius:100, fx:'earthfall', anim:'cast', req:{stonespike:5},
  hits:() => 4, every:.3, dmg:lv => .6 + lv * .14, st:() => ({stun:1}),
  desc:lv => L(`แผ่นดินแยก หินถล่ม 4 ครั้ง ครั้งละ ${pct(.6 + lv * .14)} MATK · รัศมี 100 · Stun 1 วิ · ธาตุดิน · Cast 3 วิ`, `The ground splits, 4 rockfalls × ${pct(.6 + lv * .14)} MATK · radius 100 · Stun 1s · Earth · Cast 3s`)};
clSet('meteor', {req:{firebolt:5}}); clSet('frostsea', {req:{icebolt:5}}); clSet('wrath', {req:{thunder:5}});
JOBS.astro.skills = ['astrowisdom', 'meteor', 'frostsea', 'wrath', 'earthrage'];
JOBS.astro.next = ['archsage'];
clJob('archsage', {name:'จอมเวทจตุธาตุ', en:'Elemental Archsage', parent:'astro', hp:.85, sp:11, delay:56, range:160, caster:true, stat:'INT · DEX',
  weapon:{name:'คทาจตุธาตุแห่งปฐพี', en:'Primordial Staff', atk:40, matk:220, type:'staff'}, skills:['fourelements', 'solarfall', 'deluge', 'tempest', 'earthswallow']});
const clGrand = (id, name, en, elem, fx, hits, every, d0, dk, extra, th, enTxt) => ({job:'archsage', name, en, short:name.slice(0, 6), shortEn:en.split(' ')[0], max:10, type:'aoeTarget', elem, magic:true,
  sp:lv => 90 + lv * 5, cd:15, cast:() => 4, range:260, radius:150, fx, anim:'cast', hits:() => hits, every, dmg:lv => d0 + lv * dk, ...extra,
  desc:lv => L(`${th} · ${hits} ครั้ง ครั้งละ ${pct(d0 + lv * dk)} MATK · รัศมี 150 · ${elemName(elem)} · Cast 4 วิ`, `${enTxt} · ${hits} hits × ${pct(d0 + lv * dk)} MATK · radius 150 · ${elemName(elem)} · Cast 4s`)});
Object.assign(SKILLS, {
  fourelements:{job:'archsage', name:'จตุธาตุ', en:'Four Elements', max:10, type:'passive', pas:lv => ({matkPct:lv * .03, castPct:lv * .02, spPct:lv * .02}),
    desc:lv => L(`MATK +${lv * 3}% · Cast Time −${lv * 2}% · Max SP +${lv * 2}%`, `MATK +${lv * 3}% · Cast Time −${lv * 2}% · Max SP +${lv * 2}%`)},
  solarfall:clGrand('solarfall', 'สุริยาถล่ม', 'Solar Cataclysm', 'fire', 'cataclysm', 8, .22, .8, .14, {req:{meteor:5}}, 'ดวงไฟจากฟ้าถล่มลงพื้นที่กว้าง', 'Suns rain down on a wide area'),
  deluge:clGrand('deluge', 'มหาอุทกภัย', 'Great Deluge', 'water', 'deluge', 6, .35, .9, .13, {req:{frostsea:5}}, 'พายุฝนฟ้าคะนองหลายลูกถล่มพื้นที่กว้าง', 'Several thunderstorms sweep a wide area'),
  tempest:clGrand('tempest', 'พายุอสนีบาต', 'Thunder Tempest', 'wind', 'tempest', 10, .16, .55, .085, {req:{wrath:5}}, 'สายฟ้าฟาดรัวทั่วพื้นที่ ช็อต', 'Lightning lashes the whole area, shocking'),
  earthswallow:clGrand('earthswallow', 'ธรณีสูบ', 'Earth Swallow', 'earth', 'earthfall', 4, .4, 1.5, .25, {req:{earthrage:5}, st:() => ({stun:1.5})}, 'แผ่นดินแยกกลืนศัตรู', 'The earth opens and swallows the foe')
});
/* the grand spells: bigger versions of the tier-3 effects, played across the whole area */
{ const _p = VFX.play;
  VFX.play = function(key, o = {}){
    const x = o.x || 0, y = o.y || 0, r = o.r || 100, rr = () => ({x:x + rand(-r * .6, r * .6), y:y + rand(-r * .45, r * .45)});
    if (key === 'cataclysm'){ for (let i = 0; i < 6; i++) later(i * .2, () => _p.call(VFX, 'meteor', {...rr(), r:r * .45, hits:1, every:.2, lv:o.lv})); VFX.shake(6); return; }
    if (key === 'deluge') return;   // the downpour itself is drawn by mage2.js (several thunderstorm cells, v31), no blizzard
    if (key === 'tempest'){ _p.call(VFX, 'wrath', {x, y, r, hits:o.hits, every:o.every, lv:o.lv}); for (let i = 0; i < 6; i++) later(.15 + i * .22, () => _p.call(VFX, 'thunder', {...rr(), r:r * .4})); return; }
    if (key === 'earthfall'){ _p.call(VFX, 'quake', {x, y, r}); for (let i = 0; i < (o.hits || 4) * 2; i++) later(.1 + i * .15, () => { const q = rr(); _p.call(VFX, 'quake', {...q, r:r * .35}); _p.call(VFX, 'stoneHit', q); }); VFX.shake(5); return; }
    return _p.apply(this, arguments); }; }

/* ======================= มวย: combos ======================= */
const CMB = {n:0, t:-9, fin:1};
const muayLine = () => jobChain().includes('muay');
const cmbCap = () => 5 + ((DER && DER.pas && DER.pas.comboCap) || 0);
const CMB_ATK = ['melee', 'aoeSelf', 'line', 'dash'];
clSet('muaymastery', {pas:lv => ({fistAtk:lv * 3, flee:lv, comboPct:lv * .006}),
  desc:lv => L(`ATK +${lv * 3} มือเปล่า · FLEE +${lv} · คอมโบ: ทุกสกิลต่อเนื่อง แรงขึ้น ${+(lv * .6).toFixed(1)}% ต่อขั้น`, `ATK +${lv * 3} bare-handed · FLEE +${lv} · combo: each skill in a row adds +${+(lv * .6).toFixed(1)}% per stack`)});
clSet('roundkick', {req:{combo:3}}); clSet('flyingknee', {req:{combo:5}});
JOBS.muay.skills = ['muaymastery', 'combo', 'roundkick', 'flyingknee', 'waikhru'];
SKILLS.flowart = {job:'grandmaster', name:'แม่ไม้ไม่ขาดสาย', en:'Unbroken Flow', max:10, type:'passive', pas:lv => ({comboPct:lv * .004, comboCap:lv >= 5 ? 2 : 0, crit:lv}),
  desc:lv => L(`คอมโบแรงขึ้นอีก ${+(lv * .4).toFixed(1)}% ต่อขั้น · CRIT +${lv}%${lv >= 5 ? ' · คอมโบสูงสุด +2' : ' · Lv 5: คอมโบสูงสุด +2'}`, `Combo +${+(lv * .4).toFixed(1)}% more per stack · CRIT +${lv}%${lv >= 5 ? ' · max combo +2' : ' · Lv 5: max combo +2'}`)};
clSet('crocodile', {req:{roundkick:5}}); clSet('monkick', {req:{flyingknee:3}});
JOBS.grandmaster.skills = ['flowart', 'crocodile', 'hanuman', 'monkick', 'ramwai'];
JOBS.grandmaster.next = ['ringlord'];
clJob('ringlord', {name:'เจ้าสังเวียน', en:'Lord of the Ring', parent:'grandmaster', hp:1.5, sp:3.8, delay:44, range:26, stat:'STR · AGI',
  weapon:{name:'เชือกคาดหมัดเจ้าสังเวียน', en:'Ring Lord Wraps', atk:145, type:'fist'}, skills:['kardchuek', 'elbowstorm', 'shinstorm', 'finisher']});
Object.assign(SKILLS, {
  kardchuek:{job:'ringlord', name:'คาดเชือก', en:'Kard Chuek', max:10, type:'passive', pas:lv => ({comboCap:lv >= 5 ? 3 : 1, atkPct:lv * .03, aspdPct:lv * .02}),
    desc:lv => L(`ATK +${lv * 3}% · ตีเร็วขึ้น ${lv * 2}% · คอมโบสูงสุด +${lv >= 5 ? 3 : 1}`, `ATK +${lv * 3}% · attacks ${lv * 2}% faster · max combo +${lv >= 5 ? 3 : 1}`)},
  elbowstorm:{job:'ringlord', name:'ศอกพายุ', en:'Elbow Storm', short:'ศอกพายุ', shortEn:'Elbows', max:10, type:'melee', sp:lv => 20 + lv * 2, cd:2, fx:'punch', anim:'attack', act:'flurry', req:{kardchuek:1},
    hits:() => 6, every:.08, dmg:lv => .6 + lv * .1, desc:lv => L(`ศอกรัว 6 ครั้ง ครั้งละ ${pct(.6 + lv * .1)} ATK`, `6 elbows × ${pct(.6 + lv * .1)} ATK`)},
  shinstorm:{job:'ringlord', name:'พายุแข้ง', en:'Shin Storm', short:'พายุแข้ง', shortEn:'Shins', max:10, type:'aoeSelf', sp:lv => 30 + lv * 2, cd:5, radius:90, fx:'kickArc', anim:'attack', act:'spinkick', req:{kardchuek:3},
    hits:() => 5, every:.16, dmg:lv => .7 + lv * .1, knock:20, desc:lv => L(`เตะหมุนรอบตัว 90 · 5 ครั้ง ครั้งละ ${pct(.7 + lv * .1)} ATK`, `Spinning kicks (90) · 5 hits × ${pct(.7 + lv * .1)} ATK`)},
  finisher:{job:'ringlord', name:'ปิดฉากมวยไทย', en:'Muay Thai Finisher', short:'ปิดฉาก', shortEn:'Finisher', max:10, type:'melee', sp:lv => 40 + lv * 3, cd:10, fx:'hanuman', anim:'attack', act:'uppercut', req:{elbowstorm:5},
    dmg:lv => (4 + lv * .4) * (CMB.fin || 1), stun:() => 1.5,
    desc:lv => L(`${pct(4 + lv * .4)} ATK · ใช้คอมโบที่สะสมทั้งหมด: แรงขึ้น 40% ต่อขั้น · Stun 1.5 วิ`, `${pct(4 + lv * .4)} ATK · spends your whole combo: +40% per stack · Stun 1.5s`)}
});
{ const _ex = execSkill;
  execSkill = function(id){ const sk = SKILLS[id];
    if (sk && muayLine() && CMB_ATK.includes(sk.type) && JOBS[sk.job] && jobChain().includes(sk.job)){
      if (id === 'finisher'){ CMB.fin = 1 + .4 * (T - CMB.t < 3.5 ? CMB.n : 0); if (CMB.n >= 2) addText(P.x, P.y - 70, `FINISH ×${CMB.n}`, '#ffb830', 18); CMB.n = 0; later(.8, () => { CMB.fin = 1; }); }
      else { CMB.n = Math.min(cmbCap(), (T - CMB.t < 3.5 ? CMB.n : 0) + 1); CMB.t = T; if (CMB.n >= 2) addText(P.x, P.y - 66, `COMBO ${CMB.n}`, '#ffd34a', 13 + Math.min(6, CMB.n)); } }
    return _ex.apply(this, arguments); }; }
{ const _ba = basicAttack; basicAttack = function(){ if (CMB.n && T - CMB.t < 3.5) CMB.t = Math.max(CMB.t, T - 2); return _ba.apply(this, arguments); }; }   // normal hits keep a combo from dropping for a moment
HK.outMul.push((mult, elem, kind) => (kind === 'phys' && CMB.n && T - CMB.t < 3.5 && muayLine() ? mult * (1 + CMB.n * ((DER.pas && DER.pas.comboPct) || 0)) : mult));

/* ======================= พราน: ranged with a pet ======================= */
clSet('arrowrain', {req:{doubleshot:5}}); clSet('backstep', {req:{hawkeye:3}});
JOBS.ranger.skills = ['hawkeye', 'doubleshot', 'beasttrain', 'arrowrain', 'backstep'];
clSet('mountedarcher', {max:5, buff:lv => ({aspdPct:lv * .06, t:30 + lv * 6}), desc:lv => L(`ยิงเร็วขึ้น ${lv * 6}% นาน ${30 + lv * 6} วิ`, `Attack speed +${lv * 6}% for ${30 + lv * 6}s`)});
clSet('firerain', {req:{arrowrain:5}}); clSet('tiger', {req:{wildkin:5}});
JOBS.warden.skills = ['wildkin', 'pierce', 'firerain', 'tiger', 'mountedarcher'];
JOBS.warden.next = ['sylvan'];
clJob('sylvan', {name:'จ้าวพนาไพร', en:'Sylvan Lord', parent:'warden', hp:1.15, sp:5, delay:44, range:230, ranged:true, stat:'DEX · AGI',
  weapon:{name:'ธนูจ้าวพนาไพร', en:'Sylvan Lord Bow', atk:160, type:'bow'}, skills:['forestblood', 'eaglearrow', 'stormvolley', 'packcall']});
Object.assign(SKILLS, {
  forestblood:{job:'sylvan', name:'สายเลือดพงไพร', en:'Forest Blood', max:10, type:'passive', pas:lv => ({atkPct:lv * .03, petAtk:lv * .06, range:lv * 4, crit:lv}),
    desc:lv => L(`ATK +${lv * 3}% · Pet แรงขึ้น ${lv * 6}% · ระยะยิง +${lv * 4} · CRIT +${lv}%`, `ATK +${lv * 3}% · pet +${lv * 6}% · range +${lv * 4} · CRIT +${lv}%`)},
  eaglearrow:{job:'sylvan', name:'ศรพญาอินทรี', en:'Eagle King Arrow', short:'อินทรี', shortEn:'Eagle', max:10, type:'ranged', sp:lv => 25 + lv * 2, cd:3, fx:'arrow', anim:'attack', req:{forestblood:1},
    hits:() => 3, dmg:lv => 2 + lv * .3, desc:lv => L(`3 ดอก ดอกละ ${pct(2 + lv * .3)} ATK`, `3 arrows × ${pct(2 + lv * .3)} ATK`)},
  stormvolley:{job:'sylvan', name:'พายุศรอสนี', en:'Storm Volley', short:'พายุศร', shortEn:'Storm', max:10, type:'aoeTarget', elem:'wind', sp:lv => 35 + lv * 3, cd:6, range:240, radius:120, fx:'arrowrain', anim:'attack', act:'aimup', req:{eaglearrow:3},
    hits:() => 6, every:.18, dmg:lv => .8 + lv * .12, desc:lv => L(`ฝนศรสายฟ้ารอบเป้า 120 · 6 ครั้ง ครั้งละ ${pct(.8 + lv * .12)} ATK · ธาตุลม`, `Lightning arrows around the target (120) · 6 hits × ${pct(.8 + lv * .12)} ATK · Wind`)},
  packcall:{job:'sylvan', name:'สัญญาณล่าฝูง', en:'Call of the Pack', short:'ล่าฝูง', shortEn:'Pack', max:10, type:'buff', sp:() => 40, cd:40, fx:'petcall', anim:'skill', act:'whistle', req:{forestblood:3},
    buff:lv => ({t:30, atkPct:lv * .03, aspdPct:lv * .03}), desc:lv => L(`30 วิ · ATK +${lv * 3}% · ยิงเร็วขึ้น ${lv * 3}% · Pet แรงขึ้น 30%`, `30s · ATK +${lv * 3}% · attacks ${lv * 3}% faster · pet +30%`)}
});
{ const _ex = execSkill; execSkill = function(id){ const r = _ex.apply(this, arguments); if (id === 'packcall') P.petBuff = 30; return r; }; }

/* ======================= หมอ: heals and team buffs ======================= */
clSet('holywater', {req:{herbalism:3}}); clSet('thread', {req:{}});
JOBS.healer.skills = ['herbalism', 'herbheal', 'poultice', 'thread', 'holywater'];
SKILLS.tonic = {job:'physician', name:'ยาบำรุงกำลัง', en:'Vigor Tonic', short:'ยาบำรุง', shortEn:'Tonic', max:5, type:'buff', sp:() => 35, cd:30, cast:() => .8, fx:'elixir', anim:'cast', act:'drink', req:{royaltext:3},
  buff:lv => ({t:60, atkPct:+(lv * .03).toFixed(2), matkPct:+(lv * .03).toFixed(2)}), desc:lv => L(`60 วิ · ATK และ MATK +${lv * 3}% · ส่งให้ผู้เล่นรอบตัวด้วย`, `60s · ATK and MATK +${lv * 3}% · also reaches players around you`)};
clSet('ward', {req:{thread:1}}); clSet('holycircle', {req:{holywater:5}});
JOBS.physician.skills = ['royaltext', 'elixir', 'ward', 'tonic', 'holycircle'];
JOBS.physician.next = ['divinehealer'];
clJob('divinehealer', {name:'เวชบดีทิพย์', en:'Divine Physician', parent:'physician', hp:1.15, sp:9.5, delay:54, range:160, caster:true, stat:'INT · VIT',
  weapon:{name:'ไม้เท้าเวชบดีทิพย์', en:'Divine Physician Staff', atk:40, matk:200, type:'staff'}, skills:['divinehand', 'amrita', 'blessing', 'holylight']});
Object.assign(SKILLS, {
  divinehand:{job:'divinehealer', name:'หัตถ์ทิพย์', en:'Divine Hand', max:10, type:'passive', pas:lv => ({healPow:lv * .06, matkPct:lv * .02, spPct:lv * .02}),
    desc:lv => L(`ฟื้นแรงขึ้น ${lv * 6}% · MATK +${lv * 2}% · Max SP +${lv * 2}%`, `Healing +${lv * 6}% · MATK +${lv * 2}% · Max SP +${lv * 2}%`)},
  amrita:{job:'divinehealer', name:'น้ำอมฤต', en:'Amrita', short:'อมฤต', shortEn:'Amrita', max:10, type:'heal', sp:lv => 40 + lv * 3, cd:6, cast:() => 1.2, fx:'elixir', anim:'cast', act:'invoke', req:{divinehand:1},
    heal:lv => Math.round((300 + lv * 150 + DER.matk * lv * .8) * (1 + (DER.pas.healPow || 0))),
    desc:lv => L(`ฟื้น HP ${300 + lv * 150} + MATK · ต่อด้วยฟื้น HP 4% ทุก 2 วิ 10 วิ · ส่งให้ผู้เล่นรอบตัวด้วย`, `Restore ${300 + lv * 150} HP + MATK · then 4% HP every 2s for 10s · also reaches players around you`)},
  blessing:{job:'divinehealer', name:'พรเทวดา', en:"Deva's Blessing", short:'พรเทวดา', shortEn:'Bless', max:10, type:'buff', sp:() => 60, cd:60, cast:() => 1, fx:'goldshield', anim:'cast', act:'wai', req:{divinehand:3},
    buff:lv => ({t:60, def:lv * 6, atkPct:+(lv * .02).toFixed(2), matkPct:+(lv * .02).toFixed(2), aspdPct:+(lv * .015).toFixed(3)}),
    desc:lv => L(`60 วิ · DEF +${lv * 6} · ATK และ MATK +${lv * 2}% · ตีเร็วขึ้น ${+(lv * 1.5).toFixed(1)}% · ส่งให้ผู้เล่นรอบตัวด้วย`, `60s · DEF +${lv * 6} · ATK and MATK +${lv * 2}% · attacks ${+(lv * 1.5).toFixed(1)}% faster · also reaches players around you`)},
  holylight:{job:'divinehealer', name:'แสงแห่งชีวิต', en:'Light of Life', short:'แสงชีวิต', shortEn:'Light', max:10, type:'aoeTarget', elem:'holy', magic:true, sp:lv => 45 + lv * 3, cd:6, cast:() => 2, range:230, radius:120, fx:'herbStorm', anim:'cast', act:'invoke', req:{divinehand:5},
    hits:() => 5, every:.25, dmg:lv => .8 + lv * .14, desc:lv => L(`แสงศักดิ์สิทธิ์รอบเป้า 120 · 5 ครั้ง ครั้งละ ${pct(.8 + lv * .14)} MATK · ฟื้น HP ตัวเอง 3% ต่อครั้ง · ธาตุศักดิ์สิทธิ์`, `Holy light around the target (120) · 5 hits × ${pct(.8 + lv * .14)} MATK · heals you 3% per hit · Holy`)}
});
{ const _ex = execSkill;
  execSkill = function(id){ const r = _ex.apply(this, arguments);
    if (id === 'amrita') addBuff('amritaRegen', {t:10, regenPct:.04, every:2});
    if (id === 'holylight') for (let i = 0; i < 5; i++) later(.3 + i * .25, () => { if (!P.dead) S.hp = Math.min(DER.maxhp, S.hp + Math.round(DER.maxhp * .03)); });
    return r; }; }

/* ======================= อัญเชิญ: beasts ======================= */
clSet('sumlore', {pas:lv => ({sumAtk:lv * .06, sumDur:lv, sumMax:lv >= 10 ? 1 : 0}),
  desc:lv => L(`สัตว์อัญเชิญแรงขึ้น ${lv * 6}% · อยู่นานขึ้น ${lv} วิ${lv >= 10 ? ' · เรียกพร้อมกันได้ +1 ตัว' : ' · Lv 10: เรียกพร้อมกันได้ +1 ตัว'}`, `Summons +${lv * 6}% · last ${lv}s longer${lv >= 10 ? ' · +1 summon at once' : ' · Lv 10: +1 summon at once'}`)});
clSet('callkinnaree', {req:{sumlore:3}}); clSet('callnaga', {req:{sumlore:3}});
JOBS.summoner.skills = ['sumlore', 'callsingha', 'callnaga', 'callkinnaree', 'spiritburst'];
clSet('sovlore', {pas:lv => ({sumAtk:lv * .02, matkPct:lv * .01, sumMax:lv >= 10 ? 2 : lv >= 5 ? 1 : 0, sumDur:lv * 2}),
  desc:lv => L(`สัตว์อัญเชิญแรง +${lv * 2}% · MATK +${lv}% · อยู่นานขึ้น ${lv * 2} วิ · เรียกพร้อมกันได้ +${lv >= 10 ? 2 : lv >= 5 ? 1 : 0} ตัว (Lv 5: +1 · Lv 10: +2)`, `Summons +${lv * 2}% · MATK +${lv}% · last ${lv * 2}s longer · +${lv >= 10 ? 2 : lv >= 5 ? 1 : 0} summons at once (Lv 5: +1 · Lv 10: +2)`)});
clSet('callgaruda', {req:{}}); clSet('callerawan', {req:{callgaruda:3}}); clSet('unity', {req:{sovlore:5}}); clSet('royalbond', {req:{sovlore:5}});
JOBS.sovereign.skills = ['sovlore', 'callgaruda', 'callerawan', 'unity', 'royalbond'];
JOBS.sovereign.next = ['himmaemperor'];
clJob('himmaemperor', {name:'จักรพรรดิหิมพานต์', en:'Himmapan Emperor', parent:'sovereign', hp:1.15, sp:10, delay:54, range:160, caster:true, stat:'INT · DEX',
  weapon:{name:'คทาจักรพรรดิหิมพานต์', en:"Emperor's Sceptre", atk:40, matk:205, type:'staff'}, skills:['emperorgrace', 'royaledict', 'beastcharge', 'gatestorm']});
Object.assign(SKILLS, {
  emperorgrace:{job:'himmaemperor', name:'บารมีจักรพรรดิ', en:"Emperor's Grace", max:10, type:'passive', pas:lv => ({sumAtk:lv * .04, matkPct:lv * .02, sumDurPct:lv * .03, sumMax:lv >= 5 ? 1 : 0}),
    desc:lv => L(`สัตว์อัญเชิญแรงขึ้น ${lv * 4}% · MATK +${lv * 2}% · อยู่นานขึ้น ${lv * 3}%${lv >= 5 ? ' · เรียกพร้อมกันได้ +1 ตัว' : ' · Lv 5: เรียกพร้อมกันได้ +1 ตัว'}`, `Summons +${lv * 4}% · MATK +${lv * 2}% · last ${lv * 3}% longer${lv >= 5 ? ' · +1 summon at once' : ' · Lv 5: +1 summon at once'}`)},
  royaledict:{job:'himmaemperor', name:'ราชโองการ', en:'Royal Edict', short:'โองการ', shortEn:'Edict', max:10, type:'buff', sp:() => 50, cd:40, fx:'goldshield', anim:'cast', act:'invoke', req:{emperorgrace:1},
    buff:lv => ({t:45, sumAtkB:+(.1 + lv * .02).toFixed(2), sumHaste:+(lv * .03).toFixed(2), matkPct:+(lv * .02).toFixed(2)}),
    desc:lv => L(`45 วิ · สัตว์อัญเชิญแรง +${10 + lv * 2}% ตีเร็ว +${lv * 3}% · MATK +${lv * 2}% · ส่งให้ผู้เล่นรอบตัวด้วย`, `45s · summons +${10 + lv * 2}% damage, +${lv * 3}% speed · MATK +${lv * 2}% · also reaches players around you`)},
  beastcharge:{job:'himmaemperor', name:'ทัพหิมพานต์บุก', en:'Himmapan Charge', short:'ทัพบุก', shortEn:'Charge', max:10, type:'command', sp:lv => 35 + lv * 3, cd:5, fx:'conjure', anim:'cast', act:'point', req:{emperorgrace:3}, range:280,
    dmg:lv => 1 + lv * .2, desc:lv => L(`สัตว์อัญเชิญทุกตัวพุ่งใส่เป้าพร้อมกัน ตัวละ ${pct(1 + lv * .2)} MATK`, `Every summon charges your target at once, ${pct(1 + lv * .2)} MATK each`)},
  gatestorm:{job:'himmaemperor', name:'ประตูหิมพานต์ทลาย', en:'Himmapan Gate Storm', short:'ประตูทลาย', shortEn:'Gate', max:10, type:'aoeTarget', elem:'holy', magic:true, sp:lv => 60 + lv * 4, cd:7, cast:() => 2, range:240, radius:140, fx:'himmagate', anim:'cast', act:'invoke', req:{emperorgrace:5},
    hits:() => 5, every:.3, dmg:lv => .8 + lv * .12, desc:lv => L(`ประตูแสงเปิดกว้าง สัตว์หิมพานต์วิ่งผ่าน 5 ครั้ง รัศมี 140 ครั้งละ ${pct(.8 + lv * .12)} MATK · ธาตุศักดิ์สิทธิ์`, `A great gate of light, 5 charges through radius 140 × ${pct(.8 + lv * .12)} MATK · Holy`)}
});

/* ======================= shared: team buffs reach friends, poses, looks ======================= */
if (typeof AB !== 'undefined'){ AB.buff.push('bastion', 'tonic', 'blessing', 'royaledict'); AB.heal.push('amrita');
  Object.assign(AB_CAP, {dmgRed:.3, atkPct:.3, matkPct:.3, aspdPct:.2}); }
const CL_ACT = {stonespike:'point', earthrage:'invoke', solarfall:'invoke', deluge:'invoke', tempest:'point', earthswallow:'invoke', bastion:'guard', vanguard:'slam', judgement:'slam', eaglearrow:'attack'};
for (const id in CL_ACT) if (SKILLS[id]) SKILLS[id].act = CL_ACT[id];
const CL_LOOK = {
  bulwark:['warlord', {name:'ขุนพลปราการ', en:'Bulwark General', top:'steel', sleeve:'steel', forearm:'gold', pauldron:'gold', cape:'navy', capeTex:'gold', aura:'auraWhite', hair:'hairSilver'}],
  archsage:['astro', {name:'จอมเวทจตุธาตุ', en:'Elemental Archsage', top:'midnight', sleeve:'midnight', forearm:'gold', belt:'gold', aura:'auraGold', hair:'hairWhite', cape:'midnight', capeTex:'gold', crown:4}],
  ringlord:['grandmaster', {name:'เจ้าสังเวียน', en:'Lord of the Ring', aura:'auraGold', armband:'gold', belt:'gold', bootCuff:'gold'}],
  sylvan:['warden', {name:'จ้าวพนาไพร', en:'Sylvan Lord', aura:'auraGreen', cape:'jade', capeTex:'gold', armband:'gold', belt:'gold'}],
  divinehealer:['physician', {name:'เวชบดีทิพย์', en:'Divine Physician', aura:'auraWhite', top:'ivory', sleeve:'ivory', belt:'gold', armband:'gold', cape:'ivory', capeTex:'gold'}],
  himmaemperor:['sovereign', {name:'จักรพรรดิหิมพานต์', en:'Himmapan Emperor', aura:'auraViolet', belt:'gold', armband:'gold', cape:'plum', capeTex:'gold', crown:6}]
};
for (const j in CL_LOOK){ const [b, o] = CL_LOOK[j]; if (!SPR.CHARS[b]) continue; SPR.CHARS[j] = {...SPR.CHARS[b], ...o}; }
for (const j of ['blade', 'warlord', 'bulwark', 'rune', 'astro', 'archsage', 'muay', 'grandmaster', 'ringlord', 'ranger', 'warden', 'sylvan', 'healer', 'physician', 'divinehealer', 'summoner', 'sovereign', 'himmaemperor']){
  if (!JOBS[j] || !SPR.CHARS[j]) continue; const acts = new Set(SPR.CHAR_ACTIONS[j] || SPR.CHAR_ACTIONS[JOBS[j].parent] || []);
  for (let k = j; k; k = JOBS[k].parent) for (const id of JOBS[k].skills) if (SKILLS[id] && SKILLS[id].act) acts.add(SKILLS[id].act);
  SPR.CHAR_ACTIONS[j] = [...acts]; }
for (let i = 0; i < 11; i++){ for (const [p, a] of [['estaff', 'lstaff'], ['hstaff', 'lstaff'], ['sstaff', 'lstaff'], ['wbow', 'bow'], ['bsword', 'sword']]){ const id = `w_${p}${i}`; if (ITEMS[id] && ITEMS[`w_${a}${i}`]) ITEMS[id].artAs = `w_${a}${i}`; } }

/* ---------- skills that left a line: their points come back (once per character) ---------- */
const CL_GONE = ['charge', 'fieldregen', 'steadfast', 'diamondheart', 'relentless', 'warblood', 'laststand', 'warelephant',
  'barrier', 'blink', 'meditate', 'quickcast', 'insight', 'seal', 'navagraha',
  'ironshin', 'breath', 'sway', 'fighterheart', 'yuannet', 'sweep', 'ironbody2', 'calmfist',
  'spiketrap', 'reflex', 'callpet', 'poison', 'stealth', 'instinct', 'kingbond',
  'herbdart', 'herbblaze', 'smoke', 'resist', 'calm', 'yangnong', 'herbstorm', 'sleep', 'lifeelixir', 'toxiccloud', 'remedybody', 'mercy',
  'spiritlink', 'contract', 'soulbond', 'legion', 'himmagate', 'royalcommand', 'eternalpact'];
function clRefund(){
  if (!S || !S.skills) return; let back = 0;
  for (const id of CL_GONE) if (S.skills[id]){ back += S.skills[id] | 0; delete S.skills[id]; }
  if (S.hot) S.hot = S.hot.map(h => (CL_GONE.includes(h) ? null : h));
  if (back){ S.skPts = (S.skPts || 0) + back; dirty = true; setTimeout(() => toast(L(`ปรับสกิลอาชีพใหม่: คืน Skill Point ${back} แต้ม`, `Class skills reworked: ${back} Skill Points back`)), 1700); }
}
{ const _d = derive; derive = function(){ if (S && S.skills && !S._clDone){ S._clDone = 1; clRefund(); } return _d.apply(this, arguments); }; }
