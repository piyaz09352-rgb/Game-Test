/* VAYRATHEN — js/sys/bagsub.js — (v115) the bag, a bigger grid, and weapons sorted by kind
   · The Equipment tab gets a row of chips under the search box: ทั้งหมด, then one chip per kind of weapon in the bag
     (ดาบ · ดาบสองมือ · มีดสั้น · มีดคู่ · คทา · ไม้เท้ายาว · สนับมือ · ธนู) and one per other slot (หมวก, เสื้อ, …).
     Only kinds you actually carry are shown, each with how many.
   · The grid's squares are twice as big as before (84 px minimum instead of 42), with the icon filling them. */
'use strict';

const BAG_SUB = [
  ['sword1', 'ดาบ', 'Swords'], ['sword2', 'ดาบสองมือ', 'Greatswords'], ['dagger1', 'มีดสั้น', 'Daggers'], ['dagger2', 'มีดคู่', 'Twin daggers'],
  ['staff1', 'คทา', 'Rods'], ['staff2', 'ไม้เท้ายาว', 'Long staves'], ['fist', 'สนับมือ', 'Knuckles'], ['bow', 'ธนู', 'Bows'], ['weapon', 'อาวุธอื่น', 'Other weapons'],
  ['shield', 'โล่', 'Shields'], ['head', 'หมวก', 'Head'], ['armor', 'เสื้อ', 'Body'], ['pants', 'กางเกง', 'Legs'], ['shoes', 'รองเท้า', 'Feet'], ['acc', 'เครื่องประดับ', 'Accessories'], ['ammo', 'ลูกธนู', 'Arrows']];
/* which chip an item belongs to */
function bagSubOf(id){
  const it = ITEMS[id]; if (!it) return null;
  if (it.kind === 'ammo') return 'ammo';
  if (it.kind !== 'gear') return null;
  if (it.slot !== 'weapon') return it.slot;
  const b = typeof hdBase === 'function' ? hdBase(id) || it : it, wt = it.wtype || (it.st && it.st.wtype) || b.wtype || (b.st && b.st.wtype);
  const h = (it.st && it.st.hands) || (typeof handsRule === 'function' && wt ? handsRule(wt, `${b.name || ''} ${b.en || ''}`) : '1h');
  if (wt === 'fist' || wt === 'bow') return wt;
  if (wt === 'sword' || wt === 'dagger' || wt === 'staff') return wt + (h === '2h' ? '2' : '1');
  return 'weapon';
}
/* (v188) weapons are grouped by the class that can wield them (the owner found the kinds mixed up: axes are swords in the
   data, so they sat under ดาบ). One chip per class line with weapons in the bag, your own class first; a weapon several
   lines can use (a rod: mage, healer, summoner, hexer) shows under each. The game's own rule decides (canWield, the
   same check as wearing it), asked once per item for every job of each line. Armour and the rest keep their slot chips. */
const BAG_LINES = () => Object.keys(JOBS).filter(k => JOBS[k].parent === 'novice');
const bagLineOf = job => { let k = job; for (let i = 0; i < 9 && JOBS[k] && JOBS[k].parent && JOBS[k].parent !== 'novice'; i++) k = JOBS[k].parent; return k; };
const BAG_WL = {};   // item (base) id → the class lines that can wield it
function bagWeaponLines(id){
  const it = ITEMS[id]; if (!it) return [];
  const key = it.base || id; if (BAG_WL[key]) return BAG_WL[key];
  const lines = new Set(), job0 = S.job;
  try { for (const k of Object.keys(JOBS)){ if (k === 'novice') continue; const ln = bagLineOf(k); if (lines.has(ln)) continue; S.job = k; if (canWield(it)) lines.add(ln); } }
  catch (e) {} finally { S.job = job0; }
  return (BAG_WL[key] = [...lines]);
}
/* the chips an item shows under: its class lines (weapons) or its slot */
function bagSubsOf(id){ const k = bagSubOf(id); if (!k) return []; if (k === 'ammo' || !ITEMS[id] || ITEMS[id].slot !== 'weapon') return [k]; const ls = bagWeaponLines(id); return ls.length ? ls.map(l => 'c:' + l) : ['weapon']; }
const bagMyLine = () => bagLineOf(S.job);
BAG.sub = '';
/* it replaces the older, coarser slot row (bagplus.js: อาวุธ · หมวก · เกราะ …): that row is hidden and left on "all" */
BAG.slot = 'all';
{ const _be = bagEntries;
  bagEntries = function(){ const r = _be.apply(this, arguments); return BAG.tab === 'gear' && BAG.sub ? r.filter(e => bagSubsOf(e.id).includes(BAG.sub)) : r; }; }
{ const _bd = bagDraw;
  bagDraw = function(){
    const tool = document.querySelector('#pane-bag .bagtool'); let row = el('bagSub');
    if (tool && !row){ tool.insertAdjacentHTML('afterend', '<div class="bagsub" id="bagSub"></div>'); row = el('bagSub'); }
    if (row){
      if (BAG.tab !== 'gear'){ row.hidden = true; }
      else {
        const n = {}; let all = 0; for (const id of Object.keys(S.inv)) if (S.inv[id] > 0){ const ks = bagSubsOf(id); if (ks.length) all++; for (const k of ks) n[k] = (n[k] || 0) + 1; }
        if (BAG.sub && !n[BAG.sub]) BAG.sub = '';
        const me = bagMyLine(), lines = BAG_LINES().sort((a, b) => (b === me) - (a === me));
        const chip = (k, t, cls = '') => `<button class="bsub${cls}${BAG.sub === k ? ' on' : ''}" data-bagsub="${k}">${t} <i>${n[k]}</i></button>`;
        row.hidden = false;
        row.innerHTML = `<button class="bsub${BAG.sub ? '' : ' on'}" data-bagsub="">${L('ทั้งหมด', 'All')} <i>${all}</i></button>`
          + lines.filter(l => n['c:' + l]).map(l => chip('c:' + l, (l === me ? '★ ' : '⚔ ') + nm(JOBS[l]), l === me ? ' mine' : ' cls')).join('')
          + BAG_SUB.filter(([k]) => n[k] && !/^(sword|dagger|staff)[12]$|^fist$|^bow$/.test(k)).map(([k, th, en]) => chip(k, L(th, en))).join('');
      }
    }
    BAG.slot = 'all'; return _bd.apply(this, arguments);
  }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bagsub]'); if (!b) return; BAG.sub = b.dataset.bagsub; BAG.sel = null; bagDraw(); });
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-bagtab]')) BAG.sub = ''; }, true);

{ const st = document.createElement('style');
  st.textContent = `
.bagsub ~ #bagSlotBar,#bagSlotBar{display:none!important}
.bagsub{display:flex;flex-wrap:wrap;gap:5px;margin:2px 0 6px}
.bagsub .bsub{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;min-height:30px;border-radius:999px;border:1.5px solid #e3c88a;background:#fffaf0;color:#5a3a12;font:600 13px var(--thai, Sarabun, sans-serif);cursor:pointer}
.bagsub .bsub i{font-style:normal;font-size:11px;color:#9a7a4a}
.bagsub .bsub.on{background:linear-gradient(#ffe6a0,#f7c85a);border-color:#c8902e;color:#3a2206}
.bagsub .bsub.cls{border-color:#c9b48a;background:#fdf6e6}.bagsub .bsub.mine{border-color:#2f8a5a;background:#eafbf1;color:#1d5a3a;font-weight:700}.bagsub .bsub.mine.on{background:linear-gradient(#bff0d2,#7fd6a4);border-color:#1d7a48;color:#0d3a22}
/* twice as big squares */
html body #ui.ui .baggrid.grid,html body #ui.ui .invcombo #pane-bag .baggrid.grid{grid-template-columns:repeat(auto-fill,minmax(84px,1fr))!important;gap:8px!important}
html body #ui.ui .baggrid.grid .bslot{min-height:84px;aspect-ratio:1/1}
html body #ui.ui .baggrid.grid .bslot svg:first-of-type,html body #ui.ui .baggrid.grid .bslot .sico{width:72%!important;height:72%!important}`;
  document.head.appendChild(st); }
