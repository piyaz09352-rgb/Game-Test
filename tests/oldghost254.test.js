/* VAYRATHEN — tests/oldghost254.test.js — (v254) heroes from old versions (forgotten tabs) are not drawn on the map */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('a hero with no version or an older one is a ghost; same or newer is shown', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    const r = await page.evaluate(() => { const pe = (gv, x) => ({peer:'p' + gv + x, presence:{x, y:5, a:'idle', ...(gv != null ? {gv} : {})}});
      return {v:GAMEV, none:netIdleGhost(pe(null, 1)), older:netIdleGhost(pe(GAMEV - 1, 2)), same:netIdleGhost(pe(GAMEV, 3)), newer:netIdleGhost(pe(GAMEV + 1, 4)),
        me:netIdleGhost({...pe(null, 5), isMe:true})}; });
    assert.ok(r.v >= 254, 'the game knows its version ' + r.v);
    assert.deepStrictEqual([r.none, r.older, r.same, r.newer, r.me], [true, true, false, false, false], JSON.stringify(r));
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
