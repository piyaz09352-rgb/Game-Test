/* VAYRATHEN — js/sys/tpick.js — hold the attack button for a list of targets (v60)
   Hold the attack button for a moment and a list of the monsters and bosses around you opens above it: bosses
   first, then alpha monsters, then the rest by distance, each with its level and HP. Tap one and it becomes your
   target (attacks and targeted skills go to it until it dies or you pick another). The list keeps itself up to date
   while it is open and closes when you pick, tap ✕, tap anywhere else, or after 8 seconds untouched.
   A quick tap on the attack button still just attacks. Tab still steps to the next enemy on a keyboard. */
'use strict';

const TPK = {press:null, open:false, t:0, list:[], refT:0, at:null};
const TPK_HOLD = .4, TPK_RANGE = 700;

function tpkMobs(){
  return mobs.filter(m => tlkOk(m) && !m.def.npc && dist(m, P) <= TPK_RANGE)
    .sort((a, b) => ((a.def.boss ? 0 : a.elite ? 1 : 2) - (b.def.boss ? 0 : b.elite ? 1 : 2)) || dist(a, P) - dist(b, P)).slice(0, 10);
}
function tpkEl(){
  let d = el('tpick'); if (d) return d;
  d = document.createElement('div'); d.id = 'tpick'; d.hidden = true; el('ui').appendChild(d);
  d.addEventListener('pointerdown', e => e.stopPropagation());
  d.addEventListener('pointerup', e => { e.stopPropagation(); const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.x != null){ tpkClose(); return; }
    if (b.dataset.off != null){ tpkClose(); tlkClear(); return; }
    const m = TPK.list[+b.dataset.i]; if (!tlkOk(m)){ tpkRender(); return; }
    tlkSet(m, true); TLK.hard = true; P.tapped = m; P.target = m; TLK.flash = T; tpkClose();
    toast(L(`เป้าหมาย: ${nm(m.def)}`, `Target: ${m.def.en || nm(m.def)}`)); });
  return d;
}
function tpkRender(){
  const d = tpkEl(); TPK.list = tpkMobs();
  const cur = tlkOk(P.target) ? P.target : TLK.m;
  const rows = TPK.list.map((m, i) => { const k = Math.max(0, Math.min(1, m.hp / (m.maxhp || 1))), tag = m.def.boss ? '♛ ' : m.elite ? '★ ' : '';
    return `<button class="tpk-row${m === cur ? ' on' : ''}${m.def.boss ? ' boss' : ''}" data-i="${i}"><span class="tpk-n">${tag}${nm(m.def)}</span><span class="tpk-lv">Lv.${m.def.lvl}</span>
      <span class="tpk-d">${Math.round(dist(m, P) / 10)} ${L('ม.', 'm')}</span><span class="tpk-hp"><i style="width:${(k * 100).toFixed(0)}%"></i></span></button>`; }).join('');
  d.innerHTML = `<div class="tpk-h"><b>${L('เลือกเป้าหมาย', 'Pick a target')}</b><button class="tpk-x" data-x aria-label="${L('ปิด', 'Close')}">✕</button></div>
    ${rows || `<p class="tpk-empty">${L('ไม่มีมอนสเตอร์ใกล้ ๆ', 'No monsters nearby')}</p>`}
    ${TLK.hard ? `<button class="tpk-off" data-off>${L('ปลดเป้า', 'Let go of target')}</button>` : ''}`;
}
/* every half second: same monsters → just the bars and distances move; a monster came or went → the list is redrawn */
function tpkRefresh(){
  const now = tpkMobs(); if (now.length !== TPK.list.length || now.some((m, i) => m !== TPK.list[i])){ tpkRender(); return; }
  const d = tpkEl(); TPK.list.forEach((m, i) => { const row = d.querySelector(`.tpk-row[data-i="${i}"]`); if (!row) return;
    row.querySelector('.tpk-hp i').style.width = (Math.max(0, Math.min(1, m.hp / (m.maxhp || 1))) * 100).toFixed(0) + '%';
    row.querySelector('.tpk-d').textContent = `${Math.round(dist(m, P) / 10)} ${L('ม.', 'm')}`; });
}
function tpkPlace(){
  const d = tpkEl(), b = document.querySelector('[data-mo="atk"]'), ui = el('ui').getBoundingClientRect();
  if (!b){ d.style.right = '12px'; d.style.bottom = '120px'; return; }
  const r = b.getBoundingClientRect();
  d.style.right = Math.max(8, ui.right - r.right) + 'px'; d.style.bottom = Math.max(8, ui.bottom - r.top + 10) + 'px'; d.style.maxHeight = Math.max(140, r.top - ui.top - 18) + 'px';
}
function tpkOpen(){ TPK.open = true; TPK.t = T; TPK.refT = T; tpkRender(); tpkPlace(); tpkEl().hidden = false; if (SFX.play) SFX.play('click'); }
function tpkClose(){ TPK.open = false; const d = el('tpick'); if (d) d.hidden = true; }

// tlock.js's hold-to-cycle is replaced by the list: this runs after its listener and takes the press over
document.addEventListener('pointerdown', e => {
  if (TPK.open && !(e.target.closest && e.target.closest('#tpick'))) tpkClose();
  const b = e.target.closest && e.target.closest('[data-mo="atk"]'); if (!b || b.disabled) return;
  TLK.press = null; TPK.press = {t:T, id:e.pointerId}; }, true);
const tpkUp = e => { if (TPK.press && (e.pointerId == null || e.pointerId === TPK.press.id)) TPK.press = null; };
document.addEventListener('pointerup', tpkUp, true); document.addEventListener('pointercancel', tpkUp, true);
EV.on('tick', () => {
  const h = TPK.press; if (h && !P.dead && !PAUSED && T - h.t >= TPK_HOLD){ TPK.press = null; tpkOpen(); }
  if (!TPK.open) return;
  if (P.dead || T - TPK.t > 8){ tpkClose(); return; }
  if (T - TPK.refT > .5){ TPK.refT = T; tpkRefresh(); }
});
{ const st = document.createElement('style'); st.textContent = `
#tpick{position:absolute;z-index:60;width:min(300px,78vw);background:#fffdf6;border:2px solid #d9b45a;border-radius:14px;box-shadow:0 6px 18px rgba(60,40,10,.25);padding:6px;overflow-y:auto;overscroll-behavior:contain;font-family:Sarabun,system-ui,sans-serif;color:#1c1712;pointer-events:auto}
#tpick .tpk-h{display:flex;align-items:center;justify-content:space-between;padding:2px 6px 6px}
#tpick .tpk-h b{font-size:15px}
#tpick .tpk-x{border:0;background:#f1e6cc;border-radius:8px;width:30px;height:28px;font-size:15px;color:#1c1712}
#tpick .tpk-row{display:grid;grid-template-columns:1fr auto auto;gap:1px 8px;width:100%;text-align:left;border:1px solid #eadcb8;background:#fff;border-radius:10px;padding:4px 8px;margin:2px 0;font:inherit;color:#1c1712}
#tpick .tpk-row.on{border-color:#c9962e;background:#fff4d6}
#tpick .tpk-row.boss .tpk-n{color:#8a5a00;font-weight:800}
#tpick .tpk-n{font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tpick .tpk-lv,#tpick .tpk-d{font-size:12px;color:#4a4036;text-align:right}
#tpick .tpk-hp{grid-column:1/-1;height:5px;background:#eadfd0;border-radius:4px;overflow:hidden;align-self:center}
#tpick .tpk-hp i{display:block;height:100%;background:#d9534a}
#tpick .tpk-empty{margin:6px;font-size:14px;color:#4a4036}
#tpick .tpk-off{width:100%;margin-top:4px;border:1px solid #eadcb8;background:#f6efe0;border-radius:10px;padding:7px;font:inherit;font-weight:700;color:#1c1712}`;
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'tpick', t:['เลือกเป้าหมาย', 'Picking a target'], b:() => `<p>${L('กดปุ่มโจมตีค้างไว้ครู่หนึ่ง จะมีรายชื่อมอนสเตอร์และบอสรอบตัวขึ้นมา (บอสอยู่บนสุด) แตะชื่อเพื่อเลือกเป็นเป้า · แตะเร็ว ๆ = โจมตีตามปกติ',
  'Hold the attack button for a moment to open a list of the monsters and bosses around you (bosses on top); tap a name to make it your target · a quick tap still attacks')}</p>`});
