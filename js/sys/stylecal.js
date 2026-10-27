/* VAYRATHEN — js/sys/stylecal.js — (v161) every play style pulls its weight
   Measured with a 45-second Auto fight per class, tier and style (each style's skills raised first, the class
   weapon of the level, the main stats of the class): the skill styles did half of what plain attacks did (their SP
   runs dry long before the fight ends), one bow class did four times the others and the healers' damage style
   out-hit the damage classes. Each class now has a factor per style that brings it to the same level as the others
   of its tier: about 950 damage a second at Lv 80 (tier 2), 8,500 at Lv 150 (tier 3), 30,000 at Lv 230 (tier 4).
   Styles built to do something else hit less on purpose: tank ×0.7, control ×0.8, pets & traps ×0.9, endurance ×0.7,
   venom & evasion ×0.85, the healer's support ×0.5 and team buffs ×0.55, the summoner's support ×0.6.
   Your style is the one you have learned furthest (its points over the most it can take; a tie takes the mean). */
'use strict';

const STYLE_CAL = {
  archsage:{a:0.84, b:1.72, c:0.83},
  astro:{a:1.1, b:1.22, c:1.18},
  bandit:{a:0.96, b:1.04, c:1.42},
  blade:{a:1.5, b:1.78, c:1.12},
  bulwark:{a:1.3, b:1.9, c:0.91},
  divinehealer:{a:0.58, b:0.62, c:1.73},
  grandmaster:{a:0.76, b:1.62, c:0.49},
  healer:{a:0.46, b:0.27, c:0.6},
  himmaemperor:{a:0.73, b:0.62, c:0.7},
  muay:{a:0.53, b:1.44, c:0.31},
  physician:{a:0.5, b:0.5, c:1.33},
  ranger:{a:1.04, b:1.44, c:1.37},
  ringlord:{a:0.54, b:2.5, c:0.29},
  rogue:{a:1.11, b:1.11, c:1.53},
  rune:{a:0.73, b:0.8, c:0.68},
  sovereign:{a:0.87, b:0.56, c:1.05},
  summoner:{a:0.59, b:0.21, c:0.57},
  sylvan:{a:0.32, b:1.03, c:0.32},
  tigershade:{a:1.14, b:2.17, c:1.63},
  warden:{a:0.98, b:1.61, c:0.99},
  warlord:{a:1.47, b:1.65, c:1.0}
};
const SCAL = {k:1};
function styleCalNow(){
  if (!S || !S.skills || typeof SK8_OF === 'undefined') return 1;
  const c = STYLE_CAL[S.job]; if (!c) return 1;
  // how far each style is learned: its points over the most it can take (a style with more skills does not win by size)
  const pts = {a:0, b:0, c:0}, cap = {a:0, b:0, c:0}; let n = 0;
  for (let j = S.job; j && JOBS[j]; j = JOBS[j].parent) for (const id of JOBS[j].skills || []){ const st = SK8_OF[id], sk = SKILLS[id]; if (!st || !sk || cap[st] == null) continue;
    cap[st] += sk.max || 10; const v = S.skills[id] | 0; if (v > 0){ pts[st] += v; n += v; } }
  if (!n) return 1;
  const r = x => (cap[x] ? pts[x] / cap[x] : 0), top = Math.max(r('a'), r('b'), r('c')), win = ['a', 'b', 'c'].filter(x => r(x) === top);   // the most complete style (a tie: the mean)
  return win.reduce((t, x) => t + c[x], 0) / win.length;
}
/* worked out again whenever the stats are (skills learned, job changed), not on every hit */
{ const _d = derive; derive = function(){ const r = _d.apply(this, arguments); try { SCAL.k = styleCalNow(); } catch (e) { SCAL.k = 1; } return r; }; }
HK.outMul.push(mult => mult * SCAL.k);
