/* VAYRATHEN — tests/bagsteady286.test.js — (v286) the bag does not blink while you play
   The owner saw the bag's items blink, again and again. Three things rebuilt it on every kill, potion, pick-up or EXP tick:
   1. material cells had two taggers (gearrar270.js by rarity, itemart270.js by tier) flipping the frame class back and forth;
   2. the empty cells were appended after each draw and removed by the next (in-place) draw;
   3. the in-place update matched cells by position and stripped the rarity decorations, so every item picture was rebuilt
      (and a new item shifted every later cell). Item art also got fresh ids on every draw.
   Here the bag is open with 60 kinds of items while the hero plays; the DOM may change only where something changed. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('the bag stays put while you play', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width: 1366, height: 768 });
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      for (const k of Object.keys(ITEMS).slice(0, 60)) if (!ITEMS[k].base) S.inv[k] = 3;
      openWin('bag'); await new Promise(res => setTimeout(res, 900));
      const root = document.getElementById('bagGrid'), w = ms => new Promise(res => setTimeout(res, ms));
      let cur = '', step = {}; const mo = new MutationObserver(ms => { step[cur] = (step[cur] || 0) + ms.length; });
      mo.observe(root, { subtree: true, childList: true, attributes: true, characterData: true });
      const cells = () => new Map([...root.querySelectorAll('.bslot[data-bagsel]')].map(b => [b.dataset.bagsel, b.querySelector('svg')]));
      cur = 'idle'; await w(1500);
      cur = 'hp'; S.hp = Math.max(1, S.hp - 5); await w(400);
      cur = 'exp'; gainExp(5, 3); await w(400);
      cur = 'potion'; addItem('redpot', 1); await w(400);
      const before = cells(); cur = 'newItem'; addItem(Object.keys(ITEMS).find(k => !ITEMS[k].base && !S.inv[k] && ITEMS[k].kind !== 'key'), 1); await w(500);
      const after = cells(); let kept = 0; for (const [k, s] of before) if (after.get(k) === s) kept++;
      mo.disconnect();
      const mats = [...root.querySelectorAll('.bslot[data-bagsel]')].filter(b => ['etc', 'mat'].includes((ITEMS[b.dataset.bagsel] || {}).kind));
      return { step, kept, total: before.size, mats: mats.length, matGr: mats.every(b => b.classList.contains('grx') && (b.className.match(/\bgr[0-3]\b/g) || []).length === 1) };
    });
    for (const k of ['idle', 'hp', 'exp', 'potion', 'newItem']) assert.ok((r.step[k] || 0) <= 40, `${k}: the bag barely changes (${r.step[k] || 0} DOM changes, was thousands) ${JSON.stringify(r.step)}`);
    assert.strictEqual(r.kept, r.total, 'a new item leaves every other item picture in place');
    assert.ok(r.mats > 0 && r.matGr, 'material cells carry exactly one frame colour');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
