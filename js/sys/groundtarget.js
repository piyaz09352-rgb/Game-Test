/* VAYRATHEN — js/sys/groundtarget.js — PC: area skills are aimed at a spot on the ground
   With a mouse, pressing an area skill (a spell or volley that lands around a point: aoeTarget / fieldDot) no longer fires
   at the nearest monster: a circle the size of the skill follows the mouse; LEFT CLICK casts it there, RIGHT CLICK or Esc
   cancels. Too far away → the hero walks into range first, then casts. On touch screens and while Auto runs nothing
   changes (the skill goes to the target as before). */
'use strict';

const GT = {id:null, mx:0, my:0, pend:null};
const gtArea = sk => !!sk && (sk.type === 'aoeTarget' || sk.type === 'fieldDot');
const gtMouse = () => { try { return matchMedia('(pointer:fine)').matches; } catch (e){ return true; } };
function gtCast(id, x, y){
  const sk = SKILLS[id]; if (!sk) return;
  const spot = {x, y, dead:false, vanish:false, ground:true, type:'boar', hp:1, maxhp:1, def:{r:0, lvl:1, elem:'neutral'}};
  const prev = P.target; P.target = spot; GT.forced = true;
  try { trySkill(id); } finally { GT.forced = false; P.target = prev && !prev.ground ? prev : null; if (P.pending === id) P.pending = null; }
}
{ const _ts = trySkill;
  trySkill = function(id){ const sk = SKILLS[id];
    if (!GT.forced && gtArea(sk) && gtMouse() && !(typeof BOT !== 'undefined' && BOT.on) && skl(id) && !P.dead){
      if ((P.cds[id] || 0) > 0 || S.sp < sk.sp(skl(id))) return _ts.apply(this, arguments);   // let the usual messages show
      GT.id = GT.id === id ? null : id; GT.pend = null; if (GT.id) toast(L('เลือกพื้นที่ · คลิกซ้ายเพื่อใช้ · คลิกขวาหรือ Esc ยกเลิก', 'Pick a spot · left click to cast · right click or Esc to cancel')); return; }
    return _ts.apply(this, arguments); }; }
cv.addEventListener('pointermove', e => { if (!GT.id) return; const p = worldPt(e); GT.mx = p.x; GT.my = p.y; });
cv.addEventListener('pointerdown', e => {
  if (!GT.id || e.pointerType === 'touch') return; e.stopImmediatePropagation(); e.preventDefault();
  const id = GT.id; GT.id = null; if (e.button === 2) return;
  const p = worldPt(e), sk = SKILLS[id], rng = skillRange(id);
  if (Math.hypot(p.x - P.x, p.y - P.y) <= rng) gtCast(id, p.x, p.y);
  else { GT.pend = {id, x:p.x, y:p.y}; P.target = null; P.pending = null; P.tx = p.x; P.ty = p.y; }
}, {capture:true});
cv.addEventListener('contextmenu', e => { if (GT.id || GT.pend){ e.preventDefault(); GT.id = null; GT.pend = null; } });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && (GT.id || GT.pend)){ GT.id = null; GT.pend = null; } });
EV.on('tick', () => { const g = GT.pend; if (!g) return; if (P.dead){ GT.pend = null; return; }
  if (Math.hypot(g.x - P.x, g.y - P.y) <= skillRange(g.id)){ GT.pend = null; P.tx = null; gtCast(g.id, g.x, g.y); }
  else if (P.tx == null){ GT.pend = null; } });
/* the aiming circle (and a marker on a spot you are walking to) */
{ const _o = LIVE.drawOver;
  LIVE.drawOver = function(g, ...a){ const r = _o.call(this, g, ...a);
    const id = GT.id || (GT.pend && GT.pend.id), sk = id && SKILLS[id]; if (!sk) return r;
    const x = (GT.id ? GT.mx : GT.pend.x) - cam.x, y = (GT.id ? GT.my : GT.pend.y) - cam.y, R = sk.radius || 60, ok = Math.hypot((GT.id ? GT.mx : GT.pend.x) - P.x, (GT.id ? GT.my : GT.pend.y) - P.y) <= skillRange(id);
    const col = ok ? '120,200,255' : '255,180,90', pul = .7 + Math.sin(T * 6) * .15;
    g.save(); g.fillStyle = `rgba(${col},${.16 * pul})`; g.strokeStyle = `rgba(${col},.9)`; g.lineWidth = 2; g.setLineDash([8, 6]); g.lineDashOffset = -T * 20;
    g.beginPath(); g.ellipse(x, y, R, R * .5, 0, 0, 7); g.fill(); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 6, y); g.moveTo(x, y - 3); g.lineTo(x, y + 3); g.stroke();
    // the range around the hero
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1; g.beginPath(); g.ellipse(P.x - cam.x, P.y - cam.y, skillRange(id), skillRange(id) * .5, 0, 0, 7); g.stroke();
    g.restore(); return r; }; }
