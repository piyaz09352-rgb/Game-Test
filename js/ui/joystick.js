/* VAYRATHEN — js/ui/joystick.js
   MOBA-style controls: a floating virtual joystick (left) and an action cluster (right) —
   big attack button with skills on an arc around it, plus dodge, potion, ride, capture and rest.
   On by default on touch screens; switchable in Settings (อัตโนมัติ / จอย / เมาส์). WASD also drives the stick. */
'use strict';

const JOY = {active:false, id:null, ox:0, oy:0, vx:0, vy:0, keys:new Set()};
const JOY_R = 52;                       // knob travel in CSS px

function controlMode(){
  const c = SETTINGS.control || 'auto';
  return c === 'auto' ? (matchMedia('(pointer:coarse)').matches ? 'joy' : 'mouse') : c;
}
function applyControlMode(){ el('ui').classList.toggle('moba', controlMode() === 'joy'); renderMoba(); }

/* ---------- action cluster ---------- */
const icon = {
  atk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4.5l5 5-9 9H5.5v-5z"/><path d="M4 20l3.5-3.5M12 7l5 5"/></svg>',
  roll:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/></svg>',
  pot:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M9.5 3h5M10 3v4.5L6.2 13a6 6 0 1011.6 0L14 7.5V3"/><path d="M7.5 14h9" stroke-linecap="round"/></svg>',
  ride:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18l2-6 4-1 4 1 3-4 2 1-2 4v5"/><path d="M8 18v-3M16 18v-3M17 8l-1-4M19 8l1-4"/></svg>',
  cap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><ellipse cx="12" cy="9" rx="7" ry="4"/><path d="M12 13c0 4-3 6-6 7"/></svg>',
  sit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="5.5" r="2.5"/><path d="M12 8v6M7 20l3-6h4l3 6M8 11h8"/></svg>',
  bot:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9.5 16.5h5"/></svg>'
};
/* the attack button wears the class's weapon */
const ATK_ICON = {
  sword:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 3.5l-1 4.5-9.5 9.5-3-3L16 5z"/><path d="M5 14.5l4.5 4.5M7.5 17L4 20.5"/><path d="M17.5 6.5L9 15" stroke-width="1" opacity=".6"/></svg>',
  dagger:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19 3l-.5 3.5-6 6-2-2 6-6z"/><path d="M9 11l4 4M10.5 13.5L7.5 16.5"/><path d="M5 3l.5 3.5 6 6M13 10.5l2 2M14.5 15l3 3" opacity=".75"/></svg>',
  staff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21L14.5 9.5"/><circle cx="17" cy="7" r="3.3"/><path d="M17 1.8v1.4M22.2 7h-1.4M20.7 3.3l-1 1M13.3 3.3l1 1"/></svg>',
  fist:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V8.5a1.5 1.5 0 013 0V8a1.5 1.5 0 013 0v.5a1.5 1.5 0 013 0V10a1.5 1.5 0 013 0v4c0 4-2.5 6.5-6 6.5H12c-3 0-5-2-5-5z"/><path d="M7 13c-1.5 0-2.5-1-2.5-2.5S6 8 7 8.5"/><path d="M2 5l2 1.5M5 2.5L6.2 4.5" opacity=".7"/></svg>',
  bow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3c9 2 13 8 15 15"/><path d="M6 3l15 15" stroke-width="1" opacity=".7"/><path d="M3 21L14 10M14 10l-1-3.5M14 10l3.5 1"/></svg>'
};
function renderMoba(){
  const box = el('mobaAct'); if (!box || !el('ui').classList.contains('moba')) return;
  const skillBtn = (id, i) => id && skl(id)
    ? `<button class="mo sk s${i}${i > 3 ? ' mini' : ''} sk-${SKILLS[id].elem || 'neutral'}" data-mo="skill" data-id="${id}" aria-label="${skName(SKILLS[id])}">${skillIcon(id)}<b>${skShort(SKILLS[id])}</b><i class="cdv" data-cd="${id}"></i></button>`
    : `<button class="mo sk s${i}${i > 3 ? ' mini' : ''} empty" disabled aria-label="${L('ช่องสกิลว่าง', 'Empty skill slot')}"><b>${i + 1}</b></button>`;
  box.innerHTML = `
    <button class="mo atk w-${JOBS[S.job].weapon.type}" data-mo="atk" aria-label="${L('โจมตี', 'Attack')}"><i class="atkaura"></i>${ATK_ICON[JOBS[S.job].weapon.type] || icon.atk}</button>
    ${S.hot.map(skillBtn).join('')}`;
  // potions sit beside the joystick (left thumb), HP above SP, each showing its own bottle and count
  const hp = bestHp(), sp = bestSp(), pb = (k, id) => `<button class="mo pot ${k}" data-mo="${k === 'hp' ? 'pot' : 'potsp'}" aria-label="${nm(ITEMS[id])}" title="${nm(ITEMS[id])}" ${S.inv[id] ? '' : 'disabled'}>${itemArt(id, true)}<em>${S.inv[id] || 0}</em></button>`;
  if (el('mobaPot')) el('mobaPot').innerHTML = pb('hp', hp) + pb('sp', sp);
  el('mobaUtil').innerHTML = `
    <button class="mu${P.ride ? ' on' : ''}" data-mo="ride" aria-label="${L('ขี่พาหนะ', 'Ride')}">${icon.ride}</button>
    <button class="mu" data-mo="cap" aria-label="${L('จับ Pet', 'Capture')}">${icon.cap}</button>
    <button class="mu${P.sit ? ' on' : ''}" data-mo="sit" aria-label="${L('นั่งพัก', 'Sit')}">${icon.sit}</button>
    <button class="mu${BOT.on ? ' on' : ''}" data-mo="bot" aria-label="Auto">${icon.bot}</button>`;
}
function nearestEnemy(range){
  let best = null, bd = range;
  for (const m of mobs){ if (m.dead || m.vanish) continue; const d = dist(m, P); if (d < bd){ bd = d; best = m; } }
  return best;
}
function mobaAction(kind, id){
  if (P.dead || PAUSED) return;
  botPauseFromManual(); P.sit = kind === 'sit' ? P.sit : false;
  if (kind === 'atk'){
    let t = P.target; if (!t || t.dead) t = nearestEnemy(320);
    if (!t){ toast(L('ไม่มีเป้าหมายใกล้ ๆ', 'No target nearby')); return; }
    if (P.ride && !DER.pas.rideAtk) P.ride = false;
    P.target = t; P.tx = null; P.npc = null;
  } else if (kind === 'skill'){
    trySkill(id);
  } else if (kind === 'roll') doRoll();
  else if (kind === 'pot') useItem(bestHp());
  else if (kind === 'potsp') useItem(bestSp());
  else if (kind === 'ride') toggleRide();
  else if (kind === 'cap'){ if (!P.target || P.target.dead){ const t = nearestEnemy(2000); if (t) P.target = t; } tryCapture(); }
  else if (kind === 'sit'){ P.sit = !P.sit; P.ride = false; P.tx = null; P.target = null; }
  else if (kind === 'bot') botButton();
  renderHotbar(); renderMoba();
}
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('[data-mo]'); if (!b || b.disabled) return;
  e.preventDefault(); b.classList.add('press'); mobaAction(b.dataset.mo, b.dataset.id);
});
document.addEventListener('pointerup', () => document.querySelectorAll('.mo.press,.mu.press').forEach(b => b.classList.remove('press')));

/* ---------- joystick ---------- */
function joyEls(){ return [el('joy'), el('joyKnob')]; }
function joySet(dx, dy){
  const d = Math.hypot(dx, dy), k = d > JOY_R ? JOY_R / d : 1;
  JOY.vx = dx * k / JOY_R; JOY.vy = dy * k / JOY_R;
  el('joyKnob').style.transform = `translate(${dx * k}px, ${dy * k}px)`;
  const on = Math.hypot(JOY.vx, JOY.vy) > .2, j = el('joy'); j.classList.toggle('dir', on);
  if (on){ j.style.setProperty('--ang', Math.atan2(dy, dx) + Math.PI / 2 + 'rad'); j.style.setProperty('--pow', Math.min(1, Math.hypot(JOY.vx, JOY.vy)).toFixed(2)); }
}
/* fixed (default): the stick never moves — touch on or near the ring and push from its centre.
   floating (Settings → "จอยลอยตามนิ้ว"): the ring jumps to wherever the thumb lands. */
el('joyZone').addEventListener('pointerdown', e => {
  if (PAUSED) return;
  const z = brect(el('joyZone')), [base] = joyEls();
  if (!SETTINGS.joyFloat){
    const r = brect(base), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (Math.hypot(ptX(e) - cx, ptY(e) - cy) > r.width * .85) return;                 // outside the stick: ignore (no accidental moves)
    JOY.active = true; JOY.id = e.pointerId; JOY.ox = cx; JOY.oy = cy; base.classList.add('held');
    joySet((ptX(e) - cx) / UIZ, (ptY(e) - cy) / UIZ);
  } else {
    JOY.active = true; JOY.id = e.pointerId; JOY.ox = ptX(e); JOY.oy = ptY(e);
    base.style.left = (ptX(e) - z.left) / UIZ + 'px'; base.style.top = (ptY(e) - z.top) / UIZ + 'px'; base.classList.add('live');
    joySet(0, 0);
  }
  try { el('joyZone').setPointerCapture(e.pointerId); } catch (err) {}
  e.preventDefault();
});
el('joyZone').addEventListener('pointermove', e => { if (JOY.active && e.pointerId === JOY.id) joySet((ptX(e) - JOY.ox) / UIZ, (ptY(e) - JOY.oy) / UIZ); });
const joyEnd = e => {
  if (!JOY.active || (e && e.pointerId !== JOY.id)) return;
  JOY.active = false; JOY.vx = JOY.vy = 0;
  const [base, knob] = joyEls(); base.classList.remove('live', 'dir', 'held'); base.style.left = base.style.top = ''; knob.style.transform = '';
  if (!JOY.keys.size) P.tx = null;
};
el('joyZone').addEventListener('pointerup', joyEnd); el('joyZone').addEventListener('pointercancel', joyEnd);
el('joyZone').addEventListener('lostpointercapture', joyEnd);   // (v276) a finger lifted while the game was busy (a warp) must not leave the stick held

/* WASD / arrows drive the same vector (works in both modes) */
const KEYDIR = {w:[0, -1], arrowup:[0, -1], s:[0, 1], arrowdown:[0, 1], a:[-1, 0], arrowleft:[-1, 0], d:[1, 0], arrowright:[1, 0]};
function keyVec(){ let x = 0, y = 0; for (const k of JOY.keys){ x += KEYDIR[k][0]; y += KEYDIR[k][1]; } const l = Math.hypot(x, y); return l ? [x / l, y / l] : [0, 0]; }
window.addEventListener('keydown', e => {
  if (PAUSED || typing(e) || !plainKey(e)) return;
  const k = keyOf(e);   // by position: W A S D work with the Thai layout too
  if (!(k in KEYDIR)) return;   // (v298) the owner: W A S D move the hero on a PC too (not only in joystick mode)
  JOY.keys.add(k); e.preventDefault(); e.stopImmediatePropagation();
}, true);
window.addEventListener('keyup', e => { const k = keyOf(e); if (JOY.keys.delete(k) && !JOY.keys.size && !JOY.active) P.tx = null; });

/* called every frame from main.js */
function updJoystick(){
  let vx = JOY.vx, vy = JOY.vy;
  if (!JOY.active && JOY.keys.size) [vx, vy] = keyVec();
  if (Math.hypot(vx, vy) < .2 || P.dead || P.roll || P.capT > 0) return;
  botPauseFromManual();
  if (P.sit){ P.sit = false; renderHotbar(); renderMoba(); }
  P.target = null; P.npc = null; P.loot = null; P.pending = null; P.cast = null;
  const sp = Math.min(1, Math.hypot(vx, vy));
  P.tx = P.x + vx / Math.hypot(vx, vy) * 40 * sp; P.ty = P.y + vy / Math.hypot(vx, vy) * 40 * sp;
}
