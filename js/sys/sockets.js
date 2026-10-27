/* VAYRATHEN — js/sys/sockets.js — card sockets live on the item itself
   Weapons and wearable gear (every place that takes a card: weapon, head, body, feet — accessories and arrows
   never) roll 1–3 card sockets when they come from a monster, a boss,
   a world boss, a dungeon chest or crafting. Pieces bought from an NPC shop, starter gear and old pieces have none.
     odds  monster 60/30/10 % · boss 35/40/25 % · craft 50/35/15 % · world boss 20/40/40 %
   A card still fits only the place printed on it (a Feet card goes in shoes, a Weapon card in a weapon …).
   The cards sit in the instance (S.inst[key].k sockets, .c cards), so they travel with the item in trades and the
   bank. Selling or salvaging a piece loses the cards in it. S.slots is rebuilt from the worn pieces on every
   derive ({"weapon#0":card, …}), so every card effect that reads S.slots / slotHas keeps working.
   Old saves: cards that sat in the character's sockets go back to the card tab once. */
'use strict';

const SOCK_ODDS = {mob:[.6, .3, .1], boss:[.35, .4, .25], rampage:[.35, .4, .25], fury:[.35, .4, .25], craft:[.5, .35, .15], wb:[.2, .4, .4]};
const sockable = it => !!(it && it.kind === 'gear' && EQ_SOCKET.includes(it.slot));
const sockData = key => (S && S.inst && S.inst[key]) || null;
const sockN = key => (ITEMS[key] && ITEMS[key].sk) | 0;
const sockCards = key => { const d = sockData(key); return (d && d.c) || []; };

function sockRoll(key, src){
  const d = sockData(key), o = SOCK_ODDS[src]; if (!d || !o || d.k != null || !sockable(ITEMS[key])) return;
  let u = Math.random(), k = 1; for (let i = 0; i < 3; i++){ if (u < o[i]){ k = i + 1; break; } u -= o[i]; }
  d.k = k; d.c = []; regInst(key, d);
}
{ const _rg = rollGear;
  rollGear = function(b, src){ const fresh = !(ITEMS[b] && ITEMS[b].base), id = _rg.apply(this, arguments); if (fresh && src !== 'shop') sockRoll(id, src); return id; }; }
{ const _ri = regInst;
  regInst = function(key, d){ const ok = _ri.apply(this, arguments); const it = ITEMS[key]; if (it && d){ it.sk = sockable(it) ? clamp(d.k | 0, 0, 3) : 0; it.cards = (d.c || []).slice(0, it.sk); } return ok; }; }
{ const _san = sanitizeInst;
  sanitizeInst = function(d){ const r = _san.apply(this, arguments); if (!r || !d) return r;
    const it = ITEMS[r.b]; if (!sockable(it) || d.k == null) return r;
    r.k = clamp(d.k | 0, 0, 3); r.c = (Array.isArray(d.c) ? d.c : []).filter(c => CARDS[c] && CARDS[c].slot === it.slot).slice(0, r.k);
    return r; }; }

/* worn cards → S.slots, every derive */
function sockSync(){
  if (!S) return;
  if (S._sockV !== 1){ S._sockV = 1; let n = 0;   // old character sockets: hand the cards back
    for (const k in S.slots || {}){ const c = S.slots[k]; if (c && CARDS[c] && !k.includes('#')){ S.cards[c] = (S.cards[c] || 0) + 1; n++; } }
    S.slots = {}; if (n) setTimeout(() => log(L(`ระบบช่อง Card ใหม่: การ์ด ${n} ใบคืนเข้ากระเป๋าแล้ว · ใส่ในอุปกรณ์ที่มีช่อง Card ได้`, `New card sockets: ${n} card(s) returned to your bag · slot them into gear that has sockets`), 'c'), 500); }
  const o = {};
  for (const sl of EQ_SOCKET){ const id = S.gear && S.gear[sl]; if (!id) continue; sockCards(id).forEach((c, i) => { if (CARDS[c]) o[`${sl}#${i}`] = c; }); }
  S.slots = o;
}
{ const _d = derive; derive = function(){ sockSync(); return _d.apply(this, arguments); }; }
cardSlotFix = function(){};

/* places a card can go: worn first, then the bag; only pieces of the card's own place with a free socket */
function sockTargets(c){
  const cd = CARDS[c]; if (!cd) return []; const out = [];
  for (const sl in S.gear || {}){ const id = S.gear[sl]; if (id && ITEMS[id] && ITEMS[id].slot === cd.slot && sockN(id)) out.push({id, worn:true}); }
  for (const id in S.inv) if (ITEMS[id] && ITEMS[id].base && ITEMS[id].slot === cd.slot && sockN(id) && !out.some(o => o.id === id)) out.push({id, worn:false});
  return out;
}
const sockFree = c => sockTargets(c).some(o => sockCards(o.id).length < sockN(o.id));

function sockPut(c, key){
  const d = sockData(key), it = ITEMS[key]; if (!d || !it || !CARDS[c] || !(S.cards[c] > 0) || CARDS[c].slot !== it.slot) return;
  d.c = d.c || []; if (d.c.length >= (d.k | 0)){ toast(L('ช่อง Card เต็มแล้ว', 'No free socket')); return; }
  d.c.push(c); S.cards[c]--; if (!S.cards[c]) delete S.cards[c]; regInst(key, d); derive();
  log(L(`ใส่ ${nm(CARDS[c])} ใน ${nm(it)}`, `Slotted ${nm(CARDS[c])} into ${nm(it)}`), 'c'); toast(L(`ใส่ ${nm(CARDS[c])} แล้ว`, `${nm(CARDS[c])} slotted`)); SFX.play('equip');
  sockDone();
}
function sockOut(key, i){
  const d = sockData(key); if (!d || !d.c || !d.c[i]) return; const c = d.c.splice(i, 1)[0];
  S.cards[c] = (S.cards[c] || 0) + 1; regInst(key, d); derive();
  log(L(`ถอด ${nm(CARDS[c])} ออกจาก ${nm(ITEMS[key])}`, `Removed ${nm(CARDS[c])} from ${nm(ITEMS[key])}`), 'c'); sockDone();
}
/* (v126) one redraw, not four: slotting or removing a card used to redraw the side panel, the bag and the equipment
   window right away and then again on the next frame (dirty), plus once more from the card box — a visible hitch with
   the bag open. Now it only marks the game dirty: the next frame draws what is open, once (lazypanel.js). */
function sockDone(){ dirty = true; save(); if (!SOCK_RAF) SOCK_RAF = requestAnimationFrame(() => { SOCK_RAF = 0; if (typeof bagInfo === 'function') try { bagInfo(); } catch (e) {} }); }
let SOCK_RAF = 0;

/* the sockets of one piece, with remove buttons */
function sockRow(key, btn = true){
  const n = sockN(key); if (!n) return ''; const cs = sockCards(key);
  return `<div class="sockrow">${Array.from({length:n}, (_, i) => { const c = cs[i];
    return c ? `<span class="sk on" title="${cardDesc(c)}">◆ ${nm(CARDS[c])}${btn ? `<button data-sockout="${key}|${i}" title="${L('ถอด Card', 'Remove card')}">✕</button>` : ''}</span>` : `<span class="sk">◇ ${L('ว่าง', 'Empty')}</span>`; }).join('')}</div>`;
}
/* item text: "Card 2 ช่อง: ◆ … · ◇ ว่าง" */
{ const _gl = gearLines;
  gearLines = function(id){ const s = _gl.apply(this, arguments), n = sockN(id); if (!n) return s; const cs = sockCards(id);
    return `${s}<span class="sockl">${L(`Card ${n} ช่อง`, `${n} card socket${n > 1 ? 's' : ''}`)}: ${Array.from({length:n}, (_, i) => cs[i] ? `◆ ${nm(CARDS[cs[i]])}` : `◇ ${L('ว่าง', 'empty')}`).join(' · ')}</span>`; }; }
/* small socket pips on the icon */
{ const _art = itemArt;
  itemArt = function(id){ const s = _art.apply(this, arguments), n = sockN(id); if (!n) return s; const cs = sockCards(id);
    let p = ''; for (let i = 0; i < n; i++){ const x = 36 - i * 5.4; p += `<circle cx="${x}" cy="4.4" r="2.1" fill="${cs[i] ? '#ffd34a' : '#1c2a44'}" stroke="#fff" stroke-width=".9"/>`; }
    return s.replace(/<\/svg>$/, p + '</svg>'); }; }

/* the bag: a card shows where it can go; a piece of gear shows its sockets */
{ const _bi = bagInfo;
  bagInfo = function(){ _bi.apply(this, arguments); const box = el('bagInfo'), id = BAG.sel; if (!box || !id) return;
    if (CARDS[id] && BAG.tab === 'card'){ const cd = CARDS[id], t = sockTargets(id);
      const list = t.length ? t.map(o => { const it = ITEMS[o.id], free = sockCards(o.id).length < sockN(o.id);
        return `<div class="socktgt"><span class="bico">${itemIcon(o.id)}</span><div><b class="rar r${it.rar || 0}">${nm(it)}</b>${o.worn ? ` <small class="ct">${L('สวมอยู่', 'worn')}</small>` : ''}${sockRow(o.id)}</div><button class="btn sm gold" data-sockput="${id}|${o.id}" ${free && S.cards[id] > 0 ? '' : 'disabled'}>${L('ใส่', 'Slot')}</button></div>`; }).join('')
        : '';
      box.innerHTML = `${cardHTML(id)}<div class="nm"><b>${nm(cd)} <span class="ct">×${S.cards[id] || 0}</span></b><small>${cardDesc(id)}</small></div>${list ? `<div class="socklist">${list}</div>` : ''}`;
      return; }
    if (sockN(id)){ const nmEl = box.querySelector('.nm'); if (nmEl) nmEl.insertAdjacentHTML('beforeend', sockRow(id)); }
  }; }
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('[data-sockput],[data-sockout]'); if (!a) return; e.stopPropagation();
  if (a.dataset.sockput){ const [c, key] = a.dataset.sockput.split('|'); sockPut(c, key); }
  else { const [key, i] = a.dataset.sockout.split('|'); sockOut(key, +i); }
}, true);

{ const st = document.createElement('style');
  st.textContent = `.sockrow{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.sockrow .sk{display:inline-flex;align-items:center;gap:3px;padding:1px 7px;border-radius:9px;border:1px dashed #8fb6e8;color:#cfe2ff;font-size:11px}
  .sockrow .sk.on{border-style:solid;border-color:#ffd34a;color:#ffe9a8;background:rgba(255,211,74,.12)}.sockrow .sk button{border:0;background:none;color:#ff9b9b;cursor:pointer;font-size:11px;padding:0 0 0 2px}
  .socklist{flex-basis:100%;display:flex;flex-direction:column;gap:6px;margin-top:8px;max-height:220px;overflow:auto;width:100%}.socktgt{display:flex;align-items:center;gap:8px}.socktgt>div{flex:1;min-width:0}.socktgt .bico svg{width:30px;height:30px}
  .sockl{display:block;color:#ffe08a}#bagInfo:has(.socklist){flex-wrap:wrap}`;
  document.head.appendChild(st); }
