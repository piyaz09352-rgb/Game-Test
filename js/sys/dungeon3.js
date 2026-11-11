/* VAYRATHEN — js/sys/dungeon3.js — (v79) dungeons with more going on
   · a big "ออกจากดันเจี้ยน / Leave dungeon" button on screen the whole time you are inside
   · between waves: pick 1 of 3 blessings (lasts until you leave) · roguelite-style choices
   · danger zones: red circles mark the ground, then blow up · roll out or take 12% Max HP
   · a ★ Golden Spirit may show up in waves 1–3 · catch it for Bia and Vayra Coins
   · the guardian has phases: calls its guards at 60% HP, goes berserk at 30%
   · kill streaks show a combo count · clearing gives a rank (S/A/B/C by time, falls and best combo) with a bonus */
'use strict';

const DG3 = {boon:{}, boonOpen:false, hazT:6, combo:0, comboT:0, best:0, falls:0, phase:0, rank:null};
const DG3_BOONS = [
  {id:'might', ic:'⚔', th:'พลังยักษ์', en:'Giant Might', d:['ATK +20%', 'ATK +20%'], b:{atkPct:.2}},
  {id:'mind', ic:'✦', th:'ปัญญาฤๅษี', en:'Hermit Wisdom', d:['MATK +20%', 'MATK +20%'], b:{matkPct:.2}},
  {id:'haste', ic:'➶', th:'ลมกรด', en:'Gale', d:['ตีเร็วขึ้น 20%', 'Attack speed +20%'], b:{aspdPct:.2}},
  {id:'stone', ic:'⛨', th:'กายศิลา', en:'Stone Skin', d:['รับดาเมจ −15%', 'Damage taken −15%'], b:{dmgRed:.15}},
  {id:'eye', ic:'◎', th:'ตาเหยี่ยว', en:'Hawk Eye', d:['CRIT +15%', 'CRIT +15%'], b:{crit:15}},
  {id:'life', ic:'✚', th:'น้ำทิพย์', en:'Nectar', d:['ฟื้น HP 3% ทุก 3 วิ', 'Regain 3% HP every 3s'], b:{regenPct:.03, every:3}},
  {id:'thorn', ic:'✷', th:'เกราะหนาม', en:'Thorn Mail', d:['สะท้อนดาเมจ 20%', 'Reflect 20% damage'], b:{reflect:.2}},
  {id:'iron', ic:'▣', th:'เกราะเหล็ก', en:'Iron Guard', d:['DEF +40', 'DEF +40'], b:{def:40}}];

/* ---------- the leave button ---------- */
function dg3Btn(){
  let b = document.getElementById('dgLeave');
  if (!DG.active){ if (b) b.remove(); return; }
  if (!b){ b = document.createElement('button'); b.id = 'dgLeave'; b.className = 'dgleave'; b.dataset.dgexit = '1'; document.body.appendChild(b); }
  const t = DG.done ? L('🚪 ออกจากดันเจี้ยน (รับรางวัลแล้ว)', '🚪 Leave dungeon (reward taken)') : L('🚪 ออกจากดันเจี้ยน', '🚪 Leave dungeon');
  if (b.textContent !== t) b.textContent = t;
  // (v100) it sits beside the minimap, on its left and level with its top, not in the middle of the screen
  const now = performance.now(); if (now - (b._at || 0) < 400) return; b._at = now;
  const mc = el('mapCard'), r = mc && !mc.hidden && mc.offsetWidth ? mc.getBoundingClientRect() : null;
  const top = r ? Math.round(r.top) + 'px' : '64px', right = r ? Math.round(innerWidth - r.left + 8) + 'px' : '12px';
  if (b.style.top !== top) b.style.top = top; if (b.style.right !== right) b.style.right = right;
  // (v259) the owner on a phone: it lay on the chips beside the minimap (Auto · ออนไลน์ · พักจอ · GM). If it covers
  // anything up there, it steps down below what it covers (a few tries)
  const hit = () => { const q = b.getBoundingClientRect(); if (!q.width) return null; let low = null;
    for (const e of document.querySelectorAll('#ui button, #ui .chip, #ui [class*="chip"], #ui .card, #ui #mapCard')){
      if (e === b || b.contains(e) || e.contains(b) || !e.offsetWidth || e.closest('.win,#dialog')) continue; const s = getComputedStyle(e); if (s.visibility === 'hidden' || s.display === 'none') continue;
      const o = e.getBoundingClientRect(); if (o.bottom > innerHeight * .5) continue;
      if (q.left < o.right - 1 && q.right > o.left + 1 && q.top < o.bottom - 1 && q.bottom > o.top + 1) low = Math.max(low || 0, o.bottom); }
    return low; };
  for (let k = 0, low; k < 4 && (low = hit()) != null; k++){ const t2 = Math.round(low + 6) + 'px'; if (b.style.top === t2) break; b.style.top = t2; }
}
/* once cleared, leaving needs no warning */
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#dgLeave'); if (!t || !DG.done) return;
  e.stopImmediatePropagation(); dgExit(L('กลับจากดันเจี้ยนแล้ว', 'Back from the dungeon')); }, true);

/* ---------- blessings between waves ---------- */
function dg3Boon(){
  if (DG3.boonOpen || !DG.active) return; DG3.boonOpen = true;
  const pick = [...DG3_BOONS].filter(b => !DG3.boon[b.id]).sort(() => Math.random() - .5).slice(0, 3);
  const box = document.createElement('div'); box.id = 'dgBoon'; box.className = 'dgboon';
  box.innerHTML = `<h3>${L('เลือกพร 1 อย่าง', 'Choose a blessing')}</h3><small>${L('ใช้ได้จนออกจากดันเจี้ยน', 'Lasts until you leave the dungeon')}</small>
    <div class="dgbr">${pick.map(b => `<button class="dgbc" data-boon="${b.id}"><i>${b.ic}</i><b>${L(b.th, b.en)}</b><span>+ ${L(...b.d)}</span></button>`).join('')}</div>`;
  document.body.appendChild(box); SFX.play('quest');
  later(12, () => { if (document.getElementById('dgBoon') === box) dg3Take(pick[0].id); });
}
function dg3Take(id){
  const B = DG3_BOONS.find(b => b.id === id), box = document.getElementById('dgBoon'); if (box) box.remove(); DG3.boonOpen = false; if (!B || !DG.active) return;
  DG3.boon[id] = 1; addBuff('dgb_' + id, {...B.b, t:DG_TIME, name:L(B.th, B.en)});
  banner(L(`ได้รับพร: ${B.th}`, `Blessing: ${B.en}`)); SFX.play('buff'); VFX.play('goldshield', {x:P.x, y:P.y}); dirty = true;
}
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-boon]'); if (t) dg3Take(t.dataset.boon); });

/* ---------- danger zones ---------- */
function dg3Hazard(pct = .12){   // (v256) the tower passes a smaller share
  const n = DG.wave >= 4 ? 3 : 2;
  for (let i = 0; i < n; i++){ const x = P.x + (i ? rand(-110, 110) : rand(-20, 20)), y = P.y + (i ? rand(-70, 70) : rand(-12, 12)), r = 48, tt = 1.2;
    VFX.play('warnCircle', {x, y, r, t:tt});
    later(tt, () => { if (!DG.active) return; VFX.play('boom', {x, y, r}); VFX.shake(3); SFX.play('fire');
      if (typeof skfxRing === 'function'){ skfxRing(x, y, r * 1.5, '#ff8a1f', .35, 6); skfxScorch(x, y, r, '#c7261a', 1.6); }
      if (P.dead || P.roll || Object.values(P.buffs).some(b => b.invuln)) return;
      if (Math.hypot(P.x - x, (P.y - y) * 1.6) < r + 6){ const d = Math.round(DER.maxhp * pct * (1 - Math.min(.6, buffSum('dmgRed'))));
        S.hp -= d; addText(P.x, P.y - 48, String(d), '#ff8a80'); P.hurt = .25; SFX.play('hurt'); if (S.hp <= 0) playerDie(); } }); }
}

/* ---------- golden spirit, guardian phases (the host spawns, everyone mirrors) ---------- */
{ const _sw = dgSpawnWave;
  dgSpawnWave = function(){ const before = new Set(mobs); const r = _sw.apply(this, arguments);
    const fresh = mobs.filter(m => !before.has(m) && m.dg && !m.dead);
    if (DG.wave <= 3 && Math.random() < .4){ const s = fresh.find(m => !m.def.boss && !m.eliteDg);
      if (s){ s.def = {...s.def, name:'★ ภูตทองคำ', en:'★ Golden Spirit', hp:Math.round(s.def.hp * .6), speed:(s.def.speed || 40) * 1.7, atk:[1, 2]}; s.maxhp = s.hp = s.def.hp; s.dgGold = true; s.eliteDg = true;
        banner(L('★ ภูตทองคำโผล่มา! จับให้ได้ก่อนมันหนี', '★ A Golden Spirit appeared! Catch it before it flees')); later(25, () => { if (!s.dead){ s.dead = true; s.hp = 0; VFX.play('beastFade', {x:s.x, y:s.y, col:'auraGold'}); } }); } }
    if (DG.wave >= 4) DG3.phase = 0;
    return r; };
}
function dg3Phases(){
  const g = mobs.find(m => m.dg && m.def.boss && !m.dead); if (!g) return; const f = g.hp / g.maxhp;
  if (DG3.phase < 1 && f <= .6){ DG3.phase = 1; banner(L(`${g.def.name} เรียกองครักษ์!`, `${g.def.en} calls its guards!`)); SFX.play('wbhorn');
    if (!(typeof NM !== 'undefined' && NM.slave)){ const kinds = MAPS[dgInfo().base].mobs.filter(t => !MOB[t].night);
      for (let i = 0; i < 3; i++){ const t = kinds[i % kinds.length], m = spawnMob(t, g.x + Math.cos(i * 2.1) * 80, g.y + Math.sin(i * 2.1) * 50, {zone:MAPZ});
        m.dgc = g.dgc; m.def = dgDef(t, g.dgc); m.maxhp = m.hp = m.def.hp; m.dg = true; m.split = true; m.aggro = true; VFX.play('bossSummon', {x:m.x, y:m.y}); } } }
  if (DG3.phase < 2 && f <= .3){ DG3.phase = 2; g.enraged = true; VFX.play('enrage', {m:g}); VFX.shake(5); banner(L(`${g.def.name} คลุ้มคลั่ง! ระวังให้ดี`, `${g.def.en} goes berserk! Watch out`)); }
}

/* ---------- combo and rank ---------- */
EV.on('kill', m => {
  if (!DG.active || !m || !m.dg) return;
  DG3.combo = DG3.comboT > 0 ? DG3.combo + 1 : 1; DG3.comboT = 3; DG3.best = Math.max(DG3.best, DG3.combo);
  if (DG3.combo >= 3) addText(P.x, P.y - 92, L(`${DG3.combo} คอมโบ!`, `${DG3.combo} combo!`), '#ffb21f', 22);
  if (m.dgGold){ const z = DG.lv * 120; S.bia += z; if (typeof coinAdd === 'function') coinAdd(3, L('ภูตทองคำ', 'Golden Spirit'));
    VFX.play('coins', {x:m.x, y:m.y - 20}); SFX.play('drop2'); log(L(`จับภูตทองคำได้! +${fmtN(z)} เบี้ย · +3 เหรียญวายรา`, `Caught the Golden Spirit! +${fmtN(z)} Bia · +3 Vayra Coins`), 'g'); }
});
EV.on('die', () => { if (DG.active) DG3.falls++; });
function dg3Rank(){
  const used = T - DG.t0, sc = (used < 240 ? 3 : used < 420 ? 2 : used < 600 ? 1 : 0) + (DG3.falls ? 0 : 2) + (DG3.best >= 10 ? 2 : DG3.best >= 5 ? 1 : 0);
  return sc >= 6 ? 'S' : sc >= 4 ? 'A' : sc >= 2 ? 'B' : 'C';
}
{ const _r = dgReward;
  dgReward = function(){ const r = _r.apply(this, arguments); const rk = dg3Rank(), D = dgInfo(), used = T - DG.t0; DG3.rank = rk;
    const bonus = {S:[.5, 3], A:[.25, 2], B:[.1, 1], C:[0, 0]}[rk], z = Math.round(DG.lv * 300 * bonus[0]);
    if (z) S.bia += z; if (bonus[1] && typeof coinAdd === 'function') coinAdd(bonus[1], L('ระดับดันเจี้ยน', 'dungeon rank'));
    const box = document.createElement('div'); box.id = 'dgRank'; box.className = 'dgrank r' + rk;
    box.innerHTML = `<div class="rk">${rk}</div><h3>${L(`ผ่าน${D.th}!`, `${D.en} cleared!`)}</h3>
      <ul><li>${L('เวลา', 'Time')} <b>${Math.floor(used / 60)}:${String(Math.floor(used % 60)).padStart(2, '0')}</b></li><li>${L('ล้ม', 'Falls')} <b>${DG3.falls}</b></li><li>${L('คอมโบสูงสุด', 'Best combo')} <b>${DG3.best}</b></li>
      <li>${L('โบนัสระดับ', 'Rank bonus')} <b>${z ? `+${fmtN(z)} ${L('เบี้ย', 'Bia')}` : '—'}${bonus[1] ? ` · +${bonus[1]} ${L('เหรียญ', 'coins')}` : ''}</b></li></ul>
      <div class="dgrb"><button class="btn gold" data-rk="leave">${L('ออกจากดันเจี้ยน', 'Leave now')}</button><button class="btn" data-rk="stay">${L('อยู่ต่อ (ออกเองใน 45 วิ)', 'Stay (auto-leave in 45s)')}</button></div>`;
    document.body.appendChild(box); SFX.play('levelUp'); save(); return r; };
}
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-rk]'); if (!t) return; const b = document.getElementById('dgRank'); if (b) b.remove();
  if (t.dataset.rk === 'leave') dgExit(L('กลับจากดันเจี้ยนแล้ว', 'Back from the dungeon')); });

/* ---------- the loop ---------- */
let dg3Was = false, dg3Alive = false;
EV.on('tick', dt => {
  if (!DG.active){ if (dg3Was){ dg3Was = false; for (const k of Object.keys(P.buffs)) if (k.startsWith('dgb_')) delete P.buffs[k]; renderBuffs();
      for (const id of ['dgBoon', 'dgRank']){ const e = document.getElementById(id); if (e) e.remove(); } Object.assign(DG3, {boon:{}, boonOpen:false, combo:0, comboT:0, best:0, falls:0, phase:0, rank:null}); }
    dg3Btn(); return; }
  if (!dg3Was){ dg3Was = true; Object.assign(DG3, {boon:{}, boonOpen:false, hazT:6, combo:0, comboT:0, best:0, falls:0, phase:0, rank:null}); }
  dg3Btn(); if (PAUSED) return;
  if (DG3.comboT > 0) DG3.comboT -= dt;
  const alive = mobs.some(m => m.dg && !m.dead);
  if (dg3Alive && !alive && DG.wave >= 1 && DG.wave < 4 && !DG.done) dg3Boon();
  dg3Alive = alive;
  if (alive && DG.wave >= 2 && !DG.done && (DG3.hazT -= dt) <= 0){ DG3.hazT = DG.wave >= 4 ? 4.5 : 7; dg3Hazard(); }
  if (DG.wave >= 4) dg3Phases();
});

{ const st = document.createElement('style'); st.textContent = `
.dgleave{position:fixed;top:64px;right:12px;left:auto;z-index:60;padding:7px 13px;max-width:44vw;white-space:normal;text-align:center;border-radius:999px;border:2px solid #c0392b;background:#fff8ee;color:#1c1410;font:700 13.5px/1.25 Sarabun,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.25);cursor:pointer}
.dgleave:hover{background:#ffe9e2}
.dgboon,.dgrank{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:70;background:#fffaf0;color:#1c1410;border:2px solid #e8b84a;border-radius:16px;padding:16px 18px;box-shadow:0 10px 30px rgba(0,0,0,.3);font-family:Sarabun,sans-serif;text-align:center;max-width:min(560px,92vw)}
.dgboon h3,.dgrank h3{margin:0 0 4px;font-size:20px;color:#1c1410}.dgboon small{color:#4a3a20}
.dgbr{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;justify-content:center}
.dgbc{flex:1 1 140px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 8px;border-radius:12px;border:2px solid #e8b84a;background:#fff;color:#1c1410;cursor:pointer;font-family:inherit}
.dgbc:hover{background:#fff3d6;transform:translateY(-2px)}.dgbc i{font-style:normal;font-size:26px}.dgbc b{font-size:16px}.dgbc span{color:#1e8a3c;font-weight:700}
.dgrank .rk{font:900 64px/1 Sarabun,sans-serif;color:#1c1410}.dgrank.rS .rk{color:#c98a00}.dgrank.rA .rk{color:#1e8a3c}.dgrank.rB .rk{color:#2a6fc9}
.dgrank ul{list-style:none;padding:0;margin:10px 0;text-align:left}.dgrank li{display:flex;justify-content:space-between;gap:16px;padding:3px 0;border-bottom:1px solid #f0e2c0}
.dgrb{display:flex;gap:8px;justify-content:center}`;
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'dungeonfun', t:['ลูกเล่นในดันเจี้ยน', 'Dungeon twists'], b:() => `<ul>
  <li>${L('ปุ่ม "ออกจากดันเจี้ยน" อยู่ข้างมินิแมพตลอดเวลา', 'A "Leave dungeon" button sits beside the minimap the whole time')}</li>
  <li>${L('ผ่านแต่ละด่าน เลือกพร 1 ใน 3 ใช้ได้จนออก', 'After each wave pick 1 of 3 blessings, kept until you leave')}</li>
  <li>${L('วงแดงบนพื้นจะระเบิด เดินออกให้ทัน (โดน 12% HP)', 'Red circles on the ground explode: walk out in time (12% HP)')}</li>
  <li>${L('ภูตทองคำ ★ จับได้รับเงินและเหรียญวายรา', 'Catch the ★ Golden Spirit for Bia and Vayra Coins')}</li>
  <li>${L('ผู้พิทักษ์เรียกองครักษ์ที่ 60% และคลุ้มคลั่งที่ 30%', 'The guardian calls guards at 60% and goes berserk at 30%')}</li>
  <li>${L('ผ่านแล้วได้ระดับ S/A/B/C ตามเวลา จำนวนครั้งที่ล้ม และคอมโบ · ระดับสูงได้โบนัส', 'Clearing gives an S/A/B/C rank by time, falls and combo · higher ranks pay a bonus')}</li></ul>`});
