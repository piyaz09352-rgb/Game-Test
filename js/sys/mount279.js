/* VAYRATHEN — js/sys/mount279.js — (v279) riding needs a mount
   Before, everyone could ride (R / ขี่) from the first minute without owning anything, 70% faster.
   The owner: no mount, no riding. Now:
   · a common mount «กวางทอง» (Golden Deer) sits in the bag as an item; Uncle Boonma the beast keeper sells it for
     100,000 Bia, one per hero, and it is never used up;
   · riding is 30% faster (was 70%);
   · without a mount the Ride button, R and every Auto system that used to hop on (long walks, party follow, quests,
     the tower) simply walk; the button says where to buy one;
   · a fashion mount worn from the wardrobe also counts as a mount, and the Warlord keeps his war elephant. */
'use strict';

const MOUNT1 = 'mount1', MOUNT_PRICE = 100000;
MOVES.ride.speed = 1.3;
ITEMS[MOUNT1] = {name:'กวางทอง', en:'Golden Deer', buy:MOUNT_PRICE, sell:0, kind:'mount', rar:0, lv:1,
  desc:['สัตว์ขี่ธรรมดา · ขี่แล้วเดินเร็วขึ้น 30% · กด R หรือปุ่ม «ขี่» · อยู่ในกระเป๋าตลอด ใช้ไม่หมด', 'Common mount · 30% faster while riding · press R or Ride · stays in your bag, never used up']};
const hasMount = () => !!(S && ((S.inv && S.inv[MOUNT1] > 0) || S.job === 'warlord'
  || (S.cos && S.cos.mount && typeof XMOUNT !== 'undefined' && XMOUNT[S.cos.mount] && (typeof cosUsable !== 'function' || cosUsable(S.cos.mount)))));
function canRideNow(){ return hasMount(); }   // Auto, party follow, quests and the tower only hop on with a mount (and never redraw the hotbar every frame trying)
const MT_NONE = () => L('ยังไม่มีสัตว์ขี่ · ซื้อกวางทองได้ที่ลุงบุญมา (คนเลี้ยงสัตว์) นครอาเรน 100,000 เบี้ย', 'No mount yet · buy a Golden Deer from Uncle Boonma (beast keeper) in Aren for 100,000 Bia');

/* P.ride can only be true with a mount, whoever sets it (the Ride button, Auto, party follow, quests, the tower) */
{ let rv = !!P.ride; Object.defineProperty(P, 'ride', {configurable:true, enumerable:true, get(){ return rv; }, set(v){ rv = !!v && (typeof S === 'undefined' || !S || hasMount()); }}); }
{ const _t = toggleRide; toggleRide = function(){ if (!P.ride && !hasMount()){ toast(MT_NONE()); return; } return _t.apply(this, arguments); }; }
EV.on('tick', () => { if (P.ride && !hasMount()){ P.ride = false; if (typeof renderHotbar === 'function') renderHotbar(); } });

/* its picture: a golden deer's head with antlers */
{ const _ip = iaPick; iaPick = function(id){ if (id !== MOUNT1) return _ip.apply(this, arguments); const p = 'iamount§';
    return {p, frame:1, glow:'#f2c444', art:[`<linearGradient id="${p}d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset="1" stop-color="#c8862a"/></linearGradient>`,
      `<g stroke="#5a3408" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M15 14 11 6M11 10 7 8M13 12 9 13M25 14 29 6M29 10 33 8M27 12 31 13" fill="none" stroke-width="1.8"/>
        <path d="M13 17q7-6 14 0l-1 9q-2 7-6 8-4-1-6-8z" fill="url(#${p}d)"/>
        <path d="M13 17 8 15q2 5 6 5M27 17l5-2q-2 5-6 5" fill="#e8b450"/>
        <circle cx="17" cy="22" r="1.3" fill="#2a1a08" stroke="none"/><circle cx="23" cy="22" r="1.3" fill="#2a1a08" stroke="none"/>
        <ellipse cx="20" cy="31" rx="2.6" ry="1.8" fill="#5a3408" stroke="none"/></g>`]}; }; }

/* the bag strip: ride / get off from the mount itself */
{ const _bi = bagInfo;
  bagInfo = function(){ const r = _bi.apply(this, arguments); const box = el('bagInfo');
    if (box && BAG.sel === MOUNT1 && S.inv[MOUNT1] > 0 && !box.querySelector('[data-mtride]'))
      box.insertAdjacentHTML('beforeend', `<button class="btn sm gold" data-mtride="1">${P.ride ? L('ลงจากสัตว์ขี่', 'Get off') : L('ขี่', 'Ride')}</button>`);
    return r; }; }

/* Uncle Boonma sells it */
function mtBuy(){
  if (S.inv[MOUNT1] > 0){ toast(L('มีกวางทองแล้ว', 'You already have a Golden Deer')); return; }
  if (S.bia < MOUNT_PRICE){ toast(L(`เบี้ยไม่พอ (ต้องใช้ ${fmtN(MOUNT_PRICE)})`, `Not enough Bia (needs ${fmtN(MOUNT_PRICE)})`)); return; }
  if (typeof bagFits === 'function' && !bagFits(MOUNT1)){ if (typeof bagFullToast === 'function') bagFullToast(); return; }
  askConfirm(L('ซื้อสัตว์ขี่', 'Buy a mount'), L(`ซื้อกวางทอง ${fmtN(MOUNT_PRICE)} เบี้ย? ขี่แล้วเร็วขึ้น 30% ใช้ได้ตลอด`, `Buy the Golden Deer for ${fmtN(MOUNT_PRICE)} Bia? 30% faster, for keeps`), L('ซื้อ', 'Buy'), () => {
    if (S.inv[MOUNT1] > 0 || S.bia < MOUNT_PRICE) return; S.bia -= MOUNT_PRICE; addItem(MOUNT1, 1); SFX.play('coin');
    banner(L('ได้กวางทองแล้ว! กด R หรือปุ่ม «ขี่» เพื่อขี่', 'Golden Deer is yours! Press R or Ride to mount')); log(L(`ซื้อกวางทอง ${fmtN(MOUNT_PRICE)} เบี้ย`, `Bought a Golden Deer for ${fmtN(MOUNT_PRICE)} Bia`), 'g');
    dirty = true; save(); renderHotbar(); const n = NPCS.find(x => x.id === 'beastkeeper'); if (n && el('dialog').dataset.npc === 'beastkeeper' && !el('dialog').hidden) NPC_OPEN.beastkeeper(n); });
}
if (NPC_OPEN.beastkeeper){ const _o = NPC_OPEN.beastkeeper;
  NPC_OPEN.beastkeeper = function(n){ const r = _o.apply(this, arguments), say = document.querySelector('#dialog .db > .say'); if (!say) return r;
    const own = S.inv[MOUNT1] > 0, ok = S.bia >= MOUNT_PRICE;
    say.insertAdjacentHTML('afterend', `<div class="sec">${L('สัตว์ขี่', 'Mounts')} <span class="ct">${L('ต้องมีสัตว์ขี่จึงจะขี่ได้ (R)', 'You need a mount to ride (R)')}</span></div>
      <div class="shop"><div class="srow${own ? ' owned' : ''}"><span class="ic">${itemIcon(MOUNT1)}</span><div class="nm"><b>${L('กวางทอง', 'Golden Deer')} <span class="ct">${L('ธรรมดา', 'Common')}</span></b><small><b class="hlpbuff">${L('ความเร็วเดิน +30% ตอนขี่', 'Move speed +30% while riding')}</b> · ${L('ซื้อครั้งเดียว ใช้ได้ตลอด', 'buy once, keep for good')}</small></div>
      ${own ? `<span class="pr">✓ ${L('ของคุณ', 'yours')}</span>` : `<span class="pr">${fmtN(MOUNT_PRICE)}</span><button class="btn sm gold" data-mtbuy="1" ${ok ? '' : 'disabled'}>${L('ซื้อ', 'Buy')}</button>`}</div></div>`);
    return r; }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-mtbuy],[data-mtride]'); if (!b || b.disabled) return;
  if (b.dataset.mtbuy) mtBuy(); else { toggleRide(); if (typeof bagInfo === 'function') bagInfo(); } });

/* the Ride button's tip says what it needs */
{ const _rh = renderHotbar; renderHotbar = function(){ const r = _rh.apply(this, arguments);
    const b = document.querySelector('#hotbar [data-move="ride"]'); if (b){ b.title = hasMount() ? L('ขี่สัตว์ขี่ เร็วขึ้น 30%', 'Ride your mount, 30% faster') : MT_NONE(); b.classList.toggle('nomount', !hasMount()); }
    const m = document.querySelector('#mobaUtil [data-mo="ride"]'); if (m) m.classList.toggle('nomount', !hasMount());
    return r; }; }
{ const st = document.createElement('style'); st.textContent = '#hotbar .hk.nomount,#mobaUtil .mu.nomount{opacity:.55;filter:grayscale(.7)}'; document.head.appendChild(st); }
