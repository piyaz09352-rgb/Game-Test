/* VAYRATHEN — js/sys/smooth3.js — (v89) less work per step, and no freeze when you come back to the game
   · Obstacles in buckets: every walking body (you, each monster, each pet) used to test itself against every tree,
     rock and house on the map (500+) every frame. Now each looks only at the obstacles in its own 128-unit bucket,
     and only a body that actually touches one runs the full check as before (same result). Rebuilt when the map or its obstacle list changes.
   · Background steps are lighter: while the game is hidden it catches up at most half a second per timer tick
     (was two seconds), so a phone waking the page never stalls on a long replay.
   · Coming back (switching apps or tabs): the time spent away is not replayed on the first frame. */
'use strict';

const OBG = {c:128, n:-1, map:null, gen:0, built:-1, M:70};
function obgBuild(){
  const c = OBG.c, M = OBG.M, m = new Map();
  for (const o of obstacles){ const R = o.r + M, x0 = Math.floor((o.x - R) / c), x1 = Math.floor((o.x + R) / c), y0 = Math.floor((o.y - R) / c), y1 = Math.floor((o.y + R) / c);
    for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++){ const k = (gx + 64) * 8192 + gy + 64; let a = m.get(k); if (!a) m.set(k, a = []); a.push(o); } }
  OBG.map = m; OBG.n = obstacles.length; OBG.built = OBG.gen;
}
{ const _po = pushOut;
  pushOut = function(e, r){
    if (!(r <= OBG.M) || !e) return _po(e, r);
    if (OBG.n !== obstacles.length || OBG.built !== OBG.gen || !OBG.map) obgBuild();
    const a = OBG.map.get((Math.floor(e.x / OBG.c) + 64) * 8192 + Math.floor(e.y / OBG.c) + 64);
    if (a) for (const o of a){ const dx = e.x - o.x, dy = e.y - o.y, m = o.r + r;
      if (dx >= m || dx <= -m || dy >= m || dy <= -m) continue;
      if (Math.hypot(dx, dy) < m) return _po(e, r); }   // touching something: the full check, exactly as before
    e.x = clamp(e.x, 20, W - 20); e.y = clamp(e.y, 30, H - 20);
  }; }
{ const _lm = loadMap; loadMap = function(){ OBG.gen++; const r = _lm.apply(this, arguments); OBG.gen++; return r; }; }
/* hidden: smaller catch-up per tick */
bgStep = function(){
  if (!document.hidden || PAUSED || SETTINGS.bgRun === false) return;
  const now = performance.now(); let d = (now - last) / 1000; last = now;
  if (!(d > 0)) return;
  d = Math.min(d, .5);
  while (d > 1e-4){ const s = Math.min(.1, d); advance(s, false); d -= s; }
};
/* back in front: start from now */
document.addEventListener('visibilitychange', () => { if (!document.hidden) last = performance.now(); });
window.addEventListener('pageshow', () => { last = performance.now(); });
window.addEventListener('focus', () => { if (performance.now() - last > 500) last = performance.now(); });
/* a boss's sprite is the biggest there is: paint its frames in spare time the moment it appears, not mid-swing */
{ const _sm = spawnMob, warmed = new Set();
  spawnMob = function(type, x, y, opt){ const m = _sm.apply(this, arguments);
    if (m && MOB[type] && MOB[type].boss && !warmed.has(type) && typeof SHEETS !== 'undefined' && SHEETS && SHEETS[type]){ warmed.add(type); SPR.warm(SHEETS, ['idle', 'walk', 'attack', 'hurt'].map(a => [type, a])); }
    return m; };
}
