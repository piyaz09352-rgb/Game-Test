/* VAYRATHEN — js/sys/w4test.js — a test bench for the six regions of data/world4.js
   Off unless the page is opened with #test (or window.W4TEST is set). Once you are in the world, a small panel
   offers: warp to each new region (your level is raised to the region's own so the monsters fight fairly), an
   invincible toggle, call the region's boss, line up one of every species, and a self-test that loads every new
   region and draws every new monster in every direction and pose, then lists what passed and what failed. */
'use strict';

const W4T = {on:false, god:false, el:null};

function w4tMaps(){ return MAPS.filter(m => m.w4); }
function w4tWarp(id){
  const mp = MAPS[id]; S.lvl = Math.max(S.lvl, mp.lv[0]); derive(); S.hp = DER.maxhp; S.sp = DER.maxsp;
  loadMap(id); P.x = VSPAWN.x; P.y = VSPAWN.y; w4tLog(`→ ${mp.name} · Lv ${mp.lv[0]}–${mp.lv[1]} (เลเวลตัวละครตอนนี้ ${S.lvl})`);
}
function w4tBoss(){
  const mp = MAPS[MAP_ID]; if (!mp || !mp.w4){ w4tLog('ไปแผนที่ใหม่ก่อน แล้วค่อยเรียกบอส'); return; }
  const m = spawnMob(mp.boss, P.x + 160, P.y); m.hx = m.x; m.hy = m.y; w4tLog(`เรียกบอส ${MOB[mp.boss].name} Lv ${MOB[mp.boss].lvl}`);
}
function w4tLineup(){
  const mp = MAPS[MAP_ID]; if (!mp || !mp.w4){ w4tLog('ไปแผนที่ใหม่ก่อน แล้วค่อยเรียกมอน'); return; }
  mp.mobs.forEach((k, i) => { const a = i / mp.mobs.length * Math.PI * 2, m = spawnMob(k, P.x + Math.cos(a) * 150, P.y + Math.sin(a) * 100); m.hx = m.x; m.hy = m.y; });
  w4tLog(`เรียกมอน ${mp.mobs.length} ชนิดของ${mp.name}มารอบตัว`);
}

/* the self-test: data first (cheap), then every new monster drawn in 5 directions × 4 poses */
async function w4tSelfTest(){
  const out = [], ok = (pass, what) => out.push([pass, what]), ids = new Set();
  const maps = w4tMaps();
  ok(maps.length === 6, `แผนที่ใหม่ครบ 6 แผนที่ (พบ ${maps.length})`);
  for (const mp of maps){
    const bad = [];
    for (const k of [...mp.mobs, mp.boss]){ ids.add(k); const m = MOB[k];
      if (!m) { bad.push(`${k} ไม่มีข้อมูล`); continue; }
      if (!(m.hp > 0 && m.lvl >= mp.lv[0] - 1)) bad.push(`${m.name} เลือด/เลเวลผิด`);
      if (!CARDS[m.card]) bad.push(`${m.name} ไม่มีการ์ด`);
      if (!MOB_LORE[k]) bad.push(`${m.name} ไม่มีตำนาน`); }
    for (const [d, to] of Object.entries(mp.links || {})) if (!Object.values(MAPS[to].links || {}).includes(mp.id)) bad.push(`ประตู ${d} ไป ${MAPS[to].name} กลับไม่ได้`);
    if (!BIOME[mp.biome]) bad.push(`ไม่มีฉาก ${mp.biome}`);
    if (typeof MAP_BGM !== 'undefined' && !MAP_BGM[mp.id]) bad.push('ไม่มีเพลง');
    ok(!bad.length, `${mp.name}: มอน ${mp.mobs.length} + บอส · ประตู · ฉาก · เพลง${bad.length ? ' — ' + bad.join(', ') : ''}`);
  }
  // load each region (ground, props, spawns) and catch anything that throws
  const home = MAP_ID;
  for (const mp of maps){ try { loadMap(mp.id); ok(typeof spawnSlots === "undefined" || spawnSlots.length > 0, `โหลด${mp.name}ได้ (จุดเกิดมอน ${typeof spawnSlots === "undefined" ? "?" : spawnSlots.length} จุด)`); } catch (e){ ok(false, `โหลด${mp.name}ไม่ได้: ${e.message}`); } await new Promise(r => setTimeout(r, 30)); }
  try { loadMap(home); } catch (e) {}
  // draw every new monster: 5 directions (the other 3 are mirrors) × idle, walk, attack, hurt
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');
  let frames = 0; const fail = [];
  for (const k of ids){ try { const sh = SHEETS[k] || (SHEETS[k] = SPR.sheet('mob', k));
      for (const d of [0, 1, 2, 3, 4]) for (const a of ['idle', 'walk', 'attack', 'hurt']){ SPR.tick && SPR.tick(); SPR.draw(g, sh, a, d, 0, 32, 60, {lazy:false, frame:a === 'attack' ? 2 : 0}); frames++; }
    } catch (e){ fail.push(`${MOB[k] ? MOB[k].name : k}: ${e.message}`); }
    await new Promise(r => setTimeout(r, 0)); }
  ok(!fail.length, `วาดมอนใหม่ ${ids.size} ตัว ${frames} ภาพ${fail.length ? ' — พัง: ' + fail.join(', ') : ' ไม่มีภาพพัง'}`);
  // the owner's rules for the new monsters: no tall pointed hats, no capes
  const looks = [...SPECIES, ...BOSSES].filter(r => ids.has(r[0])), rule = looks.filter(r => ['lomphok', 'wizard'].includes(r[5].hat) || r[5].cape).map(r => r[1]);
  ok(!rule.length, `มอนใหม่ไม่มีหมวกแหลมและไม่มีผ้าคลุม${rule.length ? ' — พบ: ' + rule.join(', ') : ''}`);
  return out;
}

function w4tLog(t){ const l = W4T.el && W4T.el.querySelector('.w4t-log'); if (l){ const p = document.createElement('div'); p.textContent = t; l.prepend(p); while (l.children.length > 40) l.lastChild.remove(); } }
function w4tPanel(){
  const el = document.createElement('div'); el.className = 'w4t'; W4T.el = el;
  el.innerHTML = `<div class="w4t-hd"><b>โหมดทดสอบ v151</b><button data-w4="min" title="ย่อ/ขยาย">–</button></div>
    <div class="w4t-bd"><div class="w4t-sec">ไปแผนที่ใหม่</div><div class="w4t-maps">${w4tMaps().map(m => `<button data-w4="go" data-id="${m.id}">${m.name}<small>Lv ${m.lv[0]}–${m.lv[1]}</small></button>`).join('')}</div>
    <div class="w4t-row"><label><input type="checkbox" id="w4tGod"> อมตะ</label><button data-w4="boss">เรียกบอส</button><button data-w4="line">เรียกมอนทุกชนิด</button></div>
    <button class="w4t-run" data-w4="test">▶ รันทดสอบอัตโนมัติ</button><div class="w4t-res"></div><div class="w4t-log"></div></div>`;
  const css = document.createElement('style');
  css.textContent = `.w4t{position:fixed;right:calc(8px + env(safe-area-inset-right,0px));top:calc(70px + env(safe-area-inset-top,0px));z-index:9000;width:260px;max-height:70vh;overflow:auto;background:rgba(28,22,16,.92);color:#f4ead2;border:1px solid #c8a050;border-radius:8px;font:12px/1.4 Sarabun,system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.4)}
    .w4t-hd{display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:#5a3a1a;border-radius:8px 8px 0 0}.w4t-hd button{background:none;border:0;color:#f4ead2;font-size:16px;cursor:pointer}
    .w4t-bd{display:grid;gap:6px;padding:8px}.w4t-sec{color:#e3b04b;font-weight:700}.w4t-maps{display:grid;grid-template-columns:1fr 1fr;gap:4px}
    .w4t button{font:inherit;cursor:pointer}.w4t-maps button,.w4t-row button,.w4t-run{background:#3a2a1a;color:#f4ead2;border:1px solid #8a6a3a;border-radius:5px;padding:4px}.w4t-maps small{display:block;opacity:.7}
    .w4t-maps button:hover,.w4t-row button:hover,.w4t-run:hover{background:#5a3a1a}.w4t button:focus-visible{outline:2px solid #e3b04b}
    .w4t-row{display:flex;gap:4px;flex-wrap:wrap;align-items:center}.w4t-run{background:#2a5a2a;border-color:#5aa84a;font-weight:700}
    .w4t-res div{padding:2px 0;border-bottom:1px solid rgba(255,255,255,.08)}.w4t-res .p{color:#9ae07a}.w4t-res .f{color:#ff8a6a}.w4t-log{opacity:.75;font-size:11px}.w4t.min .w4t-bd{display:none}`;
  document.head.appendChild(css); document.body.appendChild(el);
  el.addEventListener('click', async e => { const b = e.target.closest('[data-w4]'); if (!b) return; const k = b.dataset.w4;
    if (k === 'min') el.classList.toggle('min');
    if (k === 'go') w4tWarp(+b.dataset.id);
    if (k === 'boss') w4tBoss();
    if (k === 'line') w4tLineup();
    if (k === 'test'){ b.disabled = true; b.textContent = 'กำลังทดสอบ…'; const res = el.querySelector('.w4t-res'); res.innerHTML = '';
      let out; try { out = await w4tSelfTest(); } catch (err){ out = [[false, 'การทดสอบหยุดกลางทาง: ' + err.message]]; }
      const pass = out.filter(r => r[0]).length;
      res.innerHTML = `<div class="${pass === out.length ? 'p' : 'f'}"><b>ผ่าน ${pass}/${out.length}</b></div>` + out.map(([p, t]) => `<div class="${p ? 'p' : 'f'}">${p ? '✓' : '✗'} ${t.replace(/</g, '&lt;')}</div>`).join('');
      b.disabled = false; b.textContent = '▶ รันทดสอบอัตโนมัติ'; } });
  el.querySelector('#w4tGod').addEventListener('change', e => { W4T.god = e.target.checked; w4tLog(W4T.god ? 'เปิดอมตะ' : 'ปิดอมตะ'); });
  setInterval(() => { if (W4T.god && typeof DER !== 'undefined'){ S.hp = DER.maxhp; S.sp = DER.maxsp; } }, 100);
}
if (typeof window !== 'undefined' && (window.W4TEST || location.hash === '#test')){
  W4T.on = true;
  const wait = setInterval(() => { if (typeof PAUSED !== 'undefined' && !PAUSED && document.getElementById('title') && document.getElementById('title').hidden){ clearInterval(wait); w4tPanel(); } }, 500);
}
