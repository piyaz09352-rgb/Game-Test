/* VAYRATHEN — js/sys/rogueline.js — the thief line, reworked: normal attacks and critical hits
   นักย่อง (Rogue, tier 2) → จอมโจรเงา (Shadow Bandit, tier 3) → พยัคฆ์เงา (Shadow Tiger, tier 4, new)
   The whole line is built around NORMAL ATTACKS and CRITICAL HITS, so it is easy to play: put points into the
   passives, keep the one buff up, and just hit. A thief's normal attack is clearly stronger than a villager's.
   New stat keys used here (also usable by any gear or buff later):
     autoPct   — normal attacks deal +x% damage          autoExtra — each normal attack adds a shadow hit of x × ATK
     aspdPct   — attacks x% faster (fixed in player.js: attack-speed buffs used to do nothing)
   Tier 4 opens at Job Lv 50 of the tier-3 class and Base Lv 150, at Master Vayra.
   Few skills per tier (5 · 5 · 4), each one worth using. Points in skills that were taken out are given back.
   The line can wear มีดคู่ (twin daggers): a two-handed weapon with a blade in each hand, more ATK and Crit,
   +10% chance to strike twice; and two new poses: ฟันกากบาท (X cut) and หมุนมีดคู่ (twin spin). */
'use strict';

/* ---------- the normal-attack bonus ---------- */
const AUTO = {t:-9};
{ const _ba = basicAttack;
  basicAttack = function(t){
    AUTO.t = T;
    const r = _ba.apply(this, arguments);
    const ex = (DER.pas.autoExtra || 0) + buffSum('autoExtra');
    if (ex > 0 && t && !t.dead) later(.09, () => { if (t.dead) return; AUTO.t = T; applyDamage(t, physDamage(t, ex)); VFX.play('slashHit', {x:t.x + 6, y:t.y - MOB_H[t.type] * .5, gold:false}); });
    return r;
  };
}
{ const _ex = execSkill; execSkill = function(){ AUTO.t = -9; return _ex.apply(this, arguments); }; }
HK.outMul.push((mult, elem, kind) => (kind === 'phys' && T - AUTO.t < .3 ? mult * (1 + (DER.pas.autoPct || 0) + buffSum('autoPct')) : mult));

/* ---------- tier 2 · นักย่อง ---------- */
Object.assign(SKILLS.dualwield, {pas:lv => ({daggerAtk:lv * 2, autoPct:lv * .02, dbl:lv * .02}),
  desc:lv => L(`ATK +${lv * 2} · ตีปกติแรงขึ้น ${lv * 2}% · โอกาสตี 2 ครั้ง ${lv * 2}%`, `ATK +${lv * 2} · normal attacks +${lv * 2}% · ${lv * 2}% chance to strike twice`)});
SKILLS.vitalspot = {job:'rogue', name:'จุดตาย', en:'Vital Spot', max:10, type:'passive', pas:lv => ({crit:lv, critDmg:lv * .04}),
  desc:lv => L(`โอกาสคริติคอล +${lv}% · ดาเมจคริติคอล +${lv * 4}%`, `Critical chance +${lv}% · critical damage +${lv * 4}%`)};
Object.assign(SKILLS.lightfoot, {pas:lv => ({move:lv * .05, flee:lv * 2, aspdPct:lv * .03}),
  desc:lv => L(`ความเร็วเดิน +${lv * 5}% · FLEE +${lv * 2} · ตีเร็วขึ้น ${lv * 3}%`, `Move speed +${lv * 5}% · FLEE +${lv * 2} · attacks ${lv * 3}% faster`)});
Object.assign(SKILLS.dualwield, {pas:lv => ({daggerAtk:lv * 2, autoPct:lv * .02, dbl:lv * .02, aspdPct:lv * .01}),
  desc:lv => L(`ATK +${lv * 2} · ตีปกติแรงขึ้น ${lv * 2}% · ตีเร็วขึ้น ${lv}% · โอกาสตี 2 ครั้ง ${lv * 2}%`, `ATK +${lv * 2} · normal attacks +${lv * 2}% · ${lv}% faster · ${lv * 2}% chance to strike twice`)});
Object.assign(SKILLS.smokebomb, {max:10, buff:lv => ({stealth:1, sureCrit:1, t:2 + Math.ceil(lv / 2)}), desc:lv => L(`หายตัว ${2 + Math.ceil(lv / 2)} วิ · นัดแรกคริติคอลแน่นอน`, `Vanish for ${2 + Math.ceil(lv / 2)}s · first hit is a sure critical`)});
Object.assign(SKILLS.shadowstep, {max:10, dist:lv => 50 + lv * 9, desc:lv => L(`วาร์ป ${50 + lv * 9} ไปทางที่หัน`, `Teleport ${50 + lv * 9} where you face`)});
JOBS.rogue.skills = ['dualwield', 'vitalspot', 'backstab', 'smokebomb', 'shadowstep'];

/* ---------- tier 3 · จอมโจรเงา ---------- */
Object.assign(SKILLS.tigerheart, {pas:lv => ({crit:lv, critDmg:lv * .05}), desc:lv => L(`โอกาสคริติคอล +${lv}% · ดาเมจคริติคอล +${lv * 5}%`, `Critical chance +${lv}% · critical damage +${lv * 5}%`)});
SKILLS.shadowedge = {job:'bandit', name:'คมมีดเงา', en:'Shadow Edge', max:10, type:'passive', pas:lv => ({autoPct:lv * .03, dbl:lv * .01}),
  desc:lv => L(`ตีปกติแรงขึ้น ${lv * 3}% · โอกาสตี 2 ครั้ง +${lv}%`, `Normal attacks +${lv * 3}% · +${lv}% chance to strike twice`)};
SKILLS.killerinstinct = {job:'bandit', name:'สัญชาตญาณนักฆ่า', en:"Killer's Instinct", short:'นักฆ่า', shortEn:'Instinct', max:5, type:'buff', sp:() => 30, cd:40, fx:'ramwai', anim:'skill', req:{tigerheart:3},
  buff:lv => ({t:20 + lv * 2, aspdPct:lv * .04, crit:lv * 3}),
  desc:lv => L(`${20 + lv * 2} วิ · ตีเร็วขึ้น ${lv * 4}% · โอกาสคริติคอล +${lv * 3}%`, `${20 + lv * 2}s · attacks ${lv * 4}% faster · critical chance +${lv * 3}%`)};
Object.assign(SKILLS.killerinstinct, {max:10, buff:lv => ({t:20 + lv, aspdPct:lv * .02, crit:Math.round(lv * 1.5)}),
  desc:lv => L(`${20 + lv} วิ · ตีเร็วขึ้น ${lv * 2}% · โอกาสคริติคอล +${Math.round(lv * 1.5)}%`, `${20 + lv}s · attacks ${lv * 2}% faster · critical chance +${Math.round(lv * 1.5)}%`)});
Object.assign(SKILLS.assassinate, {max:10, dmg:lv => 4 + lv * .45, req:{smokebomb:3}, desc:lv => L(`${pct(4 + lv * .45)} ATK · คริติคอลแน่นอนตอนพรางตัว`, `${pct(4 + lv * .45)} ATK · sure critical from hiding`)});
Object.assign(SKILLS.thousand, {req:{backstab:5}});
JOBS.bandit.skills = ['tigerheart', 'shadowedge', 'killerinstinct', 'assassinate', 'thousand'];
JOBS.bandit.next = ['tigershade'];

/* ---------- tier 4 · พยัคฆ์เงา (new) ---------- */
JOBS.tigershade = {tier:4, name:'พยัคฆ์เงา', en:'Shadow Tiger', parent:'bandit', hp:1.2, sp:3.6, delay:30, range:26, ranged:false, jobMax:50, stat:'AGI · DEX · LUK',
  weapon:{name:'กรงเล็บพยัคฆ์เงาคู่', en:'Twin Shadow Tiger Claws', atk:150, type:'dagger'},
  skills:['tigerfang', 'twinshadow', 'tigerdance', 'shadowstorm']};
Object.assign(SKILLS, {
  tigerfang:{job:'tigershade', name:'เขี้ยวพยัคฆ์', en:'Tiger Fang', max:10, type:'passive', pas:lv => ({autoPct:lv * .04, critDmg:lv * .04}),
    desc:lv => L(`ตีปกติแรงขึ้น ${lv * 4}% · ดาเมจคริติคอล +${lv * 4}%`, `Normal attacks +${lv * 4}% · critical damage +${lv * 4}%`)},
  twinshadow:{job:'tigershade', name:'เงาแฝด', en:'Twin Shadow', max:10, type:'passive', req:{tigerfang:3}, pas:lv => ({autoExtra:lv * .05}),
    desc:lv => L(`ทุกครั้งที่ตีปกติ เงาของคุณฟันซ้ำอีก ${lv * 5}% ATK`, `Every normal attack, your shadow strikes again for ${lv * 5}% ATK`)},
  tigerdance:{job:'tigershade', name:'ระบำพยัคฆ์', en:'Tiger Dance', short:'ระบำพยัคฆ์', shortEn:'Dance', max:10, type:'buff', sp:() => 40, cd:60, fx:'ramwai', anim:'skill', req:{tigerfang:5},
    buff:lv => ({t:25, autoPct:lv * .05, crit:lv * 2, aspdPct:lv * .015}),
    desc:lv => L(`25 วิ · ตีปกติแรงขึ้น ${lv * 5}% · โอกาสคริติคอล +${lv * 2}% · ตีเร็วขึ้น ${Math.round(lv * 1.5)}%`, `25s · normal attacks +${lv * 5}% · critical chance +${lv * 2}% · attacks ${Math.round(lv * 1.5)}% faster`)},
  deathmark:{job:'tigershade', name:'ประทับเงามรณะ', en:'Death Mark', short:'มรณะ', shortEn:'Mark', max:10, type:'melee', sp:lv => 40 + lv * 2, cd:10, fx:'assassinate', anim:'attack',
    dmg:lv => 6 + lv * .8, desc:lv => L(`${pct(6 + lv * .8)} ATK · คริติคอลแน่นอนตอนพรางตัว`, `${pct(6 + lv * .8)} ATK · sure critical from hiding`)},
  shadowstorm:{job:'tigershade', name:'พายุมีดเงา', en:'Shadow Storm', short:'พายุมีด', shortEn:'Storm', max:10, type:'aoeSelf', sp:lv => 40 + lv * 2, cd:10, radius:90, fx:'bladestorm', anim:'attack', req:{tigerfang:3},
    hits:() => 8, every:.1, dmg:lv => .7 + lv * .07, desc:lv => L(`รอบตัว 90 · 8 ครั้ง ครั้งละ ${pct(.7 + lv * .07)} ATK`, `Around you (90) · 8 hits × ${pct(.7 + lv * .07)} ATK`)},
  phantomstep:{job:'tigershade', name:'เงาพริ้ว', en:'Phantom Step', max:5, type:'passive', pas:lv => ({dodge:lv * .02, flee:lv * 5}),
    desc:lv => L(`หลบสมบูรณ์ +${lv * 2}% · FLEE +${lv * 5}`, `Perfect Dodge +${lv * 2}% · FLEE +${lv * 5}`)}
});
/* look: a black-and-gold tiger hunter with a gold aura (its own figure, not a costume) */
SPR.CHARS.tigershade = {...SPR.CHARS.bandit, name:'พยัคฆ์เงา', en:'Shadow Tiger', hair:'hairOrange', iris:'irisGd', top:'midnight', sleeve:'midnight', armband:'gold', bootCuff:'gold', belt:'gold',
  aura:'auraGold', cape:'tigerFur', capeTex:'tiger', crown:6, spikes:24, spikeLen:6.4, topTex:n => (n[1] > .44 ? {m:SPR.M.gold} : Math.abs(n[0]) < .04 && n[1] > -.4 ? {m:SPR.M.tigerFur} : undefined)};
/* poses: the twin-dagger cuts */
Object.assign(SKILLS.backstab, {act:'crossslash'}); Object.assign(SKILLS.assassinate, {act:'crossslash'}); Object.assign(SKILLS.thousand, {act:'twinspin'}); Object.assign(SKILLS.shadowstorm, {act:'twinspin'});
for (const j of ['rogue', 'bandit', 'tigershade']){ const acts = new Set(); for (let k = j; k; k = JOBS[k].parent) for (const id of JOBS[k].skills) if (SKILLS[id] && SKILLS[id].act) acts.add(SKILLS[id].act);
  SPR.CHAR_ACTIONS[j] = [...new Set([...(SPR.CHAR_ACTIONS.bandit || []), ...acts])]; }

/* ---------- tier 4 requirement: Base Lv 150 ---------- */
{ const _jb = jobChangeBlock;
  jobChangeBlock = function(){ const j = JOBS[S.job]; if (j.tier === 3 && j.next && S.jlvl >= j.jobMax && S.lvl < 150) return L(`ต้องถึง Base Lv 150 (ตอนนี้ ${S.lvl})`, `Reach Base Lv 150 (now ${S.lvl})`); return _jb.apply(this, arguments); };
}

/* ---------- Auto for the thief line: steal skills are not attacks, hiding first, then hit ---------- */
{ const _bs = botSet;
  botSet = function(){ const b = _bs.apply(this, arguments);
    if (!b._rogueFix){ b._rogueFix = 1; for (const e of b.list) if (SKILLS[e.id] && SKILLS[e.id].type === 'steal') e.on = false; }
    for (const e of b.list) if (!e._seen){ e._seen = 1; if (SKILLS[e.id] && SKILLS[e.id].type === 'steal') e.on = false; }
    return b; };
}

/* ---------- skills that left the line: their points come back (once per character) ---------- */
const RL_GONE = ['lightfoot', 'poisonblade', 'pickpocket', 'treasure', 'cunning', 'kunai', 'shadowbody', 'sneak', 'plunder', 'tigerleap', 'deathmark', 'phantomstep'];
function rlRefund(){
  if (!S || !S.skills) return; let back = 0;
  for (const id of RL_GONE) if (S.skills[id]){ back += S.skills[id] | 0; delete S.skills[id]; }
  if (S.hot) S.hot = S.hot.map(h => (RL_GONE.includes(h) ? null : h));
  if (back){ S.skPts = (S.skPts || 0) + back; dirty = true; setTimeout(() => toast(L(`ปรับสกิลสายโจร: คืน Skill Point ${back} แต้ม`, `Thief skills reworked: ${back} Skill Points back`)), 1500); }
}
{ const _d = derive; derive = function(){ if (S && S.skills && !S._rlDone){ S._rlDone = 1; rlRefund(); } return _d.apply(this, arguments); }; }

/* ---------- twin daggers: thief line only; +10% chance to strike twice ---------- */
const isTwin = it => !!(it && it.st && it.st.wtype === 'dagger' && it.st.hands === '2h');
{ const _d = derive; derive = function(){ const r = _d.apply(this, arguments); const it = typeof wornWeapon === 'function' ? wornWeapon() : null; if (DER && isTwin(it)) DER.pas.dbl = (DER.pas.dbl || 0) + .1; return r; }; }
