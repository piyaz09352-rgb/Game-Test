/* VAYRATHEN — js/sys/mapstory212.js — (v212) map stories: the system behind js/data/mapstory_east.js
   · Story NPCs stand on their maps, dressed in wardrobe pieces like a player character (tops, headpieces, face
     pieces, back pieces). Khao Hom walks the east road beside each local NPC once she has joined you.
   · A chapter is three steps; each step is handed back to its NPC, who tells the next part of the tale:
       kill  — hunt monsters of the map
       item  — gather a monster's drop (taken when you hand in)
       find  — glowing spots on the map (stars on the minimap); walk over them
       elite — a named, much stronger monster appears away from the camp (a star on the minimap)
   · The chapters of a road open one after another (the story carries on); each also wants you near its level.
   · Rewards grow with the map's level and the step: Bia and EXP each step; the last step adds the NPC's own
     wardrobe piece, Vayra Coins, potions and, higher up, smith's stones. Finishing the road gives a title
     (an achievement) and a mount, the Sky Krathong.
   Saved per character in S.ms = {done:{map:1}, cur:{map, step, n, found:[i…], elite:0|1} | null}. */
'use strict';

/* ---------- a figure for story NPCs: a player's body with nothing in the hands ---------- */
SPR.CHARS.ms_npc = {...SPR.CHARS.novice, name:'NPC', en:'Story NPC'}; delete SPR.CHARS.ms_npc.weapon; SPR.CHAR_ACTIONS.ms_npc = ['idle'];

/* ---------- the NPCs' own wardrobe pieces (story rewards: not sold) ---------- */
{ const M = SPR.M, mm = (n, f = 'white') => (M[n] != null ? n : f), m = n => M[mm(n)];
  const tops = {
    ms_t_lotus:['ชุดแม่ค้าบัวแดง', 'Red Lotus Seller Dress', fSet('dress', mm('rose'), mm('ivory'), mm('sakura'), FT.combo(FT.dots(m('white')), FT.hem(m('sakura'))))],
    ms_t_rower:['ชุดแม่แจวเรือเจ้าพระยา', 'Chao Phraya Ferry Rower', fSet('ninja', mm('navy'), mm('white'), mm('sky'), FT.combo(FT.stripes(m('white')), FT.hem(m('sky'))))],
    ms_t_sailor:['ชุดกะลาสีอันดามัน', 'Andaman Sailor Suit', fSet('battle', mm('white'), mm('navy'), mm('gold'), FT.combo(FT.chev(m('navy')), FT.hem(m('navy'))), {cape:null})],
    ms_t_hamsa:['ชุดหงส์ทองอโนดาต', 'Golden Hamsa of Anodat', fSet('sky', mm('ivory'), mm('goldLight', 'gold'), mm('gold'), FT.combo(FT.kanok(m('gold')), FT.hem(m('goldLight'))))],
    ms_t_explorer:['ชุดนักสำรวจภูเวียง', 'Phu Wiang Explorer', fSet('battle', mm('sand', 'cream'), mm('brownCl', 'leather'), mm('ochre', 'gold'), FT.combo(FT.zip(m('leather')), FT.hem(m('brownCl'))), {cape:null, pouch:true})],
    ms_t_dawn:['ชุดช่างโคมรุ่งอรุณ', 'Dawn Lantern-maker', fSet('court', mm('sunset', 'scarlet'), mm('ivory'), mm('goldLight', 'gold'), FT.combo(FT.kanok(m('goldLight')), FT.hem(m('sun', 'gold'))), {cape:mm('sunset', 'scarlet'), capeTex:'gold'})]
  };
  const parts = {
    ms_h_khaohom:['head', 'โบว์โคมลอยข้าวหอม', "Khao Hom's Lantern Bow", {hat:null, hairBow:mm('sunset', 'scarlet'), bowKnot:mm('gold')}],
    ms_h_bamboo:['head', 'ผ้าโพกลายไผ่', 'Bamboo-print Head Wrap', {hat:'headwrap', bandMat:mm('jade', 'green')}],
    ms_h_ngob:['head', 'งอบทานตะวัน', 'Sunflower Ngob', {hat:'ngob', hatMat:mm('sun', 'gold'), ngobBand:mm('ember', 'scarlet')}],
    ms_h_shell:['head', 'หมวกเก็บหอยโกงกาง', 'Mangrove Shell-gatherer Cap', {hat:'cap', capMat:mm('aqua', 'sky')}],
    ms_k_fruit:['mask', 'สติกเกอร์แก้มผลไม้', 'Fruit Cheek Stickers', {faceMask:mm('sunset', 'rose'), fmStyle:'sticker', fmTrim:mm('lime', 'jade')}],
    ms_k_veil:['mask', 'ผ้าคลุมหน้าแม่ค้าราตรี', 'Night Vendor Veil', {faceMask:mm('plum'), fmStyle:'veil', fmTrim:mm('gold'), fmEye:null}],
    ms_k_fin:['mask', 'หูครีบไข่มุก', 'Pearl Fin Ears', {sideEar:'fin', sideMat:mm('pearl', 'white'), sideIn:mm('aqua', 'sky')}],
    ms_k_paint:['mask', 'ลายบัวตองที่แก้ม', 'Goldbloom Cheek Paint', {faceMask:mm('sun', 'gold'), fmStyle:'blush', fmTrim:mm('goldLight', 'gold')}]
  };
  for (const id in tops){ const [th, en, look] = tops[id]; COSTUME[id] = {slot:'top', th, en, src:'story', grand:true, sw:[look.top, look.forearm], look}; SPR.GEAR_LOOK[id] = look; }
  for (const id in parts){ const [slot, th, en, look] = parts[id]; COSTUME[id] = {slot, th, en, src:'story', grand:false, sw:[look.hatMat || look.hairBow || look.bandMat || look.capMat || look.faceMask || look.sideMat, look.bowKnot || look.fmTrim || look.sideIn || look.ngobBand || look.bandMat || look.capMat], look}; SPR.GEAR_LOOK[id] = look; }
  WINGS.ms_b_rainbow = {set:null, th:'ปีกรุ้งน้ำตกเจ็ดสี', en:'Seven-hued Falls Wings', kind:'butterfly', c:['#ffffff', '#ffb8f0', '#7ad8ff'], edge:'#ffffff', glow:'200,180,255', fx:'sparkle', span:.95, story:true};
  WINGS.ms_b_firefly = {set:null, th:'ฝูงหิ่งห้อยเพื่อนรัก', en:'Firefly Friends', kind:'aFly', c:['#ffffff', '#f6ff9a', '#9ae84a'], edge:'#9ae84a', glow:'220,255,120', fx:'none', span:1, cute:true, story:true};
  const kr = {slot:'mount', th:'กระทงลอยฟ้ารุ่งอรุณ', en:'Dawn Sky Krathong', kind:'krathong', lift:9, c:['#4fae55', '#ffb02e'], story:true};
  XMOUNT.ms_m_krathong = kr; XCOS.ms_m_krathong = kr;
}
// Grandpa Thian's own head: a white head wrap and a white beard (not a wardrobe piece)
SPR.GEAR_LOOK.ms_x_tathian = {hat:'headwrap', bandMat:SPR.M.ivory != null ? 'ivory' : 'white', beard:'hairWhite', bodyScale:.92};
/* (v214) the south road's pieces */
{ const M = SPR.M, mm = (n, f = 'white') => (M[n] != null ? n : f), m = n => M[mm(n)];
  const tops = {
    ms_t_oasis:['ชุดนักบวชโอเอซิส', 'Oasis Priest Robe', fSet('robe', mm('emerald', 'jade'), mm('sand', 'cream'), mm('gold'), FT.combo(FT.waves(m('goldLight')), FT.hem(m('gold'))))],
    ms_t_tani:['ชุดใบตองนางตานี', 'Nang Tani Banana-leaf Gown', fSet('dress', mm('mint', 'jade'), mm('ivory'), mm('jade', 'green'), FT.combo(FT.kanok(m('goldLight')), FT.hem(m('jade'))))],
    ms_t_caravan:['ชุดกองคาราวาน', 'Caravan Robe', fSet('robe', mm('sand', 'cream'), mm('sunset', 'scarlet'), mm('gold'), FT.combo(FT.stripes(m('sunset')), FT.hem(m('gold'))))],
    ms_t_ember:['ชุดผู้เฝ้าไฟ', 'Fire-keeper Suit', fSet('ninja', mm('scarlet'), mm('charcoal', 'onyx'), mm('ember', 'gold'), FT.combo(FT.chev(m('ember')), FT.hem(m('lavaGlow', 'ember'))))],
    ms_t_hermit:['ชุดฤๅษีหินดำ', 'Black-stone Hermit Robe', fSet('robe', mm('ochre', 'sand'), mm('charcoal', 'onyx'), mm('gold'), FT.combo(FT.kanok(m('gold')), FT.hem(m('charcoal'))), {cape:mm('tigerFur', 'ochre')})],
    ms_t_cinder:['ชุดนักพายทะเลถ่าน', 'Cinder-sea Paddler', fSet('battle', mm('charcoal', 'onyx'), mm('ember', 'scarlet'), mm('lavaGlow', 'ember'), FT.combo(FT.waves(m('lavaGlow')), FT.hem(m('ember'))), {cape:null})],
    ms_t_yama:['ชุดเสมียนยมโลก', 'Underworld Clerk Robe', fSet('court', mm('midnight', 'navy'), mm('scarlet'), mm('gold'), FT.combo(FT.stars(m('gold')), FT.hem(m('scarlet'))))],
    ms_t_rain:['ชุดผู้นำฝน', 'Rainbringer', fSet('sky', mm('sky'), mm('pearl', 'white'), mm('cyanGlow', 'aqua'), FT.combo(FT.waves(m('cyanGlow')), FT.hem(m('aqua', 'sky'))), {cape:mm('aqua', 'sky'), capeTex:'gold'})]
  };
  const parts = {
    ms_h_rocket:['head', 'ผ้าโพกช่างบั้งไฟ', "Rocket Maker's Head Wrap", {hat:'headwrap', bandMat:mm('ember', 'scarlet')}],
    ms_h_explorer:['head', 'หมวกนักล่าสมบัติ', "Treasure Hunter's Hat", {hat:'cap', capMat:mm('sand', 'cream')}],
    ms_h_wind:['head', 'คาดผมสายลม', 'Wind Headband', {hat:'band', bandMat:mm('sky')}],
    ms_h_cactus:['head', 'กิ๊บดอกกระบองเพชร', 'Cactus Flower Pin', {hat:null, hairClip:'flower', clipMat:mm('rose')}],
    ms_h_miner:['head', 'หมวกคนงานเหมือง', "Miner's Cap", {hat:'cap', capMat:mm('sun', 'gold')}],
    ms_h_agni:['head', 'มงกุฎเปลวอัคนี', 'Agni Flame Crown', {hat:'crest', bandMat:mm('ember', 'scarlet'), crestMat:mm('lavaGlow', 'ember'), crestN:5}],
    ms_h_horns:['head', 'เขามังกรน้อย', 'Little Dragon Horns', {hat:null, horns:mm('jade', 'green'), hornLen:2.4, hornSpread:1}],
    ms_k_dust:['mask', 'ผ้าปิดจมูกช่างแกะหิน', "Stone Carver's Dust Mask", {ninjaMask:mm('sand', 'cream')}],
    ms_k_bandana:['mask', 'ผ้าปิดหน้าเสือน้อย', "Suea Noi's Face Cloth", {ninjaMask:mm('wine', 'scarlet')}],
    ms_k_goggle:['mask', 'แว่นกันความร้อน', 'Heat Goggles', {faceMask:mm('bronze', 'gold'), fmStyle:'round', fmTrim:mm('bronze', 'gold')}]
  };
  for (const id in tops){ const [th, en, look] = tops[id]; COSTUME[id] = {slot:'top', th, en, src:'story', grand:true, sw:[look.top, look.forearm], look}; SPR.GEAR_LOOK[id] = look; }
  for (const id in parts){ const [slot, th, en, look] = parts[id]; COSTUME[id] = {slot, th, en, src:'story', grand:false, sw:[look.bandMat || look.capMat || look.clipMat || look.horns || look.ninjaMask || look.faceMask, look.crestMat || look.fmTrim || look.bandMat || look.capMat || look.clipMat || look.horns || look.ninjaMask], look}; SPR.GEAR_LOOK[id] = look; }
  WINGS.ms_b_phoenix = {set:null, th:'ประกายขนหงส์เพลิง', en:'Phoenix Feather Sparks', kind:'aFly', c:['#ffffff', '#ffc05a', '#ff5a2a'], edge:'#ff5a2a', glow:'255,150,60', fx:'none', span:1, cute:true, story:true};
  WINGS.ms_b_pearl = {set:null, th:'ไข่มุกมังกรลอยวน', en:'Orbiting Dragon Pearls', kind:'aBubble', c:['#ffffff', '#fff2d0', '#e8c070'], edge:'#e8c070', glow:'255,230,170', fx:'none', span:1, cute:true, story:true};
  const rk = {slot:'mount', th:'บั้งไฟพญานาค', en:'Naga Rocket', kind:'rocket', lift:10, c:['#c8281e', '#ffd040'], story:true};
  XMOUNT.ms_m_rocket = rk; XCOS.ms_m_rocket = rk;
}
// the naga rocket: a bamboo rocket bound in red and gold, a carved naga head at the front, streamers and a smoke trail behind
MOUNT_X.rocket = function(g, M, x, by, dir, t, moving){
  const [red, gold] = M.c, fl = dir === 2 || dir === 1 || dir === 3 ? -1 : 1, side = dir === 2 || dir === 6, bob = Math.sin(t * 3) * 1;
  g.save(); g.translate(x, by + 4 + bob); g.scale(fl * (side ? 1 : .78), 1);
  for (let i = 0; i < 6; i++){ const ph = (t * (moving ? 2.4 : 1.2) + i / 6) % 1; g.fillStyle = `rgba(220,220,225,${(1 - ph) * .5})`; ov(g, -22 - ph * 18, Math.sin(i * 2 + t) * 1.5 + 1, 2 + ph * 4, 1.6 + ph * 3); g.fill(); }
  fxGlow(g, -21, 1, 7, 4, '255,160,60', .8); g.fillStyle = '#fff0a0'; ov(g, -20.5, 1, 2.6 + Math.sin(t * 20), 1.4); g.fill(); g.fillStyle = '#ff7a2a'; ov(g, -23, 1, 2, 1); g.fill();
  g.fillStyle = vsLin(g, 0, -3, 0, 4, [[0, '#e8d890'], [.5, '#c8b060'], [1, '#8a7030']]); g.beginPath(); g.moveTo(-20, -2.6); g.lineTo(14, -2.6); g.lineTo(14, 3.6); g.lineTo(-20, 3.6); g.closePath(); g.fill();
  for (const bx of [-16, -9, -2, 5, 11]){ g.fillStyle = red; g.fillRect(bx, -2.8, 2.2, 6.6); g.fillStyle = gold; g.fillRect(bx + .6, -2.8, .6, 6.6); }
  for (let i = 0; i < 3; i++){ const w = Math.sin(t * 6 + i) * 1.6; g.strokeStyle = [red, gold, '#4ab8ff'][i]; g.lineWidth = .9; g.beginPath(); g.moveTo(-19, 2 + i * .6); g.quadraticCurveTo(-26, 5 + w, -31, 6 + i * 1.4 - w); g.stroke(); }
  g.fillStyle = vsLin(g, 0, -6, 0, 5, [[0, '#4ad88a'], [1, '#1a7a4a']]); g.beginPath(); g.moveTo(14, -3.4); g.quadraticCurveTo(22, -7, 25, -2); g.lineTo(23, 1.6); g.quadraticCurveTo(20, 4.6, 14, 4); g.closePath(); g.fill();
  g.fillStyle = gold; g.beginPath(); g.moveTo(16, -4.6); g.lineTo(18, -9); g.lineTo(19.6, -4.4); g.lineTo(21.4, -8); g.lineTo(22.2, -3.2); g.closePath(); g.fill();
  g.fillStyle = '#ff3a2a'; ov(g, 21, -2.4, 1, 1); g.fill(); g.fillStyle = '#fff'; g.fillRect(23.4, 0, 1.6, .6); g.strokeStyle = '#1a4a2a'; g.lineWidth = .4; g.beginPath(); g.moveTo(25, -.6); g.lineTo(22, .8); g.stroke();
  g.restore();
};
const MS_STORY_IDS = new Set([...Object.keys(COSTUME).filter(k => /^ms_/.test(k)), 'ms_b_rainbow', 'ms_b_firefly', 'ms_m_krathong']);
// the sky krathong: a banana-leaf krathong with marigolds, a candle and three incense sticks, floating on a soft glow
MOUNT_X.krathong = function(g, M, x, by, dir, t){
  const [leaf, flower] = M.c, rgb = fxRGB(flower), bob = Math.sin(t * 2.2) * 1.2, y = by + 4 + bob;
  fxGlow(g, x, by + 12, 26, 9, '255,200,110', .35);
  for (let i = 0; i < 3; i++){ const ph = (t * .6 + i / 3) % 1; g.strokeStyle = `rgba(${rgb},${(1 - ph) * .35})`; g.lineWidth = 1; g.beginPath(); g.ellipse(x, by + 13, 14 + ph * 14, (14 + ph * 14) * .3, 0, 0, 7); g.stroke(); }
  // the banana-trunk base
  g.beginPath(); g.ellipse(x, y + 3, 19, 6, 0, 0, 7); g.fillStyle = '#e8ead0'; g.fill(); g.strokeStyle = '#a8a888'; g.lineWidth = .7; g.stroke();
  // folded banana-leaf petals around the rim, the back row first
  const petal = (a, s) => { const px = x + Math.cos(a) * 15, py = y + 1 + Math.sin(a) * 4.6; g.save(); g.translate(px, py); g.scale(s, s);
    const gr = g.createLinearGradient(0, -9, 0, 2); gr.addColorStop(0, '#9be08a'); gr.addColorStop(.6, leaf); gr.addColorStop(1, '#2f6e34'); g.fillStyle = gr;
    g.beginPath(); g.moveTo(-3.6, 2); g.lineTo(0, -9); g.lineTo(3.6, 2); g.closePath(); g.fill(); g.strokeStyle = 'rgba(20,60,20,.6)'; g.lineWidth = .5; g.stroke();
    g.strokeStyle = 'rgba(220,255,200,.55)'; g.beginPath(); g.moveTo(0, 1); g.lineTo(0, -7); g.stroke(); g.restore(); };
  for (let i = 0; i < 12; i++){ const a = Math.PI + i / 12 * Math.PI; petal(a, .9); }
  // marigolds and jasmine heaped in the middle
  for (let i = 0; i < 9; i++){ const a = i / 9 * 6.283 + .3, r = i % 3 === 0 ? 0 : 7, fx = x + Math.cos(a) * r, fy = y - 2 + Math.sin(a) * r * .32;
    g.fillStyle = i % 4 === 1 ? '#fff8ec' : flower; g.beginPath(); g.arc(fx, fy, i % 4 === 1 ? 1.8 : 2.6, 0, 7); g.fill();
    g.fillStyle = i % 4 === 1 ? '#f0e0b0' : '#e07a10'; g.beginPath(); g.arc(fx, fy - .3, i % 4 === 1 ? .7 : 1.1, 0, 7); g.fill(); }
  for (let i = 0; i < 12; i++){ const a = i / 12 * Math.PI, s = 1; petal(a, s); }
  // candle and incense, with their flames
  g.fillStyle = '#fff4d0'; g.fillRect(x - 1.2, y - 11, 2.4, 7); g.fillStyle = '#e8d8a8'; g.fillRect(x + .6, y - 11, .6, 7);
  for (const dx of [-5, -3.6, -2.2]){ g.strokeStyle = '#8a3a1a'; g.lineWidth = .6; g.beginPath(); g.moveTo(x + dx, y - 3); g.lineTo(x + dx - .6, y - 13); g.stroke();
    g.fillStyle = `rgba(255,120,40,${.6 + .4 * Math.sin(t * 9 + dx)})`; g.fillRect(x + dx - .9, y - 13.6, .8, .8);
    g.strokeStyle = 'rgba(230,230,240,.25)'; g.beginPath(); g.moveTo(x + dx - .6, y - 14); g.quadraticCurveTo(x + dx - 2 + Math.sin(t * 2 + dx) * 2, y - 18, x + dx - 1, y - 22); g.stroke(); }
  const fl = 1 + Math.sin(t * 14) * .12; fxGlow(g, x, y - 13, 9, 9, '255,190,90', .55);
  g.fillStyle = '#ffe9a0'; g.beginPath(); g.ellipse(x, y - 13, 1.4 * fl, 2.6 * fl, 0, 0, 7); g.fill(); g.fillStyle = '#ff9a2a'; g.beginPath(); g.ellipse(x, y - 12.4, .7, 1.3, 0, 0, 7); g.fill();
  for (let i = 0; i < 5; i++){ const ph = (t * .5 + i / 5) % 1; g.fillStyle = `rgba(255,220,140,${(1 - ph) * .8})`; g.fillRect(x + Math.sin(i * 2.1 + t) * 10, y - 6 - ph * 18, 1, 1); }
};
// story pieces are not on the tailor's shelves (the wing shelf reads a price every piece there has)
{ const _t = NPC_OPEN.tailor;
  if (_t) NPC_OPEN.tailor = function(n){ const hid = []; for (const T0 of [WINGS, XCOS]) for (const id of Object.keys(T0)) if (T0[id].story){ hid.push([T0, id, T0[id]]); delete T0[id]; }
    try { return _t.apply(this, arguments); } finally { for (const [T0, id, v] of hid) T0[id] = v; } }; }
// a line for the source in the wardrobe
if (typeof COS_SRC !== 'undefined') COS_SRC.story = ['เนื้อเรื่องเสริม (เควสต์ตามแผนที่)', 'Side story (map quests)'];

/* ---------- state ---------- */
const msS = () => { const o = S.ms = S.ms && typeof S.ms === 'object' ? S.ms : {}; if (!o.done || typeof o.done !== 'object') o.done = {}; if (o.cur && !MS_CH[o.cur.map]) o.cur = null; return o; };
const msArcOf = map => MS_ARCS.find(a => a.maps.includes(+map));
const msPrev = map => { const a = msArcOf(map); if (!a) return null; const i = a.maps.indexOf(+map); return i > 0 ? a.maps[i - 1] : null; };
const msLv = map => (MAPS[map] && MAPS[map].lv ? MAPS[map].lv[0] : 1);
const msJoined = (arc = MS_ARCS[0]) => !!msS().done[arc.maps[0]];   // the road's companion has joined once its first chapter is done
const msCompArc = id => MS_ARCS.find(a => (a.comp && a.comp.id === id) || (a.extra && a.extra.id === id));
const msArcDone = arc => arc.maps.every(m => msS().done[m]);
function msOpen(map){ const s = msS(), p = msPrev(map); return !s.done[map] && (p == null || !!s.done[p]); }
const msLvOk = map => S.lvl >= Math.max(1, msLv(map) - 5);
const msStep = () => { const c = msS().cur; return c ? MS_CH[c.map].steps[c.step] : null; };
function msHave(st){ const c = msS().cur; if (!c || !st) return 0;
  return st.k === 'item' ? Math.min(st.n, S.inv[st.t] || 0) : st.k === 'find' ? Math.min(st.n, (c.found || []).length) : st.k === 'elite' ? (c.elite ? 1 : 0) : Math.min(st.n, c.n || 0); }
const msNeed = st => (st.k === 'elite' ? 1 : st.n);
const msReady = () => { const st = msStep(); return !!st && msHave(st) >= msNeed(st); };
const msNpcOf = map => (MS_CH[map] && MS_CH[map].npc) || null;
function msGoalTxt(st){
  if (!st) return '';
  if (st.k === 'kill') return L(`ล่า ${nm(MOB[st.t])}`, `Hunt ${nm(MOB[st.t])}`);
  if (st.k === 'item') return L(`เก็บ ${nm(ITEMS[st.t])}`, `Gather ${nm(ITEMS[st.t])}`);
  if (st.k === 'find') return L(`ตามหา ${st.what[0]} (จุดเรืองแสง ✦)`, `Find: ${st.what[1]} (glowing ✦)`);
  return L(`ปราบ ✦ ${st.name[0]}`, `Defeat ✦ ${st.name[1]}`);
}
/* rewards: they grow with the map's level and the step (the elite step pays most) */
function msReward(map, i, last){
  const lv = msLv(map), k = [1, 1.3, 1.8][i] || 1, r = {bia:Math.round((150 + lv * 40) * k), exp:Math.round(nextBase(Math.max(1, lv)) * ([.25, .3, .45][i] || .3)), items:[]};
  if (last){ r.coin = 2 + Math.floor(lv / 12); r.cos = MS_CH[map].cos;
    r.items.push([lv < 30 ? 'redpot' : lv < 70 ? 'orangepot' : 'whitepot', 5], [lv < 40 ? 'ore' : 'rf_luck', lv < 40 ? 3 : 1]);
    if (lv >= 60) r.items.push(['rf_guard', 1]);
    if (MS_CH[map].finale) r.coin += 10; }
  return r;
}
const msRewardTxt = r => [`${fmtN(r.bia)} ${CUR()}`, 'EXP', r.coin ? `◈ ${r.coin}` : '', ...r.items.map(([id, n]) => ITEMS[id] ? `${nm(ITEMS[id])} ×${n}` : ''), r.cos ? `✦ ${msPieceName(r.cos)}` : ''].filter(Boolean).join(' · ');
const msPieceName = id => { const d = COSTUME[id] || WINGS[id] || XCOS[id]; return d ? L(d.th, d.en) : id; };
function msGivePiece(id){
  if (COSTUME[id]) return typeof cosGrant === 'function' ? cosGrant(id) : false;
  if (!WINGS[id] && !XCOS[id]) return false; const w = ACC.wardrobe = ACC.wardrobe || {}; if (w[id]) return false; w[id] = 1; if (typeof accSave === 'function') accSave();
  banner(L(`ได้ชิ้นแฟชั่น: ${msPieceName(id)}`, `New wardrobe piece: ${msPieceName(id)}`)); SFX.play('ach'); return true;
}

/* ---------- accepting and handing in ---------- */
function msAccept(map){
  const s = msS(); if (s.cur || !msOpen(map) || !msLvOk(map)) return;
  s.cur = {map, step:0, n:0, found:[], elite:0}; SFX.play('quest'); banner(L(MS_CH[map].title[0], MS_CH[map].title[1]));
  log(L(`เนื้อเรื่องเสริม: ${MS_CH[map].title[0]} — ${msGoalTxt(msStep())}`, `Side story: ${MS_CH[map].title[1]} — ${msGoalTxt(msStep())}`), 'g'); dirty = true; save();
}
function msHandIn(){
  const s = msS(), c = s.cur, st = msStep(); if (!c || !msReady()) return;
  const ch = MS_CH[c.map], last = c.step >= ch.steps.length - 1, r = msReward(c.map, c.step, last);
  if (st.k === 'item'){ S.inv[st.t] -= st.n; if (S.inv[st.t] <= 0) delete S.inv[st.t]; }
  S.bia += r.bia; gainExp(r.exp, Math.round(r.exp * .5)); for (const [id, n] of r.items) if (ITEMS[id]) addItem(id, n);
  if (r.coin && typeof coinAdd === 'function') coinAdd(r.coin, L(ch.title[0], ch.title[1]));
  MS.say = L(...st.done);
  if (last){ s.done[c.map] = 1; s.cur = null; if (r.cos) msGivePiece(r.cos);
    VFX.play('jobChange', {x:P.x, y:P.y}); SFX.play('quest');
    log(L(`จบบท ${ch.title[0]} · ${msRewardTxt(r)}`, `Chapter complete: ${ch.title[1]} · ${msRewardTxt(r)}`), 'g');
    const arc = msArcOf(c.map);
    if (arc && msArcDone(arc)){ if (arc.mount) msGivePiece(arc.mount); banner(L(`จบเนื้อเรื่อง «${arc.title[0]}»!`, `«${arc.title[1]}» complete!`)); if (typeof achCheck === 'function') achCheck(); }
    else { const nx = arc && arc.maps[arc.maps.indexOf(c.map) + 1]; if (nx != null) toast(L(`บทต่อไป: ${MAPS[nx].name} (Lv ${msLv(nx)}+)`, `Next chapter: ${MAPS[nx].en} (Lv ${msLv(nx)}+)`)); }
  } else { c.step++; c.n = 0; c.found = []; c.elite = 0; SFX.play('coin');
    log(L(`${ch.title[0]} · ขั้นที่ ${c.step + 1}: ${msGoalTxt(msStep())} · ได้ ${fmtN(r.bia)} ${CUR()} + EXP`, `${ch.title[1]} · step ${c.step + 1}: ${msGoalTxt(msStep())} · +${fmtN(r.bia)} ${CUR()} + EXP`), 'g'); }
  msRefreshNpcs(); dirty = true; save();
}

/* ---------- where things stand on the current map ---------- */
const MS = {spots:[], elite:null, map:-1, say:''};
function msRng(seed){ let x = seed >>> 0 || 1; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
function msFree(cx, cy, r0, r1, rnd, avoid, gap = 110){
  for (let i = 0; i < 260; i++){ const a = rnd() * 6.283, r = r0 + rnd() * (r1 - r0), x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
    if (typeof walkable === 'function' && !walkable(x, y, 18)) continue;
    if (typeof waterAt === 'function' && waterAt(x, y, 10)) continue;
    if (typeof GATES !== 'undefined' && GATES.some(g => Math.hypot(g.x - x, g.y - y) < 100)) continue;
    if (avoid.some(p => Math.hypot(p.x - x, p.y - y) < gap)) continue;
    return {x, y}; }
  return null;
}
function msPlace(mapId){
  MS.map = mapId; MS.spots = []; MS.elite = null; const ch = MS_CH[mapId]; if (!ch) return;
  const rnd = msRng(mapId * 977 + 13), base = mapId === 0 ? (NPCS.find(n => n.id === 'teller') || NPCS[0] || {x:W / 2, y:H / 2}) : (CAMP || {x:W / 2, y:H / 2});
  const avoid = NPCS.map(n => ({x:n.x, y:n.y}));
  for (let i = 0; i < 3; i++){ const p = msFree(base.x, base.y, mapId === 0 ? 220 : 280, mapId === 0 ? 700 : 760, rnd, [...avoid, ...MS.spots], 150); if (p) MS.spots.push(p); }
  while (MS.spots.length < 3) MS.spots.push({x:clamp(base.x + (MS.spots.length - 1) * 160, 60, W - 60), y:clamp(base.y + 200, 60, H - 60)});
  MS.elite = msFree(base.x, base.y, 330, 620, rnd, [...avoid, ...MS.spots], 160) || {x:clamp(base.x + 340, 60, W - 60), y:base.y};
}
function msNpcObj(d, x, y){ return {id:d.id, name:d.name, en:d.en, role:d.role[0], roleEn:d.role[1], x, y, ms:true}; }
function msLookOf(d){
  const arc = MS_ARCS.find(a => a.comp && a.comp.id === d.id), done = arc && arc.compArmor && msArcDone(arc);
  return {job:'ms_npc', look:{sex:d.sex, hair:d.hair, color:d.color, eye:d.eye}, gear:{...d.gear, ...(done ? {armor:arc.compArmor} : {})}};
}
function msAddNpc(d, near, gap = 96){
  if (NPCS.some(n => n.id === d.id)) return null;
  const rnd = msRng(d.id.length * 131 + MAP_ID * 7), avoid = NPCS.map(n => ({x:n.x, y:n.y})), p = msFree(near.x, near.y, 70, 260, rnd, avoid, gap) || {x:near.x + 90, y:near.y + 40};
  const n = msNpcObj(d, p.x, p.y); NPC_LOOKS[d.id] = msLookOf(d); if (typeof NPC_TAG !== 'undefined') NPC_TAG[d.id] = [0, `✦ ${d.name}`, 0, `✦ ${d.en}`];
  NPC_OPEN[d.id] = msOpenNpc; NPCS.push(n); return n;
}
function msRefreshNpcs(){
  // drop the story NPCs and place them again (who stands where depends on how far the story has got)
  for (let i = NPCS.length - 1; i >= 0; i--) if (NPCS[i].ms) NPCS.splice(i, 1);
  const s = msS(), id = MAP_ID, ch = MS_CH[id];
  const arc = msArcOf(id);
  if (ch && arc){ const c = CAMP || {x:W / 2, y:H / 2}, base = id === 0 ? (NPCS.find(n => n.id === 'teller') || {x:W / 2, y:H / 2}) : {x:c.x + 30, y:c.y + 60};
    if (id === arc.maps[0]){ // the road's first map: the companion waits here before she joins, and comes home here at the end
      if (!msJoined(arc) || msArcDone(arc)){ const n = msAddNpc(arc.comp, base); if (n && msArcDone(arc) && arc.extra) msAddNpc(arc.extra, n, 70); } }
    else { const local = msAddNpc(ch.npc, base); if (local && ch.npc.id !== arc.comp.id && msJoined(arc) && !s.done[id]) msAddNpc(arc.comp, local, 70); } }
  // the NPC sheets are made for the figure they wear now
  for (const n of NPCS) if (n.ms && typeof npcSheet === 'function') npcSheet(n.id);
}
{ const _s = setupNpcs; setupNpcs = function(id){ const r = _s.apply(this, arguments); try { msRefreshNpcs(); msPlace(id); } catch (e) { console.warn('mapstory', e); } return r; }; }

/* ---------- talking ---------- */
function msOpenNpc(n){
  const s = msS(), c = s.cur, id = MAP_ID, ch = MS_CH[id], st = msStep(), arc = msArcOf(id) || MS_ARCS[0], comp = arc.comp;
  let say = MS.say || '', body = ''; MS.say = '';
  const pages = arc.maps.filter(m => s.done[m]).length, prog = `<p class="hint">📖 ${L(arc.title[0], arc.title[1])} · ${L('บทที่จบแล้ว', 'chapters done')} ${pages}/${arc.maps.length}</p>`;
  const stepBox = (stp, i) => { const h = msHave(stp), need = msNeed(stp), r = msReward(c.map, i, i >= MS_CH[c.map].steps.length - 1);
    return `<div class="sec">${L(MS_CH[c.map].title[0], MS_CH[c.map].title[1])} · ${L('ขั้น', 'step')} ${i + 1}/${MS_CH[c.map].steps.length}</div><div class="qbox"><div class="qg${h >= need ? ' ok' : ''}"><span>${msGoalTxt(stp)}</span><b>${h}/${need}</b></div>
      <small>${L('รางวัล', 'Reward')}: ${msRewardTxt(r)}</small>
      <button class="btn gold wide" data-msturn="1" ${h >= need ? '' : 'disabled'}>${h >= need ? L('เล่าให้ฟัง · ส่งขั้นนี้', 'Tell them · hand in') : L('ยังไม่ครบ', 'Not finished yet')}</button></div>`; };
  const localHere = ch && ch.npc.id === n.id;
  if (arc.extra && n.id === arc.extra.id){ say = L(...arc.extraSay); }
  else if (n.id === comp.id && msArcDone(arc) && arc.doneSay){ say = say || L(...arc.doneSay); body = prog; }
  else if (c && c.map === id && (localHere || (n.id === comp.id && ch && ch.npc.id === comp.id))){
    if (!say) say = L(...st.say); body = stepBox(st, c.step) + prog; }
  else if (n.id === comp.id && !localHere){
    // the companion: her own line here, and where the story stands
    say = say || (ch && ch.kh ? L(...ch.kh) : L('ข้าอยู่นี่นะ ไปด้วยกัน!', "I'm right here — let's go together!"));
    if (c) body = `<div class="qbox"><b>${L(MS_CH[c.map].title[0], MS_CH[c.map].title[1])}</b><div class="qg${msReady() ? ' ok' : ''}"><span>${msGoalTxt(st)}</span><b>${msHave(st)}/${msNeed(st)}</b></div><p class="hint">${msReady() ? L(`กลับไปหา${MS_CH[c.map].npc.name}`, `Go back to ${MS_CH[c.map].npc.en}`) : L(`ที่${MAPS[c.map].name}`, `in ${MAPS[c.map].en}`)}</p></div>`;
    else { const nx = arc.maps.find(m => !s.done[m]); body = nx != null && !s.done[id] && ch && localHere ? '' : nx != null ? `<p class="hint">${L(`บทต่อไปอยู่ที่${MAPS[nx].name} (Lv ${msLv(nx)}+)`, `The next chapter is in ${MAPS[nx].en} (Lv ${msLv(nx)}+)`)}</p>` : ''; }
    body += prog; }
  else if (localHere && s.done[id]){ say = say || L('ขอบใจเจ้ามากนะ! ถ้าผ่านมาแถวนี้อีก แวะมาคุยกันได้เสมอ', "Thank you so much! Drop by whenever you're passing."); body = prog; }
  else if (localHere && c){ say = L('ดูเจ้ายุ่งอยู่กับเรื่องอื่นนะ… เสร็จธุระแล้วค่อยกลับมาคุยกันนะ', "You look busy with something else… come back when you're done."); body = `<p class="hint">${L(`ตอนนี้ทำเนื้อเรื่องเสริมที่${MAPS[c.map].name}อยู่`, `Your side story is in ${MAPS[c.map].en} right now`)}</p>`; }
  else if (localHere && !msOpen(id)){ const p = msPrev(id); say = L('สวัสดี นักเดินทาง… วันนี้ข้ายังไม่มีอะไรให้ช่วยหรอก', 'Hello, traveller… nothing I need help with today.');
    body = `<p class="hint">${L(`เรื่องของที่นี่จะเริ่มหลังจบเนื้อเรื่องเสริมที่${MAPS[p].name}`, `This tale opens after the side story in ${MAPS[p].en}`)}</p>`; }
  else if (localHere){ const lvOk = msLvOk(id), first = ch.steps[0], r = msReward(id, 0, false);
    say = L(...first.say);
    body = `<div class="sec">${L(ch.title[0], ch.title[1])}</div><div class="qbox"><p class="hint">${L(`แนะนำ Lv ${msLv(id)}+ · 3 ขั้น · ชิ้นแฟชั่นตอนจบ: ${msPieceName(ch.cos)}`, `Suggested Lv ${msLv(id)}+ · 3 steps · wardrobe piece at the end: ${msPieceName(ch.cos)}`)}</p>
      <div class="qg"><span>${msGoalTxt(first)}</span><b>×${msNeed(first)}</b></div><small>${L('รางวัลขั้นแรก', 'First step')}: ${msRewardTxt(r)}</small>
      <button class="btn gold wide" data-msacc="${id}" ${lvOk ? '' : 'disabled'}>${lvOk ? L('รับเรื่องนี้', 'Take this tale') : L(`ต้อง Lv ${Math.max(1, msLv(id) - 5)}`, `Needs Lv ${Math.max(1, msLv(id) - 5)}`)}</button></div>${prog}`; }
  npcFrame(n, say, body);
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-msacc],[data-msturn]'); if (!b || b.disabled) return;
  const id = el('dialog').dataset.npc; if (b.dataset.msacc) msAccept(+b.dataset.msacc); else msHandIn();
  const n = NPCS.find(x => x.id === id); if (n) msOpenNpc(n); });

/* ---------- '!' and '?' over their heads, and the HUD tracker line ---------- */
{ const _m = npcMark;
  npcMark = function(n){ const r = _m.apply(this, arguments); if (r || !n || !n.ms) return r;
    const s = msS(), c = s.cur, ch = MS_CH[MAP_ID]; if (!ch) return '';
    const giver = ch.npc.id === n.id;
    if (c && c.map === MAP_ID && giver && msReady()) return '?';
    if (!c && giver && msOpen(MAP_ID) && msLvOk(MAP_ID)) return '!';
    return ''; }; }
{ const _q = questTracker;
  questTracker = function(){ const r = _q.apply(this, arguments), c = msS().cur; if (!c) return r; const st = msStep(), ch = MS_CH[c.map];
    const line = `<span class="${msReady() ? 'qok' : ''}">📖 ${L(ch.title[0], ch.title[1])}: ${msGoalTxt(st)} ${msHave(st)}/${msNeed(st)}${msReady() ? ' · ' + L(`กลับไปหา${ch.npc.name}`, `back to ${ch.npc.en}`) : c.map !== MAP_ID ? ' · ' + L(MAPS[c.map].name, MAPS[c.map].en) : ''}</span>`;
    return r ? r + '<br>' + line : line; }; }

/* ---------- hunting, finding and the elite ---------- */
EV.on('kill', m => { const s = msS(), c = s.cur, st = msStep(); if (!c || !st || !m) return;
  if (m.msElite && st.k === 'elite' && c.map === MAP_ID){ c.elite = 1; MS.eliteM = null; toast(L(`ปราบ ${st.name[0]} แล้ว! กลับไปหา${MS_CH[c.map].npc.name}`, `${st.name[1]} defeated! Go back to ${MS_CH[c.map].npc.en}`)); SFX.play('quest'); dirty = true; return; }
  if (st.k === 'kill' && m.type === st.t && (c.n || 0) < st.n){ c.n = (c.n || 0) + 1; if (c.n === st.n) toast(L(`ครบแล้ว! กลับไปหา${MS_CH[c.map].npc.name}`, `Done! Go back to ${MS_CH[c.map].npc.en}`)); dirty = true; } });
EV.on('tick', () => { const s = msS(), c = s.cur, st = msStep(); if (!c || !st || c.map !== MAP_ID || MS.map !== MAP_ID || P.dead) return;
  if (typeof DG !== 'undefined' && DG.active) return;
  if (st.k === 'find'){ c.found = c.found || [];
    MS.spots.forEach((p, i) => { if (c.found.includes(i) || c.found.length >= st.n || Math.hypot(P.x - p.x, P.y - p.y) > 38) return;
      c.found.push(i); SFX.play('pickup'); VFX.play('coins', {x:p.x, y:p.y - 20});
      toast(L(`พบ${st.what[0]} ${c.found.length}/${st.n}`, `Found: ${st.what[1]} ${c.found.length}/${st.n}`)); dirty = true; }); }
  if (st.k === 'elite' && !c.elite && MS.elite && MOB[st.t] && !(MS.eliteM && !MS.eliteM.dead && mobs.includes(MS.eliteM))){
    const m = spawnMob(st.t, MS.elite.x, MS.elite.y, {zone:MAPZ}); if (typeof makeElite === 'function') makeElite(m);
    const k = st.hp || 1.5; m.maxhp = Math.round(m.maxhp * k); m.hp = m.maxhp; m.msElite = true; m.tagTxt = st.name; MS.eliteM = m;
    if (!MS.eliteT || T - MS.eliteT > 20){ MS.eliteT = T; banner(L(`✦ ${st.name[0]} ปรากฏตัวแล้ว!`, `✦ ${st.name[1]} has appeared!`)); VFX.play('bossArrive', {x:m.x, y:m.y}); } } });

/* glowing spots on the ground for the find steps */
{ const _u = LIVE.drawUnder;
  LIVE.drawUnder = function(g, ...a){ const r = _u.call(this, g, ...a);
    try { const c = msS().cur, st = msStep(); if (c && st && st.k === 'find' && c.map === MAP_ID && MS.map === MAP_ID){
      MS.spots.forEach((p, i) => { if ((c.found || []).includes(i)) return; const x = p.x - cam.x, y = p.y - cam.y; if (x < -60 || y < -60 || x > VW + 60 || y > VH + 60) return;
        const pu = .7 + Math.sin(T * 3 + i) * .3; g.save(); g.globalCompositeOperation = 'lighter';
        const gr = g.createRadialGradient(x, y, 0, x, y, 26); gr.addColorStop(0, `rgba(255,230,140,${.55 * pu})`); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, 26, 11, 0, 0, 7); g.fill();
        g.strokeStyle = `rgba(255,236,170,${.7 * pu})`; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, 14 + pu * 4, (14 + pu * 4) * .4, 0, 0, 7); g.stroke();
        for (let k = 0; k < 6; k++){ const ph = (T * .7 + k / 6 + i * .13) % 1, ax = x + Math.sin(k * 2.4 + i) * 12; g.fillStyle = `rgba(255,240,180,${(1 - ph) * .9})`; g.fillRect(ax, y - ph * 30, 1.6, 1.6); }
        g.fillStyle = `rgba(255,250,220,${pu})`; g.font = '700 13px sans-serif'; g.textAlign = 'center'; g.fillText('✦', x, y - 14 - pu * 3); g.restore(); }); } } catch (e) {}
    return r; }; }
/* stars on the minimap: find spots and the elite */
{ const _d = drawMini;
  drawMini = function(){ _d.apply(this, arguments); try { const c = msS().cur, st = msStep(); if (!c || !st || c.map !== MAP_ID || MS.map !== MAP_ID || el('mapCard').classList.contains('folded')) return;
    const mm = el('minimap'), g = mm.getContext('2d'), kx = mm.width / W, ky = mm.height / H, u = mm.width / 170, pts = [];
    if (st.k === 'find') MS.spots.forEach((p, i) => { if (!(c.found || []).includes(i)) pts.push(p); });
    if (st.k === 'elite' && !c.elite){ const m = MS.eliteM; pts.push(m && !m.dead ? m : MS.elite); }
    for (const p of pts){ const x = p.x * kx, y = p.y * ky, s = (3.4 + Math.sin(T * 5) * .6) * u; g.save(); g.translate(x, y); g.beginPath();
      for (let k = 0; k < 10; k++){ const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? s * .45 : s; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath();
      g.fillStyle = '#ffe27a'; g.strokeStyle = 'rgba(60,30,0,.9)'; g.lineWidth = u * .8; g.fill(); g.stroke(); g.restore(); } } catch (e) {} }; }

/* ---------- story NPCs wear their back pieces too ---------- */
{ const _n = drawNpcW;
  drawNpcW = function(g, n){ const d = n && n.ms ? [...MS_ARCS.flatMap(a => [a.comp, a.extra].filter(Boolean)), ...Object.values(MS_CH).map(c => c.npc)].find(x => x.id === n.id) : null, wg = d && d.wing && WINGS[d.wing] ? d.wing : null;
    if (!wg) return _n.apply(this, arguments);
    const x = n.x - cam.x, y = n.y - cam.y, near = Math.hypot(P.x - n.x, P.y - n.y) < 110, dir = near ? SPR.dirFromVec(P.x - n.x, P.y - n.y) : 0;
    drawWings(g, wg, x, y, dir, T + n.x * .01, {part:'back'}); const r = _n.apply(this, arguments); drawWings(g, wg, x, y, dir, T + n.x * .01, {part:'front'}); return r; }; }

/* ---------- the road's title ---------- */
if (typeof ACH !== 'undefined' && typeof ACH_BY !== 'undefined') for (const arc of MS_ARCS){ if (!arc.title_id || ACH_BY[arc.title_id]) continue;
  const a = {id:arc.title_id, cat:'story', tier:3, th:arc.titleName[0], en:arc.titleName[1], dth:`จบเนื้อเรื่องเสริม «${arc.title[0]}» ทั้ง ${arc.maps.length} บท`, den:`Finish all ${arc.maps.length} chapters of «${arc.title[1]}»`,
    prog:() => [arc.maps.filter(m => msS().done[m]).length, arc.maps.length], coin:20, title:arc.titleName};
  ACH.push(a); ACH_BY[a.id] = a; }

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'mapstory', t:['เนื้อเรื่องเสริมตามแผนที่', 'Map stories'], b:() => `<p>${L('แต่ละแผนที่มี NPC ที่มีเรื่องราวของตัวเอง (ป้าย ✦ เหนือหัว) เรื่องต่อกันเป็นสาย ทำทีละบทตามลำดับ บทละ 3 ขั้น: ล่า · ตามหาจุดเรืองแสง ✦ หรือเก็บของ · ปราบมอนสเตอร์มีชื่อ ส่งแต่ละขั้นกับ NPC เพื่อฟังเรื่องต่อ จบบทได้ชิ้นแฟชั่นที่ NPC คนนั้นใส่ จบทั้งสายได้ฉายาและสัตว์ขี่', 'Every map has an NPC with a tale of their own (a ✦ tag over the head). The tales run on as a road, one chapter after another, three steps each: hunt · find glowing ✦ spots or gather · defeat a named monster. Hand each step back to hear what happens next; a chapter ends with the wardrobe piece that NPC wears, and a whole road with a title and a mount.')}</p>
  ${MS_ARCS.map(a => `<p><b>${L(a.title[0], a.title[1])}</b> — ${L(a.blurb[0], a.blurb[1])}: ${a.maps.map(m => L(MAPS[m].name, MAPS[m].en)).join(' → ')}</p>`).join('')}`});
