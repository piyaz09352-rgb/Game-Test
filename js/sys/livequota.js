/* VAYRATHEN — js/sys/livequota.js — (v186) live rankings stop listening when their window is closed
   The level ranking (Social), the ranking tabs and the arena ranking keep a live Firestore listener on the players'
   cards. Once opened they used to stay on for the whole session, and every card change by anyone (a level, a map
   change) cost each listening player a read — the free plan allows 50,000 reads a day. Now a listener is closed 15 s
   after its window closes and opened again (fresh) when the window is opened. */
'use strict';

const LQ = {t:0, off:{}};
function lqStop(key, open, stop){ if (open){ LQ.off[key] = 0; return; } LQ.off[key] = (LQ.off[key] || 0) + 3; if (LQ.off[key] >= 15){ LQ.off[key] = 0; try { stop(); } catch (e) {} } }
EV.on('tick', dt => {
  if ((LQ.t += dt) < 3) return; LQ.t = 0;
  if (typeof rankUnsub !== 'undefined' && rankUnsub) lqStop('rank', winOpen('social'), () => { rankUnsub(); rankUnsub = null; });
  if (typeof RK !== 'undefined' && typeof RK.sub === 'function') lqStop('rk', winOpen('social'), () => { RK.sub(); RK.sub = null; RK.subTab = null; });
  if (typeof pvpUnsub !== 'undefined' && pvpUnsub) lqStop('pvp', winOpen('arena'), () => { pvpUnsub(); pvpUnsub = null; });
});
