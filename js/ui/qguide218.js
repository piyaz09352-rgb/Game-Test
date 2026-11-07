/* VAYRATHEN — js/ui/qguide218.js — (v218) the quest log knows the map stories, and a guide arrow leads the way
   · Quest window: a section for the four map-story roads — how far each has come, the chapter in hand and its goal,
     or where the next chapter waits and at what level, the road's title and mount — each with a «นำทาง» button;
     the main story gets one too.
   · Guide arrow: on the map that holds the goal it points at the NPC to talk to, the nearest glowing spot or the named
     monster; on any other map it points at the gate that leads there (shortest way through the roads), with the next
     region's name. Off screen it sits at the edge, on screen it bobs over the target. Cancel it in the quest window.
   · World map: ✦ over each region where a story chapter waits or is under way, and a roof over the crossroads towns. */
'use strict';

const qgS = () => (S.guide && typeof S.guide === 'object' ? S.guide : null);
/* the way between two regions: the next region to walk into (breadth-first over the gates) */
function qgNextHop(from, to){
  if (from === to) return null; const prev = {[from]:null}, q = [from];
  while (q.length){ const a = q.shift(); for (const d in (MAPS[a].links || {})){ const b = MAPS[a].links[d]; if (b in prev) continue; prev[b] = a; if (b === to){ let k = b; while (prev[k] !== from) k = prev[k]; return k; } q.push(b); } }
  return null;
}
/* what a road's story wants now: the region, and on it the point to go to (or none: hunt anywhere there) */
function qgArcGoal(arc){
  const s = msS(), c = s.cur;
  if (c && arc.maps.includes(c.map)){ const st = msStep(), ch = MS_CH[c.map], npcId = ch.npc.id;
    if (msReady()) return {map:c.map, npc:npcId, label:[`กลับไปหา${ch.npc.name}`, `Back to ${ch.npc.en}`]};
    if (st.k === 'find' && c.map === MAP_ID && MS.map === MAP_ID){ const left = MS.spots.map((p, i) => ({...p, i})).filter(p => !(c.found || []).includes(p.i)).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y));
      if (left[0]) return {map:c.map, x:left[0].x, y:left[0].y, label:[st.what[0], st.what[1]]}; }
    if (st.k === 'elite' && c.map === MAP_ID){ const m = MS.eliteM && !MS.eliteM.dead ? MS.eliteM : MS.elite; if (m) return {map:c.map, x:m.x, y:m.y, label:[st.name[0], st.name[1]]}; }
    return {map:c.map, label:[msGoalTxt(st), msGoalTxt(st)], here:true}; }
  const nx = arc.maps.find(m => !s.done[m]); if (nx == null) return null;
  const npc = nx === arc.maps[0] ? arc.comp.id : MS_CH[nx].npc.id;
  return {map:nx, npc, label:[`${MS_CH[nx].title[0]} · คุยกับ ${(nx === arc.maps[0] ? arc.comp : MS_CH[nx].npc).name}`, `${MS_CH[nx].title[1]} · talk to ${(nx === arc.maps[0] ? arc.comp : MS_CH[nx].npc).en}`]};
}
function qgMainGoal(){
  const q = qState(), Q = QUESTS.find(x => x.id === q.active) || curMain(); if (!Q) return null;
  const ready = q.active && questReady(Q), giver = Q.giver === 'job' ? 'job' : 'warp';
  if (q.active && !ready) return {map:Q.map, label:[L(Q.title[0], Q.title[1]), L(Q.title[0], Q.title[1])], here:true};
  return {map:Q.map, npc:giver, label:[`${Q.title[0]} · ${giver === 'job' ? 'ครูวายรา' : 'ผู้เฝ้าศาล'}`, `${Q.title[1]} · ${giver === 'job' ? 'Master Vayra' : 'the Shrine Keeper'}`]};
}
function qgGoal(){ const g = qgS(); if (!g) return null; if (g.kind === 'main') return qgMainGoal(); const arc = MS_ARCS.find(a => a.id === g.id); return arc ? qgArcGoal(arc) : null; }
/* where the arrow points this frame */
function qgTarget(){
  const G = qgGoal(); if (!G) return null;
  if (G.map !== MAP_ID){ const hop = qgNextHop(MAP_ID, G.map), gt = hop != null && GATES.find(x => x.to === hop); if (!gt) return null;
    return {x:gt.x, y:gt.y, label:L(`ไป${MAPS[hop].name}${hop !== G.map ? ` → ${MAPS[G.map].name}` : ''}`, `To ${MAPS[hop].en}${hop !== G.map ? ` → ${MAPS[G.map].en}` : ''}`)}; }
  if (G.npc){ const n = NPCS.find(x => x.id === G.npc); if (n) return {x:n.x, y:n.y - 20, label:L(G.label[0], G.label[1])}; }
  if (G.x != null) return {x:G.x, y:G.y, label:L(G.label[0], G.label[1])};
  return {here:true, label:L(G.label[0], G.label[1])};
}
EV.on('draw', () => {
  if (!qgS() || !S || P.dead || (typeof DG !== 'undefined' && DG.active)) return;
  let t; try { t = qgTarget(); } catch (e) { return; } if (!t) return;
  const z = typeof TAG_Z === 'function' ? TAG_Z() : 1; ctx.save(); ctx.font = `700 ${Math.round(12 * z)}px Sarabun,"Noto Sans Thai",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const pill = (x, y, s) => { const w = ctx.measureText(s).width + 16 * z, h = 20 * z; ctx.fillStyle = 'rgba(40,24,8,.82)'; ctx.strokeStyle = 'rgba(255,214,110,.95)'; ctx.lineWidth = 1.4 * z;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2) : ctx.rect(x - w / 2, y - h / 2, w, h); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffe9a8'; ctx.fillText(s, x, y + .5); };
  if (t.here){ pill(SW / 2, 64 * z, `📖 ${t.label}`); ctx.restore(); return; }
  const X = sx(t.x), Y = sy(t.y), m = 46 * z, on = X > m && X < SW - m && Y > m + 30 * z && Y < SH - m;
  const bob = Math.sin(T * 5) * 4 * z;
  if (on){ ctx.fillStyle = '#ffd23a'; ctx.strokeStyle = '#2a1404'; ctx.lineWidth = 2.4 * z; ctx.beginPath(); ctx.moveTo(X, Y - 18 * z + bob); ctx.lineTo(X - 9 * z, Y - 32 * z + bob); ctx.lineTo(X + 9 * z, Y - 32 * z + bob); ctx.closePath(); ctx.stroke(); ctx.fill();
    pill(X, Y - 46 * z + bob, t.label); }
  else { // off screen: the arrow circles the hero, pointing the way (the screen edges are covered by the HUD)
    const px = sx(P.x), py = sy(P.y - 22), a = Math.atan2(Y - py, X - px), R = Math.min(SW, SH) * .2 + bob, ax = px + Math.cos(a) * R, ay = py + Math.sin(a) * R * .8;
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(a); ctx.fillStyle = '#ffd23a'; ctx.strokeStyle = '#2a1404'; ctx.lineWidth = 2.6 * z; ctx.beginPath(); ctx.moveTo(16 * z, 0); ctx.lineTo(-8 * z, -11 * z); ctx.lineTo(-3 * z, 0); ctx.lineTo(-8 * z, 11 * z); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
    pill(clamp(ax, 110 * z, SW - 110 * z), ay + (Math.sin(a) > 0 ? 24 : -24) * z, `${t.label} · ${Math.round(Math.hypot(t.x - P.x, t.y - P.y) / 10)} ม.`); }
  ctx.restore();
});
/* the quest window: the four roads */
function qgArcHTML(){
  const s = msS(), g = qgS();
  const cards = MS_ARCS.map(arc => { const done = arc.maps.filter(m => s.done[m]).length, all = arc.maps.length, fin = done >= all, c = s.cur && arc.maps.includes(s.cur.map) ? s.cur : null;
    const nx = arc.maps.find(m => !s.done[m]), lvOk = nx != null && msLvOk(nx);
    let line;
    if (fin) line = `<span class="qok">✓ ${L('จบทั้งสายแล้ว', 'Road complete')}</span>`;
    else if (c){ const st = msStep(); line = `<b>${L(MS_CH[c.map].title[0], MS_CH[c.map].title[1])}</b> · ${msGoalTxt(st)} ${msHave(st)}/${msNeed(st)}${msReady() ? ` · <span class="qok">${L(`กลับไปหา${MS_CH[c.map].npc.name}`, `back to ${MS_CH[c.map].npc.en}`)}</span>` : ''}<br><small>${L(MAPS[c.map].name, MAPS[c.map].en)}</small>`; }
    else line = `${L('บทต่อไป', 'Next')}: <b>${L(MS_CH[nx].title[0], MS_CH[nx].title[1])}</b><br><small>${L(MAPS[nx].name, MAPS[nx].en)} · ${lvOk ? `Lv ${msLv(nx)}+` : `<span class="qlock">${L(`ต้อง Lv ${Math.max(1, msLv(nx) - 5)}`, `needs Lv ${Math.max(1, msLv(nx) - 5)}`)}</span>`}</small>`;
    const on = g && g.kind === 'arc' && g.id === arc.id;
    return `<div class="qgarc${fin ? ' fin' : ''}"><div class="qgt"><b>${L(arc.title[0], arc.title[1])}</b><small>${L('กับ', 'with')} ${L(arc.comp.name, arc.comp.en)}</small></div>
      <div class="qgbar"><i style="width:${Math.round(done / all * 100)}%"></i><span>${done}/${all}</span></div><p>${line}</p>
      <small class="qgrw">${L('รางวัลจบสาย', 'Road reward')}: «${L(arc.titleName[0], arc.titleName[1])}» · ${msPieceName(arc.mount)}</small>
      ${fin ? '' : `<button class="btn sm${on ? '' : ' gold'}" data-qguide="${on ? '' : 'arc:' + arc.id}">${on ? L('ยกเลิกนำทาง', 'Stop guiding') : L('นำทาง', 'Guide me')}</button>`}</div>`; }).join('');
  const onMain = g && g.kind === 'main';
  return `<div class="sec">${L('เนื้อเรื่องเสริมตามแผนที่', 'Map stories')}</div><div class="qgarcs">${cards}</div>
    <div class="qgmain">${L('เนื้อเรื่องหลัก «ผนึกวายรา»', 'Main story «The Seal of Vayra»')} <button class="btn sm${onMain ? '' : ' gold'}" data-qguide="${onMain ? '' : 'main'}">${onMain ? L('ยกเลิกนำทาง', 'Stop guiding') : L('นำทาง', 'Guide me')}</button></div>`;
}
{ const _rq = renderQuestLog; renderQuestLog = function(){ const r = _rq.apply(this, arguments); const pane = el('pane-quest'); if (!pane || pane.querySelector('.qgwrap')) return r;
    const box = document.createElement('div'); box.className = 'qgwrap'; box.innerHTML = qgArcHTML(); const head = pane.querySelector('.qhead'); if (head) head.before(box); else pane.prepend(box); return r; }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-qguide]'); if (!b) return; const v = b.dataset.qguide;
  S.guide = !v ? null : v === 'main' ? {kind:'main'} : {kind:'arc', id:v.slice(4)}; dirty = true; save();
  toast(S.guide ? L('เปิดนำทางแล้ว ตามลูกศรสีทองได้เลย', 'Guiding: follow the golden arrow') : L('ปิดนำทางแล้ว', 'Guide off'));
  if (typeof WIN_RENDER !== 'undefined' && WIN_RENDER.quest) WIN_RENDER.quest(); });
{ const st = document.createElement('style'); st.textContent = `
  .qgwrap .qgarcs{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;margin:4px 0 8px}
  .qgwrap .qgarc{display:flex;flex-direction:column;gap:4px;padding:9px 10px;border-radius:12px;background:linear-gradient(#fffdf6,#fbf1dc);border:1px solid #e8d4a8;box-shadow:0 2px 0 rgba(150,110,40,.15)}
  .qgwrap .qgarc.fin{background:linear-gradient(#f4fff2,#e2f6dc);border-color:#a8d89a}
  .qgwrap .qgt{display:flex;justify-content:space-between;align-items:baseline;gap:6px}.qgwrap .qgt b{color:#5a2a08;font-size:14px}.qgwrap .qgt small{color:#8a6a3a;font-size:11px;white-space:nowrap}
  .qgwrap .qgbar{position:relative;height:12px;border-radius:6px;background:#ead8b0;overflow:hidden}.qgwrap .qgbar i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#f0b030,#ffd860);border-radius:6px}
  .qgwrap .qgbar span{position:relative;display:block;text-align:center;font-size:10px;line-height:12px;font-weight:700;color:#4a2a08}
  .qgwrap .qgarc p{margin:0;font-size:12px;line-height:1.35;color:#3a2410}.qgwrap .qgarc p small{color:#8a6a3a}.qgwrap .qlock{color:#b04a2a}
  .qgwrap .qgrw{font-size:10.5px;color:#9a7a4a}.qgwrap .qgarc .btn{align-self:flex-start;margin-top:auto}
  .qgwrap .qgmain{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;margin-bottom:8px;border-radius:10px;background:#fff6e0;border:1px dashed #e0c080;font-size:13px;color:#5a2a08}`;
  document.head.appendChild(st); }
/* the world map: ✦ where a chapter waits or runs, a roof over the towns */
{ const _wm = wmMapHTML;
  wmMapHTML = function(){ const h = _wm.apply(this, arguments); const s = msS(), want = new Set();
    for (const arc of MS_ARCS){ if (s.cur && arc.maps.includes(s.cur.map)) want.add(s.cur.map); else { const nx = arc.maps.find(m => !s.done[m]); if (nx != null && msLvOk(nx)) want.add(nx); } }
    const extra = [...want].map(i => { const [x, y] = wmPic(i); return `<span class="wmstory" style="left:${(x * 100).toFixed(2)}%;top:${(y * 100).toFixed(2)}%" title="${L('เนื้อเรื่องเสริม', 'Side story')}">✦</span>`; }).join('')
      + (typeof TOWNS !== 'undefined' ? TOWNS.map(T0 => { if (!MAPS[T0.id]) return ''; const [x, y] = wmPic(T0.id); return `<span class="wmtown" style="left:${(x * 100).toFixed(2)}%;top:${(y * 100).toFixed(2)}%" title="${L('เมือง', 'Town')}">🏯</span>`; }).join('') : '');
    return h.replace('<div class="wmhere"', extra + '<div class="wmhere"'); }; }
{ const st = document.createElement('style'); st.textContent = `.wmstory,.wmtown{position:absolute;transform:translate(-50%,-150%);pointer-events:none;z-index:3;font-size:15px;line-height:1;text-shadow:0 1px 0 #2a1404,0 0 6px rgba(255,220,110,.9)}
  .wmstory{color:#ffd23a;animation:wmst 1.6s ease-in-out infinite}.wmtown{transform:translate(-50%,-50%);font-size:14px;filter:drop-shadow(0 1px 1px rgba(0,0,0,.5))}
  @keyframes wmst{50%{transform:translate(-50%,-185%)}}`; document.head.appendChild(st); }
