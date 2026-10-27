/* VAYRATHEN — js/sys/kicklist.js — the GM's removal list (v27)
   Some heroes linger on the server as "ghosts" (a tab left open on another device, an old version without the AFK
   kick). They are live presences, not database rows, so there is nothing to delete — instead the GM keeps a list of
   character names in db server/kick {names:[…]} (only the artifact owner can write it):
   · a game whose hero is on the list leaves the map room at once and goes back to the title, with a message;
   · every other game hides those names (no ghost on the map, not counted for the world clock or monsters).
   GM window → "ลบผู้เล่นค้าง" to add or remove names. */
'use strict';

const KICK = {names:new Set(), unsub:null, done:false};
const kickKey = n => String(n || '').trim().toLowerCase();
const kickHas = n => KICK.names.has(kickKey(n));
EV.on('netready', () => {
  if (!NET.db || KICK.unsub) return;
  try { KICK.unsub = NET.db.doc('server/kick').onSnapshot(s => { const v = s && s.exists ? s.data() : {}; KICK.names = new Set((Array.isArray(v.names) ? v.names : []).filter(x => typeof x === 'string').slice(0, 200).map(kickKey)); if (typeof reWin === 'function') reWin('gm'); }, () => {}); } catch (e) {}
});
EV.on('tick', () => {
  if (!KICK.names.size || typeof NET === 'undefined') return;
  // others on the list: never drawn, never counted
  for (const [k, g] of NET.ghosts) if (g.q && kickHas(g.q.n)) NET.ghosts.delete(k);
  // me on the list: leave the server
  if (!KICK.done && NET.mapRoom && S && S.lvl && kickHas(netName()) && !(typeof GM !== 'undefined' && GM.on)){
    KICK.done = true;
    try { if (typeof save === 'function') save(); } catch (e) {}
    try { NET.mapRoom.leave().catch(() => {}); NET.mapRoom = null; NET.mapName = ''; NET.ghosts.clear(); } catch (e) {}
    try { if (typeof WIN_IDS !== 'undefined') for (const w of WIN_IDS) closeWin(w); if (!PAUSED) showTitle(); } catch (e) {}
    toast(L('ตัวละครนี้ถูกผู้ดูแลนำออกจากเซิร์ฟเวอร์ · ใช้ตัวละครอื่นหรือติดต่อผู้ดูแล', 'This hero was removed from the server by the GM · use another hero or contact the GM'));
  }
  if (KICK.done && !kickHas(netName())) KICK.done = false;
});
/* (netmob.js's nmPeers skips listed heroes too, so they never count for the world clock or the monsters) */
/* GM window: manage the list */
if (typeof WIN_RENDER !== 'undefined' && WIN_RENDER.gm){ const _g = WIN_RENDER.gm;
  WIN_RENDER.gm = function(){ const r = _g.apply(this, arguments); const pane = el('pane-gm'); if (!pane || pane.querySelector('#kickBox')) return r;
    pane.insertAdjacentHTML('beforeend', `<div class="sec" id="kickBox">${L('ลบผู้เล่นค้าง (ผีในเซิร์ฟ)', 'Remove lingering heroes')}</div>
      <div class="row gmrow"><input id="kickName" maxlength="18" placeholder="${L('ชื่อตัวละคร', 'Hero name')}"><button class="btn sm danger" data-kick="add">${L('นำออก', 'Remove')}</button></div>
      <div class="row gmrow" style="flex-wrap:wrap;gap:4px">${[...KICK.names].map(n => `<button class="btn sm" data-kick="del" data-kn="${escH(n)}">${escH(n)} ✕</button>`).join('') || `<small>${L('ยังไม่มี', 'none')}</small>`}</div>`);
    return r; }; }
async function kickSave(list){ if (!NET.db) return toast(L('ต้องออนไลน์', 'Go online first'));
  try { await NET.db.doc('server/kick').set({names:[...new Set(list.map(kickKey).filter(Boolean))].slice(0, 200), at:Date.now()}); toast(L('บันทึกแล้ว', 'Saved')); } catch (e) { toast(L('บันทึกไม่ได้ (ต้องเป็นเจ้าของเกม)', 'Could not save (owner only)')); } }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-kick]'); if (!b) return;
  if (b.dataset.kick === 'add'){ const v = (el('kickName') || {}).value; if (v && v.trim()) kickSave([...KICK.names, v]); }
  else kickSave([...KICK.names].filter(n => n !== b.dataset.kn)); });
