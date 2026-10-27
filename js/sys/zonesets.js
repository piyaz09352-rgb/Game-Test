/* VAYRATHEN — js/sys/zonesets.js — every land drops its own set (v29)
   Six lands on the world map, six sets: hunt in a land and its set drops there, so you know where to go for what.
   Each set comes in three grades that follow the land's levels (4 pieces: vest, circlet, greaves, boots), wearable by
   every class. Any monster of the land drops a piece of the grade that fits its level (0.6%); the land's bosses 25%.
     Fertile · Verdant      HP and healing, a little less damage taken
     Arid · Dune Wanderer   CRIT and critical damage
     Volcanic · Forgefire   ATK and MATK
     Frozen · Glacier       less damage taken, critical resistance
     Dark · Umbral          MATK and faster casting
     Light · Celestial      SP, healing, ATK and MATK */
'use strict';
const ZS_LANDS = {
  fertile:['พฤกษาอุดม', 'Verdant', [20, 45, 66], {hpPct:.06, healPow:.1}, {hpPct:.12, healPow:.2, dmgRed:.04}],
  arid:['เนินทรายพเนจร', 'Dune Wanderer', [80, 100, 120], {crit:4, atkPct:.04}, {crit:8, critDmg:.2, atkPct:.08}],
  volcanic:['อัคคีหลอมเหล็ก', 'Forgefire', [130, 145, 158], {atkPct:.06, matkPct:.06}, {atkPct:.12, matkPct:.12}],
  frozen:['ธารน้ำแข็ง', 'Glacier', [165, 195, 225], {dmgRed:.05, critRes:8}, {dmgRed:.1, critRes:15, hpPct:.06}],
  dark:['เงาราตรี', 'Umbral', [240, 265, 285], {matkPct:.06, castPct:.06}, {matkPct:.12, castPct:.12, crit:4}],
  light:['รัศมีสวรรค์', 'Celestial', [290, 296, 300], {spPct:.08, healPow:.12, matkPct:.04}, {spPct:.15, healPow:.25, atkPct:.08, matkPct:.08}]};
const ZS_GRADE = [['ขั้นต้น', 'I', .5], ['ขั้นกลาง', 'II', .75], ['ขั้นสูง', 'III', 1]];
for (const land in ZS_LANDS){ const [th, en, lvs, b2, b4] = ZS_LANDS[land], lth = LANDS[land][0], len = LANDS[land][1];
  lvs.forEach((lv, gi) => { const [gth, gen, k] = ZS_GRADE[gi], key = `z_${land}${gi + 1}`;
    CSET[key] = [`${th} ${gth}`, `${en} ${gen}`, g10Scale(b2, k), g10Scale(b4, k)];
    for (const [slot, sth, sen] of G10_SET_SLOTS){ const id = `cs_${key}_${slot === 'pants' ? 'legs' : slot}`, near = g10Near(slot, lv); if (!near) continue;
      const st = {}; for (const s in near[6]) st[s] = typeof near[6][s] === 'number' ? Math.round(near[6][s] * 1.1 * 100) / 100 : near[6][s];
      Object.assign(st, {cset:key}); delete st.line;
      ITEMS[id] = {name:`${sth}${th} ${gth}`, en:`${en} ${sen} ${gen}`, kind:'gear', slot, lv, st, buy:0, sell:Math.round(300 + lv * lv * 1.6), artAs:near[0], zone:land,
        desc:[`เซตประจำ${lth} · ดรอปจากมอนสเตอร์ใน${lth}`, `${len} set · dropped by monsters in the ${len}`]};
      if (SPR.GEAR_LOOK[near[0]]) SPR.GEAR_LOOK[id] = SPR.GEAR_LOOK[near[0]]; } }); }
const zsPiece = (land, lvl) => { const z = ZS_LANDS[land]; if (!z) return null; let gi = 0; z[2].forEach((lv, i) => { if (lv <= lvl + 6) gi = i; });
  const ids = G10_SET_SLOTS.map(([slot]) => `cs_z_${land}${gi + 1}_${slot === 'pants' ? 'legs' : slot}`).filter(id => ITEMS[id]); return ids.length ? ids[Math.floor(Math.random() * ids.length)] : null; };
EV.on('kill', m => { if (!m || !m.def || m.minion || m.dummy || !MAP_ID) return; const land = (MAPS[MAP_ID] || {}).land, boss = !!m.def.boss;
  if (!ZS_LANDS[land] || Math.random() >= (boss ? .25 : .006)) return;
  const b = zsPiece(land, m.def.lvl || 1); if (!b) return; const id = makeInst(b, Math.max(boss ? 1 : 0, rollRarity(boss ? 'boss' : 'mob')));
  dropLoot(id, m.x + rand(-14, 14), m.y + rand(-8, 8)); log(L(`ได้ชิ้นส่วนเซต${ZS_LANDS[land][0]}!`, `A ${ZS_LANDS[land][1]} set piece dropped!`), 'g'); });
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'zonesets', t:['เซตประจำดินแดน', 'Land sets'], b:() => `<p>${L('แต่ละดินแดนดรอปเซตของตัวเอง 3 ขั้นตามเลเวล (เสื้อ มาลา สนับ รองเท้า) ใส่ได้ทุกอาชีพ · มอนในดินแดนดรอป 0.6% บอส 25%', 'Each land drops its own set in 3 grades by level (vest, circlet, greaves, boots), for every class · monsters of the land 0.6%, its bosses 25%')}</p>
  <ul>${Object.keys(ZS_LANDS).map(k => `<li><b>${L(LANDS[k][0], LANDS[k][1])}</b> · ${L(ZS_LANDS[k][0], ZS_LANDS[k][1])} (Lv ${ZS_LANDS[k][2].join('/')}): 2 ${L('ชิ้น', 'pcs')} ${csetTxt(ZS_LANDS[k][3])} · 4 ${L('ชิ้น', 'pcs')} ${csetTxt(csetBonus('z_' + k + '3', 4))}</li>`).join('')}</ul>`});
