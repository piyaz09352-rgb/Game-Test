/* VAYRATHEN — js/sys/preload269.js — (v269) monsters drawn before they are met, on every map
   The owner: preload monster pictures for the whole game, not only the tower.
   On entering any map its monsters (and its boss) are painted at once on the display's clock — first one idle frame
   facing you, then the whole idle, walking, attacking, being hit — and then the monsters of the maps its gateways lead
   to, while the picture cache has room. A monster that appears unpainted (a summon, an event) jumps the queue.
   The tower keeps its own painter (tower268). */
'use strict';
const PRE269 = {todo:[], seen:new Set(), t0:0};
/* (v271) how long the display's frames take on this device: the painters take less when the device is already slow */
const FRAME271 = globalThis.FRAME271 || (globalThis.FRAME271 = (() => { const o = {ema:16, last:0}; const f = now => { if (o.last) o.ema += (Math.min(100, now - o.last) - o.ema) * .08; o.last = now; requestAnimationFrame(f); }; requestAnimationFrame(f); return o; })());
const frame271Budget = ms => FRAME271.ema > 30 ? Math.max(.8, ms * .15) : FRAME271.ema > 22 ? Math.max(1, ms * .3) : FRAME271.ema > 18 ? ms * .6 : ms;
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
  PRE269.todo = []; PRE269.seen.clear(); PRE269.t0 = performance.now(); PRE269.far = []; PRE269.farOn = false;
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
    const hub = MAP_ID === 0 || (typeof isTown === 'function' && isTown(MAP_ID));   // (v271) in a town only one standing frame each: you are shopping, not fighting
    if (px < cap) pre269Queue([...new Set(PRE269.far)], hub ? [['idle', 0, 1]] : PRE269_FAR); PRE269.far = []; PRE269.farOn = true;
  }
  if (!PRE269.todo.length) return;
  // (v276) never more than about a quarter of the time: after a slow paint (a phone) wait three times as long before the next,
  // so the game keeps answering taps while monsters are painted (one frame each display frame froze phones after a warp)
  if (performance.now() < (PRE269.rest || 0)) return;
  const t0 = performance.now(), ms = frame271Budget(PRE269.farOn ? 1.5 : t0 - PRE269.t0 < 2500 ? 10 : 4);   // a bigger share just after arriving (less on a slow device)
  while (PRE269.todo.length && performance.now() - t0 < ms){ const [k, act, dir, nf] = PRE269.todo[0], sh = SHEETS[k];
    if (!sh || SPR.prime(sh, [act], ms - (performance.now() - t0), dir, nf)) PRE269.todo.shift(); }
  const took = performance.now() - t0; PRE269.rest = took > 12 ? performance.now() + took * 3 : 0;
}
{ const loop = () => { try { pre269Paint(); } catch (e) {} requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
