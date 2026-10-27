/* VAYRATHEN — js/sys/barber.js — restyle your hero any time at the tailor in Aren
   Talk to ช่างพิมพ์ลดา → "ทำผม · สีผม · สีตา": the same choices as the character maker (9 hair styles per sex,
   22 hair colours, 10 eye colours), a turning preview in your current class and gear, and one button to keep it.
   Free. Other players see the new look at once (it travels in the presence look key). */
'use strict';

const BARBER = {look:null, dir:0, raf:0};
function barberRender(n){
  const lk = BARBER.look, sw = c => { const mt = c ? SPR.MATS[SPR.M[c]] : null; return mt ? mt.hex[1] : 'conic-gradient(#40271b 0 25%,#f2c879 0 50%,#4a5aa8 0 75%,#e6def5 0)'; };
  const names = HAIR_NAMES[lk.sex === 'f' ? 'f' : 'm'];
  npcFrame(n, L('อยากเปลี่ยนลุคใช่ไหมจ๊ะ เลือกได้ตามใจเลย ฟรีจ้ะ', 'Fancy a new look? Pick whatever you like, it is free'),
    `<div class="maker brb">
      <div class="mk-prev"><canvas id="brbPrev" width="132" height="156"></canvas>
        <div class="mk-rot"><button class="ibtn" data-brbrot="1" aria-label="${L('หมุนซ้าย', 'Turn left')}">⟲</button><button class="ibtn" data-brbrot="-1" aria-label="${L('หมุนขวา', 'Turn right')}">⟳</button></div></div>
      <div class="mk-form">
        <div class="mk-row"><span>${L('ทรงผม', 'Hair')}</span><div class="seg">${names.map((h, i) => `<button class="${(lk.hair | 0) === i ? 'on' : ''}" data-brbhair="${i}">${L(...h)}</button>`).join('')}</div></div>
        <div class="mk-row"><span>${L('สีผม', 'Colour')}</span><div class="swatches">${SPR.HAIR_COLORS.map(c => `<button class="sw${(lk.color || '') === c ? ' on' : ''}" data-brbcol="${c}" style="background:${sw(c)}" title="${L(...(HAIR_COL_NAMES[c] || [c, c]))}" aria-label="${L(...(HAIR_COL_NAMES[c] || [c, c]))}"></button>`).join('')}</div></div>
        <div class="mk-row"><span>${L('สีตา', 'Eyes')}</span><div class="swatches eyes">${SPR.IRIS_COLORS.map(c => `<button class="sw${(lk.eye || '') === c ? ' on' : ''}" data-brbeye="${c}" style="background:${sw(c)}" title="${L(...(EYE_NAMES[c] || [c, c]))}" aria-label="${L(...(EYE_NAMES[c] || [c, c]))}"></button>`).join('')}</div></div>
        <div class="mk-btns"><button class="tbtn sm" data-brbback="1">${L('ย้อนกลับ', 'Back')}</button><button class="tbtn gold sm" data-brbok="1">${L('ใช้ลุคนี้', 'Keep this look')}</button></div>
      </div></div>`);
  cancelAnimationFrame(BARBER.raf);
  const t0 = performance.now(), loop = now => { const cv = el('brbPrev'); if (!cv || el('dialog').hidden) return; drawHeroPic(cv, S.job, S.gear, BARBER.look, BARBER.dir, (now - t0) / 1000); BARBER.raf = requestAnimationFrame(loop); };
  BARBER.raf = requestAnimationFrame(loop);
}
function barberOpen(){ const n = NPCS.find(x => x.id === 'tailor'); if (!n) return; BARBER.look = {sex:'m', hair:0, color:'', eye:'', ...(S.look || {})}; BARBER.dir = 0; barberRender(n); }
/* the tailor's own dialog gets the stylist button */
{ const _t = NPC_OPEN.tailor;
  NPC_OPEN.tailor = function(n){ const r = _t.apply(this, arguments);
    const db = el('dialog') && el('dialog').querySelector('.db');
    if (db && !db.querySelector('[data-brbopen]')) db.insertAdjacentHTML('afterbegin', `<button class="btn gold wide brbgo" data-brbopen="1">✂ ${L('ทำผม · สีผม · สีตา (ฟรี)', 'Hair · hair colour · eyes (free)')}</button>`);
    return r; };
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-brbopen],[data-brbhair],[data-brbcol],[data-brbeye],[data-brbrot],[data-brbback],[data-brbok]'); if (!b) return;
  const d = b.dataset, n = NPCS.find(x => x.id === 'tailor'); if (!n) return;
  if (d.brbopen){ barberOpen(); return; }
  if (!BARBER.look) return;
  if (d.brbhair != null) BARBER.look.hair = +d.brbhair;
  else if (d.brbcol != null) BARBER.look.color = d.brbcol;
  else if (d.brbeye != null) BARBER.look.eye = d.brbeye;
  else if (d.brbrot){ BARBER.dir = (BARBER.dir + (+d.brbrot) + 8) % 8; return; }
  else if (d.brbback){ cancelAnimationFrame(BARBER.raf); BARBER.look = null; NPC_OPEN.tailor(n); return; }
  else if (d.brbok){
    const lk = BARBER.look; S.look = {...(S.look || {}), sex:lk.sex === 'f' ? 'f' : 'm', hair:lk.hair | 0, color:lk.color || '', eye:lk.eye || ''};
    cancelAnimationFrame(BARBER.raf); BARBER.look = null; dirty = true; save();
    if (typeof NET !== 'undefined') NET.presT = 0;
    if (typeof drawPortrait === 'function') drawPortrait();
    if (typeof CTH !== 'undefined') CTH.dirty = true;
    VFX.play('heal', {x:P.x, y:P.y}); SFX.play('coin'); toast(L('ลุคใหม่เรียบร้อย!', 'New look!'));
    NPC_OPEN.tailor(n); return;
  }
  barberRender(n);
});
