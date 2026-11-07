/* VAYRATHEN — js/sys/rarity.js
   Item rarity. Every piece of armour, headgear, weapon or accessory that drops or is crafted rolls a rarity:
     ธรรมดา Common (white) · หายาก Rare (blue) · ล้ำค่า Epic (violet) · ตำนาน Legendary (gold)
   EVERY piece — dropped, crafted, bought, a reward — is a unique "instance" with RANDOM OPTIONS:
   its base stats get their own ±8% roll (×1.12 / ×1.28 / ×1.5 for Rare / Epic / Legendary) and it rolls
   1 / 2 / 3 / 4 random options (STR, Max HP %, CRIT, +% damage to a race …) whose strength is rolled ±25%
   and grows with the rarity. An instance lives in the save as S.inst[key] = {b base id, r rarity, q base
   rolls, o options, st final stats} and is registered into ITEMS under its own key (base~xxxxxx), so bag,
   equip, derive and trade treat it like any item. Reforging (Crafting, I) re-rolls the options.
   Visuals: coloured frame + corner gem on the icon, coloured names, a light pillar over rare drops on the
   ground, and a jingle per rarity. */
'use strict';

const RAR = [
  {th:'ธรรมดา', en:'Common', c:'#e8dcc4', mul:1, aff:1},
  {th:'หายาก', en:'Rare', c:'#5ab4ff', mul:1.12, aff:2},
  {th:'ล้ำค่า', en:'Epic', c:'#c77dff', mul:1.28, aff:3},
  {th:'ตำนาน', en:'Legendary', c:'#ffb830', mul:1.5, aff:4}];
const RAR_ODDS = {mob:[.70, .22, .07, .01], boss:[.30, .40, .22, .08], craft:[.5, .32, .14, .04], wb:[0, .35, .45, .2], shop:[.92, .07, .01, 0]};
/* random options: [key, weight per slot (weapon, armor, head, acc), value at item level L] */
const AFFIX = [
  ['str', [3, 1, 1, 2], L => 1 + Math.floor(L / 22)], ['agi', [3, 1, 1, 2], L => 1 + Math.floor(L / 22)], ['vit', [1, 3, 2, 2], L => 1 + Math.floor(L / 22)],
  ['int', [3, 1, 2, 2], L => 1 + Math.floor(L / 22)], ['dex', [3, 1, 1, 2], L => 1 + Math.floor(L / 22)], ['luk', [1, 1, 1, 3], L => 1 + Math.floor(L / 25)],
  ['hp', [1, 4, 3, 2], L => 20 + L * 4], ['sp', [1, 2, 2, 2], L => 10 + L], ['def', [0, 3, 2, 0], L => 1 + Math.floor(L / 12)], ['mdef', [0, 2, 3, 1], L => 1 + Math.floor(L / 15)],
  ['crit', [3, 0, 1, 3], L => 1 + Math.floor(L / 40)], ['atkPct', [3, 0, 1, 2], L => .02 + Math.min(.04, L / 3000)], ['matkPct', [3, 0, 1, 2], L => .02 + Math.min(.04, L / 3000)],
  ['hpPct', [0, 3, 2, 2], L => .02 + Math.min(.04, L / 3000)], ['spPct', [0, 1, 2, 2], L => .02 + Math.min(.05, L / 2500)],
  ['race', [3, 0, 0, 2], L => .04 + Math.min(.06, L / 2000)],
  // (v193) a target element, a target size, a status to shrug off (each rolls its own kind, like race)
  ['vsElem', [3, 0, 0, 1], L => .04 + Math.min(.06, L / 2000)], ['vsSize', [3, 0, 0, 1], L => .03 + Math.min(.05, L / 2400)], ['res', [0, 2, 3, 2], L => .08 + Math.min(.17, L / 700)],
  ['proc', [2, 0, 0, 0], L => .02 + Math.min(.015, L / 8000)]];   // a chance to inflict a status with each hit (weapons)
const OPT_PARAM = {race:() => RACES, vsElem:() => ELEM, vsSize:() => ['s', 'm', 'l'], res:() => ['poison', 'burn', 'bleed', 'slow', 'freeze', 'root', 'silence', 'blind', 'curse'], proc:() => ['poison', 'burn', 'bleed', 'slow', 'freeze', 'stun', 'blind', 'curse']};
const OPT_KEY = {vsElem:'vsElem_', vsSize:'vsSize_', res:'res_', proc:'proc_'};   // option → the stat key the game reads (race stays a table)
const RACES = ['brute', 'plant', 'insect', 'fish', 'undead', 'human', 'demon', 'angel', 'dragon', 'formless'];
const SLOT_I = {weapon:0, armor:1, head:2, acc:3};
const baseOf = id => (ITEMS[id] && ITEMS[id].base) || id;
const rarOf = id => (ITEMS[id] && ITEMS[id].rar) || 0;
const rarCol = id => RAR[rarOf(id)].c;
const rarName = (id, it = ITEMS[id]) => `<span class="rar r${(it && it.rar) || 0}">${nm(it)}</span>`;
const instStore = () => S.inst || (S.inst = {});
const isPlainGear = id => ITEMS[id] && ITEMS[id].kind === 'gear' && !ITEMS[id].base;

function rollRarity(src = 'mob'){
  const o = RAR_ODDS[src] || RAR_ODDS.mob, luk = 1 + Math.min(.4, ((DER && DER.b && DER.b.luk) || 0) * .004);   // LUK nudges the odds up to +40%
  let u = Math.random(); for (let r = 3; r >= 1; r--){ const p = o[r] * luk; if (u < p) return r; u -= p; }
  return 0;
}
/* roll n random options for a piece: each is [key, value] (race: [ 'race', value, race ]); higher rarity rolls stronger */
function rollOpts(base, r){
  const L = base.lv || 1, si = SLOT_I[base.slot] ?? 3, pool = AFFIX.filter(a => a[1][si] > 0), used = new Set(), out = [];
  for (let i = 0; i < RAR[r].aff && pool.length; i++){
    const tot = pool.reduce((s, a) => s + (used.has(a[0]) ? 0 : a[1][si]), 0); let u = Math.random() * tot, pick = null;
    for (const a of pool){ if (used.has(a[0])) continue; u -= a[1][si]; if (u <= 0){ pick = a; break; } }
    if (!pick) break; used.add(pick[0]);
    const k = pick[0], v = pick[2](L) * (.75 + Math.random() * .5) * (1 + r * .25);   // ±25% roll, +25% per rarity tier
    const pct = k.endsWith('Pct') || OPT_PARAM[k]; const ps = OPT_PARAM[k] && OPT_PARAM[k]();
    out.push(ps ? [k, +v.toFixed(3), ps[Math.floor(Math.random() * ps.length)]] : [k, pct ? +Math.max(.01, v).toFixed(3) : Math.max(1, Math.round(v))]);
  }
  return out;
}
/* base stats ×rarity, each with a small ±8% roll of its own, then the options added on top */
function instStats(base, r, opts, roll){
  const R = RAR[r], st = {};
  for (const k in base.st){ const v = base.st[k], q = roll && roll[k] != null ? roll[k] : 1;
    st[k] = typeof v !== 'number' || k === 'wtype' ? v : (k.endsWith('Pct') ? +(v * R.mul * q).toFixed(3) : Math.max(1, Math.round(v * R.mul * q))); }
  for (const [k, v, rc] of opts){
    if (k === 'race'){ st.race = st.race || {}; st.race[rc] = +(((st.race[rc] || 0) + v)).toFixed(3); }
    else if (OPT_KEY[k]){ const kk = OPT_KEY[k] + rc; st[kk] = +(((st[kk] || 0) + v)).toFixed(3); }
    else st[k] = +(((st[k] || 0) + v)).toFixed(3); }
  return st;
}
/* every piece of gear is an instance: rarity r (0 = common) with its own random options */
function makeInst(b, r = 0){
  const base = ITEMS[b]; if (!base || base.kind !== 'gear') return b;
  if (base.base) return b;
  const roll = {}; for (const k in base.st) if (typeof base.st[k] === 'number') roll[k] = +(.92 + Math.random() * .16).toFixed(3);
  const o = rollOpts(base, r), key = `${b}~${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 6)}`;
  instStore()[key] = {b, r, q:roll, o, st:instStats(base, r, o, roll)}; regInst(key, instStore()[key]);
  return key;
}
function regInst(key, d){
  const base = ITEMS[d.b]; if (!base) return false;
  ITEMS[key] = {...base, st:d.st, rar:d.r, base:d.b, opts:d.o || null, sell:Math.round((base.sell || 0) * (1 + d.r * .9))};
  return true;
}
/* new random options for an existing piece (reforge): same rarity, same base roll */
function rerollOpts(key){
  const d = instStore()[key]; if (!d) return null; const base = ITEMS[d.b]; d.o = rollOpts(base, d.r); d.st = instStats(base, d.r, d.o, d.q); regInst(key, d); return d;
}
/* text of the random options: "◆ STR +2 · ◆ +5% vs Brute" */
function optText(id){
  const it = ITEMS[id]; if (!it || !it.opts) return '';
  const P = v => Math.round(v * 100) + '%', ST = {poison:['พิษ', 'Poison'], burn:['ไฟลวก', 'Burn'], bleed:['เลือดไหล', 'Bleed'], slow:['เชื่องช้า', 'Slow'], freeze:['แช่แข็ง', 'Freeze'], root:['ตรึง', 'Root'], silence:['ใบ้', 'Silence'], blind:['ตาพร่า', 'Blind'], curse:['คำสาป', 'Curse']};
  return it.opts.map(([k, v, rc]) => '◆ ' + (k === 'race' ? L(`ดาเมจต่อเผ่า${RACE_TH[rc] || rc} +${P(v)}`, `+${P(v)} vs ${RACE_EN[rc] || rc}`)
    : k === 'vsElem' ? L(`ตีมอนธาตุ${ELEM_TH[rc] || rc} +${P(v)}`, `+${P(v)} vs ${ELEM_EN[rc] || rc} monsters`)
    : k === 'vsSize' ? L(`ตีมอนขนาด${SIZE_TH[rc] || rc} +${P(v)}`, `+${P(v)} vs ${SIZE_EN[rc] || rc} monsters`)
    : k === 'res' ? L(`ต้าน${(ST[rc] || [rc])[0]} ${P(v)}`, `${P(v)} to resist ${(ST[rc] || [rc, rc])[1]}`)
    : k === 'proc' ? L(`ตีแล้ว ${P(v)} ติด${(ST[rc] || {stun:['สลบ']}[rc] || [rc])[0]}`, `${P(v)} to inflict ${(ST[rc] || {stun:['', 'Stun']}[rc] || [rc, rc])[1]}`) : gearStatText({[k]:v}))).join(' · ');
}
/* the base part of an instance's stats (without its options), for showing the two apart */
function baseText(id){ const it = ITEMS[id]; if (!it || !it.base) return it && it.st ? gearStatText(it.st) : ''; const d = instStore()[id] || {}; const b = ITEMS[it.base];
  return gearStatText(instStats(b, d.r || 0, [], d.q)); }
/* clean an untrusted instance (from a trade or a save file): only known keys, clamped numbers */
const INST_KEYS = new Set(['wtype', 'watk', 'wmatk', 'atk', 'def', 'mdef', 'hp', 'sp', 'hpPct', 'spPct', 'atkPct', 'matkPct', 'crit', 'str', 'agi', 'vit', 'int', 'dex', 'luk', 'all', 'elem']);
function sanitizeInst(d){
  if (!d || typeof d !== 'object' || !ITEMS[d.b] || ITEMS[d.b].kind !== 'gear' || ITEMS[d.b].base) return null;
  const r = Math.max(0, Math.min(3, d.r | 0)), base = ITEMS[d.b];
  // the options are rebuilt into stats here, so a forged stat block cannot sneak in: only the option list counts
  const o = [], q = {};
  for (const x of Array.isArray(d.o) ? d.o.slice(0, 4) : []){ if (!Array.isArray(x)) continue; const [k, v, rc] = x;
    const af = AFFIX.find(a => a[0] === k), cap = af ? af[2](base.lv || 1) * 2.3 : 0;   // never above the best roll an item of this level can get
    if (OPT_PARAM[k]){ if (OPT_PARAM[k]().includes(rc) && typeof v === 'number' && isFinite(v)) o.push([k, +clamp(v, 0, cap).toFixed(3), rc]); continue; }   // race · vsElem · vsSize · res: a known kind only
    if (!af || typeof v !== 'number' || !isFinite(v)) continue; o.push([k, k.endsWith('Pct') ? +clamp(v, 0, cap).toFixed(3) : clamp(Math.round(v), 0, Math.ceil(cap))]); }
  for (const k in d.q || {}) if (typeof base.st[k] === 'number') q[k] = clamp(+d.q[k] || 1, .9, 1.1);
  if (!d.o && d.st){   // instances from before random options: keep their extra lines as options
    for (const k in d.st){ if (!INST_KEYS.has(k) || k === 'wtype' || k === 'elem') continue; const v = +d.st[k], bv = typeof base.st[k] === 'number' ? (k.endsWith('Pct') ? +(base.st[k] * RAR[r].mul).toFixed(3) : Math.round(base.st[k] * RAR[r].mul)) : 0;
      const extra = +(v - bv).toFixed(3); if (extra > 0 && o.length < 4) o.push([k, k.endsWith('Pct') ? clamp(extra, 0, .15) : clamp(Math.round(extra), 0, 3000)]); } }
  return {b:d.b, r, q, o, st:instStats(base, r, o, q)};
}
/* every instance a save carries must be in ITEMS before anything looks at the bag */
function instReg(s){
  if (!s) return;
  if (!s.v28 && typeof gonePurge === 'function'){ s.v28 = 1; s.inst = s.inst || {}; s.inv = s.inv || {}; s.gear = s.gear || {};   // v28: the six-place paper doll
    const r = gonePurge(s.inv, s.inst, s.gear); s.bia = (s.bia || 0) + r.z; s.cards = s.cards || {}; let c = 0;
    for (const k in r.cards){ s.cards[k] = (s.cards[k] || 0) + r.cards[k]; c += r.cards[k]; }
    if (s.cos) for (const k of GONE_SL) delete s.cos[k];
    if (r.n || c) s.v28note = {n:r.n, z:r.z, c}; }
  const st = s.inst || {};
  for (const k in st){ const d = sanitizeInst(st[k]); if (d && regInst(k, d)) st[k] = d; else delete st[k]; }
  for (const k in s.inv || {}) if (!ITEMS[k]) delete s.inv[k];
  for (const sl in s.gear || {}) if (s.gear[sl] && !ITEMS[s.gear[sl]]) s.gear[sl] = null;
}
/* drop instances nobody holds any more (sold, salvaged, left on the ground) */
function instPrune(){
  const st = S.inst; if (!st) return; const keep = new Set([...Object.keys(S.inv), ...Object.values(S.gear || {}), ...LOOT.map(l => l.id)]);
  if (typeof TRADE !== 'undefined' && TRADE.mine) for (const o of TRADE.mine.items) keep.add(o[0]);
  for (const k in st) if (!keep.has(k)) delete st[k];
}
/* a monster or boss drop: roll its rarity and announce the good ones */
function rollGear(b, src, x, y){
  if (ITEMS[b] && ITEMS[b].base) return b;
  const r = rollRarity(src), id = makeInst(b, r);
  if (r >= 1 && x != null){ addText(x, y - 46, L(RAR[r].th + '!', RAR[r].en + '!'), RAR[r].c, r >= 2 ? 16 : 13); SFX.play('drop' + r); }
  if (r >= 3){ banner(L(`✦ ไอเทมตำนาน: ${nm(ITEMS[id])} ✦`, `✦ Legendary: ${nm(ITEMS[id])} ✦`)); bump('legend'); }
  if (r >= 2) bump('epic');
  return id;
}
/* the visual of a piece is always its base item (instances look like the base, just glow on the icon) */
function visGear(g){
  const out = {}; for (const k in g || {}) out[k] = g[k] ? baseOf(g[k]) : g[k];
  if (S && S.cos && g === S.gear){ if (S.cos.top && typeof COSTUME !== 'undefined' && COSTUME[S.cos.top]) out.armor = S.cos.top; if (S.cos.head && COSTUME[S.cos.head]) out.head = S.cos.head; }
  return out;
}
/* icon: the base art with a rarity frame, a soft inner glow and a corner gem */
{ const _art = itemArt;
  itemArt = function(id, bare = false){
    let s = _art(id, bare); const it = ITEMS[id]; if (!it || !it.rar) return s;
    const c = RAR[it.rar].c;
    const over = bare ? `<circle cx="34" cy="6" r="3.4" fill="${c}" stroke="#1c120e" stroke-width="1"/>`
      : `<rect x="1.5" y="1.5" width="37" height="37" rx="8" fill="none" stroke="${c}" stroke-width="2.4"/><rect x="3.6" y="3.6" width="32.8" height="32.8" rx="6.5" fill="none" stroke="${c}" stroke-opacity=".35" stroke-width="2.6"/>
         <path d="M6 2.2l3.4 3.4L6 9 2.6 5.6z" fill="${c}" stroke="#1c120e" stroke-width=".8"/>${it.rar >= 3 ? `<path d="M34 2.2l3.4 3.4L34 9l-3.4-3.4z" fill="${c}" stroke="#1c120e" stroke-width=".8"/>` : ''}`;
    return s.replace(/<\/svg>$/, over + '</svg>');
  };
}
/* stats text adds a rarity line for instances */
function rarLine(id){ const r = rarOf(id); return r ? `<span class="rar r${r}">◆ ${L(RAR[r].th, RAR[r].en)}</span>` : ''; }

/* every way gear reaches the bag (shop, quest, loot, unwear of an old plain piece …) gives a rolled instance */
{ const _add = addItem;
  addItem = function(id, n){ if (isPlainGear(id)){ for (let i = 0; i < n; i++) _add(makeInst(id, 0), 1); return; } _add(id, n); }; }
/* saves from before random options: plain gear in the bag and worn becomes common pieces with options (once) */
function gearUpgradeOld(){
  if (!S || S.gv >= 2) return; S.gv = 2; let n = 0;
  for (const k of Object.keys(S.inv)) if (isPlainGear(k)){ const c = S.inv[k]; delete S.inv[k]; for (let i = 0; i < c; i++){ S.inv[makeInst(k, 0)] = 1; n++; } }
  for (const sl in S.gear || {}) if (S.gear[sl] && isPlainGear(S.gear[sl])){ S.gear[sl] = makeInst(S.gear[sl], 0); n++; }
  if (n){ derive(); log(L(`อุปกรณ์ ${n} ชิ้นได้ออฟชั่นสุ่มแล้ว`, `${n} pieces of gear received random options`), 'g'); dirty = true; save(); }
}
EV.on('tick', () => { if (!PAUSED && S && S.lvl && !(S.gv >= 2)) gearUpgradeOld(); });
/* base stats + the random options on their own line (HTML) */
function gearLines(id){ const it = ITEMS[id]; if (!it || !it.st) return ''; const o = optText(id); return `${it.base ? baseText(id) : gearStatText(it.st)}${o ? `<span class="optl">${o}</span>` : ''}`; }
