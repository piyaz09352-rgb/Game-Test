/* VAYRATHEN — js/sys/ranger193.js — (v193) the hunter line, reworked the way the owner laid it out
   Removed (their skill points come back to spend again): ยิงรัว · ใจผูกสัตว์ (พราน) · ศรไฟป่า · ศรตรึงร่าง · เสือสาง ·
   ทุ่งบ่วงไพร (พรานพงไพร) · พันศรพงไพร · ศรทะลวงฟ้า (จ้าวพนาไพร).
   พราน      ศรคู่ = two arrows that land as ONE number in its own colour ("×2") · ตาเหยี่ยว = longer reach ·
             ฝนธนู = wider · สมาธิพราน = + DEX · ถอยยิง = the next shot is a sure critical at 2× ATK ·
             กับดักหนาม = holds its prey in place longer
   พรานพงไพร ธนูรัว = a passive: + AGI and up to 20% faster shots · ตาพญาเหยี่ยว = normal shots +20% and splash
             3 monsters around the target · ศรทะลวงไพร = also breaks armour (DEF −50% for 5 s) ·
             สหายป่า = your caught pet, if it is an animal (เผ่าสัตว์), gets ATK and HP +50%
   จ้าวพนาไพร สายเลือดพงไพร = ATK +10%, HIT and move speed · สัญญาณล่าฝูง = vanish for 10 s ·
             ศรพญาอินทรี = the target takes 30% more damage for 10 s · พายุศรอสนี = 10 volleys ·
             กับดักรากไม้ = roots everything in the area and makes it bleed, no hit damage
   Bosses shrug off holds and debuffs as everywhere else in the game. */
'use strict';
const RG193_DROP = {ranger:['rapidfire', 'beastbond'], warden:['firerain', 'pinarrow', 'tiger', 'snarefield'], sylvan:['thousandarrows', 'heavenpiercer']};
const RG193_GONE = Object.values(RG193_DROP).flat();
for (const [j, ids] of Object.entries(RG193_DROP)) if (JOBS[j]) JOBS[j].skills = JOBS[j].skills.filter(id => !ids.includes(id));
/* points spent on a removed skill come back; it leaves the hotbar */
function rg193Refund(){ if (!S || !S.skills) return; let n = 0;
  for (const id of RG193_GONE) if (S.skills[id]){ n += S.skills[id]; delete S.skills[id]; }
  if (Array.isArray(S.hot)) S.hot = S.hot.map(h => (RG193_GONE.includes(h) ? null : h));
  if (n){ S.skPts = (S.skPts || 0) + n; derive(); dirty = true; if (typeof renderHotbar === 'function') renderHotbar();
    if (typeof log === 'function') log(L(`สกิลพรานปรับใหม่: คืน ${n} แต้มสกิลจากสกิลที่ถูกนำออก`, `Hunter skills reworked: ${n} skill points returned from removed skills`), 'g'); } }
EV.on('tick', () => { if ((rg193Refund.t = (rg193Refund.t || 0) + 1) % 30 === 0) rg193Refund(); });
// also whenever stats are worked out (loading a hero, a job change), so it never waits on the game loop
{ const _d0 = derive; derive = function(){ if (S && S.skills && !rg193Refund.busy && RG193_GONE.some(id => S.skills[id])){ rg193Refund.busy = 1; try { rg193Refund(); } finally { rg193Refund.busy = 0; } } return _d0.apply(this, arguments); }; }

const SKD = (id, o) => { const s = SKILLS[id]; if (s) Object.assign(s, o); };
const pctS = v => Math.round(v * 100) + '%';
/* ---------- พราน ---------- */
SKD('doubleshot', {hits:() => 1, dmg:lv => (.7 + lv * .08) * 2,
  desc:lv => L(`ยิง 2 ดอกพร้อมกัน รวมเป็นดาเมจเดียว ${pctS((.7 + lv * .08) * 2)} ATK · ตัวเลขสีฟ้า ×2`, `Two arrows at once, landing as one hit for ${pctS((.7 + lv * .08) * 2)} ATK · shown in blue ×2`)});
SKD('hawkeye', {pas:lv => ({dex:lv, range:lv * 15}),
  desc:lv => L(`DEX +${lv} · ระยะยิง +${lv * 15}`, `DEX +${lv} · range +${lv * 15}`)});
SKD('arrowrain', {radius:110, desc:lv => L(`ฝนธนูรอบเป้า กว้าง 110 · ${SKILLS.arrowrain.hits(lv)} ครั้ง ครั้งละ ${pctS(SKILLS.arrowrain.dmg(lv))} ATK`, `Arrows rain in a wide 110 circle · ${SKILLS.arrowrain.hits(lv)} volleys of ${pctS(SKILLS.arrowrain.dmg(lv))} ATK`)});
SKD('hunterfocus', {buff:lv => ({t:60, aspdPct:+(lv * .015).toFixed(3), crit:lv, dexUp:lv * 2}),
  desc:lv => L(`60 วิ · DEX +${lv * 2} · ตีเร็วขึ้น ${pctS(lv * .015)} · CRIT +${lv}`, `60 s · DEX +${lv * 2} · ${pctS(lv * .015)} faster · CRIT +${lv}`)});
SKD('backstep', {buff:lv => ({t:8, nextShot:2, sureCrit:1}),
  desc:lv => L(`กระโดดถอยหลัง · นัดถัดไปติดคริ 100% แรง 2 เท่าของ ATK`, `Leap back · your next shot is a sure critical at 2× ATK`)});
SKD('spiketrap', {root:lv => 2 + lv * .3,
  desc:lv => L(`วางกับดัก ${pctS(SKILLS.spiketrap.dmg(lv))} ATK · หยุดการเคลื่อนที่ ${(2 + lv * .3).toFixed(1)} วิ · วางได้ 2 อัน`, `A trap: ${pctS(SKILLS.spiketrap.dmg(lv))} ATK · holds its prey in place ${(2 + lv * .3).toFixed(1)} s · 2 at a time`)});
/* ---------- พรานพงไพร ---------- */
SKD('mountedarcher', {type:'passive', kind:'passive', pas:lv => ({aspdPct:lv * .02, agiUp:lv * 2}), cd:0,
  desc:lv => L(`ติดตัว · AGI +${lv * 2} · ยิงเร็วขึ้น ${pctS(lv * .02)} (สูงสุด 20%)`, `Passive · AGI +${lv * 2} · ${pctS(lv * .02)} faster shots (up to 20%)`)});
SKD('deadeye', {pas:lv => ({autoPct:lv * .02, splash3:1}),
  desc:lv => L(`ยิงปกติแรงขึ้น ${pctS(lv * .02)} · กระจายโดนรอบเป้าอีก 3 ตัว (50% ของดาเมจ)`, `Normal shots +${pctS(lv * .02)} · splash 3 monsters around the target (50% of the hit)`)});
SKD('pierce', {desc:lv => L(`ศรทะลุทุกตัวในแนว 260 · ${pctS(SKILLS.pierce.dmg(lv))} ATK · ลดเกราะเป้า 50% 5 วิ`, `Pierces everything in a 260 line · ${pctS(SKILLS.pierce.dmg(lv))} ATK · DEF −50% for 5 s`)});
SKD('wildkin', {pas:lv => ({wildkin:lv}),
  desc:lv => L(`สัตว์เลี้ยงที่จับมาเผ่าสัตว์ ATK และ HP +${lv * 5}% (เผ่าอื่นไม่ได้)`, `A caught pet of the animal race gets ATK and HP +${lv * 5}% (other races do not)`)});
/* ---------- จ้าวพนาไพร ---------- */
SKD('forestblood', {pas:lv => ({atkPct:lv * .01, hitUp:lv * 4, moveUp:lv * .01}),
  desc:lv => L(`ATK +${lv}% · ความแม่นยำ +${lv * 4} · เดินเร็วขึ้น ${lv}%`, `ATK +${lv}% · HIT +${lv * 4} · ${lv}% faster on foot`)});
SKD('packcall', {buff:lv => ({t:10}), cd:30,
  desc:lv => L(`หายตัว 10 วิ (มอนมองไม่เห็น · โจมตีแล้วปรากฏตัว)`, `Vanish for 10 s (monsters lose you · attacking reveals you)`)});
SKD('eaglearrow', {st2:null, desc:lv => L(`3 ดอก ดอกละ ${pctS(SKILLS.eaglearrow.dmg(lv))} ATK · เป้ารับดาเมจมากขึ้น 30% นาน 10 วิ`, `3 arrows of ${pctS(SKILLS.eaglearrow.dmg(lv))} ATK · the target takes 30% more damage for 10 s`)});
SKD('stormvolley', {hits:() => 10, desc:lv => L(`ฝนศรสายฟ้ารอบเป้า 120 · 10 ครั้ง ครั้งละ ${pctS(SKILLS.stormvolley.dmg(lv))} ATK · ธาตุลม · ช็อต`, `Thunder arrows in a 120 circle · 10 volleys of ${pctS(SKILLS.stormvolley.dmg(lv))} ATK · wind · shock`)});
SKD('rootsnare', {st:lv => ({root:2 + lv * .3, poison:[.15 + lv * .02, 6]}),
  desc:lv => L(`รากไม้รัดทุกตัวในวง 110 · หยุดการเคลื่อนไหว ${(2 + lv * .3).toFixed(1)} วิ · เลือดไหล 6 วิ · ไม่มีดาเมจตอนรัด`, `Roots everything in a 110 circle · held ${(2 + lv * .3).toFixed(1)} s · bleeds for 6 s · no hit damage`)});

/* ---------- the mechanics behind them ---------- */
const rgSk = id => (S && S.skills && SKILLS[id] && jobChain().includes(SKILLS[id].job) ? S.skills[id] || 0 : 0);
// AGI (ธนูรัว) and DEX (สมาธิพราน) count like real stat points; HIT and move speed (สายเลือดพงไพร) on top
{ const _d = derive; derive = function(){
    const agi = rgSk('mountedarcher') * 2, dex = P.buffs && P.buffs.hunterfocus && P.buffs.hunterfocus.dexUp || 0;
    if (S && S.stats){ S.stats.agi += agi; S.stats.dex += dex; }
    let r; try { r = _d.apply(this, arguments); } finally { if (S && S.stats){ S.stats.agi -= agi; S.stats.dex -= dex; } }
    const fb = rgSk('forestblood'); if (DER && fb){ DER.hit += fb * 4; DER.move = (DER.move || 1) * (1 + fb * .01); }
    return r; }; }
// the buff changes AGI/DEX: recompute when it starts and ends
{ let was = 0; EV.on('tick', () => { const v = P.buffs && P.buffs.hunterfocus ? 1 : 0; if (v !== was){ was = v; derive(); } }); }
// ถอยยิง: the next shot after the leap is a sure critical
{ const _ba = basicAttack; basicAttack = function(t){
    if (P.buffs && P.buffs.backstep && P.buffs.backstep.sureCrit) P._rgSure = T;
    const n0 = projs.length, r = _ba.apply(this, arguments);
    // ตาพญาเหยี่ยว: a normal shot splashes up to 3 monsters around its target for half its damage
    if (rgSk('deadeye') && t) for (let i = n0; i < projs.length; i++){ const p = projs[i]; if (p.k !== 'arrow' || p._rgSplash) continue; p._rgSplash = 1; const h = p.hit;
      p.hit = () => { h(); const near = mobs.filter(o => o !== t && !o.dead && Math.hypot(o.x - t.x, o.y - t.y) < 70 + o.def.r).slice(0, 3);
        for (const o of near){ const res = physDamage(o, .5); applyDamage(o, res); } if (near.length) VFX.play('arrowHit', {x:t.x, y:t.y - MOB_H[t.type] * .5, elem:DER.welem}); }; }
    return r; }; }
{ const _p = physDamage; physDamage = function(m){
    if (P._rgSure != null && T - P._rgSure < 2 && DER){ P._rgSure = null; const c0 = DER.crit; DER.crit = 9999; try { return _p.apply(this, arguments); } finally { DER.crit = c0; } }
    return _p.apply(this, arguments); }; }
// ศรคู่: a second arrow flies beside the first (it carries no damage: the first one lands the whole hit)
{ const _ex = execSkill; execSkill = function(id, lv, t){ const n0 = projs.length, r = _ex.apply(this, arguments);
    if (id === 'doubleshot' && t && projs.length > n0){ const p = projs[n0]; projs.push({...p, x:p.x + 6, y:p.y - 6, delay:(p.delay || 0) + .05, hit:() => {}}); }
    if (id === 'packcall' && typeof addBuff === 'function'){ addBuff('stealth', {t:10}); for (const m of mobs) if (m.aggro && !m.def.boss){ m.aggro = false; m.tx = m.hx; m.ty = m.hy; } }
    return r; }; }
// hit effects: ศรคู่ number style · ศรทะลวงไพร armour break · ศรพญาอินทรี mark · กับดักรากไม้ no hit damage
const RG_VULN = 1.3;
{ const _at = addText; let dbl = false;
  addText = function(x, y, s, col, size){ if (dbl && /^\d/.test(String(s))){ s = String(s) + ' ×2'; col = '#6fe3ff'; size = (size || 16) + 4; dbl = false; } return _at.call(this, x, y, s, col, size); };
  const _ad = applyDamage; applyDamage = function(m, res, sk){
    const id = sk && sk.id;
    if (m && !m.dead && res && !res.poison){
      if (id === 'rootsnare'){ m.aggro = true; return; }
      if (m.vulnT > T && res.dmg > 0) res = {...res, dmg:Math.round(res.dmg * RG_VULN)};
    }
    if (id === 'doubleshot' && res && !res.miss) dbl = true;
    const r = _ad.call(this, m, res, sk); dbl = false;
    if (m && !m.dead && res && !res.miss){
      if (id === 'pierce') applyStatus(m, {defDown:[.5, 5]});
      if (id === 'eaglearrow' && !m.def.boss){ m.vulnT = T + 10; if (T - (m._vulnTxT || -9) > 1){ m._vulnTxT = T; addText(m.x, m.y - MOB_H[m.type] - 30, L('รับดาเมจ +30%', 'Marked +30%'), '#ffb46a', 12); } }
    }
    return r; }; }
// สหายป่า: an animal pet (race brute) gets ATK and HP +5% a level
function rgWildkin(){ const p = typeof PD === 'function' ? PD() : null; if (!p) return;
  const lv = rgSk('wildkin'), animal = MOB[p.type] && MOB[p.type].race === 'brute', f = 1 + (animal ? lv * .05 : 0), was = p._wkF || 1;
  if (Math.abs(f - was) < 1e-6) return;
  p.mhp = Math.round(p.mhp / was * f); p.atk = Math.round(p.atk / was * f); p._wkF = f;
  if (typeof PET !== 'undefined' && PET.hp != null) PET.hp = Math.min(p.mhp, Math.round(PET.hp / was * f)); }
EV.on('tick', () => { if ((rgWildkin.t = (rgWildkin.t || 0) + 1) % 30 === 0) rgWildkin(); });
if (typeof petStats === 'function'){ const _ps = petStats; petStats = function(p){ const r = _ps.apply(this, arguments); if (p) p._wkF = 1; return r; }; }   // stats rebuilt from the monster: the bonus is laid on again next tick
