/* VAYRATHEN — js/sys/autostat322.js — (v322) Auto can spend stat points
   A new hero left on Auto never spent a point: after 6 minutes it sat on almost 100 unspent points and kept dying. With
   «Spend stat points for me» on (Auto settings, off by default), while Auto runs the leftover points go to the class's
   main stats: (v323) VIT 35 % before Lv 40, 28 % to Lv 69, 22 % after; the rest 60 / 40 between the class's first and
   second stat; a caster stops raising DEX at the fastest cast (DEX×2 + INT = 300). The player's own spending is untouched. */
'use strict';
function asPlan(){ const J = JOBS[S.job] || {}, root = J.parent && JOBS[J.parent] ? JOBS[J.parent] : J;
  const main = String(J.stat || root.stat || 'STR · VIT').toLowerCase().match(/str|agi|vit|int|dex|luk/g) || ['str'];
  /* (v323) by stage: more VIT while the hero is young (Lv < 40), less later; a caster stops adding DEX once DEX×2 + INT
     reaches 300 (the fastest cast there is) and puts it into its first stat instead */
  const lv = S.lvl || 1, vitF = lv < 40 ? .35 : lv < 70 ? .28 : .22, rest = 1 - vitF, want = {};
  const add = (k, f) => { want[k] = (want[k] || 0) + f; };
  add(main[0], rest * .6); add(main[1] || 'vit', rest * .4); add('vit', vitF);
  const caster = !!(J.caster || root.caster);
  if (caster && want.dex && S.stats.dex * 2 + S.stats.int >= 300){ add(main[0] === 'dex' ? (main[1] || 'int') : main[0], want.dex); delete want.dex; }
  return want; }
function asSpend(){
  if (!S || !(S.statPts > 0) || typeof statCost !== 'function') return 0;
  const want = asPlan(), cap = typeof STAT_CAP === 'function' ? STAT_CAP() : 99; let n = 0;
  for (let g = 0; g < 400 && S.statPts > 0; g++){
    const total = Object.keys(want).reduce((a, k) => a + Math.max(0, S.stats[k] - 1), 0) || 1;
    let best = null, gap = -1e9; for (const k in want){ const d = want[k] - Math.max(0, S.stats[k] - 1) / total; if (S.stats[k] < cap && statCost(S.stats[k]) <= S.statPts && d > gap){ gap = d; best = k; } }
    if (!best) break; S.statPts -= statCost(S.stats[best]); S.stats[best]++; n++; }
  if (n) derive();
  return n; }
{ let last = -9; EV.on('tick', () => { if (T - last < 1 && T >= last) return; last = T;   /* once a second of game time */
    if (typeof BOT !== 'undefined' && BOT.on && S && S.bot && S.bot.autoStat && S.statPts > 0) asSpend(); }); }
