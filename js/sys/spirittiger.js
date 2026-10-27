/* VAYRATHEN — js/sys/spirittiger.js — the Warden's Spirit Tiger (เสือสาง) drawn like the rest of the world
   The tiger used to be a few flat orange shapes. It now uses the game's own 3D-rendered tiger sprite (the Mist
   Tiger's body) recoloured to a warm spirit orange, at a size that stands about shoulder-high to your hero, with a
   soft spirit glow, and a faint glowing rim. It walks, pounces and faces where it moves. */
'use strict';

const STG = {base:'misttiger', scale:.8, filter:'sepia(.85) saturate(2.6) hue-rotate(-18deg) brightness(.98) contrast(1.15)'};
function stgDraw(g, s, cx, cy){
  const sh = SHEETS && SHEETS[STG.base]; if (!sh) return;
  // face where it is going: remember the last spot
  if (s._px != null){ const dx = s.x - s._px, dy = s.y - s._py; if (Math.hypot(dx, dy) > .4) s.dir = SPR.dirFromVec(dx, dy); }
  s._px = s.x; s._py = s.y;
  const x = s.x - cx, y = s.y - cy, fade = Math.max(0, Math.min(1, s.t * 3, (s.dur - s.t) * 2));
  const act = s.pounce > 0 ? 'attack' : s.moving ? 'walk' : 'idle', at = s.pounce > 0 ? (.3 - s.pounce) : s.t;
  g.save();
  // ground shadow and a warm spirit glow under it
  g.globalAlpha = .3 * fade; g.fillStyle = '#1e0f05'; g.beginPath(); g.ellipse(x, y, 17, 5, 0, 0, 7); g.fill();
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = (.16 + Math.sin(T * 3) * .04) * fade;
  const gr = g.createRadialGradient(x, y - 14, 0, x, y - 14, 34); gr.addColorStop(0, 'rgba(255,150,60,1)'); gr.addColorStop(1, 'rgba(255,150,60,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y - 14, 34, 0, 7); g.fill();
  g.globalCompositeOperation = 'source-over';
  // the tiger
  g.translate(x, y); g.scale(STG.scale, STG.scale);
  g.globalAlpha = .92 * fade; g.filter = STG.filter;
  SPR.draw(g, sh, act, s.dir || 0, at, 0, 0);
  // a bright spirit rim on top
  g.filter = 'none'; g.globalCompositeOperation = 'lighter'; g.globalAlpha = (.07 + Math.sin(T * 5) * .03) * fade;
  SPR.draw(g, sh, act, s.dir || 0, at, 0, 0);
  g.restore();
}
VFX.drawTiger = stgDraw;
