/* VAYRATHEN — tests/mvp.test.js — the MVP board: every region boss, who brought it down, when it returns, the hunter ranking */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, openPlayers, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';
const BOSS = 'whitemonkeyking';
const until = async (what, fn, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return; await new Promise(r => setTimeout(r, 200)); } assert.fail('timed out waiting for ' + what); };

test('MVP board offline: lists every region boss, shows a kill and the countdown', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(type => { S.lvl = 80; derive(); loadMap(1); openWin('mvp');
      const rows0 = document.querySelectorAll('#pane-mvp .mvprow').length, bosses = MAPS.filter(m => m.boss && MOB[m.boss]).length;
      const m = spawnMob(type, P.x + 60, P.y, {zone:MAPZ}); boss = m; m.hp = 0; killMob(m); WIN_RENDER.mvp();
      const row = document.querySelector(`#pane-mvp .mvprow[data-mvpid="${type}"]`);
      return { rows0, bosses, cls: row.className, text: row.textContent, kills: S.mvp.kills[type], menu: !!document.querySelector('#rail .mb[data-win="mvp"]') }; }, BOSS);
    assert.strictEqual(r.rows0, r.bosses, 'one row per region boss');
    assert.ok(r.menu, 'the board is in the menu');
    assert.match(r.cls, /st-down/); assert.match(r.text, /Tester/); assert.strictEqual(r.kills, 1);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('MVP board online: a kill shows on the other player\'s board and in the hunter ranking', { skip, timeout: 180000 }, async () => {
  const { players, broker, close } = await openPlayers(2, { db: true });
  try {
    const [A, B] = players.map(p => p.page);
    await enterWorld(A, 'Alpha', 'mvpA'); await enterWorld(B, 'Beta', 'mvpB');
    await A.evaluate(type => { S.lvl = 80; derive(); loadMap(1); const m = spawnMob(type, P.x + 60, P.y, {zone:MAPZ}); boss = m; m.hp = 0; killMob(m); }, BOSS);
    await until('the kill in the database', () => broker.db.has(`mvp/${BOSS}`) && broker.db.get(`mvp/${BOSS}`).at > 0 && broker.db.has('mvphunt/u0'));
    assert.deepStrictEqual(broker.db.get(`mvp/${BOSS}`).names, ['Alpha']); assert.strictEqual(broker.db.get(`mvp/${BOSS}`).n, 1);
    await until('Beta sees it', async () => B.evaluate(type => !!(MVP.recs[type] && MVP.recs[type].at && MVP.hunt.u0 && MVP.hunt.u0.n === 1), BOSS));
    const txt = await B.evaluate(() => { openWin('mvp'); MVP.tab = 'hunt'; WIN_RENDER.mvp(); return document.querySelector('#pane-mvp').textContent; });
    assert.match(txt, /Alpha/);
  } finally { await close(); }
});
