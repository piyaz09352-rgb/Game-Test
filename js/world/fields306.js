/* VAYRATHEN — js/world/fields306.js — (v306) no monsters in town: the Suwannin Fields become a map of their own
   The owner: «move the monsters and the boss in town out to a new map; from now on monsters must not be in a town;
   less lag». Aren's map held the capital in the middle and its starter monsters (Dew Jelly, hare, boar, forest fowl,
   bullfrog, the night lanterns) and their boss in the fields on both sides. Now:
   · a new hunting map, ทุ่งสุวรรณิน (Suwannin Fields, Lv 1–15), takes those six monsters and the boss. It is the first
     map out of Aren's east gate, before the Whispering Bamboo: Aren ⇄ Suwannin Fields ⇄ Whispering Bamboo. It has a
     travellers' camp like every hunting map (the shrine keeper there warps you home free).
   · Aren has no monsters and no boss at all (no spawn slots, no boss clock): the whole map is the town.
   · the first story chapter («The Lost Lanterns», set in the fields) moves to the new map with its monsters.
   The new map is added at the END of the list (its number is new), so every map keeps its number and saves stay valid.
   The rest (spawns, the tutorial's way out to the fields, Auto, old saves' chapter) is in js/sys/fields306b.js. */
'use strict';
if (!BIOME.fields) BIOME.fields = {base:['#6c9a48', '#78a650', '#86b25a'], mottle:['rgba(40,80,30,.45)', 'rgba(240,220,140,.28)'], blades:['#4f8a3e', '#6fa84a', '#c8b450', '#8cc35e'], bladeN:42000,
  road:['#8a6a3e', '#b08a56', '#bf9a62'], flowers:['#f2c14e', '#ffffff', '#f6a0c0'], ponds:3, props:[['tree', 5, 3], ['bush', 4, 3], ['banana', 2, 3], ['palm', 2, 3], ['rock', 2, 1]], propN:120};
const FIELDS306 = (() => {
  const A = MAPS[0], R = ROADS.e, B = MAPS[R[0]], id = MAPS.length;
  const mp = {id, name:'ทุ่งสุวรรณิน', en:'Suwannin Fields', lv:[1, 15], biome:'fields', mobs:A.mobs.slice(), boss:A.boss, fields:1, bgm:'aren_out', land:B.land,
    desc:['ทุ่งนาสีทองนอกประตูตะวันออกของนครอาเรน ที่ล่าแห่งแรกของนักผจญภัย', "Golden fields outside Aren's east gate: an adventurer's first hunting ground"],
    links:{w:0, e:B.id}, wx:(A.wx + B.wx) / 2, wy:(A.wy + B.wy) / 2 + .03};
  MAPS.push(mp); A.links.e = id; B.links.w = id; R.unshift(id);
  A.mobs = []; A.boss = null; A.desc = ['เมืองหลวงกลางอาณาจักร ไม่มีมอนสเตอร์ในเมือง', 'The capital at the heart of the realm: no monsters inside the town'];
  if (typeof WM_PIC !== 'undefined' && WM_PIC[0] && WM_PIC[B.id]) WM_PIC[id] = [(WM_PIC[0][0] + WM_PIC[B.id][0]) / 2, (WM_PIC[0][1] + WM_PIC[B.id][1]) / 2];
  if (typeof MAP_BGM !== 'undefined'){ MAP_BGM[id] = 'aren_out'; delete MAP_BGM[0]; }
  if (typeof MS_CH !== 'undefined' && MS_CH[0]){ MS_CH[id] = MS_CH[0]; delete MS_CH[0]; }
  if (typeof MS_ARCS !== 'undefined') for (const arc of MS_ARCS) if (arc.maps) arc.maps = arc.maps.map(m => (m === 0 ? id : m));
  return {id, mobs:mp.mobs, boss:mp.boss};
})();
