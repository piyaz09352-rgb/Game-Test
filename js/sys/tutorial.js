/* VAYRATHEN — js/sys/tutorial.js
   New-player tutorial. Starts for every newly created character (skippable at any time) and walks through:
   walking · attacking · picking up loot · stats · potions · the first quest · the world map · dailies.
   Each step shows a card above the hotbar, lights up the button it talks about and, for things in the world,
   draws a bouncing arrow over the monster or NPC. Steps finish by themselves when you do the thing.
   Finishing pays 1,000 Bia, 5 Red Potions and the title "Newcomer". */
'use strict';

const touchUI = () => el('ui').classList.contains('moba') || matchMedia('(pointer:coarse)').matches;
const TUT = [
  {t:['ยินดีต้อนรับสู่อาณาจักรวายรา!', 'Welcome to the realm of Vayra!'], d:['บทสอนสั้น ๆ จะพาเล่นเป็นทีละขั้น ทำครบรับ 1,000 เบี้ย ยา 5 ขวด และฉายา «ผู้มาใหม่»', 'A short step-by-step tutorial: finish it for 1,000 Bia, 5 potions and the title «Newcomer»'], next:true},
  {t:['เดิน', 'Walk'], d:() => touchUI() ? ['ลากจอยด้านซ้ายเพื่อเดิน หรือแตะพื้นที่อยากไป', 'Drag the left stick to walk, or tap where you want to go'] : ['คลิกพื้นที่อยากไปเพื่อเดิน', 'Click the ground to walk there'], init:s => { s.x = P.x; s.y = P.y; }, done:s => Math.hypot(P.x - s.x, P.y - s.y) > 120},
  {t:['โจมตี', 'Attack'], d:() => touchUI() ? ['แตะเจลลี่น้ำค้าง (ลูกศรสีทองชี้อยู่) หรือกดปุ่มโจมตีใหญ่', 'Tap a Dew Jelly (the gold arrow points at one) or press the big attack button'] : ['คลิกเจลลี่น้ำค้างที่ลูกศรสีทองชี้ ตัวละครจะเดินไปตีเอง', 'Click the Dew Jelly under the gold arrow: your hero walks over and attacks'], ev:'kill', arrow:'mob', hl:'#mobaAct'},
  {t:['เก็บของ', 'Pick up loot'], d:() => touchUI() ? ['แตะของที่ตกบนพื้นเพื่อเก็บ', 'Tap the item on the ground to pick it up'] : ['คลิกของที่ตกบนพื้น หรือกด Z เพื่อเก็บของใกล้ตัว', 'Click the drop on the ground, or press Z for the nearest one'], ev:'pickup', arrow:'loot'},
  {t:['ค่าสถานะ', 'Stats'], d:() => [`เปิดหน้า Status ${touchUI() ? '(ปุ่มเมนูขวาบน)' : '(กด A)'} แล้วกด + เพิ่ม STR หรือ DEX สักแต้ม จากนั้นกด «ยืนยัน»`, `Open Status ${touchUI() ? '(menu, top right)' : '(press A)'}, press + on STR or DEX, then «Confirm»`], hl:'.mb[data-win="stat"]', stat:1, init:s => { s.p = S.statPts; }, done:s => S.statPts < s.p},
  {t:['ยา', 'Potions'], d:() => [`ยาแดงฟื้น HP ${touchUI() ? 'กดปุ่มยาข้างจอย' : 'กดเลข 7 หรือคลิกช่องยาในแถบลัด'} · ลองดื่มสักขวดเมื่อ HP ลด หรือกด "เข้าใจแล้ว"`, `Red Potions restore HP: ${touchUI() ? 'tap the potion button by the stick' : 'press 7 or click the potion slot'} · drink one when hurt, or press "Got it"`], ev:'potion', next:true, hl:'#mobaPot,.hot.pot,[data-hot="6"]'},
  {t:['เควสต์แรก', 'First quest'], d:['เดินไปหาครูวายรา (ฤๅษีหมวกลายเสือ มีเครื่องหมาย ! ) แล้วกดรับเควสต์บทที่ 0', 'Walk to Master Vayra (the hermit in the tiger hat, with the !) and accept Chapter 0'], arrow:'npc', go:'job', done:() => !!qState().active || (qState().done || {}).main0},
  // (v274) the free helper robot: most newcomers never found Uncle Boonma by themselves
  {t:['หุ่นผู้ช่วยเก็บของฟรี', 'A free helper robot'], d:['ไปหาลุงบุญมา คนเลี้ยงสัตว์ (ลูกศรสีทองชี้อยู่) แล้วเลือกรับหุ่นผู้ช่วยฟรี 1 ตัว · มันจะบินไปเก็บของที่ดรอปให้ตลอด', 'Visit Uncle Boonma, the Beast Keeper (the gold arrow points at him), and take a free helper robot · it flies off to pick up your drops for good'],
    arrow:'npc', npc:'beastkeeper', go:'beastkeeper', done:() => !!(S.helperFree || (S.helper && HELPERS[S.helper.k]))},
  {t:['แผนที่โลก', 'World map'], d:() => [`เปิดแผนที่โลก ${touchUI() ? '(เมนู → แผนที่โลก)' : '(กด M)'} ดูแคว้นทั้งหมดและจุดที่คุณอยู่`, `Open the world map ${touchUI() ? '(menu → World map)' : '(press M)'} to see every region and where you are`], hl:'.mb[data-win="world"]', done:() => !!UIS.open.world},
  {t:['ภารกิจรายวัน', 'Daily tasks'], d:() => [`ทุกวันมีภารกิจ 3 อย่างให้เหรียญวายรา ดูได้ที่หน้าต่างเควสต์ ${touchUI() ? '(เมนู → เควสต์)' : '(กด J)'}`, `Three tasks a day pay Vayra Coins: see the Quest window ${touchUI() ? '(menu → Quests)' : '(press J)'}`], hl:'.mb[data-win="quest"]', done:() => !!UIS.open.quest},
  {t:['พร้อมผจญภัยแล้ว!', 'Ready to adventure!'], d:['เก่งมาก! ถึง Job Lv 10 แล้วไปหาครูวายราเพื่อเลือกอาชีพ · วิกิ (K) มีข้อมูลทุกอย่างในเกม · ขอให้สนุกนะ', 'Well done! At Job Lv 10, visit Master Vayra to choose a class · the Wiki (K) has everything · have fun'], next:true, last:true}
];
const tutOn = () => S && S.tut && !S.tut.done && TUT[S.tut.i];
function tutStart(){ S.tut = {i:0, s:{}}; tutShow(); }
function tutGo(i){
  document.querySelectorAll('.tut-hl').forEach(e => e.classList.remove('tut-hl'));
  /* (v346) an NPC step done (the quest taken, the free robot chosen): its dialog closes, so the next card can be seen */
  { const pv = S.tut && TUT[S.tut.i]; if (pv && pv.go && pv.go !== 'fields306' && i > S.tut.i && typeof closeDialog === 'function' && el('dialog') && !el('dialog').hidden) closeDialog(); }
  if (i >= TUT.length){ tutFinish(); return; }
  S.tut.i = i; S.tut.s = {}; const st = TUT[i]; if (st.init) st.init(S.tut.s); SFX.play('tut'); tutShow(); dirty = true;
}
function tutFinish(skip){
  document.querySelectorAll('.tut-hl').forEach(e => e.classList.remove('tut-hl'));
  S.tut.done = true; const b = el('tutBox'); if (b) b.hidden = true;
  if (!skip){ S.bia += 1000; addItem('redpot', 5); banner(L('จบบทสอน! +1,000 เบี้ย · ยาแดง ×5', 'Tutorial complete! +1,000 Bia · Red Potion ×5')); VFX.play('coins', {x:P.x, y:P.y - 30}); }
  EV.emit('tut'); dirty = true; save();
}
function tutShow(){
  const st = tutOn(); let b = el('tutBox');
  if (!st){ if (b) b.hidden = true; return; }
  if (!b){ b = document.createElement('div'); b.id = 'tutBox'; b.className = 'tutbox'; el('ui').appendChild(b); }
  const d = typeof st.d === 'function' ? st.d() : st.d;
  b.innerHTML = `<div class="tuth"><span class="tutn">${S.tut.i + 1}/${TUT.length}</span><b>${L(...st.t)}</b><button class="tutx" data-tutskip="1">${L('ข้ามบทสอน', 'Skip tutorial')}</button></div>
    <p>${L(...d)}</p><div class="tutdots">${TUT.map((_, i) => `<i class="${i < S.tut.i ? 'ok' : i === S.tut.i ? 'on' : ''}"></i>`).join('')}</div>
    ${st.go ? `<button class="btn sm" data-tutgo="${st.go}">${L('พาไป', 'Take me there')}</button>` : ''}    ${st.next ? `<button class="btn gold sm" data-tutnext="1">${st.last ? L('เริ่มผจญภัย', 'Start adventuring') : S.tut.i === 0 ? L('เริ่มเลย', "Let's go") : L('เข้าใจแล้ว', 'Got it')}</button>` : ''}`;
  b.hidden = false; b.style.zIndex = ++zTop; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  document.querySelectorAll('.tut-hl').forEach(e => e.classList.remove('tut-hl'));
  if (st.hl) document.querySelectorAll(st.hl).forEach(e => { if (e.offsetParent !== null) e.classList.add('tut-hl'); });
  if (st.hl && st.hl.includes('data-win')){ const rt = el('railTog'); if (rt && el('rail') && el('rail').classList.contains('folded')) rt.classList.add('tut-hl'); }
}
/* «พาไป»: walk to the NPC the step talks about. (v346) Out in a field (the tutorial has just sent the newcomer to
   ทุ่งสุวรรณิน), it first walks them to the gate back to Aren and, once in town, on to the NPC — before, it only said
   «go back to Aren first» and a newcomer did not know the way (found by tools/first-play.js). */
const TUTGO = {id:null};
function tutWalkTo(id){ const n = NPCS.find(x => x.id === id); if (n){ P.npc = n; P.target = null; P.tx = null; P.cast = null; } }
document.addEventListener('click', e => { const g = e.target.closest && e.target.closest('[data-tutgo]'); if (!g || !tutOn()) return;
  if (MAP_ID !== 0){ const gate = typeof GATES !== 'undefined' && GATES.find(q => q.to === 0);
    if (!gate){ toast(L('กลับนครอาเรนก่อนนะ (ผู้เฝ้าศาลที่แคมป์วาร์ปกลับฟรี)', 'Go back to Aren first (the camp Shrine Keeper warps you free)')); return; }
    TUTGO.id = g.dataset.tutgo; P.npc = null; P.target = null; P.cast = null; P.tx = gate.x; P.ty = gate.y; toast(L('เดินกลับนครอาเรนก่อน แล้วจะพาไปต่อ', 'Walking back to Aren first, then on')); return; }
  tutWalkTo(g.dataset.tutgo); });
EV.on('map', () => { if (!TUTGO.id) return; const id = TUTGO.id; if (MAP_ID !== 0 || !tutOn()) return; TUTGO.id = null; setTimeout(() => { if (MAP_ID === 0 && tutOn()) tutWalkTo(id); }, 600); });
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-tutnext],[data-tutskip]'); if (!t || !tutOn()) return;
  if (t.dataset.tutskip){ askConfirm(L('ข้ามบทสอน', 'Skip tutorial'), L('ข้ามบทสอนทั้งหมดใช่ไหม? (จะไม่ได้รับรางวัล)', 'Skip the whole tutorial? (no reward)'), L('ข้าม', 'Skip'), () => tutFinish(true)); return; }
  tutGo(S.tut.i + 1); });
/* (v346) the first kill in the tutorial always leaves something on the ground: the next step is «pick up loot», and
   when the first monster dropped nothing a newcomer stood there with nothing to pick up (tools/first-play.js) */
EV.on('kill', m => { const st = tutOn(); if (!st || !m || (st.ev !== 'kill' && st.ev !== 'pickup')) return;
  if (nearestLoot(500)) return; const d = (m.def && m.def.drops && m.def.drops[0] && m.def.drops[0][0]) || 'jelly';
  if (ITEMS[d]) setTimeout(() => { if (tutOn() && !nearestLoot(500)) dropLoot(d, m.x, m.y); }, 120); });
for (const ev of ['kill', 'pickup', 'potion']) EV.on(ev, () => { const st = tutOn(); if (st && st.ev === ev) tutGo(S.tut.i + 1); });
EV.on('tick', () => { const st = tutOn(); if (!st || PAUSED) { const b = el('tutBox'); if (b && !b.hidden && !tutOn()) b.hidden = true; return; } if (st.done && st.done(S.tut.s || {})) tutGo(S.tut.i + 1);
  const b = el('tutBox'); if (b && b.hidden) tutShow(); });
/* (v346) the attack step: the big attack button goes for the monster the arrow shows, even when it is further than the
   button usually looks (320 px) — a newcomer pressed it and only read «no target nearby» */
if (typeof mobaAction === 'function'){ const _ma = mobaAction; mobaAction = function(kind){ const st = tutOn();
    if (kind === 'atk' && st && st.arrow === 'mob' && !P.dead && (!P.target || P.target.dead) && !nearestEnemy(320)){ const m = tutMob(); if (m && dist(m, P) < 1600){ botPauseFromManual(); P.target = m; P.tx = null; P.npc = null; return; } }
    return _ma.apply(this, arguments); }; }
/* (v346) the stats step: points pressed with + wait for «ยืนยัน» (statconfirm.js), and newcomers did not see that button —
   it lights up as soon as there is something to confirm */
EV.on('tick', () => { const st = tutOn(); if (!st || !st.stat) return; const b = document.querySelector('[data-stpok]'); if (b && !b.classList.contains('tut-hl')) b.classList.add('tut-hl'); });
/* (v346) the monster the arrow shows: the nearest one a newcomer can beat (no more than 2 levels above the hero, not a
   pack leader). It used to be simply the nearest, and in the starter field that was sometimes a Lv 9 boar: a Lv 1 hero
   who followed the arrow was killed in the tutorial (found by tools/first-play.js). Only if none is in sight, the nearest. */
function tutMob(){ let best = null, bd = 1e9, any = null, ad = 1e9;
  for (const m of mobs){ if (m.dead || m.def.boss || m.minion) continue; const d = Math.hypot(m.x - P.x, m.y - P.y);
    if (d < ad){ ad = d; any = m; } if ((m.def.lvl | 0) <= (S.lvl | 0) + 2 && !m.elite && !m.named && !m.nm && d < bd){ bd = d; best = m; } }
  return best && bd < 900 ? best : any; }
/* bouncing gold arrow over the thing to click */
EV.on('draw', () => {
  const st = tutOn(); if (!st || !st.arrow || PAUSED) return; let t = null;
  if (st.arrow === 'mob'){ const m = tutMob(); if (m) t = {x:m.x, y:m.y - MOB_H[m.type] - 16}; }
  else if (st.arrow === 'loot'){ const l = nearestLoot(600); if (l) t = {x:l.x, y:l.y - 24}; }
  else if (st.arrow === 'npc' && MAP_ID === 0){ const n = NPCS.find(n => n.id === (st.npc || 'job')); if (n) t = {x:n.x, y:n.y - 92}; }
  if (!t) return; const z = clamp(PX / 2, .5, 2.6); let x = sx(t.x), y = sy(t.y) - Math.abs(Math.sin(T * 4)) * 10;
  /* (v346) a target off the screen: the arrow circles the hero and points the way (a newcomer arriving in the fields saw
     no monster and no arrow — tools/first-play.js; at the screen's edge it hid behind the HUD cards) */
  const mx = 44 * z, my = 60 * z;
  if (x < mx || x > SW - mx || y < my || y > SH - my){ const hx = sx(P.x), hy = sy(P.y) - 34 * z, a = Math.atan2(y - hy, x - hx), R = 92 * z + Math.abs(Math.sin(T * 4)) * 8 * z;
    ctx.save(); ctx.translate(hx + Math.cos(a) * R, hy + Math.sin(a) * R * .8); ctx.rotate(a + Math.PI / 2 + Math.PI); ctx.fillStyle = '#ffd76a'; ctx.strokeStyle = '#3a1a04'; ctx.lineWidth = 2.5 * z; ctx.shadowColor = 'rgba(255,200,80,.9)'; ctx.shadowBlur = 12 * z;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-10 * z, -12 * z); ctx.lineTo(-4 * z, -12 * z); ctx.lineTo(-4 * z, -24 * z); ctx.lineTo(4 * z, -24 * z); ctx.lineTo(4 * z, -12 * z); ctx.lineTo(10 * z, -12 * z); ctx.closePath();
    ctx.stroke(); ctx.fill(); ctx.restore(); return; }
  ctx.save(); ctx.fillStyle = '#ffd76a'; ctx.strokeStyle = '#3a1a04'; ctx.lineWidth = 2.5 * z; ctx.shadowColor = 'rgba(255,200,80,.9)'; ctx.shadowBlur = 12 * z;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10 * z, y - 12 * z); ctx.lineTo(x - 4 * z, y - 12 * z); ctx.lineTo(x - 4 * z, y - 24 * z); ctx.lineTo(x + 4 * z, y - 24 * z); ctx.lineTo(x + 4 * z, y - 12 * z); ctx.lineTo(x + 10 * z, y - 12 * z); ctx.closePath();
  ctx.stroke(); ctx.fill(); ctx.restore();
});
/* new characters get the tutorial; switching characters hides any card from the previous one */
{ const _ng = newGame; newGame = function(...a){ _ng(...a);
    /* (v346) a new hero starts with full HP and SP: the starting save held 40 HP while a Lv 1 hero has about 80, so every
       newcomer walked out to the first field at half health (found by tools/first-play.js) */
    const fill = () => { try { derive(); S.hp = DER.maxhp; S.sp = DER.maxsp; } catch (e) {} }; fill(); setTimeout(fill, 60);   // again once the starter kit (starter.js, a moment later) has raised Max HP
    tutStart(); }; }
{ const _cg = continueGame; continueGame = function(...a){ _cg(...a); tutShow(); }; }
