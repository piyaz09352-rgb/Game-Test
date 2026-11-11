/* VAYRATHEN — js/ui/worldmap.js
   World map (M): the realm of Vayra as a painted pixel-art archipelago with the capital Aren on the red stupa castle
   in its moat and 30 regions on four roads, each placed where its land is on the picture (desert temples, lava,
   grey peaks, mangrove swamp, jungle, blossom isle, heartland). Visited regions are lit, unvisited ones sit under fog, the current one pulses, every
   region shows its level range. Tap a region for its monsters and boss; warp from the village
   or beside a shrine keeper. */
'use strict';

const WM = {sel:null, zl:0};
function canWarpHere(){ return (MAP_ID === 0 && inVillage(P)) || NPCS.some(n => (n.id === 'warp' || n.id === 'boatman') && dist(n, P) < 180); }
/* a monster's own sprite as a small picture (region panel), cropped and cached */
const MOB_ART = {};
/* (v91) drawn one at a time in idle moments: a window asking for many monsters at once (world map, wiki) gets an
   empty picture first and each one is filled in as it is ready (drawing them all at once froze the game ~0.3 s) */
const MART_NONE = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', MARTQ = {q:[], on:false};
function mobArt(key){
  if (MOB_ART[key] !== undefined) return MOB_ART[key];
  if (!SPR.MOBS[key]) return (MOB_ART[key] = '');
  if (!MARTQ.q.includes(key)) MARTQ.q.push(key);
  if (!MARTQ.on){ MARTQ.on = true; martNext(); }
  return MART_NONE;
}
function martNext(){
  // (v153) while a board full of pictures is open (warp board, world map, wiki) the game hardly ever goes idle, so a
  // picture used to come only every 300 ms; there the pictures are now painted in 12 ms slices between frames
  const busy = () => !!document.querySelector('#warpGrid:not([hidden]), #wmap:not([hidden]), .wk:not([hidden])');
  const go = dl => { const t0 = performance.now(); do { const key = MARTQ.q.shift(); if (!key){ MARTQ.on = false; return; }
      const url = mobArtNow(key);
      for (const e of document.querySelectorAll(`img[data-mart="${key}"]`)) e.src = url || MART_NONE;
    } while (busy() ? performance.now() - t0 < 12 : dl && dl.timeRemaining && dl.timeRemaining() > 8);   // as many as fit in the idle moment
    martNext(); };
  if (busy()) setTimeout(go, 0); else if (typeof requestIdleCallback === 'function') requestIdleCallback(go, {timeout:250}); else setTimeout(go, 30);
}
function mobArtNow(key){
  if (MOB_ART[key] !== undefined) return MOB_ART[key];
  let url = '';
  try { if (SPR.MOBS[key]){ const im = SPR.renderFrame('mob', key, 'idle', 1, 0, Math.min(.85, typeof GFX !== 'undefined' && GFX.k || 1)), c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').putImageData(im, 0, 0);
      const d = im.data; let x0 = im.width, y0 = im.height, x1 = 0, y1 = 0;
      for (let y = 0; y < im.height; y++) for (let x = 0; x < im.width; x++) if (d[(y * im.width + x) * 4 + 3] > 20){ if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 > x0){ const w = x1 - x0 + 1, h = y1 - y0 + 1, o = document.createElement('canvas'); o.width = w; o.height = h; o.getContext('2d').drawImage(c, x0, y0, w, h, 0, 0, w, h); url = o.toDataURL(); } } } catch (e) { url = ''; }
  return (MOB_ART[key] = url);
}
/* ---------- the painted world map ----------
   The realm is a painted pixel-art archipelago (assets/worldmap/worldmap.png). Every region has a spot on that
   picture that fits its land (WM_PIC, fractions 0..1 of the picture; MAPS[].wx/wy are left alone for anything else
   that uses them): Aren on the red stupa castle in its moat on the central island with the bamboo, the lotus paddies
   and the riverside village around it; the fertile road goes on to the walled port, the lighthouse piers, a rocky
   islet and Lake Anodat under the waterfall of the blossom isle. The arid road crosses the desert island of the
   north-west (plains, the Khmer sanctuary, walled Ayodhya, the dunes, the red rocks) and then the black lava island
   of the south-west (lava rivers, the dark temple in Agni's crater, the ashen slopes); the frozen road climbs the
   grey peaks at the top (misty temple hills, the waterfall lake, cave, glacier, Kailash and the stone citadel); the
   dark road runs over the mangrove swamp of the south-east (forest, the cave crag, the stilt temple of Laplae, the
   naga stilt-huts, the cemetery cliffs), then the light road through the north-east jungle (temple, giant tree, the
   peaks of Meru) to the golden temple of Tavatimsa on the pink-blossom isle. Routes between linked regions are dotted paths, unvisited regions sit under
   fog, the current one pulses under a "you are here" pin. The picture covers the whole view (scaled to the larger side of the
   window, opened centred on the player's region), + and - zoom closer, and it pans by dragging (mouse) or swiping (touch). Labels are placed greedily so they never cover each other or a
   marker; one that has no room is hidden until you zoom in (the selected, current and capital labels always show). */
const WM_IMG = 'assets/worldmap/worldmap.png';
const WM_PIC = {0:[.578, .533], 1:[.478, .478], 2:[.522, .589], 3:[.678, .610], 4:[.510, .702], 5:[.702, .758], 6:[.805, .662], 7:[.451, .219],
  8:[.945, .789], 9:[.263, .307], 10:[.327, .167], 11:[.634, .714], 12:[.712, .684], 13:[.203, .231], 14:[.857, .171], 15:[.801, .574],
  16:[.857, .758], 17:[.770, .825], 18:[.809, .327], 19:[.411, .028], 20:[.881, .387], 21:[.060, .239], 22:[.195, .080], 23:[.076, .614],
  24:[.239, .518], 25:[.136, .558], 26:[.482, .136], 27:[.542, .171], 28:[.355, .060], 29:[.423, .108], 30:[.909, .590]};
/* v29: the thirty new regions (data/world3.js), each on land between its road neighbours */
Object.assign(WM_PIC, {31:[0.5, 0.533], 32:[0.6, 0.599], 33:[0.594, 0.656], 34:[0.637, 0.637], 35:[0.768, 0.608], 36:[0.849, 0.574], 37:[0.295, 0.237], 38:[0.265, 0.199], 39:[0.132, 0.235], 40:[0.139, 0.148], 41:[0.13, 0.341], 42:[0.181, 0.566], 43:[0.192, 0.523], 44:[0.148, 0.604], 45:[0.467, 0.177], 46:[0.528, 0.126], 47:[0.464, 0.088], 48:[0.399, 0.072], 49:[0.372, 0.113], 50:[0.423, 0.156], 51:[0.762, 0.71], 52:[0.879, 0.719], 53:[0.901, 0.774], 54:[0.802, 0.78], 55:[0.814, 0.618], 56:[0.811, 0.473], 57:[0.833, 0.249], 58:[0.869, 0.279], 59:[0.887, 0.475], 60:[0.957, 0.59]});
Object.assign(WM_PIC, {64:[0.088, 0.701], 65:[0.096, 0.795], 66:[0.199, 0.789]});   // (v161) three late regions stood in the sea off the south-west coast: moved onto land
MAPS.forEach(m => { if (m.wmPic && !WM_PIC[m.id]) WM_PIC[m.id] = m.wmPic; });   // regions that bring their own spot (data/world4.js)
const wmPic = id => WM_PIC[id] || [MAPS[id].wx, MAPS[id].wy];
const WM_ZOOM = [1, 1.5, 2.2];   // cover the view (the smallest size: never an empty band), then two closer looks
/* every linked pair once, as [a, b] */
function wmLinks(){ const seen = new Set(), out = [];
  MAPS.forEach((m, i) => { for (const d in m.links || {}){ const j = m.links[d], k = Math.min(i, j) + ',' + Math.max(i, j); if (!seen.has(k)){ seen.add(k); out.push([Math.min(i, j), Math.max(i, j)]); } } });
  return out; }
function wmMapHTML(){
  const vis = i => !!(S.visited && S.visited[i]);
  const boats = [];
  const routes = wmLinks().map(([a, b]) => { const sea = typeof SEA_SET !== 'undefined' && SEA_SET.has(a + ',' + b);   // (v281) sea routes between regions: a dashed blue line out over the water, with a boat
    const [x1, y1] = wmPic(a).map(v => v * 1000), [x2, y2] = wmPic(b).map(v => v * 1000), bend = ((a + b) % 2 ? 1 : -1) * (sea ? .3 : .14);
    const mx = (x1 + x2) / 2 + (y2 - y1) * bend, my = (y1 + y2) / 2 - (x2 - x1) * bend, dpath = `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, both = vis(a) && vis(b);
    if (sea){ // (v281) regions on opposite coasts: no line across the island, a boat beside each port pointing the way
      for (const [p, q, to] of [[[x1, y1], [x2, y2], b], [[x2, y2], [x1, y1], a]]){ const dl = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, bx = p[0] + (q[0] - p[0]) / dl * 46, by = p[1] + (q[1] - p[1]) / dl * 46;
        boats.push(`<span class="wmboat${both ? ' lit' : ''}" style="left:${(bx / 10).toFixed(2)}%;top:${(by / 10).toFixed(2)}%" title="${L('เรือไป', 'Ship to')} ${nm(MAPS[to])} · Lv ${MAPS[to].lv[0]}–${MAPS[to].lv[1]}">⛵</span>`); }
      return ''; }
    return `<path class="wmr-u" d="${dpath}"/><path class="wmr ${both ? 'lit' : ''}" data-wmr="${a}-${b}" d="${dpath}"/>`; }).join('');
  const fog = MAPS.map((m, i) => { if (vis(i)) return ''; const [x, y] = wmPic(i); return `<circle class="wmfog" cx="${(x * 1000).toFixed(1)}" cy="${(y * 1000).toFixed(1)}" r="46"/>`; }).join('');
  const marks = MAPS.map((m, i) => { const [x, y] = wmPic(i), seen = vis(i), cap = i === 0, here = i === MAP_ID, sel = i === WM.sel, col = (LANDS[m.land] || LANDS.fertile)[2];
    const cls = `wmk${seen ? ' seen' : ' unk'}${cap ? ' cap' : ''}${here ? ' here' : ''}${sel ? ' sel' : ''}`, nmx = nm(m);
    return `<button class="${cls}" data-wmsel="${i}" style="left:${(x * 100).toFixed(2)}%;top:${(y * 100).toFixed(2)}%;--lc:${col}" title="${nmx} · Lv ${m.lv[0]}–${m.lv[1]}" aria-label="${nmx}"><i>${cap ? '♛' : seen ? '' : '?'}</i></button>`; }).join('');
  const labels = MAPS.map((m, i) => { const seen = vis(i), cap = i === 0, here = i === MAP_ID, sel = i === WM.sel;
    return `<span class="wml${seen ? ' seen' : ' unk'}${cap ? ' cap' : ''}${here ? ' here' : ''}${sel ? ' sel' : ''}" data-wml="${i}" data-wmsel="${i}"><b>${nm(m)}</b><small>${m.lv[0]}–${m.lv[1]}</small></span>`; }).join('');
  const [hx, hy] = wmPic(MAP_ID);
  return `<div class="wmview" id="wmView"><div class="wmpic" id="wmPic">
      <img class="wmimg" src="${WM_IMG}" alt="${L('แผนที่โลก', 'World map')}" draggable="false">
      <svg class="wmsvg" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><defs><radialGradient id="wmFogG"><stop offset="0" stop-color="#e8ecf4" stop-opacity=".78"/><stop offset=".55" stop-color="#dfe4ee" stop-opacity=".5"/><stop offset="1" stop-color="#dfe4ee" stop-opacity="0"/></radialGradient></defs>
        <g class="wmfogs">${fog}</g><g class="wmroutes">${routes}</g></svg>
      ${boats.join('')}${marks}${labels}
      <div class="wmhere" style="left:${(hx * 100).toFixed(2)}%;top:${(hy * 100).toFixed(2)}%"><span>${L('คุณอยู่ที่นี่', 'You are here')}</span></div>
    </div></div>
    <div class="wmzoom"><button class="ibtn" data-wmz="1" aria-label="${L('ขยาย', 'Zoom in')}">+</button><button class="ibtn" data-wmz="-1" aria-label="${L('ย่อ', 'Zoom out')}">−</button></div>`;
}
function renderWorld(){
  const pane = document.getElementById('pane-world'); if (!pane) return;
  if (WM.sel == null) WM.sel = MAP_ID;
  const oldV = document.getElementById('wmView'), keep = WM.keep && oldV ? {sl:oldV.scrollLeft, st:oldV.scrollTop, pt:pane.scrollTop} : null; WM.keep = false;
  const mp = MAPS[WM.sel], seen = S.visited && S.visited[mp.id], bd = MOB[mp.boss], fee = warpFee(mp.id), ok = canWarpHere(), here = mp.id === MAP_ID;
  const land = LANDS[mp.land], gc = (WM_GROUND[mp.land] || WM_GROUND.fertile);
  const visitedN = Object.keys(S.visited || {}).length, diff = S.lvl < mp.lv[0] - 5 ? ['hard', L('อันตราย', 'Dangerous')] : S.lvl > mp.lv[1] + 5 ? ['easy', L('ง่าย', 'Easy')] : ['fit', L('เหมาะกับคุณ', 'Right for you')];
  const chip = (k, t) => `<span class="wchip ${k}">${t}</span>`;
  const sk = (bd.bossSkills || []).map(k => chip('sk', L(...BOSS_SKILL_TH[k]))).join('');
  const mobTile = t => { const m = MOB[t], a = seen ? mobArt(t) : '';
    return `<div class="wmob el-${m.elem || 'neutral'}${seen ? '' : ' unk'}" title="${seen ? nm(m) : '?'}"><span class="pic">${a ? `<img data-mart="${t}" src="${a}" alt="">` : '<b>?</b>'}</span><span class="nmx"><b>${seen ? nm(m) : '???'}</b><small>Lv ${m.lvl}${m.night ? ' · ' + L('กลางคืน', 'night') : ''}</small></span></div>`; };
  const warpLbl = here ? L('อยู่ที่นี่แล้ว', 'Already here') : !seen ? L('ยังไม่ปลดล็อก', 'Locked') : !ok ? L('วาร์ปได้ที่หมู่บ้านหรือข้างผู้เฝ้าศาล', 'Warp from the village or beside a shrine keeper') : `${L('วาร์ป', 'Warp')} · ${fee ? fee.toLocaleString() + ' ' + CUR() : L('ฟรี', 'Free')}`;
  pane.innerHTML = `<div class="wmlay">
    <div class="wmmap">${wmMapHTML()}
      <div class="wmprog"><span>${L('สำรวจแล้ว', 'Explored')} <b>${visitedN}/${MAPS.length}</b></span><i style="--p:${visitedN / MAPS.length * 100}%"></i></div></div>
    <aside class="wminfo" style="--g1:${gc[0]};--g2:${gc[1]};--lc:${land[2]}">
      <div class="wmban"><div class="wmbanbg"></div>
        <small>${L(land[0], land[1])}</small><b>${nm(mp)}</b>
        <div class="wchips">${chip('lv', `Lv ${mp.lv[0]}–${mp.lv[1]}`)}${chip(diff[0], diff[1])}${here ? chip('here', '◉ ' + L('คุณอยู่ที่นี่', 'You are here')) : ''}${!seen ? chip('lock', '🔒 ' + L('ยังไม่เคยไป', 'Unexplored')) : ''}</div></div>
      <p class="wmdesc">${L(...mp.desc)}</p>
      <div class="wmsec"><span>♛ ${L('บอสประจำแคว้น', 'Region boss')}</span></div>
      <div class="wmbossc el-${bd.elem || 'neutral'}"><span class="pic">${seen && mobArt(mp.boss) ? `<img data-mart="${mp.boss}" src="${mobArt(mp.boss)}" alt="">` : '<b>?</b>'}</span>
        <div class="bi"><b>${seen ? nm(bd) : '???'}</b><small>Lv ${bd.lvl} · ${elemName(bd.elem)} · HP ${bd.hp.toLocaleString()}</small><div class="sks">${seen ? sk : ''}</div></div></div>
      <div class="wmsec"><span>${L('มอนสเตอร์ในแคว้น', 'Monsters here')}</span><small>${mp.mobs.length}</small></div>
      <div class="wmmobs">${mp.mobs.map(mobTile).join('')}</div>
      ${seen ? '' : `<p class="wmhint">${L('เดินผ่านประตูขอบแผนที่จากแคว้นข้างเคียงเพื่อปลดล็อก', 'Walk through an edge gate from a neighbouring region to unlock it')}</p>`}
      <button class="btn gold wide wmwarp" data-warp="${mp.id}" ${seen && ok && !here && S.bia >= fee ? '' : 'disabled'}>${warpLbl}</button>
    </aside></div>`;
  wmLayout(keep); requestAnimationFrame(() => wmLayout(keep));   // again once the window is shown (openWin renders before it un-hides)
  const img = pane.querySelector('.wmimg'); if (img && !img.complete) img.addEventListener('load', () => wmLayout(null, true), {once:true});
}
/* size the picture (fit the window, then zoom), place the labels, and keep or centre the view */
function wmLayout(keep, soft){
  const pane = document.getElementById('pane-world'), v = document.getElementById('wmView'), pic = document.getElementById('wmPic'); if (!pane || !v || !pic || !v.clientWidth) return;
  const avail = pane.clientHeight - 40;   // the view is as tall as its window allows (never taller than wide: the region panel scrolls below or sits beside it)
  const side = Math.max(200, Math.min(v.clientWidth, avail)); v.style.height = side + 'px';
  // "cover": the picture fills the whole view (no empty sea bands); the rest of it is reached by dragging or swiping, + and - zoom in from there
  const old = pic.offsetWidth || 0, cover = Math.max(v.clientWidth, v.clientHeight), S0 = Math.ceil(cover * WM_ZOOM[WM.zl || 0]);
  const cx = old ? (v.scrollLeft + v.clientWidth / 2) / old : null, cy = old ? (v.scrollTop + v.clientHeight / 2) / old : null;
  pic.style.width = pic.style.height = S0 + 'px';
  wmPlaceLabels(pic, S0);
  if (keep){ v.scrollLeft = keep.sl; v.scrollTop = keep.st; pane.scrollTop = keep.pt; }
  else if (soft && cx != null){ v.scrollLeft = cx * S0 - v.clientWidth / 2; v.scrollTop = cy * S0 - v.clientHeight / 2; }
  else { const [x, y] = wmPic(MAP_ID); v.scrollLeft = x * S0 - v.clientWidth / 2; v.scrollTop = y * S0 - v.clientHeight / 2; }
}
function wmPlaceLabels(pic, S0){
  const boxes = [], mk = {};
  pic.querySelectorAll('.wmk').forEach(b => { const i = +b.dataset.wmsel, [x, y] = wmPic(i), r = (b.offsetWidth || 18) / 2 + 2; mk[i] = [x * S0, y * S0, r]; boxes.push({l:x * S0 - r, t:y * S0 - r, r:x * S0 + r, b:y * S0 + r}); });
  const pin = pic.querySelector('.wmhere span'); if (pin && mk[MAP_ID]){ const [x, y, r] = mk[MAP_ID], up = r + 4, w = pin.offsetWidth + 4, h = pin.offsetHeight + 2;   // the pin floats just above the current marker
    pin.style.bottom = up + 'px'; boxes.push({l:x - w / 2, t:y - up - h, r:x + w / 2, b:y - up}); }
  const hit = q => boxes.some(o => q.l < o.r && q.r > o.l && q.t < o.b && q.b > o.t);
  const els = [...pic.querySelectorAll('.wml')]; els.forEach(e => e.classList.remove('off'));
  const pri = e => { const i = +e.dataset.wml; return (i === WM.sel) * 8 + (i === MAP_ID) * 4 + (i === 0) * 2 + (S.visited && S.visited[i] ? 1 : 0); };
  els.sort((a, b) => pri(b) - pri(a));
  for (const e of els){ const i = +e.dataset.wml, [x, y, mr] = mk[i], w = e.offsetWidth, h = e.offsetHeight, g = mr + 2, must = pri(e) >= 2;
    const cand = [[x - w / 2, y + g], [x - w / 2, y - g - h], [x + g, y - h / 2], [x - g - w, y - h / 2], [x + g - 4, y + g - 6], [x - w - g + 4, y + g - 6], [x + g - 4, y - g - h + 6], [x - w - g + 4, y - g - h + 6], [x - w / 2, y + g + h + 2], [x - w / 2, y - g - 2 * h - 2]];
    let pick = null;
    for (const [cx, cy] of cand){ const lx = clamp(cx, 2, S0 - w - 2), ly = clamp(cy, 2, S0 - h - 2), q = {l:lx, t:ly, r:lx + w, b:ly + h}; if (!hit(q)){ pick = q; break; } }
    if (!pick && must){ const lx = clamp(cand[0][0], 2, S0 - w - 2), ly = clamp(cand[0][1], 2, S0 - h - 2); pick = {l:lx, t:ly, r:lx + w, b:ly + h}; }
    e.classList.toggle('off', !pick); if (!pick) continue;
    boxes.push(pick); e.style.left = pick.l + 'px'; e.style.top = pick.t + 'px'; }
}
document.addEventListener('click', e => {
  const z = e.target.closest && e.target.closest('[data-wmz]');
  if (z){ WM.zl = clamp((WM.zl || 0) + +z.dataset.wmz, 0, WM_ZOOM.length - 1); wmLayout(null, true); return; }
  const b = e.target.closest && e.target.closest('[data-wmsel]'); if (!b || !b.closest('#wmPic')) return;
  if (WM.dragged){ WM.dragged = false; return; }
  WM.sel = +b.dataset.wmsel; WM.keep = true; renderWorld();
});
/* drag to pan with a mouse (touch already scrolls the view natively) */
document.addEventListener('pointerdown', e => {
  const v = e.target.closest && e.target.closest('#wmView'); if (!v || e.pointerType !== 'mouse' || e.button) return;
  WM.drag = {v, x:ptX(e), y:ptY(e), sl:v.scrollLeft, st:v.scrollTop}; WM.dragged = false;
});
document.addEventListener('pointermove', e => { const d = WM.drag; if (!d) return; const dx = (ptX(e) - d.x) / UIZ, dy = (ptY(e) - d.y) / UIZ;
  if (Math.abs(dx) + Math.abs(dy) > 5){ WM.dragged = true; d.v.classList.add('drag'); } if (WM.dragged){ d.v.scrollLeft = d.sl - dx; d.v.scrollTop = d.st - dy; } });
document.addEventListener('pointerup', () => { if (WM.drag){ WM.drag.v.classList.remove('drag'); WM.drag = null; setTimeout(() => { WM.dragged = false; }, 0); } });
/* (v124) phones: pinch with two fingers to zoom, double-tap to zoom in (the markers spread apart, so each is easy to
   tap); a mouse wheel zooms on a computer. One zoom step at a time, on the same levels as the + and − buttons. */
const wmZoomBy = (d, gesture) => { const now = performance.now(); if (gesture && now - (WM.zoomT || 0) < 350) return; WM.zoomT = now;   // one step per gesture
  const z = clamp((WM.zl || 0) + d, 0, WM_ZOOM.length - 1); if (z === (WM.zl || 0)) return; WM.zl = z; wmLayout(null, true); };
document.addEventListener('touchstart', e => { const v = e.target.closest && e.target.closest('#wmView'); if (!v) return;
  if (e.touches.length === 2){ const [a, b] = e.touches; WM.pinch = {d:Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)}; return; }
  if (e.touches.length === 1){ const now = performance.now(), t = e.touches[0];
    if (WM.tap && now - WM.tap.t < 450 && Math.hypot(t.clientX - WM.tap.x, t.clientY - WM.tap.y) < 30){ WM.tap = null; wmZoomBy(1, true); e.preventDefault(); return; }
    WM.tap = {t:now, x:t.clientX, y:t.clientY}; } }, {passive:false});
document.addEventListener('touchmove', e => { const p = WM.pinch; if (!p || e.touches.length !== 2) return; const [a, b] = e.touches, d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  if (d / p.d > 1.3){ wmZoomBy(1, true); p.d = d; } else if (d / p.d < .77){ wmZoomBy(-1, true); p.d = d; } e.preventDefault(); }, {passive:false});
document.addEventListener('touchend', e => { if (e.touches.length < 2) WM.pinch = null; }, {passive:true});
document.addEventListener('wheel', e => { const v = e.target.closest && e.target.closest('#wmView'); if (!v || !e.ctrlKey && Math.abs(e.deltaY) < 30) return;
  const now = performance.now(); if (now - (WM.wheelT || 0) < 180) { e.preventDefault(); return; } WM.wheelT = now; wmZoomBy(e.deltaY < 0 ? 1 : -1); e.preventDefault(); }, {passive:false});
window.addEventListener('resize', () => { if (document.getElementById('wmView') && typeof winOpen === 'function' && winOpen('world')) setTimeout(() => wmLayout(null, true), 80); });
/* the land colours of the region panel */
const WM_GROUND = {capital:['#e8cf8a', '#c9a45a'], fertile:['#7cc46a', '#4e9a48'], arid:['#e2c27a', '#c79a4e'], volcanic:['#8a4a3a', '#5e2a22'],
  frozen:['#e4f2fa', '#a8cce4'], dark:['#5a4a6e', '#3a2c4c'], light:['#fff1c0', '#ead08a']};

/* ---------- quest log (J): the story chapters, shards and bounties ---------- */
function renderQuestLog(){
  const pane = document.getElementById('pane-quest'); if (!pane) return;
  const q = qState(), act = QUESTS.find(x => x.id === q.active);
  pane.innerHTML = `<div class="qhead"><b>${L('ผนึกวายรา', 'The Seal of Vayra')}</b><span>${L('ศิลาผนึก', 'Seal shards')} ${S.shards || 0}/${QUESTS.length}</span></div>
    <div class="shards">${QUESTS.map((Q, i) => `<i class="${q.done[Q.id] ? 'got' : Q.id === q.active ? 'cur' : ''}" title="${nm(MAPS[Q.map])}"></i>`).join('')}</div>
    ${act ? `<div class="sec">${L('กำลังทำ', 'In progress')}</div><div class="qbox"><b>${L(act.title[0], act.title[1])}</b><p class="hint">${L(...act.story)}</p>${act.goals.map(g => { const v = goalNow(g); return `<div class="qg${v >= g.n ? ' ok' : ''}"><span>${g.k === 'boss' ? '♛ ' : ''}${g.k === 'item' ? nm(ITEMS[g.t]) : nm(MOB[g.t])}</span><b>${v}/${g.n}</b></div>`; }).join('')}</div>` : ''}
    <div class="sec">${L('บทต่าง ๆ', 'Chapters')}</div>
    <div class="list">${QUESTS.map((Q, i) => { const st = q.done[Q.id] ? 'done' : Q.id === q.active ? 'cur' : i === q.main ? 'next' : 'lock';
      return `<div class="item qrow ${st}"><span class="rk">${i}</span><div class="nm"><b>${L(Q.title[0], Q.title[1])}</b><small>${st === 'done' ? L('สำเร็จแล้ว', 'Complete') : st === 'cur' ? L('กำลังทำ', 'In progress') : st === 'next' ? L(`รับได้ที่${i === 0 ? 'ครูวายรา' : 'ผู้เฝ้าศาล ' + MAPS[Q.map].name} · Lv ${Q.lv}+`, `Take it from ${i === 0 ? 'Master Vayra' : 'the shrine keeper of ' + MAPS[Q.map].en} · Lv ${Q.lv}+`) : L('ยังไม่ปลดล็อก', 'Locked')}</small></div></div>`; }).join('')}</div>
    ${q.main >= QUESTS.length ? `<p class="hint">${L(...ENDING)}</p>` : ''}`;
}

{ const st = document.createElement('style'); st.textContent = `
.wms-u,.wms{fill:none;stroke-linecap:round;vector-effect:non-scaling-stroke}
.wms-u{stroke:rgba(10,40,80,.45);stroke-width:5}
.wms{stroke:#8fd4ff;stroke-width:2.4;stroke-dasharray:7 6}
.wms.lit{stroke:#d8f2ff}
.wmboat{position:absolute;transform:translate(-50%,-60%);font-size:clamp(13px,2.2vmin,20px);line-height:1;pointer-events:auto;filter:drop-shadow(0 1px 1px rgba(0,0,0,.55));z-index:2}
.wmboat:not(.lit){opacity:.75}`; document.head.appendChild(st); }
