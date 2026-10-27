/* VAYRATHEN — js/sys/heatshade.js — lava that bites, a World Tree that heals (v60)
   · Lava: sparks drift up off every lava pool and river, and standing at the edge scorches you a little
     (−1% HP every 1.5 s, shown in red). The heat never kills: it stops at 1 HP.
   · World Tree: resting in its shade at a camp gives +2% HP and SP every 2 s (shown in green), and at night
     fireflies wander round its crown. They glow steadily, they do not blink.
   Sparks and fireflies are skipped in battery saver. */
'use strict';

const HS = {heatT:0, shadeT:0, glow:null};
const hsTree = () => (typeof PROPS === 'undefined' ? null : PROPS.find(p => p.type === 'worldtree'));
/* how deep into the heat around a lava pool or band: 0 none … 1 at the shore */
function hsHeat(x, y){
  let k = 0;
  for (const w of WATERS){ if (w.kind !== 'lava') continue;
    if (w.k === 'pond'){ const d = Math.hypot((x - w.x) / (w.rx + 34), (y - w.y) / (w.ry + 26)); if (d < 1) k = Math.max(k, Math.min(1, (1 - d) * 3)); }
    else if (w.k === 'band'){ const d = y < w.y0 ? w.y0 - y : y > w.y1 ? y - w.y1 : 0; if (d < 30) k = Math.max(k, 1 - d / 30); } }
  return k;
}
function hsInShade(t, x, y){ return Math.hypot((x - t.x) / 180, (y - (t.y + 36)) / 70) < 1; }

EV.on('tick', dt => {
  if (P.dead || typeof S === 'undefined' || !DER) return;
  // lava heat
  const h = MAP_ID ? hsHeat(P.x, P.y) : 0;
  if (h > 0 && !inVillage(P)){ HS.heatT += dt;
    if (HS.heatT >= 1.5){ HS.heatT = 0; const n = Math.max(1, Math.round(DER.maxhp * .01)); const lost = Math.min(n, S.hp - 1);
      if (lost > 0){ S.hp -= lost; addText(P.x, P.y - 50, `−${lost}`, '#ff5a4a', 14); } } }
  else HS.heatT = 0;
  // World Tree shade
  const t = MAP_ID ? hsTree() : null;
  if (t && hsInShade(t, P.x, P.y)){ HS.shadeT += dt;
    if (HS.shadeT >= 2){ HS.shadeT = 0; const a = Math.max(1, Math.round(DER.maxhp * .02)), b = Math.max(1, Math.round(DER.maxsp * .02));
      const gh = Math.min(a, DER.maxhp - S.hp), gs = Math.min(b, DER.maxsp - S.sp);
      if (gh > 0){ S.hp += gh; addText(P.x - 10, P.y - 50, `+${gh}`, '#2fbf55', 14); }
      if (gs > 0){ S.sp += gs; addText(P.x + 14, P.y - 38, `+${gs} SP`, '#2fbf55', 12); } } }
  else HS.shadeT = 0;
});

function hsGlow(){ if (HS.glow) return HS.glow; const c = HS.glow = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); return c; }
const hsFract = v => v - Math.floor(v);

/* drawn after the night shade so the sparks and fireflies stay bright */
{ const _dw = drawWeather;
  drawWeather = function(g){ const r = _dw.apply(this, arguments);
    if (!MAP_ID || (typeof LITE !== 'undefined' && LITE.on())) return r;
    const gl = hsGlow(); g.save(); g.globalCompositeOperation = 'lighter';
    // lava sparks rise, drift and fade
    const spark = (bx, cy, ry, s) => { const ph = hsFract(T * (.28 + hsFract(s) * .2) + hsFract(s * 1.7));
      const x = bx + Math.sin(T * 1.3 + s) * 6 - cam.x, y = cy + (hsFract(s * 5.3) - .5) * 2 * ry - ph * 70 - cam.y, a = (1 - ph) * Math.min(1, ph * 6);
      g.globalAlpha = a * .9; g.drawImage(gl, x - 5, y - 5, 10, 10); g.globalAlpha = a; g.fillStyle = ph < .5 ? '#ffd27a' : '#ff8a3a'; g.fillRect(x - .9, y - .9, 1.8, 1.8); };
    for (const w of WATERS){ if (w.kind !== 'lava') continue;
      if (w.k === 'pond'){ if (Math.abs(w.x - cam.x - VW / 2) > VW / 2 + w.rx + 40 || Math.abs(w.y - cam.y - VH / 2) > VH / 2 + w.ry + 80) continue;
        for (let i = 0; i < 8; i++){ const s = (w.seed || 1) * 7.3 + i * 13.7; spark(w.x + (hsFract(s * 3.1) - .5) * 1.6 * w.rx, w.y, w.ry * .6, s); } }
      else if (w.k === 'band'){ const cy = (w.y0 + w.y1) / 2, ry = (w.y1 - w.y0) / 2; if (cy + ry < cam.y - 80 || cy - ry > cam.y + VH + 40) continue;
        for (let c = Math.floor(cam.x / 70); c * 70 < cam.x + VW; c++){ const s = c * 5.71 + w.seed * 3.3; spark(c * 70 + hsFract(s * 3.1) * 70, cy, ry * .8, s); } } }
    // fireflies round the World Tree at night
    const t = hsTree();
    if (t && isNight() && Math.abs(t.x - cam.x - VW / 2) < VW && Math.abs(t.y - cam.y - VH / 2) < VH){
      for (let i = 0; i < 16; i++){ const s = i * 2.39, x = t.x + Math.cos(T * .23 + s) * (60 + (i % 5) * 26) + Math.sin(T * .7 + s * 3) * 10 - cam.x,
        y = t.y - 30 - (i % 4) * 34 + Math.sin(T * .31 + s * 1.7) * 40 - cam.y;
        g.globalAlpha = .55; g.drawImage(gl, x - 7, y - 7, 14, 14); g.globalAlpha = .95; g.fillStyle = '#f4ff9a'; g.fillRect(x - 1, y - 1, 2, 2); } }
    g.restore(); return r; }; }
