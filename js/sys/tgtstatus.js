/* VAYRATHEN — js/sys/tgtstatus.js — the target frame (boss or monster) lists what the target is suffering from right now
   Short English tags with the seconds left, coloured by kind: STUN · FROZEN · SLEEP · ROOT · SLOW · SHOCK · POISON · BURN ·
   WET (Wind +30%) · MDEF↓ (magic +25%) · DEF↓ · ATK↓ · TAUNTED, and for bosses their mood: PHASE n · RAGE / RAMPAGE.
   Bosses shrug off control effects (stun, freeze, sleep…), so a boss shows "CC IMMUNE" as a reminder. */
'use strict';

const TS_KIND = {stun:['STUN', '#ffd56a'], freeze:['FROZEN', '#bff0ff'], stop:['SLEEP', '#d8c8ff'], root:['ROOT', '#b6e07a'], slow:['SLOW', '#8ab8ff'], shock:['SHOCK', '#fff27a'],
  poison:['POISON', '#7fe05a'], defDown:['DEF↓', '#ffb070'], atkDown:['ATK↓', '#ff9a8f']};
function tsChips(m){
  const out = [], s = m.st || {}, sec = v => (v > 0 && v < 99 ? ` ${v.toFixed(1)}s` : '');
  for (const k in TS_KIND) if (s[k] > 0) out.push([TS_KIND[k][0] + sec(s[k]), TS_KIND[k][1]]);
  if (m.burnT > T) out.push(['BURN' + sec(m.burnT - T), '#ff8a3a']);
  if (m.wetT > T) out.push(['WET' + sec(m.wetT - T), '#7ac8ff']);
  if (m.mdefT > T) out.push(['MDEF↓' + sec(m.mdefT - T), '#c9a0ff']);
  if (m.taunt > 0) out.push(['TAUNTED', '#ffcf6a']);
  if (m.def.boss){ const F = m.fz || {};
    if (F.phase > 1) out.push([`PHASE ${F.phase}`, '#ff7a7a']);
    if (F.berserk > 0) out.push(['RAMPAGE', '#ff4a4a']); else if (m.enraged) out.push(['RAGE', '#ff6a5a']);
    out.push(['CC IMMUNE', '#a39cb8']); }
  return out;
}
{ const _ut = updTarget;
  updTarget = function(){ const r = _ut.apply(this, arguments); const m = P.target, box = el('target'); if (!box || !m || m.dead) return r;
    let row = el('tSt'); if (!row){ const meta = el('tMeta'); if (!meta) return r; meta.insertAdjacentHTML('afterend', '<div id="tSt" class="tst"></div>'); row = el('tSt'); }
    if (T - (row._t || -9) < .2 && row._m === m) return r; row._t = T; row._m = m;
    const html = tsChips(m).map(([t, c]) => `<i style="--c:${c}">${t}</i>`).join(''); if (row.innerHTML !== html) row.innerHTML = html; row.hidden = !html;
    return r; }; }
{ const st = document.createElement('style');
  st.textContent = `.tst{display:flex;flex-wrap:wrap;gap:3px;margin-top:3px}.tst[hidden]{display:none}
  .tst i{font:700 10px/1.4 var(--display,sans-serif);font-style:normal;letter-spacing:.02em;color:#10203c;background:var(--c);border:1.5px solid #fff;border-radius:7px;padding:0 5px;box-shadow:0 1px 0 rgba(0,0,0,.25)}`;
  document.head.appendChild(st); }
