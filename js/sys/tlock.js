/* VAYRATHEN — js/sys/tlock.js — MOBA-style target lock
   · ปุ่มล็อคเป้า (crosshair beside the MOBA buttons, or Tab on a keyboard): locks the best enemy in range; tap again
     to jump to the next one; hold it (or Shift+Tab / Esc) to let go.
   · A locked enemy stays your target while you steer with the joystick, so the attack button and skills always hit
     it, not whatever happens to be closest. The lock lets go when it dies or runs far away.
   · Who is picked: always the closest; of two about as close, the one with less HP (v30). As soon as the target is out of
     reach (you walked off, or it did), the closest is picked again the same way (v31). Settings → Controls: auto lock on/off.
   A red rotating reticle marks the locked enemy.
   (v57) The lock button is now an on/off switch: pick a monster (point at it, click or tap it), press ล็อคเป้า and that
   monster stays your target, attacks and skills chase it and nothing else is picked, until it dies or you press the
   button again (Tab does the same). With nothing picked, the closest enemy is locked. A gold padlock marks it.
   (v58) The lock button and padlock are gone. The attack button does both jobs: tap it (or tap it fast, again and
   again) to attack; hold it to pick the target: after a moment the next enemy nearby is picked, and every half second
   held the one after that. The picked enemy stays your target for attacks and targeted skills until it dies, you tap
   another monster, or you hold the button again. Tab picks the next enemy too; Shift+Tab or Esc lets go. */
'use strict';

const TLK = {m:null, holdT:0, hard:false};
const TLK_RANGE = 520, TLK_KEEP = 900;   // lock search range, and how far it may run before the lock lets go
const TLK_MODES = [['ใกล้สุด', 'Closest'], ['HP น้อยสุด', 'Lowest HP'], ['HP % น้อยสุด', 'Lowest HP %'], ['บอส/อีลิทก่อน', 'Bosses & elites first']];
if (SETTINGS.tgtMode == null) SETTINGS.tgtMode = 0;
if (SETTINGS.tgtAuto == null) SETTINGS.tgtAuto = true;

const tlkOk = m => m && !m.dead && !m.vanish && mobs.includes(m);
const tlkValid = () => { if (TLK.m && (!tlkOk(TLK.m) || (!TLK.hard && dist(TLK.m, P) > TLK_KEEP))){ const was = TLK.hard; tlkSet(null); if (was) toast(L('เป้าหมายล้มแล้ว · ปลดล็อคเป้า', 'Target down · lock released')); } return TLK.m; };
function tlkScore(m){
  const d = dist(m, P), mode = +SETTINGS.tgtMode || 0;
  if (mode === 1) return m.hp * 1e3 + d;
  if (mode === 2) return (m.hp / (m.maxhp || m.def.hp || m.hp || 1)) * 1e6 + d;
  if (mode === 3) return (m.def.boss ? 0 : m.elite ? 1e6 : 2e6) + d;
  return d;
}
/* v30: always the closest first, and of two about as close the one with less HP (tgtCmp, game/bot.js) */
function tlkList(range){ return mobs.filter(m => tlkOk(m) && dist(m, P) <= range).sort(tgtCmp); }
function tlkPick(range){ return tlkList(range)[0] || null; }
function tlkSet(m, say){
  TLK.m = m || null; if (!m) TLK.hard = false;
  if (m){ P.target = m; P.tx = null; P.npc = null; if (say) SFX.play && SFX.play('click'); }
  tlkBtn();
}
function tlkBtn(){ const b = document.querySelector('.mu.tlock'); if (b){ b.classList.toggle('on', !!TLK.hard); b.setAttribute('aria-pressed', TLK.hard ? 'true' : 'false'); } }
/* (v58) hold the attack button (or press Tab): pick the next enemy nearby and keep it as the target */
function tlkPickNext(quiet){
  const list = tlkList(TLK_RANGE).filter(m => !m.def.npc); if (!list.length){ if (!quiet) toast(L('ไม่มีเป้าหมายใกล้ ๆ', 'No target nearby')); return null; }
  const cur = tlkOk(P.target) ? P.target : tlkOk(TLK.m) ? TLK.m : null, i = cur ? list.indexOf(cur) : -1, t = list[(i + 1) % list.length];
  tlkSet(t, true); TLK.hard = true; P.tapped = t; TLK.flash = T; return t;
}
function tlkCycle(){
  const list = tlkList(TLK_RANGE); if (!list.length){ tlkSet(null); toast(L('ไม่มีเป้าหมายใกล้ ๆ', 'No target nearby')); return; }
  const i = TLK.m ? list.indexOf(TLK.m) : -1; tlkSet(list[(i + 1) % list.length], true);
}
function tlkClear(){ if (!TLK.m && !TLK.hard) return; tlkSet(null); if (P.target && !P.target.dead) P.target = null; toast(L('ปลดล็อคเป้าแล้ว', 'Target lock released')); }

/* the closest-enemy finders used by the attack button and skills: a live lock wins, then the chosen priority */
const tlkBot = () => typeof BOT !== 'undefined' && BOT.on && !TLK.hard;
nearestEnemy = function(range){ const t = tlkBot() ? null : tlkValid(); if (t && (TLK.hard || dist(t, P) <= Math.max(range, TLK_RANGE))) return t; return tlkPick(range); };
nearestFoe = function(r){ const t = tlkBot() ? null : tlkValid(); if (t && (TLK.hard || dist(t, P) <= r)) return t; return tlkPick(r); };

/* steering with the joystick drops P.target; a lock keeps it for the next attack or skill */
{ const _j = updJoystick;
  updJoystick = function(){ const keep = tlkValid(); const r = _j.apply(this, arguments); if (keep && !P.target && P.tx != null) TLK.m = keep; return r; }; }
{ const _a = mobaAction;
  mobaAction = function(kind){ const t = tlkValid();
    if (t && (kind === 'atk' || kind === 'skill' || kind === 'cap')){ P.target = t; P.tx = null; }
    return _a.apply(this, arguments); }; }
/* clicking or tapping a monster yourself locks onto it */
/* v30: walk out of range of the enemy you were fighting and the target is picked again, closest first */
const TGT_OUT = {m:null, inR:false};
const tgtReach = m => (DER.range || 60) + ((m.def && m.def.r) || 12) + 24;   // the attack's reach to this monster
const tgtSteer = () => (typeof JOY !== 'undefined' && (Math.hypot(JOY.vx, JOY.vy) >= .2 || JOY.keys.size > 0));
EV.on('tick', () => {
  if (TLK.hard){ if (P.tapped && P.tapped !== TLK.m && tlkOk(P.tapped) && P.target === P.tapped){ TLK.m = P.tapped; return; }   // you tapped another monster: that one is the pick now
    const t = tlkValid(); if (t && !P.dead && !tgtSteer() && P.target !== t){ P.target = t; P.npc = null; } return; }   // a picked target never changes by itself
  if (tlkBot() || P.dead) return;
  // steering with the joystick clears P.target, so the lock is the target then
  const lk = tlkValid(), t = P.target && tlkOk(P.target) ? P.target : lk;
  if (t !== TGT_OUT.m){ TGT_OUT.m = t; TGT_OUT.inR = false; }
  if (!t || dist(t, P) <= tgtReach(t)){ if (t) TGT_OUT.inR = true; return; }
  // out of reach: the closest is picked again at once, except a far monster you tapped and are walking to
  if (t === P.tapped && !TGT_OUT.inR && !tgtSteer()) return;
  const n = tlkPick(TLK_RANGE); if (n === t) return;
  TGT_OUT.m = n; TGT_OUT.inR = false; P.tapped = null;
  if (n){ if (lk || SETTINGS.tgtAuto) tlkSet(n); if (P.target) P.target = n; } else { if (lk) tlkSet(null); P.target = null; }
});
EV.on('tick', () => { if (TLK.hard) return; if (tlkBot()){ if (TLK.m) tlkSet(null); return; } const t = tlkValid(); if (P.target && P.target !== t && tlkOk(P.target) && mobs.includes(P.target) && SETTINGS.tgtAuto) TLK.m = P.target; if (TLK.m && P.dead) tlkSet(null); });

/* the attack button: a tap attacks (joystick.js, on press); held for TLK_HOLD it picks the next enemy, then one more
   every TLK_STEP while still held */
const TLK_HOLD = .35, TLK_STEP = .55;
document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('[data-mo="atk"]'); if (!b || b.disabled) return; TLK.press = {t:T, n:0, id:e.pointerId}; }, true);
const tlkUp = e => { if (TLK.press && (e.pointerId == null || e.pointerId === TLK.press.id)) TLK.press = null; };
document.addEventListener('pointerup', tlkUp, true); document.addEventListener('pointercancel', tlkUp, true);
EV.on('tick', () => { const h = TLK.press; if (!h || P.dead || PAUSED) return;
  if (T - h.t >= TLK_HOLD + h.n * TLK_STEP){ h.n++; const t = tlkPickNext(h.n > 1); if (t) toast(L(`เป้าหมาย: ${nm(t.def)}`, `Target: ${t.def.en || nm(t.def)}`)); } });
window.addEventListener('keydown', e => {
  if (e.key !== 'Tab' || typing(e) || !S || P.dead) return;
  e.preventDefault(); if (e.shiftKey) tlkClear(); else { const t = tlkPickNext(); if (t) toast(L(`เป้าหมาย: ${nm(t.def)}`, `Target: ${t.def.en || nm(t.def)}`)); }
});
window.addEventListener('keydown', e => { if (e.key === 'Escape' && TLK.m && !(e.target.closest && e.target.closest('input,textarea'))) tlkSet(null); });

/* the reticle over the locked enemy */
EV.on('draw', () => {
  const m = tlkValid(); if (!m) return;
  const x = sx(m.x), y = sy(m.y), r = Math.max(18, (m.def.r || 16) * PX * .9), a = T * 1.8, pul = 1 + .08 * Math.sin(T * 6);
  ctx.save(); ctx.translate(x, y - r * .5); ctx.scale(pul, pul * .62);
  ctx.strokeStyle = '#ff4a5a'; ctx.shadowColor = 'rgba(255,60,80,.9)'; ctx.shadowBlur = 8; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++){ const s = a + i * Math.PI / 2; ctx.beginPath(); ctx.arc(0, 0, r, s, s + .9); ctx.stroke(); }
  ctx.lineWidth = 2; ctx.strokeStyle = '#ffd0d4';
  for (let i = 0; i < 4; i++){ const s = -a * .7 + i * Math.PI / 2 + .45; ctx.beginPath(); ctx.moveTo(Math.cos(s) * (r + 10), Math.sin(s) * (r + 10)); ctx.lineTo(Math.cos(s) * (r + 2), Math.sin(s) * (r + 2)); ctx.stroke(); }
  ctx.restore();
});

/* Settings → Controls */
{ const _rs = renderSettings;
  renderSettings = function(){ const r = _rs.apply(this, arguments); const pane = el('pane-settings'); if (!pane || pane.querySelector('#set-tgtAuto')) return r;
    const ctl = pane.querySelector('#set-control'); const row = ctl && ctl.closest('.set'); if (!row) return r;
    row.insertAdjacentHTML('afterend', `
    <label class="set"><span><b>${L('ล็อคเป้าอัตโนมัติ', 'Auto lock')}</b><small>${L('โจมตี ใช้สกิล หรือแตะมอน แล้วล็อคตัวนั้นไว้ เดินด้วยจอยก็ไม่หลุดเป้า', 'Attacking, a skill or tapping a monster locks it; steering with the joystick keeps it')}</small></span><input type="checkbox" id="set-tgtAuto" data-set="tgtAuto" ${SETTINGS.tgtAuto ? 'checked' : ''}><i class="sw"></i></label>`);
    return r; }; }
{ const st = document.createElement('style');
  st.textContent = `#mobaUtil .mu.tlock{display:none !important}`;
  document.head.appendChild(st); }
