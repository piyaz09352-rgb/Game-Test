/* VAYRATHEN — js/sys/preload269.js — (v269) monsters drawn before they are met, on every map
   The owner: preload monster pictures for the whole game, not only the tower.
   On entering any map its monsters (and its boss) are painted at once on the display's clock — first one idle frame
   facing you, then the whole idle, walking, attacking, being hit — and then the monsters of the maps its gateways lead
   to, while the picture cache has room. A monster that appears unpainted (a summon, an event) jumps the queue.
   The tower keeps its own painter (tower268). */
'use strict';
const PRE269 = {todo:[], seen:new Set(), t0:0};
function pre269Queue(kinds, passes, front){
  const add = [];
  for (const p of passes) for (const k of kinds){ const id = k + '|' + p.join(','); if (PRE269.seen.has(id) || typeof SHEETS === 'undefined' || !SHEETS || !SHEETS[k]) continue; PRE269.seen.add(id); add.push([k, ...p]); }
  PRE269.todo = front ? add.concat(PRE269.todo) : PRE269.todo.concat(add);
}
const PRE269_NEAR = [['idle', 0, 1], ['idle', -1, 99], ['walk', -1, 99], ['attack', -1, 99], ['hurt', -1, 99]];
const PRE269_FAR = [['idle', 0, 1], ['idle', -1, 99], ['walk', -1, 99]];
const pre269Kinds = mp => mp ? [...new Set([...(mp.mobs || []), ...(mp.boss ? [mp.boss] : [])])].filter(k => typeof MOB !== 'undefined' && MOB[k]) : [];
function pre269Map(id){
  const mp = MAPS[id]; if (!mp) return;
  PRE269.todo = []; PRE269.seen.clear(); PRE269.t0 = performance.now(); PRE269.far = [];
  pre269Queue(pre269Kinds(mp), PRE269_NEAR);
  for (const d in mp.links || {}){ const to = MAPS[mp.links[d]]; if (to) PRE269.far.push(...pre269Kinds(to)); }
}
EV.on('map', id => { try { pre269Map(id); } catch (e) {} });
function pre269Paint(){
  if (typeof SPR === 'undefined' || !SPR.prime || typeof SHEETS === 'undefined' || !SHEETS) return;
  if (typeof TW !== 'undefined' && TW.active) return;   // the tower paints its own
  // a monster on screen that has nothing painted yet goes first
  if (typeof mobs !== 'undefined') for (const m of mobs){ if (!m || m.dead || !m.type) continue; const id = m.type + '|idle,0,1'; if (!PRE269.seen.has(id)) pre269Queue([m.type], PRE269_NEAR, true); }
  if (!PRE269.todo.length && PRE269.far && PRE269.far.length){
    const px = SPR.STATS ? SPR.STATS.px : 0, cap = typeof GFX !== 'undefined' && GFX.budget ? GFX.budget * .7 : Infinity;
    if (px < cap) pre269Queue([...new Set(PRE269.far)], PRE269_FAR); PRE269.far = [];
  }
  if (!PRE269.todo.length) return;
  const t0 = performance.now(), ms = t0 - PRE269.t0 < 2500 ? 10 : 4;   // a bigger share just after arriving
  while (PRE269.todo.length && performance.now() - t0 < ms){ const [k, act, dir, nf] = PRE269.todo[0], sh = SHEETS[k];
    if (!sh || SPR.prime(sh, [act], ms - (performance.now() - t0), dir, nf)) PRE269.todo.shift(); }
}
{ const loop = () => { try { pre269Paint(); } catch (e) {} requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
