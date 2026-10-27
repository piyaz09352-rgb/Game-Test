/* VAYRATHEN — js/sys/beastkeeper.js — the beast keeper of Aren (ลุงบุญมา คนเลี้ยงสัตว์): helper animals for hire, and the hunter's pet guide
   · RENTAL: ten helper animals, paid in Bia for minutes of play time (time only runs while you play). A helper
     NEVER fights and monsters ignore it. It does two things:
       1) it fetches drops for you, ONE item per second, always the most important item in reach first
          (gear by rarity, then the most valuable things, then the rest: helperScore), and
       2) it gives its own buff while it is with you (derive wrapper: ATK, move speed, CRIT, Max HP, Bia, HIT/FLEE,
          Max SP, MATK, DEF/MDEF, or HP/SP regen).
     The rental is S.helper = {k, left}; renting the same animal again adds time, a different one replaces it.
     It is separate from a Hunter's fighting pet (sys/tamed.js), so both can be out at once.
   · GUIDE: a Hunter / Wildwarden with no fighting pet gets a banner at the job change, a line under the quest
     tracker and pet-skill tooltips saying how to catch one (T). */
'use strict';

/* mob: the art · b: the buff, applied to DER · say: what Boonma says about it · fly: drawn in the air */
const HELPERS = {
  ridgeback:{mob:'bamboojackal', th:'หมาไทยหลังอาน', en:'Thai Ridgeback', base:200, per:20, sc:.8, buff:['ATK +6%', 'ATK +6%'], b:D => { D.atk = Math.round(D.atk * 1.06); },
    say:['จมูกไว คาบของมาให้ไม่เคยพลาด', 'A sharp nose; it never misses a drop']},
  hare:{mob:'hare', th:'กระต่ายป่า', en:'Wild Hare', base:200, per:20, sc:.9, buff:['ความเร็วเดิน +10%', 'Move speed +10%'], b:D => { D.move *= 1.10; }, spd:1.25,
    say:['วิ่งไวที่สุดในคอก', 'The fastest runner in the pen']},
  monkey:{mob:'bamboomonkey', th:'ลิงกังเก็บของ', en:'Fetch Monkey', base:250, per:22, sc:.85, buff:['CRIT +5', 'CRIT +5'], b:D => { D.crit += 5; },
    say:['มือไวตาไว เห็นอะไรวาวก็หยิบ', 'Quick hands; grabs anything that shines']},
  rooster:{mob:'junglefowl', th:'ไก่ชนนำโชค', en:'Lucky Rooster', base:220, per:20, sc:.9, buff:['Max HP +8%', 'Max HP +8%'], b:D => { D.maxhp = Math.round(D.maxhp * 1.08); },
    say:['ขันทีไรใจฮึกทุกที', 'Its crow puts heart in you']},
  squirrel:{mob:'offeringsquirrel', th:'กระรอกขนทอง', en:'Golden Squirrel', base:300, per:25, sc:.9, buff:['ขายของได้เงิน +10%', 'Selling gives +10% Bia'], b:D => { D.pas = {...D.pas, biaPct:(D.pas.biaPct || 0) + .10}; },
    say:['ชอบเก็บของมีค่า ขายได้ราคาดี', 'Loves valuables; you sell for more']},
  otter:{mob:'riverotter', th:'นากแม่น้ำ', en:'River Otter', base:250, per:22, sc:.85, buff:['ฟื้น HP/SP 2% ทุก 4 วิ', 'Regain 2% HP/SP every 4s'], b:() => {}, regen:.02,
    say:['ขี้เล่น อยู่ด้วยแล้วสดชื่น', 'Playful; you feel refreshed with it around']},
  hawk:{mob:'rockhawk', th:'เหยี่ยวรุ้ง', en:'Crested Serpent Eagle', base:350, per:28, sc:.8, fly:18, reach:420, spd:1.4, buff:['HIT +12 · FLEE +12 · เก็บได้ไกล', 'HIT +12 · FLEE +12 · long reach'], b:D => { D.hit += 12; D.flee += 12; },
    say:['ตาคมมองเห็นของไกลที่สุด', 'Keen eyes; spots drops farthest away']},
  hornbill:{mob:'hornbill', th:'นกเงือก', en:'Hornbill', base:300, per:25, sc:.7, fly:16, buff:['Max SP +12%', 'Max SP +12%'], b:D => { D.maxsp = Math.round(D.maxsp * 1.12); },
    say:['นกศักดิ์สิทธิ์ ช่วยให้ใจนิ่ง ร่ายได้นาน', 'A sacred bird; calm mind, longer casting']},
  gecko:{mob:'goldgecko', th:'ตุ๊กแกทอง', en:'Golden Gecko', base:300, per:25, sc:.9, buff:['MATK +6%', 'MATK +6%'], b:D => { D.matk = Math.round(D.matk * 1.06); },
    say:['ร้องตุ๊กแกทีไร มนตร์แรงขึ้น', 'Every chirp strengthens your spells']},
  elephant:{mob:'youngerawan', th:'ลูกช้างเผือก', en:'White Elephant Calf', base:400, per:30, sc:.6, buff:['DEF +10% · MDEF +10%', 'DEF +10% · MDEF +10%'], b:D => { D.def = Math.round(D.def * 1.1) + 1; D.mdef = Math.round(D.mdef * 1.1) + 1; },
    say:['ตัวโตใจดี อยู่ใกล้แล้วอุ่นใจ', 'Big and gentle; you feel safe beside it']}
};
/* (v55) by the day or the week, on the real clock (it keeps running while you are offline) */
const RENT_TIME = [{s:86400, mul:12, th:'รายวัน (1 วัน)', en:'Daily (1 day)'}, {s:604800, mul:70, th:'รายสัปดาห์ (7 วัน)', en:'Weekly (7 days)'}];
const rentPrice = (k, i) => Math.round((HELPERS[k].base + HELPERS[k].per * S.lvl) * RENT_TIME[i].mul / 10) * 10;
const helperOf = () => (S && S.helper && HELPERS[S.helper.k] && S.helper.left > 0 ? S.helper : null);
const isHunter = () => !!(S && JOBS[S.job] && jobChain().includes('ranger'));
const needPet = () => isHunter() && !S.pet;
const rentLeft = s => { s = Math.max(0, Math.ceil(s)); if (s >= 86400){ const dd = Math.floor(s / 86400), hh = Math.floor(s % 86400 / 3600); return L(`${dd} วัน ${hh} ชม.`, `${dd}d ${hh}h`); } const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? L(`${h} ชม. ${m} นาที`, `${h}h ${m}m`) : m ? L(`${m} นาที`, `${m} min`) : L(`${s} วินาที`, `${s}s`); };

/* how much a drop matters: gear by rarity, then value; the helper always fetches the highest score first */
function helperScore(id){
  const it = ITEMS[id]; if (!it) return 0;
  const rar = it.rar || 0, val = Math.min(900, (it.sell || 0) / 4);
  return (it.kind === 'key' ? 5000 : 0) + (it.kind === 'gear' ? 2000 + rar * 1000 + (it.lv || 0) : rar * 600) + val + (it.kind === 'use' ? 40 : 0);
}
/* the buff, on top of everything else */
{ const _dv = derive; derive = function(){ const r = _dv.apply(this, arguments); const h = helperOf(); if (h && DER) HELPERS[h.k].b(DER); if (DER && S){ S.hp = Math.min(S.hp, DER.maxhp); S.sp = Math.min(S.sp, DER.maxsp); } return r; }; }

function rentHelper(k, i){
  const R = HELPERS[k], T0 = RENT_TIME[i]; if (!R || !T0) return false;
  const price = rentPrice(k, i), nmR = L(R.th, R.en), cur = helperOf();
  if (S.bia < price){ toast(L('เงินไม่พอ', 'Not enough Bia')); return false; }
  S.bia -= price;
  if (cur && cur.k === k){ cur.until = Math.max(cur.until || 0, Date.now() + cur.left * 1000) + T0.s * 1000; cur.left = (cur.until - Date.now()) / 1000; toast(L(`ต่อเวลา ${nmR} · เหลือ ${rentLeft(cur.left)}`, `${nmR} extended · ${rentLeft(cur.left)} left`)); }
  else {
    S.helper = {k, left:T0.s, until:Date.now() + T0.s * 1000}; HLP.x = P.x + 20; HLP.y = P.y + 10; HLP.tgt = null; HLP.cd = .5;
    banner(L(`เช่า ${nmR} แล้ว! ช่วยเก็บของวินาทีละชิ้น · ${R.buff[0]} · ${T0.th}`, `${nmR} rented! Fetches one drop a second · ${R.buff[1]} · ${T0.en}`));
    VFX.play('petcall', {x:HLP.x, y:HLP.y});
  }
  derive(); log(L(`เช่าสัตว์: ${nmR} ${T0.th} · −${fmtN(price)} เบี้ย`, `Animal rental: ${nmR} for ${T0.en} · −${fmtN(price)} Bia`), 'g');
  SFX.play('coin'); bump('rentals'); dirty = true; save(); return true;
}
/* the rental ends: run out ('expire') or handed back early ('return') */
function endHelper(why){
  const h = S.helper; if (!h) return; const R = HELPERS[h.k], nmR = R ? L(R.th, R.en) : '';
  S.helper = null; HLP.tgt = null; derive();
  if (why === 'expire'){ banner(L(`หมดเวลาเช่า ${nmR} · กลับไปหาลุงบุญมาที่นครอาเรนแล้ว`, `${nmR}'s rental is over · it went home to Uncle Boonma in Aren`)); SFX.play('bf_end');
    log(L(`หมดเวลาเช่า ${nmR} · เช่าต่อได้ที่ลุงบุญมา (คนเลี้ยงสัตว์ นครอาเรน)`, `${nmR}'s rental ended · rent again from Uncle Boonma (Beast Keeper, Aren)`)); }
  else toast(L(`คืน ${nmR} ให้ลุงบุญมาแล้ว`, `${nmR} handed back to Uncle Boonma`));
  dirty = true; save();
}

/* ---------- the helper in the world ---------- */
const HLP = {x:0, y:0, dir:0, moving:false, map:-1, tgt:null, cd:0, t:0, rg:0, picks:0};
/* a fighting pet rented before this change goes home; your own catch comes back */
function helperMigrate(){
  if (!S || !S.petd || !S.petd.rent) return;
  const st = S.petStash; S.petStash = null;
  if (st && st.pet && MOB[st.pet]){ S.pet = st.pet; S.petd = st.petd; } else { S.pet = null; S.petd = null; }
  if (typeof PET !== 'undefined'){ PET.type = null; PET.down = 0; }
  log(L('สัตว์เช่าแบบเดิม (ช่วยสู้) กลับบ้านแล้ว · ลุงบุญมาให้เช่าสัตว์ช่วยเก็บของแทน', 'The old fighting rental went home · Uncle Boonma now rents helper animals that fetch drops'), 'g'); save();
}
EV.on('tick', dt => {
  if (!S || !S.job) return;
  if (S.petd && S.petd.rent) helperMigrate();
  const h = helperOf(); if (!h){ if (S.helper){ S.helper = null; derive(); } return; }
  { const was = h.left; h.left = h.until ? (h.until - Date.now()) / 1000 : h.left - (PAUSED ? 0 : dt);
    if (was > 60 && h.left <= 60) toast(L(`${HELPERS[h.k].th} จะหมดเวลาเช่าใน 1 นาที`, `${HELPERS[h.k].en}'s rental ends in 1 minute`));
    if (h.left <= 0){ endHelper('expire'); return; }
  }
  const R = HELPERS[h.k], spd = 300 * (R.spd || 1);
  HLP.t += dt; HLP.cd -= dt;
  if (HLP.map !== MAP_ID){ HLP.map = MAP_ID; HLP.x = P.x + 20; HLP.y = P.y + 10; HLP.tgt = null; }
  if (R.regen && !P.dead){ HLP.rg += dt; if (HLP.rg >= 4){ HLP.rg = 0; S.hp = Math.min(DER.maxhp, S.hp + Math.ceil(DER.maxhp * R.regen)); S.sp = Math.min(DER.maxsp, S.sp + Math.ceil(DER.maxsp * R.regen)); } }
  if (HLP.tgt && !LOOT.includes(HLP.tgt)) HLP.tgt = null;
  if (!HLP.tgt && HLP.cd <= 0 && !P.dead){   // the most important drop in reach
    const reach = R.reach || 300; let best = null, bs = -Infinity;
    for (const l of LOOT){ if (dist(l, P) > reach) continue; const s = helperScore(l.id) - dist(l, HLP) / 50; if (s > bs){ bs = s; best = l; } }
    HLP.tgt = best;
  }
  let tx, ty;
  if (HLP.tgt){ tx = HLP.tgt.x; ty = HLP.tgt.y; }
  else { const sp = typeof compSpot === 'function' ? compSpot(HLP, 1) : {x:P.x + 26, y:P.y + 8}; tx = sp.x; ty = sp.y; }
  const d = Math.hypot(tx - HLP.x, ty - HLP.y);
  if (d > 700){ HLP.x = tx; HLP.y = ty; }
  HLP.moving = d > (HLP.tgt ? 2 : 8);
  if (HLP.moving){ const v = HLP.tgt ? spd : Math.min(spd, Math.max(60, d * 3)), k = Math.min(1, v * dt / d); HLP.x += (tx - HLP.x) * k; HLP.y += (ty - HLP.y) * k; HLP.dir = SPR.dirFromVec(tx - HLP.x || .01, ty - HLP.y); }
  if (HLP.tgt && Math.hypot(HLP.tgt.x - HLP.x, HLP.tgt.y - HLP.y) < 8){
    const l = HLP.tgt; HLP.tgt = null; HLP.cd = 1; HLP.picks++;   // one item a second
    pickLoot(l); VFX.play && VFX.play('pickup', {x:HLP.x, y:HLP.y});
  }
});
function drawHelperW(g){
  const h = helperOf(); if (!h || P.dead) return; const R = HELPERS[h.k], sh = SHEETS && SHEETS[R.mob]; if (!sh) return;
  const x = HLP.x - cam.x, y = HLP.y - cam.y; if (x < -60 || x > VW + 60 || y < -80 || y > VH + 40) return;
  const fly = R.fly ? R.fly + Math.sin(HLP.t * 4) * 3 : 0, hop = !R.fly && HLP.moving ? Math.abs(Math.sin(HLP.t * 10)) * 2.5 : 0;
  shadowW(g, x, y, R.fly ? 7 : 9);
  g.save(); g.translate(x, y - fly - hop); g.scale(R.sc, R.sc); SPR.draw(g, sh, HLP.moving ? 'walk' : 'idle', HLP.dir || 0, HLP.t, 0, 0); g.restore();
  if (HLP.tgt){ g.save(); g.globalAlpha = .55 + Math.sin(HLP.t * 10) * .25; g.strokeStyle = '#9ff0c8'; g.lineWidth = 1.5; g.beginPath(); g.arc(HLP.tgt.x - cam.x, HLP.tgt.y - cam.y, 9, 0, 7); g.stroke(); g.restore(); }
}
{ const _ents = LIVE.ents; LIVE.ents = function(list, g){ _ents(list, g); if (helperOf() && !P.dead) list.push({y:HLP.y, f:() => drawHelperW(g)}); }; }


/* ---------- capture gear: four tiers sold by Boonma ----------
   The best one in your bag is used by itself when you press Catch (T): it adds to the catch chance and to the odds
   of a high grade (B…SS). It is used up only when the catch succeeds; with none you still catch at the base odds. */
const CAP_NETS = [
  {id:'net1', name:'บ่วงเชือก', en:'Rope Snare', buy:300, lv:1, c:5, g:.05},
  {id:'net2', name:'ตาข่ายป่าน', en:'Hemp Net', buy:1500, lv:20, c:10, g:.12},
  {id:'net3', name:'กรงไม้ไผ่', en:'Bamboo Cage', buy:6000, lv:45, c:15, g:.22},
  {id:'net4', name:'บ่วงทองพราน', en:"Golden Hunter's Lasso", buy:25000, lv:75, c:20, g:.35}];
/* grades: not easy, not hard: C 55 · B 27 · A 12.5 · S 4.5 · SS 1 (was 50 · 28 · 14 · 6 · 2) */
[55, 27, 12.5, 4.5, 1].forEach((w, i) => { if (PG[i]) PG[i].w = w; });
for (const n of CAP_NETS) ITEMS[n.id] = {name:n.name, en:n.en, buy:n.buy, sell:Math.round(n.buy / 4), kind:'mat', capNet:1, lv:n.lv,
  desc:[`ที่จับสัตว์ · โอกาสจับ +${n.c}% · โอกาสได้เกรดสูง +${Math.round(n.g * 100)}% · ใช้ชิ้นดีที่สุดในกระเป๋าอัตโนมัติเมื่อกดจับ (T) หมดเมื่อจับสำเร็จ`, `Capture gear · catch chance +${n.c}% · high-grade odds +${Math.round(n.g * 100)}% · the best one in your bag is used when you press Catch (T), used up on a successful catch`]};
const capNet = () => CAP_NETS.slice().reverse().find(n => S && S.inv && S.inv[n.id] > 0) || null;
let CAP_USE = null;
{ const _pr = petRoll; petRoll = function(type, opt = {}){
    if (CAP_USE && opt.g == null){ const luk = (DER && DER.b && DER.b.luk) || 0, b = Math.min(.5, luk * .004 + (opt.elite ? .25 : 0)) + CAP_USE.g; opt = {...opt, g:rollGrade(Math.min(1.3, b))}; }
    return _pr(type, opt); }; }
{ const _rc = resolveCapture; resolveCapture = function(){
    const t = P.capTarget, n = capNet(), base = MOVES.capture.base;
    if (n && t && !t.dead){ CAP_USE = n; MOVES.capture.base = base + n.c; }
    try { _rc.apply(this, arguments); } finally { MOVES.capture.base = base; }
    if (CAP_USE && t && t.vanish && S.pet === t.type){ S.inv[n.id]--; if (S.inv[n.id] <= 0) delete S.inv[n.id];
      log(L(`ใช้ ${n.name} จับสำเร็จ (เหลือ ${S.inv[n.id] || 0})`, `${n.en} used for the catch (${S.inv[n.id] || 0} left)`), 'g'); save(); }
    CAP_USE = null; }; }

/* ---------- the keeper ---------- */
addTownNpc({id:'beastkeeper', name:'ลุงบุญมา', en:'Uncle Boonma', role:'คนเลี้ยงสัตว์ · เช่าสัตว์ช่วยเก็บของ', roleEn:'Beast Keeper · Helper rental', x:115, y:1060},
  {job:'ranger', look:{sex:'m', hair:1, color:'hairSilver'}, gear:{head:'hc_leaf'}});
const hlpPic = k => `<span class="ic"><img src="${petPic(HELPERS[k].mob)}" alt="" style="width:100%;height:100%;object-fit:contain"></span>`;
const netRow = n => { const ok = S.lvl >= n.lv; return `<div class="srow${ok ? '' : ' locked'}"><span class="ic">${itemIcon(n.id)}</span><div class="nm"><b>${L(n.name, n.en)} <span class="ct">${L('มี', 'have')} ${S.inv[n.id] || 0}</span></b><small class="hlpbuff">${L(`จับ +${n.c}% · เกรดสูง +${Math.round(n.g * 100)}%`, `catch +${n.c}% · high grade +${Math.round(n.g * 100)}%`)}</small><small class="${ok ? '' : 'bad'}">Lv ${n.lv}</small></div>
    <span class="pr">${fmtN(n.buy)}</span>${ok ? qtyBox(n.id, 'item') : ''}</div>`; };
NPC_OPEN.beastkeeper = n => {
  const h = helperOf(), cur = h ? HELPERS[h.k] : null;
  const row = k => { const R = HELPERS[k];
    return `<div class="srow rentrow">${hlpPic(k)}<div class="nm"><b>${L(R.th, R.en)}</b><small><b class="hlpbuff">${L(...R.buff)}</b> · ${L(...R.say)}</small></div>
      <div class="rentbtns">${RENT_TIME.map((t, i) => `<button class="btn sm" data-rentpet="${k}" data-rt="${i}" ${S.bia >= rentPrice(k, i) ? '' : 'disabled'}>${L(t.th, t.en)}<br><small>${fmtN(rentPrice(k, i))}</small></button>`).join('')}</div></div>`; };
  npcFrame(n, L('สัตว์ของลุงไม่สู้กับใครนะ แต่ช่วยคาบของที่ดรอปมาให้วินาทีละชิ้น เลือกของสำคัญที่สุดก่อนเสมอ แถมอยู่ใกล้แล้วยังเก่งขึ้นด้วย', 'My animals never fight, but they fetch your drops one a second, always the most important first, and you get stronger with them around.'),
    `${h ? `<div class="sec">${L('กำลังเช่าอยู่', 'Renting now')}</div><div class="shop"><div class="srow owned">${hlpPic(h.k)}<div class="nm"><b>${L(cur.th, cur.en)}</b><small><b class="hlpbuff">${L(...cur.buff)}</b> · ${L('เหลือ', 'left')} ${rentLeft(h.left)}</small></div><button class="btn sm" data-rentback="1">${L('คืนสัตว์', 'Hand back')}</button></div></div>` : ''}
     <div class="sec">${L('ที่จับสัตว์', 'Capture gear')} <span class="ct">${L('ระดับสูง = จับง่ายขึ้น ได้เกรดสูงบ่อยขึ้น', 'higher tier = easier catch, better grades')}</span></div><div class="shop">${CAP_NETS.map(netRow).join('')}</div>
     <p class="hint">${L('กดจับ (T) เมื่อมอน HP ไม่เกิน 30% · ใช้ที่จับชิ้นที่ดีที่สุดในกระเป๋าเอง หมดเมื่อจับสำเร็จ · ไม่มีก็จับได้ แต่โอกาสต่ำกว่า', 'Press Catch (T) when a monster is under 30% HP · the best gear in your bag is used, used up on success · you can catch without it, at lower odds')}</p>
     <div class="sec">${L('เช่าสัตว์ช่วยเก็บของ', 'Rent a helper animal')} <span class="ct">${L('เก็บวินาทีละ 1 ชิ้น · ไม่ช่วยสู้', '1 item a second · never fights')}</span></div><div class="shop">${Object.keys(HELPERS).map(row).join('')}</div>
     <p class="hint">${L('ลำดับการเก็บ: อุปกรณ์ (ตำนาน > ล้ำค่า > หายาก > ธรรมดา) ก่อน แล้วของที่มีค่ามากที่สุด แล้วค่อยของอื่น · เช่าตัวเดิมซ้ำ = ต่อเวลา · เช่าตัวใหม่ = คืนตัวเดิม · เวลานับเฉพาะตอนเล่น', 'Pick-up order: gear first (Legendary > Epic > Rare > Common), then the most valuable, then the rest · rent the same one again to extend · a new one replaces the old · time only runs while you play')}</p>
     ${isHunter() ? `<div class="sec">${L('พรานอยากได้สัตว์ช่วยสู้?', 'A Hunter wants a fighting pet?')}</div><p class="hint">${L('จับเองได้ฟรีและอยู่ถาวร: ตีมอนให้ HP เหลือไม่เกิน 30% เข้าใกล้แล้วกด T (ปุ่ม จับ)', 'Catch one, free and for keeps: bring a monster under 30% HP, get close and press T (Catch)')}</p>` : ''}`);
};
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-rentpet],[data-rentback]'); if (!b || b.disabled) return;
  if (b.dataset.rentpet) rentHelper(b.dataset.rentpet, +b.dataset.rt); else endHelper('return');
  const n = NPCS.find(x => x.id === 'beastkeeper'); if (n && !el('dialog').hidden && el('dialog').dataset.npc === 'beastkeeper') NPC_OPEN.beastkeeper(n);
});
{ const st = document.createElement('style'); st.textContent = '.hlpbuff{color:#9ff0c8;font-weight:700}'; document.head.appendChild(st); }

/* ---------- the guide for hunters with no fighting pet ---------- */
const PET_HINT = () => L('ยังไม่มีสัตว์คู่ใจ? จับเอง: ตีมอนให้ HP เหลือไม่เกิน 30% เข้าใกล้แล้วกด T (ปุ่ม จับ)', 'No pet yet? Catch one: bring a monster under 30% HP, get close and press T (Catch)');
EV.on('job', () => { if (needPet()) later(2.5, () => { if (!needPet()) return; banner(L('พรานต้องมีสัตว์คู่ใจ! ตีมอนให้ HP ต่ำแล้วกด T เพื่อจับ', 'A Hunter needs a pet! Weaken a monster and press T to catch it')); }); });
/* (v58) steady.js skips a redraw of the quest card with the same markup, so the hint is added once and taken away
   when it is no longer needed (it used to stay after the hunter caught a pet) */
{ const _rg = renderGoal; renderGoal = function(){ _rg(); const g = el('goal'); if (!g) return; const h = g.querySelector('.pethint');
    if (!needPet()){ if (h){ const br = h.previousSibling; if (br && br.nodeName === 'BR') br.remove(); h.remove(); } return; }
    if (h) return;
    g.insertAdjacentHTML('beforeend', `${g.innerHTML ? '<br>' : ''}<span class="pethint"><b>${L('พราน', 'Hunter')}:</b> ${PET_HINT()}</span>`); }; }
{ const _ts = trySkill; trySkill = function(id){ const sk = SKILLS[id]; if (sk && sk.type === 'petcall' && skl(id) && !S.pet){ toast(PET_HINT()); return; } return _ts(id); }; }
for (const id of ['beasttrain', 'callpet', 'wildkin', 'instinct', 'kingbond']){ const sk = SKILLS[id]; if (!sk || !sk.desc) continue; const _d = sk.desc;
  sk.desc = lv => `${_d(lv)}${S && !S.pet ? ` · ${L('ต้องมีสัตว์: จับเอง (T)', 'Needs a pet: catch one (T)')}` : ''}`; }
if (typeof TOUR !== 'undefined') TOUR.push(['beastkeeper', 'เช่าสัตว์ช่วยเก็บของ', 'Rents helper animals that fetch drops']);
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'petrent', t:['เช่าสัตว์ช่วยเก็บของ', 'Helper animals'], b:() => `<p>${L(
  'ลุงบุญมา คนเลี้ยงสัตว์ทางตะวันตกเฉียงใต้ของนครอาเรน ให้เช่าสัตว์ช่วยเก็บของ 10 แบบ ครั้งละ 30 นาที หรือ 2 ชั่วโมง (นับเฉพาะตอนเล่น) · สัตว์เช่าไม่ช่วยสู้และมอนไม่โจมตีมัน · คาบของที่ดรอปมาให้วินาทีละ 1 ชิ้น เลือกของสำคัญที่สุดก่อน (อุปกรณ์ตามความหายาก แล้วของมีค่า) · แต่ละตัวให้บัฟต่างกัน: ATK, ความเร็ว, CRIT, Max HP, เงินจากการขาย, HIT/FLEE, Max SP, MATK, DEF/MDEF, ฟื้น HP/SP · ไม่มีระบบเก็บของอัตโนมัติแบบอื่นในเกม',
  'Uncle Boonma, the beast keeper in south-west Aren, rents ten helper animals for 30 minutes or 2 hours (play time only) · they never fight and monsters ignore them · they fetch one drop a second, the most important first (gear by rarity, then valuables) · each gives its own buff: ATK, move speed, CRIT, Max HP, Bia from selling, HIT/FLEE, Max SP, MATK, DEF/MDEF or HP/SP regen · there is no other auto loot in the game')}</p>`});
