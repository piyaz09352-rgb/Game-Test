/* VAYRATHEN — js/sys/fishing.js — fishing at any water, and food from the catch
   Stand at a shore (pond, river, lake, waterfall pool) with no monster on you and a 🎣 button appears.
   Cast → the float bobs → when it dips with a "!" press again within a second to strike. Each region's water
   has its own fish; rarer ones in harder regions. Sell fish at the market, or have Cook Saijai at any camp
   cook them into dishes with a 3-minute buff (one dish at a time). */
'use strict';

Object.assign(ITEMS, {
  fish_tilapia:{name:'ปลานิล', en:'Tilapia', sell:25, kind:'etc', desc:['ปลาน้ำจืดทั่วไป', 'A common freshwater fish']},
  fish_catfish:{name:'ปลาดุก', en:'Catfish', sell:45, kind:'etc', desc:['ชอบน้ำนิ่ง', 'Likes still water']},
  fish_snakehead:{name:'ปลาช่อน', en:'Snakehead', sell:70, kind:'etc', desc:['นักล่าในหนองน้ำ', 'A marsh predator']},
  fish_giantcat:{name:'ปลาบึก', en:'Giant Catfish', sell:600, kind:'etc', desc:['ปลายักษ์หายาก', 'A rare giant']},
  fish_goldkoi:{name:'ปลาทองพระอินทร์', en:"Indra's Golden Koi", sell:2500, kind:'etc', desc:['ตำนานแห่งสระสวรรค์', 'A legend of the heavenly pools']},
  junk_boot:{name:'รองเท้าเก่า', en:'Old Boot', sell:1, kind:'etc', desc:['…ไม่ใช่ปลา', '…not a fish']},
  f_grill:{name:'ปลานิลเผาเกลือ', en:'Salt-grilled Tilapia', kind:'use', food:{regenPct:.03, every:4}, desc:['ฟื้น HP 3% ทุก 4 วิ · 3 นาที', '+3% HP every 4 s · 3 min']},
  f_larb:{name:'ลาบปลาดุก', en:'Catfish Larb', kind:'use', food:{def:12}, desc:['DEF +12 · 3 นาที', 'DEF +12 · 3 min']},
  f_tomyum:{name:'ต้มยำปลาช่อน', en:'Snakehead Tom Yum', kind:'use', food:{atkPct:.08}, desc:['ATK +8% · 3 นาที', 'ATK +8% · 3 min']},
  f_feast:{name:'ปลาบึกนึ่งสมุนไพร', en:'Herb-steamed Giant Catfish', kind:'use', food:{atkPct:.12, regenPct:.02, every:4}, desc:['ATK +12% และฟื้น HP · 3 นาที', 'ATK +12% and regen · 3 min']}
});
BUFF_TH.food = ['อาหาร', 'Food']; if (typeof BUFF_CAP !== 'undefined') BUFF_CAP.food = ['อิ่ม', 'FED'];
{
  const _u = useItem;
  useItem = function(id){
    const it = ITEMS[id]; if (!it || !it.food || !S.inv[id] || P.dead) return _u(id);
    addBuff('food', {t:180, ...it.food, name:it.name}); S.inv[id]--; if (!S.inv[id]) delete S.inv[id];
    addText(P.x, P.y - 54, L(`อร่อย! ${it.name}`, `Yum! ${it.en}`), '#ffd890', 12); SFX.play('pot_hp', {tier:2}); dirty = true;
  };
}
/* where can we fish from here? returns the float spot on the water */
function fishSpot(){
  if (typeof WATERS === 'undefined') return null;
  for (const w of WATERS){ if (w.kind && w.kind !== 'water') continue;
    if (w.k === 'band'){ const m = (w.y0 + w.y1) / 2; if (P.y > w.y0 - 70 && P.y < w.y0 + 6) return {x:P.x + (P.face || 1) * 10, y:w.y0 + 26}; if (P.y < w.y1 + 70 && P.y > w.y1 - 6) return {x:P.x + (P.face || 1) * 10, y:w.y1 - 26}; continue; }
    const dx = (P.x - w.x) / w.rx, dy = (P.y - w.y) / w.ry, d = Math.hypot(dx, dy); if (d > .9 && d < 1.55){ const k = .62 / d; return {x:w.x + dx * k * w.rx, y:w.y + dy * k * w.ry}; } }
  return null;
}
const FISH = {st:null, t:0, wait:0, spot:null, near:null, chk:0};
const fishBusy = () => mobs.some(m => !m.dead && m.aggro && Math.hypot(m.x - P.x, m.y - P.y) < 260);
function fishTable(){
  const lv = MAP_ID === 0 ? 1 : (MAPS[MAP_ID].lv || [1])[0];
  return [['junk_boot', 6], ['fish_tilapia', 46], ['fish_catfish', 26], ['fish_snakehead', 16 + lv / 10], ['fish_giantcat', 2 + lv / 25], ['fish_goldkoi', lv >= 100 ? 1.2 : .25]];
}
function fishRoll(){ const t = fishTable(), sum = t.reduce((a, b) => a + b[1], 0); let r = Math.random() * sum; for (const [id, w] of t){ r -= w; if (r <= 0) return id; } return t[1][0]; }
function fishAct(){
  if (P.dead || PAUSED) return;
  if (!FISH.st){ const sp = fishSpot(); if (!sp || fishBusy()) return; P.tx = null; P.target = null; P.sit = false; P.ride = false; P.dir = SPR.dirFromVec(sp.x - P.x, sp.y - P.y); FISH.st = 'wait'; FISH.t = 0; FISH.wait = 2 + Math.random() * 4; FISH.spot = sp; FISH.px = P.x; FISH.py = P.y; SFX.play('swing'); fishBtn(); return; }
  if (FISH.st === 'wait'){ toast(L('ยังไม่กินเบ็ด… ใจเย็น ๆ', 'Nothing yet… patience')); FISH.wait += .8; return; }
  if (FISH.st === 'bite'){ const id = fishRoll(); addItem(id, 1); FISH.st = null; bump('fish');
    const it = ITEMS[id], rare = it.sell >= 500; addText(P.x, P.y - 60, `${rare ? '★ ' : ''}${nm(it)}`, rare ? '#ffd34a' : '#bfe8ff', rare ? 15 : 12);
    if (rare){ banner(L(`ได้${it.name}! ตกปลาได้ของหายาก`, `Caught a ${it.en}!`)); VFX.play('refine', {x:FISH.spot.x, y:FISH.spot.y, ok:true}); }
    VFX.play('splash', {x:FISH.spot.x, y:FISH.spot.y}); SFX.play('pickup'); fishBtn(); }
}
EV.on('tick', dt => {
  FISH.chk -= dt;
  if (FISH.st){ FISH.t += dt;
    if (P.dead || Math.hypot(P.x - FISH.px, P.y - FISH.py) > 6 || fishBusy()){ FISH.st = null; fishBtn(); return; }
    if (FISH.st === 'wait' && FISH.t > FISH.wait){ FISH.st = 'bite'; FISH.t = 0; SFX.play('chat'); fishBtn(); }
    else if (FISH.st === 'bite' && FISH.t > 1.1){ FISH.st = 'wait'; FISH.t = 0; FISH.wait = 2 + Math.random() * 3; toast(L('ปลาหลุด! รอตัวใหม่…', 'It got away! Waiting again…')); fishBtn(); } }
  if (FISH.chk <= 0){ FISH.chk = .25; const nw = !P.dead && !fishBusy() && !!fishSpot(); if (nw !== FISH.near){ FISH.near = nw; fishBtn(); } }
});
function fishBtn(){
  let b = el('fishBtn'); const show = FISH.near || FISH.st;
  if (!show){ if (b) b.hidden = true; return; }
  if (!b){ b = document.createElement('button'); b.id = 'fishBtn'; b.className = 'fishbtn'; el('ui').appendChild(b); b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); fishAct(); }); }
  b.hidden = false; b.classList.toggle('bite', FISH.st === 'bite');
  b.textContent = FISH.st === 'bite' ? L('❗ ดึง!', '❗ Strike!') : FISH.st === 'wait' ? L('🎣 รอปลา…', '🎣 Waiting…') : L('🎣 ตกปลา', '🎣 Fish');
}
/* the line and float */
{
  const _ents = LIVE.ents;
  LIVE.ents = function(list, g){ _ents(list, g); if (!FISH.st || !FISH.spot) return; const s = FISH.spot;
    list.push({y:s.y, f:() => { const x = s.x - cam.x, bob = FISH.st === 'bite' ? Math.sin(T * 30) * 2 + 2 : Math.sin(T * 3) * .8, y = s.y - cam.y + bob, hx = P.x - cam.x + (P.face || 1) * 6, hy = P.y - cam.y - 34;
      g.strokeStyle = 'rgba(240,240,230,.7)'; g.lineWidth = .5; g.beginPath(); g.moveTo(hx, hy - 8); g.quadraticCurveTo((hx + x) / 2, Math.max(hy, y) + 6, x, y - 3); g.stroke();
      g.strokeStyle = '#5a3a1a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(P.x - cam.x, P.y - cam.y - 20); g.lineTo(hx, hy - 8); g.stroke();
      g.fillStyle = '#e83a2a'; g.beginPath(); g.arc(x, y - 3, 2.2, Math.PI, 0); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y - 3, 2.2, 0, Math.PI); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = .6; const r = 4 + (T * 6 % 6); g.beginPath(); g.ellipse(x, y, r, r * .4, 0, 0, 7); g.stroke();
      if (FISH.st === 'bite'){ g.fillStyle = '#ffd34a'; g.font = '700 14px Mali, sans-serif'; g.textAlign = 'center'; g.fillText('!', x, y - 12); } }}); };
}
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'fish', t:['ตกปลาและทำอาหาร', 'Fishing & cooking'], b:() => `<p>${L('เดินไปริมน้ำ (สระ แม่น้ำ แอ่งน้ำตก) ตอนไม่มีมอนไล่ แล้วกดปุ่ม 🎣 · ทุ่นจมพร้อม ! ให้กดดึงภายใน 1 วินาที · ปลา: ปลานิล ปลาดุก ปลาช่อน ปลาบึก (หายาก) ปลาทองพระอินทร์ (ตำนาน) · ขายที่ตลาด หรือให้แม่ครัวสายใจที่แคมป์ทำอาหาร: ปลาเผา (ฟื้น HP) ลาบ (DEF) ต้มยำ (ATK) ปลาบึกนึ่ง (ATK + ฟื้น) บัฟ 3 นาที', 'Walk to a shore (pond, river, waterfall pool) with no monster on you and press 🎣 · when the float dips with ! strike within a second · fish: tilapia, catfish, snakehead, giant catfish (rare), Indra\'s golden koi (legendary) · sell them at the market or let Cook Saijai at a camp cook them: grilled (regen), larb (DEF), tom yum (ATK), steamed giant catfish (ATK + regen), 3-minute buffs')}</p>`});
