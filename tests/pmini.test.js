'use strict';
const test = require('node:test'), assert = require('node:assert');
const { openGame, enterWorld } = require('./browser');

test('party members on this map show on the minimap; other players and other parties do not', async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    // count cyan "party" pixels around a map position on the minimap after a draw
    const cyan = (pos) => page.evaluate(({ x, y }) => {
      const mm = document.getElementById('minimap'), g = mm.getContext('2d'), kx = mm.width / W, ky = mm.height / H, u = mm.width / 170;
      NET.ghosts.clear(); NET.party = 'p-test';
      NET.ghosts.set('a', { peer: 'a', x, y, q: { pt: 'p-test', n: 'Mate', l: 5 } });
      NET.ghosts.set('b', { peer: 'b', x: x + 400, y, q: { pt: 'p-other', n: 'Other', l: 5 } });   // a different party: no marker
      drawMini();
      const count = (cx, cy) => { const r = Math.ceil(6 * u), d = g.getImageData(Math.max(0, Math.round(cx - r)), Math.max(0, Math.round(cy - r)), r * 2, r * 2).data; let n = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i] < 120 && d[i + 1] > 200 && d[i + 2] > 220) n++; return n; };
      return { mate: count(x * kx, y * ky), other: count((x + 400) * kx, y * ky) };
    }, pos);
    const pos = await page.evaluate(() => ({ x: Math.min(W - 200, P.x + 300), y: Math.max(200, P.y - 150) }));
    const r = await cyan(pos);
    assert.ok(r.mate >= 8, 'party member marker is drawn: ' + r.mate);
    assert.equal(r.other, 0, 'someone from another party is not marked');
    assert.deepEqual(errors, []);
  } finally { await close(); }
});
