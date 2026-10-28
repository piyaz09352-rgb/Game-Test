/* VAYRATHEN — js/sys/coat.js — (v187) ยาเคลือบธาตุ: coat the weapon in an element for 10 minutes
   Seven oils, one per element (earth, water, fire, wind, holy, shadow, poison). Drinking one — well, rubbing it on the
   blade — turns the hero's normal attacks and every skill that has no element of its own into that element for 10
   minutes of play time (real time: it keeps running while the game is closed). A skill with its own element (คาถาไฟ,
   ลูกศรน้ำแข็ง…) keeps it. A new coat replaces the old one (the time starts again). It also overrides the element of
   arrows and throwing stars while it lasts.
   · sold at the potion shop (ร้านยาป้าบัวคำ): the four elements 1,200 · poison 2,000 · holy and shadow 3,000
   · monsters of an element sometimes drop their own coat (0.4% · bosses 15%)
   · the buff bar shows it with the minutes left; the weapon shimmers faintly in its colour */
'use strict';

const COAT_EL = ['fire', 'water', 'wind', 'earth', 'holy', 'shadow', 'poison'];
const COAT_PRICE = {fire:1200, water:1200, wind:1200, earth:1200, poison:2000, holy:3000, shadow:3000};
const COAT_TH = {fire:'เพลิง', water:'วารี', wind:'วายุ', earth:'ปฐพี', holy:'ศักดิ์สิทธิ์', shadow:'รัตติกาล', poison:'พิษ'};
const COAT_EN = {fire:'Flame', water:'Tide', wind:'Gale', earth:'Stone', holy:'Holy', shadow:'Night', poison:'Venom'};
const COAT_COL = {fire:'#ff7a3a', water:'#4aa8ff', wind:'#7ee08a', earth:'#c8964a', holy:'#fff0a0', shadow:'#a77cff', poison:'#9ad84a'};
const COAT_MS = 10 * 60 * 1000;
const COAT_IDS = COAT_EL.map(e => 'coat_' + e);
for (const e of COAT_EL){ const id = 'coat_' + e;
  ITEMS[id] = {name:`ยาเคลือบ${COAT_TH[e]}`, en:`${COAT_EN[e]} Weapon Oil`, buy:COAT_PRICE[e], sell:Math.round(COAT_PRICE[e] * .2), kind:'use', coat:e,
    desc:[`อาวุธเป็นธาตุ${ELEM_TH[e] || e} 10 นาที · โจมตีปกติและสกิลที่ไม่มีธาตุ`, `Weapon becomes ${ELEM_EN[e] || e} for 10 min · normal attacks and skills with no element`]};
  if (typeof IA_POT !== 'undefined' && typeof IA_EL !== 'undefined' && IA_EL[e]) IA_POT[id] = [IA_EL[e], 'tall']; }
if (typeof BUFF_IC !== 'undefined') BUFF_IC.coat = ['#ffb070', '<path d="M5 15L14 6"/><path d="M12 4l4 4"/><path d="M4.5 12.5c-1.5 1.5-1.5 3 0 3s1.5-1.5 0-3z"/>'];

const coatOn = () => !!(S && S.coat && S.coat.until > Date.now() && COAT_EL.includes(S.coat.e));
const coatEl = () => (coatOn() ? S.coat.e : null);
const coatLeft = () => (coatOn() ? Math.max(0, (S.coat.until - Date.now()) / 1000) : 0);

/* using one */
{ const _use = useItem;
  useItem = function(id){ const it = ITEMS[id];
    if (!it || !it.coat) return _use.apply(this, arguments);
    if (!S.inv[id] || P.dead || P.itemCd > 0) return;
    S.inv[id]--; if (!S.inv[id]) delete S.inv[id];
    S.coat = {e:it.coat, until:Date.now() + COAT_MS}; derive(); coatBuff(); dirty = true;
    addText(P.x, P.y - 60, L(`อาวุธธาตุ${ELEM_TH[it.coat]}`, `${ELEM_EN[it.coat]} weapon`), COAT_COL[it.coat], 13);
    SFX.play('buff');
    if (typeof renderBag === 'function') renderBag(); if (typeof renderHotbar === 'function') renderHotbar();
  }; }
/* the element: normal attacks (DER.welem, which arrows, stars, orbs and blows read) and skills with no element */
{ const _d = derive; derive = function(){ const r = _d.apply(this, arguments); const e = coatEl(); if (e && DER) DER.welem = e; return r; }; }
{ const _sp = skillPhys; skillPhys = function(m, mult, elem){ const e = coatEl(); if (e && (!elem || elem === 'neutral')) elem = e; return _sp.call(this, m, mult, elem); }; }
{ const _sm = skillMagic; skillMagic = function(m, mult, elem){ const e = coatEl(); if (e && (!elem || elem === 'neutral')) elem = e; return _sm.call(this, m, mult, elem); }; }

/* the buff tile: kept in step with the real clock; gone (and the element back) when the time is up */
function coatBuff(){ const e = coatEl(); if (!e){ if (P.buffs.coat){ delete P.buffs.coat; renderBuffs(); } return; }
  const t = coatLeft(); if (!P.buffs.coat || P.buffs.coat.coatE !== e){ P.buffs.coat = {t, max:COAT_MS / 1000, coatE:e}; renderBuffs(); } else P.buffs.coat.t = t; }
{ const _bl = buffList; buffList = function(){ const list = _bl.apply(this, arguments); const b = list.find(x => x.k === 'coat'), e = coatEl();
    if (b && e){ b.name = L(`เคลือบธาตุ${ELEM_TH[e]}`, `${ELEM_EN[e]} coat`); b.eff = L(`โจมตีปกติและสกิลไร้ธาตุเป็นธาตุ${ELEM_TH[e]} · เหลือ ${Math.ceil(coatLeft() / 60)} นาที`, `Normal attacks and element-less skills are ${ELEM_EN[e]} · ${Math.ceil(coatLeft() / 60)} min left`); b.cap = L(ELEM_TH[e], ELEM_EN[e]).slice(0, 4); b.ic = [COAT_COL[e], (BUFF_IC.coat || BUFF_IC.auspice)[1]]; }
    return list; }; }
const CT = {t:0, was:null};
EV.on('tick', dt => {
  if (!S || !S.lvl || (CT.t += dt) < .5) return; CT.t = 0;
  const e = coatEl();
  if (CT.was && !e){ if (S.coat) delete S.coat; derive(); toast(L('ยาเคลือบธาตุหมดฤทธิ์แล้ว', 'The weapon coat has worn off')); dirty = true; }
  if (e && e !== CT.was) derive();
  CT.was = e; coatBuff();
});

/* drops: a monster of an element now and then leaves its own coat */
EV.on('kill', m => { const d = m && m.def; if (!d || !COAT_EL.includes(d.elem) || m.netRemoteKill) return;
  if (Math.random() < (d.boss ? .15 : .004)) dropLoot('coat_' + d.elem, m.x, m.y); });

/* the potion shop sells them, under its potions */
{ const _on = openNpc;
  openNpc = function(n){ const r = _on.apply(this, arguments);
    try { const d = $('#dialog'); if (n && d && !d.hidden && d.innerHTML.includes('ร้านยาขายแต่ยาและโพชั่น') || (n && d && d.innerHTML.includes('Potions only'))){
      const shop = d.querySelector('.shop'); if (shop && !d.querySelector('.coatshop')){
        const rows = COAT_IDS.map(id => { const it = ITEMS[id];
          return `<div class="srow"><span class="ic">${itemIcon(id)}</span><div class="nm"><b>${nm(it)}</b><small>${itemDesc(id)} · ${L('มี', 'have')} ${(S.inv[id] || 0).toLocaleString()}</small></div><span class="pr">${it.buy.toLocaleString()}</span>${qtyBox(id, 'item')}</div>`; }).join('');
        shop.insertAdjacentHTML('afterend', `<div class="sec coatshop">${L('ยาเคลือบอาวุธ (10 นาที)', 'Weapon oils (10 min)')}</div><div class="shop coatshop">${rows}</div>`); } } } catch (e) {}
    return r; }; }

/* the weapon shimmers faintly in the coat's colour (the blade line the sprite renderer records, as the refine glow uses) */
if (typeof LIVE !== 'undefined' && LIVE.drawOver && typeof rfNear === 'function'){ const _over = LIVE.drawOver;
  LIVE.drawOver = function(g){ const r = _over.apply(this, arguments); const e = coatEl();
    if (e && S && !P.dead && !(typeof SHEATH !== 'undefined' && (SHEATH.on || P.ride))){ const x = P.x - cam.x, y = P.y - cam.y, d = rfNear(x, y), segs = d ? d.segs : [[x + 6, y - 14, x + 6, y - 24]];
      g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; const c = COAT_COL[e], pul = .8 + Math.sin(T * 2.4) * .2;
      for (const [x0, y0, x1, y1] of segs){ for (const [w, a] of [[5, .08], [2.6, .16]]){ g.globalAlpha = a * pul; g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); } }
      g.restore(); }
    return r; }; }

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'coat', t:['ยาเคลือบธาตุ', 'Weapon oils'], b:() => `<p>${L('ทาอาวุธให้เป็นธาตุนั้น 10 นาที (เวลาจริง) · โจมตีปกติ ลูกธนู ดาวกระจาย และสกิลที่ไม่มีธาตุของตัวเองเปลี่ยนเป็นธาตุนั้น · สกิลที่มีธาตุอยู่แล้วคงธาตุเดิม · ทาใหม่แทนอันเก่า', 'Coats the weapon in an element for 10 minutes (real time) · normal attacks, arrows, stars and skills without an element of their own take it · skills with their own element keep it · a new coat replaces the old one')}</p>
  <p>${COAT_EL.map(e => `${nm(ITEMS['coat_' + e])} ${COAT_PRICE[e].toLocaleString()}`).join(' · ')} ${L('เบี้ย ที่ร้านยาป้าบัวคำ · มอนธาตุนั้นดรอปได้ (บอส 15%)', 'Bia at the potion shop · monsters of that element drop them (bosses 15%)')}</p>`});
