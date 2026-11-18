/* VAYRATHEN — tests/aren317.test.js — (v317) the land round Aren is laid out in balance: the woods, hills, ponds and fields
   on the west match those on the east, one waterfall pours from the west hill, every gate stays reachable */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('Aren is balanced west and east', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { loadMap(0); await new Promise(res => setTimeout(res, 600));
      const nat = PROPS.filter(p => ['tree', 'palm', 'hay', 'flowerbed'].includes(p.type) && Math.hypot((p.x - 1200) / 650, (p.y - 800) / 480) > 1);
      const west = nat.filter(p => p.x < 1180), east = nat.filter(p => p.x > 1220);
      const mirrored = west.filter(p => east.some(q => q.type === p.type && Math.abs(q.x - (2400 - p.x)) < 2 && Math.abs(q.y - p.y) < 2)).length;
      const water = WATERS.filter(w => w.k === 'pond').map(w => [Math.round(w.x), Math.round(w.y)]);
      const st = {x:1200, y:1000}, gates = GATES.map(g => !!findPath(st.x, st.y, g.x + (1200 - g.x) * .08, g.y + (800 - g.y) * .08));
      return {west:west.length, east:east.length, mirrored, water, gates, falls:WFALLS.length, cliffs:obstacles.filter(o => o.cliff).length, oldPond:POND.x < 0}; });
    assert.ok(r.west > 40 && Math.abs(r.west - r.east) <= Math.max(6, r.west * .15), 'about as many trees on each side: ' + r.west + ' / ' + r.east);
    assert.ok(r.mirrored >= r.west * .85, 'the east is the mirror of the west: ' + r.mirrored + ' of ' + r.west);
    assert.strictEqual(r.falls, 1, 'one waterfall'); assert.ok(r.cliffs > 40, 'the hills are walls: ' + r.cliffs); assert.ok(r.oldPond, 'the old round pond is gone');
    for (const [x, y] of [[520, 300], [1880, 300], [980, 1500], [1420, 1500]]) assert.ok(r.water.some(([a, b]) => Math.abs(a - x) < 10 && Math.abs(b - y) < 40), 'a pond at ' + x + ',' + y + ': ' + JSON.stringify(r.water));
    assert.ok(r.gates.every(Boolean), 'every gate can be walked to: ' + r.gates);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
