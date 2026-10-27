/* VAYRATHEN — js/sys/joylay.js — (v107) the skill buttons around the attack button, laid out so none overlap
   Before: only six skill slots had a spot (s0–s5); the 7th and 8th sat on the same spot, and on a short phone the
   potions were pushed into the gaps between skills, so the right thumb area was a heap of overlapping buttons.
   Now, in the touch (joystick) layout:
   · ring 1: the four big skill slots on a quarter circle round the attack button, from its left to straight above;
   · ring 2: the dodge button and the four small slots on a wider quarter circle outside it;
   · each ring's radius grows until neighbours keep a gap, so 4 or 8 skills both fit;
   · the potion pair stays top right above the skill block (as before), the small buttons along the bottom
     (joyfit.js still moves either group if it would touch anything).
   Runs when the touch layout is placed (renderMoba / heApply), never per frame. A layout the player arranged by
   hand (จัดตำแหน่งปุ่ม) still moves the whole skill block where they put it; the ring inside it is this one. */
'use strict';

const JL = {gap:6, a0:Math.PI, a1:Math.PI * 1.5 + .1};   // from straight left to just past straight up
function jlPut(e, x, y){ const w = e.offsetWidth, h = e.offsetHeight;
  e.style.setProperty('left', Math.round(x - w / 2) + 'px', 'important'); e.style.setProperty('top', Math.round(y - h / 2) + 'px', 'important');
  e.style.setProperty('right', 'auto', 'important'); e.style.setProperty('bottom', 'auto', 'important'); }
function jlRing(items, r0, a0, a1){
  if (!items.length) return r0; const n = items.length, s = Math.max(...items.map(e => e.offsetWidth)), step = n > 1 ? (a1 - a0) / (n - 1) : 0;
  const r = Math.max(r0, n > 1 ? (s + JL.gap) / (2 * Math.sin(step / 2)) : r0);
  return {r, s, step, n};
}
function jlLayout(){
  const ui = el('ui'), box = el('mobaAct'); if (!ui || !box || !ui.classList.contains('moba') || !box.offsetWidth) return;
  const atk = box.querySelector('.mo.atk'); if (!atk) return;
  const A = atk.offsetWidth, ax = atk.offsetLeft + A / 2, ay = atk.offsetTop + A / 2;
  const big = [...box.querySelectorAll('.mo.sk:not(.mini)')], small = [...box.querySelectorAll('.mo.sk.mini')], roll = box.querySelector('.mo.roll');
  const outer = roll ? [roll, ...small] : small;
  // (v112) nothing changed since the last layout (same buttons, same sizes): leave them be — no style rewrites,
  // no forced reflow; this runs whenever the HUD is placed, many times a second
  const key = [A, box.offsetWidth, ...big.map(e => e.offsetWidth), ...outer.map(e => e.offsetWidth)].join(',');
  if ([...big, ...outer].every(e => e.__jl === key)) return;
  for (const e of [...big, ...outer]) e.__jl = key;
  const r1 = jlRing(big, A / 2 + JL.gap + (big[0] ? big[0].offsetWidth / 2 : 0), JL.a0, JL.a1);
  big.forEach((e, i) => { const a = JL.a0 + r1.step * i; jlPut(e, ax + Math.cos(a) * r1.r, ay + Math.sin(a) * r1.r); });
  const s2 = outer.length ? Math.max(...outer.map(e => e.offsetWidth)) : 0;
  const r2 = jlRing(outer, (r1.r || A / 2) + (r1.s || 0) / 2 + JL.gap + s2 / 2, JL.a0, JL.a1);
  outer.forEach((e, i) => { const a = JL.a0 + r2.step * i; jlPut(e, ax + Math.cos(a) * r2.r, ay + Math.sin(a) * r2.r); });
  if (typeof JF !== 'undefined') JF.key = '';   // the blockers moved: let joyfit look again
}
/* (v112) the potion pair: ONE system places it — potright.js, a row at the right edge just above the skill block
   (beside it when the minimap is in the way). Before, hudedit.js (its own default spot), joyfit.js and potright.js
   each moved it, so it jumped between two places whenever Auto was switched or the HUD laid out again.
   A spot the player chose by hand (จัดตำแหน่งปุ่ม) still wins. */
if (typeof HE_DEF !== 'undefined' && HE_DEF.land) delete HE_DEF.land.pot;
{ const pot = el('mobaPot'); if (pot && pot.dataset.he && typeof heClear === 'function'){ heClear(pot); delete pot.dataset.he; } }
if (typeof heApply === 'function'){ const _ha = heApply; heApply = function(){ try { jlLayout(); } catch (e) {} return _ha.apply(this, arguments); }; }
if (typeof renderMoba === 'function'){ const _rm = renderMoba; renderMoba = function(){ const r = _rm.apply(this, arguments); try { jlLayout(); } catch (e) {} return r; }; }

