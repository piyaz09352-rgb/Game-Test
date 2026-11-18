/* VAYRATHEN — js/world/aren311.js — (v311) Aren grows into a village-town (หมู่บ้านกึ่งเมือง)
   The owner: «expand the capital's layout and make its structure a semi-urban village». Since v306 no monsters live on
   Aren's map, so the forest on the west and the paddies on the east were empty ground. The round plaza with its ring of
   shops stays the town's heart; around it the rest of the map becomes the village:
   · four earth roads run from the plaza out to the four gates, and a ring lane goes round the plaza;
   · the WEST QUARTER (where the forest stood) is the homes: rows of house plots along lanes — a raised Thai house or a
     cottage, a fenced yard, a spirit house, a banana or fruit tree, water jars, a flower bed — round the old lotus pond;
   · the EAST QUARTER is the farm hamlet at the edge of the paddies: farmhouses with haystacks and a granary sala, and
     the paddies beyond;
   · the SOUTH ROAD is the market lane down to the boat landing: stalls on both sides under lamps;
   · the north corners take a few more homes; the woods stay only along the map's edges.
   Nothing here blocks a way: houses keep clear of the roads, the gates, the plaza and every NPC, and the walks are
   checked (tests/aren311.test.js). Townsfolk walk the whole village, not only the plaza. The map keeps its size and
   every NPC and shop keeps its place, so nothing else changes. */
'use strict';
const AR11 = {homes:false, cx:1200, cy:800, plazaRX:610, plazaRY:440};
const ar11Npcs = () => (typeof NPCS_HOME !== 'undefined' ? NPCS_HOME : NPCS);   // Aren's own people (NPCS still holds the last map's while the ground is painted)
const ar11Wet = (x, y, room) => typeof VPOND !== 'undefined' && Math.hypot((VPOND.x - x) / ((VPOND.rx || 90) + room), (VPOND.y - y) / ((VPOND.ry || 50) + room)) < 1;
/* the 100-floor tower monument's ground (js/world/towermon232.js clears everything standing behind it): keep it free */
const ar11Monument = (x, y) => { const gk = ar11Npcs().find(n => n.id === 'gatekeeper'); if (!gk) return false; const cx = gk.x + 160, cy = gk.y + 70; return Math.abs(x - cx) < 280 && y > cy - 400 && y < cy + 90; };
const ar11Rng = s => () => (s = (s * 9301 + 49297) % 233280) / 233280;
/* the roads, as polylines from the plaza edge to each gate (the gates of map 0 are fixed: see gatePos in maps.js) */
function ar11Roads(){ if (typeof GATES === 'undefined') return []; const out = [];
  for (const gt of GATES){ const dx = gt.x - AR11.cx, dy = gt.y - AR11.cy, a = Math.atan2(dy / AR11.plazaRY, dx / AR11.plazaRX), sx = AR11.cx + Math.cos(a) * AR11.plazaRX * .92, sy = AR11.cy + Math.sin(a) * AR11.plazaRY * .92, pts = [];
    for (let i = 0; i <= 24; i++){ const t = i / 24, w = Math.sin(t * Math.PI) * 26 * (gt.side === 'e' || gt.side === 'w' ? 1 : -1); pts.push([sx + (gt.x - sx) * t + (gt.side === 'n' || gt.side === 's' ? w : 0), sy + (gt.y - sy) * t + (gt.side === 'e' || gt.side === 'w' ? w : 0)]); }
    out.push({side:gt.side, pts}); }
  return out; }
const ar11SegD = (x, y, pts) => { let best = 1e9; for (let i = 1; i < pts.length; i++){ const [ax, ay] = pts[i - 1], [bx, by] = pts[i], vx = bx - ax, vy = by - ay, L = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / L)); best = Math.min(best, Math.hypot(ax + vx * t - x, ay + vy * t - y)); } return best; };
/* the plots of each quarter (deterministic: the same village every time it is painted) */
function ar11Plots(){ const r = ar11Rng(31107), roads = ar11Roads(), rows = ar11Rows(), plots = [];
  const free = (x, y, room) => { if (x < 120 || y < 150 || x > W - 120 || y > H - 120) return false;
    if (Math.hypot((x - AR11.cx) / (AR11.plazaRX + room), (y - AR11.cy) / (AR11.plazaRY + room)) < 1) return false;
    if (typeof POND !== 'undefined' && Math.hypot(x - POND.x, y - POND.y) < POND.r + room + 30) return false;
    if (GATES.some(g => Math.hypot(g.x - x, g.y - y) < 260)) return false;   // a tall house in front of a gate would hide it (gateclear274 takes it away)
    if (roads.some(rd => ar11SegD(x, y, rd.pts) < room + 34)) return false;
    if (ar11Npcs().some(n => Math.hypot(n.x - x, n.y - y) < room + 60)) return false;
    if (ar11Wet(x, y, room + 20)) return false;
    if (ar11Monument(x, y)) return false;
    if (rows.some(o => Math.hypot(o.x - x, (o.y - y) * 1.2) < room + 110)) return false;
    return !plots.some(p => Math.hypot(p.x - x, (p.y - y) * 1.3) < room + p.room + 30); };
  // west quarter: homes in rows along east-west lanes
  for (let y = 220; y < H - 160; y += 175) for (let x = 190; x < AR11.cx - AR11.plazaRX - 40; x += 200){ const px = x + (r() - .5) * 40, py = y + (r() - .5) * 26; if (free(px, py, 70)) plots.push({x:px, y:py, room:70, kind:r() < .55 ? 'stilt' : 'house', q:'w', s:r()}); }
  // east hamlet: farmhouses between the plaza and the paddies, and along the paddy edge
  for (let y = 230; y < H - 160; y += 190) for (let x = AR11.cx + AR11.plazaRX + 70; x < Math.min(W - 160, AR11.cx + AR11.plazaRX + 330); x += 210){ const px = x + (r() - .5) * 30, py = y + (r() - .5) * 26; if (free(px, py, 66)) plots.push({x:px, y:py, room:66, kind:'farm', q:'e', s:r()}); }
  // north corners: a few more homes
  for (const [x0, x1] of [[560, 900], [1520, 1900]]) for (let x = x0; x < x1; x += 190){ const px = x + (r() - .5) * 30, py = 230 + (r() - .5) * 30; if (free(px, py, 64)) plots.push({x:px, y:py, room:64, kind:r() < .5 ? 'stilt' : 'house', q:'n', s:r()}); }
  return plots; }
/* (v312) shophouses (ห้องแถว) facing the roads near the plaza: the semi-urban street of the village-town */
function ar11Rows(){ const out = []; let v = 0;
  for (const rd of ar11Roads()){ if (rd.side === 's') continue;
    for (let i = 2; i < rd.pts.length - 6; i += 4){ const [x, y] = rd.pts[i], [x2, y2] = rd.pts[i + 1], d = Math.hypot(x2 - x, y2 - y) || 1, nx = -(y2 - y) / d, ny = (x2 - x) / d;
      for (const sd of [-1, 1]){ const hx = x + nx * sd * 112, hy = y + ny * sd * 112 + (rd.side === 'n' ? 0 : sd > 0 ? 40 : 0);
        if (hx < 140 || hx > W - 140 || hy < 200 || hy > H - 140) continue;
        if (Math.hypot((hx - AR11.cx) / (AR11.plazaRX + 90), (hy - AR11.cy) / (AR11.plazaRY + 90)) < 1) continue;
        if (GATES.some(g => Math.hypot(g.x - hx, g.y - hy) < 260) || ar11Npcs().some(n => Math.hypot(n.x - hx, n.y - hy) < 120) || ar11Wet(hx, hy, 60)) continue;
        if (typeof POND !== 'undefined' && Math.hypot(POND.x - hx, POND.y - hy) < POND.r + 110) continue;
        if (ar11Monument(hx, hy) || out.some(o => Math.hypot(o.x - hx, o.y - hy) < 150)) continue;
        out.push({x:hx, y:hy, v:v++ % 6}); } } }
  return out; }
/* the market lane along the south road */
function ar11Market(){ const rd = ar11Roads().find(x => x.side === 's'); if (!rd) return []; const out = [];
  for (let i = 4; i < rd.pts.length - 4; i += 7){ const [x, y] = rd.pts[i];   /* a stall about every 130 steps down the lane */ for (const sd of [-1, 1]){ const sx = x + sd * 92, sy = y; if (ar11Npcs().some(n => Math.hypot(n.x - sx, n.y - sy) < 90) || ar11Wet(sx, sy, 60)) continue; out.push({x:sx, y:sy, sd, i}); } }
  return out; }
/* ---------- the ground: roads, the ring lane, lanes and yards ---------- */
function ar11Ground(){ const g = terr.getContext('2d'); g.save(); g.setTransform(TS, 0, 0, TS, 0, 0); g.lineCap = 'round'; g.lineJoin = 'round'; const r = ar11Rng(7711);
  const stroke = (pts, w) => { for (const [ww, col] of [[w + 8, 'rgba(120,88,48,.55)'], [w, '#b08a56'], [w - 10, '#c29e68']]){ g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = col; g.lineWidth = ww; g.stroke(); }
    for (let k = 0; k < pts.length * 6; k++){ const [x, y] = pts[Math.floor(r() * pts.length)]; g.fillStyle = r() < .5 ? 'rgba(100,70,40,.35)' : 'rgba(240,215,170,.3)'; g.beginPath(); g.ellipse(x + (r() - .5) * w * .8, y + (r() - .5) * w * .6, .8 + r() * 1.8, .6 + r(), r() * 3, 0, 7); g.fill(); } };
  // the ring lane round the plaza
  // (v312) the owner: «no paths, they look clumsy» — the ring lane, the roads, the lanes and the market strip are no longer painted; the houses still keep clear of the ways

  // yards and the lanes that join each plot to its quarter's road
  const plots = AR11.homes ? ar11Plots() : [];   // (v315) the owner: «remove these houses from the town, all of them» — no homes, no yards
  for (const p of plots){ if (p.q === 'e'){ // a farmhouse stands on its own raised yard of grass at the paddy edge, not on the paddy
      g.fillStyle = '#7f9a4c'; g.beginPath(); g.ellipse(p.x, p.y + 20, p.room * 1.35, p.room * .95, 0, 0, 7); g.fill();
      g.fillStyle = '#8fae58'; g.beginPath(); g.ellipse(p.x, p.y + 16, p.room * 1.28, p.room * .88, 0, 0, 7); g.fill();
      for (let k = 0; k < 160; k++){ const a = r() * 6.283, d = Math.sqrt(r()), x = p.x + Math.cos(a) * d * p.room * 1.25, y = p.y + 16 + Math.sin(a) * d * p.room * .85; g.strokeStyle = r() < .5 ? '#5f8a3e' : '#a6c562'; g.lineWidth = .7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 2, y - 3 - r() * 2); g.stroke(); } }
    g.fillStyle = p.q === 'e' ? 'rgba(186,154,98,.75)' : 'rgba(178,150,96,.5)'; g.beginPath(); g.ellipse(p.x, p.y + 18, p.room * .95, p.room * .55, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,240,200,.18)'; g.beginPath(); g.ellipse(p.x - 8, p.y + 12, p.room * .6, p.room * .3, 0, 0, 7); g.fill(); }

  // the market lane: a wider paved strip

  g.restore(); }
/* ---------- the village: houses, yards, the market ---------- */
function ar11Village(){
  const isTree = t => ['tree', 'palm', 'bush', 'rock', 'bamboo', 'banana', 'hay', 'frangipani'].includes(t);
  const plots = AR11.homes ? ar11Plots() : [], market = ar11Market(), roads = ar11Roads();   // (v315) no homes: the old woods stay where the plots were
  // clear the old woods where the village now stands (and off the roads); the woods along the map's edges stay
  const clear = p => plots.some(q => Math.hypot(q.x - p.x, (q.y - p.y) * 1.2) < q.room + 70) || market.some(m => Math.hypot(m.x - p.x, m.y - p.y) < 80) || roads.some(rd => ar11SegD(p.x, p.y, rd.pts) < 56)
    || Math.hypot((p.x - AR11.cx) / (AR11.plazaRX + 70), (p.y - AR11.cy) / (AR11.plazaRY + 64)) < 1;
  for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!isTree(p.type) || !clear(p)) continue; PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); }
  const put = (t, x, y, v = 0) => { if (!PROP_TYPES[t]) return null; return addProp(t, Math.round(x), Math.round(y), v); };
  for (const p of plots){ const r = ar11Rng(Math.round(p.x * 7 + p.y * 13)), s = r() < .5 ? -1 : 1;
    if (p.kind === 'farm'){ put('arhome', p.x, p.y, [0, 3, 4][Math.floor(r() * 3)]); put('hay', p.x + s * 92, p.y + 20); if (r() < .6) put('hay', p.x + s * 110, p.y - 16); if (r() < .4) put('fruittree', p.x - s * 98, p.y - 30, Math.floor(r() * 3)); }
    else { put('arhome', p.x, p.y, Math.floor(r() * 6)); put(r() < .5 ? 'banana' : 'fruittree', p.x + s * 96, p.y - 30, Math.floor(r() * 3)); put('spirit', p.x - s * 86, p.y + 22); if (r() < .6) put('flowerbed', p.x - s * 6, p.y + 66); }
    for (const dx of [-66, -40, 40, 66]) put('lowfence', p.x + dx, p.y + 82); }   // a low fence along the front of the yard, the gate in the middle
  if (AR11.homes) for (const o of ar11Rows()) put('arrow', o.x, o.y, o.v);   // (v315) the shophouses went with the homes   // a low fence along the front of the yard, the gate in the middle
  // the granary of the hamlet: one sala by the east road
  { const rd = roads.find(x => x.side === 'e'); if (rd){ const [x, y] = rd.pts[10]; if (!ar11Npcs().some(n => Math.hypot(n.x - x, n.y - y + 120) < 90)) put('sala', x, y - 118); } }
  market.forEach((m, k) => { put('arstall', m.x, m.y, k % 6); if (k % 2 === 0) put('lamp', m.x - m.sd * 58, m.y - 24); });
  // every front door stays open: a tree or a jar of the old woods standing in front of one goes
  for (const h of PROPS.filter(p => p.type === 'stilt' || p.type === 'house' || p.type === 'arhome' || p.type === 'arrow')){ const dx = h.x, dy = h.y + 100; if (walkable(dx, dy, 12)) continue;
    for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (p === h || !isTree(p.type) && p.type !== 'jar' && p.type !== 'fruittree' && p.type !== 'lowfence') continue; if (Math.hypot(p.x - dx, p.y - dy) > 80) continue;
      PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); } }
}
/* hooks: the ground is painted with the terrain; the village is placed after the shops and before the minimap is drawn */
{ const _bt = buildTerrain; buildTerrain = function(){ const r = _bt.apply(this, arguments); if (MAP_ID === 0) try { ar11Ground(); } catch (e) { console.warn('aren311 ground', e); } return r; }; }
{ const _rm = repaintMap; repaintMap = function(){ const r = _rm.apply(this, arguments); if (MAP_ID !== 0) return r;
    try { ar11Village(); NAV.grid = null;
      const m = mini.getContext('2d'); m.setTransform(1, 0, 0, 1, 0, 0); m.drawImage(terr, 0, 0, 192, 128);
      for (const p of PROPS){ if (!['tree', 'palm', 'house', 'stilt', 'sala', 'vshop', 'shrine', 'stall', 'arhome', 'arrow', 'arstall'].includes(p.type)) continue; m.fillStyle = ['house', 'stilt', 'sala', 'vshop', 'shrine', 'stall', 'arhome', 'arrow', 'arstall'].includes(p.type) ? '#8f3426' : 'rgba(30,70,40,.8)'; m.beginPath(); m.arc(p.x / W * 192, p.y / H * 128, 1.6, 0, 7); m.fill(); }
    } catch (e) { console.warn('aren311 village', e); }
    return r; }; }
/* townsfolk walk the whole village, not only the plaza */
if (typeof tlPoints === 'function'){ const _tp = tlPoints; tlPoints = function(id){ const pts = _tp.apply(this, arguments); if (id !== 0 || !Array.isArray(pts)) return pts;
    const r = ar11Rng(4242); for (const p of ar11Plots()){ if (pts.length >= 70) break; const x = p.x + (r() - .5) * 40, y = p.y + 100; if (walkable(x, y, 10)) pts.push({x, y, door:true}); }
    for (const m of ar11Market()){ if (pts.length >= 80) break; const x = m.x - m.sd * 40, y = m.y + 30; if (walkable(x, y, 10)) pts.push({x, y, door:true}); }
    return pts; }; }
