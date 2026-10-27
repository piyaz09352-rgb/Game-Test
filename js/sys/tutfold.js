/* VAYRATHEN — js/sys/tutfold.js — (v127) the tutorial card stays out of the way
   On a phone the card sat in the middle of the screen, over the hero and the monsters you were told to fight.
   Now, in the touch layout, it sits low (above the small buttons, below the hero), narrower, and it folds: ▾ shrinks it to a small
   pill (step number and title), ▴ opens it again; the choice is kept. Steps that need a click still show their
   button, and a new step opens it again for a moment so the instruction is seen. */
'use strict';

{ const _ts = tutShow;
  tutShow = function(){ const r = _ts.apply(this, arguments); const b = el('tutBox'); if (!b || b.hidden) return r;
    const mini = !!(S.tut && S.tut.mini && S.tut.miniAt === S.tut.i);
    b.classList.toggle('mini', mini);
    const h = b.querySelector('.tuth'); if (h && !h.querySelector('[data-tutfold]')) h.insertAdjacentHTML('beforeend', `<button class="tutfold" data-tutfold="1" aria-label="${L('ย่อ/ขยาย', 'Fold')}">${mini ? '▴' : '▾'}</button>`);
    return r; }; }
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-tutfold]'); if (!t || !S.tut) return;
  const b = el('tutBox'); const mini = !(b && b.classList.contains('mini')); S.tut.mini = mini; S.tut.miniAt = S.tut.i;   // folded for this step; the next step opens again
  if (b){ b.classList.toggle('mini', mini); t.textContent = mini ? '▴' : '▾'; } dirty = true; });
{ const st = document.createElement('style'); st.textContent = `
html body .ui.moba .tutbox{top:auto!important;bottom:15%!important;transform:translate(-50%,0)!important;width:min(380px,38%)!important;max-height:34%;overflow:hidden}
.tutbox .tuth{display:flex;align-items:center;gap:6px}.tutbox .tutfold{pointer-events:auto;margin-left:4px;min-width:28px;min-height:26px;border-radius:8px;border:1px solid rgba(160,120,40,.4);background:rgba(255,248,230,.9);font:700 13px/1 sans-serif;cursor:pointer;color:#6a4a10}
html body .tutbox.mini{width:auto!important;padding:5px 10px!important;gap:0!important}
.tutbox.mini p,.tutbox.mini .tutdots,.tutbox.mini .tutx{display:none!important}.tutbox.mini .btn{display:none!important}`; document.head.appendChild(st); }
