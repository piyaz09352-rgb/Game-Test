/* VAYRATHEN — js/world/bldimg260.js — (v260) the owner's own pictures for buildings
   The owner: "why draw it after my picture — just put my picture in". Any building whose picture is in
   assets/buildings/ is drawn from that file instead of the painted one:
     apothecary.png → ร้านยา · smithy.png → โรงตีเหล็ก · smelter.png → โรงหลอมแร่ · driller.png → ร้านเจาะมณี ·
     herbal.png → สมุนไพร · cook.png → โรงครัว · tailor.png → ร้านตัดชุด · bank.png → คลังเบี้ย · registrar.png → ทะเบียน ·
     festival.png → เทศกาล · trader.png → รับซื้อของ · beast.png → เลี้ยงสัตว์ · tower.png → อนุสรณ์หอคอย 100 ชั้น
   A white (or near-white) background round the picture is cut away by itself, so a picture with a plain white
   background works as well as a transparent PNG. A missing file just leaves the painted building. */
'use strict';
const BIMG = {files:{shop:'apothecary', smith:'smithy', forger:'smelter', driller:'driller', herbal:'herbal', cook:'cook', tailor:'tailor', banker:'bank', registrar:'registrar',
  festival:'festival', trader:'trader', beast:'beast', twmonument:'tower'}, ready:{}};
/* cut the white background away: flood from the picture's edges through near-white pixels */
function bimgCut(img){
  const w = img.naturalWidth, h = img.naturalHeight, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  let d; try { d = g.getImageData(0, 0, w, h); } catch (e) { return c; }
  const px = d.data, seen = new Uint8Array(w * h), white = i => px[i * 4 + 3] > 0 && px[i * 4] > 232 && px[i * 4 + 1] > 232 && px[i * 4 + 2] > 232, st = [];
  if (px[3] < 10 && px[(w * h - 1) * 4 + 3] < 10) return c;   // already transparent
  for (let x = 0; x < w; x++){ st.push(x, (h - 1) * w + x); } for (let y = 0; y < h; y++){ st.push(y * w, y * w + w - 1); }
  while (st.length){ const i = st.pop(); if (seen[i] || !white(i)) continue; seen[i] = 1; px[i * 4 + 3] = 0; const x = i % w, y = (i / w) | 0;
    if (x > 0) st.push(i - 1); if (x < w - 1) st.push(i + 1); if (y > 0) st.push(i - w); if (y < h - 1) st.push(i + w); }
  g.putImageData(d, 0, 0); return c;
}
function bimgLoad(key){
  const im = new Image(); im.onload = () => { try { BIMG.ready[key] = bimgCut(im); for (const k in propCache) if (/^(vshop|twmonument)/.test(k)) delete propCache[k]; } catch (e) {} };
  im.onerror = () => {}; im.src = `assets/buildings/${BIMG.files[key]}.png?v=${typeof GAMEV !== 'undefined' && GAMEV ? GAMEV : 260}`;
}
if (location.protocol !== 'file:') for (const k in BIMG.files) bimgLoad(k);
/* draw a picture in a prop's box: feet on the ground line, as large as the box allows */
function bimgProp(pic, seed, box){ return makeProp({...box, seed, paint(g){ const s = Math.min((box.w - 6) / pic.width, (box.h - 6) / pic.height), w = pic.width * s, h = pic.height * s;
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(pic, -w / 2, -h + (box.h - box.ay) - 2, w, h); }}); }
{ const _v = PROP_TYPES.vshop; PROP_TYPES.vshop = (seed, v = 0) => { const k = (VSHOP[v] || {}).k, pic = BIMG.ready[k];
    return pic ? bimgProp(pic, seed, {w:140, h:136, ax:70, ay:124, shadow:[52, 12, 3], collide:30, glow:[0, -40, 62]}) : _v(seed, v); }; }
{ const _t = PROP_TYPES.twmonument; if (_t) PROP_TYPES.twmonument = (seed, v = 0) => { const pic = BIMG.ready.twmonument;
    return pic ? bimgProp(pic, seed, {w:250, h:340, ax:125, ay:330, shadow:[100, 16], collide:0, glow:[0, -312, 80]}) : _t(seed, v); }; }
