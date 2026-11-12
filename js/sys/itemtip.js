/* VAYRATHEN — js/sys/itemtip.js — (v94) one item card everywhere
   Point at any item with the mouse (bag, shops, bank, market, trade, rewards, a drop on the ground …) or, on a phone,
   tap its picture or long-press its row: a card shows everything about it. Gear shows the card of this piece next to
   the piece you wear in that slot and what changes (▲ green better, ▼ red worse); everything else (potions,
   materials, ammo, keys) gets the same kind of card: rarity, type, what it does, which monsters drop it, prices and
   how many you have. Replaces the Blacksmith-only card of v55 (bktip.js).
   Every item picture says which item it is (data-iid on its outer tag), so new windows get the card for free. */
'use strict';

const ITIP = {id:null, src:'', w:0, h:0, lp:0, touch:0};
/* every item picture carries its id (not the bare copies drawn on the canvas) */
{ const _art = itemArt;
  itemArt = function(id, bare = false){ const s = _art.apply(this, arguments); return bare ? s : s.replace(/^(\s*<[a-zA-Z]+)/, `$1 data-iid="${escH(String(id))}"`); }; }

/* which monsters drop it (built once, the first time a card asks) */
let ITIP_SRC = null;
function itDropBy(id){
  if (!ITIP_SRC){ ITIP_SRC = {};
    for (const k in MOB){ const m = MOB[k]; for (const d of m.drops || []){ const a = ITIP_SRC[d[0]] || (ITIP_SRC[d[0]] = []); if (a.length < 8) a.push([k, d[1]]); } } }
  const b = (ITEMS[id] && ITEMS[id].base) || id;
  return (ITIP_SRC[id] || ITIP_SRC[b] || []).slice().sort((a, c) => c[1] - a[1]).slice(0, 3);
}
const IT_KIND = {use:['ใช้งาน', 'Usable'], etc:['ของดรอป', 'Loot'], mat:['วัตถุดิบ', 'Material'], ammo:['ลูกธนู / กระสุน', 'Ammo'], key:['ของสำคัญ', 'Key item'], gear:['อุปกรณ์', 'Gear']};
/* the card for anything that is not gear (gear uses g10Detail) */
function itCard(id){
  const it = ITEMS[id]; if (!it) return '';
  const have = (S.inv && S.inv[id]) || 0;
  if (it.kind === 'gear' && typeof g10Detail === 'function') return g10Detail(id, {n:have});
  const mat = (it.kind === 'etc' || it.kind === 'mat') && typeof ia270Tier === 'function', r = mat ? ia270Tier(id) : rarOf(id), R = RAR[r] || RAR[0], k = IT_KIND[it.kind] || ['ไอเท็ม', 'Item'];   // (v270) materials have a tier too
  const fx = [it.heal ? `HP +${fmtN(it.heal)}` : '', it.spheal ? `SP +${fmtN(it.spheal)}` : '', it.st && typeof gearStatText === 'function' ? gearStatText(it.st) : ''].filter(Boolean);
  const chips = fx.join(' · ').split(' · ').filter(Boolean);
  const by = itDropBy(id), desc = itemDesc(id);
  const src = by.length ? by.map(([m, p]) => `${escH(L(MOB[m].name, MOB[m].en || MOB[m].name))} <small>${p >= 1 ? '100%' : (p * 100).toFixed(p < .01 ? 2 : 1) + '%'}</small>`).join(' · ')
    : it.buy ? L('ร้านค้า', 'Shops') : L('ภารกิจ · กิจกรรม · คราฟต์', 'Quests · events · crafting');
  return `<div class="gdx r${r}"${mat ? ` data-gs="m-${ia270Fam(id)}"` : ''} style="--rc:${R.c}">
    <div class="gdx-band"><span>${L(R.th, R.en)}</span></div>
    <div class="gdx-top"><span class="gdx-ic">${itemIcon(id)}</span><div class="gdx-id"><b class="rar r${r}">${escH(nm(it))}</b>
      <div class="gdx-tags"><span class="gdx-tag">${L(...k)}</span>${it.lv ? `<span class="gdx-tag${!it.lv || S.lvl >= it.lv ? '' : ' bad'}">Lv ${it.lv}</span>` : ''}${have ? `<span class="gdx-tag">${L('มี', 'Have')} ×${fmtN(have)}</span>` : ''}</div></div></div>
    ${chips.length ? `<div class="gdx-h">${L('ผล', 'Effect')}</div><div class="gdx-chips">${chips.map(x => `<span>${x}</span>`).join('')}</div>` : ''}
    ${desc ? `<p class="gdx-desc">${desc}</p>` : ''}
    <div class="gdx-foot"><span>${L('ที่มา', 'Source')}: ${src}</span>${it.buy ? `<span>${L('ซื้อ', 'Buy')} ${fmtN(it.buy)} ${CUR()}</span>` : ''}${it.sell ? `<span>${L('ขาย', 'Sells')} ${fmtN(it.sell)} ${CUR()}</span>` : ''}</div>
  </div>`;
}
/* the whole card: this piece, and how it compares with what you wear */
function itTipHTML(id){
  const it = ITEMS[id]; if (!it) return '';
  if (it.kind !== 'gear') return `<div class="it-col">${itCard(id)}</div>`;
  const c = typeof cmpOf === 'function' ? cmpOf(id) : null, worn = c && c.worn && c.worn !== id && ITEMS[c.worn] ? c.worn : null;
  const wornNow = Object.values(S.gear || {}).includes(id);
  return `<div class="it-col"><div class="it-h">${wornNow ? L('ที่สวมอยู่', 'Worn now') : L('ชิ้นนี้', 'This piece')}</div>${itCard(id)}</div>`
    // (v115) the worn piece's own full card is not repeated: the comparison below already names it and shows the gaps
    + (!wornNow ? `<div class="it-cmp">${itCmpTable(id)}</div>` : '');
}
function itTipEl(){ let t = el('itTip'); if (!t){ t = document.createElement('div'); t.id = 'itTip'; t.className = 'ittip'; t.hidden = true; t.setAttribute('role', 'tooltip'); document.body.appendChild(t); } return t; }
function itShow(id, x, y, src){
  if (!ITEMS[id]) return itHide();
  const t = itTipEl();
  if (ITIP.id !== id){   // drawn once per item, measured once: moving the mouse only moves it
    ITIP.id = id; t.style.transform = ''; t.innerHTML = itTipHTML(id); t.hidden = false; ITIP.w = t.offsetWidth; ITIP.h = t.offsetHeight; }
  ITIP.src = src || ''; t.hidden = false;
  const vw = innerWidth, vh = innerHeight, s = Math.min(1, (vw - 16) / ITIP.w, (vh - 16) / ITIP.h), w = ITIP.w * s, h = ITIP.h * s;
  let left = x + 18; if (left + w > vw - 8) left = x - w - 18; left = Math.max(8, Math.min(vw - w - 8, left));
  const top = Math.max(8, Math.min(vh - h - 8, y - h / 2));
  t.style.transform = `translate(${Math.round(left)}px,${Math.round(top)}px)${s < 1 ? ` scale(${s.toFixed(3)})` : ''}`;
}
function itHide(){ if (!ITIP.id) return; const t = el('itTip'); if (t) t.hidden = true; ITIP.id = null; ITIP.src = ''; }

/* what the pointer is on: an item picture, or a list row with exactly one item in it (the Blacksmith's rows by their checkbox) */
function itAt(t){
  if (!t || !t.closest || t.closest('#itTip')) return null;
  { const c = t.closest('button,input,select,textarea,label,.qty,.btn'); if (c && !c.matches('[data-iid]') && !c.querySelector('[data-iid]')) return null; }   // (v192) never over a buy button, an amount box or a tick (the card covered what you were pressing); item tiles that are buttons (bag squares) still show it
  const p = t.closest('[data-iid]'); if (p && ITEMS[p.dataset.iid]) return p.dataset.iid;
  const bk = t.closest('.bkrow'), cb = bk && bk.querySelector('[data-bk]'); if (cb){ const id = cb.dataset.bk.split('|').slice(1).join('|'); if (ITEMS[id]) return id; }
  const row = t.closest('.srow,.item,.mkrow,.trow,.rwrow'); if (!row) return null;
  const ps = row.querySelectorAll('[data-iid]'); return ps.length === 1 && ITEMS[ps[0].dataset.iid] ? ps[0].dataset.iid : null;
}
/* (v116) one card at a time, without flicker — the usual tooltip timing (PatternFly, OUI, …):
   · a short rest (250 ms) before the first card, so sweeping the mouse over a full bag does not flash cards;
   · once one is up (or for 300 ms after it closes, "warm"), the next item swaps in at once;
   · leaving closes it at once;
   · no hover card over a box that already shows the item in full: the gear-slot box (cuModal, with "ถอดชิ้นนี้"),
     the bag's detail strip (bagInfo) and the item card itself — and none at all while the gear-slot box is open. */
const ITIP_T = {show:250, warm:300, timer:0, want:null, warmUntil:0};
const itNoHover = t => !!(t && t.closest && t.closest('#cuModal,#bagInfo,.baginfo,#itTip')) || !!(el('cuModal') && !el('cuModal').hidden && el('cuModal').offsetParent !== null);
document.addEventListener('mousemove', e => {
  if (Date.now() - ITIP.touch < 800) return;   // the mouse events a phone makes after a tap
  const id = itNoHover(e.target) ? null : itAt(e.target), x = e.clientX, y = e.clientY;
  if (!id){ clearTimeout(ITIP_T.timer); ITIP_T.want = null; if (ITIP.src === 'ui'){ itHide(); ITIP_T.warmUntil = performance.now() + ITIP_T.warm; } return; }
  if (ITIP.id === id || ITIP.src === 'ui' && ITIP.id || performance.now() < ITIP_T.warmUntil){ clearTimeout(ITIP_T.timer); ITIP_T.want = null; itShow(id, x, y, 'ui'); return; }
  ITIP_T.lx = x; ITIP_T.ly = y;
  if (ITIP_T.want !== id){ ITIP_T.want = id; clearTimeout(ITIP_T.timer);
    ITIP_T.timer = setTimeout(() => { if (ITIP_T.want === id) itShow(id, ITIP_T.lx, ITIP_T.ly, 'ui'); ITIP_T.want = null; }, ITIP_T.show); }
}, {passive:true});
/* a click opens a box of its own (slot box, detail strip): the hover card steps aside */
document.addEventListener('mousedown', () => { clearTimeout(ITIP_T.timer); ITIP_T.want = null; if (ITIP.src === 'ui') itHide(); }, true);
/* a drop on the ground: pointing shows its card too (picking it up still needs a click) */
cv.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  if (hoverLoot && ITEMS[hoverLoot.id]) itShow(hoverLoot.id, e.clientX, e.clientY, 'loot'); else if (ITIP.src === 'loot') itHide();
});
cv.addEventListener('pointerleave', () => { if (ITIP.src === 'loot') itHide(); });
/* phones: tap an item picture, or hold a row; the next touch anywhere closes it */
document.addEventListener('touchstart', e => {
  ITIP.touch = Date.now(); clearTimeout(ITIP.lp);
  const id = itAt(e.target), p = e.touches[0];
  if (!id){ itHide(); return; }
  if (ITIP.id === id){ itHide(); return; }
  if (e.target.closest('[data-iid]')){ itShow(id, p.clientX, p.clientY, 'touch'); return; }
  itHide(); ITIP.lp = setTimeout(() => itShow(id, p.clientX, p.clientY, 'touch'), 380);
}, {passive:true});
document.addEventListener('touchmove', () => clearTimeout(ITIP.lp), {passive:true});
document.addEventListener('touchend', () => clearTimeout(ITIP.lp), {passive:true});
document.addEventListener('scroll', itHide, {capture:true, passive:true});
document.addEventListener('keydown', e => { if (e.key === 'Escape') itHide(); });
{ const _c = closeWin; closeWin = function(){ itHide(); return _c.apply(this, arguments); }; }
/* the item it shows changed (refined, socketed, sold …): draw it again next time */
EV.on('tick', () => { if (ITIP.id && !ITEMS[ITIP.id]) itHide(); });
{ const st = document.createElement('style');
  st.textContent = `.ittip{position:fixed;left:0;top:0;z-index:9999;display:flex;flex-wrap:wrap;align-items:flex-start;gap:8px;width:max-content;max-width:min(640px,calc(100vw - 16px));padding:8px;border-radius:14px;
    background:#fffaf0;border:2px solid #8a3f00;box-shadow:0 8px 24px rgba(0,0,0,.35);color:#141414;pointer-events:none;font-family:Sarabun,sans-serif;transform-origin:0 0;will-change:transform}
  .ittip[hidden]{display:none}
  .ittip .it-col{flex:1 1 280px;min-width:0;max-width:310px}
  .ittip .it-col:only-child{max-width:340px}
  .ittip .it-h{font:800 12.5px Sarabun,sans-serif;color:#141414;margin:0 0 4px 2px}
  .ittip .it-col.worn .it-h{color:#0b4f96}
  .ittip .it-cmp{flex:1 1 100%}
  .ittip .it-cmp:empty{display:none}
  .ittip .cmp{background:#f3ead8 !important;border-color:#c9b48a !important;color:#141414 !important}
  .ittip .cmp b.up,.ittip .cmpd .up{color:#13703a !important}.ittip .cmp b.dn,.ittip .cmpd .dn{color:#a3180c !important}
  .ittip .cmp small{color:#3f3a35 !important}
  .ittip .gdx-foot small{color:#3f3a35}
  @media (max-width:640px){ .ittip .it-col{flex-basis:240px} }`;
  document.head.appendChild(st); }
/* (v55) the season-1 archive was removed on the owner's request; drop this browser's copy too (once per browser:
   a later season reset writes a fresh archive that must stay) */
try { if (!localStorage.getItem('vayrathen-arch1-purged')){ localStorage.removeItem('vayrathen-archive-1'); localStorage.setItem('vayrathen-arch1-purged', '1'); } } catch (e) {}

/* (v148) the comparison as numbers, stat by stat: what you have now with what you wear → what you would have with this
   piece, and the change. (The old line said "ดีกว่า"/"แย่กว่า" from a weighted score — it could say "better" while ATK
   and MATK fell sharply — and showed only the differences.) */
function itCmpTable(id){
  const it = ITEMS[id]; if (!it || it.kind !== 'gear') return '';
  if (typeof canWield === 'function' && !canWield(it)) return `<div class="cmp"><small>${L('อาชีพนี้ใช้ไม่ได้ จึงไม่เปรียบเทียบ', 'Not for this class, so no comparison')}</small></div>`;
  const c = typeof cmpOf === 'function' ? cmpOf(id) : null; if (!c || typeof CMP_STATS === 'undefined') return '';
  const vs = c.worn && ITEMS[c.worn] ? `<span class="rar r${ITEMS[c.worn].rar || 0}">${escH(nm(ITEMS[c.worn]))}</span>` : L('ช่องว่าง', 'an empty slot');
  const fmt = (v, u) => (u === 'x' ? Math.round(v * 100) + '%' : (Math.round(v * 10) / 10).toLocaleString() + (u || ''));
  const rows = CMP_STATS.filter(([k]) => c.d[k]).map(([k, n, u]) => { const now = +(DER && DER[k]) || 0, d = c.d[k], then = now + d;
    return `<tr class="${d > 0 ? 'up' : 'dn'}"><td>${typeof cmpName === 'function' ? cmpName(n) : n}</td><td>${fmt(now, u)}</td><td class="arr">→</td><td><b>${fmt(then, u)}</b></td><td class="dd">${d > 0 ? '▲ +' : '▼ −'}${fmt(Math.abs(d), u)}</td></tr>`; });
  const up = CMP_STATS.filter(([k]) => c.d[k] > 0).length, dn = CMP_STATS.filter(([k]) => c.d[k] < 0).length;
  return `<div class="cmp ctab"><div class="cth"><b>${L('เทียบกับที่สวมอยู่', 'Compared with what you wear')}</b> <small>${vs}${c.lvOk ? '' : ` · ${L(`ต้อง Lv ${it.lv}`, `needs Lv ${it.lv}`)}`}</small>
    <span class="ccount"><i class="up">▲ ${up}</i> <i class="dn">▼ ${dn}</i></span></div>
    ${rows.length ? `<table><thead><tr><th></th><th>${L('ตอนนี้', 'Now')}</th><th></th><th>${L('ถ้าใส่ชิ้นนี้', 'With this')}</th><th></th></tr></thead><tbody>${rows.join('')}</tbody></table>` : `<small>${L('ค่าสถานะไม่เปลี่ยน', 'No stat changes')}</small>`}</div>`;
}
{ const st = document.createElement('style'); st.textContent = `
#itTip .cmp.ctab{padding:8px 10px}#itTip .cmp.ctab .cth{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;margin-bottom:4px}
#itTip .cmp.ctab .ccount{margin-left:auto;font-style:normal}#itTip .cmp.ctab .ccount i{font-style:normal;font-weight:800;margin-left:6px}
#itTip .cmp.ctab table{width:100%;border-collapse:collapse;font-size:12.5px}#itTip .cmp.ctab th{font-weight:600;color:#8a7a5a;text-align:right;font-size:11px;padding:0 4px}
#itTip .cmp.ctab td{padding:2px 4px;text-align:right;white-space:nowrap}#itTip .cmp.ctab td:first-child{text-align:left;font-weight:700;color:#4a3a1a}
#itTip .cmp.ctab td.arr{color:#a89a7a;padding:0}#itTip .cmp.ctab tr.up td.dd,#itTip .cmp.ctab .ccount .up{color:#17794e}#itTip .cmp.ctab tr.dn td.dd,#itTip .cmp.ctab .ccount .dn{color:#b8322a}
#itTip .cmp.ctab tr:nth-child(odd){background:rgba(255,240,205,.45)}`; document.head.appendChild(st); }
/* no browser name bubble on top of the card: an item picture keeps its name for screen readers, not as a title */
document.addEventListener('mouseover', e => { const t = e.target.closest && e.target.closest('[title][data-bagsel],[data-bagsel] [title],[data-eqinfo][title]'); if (t && t.title){ t.setAttribute('aria-label', t.title); t.removeAttribute('title'); } }, {passive:true, capture:true});
