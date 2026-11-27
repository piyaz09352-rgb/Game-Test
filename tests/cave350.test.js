/* VAYRATHEN — tests/cave350.test.js — (v350) ถ้ำหินปูนเชียงดาว is a real cave
   The owner: «ผมอยากได้แมพที่อยู่ในถ่ำบ้าง». Checked: the map is rock with tunnels and chambers; every gate and every chamber
   can be walked to from the shrine; nobody stands or spawns in the rock, and walking into a wall stops you; the boss waits in
   its lair; no night underground; the same map comes out the same twice; the gateway into the cave on the map next door
   is drawn as a cave mouth (it calls cvMouth). */
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed';

test('Chiang Dao Caves: rock walls, reachable chambers, nobody in the rock, the lair, no night, the cave mouth next door', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width: 1366, height: 768 });
  try {
    await enterWorld(page, 'Cave', 'cave_user');
    const r = await page.evaluate(async () => { const out = {}; S.tut = { done: true, i: 99 }; S.lvl = 225; derive();
      loadMap(6); await new Promise(r => setTimeout(r, 1500));
      out.on = caveOn();
      let rock = 0, n = 0; for (let y = 60; y < H; y += 97) for (let x = 60; x < W; x += 97){ n++; if (caveDist(x, y) <= 0) rock++; } out.mostlyRock = rock / n > .5 && rock / n < .9;
      out.chambers = CAVE.chambers.length >= 6;
      out.gatesOpen = GATES.every(g => caveDist(g.x, g.y) > 30);
      out.reach = GATES.every(g => !!findPath(CAMP.x, CAMP.y, g.x, g.y)) && CAVE.chambers.every(c => !!findPath(CAMP.x, CAMP.y, c.x, c.y));
      out.noneInRock = mobs.filter(m => !m.dead).every(m => caveDist(m.x, m.y) > 0);
      // walk straight at a wall: you stop at it
      const ch = CAVE.chambers[1]; P.x = ch.x; P.y = ch.y; pushOut(P, 12); let k = 0; while (caveDist(P.x + 5 * k, P.y) > 0 && k < 1200) k++;
      const wallX = P.x + 5 * k; for (let i = 0; i < k + 80; i++){ P.x += 5; pushOut(P, 12); }   /* a few px a frame, as a hero walks */
      out.wallStops = caveDist(P.x, P.y) >= 11 && P.x < wallX && !walkable(wallX + 6, P.y, 12);
      out.lair = !!CAVE.lair && !!bossSpot && Math.hypot(bossSpot().x - CAVE.lair.x, bossSpot().y - CAVE.lair.y) < CAVE.lair.r;
      out.noNight = !(typeof caveOn === 'function' && caveOn() && nightA > .2);
      const first = CAVE.circ.length + ':' + Math.round(CAVE.circ[50].x); loadMap(5); await new Promise(r => setTimeout(r, 300));
      out.offElsewhere = !caveOn() && walkable(CAMP.x + 200, CAMP.y);
      const g = GATES.find(g => g.to === 6); let drew = false; const _m = cvMouth; cvMouth = function(){ drew = true; return _m.apply(this, arguments); };
      P.x = inward(g, 150).x; P.y = inward(g, 150).y; await new Promise(r => setTimeout(r, 600)); cvMouth = _m; out.mouth = drew;
      loadMap(6); await new Promise(r => setTimeout(r, 300)); out.same = first === CAVE.circ.length + ':' + Math.round(CAVE.circ[50].x);
      return out; });
    assert.deepStrictEqual(r, { on: true, mostlyRock: true, chambers: true, gatesOpen: true, reach: true, noneInRock: true, wallStops: true, lair: true, noNight: true, offElsewhere: true, mouth: true, same: true });
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
