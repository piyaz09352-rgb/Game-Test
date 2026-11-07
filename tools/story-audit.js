/* VAYRATHEN — tools/story-audit.js — (v218) walks every map-story chapter and reports anything that could leave a
   player stuck: a glowing spot or the elite's spot that cannot be walked to from the story NPC, an NPC standing on
   no ground, an item goal whose monster rarely drops it, a hunt goal with too few of its monster on the map.
   Usage: CHROMIUM_PATH=/opt/pw-browsers/chromium node tools/story-audit.js   (writes docs/STORY_AUDIT.md) */
'use strict';
const fs = require('fs'), path = require('path');
const { openGame, enterWorld } = require('../tests/browser');
(async () => {
  const { page, errors, close } = await openGame({width:1366, height:768});
  try {
    await enterWorld(page);
    const rows = await page.evaluate(() => {
      const out = [];
      S.tut = {done:true, i:99}; S.lvl = 300;
      for (const arc of MS_ARCS) for (const map of arc.maps){
        const ch = MS_CH[map], issues = [];
        loadMap(map); for (let i = 0; i < 6; i++) advance(.05, false);
        const npc = NPCS.find(n => n.id === ch.npc.id) || NPCS.find(n => n.ms);
        if (!npc) issues.push('ไม่มี NPC บนแผนที่');
        const from = npc || {x:W / 2, y:H / 2};
        if (npc && !walkable(npc.x, npc.y, 10)) issues.push('NPC ยืนบนสิ่งกีดขวาง');
        const reach = p => !!findPath(from.x, from.y + 30, p.x, p.y);
        MS.spots.forEach((p, i) => { if (!reach(p)) issues.push(`จุดเรืองแสง ${i + 1} เดินไปไม่ถึง`); if (typeof waterAt === 'function' && waterAt(p.x, p.y, 4)) issues.push(`จุดเรืองแสง ${i + 1} อยู่ในน้ำ`); });
        if (MS.elite && !reach(MS.elite)) issues.push('จุดเกิดบอสเควสต์เดินไปไม่ถึง');
        let killInfo = '', itemInfo = '';
        for (const st of ch.steps){
          if (st.k === 'kill'){ let n = spawnSlots.filter(s => s.type === st.t).length; if (!n){ loadMap(map); n = spawnSlots.filter(s => s.type === st.t).length; } /* read again after a clean load */ killInfo = `${st.t} ×${n} ช่อง`; if (n < 4) issues.push(`มอน ${st.t} มีแค่ ${n} ช่องเกิด`); if (MOB[st.t].night) issues.push(`มอน ${st.t} ออกเฉพาะกลางคืน`); }
          if (st.k === 'item'){ const src = Object.keys(MOB).filter(k => (MOB[k].drops || []).some(d => d[0] === st.t)), here = src.filter(k => MAPS[map].mobs.includes(k));
            const rate = here.length ? Math.max(...here.map(k => MOB[k].drops.find(d => d[0] === st.t)[1])) : 0;
            itemInfo = `${st.t} ดรอป ${Math.round(rate * 100)}% (≈${rate ? Math.ceil(st.n / rate) : '∞'} ตัว)`;
            if (!rate) issues.push(`${st.t} ไม่มีมอนในแผนที่นี้ดรอป`); else if (st.n / rate > 40) issues.push(`${st.t} ต้องล่าราว ${Math.ceil(st.n / rate)} ตัว`); }
          if (st.k === 'elite' && !MAPS[map].mobs.includes(st.t)) issues.push(`บอสเควสต์ ${st.t} ไม่ใช่มอนของแผนที่นี้`);
        }
        out.push({arc:arc.id, map, name:MAPS[map].name, title:ch.title[0], killInfo, itemInfo, issues});
      }
      return out;
    });
    const bad = rows.filter(r => r.issues.length);
    const md = [`# ตรวจเนื้อเรื่องเสริมทุกบท (tools/story-audit.js)`, '', `ตรวจ ${rows.length} บท · มีปัญหา ${bad.length} บท`, '', '| สาย | แผนที่ | บท | ล่า | เก็บของ | ปัญหา |', '|---|---|---|---|---|---|',
      ...rows.map(r => `| ${r.arc} | ${r.map} ${r.name} | ${r.title} | ${r.killInfo} | ${r.itemInfo} | ${r.issues.join(' · ') || '—'} |`)].join('\n');
    fs.writeFileSync(path.join(__dirname, '..', 'docs', 'STORY_AUDIT.md'), md + '\n');
    console.log(`chapters ${rows.length} · with issues ${bad.length}`); for (const r of bad) console.log(`${r.arc} ${r.map} ${r.name}: ${r.issues.join(' · ')}`);
    if (errors.length) console.log('runtime errors:', errors.slice(0, 5));
  } finally { await close(); }
})();
