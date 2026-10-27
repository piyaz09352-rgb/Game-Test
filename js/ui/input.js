/* VAYRATHEN — js/ui/input.js */
'use strict';

/* ---------- input ---------- */
function worldPt(e){ const r = brect(cv); return {x:(ptX(e) - r.left) / r.width * VW + cam.x, y:(ptY(e) - r.top) / r.height * VH + cam.y}; }
function mobAt(p){
  let best = null, bd = 1e9;
  for (const m of mobs){
    if (m.dead) continue;
    const h = MOB_H[m.type], cy = m.y - h * .5, d = Math.hypot(p.x - m.x, p.y - cy);
    if (d < Math.max(m.def.r, h * .45) + 5 && d < bd){ best = m; bd = d; }
  }
  return best;
}
/* zoom: mouse wheel, two-finger pinch, + / − keys and the buttons on the minimap */
const PINCH = new Map(); let pinch0 = null;
const pinchDist = () => { const [a, b] = [...PINCH.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]); };
cv.addEventListener('wheel', e => { e.preventDefault(); if (Math.abs(e.deltaY) < 1) return; const k = Math.pow(1.0015, -clamp(e.deltaY * (e.deltaMode === 1 ? 33 : 1), -120, 120)); setZoom(ZOOM.target * k, false); }, {passive:false});   // smooth: every notch (or trackpad glide) zooms a little, centred on your hero
cv.addEventListener('pointermove', e => {
  if (!PINCH.has(e.pointerId)) return; PINCH.set(e.pointerId, [ptX(e), ptY(e)]);
  if (pinch0 && PINCH.size === 2) setZoom(pinch0.z * pinchDist() / pinch0.d, false);
});
const pinchEnd = e => { PINCH.delete(e.pointerId); if (pinch0 && PINCH.size < 2){ pinch0 = null; setZoom(ZOOM.target); } };
['pointerup', 'pointercancel', 'pointerleave'].forEach(t => cv.addEventListener(t, pinchEnd));
document.addEventListener('click', e => { const b = e.target.closest('[data-zoom]'); if (b) zoomStep(+b.dataset.zoom); });
cv.addEventListener('pointerdown', e => {
  if (e.pointerType === 'touch'){ PINCH.set(e.pointerId, [ptX(e), ptY(e)]); if (PINCH.size === 2){ pinch0 = {d:pinchDist() || 1, z:ZOOM.target}; P.tx = null; return; } if (PINCH.size > 2) return; }
  if (PAUSED) return;
  if (P.dead) return;
  const p = worldPt(e), m = mobAt(p);
  closeDialog(); P.sit = false;
  botPauseFromManual();
  if (P.roll || P.capT > 0) return;
  const gh = !m && typeof ghostAt === 'function' && ghostAt(p);
  if (gh && gh.peer && typeof playerMenu === 'function'){ playerMenu(gh); return; }
  if (gh && gh.peer){ const q = gh.q || {}; askConfirm(clean(q.n, 18) || L('นักผจญภัย', 'Adventurer'), L(`${JOBS[q.j] ? nm(JOBS[q.j]) : ''} Lv ${clamp(q.l | 0, 1, 999)} · ชวนเข้าปาร์ตี้ไหม?`, `${JOBS[q.j] ? nm(JOBS[q.j]) : ''} Lv ${clamp(q.l | 0, 1, 999)} · invite to your party?`), L('ชวนเข้าปาร์ตี้', 'Invite'), () => partyInvite(gh.peer)); return; }
  const lt = !m && lootAt(p, 18);
  if (lt){ P.loot = lt; P.target = null; P.npc = null; P.pending = null; P.cast = null; P.tx = null; return; }
  P.loot = null;
  if (m){ if (P.ride && !DER.pas.rideAtk){ P.ride = false; toast(L('ลงจากพาหนะเพื่อต่อสู้', 'Dismount to fight')); renderHotbar(); } P.target = m; P.tapped = m; P.npc = null; P.tx = null; P.pending = null; return; }
  const n = NPCS.find(n => Math.hypot(p.x - n.x, p.y - (n.y - 22)) < 22);
  if (n){ P.npc = n; P.target = null; P.tx = null; P.cast = null; return; }
  P.target = null; P.npc = null; P.pending = null; P.cast = null; P.tx = p.x; P.ty = p.y;
});
cv.addEventListener('pointermove', e => { const p = worldPt(e), m = mobAt(p); hoverMob = m; hoverLoot = m ? null : lootAt(p, 18); cv.style.cursor = hoverLoot ? 'pointer' : ''; });
cv.addEventListener('pointerleave', () => { hoverMob = null; });
/* keys are read by position (keyOf, js/ui/keys.js), so the Thai layout works the same; the list lives in KEYMAP */
window.addEventListener('keydown', e => {
  const k = keyOf(e);
  if (!typing(e) && plainKey(e) && (k === '+' || k === '=' || k === '-')){ zoomStep(k === '-' ? -1 : 1); return; }
  if (PAUSED || !$('#confirm').hidden){ if (e.key === 'Escape' && !$('#confirm').hidden) $('#confirm').hidden = true; return; }
  if (typing(e)) return;
  if (e.key === 'Escape'){ if (!$('#dialog').hidden) closeDialog(); else { const t = topWin(); if (t) closeWin(t); } return; }
  if (!plainKey(e)) return;
  const wk = {a:'stat', s:'skill', e:'bag', l:'log', o:'settings', q:'equip', m:'world', n:'social', j:'quest', k:'wiki', y:'ach', g:'guild', i:'craft', f:'friends', p:'arena', u:'market', '/':'help'}[k];
  if (wk){ toggleWin(wk); return; }
  if (k === 'h'){ setHideUI(!UIS.hide); return; }
  if (k === 'b' && e.shiftKey){ botSettings(); return; }   // Shift+B: Auto settings (D is a WASD move key)
  if (k === 'b'){ botButton(); return; }
  if (k === 'x' && !P.dead && !P.cast){ P.sit = !P.sit; P.ride = false; P.tx = null; P.target = null; renderHotbar(); return; }
  if (k === ' ' || k === 'c'){ e.preventDefault(); doRoll(); return; }
  if (k === 'r'){ toggleRide(); return; }
  if (k === 't'){ tryCapture(); return; }
  if (k === 'z'){ const l = nearestLoot(); if (l){ botPauseFromManual(); P.loot = l; P.target = null; P.npc = null; P.tx = null; P.sit = false; } else toast(L('ไม่มีของใกล้ ๆ', 'Nothing to pick up nearby')); return; }
  const n = /^[1-8]$/.test(k) ? +k : 0;
  if (n){ const h = hotbarDef()[n - 1]; if (h) useHot(h); }
});
