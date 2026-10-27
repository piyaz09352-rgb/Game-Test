/* VAYRATHEN — js/sys/resetpts.js — free reset of Stat Points and Skill Points
   A "รีเซต" button in the Status window gives back every Stat Point you placed (each stat back to 1, the full cost
   refunded) and one in the Skill window gives back every Skill Point (all skills back to 0, hotbar skill slots
   cleared). Free, any time, with a confirm first. */
'use strict';

function resetStats(){
  let back = 0;
  for (const k in S.stats){ for (let v = 1; v < (S.stats[k] | 0); v++) back += statCost(v); S.stats[k] = 1; }
  S.statPts += back; if (typeof STP !== 'undefined' && typeof stpClear === 'function') stpClear();
  derive(); S.hp = Math.min(S.hp, DER.maxhp); S.sp = Math.min(S.sp, DER.maxsp); dirty = true; save(); renderPanel();
  toast(L(`รีเซตสเตตัสแล้ว ได้คืน ${back} แต้ม`, `Stats reset: ${back} points back`));
}
function resetSkills(){
  let back = 0; for (const id in S.skills) back += S.skills[id] | 0;
  S.skills = {}; for (const k in SKP) delete SKP[k]; S.skPts += back;
  S.hot = (S.hot || []).map(h => (h && SKILLS[h] ? null : h));
  if (typeof SUMMONS !== 'undefined') SUMMONS.length = 0;
  P.buffs = P.buffs || {}; for (const k in P.buffs) if (SKILLS[k]) delete P.buffs[k];
  derive(); dirty = true; save(); renderPanel(); if (typeof renderHotbar === 'function') renderHotbar(); if (typeof renderBuffs === 'function') renderBuffs();
  toast(L(`รีเซตสกิลแล้ว ได้คืน ${back} แต้ม`, `Skills reset: ${back} points back`));
}
const rpAsk = (kind) => askConfirm(kind === 'stat' ? L('รีเซตสเตตัส', 'Reset stats') : L('รีเซตสกิล', 'Reset skills'),
  kind === 'stat' ? L('คืน Stat Point ทั้งหมด ทุกค่ากลับเป็น 1 · ฟรี', 'Every Stat Point comes back, every stat goes back to 1 · free')
    : L('คืน Skill Point ทั้งหมด สกิลทุกตัวกลับเป็น 0 และช่องสกิลในแถบลัดถูกล้าง · ฟรี', 'Every Skill Point comes back, every skill goes back to 0 and skill hotbar slots are cleared · free'),
  L('รีเซต', 'Reset'), kind === 'stat' ? resetStats : resetSkills);
{ const _rp = renderPanel;
  renderPanel = function(){ const r = _rp.apply(this, arguments);
    const pts = document.querySelector('#pane-stat .pts'); if (pts && !pts.querySelector('[data-rpreset]')) pts.insertAdjacentHTML('beforeend', `<button class="btn sm rpbtn" data-rpreset="stat" title="${L('รีเซตสเตตัส (ฟรี)', 'Reset stats (free)')}">↺ ${L('รีเซต', 'Reset')}</button>`);
    const sp = document.querySelector('#pane-skill .sktop .pts'); if (sp && !sp.querySelector('[data-rpreset]')) sp.insertAdjacentHTML('beforeend', `<button class="btn sm rpbtn" data-rpreset="skill" title="${L('รีเซตสกิล (ฟรี)', 'Reset skills (free)')}">↺ ${L('รีเซต', 'Reset')}</button>`);
    return r; };
}
{ const _rs = renderSkills;
  renderSkills = function(){ const r = _rs.apply(this, arguments);
    const sp = document.querySelector('#pane-skill .sktop .pts'); if (sp && !sp.querySelector('[data-rpreset]')) sp.insertAdjacentHTML('beforeend', `<button class="btn sm rpbtn" data-rpreset="skill" title="${L('รีเซตสกิล (ฟรี)', 'Reset skills (free)')}">↺ ${L('รีเซต', 'Reset')}</button>`);
    return r; };
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-rpreset]'); if (!b) return; e.stopPropagation(); rpAsk(b.dataset.rpreset); });
{ const st = document.createElement('style'); st.textContent = '.pts .rpbtn{margin-left:auto;padding:3px 9px;font-size:12px;min-height:0}.pts{display:flex;align-items:center;gap:8px}'; document.head.appendChild(st); }
