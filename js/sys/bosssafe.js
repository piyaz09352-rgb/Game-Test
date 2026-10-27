/* VAYRATHEN — js/sys/bosssafe.js — no free boss kills from the safe zone
   A boss can't follow you into the village (or a map's camp), so pulling it to the edge and hitting it from inside
   was free damage. Now a boss that is hit while you stand in the safe zone, or that ends up inside it, teleports
   away to another part of its map with full HP and forgets you. A boss that was hunting you when you reached the
   safe zone also gives up and leaves, so it doesn't wait at the edge. The world boss doesn't move: hits from inside
   the safe zone simply do nothing to it. */
'use strict';

function bossEscape(m, msg){
  const q = bossSpot(), x0 = m.x, y0 = m.y;
  if (typeof VFX !== 'undefined'){ VFX.play('blink', {x:x0, y:y0, x2:q.x, y2:q.y}); VFX.play('dustPuff', {x:x0, y:y0}); }
  addText(x0, y0 - MOB_H[m.type] - 24, msg || L('บอสหนีไปแล้ว! เขตปลอดภัยตีบอสไม่ได้', 'The boss escaped! No fighting it from the safe zone'), '#ffb46a', 14);
  m.x = m.hx = q.x; m.y = m.hy = q.y; m.tx = m.ty = null; m.hp = m.maxhp; m.aggro = false; m.flee = 0; m.charge = null; m.leapT = 0; m.busy = 0; m.enraged = false;
  if (P.target === m){ P.target = null; P.pending = null; }
  if (typeof SFX !== 'undefined') SFX.play('blink');
}
{ const _ad = applyDamage; applyDamage = function(m, res, sk){
    if (m && !m.dead && !m.pvp && m.def && m.def.boss && (inVillage(P) || inVillage(m))){
      if (m.wb){ addText(m.x, m.y - MOB_H[m.type] - 4, 'No effect', '#cfcfcf'); return; }
      bossEscape(m); return;
    }
    return _ad.apply(this, arguments); }; }
{ const _um = updMob; updMob = function(m, dt){ const out = _um.apply(this, arguments);
    if (!m.dead && !m.wb && m.def.boss){
      if (inVillage(m)) bossEscape(m);
      // it was hunting you and you reached the safe zone: it gives up and goes back to roaming elsewhere,
      // instead of waiting at the edge for you to step out again
      else if (m._hunt && !m.aggro && inVillage(P) && dist(m, P) < 600) bossEscape(m, L('บอสเลิกไล่ กลับไปเดินที่อื่น', 'The boss gave up and wandered off'));
      m._hunt = !!m.aggro;
    }
    return out; }; }
