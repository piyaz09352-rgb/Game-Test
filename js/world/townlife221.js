/* VAYRATHEN — js/world/townlife221.js — (v221) town life: townsfolk, night lights, the post riders
   The four crossroads towns and Aren felt empty: only the shopkeepers standing at their doors. Now:
   · TOWNSFOLK walk the streets and the square, stop at a shop door, look at you as you pass and say a line now and
     then (each town its own people, dressed for its place: harbour merchants, caravan folk, highlanders, devas).
     After dark most go home; the few still out carry a little lantern.
   · NIGHT LIGHTS: in a town after dark every lamp, lit window and lantern throws a warm glow on the ground.
   · THE POST RIDERS (ไปรษณีย์ม้าเร็ว): a clerk in Aren and in every town hands you a parcel for another post office.
     Ride it over and hand it to the clerk there: Bia and EXP by the length of the ride (5 parcels a day). The quest
     arrow and the quest log follow the parcel, and Auto quest can carry it too. 20 parcels → title «ม้าเร็ววายรา».
   Saved per character: S.tl = {job:{from, to, at}, day, n} · total deliveries in the stats (deliveries). */
'use strict';

/* ---------- townsfolk ---------- */
SPR.CHARS.tl_folk = {...SPR.CHARS.ms_npc, name:'ชาวเมือง', en:'Townsfolk'}; SPR.CHAR_ACTIONS.tl_folk = ['idle', 'walk'];
// per place (0 = Aren, then the towns in TOWNS order): outfits, hats, hair colours, and what they say
const TL_PLACES = [
  {tops:['s_siam', 's_lanna', 's_sakura', 'a_cotton'], heads:['hc_hide', 'f_clip', 'f_bow', 'hc_hide'], hair:['hairBlack', 'hairBrown', 'hairChestnut', 'hairWhite'],
    say:[['วันนี้ตลาดคึกคักจริง ๆ', 'The market is busy today'], ['ได้ยินว่าทางตะวันออกมีโคมลอยตกเต็มทุ่งเลย', 'They say the east fields are full of fallen lanterns'], ['ครูวายราดุจังเลย แต่ใจดีนะ', 'Master Vayra looks stern, but he is kind'],
      ['ไปรษณีย์ม้าเร็วรับคนส่งของอยู่นะ ค่าแรงดีด้วย', 'The post riders are hiring, and they pay well'], ['ข้าวมันไก่ร้านป้ามะลิอร่อยที่สุดในนคร', 'Auntie Mali\'s chicken rice is the best in the city'], ['อย่าลืมกินยาก่อนออกล่านะ', 'Drink a potion before you go hunting']]},
  {tops:['s_siam', 's_sakura', 'a_cotton', 's_rune'], heads:['f_clip', 'hc_hide', 'f_bow', 'hc_hide'], hair:['hairBlack', 'hairBlack', 'hairBrown', 'hairWhite'],
    say:[['เรือสำเภาลำใหม่เพิ่งเข้าท่า ขนชามากันเต็มลำ', 'A new junk just docked, packed with tea'], ['ซื้อผ้าไหมไหม ราคาท่าเรือ ถูกกว่าในนคร', 'Silk? Harbour prices, cheaper than the capital'], ['ลมทะเลวันนี้หอมเครื่องเทศ', 'The sea wind smells of spice today'],
      ['ก๋วยเตี๋ยวเรือเจ๊หงส์ ต้องลองนะ', 'You must try Jae Hong\'s boat noodles'], ['โคมแดงพวกนี้แขวนไว้กันโชคร้าย', 'These red lanterns keep bad luck away']]},
  {tops:['s_desert', 's_star', 'a_cotton', 's_lava'], heads:['hc_hide', 'k_veil', 'hc_hide', 'f_clip'], hair:['hairBlack', 'hairBrown', 'hairSilver', 'hairBlack'],
    say:[['คาราวานจากทะเลทรายมาถึงเมื่อเช้า อูฐเหนื่อยกันหมด', 'A caravan came in from the sands this morning; the camels are worn out'], ['ดื่มชาอินทผลัมสิ ช่วยให้ไม่ร้อน', 'Have some date tea, it keeps the heat off'],
      ['หินทรายพวกนี้แกะสลักมาตั้งแต่สมัยขอม', 'This sandstone was carved in the old Khmer days'], ['ระวังพายุทรายตอนบ่ายนะ', 'Mind the sandstorms in the afternoon'], ['ผ้าคลุมหน้ากันทรายเข้าปากได้ดีนัก', 'A veil keeps the sand out of your mouth']]},
  {tops:['s_lanna', 's_forest', 'a_cotton', 's_knight'], heads:['hc_hide', 'f_clip', 'hc_hide', 'hc_hide'], hair:['hairBlack', 'hairBrown', 'hairWhite', 'hairBlack'],
    say:[['หนาวเจ้า ใส่ผ้าห่มหนา ๆ เน้อ', 'It\'s cold, wrap up warm'], ['ธงมนต์ปลิวแรงแบบนี้ หิมะคงจะตกคืนนี้', 'With the prayer flags flapping like that, it will snow tonight'], ['แม่อุ๊ยทำข้าวซอยหอมไปทั้งเวียง', 'Grandma Ui\'s khao soi smells all over town'],
      ['ผ้าทอลายดอยนี่ทอมือทุกผืนเจ้า', 'Every highland weave is made by hand'], ['ขึ้นดอยไปทางเหนือระวังลมหนาวนะ', 'Mind the cold wind if you climb north']]},
  {tops:['s_seraph', 's_lotus', 's_aurora', 's_garuda'], heads:['h_halo', 'h_wreathg', 'hc_hide', 'h_halo'], hair:['hairGold', 'hairWhite', 'hairSky', 'hairGold'],
    say:[['ยินดีต้อนรับสู่นครเทวาลัย มนุษย์ผู้กล้า', 'Welcome to the Deva City, brave mortal'], ['เสียงพิณของคนธรรพ์ไพเราะนักใช่ไหม', 'The gandharva\'s harp is lovely, isn\'t it?'], ['เลยประตูไปคือป่าหิมพานต์ ระวังตัวด้วย', 'Past the gate lies Himmapan; take care'],
      ['ดอกบัวทิพย์บานทั้งปีไม่มีโรย', 'The divine lotus blooms all year and never fades'], ['เมฆวันนี้นุ่มเป็นพิเศษ', 'The clouds are extra soft today']]}
];
const TL_NIGHT = [['ดึกแล้ว รีบกลับบ้านดีกว่า', 'It\'s late, I\'d better head home'], ['คืนนี้ดาวสวยจัง', 'Lovely stars tonight'], ['ถือโคมไว้ จะได้ไม่หลงทาง', 'I carry a lantern so I don\'t get lost']];
const tlPlace = id => (id === 0 ? 0 : TOWN_OF[id] ? TOWNS.indexOf(TOWN_OF[id]) + 1 : -1);
const TL = {map:-1, folk:[], pts:[], say:[]};
function tlRng(seed){ let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
/* where people like to go: the square, the streets near the middle, the shop doors */
function tlPoints(id){
  const pts = [], r = tlRng(id * 131 + 7), ok = (x, y) => x > 60 && y > 80 && x < W - 60 && y < H - 60 && walkable(x, y, 10);
  if (id === 0){
    for (const n of NPCS) if (!n.tw && Math.hypot(n.x - VSPAWN.x, n.y - VSPAWN.y) < 700){ const x = n.x + (r() - .5) * 60, y = n.y + 44 + r() * 20; if (ok(x, y)) pts.push({x, y, door:true}); }
    for (let t = 0; t < 400 && pts.length < 46; t++){ const x = VSPAWN.x + (r() - .5) * 1100, y = VSPAWN.y + (r() - .5) * 760; if (ok(x, y) && inVillage({x, y})) pts.push({x, y}); }
  } else {
    const cx = W * .5, cy = H * .5, k = id * .37;
    for (const p of Object.values(TW_LAY.pos || {})){ const x = p[0] + (r() - .5) * 40, y = p[1] + 40; if (ok(x, y)) pts.push({x, y, door:true}); }
    for (let t = 0; t < 600 && pts.length < 40; t++){ const a = r() * 6.283, d = Math.sqrt(r()) * twPaveR(a, k) * .95, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d / 1.32; if (ok(x, y)) pts.push({x, y}); }
    for (const tr of TRAIL.lines) tr.forEach(([x, y], i) => { if (i % 6 || Math.hypot(x - cx, y - cy) > 1000) return; if (ok(x, y)) pts.push({x, y}); });
  }
  return pts;
}
function tlSetup(id){
  TL.map = id; TL.folk = []; TL.say = []; const pi = tlPlace(id); if (pi < 0) return;
  const pl = TL_PLACES[pi], r = tlRng(id * 977 + 3); TL.pts = tlPoints(id); if (TL.pts.length < 4) return;
  // (v222) a lighter crowd: fewer people sharing fewer looks (every look is a sprite sheet to paint and keep), none at the Low preset
  if (typeof GFX !== 'undefined' && GFX.preset === 'low') return;
  const n = id === 0 ? 6 : 7;
  // four looks per place, shared (each look is one sprite sheet to build: a crowd of unique faces would stall the frame)
  const looks = [0, 1, 2].map(j => ({job:'tl_folk', look:{sex:j % 2 ? 'm' : 'f', hair:[5, 3, 17, 6][j], color:pl.hair[j]}, gear:{armor:pl.tops[j], head:pl.heads[j]}}));
  for (let i = 0; i < n; i++){ const p = TL.pts[(r() * TL.pts.length) | 0];
    TL.folk.push({x:p.x, y:p.y, tx:null, ty:null, wait:r() * 4, spd:30 + r() * 16, dir:(r() * 8) | 0, animT:r() * 5, moving:false, sayCd:4 + r() * 10, home:r() < .65, lamp:r() < .5, i,
      tw:looks[i % 3]}); }
}
function tlSay(w, line){ TL.say = TL.say.filter(s => s.w !== w); TL.say.push({w, s:L(line[0], line[1]), t:3.2}); }
function tlUpd(dt){
  if (tlPlace(MAP_ID) < 0){ if (TL.map !== -1){ TL.map = -1; TL.folk = []; } return; }
  if (TL.map !== MAP_ID) tlSetup(MAP_ID);
  const night = isNight(), pl = TL_PLACES[tlPlace(MAP_ID)];
  for (const w of TL.folk){
    w.animT += dt; w.sayCd -= dt; w.out = !(night && w.home);   // after dark the ones who live here are indoors
    if (!w.out){ w.moving = false; continue; }
    const dP = Math.hypot(P.x - w.x, P.y - w.y);
    if (dP < 64 && !P.ride){ w.moving = false; w.dir = SPR.dirFromVec(P.x - w.x, P.y - w.y); if (w.sayCd <= 0 && Math.random() < .5){ tlSay(w, night ? TL_NIGHT[(Math.random() * TL_NIGHT.length) | 0] : pl.say[(Math.random() * pl.say.length) | 0]); w.sayCd = 22 + Math.random() * 20; } else if (w.sayCd <= 0) w.sayCd = 8; continue; }
    if (w.wait > 0){ w.wait -= dt; w.moving = false; continue; }
    if (w.tx == null){ const p = TL.pts[(Math.random() * TL.pts.length) | 0]; w.tx = p.x + (Math.random() - .5) * 20; w.ty = p.y + (Math.random() - .5) * 14; w.door = p.door; }
    const ox = w.x, oy = w.y, there = navTo(w, w.tx, w.ty, w.spd, dt, 4);
    if (w.navFail){ w.navFail = false; w.tx = null; w.wait = 1; continue; }
    if (there){ w.tx = null; w.moving = false; w.wait = w.door ? 3 + Math.random() * 5 : 1.5 + Math.random() * 4; if (w.door) w.dir = 4; continue; }
    w.moving = Math.hypot(w.x - ox, w.y - oy) > .01; if (w.moving) w.dir = SPR.dirFromVec(w.x - ox, w.y - oy);
  }
  for (const s of TL.say) s.t -= dt; TL.say = TL.say.filter(s => s.t > 0);
}
const tlSheet = w => (typeof heroSheet === 'function' ? heroSheet(w.tw.job, w.tw.gear, w.tw.look) : null);
function tlLantern(g, x, y, t){ const b = Math.sin(t * 3) * 1.2; g.strokeStyle = '#4a2a10'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - 20); g.lineTo(x, y - 14 + b); g.stroke();
  g.fillStyle = '#ffcf6a'; g.beginPath(); g.ellipse(x, y - 10 + b, 3.4, 4.4, 0, 0, 7); g.fill(); g.fillStyle = '#c0391b'; g.fillRect(x - 3, y - 15 + b, 6, 1.6); g.fillRect(x - 3, y - 6.4 + b, 6, 1.6); }
// into the depth-sorted draw list (the same hook other heroes are drawn through)
{ const _dg = typeof drawGhostsInto === 'function' ? drawGhostsInto : null;
  drawGhostsInto = function(ents, g){ if (_dg) _dg.apply(this, arguments); if (TL.map !== MAP_ID) return; const night = isNight();
    for (const w of TL.folk){ if (!w.out) continue; const x = w.x - cam.x, y = w.y - cam.y; if (x < -60 || x > VW + 60 || y < -80 || y > VH + 40) continue;
      const sh = tlSheet(w); if (!sh) continue;
      ents.push({y:w.y, f:() => { shadowW(g, x, y, 8); SPR.draw(g, sh, w.moving ? 'walk' : 'idle', w.dir, w.animT, x, y); if (night && w.lamp) tlLantern(g, x + (w.dir >= 4 ? -9 : 9), y, w.animT); }}); } }; }

/* ---------- night lights: a warm glow over the darkness at every lamp, window and lantern in town ---------- */
const TL_GLOW = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,196,110,.55)'); gr.addColorStop(.45, 'rgba(255,150,60,.2)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; })();
{ const _dw = drawWeather;
  drawWeather = function(g){ const r = _dw.apply(this, arguments);
    if (typeof nightA === 'undefined' || nightA < .05 || tlPlace(MAP_ID) < 0) return r;
    const k = Math.min(1, nightA / .58); g.save(); g.globalCompositeOperation = 'lighter';
    const glow = (x, y, rad, a) => { if (x < -rad || y < -rad || x > VW + rad || y > VH + rad) return; g.globalAlpha = a * k; g.drawImage(TL_GLOW, x - rad, y - rad, rad * 2, rad * 2); };
    for (const p of PROPS){ if (p.x < cam.x - 200 || p.x > cam.x + VW + 200 || p.y < cam.y - 100 || p.y > cam.y + VH + 300) continue; const im = propImg(p.type, p.variant); if (!im.glow) continue;
      glow(p.x + im.glow[0] - cam.x, p.y + im.glow[1] - cam.y, im.glow[2] * 1.5, .75 + Math.sin(T * 2.3 + p.x * .05) * .08); }
    for (const w of TL.folk) if (w.out && w.lamp) glow(w.x - cam.x + (w.dir >= 4 ? -9 : 9), w.y - cam.y - 10, 34, .9);
    g.restore(); return r; }; }

/* ---------- the post riders ---------- */
const TL_POST = [   // [name, en, sex, hair, colour, top, head] per place, and the parcel each office sends
  {f:['เสมียนไปรษณีย์จิ๋ว', 'Post Clerk Jiw', 'f', 6, 'hairBrown', 's_siam', 'f_bow'], parcel:['จดหมายราชสำนัก', 'Royal Letters']},
  {f:['ไปรษณีย์ท่าเรืออาเหลียง', 'Harbour Postman Ah Liang', 'm', 3, 'hairBlack', 's_rune', 'hc_hide'], parcel:['ห่อชาจีนกล่องแดง', 'Red-box Tea Parcel']},
  {f:['นายด่านคาราวานซาฮิด', 'Caravan Courier Zahid', 'm', 5, 'hairBlack', 's_desert', 'k_veil'], parcel:['ม้วนผ้าไหมคาราวาน', 'Caravan Silk Bolt']},
  {f:['น้องไปรษณีย์ดอยคำแก้ว', 'Highland Courier Kham Kaew', 'f', 9, 'hairBlack', 's_lanna', 'f_clip'], parcel:['ห่อผ้าทอลายดอย', 'Highland Weave Bundle']},
  {f:['เทพนำสารวายุ', 'Wind Messenger Vayu', 'm', 12, 'hairSky', 's_garuda', 'h_halo'], parcel:['ดอกบัวทิพย์ในโถแก้ว', 'Divine Lotus in Glass']}
];
const TL_DAY_MAX = 5;
const tlPostMaps = () => [0, ...TOWNS.map(T0 => T0.id).filter(id => MAPS[id])];
TL_POST.forEach((p, i) => { ITEMS[`tl_parcel${i}`] = {name:`พัสดุ: ${p.parcel[0]}`, en:`Parcel: ${p.parcel[1]}`, kind:'key', sell:0, desc:['พัสดุของไปรษณีย์ม้าเร็ว นำไปส่งให้เสมียนไปรษณีย์ที่ปลายทาง', 'A post-rider parcel. Hand it to the post clerk at its destination.']}; });
const tlS = () => { const o = S.tl = S.tl && typeof S.tl === 'object' ? S.tl : {}; if (o.day !== dayKey()){ o.day = dayKey(); o.n = 0; } if (o.job && (!MAPS[o.job.to] || tlPlace(o.job.to) < 0)) o.job = null; return o; };
/* how many map crossings between two places */
function tlHops(a, b){ const seen = {[a]:0}, q = [a]; while (q.length){ const m = q.shift(); if (m === b) return seen[m]; for (const d in (MAPS[m] || {}).links || {}){ const t = MAPS[m].links[d]; if (t != null && seen[t] == null){ seen[t] = seen[m] + 1; q.push(t); } } } return 99; }
const tlLvOf = id => (id === 0 ? 1 : MAPS[id].lv[0]);
function tlReward(from, to){ const h = tlHops(from, to), lv = Math.max(tlLvOf(from), tlLvOf(to));
  return {h, bia:Math.round(h * (60 + lv * 10)), exp:Math.round(nextBase(Math.max(1, S.lvl)) * Math.min(.18, .025 * h))}; }
const tlCanGo = to => S.lvl >= tlLvOf(to) - 5;
function tlAccept(to){ const s = tlS(); if (s.job || s.n >= TL_DAY_MAX || !tlCanGo(to) || to === MAP_ID) return;
  const from = MAP_ID, pi = tlPlace(from); s.job = {from, to, item:`tl_parcel${pi}`}; addItem(s.job.item, 1);
  s.prevGuide = S.guide || null; S.guide = {kind:'post'}; dirty = true; save(); SFX.play('coin');
  toast(L(`รับพัสดุแล้ว · ส่งที่ ${MAPS[to].name}`, `Parcel taken · deliver to ${MAPS[to].en}`)); log(L(`ไปรษณีย์ม้าเร็ว: นำ${ITEMS[s.job.item].name}ไปส่งที่${MAPS[to].name}`, `Post riders: take the ${ITEMS[s.job.item].en} to ${MAPS[to].en}`), 'g'); }
function tlDeliver(){ const s = tlS(), j = s.job; if (!j || j.to !== MAP_ID) return false;
  const rw = tlReward(j.from, j.to); if (S.inv[j.item]) { S.inv[j.item]--; if (!S.inv[j.item]) delete S.inv[j.item]; }
  s.job = null; s.n = (s.n || 0) + 1; S.bia += rw.bia; if (typeof gainExp === 'function') gainExp(rw.exp, 0); bump('deliveries');
  if (S.guide && S.guide.kind === 'post') S.guide = s.prevGuide || null; s.prevGuide = null;
  SFX.play('coin'); VFX.play('coins', {x:P.x, y:P.y - 30}); dirty = true; save();
  toast(L(`ส่งพัสดุสำเร็จ! +${fmtN(rw.bia)} เบี้ย · +${fmtN(rw.exp)} EXP`, `Parcel delivered! +${fmtN(rw.bia)} Bia · +${fmtN(rw.exp)} EXP`)); log(L(`ส่งพัสดุสำเร็จ ได้ ${fmtN(rw.bia)} เบี้ย และ ${fmtN(rw.exp)} EXP`, `Parcel delivered: ${fmtN(rw.bia)} Bia and ${fmtN(rw.exp)} EXP`), 'g');
  return true; }
function tlCancel(){ const s = tlS(), j = s.job; if (!j) return; if (S.inv[j.item]){ S.inv[j.item]--; if (!S.inv[j.item]) delete S.inv[j.item]; } s.job = null; if (S.guide && S.guide.kind === 'post') S.guide = s.prevGuide || null; dirty = true; save(); }
// the clerk stands by the square (towns) or near the spawn (Aren), on open ground away from the other NPCs
function tlPostSpot(id){ const c = id === 0 ? {x:VSPAWN.x - 150, y:VSPAWN.y + 70} : {x:W * .5 + 150, y:H * .5 - 95};
  for (let t = 0; t < 80; t++){ const a = t * 2.4, d = t * 6, x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d * .7; if (walkable(x, y, 14) && !NPCS.some(n => Math.hypot(n.x - x, n.y - y) < 80) && !GATES.some(g => Math.hypot(g.x - x, g.y - y) < 160)) return {x, y}; }
  return c; }
{ const _s = setupNpcs;
  setupNpcs = function(id){ const r = _s.apply(this, arguments); const pi = tlPlace(id); if (pi < 0) return r;
    const f = TL_POST[pi].f, at = tlPostSpot(id);
    NPCS.push({id:'tl_post', name:f[0], en:f[1], role:'ไปรษณีย์ม้าเร็ว · ส่งของระหว่างเมือง', roleEn:'Post riders · Deliveries between towns', x:Math.round(at.x), y:Math.round(at.y),
      tw:{job:'ms_npc', look:{sex:f[2], hair:f[3], color:f[4]}, gear:{armor:f[5], head:f[6]}}});
    return r; }; }
NPC_OPEN.tl_post = n => {
  const s = tlS(), j = s.job, here = MAP_ID, left = TL_DAY_MAX - (s.n || 0);
  if (j && j.to === here){ tlDeliver(); npcFrame(n, L('ขอบใจมากที่ส่งมาถึงมือ! นี่ค่าแรงของเจ้า มีอีกห่อจะส่งไหม', 'Thank you for bringing it safe! Here is your pay. Another parcel?'), tlPostBody()); return; }
  npcFrame(n, j ? L(`ห่อของเจ้ายังต้องไปส่งที่${MAPS[j.to].name}นะ ลูกศรนำทางชี้ทางให้อยู่`, `Your parcel still needs to reach ${MAPS[j.to].en}; the quest arrow shows the way.`)
    : left > 0 ? L('ไปรษณีย์ม้าเร็วยินดีต้อนรับ! มีพัสดุรอส่งไปทุกเมือง ยิ่งไกลค่าแรงยิ่งดี', 'Welcome to the post riders! Parcels for every town; the farther, the better the pay.')
    : L('วันนี้พัสดุหมดแล้ว พรุ่งนี้มาใหม่นะ', 'No more parcels today; come back tomorrow.'), tlPostBody());
};
function tlPostBody(){ const s = tlS(), j = s.job, left = TL_DAY_MAX - (s.n || 0);
  if (j) return `<div class="sec">${L('พัสดุที่ถืออยู่', 'Parcel in hand')}</div><div class="shop"><div class="srow"><span class="ic">📦</span><div class="nm"><b>${nm(ITEMS[j.item])}</b><small>${L(`ส่งที่ ${MAPS[j.to].name}`, `To ${MAPS[j.to].en}`)}</small></div>
    <button class="btn sm" data-tlcancel="1">${L('ยกเลิก', 'Give up')}</button></div></div>`;
  const rows = tlPostMaps().filter(id => id !== MAP_ID).map(id => { const rw = tlReward(MAP_ID, id), ok = tlCanGo(id) && left > 0;
    return `<div class="srow${tlCanGo(id) ? '' : ' locked'}"><span class="ic">📦</span><div class="nm"><b>${L(MAPS[id].name, MAPS[id].en)}</b><small>${L(`ผ่าน ${rw.h} แผนที่ · ${fmtN(rw.bia)} เบี้ย · ${fmtN(rw.exp)} EXP`, `${rw.h} maps away · ${fmtN(rw.bia)} Bia · ${fmtN(rw.exp)} EXP`)}${tlCanGo(id) ? '' : ` · <span class="bad">Lv ${tlLvOf(id) - 5}+</span>`}</small></div>
      <button class="btn sm${ok ? ' gold' : ''}" data-tlgo="${id}" ${ok ? '' : 'disabled'}>${L('รับส่ง', 'Take')}</button></div>`; }).join('');
  return `<div class="sec">${L(`พัสดุรอส่ง · วันนี้เหลือ ${left}/${TL_DAY_MAX}`, `Parcels waiting · ${left}/${TL_DAY_MAX} left today`)}</div><div class="shop">${rows}</div>
    <p class="hint">${L(`ส่งครบ 20 ห่อได้ฉายา «ม้าเร็ววายรา» · ส่งแล้ว ${fmtN(stc().deliveries || 0)} ห่อ`, `Deliver 20 for the title «Vayra Rider» · delivered ${fmtN(stc().deliveries || 0)}`)}</p>`; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-tlgo],[data-tlcancel]'); if (!b || b.disabled) return;
  if (b.dataset.tlgo) tlAccept(+b.dataset.tlgo); else tlCancel();
  const n = NPCS.find(x => x.id === 'tl_post'); if (n) NPC_OPEN.tl_post(n); });
// the clerk's mark: «?» when your parcel is for this office, «!» while parcels are left today
{ const _m = npcMark; npcMark = function(n){ if (n && n.id === 'tl_post'){ const s = tlS(); return s.job ? (s.job.to === MAP_ID ? '?' : '') : (s.n || 0) < TL_DAY_MAX ? '!' : ''; } return _m.apply(this, arguments); }; }
// the quest arrow and the quest log follow the parcel
{ const _g = qgGoal; qgGoal = function(){ const g = qgS(); if (g && g.kind === 'post'){ const j = tlS().job; if (!j) return null;
    return {map:j.to, npc:'tl_post', label:[`ส่งพัสดุที่ ${MAPS[j.to].name}`, `Deliver the parcel to ${MAPS[j.to].en}`]}; } return _g.apply(this, arguments); }; }
{ const _rq = renderQuestLog; renderQuestLog = function(){ const r = _rq.apply(this, arguments); const pane = el('pane-quest'), j = S && tlS().job; if (!pane) return r;
    const o = pane.querySelector('.tlpost'); if (o) o.remove(); if (!j) return r;
    const box = `<div class="tlpost"><b>📦 ${L('ไปรษณีย์ม้าเร็ว', 'Post riders')}</b><small>${L(`นำ${ITEMS[j.item].name}ไปส่งที่${MAPS[j.to].name}`, `Take the ${ITEMS[j.item].en} to ${MAPS[j.to].en}`)}</small>
      <button class="btn sm${qgS() && qgS().kind === 'post' ? '' : ' gold'}" data-tlguide="1">${L('นำทาง', 'Guide me')}</button></div>`;
    const a = pane.querySelector('.qgauto'); if (a) a.insertAdjacentHTML('afterend', box); else pane.insertAdjacentHTML('afterbegin', box); return r; }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-tlguide]'); if (!b) return; const s = tlS(); if (!s.job) return; if (!(S.guide && S.guide.kind === 'post')){ s.prevGuide = S.guide || null; S.guide = {kind:'post'}; } dirty = true; renderQuestLog(); });
// Auto quest carries the parcel when the arrow is on it
if (typeof aqPlan === 'function'){ const _ap = aqPlan; aqPlan = function(){ const g = qgS(), j = S && tlS().job; if (g && g.kind === 'post' && j) return {mode:'talk', map:j.to, npc:'tl_post', act:() => { tlDeliver(); }}; return _ap.apply(this, arguments); }; }
// the title
if (typeof ACH !== 'undefined' && typeof ACH_BY !== 'undefined' && !ACH_BY.tl_rider){ const a = {id:'tl_rider', cat:'story', tier:2, th:'ม้าเร็ววายรา', en:'Vayra Rider', dth:'ส่งพัสดุไปรษณีย์ม้าเร็ว 20 ห่อ', den:'Deliver 20 post-rider parcels',
  prog:() => [Math.min(20, stc().deliveries || 0), 20], coin:10, title:['ม้าเร็ววายรา', 'Vayra Rider']}; ACH.push(a); ACH_BY[a.id] = a; }

/* ---------- the bubbles townsfolk say ---------- */
EV.on('draw', () => { if (!TL.say.length || TL.map !== MAP_ID) return; const z = typeof TAG_Z === 'function' ? TAG_Z() : 1; ctx.save(); ctx.font = `600 ${Math.round(11.5 * z)}px Sarabun,"Noto Sans Thai",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const s of TL.say){ const x = sx(s.w.x), y = sy(s.w.y - 52), w = ctx.measureText(s.s).width + 14 * z, h = 20 * z; if (x < -w || x > SW + w || y < -h || y > SH) continue;
    ctx.globalAlpha = Math.min(1, s.t * 2); ctx.fillStyle = 'rgba(255,252,240,.95)'; ctx.strokeStyle = 'rgba(120,80,30,.6)'; ctx.lineWidth = 1.2 * z;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - h / 2, w, h, 8 * z) : ctx.rect(x - w / 2, y - h / 2, w, h); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 4 * z, y + h / 2 - .5); ctx.lineTo(x, y + h / 2 + 5 * z); ctx.lineTo(x + 4 * z, y + h / 2 - .5); ctx.fill();
    ctx.fillStyle = '#4a3010'; ctx.fillText(s.s, x, y + .5); }
  ctx.restore(); });
EV.on('tick', dt => { try { tlUpd(dt); } catch (e) { TL.folk = []; } });
{ const st = document.createElement('style'); st.textContent = `#pane-quest .tlpost{display:flex;align-items:center;gap:8px;padding:7px 10px;margin:0 0 8px;border-radius:12px;background:linear-gradient(#fff6e6,#ffe9c4);border:1px solid #e0b46a}
  #pane-quest .tlpost b{white-space:nowrap;color:#7a4a10;font-size:13px}#pane-quest .tlpost small{flex:1;font-size:11.5px;color:#7a5a30}`; document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'post', t:['ไปรษณีย์ม้าเร็ว', 'Post riders'], b:() => `<p>${L(`เสมียนไปรษณีย์ม้าเร็วอยู่ในนครอาเรนและทุกเมืองรอยต่อ รับพัสดุไปส่งให้เสมียนที่เมืองปลายทาง ได้เบี้ยและ EXP ตามระยะทาง วันละ ${TL_DAY_MAX} ห่อ ส่งครบ 20 ห่อได้ฉายา «ม้าเร็ววายรา»`, `Post clerks in Aren and every crossroads town hand out parcels for the other offices: Bia and EXP by distance, ${TL_DAY_MAX} a day. Deliver 20 for the title «Vayra Rider».`)}</p>`});
