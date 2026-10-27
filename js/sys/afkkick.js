/* VAYRATHEN — js/sys/afkkick.js — a hero who does nothing for 5 minutes is sent out of the server
   "Nothing" = no key / click / tap, the character did not move, and no EXP or money came in (so Auto hunting, even
   standing in one spot, counts as playing). Online only; the GM is exempt. 30 s before, a warning shows; any action
   cancels it. Then: save everything (browser + cloud), leave the map room (the others stop seeing the hero), and on
   a Firebase site sign out and return to the log-in screen. A hero stuck on the map for good can no longer happen. */
'use strict';
const AFK = {limit:300, warn:30, last:Date.now(), sig:'', warned:false, kicked:false};
const afkPing = () => { AFK.last = Date.now(); if (AFK.warned){ AFK.warned = false; try { const b = document.getElementById('afkWarn'); if (b) b.remove(); } catch (e) {} } };
for (const ev of ['keydown', 'pointerdown', 'touchstart', 'wheel']) window.addEventListener(ev, afkPing, {capture:true, passive:true});
const afkOnline = () => typeof NET !== 'undefined' && !!NET.room && !!NET.ready;
function afkSig(){ return `${Math.round(P.x / 8)},${Math.round(P.y / 8)},${S.exp},${S.jexp},${S.bia},${MAP_ID}`; }
function afkWarnBox(sec){
  let b = document.getElementById('afkWarn');
  if (!b){ b = document.createElement('div'); b.id = 'afkWarn'; b.setAttribute('role', 'alert');
    b.style.cssText = 'position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:99999;padding:12px 22px;border-radius:12px;background:rgba(40,12,8,.94);border:1px solid #e3b04b;color:#ffe7a0;font:700 15px Mali,sans-serif;text-align:center;box-shadow:0 6px 30px rgba(0,0,0,.6);pointer-events:none';
    document.body.appendChild(b); }
  b.textContent = L(`ไม่มีการเคลื่อนไหว · จะออกจากเซิร์ฟเวอร์ใน ${sec} วินาที (กดอะไรก็ได้เพื่ออยู่ต่อ)`, `No activity · leaving the server in ${sec}s (press anything to stay)`);
}
async function afkKick(){
  if (AFK.kicked) return; AFK.kicked = true;
  try { const b = document.getElementById('afkWarn'); if (b) b.remove(); } catch (e) {}
  try { sessionStorage.setItem('vay-afk', '1'); } catch (e) {}
  try { if (typeof save === 'function') save(); if (typeof accSave === 'function') accSave(true); if (typeof cloudSave === 'function') cloudSave(true); } catch (e) {}
  if (typeof authFbOn === 'function' && authFbOn() && typeof authLogout === 'function'){ await authLogout(); return; }   // Firebase site: save, sign out, reload to the log-in
  if (!PAUSED){ if (typeof WIN_IDS !== 'undefined') for (const w of WIN_IDS) try { closeWin(w); } catch (e) {} showTitle(); }   // claude.ai: back to the title
  try { if (NET.mapRoom) NET.mapRoom.leave().catch(() => {}); NET.mapRoom = null; NET.mapName = ''; NET.ghosts.clear(); } catch (e) {}
  toast(L('ออกจากเซิร์ฟเวอร์เพราะไม่มีการเคลื่อนไหว 5 นาที', 'Removed from the server after 5 minutes of no activity'));
  AFK.kicked = false; afkPing();
}
function afkCheck(){
  if (PAUSED || AFK.kicked || !afkOnline() || (typeof GM !== 'undefined' && GM.on)){ if (PAUSED || !afkOnline()) afkPing(); return; }
  const sg = afkSig(); if (sg !== AFK.sig){ AFK.sig = sg; afkPing(); return; }
  const idle = (Date.now() - AFK.last) / 1000;
  if (idle >= AFK.limit) afkKick();
  else if (idle >= AFK.limit - AFK.warn){ AFK.warned = true; afkWarnBox(Math.max(1, Math.ceil(AFK.limit - idle))); }
}
setInterval(() => { try { afkCheck(); } catch (e) {} }, 1000);
document.addEventListener('visibilitychange', () => { try { afkCheck(); } catch (e) {} });
try { if (sessionStorage.getItem('vay-afk')){ sessionStorage.removeItem('vay-afk'); setTimeout(() => { try { toast(L('คุณถูกออกจากเซิร์ฟเวอร์เพราะไม่มีการเคลื่อนไหว 5 นาที', 'You were removed from the server after 5 minutes of no activity')); } catch (e) {} }, 2500); } } catch (e) {}
