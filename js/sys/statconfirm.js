/* VAYRATHEN — js/sys/statconfirm.js — raising stats waits for a confirm
   Pressing + (tap or hold) no longer spends points straight away: the points go into a pending plan.
   The Status window shows each stat as "old → new", the points left after the plan, and every derived value that
   would change (ATK 52 → 61, ASPD …) worked out with the real formula. "ยืนยัน" spends the points and saves;
   "ยกเลิก" drops the plan. Nothing in the game uses the new stats until they are confirmed. */
'use strict';

const STP = {add:{}, spent:0};
const stpAny = () => STP.spent > 0;
const stpCost = k => statCost((S.stats[k] | 0) + (STP.add[k] || 0));
const stpCan = k => S && S.stats && k in S.stats && S.statPts - STP.spent >= stpCost(k) && (S.stats[k] | 0) + (STP.add[k] || 0) < STAT_CAP();
function stpClear(){ STP.add = {}; STP.spent = 0; }
let stpRaf = 0;
const stpRender = () => { if (stpRaf) return; stpRaf = requestAnimationFrame(() => { stpRaf = 0; renderPanel(); }); };
/* the + buttons (statup.js calls statInc for a tap and for every step of a hold) */
statInc = function(k){
  if (!stpCan(k)) return false;
  STP.spent += stpCost(k); STP.add[k] = (STP.add[k] || 0) + 1; stpRender();
  return true;
};
/* the derived numbers shown in the Status window, for the current stats or for the plan */
const stpRows = D => [['ATK', D.atk], ['MATK', D.matk], ['DEF', D.def], ['MDEF', D.mdef], ['HIT', D.hit], ['FLEE', D.flee], ['CRIT', D.crit + '%'], ['ASPD', `${D.aspd} (${D.interval.toFixed(2)}s)`], ['Cast', Math.round(D.castMul * 100) + '%'], ['Range', D.range], ['Max HP', D.maxhp], ['Max SP', D.maxsp]];
function stpPreview(){
  const keep = {...S.stats}, hp = S.hp, sp = S.sp, before = stpRows(DER);
  let after = before;
  try { for (const k in STP.add) S.stats[k] += STP.add[k]; derive(); after = stpRows(DER); }
  finally { S.stats = keep; derive(); S.hp = hp; S.sp = sp; }
  return before.map((r, i) => [r[0], r[1], after[i][1]]);
}
function stpConfirm(){
  if (!stpAny()) return;
  const rows = stpPreview().filter(r => String(r[1]) !== String(r[2])), ups = Object.keys(STP.add).filter(k => STP.add[k] > 0);
  if (S.statPts < STP.spent){ stpClear(); renderPanel(); return; }
  const was = {}; for (const k of ups) was[k] = S.stats[k];
  for (const k of ups) S.stats[k] += STP.add[k];
  S.statPts -= STP.spent; stpClear(); derive(); dirty = true; save();
  const st = ups.map(k => `${k.toUpperCase()} ${was[k]}→${S.stats[k]}`).join(' · '), dv = rows.slice(0, 4).map(r => `${r[0]} ${r[1]}→${r[2]}`).join(' · ');
  log(L(`อัพสเตตัส: ${st}${dv ? ` (${dv})` : ''}`, `Stats raised: ${st}${dv ? ` (${dv})` : ''}`), 'g');
  toast(L(`อัพสเตตัสแล้ว · ${st}`, `Stats raised · ${st}`)); if (typeof SFX !== 'undefined') try { SFX.play('ach'); } catch (e) {}
  renderPanel();
}
/* draw the plan over the normal Status window */
{
  const _rp = renderPanel;
  renderPanel = function(){
    _rp.apply(this, arguments);
    const pane = document.getElementById('pane-stat'); if (!pane || !S || !S.stats) return;
    if (STP.spent > S.statPts) stpClear();                       // points went away (a reset): drop the plan
    for (const b of pane.querySelectorAll('button[data-stat]')){
      const k = b.dataset.stat, n = STP.add[k] || 0, tr = b.closest('tr'); b.disabled = !stpCan(k);
      if (!tr) continue; tr.classList.toggle('stp-up', n > 0);
      const c = tr.querySelector('td.c'); if (c) c.textContent = `${L('ใช้', 'cost')} ${stpCost(k)}`;
      if (n > 0){ const v = tr.querySelector('td.v'), bon = DER.bonus[k];   // the whole cell is written again, so a redraw can never stack a second "old → new"
        if (v) v.innerHTML = `<span class="stp-new">${S.stats[k]} → <b>${S.stats[k] + n}</b></span>${bon ? `<em>+${bon}</em>` : ''}`; }
    }
    const pts = pane.querySelector('.pts b'); if (pts && stpAny()) pts.innerHTML = `${S.statPts} → <span class="stp-left">${S.statPts - STP.spent}</span>`;
    let bar = pane.querySelector('.stpbar'); if (bar) bar.remove();
    if (!stpAny()) return;
    const dl = pane.querySelector('dl.derived');
    if (dl) dl.innerHTML = stpPreview().map(([a, o, nw]) => { const ch = String(o) !== String(nw); return `<div class="${ch ? 'stp-ch' : ''}"><dt>${a}</dt><dd>${ch ? `${o} → <b>${nw}</b>` : o}</dd></div>`; }).join('');
    const tbl = pane.querySelector('table.stats');
    if (tbl) tbl.insertAdjacentHTML('afterend', `<div class="stpbar"><span>${L(`ใช้ ${STP.spent} แต้ม · ตรวจค่าที่เปลี่ยนด้านล่างก่อนยืนยัน`, `${STP.spent} points · check the changes below, then confirm`)}</span>
      <button class="btn" data-stpno="1">${L('ยกเลิก', 'Cancel')}</button><button class="btn gold" data-stpok="1">${L('ยืนยัน', 'Confirm')}</button></div>`);
  };
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-stpok],[data-stpno]'); if (!b) return;
  if (b.dataset.stpok) stpConfirm(); else { stpClear(); renderPanel(); }
});
{
  const st = document.createElement('style');
  st.textContent = `.stats tr.stp-up th,.stats tr.stp-up td.v{color:#9ff0c8}
    .stp-new{font-weight:600}.stp-new b{color:#7dffb0}
    .stp-left{color:#7dffb0}
    .stpbar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:8px 0;padding:8px;border-radius:9px;background:rgba(30,90,50,.28);border:1px solid rgba(80,220,140,.45)}
    .stpbar span{flex:1 1 160px;font-size:12px;color:#c8f5dc}
    dl.derived .stp-ch dt{color:#9ff0c8}dl.derived .stp-ch dd{color:#e8fff0}dl.derived .stp-ch dd b{color:#7dffb0}`;
  document.head.appendChild(st);
}
/* Enter/Space on a + button: also only plans the point (the old click path spent it at once) */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button[data-stat]'); if (!b || e.detail > 0) return; e.preventDefault(); e.stopPropagation(); if (!b.disabled) statInc(b.dataset.stat); }, true);
