/* VAYRATHEN — js/sys/boss192.js — (v192) bosses you need a party for
   The owner found bosses clumsy, soft and easy one-on-one, with no air of menace. On top of their moves, warnings and
   cataclysms (bossplus.js and friends):
     · built for a party of 3–5: HP ×3.5, hits ×1.5, attacks 20% sooner and moves 25% faster, so a lone hero of the same
       level cannot outlast one;
     · a dread aura (รัศมีมรณะ): a dark red ring breathes around every boss with embers rising from it; standing inside it
       shakes your nerve (you take 15% more from its hits) and the edges of the screen glow red;
     · every boss goes berserk at 30% HP (the old Enrage skill only some had): faster, harder hitting (mobs.js
       m.enraged), a red glow, a roar and a warning to everyone near. */
'use strict';
const BOSS192 = {hp:3.5, atk:1.5, delay:.8, speed:1.25, aura:190, auraHit:1.15, enrage:.3};
function boss192Def(d){ if (!d || !d.boss || d._b192) return d; d._b192 = 1;
  d.hp = Math.round(d.hp * BOSS192.hp);
  if (Array.isArray(d.atk)) d.atk = d.atk.map(v => Math.round(v * BOSS192.atk));
  if (d.delay) d.delay *= BOSS192.delay; if (d.speed) d.speed *= BOSS192.speed;
  return d; }
for (const k in MOB) boss192Def(MOB[k]);
if (typeof wbDef === 'function'){ const _wb = wbDef; wbDef = function(){ return boss192Def(_wb.apply(this, arguments)); }; }
/* a boss alive and close to you */
const bossNear = r => mobs.find(m => !m.dead && m.def && m.def.boss && !m.vanish && Math.hypot(m.x - P.x, m.y - P.y) < r);
/* the dread aura: its hits land harder while you stand in it */
{ const _a = mobAttack; mobAttack = function(m, mult = 1, noDodge = false){
    if (m && m.def && m.def.boss && Math.hypot(m.x - P.x, m.y - P.y) < BOSS192.aura) mult *= BOSS192.auraHit;
    return _a.call(this, m, mult, noDodge); }; }
/* berserk at 30% for every boss */
EV.on('tick', () => {
  for (const m of mobs){ if (m.dead || !m.def || !m.def.boss || m.enraged || !m.maxhp || m.hp > m.maxhp * BOSS192.enrage) continue;
    m.enraged = true; VFX.play('enrage', {m}); if (VFX.shake) VFX.shake(6);
    if (typeof bossShout === 'function') try { bossShout(m, 'enrage'); } catch (e) {}
    if (Math.hypot(m.x - P.x, m.y - P.y) < 700) banner(L(`${m.def.name} คลั่ง! โจมตีแรงและเร็วขึ้น`, `${m.def.en || m.def.name} is berserk! Faster, harder hits`)); }
});
/* drawing: the aura ring under every boss on screen, and red screen edges while you are inside one */
EV.on('draw', () => {
  if (typeof ctx === 'undefined' || !mobs.length) return;
  const g = ctx, t = performance.now() / 1000; let inside = 0;
  for (const m of mobs){ if (m.dead || !m.def || !m.def.boss || m.vanish) continue;
    const x = sx(m.x), y = sy(m.y), R = BOSS192.aura * PX; if (x < -R || y < -R || x > SW + R || y > SH + R) continue;
    // (v274) the owner did not want the red circle (ring, ground glow and embers) under bosses: only the red screen edges warn you now
    if (Math.hypot(m.x - P.x, m.y - P.y) < BOSS192.aura) inside = Math.max(inside, m.enraged ? 1 : .7);
    continue;
    const pulse = .5 + .5 * Math.sin(t * (m.enraged ? 5 : 2.4)), hot = m.enraged ? 1 : 0;
    g.save(); g.setTransform(DPR, 0, 0, DPR, 0, 0);
    // the ground glow (flattened, like a shadow on the ground)
    g.translate(x, y); g.scale(1, .45);
    const gr = g.createRadialGradient(0, 0, R * .15, 0, 0, R);
    gr.addColorStop(0, 'rgba(90,0,20,0)'); gr.addColorStop(.5, `rgba(${110 + hot * 80},8,20,${.1 + pulse * .06})`); gr.addColorStop(.85, `rgba(${140 + hot * 80},10,24,${.24 + pulse * .12})`); gr.addColorStop(1, 'rgba(60,0,10,0)');   // clear at the centre: the boss stays in plain view
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill();
    g.lineWidth = 2.5; g.strokeStyle = `rgba(${200 + hot * 55},${40 + hot * 20},40,${.35 + pulse * .35})`; g.setLineDash([10, 8]); g.lineDashOffset = -t * 30;
    g.beginPath(); g.arc(0, 0, R * (.92 + pulse * .05), 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    // embers rising from the ring
    for (let i = 0; i < 14; i++){ const a = i * 2.39996 + (m.id || 0), k = (t * .35 + i / 14) % 1, rr = R * (.35 + .6 * ((i * 37) % 10) / 10);
      const ex = x + Math.cos(a) * rr, ey = y + Math.sin(a) * rr * .45 - k * 70 * Math.max(1, PX / 2);
      g.globalAlpha = (1 - k) * .8; g.fillStyle = hot ? '#ff5a3a' : '#c8283c'; g.fillRect(ex - 1.5, ey - 1.5, 3, 3); }
    g.restore();
    if (Math.hypot(m.x - P.x, m.y - P.y) < BOSS192.aura) inside = Math.max(inside, m.enraged ? 1 : .7);
  }
  if (inside){ const pulse = .5 + .5 * Math.sin(t * 3);
    g.save(); g.setTransform(DPR, 0, 0, DPR, 0, 0);
    const v = g.createRadialGradient(SW / 2, SH / 2, Math.min(SW, SH) * .35, SW / 2, SH / 2, Math.max(SW, SH) * .72);
    v.addColorStop(0, 'rgba(120,0,0,0)'); v.addColorStop(1, `rgba(150,0,15,${(.22 + pulse * .1) * inside})`);
    g.fillStyle = v; g.fillRect(0, 0, SW, SH); g.restore(); }
});
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'boss192', t:['บอส: ต้องรวมปาร์ตี้', 'Bosses: bring a party'], b:() => L(
  '<p>บอสออกแบบให้สู้กันเป็นปาร์ตี้ 3–5 คน เลือดหนา ตีแรง และเร็วกว่ามอนทั่วไป คนเดียวเลเวลเท่ากันสู้ไม่ไหว</p><p><b>รัศมีมรณะ</b>: ใกล้ตัวบอส (ขอบจอเป็นสีแดง) ยืนในรัศมีจะโดนตีแรงขึ้น และขอบจอเป็นสีแดง</p><p><b>คลั่ง</b>: เมื่อเลือดเหลือน้อย บอสทุกตัวคลั่ง ตีแรงและเร็วขึ้น</p>',
  '<p>Bosses are built for a party of 3–5: tougher, harder-hitting and faster than ordinary monsters; one hero of the same level cannot win alone</p><p><b>Dread aura</b>: close to a boss (the screen edges glow red); inside it you take more damage and the screen edges glow red</p><p><b>Berserk</b>: when its HP runs low every boss goes berserk, hitting harder and faster</p>')});
/* (v207) damage to bosses by class line — the boss report (BOSS=1, after the 12-line rework) showed the boxer killing
   bosses alone in about 2 minutes while the hunter and the summoner managed a third of the average; this evens their
   part in a party fight without touching how they hunt ordinary monsters */
const LINE_BOSS = {muay:.55, ranger:1.7, summoner:1.9};
{ const _ad = applyDamage; applyDamage = function(m, res, sk){
    if (m && m.def && m.def.boss && res && res.dmg > 0 && !res.miss && typeof jobChain === 'function'){ const k = LINE_BOSS[jobChain()[1]]; if (k && k !== 1) res = {...res, dmg:Math.max(1, Math.round(res.dmg * k))}; }
    return _ad.apply(this, arguments.length > 1 ? [m, res, ...[].slice.call(arguments, 2)] : arguments); }; }
