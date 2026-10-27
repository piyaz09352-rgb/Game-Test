/* VAYRATHEN — tests/warpgrid.test.js — (v95) the boatman's full-screen region board, and the class unlock prompt shown above Master Vayra */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { openGame, enterWorld } = require('./browser');

test('boatman: full-screen board sorted by level, a picture per region, Go warps and closes it', async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { S.bia = 1e6; S.visited[1] = 1; const n = NPCS.find(x => x.id === 'boatman'); P.x = n.x; P.y = n.y + 30; openNpc(n); });
    const r = await page.evaluate(() => { const b = el('warpGrid'), c = [...b.querySelectorAll('.wgc')], lv = c.map(x => +/Lv (\d+)/.exec(x.querySelector('.wglv').textContent)[1]), rc = b.getBoundingClientRect();
      return {open:!b.hidden, n:c.length, sorted:lv.every((v, i) => !i || lv[i - 1] <= v), full:rc.width >= innerWidth - 1 && rc.height >= innerHeight - 1, pic:getComputedStyle(b.querySelector('.wgpic')).backgroundImage, dlg:el('dialog').hidden}; });
    assert.ok(r.open && r.dlg, 'the board replaces the dialog'); assert.strictEqual(r.n, await page.evaluate(() => MAPS.length));
    assert.ok(r.sorted, 'cards sorted by level'); assert.ok(r.full, 'fills the screen'); assert.match(r.pic, /worldmap/);
    await page.click('#warpGrid [data-warp="1"]');
    await page.waitForFunction(() => MAP_ID === 1);
    assert.ok(await page.evaluate(() => el('warpGrid').hidden), 'closed on arrival');
    assert.deepStrictEqual(errors, []);
  } finally { await close(); }
});

test('Master Vayra: the free class unlock asks above her window and unlocks', async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { S.job = 'ranger'; S.jlvl = 50; derive(); const n = NPCS.find(x => x.id === 'job'); P.x = n.x; P.y = n.y + 30; openNpc(n); });
    await page.click('[data-csgo="blade"]');
    await page.click('#sysPrompt [data-spy]');   // a hidden prompt (behind the dialog) would fail this click
    assert.deepStrictEqual(await page.evaluate(() => [S.job, Object.keys(S.cls.have).sort()]), ['blade', ['blade', 'ranger']]);
    assert.deepStrictEqual(errors, []);
  } finally { await close(); }
});
