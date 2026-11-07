/* VAYRATHEN — js/sys/tower267.js — (v267) the tower's guardians, rebuilt (the owner: no treasure rooms; the bosses were
   pushovers — from floor 50 two of them, three on floors 90 and 100, random ones, harder the higher you go, not taken
   from the map outside)
   · No treasure rooms: those floors are hunts now.
   · Every guardian is drawn at random from all the region bosses of the realm (not the floor's region), a new draw
     every guardian floor; the floor-100 Shadow of Vaira stays and two random guardians stand with it.
   · Guardian strength comes from the floor alone and climbs all the way up: HP ×1 at floor 20 → ×5 at 100, hits
     ×1.25 → ×2.25, their heavy blows ×1.2 → ×3; from floor 50 they move and strike faster; more time on those floors. */
'use strict';
{ const _k = twfKind; twfKind = function(f){ const k = _k.apply(this, arguments); return k === 'treasure' ? 'hunt' : k; }; }
const T267 = {pool:null};
const t267Pool = () => T267.pool || (T267.pool = [...new Set(MAPS.map(m => m && m.boss).filter(b => b && MOB[b] && MOB[b].boss && b !== 'asuraking'))]);
function t267Pick(){ const pool = t267Pool(); return pool[(Math.random() * pool.length) | 0]; }   // (v268) tower268.js pre-rolls these
const t267Hp = f => 1 + Math.max(0, f - 20) / 20, t267Atk = f => 1 + f / 80, t267Punch = f => 1 + f / 50;
{ const _m = twMob; twMob = function(type, x, y, f){
    if (typeof TW !== 'undefined' && TW.active && MOB[type] && MOB[type].boss && type !== 'asuraking' && !(typeof TWSQ !== 'undefined' && TWSQ.raw)){ type = t267Pick(); }
    const m = _m.call(this, type, x, y, f), fl = f || (typeof TW !== 'undefined' ? TW.f : 1);
    if (m && m.def && m.def.boss && typeof TW !== 'undefined' && TW.active && !m.t267){ m.t267 = true;
      m.def = {...m.def, hp:Math.round(m.def.hp * t267Hp(fl)), atk:m.def.atk.map(v => Math.max(1, Math.round(v * t267Atk(fl)))), ...(fl >= 50 ? {speed:(m.def.speed || 60) * 1.2, delay:(m.def.delay || 1.5) * .85} : {})};
      m.maxhp = m.hp = m.def.hp; }
    return m; }; }
if (typeof bossPunch === 'function'){ const _bp = bossPunch; bossPunch = function(m){ const r = _bp.apply(this, arguments);
    return m && m.twGuard && typeof TW !== 'undefined' && TW.active ? Math.round(r * t267Punch(TW.f)) : r; }; }
// more time to fight two or three of them
{ const _sp = twSpawn; twSpawn = function(){ const r = _sp.apply(this, arguments); if (TW.active && TW.phase === 'fight' && TW.f % 5 === 0 && TW.f >= 50) TW.t = Math.max(TW.t, TW_TB + 40 * (tw236Bosses(TW.f) - 1) + 30); return r; }; }
