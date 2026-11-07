/* VAYRATHEN — js/sys/tower235.js — (v235) the owner's tower changes
   · Gatekeeper Saeng no longer lists the tower (it has its own monument in Aren now); the dungeon list is unchanged.
   · No blessing to pick every 5th floor: the climb is the hero's own strength.
   · Drought floors: potions heal half (no longer forbidden) and bring no extra monsters.
   · More monsters and a harder climb: a hunt / curse floor brings 7 + 1 per 6 floors (up to 16) instead of 5–11,
     a leader keeps a pack of 6, a survive floor keeps 9 alive, a guardian floor brings 3 guards; every tower
     monster has +10% HP and +5% hits, guardians stay 6× / 1.3× an ordinary monster (v224); 7× / 1.35× stopped the melee lines at the first guardian.
     (A first try at 8 + f/5, +20% / +10% and 8× / 1.45× stopped most heroes 15–28 levels under their own: a wall.)
   Measured again with tools/tower-report.js after the change. */
'use strict';
// the gatekeeper's list, without the tower
{ const _g = NPC_OPEN.gatekeeper; if (_g) NPC_OPEN.gatekeeper = function(){ const i = DUNGEONS.findIndex(d => d.tower), t = i >= 0 ? DUNGEONS.splice(i, 1)[0] : null; try { return _g.apply(this, arguments); } finally { if (t) DUNGEONS.splice(i, 0, t); } }; }
// no blessings in the tower
{ const _b = dg3Boon; dg3Boon = function(){ if (typeof TW !== 'undefined' && TW.active) return; return _b.apply(this, arguments); }; }
{ const _tc = twClear; twClear = function(){ const r = _tc.apply(this, arguments); if (TW.active && TW.phase === 'rest' && typeof DG3 !== 'undefined') DG3.boonOpen = false; return r; }; }
// tougher monsters, and tougher guardians
const TW235 = {hp:1.1, atk:1.05};
/* (v255) high floors: tools/tower-report.js showed Lv 250–300 heroes falling within 10–20 s on ordinary floors 30 levels
   under their own (a full hall of Lv 270+ monsters hits much harder than a map's spread-out ones). From floor 60 the
   tower's monsters hit softer, down to ×TW255_TOP at floor 100. */
const TW255_TOP = .6, tw255Atk = f => f <= 50 ? 1 : 1 - (1 - TW255_TOP) * Math.min(1, (f - 50) / 30);   // full by floor 80
/* (v256) the real wall: on maps a Lv 300 hero kills 9–21 monsters a minute against 30–40 at low levels, so a hall that
   fights all at once takes far longer to clear up high and buries the hero. Tower monsters lose HP from floor 40, down
   to ×TW256_HP at floor 100, so a high hall takes about as long as a low one (guardians too: towerbal224 eases less). */
const TW256_HP = .45, tw256Hp = f => f <= 40 ? 1 : 1 - (1 - TW256_HP) * Math.min(1, (f - 40) / 35);   // full by floor 75
if (typeof TWB !== 'undefined'){ TWB.hp = 6; TWB.atk = 1.3; }   // guardians as in v224 (on top of the +10% / +5% every tower monster has): 7× / 1.35× stopped the melee lines at the first guardian
{ const _m = twMob; twMob = function(){ const m = _m.apply(this, arguments);
    if (m && m.def){ m.def = {...m.def, hp:Math.round(m.def.hp * TW235.hp * tw256Hp(arguments[3] | 0)), atk:m.def.atk.map(v => Math.max(1, Math.round(v * TW235.atk * tw255Atk(arguments[3] | 0))))}; m.maxhp = m.hp = m.def.hp; }
    return m; }; }
// more of them
const tw235Count = f => Math.min(24, 14 + Math.floor(f / 7));   // (v266) the owner: too few, too quick — 14 → 24 by floor 70 (the hall is wider now)   // (v256) 100 floors: 7 → 13 by floor 60 (it reached 16 at floor 54, and a hall of 16 Lv 200+ monsters killed every hero in shop gear)
{ const _sp = twSpawn; twSpawn = function(){ const r = _sp.apply(this, arguments); if (!TW.active || TW.phase !== 'fight') return r;
    const f = TW.f, kind = typeof twfKind === 'function' ? twfKind(f) : (f % 5 ? 'hunt' : 'guard'), mp = MAPS[TW.theme] || {}, kinds = (mp.mobs || []).filter(t => MOB[t] && !MOB[t].night && !MOB[t].boss); if (!kinds.length) return r;
    const alive = () => mobs.filter(m => m.tw === f && !m.dead && !m.def.boss).length;
    if (kind === 'curse' && typeof TWF !== 'undefined' && TWF.curse === 'drought')return r;   // drought: no extra monsters   // no potions already: no extra monsters (melee lines could not survive both)
    const want = kind === 'guard' ? 6 : kind === 'elite' ? 11 : kind === 'survive' ? 15 : kind === 'treasure' ? 0 : tw235Count(f);
    const c = typeof twmC === 'function' ? twmC() : {x:P.x, y:P.y}, rx = typeof TWM_RX !== 'undefined' ? TWM_RX : 300, ry = typeof TWM_RY !== 'undefined' ? TWM_RY : 200;
    for (let i = alive(), k = 0; i < want && k < 40; k++){ const a = Math.random() * 6.283, d = .25 + Math.random() * .45, x = c.x + Math.cos(a) * rx * d, y = c.y + Math.sin(a) * ry * d;
      if (!walkable(x, y, 14)) continue; const m = twMob(kinds[(i + f) % kinds.length], x, y, f);
      if (kind === 'curse' && typeof TWF !== 'undefined' && TWF.curse === 'frenzy') m.def = {...m.def, atk:m.def.atk.map(v => Math.round(v * 1.3)), speed:(m.def.speed || 50) * 1.25};
      if (typeof VFX !== 'undefined') VFX.play('bossSummon', {x, y}); i++; }
    return r; }; }
// the survive floor keeps 9 alive, topped up every 4 s (towerfloors226 alone tops up to 6)
EV.on('tick', dt => { if (typeof TWF === 'undefined' || TWF.kind !== 'survive' || !TW.active || TW.phase !== 'fight' || TWF.f !== TW.f || TW.t < 2 || TW.t > 98) { TW235.st = 0; return; }
  if ((TW235.st = (TW235.st || 0) - dt) > 0) return; TW235.st = 4;
  const mp = MAPS[TW.theme] || {}, kinds = (mp.mobs || []).filter(t => MOB[t] && !MOB[t].night && !MOB[t].boss); if (!kinds.length) return;
  const c = twmC(); let n = mobs.filter(m => m.tw === TW.f && !m.dead).length;
  for (let k = 0; n < 9 && k < 30; k++){ const a = Math.random() * 6.283, x = c.x + Math.cos(a) * TWM_RX * .4, y = c.y + Math.sin(a) * TWM_RY * .4; if (!walkable(x, y, 14)) continue; twMob(kinds[(n + TW.f) % kinds.length], x, y, TW.f); n++; } });
// the window's rules no longer promise blessings
{ const _r = WIN_RENDER.tower; WIN_RENDER.tower = function(){ const r = _r.apply(this, arguments); const pane = el('pane-tower'); if (pane) pane.querySelectorAll('.twrules li').forEach(li => { if (/เลือกพร|blessing/i.test(li.textContent)) li.textContent = L('ผ่านชั้นฟื้น HP/SP 25% · ไม่มีพรช่วย ปีนด้วยฝีมือตัวเอง', 'Clearing a floor heals 25% HP/SP · no blessings: climb on your own strength'); }); return r; }; }

// drought no longer forbids potions (melee lines rely on them and died on every drought floor, even 28 levels down):
// potions heal half on a drought floor
if (typeof TWF_CURSE !== 'undefined') TWF_CURSE.drought = ['แห้งแล้ง: ยาฟื้นได้แค่ครึ่งเดียวในชั้นนี้', 'Drought: potions heal only half on this floor'];
{ const _u = useItem; useItem = function(id){ const it = ITEMS[id], dr = typeof twfOn === 'function' && twfOn() && TWF.kind === 'curse' && TWF.curse === 'drought';
    if (!dr || !it || !(it.heal || it.spheal)) return _u.apply(this, arguments);
    const hp0 = S.hp, sp0 = S.sp; TWF.curse = 'drought_'; try { _u.apply(this, arguments); } finally { TWF.curse = 'drought'; }
    if (S.hp > hp0) S.hp = Math.round(hp0 + (S.hp - hp0) / 2); if (S.sp > sp0) S.sp = Math.round(sp0 + (S.sp - sp0) / 2); }; }

/* ---------- the tower's own song (v235): one loop for the whole climb ----------
   The owner's "hundred-floor tower" loop plays from the first floor to the last and keeps going when the floor or the
   hall changes (the same track is never restarted: bgm.js only reloads on a different track); guardian floors keep it
   too. Leaving the tower returns to the map's own music. */
if (typeof BGM_TRACKS !== 'undefined') BGM_TRACKS.tower = {src:'audio/tower_loop.mp3', th:'หอคอยร้อยชั้น', en:'The Hundred-floor Tower'};
if (typeof SFX !== 'undefined' && SFX.music){ const _m = SFX.music; SFX.music = function(name){ if (typeof TW !== 'undefined' && TW.active && name) name = 'tower'; return _m.call(this, name); }; }
EV.on('tick', () => { if (typeof TW !== 'undefined' && TW.active && typeof BGM !== 'undefined' && BGM.key !== 'tower' && typeof SFX !== 'undefined' && SFX.music) SFX.music('tower'); });

/* ---------- (v236) from floor 100 the guardian floors bring more guardians ----------
   (v255, the tower ends at 100) floor 90: two guardians · floor 100: the Shadow of Vaira and one guardian at its side
   (v256: two on every floor 80–95 stopped every Lv 300 hero in shop gear at floor 95). Of different regions round the level when possible (the floor's own guardian, plus guardians
   of the regions just below and above). Each extra one is a full tower guardian. */
const tw236Bosses = f => (f === 90 || f === 100) ? 2 : 1;   // (v256) two guardians only on floor 90, and the Shadow with one at its side on 100
{ const _sp = twSpawn; twSpawn = function(){ const r = _sp.apply(this, arguments); const f = TW.f, n = tw236Bosses(f); if (n < 2 || !TW.active || TW.phase !== 'fight') return r;
    const th = typeof twThemes === 'function' ? twThemes() : [], i = th.findIndex(o => o.i === TW.theme), pool = [th[i - 1], th[i + 1], th[i - 2], th[i]].filter(o => o && MAPS[o.i].boss && MOB[MAPS[o.i].boss]).map(o => MAPS[o.i].boss);
    const c = twmC(); let have = mobs.filter(m => m.tw === f && !m.dead && m.def.boss).length;
    for (let k = 0; have < n && k < 6; k++){ const t = pool[k % Math.max(1, pool.length)] || MAPS[TW.theme].boss, a = (have / n) * 6.283 + .6, x = c.x + Math.cos(a) * 170, y = c.y + Math.sin(a) * 110;
      const g = twMob(t, x, y, f); g.bcd = 3 + k; g.roamT = 99; VFX.play('bossArrive', {x, y}); have++; }
    banner(L(`ชั้น ${f} · ♛ ผู้พิทักษ์ ${n} ตน!`, `Floor ${f} · ♛ ${n} guardians!`)); TW.t = Math.max(TW.t, TW_TB + 30 * (n - 1));
    return r; }; }
