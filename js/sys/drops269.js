/* VAYRATHEN — js/sys/drops269.js — (v269) harder drops, nothing certain
   The owner: monster junk and cards should be harder to get, boss cards hardest of all; bosses and pack leaders drop
   more than ordinary monsters; nothing drops at 100% — the most any single drop can be is 50%; cards around 0.01%.
   · Monster junk (the "etc" loot) ×0.6 from ordinary monsters; other items unchanged.
   · Bosses: every drop ×1.5 (still under the cap). Pack leaders (หัวหน้าฝูง ★): every drop ×2 and a double card chance.
   · Cards: an ordinary monster's card 0.01% (1 in 10,000), a pack leader's 0.02%, a boss card 0.005% (1 in 20,000).
   · The 50% cap holds after the after-work event bonus too. A boss's gear piece is 50% (then 30%, 10%), not certain. */
'use strict';
const DROP269 = {cap:.5, junk:.6, boss:1.5, elite:2, card:.0001, bossCard:.00005};
for (const k in MOB){ const d = MOB[k]; if (!d || d._d269) continue; d._d269 = 1; const boss = !!d.boss;
  if (Array.isArray(d.drops)) d.drops = d.drops.map(([id, ch]) => { const it = ITEMS[id] || {}; const m = boss ? DROP269.boss : it.kind === 'etc' ? DROP269.junk : 1; return [id, Math.min(DROP269.cap, ch * m)]; });
  if (d.cardRate) d.cardRate = boss ? DROP269.bossCard : DROP269.card; }
{ const _k = killMob; killMob = function(m){
    const d = m && m.def; if (!d || !Array.isArray(d.drops)) return _k.apply(this, arguments);
    const nmul = typeof isEvent === 'function' && isEvent() && typeof EVENT_MUL !== 'undefined' ? EVENT_MUL : 1, em = m.elite ? DROP269.elite : 1;
    const drops = d.drops, card = d.cardRate;
    d.drops = drops.map(([id, ch]) => [id, Math.min(DROP269.cap, ch * em * nmul) / nmul]);   // killMob multiplies by the event bonus again
    if (card) d.cardRate = Math.min(DROP269.cap, card * em * nmul) / nmul;
    try { return _k.apply(this, arguments); } finally { d.drops = drops; d.cardRate = card; } }; }
