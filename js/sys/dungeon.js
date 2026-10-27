/* VAYRATHEN — js/sys/dungeon.js
   Party dungeons (ดันเจี้ยน). Gatekeeper Saeng in Aren opens a private copy of a region for you or your
   party: three waves of its monsters and then its guardian, all scaled to the party's average level and
   toughened for every extra member. Only players who entered with the same code share the instance (its own
   room, so other players on that region never see it). 15 minutes to clear; falling or leaving takes you out.
   Clearing pays Vayra Coins, Bia and a guaranteed piece of gear rolled on the boss table.
   Monsters run through the shared-combat host (netmob.js): the room host spawns the waves for everyone. */
'use strict';

const DUNGEONS = [
  {id:'cave', base:6, min:10, th:'ถ้ำเงาเชียงดาว', en:'Shadow Caves of Chiang Dao', d:['ค้างคาวและแมงมุมในถ้ำมืด ราชินีแมงมุมรออยู่ลึกสุด', 'Bats and spiders in the dark; the Spider Matriarch waits at the bottom']},
  {id:'badan', base:17, min:40, th:'วังบาดาลนาคา', en:'Naga Underpalace', d:['วังใต้บาดาลที่นาคราชกริ้วโกรธ', 'The palace beneath the earth where the Naga King rages']},
  {id:'meru', base:20, min:80, th:'หอคอยอสูรเขาพระสุเมรุ', en:'Asura Spire of Mount Meru', d:['ด่านสุดท้ายก่อนถึงราชาอสูร', 'The last trial before the Asura King']}];
DUNGEONS.forEach(d => { d.name = d.th; });
const DG = {active:false, entering:false, code:'', did:'', lv:1, pc:1, wave:0, waveT:0, t0:0, done:false, ret:null, exitT:0, invite:null};
const DG_TIME = 15 * 60;
/* a monster scaled to level lv for a party of pc: same for every player, so mirrors match the host */
function dgDef(type, code){
  const lv = Math.floor(code / 10), pc = clamp(code % 10, 1, 5), b = MOB[type], k = lv / Math.max(1, b.lvl), boss = !!b.boss, hpMul = (boss ? 3.3 : 1) * (1 + (pc - 1) * (boss ? .7 : .35));
  return {...b, lvl:lv, hp:Math.max(30, Math.round(b.hp * k * k * hpMul)), atk:[Math.max(1, Math.round(b.atk[0] * k)), Math.max(2, Math.round(b.atk[1] * k))], def:Math.round(b.def * k),
    exp:Math.max(1, Math.round(b.exp * k * 1.6)), jexp:Math.max(1, Math.round(b.jexp * k * 1.6)), drops:b.drops || [], card:b.card, cardRate:b.cardRate, aggro:true, dg:true};
}
const dgInfo = () => DUNGEONS.find(d => d.id === DG.did);
function dgEnter(did, code, lv, pc){
  const D = DUNGEONS.find(d => d.id === did); if (!D) return;
  if (S.lvl < D.min){ toast(L(`ต้อง Lv ${D.min} ขึ้นไป`, `Requires Lv ${D.min}+`)); return; }
  DG.ret = DG.active ? DG.ret : {map:MAP_ID, x:P.x, y:P.y};
  Object.assign(DG, {active:true, entering:true, code, did, lv:clamp(lv | 0, D.min, 300), pc:clamp(pc | 0, 1, 5), wave:0, waveT:3, t0:T, done:false, exitT:0});
  closeDialog(); for (const w of WIN_IDS) if (UIS.open[w]) closeWin(w);
  loadMap(D.base); DG.entering = false;
  spawnSlots = []; mobs = []; boss = null; bossTimer = 1e9;
  P.x = W / 2 - 200; P.y = H / 2; pushOut(P, 12);
  banner(L(`${D.th} · Lv ${DG.lv}${DG.pc > 1 ? ` · ปาร์ตี้ ${DG.pc} คน` : ''}`, `${D.en} · Lv ${DG.lv}${DG.pc > 1 ? ` · party of ${DG.pc}` : ''}`)); SFX.play('warp'); VFX.play('jobChange', {x:P.x, y:P.y});
  dgLabel(); dirty = true;
}
function dgExit(msg){
  if (!DG.active) return; const r = DG.ret || {map:0, x:VSPAWN.x, y:VSPAWN.y}; DG.active = false; DG.ret = null;
  loadMap(r.map); P.x = r.x; P.y = r.y; if (msg) banner(msg); SFX.play('warp'); dirty = true; save();
}
function dgLabel(){ const e = document.getElementById('mapName'), D = dgInfo(); if (e && D && DG.active) e.textContent = `⚔ ${nm(D)} · ${DG.done ? L('สำเร็จ', 'cleared') : `${L('ด่าน', 'wave')} ${Math.min(4, DG.wave)}/4`}`; }
/* the host spawns each wave when the last one is gone */
function dgSpawnWave(){
  const D = dgInfo(), mp = MAPS[D.base], code = DG.lv * 10 + DG.pc; DG.wave++;
  const boss3 = DG.wave >= 4, kinds = mp.mobs.filter(t => !MOB[t].night), n = boss3 ? 1 : 5 + DG.pc * 2 + DG.wave;
  for (let i = 0; i < n; i++){ const type = boss3 ? mp.boss : kinds[(i + DG.wave) % kinds.length];
    let x = W / 2 + 120 + Math.cos(i * 2.4) * (80 + i * 14), y = H / 2 + Math.sin(i * 2.4) * (60 + i * 10);
    for (let k = 0; k < 20 && !walkable(x, y, MOB[type].r); k++){ x = W / 2 + rand(-300, 300); y = H / 2 + rand(-220, 220); }
    const m = spawnMob(type, x, y, {zone:MAPZ}); m.dgc = code; m.def = dgDef(type, code); m.maxhp = m.hp = m.def.hp; m.dg = true; m.split = true; m.aggro = true;
    if (boss3){ m.bcd = 3; m.roamT = 99; VFX.play('bossArrive', {x, y}); } else VFX.play('bossSummon', {x, y}); }
  banner(boss3 ? L(`♛ ผู้พิทักษ์ ${nm(MOB[mp.boss])} ปรากฏ!`, `♛ The guardian ${nm(MOB[mp.boss])} appears!`) : L(`ด่านที่ ${DG.wave}/4`, `Wave ${DG.wave}/4`)); SFX.play(boss3 ? 'wbhorn' : 'quest'); dgLabel();
}
function dgKilled(m){ if (!DG.active || !m.dg || !m.def.boss || DG.done) return; DG.done = true; dgReward(); }
function dgReward(){
  const D = dgInfo(), lv = DG.lv, idx = DUNGEONS.indexOf(D);
  S.bia += lv * 300 * (1 + idx * .5); coinAdd(5 + idx * 3, L('ดันเจี้ยน', 'dungeon'));
  const pool = GEAR_LIST.filter(g => g[1] !== 'ammo' && g[4] <= lv + 5 && g[4] >= lv - 30 && lineOk(g[6]) && (g[1] !== 'weapon' || g[6].wtype === JOBS[S.job].weapon.type));
  if (pool.length){ const id = rollGear(pool[Math.floor(Math.random() * pool.length)][0], 'boss', P.x, P.y - 20); addItem(id, 1); log(L(`หีบสมบัติดันเจี้ยน: ${nm(ITEMS[id])}`, `Dungeon chest: ${nm(ITEMS[id])}`), 'g'); }
  bump('dungeons'); EV.emit('dungeon', D.id); VFX.play('coins', {x:P.x, y:P.y - 30}); SFX.play('drop2');
  banner(L(`ผ่าน${D.th}! ออกอัตโนมัติใน 45 วินาที`, `${D.en} cleared! Leaving in 45 seconds`)); DG.exitT = 45; dgLabel(); save();
}
EV.on('kill', m => dgKilled(m));
EV.on('map', () => { if (DG.active && !DG.entering){ DG.active = false; } });
EV.on('tick', dt => {
  if (!DG.active || PAUSED) return;
  const left = DG_TIME - (T - DG.t0);
  if (DG.exitT > 0 && (DG.exitT -= dt) <= 0){ dgExit(L('กลับจากดันเจี้ยนแล้ว', 'Back from the dungeon')); return; }
  if (left <= 0 && !DG.done){ dgExit(L('หมดเวลา! ออกจากดันเจี้ยน', 'Time is up! You leave the dungeon')); return; }
  // waves: the room host (or a solo player) spawns; everyone else mirrors
  const hostHere = !(typeof NM !== 'undefined' && NM.slave);
  if (hostHere && !DG.done){ const alive = mobs.some(m => m.dg && !m.dead);
    if (!alive && DG.wave < 4){ if ((DG.waveT -= dt) <= 0){ dgSpawnWave(); DG.waveT = 4; } } }
  if (!hostHere && NET.mapRoom){ const h = NET.mapRoom.peers().find(p => p.peer === NM.hostPeer), q = h && h.presence; if (q && +q.dgw > DG.wave){ DG.wave = clamp(+q.dgw | 0, 0, 4); dgLabel(); } }
});
const dgPres = () => (DG.active ? {dgw:DG.wave} : {dgw:null});
/* the room name: a dungeon is its own private room */
const dgRoom = () => (DG.active ? `dg-${DG.code}` : null);
/* the party leader opens it for everyone in the party */
function dgOpen(did){
  const D = DUNGEONS.find(d => d.id === did); if (!D) return; const mates = typeof partyMembers === 'function' ? partyMembers() : [];
  const lvls = [S.lvl, ...mates.filter(p => !p.isMe).map(p => clamp((p.presence || {}).l | 0, 1, 300))], lv = Math.max(D.min, Math.round(lvls.reduce((a, b) => a + b, 0) / lvls.length)), pc = clamp(lvls.length, 1, 5);
  const code = (NET.party ? NET.party.replace(/\W/g, '').slice(-6) : 's') + Date.now().toString(36).slice(-5);
  if (NET.room && NET.party && mates.length > 1) NET.room.emit('dg', {k:'open', pt:NET.party, code, did, lv, pc, n:netName()}).catch(() => {});
  dgEnter(did, code, lv, pc);
}
function onDg(msg){
  const d = msg.data || {}; if (msg.isMe || d.k !== 'open' || !NET.party || d.pt !== NET.party) return;
  const D = DUNGEONS.find(x => x.id === d.did); if (!D || typeof d.code !== 'string' || !/^\w{2,24}$/.test(d.code)) return;
  sysPrompt(L(`${clean(d.n, 18)} เปิด${D.th} (Lv ${d.lv | 0}) · เข้าร่วมไหม?`, `${clean(d.n, 18)} opened ${D.en} (Lv ${d.lv | 0}) · join?`), () => dgEnter(d.did, d.code, d.lv, d.pc), () => {}); SFX.play('chat');
}
EV.on('netready', () => { if (NET.room) NET.room.on('dg', onDg, () => {}); });
{ const _qt = questTracker; questTracker = function(){ let h = _qt(); if (DG.active){ const D = dgInfo(), left = Math.max(0, DG_TIME - (T - DG.t0));
    h = `<b>⚔ ${nm(D)}</b> · ${DG.done ? L('สำเร็จ!', 'Cleared!') : `${L('ด่าน', 'Wave')} ${Math.min(4, DG.wave)}/4`} · ${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}<br><span class="dgline">${L('มอนที่เหลือ', 'Left')}: ${mobs.filter(m => m.dg && !m.dead).length}</span> <a class="dgexit" data-dgexit="1">${L('ออก', 'Leave')}</a>${h ? '<br>' + h : ''}`; }
  return h; }; }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-dgexit],[data-dgopen]'); if (!t) return;
  if (t.dataset.dgexit) askConfirm(L('ออกจากดันเจี้ยน', 'Leave dungeon'), L('ออกตอนนี้จะไม่ได้รางวัล ออกไหม?', 'Leave now without the reward?'), L('ออก', 'Leave'), () => dgExit(L('ออกจากดันเจี้ยนแล้ว', 'You left the dungeon')));
  else dgOpen(t.dataset.dgopen); });
addTownNpc({id:'gatekeeper', name:'ผู้เฝ้าประตูแสง', en:'Gatekeeper Saeng', role:'ดันเจี้ยนปาร์ตี้', roleEn:'Party dungeons', x:440, y:760},
  {job:'sovereign', look:{sex:'m', hair:0, color:'hairSilver'}, gear:{armor:'c_royal', head:'hc_tiara'}});
NPC_OPEN.gatekeeper = n => {
  const mates = typeof partyMembers === 'function' ? partyMembers().length : 0;
  npcFrame(n, L('ประตูมิตินำไปสู่แคว้นที่ถูกอสูรกลืน ไปคนเดียวก็ได้ แต่ไปกับปาร์ตี้จะสนุกกว่า ศัตรูจะแข็งแกร่งตามจำนวนพวกเจ้า', 'These gates open onto regions swallowed by the Asura. Go alone if you must; with a party it is better, and the foes grow with your numbers.'),
    `<div class="shop">${DUNGEONS.map(D => `<div class="srow${S.lvl >= D.min ? '' : ' locked'}"><span class="ic">⚔</span><div class="nm"><b>${nm(D)}</b><small>Lv ${D.min}+ · ${L(...D.d)}</small></div><button class="btn sm gold" data-dgopen="${D.id}" ${S.lvl >= D.min ? '' : 'disabled'}>${mates > 1 ? L('เปิดให้ปาร์ตี้', 'Open for party') : L('เข้า', 'Enter')}</button></div>`).join('')}</div>
     <p class="hint">${mates > 1 ? L(`ปาร์ตี้ ${mates} คน: ทุกคนจะได้รับคำเชิญ · มอนแข็งขึ้นตามจำนวนคน`, `Party of ${mates}: everyone gets an invite · monsters scale with your numbers`) : L('ชวนเพื่อนเข้าปาร์ตี้ก่อน (แตะตัวละครผู้เล่นอื่น) เพื่อลงด้วยกัน', 'Invite friends to a party first (tap another player) to go in together')} · ${L('3 ด่าน + บอส · 15 นาที', '3 waves + boss · 15 min')}</p>`);
};
