/* VAYRATHEN — tests/target.test.js — who gets targeted (v30): the closest first; two about as close → the one with
   less HP; walk out of range of the enemy you were fighting and the closest is picked again; Auto picks the same way. */
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed';
test('closest first, lowest HP on a tie, re-picked out of range', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Aim', 'aim_user');
    const r = await page.evaluate(async () => {
      loadMap(1); await new Promise(res => setTimeout(res, 300)); for (const m of mobs) m.dead = true;
      const sp = (dx, dy, hp) => { const m = spawnMob(MAPS[1].mobs[0], P.x + dx, P.y + dy, {}); m.hp = hp; m.aggro = false; return m; };
      const a = sp(100, 0, 50), b = sp(0, 108, 20); sp(200, 0, 1);
      const out = { tie: nearestEnemy(320) === b, notA: nearestEnemy(320) !== a };
      const d = sp(60, 0, 999); out.closest = nearestEnemy(320) === d; out.bot = pickTarget() === d;
      P.target = d; EV.emit('tick'); const e = sp(1400, 0, 500); P.x += 1300; EV.emit('tick'); out.repick = P.target === e;
      // steering with the joystick (it clears P.target) while locked: the lock moves to the new closest at once
      tlkSet(e); P.target = null; JOY.vx = 1; const f = sp(-900, 0, 500); P.x -= 800; EV.emit('tick'); JOY.vx = 0; out.steer = TLK.m === f;
      // a far monster you tapped is kept while you walk to it
      const g = sp(400, 0, 500); P.target = g; P.tapped = g; EV.emit('tick'); out.tap = P.target === g;
      return out; });
    assert.deepStrictEqual(r, { tie: true, notA: true, closest: true, bot: true, repick: true, steer: true, tap: true });
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('attack button: a tap attacks, holding it opens the kinds of monster around (v150), the one locked stays until it dies; no lock button', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Lock', 'lock_user');
    const r = await page.evaluate(async () => {
      loadMap(1); await new Promise(res => setTimeout(res, 300)); for (const m of mobs) m.dead = true;
      const sp = (dx, dy, hp) => { const m = spawnMob(MAPS[1].mobs[0], P.x + dx, P.y + dy, {}); m.hp = hp; m.aggro = false; return m; };
      const near = sp(40, 0, 500), far = sp(300, 0, 500);
      renderMoba(); const out = {noBtn:!document.querySelector('.mu.tlock') && typeof tlkToggle === 'undefined'};
      let b = document.querySelector('[data-mo="atk"]'); if (!b){ b = document.createElement('button'); b.className = 'mo atk'; b.dataset.mo = 'atk'; document.body.appendChild(b); }
      const ev = t => b.dispatchEvent(new PointerEvent(t, {bubbles:true, pointerId:7}));
      P.target = null; ev('pointerdown'); ev('pointerup'); out.tap = P.target === near && !TLK.hard;
      const t0 = T; ev('pointerdown'); T = t0 + .45; EV.emit('tick'); ev('pointerup');
      // (v150) holding opens the list of KINDS of monster (hunttypes.js); 🎯 on a row locks the closest one of that kind
      out.hold1 = TPK.open && (TPK.kinds || []).some(k => k.type === near.type && k.n === 2);
      const go = document.querySelector(`#tpick [data-hgo="${near.type}"]`); go.dispatchEvent(new PointerEvent('pointerup', {bubbles:true}));
      out.pickFar = !TPK.open && TLK.hard && TLK.m === near && P.target === near;
      out.hold2 = TLK.m === near; T = t0 + 3; EV.emit('tick'); out.stays = TLK.m === near;
      EV.emit('tick'); out.keep = P.target === near && nearestEnemy(120) === near;
      P.x -= 1200; EV.emit('tick'); out.farAway = TLK.m === near && P.target === near;
      near.dead = true; EV.emit('tick'); out.deadOff = !TLK.hard && TLK.m !== near;
      return out; });
    assert.deepStrictEqual(r, { noBtn: true, tap: true, hold1: true, pickFar: true, hold2: true, stays: true, keep: true, farAway: true, deadOff: true });
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
