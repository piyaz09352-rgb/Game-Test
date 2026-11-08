/* VAYRATHEN — js/sys/afk272.js — (v272) Auto left running pays its way
   The owner: most players leave Auto on and barely play by hand, and nobody wants to sit and rest. The income report
   (docs/INCOME.md) showed Auto drinking a Blue Potion every time SP fell under 20% — at Lv 15 about 700 an hour,
   costing several times what the hunt earned. Now:
   · AUTO SAVES SP: under 15% SP it uses only cheap skills (≤ 12% of max SP) and fights with normal attacks in between,
     so SP comes back while it fights; it drinks an SP potion only under 10% (it was 20%). It never sits to rest by
     default (players who turned sitting on themselves keep it).
   · CASTERS (INT classes) recover SP faster: +1% of max SP every 2 s, on top of the usual regeneration.
   · SP POTIONS cost a third: Blue Potion 60 Bia, Big Blue Potion 360.
   · MONSTER JUNK from low levels sells for more (drop rates untouched): ×2 below Lv 70, easing to ×1 at Lv 120. */
'use strict';
const AFK272 = {low:.15, cheap:.12, potSp:10};   // (tuned: at 30% / 8% kills fell by a third and fights grew long enough to cost more HP potions)
// Auto's defaults: no sitting, SP potions at 10% (a save still on the old defaults moves over once)
{ const _bs = botSet; botSet = function(){ const b = _bs.apply(this, arguments);
    if (!b.v272){ b.v272 = 1; if (b.sit === true && b.sitHp === 50 && b.sitSp === 15) b.sit = false; if (b.potSp === 20) b.potSp = AFK272.potSp; }
    return b; }; }
// spend SP wisely: when it is low, only cheap skills (normal attacks fill the gaps)
{ const _bp = botPick; botPick = function(t){ const r = _bp.apply(this, arguments); if (!r || !t) return r;
    const b = S.bot || {}; if (b.basic === false) return r;   // with normal attacks off there is nothing to fall back on
    const sk = SKILLS[r]; if (!sk || botKind(sk) !== 'atk' || S.sp / DER.maxsp >= AFK272.low) return r;
    return sk.sp(skl(r)) <= DER.maxsp * AFK272.cheap ? r : null; }; }
// casters recover SP faster
{ let acc = 0; EV.on('tick', dt => { if (PAUSED || !S || !S.lvl || P.dead || !JOBS[S.job] || !/INT/.test(JOBS[S.job].stat || '')) return; acc += dt; if (acc < 2) return; acc = 0;
    if (S.sp < DER.maxsp) S.sp = Math.min(DER.maxsp, S.sp + Math.max(1, Math.ceil(DER.maxsp * .01))); }); }
// prices
if (ITEMS.bluepot){ ITEMS.bluepot.buy = 60; ITEMS.bluepot.sell = Math.min(ITEMS.bluepot.sell || 0, 15); }
if (ITEMS.bigbluepot){ ITEMS.bigbluepot.buy = 360; ITEMS.bigbluepot.sell = Math.min(ITEMS.bigbluepot.sell || 0, 90); }
{ const lvOf = {}; for (const k in MOB){ const d = MOB[k]; if (!d || !d.lvl || d.boss) continue; for (const [id] of d.drops || []) if (lvOf[id] == null || d.lvl < lvOf[id]) lvOf[id] = d.lvl; }
  for (const id in ITEMS){ const it = ITEMS[id]; if (!it || it.kind !== 'etc' || typeof it.sell !== 'number' || it._afk272) continue; const lv = lvOf[id]; if (lv == null) continue;
    const k = lv < 70 ? 2 : lv < 120 ? 2 - (lv - 70) / 50 : 1; it.sell = Math.max(1, Math.round(it.sell * k)); it._afk272 = 1; } }
