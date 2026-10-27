/* VAYRATHEN — js/sys/styleopts.js — (v160) item options and boss pieces that lean the way your style plays
   The equation is ITEM + SKILL + STATS. The play styles (skills8.js) and the weapon traits (weapons2.js) now have
   random options to match, so a piece can be "for" one way of playing:
     ตีปกติแรงขึ้น   autoPct  basic attacks hit harder        (basic-attack styles)
     สกิลแรงขึ้น     skillPct skills and spells hit harder     (technique and burst styles)
     ลูกแก้วเวทแรงขึ้น orbPct  a caster's orb attacks           (orb casting)
     ฟื้นฟูแรงขึ้น   healPow  heals and shields                (support)
     รับดาเมจลดลง   dmgRed   damage taken                      (tank and endurance)
     ตีเร็วขึ้น      aspdPct  attack speed                       · ดาเมจคริ critDmg crit damage
     สัตว์อัญเชิญแรงขึ้น sumAtk · ร่ายเร็วขึ้น castPct
   The two kinds of damage option, autoPct and skillPct, never both come on one piece: an item picks a side.
   Boss-only pieces: eight families of accessory, one per kind of play, at Lv 80, 160 and 240 (24 in all). They are
   "special": only bosses drop them (drops2.js), the smith does not sell them, and each carries a strong fixed bonus
   for its style plus a smaller one beside it. */
'use strict';

/* ---------- the options ---------- */
const SO_KEYS = ['autoPct', 'skillPct', 'orbPct', 'aspdPct', 'critDmg'];
AFFIX.push(
  ['autoPct', [3, 0, 1, 2], L => .03 + Math.min(.05, L / 4000)],
  ['skillPct', [3, 0, 1, 2], L => .03 + Math.min(.05, L / 4000)],
  ['orbPct', [2, 0, 1, 2], L => .04 + Math.min(.06, L / 3500)],
  ['healPow', [2, 1, 1, 2], L => .03 + Math.min(.05, L / 4000)],
  ['dmgRed', [0, 3, 1, 1], L => .01 + Math.min(.025, L / 10000)],
  ['aspdPct', [2, 0, 0, 2], L => .02 + Math.min(.03, L / 6000)],
  ['critDmg', [2, 0, 0, 2], L => .04 + Math.min(.08, L / 3000)],
  ['sumAtk', [2, 0, 1, 2], L => .04 + Math.min(.06, L / 3500)],
  ['castPct', [1, 0, 2, 2], L => .02 + Math.min(.04, L / 5000)]);
/* options that are fractions but whose names do not end in "Pct": the old roller rounded them to whole numbers
   (a 5% damage cut became 100%) and the save cleaner rounded them to 0; both now keep them as fractions */
const SO_FRAC = new Set(['healPow', 'dmgRed', 'critDmg', 'sumAtk', 'castPct']);
const soFrac = (base, r, o) => o.map(x => { if (!SO_FRAC.has(x[0])) return x; const af = AFFIX.find(a => a[0] === x[0]), L0 = (base && base.lv) || 1;
  return [x[0], +Math.max(.005, af[2](L0) * (.75 + Math.random() * .5) * (1 + r * .25)).toFixed(3)]; });
{ const _sz = sanitizeInst;
  sanitizeInst = function(d){ const fr = d && Array.isArray(d.o) ? d.o.filter(x => Array.isArray(x) && SO_FRAC.has(x[0]) && typeof x[1] === 'number' && isFinite(x[1])) : [];
    const r = _sz.apply(this, arguments); if (!r || !fr.length) return r; const base = ITEMS[r.b];
    for (const [k, v] of fr){ const af = AFFIX.find(a => a[0] === k), cap = af ? af[2]((base && base.lv) || 1) * 2.3 : 0, i = r.o.findIndex(x => x[0] === k), val = +clamp(v, 0, cap).toFixed(3);
      if (i >= 0) r.o[i] = [k, val]; else if (r.o.length < 4) r.o.push([k, val]); }
    r.st = instStats(base, r.r, r.o); return r; }; }
/* a piece takes one side: basic attacks or skills */
{ const _ro = rollOpts;
  rollOpts = function(base, r){ let o = _ro.apply(this, arguments);
    for (let n = 0; n < 6 && o.some(x => x[0] === 'autoPct') && o.some(x => x[0] === 'skillPct'); n++) o = _ro.apply(this, arguments);
    return soFrac(base, r, o); }; }
/* worn options count */
{ const _dv = derive;
  derive = function(){ const r = _dv.apply(this, arguments); if (!DER || !DER.pas || !S || !S.gear) return r;
    const add = {}; for (const sl in S.gear){ const it = S.gear[sl] && ITEMS[S.gear[sl]]; if (!it || !it.st) continue; for (const k of SO_KEYS) if (it.st[k]) add[k] = (add[k] || 0) + it.st[k]; }
    for (const k of SO_KEYS) if (add[k]) DER.pas[k] = (DER.pas[k] || 0) + add[k];
    if (add.critDmg) DER.critDmg += add.critDmg;
    if (add.aspdPct){ DER.aspd = Math.min(ASPD_CAP, Math.round(DER.aspd + (200 - DER.aspd) * add.aspdPct * .5)); DER.interval = aspdIv(DER.aspd); }
    return r; }; }
/* skillPct: every hit that is not a basic attack (AUTO.t marks the basic attack window, rogueline.js) */
HK.outMul.push((mult, elem, kind) => ((kind === 'phys' || kind === 'magic') && DER && DER.pas && DER.pas.skillPct && !(typeof AUTO !== 'undefined' && T - AUTO.t < .3) ? mult * (1 + DER.pas.skillPct) : mult));
/* the card says it */
{ const _gs = gearStatText;
  gearStatText = function(st){ let s = _gs.apply(this, arguments); if (!st) return s; const out = [];
    if (st.autoPct) out.push(L(`ตีปกติแรงขึ้น ${Math.round(st.autoPct * 100)}%`, `Basic attacks +${Math.round(st.autoPct * 100)}%`));
    if (st.skillPct) out.push(L(`สกิลแรงขึ้น ${Math.round(st.skillPct * 100)}%`, `Skills +${Math.round(st.skillPct * 100)}%`));
    if (st.orbPct) out.push(L(`ลูกแก้วเวทแรงขึ้น ${Math.round(st.orbPct * 100)}%`, `Orb attacks +${Math.round(st.orbPct * 100)}%`));
    if (st.aspdPct) out.push(L(`ตีเร็วขึ้น ${Math.round(st.aspdPct * 100)}%`, `Attack speed +${Math.round(st.aspdPct * 100)}%`));
    if (st.critDmg) out.push(L(`ดาเมจคริ +${Math.round(st.critDmg * 100)}%`, `Crit damage +${Math.round(st.critDmg * 100)}%`));
    if (!out.length) return s;
    const i = s.indexOf(` · ${L('ลักษณะเฉพาะ', 'Trait')}:`);   // keep the weapon trait last
    return i >= 0 ? `${s.slice(0, i)} · ${out.join(' · ')}${s.slice(i)}` : (s ? `${s} · ${out.join(' · ')}` : out.join(' · ')); }; }

/* ---------- boss-only style accessories ---------- */
const SO_FAM = [
  ['so_auto', 'แหวนพันศึก', 'Ring of a Thousand Battles', {autoPct:.1, aspdPct:.04}, 'auto'],
  ['so_skill', 'กำไลกระบวนท่า', 'Bangle of Techniques', {skillPct:.1, castPct:.04}, 'skill'],
  ['so_orb', 'ลูกแก้วโหราจารย์', "Astrologer's Orb Charm", {orbPct:.15, matkPct:.04}, 'orb'],
  ['so_heal', 'พระเครื่องเมตตา', 'Amulet of Mercy', {healPow:.12, spPct:.05}, 'heal'],
  ['so_guard', 'ประคำกำแพงเพชร', 'Diamond Wall Prayer Beads', {dmgRed:.05, hpPct:.06}, 'guard'],
  ['so_crit', 'เขี้ยวเสือสมิง', 'Saming Tiger Fang', {critDmg:.2, crit:4}, 'crit'],
  ['so_summon', 'ตะกรุดหิมพานต์', 'Himmapan Takrut', {sumAtk:.15, matkPct:.03}, 'summon'],
  ['so_venom', 'ลูกปัดพิษนาคา', 'Naga Venom Beads', {autoPct:.06, critDmg:.1, agi:4}, 'venom']];
const SO_TIER = [[80, 'ขั้นต้น', 'Lesser', 1], [160, 'ขั้นกลาง', 'Greater', 1.6], [240, 'ขั้นสูง', 'Grand', 2.2]];
const SO_IDS = [];
for (const [id0, th, en, st0, kind] of SO_FAM) SO_TIER.forEach(([lv, tth, ten, k], i) => {
  const id = `${id0}${i}`, st = {special:1, sostyle:kind};
  for (const [a, v] of Object.entries(st0)) st[a] = Number.isInteger(v) ? Math.round(v * k) : +(v * k).toFixed(3);
  const price = Math.round(40000 * k * k);
  GEAR_LIST.push([id, 'acc', `${th}${tth}`, `${ten} ${en}`, lv, price, st]);
  GEAR[id] = {id, slot:'acc', name:`${th}${tth}`, en:`${ten} ${en}`, lv, buy:price, st, pack:1};
  ITEMS[id] = {name:`${th}${tth}`, en:`${ten} ${en}`, buy:price, sell:Math.round(price * .4), kind:'gear', slot:'acc', lv, st};
  SO_IDS.push(id); });
/* their pictures: a ring, a bangle, an orb, an amulet, beads, a fang, a takrut, beads */
if (typeof iaPick === 'function'){ const _pick = iaPick;
  const COL = {auto:['#ffe6a0', '#e0902a', '#7a3a08'], skill:['#ffd0c0', '#e2574c', '#6a1410'], orb:['#d8f0ff', '#3aa8d8', '#0a3a60'], heal:['#e0ffe8', '#3aa86a', '#0c4a24'],
    guard:['#e0ecff', '#4a8ad8', '#14306a'], crit:['#fff4d0', '#d8a02a', '#5a3a08'], summon:['#f0e0ff', '#a06ad8', '#3a1468'], venom:['#e8ffd0', '#6ac83a', '#24500c']};
  iaPick = function(id){ const fam = /^so_([a-z]+)\d$/.exec(id || ''); if (!fam || !COL[fam[1]]) return _pick.apply(this, arguments);
    const p = 'ia' + id.replace(/\W/g, '') + '§', c = COL[fam[1]], g = (n, cs) => lg(p + n, cs, 0, 0, 1, 1);
    const art = {
      auto:`<circle cx="20" cy="22" r="10" fill="none" stroke="url(#${p}a)" stroke-width="4.5" ${OL}/><path d="M14 11l6-6 6 6-6 4z" fill="url(#${p}a)" ${OL}/>`,
      skill:`<ellipse cx="20" cy="21" rx="13" ry="8" fill="none" stroke="url(#${p}a)" stroke-width="5" ${OL}/><circle cx="20" cy="13" r="3.4" fill="#fff" ${OL}/>`,
      orb:`<circle cx="20" cy="20" r="11" fill="url(#${p}a)" ${OL}/><path d="M14 16a7 7 0 0 1 6-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M12 33h16" stroke="#7a5a20" stroke-width="3" ${OL}/>`,
      heal:`<path d="M20 6l11 6v10c0 7-5 11-11 13-6-2-11-6-11-13V12z" fill="url(#${p}a)" ${OL}/><path d="M20 13v12M14 19h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
      guard:`${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i / 8 * 6.283; return `<circle cx="${(20 + Math.cos(a) * 10).toFixed(1)}" cy="${(20 + Math.sin(a) * 10).toFixed(1)}" r="3.6" fill="url(#${p}a)" ${OL}/>`; }).join('')}`,
      crit:`<path d="M13 6c6 4 12 14 9 28-4-8-10-16-9-28z" fill="url(#${p}a)" ${OL}/><path d="M24 8l4 3" stroke="#7a5a20" stroke-width="2"/>`,
      summon:`<rect x="10" y="12" width="20" height="16" rx="8" fill="url(#${p}a)" ${OL}/><path d="M13 16h14M13 20h14M13 24h14" stroke="#fff" stroke-width="1.2" opacity=".8"/>`,
      venom:`${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${8 + i * 4.8}" cy="${20 + Math.sin(i) * 6}" r="3.4" fill="url(#${p}a)" ${OL}/>`).join('')}`
    }[fam[1]];
    return {p, frame:3, glow:c[1], art:[g('a', c), art]}; }; }
/* the smith never sells them */
{ const _f = WIN_RENDER.forge;
  WIN_RENDER.forge = function(){ const r = _f.apply(this, arguments); const pane = el('pane-forge'); if (pane) pane.querySelectorAll('[data-fgbuy]').forEach(b => { if (SO_IDS.includes(b.dataset.fgbuy)) { const row = b.closest('.srow'); if (row) row.remove(); } }); return r; }; }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'styleopts', t:['ออปชั่นตามสายการเล่น', 'Options for each play style'], b:() => `<p>${L('ออปชั่นสุ่มที่เสริมสาย: ตีปกติแรงขึ้น · สกิลแรงขึ้น · ลูกแก้วเวทแรงขึ้น · ฟื้นฟูแรงขึ้น · รับดาเมจลดลง · ตีเร็วขึ้น · ดาเมจคริ · สัตว์อัญเชิญแรงขึ้น · ร่ายเร็วขึ้น · ชิ้นเดียวไม่มีทั้ง "ตีปกติ" และ "สกิล" พร้อมกัน', 'Options that lean to a style: basic attacks · skills · orb attacks · healing · damage taken · attack speed · crit damage · summons · cast speed · a piece never has both "basic attacks" and "skills"')}</p>
  <p>${L('เครื่องประดับประจำสาย 8 ตระกูล (Lv 80 · 160 · 240) ดรอปจากบอสเท่านั้น', 'Eight families of style accessories (Lv 80 · 160 · 240) drop from bosses only')}: ${SO_FAM.map(f => L(f[1], f[2])).join(' · ')}</p>`});
