/* VAYRATHEN — js/sys/newver.js — (v186) "a new version is out": players with the game open are told to reload
   After a new upload, whoever still has the old page open keeps playing the old game (and the online code of two
   versions may not understand each other). The version is read from the page itself (the highest ?v= of its scripts),
   so nothing has to be kept by hand. A newer version is noticed two ways:
   · another online player's lobby line carries their version (gv): a higher one means a newer game is out
   · the GM's game writes server/version {v} when it is newer than what is stored; every game listens to that one
     document (one read when it changes)
   Then a banner at the top says so, with a button that reloads the page (saving first). */
'use strict';

const GAMEV = (() => { let v = 0; for (const s of document.scripts){ const m = /[?&]v=(\d+)/.exec(s.src || ''); if (m) v = Math.max(v, +m[1]); } return v; })();
const NV = {seen:0, shown:false, t:0, sub:null};
function nvShow(v){
  if (!GAMEV || !(v > GAMEV) || NV.shown) return; NV.shown = true; NV.seen = v;
  const b = document.createElement('div'); b.id = 'nvBar';
  b.innerHTML = `<span>✨ ${L(`มีเกมเวอร์ชันใหม่แล้ว (v${v}) · คุณยังเล่น v${GAMEV} อยู่`, `A new version is out (v${v}) · you are on v${GAMEV}`)}</span><button class="btn sm gold" id="nvGo">${L('โหลดเวอร์ชันใหม่', 'Load it')}</button><button class="ibtn" id="nvX" aria-label="${L('ปิด', 'Close')}">✕</button>`;
  document.body.appendChild(b);
  el('nvX').onclick = () => b.remove();
  el('nvGo').onclick = () => {
    try { if (typeof save === 'function' && S && S.lvl) save(); } catch (e) {}
    // on itch.io the game runs in a frame whose address belongs to one upload: reload the whole page (the game's own page)
    setTimeout(() => { try { if (window.top !== window && document.referrer){ window.top.location.href = document.referrer; return; } } catch (e) {}
      try { location.reload(); } catch (e) {} }, 300);
    el('nvGo').textContent = L('กำลังโหลด… (ถ้าไม่ขึ้น กด F5)', 'Loading… (if nothing happens, press F5)');
  };
}
{ const st = document.createElement('style');
  st.textContent = `#nvBar{position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:9000;display:flex;align-items:center;gap:10px;padding:8px 10px 8px 16px;border-radius:14px;
    background:linear-gradient(#fff9e6,#ffeec2);border:2px solid #e3b04b;box-shadow:0 4px 14px rgba(0,0,0,.25);font:600 14px var(--display,sans-serif);color:#5a3d12;max-width:calc(100vw - 24px)}
    #nvBar span{line-height:1.3}#nvBar .ibtn{width:28px;height:28px}`;
  document.head.appendChild(st); }
/* other players' versions (lobby lines) */
EV.on('tick', dt => {
  if (NV.shown || !GAMEV || (NV.t += dt) < 5) return; NV.t = 0;
  if (typeof NET === 'undefined' || !NET.room || typeof NET.room.peers !== 'function') return;
  let hi = 0; for (const p of NET.room.peers()){ const v = p && !p.isMe && p.presence && +p.presence.gv; if (v > hi && v < GAMEV + 50) hi = v; }
  if (hi > GAMEV) nvShow(hi);
});
/* the server's record of the newest version: the GM's game raises it, everyone listens */
EV.on('netready', () => {
  if (!NET.db || NV.sub || !GAMEV) return;
  try { NV.sub = NET.db.doc('server/version').onSnapshot(s => { const v = s && s.exists ? +(s.data() || {}).v : 0; if (v > GAMEV && v < GAMEV + 50) nvShow(v); }, () => {}); } catch (e) {}
  setTimeout(async () => { try { if (typeof GM === 'undefined' || !GM.on) return;
    const d = await NET.db.doc('server/version').get(), v = d.exists ? +(d.data() || {}).v || 0 : 0;
    if (GAMEV > v) await NET.db.doc('server/version').set({v:GAMEV, at:Date.now(), by:NET.uid}); } catch (e) {} }, 8000);
});
