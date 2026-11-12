/* VAYRATHEN — tests/newsys.test.js — camp cook, forge-only dust, coffee window, pick up by pointing / by button */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('camp cook uses only this map\'s drops; dust is forge-only; coffee window; loot by clicking and by button', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      S.lvl = 50; loadMap(1);
      const n = NPCS.find(x => x.id === 'campcook'), quarter = NPCS.some(x => x.id === 'quarter'), loc = ccLocal();
      const far = Object.keys(ITEMS).find(k => k.startsWith('m_') && !loc.has(k) && CK_RCP.some(r => r.who === 'cook' && r.need.some(q => q.ids.includes(k))));
      S.inv[far] = 99; NPC_OPEN.campcook(n); const farRows = document.querySelectorAll('#dialog .ckrow:not(.short)').length;
      for (const id of loc) S.inv[id] = 50; S.bia = 1e6; NPC_OPEN.campcook(n);
      const before = S.inv[far]; document.querySelector('#dialog [data-ckmake]').click();
      const dust = { sell: ITEMS.dust.sell, trade: tradable('dust'), recipeNeeds: RECIPES.some(r => r.kind === 'gear' && r.need.some(q => q[0] === 'dust')) };
      return { cook: !!n, quarter, farRows, farUntouched: S.inv[far] === before, dust };
    });
    assert.ok(r.cook && !r.quarter, 'the camp has the cook, not the quartermaster');
    assert.strictEqual(r.farRows, 0, 'other maps\' drops cook nothing at a camp');
    assert.ok(r.farUntouched, 'a camp dish never takes another map\'s drop');
    assert.deepStrictEqual(r.dust, { sell: 0, trade: false, recipeNeeds: true });

    await page.evaluate(() => openWin('support'));
    assert.match(await page.textContent('#pane-support'), /0831087666/);

    // pointing at a drop only shows the hand; clicking it sends the hero to pick it up
    await page.evaluate(() => { closeWin('support'); closeDialog(); LOOT.length = 0; LOOT.push({ id: 'redpot', x: P.x + 70, y: P.y, t: 90, born: T }); P.loot = null; });
    await page.waitForTimeout(400);
    const pt = await page.evaluate(() => { const r = brect(cv), l = LOOT[0]; return { x: r.left + (l.x - cam.x) / VW * r.width, y: r.top + (l.y - cam.y) / VH * r.height }; });
    await page.mouse.move(pt.x - 40, pt.y - 40); await page.mouse.move(pt.x, pt.y);
    await page.waitForFunction(() => !!hoverLoot, null, { timeout: 4000, polling: 50 }).catch(() => {});   // (v290) the hover is picked up on the next frame: on a busy machine that can take a while
    const hov = await page.evaluate(() => ({ loot: !!P.loot, hov: !!hoverLoot }));
    assert.deepStrictEqual(hov, { loot: false, hov: true }, 'pointing alone does not send the hero');
    await page.mouse.down(); await page.mouse.up();
    const dbg = await page.evaluate(() => ({ loot: P.loot === LOOT[0], n: LOOT.length, paused: PAUSED }));
    assert.ok(dbg.loot || !dbg.n, 'clicking picks it up ' + JSON.stringify(dbg));
    // the touch button
    const n = await page.evaluate(() => { LOOT.push({ id: 'redpot', x: P.x + 30, y: P.y, t: 90, born: T }); P.loot = null; mobaAction('loot'); return !!P.loot; });
    assert.ok(n, 'the pick-up button grabs the nearest drop');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
