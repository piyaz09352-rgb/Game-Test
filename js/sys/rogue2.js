/* VAYRATHEN — js/sys/rogue2.js — the thief line, second pass: single targets, one area skill, no repeated buffs
   นักย่อง   : มีดคู่ · จุดตาย · แทงหลัง · ระเบิดควัน (หายตัว) · พุ่งเงาจู่โจม (dash at the target)
   จอมโจรเงา : ใจเสือ · คมมีดเงา · อาบพิษอาวุธ (weapon turns Poison element) · ลอบสังหาร · ปามีดเงา (10 knives, 10 hits)
   พยัคฆ์เงา : เขี้ยวพยัคฆ์ · แยกร่างเงา (2 clones, 20 s, 80% of your power, use every skill and attack with you) · ประทับเงามรณะ · พายุมีดเงา (the only area skill, 10 hits)
   Buffs never repeat: one hide (smoke), one weapon coat (poison), one summon (clones).
   New element ธาตุพิษ (Poison): strong vs earth, weak vs holy, bad vs shadow; a poison weapon also poisons on hit. */
'use strict';

/* ---------- the Poison element ---------- */
if (!ELEM.includes('poison')){
  ELEM.push('poison'); ELEM_TH.poison = 'พิษ'; ELEM_EN.poison = 'Poison';
  for (const k in ETAB) ETAB[k].push(k === 'neutral' ? 100 : 100);
  ETAB.poison = [100, 125, 100, 100, 100, 75, 50, 50];   // (v27) poison on poison: 50% like every element on itself
  if (typeof GEARFX_COL !== 'undefined'){ GEARFX_COL.poison = '150,230,90'; GEARFX_ELEM.push('poison'); }
  if (typeof SD_ELEMS !== 'undefined') SD_ELEMS.push(['poison', 'พิษ', 'Poison']);
}

/* ---------- skills ---------- */
Object.assign(SKILLS, {
  shadowlunge:{job:'rogue', name:'พุ่งเงาจู่โจม', en:'Shadow Lunge', short:'พุ่งเงา', shortEn:'Lunge', max:10, type:'dash', sp:lv => 10 + lv, cd:4, range:200, fx:'charge', anim:'attack', act:'lunge', req:{backstab:1},
    dmg:lv => 1.8 + lv * .3, desc:lv => L(`พุ่งเข้าหาเป้าไกลสุด 200 · ${pct(1.8 + lv * .3)} ATK`, `Dash up to 200 at the target · ${pct(1.8 + lv * .3)} ATK`)},
  venomblade:{job:'bandit', name:'อาบพิษอาวุธ', en:'Venom Coat', short:'อาบพิษ', shortEn:'Venom', max:10, type:'buff', sp:() => 30, cd:30, fx:'poisonblade', anim:'skill', act:'crouch', req:{shadowedge:1},
    buff:lv => ({t:60, venom:1, venomPct:.04 + lv * .012}),
    desc:lv => L(`60 วิ · อาวุธเป็นธาตุพิษ · ตีโดนติดพิษ ${pct(.04 + lv * .012)} ATK/วิ 4 วิ (โอกาส 30%)`, `60s · weapon becomes Poison · hits poison for ${pct(.04 + lv * .012)} ATK/s for 4s (30% chance)`)},
  knifevolley:{job:'bandit', name:'ปามีดเงา', en:'Shadow Knife Volley', short:'ปามีด', shortEn:'Knives', max:10, type:'bolt', sp:lv => 20 + lv * 2, cd:3, range:260, fx:'dart', anim:'attack', act:'throw', req:{shadowedge:3},
    hits:() => 10, dmg:lv => .35 + lv * .06, desc:lv => L(`ปามีด 10 เล่มใส่เป้าเดียว ระยะ 260 · เล่มละ ${pct(.35 + lv * .06)} ATK`, `Throw 10 knives at one target, range 260 · ${pct(.35 + lv * .06)} ATK each`)},
  shadowclone:{job:'tigershade', name:'แยกร่างเงา', en:'Shadow Clones', short:'แยกร่าง', shortEn:'Clones', max:10, type:'buff', sp:() => 60, cd:30, fx:'smokeBomb', anim:'skill', act:'crouch', req:{tigerfang:3},
    buff:() => ({t:20, clone:1}),
    desc:lv => L(`แยกร่างโคลน 2 ร่าง 20 วิ · ไม่มีพลังชีวิต ไม่โดนตี · ใช้สกิลและตีตามร่างจริงทุกครั้ง ด้วยพลัง 80%`, `Split off 2 clones for 20s · no HP, can't be hit · they use every skill and attack along with you at 80% power`)}
});
Object.assign(SKILLS.shadowstorm, {hits:() => 10, every:.09, dmg:lv => .45 + lv * .05, desc:lv => L(`พายุมีดรอบตัว 90 · 10 ครั้ง ครั้งละ ${pct(.45 + lv * .05)} ATK · สกิลหมู่ตัวเดียวของสาย`, `Blade storm around you (90) · 10 hits × ${pct(.45 + lv * .05)} ATK · the line's only area skill`)});
Object.assign(SKILLS.deathmark, {req:{tigerfang:5}, dmg:lv => 7 + lv * .9, desc:lv => L(`ฟันเป้าเดียว ${pct(7 + lv * .9)} ATK · คริติคอลแน่นอนตอนพรางตัว`, `One target · ${pct(7 + lv * .9)} ATK · sure critical from hiding`)});
Object.assign(SKILLS.assassinate, {req:{smokebomb:3}});
JOBS.rogue.skills = ['dualwield', 'vitalspot', 'backstab', 'smokebomb', 'shadowlunge'];
JOBS.bandit.skills = ['tigerheart', 'shadowedge', 'venomblade', 'assassinate', 'knifevolley'];
JOBS.tigershade.skills = ['tigerfang', 'shadowclone', 'deathmark', 'shadowstorm'];
SKILLS.deathmark.act = 'crossslash';
for (const j of ['rogue', 'bandit', 'tigershade']){ const acts = new Set(SPR.CHAR_ACTIONS[j] || []); for (let k = j; k; k = JOBS[k].parent) for (const id of JOBS[k].skills) if (SKILLS[id] && SKILLS[id].act) acts.add(SKILLS[id].act); SPR.CHAR_ACTIONS[j] = [...acts]; }
/* points from the skills that left come back once */
const RG2_GONE = ['shadowstep', 'killerinstinct', 'thousand', 'twinshadow', 'tigerdance'];
{ const _d = derive; derive = function(){ if (S && S.skills && !S._rg2){ S._rg2 = 1; let back = 0; for (const id of RG2_GONE) if (S.skills[id]){ back += S.skills[id] | 0; delete S.skills[id]; }
    if (S.hot) S.hot = S.hot.map(h => (RG2_GONE.includes(h) ? null : h)); if (back){ S.skPts = (S.skPts || 0) + back; setTimeout(() => toast(L(`ปรับสกิลสายโจร: คืน Skill Point ${back} แต้ม`, `Thief skills reworked: ${back} Skill Points back`)), 1900); } }
  const r = _d.apply(this, arguments); if (DER && P.buffs && P.buffs.venomblade) DER.welem = 'poison'; return r; }; }
EV.on('tick', () => { if (!S || !DER) return; const v = !!(P.buffs && P.buffs.venomblade); if (v !== (DER.welem === 'poison')) derive(); });
HK.dmgAfter.push((m, res, sk) => { const b = P.buffs && P.buffs.venomblade; if (!b || !m || m.dead || !res || res.miss || res.poison || CLN.inner) return;
  if (Math.random() < .3) applyStatus(m, {poison:[b.venomPct || .05, 4]}); });

/* ---------- shadow clones ---------- */
const CLN = {list:[], inner:false};
const clonePow = () => .8;   // each clone works at 80% of your power
EV.on('tick', dt => {
  const on = !!(P.buffs && P.buffs.shadowclone);
  if (!on || P.dead){ if (CLN.list.length){ for (const c of CLN.list) VFX.play('smokeBomb', {x:c.x, y:c.y}); CLN.list = []; } return; }
  if (!CLN.list.length){ CLN.list = [{x:P.x - 26, y:P.y + 4, side:-1}, {x:P.x + 26, y:P.y + 4, side:1}]; for (const c of CLN.list) VFX.play('smokeBomb', {x:c.x, y:c.y}); }
  const t = P.target && !P.target.dead ? P.target : null;
  for (const c of CLN.list){
    const near = t && isFinite(t.x) && isFinite(t.y) && dist(P, t) < 120, tr = (t && t.def && +t.def.r) || 14;
    const gx = near ? t.x + c.side * (tr + 16) : P.x + c.side * 26, gy = near ? t.y + 6 : P.y + 4;
    const k = Math.min(1, dt * 9); c.x += (gx - c.x) * k; c.y += (gy - c.y) * k;
    if (!isFinite(c.x) || !isFinite(c.y) || Math.hypot(c.x - P.x, c.y - P.y) > 600){ c.x = P.x + c.side * 26; c.y = P.y + 4; }   // never lose a clone to a bad number
  }
});
/* every hit you land, each clone lands its own share (they copy normal attacks and skills alike) */
HK.dmgAfter.push((m, res, sk, hp0) => {
  if (CLN.inner || !CLN.list.length || !m || !res || res.miss || res.poison) return;
  const dealt = Math.max(0, (hp0 || 0) - Math.max(0, m.dead ? 0 : m.hp)) || res.dmg || 0; if (dealt <= 0) return;
  CLN.list.forEach((c, i) => later(.06 + i * .07, () => { if (m.dead) return; CLN.inner = true; try { applyDamage(m, {dmg:Math.max(1, Math.round(dealt * (m.pvp ? .2 : clonePow()))), clone:true}); } finally { CLN.inner = false; }   // in a duel a clone adds only 20%
    VFX.play('slashHit', {x:m.x + c.side * 6, y:m.y - MOB_H[m.type] * .5, gold:false}); }));
});
{ const _dp = drawPlayerW;
  drawPlayerW = function(g){
    if (CLN.list.length && !P.dead){ const sh = heroSheet(), act = P.act || 'idle';
      for (const c of CLN.list){ const x = c.x - cam.x, y = c.y - cam.y, d = P.target && !P.target.dead ? SPR.dirFromVec(P.target.x - c.x, P.target.y - c.y) : P.dir || 0;
        g.save(); g.globalAlpha = .55 + Math.sin(T * 5 + c.side) * .08; SPR.draw(g, sh, act, d, P.animT, x, y); g.restore();
        g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .18; SPR.draw(g, sh, act, d, P.animT, x, y); g.restore();
        g.save(); g.fillStyle = 'rgba(120,60,200,.25)'; g.beginPath(); g.ellipse(x, y, 10, 3.5, 0, 0, 7); g.fill(); g.restore(); } }
    return _dp.apply(this, arguments);
  };
}


/* the clones cast the same skill with you: same pose (they copy your animation) and the skill's effect from where they stand */
{ const _ex = execSkill;
  execSkill = function(id, lv, t){ const r = _ex.apply(this, arguments), sk = SKILLS[id];
    if (CLN.list.length && sk && id !== 'shadowclone' && !P.dead){
      CLN.list.forEach((c, i) => later(.05 + i * .06, () => { const tg = t && !t.dead ? t : P.target && !P.target.dead ? P.target : null, dir = tg ? SPR.dirFromVec(tg.x - c.x, tg.y - c.y) : P.dir || 0;
        if (sk.type === 'aoeSelf'){ VFX.play(sk.fx, {x:c.x, y:c.y, r:sk.radius, hits:sk.hits ? sk.hits(lv) : 1, every:sk.every || .12, lv});
          // the clone's own area: monsters around it that your storm does not reach take the clone's share too
          const n = sk.hits ? sk.hits(lv) : 1; for (let h = 0; h < n; h++) later(.08 + h * (sk.every || .12), () => { for (const m of mobs){ if (m.dead || m.pvp) continue;
            if (Math.hypot(m.x - c.x, m.y - c.y) > sk.radius + m.def.r || Math.hypot(m.x - P.x, m.y - P.y) <= sk.radius + m.def.r) continue;
            CLN.inner = true; try { applyDamage(m, physDamage(m, sk.dmg(lv) * clonePow()), sk); } finally { CLN.inner = false; } } }); }
        else if (sk.type === 'bolt' && tg) for (let k = 0; k < Math.min(5, sk.hits ? sk.hits(lv) : 1); k++) projs.push({k:sk.fx, x:c.x, y:c.y - 36, t:tg, delay:k * .1, speed:540, wob:Math.random() * 6, hit:() => {}});
        else if (sk.type === 'dash' && tg){ if (!isFinite(tg.x) || !isFinite(tg.y) || !isFinite(c.x) || !isFinite(c.y)) return; const d = Math.hypot(tg.x - c.x, tg.y - c.y) || 1; VFX.play('charge', {x:c.x, y:c.y, x2:tg.x - (tg.x - c.x) / d * 20, y2:tg.y - (tg.y - c.y) / d * 20}); c.x = tg.x - (tg.x - c.x) / d * 20; c.y = tg.y - (tg.y - c.y) / d * 20; }
        else if (tg && sk.fx) VFX.play(sk.fx, {x:c.x, y:c.y, tx:tg.x, ty:tg.y, dir, m:tg});
        else if (sk.fx && sk.type !== 'dash') VFX.play(sk.fx, {x:c.x, y:c.y}); }));
    }
    return r; }; }

/* ---------- the Shadow Tiger's dash replaces the blade storm (asked for: a dash at the target, 2 s cooldown) ---------- */
SKILLS.tigerpounce = {job:'tigershade', name:'พยัคฆ์พุ่งเงา', en:'Tiger Pounce', short:'พุ่งเงา', shortEn:'Pounce', max:10, type:'dash', sp:lv => 18 + lv, cd:2, range:240, fx:'charge', anim:'attack', act:'lunge', req:{tigerfang:1},
  dmg:lv => 3 + lv * .5, desc:lv => L(`พุ่งเข้าหาเป้าไกลสุด 240 · ${pct(3 + lv * .5)} ATK · คูลดาวน์ 2 วิ`, `Pounce up to 240 at the target · ${pct(3 + lv * .5)} ATK · 2s cooldown`)};
JOBS.tigershade.skills = ['tigerfang', 'shadowclone', 'deathmark', 'tigerpounce'];
{ const acts = new Set(SPR.CHAR_ACTIONS.tigershade || []); acts.add('lunge'); SPR.CHAR_ACTIONS.tigershade = [...acts]; }
{ const _d = derive; derive = function(){ if (S && S.skills && !S._rg3){ S._rg3 = 1; const back = S.skills.shadowstorm | 0; if (back){ delete S.skills.shadowstorm; S.skPts = (S.skPts || 0) + back; setTimeout(() => toast(L(`พายุมีดเงาเปลี่ยนเป็นพยัคฆ์พุ่งเงา: คืน Skill Point ${back} แต้ม`, `Shadow Storm became Tiger Pounce: ${back} Skill Points back`)), 2100); }
    if (S.hot) S.hot = S.hot.map(h => (h === 'shadowstorm' ? null : h)); } return _d.apply(this, arguments); }; }

/* ---------- no repeats in the thief line: one dash, and each passive does its own thing ----------
   นักย่อง   มีดคู่ (ATK, chance to strike twice) · จุดตาย (critical chance) · แทงหลัง · ระเบิดควัน · เฉือนเอ็น (hit + slow, replaces the T2 dash)
   จอมโจรเงา ใจเสือ (attack speed + critical damage) · คมมีดเงา (normal-attack damage) · อาบพิษอาวุธ · ลอบสังหาร · ปามีดเงา
   พยัคฆ์เงา เขี้ยวพยัคฆ์ (all damage +%) · แยกร่างเงา · ประทับเงามรณะ · พยัคฆ์พุ่งเงา (the line's only dash) */
SKILLS.hamstring = {job:'rogue', name:'เฉือนเอ็น', en:'Hamstring', short:'เฉือนเอ็น', shortEn:'Hamstring', max:10, type:'melee', sp:lv => 8 + lv, cd:3, fx:'shadowSlash', anim:'attack', act:'stab', req:{backstab:1},
  dmg:lv => 2 + lv * .3, st:lv => ({slow:[.2 + lv * .03, 4]}), desc:lv => L(`${pct(2 + lv * .3)} ATK · เป้าช้าลง ${20 + lv * 3}% 4 วิ`, `${pct(2 + lv * .3)} ATK · target slowed ${20 + lv * 3}% for 4s`)};
JOBS.rogue.skills = ['dualwield', 'vitalspot', 'backstab', 'smokebomb', 'hamstring'];
Object.assign(SKILLS.dualwield, {pas:lv => ({daggerAtk:lv * 3, dbl:lv * .02}), desc:lv => L(`ATK +${lv * 3} · โอกาสตี 2 ครั้ง ${lv * 2}%`, `ATK +${lv * 3} · ${lv * 2}% chance to strike twice`)});
Object.assign(SKILLS.vitalspot, {pas:lv => ({crit:lv * 1.5}), desc:lv => L(`โอกาสคริติคอล +${+(lv * 1.5).toFixed(1)}%`, `Critical chance +${+(lv * 1.5).toFixed(1)}%`)});
Object.assign(SKILLS.tigerheart, {pas:lv => ({aspdPct:lv * .02, critDmg:lv * .05}), desc:lv => L(`ตีเร็วขึ้น ${lv * 2}% · ดาเมจคริติคอล +${lv * 5}%`, `Attacks ${lv * 2}% faster · critical damage +${lv * 5}%`)});
Object.assign(SKILLS.shadowedge, {pas:lv => ({autoPct:lv * .04}), desc:lv => L(`ตีปกติแรงขึ้น ${lv * 4}%`, `Normal attacks +${lv * 4}%`)});
Object.assign(SKILLS.tigerfang, {pas:lv => ({allDmg:lv * .04}), desc:lv => L(`ดาเมจทุกแบบ +${lv * 4}%`, `All damage +${lv * 4}%`)});
HK.outMul.push((mult, elem, kind) => (kind === 'phys' && DER && DER.pas && DER.pas.allDmg ? mult * (1 + DER.pas.allDmg) : mult));
// the Shadow Tiger keeps its short dash name, the Rogue's slot now holds Hamstring
SKILLS.tigerpounce.short = 'พุ่งพยัคฆ์'; SKILLS.tigerpounce.shortEn = 'Pounce';
{ const _d = derive; derive = function(){ if (S && S.skills && !S._rg4){ S._rg4 = 1; const back = S.skills.shadowlunge | 0; if (back){ delete S.skills.shadowlunge; S.skPts = (S.skPts || 0) + back; setTimeout(() => toast(L(`พุ่งเงาจู่โจมเปลี่ยนเป็นเฉือนเอ็น: คืน Skill Point ${back} แต้ม`, `Shadow Lunge became Hamstring: ${back} Skill Points back`)), 2300); }
    if (S.hot) S.hot = S.hot.map(h => (h === 'shadowlunge' ? null : h)); } return _d.apply(this, arguments); }; }
