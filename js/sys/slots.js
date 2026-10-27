/* VAYRATHEN — js/sys/slots.js — the paper doll: 8 places (v29)
   อาวุธ Weapon · โล่ Shield · หมวก Head · เกราะ Body · กางเกง Legs · รองเท้า Feet · เครื่องประดับ 1 · เครื่องประดับ 2 — and a quiver for bow users.
   · A shield goes in the left hand, and only beside a one-handed blade or rod: two-handed weapons, bows, knuckles
     and twin daggers fill both hands. Taking up a two-handed weapon puts the shield back in the bag.
   · Shields BLOCK: a chance to stop an ordinary monster hit outright (boss skills and spells still land).
   · Two accessories: wearing one fills the free place first.
   · Feet add FLEE and move speed, and can be refined like armour.
   · Cards go in the weapon, head, body and feet (accessories have no socket).
   · What you wear shows on your hero (shoes too) — and other players see it online.
   Earrings, eyewear, masks and mouth pieces were retired in v28 (see data/gear.js gonePurge); shields and legs came back in v29. */
'use strict';

/* rolled options: shields, legs and feet draw from the armour pool */
Object.assign(SLOT_I, {shield:1, pants:1, shoes:1});
/* paper-doll icons and labels */
Object.assign(EQ_IC, {
  shield:'<path d="M10 2.8l6 2.2v5c0 3.8-2.6 6.4-6 7.6-3.4-1.2-6-3.8-6-7.6V5z"/><path d="M10 5.4v9.6M6.6 9.4h6.8"/>',
  pants:'<path d="M6 3h8l1.2 14h-3.6L10 8.6 8.4 17H4.8z"/><path d="M6 5.6h8"/>',
  shoes:'<path d="M5 4h4v7.4l6.2 2.2c1 .4 1.4 1.2 1.4 2.4H3.6L5 4z"/><path d="M3.6 16h13"/>'
});
EQ_IC.acc2 = EQ_IC.acc;
const EQ_LBL = {weapon:['อาวุธ', 'Weapon'], shield:['โล่', 'Shield'], pants:['กางเกง', 'Legs'], head:['หมวก', 'Head'], armor:['เกราะ', 'Armour'], shoes:['รองเท้า', 'Feet'], acc:['เครื่องประดับ 1', 'Accessory 1'], acc2:['เครื่องประดับ 2', 'Accessory 2'], ammo:['ลูกธนู', 'Arrows']};
const EQ_SOCKET = ['weapon', 'head', 'armor', 'shoes'];   // card sockets (accessories have none)
const eqEmptyHint = sl => sl === 'shield' && !shieldOk() ? L('อาวุธนี้ใช้สองมือ · ถือโล่ไม่ได้', 'Your weapon takes both hands · no shield') : L('ซื้อที่ช่างตีเหล็กเพชร หรือดรอปจากมอน', 'Sold by Blacksmith Phet, or dropped by monsters');

/* where a piece goes when you wear it (null = it can't be worn now) */
function wearSlot(it){
  if (!it) return null;
  if (it.slot === 'acc') return !S.gear.acc ? 'acc' : !S.gear.acc2 ? 'acc2' : 'acc';
  if (it.slot === 'shield' && !shieldOk()){ toast(L('ต้องถืออาวุธมือเดียว (ดาบ มีดสั้น คทา) จึงถือโล่ได้ (อาวุธสองมือ ธนู สนับมือ มีดคู่ ใช้ทั้งสองมือ)', 'A shield needs a one-handed weapon: blade, dagger or rod (two-handed weapons, bows, knuckles and twin daggers use both hands)')); return null; }
  if (it.slot === 'weapon' && it.st && handsOf(it.st) === '2h' && S.gear.shield){ addItem(S.gear.shield, 1); toast(L(`ถอด${nm(ITEMS[S.gear.shield])}เก็บเข้ากระเป๋า · อาวุธสองมือ`, `${nm(ITEMS[S.gear.shield])} put away · two-handed weapon`)); S.gear.shield = null; }
  return it.slot;
}
/* can the left hand hold a shield now? (one-handed blade or rod) */
function shieldOk(){
  if (typeof curHands === 'function' && curHands() === '2h') return false;
  const it = typeof wornWeapon === 'function' ? wornWeapon() : null, wt = it && it.st ? it.st.wtype : JOBS[S.job].weapon.type;
  if (it && it.st && handsOf(it.st) === '2h') return false;
  return wt === 'sword' || wt === 'staff' || wt === 'dagger';   // (v139) a one-handed dagger leaves a hand free for a shield too (twin daggers are two-handed: caught above)
}
/* a job change, a two-handed weapon from elsewhere, or an old off-hand weapon in the left hand: back to the bag */
function shieldCheck(){
  if (!S || !S.gear || !S.gear.shield) return;
  const id = S.gear.shield, it = ITEMS[id], g = GEAR[(it && it.base) || id] || GEAR[String(id).split('~')[0]];
  if (shieldOk() && g && g.slot === 'shield') return;
  S.gear.shield = null; addItem(id, 1); derive(); dirty = true;
  log(L(`ถอด${nm(it || {name:id})}เก็บเข้ากระเป๋า · มือซ้ายถือได้แค่โล่ คู่กับดาบหรือคทามือเดียว`, `${nm(it || {name:id})} put away · the left hand takes a shield, beside a one-handed blade or rod`));
}
EV.on('job', shieldCheck);
EV.on('tick', () => { if ((SLX.t = (SLX.t || 0) + 1) % 60 === 0){ shieldCheck(); cardSlotFix(); } });
const SLX = {};

/* HIT, FLEE, BLOCK and move speed from what you wear and the cards in it */
{ const _d = derive;
  derive = function(){ _d(); if (!DER) return;
    let hit = 0, flee = 0, block = 0, mv = 0;
    for (const sl in S.gear || {}){ const id = S.gear[sl], it = id && ITEMS[id]; if (!it || !it.st || it.kind !== 'gear') continue;
      if (sl === 'shield' && !shieldOk()) continue;
      hit += it.st.hit || 0; flee += it.st.flee || 0; block += it.st.block || 0; mv += it.st.movePct || 0; }
    for (const sl in S.slots || {}){ const c = S.slots[sl], b = c && CARDS[c] && CARDS[c].bonus; if (!b) continue; hit += b.hit || 0; flee += b.flee || 0; block += b.block || 0; mv += b.movePct || 0; }
    DER.hit += hit; DER.flee += flee; DER.block = Math.min(40, block); DER.move += mv;
  };
}
/* a card sitting in a socket that is no longer its own goes back to the bag */
/* a card sitting in a socket that is no longer its own goes back to the bag */
function cardSlotFix(){
  if (!S || !S.slots) return; let n = 0;
  for (const sl in S.slots){ const c = S.slots[sl]; if (c && (!CARDS[c] || CARDS[c].slot !== sl)){ S.slots[sl] = null; if (CARDS[c]){ S.cards[c] = (S.cards[c] || 0) + 1; n++; } } }
  if (n){ derive(); dirty = true; log(L(`การ์ด ${n} ใบย้ายช่องใหม่ · คืนเข้ากระเป๋าแล้ว ใส่ใหม่ได้ที่หน้าต่างอุปกรณ์ (Q)`, `${n} card(s) now belong to another socket · returned to your bag, slot them again in Equipment (Q)`), 'c'); }
}
/* BLOCK (shields and the warlord line's guard): a chance to stop an ordinary monster hit outright */
{ const _ma = mobAttack;
  mobAttack = function(m, mult = 1, noDodge = false){
    if (!noDodge && DER && DER.block && !P.roll && !P.dead && Math.random() * 100 < DER.block){
      m.lunge = .2; m.atkT = 0; if (!m.def.range) SFX.mob('atk', m); SFX.play('shieldhit');
      addText(P.x, P.y - 48, 'Block!', '#ffe7a0', 14); VFX.play('barrierHit', {x:P.x, y:P.y}); return;
    }
    return _ma(m, mult, noDodge);
  };
}
/* ---------- how shoes look on the hero ---------- */
const SL_MAT = {shoes:['straw', 'leather', 'wood', 'steel', 'plum', 'jade', 'sun', 'ember', 'ivory', 'gold', 'midnight'],
  shield:[['wood', 'straw', 0], ['leather', 'leather', 0], ['wood', 'lacquer', 'gold'], ['gold', 'steel', 0], ['gold', 'crimson', 'gem'], ['gold', 'jade', 'gem'], ['gold', 'sun', 'gem'], ['obsid', 'ember', 'gem'], ['gold', 'ivory', 'gem'], ['sun', 'gold', 'gem'], ['gold', 'midnight', 'gem']],
  pants:['cloth', 'leather', 'indigo', 'steel', 'crimson', 'jade', 'sun', 'ember', 'ivory', 'gold', 'midnight']};
EQ_NEW_LV.forEach((lv, i) => { SPR.GEAR_LOOK[`sh_${i}`] = {boots:SL_MAT.shoes[i], ...(i >= 4 ? {bootCuff:'gold'} : {})};
  const m = SL_MAT.shield[i]; SPR.GEAR_LOOK[`sd_${i}`] = {shield:[m[0], m[1], m[2], 1 + i * .02, i >= 4 ? 'gold' : 0]}; SPR.GEAR_LOOK[`pt_${i}`] = {pants:SL_MAT.pants[i]}; });

/* ---------- icons for shields, legs and shoes ---------- */
const SL_PAL = [['#f6e6b8', '#c8a060', '#6a4a22'], ['#e6b484', '#a8703c', '#5a3820'], ['#ffd08a', '#c0682a', '#5a2a10'], ['#ffffff', '#b8c4d8', '#56607a'], ['#ffb0b0', '#c4222a', '#5a1018'],
  ['#c8fff0', '#24a098', '#0a4440'], ['#fff6c0', '#f2c444', '#9a6414'], ['#ffb080', '#e0402e', '#4a0e08'], ['#ffffff', '#e8eef8', '#8a94b0'], ['#fff6c0', '#ffb830', '#8a4a0a'], ['#e0c8ff', '#7a4ad0', '#2a1050']];
function slArt(p, sl, i){
  const c = SL_PAL[i] || SL_PAL[0], G = lg(p + 'a', c, 0, 0, 1, 1), gold = lg(p + 'g', ['#fff6c0', '#f2c444', '#9a6414'], 0, 0, 1, 1);
  switch (sl){
    case 'shield': { const rim = i >= 3 ? `url(#${p}g)` : '#6a4528';
      return [G + gold, `<path d="M20 5.4l12 4.2v9.2c0 7.6-5.4 12.6-12 15-6.6-2.4-12-7.4-12-15V9.6z" fill="${rim}" ${OL}/><path d="M20 8.4l9.2 3.2v7.4c0 6-4.2 10-9.2 12-5-2-9.2-6-9.2-12v-7.4z" fill="url(#${p}a)" ${OL}/>
        ${i === 0 ? `<path d="M13 13l14 12M27 13L13 25M12 19h16" stroke="${c[2]}" stroke-width=".8" opacity=".6"/>` : `<path d="M20 9.4v20.6M11.6 17.6h16.8" stroke="${i >= 4 ? '#f2c444' : c[2]}" stroke-width="${i >= 4 ? 1.6 : 1}"/>`}
        <circle cx="20" cy="17.6" r="${i >= 4 ? 3 : 2.2}" fill="${i >= 4 ? `url(#${p}g)` : c[2]}" ${OL}/>${i >= 4 ? `<circle cx="20" cy="17.6" r="1.3" fill="${i >= 9 ? '#c080ff' : '#5ae0c0'}"/>` : ''}<path d="M13.6 11.6c2-1 4-1.4 6-1.4" stroke="#fff" stroke-width="1" opacity=".7"/>`]; }
    case 'pants':
      return [G + gold, `<path d="M11 6h18l2.6 28h-8L20 16.4 16.4 34h-8z" fill="url(#${p}a)" ${OL}/><path d="M11 6h18v4H11z" fill="${i >= 4 ? `url(#${p}g)` : c[2]}" ${OL}/>
        ${i === 2 ? `<path d="M14 12l-3 22M26 12l3 22" stroke="${c[2]}" stroke-width=".8" opacity=".6"/>` : ''}${i >= 3 ? `<path d="M9.4 26h7M23.6 26h7" stroke="${i >= 4 ? '#f2c444' : c[2]}" stroke-width="2"/>` : ''}<path d="M13.4 13l-1.6 18" stroke="#fff" stroke-width="1" opacity=".5"/>`];
    default:   // shoes
      return [G + gold, `<path d="M10 7h8v14l11.4 4.2c2 .8 2.8 2.2 2.8 4.4H7.4z" fill="url(#${p}a)" ${OL}/><path d="M7.4 29.6h24.8v3H7z" fill="${i >= 4 ? `url(#${p}g)` : '#3a2414'}" ${OL}/>
        ${i >= 4 ? `<path d="M10 9h8" stroke="#f2c444" stroke-width="2.4"/>` : `<path d="M12 12h5M12 15.4h5" stroke="${c[2]}" stroke-width="1"/>`}${i === 4 ? `<path d="M18 13l7-5-2 6z" fill="#fff" opacity=".85" ${OL}/>` : ''}<path d="M11.4 9v11" stroke="#fff" stroke-width="1" opacity=".5"/>`];
  }
}
{ const _ip = iaPick;
  iaPick = function(id){
    const it0 = ITEMS[id] || {}, bid = it0.base && ITEMS[it0.base] ? it0.base : id, g = GEAR[bid];
    if (g && EQ_NEW[g.slot]){ const i = +bid.split('_')[1] || 0, p = 'ia' + id.replace(/\W/g, '') + '§';
      return {p, art:slArt(p, g.slot, i), frame:Math.min(4, Math.floor(i / 2.2)), glow:SL_PAL[i][1]}; }
    return _ip(id);
  };
}

/* ---------- starter pieces: everyone gets straw sandals ---------- */
function slotsStarter(){
  if (!S || S.slv) return; S.slv = 1; S.gear = S.gear || {};
  const give = (sl, id) => { if (S.gear[sl]) return; let k = id; if (typeof makeInst === 'function') k = makeInst(id, 0) || id; S.gear[sl] = k; };
  give('shoes', 'sh_0'); derive(); dirty = true;
}
{ const _ng = newGame; newGame = function(...a){ const r = _ng.apply(this, a); try { slotsStarter(); } catch (e) {} return r; }; }
EV.on('netready', () => { try { slotsStarter(); } catch (e) {} });
setTimeout(() => { try { if (S && S.lvl && S.name) slotsStarter(); } catch (e) {} }, 1500);

/* ---------- v28: tell the player what happened to the retired pieces (once) ---------- */
function slots6Note(){
  if (!S || !S.lvl) return;
  if (ACC.v28c){ S.cards = S.cards || {}; for (const c in ACC.v28c) if (CARDS[c]) S.cards[c] = (S.cards[c] || 0) + ACC.v28c[c]; delete ACC.v28c; try { accSave(); } catch (e) {} derive(); dirty = true; }
  const msg = (o, where) => L(`ระบบสวมใส่ใหม่ 6 ช่อง: ${where}ขายอุปกรณ์ที่ถูกยกเลิก ${o.n} ชิ้น ได้ ${fmtN(o.z)} ${CUR()}${o.c ? ` · การ์ด ${o.c} ใบคืนเข้ากระเป๋า` : ''}`,
    `New 6-place equipment: ${o.n} retired piece(s) ${where ? 'in the bank ' : ''}sold for ${fmtN(o.z)} ${CUR()}${o.c ? ` · ${o.c} card(s) back in your bag` : ''}`);
  if (S.v28note){ const o = S.v28note; delete S.v28note; log(msg(o, ''), 'c'); toast(msg(o, '')); dirty = true; }
  if (ACC.v28note){ const o = ACC.v28note; delete ACC.v28note; try { accSave(); } catch (e) {}
    log(L(`คลังบัญชี: ขายอุปกรณ์ที่ถูกยกเลิก ${o.n} ชิ้น · ชุดแฟชั่นที่ถูกยกเลิกคืนเป็น ${fmtN(o.z)} ${CUR()} (เข้าคลัง)${o.c ? ` + ${o.c} เหรียญวายรา` : ''}`,
      `Account bank: ${o.n} retired piece(s) sold · retired fashion refunded: ${fmtN(o.z)} ${CUR()} (into the bank)${o.c ? ` + ${o.c} Vayra Coins` : ''}`), 'c'); }
}
EV.on('tick', () => { if (SLX.n !== S && S && S.lvl && (SLX.t || 0) > 30){ SLX.n = S; try { slots6Note(); } catch (e) {} } });

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'slots', t:['ช่องสวมใส่ 8 ช่อง', '8 equipment places'], b:() => `<p>${L('อาวุธ · โล่ · หมวก · เกราะ · กางเกง · รองเท้า · เครื่องประดับ 2 ข้าง (+ ลูกธนูสำหรับสายธนู)', 'Weapon · Shield · Head · Body · Legs · Feet · two Accessories (+ arrows for bow users)')}</p>
  <ul><li>${L('โล่: DEF · HP · บล็อก (ถือคู่ดาบหรือคทามือเดียว) — เกราะ: DEF · HP — กางเกง: DEF · HP · VIT — หมวก: MDEF · SP · HIT · FLEE — รองเท้า: DEF · FLEE · ความเร็วเดิน', 'Shield: DEF · HP · Block (beside a one-handed blade or rod) — Body: DEF · HP — Legs: DEF · HP · VIT — Head: MDEF · SP · HIT · FLEE — Feet: DEF · FLEE · move speed')}</li>
  <li>${L('ใส่การ์ดได้ที่ อาวุธ หมวก เกราะ รองเท้า (เครื่องประดับไม่มีช่อง Card)', 'Cards go in weapon, head, body and feet (accessories have no socket)')}</li>
  <li>${L('โล่ กางเกง รองเท้า มีอย่างละ 11 ระดับ (Lv 1–280) ดรอปจากมอน หรือซื้อที่ช่างตีเหล็กเพชร · ตีบวกได้', 'Shields, legs and feet have 11 tiers each (Lv 1–280): monster drops, or buy from Blacksmith Phet · they can be refined')}</li></ul>`});

/* ---------- fashion shoes ----------
   Look-only shoes in the wardrobe (Q → ชุดแฟชั่น), sold by the tailor. Account-wide like every costume. */
const FASH_SLOTS = {shoes:['รองเท้าแฟชั่น', 'Fashion shoes']};
const FASH = {
  fo_sneaker:['shoes', 'รองเท้าผ้าใบขาว', 'White Sneakers', {z:4000}, {boots:'ivory', bootCuff:'sky'}],
  fo_red:['shoes', 'รองเท้าแดงนำโชค', 'Lucky Red Shoes', {z:6000}, {boots:'scarlet', bootCuff:'gold'}],
  fo_glass:['shoes', 'รองเท้าแก้วจันทรา', 'Moon Glass Slippers', {c:20}, {boots:'sky', bootCuff:'ivory'}],
  fo_gold:['shoes', 'รองเท้าทองเทวดา', 'Celestial Gold Shoes', {c:30}, {boots:'sun', bootCuff:'gold'}]
};
for (const id in FASH){ const [slot, th, en, price, look] = FASH[id]; COSTUME[id] = {slot, th, en, src:price.z ? 'shop' : 'coin', price, look, fash:true}; SPR.GEAR_LOOK[id] = {...look}; }
const isFash = id => !!(COSTUME[id] && COSTUME[id].fash);
/* the worn look: fashion shoes cover the shoes you wear */
{ const _vg = visGear;
  visGear = function(g){ const out = _vg(g);
    if (S && S.cos && g === S.gear) for (const k in FASH_SLOTS){ const c = S.cos[k]; if (c && COSTUME[c]) out[k] = dyeId(c); }
    return out; };
}
/* dyes work on fashion shoes too: main colour = the shoe, accent = the cuff */
DYE_MAIN.push('boots');
{ const _gg = ghostGear;
  ghostGear = function(str){ const out = _gg(str); if (typeof str !== 'string' || str.length > 340) return out;
    str.split(',').forEach((part, i) => { const sl = GHOST_SLOTS[i], d = dyeParse(part); if (i >= 4 && sl && d && COSTUME[d.id] && COSTUME[d.id].slot === sl && dyeEnsure(part)) out[sl] = part; });
    return out; };
}
/* trying one on in the wardrobe */
{ const _eps = eqPreviewSheet;
  eqPreviewSheet = function(){ if (EQ.tab === 'cos' && EQ.try && isFash(EQ.try)){ const g = {...visGear(S.gear)}; g[COSTUME[EQ.try].slot] = dyeId(EQ.try); return heroSheet(S.job, g, S.look); } return _eps(); };
}
/* the wardrobe lists them under their own headings */
{ const _rw = renderWardrobe;
  renderWardrobe = function(){ _rw(); const grid = document.querySelector('#pane-equip .cosgrid'); if (!grid) return;
    const sel = EQ.try, tile = id => { const own = cosHave(id), tr = cosTrial(id), on = S.cos[COSTUME[id].slot] === id;
      return `<button class="cosit${on ? ' on' : ''}${sel === id ? ' sel' : ''}" data-costry="${id}"><i class="cosw" data-cth="${id}" style="--c1:${fashSw(id, 0)};--c2:${fashSw(id, 1)}"></i><b>${cosName(id)}</b>
        <small>${on ? L('สวมอยู่', 'Wearing') : own ? L('มีแล้ว', 'Owned') : tr ? `<em class="trial">${L('ทดลองใช้ฟรี', 'Free trial')}</em>` : L('ยังไม่มี', 'Locked')}</small></button>`; };
    const html = Object.keys(FASH_SLOTS).map(k => { const ids = Object.keys(FASH).filter(i => FASH[i][0] === k);
      return `<div class="sec">${L(...FASH_SLOTS[k])} <span class="ct">${ids.filter(cosHave).length}/${ids.length}</span></div><div class="coslist">${ids.map(tile).join('')}</div>`; }).join('');
    const hint = grid.querySelector(':scope > p.hint:last-of-type') || grid.lastElementChild; if (hint) hint.insertAdjacentHTML('beforebegin', html); else grid.insertAdjacentHTML('beforeend', html);
  };
}
function fashSw(id, i){ const lk = FASH[id][4], m = i ? (lk.bootCuff || 'gold') : (lk.boots || 'gold');
  const mt = SPR.MATS[SPR.M[m]]; return mt ? mt.hex[1] : '#888'; }
{ const _cs = cosSwatch; cosSwatch = (id, i) => (isFash(id) ? fashSw(id, i) : _cs(id, i)); }
/* portraits: the full hero */
{ const _cr = cthRender;
  cthRender = function(id){
    if (!isFash(id)) return _cr(id);
    const k = COSTUME[id].slot, c = document.createElement('canvas'); c.width = CTH_W; c.height = CTH_H; const g = c.getContext('2d'), SC = CTH_W / 120;
    const bg = g.createRadialGradient(CTH_W / 2, CTH_H * .55, 4, CTH_W / 2, CTH_H * .55, CTH_W * .75); bg.addColorStop(0, 'rgba(255,236,190,.3)'); bg.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = bg; g.fillRect(0, 0, CTH_W, CTH_H);
    const gear = {weapon:cthWeapon() || null, [k]:id};
    try { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(CTH_W / 2, CTH_H - 8, 24, 7, 0, 0, 7); g.fill(); const s = 2.9 * SC; g.setTransform(s, 0, 0, s, CTH_W / 2, CTH_H - 8); cthHero(g, gear, 1); }
    catch (e) { return null; }
    return c.toDataURL('image/png');
  };
}
/* the tailor's list names the place */
{ const _t = NPC_OPEN.tailor;
  NPC_OPEN.tailor = n => { _t(n); document.querySelectorAll('#dialog [data-cosbuy]').forEach(b => { const id = b.dataset.cosbuy; if (!isFash(id)) return; const sm = b.closest('.srow') && b.closest('.srow').querySelector('.nm small'); if (sm) sm.textContent = L(...GEAR_SLOT[COSTUME[id].slot]); }); };
}
