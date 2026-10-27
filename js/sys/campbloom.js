/* VAYRATHEN — js/sys/campbloom.js — (v85) gardens for the travellers' camps, in the style of Aren's square:
   a flower bed on each side of every trail opening, clipped hedges along the stones and a few flowering trees
   round the outside. Snowy and volcanic lands get none (nothing would bloom there). Props are cached images, so
   this adds no drawing work beyond a few more sprites on screen. */
'use strict';

{ const _cp = campPlace;
  campPlace = function(){ _cp();
    const c = CAMP; if (!c || typeof BLOOM === 'undefined') return;
    const mp = MAPS[MAP_ID] || {}, land = mp.land, th = campTheme();
    if (CAMP_SNOWY.includes(mp.biome) || th === CAMP_THEME.volcanic || th.snow) return;
    const R0 = 175, k0 = MAP_ID * 3;
    let sd = (MAP_ID * 4099 + 77) % 233280; const r = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
    const free = (x, y, d) => !PROPS.some(p => Math.hypot(p.x - x, p.y - y) < d) && walkable(x, y, 6);
    // flower beds either side of the three trail openings (east, south, west)
    for (const o of [0, Math.PI / 2, Math.PI]) for (const s of [-1, 1]){ const a = o + s * .34, x = c.x + Math.cos(a) * R0 * 1.1, y = c.y + Math.sin(a) * R0 * 1.1;
      if (free(x, y, 40)) addProp('flowerbed', x, y, (k0 + (s > 0 ? 1 : 0) + Math.round(o * 2)) % 6); }
    // hedges in short runs just outside the stones
    for (let i = 0; i < 40; i++){ const a = i / 40 * 6.283; if ([0, Math.PI / 2, Math.PI].some(o => Math.abs(Math.atan2(Math.sin(a - o), Math.cos(a - o))) < .5) || Math.abs(a - 4.712) < .7) continue;
      if (i % 4 === 3) continue; const x = c.x + Math.cos(a) * R0 * 1.08, y = c.y + Math.sin(a) * R0 * 1.08; if (free(x, y, 24)) addProp('hedge', x, y, (k0 + (i >> 2)) % 6); }
    // flowering trees round the outside
    for (let i = 0; i < 5; i++){ const a = .25 + i * 1.25 + r() * .2, d = R0 * (1.5 + r() * .2), x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d;
      if ([0, Math.PI / 2, Math.PI].some(o => Math.abs(Math.atan2(Math.sin(a - o), Math.cos(a - o))) < .3)) continue;
      if (free(x, y, 70)) addProp(i % 2 ? 'bougain' : 'frangipani', x, y, (k0 + i) % 2); }
    NAV.grid = null;
  };
}
