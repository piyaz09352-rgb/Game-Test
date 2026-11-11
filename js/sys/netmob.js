/* VAYRATHEN — js/sys/netmob.js
   Shared combat: everyone on a map fights the SAME monsters.
   · One player per map room is the HOST (the lowest peer id among players running this version). The host
     spawns every monster (normal spawns, the region boss, the world boss, dungeon waves) and publishes a
     snapshot in its room presence 5× a second: id, kind, position, HP ‰, facing, flags, zone, owner.
   · Everyone else mirrors that list. A monster that aggroes on you (or that you hit first) is CLAIMED by you:
     your game runs its AI against you and reports its position in your presence; the host follows your report
     and re-publishes it, so a third player sees the same chase. When it calms down the claim is released.
   · Hits travel as room events (share of max HP, so level-scaled bosses work for everyone); the host keeps
     the authoritative HP. Whoever lands the killing blow gets the drops and EXP (party sharing still applies)
     and announces the kill; everyone else sees it die.
   · Skills are announced too, so you see other players' meteors, slashes, beams and heals.
   Alone on a map nothing changes: you are your own host and nothing is sent. Everything received is
   untrusted: ids, kinds and numbers are checked and clamped.

   v27 — WORLD CLOCK MODE (no host on field maps)
   · On ordinary maps nobody hosts any more. Every game builds the same world from the clock: each spawn slot has a
     generation; a monster's id, home spot, elite roll and wandering path are all derived from (map, slot,
     generation, world time), so everyone sees the same monster in the same place without anyone sending it.
   · A kill bumps that slot's generation and stamps the time (room event `mk`); the slot respawns a few seconds of
     world time later — for everybody at once. Newcomers ask (`wq`) and get the table of generations (`wg`).
   · The region boss comes from the world clock and the shared MVP board (bossclock.js), with an id taken from its
     last kill time; the festival spirit comes from the 15-minute festival clock.
   · Chasing still needs one game to run the AI: the player a monster goes after holds it and reports its position
     and HP (`wc` in presence). If two claim the same monster the lower peer id keeps it. Nobody else is special:
     anyone can leave or hide the tab and the world goes on for the others.
   · Dungeons and the siege are instances run by one game, so they keep the host model below. A player on an
     older version on the map also falls back to the host model. */
'use strict';

const NM = {mode:null, leader:false, gen:{}, deadX:new Set(), keys:[], holding:false, wqT:0, host:false, slave:false, hostPeer:null, tag:Math.random().toString(36).slice(2, 4), seq:0, snapT:0, byId:new Map(), hitQ:new Map(), hitT:0, lastMq:-1, mq:0, fxT:0, me:null};
const ZONE_C = () => ({a:ZA, b:ZB, n:ZN, z:MAPZ});
const zoneCode = z => (z === ZA ? 'a' : z === ZB ? 'b' : z === ZN ? 'n' : 'z');
const nmPeers = () => (NET.mapRoom ? NET.mapRoom.peers().filter(p => p.kind === 'viewer' && p.presence && p.presence.nm && !(typeof kickHas === 'function' && kickHas(p.presence.n)) && !(typeof netIdleGhost === 'function' && netIdleGhost(p))) : []);   // (v180) nor heroes frozen in place for 5 minutes   // (kicklist.js: heroes the GM removed never count)
const nmActive = () => NM.host || NM.slave || NM.mode === 'world';
const nmWorld = () => NM.mode === 'world';
const nmMe = () => { const r = NET.mapRoom; const me = r && r.peers().find(p => p.sameTab); return me ? me.peer : null; };
/* who hosts this room: the lowest peer id among players that run netmob (needs at least two of us) */
function nmElect(){
  const ps = nmPeers(); NM.me = nmMe();
  if (!NM.me || ps.length < 2 || !ps.some(p => p.sameTab)){ if (nmActive()) nmStop(); return; }
  const h = ps.map(p => p.peer).sort()[0]; NM.leader = h === NM.me;
  // field maps run on the world clock when everyone here has this version; instances (dungeon, siege) keep a host
  if (!nwInstanced() && ps.every(p => +p.presence.nm >= 2)){ if (NM.mode !== 'world') nwStart(); return; }
  if (NM.mode === 'world') nwStop();
  if (h !== NM.hostPeer){ const was = NM.hostPeer; NM.hostPeer = h; if (h === NM.me) nmBecomeHost(was); else nmBecomeSlave(); }
}
function nmStop(){ if (NM.mode === 'world') nwStop(); NM.host = NM.slave = false; NM.hostPeer = null; NM.snap = null; for (const m of mobs){ m.netOwner = null; m.mine = false; } }
function nmBecomeHost(){
  NM.host = true; NM.slave = false;
  // adopt what we mirrored: tie each monster to a free spawn slot of its kind so we do not double-spawn
  for (const m of mobs){ if (m.dead || m.minion) continue; const s = spawnSlots.find(s => (!s.mob || s.mob.dead) && s.type === m.type); if (s) s.mob = m; if (m.def.boss && !m.wb && !m.dg) boss = m; m.netOwner = m.mine ? NM.me : m.netOwner; }
  if (typeof log === 'function') log(L('คุณเป็นผู้ดูแลมอนสเตอร์ของแผนที่นี้', 'You now host the monsters of this map'));
}
function nmBecomeSlave(){
  NM.host = false; NM.slave = true; NM.lastMq = -1; NM.snap = null;
  // our own spawns go: the host's world replaces them (summoned minions of a boss we hold stay)
  for (const m of mobs) if (!m.nid && !m.minion && !m.dead && !m.dummy){ m.dead = true; m.deadT = 1; m.vanish = true; if (P.target === m) P.target = null; }
  for (const s of spawnSlots) s.mob = null;
  if (boss && !boss.nid) boss = null;
}
const nmSlave = () => NM.slave || NM.mode === 'world';   // world mode: no game spawns monsters on its own (the clock does)
const nmLeader = () => NM.mode === 'world' ? NM.leader : !NM.slave;

/* ---------- host: snapshot ---------- */
function nmSnapshot(){
  // only what matters to someone: monsters near any player (bosses, the world boss and dungeon foes always), at most 70
  const pl = [P, ...[...NET.ghosts.values()]], near = m => Math.min(...pl.map(p => Math.hypot(p.x - m.x, p.y - m.y)));
  const peers = [NM.me], oi = p => { if (!p) return -1; let i = peers.indexOf(p); if (i < 0){ peers.push(p); i = peers.length - 1; } return i; };
  const live = mobs.filter(m => !m.dead && !m.vanish && !m.dummy).map(m => ({m, k:m.def.boss || m.wb || m.dg ? -1 : near(m)})).filter(o => o.k < 1100).sort((a, b) => a.k - b.k).slice(0, 70);
  const list = [];
  for (const {m} of live){ if (!m.nid){ m.nid = NM.tag + (++NM.seq).toString(36); NM.byId.set(m.nid, m); }
    const owner = m.netOwner || (m.aggro ? NM.me : null);
    const f = (m.moving ? 1 : 0) | (m.atkT < .3 ? 2 : 0) | (m.aggro ? 4 : 0) | (m.wb ? 8 : 0) | (m.minion ? 16 : 0) | (m.enraged ? 32 : 0);
    list.push([m.nid, m.type, Math.round(m.x), Math.round(m.y), Math.max(0, Math.round(m.hp / m.maxhp * 1000)), m.dir | 0, f, zoneCode(m.zone), oi(owner), m.dg ? m.dgc || 0 : 0, typeof mobEx === 'function' ? mobEx(m) : ''].join(',')); }
  return {p:peers, m:list.join(';')};
}
/* ---------- slave: apply the host's snapshot ---------- */
function nmApply(snap){
  if (!snap || typeof snap.m !== 'string') return; const peers = Array.isArray(snap.p) ? snap.p : [], seen = new Set(), Z = ZONE_C();
  for (const row of snap.m.split(';').slice(0, 80)){
    const e = row.split(','); if (e.length < 9) continue; const [nid, type] = e, [x, y, hp, dir, f] = e.slice(2, 7).map(Number), z = e[7], oi = +e[8], lv = +e[9] || 0;
    if (typeof nid !== 'string' || nid.length > 16 || !MOB[type]) continue; seen.add(nid);
    let m = NM.byId.get(nid);
    if (!m || (m.dead && m.deadT > 1.5)){
      m = spawnMob(type, clamp(+x, 0, W), clamp(+y, 0, H), {zone:Z[z] || MAPZ, minion:!!(f & 16)}); m.nid = nid; NM.byId.set(nid, m);
      if (f & 8 && typeof wbDef === 'function'){ m.def = wbDef(); m.maxhp = m.def.hp; m.wb = true; m.split = true; WB.m = m; }
      else if (lv && typeof dgDef === 'function'){ m.dgc = lv; m.def = dgDef(type, lv); m.maxhp = m.def.hp; m.dg = true; m.split = true; }
      else if (MOB[type].boss) boss = m;
      if (typeof mobExApply === 'function') mobExApply(m, e[10] || '');
      m.hp = m.maxhp * clamp(hp, 0, 1000) / 1000;
    }
    if (m.dead) continue;
    const owner = peers[oi] || null; m.netOwner = owner;
    if (owner !== NM.me || !m.mine){
      if (m.mine && T - (m.claimT || 0) < 1.2 && owner !== NM.me && owner){ /* our claim is still on its way */ }
      if (owner && owner !== NM.me) m.mine = false;
      if (!m.mine){ m.nx = clamp(+x, 0, W); m.ny = clamp(+y, 0, H); m.ndir = clamp(dir | 0, 0, 7); m.aggro = !!(f & 4); if (f & 2 && m.atkT > .5){ m.lunge = .2; m.atkT = 0; } m.enraged = !!(f & 32); }
    }
    if (typeof mobExApply === 'function') mobExApply(m, e[10] || '');
    const sh = m.maxhp * clamp(hp, 0, 1000) / 1000;
    if (sh < m.hp) m.hp = Math.max(1, sh); else if (sh > m.hp + m.maxhp * .03 && T - (m.myHitT || -9) > 2) m.hp = sh;
  }
  for (const [nid, m] of NM.byId){ if (!seen.has(nid) && !m.dead && !m.mine){ m.dead = true; m.deadT = 0; m.vanish = true; if (P.target === m) P.target = null; if (m === boss) boss = null; NM.byId.delete(nid); } }
}
/* presence fields for my map room: I run netmob, and the monsters I hold (position + flags) */
function nmPres(){
  if (document.hidden) return {nm:0, cm:''};   // a hidden tab (or a phone in the pocket) stops running: it neither hosts nor holds monsters
  const out = {nm:2, cm:''};
  if (NM.mode === 'world'){ out.wc = nwHeld(); out.wv = nwSig(); return out; }
  if (NM.host && NM.snap) Object.assign(out, NM.snap);
  if (NM.slave){ const cm = []; for (const m of mobs) if (m.nid && !m.dead && m.mine) cm.push(`${m.nid}:${Math.round(m.x)}:${Math.round(m.y)}:${m.dir | 0}:${(m.moving ? 1 : 0) | (m.atkT < .3 ? 2 : 0)}`); out.cm = cm.slice(0, 20).join(','); }
  return out;
}
/* each frame: should this monster's AI run here? (true = handled, skip the AI) */
function nmUpd(m, dt){
  if (!nmActive() || m.dead) return false;
  if (NM.mode === 'world') return nwUpd(m, dt);
  const remote = NM.slave ? !m.mine : (m.netOwner && m.netOwner !== NM.me);
  if (!remote) return false;
  // a monster someone else holds (or the host runs): glide to where they say it is
  if (m.nx != null){ const dx = m.nx - m.x, dy = m.ny - m.y, d = Math.hypot(dx, dy);
    if (d > 240){ m.x = m.nx; m.y = m.ny; } else if (d > .5){ const k = Math.min(1, dt * 9); m.x += dx * k; m.y += dy * k; }
    m.moving = d > 2; if (m.moving) m.dir = SPR.dirFromVec(dx, dy); else if (m.ndir != null) m.dir = m.ndir; }
  m.flash = Math.max(0, m.flash - dt); m.atkT += dt; m.hurtT = Math.max(0, m.hurtT - dt);
  // a slave claims an unheld aggressive monster that notices it (the host decides if two claim at once)
  if (NM.slave && !m.netOwner && !P.dead && m.def.aggro && Math.hypot(m.x - P.x, m.y - P.y) < (m.def.boss ? 240 : 150) && !inVillage(P)) nmClaim(m);
  return true;
}
function nmClaim(m){ if (!(NM.slave || NM.mode === 'world') || !m.nid || m.mine) return; m.mine = true; m.claimT = T; m.aggro = true; m.netOwner = NM.me; m.nx = null; NET.presT = 0; }
/* after its AI ran: let go of a monster that went back home */
function nmAfter(m, dt){
  if (!(NM.slave || NM.mode === 'world') || !m.mine) return;
  if (NM.mode === 'world' && m.wx){ return; }   // a minion I spawned stays mine until it dies
  if (m.aggro) m.calmT = 0; else if ((m.calmT = (m.calmT || 0) + dt) > 2){ m.mine = false; m.netOwner = null; if (m.whx != null){ m.hx = m.whx; m.hy = m.why; } }
  if (m.netOwner && m.netOwner !== NM.me && T - (m.claimT || 0) > 1.2) m.mine = false;
}
/* host: follow claims from the other players' presence */
function nmFollowClaims(){
  const held = new Set();
  for (const p of nmPeers()){ if (p.sameTab || typeof p.presence.cm !== 'string') continue;
    for (const s of p.presence.cm.split(',').slice(0, 20)){ const [nid, x, y, d, f] = s.split(':'), m = NM.byId.get(nid); if (!m || m.dead) continue;
      if (m.aggro && (!m.netOwner || m.netOwner === NM.me) && !m.netOwnerRemote && Math.hypot(m.x - P.x, m.y - P.y) < 400) continue;   // it is chasing the host: the host keeps it
      held.add(nid); m.netOwner = p.peer; m.netOwnerRemote = true; m.nx = clamp(+x || 0, 0, W); m.ny = clamp(+y || 0, 0, H); m.ndir = clamp(+d | 0, 0, 7); if (+f & 2 && m.atkT > .5){ m.lunge = .2; m.atkT = 0; } } }
  for (const m of mobs) if (m.netOwnerRemote && !held.has(m.nid)){ m.netOwnerRemote = false; m.netOwner = null; m.aggro = false; m.tx = m.hx; m.ty = m.hy; }
}
/* ---------- hits and kills ---------- */
function nmHit(m, dmg){
  if (!nmActive() || !m.nid || m.dead) return; m.myHitT = T;
  if ((NM.slave || NM.mode === 'world') && !m.netOwner) nmClaim(m);
  const q = NM.hitQ.get(m.nid) || [0, 0]; q[0] += dmg / m.maxhp; q[1] += dmg; NM.hitQ.set(m.nid, q);
}
function nmFlushHits(){
  if (!NM.hitQ.size || !NET.room || !NET.on) return;
  const h = [...NM.hitQ].slice(0, 30).map(([nid, [f, d]]) => [nid, +f.toFixed(5), Math.round(d)]); NM.hitQ.clear();
  mapEmit('mh', {r:NET.mapName, h}).catch(() => {});
}
function nmKilled(m){ if (!nmActive() || !m.nid || !NET.room) return; nmFlushHits();
  const e = {r:NET.mapName, id:m.nid};
  if (NM.mode === 'world'){ e.at = wNow(); const k = nwSlotOf(m.nid); if (k){ e.k = k.key; e.g = k.g + 1; nwSetGen(k.key, k.g + 1, e.at); } else NM.deadX.add(m.nid); if (m === boss){ e.b = 1; if (typeof BCK !== 'undefined') BCK.kill[MAP_ID] = e.at; } }
  mapEmit('mk', e).catch(() => {}); NM.byId.delete(m.nid); }
function onMh(msg){
  const d = msg.data || {}; if (msg.isMe || d.r !== NET.mapName || !Array.isArray(d.h)) return;
  for (const e of d.h.slice(0, 30)){ if (!Array.isArray(e)) continue; const m = NM.byId.get(e[0]); if (!m || m.dead) continue;
    const f = clamp(+e[1] || 0, 0, .35); m.hp = Math.max(1, m.hp - f * m.maxhp); m.flash = .1;
    if (SETTINGS.dmgNumbers !== false && SETTINGS.oDmg !== false && Math.hypot(m.x - P.x, m.y - P.y) < 700) { const pty = typeof partyMembers === 'function' && partyMembers().some(p => p.peer === msg.peer);   // party members: big sky-blue · other players: small and pale
      addText(m.x + rand(-12, 12), m.y - MOB_H[m.type] - 4, String(clamp(e[2] | 0, 0, 1e9)), pty ? '#6fd3ff' : 'rgba(205,212,228,.8)', pty ? 26 : 16); }
  }
}
function onMk(msg){
  const d = msg.data || {}; if (msg.isMe || d.r !== NET.mapName) return;
  if (NM.mode === 'world' && typeof d.id === 'string' && d.id.length < 40){ const at = clamp(+d.at || wNow(), 0, wNow() + 60e3), k = nwSlotOf(d.id);
    if (k) nwSetGen(k.key, Math.max(k.g + 1, Math.min(+d.g || 0, k.g + 1)), at); else NM.deadX.add(d.id);
    if (d.b && typeof BCK !== 'undefined') BCK.kill[MAP_ID] = at; }
  const m = NM.byId.get(d.id); if (!m || m.dead) return;
  m.dead = true; m.deadT = 0; m.hp = 0; NM.byId.delete(d.id); if (P.target === m) P.target = null; SFX.play(m.def.boss ? 'boom' : 'mobDie');
  if (m === boss){ boss = null; bossTimer = bossGap(); banner(L(`${nm(m.def)} ถูกปราบแล้ว!`, `${nm(m.def)} has been defeated!`)); }
  if (m.wb && typeof wbReward === 'function') wbReward(m);
  if (m.dg && typeof dgKilled === 'function') dgKilled(m, false);
  // party members nearby still share the EXP (it arrives from the killer's party message)
}
/* ---------- other players' skills ---------- */
function nmSkillFx(id, t){
  if (!NET.room || !NET.on || !NET.mapRoom || NET.mapRoom.peers().length < 2) return;
  if ((NM.fxT || 0) > T) return; NM.fxT = T + .25;
  mapEmit('fx', {r:NET.mapName, s:id, x:Math.round(P.x), y:Math.round(P.y), tx:Math.round(t ? t.x : P.x), ty:Math.round(t ? t.y : P.y), e:DER.welem}).catch(() => {});
}
function onFx(msg){
  const d = msg.data || {}; if (msg.isMe || d.r !== NET.mapName || !SKILLS[d.s] || SETTINGS.oFx === false) return;
  const sk = SKILLS[d.s], x = clamp(+d.x || 0, 0, W), y = clamp(+d.y || 0, 0, H), tx = clamp(+d.tx || 0, 0, W), ty = clamp(+d.ty || 0, 0, H);
  if (Math.hypot(x - P.x, y - P.y) > 900) return;
  try {
    switch (sk.type){
      case 'aoeTarget': VFX.play(sk.fx, {x:tx, y:ty, r:sk.radius, hits:sk.hits ? sk.hits(1) : 1, every:sk.every || .12, lv:1}); break;
      case 'aoeSelf': VFX.play(sk.fx, {x, y, r:sk.radius, hits:sk.hits ? sk.hits(1) : 1, every:sk.every || .12, lv:1}); break;
      case 'line': { const l = Math.hypot(tx - x, ty - y) || 1; VFX.play(sk.fx, {x, y, ux:(tx - x) / l, uy:(ty - y) / l, len:sk.len}); break; }
      case 'melee': VFX.play(sk.fx === 'punch' ? 'punchHit' : 'slashHit', {x:tx, y:ty - 20, gold:true, big:true}); break;
      case 'bolt': case 'ranged': case 'stone': { const l = Math.hypot(tx - x, ty - y); VFX.play('mobShot', {x, y:y - 30, tx, ty:ty - 20, t:Math.max(.12, l / 600), kind:{fire:'fire', water:'ice', holy:'holy', wind:'bolt', shadow:'dark', poison:'dart'}[sk.elem || d.e] || 'dart'}); break; }
      case 'heal': case 'restore': VFX.play('heal', {x, y}); break;
    }
  } catch (e) {}
}
EV.on('netready', () => { if (!NET.room) return; mapOn('mh', onMh, () => {}); mapOn('mk', onMk, () => {}); mapOn('fx', onFx, () => {});
  mapOn('wq', onWq, () => {}); mapOn('tq', onTq, () => {}); mapOn('ts', onTs, () => {}); mapOn('wg', onWg, () => {}); mapOn('ws', onWs, () => {}); });
/* the tick: elect, publish or apply, flush hits */
EV.on('tick', dt => {
  if (!NET.mapRoom){ if (nmActive()) nmStop(); return; }
  nmElect();
  if (NM.mode === 'world'){ nwTick(dt); }
  else if (NM.host){
    nmFollowClaims();
    // the snapshot rides in my normal presence (nmPres → netTick), never as a presence call of its own: the Firebase
    // shim stores each presence() call as the whole record, so a snapshot-only call wiped my `nm` flag and position and
    // the other players stopped seeing a host and spawned their own monsters and bosses
    if ((NM.snapT -= dt) <= 0){ NM.snapT = .2; NM.mq++; NM.snap = {ms:nmSnapshot(), mq:NM.mq}; NET.presT = 0; }
  } else if (NM.slave){
    const h = nmPeers().find(p => p.peer === NM.hostPeer); const q = h && h.presence;
    if (q && q.ms && q.mq !== NM.lastMq){ NM.lastMq = q.mq; nmApply(q.ms); }
    if (q && typeof q.wbk === 'string' && typeof WB !== 'undefined') WB.key = q.wbk;
  }
  if ((NM.hitT -= dt) <= 0){ NM.hitT = .25; nmFlushHits(); }
});
EV.on('map', () => { NM.byId.clear(); NM.hitQ.clear(); NM.hostPeer = null; NM.host = NM.slave = false; NM.lastMq = -1; NM.snap = null; NM.mode = null; NM.gen = {}; NM.deadX = new Set(); NM.keys = []; NM.wounds = null; });

/* the "boss stands still" fix: when this tab is hidden its game stops, so every monster it hosted or held would
   freeze for everyone else. Let go of them at once and step down as host; the others take over. */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden || typeof NET === 'undefined' || !NET.mapRoom) return;
  for (const m of mobs) if (m.mine){ m.mine = false; m.netOwner = null; }
  try { NET.presT = 0; netTick(0); } catch (e) {}
});

/* ======================= world clock mode (v27) ======================= */
const nwHash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const nwRng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const nwF = str => nwRng(nwHash(str))();
function nwInstanced(){ return (typeof DG !== 'undefined' && DG.active) || (typeof SIEGE_MAP !== 'undefined' && MAP_ID === SIEGE_MAP); }
/* a stable name for each spawn slot: kind · zone · its number among slots of that kind and zone */
function nwKeys(){ const c = {}; NM.keys = spawnSlots.map(s => { const b = `${s.type}.${zoneCode(s.zone)}`; c[b] = (c[b] || 0) + 1; return `${b}.${c[b]}`; }); }
const nwNid = (key, g) => `w${MAP_ID}.${key}.${g}`;
function nwSlotOf(nid){ const m = /^w(\d+)\.([a-z0-9_]+\.[abnz]\.\d+)\.(\d+)$/.exec(nid || ''); if (!m || +m[1] !== MAP_ID) return null; const g = +m[3]; return NM.gen[m[2]] || NM.keys.includes(m[2]) ? {key:m[2], g} : null; }
function nwSetGen(key, g, at){ g = clamp(g | 0, 0, 1e7); const st = NM.gen[key] || {g:0, at:0}; if (g > st.g || (g === st.g && at > st.at && st.at)) NM.gen[key] = {g, at}; }
const nwDelay = (key, g) => (MOB_RESPAWN[0] + nwF(`${key}|${g}|d`) * (MOB_RESPAWN[1] - MOB_RESPAWN[0])) * 1000;
function nwSpot(zone, r, seed){ const R = nwRng(nwHash(seed));
  for (let i = 0; i < 30; i++){ const p = {x:zone.x0 + R() * (zone.x1 - zone.x0), y:zone.y0 + R() * (zone.y1 - zone.y0)}; if (!obstacles.some(o => Math.hypot(o.x - p.x, o.y - p.y) < o.r + r + 6)) return p; }
  return {x:(zone.x0 + zone.x1) / 2, y:(zone.y0 + zone.y1) / 2}; }
function nwAdopt(m, nid){ m.nid = nid; NM.byId.set(nid, m); return m; }
function nwStart(){
  NM.mode = 'world'; NM.host = NM.slave = false; NM.hostPeer = null; NM.snap = null; nwKeys();
  // my own spawns give way to the world's (a boss I am fighting keeps its HP: it becomes the world's boss)
  for (const m of mobs) if (!m.nid && !m.minion && !m.dead && !m.dummy && !m.def.boss && !m.wb && !m.evb){ m.dead = true; m.deadT = 1; m.vanish = true; if (P.target === m) P.target = null; }
  for (const s of spawnSlots) if (s.mob && !s.mob.nid) s.mob = null;
  NM.wqT = 0; nwAsk();
  if (typeof log === 'function') log(L('แผนที่นี้เดินตามเวลาโลก: ทุกคนเห็นมอนชุดเดียวกัน', 'This map runs on the world clock: everyone sees the same monsters'));
}
function nwStop(){ NM.mode = null; for (const m of mobs){ m.netOwner = null; m.mine = false; m.nx = null; } }
function nwAsk(){ if (NET.room && NET.on && NET.mapName) mapEmit('wq', {r:NET.mapName, me:NM.me}).catch(() => {}); }
/* someone new asks for the slot table: the lowest peer id among the others answers */
function onWq(msg){ const d = msg.data || {}; if (msg.isMe || NM.mode !== 'world' || d.r !== NET.mapName) return;
  const others = nmPeers().filter(p => p.peer !== d.me).map(p => p.peer).sort();   // (lobby and map rooms give different peer ids: the asker names its map id) if (others[0] !== NM.me) return;
  const g = Object.entries(NM.gen).filter(([, v]) => v.g > 0).slice(0, 300).map(([k, v]) => [k, v.g, v.at]);
  const h = mobs.filter(m => m.nid && !m.dead && m.hp < m.maxhp).slice(0, 60).map(m => [m.nid, Math.max(1, Math.round(m.hp / m.maxhp * 1000))]);   // wounds, so a returning player sees the same HP
  mapEmit('wg', {r:NET.mapName, g, x:[...NM.deadX].slice(-60), h}).catch(() => {}); }
function onWg(msg){ const d = msg.data || {}; if (msg.isMe || NM.mode !== 'world' || d.r !== NET.mapName) return;
  if (Array.isArray(d.g)) for (const e of d.g.slice(0, 300)) if (Array.isArray(e) && typeof e[0] === 'string' && NM.keys.includes(e[0])) nwSetGen(e[0], +e[1] || 0, clamp(+e[2] || 0, 0, wNow() + 60e3));
  if (Array.isArray(d.x)) for (const id of d.x.slice(0, 60)) if (typeof id === 'string' && id.length < 40) NM.deadX.add(id);
  if (Array.isArray(d.h)) NM.wounds = new Map(d.h.slice(0, 60).filter(e => Array.isArray(e) && typeof e[0] === 'string').map(e => [e[0], clamp(+e[1] || 1000, 1, 1000)]));
  nwWounds(); }
function nwWounds(){ if (!NM.wounds) return; for (const [id, f] of NM.wounds){ const m = NM.byId.get(id); if (m && !m.dead){ m.hp = Math.min(m.hp, m.maxhp * f / 1000); NM.wounds.delete(id); } } }
/* minions a boss calls up in my game: tell the others (they follow my reports of it) */
function onWs(msg){ const d = msg.data || {}; if (msg.isMe || NM.mode !== 'world' || d.r !== NET.mapName || typeof d.id !== 'string' || d.id.length > 24 || !MOB[d.t] || NM.byId.has(d.id)) return;
  if (mobs.filter(o => o.wx && !o.dead).length >= 16) return;   // never more than a handful of someone else's minions
  // (v27e) built with remote:true so the spawn hook below does NOT treat it as mine and announce it back — that echo
  // bounced between players and filled the fields with hundreds of jellies
  const m = spawnMob(d.t, clamp(+d.x || 0, 0, W), clamp(+d.y || 0, 0, H), {zone:ZONE_C()[d.z] || MAPZ, minion:true, remote:true}); nwAdopt(m, d.id); m.wx = true; m.mine = false; m.netOwner = msg.peer; m.seenT = T; }
HK.spawn.push((m, opt) => { if (NM.mode !== 'world' || !opt || !opt.minion || opt.remote || m.nid || !NET.room || !NET.on) return;
  if (mobs.filter(o => o.wx && o.mine && !o.dead).length > 8) return;   // a boss calls a few, not an army
  nwAdopt(m, NM.tag + 'x' + (++NM.seq).toString(36)); m.wx = true; m.mine = true; m.netOwner = NM.me;
  mapEmit('ws', {r:NET.mapName, id:m.nid, t:m.type, x:Math.round(m.x), y:Math.round(m.y), z:zoneCode(m.zone)}).catch(() => {}); });
/* what I hold, for my presence: id:x:y:dir:flags:hp‰|extra ; … */
function nwHeld(){ const out = []; NM.holding = false;
  for (const m of mobs) if (m.nid && !m.dead && m.mine){ NM.holding = true; const ex = typeof mobEx === 'function' ? mobEx(m) : '';
    out.push(`${m.nid}:${Math.round(m.x)}:${Math.round(m.y)}:${m.dir | 0}:${(m.moving ? 1 : 0) | (m.atkT < .3 ? 2 : 0) | (m.aggro ? 4 : 0) | (m.enraged ? 32 : 0)}:${Math.max(0, Math.round(m.hp / m.maxhp * 1000))}${ex ? '|' + ex.replace(/[;|]/g, '') : ''}`); if (out.length >= 24) break; }
  return out.join(';'); }
/* everyone's holds: follow them; two holders → the lower peer id keeps it */
function nwFollow(){
  const held = new Set();
  for (const p of nmPeers()){ if (p.sameTab || typeof p.presence.wc !== 'string' || !p.presence.wc) continue;
    for (const row of p.presence.wc.split(';').slice(0, 24)){ const [body, ex] = row.split('|'), e = body.split(':'), m = NM.byId.get(e[0]); if (!m || m.dead) continue;
      if (m.mine){ if (NM.me < p.peer) continue; m.mine = false; }
      held.add(e[0]); m.netOwner = p.peer; m.seenT = T;
      m.nx = clamp(+e[1] || 0, 0, W); m.ny = clamp(+e[2] || 0, 0, H); m.ndir = clamp(+e[3] | 0, 0, 7); const f = +e[4] | 0;
      if (f & 2 && m.atkT > .5){ m.lunge = .2; m.atkT = 0; } m.aggro = !!(f & 4); m.enraged = !!(f & 32);
      const sh = m.maxhp * clamp(+e[5] || 0, 0, 1000) / 1000; if (sh < m.hp) m.hp = Math.max(1, sh); else if (sh > m.hp + m.maxhp * .03 && T - (m.myHitT || -9) > 2) m.hp = sh;
      if (ex && typeof mobExApply === 'function') mobExApply(m, ex); } }
  for (const m of mobs){ if (!m.nid || m.dead || m.mine || held.has(m.nid)) continue;
    if (m.wx){ if (T - (m.seenT || T) > 3){ m.dead = true; m.deadT = 0; m.vanish = true; NM.byId.delete(m.nid); if (P.target === m) P.target = null; } continue; }   // a minion whose holder is gone
    if (m.netOwner){ m.netOwner = null; m.aggro = false; } }
}
/* where an unheld monster is right now: it idles at a waypoint, then walks to the next (all from the clock) */
function nwWp(m, k){ const R = nwRng(nwHash(`${m.nid}|${k}`)), big = m.def.boss, a = R() * 6.283, r = big ? 120 + R() * 380 : 18 + R() * 80;
  const hx = m.whx ?? m.hx, hy = m.why ?? m.hy;   // the world's home spot (a holder's AI may move hx while it chases)
  const x = clamp(hx + Math.cos(a) * r, 30, W - 30), y = clamp(hy + Math.sin(a) * r * .7, 40, H - 30);
  return walkable(x, y, m.def.r) && !obstacles.some(o => Math.hypot(o.x - x, o.y - y) < o.r + m.def.r) ? {x, y} : {x:hx, y:hy}; }
/* (v182) a waypoint only changes every few seconds, but it was worked out again for every monster on every frame (a string
   hash, a walkable check and a test against every obstacle on the map, twice): with a hundred monsters online that was
   the biggest cost of a frame and fed the garbage collector. Each monster now keeps its last two waypoints. */
function nwWpC(m, k){ const hx = m.whx ?? m.hx, hy = m.why ?? m.hy, c = m._wpc || (m._wpc = []), on = obstacles.length, now = performance.now();
  // (v282) a remembered waypoint is worked out again after 2 s, or when the map's obstacles change: one worked out while
  // the map was still placing its camp and props stayed, and two games put the same boss 200 px apart
  for (const e of c) if (e.k === k && e.hx === hx && e.hy === hy && e.on === on && now - e.at < 2000) return e.p;
  for (let i = c.length - 1; i >= 0; i--) if (c[i].k === k) c.splice(i, 1);
  const p = nwWp(m, k); c.push({k, hx, hy, on, at:now, p}); if (c.length > 3) c.shift(); return p; }
function nwWander(m, now){ const seg = m.def.boss ? 22000 : 7000;
  if (m._woffN !== m.nid){ m._woffN = m.nid; m._woff = nwF(m.nid); }
  const off = m._woff * seg, k = Math.floor((now + off) / seg), u = ((now + off) % seg) / seg;
  const a = nwWpC(m, k); if (u < .6) return a; const b = nwWpC(m, k + 1), t = (u - .6) / .4; return {x:a.x + (b.x - a.x) * t, y:a.y + (b.y - a.y) * t}; }
function nwUpd(m, dt){
  if (m.mine || !m.nid) return false;                       // I run its AI (or it only exists here)
  let tx, ty, fast = false;
  if (m.netOwner && m.nx != null){ tx = m.nx; ty = m.ny; fast = true; }
  else { const w = nwWander(m, wNow()); tx = w.x; ty = w.y; }
  const dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy);
  if (fast){ if (d > 240){ m.x = tx; m.y = ty; } else if (d > .5){ const k = Math.min(1, dt * 9); m.x += dx * k; m.y += dy * k; } }
  else if (d > 400){ m.x = tx; m.y = ty; }
  else if (d > 60){ const k = Math.min(1, dt * 5); m.x += dx * k; m.y += dy * k; }   // (v282) off the world's path: glide back fast, so every game shows it in the same place (a walking catch-up let two games' bosses sit 200 px apart)
  else if (d > .5){ const st = Math.min(d, Math.max(60, m.def.speed || 60) * dt * (d > 150 ? 5 : d > 60 ? 1.6 : 1)) /* far off the world path after a chase: hurry back so every game agrees */; m.x += dx / d * st; m.y += dy / d * st; }
  m.moving = d > 2; if (m.moving) m.dir = SPR.dirFromVec(dx, dy); else if (fast && m.ndir != null) m.dir = m.ndir;
  m.flash = Math.max(0, m.flash - dt); m.atkT += dt; m.hurtT = Math.max(0, m.hurtT - dt);
  // it notices me: I hold it from now on
  if (!m.netOwner && !P.dead && m.def.aggro && !(typeof hideBuff === 'function' && hideBuff()) && Math.hypot(m.x - P.x, m.y - P.y) < (m.def.boss ? 240 : 150) && !inVillage(P)) nmClaim(m);
  return true;
}
/* build the clock's world: slots, the region boss and the festival spirit */
/* (v98) a fingerprint of this map's world (its spawn slots and size). Two games on different builds would build different
   worlds and each see its own monsters, so the player is told to reload the game instead */
function nwSig(){ return nwHash(`${MAP_ID}|${W}x${H}|${NM.keys.join(',')}`).toString(36); }
const NWV = {t:2, warned:''};
function nwVerCheck(dt){
  if ((NWV.t -= dt) > 0) return; NWV.t = 5; const me = nwSig();
  if (NWV.warned === `${MAP_ID}|${me}` || !nmPeers().some(p => !p.sameTab && typeof p.presence.wv === 'string' && p.presence.wv !== me)) return;
  NWV.warned = `${MAP_ID}|${me}`;
  toast(L('มีผู้เล่นในแผนที่นี้ใช้เกมคนละเวอร์ชัน มอนจึงไม่ตรงกัน ให้ทุกคนปิดแล้วเปิดเกมใหม่', 'Someone on this map runs a different game version, so monsters differ: everyone should reload the game'));
  if (typeof log === 'function') log(L('มอนไม่ตรงกับผู้เล่นอื่น: เกมคนละเวอร์ชัน ให้ปิดแล้วเปิดเกมใหม่', 'Monsters differ from other players: different game versions, reload the game'), 'sys');
}
function nwTick(dt){
  if (!NM.keys.length || NM.keys.length !== spawnSlots.length) nwKeys();
  if ((NM.wqT += dt) > 30 && !Object.keys(NM.gen).length){ NM.wqT = 0; nwAsk(); }
  const now = wNow(), night = isNight();
  spawnSlots.forEach((s, i) => {
    const key = NM.keys[i], st = NM.gen[key] || (NM.gen[key] = {g:0, at:0}), nid = nwNid(key, st.g);
    const want = !(s.night && !night) && (!st.at || now >= st.at + nwDelay(key, st.g));
    if (s.mob && (s.mob.dead || s.mob.nid !== nid || !want)){ if (!s.mob.dead){ s.mob.dead = true; s.mob.deadT = 0; s.mob.vanish = true; if (P.target === s.mob) P.target = null; } if (s.mob.nid) NM.byId.delete(s.mob.nid); s.mob = null; }
    if (want && !s.mob){ const old = NM.byId.get(nid); if (old && !old.dead){ s.mob = old; return; }
      const p = nwSpot(s.zone, MOB[s.type].r, `${MAP_ID}|${key}|${st.g}`), m = nwAdopt(spawnMob(s.type, p.x, p.y, {zone:s.zone}), nid); m.hx = m.whx = p.x; m.hy = m.why = p.y; m.wait = 9;
      if (MAP_ID > 0 && nwF(nid + '|e') < .04 && typeof makeElite === 'function') makeElite(m);
      s.mob = m; }
  });
  // the region boss: one per 15-minute round of the world clock, named after its round, so every game has the same one
  const mp = MAPS[MAP_ID];
  if (mp && mp.boss && MOB[mp.boss] && typeof bckDue === 'function' && !nwInstanced()){
    const nid = `wB${MAP_ID}.r${Math.floor(now / BCK.gap)}`;
    // someone else killed this round's boss (we heard late, from the board): ours goes too
    if (boss && boss.nid === nid && !boss.dead && bckKilled(MAP_ID, now)){ boss.dead = true; boss.deadT = 0; boss.vanish = true; NM.byId.delete(nid); NM.deadX.add(nid); if (P.target === boss) P.target = null; boss = null; }
    // (v130) a boss still standing when the 15-minute round turns over takes the new round's name, so a player who
    // arrives after the turn (and spawns this round's boss) meets the same boss as everyone else, not a second one
    if (boss && !boss.dead && boss.nid && boss.nid !== nid && boss.nid.startsWith(`wB${MAP_ID}.r`) && !NM.deadX.has(nid)){ NM.byId.delete(boss.nid); nwAdopt(boss, nid); }
    // (v130) the boss's home spot belongs to the map, not to the round: a boss carried over into a new round and one
    // spawned fresh by a player who just arrived stand in the same place
    const zone = MAP_ID === 0 ? ZB : MAPZ, spot = () => { let at = null; const R = nwRng(nwHash(`wB${MAP_ID}.home`));
      for (let i = 0; i < 60 && !at; i++){ const q = {x:zone.x0 + R() * (zone.x1 - zone.x0), y:zone.y0 + R() * (zone.y1 - zone.y0)}; if (walkable(q.x, q.y, 30) && !GATES.some(g => Math.hypot(g.x - q.x, g.y - q.y) < 420)) at = q; }
      return at || {x:(zone.x0 + zone.x1) / 2, y:(zone.y0 + zone.y1) / 2}; };
    // a boss this game had before the world took over: it becomes the world's boss (moved to the world's spot unless it is in a fight)
    if (boss && !boss.dead && !boss.nid && !boss.wb && !boss.dg){ nwAdopt(boss, nid); const at = spot(); boss.hx = boss.whx = at.x; boss.hy = boss.why = at.y; if (!boss.aggro){ boss.x = at.x; boss.y = at.y; } }
    // (v130) with other players here, wait until our clock has been agreed with theirs (or 6 s) before spawning: a device
    // whose own clock is off would otherwise name its boss after a different round
    const clockOk = nmPeers().length < 2 || WCLK.n >= 2 || T - (NWT.mapT || 0) > 6;
    if (!boss && clockOk && !NM.deadX.has(nid) && now >= bckDue(MAP_ID)){ const at = spot();
      boss = nwAdopt(spawnMob(mp.boss, at.x, at.y, {zone}), nid); boss.hx = boss.whx = at.x; boss.hy = boss.why = at.y; boss.bcd = 3; VFX.play('bossArrive', at);
      banner(L(`Boss ${MOB[mp.boss].name} ปรากฏตัวที่${mp.name}!`, `Boss: ${MOB[mp.boss].en} appears in ${mp.en}!`)); }
  }
  // the festival spirit: one per 15 minutes of the Thai clock, the same for everyone
  if (typeof evLive === 'function' && typeof EVENTS !== 'undefined' && MAP_ID > 0){ const id = evLive();
    if (id && EVENTS[id]){ const c = thaiClock(), d = thNow(), slot = `${d.getUTCMonth()}${d.getUTCDate()}.${Math.floor((c.h * 60 + c.m) / 15)}`, nid = `wE${MAP_ID}.${slot}`;
      if (!NM.deadX.has(nid) && !NM.byId.has(nid)){ const pool = (mp.mobs || []).filter(t => MOB[t] && !MOB[t].boss);
        if (pool.length){ const p = nwSpot(MAPZ, 20, nid), m = nwAdopt(spawnMob(pool[Math.floor(nwF(nid) * pool.length)], p.x, p.y, {zone:MAPZ}), nid); m.hx = m.whx = p.x; m.hy = m.why = p.y;
          if (typeof makeElite === 'function') makeElite(m); m.maxhp *= 2; m.hp = m.maxhp; m.evb = id; m.tagTxt = EVENTS[id].sp;
          if (Math.hypot(p.x - P.x, p.y - P.y) < 900) VFX.play('bossArrive', p); } } } }
  // the world boss (Aren, scheduled by the clock): every game spawns it at the same time; give it the same id
  if (typeof WB !== 'undefined' && WB.m && !WB.m.dead && !WB.m.nid && WB.key) nwAdopt(WB.m, `wW${WB.key}`);
  nwWounds(); nwFollow(); nwVerCheck(dt);
  // safety net: other players' minions never pile up (oldest go first)
  const wx = mobs.filter(o => o.wx && !o.dead && !o.mine); if (wx.length > 16) for (const o of wx.slice(0, wx.length - 16)){ o.dead = true; o.deadT = 1; o.vanish = true; NM.byId.delete(o.nid); }
}

/* ---------- world time (v27): agree on one clock ----------
   Every 8 s each player on a busy map pings the others ('tq' with its send time and a nonce); each answers with its
   own clock ('ts'). From the round trip we estimate every other player's clock offset, and the world clock is the
   MEDIAN of everyone's clocks (ours counts as 0). Everyone computes the same median, so a phone that is a minute off
   still sees monsters and bosses respawn with the rest. Small corrections glide in; big ones jump. */
const NWT = {t:3, nonce:'', sent:0, off:new Map()};
function onTq(msg){ const d = msg.data || {}; if (msg.isMe || d.r !== NET.mapName || typeof d.n !== 'string' || d.n.length > 12 || !NET.room) return;
  mapEmit('ts', {r:NET.mapName, n:d.n, me:NM.me, t:Date.now()}).catch(() => {}); }
function onTs(msg){ const d = msg.data || {}; if (msg.isMe || d.r !== NET.mapName || d.n !== NWT.nonce || typeof d.me !== 'string') return;
  const now = Date.now(), rtt = now - NWT.sent; if (rtt < 0 || rtt > 4000 || !isFinite(+d.t)) return;
  const o = clamp(+d.t + rtt / 2 - now, -864e5, 864e5), old = NWT.off.get(d.me);
  // keep a sharper old sample over a noisy new one, unless the clocks have really moved apart since (a device clock set
  // forward or back): (v282) then the old sample was kept for up to a minute and the two players' world clocks
  // stayed tens of seconds apart (tests/online.test.js "one world clock" failed now and then)
  const moved = old && Math.abs(o - old.o) > 1500 + rtt;
  NWT.off.set(d.me, old && !moved && old.rtt < rtt * .7 && now - old.at < 60e3 ? old : {o, rtt, at:now}); }
EV.on('map', () => { NWT.next = performance.now() + 300; NWT.mapT = T; NWT.off.clear(); WCLK.n = 0; });   // (v130) ask the others' clocks right after arriving, not up to 8 s later
EV.on('tick', dt => {
  if (!NET.mapRoom || !NET.room || !NET.on){ NWT.off.clear(); return; }
  const ps = nmPeers(); if (ps.length < 2) { NWT.off.clear(); if (Math.abs(WCLK.off) > 0) WCLK.off = 0; return; }
  // (v130) on the wall clock, not game time: on a slow device game time runs slower and the clocks agreed too late
  if (performance.now() >= (NWT.next || 0)){ NWT.next = performance.now() + 8000; NWT.nonce = Math.random().toString(36).slice(2, 10); NWT.sent = Date.now(); mapEmit('tq', {r:NET.mapName, n:NWT.nonce}).catch(() => {}); }
  // the median of everyone's clock (players still on this map, fresh samples), ours = 0
  const live = new Set(ps.map(p => p.peer)), now = Date.now(), v = [0];
  for (const [k, e] of NWT.off){ if (!live.has(k) || now - e.at > 60e3){ NWT.off.delete(k); continue; } v.push(e.o); }
  v.sort((a, b) => a - b); const target = v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
  const diff = target - WCLK.off; WCLK.off += Math.abs(diff) > 3000 ? diff : diff * Math.min(1, dt * .5); WCLK.n = v.length;
});
