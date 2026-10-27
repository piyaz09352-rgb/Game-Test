/* VAYRATHEN — js/sys/talkbtn.js — talking to NPCs with the joystick controls
   Walk up to an NPC and the big attack button turns into a TALK button (speech bubble + the NPC's name);
   press it to open their dialog. It turns back into the attack button when you walk away or a monster is
   targeted. A small "talk" prompt also floats over the NPC you are next to. */
'use strict';

const TALK = {n:null, t:0};
function talkNear(){
  if (P.dead || !el('dialog').hidden) return null;
  if (P.target && !P.target.dead && dist(P.target, P) < 200) return null;
  let best = null, bd = 110; for (const n of NPCS){ const d = dist(n, P); if (d < bd){ bd = d; best = n; } } return best;
}
EV.on('tick', dt => {
  TALK.t -= dt; if (TALK.t > 0) return; TALK.t = .15;
  const n = talkNear(), b = document.querySelector('.mo.atk'); TALK.n = n; if (!b) return;
  b.classList.toggle('talk', !!n);
  let tag = b.querySelector('.talkbadge');
  if (n){ if (!tag){ tag = document.createElement('span'); tag.className = 'talkbadge'; b.appendChild(tag); } const s = `💬 ${L('คุย', 'Talk')}`; if (tag.textContent !== s) tag.textContent = s; b.setAttribute('aria-label', L(`คุยกับ ${n.name}`, `Talk to ${n.en || n.name}`)); }
  else if (tag){ tag.remove(); b.setAttribute('aria-label', L('โจมตี', 'Attack')); }
});
{
  const _a = mobaAction;
  mobaAction = function(kind, id){
    if (kind === 'atk' && !PAUSED){ const n = talkNear(); if (n){ botPauseFromManual(); P.tx = null; P.target = null; P.npc = null; P.moving = false; P.dir = SPR.dirFromVec(n.x - P.x, n.y - P.y); EV.emit('npc', n.id); openNpc(n); return; } }
    return _a(kind, id);
  };
}
/* the prompt over the NPC */
EV.on('draw', () => {
  const n = TALK.n, b = document.querySelector('.mo.atk'); if (!n || !b || !b.offsetParent) return;
  const z = typeof TAG_Z === 'function' ? TAG_Z() : 1, x = sx(n.x), y = sy(n.y - 66) - Math.abs(Math.sin(T * 3)) * 3 * z;
  ctx.save(); ctx.translate(x, y); ctx.scale(z, z); ctx.fillStyle = 'rgba(30,18,8,.85)'; ctx.strokeStyle = 'rgba(255,214,120,.95)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-16, -11, 32, 18, 8) : ctx.rect(-16, -11, 32, 18); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-4, 7); ctx.lineTo(0, 12); ctx.lineTo(4, 7); ctx.fill();
  ctx.fillStyle = '#ffe8a8'; ctx.font = '700 10px Mali, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(L('คุย', 'Talk'), 0, -1.5); ctx.restore();
});
