/* VAYRATHEN — js/sys/wboss2.js — (v85) world boss extras
   · "Go to the boss": a button on the quest bar walks you to Rahu (after a warp it starts walking by itself)
   · damage ranking: everyone fighting shares their damage % in presence; the quest bar shows the top 5
   · top 3 when Rahu falls (at least 0.5% dealt) get extra Vayra Coins: 1st +8 · 2nd +5 · 3rd +3
   The ranking is rebuilt once a second with the quest bar, never per frame. */
'use strict';

const WB2 = {auto:false, rank:[]};
/* my share rides along with the boss HP in presence */
{ const _wp = wbPres; wbPres = () => ({..._wp(), wbd:WB.m && !WB.m.dead ? +WB.my.toFixed(4) : null}); }
function wbRank(){
  const out = [{n:netName(), d:WB.my, me:true}];
  if (NET.mapRoom) for (const p of NET.mapRoom.peers()){ const q = p.presence || {}; if (p.isMe || q.wbk !== WB.key || typeof q.wbd !== 'number') continue;
    out.push({n:clean(q.n, 18) || L('นักผจญภัย', 'Adventurer'), d:clamp(q.wbd, 0, 1)}); }
  return out.sort((a, b) => b.d - a.d);
}
function wbGo(){
  if (!WB.m || WB.m.dead) return; const a = Math.atan2(P.y - WB.m.y, P.x - WB.m.x), r = (WB.m.def.r || 30) + 60;
  P.target = null; P.npc = null; P.tx = clamp(WB.m.x + Math.cos(a) * r, 20, W - 20); P.ty = clamp(WB.m.y + Math.sin(a) * r, 30, H - 20); P.sit = false;
}
{ const _qt = questTracker; questTracker = function(){ let h = _qt(); const w = wbWindow();
    if (w && w.active && WB.m && !WB.m.dead && MAP_ID === wbMap(w.key)){
      if (Math.hypot(WB.m.x - P.x, WB.m.y - P.y) > 260) h = h.replace(/(<span class="wbline">[\s\S]*?)(<\/span>)(?![\s\S]*wbline)/, `$1 <button class="btn sm" data-wbgo>${L('ไปหาบอส', 'Go to boss')}</button>$2`);
      const rk = WB2.rank = wbRank(); if (rk.length > 1 || rk[0].d > 0)
        h += `<br><span class="wbrank">${rk.slice(0, 5).map((r, i) => `<i class="${r.me ? 'me' : ''}">${i + 1}. <span data-wbn="${i}"></span> ${(r.d * 100).toFixed(1)}%</i>`).join('')}</span>`;
    }
    return h; }; }
/* the names go in as text (never HTML) right after the quest bar is drawn */
{ const _rg = renderGoal; renderGoal = function(){ _rg(); document.querySelectorAll('#goal [data-wbn]').forEach(e => { const r = WB2.rank[+e.dataset.wbn]; e.textContent = r ? r.n : ''; }); }; }
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-wbgo]')) wbGo();
  if (e.target.closest && e.target.closest('[data-wbwarp]')) WB2.auto = true; }, true);
EV.on('tick', () => { if (WB2.auto && WB.m && !WB.m.dead && MAP_ID === wbMap(WB.key)){ WB2.auto = false; wbGo(); } });
/* top-3 bonus */
EV.on('wboss', () => { if (!wbEligible()) return; const i = WB2.rank.findIndex(r => r.me), b = [8, 5, 3][i];
  if (b && WB2.rank.length > 1){ coinAdd(b, L(`อันดับ ${i + 1} ดาเมจบอสโลก`, `world boss damage #${i + 1}`)); log(L(`ติดอันดับ ${i + 1} ดาเมจบอสโลก ได้ ◈ ${b}`, `World boss damage #${i + 1}: ◈ ${b}`), 'g'); } });
