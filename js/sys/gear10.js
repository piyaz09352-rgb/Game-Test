/* VAYRATHEN — js/sys/gear10.js — gear worth hunting (v29)
   · Legendary (ตำนาน) pieces come only from bosses (region bosses, world bosses, boss rampages). Monsters, crafting and
     shops roll at most Epic.
   · Every boss belongs to one class line and drops that line's own gear: its class weapon or a piece of its line set
     (35% per kill, Legendary 18%). The boss's line shows on its status bar and in the item's details.
   · Class weapons for all seven lines: the boxer's ไม้นวมเทวะ (Deva Gauntlets) and the thief's กริชพยัคฆ์ราตรี
     (Night Tiger Kris) join the five older ones.
   · Line sets for every stage: Lv 40 (ชุดฝึกตน) and Lv 90 (ชุดยอดฝีมือ) for each of the seven lines, 4 pieces each
     (armour, head, legs, feet), with 2- and 4-piece bonuses; the Lv 150 class sets stay on top.
   · The item details are drawn anew: a card with the rarity banner, a big icon, type, level, hands and class line,
     the base stats and the random options as separate chips, sockets and the cards in them, the set and its bonuses
     (lit when active), where it comes from and its price. Used in the bag and for worn pieces. */
'use strict';

const G10_LINES = ['blade', 'rune', 'muay', 'ranger', 'healer', 'rogue', 'summoner'];
const g10LineName = l => (JOBS[l] ? L(JOBS[l].name, JOBS[l].en) : l);

/* ---------- Legendary only from bosses ---------- */
const G10_BOSS_SRC = new Set(['boss', 'wb', 'rampage', 'fury']);
{ const _rr = rollRarity;
  rollRarity = function(src = 'mob'){ const r = _rr.apply(this, arguments); return r >= 3 && !G10_BOSS_SRC.has(src) ? 2 : r; }; }

/* ---------- the two missing class weapons ---------- */
WEAPON_TIERS.forEach(([lv, tth, ten], i) => {
  const ak0 = 18 + lv * 1.25, P0 = Math.round((400 + lv * lv * 9) * 1.25);
  const add = (id, th, en, st, look) => { if (ITEMS[id]) return; GEAR_LIST.push([id, 'weapon', th, en, lv, P0, st]); GEAR[id] = {id, slot:'weapon', name:th, en, lv, buy:P0, st, pack:1};
    ITEMS[id] = {name:th, en, buy:P0, sell:Math.round(P0 * .1), kind:'gear', slot:'weapon', lv, st, pack:1}; if (SPR.GEAR_LOOK[look]) SPR.GEAR_LOOK[id] = SPR.GEAR_LOOK[look]; };
  add(`w_kfist${i}`, `ไม้นวมเทวะ${tth}`, `${ten} Deva Gauntlets`, {wtype:'fist', hands:'2h', glove:1, line:'muay', watk:Math.round(ak0 * .8 * 1.3), atkPct:+(.03 + i * .005).toFixed(3), hp:Math.round(30 + lv * 3.2), ...(i >= 2 ? {str:i + 1} : {})}, `w_glove${i}`);
  add(`w_ndagger${i}`, `กริชพยัคฆ์ราตรี${tth}`, `${ten} Night Tiger Kris`, {wtype:'dagger', hands:'1h', line:'rogue', watk:Math.round(ak0 * .82 * 1.25), crit:5 + i, ...(i >= 2 ? {agi:i + 1} : {})}, `w_dagger${i}`);
});
{ const TINT = {kfist:[300, '#ff7ad8'], ndagger:[250, '#9a8aff']};
  const _art = itemArt; itemArt = function(id){ let s = _art.apply(this, arguments); const b = (ITEMS[id] && ITEMS[id].base) || id, m = /^w_(kfist|ndagger)\d+$/.exec(b); if (!m) return s; const [h, c] = TINT[m[1]];
    return s.replace(/(<svg[^>]*>)/, `$1<g style="filter:hue-rotate(${h}deg) saturate(1.4)">`).replace(/<\/svg>$/, `</g><circle cx="33" cy="33" r="5" fill="${c}" stroke="#fff" stroke-width="1.4"/><path d="M33 30.2l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill="#fff"/></svg>`); }; }
const G10_CW = {blade:'bsword', rune:'estaff', muay:'kfist', ranger:'wbow', healer:'hstaff', rogue:'ndagger', summoner:'sstaff'};

/* ---------- line sets for Lv 40 and Lv 90 ---------- */
const G10_TIERS = [[1, 40, 'ฝึกตน', 'Adept', .45], [2, 90, 'ยอดฝีมือ', 'Master', .7]];
const G10_SET_SLOTS = [['armor', 'เสื้อ', 'Vest'], ['head', 'มาลา', 'Circlet'], ['pants', 'สนับ', 'Greaves'], ['shoes', 'รองเท้า', 'Boots']];
const g10Near = (slot, lv) => { let best = null; for (const g of GEAR_LIST) if (g[1] === slot && g[4] <= lv && !g[6].line && !/^cs_/.test(g[0]) && (!best || g[4] > best[4])) best = g; return best; };
const g10Scale = (b, k) => { const o = {}; for (const key in b) o[key] = typeof b[key] === 'number' ? +(b[key] * k).toFixed(3) : b[key]; return o; };
for (const line of G10_LINES){ if (!CSET[line]) continue; const [th, en, b2, b4] = CSET[line];
  for (const [t, lv, tth, ten, k] of G10_TIERS){ const key = `${line}${t}`;
    CSET[key] = [`${tth}${th}`, `${en} ${ten}`, g10Scale(b2, k), g10Scale(b4, k)];
    for (const [slot, sth, sen] of G10_SET_SLOTS){ const id = `cs_${key}_${slot === 'pants' ? 'legs' : slot}`, near = g10Near(slot, lv); if (!near) continue;
      const st = {}; for (const s in near[6]) st[s] = typeof near[6][s] === 'number' ? Math.round(near[6][s] * 1.15 * 100) / 100 : near[6][s];
      Object.assign(st, {line, cset:key});
      ITEMS[id] = {name:`${sth}${tth}${th}`, en:`${en} ${ten} ${sen}`, kind:'gear', slot, lv, st, buy:0, sell:Math.round(400 + lv * lv * 2), artAs:near[0], desc:[`ชุดประจำสาย${g10LineName(line)} · ${tth}`, `${g10LineName(line)} line set · ${ten}`]};
      if (SPR.GEAR_LOOK[near[0]]) SPR.GEAR_LOOK[id] = SPR.GEAR_LOOK[near[0]]; } } }
const g10SetIds = line => Object.keys(ITEMS).filter(id => /^cs_/.test(id) && ITEMS[id].st && ITEMS[id].st.line === line && !ITEMS[id].base);

/* ---------- every boss drops its own line ---------- */
const G10_BOSS_LINE = {};
if (typeof BOSSES !== 'undefined') BOSSES.forEach(([id], i) => { G10_BOSS_LINE[id] = G10_LINES[i % G10_LINES.length]; });
if (MOB.boss) G10_BOSS_LINE.boss = 'blade';
const g10BossLine = m => (m && (G10_BOSS_LINE[m.type] || (m.def && m.def.boss ? G10_LINES[(m.def.lvl || 1) % 7] : null)));
function g10LinePiece(line, lvl){
  const pool = [], cw = G10_CW[line];
  WEAPON_TIERS.forEach(([lv], i) => { const id = `w_${cw}${i}`; if (ITEMS[id] && lv <= lvl + 5 && lv >= lvl - 45) pool.push(id, id); });
  for (const id of g10SetIds(line)) if (ITEMS[id].lv <= lvl + 5 && ITEMS[id].lv >= lvl - 70) pool.push(id);
  if (!pool.length){ const lo = WEAPON_TIERS.filter(([lv]) => lv <= lvl + 5).length - 1; if (lo >= 0 && ITEMS[`w_${cw}${lo}`]) pool.push(`w_${cw}${lo}`); }
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
EV.on('kill', m => { if (!m || !m.def || !m.def.boss || m.minion || m.dummy) return; const line = g10BossLine(m); if (!line || Math.random() >= .35) return;
  const b = g10LinePiece(line, m.def.lvl || 1); if (!b) return; const r = Math.random() < .18 ? 3 : Math.max(1, rollRarity('boss')), id = makeInst(b, r);
  if (ITEMS[id]) ITEMS[id].src = line; const d = S.inst && S.inst[id]; if (d) d.src = line;
  dropLoot(id, m.x + rand(-14, 14), m.y + rand(-8, 8));
  if (r >= 3){ banner(L(`✦ ของตำนานสาย${g10LineName(line)}: ${nm(ITEMS[id])} ✦`, `✦ Legendary ${g10LineName(line)} gear: ${nm(ITEMS[id])} ✦`)); SFX.play('drop3'); } });
/* the boss's line on its status bar */
{ const st = document.createElement('style'); st.textContent = `.g10line{font:600 11px var(--thai,sans-serif);color:#ffd36a}`; document.head.appendChild(st); }

/* ---------- the item details, drawn anew ---------- */
const G10_SLOT = {weapon:['อาวุธ', 'Weapon'], shield:['โล่', 'Shield'], head:['หมวก', 'Headgear'], armor:['เกราะ', 'Armour'], pants:['กางเกง', 'Legs'], shoes:['รองเท้า', 'Feet'], acc:['เครื่องประดับ', 'Accessory'], };
Object.defineProperty(G10_SLOT, 'ammo', {enumerable:true, get:() => (typeof ammoWant === 'function' && ammoWant() === 'star' ? ['ดาวกระจาย', 'Throwing stars'] : ['ลูกธนู', 'Arrows'])});   // (v190)
const g10Num = s => String(s).replace(/(\d+\.\d{2,})/g, m => String(Math.round(+m * 10) / 10));
const g10Chips = s => g10Num(String(s || '').replace(/<[^>]+>/g, '')).split(/\s·\s/).map(x => x.replace(/^◆\s*/, '').trim()).filter(x => x && !/เฉพาะสาย| line only/.test(x));
function g10Src(id){ const it = ITEMS[id], b = ITEMS[baseOf(id)] || it, r = rarOf(id), src = (it && it.src) || (S.inst && S.inst[id] && S.inst[id].src);
  if (src) return L(`ดรอปจากบอสสาย${g10LineName(src)}`, `Dropped by a ${g10LineName(src)} line boss`);
  if (r >= 3) return L('ของตำนาน · ดรอปจากบอสเท่านั้น', 'Legendary · bosses only');
  if (b && b.st && b.st.line) return L(`บอสสาย${g10LineName(b.st.line)} · ดันเจี้ยน`, `${g10LineName(b.st.line)} line bosses · dungeons`);
  if (b && b.buy && !b.starter) return L('มอนสเตอร์ · คราฟต์ · ร้านค้า', 'Monsters · crafting · shops');
  return L('มอนสเตอร์ · คราฟต์', 'Monsters · crafting'); }
function g10Set(id){ const it = ITEMS[id], cs = it && it.st && it.st.cset; if (!cs || !CSET[cs]) return ''; const n = S ? (csetCount()[cs] || 0) : 0, [th, en] = CSET[cs];
  return `<div class="gdx-set"><div class="gdx-h">${L(`เซต ${th}`, `${en} set`)} <span class="ct">${n}/4</span></div>
    <div class="gdx-sb${n >= 2 ? ' on' : ''}"><b>2</b>${g10Num(csetTxt(CSET[cs][2]))}</div><div class="gdx-sb${n >= 4 ? ' on' : ''}"><b>4</b>${g10Num(csetTxt(csetBonus(cs, 4)))}</div></div>`; }
function g10Detail(id, o = {}){
  const it = ITEMS[id]; if (!it) return ''; const b = ITEMS[baseOf(id)] || it, st = it.st || {}, r = rarOf(id), R = RAR[r];
  const hands = st.wtype ? handsTxt(handsOf(st)) : '', wt = st.wtype && typeof WTYPE !== 'undefined' && WTYPE[st.wtype] ? L(...WTYPE[st.wtype]) : '';
  const line = (b.st && b.st.line) ? `<span class="gdx-tag line">${L(`เฉพาะสาย${g10LineName(b.st.line)}`, `${g10LineName(b.st.line)} line only`)}</span>` : '';
  const lvOk = !it.lv || S.lvl >= it.lv, sl = it.slot === 'acc2' ? 'acc' : it.slot;
  const base = g10Chips(it.base ? baseText(id) : gearStatText(st)), opts = g10Chips(optText(id));
  const n = typeof sockN === 'function' && EQ_SOCKET.includes(it.slot) ? sockN(id) : 0, cs = n ? sockCards(id) : [];
  const desc = it.desc || b.desc ? L(...((it.desc || b.desc) instanceof Array ? (it.desc || b.desc) : [it.desc || b.desc, it.desc || b.desc])) : '';
  return `<div class="gdx r${r}" data-gs="${typeof gr270Slot === 'function' ? gr270Slot(it) || '' : ''}" style="--rc:${R.c}">
    <div class="gdx-band"><span>${L(R.th, R.en)}</span>${it.rf ? `<em>+${it.rf}</em>` : ''}</div>
    <div class="gdx-top"><span class="gdx-ic">${itemIcon(id)}</span><div class="gdx-id"><b class="rar r${r}">${escH(nm(it))}${it.rf ? ` <em class="eqrf">+${it.rf}</em>` : ''}</b>
      <div class="gdx-tags"><span class="gdx-tag">${L(...(G10_SLOT[sl] || [sl, sl]))}</span>${wt ? `<span class="gdx-tag">${wt}</span>` : ''}${hands ? `<span class="gdx-tag">${hands}</span>` : ''}${it.lv ? `<span class="gdx-tag${lvOk ? '' : ' bad'}">Lv ${it.lv}</span>` : ''}${line}</div></div></div>
    ${base.length ? `<div class="gdx-h">${L('ค่าพื้นฐาน', 'Base stats')}</div><div class="gdx-chips">${base.map(x => `<span>${x}</span>`).join('')}</div>` : ''}
    ${opts.length ? `<div class="gdx-h">${L('ออปชันสุ่ม', 'Random options')} <span class="ct">${opts.length}</span></div><div class="gdx-chips opt">${opts.map(x => `<span>◆ ${x}</span>`).join('')}</div>` : ''}
    ${EQ_SOCKET.includes(it.slot) ? `<div class="gdx-h">${L('ช่อง Card', 'Card sockets')} <span class="ct">${cs.length}/${n}</span></div><div class="gdx-socks">${n ? Array.from({length:n}, (_, i) => cs[i] ? `<span class="on" title="${escH(cardDesc(cs[i]))}">◆ ${escH(nm(CARDS[cs[i]]))}</span>` : `<span>◇ ${L('ว่าง', 'empty')}</span>`).join('') : `<span class="none">${L('ไม่มีช่อง · เจาะได้ที่ช่างเจาะมณี', 'None · Driller Manee can drill one')}</span>`}</div>` : ''}
    ${g10Set(id)}
    ${desc ? `<p class="gdx-desc">${desc}</p>` : ''}
    <div class="gdx-foot"><span>${L('ที่มา', 'Source')}: ${g10Src(id)}</span>${it.sell ? `<span>${L('ขาย', 'Sells')} ${fmtN(it.sell)} ${CUR()}</span>` : ''}${o.n ? `<span>×${fmtN(o.n)}</span>` : ''}</div>
  </div>`;
}
{ const _bi = bagInfo;
  bagInfo = function(){ _bi.apply(this, arguments); const box = el('bagInfo'), id = BAG.sel, it = id && ITEMS[id]; if (!box || !it || it.kind !== 'gear' || BAG.tab === 'card') return;
    const act = box.querySelector('[data-wear]'), x = box.querySelector('[data-bagclose]'); box.innerHTML = g10Detail(id, {n:S.inv[id] || 0}) + (typeof cmpHTML === 'function' ? cmpHTML(id) : '');   // ▲/▼ against what is worn (compare.js)
    const row = document.createElement('div'); row.className = 'gdx-act'; if (act) row.appendChild(act); box.appendChild(row); if (x) box.appendChild(x); box.classList.add('g10'); }; }
cuInfo = function(sl){
  const id = S.gear && S.gear[sl], it = id && ITEMS[id]; if (!it) return;
  cuModal(`${g10Detail(id)}<div class="sec">${L('ใส่การ์ด', 'Slot cards')}</div>${cuSockets(sl)}
    <div class="row"><button class="btn danger" data-unwear="${sl}" data-cuclose="1">${L('ถอดชิ้นนี้', 'Take it off')}</button><button class="btn" data-cuclose="1">${L('ปิด', 'Close')}</button></div>`, 'g10');
  CU.info = sl;
};
{ const st = document.createElement('style');
  st.textContent = `#bagInfo.g10{display:block;max-height:min(300px,46vh);overflow-y:auto;overscroll-behavior:contain}
  .gdx{position:relative;border-radius:12px;padding:0 10px 8px;background:linear-gradient(180deg,color-mix(in srgb,var(--rc) 22%,#161c3c),#0e1330 70%);border:1.5px solid color-mix(in srgb,var(--rc) 70%,transparent);box-shadow:0 0 18px color-mix(in srgb,var(--rc) 25%,transparent),inset 0 1px 0 rgba(255,255,255,.08);color:#f2ead6;font:13px/1.35 var(--body,sans-serif)}
  .gdx-band{display:flex;justify-content:space-between;align-items:center;margin:0 -10px 8px;padding:3px 12px;border-radius:10px 10px 0 0;background:linear-gradient(90deg,var(--rc),color-mix(in srgb,var(--rc) 35%,transparent));color:#14102a;font:800 11px/1.4 var(--display,sans-serif);letter-spacing:.12em;text-transform:uppercase}
  .gdx-band em{font-style:normal}
  .gdx.r3 .gdx-band{background:linear-gradient(90deg,#fff0b0,#ffb830 45%,#c8701a);animation:gdxShine 3s linear infinite;background-size:200% 100%}
  @keyframes gdxShine{to{background-position:-200% 0}}
  .gdx-top{display:flex;gap:10px;align-items:center}.gdx-ic{flex:0 0 56px;width:56px;height:56px;display:grid;place-items:center;border-radius:12px;background:radial-gradient(circle,color-mix(in srgb,var(--rc) 35%,transparent),rgba(0,0,0,.35));border:1px solid color-mix(in srgb,var(--rc) 60%,transparent)}
  .gdx-ic svg,.gdx-ic img{width:46px;height:46px}.gdx-id{min-width:0}.gdx-id b{font:700 15px/1.25 var(--thai,sans-serif);display:block}
  .gdx-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.gdx-tag{font-size:10.5px;padding:1px 7px;border-radius:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14)}
  .gdx-tag.line{color:#ffd36a;border-color:rgba(255,211,106,.5)}.gdx-tag.bad{color:#ff8a80;border-color:rgba(255,120,110,.6)}
  .gdx-h{margin:9px 0 4px;font:700 11px var(--thai,sans-serif);color:#e8c26a;letter-spacing:.04em;display:flex;gap:6px;align-items:center}.gdx-h::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(232,194,106,.5),transparent)}
  .gdx-chips{display:flex;flex-wrap:wrap;gap:4px}.gdx-chips span{font-size:11.5px;padding:2px 8px;border-radius:7px;background:rgba(255,255,255,.07)}
  .gdx-chips.opt span{background:color-mix(in srgb,var(--rc) 18%,transparent);color:#fff;border:1px solid color-mix(in srgb,var(--rc) 45%,transparent)}
  .gdx-socks{display:flex;flex-wrap:wrap;gap:4px}.gdx-socks span{font-size:11px;padding:2px 8px;border-radius:7px;border:1px dashed rgba(255,255,255,.25);opacity:.8}.gdx-socks span.on{border-style:solid;border-color:#9ad8ff;color:#cfeeff;opacity:1}.gdx-socks .none{border:none;opacity:.6}
  .gdx-set{margin-top:4px}.gdx-sb{font-size:11.5px;opacity:.55;padding:2px 0}.gdx-sb b{display:inline-grid;place-items:center;width:16px;height:16px;margin-right:6px;border-radius:50%;background:rgba(255,255,255,.12);font-size:10px}
  .gdx-sb.on{opacity:1;color:#9cf0a8}.gdx-sb.on b{background:#4ad87a;color:#04210c}
  .gdx-desc{margin:8px 0 0;font-size:11.5px;opacity:.75;font-style:italic}
  .gdx-foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px;margin-top:9px;padding-top:6px;border-top:1px solid rgba(255,255,255,.1);font-size:11px;opacity:.85}
  .gdx-act{display:flex;justify-content:flex-end;gap:6px;margin-top:6px}
  .cubox.g10{max-width:420px}.cubox.g10 .gdx{margin-top:22px}`;
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'gear10', t:['ของตำนานและของประจำสาย', 'Legendary and line gear'], b:() => `<p>${L('ของระดับตำนานดรอปจากบอสเท่านั้น · บอสแต่ละตัวประจำหนึ่งสายอาชีพ ดรอปอาวุธประจำคลาสหรือชุดเซตของสายนั้น (35% ต่อการล้ม · ตำนาน 18%) · ชุดเซตประจำสาย Lv 40 · Lv 90 · Lv 150 อย่างละ 4 ชิ้น ใส่ครบ 2/4 ชิ้นได้โบนัส · อาวุธประจำคลาสครบทั้ง 7 สาย', 'Legendary gear drops only from bosses · each boss belongs to a class line and drops that line\'s class weapon or set pieces (35% a kill · Legendary 18%) · line sets at Lv 40 · 90 · 150, 4 pieces each, with 2/4-piece bonuses · class weapons for all 7 lines')}</p>`});
/* the boss's line on the target frame */
/* (v57) the boss's gear line is no longer a chip on its frame: the wiki's boss page lists every reward */
