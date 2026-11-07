/* VAYRATHEN — js/sys/cardout262.js — (v262) taking cards out is Driller Manee's trade
   The owner: Manee's shop (ร้านเจาะรู & ถอดการ์ด) also takes cards out — the classic way: only at her bench, for a fee,
   and a card can crack on the way out.
   · The ✕ on a socketed card anywhere else now says to bring the piece to Manee in Aren.
   · At Manee: every worn or carried piece with cards is listed, each card with her fee (by the piece's level).
     Taking one out: 90% the card comes back to your card tab, 10% it cracks and is lost.
   · หินกันการ์ดแตก (Card Guard Stone), sold in her shop: tick it before taking a card out and that card cannot crack
     (one stone a card). */
'use strict';
Object.assign(ITEMS, {cardguard:{name:'หินกันการ์ดแตก', en:'Card Guard Stone', kind:'mat', buy:30000, sell:300,
  desc:['ใช้ตอนถอดการ์ดที่ช่างเจาะมณี: การ์ดไม่แตกแน่นอน (ใช้ 1 ก้อนต่อ 1 ใบ)', 'Used when Driller Manee takes a card out: the card cannot crack (one stone a card)']}});
if (typeof DR_SHOP !== 'undefined' && !DR_SHOP.includes('cardguard')) DR_SHOP.push('cardguard');
const CO = {npc:null, at:false, guard:false, crack:.1};
const coFee = key => { const it = ITEMS[key] || {}; return Math.round(500 + (it.lv || 1) * 40); };

/* the ✕ elsewhere: bring it to Manee */
{ const _so = sockOut; sockOut = function(key, i){
    if (!CO.at){ toast(L('ถอดการ์ดได้ที่ช่างเจาะมณี (ร้านเจาะรู & ถอดการ์ด) ในนครอาเรน', 'Cards come out at Driller Manee\'s (Socket & Card shop) in Aren')); return; }
    return _so.apply(this, arguments); }; }

/* her list: every piece with cards */
function coTargets(){
  const worn = Object.values(S.gear || {}), keys = [...new Set([...worn, ...Object.keys(S.inv).filter(k => S.inv[k] > 0)])];
  return keys.filter(k => ITEMS[k] && typeof sockCards === 'function' && sockCards(k).length);
}
function coHTML(){
  const list = coTargets(), g = haveN('cardguard');
  const rows = list.map(k => { const it = ITEMS[k], worn = Object.values(S.gear || {}).includes(k), fee = coFee(k);
    return `<div class="srow"><span class="ic">${itemIcon(k)}</span><div class="nm"><b>${nm(it)}${worn ? ` <span class="ct">${L('สวมอยู่', 'worn')}</span>` : ''}</b>
      <small>${sockCards(k).map((c, i) => `<button class="btn sm" data-coout="${k}|${i}" ${S.bia >= fee ? '' : 'disabled'}>◆ ${escH(nm(CARDS[c]))} · ${L('ถอด', 'take out')} ${fmtN(fee)}</button>`).join(' ')}</small></div></div>`; }).join('');
  return `<div class="sec">${L('ถอดการ์ด', 'Take cards out')} <span class="ct">${fmtN(S.bia)} ${CUR()}</span></div>
    <label class="row" style="gap:6px;align-items:center"><input type="checkbox" data-coguard ${CO.guard && g ? 'checked' : ''} ${g ? '' : 'disabled'}> ${L(`ใช้หินกันการ์ดแตก (มี ${g})`, `Use a Card Guard Stone (have ${g})`)}</label>
    <div class="shop">${rows || `<p class="hint">${L('ยังไม่มีอุปกรณ์ที่ใส่การ์ดอยู่ (ทั้งที่สวมและในกระเป๋า)', 'No piece with cards (worn or carried)')}</p>`}</div>
    <p class="hint">${L(`ถอดแล้วการ์ดกลับเข้าแท็บการ์ด · มีโอกาสการ์ดแตก ${Math.round(CO.crack * 100)}% · หินกันการ์ดแตกทำให้ไม่แตกแน่นอน`, `A card taken out goes back to your card tab · ${Math.round(CO.crack * 100)}% it cracks · a Card Guard Stone makes it safe`)}</p>`;
}
{ const _o = NPC_OPEN.driller; NPC_OPEN.driller = function(n){ CO.npc = n; const r = _o.apply(this, arguments);
    const d = document.getElementById('dialog'), body = d && (d.querySelector('.db') || d); if (body && !body.querySelector('[data-cobox]')) body.insertAdjacentHTML('beforeend', `<div data-cobox>${coHTML()}</div>`);
    return r; }; }
const coRefresh = () => { const b = document.querySelector('#dialog [data-cobox]'); if (b) b.innerHTML = coHTML(); };
document.addEventListener('change', e => { const t = e.target; if (t && t.matches && t.matches('[data-coguard]')){ CO.guard = !!t.checked; } });
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-coout]'); if (!b) return; e.stopPropagation();
  const [key, si] = b.dataset.coout.split('|'), i = +si, cards = sockCards(key), c = cards[i]; if (!c) return;
  const fee = coFee(key); if (S.bia < fee){ toast(L('เงินไม่พอ', 'Not enough Bia')); return; }
  const guard = CO.guard && haveN('cardguard') > 0;
  S.bia -= fee; if (guard){ S.inv.cardguard--; if (!S.inv.cardguard) delete S.inv.cardguard; }
  if (!guard && Math.random() < CO.crack){
    const d = sockData(key); d.c.splice(i, 1); regInst(key, d); derive(); SFX.play('crit'); VFX.play('boom', {x:P.x, y:P.y - 30, r:20});
    toast(L(`💥 ${nm(CARDS[c])} แตกระหว่างถอด!`, `💥 ${nm(CARDS[c])} cracked on the way out!`)); log(L(`การ์ด ${nm(CARDS[c])} แตกระหว่างถอดจาก ${nm(ITEMS[key])}`, `${nm(CARDS[c])} cracked while coming out of ${nm(ITEMS[key])}`), 'c');
    if (typeof sockDone === 'function') sockDone();
  } else { CO.at = true; try { sockOut(key, i); } finally { CO.at = false; } SFX.play('drop2'); toast(L(`ถอด ${nm(CARDS[c])} สำเร็จ · กลับเข้าแท็บการ์ดแล้ว`, `${nm(CARDS[c])} is out · back in your card tab`)); }
  dirty = true; save(); coRefresh(); }, true);
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'cardout', t:['ถอดการ์ด', 'Taking cards out'], b:() => `<p>${L(`ถอดการ์ดออกจากอุปกรณ์ได้ที่ช่างเจาะมณี (ร้านเจาะรู & ถอดการ์ด) ในนครอาเรนเท่านั้น · ค่าถอดตามเลเวลอุปกรณ์ · มีโอกาสการ์ดแตก ${Math.round(CO.crack * 100)}% · ใช้หินกันการ์ดแตก (ขายที่ร้านเดียวกัน) แล้วไม่แตกแน่นอน`, `Cards come out only at Driller Manee's (Socket & Card shop) in Aren · the fee follows the piece's level · ${Math.round(CO.crack * 100)}% the card cracks · a Card Guard Stone (sold there) makes it safe`)}</p>`});
