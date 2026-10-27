/* VAYRATHEN — js/sys/w4camp.js — the camp on the maps of data/world4.js keeps to its age and land (v152)
   Every field map's camp rests under the World Tree (sys/worldtree.js), hung with three-coloured cloth. In the Age
   of Dinosaurs that tree is an ancient araucaria instead; past the volcano the camp shelters by a dragon's skull
   (dragon lands) or a violet obelisk (demon lands). Loaded after sys/worldtree.js. */
'use strict';
{ const _cp = campPlace;
  campPlace = function(){
    const r = _cp.apply(this, arguments), mp = MAPS[MAP_ID]; if (!mp || !mp.w4) return r;
    const i = PROPS.findIndex(p => p.type === 'worldtree'); if (i < 0) return r;
    const p = PROPS[i]; PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1);
    const kind = mp.land === 'fertile' ? 'camparaucaria' : ['dragonvale', 'dragonroost'].includes(mp.biome) ? 'dragonskull' : 'obelisk';
    addProp(kind, p.x + (kind === 'camparaucaria' ? 0 : 60), p.y + (kind === 'camparaucaria' ? 0 : 20), 0);
    if (typeof NAV !== 'undefined') NAV.grid = null;
    return r;
  }; }

/* (v154) the World Trees keep their land's mood in natural colours (see world/props4.js) */
if (typeof CAMP_THEME !== 'undefined'){
  Object.assign(CAMP_THEME.volcanic.leaf, {leafD:'#4a2a14', leafM:'#7a4a1e', leafL:'#a8702e'});
  Object.assign(CAMP_THEME.dark.leaf, {leafD:'#1e3020', leafM:'#2e4a2e', leafL:'#4e6a3e'});
  Object.assign(CAMP_THEME.light.leaf, {leafD:'#5a6a22', leafM:'#8a8a2a', leafL:'#d8b830'});
}
