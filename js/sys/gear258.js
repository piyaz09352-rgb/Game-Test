/* VAYRATHEN — js/sys/gear258.js — (v258) every class line has its own weapon, and the gear tiers line up
   1. Pants, shoes and shields were made at Lv 130 · 170 · 210 · 250 · 280 while weapons, armour and headgear step at
      140 · 170 · 200 · 240 · 280: a hero of Lv 200–209 or 240–249 wore those three a whole tier behind. The 210 and 250
      pieces now need Lv 200 and 240 (130 stays: it is under 140 already).
   2. Four lines had no weapon of their own (the others get one about 8% above the open ones of its level):
      · ไสยเวท  ไม้เท้ากะโหลกคุณไสย — a rod (a shield fits); MATK, INT and Curse power (curses hit harder and their
                damage over time grows)
      · เจ้าเหมียว กรงเล็บแมวทอง — twin claws; AGI, CRIT and FLEE (not the boxer's heavy gloves)
      · เจ้าตูบ  ดาบปลอกคอเงิน — a one-handed sword; toughness only (HP, DEF, damage taken −, VIT), no more damage than
                an open sword: the dog line already climbs highest
      · นินจา   ดาวกระจายเงาจันทร์ — its own stars; MATK, DEX and CRIT
   3. Ninjas also get คุไน, a one-handed throwing knife (any ninja, every tier): a shield fits beside it and it has its
      own trait (weapons2.js: FLEE +8%, Perfect Dodge +3%).
   Prices follow the other class weapons; they drop like any piece and are sold at the market. */
'use strict';

/* ---------- 1. the gear tiers line up ---------- */
{ const MOVE = {210:200, 250:240};
  for (const g of GEAR_LIST){ if (!['pants', 'shoes', 'shield'].includes(g[1]) || !MOVE[g[4]]) continue;
    const lv = MOVE[g[4]]; g[4] = lv; for (const o of [GEAR[g[0]], ITEMS[g[0]]]) if (o) o.lv = lv; } }

/* ---------- 2–3. the new weapons ---------- */
{ const add = (id, th, en, lv, price, st) => { if (ITEMS[id]) return;
    GEAR_LIST.push([id, 'weapon', th, en, lv, price, st]);
    GEAR[id] = {id, slot:'weapon', name:th, en, lv, buy:price, st, pack:1};
    ITEMS[id] = {name:th, en, buy:price, sell:Math.round(price * .4), kind:'gear', slot:'weapon', lv, st, pack:1, wtype:st.wtype}; };
  WEAPON_TIERS.forEach(([lv, tth, ten], i) => {
    const c = (typeof WPN_CURVE === 'function' ? WPN_CURVE(lv) : 22 + lv * 1.25), cl = c * 1.08, P0 = Math.round((400 + lv * lv * 9) * 1.25);
    add(`w_hexrod${i}`, `ไม้เท้ากะโหลกคุณไสย${tth}`, `${ten} Hex Skull Rod`, lv, P0,
      {wtype:'staff', hands:'1h', line:'occult', watk:Math.round(cl * .45), wmatk:Math.round(cl * 1.2), curseAmp:+(.06 + i * .02).toFixed(2), int:i + 1});
    add(`w_catclaw${i}`, `กรงเล็บแมวทอง${tth}`, `${ten} Golden Cat Claws`, lv, P0,
      {wtype:'fist', hands:'2h', claw:1, line:'catfolk', watk:Math.round(cl), crit:6 + i, agi:i + 1, flee:4 + i * 2});
    add(`w_collar${i}`, `ดาบปลอกคอเงิน${tth}`, `${ten} Silver Collar Blade`, lv, P0,
      {wtype:'sword', hands:'1h', line:'dogfolk', watk:Math.round(c), hp:Math.round(40 + lv * 2.6), def:2 + i * 2, dmgRed:+(.02 + i * .004).toFixed(3), vit:i + 1});
    add(`w_moonstar${i}`, `ดาวกระจายเงาจันทร์${tth}`, `${ten} Moonshadow Stars`, lv, P0,
      {wtype:'shuriken', hands:'2h', line:'ninja', watk:Math.round(cl * .35), wmatk:Math.round(cl * 1.25), dex:i + 1, crit:3 + i});
    add(`w_kunai${i}`, `คุไน${tth}`, `${ten} Kunai`, lv, Math.round((400 + lv * lv * 9) * 1.05),
      {wtype:'shuriken', hands:'1h', watk:Math.round(c * .3), wmatk:Math.round(c * 1.05), ...(i >= 2 ? {dex:i, agi:Math.ceil(i / 2)} : {})});
  });
}

/* the hex rod's Curse power counts like the class lines' own (newlines2.js reads DER.pas.curseAmp) */
{ const _d = derive;
  derive = function(){ const r = _d.apply(this, arguments); if (!DER || !DER.pas || !S || !S.gear) return r;
    const it = S.gear.weapon && ITEMS[S.gear.weapon]; if (it && it.st && it.st.curseAmp && canWield(it)) DER.pas.curseAmp = (DER.pas.curseAmp || 0) + it.st.curseAmp;
    return r; }; }
{ const _gs = gearStatText;
  gearStatText = function(st){ const s = _gs.apply(this, arguments);
    return st && st.curseAmp ? `${s} · ${L(`ผลคำสาป +${Math.round(st.curseAmp * 100)}%`, `Curse power +${Math.round(st.curseAmp * 100)}%`)}` : s; }; }

/* a kunai leaves a hand free: a shield fits beside it */
if (typeof shieldOk === 'function'){ const _so = shieldOk;
  shieldOk = function(){ const it = typeof wornWeapon === 'function' ? wornWeapon() : null;
    if (it && it.st && it.st.wtype === 'shuriken' && it.st.hands === '1h') return true;
    return _so.apply(this, arguments); }; }
