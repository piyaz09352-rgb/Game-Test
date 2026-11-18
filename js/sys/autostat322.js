/* VAYRATHEN — js/sys/autostat322.js — (v322) Auto can spend stat points
   A new hero left on Auto never spent a point: after 6 minutes it sat on almost 100 unspent points and kept dying. With
   «Spend stat points for me» on (Auto settings, off by default), while Auto runs the leftover points go to the class's
   main stats the way tools/balance-report.js builds a hero: its first main stat about 45 %, its second about 30 %, VIT
   the rest (a class whose main stats are STR and VIT puts the rest in VIT too). The player's own spending is untouched. */
'use strict';
function asPlan(){ const J = JOBS[S.job] || {}, root = J.parent && JOBS[J.parent] ? JOBS[J.parent] : J;
  const main = String(J.stat || root.stat || 'STR · VIT').toLowerCase().match(/str|agi|vit|int|dex|luk/g) || ['str'];
  const want = {}; for (const [k, f] of [[main[0], .45], [main[1] || 'vit', .3], ['vit', .25]]) want[k] = (want[k] || 0) + f; return want; }
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
