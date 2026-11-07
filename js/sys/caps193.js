/* VAYRATHEN — js/sys/caps193.js — (v193) ceilings that grow with your level
   The owner found gear and cards could push stats past anything useful long before the end game: critical chance
   to 70%+, attack speed at its one ceiling (190) by mid game, unlimited range and move speed. Every one now has a
   ceiling by Base Lv; what goes past it does nothing, and the Status window says which stats sit at their ceiling.
     CRIT 15% + Lv × 0.3 (Lv 40 = 27% · Lv 80 = 39% · Lv 120 = 50%, never more than 50%)
     ASPD 160 + Lv × 0.25 (Lv 40 = 170 · Lv 80 = 180 · Lv 120 = 190)
     range: your class's own reach + 200 · move speed: up to +30% (Lv × 0.25%)
     cooldown −30% · damage taken −50% · critical damage ×2.5 · haste from passives +30% at most */
'use strict';
const CAP193 = {
  crit:lv => Math.min(50, 15 + lv * .3), aspd:lv => Math.min(ASPD_CAP, 160 + lv * .25), rangePlus:200,
  move:lv => 1 + Math.min(.3, lv * .0025), cdr:.3, dmgRed:.5, critDmg:2.5, aspdPct:.3};
function capsApply(fresh){
  if (!DER || !S) return; const lv = S.lvl || 1, out = fresh || !DER.capped ? {} : DER.capped, j = JOBS[S.job] || {};
  const cap = (k, v, c, set) => { if (v > c + 1e-9){ out[k] = [v, c]; set(c); } };
  cap('crit', DER.crit, CAP193.crit(lv), c => DER.crit = +c.toFixed(1));
  cap('aspd', DER.aspd, CAP193.aspd(lv), c => DER.aspd = Math.floor(c));
  if (DER.range != null && j.range) cap('range', DER.range, j.range + CAP193.rangePlus, c => DER.range = c);
  if (DER.move) cap('move', DER.move, CAP193.move(lv), c => DER.move = c);
  if (DER.critDmg) cap('critDmg', DER.critDmg, CAP193.critDmg, c => DER.critDmg = c);
  const pas = DER.pas || {};
  if (pas.cdr) cap('cdr', pas.cdr, CAP193.cdr, c => pas.cdr = c);
  if (pas.dmgRed) cap('dmgRed', pas.dmgRed, CAP193.dmgRed, c => pas.dmgRed = c);
  if (pas.aspdPct) cap('aspdPct', pas.aspdPct, CAP193.aspdPct, c => pas.aspdPct = c);   // speed from passives on top of ASPD
  DER.capped = out;
}
/* ASPD sets the attack interval: keep the interval in step with a capped ASPD. Some add-ons raise ASPD after derive
   (a weapon kind's own speed), so the ceiling is laid again on every game tick and before the Status window draws */
function capsNow(fresh){ if (!DER) return; const a0 = DER.aspd; capsApply(fresh === true);
  if (a0 && DER.aspd < a0 && DER.interval) DER.interval = +(DER.interval * (200 - DER.aspd) / Math.max(1, 200 - a0)).toFixed(3); }
{ const _d = derive; derive = function(){ const r = _d.apply(this, arguments); capsNow(true); return r; }; }
EV.on('tick', () => capsNow());
/* the Status window: a line under the stats naming what sits at its ceiling */
const CAP_NM = {crit:['คริ', 'CRIT'], aspd:['ASPD', 'ASPD'], range:['ระยะ', 'Range'], move:['ความเร็วเดิน', 'Move'], critDmg:['แรงคริ', 'Crit dmg'], cdr:['ลดคูลดาวน์', 'Cooldown −'], dmgRed:['ลดดาเมจรับ', 'Damage taken −'], aspdPct:['ตีเร็วจากสกิล', 'Skill haste']};
const capFmt = (k, v) => (k === 'move' ? '+' + Math.round((v - 1) * 100) + '%' : k === 'critDmg' ? '×' + v.toFixed(2) : k === 'cdr' || k === 'dmgRed' || k === 'aspdPct' ? Math.round(v * 100) + '%' : k === 'crit' ? v.toFixed(1) + '%' : String(Math.round(v)));
{ const _rp = renderPanel; renderPanel = function(){ capsNow(); const r = _rp.apply(this, arguments);
    try { const pane = el('pane-stat'); if (pane && DER){ let box = pane.querySelector('.capbox'); if (!box){ box = document.createElement('div'); box.className = 'capbox'; pane.appendChild(box); }
      const lv = S.lvl || 1, c = DER.capped || {}, ks = Object.keys(c);
      box.innerHTML = `<b>${L('เพดานตาม Lv', 'Ceilings for your Lv')} ${lv}</b> <small>${L('คริ', 'CRIT')} ${capFmt('crit', CAP193.crit(lv))} · ASPD ${Math.floor(CAP193.aspd(lv))} · ${L('เดิน', 'Move')} ${capFmt('move', CAP193.move(lv))}</small>`
        + (ks.length ? `<div class="capat">${ks.map(k => `<span>${L(...CAP_NM[k])} ${capFmt(k, c[k][1])} <i>(${L('ส่วนเกิน', 'over')} ${capFmt(k, c[k][0])} ${L('ไม่มีผล', 'wasted')})</i></span>`).join('')}</div>` : ''); } } catch (e) {}
    return r; }; }
{ const st = document.createElement('style'); st.textContent = `#pane-stat .capbox{margin-top:8px;padding:6px 8px;border-radius:9px;background:rgba(0,0,0,.06);border:1px dashed #d8b06a;font:600 12px var(--thai,sans-serif)}
#pane-stat .capbox small{display:block;font-weight:500;opacity:.85}#pane-stat .capat span{display:block;color:#a8401c;font-weight:700}#pane-stat .capat i{font-style:normal;font-weight:500;opacity:.8}`; document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'caps193', t:['เพดานค่าสถานะ', 'Stat ceilings'], b:() => L(
  '<p>ค่าสถานะบางอย่างมีเพดานตามเลเวล ส่วนที่เกินไม่มีผล (ดูได้ในหน้าต่างสถานะ)</p><p>คริ 15% + Lv × 0.3 (สูงสุด 50%) · ASPD 160 + Lv × 0.25 (สูงสุด 190) · ระยะ = ระยะอาชีพ + 200 · ความเร็วเดิน +Lv × 0.25% (สูงสุด +30%) · ลดคูลดาวน์ 30% · ลดดาเมจรับ 50% · แรงคริ ×2.5</p>',
  '<p>Some stats have a ceiling by level; anything past it does nothing (see the Status window)</p><p>CRIT 15% + Lv × 0.3 (50% max) · ASPD 160 + Lv × 0.25 (190 max) · range = class reach + 200 · move +Lv × 0.25% (+30% max) · cooldown −30% · damage taken −50% · crit damage ×2.5</p>')});
