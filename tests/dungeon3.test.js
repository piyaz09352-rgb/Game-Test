/* VAYRATHEN — tests/dungeon3.test.js — the leave button, blessings between waves, danger zones, guardian phases,
   the golden spirit and the clear rank. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('dungeon: leave button, blessings, hazards, guardian phases and the clear rank', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { S.lvl = 20; derive(); dgEnter('cave', 'test1', 20, 1); });
    await page.waitForTimeout(600);
    assert.ok(await page.$('#dgLeave'), 'the leave button shows inside the dungeon');
    await page.waitForTimeout(800);
    const pos = await page.evaluate(() => { const b = el('dgLeave').getBoundingClientRect(), m = el('mapCard').getBoundingClientRect(); return {gap:Math.round(m.left - b.right), dy:Math.round(b.top - m.top)}; });
    assert.ok(pos.gap >= 0 && pos.gap <= 16 && Math.abs(pos.dy) <= 2, `the leave button sits beside the minimap: ${JSON.stringify(pos)}`);
    // wave 1 comes, then clear it: a blessing choice appears
    await page.waitForFunction(() => DG.wave >= 1 && mobs.some(m => m.dg && !m.dead), null, { timeout: 15000 });
    await page.evaluate(() => { for (const m of mobs) if (m.dg){ m.hp = 0; m.dead = true; } });
    await page.waitForSelector('#dgBoon', { timeout: 5000 });
    await page.click('#dgBoon [data-boon]');
    assert.ok(await page.evaluate(() => Object.keys(P.buffs).some(k => k.startsWith('dgb_'))), 'the picked blessing is on');
    // danger zones go off near you in wave 2+
    await page.evaluate(() => { DG.wave = 2; DG3.hazT = 0; S.hp = DER.maxhp; P.roll = 0; for (const k in P.buffs) if (P.buffs[k].invuln) delete P.buffs[k];
      const m = spawnMob(MAPS[dgInfo().base].mobs[0], P.x + 300, P.y, {zone:MAPZ}); m.dg = true; m.aggro = false; m.hp = m.maxhp = 1e7; });
    // the blast lands 1.2 s of game time later (a slow test machine runs game time slower than the wall clock)
    await page.waitForFunction(() => S.hp < DER.maxhp, null, { timeout: 6000 }).catch(() => {});
    assert.ok(await page.evaluate(() => S.hp < DER.maxhp), 'standing in a danger zone hurts');
    // guardian phases
    const ph = await page.evaluate(() => { for (const m of mobs) if (m.dg){ m.hp = 0; m.dead = true; } DG.wave = 3; dgSpawnWave(); const g = mobs.find(m => m.dg && m.def.boss && !m.dead);
      const n0 = mobs.filter(m => m.dg && !m.dead).length; g.hp = g.maxhp * .5; dg3Phases(); const n1 = mobs.filter(m => m.dg && !m.dead).length; g.hp = g.maxhp * .2; dg3Phases();
      return {n0, n1, enr:g.enraged, phase:DG3.phase}; });
    assert.strictEqual(ph.n1, ph.n0 + 3, 'the guardian calls 3 guards'); assert.ok(ph.enr); assert.strictEqual(ph.phase, 2);
    // clear: the rank card, then leave
    await page.evaluate(() => { const g = mobs.find(m => m.dg && m.def.boss && !m.dead); g.hp = 0; g.dead = true; dgKilled(g); });
    await page.waitForSelector('#dgRank', { timeout: 3000 });
    assert.match(await page.textContent('#dgRank .rk'), /^[SABC]$/);
    await page.click('#dgRank [data-rk="leave"]');
    await page.waitForTimeout(300);
    assert.ok(await page.evaluate(() => !DG.active && !document.getElementById('dgLeave') && !Object.keys(P.buffs).some(k => k.startsWith('dgb_'))), 'left: button and blessings gone');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
