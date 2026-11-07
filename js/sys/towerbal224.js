/* VAYRATHEN — js/sys/towerbal224.js — (v224) a tower you can climb alone
   tools/tower-report.js showed every class at every level stopped by the first guardian after its start, even one 26
   levels below it: a guardian is a region boss, already built for a party of 3–5 (boss192.js: HP ×3.5, hits ×1.5),
   and the dungeon scaling then gave it ×3.3 HP again, so a lone climber met about 11× a boss's HP in 105 seconds.
   Now a tower guardian is made for one climber: TWB.hp × the HP, TWB.atk × the hits and TWB.def × the defence of an
   ordinary monster of the same floor (same level, same party size), so it is a real fight but not a wall; still
   tougher for each party member. It keeps its moves, its warnings and its berserk at 30%.
   Auto also fights the guardian inside the tower (it keeps away from bosses everywhere else, as before). */
'use strict';
const TWB = {hp:6, atk:1.3, def:1.2};
/* (v255) the 100-floor tower: tools/tower-report.js showed heroes of Lv 200–300 stopped by guardians 20–27 levels
   under their own (low floors were fine, about their own level). A guardian's HP and hits ease off from floor 30 to
   the top (×1 → ×TWB_TOP), so the last floors stay hard but a strong Lv 300 can reach the top. */
const TWB_TOP = {hp:.75, atk:.7};   // (v256) HP: on top of tower235's ease for every tower monster
const twbEase = (f, k) => f <= 30 ? 1 : 1 - (1 - TWB_TOP[k]) * Math.min(1, (f - 30) / 70);
{ const _m = twMob; twMob = function(type, x, y, f){ const m = _m.apply(this, arguments);
    if (m && MOB[type] && MOB[type].boss){
      // measured against an ordinary monster of the same floor (same level, same party size, same past-Lv-300 growth)
      const mp = MAPS[TW.theme] || {}, kind = (mp.mobs || []).find(t => MOB[t] && !MOB[t].boss && !MOB[t].night);
      if (kind){ const ref = {def:dgDef(kind, m.dgc)}; ref.maxhp = ref.hp = ref.def.hp; twScale(ref, f); const pc = clamp(DG.pc | 0 || 1, 1, 5);
        m.def = {...m.def, hp:Math.max(60, Math.round(ref.def.hp * TWB.hp * twbEase(f, 'hp') * (1 + (pc - 1) * .35))), atk:ref.def.atk.map(v => Math.max(1, Math.round(v * TWB.atk * twbEase(f, 'atk')))), def:Math.round(ref.def.def * TWB.def)};
        m.maxhp = m.hp = m.def.hp; m.twGuard = true; } }
    return m; }; }
// Auto: no keeping away from the tower's guardian (restored when the climb ends)
EV.on('tick', () => {
  const on = typeof TW !== 'undefined' && TW.active;
  if (on){ if (typeof botSet === 'function' && !S.bot) botSet(); if (S.bot && S.bot.avoidBoss !== false){ S.bot.avoidBoss = false; S.bot._twAvoid = true; } }
  else if (S && S.bot && S.bot._twAvoid){ S.bot.avoidBoss = true; delete S.bot._twAvoid; }
});
/* (v256) a guardian's real blows go through bossPunch (bosshard.js: a share of a reference HP for its level), which the
   eased hits above never touched: at floor 60 one blow took 35% of a Lv 200 swordsman and 75% of a healer. In the
   tower the blows ease from floor 30 down to ×TWB_PUNCH at the top. */
const TWB_PUNCH = .35, twbPunch = f => f <= 30 ? 1 : 1 - (1 - TWB_PUNCH) * Math.min(1, (f - 30) / 55);   // full by floor 85
if (typeof bossPunch === 'function'){ const _bp = bossPunch; bossPunch = function(m){ const r = _bp.apply(this, arguments);
    return m && m.twGuard && typeof TW !== 'undefined' && TW.active ? Math.max(1, Math.round(r * twbPunch(TW.f))) : r; }; }
