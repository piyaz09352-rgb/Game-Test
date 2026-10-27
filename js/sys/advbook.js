/* VAYRATHEN — js/sys/advbook.js — the Adventurer's Book (สมุดนักผจญภัย) (v29)
   Everything the hero finds, beats and makes is written in one book, and every page pays a little for good.
     มอนสเตอร์  Monsters: each species and boss is written in at its first kill; 50 and 300 kills (bosses 10 and 30)
               earn more stars. Pages are grouped by region.                     Every 100 points: ATK & MATK +1%
     สะสมของ    Collection: put an item in the book (it is used up): monster materials 1 point, gear 2 points
               (only plain gear: no refine, no cards in it).                     Every 60 points: Max HP & SP +1%
     การ์ด      Cards: every card the hero has ever held.                         Every 40 points: CRIT +0.5 · HIT +3
     อาหาร     Food: every dish cooked or found.                                  Every 15 points: DEF & MDEF +2
     ตีบวก     Refining: an item reaching +5 / +10 / +15 (each item once).       Every 20 points: ATK & MATK +5 · DEF +3
     ดันเจี้ยน   Dungeons: first clear, 10 clears and 50 clears of each.          Every 15 points: FLEE +2 · HIT +2
     สถิติ      Records: every counter the game keeps, on one page.
   The bonuses are on as soon as a page is written; the book's level is all points / 50. */
'use strict';

const BK_CAT = [['mob', 'มอนสเตอร์', 'Monsters', 100], ['item', 'สะสมของ', 'Collection', 60], ['card', 'การ์ด', 'Cards', 40], ['food', 'อาหาร', 'Food', 15],
  ['rf', 'ตีบวก', 'Refining', 20], ['dg', 'ดันเจี้ยน', 'Dungeons', 15], ['stat', 'สถิติ', 'Records', 0]];
const BK_RW = {mob:{atkPct:.01, matkPct:.01}, item:{hpPct:.01, spPct:.01}, card:{crit:.5, hit:3}, food:{def:2, mdef:2}, rf:{atk:5, matk:5, def:3}, dg:{flee:2, hit:2}};
const BK_RWTXT = {atkPct:v => `ATK +${Math.round(v * 100)}%`, matkPct:v => `MATK +${Math.round(v * 100)}%`, hpPct:v => `Max HP +${Math.round(v * 100)}%`, spPct:v => `Max SP +${Math.round(v * 100)}%`,
  crit:v => `CRIT +${+v.toFixed(1)}`, hit:v => `HIT +${v}`, def:v => `DEF +${v}`, mdef:v => `MDEF +${v}`, atk:v => `ATK +${v}`, matk:v => `MATK +${v}`, flee:v => `FLEE +${v}`};
const bk = () => { const b = S.book || (S.book = {}); for (const k of ['k', 'm', 'g', 'c', 'f', 'r', 'd']) if (!b[k]) b[k] = {}; return b; };
const BK_FOOD = () => [...new Set([...(typeof COOK !== 'undefined' ? COOK.map(c => c[2]) : []), ...(typeof CK_RCP !== 'undefined' ? CK_RCP.filter(r => r.who === 'cook').map(r => r.out) : [])])].filter(id => ITEMS[id]);
const BK_DG = () => (typeof DUNGEONS !== 'undefined' ? DUNGEONS : []);
const bkBoss = t => !!(MOB[t] && MOB[t].boss);
const bkMobPts = t => { const n = bk().k[t] || 0; if (!n) return 0; return bkBoss(t) ? 3 + (n >= 10 ? 2 : 0) + (n >= 30 ? 2 : 0) : 1 + (n >= 50 ? 1 : 0) + (n >= 300 ? 1 : 0); };
const bkStars = t => { const n = bk().k[t] || 0, [a, b] = bkBoss(t) ? [10, 30] : [50, 300]; return n ? 1 + (n >= a) + (n >= b) : 0; };
function bkPts(){ const b = bk(), o = {};
  o.mob = Object.keys(b.k).reduce((s, t) => s + bkMobPts(t), 0);
  o.item = Object.keys(b.m).length + Object.keys(b.g).length * 2;
  o.card = Object.keys(b.c).length * 2;
  o.food = Object.keys(b.f).length * 5;
  o.rf = Object.values(b.r).reduce((s, v) => s + (v >= 5 ? 2 : 0) + (v >= 10 ? 5 : 0) + (v >= 15 ? 10 : 0), 0);
  o.dg = Object.values(b.d).reduce((s, v) => s + (v >= 1 ? 5 : 0) + (v >= 10 ? 5 : 0) + (v >= 50 ? 5 : 0), 0);
  return o; }
function bkBonus(){ const p = bkPts(), out = {}; for (const [c, , , per] of BK_CAT){ if (!per) continue; const n = Math.floor((p[c] || 0) / per); for (const k in BK_RW[c]) out[k] = (out[k] || 0) + BK_RW[c][k] * n; } return out; }
const bkTxt = o => Object.entries(o).filter(([, v]) => v).map(([k, v]) => BK_RWTXT[k] ? BK_RWTXT[k](v) : '').filter(Boolean).join(' · ');
{ const _d = derive;
  derive = function(){ const r = _d.apply(this, arguments); if (!DER || !S || !S.book) return r; const B = bkBonus();
    if (B.atkPct) DER.atk = Math.round(DER.atk * (1 + B.atkPct)); if (B.matkPct) DER.matk = Math.round(DER.matk * (1 + B.matkPct));
    if (B.hpPct) DER.maxhp = Math.round(DER.maxhp * (1 + B.hpPct)); if (B.spPct) DER.maxsp = Math.round(DER.maxsp * (1 + B.spPct));
    if (B.atk) DER.atk += B.atk; if (B.matk) DER.matk += B.matk; if (B.def) DER.def += B.def; if (B.mdef) DER.mdef += B.mdef;
    if (B.crit) DER.crit = +(DER.crit + B.crit).toFixed(1); if (B.hit) DER.hit += B.hit; if (B.flee) DER.flee += B.flee;
    return r; }; }

/* ---------- writing pages ---------- */
let BK_DIRTY = 0;
function bkNote(th, en){ log(L(`📖 สมุดนักผจญภัย: ${th}`, `📖 Adventurer's Book: ${en}`), 'g'); BK_DIRTY = 1; }
EV.on('kill', m => { if (!S || !m || !m.type || !MOB[m.type] || m.minion || m.dummy || m.wb) return; const b = bk(), was = bkStars(m.type);
  b.k[m.type] = (b.k[m.type] || 0) + 1; const now = bkStars(m.type);
  if (now > was){ const n = nm(MOB[m.type]); bkNote(was ? `${n} ${'★'.repeat(now)}` : `พบ${n}`, was ? `${n} ${'★'.repeat(now)}` : `new entry: ${n}`); derive(); } dirty = true; });
EV.on('dungeon', id => { if (!S || id == null) return; const b = bk(); b.d[id] = (b.d[id] || 0) + 1; if ([1, 10, 50].includes(b.d[id])){ bkNote(`ผ่านดันเจี้ยน ×${b.d[id]}`, `dungeon cleared ×${b.d[id]}`); derive(); } });
function bkScan(){
  if (!S || !S.inv) return; const b = bk(); let ch = 0;
  const card = c => { if (CARDS[c] && !b.c[c]){ b.c[c] = 1; ch++; bkNote(`การ์ดใหม่ ${nm(CARDS[c])}`, `new card: ${nm(CARDS[c])}`); } };
  for (const c in S.cards || {}) if (S.cards[c] > 0) card(c);
  for (const sl in S.slots || {}) if (S.slots[sl]) card(S.slots[sl]);
  for (const k in S.inst || {}){ const d = S.inst[k]; if (d && Array.isArray(d.c)) d.c.forEach(c => c && card(c)); }
  for (const k in S.inv){ if (CARDS[k]) card(k); }
  for (const f of BK_FOOD()) if (S.inv[f] && !b.f[f]){ b.f[f] = 1; ch++; bkNote(`อาหารใหม่ ${nm(ITEMS[f])}`, `new dish: ${nm(ITEMS[f])}`); }
  const rf = (key, v, name) => { if (v >= 5 && (b.r[key] || 0) < v){ const old = b.r[key] || 0; b.r[key] = v; if ([5, 10, 15].some(t => old < t && v >= t)){ ch++; bkNote(`${name} +${v}`, `${name} +${v}`); } } };
  for (const k in S.inst || {}){ const d = S.inst[k]; if (d && d.rf) rf(baseOf(k), d.rf, nm(ITEMS[baseOf(k)] || ITEMS[k])); }
  if (S.refine) rf('jobw_' + S.job, S.refine, nm(JOBS[S.job].weapon));
  if (ch){ derive(); dirty = true; }
}
{ let t = 0; EV.on('tick', dt => { t += dt; if (t < 2.5) return; t = 0; bkScan(); if (BK_DIRTY){ BK_DIRTY = 0; reWin('book'); } }); }
EV.on('refine', () => setTimeout(bkScan, 50));

/* ---------- putting items in the book ---------- */
const bkMatOk = id => /^m_/.test(id) && ITEMS[id] && MOB[id.slice(2)];
const bkGearOk = id => { const it = ITEMS[id], base = baseOf(id); if (!it || it.kind !== 'gear' || !ITEMS[base]) return false; const d = S.inst && S.inst[id];
  return !(d && (d.rf || (Array.isArray(d.c) && d.c.some(Boolean)))); };
const bkCanPut = id => (bkMatOk(id) ? !bk().m[id] : bkGearOk(id) ? !bk().g[baseOf(id)] : false);
function bkPut(id){ if (!S.inv[id] || !bkCanPut(id)) return false; const b = bk();
  if (bkMatOk(id)) b.m[id] = 1; else b.g[baseOf(id)] = 1;
  S.inv[id]--; if (S.inv[id] <= 0) delete S.inv[id]; return true; }

/* ---------- the window ---------- */
mkWin('book', 'สมุดนักผจญภัย', "Adventurer's Book", '', '<path d="M4 4.5A1.5 1.5 0 015.5 3H16v14H5.5A1.5 1.5 0 014 15.5z"/><path d="M4 15.5A1.5 1.5 0 015.5 14H16M8 7h5M8 10h4"/>');
const BKW = {tab:'mob', map:1, filt:'all'};
const bkPic = t => { try { return typeof petPic === 'function' ? petPic(t) : ''; } catch (e) { return ''; } };
WIN_RENDER.book = function(){
  const pane = el('pane-book'); if (!pane) return; bkScan(); const b = bk(), p = bkPts(), tot = Object.values(p).reduce((s, v) => s + v, 0), B = bkBonus();
  const head = `<div class="bkhead"><div class="bklv"><small>${L('ระดับสมุด', 'Book level')}</small><b>${Math.floor(tot / 50) + 1}</b><div class="bkbar"><i style="width:${(tot % 50) * 2}%"></i></div><small>${fmtN(tot)} ${L('แต้ม', 'pts')}</small></div>
    <div class="bkbon"><small>${L('โบนัสจากสมุดตอนนี้', 'Book bonus now')}</small><span>${bkTxt(B) || L('ยังไม่มี · เริ่มบันทึกได้เลย', 'none yet · start writing')}</span></div></div>`;
  const tabs = `<div class="wktabs bktabs">${BK_CAT.map(([k, th, en]) => `<button class="wktab${BKW.tab === k ? ' on' : ''}" data-bktab="${k}"><span>${L(th, en)}</span>${k !== 'stat' ? `<em>${fmtN(p[k] || 0)}</em>` : ''}</button>`).join('')}</div>`;
  const cat = BK_CAT.find(c => c[0] === BKW.tab), per = cat[3];
  const ladder = per ? `<div class="bkrw">${L('ทุก', 'Every')} ${per} ${L('แต้ม', 'pts')}: <b>${bkTxt(BK_RW[cat[0]])}</b> · ${L('ตอนนี้', 'now')} ${bkTxt(Object.fromEntries(Object.entries(BK_RW[cat[0]]).map(([k, v]) => [k, v * Math.floor((p[cat[0]] || 0) / per)]))) || '—'}
    <div class="bkbar sm"><i style="width:${((p[cat[0]] || 0) % per) / per * 100}%"></i></div></div>` : '';
  let body = '';
  if (BKW.tab === 'mob'){
    const regs = MAPS.filter(m => m.id && m.mobs && m.mobs.length).sort((a, c) => a.lv[0] - c.lv[0]), mp = MAPS[BKW.map] && MAPS[BKW.map].mobs ? MAPS[BKW.map] : regs[0];
    const list = [...mp.mobs, mp.boss].filter(t => MOB[t]), got = list.filter(t => b.k[t]).length;
    const allN = Object.keys(MOB).filter(t => SPECIES_ARCH[t] || MOB[t].boss).length, allGot = Object.keys(b.k).length;
    const card = t => { const n = b.k[t] || 0, s = bkStars(t), d = MOB[t], [a, c] = bkBoss(t) ? [10, 30] : [50, 300];
      return `<div class="bkmob${n ? ' on' : ''}${d.boss ? ' boss' : ''}">${n ? `<img src="${bkPic(t)}" alt="" loading="lazy">` : '<span class="q">?</span>'}<b>${n ? nm(d) : '???'}</b><small>Lv ${d.lvl}${d.boss ? ' · Boss' : ''}</small>
        <span class="st">${'★'.repeat(s)}${'☆'.repeat(3 - s)}</span><small>${n ? `${L('ล้ม', 'kills')} ${fmtN(n)}${s < 3 ? ` · ${L('ดาวต่อไป', 'next')} ${s < 2 ? a : c}` : ''}` : L('ยังไม่พบ', 'not found')}</small></div>`; };
    body = `<div class="bkbar2"><select class="bksel" data-bkmap="1">${regs.map(m => `<option value="${m.id}" ${m.id === mp.id ? 'selected' : ''}>${nm(m)} · Lv ${m.lv[0]}–${m.lv[1]} (${[...m.mobs, m.boss].filter(t => b.k[t]).length}/${m.mobs.length + 1})</option>`).join('')}</select>
      <span class="ct">${L('ทั้งโลก', 'whole world')} ${allGot}/${allN}</span></div><p class="hint">${nm(mp)} · ${got}/${list.length} · ${L('ล้มครั้งแรก ★ · 50 ตัว ★★ · 300 ตัว ★★★ (บอส 1 · 10 · 30)', 'first kill ★ · 50 ★★ · 300 ★★★ (bosses 1 · 10 · 30)')}</p><div class="bkgrid">${list.map(card).join('')}</div>`;
  } else if (BKW.tab === 'item'){
    const can = Object.keys(S.inv).filter(bkCanPut), mats = Object.keys(b.m).length, gears = Object.keys(b.g).length;
    const row = id => `<div class="srow"><span class="ic">${itemIcon(id)}</span><div class="nm"><b>${nm(ITEMS[id])}</b><small>${bkMatOk(id) ? L('วัตถุดิบ · 1 แต้ม', 'material · 1 pt') : L('อุปกรณ์ · 2 แต้ม', 'gear · 2 pts')} · ${L('มี', 'have')} ${S.inv[id]}</small></div><button class="btn sm gold" data-bkput="${id}">${L('บันทึก', 'Add')}</button></div>`;
    body = `<p class="hint">${L(`บันทึกแล้ว: วัตถุดิบ ${mats} · อุปกรณ์ ${gears} · ใส่ของลงสมุดแล้วของชิ้นนั้นจะหายไป (ชนิดละครั้ง) · อุปกรณ์ที่ตีบวกหรือมีการ์ดใส่ไม่ได้`, `Written: ${mats} materials · ${gears} gear · an item put in the book is used up (once per kind) · refined or carded gear can't go in`)}</p>
      ${can.length ? `<button class="btn wide gold" data-bkputall="1">${L(`บันทึกวัตถุดิบทั้งหมด (${can.filter(bkMatOk).length})`, `Add all materials (${can.filter(bkMatOk).length})`)}</button><div class="shop">${can.slice(0, 80).map(row).join('')}</div>`
        : `<p class="hint">${L('ในกระเป๋ายังไม่มีของใหม่ให้บันทึก', 'Nothing new in the bag to add')}</p>`}`;
  } else if (BKW.tab === 'card'){
    const all = Object.keys(CARDS), got = all.filter(c => b.c[c]);
    body = `<p class="hint">${L(`พบการ์ดแล้ว ${got.length}/${all.length} · ได้การ์ดมาถือครั้งแรกก็บันทึกเอง`, `${got.length}/${all.length} cards found · written the first time you hold one`)}</p>
      <div class="bkgrid sm">${got.slice(-120).reverse().map(c => `<div class="bkmob on"><span class="ic">${itemIcon(c)}</span><b>${nm(CARDS[c])}</b><small>${CARDS[c].desc ? L(...CARDS[c].desc) : ''}</small></div>`).join('') || `<p class="hint">${L('ยังไม่พบการ์ด', 'No cards yet')}</p>`}</div>`;
  } else if (BKW.tab === 'food'){
    body = `<div class="bkgrid sm">${BK_FOOD().map(f => `<div class="bkmob${b.f[f] ? ' on' : ''}">${b.f[f] ? `<span class="ic">${itemIcon(f)}</span><b>${nm(ITEMS[f])}</b>` : '<span class="q">?</span><b>???</b>'}<small>${b.f[f] ? L('5 แต้ม', '5 pts') : L('ยังไม่เคยทำ', 'not cooked yet')}</small></div>`).join('')}</div>`;
  } else if (BKW.tab === 'rf'){
    const rows = Object.entries(b.r).sort((a, c) => c[1] - a[1]);
    body = `<p class="hint">${L('อุปกรณ์แต่ละชนิดที่ตีบวกถึง +5 (2 แต้ม) +10 (5 แต้ม) +15 (10 แต้ม)', 'Each item refined to +5 (2 pts) · +10 (5 pts) · +15 (10 pts)')}</p>
      <div class="shop">${rows.map(([k, v]) => `<div class="srow"><span class="ic">${ITEMS[k] ? itemIcon(k) : '⚒'}</span><div class="nm"><b>${ITEMS[k] ? nm(ITEMS[k]) : nm(JOBS[k.slice(5)] ? JOBS[k.slice(5)].weapon : {name:k})} +${v}</b><small>${[5, 10, 15].map(t => (v >= t ? `✓+${t}` : `+${t}`)).join(' · ')}</small></div></div>`).join('') || `<p class="hint">${L('ยังไม่มีอุปกรณ์ที่ตีถึง +5', 'Nothing refined to +5 yet')}</p>`}</div>`;
  } else if (BKW.tab === 'dg'){
    body = `<div class="shop">${BK_DG().map(D => { const n = b.d[D.id] || 0; return `<div class="srow${n ? ' owned' : ''}"><span class="ic">⚔</span><div class="nm"><b>${nm(D)}</b><small>Lv ${D.min}+ · ${L('ผ่าน', 'cleared')} ${n} · ${[1, 10, 50].map(t => (n >= t ? `✓${t}` : t)).join(' · ')}</small></div></div>`; }).join('')}</div>`;
  } else {
    const ST = [['kills', 'มอนที่ล้ม', 'Monsters defeated'], ['bosses', 'บอสที่ล้ม', 'Bosses defeated'], ['wbkills', 'บอสโลก', 'World bosses'], ['deaths', 'ล้มลง', 'Times fallen'],
      ['captures', 'จับสัตว์', 'Captures'], ['refines', 'ตีบวก', 'Refines'], ['crafts', 'ประดิษฐ์', 'Crafts'], ['cards', 'ได้การ์ด', 'Cards got'], ['fish', 'ตกปลา', 'Fish caught'],
      ['dungeons', 'ผ่านดันเจี้ยน', 'Dungeons'], ['dailies', 'ภารกิจรายวัน', 'Dailies'], ['campjobs', 'งานแคมป์', 'Camp jobs'], ['pvpwins', 'ชนะ PvP', 'PvP wins'], ['siege', 'สงครามปราสาท', 'Siege'],
      ['trades', 'แลกเปลี่ยน', 'Trades'], ['potions', 'ใช้ยา', 'Potions used'], ['pickups', 'เก็บของ', 'Pick-ups'], ['skills', 'ใช้สกิล', 'Skills used'], ['epic', 'ของ Epic', 'Epic drops'], ['legend', 'ของตำนาน', 'Legendary drops']];
    const extra = [[L('Base Lv', 'Base Lv'), S.lvl], [L('ภูมิภาคที่ไปแล้ว', 'Regions visited'), `${Object.keys(S.visited || {}).length}/${MAPS.length}`], [L('ชนิดมอนที่พบ', 'Species found'), Object.keys(b.k).length],
      [L('อาชีพที่ปลด', 'Classes unlocked'), S.cls ? Object.keys(S.cls.have || {}).length : 1], [L('เงิน', 'Bia'), fmtN(S.bia)]];
    body = `<div class="bkstats">${[...extra.map(([a, v]) => `<div><small>${a}</small><b>${typeof v === 'number' ? fmtN(v) : v}</b></div>`), ...ST.map(([k, th, en]) => `<div><small>${L(th, en)}</small><b>${fmtN(sv(k))}</b></div>`)].join('')}</div>`;
  }
  pane.innerHTML = head + tabs + ladder + body;
};
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-bktab],[data-bkput],[data-bkputall]'); if (!t) return;
  if (t.dataset.bktab){ BKW.tab = t.dataset.bktab; WIN_RENDER.book(); return; }
  if (t.dataset.bkput){ if (bkPut(t.dataset.bkput)){ SFX.play('craft'); bkNote(`บันทึก ${nm(ITEMS[baseOf(t.dataset.bkput)] || ITEMS[t.dataset.bkput])}`, `added ${nm(ITEMS[baseOf(t.dataset.bkput)] || ITEMS[t.dataset.bkput])}`); derive(); dirty = true; save(); } WIN_RENDER.book(); return; }
  if (t.dataset.bkputall){ let n = 0; for (const id of Object.keys(S.inv).filter(bkMatOk)) if (bkPut(id)) n++; if (n){ SFX.play('craft'); bkNote(`บันทึกวัตถุดิบ ${n} ชนิด`, `added ${n} materials`); derive(); dirty = true; save(); } WIN_RENDER.book(); }
});
document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.bkmap){ BKW.map = +e.target.value; WIN_RENDER.book(); } });
{ const st = document.createElement('style');
  st.textContent = `#win-book{width:min(660px,94vw)}.bkhead{display:flex;gap:10px;margin-bottom:8px}.bklv{min-width:110px;padding:8px;border-radius:12px;background:linear-gradient(160deg,rgba(255,211,106,.18),rgba(10,14,36,.6));border:1px solid rgba(255,211,106,.45);text-align:center}
  .bklv b{display:block;font-size:26px;color:#ffd36a}.bklv small,.bkbon small{display:block;opacity:.75;font-size:11px}.bkbon{flex:1;padding:8px 10px;border-radius:12px;background:rgba(10,14,36,.55);border:1px solid rgba(160,170,255,.25);font-size:12px}
  .bkbar{height:6px;border-radius:4px;background:rgba(255,255,255,.12);overflow:hidden;margin:4px 0}.bkbar i{display:block;height:100%;background:linear-gradient(90deg,#ffd36a,#ff9c4a)}.bkbar.sm{height:4px}
  .bktabs .wktab em{font-style:normal;font-size:10px;opacity:.7;margin-left:4px}.bkrw{font-size:12px;margin:6px 0;padding:6px 8px;border-radius:10px;background:rgba(255,211,106,.08)}
  .bkbar2{display:flex;gap:8px;align-items:center;margin:6px 0}.bksel{flex:1;min-width:0;padding:6px;border-radius:8px;background:#141a3a;color:inherit;border:1px solid rgba(160,170,255,.35)}
  .bkgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:6px}.bkgrid.sm{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
  .bkmob{display:flex;flex-direction:column;align-items:center;text-align:center;gap:1px;padding:6px;border-radius:10px;background:rgba(10,14,36,.55);border:1px solid rgba(160,170,255,.18);opacity:.55}
  .bkmob.on{opacity:1;border-color:rgba(255,211,106,.4)}.bkmob.boss.on{border-color:#ff7a7a;background:linear-gradient(160deg,rgba(255,90,90,.16),rgba(10,14,36,.6))}
  .bkmob img{width:52px;height:52px;object-fit:contain;image-rendering:pixelated}.bkmob .q{width:52px;height:52px;display:grid;place-items:center;font-size:26px;opacity:.5}
  .bkmob b{font-size:12px;line-height:1.2}.bkmob small{font-size:10px;opacity:.75}.bkmob .st{color:#ffd36a;font-size:12px;letter-spacing:1px}.bkmob .ic{width:36px;height:36px}
  .bkstats{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px}.bkstats div{padding:8px;border-radius:10px;background:rgba(10,14,36,.55);border:1px solid rgba(160,170,255,.2)}.bkstats small{display:block;opacity:.7;font-size:11px}.bkstats b{font-size:16px;color:#ffd36a}`;
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'advbook', t:['สมุดนักผจญภัย', "Adventurer's Book"], b:() => `<p>${L('ทุกอย่างที่พบ ล้ม และทำ ถูกบันทึกลงสมุด และให้ค่าพลังถาวร', 'Everything you find, defeat and make is written in the book, and pays permanent stats')}</p>
  <ul>${BK_CAT.filter(c => c[3]).map(([k, th, en, per]) => `<li><b>${L(th, en)}</b>: ${L('ทุก', 'every')} ${per} ${L('แต้ม', 'pts')} ${bkTxt(BK_RW[k])}</li>`).join('')}</ul>`});
