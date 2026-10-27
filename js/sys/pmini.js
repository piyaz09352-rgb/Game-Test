/* VAYRATHEN — js/sys/pmini.js — party members on the minimap
   The minimap used to draw only you, monsters, NPCs, gates and the boss. Now every party member on the same map
   gets a marker: a bright cyan disc with a white ring and a pulsing halo, the first letter of their name above it,
   a small gold crown dot for the leader, and a grey ✕ when they are down. Members on another map are not on this
   map's minimap (the Party window still lists them with their map). Positions come from the presence ghosts
   (NET.ghosts), the same data that draws them in the world. */
'use strict';

function pmMates(){
  const out = []; if (typeof NET === 'undefined' || !NET.party || !NET.ghosts) return out;
  for (const g of NET.ghosts.values()){
    const q = g.q || {}; if (q.pt !== NET.party || typeof g.x !== 'number' || typeof g.y !== 'number') continue;
    out.push({x:g.x, y:g.y, name:String(q.n || '').trim(), dead:!!q.dead, lead:typeof PTY !== 'undefined' && PTY.lead === g.peer});
  }
  return out;
}
function pmDraw(){
  const ms = pmMates(); if (!ms.length) return;
  const mm = document.getElementById('minimap'); if (!mm) return;
  const g = mm.getContext('2d'), w = mm.width, h = mm.height, kx = w / W, ky = h / H, u = w / 170, pulse = (T * 1.4) % 1;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  for (const m of ms){
    const x = m.x * kx, y = m.y * ky;
    if (m.dead){
      g.strokeStyle = '#1a1a1a'; g.lineWidth = 3.2 * u; g.beginPath(); g.moveTo(x - 3.5 * u, y - 3.5 * u); g.lineTo(x + 3.5 * u, y + 3.5 * u); g.moveTo(x + 3.5 * u, y - 3.5 * u); g.lineTo(x - 3.5 * u, y + 3.5 * u); g.stroke();
      g.strokeStyle = '#b9b9b9'; g.lineWidth = 1.5 * u; g.stroke(); continue;
    }
    g.strokeStyle = `rgba(90,235,255,${(1 - pulse) * .8})`; g.lineWidth = 1.4 * u; g.beginPath(); g.arc(x, y, (4.5 + pulse * 8) * u, 0, 7); g.stroke();   // halo
    g.fillStyle = '#4de8ff'; g.strokeStyle = '#04222c'; g.lineWidth = 3 * u; g.beginPath(); g.arc(x, y, 4.2 * u, 0, 7); g.stroke();                       // dark edge
    g.lineWidth = 1.3 * u; g.strokeStyle = '#fff'; g.stroke(); g.fill();                                                                                     // white ring + fill
    if (m.lead){ g.fillStyle = '#ffd23a'; g.strokeStyle = '#3a2204'; g.lineWidth = 1 * u; g.beginPath(); g.arc(x + 4.2 * u, y - 4.2 * u, 2.1 * u, 0, 7); g.fill(); g.stroke(); }
    const ch = [...m.name][0];
    if (ch){ g.font = `700 ${Math.round(7 * u)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.lineJoin = 'round';
      g.lineWidth = 2.4 * u; g.strokeStyle = 'rgba(0,0,0,.85)'; g.strokeText(ch, x, y - 5.2 * u); g.fillStyle = '#e9fdff'; g.fillText(ch, x, y - 5.2 * u); }
  }
  g.restore();
}
{ const _d = drawMini;
  drawMini = function(){ _d.apply(this, arguments); if (document.getElementById('mapCard').classList.contains('folded')) return; try { pmDraw(); } catch (e) {} };
}
