/* VAYRATHEN — js/sys/cards193.js — (v193) every card does its own thing, and none is over the top
   The owner found cards repeating themselves (619 cards built from about ten recipes, e.g. 68 cards that were all
   "crit resist + DEF + HP") and some far too strong. Every card is rebuilt here, keeping its place (so cards already
   socketed stay put):
     · ONE signature ability that fits the monster (its element, race, size and body) + ONE small stat;
     · no two cards share the same ability + target + stat;
     · values come from the monster's level but flatten out and stop at a ceiling (an element bonus never passes 12%,
       a stat never +4, a status resist never 35%); no card gives attack speed any more;
     · boss cards: a second signature ability, ×1.3, and All Stats +1.
   New abilities (they also come on gear: see the affixes at the end):
     vsElem_X  more damage to monsters of element X      vsSize_s/m/l  more damage to small / medium / large monsters
     sizeRed_  less damage from small / medium / large   res_K         a chance to shrug off status K
   Already there and still used: elem_X (your X-element attacks hit harder), race slayer, race / element ward,
   status strike (proc). */
'use strict';
const C9_ST = ['poison', 'burn', 'bleed', 'slow', 'freeze', 'root', 'silence', 'blind', 'curse'];
const C9_ST_TX = {poison:['พิษ', 'Poison'], burn:['ไฟลวก', 'Burn'], bleed:['เลือดไหล', 'Bleed'], slow:['เชื่องช้า', 'Slow'], freeze:['แช่แข็ง', 'Freeze'], root:['ตรึง', 'Root'], silence:['ใบ้', 'Silence'], blind:['ตาพร่า', 'Blind'], curse:['คำสาป', 'Curse'], stun:['สลบ', 'Stun']};
const C9_PROC_OK = ['poison', 'burn', 'bleed', 'slow', 'freeze', 'stun', 'blind', 'curse'];
const C9_SIZES = ['s', 'm', 'l'];
const C9_STATS = ['str', 'agi', 'vit', 'int', 'dex', 'luk'];
const c9P = v => +v.toFixed(3);
/* a monster's own status, from its body and element */
function c9Theme(d){ const n = d.nature || '', e = d.elem || 'neutral';
  if (n === 'serpent' || e === 'poison') return 'poison'; if (e === 'fire') return 'burn'; if (e === 'water') return 'freeze';
  if (n === 'rock' || e === 'earth') return 'stun'; if (n === 'bird') return 'blind'; if (e === 'wind') return 'slow';
  if (e === 'shadow' || d.race === 'undead' || d.race === 'demon') return 'curse'; if (n === 'bug') return 'bleed'; if (d.race === 'plant') return 'root';
  if (n === 'slime') return 'slow'; if (e === 'holy') return 'blind'; return 'bleed'; }
/* signature abilities a place can carry: [key builder, value at tier t] */
const C9_PRIMARY = {
  weapon:d => [['elem_' + (ELEM.includes(d.elem) ? d.elem : 'neutral'), t => (4 + 1.5 * t) / 100], ['race:' + (C8_PREY[d.race] || 'brute'), t => (5 + 1.5 * t) / 100],
    ['vsElem_' + c9Counter(d.elem), t => (5 + 1.5 * t) / 100], ['vsSize_' + (d.size || 'm'), t => (4 + 1.4 * t) / 100], ['proc:' + c9Proc(d), t => t],
    ...ELEM.map(e => ['vsElem_' + e, t => (5 + 1.5 * t) / 100]), ...C9_SIZES.map(z => ['vsSize_' + z, t => (4 + 1.4 * t) / 100]), ...C9_PROC_OK.map(k => ['proc:' + k, t => t]), ...Object.keys(C8_PREY).map(r => ['race:' + r, t => (5 + 1.5 * t) / 100])],
  shield:d => [['elemRes_' + (d.elem || 'neutral'), t => (6 + 2 * t) / 100], ['raceRed_' + (d.race || 'brute'), t => (5 + 1.5 * t) / 100], ['sizeRed_' + (d.size || 'm'), t => (4 + 1.4 * t) / 100],
    ...ELEM.map(e => ['elemRes_' + e, t => (6 + 2 * t) / 100]), ...C9_SIZES.map(z => ['sizeRed_' + z, t => (4 + 1.4 * t) / 100]), ...C9_ST.map(k => ['res_' + k, t => (10 + 5 * t) / 100]), ...Object.keys(C8_PREY).map(r => ['raceRed_' + r, t => (5 + 1.5 * t) / 100])],
  head:d => [['res_' + c9Res(d), t => (10 + 5 * t) / 100], ['castPct', t => (2 + t) / 100], ['matkPct', t => (1 + .6 * t) / 100], ['healPow', t => (3 + 1.5 * t) / 100], ['spPct', t => (2 + t) / 100],
    ...C9_ST.map(k => ['res_' + k, t => (10 + 5 * t) / 100]), ...ELEM.map(e => ['elemRes_' + e, t => (6 + 2 * t) / 100])],
  armor:d => [['elemRes_' + (d.elem || 'neutral'), t => (6 + 2 * t) / 100], ['hpPct', t => (1 + .6 * t) / 100], ['dmgRed', t => (1 + .4 * t) / 100],
    ...ELEM.map(e => ['elemRes_' + e, t => (6 + 2 * t) / 100]), ...Object.keys(C8_PREY).map(r => ['raceRed_' + r, t => (5 + 1.5 * t) / 100])],
  pants:d => [['res_' + c9Res(d, 1), t => (10 + 5 * t) / 100], ['raceRed_' + (d.race || 'brute'), t => (5 + 1.5 * t) / 100], ['def', t => 2 + 2 * t],
    ...C9_ST.map(k => ['res_' + k, t => (10 + 5 * t) / 100]), ...C9_SIZES.map(z => ['sizeRed_' + z, t => (4 + 1.4 * t) / 100]), ...Object.keys(C8_PREY).map(r => ['raceRed_' + r, t => (5 + 1.5 * t) / 100])],
  shoes:d => [['flee', t => 2 + 2 * t], ['movePct', t => (1 + .4 * t) / 100], ['res_slow', t => (10 + 5 * t) / 100], ['res_root', t => (10 + 5 * t) / 100], ['res_freeze', t => (10 + 5 * t) / 100],
    ...ELEM.map(e => ['elemRes_' + e, t => (6 + 2 * t) / 100]), ...C9_SIZES.map(z => ['sizeRed_' + z, t => (4 + 1.4 * t) / 100])],
  acc:d => [...C9_STATS.map(s => [s, t => 1 + Math.ceil(t / 2)]), ['crit', t => 1 + Math.ceil(t / 2)], ['hit', t => 2 + 2 * t], ['atkPct', t => (1 + .6 * t) / 100], ['matkPct', t => (1 + .6 * t) / 100],
    ...Object.keys(C8_PREY).map(r => ['race:' + r, t => (4 + 1.2 * t) / 100]), ...C9_SIZES.map(z => ['vsSize_' + z, t => (3 + 1.2 * t) / 100])]};
const C9_MINOR = {weapon:['atk', 'hit', 'crit', 'str', 'dex', 'int'], shield:['def', 'mdef', 'hp'], head:['int', 'sp', 'mdef', 'dex', 'luk', 'hit'], armor:['hp', 'vit', 'def', 'mdef', 'sp'],
  pants:['vit', 'hp', 'def', 'mdef', 'flee'], shoes:['agi', 'flee', 'hp', 'luk', 'dex'], acc:['luk', 'str', 'agi', 'int', 'dex', 'vit', 'hit']};
const C9_MINOR_V = {atk:t => 2 + 2 * t, hit:t => 2 + 2 * t, crit:t => 1 + Math.floor(t / 2), def:t => 1 + t, mdef:t => 1 + t, hp:t => 40 + 40 * t, sp:t => 10 + 10 * t, flee:t => 1 + t,
  str:t => 1 + Math.floor(t / 2), agi:t => 1 + Math.floor(t / 2), vit:t => 1 + Math.floor(t / 2), int:t => 1 + Math.floor(t / 2), dex:t => 1 + Math.floor(t / 2), luk:t => 1 + Math.floor(t / 2)};
const C9_CAP = {elem_:.12, vsElem_:.13, vsSize_:.12, race:.13, elemRes_:.16, raceRed_:.13, sizeRed_:.12, res_:.35, castPct:.07, matkPct:.04, atkPct:.04, healPow:.1, spPct:.07, hpPct:.04, dmgRed:.03, movePct:.03,
  def:12, flee:12, hit:12, crit:4, str:4, agi:4, vit:4, int:4, dex:4, luk:4, atk:12, mdef:8, hp:280, sp:80};
const c9Cap = (k, v) => { const c = C9_CAP[k] ?? C9_CAP[(k.match(/^[a-z]+_/i) || [''])[0]] ?? C9_CAP[k.split(':')[0]]; return c != null ? Math.min(v, c) : v; };
function c9Counter(e){ return {fire:'water', water:'fire', wind:'earth', earth:'wind', holy:'shadow', shadow:'holy', poison:'holy', neutral:'shadow'}[e] || 'neutral'; }
function c9Proc(d){ const k = c9Theme(d); return C9_PROC_OK.includes(k) ? k : 'bleed'; }
function c9Res(d, alt){ const k = c9Theme(d), list = C9_ST.filter(x => x !== 'stun'); const r = list.includes(k) ? k : 'poison'; return alt ? list[(list.indexOf(r) + 3) % list.length] : r; }
/* one ability into a bonus object */
function c9Put(b, key, v, t){
  if (key.startsWith('race:')){ const r = key.slice(5); b.race = {...(b.race || {}), [r]:c9P(c9Cap('race', v))}; return; }
  if (key.startsWith('proc:')){ b.proc = {k:key.slice(5), p:c9P(Math.min(.04, .02 + t * .004)), d:+(Math.min(2.6, 1.5 + t * .2)).toFixed(1)}; return; }
  const c = c9Cap(key, v); b[key] = C9_MINOR_V[key] || ['def', 'flee', 'hit', 'atk'].includes(key) ? Math.round(c) : c9P(c);   // stats are whole numbers
}
const c9Tier = lvl => Math.min(5, c8Tier(Math.max(1, Math.ceil((lvl || 1) / 25))));
/* rebuild every monster card */
const c9SortLv = cid => { const k = CARD_MOB[cid]; return (typeof CARD_LV_KEEP !== 'undefined' && CARD_LV_KEEP[k]) || MOB[k].lvl || 0; };
{ const used = new Set(), list = Object.keys(CARDS).filter(c => c !== 'c_boss' && CARD_MOB[c] && MOB[CARD_MOB[c]] && CARDS[c].slot && C9_PRIMARY[CARDS[c].slot])
    .sort((a, b) => (typeof SPECIES_LATE !== 'undefined' ? SPECIES_LATE.has(CARD_MOB[a]) - SPECIES_LATE.has(CARD_MOB[b]) : 0) || c9SortLv(a) - c9SortLv(b));   // (v294) newer species after the rest: older cards keep their abilities
  list.forEach((cid, i) => { const c = CARDS[cid], d = MOB[CARD_MOB[cid]], slot = c.slot, t = c9Tier(d.lvl), boss = !!(d.boss || c.boss), k = boss ? 1.3 : 1;
    const all = C9_PRIMARY[slot](d), own = C9_MINOR[slot], minors = own.concat(Object.keys(C9_MINOR_V).filter(x => !own.includes(x)));   // its place's small stats first, then any
    // spread the abilities: the monster's own themes first, taken in turn (card i starts at a different one), then the rest in turn
    const th = all.slice(0, Math.min(5, all.length)), rest = all.slice(th.length), rot = (a, n) => a.slice(n % (a.length || 1)).concat(a.slice(0, n % (a.length || 1)));
    const prims = rot(th, i).concat(rot(rest, i * 7));
    let pick = null;
    // a card is "the same" as another when it carries the same set of abilities: the set must be new
    for (const pool of [own, minors]) for (let a = 0; a < prims.length && !pick; a++) for (let m = 0; m < pool.length && !pick; m++){
      const mi = pool[(m + i) % pool.length], pk = prims[a][0], sig = slot + '|' + [pk, mi].sort().join('+');
      if (!used.has(sig) && pk !== mi){ used.add(sig); pick = [prims[a], mi]; } }
    if (!pick) pick = [prims[i % prims.length], minors[i % minors.length]];
    const b = {}; c9Put(b, pick[0][0], pick[0][1](t) * k, t); c9Put(b, pick[1], C9_MINOR_V[pick[1]](t), t);
    if (boss){ const p2 = prims.find(p => p[0] !== pick[0][0] && !used.has(slot + '|' + p[0] + '|boss')) || prims[(i + 1) % prims.length]; used.add(slot + '|' + p2[0] + '|boss'); c9Put(b, p2[0], p2[1](t) * k, t); b.all = 1; }
    c.bonus = b; c.kind = pick[0][0].split(/[_:]/)[0]; c.desc = [c9Text(b, false), c9Text(b, true)]; });
}
/* ---------- words ---------- */
function c9Text(b, en){ const out = [], pc = v => Math.round(v * 1000) / 10 + '%', E = e => (en ? ELEM_EN : ELEM_TH)[e] || e, Z = z => (en ? SIZE_EN : SIZE_TH)[z] || z, R = r => (en ? (typeof RACE_EN !== 'undefined' ? RACE_EN : {}) : RACE_TH)[r] || r, S2 = k => C9_ST_TX[k] ? C9_ST_TX[k][en ? 1 : 0] : k;
  for (const k in b){ const v = b[k];
    if (k === 'race') for (const r in v) out.push(en ? `vs ${R(r)} +${pc(v[r])}` : `ตีเผ่า${R(r)} +${pc(v[r])}`);
    else if (k === 'proc') out.push(en ? `${Math.round(v.p * 100)}% to inflict ${S2(v.k)} on hit` : `ตีแล้ว ${Math.round(v.p * 100)}% ติด${S2(v.k)}`);
    else if (k.startsWith('elem_')) out.push(en ? `${E(k.slice(5))} attacks +${pc(v)}` : `โจมตีธาตุ${E(k.slice(5))} +${pc(v)}`);
    else if (k.startsWith('vsElem_')) out.push(en ? `vs ${E(k.slice(7))} monsters +${pc(v)}` : `ตีมอนธาตุ${E(k.slice(7))} +${pc(v)}`);
    else if (k.startsWith('vsSize_')) out.push(en ? `vs ${Z(k.slice(7))} monsters +${pc(v)}` : `ตีมอนขนาด${Z(k.slice(7))} +${pc(v)}`);
    else if (k.startsWith('sizeRed_')) out.push(en ? `Damage from ${Z(k.slice(8))} monsters −${pc(v)}` : `รับดาเมจจากมอนขนาด${Z(k.slice(8))} −${pc(v)}`);
    else if (k.startsWith('elemRes_')) out.push(en ? `${E(k.slice(8))} damage taken −${pc(v)}` : `รับดาเมจธาตุ${E(k.slice(8))} −${pc(v)}`);
    else if (k.startsWith('raceRed_')) out.push(en ? `Damage from ${R(k.slice(8))} −${pc(v)}` : `รับดาเมจจากเผ่า${R(k.slice(8))} −${pc(v)}`);
    else if (k.startsWith('res_')) out.push(en ? `${pc(v)} to resist ${S2(k.slice(4))}` : `ต้าน${S2(k.slice(4))} ${pc(v)}`);
    else if (k === 'all') out.push(en ? `All Stats +${v}` : `ทุก Stat +${v}`);
    else if (C8_PCT[k]){ const n = C8_PCT[k]; out.push(`${Array.isArray(n) ? n[en ? 1 : 0] : n} +${pc(v)}`); }
    else { const n = C8_NM[k]; out.push(`${Array.isArray(n) ? n[en ? 1 : 0] : n || k} +${v}`); } }
  return out.join(', '); }
/* ---------- the new abilities at work (cards worn + gear worn) ---------- */
function c9Sum(key){ let v = typeof c8Sum === 'function' ? c8Sum(key) : 0;
  for (const id of Object.values((S && S.gear) || {})){ const it = id && ITEMS[id]; if (it && it.st && +it.st[key]) v += +it.st[key]; } return v; }
const C9_RES_MAX = .8;
{ const wrapDmg = f => function(m){ const r = f.apply(this, arguments); const d = m && m.def;
    if (r && r.dmg > 0 && d && !m.pvp){ const add = c9Sum('vsElem_' + (d.elem || 'neutral')) + c9Sum('vsSize_' + (d.size || 'm')); if (add > 0) r.dmg = Math.max(1, Math.round(r.dmg * (1 + Math.min(.5, add)))); }
    return r; };
  physDamage = wrapDmg(physDamage); magicDamage = wrapDmg(magicDamage); }
{ const _ma = mobAttack; mobAttack = function(m, mult = 1, noDodge){ if (m && m.def){ const red = Math.min(.35, c9Sum('sizeRed_' + (m.def.size || 'm'))); if (red > 0) mult *= 1 - red; } return _ma.call(this, m, mult, noDodge); }; }
if (typeof afflict === 'function'){ const _af = afflict; afflict = function(k){ const ch = Math.min(C9_RES_MAX, c9Sum('res_' + k));
    if (ch > 0 && Math.random() < ch){ if (T - (afflict._rt || -9) > .8){ afflict._rt = T; addText(P.x, P.y - 60, L(`ต้าน${(C9_ST_TX[k] || [k])[0]}!`, `Resisted ${(C9_ST_TX[k] || [k, k])[1]}!`), '#bfe8ff', 13); } return; }
    return _af.apply(this, arguments); }; }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'cards193', t:['การ์ด: ความสามารถไม่ซ้ำกัน', 'Cards: every one different'], b:() => L(
  '<p>การ์ดทุกใบมี 1 ความสามารถเด่นที่เข้ากับมอนเจ้าของการ์ด + 1 ค่าเล็ก ไม่มีสองใบที่เหมือนกัน · ค่าโตตามเลเวลมอนแต่มีเพดาน</p><p>ความสามารถ: โจมตีธาตุ · ตีมอนธาตุ · ตีมอนขนาด · ตีเผ่า · ติดสถานะ · ต้านธาตุ · ต้านเผ่า · ต้านขนาด · ต้านสถานะ · ค่าสถานะ</p><p>การ์ดบอส: ความสามารถเด่น 2 อย่าง แรงขึ้น 30% และทุก Stat +1</p>',
  '<p>Every card has one signature ability that fits its monster + one small stat; no two cards are the same · values grow with the monster\'s level up to a ceiling</p><p>Abilities: element attacks · vs element · vs size · race slayer · status strike · element ward · race ward · size ward · status resist · stats</p><p>Boss cards: two signature abilities, 30% stronger, All Stats +1</p>')});
/* gear with a status-strike option (proc_K): the same strike the cards give */
{ const _ad = applyDamage; applyDamage = function(m, res, sk){ const r = _ad.apply(this, arguments);
    try { if (m && !m.dead && !m.pvp && m.def && !m.def.boss && res && res.dmg > 0 && !res.pet && !res.poison && !res.dot && !P.dead && (m.c8T || 0) < T && typeof c8ProcMob === 'function')
      for (const k of ['poison', 'burn', 'bleed', 'slow', 'freeze', 'stun', 'blind', 'curse']){ const p = Math.min(.08, c9Sum('proc_' + k)); if (p > 0 && Math.random() < p){ m.c8T = T + .6; c8ProcMob(m, {k, p, d:2}); break; } } } catch (e) {}
    return r; }; }
