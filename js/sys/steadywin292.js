/* VAYRATHEN — js/sys/steadywin292.js — (v292) windows that do not jump when you press something
   The owner: the bag, the status window and the skill tree "bounced". Measured frame by frame:
   · the bag: picking an item opened its info strip under the grid, the grid shrank (19 px and more) and every cell moved
     up; picking nothing closed it again. Now the strip floats over the foot of the grid (the grid keeps its size, the
     cells stay put; the grid gets room at its end so the last row can be scrolled clear of the strip);
   · the status window: the first + added the «spend N points · Confirm» bar, the window became taller than its frame and
     a scroll bar appeared (everything shifted sideways), Confirm took it away again. Now the bar's room is always there
     (a quiet hint until you press +) and the window is scaled once to fit it, so nothing moves;
   · the skill tree: it was fitted twice per redraw (right away and a frame later) and the two passes disagreed by a
     hair (85.1 % / 84.6 %), so the whole tree twitched on every press. It now keeps its scale unless the change is real. */
'use strict';

/* ---------- a scale that only changes when it must ---------- */
/* fit the children of a scroll box by scaling them, never scrolling (keeps the scale while it still fits and is close) */
function paneFit(pane, min = .55){
  if (!pane || !pane.isConnected || !pane.offsetParent) return;
  const kids = [...pane.children].filter(c => c.nodeType === 1);
  const cur = +(kids[0] && kids[0].style.zoom) || 1;
  const apply = k => { for (const c of kids) c.style.zoom = k === 1 ? '' : String(k); };
  apply(1); const room = pane.clientHeight, need = pane.scrollHeight;
  let k = need <= room + 1 ? 1 : Math.max(min, Math.floor(room / need * 100) / 100);
  if (cur < 1 && k < 1 && k < cur + .05){ apply(cur); if (pane.scrollHeight - pane.clientHeight <= 8) k = cur; }   // the old scale still fits (a few px of bottom padding at most): keep it, no twitch
  apply(k);
  for (let i = 0; i < 3 && pane.scrollHeight > pane.clientHeight + 1 && k > min; i++){ k = Math.max(min, +(k - .02).toFixed(2)); apply(k); }
  pane.style.overflowY = 'hidden';
}

/* ---------- the status window ---------- */
if (typeof renderPanel === 'function'){ const _rp = renderPanel;
  renderPanel = function(){ const r = _rp.apply(this, arguments);
    const pane = document.getElementById('pane-stat'); if (!pane || !pane.isConnected) return r;
    if (!pane.querySelector('.stpbar')){ const tbl = pane.querySelector('table.stats');
      if (tbl) tbl.insertAdjacentHTML('afterend', `<div class="stpbar stpidle"><span>${L('กด + เพื่อลงแต้ม แล้วกดยืนยัน', 'Press + to place points, then confirm')}</span><button class="btn" disabled>${L('ยกเลิก', 'Cancel')}</button><button class="btn gold" disabled>${L('ยืนยัน', 'Confirm')}</button></div>`); }
    // the same rows before and after a +: the preview lists more (Max HP, Max SP …), which made the window taller
    if (typeof stpAny === 'function' && !stpAny() && typeof stpPreview === 'function'){ const dl = pane.querySelector('dl.derived');
      if (dl) try { dl.innerHTML = stpPreview().map(([a, o]) => `<div><dt>${a}</dt><dd>${o}</dd></div>`).join(''); } catch (e) {} }
    pane.querySelectorAll('.stpbar').forEach(b => { b.style.height = '46px'; });
    try { paneFit(pane); } catch (e) {}
    return r; }; }

/* ---------- the skill tree: steady scale ---------- */
if (typeof skFitOne === 'function'){
  skFitOne = function(el, min = .5){
    if (!el || !el.isConnected) return 1;
    const cur = +(el.dataset.prevz || el.style.zoom) || 1; delete el.dataset.prevz; el.style.overflow = 'hidden'; el.style.zoom = '';   // the scale it had before this redraw (skFit clears it first)
    const room = el.clientHeight, need = el.scrollHeight;
    let k = need <= room + 1 ? 1 : Math.max(min, Math.floor(room / need * 100) / 100);
    if (cur < 1 && k < 1 && k < cur + .05){ el.style.zoom = String(cur); if (el.scrollHeight - el.clientHeight <= 8) k = cur; }   // keep the scale while it still fits (no twitch from one press to the next)
    el.style.zoom = k === 1 ? '' : String(k);
    for (let i = 0; i < 3 && el.scrollHeight > el.clientHeight + 1 && k > min; i++){ k = Math.max(min, +(k - .02).toFixed(2)); el.style.zoom = String(k); }
    return k; };
}

/* ---------- the bag: the info strip floats ---------- */
function bagSteady(){
  const info = document.getElementById('bagInfo'), grid = document.getElementById('bagGrid'); if (!info || !grid) return;
  const h = info.offsetHeight; grid.style.paddingBottom = h ? (h + 6) + 'px' : '';
}
for (const fn of ['bagDraw', 'bagInfo']) if (typeof window[fn] === 'function'){ const _f = window[fn];
  window[fn] = function(){ const r = _f.apply(this, arguments); try { bagSteady(); } catch (e) {} return r; }; }

{ const st = document.createElement('style'); st.textContent = `
html body #ui.ui #pane-bag .bagmain{position:relative !important}
html body #ui.ui #pane-bag #bagInfo{position:absolute !important;left:0 !important;right:0 !important;bottom:0 !important;z-index:4 !important;max-height:62% !important;overflow-y:auto !important;
  background:linear-gradient(180deg,#fffaf0,#fff2da) !important;border-top:1.5px solid #e3c98f !important;box-shadow:0 -6px 14px rgba(120,80,20,.18) !important;border-radius:10px 10px 0 0 !important;scrollbar-width:thin}
html body #ui.ui #pane-bag #bagInfo:empty{display:none !important}
#pane-stat .stpbar{flex-wrap:nowrap !important;height:46px !important;min-height:0 !important;box-sizing:border-box !important;overflow:hidden !important}
#pane-stat dl.derived dd,#pane-stat dl.derived dt{white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;min-width:0 !important}
#pane-stat dl.derived dd b{letter-spacing:-.2px}
#pane-stat .stpbar > span{white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;min-width:0 !important}
#pane-stat .stpbar.stpidle{background:rgba(120,100,60,.08) !important;border-color:rgba(160,130,80,.3) !important}
#pane-stat .stpbar.stpidle span{color:#8a7350 !important}
#pane-stat .stpbar.stpidle .btn{opacity:.45}`; document.head.appendChild(st); }
