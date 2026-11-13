/* VAYRATHEN — js/sys/invasion269.js — (v269) การรุกราน · the hourly invasion, fought together
   Every hour at :45 (Thailand time), for 15 minutes (v274), an army invades one hunting map — the same map for everyone (a
   hash of the hour), announced 5 minutes before. Everyone on that map fights it together:
   · INVADERS (⚔ red tag) keep coming round each player (up to 3 at a time, +2 for each other player there, at most 8), matched to your level, and march on you.
   · A «ไปช่วย» button on the bar warps you there for free (not from a dungeon or the tower).
   · ONE SHARED BAR: every invader anyone on the map defeats fills it (kills travel as room events, and every
     message carries the total, so a late arrival catches up). (v274) The goal is 300.
   · THE WAR COMMANDER: when the bar is full the invaders' commander appears — one HP bar shared by everyone on the map, tougher the more heroes there are
     (damage travels as a share of its HP, like the world boss).
   · While it lasts, half the map's own monsters stand aside and the region boss waits (as for the world boss).
   · RANKING: the bar shows the top three helpers on the map; the top one (with others there) gets +2 Vayra Coins and +50% Bia.
   · REWARD for everyone who helped (3 invaders or 1% of the commander, or anyone fighting alone): see invReward (v274:
     much bigger) · one reward per invasion · if the 15 minutes run out first, the army withdraws and pays a share.
   · (v274) the owner: 300 invaders (the same goal however many come), 15 minutes, more of them at once. */
'use strict';
const INV_MIN = 45, INV_LEN = 15, INV_WARN = 5, INV_GOAL = 300, INV_PER = 0;   // (v274) the owner: 300 invaders, 15 minutes
const INV = {key:null, map:-1, tot:0, my:0, myDmg:0, acc:0, sendT:0, spawnT:0, boss:null, warned:{}, done:{}, bar:null, bossHp:1};
function invWindow(){
  if (INV.forced && Date.now() < INV.forced.until) return {key:INV.forced.key, active:true, left:(INV.forced.until - Date.now()) / 6e4};
  if (globalThis.__VTEST__) return null;   // (v272) automated tests: only a forced invasion
  const c = thaiClock(), now = c.m + c.s / 60, key = `${dayKey()}-${c.h}`;
  if (now >= INV_MIN && now < INV_MIN + INV_LEN) return {key, active:true, left:INV_MIN + INV_LEN - now};
  if (now >= INV_MIN - INV_WARN && now < INV_MIN) return {key, active:false, soon:INV_MIN - now};
  return null;
}
// where: one of the open hunting maps (Lv 60 and under at the entrance, so most heroes can get there), never the
// world boss's map, never a town
function invMap(key){
  const wb = typeof wbMap === 'function' && typeof wbWindow === 'function' && wbWindow() ? wbMap(wbWindow().key) : -1;
  const ids = MAPS.map((m, i) => i).filter(i => i > 0 && MAPS[i] && MAPS[i].mobs && MAPS[i].mobs.length && MAPS[i].boss && !(typeof isTown === 'function' && isTown(i)) && (MAPS[i].lv || [99])[0] <= 60 && i !== wb);
  let h = 2166136261; for (const ch of 'inv' + key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ids.length ? ids[(h >>> 0) % ids.length] : -1;
}
const invPeers = () => (typeof NET !== 'undefined' && NET.mapRoom && NET.on ? NET.mapRoom.peers().filter(p => !p.isMe).length : 0);
const invGoal = () => INV_GOAL;
const invHere = w => w && w.active && MAP_ID === invMap(w.key) && !(typeof DG !== 'undefined' && DG.active) && !(typeof TW !== 'undefined' && TW.active);
/* level-matched monsters: the map's own kinds, with the strength of an ordinary monster of your level */
let INV_REF = null;
function invRef(Lv, boss){ if (!INV_REF) INV_REF = Object.values(MOB).filter(d => d && d.lvl && d.hp && !d.wb && !d.dg && !d.inv && d.atk && d.exp > 0);
  return INV_REF.filter(d => !!d.boss === boss).reduce((a, b) => (Math.abs(b.lvl - Lv) < Math.abs(a.lvl - Lv) ? b : a)); }
function invDef(kind, boss){
  const Lv = clamp(S.lvl + (boss ? 2 : -2), 5, 300), ref = invRef(Lv, boss), base = MOB[kind], k = Lv / ref.lvl, many = .7 + .45 * invPeers();   // the warlord is tougher the more heroes there are
  return {...base, name:boss ? `แม่ทัพ${base.name}` : base.name, en:boss ? `${base.en} Warlord` : base.en, lvl:Lv, hp:Math.round(ref.hp * k * (boss ? many : 1.1)),
    atk:[Math.round(ref.atk[0] * k * (boss ? .9 : .7)), Math.round(ref.atk[1] * k * (boss ? .9 : .7))], def:Math.round((ref.def || 0) * k), exp:Math.round(ref.exp * k * (boss ? 3 : 1.4)), jexp:Math.round((ref.jexp || 0) * k * (boss ? 3 : 1.4)),
    drops:boss ? [] : base.drops || [], card:null, cardRate:0, aggro:true, boss:false, inv:true, r:boss ? Math.round((base.r || 12) * 1.25) : base.r};   // the warlord is a giant ★ alpha, not a region boss: Auto fights it, and the region boss's clock and MVP are left alone
}
function invSpot(rMin, rMax){
  for (let i = 0; i < 70; i++){ const a = Math.random() * 6.283, d = rMin + Math.random() * (rMax - rMin), x = P.x + Math.cos(a) * d, y = P.y + Math.sin(a) * d * .8;
    if (x < 60 || y < 80 || x > W - 60 || y > H - 60 || !walkable(x, y, 16)) continue;
    if (typeof botgNear === 'function' && botgNear(x, y, 160)) continue; if (typeof CAMP !== 'undefined' && CAMP && Math.hypot(x - CAMP.x, y - CAMP.y) < 200) continue;
    if (typeof findPath === 'function' && !findPath(x, y, P.x, P.y)) continue;   // it must be able to walk to you (no spawning across water)
    return {x, y}; }
  return null;
}
function invSpawnOne(){
  const mp = MAPS[MAP_ID], kinds = (mp.mobs || []).filter(k => MOB[k] && !MOB[k].night); if (!kinds.length) return;
  const at = invSpot(300, 520); if (!at) return; const kind = kinds[(Math.random() * kinds.length) | 0];
  const m = spawnMob(kind, at.x, at.y, {zone:MAPZ}); m.def = invDef(kind, false); m.maxhp = m.hp = m.def.hp; m.inv = INV.key; m.tagTxt = ['ผู้รุกราน', 'Invader']; m.aggro = true;   // an army marches in: it comes for you
}
function invSpawnBoss(){
  const mp = MAPS[MAP_ID], kind = mp.boss && MOB[mp.boss] ? mp.boss : (mp.mobs || [])[0]; if (!kind) return;
  const at = invSpot(260, 420) || {x:P.x + 200, y:P.y}; const m = spawnMob(kind, at.x, at.y, {zone:MAPZ}); m.def = invDef(kind, true);
  m.maxhp = m.def.hp; m.hp = Math.max(1, Math.round(m.maxhp * INV.bossHp)); m.inv = INV.key; m.invBoss = true; m.split = true; m.aggro = true; m.tagTxt = ['แม่ทัพผู้รุกราน', 'Invading Warlord'];
  if (typeof makeElite === 'function'){ const hp = m.maxhp, f = m.hp / m.maxhp; makeElite(m); m.maxhp = hp; m.hp = Math.max(1, Math.round(hp * f)); }
  INV.boss = m; banner(L(`⚔ แม่ทัพผู้รุกรานปรากฏ! ร่วมกันล้มมัน`, `⚔ The invading warlord is here! Bring it down together`)); if (VFX && VFX.play) VFX.play('bossArrive', {x:m.x, y:m.y}); SFX.play && SFX.play('boom');
}
function invClear(){ for (const m of mobs) if (m.inv && !m.dead){ m.dead = true; m.deadT = 0; } INV.boss = null; }
function invSend(o){ if (typeof mapEmit === 'function' && typeof NET !== 'undefined' && NET.on && NET.mapRoom) mapEmit('inv', {key:INV.key, m:MAP_ID, tot:INV.tot, ...o}).catch(() => {}); }
EV.on('tick', dt => {
  if (PAUSED || !S || !S.lvl) return; const w = invWindow();
  // the warning, the bar, the end
  if (w && !w.active && !INV.warned[w.key]){ const id = invMap(w.key); if (id >= 0){ INV.warned[w.key] = 1;
    banner(L(`⚔ กองทัพผู้รุกรานจะบุก${nm(MAPS[id])}ในอีก ${Math.ceil(w.soon)} นาที!`, `⚔ An army will invade ${nm(MAPS[id])} in ${Math.ceil(w.soon)} min!`));
    log(L(`การรุกราน: ${nm(MAPS[id])} · ร่วมกันล้มทัพและแม่ทัพ รับเบี้ย เหรียญวายรา และลุ้นอุปกรณ์`, `Invasion: ${nm(MAPS[id])} · defeat the army and its warlord together for Bia, Vayra Coins and a chance at gear`), 'r'); } }
  if (!w || !w.active || w.key !== INV.key){ if (INV.key && (!w || w.key !== INV.key)){ if (!INV.done[INV.key]) invPartial(); invClear(); INV.key = null; }
    if (w && w.active && !INV.key){ INV.key = w.key; INV.tot = 0; INV.my = 0; INV.myDmg = 0; INV.bossHp = 1; } }
  invBar(w);
  if (!invHere(w) || P.dead || INV.done[w.key]) { if (!invHere(w)) for (const m of mobs) if (m.inv && !m.dead && MAP_ID !== invMap(w ? w.key : '')){ m.dead = true; m.deadT = 0; } return; }
  // an invader that cannot reach you (stuck far off for a while) falls back and another comes
  for (const m of mobs) if (m.inv && !m.dead && !m.invBoss){ if (Math.hypot(m.x - P.x, m.y - P.y) > 560) m.farT = (m.farT || 0) + dt; else m.farT = 0; if (m.farT > 12){ m.dead = true; m.deadT = 0; } }
  const full = INV.tot >= invGoal();
  if (!full){ if ((INV.spawnT -= dt) <= 0){ INV.spawnT = .7; if (mobs.filter(m => m.inv && !m.dead && !m.invBoss).length < Math.min(24, 8 + 4 * invPeers())) invSpawnOne(); } }   // (v274) a real army: up to 8 round you (+4 for each other hero, 24 at most)
  else if (!INV.boss || (INV.boss.dead && !INV.done[w.key]) || !mobs.includes(INV.boss)){ if (!INV.boss || !mobs.includes(INV.boss)) invSpawnBoss(); }
  if (INV.boss && !INV.boss.dead && INV.acc > 0 && (INV.sendT -= dt) <= 0){ INV.sendT = .5; invSend({k:'dmg', f:+INV.acc.toFixed(5)}); INV.acc = 0; }
});
// while the army is here, half the map's own monsters stand aside (as for the world boss), and the region boss waits
let invThinOn = false;
{ const _us = updSlots; updSlots = function(dt){ _us.apply(this, arguments); const w = invWindow(); const on = invHere(w) && !INV.done[w.key];
    if (on && typeof wbThin === 'function'){ wbThin(!invThinOn); bossTimer = Math.max(bossTimer, 30); } invThinOn = on; }; }
// my hits on the warlord: shared as a share of its HP
{ const _ad = applyDamage; applyDamage = function(m){ const h0 = m && m.invBoss ? m.hp : 0; const r = _ad.apply(this, arguments);
    if (m && m.invBoss && m.inv === INV.key){ const f = Math.max(0, h0 - Math.max(0, m.hp)) / (m.maxhp || 1); INV.acc += f; INV.myDmg += f; INV.bossHp = Math.max(0, m.hp / (m.maxhp || 1)); }
    return r; }; }
EV.on('kill', m => {
  if (!m || !m.inv || m.inv !== INV.key) return;
  if (!m.invBoss){ INV.my++; INV.tot++; invSend({k:'kill', n:1}); if (INV.tot === invGoal()) banner(L('⚔ ทัพแตกแล้ว! แม่ทัพกำลังมา…', '⚔ The army breaks! Its warlord is coming…')); return; }
  invSend({k:'dead'}); invReward();
});
/* (v272) what other games tell us is checked: each sender's kills and warlord damage are rate-limited (a burst, then
   about what a real hero can do), the bar counts only what passed, a claimed total is taken once (a late arrival's
   catch-up) and capped by the time the invasion has run, and the ranking shows only verified counts */
const INVP = {peers:new Map(), key:null, start:0};
function invPeer(id){ if (INVP.key !== INV.key){ INVP.key = INV.key; INVP.peers.clear(); INVP.start = Date.now(); }
  let p = INVP.peers.get(id); if (!p){ p = {k:0, kTok:4, dTok:.3, t:Date.now(), seen:false}; INVP.peers.set(id, p); }
  const now = Date.now(), dt = (now - p.t) / 1000; p.t = now; p.kTok = Math.min(4, p.kTok + dt / 1.2); p.dTok = Math.min(.3, p.dTok + dt * .06); return p; }
function onInv(msg){
  const d = msg.data || {}; if (msg.isMe || !INV.key || d.key !== INV.key || d.m !== MAP_ID) return;
  const p = invPeer(String(msg.peer || msg.by || '?'));
  if (!p.seen){ p.seen = true; const w = invWindow(), mins = w && w.active ? Math.max(0, INV_LEN - w.left) : 0, cap = Math.round(mins * 15 * (invPeers() + 1));   /* at most ~15 a minute for each hero there, since the invasion began */ const tot = clamp(+d.tot || 0, 0, Math.min(400, cap)); if (tot > INV.tot) INV.tot = tot; }   // a late arrival catches up once, within reason
  if (d.k === 'kill'){ if (p.kTok >= 1){ p.kTok -= 1; p.k++; INV.tot++; } return; }   // counted here, one by one
  if (d.k === 'dmg' && INV.boss && !INV.boss.dead){ const f = Math.min(clamp(+d.f || 0, 0, .35), p.dTok); p.dTok -= f; INV.boss.hp -= f * INV.boss.maxhp; INV.boss.flash = .08; INV.bossHp = Math.max(0, INV.boss.hp / INV.boss.maxhp); if (INV.boss.hp <= 0) killMob(INV.boss); }
  else if (d.k === 'dmg' && !INV.boss){ const f = Math.min(clamp(+d.f || 0, 0, .35), p.dTok); p.dTok -= f; INV.bossHp = clamp(INV.bossHp - f, .02, 1); }
  else if (d.k === 'dead' && INV.boss && !INV.boss.dead && INV.boss.hp <= INV.boss.maxhp * .5){ INV.boss.hp = 0; killMob(INV.boss); }
}
EV.on('netready', () => { if (typeof NET !== 'undefined' && NET.room && typeof mapOn === 'function') mapOn('inv', onInv); });
/* (v274) the owner wants players to take part: a win pays far more than before.
   · Vayra Coins 5–15 by how much you helped (invaders and warlord damage), +5 / +3 / +2 for the top three helpers
   · a gear chest: one piece of your level, Rare or better (Epic or better for the top helper)
   · EXP and Job EXP +30% for 30 minutes
   · wins are counted: 5 → title «ผู้พิทักษ์แผ่นดิน», 20 → «วีรชนต้านทัพ» and the Guardian Wings, 50 → «จอมทัพพิทักษ์วายรา»
     and the Golden Warlord Wings (only from invasions)
   If the 15 minutes run out first, the army withdraws and everyone who helped gets a share of the Bia and coins by how
   much of the army was beaten (no chest, no buff, no win counted). */
const INV_WINGS = {inv_wing:['w_seraph', 'ปีกผู้พิทักษ์แผ่นดิน', 'Guardian Wings', ['#fff4d8', '#e0402a', '#5a0a08'], '#ffd27a', '255,90,60', 'ember'],
  inv_wing2:['w_phoenix', 'ปีกจอมทัพทองคำ', 'Golden Warlord Wings', ['#fffbe0', '#ffc830', '#a05a00'], '#fff0a0', '255,210,90', 'sparkle']};
for (const id in INV_WINGS){ const [b, th, en, c, edge, glow, fx] = INV_WINGS[id]; if (typeof WINGS !== 'undefined' && WINGS[b] && !WINGS[id]){ WINGS[id] = {...WINGS[b], set:null, th, en, c, edge, glow, fx, src:'inv'}; delete WINGS[id].price; } }
const INV_TITLES = [[5, 'inv_t1', 'ผู้พิทักษ์แผ่นดิน', 'Guardian of the Land', null], [20, 'inv_t2', 'วีรชนต้านทัพ', 'Hero of the Line', 'inv_wing'], [50, 'inv_t3', 'จอมทัพพิทักษ์วายรา', 'Warlord-Guardian of Vayra', 'inv_wing2']];
const invWins = () => (S && S.invWins) | 0;
if (typeof ACH !== 'undefined' && typeof ACH_BY !== 'undefined') for (const [n, id, th, en] of INV_TITLES){ if (ACH_BY[id]) continue;
  const a = {id, cat:'world', tier:n >= 50 ? 3 : n >= 20 ? 2 : 1, th, en, dth:`ชนะการรุกราน ${n} ครั้ง`, den:`Win ${n} invasions`, prog:() => [Math.min(n, invWins()), n], coin:0, title:[th, en]}; ACH.push(a); ACH_BY[id] = a; }
BUFF_TH.invexp = ['พลังผู้พิทักษ์ EXP/JOB +30%', 'Guardian zeal EXP/JOB +30%']; BUFF_CAP.invexp = ['EXP+30%', 'EXP+30%']; BUFF_IC.invexp = ['#ffb070', '<path d="M10 2l2.4 5 5.6.8-4 3.9.9 5.5L10 14.6 5.1 17.2l.9-5.5-4-3.9 5.6-.8z"/>'];
{ const _ge = gainExp; gainExp = function(b, j){ if (P && P.buffs && P.buffs.invexp && P.buffs.invexp.t > 0){ b = Math.round(b * 1.3); j = Math.round((j || 0) * 1.3); } return _ge.call(this, b, j); }; }
function invChest(Lv, minR){ if (typeof GEAR_LIST === 'undefined') return '';
  const pool = GEAR_LIST.filter(g => g[1] !== 'ammo' && g[4] <= Lv && g[4] >= Lv - 30 && (typeof lineOk !== 'function' || lineOk(g[6]))); if (!pool.length) return '';
  const id = makeInst(pool[Math.floor(Math.random() * pool.length)][0], Math.max(minR, rollRarity('boss'))); addItem(id, 1); return nm(ITEMS[id]); }
function invReward(){
  const key = INV.key; if (!key || INV.done[key]) return; INV.done[key] = 1; INV.doneAt = Date.now(); S.invDone = S.invDone || {}; if (S.invDone[key]) return; S.invDone[key] = 1;
  for (const m of mobs) if (m.inv === key && !m.dead && !m.invBoss){ m.dead = true; m.deadT = 0; } INV.boss = null;
  const ok = INV.my >= 3 || INV.myDmg >= .01 || invPeers() === 0;
  if (!ok){ banner(L('ทัพผู้รุกรานพ่ายแพ้! แต่คุณช่วยไม่ถึงเกณฑ์รับรางวัล', 'The invasion is beaten! You did not help enough for a reward')); return; }
  const Lv = clamp(S.lvl, 1, 300), R = invRank(), rank = R.length > 1 ? R.findIndex(r => r.me) : -1;
  const bia = Lv * 400 * (rank === 0 ? 1.5 : 1); S.bia += bia;
  const coins = 5 + Math.min(10, Math.floor(INV.my / 20 + INV.myDmg * 10)) + (rank >= 0 && rank < 3 ? [5, 3, 2][rank] : 0);
  if (typeof coinAdd === 'function') coinAdd(coins, L('การรุกราน', 'invasion'));
  const gear = invChest(Lv, rank === 0 ? 2 : 1);
  addBuff('invexp', {t:1800});
  S.invWins = invWins() + 1; let extra = '';
  for (const [n, , th, en, wing] of INV_TITLES) if (S.invWins === n){ extra = L(`ฉายาใหม่ «${th}»`, `New title «${en}»`); if (wing && typeof ACC !== 'undefined'){ (ACC.wardrobe = ACC.wardrobe || {})[wing] = 1; if (typeof accSave === 'function') accSave(true); extra += L(` · ${WINGS[wing].th} (ตู้เสื้อผ้า)`, ` · ${WINGS[wing].en} (wardrobe)`); } }
  if (typeof achCheck === 'function') setTimeout(achCheck, 0);
  if (rank >= 0 && rank < 3) log(L(`${['🥇', '🥈', '🥉'][rank]} คุณช่วยมากเป็นอันดับ ${rank + 1} (${INV.my} ตัว) · เหรียญพิเศษ +${[5, 3, 2][rank]}${rank === 0 ? ' · เบี้ยเพิ่ม 50% · หีบระดับล้ำค่าขึ้นไป' : ''}`, `${['🥇', '🥈', '🥉'][rank]} You were helper no. ${rank + 1} (${INV.my}) · +${[5, 3, 2][rank]} bonus coins${rank === 0 ? ' · +50% Bia · an Epic-or-better chest' : ''}`), 'g');
  banner(L(`🏆 ขับไล่ผู้รุกรานสำเร็จ! +${fmtN(bia)} เบี้ย · ◈ ${coins} · ${gear || 'หีบอุปกรณ์'} · EXP/JOB +30% 30 นาที${extra ? ' · ' + extra : ''}`, `🏆 The invasion is driven back! +${fmtN(bia)} Bia · ◈ ${coins} · ${gear || 'gear chest'} · EXP/JOB +30% for 30 min${extra ? ' · ' + extra : ''}`));
  log(L(`การรุกราน: ล้มผู้รุกราน ${INV.my} ตัว · ${fmtN(bia)} เบี้ย · เหรียญวายรา ${coins}${gear ? ' · ' + gear : ''} · ชนะแล้ว ${S.invWins} ครั้ง`, `Invasion: ${INV.my} invaders · ${fmtN(bia)} Bia · ${coins} Vayra Coins${gear ? ' · ' + gear : ''} · ${S.invWins} wins`), 'g');
  if (typeof sfx272 === 'function') try { sfx272('fanfare'); } catch (e) {}
  if (typeof bump === 'function') bump('invasions'); dirty = true; if (typeof save === 'function') save();
}
/* time ran out: a share by how much of the army fell, for those who helped */
function invPartial(){
  const key = INV.key; if (!key || INV.done[key]) return; INV.done[key] = 1; INV.doneAt = Date.now(); S.invDone = S.invDone || {}; if (S.invDone[key]) return; S.invDone[key] = 1;
  if (INV.my < 3 && INV.myDmg < .01){ if (INV.tot > 0) banner(L('กองทัพผู้รุกรานถอยทัพไปแล้ว…', 'The invaders withdraw…')); return; }
  const f = clamp(INV.tot / invGoal(), 0, 1) * (INV.boss || INV.tot >= invGoal() ? 1 : .8), Lv = clamp(S.lvl, 1, 300), bia = Math.round(Lv * 400 * f * .6), coins = Math.max(1, Math.round(5 * f));
  S.bia += bia; if (typeof coinAdd === 'function') coinAdd(coins, L('การรุกราน (หมดเวลา)', 'invasion (time up)'));
  banner(L(`⌛ หมดเวลา! ทัพถอยไป · ตีได้ ${Math.round(f * 100)}% · +${fmtN(bia)} เบี้ย · ◈ ${coins}`, `⌛ Time up! The army withdraws · ${Math.round(f * 100)}% beaten · +${fmtN(bia)} Bia · ◈ ${coins}`));
  log(L(`การรุกราน (หมดเวลา): ทัพแตก ${INV.tot}/${invGoal()} · ของคุณ ${INV.my} ตัว · ${fmtN(bia)} เบี้ย · เหรียญ ${coins} (ชนะเพื่อรับหีบอุปกรณ์ บัฟ EXP และนับครั้งฉายา)`, `Invasion (time up): ${INV.tot}/${invGoal()} beaten · yours ${INV.my} · ${fmtN(bia)} Bia · ${coins} coins (win for the chest, the EXP buff and a title count)`), 'g');
  dirty = true; if (typeof save === 'function') save();
}
/* the bar at the top of the screen */
function invBar(w){
  let b = INV.bar; if (!b){ const host = document.getElementById('wrap'); if (!host) return; b = INV.bar = document.createElement('div'); b.id = 'invBar'; host.appendChild(b);
    const st = document.createElement('style'); st.textContent = `#invBar{position:absolute;top:calc(env(safe-area-inset-top,0px) + 6px);left:50%;transform:translateX(-50%);z-index:30;pointer-events:none;max-width:min(520px,60vw);
      padding:4px 12px 5px;border-radius:10px;background:rgba(40,10,10,.78);border:1px solid rgba(255,120,90,.8);color:#ffe6dc;font:700 clamp(10px,1.5vw,14px)/1.25 Sarabun,"Noto Sans Thai",sans-serif;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,.35)}
      #invBar[hidden]{display:none}#invBar .ibrk{display:flex;justify-content:center;gap:10px;margin-top:2px;font-size:.88em;font-weight:700;color:#ffe8c0}#invBar .ibrk i{font-style:normal;white-space:nowrap}#invBar .ibrk i.me{color:#fff36a}#invBar .ibgo{pointer-events:auto;margin-left:8px;padding:1px 10px;border-radius:999px;border:1px solid #ffd27a;background:linear-gradient(#ffcf6a,#e08a20);color:#3a1a04;font:800 clamp(10px,1.4vw,13px)/1.4 Sarabun,"Noto Sans Thai",sans-serif;cursor:pointer;box-shadow:0 2px 0 #8a4a0a}#invBar .ibgo:active{transform:translateY(1px)}#invBar .ib{display:block;height:5px;margin-top:3px;border-radius:3px;background:rgba(255,255,255,.18);overflow:hidden}#invBar .ib i{display:block;height:100%;background:linear-gradient(90deg,#ff7a4a,#ffd060)}`;
    document.head.appendChild(st); }
  const fmt = m => `${Math.floor(m)}:${String(Math.floor((m % 1) * 60)).padStart(2, '0')}`;
  let txt = '', pct = -1;
  if (!w){ b.hidden = true; return; }
  const id = invMap(w.key), where = id >= 0 ? nm(MAPS[id]) : '';
  if (!w.active) txt = L(`⚔ การรุกรานที่${where} ในอีก ${fmt(w.soon)}`, `⚔ Invasion at ${where} in ${fmt(w.soon)}`);
  else if (INV.done[w.key]){ if (Date.now() - (INV.doneAt || 0) > 8000){ b.hidden = true; return; } txt = L('🏆 ขับไล่ผู้รุกรานสำเร็จ', '🏆 The invasion was driven back'); }   // (v298) shown for a few seconds, not for the rest of the invasion's hour
  else if (MAP_ID !== id) txt = L(`⚔ กำลังมีการรุกรานที่${where} · เหลือ ${fmt(w.left)}`, `⚔ Invasion under way at ${where} · ${fmt(w.left)} left`);
  else if (INV.boss && !INV.boss.dead){ txt = L(`⚔ แม่ทัพผู้รุกราน · ${fmt(w.left)}`, `⚔ Invading Warlord · ${fmt(w.left)}`); pct = INV.boss.hp / INV.boss.maxhp; }
  else { const g = invGoal(); txt = L(`⚔ การรุกราน · ทัพ ${Math.min(INV.tot, g)}/${g} · ของคุณ ${INV.my} · ${fmt(w.left)}`, `⚔ Invasion · army ${Math.min(INV.tot, g)}/${g} · yours ${INV.my} · ${fmt(w.left)}`); pct = Math.min(1, INV.tot / g); }
  const go = w && !INV.done[w.key] && MAP_ID !== id && id >= 0 ? ` <button class="ibgo" data-invgo>${L(w.active ? 'ไปช่วย' : 'ไปรอ', w.active ? 'Join' : 'Go')}</button>` : '';
  let rk = ''; if (w && w.active && MAP_ID === id && !INV.done[w.key]){ const R = invRank(); if (R.length > 1) rk = `<span class="ibrk">${R.slice(0, 3).map((r, i) => `<i class="${r.me ? 'me' : ''}">${['🥇', '🥈', '🥉'][i]} ${escH(r.n)} ${r.k}</i>`).join('')}</span>`; }
  const html = `${escH(txt)}${go}${rk}${pct >= 0 ? `<span class="ib"><i style="width:${Math.round(pct * 100)}%"></i></span>` : ''}`;
  if (b.hidden) b.hidden = false; if (b._h !== html){ b._h = html; b.innerHTML = html; }
}
/* (v271) who helps most: my count travels in my presence, the bar shows the top three */
if (typeof wbPres !== 'undefined'){ const _wp = wbPres; wbPres = () => ({..._wp(), ivk:INV.key && MAP_ID === invMap(INV.key) ? INV.key : null, ivn:INV.key ? INV.my : null}); }
function invRank(){
  const out = [{n:typeof netName === 'function' ? netName() : (S.name || ''), k:INV.my, me:true}];
  if (typeof NET !== 'undefined' && NET.mapRoom && NET.on) for (const p of NET.mapRoom.peers()){ const q = p.presence || {}; if (p.isMe || q.ivk !== INV.key || typeof q.ivn !== 'number') continue;
    const v = INVP.key === INV.key && INVP.peers.get(String(p.peer)); out.push({n:(typeof clean === 'function' ? clean(q.n, 14) : String(q.n || '').slice(0, 14)) || L('นักผจญภัย', 'Adventurer'), k:Math.min(clamp(q.ivn | 0, 0, 999), v ? v.k + 2 : 2)}); }   // never more than we saw them do
  return out.sort((a, b) => b.k - a.k);
}
/* the bar's button: straight to the invaded map (free, like the world boss's warp) */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-invgo]'); if (!b) return; const w = invWindow(); if (!w) return; const id = invMap(w.key); if (id < 0 || id === MAP_ID) return;
  if (typeof DG !== 'undefined' && DG.active){ toast(L('ออกจากดันเจียนก่อนนะ', 'Leave the dungeon first')); return; }
  if (typeof TW !== 'undefined' && TW.active){ toast(L('ออกจากหอคอยก่อนนะ', 'Leave the tower first')); return; }
  warpTo(id); dirty = true; });
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'invasion', t:['การรุกราน', 'Invasions'], b:() => L(
  `<p>ทุกชั่วโมงนาทีที่ ${INV_MIN} (เวลาไทย) กองทัพผู้รุกรานบุกแผนที่ล่าหนึ่งแห่ง (ทุกคนเห็นแผนที่เดียวกัน) นาน ${INV_LEN} นาที · ประกาศก่อน ${INV_WARN} นาที · ปุ่ม «ไปช่วย» บนแถบวาร์ปไปฟรี · ทุกคนช่วยกันล้มทัพ ${INV_GOAL} ตัว แล้วแม่ทัพจะออกมา · ชนะ: เบี้ยตามเลเวล เหรียญวายรา 5–15 ตามที่ช่วย (อันดับ 1–3 ได้เพิ่ม 5/3/2) หีบอุปกรณ์ระดับหายากขึ้นไป (อันดับ 1 ล้ำค่าขึ้นไป) และ EXP/JOB +30% 30 นาที · ชนะครบ 5 / 20 / 50 ครั้งได้ฉายาผู้พิทักษ์ และปีกที่มีเฉพาะการรุกราน · หมดเวลาก่อน: ได้เบี้ยและเหรียญตามส่วนที่ทัพแตก</p>`,
  `<p>Every hour at :${INV_MIN} (Thai time) an army invades one hunting map (the same for everyone) for ${INV_LEN} minutes, announced ${INV_WARN} minutes before · the «Join» button warps you there free · beat ${INV_GOAL} invaders together, then the warlord comes · a win: Bia by level, 5–15 Vayra Coins by how much you helped (+5/+3/+2 for the top three), a Rare-or-better gear chest (Epic or better for the top helper) and EXP/JOB +30% for 30 minutes · 5 / 20 / 50 wins earn guardian titles and wings found only here · if time runs out: a share of Bia and coins by how much of the army fell</p>`)});
