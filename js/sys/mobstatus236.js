/* VAYRATHEN — js/sys/mobstatus236.js — (v236) see what a monster is suffering from
   The owner: a player wants to know which statuses a monster has after being hit by attacks that carry them, and a
   tap on the monster's name tag did nothing. Now:
   · a tap / click on a monster's name tag (or the space just above its head) picks it as the target, like a tap on it;
   · the target card lists every status on the monster as coloured chips with the seconds left (stun, freeze, time
     stop, root, slow, poison, burn, bleed, armour break, weakened, shock, curse, blind, charm, fear), live;
   · the statuses also show as small coloured dots under the name tag of every monster that has one, so you see
     them in a crowd too. Bosses are immune (unchanged) and show «ต้านทาน». */
'use strict';
const MSX = {   // key → [th, en, colour, icon]
  stun:['มึนงง', 'Stunned', '#ffd34a', '✶'], freeze:['แช่แข็ง', 'Frozen', '#8adcff', '❄'], stop:['หยุดเวลา', 'Time-stopped', '#c8b8ff', '⏸'],
  root:['ตรึง', 'Rooted', '#c8a060', '⚓'], slow:['เชื่องช้า', 'Slowed', '#8ab8ff', '🐢'], poison:['พิษ', 'Poisoned', '#7fe05a', '☠'],
  burn:['ไฟลวก', 'Burning', '#ff8a3a', '🔥'], bleed:['เลือดไหล', 'Bleeding', '#ff4a5a', '🩸'], defDown:['เกราะแตก', 'Armour broken', '#e0a060', '⛨'],
  atkDown:['อ่อนแรง', 'Weakened', '#b0a090', '⇩'], shock:['ช็อต', 'Shocked', '#fff27a', '⚡'], curse:['คำสาป', 'Cursed', '#b07aff', '✝'],
  blind:['ตาพร่า', 'Blinded', '#9a9aaa', '◌'], charm:['หลงเสน่ห์', 'Charmed', '#ff8ad0', '♥'], fear:['หวาดกลัว', 'Feared', '#9a7aff', '!']};
/* the statuses on a monster now: [[key, seconds left], …] */
function mobStatuses(m){
  const out = [], s = (m && m.st) || {};
  for (const k in MSX){ if (k === 'burn') continue; const v = s[k]; if (typeof v === 'number' && v > 0) out.push([k, v]); }
  if (m && m.burnT > T) out.push(['burn', m.burnT - T]);
  if (s.bleedT > T && !out.some(o => o[0] === 'bleed')) out.push(['bleed', s.bleedT - T]);
  return out;
}
/* a tap on the name tag picks the monster */
{ const _a = mobAt; mobAt = function(p){ const r = _a.apply(this, arguments); if (r) return r; let best = null, bd = 1e9;
    for (const m of mobs){ if (m.dead || m.vanish) continue; const h = MOB_H[m.type] || 30, ty = m.y - h - 14, dx = Math.abs(p.x - m.x), dy = p.y - ty;
      if (dx < 48 && dy > -18 && dy < 14){ const d = dx + Math.abs(dy); if (d < bd){ bd = d; best = m; } } }
    return best; }; }
/* the target card: a row of status chips, refreshed every frame */
function msxRow(m){
  if (m.def && m.def.boss) return `<span class="msx im">${L('ต้านทานสถานะ', 'Immune to statuses')}</span>`;
  const list = mobStatuses(m); if (!list.length) return `<span class="msx none">${L('ไม่มีสถานะผิดปกติ', 'No status')}</span>`;
  return list.map(([k, t]) => { const I = MSX[k]; return `<span class="msx" style="--c:${I[2]}"><em>${I[3]}</em>${L(I[0], I[1])} ${Math.ceil(t)}s</span>`; }).join('');
}
{ const _ut = updTarget; updTarget = function(){ const r = _ut.apply(this, arguments); const m = P.target, box = el('target'); if (!box || !m || m.dead) return r;
    let row = box.querySelector('.msxrow'); if (!row){ row = document.createElement('div'); row.className = 'msxrow'; box.appendChild(row); }
    const h = msxRow(m); if (row._h !== h){ row._h = h; row.innerHTML = h; } return r; }; }
/* dots under name tags */
EV.on('draw', () => { if (typeof ctx === 'undefined') return; const z = typeof TAG_Z === 'function' ? TAG_Z() : 1;
  for (const m of mobs){ if (m.dead || m.vanish) continue; const list = mobStatuses(m); if (!list.length) continue;
    const x = sx(m.x), y = sy(m.y - (MOB_H[m.type] || 30)) - 4 * z; if (x < -40 || x > SW + 40 || y < -20 || y > SH + 20) continue;
    const r = 4 * z, gap = 10 * z, x0 = x - (list.length - 1) * gap / 2;
    list.slice(0, 6).forEach(([k], i) => { ctx.beginPath(); ctx.arc(x0 + i * gap, y, r, 0, 7); ctx.fillStyle = MSX[k][2]; ctx.fill(); ctx.lineWidth = 1.2 * z; ctx.strokeStyle = 'rgba(30,20,10,.75)'; ctx.stroke(); }); } });
{ const st = document.createElement('style'); st.textContent = `
  html body #ui.ui #target .msxrow{display:flex;flex-wrap:wrap;gap:3px;margin-top:4px}
  html body #ui.ui #target .msx{display:inline-flex;align-items:center;gap:2px;font:800 10px/1 Sarabun,"Noto Sans Thai",sans-serif;padding:2px 6px 2px 4px;border-radius:8px;color:#2a1a08;
    background:color-mix(in srgb,var(--c,#ccc) 30%,#fff);border:1.4px solid var(--c,#ccc)}
  html body #ui.ui #target .msx em{font-style:normal;font-size:10px}
  html body #ui.ui #target .msx.none,html body #ui.ui #target .msx.im{background:#f2ede2;border-color:#d6cbb4;color:#7a6a50;font-weight:700}`; document.head.appendChild(st); }
