/* VAYRATHEN — js/sys/dummy.js — straw training dummies (หุ่นฟางทดสอบดาเมจ)
   Three straw dummies stand well apart in the training yard just north of Aren, by the north road. Hit them with
   anything: they never die, never fight back and give nothing, but each one keeps score above its head —
   damage per second over the last few seconds, the biggest hit, and the total — and resets after a quiet spell.
   They wobble when struck. They are your own (not shared online), so everyone can test at the same time. */
'use strict';

MOB.dummy = {name:'หุ่นฟางทดสอบ', en:'Straw Training Dummy', lvl:1, hp:1e9, atk:[0, 0], def:0, elem:'neutral', race:'formless', size:'m', exp:0, jexp:0, speed:0, delay:999, r:12, drops:[], card:null, cardRate:0};
MOB_H0.dummy = 44;
const DUMMY_SPOTS = () => [[VC + 360, 230], [VC + 470, 280], [VC + 420, 170]];   // (v60) outside the round town, north-east
const DUMMY_WIN = 5;
function dummySpawn(){
  if (MAP_ID !== 0) return;
  for (const [x, y] of DUMMY_SPOTS()){
    for (let i = PROPS.length - 1; i >= 0; i--) if (Math.hypot(PROPS[i].x - x, PROPS[i].y - y) < 46) PROPS.splice(i, 1);
    for (let i = obstacles.length - 1; i >= 0; i--){ const o = obstacles[i]; if (o.prop && Math.hypot(o.x - x, o.y - y) < 46) obstacles.splice(i, 1); }
    if (mobs.some(m => m.dummy && !m.dead && Math.hypot(m.x - x, m.y - y) < 4)) continue;
    const m = spawnMob('dummy', x, y, {zone:MAPZ}); m.dummy = true; m.elite = false; m.maxhp = m.hp = 1e9; m.dir = 0; m.dlog = []; m.dmax = 0; m.dtot = 0;
  }
  NAV.grid = null;
}
EV.on('map', id => { if (id === 0) setTimeout(dummySpawn, 0); });
EV.on('tick', () => { if (MAP_ID === 0 && !PAUSED && !mobs.some(m => m.dummy && !m.dead)) dummySpawn(); });
HK.mobPre.unshift(m => (m.dummy ? (m.aggro = false, true) : undefined));
HK.dmgAfter.push((m, res, sk, hp0) => {
  if (!m || !m.dummy) return; const d = Math.max(0, Math.round((hp0 || 0) - m.hp)); m.hp = m.maxhp; if (!d) return;
  m.dlog.push([T, d]); m.dtot += d; m.dmax = Math.max(m.dmax, d); m.hitT = T; m.wob = 1;
});
EV.on('tick', dt => { for (const m of mobs){ if (!m.dummy) continue; m.hp = m.maxhp; m.dead = false; if (m.wob) m.wob = Math.max(0, m.wob - dt * 2.2);
  if (m.hitT && T - m.hitT > 8){ m.dlog = []; m.dtot = 0; m.dmax = 0; m.hitT = 0; } } });
const dummyDps = m => { const now = T, rec = m.dlog.filter(e => now - e[0] <= DUMMY_WIN); m.dlog = rec; if (!rec.length) return 0; const span = Math.max(1, Math.min(DUMMY_WIN, now - rec[0][0] + .5)); return rec.reduce((a, e) => a + e[1], 0) / span; };
/* drawn by hand: a post, a straw body bound with cord, a burlap head with stitched eyes, a painted target */
function drawDummy(g, m, x, y){
  const w = Math.sin(T * 26) * (m.wob || 0) * .22;
  shadowW(g, x, y, 10);
  g.save(); g.translate(x, y); g.rotate(w);
  g.fillStyle = '#6a4424'; g.fillRect(-2, -46, 4, 46); g.fillStyle = '#4a2c14'; g.fillRect(-2, -46, 1.2, 46);
  g.fillStyle = '#8a5a2a'; g.fillRect(-17, -32, 34, 3.4);
  // straw body
  const sb = g.createLinearGradient(-11, 0, 11, 0); sb.addColorStop(0, '#b08a3a'); sb.addColorStop(.5, '#e8c870'); sb.addColorStop(1, '#a07a2e');
  g.fillStyle = sb; g.beginPath(); g.ellipse(0, -24, 10, 13, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(120,80,20,.6)'; g.lineWidth = .5; for (let i = -8; i <= 8; i += 2.4){ g.beginPath(); g.moveTo(i, -35); g.lineTo(i * 1.1, -12); g.stroke(); }
  g.strokeStyle = '#5a3a18'; g.lineWidth = 1.4; for (const yy of [-31, -16]){ g.beginPath(); g.moveTo(-8.5, yy); g.lineTo(8.5, yy); g.stroke(); }
  // painted target on the chest
  for (const [r, c] of [[6, '#c83a2a'], [4.2, '#f4ecd8'], [2.4, '#c83a2a']]){ g.fillStyle = c; g.beginPath(); g.arc(0, -24, r, 0, 7); g.fill(); }
  // straw tufts at the arm ends and skirt
  g.strokeStyle = '#e8c870'; g.lineWidth = .8; for (const sx0 of [-17, 17]) for (let k = -2; k <= 2; k++){ g.beginPath(); g.moveTo(sx0, -30.5); g.lineTo(sx0 + Math.sign(sx0) * 4, -30.5 + k * 1.6); g.stroke(); }
  for (let k = -4; k <= 4; k++){ g.beginPath(); g.moveTo(k * 1.8, -12); g.lineTo(k * 2.2, -6); g.stroke(); }
  // burlap head
  g.fillStyle = '#c8a878'; g.beginPath(); g.ellipse(0, -42, 7.5, 7, 0, 0, 7); g.fill(); g.strokeStyle = '#8a6a40'; g.lineWidth = .7; g.stroke();
  g.strokeStyle = '#3a2410'; g.lineWidth = 1; for (const ex of [-2.8, 2.8]){ g.beginPath(); g.moveTo(ex - 1.3, -44); g.lineTo(ex + 1.3, -41.6); g.moveTo(ex + 1.3, -44); g.lineTo(ex - 1.3, -41.6); g.stroke(); }
  g.beginPath(); g.moveTo(-2.5, -38.6); g.lineTo(2.5, -38.6); g.stroke(); g.fillStyle = '#e8c870'; g.fillRect(-1.5, -50, 3, 2.4);
  g.restore();
  if (false && m.flash > 0){ g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(.5, m.flash * 4); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, y - 26, 12, 20, 0, 0, 7); g.fill(); g.restore(); }
}
{ const _d = drawMobW; drawMobW = function(g, m){ if (m.type !== 'dummy') return _d(g, m); const x = m.x - cam.x, y = m.y - cam.y; if (x < -60 || x > VW + 60 || y < -80 || y > VH + 40) return; drawDummy(g, m, x, y); }; }
/* the score board over each dummy */
EV.on('draw', () => {
  if (MAP_ID !== 0) return; const z = typeof TAG_Z === 'function' ? TAG_Z() : 1;
  for (const m of mobs){ if (!m.dummy) continue; const x = sx(m.x), y = sy(m.y - 62); if (x < -80 || x > SW + 80 || y < -40 || y > SH + 40) continue;
    const dps = dummyDps(m), active = m.dtot > 0;
    ctx.save(); ctx.translate(x, y); ctx.scale(z, z); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = active ? 92 : 74, h = active ? 34 : 16; ctx.fillStyle = 'rgba(20,10,4,.82)'; ctx.strokeStyle = 'rgba(227,176,75,.85)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-w / 2, -h, w, h, 5) : ctx.rect(-w / 2, -h, w, h); ctx.fill(); ctx.stroke();
    if (!active){ ctx.fillStyle = '#f0dca8'; ctx.font = '700 9px Mali, sans-serif'; ctx.fillText(L('ตีทดสอบดาเมจ', 'Hit to test damage'), 0, -h / 2); }
    else { ctx.fillStyle = '#ffd34a'; ctx.font = '800 12px Mali, sans-serif'; ctx.fillText(`DPS ${fmtN(dps)}`, 0, -h + 10);
      ctx.fillStyle = '#f0e0c0'; ctx.font = '600 8.5px Mali, sans-serif'; ctx.fillText(`${L('สูงสุด', 'max')} ${fmtN(m.dmax)} · ${L('รวม', 'total')} ${fmtN(m.dtot)}`, 0, -h + 24); }
    ctx.restore(); }
});
