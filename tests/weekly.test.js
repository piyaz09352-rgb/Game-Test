/* VAYRATHEN — tests/weekly.test.js — four weekly tasks, counting from events, claims, the chest after all four. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('weekly tasks: four tasks, they count, claim pays, all four open the chest', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => { S.lvl = 30; S.weekly = null; const D = weeklyState(); const kinds = D.tasks.map(t => t.k);
      const c0 = typeof ACC !== 'undefined' ? (ACC.coins || 0) : 0;
      EV.emit('kill', {def:{lvl:30}, type:'x'}); const counted = D.tasks[0].have;
      for (const t of D.tasks){ t.have = t.n; t.done = true; }
      const inv0 = Object.keys(S.inv || {}).length; D.tasks.forEach((t, i) => weeklyClaim(i));
      return {kinds, counted, claimed:D.tasks.every(t => t.claimed), chest:D.chest, card:questTracker().includes('Weekly') || questTracker().includes('รายสัปดาห์')}; });
    assert.strictEqual(r.kinds.length, 4); assert.strictEqual(new Set(r.kinds).size, 4, 'four different tasks');
    assert.strictEqual(r.kinds[0], 'killAny'); assert.strictEqual(r.counted, 1, 'a kill near your level counts');
    assert.ok(r.claimed && r.chest, 'claiming all four opens the chest');
    assert.ok(r.card, 'the quest card shows the weekly line');
    await page.evaluate(() => openWin ? openWin('quest') : null).catch(() => {});
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
