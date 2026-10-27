/* VAYRATHEN — js/sys/cooking.js — the market kitchen and the herbalist in Aren
   · MAE SAIJAI (แม่ครัวสายใจ), street-food cook by the central market: cooks Thai dishes from the materials every
     monster drops (hide/meat, feathers, scales, carapace, ooze) for a fee. Dishes use the same food buff as the
     fish dishes (sys/fishing.js): one dish at a time, here 5 minutes.
   · MOR PHENG (หมอเพ็ง), traditional herbalist: brews tonics from the inedible drops (spirit ash, rubble, charms) —
     aromatic SP tonics, element medicines (status resistance + cure) and strength ya-dong — plus every potion and
     talisman brew that used to live in the Crafting window's Brew tab (moved here: brewing has one home now).
     A tonic is its own buff slot ('tonic'), so one dish and one tonic can run together.
   · Recipes come in 8 level bands (Lv 1, 31, 61, 100, 150, 200, 250, 300+). Each asks for N of ANY material from a
     group (e.g. "meat of Lv 100–149 monsters"), so every map's drops have a use. Choose how many to make. */
'use strict';

/* ---------- data (pure: tests/data.test.js runs this part in Node) ---------- */
const CK_B = [1, 31, 61, 100, 150, 200, 250, 300];
const ckBand = lv => { let b = 0; CK_B.forEach((x, i) => { if (lv >= x) b = i; }); return b; };
const CK_SRC = {hide:'hare', tusk:'boar', wick:'lantern', jelly:'dewblob'};   // the old starter drops
const ckMob = id => MOB[CK_SRC[id] || id.slice(2)];
const CK_CAT = {meat:['เนื้อสัตว์', 'Meat'], fowl:['สัตว์ปีก', 'Fowl'], scale:['งูและหนอน', 'Snakes & worms'], yum:['ปู แมลง และเมือก', 'Crabs, bugs & ooze'],
  ash:['เถ้าวิญญาณ', 'Spirit ash'], stone:['หินและศิลา', 'Rubble & stone'], charm:['เครื่องราง', 'Charms']};
/* edible drops go to the cook, spirit ash / rubble / charms (and anything undead or made of stone) to the herbalist */
const CK_POOL = {};
for (const id in SPECIES_ARCH){ const m = MOB[id]; if (!m || m.boss || !ITEMS['m_' + id]) continue; const a = SPECIES_ARCH[id], r = m.race;
  const inedible = r === 'formless' || r === 'undead' || ['floater', 'rock', 'human'].includes(a);
  const cat = !inedible ? {quad:'meat', squat:'meat', bird:'fowl', serpent:'scale', bug:'yum', slime:'yum'}[a] : a === 'human' ? 'charm' : a === 'floater' || r === 'undead' ? 'ash' : 'stone';
  const k = cat + ckBand(m.lvl); (CK_POOL[k] = CK_POOL[k] || []).push('m_' + id); }
CK_POOL.meat0.push('hide', 'tusk'); CK_POOL.ash0.push('wick');
for (const k in CK_POOL) CK_POOL[k].sort((a, b) => ckMob(a).lvl - ckMob(b).lvl);
/* dish and tonic names per band (index = band) */
const CK_NAMES = {
  meat:[['เนื้อแดดเดียว', 'Sun-dried Jerky'], ['ลาบเนื้อคั่ว', 'Toasted Meat Larb'], ['แกงป่าเนื้อ', 'Jungle Curry'], ['ผัดเผ็ดเนื้อป่า', 'Wild Meat Phat Phet'],
    ['เสือร้องไห้', 'Crying Tiger'], ['แกงฮังเล', 'Hang Le Curry'], ['มัสมั่นเนื้อ', 'Massaman Curry'], ['พะแนงเนื้อทิพย์', 'Celestial Phanaeng']],
  fowl:[['ไก่ย่าง', 'Gai Yang'], ['ต้มข่าไก่', 'Tom Kha Gai'], ['แกงเขียวหวานไก่', 'Green Curry'], ['ไก่ทอดหาดใหญ่', 'Hat Yai Fried Fowl'],
    ['ข้าวมันไก่', 'Khao Man Gai'], ['ไก่ตุ๋นยาจีน', 'Herbal Braised Fowl'], ['ข้าวซอยไก่', 'Khao Soi'], ['ไก่อบโอ่งสวรรค์', 'Heavenly Jar-roast Fowl']],
  scale:[['งูผัดเผ็ด', 'Spicy Snake Stir-fry'], ['ต้มยำงูทะเล', 'Sea Snake Tom Yum'], ['งูผัดพริกไทยดำ', 'Black-pepper Snake'], ['แกงอ่อมงู', 'Kaeng Om Snake'],
    ['หนอนทอดกรอบ', 'Crispy Fried Worms'], ['แกงคั่วงู', 'Kaeng Khua Serpent'], ['ฉู่ฉี่ปลาไหล', 'Choo Chee Eel'], ['แกงส้มเกล็ดทิพย์', 'Celestial-scale Kaeng Som']],
  yum:[['น้ำพริกแมงดา', 'Maengda Chili Dip'], ['ส้มตำปู', 'Som Tam with Crab'], ['พล่ากุ้ง', 'Shrimp Phla'], ['แมลงทอด', 'Fried Insects'],
    ['ปูผัดผงกะหรี่', 'Curry Crab'], ['แมงป่องทอดเกลือ', 'Salt-fried Scorpion'], ['ห่อหมกทะเล', 'Seafood Hor Mok'], null],
  ash:[['ยาหอมเทพจิตร', 'Thepjit Aromatic'], ['ยาหอมนวโกฐ', 'Nawakot Aromatic'], ['ยาหอมอินทจักร์', 'Inthajak Aromatic'], ['ยาหอมทิพโอสถ', 'Thippaosot Aromatic'],
    ['ยาหอมเกสรเย็น', 'Cool-blossom Aromatic'], ['ยาหอมวิญญาณสงบ', 'Calm-spirit Aromatic'], ['ยาหอมเทพนิมิต', 'Divine-vision Aromatic'], ['ยาหอมสุราลัย', 'Suralai Aromatic']],
  stone:[null, ['ยาธาตุบรรจบ', 'Thatbanchop Remedy'], ['ยาเหลืองปิดสมุทร', 'Lueang Pit Samut Remedy'], ['ยาจันทน์ลีลา', 'Chan Leela Remedy'],
    ['ยาประสะมะแว้ง', 'Prasa Mawaeng Remedy'], ['ยาเบญจกูล', 'Benchakul Remedy'], null, ['ยาศิลาทิพย์', 'Celestial Stone Remedy']],
  charm:[['ยาดองสมุนไพร', 'Herbal Ya Dong'], ['ยาดองม้ากระทืบโรง', 'Ma Kratheup Rong Ya Dong'], ['ยาดองกำลังช้างสาร', 'Bull-elephant Ya Dong'], ['ยาดองกำลังเสือโคร่ง', 'Tiger-strength Ya Dong'],
    ['ยาดองโสมดอย', 'Mountain Ginseng Ya Dong'], ['ยาดองกำลังยักษ์', 'Giant-strength Ya Dong'], ['ยาดองนาคราช', 'Naga King Ya Dong'], ['ยาดองอมฤต', 'Amrita Ya Dong']]
};
/* what each kind of dish / tonic does; k = band 0..7 */
const CK_DEF = [10, 18, 28, 42, 58, 76, 96, 118];
const CK_FX = {
  meat:k => ({atkPct:+(.06 + k * .014).toFixed(3)}),                                   // red meat: strength
  fowl:k => ({regenPct:+(.02 + k * .004).toFixed(3), every:4}),                        // chicken soup: recovery
  scale:k => ({crit:3 + k, atkPct:+(.02 + k * .006).toFixed(3)}),                      // fiery snake dishes: crits
  yum:k => ({def:CK_DEF[k], regenPct:.01, every:5}),                                   // crab / bug / jelly: toughness
  ash:k => ({spPct:+(.02 + k * .004).toFixed(3), spEvery:3}),                          // ยาหอม: a clear mind, SP
  stone:k => ({resPct:+Math.min(.5, .2 + k * .04).toFixed(2), def:Math.round(CK_DEF[k] / 2), cureAll:1}),   // ยาธาตุ: cures, resists afflictions
  charm:k => ({atkPct:+(.03 + k * .008).toFixed(3), crit:2 + k})                       // ยาดอง: vigour
};
const ckPct = v => Math.round(v * 1000) / 10;
function ckFxText(f){
  const th = [], en = [];
  if (f.atkPct){ th.push(`ATK +${ckPct(f.atkPct)}%`); en.push(`ATK +${ckPct(f.atkPct)}%`); }
  if (f.crit){ th.push(`CRIT +${f.crit}%`); en.push(`CRIT +${f.crit}%`); }
  if (f.def){ th.push(`DEF +${f.def}`); en.push(`DEF +${f.def}`); }
  if (f.regenPct){ th.push(`ฟื้น HP ${ckPct(f.regenPct)}% ทุก ${f.every} วิ`); en.push(`+${ckPct(f.regenPct)}% HP every ${f.every} s`); }
  if (f.spPct){ th.push(`ฟื้น SP ${ckPct(f.spPct)}% ทุก ${f.spEvery} วิ`); en.push(`+${ckPct(f.spPct)}% SP every ${f.spEvery} s`); }
  if (f.resPct){ th.push(`ต้านอาการผิดปกติ ${Math.round(f.resPct * 100)}%`); en.push(`${Math.round(f.resPct * 100)}% status resist`); }
  if (f.cureAll){ th.push('ดื่มแล้วหายจากอาการทันที'); en.push('cures afflictions when drunk'); }
  return [th.join(' · '), en.join(' · ')];
}
const CK_FEE = [40, 150, 400, 900, 1600, 2600, 4000, 6000];
const CK_COOK = ['meat', 'fowl', 'scale', 'yum'], CK_APO = ['ash', 'stone', 'charm'];
const CK_RCP = [];   // {id, who:'cook'|'apo', tab:band|'pot', out, n, need:[{k:pool key|null, ids, n}], fee}
/* a band with no dish of its own hands its materials to the nearest band that has one (v29: the new regions fill every band) */
for (const cat of [...CK_COOK, ...CK_APO]) for (let k = 0; k < CK_B.length; k++){ const pool = CK_POOL[cat + k]; if (!pool || CK_NAMES[cat][k]) continue;
  let to = -1; for (let d = 1; d < CK_B.length && to < 0; d++) for (const j of [k - d, k + d]) if (to < 0 && j >= 0 && j < CK_B.length && CK_NAMES[cat][j]) to = j;
  if (to >= 0){ (CK_POOL[cat + to] = CK_POOL[cat + to] || []).push(...pool); CK_POOL[cat + to].sort((a, b) => ckMob(a).lvl - ckMob(b).lvl); delete CK_POOL[cat + k]; } }
for (const cat of [...CK_COOK, ...CK_APO]) for (let k = 0; k < CK_B.length; k++){
  const pool = CK_POOL[cat + k], name = CK_NAMES[cat][k]; if (!pool || !name) continue;
  const cook = CK_COOK.includes(cat), id = (cook ? 'ck_' : 'ap_') + cat + k, fx = CK_FX[cat](k), [th, en] = ckFxText(fx), n = 3 + k, fee = Math.round(CK_FEE[k] * (cook ? 1 : 1.25));
  ITEMS[id] = {name:name[0], en:name[1], kind:'use', sell:Math.round(fee * .3), [cook ? 'food' : 'tonic']:{...fx, t:300}, ckCat:cat, desc:[`${th} · 5 นาที`, `${en} · 5 min`]};
  CK_RCP.push({id, who:cook ? 'cook' : 'apo', tab:k, out:id, n:1, need:[{k:cat + k, ids:pool, n}], fee});
}
/* potions and talismans (moved from the Crafting window's Brew tab) */
const ckOne = id => ({k:null, ids:[id], n:0});
const ckNeed = (src, n) => (typeof src === 'string' && !CK_POOL[src] ? {...ckOne(src), n} : {k:src, ids:CK_POOL[src], n});
for (const [out, n, need, fee] of [['redpot', 5, [['jelly', 3]], 30], ['bluepot', 3, [['ash0', 3]], 80], ['orangepot', 5, [['charm1', 4], ['redpot', 5]], 200],
  ['talisman', 2, [['stone1', 3], ['ore', 1]], 150], ['whitepot', 5, [['ash2', 4], ['orangepot', 5]], 900], ['bigbluepot', 3, [['stone2', 4], ['bluepot', 5]], 1200],
  ['elixirpot', 3, [['ash3', 5], ['whitepot', 3], ['ore', 1]], 3000], ['skypot', 3, [['stone5', 5], ['bigbluepot', 3], ['ore', 2]], 7000], ['divinepot', 3, [['charm5', 5], ['elixirpot', 3], ['ore', 2]], 9000]])
  CK_RCP.push({id:'ap_brew_' + out, who:'apo', tab:'pot', out, n, need:need.map(([s, c]) => ckNeed(s, c)), fee});
const CK_R = Object.fromEntries(CK_RCP.map(r => [r.id, r]));

/* ---------- runtime ---------- */
BUFF_TH.tonic = ['ยาบำรุง', 'Tonic']; BUFF_CAP.tonic = ['ยาบำรุง', 'TONIC']; BUFF_CAP.food = BUFF_CAP.food || ['อิ่ม', 'FED'];
BUFF_IC.food = ['#ffc070', '<path d="M3.5 10h13a6.5 5 0 0 1-13 0z"/><path d="M7 7.5c0-1.4 1.4-1.4 1.4-2.8M11 7.5c0-1.4 1.4-1.4 1.4-2.8"/><path d="M6 16.5h8"/>'];
BUFF_IC.tonic = ['#9ae0b0', '<path d="M8 3h4v3.2c2.6 1.2 4 3.4 4 6.3a6 6 0 0 1-12 0c0-2.9 1.4-5.1 4-6.3z"/><path d="M5.5 12h9"/>'];
/* a camp cook only takes what this map's monsters drop (sys/campcook.js sets CK_ONLY); the cook in Aren takes everything */
let CK_ONLY = null;
const ckIds = ids => (CK_ONLY ? ids.filter(id => CK_ONLY.has(id)) : ids);
const ckOkR = r => !CK_ONLY || r.need.every(q => ckIds(q.ids).length > 0);
const ckHave = ids => ckIds(ids).reduce((a, id) => a + (S.inv[id] || 0), 0);
/* take n from a group: whatever you hold most of goes first */
function ckTake(ids, n){
  for (const id of ckIds(ids).slice().sort((a, b) => (S.inv[b] || 0) - (S.inv[a] || 0))){ if (n <= 0) break; const k = Math.min(n, S.inv[id] || 0); if (!k) continue; S.inv[id] -= k; n -= k; if (!S.inv[id]) delete S.inv[id]; }
}
const ckNeedName = q => (q.k ? `${L(...CK_CAT[q.k.replace(/\d+$/, '')])} Lv ${ckLv(q.ids)}` : nm(ITEMS[q.ids[0]]));
const ckLv = ids => { ids = ckIds(ids).length ? ckIds(ids) : ids; const l = ids.map(id => ckMob(id).lvl); const a = Math.min(...l), b = Math.max(...l); return a === b ? `${a}` : `${a}–${b}`; };
const ckMax = r => Math.max(0, Math.min(QTY.MAX, r.fee ? Math.floor(S.bia / r.fee) : QTY.MAX, ...r.need.map(q => Math.floor(ckHave(q.ids) / q.n))));
/* make n batches; false (and a message) when something is short — nothing changes then */
function ckMake(rid, n){
  const r = CK_R[rid]; n = Math.max(1, Math.floor(n) || 1); if (!r) return false;
  const miss = r.need.find(q => ckHave(q.ids) < q.n * n);
  if (miss){ toast(L(`วัตถุดิบไม่พอ: ${ckNeedName(miss)} ${fmtN(ckHave(miss.ids))}/${fmtN(miss.n * n)}`, `Not enough materials: ${ckNeedName(miss)} ${fmtN(ckHave(miss.ids))}/${fmtN(miss.n * n)}`)); SFX.play('click'); return false; }
  if (S.bia < r.fee * n){ toast(L(`เงินไม่พอ: ค่าทำ ${fmtN(r.fee * n)} เบี้ย`, `Not enough Bia: the fee is ${fmtN(r.fee * n)}`)); SFX.play('click'); return false; }
  for (const q of r.need) ckTake(q.ids, q.n * n);
  S.bia -= r.fee * n; addItem(r.out, r.n * n); bump(r.who === 'cook' ? 'cooked' : 'brewed'); EV.emit('craft', r.out);
  const it = ITEMS[r.out], got = r.n * n;
  SFX.play('craft'); VFX.play('refine', {x:P.x, y:P.y, ok:true});
  toast(L(`${r.who === 'cook' ? 'ทำ' : 'ปรุง'}${it.name} ×${fmtN(got)} แล้ว`, `${r.who === 'cook' ? 'Cooked' : 'Brewed'} ${it.en} ×${fmtN(got)}`));
  log(L(`${r.who === 'cook' ? 'ทำอาหาร' : 'ปรุงยา'}: ${it.name} ×${fmtN(got)} · ค่าทำ ${fmtN(r.fee * n)} เบี้ย`, `${r.who === 'cook' ? 'Cooked' : 'Brewed'} ${it.en} ×${fmtN(got)} · fee ${fmtN(r.fee * n)} Bia`), 'g');
  dirty = true; save(); return true;
}

/* ---------- eating and drinking ---------- */
{
  const _u = useItem;
  useItem = function(id){
    const it = ITEMS[id]; if (!it || !it.tonic || !S.inv[id] || P.dead) return _u(id);
    addBuff('tonic', {t:300, ...it.tonic, name:it.name}); S.inv[id]--; if (!S.inv[id]) delete S.inv[id];
    if (it.tonic.cureAll && typeof afCure === 'function') afCure(null, L(`${it.name} · หายจากอาการ`, `${it.en} · cured`));
    addText(P.x, P.y - 54, L(`ชื่นใจ! ${it.name}`, `Refreshing! ${it.en}`), '#b8ffd0', 12); SFX.play('pot_sp', {tier:2}); dirty = true;
  };
  // the herbalist's medicines add to status resistance (sys/afflict.js)
  if (typeof afRes === 'function'){ const _r = afRes; afRes = function(){ return Math.min(.9, _r() + buffSum('resPct')); }; }
  const _e = buffEffect;
  buffEffect = function(b){ const s = _e(b), x = [];
    if (b.spPct) x.push(L(`ฟื้น SP ${ckPct(b.spPct)}% ทุก ${b.spEvery} วิ`, `+${ckPct(b.spPct)}% SP every ${b.spEvery}s`));
    if (b.resPct) x.push(L(`ต้านอาการ ${Math.round(b.resPct * 100)}%`, `Resist ${Math.round(b.resPct * 100)}%`));
    return [s, ...x].filter(Boolean).join(' · '); };
}
EV.on('tick', dt => {
  const b = P.buffs && P.buffs.tonic; if (!b || !b.spPct || P.dead || !DER) return;
  b.st = (b.st || 0) + dt; if (b.st < b.spEvery) return; b.st = 0;
  if (S.sp < DER.maxsp){ const v = Math.max(1, Math.round(DER.maxsp * b.spPct)); S.sp = Math.min(DER.maxsp, S.sp + v); addText(P.x + 10, P.y - 50, `+${v}`, '#8ac8ff', 12); }
});
/* Auto: eat a dish / drink a tonic when the buff runs out (opt-in in the Auto window) — the best one in the bag */
const CK_EAT = {t:0};
EV.on('tick', dt => {
  if ((CK_EAT.t -= dt) > 0 || typeof BOT === 'undefined' || !BOT.on || !S.bot || !S.bot.food || P.dead || P.itemCd > 0) return; CK_EAT.t = 1;
  const best = key => Object.keys(S.inv).filter(id => S.inv[id] > 0 && ITEMS[id] && ITEMS[id][key]).sort((a, b) => (ITEMS[b].sell || 0) - (ITEMS[a].sell || 0))[0];
  if (typeof foodAutoPick === 'function'){ const id = foodAutoPick(); if (id){ useItem(id); return; } } else if (!P.buffs.food){ const id = best('food'); if (id){ useItem(id); return; } }   // dishes of different kinds stack (foodstack.js)
  if (!P.buffs.tonic){ const id = best('tonic'); if (id){ useItem(id); return; } }
});
if (typeof renderAuto === 'function'){
  const _ra = renderAuto;
  renderAuto = function(){ _ra(); const pane = document.getElementById('pane-auto'), sec = pane && pane.querySelectorAll('.sec')[1]; if (!sec || !S.bot) return;
    sec.insertAdjacentHTML('beforebegin', `<label class="set"><span><b>${L('กินอาหาร/ยาบำรุงอัตโนมัติ', 'Eat dishes & tonics')}</b><small>${L('กินอาหารต่างประเภทซ้อนกันได้ (ประเภทเดียวกันไม่ทับ) และยาบำรุงเมื่อหมด', 'Keeps one dish of each kind going (they stack if they boost different stats) and a tonic')}</small></span><input type="checkbox" data-aset="food" ${S.bot.food ? 'checked' : ''}><i class="sw"></i></label>`); };
}

/* ---------- pictures: a bowl for every dish, a herb bottle for every tonic ---------- */
const CK_COL = {meat:['#ffb070', '#c0502a', '#5a1a0a'], fowl:['#fff0b0', '#e8b040', '#8a5a14'], scale:['#ffd080', '#e06a2a', '#7a2a0a'], yum:['#ffd0b0', '#e86a4a', '#7a2214'], fish:['#fff4c8', '#e0a040', '#7a4a14'],
  ash:['#e8f4ff', '#7ab8e8', '#24507a'], stone:['#f0ffd8', '#8ac850', '#2e5a14'], charm:['#ffd8a0', '#b0602a', '#4a1a08']};
{
  const _p = iaPick;
  iaPick = function(id){
    const it = ITEMS[id] || {};
    if (!it.food && !it.tonic) return _p(id);
    const p = 'ia' + id.replace(/\W/g, '') + '§', c = CK_COL[it.ckCat] || CK_COL.fish;
    if (it.tonic) return {p, art:IA.flask(p, c, 'tall'), frame:it.sell > 600 ? 1 : 0, glow:c[1]};
    return {p, glow:c[1], frame:it.sell > 600 ? 1 : 0, art:[rg(p + 'f', c, .45, .35, .7),
      `<path d="M13 13c0-2 2-2 2-4M20 12c0-2 2-2 2-4M27 13c0-2 2-2 2-4" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>
       <ellipse cx="20" cy="20" rx="13" ry="4" fill="url(#${p}f)" ${OL}/>
       <circle cx="15" cy="19.4" r="1.6" fill="${c[2]}"/><circle cx="22" cy="20.6" r="1.4" fill="#5aa83a"/><circle cx="25.5" cy="19" r="1.2" fill="#e83a2a"/>
       <path d="M7 20h26a13 11 0 0 1-26 0z" fill="#f2e6cc" ${OL}/><path d="M9.5 23.5h21" stroke="#3a6ab8" stroke-width="1.4"/>
       <path d="M15 31.5h10l-1.4 2.4h-7.2z" fill="#d8c8a8" ${OL}/>`]};
  };
}

/* ---------- the two NPCs, by the central market ---------- */
addTownNpc({id:'cook', name:'แม่ครัวสายใจ', en:'Cook Saijai', role:'รับทำอาหาร', roleEn:'Cooking', x:350, y:1195},
  {job:'novice', look:{sex:'f', hair:2, color:'hairBrown'}, gear:{armor:'c_maid', head:'hc_ribbon'}});
addTownNpc({id:'herbal', name:'หมอเพ็ง', en:'Herbalist Pheng', role:'หมอยา · ปรุงยา', roleEn:'Herbalist · Brewing', x:480, y:1225},
  {job:'healer', look:{sex:'m', hair:0, color:'hairSilver'}, gear:{armor:'c_daily', head:'hc_mala'}});
const CK = {tab:{}};
/* who drops it, and where: monster → its maps (the Wiki's index) */
function ckWhere(ids){
  const ix = wikiIndex(), seen = new Set(), rows = [];
  for (const id of ckIds(ids)) for (const [k] of ix.droppers[id] || []){ const m = MOB[k]; if (!m || m.boss || seen.has(k)) continue; seen.add(k);
    rows.push(`<a class="ckmob" data-ckwk="mob:${k}">${itemIcon(id)}<span><b>${nm(m)}</b> Lv ${m.lvl}<small>${(ix.where[k] || []).map(i => nm(MAPS[i])).join(', ') || '—'}</small></span><em>${fmtN(S.inv[id] || 0)}</em></a>`); }
  return rows.join('');
}
function ckRow(r){
  const it = ITEMS[r.out], can = ckMax(r) > 0, qn = QTY.last['ck:' + r.id] || 1;
  const need = r.need.map(q => { const h = ckHave(q.ids), ic = (ckIds(q.ids).length ? ckIds(q.ids) : q.ids).slice().sort((a, b) => (S.inv[b] || 0) - (S.inv[a] || 0))[0];
    return `<span class="cneed${h >= q.n ? ' ok' : ''}"><i>${itemIcon(ic)}</i>${ckNeedName(q)} ${fmtN(h)}/${q.n}</span>`; }).join('') + `<span class="cneed${S.bia >= r.fee ? ' ok' : ''}"><i class="cz"><i class="biaI"></i></i>${fmtN(r.fee)}</span>`;
  const where = r.need.filter(q => q.k || CK_SRC[q.ids[0]]).map(q => ckWhere(q.ids)).filter(Boolean), nw = where.join('').split('class="ckmob"').length - 1;
  return `<div class="srow ckrow${can ? '' : ' short'}" data-ckr="${r.id}"><span class="ic">${itemIcon(r.out)}</span><div class="nm"><b>${nm(it)}${r.n > 1 ? ' ×' + r.n : ''}</b><small>${itemDesc(r.out)} · ${L('มี', 'have')} ${fmtN(S.inv[r.out] || 0)}</small>
      <div class="cneeds">${need}</div>${nw ? `<details class="ckwhere"><summary>${L('ล่าได้จาก', 'Dropped by')} (${nw})</summary><div class="ckmobs">${where.join('')}</div></details>` : ''}</div>
    <div class="ckgo"><span class="qty" data-qty="ck:${r.id}" data-qk="ck"><button class="qb" data-qd="-1" aria-label="${L('ลด', 'Less')}">−</button><input class="qn" type="number" inputmode="numeric" min="1" max="${QTY.MAX}" value="${qn}" aria-label="${L('จำนวน', 'Amount')}"><button class="qb" data-qd="1" aria-label="${L('เพิ่ม', 'More')}">+</button><button class="qb qm" data-ckmax="${r.id}">MAX</button></span>
    <button class="btn sm gold qgo${can ? '' : ' off'}" data-ckmake="${r.id}">${r.who === 'cook' ? L('ทำ', 'Cook') : L('ปรุง', 'Brew')} <b class="qsum">${fmtN(r.fee * qn)}</b></button></div></div>`;
}
function ckOpen(who, n){
  const tabs = [...(who === 'apo' ? ['pot'] : []), ...CK_B.map((x, k) => k).filter(k => CK_RCP.some(r => r.who === who && r.tab === k && ckOkR(r)))];
  if (!tabs.includes(CK.tab[who])) CK.tab[who] = tabs.filter(t => t !== 'pot' && t <= ckBand(S.lvl)).pop() ?? tabs[0];
  const lvTab = k => { const ids = CK_RCP.filter(r => r.who === who && r.tab === k && ckOkR(r)).flatMap(r => r.need.flatMap(q => q.ids)); return `Lv ${ckLv(ids)}`; };
  const list = CK_RCP.filter(r => r.who === who && r.tab === CK.tab[who] && ckOkR(r));
  const db = document.querySelector('#dialog .db'), sc = db && document.getElementById('dialog').dataset.npc === n.id ? db.scrollTop : 0;
  npcFrame(n, who === 'cook' ? L('หิวไหมจ๊ะ เอาของที่ล่ามาได้มาให้ป้าสิ เนื้อ ไก่ งู ปู แมลง ป้าทำได้หมด กินแล้วมีแรงสู้มอนไปอีกนาน', 'Hungry, dear? Bring me what you hunt: meat, fowl, snake, crab, bugs, I cook them all. A good meal keeps you fighting for a long while.')
    : L('ของที่กินไม่ได้อย่าทิ้งนะหลาน เถ้าวิญญาณ เศษหิน เครื่องราง หมอปรุงเป็นยาหอม ยาธาตุ ยาดองได้ ยาสามัญก็ปรุงให้', 'Do not throw away what you cannot eat, child: spirit ash, rubble, charms. I brew them into aromatics, remedies and ya dong, and the common potions too.'),
    `<div class="wktabs cktabs">${tabs.map(t => `<button class="wktab${t === CK.tab[who] ? ' on' : ''}" data-cktab="${who}:${t}"><span>${t === 'pot' ? L('ยาฟื้นฟู', 'Potions') : lvTab(t)}</span></button>`).join('')}</div>
     <div class="shop">${list.map(ckRow).join('')}</div>
     <p class="hint">${who === 'cook' ? L('ใช้วัสดุชนิดใดก็ได้ในกลุ่ม · อาหารให้บัฟ 5 นาที กินได้ทีละจาน · ปลาที่ตกได้ ให้ป้าที่แคมป์ย่างให้', 'Any material of the group will do · a dish gives a 5-minute buff, one dish at a time · fish: I grill them at any camp')
       : L('ยาบำรุงให้บัฟ 5 นาที ใช้พร้อมอาหารได้ (ทีละขวด) · ยาสำเร็จรูปซื้อได้ที่ร้านป้าบัวคำ', 'A tonic gives a 5-minute buff and works alongside a dish (one at a time) · ready-made potions: Auntie Buakham\'s store')}</p>`);
  const nb = document.querySelector('#dialog .db'); if (nb && sc) nb.scrollTop = sc;
}
NPC_OPEN.cook = n => { CK_ONLY = null; ckOpen('cook', n); };
NPC_OPEN.herbal = n => { CK_ONLY = null; ckOpen('apo', n); };
const ckReopen = () => { const d = document.getElementById('dialog'), n = d && !d.hidden && NPCS.find(x => x.id === d.dataset.npc); if (n && NPC_OPEN[n.id]) NPC_OPEN[n.id](n); };
/* the quantity box is the shop's (sys/buyqty.js): keep the fee on the button current */
{
  const _q = qtySet;
  qtySet = function(box, n){ _q(box, n); if (box.dataset.qk !== 'ck') return; const r = CK_R[box.dataset.qty.slice(3)], go = box.parentElement.querySelector('[data-ckmake]');
    if (r && go) go.querySelector('.qsum').textContent = fmtN(r.fee * qtyOf(box)); };
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-ckmake],[data-ckmax],[data-cktab],[data-ckwk]'); if (!t) return; const d = t.dataset;
  if (d.cktab){ const [who, k] = d.cktab.split(':'); CK.tab[who] = k === 'pot' ? 'pot' : +k; ckReopen(); }
  else if (d.ckmax){ const box = t.closest('.qty'), r = CK_R[d.ckmax]; if (box && r) qtySet(box, Math.max(1, ckMax(r))); }
  else if (d.ckmake){ const row = t.closest('.ckrow'), box = row && row.querySelector('.qty'); if (ckMake(d.ckmake, box ? qtyOf(box) : 1)) ckReopen(); }
  else if (d.ckwk){ const [tab, id] = d.ckwk.split(':'); openWin('wiki'); wikiOpen(tab, id); }
});
document.addEventListener('keydown', e => { const i = e.target; if (e.key !== 'Enter' || !i.classList || !i.classList.contains('qn')) return; const go = i.closest('.ckrow') && i.closest('.ckrow').querySelector('[data-ckmake]'); if (go) go.click(); }, true);
{
  const st = document.createElement('style');
  st.textContent = `.ckrow{align-items:flex-start;flex-wrap:wrap}.ckrow .cneeds{margin-top:4px}.ckrow.short .nm>b{opacity:.75}
    .ckgo{display:flex;flex-direction:column;align-items:flex-end;gap:5px;margin-left:auto}.ckgo .qgo.off{opacity:.55;filter:saturate(.5)}
    .ckwhere{margin-top:4px;font-size:11.5px;color:var(--muted)}.ckwhere summary{cursor:pointer;color:#e8d6b0}
    .ckmobs{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:4px;margin-top:4px}
    .ckmob{display:flex;align-items:center;gap:6px;padding:3px 6px;border-radius:8px;background:rgba(0,0,0,.25);cursor:pointer;color:#f0e2c0}.ckmob:hover{background:rgba(227,176,75,.18)}
    .ckmob svg{width:22px;height:22px;flex:none}.ckmob span{flex:1;min-width:0;line-height:1.2}.ckmob small{display:block;color:var(--muted);font-size:10.5px}.ckmob em{font-style:normal;color:#ffe6a0;font-weight:700}
    .cktabs{margin-bottom:6px;flex:none;min-height:36px}
    @media (max-width:640px){.ckgo{flex-direction:row;flex-wrap:wrap;width:100%;justify-content:flex-end}}`;
  document.head.appendChild(st);
}
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'cooking', t:['ทำอาหารและปรุงยา', 'Cooking & brewing'], b:() => `<p>${L('ที่ตลาดกลางนครอาเรน แม่ครัวสายใจรับทำอาหารจากวัสดุที่มอนดรอป (หนัง ขนนก เกล็ด กระดอง ผิวมัน เมือก) ส่วนหมอเพ็งปรุงยาหอม (ฟื้น SP) ยาธาตุ (ต้านอาการ + หายจากอาการ) และยาดอง (ATK/CRIT) จากเถ้าวิญญาณ เศษหิน และเครื่องราง รวมถึงยาฟื้นฟูและยันต์ทั้งหมด',
  'At the central market in Aren, Cook Saijai cooks the materials monsters drop (hide, feathers, scales, carapace, slick skin, ooze), and Herbalist Pheng brews aromatics (SP), remedies (status resistance and a cure) and ya dong (ATK/CRIT) from spirit ash, rubble and charms, plus every potion and talisman.')}</p>
  <p>${L('สูตรแบ่งตามช่วงเลเวล ใช้วัสดุชนิดใดก็ได้ในกลุ่มของช่วงนั้น จ่ายค่าทำ และเลือกจำนวนได้ · อาหาร 1 จาน + ยาบำรุง 1 ขวด ทำงานพร้อมกันได้ คนละ 5 นาที · เปิด "กินอาหาร/ยาบำรุงอัตโนมัติ" ในหน้าต่าง Auto ได้',
  'Recipes come in level bands; any material of that band\'s group will do, plus a fee, in any amount · one dish and one tonic can run together, 5 minutes each · Auto can eat them for you (Auto window)')}</p>`});
