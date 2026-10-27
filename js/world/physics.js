/* VAYRATHEN — js/world/physics.js */
'use strict';

function pushOut(e, r){
  for (const o of obstacles){
    const dx = e.x - o.x, dy = e.y - o.y, m = o.r + r;
    if (dx >= m || dx <= -m || dy >= m || dy <= -m) continue;   // (v83) cheap reject: most obstacles are far away
    const d = Math.hypot(dx, dy);
    if (d < m && d > 0.01){ e.x = o.x + dx / d * m; e.y = o.y + dy / d * m; }
  }
  e.x = clamp(e.x, 20, W - 20); e.y = clamp(e.y, 30, H - 20);
}
function moveTo(e, x, y, spd, dt){
  const dx = x - e.x, dy = y - e.y, d = Math.hypot(dx, dy);
  if (d < 2) return true;
  const s = Math.min(d, spd * dt);
  e.x += dx / d * s; e.y += dy / d * s;
  if (Math.abs(dx) > 1) e.face = dx < 0 ? -1 : 1;
  e.dir = SPR.dirFromVec(dx, dy); e.moved = true;
  return false;
}
function randIn(z, r){
  for (let i = 0; i < 30; i++){
    const p = {x:rand(z.x0, z.x1), y:rand(z.y0, z.y1)};
    if (!obstacles.some(o => Math.hypot(o.x - p.x, o.y - p.y) < o.r + r + 6)) return p;
  }
  return {x:(z.x0 + z.x1) / 2, y:(z.y0 + z.y1) / 2};
}

/* ---------- navigation: walk around props, huts, the pond ----------
   A coarse grid (16 world units per cell) marks cells blocked by obstacles. Movement goes straight
   when the line is clear, otherwise follows an A* path; a stuck timer forces a new path or gives up. */
const NAV = {c:16, cols:Math.ceil(W / 16), rows:Math.ceil(H / 16), grid:null, n:-1, R:13};
function navBuild(){
  const {c, cols, rows, R} = NAV, gr = new Uint8Array(cols * rows);
  for (const o of obstacles){
    const m = o.r + R, x0 = Math.max(0, Math.floor((o.x - m) / c)), x1 = Math.min(cols - 1, Math.floor((o.x + m) / c));
    const y0 = Math.max(0, Math.floor((o.y - m) / c)), y1 = Math.min(rows - 1, Math.floor((o.y + m) / c));
    for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++)
      if (Math.hypot((gx + .5) * c - o.x, (gy + .5) * c - o.y) < m) gr[gy * cols + gx] = 1;
  }
  for (let gx = 0; gx < cols; gx++){ gr[gx] = gr[cols + gx] = 1; gr[(rows - 1) * cols + gx] = 1; }
  for (let gy = 0; gy < rows; gy++){ gr[gy * cols] = gr[gy * cols + cols - 1] = 1; }
  NAV.grid = gr; NAV.n = obstacles.length;
}
function navGrid(){ if (!NAV.grid || NAV.n !== obstacles.length) navBuild(); return NAV.grid; }
const navCell = (x, y) => [clamp(Math.floor(x / NAV.c), 0, NAV.cols - 1), clamp(Math.floor(y / NAV.c), 0, NAV.rows - 1)];
function walkable(x, y, r = 12){
  if (x < 20 || x > W - 20 || y < 30 || y > H - 20) return false;
  return !obstacles.some(o => Math.hypot(o.x - x, o.y - y) < o.r + r);
}
/* is the straight segment a→b free of obstacles (with body radius r)? */
function lineClear(ax, ay, bx, by, r = 12){
  const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1;
  for (const o of obstacles){
    const t = clamp(((o.x - ax) * dx + (o.y - ay) * dy) / L2, 0, 1);
    if (Math.hypot(ax + dx * t - o.x, ay + dy * t - o.y) < o.r + r - 1) return false;
  }
  return true;
}
/* nearest free cell to (x,y) — used when the goal sits inside an obstacle */
function navFree(gx, gy){
  const gr = navGrid(), {cols, rows} = NAV;
  if (!gr[gy * cols + gx]) return [gx, gy];
  for (let r = 1; r < 30; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++){
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const x = gx + dx, y = gy + dy;
    if (x > 0 && y > 0 && x < cols - 1 && y < rows - 1 && !gr[y * cols + x]) return [x, y];
  }
  return null;
}
function findPath(sx, sy, tx, ty){
  const gr = navGrid(), {c, cols} = NAV;
  const s = navFree(...navCell(sx, sy)), t = navFree(...navCell(tx, ty));
  if (!s || !t) return null;
  const si = s[1] * cols + s[0], ti = t[1] * cols + t[0];
  if (si === ti) return [{x:tx, y:ty}];
  const N = gr.length, gS = new Float32Array(N).fill(1e9), from = new Int32Array(N).fill(-1), shut = new Uint8Array(N);
  const heap = [], push = (i, f) => { heap.push([f, i]); let k = heap.length - 1; while (k){ const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length){ heap[0] = last; let k = 0; for (;;){ const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top[1]; };
  const h = i => { const dx = Math.abs(i % cols - t[0]), dy = Math.abs((i / cols | 0) - t[1]); return Math.max(dx, dy) + .414 * Math.min(dx, dy); };
  gS[si] = 0; push(si, h(si));
  let found = false, iter = 0;
  while (heap.length && iter++ < 16000){
    const i = pop(); if (shut[i]) continue; shut[i] = 1;
    if (i === ti){ found = true; break; }
    const x = i % cols, y = i / cols | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
      if (!dx && !dy) continue;
      const j = (y + dy) * cols + x + dx;
      if (gr[j] || shut[j]) continue;
      if (dx && dy && (gr[y * cols + x + dx] || gr[(y + dy) * cols + x])) continue;   // no corner cutting
      const g2 = gS[i] + (dx && dy ? 1.414 : 1);
      if (g2 < gS[j]){ gS[j] = g2; from[j] = i; push(j, g2 + h(j)); }
    }
  }
  if (!found) return null;
  const cells = []; for (let i = ti; i !== -1 && i !== si; i = from[i]) cells.push(i);
  cells.reverse();
  const pts = cells.map(i => ({x:(i % cols + .5) * c, y:((i / cols | 0) + .5) * c}));
  if (gr[navCell(tx, ty)[1] * cols + navCell(tx, ty)[0]] === 0) pts[pts.length - 1] = {x:tx, y:ty};
  // string-pull: drop waypoints that can be skipped with a clear straight line
  const out = []; let ax = sx, ay = sy, k = 0;
  while (k < pts.length){
    let far = k; while (far + 1 < pts.length && lineClear(ax, ay, pts[far + 1].x, pts[far + 1].y)) far++;
    out.push(pts[far]); ax = pts[far].x; ay = pts[far].y; k = far + 1;
  }
  return out;
}
/* move e toward (x,y) around obstacles. Returns true on arrival; e.navFail is set when no way exists. */
function navTo(e, x, y, spd, dt, stop = 2){
  const nv = e.nav || (e.nav = {gx:null, gy:null, path:null, rep:0, sx:e.x, sy:e.y, st:0});
  if (Math.hypot(x - e.x, y - e.y) <= stop){ nv.path = null; nv.gx = null; return true; }
  nv.rep -= dt;
  const goalMoved = nv.gx == null || Math.hypot(nv.gx - x, nv.gy - y) > 24;
  if (lineClear(e.x, e.y, x, y)){ nv.path = null; nv.gx = x; nv.gy = y; e.navFail = false; }
  else if (!nv.path || (goalMoved && nv.rep <= 0)){
    nv.path = findPath(e.x, e.y, x, y); nv.gx = x; nv.gy = y; nv.rep = .4;
    e.navFail = !nv.path; if (!nv.path) return false;
  }
  let wx = x, wy = y;
  if (nv.path){
    while (nv.path.length > 1 && Math.hypot(nv.path[0].x - e.x, nv.path[0].y - e.y) < 6) nv.path.shift();
    wx = nv.path[0].x; wy = nv.path[0].y;
    if (nv.path.length === 1){ wx = x; wy = y; }
  }
  moveTo(e, wx, wy, spd, dt);
  // stuck: barely moved for 0.7 s → plan again; after a few tries the caller gets navFail
  nv.st += dt;
  if (nv.st > .7){
    if (Math.hypot(e.x - nv.sx, e.y - nv.sy) < spd * .7 * .2){ nv.path = findPath(e.x, e.y, x, y); nv.rep = .4; nv.stuck = (nv.stuck || 0) + 1; if (!nv.path || nv.stuck > 3){ e.navFail = true; nv.stuck = 0; } }
    else nv.stuck = 0;
    nv.st = 0; nv.sx = e.x; nv.sy = e.y;
  }
  return false;
}
