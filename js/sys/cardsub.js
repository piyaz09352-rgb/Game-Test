/* VAYRATHEN — js/sys/cardsub.js — (v162) the bag's card tab sorted by where a card goes
   A row of chips over the cards: ทั้งหมด · อาวุธ · โล่ · หมวก · เกราะ · กางเกง · รองเท้า · เครื่องประดับ, each with how
   many kinds of card you hold for it. Picking one shows only those cards; "ทั้งหมด" shows every card, grouped in the
   same order (weapon cards first, then shield, head …), each group by rarity as before. */
'use strict';

const CARD_SUB = [['weapon', 'อาวุธ', 'Weapon'], ['shield', 'โล่', 'Shield'], ['head', 'หมวก', 'Head'], ['armor', 'เกราะ', 'Armour'],
  ['pants', 'กางเกง', 'Pants'], ['shoes', 'รองเท้า', 'Shoes'], ['acc', 'เครื่องประดับ', 'Accessory']];
const CARD_SUB_ORD = Object.fromEntries(CARD_SUB.map(([k], i) => [k, i]));
BAG.csub = '';
{ const _be = bagEntries;
  bagEntries = function(){ const r = _be.apply(this, arguments); if (BAG.tab !== 'card') return r;
    return BAG.csub ? r.filter(e => CARDS[e.id] && CARDS[e.id].slot === BAG.csub) : r; }; }
/* in "all", cards come grouped by slot (the rarity order stays inside each group) */
{ const _cmp = bagRarCmp;
  bagRarCmp = function(a, b){ if (a.card && b.card){ const d = (CARD_SUB_ORD[a.it.slot] ?? 9) - (CARD_SUB_ORD[b.it.slot] ?? 9); if (d) return d; } return _cmp.apply(this, arguments); }; }
{ const _bd = bagDraw;
  bagDraw = function(){
    const r = _bd.apply(this, arguments);
    const row = el('bagSub'); if (!row || BAG.tab !== 'card') return r;
    const n = {}; for (const c in S.cards || {}) if (S.cards[c] > 0 && CARDS[c]){ const s = CARDS[c].slot; n[s] = (n[s] || 0) + 1; }
    const all = Object.values(n).reduce((a, b) => a + b, 0);
    if (BAG.csub && !n[BAG.csub]){ BAG.csub = ''; return bagDraw(); }
    row.hidden = !all;
    row.innerHTML = `<button class="bsub${BAG.csub ? '' : ' on'}" data-cardsub="">${L('ทั้งหมด', 'All')} <i>${all}</i></button>`
      + CARD_SUB.filter(([k]) => n[k]).map(([k, th, en]) => `<button class="bsub${BAG.csub === k ? ' on' : ''}" data-cardsub="${k}">${L(th, en)} <i>${n[k]}</i></button>`).join('');
    return r;
  }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-cardsub]'); if (!b) return; BAG.csub = b.dataset.cardsub; BAG.sel = null; bagDraw(); });
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-bagtab]')) BAG.csub = ''; }, true);
