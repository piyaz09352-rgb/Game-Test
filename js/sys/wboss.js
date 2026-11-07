/* VAYRATHEN — js/sys/wboss.js
   World boss (บอสโลก): Rahu, the Eclipse Asura, descends on a hunting map three times a day (v84: a different map each
   time, picked from the appearance's key so every player agrees; never the town, where it would weigh the game down),
   Thailand time 12:30, 19:30 and 21:30, and stays 15 minutes. A warning goes out 10 minutes before.
   It matches the level of whoever fights it; online, everyone on the capital map shares one HP bar
   (each game sends the share of HP it took as room events, and late arrivals pick up the lowest HP that
   others report). Everyone who dealt at least 0.5% of its HP when it falls gets Vayra Coins, Bia and a
   piece of gear rolled on the world-boss table (Rare or better), with a chance at the Naga Warlord
   Armour or the Golden War Mala costume. One reward per appearance. */
'use strict';

const WB_TIMES = [[12, 30], [19, 30], [21, 30]], WB_LEN = 15;
const WB = {key:null, m:null, acc:0, sendT:0, my:0, warned:{}, forced:null, left:0};
function wbWindow(){
  if (WB.forced && Date.now() < WB.forced.until) return {key:WB.forced.key, active:true, left:(WB.forced.until - Date.now()) / 6e4};
  const c = thaiClock(), now = c.h * 60 + c.m + c.s / 60;
  for (let i = 0; i < WB_TIMES.length; i++){ const st = WB_TIMES[i][0] * 60 + WB_TIMES[i][1], key = `${dayKey()}-${i}`;
    if (now >= st && now < st + WB_LEN) return {key, active:true, left:st + WB_LEN - now};
    if (now >= st - 10 && now < st) return {key, active:false, soon:st - now}; }
  return null;
}
/* (v84) where this appearance lands: one of the hunting maps, the same for everyone (a hash of the key) */
function wbMap(key){ const ids = MAPS.map((m, i) => i).filter(i => i > 0 && MAPS[i].mobs && MAPS[i].mobs.length);
  let h = 2166136261; for (const ch of String(key)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ids[(h >>> 0) % ids.length]; }
const wbMapName = key => { const mp = MAPS[wbMap(key)]; return mp ? nm(mp) : ''; };
function wbPrewarm(){ if (WB.warm || typeof SHEETS === 'undefined' || !SHEETS || !SHEETS.asuraking) return; WB.warm = 1; SPR.warm(SHEETS, ['asuraking']); }
function wbNext(){ const c = thaiClock(), now = c.h * 60 + c.m; for (const [h, m] of WB_TIMES) if (h * 60 + m > now) return `${h}:${String(m).padStart(2, '0')}`; return `${WB_TIMES[0][0]}:${String(WB_TIMES[0][1]).padStart(2, '0')}`; }
function wbDef(){
  const Lv = clamp(S.lvl + 5, 10, 300), ref = Object.values(MOB).filter(d => d.boss && !d.wb).reduce((a, b) => Math.abs(b.lvl - Lv) < Math.abs(a.lvl - Lv) ? b : a), k = Lv / ref.lvl;
  const base = MOB.asuraking;
  return {...base, name:'ราหูอสูรจันทรคราส', en:'Rahu, the Eclipse Asura', lvl:Lv, hp:Math.round(ref.hp * k * k * 3.2), atk:[Math.round(ref.atk[0] * k * 1.1), Math.round(ref.atk[1] * k * 1.1)], def:Math.round(ref.def * k),
    exp:Math.round(ref.exp * k * 2), jexp:Math.round(ref.jexp * k * 2), drops:[], card:null, cardRate:0, boss:true, wb:true, aggro:true, bossSkills:['meteor', 'wave', 'summon', 'quake', 'enrage']};
}
function wbSpawn(w){
  const d = wbDef(); let x = (MAPZ.x0 + MAPZ.x1) / 2, y = (MAPZ.y0 + MAPZ.y1) / 2;
  for (let i = 0; i < 60; i++){ const tx = MAPZ.x0 + 120 + Math.random() * (MAPZ.x1 - MAPZ.x0 - 240), ty = MAPZ.y0 + 120 + Math.random() * (MAPZ.y1 - MAPZ.y0 - 240);
    if (walkable(tx, ty, 30) && !(CAMP && Math.hypot(tx - CAMP.x, ty - CAMP.y) < 320)){ x = tx; y = ty; break; } }
  wbPrewarm(); wbThin(true);
  const m = spawnMob('asuraking', x, y, {zone:MAPZ}); m.def = d; m.maxhp = d.hp; m.split = true; m.wb = true; m.roamT = 30;
  let f = 1; if (NET.mapRoom) for (const p of NET.mapRoom.peers()){ const q = p.presence || {}; if (!p.isMe && q.wbk === w.key && typeof q.wb === 'number') f = Math.min(f, clamp(q.wb, .01, 1)); }
  m.hp = Math.round(d.hp * f); WB.m = m; WB.key = w.key; WB.my = 0; WB.acc = 0;
  banner(L(`☠ ราหูอสูรจันทรคราสลงมาที่${nm(MAPS[MAP_ID])}!`, `☠ Rahu, the Eclipse Asura, has landed in ${nm(MAPS[MAP_ID])}!`)); SFX.music('worldboss');
  VFX.play('jobChange', {x, y}); log(L('บอสโลกปรากฏ! ร่วมมือกันล้มมันภายใน 15 นาที', 'World boss! Bring it down within 15 minutes'), 'r');
}
function wbHit(dmg){ if (!WB.m) return; const f = dmg / WB.m.maxhp; WB.acc += f; WB.my += f; }
EV.on('tick', dt => {
  if (PAUSED || !S || !S.lvl) return; const w = wbWindow();
  if (w && !w.active && !WB.warned[w.key]){ WB.warned[w.key] = 1; banner(L(`บอสโลกจะปรากฏที่${wbMapName(w.key)}ในอีก ${Math.ceil(w.soon)} นาที! · กดวาร์ปที่แถบเควส`, `A world boss appears in ${wbMapName(w.key)} in ${Math.ceil(w.soon)} minutes! · warp from the quest bar`)); }
  if (w && MAP_ID === wbMap(w.key)) wbPrewarm();   // paint it before it lands, so the landing never hitches
  if (w && w.active && MAP_ID === wbMap(w.key) && !WB.m && !(S.wbDone || {})[w.key] && !(typeof NM !== 'undefined' && NM.slave)) wbSpawn(w);
  if (WB.m && (WB.m.dead || !mobs.includes(WB.m))){ if (!WB.m.dead) WB.m = null; }
  if (WB.m && !WB.m.dead && (!w || !w.active || w.key !== WB.key || MAP_ID !== wbMap(WB.key))){ WB.m.dead = true; WB.m.deadT = 0; WB.m = null; if (w === null || !w || !w.active) banner(L('ราหูหายลับไปกับเงามืด… รอรอบหน้า', 'Rahu vanished into the shadows… until next time')); }
  WB.left = w && w.active ? w.left : 0;
  // share my damage a few times a second
  if (typeof nmActive === 'function' && nmActive()) WB.acc = 0;
  if (WB.m && WB.acc > 0 && (WB.sendT -= dt) <= 0){ WB.sendT = .5; if (NET.room && NET.on) mapEmit('wb', {k:'dmg', key:WB.key, f:+WB.acc.toFixed(5), m:MAP_ID}).catch(() => {}); WB.acc = 0; }
});
function onWb(msg){
  const d = msg.data || {}; if (msg.isMe || !WB.m || WB.m.dead || d.key !== WB.key || d.m !== MAP_ID) return;
  if (d.k === 'dead'){ if (WB.m.hp > WB.m.maxhp * .5) return; WB.m.hp = 0; killMob(WB.m); return; }   // someone landed the last hit (ignored while it still has over half its HP)
  if (d.k !== 'dmg') return;
  const f = clamp(+d.f || 0, 0, .35); WB.m.hp -= f * WB.m.maxhp; WB.m.flash = .08;
  if (WB.m.hp <= 0) killMob(WB.m);
}
EV.on('netready', () => { if (NET.room) mapOn('wb', onWb, () => {}); });
let wbPres = () => (WB.m && !WB.m.dead ? {wb:+(WB.m.hp / WB.m.maxhp).toFixed(3), wbk:WB.key} : {wb:null, wbk:null});
/* the reward */
const wbEligible = () => WB.my >= .005 || !(NET.room && NET.mapRoom && NET.mapRoom.peers().some(p => !p.isMe));
const wbReward = m => {
  if (!m.wb) return; const key = WB.key; WB.m = null;
  if (NET.room && NET.on){ if (WB.acc > 0) mapEmit('wb', {k:'dmg', key, f:+WB.acc.toFixed(5), m:MAP_ID}).catch(() => {}); WB.acc = 0; mapEmit('wb', {k:'dead', key, m:MAP_ID}).catch(() => {}); } S.wbDone = S.wbDone || {}; if (S.wbDone[key]) return; S.wbDone[key] = 1;
  if (!wbEligible()){ banner(L('ราหูพ่ายแพ้! แต่คุณช่วยไม่ถึงเกณฑ์รับรางวัล', 'Rahu has fallen! You did not deal enough damage for a reward')); return; }
  const Lv = m.def.lvl; S.bia += Lv * 400; coinAdd(10, L('บอสโลก', 'world boss'));
  const pool = GEAR_LIST.filter(g => g[1] !== 'ammo' && g[4] <= Lv && g[4] >= Lv - 35 && lineOk(g[6]) && (g[1] !== 'weapon' || g[6].wtype === JOBS[S.job].weapon.type));
  if (pool.length){ const b = pool[Math.floor(Math.random() * pool.length)][0], id = makeInst(b, Math.max(1, rollRarity('wb'))); if (typeof sockRoll === 'function') sockRoll(id, 'wb'); addItem(id, 1); log(L(`รางวัลบอสโลก: ${nm(ITEMS[id])} (${RAR[ITEMS[id].rar].th})`, `World boss reward: ${nm(ITEMS[id])} (${RAR[ITEMS[id].rar].en})`), 'g'); SFX.play('drop' + ITEMS[id].rar); if (ITEMS[id].rar >= 3) bump('legend'); if (ITEMS[id].rar >= 2) bump('epic'); }
  for (const c of ['c_dragon', 'hc_mala']) if (Math.random() < .12){ if (!cosGrant(c)) coinAdd(10, L('ชุดซ้ำ', 'duplicate costume')); }
  bump('wbkills'); EV.emit('wboss', key); banner(L('☀ ราหูพ่ายแพ้! แสงกลับคืนสู่อาณาจักร', '☀ Rahu is defeated! Light returns to the realm')); dirty = true; save();
};
EV.on('kill', wbReward);
{ const _qt = questTracker; questTracker = function(){ let h = _qt(); const w = wbWindow();
    if (w && w.active && !(S.wbDone || {})[w.key]) h += `<br><span class="wbline">☠ ${L('บอสโลกที่', 'World boss in ')}${wbMapName(w.key)} · ${Math.ceil(w.left)} ${L('นาที', 'min')}${WB.m ? ` · HP ${Math.max(0, Math.round(WB.m.hp / WB.m.maxhp * 100))}% · ${L('ดาเมจคุณ', 'yours')} ${(WB.my * 100).toFixed(1)}%` : ''}${MAP_ID !== wbMap(w.key) ? ` <button class="btn sm" data-wbwarp>${L('วาร์ป', 'Warp')}</button>` : ''}</span>`;
    else if (w && !w.active) h += `<br><span class="wbline">☠ ${L('บอสโลกที่', 'World boss in ')}${wbMapName(w.key)} ${L('ในอีก', 'in')} ${Math.ceil(w.soon)} ${L('นาที', 'min')}${MAP_ID !== wbMap(w.key) ? ` <button class="btn sm" data-wbwarp>${L('วาร์ป', 'Warp')}</button>` : ''}</span>`;
    return h; }; }
/* (v84) the warp button on the quest bar: straight to the boss's map */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-wbwarp]'); if (!b) return; const w = wbWindow(); if (!w) return;
  if (typeof DG !== 'undefined' && DG.active){ toast(L('ออกจากดันเจียนก่อนนะ', 'Leave the dungeon first')); return; }
  warpTo(wbMap(w.key)); dirty = true; });
/* (v84) fewer small monsters while Rahu is here: every other spawn point rests, so a crowded fight stays smooth */
function wbThin(now){ spawnSlots.forEach((s, i) => { if (i % 2) { s.timer = Math.max(s.timer || 0, 1); if (now && s.mob && !s.mob.dead && s.mob !== P.target){ s.mob.dead = true; s.mob.deadT = 0; s.mob.vanish = true; } } }); }
{ const _us = updSlots; updSlots = function(dt){ _us(dt); if (WB.m && !WB.m.dead){ wbThin(false); bossTimer = Math.max(bossTimer, 30); } }; }
/* for testing / events: start one now (on this appearance's map) */
function wbForce(min = 15){ WB.forced = {key:'f' + Date.now(), until:Date.now() + min * 6e4}; }
