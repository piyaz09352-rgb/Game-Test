/* VAYRATHEN — js/sys/joyfit.js — (v89) touch buttons never sit on top of each other
   The sideways-phone layout places each group by its share of the screen, so on a phone that is shorter or wider
   than the owner's the potion pair or the row of small buttons (grab · ride · catch · rest · Auto) could land on a
   skill, the dodge button or the joystick. After the layout is placed, each of those two groups that touches
   anything is moved to the nearest free spot (a little smaller if it has to be). Buttons are round, so they are
   tested as circles. A group the player placed by hand (จัดตำแหน่งปุ่ม) stays where the player put it.
   Runs only when the layout is placed, never per frame. */
'use strict';

const JF = {gap:4, key:'', got:{}};   // got: the spot found for each group at this screen size (so a redraw only re-applies it)
/* a button or panel in the ui's own (unscaled) pixels */
function jfShape(e, u, k){ const r = e.getBoundingClientRect(), cs = getComputedStyle(e), round = parseFloat(cs.borderTopLeftRadius) >= Math.min(e.offsetWidth, e.offsetHeight) * .45;
  return {x:(r.left - u.left) / k, y:(r.top - u.top) / k, w:r.width / k, h:r.height / k, round}; }
function jfHit(a, b, gap){
  if (a.x >= b.x + b.w + gap || b.x >= a.x + a.w + gap || a.y >= b.y + b.h + gap || b.y >= a.y + a.h + gap) return false;
  const ca = [a.x + a.w / 2, a.y + a.h / 2], cb = [b.x + b.w / 2, b.y + b.h / 2];
  if (a.round && b.round) return Math.hypot(ca[0] - cb[0], ca[1] - cb[1]) < Math.min(a.w, a.h) / 2 + Math.min(b.w, b.h) / 2 + gap;
  if (a.round || b.round){ const c = a.round ? a : b, r = c === a ? b : a, cc = c === a ? ca : cb, rad = Math.min(c.w, c.h) / 2 + gap;
    const nx = clamp(cc[0], r.x, r.x + r.w), ny = clamp(cc[1], r.y, r.y + r.h); return Math.hypot(cc[0] - nx, cc[1] - ny) < rad; }
  return true;
}
const jfVis = e => e && !e.hidden && e.offsetParent && e.offsetWidth > 0;
function jfFitHE(){
  const ui = el('ui'); if (!ui || !heMoba() || HE.on) return;
  const mine = HE.data[heOri()] || {}, def = heDef() || {};
  const u = ui.getBoundingClientRect(), k = (u.width / (ui.offsetWidth || 1)) || 1, W = ui.offsetWidth, H = ui.offsetHeight;
  const key = [W, H, (S.hot || []).join(), JSON.stringify(mine), el('mobaPot') && el('mobaPot').children.length, el('mobaUtil') && el('mobaUtil').children.length].join('|');
  if (key === JF.key){ for (const g of HE_GROUPS) if (JF.got[g.k] && !mine[g.k]) hePlace(g, el(g.id), JF.got[g.k]); return; }
  JF.key = key; JF.got = {};
  const blockers = [];
  const addEls = els => { for (const e of els) if (jfVis(e)) blockers.push(jfShape(e, u, k)); };
  addEls(el('mobaAct').querySelectorAll('.mo'));
  addEls(['joy', 'chatBtn', 'charCard', 'goalCard', 'mapCard', 'rail', 'chips', 'tgtFrame'].map(el));
  for (const g of HE_GROUPS.filter(g => g.k === 'util' || g.k === 'pot')){
    const box = el(g.id); if (!jfVis(box)) continue;
    const kids = [...box.children].filter(jfVis); if (!kids.length) continue;
    const now = kids.map(e => jfShape(e, u, k));
    const clear = sh => sh.every(s => s.x >= 0 && s.y >= 0 && s.x + s.w <= W && s.y + s.h <= H && !blockers.some(b => jfHit(s, b, JF.gap)));
    // (v146) the potions belong to potright.js (a fixed spot beside the skill wheel): never moved from here — the two
    // placers used to fight (this one wanted a wider gap and threw them back to an old default spot: "floating")
    if (g.k === 'pot' && !mine.pot){ blockers.push(...now); continue; }
    if (mine[g.k] || clear(now)){ blockers.push(...now); continue; }   // hand-placed, or already free
    // the group's own layout at scale 1, then try spots near the planned one, largest size first
    const bw = box.offsetWidth, bh = box.offsetHeight, rel = kids.map(e => ({x:e.offsetLeft, y:e.offsetTop, w:e.offsetWidth, h:e.offsetHeight, round:jfShape(e, u, k).round}));
    const v0 = def[g.k] || {cx:.8, cy:.6, s:1}, at = (cx, cy, s) => { const w = bw * s, h = bh * s, x = clamp(cx * W - w / 2, 0, Math.max(0, W - w)), y = clamp(cy * H - h / 2, 0, Math.max(0, H - h));
      return rel.map(r => ({x:x + r.x * s, y:y + r.y * s, w:r.w * s, h:r.h * s, round:r.round})); };
    let best = null;
    for (const s of [v0.s, v0.s * .9, v0.s * .8, v0.s * .7]){
      for (let cy = .3; cy <= .99; cy += .015) for (let cx = .3; cx <= .99; cx += .01){
        const sh = at(cx, cy, s); if (!clear(sh)) continue;
        const d = Math.hypot((cx - v0.cx) * W, (cy - v0.cy) * H); if (!best || d < best.d) best = {cx, cy, s, d, sh}; }
      if (best) break;
    }
    if (!best){ blockers.push(...now); continue; }
    JF.got[g.k] = {cx:best.cx, cy:best.cy, s:best.s}; hePlace(g, box, JF.got[g.k]); blockers.push(...best.sh);
  }
}
{ const _ha = heApply; heApply = function(){ const r = _ha.apply(this, arguments); try { jfFitHE(); } catch (e) {} return r; }; }
