/* VAYRATHEN — js/sys/jobfx.js — (v126) a class change you can actually see
   The old effect was a burst of white-gold light: a bright pillar, a screen flash, three bursts of additive sparks,
   a shake and a 4-second blazing aura around the hero — the hero vanished inside it. Now (also for the other moments
   that used the same "jobChange" effect: quests, dungeons, the tower, pets evolving) it is soft and readable:
   · two thin gold rings open slowly on the ground from the feet;
   · lotus petals spiral up round the hero and drift away;
   · a faint narrow column of light, never brighter than the hero;
   · for a class change, the ring takes the new class's colour, and a few slow motes rise for a moment longer.
   No flash, no shake, no additive glare. Drawn by skillfx2.js's effect layer. */
'use strict';

function fxJobSoft(o, col, colL, long){
  const C = col || '#e3b04b', CL = colL || '#fff0b8';
  const petals = Array.from({length:14}, (_, i) => ({a:i / 14 * Math.PI * 2, r:rand(14, 26), d:rand(0, .5), h:rand(70, 110), s:rand(.8, 1.2), pink:i % 3 !== 0}));
  const motes = Array.from({length:long ? 16 : 8}, () => ({x:rand(-26, 26), d:rand(.2, 1.2), v:rand(18, 34)}));
  fx2Add({life:long ? 2.8 : 2.0, draw(g, k, z){
    const X = sx(o.x), Y = sy(o.y), m = z * .6, life = this.life;
    // the column: faint and narrow
    const ca = Math.sin(Math.min(1, k * 1.6) * Math.PI) * .22, cw = 18 * m;
    const gr = g.createLinearGradient(0, Y - 150 * m, 0, Y); gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(1, `rgba(255,236,190,${ca})`);
    g.fillStyle = gr; g.fillRect(X - cw / 2, Y - 150 * m, cw, 150 * m);
    // two rings opening on the ground
    for (const [st, mul] of [[0, 1], [.25, .7]]){ const q = Math.max(0, Math.min(1, (k - st) / .7)); if (!q) continue;
      g.globalAlpha = (1 - q) * .75; g.strokeStyle = mul === 1 ? C : CL; g.lineWidth = 2;
      g.beginPath(); g.ellipse(X, Y, (14 + q * 60) * m * mul + 6 * m, (6 + q * 24) * m * mul + 2 * m, 0, 0, 7); g.stroke(); }
    // lotus petals spiralling up
    for (const p of petals){ if (k < p.d) continue; const q = Math.min(1, (k - p.d) / .75), a = p.a + q * 3.2;
      const px = X + Math.cos(a) * p.r * m * (1 + q * .4), py = Y - q * p.h * m + Math.sin(a) * p.r * m * .35;
      g.globalAlpha = Math.sin(q * Math.PI) * .9; g.save(); g.translate(px, py); g.rotate(a + q * 2);
      g.fillStyle = p.pink ? '#ffc6d6' : '#fff4cc'; g.beginPath(); g.ellipse(0, 0, 3.6 * m * p.s, 1.6 * m * p.s, 0, 0, 7); g.fill();
      g.strokeStyle = p.pink ? 'rgba(220,110,150,.6)' : 'rgba(200,160,60,.6)'; g.lineWidth = .7; g.beginPath(); g.moveTo(-3 * m * p.s, 0); g.lineTo(3 * m * p.s, 0); g.stroke(); g.restore(); }
    // slow motes
    g.fillStyle = CL; for (const p of motes){ if (k * life < p.d) continue; const t = k * life - p.d, q = t / (life - p.d);
      g.globalAlpha = Math.max(0, 1 - q) * .8; g.beginPath(); g.arc(X + p.x * m, Y - 20 * m - t * p.v * m, 1.5, 0, 7); g.fill(); }
  }});
}
const JFX = {pend:0};
{ const _p = VFX.play;
  VFX.play = function(key, o = {}){
    // a class change plays both: let the coloured class version stand alone
    if (key === 'jobChange'){ const at = {x:o.x, y:o.y}; JFX.pend = setTimeout(() => { JFX.pend = 0; fxJobSoft(at); }, 30); return; }
    if (key === 'classAura'){ if (JFX.pend){ clearTimeout(JFX.pend); JFX.pend = 0; } fxJobSoft({x:P.x, y:P.y}, o.col, o.colL, true); return; }
    return _p.apply(this, arguments); }; }
