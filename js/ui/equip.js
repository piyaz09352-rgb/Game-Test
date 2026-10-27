/* VAYRATHEN — js/ui/equip.js
   Equipment window (Q): a classic paper doll — Headgear / Armor on the left, the hero on a glowing stage in the
   middle, Weapon / Accessory / Arrows on the right, each with its Card socket; total stats and spare gear below. Cards are slotted, swapped and taken out here. */
'use strict';

const EQ = {dir:0};
const WTYPE = {dagger:['มีดสั้น', 'Dagger'], sword:['ดาบ', 'Sword'], staff:['ไม้เท้า', 'Staff'], bow:['ธนู', 'Bow'], fist:['สนับมือ', 'Knuckles']};
const EQ_IC = {
  head:'<path d="M4 12.5c0-4 2.7-7 6-7s6 3 6 7"/><path d="M2.8 12.5h14.4M10 3v2.5"/><circle cx="10" cy="2.6" r=".9"/>',
  armor:'<path d="M7 3.5L3.5 6l1.5 3.5L6.5 9v7.5h7V9l1.5.5L16.5 6 13 3.5c-.6 1.3-1.7 2-3 2s-2.4-.7-3-2z"/>',
  weapon:'<path d="M15.5 3.5L8 11M15.5 3.5l1 1-1.2 3.3L9 13.5M8 11l1 2.5M5.5 12l3 3M4 16.5l2.3-2.3"/>',
  acc:'<circle cx="10" cy="12" r="4.5"/><path d="M7 4l3 3.5L13 4M10 7.5v0"/>',
  card:'<rect x="5" y="3" width="10" height="14" rx="1.6"/><path d="M10 7l2 3-2 3-2-3z"/>'
};
const eqSvg = (k, cls = '') => `<svg class="${cls}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${EQ_IC[k]}</svg>`;

const wornIcon = sl => { const id = S.gear && S.gear[sl]; return id && ITEMS[id] ? itemIcon(id) : eqSvg(sl, 'ghost'); };
const unBtn = (attr, sl, tip) => `<button class="eqx" ${attr}="${sl}" aria-label="${tip}" title="${tip}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg></button>`;
/* (v89) a worn piece's card says only its base numbers (all of them, but none of the random options) and the
   set it belongs to; everything else is one tap away in its details */
function eqBrief(id){
  const it = ITEMS[id]; if (!it || !it.st) return '';
  let st = it.st; if (it.base && typeof instStats === 'function' && ITEMS[it.base]){ const d = instStore()[id] || {}; st = instStats(ITEMS[it.base], d.r || 0, [], d.q); }
  // every base number of the piece (no random options); only the class-only note is left for the details
  const out = gearStatText(st).split(' · ').filter(x => x && !/เฉพาะสาย| line only/.test(x));
  const cs = st.cset || (it.st && it.st.cset);
  if (cs && typeof CSET !== 'undefined' && CSET[cs]){ const n = typeof csetCount === 'function' ? csetCount()[cs] || 0 : 0; out.push(`<span class="csetl">${L(`เซ็ต ${CSET[cs][0]}`, `${CSET[cs][1]} set`)} (${n}/4)</span>`); }
  return out.join(' · ');
}
/* one paper-doll slot: framed icon + name + stats, and its card socket underneath */
function eqSlot(sl){
  const j = JOBS[S.job], c = S.slots[sl], D = DER;
  let name, sub, full = false, rf = '';
  const wid = sl === 'weapon' && S.gear && S.gear.weapon, wit = wid && ITEMS[wid];
  if (wit){ full = true; name = nm(wit); sub = eqBrief(wid); }
  else if (sl === 'weapon'){ const w = j.weapon; full = true; name = nm(w);
    sub = `ATK ${w.atk + S.refine * 5}${w.matk ? ` · MATK ${w.matk + (w.type === 'staff' ? S.refine * 5 : 0)}` : ''}`; }
  else { const gid = S.gear && S.gear[sl], it = gid && ITEMS[gid];
    if (it){ full = true; name = nm(it); sub = eqBrief(gid); }
    else { name = L('ว่าง', 'Empty'); sub = typeof eqEmptyHint === 'function' ? eqEmptyHint(sl) : L('ซื้อที่ช่างตีเหล็กเพชร หรือดรอปจากมอน', 'Sold by Blacksmith Phet, or dropped by monsters'); } }
  { const gid0 = S.gear && S.gear[sl], rv = gid0 && ITEMS[gid0] ? ITEMS[gid0].rf || 0 : sl === 'weapon' ? S.refine || 0 : 0; rf = rv ? `<em class="eqrf">+${rv}</em>` : ''; }
  const off = full && (sl !== 'weapon' || wit) ? unBtn('data-unwear', sl, L('ถอด', 'Take off')) : '';
  const sock = !(typeof EQ_SOCKET === 'undefined' ? sl !== 'acc' : EQ_SOCKET.includes(sl)) ? `<div class="eqsock none"><span><small>${L('ไม่มีช่อง Card', 'No card socket')}</small></span></div>` : `<div class="eqsock${c ? ' on' : ''}">${c ? cardHTML(c, 'mini') : `<i class="eqgem"></i>`}<span>${c ? `<b>${nm(CARDS[c])}</b><small>${cardDesc(c)}</small>` : `<small>${L('ช่อง Card ว่าง', 'Empty card socket')}</small>`}</span>${c ? unBtn('data-uncard', sl, L('ถอด Card', 'Remove card')) : ''}</div>`;
  return `<div class="eqsl eqsl-${sl}${full ? ' full' : ''} nosock mini rr${rarOf((S.gear && S.gear[sl]) || '')}">
    <div class="eqbox">${wornIcon(sl)}${rf}</div>
    <div class="eqtx"><small>${typeof EQ_LBL !== 'undefined' && EQ_LBL[sl] ? L(...EQ_LBL[sl]) : L(SLOT_TH[sl], SLOT_EN[sl])} ${rarLine(S.gear && S.gear[sl])}</small><b class="rar r${rarOf(S.gear && S.gear[sl] || '')}">${name}</b><i>${sub}</i></div>${off}${sock}</div>`;
}
function ammoSlot(){
  if (JOBS[S.job].weapon.type !== 'bow') return '';
  const id = S.gear && S.gear.ammo, it = id && ITEMS[id];
  return `<div class="eqsl eqsl-ammo${it ? ' full' : ' warn'}"><div class="eqbox">${it ? itemIcon(id) : eqSvg('weapon', 'ghost')}${it ? `<em class="eqrf n">${arrowCount()}</em>` : ''}</div>
    <div class="eqtx"><small>${L('ลูกธนู', 'Arrows')}</small><b>${it ? nm(it) : L('ไม่มีลูกธนู', 'No arrows')}</b><i>${it ? gearStatText(it.st) : L('ยิงไม่ได้ · ซื้อที่ตลาดกลาง', 'Cannot shoot · buy at the market')}</i></div>${it ? unBtn('data-unwear', 'ammo', L('ถอด', 'Take off')) : ''}</div>`;
}
function renderEquip(){
  const pane = document.getElementById('pane-equip'); if (!pane || !S) return;
  if (EQ.tab === 'cos' && typeof renderWardrobe === 'function'){ renderWardrobe(); return; }
  const D = DER, cards = Object.keys(S.cards).filter(k => S.cards[k] > 0);
  const st = (k, v, ic) => `<div class="eqstat"><small>${k}</small><b>${v}</b></div>`;
  const gs = Object.keys(S.inv).filter(k => ITEMS[k] && (ITEMS[k].kind === 'gear' || (ITEMS[k].kind === 'ammo' && usesArrows() && S.gear.ammo !== k))).sort((a, b) => (ITEMS[b].rar || 0) - (ITEMS[a].rar || 0) || (ITEMS[b].lv || 0) - (ITEMS[a].lv || 0));
  pane.innerHTML = (typeof eqTabs === 'function' ? eqTabs() : '') + `
    <div class="eqdoll2">
      <div class="eqside eqL">${['head', 'armor', 'pants', 'shoes'].map(eqSlot).join('')}</div>
      <div class="eqstage">
        <div class="eqaura"><i></i><canvas id="eqPrev" aria-label="${L('ตัวละคร', 'Character')}"></canvas></div>
        <div class="eqplate"><b>${S.name || nm(JOBS[S.job])}</b><small>${nm(JOBS[S.job])} · Lv ${S.lvl}</small></div>
        <div class="eqrot"><button class="ibtn" data-eqrot="-1" aria-label="${L('หมุนซ้าย', 'Turn left')}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 4l-4 4 4 4"/></svg></button><button class="ibtn" data-eqrot="1" aria-label="${L('หมุนขวา', 'Turn right')}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 4l4 4-4 4"/></svg></button></div>
      </div>
      <div class="eqside eqR">${['weapon', 'shield', 'acc', 'acc2'].map(eqSlot).join('')}</div>
    </div>${ammoSlot() ? `<div class="eqammo">${ammoSlot()}</div>` : ''}
    <div class="eqstats">${st('ATK', D.atk)}${st('MATK', D.matk)}${st('DEF', D.def)}${st('MDEF', D.mdef)}${st('HIT', D.hit)}${st('FLEE', D.flee)}${st('CRIT', D.crit + '%')}${st('ASPD', D.aspd)}</div>
    <div class="eqbagw"><div class="sec">${L('อุปกรณ์ในกระเป๋า', 'Gear in your bag')} <span class="ct">${gs.length}</span></div>
    ${gs.length ? `<div class="eqbag">${gs.map(k => { const it = ITEMS[k], ok = canWield(it), lvOk = S.lvl >= it.lv;
      return `<div class="eqit${ok && lvOk ? '' : ' no'} rr${it.rar || 0}"><span class="eqbox sm">${itemIcon(k)}${it.kind === 'ammo' ? `<em class="eqrf n">${S.inv[k]}</em>` : ''}</span><div class="eqtx"><b class="rar r${it.rar || 0}">${nm(it)}</b><i>${rarLine(k)} ${L(...GEAR_SLOT[it.slot])} · Lv ${it.lv}</i><i>${gearLines(k)}</i></div>${ok ? `<button class="btn sm gold" data-wear="${k}" ${lvOk ? '' : 'disabled'}>${L('สวม', 'Wear')}</button>` : `<span class="ct">${L('อาชีพนี้ใช้ไม่ได้', 'Not for this class')}</span>`}</div>`; }).join('')}</div>`
      : `<p class="empty">${L('ยังไม่มีอุปกรณ์สำรอง', 'No spare gear')}</p>`}</div>
    `;
  drawEquipPrev();
}
/* the hero at 1:1 sprite pixels, slowly breathing in the chosen facing */
function drawEquipPrev(){
  const cv = document.getElementById('eqPrev'); if (!cv || !heroSheet()) return;
  const sh = (typeof eqPreviewSheet === 'function' ? eqPreviewSheet() : null) || heroSheet(), K = sh.K, w = 64, h = 84;
  if (cv.width !== w * K){ cv.width = w * K; cv.height = h * K; }
  const g = cv.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
  g.setTransform(K, 0, 0, K, 0, 0);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(w / 2, h - 10, S.job === 'warlord' ? 22 : 12, 4, 0, 0, 7); g.fill();
  SPR.draw(g, sh, 'idle', EQ.dir, T, w / 2, h - 10);
}
document.addEventListener('click', e => {
  const r = e.target.closest('[data-eqrot]');
  if (r){ EQ.dir = (EQ.dir + +r.dataset.eqrot + SPR.DIRS.length) % SPR.DIRS.length; drawEquipPrev(); return; }
  const u = e.target.closest('[data-uncard]'); if (!u) return;
  const sl = u.dataset.uncard, c = S.slots[sl]; if (!c) return;
  S.slots[sl] = null; S.cards[c] = (S.cards[c] || 0) + 1; derive();
  log(L(`ถอด ${nm(CARDS[c])} ออกจากช่อง${SLOT_TH[sl]}`, `Removed ${nm(CARDS[c])} (${SLOT_EN[sl]})`), 'c'); dirty = true;
});
