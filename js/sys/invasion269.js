/* VAYRATHEN — js/sys/invasion269.js — (v269) การรุกราน · the hourly invasion, fought together
   Every hour at :45 (Thailand time), for 10 minutes, an army invades one hunting map — the same map for everyone (a
   hash of the hour), announced 5 minutes before. Everyone on that map fights it together:
   · INVADERS (⚔ red tag) keep coming round each player (up to 3 at a time, +2 for each other player there, at most 8), matched to your level, and march on you.
   · ONE SHARED BAR: every invader anyone on the map defeats fills it (kills travel as room events, and every
     message carries the total, so a late arrival catches up). The goal grows with the players there (40, +25 each).
   · THE WAR COMMANDER: when the bar is full the invaders' commander appears — one HP bar shared by everyone on the map, tougher the more heroes there are
     (damage travels as a share of its HP, like the world boss).
   · While it lasts, half the map's own monsters stand aside and the region boss waits (as for the world boss).
   · REWARD for everyone who helped (3 invaders or 1% of the commander, or anyone fighting alone): Bia by level,
     3 Vayra Coins, 30% a piece of gear (Rare or better is likelier). One reward per invasion. If the hour runs out
     first, the army withdraws. */
'use strict';
const INV_MIN = 45, INV_LEN = 10, INV_WARN = 5, INV_GOAL = 40, INV_PER = 25;
const INV = {key:null, map:-1, tot:0, my:0, myDmg:0, acc:0, sendT:0, spawnT:0, boss:null, warned:{}, done:{}, bar:null, bossHp:1};
function invWindow(){
  if (INV.forced && Date.now() < INV.forced.until) return {key:INV.forced.key, active:true, left:(INV.forced.until - Date.now()) / 6e4};
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
const invGoal = () => Math.min(200, INV_GOAL + INV_PER * invPeers());
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
  if (!w || !w.active || w.key !== INV.key){ if (INV.key && (!w || w.key !== INV.key)){ if (mobs.some(m => m.inv === INV.key && !m.dead) && !INV.done[INV.key]) banner(L('กองทัพผู้รุกรานถอยทัพไปแล้ว…', 'The invaders withdraw…')); invClear(); INV.key = null; }
    if (w && w.active && !INV.key){ INV.key = w.key; INV.tot = 0; INV.my = 0; INV.myDmg = 0; INV.bossHp = 1; } }
  invBar(w);
  if (!invHere(w) || P.dead || INV.done[w.key]) { if (!invHere(w)) for (const m of mobs) if (m.inv && !m.dead && MAP_ID !== invMap(w ? w.key : '')){ m.dead = true; m.deadT = 0; } return; }
  // an invader that cannot reach you (stuck far off for a while) falls back and another comes
  for (const m of mobs) if (m.inv && !m.dead && !m.invBoss){ if (Math.hypot(m.x - P.x, m.y - P.y) > 560) m.farT = (m.farT || 0) + dt; else m.farT = 0; if (m.farT > 12){ m.dead = true; m.deadT = 0; } }
  const full = INV.tot >= invGoal();
  if (!full){ if ((INV.spawnT -= dt) <= 0){ INV.spawnT = 1.4; if (mobs.filter(m => m.inv && !m.dead && !m.invBoss).length < Math.min(8, 3 + 2 * invPeers())) invSpawnOne(); } }
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
function onInv(msg){
  const d = msg.data || {}; if (msg.isMe || !INV.key || d.key !== INV.key || d.m !== MAP_ID) return;
  const tot = clamp(+d.tot || 0, 0, 400); if (tot > INV.tot) INV.tot = tot;
  if (d.k === 'dmg' && INV.boss && !INV.boss.dead){ const f = clamp(+d.f || 0, 0, .35); INV.boss.hp -= f * INV.boss.maxhp; INV.boss.flash = .08; INV.bossHp = Math.max(0, INV.boss.hp / INV.boss.maxhp); if (INV.boss.hp <= 0) killMob(INV.boss); }
  else if (d.k === 'dmg' && !INV.boss){ INV.bossHp = clamp(INV.bossHp - clamp(+d.f || 0, 0, .35), .02, 1); }
  else if (d.k === 'dead' && INV.boss && !INV.boss.dead && INV.boss.hp <= INV.boss.maxhp * .5){ INV.boss.hp = 0; killMob(INV.boss); }
}
EV.on('netready', () => { if (typeof NET !== 'undefined' && NET.room && typeof mapOn === 'function') mapOn('inv', onInv); });
function invReward(){
  const key = INV.key; if (!key || INV.done[key]) return; INV.done[key] = 1; S.invDone = S.invDone || {}; if (S.invDone[key]) return; S.invDone[key] = 1;
  for (const m of mobs) if (m.inv === key && !m.dead && !m.invBoss){ m.dead = true; m.deadT = 0; } INV.boss = null;
  const ok = INV.my >= 3 || INV.myDmg >= .01 || invPeers() === 0;
  if (!ok){ banner(L('ทัพผู้รุกรานพ่ายแพ้! แต่คุณช่วยไม่ถึงเกณฑ์รับรางวัล', 'The invasion is beaten! You did not help enough for a reward')); return; }
  const Lv = clamp(S.lvl, 1, 300), bia = Lv * 220; S.bia += bia; if (typeof coinAdd === 'function') coinAdd(3, L('การรุกราน', 'invasion'));
  let gear = '';
  if (Math.random() < .3 && typeof GEAR_LIST !== 'undefined'){ const pool = GEAR_LIST.filter(g => g[1] !== 'ammo' && g[4] <= Lv && g[4] >= Lv - 30 && (typeof lineOk !== 'function' || lineOk(g[6])));
    if (pool.length){ const id = makeInst(pool[Math.floor(Math.random() * pool.length)][0], rollRarity('elite')); addItem(id, 1); gear = nm(ITEMS[id]); } }
  banner(L(`🏆 ขับไล่ผู้รุกรานสำเร็จ! +${bia.toLocaleString()} เบี้ย · เหรียญวายรา +3${gear ? ' · ' + gear : ''}`, `🏆 The invasion is driven back! +${bia.toLocaleString()} Bia · +3 Vayra Coins${gear ? ' · ' + gear : ''}`));
  log(L(`การรุกราน: ล้มผู้รุกราน ${INV.my} ตัว · ได้ ${bia.toLocaleString()} เบี้ย${gear ? ' และ ' + gear : ''}`, `Invasion: ${INV.my} invaders defeated · ${bia.toLocaleString()} Bia${gear ? ' and ' + gear : ''}`), 'g');
  if (typeof bump === 'function') bump('invasions'); dirty = true; if (typeof save === 'function') save();
}
/* the bar at the top of the screen */
function invBar(w){
  let b = INV.bar; if (!b){ const host = document.getElementById('wrap'); if (!host) return; b = INV.bar = document.createElement('div'); b.id = 'invBar'; host.appendChild(b);
    const st = document.createElement('style'); st.textContent = `#invBar{position:absolute;top:calc(env(safe-area-inset-top,0px) + 6px);left:50%;transform:translateX(-50%);z-index:30;pointer-events:none;max-width:min(520px,60vw);
      padding:4px 12px 5px;border-radius:10px;background:rgba(40,10,10,.78);border:1px solid rgba(255,120,90,.8);color:#ffe6dc;font:700 clamp(10px,1.5vw,14px)/1.25 Sarabun,"Noto Sans Thai",sans-serif;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,.35)}
      #invBar[hidden]{display:none}#invBar .ib{display:block;height:5px;margin-top:3px;border-radius:3px;background:rgba(255,255,255,.18);overflow:hidden}#invBar .ib i{display:block;height:100%;background:linear-gradient(90deg,#ff7a4a,#ffd060)}`;
    document.head.appendChild(st); }
  const fmt = m => `${Math.floor(m)}:${String(Math.floor((m % 1) * 60)).padStart(2, '0')}`;
  let txt = '', pct = -1;
  if (!w){ b.hidden = true; return; }
  const id = invMap(w.key), where = id >= 0 ? nm(MAPS[id]) : '';
  if (!w.active) txt = L(`⚔ การรุกรานที่${where} ในอีก ${fmt(w.soon)}`, `⚔ Invasion at ${where} in ${fmt(w.soon)}`);
  else if (INV.done[w.key]) txt = L('🏆 ขับไล่ผู้รุกรานสำเร็จ', '🏆 The invasion was driven back');
  else if (MAP_ID !== id) txt = L(`⚔ กำลังมีการรุกรานที่${where} · เหลือ ${fmt(w.left)}`, `⚔ Invasion under way at ${where} · ${fmt(w.left)} left`);
  else if (INV.boss && !INV.boss.dead){ txt = L(`⚔ แม่ทัพผู้รุกราน · ${fmt(w.left)}`, `⚔ Invading Warlord · ${fmt(w.left)}`); pct = INV.boss.hp / INV.boss.maxhp; }
  else { const g = invGoal(); txt = L(`⚔ การรุกราน · ทัพ ${Math.min(INV.tot, g)}/${g} · ของคุณ ${INV.my} · ${fmt(w.left)}`, `⚔ Invasion · army ${Math.min(INV.tot, g)}/${g} · yours ${INV.my} · ${fmt(w.left)}`); pct = Math.min(1, INV.tot / g); }
  const html = `${escH(txt)}${pct >= 0 ? `<span class="ib"><i style="width:${Math.round(pct * 100)}%"></i></span>` : ''}`;
  if (b.hidden) b.hidden = false; if (b._h !== html){ b._h = html; b.innerHTML = html; }
}
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'invasion', t:['การรุกราน', 'Invasions'], b:() => L(
  `<p>ทุกชั่วโมงนาทีที่ ${INV_MIN} (เวลาไทย) กองทัพผู้รุกรานบุกแผนที่ล่าหนึ่งแห่ง (ทุกคนเห็นแผนที่เดียวกัน) นาน ${INV_LEN} นาที · มีประกาศก่อน ${INV_WARN} นาที · ผู้รุกราน (ป้ายแดง ⚔) แข็งแรงตามเลเวลของคุณ · ทุกคนในแผนที่ช่วยกันเติมแถบทัพ (${INV_GOAL} ตัว +${INV_PER} ต่อผู้เล่นที่อยู่ด้วย) ครบแล้วแม่ทัพปรากฏ HP ใช้ร่วมกันทุกคน · ล้มแม่ทัพได้: เบี้ยตามเลเวล เหรียญวายรา 3 และลุ้นอุปกรณ์ 30% (ต้องล้มผู้รุกราน 3 ตัว หรือตีแม่ทัพ 1% ขึ้นไป)</p>`,
  `<p>Every hour at :${INV_MIN} (Thai time) an army invades one hunting map (the same for everyone) for ${INV_LEN} minutes, announced ${INV_WARN} minutes before · invaders (red ⚔ tag) match your level · everyone on the map fills one shared bar (${INV_GOAL}, +${INV_PER} per extra player), then the warlord appears with one HP bar for all · beat it for Bia by level, 3 Vayra Coins and a 30% chance at gear (help with 3 invaders or 1% of the warlord)</p>`)});
