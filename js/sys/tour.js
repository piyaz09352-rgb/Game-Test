/* VAYRATHEN — js/sys/tour.js — "Getting to know Aren" (ทำความรู้จักนครอาเรน)
   A checklist at the top of the quest window (J): talk once to each townsperson. Each first visit pays 100 Bia;
   meeting everyone pays 1,000 Bia and 3 Vayra Coins. "Take me there" walks you to the NPC (in Aren), and a gold
   arrow at the screen's edge points the way to the next one on the list. */
'use strict';

const TOUR = [
  ['job', 'เปลี่ยนอาชีพ เควสต์หลัก', 'Job change, main quest'], ['shop', 'ยา ตีบวกอาวุธ', 'Potions, refining'], ['trader', 'รับซื้อของ', 'Buys your loot'],
  ['boatman', 'วาร์ปไปแคว้นที่เคยไป', 'Warps to known regions'], ['tailor', 'ชุดแฟชั่น ปีก', 'Costumes, wings'],
  ['forger', 'หลอมของ แยกชิ้นส่วน', 'Crafting, salvage'], ['banker', 'คลังบัญชี', 'Account bank'], ['registrar', 'ตั้งกิลด์', 'Guilds'], ['teller', 'เนื้อเรื่องเสริม', 'Side story'],
  ['gatekeeper', 'ดันเจี้ยนปาร์ตี้', 'Party dungeons'], ['festival', 'เทศกาล ชุดลิมิเต็ด', 'Festivals'], ['general', 'สงครามปราสาท', 'Castle siege']
];
const tourS = () => (S.tour = S.tour || {v:{}, done:0});
const tourLeft = () => TOUR.filter(([id]) => !tourS().v[id] && NPCS_HOME.some(n => n.id === id));
EV.on('npc', id => {
  if (MAP_ID !== 0 || !TOUR.some(t => t[0] === id)) return; const t = tourS(); if (t.v[id]) return;
  t.v[id] = 1; S.bia += 100; addText(P.x, P.y - 60, L('+100 เบี้ย · รู้จักแล้ว', '+100 Bia · met'), '#ffe08a', 12);
  if (!tourLeft().length && !t.done){ t.done = 1; S.bia += 1000; if (typeof coinAdd === 'function') coinAdd(3, L('รู้จักทุกคนในอาเรน', 'Met everyone in Aren'));
    banner(L('รู้จักทุกคนในนครอาเรนแล้ว! +1,000 เบี้ย', 'You know everyone in Aren! +1,000 Bia')); SFX.play('quest'); }
  dirty = true; if (typeof reWin === 'function') reWin('quest');
});
function tourHTML(){
  const t = tourS(); if (t.done) return ''; const all = TOUR.filter(([id]) => NPCS_HOME.some(n => n.id === id)), got = all.filter(([id]) => t.v[id]).length;
  return `<div class="tourbox"><div class="sec">${L('ทำความรู้จักนครอาเรน', 'Getting to know Aren')} <span class="ct">${got}/${all.length}</span></div>
    <div class="tourlist">${all.map(([id, th, en]) => { const n = NPCS_HOME.find(x => x.id === id), ok = t.v[id];
      return `<div class="tourit${ok ? ' ok' : ''}"><i>${ok ? '✓' : '·'}</i><div><b>${n ? nm(n) : id}</b><small>${L(th, en)}</small></div>${ok ? '' : `<button class="btn sm" data-tourgo="${id}">${L('พาไป', 'Go')}</button>`}</div>`; }).join('')}</div>
    <p class="hint">${L('คุยครั้งแรกได้ 100 เบี้ย · ครบทุกคน +1,000 เบี้ย และ 3 เหรียญวายรา', 'First talk: 100 Bia each · everyone: +1,000 Bia and 3 Vayra Coins')}</p></div>`;
}
{ const _rq = renderQuestLog; renderQuestLog = function(){ _rq(); const pane = el('pane-quest'); if (pane && !tourS().done) pane.insertAdjacentHTML('afterbegin', tourHTML()); }; }
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-tourgo]'); if (!b) return; const id = b.dataset.tourgo;
  if (MAP_ID !== 0){ toast(L('กลับนครอาเรนก่อน (ยันต์กลับบ้าน หรือผู้เฝ้าศาล)', 'Go back to Aren first (Return Talisman or the shrine keeper)')); return; }
  const n = NPCS.find(x => x.id === id); if (!n) return; TOUR.goal = id; P.npc = n; P.target = null; P.tx = null; if (typeof closeWin === 'function') closeWin('quest');
});
/* the edge arrow toward the next person to meet (only in Aren, only while the tour is open) */
EV.on('draw', () => {
  if (MAP_ID !== 0 || !S || tourS().done || !inVillage(P)) return; const left = tourLeft(); if (!left.length) return;
  const id = TOUR.goal && left.some(t => t[0] === TOUR.goal) ? TOUR.goal : left[0][0], n = NPCS.find(x => x.id === id); if (!n || dist(n, P) < 70) return;
  const x = sx(n.x), y = sy(n.y - 70), z = typeof TAG_Z === 'function' ? TAG_Z() : 1, on = x > 30 && x < SW - 30 && y > 30 && y < SH - 30;
  ctx.save(); ctx.fillStyle = '#ffd34a'; ctx.strokeStyle = 'rgba(60,30,0,.9)'; ctx.lineWidth = 1.5;
  if (on){ const bob = Math.abs(Math.sin(T * 4)) * 6 * z; ctx.translate(x, y - bob); ctx.scale(z, z); ctx.beginPath(); ctx.moveTo(-7, -12); ctx.lineTo(7, -12); ctx.lineTo(7, -4); ctx.lineTo(12, -4); ctx.lineTo(0, 8); ctx.lineTo(-12, -4); ctx.lineTo(-7, -4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  else { const cx = SW / 2, cy = SH / 2, a = Math.atan2(y - cy, x - cx), r = Math.min(SW, SH) * .42; ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.rotate(a); ctx.scale(z, z); ctx.globalAlpha = .85 + Math.sin(T * 5) * .15;
    ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -10); ctx.lineTo(-3, 0); ctx.lineTo(-8, 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.rotate(-a); ctx.font = '700 10px Mali, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff2c8'; ctx.fillText(n.name, 0, 22); }
  ctx.restore();
});
