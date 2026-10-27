/* VAYRATHEN — js/world/biome3.js — the thirty new regions get ground colours of their own (v29)
   A new region borrows a biome recipe (props, water, weather, music) but its grass, earth and flowers lean toward the
   region's own hue, so Sunflower Meadow is golden, Sapphire Grotto blue and Crimson Lake red. */
'use strict';
function b3Col(c, hue, k){
  if (typeof c !== 'string') return c;
  if (/^#[0-9a-f]{6}$/i.test(c)) return w3Tint(c, hue, k, 20);
  const m = c.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/); if (!m) return c;
  const hex = '#' + [m[1], m[2], m[3]].map(v => (+v).toString(16).padStart(2, '0')).join(''), t = w3Tint(hex, hue, k, 20), n = parseInt(t.slice(1), 16);
  return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${m[4]})`;
}
function b3Recipe(B, hue){
  const o = {...B}, map = (a, k) => (Array.isArray(a) ? a.map(c => b3Col(c, hue, k)) : a);
  o.base = map(B.base, .38); o.mottle = map(B.mottle, .3); o.blades = B.blades && map(B.blades, .42); o.flowers = B.flowers && map(B.flowers, .7);
  return o;
}
{ const _pm = paintMap;
  paintMap = function(mapId){ const mp = MAPS[mapId]; if (!mp || mp.hue == null || !BIOME[mp.biome]) return _pm.apply(this, arguments);
    const k = mp.biome, keep = BIOME[k]; BIOME[k] = b3Recipe(keep, mp.hue);
    try { return _pm.apply(this, arguments); } finally { BIOME[k] = keep; } }; }
