/* VAYRATHEN — js/sys/newlines2.js — (v164) what the five new lines need around their skills
   · new statuses (ไสยเวท and friends): คำสาป curse (the foe takes more damage and loses MATK every second; sticks on
     bosses too), มืดบอด blind (it misses half its blows; bosses too), หวาดกลัว fear (it runs away; not bosses),
     หลงเสน่ห์ charm (it stops attacking; not bosses), คำสาปมรณะ doom (a delayed burst of MATK)
   · skill extras: a status on a melee, dash, line or bolt hit; life drain; skills that cost Bia (the merchant's coins)
   · axes for the merchant line (one-handed with a shield, or two-handed), drawn as real axes; only that line wields
     them, and it wields only axes
   · looks: cat ears and a tail for the cat folk, floppy ears, a curled tail and a shield for the dog folk, a mask and
     forehead band for the ninja, a dark robe and horns for the hexers, a cap and a money pouch for the merchants
   · starter kits for every new class, skill pictures, and effects for every new skill */
'use strict';

/* ======================= statuses ======================= */
const nlHas = (m, k) => m && m.st && m.st[k] > 0;
{ const _as = applyStatus;
  applyStatus = function(m, st, lv){
    if (!m || m.dead || !st) return _as.apply(this, arguments);
    const mine = ['curse', 'blind', 'fear', 'doom', 'charm'].filter(k => st[k]);
    if (!mine.length) return _as.apply(this, arguments);
    const s = m.st || (m.st = {}), boss = !!(m.def && m.def.boss), rest = {...st}; for (const k of mine) delete rest[k];
    const amp = 1 + ((DER && DER.pas && DER.pas.curseAmp) || 0);
    if (st.curse){ const [a, t, d] = st.curse; s.curse = Math.max(s.curse || 0, t); s.curseAmp = Math.max(s.curseAmp || 0, a * amp); s.curseDps = Math.max(s.curseDps || 0, (d || 0) * amp * DER.matk); s.curseT = s.curseT || 1;
      addText(m.x, m.y - MOB_H[m.type] - 16, L('ถูกสาป', 'Cursed'), '#c89aff', 12); }
    if (st.blind){ s.blind = Math.max(s.blind || 0, st.blind); addText(m.x, m.y - MOB_H[m.type] - 16, L('มืดบอด', 'Blind'), '#b8b8c8', 12); }
    if (st.doom){ s.doom = st.doom[0]; s.doomDmg = st.doom[1]; }
    if (!boss){
      if (st.fear){ s.fear = Math.max(s.fear || 0, st.fear); addText(m.x, m.y - MOB_H[m.type] - 16, L('หวาดกลัว', 'Feared'), '#e0c0ff', 12); }
      if (st.charm){ s.charm = Math.max(s.charm || 0, st.charm); m.aggro = false; addText(m.x, m.y - MOB_H[m.type] - 16, L('หลงเสน่ห์ ♥', 'Charmed ♥'), '#ff9ac8', 12); }
    } else if (st.fear || st.charm){ if (T - (m.immT || -9) > .8){ m.immT = T; addText(m.x, m.y - MOB_H[m.type] - 14, 'Immune', '#d8c8ff', 12); } }
    if (Object.keys(rest).length) return _as.call(this, m, rest, lv);
  }; }
{ const _us = updStatus;
  updStatus = function(m, dt){
    const s = m.st; let held = false;
    if (s){
      for (const k of ['curse', 'blind', 'fear', 'charm']) if (s[k] > 0){ s[k] -= dt; if (s[k] <= 0){ s[k] = 0; if (k === 'curse'){ s.curseAmp = 0; s.curseDps = 0; } } }
      if (s.curse > 0 && s.curseDps > 0){ s.curseT -= dt; if (s.curseT <= 0){ s.curseT = 1; applyDamage(m, {dmg:Math.max(1, Math.round(s.curseDps)), poison:true}); } }
      if (s.doom > 0){ s.doom -= dt; if (s.doom <= 0){ s.doom = 0; const r = magicDamage(m, s.doomDmg || 1, 'shadow'); applyDamage(m, r, SKILLS.doomcurse); VFX.play('darkStar', {x:m.x, y:m.y, r:50}); VFX.shake(3); } }
      if (s.fear > 0 && !m.dead && typeof P !== 'undefined'){   // runs away from you
        const d = Math.hypot(m.x - P.x, m.y - P.y) || 1, sp = (m.def.speed || 60) * .9 * dt;
        const nx = m.x + (m.x - P.x) / d * sp, ny = m.y + (m.y - P.y) / d * sp; if (typeof walkable !== 'function' || walkable(nx, ny, m.def.r)){ m.x = nx; m.y = ny; m.moved = true; }
        m.dir = SPR.dirFromVec(m.x - P.x, m.y - P.y); held = true; }
      if (s.charm > 0){ m.aggro = false; held = true; }
    }
    return _us.apply(this, arguments) || held;
  }; }
/* a cursed foe takes more of everything you deal */
HK.outMul.push((mult, elem, kind, m) => (m && m.st && m.st.curse > 0 && m.st.curseAmp ? mult * (1 + m.st.curseAmp) : mult));
/* a blind monster misses half its own blows (not the ones you cannot dodge anyway) */
{ const _ma = mobAttack;
  mobAttack = function(m, mult, noDodge){
    if (m && m.st && m.st.blind > 0 && !noDodge && Math.random() < .5){ m.lunge = .2; m.atkT = 0; addText(P.x, P.y - 48, 'Miss', '#9fd8ff'); return; }
    return _ma.apply(this, arguments); }; }

/* ======================= skill extras ======================= */
const NL_HITST = new Set(['melee', 'dash', 'line', 'bolt']);
HK.dmgAfter.push((m, res, sk) => {
  if (!sk || typeof sk !== 'object' || !sk.id || !NL_JOBS[sk.job] || !res || res.miss || !m) return;
  const lv = (S.skills && S.skills[sk.id]) || 1;
  if (sk.st && NL_HITST.has(sk.type)){ const k = sk.id + '|' + (m.id || 0); m._nlSt = m._nlSt || {}; if (!(T - (m._nlSt[k] || -9) < .5)){ m._nlSt[k] = T; applyStatus(m, sk.st(lv), lv); } }
  if (sk.drain && res.dmg > 0){ const h = Math.round(res.dmg * sk.drain); S.hp = Math.min(DER.maxhp, S.hp + h); addText(P.x, P.y - 52, `+${h}`, '#c4ffe0', 12); }
});
/* skills that cost money: paid when they go off, refused (with nothing spent) if you cannot pay */
{ const _fs = fireSkill;
  fireSkill = function(id, lv){ const sk = SKILLS[id];
    if (sk && sk.bia){ const c = sk.bia(lv); if ((S.bia || 0) < c){ toast(L(`เงินไม่พอ: ต้องใช้ ${c.toLocaleString()} เบี้ย`, `Not enough Bia: ${c.toLocaleString()} needed`)); return false; }
      const r = _fs.apply(this, arguments); if (r !== false){ S.bia -= c; addText(P.x, P.y - 60, `−${c.toLocaleString()} ${typeof CUR === 'function' ? CUR() : ''}`, '#ffe08a', 12); } return r; }
    return _fs.apply(this, arguments); }; }

/* ======================= axes ======================= */
const NL_AXE = id => /^w_g?axe\d+$/.test(id || '');
const nlAxeId = it => it && (NL_AXE(it.base) || NL_AXE(it.id) || (it.st && it.st.axe));
WEAPON_TIERS.forEach(([lv, tth, ten], i) => {
  const c = (typeof WPN_CURVE === 'function' ? WPN_CURVE(lv) : 22 + lv * 1.25), P0 = 400 + lv * lv * 9;
  const add = (id, th, en, st, price) => { if (ITEMS[id]) return; GEAR_LIST.push([id, 'weapon', th, en, lv, price, st]); GEAR[id] = {id, slot:'weapon', name:th, en, lv, buy:price, st, pack:1};
    ITEMS[id] = {name:th, en, buy:price, sell:Math.round(price * .4), kind:'gear', slot:'weapon', lv, st, pack:1, wtype:'sword'}; };
  add(`w_axe${i}`, `ขวาน${tth}`, `${ten} Hand Axe`, {wtype:'sword', hands:'1h', axe:1, watk:Math.round(c * 1.02), ...(i >= 2 ? {str:i, luk:Math.ceil(i / 2)} : {}), ...(i >= 4 ? {crit:i} : {})}, P0);
  add(`w_gaxe${i}`, `ขวานศึกสองมือ${tth}`, `${ten} War Axe`, {wtype:'sword', hands:'2h', axe:1, watk:Math.round(c * 1.26), ...(i >= 2 ? {str:i + 1, luk:Math.ceil(i / 2)} : {}), ...(i >= 4 ? {crit:i} : {})}, Math.round(P0 * 1.15));
});
/* the merchant line wields axes (and only axes); no other line does */
function wieldOk(it){
  if (!it || !it.st || it.st.wtype !== 'sword') return true;
  const merch = nlLine() === 'merchant', axe = !!(it.st.axe || NL_AXE(it.base));
  return merch ? axe : !axe;
}
/* axe pictures in the bag: a haft and a curved bit, tinted by tier */
{ const _art = itemArt;
  itemArt = function(id){ const b = (ITEMS[id] && ITEMS[id].base) || id, m = /^w_(g?)axe(\d+)$/.exec(b) || (/^k_(merchant|tradelord|tycoon)_w$/.test(b) ? ['', b === 'k_merchant_w' ? '' : 'g', b === 'k_tycoon_w' ? '8' : b === 'k_tradelord_w' ? '4' : '1'] : null);
    if (!m) return _art.apply(this, arguments);
    const t = +m[2], two = m[1] === 'g', metal = ['#b8bcc4', '#c8ccd4', '#e08a4a', '#5a5a6a', '#4ac0a0', '#f0c040', '#e86a3a', '#a0e0ff', '#ffd860', '#80e0a0', '#ffe080'][t] || '#c8ccd4', haft = t >= 5 ? '#8a4a1a' : '#a0703a';
    const bit = sd => `<path d="M${20 + sd * 2} 9 Q${20 + sd * 13} 10 ${20 + sd * 12} 19 Q${20 + sd * 8} 17 ${20 + sd * 2} 17Z" fill="${metal}" stroke="#2a1a10" stroke-width="1.2"/><path d="M${20 + sd * 11.5} 11 Q${20 + sd * 12.8} 15 ${20 + sd * 11.6} 18.6" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/>`;
    return `<svg viewBox="0 0 40 40"><rect x="2" y="2" width="36" height="36" rx="8" fill="#3a2a1a" opacity=".12"/><path d="M20 8 L20 35" stroke="${haft}" stroke-width="3" stroke-linecap="round"/><path d="M20 28 L20 34" stroke="#5a3a1a" stroke-width="3.4"/>${bit(1)}${two ? bit(-1) : `<path d="M18 12 L13 14 L18 15Z" fill="${metal}" stroke="#2a1a10" stroke-width="1"/>`}</svg>`; }; }

/* ======================= looks ======================= */
const NLM = SPR.M;
const nlTrim = (body, trim, mid) => n => (n[1] > .44 ? {m:NLM[trim]} : mid && n[2] > .5 && Math.abs(n[0]) < .05 && n[1] > -.4 ? {m:NLM[mid]} : undefined);
/* (v166) the cat and dog folk wear a เกาะอก (a cloth wrapped round the chest, a gold hem at the top) and a โจงกระเบน
   (a cloth wrapped into loose knee-length breeches), bare arms and calves, sandals, a few gold pieces (armlets, a
   necklace, a crown or shoulder flames for the high ranks) and no cape or skirt, so the tail shows. A hero wears it
   from the chest (heroines) or from mid-chest down like a waist wrap (heroes). */
const nlKemban = (cloth, trim, belt, hi) => n => (n[1] > hi ? {m:NLM.skin} : n[1] > hi - .1 ? {m:NLM[trim]} : n[1] < -.45 && n[1] > -.66 ? {m:NLM[belt]} : Math.sin(n[0] * 15 + n[1] * 8) > .88 ? {dt:1} : undefined);
const NL_WRAP = (cloth, trim, belt, kraben, extra) => ({top:cloth, sleeve:'skin', forearm:'skin', pants:kraben, baggy:true, sandals:trim, boots:'skin', bootCuff:null, belt, cape:null, skirt:null, armband:'gold',
  topTex:nlKemban(cloth, trim, belt, .12), topTexF:nlKemban(cloth, trim, belt, .36), ...extra});
const NL_LOOK = {
  occult:['rune', {name:'ไสยเวท', en:'Hexer', hair:'hairBlack', iris:'irisRd', top:'midnight', sleeve:'midnight', forearm:'charcoal', pants:'charcoal', boots:'charcoal', bootCuff:'plum', belt:'plum',
    hat:null, skirt:[11.6, 1.1, 6.4, 9.2, 'midnight', 'plum'], aura:'auraViolet', necklace:true, neckMat:'ivory', pendant:'gem', topTex:nlTrim('midnight', 'plum', 'ivory')}],
  shaman:['occult', {name:'จอมขมังเวท', en:'Dark Shaman', hair:'hairSilver', iris:'irisVi', cape:'plum', armband:'gold', hat:'headwrap', hatMat:'midnight'}],
  hexlord:['shaman', {name:'ราชันย์ไสยเวท', en:'Hex Sovereign', top:'charcoal', sleeve:'charcoal', cape:'midnight', capeTex:'gold', hat:'dragon', hatMat:'charcoal', crestMat:'plum', belt:'gold'}],
  merchant:['blade', {name:'พ่อค้า', en:'Merchant', axe:true, hair:'hairBrown', iris:'irisBr', top:'cream', sleeve:'cream', forearm:'skin', handWrap:'leather', pants:'brownCl', boots:'leather', bootCuff:'gold', belt:'leather',
    hat:'cap', capMat:'brownCl', pauldron:null, pouch:true, aura:'auraGold', topTex:nlTrim('cream', 'brownCl', 'gold')}],
  tradelord:['merchant', {name:'นายวาณิช', en:'Trade Master', twoHand:true, top:'teal', sleeve:'cream', belt:'gold', cape:'teal', capMat:'teal', armband:'gold', topTex:nlTrim('teal', 'gold', 'gold')}],
  tycoon:['tradelord', {name:'มหาเศรษฐีวาณิช', en:'Grand Tycoon', top:'sunset', sleeve:'ivory', cape:'scarlet', capeTex:'gold', hat:'crown', hatMat:'gold', crestMat:'gold', necklace:true, neckMat:'gold', pendant:'gold', aura:'auraGold'}],
  catfolk:['muay', {name:'เจ้าเหมียว', en:'Kitty Folk', hair:'hairOrange', iris:'irisGd', top:'sakura', sleeve:'cream', forearm:'skin', handWrap:'cream', pants:'cream', boots:'sakura', bootCuff:'white', belt:'gold',
    hat:null, earKind:'cat', earNoBand:true, earMat:'hairOrange', earIn:'sakura', tail:'hairOrange', tailUp:1.5, tailW:1.5, fistClaw:'steel', clawTier:0, necklace:true, neckMat:'scarlet', pendant:'gold', aura:'auraGold', topTex:nlTrim('sakura', 'white'), ...NL_WRAP('sakura', 'gold', 'gold', 'scarlet', {}), animal:'cat', faceFur:'hairOrange', muzzle:'white', faceStripes:'hairChestnut'}],
  lynx:['catfolk', {name:'แมวป่าจอมซน', en:'Wildcat Dancer', hair:'hairChestnut', earMat:'hairChestnut', tail:'tigerFur', top:'brownCl', sleeve:'skin', pants:'charcoal', boots:'charcoal', bootCuff:'tigerFur', belt:'tigerFur', fistClaw:'ember', clawTier:2, topTex:nlTrim('brownCl', 'tigerFur'), ...NL_WRAP('brownCl', 'gold', 'tigerFur', 'charcoal', {}), faceFur:'hairChestnut', faceStripes:'hairBrown'}],
  catqueen:['lynx', {name:'ราชินีวิเชียรมาศ', en:'Royal Siamese', hair:'hairWhite', iris:'irisBl', earMat:'charcoal', earIn:'sakura', tail:'charcoal', top:'ivory', sleeve:'ivory', pants:'ivory', boots:'navy', bootCuff:'gold', belt:'gold',
    cape:'navy', capeTex:'gold', hat:'crown', hatMat:'gold', crestMat:'gold', crestN:6, fistClaw:'sun', clawTier:5, topTex:nlTrim('ivory', 'gold', 'gold'), ...NL_WRAP('ivory', 'gold', 'gold', 'navy', {}), faceFur:'ivory', muzzle:'ivory', facePoint:'charcoal', faceStripes:null, whisker:'dark'}],
  dogfolk:['blade', {name:'เจ้าตูบ', en:'Puppy Guard', hair:'hairChestnut', iris:'irisBr', top:'sky', sleeve:'sky', forearm:'skin', handWrap:'leather', pants:'navy', boots:'leather', bootCuff:'white', belt:'leather',
    hat:null, pauldron:null, sideEar:'puppy', sideMat:'hairChestnut', sideIn:'sakura', tail:'hairChestnut', tailUp:2, tailW:1.7, necklace:true, neckMat:'scarlet', pendant:'gold', shield:['gold', 'sky', 'gold', .95, 'white'], aura:'auraWhite', topTex:nlTrim('sky', 'white'), ...NL_WRAP('sky', 'gold', 'leather', 'navy', {}), animal:'dog', faceFur:'hairChestnut', muzzle:'cream'}],
  houndknight:['dogfolk', {name:'อัศวินหมาเฝ้าวัง', en:'Hound Knight', top:'navy', sleeve:'navy', pauldron:'steel', cape:'sky', belt:'gold', shield:['steel', 'navy', 'gold', 1.05, 'gold'], topTex:nlTrim('navy', 'gold', 'steel'), ...NL_WRAP('navy', 'gold', 'gold', 'sky', {pauldron:'gold'})}],
  bangkaew:['houndknight', {name:'อัศวินบางแก้ว', en:'Bangkaew Paladin', hair:'hairWhite', sideMat:'hairChestnut', tail:'hairWhite', top:'ivory', sleeve:'ivory', pauldron:'gold', cape:'scarlet', capeTex:'gold',
    shield:['gold', 'ivory', 'gold', 1.12, 'scarlet'], aura:'auraGold', topTex:nlTrim('ivory', 'gold', 'gold'), ...NL_WRAP('ivory', 'gold', 'gold', 'scarlet', {pauldron:'gold'}), faceFur:'hairWhite', muzzle:'white'}],
  ninja:['rogue', {name:'นินจา', en:'Ninja', hair:'hairBlack', iris:'irisBr', top:'charcoal', sleeve:'charcoal', forearm:'charcoal', handWrap:'charcoal', pants:'charcoal', boots:'charcoal', bootCuff:'scarlet', belt:'scarlet',
    ninjaMask:'charcoal', hat:'band', bandMat:'steel', twin:false, weapon:'shuriken', shield:null, katana:false, aura:'auraWhite', topTex:nlTrim('charcoal', 'scarlet')}],
  shinobi:['ninja', {name:'นินจาเงา', en:'Shadow Shinobi', top:'midnight', sleeve:'midnight', pants:'midnight', bootCuff:'navy', belt:'navy', bandMat:'navy', cape:'scarlet', topTex:nlTrim('midnight', 'navy')}],
  kage:['shinobi', {name:'จอมนินจาคาเงะ', en:'Kage', top:'charcoal', sleeve:'charcoal', pants:'charcoal', belt:'gold', bandMat:'gold', cape:'charcoal', capeTex:'gold', hair:'hairCrimson', aura:'auraWhite', topTex:nlTrim('charcoal', 'gold', 'gold')}]
};
for (const [j, [b, o]] of Object.entries(NL_LOOK)){ const base = SPR.CHARS[b]; if (!base) continue; SPR.CHARS[j] = {...base, ...o};
  const acts = new Set(SPR.CHAR_ACTIONS[b] || SPR.CHAR_ACTIONS.novice || []); if (JOBS[j].caster) acts.add('cast');
  for (let k = j; k; k = JOBS[k].parent) for (const id of (JOBS[k].skills || [])) if (SKILLS[id] && SKILLS[id].act) acts.add(SKILLS[id].act);
  SPR.CHAR_ACTIONS[j] = [...acts]; }
/* worn gear keeps the line's own touches: the merchant's axe, the cat's claws, ears and tail in the hair colour */
{ const _hk = SPR.heroKey;
  SPR.heroKey = function(job, gear = {}){ const key = _hk.apply(this, arguments), cfg = SPR.CHARS[key]; const line = NL_LINE_OF[job];
    if (!cfg || !line || key === job) return key;
    const wid = gear && gear.weapon, wi = wid && ITEMS[wid], base = SPR.CHARS[job];
    if (line === 'merchant'){ cfg.axe = true; const m = /^w_(g?)axe(\d+)$/.exec((wi && (wi.base || wid)) || ''); if (m) cfg.wTier = Math.min(5, +m[2]);
      cfg.twoHand = wi && wi.st ? wi.st.hands === '2h' : !!base.twoHand; }
    if (line === 'catfolk' && !cfg.glove && !(wi && wi.st && wi.st.claw)){ cfg.fistClaw = base.fistClaw; cfg.clawTier = base.clawTier; }
    if (line === 'catfolk' && job !== 'catqueen'){ cfg.earMat = cfg.hair; if (job === 'catfolk') cfg.tail = cfg.hair; }
    if (base.ninjaMask) cfg.ninjaMask = base.ninjaMask;   // a look or a hat must not take the ninja's mask off
    if (line === 'catfolk' || line === 'dogfolk'){   // the wrap stays on whatever is worn, and the face follows the hair (Siamese and Bangkaew keep their own coat)
      for (const k of ['top', 'sleeve', 'forearm', 'pants', 'baggy', 'sandals', 'boots', 'bootCuff', 'belt', 'pauldron', 'armband']) if (!(k === 'top' && cfg.cosTop)) cfg[k] = base[k];
      cfg.cape = null; cfg.skirt = null; cfg.chest = null; cfg.topTex = cfg.lashes ? base.topTexF : base.topTex;
      if (job !== 'catqueen' && job !== 'bangkaew') cfg.faceFur = cfg.hair; }
    if (line === 'dogfolk'){ cfg.sideMat = job === 'bangkaew' ? base.sideMat : cfg.hair; if (job !== 'bangkaew') cfg.tail = cfg.hair; if (!gear.shield) cfg.shield = base.shield; }
    return key; }; }

/* ======================= starter kits ======================= */
const NL_KIT = {   // job: [weapon name, armour, head, charm, stat1, stat2, hands]
  occult:[['ไม้เท้ากะโหลกศิษย์', "Apprentice Hexer's Staff"], ['เสื้อคลุมศิษย์ไสย', "Apprentice Hexer's Robe"], ['ผ้าโพกศิษย์ไสย', 'Hexer Wrap'], ['ตะกรุดศิษย์ไสย', 'Hexer Takrut'], 'int', 'dex', '1h'],
  shaman:[['ไม้เท้าขมังเวทประจำตัว', "Shaman's Own Staff"], ['เสื้อคลุมขมังเวท', 'Shaman Robe'], ['ผ้าโพกขมังเวท', 'Shaman Wrap'], ['ตะกรุดขมังเวท', 'Shaman Takrut'], 'int', 'dex', '1h'],
  hexlord:[['คทาราชันย์ไสยเวท', 'Hex Sovereign Sceptre'], ['เสื้อคลุมราชันย์ไสย', 'Hex Sovereign Robe'], ['มงกุฎเขาอสูร', 'Demon-horn Crown'], ['ตราราชันย์ไสย', 'Hex Sovereign Seal'], 'int', 'dex', '2h'],
  merchant:[['ขวานศิษย์พ่อค้า', "Apprentice Merchant's Axe"], ['เสื้อกั๊กพ่อค้า', "Merchant's Vest"], ['หมวกพ่อค้า', "Merchant's Cap"], ['ลูกคิดนำโชค', 'Lucky Abacus'], 'str', 'luk', '1h'],
  tradelord:[['ขวานศึกวาณิชประจำตัว', "Trade Master's War Axe"], ['เสื้อวาณิช', 'Trade Master Coat'], ['หมวกวาณิช', 'Trade Master Hat'], ['ตราสมาคมพ่อค้า', 'Guild Seal'], 'str', 'luk', '2h'],
  tycoon:[['ขวานทองมหาเศรษฐี', "Tycoon's Golden Axe"], ['เสื้อมหาเศรษฐี', "Tycoon's Coat"], ['มงกุฎทองคำ', 'Golden Crown'], ['แหวนเศรษฐี', "Tycoon's Ring"], 'str', 'luk', '2h'],
  catfolk:[['กรงเล็บแมวน้อย', 'Kitten Claws'], ['เสื้อเหมียวน้อย', 'Kitty Top'], ['โบว์กระดิ่งแมว', 'Bell Ribbon'], ['กระดิ่งนำโชค', 'Lucky Bell'], 'agi', 'dex', '2h'],
  lynx:[['กรงเล็บแมวป่าประจำตัว', 'Wildcat Claws'], ['เสื้อแมวป่า', 'Wildcat Top'], ['ผ้าคาดแมวป่า', 'Wildcat Band'], ['เขี้ยวแมวป่า', 'Wildcat Fang'], 'agi', 'dex', '2h'],
  catqueen:[['กรงเล็บวิเชียรมาศ', 'Wichienmaat Claws'], ['ชุดราชินีแมว', 'Cat Queen Gown'], ['มงกุฎราชินีแมว', 'Cat Queen Crown'], ['กระดิ่งทองราชินี', 'Golden Royal Bell'], 'agi', 'luk', '2h'],
  dogfolk:[['ดาบเฝ้าบ้าน', 'Housewatch Sword'], ['เสื้อเจ้าตูบ', 'Puppy Tunic'], ['ผ้าพันคอเจ้าตูบ', 'Puppy Scarf'], ['ป้ายชื่อนำโชค', 'Lucky Name Tag'], 'vit', 'str', '1h'],
  houndknight:[['ดาบอัศวินเฝ้าวัง', 'Palace Hound Blade'], ['เกราะอัศวินหมา', 'Hound Knight Mail'], ['หมวกอัศวินหมา', 'Hound Knight Helm'], ['ปลอกคอเงิน', 'Silver Collar'], 'vit', 'str', '1h'],
  bangkaew:[['ดาบศักดิ์สิทธิ์บางแก้ว', 'Bangkaew Holy Blade'], ['เกราะบางแก้ว', 'Bangkaew Mail'], ['มงกุฎบางแก้ว', 'Bangkaew Crown'], ['ปลอกคอทองบางแก้ว', 'Golden Bangkaew Collar'], 'vit', 'str', '1h'],
  ninja:[['ดาวกระจายศิษย์นินจา', 'Apprentice Shuriken'], ['ชุดนินจา', 'Ninja Garb'], ['ผ้าคาดหน้าผากนินจา', 'Ninja Headband'], ['ม้วนคัมภีร์ลับ', 'Secret Scroll'], 'int', 'dex', '2h'],
  shinobi:[['ดาวกระจายเงา', 'Shadow Shuriken'], ['ชุดนินจาเงา', 'Shadow Shinobi Garb'], ['ผ้าคาดนินจาเงา', 'Shinobi Headband'], ['ม้วนคัมภีร์เงา', 'Shadow Scroll'], 'int', 'dex', '2h'],
  kage:[['ดาวกระจายคาเงะ', 'Kage Shuriken'], ['ชุดคาเงะ', 'Kage Garb'], ['หมวกคาเงะ', 'Kage Hat'], ['ตราคาเงะ', 'Kage Seal'], 'int', 'luk', '2h']
};
if (typeof KIT !== 'undefined') for (const [job, [wN, aN, hN, xN, s1, s2, hands]] of Object.entries(NL_KIT)){
  const J = JOBS[job], tier = J.tier, wt = J.weapon.type, caster = wt === 'staff', mag = caster || wt === 'shuriken', lv = tier >= 4 ? 150 : tier === 3 ? 40 : 1, ids = ['w', 'a', 'h', 'x'].map(s => `k_${job}_${s}`);
  const wst = {wtype:wt, hands, watk:J.weapon.atk + (tier >= 4 ? 25 : tier === 3 ? 6 : 4), [s1]:tier >= 4 ? 4 : tier === 3 ? 2 : 1, ...(mag ? {wmatk:(J.weapon.matk || 0) + (tier >= 4 ? 30 : 8)} : {}),
    ...(NL_LINE_OF[job] === 'merchant' ? {axe:1} : {}), ...(NL_LINE_OF[job] === 'catfolk' ? {claw:1} : {}), ...(wt === 'shuriken' ? {crit:tier >= 4 ? 6 : 2} : {})};
  const art = tier >= 4 ? ['a_vajra', 'h_vajra', 'x_vajra'] : tier === 3 ? (caster ? ['a_yantra', 'h_mongkhon', 'x_moon'] : ['a_padded', 'h_lotus', 'x_charm']) : (caster ? ['a_cotton', 'h_cloth', 'x_ring'] : ['a_buffalo', 'h_cloth', 'x_bead']);
  const wArt = NL_LINE_OF[job] === 'merchant' ? null : wt === 'staff' ? `w_${hands === '2h' ? 'lstaff' : 'staff'}${tier >= 4 ? 6 : tier === 3 ? 2 : 0}` : wt === 'shuriken' ? `w_shuriken${tier >= 4 ? 6 : tier === 3 ? 2 : 0}` : wt === 'fist' ? `w_claw${tier >= 4 ? 6 : tier === 3 ? 2 : 0}` : wt === 'dagger' ? (hands === '2h' ? 'w_tdagger6' : `w_dagger${tier === 3 ? 2 : 0}`) : `w_sword${tier >= 4 ? 6 : tier === 3 ? 2 : 0}`;
  const parts = [['weapon', wN, wst, wArt], ['armor', aN, tier >= 4 ? {def:42, mdef:10, hp:900, [s1]:3} : tier === 3 ? {def:18, mdef:3, hp:260} : {def:3, hp:15}, art[0]],
    ['head', hN, tier >= 4 ? {def:14, mdef:8, [s1]:4, [s2]:2} : tier === 3 ? {def:6, mdef:2, [s1]:2} : {def:1, hp:10}, art[1]], ['acc', xN, tier >= 4 ? {[s1]:6, [s2]:4, hpPct:.04} : tier === 3 ? {[s1]:3, [s2]:2, hpPct:.02} : {[s1]:1, hp:15}, art[2]]];
  parts.forEach(([slot, nmz, st, a], i) => { const id = ids[i]; if (ITEMS[id]) return;
    ITEMS[id] = {name:nmz[0], en:nmz[1], kind:'gear', slot, lv, st, buy:0, sell:lv * 6 + 20, starter:job, ...(a ? {artAs:a} : {}), desc:['อุปกรณ์เริ่มต้นประจำอาชีพ', 'Class starter equipment']};
    if (slot === 'weapon') ITEMS[id].wtype = wt; else if (SPR.GEAR_LOOK[a]) SPR.GEAR_LOOK[id] = SPR.GEAR_LOOK[a]; });
  KIT[job] = ids; }
EV.on('tick', () => { if (typeof PAUSED !== 'undefined' && PAUSED || !S || !S.lvl || S.kitNL === 1 || !NL_JOBS[S.job]) return; S.kitNL = 1; if (typeof kitGive === 'function' && !(S.kits && S.kits[S.job])) kitGive(S.job); });

/* ======================= skill pictures ======================= */
if (typeof SK_GLYPH !== 'undefined') Object.assign(SK_GLYPH, {
  darklore:'book', curse:'skull', voodoo:'mask', darkbolt:'orb', soulrend:'ghost', blindhex:'eye', fearspirit:'roar', spiritward:'seal',
  darkpact:'chain', plaguecurse:'smoke', lifedrain:'heart', ghostfire:'flame', grimreap:'scythe', nightmind:'moon', sleephex:'swirl', weakenhex:'anger',
  hexmastery:'crown', doomcurse:'skull', reaperform:'ghost', abyssgate:'gate', darkstar:'star', shadowlance:'arrowup', masshex:'vortex', soulcage:'net',
  axemastery:'axe', cleavestrike:'crack', axewhirl:'spiral', coinbash:'coin', coinvolley:'arrows3', haggle:'scroll', cartguard:'shield', merchantcry:'shout',
  bigaxe:'axe', axestorm:'tornado', goldrush:'coin', cartcrash:'dash', debtcollect:'hand', tradewind:'stream', appraisal:'eye', moneywall:'tower',
  tycoonaxe:'axe', goldenarc:'spiral', midasstrike:'hand', coinstorm:'rain', goldshower:'coin', grandmarket:'banner', goldbody:'shield', wealthaura:'crown',
  catreflex:'eye', scratch:'cuts', pounce:'paw', tailwhip:'swirl', meow:'heart', catnap:'moon', ninelives:'heartshield', purr:'stream',
  wildclaws:'fang', furyswipe:'cuts', moonpounce:'moon', catcyclone:'tornado', shadowpaw:'paw', cuteface:'heart', catwalk:'feather', luckycat:'coin',
  royalclaws:'crown', thousandscratch:'cuts', hunterinstinct:'eye', starpounce:'star', comettail:'comet', royalcharm:'heart', catblessing:'sparkle', ninthlife:'heartshield',
  loyalheart:'heart', guardbark:'roar', shieldwall:'shield', bite:'fang', tackle:'dash', howl:'shout', keennose:'eye', wagtail:'heal',
  guardianpaw:'paw', ironfur:'shield', crunch:'fang', houndrush:'chevron', fangspin:'spiral', packhowl:'banner', loyalvow:'hand', sniffout:'target',
  bangkaewblood:'heartshield', stalwart:'tower', kingfang:'crown', wolfstorm:'tornado', shieldcharge:'shieldbash', lunarhowl:'moon', packleader:'banner', guardianangel:'wings',
  shinobiway:'mask', quickslash:'arrows3', ninjadash:'net', katon:'flame', suiton:'drop', kunaithrow:'dart', smokescreen:'smoke', kawarimi:'back',
  bladeart:'star', iai:'spiral', fuuton:'wave', raiton:'bolt2', dragonflame:'flame', kagebunshin:'ghost', shurikenstorm:'star', poisonkunai:'drop',
  kagemastery:'crown', shadowflash:'rain', blinkstrike:'tornado', kirin:'bolt2', waterdragon:'waves', thousandshadows:'ghost', kunairain:'arrowdown', silentkill:'skull'
});

/* ======================= effects ======================= */
const NL_COL = {dark:['#e2d0ff', '#9a5cf0', '#3a1a6e'], gold:['#fff6c8', '#ffcf4a', '#b87a10'], pink:['#fff0f6', '#ff8ac0', '#c03a78'], claw:['#ffffff', '#ffd9a0', '#c08040'],
  bark:['#fff8e0', '#ffd27a', '#a86a20'], fire:['#fff4c2', '#ff8a1f', '#c7261a'], water:['#e6fbff', '#3fb8f0', '#1a4fa8'], wind:['#f2fff7', '#8ef0c0', '#2fa37a'], bolt:['#ffffff', '#fff36b', '#7a5cff'], steel:['#ffffff', '#c8d0dc', '#5a6070']};
function nlRingBurst(x, y, r, c, n = 14){ skfxRing(x, y, r, c[1], .45, 5); skfxRing(x, y, r * .7, c[0], .38, 3, .08); skfxGlow(x, y - 12, r * .5, c[1], .3, .6);
  skfxBurst(x, y, 10, n, {s0:40, s1:160, vz0:30, vz1:140, p:{g:-260, size:2, col:c[1], drag:1.5}}); }
function nlBeam(o, c, w = 10){ const len = o.len || 200; skfxAdd({x:o.x, y:o.y - 18, ux:o.ux, uy:o.uy, len, w, c, life:.42, add:true, draw(g, k){ const ww = this.w * (k < .15 ? k / .15 : 1 - (k - .15) / .85), ex = this.x + this.ux * this.len, ey = this.y + this.uy * this.len;
  g.lineCap = 'round'; g.globalAlpha = .5; g.strokeStyle = this.c[1]; g.lineWidth = ww * 2; g.beginPath(); g.moveTo(this.x, this.y); g.lineTo(ex, ey); g.stroke();
  g.globalAlpha = .9; g.strokeStyle = this.c[0]; g.lineWidth = ww * .45; g.beginPath(); g.moveTo(this.x, this.y); g.lineTo(ex, ey); g.stroke(); }}); }
function nlRain(o, c, kind){ const r = o.r || 90, n = (o.hits || 4) * 3;
  for (let i = 0; i < n; i++) later(i * .06, () => { const x = o.x + rand(-r * .8, r * .8), y = o.y + rand(-r * .4, r * .4);
    skfxAdd({x, y, c, kind, life:.35, add:kind !== 'coin', draw(g, k){ const z = (1 - k) * 90, X = this.x, Y = this.y - z;
      if (this.kind === 'coin'){ g.globalAlpha = 1 - k * .3; g.fillStyle = '#e8b830'; g.beginPath(); g.ellipse(X, Y, 3 + Math.abs(Math.sin(k * 20)) * 2, 4, 0, 0, 7); g.fill(); }
      else { g.globalAlpha = .9; g.strokeStyle = this.c[0]; g.lineWidth = 1.6; g.beginPath(); g.moveTo(X, Y - 10); g.lineTo(X, Y); g.stroke(); g.fillStyle = this.c[1]; g.beginPath(); g.arc(X, Y, 1.8, 0, 7); g.fill(); }
      if (k > .9) skfxRing(this.x, this.y, 10, this.c[1], .2, 2); }}); }); }
const NL_FX = {
  curseMark:o => { const m = o.m; if (!m) return; skfxGlyph(m.x, m.y, 26, NL_COL.dark[1], 1.1, -1.5); skfxGlow(m.x, m.y - MOB_H[m.type] * .5, 20, NL_COL.dark[1], .4, .6); },
  hexField:o => { skfxGlyph(o.x, o.y, o.r || 70, NL_COL.dark[1], (o.dur || 4) + .3); skfxScorch(o.x, o.y, o.r || 70, 'rgba(60,20,90,.7)', (o.dur || 4) + .5); skfxMotes(o.x, o.y, NL_COL.dark[1], 12, 50); },
  soulRend:o => { nlRingBurst(o.x, o.y, o.r || 70, NL_COL.dark, 18); VFX.shake(2); },
  hauntRing:o => { for (let i = 0; i < 3; i++) skfxRing(o.x, o.y, (o.r || 100) * (1 + i * .25), NL_COL.dark[i % 2], .55, 4, i * .12); skfxMotes(o.x, o.y, NL_COL.dark[0], 14, 60); },
  ghostFire:o => { const r = o.r || 100; for (let i = 0; i < 8; i++) later(i * .12, () => { const x = o.x + rand(-r * .7, r * .7), y = o.y + rand(-r * .35, r * .35); skfxGlow(x, y - 20, 18, '#7affd0', .5, .7); skfxMotes(x, y, '#9affe0', 5, 70); }); skfxRing(o.x, o.y, r, '#7affd0', .6, 3); },
  reaperLine:o => nlBeam(o, NL_COL.dark, 12),
  sleepMist:o => { skfxScorch(o.x, o.y, o.r || 85, 'rgba(180,170,255,.5)', 2); skfxMotes(o.x, o.y, '#d8d0ff', 16, 30); },
  darkAura:o => { skfxPillar(o.x, o.y, NL_COL.dark[1], .8, 24, 140); skfxGlyph(o.x, o.y, 40, NL_COL.dark[1], 1.2, -1); },
  abyssGate:o => { const r = o.r || 150; skfxGlyph(o.x, o.y, r, NL_COL.dark[1], 2.2, .6); skfxGlyph(o.x, o.y, r * .6, NL_COL.dark[0], 2.2, -1); skfxScorch(o.x, o.y, r, 'rgba(40,10,60,.8)', 3);
    for (let i = 0; i < 6; i++) later(.2 + i * .3, () => nlRingBurst(o.x + rand(-r * .5, r * .5), o.y + rand(-r * .25, r * .25), r * .4, NL_COL.dark, 10)); VFX.shake(5); },
  darkStar:o => { later(.2, () => { nlRingBurst(o.x, o.y, (o.r || 80) * 1.2, NL_COL.dark, 24); skfxCracks(o.x, o.y, o.r || 80); VFX.shake(4); }); },
  soulCage:o => { const r = o.r || 90; for (let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2; skfxPillar(o.x + Math.cos(a) * r * .8, o.y + Math.sin(a) * r * .4, NL_COL.dark[1], 1.2, 6, 60); } skfxGlyph(o.x, o.y, r, NL_COL.dark[1], 1.4); },
  hexHit:o => { skfxGlow(o.x, o.y, 18, NL_COL.dark[1], .25, .7); skfxBurst(o.x, o.y + 20, 20, 8, {s0:30, s1:100, p:{size:2, col:NL_COL.dark[0]}}); },
  coinBurst:o => { const x = o.tx ?? o.x, y = o.ty ?? o.y; later(.12, () => { skfxBurst(x, y, 20, 16, {s0:60, s1:180, vz0:80, vz1:200, p:{g:-500, size:2.6, col:'#ffcf4a', add:false}}); skfxRing(x, y, 40, NL_COL.gold[1], .35, 4); }); },
  coinHit:o => { skfxBurst(o.x, o.y + 16, 16, 6, {s0:30, s1:90, p:{g:-300, size:2, col:'#ffcf4a', add:false}}); },
  coinStorm:o => { nlRain(o, NL_COL.gold, 'coin'); skfxRing(o.x, o.y, o.r || 130, NL_COL.gold[1], .9, 3); },
  clawRake:o => { const m = o.m; if (!m) return; for (let i = 0; i < 3; i++) later(i * .07, () => skfxAdd({x:m.x, y:m.y - MOB_H[m.type] * .5, s:i, life:.24, add:true, draw(g, k){ const e = Math.min(1, k / .4), L0 = 26;
    g.save(); g.translate(this.x, this.y); g.rotate(this.s % 2 ? -.8 : .8); g.lineCap = 'round'; for (let j = -1; j <= 1; j++){ g.globalAlpha = .9 * (1 - k); g.strokeStyle = NL_COL.claw[j ? 1 : 0]; g.lineWidth = 2.4 * (1 - k) + .6; g.beginPath(); g.moveTo(j * 5, -L0 / 2); g.lineTo(j * 5 + 2, -L0 / 2 + L0 * e); g.stroke(); } g.restore(); }})); },
  clawRing:o => { skfxRing(o.x, o.y, o.r || 70, NL_COL.claw[1], .35, 5); skfxAdd({x:o.x, y:o.y, r:o.r || 70, life:.4, add:true, draw(g, k){ g.lineCap = 'round'; for (let i = 0; i < 4; i++){ const a0 = k * 8 + i * 1.57; g.globalAlpha = .8 * (1 - k); g.strokeStyle = NL_COL.claw[0]; g.lineWidth = 3 * (1 - k) + 1; g.beginPath(); g.ellipse(this.x, this.y - 14, this.r * .8, this.r * .4, 0, a0, a0 + .9); g.stroke(); } }}); },
  heartRing:o => { skfxRing(o.x, o.y, o.r || 100, NL_COL.pink[1], .6, 4); for (let i = 0; i < 10; i++) skfxPart({x:o.x + rand(-30, 30), y:o.y + rand(-8, 8), z:rand(10, 40), vz:rand(30, 60), vx:rand(-20, 20), life:rand(.8, 1.3), size:3.2, col:'#ff8ac0', shape:'plus'}); },
  pawLine:o => nlBeam(o, NL_COL.claw, 10),
  starPounce:o => { later(.15, () => { nlRingBurst(o.x, o.y, (o.r || 110) * 1.1, NL_COL.gold, 26); skfxCracks(o.x, o.y, o.r || 110); VFX.shake(4); }); },
  barkRing:o => { for (let i = 0; i < 3; i++) skfxRing(o.x, o.y, (o.r || 110) * (.6 + i * .25), NL_COL.bark[i % 2], .45, 5 - i, i * .08); VFX.shake(2); },
  biteSnap:o => { const m = o.m; if (!m) return; const x = m.x, y = m.y - MOB_H[m.type] * .5; skfxAdd({x, y, life:.25, add:true, draw(g, k){ const e = Math.min(1, k / .3), d = 10 * (1 - e);
    g.globalAlpha = .95 * (1 - k); g.fillStyle = '#ffffff'; for (const sd of [-1, 1]) for (let i = -2; i <= 2; i++){ g.beginPath(); g.moveTo(this.x + i * 5 - 2, this.y + sd * (d + 2)); g.lineTo(this.x + i * 5 + 2, this.y + sd * (d + 2)); g.lineTo(this.x + i * 5, this.y + sd * d - sd * 5); g.closePath(); g.fill(); } }}); },
  katon:o => { later(.1, () => { nlRingBurst(o.x, o.y, o.r || 60, NL_COL.fire, 18); skfxScorch(o.x, o.y, (o.r || 60) * .8, 'rgba(120,40,10,.7)'); }); VFX.play('fireHit', {x:o.x, y:o.y - 10}); },
  windBlade:o => nlBeam(o, NL_COL.wind, 8),
  fireLine:o => nlBeam(o, NL_COL.fire, 14),
  waterLine:o => nlBeam(o, NL_COL.water, 16),
  shurikenRain:o => nlRain(o, NL_COL.steel, 'steel'),
  kunaiRain:o => nlRain(o, NL_COL.steel, 'steel'),
  kirin:o => { for (let i = 0; i < 3; i++) later(.15 + i * .12, () => VFX.play('thunder', {x:o.x + rand(-30, 30), y:o.y + rand(-15, 15), r:(o.r || 140) * .5})); later(.3, () => { nlRingBurst(o.x, o.y, (o.r || 140), NL_COL.bolt, 26); VFX.shake(5); }); },
  slash:o => { const m = o.m; if (m) VFX.play('swingArc', {x:P.x, y:P.y, ang:Math.atan2(m.y - P.y, m.x - P.x), kind:'sword'}); }
};
{ const _pl = VFX.play; VFX.play = function(key, o){ const f = NL_FX[key]; if (f){ try { f(o || {}); } catch (e) {} return; } return _pl.apply(this, arguments); }; }

/* ---------- the wiki ---------- */
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'newlines', t:['อาชีพใหม่ 5 สาย', 'Five new class lines'], b:() => `<ul>${NL_LINES.map(l => { const c = jobChain(JOBS[l].next && JOBS[JOBS[l].next[0]].next ? JOBS[JOBS[l].next[0]].next[0] : l);
  return `<li><b>${c.filter(j => j !== 'novice').map(j => L(JOBS[j].name, JOBS[j].en)).join(' → ')}</b> · ${L(JOBS[l].weapon.name, JOBS[l].weapon.en)} · ${JOBS[l].stat} · ${['a', 'b', 'c'].map(s => L(SK8_PATH[l][s][0], SK8_PATH[l][s][1])).join(' / ')}</li>`; }).join('')}</ul>`});

/* (v166) the Shadow Shinobi's clone skill was named like an old Tiger Shade skill that skillfx2.js removes and refunds:
   it is now 'kagebunshin'; points and the hotbar slot of a ninja who learned it move over */
{ const _d = derive; derive = function(){
    if (S && S.skills && S.skills.shadowclone && typeof NL_LINE_OF !== 'undefined' && NL_LINE_OF[S.job] === 'ninja'){
      S.skills.kagebunshin = (S.skills.kagebunshin || 0) + S.skills.shadowclone; delete S.skills.shadowclone;
      if (Array.isArray(S.hot)) S.hot = S.hot.map(h => (h === 'shadowclone' ? 'kagebunshin' : h)); }
    return _d.apply(this, arguments); }; }
