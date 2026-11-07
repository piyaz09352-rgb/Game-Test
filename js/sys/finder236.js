/* VAYRATHEN — js/sys/finder236.js — (v236) find where things come from, and warp there
   The owner: when a player wants a material, an item or a boss, show where it is and warp them to the map, the way
   the warp NPCs already do (same fee, only maps you have visited). Three ways in:
   · the bag: a selected item gets «🧭 ไปหา» (which monsters drop it, on which maps);
   · the warp keeper / boatman: a search box above the map grid — type an item, a monster or a boss;
   · the Wiki: a monster's page gets «🧭 วาร์ปไปหา».
   The finder lists each source monster with its level, drop chance and maps; every map row has a warp button
   (fee as at the shrine, greyed out for maps not visited yet or while in a dungeon / the tower). After the warp the
   quest arrow points out the nearest one of that monster (boss: its lair) for a while. */
'use strict';
/* ---------- data ---------- */
const FND = {idx:null, mark:null};
function fdIndex(){
  if (FND.idx) return FND.idx; const where = {}, drops = {};
  MAPS.forEach(mp => { if (!mp || (typeof isTown === 'function' && isTown(mp.id))) return; for (const k of mp.mobs || []) (where[k] = where[k] || []).push(mp.id); if (mp.boss) (where[mp.boss] = where[mp.boss] || []).push(mp.id); });
  for (const k in MOB){ const m = MOB[k]; for (const [id, ch] of m.drops || []) (drops[id] = drops[id] || []).push([k, ch]); if (m.card) (drops[m.card] = drops[m.card] || []).push([k, m.cardRate || .002]);
    if (ITEMS['m_' + k]) (drops['m_' + k] = drops['m_' + k] || []).push([k, null]); }
  if (typeof CK_SRC !== 'undefined') for (const id in CK_SRC){ const k = CK_SRC[id]; if (MOB[k] && !(drops[id] || []).some(d => d[0] === k)) (drops[id] = drops[id] || []).push([k, null]); }
  return (FND.idx = {where, drops});
}
const fdMaps = k => [...new Set((fdIndex().where[k] || []))].sort((a, b) => (MAPS[a].lv || [0])[0] - (MAPS[b].lv || [0])[0]);
const fdSources = id => (fdIndex().drops[id] || []).filter(([k]) => fdMaps(k).length).sort((a, b) => MOB[a[0]].lvl - MOB[b[0]].lvl);
const fdBlocked = () => (typeof DG !== 'undefined' && DG.active) || (typeof TW !== 'undefined' && TW.active) || (typeof SIEGE_MAP !== 'undefined' && MAP_ID === SIEGE_MAP);
const fdName = id => (ITEMS[id] ? nm(ITEMS[id]) : typeof CARDS !== 'undefined' && CARDS[id] && typeof cardTitle === 'function' ? cardTitle(id) : id);
/* search an item, a monster or a boss by its Thai or English name */
function fdSearch(q){
  q = String(q || '').trim().toLowerCase(); if (q.length < 1) return [];
  const hit = o => o && [o.name, o.en, o.th].some(s => s && String(s).toLowerCase().includes(q)); const out = [];
  for (const k in MOB) if (hit(MOB[k]) && fdMaps(k).length) out.push({kind:MOB[k].boss ? 'boss' : 'mob', id:k});
  for (const id in fdIndex().drops) if (hit(ITEMS[id]) && fdSources(id).length) out.push({kind:'item', id});
  return out.slice(0, 30);
}
/* ---------- the finder panel ---------- */
function fdMapRow(mp, k){
  const M = MAPS[mp], seen = S.visited && S.visited[mp], here = mp === MAP_ID, fee = typeof warpFee === 'function' ? warpFee(mp) : 0, ok = seen && !here && S.bia >= fee && !fdBlocked();
  const why = here ? L('อยู่ที่นี่แล้ว', 'You are here') : !seen ? L('ยังไม่เคยไป', 'Not visited yet') : fdBlocked() ? L('ออกจากดันเจี้ยน/หอคอยก่อน', 'Leave the dungeon / tower first') : S.bia < fee ? L('เบี้ยไม่พอ', 'Not enough Bia') : '';
  return `<div class="fdmap${seen ? '' : ' locked'}"><span>${L(M.name, M.en)} <small>Lv ${M.lv[0]}–${M.lv[1]}</small></span>
    <button class="btn sm${ok ? ' gold' : ''}" data-fdwarp="${mp}" data-fdmob="${k}" ${ok ? '' : 'disabled'} title="${why}">${here ? '📍 ' + L('ที่นี่', 'Here') : `🧭 ${fee ? fmtN(fee) : L('ฟรี', 'free')}`}</button></div>`;
}
function fdMobBlock(k, ch){ const m = MOB[k];
  return `<div class="fdmob"><div class="fdmh"><b>${m.boss ? '♛ ' : ''}${nm(m)}</b><small>Lv ${m.lvl}${ch != null ? ` · ${L('ดรอป', 'drop')} ${(ch * 100 < 1 ? (ch * 100).toFixed(2) : (ch * 100).toFixed(ch * 100 < 10 ? 1 : 0))}%` : ''}${m.night ? ` · ${L('ออกกลางคืน', 'night only')}` : ''}${m.boss ? ` · ${L('บอสประจำแคว้น เกิดใหม่ตามเวลา', 'region boss, respawns on a timer')}` : ''}</small></div>
    ${fdMaps(k).map(mp => fdMapRow(mp, k)).join('')}</div>`; }
function fdOpen(kind, id){
  let b = el('finder'); if (!b){ b = document.createElement('div'); b.id = 'finder'; el('ui').appendChild(b); }
  let title, body;
  if (kind === 'item'){ const src = fdSources(id); title = `🧭 ${L('หา', 'Find')} ${fdName(id)}`;
    body = src.length ? src.map(([k, ch]) => fdMobBlock(k, ch)).join('') : `<p class="hint">${L('ไอเท็มนี้ไม่ได้ดรอปจากมอน (ซื้อ คราฟต์ หรือได้จากเควสต์/กิจกรรม)', 'This item is not dropped by monsters (shops, crafting, quests or events)')}</p>`; }
  else { title = `🧭 ${L('ไปหา', 'Go to')} ${nm(MOB[id])}`; body = fdMobBlock(id, null); }
  b.innerHTML = `<div class="fdcard"><header><b>${title}</b><button class="ibtn" data-fdclose="1">✕</button></header><div class="fdbody">${body}</div>
    <p class="hint">${L('วาร์ปได้เฉพาะแผนที่ที่เคยไป · ค่าวาร์ปเท่าศาลวาร์ป', 'Only maps you have visited · same fee as the shrine')}</p></div>`;
  b.hidden = false;
}
function fdClose(){ const b = el('finder'); if (b) b.hidden = true; }
function fdWarp(mp, k){
  const fee = warpFee(mp); if (fdBlocked() || !(S.visited && S.visited[mp]) || mp === MAP_ID || S.bia < fee) return;
  S.bia -= fee; fdClose(); if (typeof wgClose === 'function') wgClose(); closeDialog(); for (const w of WIN_IDS) if (UIS.open[w]) closeWin(w);
  warpTo(mp); FND.mark = {k, t:90}; toast(L(`มาถึง${MAPS[mp].name} · ลูกศรชี้ ${nm(MOB[k])} ที่ใกล้ที่สุด`, `Arrived at ${MAPS[mp].en} · the arrow points to the nearest ${nm(MOB[k])}`)); dirty = true; save();
}
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-fdclose],[data-fdwarp],[data-fdfind],[data-fdres]'); if (!t || t.disabled) return; const d = t.dataset;
  if (d.fdclose) fdClose(); else if (d.fdwarp) fdWarp(+d.fdwarp, d.fdmob); else if (d.fdfind) fdOpen(d.fdkind || 'item', d.fdfind); else if (d.fdres){ const [kind, id] = d.fdres.split(':'); fdOpen(kind, id); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape'){ const b = el('finder'); if (b && !b.hidden){ fdClose(); e.stopImmediatePropagation(); } } }, true);
/* ---------- after the warp: the arrow points out the monster for 90 s ---------- */
EV.on('tick', dt => { if (!FND.mark) return; FND.mark.t -= dt; if (FND.mark.t <= 0 || !MOB[FND.mark.k]) FND.mark = null; });
EV.on('draw', () => { const f = FND.mark; if (!f || P.dead) return; const t = mobs.filter(m => !m.dead && !m.vanish && m.type === f.k).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0];
  if (!t || Math.hypot(t.x - P.x, t.y - P.y) < 140) return; const z = typeof TAG_Z === 'function' ? TAG_Z() : 1, px = sx(P.x), py = sy(P.y - 22), a = Math.atan2(sy(t.y) - py, sx(t.x) - px), R = Math.min(SW, SH) * .16;
  ctx.save(); ctx.translate(px + Math.cos(a) * R, py + Math.sin(a) * R * .8); ctx.rotate(a); ctx.fillStyle = '#7ae0ff'; ctx.strokeStyle = '#0a2a4a'; ctx.lineWidth = 2.4 * z;
  ctx.beginPath(); ctx.moveTo(15 * z, 0); ctx.lineTo(-8 * z, -10 * z); ctx.lineTo(-3 * z, 0); ctx.lineTo(-8 * z, 10 * z); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore(); });
/* ---------- way in 1: the bag ---------- */
{ const _bi = bagInfo; bagInfo = function(){ const r = _bi.apply(this, arguments); const box = el('bagInfo'), id = typeof BAG !== 'undefined' && BAG.sel; if (!box || !id) return r;
    const base = typeof baseOf === 'function' ? baseOf(id) : id, src = fdSources(base); if (!src.length || box.querySelector('[data-fdfind]')) return r;
    const b = document.createElement('button'); b.className = 'btn sm fdbtn'; b.dataset.fdfind = base; b.dataset.fdkind = 'item'; b.textContent = `🧭 ${L('ไปหา', 'Find')}`;
    const row = box.querySelector('.acts, .bactions, .row:last-child') || box; row.appendChild(b); return r; }; }
/* ---------- way in 2: the warp keeper / boatman ---------- */
{ const _o = wgOpen; wgOpen = function(n){ const r = _o.apply(this, arguments); const b = el('warpGrid'); if (!b || b.querySelector('.fdsearch')) return r;
    const box = document.createElement('div'); box.className = 'fdsearch';
    box.innerHTML = `<input id="fdQ" type="search" placeholder="${L('🔍 หาไอเท็ม วัตถุดิบ มอน หรือบอส… แล้ววาร์ปไปที่แผนที่นั้น', '🔍 Find an item, material, monster or boss… and warp to its map')}" autocomplete="off"><div class="fdres" id="fdRes"></div>`;
    const grid = b.querySelector('.wggrid'); (grid ? grid.parentNode : b).insertBefore(box, grid || b.firstChild); return r; }; }
document.addEventListener('input', e => { if (!e.target || e.target.id !== 'fdQ') return; const res = el('fdRes'); if (!res) return; const list = fdSearch(e.target.value);
  res.innerHTML = list.length ? list.map(o => `<button class="fdr" data-fdres="${o.kind}:${o.id}">${o.kind === 'item' ? (typeof itemIcon === 'function' && ITEMS[o.id] ? itemIcon(o.id) : '📦') : o.kind === 'boss' ? '♛' : '👾'}<span>${o.kind === 'item' ? fdName(o.id) : nm(MOB[o.id])}<small>${o.kind === 'item' ? L('ไอเท็ม', 'item') : `Lv ${MOB[o.id].lvl} · ${o.kind === 'boss' ? L('บอส', 'boss') : L('มอน', 'monster')}`}</small></span></button>`).join('')
    : (e.target.value.trim() ? `<p class="hint">${L('ไม่พบ', 'Nothing found')}</p>` : ''); });
/* ---------- way in 3: the Wiki's monster page ---------- */
{ const _w = wikiPage; wikiPage = function(){ const h = _w.apply(this, arguments); const id = WIKI.sel;
    if ((WIKI.tab === 'mob' || WIKI.tab === 'boss') && MOB[id] && fdMaps(id).length && typeof h === 'string' && h.includes('</h3>'))
      return h.replace('</h3>', `</h3><button class="btn sm gold fdbtn" data-fdfind="${id}" data-fdkind="mob">🧭 ${L('วาร์ปไปหา', 'Warp to it')}</button>`);
    return h; }; }
{ const st = document.createElement('style'); st.textContent = `
  #finder{position:absolute;inset:0;z-index:330;display:grid;place-items:center;background:rgba(20,12,4,.35)}
  #finder[hidden]{display:none}
  #finder .fdcard{width:min(460px,calc(100% - 24px));max-height:calc(100% - 24px);display:flex;flex-direction:column;border-radius:16px;background:linear-gradient(#fffaf0,#f6ead2);border:3px solid #d9a63a;box-shadow:0 12px 30px rgba(0,0,0,.35);overflow:hidden}
  #finder header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:linear-gradient(#5cbcff,#2a7ad8);color:#fff;font:800 15px Sarabun,sans-serif}
  #finder .fdbody{overflow-y:auto;padding:10px 12px;display:flex;flex-direction:column;gap:8px}
  #finder .fdmob{border:1.5px solid #e2cfa4;border-radius:12px;padding:8px 10px;background:#fffdf7}
  #finder .fdmh b{display:block;color:#3a2410;font:800 14px Sarabun,sans-serif}#finder .fdmh small{color:#7a5a30}
  #finder .fdmap{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;font:700 13px Sarabun,sans-serif;color:#3a2410}
  #finder .fdmap.locked span{opacity:.55}#finder .fdmap small{color:#8a6a40;font-weight:600}
  #finder .hint{margin:6px 12px 10px;font-size:12px;color:#7a5a30}
  .fdsearch{padding:8px 10px 4px}.fdsearch input{width:100%;box-sizing:border-box;height:40px;border-radius:12px;border:2px solid #d9a63a;padding:0 12px;font:600 15px Sarabun,sans-serif;background:#fffdf6}
  .fdres{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;max-height:30vh;overflow-y:auto}
  .fdres .fdr{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:10px;border:1.5px solid #e2cfa4;background:#fffaf0;cursor:pointer;font:700 13px Sarabun,sans-serif;color:#3a2410}
  .fdres .fdr small{display:block;font-weight:600;color:#8a6a40;font-size:11px}.fdres .fdr svg,.fdres .fdr img{width:22px;height:22px}
  .fdbtn{margin:6px 4px 0 0}`; document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'finder', t:['นำทางหาไอเท็มและมอน', 'Finding items and monsters'], b:() => `<p>${L('กดไอเท็มในกระเป๋าแล้วกด «🧭 ไปหา» · พิมพ์ชื่อไอเท็ม มอน หรือบอสในช่องค้นหาที่ศาลวาร์ป/คนพายเรือ · หรือกด «🧭 วาร์ปไปหา» ในหน้ามอนของวิกิ แล้ววาร์ปไปแผนที่ที่มอนอยู่ (ค่าวาร์ปเท่าศาล · เฉพาะแผนที่ที่เคยไป) มาถึงแล้วลูกศรสีฟ้าชี้มอนตัวที่ใกล้ที่สุด 90 วินาที', 'Pick an item in the bag and press «🧭 Find», type an item, monster or boss in the search box at the warp keeper / boatman, or press «🧭 Warp to it» on a monster\'s Wiki page, then warp to its map (shrine fee · visited maps only); a blue arrow points to the nearest one for 90 s.')}</p>`});
