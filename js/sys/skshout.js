/* VAYRATHEN — js/sys/skshout.js — the skill's name pops up over the caster's head
   Every skill you fire shows its name above your name plate for a moment (a quick pop, a gold-lettered ribbon,
   then it rises and fades). Other players' skills show over their heads too, from the skill message they already send. */
'use strict';

const SKSHOUT_LIFE = 1.6;
function skShoutSet(o, id){ const sk = SKILLS[id]; if (!o || !sk || sk.passive) return; o.skShout = {s:skName(sk), t0:T}; }
function skShoutDraw(x, top, sh){
  if (!sh || top == null) return; const k = (T - sh.t0) / SKSHOUT_LIFE; if (k < 0 || k >= 1) return;
  const z = (typeof TAG_Z === 'function' ? TAG_Z() : 1) * 1.5, pop = k < .08 ? .6 + k / .08 * .55 : k < .16 ? 1.15 - (k - .08) / .08 * .15 : 1;
  const y = top - 6 * z - Math.max(0, k - .55) * 30 * z, fs = Math.round(15 * z);
  ctx.save(); ctx.globalAlpha = k > .7 ? (1 - k) / .3 : 1; ctx.translate(x, y); ctx.scale(pop, pop);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.font = `800 ${fs}px "Mali", system-ui, sans-serif`;
  const w = ctx.measureText(sh.s).width, pw = w + 26 * z, ph = fs + 10 * z;
  // ribbon: midnight body, gold rim, a soft glow
  ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2);
  const bg = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2); bg.addColorStop(0, 'rgba(36,30,72,.94)'); bg.addColorStop(1, 'rgba(10,12,30,.94)');
  ctx.fillStyle = bg; ctx.shadowColor = 'rgba(255,200,90,.8)'; ctx.shadowBlur = 10 * z; ctx.fill(); ctx.shadowBlur = 0;
  ctx.lineWidth = 1.6 * z; ctx.strokeStyle = '#e8c26a'; ctx.stroke();
  for (const d of [-1, 1]){ const gx = d * (pw / 2 - 8 * z), r = 2.6 * z; ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.moveTo(gx, -r); ctx.lineTo(gx + r, 0); ctx.lineTo(gx, r); ctx.lineTo(gx - r, 0); ctx.closePath(); ctx.fill(); }
  ctx.lineWidth = 3.4 * z; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.strokeText(sh.s, 0, z);
  const tg = ctx.createLinearGradient(0, -fs / 2, 0, fs / 2); tg.addColorStop(0, '#ffffff'); tg.addColorStop(.5, '#ffe9a8'); tg.addColorStop(1, '#e8a032');
  ctx.fillStyle = tg; ctx.fillText(sh.s, 0, z);
  ctx.restore();
}
{ const _fire = fireSkill;
  fireSkill = function(id){ const ok = _fire.apply(this, arguments); if (ok) skShoutSet(P, id); return ok; }; }
{ const _fx = onFx;
  onFx = function(msg){ _fx.apply(this, arguments); try { const d = msg.data || {}; if (msg.isMe || d.r !== NET.mapName) return; const gh = NET.ghosts && NET.ghosts.get(msg.peer); if (gh) skShoutSet(gh, d.s); } catch (e) {} }; }
{ const _tags = drawGhostTags;
  drawGhostTags = function(){ _tags.apply(this, arguments);
    if (NET.ghosts) for (const gh of NET.ghosts.values()) if (gh.skShout) skShoutDraw(sx(gh.x), gh.tagTop, gh.skShout); }; }
EV.on('draw', () => { if (P.skShout && !P.dead) skShoutDraw(sx(P.x), P.tagTop, P.skShout); });   // after the hero plate, so it sits on top
