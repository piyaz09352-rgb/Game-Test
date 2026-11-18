/* VAYRATHEN — js/world/nature318.js — (v318) nothing grows in the water
   A tree was placed clear of a pond's solid circle (obstacle r × .82), but the painted water reaches further, so on the
   hunting maps a palm or a bush could stand in the middle of a pond. After a map is laid out, every tree, bush, rock or
   flower whose foot is inside a pond's water is taken away (the owner's rule: nothing illogical). */
'use strict';
const NAT318 = new Set(['tree', 'palm', 'pine', 'himtree', 'bamboo', 'banana', 'treefern', 'araucaria', 'deadtree', 'thorntree', 'cycad', 'bush', 'rock', 'fern', 'mushroom',
  'flowerbed', 'flowerbush', 'frangipani', 'hay', 'fruittree', 'cactus', 'willow', 'bodhi', 'rubber', 'tamarind', 'rain', 'jar']);
function nat318Dry(){ if (typeof WATERS === 'undefined' || !WATERS.length) return 0; let n = 0;
  const ponds = WATERS.filter(w => w.k === 'pond' && w.rx > 0 && isFinite(w.x));
  for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!NAT318.has(p.type)) continue;
    if (!ponds.some(w => ((p.x - w.x) / (w.rx + 10)) ** 2 + ((p.y - w.y) / (w.ry + 8)) ** 2 < 1)) continue;
    PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); n++; }
  if (n && typeof NAV !== 'undefined') NAV.grid = null;
  return n; }
{ const _rm = repaintMap; repaintMap = function(){ const r = _rm.apply(this, arguments); try { nat318Dry(); } catch (e) { console.warn('nature318', e); } return r; }; }
