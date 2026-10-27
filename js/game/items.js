/* VAYRATHEN — js/game/items.js */
'use strict';

/* ---------- items ---------- */
function addItem(id, n){ S.inv[id] = (S.inv[id] || 0) + n; dirty = true; }
function useItem(id){
  const it = ITEMS[id];
  if (!S.inv[id] || P.dead || P.itemCd > 0) return;
  if (it.heal){ if (S.hp >= DER.maxhp){ toast(L('HP เต็มแล้ว', 'HP is full')); return; } const h = Math.round(it.heal * (1 + (DER.pas.potionPct || 0))); S.hp = Math.min(DER.maxhp, S.hp + h); addText(P.x, P.y - 50, `+${h}`, '#c4ffe0'); }
  else if (it.recall){ if (MAP_ID === 0 && inVillage(P)){ toast(L('อยู่ในหมู่บ้านแล้ว', 'Already in the village')); return; } SFX.play('talisman'); S.inv[id]--; if (!S.inv[id]) delete S.inv[id]; warpTo(0); dirty = true; return; }
  else if (it.spheal){ if (S.sp >= DER.maxsp){ toast(L('SP เต็มแล้ว', 'SP is full')); return; } S.sp = Math.min(DER.maxsp, S.sp + it.spheal); addText(P.x, P.y - 50, `+${it.spheal} SP`, '#9fd0ff'); }
  else return;
  S.inv[id]--; if (!S.inv[id]) delete S.inv[id]; if (typeof bump === 'function'){ bump('potions'); EV.emit('potion', id); }
  P.itemCd = .3; dirty = true;
  const tier = {redpot:1, orangepot:2, whitepot:3, elixirpot:4, bluepot:1, bigbluepot:3}[id] || 1; SFX.play(it.spheal ? 'pot_sp' : 'pot_hp', {tier});
}
