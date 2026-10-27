/* VAYRATHEN — js/sys/moblife.js — monsters and bosses that feel alive
   Feelings (a small bubble over the head): ! spotted you · ? lost you · anger when hurt hard · sweat when nearly beaten ·
   ♪ gloating when you fall · Zz dozing at night · … idle musing · flame when a boss goes on a rampage.
   ONE bubble on screen at a time, and the boss comes first: while a boss is on screen only the boss shows feelings,
   and a boss's bubble pushes any other one away.
   Behaviour: idle monsters look around, the wounded may run for a moment and come back angrier, hitting one calls
   its kin nearby to help, a boss paces and roars while it waits. */
'use strict';

const EMO = {cur:null, gapT:0};
const EMO_DUR = {alert:1.3, question:1.5, anger:1.4, sweat:1.6, music:1.8, sleep:2.4, dots:1.6, flame:1.8, heart:1.6};
const emoOnScreen = m => m && !m.dead && m.x > cam.x - 10 && m.x < cam.x + VW + 10 && m.y > cam.y - 10 && m.y < cam.y + VH + 60 && !(m.fz && m.fz.hidden);
const bossInView = () => mobs.some(m => m.def.boss && emoOnScreen(m));
/* ask for a bubble; returns true if it shows */
function emote(m, kind, opt = {}){
  if (!emoOnScreen(m) || !EMO_DUR[kind]) return false;
  const boss = !!m.def.boss, c = EMO.cur && T < EMO.cur.end && !EMO.cur.m.dead ? EMO.cur : null;
  if (!boss){
    if (c || T < EMO.gapT || bossInView()) return false;                 // the boss has the stage, and only one bubble at a time
    if (T < (m.emoCd || 0)) return false;
  } else if (c && c.boss && !opt.force && T - c.t0 < .6) return false;   // let a boss bubble be read before the next
  EMO.cur = {m, kind, t0:T, end:T + EMO_DUR[kind] * (boss ? 1.15 : 1), boss};
  EMO.gapT = T + EMO_DUR[kind] + (boss ? .4 : 1.4); m.emoCd = T + (boss ? 2.5 : 8);
  return true;
}

/* ---------- triggers ---------- */
{
  // getting hurt: anger at big hits and crits, sweat (and maybe a short retreat) when nearly beaten; kin come to help
  HK.dmgAfter.push((m, res, sk, hp0) => {
    if (!m || m.pvp || !m.def || !res || res.miss || !(hp0 > m.hp)) return;
    const lost = (hp0 - m.hp) / m.maxhp;
    if (!m.dead){
      if (m.hp / m.maxhp < .22 && !m.sweated){ m.sweated = true; emote(m, 'sweat');
        if (!m.def.boss && !m.minion && Math.random() < .35){ m.fleeT = 1.8 + Math.random(); } }
      else if (res.crit || lost > (m.def.boss ? .04 : .25)) emote(m, 'anger');
      // call the pack: same kind nearby joins in
      if (!m.def.boss && !res.poison && !m.called){ m.called = true; let first = true;
        for (const o of mobs){ if (o === m || o.dead || o.aggro || o.type !== m.type || dist(o, m) > 150) continue; o.aggro = true; if (first){ first = false; emote(o, 'alert'); } } }
    }
  });
  // fleeing and looking around
  HK.mobPre.push((m, dt) => {
    if (m.fleeT > 0 && !(m.st && (m.st.stun > 0 || m.st.freeze > 0 || m.st.root > 0))){
      m.fleeT -= dt; const dx = m.x - P.x, dy = m.y - P.y, l = Math.hypot(dx, dy) || 1;
      moveTo(m, m.x + dx / l * 40, m.y + dy / l * 40, m.def.speed * 1.5, dt); m.moving = true; m.dir = SPR.dirFromVec(dx, dy); pushOut(m, m.def.r * .6);
      if (m.fleeT <= 0){ m.aggro = true; emote(m, 'anger'); m.atkCd = 0; }
      return true;
    }
  });
  HK.mobPost.push((m, dt, ag0) => {
    if (m.dead) return;
    if (!ag0 && m.aggro) emote(m, m.def.boss ? 'anger' : 'alert', {force:m.def.boss});
    else if (ag0 && !m.aggro && !P.dead) emote(m, 'question');
    if (!m.aggro && !m.moving){
      if (Math.random() < dt * .5) m.dir = (m.dir + (Math.random() < .5 ? 1 : 7)) % 8;          // looks around
      if (m.def.boss && Math.random() < dt * .06 && emoOnScreen(m)){ m.atkT = 0; m.lunge = .3; VFX.play('dustPuff', {x:m.x, y:m.y}); SFX.mob && SFX.mob('atk', m); }   // paces and growls
    }
  });
  // when you fall, the closest thing on screen gloats (a boss first)
  HK.diePost.push(() => { const b = mobs.find(o => o.def.boss && emoOnScreen(o)) || mobs.filter(o => o.aggro && emoOnScreen(o)).sort((a, c) => dist(a, P) - dist(c, P))[0]; if (b) emote(b, 'music', {force:true}); });
}
// boss moods: rampage, phase change, you on low HP; idle feelings for ordinary monsters
EV.on('tick', dt => {
  for (const m of mobs){ if (!m.def.boss || m.dead) continue; const F = m.fz;
    if (F){ if (F.berserk > 0 && !m._emoB){ m._emoB = true; emote(m, 'flame', {force:true}); } if (!(F.berserk > 0)) m._emoB = false;
      if (F.phase !== m._emoPh){ if (m._emoPh) emote(m, 'anger', {force:true}); m._emoPh = F.phase; } }
    if (m.aggro && S.hp < DER.maxhp * .25 && !P.dead && T > (m._taunt || 0)){ m._taunt = T + 12; emote(m, 'music'); } }
  if (Math.random() < dt * .35 && !bossInView()){
    const idle = mobs.filter(m => !m.aggro && !m.dead && !m.def.boss && emoOnScreen(m)); if (idle.length){ const m = idle[Math.floor(Math.random() * idle.length)];
      emote(m, isNight() && !m.def.night ? 'sleep' : ['dots', 'music', 'heart', 'dots'][Math.floor(Math.random() * 4)]); } }
});

/* ---------- the bubble ---------- */
EV.on('draw', () => {
  const c = EMO.cur; if (!c || T > c.end || c.m.dead || !emoOnScreen(c.m)) return;
  const m = c.m, z = (typeof TAG_Z === 'function' ? TAG_Z() : 1) * (c.boss ? 1.35 : 1), k = T - c.t0, life = c.end - c.t0;
  const pop = k < .18 ? .4 + k / .18 * .75 : k < .3 ? 1.15 - (k - .18) / .12 * .15 : 1, fade = Math.min(1, (c.end - T) / .3);
  const sc = m.fz ? 1 + ((m.fz.phase || 1) - 1) * .04 : 1, x = sx(m.x) + 14 * z, y = sy(m.y - MOB_H[m.type] * sc - (m.fz ? m.fz.z || 0 : 0)) - (m.def.boss ? 54 : 28) * z + Math.sin(k * 5) * 1.5;
  ctx.save(); ctx.globalAlpha = fade; ctx.translate(x, y); ctx.scale(pop * z, pop * z);
  // bubble
  ctx.fillStyle = '#fffaf0'; ctx.strokeStyle = 'rgba(40,24,10,.85)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(0, 0, 13, 11, 0, 0, 7); ctx.moveTo(-6, 8); ctx.lineTo(-11, 16); ctx.lineTo(-1, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.ellipse(0, 0, 12, 10, 0, 0, 7); ctx.fill();
  const txt = (s, col, size = 15) => { ctx.font = `800 ${size}px "Mali", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(s, 0, 1); };
  switch (c.kind){
    case 'alert': txt('!', '#e8402a', 18); break;
    case 'question': txt('?', '#3a7ad8', 17); break;
    case 'music': ctx.rotate(Math.sin(k * 8) * .15); txt('♪', '#c8408a', 17); break;
    case 'dots': { const n = Math.min(3, Math.floor(k * 3) + 1); txt('·'.repeat(n), '#6a5a4a', 18); break; }
    case 'sleep': ctx.font = '800 11px Mali, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#5a6ab8'; ctx.fillText('Z', -3, 3); ctx.font = '800 8px Mali, sans-serif'; ctx.fillText('z', 5, -3 - Math.sin(k * 3) * 1.5); break;
    case 'heart': { const s = 1 + Math.sin(k * 10) * .08; ctx.scale(s, s); ctx.fillStyle = '#e84a6a'; ctx.beginPath(); ctx.moveTo(0, 6); ctx.bezierCurveTo(-9, -1, -5, -8, 0, -3); ctx.bezierCurveTo(5, -8, 9, -1, 0, 6); ctx.fill(); break; }
    case 'anger': { const s = 1 + Math.sin(k * 16) * .1; ctx.scale(s, s); ctx.strokeStyle = '#e02a2a'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++){ ctx.save(); ctx.rotate(i * Math.PI / 2 + .78); ctx.beginPath(); ctx.moveTo(2, -6); ctx.quadraticCurveTo(2, -2, 6, -2); ctx.stroke(); ctx.restore(); } break; }
    case 'sweat': { const dy = Math.min(4, k * 6); ctx.fillStyle = '#5ab0f0'; ctx.beginPath(); ctx.moveTo(1, -7 + dy); ctx.quadraticCurveTo(7, 1 + dy, 1, 4 + dy); ctx.quadraticCurveTo(-5, 1 + dy, 1, -7 + dy); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-1, 0 + dy, 1.2, 0, 7); ctx.fill(); break; }
    case 'flame': { ctx.fillStyle = '#ff6a1a'; const f = Math.sin(k * 18) * 1.2; ctx.beginPath(); ctx.moveTo(0, -8 - f); ctx.quadraticCurveTo(7, -1, 5, 4); ctx.quadraticCurveTo(0, 8, -5, 4); ctx.quadraticCurveTo(-7, -1, 0, -8 - f); ctx.fill();
      ctx.fillStyle = '#ffe070'; ctx.beginPath(); ctx.moveTo(0, -2); ctx.quadraticCurveTo(3, 2, 2, 4); ctx.quadraticCurveTo(0, 6, -2, 4); ctx.quadraticCurveTo(-3, 2, 0, -2); ctx.fill(); break; }
  }
  ctx.restore();
});
