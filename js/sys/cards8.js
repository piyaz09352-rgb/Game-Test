/* VAYRATHEN — js/sys/cards8.js — cards in every place you wear, rebalanced (v29)
   · Card places follow the equipment window: อาวุธ Weapon · โล่ Shield · หมวก Head · เกราะ Armour · กางเกง Legs ·
     รองเท้า Feet · เครื่องประดับ Accessory (fits either accessory place). Every one of the 8 worn pieces can have sockets.
   · The bag's Card tab has chips for each place, like the Equipment tab.
   · Every monster card belongs to one of sixteen families, so every kind of build has its cards:
       Attack  (weapon): race slayer · elemental edge · status strike (poison, burn, bleed, slow, freeze, stun, blind, curse) · critical
       Defence (shield): race ward · element ward · bulwark          Head: mind · clarity
       Armour: vigour · plate          Legs: stride · grit          Feet: swift          Accessory: power · fortune
     Strength grows with the monster's level (tier = 1 per 25 levels), on one scale, so no single card outclasses the rest.
     (v98) past tier 4 each tier counts a little over half (c8Tier: tier 15 → 10), so a hero with 3 sockets in all 8 places
     cannot stack cards past the stat cap; Max HP grows with that tier, not the raw level.
   · Boss cards are clearly better: two families at ×1.4 (was ×1.8) plus All Stats +1, marked ★.
   · PvP: offensive card power counts less against players (race slayer 40%, element 50%, critical 60%, power 70%),
     status strikes land half as often and half as long, and stun/freeze become a slow. */
'use strict';

/* ---------- 8 places take cards ---------- */
for (const sl of ['shield', 'pants', 'acc', 'acc2']) if (!EQ_SOCKET.includes(sl)) EQ_SOCKET.push(sl);
const C8_PLACES = [['weapon', 'อาวุธ', 'Weapon'], ['shield', 'โล่', 'Shield'], ['head', 'หมวก', 'Head'], ['armor', 'เกราะ', 'Armour'], ['pants', 'กางเกง', 'Legs'], ['shoes', 'รองเท้า', 'Feet'], ['acc', 'เครื่องประดับ', 'Accessory']];
Object.assign(SLOT_TH, {shield:'โล่', pants:'กางเกง', shoes:'รองเท้า', acc:'เครื่องประดับ'}); Object.assign(SLOT_EN, {shield:'Shield', pants:'Legs', shoes:'Feet', acc:'Accessory'});

/* ---------- the sixteen families ---------- */
const C8_FAM = [
  ['race', 'weapon'], ['raceRed', 'shield'], ['mind', 'head'], ['vigor', 'armor'], ['stride', 'pants'], ['swift', 'shoes'], ['power', 'acc'], ['elem', 'weapon'],
  ['elemRes', 'shield'], ['clarity', 'head'], ['plate', 'armor'], ['grit', 'pants'], ['fortune', 'acc'], ['proc', 'weapon'], ['bulwark', 'shield'], ['crit', 'weapon']];
const C8_PREY = {brute:'plant', plant:'insect', insect:'fish', fish:'brute', undead:'human', human:'undead', demon:'angel', angel:'demon', dragon:'dragon', formless:'formless'};
const C8_PROC = {fire:'burn', water:'freeze', earth:'stun', wind:'slow', holy:'blind', shadow:'curse', poison:'poison', undead:'poison', ghost:'curse', neutral:'bleed'};
const C8_PROC_TX = {burn:['ไฟลวก', 'Burn'], freeze:['แช่แข็ง', 'Freeze'], stun:['สลบ', 'Stun'], slow:['ช้า', 'Slow'], blind:['ตาพร่า', 'Blind'], curse:['คำสาป', 'Curse'], poison:['พิษ', 'Poison'], bleed:['เลือดไหล', 'Bleed']};
const C8_MAIN = ['str', 'dex', 'int', 'agi', 'luk', 'vit'];
const C8_PVP = {race:.4, elem:.5, crit:.6, power:.7};
const r1 = v => Math.round(v * 10) / 10, p3 = v => +v.toFixed(3);
const c8Tier = t => (t <= 4 ? t : +(4 + (t - 4) * .55).toFixed(2));   // (v98) diminishing tiers
function c8Family(fam, t, lvl, i, elem, race){
  const b = {}, main = C8_MAIN[i % 6], el = ELEM.includes(elem) ? elem : 'neutral';
  switch (fam){
    case 'race': b.race = {[C8_PREY[race] || 'brute']:p3((5 + t * 1.5) / 100)}; b['defIgnRace_' + (C8_PREY[race] || 'brute')] = p3(t * .01); b[main] = Math.ceil(t / 2); break;   // (v55) also ignores part of that race's DEF
    case 'elem': b['elem_' + el] = p3((3 + t * 2) / 100); b.hit = t * 2; break;
    case 'proc': b.proc = {k:C8_PROC[elem] || 'bleed', p:p3(Math.min(.065, .03 + t * .0025)), d:r1(Math.min(4, 1.6 + t * .15))}; b.atk = t * 2; break;
    case 'crit': b.crit = Math.ceil(t * .8); b.luk = Math.ceil(t / 2); b.atkPct = p3(t * .004); break;
    case 'raceRed': b['raceRed_' + (race || 'brute')] = p3(Math.min(.25, .04 + t * .015)); b.def = t; break;
    case 'elemRes': b['elemRes_' + el] = p3(Math.min(.3, .05 + t * .02)); b.mdef = t; break;
    case 'bulwark': b.def = t * 2; b.hp = lvl * 2; b.critRes = t * 2; break;
    case 'mind': b.int = Math.ceil(t * .7); b.matkPct = p3(t * .005); b.sp = lvl; break;
    case 'clarity': b.castPct = p3(t * .01); b.resPct = p3((1 + t * .6) / 100); b.mdef = t; break;
    case 'vigor': b.hp = lvl * 3; b.hpPct = p3(t * .004); b.vit = Math.ceil(t / 2); break;
    case 'plate': b.def = t * 2; b.dmgRed = p3(t * .004); b.hp = lvl; break;
    case 'stride': b.def = t; b.hp = lvl * 2; b.critRes = t * 2; break;
    case 'grit': b.resPct = p3(t * .008); b.vit = Math.ceil(t / 2); b.healPow = p3(t * .01); break;
    case 'swift': b.flee = t * 2; b.agi = Math.ceil(t / 2); b.aspd = Math.ceil(t / 3); b.movePct = p3(Math.min(.04, .01 + t * .002)); b.cdr = p3(t * .005); break;
    case 'power': b[main] = Math.ceil(t * .8); if (main === 'int') b.matkPct = p3(t * .004); else b.atkPct = p3(t * .004); break;
    case 'fortune': b.luk = Math.ceil(t * .6); b.crit = Math.ceil(t / 2); b.hit = t * 2; break;
  }
  return b;
}
const C8_SCALE = (b, k) => { const o = {}; for (const key in b){ const v = b[key];
  if (key === 'race'){ o.race = {}; for (const r in v) o.race[r] = p3(v[r] * k); }
  else if (key === 'proc') o.proc = {...v, p:p3(Math.min(.1, v.p * k)), d:r1(v.d * Math.min(1.4, k))};
  else if (/Pct$|^(dmgRed|castPct|healPow|cdr|resPct|movePct|defIgn|mdefIgn)$|^(elem_|raceRed_|elemRes_|defIgn|mdefIgn)/.test(key)) o[key] = p3(v * k);
  else o[key] = Math.round(v * k); } return o; };
const c8Merge = (a, b) => { const o = {...a}; for (const k in b){ if (k === 'race'){ o.race = {...(o.race || {})}; for (const r in b.race) o.race[r] = p3((o.race[r] || 0) + b.race[r]); }
  else if (k === 'proc') o.proc = o.proc ? (o.proc.p >= b.proc.p ? o.proc : b.proc) : b.proc; else o[k] = typeof b[k] === 'number' ? p3((o[k] || 0) + b[k]) : b[k]; } return o; };

/* ---------- text ---------- */
const C8_NM = {aspd:'ASPD', str:'STR', agi:'AGI', vit:'VIT', int:'INT', dex:'DEX', luk:'LUK', atk:'ATK', def:'DEF', mdef:'MDEF', hit:'HIT', flee:'FLEE', crit:'CRIT', critRes:['ต้านคริ', 'Crit Resist'], hp:'Max HP', sp:'Max SP', all:['ทุก Stat', 'All Stats']};
const C8_PCT = {atkPct:'ATK', matkPct:'MATK', hpPct:'Max HP', spPct:'Max SP', castPct:['ร่ายเร็วขึ้น', 'Cast time −'], resPct:['ต้านสถานะ', 'Status resist'], dmgRed:['รับดาเมจ −', 'Damage taken −'],
  healPow:['ฟื้นฟูแรงขึ้น', 'Healing'], cdr:['คูลดาวน์ −', 'Cooldown −'], movePct:['ความเร็วเดิน', 'Move speed']};
function c8Text(b, en){
  const out = [], tx = v => (Array.isArray(v) ? v[en ? 1 : 0] : v), pc = v => `${+(v * 100).toFixed(1)}%`;
  for (const k in b){ const v = b[k];
    if (k === 'race') for (const r in v) out.push(en ? `+${pc(v[r])} damage to ${RACE_EN[r] || r}` : `ดาเมจต่อเผ่า${RACE_TH[r] || r} +${pc(v[r])}`);
    else if (k === 'proc') out.push(en ? `${pc(v.p)} on hit: ${C8_PROC_TX[v.k][1]} ${v.d}s` : `โจมตีมีโอกาส ${pc(v.p)} ติด${C8_PROC_TX[v.k][0]} ${v.d} วิ`);
    else if (k.startsWith('elem_')){ const e = k.slice(5); out.push(en ? `${ELEM_EN[e]} damage +${pc(v)}` : `ดาเมจธาตุ${ELEM_TH[e]} +${pc(v)}`); }
    else if (k.startsWith('defIgnRace_')){ const r = k.slice(11); out.push(en ? `Ignore ${pc(v)} DEF of ${RACE_EN[r] || r}` : `เจาะเกราะเผ่า${RACE_TH[r] || r} ${pc(v)}`); }
    else if (k.startsWith('elemRes_')){ const e = k.slice(8); out.push(en ? `${ELEM_EN[e]} damage taken −${pc(v)}` : `รับดาเมจธาตุ${ELEM_TH[e]} −${pc(v)}`); }
    else if (k.startsWith('raceRed_')){ const r = k.slice(8); out.push(en ? `Damage from ${RACE_EN[r] || r} −${pc(v)}` : `รับดาเมจจากเผ่า${RACE_TH[r] || r} −${pc(v)}`); }
    else if (C8_PCT[k]){ const n = tx(C8_PCT[k]); out.push(/[−]$/.test(n) ? `${n}${pc(v)}` : `${n} +${pc(v)}`); }
    else if (C8_NM[k]) out.push(`${tx(C8_NM[k])} +${v}${k === 'crit' || k === 'critRes' ? '%' : ''}`); }
  return out.join(', ');
}
const c8Set = (id, slot, fam, b, extra = {}) => { const c = CARDS[id]; if (!c) return; c.slot = slot; c.kind = fam; c.bonus = b; c.desc = [c8Text(b, false), c8Text(b, true)]; Object.assign(c, extra); };

/* ---------- monster cards: every species ---------- */
if (typeof SPECIES !== 'undefined') SPECIES.forEach(([id, th, en, lvl, arch, look, elem, race], i) => {
  const t = c8Tier(Math.max(1, Math.ceil(lvl / 25))), [fam, slot] = C8_FAM[i % C8_FAM.length];
  c8Set(`c_${id}`, slot, fam, C8_SCALE(c8Family(fam, t, Math.round(t * 25), i, elem, race), 1), {pvp:C8_PVP[fam] || 1});
});
/* the four starting-field cards join the families too */
c8Set('c_dew', 'armor', 'vigor', {hp:200, vit:1, luk:1});
c8Set('c_hare', 'weapon', 'race', {race:{plant:.07}, str:1});
c8Set('c_boar', 'pants', 'stride', {vit:2, def:2, hp:80});
c8Set('c_lantern', 'weapon', 'elem', {elem_holy:.06, hit:4}, {pvp:.5});
/* boss cards: two families of their place at ×1.4, plus All Stats — always worth more than any monster card */
const C8_BOSS_PLACE = ['weapon', 'armor', 'head', 'shield', 'acc', 'pants', 'shoes'];
if (typeof BOSSES !== 'undefined') BOSSES.forEach(([id, th, en, lvl, arch, look, elem, race], i) => {
  const c = `c_${id}`; if (!CARDS[c]) return; const t = c8Tier(Math.max(1, Math.ceil(lvl / 25))), L = Math.round(t * 25), slot = C8_BOSS_PLACE[i % C8_BOSS_PLACE.length];
  const fams = C8_FAM.filter(f => f[1] === slot).map(f => f[0]); const f1 = fams[i % fams.length], f2 = fams[(i + 1) % fams.length];
  let b = C8_SCALE(c8Family(f1, t, L, i, elem, race), 1.4); if (f2 !== f1) b = c8Merge(b, C8_SCALE(c8Family(f2, t, L, i + 1, elem, race), 1.4));
  b = c8Merge(b, {all:1});
  c8Set(c, slot, f1, b, {boss:true, pvp:Math.min(C8_PVP[f1] || 1, C8_PVP[f2] || 1, .8)});
  if (!/^★/.test(CARDS[c].name)){ CARDS[c].name = '★ ' + CARDS[c].name; CARDS[c].en = '★ ' + CARDS[c].en; }
});
/* the old fields' boss keeps its drain, now on a head card worth a boss */
if (CARDS.c_boss){ CARDS.c_boss.boss = true; CARDS.c_boss.slot = 'head'; CARDS.c_boss.bonus = {int:2, dex:2, sp:40, mdef:2}; CARDS.c_boss.pvp = .5;
  CARDS.c_boss.desc = [`ดูด HP และ SP 3% ของดาเมจ, ${c8Text(CARDS.c_boss.bonus, false)}`, `Drains 3% of damage as HP and SP, ${c8Text(CARDS.c_boss.bonus, true)}`]; if (!/^★/.test(CARDS.c_boss.name)){ CARDS.c_boss.name = '★ ' + CARDS.c_boss.name; CARDS.c_boss.en = '★ ' + CARDS.c_boss.en; } }

/* ---------- old saves: a card that no longer fits its piece goes back to the card bag ---------- */
const C8 = {ref:[]};
{ const _san = sanitizeInst;
  sanitizeInst = function(d){ const r = _san.apply(this, arguments);
    try { if (r && d && Array.isArray(d.c)) for (const c of d.c) if (CARDS[c] && !(r.c || []).includes(c)) C8.ref.push(c); } catch (e) {}
    return r; }; }
{ const _d = derive;
  derive = function(){ if (C8.ref.length && S && S.cards){ const n = C8.ref.length; for (const c of C8.ref) S.cards[c] = (S.cards[c] || 0) + 1; C8.ref = [];
      setTimeout(() => log(L(`การ์ด ${n} ใบย้ายหมวดใหม่ คืนเข้ากระเป๋าการ์ดแล้ว`, `${n} card(s) moved to a new place and went back to your card bag`), 'c'), 1500); dirty = true; }
    return _d.apply(this, arguments); }; }

/* ---------- the new card effects ---------- */
const c8Worn = () => Object.values(S.slots || {}).map(c => CARDS[c]).filter(Boolean);
function c8Sum(prefix){ let v = 0; for (const c of c8Worn()) if (c.bonus && c.bonus[prefix]) v += +c.bonus[prefix] || 0; return v; }
/* element and race wards: monster hits */
{ const _ma = mobAttack;
  mobAttack = function(m, mult = 1, noDodge){ if (m && m.def){ const red = Math.min(.35, c8Sum('elemRes_' + (m.def.elem || 'neutral')) + c8Sum('raceRed_' + (m.def.race || ''))); if (red > 0) mult *= 1 - red; }
    return _ma.call(this, m, mult, noDodge); }; }
/* status strikes */
const c8Procs = () => c8Worn().filter(c => c.bonus && c.bonus.proc).map(c => c.bonus.proc);
function c8ProcMob(m, pr){
  const s = m.st || (m.st = {});
  if (pr.k === 'poison' || pr.k === 'bleed'){ s.poison = pr.d; s.poisonDps = DER.atk * (pr.k === 'bleed' ? .12 : .1); s.poisonT = 1; }
  else if (pr.k === 'burn'){ m.burnT = T + pr.d; m.burnDps = Math.max(DER.atk, DER.matk) * .12; }
  else if (pr.k === 'freeze') applyStatus(m, {freeze:[1, Math.min(2, pr.d * .5)]});
  else if (pr.k === 'stun') applyStatus(m, {stun:Math.min(1.5, pr.d * .4)});
  else if (pr.k === 'slow') applyStatus(m, {slow:[.3, pr.d]});
  else if (pr.k === 'blind') applyStatus(m, {atkDown:[.15, pr.d]});
  else if (pr.k === 'curse') applyStatus(m, {defDown:[.15, pr.d]});
  addText(m.x, m.y - (MOB_H[m.type] || 30) - 6, L(C8_PROC_TX[pr.k][0], C8_PROC_TX[pr.k][1]), AF_INFO[pr.k] ? AF_INFO[pr.k][2] : '#ffd56a', 11);
}
{ const _ad = applyDamage;
  applyDamage = function(m, res, sk){ const r = _ad.apply(this, arguments);
    try { if (m && !m.dead && !m.pvp && m.def && !m.def.boss && res && res.dmg > 0 && !res.pet && !res.poison && !res.dot && !res.c8 && !P.dead && (m.c8T || 0) < T)
      for (const pr of c8Procs()) if (Math.random() < pr.p){ m.c8T = T + .6; c8ProcMob(m, pr); break; } } catch (e) {}
    return r; }; }

/* ---------- PvP: offensive card power counts less, statuses are milder ---------- */
function c8PvpMul(){
  let full = 0, pvp = 0;
  for (const c of c8Worn()){ const b = c.bonus || {}, w = c.pvp == null ? 1 : c.pvp; let v = 0;
    if (b.race && b.race.human) v += b.race.human; for (const k in b) if (k.startsWith('elem_') || k === 'atkPct' || k === 'matkPct') v += +b[k] || 0;
    full += v; pvp += v * w; }
  return (1 + pvp) / (1 + full);
}
if (typeof pvpDeal === 'function'){
  const _pd = pvpDeal;
  pvpDeal = function(t, res){ if (res && res.dmg > 0){ res = {...res, dmg:res.dmg * c8PvpMul()};
      for (const pr of c8Procs()) if (Math.random() < pr.p * .5){ C8.pvpAf = {k:pr.k === 'stun' || pr.k === 'freeze' ? 'slow' : pr.k, d:r1(pr.d * .5)}; break; } }
    return _pd.call(this, t, res); };
  const _ps = pvpSend;
  pvpSend = function(k, extra = {}){ if (k === 'hit' && C8.pvpAf){ extra = {...extra, af:C8.pvpAf.k, ad:C8.pvpAf.d}; C8.pvpAf = null; } return _ps.call(this, k, extra); };
  const _op = onPvp;
  onPvp = function(msg){ _op.apply(this, arguments); try { const d = msg.data || {}; if (d.k === 'hit' && d.af && !msg.isMe && msg.peer === DUEL.peer && !DUEL.over && typeof afflict === 'function' && AF_INFO[d.af])
      afflict(d.af, clamp(+d.ad || 1, .5, 2.5), {power:Math.max(1, Math.round(DER.maxhp * .006)), amt:.25}); } catch (e) {} };
}

/* ---------- bag: card chips per place ---------- */
BAG.cslot = 'all';
const c8Of = c => (CARDS[c] && CARDS[c].slot) || '';
{ const _be = bagEntries;
  bagEntries = function(){ const r = _be.apply(this, arguments); if (BAG.tab !== 'card' || BAG.cslot === 'all') return r; return r.filter(e => c8Of(e.id) === BAG.cslot); }; }
{ const _bd = bagDraw;
  bagDraw = function(){ const r = _bd.apply(this, arguments); const grid = el('bagGrid'); if (!grid || BAG.tab !== 'card') return r; let bar = el('bagSlotBar');
    if (!bar){ bar = document.createElement('div'); bar.id = 'bagSlotBar'; grid.parentNode.insertBefore(bar, grid); }
    const cnt = {all:0}; for (const c in S.cards || {}) if (S.cards[c] > 0 && CARDS[c]){ cnt[c8Of(c)] = (cnt[c8Of(c)] || 0) + S.cards[c]; cnt.all += S.cards[c]; }
    bar.hidden = false; bar.innerHTML = [['all', 'ทั้งหมด', 'All'], ...C8_PLACES].map(([k, th, en]) => `<button class="${BAG.cslot === k ? 'on' : ''}" data-bagcslot="${k}">${L(th, en)} <small>${cnt[k] || 0}</small></button>`).join('');
    return r; }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bagcslot]'); if (!b) return; e.stopPropagation(); BAG.cslot = b.dataset.bagcslot; BAG.sel = null; bagDraw(); bagInfo(); }, true);
/* the card's detail names its place with the equipment names; boss cards get a gold edge */
{ const st = document.createElement('style');
  st.textContent = `.card.boss,.cardv.boss{box-shadow:0 0 0 2px #ffd36a,0 0 12px rgba(255,200,80,.55)}`;
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'cards8', t:['การ์ด 7 หมวด', 'Cards: seven places'], b:() => `<p>${L('การ์ดแบ่งตามที่สวมใส่: อาวุธ · โล่ · หมวก · เกราะ · กางเกง · รองเท้า · เครื่องประดับ (ใส่ได้ทั้ง 2 ช่อง) · มี 16 ตระกูล ทั้งโจมตี ป้องกัน ธาตุ สถานะ และเอฟเฟกต์ · การ์ดบอส (★) แรงกว่า 1.8 เท่าและมี All Stats · ใน PvP พลังโจมตีจากการ์ดลดลง สถานะติดยากขึ้นและสั้นลง สลบ/แช่แข็งกลายเป็นช้า', 'Cards go by worn place: weapon · shield · head · armour · legs · feet · accessory (either place) · 16 families: attack, defence, elements, statuses and effects · boss cards (★) are 1.8× stronger with All Stats · in PvP card attack power counts less, statuses land less often and shorter, and stun/freeze become a slow')}</p>`});
