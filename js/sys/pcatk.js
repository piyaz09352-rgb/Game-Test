/* VAYRATHEN — js/sys/pcatk.js — (v88) the attack button on PC too
   The touch layout (จอย) has a big attack button; with a mouse there was none. Now the mouse layout has the same
   button at the bottom right, wearing your class's weapon: tap it to attack (the target, or the closest enemy),
   hold it for the list of targets around you, exactly as on a phone. Hidden in the touch layout (it has its own).
   Drawn once, redrawn only when your class changes. */
'use strict';

const PCA = {job:null};
function pcAtkDraw(){
  let w = el('pcAtk'); if (!w){ w = document.createElement('div'); w.id = 'pcAtk'; w.className = 'pcatk'; el('ui').appendChild(w); }
  const wt = JOBS[S.job] && JOBS[S.job].weapon ? JOBS[S.job].weapon.type : '';
  w.innerHTML = `<button class="mo atk w-${wt}" data-mo="atk" aria-label="${L('โจมตี', 'Attack')}" title="${L('โจมตี · กดค้างเพื่อเลือกเป้าหมาย', 'Attack · hold to pick a target')}">${ATK_ICON[wt] || icon.atk}</button><small>${L('กดค้าง = เลือกเป้า', 'hold = pick target')}</small>`;
  PCA.job = S.job;
}
EV.on('tick', () => { if (!S || !S.job || !el('ui')) return; if (PCA.job !== S.job) pcAtkDraw(); });
/* the target list opens over the button you can see (the touch one may sit hidden) */
tpkPlace = function(){
  const d = tpkEl(), b = [...document.querySelectorAll('[data-mo="atk"]')].find(x => x.offsetParent), ui = el('ui').getBoundingClientRect();
  if (!b){ d.style.right = '12px'; d.style.bottom = '120px'; return; }
  const r = b.getBoundingClientRect();
  d.style.right = Math.max(8, ui.right - r.right) + 'px'; d.style.bottom = Math.max(8, ui.bottom - r.top + 10) + 'px'; d.style.maxHeight = Math.max(140, r.top - ui.top - 18) + 'px';
};
{ const st = document.createElement('style');
  st.textContent = `.pcatk{position:absolute;right:22px;bottom:22px;width:84px;height:104px;z-index:6;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px}
  .ui.moba .pcatk{display:none}.pcatk .mo.atk{position:relative;right:auto;bottom:auto;width:76px;height:76px}
  .pcatk small{font:600 11px var(--display,sans-serif);color:#1b1b1b;background:rgba(255,255,255,.85);border-radius:8px;padding:0 6px;white-space:nowrap;pointer-events:none}`;
  document.head.appendChild(st); }
