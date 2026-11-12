/* VAYRATHEN — js/sys/nomount286.js — (v286) every fashion mount is gone, the Golden Deer stays
   The owner: none of the mounts looked good; they will come back one by one, made properly. Until then the only ride
   is the Golden Deer (Uncle Boonma, mount279.js), and the Warlord rides it too instead of the war elephant.
   Removed: the wardrobe / coin-shop mounts (clouds, lotus, carpet, Singha, Erawan, Garuda, hoverboard, saucer …), the
   robot mounts, the story mounts (krathong, rocket, sun cloth, barge) and the tower's floating dais.
   Anyone who bought one with Vayra Coins gets the coins back, once (ACC.mntGone remembers which were refunded).
   Loaded after every file that adds a mount (robomount279.js is the last) and before the coin shop. */
'use strict';

const MOUNT_GONE = {};
for (const id of Object.keys(XMOUNT)){ MOUNT_GONE[id] = XMOUNT[id]; delete XMOUNT[id]; if (XCOS[id] === MOUNT_GONE[id]) delete XCOS[id]; }
/* the wardrobe and the coin shop lose their Mounts tab */
if (typeof FW_TABS !== 'undefined'){ const i = FW_TABS.findIndex(t => t[0] === 'mount'); if (i >= 0) FW_TABS.splice(i, 1); if (typeof FW !== 'undefined' && FW.tab === 'mount') FW.tab = 'wing'; }
/* nothing hands one out any more: the map stories' last chapters and the tower's floor-100 milestone */
if (typeof MS_ARCS !== 'undefined') for (const a of MS_ARCS) if (a.mount && MOUNT_GONE[a.mount]) delete a.mount;
if (typeof TWS_MILE !== 'undefined') for (let i = TWS_MILE.length - 1; i >= 0; i--) if (MOUNT_GONE[TWS_MILE[i][1]]) TWS_MILE.splice(i, 1);
/* the Warlord rides the deer */
{ const C = typeof SPR !== 'undefined' && SPR.CHARS; if (C) for (const k in C) if (C[k] && C[k].mount && C[k].mount !== 'deer') delete C[k].mount; }
{ const _t = toggleRide; toggleRide = function(){ const r = _t.apply(this, arguments);
    if (P.ride && S.job === 'warlord') toast(L('ขึ้นขี่กวางทอง · เร็วขึ้น 30%', 'Riding the golden deer · 30% faster')); return r; }; }

/* refunds and clean-up: whatever the account still holds of a removed mount */
function mountGoneSweep(){
  if (typeof ACC === 'undefined' || !ACC) return;
  const W = ACC.wardrobe || {}, done = ACC.mntGone = ACC.mntGone && typeof ACC.mntGone === 'object' ? ACC.mntGone : {}; let coins = 0, names = [], ch = false;
  for (const id in MOUNT_GONE){ if (!W[id]) continue;
    const M = MOUNT_GONE[id], c = M.price && M.price.c | 0;
    if (!done[id]){ done[id] = 1; if (c > 0){ coins += c; names.push(L(M.th, M.en)); } }
    delete W[id]; ch = true; }
  if (typeof S !== 'undefined' && S && S.cos && S.cos.mount && MOUNT_GONE[S.cos.mount]){ delete S.cos.mount; if (typeof dirty !== 'undefined') dirty = true; }
  if (coins > 0 && typeof coinAdd === 'function'){ coinAdd(coins, L('คืนเงินสัตว์ขี่ที่ถูกถอดออก', 'refund for removed mounts'));
    if (typeof banner === 'function') banner(L(`คืนเหรียญวายรา ◈${coins} · สัตว์ขี่แฟชั่นถูกถอดออกชั่วคราว`, `◈${coins} Vayra Coins refunded · fashion mounts are retired for now`));
    if (typeof log === 'function') log(L(`คืนเหรียญ ◈${coins}: ${names.map(escH).join(', ')}`, `Refunded ◈${coins}: ${names.map(escH).join(', ')}`), 'g'); }
  else if (ch && typeof accSave === 'function') accSave(true);
}
{ let t = 0; EV.on('tick', dt => { t -= dt || .016; if (t > 0) return; t = 3; mountGoneSweep(); }); }
