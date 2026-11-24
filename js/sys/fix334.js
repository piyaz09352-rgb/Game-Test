/* VAYRATHEN — js/sys/fix334.js — (v334) after the 100-bot playtest:
   1. pack leaders (หัวหน้าฝูง) in the beginner fields (maps whose top level is 15 or less) hit 30% softer: one blow took
      78 of a new player's 166 HP. Everywhere else they are unchanged.
   2. a guide arrow for new players (Lv 1–20) who play by hand: when nothing their level is close by, a small gold arrow
      beside the hero points to the nearest monster that suits them; in Aren it points to the gate of the right field.
      Off with Auto, while fighting, and in Settings (ลูกศรนำทางมือใหม่). */
'use strict';
const FX334 = {beginner:() => { const m = typeof MAPS !== 'undefined' && MAPS[MAP_ID]; return !!(m && m.lv && m.lv[1] <= 15); }};

// ---- 1. softer pack leaders in the beginner fields ----
if (typeof HK !== 'undefined' && HK.atkMul) HK.atkMul.push((m, mult) => (m && m.elite && FX334.beginner() ? mult * .7 : mult));

// ---- 2. the guide arrow ----
const GUIDE = {t:0, aim:null, a:0, label:''};
const guideOn = () => typeof SETTINGS === 'undefined' || SETTINGS.guideArrow !== false;
const guideMapAvg = id => { const m = MAPS[id]; if (!m) return null; const ls = (m.mobs || []).map(k => MOB[k] && !MOB[k].boss && MOB[k].lvl).filter(Boolean); return ls.length ? ls.reduce((a, b) => a + b, 0) / ls.length : null; };
const guideFits = m => !m.dead && !m.vanish && !m.dummy && m.def && !m.def.boss && !m.elite && m.def.lvl <= S.lvl + 2 && m.def.lvl >= S.lvl - 8;
function guidePick(){
  if (!guideOn() || typeof S === 'undefined' || !S || S.lvl > 20 || P.dead || (typeof BOT !== 'undefined' && BOT.on) || (typeof PAUSED !== 'undefined' && PAUSED)) return null;
  if (S.tut && !S.tut.done) return null;   // the tutorial leads the way itself
  if (P.target && !P.target.dead) return null;
  if (MAP_ID === 0){   // in Aren: the gate to the field that fits this level best
    let best = null, bd = 1e9; for (const g of (typeof GATES !== 'undefined' ? GATES : [])){ const a = guideMapAvg(g.to); if (a == null) continue; const d = Math.abs(a - S.lvl); if (d < bd){ bd = d; best = g; } }
    return best ? {x:best.x, y:best.y, label:(MAPS[best.to] && MAPS[best.to].name) || ''} : null; }
  if (typeof inVillage === 'function' && inVillage(P)) return null;
  let near = null, nd = 1e9;
  for (const m of mobs){ if (!guideFits(m)) continue; const d = Math.hypot(m.x - P.x, m.y - P.y); if (d < nd){ nd = d; near = m; } }
  if (!near || nd < 420) return null;   // something to hit is already on screen
  return {x:near.x, y:near.y, label:`${typeof nm === 'function' ? nm(near.def) : ''} Lv ${near.def.lvl}`};
}
EV.on('tick', dt => { GUIDE.t -= dt; if (GUIDE.t <= 0){ GUIDE.t = .5; const p = guidePick(); GUIDE.aim = p; if (p) GUIDE.label = p.label; } GUIDE.a = Math.max(0, Math.min(1, GUIDE.a + (GUIDE.aim ? dt * 3 : -dt * 4))); });
EV.on('draw', () => {
  if (GUIDE.a <= .01 || !GUIDE.aim || typeof ctx === 'undefined') return;
  const ang = Math.atan2(GUIDE.aim.y - P.y, GUIDE.aim.x - P.x), x0 = sx(P.x), y0 = sy(P.y) - 18 * PX, R = 50 * PX, bob = Math.sin(T * 4) * 3 * PX;
  const x = x0 + Math.cos(ang) * (R + bob), y = y0 + Math.sin(ang) * (R + bob), s = 12 * PX;
  ctx.save(); ctx.globalAlpha = GUIDE.a * .95; ctx.translate(x, y); ctx.rotate(ang);
  ctx.shadowColor = 'rgba(255,200,80,.9)'; ctx.shadowBlur = 10 * PX;
  const g = ctx.createLinearGradient(-s, 0, s, 0); g.addColorStop(0, '#ffe9a8'); g.addColorStop(1, '#ffb43a');
  ctx.fillStyle = g; ctx.strokeStyle = 'rgba(40,20,70,.95)'; ctx.lineWidth = 2 * PX; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(s * 1.1, 0); ctx.lineTo(-s * .7, -s * .85); ctx.lineTo(-s * .25, 0); ctx.lineTo(-s * .7, s * .85); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = .8 * PX; ctx.stroke();
  ctx.restore();
  if (GUIDE.label){ ctx.save(); ctx.globalAlpha = GUIDE.a * .9; ctx.font = `700 ${Math.round(10 * PX)}px Sarabun, "Noto Sans Thai", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tx = x, ty = y + (Math.sin(ang) > .5 ? -1 : 1) * (s + 10 * PX), w = ctx.measureText(GUIDE.label).width + 10 * PX, h = 15 * PX;
    ctx.fillStyle = 'rgba(16,12,40,.72)'; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(tx - w / 2, ty - h / 2, w, h, h / 2); else ctx.rect(tx - w / 2, ty - h / 2, w, h); ctx.fill();
    ctx.fillStyle = '#ffe08a'; ctx.fillText(GUIDE.label, tx, ty); ctx.restore(); }
});
// Settings switch (next to the other help switches)
if (typeof renderSettings === 'function'){ const _rs = renderSettings; renderSettings = function(){ _rs.apply(this, arguments);
  const pane = el('pane-settings'); if (!pane || pane.querySelector('#set-guideArrow')) return;
  const row = document.createElement('label'); row.className = 'set';
  row.innerHTML = `<span><b>${L('ลูกศรนำทางมือใหม่', 'New-player guide arrow')}</b><small>${L('เลเวล 1–20 · ชี้ไปหามอนที่เหมาะกับเลเวลเมื่อแถวนี้ไม่มี (ในเมืองชี้ไปประตูทุ่งที่เหมาะ)', 'Lv 1–20 · points to monsters of your level when none are near (in town, to the right field gate)')}</small></span><input type="checkbox" id="set-guideArrow" data-set="guideArrow" ${guideOn() ? 'checked' : ''}><i class="sw"></i>`;
  const secs = [...pane.querySelectorAll('.sec')], anchor = secs.find(n => /การควบคุม|^Controls?$/.test(n.textContent.trim()));
  if (anchor && anchor.nextSibling) anchor.parentNode.insertBefore(row, anchor.nextSibling); else pane.appendChild(row); }; }
