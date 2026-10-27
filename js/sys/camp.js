/* VAYRATHEN — js/sys/camp.js — the travellers' camp in the middle of every field map
   Where all the trails meet: a packed-earth clearing with a sala (open pavilion), lamps, jars, a crackling
   campfire and the shrine keeper (warp · back to Aren). Like the village it is a safe spot: monsters lose
   interest, nothing spawns inside, and resting there is twice as fast. */
'use strict';

function campPlace(){
  const c = CAMP; if (!c) return; const R0 = 150;
  // clear the ground: no trees, rocks or ponds' banks inside the camp
  for (let i = PROPS.length - 1; i >= 0; i--) if (Math.hypot(PROPS[i].x - c.x, (PROPS[i].y - c.y) * 1.2) < R0 + 20) PROPS.splice(i, 1);
  for (let i = obstacles.length - 1; i >= 0; i--){ const o = obstacles[i]; if (o.prop && Math.hypot(o.x - c.x, (o.y - c.y) * 1.2) < R0 + 20) obstacles.splice(i, 1); }
  // paint the clearing into the ground
  const g = terr.getContext('2d'); g.save(); g.setTransform(TS, 0, 0, TS, 0, 0);
  let sd = c.x * 7 + c.y + MAP_ID * 131; const r = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  const gr = g.createRadialGradient(c.x, c.y, 20, c.x, c.y, R0); gr.addColorStop(0, 'rgba(176,140,88,.95)'); gr.addColorStop(.75, 'rgba(160,126,78,.75)'); gr.addColorStop(1, 'rgba(150,120,70,0)');
  g.fillStyle = gr; g.beginPath(); g.ellipse(c.x, c.y, R0, R0 * .78, 0, 0, 7); g.fill();
  for (let i = 0; i < 500; i++){ const a = r() * 6.28, d = Math.sqrt(r()) * R0 * .9, x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d * .78;
    g.fillStyle = r() < .5 ? 'rgba(110,78,42,.3)' : 'rgba(225,195,145,.26)'; g.beginPath(); g.ellipse(x, y, .8 + r() * 2, .6 + r(), r() * 3, 0, 7); g.fill(); }
  // a ring of stones round the fire pit
  for (let i = 0; i < 12; i++){ const a = i / 12 * 6.28; g.fillStyle = i % 2 ? '#7a7066' : '#948a7c'; g.beginPath(); g.ellipse(c.x + Math.cos(a) * 15, c.y + 18 + Math.sin(a) * 7, 3.6, 2.6, 0, 0, 7); g.fill(); }
  g.fillStyle = '#2a1e16'; g.beginPath(); g.ellipse(c.x, c.y + 18, 11, 5, 0, 0, 7); g.fill();
  g.restore();
  // the camp's furniture
  addProp('sala', c.x - 78, c.y - 30, 0);
  for (const [dx, dy] of [[-120, 40], [100, 52], [-30, -78], [92, -60]]) addProp('lamp', c.x + dx, c.y + dy);
  for (const [dx, dy] of [[-104, -6], [-96, 8], [70, 20]]) addProp('jar', c.x + dx, c.y + dy);
  NAV.grid = null;
}
/* nothing spawns inside the camp: anything that appears there is moved out to its edge */
HK.spawn.push((m, opt) => {
  if (!CAMP || MAP_ID === 0 || opt.minion || m.wb || m.dg) return; const dx = m.x - CAMP.x, dy = m.y - CAMP.y, d = Math.hypot(dx, dy * 1.2);
  if (d >= 190) return; const a = d > 1 ? Math.atan2(dy, dx) : Math.random() * 6.28; m.x = m.hx = CAMP.x + Math.cos(a) * 230; m.y = m.hy = CAMP.y + Math.sin(a) * 190;
});
/* the campfire: flames, embers, warm light */
function campFire(g, x, y, t){
  const fl = .85 + Math.sin(t * 13) * .08 + Math.sin(t * 29) * .05, gr = g.createRadialGradient(x, y - 6, 0, x, y - 6, 70);
  gr.addColorStop(0, `rgba(255,170,70,${.32 * fl})`); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(x - 70, y - 76, 140, 140); g.restore();
  g.fillStyle = '#4a2c16'; g.save(); g.translate(x, y); for (const a of [-.5, .5, 0]){ g.save(); g.rotate(a); g.fillRect(-9, -1.5, 18, 3); g.restore(); } g.restore();
  for (let i = 0; i < 4; i++){ const h = (13 - i * 2.5) * fl + Math.sin(t * 17 + i * 2) * 2, w = 6 - i, ox = Math.sin(t * 9 + i * 1.7) * 1.6;
    g.fillStyle = ['rgba(230,70,20,.9)', 'rgba(255,130,30,.9)', 'rgba(255,200,70,.95)', 'rgba(255,245,200,1)'][i];
    g.beginPath(); g.moveTo(x - w, y - 1); g.quadraticCurveTo(x - w * .6 + ox, y - h * .6, x + ox * 1.5, y - h - 2); g.quadraticCurveTo(x + w * .6 + ox, y - h * .6, x + w, y - 1); g.closePath(); g.fill(); }
  for (let i = 0; i < 5; i++){ const ph = (t * .7 + i / 5) % 1; g.fillStyle = `rgba(255,${180 + 60 * (1 - ph) | 0},90,${1 - ph})`; g.fillRect(x + Math.sin(i * 2.3 + t * 2) * 6 * ph, y - 10 - ph * 34, 1.2, 1.2); }
}
{
  const _ents = LIVE.ents;
  LIVE.ents = function(list, g){ _ents(list, g);
    if (!CAMP || MAP_ID === 0) return; const x = CAMP.x - cam.x, y = CAMP.y + 18 - cam.y; if (x < -90 || x > VW + 90 || y < -90 || y > VH + 90) return;
    list.push({y:CAMP.y + 18, f:() => campFire(g, CAMP.x - cam.x, CAMP.y + 18 - cam.y, T)}); };
}
/* the gentlest monsters of each field gather round the camp, so a fresh arrival has something to hunt right
   outside the clearing: extra spawns of the map's two lowest-level day monsters in a ring around the camp */
{
  const _ss = setupSpawns;
  setupSpawns = function(id){ _ss(id);
    if (id === 0 || !CAMP || !MAPS[id] || !MAPS[id].mobs) return;
    const low = MAPS[id].mobs.filter(t => MOB[t] && !MOB[t].night && !MOB[t].boss).sort((a, b) => MOB[a].lvl - MOB[b].lvl).slice(0, 2); if (!low.length) return;
    const z = {x0:Math.max(MAPZ.x0, CAMP.x - 560), x1:Math.min(MAPZ.x1, CAMP.x + 560), y0:Math.max(MAPZ.y0, CAMP.y - 430), y1:Math.min(MAPZ.y1, CAMP.y + 430)};
    addSlots(low[0], low.length > 1 ? 8 : 12, z); if (low[1]) addSlots(low[1], 5, z);
  };
}
