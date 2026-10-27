/* VAYRATHEN — js/sys/tipcompact.js — a small item card (v153)
   The item card with its comparison grew to about 640 × 650 px and covered half the screen. Now it is one narrow
   column (≈ 270 px): a 40 px picture, tighter type and spacing, the stat chips in one size, and the comparison as
   just the stat, the value you would have and the change — the 7 changes that matter most, then "+ n more".
   Loaded after sys/itemtip.js and css/sunlit.css (its rules must win over theirs). */
'use strict';
{ const st = document.createElement('style'); st.textContent = `
html body #itTip.ittip{max-width:min(282px,calc(100vw - 16px)) !important;padding:5px !important;gap:5px !important;border-width:1.5px !important;border-radius:10px !important;flex-direction:column}
html body #itTip.ittip .it-col,html body #itTip.ittip .it-col:only-child{flex:0 0 auto !important;max-width:none !important;width:100%}
html body #itTip.ittip .it-h{font-size:10.5px !important;margin:0 0 2px 2px !important}
html body #itTip .gdx{padding:5px 8px 6px !important;border-radius:9px !important;font-size:11px !important}
html body #itTip .gdx-band{margin:-5px -8px 5px !important;padding:1px 8px !important;font-size:10px !important;border-radius:8px 8px 0 0 !important}
html body #itTip .gdx-top{gap:7px !important}
html body #itTip .gdx-ic{flex:0 0 40px !important;width:40px !important;height:40px !important;border-radius:9px !important}
html body #itTip .gdx-ic svg,html body #itTip .gdx-ic img{width:34px !important;height:34px !important}
html body #itTip .gdx-id b,html body #itTip .gdx-id b.rar{font-size:13.5px !important;line-height:1.2 !important}
html body #itTip .gdx-tag{font-size:9.5px !important;padding:0 5px !important}
html body #itTip .gdx-h{font-size:10px !important;margin:5px 0 2px !important}
html body #itTip .gdx-h::before{font-size:9px !important}
html body #itTip .gdx-chips{gap:3px !important}
html body #itTip .gdx-chips span{font-size:10.5px !important;padding:0 6px !important;border-width:1px !important;line-height:1.55 !important}
html body #itTip .gdx-desc,html body #itTip .gdx p{font-size:10.5px !important;line-height:1.35 !important;margin:3px 0 !important}
html body #itTip .gdx-foot{font-size:9.5px !important;margin-top:4px !important;padding-top:3px !important}
html body #itTip .cmp.ctab{padding:4px 6px !important;font-size:10.5px !important}
html body #itTip .cmp.ctab .cth{gap:4px !important;margin-bottom:2px !important;font-size:10.5px !important}
html body #itTip .cmp.ctab table{font-size:10.5px !important}
html body #itTip .cmp.ctab td{padding:0 3px !important}
html body #itTip .cmp.ctab td:nth-child(2),html body #itTip .cmp.ctab td.arr,html body #itTip .cmp.ctab th:nth-child(2),html body #itTip .cmp.ctab th:nth-child(3){display:none}
html body #itTip .cmp.ctab thead{display:none}
html body #itTip .cmp .more{display:block;text-align:right;font-size:9.5px;color:#7a6a4a;margin-top:1px}`;
  document.head.appendChild(st); }
/* only the biggest changes in the comparison (by how much each stat moves against what you have now) */
{ const _ct = itCmpTable;
  itCmpTable = function(id){ const html = _ct.apply(this, arguments); if (!html || html.indexOf('<tbody>') < 0) return html;
    const box = document.createElement('div'); box.innerHTML = html; const tb = box.querySelector('tbody'), rows = [...tb.children];
    if (rows.length <= 7) return html;
    const size = tr => { const t = tr.children, now = parseFloat((t[1].textContent || '0').replace(/[^\d.-]/g, '')) || 1, d = parseFloat((t[4].textContent || '0').replace(/[^\d.]/g, '')) || 0; return d / Math.max(1, Math.abs(now)); };
    const keep = new Set(rows.slice().sort((a, b) => size(b) - size(a)).slice(0, 7));
    rows.forEach(tr => { if (!keep.has(tr)) tr.remove(); });
    const more = document.createElement('small'); more.className = 'more'; more.textContent = L(`+ อีก ${rows.length - 7} ค่าเปลี่ยนเล็กน้อย`, `+ ${rows.length - 7} smaller changes`);
    box.querySelector('.cmp').appendChild(more); return box.innerHTML; }; }
