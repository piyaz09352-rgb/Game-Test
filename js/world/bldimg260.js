/* VAYRATHEN — js/world/bldimg260.js — (v260) the owner's own pictures for buildings
   The owner: "why draw it after my picture — just put my picture in". Any building whose picture is in
   assets/buildings/ is drawn from that file instead of the painted one:
     apothecary.png → ร้านยา · smithy.png → โรงตีเหล็ก · smelter.png → โรงหลอมแร่ · driller.png → ร้านเจาะมณี ·
     herbal.png → สมุนไพร · cook.png → โรงครัว · tailor.png → ร้านตัดชุด · bank.png → คลังเบี้ย · registrar.png → ทะเบียน ·
     festival.png → เทศกาล · trader.png → รับซื้อของ · beast.png → เลี้ยงสัตว์ · tower.png → อนุสรณ์หอคอย 100 ชั้น
   A white (or near-white) background round the picture is cut away by itself (v262: a black one too), so a picture with a plain white
   background works as well as a transparent PNG. A missing file just leaves the painted building. */
'use strict';
const BIMG = {files:{shop:'apothecary', smith:'smithy', forger:'smelter', driller:'driller', herbal:'herbal', cook:'cook', tailor:'tailor', banker:'bank', registrar:'registrar',
  festival:'festival', trader:'trader', beast:'beast', twmonument:'tower'}, ready:{}};
/* cut the white background away: flood from the picture's edges through near-white pixels */
function bimgCut(img){
  const w = img.naturalWidth, h = img.naturalHeight, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  let d; try { d = g.getImageData(0, 0, w, h); } catch (e) { return c; }
  const px = d.data, seen = new Uint8Array(w * h), st = [];
  if (px[3] < 10 && px[(w * h - 1) * 4 + 3] < 10) return c;   // already transparent
  // (v262) the background is the corner's colour: near-white or near-black (the owner's stable came on black)
  const blackBg = Math.max(px[0], px[1], px[2]) < 30, white = blackBg ? i => px[i * 4 + 3] > 0 && Math.max(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]) < 14
    : i => px[i * 4 + 3] > 0 && px[i * 4] > 232 && px[i * 4 + 1] > 232 && px[i * 4 + 2] > 232;
  for (let x = 0; x < w; x++){ st.push(x, (h - 1) * w + x); } for (let y = 0; y < h; y++){ st.push(y * w, y * w + w - 1); }
  while (st.length){ const i = st.pop(); if (seen[i] || !white(i)) continue; seen[i] = 1; px[i * 4 + 3] = 0; const x = i % w, y = (i / w) | 0;
    if (x > 0) st.push(i - 1); if (x < w - 1) st.push(i + 1); if (y > 0) st.push(i - w); if (y < h - 1) st.push(i + w); }
  g.putImageData(d, 0, 0); return c;
}
function bimgLoad(key){
  const im = new Image(); im.onload = () => { try { BIMG.ready[key] = bimgCut(im); for (const k in propCache) if (/^(vshop|twmonument|healerhut|jobtemple|dgngate)/.test(k)) delete propCache[k]; } catch (e) {} };
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

/* ---------- (v262) Doctor Oon's own clinic: the owner's picture «หมออาสา บริการผู้เล่น», behind her in Aren ---------- */
BIMG.files.healerhut = 'healer'; if (location.protocol !== 'file:') bimgLoad('healerhut');
PROP_TYPES.healerhut = (seed) => { const pic = BIMG.ready.healerhut;
  return pic ? bimgProp(pic, seed, {w:140, h:136, ax:70, ay:124, shadow:[52, 12, 3], collide:30, glow:[0, -40, 62]}) : makeProp({w:4, h:4, ax:2, ay:2, seed, paint(){}}); };
function bimgClinic(){ if (typeof MAP_ID === 'undefined' || MAP_ID !== 0 || (typeof DG !== 'undefined' && DG.active)) return;
    const n = NPCS.find(o => o.id === 'healer_oon'); if (!n || PROPS.some(p => p.type === 'healerhut')) return;
    const x = n.x, y = n.y - 26;
    // clear trees, bushes and small things where the clinic stands (buildings stay)
    const keep = new Set(['vshop', 'sala', 'armytent', 'house', 'shrine', 'tbld', 'tland', 'lamp']);
    for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (keep.has(p.type)) continue; const im = propImg(p.type, p.variant), half = (im.w || 40) / 2;
      if (Math.abs(p.x - x) < 70 + half && p.y > y - 130 && p.y - (im.ay || 40) < y + 6){ PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); } }
    addProp('healerhut', x, y); }
EV.on('map', () => setTimeout(bimgClinic, 0)); EV.on('tick', () => { if (typeof MAP_ID !== 'undefined' && MAP_ID === 0 && !(PROPS || []).some(p => p.type === 'healerhut')) bimgClinic(); });

/* ---------- (v262) the owner's pictures that stand behind an NPC: the job-change temple behind Master Vayra (in place of
   his shrine) and the dungeon gate behind Gatekeeper Saeng (in place of the portal) ---------- */
const BIMG_SPOTS = [{id:'jobtemple', file:'temple', npc:'job', near:['shrine', 'spirit'], dy:-74, box:{w:200, h:186, ax:100, ay:174, shadow:[78, 14, 3], collide:40, glow:[0, -60, 80]}},
  {id:'dgngate', file:'dungeon', npc:'gatekeeper', near:['portal'], dy:-32, box:{w:190, h:176, ax:95, ay:164, shadow:[74, 14, 3], collide:36, glow:[0, -50, 80]}}];
for (const o of BIMG_SPOTS){ BIMG.files[o.id] = o.file; if (location.protocol !== 'file:') bimgLoad(o.id);
  PROP_TYPES[o.id] = seed => { const pic = BIMG.ready[o.id]; return pic ? bimgProp(pic, seed, o.box) : makeProp({w:4, h:4, ax:2, ay:2, seed, paint(){}}); }; }
function bimgSpots(){ if (typeof MAP_ID === 'undefined' || MAP_ID !== 0 || (typeof DG !== 'undefined' && DG.active)) return;
  for (const o of BIMG_SPOTS){ if (!BIMG.ready[o.id] || PROPS.some(p => p.type === o.id)) continue; const n = NPCS.find(q => q.id === o.npc); if (!n) continue;
    const old = PROPS.find(p => p.type === o.near[0] && Math.hypot(p.x - n.x, p.y - n.y) < 160), x = old ? old.x : n.x, y = old ? old.y : n.y + o.dy;
    for (let i = PROPS.length - 1; i >= 0; i--){ const p = PROPS[i]; if (!o.near.includes(p.type) || Math.hypot(p.x - x, p.y - y) > 140) continue;
      PROPS.splice(i, 1); for (let j = obstacles.length - 1; j >= 0; j--) if (obstacles[j].prop === p) obstacles.splice(j, 1); }
    addProp(o.id, x, y); } }
EV.on('map', () => setTimeout(bimgSpots, 0)); EV.on('tick', () => { if (typeof MAP_ID !== 'undefined' && MAP_ID === 0 && BIMG_SPOTS.some(o => BIMG.ready[o.id] && !(PROPS || []).some(p => p.type === o.id))) bimgSpots(); });
// the owner's buildings count as buildings (an NPC standing in front of one is fine: npccover / townlife checks)
if (typeof NC_STRUCT !== 'undefined') for (const t of ['healerhut', 'jobtemple', 'dgngate']) NC_STRUCT.add(t);
