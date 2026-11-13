/* VAYRATHEN — js/sys/gatewarn294.js — (v294) two small mercies
   · a gateway into a land far above your level asks first: «this land is Lv X–Y and you are Lv Z — go in?» (once per
     land per visit to the game; Auto never walks you in unasked). A new player who wanders into the Lv 250 whirlpool no
     longer dies the moment they arrive;
   · lying fallen with nobody pressing a button: after 3 minutes you wake in town by yourself (the sign shows the count),
     so leaving the game alone on the death sign no longer ends in an idle kick. */
'use strict';
const GWN = {gap:15, ok:{}, asking:false, wake:180};
const gwFar = to => { const mp = MAPS[to]; return !!(mp && to !== 0 && mp.lv && mp.lv[0] > (S.lvl || 1) + GWN.gap); };
{ const _cg = checkGates; checkGates = function(){
    if (GWN.asking || P.dead || P.roll || T < (P.gateLock || 0) || (typeof DG !== 'undefined' && DG.active)) return _cg.apply(this, arguments);
    const gt = GATES.find(g => Math.hypot(P.x - g.x, P.y - g.y) < 26);
    if (!gt || !gwFar(gt.to) || GWN.ok[gt.to]) return _cg.apply(this, arguments);
    // step back out of the gateway, then ask
    const d = Math.hypot(W / 2 - gt.x, H / 2 - gt.y) || 1; P.x = gt.x + (W / 2 - gt.x) / d * 60; P.y = gt.y + (H / 2 - gt.y) / d * 60; P.tx = null; P.nav = null; P.gateLock = T + 1.2;
    if (typeof BOT !== 'undefined' && BOT.on) return;   // Auto: never into a far land unasked
    const mp = MAPS[gt.to]; GWN.asking = true;
    askConfirm(L('⚠ ดินแดนอันตราย', '⚠ A dangerous land'),
      L(`${nm(mp)} เป็นดินแดน Lv ${mp.lv[0]}–${mp.lv[1]} · ตอนนี้คุณ Lv ${S.lvl} มอนเตอร์ที่นั่นแรงกว่าคุณมาก จะเข้าไปไหม?`, `${nm(mp)} is a Lv ${mp.lv[0]}–${mp.lv[1]} land and you are Lv ${S.lvl}. Its monsters are far stronger than you. Go in?`),
      L('เข้าไป', 'Go in'), () => { GWN.ok[gt.to] = 1; travel(gt.to, MAP_ID); });
    const c = el('confirm'); if (c){ const _oc = c.onclick; c.onclick = e => { if (e.target.closest('[data-cf]')) GWN.asking = false; return _oc && _oc(e); }; }
  }; }

/* waking in town by yourself after lying fallen for 3 minutes */
EV.on('tick', () => {
  if (!S || !P.dead || typeof DTH === 'undefined' || !DTH.shown || (typeof dthTower === 'function' && dthTower())){ GWN.fell = 0; const a = el('dthAuto'); if (a) a.textContent = ''; return; }
  const now = Date.now(); if (!GWN.fell) GWN.fell = now;
  const left = Math.max(0, Math.ceil(GWN.wake - (now - GWN.fell) / 1000)), card = document.querySelector('#dth .dthcard');
  let a = el('dthAuto'); if (!a && card){ a = document.createElement('p'); a.id = 'dthAuto'; a.style.cssText = 'position:relative;z-index:2;margin:10px 0 0;font:600 12px/1.2 var(--thai),sans-serif;color:#7a5a3a;opacity:.85'; card.appendChild(a); }
  if (a){ const t = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; const s = L(`จะฟื้นที่เมืองเองใน ${t}`, `You will wake in town by yourself in ${t}`); if (a.textContent !== s) a.textContent = s; }
  if (left <= 0){ GWN.fell = 0; if (typeof dthTown === 'function') dthTown(); }
});
