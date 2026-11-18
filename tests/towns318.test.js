/* VAYRATHEN — tests/towns318.test.js — (v318) the crossroad towns are laid out in balance (mirrored both ways, a pond in
   each quarter, both gates reachable) and on no map does a tree or a rock stand in a pond */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('crossroad towns balanced; nothing grows in the water', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { const out = {towns:{}, wet:{}};
      for (const id of [67, 68, 69, 70]){ loadMap(id); await new Promise(res => setTimeout(res, 500));
        const nat = PROPS.filter(p => p.tw318), q = [0, 0, 0, 0]; for (const p of nat) q[(p.x < W / 2 ? 0 : 1) + (p.y < H / 2 ? 0 : 2)]++;
        const ponds = WATERS.filter(w => w.k === 'pond').length, gates = GATES.map(g => !!findPath(W / 2 + (g.x < W / 2 ? -40 : g.x > W / 2 ? 40 : 0), H / 2 + (g.y < H / 2 ? -40 : g.y > H / 2 ? 40 : 0), g.x + (W / 2 - g.x) * .06, g.y + (H / 2 - g.y) * .06));
        const leafy = id === 69 ? PROPS.filter(p => p.tw318 && p.type !== 'pine' && !['stupa', 'rock'].includes(p.type)).length : 0;
        out.towns[id] = {q, ponds, gates, leafy}; }
      for (const id of [1, 3, 7, 12, 71]){ loadMap(id); await new Promise(res => setTimeout(res, 50)); const ps = WATERS.filter(w => w.k === 'pond');
        out.wet[id] = PROPS.filter(p => NAT318.has(p.type) && ps.some(w => ((p.x - w.x) / (w.rx + 10)) ** 2 + ((p.y - w.y) / (w.ry + 8)) ** 2 < 1)).length; }
      return out; });
    for (const [id, t] of Object.entries(r.towns)){
      assert.ok(t.q[0] > 40 && Math.max(...t.q) - Math.min(...t.q) === 0, `town ${id}: the four quarters are mirrors: ${t.q}`);
      assert.ok(t.ponds >= 4, `town ${id}: a pond in each quarter: ${t.ponds}`);
      assert.ok(t.gates.every(Boolean), `town ${id}: both gates reachable: ${t.gates}`);
      assert.strictEqual(t.leafy, 0, `town ${id}: no broad-leaved trees in the snow`); }
    assert.deepStrictEqual(Object.values(r.wet), [0, 0, 0, 0, 0], 'nothing stands in a pond: ' + JSON.stringify(r.wet));
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
