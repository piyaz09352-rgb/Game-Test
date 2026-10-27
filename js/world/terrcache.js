/* VAYRATHEN — js/world/terrcache.js — (v134) coming back to a map is quick: its painted ground is kept
   Changing map took 200–280 ms on a phone, nearly all of it painting the whole ground (up to 16 million pixels:
   gradients, noise, roads, tens of thousands of grass blades, flowers, ponds). The ground of a map never changes —
   it comes from the map's own seed — so once painted it is also kept (a GPU copy, made in the background; no
   compression, which on a phone blocked the game for longer than the paint itself) for the last map — enough for
   going back and forth between town and field (v135: one map, low/medium picture only). The next time:
   · the map's layout (trees, rocks, water, walls) is still built by the same code with the same seed — but it draws
     into a silent stand-in, so nothing is painted and it takes a few milliseconds;
   · the kept picture is laid down in one go, under the scene-change fade.
   A map painted at another picture setting is painted afresh. Memory: one map's ground is ~30 MB at the low setting.
   Anything unexpected → it simply paints as before. */
'use strict';

const TC_VER = 'g1', TC = {mem:new Map(), on:true};
const tcKey = id => `${TC_VER}|${id}|${terr.width}x${terr.height}`;
/* a drawing context that draws nothing (gradients and patterns are stand-ins too) */
const TC_NOOP = (() => { const store = {}, stub = {addColorStop(){}}, noop = () => {};
  const fixed = {createLinearGradient:() => stub, createRadialGradient:() => stub, createConicGradient:() => stub, createPattern:() => stub,
    measureText:() => ({width:0}), isPointInPath:() => false, isPointInStroke:() => false, getTransform:() => new DOMMatrix(),
    getImageData:(x, y, w, h) => new ImageData(Math.max(1, w | 0), Math.max(1, h | 0)), canvas:null};
  return new Proxy(store, {get:(o, k) => (k in fixed ? fixed[k] : k in o ? o[k] : noop), set:(o, k, v) => { o[k] = v; return true; }}); })();
function tcClear(){ for (const b of TC.mem.values()) if (b && b.close) b.close(); TC.mem.clear(); }
/* if the browser ever drops a canvas (graphics memory ran short), forget what was kept and paint the map again */
for (const c of [typeof cv !== 'undefined' ? cv : null, terr]) if (c && c.addEventListener){
  c.addEventListener('contextlost', () => { tcClear(); });
  c.addEventListener('contextrestored', () => { tcClear(); try { repaintMap(); } catch (e) {} }); }
function tcPut(key, bmp){ const old = TC.mem.get(key); if (old && old.close && old !== bmp) old.close(); TC.mem.delete(key); TC.mem.set(key, bmp);
  while (TC.mem.size > 1){ const k = TC.mem.keys().next().value, b = TC.mem.get(k); TC.mem.delete(k); if (b && b.close) b.close(); } }
function tcMini(){ const m = mini.getContext('2d'); m.setTransform(1, 0, 0, 1, 0, 0); m.drawImage(terr, 0, 0, 192, 128);
  for (const p of PROPS){ if (!['tree', 'palm', 'bamboo', 'house', 'shrine', 'pine', 'stupa', 'prang', 'himtree', 'sala', 'stilt', 'stalag'].includes(p.type)) continue;
    m.fillStyle = ['house', 'shrine', 'stupa', 'prang', 'sala', 'stilt'].includes(p.type) ? '#8f3426' : 'rgba(30,70,40,.8)'; m.beginPath(); m.arc(p.x / W * 192, p.y / H * 128, 1.6, 0, 7); m.fill(); } }

{ const _rp = repaintMap;
  repaintMap = function(){
    const id = MAP_ID;
    // the canvas size depends on the map and the picture setting: set it as repaintMap would, to name the picture
    const ts = Math.min(GFX.ts, Math.sqrt((GFX.terrPx || 16e6) / (W * H))), tw = Math.round(W * ts), th = Math.round(H * ts);
    if (terr.width !== tw){ terr.width = tw; terr.height = th; }
    // (v135) only at the low and medium picture, and only for grounds up to 9 million pixels: on a PC at high/ultra a
    // kept ground is up to 64 MB of graphics memory, and two of them on top of everything else made some graphics
    // cards drop the game's canvases (the screen went blank)
    TC.on = (GFX.preset === 'low' || GFX.preset === 'medium') && tw * th <= 9e6;
    if (!TC.on && TC.mem.size) tcClear();
    const key = tcKey(id), have = TC.on && TC.mem.has(key);
    if (!have){ const r = _rp.apply(this, arguments);
      if (TC.on && typeof createImageBitmap === 'function') createImageBitmap(terr).then(b => { if (MAP_ID === id) tcPut(key, b); else if (b.close) b.close(); }).catch(() => {});
      return r; }
    // a saved ground: build the layout without painting, then lay the picture down when it is unpacked
    const real = terr.getContext.bind(terr); let r;
    terr.getContext = () => TC_NOOP;
    try { r = _rp.apply(this, arguments); } catch (e) { delete terr.getContext; TC.mem.delete(key); return _rp.apply(this, arguments); }
    delete terr.getContext;
    const g = real('2d'); g.setTransform(1, 0, 0, 1, 0, 0); const B = BIOME[(MAPS[id] || {}).biome] || {}; g.fillStyle = (B.base && B.base[0]) || '#5a8a4a'; g.fillRect(0, 0, terr.width, terr.height);
    const bmp = TC.mem.get(key); g.drawImage(bmp, 0, 0, terr.width, terr.height); tcMini();
    TC.mem.delete(key); TC.mem.set(key, bmp);   // most recently used
    return r;
  }; }
