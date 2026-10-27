/* VAYRATHEN — js/game/effects.js */
'use strict';

/* ---------- effects ---------- */
function addText(x, y, s, col, size = 28){ if (!SETTINGS.dmgNumbers) return; texts.push({x, y, s, col, size, t:0, life:size >= 20 && /!$/.test(s) ? 1.35 : 1}); }   // criticals stay a little longer
function toast(s){ toastMsg = s; toastT = 1.8; }
function banner(s){ const b = $('#banner'); b.innerHTML = `<i class='pj'></i><span>${s}</span><i class='pj'></i>`; b.hidden = false; b.classList.remove('show'); requestAnimationFrame(() => b.classList.add('show')); bannerT = 3.5; }
function log(s, cls = ''){ const now = new Date(); LOG.unshift({s, cls, tm:now.toTimeString().slice(0, 5)}); if (LOG.length > 60) LOG.pop(); dirty = true; }
function updFx(dt){
  for (const p of projs){
    if (p.delay > 0){ p.delay -= dt; continue; }
    const tx = p.t.x, ty = p.t.y - MOB_H[p.t.type] * .5;
    const d = Math.hypot(tx - p.x, ty - p.y);
    if (p.t.dead){ p.done = true; continue; }
    if (d < 12){ p.done = true; p.hit(); continue; }
    const s = Math.min(d, p.speed * dt); p.ang = Math.atan2(ty - p.y, tx - p.x);
    p.x += (tx - p.x) / d * s; p.y += (ty - p.y) / d * s;
  }
  projs = projs.filter(p => !p.done);
  for (const f of fx) f.t += dt; fx = fx.filter(f => f.t < f.life);
  VFX.update(dt);
  for (const t of texts){ t.t += dt; t.y -= dt * 38; } texts = texts.filter(t => t.t < t.life);
  for (const m of mobs) if (m.lunge) m.lunge = Math.max(0, m.lunge - dt);
}
