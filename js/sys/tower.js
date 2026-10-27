/* VAYRATHEN — js/sys/tower.js — (v102) หอคอยวายรา · the endless tower, with a ranking
   A solo climb with no top floor. Open it from the menu (หอคอย) or at Gatekeeper Saeng in Aren (Lv 10+).
   · Floor f: monsters of level 4 + 2f (Lv 300 at floor 148; past that they keep gaining 7% HP and 3% power a floor).
     The land changes every 10 floors to the region whose monsters match that level.
   · Every floor is one wave · every 5th floor a region guardian (with its guard call and berserk phase) ·
     every 10th floor the guardian brings two ★ elites · from floor 10 red circles burst on the ground.
   · Each floor has a time limit (75 s, guardian floors 105 s). Falling, running out of time or leaving ends the run.
   · Clearing a floor heals 25% HP/SP · every 5th floor cleared: choose 1 of 3 blessings, kept for the run.
   · Rewards: Bia every floor · the first time you pass a floor (above your best): Vayra Coins every 5 floors and
     a piece of gear rolled on the boss table every 10 · checkpoints: start again from any 10th floor you passed.
   · Ranking: your best floor is published with your player card (players/<id>.tower) · top 20 in the tower window,
     and a "หอคอย" tab in the Social ranking.
   Runs inside the dungeon instance (DG.active, its own private room), so warps, gates and other systems already
   treat it as a dungeon. One check per frame while inside; nothing runs outside. */
'use strict';

const TW_MIN = 10, TW_T = 75, TW_TB = 105;
const TW = {active:false, entering:false, f:1, f0:1, t:0, phase:'idle', restT:0, theme:0, spawned:false, gain:{z:0, coin:0, gear:0}, hazT:8, sub:null, rows:[], startF:1, end:null};
const twLv = f => 4 + f * 2, twLvC = f => clamp(twLv(f), 1, 300), twOver = f => Math.max(0, twLv(f) - 300);
/* who runs the floors: a solo climber, or the room host of a party climb */
const twHost = () => !(TW.party && typeof NM !== 'undefined' && NM.slave);
const twBoss = f => f % 5 === 0, twElite = f => f % 10 === 0;
const twSt = () => (S.tower = S.tower || {best:0, runs:0});
const twCks = () => { const b = twSt().best, out = [1]; for (let c = 11; c <= b + 1; c += 10) out.push(c); return out; };
/* the land for a floor: the region whose monsters sit closest below the floor's level */
let TW_THEMES = null;
function twThemes(){
  if (TW_THEMES) return TW_THEMES;
  TW_THEMES = MAPS.map((m, i) => ({i, lv:(m.lv || [0])[0], m})).filter(o => o.i > 0 && o.m.boss && MOB[o.m.boss] && (o.m.mobs || []).some(t => MOB[t] && !MOB[t].night && !MOB[t].boss)).sort((a, b) => a.lv - b.lv);
  return TW_THEMES;
}
function twThemeFor(f){ const lv = twLvC(f), th = twThemes(); let pick = th[0]; for (const o of th) if (o.lv <= lv) pick = o; return pick ? pick.i : 1; }

DUNGEONS.push({id:'tower', base:1, min:TW_MIN, name:'หอคอยวายรา', th:'หอคอยวายรา', en:'Vayra Tower', tower:true,
  d:['ปีนหอคอยไม่มีที่สิ้นสุด คนเดียว ชั้นละรอบ ทุก 5 ชั้นมีผู้พิทักษ์ · ชิงอันดับชั้นสูงสุด', 'An endless solo climb, one wave a floor, a guardian every 5th · race for the highest floor']});
const twInfo = () => DUNGEONS.find(d => d.id === 'tower');

/* ---------- a run ---------- */
function twCan(){
  if (!S || P.dead) return L('ตอนนี้เข้าไม่ได้', 'Not right now');
  if (S.lvl < TW_MIN) return L(`ต้อง Lv ${TW_MIN} ขึ้นไป`, `Requires Lv ${TW_MIN}+`);
  if (DG.active) return L('ออกจากดันเจี้ยนก่อน', 'Leave the dungeon first');
  if (typeof SIEGE_MAP !== 'undefined' && MAP_ID === SIEGE_MAP) return L('ออกจากสงครามปราสาทก่อน', 'Leave the siege first');
  return '';
}
/* o (v103, js/sys/towerparty.js): {code, pc, join} for a party climb — everyone uses the same code (one room) */
function twStart(f0 = 1, o = {}){
  const why = twCan(); if (why){ toast(why); return false; }
  if (!o.join && !twCks().includes(f0)) f0 = 1; f0 = Math.max(1, f0 | 0);
  const pc = clamp(o.pc | 0 || 1, 1, 5);
  DG.ret = {map:MAP_ID, x:P.x, y:P.y};
  Object.assign(DG, {active:true, entering:true, code:o.code || 'tw' + (NET && NET.uid ? String(NET.uid).slice(-5) : 's') + Date.now().toString(36).slice(-5), did:'tower', lv:twLvC(f0), pc, wave:4, waveT:1e9, t0:T, done:true, exitT:0});
  Object.assign(TW, {active:true, party:!!o.code, f:f0, f0, t:0, phase:'rest', restT:2.5, theme:-1, spawned:false, gain:{z:0, coin:0, gear:0}, hazT:8, end:null, fellAt:0});
  closeDialog(); for (const w of WIN_IDS) if (UIS.open[w]) closeWin(w);
  for (const id of ['twSum', 'dgRank']){ const e = document.getElementById(id); if (e) e.remove(); }
  twTheme(f0); twSt().runs = (twSt().runs || 0) + 1;
  banner(L(`หอคอยวายรา · เริ่มที่ชั้น ${f0}`, `Vayra Tower · starting at floor ${f0}`)); SFX.play('warp'); VFX.play('jobChange', {x:P.x, y:P.y});
  dgLabel(); dirty = true; return true;
}
/* load the floor's land (only when it changes) */
function twTheme(f){
  const id = twThemeFor(f); if (id === TW.theme) return; TW.theme = id; twInfo().base = id;
  TW.entering = DG.entering = true;
  try { loadMap(id); } finally { TW.entering = DG.entering = false; }
  spawnSlots = []; mobs = []; boss = null; bossTimer = 1e9;
  P.x = W / 2; P.y = H / 2; pushOut(P, 12);
}
/* one floor's wave, scaled like a dungeon (dgDef) and past Lv 300 by the floor */
function twScale(m, f){
  const ov = twOver(f); if (!ov) return; const kh = Math.pow(1.07, ov), ka = Math.pow(1.03, ov);
  m.def = {...m.def, hp:Math.round(m.def.hp * kh), atk:[Math.round(m.def.atk[0] * ka), Math.round(m.def.atk[1] * ka)], def:Math.round(m.def.def * (1 + ov * .01))}; m.maxhp = m.hp = m.def.hp;
}
function twSpot(i, n, r0){
  const a = i / n * Math.PI * 2 + Math.random() * .5, d = r0 + Math.random() * 90; let x = P.x + Math.cos(a) * d, y = P.y + Math.sin(a) * d * .7;
  for (let k = 0; k < 24 && (!walkable(x, y, 14) || x < 60 || y < 60 || x > W - 60 || y > H - 60); k++){ x = clamp(P.x + rand(-320, 320), 80, W - 80); y = clamp(P.y + rand(-220, 220), 80, H - 80); }
  return [x, y];
}
function twMob(type, x, y, f){
  const code = twLvC(f) * 10 + clamp(DG.pc | 0 || 1, 1, 5), m = spawnMob(type, x, y, {zone:typeof MAPZ !== 'undefined' ? MAPZ : undefined});
  m.dgc = code; m.def = dgDef(type, code); m.maxhp = m.hp = m.def.hp; m.dg = true; m.tw = f; m.split = true; m.aggro = true; twScale(m, f); return m;
}
function twSpawn(){
  const f = TW.f, mp = MAPS[TW.theme], kinds = mp.mobs.filter(t => MOB[t] && !MOB[t].night && !MOB[t].boss); if (!kinds.length) return;
  if (twBoss(f)){
    const [bx, by] = twSpot(0, 1, 200), g = twMob(mp.boss, bx, by, f); g.bcd = 3; g.roamT = 99; VFX.play('bossArrive', {x:bx, y:by});
    if (typeof DG3 !== 'undefined') DG3.phase = 0;
    for (let i = 0; i < 2; i++){ const [x, y] = twSpot(i, 2, 170), m = twMob(kinds[i % kinds.length], x, y, f); if (twElite(f) && typeof dgElite === 'function') dgElite(m, L('หัวหน้า', '')); }
    banner(L(`ชั้น ${f} · ♛ ผู้พิทักษ์ ${nm(MOB[mp.boss])}`, `Floor ${f} · ♛ Guardian ${nm(MOB[mp.boss])}`)); SFX.play('wbhorn');
  } else {
    const n = 5 + Math.min(6, Math.floor(f / 8));
    for (let i = 0; i < n; i++){ const [x, y] = twSpot(i, n, 150); twMob(kinds[(i + f) % kinds.length], x, y, f); VFX.play('bossSummon', {x, y}); }
    banner(L(`ชั้น ${f} · มอน Lv ${twLvC(f)}`, `Floor ${f} · monsters Lv ${twLvC(f)}`)); SFX.play('quest');
  }
  TW.spawned = true; TW.mine = true; TW.phase = 'fight'; TW.t = twBoss(f) ? TW_TB : TW_T; DG.lv = twLvC(f); dgLabel();
}
/* a floor is cleared: pay, heal, and maybe a blessing */
function twClear(){
  const f = TW.f, st = twSt(), first = f > (st.best || 0), lv = twLvC(f);
  const z = Math.round(lv * 25 * (twBoss(f) ? 3 : 1)); S.bia += z; TW.gain.z += z;
  if (first){ st.best = f;
    if (f % 5 === 0){ const c = twElite(f) ? 3 : 1; if (typeof coinAdd === 'function') coinAdd(c, L('หอคอยวายรา', 'Vayra Tower')); TW.gain.coin += c; }
    if (twElite(f)){ const wt = JOBS[S.job].weapon.type, pool = GEAR_LIST.filter(g => g[1] !== 'ammo' && g[4] <= lv + 5 && g[4] >= lv - 30 && lineOk(g[6]) && (g[1] !== 'weapon' || g[6].wtype === wt));
      if (pool.length){ const id = rollGear(pool[Math.floor(Math.random() * pool.length)][0], 'boss', P.x, P.y - 20); addItem(id, 1); TW.gain.gear++; log(L(`หีบชั้น ${f}: ${nm(ITEMS[id])}`, `Floor ${f} chest: ${nm(ITEMS[id])}`), 'g'); } }
    if (twElite(f) && typeof bk === 'function'){ const b = bk(); b.d = b.d || {}; b.d.tower = (b.d.tower || 0) + 1; }   // the Adventurer's Book counts every 10 new floors as a clear
    EV.emit('tower', f); }
  S.hp = Math.min(DER.maxhp, S.hp + Math.round(DER.maxhp * .25)); S.sp = Math.min(DER.maxsp, S.sp + Math.round(DER.maxsp * .25));
  addText(P.x, P.y - 70, L(`ผ่านชั้น ${f}! +${fmtN(z)} เบี้ย`, `Floor ${f} cleared! +${fmtN(z)} Bia`), '#ffd34a', 16);
  VFX.play('coins', {x:P.x, y:P.y - 30}); SFX.play('drop2');
  TW.f = f + 1; TW.phase = 'rest'; TW.restT = 3; TW.spawned = false;
  if (f % 5 === 0 && typeof dg3Boon === 'function'){ TW.restT = 4; dg3Boon(); }
  dirty = true; if (f % 5 === 0) save();
}
/* the run is over (fell, time, left); called once */
function twFinish(why){
  if (!TW.active) return; TW.active = false; TW.phase = 'idle';
  const reached = Math.max(TW.f0, TW.f - 1), st = twSt(); TW.end = {why, reached, best:st.best || 0, gain:{...TW.gain}, start:TW.f0};
  for (const m of mobs) if (m.tw && !m.dead){ m.dead = true; m.hp = 0; }
  if (NET && NET.dirT !== undefined) NET.dirT = 0;   // publish the new best soon
  setTimeout(twSummary, 600); dirty = true; save(); reWin('tower');
}
function twQuit(why){ if (!TW.active) return; twFinish(why || 'leave'); if (DG.active) dgExit(L('ออกจากหอคอยแล้ว', 'You left the tower')); }
function twSummary(){
  const e = TW.end; if (!e) return; const old = document.getElementById('twSum'); if (old) old.remove();
  const why = {fell:L('ล้มลงระหว่างทาง', 'You fell'), time:L('หมดเวลา', 'Time ran out'), leave:L('ออกจากหอคอย', 'You left')}[e.why] || '';
  const box = document.createElement('div'); box.id = 'twSum'; box.className = 'dgrank twsum';
  box.innerHTML = `<div class="rk">${e.reached}</div><h3>${L(`หอคอยวายรา · ถึงชั้น ${e.reached}`, `Vayra Tower · floor ${e.reached}`)}</h3><small>${why}</small>
    <ul><li>${L('เริ่มที่ชั้น', 'Started at')} <b>${e.start}</b></li><li>${L('สถิติสูงสุด', 'Best floor')} <b>${e.best}</b></li>
    <li>${L('ได้รับ', 'Earned')} <b>${fmtN(e.gain.z)} ${L('เบี้ย', 'Bia')}${e.gain.coin ? ` · ◈ ${e.gain.coin}` : ''}${e.gain.gear ? ` · ${L('อุปกรณ์', 'gear')} ${e.gain.gear}` : ''}</b></li></ul>
    <div class="dgrb"><button class="btn gold" data-twsum="ok">${L('ตกลง', 'OK')}</button><button class="btn" data-twsum="win">${L('ดูอันดับ', 'Ranking')}</button></div>`;
  document.body.appendChild(box); SFX.play('levelUp');
}
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-twsum]'); if (!t) return; const b = document.getElementById('twSum'); if (b) b.remove(); if (t.dataset.twsum === 'win') openWin('tower'); });

/* ---------- the loop ---------- */
EV.on('tick', dt => {
  if (!TW.active || PAUSED) return;
  if (!DG.active){ twFinish('leave'); return; }
  DG.t0 = T;   // the dungeon's own 15-minute clock does not apply here
  for (const k in P.buffs) if (k.startsWith('dgb_') && P.buffs[k].t < 60) P.buffs[k].t = 60;   // blessings last the whole run
  if (P.dead) return;
  if (TW.phase === 'rest'){
    if (typeof DG3 !== 'undefined' && DG3.boonOpen) return;
    if (!twHost()) return;   // a party mate follows the host's floors (towerparty.js)
    if ((TW.restT -= dt) <= 0){ twTheme(TW.f); twSpawn(); }
    return;
  }
  if (TW.phase !== 'fight') return;
  if (twHost()){ const alive = mobs.some(m => m.dg && !m.dead);
    // a party mate who just took over: carry on with the foes it mirrored, or bring the floor back (never a free floor)
    if (!TW.mine){ if (alive) TW.mine = true; else { const t = TW.t; twSpawn(); TW.t = Math.max(15, t); return; } }
    else if (!alive){ twClear(); return; } }   // the guardian's guards count too
  if ((TW.t -= dt) <= 0){ banner(L(`หมดเวลาที่ชั้น ${TW.f}!`, `Time ran out on floor ${TW.f}!`)); twQuit('time'); return; }
  if (TW.f >= 10 && typeof dg3Hazard === 'function' && (TW.hazT -= dt) <= 0){ TW.hazT = Math.max(4, 9 - TW.f / 20); dg3Hazard(); }
});
EV.on('die', () => { if (TW.active) TW.fellAt = TW.f; });
EV.on('map', () => { if (TW.active && !TW.entering) twFinish(TW.fellAt === TW.f ? 'fell' : 'leave'); });

/* ---------- fitting into the dungeon screens ---------- */
{ const _l = dgLabel; dgLabel = function(){ if (!TW.active) return _l.apply(this, arguments); const e = document.getElementById('mapName'); if (e) e.textContent = `🗼 ${L('หอคอยวายรา', 'Vayra Tower')} · ${L('ชั้น', 'floor')} ${TW.f}`; }; }
{ const _b = dg3Btn; dg3Btn = function(){ const r = _b.apply(this, arguments); const b = document.getElementById('dgLeave'); if (TW.active && b){ const t = L('🚪 ออกจากหอคอย', '🚪 Leave the tower'); if (b.textContent !== t) b.textContent = t; } return r; }; }
{ const _o = dgOpen; dgOpen = function(did){ if (did === 'tower'){ closeDialog(); openWin('tower'); return; } return _o.apply(this, arguments); }; }
{ const _qt = questTracker; questTracker = function(){
    if (!TW.active) return _qt.apply(this, arguments);
    const a = DG.active; DG.active = false; let h = ''; try { h = _qt.apply(this, arguments); } finally { DG.active = a; }
    const left = Math.max(0, TW.t), mm = `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`;
    const line = `<b>🗼 ${L('หอคอยวายรา', 'Vayra Tower')}</b> · ${L('ชั้น', 'Floor')} ${TW.f}${twBoss(TW.f) ? ' ♛' : ''} · ${TW.phase === 'fight' ? mm : L('พัก', 'rest')}<br><span class="dgline">${L('มอนที่เหลือ', 'Left')}: ${mobs.filter(m => m.tw && !m.dead).length} · ${L('สถิติ', 'best')} ${twSt().best || 0}</span> <a class="dgexit" data-twexit="1">${L('ออก', 'Leave')}</a>`;
    return line + (h ? '<br>' + h : ''); }; }
/* leaving asks first (runs before the dungeon's own handlers) */
window.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#dgLeave,[data-twexit]'); if (!t || !TW.active) return;
  e.stopImmediatePropagation(); e.preventDefault();
  askConfirm(L('ออกจากหอคอย', 'Leave the tower'), L(`จบการปีนที่ชั้น ${TW.f}? รางวัลที่ได้แล้วยังอยู่`, `End the climb on floor ${TW.f}? What you earned stays`), L('ออก', 'Leave'), () => twQuit('leave')); }, true);

/* ---------- the window ---------- */
mkWin('tower', 'หอคอย', 'Tower', '', '<path d="M7 18V8l3-5 3 5v10M5.5 18h9M8.5 11h3M8.5 14h3"/>');
if (typeof MENU_ICONS !== 'undefined'){
  MENU_ICONS.tower = ['#d8c8ff', '#3a2a8a', `<path d="M11 26V12.5L16 5l5 7.5V26z" fill="${MI_C}"/><path d="M9 26.5h14" stroke="${MI_C}" stroke-width="2.2" stroke-linecap="round"/><rect x="14.4" y="13" width="3.2" height="3.6" rx="1.6" fill="#6a4ad8"/><rect x="14.4" y="19.4" width="3.2" height="4.2" rx="1.2" fill="#6a4ad8"/><path d="M16 3.2v2.6M16 3.4l3.4 1.2-3.4 1.2" stroke="#ffd34a" stroke-width="1.2" fill="#ffd34a"/>`];
  if (typeof menuIconsApply === 'function') menuIconsApply();
}
function twRankLoad(){
  if (TW.sub || typeof NET === 'undefined' || !NET.db) return;
  try { TW.sub = NET.db.collection('players').orderBy('tower', 'desc').limit(20).onSnapshot(s => { TW.rows = s.docs.map(d => d.data()).filter(r => (r.tower | 0) > 0); reWin('tower'); }, () => {}); } catch (e) {}
}
EV.on('tick', () => { if (TW.sub && !winOpen('tower') && !(typeof RK !== 'undefined' && RK.tab === 'tower')){ try { TW.sub(); } catch (e) {} TW.sub = null; } });
WIN_RENDER.tower = function(){
  const pane = el('pane-tower'); if (!pane) return; const st = twSt(), cks = twCks(), why = twCan(); if (!cks.includes(TW.startF)) TW.startF = cks[cks.length - 1];
  twRankLoad(); const me = netName();
  const rows = TW.rows.length ? TW.rows.map((r, i) => `<div class="twr${clean(r.name, 18) === me ? ' me' : ''}"><i class="rk${i < 3 ? ' top' + i : ''}">${i + 1}</i><b class="pn"></b><small>${JOBS[r.job] ? nm(JOBS[r.job]) : ''}</small><em>${L('ชั้น', 'F')} ${clamp(r.tower | 0, 0, 99999)}</em></div>`).join('')
    : `<p class="hint">${typeof NET !== 'undefined' && NET.db ? L('ยังไม่มีใครขึ้นอันดับ · เป็นคนแรกเลย!', 'Nobody on the board yet · be the first!') : L('อันดับใช้ได้เมื่อออนไลน์', 'The ranking works online')}</p>`;
  pane.innerHTML = `<div class="twbox"><div class="twhero"><div class="twart">🗼</div><div><b>${L('หอคอยวายรา', 'Vayra Tower')}</b><small>${L('ไม่มีชั้นบนสุด · ปีนให้สูงที่สุด', 'No top floor · climb as high as you can')}</small>
      <div class="twstat"><span>${L('สถิติ', 'Best')} <b>${st.best || 0}</b></span><span>${L('ปีนไปแล้ว', 'Runs')} <b>${st.runs || 0}</b></span></div></div></div>
    <div class="twsec">${L('เริ่มที่ชั้น', 'Start at floor')}</div>
    <div class="twcks">${cks.map(c => `<button class="btn sm${c === TW.startF ? ' gold' : ''}" data-twck="${c}">${c}<small>Lv ${twLvC(c)}</small></button>`).join('')}</div>
    <button class="btn gold twgo" data-twgo="1" ${why ? 'disabled' : ''}>${TW.active ? L('กำลังปีนอยู่', 'Climbing now') : L(`เริ่มปีนชั้น ${TW.startF}`, `Climb from floor ${TW.startF}`)}</button>${why && !TW.active ? `<small class="twwhy">${why}</small>` : ''}
    <details class="twrules"><summary>${L('กติกาและรางวัล', 'Rules and rewards')}</summary><ul>
      <li>${L('ชั้น f มอนเลเวล 4 + 2f (ชั้น 148 = Lv 300 · สูงกว่านั้นมอนแข็งขึ้นทุกชั้น) · ดินแดนเปลี่ยนทุก 10 ชั้น', 'Floor f has Lv 4 + 2f monsters (Lv 300 at floor 148, tougher every floor past it) · the land changes every 10 floors')}</li>
      <li>${L(`ชั้นละ 1 รอบ จำกัดเวลา ${TW_T} วิ · ทุก 5 ชั้นมีผู้พิทักษ์ (${TW_TB} วิ) · ทุก 10 ชั้นผู้พิทักษ์มีหัวหน้าฝูง ★ 2 ตัว · ตั้งแต่ชั้น 10 มีวงแดงระเบิด`, `One wave a floor, ${TW_T} s · a guardian every 5th floor (${TW_TB} s) · two ★ elites with it every 10th · red blasts from floor 10`)}</li>
      <li>${L('ผ่านชั้นฟื้น HP/SP 25% · ทุก 5 ชั้นเลือกพร 1 ใน 3 ใช้ได้ตลอดการปีน', 'Clearing a floor heals 25% HP/SP · every 5th floor pick 1 of 3 blessings for the run')}</li>
      <li>${L('ทุกชั้นได้เบี้ย · ชั้นที่สูงกว่าสถิติเดิม: ◈ 1 ทุก 5 ชั้น (◈ 3 ทุก 10 ชั้น) และอุปกรณ์จากหีบบอสทุก 10 ชั้น', 'Bia every floor · above your old best: ◈ 1 every 5 floors (◈ 3 every 10) and a boss-chest piece every 10')}</li>
      <li>${L('ล้ม หมดเวลา หรือออก = จบการปีน · ผ่านชั้นที่ลงท้ายด้วย 0 แล้วเริ่มใหม่จากชั้นถัดไปได้', 'Falling, running out of time or leaving ends the run · pass a floor ending in 0 and you can start from the next one')}</li></ul></details>
    <div class="twsec">${L('อันดับหอคอย', 'Tower ranking')}</div><div class="twrank">${rows}</div></div>`;
  pane.querySelectorAll('.twr .pn').forEach((b, i) => { b.textContent = clean(TW.rows[i] && TW.rows[i].name, 18) || L('นักผจญภัย', 'Adventurer'); });
};
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-twck],[data-twgo]'); if (!t) return;
  if (t.dataset.twck){ TW.startF = +t.dataset.twck; reWin('tower'); return; }
  if (!t.disabled) twStart(TW.startF); });

/* ---------- the ranking ---------- */
if (typeof RK_TABS !== 'undefined' && typeof renderSocial === 'function'){ RK_TABS.push(['tower', 'หอคอย', 'Tower']);
  /* rank2.js writes the value line for its own tabs; on this tab it is rewritten with the floor */
  const _rs = renderSocial; renderSocial = function(){ const r = _rs.apply(this, arguments); if (RK.tab !== 'tower') return r;
    const box = el('soRank'); if (!box) return r; const rows = (RK.rows.tower || []).filter(x => RK.line === 'all' || rkLine(x.job) === RK.line).slice(0, 50);
    box.querySelectorAll('.item small').forEach((s, i) => { const x = rows[i]; if (x) s.textContent = `${JOBS[x.job] ? nm(JOBS[x.job]) : '—'} · ${L('ชั้น', 'Floor')} ${clamp(x.tower | 0, 0, 99999)}`; });
    return r; }; }

/* ---------- achievements, Wiki, what's new ---------- */
if (typeof ACH !== 'undefined' && typeof ACH_BY !== 'undefined'){
  for (const [id, tier, th, en, n, coin] of [['tower10', 0, 'ผู้ปีนหอคอย', 'Tower Climber', 10, 5], ['tower50', 2, 'ผู้พิชิตหอคอย', 'Tower Conqueror', 50, 30], ['tower150', 3, 'เหนือยอดหอคอย', 'Above the Spire', 150, 100]]){
    const a = {id, cat:'hunt', tier, th, en, dth:`ผ่านหอคอยวายราชั้น ${n}`, den:`Clear floor ${n} of the Vayra Tower`, prog:() => [(S.tower && S.tower.best) || 0, n], coin, title:[th, en]};
    ACH.push(a); ACH_BY[id] = a; }
  EV.on('tower', () => { if (typeof achCheck === 'function') achCheck(); });
}
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'tower', t:['หอคอยวายรา', 'Vayra Tower'], b:() => `<p>${L(`หอคอยไม่มีชั้นบนสุด ปีนคนเดียว (Lv ${TW_MIN}+) เปิดจากเมนู \"หอคอย\" หรือผู้เฝ้าประตูแสงในอาเรน`, `An endless tower climbed alone (Lv ${TW_MIN}+), from the \"Tower\" menu button or Gatekeeper Saeng in Aren`)}</p>
  <ul><li>${L('ชั้น f มอน Lv 4 + 2f · ชั้นละ 1 รอบ จำกัดเวลา · ทุก 5 ชั้นมีผู้พิทักษ์ · ทุก 10 ชั้นมีหัวหน้าฝูง ★', 'Floor f: Lv 4 + 2f monsters · one timed wave a floor · a guardian every 5th · ★ elites every 10th')}</li>
  <li>${L('ผ่านชั้นฟื้น 25% · ทุก 5 ชั้นเลือกพร · ตั้งแต่ชั้น 10 วงแดงระเบิด', 'Clearing heals 25% · a blessing every 5th floor · red blasts from floor 10')}</li>
  <li>${L('รางวัลครั้งแรกเมื่อทำสถิติใหม่: เหรียญวายราทุก 5 ชั้น อุปกรณ์ทุก 10 ชั้น · จุดเริ่มใหม่ทุก 10 ชั้น', 'New-best rewards: Vayra Coins every 5 floors, gear every 10 · a checkpoint every 10 floors')}</li>
  <li>${L('อันดับ 20 คนแรกในหน้าต่างหอคอย และแท็บ \"หอคอย\" ในอันดับของหน้าต่างสังคม', 'Top 20 in the Tower window and a \"Tower\" tab in the Social ranking')}</li></ul>`});

{ const st = document.createElement('style'); st.textContent = `
.twbox{display:flex;flex-direction:column;gap:8px;color:#1b1b1b}.twhero{display:flex;gap:12px;align-items:center;padding:10px;border-radius:12px;background:linear-gradient(135deg,#efe8ff,#fff6e0);border:1.5px solid #c8b8ff}
.twart{font-size:40px;line-height:1}.twhero b{font-size:18px;display:block}.twhero small{color:#4a3a6a}.twstat{display:flex;gap:14px;margin-top:4px}.twstat b{color:#5a2ad8;font-size:16px}
.twsec{font-weight:700;color:#3a2a8a;border-bottom:1.5px solid #e0d8ff;padding-bottom:2px}.twcks{display:flex;flex-wrap:wrap;gap:6px}.twcks .btn{display:flex;flex-direction:column;align-items:center;min-width:52px;line-height:1.1}.twcks small{font-size:10px;opacity:.8}
.twgo{align-self:flex-start;padding:8px 18px}.twwhy{color:#b0301a}.twrules ul{margin:4px 0;padding-left:18px;font-size:12.5px;line-height:1.45}.twrules summary{cursor:pointer;color:#3a2a8a;font-weight:600}
.twrank{display:flex;flex-direction:column;gap:3px;max-height:40vh;overflow-y:auto}.twr{display:grid;grid-template-columns:26px 1fr auto auto;gap:8px;align-items:center;padding:4px 6px;border-radius:8px;background:#f7f4ff}
.twr.me{outline:2px solid #ffd34a}.twr i{font-style:normal;font-weight:800;text-align:center;border-radius:50%;background:#e0d8ff}.twr i.top0{background:#ffd34a}.twr i.top1{background:#d8dde8}.twr i.top2{background:#e0a070}.twr small{color:#5a4a7a}.twr em{font-style:normal;font-weight:800;color:#5a2ad8}
.twsum .rk{color:#5a2ad8}`; document.head.appendChild(st); }
