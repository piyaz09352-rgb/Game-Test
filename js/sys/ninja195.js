/* VAYRATHEN — js/sys/ninja195.js — (v195) the ninja line, reworked the way the owner laid it out
   Removed (their skill points come back to spend again): ดาวกระจายตรึงเงา · ปาคุไน · คาถาสลับร่าง (นินจา) · ฟูมะ ·
   คาถาสายฟ้า · มังกรเพลิง · คุไนอาบพิษ (นินจาเงา) · วงล้อดาว · มังกรวารี (จอมนินจาคาเงะ).
   Every tier  the normal throw ricochets: after it hits, the star bounces on to the nearest other monster
               (นินจา 1 bounce · นินจาเงา 2 · คาเงะ 3), each bounce at 70% of the one before
   นินจา      วิถีนินจา MATK +20% and 20% faster attacks at Lv 10 · ดาวคู่ two quick stars and blinds ·
               คาถาไฟ a fire star that sets the target burning · คาถาน้ำ a water star: the target chokes (สำลักน้ำ,
               a few seconds of water damage) and its magic resistance drops · ระเบิดควัน vanish and dodge EVERY attack 3 s
   นินจาเงา   วิชาดาวกระจาย CRIT and reach · คาถาลม a wind star that slows · แยกเงา four shadow clones for 10 s that copy
               every throw and skill you make · พายุดาวกระจาย three stars in a row
   คาเงะ      วิถีคาเงะ INT, DEX and AGI · พายุพันดาราเงา five stars in a row, lowers magic resistance ·
               จตุรธาตุ (was คาถาสายฟ้า กิเลน) the four elemental stars — earth, water, wind, fire — strike three times;
               each strike takes whichever of the four hurts that monster most · พันเงา for 15 s every normal throw lowers
               the target's magic resistance (stacking) and bounces 2 more times · สังหารเงียบ faster on foot
   "Magic resistance down" = the monster takes more magic damage. Bosses take half of it, and shrug off the
   blinding, slowing and choking as they do every status in the game. */
'use strict';
const NJ195_DROP = {ninja:['ninjadash', 'kunaithrow', 'kawarimi'], shinobi:['iai', 'raiton', 'dragonflame', 'poisonkunai'], kage:['blinkstrike', 'waterdragon']};
const NJ195_GONE = Object.values(NJ195_DROP).flat();
for (const [j, ids] of Object.entries(NJ195_DROP)){ if (JOBS[j]) JOBS[j].skills = JOBS[j].skills.filter(id => !ids.includes(id));
  if (typeof SK8 !== 'undefined' && SK8[j]) for (const k of ['a', 'b', 'c']) SK8[j][k] = SK8[j][k].filter(id => !ids.includes(id)); }
/* a kept skill never waits on a removed one (this line and the hunter line of v193) */
{ const gone = new Set([...NJ195_GONE, ...(typeof RG193_GONE !== 'undefined' ? RG193_GONE : [])]);
  for (const id in SKILLS){ const s = SKILLS[id]; if (!s.req) continue; for (const q of Object.keys(s.req)) if (gone.has(q)) delete s.req[q]; if (!Object.keys(s.req).length) s.req = undefined; } }
function nj195Refund(){ if (!S || !S.skills) return; let n = 0;
  for (const id of NJ195_GONE) if (S.skills[id]){ n += S.skills[id]; delete S.skills[id]; }
  if (Array.isArray(S.hot)) S.hot = S.hot.map(h => (NJ195_GONE.includes(h) ? null : h));
  if (n){ S.skPts = (S.skPts || 0) + n; derive(); dirty = true; if (typeof renderHotbar === 'function') renderHotbar();
    if (typeof log === 'function') log(L(`สกิลนินจาปรับใหม่: คืน ${n} แต้มสกิลจากสกิลที่ถูกนำออก`, `Ninja skills reworked: ${n} skill points returned from removed skills`), 'g'); } }
EV.on('tick', () => { if ((nj195Refund.t = (nj195Refund.t || 0) + 1) % 30 === 0) nj195Refund(); });
{ const _d0 = derive; derive = function(){ if (S && S.skills && !nj195Refund.busy && NJ195_GONE.some(id => S.skills[id])){ nj195Refund.busy = 1; try { nj195Refund(); } finally { nj195Refund.busy = 0; } } return _d0.apply(this, arguments); }; }

const NJD = (id, o) => { const s = SKILLS[id]; if (s) Object.assign(s, o); };
const njP = v => Math.round(v * 100) + '%';
const njDmg = id => lv => njP(SKILLS[id].dmg(lv));
const NJ = {bounceMul:.7, bounceR:120, cloneN:4, clonePct:.25, mresBoss:.5};
/* ---------- นินจา ---------- */
NJD('shinobiway', {pas:lv => ({matkPct:+(lv * .02).toFixed(2), aspdPct:+(lv * .02).toFixed(2)}),
  desc:lv => L(`ติดตัว · MATK +${lv * 2}% · โจมตีเร็วขึ้น ${lv * 2}% · ปาดาวปกติชิ่งโดนมอนข้างเคียง (นินจา 1 · นินจาเงา 2 · คาเงะ 3 ครั้ง)`, `Passive · MATK +${lv * 2}% · ${lv * 2}% faster attacks · normal throws ricochet (Ninja 1 · Shinobi 2 · Kage 3 bounces)`)});
NJD('quickslash', {name:'ดาวคู่', en:'Twin Stars', hits:() => 2, every:.08, st:lv => ({blind:+(3 + lv * .3).toFixed(1)}),
  desc:lv => L(`ปาดาวกระจาย 2 ดวงอย่างรวดเร็ว ดวงละ ${njDmg('quickslash')(lv)} MATK · ตาบอด ${(3 + lv * .3).toFixed(1)} วิ (มอนตีพลาดครึ่งหนึ่ง)`, `Two quick stars of ${njDmg('quickslash')(lv)} MATK · blind ${(3 + lv * .3).toFixed(1)} s (misses half its blows)`)});
NJD('katon', {name:'คาถาไฟ', en:'Fire Release', type:'bolt', fx:'shuriken', elem:'fire', radius:undefined, dmg:lv => 1.6 + lv * .4, cd:2,
  desc:lv => L(`ดาวกระจายเวทธาตุไฟ ${njDmg('katon')(lv)} MATK · เผาไหม้ 5 วิ (${njP(.1 + lv * .015)} MATK/วิ)`, `A fire-magic star: ${njDmg('katon')(lv)} MATK · burns 5 s (${njP(.1 + lv * .015)} MATK a second)`)});
NJD('suiton', {name:'คาถาน้ำ', en:'Water Release', type:'bolt', fx:'shuriken', elem:'water', freeze:undefined, dmg:lv => 1.4 + lv * .35, cd:2,
  desc:lv => L(`ดาวกระจายเวทธาตุน้ำ ${njDmg('suiton')(lv)} MATK · สำลักน้ำ 4 วิ (${njP(.06 + lv * .01)} MATK/วิ) · ต้านเวทลดลง ${10 + lv}% นาน 8 วิ`, `A water-magic star: ${njDmg('suiton')(lv)} MATK · chokes 4 s (${njP(.06 + lv * .01)} MATK a second) · magic resistance −${10 + lv}% for 8 s`)});
NJD('smokescreen', {buff:() => ({t:3, stealth:1, evadeAll:1}), cd:lv => 30 - lv,
  desc:lv => L(`ล่องหนและหลบการโจมตีทุกรูปแบบ 3 วิ · คูลดาวน์ ${30 - lv} วิ`, `Vanish and dodge every attack for 3 s · cooldown ${30 - lv} s`)});
/* ---------- นินจาเงา ---------- */
NJD('bladeart', {pas:lv => ({crit:lv, range:lv * 4}),
  desc:lv => L(`ติดตัว · CRIT +${lv} · ระยะโจมตี +${lv * 4}`, `Passive · CRIT +${lv} · reach +${lv * 4}`)});
NJD('fuuton', {name:'คาถาลม', en:'Wind Release', type:'bolt', fx:'shuriken', elem:'wind', len:undefined, width:undefined, dmg:lv => 2.2 + lv * .35, cd:2.5,
  st:lv => ({slow:[+(.3 + lv * .02).toFixed(2), 4]}),
  desc:lv => L(`ดาวกระจายเวทธาตุลม ${njDmg('fuuton')(lv)} MATK · ช้าลง ${njP(.3 + lv * .02)} นาน 4 วิ`, `A wind-magic star: ${njDmg('fuuton')(lv)} MATK · slowed ${njP(.3 + lv * .02)} for 4 s`)});
NJD('kagebunshin', {name:'แยกเงา', en:'Shadow Clones', buff:() => ({t:10, clones:NJ.cloneN}), cd:lv => 50 - lv * 2,
  desc:lv => L(`สร้างร่างแยก 4 ร่าง 10 วิ ทำทุกอย่างตามร่างจริง (ดาวปกติและสกิล) · ร่างละ ${njP(NJ.clonePct)} ของดาเมจ · คูลดาวน์ ${50 - lv * 2} วิ`, `Four shadow clones for 10 s copy every throw and skill · each deals ${njP(NJ.clonePct)} of your hit · cooldown ${50 - lv * 2} s`)});
NJD('shurikenstorm', {type:'bolt', fx:'shuriken', radius:undefined, hits:() => 3, every:.1, dmg:lv => 1 + lv * .16, cd:2.5,
  desc:lv => L(`ปาดาวกระจาย 3 ครั้งติดต่อกัน ครั้งละ ${njDmg('shurikenstorm')(lv)} MATK`, `Three stars in a row, ${njDmg('shurikenstorm')(lv)} MATK each`)});
/* ---------- จอมนินจาคาเงะ ---------- */
NJD('kagemastery', {pas:lv => ({intUp:lv * 2, dexUp:lv * 2, agiUp:lv * 2}),
  desc:lv => L(`ติดตัว · INT +${lv * 2} · DEX +${lv * 2} · AGI +${lv * 2}`, `Passive · INT +${lv * 2} · DEX +${lv * 2} · AGI +${lv * 2}`)});
NJD('shadowflash', {hits:() => 5, dmg:lv => .8 + lv * .12,
  desc:lv => L(`ปาดาวกระจาย 5 ครั้งติดต่อกัน ครั้งละ ${njDmg('shadowflash')(lv)} MATK · ต้านเวทลดลง ${10 + lv}% นาน 8 วิ`, `Five stars in a row, ${njDmg('shadowflash')(lv)} MATK each · magic resistance −${10 + lv}% for 8 s`)});
NJD('kirin', {name:'จตุรธาตุ', en:'Four Elements', short:'จตุรธาตุ', shortEn:'4 Elements', type:'aoeTarget', fx:'none', elem:'fourelem', radius:90, hits:() => 3, every:.32, cast:() => 1, st:undefined,
  dmg:lv => 2.6 + lv * .32,
  desc:lv => L(`เรียกดาวกระจาย 4 ธาตุ ดิน น้ำ ลม ไฟ ทำดาเมจ 3 ครั้ง ครั้งละ ${njDmg('kirin')(lv)} MATK รัศมี 90 · แต่ละครั้งใช้ธาตุที่แรงที่สุดกับมอนตัวนั้น · ร่าย 1 วิ`, `Calls the stars of all four elements — earth, water, wind, fire — for 3 strikes of ${njDmg('kirin')(lv)} MATK (radius 90) · each strike uses whichever element hurts that monster most · cast 1 s`)});
NJD('thousandshadows', {name:'พันเงา', en:'Thousand Shadows', buff:() => ({t:15, shred:1}),
  desc:lv => L(`15 วิ · ดาวปกติลดต้านเวทเป้า ${3 + Math.floor(lv / 2)}% ทุกครั้งที่โดน (สะสมสูงสุด 30%) · ชิ่งเพิ่มอีก 2 ครั้ง`, `15 s · each normal throw lowers the target's magic resistance by ${3 + Math.floor(lv / 2)}% (stacks to 30%) · 2 more ricochets`)});
NJD('silentkill', {pas:lv => ({moveUp:lv * .015}),
  desc:lv => L(`ติดตัว · เดินเร็วขึ้น ${(lv * 1.5).toFixed(1)}%`, `Passive · ${(lv * 1.5).toFixed(1)}% faster on foot`)});

/* ---------- the mechanics behind them ---------- */
const njSk = id => (S && S.skills && SKILLS[id] && jobChain().includes(SKILLS[id].job) ? S.skills[id] || 0 : 0);
const njIs = () => !!(S && JOBS[S.job] && JOBS[S.job].weapon.type === 'shuriken');
// วิถีคาเงะ: INT, DEX and AGI count like real stat points · สังหารเงียบ: move speed
{ const _d = derive; derive = function(){
    const k = njSk('kagemastery') * 2;
    if (S && S.stats && k){ S.stats.int += k; S.stats.dex += k; S.stats.agi += k; }
    let r; try { r = _d.apply(this, arguments); } finally { if (S && S.stats && k){ S.stats.int -= k; S.stats.dex -= k; S.stats.agi -= k; } }
    const sk = njSk('silentkill'); if (DER && sk) DER.move = (DER.move || 1) * (1 + sk * .015);
    return r; }; }
/* magic resistance down: the monster takes more magic damage while it lasts */
function njMres(m, pct, dur, stack){ if (!m || m.dead) return; if (m.def && m.def.boss) pct *= NJ.mresBoss;
  const live = m._mresT > T ? m._mresP || 0 : 0; m._mresP = stack ? Math.min(.3 * (m.def && m.def.boss ? NJ.mresBoss : 1), live + pct) : Math.max(live, pct); m._mresT = T + dur;
  if (T - (m._mresTx || -9) > 1.2){ m._mresTx = T; addText(m.x, m.y - MOB_H[m.type] - 22, L(`ต้านเวท −${Math.round(m._mresP * 100)}%`, `M.Res −${Math.round(m._mresP * 100)}%`), '#9fc8ff', 11); } }
{ const _md = magicDamage; magicDamage = function(m){ const r = _md.apply(this, arguments);
    if (m && m._mresT > T && r && r.dmg > 0) r.dmg = Math.max(1, Math.round(r.dmg * (1 + (m._mresP || 0)))); return r; }; }
/* จตุรธาตุ: each strike in the element that hurts this monster most */
const NJ_4E = ['earth', 'water', 'wind', 'fire'];
{ const _sm = skillMagic; skillMagic = function(m, mult, elem){
    if (elem === 'fourelem'){ let best = 'fire', bv = -1; for (const e of NJ_4E){ const v = elemMod(e, m.def.elem); if (v > bv){ bv = v; best = e; } } elem = best; }
    return _sm.call(this, m, mult, elem); }; }
/* the elemental stars: the skill's colour glows round the spinning star */
const NJ_COL = {fire:'rgba(255,110,40,1)', water:'rgba(70,170,255,1)', wind:'rgba(110,235,150,1)', earth:'rgba(210,160,80,1)', neutral:'rgba(220,220,240,1)', shadow:'rgba(160,90,230,1)'};
if (typeof VFX !== 'undefined' && VFX.drawProj){ const _dp = VFX.drawProj; VFX.drawProj = function(ctx, p, cx, cy){
    if (p && p.k === 'shuriken' && p.njCol){ try { const x = p.x - cx, y = p.y - cy, r = 6; const g = ctx; g.save(); g.globalCompositeOperation = 'lighter';
      const gr = g.createRadialGradient(x, y, 0, x, y, r * 2); gr.addColorStop(0, p.njCol); gr.addColorStop(1, p.njCol.replace(/,1\)$/, ',0)')); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 2, 0, 7); g.fill(); g.restore(); } catch (e) {} }
    return _dp.apply(this, arguments); }; }
/* ---------- skills: what happens on cast and on hit ---------- */
const NJ_MINE = new Set(['quickslash', 'katon', 'suiton', 'fuuton', 'shurikenstorm', 'shadowflash', 'kirin', 'kunairain']);
{ const _ex = execSkill; execSkill = function(id, lv, t){ const n0 = projs.length, r = _ex.apply(this, arguments), sk = SKILLS[id];
    if (sk && NJ_MINE.has(id) && sk.elem && NJ_COL[sk.elem]) for (let i = n0; i < projs.length; i++) if (projs[i].k === 'shuriken') projs[i].njCol = NJ_COL[sk.elem];
    if (id === 'smokescreen' && typeof addBuff === 'function'){ addBuff('stealth', {t:3}); for (const m of mobs) if (m.aggro && !m.def.boss){ m.aggro = false; m.tx = m.hx; m.ty = m.hy; } }
    if (id === 'kirin' && t && !t.dead) njFourFx(t.x, t.y);
    if (id === 'kagebunshin') njCloneSpawn();
    return r; }; }
{ const _ad = applyDamage; applyDamage = function(m, res, sk){ const r = _ad.apply(this, arguments);
    const id = sk && sk.id;
    if (m && res && !res.miss && !res.poison && res.dmg > 0){
      const lv = id ? njSk(id) || 1 : 1;
      if (id === 'katon'){ m.burnT = T + 5; m.burnDps = DER.matk * (.1 + lv * .015); }
      if (id === 'suiton' && !m.dead){ njMres(m, (10 + lv) / 100, 8); if (!m.def.boss){ m._chokeT = T + 4; m._chokeDps = DER.matk * (.06 + lv * .01); if (T - (m._chokeTx || -9) > 1.5){ m._chokeTx = T; addText(m.x, m.y - MOB_H[m.type] - 12, L('สำลักน้ำ', 'Choking'), '#7ac8ff', 12); } } }
      if (id === 'shadowflash' && !m.dead) njMres(m, (10 + lv) / 100, 8);
      if (!res._clone && P.buffs.kagebunshin && (res.shur || (sk && NJ_MINE.has(id)))) njCloneCopy(m, res, sk);
    }
    return r; }; }
// สำลักน้ำ: water in the lungs, a little water damage each second
EV.on('tick', () => { if ((njChoke.t = (njChoke.t || 0) + 1) % 30 !== 0) return; njChoke(); });
function njChoke(){ for (const m of mobs) if (!m.dead && m._chokeT > T) applyDamage(m, {dmg:Math.max(1, Math.round(m._chokeDps || 1)), poison:true, elem:'water'}); }
// ระเบิดควัน: nothing touches you while the smoke lasts
{ const _ma = mobAttack; mobAttack = function(m){ if (P.buffs.smokescreen && P.buffs.smokescreen.evadeAll){ m.lunge = .2; m.atkT = 0; if (T - (P._njMissT || -9) > .3){ P._njMissT = T; addText(P.x, P.y - 48, L('หลบ!', 'Evade!'), '#c8d0ff'); } return; } return _ma.apply(this, arguments); }; }
if (typeof afflict === 'function'){ const _af = afflict; afflict = function(){ if (P.buffs && P.buffs.smokescreen && P.buffs.smokescreen.evadeAll) return; return _af.apply(this, arguments); }; }
/* ---------- the normal throw ricochets (and พันเงา shreds magic resistance) ---------- */
const njBounces = () => { const n = jobChain().length - 1; return Math.max(0, Math.min(3, n)) + (P.buffs.thousandshadows ? 2 : 0); };
function njBounce(from, elem, mul, left, hit, col){
  if (left <= 0 || !from) return; const near = mobs.filter(o => !o.dead && !hit.has(o) && !o.pvp && Math.hypot(o.x - from.x, o.y - from.y) < NJ.bounceR + o.def.r).sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y))[0];
  if (!near) return; hit.add(near);
  projs.push({k:'shuriken', elem, njCol:col, x:from.x, y:from.y - MOB_H[from.type] * .5, t:near, delay:.02, speed:700, hit:() => { if (near.dead) return;
    const r = magicDamage(near, .95 * mul, elem); r.shur = true; let cr = (DER.crit || 0) + buffSum('crit'); if (r.dmg > 0 && Math.random() * 100 < cr){ r.crit = true; r.dmg = Math.round(r.dmg * (DER.critDmg || 1.5)); }
    applyDamage(near, r); njShred(near); VFX.play('slashHit', {x:near.x, y:near.y - MOB_H[near.type] * .5});
    njBounce(near, elem, mul * NJ.bounceMul, left - 1, hit, col); }});
}
function njShred(m){ const b = P.buffs.thousandshadows; if (!b || !m || m.dead) return; const lv = njSk('thousandshadows') || 1; njMres(m, (3 + Math.floor(lv / 2)) / 100, 5, true); }
{ const _ba = basicAttack; basicAttack = function(t){ const n0 = projs.length, r = _ba.apply(this, arguments);
    if (njIs() && t) for (let i = n0; i < projs.length; i++){ const p = projs[i]; if (p.k !== 'shuriken' || p._nj) continue; p._nj = 1; const h = p.hit;
      p.hit = () => { h(); if (t.dead && !t) return; njShred(t); njBounce(t, p.elem, NJ.bounceMul, njBounces(), new Set([t]), null); }; }
    return r; }; }
/* ---------- แยกเงา: four shadow clones beside you, copying what you do ---------- */
const NJ_CLONE_OFF = [[-22, -6], [22, -6], [-14, 12], [14, 12]];
function njCloneSpawn(){ for (const [ox, oy] of NJ_CLONE_OFF){ if (typeof skfxBurst === 'function') try { skfxBurst(P.x + ox, P.y + oy, 10, 6, {s0:20, s1:60, p:{size:3, col:'#3a3050'}}); } catch (e) {} } }
function njCloneCopy(m, res, sk){ if (m._njCloneT === T) return; m._njCloneT = T;
  NJ_CLONE_OFF.slice(0, (P.buffs.kagebunshin.clones || NJ.cloneN)).forEach(([ox, oy], i) => projs.push({k:'shuriken', elem:res.elem, njCol:'rgba(120,90,200,1)', x:P.x + ox, y:P.y + oy - 30, t:m, delay:.05 + i * .04, speed:720,
    hit:() => { if (m.dead) return; const c = {...res, dmg:Math.max(1, Math.round(res.dmg * NJ.clonePct)), _clone:1}; applyDamage(m, c, sk); }})); }
{ const _dp = drawPlayerW; drawPlayerW = function(g){
    const b = P.buffs && P.buffs.kagebunshin;
    if (b && !P.dead){ const x = P.x - cam.x, y = P.y - cam.y, sh = heroSheet(), act = P.act || 'idle', fade = Math.min(1, b.t / .6);
      g.save(); for (const [ox, oy] of NJ_CLONE_OFF){ g.globalAlpha = .45 * fade; g.filter = 'brightness(.35) saturate(.6)'; SPR.draw(g, sh, act, P.dir || 0, P.animT, x + ox, y + oy); } g.filter = 'none'; g.restore(); }
    return _dp.apply(this, arguments); }; }
/* ---------- จตุรธาตุ: four coloured stars spiral in and burst ---------- */
function njFourFx(tx, ty){ if (typeof skfxAdd !== 'function') return;
  const cols = [['#e8c890', '#c08a3a'], ['#c8eaff', '#3a9aff'], ['#d8ffe0', '#3ad070'], ['#fff0c0', '#ff5a1a']];
  cols.forEach((c, i) => skfxAdd({life:1.3, t:0, add:true, draw(g, k){ const a = i * Math.PI / 2 + k * 9, r = 60 * (1 - Math.min(1, k * 1.3)), x = tx + Math.cos(a) * r, y = ty - 26 + Math.sin(a) * r * .5 - (1 - k) * 20;
    const al = k < .1 ? k / .1 : k > .85 ? (1 - k) / .15 : 1; g.save(); g.globalAlpha = al; g.translate(x, y); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 14); gr.addColorStop(0, c[1]); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 14, 0, 7); g.fill();
      g.rotate(k * 40); g.fillStyle = c[0]; g.beginPath(); for (let j = 0; j < 8; j++){ const q = j / 8 * Math.PI * 2, rr = j % 2 ? 2.4 : 8; g.lineTo(Math.cos(q) * rr, Math.sin(q) * rr); } g.closePath(); g.fill(); g.strokeStyle = c[1]; g.lineWidth = 1; g.stroke(); g.restore(); }}));
  [0, .32, .64].forEach((d, j) => later(.1 + d, () => { const c = cols[j % 4]; try { skfxRing(tx, ty, 50 + j * 14, c[1], .35, 3); skfxBurst(tx, ty, 18, 10, {s0:40, s1:150, p:{size:2.5, col:cols[(j + 1) % 4][1]}}); skfxShake(2 + j); } catch (e) {} }));
}
/* the target window reads the new marks */
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'ninja195', t:['สกิลนินจา (v195)', 'Ninja skills (v195)'], b:() => L(
  '<p>ดาวปกติชิ่งโดนมอนข้างเคียง (นินจา 1 · นินจาเงา 2 · คาเงะ 3 ครั้ง ครั้งละ 70% ของครั้งก่อน) · ต้านเวทลดลง = มอนรับดาเมจเวทมากขึ้น (บอสได้ครึ่งเดียว)</p>',
  '<p>Normal throws ricochet (Ninja 1 · Shinobi 2 · Kage 3 bounces, each 70% of the one before) · magic resistance down = the monster takes more magic damage (half on bosses)</p>')});
